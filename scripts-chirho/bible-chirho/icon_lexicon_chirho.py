# For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life. — John 3:16 (KJV)
"""Pinned lexical meanings for general pictures, never replacement verse glosses.

Workflow: whole-bible-chirho.md. Augments remain separate lexical identities.
"""

from __future__ import annotations

import hashlib
import json
import sys
from functools import lru_cache
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1] / "import-chirho"))
from lexicon_chirho import (
    lexical_entry_for_chirho,
    parse_aug_index_chirho,
    parse_lemma_chirho,
    parse_lexical_index_chirho,
)


@lru_cache(maxsize=1)
def dictionaries_chirho(root_chirho):
    home_chirho = root_chirho / "data-chirho/sources-chirho"
    manifest_chirho = json.loads(
        (home_chirho / "acquisition-manifest-chirho.json").read_bytes()
    )
    files_chirho, bindings_chirho = {}, []
    for id_chirho, name_chirho in (
        ("aug-index-chirho", "AugIndex.xml"),
        ("lexical-index-chirho", "LexicalIndex.xml"),
    ):
        pin_chirho = next(
            row_chirho
            for row_chirho in manifest_chirho["files_chirho"]
            if row_chirho["id_chirho"] == id_chirho
        )
        path_chirho = home_chirho / "hebrew-lexicon-chirho" / name_chirho
        if path_chirho.is_symlink() or not path_chirho.is_file():
            raise ValueError("Pinned icon dictionary is not a regular file")
        data_chirho = path_chirho.read_bytes()
        if (
            len(data_chirho) != pin_chirho["bytes_chirho"]
            or hashlib.sha256(data_chirho).hexdigest() != pin_chirho["sha256_chirho"]
        ):
            raise ValueError("Pinned icon dictionary bytes changed")
        files_chirho[name_chirho] = data_chirho
        bindings_chirho.append(
            {
                "source_id_chirho": id_chirho,
                "sha256_chirho": pin_chirho["sha256_chirho"],
            }
        )
    return (
        parse_aug_index_chirho(files_chirho["AugIndex.xml"]),
        parse_lexical_index_chirho(files_chirho["LexicalIndex.xml"]),
        bindings_chirho,
    )


def lexical_meaning_chirho(root_chirho, row_chirho):
    """Require the exact augmented dictionary entry; never alias a Strong id alone."""
    review_path_chirho = (
        root_chirho
        / "data-chirho/media-chirho/lemma-reviews-chirho/meanings-chirho.json"
    )
    if review_path_chirho.exists():
        if (
            review_path_chirho.is_symlink()
            or review_path_chirho.stat().st_size > 128 * 1024
        ):
            raise ValueError("Unexpected lexical review file")
        data_chirho = review_path_chirho.read_bytes()
        reviews_chirho = json.loads(data_chirho)
        if reviews_chirho.get("schema_version_chirho") != 1:
            raise ValueError("Unsupported lexical review schema")
        matches_chirho = [
            review_chirho
            for review_chirho in reviews_chirho["reviews_chirho"]
            if all(
                review_chirho.get(field_chirho) == row_chirho.get(field_chirho)
                for field_chirho in (
                    "lemma_id_chirho",
                    "lemma_augment_chirho",
                    "lexical_form_chirho",
                )
            )
        ]
        if len(matches_chirho) > 1:
            raise ValueError("Ambiguous lexical review")
        if matches_chirho:
            review_chirho = matches_chirho[0]
            occurrence_chirho = row_chirho.get(
                "occurrence_chirho", row_chirho.get("examples_chirho", [None])[0]
            )
            if (
                occurrence_chirho != review_chirho["occurrence_chirho"]
                or review_chirho.get("review_chirho")
                != "agent_reviewed_general_meaning"
            ):
                raise ValueError("Lexical review source occurrence differs")
            return {
                "general_meaning_chirho": review_chirho["general_meaning_chirho"],
                "meaning_evidence_chirho": {
                    "kind_chirho": "documented_lexical_review",
                    "review_sha256_chirho": hashlib.sha256(data_chirho).hexdigest(),
                    "review_chirho": review_chirho,
                    "scope_chirho": "General lemma mnemonic; the source verse gloss remains unavailable.",
                },
            }
    if not row_chirho["lemma_id_chirho"].startswith("H"):
        raise ValueError("No pinned lexical fallback for this language")
    aug_chirho, lexical_chirho, bindings_chirho = dictionaries_chirho(root_chirho)
    lemma_chirho = parse_lemma_chirho(
        row_chirho["lemma_id_chirho"][1:]
        + (
            " " + row_chirho["lemma_augment_chirho"]
            if row_chirho.get("lemma_augment_chirho")
            else ""
        )
    )
    entry_chirho = lexical_entry_for_chirho(lemma_chirho, aug_chirho, lexical_chirho)
    if not entry_chirho.def_chirho:
        raise ValueError("Exact lexical entry has no supported meaning")
    return {
        "general_meaning_chirho": entry_chirho.def_chirho,
        "meaning_evidence_chirho": {
            "kind_chirho": "pinned_lexical_definition",
            "lemma_id_chirho": row_chirho["lemma_id_chirho"],
            "lemma_augment_chirho": row_chirho.get("lemma_augment_chirho"),
            "entry_id_chirho": entry_chirho.id_chirho,
            "headword_chirho": entry_chirho.lemma_chirho,
            "definition_chirho": entry_chirho.def_chirho,
            "bindings_chirho": bindings_chirho,
            "scope_chirho": "General lemma mnemonic; the source verse gloss remains unavailable.",
        },
    }


def validate_lexical_chirho(root_chirho, planned_chirho, reviewed_chirho):
    fields_chirho = ("general_meaning_chirho", "meaning_evidence_chirho")
    if not any(
        field_chirho in planned_chirho or field_chirho in reviewed_chirho
        for field_chirho in fields_chirho
    ):
        return
    expected_chirho = lexical_meaning_chirho(root_chirho, planned_chirho)
    if any(
        planned_chirho.get(field_chirho) != expected_chirho[field_chirho]
        or reviewed_chirho.get(field_chirho) != expected_chirho[field_chirho]
        for field_chirho in fields_chirho
    ):
        raise ValueError(
            "General picture meaning differs from its exact pinned lexical entry"
        )
