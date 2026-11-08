# For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life. — John 3:16 (KJV)
"""Workflow: verse-media-chirho.md. Twelve explicit opening windows, never a general timing shift."""

import hashlib as hashlib_chirho
import json as json_chirho
import struct as struct_chirho

PHASE_CHIRHO = "proverbs-openings-v1-chirho"
RECORD_PATH_CHIRHO = "data-chirho/audio-chirho/beeri-opening-corrections-chirho.json"
RECORD_SHA_CHIRHO = "16daf1b1fadd6c4a73b4355f12e3a7365f4df848b3f33df76db88a14d5a2caa8"
RUN_PATH_CHIRHO = "workspace-chirho/audio-chirho/beeri-verses-2026-11-07-chirho"


def sha_chirho(bytes_chirho):
    return hashlib_chirho.sha256(bytes_chirho).hexdigest()


def decode_definition_chirho(bytes_chirho):
    if sha_chirho(bytes_chirho) != RECORD_SHA_CHIRHO:
        raise ValueError("Finite correction record changed")
    return json_chirho.loads(bytes_chirho)


def definition_chirho(
    root_chirho, phase_chirho, run_chirho, books_chirho, limit_chirho
):
    """Refuse an altered phase, source text or original install plan before any cut."""
    if (
        phase_chirho != PHASE_CHIRHO
        or run_chirho != root_chirho / RUN_PATH_CHIRHO
        or books_chirho != ["Prov"]
        or limit_chirho is not None
    ):
        raise ValueError("Expected the exact twelve-opening Proverbs phase")
    record_chirho = decode_definition_chirho(
        (root_chirho / RECORD_PATH_CHIRHO).read_bytes()
    )
    if (
        sha_chirho(
            (
                root_chirho / record_chirho["source_text_chirho"]["path_chirho"]
            ).read_bytes()
        )
        != record_chirho["source_text_chirho"]["sha256_chirho"]
        or sha_chirho(
            (root_chirho / record_chirho["prior_plan_path_chirho"]).read_bytes()
        )
        != record_chirho["prior_plan_sha256_chirho"]
    ):
        raise ValueError("Corrected opening source text or prior install plan changed")
    return record_chirho


def opening_rows_chirho(
    definition_value_chirho,
    chapter_chirho,
    source_chirho,
    chapter_bytes_chirho,
    timing_bytes_chirho,
):
    """Return only verse one's checked zero-to-first-start window for its exact source."""
    number_chirho = chapter_chirho["chapter_chirho"]
    matches_chirho = [
        row_chirho
        for row_chirho in definition_value_chirho["chapters_chirho"]
        if row_chirho["chapter_chirho"] == number_chirho
    ]
    if len(matches_chirho) != 1:
        raise ValueError("Chapter is outside the finite opening correction")
    record_chirho = matches_chirho[0]
    verses_chirho = chapter_chirho["verses_chirho"]
    expected_ids_chirho = [
        f"Prov.{number_chirho}.{verse_chirho}"
        for verse_chirho in range(1, record_chirho["source_verses_chirho"] + 1)
    ]
    if (
        [row_chirho["lesson_id_chirho"] for row_chirho in verses_chirho]
        != expected_ids_chirho
        or chapter_chirho["content_path_chirho"] != record_chirho["content_path_chirho"]
        or chapter_chirho["content_sha256_chirho"]
        != record_chirho["content_sha256_chirho"]
        or verses_chirho[0]["canonical_sha256_chirho"]
        != record_chirho["canonical_sha256_chirho"]
        or sha_chirho(verses_chirho[0]["text_chirho"].encode())
        != record_chirho["spoken_sha256_chirho"]
        or sha_chirho(chapter_bytes_chirho) != record_chirho["chapter_sha256_chirho"]
        or sha_chirho(timing_bytes_chirho)
        != definition_value_chirho["timings_sha256_chirho"]
        or source_chirho["files_chirho"].get(f"chapter-{number_chirho:03d}-chirho.mp3")
        != record_chirho["chapter_sha256_chirho"]
        or source_chirho["files_chirho"].get("timings-chirho.bin")
        != definition_value_chirho["timings_sha256_chirho"]
        or any(
            source_chirho[key_chirho] != definition_value_chirho[key_chirho]
            for key_chirho in (
                "gbt_id_chirho",
                "package_sha256_chirho",
                "manifest_sha256_chirho",
            )
        )
    ):
        raise ValueError("Finite opening canonical or source evidence changed")
    if len(timing_bytes_chirho) % 11:
        raise ValueError("Torn opening timing record")
    rows_chirho = []
    for offset_chirho in range(0, len(timing_bytes_chirho), 11):
        book_chirho, chapter_number_chirho, verse_chirho = timing_bytes_chirho[
            offset_chirho : offset_chirho + 3
        ]
        if chapter_number_chirho != number_chirho:
            continue
        if book_chirho != 20:
            raise ValueError("Foreign opening timing book")
        start_chirho = (
            struct_chirho.unpack(
                ">I", timing_bytes_chirho[offset_chirho + 3 : offset_chirho + 7]
            )[0]
            / 100
        )
        rows_chirho.append((verse_chirho, start_chirho))
    if (
        [row_chirho[0] for row_chirho in rows_chirho]
        != list(range(1, record_chirho["source_verses_chirho"]))
        or len(rows_chirho) != record_chirho["timed_records_chirho"]
        or rows_chirho[0][1] != record_chirho["end_chirho"]
    ):
        raise ValueError("Finite opening timing pattern changed")
    return [
        {"verse_chirho": 1, "start_chirho": 0},
        {"verse_chirho": 2, "start_chirho": record_chirho["end_chirho"]},
    ]
