# For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life. — John 3:16 (KJV)
"""Shared paths and cached builds for the corpus tests (stdlib unittest, run with python3 -I)."""

from __future__ import annotations

import json
import sys
import xml.etree.ElementTree as ET
from functools import cache
from pathlib import Path

REPO_ROOT_CHIRHO = Path(__file__).resolve().parents[2]
sys.path[:0] = [
    str(REPO_ROOT_CHIRHO / "scripts-chirho" / "corpus-chirho"),
    str(REPO_ROOT_CHIRHO / "scripts-chirho" / "import-chirho"),
]
sys.dont_write_bytecode = True

from berean_glosses_chirho import berean_entries_chirho
from build_corpus_chirho import build_outputs_chirho
from corpus_tokens_chirho import LexiconChirho
from gbt_glosses_chirho import gbt_verses_chirho
from lexicon_chirho import parse_aug_index_chirho, parse_lexical_index_chirho, parse_strong_chirho
from nestle_book_chirho import GreekVerseChirho, read_book_chirho
from oshb_book_chirho import OSIS_NS_CHIRHO, BookVerseChirho, parse_book_chirho
from source_files_chirho import (
    PinnedFileChirho,
    load_manifest_chirho,
    parse_xml_chirho,
    read_verified_bytes_chirho,
)

CONTENT_DIR_CHIRHO = REPO_ROOT_CHIRHO / "static" / "content-chirho" / "proverbs-chirho"
CORPUS_DIR_CHIRHO = REPO_ROOT_CHIRHO / "data-chirho" / "corpus-chirho"


@cache
def pinned_chirho() -> dict[str, PinnedFileChirho]:
    return load_manifest_chirho(REPO_ROOT_CHIRHO / "data-chirho" / "sources-chirho")


@cache
def corpus_pinned_chirho() -> dict[str, PinnedFileChirho]:
    return load_manifest_chirho(CORPUS_DIR_CHIRHO / "sources-chirho")


@cache
def prov_text_chirho() -> str:
    return read_verified_bytes_chirho(pinned_chirho()["oshb-prov-chirho"]).decode("utf-8")


@cache
def book_verses_chirho() -> tuple[BookVerseChirho, ...]:
    return parse_book_chirho(prov_text_chirho().encode("utf-8"), "Prov")


@cache
def lexicon_chirho() -> LexiconChirho:
    return LexiconChirho(
        strong_chirho=parse_strong_chirho(
            read_verified_bytes_chirho(pinned_chirho()["strong-chirho"])
        ),
        aug_index_chirho=parse_aug_index_chirho(
            read_verified_bytes_chirho(pinned_chirho()["aug-index-chirho"])
        ),
        lexical_index_chirho=parse_lexical_index_chirho(
            read_verified_bytes_chirho(pinned_chirho()["lexical-index-chirho"])
        ),
    )


@cache
def fresh_outputs_chirho() -> dict[Path, str]:
    """A fresh in-memory import; tests compare against it rather than trusting written files."""
    return build_outputs_chirho(REPO_ROOT_CHIRHO)


def output_json_chirho(path_chirho: Path) -> dict:
    return json.loads(fresh_outputs_chirho()[path_chirho])


def verse_records_chirho() -> list[dict]:
    """Every verse record of the fresh import, chapter by chapter."""
    manifest_chirho = output_json_chirho(CONTENT_DIR_CHIRHO / "manifest-chirho.json")
    return [
        verse_chirho
        for chapter_chirho in manifest_chirho["chapters_chirho"]
        for verse_chirho in output_json_chirho(
            CONTENT_DIR_CHIRHO / chapter_chirho["path_chirho"].rsplit("/", 1)[1]
        )["verses_chirho"]
    ]


def gbt_files_chirho() -> tuple[dict[str, list[dict]], dict[str, list[dict]]]:
    """Fresh, mutable copies of the GBT source-word and English verse maps."""
    return (
        gbt_verses_chirho(
            read_verified_bytes_chirho(corpus_pinned_chirho()["gbt-source-words-prov-chirho"]),
            "hbo+grc",
        ),
        gbt_verses_chirho(
            read_verified_bytes_chirho(corpus_pinned_chirho()["gbt-english-prov-chirho"]), "eng"
        ),
    )


def synthetic_verse_chirho(inner_chirho: str) -> ET.Element:
    """A verse element in the OSIS namespace, for targeted malformed-input tests."""
    return parse_xml_chirho(
        f'<verse xmlns="{OSIS_NS_CHIRHO[1:-1]}" osisID="Prov.1.1">{inner_chirho}</verse>'.encode(),
        "synthetic verse",
    )


@cache
def nestle_john_chirho() -> tuple[GreekVerseChirho, ...]:
    data_chirho = read_verified_bytes_chirho(corpus_pinned_chirho()["nestle1904-morph-chirho"])
    return read_book_chirho(data_chirho, "John")


@cache
def berean_john_chirho() -> tuple[dict[str, tuple[str, str]], list]:
    """John's Berean entries and editor notes; callers copy the dict before changing it."""
    data_chirho = read_verified_bytes_chirho(corpus_pinned_chirho()["berean-glosses-chirho"])
    return berean_entries_chirho(data_chirho, "John")
