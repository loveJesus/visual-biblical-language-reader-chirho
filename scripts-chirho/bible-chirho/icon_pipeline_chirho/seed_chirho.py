# For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life. — John 3:16 (KJV)
"""Read-only migration evidence; never rewrite historical holds or unknown calls."""

from __future__ import annotations

import hashlib
import json

from queue_chirho import MAX_ATTEMPTS_CHIRHO


def read_chirho(path_chirho):
    if (
        path_chirho.is_symlink()
        or not path_chirho.is_file()
        or path_chirho.stat().st_size > 8 * 1024 * 1024
    ):
        raise ValueError("Unexpected seed file: " + str(path_chirho))
    return json.loads(path_chirho.read_bytes())


def seed_rows_chirho(worker_chirho):
    root_chirho = worker_chirho.ROOT_CHIRHO
    old_chirho = worker_chirho.QUEUE_CHIRHO
    state_path_chirho = old_chirho / "worker-state-chirho.json"
    state_chirho = read_chirho(state_path_chirho)
    if state_chirho.get("active_attempts_chirho") or state_chirho.get(
        "active_attempt_chirho"
    ):
        raise ValueError("Original worker has unresolved active ownership")
    if state_chirho.get("consecutive_generator_failures_chirho", 0) >= 3:
        raise ValueError("Original generator failure cap remains held")
    pictured_chirho = set()
    summary_hashes_chirho = {}
    for path_chirho in sorted(
        (root_chirho / "static/media-chirho").glob("*/summary-chirho.json")
    ):
        summary_chirho = read_chirho(path_chirho)
        summary_hashes_chirho[str(path_chirho.relative_to(root_chirho))] = (
            worker_chirho.sha_chirho(path_chirho)
        )
        for entry_chirho in summary_chirho["chapters_chirho"]:
            chapter_path_chirho = (
                root_chirho / "static" / entry_chirho["path_chirho"].lstrip("/")
            ).resolve()
            if not chapter_path_chirho.is_relative_to(
                root_chirho / "static/media-chirho"
            ):
                raise ValueError("Media chapter escapes inventory")
            if (
                worker_chirho.sha_chirho(chapter_path_chirho)
                != entry_chirho["sha256_chirho"]
            ):
                raise ValueError("Media chapter changed during seed")
            pictured_chirho.update(
                worker_chirho.key_chirho(row_chirho)
                for row_chirho in read_chirho(chapter_path_chirho).get(
                    "lemma_icons_chirho", []
                )
            )
    if len(summary_hashes_chirho) != 66:
        raise ValueError("Seed requires all 66 source-bound media summaries")
    origins_chirho = {}
    attempts_chirho = {}
    unknown_chirho = set()
    for plan_path_chirho in sorted(
        (old_chirho / "attempts-chirho").glob("*/*/attempt-*/plan-chirho.json")
    ):
        attempt_chirho = plan_path_chirho.parent
        plan_chirho = read_chirho(plan_path_chirho)
        source_only_chirho = (
            attempt_chirho / "source-review-needed-chirho.json"
        ).exists()
        complete_chirho = (attempt_chirho / "visual-review-chirho.json").exists() or (
            attempt_chirho / "installed-chirho.json"
        ).exists()
        for row_chirho in plan_chirho["cells_chirho"]:
            if row_chirho.get("padding_chirho"):
                continue
            key_chirho = worker_chirho.key_chirho(row_chirho)
            origins_chirho.setdefault(key_chirho, []).append(
                {
                    "attempt_chirho": str(attempt_chirho.relative_to(old_chirho)),
                    "plan_sha256_chirho": worker_chirho.sha_chirho(plan_path_chirho),
                    "disposition_chirho": "source_preflight"
                    if source_only_chirho
                    else "returned_artwork"
                    if complete_chirho
                    else "unknown",
                }
            )
            attempts_chirho[key_chirho] = attempts_chirho.get(key_chirho, 0) + (
                0 if source_only_chirho else 1
            )
            if not source_only_chirho and not complete_chirho:
                unknown_chirho.add(key_chirho)
    rows_chirho = []
    for candidate_chirho in worker_chirho.candidates_chirho():
        key_chirho = worker_chirho.key_chirho(candidate_chirho)
        if key_chirho in pictured_chirho:
            continue
        count_chirho = attempts_chirho.get(key_chirho, 0)
        reason_chirho = None
        if key_chirho in unknown_chirho:
            reason_chirho = (
                "Historical request outcome unknown; never automatically regenerate"
            )
        elif candidate_chirho["status_chirho"] != "prepared":
            reason_chirho = "Historical legacy or missing-source disposition retained"
        elif count_chirho >= MAX_ATTEMPTS_CHIRHO:
            reason_chirho = "Lifetime attempt cap retained"
        rows_chirho.append(
            {
                "key_chirho": key_chirho,
                "payload_chirho": candidate_chirho,
                "state_chirho": "held" if reason_chirho else "queued",
                "attempts_chirho": count_chirho,
                "reason_chirho": reason_chirho,
                "origin_chirho": origins_chirho.get(key_chirho, []),
            }
        )
    evidence_chirho = {
        "authority_chirho": "L.J. November 5: separate generation/checking queues, failures at tail, at least one general picture per lemma before additional senses",
        "old_state_sha256_chirho": worker_chirho.sha_chirho(state_path_chirho),
        "candidate_index_sha256_chirho": worker_chirho.sha_chirho(
            old_chirho / "index-chirho.json"
        ),
        "media_summaries_sha256_chirho": hashlib.sha256(
            json.dumps(summary_hashes_chirho, sort_keys=True).encode()
        ).hexdigest(),
        "rows_sha256_chirho": hashlib.sha256(
            json.dumps(rows_chirho, sort_keys=True, ensure_ascii=False).encode()
        ).hexdigest(),
        "missing_count_chirho": len(rows_chirho),
        "pictured_count_chirho": len(pictured_chirho),
        "max_attempts_chirho": MAX_ATTEMPTS_CHIRHO,
        "generator_failures_chirho": state_chirho.get(
            "consecutive_generator_failures_chirho", 0
        ),
    }
    return rows_chirho, evidence_chirho
