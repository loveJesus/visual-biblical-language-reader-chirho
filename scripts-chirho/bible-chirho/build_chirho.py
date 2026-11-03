# For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life. — John 3:16 (KJV)
"""Build the remaining 63 books offline, preserving the three established book outputs.

Workflow: whole-bible-chirho.md. Only verified pinned inputs are parsed. A book's outputs are
prepared before atomic replacement; --check writes nothing. Unknown source analyses are data
holds, not permission to fabricate a parse or abort unrelated source text.
"""

from __future__ import annotations

import argparse
import json
import sys
from collections import Counter
from pathlib import Path

ROOT_CHIRHO = Path(__file__).resolve().parents[2]
sys.path[:0] = [
    str(ROOT_CHIRHO / "scripts-chirho/bible-chirho"),
    str(ROOT_CHIRHO / "scripts-chirho/corpus-chirho"),
    str(ROOT_CHIRHO / "scripts-chirho/import-chirho"),
]
sys.dont_write_bytecode = True
from berean_glosses_chirho import join_berean_chirho
from build_corpus_chirho import write_atomically_chirho
from corpus_outputs_chirho import (
    chapter_texts_chirho,
    json_text_chirho,
    sha256_text_chirho,
    source_record_chirho,
)
from corpus_tokens_chirho import LexiconChirho, note_record_chirho
from gbt_glosses_chirho import (
    BOOK_NUMBER_CHIRHO,
    gbt_verses_chirho,
    join_glosses_chirho,
)
from greek_chirho import gloss_entries_chirho, read_books_chirho, token_chirho
from hebrew_chirho import read_book_chirho, reading_chirho
from lexicon_chirho import (
    parse_aug_index_chirho,
    parse_lexical_index_chirho,
    parse_strong_chirho,
)
from nestle_book_chirho import parenthesized_passages_chirho
from source_files_chirho import load_manifest_chirho, read_verified_bytes_chirho


def source_records_chirho(pinned_chirho, ids_chirho):
    return [
        source_record_chirho(pinned_chirho[id_chirho], pinned_chirho[id_chirho].adaptation_chirho)
        for id_chirho in ids_chirho
    ]


def hebrew_records_chirho(book_chirho, pins_chirho, shared_chirho, lexicon_chirho):
    id_chirho = book_chirho["id_chirho"]
    source_id_chirho = f"oshb-{id_chirho.lower()}-chirho"
    source_chirho = pins_chirho[source_id_chirho]
    verses_chirho = read_book_chirho(read_verified_bytes_chirho(source_chirho), id_chirho)
    source_words_chirho = gbt_verses_chirho(
        read_verified_bytes_chirho(pins_chirho[f"gbt-source-words-{id_chirho.lower()}-chirho"]),
        "source words",
    )
    english_chirho = gbt_verses_chirho(
        read_verified_bytes_chirho(pins_chirho[f"gbt-english-{id_chirho.lower()}-chirho"]),
        "approved English",
    )
    sources_chirho = source_records_chirho(pins_chirho, [source_id_chirho]) + source_records_chirho(
        shared_chirho,
        [
            "oshb-morphology-codes-chirho",
            "strong-chirho",
            "aug-index-chirho",
            "lexical-index-chirho",
        ],
    )
    gloss_sources_chirho = source_records_chirho(
        pins_chirho,
        [f"gbt-english-{id_chirho.lower()}-chirho", f"gbt-source-words-{id_chirho.lower()}-chirho"],
    )
    records_chirho = []
    for verse_chirho in verses_chirho:
        try:
            glosses_chirho = join_glosses_chirho(
                id_chirho, (verse_chirho,), source_words_chirho, english_chirho
            ).glosses_chirho
            refusal_chirho = ""
        except (ValueError, KeyError) as error_chirho:
            glosses_chirho = {}
            refusal_chirho = f"Approved gloss alignment withheld: {error_chirho}"
        tokens_chirho = []
        for placed_chirho in verse_chirho.words_chirho:
            source_word_chirho = placed_chirho.word_chirho
            fields_chirho = reading_chirho(
                source_word_chirho,
                lexicon_chirho,
                *glosses_chirho.get(
                    source_word_chirho.id_chirho,
                    (None, refusal_chirho or "No aligned approved gloss."),
                ),
            )
            fields_chirho |= {
                "start_chirho": placed_chirho.start_chirho,
                "end_chirho": placed_chirho.end_chirho,
                "root_text_chirho": None,
                "root_entry_id_chirho": None,
                "root_status_chirho": "unresolved",
                "root_note_chirho": "No root relationship has been reviewed.",
            }
            if placed_chirho.qere_chirho:
                fields_chirho["qere_chirho"] = [
                    reading_chirho(
                        qere_chirho,
                        lexicon_chirho,
                        *glosses_chirho.get(
                            qere_chirho.id_chirho,
                            (None, refusal_chirho or "No aligned approved gloss."),
                        ),
                    )
                    for qere_chirho in placed_chirho.qere_chirho
                ]
            if placed_chirho.ketiv_chirho:
                fields_chirho["written_reading_chirho"] = "ketiv"
                fields_chirho["source_note_chirho"] += (
                    " Written ketiv; source qere is recorded separately. Do not infer pronunciation from an unpointed written form."
                )
            tokens_chirho.append(fields_chirho)
        glossed_chirho = any(
            token_chirho["gloss_chirho"] is not None for token_chirho in tokens_chirho
        )
        notes_chirho = [
            note_record_chirho(note_chirho) for note_chirho in verse_chirho.notes_chirho
        ]
        records_chirho.append(
            {
                "schema_version_chirho": 1,
                "id_chirho": verse_chirho.osis_id_chirho,
                "language_chirho": "he",
                "reference_chirho": f"{book_chirho['label_chirho']} {verse_chirho.chapter_chirho}:{verse_chirho.verse_chirho}",
                "canonical_text_chirho": verse_chirho.canonical_text_chirho,
                "translation_chirho": None,
                "gloss_origin_chirho": "gbt_approved" if glossed_chirho else "unavailable",
                "tokens_chirho": tokens_chirho,
                **({"source_notes_chirho": notes_chirho} if notes_chirho else {}),
                "sources_chirho": sources_chirho + (gloss_sources_chirho if glossed_chirho else []),
            }
        )
    return records_chirho, source_chirho


def greek_records_chirho(book_chirho, verses_chirho, pins_chirho):
    entries_chirho, notes_chirho = gloss_entries_chirho(
        read_verified_bytes_chirho(pins_chirho["berean-glosses-chirho"]), book_chirho["id_chirho"]
    )
    glosses_chirho, _ = join_berean_chirho(verses_chirho, entries_chirho)
    sources_chirho = source_records_chirho(
        pins_chirho,
        ["nestle1904-morph-chirho", "nestle1904-parsing-chirho", "berean-glosses-chirho"],
    )
    passages_chirho = parenthesized_passages_chirho(verses_chirho)
    order_chirho = {
        verse_chirho.osis_id_chirho: index_chirho
        for index_chirho, verse_chirho in enumerate(verses_chirho)
    }
    records_chirho = []
    for verse_chirho in verses_chirho:
        tokens_chirho = [
            token_chirho(
                word_chirho, start_chirho, end_chirho, *glosses_chirho[word_chirho.id_chirho]
            )
            for word_chirho, start_chirho, end_chirho in verse_chirho.words_chirho
        ]
        source_notes_chirho = [
            {
                "kind_chirho": "gloss_editor_note",
                "code_chirho": "status",
                "text_chirho": text_chirho,
                "before_token_id_chirho": before_chirho,
            }
            for verse_id_chirho, before_chirho, text_chirho in notes_chirho
            if verse_id_chirho == verse_chirho.osis_id_chirho
        ]
        for first_chirho, last_chirho in passages_chirho:
            if (
                order_chirho[first_chirho]
                <= order_chirho[verse_chirho.osis_id_chirho]
                <= order_chirho[last_chirho]
            ):
                source_notes_chirho.append(
                    {
                        "kind_chirho": "parenthesized_passage",
                        "text_chirho": f"Nestle 1904 prints {first_chirho} through {last_chirho} in parentheses.",
                        "first_verse_id_chirho": first_chirho,
                        "last_verse_id_chirho": last_chirho,
                    }
                )
        if "[" in verse_chirho.canonical_text_chirho or "]" in verse_chirho.canonical_text_chirho:
            source_notes_chirho.append(
                {
                    "kind_chirho": "edition_brackets",
                    "text_chirho": "Square brackets are printed by the Nestle 1904 source and are preserved here.",
                }
            )
        records_chirho.append(
            {
                "schema_version_chirho": 1,
                "id_chirho": verse_chirho.osis_id_chirho,
                "language_chirho": "grc",
                "reference_chirho": f"{book_chirho['label_chirho']} {verse_chirho.chapter_chirho}:{verse_chirho.verse_chirho}",
                "canonical_text_chirho": verse_chirho.canonical_text_chirho,
                "translation_chirho": None,
                "gloss_origin_chirho": "berean_interlinear",
                "tokens_chirho": tokens_chirho,
                "sources_chirho": sources_chirho,
                **({"source_notes_chirho": source_notes_chirho} if source_notes_chirho else {}),
            }
        )
    return records_chirho, pins_chirho["nestle1904-morph-chirho"]


def book_outputs_chirho(book_chirho, records_chirho, source_chirho):
    chapters_chirho = chapter_texts_chirho(book_chirho["id_chirho"], records_chirho)
    entries_chirho = []
    for number_chirho, text_chirho in sorted(chapters_chirho.items()):
        numbers_chirho = [
            int(record_chirho["id_chirho"].split(".")[2])
            for record_chirho in records_chirho
            if int(record_chirho["id_chirho"].split(".")[1]) == number_chirho
        ]
        entry_chirho = {
            "number_chirho": number_chirho,
            "verse_count_chirho": len(numbers_chirho),
            "path_chirho": f"/content-chirho/{book_chirho['slug_chirho']}/chapter-{number_chirho:02d}-chirho.json",
            "sha256_chirho": sha256_text_chirho(text_chirho),
        }
        if numbers_chirho != list(range(1, len(numbers_chirho) + 1)):
            entry_chirho["verse_numbers_chirho"] = numbers_chirho
            entry_chirho["numbering_note_chirho"] = (
                "Only verses present in the pinned source edition are listed; omitted numbers are not fabricated."
            )
        entries_chirho.append(entry_chirho)
    manifest_chirho = {
        "schema_version_chirho": 1,
        "book_id_chirho": book_chirho["id_chirho"],
        "label_chirho": book_chirho["label_chirho"],
        "language_chirho": book_chirho["language_chirho"],
        "revision_chirho": source_chirho.commit_chirho,
        "source_sha256_chirho": source_chirho.sha256_chirho,
        "chapters_chirho": entries_chirho,
    }
    directory_chirho = ROOT_CHIRHO / "static/content-chirho" / book_chirho["slug_chirho"]
    outputs_chirho = {
        directory_chirho / f"chapter-{number_chirho:02d}-chirho.json": text_chirho
        for number_chirho, text_chirho in chapters_chirho.items()
    }
    outputs_chirho[directory_chirho / "manifest-chirho.json"] = json_text_chirho(
        manifest_chirho, 99
    )
    tokens_chirho = [
        token_chirho
        for record_chirho in records_chirho
        for token_chirho in record_chirho["tokens_chirho"]
    ]
    report_chirho = {
        "schema_version_chirho": 1,
        "book_id_chirho": book_chirho["id_chirho"],
        "chapters_chirho": len(chapters_chirho),
        "verses_chirho": len(records_chirho),
        "words_chirho": len(tokens_chirho),
        "glossed_words_chirho": sum(
            token_chirho["gloss_chirho"] is not None for token_chirho in tokens_chirho
        ),
        "analysis_withheld_chirho": sum(
            token_chirho.get("analysis_status_chirho") == "source_review_required"
            for token_chirho in tokens_chirho
        ),
        "source_languages_chirho": dict(
            Counter(
                token_chirho.get("source_language_chirho", "grc") for token_chirho in tokens_chirho
            )
        ),
        "largest_chapter_bytes_chirho": max(
            len(text_chirho.encode()) for text_chirho in chapters_chirho.values()
        ),
    }
    outputs_chirho[
        ROOT_CHIRHO
        / "data-chirho/bible-chirho/reports-chirho"
        / f"{(int(book_chirho['gbt_file_chirho'][:2]) - 1) // 10 * 10:04d}-chirho"
        / (book_chirho["slug_chirho"] + "-import-report-chirho.json")
    ] = json_text_chirho(report_chirho, 99)
    return outputs_chirho


def main_chirho():
    parser_chirho = argparse.ArgumentParser(description=__doc__)
    parser_chirho.add_argument("--check", action="store_true")
    parser_chirho.add_argument("--book-chirho")
    options_chirho = parser_chirho.parse_args()
    registry_path_chirho = ROOT_CHIRHO / "config-chirho/bible-chirho/books-chirho.json"
    registry_chirho = json.loads(registry_path_chirho.read_text())
    shared_chirho = load_manifest_chirho(ROOT_CHIRHO / "data-chirho/sources-chirho")
    pins_chirho = load_manifest_chirho(ROOT_CHIRHO / "data-chirho/bible-chirho/sources-chirho")
    corpus_pins_chirho = load_manifest_chirho(
        ROOT_CHIRHO / "data-chirho/corpus-chirho/sources-chirho"
    )
    lexicon_chirho = LexiconChirho(
        parse_strong_chirho(read_verified_bytes_chirho(shared_chirho["strong-chirho"])),
        parse_aug_index_chirho(read_verified_bytes_chirho(shared_chirho["aug-index-chirho"])),
        parse_lexical_index_chirho(
            read_verified_bytes_chirho(shared_chirho["lexical-index-chirho"])
        ),
    )
    greek_books_chirho = read_books_chirho(
        read_verified_bytes_chirho(corpus_pins_chirho["nestle1904-morph-chirho"])
    )
    failures_chirho = 0
    for index_chirho, book_chirho in enumerate(registry_chirho["books_chirho"], 1):
        id_chirho = book_chirho["id_chirho"]
        if id_chirho in greek_books_chirho:
            book_chirho["chapter_count_chirho"] = max(
                verse_chirho.chapter_chirho for verse_chirho in greek_books_chirho[id_chirho]
            )
        BOOK_NUMBER_CHIRHO[id_chirho] = index_chirho
        if (
            id_chirho in ("Prov", "John", "Gen")
            or options_chirho.book_chirho
            and options_chirho.book_chirho != id_chirho
        ):
            continue
        try:
            records_chirho, source_chirho = (
                hebrew_records_chirho(book_chirho, pins_chirho, shared_chirho, lexicon_chirho)
                if book_chirho["language_chirho"] == "he"
                else greek_records_chirho(
                    book_chirho, greek_books_chirho[id_chirho], corpus_pins_chirho
                )
            )
            outputs_chirho = book_outputs_chirho(book_chirho, records_chirho, source_chirho)
            for path_chirho, text_chirho in outputs_chirho.items():
                if options_chirho.check:
                    if not path_chirho.exists() or path_chirho.read_bytes() != text_chirho.encode():
                        raise ValueError(
                            f"Generated output drift: {path_chirho.relative_to(ROOT_CHIRHO)}"
                        )
                elif not path_chirho.exists() or path_chirho.read_bytes() != text_chirho.encode():
                    write_atomically_chirho(path_chirho, text_chirho)
            book_chirho["chapter_count_chirho"] = len(
                {record_chirho["id_chirho"].split(".")[1] for record_chirho in records_chirho}
            )
            print(
                f"{id_chirho}: {len(records_chirho)} verses, {len(outputs_chirho)} files {'verified' if options_chirho.check else 'written'}",
                flush=True,
            )
        except (ValueError, KeyError) as error_chirho:
            failures_chirho += 1
            print(f"REFUSED {id_chirho}: {error_chirho}", file=sys.stderr, flush=True)
    if not options_chirho.check:
        write_atomically_chirho(
            registry_path_chirho, json.dumps(registry_chirho, ensure_ascii=False, indent=2) + "\n"
        )
    return 1 if failures_chirho else 0


if __name__ == "__main__":
    raise SystemExit(main_chirho())
