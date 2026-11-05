# For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life. — John 3:16 (KJV)
"""Plan by default. One supervisor, independent generator/checker processes, one installer."""

from __future__ import annotations

import argparse
import fcntl
import json
import os
import signal
import subprocess
import sys
import time
from contextlib import ExitStack
from pathlib import Path

sys.path[:0] = [
    str(Path(__file__).resolve().parent),
    str(Path(__file__).resolve().parents[1]),
]
import icon_worker_chirho as worker_chirho
from queue_chirho import MAX_SHEETS_CHIRHO, QueueChirho
from runtime_chirho import checking_chirho, generation_chirho, recover_chirho
from seed_chirho import seed_rows_chirho

STOP_CHIRHO = False


def stop_chirho(_signal_chirho, _frame_chirho):
    global STOP_CHIRHO
    STOP_CHIRHO = True


def main_chirho():
    parser_chirho = argparse.ArgumentParser(description=__doc__)
    parser_chirho.add_argument(
        "--mode-chirho", choices=("plan", "seed", "run", "status"), default="plan"
    )
    parser_chirho.add_argument("--apply-chirho", action="store_true")
    parser_chirho.add_argument("--sheets-chirho", type=int, default=MAX_SHEETS_CHIRHO)
    parser_chirho.add_argument("--stage-chirho", choices=("generate", "check"))
    parser_chirho.add_argument(
        "--lease-fd-chirho", type=int, action="append", default=[]
    )
    args_chirho = parser_chirho.parse_args()
    home_chirho = worker_chirho.QUEUE_CHIRHO / "pipeline-chirho"
    database_path_chirho = home_chirho / "queue-chirho.sqlite"
    if args_chirho.mode_chirho == "plan":
        rows_chirho, evidence_chirho = seed_rows_chirho(worker_chirho)
        print(
            json.dumps(
                {
                    "evidence_chirho": evidence_chirho,
                    "queued_chirho": sum(
                        row_chirho["state_chirho"] == "queued"
                        for row_chirho in rows_chirho
                    ),
                    "held_chirho": sum(
                        row_chirho["state_chirho"] == "held"
                        for row_chirho in rows_chirho
                    ),
                },
                ensure_ascii=False,
            )
        )
        return 0
    if args_chirho.mode_chirho == "status":
        if not database_path_chirho.exists():
            raise ValueError("Pipeline has not been seeded")
        print(json.dumps(QueueChirho(database_path_chirho).status_chirho()))
        return 0
    if (
        not args_chirho.apply_chirho
        or not 1 <= args_chirho.sheets_chirho <= MAX_SHEETS_CHIRHO
    ):
        raise ValueError(
            "Mutation requires --apply-chirho within the fixed sheet bound"
        )
    signal.signal(signal.SIGTERM, stop_chirho)
    signal.signal(signal.SIGINT, stop_chirho)
    if args_chirho.stage_chirho:
        if len(args_chirho.lease_fd_chirho) != 2:
            raise ValueError("Stages require the inherited sole-owner leases")
        for descriptor_chirho, name_chirho in zip(
            args_chirho.lease_fd_chirho,
            ("worker-chirho.lock", "installer-chirho.lock"),
            strict=True,
        ):
            owned_chirho = os.fstat(descriptor_chirho)
            actual_chirho = (worker_chirho.QUEUE_CHIRHO / name_chirho).stat()
            if (owned_chirho.st_dev, owned_chirho.st_ino) != (
                actual_chirho.st_dev,
                actual_chirho.st_ino,
            ):
                raise ValueError("Inherited lock scope differs")
        with (home_chirho / (args_chirho.stage_chirho + "-chirho.lock")).open(
            "a"
        ) as role_lock_chirho:
            fcntl.flock(role_lock_chirho, fcntl.LOCK_EX | fcntl.LOCK_NB)
            queue_chirho = QueueChirho(database_path_chirho)
            if args_chirho.stage_chirho == "generate":
                generation_chirho(
                    worker_chirho,
                    queue_chirho,
                    lambda: STOP_CHIRHO,
                    args_chirho.sheets_chirho,
                )
            else:
                checking_chirho(worker_chirho, queue_chirho, lambda: STOP_CHIRHO)
        return 0
    with ExitStack() as stack_chirho:
        descriptors_chirho = []
        for name_chirho in ("worker-chirho.lock", "installer-chirho.lock"):
            lock_chirho = stack_chirho.enter_context(
                (worker_chirho.QUEUE_CHIRHO / name_chirho).open("a")
            )
            fcntl.flock(lock_chirho, fcntl.LOCK_EX | fcntl.LOCK_NB)
            descriptors_chirho.append(lock_chirho.fileno())
        if args_chirho.mode_chirho == "seed":
            rows_chirho, evidence_chirho = seed_rows_chirho(worker_chirho)
            queue_chirho = QueueChirho(database_path_chirho)
            queue_chirho.seed_chirho(rows_chirho, evidence_chirho)
            worker_chirho.atomic_chirho(
                home_chirho / "seed-evidence-chirho.json", evidence_chirho
            )
            print(json.dumps(queue_chirho.status_chirho()))
            return 0
        if not database_path_chirho.exists():
            raise ValueError("Seed the source-bound queue before generation")
        queue_chirho = QueueChirho(database_path_chirho)
        if queue_chirho.meta_chirho("stop_chirho"):
            raise ValueError(
                "Pipeline recovery hold remains: "
                + str(queue_chirho.meta_chirho("stop_chirho"))
            )
        recover_chirho(worker_chirho, queue_chirho)
        queue_chirho.meta_chirho("producer_done_chirho", False)
        children_chirho = []
        try:
            for role_chirho in ("generate", "check"):
                log_chirho = stack_chirho.enter_context(
                    (home_chirho / (role_chirho + "-chirho.log")).open("ab")
                )
                command_chirho = [
                    sys.executable,
                    "-B",
                    str(Path(__file__).resolve()),
                    "--mode-chirho",
                    "run",
                    "--apply-chirho",
                    "--stage-chirho",
                    role_chirho,
                    "--sheets-chirho",
                    str(args_chirho.sheets_chirho),
                ]
                for descriptor_chirho in descriptors_chirho:
                    command_chirho.extend(["--lease-fd-chirho", str(descriptor_chirho)])
                children_chirho.append(
                    subprocess.Popen(
                        command_chirho,
                        cwd=worker_chirho.ROOT_CHIRHO,
                        stdout=log_chirho,
                        stderr=subprocess.STDOUT,
                        pass_fds=tuple(descriptors_chirho),
                    )
                )
            while any(child_chirho.poll() is None for child_chirho in children_chirho):
                if STOP_CHIRHO:
                    for child_chirho in children_chirho:
                        if child_chirho.poll() is None:
                            child_chirho.send_signal(signal.SIGTERM)
                if any(
                    child_chirho.poll() not in (None, 0)
                    for child_chirho in children_chirho
                ):
                    queue_chirho.meta_chirho(
                        "stop_chirho",
                        queue_chirho.meta_chirho("stop_chirho")
                        or "A pipeline process failed; saved work retained",
                    )
                worker_chirho.atomic_chirho(
                    home_chirho / "progress-chirho.json", queue_chirho.status_chirho()
                )
                time.sleep(2)
        finally:
            for child_chirho in children_chirho:
                if child_chirho.poll() is None:
                    child_chirho.send_signal(signal.SIGTERM)
                    child_chirho.wait()
        worker_chirho.atomic_chirho(
            home_chirho / "progress-chirho.json", queue_chirho.status_chirho()
        )
        print(json.dumps(queue_chirho.status_chirho()))
        return 2 if queue_chirho.meta_chirho("stop_chirho") else 0


if __name__ == "__main__":
    raise SystemExit(main_chirho())
