#!/usr/bin/env python3
# For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life. — John 3:16 (KJV)
"""Create verified, reproducible local delivery derivatives; never alter source artwork."""

import argparse
import fcntl
import hashlib
import importlib.util
import io
import json
import os
import shutil
import subprocess
import tempfile
from pathlib import Path

from PIL import Image

ROOT_CHIRHO = Path(__file__).resolve().parents[2]
DELIVERY_CHIRHO = Path("build-chirho/delivery-media-chirho")
SPEC_CHIRHO = importlib.util.spec_from_file_location(
    "delivery_shards_chirho", Path(__file__).with_name("refresh_sharded_media_chirho.py")
)
SHARDS_CHIRHO = importlib.util.module_from_spec(SPEC_CHIRHO)
SPEC_CHIRHO.loader.exec_module(SHARDS_CHIRHO)


def sha_chirho(data_chirho):
    return hashlib.sha256(data_chirho).hexdigest()


def atomic_json_chirho(path_chirho, document_chirho):
    path_chirho.parent.mkdir(parents=True, exist_ok=True)
    with tempfile.NamedTemporaryFile(
        dir=path_chirho.parent, prefix=".delivery-chirho-", delete=False
    ) as file_chirho:
        temp_chirho = Path(file_chirho.name)
        try:
            file_chirho.write(
                (json.dumps(document_chirho, ensure_ascii=False, indent=2) + "\n").encode()
            )
            file_chirho.flush()
            os.fsync(file_chirho.fileno())
        except BaseException:
            temp_chirho.unlink(missing_ok=True)
            raise
    try:
        os.replace(temp_chirho, path_chirho)
        fd_chirho = os.open(path_chirho.parent, os.O_RDONLY)
        try:
            os.fsync(fd_chirho)
        finally:
            os.close(fd_chirho)
    finally:
        temp_chirho.unlink(missing_ok=True)


def remote_cached_chirho(root_chirho, row_chirho):
    catalogue_chirho = SHARDS_CHIRHO.REMOTE_ARTWORK_CHIRHO.catalogue_chirho(root_chirho)
    entry_chirho = (catalogue_chirho or {}).get(
        (row_chirho["kind_chirho"], row_chirho["source_sha256_chirho"])
    )
    if entry_chirho is None:
        return False
    delivery_chirho = entry_chirho["delivery_chirho"]
    if (
        row_chirho["recipe_chirho"] != entry_chirho["recipe_chirho"]
        or any(
            row_chirho[field_chirho] != delivery_chirho[remote_field_chirho]
            for field_chirho, remote_field_chirho in (
                ("delivery_sha256_chirho", "sha256_chirho"),
                ("bytes_chirho", "bytes_chirho"),
                ("width_chirho", "width_chirho"),
                ("height_chirho", "height_chirho"),
            )
        )
        or any(
            path_chirho not in entry_chirho["source_paths_chirho"]
            for path_chirho in row_chirho["source_paths_chirho"]
        )
    ):
        raise ValueError("Cached mapping differs from its verified R2 delivery")
    return True


def source_bytes_chirho(root_chirho, record_chirho):
    asset_chirho = record_chirho["asset_path_chirho"]
    if not SHARDS_CHIRHO.ASSET_CHIRHO.fullmatch(asset_chirho):
        raise ValueError("Invalid asset path")
    static_chirho = (root_chirho / "static").resolve(strict=True)
    if not static_chirho.is_relative_to(root_chirho.resolve(strict=True)):
        raise ValueError("Static root escapes workspace")
    path_chirho = (static_chirho / asset_chirho.lstrip("/")).resolve(strict=False)
    if not path_chirho.exists():
        if (
            SHARDS_CHIRHO.REMOTE_ARTWORK_CHIRHO.source_fact_chirho(root_chirho, record_chirho)
            is None
        ):
            raise ValueError("Missing source has no verified remote copy")
        return None
    if not path_chirho.is_relative_to(static_chirho) or not path_chirho.is_file():
        raise ValueError("Asset escapes static root or is not a file")
    data_chirho = path_chirho.read_bytes()
    if sha_chirho(data_chirho) != record_chirho["sha256_chirho"]:
        raise ValueError(f"Source checksum mismatch: {asset_chirho}")
    return data_chirho


def source_chirho(root_chirho, record_chirho, kind_chirho):
    data_chirho = source_bytes_chirho(root_chirho, record_chirho)
    with Image.open(io.BytesIO(data_chirho)) as image_chirho:
        image_chirho.load()
        if (
            image_chirho.format != "WEBP"
            or getattr(image_chirho, "n_frames", 1) != 1
            or image_chirho.size != (record_chirho["width_chirho"], record_chirho["height_chirho"])
        ):
            raise ValueError("Source format or dimensions differ from manifest")
        if kind_chirho == "icon" and image_chirho.size != (128, 128):
            raise ValueError("Icon must be 128x128")
        alpha_chirho = (
            image_chirho.convert("RGBA").getchannel("A").tobytes()
            if kind_chirho == "icon"
            else None
        )
        size_chirho = image_chirho.size
    return data_chirho, size_chirho, alpha_chirho


def recipe_chirho(kind_chirho, version_chirho):
    if kind_chirho not in ("scene", "icon"):
        raise ValueError("Unknown media kind")
    return {
        "format_chirho": "webp",
        "quality_chirho": 78 if kind_chirho == "scene" else 80,
        "method_chirho": 6,
        "max_width_chirho": 1200 if kind_chirho == "scene" else None,
        "alpha_quality_chirho": 100 if kind_chirho == "icon" else None,
        "exact_chirho": kind_chirho == "icon",
        "metadata_chirho": "none",
        "cwebp_version_chirho": version_chirho,
    }


def encode_chirho(
    root_chirho, output_chirho, kind_chirho, data_chirho, size_chirho, alpha_chirho, version_chirho
):
    recipe_value_chirho = recipe_chirho(kind_chirho, version_chirho)
    with tempfile.TemporaryDirectory(dir=output_chirho, prefix=".encode-chirho-") as temp_chirho:
        folder_chirho = Path(temp_chirho)
        source_path_chirho = folder_chirho / "source-chirho.webp"
        result_path_chirho = folder_chirho / "delivery-chirho.webp"
        source_path_chirho.write_bytes(data_chirho)
        command_chirho = [
            "cwebp",
            "-quiet",
            "-q",
            str(recipe_value_chirho["quality_chirho"]),
            "-m",
            "6",
            "-metadata",
            "none",
        ]
        if kind_chirho == "scene" and size_chirho[0] > 1200:
            command_chirho += ["-resize", "1200", "0"]
        if kind_chirho == "icon":
            command_chirho += ["-alpha_q", "100", "-exact"]
        command_chirho += [str(source_path_chirho), "-o", str(result_path_chirho)]
        subprocess.run(command_chirho, check=True, capture_output=True)
        result_chirho = result_path_chirho.read_bytes()
        with Image.open(result_path_chirho) as image_chirho:
            image_chirho.load()
            if image_chirho.format != "WEBP" or getattr(image_chirho, "n_frames", 1) != 1:
                raise ValueError("Derivative is not a static WebP")
            width_chirho, height_chirho = image_chirho.size
            if kind_chirho == "scene" and (width_chirho > 1200 or width_chirho > size_chirho[0]):
                raise ValueError("Scene resize exceeds source or width limit")
            if kind_chirho == "icon" and (
                image_chirho.size != (128, 128)
                or image_chirho.convert("RGBA").getchannel("A").tobytes() != alpha_chirho
            ):
                raise ValueError("Icon size or alpha changed")
        digest_chirho = sha_chirho(result_chirho)
        relative_chirho = f"objects-chirho/{digest_chirho[:2]}-chirho/{digest_chirho}-chirho.webp"
        destination_chirho = output_chirho / relative_chirho
        if not destination_chirho.parent.resolve().is_relative_to(output_chirho.resolve()):
            raise ValueError("Delivery shard escapes cache")
        destination_chirho.parent.mkdir(parents=True, exist_ok=True)
        if not destination_chirho.resolve().is_relative_to(output_chirho.resolve()):
            raise ValueError("Delivery path escapes cache")
        if destination_chirho.exists():
            if destination_chirho.read_bytes() != result_chirho:
                raise ValueError("Cached derivative differs from reproducible encoding")
        else:
            with tempfile.NamedTemporaryFile(
                dir=destination_chirho.parent, prefix=".object-chirho-", delete=False
            ) as file_chirho:
                temp_object_chirho = Path(file_chirho.name)
                try:
                    file_chirho.write(result_chirho)
                    file_chirho.flush()
                    os.fsync(file_chirho.fileno())
                except BaseException:
                    temp_object_chirho.unlink(missing_ok=True)
                    raise
            try:
                try:
                    os.link(temp_object_chirho, destination_chirho)
                except FileExistsError:
                    if destination_chirho.read_bytes() != result_chirho:
                        raise ValueError("Cached derivative differs from reproducible encoding")
                dir_fd_chirho = os.open(destination_chirho.parent, os.O_RDONLY)
                try:
                    os.fsync(dir_fd_chirho)
                finally:
                    os.close(dir_fd_chirho)
            finally:
                temp_object_chirho.unlink(missing_ok=True)
        return {
            "delivery_path_chirho": relative_chirho,
            "delivery_sha256_chirho": digest_chirho,
            "bytes_chirho": len(result_chirho),
            "width_chirho": width_chirho,
            "height_chirho": height_chirho,
            "recipe_chirho": recipe_value_chirho,
        }


def validate_previous_chirho(output_chirho, previous_chirho, current_chirho):
    if (
        not isinstance(previous_chirho, dict)
        or previous_chirho.get("schema_version_chirho") != 1
        or not isinstance(previous_chirho.get("entries_chirho"), list)
        or not isinstance(previous_chirho.get("encoder_chirho"), dict)
    ):
        raise ValueError("Invalid cached delivery mapping")
    encoder_chirho = previous_chirho["encoder_chirho"]
    if (
        encoder_chirho.get("name_chirho") != "cwebp"
        or not isinstance(encoder_chirho.get("version_chirho"), str)
        or not encoder_chirho["version_chirho"].strip()
    ):
        raise ValueError("Invalid cached encoder identity")
    current_encoder_chirho = current_chirho["encoder_chirho"]
    if encoder_chirho.get("version_chirho") != current_encoder_chirho.get("version_chirho") or (
        encoder_chirho.get("executable_sha256_chirho") is not None
        and encoder_chirho.get("executable_sha256_chirho")
        != current_encoder_chirho.get("executable_sha256_chirho")
    ):
        raise ValueError("Cached encoder version changed; retire the old cache before rebuilding")
    by_path_chirho = {
        path_chirho: row_chirho
        for row_chirho in current_chirho["entries_chirho"]
        for path_chirho in row_chirho["source_paths_chirho"]
    }
    seen_chirho = set()
    for row_chirho in previous_chirho["entries_chirho"]:
        if (
            not isinstance(row_chirho, dict)
            or row_chirho.get("kind_chirho") not in ("scene", "icon")
            or row_chirho.get("recipe_chirho")
            != recipe_chirho(row_chirho["kind_chirho"], encoder_chirho["version_chirho"])
            or not isinstance(row_chirho.get("source_paths_chirho"), list)
            or not row_chirho["source_paths_chirho"]
        ):
            raise ValueError("Invalid cached recipe or source list")
        source_sha_chirho = row_chirho.get("source_sha256_chirho")
        if (
            not isinstance(source_sha_chirho, str)
            or len(source_sha_chirho) != 64
            or any(char_chirho not in "0123456789abcdef" for char_chirho in source_sha_chirho)
        ):
            raise ValueError("Invalid cached source checksum")
        digest_chirho = row_chirho["delivery_sha256_chirho"]
        relative_chirho = f"objects-chirho/{digest_chirho[:2]}-chirho/{digest_chirho}-chirho.webp"
        if (
            not isinstance(digest_chirho, str)
            or len(digest_chirho) != 64
            or any(char_chirho not in "0123456789abcdef" for char_chirho in digest_chirho)
            or row_chirho["delivery_path_chirho"] != relative_chirho
        ):
            raise ValueError("Invalid cached object identity")
        path_chirho = (output_chirho / relative_chirho).resolve(strict=False)
        if not path_chirho.exists() and remote_cached_chirho(
            output_chirho.parent.parent, row_chirho
        ):
            continue
        if not path_chirho.is_relative_to(output_chirho.resolve()) or not path_chirho.is_file():
            raise ValueError("Cached object escapes delivery directory")
        data_chirho = path_chirho.read_bytes()
        if (
            sha_chirho(data_chirho) != digest_chirho
            or len(data_chirho) != row_chirho["bytes_chirho"]
        ):
            raise ValueError("Cached object checksum or size mismatch")
        with Image.open(io.BytesIO(data_chirho)) as image_chirho:
            image_chirho.load()
            if (
                image_chirho.format != "WEBP"
                or getattr(image_chirho, "n_frames", 1) != 1
                or image_chirho.size != (row_chirho["width_chirho"], row_chirho["height_chirho"])
            ):
                raise ValueError("Cached object format or dimensions mismatch")
        for source_path_chirho in row_chirho["source_paths_chirho"]:
            if source_path_chirho in seen_chirho or not SHARDS_CHIRHO.ASSET_CHIRHO.fullmatch(
                source_path_chirho
            ):
                raise ValueError("Duplicate or malformed cached source path")
            seen_chirho.add(source_path_chirho)
            fresh_chirho = by_path_chirho.get(source_path_chirho)
            if fresh_chirho and (
                row_chirho["source_sha256_chirho"] != fresh_chirho["source_sha256_chirho"]
                or row_chirho["kind_chirho"] != fresh_chirho["kind_chirho"]
            ):
                raise ValueError("Cached source identity conflicts with the current manifest")
            if (
                fresh_chirho
                and row_chirho["source_sha256_chirho"] == fresh_chirho["source_sha256_chirho"]
                and row_chirho["recipe_chirho"] == fresh_chirho["recipe_chirho"]
                and any(
                    row_chirho[field_chirho] != fresh_chirho[field_chirho]
                    for field_chirho in (
                        "kind_chirho",
                        "delivery_path_chirho",
                        "delivery_sha256_chirho",
                        "bytes_chirho",
                        "width_chirho",
                        "height_chirho",
                    )
                )
            ):
                raise ValueError("Cached mapping conflicts with reproducible encoding")


def prepare_chirho(root_chirho, requested_chirho=None):
    root_chirho = root_chirho.resolve(strict=True)
    output_chirho = root_chirho / DELIVERY_CHIRHO
    if (root_chirho / "build-chirho").is_symlink() or output_chirho.is_symlink():
        raise ValueError("Delivery directory cannot be a symlink")
    if not output_chirho.resolve().is_relative_to(root_chirho):
        raise ValueError("Delivery directory escapes workspace")
    output_chirho.mkdir(parents=True, exist_ok=True)
    if not output_chirho.resolve().is_relative_to(root_chirho):
        raise ValueError("Delivery directory escapes workspace")
    with (output_chirho / "worker.lock").open("a") as lock_chirho:
        try:
            fcntl.flock(lock_chirho, fcntl.LOCK_EX | fcntl.LOCK_NB)
        except BlockingIOError as error_chirho:
            raise RuntimeError("Delivery media writer already active") from error_chirho
        name_chirho = (
            "sample-mapping-chirho.json" if requested_chirho is not None else "mapping-chirho.json"
        )
        previous_path_chirho = output_chirho / name_chirho
        previous_chirho = (
            json.loads(previous_path_chirho.read_text(encoding="utf-8"))
            if previous_path_chirho.exists()
            else None
        )
        executable_chirho = shutil.which("cwebp")
        if not executable_chirho:
            raise FileNotFoundError("cwebp is not installed")
        executable_sha_chirho = sha_chirho(Path(executable_chirho).read_bytes())
        previous_encoder_chirho = (
            previous_chirho.get("encoder_chirho", {}) if isinstance(previous_chirho, dict) else {}
        )
        if previous_encoder_chirho.get(
            "executable_sha256_chirho"
        ) == executable_sha_chirho and isinstance(
            previous_encoder_chirho.get("version_chirho"), str
        ):
            version_chirho = previous_encoder_chirho["version_chirho"]
        else:
            version_chirho = subprocess.run(
                ["cwebp", "-version"], check=True, capture_output=True, text=True
            ).stdout.strip()
        encoder_chirho = {
            "name_chirho": "cwebp",
            "version_chirho": version_chirho,
            "executable_sha256_chirho": executable_sha_chirho,
        }
        cache_chirho = {}
        if previous_chirho is not None:
            validate_previous_chirho(
                output_chirho,
                previous_chirho,
                {"encoder_chirho": encoder_chirho, "entries_chirho": []},
            )
            for row_chirho in previous_chirho["entries_chirho"]:
                key_chirho = (row_chirho["kind_chirho"], row_chirho["source_sha256_chirho"])
                if key_chirho in cache_chirho:
                    raise ValueError("Duplicate cached source and recipe")
                cache_chirho[key_chirho] = row_chirho
        found_chirho = SHARDS_CHIRHO.collect_chirho(root_chirho, include_fallbacks_chirho=True)
        selected_chirho = set(requested_chirho) if requested_chirho is not None else None
        declared_chirho = {
            record_chirho["asset_path_chirho"]: (kind_chirho, record_chirho["sha256_chirho"])
            for kind_chirho in ("scene", "icon")
            for _location_chirho, record_chirho in found_chirho[kind_chirho]
        }
        if previous_chirho is not None and selected_chirho is None:
            for row_chirho in previous_chirho["entries_chirho"]:
                for path_chirho in row_chirho["source_paths_chirho"]:
                    if declared_chirho.get(path_chirho) != (
                        row_chirho["kind_chirho"],
                        row_chirho["source_sha256_chirho"],
                    ):
                        raise ValueError("Cached source was removed or changed")
        groups_chirho = {}
        verified_chirho = {}
        for _round_chirho in range(8):
            # A growing, append-only manifest can catch up without re-encoding prior assets.
            for kind_chirho in ("scene", "icon"):
                for _location_chirho, record_chirho in found_chirho[kind_chirho]:
                    asset_chirho = record_chirho["asset_path_chirho"]
                    if selected_chirho is not None and asset_chirho not in selected_chirho:
                        continue
                    if asset_chirho in verified_chirho:
                        previous_kind_chirho, previous_record_chirho = verified_chirho[asset_chirho]
                        if previous_kind_chirho != kind_chirho or any(
                            previous_record_chirho[field_chirho] != record_chirho[field_chirho]
                            for field_chirho in (
                                "sha256_chirho",
                                "width_chirho",
                                "height_chirho",
                            )
                        ):
                            raise ValueError("Previously verified asset declaration changed")
                        continue
                    key_chirho = (kind_chirho, record_chirho["sha256_chirho"])
                    cached_chirho = cache_chirho.get(key_chirho)
                    if cached_chirho is not None and remote_cached_chirho(
                        root_chirho, cached_chirho
                    ):
                        SHARDS_CHIRHO.source_artwork_fact_chirho(
                            root_chirho, record_chirho, kind_chirho
                        )
                        source_bytes_chirho(root_chirho, record_chirho)
                        verified_chirho[asset_chirho] = (kind_chirho, record_chirho)
                        if key_chirho not in groups_chirho:
                            groups_chirho[key_chirho] = {**cached_chirho, "source_paths_chirho": []}
                        groups_chirho[key_chirho]["source_paths_chirho"].append(asset_chirho)
                        continue
                    data_chirho, size_chirho, alpha_chirho = source_chirho(
                        root_chirho, record_chirho, kind_chirho
                    )
                    verified_chirho[asset_chirho] = (kind_chirho, record_chirho)
                    key_chirho = (kind_chirho, record_chirho["sha256_chirho"])
                    if key_chirho not in groups_chirho:
                        cached_chirho = cache_chirho.get(key_chirho)
                        if cached_chirho is not None:
                            cached_path_chirho = (
                                output_chirho / cached_chirho["delivery_path_chirho"]
                            )
                            with Image.open(cached_path_chirho) as image_chirho:
                                image_chirho.load()
                                if kind_chirho == "icon" and (
                                    image_chirho.size != (128, 128)
                                    or image_chirho.convert("RGBA").getchannel("A").tobytes()
                                    != alpha_chirho
                                ):
                                    raise ValueError(
                                        "Cached icon dimensions or alpha differ from source"
                                    )
                                if kind_chirho == "scene" and (
                                    image_chirho.width > 1200 or image_chirho.width > size_chirho[0]
                                ):
                                    raise ValueError("Cached scene exceeds width limit")
                            delivery_chirho = {
                                field_chirho: cached_chirho[field_chirho]
                                for field_chirho in (
                                    "delivery_path_chirho",
                                    "delivery_sha256_chirho",
                                    "bytes_chirho",
                                    "width_chirho",
                                    "height_chirho",
                                    "recipe_chirho",
                                )
                            }
                        else:
                            delivery_chirho = encode_chirho(
                                root_chirho,
                                output_chirho,
                                kind_chirho,
                                data_chirho,
                                size_chirho,
                                alpha_chirho,
                                version_chirho,
                            )
                        groups_chirho[key_chirho] = {
                            "source_paths_chirho": [],
                            "source_sha256_chirho": key_chirho[1],
                            "kind_chirho": kind_chirho,
                            **delivery_chirho,
                        }
                    groups_chirho[key_chirho]["source_paths_chirho"].append(asset_chirho)
            next_chirho = SHARDS_CHIRHO.collect_chirho(root_chirho, include_fallbacks_chirho=True)
            if next_chirho == found_chirho:
                # Hash equality preserves the already decoded size/alpha/format proof. Avoid
                # decoding every original again, and include appends during this final check.
                for _kind_chirho, record_chirho in verified_chirho.values():
                    source_bytes_chirho(root_chirho, record_chirho)
                next_chirho = SHARDS_CHIRHO.collect_chirho(
                    root_chirho, include_fallbacks_chirho=True
                )
                if next_chirho == found_chirho:
                    break
            for kind_chirho in ("scene", "icon"):
                old_chirho = {
                    json.dumps(row_chirho, ensure_ascii=False, sort_keys=True)
                    for row_chirho in found_chirho[kind_chirho]
                }
                new_chirho = {
                    json.dumps(row_chirho, ensure_ascii=False, sort_keys=True)
                    for row_chirho in next_chirho[kind_chirho]
                }
                if not old_chirho <= new_chirho:
                    raise ValueError("Media manifest removed or changed a verified record")
            found_chirho = next_chirho
        else:
            raise ValueError("Media manifests did not settle within eight passes")
        paths_chirho = {
            path_chirho
            for group_chirho in groups_chirho.values()
            for path_chirho in group_chirho["source_paths_chirho"]
        }
        if selected_chirho is not None and paths_chirho != selected_chirho:
            raise ValueError("Requested asset is not in verified media manifests")
        for group_chirho in groups_chirho.values():
            group_chirho["source_paths_chirho"] = sorted(set(group_chirho["source_paths_chirho"]))
        document_chirho = {
            "schema_version_chirho": 1,
            "encoder_chirho": encoder_chirho,
            "entries_chirho": [groups_chirho[key_chirho] for key_chirho in sorted(groups_chirho)],
        }
        if SHARDS_CHIRHO.collect_chirho(root_chirho, include_fallbacks_chirho=True) != found_chirho:
            raise ValueError("Media manifests changed during preparation")
        if previous_chirho is not None:
            validate_previous_chirho(output_chirho, previous_chirho, document_chirho)
        atomic_json_chirho(previous_path_chirho, document_chirho)
        return document_chirho


def main_chirho():
    parser_chirho = argparse.ArgumentParser(description=__doc__)
    parser_chirho.add_argument(
        "--asset-chirho",
        action="append",
        help="Prepare only this declared asset; writes a sample mapping",
    )
    args_chirho = parser_chirho.parse_args()
    result_chirho = prepare_chirho(ROOT_CHIRHO, args_chirho.asset_chirho)
    print(json.dumps(result_chirho, ensure_ascii=False, indent=2))


if __name__ == "__main__":
    main_chirho()
