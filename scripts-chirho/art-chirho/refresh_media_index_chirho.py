#!/usr/bin/env python3
# For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life. — John 3:16 (KJV)
"""Publish a sanitized, atomically replaced local view of worker media records."""

import argparse
import json
import os
import re
import signal
import tempfile
import time
from pathlib import Path

ROOT_CHIRHO = Path(__file__).resolve().parents[2]
SCENE_FIELDS_CHIRHO = (
    "lesson_id",
    "asset_path",
    "alt",
    "width",
    "height",
    "sha256",
    "art_review",
    "reading_note",
)
ICON_FIELDS_CHIRHO = (
    "id",
    "lesson_id",
    "token_id",
    "lemma_id",
    "lemma_augment",
    "sense_id",
    "contextual_meaning",
    "asset_path",
    "alt",
    "width",
    "height",
    "sha256",
    "sense_review",
    "art_review",
    "evidence_refs",
    "display_authority",
    "selected",
)
STOP_CHIRHO = False


def stop_chirho(_signal_chirho, _frame_chirho):
    global STOP_CHIRHO
    STOP_CHIRHO = True


def sanitize_chirho(record_chirho, fields_chirho, icon_chirho):
    if not isinstance(record_chirho, dict):
        raise TypeError("record must be an object")
    try:
        result_chirho = {
            f"{field_chirho}_chirho": record_chirho[f"{field_chirho}_chirho"]
            for field_chirho in fields_chirho
        }
    except KeyError as error_chirho:
        raise ValueError(f"missing field {error_chirho.args[0]}") from error_chirho

    def value_chirho(field_chirho):
        return result_chirho[f"{field_chirho}_chirho"]

    text_fields_chirho = (
        (
            "lesson_id",
            "alt",
            "id",
            "token_id",
            "lemma_id",
            "sense_id",
            "contextual_meaning",
            "display_authority",
        )
        if icon_chirho
        else ("lesson_id", "alt", "reading_note")
    )
    if any(
        not isinstance(value_chirho(field_chirho), str) or not value_chirho(field_chirho).strip()
        for field_chirho in text_fields_chirho
    ):
        raise ValueError("invalid text field")
    if not re.fullmatch(r"Prov\.\d{1,2}\.\d{1,3}", value_chirho("lesson_id")):
        raise ValueError("invalid lesson id")
    path_chirho = value_chirho("asset_path")
    if not isinstance(path_chirho, str) or not re.fullmatch(
        r"/assets-chirho/(?:[a-z0-9-]+/)*[a-z0-9-]+\.webp", path_chirho
    ):
        raise ValueError("invalid local WebP path")
    hash_chirho = value_chirho("sha256")
    if not isinstance(hash_chirho, str) or not re.fullmatch(r"[a-f0-9]{64}", hash_chirho):
        raise ValueError("invalid checksum")
    limit_chirho = 128 if icon_chirho else 4096
    if any(
        type(value_chirho(field_chirho)) is not int
        or not 0 < value_chirho(field_chirho) <= limit_chirho
        for field_chirho in ("width", "height")
    ):
        raise ValueError("invalid dimensions")
    if value_chirho("art_review") not in ("pending", "approved"):
        raise ValueError("invalid art review")
    if icon_chirho:
        if value_chirho("sense_review") not in ("agent_reviewed", "human_reviewed"):
            raise ValueError("invalid sense review")
        augment_chirho = value_chirho("lemma_augment")
        if augment_chirho is not None and (
            not isinstance(augment_chirho, str) or not augment_chirho.strip()
        ):
            raise ValueError("invalid lemma augment")
        refs_chirho = value_chirho("evidence_refs")
        if (
            not isinstance(refs_chirho, list)
            or not refs_chirho
            or any(
                not isinstance(ref_chirho, str) or not ref_chirho.strip()
                for ref_chirho in refs_chirho
            )
        ):
            raise ValueError("invalid evidence references")
        if type(value_chirho("selected")) is not bool:
            raise ValueError("invalid selection")
    return result_chirho


# Workflow: spec-chirho/workflows-chirho/local-reader-chirho.md, receipt -> index -> reader.
def refresh_chirho(root_chirho=ROOT_CHIRHO):
    media_chirho = root_chirho / "data-chirho/media-chirho"
    output_chirho = root_chirho / "static/media-index-chirho.json"
    collections_chirho = {}
    for kind_chirho, fields_chirho in (
        ("scenes", SCENE_FIELDS_CHIRHO),
        ("icons", ICON_FIELDS_CHIRHO),
    ):
        source_chirho = media_chirho / f"proverbs-worker-{kind_chirho}-chirho.json"
        with source_chirho.open(encoding="utf-8") as file_chirho:
            manifest_chirho = json.load(file_chirho)
        if (
            not isinstance(manifest_chirho, dict)
            or type(manifest_chirho.get("schema_version_chirho")) is not int
            or manifest_chirho["schema_version_chirho"] != 1
            or not isinstance(manifest_chirho.get(f"{kind_chirho}_chirho"), list)
        ):
            raise ValueError(f"invalid {kind_chirho} manifest")
        records_chirho = [
            sanitize_chirho(record_chirho, fields_chirho, kind_chirho == "icons")
            for record_chirho in manifest_chirho[f"{kind_chirho}_chirho"]
        ]
        collections_chirho[f"{kind_chirho}_chirho"] = records_chirho
    scenes_chirho = collections_chirho["scenes_chirho"]
    if len(scenes_chirho) > 1000 or len(
        {scene_chirho["lesson_id_chirho"] for scene_chirho in scenes_chirho}
    ) != len(scenes_chirho):
        raise ValueError("duplicate or excessive scenes")
    encoded_chirho = (
        json.dumps({"schema_version_chirho": 1, **collections_chirho}, ensure_ascii=False, indent=2)
        + "\n"
    ).encode("utf-8")
    try:
        if output_chirho.read_bytes() == encoded_chirho:
            return False
    except FileNotFoundError:
        pass
    temp_chirho = None
    try:
        with tempfile.NamedTemporaryFile(
            dir=output_chirho.parent, prefix=".media-index-chirho-", delete=False
        ) as file_chirho:
            temp_chirho = Path(file_chirho.name)
            file_chirho.write(encoded_chirho)
            file_chirho.flush()
            os.fsync(file_chirho.fileno())
        os.replace(temp_chirho, output_chirho)
    finally:
        if temp_chirho is not None:
            temp_chirho.unlink(missing_ok=True)
    return True


def signature_chirho(root_chirho):
    paths_chirho = [
        root_chirho / f"data-chirho/media-chirho/proverbs-worker-{kind_chirho}-chirho.json"
        for kind_chirho in ("scenes", "icons")
    ]
    return tuple(
        (stat_chirho.st_ino, stat_chirho.st_size, stat_chirho.st_mtime_ns)
        for stat_chirho in (path_chirho.stat() for path_chirho in paths_chirho)
    )


def main_chirho():
    parser_chirho = argparse.ArgumentParser(description=__doc__)
    group_chirho = parser_chirho.add_mutually_exclusive_group()
    group_chirho.add_argument("--once", action="store_true", help="refresh once (default)")
    group_chirho.add_argument("--watch", action="store_true", help="poll for changes")
    args_chirho = parser_chirho.parse_args()
    signal.signal(signal.SIGTERM, stop_chirho)
    signal.signal(signal.SIGINT, stop_chirho)
    last_chirho = None
    while not STOP_CHIRHO:
        try:
            before_chirho = signature_chirho(ROOT_CHIRHO)
            if before_chirho != last_chirho:
                changed_chirho = refresh_chirho()
                after_chirho = signature_chirho(ROOT_CHIRHO)
                last_chirho = before_chirho if before_chirho == after_chirho else None
                print(
                    "media index updated" if changed_chirho else "media index unchanged", flush=True
                )
        except (OSError, ValueError, TypeError) as error_chirho:
            print(f"media index refresh failed: {error_chirho}", flush=True)
            last_chirho = None
            if not args_chirho.watch:
                return 1
        if not args_chirho.watch:
            return 0
        time.sleep(3)
    return 0


if __name__ == "__main__":
    raise SystemExit(main_chirho())
