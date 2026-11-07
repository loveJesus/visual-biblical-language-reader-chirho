# For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life. — John 3:16 (KJV)
"""Workflow: verse-media-chirho.md. Resumable Be'eri cuts; no catalogue writes or synthesis."""

import argparse as argparse_chirho
import fcntl as fcntl_chirho
import hashlib as hashlib_chirho
import json as json_chirho
import os as os_chirho
import re as re_chirho
import shutil as shutil_chirho
import struct as struct_chirho
import subprocess as subprocess_chirho
import tempfile as tempfile_chirho
import urllib.request as request_chirho
import zipfile as zipfile_chirho
from pathlib import Path as PathChirho

ROOT_CHIRHO = PathChirho(__file__).resolve().parents[3]
MANIFEST_SHA_CHIRHO = "e175174a3dea3872dc63dd7a9813a47dc802e9e1538d17adcb8bbcba5a861f77"
ATTRIBUTION_CHIRHO = "Hebrew reading by Rabbi Dan Be'eri (CC BY-SA 3.0), compiled at archive.org; chapter files and verse timings from Global Bible Tools"


def sha_chirho(bytes_chirho):
    return hashlib_chirho.sha256(bytes_chirho).hexdigest()


def write_json_chirho(path_chirho, value_chirho):
    body_chirho = (
        json_chirho.dumps(value_chirho, ensure_ascii=False, indent=2) + "\n"
    ).encode()
    if path_chirho.exists():
        if path_chirho.read_bytes() != body_chirho:
            raise ValueError(f"Immutable record differs: {path_chirho}")
        return
    path_chirho.parent.mkdir(parents=True, exist_ok=True)
    with path_chirho.open("xb") as file_chirho:
        os_chirho.chmod(path_chirho, 0o600)
        file_chirho.write(body_chirho)
        file_chirho.flush()
        os_chirho.fsync(file_chirho.fileno())


def timings_chirho(bytes_chirho, book_number_chirho):
    if len(bytes_chirho) % 11:
        raise ValueError("Torn timing record")
    groups_chirho = {}
    last_identity_chirho = (0, 0)
    for index_chirho in range(0, len(bytes_chirho), 11):
        book_chirho, chapter_chirho, verse_chirho = bytes_chirho[
            index_chirho : index_chirho + 3
        ]
        start_chirho, end_chirho = struct_chirho.unpack(
            ">II", bytes_chirho[index_chirho + 3 : index_chirho + 11]
        )
        identity_chirho = (chapter_chirho, verse_chirho)
        if (
            book_chirho != book_number_chirho
            or identity_chirho <= last_identity_chirho
            or not chapter_chirho
            or not verse_chirho
        ):
            raise ValueError("Unordered, duplicate or foreign timing identity")
        last_identity_chirho = identity_chirho
        groups_chirho.setdefault(chapter_chirho, []).append(
            {
                "verse_chirho": verse_chirho,
                "start_chirho": start_chirho / 100,
                "recorded_end_chirho": end_chirho / 100,
            }
        )
    return groups_chirho


def inspect_chirho(path_chirho):
    probe_chirho = json_chirho.loads(
        subprocess_chirho.check_output(
            [
                "ffprobe",
                "-v",
                "error",
                "-show_entries",
                "format=duration:stream=codec_name,sample_rate,channels",
                "-of",
                "json",
                str(path_chirho),
            ],
            text=True,
        )
    )
    if (
        len(probe_chirho["streams"]) != 1
        or probe_chirho["streams"][0]["codec_name"] != "mp3"
    ):
        raise ValueError("Expected one MP3 stream")
    return float(probe_chirho["format"]["duration"])


def pauses_chirho(path_chirho):
    log_chirho = subprocess_chirho.run(
        [
            "ffmpeg",
            "-v",
            "info",
            "-nostats",
            "-i",
            str(path_chirho),
            "-af",
            "silencedetect=noise=-35dB:d=0.12",
            "-f",
            "null",
            "-",
        ],
        check=True,
        capture_output=True,
        text=True,
    ).stderr
    result_chirho = []
    start_chirho = None
    for line_chirho in log_chirho.splitlines():
        if "silence_start:" in line_chirho:
            start_chirho = float(line_chirho.split("silence_start:")[1].split()[0])
        elif "silence_end:" in line_chirho and start_chirho is not None:
            result_chirho.append(
                (start_chirho, float(line_chirho.split("silence_end:")[1].split()[0]))
            )
            start_chirho = None
    if start_chirho is not None:
        result_chirho.append((start_chirho, inspect_chirho(path_chirho)))
    return result_chirho


def window_chirho(rows_chirho, index_chirho, duration_chirho, pauses_value_chirho):
    start_chirho = rows_chirho[index_chirho]["start_chirho"]
    end_chirho = (
        rows_chirho[index_chirho + 1]["start_chirho"]
        if index_chirho + 1 < len(rows_chirho)
        else duration_chirho
    )
    if (
        not 0 <= start_chirho < end_chirho <= duration_chirho + 0.05
        or end_chirho - start_chirho > 120
    ):
        raise ValueError("Invalid or oversized verse window")
    for boundary_chirho in (start_chirho, end_chirho):
        if boundary_chirho <= 0.25 or abs(boundary_chirho - duration_chirho) <= 0.25:
            continue
        distance_chirho = min(
            (
                max(low_chirho - boundary_chirho, boundary_chirho - high_chirho, 0)
                for low_chirho, high_chirho in pauses_value_chirho
            ),
            default=float("inf"),
        )
        if distance_chirho > 0.25:
            raise ValueError("Verse boundary is not within 0.25s of a measured pause")
    return start_chirho, min(end_chirho, duration_chirho)


def package_chirho(home_chirho, entry_chirho):
    if (
        shutil_chirho.disk_usage(home_chirho).free
        < 15 * 1024**3 + entry_chirho["size"] * 3
    ):
        raise RuntimeError("Storage floor reached before source download")
    target_chirho = home_chirho / "source-chirho"
    source_path_chirho = target_chirho / "source-chirho.json"
    if source_path_chirho.exists():
        source_chirho = json_chirho.loads(source_path_chirho.read_text())
        if source_chirho["package_sha256_chirho"] != entry_chirho["sha256"]:
            raise ValueError("Previously installed source package changed")
        for name_chirho, digest_chirho in source_chirho["files_chirho"].items():
            if sha_chirho((target_chirho / name_chirho).read_bytes()) != digest_chirho:
                raise ValueError("Preserved source file changed")
        return source_chirho
    if (
        not re_chirho.fullmatch(
            r"audio/v1/OT/RDB/[A-Za-z0-9]+\.zip", entry_chirho["url"]
        )
        or not 0 < entry_chirho["size"] <= 400_000_000
    ):
        raise ValueError("Source URL or size refused")
    target_chirho.mkdir(parents=True, exist_ok=True)
    with tempfile_chirho.TemporaryDirectory(
        prefix="beeri-package-chirho-", dir=home_chirho
    ) as temp_chirho:
        archive_path_chirho = PathChirho(temp_chirho) / "package-chirho.zip"
        digest_chirho = hashlib_chirho.sha256()
        length_chirho = 0
        with (
            request_chirho.urlopen(
                "https://assets.globalbibletools.com/" + entry_chirho["url"], timeout=60
            ) as response_chirho,
            archive_path_chirho.open("xb") as output_chirho,
        ):
            while chunk_chirho := response_chirho.read(1024 * 1024):
                length_chirho += len(chunk_chirho)
                if length_chirho > entry_chirho["size"]:
                    raise ValueError("Oversized package response")
                digest_chirho.update(chunk_chirho)
                output_chirho.write(chunk_chirho)
        if (
            length_chirho != entry_chirho["size"]
            or digest_chirho.hexdigest() != entry_chirho["sha256"]
        ):
            raise ValueError("Source package hash/length differs")
        files_chirho = {}
        book_chirho = entry_chirho["id"].split("/")[-1]
        with zipfile_chirho.ZipFile(archive_path_chirho) as archive_chirho:
            for member_chirho in archive_chirho.infolist():
                match_chirho = re_chirho.fullmatch(
                    re_chirho.escape(book_chirho) + r"/(\d{3}\.mp3|timings\.bin)",
                    member_chirho.filename,
                )
                if not match_chirho:
                    continue
                if member_chirho.file_size > 32 * 1024 * 1024:
                    raise ValueError("Oversized source member")
                name_chirho = (
                    "timings-chirho.bin"
                    if match_chirho[1] == "timings.bin"
                    else "chapter-" + match_chirho[1][:3] + "-chirho.mp3"
                )
                if name_chirho in files_chirho:
                    raise ValueError("Duplicate package member")
                bytes_chirho = archive_chirho.read(member_chirho)
                path_chirho = target_chirho / name_chirho
                if path_chirho.exists() and path_chirho.read_bytes() != bytes_chirho:
                    raise ValueError("Source member changed on resume")
                if not path_chirho.exists():
                    path_chirho.write_bytes(bytes_chirho)
                files_chirho[name_chirho] = sha_chirho(bytes_chirho)
        if "timings-chirho.bin" not in files_chirho:
            raise ValueError("Missing source timings")
        source_chirho = {
            "gbt_id_chirho": entry_chirho["id"],
            "package_sha256_chirho": entry_chirho["sha256"],
            "package_bytes_chirho": entry_chirho["size"],
            "manifest_sha256_chirho": MANIFEST_SHA_CHIRHO,
            "source_url_chirho": "https://assets.globalbibletools.com/"
            + entry_chirho["url"],
            "files_chirho": files_chirho,
            "license_chirho": "CC BY-SA 3.0",
            "license_url_chirho": "https://creativecommons.org/licenses/by-sa/3.0/",
            "attribution_chirho": ATTRIBUTION_CHIRHO,
        }
        write_json_chirho(source_path_chirho, source_chirho)
    return source_chirho


def prepare_chirho(run_chirho, book_chirho, entry_chirho, chapter_limit_chirho):
    home_chirho = run_chirho / "books-chirho" / book_chirho["slug_chirho"]
    snapshot_chirho = home_chirho / "snapshots-chirho"
    subprocess_chirho.run(
        [
            "bun",
            "scripts-chirho/audio-chirho/readings-chirho/snapshot_chirho.ts",
            str(snapshot_chirho),
            book_chirho["id_chirho"],
        ],
        cwd=ROOT_CHIRHO,
        check=True,
        capture_output=True,
    )
    source_chirho = package_chirho(home_chirho, entry_chirho)
    rows_by_chapter_chirho = timings_chirho(
        (home_chirho / "source-chirho/timings-chirho.bin").read_bytes(),
        int(book_chirho["gbt_file_chirho"][:2]),
    )
    snapshot_index_chirho = json_chirho.loads(
        (snapshot_chirho / "index-chirho.json").read_text()
    )
    totals_chirho = {"prepared_chirho": 0, "held_chirho": 0, "chapters_chirho": 0}
    for entry_value_chirho in snapshot_index_chirho["chapters_chirho"]:
        chapter_chirho = entry_value_chirho["chapter_chirho"]
        if chapter_limit_chirho and chapter_chirho > chapter_limit_chirho:
            break
        if (run_chirho / "PAUSE-chirho").exists() or shutil_chirho.disk_usage(
            run_chirho
        ).free < 15 * 1024**3:
            raise RuntimeError(
                "Paused or storage floor reached; preserved outputs remain"
            )
        snapshot_bytes_chirho = (
            snapshot_chirho / entry_value_chirho["path_chirho"]
        ).read_bytes()
        if sha_chirho(snapshot_bytes_chirho) != entry_value_chirho["sha256_chirho"]:
            raise ValueError("Frozen chapter snapshot changed")
        chapter_value_chirho = json_chirho.loads(snapshot_bytes_chirho)
        values_chirho = chapter_value_chirho["verses_chirho"]
        rows_chirho = rows_by_chapter_chirho.get(chapter_chirho, [])
        folder_chirho = home_chirho / "chapters-chirho" / f"{chapter_chirho:03d}-chirho"
        folder_chirho.mkdir(parents=True, exist_ok=True)
        numbers_chirho = [
            int(value_chirho["lesson_id_chirho"].split(".")[-1])
            for value_chirho in values_chirho
        ]
        if numbers_chirho != [row_chirho["verse_chirho"] for row_chirho in rows_chirho]:
            write_json_chirho(
                folder_chirho / "hold-chirho.json",
                {
                    "reason_chirho": "source verse-number inventory differs",
                    "source_chirho": numbers_chirho,
                    "timings_chirho": [
                        row_chirho["verse_chirho"] for row_chirho in rows_chirho
                    ],
                },
            )
            totals_chirho["held_chirho"] += len(values_chirho)
            continue
        source_path_chirho = (
            home_chirho / "source-chirho" / f"chapter-{chapter_chirho:03d}-chirho.mp3"
        )
        try:
            if not source_path_chirho.is_file():
                raise ValueError(
                    "Source chapter audio is absent from the pinned package"
                )
            duration_chirho = inspect_chirho(source_path_chirho)
            pauses_value_chirho = pauses_chirho(source_path_chirho)
        except (ValueError, subprocess_chirho.CalledProcessError) as error_chirho:
            if (
                isinstance(error_chirho, subprocess_chirho.CalledProcessError)
                and error_chirho.returncode < 0
            ):
                raise  # A killed decoder is a resource stop, not evidence of bad source audio.
            write_json_chirho(
                folder_chirho / "source-audio-hold-chirho.json",
                {
                    "reason_chirho": "Pinned source chapter has no usable decoded MP3",
                    "source_sha256_chirho": source_chirho["files_chirho"].get(
                        source_path_chirho.name
                    ),
                    "chapter_chirho": chapter_chirho,
                    "error_kind_chirho": type(error_chirho).__name__,
                },
            )
            totals_chirho["held_chirho"] += len(values_chirho)
            continue
        chosen_chirho = []
        for index_chirho, verse_chirho in enumerate(values_chirho):
            record_path_chirho = folder_chirho / (
                str(numbers_chirho[index_chirho]).zfill(3) + "-chirho.json"
            )
            if record_path_chirho.exists():
                record_chirho = json_chirho.loads(record_path_chirho.read_text())
                if (
                    record_chirho["content_sha256_chirho"]
                    != chapter_value_chirho["content_sha256_chirho"]
                    or record_chirho["canonical_sha256_chirho"]
                    != verse_chirho["canonical_sha256_chirho"]
                ):
                    raise ValueError("Existing verse source binding differs")
                if (
                    sha_chirho(
                        (ROOT_CHIRHO / record_chirho["path_chirho"]).read_bytes()
                    )
                    != record_chirho["sha256_chirho"]
                ):
                    raise ValueError("Prepared recording changed")
                chosen_chirho.append(record_chirho)
                continue
            try:
                start_chirho, end_chirho = window_chirho(
                    rows_chirho, index_chirho, duration_chirho, pauses_value_chirho
                )
            except ValueError as error_chirho:
                write_json_chirho(
                    folder_chirho
                    / (
                        str(numbers_chirho[index_chirho]).zfill(3) + "-hold-chirho.json"
                    ),
                    {
                        "lesson_id_chirho": verse_chirho["lesson_id_chirho"],
                        "reason_chirho": str(error_chirho),
                    },
                )
                totals_chirho["held_chirho"] += 1
                continue
            temporary_chirho = folder_chirho / (
                str(numbers_chirho[index_chirho]).zfill(3) + "-pending-chirho.mp3"
            )
            subprocess_chirho.run(
                [
                    "ffmpeg",
                    "-v",
                    "error",
                    "-nostdin",
                    "-y",
                    "-ss",
                    str(start_chirho),
                    "-i",
                    str(source_path_chirho),
                    "-t",
                    str(end_chirho - start_chirho),
                    "-map_metadata",
                    "-1",
                    "-ac",
                    "1",
                    "-ar",
                    "44100",
                    "-c:a",
                    "libmp3lame",
                    "-b:a",
                    "64k",
                    "-write_xing",
                    "1",
                    str(temporary_chirho),
                ],
                check=True,
            )
            seconds_chirho = inspect_chirho(temporary_chirho)
            if abs(seconds_chirho - (end_chirho - start_chirho)) > 0.15:
                raise ValueError(
                    "Decoded derivative duration differs from source window"
                )
            bytes_chirho = temporary_chirho.read_bytes()
            digest_chirho = sha_chirho(bytes_chirho)
            output_chirho = folder_chirho / (digest_chirho + "-chirho.mp3")
            if output_chirho.exists() and output_chirho.read_bytes() != bytes_chirho:
                raise ValueError("Content-addressed recording differs")
            temporary_chirho.replace(output_chirho)
            record_chirho = {
                **verse_chirho,
                "content_path_chirho": chapter_value_chirho["content_path_chirho"],
                "content_sha256_chirho": chapter_value_chirho["content_sha256_chirho"],
                "path_chirho": str(output_chirho.relative_to(ROOT_CHIRHO)),
                "sha256_chirho": digest_chirho,
                "bytes_chirho": len(bytes_chirho),
                "duration_chirho": seconds_chirho,
                "source_chirho": {
                    **source_chirho,
                    "chapter_sha256_chirho": source_chirho["files_chirho"][
                        source_path_chirho.name
                    ],
                    "timings_sha256_chirho": source_chirho["files_chirho"][
                        "timings-chirho.bin"
                    ],
                    "start_chirho": start_chirho,
                    "end_chirho": end_chirho,
                    "chapter_duration_chirho": duration_chirho,
                },
                "transformation_chirho": "Verse cut; resampled to44100Hz mono64kbpsMP3 for delivery compatibility, no fidelity gain",
            }
            write_json_chirho(record_path_chirho, record_chirho)
            chosen_chirho.append(record_chirho)
        write_json_chirho(
            folder_chirho / "manifest-chirho.json",
            {
                "content_sha256_chirho": chapter_value_chirho["content_sha256_chirho"],
                "recordings_chirho": chosen_chirho,
            },
        )
        totals_chirho["prepared_chirho"] += len(chosen_chirho)
        totals_chirho["chapters_chirho"] += 1
        print(
            json_chirho.dumps(
                {
                    "book_chirho": book_chirho["id_chirho"],
                    "chapter_chirho": chapter_chirho,
                    **totals_chirho,
                }
            ),
            flush=True,
        )
    return totals_chirho


def main_chirho():
    if shutil_chirho.which("ffmpeg") is None or shutil_chirho.which("ffprobe") is None:
        raise RuntimeError("Existing ffmpeg and ffprobe toolchain is required")
    parser_chirho = argparse_chirho.ArgumentParser(description=__doc__)
    parser_chirho.add_argument("--run-chirho", required=True)
    parser_chirho.add_argument("--manifest-chirho", required=True)
    parser_chirho.add_argument("--books-chirho", nargs="+", default=["Gen", "Prov"])
    parser_chirho.add_argument("--chapter-limit-chirho", type=int)
    parser_chirho.add_argument("--apply-chirho", action="store_true")
    arguments_chirho = parser_chirho.parse_args()
    run_chirho = PathChirho(arguments_chirho.run_chirho).resolve()
    if not run_chirho.is_relative_to(ROOT_CHIRHO / "workspace-chirho/audio-chirho"):
        raise ValueError("Run must live inside the audio workspace")
    manifest_bytes_chirho = PathChirho(arguments_chirho.manifest_chirho).read_bytes()
    if sha_chirho(manifest_bytes_chirho) != MANIFEST_SHA_CHIRHO:
        raise ValueError("GBT manifest changed; reconcile source before continuing")
    entries_chirho = {
        row_chirho["id"]: row_chirho
        for row_chirho in (
            json_chirho.loads(line_chirho)
            for line_chirho in manifest_bytes_chirho.splitlines()
            if line_chirho
        )
    }
    books_chirho = json_chirho.loads(
        (ROOT_CHIRHO / "config-chirho/bible-chirho/books-chirho.json").read_text()
    )["books_chirho"]
    selected_chirho = []
    requested_chirho = arguments_chirho.books_chirho
    if requested_chirho == ["ALL"]:
        requested_chirho = [
            row_chirho["id_chirho"]
            for row_chirho in books_chirho
            if row_chirho["language_chirho"] == "he"
            and "OT/RDB/" + row_chirho["gbt_file_chirho"].split("-")[1].split(".")[0]
            in entries_chirho
        ]
    for book_id_chirho in requested_chirho:
        book_chirho = next(
            row_chirho
            for row_chirho in books_chirho
            if row_chirho["id_chirho"] == book_id_chirho
            and row_chirho["language_chirho"] == "he"
        )
        entry_chirho = entries_chirho[
            "OT/RDB/" + book_chirho["gbt_file_chirho"].split("-")[1].split(".")[0]
        ]
        selected_chirho.append((book_chirho, entry_chirho))
    if not arguments_chirho.apply_chirho:
        print(
            json_chirho.dumps(
                {
                    "books_chirho": [
                        book_chirho["id_chirho"] for book_chirho, _ in selected_chirho
                    ],
                    "package_bytes_chirho": sum(
                        entry_chirho["size"] for _, entry_chirho in selected_chirho
                    ),
                    "catalogue_writes_chirho": 0,
                    "provider_posts_chirho": 0,
                }
            )
        )
        return
    run_chirho.mkdir(parents=True, exist_ok=True)
    with (run_chirho / "prepare-chirho.lock").open("a") as lock_chirho:
        fcntl_chirho.flock(lock_chirho, fcntl_chirho.LOCK_EX | fcntl_chirho.LOCK_NB)
        results_chirho = []
        for book_chirho, entry_chirho in selected_chirho:
            result_chirho = prepare_chirho(
                run_chirho,
                book_chirho,
                entry_chirho,
                arguments_chirho.chapter_limit_chirho,
            )
            results_chirho.append(
                {"book_id_chirho": book_chirho["id_chirho"], **result_chirho}
            )
            temporary_chirho = run_chirho / "progress-next-chirho.json"
            temporary_chirho.write_text(
                json_chirho.dumps(
                    {
                        "state_chirho": "preparing",
                        "books_chirho": results_chirho,
                        "publication_chirho": "not installed",
                    },
                    indent=2,
                )
                + "\n"
            )
            temporary_chirho.replace(run_chirho / "progress-chirho.json")
        temporary_chirho = run_chirho / "progress-next-chirho.json"
        temporary_chirho.write_text(
            json_chirho.dumps(
                {
                    "state_chirho": "prepared_with_holds"
                    if any(row_chirho["held_chirho"] for row_chirho in results_chirho)
                    else "prepared",
                    "books_chirho": results_chirho,
                    "publication_chirho": "not installed",
                },
                indent=2,
            )
            + "\n"
        )
        temporary_chirho.replace(run_chirho / "progress-chirho.json")


if __name__ == "__main__":
    main_chirho()
