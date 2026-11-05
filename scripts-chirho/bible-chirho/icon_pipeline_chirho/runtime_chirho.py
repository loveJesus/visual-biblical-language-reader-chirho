# For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life. — John 3:16 (KJV)
"""Independent generation and sole checker/installer. Workflow: whole-bible-chirho.md."""

from __future__ import annotations

import json
import shutil
import subprocess
import time
from pathlib import Path

from process_chirho import (
    MODEL_CHIRHO,
    CheckJobChirho,
    image_calls_chirho,
    returned_original_chirho,
)
from prompts_chirho import checking_prompt_chirho, generation_prompt_chirho


def attempt_path_chirho(worker_chirho, id_chirho):
    if (
        not id_chirho.startswith("attempt-pipeline-")
        or not id_chirho.endswith("-chirho")
        or "/" in id_chirho
        or ".." in id_chirho
    ):
        raise ValueError("Invalid pipeline attempt id")
    return (
        worker_chirho.QUEUE_CHIRHO
        / "attempts-chirho/pipeline-chirho"
        / (id_chirho[17:19] + "-chirho")
        / id_chirho
    )


def keys_chirho(queue_chirho, id_chirho):
    row_chirho = queue_chirho.db_chirho.execute(
        "SELECT keys_chirho FROM jobs_chirho WHERE id_chirho=?", (id_chirho,)
    ).fetchone()
    return set(json.loads(row_chirho[0]))


def source_disposition_chirho(worker_chirho, queue_chirho, id_chirho, attempt_chirho):
    if image_calls_chirho(attempt_chirho) != 0:
        raise ValueError("Source stop has image-call evidence; keep outcome unknown")
    concerns_chirho = worker_chirho.read_chirho(
        attempt_chirho / "source-review-needed-chirho.json"
    )
    if not isinstance(concerns_chirho, list) or not concerns_chirho:
        raise ValueError("Source stop needs per-cell reasons")
    plan_chirho = worker_chirho.read_chirho(attempt_chirho / "plan-chirho.json")[
        "cells_chirho"
    ]
    affected_chirho = set()
    for concern_chirho in concerns_chirho:
        cell_chirho = concern_chirho.get("cell_chirho")
        if (
            type(cell_chirho) is not int
            or not 0 <= cell_chirho < 16
            or not concern_chirho.get("reason_chirho")
            or plan_chirho[cell_chirho].get("padding_chirho")
        ):
            raise ValueError("Invalid source concern")
        affected_chirho.add(worker_chirho.key_chirho(plan_chirho[cell_chirho]))
    all_chirho = keys_chirho(queue_chirho, id_chirho)
    queue_chirho.settle_chirho(
        id_chirho,
        set(),
        all_chirho - affected_chirho,
        affected_chirho,
        "Only target source concern held; unrelated lemmas requeued",
        request_made_chirho=False,
    )


def verify_generated_chirho(worker_chirho, attempt_chirho, queue_chirho, id_chirho):
    proof_chirho = queue_chirho.db_chirho.execute(
        "SELECT detail_chirho FROM events_chirho WHERE job_chirho=? AND action_chirho='planned'",
        (id_chirho,),
    ).fetchall()
    if len(proof_chirho) != 1 or json.loads(proof_chirho[0][0])[
        "plan_sha256_chirho"
    ] != worker_chirho.sha_chirho(attempt_chirho / "plan-chirho.json"):
        raise ValueError(
            "Generated source plan differs from the durable parent reservation"
        )
    worker_chirho.validate_generation_chirho(attempt_chirho, lambda _path_chirho: False)
    if image_calls_chirho(attempt_chirho) != 1:
        raise ValueError("Expected exactly one original image call")
    metadata_chirho = worker_chirho.read_chirho(
        attempt_chirho / "generation-chirho.json"
    )
    original_chirho = Path(metadata_chirho["original_generator_path_chirho"]).resolve()
    if (
        worker_chirho.sha_chirho(original_chirho)
        != metadata_chirho["original_generator_sha256_chirho"]
    ):
        raise ValueError("Original image differs from returned evidence")
    if not original_chirho.is_relative_to(attempt_chirho.resolve()):
        returned_original_chirho(
            attempt_chirho,
            original_chirho,
            metadata_chirho["original_generator_sha256_chirho"],
        )
    if (
        worker_chirho.sha_chirho(attempt_chirho / "keyed-sheet-chirho.webp")
        != metadata_chirho["sheet_sha256_chirho"]
    ):
        raise ValueError("Generated atlas hash differs")


def recover_chirho(worker_chirho, queue_chirho):
    rows_chirho = queue_chirho.db_chirho.execute(
        "SELECT * FROM jobs_chirho WHERE state_chirho IN ('generating','checking','installing')"
    ).fetchall()
    for row_chirho in rows_chirho:
        id_chirho = row_chirho["id_chirho"]
        attempt_chirho = attempt_path_chirho(worker_chirho, id_chirho)
        if row_chirho["state_chirho"] == "generating":
            if worker_chirho.LAUNCHER_CHIRHO.RECOVERY_CHIRHO.active_chirho(
                attempt_chirho
            ):
                raise ValueError(
                    "Prior generator is still active; do not start another owner"
                )
            try:
                if (attempt_chirho / "source-review-needed-chirho.json").exists():
                    source_disposition_chirho(
                        worker_chirho, queue_chirho, id_chirho, attempt_chirho
                    )
                else:
                    verify_generated_chirho(
                        worker_chirho, attempt_chirho, queue_chirho, id_chirho
                    )
                    queue_chirho.transition_chirho(
                        id_chirho, "generating", "generated", "Recovered saved original"
                    )
            except (OSError, ValueError, KeyError, StopIteration):
                queue_chirho.settle_chirho(
                    id_chirho,
                    set(),
                    set(),
                    keys_chirho(queue_chirho, id_chirho),
                    "Unknown original result retained; no regeneration",
                )
        else:
            # Recheck the SAME saved image or finish its archived installation. Never render again.
            queue_chirho.transition_chirho(
                id_chirho,
                row_chirho["state_chirho"],
                "generated",
                "Resume saved checker/installer work",
            )


def generation_chirho(worker_chirho, queue_chirho, stopped_chirho, sheet_limit_chirho):
    jobs_chirho = {}
    queue_chirho.meta_chirho("producer_done_chirho", False)
    try:
        while True:
            if shutil.disk_usage(worker_chirho.ROOT_CHIRHO).free < 15 * 1024**3:
                queue_chirho.meta_chirho("stop_chirho", "Storage floor reached")
            while (
                not stopped_chirho()
                and not queue_chirho.meta_chirho("stop_chirho")
                and len(jobs_chirho) < 2
            ):
                reservation_chirho = queue_chirho.generation_chirho(sheet_limit_chirho)
                if reservation_chirho is None:
                    break
                id_chirho, candidates_chirho = reservation_chirho
                attempt_chirho = attempt_path_chirho(worker_chirho, id_chirho)
                attempt_chirho.mkdir(parents=True, exist_ok=False)
                planned_chirho, bad_chirho = [], set()
                for row_chirho in candidates_chirho:
                    try:
                        planned_chirho.append(
                            {
                                **worker_chirho.source_chirho(row_chirho),
                                "cell_chirho": len(planned_chirho),
                            }
                        )
                    except (ValueError, KeyError, StopIteration):
                        bad_chirho.add(worker_chirho.key_chirho(row_chirho))
                if bad_chirho:
                    all_chirho = keys_chirho(queue_chirho, id_chirho)
                    queue_chirho.settle_chirho(
                        id_chirho,
                        set(),
                        all_chirho - bad_chirho,
                        bad_chirho,
                        "Per-lemma source binding failed before image call",
                        request_made_chirho=False,
                    )
                    continue
                planned_chirho += [
                    {"cell_chirho": cell_chirho, "padding_chirho": True}
                    for cell_chirho in range(len(planned_chirho), 16)
                ]
                worker_chirho.atomic_chirho(
                    attempt_chirho / "plan-chirho.json",
                    {
                        "schema_version_chirho": 1,
                        "grid_chirho": [4, 4],
                        "cells_chirho": planned_chirho,
                    },
                )
                queue_chirho.event_chirho(
                    id_chirho,
                    "planned",
                    {
                        "plan_sha256_chirho": worker_chirho.sha_chirho(
                            attempt_chirho / "plan-chirho.json"
                        )
                    },
                )
                worker_chirho.command_chirho(
                    [
                        "bun",
                        "scripts-chirho/publish-chirho/r2-chirho/with-artwork-chirho.ts",
                        worker_chirho.STYLE_CHIRHO,
                        "--",
                        "magick",
                        worker_chirho.STYLE_CHIRHO,
                        str(attempt_chirho / "style-reference-chirho.webp"),
                    ],
                    attempt_chirho / "style-log-chirho.txt",
                )
                jobs_chirho[id_chirho] = worker_chirho.GeneratorJobChirho(
                    worker_chirho.ROOT_CHIRHO,
                    attempt_chirho,
                    generation_prompt_chirho(worker_chirho.ROOT_CHIRHO, attempt_chirho),
                    worker_chirho.LAUNCHER_CHIRHO.RECOVERY_CHIRHO,
                    model_chirho=MODEL_CHIRHO,
                )
            for id_chirho, job_chirho in list(jobs_chirho.items()):
                if not job_chirho.poll_chirho():
                    continue
                attempt_chirho = job_chirho.attempt_chirho
                try:
                    if job_chirho.error_chirho:
                        raise job_chirho.error_chirho
                    if (attempt_chirho / "source-review-needed-chirho.json").exists():
                        source_disposition_chirho(
                            worker_chirho, queue_chirho, id_chirho, attempt_chirho
                        )
                    else:
                        verify_generated_chirho(
                            worker_chirho, attempt_chirho, queue_chirho, id_chirho
                        )
                        queue_chirho.transition_chirho(
                            id_chirho,
                            "generating",
                            "generated",
                            "Saved original ready for independent checker",
                        )
                    if not queue_chirho.meta_chirho("stop_chirho"):
                        queue_chirho.meta_chirho("generator_failures_chirho", 0)
                except (
                    OSError,
                    ValueError,
                    KeyError,
                    RuntimeError,
                    StopIteration,
                ) as error_chirho:
                    queue_chirho.settle_chirho(
                        id_chirho,
                        set(),
                        set(),
                        keys_chirho(queue_chirho, id_chirho),
                        str(error_chirho),
                    )
                    failures_chirho = (
                        queue_chirho.meta_chirho("generator_failures_chirho") or 0
                    ) + 1
                    queue_chirho.meta_chirho(
                        "generator_failures_chirho", failures_chirho
                    )
                    if (
                        failures_chirho >= 3
                        or (
                            attempt_chirho / "image-tool-unavailable-chirho.json"
                        ).exists()
                    ):
                        queue_chirho.meta_chirho(
                            "stop_chirho",
                            "Generator unavailable or existing three-failure cap",
                        )
                del jobs_chirho[id_chirho]
            worker_chirho.atomic_chirho(
                worker_chirho.QUEUE_CHIRHO
                / "pipeline-chirho/generation-progress-chirho.json",
                queue_chirho.status_chirho(),
            )
            status_chirho = queue_chirho.status_chirho()
            pending_chirho = sum(
                status_chirho["jobs_chirho"].get(state_chirho, 0)
                for state_chirho in ("generated", "checking", "installing")
            )
            if not jobs_chirho and (
                stopped_chirho()
                or status_chirho["stop_chirho"]
                or (
                    not status_chirho["lemmas_chirho"].get("queued")
                    and not pending_chirho
                )
                or sum(status_chirho["jobs_chirho"].values()) >= sheet_limit_chirho
            ):
                break
            time.sleep(1)
    finally:
        for job_chirho in jobs_chirho.values():
            job_chirho.wait_chirho()
        queue_chirho.meta_chirho("producer_done_chirho", True)


def installed_disposition_chirho(
    worker_chirho, queue_chirho, id_chirho, attempt_chirho
):
    installed_chirho = worker_chirho.read_chirho(
        attempt_chirho / "installed-chirho.json"
    )
    accepted_chirho = {
        worker_chirho.key_chirho(row_chirho)
        for row_chirho in installed_chirho["records_chirho"]
    }
    failed_chirho = {
        worker_chirho.key_chirho(row_chirho["source_chirho"])
        for row_chirho in installed_chirho["holds_chirho"]
    }
    queue_chirho.settle_chirho(
        id_chirho,
        accepted_chirho,
        failed_chirho,
        set(),
        "Verified archived installation; only failed cells return to tail",
    )


def checking_chirho(worker_chirho, queue_chirho, stopped_chirho):
    while not stopped_chirho():
        id_chirho = queue_chirho.checking_chirho()
        if not id_chirho:
            if queue_chirho.meta_chirho("producer_done_chirho"):
                return
            time.sleep(1)
            continue
        attempt_chirho = attempt_path_chirho(worker_chirho, id_chirho)
        try:
            if not (attempt_chirho / "visual-review-chirho.json").exists():
                number_chirho = (
                    queue_chirho.meta_chirho("check_count_" + id_chirho) or 0
                ) + 1
                if number_chirho > 2:
                    raise RuntimeError(
                        "Checker attempt cap; retain saved original for recovery"
                    )
                queue_chirho.meta_chirho("check_count_" + id_chirho, number_chirho)
                plan_hash_chirho = worker_chirho.sha_chirho(
                    attempt_chirho / "plan-chirho.json"
                )
                reviews_hash_chirho = worker_chirho.sha_chirho(
                    attempt_chirho / "reviews-chirho.json"
                )
                generation_hash_chirho = worker_chirho.sha_chirho(
                    attempt_chirho / "generation-chirho.json"
                )
                check_chirho = CheckJobChirho(
                    worker_chirho.ROOT_CHIRHO,
                    attempt_chirho,
                    checking_prompt_chirho(attempt_chirho),
                    number_chirho,
                )
                if check_chirho.wait_chirho() != 0:
                    raise RuntimeError(
                        "Checker process failed; retain the same saved image"
                    )
                if (
                    worker_chirho.sha_chirho(attempt_chirho / "plan-chirho.json")
                    != plan_hash_chirho
                    or worker_chirho.sha_chirho(attempt_chirho / "reviews-chirho.json")
                    != reviews_hash_chirho
                ):
                    raise ValueError(
                        "Checker changed the immutable source plan/reviews"
                    )
                if worker_chirho.sha_chirho(
                    attempt_chirho / "generation-chirho.json"
                ) != generation_hash_chirho or image_calls_chirho(
                    attempt_chirho, f"checker-{number_chirho:02d}-chirho.jsonl"
                ):
                    raise ValueError(
                        "Checker changed generation evidence or made a forbidden image request"
                    )
                verify_generated_chirho(
                    worker_chirho, attempt_chirho, queue_chirho, id_chirho
                )
            queue_chirho.transition_chirho(
                id_chirho,
                "checking",
                "installing",
                "Checked original; one installer owns catalogue/archive/shards",
            )
            try:
                worker_chirho.finish_chirho(attempt_chirho)
            except worker_chirho.AtlasLayoutRefusalChirho as error_chirho:
                # Preserve the rejected original on R2 before any linked replacement is queued.
                worker_chirho.retire_chirho(attempt_chirho)
                queue_chirho.settle_chirho(
                    id_chirho,
                    set(),
                    keys_chirho(queue_chirho, id_chirho),
                    set(),
                    str(error_chirho),
                )
            else:
                installed_disposition_chirho(
                    worker_chirho, queue_chirho, id_chirho, attempt_chirho
                )
        except (OSError, subprocess.SubprocessError) as error_chirho:
            queue_chirho.meta_chirho(
                "stop_chirho", "Checker/installer needs recovery: " + str(error_chirho)
            )
            # Do not turn an archival, storage, or checker failure into a new image request.
            raise
        except (ValueError, KeyError, RuntimeError) as error_chirho:
            # One malformed review cannot block unrelated sheets. Preserve its exact
            # artwork remotely before releasing the bounded local backlog reservation.
            worker_chirho.retire_chirho(attempt_chirho)
            queue_chirho.settle_chirho(
                id_chirho,
                set(),
                set(),
                keys_chirho(queue_chirho, id_chirho),
                "Review evidence held without regeneration: " + str(error_chirho),
            )
        worker_chirho.atomic_chirho(
            worker_chirho.QUEUE_CHIRHO
            / "pipeline-chirho/checking-progress-chirho.json",
            queue_chirho.status_chirho(),
        )
