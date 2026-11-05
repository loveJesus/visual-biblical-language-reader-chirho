# For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life. — John 3:16 (KJV)
"""A checker owns no image request. Workflow: whole-bible-chirho.md."""

import base64
import hashlib
import json
import os
import re
import signal
import subprocess
import time
from pathlib import Path

from icon_generation_chirho import codex_executable_chirho

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


def generation_rollout_chirho(attempt_chirho, log_name_chirho="codex-chirho.jsonl"):
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
    return paths_chirho[0]


def image_call_chirho(payload_chirho):
    content_chirho = str(payload_chirho.get("arguments", "")) + str(
        payload_chirho.get("input", "")
    )
    return "image_gen" in payload_chirho.get("name", "") or (
        "tools.image_gen__imagegen(" in content_chirho
    )


def image_calls_chirho(attempt_chirho, log_name_chirho="codex-chirho.jsonl"):
    count_chirho = 0
    with generation_rollout_chirho(
        attempt_chirho, log_name_chirho
    ).open() as file_chirho:
        for line_chirho in file_chirho:
            row_chirho = json.loads(line_chirho)
            payload_chirho = row_chirho.get("payload", {})
            if row_chirho.get("type") != "response_item" or payload_chirho.get(
                "type"
            ) not in ("function_call", "custom_tool_call"):
                continue
            if image_call_chirho(payload_chirho):
                count_chirho += 1
    return count_chirho


def returned_original_chirho(attempt_chirho, original_chirho, expected_sha_chirho):
    """Bind an external Codex original to the original call's returned path and image."""
    original_chirho = original_chirho.resolve(strict=True)
    trusted_chirho = (Path.home() / ".codex/generated_images").resolve()
    if not original_chirho.is_relative_to(trusted_chirho):
        raise ValueError("Original lies outside the trusted generator directory")
    relative_chirho = original_chirho.relative_to(trusted_chirho)
    if len(relative_chirho.parts) != 2 or not re.fullmatch(
        r"[a-f0-9-]{36}/exec-[a-f0-9-]{36}\.png", relative_chirho.as_posix()
    ):
        raise ValueError("Original generator path shape differs")
    if original_chirho.stat().st_size > 25 * 1024**2 or (
        hashlib.sha256(original_chirho.read_bytes()).hexdigest() != expected_sha_chirho
    ):
        raise ValueError("Original bytes differ from saved generation evidence")
    rollout_chirho = generation_rollout_chirho(attempt_chirho)
    calls_chirho, returned_chirho, images_chirho = set(), [], []
    with rollout_chirho.open() as file_chirho:
        for line_chirho in file_chirho:
            if len(line_chirho) > 40 * 1024**2:
                raise ValueError("Original tool evidence is oversized")
            row_chirho = json.loads(line_chirho)
            payload_chirho = row_chirho.get("payload", {})
            if row_chirho.get("type") != "response_item":
                continue
            if payload_chirho.get("type") in ("function_call", "custom_tool_call"):
                if image_call_chirho(payload_chirho):
                    calls_chirho.add(payload_chirho.get("call_id"))
                continue
            if (
                payload_chirho.get("type")
                not in ("function_call_output", "custom_tool_call_output")
                or payload_chirho.get("call_id") not in calls_chirho
            ):
                continue
            output_chirho = payload_chirho.get("output")
            if not isinstance(output_chirho, list):
                continue
            for item_chirho in output_chirho:
                if item_chirho.get("type") == "input_text":
                    try:
                        detail_chirho = json.loads(item_chirho.get("text", ""))
                    except (ValueError, TypeError):
                        continue
                    if not isinstance(detail_chirho, dict):
                        continue
                    hint_chirho = detail_chirho.get(
                        "output_hint_chirho", detail_chirho.get("output_hint")
                    )
                    if isinstance(hint_chirho, str) and (
                        f" as {original_chirho} by default." in hint_chirho
                    ):
                        returned_chirho.append(payload_chirho["call_id"])
                if item_chirho.get("type") == "input_image":
                    url_chirho = item_chirho.get("image_url", "")
                    if not isinstance(url_chirho, str) or not url_chirho.startswith(
                        "data:image/png;base64,"
                    ):
                        raise ValueError("Original tool image format differs")
                    images_chirho.append(
                        hashlib.sha256(
                            base64.b64decode(
                                url_chirho.partition(",")[2], validate=True
                            )
                        ).hexdigest()
                    )
    if images_chirho and images_chirho != [expected_sha_chirho]:
        raise ValueError("Original differs from the returned PNG bytes")
    if (
        len(calls_chirho) != 1
        or None in calls_chirho
        or len(returned_chirho) > 1
        or not (images_chirho or returned_chirho)
    ):
        raise ValueError("Exact original-call returned evidence is unavailable")
    return {
        "binding_chirho": "returned_png" if images_chirho else "returned_path",
        "call_id_chirho": next(iter(calls_chirho)),
        "rollout_sha256_chirho": hashlib.sha256(
            rollout_chirho.read_bytes()
        ).hexdigest(),
        "original_sha256_chirho": expected_sha_chirho,
    }


class CheckJobChirho:
    def __init__(
        self_chirho, root_chirho, attempt_chirho, prompt_chirho, number_chirho
    ):
        executable_chirho = codex_executable_chirho()
        self_chirho.started_chirho = time.monotonic()
        self_chirho.path_chirho = attempt_chirho
        self_chirho.log_chirho = (
            attempt_chirho / f"checker-{number_chirho:02d}-chirho.jsonl"
        ).open("x")
        self_chirho.child_chirho = subprocess.Popen(
            [
                executable_chirho,
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
