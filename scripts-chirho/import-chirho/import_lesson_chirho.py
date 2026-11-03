# For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life. — John 3:16 (KJV)
"""Offline import of Proverbs 26:1: pinned OSHB evidence plus curated choices, to extract and lesson.

Workflow: scripts-chirho/import-chirho/README-chirho.md, "Offline import" (every node).

    python3 -I scripts-chirho/import-chirho/import_lesson_chirho.py           # write both files
    python3 -I scripts-chirho/import-chirho/import_lesson_chirho.py --check   # exit 1 on drift

The scope is this one lesson (gpt_chirho, broker #28497). Anything the verse does not need,
such as verbs, suffix heads, ketiv/qere or notes, is refused with an error, not guessed.
"""

from __future__ import annotations

import argparse
import hashlib
import json
import os
import re
import sys
import tempfile
import unicodedata
from pathlib import Path

# python3 -I leaves the script's own folder off sys.path; add exactly that folder and no other.
sys.path.insert(0, str(Path(__file__).resolve().parent))
sys.dont_write_bytecode = True

from lexicon_chirho import (
    LexicalEntryChirho,
    LexiconErrorChirho,
    StrongEntryChirho,
    assess_root_chirho,
    lexical_entry_for_chirho,
    parse_aug_index_chirho,
    parse_lemma_chirho,
    parse_lexical_index_chirho,
    parse_strong_chirho,
    strong_entry_for_chirho,
)
from morphology_chirho import (
    MorphologyErrorChirho,
    decode_word_chirho,
    describe_segment_chirho,
    describe_word_chirho,
    lesson_categories_chirho,
)
from oshb_verse_chirho import (
    VerseChirho,
    VerseStructureErrorChirho,
    WordRecordChirho,
    parse_verse_chirho,
    utf16_length_chirho,
    utf16_slice_chirho,
)
from source_files_chirho import (
    PinnedFileChirho,
    SourceIntegrityErrorChirho,
    load_manifest_chirho,
    verify_all_chirho,
)

REPO_ROOT_CHIRHO = Path(__file__).resolve().parents[2]
SOURCES_DIR_CHIRHO = Path("data-chirho/sources-chirho")
EXTRACTS_DIR_CHIRHO = SOURCES_DIR_CHIRHO / "extracts-chirho"
LESSONS_DIR_CHIRHO = Path("data-chirho/lessons-chirho")
CURATION_PATH_CHIRHO = LESSONS_DIR_CHIRHO / "curation-chirho" / "proverbs-26-1-curation-chirho.json"
GENERATOR_CHIRHO = "scripts-chirho/import-chirho/import_lesson_chirho.py"
SCHEMA_VERSION_CHIRHO = 1
LESSON_SOURCE_ROLES_CHIRHO = ("data", "reference")
STRONG_FILE_CHIRHO, AUG_FILE_CHIRHO, LEXICAL_FILE_CHIRHO = (
    "strong-chirho",
    "aug-index-chirho",
    "lexical-index-chirho",
)
OUTPUT_NAME_CHIRHO = re.compile(r"[a-z0-9-]+-chirho\.json")
XML_NS_CHIRHO = "{http://www.w3.org/XML/1998/namespace}"

CURATION_KEYS_CHIRHO = {
    "schema_version_chirho": int,
    "id_chirho": str,
    "language_chirho": str,
    "reference_chirho": str,
    "source_file_chirho": str,
    "lesson_file_chirho": str,
    "extract_file_chirho": str,
    "handoff_ref_chirho": str,
    "handoff_text_chirho": str,
    "translation_chirho": str,
    "translation_ref_chirho": str,
    "app_source_chirho": dict,
    "tokens_chirho": dict,
}
APP_SOURCE_KEYS_CHIRHO = {
    "id_chirho": str,
    "title_chirho": str,
    "revision_chirho": str,
    "license_chirho": str,
    "attribution_chirho": str,
}
TOKEN_KEYS_CHIRHO = {
    "gloss_chirho": str,
    "root_status_chirho": str,
    "root_entry_id_chirho": (str, type(None)),
    "root_note_chirho": str,
    "source_note_chirho": str,
}
IMPORT_ERRORS_CHIRHO = (
    SourceIntegrityErrorChirho,
    VerseStructureErrorChirho,
    MorphologyErrorChirho,
    LexiconErrorChirho,
)


class CurationErrorChirho(ValueError):
    """Curated choices that are malformed, or that the pinned sources do not support."""


def require_shape_chirho(value_chirho: object, keys_chirho: dict, where_chirho: str) -> dict:
    """Exactly these keys, each of its type, and no blank strings."""
    if not isinstance(value_chirho, dict) or set(value_chirho) != set(keys_chirho):
        raise CurationErrorChirho(
            f"{where_chirho}: expected exactly the keys {sorted(keys_chirho)}"
        )
    for key_chirho, kind_chirho in keys_chirho.items():
        item_chirho = value_chirho[key_chirho]
        if isinstance(item_chirho, bool) or not isinstance(item_chirho, kind_chirho):
            raise CurationErrorChirho(f"{where_chirho}.{key_chirho}: wrong type")
        if isinstance(item_chirho, str) and not item_chirho.strip():
            raise CurationErrorChirho(f"{where_chirho}.{key_chirho}: blank")
    return value_chirho


def load_curation_chirho(curation_bytes_chirho: bytes) -> dict:
    curation_chirho = require_shape_chirho(
        json.loads(curation_bytes_chirho.decode("utf-8")), CURATION_KEYS_CHIRHO, "curation"
    )
    if curation_chirho["schema_version_chirho"] != SCHEMA_VERSION_CHIRHO:
        raise CurationErrorChirho(f"curation: schema version must be {SCHEMA_VERSION_CHIRHO}")
    if curation_chirho["language_chirho"] != "he":
        raise CurationErrorChirho("curation: importer v1 builds Hebrew lessons only")
    for key_chirho in ("lesson_file_chirho", "extract_file_chirho"):
        if not OUTPUT_NAME_CHIRHO.fullmatch(curation_chirho[key_chirho]):
            raise CurationErrorChirho(f"curation.{key_chirho}: not a plain -chirho.json file name")
    require_shape_chirho(curation_chirho["app_source_chirho"], APP_SOURCE_KEYS_CHIRHO, "app_source")
    for token_id_chirho, token_chirho in curation_chirho["tokens_chirho"].items():
        require_shape_chirho(token_chirho, TOKEN_KEYS_CHIRHO, f"tokens.{token_id_chirho}")
    return curation_chirho


def check_root_curation_chirho(
    word_id_chirho: str, curated_chirho: dict, assessment_chirho
) -> None:
    """The curated root choice must be exactly what the two pinned lexicon views support."""
    curated_pair_chirho = (
        curated_chirho["root_status_chirho"],
        curated_chirho["root_entry_id_chirho"],
    )
    source_pair_chirho = (assessment_chirho.status_chirho, assessment_chirho.root_entry_id_chirho)
    if curated_pair_chirho != source_pair_chirho:
        raise CurationErrorChirho(
            f"{word_id_chirho}: curated root {curated_pair_chirho} but the pinned sources support "
            f"{source_pair_chirho} (Strong's refs {list(assessment_chirho.strong_refs_chirho)}, "
            f"Lexical Index family {assessment_chirho.family_entry_chirho} "
            f"{list(assessment_chirho.family_strong_ids_chirho)})"
        )


def code_points_chirho(text_chirho: str) -> str:
    return " ".join(f"{ord(character_chirho):04X}" for character_chirho in text_chirho)


def build_word_chirho(
    word_chirho: WordRecordChirho,
    curated_chirho: dict,
    strong_entries_chirho: dict[str, StrongEntryChirho],
    aug_index_chirho: dict[str, str],
    lexical_index_chirho: dict[str, LexicalEntryChirho],
) -> tuple[dict, dict, set[str], set[str]]:
    """One lesson token, its extract record, and the lexicon entries it cites."""
    word_id_chirho = word_chirho.oshb_id_chirho
    morphology_chirho = decode_word_chirho(word_chirho.morph_chirho)
    if morphology_chirho.language_chirho != "Hebrew":
        raise MorphologyErrorChirho(f"{word_id_chirho}: lesson v1 carries Hebrew words only")
    head_index_chirho = morphology_chirho.head_index_chirho
    segments_chirho = morphology_chirho.segments_chirho
    if len(segments_chirho) != len(word_chirho.segments_chirho):
        raise VerseStructureErrorChirho(
            f"{word_id_chirho}: {len(word_chirho.segments_chirho)} text segments but "
            f"{len(segments_chirho)} morphology segments"
        )
    if any(
        segment_chirho.is_suffix_chirho for segment_chirho in segments_chirho[:head_index_chirho]
    ):
        raise VerseStructureErrorChirho(f"{word_id_chirho}: suffix code before the main word")
    lemma_parts_chirho = word_chirho.lemma_chirho.split("/")
    if len(lemma_parts_chirho) != head_index_chirho + 1:
        raise VerseStructureErrorChirho(
            f"{word_id_chirho}: lemma {word_chirho.lemma_chirho!r} does not align with "
            f"morphology {word_chirho.morph_chirho!r}"
        )
    lemma_chirho = parse_lemma_chirho(lemma_parts_chirho[head_index_chirho])
    strong_chirho = strong_entry_for_chirho(lemma_chirho.strong_id_chirho, strong_entries_chirho)
    lexical_chirho = lexical_entry_for_chirho(lemma_chirho, aug_index_chirho, lexical_index_chirho)
    assessment_chirho = assess_root_chirho(strong_chirho, lexical_chirho, lexical_index_chirho)
    check_root_curation_chirho(word_id_chirho, curated_chirho, assessment_chirho)

    token_chirho = {
        "id_chirho": word_id_chirho,
        "text_chirho": word_chirho.text_chirho,
        "segments_chirho": list(word_chirho.segments_chirho),
        "start_chirho": word_chirho.start_chirho,
        "end_chirho": word_chirho.end_chirho,
        "raw_morphology_chirho": word_chirho.morph_chirho,
        "lemma_id_chirho": lemma_chirho.strong_id_chirho,
        "lemma_augment_chirho": lemma_chirho.augment_chirho,
        "lexical_form_chirho": strong_chirho.lemma_chirho,
        **lesson_categories_chirho(morphology_chirho),
        "root_text_chirho": assessment_chirho.root_text_chirho,
        "root_entry_id_chirho": assessment_chirho.root_entry_id_chirho,
        "root_status_chirho": assessment_chirho.status_chirho,
        "root_note_chirho": curated_chirho["root_note_chirho"],
        "gloss_chirho": curated_chirho["gloss_chirho"],
        "analysis_chirho": describe_word_chirho(morphology_chirho),
        "source_note_chirho": curated_chirho["source_note_chirho"],
    }
    roles_chirho = ["prefix"] * head_index_chirho + ["main"]
    roles_chirho += ["suffix"] * (len(segments_chirho) - head_index_chirho - 1)
    record_chirho = {
        "oshb_id_chirho": word_id_chirho,
        "position_chirho": word_chirho.position_chirho,
        "source_text_chirho": word_chirho.source_text_chirho,
        "text_chirho": word_chirho.text_chirho,
        "start_chirho": word_chirho.start_chirho,
        "end_chirho": word_chirho.end_chirho,
        "raw_attributes_chirho": dict(word_chirho.attributes_chirho),
        "language_chirho": morphology_chirho.language_chirho,
        "segments_chirho": [
            {
                "text_chirho": text_chirho,
                "role_chirho": role_chirho,
                "lemma_chirho": lemma_parts_chirho[index_chirho]
                if index_chirho < len(lemma_parts_chirho)
                else None,
                "morph_code_chirho": segment_chirho.code_chirho,
                "morphology_chirho": describe_segment_chirho(segment_chirho),
            }
            for index_chirho, (text_chirho, role_chirho, segment_chirho) in enumerate(
                zip(word_chirho.segments_chirho, roles_chirho, segments_chirho)
            )
        ],
        "lemma_chirho": {
            "raw_chirho": lemma_chirho.raw_chirho,
            "strong_id_chirho": lemma_chirho.strong_id_chirho,
            "augment_chirho": lemma_chirho.augment_chirho,
            "aug_index_key_chirho": lemma_chirho.aug_index_key_chirho,
            "lexical_index_id_chirho": lexical_chirho.id_chirho,
        },
        "root_assessment_chirho": {
            "status_chirho": assessment_chirho.status_chirho,
            "root_text_chirho": assessment_chirho.root_text_chirho,
            "root_entry_id_chirho": assessment_chirho.root_entry_id_chirho,
            "strong_refs_chirho": list(assessment_chirho.strong_refs_chirho),
            "family_entry_chirho": assessment_chirho.family_entry_chirho,
            "family_strong_ids_chirho": list(assessment_chirho.family_strong_ids_chirho),
        },
    }
    cited_strong_chirho = {lemma_chirho.strong_id_chirho, *assessment_chirho.strong_refs_chirho}
    cited_lexical_chirho = {lexical_chirho.id_chirho}
    if assessment_chirho.family_entry_chirho:
        family_chirho = lexical_index_chirho[assessment_chirho.family_entry_chirho]
        cited_lexical_chirho |= {family_chirho.id_chirho, *family_chirho.etym_targets_chirho}
    return token_chirho, record_chirho, cited_strong_chirho, cited_lexical_chirho


def compare_handoff_chirho(verse_chirho: VerseChirho, curation_chirho: dict) -> dict:
    """Record how the handoff's pasted verse differs from the source, without changing either."""
    source_chirho = verse_chirho.canonical_text_chirho
    pasted_chirho = curation_chirho["handoff_text_chirho"]
    nfd_equal_chirho = unicodedata.normalize("NFD", source_chirho) == unicodedata.normalize(
        "NFD", pasted_chirho
    )
    differences_chirho = []
    if nfd_equal_chirho and utf16_length_chirho(source_chirho) == utf16_length_chirho(
        pasted_chirho
    ):
        spans_chirho = [
            (word_chirho.oshb_id_chirho, word_chirho.start_chirho, word_chirho.end_chirho)
            for word_chirho in verse_chirho.words_chirho
        ] + [
            (mark_chirho.type_chirho, mark_chirho.start_chirho, mark_chirho.end_chirho)
            for mark_chirho in verse_chirho.punctuation_chirho
        ]
        for label_chirho, start_chirho, end_chirho in sorted(
            spans_chirho, key=lambda span_chirho: span_chirho[1]
        ):
            ours_chirho = utf16_slice_chirho(source_chirho, start_chirho, end_chirho)
            theirs_chirho = utf16_slice_chirho(pasted_chirho, start_chirho, end_chirho)
            if ours_chirho != theirs_chirho:
                differences_chirho.append(
                    {
                        "record_chirho": label_chirho,
                        "source_code_points_chirho": code_points_chirho(ours_chirho),
                        "handoff_code_points_chirho": code_points_chirho(theirs_chirho),
                    }
                )
    return {
        "handoff_ref_chirho": curation_chirho["handoff_ref_chirho"],
        "handoff_text_chirho": pasted_chirho,
        "byte_exact_chirho": source_chirho == pasted_chirho,
        "nfd_equal_chirho": nfd_equal_chirho,
        "source_is_nfc_chirho": unicodedata.normalize("NFC", source_chirho) == source_chirho,
        "handoff_is_nfc_chirho": unicodedata.normalize("NFC", pasted_chirho) == pasted_chirho,
        "kept_chirho": "source",
        "differences_chirho": differences_chirho,
    }


def strong_record_chirho(entry_chirho: StrongEntryChirho) -> dict:
    return {
        "strong_id_chirho": entry_chirho.strong_id_chirho,
        "lemma_chirho": entry_chirho.lemma_chirho,
        "raw_attributes_chirho": {
            key_chirho.replace(XML_NS_CHIRHO, "xml:"): value_chirho
            for key_chirho, value_chirho in entry_chirho.attributes_chirho
        },
        "source_text_chirho": entry_chirho.source_text_chirho,
        "source_refs_chirho": list(entry_chirho.source_refs_chirho),
        "meaning_text_chirho": entry_chirho.meaning_text_chirho,
        "usage_text_chirho": entry_chirho.usage_text_chirho,
    }


def lexical_record_chirho(entry_chirho: LexicalEntryChirho) -> dict:
    return {
        "id_chirho": entry_chirho.id_chirho,
        "lemma_chirho": entry_chirho.lemma_chirho,
        "xlit_chirho": entry_chirho.xlit_chirho,
        "pos_chirho": entry_chirho.pos_chirho,
        "def_chirho": entry_chirho.def_chirho,
        "raw_xref_chirho": dict(entry_chirho.xref_chirho),
        "etym_type_chirho": entry_chirho.etym_type_chirho,
        "etym_root_chirho": entry_chirho.etym_root_chirho,
        "etym_targets_chirho": list(entry_chirho.etym_targets_chirho),
    }


def lesson_sources_chirho(
    pinned_chirho: dict[str, PinnedFileChirho], curation_chirho: dict, curation_bytes_chirho: bytes
) -> list[dict]:
    sources_chirho = [
        {
            "id_chirho": entry_chirho.id_chirho,
            "title_chirho": entry_chirho.title_chirho,
            "url_chirho": entry_chirho.blob_url_chirho,
            "revision_chirho": entry_chirho.commit_chirho,
            "sha256_chirho": entry_chirho.sha256_chirho,
            "license_chirho": entry_chirho.license_chirho,
            "attribution_chirho": f"{entry_chirho.attribution_chirho}. Adapted here: "
            f"{entry_chirho.adaptation_chirho}. No endorsement is implied.",
        }
        for entry_chirho in pinned_chirho.values()
        if entry_chirho.role_chirho in LESSON_SOURCE_ROLES_CHIRHO
    ]
    app_chirho = curation_chirho["app_source_chirho"]
    sources_chirho.append(
        {
            "id_chirho": app_chirho["id_chirho"],
            "title_chirho": app_chirho["title_chirho"],
            "url_chirho": None,
            "revision_chirho": app_chirho["revision_chirho"],
            "sha256_chirho": hashlib.sha256(curation_bytes_chirho).hexdigest(),
            "license_chirho": app_chirho["license_chirho"],
            "attribution_chirho": app_chirho["attribution_chirho"],
        }
    )
    return sources_chirho


def json_bytes_chirho(value_chirho: dict) -> bytes:
    return (json.dumps(value_chirho, ensure_ascii=False, indent="\t") + "\n").encode("utf-8")


def build_outputs_chirho(repo_root_chirho: Path = REPO_ROOT_CHIRHO) -> dict[Path, bytes]:
    """Build the extract and the lesson in memory; nothing is written here."""
    pinned_chirho = load_manifest_chirho(repo_root_chirho / SOURCES_DIR_CHIRHO)
    verified_chirho = verify_all_chirho(pinned_chirho)
    curation_bytes_chirho = (repo_root_chirho / CURATION_PATH_CHIRHO).read_bytes()
    curation_chirho = load_curation_chirho(curation_bytes_chirho)
    if curation_chirho["source_file_chirho"] not in verified_chirho:
        raise CurationErrorChirho(
            f"curation: unknown source file {curation_chirho['source_file_chirho']}"
        )
    verse_chirho = parse_verse_chirho(
        verified_chirho[curation_chirho["source_file_chirho"]], curation_chirho["id_chirho"]
    )
    strong_entries_chirho = parse_strong_chirho(verified_chirho[STRONG_FILE_CHIRHO])
    aug_index_chirho = parse_aug_index_chirho(verified_chirho[AUG_FILE_CHIRHO])
    lexical_index_chirho = parse_lexical_index_chirho(verified_chirho[LEXICAL_FILE_CHIRHO])

    word_ids_chirho = [word_chirho.oshb_id_chirho for word_chirho in verse_chirho.words_chirho]
    curated_tokens_chirho = curation_chirho["tokens_chirho"]
    if len(set(word_ids_chirho)) != len(word_ids_chirho) or set(curated_tokens_chirho) != set(
        word_ids_chirho
    ):
        raise CurationErrorChirho(
            f"curation tokens {sorted(curated_tokens_chirho)} must match the verse's words "
            f"{word_ids_chirho} one for one"
        )
    tokens_chirho, records_chirho = [], []
    cited_strong_chirho: set[str] = set()
    cited_lexical_chirho: set[str] = set()
    for word_chirho in verse_chirho.words_chirho:
        token_chirho, record_chirho, strong_ids_chirho, lexical_ids_chirho = build_word_chirho(
            word_chirho,
            curated_tokens_chirho[word_chirho.oshb_id_chirho],
            strong_entries_chirho,
            aug_index_chirho,
            lexical_index_chirho,
        )
        tokens_chirho.append(token_chirho)
        records_chirho.append(record_chirho)
        cited_strong_chirho |= strong_ids_chirho
        cited_lexical_chirho |= lexical_ids_chirho

    lesson_chirho = {
        "schema_version_chirho": SCHEMA_VERSION_CHIRHO,
        "id_chirho": curation_chirho["id_chirho"],
        "language_chirho": curation_chirho["language_chirho"],
        "reference_chirho": curation_chirho["reference_chirho"],
        "canonical_text_chirho": verse_chirho.canonical_text_chirho,
        "translation_chirho": curation_chirho["translation_chirho"],
        "tokens_chirho": tokens_chirho,
        "sources_chirho": lesson_sources_chirho(
            pinned_chirho, curation_chirho, curation_bytes_chirho
        ),
    }
    canonical_chirho = verse_chirho.canonical_text_chirho
    extract_chirho = {
        "schema_version_chirho": SCHEMA_VERSION_CHIRHO,
        "osis_ref_chirho": verse_chirho.osis_id_chirho,
        "generated_by_chirho": GENERATOR_CHIRHO,
        "verified_files_chirho": [
            {
                "id_chirho": entry_chirho.id_chirho,
                "upstream_path_chirho": entry_chirho.upstream_path_chirho,
                "revision_chirho": entry_chirho.commit_chirho,
                "sha256_chirho": entry_chirho.sha256_chirho,
            }
            for entry_chirho in pinned_chirho.values()
        ],
        "canonical_text_chirho": canonical_chirho,
        "canonical_text_utf8_sha256_chirho": hashlib.sha256(
            canonical_chirho.encode("utf-8")
        ).hexdigest(),
        "canonical_text_utf16_length_chirho": utf16_length_chirho(canonical_chirho),
        "translation_ref_chirho": curation_chirho["translation_ref_chirho"],
        "handoff_comparison_chirho": compare_handoff_chirho(verse_chirho, curation_chirho),
        "words_chirho": records_chirho,
        "punctuation_chirho": [
            {
                "type_chirho": mark_chirho.type_chirho,
                "text_chirho": mark_chirho.text_chirho,
                "start_chirho": mark_chirho.start_chirho,
                "end_chirho": mark_chirho.end_chirho,
                "after_word_chirho": mark_chirho.after_word_chirho,
            }
            for mark_chirho in verse_chirho.punctuation_chirho
        ],
        "strong_entries_chirho": [
            strong_record_chirho(strong_entry_for_chirho(strong_id_chirho, strong_entries_chirho))
            for strong_id_chirho in sorted(
                cited_strong_chirho, key=lambda id_chirho: int(id_chirho[1:])
            )
        ],
        "lexical_index_entries_chirho": [
            lexical_record_chirho(lexical_index_chirho[entry_id_chirho])
            for entry_id_chirho in sorted(cited_lexical_chirho)
        ],
    }
    return {
        repo_root_chirho
        / EXTRACTS_DIR_CHIRHO
        / curation_chirho["extract_file_chirho"]: json_bytes_chirho(extract_chirho),
        repo_root_chirho
        / LESSONS_DIR_CHIRHO
        / curation_chirho["lesson_file_chirho"]: json_bytes_chirho(lesson_chirho),
    }


def write_atomically_chirho(path_chirho: Path, data_chirho: bytes) -> None:
    with tempfile.NamedTemporaryFile(dir=path_chirho.parent, delete=False) as handle_chirho:
        handle_chirho.write(data_chirho)
    os.chmod(handle_chirho.name, 0o644)  # NamedTemporaryFile creates 0600
    os.replace(handle_chirho.name, path_chirho)


def main_chirho(argv_chirho: list[str] | None = None) -> int:
    parser_chirho = argparse.ArgumentParser(description=__doc__.splitlines()[0])
    parser_chirho.add_argument(
        "--check",
        action="store_true",
        help="exit 1 if the committed files differ from a fresh import",
    )
    options_chirho = parser_chirho.parse_args(argv_chirho)
    try:
        outputs_chirho = build_outputs_chirho()
    except (*IMPORT_ERRORS_CHIRHO, CurationErrorChirho) as error_chirho:
        print(f"import refused: {error_chirho}", file=sys.stderr)
        return 2
    if options_chirho.check:
        drifted_chirho = [
            path_chirho
            for path_chirho, data_chirho in outputs_chirho.items()
            if not path_chirho.is_file() or path_chirho.read_bytes() != data_chirho
        ]
        for path_chirho in drifted_chirho:
            print(f"drift: {path_chirho.relative_to(REPO_ROOT_CHIRHO)}", file=sys.stderr)
        if drifted_chirho:
            return 1
        print(f"up to date: {len(outputs_chirho)} files match a fresh import")
        return 0
    for path_chirho, data_chirho in outputs_chirho.items():
        write_atomically_chirho(path_chirho, data_chirho)
        print(f"wrote {path_chirho.relative_to(REPO_ROOT_CHIRHO)}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main_chirho())
