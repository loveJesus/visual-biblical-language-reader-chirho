#!/usr/bin/env python3
# For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life. — John 3:16 (KJV)
"""Materialize reviewed word-to-existing-art references offline, without image generation.

Workflow: spec-chirho/workflows-chirho/shared-icons-chirho.md.
The original icon catalogues own artwork facts; explicit review files own new word assignments.
"""

import argparse
import fcntl
import hashlib
import json
import os
import signal
import time
from pathlib import Path

from icon_reviews_chirho import deferrals_chirho, identity_chirho
from refresh_sharded_media_chirho import (
    ASSET_CHIRHO,
    BOOKS_CHIRHO,
    ICON_FIELDS_CHIRHO,
    SHA256_CHIRHO,
    SLUG_CHIRHO,
    RefusalChirho,
    read_json_chirho,
    replace_chirho,
    sanitize_chirho,
    source_artwork_fact_chirho,
)

ROOT_CHIRHO = Path(__file__).resolve().parents[2]
REVIEWS_CHIRHO = Path("data-chirho/reader-chirho/icon-reuse-chirho")
MEDIA_CHIRHO = Path("data-chirho/media-chirho")
QUEUE_CHIRHO = Path("workspace-chirho/art-chirho/queue-chirho/icon-reuse-chirho")
LIMIT_CHIRHO = 20_000
STOP_CHIRHO = False


def sha_chirho(data_chirho):
    return hashlib.sha256(data_chirho).hexdigest()


def source_paths_chirho(root_chirho):
    return sorted(
        path_chirho
        for path_chirho in (root_chirho / MEDIA_CHIRHO).glob("*icons-chirho.json")
        if not path_chirho.name.startswith("reused-")
    )


def review_paths_chirho(root_chirho):
    paths_chirho = sorted((root_chirho / REVIEWS_CHIRHO).glob("*-chirho/*-chirho.json"))
    if len(paths_chirho) > 1024:
        raise RefusalChirho("Too many icon reuse review files")
    return paths_chirho


def output_path_chirho(root_chirho, book_chirho):
    folder_chirho = BOOKS_CHIRHO[book_chirho][0].removesuffix("-chirho")
    return root_chirho / MEDIA_CHIRHO / f"reused-{folder_chirho}-icons-chirho.json"


def words_chirho(root_chirho):
    """Read the three bounded corpora once; preserve every code point and homograph."""
    result_chirho = {}
    for book_chirho, (folder_chirho, chapters_chirho) in BOOKS_CHIRHO.items():
        base_chirho = root_chirho / "static/content-chirho" / folder_chirho
        if not (base_chirho / "manifest-chirho.json").exists():
            continue
        manifest_chirho = read_json_chirho(base_chirho / "manifest-chirho.json")
        if manifest_chirho.get("book_id_chirho") != book_chirho:
            raise RefusalChirho("Reuse corpus manifest names another book")
        for entry_chirho in manifest_chirho["chapters_chirho"]:
            number_chirho = entry_chirho["number_chirho"]
            if type(number_chirho) is not int or not 1 <= number_chirho <= chapters_chirho:
                raise RefusalChirho("Reuse chapter number is outside its book")
            path_chirho = base_chirho / f"chapter-{number_chirho:02d}-chirho.json"
            document_chirho = read_json_chirho(path_chirho)
            if sha_chirho(path_chirho.read_bytes()) != entry_chirho["sha256_chirho"]:
                raise RefusalChirho("Reuse corpus chapter checksum changed")
            if (
                document_chirho.get("book_id_chirho") != book_chirho
                or document_chirho.get("chapter_chirho") != number_chirho
            ):
                raise RefusalChirho("Reuse corpus chapter identity changed")
            for verse_chirho in document_chirho["verses_chirho"]:
                for token_chirho in verse_chirho["tokens_chirho"]:
                    key_chirho = (verse_chirho["id_chirho"], token_chirho["id_chirho"])
                    if key_chirho in result_chirho:
                        raise RefusalChirho("Duplicate corpus word identity")
                    result_chirho[key_chirho] = (verse_chirho, token_chirho)
    return result_chirho


def lexeme_chirho(token_chirho):
    return {
        key_chirho: token_chirho.get(key_chirho)
        for key_chirho in ("lemma_id_chirho", "lemma_augment_chirho", "lexical_form_chirho")
    }


def sources_chirho(root_chirho):
    icons_chirho = {}
    selected_chirho = set()
    for path_chirho in source_paths_chirho(root_chirho):
        document_chirho = read_json_chirho(path_chirho)
        for row_chirho in document_chirho["icons_chirho"]:
            row_chirho = {
                **row_chirho,
                "lesson_id_chirho": row_chirho.get(
                    "lesson_id_chirho", document_chirho.get("lesson_id_chirho")
                ),
            }
            identifier_chirho = row_chirho.get("id_chirho")
            if not isinstance(identifier_chirho, str) or identifier_chirho in icons_chirho:
                raise RefusalChirho("Duplicate or missing source icon identity")
            icons_chirho[identifier_chirho] = row_chirho
            if row_chirho.get("selected_chirho") is not False:
                selected_chirho.add((row_chirho["lesson_id_chirho"], row_chirho["token_id_chirho"]))
    return icons_chirho, selected_chirho


def verify_asset_chirho(root_chirho, icon_chirho, expected_chirho, verified_chirho):
    if icon_chirho.get("sha256_chirho") != expected_chirho or not SHA256_CHIRHO.fullmatch(
        expected_chirho
    ):
        raise RefusalChirho("Reviewed source artwork checksum changed")
    path_text_chirho = icon_chirho.get("asset_path_chirho", "")
    if not ASSET_CHIRHO.fullmatch(path_text_chirho):
        raise RefusalChirho("Invalid reused artwork path")
    path_chirho = root_chirho / "static" / path_text_chirho.lstrip("/")
    if not path_chirho.resolve().is_relative_to((root_chirho / "static").resolve()):
        raise RefusalChirho("Reused artwork escapes static assets")
    if path_text_chirho not in verified_chirho:
        facts_chirho = source_artwork_fact_chirho(root_chirho, icon_chirho, "icon")
        size_chirho = (facts_chirho["width_chirho"], facts_chirho["height_chirho"])
        if max(size_chirho) > 128 or size_chirho != (
            icon_chirho["width_chirho"],
            icon_chirho["height_chirho"],
        ):
            raise RefusalChirho("Reused icon has invalid dimensions")
        if facts_chirho["sha256_chirho"] != expected_chirho:
            raise RefusalChirho("Reused icon bytes do not match the review")
        verified_chirho[path_text_chirho] = (expected_chirho, size_chirho)
    if verified_chirho[path_text_chirho] != (
        expected_chirho,
        (icon_chirho["width_chirho"], icon_chirho["height_chirho"]),
    ):
        raise RefusalChirho("Reused asset aliases disagree")
    if icon_chirho.get("art_review_chirho") not in ("pending", "approved") or icon_chirho.get(
        "sense_review_chirho"
    ) not in ("agent_reviewed", "human_reviewed"):
        raise RefusalChirho("Reused artwork lacks reviewed source meaning or valid art state")


def checked_word_chirho(pin_chirho, all_words_chirho):
    key_chirho = (pin_chirho.get("verse_id_chirho"), pin_chirho.get("token_id_chirho"))
    if key_chirho not in all_words_chirho:
        raise RefusalChirho("Reviewed word is missing from the current corpus")
    verse_chirho, token_chirho = all_words_chirho[key_chirho]
    if (
        pin_chirho.get("text_chirho") != token_chirho["text_chirho"]
        or pin_chirho.get("gloss_chirho") != token_chirho.get("gloss_chirho")
        or pin_chirho.get("canonical_sha256_chirho")
        != sha_chirho(verse_chirho["canonical_text_chirho"].encode())
    ):
        raise RefusalChirho("Reviewed verse, word or gloss changed")
    return key_chirho, verse_chirho, token_chirho


def build_chirho(root_chirho):
    # Workflow: shared-icons-chirho.md, reviewed sense -> pinned occurrences -> existing art.
    all_words_chirho = words_chirho(root_chirho)
    icons_chirho, existing_chirho = sources_chirho(root_chirho)
    deferred_chirho = deferrals_chirho(root_chirho)
    output_chirho = {book_chirho: [] for book_chirho in BOOKS_CHIRHO}
    checked_chirho = {}
    assigned_chirho = set()
    rule_ids_chirho = set()
    for path_chirho in review_paths_chirho(root_chirho):
        rule_chirho = read_json_chirho(path_chirho)
        identifier_chirho = rule_chirho.get("id_chirho", "")
        if (
            rule_chirho.get("schema_version_chirho") != 1
            or not SLUG_CHIRHO.fullmatch(identifier_chirho)
            or identifier_chirho in rule_ids_chirho
            or rule_chirho.get("reviewed_by_chirho") != "gpt_chirho"
            or rule_chirho.get("sense_review_chirho") != "agent_reviewed"
            or not isinstance(rule_chirho.get("review_note_chirho"), str)
            or not rule_chirho["review_note_chirho"].strip()
        ):
            raise RefusalChirho("Missing explicit unique icon reuse sense review")
        rule_ids_chirho.add(identifier_chirho)
        source_chirho = icons_chirho.get(rule_chirho.get("source_icon_id_chirho"))
        if source_chirho is None:
            raise RefusalChirho("Reviewed source icon no longer exists")
        source_key_chirho, _source_verse_chirho, source_token_chirho = checked_word_chirho(
            rule_chirho["source_word_chirho"], all_words_chirho
        )
        if (
            source_key_chirho
            != (source_chirho["lesson_id_chirho"], source_chirho["token_id_chirho"])
            or source_token_chirho["lemma_id_chirho"] != source_chirho["lemma_id_chirho"]
            or source_token_chirho.get("lemma_augment_chirho")
            != source_chirho.get("lemma_augment_chirho")
            or (
                source_chirho["lemma_id_chirho"].startswith("G")
                and source_token_chirho["lexical_form_chirho"]
                != source_chirho.get("lexical_form_chirho")
            )
        ):
            raise RefusalChirho("Source icon lexical identity changed")
        variants_chirho = [(source_chirho, rule_chirho["source_sha256_chirho"])]
        alternatives_chirho = rule_chirho.get("alternatives_chirho", [])
        if not isinstance(alternatives_chirho, list) or len(alternatives_chirho) > 8:
            raise RefusalChirho("Too many reviewed alternatives")
        for alternate_chirho in alternatives_chirho:
            icon_chirho = icons_chirho.get(alternate_chirho.get("icon_id_chirho"))
            if (
                icon_chirho is None
                or (icon_chirho["lesson_id_chirho"], icon_chirho["token_id_chirho"])
                != source_key_chirho
                or icon_chirho["sense_id_chirho"] != source_chirho["sense_id_chirho"]
            ):
                raise RefusalChirho("Alternative does not share the reviewed source sense")
            variants_chirho.append((icon_chirho, alternate_chirho["sha256_chirho"]))
        distinct_chirho = []
        seen_assets_chirho = set()
        for icon_chirho, expected_chirho in variants_chirho:
            verify_asset_chirho(root_chirho, icon_chirho, expected_chirho, checked_chirho)
            if icon_chirho["sha256_chirho"] not in seen_assets_chirho:
                distinct_chirho.append(icon_chirho)
                seen_assets_chirho.add(icon_chirho["sha256_chirho"])
        targets_chirho = rule_chirho.get("targets_chirho")
        if not isinstance(targets_chirho, list) or not 1 <= len(targets_chirho) <= 200:
            raise RefusalChirho("A reuse review must list 1..200 explicit words")
        for pin_chirho in targets_chirho:
            key_chirho, verse_chirho, token_chirho = checked_word_chirho(
                pin_chirho, all_words_chirho
            )
            if (
                key_chirho in assigned_chirho
                or lexeme_chirho(token_chirho) != rule_chirho["target_lexeme_chirho"]
            ):
                raise RefusalChirho("Duplicate target or changed full target lexical identity")
            assigned_chirho.add(key_chirho)
            if (
                identity_chirho(
                    {
                        "verse_id_chirho": key_chirho[0],
                        **token_chirho,
                        "token_id_chirho": key_chirho[1],
                    }
                )
                in deferred_chirho
            ):
                raise RefusalChirho("An unresolved word context cannot receive reused art")
            if key_chirho in existing_chirho:
                continue
            refs_chirho = rule_chirho.get("evidence_refs_chirho", [])
            if not refs_chirho or not set(refs_chirho) <= {
                row_chirho["id_chirho"] for row_chirho in verse_chirho["sources_chirho"]
            }:
                raise RefusalChirho("Reused sense cites unavailable target evidence")
            for index_chirho, icon_chirho in enumerate(distinct_chirho):
                row_id_chirho = (
                    "reuse-"
                    + sha_chirho(
                        json.dumps(
                            [identifier_chirho, *key_chirho, icon_chirho["id_chirho"]],
                            ensure_ascii=False,
                        ).encode()
                    )[:32]
                    + "-chirho"
                )
                compiled_chirho = {
                    **{
                        field_chirho: icon_chirho[field_chirho]
                        for field_chirho in (
                            "asset_path_chirho",
                            "alt_chirho",
                            "width_chirho",
                            "height_chirho",
                            "sha256_chirho",
                            "art_review_chirho",
                        )
                    },
                    "id_chirho": row_id_chirho,
                    "lesson_id_chirho": key_chirho[0],
                    "token_id_chirho": key_chirho[1],
                    **lexeme_chirho(token_chirho),
                    "sense_id_chirho": source_chirho["sense_id_chirho"],
                    "contextual_meaning_chirho": rule_chirho["contextual_meaning_chirho"],
                    "sense_review_chirho": "agent_reviewed",
                    "selected_chirho": index_chirho == 0,
                    "evidence_refs_chirho": refs_chirho,
                    "display_authority_chirho": "An AI agent checked this word's meaning before reusing the illustration. Artwork review is recorded separately.",
                    "context_text_chirho": token_chirho["text_chirho"],
                    "context_gloss_chirho": token_chirho.get("gloss_chirho"),
                    "context_canonical_text_chirho": verse_chirho["canonical_text_chirho"],
                    "reuse_source_id_chirho": source_chirho["id_chirho"],
                    "reuse_review_id_chirho": identifier_chirho,
                }
                sanitize_chirho(compiled_chirho, "icon", ICON_FIELDS_CHIRHO, 128, row_id_chirho)
                output_chirho[key_chirho[0].split(".")[0]].append(compiled_chirho)
            if sum(len(rows_chirho) for rows_chirho in output_chirho.values()) > LIMIT_CHIRHO:
                raise RefusalChirho("Reuse catalogue exceeds its bounded scope")
    return output_chirho


def refresh_chirho(root_chirho, check_chirho=False):
    records_chirho = build_chirho(root_chirho)
    changes_chirho = 0
    for book_chirho, rows_chirho in records_chirho.items():
        rows_chirho.sort(
            key=lambda row_chirho: (
                row_chirho["lesson_id_chirho"],
                row_chirho["token_id_chirho"],
                not row_chirho["selected_chirho"],
                row_chirho["id_chirho"],
            )
        )
        text_chirho = (
            '{"schema_version_chirho":1,"icons_chirho":[\n'
            + ",\n".join(
                json.dumps(row_chirho, ensure_ascii=False, separators=(",", ":"))
                for row_chirho in rows_chirho
            )
            + "\n]}\n"
        )
        path_chirho = output_path_chirho(root_chirho, book_chirho)
        # A newly imported book with no contextual reviews needs no empty assignment file.
        if not rows_chirho and not path_chirho.exists():
            continue
        encoded_chirho = text_chirho.encode()
        if not path_chirho.exists() or path_chirho.read_bytes() != encoded_chirho:
            changes_chirho += 1
            if not check_chirho:
                path_chirho.parent.mkdir(parents=True, exist_ok=True)
                replace_chirho(path_chirho, encoded_chirho)
    if check_chirho and changes_chirho:
        raise RefusalChirho("Reused icon outputs drift from their reviewed inputs")
    if changes_chirho and not check_chirho:
        descriptor_chirho = os.open(root_chirho / MEDIA_CHIRHO, os.O_RDONLY)
        try:
            os.fsync(descriptor_chirho)
        finally:
            os.close(descriptor_chirho)
    return {
        "changed_files_chirho": changes_chirho,
        "word_contexts_chirho": sum(
            row_chirho["selected_chirho"]
            for rows_chirho in records_chirho.values()
            for row_chirho in rows_chirho
        ),
        "icon_references_chirho": sum(map(len, records_chirho.values())),
    }


def signature_chirho(root_chirho):
    paths_chirho = source_paths_chirho(root_chirho) + review_paths_chirho(root_chirho)
    paths_chirho += [
        root_chirho / "static/content-chirho" / folder_chirho / "manifest-chirho.json"
        for folder_chirho, _count_chirho in BOOKS_CHIRHO.values()
    ]
    paths_chirho += [root_chirho / "data-chirho/reader-chirho/icon-deferrals-chirho.json"]
    return tuple(
        (str(path_chirho), path_chirho.stat().st_size, path_chirho.stat().st_mtime_ns)
        for path_chirho in paths_chirho
        if path_chirho.exists()
    )


def coverage_keys_chirho(root_chirho, book_chirho):
    """Book generators skip only existing, independently reverified shared assignments."""
    path_chirho = output_path_chirho(root_chirho, book_chirho)
    if not path_chirho.exists():
        return set()
    expected_chirho = build_chirho(root_chirho)[book_chirho]
    actual_chirho = read_json_chirho(path_chirho).get("icons_chirho")
    if not isinstance(actual_chirho, list) or sorted(
        actual_chirho, key=lambda row_chirho: row_chirho["id_chirho"]
    ) != sorted(expected_chirho, key=lambda row_chirho: row_chirho["id_chirho"]):
        raise RefusalChirho("Shared icon coverage is stale; rebuild before spending on more icons")
    return {
        (
            book_chirho,
            row_chirho["lemma_id_chirho"],
            row_chirho["lexical_form_chirho"]
            if book_chirho == "John"
            else row_chirho["lemma_augment_chirho"],
        )
        for row_chirho in expected_chirho
        if row_chirho["selected_chirho"]
    }


def stop_chirho(_signal_chirho, _frame_chirho):
    global STOP_CHIRHO
    STOP_CHIRHO = True


def main_chirho():
    parser_chirho = argparse.ArgumentParser(description=__doc__)
    parser_chirho.add_argument("--watch-chirho", action="store_true")
    parser_chirho.add_argument("--check-chirho", action="store_true")
    args_chirho = parser_chirho.parse_args()
    queue_chirho = ROOT_CHIRHO / QUEUE_CHIRHO
    queue_chirho.mkdir(parents=True, exist_ok=True)
    signal.signal(signal.SIGTERM, stop_chirho)
    signal.signal(signal.SIGINT, stop_chirho)
    with (queue_chirho / "worker.lock").open("a") as lock_chirho:
        try:
            fcntl.flock(lock_chirho, fcntl.LOCK_EX | fcntl.LOCK_NB)
        except BlockingIOError:
            raise SystemExit("Another icon reuse watcher owns this output")
        previous_chirho, error_chirho = None, None
        while not STOP_CHIRHO:
            try:
                current_chirho = signature_chirho(ROOT_CHIRHO)
                if current_chirho != previous_chirho:
                    result_chirho = refresh_chirho(ROOT_CHIRHO, args_chirho.check_chirho)
                    print(json.dumps(result_chirho), flush=True)
                    previous_chirho, error_chirho = current_chirho, None
            except (OSError, ValueError, KeyError, TypeError) as caught_chirho:
                if str(caught_chirho) != error_chirho:
                    print(f"Icon reuse refused; last outputs kept: {caught_chirho}", flush=True)
                error_chirho = str(caught_chirho)
                if not args_chirho.watch_chirho:
                    return 2
            if not args_chirho.watch_chirho:
                return 0
            time.sleep(3)
    return 0


if __name__ == "__main__":
    raise SystemExit(main_chirho())
