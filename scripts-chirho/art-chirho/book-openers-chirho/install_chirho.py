#!/usr/bin/env python3
# For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life. — John 3:16 (KJV)
"""Install inspected provider originals through the existing verified artwork path.

Workflow: book-openers-chirho.md. The drained background producer's lock is required.
"""

import argparse as argparse_chirho
import fcntl as fcntl_chirho
import importlib as importlib_chirho
import json as json_chirho
import os as os_chirho
import sys as sys_chirho
from pathlib import Path as PathChirho

from PIL import Image as ImageChirho

sys_chirho.path.insert(0, str(PathChirho(__file__).parent))
import run_chirho as provider_chirho

runner_chirho = importlib_chirho.import_module("scene_upgrades_chirho")
sources_chirho = provider_chirho.sources_chirho
ROOT_CHIRHO = provider_chirho.ROOT_CHIRHO
HOME_CHIRHO = provider_chirho.HOME_CHIRHO


def prepare_chirho(root_chirho):
    home_chirho = root_chirho / HOME_CHIRHO
    plan_chirho = sources_chirho.read_chirho(home_chirho / "plan-chirho.json")
    reviews_chirho = sources_chirho.read_chirho(
        home_chirho / "visual-review-chirho.json"
    )
    plan_sha_chirho = sources_chirho.sha_chirho(
        (home_chirho / "plan-chirho.json").read_bytes()
    )
    if (
        len(plan_chirho["jobs_chirho"]) != 124
        or len(plan_chirho["retained_chirho"]) != 8
    ):
        raise ValueError(
            "Opening source cut differs from the 124 new / eight retained plan"
        )
    rows_chirho = []
    for job_chirho in plan_chirho["jobs_chirho"]:
        provider_chirho.source_chirho(root_chirho, job_chirho)
        attempt_chirho = (
            home_chirho
            / "attempts-chirho"
            / (job_chirho["id_chirho"].lower().replace(".", "-") + "-chirho")
        )
        request_chirho = sources_chirho.read_chirho(
            attempt_chirho / "request-chirho.json"
        )
        result_chirho = sources_chirho.read_chirho(
            attempt_chirho / "result-chirho.json"
        )
        response_chirho = sources_chirho.read_chirho(
            attempt_chirho / "response-chirho.json"
        )
        expected_chirho = provider_chirho.task_chirho(
            plan_chirho, job_chirho, request_chirho["task_chirho"]["taskUUID"]
        )
        actual_chirho = provider_chirho.choose_result_chirho(
            response_chirho["body_chirho"], expected_chirho["taskUUID"]
        )
        if actual_chirho is None:
            candidates_chirho = [
                provider_chirho.choose_result_chirho(
                    row_chirho.get("response", {}), expected_chirho["taskUUID"]
                )
                for path_chirho in attempt_chirho.glob("details-*-chirho.json")
                for row_chirho in sources_chirho.read_chirho(path_chirho)[
                    "body_chirho"
                ].get("data", [])
            ]
            actual_chirho = next(
                (row_chirho for row_chirho in candidates_chirho if row_chirho), None
            )
        if (
            request_chirho["plan_sha256_chirho"] != plan_sha_chirho
            or request_chirho["task_chirho"] != expected_chirho
            or actual_chirho != result_chirho["provider_result_chirho"]
            or result_chirho["task_uuid_chirho"] != expected_chirho["taskUUID"]
            or result_chirho["cost_usd_chirho"] != actual_chirho.get("cost")
        ):
            raise ValueError("Provider task, source plan or raw result differs")
        review_chirho = reviews_chirho[job_chirho["id_chirho"]]
        if (
            review_chirho["original_sha256_chirho"]
            != result_chirho["original_sha256_chirho"]
            or review_chirho["visually_checked_chirho"] is not True
        ):
            raise ValueError(
                "Actual artwork has not been inspected at this exact original hash"
            )
        for key_chirho, maximum_chirho in (
            ("alt_chirho", 500),
            ("reading_note_chirho", 600),
        ):
            text_chirho = review_chirho[key_chirho]
            if (
                not isinstance(text_chirho, str)
                or not 1 <= len(text_chirho) <= maximum_chirho
                or any(
                    part_chirho in text_chirho
                    for part_chirho in ("/Users/", "file:", "/private/")
                )
            ):
                raise ValueError("Scene description is invalid")
        original_chirho = attempt_chirho / "original-chirho.png"
        if (
            sources_chirho.sha_chirho(original_chirho.read_bytes())
            != result_chirho["original_sha256_chirho"]
        ):
            raise ValueError("Original raster differs from its provider receipt")
        source_chirho = attempt_chirho / "scene-chirho.webp"
        with ImageChirho.open(original_chirho) as image_chirho:
            image_chirho.load()
            if image_chirho.format != "PNG" or image_chirho.size != (1536, 1152):
                raise ValueError("Provider image dimensions or format differs")
            image_chirho.convert("RGB").save(
                source_chirho, format="WEBP", lossless=True, method=6
            )
        record_chirho = {
            "lesson_id_chirho": job_chirho["id_chirho"],
            "asset_path_chirho": runner_chirho.asset_path_chirho(job_chirho),
            "alt_chirho": review_chirho["alt_chirho"],
            "reading_note_chirho": review_chirho["reading_note_chirho"],
            "width_chirho": 1536,
            "height_chirho": 1152,
            "sha256_chirho": sources_chirho.sha_chirho(source_chirho.read_bytes()),
            "art_review_chirho": "pending",
            "tool_chirho": "runware",
            "model_chirho": plan_chirho["model_chirho"],
            "source_binding_chirho": {
                key_chirho: job_chirho[key_chirho]
                for key_chirho in (
                    "content_path_chirho",
                    "content_sha256_chirho",
                    "canonical_sha256_chirho",
                    "prompt_sha256_chirho",
                )
            },
        }
        if len(json_chirho.dumps(record_chirho, ensure_ascii=False).encode()) > 2000:
            raise ValueError("Opening catalogue record exceeds the shared bound")
        sources_chirho.write_chirho(
            attempt_chirho / "prepared-record-chirho.json", record_chirho
        )
        rows_chirho.append((job_chirho, attempt_chirho, record_chirho))
    return rows_chirho


def command_chirho(root_chirho, arguments_chirho, name_chirho):
    runner_chirho.command_chirho(
        root_chirho,
        arguments_chirho,
        root_chirho / HOME_CHIRHO / (name_chirho + "-log-chirho.txt"),
        timeout_chirho=3600,
    )


def adopt_chirho(root_chirho, rows_chirho):
    """Only R2-verified provider records become ordinary background completion checkpoints."""
    catalogue_chirho = {
        row_chirho["lesson_id_chirho"]: row_chirho
        for row_chirho in runner_chirho.catalogue_chirho(root_chirho)["scenes_chirho"]
    }
    for job_chirho, attempt_chirho, record_chirho in rows_chirho:
        if catalogue_chirho.get(job_chirho["id_chirho"]) != record_chirho:
            raise ValueError(
                "Verified provider adoption differs from the primary catalogue"
            )
        provider_chirho.source_chirho(root_chirho, job_chirho)
        runner_chirho.BASE_CHIRHO.remote_record_chirho(root_chirho, record_chirho)
        checkpoint_path_chirho = (
            root_chirho
            / sources_chirho.HOME_CHIRHO
            / "books-chirho"
            / job_chirho["slug_chirho"]
            / "chapter-001-chirho/installed-scenes-chirho.json"
        )
        checkpoint_chirho = (
            sources_chirho.read_chirho(checkpoint_path_chirho)
            if checkpoint_path_chirho.exists()
            else {
                "schema_version_chirho": 1,
                "book_id_chirho": job_chirho["book_id_chirho"],
                "scenes_chirho": [],
            }
        )
        prior_chirho = [
            row_chirho
            for row_chirho in checkpoint_chirho["scenes_chirho"]
            if row_chirho["lesson_id_chirho"] == job_chirho["id_chirho"]
        ]
        if prior_chirho and prior_chirho != [record_chirho]:
            raise ValueError("Existing completion identity cannot be replaced")
        if not prior_chirho:
            checkpoint_chirho["scenes_chirho"].append(record_chirho)
            sources_chirho.write_chirho(checkpoint_path_chirho, checkpoint_chirho)
        sources_chirho.write_chirho(
            attempt_chirho / "adopted-chirho.json",
            {
                "source_chirho": "source-bound Runware book-opening task; not an internal image-tool request",
                "record_chirho": record_chirho,
            },
        )


def install_chirho(root_chirho, rows_chirho):
    bun_chirho = PathChirho.home() / ".bun/bin/bun"
    home_chirho = root_chirho / HOME_CHIRHO
    document_chirho = runner_chirho.catalogue_chirho(root_chirho)
    by_id_chirho = {
        row_chirho["lesson_id_chirho"]: row_chirho
        for row_chirho in document_chirho["scenes_chirho"]
    }
    for job_chirho, _attempt_chirho, record_chirho in rows_chirho:
        if (
            job_chirho["id_chirho"] in by_id_chirho
            and by_id_chirho[job_chirho["id_chirho"]] != record_chirho
        ):
            raise ValueError("Existing high-quality primary cannot be overwritten")
    # Preserve exact provider PNGs and prepared lossless WebPs before changing the catalogue.
    command_chirho(
        root_chirho,
        [
            bun_chirho,
            "scripts-chirho/publish-chirho/r2-chirho/retire-artwork-chirho.ts",
            "--archive-chirho",
            f"--scope-chirho={home_chirho}",
        ],
        "original-archive-chirho",
    )
    for job_chirho, attempt_chirho, record_chirho in rows_chirho:
        destination_chirho = (
            root_chirho / "static" / record_chirho["asset_path_chirho"].lstrip("/")
        )
        destination_chirho.parent.mkdir(parents=True, exist_ok=True)
        if destination_chirho.exists():
            if (
                sources_chirho.sha_chirho(destination_chirho.read_bytes())
                != record_chirho["sha256_chirho"]
            ):
                raise ValueError("Opening static asset cannot overwrite changed bytes")
        else:
            os_chirho.link(attempt_chirho / "scene-chirho.webp", destination_chirho)
        if job_chirho["id_chirho"] not in by_id_chirho:
            document_chirho["scenes_chirho"].append(record_chirho)
    sources_chirho.write_chirho(
        root_chirho / sources_chirho.CATALOGUE_CHIRHO, document_chirho
    )
    command_chirho(
        root_chirho,
        [
            sys_chirho.executable,
            "-I",
            "-B",
            "scripts-chirho/art-chirho/prepare_delivery_media_chirho.py",
        ],
        "delivery-chirho",
    )
    command_chirho(
        root_chirho,
        [
            bun_chirho,
            "scripts-chirho/publish-chirho/r2-chirho/archive-artwork-chirho.ts",
            "--verify-remote-chirho",
        ],
        "delivery-archive-chirho",
    )
    command_chirho(
        root_chirho,
        [
            sys_chirho.executable,
            "-I",
            "-B",
            "scripts-chirho/art-chirho/refresh_sharded_media_chirho.py",
            "--once",
        ],
        "shards-chirho",
    )
    adopt_chirho(root_chirho, rows_chirho)
    sources_chirho.write_chirho(
        home_chirho / "installed-scenes-chirho.json",
        {
            "schema_version_chirho": 1,
            "scenes_chirho": [row_chirho[2] for row_chirho in rows_chirho],
        },
    )


def main_chirho():
    parser_chirho = argparse_chirho.ArgumentParser(description=__doc__)
    parser_chirho.add_argument("--apply-chirho", action="store_true")
    arguments_chirho = parser_chirho.parse_args()
    with (ROOT_CHIRHO / sources_chirho.HOME_CHIRHO / "worker-chirho.lock").open(
        "a"
    ) as lock_chirho:
        fcntl_chirho.flock(lock_chirho, fcntl_chirho.LOCK_EX | fcntl_chirho.LOCK_NB)
        rows_chirho = prepare_chirho(ROOT_CHIRHO)
        if arguments_chirho.apply_chirho:
            install_chirho(ROOT_CHIRHO, rows_chirho)
        print(
            json_chirho.dumps(
                {
                    "prepared_chirho": len(rows_chirho),
                    "installed_chirho": arguments_chirho.apply_chirho,
                }
            )
        )


if __name__ == "__main__":
    main_chirho()
