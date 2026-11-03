#!/usr/bin/env python3
# For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life. — John 3:16 (KJV)
"""Locked per-book icon producer with a rechecked first-pass coverage proof.

Launch: python3 scripts-chirho/art-chirho/book_icons_chirho.py {John,Gen} [--once]
Controller: completion_chirho(root, book) returns True only with no live writer,
verified ordering, pinned corpus rebuild, validated sheets and zero uncovered source
lexemes. Art remains pending, and one occurrence does not cover every possible sense.
"""

import hashlib
import json
import re as re_chirho
from pathlib import Path


class SourceWaitChirho(Exception):
    """The required book source has not arrived."""


def read_chirho(path_chirho):
    if not path_chirho.is_file():
        raise SourceWaitChirho(f"Waiting for source: {path_chirho}")
    return json.loads(path_chirho.read_text(encoding="utf-8"))


def john_candidates_chirho(root_chirho):
    """Validate John inventory against chapters; results are unreviewed, not icon mappings."""
    corpus_chirho = root_chirho / "data-chirho/corpus-chirho"
    path_chirho = corpus_chirho / "john-lemma-inventory-chirho.json"
    inventory_chirho = read_chirho(path_chirho)
    lemmas_chirho = inventory_chirho["lemmas_chirho"]
    if inventory_chirho.get("book_id_chirho") != "John" or inventory_chirho.get(
        "lemma_count_chirho"
    ) != len(lemmas_chirho):
        raise ValueError("John inventory identity or count mismatch")
    tokens_chirho = {}
    for chapter_number_chirho in range(1, 22):
        chapter_chirho = read_chirho(
            corpus_chirho / "john-chirho" / f"chapter-{chapter_number_chirho:02d}-chirho.json"
        )
        if (
            chapter_chirho.get("book_id_chirho") != "John"
            or chapter_chirho.get("chapter_chirho") != chapter_number_chirho
        ):
            raise ValueError("Chapter identity mismatch")
        for verse_chirho in chapter_chirho["verses_chirho"]:
            for token_chirho in verse_chirho["tokens_chirho"]:
                occurrence_chirho = (verse_chirho["id_chirho"], token_chirho["id_chirho"])
                if occurrence_chirho in tokens_chirho:
                    raise ValueError("Duplicate chapter token")
                tokens_chirho[occurrence_chirho] = token_chirho
    seen_lexemes_chirho, seen_occurrences_chirho, result_chirho = set(), set(), []
    for lemma_chirho in lemmas_chirho:
        lexeme_chirho = (lemma_chirho["lemma_id_chirho"], lemma_chirho["lexical_form_chirho"])
        if (
            not all(
                isinstance(value_chirho, str) and value_chirho for value_chirho in lexeme_chirho
            )
            or lexeme_chirho in seen_lexemes_chirho
        ):
            raise ValueError("Missing or duplicate full Greek lexeme")
        seen_lexemes_chirho.add(lexeme_chirho)
        occurrences_chirho = lemma_chirho["occurrences_chirho"]
        if (
            lemma_chirho["occurrence_count_chirho"] != len(occurrences_chirho)
            or not occurrences_chirho
        ):
            raise ValueError("Lemma occurrence count mismatch")
        for occurrence_chirho in occurrences_chirho:
            key_chirho = (
                occurrence_chirho["verse_id_chirho"],
                occurrence_chirho["token_id_chirho"],
            )
            if key_chirho in seen_occurrences_chirho or key_chirho not in tokens_chirho:
                raise ValueError("Duplicate or absent occurrence")
            seen_occurrences_chirho.add(key_chirho)
            token_chirho = tokens_chirho[key_chirho]
            if (
                (token_chirho.get("lemma_id_chirho"), token_chirho.get("lexical_form_chirho"))
                != lexeme_chirho
                or token_chirho.get("gloss_chirho") != occurrence_chirho.get("berean_gloss_chirho")
                or token_chirho.get("text_chirho") != occurrence_chirho.get("source_form_chirho")
            ):
                raise ValueError("Inventory and chapter occurrence disagree")
        result_chirho.append(
            {
                "lexeme_key_chirho": ["John", *lexeme_chirho],
                "occurrences_chirho": occurrences_chirho,
            }
        )
    if seen_occurrences_chirho != set(tokens_chirho) or inventory_chirho.get(
        "occurrence_count_chirho"
    ) != len(seen_occurrences_chirho):
        raise ValueError("Inventory does not cover chapter tokens")
    return result_chirho


def genesis_candidates_chirho(root_chirho):
    """Validate the separate Hebrew main/ketiv/qere source identities, without reviewing senses."""
    corpus_chirho = root_chirho / "data-chirho/corpus-chirho"
    inventory_chirho = read_chirho(corpus_chirho / "genesis-lemma-inventory-chirho.json")
    lemmas_chirho = inventory_chirho["lemmas_chirho"]
    if inventory_chirho.get("book_id_chirho") != "Gen" or inventory_chirho.get(
        "lemma_count_chirho"
    ) != len(lemmas_chirho):
        raise ValueError("Genesis inventory identity or count mismatch")
    readings_chirho = {}
    for number_chirho in range(1, 51):
        chapter_chirho = read_chirho(
            root_chirho
            / "static/content-chirho/genesis-chirho"
            / f"chapter-{number_chirho:02d}-chirho.json"
        )
        if (
            chapter_chirho.get("book_id_chirho") != "Gen"
            or chapter_chirho.get("chapter_chirho") != number_chirho
        ):
            raise ValueError("Genesis chapter identity mismatch")
        for verse_chirho in chapter_chirho["verses_chirho"]:
            for token_chirho in verse_chirho["tokens_chirho"]:
                role_chirho = "ketiv" if token_chirho.get("qere_chirho") else "main"
                for reading_chirho, part_chirho in [(role_chirho, token_chirho)] + [
                    ("qere", item_chirho) for item_chirho in token_chirho.get("qere_chirho", [])
                ]:
                    identity_chirho = (
                        verse_chirho["id_chirho"],
                        part_chirho["id_chirho"],
                        reading_chirho,
                    )
                    if identity_chirho in readings_chirho:
                        raise ValueError("Duplicate Hebrew reading occurrence")
                    readings_chirho[identity_chirho] = part_chirho
    seen_chirho, lexemes_chirho, result_chirho = set(), set(), []
    for lemma_chirho in lemmas_chirho:
        lexeme_chirho = (lemma_chirho["lemma_id_chirho"], lemma_chirho.get("lemma_augment_chirho"))
        if (
            not isinstance(lexeme_chirho[0], str)
            or not lexeme_chirho[0]
            or lexeme_chirho in lexemes_chirho
        ):
            raise ValueError("Missing or duplicate Hebrew lemma and augment")
        lexemes_chirho.add(lexeme_chirho)
        occurrences_chirho = lemma_chirho["occurrences_chirho"]
        if not occurrences_chirho or lemma_chirho["occurrence_count_chirho"] != len(
            occurrences_chirho
        ):
            raise ValueError("Hebrew occurrence count mismatch")
        for occurrence_chirho in occurrences_chirho:
            identity_chirho = (
                occurrence_chirho["verse_id_chirho"],
                occurrence_chirho["token_id_chirho"],
                occurrence_chirho["reading_chirho"],
            )
            reading_chirho = readings_chirho.get(identity_chirho)
            if identity_chirho in seen_chirho or not reading_chirho:
                raise ValueError("Duplicate or absent Hebrew occurrence")
            seen_chirho.add(identity_chirho)
            if (
                reading_chirho.get("lemma_id_chirho"),
                reading_chirho.get("lemma_augment_chirho"),
            ) != lexeme_chirho or reading_chirho.get("gloss_chirho") != occurrence_chirho.get(
                "gloss_chirho"
            ):
                raise ValueError("Hebrew inventory and chapter occurrence disagree")
        result_chirho.append(
            {"lexeme_key_chirho": ["Gen", *lexeme_chirho], "occurrences_chirho": occurrences_chirho}
        )
    if seen_chirho != set(readings_chirho) or inventory_chirho.get(
        "occurrence_count_chirho"
    ) != len(seen_chirho):
        raise ValueError("Hebrew inventory does not cover chapter readings")
    return result_chirho


def inventory_digest_chirho(root_chirho, book_chirho="John"):
    name_chirho = "john" if book_chirho == "John" else "genesis"
    path_chirho = (
        root_chirho / f"data-chirho/corpus-chirho/{name_chirho}-lemma-inventory-chirho.json"
    )
    if not path_chirho.is_file():
        raise SourceWaitChirho(f"Waiting for source: {path_chirho}")
    return hashlib.sha256(path_chirho.read_bytes()).hexdigest()


# Each book has an exclusive queue. Ordering is checked against scene state and evidence.
import argparse
import fcntl
import importlib.util
import os
import re
import shutil
import signal
import subprocess
import sys
import uuid
from contextlib import contextmanager
from datetime import UTC, datetime

from PIL import Image

SCRIPT_DIR_CHIRHO = Path(__file__).resolve().parent
ROOT_CHIRHO = SCRIPT_DIR_CHIRHO.parents[1]
if str(SCRIPT_DIR_CHIRHO) not in sys.path:
    sys.path.insert(0, str(SCRIPT_DIR_CHIRHO))


def module_chirho(name_chirho, file_chirho):
    spec_chirho = importlib.util.spec_from_file_location(
        name_chirho, SCRIPT_DIR_CHIRHO / file_chirho
    )
    module_chirho = importlib.util.module_from_spec(spec_chirho)
    spec_chirho.loader.exec_module(module_chirho)
    return module_chirho


ICON_CHIRHO = module_chirho("icon_worker_chirho", "icon_worker_chirho.py")
ORDER_CHIRHO = module_chirho("ordered_scenes_chirho", "ordered_scenes_chirho.py")
SHARDS_CHIRHO = module_chirho("refresh_sharded_media_chirho", "refresh_sharded_media_chirho.py")
REUSE_CHIRHO = module_chirho("reuse_icons_chirho", "reuse_icons_chirho.py")
VISUAL_CHIRHO = module_chirho("visual_reviews_chirho", "recovery-chirho/visual_reviews_chirho.py")
DISPOSITIONS_CHIRHO = module_chirho(
    "book_dispositions_chirho", "recovery-chirho/book_dispositions_chirho.py"
)
STYLE_CHIRHO = ICON_CHIRHO.STYLE_CHIRHO
EVIDENCE_CHIRHO = ["nestle1904-morph-chirho", "berean-glosses-chirho"]
GENESIS_EVIDENCE_CHIRHO = [
    "oshb-gen-chirho",
    "gbt-english-gen-chirho",
    "strong-chirho",
    "aug-index-chirho",
    "lexical-index-chirho",
]


def home_chirho(root_chirho, book_chirho):
    if book_chirho not in ("John", "Gen"):
        raise ValueError("Unsupported book")
    return (
        root_chirho
        / "workspace-chirho/art-chirho/queue-chirho"
        / ("john-icons-chirho" if book_chirho == "John" else "genesis-icons-chirho")
    )


def atomic_chirho(path_chirho, data_chirho):
    ICON_CHIRHO.atomic_chirho(path_chirho, data_chirho)


@contextmanager
def lock_chirho(root_chirho, book_chirho):
    folder_chirho = home_chirho(root_chirho, book_chirho)
    folder_chirho.mkdir(parents=True, exist_ok=True)
    with (folder_chirho / "worker.lock").open("a") as file_chirho:
        try:
            fcntl.flock(file_chirho, fcntl.LOCK_EX | fcntl.LOCK_NB)
        except BlockingIOError as error_chirho:
            raise RuntimeError("Book icon worker already active") from error_chirho
        yield


def john_scenes_complete_chirho(root_chirho):
    jobs_chirho = ORDER_CHIRHO.load_jobs_chirho(root_chirho, "John")
    path_chirho = ORDER_CHIRHO.manifest_path_chirho(root_chirho, "John")
    if jobs_chirho is None or not path_chirho.exists():
        return False
    manifest_chirho = read_chirho(path_chirho)
    if manifest_chirho.get("book_id_chirho") != "John":
        raise ValueError("John scenes manifest book mismatch")
    by_id_chirho = {job_chirho["id_chirho"]: job_chirho for job_chirho in jobs_chirho}
    rows_chirho = manifest_chirho["scenes_chirho"]
    identifiers_chirho = [row_chirho["lesson_id_chirho"] for row_chirho in rows_chirho]
    if len(identifiers_chirho) != len(set(identifiers_chirho)) or set(identifiers_chirho) != set(
        by_id_chirho
    ):
        return False
    for row_chirho in rows_chirho:
        ORDER_CHIRHO.verify_chirho(
            root_chirho, by_id_chirho[row_chirho["lesson_id_chirho"]], row_chirho
        )
    return True


def order_ready_chirho(root_chirho, book_chirho):
    status_path_chirho = root_chirho / ORDER_CHIRHO.HOME_CHIRHO / "status-chirho.json"
    if not status_path_chirho.exists():
        return False
    status_chirho = read_chirho(status_path_chirho)
    active_chirho = (
        status_chirho.get("state_chirho") in ("generating", "completed_verse")
        and status_chirho.get("book_chirho") == book_chirho
    )
    held_chirho = (
        book_chirho == "John" and status_chirho.get("state_chirho") == "waiting_for_john_icons"
    ) or (book_chirho == "Gen" and status_chirho.get("state_chirho") == "complete")
    if not active_chirho and not held_chirho:
        return False
    if not ORDER_CHIRHO.proverbs_complete_chirho(root_chirho):
        return False
    complete_chirho, _progress_chirho = ORDER_CHIRHO.proverbs_icons_complete_chirho(root_chirho)
    if not complete_chirho:
        return False
    if book_chirho == "John":
        return True
    if book_chirho != "Gen" or not john_scenes_complete_chirho(root_chirho):
        return False
    # Take John's writer lock while recomputing its coverage, never trusting status alone.
    with lock_chirho(root_chirho, "John"):
        return first_pass_ready_chirho(root_chirho, "John")


def pending_keys_chirho(root_chirho, book_chirho):
    """A new library picture cannot discard an already dispatched image request."""
    folder_chirho = home_chirho(root_chirho, book_chirho)
    progress_chirho = folder_chirho / "progress-chirho.json"
    if not progress_chirho.exists():
        return set()
    state_chirho = read_chirho(progress_chirho)
    if state_chirho.get("state_chirho") not in (
        "generating",
        "needs_reconciliation",
        "retrying_layout",
        "stopped_layout",
    ):
        return set()
    attempt_chirho = state_chirho.get("attempt_chirho", "")
    if not isinstance(attempt_chirho, str) or not re_chirho.fullmatch(
        r"attempt-[a-f0-9]{32}(?:-chirho)?", attempt_chirho
    ):
        raise ValueError("Pending vocabulary request has an invalid attempt identity")
    plan_chirho = folder_chirho / attempt_chirho / "plan-chirho.json"
    if not plan_chirho.resolve().is_relative_to(folder_chirho.resolve()):
        raise ValueError("Pending vocabulary plan escapes its worker folder")
    return {key_chirho(row_chirho) for row_chirho in read_chirho(plan_chirho)["cells_chirho"]}


def source_check_chirho(root_chirho, book_chirho, owned_rows_chirho=None):
    candidates_chirho = (
        john_candidates_chirho(root_chirho)
        if book_chirho == "John"
        else genesis_candidates_chirho(root_chirho)
    )
    # Rebuild from pinned upstream sources without writing, to validate both chapters and inventory.
    script_chirho = root_chirho / "scripts-chirho/corpus-chirho/build_corpus_chirho.py"
    result_chirho = subprocess.run(
        [sys.executable, "-I", "-B", str(script_chirho), "--check"],
        check=False,
        cwd=root_chirho,
        capture_output=True,
        text=True,
    )
    if result_chirho.returncode:
        raise ValueError(
            "Pinned corpus rebuild failed: "
            + (result_chirho.stderr or result_chirho.stdout)[-2000:]
        )
    # Workflow: shared-icons-chirho.md. Existing reviewed reuse saves generation; keep owned
    # generated lexemes in scope so later reuse cannot invalidate their original sheet proofs.
    reused_chirho = REUSE_CHIRHO.coverage_keys_chirho(root_chirho, book_chirho)
    library_chirho, _chapters_chirho = SHARDS_CHIRHO.lemma_library_chirho(root_chirho)
    reused_chirho.update(
        (book_chirho, lemma_chirho, form_chirho if book_chirho == "John" else augment_chirho)
        for lemma_chirho, augment_chirho, form_chirho in (library_chirho or {})
        if lemma_chirho.startswith("G") == (book_chirho == "John")
    )
    owned_chirho = {
        key_chirho(row_chirho)
        for row_chirho in (
            records_chirho(root_chirho, book_chirho)
            if owned_rows_chirho is None
            else owned_rows_chirho
        )
    }
    owned_chirho.update(pending_keys_chirho(root_chirho, book_chirho))
    return [
        row_chirho
        for row_chirho in candidates_chirho
        if key_chirho(row_chirho) not in reused_chirho or key_chirho(row_chirho) in owned_chirho
    ]


def source_snapshot_chirho(root_chirho, book_chirho="John"):
    """Bind an attempt to its exact chapters, pinned sources, inventory and style."""
    corpus_chirho = root_chirho / "data-chirho/corpus-chirho"
    name_chirho, count_chirho = ("john", 21) if book_chirho == "John" else ("genesis", 50)
    paths_chirho = [corpus_chirho / f"{name_chirho}-lemma-inventory-chirho.json"]
    chapters_chirho = (
        corpus_chirho / "john-chirho"
        if book_chirho == "John"
        else root_chirho / "static/content-chirho/genesis-chirho"
    )
    paths_chirho.extend(
        chapters_chirho / f"chapter-{number_chirho:02d}-chirho.json"
        for number_chirho in range(1, count_chirho + 1)
    )
    if book_chirho == "John":
        paths_chirho.extend(
            [
                corpus_chirho / "sources-chirho/nestle1904-chirho/morph/Nestle1904.csv",
                corpus_chirho / "sources-chirho/nestle1904-chirho/morph/parsing.txt",
                corpus_chirho
                / "sources-chirho/nestle1904-chirho/glosses/berean-interlinear-glosses.xml",
            ]
        )
    else:
        paths_chirho.extend(
            [
                corpus_chirho / "sources-chirho/morphhb-chirho/wlc/Gen.xml",
                corpus_chirho / "sources-chirho/gbt-data-chirho/eng/01-Gen.json",
                corpus_chirho / "sources-chirho/gbt-data-chirho/hbo+grc/01-Gen.json",
                root_chirho
                / "data-chirho/sources-chirho/morphhb-chirho/parsing/HebrewMorphologyCodes.html",
            ]
        )
        paths_chirho.extend(
            root_chirho / "data-chirho/sources-chirho/hebrew-lexicon-chirho" / file_chirho
            for file_chirho in ("HebrewStrong.xml", "AugIndex.xml", "LexicalIndex.xml")
        )
    paths_chirho.extend(
        [
            root_chirho / "data-chirho/sources-chirho/acquisition-manifest-chirho.json",
            corpus_chirho / "sources-chirho/acquisition-manifest-chirho.json",
            root_chirho / "static" / STYLE_CHIRHO.lstrip("/"),
        ]
    )
    for path_chirho in paths_chirho:
        if not path_chirho.is_file():
            raise SourceWaitChirho(f"Waiting for source: {path_chirho}")
    return {
        str(path_chirho.relative_to(root_chirho)): ICON_CHIRHO.digest_chirho(path_chirho)
        for path_chirho in paths_chirho
    }


def key_chirho(row_chirho):
    return tuple(row_chirho["lexeme_key_chirho"])


def plan_chirho(candidates_chirho, records_chirho):
    covered_chirho = {
        key_chirho(row_chirho)
        for row_chirho in records_chirho
        if not row_chirho["alternate_chirho"]
    }
    pending_chirho = [
        row_chirho
        for row_chirho in candidates_chirho
        if key_chirho(row_chirho) not in covered_chirho
    ]
    if not pending_chirho:
        return []
    selected_chirho = [
        {
            "lexeme_key_chirho": row_chirho["lexeme_key_chirho"],
            "occurrence_chirho": row_chirho["occurrences_chirho"][0],
            "alternate_chirho": False,
        }
        for row_chirho in pending_chirho[:16]
    ]
    # Repeat an explicitly identified primary in the same sheet. The child reviews it
    # before generation, and the validator demands identical sense evidence afterward.
    primaries_chirho = list(selected_chirho)
    while len(selected_chirho) < 16:
        primary_index_chirho = (len(selected_chirho) - len(primaries_chirho)) % len(
            primaries_chirho
        )
        selected_chirho.append(
            {
                **primaries_chirho[primary_index_chirho],
                "alternate_chirho": True,
                "alternate_of_cell_chirho": primary_index_chirho,
            }
        )
    return selected_chirho


def layout_prompt_chirho(attempt_chirho):
    retry_chirho = read_chirho(attempt_chirho / "plan-chirho.json").get("layout_retry_chirho")
    if not retry_chirho:
        return ""
    return (
        f"LAYOUT RETRY {retry_chirho['rejections_chirho']} of the existing four-attempt cap. "
        f"The prior sheet failed: {retry_chirho['reason_chirho']}. Preserve the exact planned "
        "senses and occurrence identities. Materially revise the image prompt: request a square "
        "canvas with four equal rows and columns; keep each complete composition within the "
        "central half of its cell, with very wide transparent empty gutters and outer margins. "
        "Retain the full canvas and its transparent padding. Use simpler, smaller subjects "
        "where needed for legibility. Check the actual original; never repair crossed gutters "
        "or trim the canvas to disguise the failure.\n\n"
    )


def prompt_chirho(root_chirho, attempt_chirho):
    book_chirho = read_chirho(attempt_chirho / "plan-chirho.json")["book_id_chirho"]
    language_chirho = "Greek" if book_chirho == "John" else "Hebrew"
    chapters_chirho = (
        root_chirho / "data-chirho/corpus-chirho/john-chirho"
        if book_chirho == "John"
        else root_chirho / "static/content-chirho/genesis-chirho"
    )
    source_instruction_chirho = (
        "pinned Nestle 1904 morphology and Berean interlinear files"
        if book_chirho == "John"
        else "pinned OSHB Genesis, GBT approved Genesis gloss and HebrewLexicon files"
    )
    source_path_chirho = root_chirho / "data-chirho"
    evidence_chirho = EVIDENCE_CHIRHO if book_chirho == "John" else GENESIS_EVIDENCE_CHIRHO
    return (
        layout_prompt_chirho(attempt_chirho)
        + f"""Create a 4x4 contextual {language_chirho} sticker sheet for Hinneh. Work only in {attempt_chirho}. Read plan-chirho.json in that directory. Every cell is specified in order. First examine each primary's exact {book_chirho} verse and token or reading in {chapters_chirho} and {source_instruction_chirho} in {source_path_chirho}. Review the contextual sense for that occurrence; do not present a source gloss as an already reviewed sense. Write reviews-chirho.json, an array of 16 objects in cell order. Each object contains cell_chirho (integer), lexeme_key_chirho, occurrence_chirho and alternate_chirho copied exactly from the plan, plus sense_id_chirho (globally unique: include the attempt directory name and primary cell index), contextual_meaning_chirho, sense_note_chirho (specific reasoning tied to the occurrence), evidence_refs_chirho exactly {evidence_chirho}, sense_review_chirho='agent_reviewed', art_review_chirho='pending', alt_chirho (accurate image description). Repeated cells are alternate artwork for the exact reviewed sense of alternate_of_cell_chirho; copy its sense ID, meaning, rationale and evidence. Never invent a source token. Before generating, write these reviews. Inspect the style reference {root_chirho / "static" / STYLE_CHIRHO.lstrip("/")}. Use ONLY the built-in image_gen.imagegen tool, never a paid API, other generator, or fallback. Create a transparent 4x4 sheet of sixteen distinct, centered, isolated subjects, very wide genuinely transparent gutters, no text, in the reference's consistent warm storybook sticker style, readable at 19px. Inspect the actual output. Save the original as lossless RGBA WebP sheet-original-chirho.webp; save keyed-sheet-chirho.webp by setting only alpha <= 8 to zero while retaining all other pixels. Record the actual complete generation prompt in prompt-chirho.txt. Write visual-review-chirho.json with inspected_chirho=true, sheet_sha256_chirho equal to the keyed sheet SHA-256, and notes_chirho describing your own visual inspection and its limitations. An expected no-match search (exit 1) is not a source failure; use another bounded local check. Compare a CSV source word after separating its attached punctuation, as the importer does; never normalize the Greek text. If a real source disagreement remains, before any image request write source-review-needed-chirho.json with selection_chirho copied from the planned cells, concerns_chirho containing cell_chirho and the exact sourced reason, and then stop without generating. If an optional preview fails after you have inspected the actual image, record that limitation in the visual review and continue the independently verified work. Stop for an unavailable image tool or an unverified actual image; never invent a successful inspection. Do not write other project files."""
    )


def generate_chirho(root_chirho, attempt_chirho):
    # Existing runner checks a successful Codex child and its actual image_gen rollout.
    ICON_CHIRHO.prompt_chirho = prompt_chirho
    ICON_CHIRHO.run_generator_chirho(root_chirho, attempt_chirho)


def tool_attestation_chirho(attempt_chirho):
    log_chirho = attempt_chirho / "codex-chirho.jsonl"
    events_chirho = [
        json.loads(line_chirho)
        for line_chirho in log_chirho.read_text(encoding="utf-8").splitlines()
        if line_chirho.startswith("{")
    ]
    thread_chirho = next(
        (
            event_chirho.get("thread_id")
            for event_chirho in events_chirho
            if event_chirho.get("type") == "thread.started"
        ),
        None,
    )
    if not isinstance(thread_chirho, str) or not re.fullmatch(r"[0-9a-f-]{36}", thread_chirho):
        raise ValueError("Missing generator thread identity")
    rollouts_chirho = list(
        (Path.home() / ".codex/sessions").glob(f"*/*/*/rollout-*-{thread_chirho}.jsonl")
    )
    if len(rollouts_chirho) != 1 or "tools.image_gen__imagegen(" not in rollouts_chirho[
        0
    ].read_text(encoding="utf-8"):
        raise ValueError("Built-in image generator invocation not verified")
    return {
        "thread_id_chirho": thread_chirho,
        "rollout_sha256_chirho": ICON_CHIRHO.digest_chirho(rollouts_chirho[0]),
        "log_sha256_chirho": ICON_CHIRHO.digest_chirho(log_chirho),
    }


def pixel_hash_chirho(path_chirho):
    with Image.open(path_chirho) as image_chirho:
        if image_chirho.format != "WEBP" or image_chirho.size != (128, 128):
            raise ValueError("Expected a 128x128 WebP icon")
        return hashlib.sha256(image_chirho.convert("RGBA").tobytes()).hexdigest()


def visual_review_chirho(attempt_chirho):
    return VISUAL_CHIRHO.review_chirho(attempt_chirho, allow_partial_chirho=True)


def validate_attempt_chirho(root_chirho, attempt_chirho, selected_chirho, snapshot_chirho=None):
    visual_chirho = visual_review_chirho(attempt_chirho)
    plan_doc_chirho = read_chirho(attempt_chirho / "plan-chirho.json")
    book_chirho = plan_doc_chirho.get("book_id_chirho")
    if book_chirho not in ("John", "Gen"):
        raise ValueError("Invalid book in plan")
    if snapshot_chirho is None:
        snapshot_chirho = source_snapshot_chirho(root_chirho, book_chirho)
    if (
        plan_doc_chirho.get("inventory_sha256_chirho")
        != inventory_digest_chirho(root_chirho, book_chirho)
        or plan_doc_chirho.get("source_snapshot_chirho") != snapshot_chirho
        or plan_doc_chirho.get("cells_chirho") != selected_chirho
    ):
        raise ValueError("Plan or source identity changed")
    reviews_chirho = read_chirho(attempt_chirho / "reviews-chirho.json")
    if len(reviews_chirho) != 16 or len(selected_chirho) != 16:
        raise ValueError("Expected exactly sixteen cells")
    prompt_text_chirho = (attempt_chirho / "prompt-chirho.txt").read_text(encoding="utf-8")
    if not prompt_text_chirho.strip():
        raise ValueError("Generation prompt missing")
    for index_chirho, (row_chirho, planned_chirho) in enumerate(
        zip(reviews_chirho, selected_chirho, strict=True)
    ):
        if planned_chirho["alternate_chirho"]:
            primary_index_chirho = planned_chirho.get("alternate_of_cell_chirho")
            if (
                not isinstance(primary_index_chirho, int)
                or not 0 <= primary_index_chirho < index_chirho
            ):
                raise ValueError("Invalid alternate reference")
            primary_plan_chirho = selected_chirho[primary_index_chirho]
            if primary_plan_chirho["alternate_chirho"] or any(
                planned_chirho[field_chirho] != primary_plan_chirho[field_chirho]
                for field_chirho in ("lexeme_key_chirho", "occurrence_chirho")
            ):
                raise ValueError("Alternate must reference a primary occurrence")
        if row_chirho.get("cell_chirho") != index_chirho or any(
            row_chirho.get(field_chirho) != planned_chirho[field_chirho]
            for field_chirho in ("lexeme_key_chirho", "occurrence_chirho", "alternate_chirho")
        ):
            raise ValueError("Review does not match planned occurrence")
        if (
            row_chirho.get("sense_review_chirho") != "agent_reviewed"
            or row_chirho.get("art_review_chirho") != "pending"
            or row_chirho.get("evidence_refs_chirho")
            != (EVIDENCE_CHIRHO if book_chirho == "John" else GENESIS_EVIDENCE_CHIRHO)
        ):
            raise ValueError("Missing source-specific review or pending art")
        for field_chirho in (
            "sense_id_chirho",
            "contextual_meaning_chirho",
            "sense_note_chirho",
            "alt_chirho",
        ):
            if (
                not isinstance(row_chirho.get(field_chirho), str)
                or not row_chirho[field_chirho].strip()
            ):
                raise ValueError("Incomplete contextual review")
        if planned_chirho["alternate_chirho"]:
            primary_chirho = reviews_chirho[planned_chirho["alternate_of_cell_chirho"]]
            if any(
                row_chirho[field_chirho] != primary_chirho[field_chirho]
                for field_chirho in (
                    "sense_id_chirho",
                    "contextual_meaning_chirho",
                    "sense_note_chirho",
                    "evidence_refs_chirho",
                )
            ):
                raise ValueError("Alternate changed its reviewed sense")
    original_chirho = attempt_chirho / "sheet-original-chirho.webp"
    sheet_chirho = attempt_chirho / "keyed-sheet-chirho.webp"
    if (
        visual_chirho.get("inspected_chirho") is not True
        or visual_chirho.get("sheet_sha256_chirho") != ICON_CHIRHO.digest_chirho(sheet_chirho)
        or not isinstance(visual_chirho.get("notes_chirho"), str)
        or not visual_chirho["notes_chirho"].strip()
    ):
        raise ValueError("Missing sheet-specific visual inspection")
    ICON_CHIRHO.validate_sheet_chirho(
        attempt_chirho,
        {
            "original_sha256_chirho": ICON_CHIRHO.digest_chirho(original_chirho),
            "sheet_sha256_chirho": ICON_CHIRHO.digest_chirho(sheet_chirho),
        },
    )
    cuts_chirho = attempt_chirho / "parent-cuts-chirho"
    if cuts_chirho.exists():
        shutil.rmtree(cuts_chirho)
    subprocess.run(
        [
            sys.executable,
            str(SCRIPT_DIR_CHIRHO / "prepare_icon_sheet_chirho.py"),
            str(sheet_chirho),
            str(cuts_chirho),
            "--prompt-chirho",
            str(attempt_chirho / "prompt-chirho.txt"),
        ],
        check=True,
        capture_output=True,
    )
    manifest_chirho = read_chirho(cuts_chirho / "manifest-chirho.json")
    if len(manifest_chirho["cells_chirho"]) != 16 or not all(
        cell_chirho["layout_pass_chirho"] for cell_chirho in manifest_chirho["cells_chirho"]
    ):
        raise ICON_CHIRHO.LayoutRejectedChirho("Cut layout failed")
    records_chirho = []
    included_chirho = VISUAL_CHIRHO.included_cells_chirho(visual_chirho, selected_chirho)
    for index_chirho, (review_chirho, cut_chirho) in enumerate(
        zip(reviews_chirho, manifest_chirho["cells_chirho"], strict=True)
    ):
        if index_chirho not in included_chirho:
            continue
        source_chirho = cuts_chirho / cut_chirho["icon_path_chirho"]
        shard_chirho = "0000-chirho" if index_chirho < 10 else "0010-chirho"
        book_name_chirho = "john" if book_chirho == "John" else "genesis"
        asset_chirho = f"/assets-chirho/icons-chirho/{book_name_chirho}-worker-v1-chirho/{attempt_chirho.name}/{shard_chirho}/cell-{index_chirho:02d}-chirho.webp"
        records_chirho.append(
            {
                **review_chirho,
                "alternate_of_cell_chirho": selected_chirho[index_chirho].get(
                    "alternate_of_cell_chirho"
                ),
                "asset_path_chirho": asset_chirho,
                "sha256_chirho": ICON_CHIRHO.digest_chirho(source_chirho),
                "pixel_sha256_chirho": pixel_hash_chirho(source_chirho),
            }
        )
    return {
        "book_id_chirho": book_chirho,
        "attempt_chirho": attempt_chirho.name,
        "inventory_sha256_chirho": inventory_digest_chirho(root_chirho, book_chirho),
        "tool_chirho": "image_gen.imagegen",
        "tool_attestation_chirho": tool_attestation_chirho(attempt_chirho),
        "visual_review_chirho": visual_chirho,
        "model_chirho": "tool-managed; not exposed",
        "created_at_chirho": read_chirho(attempt_chirho / "plan-chirho.json")["created_at_chirho"],
        "prompt_chirho": prompt_text_chirho,
        "grid_chirho": [4, 4],
        "style_reference_chirho": STYLE_CHIRHO,
        "style_sha256_chirho": ICON_CHIRHO.digest_chirho(
            root_chirho / "static" / STYLE_CHIRHO.lstrip("/")
        ),
        "original_sha256_chirho": ICON_CHIRHO.digest_chirho(original_chirho),
        "sheet_sha256_chirho": ICON_CHIRHO.digest_chirho(sheet_chirho),
        "records_chirho": records_chirho,
    }


def records_chirho(root_chirho, book_chirho):
    folder_chirho = home_chirho(root_chirho, book_chirho)
    index_path_chirho = folder_chirho / "index-chirho.json"
    index_chirho = (
        read_chirho(index_path_chirho)
        if index_path_chirho.exists()
        else {"book_id_chirho": book_chirho, "attempts_chirho": []}
    )
    if index_chirho.get("book_id_chirho") != book_chirho or len(
        set(index_chirho["attempts_chirho"])
    ) != len(index_chirho["attempts_chirho"]):
        raise ValueError("Invalid book catalogue")
    output_chirho, pixels_chirho, primary_keys_chirho, sense_ids_chirho = [], set(), set(), set()
    snapshot_chirho = (
        source_snapshot_chirho(root_chirho, book_chirho)
        if index_chirho["attempts_chirho"]
        else None
    )
    for name_chirho in index_chirho["attempts_chirho"]:
        if (
            not isinstance(name_chirho, str)
            or not name_chirho.startswith("attempt-")
            or not name_chirho.endswith("-chirho")
            or "/" in name_chirho
            or ".." in name_chirho
        ):
            raise ValueError("Invalid attempt name")
        attempt_chirho = folder_chirho / name_chirho
        checkpoint_chirho = read_chirho(attempt_chirho / "prepared-chirho.json")
        if (
            checkpoint_chirho.get("attempt_chirho") != name_chirho
            or checkpoint_chirho.get("book_id_chirho") != book_chirho
            or checkpoint_chirho.get("inventory_sha256_chirho")
            != inventory_digest_chirho(root_chirho, book_chirho)
        ):
            raise ValueError("Attempt source identity changed")
        planned_chirho = read_chirho(attempt_chirho / "plan-chirho.json")
        if checkpoint_chirho != validate_attempt_chirho(
            root_chirho, attempt_chirho, planned_chirho["cells_chirho"], snapshot_chirho
        ):
            raise ValueError("Stored manifest disagrees with independently validated sheet")
        for row_chirho in checkpoint_chirho["records_chirho"]:
            if not row_chirho["alternate_chirho"]:
                if key_chirho(row_chirho) in primary_keys_chirho:
                    raise ValueError("Duplicate primary lexeme")
                primary_keys_chirho.add(key_chirho(row_chirho))
                if row_chirho["sense_id_chirho"] in sense_ids_chirho:
                    raise ValueError("Duplicate primary sense ID")
                sense_ids_chirho.add(row_chirho["sense_id_chirho"])
            asset_chirho = root_chirho / "static" / row_chirho["asset_path_chirho"].lstrip("/")
            if (
                row_chirho["pixel_sha256_chirho"] in pixels_chirho
                or pixel_hash_chirho(asset_chirho) != row_chirho["pixel_sha256_chirho"]
                or ICON_CHIRHO.digest_chirho(asset_chirho) != row_chirho["sha256_chirho"]
            ):
                raise ValueError("Duplicate or altered installed artwork")
            pixels_chirho.add(row_chirho["pixel_sha256_chirho"])
            output_chirho.append(row_chirho)
    return output_chirho


def media_path_chirho(root_chirho, book_chirho):
    name_chirho = "john" if book_chirho == "John" else "genesis"
    return root_chirho / "data-chirho/media-chirho" / f"{name_chirho}-worker-icons-chirho.json"


def media_document_chirho(book_chirho, rows_chirho, candidates_chirho):
    """Project only verified occurrence-specific records into the shard manifest schema."""
    check_coverage_chirho(candidates_chirho, rows_chirho)
    icons_chirho = []
    seen_chirho, selected_chirho = set(), set()
    for row_chirho in rows_chirho:
        lexeme_chirho = row_chirho["lexeme_key_chirho"]
        occurrence_chirho = row_chirho["occurrence_chirho"]
        if len(lexeme_chirho) != 3 or lexeme_chirho[0] != book_chirho:
            raise ValueError("Media lexeme belongs to another book")
        asset_chirho = row_chirho["asset_path_chirho"]
        parts_chirho = Path(asset_chirho).parts
        attempt_chirho = parts_chirho[-3] if len(parts_chirho) >= 3 else ""
        cell_chirho = row_chirho["cell_chirho"]
        book_name_chirho = "john" if book_chirho == "John" else "genesis"
        if (
            not re.fullmatch(r"attempt-[0-9a-f]{32}-chirho", attempt_chirho)
            or type(cell_chirho) is not int
            or not 0 <= cell_chirho < 16
        ):
            raise ValueError("Invalid media attempt or cell")
        shard_chirho = "0000-chirho" if cell_chirho < 10 else "0010-chirho"
        expected_chirho = f"/assets-chirho/icons-chirho/{book_name_chirho}-worker-v1-chirho/{attempt_chirho}/{shard_chirho}/cell-{cell_chirho:02d}-chirho.webp"
        if asset_chirho != expected_chirho:
            raise ValueError("Media asset identity mismatch")
        id_chirho = f"icon-{attempt_chirho}-{cell_chirho:02d}-chirho"
        alternate_chirho = row_chirho["alternate_chirho"]
        icon_chirho = {
            "id_chirho": id_chirho,
            "lesson_id_chirho": occurrence_chirho["verse_id_chirho"],
            "token_id_chirho": occurrence_chirho["token_id_chirho"],
            "lemma_id_chirho": lexeme_chirho[1],
            "lemma_augment_chirho": None if book_chirho == "John" else lexeme_chirho[2],
            "sense_id_chirho": row_chirho["sense_id_chirho"],
            "contextual_meaning_chirho": row_chirho["contextual_meaning_chirho"],
            "asset_path_chirho": asset_chirho,
            "alt_chirho": row_chirho["alt_chirho"],
            "width_chirho": 128,
            "height_chirho": 128,
            "sha256_chirho": row_chirho["sha256_chirho"],
            "sense_review_chirho": row_chirho["sense_review_chirho"],
            "art_review_chirho": row_chirho["art_review_chirho"],
            "evidence_refs_chirho": row_chirho["evidence_refs_chirho"],
            "display_authority_chirho": "Local contextual review; generated artwork pending L.J. review.",
            "selected_chirho": not alternate_chirho,
        }
        if book_chirho == "John":
            icon_chirho["lexical_form_chirho"] = lexeme_chirho[2]
        else:
            icon_chirho["reading_chirho"] = occurrence_chirho["reading_chirho"]
        if alternate_chirho:
            primary_chirho = row_chirho["alternate_of_cell_chirho"]
            icon_chirho["alternate_of_chirho"] = (
                f"icon-{attempt_chirho}-{primary_chirho:02d}-chirho"
            )
        SHARDS_CHIRHO.sanitize_chirho(
            icon_chirho, "icon", SHARDS_CHIRHO.ICON_FIELDS_CHIRHO, 128, id_chirho
        )
        word_chirho = (icon_chirho["lesson_id_chirho"], icon_chirho["token_id_chirho"])
        if id_chirho in seen_chirho or (not alternate_chirho and word_chirho in selected_chirho):
            raise ValueError("Duplicate media ID or selected occurrence")
        seen_chirho.add(id_chirho)
        if not alternate_chirho:
            selected_chirho.add(word_chirho)
        icons_chirho.append(icon_chirho)
    return {"schema_version_chirho": 1, "book_id_chirho": book_chirho, "icons_chirho": icons_chirho}


def check_media_prefix_chirho(path_chirho, document_chirho):
    if not path_chirho.exists():
        return False
    existing_chirho = read_chirho(path_chirho)
    icons_chirho = existing_chirho.get("icons_chirho")
    if (
        set(existing_chirho) != {"schema_version_chirho", "book_id_chirho", "icons_chirho"}
        or existing_chirho.get("schema_version_chirho") != 1
        or existing_chirho.get("book_id_chirho") != document_chirho["book_id_chirho"]
        or not isinstance(icons_chirho, list)
        or icons_chirho != document_chirho["icons_chirho"][: len(icons_chirho)]
    ):
        raise ValueError("Existing media manifest diverges from validated worker evidence")
    return existing_chirho == document_chirho


def sync_media_chirho(root_chirho, book_chirho, rows_chirho, candidates_chirho):
    """Atomic, append-only projection; a crash leaves either an old or a complete valid manifest."""
    document_chirho = media_document_chirho(book_chirho, rows_chirho, candidates_chirho)
    path_chirho = media_path_chirho(root_chirho, book_chirho)
    if check_media_prefix_chirho(path_chirho, document_chirho):
        return
    if rows_chirho:
        atomic_chirho(path_chirho, document_chirho)


def install_chirho(
    root_chirho, attempt_chirho, checkpoint_chirho, existing_chirho=None, candidates_chirho=None
):
    if checkpoint_chirho.get("visual_review_chirho") != visual_review_chirho(attempt_chirho):
        raise ValueError("Prepared visual review changed before installation")
    included_chirho = VISUAL_CHIRHO.included_cells_chirho(
        checkpoint_chirho["visual_review_chirho"],
        read_chirho(attempt_chirho / "plan-chirho.json")["cells_chirho"],
    )
    cell_ids_chirho = [
        row_chirho["cell_chirho"] for row_chirho in checkpoint_chirho["records_chirho"]
    ]
    if not included_chirho or cell_ids_chirho != sorted(included_chirho):
        raise ValueError("Prepared records include excluded cells or omit accepted cells")
    book_chirho = checkpoint_chirho["book_id_chirho"]
    folder_chirho = home_chirho(root_chirho, book_chirho)
    if attempt_chirho.parent != folder_chirho:
        raise ValueError("Attempt belongs to a different book")
    if "owner_partial_review_chirho" in checkpoint_chirho["visual_review_chirho"]:
        hold_book_attempt_chirho(
            folder_chirho,
            attempt_chirho,
            "Partial owner recovery: excluded cells remain held, with no automatic regeneration",
            {"included_cells_chirho": sorted(included_chirho)},
        )
    index_path_chirho = folder_chirho / "index-chirho.json"
    index_chirho = (
        read_chirho(index_path_chirho)
        if index_path_chirho.exists()
        else {"book_id_chirho": book_chirho, "attempts_chirho": []}
    )
    if index_chirho.get("book_id_chirho") != book_chirho:
        raise ValueError("Catalogue book mismatch")
    if existing_chirho is None:
        existing_chirho = records_chirho(root_chirho, book_chirho)
    if candidates_chirho is None:
        candidates_chirho = source_check_chirho(root_chirho, book_chirho)
    already_chirho = attempt_chirho.name in index_chirho["attempts_chirho"]
    merged_chirho = (
        existing_chirho if already_chirho else existing_chirho + checkpoint_chirho["records_chirho"]
    )
    # Validate every exported occurrence and schema before installing any new asset.
    document_chirho = media_document_chirho(book_chirho, merged_chirho, candidates_chirho)
    check_media_prefix_chirho(media_path_chirho(root_chirho, book_chirho), document_chirho)
    existing_pixels_chirho = {row_chirho["pixel_sha256_chirho"] for row_chirho in existing_chirho}
    existing_senses_chirho = {
        row_chirho["sense_id_chirho"]
        for row_chirho in existing_chirho
        if not row_chirho["alternate_chirho"]
    }
    new_senses_chirho = [
        row_chirho["sense_id_chirho"]
        for row_chirho in checkpoint_chirho["records_chirho"]
        if not row_chirho["alternate_chirho"]
    ]
    if attempt_chirho.name not in index_chirho["attempts_chirho"] and (
        len(set(new_senses_chirho)) != len(new_senses_chirho)
        or existing_senses_chirho.intersection(new_senses_chirho)
    ):
        raise ValueError("Duplicate primary sense ID")
    new_pixels_chirho = [
        row_chirho["pixel_sha256_chirho"] for row_chirho in checkpoint_chirho["records_chirho"]
    ]
    if len(set(new_pixels_chirho)) != len(included_chirho) or (
        not already_chirho and existing_pixels_chirho.intersection(new_pixels_chirho)
    ):
        raise ValueError("Duplicate image pixels")
    cut_manifest_chirho = read_chirho(attempt_chirho / "parent-cuts-chirho/manifest-chirho.json")
    for row_chirho in checkpoint_chirho["records_chirho"]:
        cut_chirho = cut_manifest_chirho["cells_chirho"][row_chirho["cell_chirho"]]
        source_chirho = attempt_chirho / "parent-cuts-chirho" / cut_chirho["icon_path_chirho"]
        destination_chirho = root_chirho / "static" / row_chirho["asset_path_chirho"].lstrip("/")
        destination_chirho.parent.mkdir(parents=True, exist_ok=True)
        with source_chirho.open("rb") as file_chirho:
            os.fsync(file_chirho.fileno())
        try:
            os.link(source_chirho, destination_chirho)
        except FileExistsError:
            if ICON_CHIRHO.digest_chirho(destination_chirho) != row_chirho["sha256_chirho"]:
                raise ValueError("Refusing to overwrite an existing asset")
        ICON_CHIRHO.sync_dir_chirho(destination_chirho.parent)
    for row_chirho in merged_chirho:
        asset_chirho = root_chirho / "static" / row_chirho["asset_path_chirho"].lstrip("/")
        if (
            ICON_CHIRHO.digest_chirho(asset_chirho) != row_chirho["sha256_chirho"]
            or pixel_hash_chirho(asset_chirho) != row_chirho["pixel_sha256_chirho"]
        ):
            raise ValueError("Installed media changed before manifest commit")
    if not already_chirho:
        index_chirho["attempts_chirho"].append(attempt_chirho.name)
        atomic_chirho(index_path_chirho, index_chirho)
    sync_media_chirho(root_chirho, book_chirho, merged_chirho, candidates_chirho)


def check_coverage_chirho(candidates_chirho, rows_chirho):
    by_key_chirho = {key_chirho(row_chirho): row_chirho for row_chirho in candidates_chirho}
    for row_chirho in rows_chirho:
        candidate_chirho = by_key_chirho.get(key_chirho(row_chirho))
        if (
            not candidate_chirho
            or row_chirho["occurrence_chirho"] not in candidate_chirho["occurrences_chirho"]
        ):
            raise ValueError("Reviewed record does not match its source occurrence")


def first_pass_data_chirho(root_chirho, book_chirho):
    candidates_chirho = source_check_chirho(root_chirho, book_chirho)
    folder_chirho = home_chirho(root_chirho, book_chirho)
    progress_path_chirho = folder_chirho / "progress-chirho.json"
    if (
        not progress_path_chirho.exists()
        or read_chirho(progress_path_chirho).get("state_chirho") != "first_pass_complete"
    ):
        return False
    rows_chirho = records_chirho(root_chirho, book_chirho)
    check_coverage_chirho(candidates_chirho, rows_chirho)
    path_chirho = media_path_chirho(root_chirho, book_chirho)
    if not path_chirho.is_file() or read_chirho(path_chirho) != media_document_chirho(
        book_chirho, rows_chirho, candidates_chirho
    ):
        return False
    candidate_keys_chirho = {key_chirho(row_chirho) for row_chirho in candidates_chirho}
    primary_chirho = [
        row_chirho for row_chirho in rows_chirho if not row_chirho["alternate_chirho"]
    ]
    return {
        key_chirho(row_chirho) for row_chirho in primary_chirho
    } == candidate_keys_chirho and len(primary_chirho) == len(candidate_keys_chirho)


def completion_chirho(root_chirho, book_chirho="John"):
    """Recompute first-pass coverage with the book locked; False means not proven."""
    with lock_chirho(root_chirho, book_chirho):
        if not order_ready_chirho(root_chirho, book_chirho):
            return False
        return first_pass_data_chirho(root_chirho, book_chirho)


def first_pass_ready_chirho(root_chirho, book_chirho):
    """Queue readiness may include exact owner deferrals; full coverage proof stays separate."""
    folder_chirho = home_chirho(root_chirho, book_chirho)
    progress_path_chirho = folder_chirho / "progress-chirho.json"
    if not progress_path_chirho.is_file():
        return False
    state_chirho = read_chirho(progress_path_chirho).get("state_chirho")
    if state_chirho == "first_pass_complete":
        return first_pass_data_chirho(root_chirho, book_chirho)
    if (
        state_chirho != "first_pass_with_holds"
        or not DISPOSITIONS_CHIRHO.path_chirho(root_chirho, book_chirho).is_file()
    ):
        return False
    rows_chirho = records_chirho(root_chirho, book_chirho)
    candidates_chirho = source_check_chirho(root_chirho, book_chirho, rows_chirho)
    check_coverage_chirho(candidates_chirho, rows_chirho)
    if read_chirho(media_path_chirho(root_chirho, book_chirho)) != media_document_chirho(
        book_chirho, rows_chirho, candidates_chirho
    ):
        return False
    return DISPOSITIONS_CHIRHO.check_chirho(
        root_chirho,
        book_chirho,
        candidates_chirho,
        rows_chirho,
        source_snapshot_chirho(root_chirho, book_chirho),
        inventory_digest_chirho(root_chirho, book_chirho),
        VISUAL_CHIRHO,
        ICON_CHIRHO.RECOVERY_CHIRHO,
    )


def readiness_chirho(root_chirho, book_chirho="John"):
    with lock_chirho(root_chirho, book_chirho):
        if not order_ready_chirho(root_chirho, book_chirho):
            return False
        return first_pass_ready_chirho(root_chirho, book_chirho)


def hold_book_attempt_chirho(folder_chirho, attempt_chirho, reason_chirho, checkpoint_chirho):
    plan_doc_chirho = read_chirho(attempt_chirho / "plan-chirho.json")
    ICON_CHIRHO.RECOVERY_CHIRHO.hold_chirho(
        folder_chirho,
        attempt_chirho,
        "lexeme",
        [row_chirho["lexeme_key_chirho"] for row_chirho in plan_doc_chirho["cells_chirho"]],
        reason_chirho,
        checkpoint_chirho,
    )


def eligible_book_candidates_chirho(folder_chirho, candidates_chirho, recovering_chirho=None):
    blocked_chirho = {
        ICON_CHIRHO.RECOVERY_CHIRHO.key_chirho(item_chirho)
        for row_chirho in ICON_CHIRHO.RECOVERY_CHIRHO.read_chirho(folder_chirho)["holds_chirho"]
        if row_chirho["scope_chirho"] == "lexeme"
        and row_chirho["attempt_chirho"] != recovering_chirho
        for item_chirho in row_chirho["items_chirho"]
    }
    return [
        row_chirho
        for row_chirho in candidates_chirho
        if ICON_CHIRHO.RECOVERY_CHIRHO.key_chirho(list(key_chirho(row_chirho)))
        not in blocked_chirho
    ]


def work_chirho(
    root_chirho,
    book_chirho="John",
    generator_chirho=generate_chirho,
    once_chirho=False,
    gate_chirho=order_ready_chirho,
    source_chirho=source_check_chirho,
):
    with lock_chirho(root_chirho, book_chirho):
        folder_chirho = home_chirho(root_chirho, book_chirho)
        progress_chirho = folder_chirho / "progress-chirho.json"
        if not gate_chirho(root_chirho, book_chirho):
            waiting_chirho = "waiting_for_proverbs" if book_chirho == "John" else "waiting_for_john"
            if not progress_chirho.exists():
                atomic_chirho(progress_chirho, {"state_chirho": waiting_chirho})
            return waiting_chirho
        try:
            snapshot_chirho = source_snapshot_chirho(root_chirho, book_chirho)
            candidates_chirho = source_chirho(root_chirho, book_chirho)
            if snapshot_chirho != source_snapshot_chirho(root_chirho, book_chirho):
                raise ValueError("Source changed during verification")
        except SourceWaitChirho as error_chirho:
            previous_chirho = read_chirho(progress_chirho) if progress_chirho.exists() else {}
            if previous_chirho.get("state_chirho") not in (
                "generating",
                "needs_reconciliation",
                "retrying_layout",
                "stopped_layout",
            ):
                atomic_chirho(
                    progress_chirho,
                    {"state_chirho": "waiting_for_source", "reason_chirho": str(error_chirho)},
                )
            return "waiting_for_source"
        previous_chirho = read_chirho(progress_chirho) if progress_chirho.exists() else {}
        if previous_chirho.get("state_chirho") in (
            "generating",
            "needs_reconciliation",
            "waiting_for_inflight",
            "stopped_layout",
            "continuing_with_holds",
        ):
            attempt_chirho = folder_chirho / previous_chirho["attempt_chirho"]
            checkpoint_path_chirho = attempt_chirho / "prepared-chirho.json"
            if not checkpoint_path_chirho.exists():
                hold_book_attempt_chirho(
                    folder_chirho,
                    attempt_chirho,
                    previous_chirho.get(
                        "reason_chirho", "Prior image request retained for reconciliation"
                    ),
                    previous_chirho,
                )
                if ICON_CHIRHO.RECOVERY_CHIRHO.active_chirho(attempt_chirho):
                    atomic_chirho(
                        progress_chirho, {**previous_chirho, "state_chirho": "waiting_for_inflight"}
                    )
                    return "waiting_for_inflight"
                previous_chirho = {**previous_chirho, "state_chirho": "continuing_with_holds"}
            else:
                checkpoint_chirho = read_chirho(checkpoint_path_chirho)
                selection_chirho = read_chirho(attempt_chirho / "plan-chirho.json")["cells_chirho"]
                existing_chirho = records_chirho(root_chirho, book_chirho)
                check_coverage_chirho(candidates_chirho, existing_chirho)
                indexed_chirho = (
                    read_chirho(folder_chirho / "index-chirho.json")["attempts_chirho"]
                    if (folder_chirho / "index-chirho.json").exists()
                    else []
                )
                if attempt_chirho.name not in indexed_chirho and selection_chirho != plan_chirho(
                    eligible_book_candidates_chirho(
                        folder_chirho, candidates_chirho, attempt_chirho.name
                    ),
                    existing_chirho,
                ):
                    raise ValueError("Recovery plan no longer matches source")
                if checkpoint_chirho != validate_attempt_chirho(
                    root_chirho, attempt_chirho, selection_chirho
                ):
                    raise ValueError("Prepared evidence changed")
                install_chirho(
                    root_chirho,
                    attempt_chirho,
                    checkpoint_chirho,
                    existing_chirho,
                    candidates_chirho,
                )
                if "owner_partial_review_chirho" not in checkpoint_chirho["visual_review_chirho"]:
                    ICON_CHIRHO.RECOVERY_CHIRHO.resolve_chirho(folder_chirho, attempt_chirho)
                atomic_chirho(
                    progress_chirho,
                    {"state_chirho": "completed_sheet", "attempt_chirho": attempt_chirho.name},
                )
                if once_chirho:
                    return "completed_sheet"
        failed_batches_chirho = previous_chirho.get("consecutive_failed_batches_chirho", 0)
        if failed_batches_chirho >= 3:
            return "waiting_for_generator"
        retries_chirho = 0
        layout_retry_chirho = None
        selection_chirho = None
        if previous_chirho.get("state_chirho") == "retrying_layout":
            retries_chirho = previous_chirho["rejections_chirho"]
            layout_retry_chirho = previous_chirho
            prior_chirho = folder_chirho / previous_chirho["attempt_chirho"]
            if not 1 <= retries_chirho < 4:
                raise ValueError("Invalid layout retry count")
            if (
                ICON_CHIRHO.digest_chirho(prior_chirho / "sheet-original-chirho.webp")
                != previous_chirho["original_sha256_chirho"]
                or ICON_CHIRHO.digest_chirho(prior_chirho / "keyed-sheet-chirho.webp")
                != previous_chirho["sheet_sha256_chirho"]
            ):
                raise ValueError("Rejected sheet changed")
            try:
                ICON_CHIRHO.validate_sheet_chirho(prior_chirho, previous_chirho)
            except ICON_CHIRHO.LayoutRejectedChirho:
                pass
            else:
                raise ValueError("Recorded layout rejection does not reproduce")
            selection_chirho = read_chirho(prior_chirho / "plan-chirho.json")["cells_chirho"]
        existing_chirho = records_chirho(root_chirho, book_chirho)
        check_coverage_chirho(candidates_chirho, existing_chirho)
        sync_media_chirho(root_chirho, book_chirho, existing_chirho, candidates_chirho)
        while True:
            if ICON_CHIRHO.STOP_CHIRHO:
                return "stopped"
            selection_now_chirho = plan_chirho(
                eligible_book_candidates_chirho(folder_chirho, candidates_chirho), existing_chirho
            )
            if not selection_now_chirho:
                held_count_chirho = ICON_CHIRHO.RECOVERY_CHIRHO.count_chirho(folder_chirho)
                terminal_chirho = (
                    "first_pass_with_holds" if held_count_chirho else "first_pass_complete"
                )
                atomic_chirho(
                    progress_chirho,
                    {
                        "state_chirho": terminal_chirho,
                        "remaining_chirho": 0,
                        "held_requests_chirho": held_count_chirho,
                        "shared_lexemes_chirho": len(
                            REUSE_CHIRHO.coverage_keys_chirho(root_chirho, book_chirho)
                        ),
                        "scope_chirho": "one reviewed contextual sense per source lexeme, with shared vocabulary counted separately; art review states preserved",
                    },
                )
                return terminal_chirho
            if selection_chirho is None:
                selection_chirho = selection_now_chirho
            elif selection_chirho != selection_now_chirho:
                raise ValueError("Retry selection no longer matches source")
            if source_snapshot_chirho(root_chirho, book_chirho) != snapshot_chirho:
                raise ValueError("Source changed since verification")
            attempt_chirho = folder_chirho / ("attempt-" + uuid.uuid4().hex + "-chirho")
            attempt_chirho.mkdir()
            atomic_chirho(
                attempt_chirho / "plan-chirho.json",
                {
                    "book_id_chirho": book_chirho,
                    "created_at_chirho": datetime.now(UTC).isoformat(),
                    "inventory_sha256_chirho": inventory_digest_chirho(root_chirho, book_chirho),
                    "source_snapshot_chirho": snapshot_chirho,
                    "cells_chirho": selection_chirho,
                    **({"layout_retry_chirho": layout_retry_chirho} if layout_retry_chirho else {}),
                },
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
                proposal_chirho = ICON_CHIRHO.review_proposal_chirho(attempt_chirho)
                if proposal_chirho:
                    hold_book_attempt_chirho(
                        folder_chirho,
                        attempt_chirho,
                        f"Source review retained in {proposal_chirho.name}",
                        read_chirho(progress_chirho),
                    )
                    atomic_chirho(
                        progress_chirho,
                        {
                            "state_chirho": "continuing_with_holds",
                            "attempt_chirho": attempt_chirho.name,
                            "consecutive_failed_batches_chirho": failed_batches_chirho,
                        },
                    )
                    selection_chirho, retries_chirho, layout_retry_chirho = None, 0, None
                    if once_chirho:
                        return "continuing_with_holds"
                    continue
                checkpoint_chirho = validate_attempt_chirho(
                    root_chirho, attempt_chirho, selection_chirho
                )
                atomic_chirho(attempt_chirho / "prepared-chirho.json", checkpoint_chirho)
                install_chirho(
                    root_chirho,
                    attempt_chirho,
                    checkpoint_chirho,
                    existing_chirho,
                    candidates_chirho,
                )
                existing_chirho.extend(checkpoint_chirho["records_chirho"])
                if "owner_partial_review_chirho" not in checkpoint_chirho["visual_review_chirho"]:
                    ICON_CHIRHO.RECOVERY_CHIRHO.resolve_chirho(folder_chirho, attempt_chirho)
                failed_batches_chirho = 0
                atomic_chirho(
                    progress_chirho,
                    {"state_chirho": "completed_sheet", "attempt_chirho": attempt_chirho.name},
                )
            except ICON_CHIRHO.LayoutRejectedChirho as error_chirho:
                retries_chirho += 1
                state_chirho = "stopped_layout" if retries_chirho >= 4 else "retrying_layout"
                layout_retry_chirho = {
                    "rejections_chirho": retries_chirho,
                    "attempt_chirho": attempt_chirho.name,
                    "reason_chirho": str(error_chirho),
                }
                atomic_chirho(
                    progress_chirho,
                    {
                        "state_chirho": state_chirho,
                        "attempt_chirho": attempt_chirho.name,
                        "rejections_chirho": retries_chirho,
                        "reason_chirho": str(error_chirho),
                        "original_sha256_chirho": ICON_CHIRHO.digest_chirho(
                            attempt_chirho / "sheet-original-chirho.webp"
                        ),
                        "sheet_sha256_chirho": ICON_CHIRHO.digest_chirho(
                            attempt_chirho / "keyed-sheet-chirho.webp"
                        ),
                    },
                )
                if state_chirho == "stopped_layout":
                    hold_book_attempt_chirho(
                        folder_chirho,
                        attempt_chirho,
                        str(error_chirho),
                        read_chirho(progress_chirho),
                    )
                    failed_batches_chirho += 1
                    selection_chirho, retries_chirho, layout_retry_chirho = None, 0, None
                    state_chirho = (
                        "waiting_for_generator"
                        if failed_batches_chirho >= 3
                        else "continuing_with_holds"
                    )
                    atomic_chirho(
                        progress_chirho,
                        {
                            "state_chirho": state_chirho,
                            "attempt_chirho": attempt_chirho.name,
                            "consecutive_failed_batches_chirho": failed_batches_chirho,
                        },
                    )
                    if once_chirho or failed_batches_chirho >= 3:
                        return state_chirho
                continue
            except (
                SourceWaitChirho,
                OSError,
                RuntimeError,
                ValueError,
                KeyError,
                TypeError,
                subprocess.SubprocessError,
            ) as error_chirho:
                if isinstance(error_chirho, OSError) and error_chirho.errno in (13, 28, 30, 69):
                    raise
                hold_book_attempt_chirho(
                    folder_chirho, attempt_chirho, str(error_chirho), read_chirho(progress_chirho)
                )
                if source_snapshot_chirho(root_chirho, book_chirho) != snapshot_chirho:
                    raise ValueError(
                        "Source changed during generation; no further requests"
                    ) from error_chirho
                failed_batches_chirho += 1
                state_chirho = (
                    "waiting_for_generator"
                    if failed_batches_chirho >= 3
                    else "continuing_with_holds"
                )
                atomic_chirho(
                    progress_chirho,
                    {
                        "state_chirho": state_chirho,
                        "attempt_chirho": attempt_chirho.name,
                        "reason_chirho": str(error_chirho),
                        "consecutive_failed_batches_chirho": failed_batches_chirho,
                    },
                )
                if once_chirho or failed_batches_chirho >= 3:
                    return state_chirho
                selection_chirho, retries_chirho, layout_retry_chirho = None, 0, None
                continue
            if once_chirho:
                return "completed_sheet"
            selection_chirho, retries_chirho = None, 0
            layout_retry_chirho = None


def main_chirho():
    parser_chirho = argparse.ArgumentParser(description="Ordered John and Genesis icon worker")
    parser_chirho.add_argument("book_chirho", choices=["John", "Gen"])
    parser_chirho.add_argument("--once", action="store_true")
    parser_chirho.add_argument("--proof", action="store_true")
    options_chirho = parser_chirho.parse_args()
    signal.signal(signal.SIGINT, ICON_CHIRHO.stop_chirho)
    signal.signal(signal.SIGTERM, ICON_CHIRHO.stop_chirho)
    try:
        if options_chirho.proof:
            complete_chirho = completion_chirho(ROOT_CHIRHO, options_chirho.book_chirho)
            print("first_pass_complete" if complete_chirho else "not_proven")
            return 0 if complete_chirho else 1
        state_chirho = work_chirho(
            ROOT_CHIRHO, options_chirho.book_chirho, once_chirho=options_chirho.once
        )
        print(state_chirho)
        return (
            0
            if state_chirho
            in (
                "completed_sheet",
                "first_pass_complete",
                "first_pass_with_holds",
                "continuing_with_holds",
                "waiting_for_inflight",
                "waiting_for_generator",
            )
            else 1
        )
    except (
        SourceWaitChirho,
        OSError,
        ValueError,
        RuntimeError,
        KeyError,
        TypeError,
        subprocess.SubprocessError,
    ) as error_chirho:
        print(str(error_chirho), file=sys.stderr)
        return 1


if __name__ == "__main__":
    sys.exit(main_chirho())
