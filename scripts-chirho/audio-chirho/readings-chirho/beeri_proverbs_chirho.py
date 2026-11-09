# For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life. — John 3:16 (KJV)
"""Workflow: verse-media-chirho.md. Exact remaining verses in twelve already-proved sources."""

import hashlib as hashlib_chirho
import importlib.util as importlib_chirho
import json as json_chirho
from pathlib import Path as PathChirho

PHASE_CHIRHO = "proverbs-remainder-v1-chirho"
RUN_PATH_CHIRHO = "workspace-chirho/audio-chirho/beeri-verses-2026-11-07-chirho"
HOME_PATH_CHIRHO = RUN_PATH_CHIRHO + "/" + PHASE_CHIRHO
RECORD_PATH_CHIRHO = "data-chirho/audio-chirho/beeri-proverbs-remainder-chirho.json"
RECORD_SHA_CHIRHO = "51c19d8ddd8e2f8e6413de0def2289a5414a39677d9d17888dfa5cf0490834b7"
SPEC_CHIRHO = importlib_chirho.spec_from_file_location(
    "beeri_correction_chirho",
    PathChirho(__file__).with_name("beeri_correction_chirho.py"),
)
OPENING_CHIRHO = importlib_chirho.module_from_spec(SPEC_CHIRHO)
SPEC_CHIRHO.loader.exec_module(OPENING_CHIRHO)


def sha_chirho(bytes_chirho):
    return hashlib_chirho.sha256(bytes_chirho).hexdigest()


def definition_chirho(
    root_chirho, phase_chirho, run_chirho, books_chirho, limit_chirho
):
    if (
        phase_chirho != PHASE_CHIRHO
        or run_chirho != root_chirho / RUN_PATH_CHIRHO
        or books_chirho != ["Prov"]
        or limit_chirho is not None
    ):
        raise ValueError("Expected the exact remaining-Proverbs phase")
    bytes_chirho = (root_chirho / RECORD_PATH_CHIRHO).read_bytes()
    if sha_chirho(bytes_chirho) != RECORD_SHA_CHIRHO:
        raise ValueError("Finite remaining-Proverbs definition changed")
    value_chirho = json_chirho.loads(bytes_chirho)
    old_bytes_chirho = (root_chirho / OPENING_CHIRHO.RECORD_PATH_CHIRHO).read_bytes()
    old_chirho = OPENING_CHIRHO.decode_definition_chirho(old_bytes_chirho)
    if (
        value_chirho["opening_definition_sha256_chirho"] != sha_chirho(old_bytes_chirho)
        or [
            {
                key_chirho: item_chirho
                for key_chirho, item_chirho in row_chirho.items()
                if key_chirho != "windows_chirho"
            }
            for row_chirho in value_chirho["chapters_chirho"]
        ]
        != old_chirho["chapters_chirho"]
        or any(
            value_chirho[key_chirho] != old_chirho[key_chirho]
            for key_chirho in (
                "source_evidence_sha256_chirho",
                "gbt_id_chirho",
                "package_sha256_chirho",
                "timings_sha256_chirho",
                "manifest_sha256_chirho",
                "source_text_chirho",
            )
        )
        or sha_chirho(
            (
                root_chirho / value_chirho["source_text_chirho"]["path_chirho"]
            ).read_bytes()
        )
        != value_chirho["source_text_chirho"]["sha256_chirho"]
        or sha_chirho(
            (root_chirho / value_chirho["prior_plan_path_chirho"]).read_bytes()
        )
        != value_chirho["prior_plan_sha256_chirho"]
    ):
        raise ValueError("Remaining-Proverbs source or prior plan changed")
    return value_chirho


def aligned_rows_chirho(
    definition_value_chirho,
    chapter_chirho,
    source_chirho,
    chapter_bytes_chirho,
    timing_bytes_chirho,
    rows_chirho,
):
    """Prove the original opening evidence before mapping its labels k to verse k+1."""
    OPENING_CHIRHO.opening_rows_chirho(
        definition_value_chirho,
        chapter_chirho,
        source_chirho,
        chapter_bytes_chirho,
        timing_bytes_chirho,
    )
    record_chirho = next(
        row_chirho
        for row_chirho in definition_value_chirho["chapters_chirho"]
        if row_chirho["chapter_chirho"] == chapter_chirho["chapter_chirho"]
    )
    if [row_chirho["verse_chirho"] for row_chirho in rows_chirho] != list(
        range(1, record_chirho["source_verses_chirho"])
    ):
        raise ValueError("Remaining-Proverbs label identity changed")
    aligned_chirho = [
        {
            "verse_chirho": row_chirho["verse_chirho"] + 1,
            "start_chirho": row_chirho["start_chirho"],
        }
        for row_chirho in rows_chirho
    ]
    windows_chirho = record_chirho["windows_chirho"]
    verses_chirho = chapter_chirho["verses_chirho"][1:]
    if len(windows_chirho) != len(aligned_chirho) or len(verses_chirho) != len(
        windows_chirho
    ):
        raise ValueError("Remaining-Proverbs membership changed")
    for index_chirho, (verse_chirho, window_chirho, row_chirho) in enumerate(
        zip(verses_chirho, windows_chirho, aligned_chirho, strict=True)
    ):
        end_chirho = (
            aligned_chirho[index_chirho + 1]["start_chirho"]
            if index_chirho + 1 < len(aligned_chirho)
            else record_chirho["chapter_duration_chirho"]
        )
        if (
            verse_chirho["lesson_id_chirho"] != window_chirho["lesson_id_chirho"]
            or verse_chirho["canonical_sha256_chirho"]
            != window_chirho["canonical_sha256_chirho"]
            or sha_chirho(verse_chirho["text_chirho"].encode())
            != window_chirho["spoken_sha256_chirho"]
            or window_chirho["start_chirho"] != row_chirho["start_chirho"]
            or window_chirho["end_chirho"] != end_chirho
        ):
            raise ValueError("Remaining-Proverbs window or verse changed")
    return aligned_chirho
