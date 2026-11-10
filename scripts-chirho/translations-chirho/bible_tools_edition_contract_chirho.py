# For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life. — John 3:16 (KJV)
"""Decode frozen public reader data and align complete verses without guessing."""

from __future__ import annotations

import hashlib
import json
import unicodedata
from collections import OrderedDict


class EditionUnavailableChirho(ValueError):
    """The requested edition is absent; the reader may have selected another."""


class EditionSourceErrorChirho(ValueError):
    """Untrusted input differs from the recorded contract."""


def letters_chirho(text_chirho: str) -> str:
    """Existing Hinneh normalization: NFD letters and marks, retaining accents."""
    return "".join(
        character_chirho
        for character_chirho in unicodedata.normalize("NFD", text_chirho)
        if unicodedata.category(character_chirho)[0] in "LM"
    )


def decode_reader_chirho(
    body_chirho: bytes,
    language_chirho: str,
    book_number_chirho: int,
    chapter_chirho: int,
    requested_type_chirho: str,
) -> dict:
    """Read only the plain devalue tree; never evaluate JavaScript or revive types."""
    if len(body_chirho) > 2_000_000:
        raise EditionSourceErrorChirho("reader body exceeds 2 MB")
    envelope_chirho = json.loads(body_chirho)
    pages_chirho = [
        node_chirho["data"]
        for node_chirho in envelope_chirho.get("nodes", [])
        if isinstance(node_chirho, dict)
        and node_chirho.get("type") == "data"
        and isinstance(node_chirho.get("data"), list)
        and node_chirho["data"]
        and isinstance(node_chirho["data"][0], dict)
        and "versesChirho" in node_chirho["data"][0]
    ]
    if len(pages_chirho) != 1:
        raise EditionSourceErrorChirho("expected exactly one chapter data node")
    table_chirho = pages_chirho[0]
    references_chirho = table_chirho[0]

    def hydrate_chirho(index_chirho: int, depth_chirho: int = 0):
        if (
            type(index_chirho) is not int
            or not 0 <= index_chirho < len(table_chirho)
            or depth_chirho > 12
        ):
            raise EditionSourceErrorChirho("invalid plain devalue reference")
        value_chirho = table_chirho[index_chirho]
        if isinstance(value_chirho, dict):
            return {
                key_chirho: hydrate_chirho(ref_chirho, depth_chirho + 1)
                for key_chirho, ref_chirho in value_chirho.items()
            }
        if isinstance(value_chirho, list):
            return [
                hydrate_chirho(ref_chirho, depth_chirho + 1)
                for ref_chirho in value_chirho
            ]
        return value_chirho

    actual_language_chirho = hydrate_chirho(references_chirho["codeChirho"])
    actual_book_chirho = hydrate_chirho(references_chirho["bookChirho"])
    actual_chapter_chirho = hydrate_chirho(references_chirho["chapterChirho"])
    actual_type_chirho = hydrate_chirho(references_chirho["translationTypeChirho"])
    if (
        actual_language_chirho != language_chirho
        or actual_book_chirho.get("idChirho") != book_number_chirho
        or actual_chapter_chirho != chapter_chirho
    ):
        raise EditionSourceErrorChirho("wrong language, book or chapter")
    has_type_chirho = hydrate_chirho(
        references_chirho[
            "hasReadersChirho"
            if requested_type_chirho == "readers"
            else "hasTerseChirho"
        ]
    )
    if has_type_chirho is not True or actual_type_chirho != requested_type_chirho:
        raise EditionUnavailableChirho(
            f"requested {requested_type_chirho}; effective {actual_type_chirho}"
        )
    result_chirho = {}
    for verse_chirho in hydrate_chirho(references_chirho["versesChirho"]):
        verse_number_chirho = verse_chirho["verseNumberChirho"]
        verse_id_chirho = (
            f"{book_number_chirho:02d}{chapter_chirho:03d}{verse_number_chirho:03d}"
        )
        if (
            verse_chirho["verseIdChirho"] != verse_id_chirho
            or verse_number_chirho in result_chirho
        ):
            raise EditionSourceErrorChirho("wrong or duplicate source verse id")
        groups_chirho = OrderedDict()
        last_word_id_chirho = None
        for word_chirho in verse_chirho["wordsChirho"]:
            word_id_chirho = word_chirho["wordIdChirho"]
            if not isinstance(word_id_chirho, str) or not word_id_chirho.startswith(
                verse_id_chirho
            ):
                raise EditionSourceErrorChirho("source word does not belong to verse")
            if (
                word_id_chirho in groups_chirho
                and last_word_id_chirho != word_id_chirho
            ):
                raise EditionSourceErrorChirho("nonadjacent duplicate source word")
            groups_chirho.setdefault(word_id_chirho, []).append(word_chirho)
            last_word_id_chirho = word_id_chirho
        words_chirho = []
        for word_id_chirho, rows_chirho in groups_chirho.items():
            source_shapes_chirho = {
                (
                    row_chirho["textChirho"],
                    row_chirho["lemmaIdChirho"],
                    row_chirho["grammarChirho"],
                )
                for row_chirho in rows_chirho
            }
            if len(source_shapes_chirho) != 1:
                raise EditionSourceErrorChirho(
                    "duplicate word has different source text"
                )
            candidates_chirho = {
                json.dumps(row_chirho, ensure_ascii=False, sort_keys=True)
                for row_chirho in rows_chirho
                if any(
                    row_chirho[key_chirho] is not None
                    for key_chirho in [
                        "glossChirho",
                        "glossStateChirho",
                        "glossSourceChirho",
                    ]
                )
            }
            if len(candidates_chirho) > 1:
                raise EditionSourceErrorChirho("conflicting non-null gloss rows")
            selected_chirho = (
                json.loads(next(iter(candidates_chirho)))
                if candidates_chirho
                else rows_chirho[0]
            )
            gloss_chirho = selected_chirho["glossChirho"]
            state_chirho = selected_chirho["glossStateChirho"]
            source_chirho = selected_chirho["glossSourceChirho"]
            if gloss_chirho is not None and not isinstance(gloss_chirho, str):
                raise EditionSourceErrorChirho("gloss is not text or null")
            if state_chirho is not None and (
                not isinstance(state_chirho, str) or not state_chirho
            ):
                raise EditionSourceErrorChirho("state is not a nonempty string")
            if source_chirho is not None and not isinstance(source_chirho, str):
                raise EditionSourceErrorChirho("source is not text or null")
            words_chirho.append(
                {
                    "word_id_chirho": word_id_chirho,
                    "text_chirho": selected_chirho["textChirho"],
                    "gloss_chirho": gloss_chirho,
                    "state_chirho": state_chirho,
                    "source_chirho": source_chirho,
                }
            )
        result_chirho[verse_number_chirho] = words_chirho
    return result_chirho


def align_edition_chirho(
    content_chirho: dict, source_verses_chirho: dict, source_id_chirho: str
) -> tuple[dict, dict]:
    """Admit only a whole equal sequence; missing phrases withhold the variant."""
    editions_chirho = {}
    holds_chirho = {}
    for verse_chirho in content_chirho["verses_chirho"]:
        lesson_id_chirho = verse_chirho["id_chirho"]
        number_chirho = int(lesson_id_chirho.rsplit(".", 1)[1])
        source_words_chirho = source_verses_chirho.get(number_chirho)
        if source_words_chirho is None:
            holds_chirho[lesson_id_chirho] = "source_verse_missing"
            continue
        tokens_chirho = verse_chirho["tokens_chirho"]
        actual_chirho = [
            letters_chirho(token_chirho["text_chirho"])
            for token_chirho in tokens_chirho
        ]
        expected_chirho = [
            letters_chirho(word_chirho["text_chirho"])
            for word_chirho in source_words_chirho
        ]
        if actual_chirho != expected_chirho:
            holds_chirho[lesson_id_chirho] = "whole_word_sequence_differs"
            continue
        if any(
            word_chirho["gloss_chirho"] is None or not word_chirho["state_chirho"]
            for word_chirho in source_words_chirho
        ):
            holds_chirho[lesson_id_chirho] = "source_phrase_missing"
            continue
        if not any(
            word_chirho["gloss_chirho"].strip(" –-")
            for word_chirho in source_words_chirho
        ):
            holds_chirho[lesson_id_chirho] = "all_glosses_empty"
            continue
        words_chirho = [
            {
                "token_id_chirho": token_chirho["id_chirho"],
                "text_chirho": token_chirho["text_chirho"],
                "gloss_chirho": word_chirho["gloss_chirho"],
                "state_chirho": word_chirho["state_chirho"],
                "source_chirho": word_chirho["source_chirho"],
                "source_word_id_chirho": word_chirho["word_id_chirho"],
            }
            for token_chirho, word_chirho in zip(
                tokens_chirho, source_words_chirho, strict=True
            )
        ]
        editions_chirho[lesson_id_chirho] = {
            "source_id_chirho": source_id_chirho,
            "words_chirho": words_chirho,
        }
    return editions_chirho, holds_chirho


def verify_content_chirho(body_chirho: bytes, expected_sha_chirho: str) -> dict:
    if hashlib.sha256(body_chirho).hexdigest() != expected_sha_chirho:
        raise EditionSourceErrorChirho("content chapter differs from frozen binding")
    return json.loads(body_chirho)
