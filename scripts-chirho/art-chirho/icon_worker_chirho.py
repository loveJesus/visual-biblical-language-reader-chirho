#!/usr/bin/env python3
# For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life. — John 3:16 (KJV)
"""Single-writer local icon producer. Start only after the interactive writer hands off."""

import argparse
import fcntl
import hashlib
import importlib.util
import json
import os
import re
import shutil
import signal
import subprocess
import sys
import time
import uuid
from pathlib import Path

from cut_sheet_chirho import cluster_count_chirho
from icon_reviews_chirho import (
    INVENTORY_CHIRHO,
    deferrals_chirho,
    first_pass_deferrals_chirho,
)
from icon_reviews_chirho import identity_chirho as review_identity_chirho
from PIL import Image
from prepare_icon_sheet_chirho import cuts_chirho

ROOT_CHIRHO = Path(__file__).resolve().parents[2]
QUEUE_CHIRHO = Path("workspace-chirho/art-chirho/queue-chirho/icon-worker-chirho")
LEMMA_QUEUE_CHIRHO = Path("workspace-chirho/art-chirho/queue-chirho/lemma-worker-chirho")
CATALOGUES_CHIRHO = [
    Path("data-chirho/media-chirho/proverbs-26-1-icons-chirho.json"),
    Path("data-chirho/media-chirho/proverbs-worker-icons-chirho.json"),
]
STYLE_CHIRHO = "/assets-chirho/icons-chirho/proverbs-v1-chirho/0000-chirho/cell-00-chirho.webp"
CHILD_CHIRHO = None
STOP_CHIRHO = False
REVIEW_PROPOSALS_CHIRHO = ("source-review-needed-chirho.json", "selection-shortfall-chirho.json")
RECOVERY_SPEC_CHIRHO = importlib.util.spec_from_file_location(
    "art_failures_chirho", Path(__file__).parent / "recovery-chirho/failures_chirho.py"
)
RECOVERY_CHIRHO = importlib.util.module_from_spec(RECOVERY_SPEC_CHIRHO)
RECOVERY_SPEC_CHIRHO.loader.exec_module(RECOVERY_CHIRHO)


class LayoutRejectedChirho(ValueError):
    pass


def load_chirho(path_chirho):
    return json.loads(path_chirho.read_text(encoding="utf-8"))


def digest_chirho(path_chirho):
    return hashlib.sha256(path_chirho.read_bytes()).hexdigest()


def lossless_webp_chirho(path_chirho):
    data_chirho = path_chirho.read_bytes()
    if (
        len(data_chirho) < 12
        or data_chirho[:4] != b"RIFF"
        or data_chirho[8:12] != b"WEBP"
        or int.from_bytes(data_chirho[4:8], "little") + 8 != len(data_chirho)
    ):
        return False
    offset_chirho = 12
    chunks_chirho = []
    while offset_chirho + 8 <= len(data_chirho):
        kind_chirho = data_chirho[offset_chirho : offset_chirho + 4]
        size_chirho = int.from_bytes(data_chirho[offset_chirho + 4 : offset_chirho + 8], "little")
        offset_chirho += 8 + size_chirho + (size_chirho % 2)
        if offset_chirho > len(data_chirho):
            return False
        chunks_chirho.append(kind_chirho)
    return (
        offset_chirho == len(data_chirho)
        and chunks_chirho.count(b"VP8L") == 1
        and b"VP8 " not in chunks_chirho
        and b"ANIM" not in chunks_chirho
    )


def atomic_chirho(path_chirho, value_chirho):
    path_chirho.parent.mkdir(parents=True, exist_ok=True)
    temp_chirho = path_chirho.with_name(path_chirho.name + "." + uuid.uuid4().hex + ".tmp")
    try:
        with temp_chirho.open("x", encoding="utf-8") as file_chirho:
            text_chirho = json.dumps(value_chirho, ensure_ascii=False, indent=2) + "\n"
            if path_chirho.name == "proverbs-worker-icons-chirho.json":
                text_chirho = subprocess.run(
                    ["bunx", "prettier", "--stdin-filepath", str(path_chirho)],
                    cwd=ROOT_CHIRHO,
                    input=text_chirho,
                    text=True,
                    capture_output=True,
                    check=True,
                ).stdout
            file_chirho.write(text_chirho)
            file_chirho.flush()
            os.fsync(file_chirho.fileno())
        os.replace(temp_chirho, path_chirho)
        sync_dir_chirho(path_chirho.parent)
    finally:
        temp_chirho.unlink(missing_ok=True)


def sync_dir_chirho(path_chirho):
    fd_chirho = os.open(path_chirho, os.O_RDONLY)
    try:
        os.fsync(fd_chirho)
    finally:
        os.close(fd_chirho)


def hold_attempt_chirho(queue_chirho, attempt_chirho, reason_chirho, checkpoint_chirho=None):
    checkpoint_chirho = checkpoint_chirho or {}
    selection_path_chirho = attempt_chirho / "selection-chirho.json"
    if (
        not selection_path_chirho.exists()
        and not (attempt_chirho / "candidates-chirho.json").exists()
    ):
        raise RuntimeError("Unknown pending selection requires manual reconciliation")
    rows_chirho = load_chirho(
        selection_path_chirho
        if selection_path_chirho.exists()
        else attempt_chirho / "candidates-chirho.json"
    )
    if not isinstance(rows_chirho, list) or not rows_chirho:
        raise ValueError("A failed icon request has no protected selection")
    proposal_chirho = review_proposal_chirho(attempt_chirho)
    scope_chirho = "lexeme"
    items_chirho = [list(key_chirho(row_chirho)) for row_chirho in rows_chirho]
    if (
        proposal_chirho
        and not (attempt_chirho / "sheet-original-chirho.webp").exists()
        and not checkpoint_chirho.get("rejections_chirho", 0)
    ):
        document_chirho = load_chirho(proposal_chirho)
        indexes_chirho = {
            row_chirho.get("cell_chirho")
            for row_chirho in document_chirho.get("concerns_chirho", [])
        }
        affected_chirho = [
            row_chirho
            for index_chirho, row_chirho in enumerate(rows_chirho)
            if index_chirho in indexes_chirho
        ] or rows_chirho
        scope_chirho = "context"
        items_chirho = [list(review_identity_chirho(row_chirho)) for row_chirho in affected_chirho]
    return RECOVERY_CHIRHO.hold_chirho(
        queue_chirho, attempt_chirho, scope_chirho, items_chirho, reason_chirho, checkpoint_chirho
    )


def key_chirho(item_chirho):
    return (item_chirho["lemma_id_chirho"], item_chirho.get("lemma_augment_chirho"))


def candidates_chirho(root_chirho, lemma_first_chirho=False):
    inventory_chirho = load_chirho(root_chirho / INVENTORY_CHIRHO)
    deferred_chirho = deferrals_chirho(root_chirho, inventory_chirho)
    deferred_lemmas_chirho = first_pass_deferrals_chirho(root_chirho, inventory_chirho)
    queue_chirho = root_chirho / (LEMMA_QUEUE_CHIRHO if lemma_first_chirho else QUEUE_CHIRHO)
    held_lexemes_chirho = RECOVERY_CHIRHO.blocked_chirho(queue_chirho, "lexeme")
    held_contexts_chirho = RECOVERY_CHIRHO.blocked_chirho(queue_chirho, "context")
    if lemma_first_chirho:
        # This backlog was scoped to the original pass, not a permanent source disagreement.
        deferred_lemmas_chirho = set()
    seen_chirho = {
        key_chirho(row_chirho)
        for path_chirho in CATALOGUES_CHIRHO
        for row_chirho in load_chirho(root_chirho / path_chirho)["icons_chirho"]
    }
    if lemma_first_chirho:
        from refresh_sharded_media_chirho import lemma_library_chirho

        library_chirho, _chapters_chirho = lemma_library_chirho(root_chirho)
        seen_chirho.update(key_chirho(row_chirho) for row_chirho in (library_chirho or {}).values())
    by_token_chirho = {}
    for lemma_chirho in inventory_chirho["lemmas_chirho"]:
        if (
            key_chirho(lemma_chirho) in seen_chirho
            or key_chirho(lemma_chirho) in deferred_lemmas_chirho
            or RECOVERY_CHIRHO.key_chirho(key_chirho(lemma_chirho)) in held_lexemes_chirho
        ):
            continue
        for occurrence_chirho in lemma_chirho["occurrences_chirho"]:
            if (
                occurrence_chirho["reading_chirho"] == "main"
                or lemma_first_chirho
                and occurrence_chirho["reading_chirho"] in ("ketiv", "qere")
            ) and review_identity_chirho(
                {
                    **occurrence_chirho,
                    **{
                        field_chirho: lemma_chirho[field_chirho]
                        for field_chirho in ("lemma_id_chirho", "lemma_augment_chirho")
                    },
                }
            ) not in deferred_chirho:
                if (
                    RECOVERY_CHIRHO.key_chirho(
                        (
                            occurrence_chirho["verse_id_chirho"],
                            occurrence_chirho["token_id_chirho"],
                            *key_chirho(lemma_chirho),
                        )
                    )
                    in held_contexts_chirho
                ):
                    continue
                by_token_chirho.setdefault(
                    (occurrence_chirho["verse_id_chirho"], occurrence_chirho["token_id_chirho"]), []
                ).append((lemma_chirho, occurrence_chirho))
    results_chirho = []
    for chapter_chirho in sorted(
        (root_chirho / "static/content-chirho/proverbs-chirho").glob("chapter-*-chirho.json")
    ):
        for verse_chirho in load_chirho(chapter_chirho)["verses_chirho"]:
            tokens_chirho = verse_chirho["tokens_chirho"]
            if lemma_first_chirho:
                tokens_chirho = [
                    reading_chirho
                    for token_chirho in tokens_chirho
                    for reading_chirho in [token_chirho, *token_chirho.get("qere_chirho", [])]
                ]
            for token_chirho in tokens_chirho:
                for lemma_chirho, occurrence_chirho in by_token_chirho.get(
                    (verse_chirho["id_chirho"], token_chirho["id_chirho"]), []
                ):
                    key_value_chirho = key_chirho(lemma_chirho)
                    if key_value_chirho in seen_chirho:
                        continue
                    if (
                        key_chirho(token_chirho) != key_value_chirho
                        or token_chirho.get("gloss_chirho") != occurrence_chirho["gloss_chirho"]
                    ):
                        raise ValueError("Inventory and chapter token disagree")
                    seen_chirho.add(key_value_chirho)
                    results_chirho.append(
                        {
                            "lemma_id_chirho": key_value_chirho[0],
                            "lemma_augment_chirho": key_value_chirho[1],
                            "lexical_form_chirho": lemma_chirho["lexical_form_chirho"],
                            "lexical_index_id_chirho": lemma_chirho["lexical_index_id_chirho"],
                            **occurrence_chirho,
                        }
                    )
    unresolved_chirho = {
        key_chirho(lemma_chirho)
        for rows_chirho in by_token_chirho.values()
        for lemma_chirho, _occurrence_chirho in rows_chirho
        if key_chirho(lemma_chirho) not in seen_chirho
    }
    if unresolved_chirho:
        raise ValueError("Inventory contains main-line lemmas with no matching chapter token")
    return results_chirho


def alternate_candidates_chirho(root_chirho, count_chirho):
    # Only attach a new image to an existing reviewed contextual record, not merely a lemma.
    positions_chirho = {}
    for chapter_chirho in sorted(
        (root_chirho / "static/content-chirho/proverbs-chirho").glob("chapter-*-chirho.json")
    ):
        for verse_chirho in load_chirho(chapter_chirho)["verses_chirho"]:
            for token_chirho in verse_chirho["tokens_chirho"]:
                positions_chirho[(verse_chirho["id_chirho"], token_chirho["id_chirho"])] = (
                    len(positions_chirho),
                    token_chirho,
                )
    records_chirho = []
    for path_chirho in CATALOGUES_CHIRHO:
        catalogue_chirho = load_chirho(root_chirho / path_chirho)
        for record_chirho in catalogue_chirho["icons_chirho"]:
            verse_id_chirho = record_chirho.get(
                "lesson_id_chirho", catalogue_chirho.get("lesson_id_chirho")
            )
            position_chirho = positions_chirho.get(
                (verse_id_chirho, record_chirho.get("token_id_chirho"))
            )
            if (
                not position_chirho
                or record_chirho.get("selected_chirho") is not True
                or record_chirho.get("sense_review_chirho")
                not in ("agent_reviewed", "human_reviewed")
                or not all(
                    record_chirho.get(field_chirho)
                    for field_chirho in (
                        "id_chirho",
                        "sense_id_chirho",
                        "contextual_meaning_chirho",
                        "evidence_refs_chirho",
                    )
                )
            ):
                continue
            token_chirho = position_chirho[1]
            if key_chirho(record_chirho) != key_chirho(token_chirho):
                raise ValueError("Reviewed alternate context conflicts with chapter lemma")
            records_chirho.append(
                (
                    position_chirho[0],
                    record_chirho["id_chirho"],
                    verse_id_chirho,
                    token_chirho,
                    record_chirho,
                )
            )
    results_chirho, seen_chirho = [], set()
    for _position_chirho, _id_chirho, verse_id_chirho, token_chirho, record_chirho in sorted(
        records_chirho, key=lambda row_chirho: (row_chirho[0], row_chirho[1])
    ):
        if key_chirho(record_chirho) in seen_chirho:
            continue
        seen_chirho.add(key_chirho(record_chirho))
        results_chirho.append(
            {
                "verse_id_chirho": verse_id_chirho,
                "token_id_chirho": record_chirho["token_id_chirho"],
                "lemma_id_chirho": record_chirho["lemma_id_chirho"],
                "lemma_augment_chirho": record_chirho.get("lemma_augment_chirho"),
                "gloss_chirho": token_chirho.get("gloss_chirho"),
                "alternate_of_chirho": record_chirho["id_chirho"],
                "sense_id_chirho": record_chirho["sense_id_chirho"],
                "contextual_meaning_chirho": record_chirho["contextual_meaning_chirho"],
                "sense_review_chirho": record_chirho["sense_review_chirho"],
                "evidence_refs_chirho": record_chirho["evidence_refs_chirho"],
            }
        )
        if len(results_chirho) == count_chirho:
            break
    return results_chirho


def verify_alternate_chirho(root_chirho, candidate_chirho):
    matches_chirho = []
    for path_chirho in CATALOGUES_CHIRHO:
        catalogue_chirho = load_chirho(root_chirho / path_chirho)
        for record_chirho in catalogue_chirho["icons_chirho"]:
            if record_chirho.get("id_chirho") == candidate_chirho["alternate_of_chirho"]:
                matches_chirho.append((catalogue_chirho, record_chirho))
    if len(matches_chirho) != 1:
        raise ValueError("Alternate source record is missing or ambiguous")
    catalogue_chirho, source_chirho = matches_chirho[0]
    if (
        source_chirho.get("selected_chirho") is not True
        or source_chirho.get("sense_review_chirho") not in ("agent_reviewed", "human_reviewed")
        or source_chirho.get("lemma_id_chirho") != candidate_chirho["lemma_id_chirho"]
        or source_chirho.get("lemma_augment_chirho") != candidate_chirho.get("lemma_augment_chirho")
        or source_chirho.get("token_id_chirho") != candidate_chirho["token_id_chirho"]
        or source_chirho.get("lesson_id_chirho", catalogue_chirho.get("lesson_id_chirho"))
        != candidate_chirho["verse_id_chirho"]
        or any(
            source_chirho.get(field_chirho) != candidate_chirho.get(field_chirho)
            for field_chirho in (
                "sense_id_chirho",
                "contextual_meaning_chirho",
                "sense_review_chirho",
                "evidence_refs_chirho",
            )
        )
    ):
        raise ValueError("Alternate does not match its reviewed contextual record")


def lemma_prompt_chirho(attempt_chirho):
    if not (attempt_chirho / "lemma-first-policy-chirho.json").exists():
        return ""
    return (
        "LATEST OWNER DIRECTION: L.J. wants at least one picture for each full lemma before "
        "additional senses. This is the separate lemma-first backfill, not the old initial pass. "
        "Its scoped preparation deferrals have been reconsidered; exact source disagreements "
        "are still held. Include unambiguous pronouns, particles and prefixes using non-text "
        "pictorial mnemonics for their sourced grammatical function. A dash gloss means not "
        "separately translated; check the source's actual function, never invent a concrete "
        "meaning. The reader labels reuse as a general word picture, not this verse's chosen "
        "sense. You must still verify the pictured meaning at its source occurrence. Ketiv "
        "and qere candidates retain their own exact source identities. Do not skip a term "
        "merely because it is grammatical or abstract. Any genuinely disputed source meaning "
        "or animal identity still requires the normal source-review proposal before an image "
        "call. Existing retry limits, image tool, 4x4 layout, style and pending art status "
        "are unchanged.\n\n"
    )


def prompt_chirho(root_chirho, attempt_chirho):
    return (
        lemma_prompt_chirho(attempt_chirho)
        + f"""Produce one 4x4 contextual Hebrew sticker sheet for Hinneh. Your ONLY image generation method is the built-in image_gen.imagegen tool. Never call paid APIs, alternate tools, cloud services, git, or a fallback. If unavailable, stop. Work only in {attempt_chirho}; do not change any other files. Read {attempt_chirho / "candidates-chirho.json"} and both catalogues in {root_chirho / "data-chirho/media-chirho"}, and use the first 16 meaningful distinct uncovered lemma/contextual senses in occurrence order. If selection-chirho.json exists, use exactly its 16 candidates in order. Some are alternate_of_chirho records: illustrate the exact existing contextual_meaning_chirho and preserve its verse, token, full lemma, and sense; do not invent or change the sense. If retry-note-chirho.txt exists in the attempt, read it and correct that specific failure while preserving the exact selected senses. On a layout retry revise the prompt materially for wider empty gutters and smaller subjects. No text includes letters, digits and punctuation: never draw question marks. Illustrate examination with a person inspecting an object instead. Write the exact 16 complete candidate objects to selection-chirho.json before generating. Skip nonillustratable grammatical terms if needed, recording why. If fewer than sixteen meaningful distinct contexts can be selected from the supplied list, do not invent padding: before any image call, write selection-shortfall-chirho.json with the supplied candidates and a reason for each unselected candidate, then exit successfully for owner review. Only the owner may change initial-pass eligibility or supply exact already-reviewed alternatives. This list intentionally includes at most one candidate per full lemma identity so minor inflection/gloss variations do not consume sheets; never infer equivalence merely from root letters. Check each selected occurrence against pinned OSHB, GBT and Hebrew Lexicon evidence in {root_chirho / "data-chirho/sources-chirho"} and chapter data. Do not invent source word ids.

Before requesting any image, finish the source check for all sixteen selected contexts. Read owner-source-review-current-chirho.md in the parent queue directory if it exists; root keeps only current contextual review notes there, with the full decisions retained in their original attempts. Apply a note only to its exact verse, token, full lemma and gloss. A valid usage explicitly listed in the lexical entry, or English wording spread across neighboring tokens, is not a source contradiction by itself; check the complete entry and clause rather than only the headword. If the pinned sources disagree in a way that requires choosing a disputed sense or animal identity, do not guess and do not spend image retries on that disagreement. Write source-review-needed-chirho.json inside this attempt with selection_chirho containing the exact sixteen complete candidates and concerns_chirho containing the affected cell_chirho, reason_chirho and evidence_refs_chirho. Exit successfully before calling image_gen.imagegen. This is only a proposal for the main GPT owner to reconcile; it never grants source, sense or artwork approval. If a retry note identifies an unresolved source disagreement, use this same source-review stop instead of generating another sheet. Continue to use the normal bounded retries only for actual layout or image-legibility failures.

Inspect {root_chirho / "static" / STYLE_CHIRHO.lstrip("/")} as a style reference. Create a transparent 4x4 sheet, 16 centered isolated subjects, huge genuinely empty gutters, no text; consistent warm simple storybook stickers readable at 19px. Convert the image tool original losslessly with ImageMagick to {attempt_chirho / "sheet-original-chirho.webp"} and actual generation prompt at {attempt_chirho / "prompt-chirho.txt"}. Inspect the original yourself. Any contact sheets in the project workspace must also be lossless WebP, not PNG. Create {attempt_chirho / "keyed-sheet-chirho.webp"} by changing only alpha values at or below 8 to zero; preserve RGB and alpha values above 8 exactly. Keep the original and keyed lossless WebPs and record their SHA-256 hashes. Do not delete or alter the image tool original. Run python3 {root_chirho / "scripts-chirho/art-chirho/prepare_icon_sheet_chirho.py"} on the sheet to {attempt_chirho / "cuts-chirho"} with --prompt-chirho pointing to the prompt file; do not repair failed cells. If visual inspection fails despite passing measured layout, do not stage any icons: write visual-rejected-chirho.json with outcome_chirho='visual_rejected', a specific reason_chirho, original_sha256_chirho, sheet_sha256_chirho, and the exact 16 selected candidate objects in selection_chirho, then exit successfully. If measured layout fails, do not stage icons: instead write layout-rejected-chirho.json with outcome_chirho='layout_rejected', reason_chirho, original_sha256_chirho, sheet_sha256_chirho, and selection_chirho containing the exact 16 candidate objects from selection-chirho.json, then exit successfully. Create {attempt_chirho / "staged-chirho.json"} with fields prompt_chirho, tool_chirho='image_gen.imagegen', model_chirho='tool-managed; not exposed', created_at_chirho (UTC), grid_chirho=[4,4], original_sha256_chirho, sheet_sha256_chirho, style_reference_chirho='{STYLE_CHIRHO}', review_notes_chirho (one non-empty string, not an array), and cells_chirho of exactly 16 entries. Each cell must have cell_chirho (0..15 in order), verse_id_chirho, token_id_chirho, lemma_id_chirho, lemma_augment_chirho, source_gloss_chirho, contextual_meaning_chirho, sense_id_chirho (required for an alternate, copied exactly from selection), sense_review_chirho='agent_reviewed', sense_note_chirho (specific evidence-based reasoning), evidence_refs_chirho including oshb-prov-chirho, gbt-english-prov-chirho, lexical-index-chirho, alt_chirho, icon_path_chirho (relative to attempt; prefix cuts-chirho/ to the path in the cuts manifest), icon_sha256_chirho, art_review_chirho='pending'. Use values and paths from the measured cuts manifest. On success these exact 16 candidates must match selection-chirho.json in order. Only reviewed contextual meaning may be recorded; art remains pending L.J.'s approval. A preselected final sheet contains all remaining main-line candidates followed by alternate illustrations of existing reviewed senses. Never infer their meanings from lemma alone."""
    )


def review_proposal_chirho(attempt_chirho):
    return next(
        (
            attempt_chirho / name_chirho
            for name_chirho in REVIEW_PROPOSALS_CHIRHO
            if (attempt_chirho / name_chirho).exists()
        ),
        None,
    )


def run_generator_chirho(root_chirho, attempt_chirho):
    global CHILD_CHIRHO
    log_chirho = attempt_chirho / "codex-chirho.jsonl"
    with log_chirho.open("x", encoding="utf-8") as file_chirho:
        RECOVERY_CHIRHO.request_chirho(attempt_chirho)
        try:
            CHILD_CHIRHO = subprocess.Popen(
                [
                    "codex",
                    "exec",
                    "-m",
                    "gpt-6.1-terra",
                    "-c",
                    "daybreak=false",
                    "-s",
                    "workspace-write",
                    "--json",
                    prompt_chirho(root_chirho, attempt_chirho),
                ],
                cwd=root_chirho,
                stdin=subprocess.DEVNULL,
                stdout=file_chirho,
                stderr=subprocess.STDOUT,
                start_new_session=True,
            )
        except OSError:
            RECOVERY_CHIRHO.request_chirho(attempt_chirho, finished_chirho=True)
            raise
        RECOVERY_CHIRHO.request_chirho(attempt_chirho, CHILD_CHIRHO.pid)
        try:
            code_chirho = CHILD_CHIRHO.wait(timeout=1200)
        except subprocess.TimeoutExpired:
            os.killpg(CHILD_CHIRHO.pid, signal.SIGKILL)
            CHILD_CHIRHO.wait()
            raise RuntimeError("Generator timed out; inspect attempt before resuming")
        finally:
            RECOVERY_CHIRHO.request_chirho(attempt_chirho, CHILD_CHIRHO.pid, True)
            CHILD_CHIRHO = None
    if code_chirho or STOP_CHIRHO:
        raise RuntimeError("Generator failed or interrupted; inspect attempt before resuming")
    events_chirho = [
        json.loads(line_chirho)
        for line_chirho in log_chirho.read_text().splitlines()
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
    if not thread_chirho or not re.fullmatch(r"[0-9a-f-]{36}", thread_chirho):
        raise ValueError("Missing generator thread id")
    # A source proposal returns only to the mandatory reconciliation hold in work_chirho.
    # No image call is required to raise that hold; installation still requires attestation.
    if review_proposal_chirho(attempt_chirho):
        return
    rollout_chirho = list(
        (Path.home() / ".codex/sessions").glob(f"*/*/*/rollout-*-{thread_chirho}.jsonl")
    )
    if len(rollout_chirho) != 1 or not any(
        "tools.image_gen__imagegen(" in line_chirho
        for line_chirho in rollout_chirho[0].open(encoding="utf-8")
    ):
        raise ValueError("Built-in image_gen call not verified; stop")


def validate_sheet_chirho(attempt_chirho, staged_chirho):
    original_chirho = attempt_chirho / "sheet-original-chirho.webp"
    sheet_chirho = attempt_chirho / "keyed-sheet-chirho.webp"
    if not lossless_webp_chirho(original_chirho) or not lossless_webp_chirho(sheet_chirho):
        raise ValueError("Both sheets must be static lossless WebP")
    if digest_chirho(original_chirho) != staged_chirho.get("original_sha256_chirho"):
        raise ValueError("Original sheet hash mismatch")
    with (
        Image.open(original_chirho) as original_image_chirho,
        Image.open(sheet_chirho) as keyed_image_chirho,
    ):
        if (
            original_image_chirho.format != "WEBP"
            or keyed_image_chirho.format != "WEBP"
            or original_image_chirho.mode != "RGBA"
            or keyed_image_chirho.mode != "RGBA"
            or original_image_chirho.size != keyed_image_chirho.size
        ):
            raise ValueError("Original and keyed sheets must be matching RGBA WebPs")
        original_bytes_chirho = original_image_chirho.tobytes()
        keyed_bytes_chirho = keyed_image_chirho.tobytes()
        if any(
            (
                original_bytes_chirho[index_chirho + 3] > 8
                and original_bytes_chirho[index_chirho : index_chirho + 3]
                != keyed_bytes_chirho[index_chirho : index_chirho + 3]
            )
            or keyed_bytes_chirho[index_chirho + 3]
            != (
                0
                if original_bytes_chirho[index_chirho + 3] <= 8
                else original_bytes_chirho[index_chirho + 3]
            )
            for index_chirho in range(0, len(original_bytes_chirho), 4)
        ):
            raise ValueError("Keying altered RGB or alpha above 8")
    if digest_chirho(sheet_chirho) != staged_chirho.get("sheet_sha256_chirho"):
        raise ValueError("Sheet hash mismatch")
    with Image.open(sheet_chirho) as image_chirho:
        if (
            image_chirho.width > 4096
            or image_chirho.height > 4096
            or "A" not in image_chirho.getbands()
        ):
            raise ValueError("Sheet must have alpha and be <=4096px")
        alpha_chirho = image_chirho.getchannel("A")
        try:
            x_chirho, y_chirho = cuts_chirho(alpha_chirho, "x"), cuts_chirho(alpha_chirho, "y")
        except ValueError as error_chirho:
            raise LayoutRejectedChirho(str(error_chirho)) from error_chirho
        for index_chirho in range(16):
            col_chirho, row_chirho = index_chirho % 4, index_chirho // 4
            cut_chirho = alpha_chirho.crop(
                (
                    x_chirho[col_chirho],
                    y_chirho[row_chirho],
                    x_chirho[col_chirho + 1],
                    y_chirho[row_chirho + 1],
                )
            )
            box_chirho = cut_chirho.getbbox()
            if (
                not box_chirho
                or min(
                    box_chirho[0],
                    box_chirho[1],
                    cut_chirho.width - box_chirho[2],
                    cut_chirho.height - box_chirho[3],
                )
                < 8
                or cluster_count_chirho(cut_chirho) != 1
            ):
                raise LayoutRejectedChirho("Sheet cell failed measured layout checks")


def rejection_path_chirho(attempt_chirho):
    paths_chirho = [
        attempt_chirho / name_chirho
        for name_chirho in ("layout-rejected-chirho.json", "visual-rejected-chirho.json")
        if (attempt_chirho / name_chirho).is_file()
    ]
    if len(paths_chirho) != 1:
        raise ValueError("Expected exactly one explicit artwork rejection")
    return paths_chirho[0]


def validate_rejection_chirho(attempt_chirho):
    # Workflow: spec-chirho/workflows-chirho/local-reader-chirho.md (bounded art rejection).
    path_chirho = rejection_path_chirho(attempt_chirho)
    visual_chirho = path_chirho.name == "visual-rejected-chirho.json"
    receipt_chirho = load_chirho(path_chirho)
    if (
        receipt_chirho.get("outcome_chirho")
        != ("visual_rejected" if visual_chirho else "layout_rejected")
        or not receipt_chirho.get("reason_chirho")
        or (attempt_chirho / "staged-chirho.json").exists()
        or (attempt_chirho / "prepared-chirho.json").exists()
    ):
        raise ValueError("Not a clean explicit artwork rejection")
    if not (attempt_chirho / "prompt-chirho.txt").read_text().strip():
        raise ValueError("Rejected sheet lacks its prompt")
    selection_chirho = receipt_chirho.get("selection_chirho")
    candidates_chirho = load_chirho(attempt_chirho / "candidates-chirho.json")
    if (
        not isinstance(selection_chirho, list)
        or len(selection_chirho) != 16
        or len(
            {
                (
                    row_chirho["verse_id_chirho"],
                    row_chirho["token_id_chirho"],
                    *key_chirho(row_chirho),
                )
                for row_chirho in selection_chirho
            }
        )
        != 16
        or any(row_chirho not in candidates_chirho for row_chirho in selection_chirho)
    ):
        raise ValueError("Rejected sheet must identify 16 candidate occurrences")
    if len({key_chirho(row_chirho) for row_chirho in selection_chirho}) != 16 or [
        candidates_chirho.index(row_chirho) for row_chirho in selection_chirho
    ] != sorted(candidates_chirho.index(row_chirho) for row_chirho in selection_chirho):
        raise ValueError("Rejected selection must contain distinct lemmas in occurrence order")
    try:
        validate_sheet_chirho(attempt_chirho, receipt_chirho)
    except LayoutRejectedChirho as error_chirho:
        if visual_chirho:
            raise ValueError("A visual-only rejection must pass measured layout") from error_chirho
        return selection_chirho
    if visual_chirho:
        return selection_chirho
    raise ValueError("Receipt says layout rejected, but measured layout passed")


def validate_chirho(root_chirho, attempt_chirho):
    staged_chirho = load_chirho(attempt_chirho / "staged-chirho.json")
    deferred_chirho = deferrals_chirho(root_chirho)
    candidates_list_chirho = load_chirho(attempt_chirho / "candidates-chirho.json")
    candidates_map_chirho = {
        (
            row_chirho["verse_id_chirho"],
            row_chirho["token_id_chirho"],
            *key_chirho(row_chirho),
        ): row_chirho
        for row_chirho in candidates_list_chirho
    }
    for field_chirho in ("prompt_chirho", "created_at_chirho", "review_notes_chirho"):
        if (
            not isinstance(staged_chirho.get(field_chirho), str)
            or not staged_chirho[field_chirho].strip()
        ):
            raise ValueError("Missing provenance or review notes")
    if (
        staged_chirho["prompt_chirho"] != (attempt_chirho / "prompt-chirho.txt").read_text()
        or staged_chirho.get("tool_chirho") != "image_gen.imagegen"
        or staged_chirho.get("model_chirho") != "tool-managed; not exposed"
        or staged_chirho.get("grid_chirho") != [4, 4]
        or staged_chirho.get("style_reference_chirho") != STYLE_CHIRHO
    ):
        raise ValueError("Invalid generation provenance")
    validate_sheet_chirho(attempt_chirho, staged_chirho)
    sheet_chirho = attempt_chirho / "keyed-sheet-chirho.webp"
    # Re-cut independently and compare pixels so unrelated images cannot pass as cells.
    replay_chirho = attempt_chirho / "validation-replay-chirho"
    if replay_chirho.exists():
        shutil.rmtree(replay_chirho)
    subprocess.run(
        [
            sys.executable,
            str(ROOT_CHIRHO / "scripts-chirho/art-chirho/prepare_icon_sheet_chirho.py"),
            str(sheet_chirho),
            str(replay_chirho),
            "--prompt-chirho",
            str(attempt_chirho / "prompt-chirho.txt"),
        ],
        check=True,
        capture_output=True,
    )
    replay_manifest_chirho = load_chirho(replay_chirho / "manifest-chirho.json")
    cells_chirho = staged_chirho["cells_chirho"]
    if len(cells_chirho) != 16 or [
        row_chirho.get("cell_chirho") for row_chirho in cells_chirho
    ] != list(range(16)):
        raise ValueError("Expected cells 0 through 15 exactly once in order")
    selection_chirho = load_chirho(attempt_chirho / "selection-chirho.json")
    if len(selection_chirho) != 16:
        raise ValueError("Selection must contain 16 candidates")
    keys_chirho, records_chirho = set(), []
    order_chirho = []
    for cell_chirho in cells_chirho:
        identity_chirho = (
            cell_chirho["verse_id_chirho"],
            cell_chirho["token_id_chirho"],
            *key_chirho(cell_chirho),
        )
        candidate_chirho = candidates_map_chirho.get(identity_chirho)
        if (
            candidate_chirho != selection_chirho[cell_chirho["cell_chirho"]]
            or not candidate_chirho
            or key_chirho(cell_chirho) in keys_chirho
            or cell_chirho.get("source_gloss_chirho") != candidate_chirho["gloss_chirho"]
        ):
            raise ValueError("Invalid or duplicate contextual identity")
        keys_chirho.add(key_chirho(cell_chirho))
        order_chirho.append(candidates_list_chirho.index(candidate_chirho))
        alternate_chirho = "alternate_of_chirho" in candidate_chirho
        held_chirho = cell_chirho.get("sense_review_chirho") == "deferred"
        if held_chirho and (
            alternate_chirho
            or review_identity_chirho(candidate_chirho) not in deferred_chirho
            or deferred_chirho[review_identity_chirho(candidate_chirho)]["gloss_chirho"]
            != candidate_chirho["gloss_chirho"]
        ):
            raise ValueError("Deferred cell lacks a reviewed exact-context hold")
        if not held_chirho and review_identity_chirho(candidate_chirho) in deferred_chirho:
            raise ValueError("Unresolved context cannot receive a reviewed icon")
        if alternate_chirho:
            verify_alternate_chirho(root_chirho, candidate_chirho)
            if (
                cell_chirho.get("contextual_meaning_chirho")
                != candidate_chirho["contextual_meaning_chirho"]
                or cell_chirho.get("sense_id_chirho") != candidate_chirho["sense_id_chirho"]
            ):
                raise ValueError("Alternate cell changed its reviewed contextual sense")
        if (
            cell_chirho.get("sense_review_chirho") not in ("agent_reviewed", "deferred")
            or cell_chirho.get("art_review_chirho") != "pending"
            or not {"oshb-prov-chirho", "gbt-english-prov-chirho", "lexical-index-chirho"}
            <= set(cell_chirho.get("evidence_refs_chirho", []))
        ):
            raise ValueError("Missing sense review, sources, or pending art")
        for field_chirho in ("contextual_meaning_chirho", "sense_note_chirho", "alt_chirho"):
            if (
                not isinstance(cell_chirho.get(field_chirho), str)
                or not cell_chirho[field_chirho].strip()
            ):
                raise ValueError("Missing contextual review")
        rel_chirho = Path(cell_chirho["icon_path_chirho"])
        icon_chirho = (attempt_chirho / rel_chirho).resolve(strict=True)
        if (
            rel_chirho.is_absolute()
            or ".." in rel_chirho.parts
            or not icon_chirho.is_relative_to(attempt_chirho.resolve())
            or icon_chirho.suffix != ".webp"
            or digest_chirho(icon_chirho) != cell_chirho.get("icon_sha256_chirho")
        ):
            raise ValueError("Invalid icon path or hash")
        replay_icon_chirho = (
            replay_chirho
            / replay_manifest_chirho["cells_chirho"][cell_chirho["cell_chirho"]]["icon_path_chirho"]
        )
        with (
            Image.open(icon_chirho) as actual_chirho,
            Image.open(replay_icon_chirho) as expected_chirho,
        ):
            if actual_chirho.convert("RGBA").tobytes() != expected_chirho.convert("RGBA").tobytes():
                raise ValueError("Icon pixels differ from the measured sheet cut")
        with Image.open(icon_chirho) as icon_image_chirho:
            icon_image_chirho.load()
            if icon_image_chirho.format != "WEBP" or icon_image_chirho.size != (128, 128):
                raise ValueError("Icon must be 128x128 WebP")
        if held_chirho:
            continue
        id_chirho = (
            attempt_chirho.name.removeprefix("attempt-").removesuffix("-chirho")
            + f"-{cell_chirho['cell_chirho']:02d}"
        )
        shard_chirho = "0000-chirho" if cell_chirho["cell_chirho"] < 10 else "0010-chirho"
        asset_chirho = f"/assets-chirho/icons-chirho/proverbs-worker-v1-chirho/{attempt_chirho.name}/{shard_chirho}/cell-{cell_chirho['cell_chirho']:02d}-chirho.webp"
        records_chirho.append(
            {
                "id_chirho": "icon-" + id_chirho + "-chirho",
                "lesson_id_chirho": cell_chirho["verse_id_chirho"],
                "token_id_chirho": cell_chirho["token_id_chirho"],
                "lemma_id_chirho": cell_chirho["lemma_id_chirho"],
                "lemma_augment_chirho": cell_chirho.get("lemma_augment_chirho"),
                "sense_id_chirho": candidate_chirho["sense_id_chirho"]
                if alternate_chirho
                else "sense-" + id_chirho + "-chirho",
                "contextual_meaning_chirho": cell_chirho["contextual_meaning_chirho"],
                "sense_review_chirho": candidate_chirho["sense_review_chirho"]
                if alternate_chirho
                else "agent_reviewed",
                "sense_note_chirho": cell_chirho["sense_note_chirho"],
                "evidence_refs_chirho": candidate_chirho["evidence_refs_chirho"]
                if alternate_chirho
                else cell_chirho["evidence_refs_chirho"],
                "source_gloss_chirho": cell_chirho["source_gloss_chirho"],
                "asset_path_chirho": asset_chirho,
                "alt_chirho": cell_chirho["alt_chirho"],
                "width_chirho": 128,
                "height_chirho": 128,
                "sha256_chirho": cell_chirho["icon_sha256_chirho"],
                "art_review_chirho": "pending",
                "selected_chirho": not alternate_chirho,
                **(
                    {"alternate_of_chirho": candidate_chirho["alternate_of_chirho"]}
                    if alternate_chirho
                    else {}
                ),
                "display_authority_chirho": "Local contextual review; generated artwork pending L.J. review.",
            }
        )
    if order_chirho != sorted(order_chirho):
        raise ValueError("Candidates not in first occurrence order")
    if not records_chirho:
        raise ValueError("No reviewed icons remain in this sheet")
    return records_chirho


def install_chirho(root_chirho, attempt_chirho, records_chirho):
    # Workflow: staged and validated sheet -> durable checkpoint -> no-overwrite assets -> atomic catalogue.
    cells_chirho = load_chirho(attempt_chirho / "staged-chirho.json")["cells_chirho"]
    catalogue_chirho = load_chirho(root_chirho / CATALOGUES_CHIRHO[1])
    all_chirho = [
        row_chirho
        for path_chirho in CATALOGUES_CHIRHO
        for row_chirho in load_chirho(root_chirho / path_chirho)["icons_chirho"]
    ]
    if len({record_chirho["sha256_chirho"] for record_chirho in records_chirho}) != len(
        records_chirho
    ):
        raise ValueError("Duplicate image within batch")
    for record_chirho in records_chirho:
        if any(
            row_chirho.get("sha256_chirho") == record_chirho["sha256_chirho"]
            and row_chirho.get("id_chirho") != record_chirho["id_chirho"]
            for row_chirho in all_chirho
        ):
            raise ValueError("Image duplicates existing catalogue artwork")
        matches_chirho = [
            row_chirho
            for row_chirho in all_chirho
            if key_chirho(row_chirho) == key_chirho(record_chirho)
        ]
        if record_chirho.get("alternate_of_chirho"):
            source_chirho = [
                row_chirho
                for row_chirho in matches_chirho
                if row_chirho.get("id_chirho") == record_chirho["alternate_of_chirho"]
            ]
            if len(source_chirho) != 1 or any(
                row_chirho.get("id_chirho") == record_chirho["id_chirho"]
                and row_chirho != record_chirho
                for row_chirho in matches_chirho
            ):
                raise ValueError("Alternate source missing or record ID conflicts")
        elif matches_chirho and matches_chirho != [record_chirho]:
            raise ValueError("Conflicting existing contextual lemma; stop for review")
    by_hash_chirho = {
        cell_chirho["icon_sha256_chirho"]: cell_chirho for cell_chirho in cells_chirho
    }
    for record_chirho in records_chirho:
        cell_chirho = by_hash_chirho[record_chirho["sha256_chirho"]]
        source_chirho = attempt_chirho / cell_chirho["icon_path_chirho"]
        destination_chirho = root_chirho / "static" / record_chirho["asset_path_chirho"].lstrip("/")
        destination_chirho.parent.mkdir(parents=True, exist_ok=True)
        with source_chirho.open("rb") as file_chirho:
            os.fsync(file_chirho.fileno())
        try:
            os.link(source_chirho, destination_chirho)
        except FileExistsError:
            if digest_chirho(destination_chirho) != record_chirho["sha256_chirho"]:
                raise ValueError("Asset exists with different content")
        sync_dir_chirho(destination_chirho.parent)
    existing_chirho = {row_chirho["id_chirho"] for row_chirho in catalogue_chirho["icons_chirho"]}
    catalogue_chirho["icons_chirho"].extend(
        row_chirho
        for row_chirho in records_chirho
        if row_chirho["id_chirho"] not in existing_chirho
    )
    atomic_chirho(root_chirho / CATALOGUES_CHIRHO[1], catalogue_chirho)
    (attempt_chirho / "prepared-chirho.json").unlink(missing_ok=True)
    sync_dir_chirho(attempt_chirho)


def work_chirho(
    root_chirho, generator_chirho=run_generator_chirho, once_chirho=False, lemma_first_chirho=False
):
    # Workflow: shared-icons-chirho.md (lemma-first backfill and shared catalogue ownership).
    if not lemma_first_chirho:
        return work_locked_chirho(root_chirho, generator_chirho, once_chirho)
    # The new phase cannot bypass an old paid attempt or compete for its catalogue writer.
    queue_chirho = root_chirho / QUEUE_CHIRHO
    queue_chirho.mkdir(parents=True, exist_ok=True)
    with (queue_chirho / "worker.lock").open("a") as lock_chirho:
        try:
            fcntl.flock(lock_chirho, fcntl.LOCK_EX | fcntl.LOCK_NB)
        except BlockingIOError as error_chirho:
            raise RuntimeError("Another icon worker holds the catalogue lock") from error_chirho
        progress_chirho = load_chirho(queue_chirho / "progress-chirho.json")
        if progress_chirho.get("state_chirho") not in (
            "proverbs_first_pass_complete",
            "proverbs_first_pass_with_deferrals",
        ) or any(queue_chirho.glob("attempt-*/prepared-chirho.json")):
            raise RuntimeError("Original icon pass must be reconciled and finished first")
        return work_locked_chirho(root_chirho, generator_chirho, once_chirho, True)


def work_locked_chirho(root_chirho, generator_chirho, once_chirho, lemma_first_chirho=False):
    queue_chirho = root_chirho / (LEMMA_QUEUE_CHIRHO if lemma_first_chirho else QUEUE_CHIRHO)
    queue_chirho.mkdir(parents=True, exist_ok=True)
    with (queue_chirho / "worker.lock").open("a") as lock_chirho:
        try:
            fcntl.flock(lock_chirho, fcntl.LOCK_EX | fcntl.LOCK_NB)
        except BlockingIOError as error_chirho:
            raise RuntimeError("Another icon worker holds the lock") from error_chirho
        progress_chirho = queue_chirho / "progress-chirho.json"
        previous_chirho = load_chirho(progress_chirho) if progress_chirho.exists() else {}
        recovered_chirho = False
        pending_recovered_chirho = False
        for prepared_chirho in sorted(queue_chirho.glob("attempt-*/prepared-chirho.json")):
            attempt_chirho = prepared_chirho.parent
            records_chirho = validate_chirho(root_chirho, attempt_chirho)
            if records_chirho != load_chirho(prepared_chirho):
                raise ValueError("Checkpoint differs from staged evidence")
            install_chirho(root_chirho, attempt_chirho, records_chirho)
            RECOVERY_CHIRHO.resolve_chirho(queue_chirho, attempt_chirho)
            recovered_chirho = True
            if attempt_chirho.name == previous_chirho.get("attempt_chirho"):
                pending_recovered_chirho = True
        if pending_recovered_chirho:
            previous_chirho = {
                "state_chirho": "completed",
                "attempt_chirho": previous_chirho["attempt_chirho"],
            }
            atomic_chirho(progress_chirho, previous_chirho)
        if (
            recovered_chirho
            and once_chirho
            and previous_chirho.get("state_chirho")
            not in ("generating", "needs_reconciliation", "retrying_layout")
        ):
            return 0
        if previous_chirho.get("state_chirho") in (
            "generating",
            "needs_reconciliation",
            "stopped_layout",
            "waiting_for_inflight",
        ):
            name_chirho = previous_chirho.get("attempt_chirho")
            if not isinstance(name_chirho, str) or not re.fullmatch(
                r"attempt-[a-z0-9-]{8,128}", name_chirho
            ):
                raise RuntimeError("Unknown pending selection requires manual reconciliation")
            attempt_chirho = queue_chirho / name_chirho
            hold_attempt_chirho(
                queue_chirho,
                attempt_chirho,
                previous_chirho.get("error_chirho", "Prior request retained for reconciliation"),
                previous_chirho,
            )
            if RECOVERY_CHIRHO.active_chirho(attempt_chirho):
                atomic_chirho(
                    progress_chirho,
                    {
                        **previous_chirho,
                        "state_chirho": "waiting_for_inflight",
                        "held_requests_chirho": RECOVERY_CHIRHO.count_chirho(queue_chirho),
                    },
                )
                return 0
            previous_chirho = {**previous_chirho, "state_chirho": "continuing_with_holds"}
        available_chirho = candidates_chirho(root_chirho, lemma_first_chirho)
        failed_batches_chirho = previous_chirho.get("consecutive_failed_batches_chirho", 0)
        if failed_batches_chirho >= 3:
            atomic_chirho(
                progress_chirho,
                {
                    **previous_chirho,
                    "state_chirho": "waiting_for_generator",
                    "held_requests_chirho": RECOVERY_CHIRHO.count_chirho(queue_chirho),
                },
            )
            return 0
        retries_chirho = 0
        selection_chirho = None
        retry_reason_chirho = None
        if previous_chirho.get("state_chirho") == "retrying_layout":
            prior_chirho = queue_chirho / previous_chirho["attempt_chirho"]
            selection_chirho = validate_rejection_chirho(prior_chirho)
            retry_reason_chirho = load_chirho(rejection_path_chirho(prior_chirho))["reason_chirho"]
            retries_chirho = previous_chirho["rejections_chirho"]
            remaining_main_chirho = [
                row_chirho
                for row_chirho in selection_chirho
                if "alternate_of_chirho" not in row_chirho
            ]
            for row_chirho in selection_chirho:
                if "alternate_of_chirho" in row_chirho:
                    verify_alternate_chirho(root_chirho, row_chirho)
            if not 1 <= retries_chirho <= 3 or any(
                row_chirho not in available_chirho for row_chirho in remaining_main_chirho
            ):
                raise ValueError("Cannot safely resume the rejected batch")
        while not STOP_CHIRHO:
            if not available_chirho:
                deferred_count_chirho = len(deferrals_chirho(root_chirho))
                deferred_lemmas_chirho = len(first_pass_deferrals_chirho(root_chirho))
                missing_chirho = 0
                if lemma_first_chirho:
                    from refresh_sharded_media_chirho import lemma_library_chirho

                    library_chirho, _chapters_chirho = lemma_library_chirho(root_chirho)
                    pictured_chirho = {
                        key_chirho(row_chirho) for row_chirho in (library_chirho or {}).values()
                    }
                    missing_chirho = len(
                        {
                            key_chirho(row_chirho)
                            for row_chirho in load_chirho(root_chirho / INVENTORY_CHIRHO)[
                                "lemmas_chirho"
                            ]
                        }
                        - pictured_chirho
                    )
                atomic_chirho(
                    progress_chirho,
                    {
                        "state_chirho": (
                            "proverbs_lemma_first_with_deferrals"
                            if missing_chirho
                            else "proverbs_lemma_first_complete"
                        )
                        if lemma_first_chirho
                        else (
                            "proverbs_first_pass_with_deferrals"
                            if deferred_count_chirho or deferred_lemmas_chirho
                            else "proverbs_first_pass_complete"
                        ),
                        **(
                            {
                                "state_chirho": "proverbs_lemma_first_with_holds"
                                if lemma_first_chirho
                                else "proverbs_first_pass_with_holds"
                            }
                            if RECOVERY_CHIRHO.count_chirho(queue_chirho)
                            else {}
                        ),
                        "remaining_chirho": 0,
                        "held_requests_chirho": RECOVERY_CHIRHO.count_chirho(queue_chirho),
                        **({"missing_lemmas_chirho": missing_chirho} if lemma_first_chirho else {}),
                        "deferred_occurrences_chirho": deferred_count_chirho,
                        "deferred_lemmas_chirho": deferred_lemmas_chirho,
                        "message_chirho": (
                            "Eligible lemma-first queue exhausted; missing pictures and exact-context holds remain explicit. This is not full sense coverage."
                            if lemma_first_chirho
                            else "Eligible initial queue exhausted; exact-context and initial-pass lemma backlogs remain explicit. This is not full word/sense coverage."
                        ),
                    },
                )
                return 0
            batch_candidates_chirho = available_chirho
            if len(available_chirho) < 16:
                if selection_chirho is None:
                    alternates_chirho = alternate_candidates_chirho(
                        root_chirho, 16 - len(available_chirho)
                    )
                    if len(alternates_chirho) != 16 - len(available_chirho):
                        atomic_chirho(
                            progress_chirho,
                            {
                                "state_chirho": "needs_alternate_review",
                                "remaining_chirho": len(available_chirho),
                                "message_chirho": "Insufficient reviewed contextual records for a full final sheet.",
                            },
                        )
                        return 1
                    selection_chirho = available_chirho + alternates_chirho
                batch_candidates_chirho = available_chirho + [
                    row_chirho
                    for row_chirho in selection_chirho
                    if "alternate_of_chirho" in row_chirho
                ]
            attempt_chirho = queue_chirho / ("attempt-" + uuid.uuid4().hex + "-chirho")
            attempt_chirho.mkdir()
            if lemma_first_chirho:
                atomic_chirho(
                    attempt_chirho / "lemma-first-policy-chirho.json",
                    {
                        "authority_chirho": "L.J., 2026-10-29: at least one icon for each lemma, then more senses.",
                        "phase_chirho": "lemma_first",
                    },
                )
            atomic_chirho(attempt_chirho / "candidates-chirho.json", batch_candidates_chirho)
            if selection_chirho is not None:
                atomic_chirho(attempt_chirho / "selection-chirho.json", selection_chirho)
            if retry_reason_chirho:
                (attempt_chirho / "retry-note-chirho.txt").write_text(
                    retry_reason_chirho, encoding="utf-8"
                )
            atomic_chirho(
                progress_chirho,
                {
                    "state_chirho": "generating",
                    "attempt_chirho": attempt_chirho.name,
                    "rejections_chirho": retries_chirho,
                    "consecutive_failed_batches_chirho": failed_batches_chirho,
                },
            )
            try:
                generator_chirho(root_chirho, attempt_chirho)
                # Workflow: art-recovery-chirho.md (source review before further images).
                # A proposal can only hold work; root must inspect it before any resumption.
                proposal_chirho = review_proposal_chirho(attempt_chirho)
                if proposal_chirho:
                    hold_attempt_chirho(
                        queue_chirho,
                        attempt_chirho,
                        f"Source review retained in {proposal_chirho.name}",
                        {"rejections_chirho": retries_chirho},
                    )
                    available_chirho = candidates_chirho(root_chirho, lemma_first_chirho)
                    selection_chirho, retries_chirho, retry_reason_chirho = None, 0, None
                    atomic_chirho(
                        progress_chirho,
                        {
                            "state_chirho": "continuing_with_holds",
                            "attempt_chirho": attempt_chirho.name,
                            "held_requests_chirho": RECOVERY_CHIRHO.count_chirho(queue_chirho),
                            "consecutive_failed_batches_chirho": failed_batches_chirho,
                        },
                    )
                    if once_chirho:
                        return 0
                    continue
                if any(
                    (attempt_chirho / name_chirho).exists()
                    for name_chirho in (
                        "layout-rejected-chirho.json",
                        "visual-rejected-chirho.json",
                    )
                ):
                    rejected_selection_chirho = validate_rejection_chirho(attempt_chirho)
                    retry_reason_chirho = load_chirho(rejection_path_chirho(attempt_chirho))[
                        "reason_chirho"
                    ]
                    if (
                        selection_chirho is not None
                        and rejected_selection_chirho != selection_chirho
                    ):
                        raise ValueError("Retry changed the selected candidates")
                    selection_chirho = rejected_selection_chirho
                    retries_chirho += 1
                    state_chirho = "stopped_layout" if retries_chirho >= 4 else "retrying_layout"
                    atomic_chirho(
                        progress_chirho,
                        {
                            "state_chirho": state_chirho,
                            "attempt_chirho": attempt_chirho.name,
                            "rejections_chirho": retries_chirho,
                        },
                    )
                    if state_chirho == "stopped_layout":
                        hold_attempt_chirho(
                            queue_chirho,
                            attempt_chirho,
                            retry_reason_chirho,
                            {"state_chirho": state_chirho, "rejections_chirho": retries_chirho},
                        )
                        failed_batches_chirho += 1
                        selection_chirho, retries_chirho, retry_reason_chirho = None, 0, None
                        available_chirho = candidates_chirho(root_chirho, lemma_first_chirho)
                        atomic_chirho(
                            progress_chirho,
                            {
                                "state_chirho": "waiting_for_generator"
                                if failed_batches_chirho >= 3
                                else "continuing_with_holds",
                                "attempt_chirho": attempt_chirho.name,
                                "held_requests_chirho": RECOVERY_CHIRHO.count_chirho(queue_chirho),
                                "consecutive_failed_batches_chirho": failed_batches_chirho,
                            },
                        )
                        if failed_batches_chirho >= 3 or once_chirho:
                            return 0
                        continue
                    time.sleep(5 * retries_chirho)
                    continue
                if (
                    selection_chirho is not None
                    and load_chirho(attempt_chirho / "selection-chirho.json") != selection_chirho
                ):
                    raise ValueError("Retry changed the selected candidates")
                records_chirho = validate_chirho(root_chirho, attempt_chirho)
                atomic_chirho(attempt_chirho / "prepared-chirho.json", records_chirho)
                install_chirho(root_chirho, attempt_chirho, records_chirho)
                RECOVERY_CHIRHO.resolve_chirho(queue_chirho, attempt_chirho)
                failed_batches_chirho = 0
                completed_keys_chirho = {
                    key_chirho(record_chirho) for record_chirho in records_chirho
                }
                available_chirho = [
                    candidate_chirho
                    for candidate_chirho in available_chirho
                    if key_chirho(candidate_chirho) not in completed_keys_chirho
                ]
                atomic_chirho(
                    progress_chirho,
                    {"state_chirho": "completed", "attempt_chirho": attempt_chirho.name},
                )
                selection_chirho = None
                retries_chirho = 0
                retry_reason_chirho = None
            except (
                OSError,
                RuntimeError,
                ValueError,
                KeyError,
                TypeError,
                subprocess.SubprocessError,
            ) as error_chirho:
                if isinstance(error_chirho, OSError) and error_chirho.errno in (13, 28, 30, 69):
                    raise  # No further paid work when its evidence cannot be saved.
                hold_attempt_chirho(
                    queue_chirho,
                    attempt_chirho,
                    error_chirho,
                    {"rejections_chirho": retries_chirho},
                )
                failed_batches_chirho += 1
                available_chirho = candidates_chirho(root_chirho, lemma_first_chirho)
                selection_chirho, retries_chirho, retry_reason_chirho = None, 0, None
                atomic_chirho(
                    progress_chirho,
                    {
                        "state_chirho": "waiting_for_generator"
                        if failed_batches_chirho >= 3
                        else "continuing_with_holds",
                        "attempt_chirho": attempt_chirho.name,
                        "error_chirho": str(error_chirho),
                        "held_requests_chirho": RECOVERY_CHIRHO.count_chirho(queue_chirho),
                        "consecutive_failed_batches_chirho": failed_batches_chirho,
                    },
                )
                if failed_batches_chirho >= 3:
                    return 0
            if once_chirho:
                return 0
    return 0


def stop_chirho(signum_chirho, frame_chirho):
    global STOP_CHIRHO
    STOP_CHIRHO = True
    if CHILD_CHIRHO and CHILD_CHIRHO.poll() is None:
        os.killpg(CHILD_CHIRHO.pid, signal.SIGTERM)


def main_chirho():
    parser_chirho = argparse.ArgumentParser(description=__doc__)
    parser_chirho.add_argument("--once", action="store_true")
    parser_chirho.add_argument("--status", action="store_true")
    parser_chirho.add_argument("--lemma-first-chirho", action="store_true")
    args_chirho = parser_chirho.parse_args()
    if args_chirho.status:
        queue_chirho = LEMMA_QUEUE_CHIRHO if args_chirho.lemma_first_chirho else QUEUE_CHIRHO
        progress_chirho = ROOT_CHIRHO / queue_chirho / "progress-chirho.json"
        print(
            json.dumps(
                load_chirho(progress_chirho)
                if progress_chirho.exists()
                else {"state_chirho": "not_started"},
                indent=2,
            )
        )
        return 0
    signal.signal(signal.SIGINT, stop_chirho)
    signal.signal(signal.SIGTERM, stop_chirho)
    try:
        return work_chirho(
            ROOT_CHIRHO,
            once_chirho=args_chirho.once,
            lemma_first_chirho=args_chirho.lemma_first_chirho,
        )
    except (OSError, ValueError, RuntimeError, KeyError) as error_chirho:
        print(str(error_chirho), file=sys.stderr)
        return 1


if __name__ == "__main__":
    sys.exit(main_chirho())
