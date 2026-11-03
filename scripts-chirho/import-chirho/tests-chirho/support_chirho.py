# For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life. — John 3:16 (KJV)
"""Shared setup for the importer tests: module path, pinned data loaded once, synthetic XML."""

from __future__ import annotations

import sys
from functools import cache
from pathlib import Path

IMPORT_DIR_CHIRHO = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(IMPORT_DIR_CHIRHO))
sys.dont_write_bytecode = True

import import_lesson_chirho as importer_chirho
from lexicon_chirho import (
    parse_aug_index_chirho,
    parse_lexical_index_chirho,
    parse_strong_chirho,
)
from oshb_verse_chirho import parse_verse_chirho
from source_files_chirho import load_manifest_chirho, verify_all_chirho

REPO_ROOT_CHIRHO = importer_chirho.REPO_ROOT_CHIRHO
SOURCES_DIR_CHIRHO = REPO_ROOT_CHIRHO / importer_chirho.SOURCES_DIR_CHIRHO
CURATION_FILE_CHIRHO = REPO_ROOT_CHIRHO / importer_chirho.CURATION_PATH_CHIRHO
HANDOFF_FILE_CHIRHO = (
    REPO_ROOT_CHIRHO / "tests-chirho/fixtures-chirho/26-10-26-hebrew-visual-reader-handoff-chirho.txt"
)
OSIS_OPEN_CHIRHO = '<osis xmlns="http://www.bibletechnologies.net/2003/OSIS/namespace">'


@cache
def pinned_bytes_chirho() -> dict[str, bytes]:
    return verify_all_chirho(load_manifest_chirho(SOURCES_DIR_CHIRHO))


@cache
def lexicons_chirho() -> tuple[dict, dict, dict]:
    data_chirho = pinned_bytes_chirho()
    return (
        parse_strong_chirho(data_chirho[importer_chirho.STRONG_FILE_CHIRHO]),
        parse_aug_index_chirho(data_chirho[importer_chirho.AUG_FILE_CHIRHO]),
        parse_lexical_index_chirho(data_chirho[importer_chirho.LEXICAL_FILE_CHIRHO]),
    )


@cache
def real_verse_chirho():
    return parse_verse_chirho(pinned_bytes_chirho()["oshb-prov-chirho"], "Prov.26.1")


def handoff_line_chirho(number_chirho: int) -> str:
    return HANDOFF_FILE_CHIRHO.read_text(encoding="utf-8").split("\n")[number_chirho - 1]


def synthetic_verse_chirho(inner_chirho: str) -> bytes:
    """A developer-only verse for rule tests; it never enters a lesson."""
    return (f'{OSIS_OPEN_CHIRHO}<verse osisID="Test.1.1">{inner_chirho}</verse></osis>').encode()
