#!/usr/bin/env python3
# For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life. — John 3:16 (KJV)
"""Publish sanitized, chapter-sharded media indexes under static/media-chirho/.

Contract v1 (spec-chirho/research-chirho/26-10-27-publication-readiness-chirho.md): every
book has summary-chirho.json, and every chapter with media has chapter-NN-chirho.json. Inputs
are the media manifests in data-chirho/media-chirho/. Any invalid input refuses the whole
refresh and leaves the last good shards in place.
"""

import argparse
import hashlib
import importlib.util
import json
import os
import re
import signal
import stat
import tempfile
import time
import unicodedata
from pathlib import Path

ROOT_CHIRHO = Path(__file__).resolve().parents[2]
REMOTE_SPEC_CHIRHO = importlib.util.spec_from_file_location(
    "remote_artwork_chirho",
    Path(__file__).resolve().parents[1]
    / "publish-chirho/r2-chirho/remote_artwork_chirho.py",
)
REMOTE_ARTWORK_CHIRHO = importlib.util.module_from_spec(REMOTE_SPEC_CHIRHO)
REMOTE_SPEC_CHIRHO.loader.exec_module(REMOTE_ARTWORK_CHIRHO)
BOOKS_CHIRHO = {
    book_chirho["id_chirho"]: (
        book_chirho["slug_chirho"],
        book_chirho["chapter_count_chirho"],
    )
    for book_chirho in json.loads(
        (ROOT_CHIRHO / "config-chirho/bible-chirho/books-chirho.json").read_bytes()
    )["books_chirho"]
}
BOOK_PATTERN_CHIRHO = (
    "(?:" + "|".join(re.escape(book_chirho) for book_chirho in BOOKS_CHIRHO) + ")"
)

SCENE_FIELDS_CHIRHO = (
    "lesson_id",
    "asset_path",
    "alt",
    "width",
    "height",
    "sha256",
    "art_review",
    "reading_note",
)
ICON_FIELDS_CHIRHO = (
    "id",
    "lesson_id",
    "token_id",
    "lemma_id",
    "lemma_augment",
    "sense_id",
    "contextual_meaning",
    "asset_path",
    "alt",
    "width",
    "height",
    "sha256",
    "sense_review",
    "art_review",
    "evidence_refs",
    "display_authority",
    "selected",
)
# Optional exact lexical form (required for Greek lemmas, whose Strong numbers can be shared).
CONTEXT_FIELDS_CHIRHO = ("context_text", "context_gloss", "context_canonical_text")
ICON_ORDER_CHIRHO = (
    *ICON_FIELDS_CHIRHO[:5],
    "lexical_form",
    *ICON_FIELDS_CHIRHO[5:],
    *CONTEXT_FIELDS_CHIRHO,
)
KINDS_CHIRHO = {
    "scenes_chirho": ("scene", SCENE_FIELDS_CHIRHO, 4096),
    "icons_chirho": ("icon", ICON_FIELDS_CHIRHO, 128),
}
SHARD_LIMIT_CHIRHO = 2 * 1024 * 1024  # the reader's per-response limit
INPUT_LIMIT_CHIRHO = 64 * 1024 * 1024
RECORD_LIMIT_CHIRHO = 100_000
TEXT_LIMIT_CHIRHO = 2000
POLL_SECONDS_CHIRHO = 3
TEMP_PREFIX_CHIRHO = ".shard-chirho-"
LESSON_CHIRHO = re.compile(
    "(" + BOOK_PATTERN_CHIRHO + r")\.([1-9][0-9]{0,2})\.([1-9][0-9]{0,2})"
)
ASSET_CHIRHO = re.compile(
    r"/assets-chirho/(?:[a-z0-9][a-z0-9-]*/)*[a-z0-9][a-z0-9-]*\.webp"
)
SHA256_CHIRHO = re.compile(r"[a-f0-9]{64}")
SLUG_CHIRHO = re.compile(r"[a-z0-9][a-z0-9-]{0,127}")
OSHB_TOKEN_CHIRHO = re.compile(r"[A-Za-z0-9]{1,16}")
# Positional word ids such as John.1.1!2 name their own verse, which must be the record's lesson.
POSITION_TOKEN_CHIRHO = re.compile(
    "(" + BOOK_PATTERN_CHIRHO + r"\.[1-9][0-9]{0,2}\.[1-9][0-9]{0,2})![1-9][0-9]{0,2}"
)
# Strong-style H/G numbers, or the OSHB prefix-particle domain (oshb:b, oshb:l, oshb:m, ...).
LEMMA_CHIRHO = re.compile(r"[HG][1-9][0-9]{0,4}|oshb:[bcdiklms]")
AUGMENT_CHIRHO = re.compile(r"[a-z]{1,2}")
CHAPTER_FILE_CHIRHO = re.compile(r"chapter-[0-9]{2,3}-chirho\.json")
PRIVATE_CHIRHO = re.compile(
    r"/Users/|/private/|/home/|/tmp/|/var/folders/|~/|file:|[A-Za-z]:\\"
)
BIDI_CONTROLS_CHIRHO = frozenset(
    "\u202a\u202b\u202c\u202d\u202e\u2066\u2067\u2068\u2069"
)
STOP_CHIRHO = False
LIBRARY_POLICY_CHIRHO = Path("config-chirho/lemma-icon-library-chirho.json")


class RefusalChirho(ValueError):
    """An input that must not reach the public shards."""


def stop_chirho(_signal_chirho, _frame_chirho):
    global STOP_CHIRHO
    STOP_CHIRHO = True


def read_json_chirho(path_chirho):
    info_chirho = path_chirho.lstat()
    if (
        not stat.S_ISREG(info_chirho.st_mode)
        or info_chirho.st_size > INPUT_LIMIT_CHIRHO
    ):
        raise RefusalChirho(f"{path_chirho.name} is not a bounded regular file")
    try:
        data_chirho = json.loads(path_chirho.read_bytes().decode("utf-8"))
    except (UnicodeDecodeError, json.JSONDecodeError) as error_chirho:
        raise RefusalChirho(f"{path_chirho.name} is not UTF-8 JSON") from error_chirho
    if not isinstance(data_chirho, dict):
        raise RefusalChirho(f"{path_chirho.name} is not a JSON object")
    return data_chirho


def text_chirho(value_chirho, label_chirho):
    """Public text stays code-point exact; only unsafe content is refused, never rewritten."""
    if (
        not isinstance(value_chirho, str)
        or not value_chirho.strip()
        or len(value_chirho) > TEXT_LIMIT_CHIRHO
        or any(
            unicodedata.category(char_chirho) == "Cc" for char_chirho in value_chirho
        )
        or BIDI_CONTROLS_CHIRHO.intersection(value_chirho)
        or PRIVATE_CHIRHO.search(value_chirho)
    ):
        raise RefusalChirho(f"{label_chirho} is not safe public text")
    return value_chirho


def match_chirho(pattern_chirho, value_chirho, label_chirho):
    if not isinstance(value_chirho, str) or not pattern_chirho.fullmatch(value_chirho):
        raise RefusalChirho(f"{label_chirho} has an invalid format")
    return value_chirho


def verse_counts_chirho(root_chirho):
    """Source verse membership, preserving edition gaps; absent manifests stay bounded to 200."""
    counts_chirho = {}
    for book_chirho, (folder_chirho, _) in BOOKS_CHIRHO.items():
        path_chirho = (
            root_chirho
            / "static/content-chirho"
            / folder_chirho
            / "manifest-chirho.json"
        )
        if not path_chirho.exists():
            continue
        manifest_chirho = read_json_chirho(path_chirho)
        if manifest_chirho.get("book_id_chirho") != book_chirho:
            raise RefusalChirho(f"{folder_chirho} content manifest names another book")
        for entry_chirho in manifest_chirho.get("chapters_chirho", []):
            count_chirho = entry_chirho["verse_count_chirho"]
            if type(count_chirho) is not int or not 1 <= count_chirho <= 200:
                raise RefusalChirho(f"{folder_chirho} has an invalid verse count")
            numbers_chirho = entry_chirho.get(
                "verse_numbers_chirho", list(range(1, count_chirho + 1))
            )
            if (
                not isinstance(numbers_chirho, list)
                or len(numbers_chirho) != count_chirho
                or any(
                    type(number_chirho) is not int or not 1 <= number_chirho <= 200
                    for number_chirho in numbers_chirho
                )
                or numbers_chirho != sorted(set(numbers_chirho))
            ):
                raise RefusalChirho(
                    f"{folder_chirho} has invalid source verse numbering"
                )
            counts_chirho[(book_chirho, entry_chirho["number_chirho"])] = frozenset(
                numbers_chirho
            )
    return counts_chirho


def presentation_texts_chirho(root_chirho):
    """Alt text and reading notes that curated scenes keep in their presentation records."""
    texts_chirho = {}
    for path_chirho in sorted(
        (root_chirho / "data-chirho/reader-chirho").glob("*-presentation-chirho.json")
    ):
        record_chirho = read_json_chirho(path_chirho)
        if isinstance(record_chirho.get("asset_path_chirho"), str):
            texts_chirho[record_chirho["asset_path_chirho"]] = {
                key_chirho: record_chirho[key_chirho]
                for key_chirho in ("alt_chirho", "reading_note_chirho")
                if key_chirho in record_chirho
            }
    return texts_chirho


def sanitize_chirho(item_chirho, kind_chirho, fields_chirho, edge_chirho, label_chirho):
    if not isinstance(item_chirho, dict):
        raise RefusalChirho(f"{label_chirho} is not an object")
    missing_chirho = [
        field_chirho
        for field_chirho in fields_chirho
        if f"{field_chirho}_chirho" not in item_chirho
    ]
    if missing_chirho:
        raise RefusalChirho(f"{label_chirho} lacks {', '.join(missing_chirho)}")
    order_chirho = (
        ICON_ORDER_CHIRHO if kind_chirho == "icon" else (*fields_chirho, "variant")
    )
    record_chirho = {
        f"{field_chirho}_chirho": item_chirho[f"{field_chirho}_chirho"]
        for field_chirho in order_chirho
        if field_chirho in fields_chirho or f"{field_chirho}_chirho" in item_chirho
    }
    match_chirho(
        ASSET_CHIRHO, record_chirho["asset_path_chirho"], f"{label_chirho} asset_path"
    )
    match_chirho(
        SHA256_CHIRHO, record_chirho["sha256_chirho"], f"{label_chirho} sha256"
    )
    for field_chirho in ("width_chirho", "height_chirho"):
        value_chirho = record_chirho[field_chirho]
        if type(value_chirho) is not int or not 0 < value_chirho <= edge_chirho:
            raise RefusalChirho(
                f"{label_chirho} {field_chirho} is outside 1..{edge_chirho}"
            )
    if record_chirho["art_review_chirho"] not in ("pending", "approved"):
        raise RefusalChirho(f"{label_chirho} has an invalid art review")
    if kind_chirho == "scene" and record_chirho.get(
        "variant_chirho", "standard"
    ) not in (
        "standard",
        "representation_reduced",
    ):
        raise RefusalChirho(f"{label_chirho} has an invalid scene variant")
    text_fields_chirho = (
        ("alt", "reading_note")
        if kind_chirho == "scene"
        else ("alt", "contextual_meaning", "display_authority")
    )
    for field_chirho in text_fields_chirho:
        text_chirho(
            record_chirho[f"{field_chirho}_chirho"], f"{label_chirho} {field_chirho}"
        )
    if kind_chirho == "icon":
        if any(
            f"{field_chirho}_chirho" in record_chirho
            for field_chirho in CONTEXT_FIELDS_CHIRHO
        ):
            for field_chirho in CONTEXT_FIELDS_CHIRHO:
                # A pinned lexical mnemonic can cite an explicitly unavailable verse gloss.
                # It is emitted only as a lemma default, never as a contextual selection.
                if (
                    field_chirho == "context_gloss"
                    and "context_gloss_chirho" in record_chirho
                    and record_chirho["context_gloss_chirho"] is None
                    and isinstance(item_chirho.get("meaning_evidence_chirho"), dict)
                    and item_chirho["meaning_evidence_chirho"].get("kind_chirho")
                    in ("pinned_lexical_definition", "documented_lexical_review")
                ):
                    continue
                text_chirho(
                    record_chirho.get(f"{field_chirho}_chirho"),
                    f"{label_chirho} {field_chirho}",
                )
        match_chirho(SLUG_CHIRHO, record_chirho["id_chirho"], f"{label_chirho} id")
        match_chirho(
            SLUG_CHIRHO, record_chirho["sense_id_chirho"], f"{label_chirho} sense_id"
        )
        token_chirho = record_chirho["token_id_chirho"]
        position_chirho = (
            POSITION_TOKEN_CHIRHO.fullmatch(token_chirho)
            if isinstance(token_chirho, str)
            else None
        )
        if position_chirho and position_chirho[1] != record_chirho["lesson_id_chirho"]:
            raise RefusalChirho(f"{label_chirho} token_id names another verse")
        if not position_chirho:
            match_chirho(OSHB_TOKEN_CHIRHO, token_chirho, f"{label_chirho} token_id")
        match_chirho(
            LEMMA_CHIRHO, record_chirho["lemma_id_chirho"], f"{label_chirho} lemma_id"
        )
        if "lexical_form_chirho" in record_chirho:
            form_chirho = text_chirho(
                record_chirho["lexical_form_chirho"], f"{label_chirho} lexical_form"
            )
            if len(form_chirho) > 128:
                raise RefusalChirho(f"{label_chirho} lexical_form is too long")
        elif record_chirho["lemma_id_chirho"].startswith("G"):
            raise RefusalChirho(f"{label_chirho} needs the exact Greek lexical form")
        if record_chirho["lemma_augment_chirho"] is not None:
            match_chirho(
                AUGMENT_CHIRHO,
                record_chirho["lemma_augment_chirho"],
                f"{label_chirho} lemma_augment",
            )
        if record_chirho["sense_review_chirho"] not in (
            "agent_reviewed",
            "human_reviewed",
        ):
            raise RefusalChirho(f"{label_chirho} has an unreviewed sense")
        refs_chirho = record_chirho["evidence_refs_chirho"]
        if not isinstance(refs_chirho, list) or not 0 < len(refs_chirho) <= 32:
            raise RefusalChirho(f"{label_chirho} needs 1..32 evidence references")
        for ref_chirho in refs_chirho:
            match_chirho(SLUG_CHIRHO, ref_chirho, f"{label_chirho} evidence reference")
        if type(record_chirho["selected_chirho"]) is not bool:
            raise RefusalChirho(f"{label_chirho} selected must be true or false")
    return record_chirho


def lesson_chirho(value_chirho, verses_chirho, label_chirho):
    found_chirho = (
        LESSON_CHIRHO.fullmatch(value_chirho) if isinstance(value_chirho, str) else None
    )
    if not found_chirho:
        raise RefusalChirho(f"{label_chirho} has an invalid lesson id")
    book_chirho, chapter_chirho, verse_chirho = (
        found_chirho[1],
        int(found_chirho[2]),
        int(found_chirho[3]),
    )
    allowed_chirho = verses_chirho.get((book_chirho, chapter_chirho))
    if chapter_chirho > BOOKS_CHIRHO[book_chirho][1] or (
        verse_chirho not in allowed_chirho
        if allowed_chirho is not None
        else verse_chirho > 200
    ):
        raise RefusalChirho(f"{label_chirho} points outside {book_chirho}")
    return book_chirho, chapter_chirho, verse_chirho


def webp_size_chirho(path_chirho):
    """Canvas size from the RIFF/VP8* header only; the publisher hashes the full bytes."""
    try:
        info_chirho = path_chirho.lstat()
    except FileNotFoundError as error_chirho:
        raise RefusalChirho(
            f"{path_chirho.name} is declared but missing"
        ) from error_chirho
    if not stat.S_ISREG(info_chirho.st_mode):
        raise RefusalChirho(f"{path_chirho.name} is not a regular file")
    with path_chirho.open("rb") as file_chirho:
        head_chirho = file_chirho.read(30)
    if (
        len(head_chirho) < 30
        or head_chirho[:4] != b"RIFF"
        or head_chirho[8:12] != b"WEBP"
        or int.from_bytes(head_chirho[4:8], "little") != info_chirho.st_size - 8
    ):
        raise RefusalChirho(f"{path_chirho.name} is not a complete WebP file")
    chunk_chirho = head_chirho[12:16]
    if chunk_chirho == b"VP8 " and head_chirho[23:26] == b"\x9d\x01\x2a":
        return (
            int.from_bytes(head_chirho[26:28], "little") & 0x3FFF,
            int.from_bytes(head_chirho[28:30], "little") & 0x3FFF,
        )
    if chunk_chirho == b"VP8L" and head_chirho[20] == 0x2F:
        bits_chirho = int.from_bytes(head_chirho[21:25], "little")
        return (bits_chirho & 0x3FFF) + 1, ((bits_chirho >> 14) & 0x3FFF) + 1
    if chunk_chirho == b"VP8X":
        return int.from_bytes(head_chirho[24:27], "little") + 1, int.from_bytes(
            head_chirho[27:30], "little"
        ) + 1
    raise RefusalChirho(f"{path_chirho.name} has an unsupported WebP header")


def collect_chirho(root_chirho, include_fallbacks_chirho=False):
    """All public scene and icon records with their (book, chapter, verse), fail-closed."""
    verses_chirho = verse_counts_chirho(root_chirho)
    presentations_chirho = presentation_texts_chirho(root_chirho)
    found_chirho = {"scene": [], "icon": []}
    for path_chirho in sorted(
        (root_chirho / "data-chirho/media-chirho").glob("*.json")
    ):
        manifest_chirho = read_json_chirho(path_chirho)
        version_chirho = manifest_chirho.get("schema_version_chirho")
        if type(version_chirho) is not int or version_chirho != 1:
            raise RefusalChirho(f"{path_chirho.name} is not schema version 1")
        inherited_chirho = manifest_chirho.get("lesson_id_chirho")
        for key_chirho, items_chirho in manifest_chirho.items():
            if not isinstance(items_chirho, list):
                continue
            if key_chirho not in KINDS_CHIRHO:
                raise RefusalChirho(
                    f"{path_chirho.name} has an unknown media array {key_chirho}"
                )
            kind_chirho, fields_chirho, edge_chirho = KINDS_CHIRHO[key_chirho]
            for index_chirho, item_chirho in enumerate(items_chirho):
                label_chirho = f"{path_chirho.name} {key_chirho}[{index_chirho}]"
                if isinstance(item_chirho, dict):
                    item_chirho = dict(item_chirho)
                    if (
                        "lesson_id_chirho" not in item_chirho
                        and inherited_chirho is not None
                    ):
                        item_chirho["lesson_id_chirho"] = inherited_chirho
                    if kind_chirho == "scene":
                        for field_chirho, value_chirho in presentations_chirho.get(
                            item_chirho.get("asset_path_chirho"), {}
                        ).items():
                            item_chirho.setdefault(field_chirho, value_chirho)
                record_chirho = sanitize_chirho(
                    item_chirho, kind_chirho, fields_chirho, edge_chirho, label_chirho
                )
                if "fallback_chirho" in item_chirho:
                    if (
                        kind_chirho != "scene"
                        or type(item_chirho["fallback_chirho"]) is not bool
                        or (
                            item_chirho["fallback_chirho"]
                            and record_chirho.get("variant_chirho", "standard")
                            != "standard"
                        )
                    ):
                        raise RefusalChirho(
                            f"{label_chirho} has an invalid scene fallback"
                        )
                    record_chirho["fallback_chirho"] = item_chirho["fallback_chirho"]
                location_chirho = lesson_chirho(
                    record_chirho["lesson_id_chirho"], verses_chirho, label_chirho
                )
                found_chirho[kind_chirho].append((location_chirho, record_chirho))
                if (
                    len(found_chirho["scene"]) + len(found_chirho["icon"])
                    > RECORD_LIMIT_CHIRHO
                ):
                    raise RefusalChirho("too many media records")
    check_invariants_chirho(root_chirho, found_chirho, include_fallbacks_chirho)
    return found_chirho


def check_invariants_chirho(root_chirho, found_chirho, include_fallbacks_chirho=False):
    lessons_chirho, ids_chirho, selected_chirho, facts_chirho = {}, set(), set(), {}
    tiers_chirho, chosen_fallback_chirho = set(), {}
    for _, record_chirho in found_chirho["scene"]:
        key_chirho = (
            record_chirho["lesson_id_chirho"],
            record_chirho.get("variant_chirho", "standard"),
        )
        fallback_chirho = record_chirho.pop("fallback_chirho", False)
        tier_key_chirho = (*key_chirho, fallback_chirho)
        if tier_key_chirho in tiers_chirho:
            raise RefusalChirho(f"two scenes for {key_chirho}")
        tiers_chirho.add(tier_key_chirho)
        if (
            key_chirho not in lessons_chirho
            or chosen_fallback_chirho[key_chirho]
            and not fallback_chirho
        ):
            lessons_chirho[key_chirho] = record_chirho
            chosen_fallback_chirho[key_chirho] = fallback_chirho
    for (lesson_id_chirho, variant_chirho), record_chirho in lessons_chirho.items():
        if variant_chirho == "representation_reduced":
            standard_chirho = lessons_chirho.get((lesson_id_chirho, "standard"))
            if not standard_chirho or (
                standard_chirho["asset_path_chirho"]
                == record_chirho["asset_path_chirho"]
                or standard_chirho["sha256_chirho"] == record_chirho["sha256_chirho"]
            ):
                raise RefusalChirho("a reduced scene needs its distinct Standard scene")
    for _, record_chirho in found_chirho["icon"]:
        if record_chirho["id_chirho"] in ids_chirho:
            raise RefusalChirho(f"icon id {record_chirho['id_chirho']} repeats")
        ids_chirho.add(record_chirho["id_chirho"])
        if record_chirho["selected_chirho"]:
            word_chirho = (
                record_chirho["lesson_id_chirho"],
                record_chirho["token_id_chirho"],
            )
            if word_chirho in selected_chirho:
                raise RefusalChirho(
                    f"two selected icons for {word_chirho[0]} {word_chirho[1]}"
                )
            selected_chirho.add(word_chirho)
    for kind_chirho, entries_chirho in found_chirho.items():
        for _, record_chirho in entries_chirho:
            fact_chirho = (
                kind_chirho,
                record_chirho["sha256_chirho"],
                record_chirho["width_chirho"],
                record_chirho["height_chirho"],
                record_chirho["art_review_chirho"],
            )
            if (
                facts_chirho.setdefault(record_chirho["asset_path_chirho"], fact_chirho)
                != fact_chirho
            ):
                raise RefusalChirho(
                    f"{record_chirho['asset_path_chirho']} is declared with different facts"
                )
    for asset_chirho, fact_chirho in sorted(facts_chirho.items()):
        source_artwork_fact_chirho(
            root_chirho,
            {
                "asset_path_chirho": asset_chirho,
                "sha256_chirho": fact_chirho[1],
                "width_chirho": fact_chirho[2],
                "height_chirho": fact_chirho[3],
            },
            fact_chirho[0],
        )
    # Workflow: media-delivery-chirho.md. Validate retained fallbacks too; only then select
    # the higher-quality record for the reading line. Authored files remain declared/served.
    if include_fallbacks_chirho:
        return
    found_chirho["scene"] = [
        (location_chirho, record_chirho)
        for location_chirho, record_chirho in found_chirho["scene"]
        if lessons_chirho[
            (
                record_chirho["lesson_id_chirho"],
                record_chirho.get("variant_chirho", "standard"),
            )
        ]
        is record_chirho
    ]


def encode_chirho(document_chirho, label_chirho):
    data_chirho = (
        json.dumps(document_chirho, ensure_ascii=False, indent=2) + "\n"
    ).encode("utf-8")
    if len(data_chirho) > SHARD_LIMIT_CHIRHO:
        raise RefusalChirho(f"{label_chirho} would exceed {SHARD_LIMIT_CHIRHO} bytes")
    return data_chirho


def lemma_key_chirho(record_chirho):
    """Full lexical identity; prefixes and inflections share it, homographs never do."""
    lemma_chirho = record_chirho["lemma_id_chirho"]
    return (
        lemma_chirho,
        record_chirho.get("lemma_augment_chirho"),
        record_chirho.get("lexical_form_chirho")
        if lemma_chirho.startswith("G")
        else None,
    )


def source_artwork_fact_chirho(root_chirho, record_chirho, kind_chirho=None):
    """Use checked local bytes when present, otherwise the exact sealed R2 source proof."""
    path_chirho = (
        root_chirho / "static" / record_chirho["asset_path_chirho"].lstrip("/")
    )
    if not path_chirho.resolve().is_relative_to((root_chirho / "static").resolve()):
        raise RefusalChirho("Artwork source escapes static root")
    if path_chirho.exists():
        if (
            webp_size_chirho(path_chirho)
            != (record_chirho["width_chirho"], record_chirho["height_chirho"])
            or hashlib.sha256(path_chirho.read_bytes()).hexdigest()
            != record_chirho["sha256_chirho"]
        ):
            raise RefusalChirho("Artwork source bytes or size changed")
        return {
            "bytes_chirho": path_chirho.stat().st_size,
            "sha256_chirho": record_chirho["sha256_chirho"],
            "width_chirho": record_chirho["width_chirho"],
            "height_chirho": record_chirho["height_chirho"],
        }
    proof_chirho = REMOTE_ARTWORK_CHIRHO.source_fact_chirho(
        root_chirho, record_chirho, kind_chirho
    )
    if proof_chirho is None:
        raise RefusalChirho("Missing artwork has no verified remote source")
    return proof_chirho["matched_fact_chirho"]


def lemma_corpus_chirho(root_chirho):
    words_chirho, chapters_chirho = {}, {}
    for book_chirho, (folder_chirho, _) in BOOKS_CHIRHO.items():
        base_chirho = root_chirho / "static/content-chirho" / folder_chirho
        path_chirho = base_chirho / "manifest-chirho.json"
        if not path_chirho.exists():
            continue
        manifest_chirho = read_json_chirho(path_chirho)
        if manifest_chirho.get("book_id_chirho") != book_chirho:
            raise RefusalChirho("Lemma library manifest names another book")
        for entry_chirho in manifest_chirho["chapters_chirho"]:
            number_chirho = entry_chirho["number_chirho"]
            name_chirho = f"chapter-{number_chirho:02d}-chirho.json"
            if (
                entry_chirho.get("path_chirho")
                != f"/content-chirho/{folder_chirho}/{name_chirho}"
            ):
                raise RefusalChirho("Lemma library chapter path is not canonical")
            chapter_path_chirho = base_chirho / name_chirho
            chapter_chirho = read_json_chirho(chapter_path_chirho)
            if (
                hashlib.sha256(chapter_path_chirho.read_bytes()).hexdigest()
                != entry_chirho["sha256_chirho"]
                or chapter_chirho.get("book_id_chirho") != book_chirho
                or chapter_chirho.get("chapter_chirho") != number_chirho
            ):
                raise RefusalChirho(
                    "Lemma library corpus bytes or chapter identity changed"
                )
            keys_chirho = chapters_chirho.setdefault(
                (book_chirho, number_chirho), set()
            )
            for verse_chirho in chapter_chirho["verses_chirho"]:
                for token_chirho in verse_chirho["tokens_chirho"]:
                    for reading_chirho in (
                        token_chirho,
                        *token_chirho.get("qere_chirho", []),
                    ):
                        identity_chirho = (
                            verse_chirho["id_chirho"],
                            reading_chirho["id_chirho"],
                        )
                        if identity_chirho in words_chirho:
                            raise RefusalChirho(
                                "Lemma library corpus repeats a word identity"
                            )
                        words_chirho[identity_chirho] = reading_chirho
                    if (
                        token_chirho.get("lemma_assignment_status_chirho")
                        != "source_review_required"
                    ):
                        keys_chirho.add(lemma_key_chirho(token_chirho))
    return words_chirho, chapters_chirho


def lemma_library_chirho(root_chirho):
    """Workflow: shared-icons-chirho.md. First selected source picture per exact lemma."""
    policy_path_chirho = root_chirho / LIBRARY_POLICY_CHIRHO
    if not policy_path_chirho.exists():
        return None, {}
    policy_chirho = read_json_chirho(policy_path_chirho)
    names_chirho = policy_chirho.get("source_manifests_chirho")
    if (
        policy_chirho.get("schema_version_chirho") != 1
        or not isinstance(names_chirho, list)
        or not 1 <= len(names_chirho) <= 16
        or any(
            not isinstance(name_chirho, str)
            or not re.fullmatch(r"[a-z0-9-]+-icons-chirho\.json", name_chirho)
            for name_chirho in names_chirho
        )
        or len(set(names_chirho)) != len(names_chirho)
    ):
        raise RefusalChirho("Invalid bounded lemma icon source policy")
    words_chirho, chapters_chirho = lemma_corpus_chirho(root_chirho)
    library_chirho, verified_chirho = {}, set()
    for name_chirho in names_chirho:
        path_chirho = root_chirho / "data-chirho/media-chirho" / name_chirho
        if not path_chirho.exists():
            continue  # Later books have not generated their own vocabulary pictures yet.
        document_chirho = read_json_chirho(path_chirho)
        if document_chirho.get("schema_version_chirho") != 1 or not isinstance(
            document_chirho.get("icons_chirho"), list
        ):
            raise RefusalChirho("Invalid source icon catalogue in lemma library")
        for source_chirho in document_chirho["icons_chirho"]:
            source_chirho = {
                **source_chirho,
                "lesson_id_chirho": source_chirho.get(
                    "lesson_id_chirho", document_chirho.get("lesson_id_chirho")
                ),
            }
            row_chirho = sanitize_chirho(
                source_chirho, "icon", ICON_FIELDS_CHIRHO, 128, name_chirho
            )
            if not row_chirho["selected_chirho"]:
                continue
            word_chirho = words_chirho.get(
                (row_chirho["lesson_id_chirho"], row_chirho["token_id_chirho"])
            )
            if word_chirho is None or lemma_key_chirho(word_chirho) != lemma_key_chirho(
                row_chirho
            ):
                raise RefusalChirho(
                    "Lemma default disagrees with its source word identity"
                )
            if (
                "context_gloss_chirho" in row_chirho
                and row_chirho["context_gloss_chirho"] is None
                and (
                    "gloss_chirho" not in word_chirho
                    or word_chirho["gloss_chirho"] is not None
                    or word_chirho.get("text_chirho")
                    != row_chirho["context_text_chirho"]
                )
            ):
                raise RefusalChirho("Lexical-only picture source changed")
            asset_chirho = root_chirho / "static" / row_chirho["asset_path_chirho"][1:]
            if not asset_chirho.resolve().is_relative_to(
                (root_chirho / "static").resolve()
            ):
                raise RefusalChirho("Lemma picture escapes static assets")
            if row_chirho["asset_path_chirho"] not in verified_chirho:
                source_artwork_fact_chirho(root_chirho, row_chirho, "icon")
                verified_chirho.add(row_chirho["asset_path_chirho"])
            for field_chirho in CONTEXT_FIELDS_CHIRHO:
                row_chirho.pop(f"{field_chirho}_chirho", None)
            library_chirho.setdefault(lemma_key_chirho(row_chirho), row_chirho)
            # The measured 66-book inventory has 14,425 full lemma identities. Chapter
            # delivery remains independently bounded at 2 MiB and 4,096 defaults.
            if len(library_chirho) > 20_000:
                raise RefusalChirho("Lemma picture library exceeds its bounded scope")
    return library_chirho, chapters_chirho


def shards_chirho(
    found_chirho, library_chirho=None, chapter_keys_chirho=None, root_chirho=None
):
    """Relative output path -> bytes: one summary per book, one index per chapter with media."""
    outputs_chirho = {}
    remote_chirho = False
    if root_chirho is not None:
        policy_chirho = root_chirho / "config-chirho/media-library-chirho.json"
        remote_chirho = (
            policy_chirho.exists()
            and read_json_chirho(policy_chirho).get("storage_mode_chirho") == "r2"
        )

    def delivered_chirho(record_chirho, kind_chirho):
        if not remote_chirho:
            return record_chirho
        entry_chirho = REMOTE_ARTWORK_CHIRHO.source_fact_chirho(
            root_chirho, record_chirho, kind_chirho
        )
        if entry_chirho is None:
            raise RefusalChirho("Remote delivery lacks checked artwork")
        return {
            **record_chirho,
            **{
                field_chirho: entry_chirho["delivery_chirho"][field_chirho]
                for field_chirho in ("sha256_chirho", "width_chirho", "height_chirho")
            },
        }

    for book_chirho, (folder_chirho, _) in BOOKS_CHIRHO.items():
        chapters_chirho = {}
        book_lemmas_chirho = set()
        if library_chirho is not None:
            for (
                key_book_chirho,
                number_chirho,
            ), keys_chirho in chapter_keys_chirho.items():
                matched_chirho = keys_chirho.intersection(library_chirho)
                if key_book_chirho == book_chirho and matched_chirho:
                    chapters_chirho[number_chirho] = {"scene": [], "icon": []}
                    book_lemmas_chirho.update(matched_chirho)
        for kind_chirho in ("scene", "icon"):
            for (
                book_found_chirho,
                chapter_chirho,
                verse_chirho,
            ), record_chirho in found_chirho[kind_chirho]:
                if book_found_chirho == book_chirho:
                    chapters_chirho.setdefault(
                        chapter_chirho, {"scene": [], "icon": []}
                    )[kind_chirho].append((verse_chirho, record_chirho))
        entries_chirho = []
        for chapter_chirho in sorted(chapters_chirho):
            groups_chirho = chapters_chirho[chapter_chirho]
            scenes_chirho = [
                record_chirho
                for _, record_chirho in sorted(
                    groups_chirho["scene"],
                    key=lambda pair_chirho: (
                        pair_chirho[0],
                        pair_chirho[1]["asset_path_chirho"],
                    ),
                )
            ]
            icons_chirho = [
                record_chirho
                for _, record_chirho in sorted(
                    groups_chirho["icon"],
                    key=lambda pair_chirho: (
                        pair_chirho[0],
                        pair_chirho[1]["token_id_chirho"],
                        pair_chirho[1]["id_chirho"],
                    ),
                )
                if record_chirho.get("context_gloss_chirho", "legacy") is not None
            ]
            name_chirho = f"chapter-{chapter_chirho:02d}-chirho.json"
            defaults_chirho = (
                [
                    library_chirho[key_chirho]
                    for key_chirho in sorted(
                        chapter_keys_chirho.get(
                            (book_chirho, chapter_chirho), set()
                        ).intersection(library_chirho),
                        key=lambda key_chirho: json.dumps(
                            key_chirho, ensure_ascii=False
                        ),
                    )
                ]
                if library_chirho is not None
                else []
            )
            scenes_chirho = [
                delivered_chirho(row_chirho, "scene") for row_chirho in scenes_chirho
            ]
            icons_chirho = [
                delivered_chirho(row_chirho, "icon") for row_chirho in icons_chirho
            ]
            defaults_chirho = [
                delivered_chirho(row_chirho, "icon") for row_chirho in defaults_chirho
            ]
            data_chirho = encode_chirho(
                {
                    "schema_version_chirho": 1,
                    "book_id_chirho": book_chirho,
                    "chapter_chirho": chapter_chirho,
                    "scenes_chirho": scenes_chirho,
                    "icons_chirho": icons_chirho,
                    **(
                        {"lemma_icons_chirho": defaults_chirho}
                        if library_chirho is not None
                        else {}
                    ),
                },
                f"{folder_chirho}/{name_chirho}",
            )
            outputs_chirho[f"{folder_chirho}/{name_chirho}"] = data_chirho
            entries_chirho.append(
                {
                    "number_chirho": chapter_chirho,
                    "path_chirho": f"/media-chirho/{folder_chirho}/{name_chirho}",
                    "sha256_chirho": hashlib.sha256(data_chirho).hexdigest(),
                    "scene_count_chirho": len(scenes_chirho),
                    "icon_count_chirho": len(icons_chirho),
                    **(
                        {"lemma_icon_count_chirho": len(defaults_chirho)}
                        if library_chirho is not None
                        else {}
                    ),
                }
            )
        outputs_chirho[f"{folder_chirho}/summary-chirho.json"] = encode_chirho(
            {
                "schema_version_chirho": 1,
                "book_id_chirho": book_chirho,
                "scene_count_chirho": sum(
                    entry_chirho["scene_count_chirho"]
                    for entry_chirho in entries_chirho
                ),
                "icon_count_chirho": sum(
                    entry_chirho["icon_count_chirho"] for entry_chirho in entries_chirho
                ),
                "chapters_chirho": entries_chirho,
                **(
                    {"lemma_icon_count_chirho": len(book_lemmas_chirho)}
                    if library_chirho is not None
                    else {}
                ),
            },
            f"{folder_chirho}/summary-chirho.json",
        )
    return outputs_chirho


def replace_chirho(target_chirho, data_chirho):
    temp_chirho = None
    try:
        with tempfile.NamedTemporaryFile(
            dir=target_chirho.parent, prefix=TEMP_PREFIX_CHIRHO, delete=False
        ) as file_chirho:
            temp_chirho = Path(file_chirho.name)
            file_chirho.write(data_chirho)
            file_chirho.flush()
            os.fsync(file_chirho.fileno())
        temp_chirho.chmod(0o644)
        os.replace(temp_chirho, target_chirho)
    finally:
        if temp_chirho is not None:
            temp_chirho.unlink(missing_ok=True)


def write_chirho(root_chirho, outputs_chirho):
    """Chapter files first, summaries second, stale chapters last; unchanged bytes stay put."""
    base_chirho = root_chirho / "static/media-chirho"
    if base_chirho.is_symlink():
        raise RefusalChirho("static/media-chirho must be a real directory")
    changes_chirho = 0
    for folder_chirho, _ in BOOKS_CHIRHO.values():
        folder_path_chirho = base_chirho / folder_chirho
        if folder_path_chirho.is_symlink():
            raise RefusalChirho(f"{folder_chirho} must be a real directory")
        folder_path_chirho.mkdir(parents=True, exist_ok=True)
        for stale_chirho in folder_path_chirho.glob(f"{TEMP_PREFIX_CHIRHO}*"):
            stale_chirho.unlink(missing_ok=True)
    ordered_chirho = sorted(
        outputs_chirho,
        key=lambda name_chirho: (
            name_chirho.endswith("summary-chirho.json"),
            name_chirho,
        ),
    )
    for name_chirho in ordered_chirho:
        target_chirho = base_chirho / name_chirho
        try:
            if (
                target_chirho.lstat().st_size == len(outputs_chirho[name_chirho])
                and target_chirho.read_bytes() == outputs_chirho[name_chirho]
            ):
                continue
        except FileNotFoundError:
            pass
        replace_chirho(target_chirho, outputs_chirho[name_chirho])
        changes_chirho += 1
    for folder_chirho, _ in BOOKS_CHIRHO.values():
        for path_chirho in sorted((base_chirho / folder_chirho).iterdir()):
            if (
                CHAPTER_FILE_CHIRHO.fullmatch(path_chirho.name)
                and f"{folder_chirho}/{path_chirho.name}" not in outputs_chirho
            ):
                path_chirho.unlink()
                changes_chirho += 1
    return changes_chirho


# Workflow: spec-chirho/research-chirho/26-10-27-publication-readiness-chirho.md (manifests -> shards).
def refresh_chirho(root_chirho):
    """Validate every input, then write; returns the number of files written or removed."""
    found_chirho = collect_chirho(root_chirho)
    library_chirho, chapters_chirho = lemma_library_chirho(root_chirho)
    return write_chirho(
        root_chirho,
        shards_chirho(found_chirho, library_chirho, chapters_chirho, root_chirho),
    )


def signature_chirho(root_chirho):
    paths_chirho = sorted(
        [
            *(root_chirho / "data-chirho/media-chirho").glob("*.json"),
            *(root_chirho / "data-chirho/reader-chirho").glob(
                "*-presentation-chirho.json"
            ),
            *(root_chirho / "static/content-chirho").glob("*/manifest-chirho.json"),
            *(
                [root_chirho / LIBRARY_POLICY_CHIRHO]
                if (root_chirho / LIBRARY_POLICY_CHIRHO).exists()
                else []
            ),
        ]
    )
    return tuple(
        (
            str(path_chirho),
            info_chirho.st_ino,
            info_chirho.st_size,
            info_chirho.st_mtime_ns,
        )
        for path_chirho, info_chirho in (
            (path_chirho, path_chirho.stat()) for path_chirho in paths_chirho
        )
    )


def main_chirho(argv_chirho=None):
    parser_chirho = argparse.ArgumentParser(description=__doc__.splitlines()[0])
    group_chirho = parser_chirho.add_mutually_exclusive_group()
    group_chirho.add_argument(
        "--once", action="store_true", help="refresh once (default)"
    )
    group_chirho.add_argument(
        "--watch", action="store_true", help=f"poll every {POLL_SECONDS_CHIRHO} s"
    )
    args_chirho = parser_chirho.parse_args(argv_chirho)
    signal.signal(signal.SIGTERM, stop_chirho)
    signal.signal(signal.SIGINT, stop_chirho)
    last_chirho, last_error_chirho = None, None
    while not STOP_CHIRHO:
        try:
            before_chirho = signature_chirho(ROOT_CHIRHO)
            if before_chirho != last_chirho:
                changes_chirho = refresh_chirho(ROOT_CHIRHO)
                last_chirho = (
                    before_chirho
                    if signature_chirho(ROOT_CHIRHO) == before_chirho
                    else None
                )
                last_error_chirho = None
                print(
                    f"media shards updated ({changes_chirho} file changes)"
                    if changes_chirho
                    else "media shards unchanged",
                    flush=True,
                )
        except (OSError, ValueError, KeyError, TypeError) as error_chirho:
            last_chirho = None
            if str(error_chirho) != last_error_chirho:
                print(
                    f"media shards refused, last good shards kept: {error_chirho}",
                    flush=True,
                )
            last_error_chirho = str(error_chirho)
            if not args_chirho.watch:
                return 1
        if not args_chirho.watch:
            return 0
        time.sleep(POLL_SECONDS_CHIRHO)
    return 0


if __name__ == "__main__":
    raise SystemExit(main_chirho())
