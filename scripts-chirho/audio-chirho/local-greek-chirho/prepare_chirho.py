#!/usr/bin/env python3
# For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life. — John 3:16 (KJV)
"""Workflow: verse-media-chirho.md. Source-bound local derivatives only, no network or synthesis."""

import concurrent.futures as futures_chirho
import hashlib as hashlib_chirho
import json as json_chirho
import math as math_chirho
import os as os_chirho
import subprocess as subprocess_chirho
from pathlib import Path as PathChirho

ROOT_CHIRHO = PathChirho(__file__).resolve().parents[3]
RUN_CHIRHO = (
    ROOT_CHIRHO / "workspace-chirho/audio-chirho/local-greek-verses-2026-11-07-chirho"
)
OUTPUT_CHIRHO = ROOT_CHIRHO / "build-chirho/local-greek-install-2026-11-07-chirho"
MANIFEST_SHA_CHIRHO = "5527568997b648b7753d3fcddf6414425e3833bedb105eae110505ab43d8f452"


def digest_chirho(bytes_chirho):
    return hashlib_chirho.sha256(bytes_chirho).hexdigest()


def owned_chirho(home_chirho, path_chirho, maximum_chirho):
    candidate_chirho = home_chirho / path_chirho
    if PathChirho(path_chirho).is_absolute() or ".." in PathChirho(path_chirho).parts:
        raise ValueError("Unowned source path")
    if (
        candidate_chirho.is_symlink()
        or candidate_chirho.resolve() != candidate_chirho.absolute()
    ):
        raise ValueError("Redirected source path")
    if (
        not candidate_chirho.is_file()
        or candidate_chirho.stat().st_size > maximum_chirho
    ):
        raise ValueError("Unbounded source file")
    return candidate_chirho


def derive_chirho(job_chirho):
    chosen_chirho = job_chirho["chosen_chirho"]
    if job_chirho["state_chirho"] != "done" or chosen_chirho["flag_chirho"] is not None:
        raise ValueError("Unusable take")
    if chosen_chirho["asr_chirho"]["cer_chirho"] > 0.35:
        raise ValueError("Flagged text check")
    for path_key_chirho, hash_key_chirho in [
        ("path_chirho", "sha256_chirho"),
        ("raw_path_chirho", "raw_sha256_chirho"),
    ]:
        original_chirho = owned_chirho(
            RUN_CHIRHO, chosen_chirho[path_key_chirho], 16 * 1024**2
        )
        original_bytes_chirho = original_chirho.read_bytes()
        if digest_chirho(original_bytes_chirho) != chosen_chirho[hash_key_chirho]:
            raise ValueError("Original audio hash differs")
        if (
            path_key_chirho == "path_chirho"
            and len(original_bytes_chirho) != chosen_chirho["bytes_chirho"]
        ):
            raise ValueError("Original MP3 length differs")
    content_chirho = owned_chirho(
        ROOT_CHIRHO / "static/content-chirho",
        job_chirho["content_path_chirho"],
        4 * 1024**2,
    ).read_bytes()
    if digest_chirho(content_chirho) != job_chirho["content_sha256_chirho"]:
        raise ValueError("Canonical chapter differs")
    lesson_chirho = next(
        row_chirho
        for row_chirho in json_chirho.loads(content_chirho)["verses_chirho"]
        if row_chirho["id_chirho"] == job_chirho["verse_id_chirho"]
    )
    if (
        lesson_chirho["canonical_text_chirho"] != job_chirho["canonical_text_chirho"]
        or digest_chirho(lesson_chirho["canonical_text_chirho"].encode())
        != job_chirho["canonical_sha256_chirho"]
    ):
        raise ValueError("Canonical verse differs")
    if (
        digest_chirho(job_chirho["sent_chirho"].encode())
        != job_chirho["sent_sha256_chirho"]
    ):
        raise ValueError("Spoken input hash differs")
    raw_chirho = RUN_CHIRHO / chosen_chirho["raw_path_chirho"]
    # Decode duration rather than trusting a piped FLAC header's absent sample count.
    decoded_chirho = subprocess_chirho.run(
        [
            "ffmpeg",
            "-v",
            "warning",
            "-i",
            str(raw_chirho),
            "-f",
            "s16le",
            "-ac",
            "1",
            "-ar",
            "24000",
            "pipe:1",
        ],
        capture_output=True,
        check=True,
    )
    if (
        decoded_chirho.stderr
        or abs(len(decoded_chirho.stdout) / 48000 - chosen_chirho["seconds_chirho"])
        > 0.1
    ):
        raise ValueError("Original decode or duration differs")
    path_chirho = (
        OUTPUT_CHIRHO / "delivery-chirho" / (job_chirho["job_chirho"] + "-chirho.mp3")
    )
    if not path_chirho.exists():
        temporary_chirho = path_chirho.with_suffix(".part-chirho.mp3")
        if temporary_chirho.exists():
            raise ValueError("Interrupted derivative requires reconciliation")
        # A full final MPEG-1 frame avoids libmp3lame's empty-queue flush warning.
        # This adds only 0..26ms of silence; source speech and its timing are preserved.
        samples_chirho = (
            math_chirho.ceil((len(decoded_chirho.stdout) // 2) * 44100 / 24000 / 1152)
            * 1152
        )
        completed_chirho = subprocess_chirho.run(
            [
                "ffmpeg",
                "-v",
                "warning",
                "-nostdin",
                "-n",
                "-i",
                str(raw_chirho),
                "-map_metadata",
                "-1",
                "-af",
                f"aresample=44100,apad=whole_len={samples_chirho}",
                "-ac",
                "1",
                "-ar",
                "44100",
                "-c:a",
                "libmp3lame",
                "-b:a",
                "64k",
                "-threads",
                "1",
                str(temporary_chirho),
            ],
            capture_output=True,
            check=True,
        )
        if completed_chirho.stderr:
            raise ValueError(
                f"Delivery encoder warning {job_chirho['job_chirho']}: {completed_chirho.stderr.decode()}"
            )
        temporary_chirho.rename(path_chirho)
    facts_chirho = json_chirho.loads(
        subprocess_chirho.check_output(
            [
                "ffprobe",
                "-v",
                "error",
                "-show_streams",
                "-show_format",
                "-of",
                "json",
                str(path_chirho),
            ]
        )
    )
    stream_chirho = facts_chirho["streams"][0]
    duration_chirho = float(facts_chirho["format"]["duration"])
    if (
        len(facts_chirho["streams"]) != 1
        or stream_chirho["codec_name"] != "mp3"
        or int(stream_chirho["sample_rate"]) != 44100
        or stream_chirho["channels"] != 1
        or abs(duration_chirho - chosen_chirho["seconds_chirho"]) > 0.15
    ):
        raise ValueError("Delivery codec or duration differs")
    checked_chirho = subprocess_chirho.run(
        ["ffmpeg", "-v", "warning", "-i", str(path_chirho), "-f", "null", "-"],
        capture_output=True,
        check=True,
    )
    if checked_chirho.stderr:
        raise ValueError("Delivery decode warning")
    bytes_chirho = path_chirho.read_bytes()
    return {
        "job_chirho": job_chirho["job_chirho"],
        "verse_id_chirho": job_chirho["verse_id_chirho"],
        "path_chirho": str(path_chirho.relative_to(ROOT_CHIRHO)),
        "sha256_chirho": digest_chirho(bytes_chirho),
        "bytes_chirho": len(bytes_chirho),
        "duration_chirho": duration_chirho,
        "original_mp3_sha256_chirho": chosen_chirho["sha256_chirho"],
        "raw_flac_sha256_chirho": chosen_chirho["raw_sha256_chirho"],
    }


def main_chirho():
    manifest_bytes_chirho = (
        OUTPUT_CHIRHO / "source-chirho/manifest-chirho.json"
    ).read_bytes()
    if digest_chirho(manifest_bytes_chirho) != MANIFEST_SHA_CHIRHO:
        raise ValueError("Frozen manifest differs")
    manifest_chirho = json_chirho.loads(manifest_bytes_chirho)
    for name_chirho, hash_key_chirho in [
        ("plan-chirho.json", "plan_sha256_chirho"),
        ("journal-chirho.jsonl", "journal_sha256_chirho"),
    ]:
        bytes_chirho = (OUTPUT_CHIRHO / "source-chirho" / name_chirho).read_bytes()
        if digest_chirho(bytes_chirho) != manifest_chirho[hash_key_chirho]:
            raise ValueError("Pinned producer evidence changed")
    jobs_chirho = [
        row_chirho
        for row_chirho in manifest_chirho["jobs_chirho"]
        if row_chirho["state_chirho"] == "done"
    ]
    if (
        len(jobs_chirho) != 1084
        or len({row_chirho["verse_id_chirho"] for row_chirho in jobs_chirho}) != 1084
    ):
        raise ValueError("Eligible run partition differs")
    (OUTPUT_CHIRHO / "delivery-chirho").mkdir(parents=True, exist_ok=True)
    with futures_chirho.ThreadPoolExecutor(max_workers=2) as pool_chirho:
        rows_chirho = list(pool_chirho.map(derive_chirho, jobs_chirho))
    # Atomic completion marker, with original source and delivery identities; never an approval.
    destination_chirho = OUTPUT_CHIRHO / "prepared-chirho.json"
    value_chirho = (
        json_chirho.dumps(
            {
                "manifest_sha256_chirho": MANIFEST_SHA_CHIRHO,
                "recordings_chirho": rows_chirho,
            },
            indent=2,
        )
        + "\n"
    )
    if destination_chirho.exists() and destination_chirho.read_text() != value_chirho:
        raise ValueError("Existing derivative plan differs")
    temporary_chirho = destination_chirho.with_suffix(".part-chirho.json")
    temporary_chirho.write_text(value_chirho)
    os_chirho.replace(temporary_chirho, destination_chirho)
    print(
        json_chirho.dumps(
            {
                "prepared_chirho": len(rows_chirho),
                "bytes_chirho": sum(
                    row_chirho["bytes_chirho"] for row_chirho in rows_chirho
                ),
                "flagged_excluded_chirho": 25,
            }
        ),
        flush=True,
    )


if __name__ == "__main__":
    main_chirho()
