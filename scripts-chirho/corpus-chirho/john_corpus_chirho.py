# For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life. — John 3:16 (KJV)
"""John from the pinned Nestle 1904: staged Greek chapters, manifest, report and scene jobs.

Workflow: scripts-chirho/corpus-chirho/README-chirho.md, "Greek corpus import", node john_chirho.
The reader's GreekLesson schema accepted these verses, so the chapters go to
static/content-chirho/john-chirho/ for the local reader (publishing is a separate decision). A
staged copy with identical chapter bytes stays in data-chirho/corpus-chirho/john-chirho/. Each verse follows the proposed Greek shape in the
README. English glosses come from the Berean Interlinear join, guarded by the Greek word (node
berean_chirho); no roots are assigned.
"""

from __future__ import annotations

from collections import Counter
from pathlib import Path

from berean_glosses_chirho import berean_entries_chirho, join_berean_chirho
from corpus_inventories_chirho import (
    SceneBookChirho,
    greek_lemma_inventory_text_chirho,
    image_jobs_text_chirho,
)
from corpus_outputs_chirho import json_text_chirho, sha256_text_chirho, source_record_chirho
from greek_morphology_chirho import (
    decode_greek_chirho,
    describe_greek_chirho,
    greek_categories_chirho,
    teaching_group_chirho,
)
from nestle_book_chirho import (
    GreekVerseChirho,
    GreekWordChirho,
    parenthesized_passages_chirho,
    read_book_chirho,
)
from source_files_chirho import PinnedFileChirho, read_verified_bytes_chirho

BOOK_ID_CHIRHO = "John"
PUBLIC_PREFIX_CHIRHO = "/content-chirho/john-chirho/"
JOHN_SCENES_CHIRHO = SceneBookChirho("John", "john-v1-chirho", "john", PUBLIC_PREFIX_CHIRHO)
READER_NOTE_CHIRHO = (
    "Read by the local reader under the GreekLesson schema; publishing it is a separate decision."
)
STAGING_NOTE_CHIRHO = (
    "Staged copy with the same chapter bytes as static/content-chirho/john-chirho/, kept while "
    "tests read it."
)
SOURCE_IDS_CHIRHO = ("nestle1904-morph-chirho", "nestle1904-parsing-chirho")
GLOSS_SOURCE_ID_CHIRHO = "berean-glosses-chirho"
OPTIONAL_FIELDS_CHIRHO = (
    "person_chirho",
    "tense_chirho",
    "voice_chirho",
    "mood_chirho",
    "degree_chirho",
    "possessor_person_chirho",
    "possessor_number_chirho",
    "suffixes_chirho",
    "verb_extras_chirho",
)
UNCURATED_NOTE_CHIRHO = (
    "Uncurated: Nestle 1904 word with the biblicalhumanities CC0 parse as given; the analysis is "
    "generated from parsing.txt."
)
ROOT_NOTE_CHIRHO = "Not reviewed: no root is assigned to this word yet."


def reference_chirho(osis_id_chirho: str) -> str:
    book_chirho, chapter_chirho, verse_chirho = osis_id_chirho.split(".")
    return f"{book_chirho} {chapter_chirho}:{verse_chirho}"


def span_label_chirho(first_chirho: str, last_chirho: str) -> str:
    """John 5:3-4 within a chapter, John 7:53-8:11 across chapters."""
    _, first_chapter_chirho, first_verse_chirho = first_chirho.split(".")
    _, last_chapter_chirho, last_verse_chirho = last_chirho.split(".")
    tail_chirho = (
        last_verse_chirho
        if first_chapter_chirho == last_chapter_chirho
        else f"{last_chapter_chirho}:{last_verse_chirho}"
    )
    return f"{BOOK_ID_CHIRHO} {first_chapter_chirho}:{first_verse_chirho}-{tail_chirho}"


def greek_token_chirho(
    word_chirho: GreekWordChirho,
    start_chirho: int,
    end_chirho: int,
    gloss_chirho: str | None,
    gloss_note_chirho: str,
) -> dict:
    fields_chirho = decode_greek_chirho(word_chirho.func_morph_chirho)
    decode_greek_chirho(word_chirho.form_morph_chirho)  # the formal parse must decode too
    notes_chirho = [UNCURATED_NOTE_CHIRHO]
    if word_chirho.strongs_chirho.startswith("0"):
        notes_chirho.append(
            f"The source writes Strong's number {word_chirho.strongs_chirho} with a leading zero; "
            f"the lemma shown is the source's own ({word_chirho.lemma_chirho})."
        )
    if word_chirho.form_morph_chirho != word_chirho.func_morph_chirho:
        notes_chirho.append(
            f"Its formal parse {word_chirho.form_morph_chirho} differs from the functional parse "
            f"{word_chirho.func_morph_chirho} shown here."
        )
    notes_chirho.append(gloss_note_chirho)
    token_chirho = {
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
        "pos_chirho": teaching_group_chirho(fields_chirho["part_of_speech_chirho"]),
        "part_of_speech_chirho": fields_chirho["part_of_speech_chirho"],
        **greek_categories_chirho(fields_chirho),
    }
    token_chirho |= {
        key_chirho: fields_chirho[key_chirho]
        for key_chirho in OPTIONAL_FIELDS_CHIRHO
        if key_chirho in fields_chirho
    }
    return token_chirho | {
        "root_text_chirho": None,
        "root_entry_id_chirho": None,
        "root_status_chirho": "unresolved",
        "root_note_chirho": ROOT_NOTE_CHIRHO,
        "gloss_chirho": gloss_chirho,
        "analysis_chirho": describe_greek_chirho(fields_chirho),
        "source_note_chirho": " ".join(notes_chirho),
    }


def john_records_chirho(
    verses_chirho: tuple[GreekVerseChirho, ...],
    sources_chirho: list[dict],
    passages_chirho: list[tuple[str, str]],
    glosses_chirho: dict[str, tuple[str | None, str]],
    gloss_sources_chirho: list[dict],
    editor_notes_chirho: list[tuple[str | None, str | None, str]],
) -> tuple[list[dict], dict[str, str]]:
    """Verse records plus a textual note for every verse inside a parenthesized passage."""
    order_chirho = [verse_chirho.osis_id_chirho for verse_chirho in verses_chirho]
    notes_chirho: dict[str, dict] = {}
    for first_chirho, last_chirho in passages_chirho:
        label_chirho = span_label_chirho(first_chirho, last_chirho)
        for osis_chirho in order_chirho[
            order_chirho.index(first_chirho) : order_chirho.index(last_chirho) + 1
        ]:
            notes_chirho[osis_chirho] = {
                "kind_chirho": "parenthesized_passage",
                "code_chirho": "parentheses",
                "text_chirho": f"Nestle 1904 prints {label_chirho} in parentheses.",
                "first_verse_id_chirho": first_chirho,
                "last_verse_id_chirho": last_chirho,
            }
    records_chirho = []
    for verse_chirho in verses_chirho:
        tokens_chirho = [
            greek_token_chirho(word, start, end, *glosses_chirho[word.id_chirho])
            for word, start, end in verse_chirho.words_chirho
        ]
        glossed_chirho = any(token["gloss_chirho"] is not None for token in tokens_chirho)
        record_chirho = {
            "schema_version_chirho": 1,
            "id_chirho": verse_chirho.osis_id_chirho,
            "language_chirho": "grc",
            "reference_chirho": reference_chirho(verse_chirho.osis_id_chirho),
            "canonical_text_chirho": verse_chirho.canonical_text_chirho,
            "translation_chirho": None,
            "gloss_origin_chirho": "berean_interlinear" if glossed_chirho else "unavailable",
            "tokens_chirho": tokens_chirho,
        }
        source_notes_chirho = (
            [notes_chirho[verse_chirho.osis_id_chirho]]
            if verse_chirho.osis_id_chirho in notes_chirho
            else []
        )
        source_notes_chirho += [
            {
                "kind_chirho": "gloss_editor_note",
                "code_chirho": "status",
                "text_chirho": text_chirho,
                "before_token_id_chirho": before_chirho,
            }
            for verse_id_chirho, before_chirho, text_chirho in editor_notes_chirho
            if verse_id_chirho == verse_chirho.osis_id_chirho
        ]
        if source_notes_chirho:
            record_chirho["source_notes_chirho"] = source_notes_chirho
        record_chirho["sources_chirho"] = sources_chirho + (
            gloss_sources_chirho if glossed_chirho else []
        )
        records_chirho.append(record_chirho)
    textual_chirho = {
        osis_chirho: note_chirho["text_chirho"] for osis_chirho, note_chirho in notes_chirho.items()
    }
    return records_chirho, textual_chirho


def john_outputs_chirho(
    repo_root_chirho: Path,
    corpus_pinned_chirho: dict[str, PinnedFileChirho],
    style_bytes_chirho: bytes,
) -> dict[Path, str]:
    source_chirho = corpus_pinned_chirho["nestle1904-morph-chirho"]
    read_verified_bytes_chirho(corpus_pinned_chirho["nestle1904-morph-readme-chirho"])
    read_verified_bytes_chirho(corpus_pinned_chirho["nestle1904-parsing-chirho"])
    verses_chirho = read_book_chirho(read_verified_bytes_chirho(source_chirho), BOOK_ID_CHIRHO)
    sources_chirho = [
        source_record_chirho(
            corpus_pinned_chirho[file_id_chirho],
            corpus_pinned_chirho[file_id_chirho].adaptation_chirho,
        )
        for file_id_chirho in SOURCE_IDS_CHIRHO
    ]
    passages_chirho = parenthesized_passages_chirho(verses_chirho)
    gloss_pin_chirho = corpus_pinned_chirho[GLOSS_SOURCE_ID_CHIRHO]
    read_verified_bytes_chirho(corpus_pinned_chirho["berean-glosses-readme-chirho"])
    entries_chirho, editor_notes_chirho = berean_entries_chirho(
        read_verified_bytes_chirho(gloss_pin_chirho), BOOK_ID_CHIRHO
    )
    glosses_chirho, gloss_outcomes_chirho = join_berean_chirho(verses_chirho, entries_chirho)
    records_chirho, textual_chirho = john_records_chirho(
        verses_chirho,
        sources_chirho,
        passages_chirho,
        glosses_chirho,
        [source_record_chirho(gloss_pin_chirho, gloss_pin_chirho.adaptation_chirho)],
        editor_notes_chirho,
    )
    corpus_dir_chirho = repo_root_chirho / "data-chirho" / "corpus-chirho"
    staged_dir_chirho = corpus_dir_chirho / "john-chirho"
    static_dir_chirho = repo_root_chirho / "static" / "content-chirho" / "john-chirho"
    chapters_chirho: dict[int, list[dict]] = {}
    for record_chirho in records_chirho:
        chapters_chirho.setdefault(int(record_chirho["id_chirho"].split(".")[1]), []).append(
            record_chirho
        )
    texts_chirho = {
        number_chirho: json_text_chirho(
            {
                "book_id_chirho": BOOK_ID_CHIRHO,
                "chapter_chirho": number_chirho,
                "verses_chirho": verses_chirho,
            },
            compact_depth_chirho=4,
        )
        for number_chirho, verses_chirho in chapters_chirho.items()
    }
    chapter_list_chirho = [
        {
            "number_chirho": number_chirho,
            "verse_count_chirho": len(chapters_chirho[number_chirho]),
            "path_chirho": f"{PUBLIC_PREFIX_CHIRHO}chapter-{number_chirho:02d}-chirho.json",
            "sha256_chirho": sha256_text_chirho(text_chirho),
        }
        for number_chirho, text_chirho in sorted(texts_chirho.items())
    ]
    manifest_head_chirho = {
        "schema_version_chirho": 1,
        "book_id_chirho": BOOK_ID_CHIRHO,
        "label_chirho": "John",
        "language_chirho": "grc",
        "revision_chirho": source_chirho.commit_chirho,
        "source_sha256_chirho": source_chirho.sha256_chirho,
    }
    # The reader loads the static copy; the staged copy keeps identical chapter bytes until the
    # fleet lead's tests no longer read it.
    outputs_chirho: dict[Path, str] = {}
    for directory_chirho, state_chirho in (
        (
            static_dir_chirho,
            {"reader_state_chirho": "local_reader", "reader_note_chirho": READER_NOTE_CHIRHO},
        ),
        (staged_dir_chirho, {"staged_chirho": True, "staging_note_chirho": STAGING_NOTE_CHIRHO}),
    ):
        outputs_chirho |= {
            directory_chirho / f"chapter-{number_chirho:02d}-chirho.json": text_chirho
            for number_chirho, text_chirho in texts_chirho.items()
        }
        outputs_chirho[directory_chirho / "manifest-chirho.json"] = json_text_chirho(
            manifest_head_chirho | state_chirho | {"chapters_chirho": chapter_list_chirho},
            compact_depth_chirho=99,
        )
    tokens_chirho = [token for record in records_chirho for token in record["tokens_chirho"]]
    outputs_chirho[corpus_dir_chirho / "john-import-report-chirho.json"] = json_text_chirho(
        {
            "schema_version_chirho": 1,
            "verses_chirho": len(records_chirho),
            "words_chirho": len(tokens_chirho),
            "unique_lemmas_chirho": len({token["lemma_id_chirho"] for token in tokens_chirho}),
            "pos_chirho": dict(
                sorted(Counter(token["pos_chirho"] for token in tokens_chirho).items())
            ),
            "part_of_speech_chirho": dict(
                sorted(Counter(token["part_of_speech_chirho"] for token in tokens_chirho).items())
            ),
            "formal_parse_differs_chirho": sum(
                token["raw_form_morphology_chirho"] != token["raw_morphology_chirho"]
                for token in tokens_chirho
            ),
            "parenthesized_passages_chirho": [
                span_label_chirho(*passage) for passage in passages_chirho
            ],
            "verses_in_passages_chirho": len(textual_chirho),
            "gloss_join_chirho": dict(sorted(gloss_outcomes_chirho.items())),
            "gloss_editor_notes_chirho": [
                {"verse_id_chirho": verse_id, "before_token_id_chirho": before, "text_chirho": text}
                for verse_id, before, text in editor_notes_chirho
            ],
            "gloss_origin_chirho": dict(
                sorted(Counter(record["gloss_origin_chirho"] for record in records_chirho).items())
            ),
        },
        compact_depth_chirho=2,
    )
    outputs_chirho[corpus_dir_chirho / "john-lemma-inventory-chirho.json"] = (
        greek_lemma_inventory_text_chirho(
            records_chirho, [source_chirho, gloss_pin_chirho], BOOK_ID_CHIRHO
        )
    )
    outputs_chirho[corpus_dir_chirho / "john-image-jobs-chirho.json"] = image_jobs_text_chirho(
        records_chirho, JOHN_SCENES_CHIRHO, source_chirho, style_bytes_chirho, textual_chirho
    )
    return outputs_chirho
