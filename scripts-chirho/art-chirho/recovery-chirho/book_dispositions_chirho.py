# For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life. — John 3:16 (KJV)
"""Prove a reconciled eligible picture pass while retaining exact, evidenced missing lemmas."""

import hashlib
import json
import re


def read_chirho(path_chirho):
    if not path_chirho.is_file() or path_chirho.stat().st_size > 1_000_000:
        raise ValueError("Missing or oversized book disposition evidence")
    return json.loads(path_chirho.read_text(encoding="utf-8"))


def digest_chirho(path_chirho):
    return hashlib.sha256(path_chirho.read_bytes()).hexdigest()


def path_chirho(root_chirho, book_chirho):
    if book_chirho not in ("John", "Gen"):
        raise ValueError("Unsupported disposition book")
    name_chirho = "john" if book_chirho == "John" else "genesis"
    return (
        root_chirho / f"data-chirho/reader-chirho/{name_chirho}-first-picture-deferrals-chirho.json"
    )


def check_chirho(
    root_chirho,
    book_chirho,
    candidates_chirho,
    rows_chirho,
    snapshot_chirho,
    inventory_sha_chirho,
    visual_chirho,
    recovery_chirho,
):
    # Workflow: art-recovery-chirho.md. A terminal deferred pass is never full picture coverage.
    registry_chirho = path_chirho(root_chirho, book_chirho)
    if not registry_chirho.exists():
        return False
    document_chirho = read_chirho(registry_chirho)
    deferrals_chirho = document_chirho.get("deferrals_chirho")
    if (
        document_chirho.get("schema_version_chirho") != 1
        or document_chirho.get("book_id_chirho") != book_chirho
        or document_chirho.get("scope_chirho") != "initial_lemma_picture_only"
        or document_chirho.get("reviewed_by_chirho") != "gpt_chirho"
        or document_chirho.get("art_review_chirho") != "pending"
        or document_chirho.get("inventory_sha256_chirho") != inventory_sha_chirho
        or document_chirho.get("source_snapshot_chirho") != snapshot_chirho
        or not isinstance(deferrals_chirho, list)
        or not 1 <= len(deferrals_chirho) <= 256
    ):
        raise ValueError("Book dispositions are stale, unbounded or change review authority")
    candidates_by_key_chirho = {
        tuple(row_chirho["lexeme_key_chirho"]): row_chirho for row_chirho in candidates_chirho
    }
    pictured_chirho = {
        tuple(row_chirho["lexeme_key_chirho"])
        for row_chirho in rows_chirho
        if not row_chirho["alternate_chirho"]
    }
    missing_chirho = set(candidates_by_key_chirho) - pictured_chirho
    folder_chirho = (
        root_chirho
        / "workspace-chirho/art-chirho/queue-chirho"
        / ("john-icons-chirho" if book_chirho == "John" else "genesis-icons-chirho")
    )
    held_chirho = recovery_chirho.blocked_chirho(folder_chirho, "lexeme")
    seen_chirho = set()
    for row_chirho in deferrals_chirho:
        key_chirho = tuple(row_chirho.get("lexeme_key_chirho", []))
        candidate_chirho = candidates_by_key_chirho.get(key_chirho)
        if (
            key_chirho not in missing_chirho
            or key_chirho in seen_chirho
            or not candidate_chirho
            or row_chirho.get("occurrence_chirho") not in candidate_chirho["occurrences_chirho"]
            or recovery_chirho.key_chirho(list(key_chirho)) not in held_chirho
            or not isinstance(row_chirho.get("reason_chirho"), str)
            or not row_chirho["reason_chirho"].strip()
        ):
            raise ValueError(
                "Deferred lemma is duplicated, unprotected or disagrees with its source"
            )
        seen_chirho.add(key_chirho)
        name_chirho = row_chirho.get("attempt_chirho")
        if not isinstance(name_chirho, str) or not re.fullmatch(
            r"attempt-[0-9a-f]{32}-chirho", name_chirho
        ):
            raise ValueError("Deferred attempt identity is invalid")
        attempt_chirho = folder_chirho / name_chirho
        plan_chirho = read_chirho(attempt_chirho / "plan-chirho.json")
        cell_chirho = row_chirho.get("cell_chirho")
        if (
            type(cell_chirho) is not int
            or not 0 <= cell_chirho < 16
            or plan_chirho.get("book_id_chirho") != book_chirho
            or plan_chirho.get("source_snapshot_chirho") != snapshot_chirho
            or plan_chirho.get("inventory_sha256_chirho") != inventory_sha_chirho
            or plan_chirho["cells_chirho"][cell_chirho]["lexeme_key_chirho"] != list(key_chirho)
            or plan_chirho["cells_chirho"][cell_chirho]["occurrence_chirho"]
            != row_chirho["occurrence_chirho"]
            or digest_chirho(attempt_chirho / "plan-chirho.json")
            != row_chirho.get("plan_sha256_chirho")
        ):
            raise ValueError("Deferred occurrence does not match the original request")
        if row_chirho.get("status_chirho") == "deferred_art":
            review_chirho = visual_chirho.review_chirho(attempt_chirho, allow_partial_chirho=True)
            excluded_chirho = review_chirho.get("owner_partial_review_chirho", {}).get(
                "excluded_cells_chirho", []
            )
            if cell_chirho not in {item_chirho["cell_chirho"] for item_chirho in excluded_chirho}:
                raise ValueError("Art disposition lacks the exact owner exclusion")
            evidence_chirho = attempt_chirho / "visual-rejected-chirho.json"
        elif row_chirho.get("status_chirho") == "deferred_source":
            evidence_chirho = attempt_chirho / "source-review-resolution-chirho.json"
            source_chirho = read_chirho(evidence_chirho)
            if (
                source_chirho.get("reviewed_by_chirho") != "gpt_chirho"
                or source_chirho.get("decision_chirho")
                != "retain_exact_source_disagreement_unillustrated"
                or source_chirho.get("selection_chirho") != plan_chirho["cells_chirho"][cell_chirho]
            ):
                raise ValueError("Source disposition lacks its exact owner decision")
        else:
            raise ValueError("Unknown first-picture disposition")
        if digest_chirho(evidence_chirho) != row_chirho.get("evidence_sha256_chirho"):
            raise ValueError("Deferred evidence changed")
    if seen_chirho != missing_chirho:
        raise ValueError("Book has uncovered lemmas without an owner disposition")
    return True
