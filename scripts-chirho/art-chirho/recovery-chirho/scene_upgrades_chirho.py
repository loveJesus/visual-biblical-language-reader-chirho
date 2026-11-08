#!/usr/bin/env python3
# For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life. — John 3:16 (KJV)
"""Built-in scene upgrades. Workflow: scene-upgrades-chirho.md; one catalogue installer."""

import argparse as argparse_chirho
import fcntl as fcntl_chirho
import hashlib as hashlib_chirho
import importlib as importlib_chirho
import json as json_chirho
import os as os_chirho
import re as re_chirho
import signal as signal_chirho
import subprocess as subprocess_chirho
import sys as sys_chirho
import threading as threading_chirho
from datetime import UTC as UTC_CHIRHO
from datetime import datetime as DatetimeChirho
from pathlib import Path as PathChirho

from PIL import Image as ImageChirho

ROOT_CHIRHO = PathChirho(__file__).resolve().parents[3]
sys_chirho.path[:0] = [
    str(PathChirho(__file__).parent),
    str(ROOT_CHIRHO / "scripts-chirho/art-chirho"),
    str(ROOT_CHIRHO / "scripts-chirho/bible-chirho"),
    str(ROOT_CHIRHO / "scripts-chirho/bible-chirho/icon_pipeline_chirho"),
    str(ROOT_CHIRHO / "scripts-chirho/art-chirho/continuity-chirho"),
]
ordered_chirho = importlib_chirho.import_module("ordered_scenes_chirho")
sources_chirho = importlib_chirho.import_module("scene_upgrade_sources_chirho")
GeneratorJobChirho = importlib_chirho.import_module(
    "icon_generation_chirho"
).GeneratorJobChirho
process_chirho = importlib_chirho.import_module("process_chirho")
chapter_openings_chirho = importlib_chirho.import_module("chapter_openings_chirho")
reference_pack_chirho = importlib_chirho.import_module("reference_pack_chirho")
MODEL_CHIRHO = process_chirho.MODEL_CHIRHO
image_calls_chirho = process_chirho.image_calls_chirho
returned_original_chirho = process_chirho.returned_original_chirho

BASE_CHIRHO = ordered_chirho.BASE_CHIRHO
RECOVERY_CHIRHO = ordered_chirho.RECOVERY_CHIRHO
POOL_CHIRHO = ordered_chirho.POOL_CHIRHO
MASTER_HOME_CHIRHO = sources_chirho.HOME_CHIRHO
HOME_CHIRHO = MASTER_HOME_CHIRHO
INVENTORY_CHIRHO = None
STOP_CHIRHO = False
TOTAL_DONE_CHIRHO = 0
CURRENT_CHAPTER_CHIRHO = None
DISPATCHED_CHIRHO = 0
REQUEST_LIMIT_CHIRHO = 0
DISPATCH_LOCK_CHIRHO = threading_chirho.Lock()
STYLE_LOCK_CHIRHO = threading_chirho.Lock()
POOL_CHIRHO.MINIMUM_FREE_BYTES_CHIRHO = 15 * 1024**3


def catalogue_chirho(root_chirho):
    path_chirho = root_chirho / sources_chirho.CATALOGUE_CHIRHO
    value_chirho = (
        sources_chirho.read_chirho(path_chirho)
        if path_chirho.exists()
        else {"schema_version_chirho": 1, "scenes_chirho": []}
    )
    rows_chirho = value_chirho["scenes_chirho"]
    if (
        value_chirho["schema_version_chirho"] != 1
        or len(rows_chirho) > sources_chirho.MAX_SCENES_CHIRHO
        or len({row_chirho["lesson_id_chirho"] for row_chirho in rows_chirho})
        != len(rows_chirho)
    ):
        raise ValueError("High-quality scene catalogue scope differs")
    return value_chirho


def verified_completed_chirho(root_chirho):
    records_chirho = {
        row_chirho["lesson_id_chirho"]: row_chirho
        for row_chirho in catalogue_chirho(root_chirho)["scenes_chirho"]
    }
    seen_chirho = set()
    for path_chirho in (root_chirho / MASTER_HOME_CHIRHO / "books-chirho").glob(
        "*-chirho/chapter-*-chirho/installed-scenes-chirho.json"
    ):
        for row_chirho in sources_chirho.read_chirho(path_chirho)["scenes_chirho"]:
            id_chirho = row_chirho["lesson_id_chirho"]
            if id_chirho in seen_chirho or records_chirho.get(id_chirho) != row_chirho:
                raise ValueError("Verified scene checkpoint differs from its catalogue")
            BASE_CHIRHO.remote_record_chirho(root_chirho, row_chirho)
            seen_chirho.add(id_chirho)
    return len(seen_chirho)


def status_chirho(root_chirho, state_chirho, **extra_chirho):
    book_done_chirho = extra_chirho.pop("completed_chirho", 0)
    book_total_chirho = extra_chirho.pop("total_chirho", 0)
    sources_chirho.write_chirho(
        root_chirho / MASTER_HOME_CHIRHO / "progress-chirho.json",
        {
            "at_chirho": DatetimeChirho.now(UTC_CHIRHO).isoformat(),
            "state_chirho": state_chirho,
            "completed_chirho": TOTAL_DONE_CHIRHO,
            "total_chirho": INVENTORY_CHIRHO["total_chirho"],
            "chapter_chirho": CURRENT_CHAPTER_CHIRHO,
            "chapter_completed_chirho": book_done_chirho,
            "chapter_total_chirho": book_total_chirho,
            "priority_chirho": [
                row_chirho["id_chirho"]
                for row_chirho in INVENTORY_CHIRHO["books_chirho"]
            ],
            **extra_chirho,
        },
    )


def manifest_path_chirho(root_chirho, _book_chirho):
    return root_chirho / HOME_CHIRHO / "installed-scenes-chirho.json"


def asset_path_chirho(job_chirho):
    book_chirho = job_chirho["id_chirho"].split(".")[0].lower()
    return f"/assets-chirho/scenes-chirho/high-quality-v1-chirho/{job_chirho['slug_chirho']}/chapter-{job_chirho['chapter_chirho']:03d}-chirho/{book_chirho}-{job_chirho['chapter_chirho']:03d}-{job_chirho['verse_chirho']:03d}-chirho.webp"


def verify_chirho(root_chirho, job_chirho, record_chirho):
    if (
        record_chirho["lesson_id_chirho"] != job_chirho["id_chirho"]
        or record_chirho["asset_path_chirho"] != asset_path_chirho(job_chirho)
        or record_chirho["source_binding_chirho"]["canonical_sha256_chirho"]
        != job_chirho["canonical_sha256_chirho"]
        or record_chirho["source_binding_chirho"]["content_sha256_chirho"]
        != job_chirho["content_sha256_chirho"]
    ):
        raise ValueError("High-quality scene source identity differs")
    source_chirho = (
        root_chirho / "static" / record_chirho["asset_path_chirho"].lstrip("/")
    )
    if source_chirho.exists():
        if sources_chirho.sha_chirho(source_chirho.read_bytes()) != record_chirho[
            "sha256_chirho"
        ] or BASE_CHIRHO.image_info_chirho(source_chirho) != (
            record_chirho["width_chirho"],
            record_chirho["height_chirho"],
        ):
            raise ValueError("Installed scene bytes differ")
    else:
        BASE_CHIRHO.remote_record_chirho(root_chirho, record_chirho)


def command_chirho(root_chirho, arguments_chirho, log_chirho, timeout_chirho=1200):
    digest_chirho = hashlib_chirho.sha256()
    bytes_chirho, tail_chirho = 0, bytearray()
    process_result_chirho = subprocess_chirho.Popen(
        ["rtk", "proxy", *map(str, arguments_chirho)],
        cwd=root_chirho,
        stdin=subprocess_chirho.DEVNULL,
        stdout=subprocess_chirho.PIPE,
        stderr=subprocess_chirho.STDOUT,
        start_new_session=True,
    )

    def collect_output_chirho():
        nonlocal bytes_chirho
        with process_result_chirho.stdout as stream_chirho:
            while chunk_chirho := stream_chirho.read(65536):
                digest_chirho.update(chunk_chirho)
                bytes_chirho += len(chunk_chirho)
                tail_chirho.extend(chunk_chirho)
                del tail_chirho[:-65536]

    reader_chirho = threading_chirho.Thread(target=collect_output_chirho)
    reader_chirho.start()
    timed_out_chirho = False
    try:
        process_result_chirho.wait(timeout=timeout_chirho)
    except subprocess_chirho.TimeoutExpired:
        timed_out_chirho = True
        os_chirho.killpg(process_result_chirho.pid, signal_chirho.SIGKILL)
        process_result_chirho.wait()
    finally:
        reader_chirho.join()
    with log_chirho.open("ab") as stream_chirho:
        stream_chirho.write(tail_chirho)
    sources_chirho.write_chirho(
        log_chirho.with_name(log_chirho.name + ".receipt-chirho.json"),
        {
            "output_bytes_chirho": bytes_chirho,
            "output_sha256_chirho": digest_chirho.hexdigest(),
            "retained_tail_bytes_chirho": len(tail_chirho),
            "exit_status_chirho": process_result_chirho.returncode,
            "timed_out_chirho": timed_out_chirho,
        },
    )
    if timed_out_chirho or process_result_chirho.returncode:
        raise OSError(
            69,
            f"Artwork stage refused ({process_result_chirho.returncode}); preserved log {log_chirho.name}",
        )


def source_input_chirho(root_chirho, job_chirho):
    path_chirho = root_chirho / "static" / job_chirho["content_path_chirho"].lstrip("/")
    chapter_chirho = sources_chirho.read_chirho(
        path_chirho, sources_chirho.MAX_CHAPTER_CHIRHO
    )
    if (
        sources_chirho.sha_chirho(path_chirho.read_bytes())
        != job_chirho["content_sha256_chirho"]
    ):
        raise POOL_CHIRHO.SourceChangedChirho(
            "Source chapter changed before image dispatch"
        )
    verse_chirho = next(
        row_chirho
        for row_chirho in chapter_chirho["verses_chirho"]
        if row_chirho["id_chirho"] == job_chirho["id_chirho"]
    )
    if (
        verse_chirho["canonical_text_chirho"] != job_chirho["canonical_text_chirho"]
        or sources_chirho.sha_chirho(verse_chirho["canonical_text_chirho"].encode())
        != job_chirho["canonical_sha256_chirho"]
    ):
        raise POOL_CHIRHO.SourceChangedChirho(
            "Canonical verse changed before image dispatch"
        )
    brief_path_chirho = (
        root_chirho
        / "workspace-chirho/art-chirho/briefs-chirho"
        / job_chirho["slug_chirho"]
        / f"chapter-{job_chirho['chapter_chirho']:03d}-chirho"
        / f"verse-{job_chirho['verse_chirho']:03d}-chirho.json"
    )
    brief_chirho = (
        sources_chirho.read_chirho(brief_path_chirho)
        if brief_path_chirho.exists()
        else None
    )
    if brief_chirho and (
        brief_chirho["lesson_id_chirho"] != job_chirho["id_chirho"]
        or brief_chirho["canonical_sha256_chirho"]
        != job_chirho["canonical_sha256_chirho"]
    ):
        raise POOL_CHIRHO.SourceChangedChirho("Reusable verse explanation differs")
    return {
        "job_chirho": job_chirho,
        "verse_chirho": verse_chirho,
        "reusable_brief_chirho": brief_chirho,
    }, brief_path_chirho


def prompt_chirho(job_chirho, attempt_chirho):
    return f"""You are the bounded Hinneh high-quality scene artist for {job_chirho["reference_chirho"]}. Work only inside {attempt_chirho}. Read source-input-chirho.json there: it contains the exact canonical source, token meanings with their actual attribution and any previously saved explanation. Do not read .env, credentials, other queues, full chapters or project history. Use the imagegen skill. Use exactly ONE built-in image_gen.imagegen call for this attempt, no paid API, Runware, alternate provider or retry of a refusal/unknown result. Other project AGENTS naming and John3:16 source-comment conventions apply.

First inspect {attempt_chirho / "style-reference-chirho.webp"} with view_image as a STYLE REFERENCE ONLY. Generate one beautiful, reverent, detailed hand-painted watercolor storybook scene grounded in this verse, with warm colors, fine drawn contours and textured paper. The Scripture is the treasure: balance sober reverence with delight in the Lord. Landscape 4:3, loose central composition with room for a centered 4:3 crop. No text, lettering, panels, border or watermark. Use the source meanings honestly; a genealogy or abstract teaching may use a clearly imaginative object/setting composition rather than inventing an event. Prefer faithful indirect compositions that keep Jesus out of direct view; a hand may appear where relevant. Do not replace Him with an unrelated dove or misleading symbol. Never portray God as a human figure. Keep all people modestly presented; use restrained, indirect compositions for sexual matters, nudity, childbirth and violence rather than graphic acts. Do not change or soften what the verse says; explain the selected visual relationship honestly.

If source-input-chirho.json contains visual_continuity_chirho, read its reading unit, active roles and episode directions, inspect each staged reference image, and provide those images to image_gen as identity/setting references in addition to the style reference. Keep the selected face and age consistent. Keep clothes, buildings, props and time progression consistent within the episode; an identity portrait's neutral garment is not a permanent costume. Respect each reference's focus: copy a setting's architecture without copying unrelated people. Do not put named ancestors, quotations, absent people or described objects literally into the scene merely because they are mentioned. Standalone sayings do not inherit the preceding saying's cast or setting. All supplied portraits and architecture are imaginative conventions, not historical likeness or archaeological certainty. This does not authorize another image call or changing any earlier attempt.

Write the COMPLETE actual image prompt to prompt-chirho.txt before the one image call. After generation, inspect the actual original PNG using view_image. Leave the exact original intact for the parent's verified R2 archive. Write provenance-chirho.json with original_generator_path_chirho and original_generator_sha256_chirho. Write record-chirho.json with four nonempty strings: verse_explanation_chirho (concise, independently explain the source verse; copy reusable_brief_chirho.explanation_chirho verbatim if supplied), alt_chirho (describe only the inspected image, at most 500 characters), reading_note_chirho (explain its imaginative relationship to the verse, at most 600 characters), prompt_chirho (the actual complete prompt, matching prompt-chirho.txt). Read the JSON back to check it. The parent performs deterministic crop/encoding, archive and installation. You must not write a catalogue, source file, DB, Git, cloud configuration or message. If source is uncertain, the tool refuses or the actual image is unsuitable, write failure-chirho.json and stop without another image call. Pending human artwork review remains pending. Every shell command starts rtk proxy."""


def produce_chirho(root_chirho, _book_chirho, job_chirho, attempt_chirho):
    global DISPATCHED_CHIRHO
    with DISPATCH_LOCK_CHIRHO:
        if DISPATCHED_CHIRHO >= REQUEST_LIMIT_CHIRHO:
            raise OSError(69, "Bounded scene dispatch limit reached")
        DISPATCHED_CHIRHO += 1
    value_chirho, _brief_path_chirho = source_input_chirho(root_chirho, job_chirho)
    if (root_chirho / "data-chirho/art-direction-chirho/registry-chirho.json").exists():
        continuity_chirho = reference_pack_chirho.build_pack_chirho(
            root_chirho, job_chirho["id_chirho"]
        )
        if continuity_chirho is not None:
            if (
                continuity_chirho["canonical_sha256_chirho"]
                != job_chirho["canonical_sha256_chirho"]
            ):
                raise POOL_CHIRHO.SourceChangedChirho(
                    "Continuity source differs from image job"
                )
            value_chirho["visual_continuity_chirho"] = (
                reference_pack_chirho.stage_pack_chirho(
                    root_chirho, attempt_chirho, continuity_chirho
                )
            )
    sources_chirho.write_chirho(
        attempt_chirho / "source-input-chirho.json", value_chirho
    )
    sources_chirho.write_chirho(
        attempt_chirho / "source-pin-chirho.json",
        {
            "sha256_chirho": sources_chirho.sha_chirho(
                (attempt_chirho / "source-input-chirho.json").read_bytes()
            )
        },
    )
    style_chirho = root_chirho / "static" / BASE_CHIRHO.STYLE_CHIRHO.lstrip("/")
    with STYLE_LOCK_CHIRHO:
        command_chirho(
            root_chirho,
            [
                PathChirho.home() / ".bun/bin/bun",
                "scripts-chirho/publish-chirho/r2-chirho/with-artwork-chirho.ts",
                style_chirho,
                "--",
                "magick",
                style_chirho,
                attempt_chirho / "style-reference-chirho.webp",
            ],
            attempt_chirho / "style-log-chirho.txt",
        )
    generator_chirho = GeneratorJobChirho(
        root_chirho,
        attempt_chirho,
        prompt_chirho(job_chirho, attempt_chirho),
        RECOVERY_CHIRHO,
        model_chirho=MODEL_CHIRHO,
    )
    generator_chirho.wait_chirho()
    if generator_chirho.error_chirho:
        raise generator_chirho.error_chirho


def record_chirho(root_chirho, job_chirho, attempt_chirho):
    if (attempt_chirho / "failure-chirho.json").exists():
        raise ValueError("Artist withheld this scene; original request remains held")
    source_input_chirho(root_chirho, job_chirho)
    source_pin_chirho = sources_chirho.read_chirho(
        attempt_chirho / "source-pin-chirho.json"
    )
    if (
        sources_chirho.sha_chirho(
            (attempt_chirho / "source-input-chirho.json").read_bytes()
        )
        != source_pin_chirho["sha256_chirho"]
        or image_calls_chirho(attempt_chirho) != 1
    ):
        raise ValueError("Source excerpt or single image-call identity differs")
    frozen_input_chirho = sources_chirho.read_chirho(
        attempt_chirho / "source-input-chirho.json"
    )
    if frozen_input_chirho.get("visual_continuity_chirho") is not None:
        reference_pack_chirho.verify_staged_pack_chirho(
            attempt_chirho, frozen_input_chirho["visual_continuity_chirho"]
        )
    raw_chirho = sources_chirho.read_chirho(
        attempt_chirho / "record-chirho.json", 64 * 1024
    )
    provenance_chirho = sources_chirho.read_chirho(
        attempt_chirho / "provenance-chirho.json", 64 * 1024
    )
    original_chirho = PathChirho(provenance_chirho["original_generator_path_chirho"])
    proof_chirho = returned_original_chirho(
        attempt_chirho,
        original_chirho,
        provenance_chirho["original_generator_sha256_chirho"],
    )
    for name_chirho, maximum_chirho in [
        ("alt_chirho", 500),
        ("reading_note_chirho", 600),
        ("verse_explanation_chirho", 8000),
        ("prompt_chirho", 16000),
    ]:
        text_chirho = raw_chirho.get(name_chirho)
        if (
            not isinstance(text_chirho, str)
            or not text_chirho.strip()
            or len(text_chirho) > maximum_chirho
            or re_chirho.search(r"/Users/|file:|/private/", text_chirho)
            and name_chirho in {"alt_chirho", "reading_note_chirho"}
        ):
            raise ValueError("Generated scene text is invalid or unsafe")
    if (attempt_chirho / "prompt-chirho.txt").read_text().strip() != raw_chirho[
        "prompt_chirho"
    ].strip():
        raise ValueError("Actual image prompt differs from its saved record")
    input_chirho, brief_path_chirho = source_input_chirho(root_chirho, job_chirho)
    if input_chirho["reusable_brief_chirho"]:
        if (
            input_chirho["reusable_brief_chirho"]["explanation_chirho"]
            != raw_chirho["verse_explanation_chirho"]
        ):
            raise ValueError("Existing verse explanation changed")
    else:
        sources_chirho.write_chirho(
            brief_path_chirho,
            {
                "schema_version_chirho": 1,
                "lesson_id_chirho": job_chirho["id_chirho"],
                "canonical_sha256_chirho": job_chirho["canonical_sha256_chirho"],
                "canonical_text_chirho": job_chirho["canonical_text_chirho"],
                "explanation_chirho": raw_chirho["verse_explanation_chirho"],
                "review_chirho": "agent_draft",
            },
        )
    with ImageChirho.open(original_chirho) as image_chirho:
        image_chirho.load()
        width_chirho, height_chirho = image_chirho.size
        if (
            max(width_chirho, height_chirho) > 4096
            or min(width_chirho, height_chirho) < 512
        ):
            raise ValueError("Original scene dimensions exceed bounds")
        crop_width_chirho = min(width_chirho // 4, height_chirho // 3) * 4
        crop_height_chirho = crop_width_chirho // 4 * 3
        left_chirho, top_chirho = (
            (width_chirho - crop_width_chirho) // 2,
            (height_chirho - crop_height_chirho) // 2,
        )
        image_chirho.convert("RGB").crop(
            (
                left_chirho,
                top_chirho,
                left_chirho + crop_width_chirho,
                top_chirho + crop_height_chirho,
            )
        ).save(
            attempt_chirho / "scene-chirho.webp", format="WEBP", lossless=True, method=6
        )
    source_chirho = attempt_chirho / "scene-chirho.webp"
    result_chirho = {
        "lesson_id_chirho": job_chirho["id_chirho"],
        "asset_path_chirho": asset_path_chirho(job_chirho),
        "alt_chirho": raw_chirho["alt_chirho"],
        "reading_note_chirho": raw_chirho["reading_note_chirho"],
        "width_chirho": crop_width_chirho,
        "height_chirho": crop_height_chirho,
        "sha256_chirho": sources_chirho.sha_chirho(source_chirho.read_bytes()),
        "art_review_chirho": "pending",
        "tool_chirho": "image_gen.imagegen",
        "model_chirho": "tool-managed; not exposed",
        "style_reference_chirho": BASE_CHIRHO.STYLE_CHIRHO,
        "source_binding_chirho": {
            "content_path_chirho": job_chirho["content_path_chirho"],
            "content_sha256_chirho": job_chirho["content_sha256_chirho"],
            "canonical_sha256_chirho": job_chirho["canonical_sha256_chirho"],
            "prompt_sha256_chirho": sources_chirho.sha_chirho(
                raw_chirho["prompt_chirho"].encode()
            ),
        },
    }
    if len(json_chirho.dumps(result_chirho, ensure_ascii=False).encode()) > 2000:
        raise ValueError("Per-scene catalogue size exceeds the fixed whole-canon bound")
    sources_chirho.write_chirho(
        attempt_chirho / "verified-generation-chirho.json",
        {
            "record_sha256_chirho": sources_chirho.sha_chirho(
                json_chirho.dumps(result_chirho, sort_keys=True).encode()
            ),
            "original_chirho": proof_chirho,
            "source_input_sha256_chirho": source_pin_chirho["sha256_chirho"],
        },
    )
    return result_chirho


def install_chirho(
    root_chirho, book_chirho, job_chirho, attempt_chirho, record_value_chirho
):
    global TOTAL_DONE_CHIRHO
    verified_chirho = sources_chirho.read_chirho(
        attempt_chirho / "verified-generation-chirho.json"
    )
    if verified_chirho["record_sha256_chirho"] != sources_chirho.sha_chirho(
        json_chirho.dumps(record_value_chirho, sort_keys=True).encode()
    ):
        raise ValueError("Prepared scene differs from the verified original")
    source_input_chirho(root_chirho, job_chirho)
    destination_chirho = (
        root_chirho / "static" / asset_path_chirho(job_chirho).lstrip("/")
    )
    document_chirho = catalogue_chirho(root_chirho)
    matches_chirho = [
        row_chirho
        for row_chirho in document_chirho["scenes_chirho"]
        if row_chirho["lesson_id_chirho"] == job_chirho["id_chirho"]
    ]
    if matches_chirho and matches_chirho != [record_value_chirho]:
        raise ValueError("Existing high-quality scene cannot be overwritten")
    installed_path_chirho = attempt_chirho / "installed-chirho.json"
    if not installed_path_chirho.exists():
        if (
            sources_chirho.sha_chirho(
                (attempt_chirho / "scene-chirho.webp").read_bytes()
            )
            != record_value_chirho["sha256_chirho"]
        ):
            raise ValueError("Prepared raster changed")
        destination_chirho.parent.mkdir(parents=True, exist_ok=True)
        try:
            os_chirho.link(attempt_chirho / "scene-chirho.webp", destination_chirho)
        except FileExistsError:
            if (
                sources_chirho.sha_chirho(destination_chirho.read_bytes())
                != record_value_chirho["sha256_chirho"]
            ):
                raise ValueError("Existing raster cannot be overwritten")
        if not matches_chirho:
            document_chirho["scenes_chirho"].append(record_value_chirho)
            sources_chirho.write_chirho(
                root_chirho / sources_chirho.CATALOGUE_CHIRHO, document_chirho
            )
        command_chirho(
            root_chirho,
            [
                sys_chirho.executable,
                "-B",
                "scripts-chirho/art-chirho/prepare_delivery_media_chirho.py",
            ],
            attempt_chirho / "delivery-log-chirho.txt",
        )
        command_chirho(
            root_chirho,
            [
                PathChirho.home() / ".bun/bin/bun",
                "scripts-chirho/publish-chirho/r2-chirho/archive-artwork-chirho.ts",
                "--verify-remote-chirho",
            ],
            attempt_chirho / "archive-log-chirho.txt",
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
            attempt_chirho / "shards-log-chirho.txt",
        )
        BASE_CHIRHO.remote_record_chirho(root_chirho, record_value_chirho)
        sources_chirho.write_chirho(installed_path_chirho, record_value_chirho)
    elif sources_chirho.read_chirho(
        installed_path_chirho
    ) != record_value_chirho or matches_chirho != [record_value_chirho]:
        raise ValueError("Received scene installation identity differs")
    BASE_CHIRHO.remote_record_chirho(root_chirho, record_value_chirho)
    command_chirho(
        root_chirho,
        [
            PathChirho.home() / ".bun/bin/bun",
            "scripts-chirho/publish-chirho/r2-chirho/retire-artwork-chirho.ts",
            "--archive-chirho",
            "--retire-verified-chirho",
            f"--scope-chirho={attempt_chirho}",
        ],
        attempt_chirho / "retirement-log-chirho.txt",
    )
    checkpoint_path_chirho = manifest_path_chirho(root_chirho, book_chirho)
    checkpoint_chirho = (
        sources_chirho.read_chirho(checkpoint_path_chirho)
        if checkpoint_path_chirho.exists()
        else {
            "schema_version_chirho": 1,
            "book_id_chirho": book_chirho,
            "scenes_chirho": [],
        }
    )
    earlier_chirho = [
        row_chirho
        for row_chirho in checkpoint_chirho["scenes_chirho"]
        if row_chirho["lesson_id_chirho"] == job_chirho["id_chirho"]
    ]
    if earlier_chirho and earlier_chirho != [record_value_chirho]:
        raise ValueError("Chapter completion checkpoint differs")
    if not earlier_chirho:
        checkpoint_chirho["scenes_chirho"].append(record_value_chirho)
        sources_chirho.write_chirho(checkpoint_path_chirho, checkpoint_chirho)
        TOTAL_DONE_CHIRHO += 1
    sources_chirho.write_chirho(
        attempt_chirho / "archived-chirho.json",
        {
            "at_chirho": DatetimeChirho.now(UTC_CHIRHO).isoformat(),
            "sha256_chirho": record_value_chirho["sha256_chirho"],
        },
    )
    (attempt_chirho / "prepared-chirho.json").unlink(missing_ok=True)


def draining_chirho():
    return STOP_CHIRHO or (ROOT_CHIRHO / MASTER_HOME_CHIRHO / "PAUSE-chirho").exists()


def drain_chirho(_signal_chirho, _frame_chirho):
    global STOP_CHIRHO
    STOP_CHIRHO = True


def run_chirho(root_chirho, concurrency_chirho, limit_chirho):
    global \
        HOME_CHIRHO, \
        INVENTORY_CHIRHO, \
        TOTAL_DONE_CHIRHO, \
        CURRENT_CHAPTER_CHIRHO, \
        DISPATCHED_CHIRHO, \
        REQUEST_LIMIT_CHIRHO
    DISPATCHED_CHIRHO, REQUEST_LIMIT_CHIRHO = 0, limit_chirho
    home_chirho = root_chirho / MASTER_HOME_CHIRHO
    home_chirho.mkdir(parents=True, exist_ok=True)
    with (home_chirho / "worker-chirho.lock").open("a") as lock_chirho:
        fcntl_chirho.flock(lock_chirho, fcntl_chirho.LOCK_EX | fcntl_chirho.LOCK_NB)
        INVENTORY_CHIRHO = sources_chirho.freeze_chirho(root_chirho)
        TOTAL_DONE_CHIRHO = verified_completed_chirho(root_chirho)
        sources_chirho.mark_fallback_chirho(root_chirho)
        baseline_done_chirho = TOTAL_DONE_CHIRHO
        if (
            home_chirho / chapter_openings_chirho.POLICY_NAME_CHIRHO
        ).exists() and not chapter_openings_chirho.run_chirho(
            root_chirho,
            sys_chirho.modules[__name__],
            concurrency_chirho,
            limit_chirho,
        ):
            return
        for book_chirho in INVENTORY_CHIRHO["books_chirho"]:
            manifest_chirho = sources_chirho.read_chirho(
                root_chirho
                / INVENTORY_CHIRHO["source_manifests_chirho"][book_chirho["id_chirho"]][
                    "path_chirho"
                ]
            )
            for entry_chirho in manifest_chirho["chapters_chirho"]:
                if draining_chirho() or DISPATCHED_CHIRHO >= limit_chirho:
                    state_chirho = (
                        "drained"
                        if draining_chirho()
                        else "bounded_checkpoint"
                        if TOTAL_DONE_CHIRHO - baseline_done_chirho == DISPATCHED_CHIRHO
                        else "bounded_checkpoint_with_holds"
                    )
                    status_chirho(
                        root_chirho,
                        state_chirho,
                        dispatched_this_run_chirho=DISPATCHED_CHIRHO,
                    )
                    return
                CURRENT_CHAPTER_CHIRHO = entry_chirho["number_chirho"]
                HOME_CHIRHO = (
                    MASTER_HOME_CHIRHO
                    / "books-chirho"
                    / book_chirho["slug_chirho"]
                    / f"chapter-{CURRENT_CHAPTER_CHIRHO:03d}-chirho"
                )
                (root_chirho / HOME_CHIRHO).mkdir(parents=True, exist_ok=True)
                jobs_chirho = sources_chirho.chapter_jobs_chirho(
                    root_chirho, INVENTORY_CHIRHO, book_chirho, entry_chirho
                )
                checkpoint_path_chirho = manifest_path_chirho(
                    root_chirho, book_chirho["id_chirho"]
                )
                seen_chirho = (
                    {
                        row_chirho["lesson_id_chirho"]
                        for row_chirho in sources_chirho.read_chirho(
                            checkpoint_path_chirho
                        )["scenes_chirho"]
                    }
                    if checkpoint_path_chirho.exists()
                    else set()
                )
                remaining_chirho = limit_chirho - DISPATCHED_CHIRHO
                new_chirho = [
                    row_chirho
                    for row_chirho in jobs_chirho
                    if row_chirho["id_chirho"] not in seen_chirho
                ][:remaining_chirho]
                chosen_chirho = seen_chirho | {
                    row_chirho["id_chirho"] for row_chirho in new_chirho
                }
                jobs_chirho = [
                    row_chirho
                    for row_chirho in jobs_chirho
                    if row_chirho["id_chirho"] in chosen_chirho
                ]
                pool_chirho = POOL_CHIRHO.OrderedPoolChirho(
                    sys_chirho.modules[__name__],
                    root_chirho,
                    book_chirho["id_chirho"],
                    jobs_chirho,
                    concurrency_chirho,
                )
                pool_chirho.run_chirho(produce_chirho, None)
                if pool_chirho.failed_chirho >= 3 or draining_chirho():
                    return
        status_chirho(
            root_chirho,
            "complete"
            if TOTAL_DONE_CHIRHO == INVENTORY_CHIRHO["total_chirho"]
            else "eligible_complete_with_holds",
        )


def main_chirho():
    parser_chirho = argparse_chirho.ArgumentParser(description=__doc__)
    parser_chirho.add_argument("--apply-chirho", action="store_true")
    parser_chirho.add_argument(
        "--concurrency-chirho", type=int, choices=range(1, 4), default=3
    )
    parser_chirho.add_argument(
        "--limit-chirho", type=int, default=sources_chirho.MAX_SCENES_CHIRHO
    )
    arguments_chirho = parser_chirho.parse_args()
    if not 1 <= arguments_chirho.limit_chirho <= sources_chirho.MAX_SCENES_CHIRHO:
        parser_chirho.error("limit must be within the fixed canon bound")
    if not arguments_chirho.apply_chirho:
        inventory_chirho = sources_chirho.freeze_chirho(ROOT_CHIRHO)
        print(
            json_chirho.dumps(
                {
                    "total_chirho": inventory_chirho["total_chirho"],
                    "preserved_high_quality_chirho": inventory_chirho[
                        "preserved_high_quality_chirho"
                    ],
                    "order_chirho": [
                        row_chirho["id_chirho"]
                        for row_chirho in inventory_chirho["books_chirho"]
                    ],
                    "requests_chirho": 0,
                }
            )
        )
        return
    for signum_chirho in [
        signal_chirho.SIGINT,
        signal_chirho.SIGTERM,
        signal_chirho.SIGUSR1,
    ]:
        signal_chirho.signal(signum_chirho, drain_chirho)
    run_chirho(
        ROOT_CHIRHO, arguments_chirho.concurrency_chirho, arguments_chirho.limit_chirho
    )


if __name__ == "__main__":
    main_chirho()
