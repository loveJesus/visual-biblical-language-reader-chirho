#!/usr/bin/env python3
# For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life. — John 3:16 (KJV)
"""Prepare source WebPs and install reconciled Mark scenes through the existing sole-writer chain.

Workflow: media-delivery-chirho.md. Uniform outputs are preserved and withheld, never retried.
"""

import argparse
import contextlib
import fcntl
import hashlib
import io
import json
import os
import subprocess
import tempfile
from concurrent.futures import ThreadPoolExecutor
from pathlib import Path

from PIL import Image

ROOT_CHIRHO = Path(__file__).resolve().parents[3]
RUN_CHIRHO = Path("workspace-chirho/art-chirho/mark-schnell-2026-11-04-chirho")
STAGE_CHIRHO = Path("build-chirho/local-scenes-chirho/mark-schnell-2026-11-04-chirho")
ASSET_PREFIX_CHIRHO = "/assets-chirho/scenes-chirho/mark-schnell-v1-chirho/"


def sha_chirho(bytes_chirho):
    return hashlib.sha256(bytes_chirho).hexdigest()


def ensure_directory_chirho(root_chirho, path_chirho):
    root_chirho = root_chirho.resolve(strict=True)
    if path_chirho != path_chirho.resolve(strict=False):
        raise ValueError("Redirected output directory")
    current_chirho = root_chirho
    for part_chirho in path_chirho.relative_to(root_chirho).parts:
        current_chirho = current_chirho / part_chirho
        current_chirho.mkdir(exist_ok=True)
        if current_chirho.is_symlink() or not current_chirho.is_dir():
            raise ValueError("Redirected or non-directory output parent")


def exclusive_bytes_chirho(root_chirho, path_chirho, bytes_chirho):
    ensure_directory_chirho(root_chirho, path_chirho.parent)
    if path_chirho.is_symlink():
        raise ValueError("Linked output refused")
    if path_chirho.exists():
        if path_chirho.read_bytes() != bytes_chirho:
            raise ValueError("Prepared output differs; refusing overwrite")
        return
    with path_chirho.open("xb") as file_chirho:
        file_chirho.write(bytes_chirho)
        file_chirho.flush()
        os.fsync(file_chirho.fileno())


def json_chirho(root_chirho, path_chirho, value_chirho):
    ensure_directory_chirho(root_chirho, path_chirho.parent)
    bytes_chirho = (
        json.dumps(value_chirho, ensure_ascii=False, indent=2) + "\n"
    ).encode()
    with tempfile.NamedTemporaryFile(
        dir=path_chirho.parent, prefix=".mark-chirho-", delete=False
    ) as file_chirho:
        temporary_chirho = Path(file_chirho.name)
        file_chirho.write(bytes_chirho)
        file_chirho.flush()
        os.fsync(file_chirho.fileno())
    os.replace(temporary_chirho, path_chirho)
    directory_chirho = os.open(path_chirho.parent, os.O_RDONLY)
    try:
        os.fsync(directory_chirho)
    finally:
        os.close(directory_chirho)


@contextlib.contextmanager
def writer_lock_chirho(root_chirho):
    path_chirho = (
        root_chirho
        / "workspace-chirho/art-chirho/queue-chirho/bible-icons-chirho/worker-chirho.lock"
    )
    ensure_directory_chirho(root_chirho, path_chirho.parent)
    if path_chirho.is_symlink():
        raise ValueError("Linked coordinator lock refused")
    with path_chirho.open("a") as file_chirho:
        fcntl.flock(file_chirho, fcntl.LOCK_EX | fcntl.LOCK_NB)
        yield


def encode_item_chirho(root_chirho, item_chirho):
    completed_chirho = item_chirho["completed_chirho"]
    job_chirho = completed_chirho["job_chirho"]
    scene_chirho = dict(item_chirho["scene_chirho"])
    path_chirho = Path(job_chirho["output_chirho"])
    if path_chirho != path_chirho.resolve(
        strict=True
    ) or not path_chirho.is_relative_to(root_chirho / RUN_CHIRHO / "originals-chirho"):
        raise ValueError("PNG source escapes the fixed run")
    if not path_chirho.is_file() or path_chirho.stat().st_size > 25 * 1024**2:
        raise ValueError("PNG source is not a bounded regular file")
    bytes_chirho = path_chirho.read_bytes()
    if sha_chirho(bytes_chirho) != completed_chirho["output_sha256_chirho"]:
        raise ValueError("PNG changed after verified preservation")
    asset_chirho = scene_chirho["asset_path_chirho"]
    if (
        not asset_chirho.startswith(ASSET_PREFIX_CHIRHO)
        or ".." in asset_chirho.split("/")
        or scene_chirho["art_review_chirho"] != "pending"
    ):
        raise ValueError("Scene asset scope or review state differs")
    with Image.open(io.BytesIO(bytes_chirho)) as image_chirho:
        image_chirho.load()
        if (
            image_chirho.format != "PNG"
            or image_chirho.size != (1024, 768)
            or getattr(image_chirho, "n_frames", 1) != 1
        ):
            raise ValueError("PNG format or canvas differs")
        pixels_chirho = image_chirho.convert("RGBA")
        extrema_chirho = pixels_chirho.getextrema()
        if (
            max(high_chirho for low_chirho, high_chirho in extrema_chirho[:3]) <= 8
            or all(
                low_chirho == high_chirho for low_chirho, high_chirho in extrema_chirho
            )
            or extrema_chirho[3] == (0, 0)
        ):
            return {
                "held_chirho": {
                    "lesson_id_chirho": scene_chirho["lesson_id_chirho"],
                    "sha256_chirho": completed_chirho["output_sha256_chirho"],
                    "reason_chirho": "uniform_or_invisible_output",
                    "preserved_key_chirho": f"provenance-chirho/sha256-chirho/{completed_chirho['output_sha256_chirho']}.png",
                }
            }
        buffer_chirho = io.BytesIO()
        pixels_chirho.save(
            buffer_chirho, format="WEBP", lossless=True, method=6, exact=True
        )
        source_chirho = buffer_chirho.getvalue()
        with Image.open(io.BytesIO(source_chirho)) as checked_chirho:
            checked_chirho.load()
            if (
                checked_chirho.format != "WEBP"
                or checked_chirho.size != image_chirho.size
                or checked_chirho.convert("RGBA").tobytes() != pixels_chirho.tobytes()
            ):
                raise ValueError("Source WebP changed pixels")
    relative_chirho = Path(asset_chirho.removeprefix(ASSET_PREFIX_CHIRHO))
    prepared_chirho = (
        root_chirho / STAGE_CHIRHO / "source-webp-chirho" / relative_chirho
    )
    exclusive_bytes_chirho(root_chirho, prepared_chirho, source_chirho)
    scene_chirho.update(
        {
            "width_chirho": 1024,
            "height_chirho": 768,
            "sha256_chirho": sha_chirho(source_chirho),
        }
    )
    return {
        "scene_chirho": scene_chirho,
        "prepared_path_chirho": str(prepared_chirho),
        "bytes_chirho": len(source_chirho),
    }


def install_chirho(root_chirho, prepared_chirho, allow_holds_chirho):
    scenes_chirho = [
        row_chirho["scene_chirho"]
        for row_chirho in prepared_chirho
        if "scene_chirho" in row_chirho
    ]
    held_chirho = [
        row_chirho["held_chirho"]
        for row_chirho in prepared_chirho
        if "held_chirho" in row_chirho
    ]
    json_chirho(
        root_chirho,
        root_chirho / STAGE_CHIRHO / "installation-holds-chirho.json",
        {"held_chirho": held_chirho},
    )
    if held_chirho and not allow_holds_chirho:
        raise ValueError(
            "Uniform outputs withheld; explicit --allow-uniform-holds-chirho is required for a partial installation"
        )
    if not scenes_chirho:
        raise ValueError("No nonblank scenes to install")
    manifest_chirho = {
        "schema_version_chirho": 1,
        "book_id_chirho": "Mark",
        "scenes_chirho": scenes_chirho,
    }
    manifest_path_chirho = (
        root_chirho / "data-chirho/media-chirho/mark-worker-scenes-chirho.json"
    )
    if manifest_path_chirho.exists():
        previous_chirho = json.loads(manifest_path_chirho.read_bytes())
        next_chirho = {
            scene_chirho["lesson_id_chirho"]: scene_chirho
            for scene_chirho in scenes_chirho
        }
        if previous_chirho.get("book_id_chirho") != "Mark" or any(
            next_chirho.get(scene_chirho["lesson_id_chirho"]) != scene_chirho
            for scene_chirho in previous_chirho.get("scenes_chirho", [])
        ):
            raise ValueError(
                "Existing Mark manifest differs; only identical rows and additive verified scenes may install"
            )
    for row_chirho in prepared_chirho:
        if "scene_chirho" not in row_chirho:
            continue
        scene_chirho = row_chirho["scene_chirho"]
        path_chirho = (
            root_chirho / "static" / scene_chirho["asset_path_chirho"].lstrip("/")
        )
        source_chirho = Path(row_chirho["prepared_path_chirho"]).read_bytes()
        if sha_chirho(source_chirho) != scene_chirho["sha256_chirho"]:
            raise ValueError("Prepared source changed before installation")
        exclusive_bytes_chirho(root_chirho, path_chirho, source_chirho)
    json_chirho(root_chirho, manifest_path_chirho, manifest_chirho)
    for command_chirho in (
        [
            "bun",
            "node_modules/prettier/bin/prettier.cjs",
            "--write",
            str(manifest_path_chirho),
        ],
        [
            "python3",
            "-I",
            "-B",
            "scripts-chirho/art-chirho/prepare_delivery_media_chirho.py",
        ],
        [
            "bun",
            "scripts-chirho/publish-chirho/r2-chirho/archive-artwork-chirho.ts",
            "--verify-remote-chirho",
        ],
        [
            "python3",
            "-I",
            "-B",
            "scripts-chirho/art-chirho/refresh_sharded_media_chirho.py",
            "--once",
        ],
    ):
        subprocess.run(command_chirho, cwd=root_chirho, check=True)
    return {
        "installed_chirho": len(scenes_chirho),
        "withheld_uniform_chirho": len(held_chirho),
        "local_deletions_chirho": 0,
    }


def main_chirho():
    parser_chirho = argparse.ArgumentParser(description=__doc__)
    parser_chirho.add_argument("--prepare-chirho", action="store_true")
    parser_chirho.add_argument("--apply-chirho", action="store_true")
    parser_chirho.add_argument("--allow-uniform-holds-chirho", action="store_true")
    arguments_chirho = parser_chirho.parse_args()
    result_chirho = subprocess.run(
        [
            "bun",
            "scripts-chirho/publish-chirho/local-scenes-chirho/install-plan-chirho.ts",
        ],
        cwd=ROOT_CHIRHO,
        check=True,
        capture_output=True,
        timeout=120,
    )
    if len(result_chirho.stdout) > 4 * 1024**2:
        raise ValueError("Installation plan exceeds its bound")
    plan_chirho = json.loads(result_chirho.stdout)
    if (
        plan_chirho.get("book_id_chirho") != "Mark"
        or len(plan_chirho.get("items_chirho", [])) != 674
    ):
        raise ValueError("Mark source plan coverage differs")
    if not arguments_chirho.prepare_chirho and not arguments_chirho.apply_chirho:
        print(
            json.dumps(
                {"planned_chirho": 674, "remote_reads_chirho": 0, "writes_chirho": 0}
            )
        )
        return
    with contextlib.ExitStack() as stack_chirho:
        if arguments_chirho.apply_chirho:
            stack_chirho.enter_context(writer_lock_chirho(ROOT_CHIRHO))
        json_chirho(
            ROOT_CHIRHO,
            ROOT_CHIRHO / STAGE_CHIRHO / "installation-plan-chirho.json",
            plan_chirho,
        )
        with ThreadPoolExecutor(max_workers=4) as executor_chirho:
            prepared_chirho = list(
                executor_chirho.map(
                    lambda item_chirho: encode_item_chirho(ROOT_CHIRHO, item_chirho),
                    plan_chirho["items_chirho"],
                )
            )
        json_chirho(
            ROOT_CHIRHO,
            ROOT_CHIRHO / STAGE_CHIRHO / "prepared-sources-chirho.json",
            prepared_chirho,
        )
        if arguments_chirho.apply_chirho:
            summary_chirho = install_chirho(
                ROOT_CHIRHO,
                prepared_chirho,
                arguments_chirho.allow_uniform_holds_chirho,
            )
        else:
            summary_chirho = {
                "prepared_chirho": sum(
                    "scene_chirho" in row_chirho for row_chirho in prepared_chirho
                ),
                "withheld_uniform_chirho": sum(
                    "held_chirho" in row_chirho for row_chirho in prepared_chirho
                ),
                "local_deletions_chirho": 0,
            }
        json_chirho(
            ROOT_CHIRHO,
            ROOT_CHIRHO / STAGE_CHIRHO / "installation-result-chirho.json",
            summary_chirho,
        )
        print(json.dumps(summary_chirho))


if __name__ == "__main__":
    main_chirho()
