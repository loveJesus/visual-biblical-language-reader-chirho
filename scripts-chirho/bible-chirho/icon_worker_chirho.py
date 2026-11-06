# For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life. — John 3:16 (KJV)
"""Single-owner whole-canon atlas producer using the existing bounded built-in GPT launcher.

Workflow: whole-bible-chirho.md. One sheet per durable attempt, no retry of unknown results,
legacy full-lemma holds excluded, partial safe cells retained, and R2 before raster retirement.
"""

from __future__ import annotations

import argparse
import fcntl
import hashlib
import importlib.util
import json
import signal
import subprocess
import sys
import time
import uuid
from datetime import UTC, datetime
from pathlib import Path

ROOT_CHIRHO = Path(__file__).resolve().parents[2]
sys.path[:0] = [str(ROOT_CHIRHO / "scripts-chirho/bible-chirho")]
from icon_generation_chirho import GeneratorJobChirho, validate_generation_chirho
from icon_lexicon_chirho import lexical_meaning_chirho
from icons_chirho import (
    QUEUE_CHIRHO,
    atomic_chirho,
    install_chirho,
    positive_visual_chirho,
    sha_chirho,
)

SPEC_CHIRHO = importlib.util.spec_from_file_location(
    "hinneh_existing_icon_launcher_chirho",
    ROOT_CHIRHO / "scripts-chirho/art-chirho/icon_worker_chirho.py",
)
# Import the existing launcher with its own helper directory first, then restore our module home.
sys.path.insert(0, str(ROOT_CHIRHO / "scripts-chirho/art-chirho"))
LAUNCHER_CHIRHO = importlib.util.module_from_spec(SPEC_CHIRHO)
SPEC_CHIRHO.loader.exec_module(LAUNCHER_CHIRHO)
STOP_CHIRHO = False
STYLE_CHIRHO = "static/assets-chirho/icons-chirho/proverbs-v1-chirho/0000-chirho/cell-00-chirho.webp"


def read_chirho(path_chirho):
    return json.loads(path_chirho.read_bytes())


def key_chirho(row_chirho):
    return json.dumps(
        [
            row_chirho["lemma_id_chirho"],
            row_chirho["lexical_form_chirho"]
            if row_chirho["lemma_id_chirho"].startswith("G")
            else row_chirho.get("lemma_augment_chirho"),
        ],
        ensure_ascii=False,
        separators=(",", ":"),
    )


def source_chirho(row_chirho):
    guidance_chirho = row_chirho.get("mnemonic_subject_chirho")
    if guidance_chirho is not None and (
        not isinstance(guidance_chirho, str) or not 1 <= len(guidance_chirho) <= 600
    ):
        raise ValueError("Invalid reviewed mnemonic direction")
    example_chirho = next(
        (
            example_chirho
            for example_chirho in row_chirho["examples_chirho"]
            if example_chirho.get("gloss_chirho")
            and example_chirho["gloss_chirho"] != "-"
        ),
        None,
    )
    meaning_chirho = {}
    if example_chirho is None:
        meaning_chirho = lexical_meaning_chirho(ROOT_CHIRHO, row_chirho)
        example_chirho = row_chirho["examples_chirho"][0]
    path_chirho = (
        ROOT_CHIRHO / "static" / example_chirho["content_path_chirho"].lstrip("/")
    ).resolve()
    if (
        not path_chirho.is_relative_to(ROOT_CHIRHO / "static/content-chirho")
        or sha_chirho(path_chirho) != example_chirho["content_sha256_chirho"]
    ):
        raise ValueError("Canonical source chapter changed")
    chapter_chirho = read_chirho(path_chirho)
    verse_chirho = next(
        verse_chirho
        for verse_chirho in chapter_chirho["verses_chirho"]
        if verse_chirho["id_chirho"] == example_chirho["lesson_id_chirho"]
    )
    token_chirho = next(
        token_chirho
        for token_chirho in verse_chirho["tokens_chirho"]
        if token_chirho["id_chirho"] == example_chirho["token_id_chirho"]
    )
    if (
        key_chirho(token_chirho) != key_chirho(row_chirho)
        or token_chirho["text_chirho"] != example_chirho["text_chirho"]
        or token_chirho["gloss_chirho"] != example_chirho["gloss_chirho"]
        or token_chirho.get("lemma_assignment_status_chirho")
        == "source_review_required"
    ):
        raise ValueError("Prepared source lemma or contextual gloss changed")
    refs_chirho = (
        ["nestle1904-morph-chirho", "berean-glosses-chirho"]
        if row_chirho["lemma_id_chirho"].startswith("G")
        else [
            source_chirho["id_chirho"]
            for source_chirho in verse_chirho["sources_chirho"]
            if source_chirho["id_chirho"].startswith(
                ("oshb-", "strong-", "aug-", "lexical-")
            )
        ]
    )
    return {
        "lemma_id_chirho": row_chirho["lemma_id_chirho"],
        "lemma_augment_chirho": row_chirho.get("lemma_augment_chirho"),
        "lexical_form_chirho": row_chirho["lexical_form_chirho"],
        "occurrence_chirho": example_chirho,
        "canonical_sha256_chirho": hashlib.sha256(
            verse_chirho["canonical_text_chirho"].encode()
        ).hexdigest(),
        "evidence_refs_chirho": refs_chirho,
        **meaning_chirho,
        **({"mnemonic_subject_chirho": guidance_chirho} if guidance_chirho else {}),
    }


def candidates_chirho():
    index_chirho = read_chirho(QUEUE_CHIRHO / "index-chirho.json")
    if len(index_chirho["candidate_paths_chirho"]) > 256:
        raise ValueError("Candidate index exceeds its whole-canon bound")
    rows_chirho = []
    for name_chirho in index_chirho["candidate_paths_chirho"]:
        path_chirho = (QUEUE_CHIRHO / name_chirho).resolve()
        if not path_chirho.is_relative_to(QUEUE_CHIRHO / "candidates-chirho"):
            raise ValueError("Candidate path escapes owned queue")
        rows_chirho.extend(read_chirho(path_chirho)["candidates_chirho"])
    if len(rows_chirho) != index_chirho["candidate_count_chirho"] or len(
        {key_chirho(row_chirho) for row_chirho in rows_chirho}
    ) != len(rows_chirho):
        raise ValueError("Candidate identities changed")
    return rows_chirho


def prompt_chirho(root_chirho, attempt_chirho):
    return f"""You are the bounded Hinneh image worker on L.J.'s whole-Bible icon instruction. GPT only; no Claude. Work only inside {attempt_chirho}. Read plan-chirho.json. Do not change it. It has 16 cells in order (some final-sheet cells may be explicitly padding). Read only each representative verse from its exact content_path_chirho under {root_chirho}/static; compare chapter sha256, lemma, exact lexical form, token id, text and gloss with the plan. Hebrew augments and Greek lexical forms are separate identities; never normalize a lookup key. Check the sourced sense before any image call. No prefix/root guess, new linguistic fact or invented approved translation.

Write reviews-chirho.json, a 16-object array copying every planned field unchanged. Padding objects just copy the padding record. For real words add sense_id_chirho (unique lowercase slug containing attempt name and cell), contextual_meaning_chirho, sense_note_chirho explaining the actual source context and any visual metaphor, alt_chirho, sense_review_chirho='agent_reviewed', art_review_chirho='pending', display_authority_chirho='General lemma illustration; another occurrence has not received a contextual sense review.' The source evidence_refs_chirho are copied exactly. Prefer a simple concrete subject; an abstract grammatical mnemonic must be honestly described. If a source disagreement remains, write source-review-needed-chirho.json listing affected cell_chirho and exact reasons, then return WITHOUT any image request.

Inspect {attempt_chirho}/style-reference-chirho.webp. Use ONLY the built-in image_gen image generator, exactly ONE call for this attempt, no paid API, Runware, alternate provider or regeneration after an unknown result. Follow the imagegen skill. Generate a genuinely transparent square 4x4 sticker atlas, one compact centered and physically connected subject in each real cell, very wide entirely empty gutters and outer margins, no text, labels, numerals, frames or sheet lines. Subjects occupy only the middle 55 percent of each cell. Match the warm outlined watercolor storybook style. Keep hands/anatomy plausible; avoid figures representing Jesus or God; empty seats, hands, ordinary people and objects are fine as honest mnemonics. Padding cells stay completely transparent, not duplicate drawings. Inspect the actual generated image, not just metadata. Transparent-image rendering can display hidden RGB as false colored fringes: also create one temporary RGB inspection composite over white with Pillow Image.alpha_composite, view that opaque composite, and base the visual assessment on what is actually visible after normal compositing. Never use that inspection composite as the source atlas or for cuts. A 55 percent footprint is the prompting target; actual acceptance requires visibly isolated subjects, real clear gutters and no clipping, not an invented numeric footprint verdict without measurement. The parent performs the formal pixel and cluster measurements. Save its exact complete actual prompt in prompt-chirho.txt. Convert the original output to lossless RGBA WebP sheet-original-chirho.webp. Create keyed-sheet-chirho.webp by changing only alpha <=8 to 0. Do not crop or repair a failed sheet to hide bad layout; parent measures every cut.

Prefix every shell command with rtk proxy, and use Chirho suffixes on identifiers you create. Write visual-review-chirho.json with inspected_chirho=true, visual_pass_chirho=true when the atlas is inspectable with safely isolated cells, plus rejected_cells_chirho as an array of {{cell_chirho, reason_chirho}} for every wrong subject, wrong count, clipping, detached artifact or other cell defect. Reject only the affected cells; a wrong bead count in one cell must not discard the other fifteen safe cells. The parent will never install listed rejected cells. Set visual_pass_chirho=false only when the atlas as a whole is uninspectable or globally unusable, not because one cell is bad, sheet_sha256_chirho of the keyed sheet, notes_chirho stating your actual inspection and limits, original_generator_path_chirho with the original built-in PNG path, and original_generator_sha256_chirho. Retain the original image for the parent's exact R2 archive. Do not create other previews, screenshots, app edits, git/DB/cloud writes, sends, paid calls, file removals outside this attempt, or a second image request. If the tool is unavailable, record image-tool-unavailable-chirho.json and stop; no fallback. A lost image result requires recovery of the saved original, not another call. Finish promptly once these artifacts exist; the parent handles cuts, compression, publication and cleanup."""


def command_chirho(arguments_chirho, log_path_chirho, timeout_chirho=600):
    with log_path_chirho.open("ab") as log_chirho:
        subprocess.run(
            arguments_chirho,
            cwd=ROOT_CHIRHO,
            stdout=log_chirho,
            stderr=subprocess.STDOUT,
            check=True,
            timeout=timeout_chirho,
        )


class AtlasLayoutRefusalChirho(ValueError):
    """A measured or visually rejected sheet is an item hold, not a provider failure."""


def retire_chirho(attempt_chirho):
    command_chirho(
        [
            "bun",
            "scripts-chirho/publish-chirho/r2-chirho/retire-artwork-chirho.ts",
            "--archive-chirho",
            "--retire-verified-chirho",
            f"--scope-chirho={attempt_chirho}",
        ],
        attempt_chirho / "retirement-log-chirho.txt",
        1200,
    )


def layout_hold_chirho(attempt_chirho, held_chirho, error_chirho):
    for cell_chirho in read_chirho(attempt_chirho / "plan-chirho.json")["cells_chirho"]:
        if not cell_chirho.get("padding_chirho"):
            held_chirho.add(key_chirho(cell_chirho))
    atomic_chirho(
        attempt_chirho / "hold-chirho.json",
        {
            "state_chirho": "layout_rejected",
            "reason_chirho": str(error_chirho),
            "at_chirho": datetime.now(UTC).isoformat(),
        },
    )
    retire_chirho(attempt_chirho)


def finish_chirho(attempt_chirho):
    if (attempt_chirho / "archived-chirho.json").exists():
        installed_chirho = read_chirho(attempt_chirho / "installed-chirho.json")
        catalogue_chirho = read_chirho(
            ROOT_CHIRHO / "data-chirho/media-chirho/bible-worker-icons-chirho.json"
        )
        by_id_chirho = {
            row_chirho["id_chirho"]: row_chirho
            for row_chirho in catalogue_chirho["icons_chirho"]
        }
        if any(
            by_id_chirho.get(row_chirho["id_chirho"]) != row_chirho
            for row_chirho in installed_chirho["records_chirho"]
        ):
            raise ValueError("Archived attempt catalogue changed")
        return read_chirho(attempt_chirho / "archived-chirho.json")["installed_chirho"]
    visual_chirho = read_chirho(attempt_chirho / "visual-review-chirho.json")
    if not positive_visual_chirho(attempt_chirho):
        raise AtlasLayoutRefusalChirho(
            "Artist did not attest a visually acceptable atlas layout"
        )
    if not (attempt_chirho / "cuts-chirho/manifest-chirho.json").exists():
        try:
            command_chirho(
                [
                    "python3",
                    "-B",
                    "scripts-chirho/art-chirho/prepare_icon_sheet_chirho.py",
                    str(attempt_chirho / "keyed-sheet-chirho.webp"),
                    str(attempt_chirho / "cuts-chirho"),
                    "--prompt-chirho",
                    str(attempt_chirho / "prompt-chirho.txt"),
                ],
                attempt_chirho / "install-log-chirho.txt",
            )
        except subprocess.CalledProcessError as error_chirho:
            log_chirho = (attempt_chirho / "install-log-chirho.txt").read_text()
            if (
                error_chirho.returncode == 2
                and (attempt_chirho / "cuts-chirho/manifest-chirho.json").exists()
            ):
                pass
            elif (
                "No proven empty" in log_chirho
                or "Gutters do not form four distinct cells" in log_chirho
            ):
                raise AtlasLayoutRefusalChirho(
                    "Atlas has no proven empty cell separators"
                ) from error_chirho
            else:
                raise
    installed_chirho = install_chirho(attempt_chirho)
    visual_chirho = read_chirho(attempt_chirho / "visual-review-chirho.json")
    atomic_chirho(
        attempt_chirho / "provenance-chirho.json",
        {
            "schema_version_chirho": 1,
            "tool_chirho": "image_gen.imagegen",
            "model_chirho": "Built-in tool-managed; model name not exposed.",
            "grid_chirho": [4, 4],
            "created_at_chirho": datetime.now(UTC).isoformat(),
            "prompt_chirho": (attempt_chirho / "prompt-chirho.txt").read_text(),
            "original_generator_path_chirho": visual_chirho[
                "original_generator_path_chirho"
            ],
            "original_generator_sha256_chirho": visual_chirho[
                "original_generator_sha256_chirho"
            ],
            "plan_sha256_chirho": sha_chirho(attempt_chirho / "plan-chirho.json"),
            "art_review_chirho": "pending",
        },
    )
    command_chirho(
        ["python3", "-B", "scripts-chirho/art-chirho/prepare_delivery_media_chirho.py"],
        attempt_chirho / "delivery-log-chirho.txt",
    )
    command_chirho(
        [
            "bun",
            "scripts-chirho/publish-chirho/r2-chirho/archive-artwork-chirho.ts",
            "--verify-remote-chirho",
        ],
        attempt_chirho / "archive-log-chirho.txt",
        1200,
    )
    command_chirho(
        [
            "python3",
            "-I",
            "-B",
            "scripts-chirho/art-chirho/refresh_sharded_media_chirho.py",
            "--once",
        ],
        attempt_chirho / "shards-log-chirho.txt",
    )
    # Only one installer is active in this lane. Archive this attempt's exact temporary
    # raster copies before removal, including the generator original referenced above.
    retire_chirho(attempt_chirho)
    atomic_chirho(
        attempt_chirho / "archived-chirho.json",
        {
            "state_chirho": "archived",
            "installed_chirho": installed_chirho,
            "at_chirho": datetime.now(UTC).isoformat(),
        },
    )
    return installed_chirho


def stop_chirho(_signal_chirho, _frame_chirho):
    global STOP_CHIRHO
    STOP_CHIRHO = True  # Drain the current call and archival chain; do not kill an unknown result.


def run_chirho(limit_chirho, concurrency_chirho=2):
    """Workflow: whole-bible-chirho.md. Disjoint generators, one serialized installer."""
    if not 1 <= concurrency_chirho <= 2 or not 1 <= limit_chirho <= 1000:
        raise ValueError("Concurrency must be 1..2 and sheet attempts 1..1000")
    rows_chirho = candidates_chirho()
    state_path_chirho = QUEUE_CHIRHO / "worker-state-chirho.json"
    state_chirho = (
        read_chirho(state_path_chirho)
        if state_path_chirho.exists()
        else {
            "held_keys_chirho": [],
            "attempt_count_chirho": 0,
            "active_attempt_chirho": None,
        }
    )
    active_chirho = state_chirho.get("active_attempts_chirho")
    if active_chirho is None:
        active_chirho = (
            [state_chirho["active_attempt_chirho"]]
            if state_chirho.get("active_attempt_chirho")
            else []
        )
    if (
        not isinstance(active_chirho, list)
        or len(active_chirho) > 2
        or any(not isinstance(name_chirho, str) for name_chirho in active_chirho)
        or len(set(active_chirho)) != len(active_chirho)
    ):
        raise ValueError("Invalid bounded active-attempt journal")
    active_chirho = list(active_chirho)
    held_chirho = set(state_chirho["held_keys_chirho"])
    jobs_chirho = {}
    reserved_chirho = set()
    installed_chirho = set()
    completed_chirho = 0
    scheduled_chirho = 0
    failed_calls_chirho = state_chirho.get("consecutive_generator_failures_chirho", 0)
    dispatch_hold_chirho = None
    shared_error_chirho = None

    def attempt_path_chirho(name_chirho):
        path_chirho = (QUEUE_CHIRHO / name_chirho).resolve()
        if (
            not path_chirho.is_relative_to(QUEUE_CHIRHO.resolve())
            or path_chirho == QUEUE_CHIRHO.resolve()
        ):
            raise ValueError("Active attempt escapes owned queue")
        return path_chirho

    def plan_keys_chirho(attempt_chirho):
        return {
            key_chirho(row_chirho)
            for row_chirho in read_chirho(attempt_chirho / "plan-chirho.json")[
                "cells_chirho"
            ]
            if not row_chirho.get("padding_chirho")
        }

    def persist_chirho():
        state_chirho.update(
            {
                "schema_version_chirho": 2,
                "held_keys_chirho": sorted(held_chirho),
                "active_attempts_chirho": list(active_chirho),
                "active_attempt_chirho": active_chirho[0] if active_chirho else None,
                "consecutive_generator_failures_chirho": failed_calls_chirho,
            }
        )
        atomic_chirho(state_path_chirho, state_chirho)

    def available_chirho():
        return [
            row_chirho
            for row_chirho in rows_chirho
            if row_chirho["status_chirho"] == "prepared"
            and key_chirho(row_chirho)
            not in held_chirho | installed_chirho | reserved_chirho
        ]

    def progress_chirho(status_chirho, **values_chirho):
        atomic_chirho(
            QUEUE_CHIRHO / "progress-chirho.json",
            {
                "state_chirho": status_chirho,
                "at_chirho": datetime.now(UTC).isoformat(),
                "held_lemmas_chirho": len(held_chirho),
                "concurrency_chirho": concurrency_chirho,
                "active_attempts_chirho": list(active_chirho),
                "attempt_chirho": active_chirho[0] if active_chirho else None,
                "remaining_chirho": len(available_chirho()),
                "in_flight_lemmas_chirho": len(reserved_chirho),
                "scheduled_sheets_chirho": scheduled_chirho,
                "generated_sheets_chirho": completed_chirho,
                **values_chirho,
            },
        )

    def holds_from_installed_chirho(attempt_chirho):
        for hold_chirho in read_chirho(attempt_chirho / "installed-chirho.json")[
            "holds_chirho"
        ]:
            held_chirho.add(key_chirho(hold_chirho["source_chirho"]))

    # A live prior request blocks recovery dispatch. Never reinterpret it as a fresh attempt.
    if any(
        LAUNCHER_CHIRHO.RECOVERY_CHIRHO.active_chirho(attempt_path_chirho(name_chirho))
        for name_chirho in active_chirho
    ):
        progress_chirho(
            "needs_reconciliation",
            reason_chirho="Prior generator may still be active; no new dispatch",
        )
        return 2
    for name_chirho in list(active_chirho):
        attempt_chirho = attempt_path_chirho(name_chirho)
        if (attempt_chirho / "archived-chirho.json").exists() or (
            (attempt_chirho / "keyed-sheet-chirho.webp").exists()
            and (attempt_chirho / "visual-review-chirho.json").exists()
        ):
            try:
                finish_chirho(attempt_chirho)
                holds_from_installed_chirho(attempt_chirho)
            except AtlasLayoutRefusalChirho as error_chirho:
                layout_hold_chirho(attempt_chirho, held_chirho, error_chirho)
        else:
            held_chirho.update(plan_keys_chirho(attempt_chirho))
            atomic_chirho(
                attempt_chirho / "hold-chirho.json",
                {
                    "reason_chirho": "Unresolved prior result; retained without regeneration",
                },
            )
        active_chirho.remove(name_chirho)
        persist_chirho()
    if failed_calls_chirho >= 3:
        progress_chirho(
            "generator_capacity_hold", reason_chirho="Prior failure cap remains held"
        )
        return 2
    current_chirho = read_chirho(
        ROOT_CHIRHO / "data-chirho/media-chirho/bible-worker-icons-chirho.json"
    )
    installed_chirho.update(
        key_chirho(row_chirho) for row_chirho in current_chirho["icons_chirho"]
    )

    try:
        while True:
            while (
                not STOP_CHIRHO
                and dispatch_hold_chirho is None
                and len(jobs_chirho) < concurrency_chirho
                and scheduled_chirho < limit_chirho
            ):
                eligible_chirho = available_chirho()
                if not eligible_chirho:
                    break
                chosen_chirho = []
                for row_chirho in eligible_chirho[:16]:
                    try:
                        chosen_chirho.append(
                            {
                                **source_chirho(row_chirho),
                                "cell_chirho": len(chosen_chirho),
                            }
                        )
                    except (ValueError, KeyError, StopIteration) as error_chirho:
                        held_chirho.add(key_chirho(row_chirho))
                        persist_chirho()
                        progress_chirho(
                            "source_item_held",
                            reason_chirho=str(error_chirho),
                            lemma_chirho=key_chirho(row_chirho),
                        )
                if not chosen_chirho:
                    continue
                chosen_chirho += [
                    {"cell_chirho": number_chirho, "padding_chirho": True}
                    for number_chirho in range(len(chosen_chirho), 16)
                ]
                number_chirho = state_chirho["attempt_count_chirho"]
                attempt_chirho = (
                    QUEUE_CHIRHO
                    / "attempts-chirho"
                    / f"{number_chirho // 100 * 100:04d}-chirho"
                    / f"{number_chirho // 10 * 10:04d}-chirho"
                    / f"attempt-{uuid.uuid4().hex}-chirho"
                )
                attempt_chirho.mkdir(parents=True)
                atomic_chirho(
                    attempt_chirho / "plan-chirho.json",
                    {
                        "schema_version_chirho": 1,
                        "grid_chirho": [4, 4],
                        "cells_chirho": chosen_chirho,
                    },
                )
                name_chirho = str(attempt_chirho.relative_to(QUEUE_CHIRHO))
                active_chirho.append(name_chirho)
                reserved_chirho.update(plan_keys_chirho(attempt_chirho))
                state_chirho["attempt_count_chirho"] = number_chirho + 1
                persist_chirho()  # Reserve every exact lemma before any child can request an image.
                scheduled_chirho += 1
                progress_chirho("generating")
                command_chirho(
                    [
                        "bun",
                        "scripts-chirho/publish-chirho/r2-chirho/with-artwork-chirho.ts",
                        STYLE_CHIRHO,
                        "--",
                        "magick",
                        STYLE_CHIRHO,
                        str(attempt_chirho / "style-reference-chirho.webp"),
                    ],
                    attempt_chirho / "style-log-chirho.txt",
                )
                jobs_chirho[name_chirho] = GeneratorJobChirho(
                    ROOT_CHIRHO,
                    attempt_chirho,
                    prompt_chirho(ROOT_CHIRHO, attempt_chirho),
                    LAUNCHER_CHIRHO.RECOVERY_CHIRHO,
                )
            if not jobs_chirho:
                break
            progressed_chirho = False
            for name_chirho, job_chirho in list(jobs_chirho.items()):
                if not job_chirho.poll_chirho():
                    continue
                progressed_chirho = True
                attempt_chirho = job_chirho.attempt_chirho
                error_chirho = job_chirho.error_chirho
                outcome_chirho = "item_held"
                if error_chirho is None:
                    try:
                        validate_generation_chirho(
                            attempt_chirho, LAUNCHER_CHIRHO.review_proposal_chirho
                        )
                    except (ValueError, RuntimeError) as validation_error_chirho:
                        error_chirho = validation_error_chirho
                if error_chirho is not None:
                    held_chirho.update(plan_keys_chirho(attempt_chirho))
                    atomic_chirho(
                        attempt_chirho / "hold-chirho.json",
                        {
                            "reason_chirho": str(error_chirho),
                            "at_chirho": datetime.now(UTC).isoformat(),
                        },
                    )
                    failed_calls_chirho += 1
                    if (attempt_chirho / "image-tool-unavailable-chirho.json").exists():
                        dispatch_hold_chirho = "image_tool_unavailable"
                    elif failed_calls_chirho >= 3:
                        dispatch_hold_chirho = "generator_capacity_hold"
                else:
                    if dispatch_hold_chirho is None:
                        failed_calls_chirho = 0
                    if (attempt_chirho / "source-review-needed-chirho.json").exists():
                        held_chirho.update(plan_keys_chirho(attempt_chirho))
                    else:
                        progress_chirho(
                            "installing", installing_attempt_chirho=name_chirho
                        )
                        try:
                            finish_chirho(
                                attempt_chirho
                            )  # Sole main-thread installation/archive writer.
                        except AtlasLayoutRefusalChirho as layout_error_chirho:
                            layout_hold_chirho(
                                attempt_chirho, held_chirho, layout_error_chirho
                            )
                        else:
                            completed_chirho += 1
                            outcome_chirho = "installed"
                            holds_from_installed_chirho(attempt_chirho)
                            installed_chirho.update(
                                plan_keys_chirho(attempt_chirho) - held_chirho
                            )
                del jobs_chirho[name_chirho]
                active_chirho.remove(name_chirho)
                reserved_chirho.difference_update(plan_keys_chirho(attempt_chirho))
                persist_chirho()
                progress_chirho(outcome_chirho)
                break  # Refill the freed slot before installing another completed sheet.
            if not progressed_chirho:
                time.sleep(0.25)
    except (
        OSError,
        subprocess.SubprocessError,
        ValueError,
        RuntimeError,
    ) as error_chirho:
        shared_error_chirho = str(error_chirho)
    finally:
        # A shared installer/storage failure leaves all unfinished plans in the durable journal.
        # Drain existing children before releasing the coordinator lock; never orphan/replay them.
        for job_chirho in jobs_chirho.values():
            try:
                job_chirho.wait_chirho()
            except (OSError, ValueError, RuntimeError) as error_chirho:
                shared_error_chirho = shared_error_chirho or str(error_chirho)
    if shared_error_chirho is not None:
        progress_chirho(
            "shared_source_or_storage_hold", reason_chirho=shared_error_chirho
        )
        return 2
    if dispatch_hold_chirho is not None:
        progress_chirho(
            dispatch_hold_chirho,
            reason_chirho="Generator dispatch is held; in-flight work drained",
        )
        return 2
    progress_chirho(
        "drained"
        if STOP_CHIRHO
        else (
            "bounded_pass_finished"
            if scheduled_chirho >= limit_chirho
            else "eligible_complete_with_holds"
        )
    )
    return 0


if __name__ == "__main__":
    parser_chirho = argparse.ArgumentParser(description=__doc__)
    parser_chirho.add_argument(
        "--sheets-chirho",
        type=int,
        default=1000,
        help="Maximum new sheet attempts in this pass",
    )
    parser_chirho.add_argument("--concurrency-chirho", type=int, default=2)
    args_chirho = parser_chirho.parse_args()
    if not 1 <= args_chirho.concurrency_chirho <= 2:
        raise SystemExit("Concurrency must be 1..2")
    if not 1 <= args_chirho.sheets_chirho <= 1000:
        raise SystemExit("Sheet limit must be 1..1000")
    signal.signal(signal.SIGINT, stop_chirho)
    signal.signal(signal.SIGTERM, stop_chirho)
    with (QUEUE_CHIRHO / "worker-chirho.lock").open("a") as lock_chirho:
        fcntl.flock(lock_chirho, fcntl.LOCK_EX | fcntl.LOCK_NB)
        try:
            raise SystemExit(
                run_chirho(args_chirho.sheets_chirho, args_chirho.concurrency_chirho)
            )
        except (OSError, subprocess.SubprocessError, ValueError) as error_chirho:
            atomic_chirho(
                QUEUE_CHIRHO / "progress-chirho.json",
                {
                    "state_chirho": "shared_source_or_storage_hold",
                    "reason_chirho": str(error_chirho),
                    "at_chirho": datetime.now(UTC).isoformat(),
                },
            )
            raise
