# For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life. — John 3:16 (KJV)
"""Bounded per-item holds: retain evidence and continue disjoint work, never repeat a held request."""

import json
import os
import re
import tempfile
from datetime import UTC, datetime
from pathlib import Path

MAX_BYTES_CHIRHO = 2 * 1024 * 1024
MAX_HOLDS_CHIRHO = 2048


def key_chirho(value_chirho):
    return json.dumps(value_chirho, ensure_ascii=False, sort_keys=True, separators=(",", ":"))


def write_chirho(path_chirho, value_chirho):
    path_chirho.parent.mkdir(parents=True, exist_ok=True)
    data_chirho = (json.dumps(value_chirho, ensure_ascii=False, indent=2) + "\n").encode()
    if len(data_chirho) > MAX_BYTES_CHIRHO:
        raise ValueError("Recovery record exceeds its bounded size")
    with tempfile.NamedTemporaryFile(dir=path_chirho.parent, delete=False) as file_chirho:
        temporary_chirho = Path(file_chirho.name)
        file_chirho.write(data_chirho)
        file_chirho.flush()
        os.fsync(file_chirho.fileno())
    try:
        os.replace(temporary_chirho, path_chirho)
        descriptor_chirho = os.open(path_chirho.parent, os.O_RDONLY)
        try:
            os.fsync(descriptor_chirho)
        finally:
            os.close(descriptor_chirho)
    finally:
        temporary_chirho.unlink(missing_ok=True)


def read_chirho(folder_chirho):
    path_chirho = folder_chirho / "held-jobs-chirho.json"
    if not path_chirho.exists():
        return {"schema_version_chirho": 1, "holds_chirho": []}
    data_chirho = path_chirho.read_bytes()
    if len(data_chirho) > MAX_BYTES_CHIRHO:
        raise ValueError("Held-job index is oversized")
    document_chirho = json.loads(data_chirho)
    rows_chirho = document_chirho.get("holds_chirho")
    if (
        document_chirho.get("schema_version_chirho") != 1
        or not isinstance(rows_chirho, list)
        or len(rows_chirho) > MAX_HOLDS_CHIRHO
    ):
        raise ValueError("Invalid bounded held-job index")
    identities_chirho = set()
    for row_chirho in rows_chirho:
        identity_chirho = row_chirho.get("attempt_chirho")
        if (
            not isinstance(identity_chirho, str)
            or not re.fullmatch(r"attempt-[a-z0-9-]{8,128}", identity_chirho)
            or identity_chirho in identities_chirho
            or row_chirho.get("scope_chirho") not in ("context", "lexeme", "verse")
            or not isinstance(row_chirho.get("items_chirho"), list)
            or not 1 <= len(row_chirho["items_chirho"]) <= 4096
        ):
            raise ValueError("Malformed or repeated held request")
        identities_chirho.add(identity_chirho)
    return document_chirho


def blocked_chirho(folder_chirho, scope_chirho):
    return {
        key_chirho(item_chirho)
        for row_chirho in read_chirho(folder_chirho)["holds_chirho"]
        if row_chirho["scope_chirho"] == scope_chirho
        for item_chirho in row_chirho["items_chirho"]
    }


def hold_chirho(
    folder_chirho, attempt_chirho, scope_chirho, items_chirho, reason_chirho, checkpoint_chirho=None
):
    # Workflow: art-recovery-chirho.md. A hold excludes this item without approving or retrying it.
    if (
        attempt_chirho.resolve().parent != folder_chirho.resolve()
        or scope_chirho not in ("context", "lexeme", "verse")
        or not re.fullmatch(r"attempt-[a-z0-9-]{8,128}", attempt_chirho.name)
    ):
        raise ValueError("Recovery attempt escapes its producer queue")
    unique_chirho = {key_chirho(item_chirho): item_chirho for item_chirho in items_chirho}
    if not unique_chirho or len(unique_chirho) > 4096:
        raise ValueError("A held request needs a bounded, explicit identity set")
    document_chirho = read_chirho(folder_chirho)
    record_chirho = {
        "attempt_chirho": attempt_chirho.name,
        "scope_chirho": scope_chirho,
        "items_chirho": list(unique_chirho.values()),
        "reason_chirho": " ".join(str(reason_chirho).split())[:600],
        "at_chirho": datetime.now(UTC).isoformat(),
        "checkpoint_chirho": checkpoint_chirho or {},
    }
    earlier_chirho = next(
        (
            row_chirho
            for row_chirho in document_chirho["holds_chirho"]
            if row_chirho["attempt_chirho"] == attempt_chirho.name
        ),
        None,
    )
    if earlier_chirho:
        if earlier_chirho["scope_chirho"] != scope_chirho or {
            key_chirho(item_chirho) for item_chirho in earlier_chirho["items_chirho"]
        } != set(unique_chirho):
            raise ValueError("A recorded hold cannot change its protected identities")
        return earlier_chirho
    if len(document_chirho["holds_chirho"]) >= MAX_HOLDS_CHIRHO:
        raise ValueError("Held-job index reached its bounded limit")
    # Keep the original failure alongside its immutable attempt before publishing the index.
    write_chirho(attempt_chirho / "failure-chirho.json", record_chirho)
    document_chirho["holds_chirho"].append(record_chirho)
    write_chirho(folder_chirho / "held-jobs-chirho.json", document_chirho)
    print(
        f"Logged {scope_chirho} failure in {attempt_chirho.name}; continuing other eligible work.",
        flush=True,
    )
    return record_chirho


def resolve_chirho(folder_chirho, attempt_chirho):
    document_chirho = read_chirho(folder_chirho)
    retained_chirho = [
        row_chirho
        for row_chirho in document_chirho["holds_chirho"]
        if row_chirho["attempt_chirho"] != attempt_chirho.name
    ]
    if len(retained_chirho) != len(document_chirho["holds_chirho"]):
        document_chirho["holds_chirho"] = retained_chirho
        write_chirho(folder_chirho / "held-jobs-chirho.json", document_chirho)


def count_chirho(folder_chirho):
    return len(read_chirho(folder_chirho)["holds_chirho"])


def request_chirho(attempt_chirho, pid_chirho=None, finished_chirho=False):
    write_chirho(
        attempt_chirho / "generator-request-chirho.json",
        {
            "state_chirho": "finished"
            if finished_chirho
            else "running"
            if pid_chirho
            else "dispatching",
            "pid_chirho": pid_chirho,
            "at_chirho": datetime.now(UTC).isoformat(),
        },
    )


def active_chirho(attempt_chirho):
    path_chirho = attempt_chirho / "generator-request-chirho.json"
    if not path_chirho.exists():
        return False
    record_chirho = json.loads(path_chirho.read_text())
    if record_chirho.get("state_chirho") == "finished":
        return False
    pid_chirho = record_chirho.get("pid_chirho")
    if type(pid_chirho) is not int or pid_chirho <= 0:
        return True  # Dispatch may have occurred before its pid was persisted; owner reconciles it.
    try:
        os.kill(pid_chirho, 0)
    except ProcessLookupError:
        return False
    except PermissionError:
        return True
    return True
