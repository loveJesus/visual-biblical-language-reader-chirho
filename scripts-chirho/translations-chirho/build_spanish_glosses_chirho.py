# For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life. — John 3:16 (KJV)
"""Build the Spanish word-gloss layers: one static, hash-listed file per chapter, offline.

Workflow: scripts-chirho/translations-chirho/README-chirho.md, "Spanish glosses", node
spanish_chirho.

    python3 -I -B scripts-chirho/translations-chirho/build_spanish_glosses_chirho.py          # write
    python3 -I -B scripts-chirho/translations-chirho/build_spanish_glosses_chirho.py --check  # drift

Glosses are GBT's approved Spanish export, pinned in
data-chirho/translations-chirho/sources-chirho/. Hebrew words take them through the corpus's
own guarded GBT join. John's words are aligned in order against GBT's Greek source words, and a
gloss is taken only where the two words have identical letters and marks. Anything unproven
stays null. The English corpus and the canonical Hebrew/Greek are read, never written.

Each layer is bound to the exact published chapter it glosses (content_path_chirho and
content_sha256_chirho). The build refuses unless that chapter's bytes match its content manifest
and its word ids and texts equal the words the glosses were joined to. The reader withholds a
layer whose binding differs from the chapter it is showing, so a changed source word can never
silently keep an old Spanish meaning; regenerate offline instead.
"""

from __future__ import annotations

import argparse
import difflib
import hashlib
import json
import re
import sys
import unicodedata
from pathlib import Path

HERE_CHIRHO = Path(__file__).resolve().parent
sys.path[:0] = [
    str(HERE_CHIRHO),
    str(HERE_CHIRHO.parent / "corpus-chirho"),
    str(HERE_CHIRHO.parent / "import-chirho"),
]
sys.dont_write_bytecode = True

from build_corpus_chirho import REFUSALS_CHIRHO, write_atomically_chirho
from corpus_outputs_chirho import json_text_chirho, sha256_text_chirho
from gbt_glosses_chirho import gbt_verses_chirho, join_glosses_chirho
from nestle_book_chirho import read_book_chirho
from oshb_book_chirho import parse_book_chirho
from source_files_chirho import (
    PinnedFileChirho,
    load_manifest_chirho,
    read_verified_bytes_chirho,
)

REPO_ROOT_CHIRHO = HERE_CHIRHO.parents[1]
OUTPUT_DIR_CHIRHO = REPO_ROOT_CHIRHO / "static" / "glosses-chirho" / "es-chirho"
PUBLIC_PREFIX_CHIRHO = "/glosses-chirho/es-chirho/"
# (book id, slug, Spanish label, manifest holding the OSIS book, its pin, GBT source words, Spanish)
HEBREW_BOOKS_CHIRHO = (
    (
        "Prov",
        "proverbs",
        "Proverbios",
        "lesson",
        "oshb-prov-chirho",
        "gbt-source-words-prov-chirho",
        "gbt-spanish-prov-chirho",
    ),
    (
        "Gen",
        "genesis",
        "Génesis",
        "corpus",
        "oshb-gen-chirho",
        "gbt-source-words-gen-chirho",
        "gbt-spanish-gen-chirho",
    ),
)


def source_record_chirho(pinned_chirho: PinnedFileChirho) -> dict:
    return {
        "id_chirho": pinned_chirho.id_chirho,
        "title_chirho": pinned_chirho.title_chirho,
        "url_chirho": pinned_chirho.blob_url_chirho,
        "revision_chirho": pinned_chirho.commit_chirho,
        "sha256_chirho": pinned_chirho.sha256_chirho,
        "license_chirho": pinned_chirho.license_chirho,
        "attribution_chirho": pinned_chirho.attribution_chirho,
    }


def letters_chirho(text_chirho: str) -> str:
    """NFD letters and marks only: punctuation, brackets and format characters drop out."""
    return "".join(
        character_chirho
        for character_chirho in unicodedata.normalize("NFD", text_chirho)
        if unicodedata.category(character_chirho)[0] in "LM"
    )


SUB_ENTRIES_CHIRHO = [0]


class SpanishSourceErrorChirho(ValueError):
    """A Spanish gloss file whose word ids do not belong to their verse."""


class ContentBindingErrorChirho(ValueError):
    """A published chapter that is not exactly the one these glosses were joined to."""


def glosses_by_verse_chirho(data_chirho: bytes) -> dict[str, list[dict]]:
    """Verse id -> its gloss entries, keyed by word id.

    GBT skips unapproved words, so ids may have gaps, but each must sit in its own verse and
    appear once. Sub-entries such as 4300103704-01 attach an extra gloss whose word the export
    does not say; they are counted in SUB_ENTRIES_CHIRHO and never merged into a word's gloss.
    """
    verses_chirho: dict[str, list[dict]] = {}
    for chapter_chirho in json.loads(data_chirho)["chapters"]:
        for verse_chirho in chapter_chirho["verses"]:
            ids_chirho = [word_chirho["id"] for word_chirho in verse_chirho["words"]]
            shape_chirho = re.compile(re.escape(verse_chirho["id"]) + r"\d{2}(?:-\d{2})?")
            if len(set(ids_chirho)) != len(ids_chirho) or not all(
                shape_chirho.fullmatch(id_chirho) for id_chirho in ids_chirho
            ):
                raise SpanishSourceErrorChirho(f"{verse_chirho['id']}: word ids outside the verse")
            SUB_ENTRIES_CHIRHO[0] += sum("-" in id_chirho for id_chirho in ids_chirho)
            verses_chirho[verse_chirho["id"]] = [
                word_chirho for word_chirho in verse_chirho["words"] if "-" not in word_chirho["id"]
            ]
    return verses_chirho


def hebrew_glosses_chirho(verses_chirho, source_words_chirho, spanish_chirho, book_id_chirho):
    """Per chapter: token id (main line and qere) -> approved Spanish gloss or None, and the
    same ids -> the source word text the gloss was joined to."""
    join_chirho = join_glosses_chirho(
        book_id_chirho, verses_chirho, source_words_chirho, spanish_chirho
    )
    chapters_chirho: dict[int, dict[str, str | None]] = {}
    texts_chirho: dict[int, dict[str, str]] = {}
    for verse_chirho in verses_chirho:
        layer_chirho = chapters_chirho.setdefault(verse_chirho.chapter_chirho, {})
        words_chirho = texts_chirho.setdefault(verse_chirho.chapter_chirho, {})
        for placed_chirho in verse_chirho.words_chirho:
            for word_chirho in (placed_chirho.word_chirho, *placed_chirho.qere_chirho):
                layer_chirho[word_chirho.id_chirho] = join_chirho.glosses_chirho[
                    word_chirho.id_chirho
                ][0]
                words_chirho[word_chirho.id_chirho] = word_chirho.text_chirho
    return chapters_chirho, texts_chirho


def greek_glosses_chirho(verses_chirho, source_words_chirho, spanish_chirho):
    """Nestle token id -> Spanish gloss of the GBT word with identical letters, matched in order,
    plus the same ids -> their Nestle text, per chapter."""
    chapters_chirho: dict[int, dict[str, str | None]] = {}
    texts_chirho: dict[int, dict[str, str]] = {}
    for verse_chirho in verses_chirho:
        layer_chirho = chapters_chirho.setdefault(verse_chirho.chapter_chirho, {})
        words_chirho = [word_chirho for word_chirho, _, _ in verse_chirho.words_chirho]
        layer_chirho |= {word_chirho.id_chirho: None for word_chirho in words_chirho}
        texts_chirho.setdefault(verse_chirho.chapter_chirho, {}).update(
            (word_chirho.id_chirho, word_chirho.text_chirho) for word_chirho in words_chirho
        )
        gbt_id_chirho = f"43{verse_chirho.chapter_chirho:03d}{verse_chirho.verse_chirho:03d}"
        sources_chirho = source_words_chirho.get(gbt_id_chirho, [])
        glossed_chirho = {
            entry_chirho["id"]: entry_chirho.get("gloss")
            for entry_chirho in spanish_chirho.get(gbt_id_chirho, [])
        }
        matcher_chirho = difflib.SequenceMatcher(
            None,
            [letters_chirho(word_chirho.text_chirho) for word_chirho in words_chirho],
            [letters_chirho(entry_chirho["text"]) for entry_chirho in sources_chirho],
            autojunk=False,
        )
        for block_chirho in matcher_chirho.get_matching_blocks():
            for offset_chirho in range(block_chirho.size):
                word_chirho = words_chirho[block_chirho.a + offset_chirho]
                gloss_chirho = glossed_chirho.get(
                    sources_chirho[block_chirho.b + offset_chirho]["id"]
                )
                if isinstance(gloss_chirho, str) and gloss_chirho.strip():
                    layer_chirho[word_chirho.id_chirho] = gloss_chirho.strip()
    return chapters_chirho, texts_chirho


def published_chapters_chirho(repo_root_chirho: Path, slug_chirho: str) -> dict[int, dict]:
    """The reader's own chapter manifest for a book: chapter number -> its entry."""
    manifest_chirho = json.loads(
        (
            repo_root_chirho
            / "static"
            / "content-chirho"
            / f"{slug_chirho}-chirho"
            / "manifest-chirho.json"
        ).read_bytes()
    )
    return {
        entry_chirho["number_chirho"]: entry_chirho
        for entry_chirho in manifest_chirho["chapters_chirho"]
    }


def content_binding_chirho(
    repo_root_chirho: Path, entry_chirho: dict, words_chirho: dict[str, str]
) -> dict[str, str]:
    """Bind a layer to its published chapter, verified byte for byte and word for word."""
    path_chirho = entry_chirho["path_chirho"]
    if not re.fullmatch(r"/content-chirho/[a-z]+-chirho/chapter-\d{2}-chirho\.json", path_chirho):
        raise ContentBindingErrorChirho(f"{path_chirho}: unexpected content path")
    data_chirho = (repo_root_chirho / "static" / path_chirho.lstrip("/")).read_bytes()
    sha256_chirho = hashlib.sha256(data_chirho).hexdigest()
    if sha256_chirho != entry_chirho["sha256_chirho"]:
        raise ContentBindingErrorChirho(f"{path_chirho}: bytes differ from the content manifest")
    published_chirho: dict[str, str] = {}
    for verse_chirho in json.loads(data_chirho)["verses_chirho"]:
        for token_chirho in verse_chirho["tokens_chirho"]:
            for word_chirho in (token_chirho, *(token_chirho.get("qere_chirho") or [])):
                published_chirho[word_chirho["id_chirho"]] = word_chirho["text_chirho"]
    if published_chirho != words_chirho:
        raise ContentBindingErrorChirho(
            f"{path_chirho}: published words differ from the glossed words"
        )
    return {"content_path_chirho": path_chirho, "content_sha256_chirho": sha256_chirho}


def layer_text_chirho(
    book_id_chirho: str,
    chapter_chirho: int,
    glosses_chirho: dict,
    source_chirho: dict,
    binding_chirho: dict[str, str],
) -> str:
    return json_text_chirho(
        {
            "schema_version_chirho": 1,
            "book_id_chirho": book_id_chirho,
            "chapter_chirho": chapter_chirho,
            **binding_chirho,
            "language_chirho": "es",
            "gloss_state_chirho": "gbt_approved",
            "source_chirho": source_chirho,
            "glossed_chirho": sum(
                gloss_chirho is not None for gloss_chirho in glosses_chirho.values()
            ),
            "missing_chirho": sum(gloss_chirho is None for gloss_chirho in glosses_chirho.values()),
            "glosses_chirho": glosses_chirho,
        },
        compact_depth_chirho=2,
    )


def build_outputs_chirho(repo_root_chirho: Path = REPO_ROOT_CHIRHO) -> dict[Path, str]:
    lesson_pins_chirho = load_manifest_chirho(repo_root_chirho / "data-chirho" / "sources-chirho")
    corpus_pins_chirho = load_manifest_chirho(
        repo_root_chirho / "data-chirho" / "corpus-chirho" / "sources-chirho"
    )
    spanish_pins_chirho = load_manifest_chirho(
        repo_root_chirho / "data-chirho" / "translations-chirho" / "sources-chirho"
    )
    books_chirho: dict[str, tuple[str, str, tuple[dict, dict], PinnedFileChirho]] = {}
    for (
        book_id_chirho,
        slug_chirho,
        label_chirho,
        holder_chirho,
        osis_id_chirho,
        words_id_chirho,
        spanish_id_chirho,
    ) in HEBREW_BOOKS_CHIRHO:
        osis_pin_chirho = (lesson_pins_chirho if holder_chirho == "lesson" else corpus_pins_chirho)[
            osis_id_chirho
        ]
        verses_chirho = parse_book_chirho(
            read_verified_bytes_chirho(osis_pin_chirho), book_id_chirho
        )
        books_chirho[book_id_chirho] = (
            slug_chirho,
            label_chirho,
            hebrew_glosses_chirho(
                verses_chirho,
                gbt_verses_chirho(
                    read_verified_bytes_chirho(corpus_pins_chirho[words_id_chirho]),
                    "hbo+grc",
                ),
                gbt_verses_chirho(
                    read_verified_bytes_chirho(spanish_pins_chirho[spanish_id_chirho]),
                    "spa",
                ),
                book_id_chirho,
            ),
            spanish_pins_chirho[spanish_id_chirho],
        )
    john_chirho = read_book_chirho(
        read_verified_bytes_chirho(corpus_pins_chirho["nestle1904-morph-chirho"]),
        "John",
    )
    books_chirho["John"] = (
        "john",
        "Juan",
        greek_glosses_chirho(
            john_chirho,
            gbt_verses_chirho(
                read_verified_bytes_chirho(spanish_pins_chirho["gbt-source-words-john-chirho"]),
                "hbo+grc",
            ),
            glosses_by_verse_chirho(
                read_verified_bytes_chirho(spanish_pins_chirho["gbt-spanish-john-chirho"])
            ),
        ),
        spanish_pins_chirho["gbt-spanish-john-chirho"],
    )
    outputs_chirho: dict[Path, str] = {}
    manifest_books_chirho: dict[str, dict] = {}
    for book_id_chirho, (
        slug_chirho,
        label_chirho,
        (chapters_chirho, texts_chirho),
        pin_chirho,
    ) in books_chirho.items():
        published_chirho = published_chapters_chirho(repo_root_chirho, slug_chirho)
        if sorted(published_chirho) != sorted(chapters_chirho):
            raise ContentBindingErrorChirho(f"{book_id_chirho}: published chapters differ")
        entries_chirho = []
        for number_chirho, glosses_chirho in sorted(chapters_chirho.items()):
            binding_chirho = content_binding_chirho(
                repo_root_chirho, published_chirho[number_chirho], texts_chirho[number_chirho]
            )
            name_chirho = f"{slug_chirho}-chirho/chapter-{number_chirho:02d}-chirho.json"
            text_chirho = layer_text_chirho(
                book_id_chirho,
                number_chirho,
                glosses_chirho,
                source_record_chirho(pin_chirho),
                binding_chirho,
            )
            outputs_chirho[OUTPUT_DIR_CHIRHO / name_chirho] = text_chirho
            entries_chirho.append(
                {
                    "number_chirho": number_chirho,
                    "path_chirho": PUBLIC_PREFIX_CHIRHO + name_chirho,
                    "sha256_chirho": sha256_text_chirho(text_chirho),
                    **binding_chirho,
                    "glossed_chirho": sum(
                        gloss_chirho is not None for gloss_chirho in glosses_chirho.values()
                    ),
                    "missing_chirho": sum(
                        gloss_chirho is None for gloss_chirho in glosses_chirho.values()
                    ),
                }
            )
        manifest_books_chirho[book_id_chirho] = {
            "label_chirho": label_chirho,
            "chapters_chirho": entries_chirho,
        }
    outputs_chirho[OUTPUT_DIR_CHIRHO / "manifest-chirho.json"] = json_text_chirho(
        {
            "schema_version_chirho": 1,
            "language_chirho": "es",
            "gloss_state_chirho": "gbt_approved",
            "books_chirho": manifest_books_chirho,
        },
        compact_depth_chirho=4,
    )
    return outputs_chirho


def main_chirho(argv_chirho: list[str] | None = None) -> int:
    parser_chirho = argparse.ArgumentParser(description=__doc__.splitlines()[0])
    parser_chirho.add_argument("--check", action="store_true", help="compare only; exit 1 on drift")
    options_chirho = parser_chirho.parse_args(argv_chirho)
    try:
        outputs_chirho = build_outputs_chirho()
    except (*REFUSALS_CHIRHO, SpanishSourceErrorChirho, ContentBindingErrorChirho) as error_chirho:
        print(f"build refused: {error_chirho}", file=sys.stderr)
        return 2
    if options_chirho.check:
        drift_chirho = [
            path_chirho
            for path_chirho, text_chirho in outputs_chirho.items()
            if not path_chirho.is_file() or path_chirho.read_text(encoding="utf-8") != text_chirho
        ]
        for path_chirho in drift_chirho:
            print(f"drift: {path_chirho.relative_to(REPO_ROOT_CHIRHO)}", file=sys.stderr)
        if not drift_chirho:
            print(f"up to date: {len(outputs_chirho)} files match a fresh build")
        return 1 if drift_chirho else 0
    for path_chirho, text_chirho in outputs_chirho.items():
        write_atomically_chirho(path_chirho, text_chirho)
    print(f"wrote {len(outputs_chirho)} files")
    return 0


if __name__ == "__main__":
    raise SystemExit(main_chirho())
