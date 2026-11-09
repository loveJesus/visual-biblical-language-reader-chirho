# For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life. — John 3:16 (KJV)
"""Workflow: README-chirho.md. Reuse the source decoder and delivery encoder for an explicit finite snapshot."""

import argparse as argparse_chirho
import importlib.util as util_chirho
import json as json_chirho
import os as os_chirho
import subprocess as subprocess_chirho
import sys as sys_chirho
import tempfile as tempfile_chirho
from concurrent.futures import ThreadPoolExecutor as ThreadPoolExecutorChirho
from pathlib import Path as PathChirho

SPEC_CHIRHO = util_chirho.spec_from_file_location(
    "phase_prepare_chirho", PathChirho(__file__).with_name("prepare_phase_chirho.py")
)
PHASE_CHIRHO = util_chirho.module_from_spec(SPEC_CHIRHO)
SPEC_CHIRHO.loader.exec_module(PHASE_CHIRHO)
COMMON_CHIRHO = PHASE_CHIRHO.COMMON_CHIRHO


def describe_chirho(
    root_chirho, handoff_chirho, digest_chirho, home_chirho, parts_chirho=False
):
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
    script_chirho = "handoff_parts_chirho.ts" if parts_chirho else "handoff_chirho.ts"
    mode_chirho = "--describe-parts-chirho" if parts_chirho else "--describe-chirho"
    return json_chirho.loads(
        subprocess_chirho.check_output(
            [
                "bun",
                "--no-env-file",
                str(PathChirho(__file__).with_name(script_chirho)),
                mode_chirho,
                "--root-chirho",
                str(root_chirho),
                "--handoff-chirho",
                handoff_chirho,
                "--handoff-sha256-chirho",
                digest_chirho,
                "--prepared-home-chirho",
                home_chirho,
            ],
            cwd=root_chirho,
            env=environment_chirho,
        )
    )


def prepare_handoff_chirho(
    root_chirho, handoff_chirho, digest_chirho, home_name_chirho, apply_chirho
):
    description_chirho = describe_chirho(
        root_chirho, handoff_chirho, digest_chirho, home_name_chirho
    )
    jobs_chirho = description_chirho["jobs_chirho"]

    # Full decoding is shared with the older importer, including the sample-count-less night-1 originals.
    def verify_chirho(job_chirho):
        PHASE_CHIRHO.verify_originals_chirho(root_chirho, job_chirho)

    with ThreadPoolExecutorChirho(max_workers=2) as workers_chirho:
        for count_chirho, _unused_chirho in enumerate(
            workers_chirho.map(verify_chirho, jobs_chirho), 1
        ):
            if count_chirho % 50 == 0 or count_chirho == len(jobs_chirho):
                print(
                    f"Verified originals {count_chirho}/{len(jobs_chirho)}",
                    file=sys_chirho.stderr,
                    flush=True,
                )
    summary_chirho = {
        "eligible_chirho": len(jobs_chirho),
        "manifest_sha256_chirho": description_chirho["manifest_sha256_chirho"],
        "apply_chirho": apply_chirho,
    }
    if not apply_chirho:
        return summary_chirho
    home_chirho = root_chirho / home_name_chirho
    if home_chirho.resolve() != home_chirho or not home_chirho.is_relative_to(
        root_chirho / "build-chirho"
    ):
        raise ValueError("Redirected handoff preparation home")
    home_chirho.mkdir(parents=True, exist_ok=True)
    lock_path_chirho = home_chirho / "prepare-lock-chirho"
    with lock_path_chirho.open("x") as lock_chirho:
        lock_chirho.write(str(os_chirho.getpid()) + "\n")
    try:
        COMMON_CHIRHO.ROOT_CHIRHO = root_chirho
        COMMON_CHIRHO.RUN_CHIRHO = root_chirho / description_chirho["run_home_chirho"]
        # Re-derive even on replay. A plausible existing MP3 cannot substitute for the pinned FLAC.
        with tempfile_chirho.TemporaryDirectory(
            prefix="independent-chirho-", dir=home_chirho
        ) as scratch_chirho:
            COMMON_CHIRHO.OUTPUT_CHIRHO = PathChirho(scratch_chirho)
            (COMMON_CHIRHO.OUTPUT_CHIRHO / "delivery-chirho").mkdir()

            def derive_chirho(job_chirho):
                row_chirho = COMMON_CHIRHO.derive_chirho(job_chirho)
                original_chirho = root_chirho / row_chirho["path_chirho"]
                target_chirho = (
                    home_chirho
                    / "delivery-chirho"
                    / (job_chirho["job_chirho"] + "-chirho.mp3")
                )
                PHASE_CHIRHO.keep_exact_chirho(
                    target_chirho, original_chirho.read_bytes(), home_chirho
                )
                row_chirho["path_chirho"] = str(target_chirho.relative_to(root_chirho))
                return row_chirho

            deliveries_chirho = []
            with ThreadPoolExecutorChirho(max_workers=2) as workers_chirho:
                for count_chirho, row_chirho in enumerate(
                    workers_chirho.map(derive_chirho, jobs_chirho), 1
                ):
                    deliveries_chirho.append(row_chirho)
                    if count_chirho % 50 == 0 or count_chirho == len(jobs_chirho):
                        print(
                            f"Derived delivery {count_chirho}/{len(jobs_chirho)}",
                            file=sys_chirho.stderr,
                            flush=True,
                        )
            manifest_bytes_chirho = description_chirho["manifest_json_chirho"].encode()
            if (
                COMMON_CHIRHO.digest_chirho(manifest_bytes_chirho)
                != description_chirho["manifest_sha256_chirho"]
            ):
                raise ValueError("Derived manifest bytes differ")
            PHASE_CHIRHO.keep_exact_chirho(
                home_chirho / "source-chirho/manifest-chirho.json",
                manifest_bytes_chirho,
                home_chirho,
            )
            prepared_chirho = {
                "manifest_sha256_chirho": description_chirho["manifest_sha256_chirho"],
                "recordings_chirho": deliveries_chirho,
            }
            PHASE_CHIRHO.keep_exact_chirho(
                home_chirho / "prepared-chirho.json",
                (json_chirho.dumps(prepared_chirho, indent=2) + "\n").encode(),
                home_chirho,
            )
        parts_chirho = describe_chirho(
            root_chirho, handoff_chirho, digest_chirho, home_name_chirho, True
        )
        for part_chirho in parts_chirho:
            path_chirho = (
                root_chirho
                / part_chirho["prepared_home_chirho"]
                / "prepared-chirho.json"
            )
            PHASE_CHIRHO.keep_exact_chirho(
                path_chirho,
                (
                    json_chirho.dumps(part_chirho["prepared_chirho"], indent=2) + "\n"
                ).encode(),
                home_chirho,
            )
        summary_chirho["parts_chirho"] = len(parts_chirho)
        summary_chirho["independently_rederived_chirho"] = len(deliveries_chirho)
        summary_chirho["delivery_bytes_chirho"] = sum(
            row_chirho["bytes_chirho"] for row_chirho in deliveries_chirho
        )
        return summary_chirho
    finally:
        lock_path_chirho.unlink(missing_ok=True)


def main_chirho():
    parser_chirho = argparse_chirho.ArgumentParser(description=__doc__)
    parser_chirho.add_argument(
        "--root-chirho", default=str(PathChirho(__file__).resolve().parents[3])
    )
    parser_chirho.add_argument("--handoff-chirho", required=True)
    parser_chirho.add_argument("--handoff-sha256-chirho", required=True)
    parser_chirho.add_argument("--prepared-home-chirho", required=True)
    parser_chirho.add_argument("--apply-chirho", action="store_true")
    arguments_chirho = parser_chirho.parse_args()
    print(
        json_chirho.dumps(
            prepare_handoff_chirho(
                PathChirho(arguments_chirho.root_chirho).resolve(),
                arguments_chirho.handoff_chirho,
                arguments_chirho.handoff_sha256_chirho,
                arguments_chirho.prepared_home_chirho,
                arguments_chirho.apply_chirho,
            )
        )
    )


if __name__ == "__main__":
    main_chirho()
