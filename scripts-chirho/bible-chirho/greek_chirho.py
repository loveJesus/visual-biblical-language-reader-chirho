# For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life. — John 3:16 (KJV)
"""Whole Nestle 1904 with edition gaps and ambiguous source parses preserved, never filled in.

Workflow: whole-bible-chirho.md, greek_chirho. The exceptional Matthew row, compound Strong
numbers and square brackets occur in the pinned file; source bytes are not corrected.
"""

from __future__ import annotations

import csv
import io
import re
from collections import defaultdict

from john_corpus_chirho import UNCURATED_NOTE_CHIRHO, greek_token_chirho
from nestle_book_chirho import (
    HEADER_CHIRHO,
    GreekVerseChirho,
    GreekWordChirho,
    split_printed_chirho,
    utf16_length_chirho,
)

EXCEPTION_ROW_CHIRHO = (
    "Matt 10:28",
    "φοβεῖσθε",
    "V-PEM-2P@@V-PNM-2P",
    "V-PEM-2P@@V-PNM-2P",
    "5399",
    "φοβέω",
    "φοβεῖσθε",
    "V-PEM-2P",
    "V-PNM-2P",
)


def read_books_chirho(bytes_chirho: bytes) -> dict[str, tuple[GreekVerseChirho, ...]]:
    reader_chirho = csv.reader(io.StringIO(bytes_chirho.decode("utf-8-sig")), delimiter="\t")
    if next(reader_chirho) != HEADER_CHIRHO:
        raise ValueError("Wrong Nestle source header")
    grouped_chirho = defaultdict(list)
    for row_chirho in reader_chirho:
        if (len(row_chirho) != 8 or row_chirho[7]) and tuple(row_chirho) != EXCEPTION_ROW_CHIRHO:
            raise ValueError(f"Unsupported Nestle CSV row: {row_chirho[:1]}")
        match_chirho = re.fullmatch(r"([1-3]?[A-Za-z]+) ([1-9]\d*):([1-9]\d*)", row_chirho[0])
        if not match_chirho or not all(row_chirho[:7]):
            raise ValueError("Invalid Nestle word fields")
        grouped_chirho[(match_chirho[1], int(match_chirho[2]), int(match_chirho[3]))].append(
            row_chirho
        )
    books_chirho = defaultdict(list)
    for (book_chirho, chapter_chirho, number_chirho), rows_chirho in grouped_chirho.items():
        previous_chirho = books_chirho[book_chirho][-1] if books_chirho[book_chirho] else None
        if previous_chirho and (chapter_chirho, number_chirho) <= (
            previous_chirho.chapter_chirho,
            previous_chirho.verse_chirho,
        ):
            raise ValueError("Disordered Nestle verses")
        words_chirho = []
        printed_chirho = []
        cursor_chirho = 0
        verse_id_chirho = f"{book_chirho}.{chapter_chirho}.{number_chirho}"
        for index_chirho, row_chirho in enumerate(rows_chirho, 1):
            (
                _,
                text_chirho,
                functional_chirho,
                formal_chirho,
                strong_chirho,
                lemma_chirho,
                normalized_chirho,
            ) = row_chirho[:7]
            # Square brackets are edition punctuation, not a Greek word or a new reading.
            unbracketed_chirho = text_chirho.replace("[", "").replace("]", "")
            prefix_chirho, core_chirho, _ = split_printed_chirho(
                unbracketed_chirho, verse_id_chirho
            )
            prefix_chirho = (
                text_chirho[: len(text_chirho) - len(text_chirho.lstrip("["))] + prefix_chirho
            )
            if not re.fullmatch(r"0*[1-9]\d*(?:&[1-9]\d*)?", strong_chirho):
                raise ValueError(f"Unknown Strong field: {verse_id_chirho} {strong_chirho}")
            base_chirho, _, other_chirho = strong_chirho.partition("&")
            if printed_chirho:
                cursor_chirho += 1
            start_chirho = cursor_chirho + utf16_length_chirho(prefix_chirho)
            words_chirho.append(
                (
                    GreekWordChirho(
                        f"{verse_id_chirho}!{index_chirho}",
                        text_chirho,
                        core_chirho,
                        prefix_chirho,
                        functional_chirho,
                        formal_chirho,
                        base_chirho,
                        other_chirho or None,
                        lemma_chirho,
                        normalized_chirho,
                    ),
                    start_chirho,
                    start_chirho + utf16_length_chirho(core_chirho),
                )
            )
            printed_chirho.append(text_chirho)
            cursor_chirho += utf16_length_chirho(text_chirho)
        books_chirho[book_chirho].append(
            GreekVerseChirho(
                verse_id_chirho,
                chapter_chirho,
                number_chirho,
                " ".join(printed_chirho),
                tuple(words_chirho),
            )
        )
    return {
        book_chirho: tuple(verses_chirho) for book_chirho, verses_chirho in books_chirho.items()
    }


def token_chirho(word_chirho, start_chirho, end_chirho, gloss_chirho, note_chirho):
    try:
        return greek_token_chirho(word_chirho, start_chirho, end_chirho, gloss_chirho, note_chirho)
    except ValueError as error_chirho:
        # Ambiguous/malformed source morphology cannot acquire fabricated grammar cues.
        return {
            "id_chirho": word_chirho.id_chirho,
            "text_chirho": word_chirho.text_chirho,
            "segments_chirho": [word_chirho.text_chirho],
            "start_chirho": start_chirho,
            "end_chirho": end_chirho,
            "raw_morphology_chirho": word_chirho.func_morph_chirho,
            "raw_form_morphology_chirho": word_chirho.form_morph_chirho,
            "raw_strongs_chirho": word_chirho.strongs_chirho
            + (f"&{word_chirho.tvm_chirho}" if word_chirho.tvm_chirho else ""),
            "lemma_id_chirho": f"G{int(word_chirho.strongs_chirho)}",
            "lemma_augment_chirho": None,
            "lexical_form_chirho": word_chirho.lemma_chirho,
            "normalized_chirho": word_chirho.normalized_chirho,
            "pos_chirho": "unknown",
            "part_of_speech_chirho": "unknown",
            "case_chirho": "unknown",
            "gender_chirho": "unknown",
            "number_chirho": "unknown",
            "root_text_chirho": None,
            "root_entry_id_chirho": None,
            "root_status_chirho": "unresolved",
            "root_note_chirho": "No reviewed root relationship.",
            "gloss_chirho": gloss_chirho,
            "analysis_chirho": "Teaching analysis withheld: ambiguous or unsupported source parse.",
            "source_note_chirho": f"{UNCURATED_NOTE_CHIRHO} Raw parse kept unchanged. {error_chirho}. {note_chirho}",
            "analysis_status_chirho": "source_review_required",
        }


def gloss_entries_chirho(bytes_chirho: bytes, book_chirho: str):
    """Withhold only malformed/duplicate source gloss entries and keep their exact identities."""
    from source_files_chirho import parse_xml_chirho

    root_chirho = parse_xml_chirho(bytes_chirho, "Berean glosses")
    if root_chirho.tag != "root":
        raise ValueError("Unexpected Berean root")
    entries_chirho = {}
    notes_chirho = []
    seen_chirho = set()
    refused_chirho = set()
    for verse_chirho in root_chirho:
        if verse_chirho.tag == "status":
            continue
        if verse_chirho.tag != "verse":
            raise ValueError("Unknown Berean container")
        children_chirho = list(verse_chirho)
        for index_chirho, element_chirho in enumerate(children_chirho):
            if element_chirho.tag == "status":
                before_chirho = next(
                    (
                        later_chirho.get("osisId")
                        for later_chirho in children_chirho[index_chirho + 1 :]
                        if later_chirho.tag == "w"
                    ),
                    None,
                )
                if before_chirho and before_chirho.startswith(book_chirho + "."):
                    notes_chirho.append(
                        (
                            before_chirho.split("!")[0],
                            before_chirho,
                            " ".join("".join(element_chirho.itertext()).split()),
                        )
                    )
                continue
            id_chirho = element_chirho.get("osisId") or ""
            if not id_chirho.startswith(book_chirho + "."):
                continue
            invalid_chirho = (
                id_chirho in seen_chirho
                or element_chirho.tag != "w"
                or [child_chirho.tag for child_chirho in element_chirho] != ["greek", "gloss"]
            )
            seen_chirho.add(id_chirho)
            if invalid_chirho:
                refused_chirho.add(id_chirho)
                entries_chirho.pop(id_chirho, None)
                notes_chirho.append(
                    (
                        id_chirho.split("!")[0],
                        id_chirho,
                        "English gloss withheld: the pinned Berean file has an incomplete or repeated entry at this word id.",
                    )
                )
            elif id_chirho not in refused_chirho:
                entries_chirho[id_chirho] = (
                    element_chirho.findtext("greek") or "",
                    element_chirho.findtext("gloss") or "",
                )
    return entries_chirho, notes_chirho
