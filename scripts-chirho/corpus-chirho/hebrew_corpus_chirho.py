# For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life. — John 3:16 (KJV)
"""One Hebrew book from pinned OSHB sources: chapters, manifest, report, scene jobs, lemma inventory.

Workflow: scripts-chirho/corpus-chirho/README-chirho.md, "Corpus import", node hebrew_chirho.
A book is either published (its chapters go to static/content-chirho/<slug>-chirho/, as Proverbs)
or staged (data-chirho/corpus-chirho/<slug>-chirho/, until the fleet lead promotes it). Both use
the same parser, tokens, GBT join and writers; nothing here is specific to one book.
"""

from __future__ import annotations

from collections import Counter
from dataclasses import dataclass
from pathlib import Path

from corpus_inventories_chirho import (
    PROVERBS_SCENES_CHIRHO,
    SceneBookChirho,
    image_jobs_text_chirho,
    lemma_inventory_text_chirho,
)
from corpus_outputs_chirho import (
    CORPUS_ADAPTATIONS_CHIRHO,
    chapter_name_chirho,
    chapter_texts_chirho,
    manifest_text_chirho,
    report_text_chirho,
    source_record_chirho,
)
from corpus_tokens_chirho import LexiconChirho, verse_record_chirho
from gbt_glosses_chirho import gbt_verses_chirho, join_glosses_chirho
from oshb_book_chirho import parse_book_chirho
from source_files_chirho import PinnedFileChirho, read_verified_bytes_chirho

LEXICON_SOURCE_IDS_CHIRHO = (
    "oshb-morphology-codes-chirho",
    "strong-chirho",
    "aug-index-chirho",
    "lexical-index-chirho",
)
STAGING_NOTE_CHIRHO = (
    "Staged under data-chirho/corpus-chirho/{slug}-chirho/; the paths below are where the "
    "chapters go once the fleet lead promotes this book."
)
READER_NOTE_CHIRHO = "Read by the local reader; publishing it is a separate decision."


@dataclass(frozen=True)
class HebrewBookChirho:
    book_id_chirho: str
    label_chirho: str
    slug_chirho: str
    # The OSIS book's pin: in the lesson lane's manifest (Proverbs) or the corpus manifest.
    source_id_chirho: str
    source_in_corpus_chirho: bool
    gbt_english_id_chirho: str
    gbt_source_words_id_chirho: str
    published_chirho: bool
    scenes_chirho: SceneBookChirho
    # "local_reader" marks a promoted book the reader loads locally; None keeps Proverbs as it is.
    reader_state_chirho: str | None = None

    @property
    def manifest_state_chirho(self) -> dict[str, object] | None:
        if not self.published_chirho:
            return {
                "staged_chirho": True,
                "staging_note_chirho": STAGING_NOTE_CHIRHO.format(slug=self.slug_chirho),
            }
        if self.reader_state_chirho:
            return {
                "reader_state_chirho": self.reader_state_chirho,
                "reader_note_chirho": READER_NOTE_CHIRHO,
            }
        return None

    @property
    def public_prefix_chirho(self) -> str:
        return f"/content-chirho/{self.slug_chirho}-chirho/"


PROVERBS_CHIRHO = HebrewBookChirho(
    book_id_chirho="Prov",
    label_chirho="Proverbs",
    slug_chirho="proverbs",
    source_id_chirho="oshb-prov-chirho",
    source_in_corpus_chirho=False,
    gbt_english_id_chirho="gbt-english-prov-chirho",
    gbt_source_words_id_chirho="gbt-source-words-prov-chirho",
    published_chirho=True,
    scenes_chirho=PROVERBS_SCENES_CHIRHO,
)


def hebrew_sources_chirho(
    book_chirho: HebrewBookChirho,
    source_chirho: PinnedFileChirho,
    pinned_chirho: dict[str, PinnedFileChirho],
) -> list[dict]:
    """The book's own record, then the code document and lexicon files every token draws on."""
    adaptation_chirho = (
        source_chirho.adaptation_chirho
        if book_chirho.source_in_corpus_chirho
        else CORPUS_ADAPTATIONS_CHIRHO[book_chirho.source_id_chirho]
    )
    return [source_record_chirho(source_chirho, adaptation_chirho)] + [
        source_record_chirho(
            pinned_chirho[file_id_chirho], CORPUS_ADAPTATIONS_CHIRHO[file_id_chirho]
        )
        for file_id_chirho in LEXICON_SOURCE_IDS_CHIRHO
    ]


def hebrew_book_outputs_chirho(
    book_chirho: HebrewBookChirho,
    repo_root_chirho: Path,
    pinned_chirho: dict[str, PinnedFileChirho],
    corpus_pinned_chirho: dict[str, PinnedFileChirho],
    lexicon_chirho: LexiconChirho,
    style_bytes_chirho: bytes,
) -> dict[Path, str]:
    source_chirho = (
        corpus_pinned_chirho if book_chirho.source_in_corpus_chirho else pinned_chirho
    )[book_chirho.source_id_chirho]
    verses_chirho = parse_book_chirho(
        read_verified_bytes_chirho(source_chirho), book_chirho.book_id_chirho
    )
    join_chirho = join_glosses_chirho(
        book_chirho.book_id_chirho,
        verses_chirho,
        gbt_verses_chirho(
            read_verified_bytes_chirho(
                corpus_pinned_chirho[book_chirho.gbt_source_words_id_chirho]
            ),
            "hbo+grc",
        ),
        gbt_verses_chirho(
            read_verified_bytes_chirho(corpus_pinned_chirho[book_chirho.gbt_english_id_chirho]),
            "eng",
        ),
    )
    gloss_sources_chirho = [
        source_record_chirho(
            corpus_pinned_chirho[file_id_chirho],
            corpus_pinned_chirho[file_id_chirho].adaptation_chirho,
        )
        for file_id_chirho in (
            book_chirho.gbt_english_id_chirho,
            book_chirho.gbt_source_words_id_chirho,
        )
    ]
    sources_chirho = hebrew_sources_chirho(book_chirho, source_chirho, pinned_chirho)
    records_chirho = [
        verse_record_chirho(
            verse_chirho,
            book_chirho.label_chirho,
            lexicon_chirho,
            join_chirho.glosses_chirho,
            sources_chirho,
            gloss_sources_chirho,
        )
        for verse_chirho in verses_chirho
    ]
    corpus_dir_chirho = repo_root_chirho / "data-chirho" / "corpus-chirho"
    content_dir_chirho = (
        repo_root_chirho / "static" / "content-chirho" / f"{book_chirho.slug_chirho}-chirho"
        if book_chirho.published_chirho
        else corpus_dir_chirho / f"{book_chirho.slug_chirho}-chirho"
    )
    chapters_chirho = chapter_texts_chirho(book_chirho.book_id_chirho, records_chirho)
    outputs_chirho = {
        content_dir_chirho / chapter_name_chirho(number_chirho): text_chirho
        for number_chirho, text_chirho in chapters_chirho.items()
    }
    outputs_chirho[content_dir_chirho / "manifest-chirho.json"] = manifest_text_chirho(
        book_chirho.book_id_chirho,
        book_chirho.label_chirho,
        source_chirho,
        chapters_chirho,
        Counter(verse_chirho.chapter_chirho for verse_chirho in verses_chirho),
        book_chirho.public_prefix_chirho,
        book_chirho.manifest_state_chirho,
    )
    slug_chirho = book_chirho.slug_chirho
    outputs_chirho[corpus_dir_chirho / f"{slug_chirho}-import-report-chirho.json"] = (
        report_text_chirho(records_chirho, join_chirho.outcomes_chirho)
    )
    outputs_chirho[corpus_dir_chirho / f"{slug_chirho}-image-jobs-chirho.json"] = (
        image_jobs_text_chirho(
            records_chirho, book_chirho.scenes_chirho, source_chirho, style_bytes_chirho
        )
    )
    outputs_chirho[corpus_dir_chirho / f"{slug_chirho}-lemma-inventory-chirho.json"] = (
        lemma_inventory_text_chirho(
            records_chirho,
            lexicon_chirho.aug_index_chirho,
            [source_chirho]
            + [pinned_chirho[file_id_chirho] for file_id_chirho in LEXICON_SOURCE_IDS_CHIRHO[1:]]
            + [corpus_pinned_chirho[book_chirho.gbt_english_id_chirho]],
            book_chirho.book_id_chirho,
        )
    )
    return outputs_chirho


# Promoted to the local reader (fleet lead, broker #30393); its scene jobs still wait behind
# Proverbs and John.
GENESIS_CHIRHO = HebrewBookChirho(
    book_id_chirho="Gen",
    label_chirho="Genesis",
    slug_chirho="genesis",
    source_id_chirho="oshb-gen-chirho",
    source_in_corpus_chirho=True,
    gbt_english_id_chirho="gbt-english-gen-chirho",
    gbt_source_words_id_chirho="gbt-source-words-gen-chirho",
    published_chirho=True,
    scenes_chirho=SceneBookChirho(
        "Gen", "genesis-v1-chirho", "gen", "/content-chirho/genesis-chirho/"
    ),
    reader_state_chirho="local_reader",
)
