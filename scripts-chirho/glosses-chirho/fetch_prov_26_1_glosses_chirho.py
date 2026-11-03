#!/usr/bin/env python3
# For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life. — John 3:16 (KJV)
"""Bounded import of upstream reviewed glosses for Proverbs 26:1 into a local reader fixture.

Workflow: spec-chirho/research-chirho/multilingual-sources-chirho.md, "What a bounded Prov 26:1
import needs".

    python3 -I scripts-chirho/glosses-chirho/fetch_prov_26_1_glosses_chirho.py          # write
    python3 -I scripts-chirho/glosses-chirho/fetch_prov_26_1_glosses_chirho.py --check  # drift

Scope is one verse, five languages and one pinned export (gpt_chirho, broker #28500). Every input
is fetched from raw.githubusercontent.com at a pinned commit and refused unless its sha256 matches.
globalbibletools/data exports a gloss only when its state is APPROVED, so every gloss here is
labelled approved_upstream. How it was approved (typed, or an accepted Google or LLM suggestion)
is not in the export.

Three fields need a definition:
- lang_chirho: the BCP 47 tag for the gloss text (ar, en, fr, pt, es); id_chirho keeps the
  stable reader id (arb, eng, fra, por, spa).
- exported_at_chirho: the export run named in the pinned data commit's message.
- file_updated_at_chirho: commit time of the last change to that language's file at the pin, read
  from the repository history when the pin was chosen (the commit is noted beside each value).
"""

from __future__ import annotations

import argparse
import hashlib
import json
import sys
import unicodedata
import urllib.request
import xml.etree.ElementTree as ET
from dataclasses import dataclass
from pathlib import Path

DATA_REVISION_CHIRHO = "6c511c2a8cc4ab341337f912763592f3ab5da0b1"
EXPORTED_AT_CHIRHO = "2026-10-26T00:18:09.454Z"
OSHB_REVISION_CHIRHO = "3d15126fb1ef74867fc1434be1942e837932691f"
REFERENCE_ID_CHIRHO = "Prov.26.1"
VERSE_ID_CHIRHO = "20026001"
RAW_PREFIX_CHIRHO = "https://raw.githubusercontent.com/"
DATA_RAW_CHIRHO = f"{RAW_PREFIX_CHIRHO}globalbibletools/data/{DATA_REVISION_CHIRHO}/"
SOURCE_WORDS_URL_CHIRHO = f"{DATA_RAW_CHIRHO}hbo%2Bgrc/20-Pro.json"
SOURCE_WORDS_SHA256_CHIRHO = "346dc949c8e644e5de9bf6f96b8212704e39d2ce05b3da9db511583901841dca"
OSHB_PROV_URL_CHIRHO = (
    f"{RAW_PREFIX_CHIRHO}openscriptures/morphhb/{OSHB_REVISION_CHIRHO}/wlc/Prov.xml"
)
OSHB_PROV_SHA256_CHIRHO = "964f99c00239b53b854c4686c99490c8d1ac7664784a30afdfc23781a3abb161"
OSIS_NS_CHIRHO = "{http://www.bibletechnologies.net/2003/OSIS/namespace}"
OUTPUT_PATH_CHIRHO = (
    Path(__file__).resolve().parents[2]
    / "data-chirho"
    / "glosses-chirho"
    / "proverbs-26-1-glosses-chirho.json"
)
TIMEOUT_SECONDS_CHIRHO = 60

LICENSE_CHIRHO = (
    "CC0-1.0, as stated by Global Bible Tools itself (globalbibletools/platform@5d4041d4, "
    "src/ui/study/components/AttributionDialog.tsx); the data repository carries no LICENSE "
    "file. GBT's published attribution dedicates these glosses under CC0 1.0 and links "
    "the language folder in the data repository; that statement is the public-use license basis."
)
ENGLISH_CAVEAT_CHIRHO = (
    " English caveat: GBT's exporter now skips English until Alan Bunning's NT glosses have an "
    "open license; this Old Testament file is the 2024-12-20 export, which GBT's attribution "
    "places under its CC0 statement."
)


@dataclass(frozen=True)
class LanguageChirho:
    id_chirho: str
    lang_chirho: str
    label_chirho: str
    direction_chirho: str
    folder_chirho: str
    sha256_chirho: str
    file_updated_at_chirho: str


# The folder `are` holds Arabic; globalbibletools.com lists Arabic as `arb`, the id used here.
LANGUAGES_CHIRHO = (
    LanguageChirho(  # last change f341167da16aa45f1a905c64de13d3bb2ab83d0b
        "arb",
        "ar",
        "Arabic",
        "rtl",
        "are",
        "ceb5a44f02d79cf823d957e3701acf0acba222b9865d901d455d2fae550eec80",
        "2024-12-20T18:38:27Z",
    ),
    LanguageChirho(  # last change 3ad4a12ac22b791eb144e928077fd0ba61bb1d17
        "eng",
        "en",
        "English",
        "ltr",
        "eng",
        "c36c0827c09f5ef58f9d471b50f3d869e8d92f1edb72251f777795ec19ec4ce2",
        "2024-12-20T18:33:59Z",
    ),
    LanguageChirho(  # last change 5dcfa5436f63244001b2dea3a9d55e85ce37eb73
        "fra",
        "fr",
        "French",
        "ltr",
        "fra",
        "22c413c80b7b491c1f0fea74f1d9cf0ee0ecf8aebfe86fa0dd3ad576c576e80c",
        "2024-12-20T18:39:02Z",
    ),
    LanguageChirho(  # last change b4b82d438736f0f1bb799220bc767ed678b1e21d
        "por",
        "pt",
        "Portuguese",
        "ltr",
        "por",
        "e683853ada80a1bf53bfda626f011ad8bdf8d8596ba7fe3e6d4f457ceafd39ee",
        "2024-12-20T17:59:13Z",
    ),
    LanguageChirho(  # last change fe3aa91f49e40ccaa0d669e64f501418e394f740
        "spa",
        "es",
        "Spanish",
        "ltr",
        "spa",
        "068b3460518772b441cfbb585aef375b55e4c9ad9187a303d735410de3cc798b",
        "2024-12-20T18:28:21Z",
    ),
)


class GlossImportErrorChirho(Exception):
    """A pinned input differs, or the verse does not line up word for word."""


def fetch_pinned_chirho(url_chirho: str, sha256_chirho: str) -> bytes:
    if not url_chirho.startswith(RAW_PREFIX_CHIRHO):
        raise GlossImportErrorChirho(f"refusing {url_chirho}")
    with urllib.request.urlopen(url_chirho, timeout=TIMEOUT_SECONDS_CHIRHO) as response_chirho:
        data_chirho = response_chirho.read()
    actual_chirho = hashlib.sha256(data_chirho).hexdigest()
    if actual_chirho != sha256_chirho:
        raise GlossImportErrorChirho(
            f"{url_chirho}: sha256 {actual_chirho} != pinned {sha256_chirho}"
        )
    return data_chirho


def oshb_words_chirho(xml_chirho: bytes) -> list[tuple[str, str, str]]:
    """Return (OSHB id, word text without slashes, boundary punctuation recorded after it)."""
    words_chirho: list[list[str]] = []
    for verse_chirho in ET.fromstring(xml_chirho).iter(OSIS_NS_CHIRHO + "verse"):
        if verse_chirho.get("osisID") != REFERENCE_ID_CHIRHO:
            continue
        for element_chirho in verse_chirho:
            text_chirho = "".join(element_chirho.itertext())
            if element_chirho.tag == OSIS_NS_CHIRHO + "w":
                id_chirho = element_chirho.get("id") or ""
                words_chirho.append([id_chirho, text_chirho.replace("/", ""), ""])
            elif element_chirho.tag == OSIS_NS_CHIRHO + "seg" and words_chirho:
                words_chirho[-1][2] += text_chirho
    return [
        (id_chirho, text_chirho, punct_chirho)
        for id_chirho, text_chirho, punct_chirho in words_chirho
    ]


def gbt_verse_words_chirho(book_chirho: bytes) -> list[dict]:
    for chapter_chirho in json.loads(book_chirho)["chapters"]:
        for verse_chirho in chapter_chirho["verses"]:
            if verse_chirho["id"] == VERSE_ID_CHIRHO:
                return verse_chirho["words"]
    raise GlossImportErrorChirho(f"verse {VERSE_ID_CHIRHO} missing")


def boundary_core_chirho(gbt_text_chirho: str, punct_chirho: str) -> str:
    """Strip punctuation only where OSHB records a separate segment at this word's boundary."""
    if not punct_chirho:
        return gbt_text_chirho
    if not gbt_text_chirho.endswith(punct_chirho):
        raise GlossImportErrorChirho(f"{gbt_text_chirho!r} lacks boundary {punct_chirho!r}")
    return gbt_text_chirho[: -len(punct_chirho)].rstrip(" ")


def aligned_source_words_chirho() -> list[tuple[str, str, str]]:
    """Return (OSHB id, GBT word id, GBT word text) after proving the nine words line up."""
    oshb_chirho = oshb_words_chirho(
        fetch_pinned_chirho(OSHB_PROV_URL_CHIRHO, OSHB_PROV_SHA256_CHIRHO)
    )
    gbt_chirho = gbt_verse_words_chirho(
        fetch_pinned_chirho(SOURCE_WORDS_URL_CHIRHO, SOURCE_WORDS_SHA256_CHIRHO)
    )
    expected_ids_chirho = [f"{VERSE_ID_CHIRHO}{index_chirho:02d}" for index_chirho in range(1, 10)]
    gbt_ids_chirho = [word_chirho["id"] for word_chirho in gbt_chirho]
    if len(oshb_chirho) != 9 or gbt_ids_chirho != expected_ids_chirho:
        raise GlossImportErrorChirho("expected nine OSHB words and GBT word ids 2002600101..09")
    aligned_chirho = []
    for (oshb_id_chirho, oshb_text_chirho, punct_chirho), word_chirho in zip(
        oshb_chirho, gbt_chirho
    ):
        core_chirho = boundary_core_chirho(word_chirho["text"], punct_chirho)
        if unicodedata.normalize("NFD", core_chirho) != unicodedata.normalize(
            "NFD", oshb_text_chirho
        ):
            raise GlossImportErrorChirho(
                f"{word_chirho['id']} is not NFD-equivalent to OSHB {oshb_id_chirho}"
            )
        aligned_chirho.append((oshb_id_chirho, word_chirho["id"], word_chirho["text"]))
    return aligned_chirho


def language_entry_chirho(
    language_chirho: LanguageChirho, aligned_chirho: list[tuple[str, str, str]]
) -> dict:
    path_chirho = f"{language_chirho.folder_chirho}/20-Pro.json"
    words_chirho = gbt_verse_words_chirho(
        fetch_pinned_chirho(DATA_RAW_CHIRHO + path_chirho, language_chirho.sha256_chirho)
    )
    source_ids_chirho = [gbt_id_chirho for _, gbt_id_chirho, _ in aligned_chirho]
    if [word_chirho["id"] for word_chirho in words_chirho] != source_ids_chirho:
        raise GlossImportErrorChirho(f"{path_chirho}: word ids differ from the source words")
    entries_chirho = []
    for (oshb_id_chirho, gbt_id_chirho, text_chirho), word_chirho in zip(
        aligned_chirho, words_chirho
    ):
        gloss_chirho = word_chirho.get("gloss")
        if not isinstance(gloss_chirho, str) or not gloss_chirho.strip():
            raise GlossImportErrorChirho(f"{path_chirho} {gbt_id_chirho}: no approved gloss")
        entries_chirho.append(
            {
                "token_id_chirho": oshb_id_chirho,
                "upstream_word_id_chirho": gbt_id_chirho,
                "text_chirho": text_chirho,
                "gloss_chirho": gloss_chirho,
            }
        )
    english_chirho = language_chirho.id_chirho == "eng"
    return {
        "id_chirho": language_chirho.id_chirho,
        "lang_chirho": language_chirho.lang_chirho,
        "label_chirho": language_chirho.label_chirho,
        "direction_chirho": language_chirho.direction_chirho,
        "source_folder_chirho": language_chirho.folder_chirho,
        "revision_chirho": DATA_REVISION_CHIRHO,
        "source_url_chirho": DATA_RAW_CHIRHO + path_chirho,
        "source_sha256_chirho": language_chirho.sha256_chirho,
        "approval_status_chirho": "approved_upstream",
        "exported_at_chirho": EXPORTED_AT_CHIRHO,
        "file_updated_at_chirho": language_chirho.file_updated_at_chirho,
        "license_chirho": LICENSE_CHIRHO + (ENGLISH_CAVEAT_CHIRHO if english_chirho else ""),
        "attribution_chirho": (
            f"{language_chirho.label_chirho} Glosses by Global Bible Tools "
            "(https://globalbibletools.com) are available under Creative Commons CC0 1.0 "
            "Universal (https://creativecommons.org/publicdomain/zero/1.0/)."
        ),
        "words_chirho": entries_chirho,
    }


def build_fixture_chirho() -> str:
    aligned_chirho = aligned_source_words_chirho()
    fixture_chirho = {
        "schema_version_chirho": 1,
        "reference_id_chirho": REFERENCE_ID_CHIRHO,
        "languages_chirho": [
            language_entry_chirho(language_chirho, aligned_chirho)
            for language_chirho in LANGUAGES_CHIRHO
        ],
    }
    return json.dumps(fixture_chirho, ensure_ascii=False, indent="\t") + "\n"


def main_chirho(argv_chirho: list[str] | None = None) -> int:
    parser_chirho = argparse.ArgumentParser(description=__doc__.splitlines()[0])
    parser_chirho.add_argument("--check", action="store_true", help="compare only; exit 1 on drift")
    args_chirho = parser_chirho.parse_args(argv_chirho)
    try:
        text_chirho = build_fixture_chirho()
    except GlossImportErrorChirho as error_chirho:
        print(f"refused: {error_chirho}", file=sys.stderr)
        return 2
    if args_chirho.check:
        current_chirho = (
            OUTPUT_PATH_CHIRHO.read_text(encoding="utf-8") if OUTPUT_PATH_CHIRHO.exists() else None
        )
        print("up to date" if current_chirho == text_chirho else f"drift: {OUTPUT_PATH_CHIRHO}")
        return 0 if current_chirho == text_chirho else 1
    OUTPUT_PATH_CHIRHO.parent.mkdir(parents=True, exist_ok=True)
    OUTPUT_PATH_CHIRHO.write_text(text_chirho, encoding="utf-8")
    print(OUTPUT_PATH_CHIRHO)
    return 0


if __name__ == "__main__":
    sys.exit(main_chirho())
