# For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life. — John 3:16 (KJV)
"""Workflow: README-chirho.md. Validate/derive the exact 24 received takes; no synthesis or network."""

import argparse as argparse_chirho
import importlib.util as util_chirho
import json as json_chirho
import os as os_chirho
import subprocess as subprocess_chirho
import tempfile as tempfile_chirho
from pathlib import Path as PathChirho

ROOT_CHIRHO = PathChirho(__file__).resolve().parents[3]
PHASE_HOME_CHIRHO = "build-chirho/local-greek-install-2026-11-08-retakes-chirho"
SPEC_CHIRHO = util_chirho.spec_from_file_location(
    "local_greek_prepare_chirho", PathChirho(__file__).with_name("prepare_chirho.py")
)
COMMON_CHIRHO = util_chirho.module_from_spec(SPEC_CHIRHO)
SPEC_CHIRHO.loader.exec_module(COMMON_CHIRHO)


def verify_originals_chirho(root_chirho, job_chirho):
    run_chirho = (
        root_chirho
        / "workspace-chirho/audio-chirho/local-greek-verses-2026-11-07-chirho"
    )
    take_chirho = job_chirho["chosen_chirho"]
    for name_chirho, hash_chirho, codec_chirho in [
        ("path_chirho", "sha256_chirho", "mp3"),
        ("raw_path_chirho", "raw_sha256_chirho", "flac"),
    ]:
        path_chirho = COMMON_CHIRHO.owned_chirho(
            run_chirho, take_chirho[name_chirho], 16 * 1024**2
        )
        bytes_chirho = path_chirho.read_bytes()
        if COMMON_CHIRHO.digest_chirho(bytes_chirho) != take_chirho[hash_chirho] or (
            name_chirho == "path_chirho"
            and len(bytes_chirho) != take_chirho["bytes_chirho"]
        ):
            raise ValueError("Handed-off original MP3/FLAC bytes differ")
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
        if (
            len(facts_chirho["streams"]) != 1
            or stream_chirho["codec_name"] != codec_chirho
            or int(stream_chirho["sample_rate"]) != 24000
            or stream_chirho["channels"] != 1
        ):
            raise ValueError("Original stream is not the pinned mono 24kHz format")
        result_chirho = subprocess_chirho.run(
            [
                "ffmpeg",
                "-v",
                "warning",
                "-nostdin",
                "-i",
                str(path_chirho),
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
            result_chirho.stderr
            or abs(len(result_chirho.stdout) / 48000 - take_chirho["seconds_chirho"])
            > 0.1
        ):
            raise ValueError("Original decode or decoded duration differs")
    source_chirho = COMMON_CHIRHO.owned_chirho(
        root_chirho / "static/content-chirho",
        job_chirho["content_path_chirho"],
        4 * 1024**2,
    ).read_bytes()
    if (
        COMMON_CHIRHO.digest_chirho(source_chirho)
        != job_chirho["content_sha256_chirho"]
    ):
        raise ValueError("Current canonical chapter differs")
    lesson_chirho = next(
        row_chirho
        for row_chirho in json_chirho.loads(source_chirho)["verses_chirho"]
        if row_chirho["id_chirho"] == job_chirho["verse_id_chirho"]
    )
    if (
        lesson_chirho["canonical_text_chirho"] != job_chirho["canonical_text_chirho"]
        or COMMON_CHIRHO.digest_chirho(lesson_chirho["canonical_text_chirho"].encode())
        != job_chirho["canonical_sha256_chirho"]
    ):
        raise ValueError("Current canonical verse differs")


def keep_exact_chirho(path_chirho, bytes_chirho, home_chirho):
    if not path_chirho.resolve().is_relative_to(home_chirho.resolve()) or any(
        parent_chirho.is_symlink()
        for parent_chirho in (path_chirho, *path_chirho.parents)
        if parent_chirho.is_relative_to(home_chirho)
    ):
        raise ValueError("Redirected phase output")
    if path_chirho.exists():
        if (
            path_chirho.is_symlink()
            or not path_chirho.is_file()
            or path_chirho.read_bytes() != bytes_chirho
        ):
            raise ValueError(
                "Existing phase output differs from its independent derivation"
            )
        return False
    path_chirho.parent.mkdir(parents=True, exist_ok=True)
    descriptor_chirho, temporary_chirho = tempfile_chirho.mkstemp(
        prefix=".phase-chirho-", dir=path_chirho.parent
    )
    try:
        with os_chirho.fdopen(descriptor_chirho, "wb") as file_chirho:
            file_chirho.write(bytes_chirho)
            file_chirho.flush()
            os_chirho.fsync(file_chirho.fileno())
        # An exclusive link publishes complete bytes without replacing a concurrent file.
        os_chirho.link(temporary_chirho, path_chirho)
    finally:
        PathChirho(temporary_chirho).unlink(missing_ok=True)
    return True


def main_chirho(root_chirho=ROOT_CHIRHO):
    parser_chirho = argparse_chirho.ArgumentParser(description=__doc__)
    parser_chirho.add_argument("--apply-chirho", action="store_true")
    arguments_chirho = parser_chirho.parse_args()
    environment_chirho = {
        name_chirho: os_chirho.environ[name_chirho]
        for name_chirho in (
            "PATH",
            "HOME",
            "USER",
            "LOGNAME",
            "TMPDIR",
            "LANG",
            "LC_ALL",
        )
        if name_chirho in os_chirho.environ
    }
    description_chirho = json_chirho.loads(
        subprocess_chirho.check_output(
            [
                "bun",
                "--no-env-file",
                str(PathChirho(__file__).with_name("phase_chirho.ts")),
                "--describe-chirho",
            ],
            cwd=root_chirho,
            env=environment_chirho,
        )
    )
    jobs_chirho = description_chirho["jobs_chirho"]
    for job_chirho in jobs_chirho:
        verify_originals_chirho(root_chirho, job_chirho)
    summary_chirho = {
        "eligible_chirho": len(jobs_chirho),
        "seed_2_chirho": sum(
            row_chirho["chosen_chirho"]["seed_chirho"] == 2
            for row_chirho in jobs_chirho
        ),
        "seed_1_chirho": sum(
            row_chirho["chosen_chirho"]["seed_chirho"] == 1
            for row_chirho in jobs_chirho
        ),
        "apply_chirho": arguments_chirho.apply_chirho,
    }
    if not arguments_chirho.apply_chirho:
        print(json_chirho.dumps(summary_chirho))
        return
    home_chirho = root_chirho / PHASE_HOME_CHIRHO
    lock_path_chirho = home_chirho / "prepare-lock-chirho"
    with lock_path_chirho.open("x") as lock_chirho:
        lock_chirho.write(str(os_chirho.getpid()) + "\n")
    try:
        COMMON_CHIRHO.ROOT_CHIRHO = root_chirho
        COMMON_CHIRHO.RUN_CHIRHO = (
            root_chirho
            / "workspace-chirho/audio-chirho/local-greek-verses-2026-11-07-chirho"
        )
        # Always derive into a new local scratch, including on replay. An existing delivery file
        # must match independently derived bytes, not merely a plausible MP3 header/duration.
        with tempfile_chirho.TemporaryDirectory(
            prefix="independent-chirho-", dir=home_chirho
        ) as temporary_chirho:
            COMMON_CHIRHO.OUTPUT_CHIRHO = PathChirho(temporary_chirho)
            (COMMON_CHIRHO.OUTPUT_CHIRHO / "delivery-chirho").mkdir()
            deliveries_chirho = []
            for job_chirho in jobs_chirho:
                delivery_chirho = COMMON_CHIRHO.derive_chirho(job_chirho)
                temporary_path_chirho = root_chirho / delivery_chirho["path_chirho"]
                target_chirho = (
                    home_chirho
                    / "delivery-chirho"
                    / (job_chirho["job_chirho"] + "-chirho.mp3")
                )
                keep_exact_chirho(
                    target_chirho, temporary_path_chirho.read_bytes(), home_chirho
                )
                delivery_chirho["path_chirho"] = str(
                    target_chirho.relative_to(root_chirho)
                )
                deliveries_chirho.append(delivery_chirho)
            text_chirho = (
                json_chirho.dumps(
                    {
                        "manifest_sha256_chirho": description_chirho[
                            "manifest_sha256_chirho"
                        ],
                        "recordings_chirho": deliveries_chirho,
                    },
                    indent=2,
                )
                + "\n"
            )
            keep_exact_chirho(
                home_chirho / "prepared-chirho.json", text_chirho.encode(), home_chirho
            )
        summary_chirho["delivery_bytes_chirho"] = sum(
            row_chirho["bytes_chirho"] for row_chirho in deliveries_chirho
        )
        summary_chirho["independently_rederived_chirho"] = len(deliveries_chirho)
        print(json_chirho.dumps(summary_chirho))
    finally:
        lock_path_chirho.unlink(missing_ok=True)


if __name__ == "__main__":
    main_chirho()
