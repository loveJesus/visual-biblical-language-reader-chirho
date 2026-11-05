# For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life. — John 3:16 (KJV)
"""Independent bounded generator processes for the sole whole-canon coordinator.

Workflow: whole-bible-chirho.md. This module never installs media or shares a child handle.
"""

from __future__ import annotations

import json
import os
import re
import signal
import subprocess
import time
from pathlib import Path


def codex_executable_chirho():
    """Use the managed CLI in both login shells and background tmux processes."""
    path_chirho = (Path.home() / ".local/bin/codex").resolve(strict=True)
    if not path_chirho.is_file() or not os.access(path_chirho, os.X_OK):
        raise OSError("The managed Codex executable is unavailable")
    return str(path_chirho)


class GeneratorJobChirho:
    """Own one request and child; ordinary shutdown drains instead of killing it."""

    def __init__(
        self_chirho,
        root_chirho,
        attempt_chirho,
        prompt_chirho,
        recovery_chirho,
        model_chirho="gpt-6.1-terra",
    ):
        executable_chirho = codex_executable_chirho()
        self_chirho.attempt_chirho = attempt_chirho
        self_chirho.recovery_chirho = recovery_chirho
        self_chirho.error_chirho = None
        self_chirho.done_chirho = False
        self_chirho.started_chirho = time.monotonic()
        self_chirho.log_chirho = (attempt_chirho / "codex-chirho.jsonl").open(
            "x", encoding="utf-8"
        )
        try:
            recovery_chirho.request_chirho(attempt_chirho)
        except (OSError, ValueError):
            self_chirho.log_chirho.close()
            raise
        try:
            self_chirho.child_chirho = subprocess.Popen(
                [
                    executable_chirho,
                    "exec",
                    "-m",
                    model_chirho,
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
        except OSError:
            self_chirho.log_chirho.close()
            recovery_chirho.request_chirho(attempt_chirho, finished_chirho=True)
            raise
        try:
            recovery_chirho.request_chirho(attempt_chirho, self_chirho.child_chirho.pid)
        except (OSError, ValueError):
            # The coordinator already journaled this plan. Keep ownership even if the
            # pid update cannot be written, and drain before a constructor can fail.
            try:
                self_chirho.child_chirho.wait(timeout=1200)
            except subprocess.TimeoutExpired:
                os.killpg(self_chirho.child_chirho.pid, signal.SIGKILL)
                self_chirho.child_chirho.wait()
            finally:
                self_chirho.log_chirho.close()
            raise

    def poll_chirho(self_chirho):
        if self_chirho.done_chirho:
            return True
        code_chirho = self_chirho.child_chirho.poll()
        if code_chirho is None:
            if time.monotonic() - self_chirho.started_chirho < 1200:
                return False
            # Preserve the existing timeout and unknown-result hold; never resubmit this plan.
            os.killpg(self_chirho.child_chirho.pid, signal.SIGKILL)
            self_chirho.child_chirho.wait()
            self_chirho.error_chirho = RuntimeError(
                "Generator timed out; reconcile its original result"
            )
        elif code_chirho:
            self_chirho.error_chirho = RuntimeError(
                "Generator failed; reconcile its original result"
            )
        self_chirho.done_chirho = True
        self_chirho.log_chirho.close()
        self_chirho.recovery_chirho.request_chirho(
            self_chirho.attempt_chirho, self_chirho.child_chirho.pid, True
        )
        return True

    def wait_chirho(self_chirho):
        while not self_chirho.poll_chirho():
            time.sleep(0.25)


def validate_generation_chirho(attempt_chirho, proposal_chirho):
    """Validate the original call's evidence, without another image request."""
    if proposal_chirho(attempt_chirho):
        return
    events_chirho = []
    for line_chirho in (attempt_chirho / "codex-chirho.jsonl").read_text().splitlines():
        if line_chirho.startswith("{"):
            events_chirho.append(json.loads(line_chirho))
    thread_chirho = next(
        (
            row_chirho.get("thread_id")
            for row_chirho in events_chirho
            if row_chirho.get("type") == "thread.started"
        ),
        None,
    )
    if not thread_chirho or not re.fullmatch(r"[0-9a-f-]{36}", thread_chirho):
        raise ValueError("Missing generator thread id")
    rollouts_chirho = list(
        (Path.home() / ".codex/sessions").glob(f"*/*/*/rollout-*-{thread_chirho}.jsonl")
    )
    if len(rollouts_chirho) != 1:
        raise ValueError("Original built-in image call could not be verified")
    with rollouts_chirho[0].open(encoding="utf-8") as rollout_chirho:
        if not any(
            "tools.image_gen__imagegen(" in line_chirho
            for line_chirho in rollout_chirho
        ):
            raise ValueError("Original built-in image call could not be verified")
