# For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life. — John 3:16 (KJV)
"""A checker owns no image request. Workflow: whole-bible-chirho.md."""

import hashlib
import json
import os
import re
import signal
import subprocess
import time
from pathlib import Path

# The new pipeline uses L.J.'s configured global default (no project override exists).
# This is an explicit launcher choice, never an automatic model/provider fallback.
MODEL_CHIRHO = "gpt-6.1-sol"


def confirmed_model_refusal_chirho(attempt_chirho):
    path_chirho = attempt_chirho / "codex-chirho.jsonl"
    events_chirho = [
        json.loads(line_chirho)
        for line_chirho in path_chirho.read_text().splitlines()
        if line_chirho.startswith("{")
    ]
    failed_chirho = next(
        (
            row_chirho
            for row_chirho in reversed(events_chirho)
            if row_chirho.get("type") == "turn.failed"
        ),
        None,
    )
    if not failed_chirho:
        raise ValueError("No definitive preflight refusal")
    response_chirho = json.loads(failed_chirho["error"]["message"])
    if (
        response_chirho.get("status") != 400
        or response_chirho.get("error", {}).get("code") != "model_not_found"
        or image_calls_chirho(attempt_chirho) != 0
    ):
        raise ValueError("Refusal does not prove no image request")
    if any(
        (attempt_chirho / name_chirho).exists()
        for name_chirho in (
            "generation-chirho.json",
            "keyed-sheet-chirho.webp",
            "generator-original-chirho.png",
        )
    ):
        raise ValueError("Returned image artifacts require owner reconciliation")
    return {
        "confirmed_no_image_chirho": True,
        "code_chirho": "model_not_found",
        "log_sha256_chirho": hashlib.sha256(path_chirho.read_bytes()).hexdigest(),
        "image_calls_chirho": 0,
    }


def image_calls_chirho(attempt_chirho, log_name_chirho="codex-chirho.jsonl"):
    events_chirho = [
        json.loads(line_chirho)
        for line_chirho in (attempt_chirho / log_name_chirho).read_text().splitlines()
        if line_chirho.startswith("{")
    ]
    thread_chirho = next(
        (
            row_chirho.get("thread_id")
            for row_chirho in events_chirho
            if row_chirho.get("type") == "thread.started"
        ),
        None,
    )
    if not isinstance(thread_chirho, str) or not re.fullmatch(
        r"[a-f0-9-]{36}", thread_chirho
    ):
        raise ValueError("Missing original generator thread")
    paths_chirho = list(
        (Path.home() / ".codex/sessions").glob(f"*/*/*/rollout-*-{thread_chirho}.jsonl")
    )
    if len(paths_chirho) != 1:
        raise ValueError("Original image-call evidence unavailable")
    count_chirho = 0
    with paths_chirho[0].open() as file_chirho:
        for line_chirho in file_chirho:
            row_chirho = json.loads(line_chirho)
            payload_chirho = row_chirho.get("payload", {})
            if row_chirho.get("type") != "response_item" or payload_chirho.get(
                "type"
            ) not in ("function_call", "custom_tool_call"):
                continue
            name_chirho = payload_chirho.get("name", "")
            content_chirho = str(payload_chirho.get("arguments", "")) + str(
                payload_chirho.get("input", "")
            )
            if (
                "image_gen" in name_chirho
                or "tools.image_gen__imagegen(" in content_chirho
            ):
                count_chirho += 1
    return count_chirho


class CheckJobChirho:
    def __init__(
        self_chirho, root_chirho, attempt_chirho, prompt_chirho, number_chirho
    ):
        self_chirho.started_chirho = time.monotonic()
        self_chirho.path_chirho = attempt_chirho
        self_chirho.log_chirho = (
            attempt_chirho / f"checker-{number_chirho:02d}-chirho.jsonl"
        ).open("x")
        self_chirho.child_chirho = subprocess.Popen(
            [
                "codex",
                "exec",
                "-m",
                MODEL_CHIRHO,
                "-c",
                "daybreak=false",
                "-s",
                "workspace-write",
                "--json",
                prompt_chirho,
            ],
            cwd=root_chirho,
            stdin=subprocess.DEVNULL,
            stdout=self_chirho.log_chirho,
            stderr=subprocess.STDOUT,
            start_new_session=True,
        )

    def wait_chirho(self_chirho):
        try:
            return self_chirho.child_chirho.wait(timeout=1200)
        except subprocess.TimeoutExpired:
            os.killpg(self_chirho.child_chirho.pid, signal.SIGKILL)
            self_chirho.child_chirho.wait()
            raise RuntimeError("Checker timed out; saved image remains available")
        finally:
            self_chirho.log_chirho.close()
