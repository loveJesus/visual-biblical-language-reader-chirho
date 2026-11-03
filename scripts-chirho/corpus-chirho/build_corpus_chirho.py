# For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life. — John 3:16 (KJV)
"""Build every corpus book from pinned sources only: chapters, manifests, reports and queues.

Workflow: scripts-chirho/corpus-chirho/README-chirho.md, "Corpus import", node build_chirho.

    python3 -I scripts-chirho/corpus-chirho/build_corpus_chirho.py          # write outputs
    python3 -I scripts-chirho/corpus-chirho/build_corpus_chirho.py --check  # exit 1 on drift

Exit codes: 0 written or up to date, 1 drift (--check), 2 import refused. Nothing here uses the
network, and the curated Proverbs 26:1 lesson in data-chirho/lessons-chirho/ is never touched.
"""

from __future__ import annotations

import argparse
import os
import sys
import tempfile
from pathlib import Path

HERE_CHIRHO = Path(__file__).resolve().parent
# The pinned-source gate and lexicon readers are shared, read only, with the lesson importer.
sys.path[:0] = [str(HERE_CHIRHO), str(HERE_CHIRHO.parent / "import-chirho")]
sys.dont_write_bytecode = True

from berean_glosses_chirho import BereanGlossErrorChirho
from corpus_inventories_chirho import STYLE_REFERENCE_ASSET_CHIRHO
from corpus_tokens_chirho import LexiconChirho, TokenErrorChirho
from gbt_glosses_chirho import GlossJoinErrorChirho
from greek_morphology_chirho import GreekMorphologyErrorChirho
from hebrew_corpus_chirho import GENESIS_CHIRHO, PROVERBS_CHIRHO, hebrew_book_outputs_chirho
from john_corpus_chirho import john_outputs_chirho
from lexicon_chirho import (
    LexiconErrorChirho,
    parse_aug_index_chirho,
    parse_lexical_index_chirho,
    parse_strong_chirho,
)
from morphology_chirho import MorphologyErrorChirho
from nestle_book_chirho import NestleFormatErrorChirho
from oshb_book_chirho import BookFormatErrorChirho
from source_files_chirho import (
    SourceIntegrityErrorChirho,
    load_manifest_chirho,
    read_verified_bytes_chirho,
)

REPO_ROOT_CHIRHO = HERE_CHIRHO.parents[1]
HEBREW_BOOKS_CHIRHO = (PROVERBS_CHIRHO, GENESIS_CHIRHO)
REFUSALS_CHIRHO = (
    BereanGlossErrorChirho,
    BookFormatErrorChirho,
    GlossJoinErrorChirho,
    GreekMorphologyErrorChirho,
    LexiconErrorChirho,
    MorphologyErrorChirho,
    NestleFormatErrorChirho,
    SourceIntegrityErrorChirho,
    TokenErrorChirho,
)


def build_outputs_chirho(repo_root_chirho: Path = REPO_ROOT_CHIRHO) -> dict[Path, str]:
    """Every output path with its full text, built in memory from verified bytes."""
    pinned_chirho = load_manifest_chirho(repo_root_chirho / "data-chirho" / "sources-chirho")
    corpus_dir_chirho = repo_root_chirho / "data-chirho" / "corpus-chirho"
    corpus_pinned_chirho = load_manifest_chirho(corpus_dir_chirho / "sources-chirho")
    lexicon_chirho = LexiconChirho(
        strong_chirho=parse_strong_chirho(
            read_verified_bytes_chirho(pinned_chirho["strong-chirho"])
        ),
        aug_index_chirho=parse_aug_index_chirho(
            read_verified_bytes_chirho(pinned_chirho["aug-index-chirho"])
        ),
        lexical_index_chirho=parse_lexical_index_chirho(
            read_verified_bytes_chirho(pinned_chirho["lexical-index-chirho"])
        ),
    )
    # The code tables are transcribed, not parsed; verifying the file pins what was transcribed.
    read_verified_bytes_chirho(pinned_chirho["oshb-morphology-codes-chirho"])
    style_path_chirho = repo_root_chirho / "static" / STYLE_REFERENCE_ASSET_CHIRHO.lstrip("/")
    if not style_path_chirho.is_file():
        raise SourceIntegrityErrorChirho(f"style reference scene missing: {style_path_chirho}")
    style_bytes_chirho = style_path_chirho.read_bytes()
    outputs_chirho: dict[Path, str] = {}
    for book_chirho in HEBREW_BOOKS_CHIRHO:
        outputs_chirho |= hebrew_book_outputs_chirho(
            book_chirho,
            repo_root_chirho,
            pinned_chirho,
            corpus_pinned_chirho,
            lexicon_chirho,
            style_bytes_chirho,
        )
    outputs_chirho |= john_outputs_chirho(
        repo_root_chirho, corpus_pinned_chirho, style_bytes_chirho
    )
    return outputs_chirho


def write_atomically_chirho(path_chirho: Path, text_chirho: str) -> None:
    path_chirho.parent.mkdir(parents=True, exist_ok=True)
    handle_chirho, temporary_chirho = tempfile.mkstemp(dir=path_chirho.parent, suffix=".tmp")
    try:
        with os.fdopen(handle_chirho, "w", encoding="utf-8", newline="") as file_chirho:
            file_chirho.write(text_chirho)
        os.chmod(temporary_chirho, 0o644)
        os.replace(temporary_chirho, path_chirho)
    except BaseException:
        Path(temporary_chirho).unlink(missing_ok=True)
        raise


def main_chirho(argv_chirho: list[str] | None = None) -> int:
    parser_chirho = argparse.ArgumentParser(description=__doc__.splitlines()[0])
    parser_chirho.add_argument("--check", action="store_true", help="compare only; exit 1 on drift")
    options_chirho = parser_chirho.parse_args(argv_chirho)
    try:
        outputs_chirho = build_outputs_chirho()
    except REFUSALS_CHIRHO as error_chirho:
        print(f"import refused: {error_chirho}", file=sys.stderr)
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
            print(f"up to date: {len(outputs_chirho)} files match a fresh import")
        return 1 if drift_chirho else 0
    for path_chirho, text_chirho in outputs_chirho.items():
        write_atomically_chirho(path_chirho, text_chirho)
    print(f"wrote {len(outputs_chirho)} files")
    return 0


if __name__ == "__main__":
    raise SystemExit(main_chirho())
