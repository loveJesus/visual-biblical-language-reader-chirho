# For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life. — John 3:16 (KJV)
"""Verify public catalogues and package compressed media without a raster mirror.

Workflow: hosting-chirho/public-media-library-chirho.md. Dry by default; GET only.
"""

from __future__ import annotations

import argparse
import hashlib
import json
import re
import time
import urllib.error
import urllib.request
import zipfile
from concurrent.futures import ThreadPoolExecutor
from pathlib import Path

ROOT_CHIRHO = Path(__file__).resolve().parents[2]
HASH_CHIRHO = re.compile(r"[a-f0-9]{64}")
KINDS_CHIRHO = ("icons_chirho", "word_audio_chirho", "scenes_chirho")
MAX_SHARD_CHIRHO = 2 * 1024**2
MAX_ARCHIVE_CHIRHO = 2 * 1024**3 - 1


def sha_chirho(bytes_chirho):
    return hashlib.sha256(bytes_chirho).hexdigest()


def read_chirho(path_chirho, maximum_chirho=MAX_SHARD_CHIRHO):
    if path_chirho.is_symlink() or not path_chirho.is_file():
        raise ValueError("Catalogue must be a regular file")
    with path_chirho.open("rb") as source_chirho:
        bytes_chirho = source_chirho.read(maximum_chirho + 1)
    if len(bytes_chirho) > maximum_chirho:
        raise ValueError("Catalogue exceeds bound")
    return bytes_chirho


def plan_chirho(catalogue_chirho):
    catalogue_chirho = catalogue_chirho.resolve()
    manifest_bytes_chirho = read_chirho(catalogue_chirho / "manifest-chirho.json")
    manifest_chirho = json.loads(manifest_bytes_chirho)
    release_chirho = manifest_chirho["release_id_chirho"]
    if manifest_chirho["schema_version_chirho"] != 1 or not HASH_CHIRHO.fullmatch(
        release_chirho
    ):
        raise ValueError("Unsupported library identity")
    assets_chirho = {}
    files_chirho = {"manifest-chirho.json": manifest_bytes_chirho}
    if len(manifest_chirho["shards_chirho"]) > 512:
        raise ValueError("Catalogue needs cold retirement")
    for shard_chirho in manifest_chirho["shards_chirho"]:
        name_chirho = shard_chirho["path_chirho"]
        if not re.fullmatch(r"[a-z-]+/part-[0-9]{4}-chirho\.json", name_chirho):
            raise ValueError("Unsafe shard path")
        path_chirho = catalogue_chirho / name_chirho
        if path_chirho.parent.is_symlink() or name_chirho in files_chirho:
            raise ValueError("Linked or duplicate shard")
        bytes_chirho = read_chirho(path_chirho)
        if (
            len(bytes_chirho) != shard_chirho["bytes_chirho"]
            or sha_chirho(bytes_chirho) != shard_chirho["sha256_chirho"]
        ):
            raise ValueError("Catalogue shard hash or size differs")
        document_chirho = json.loads(bytes_chirho)
        rows_chirho = document_chirho["records_chirho"]
        if (
            document_chirho["release_id_chirho"] != release_chirho
            or len(rows_chirho) != shard_chirho["records_chirho"]
        ):
            raise ValueError("Catalogue shard identity differs")
        files_chirho[name_chirho] = bytes_chirho
        if not name_chirho.startswith("assets-chirho/"):
            continue
        for row_chirho in rows_chirho:
            hash_chirho = row_chirho["sha256_chirho"]
            size_chirho = row_chirho["bytes_chirho"]
            kinds_chirho = row_chirho["kinds_chirho"]
            if (
                not HASH_CHIRHO.fullmatch(hash_chirho)
                or hash_chirho in assets_chirho
                or type(size_chirho) is not int
                or not 0 < size_chirho <= MAX_SHARD_CHIRHO
            ):
                raise ValueError("Invalid bounded asset")
            if (
                not kinds_chirho
                or len(set(kinds_chirho)) != len(kinds_chirho)
                or any(kind_chirho not in KINDS_CHIRHO for kind_chirho in kinds_chirho)
            ):
                raise ValueError("Invalid media kind")
            audio_chirho = "word_audio_chirho" in kinds_chirho
            if audio_chirho and len(kinds_chirho) != 1:
                raise ValueError("Audio cannot be artwork")
            relative_chirho = (
                f"audio-chirho/sha256-chirho/{hash_chirho}-chirho.mp3"
                if audio_chirho
                else f"assets-chirho/sha256-chirho/{hash_chirho}-chirho.webp"
            )
            if (
                row_chirho["download_url_chirho"]
                != "https://hinneh.us/" + relative_chirho
            ):
                raise ValueError("Asset URL outside exact public delivery path")
            assets_chirho[hash_chirho] = row_chirho
    for kind_chirho in KINDS_CHIRHO:
        rows_chirho = [
            row_chirho
            for row_chirho in assets_chirho.values()
            if kind_chirho in row_chirho["kinds_chirho"]
        ]
        declared_chirho = manifest_chirho["download_plan_chirho"][kind_chirho]
        if (
            len(rows_chirho) != declared_chirho["unique_assets_chirho"]
            or sum(row_chirho["bytes_chirho"] for row_chirho in rows_chirho)
            != declared_chirho["bytes_chirho"]
        ):
            raise ValueError("Declared download totals differ")
    files_chirho["README-chirho.md"] = read_chirho(
        catalogue_chirho / "README-chirho.md"
    )
    return (
        manifest_chirho,
        files_chirho,
        sorted(
            assets_chirho.values(), key=lambda row_chirho: row_chirho["sha256_chirho"]
        ),
    )


class NoRedirectChirho(urllib.request.HTTPRedirectHandler):
    def redirect_request(
        self_chirho,
        req_chirho,
        fp_chirho,
        code_chirho,
        msg_chirho,
        headers_chirho,
        newurl_chirho,
    ):
        return None


def download_chirho(row_chirho, root_chirho=ROOT_CHIRHO):
    """One bounded object at a time. Existing verified word MP3s avoid network reads."""
    hash_chirho = row_chirho["sha256_chirho"]
    audio_chirho = "word_audio_chirho" in row_chirho["kinds_chirho"]
    relative_chirho = (
        f"audio-chirho/sha256-chirho/{hash_chirho}-chirho.mp3"
        if audio_chirho
        else f"assets-chirho/sha256-chirho/{hash_chirho}-chirho.webp"
    )
    if (
        not HASH_CHIRHO.fullmatch(hash_chirho)
        or row_chirho["download_url_chirho"] != "https://hinneh.us/" + relative_chirho
        or type(row_chirho["bytes_chirho"]) is not int
        or not 0 < row_chirho["bytes_chirho"] <= MAX_SHARD_CHIRHO
    ):
        raise ValueError("Unsafe bounded public download")
    if "word_audio_chirho" in row_chirho["kinds_chirho"]:
        local_chirho = (
            root_chirho / f"static/audio-chirho/sha256-chirho/{hash_chirho}-chirho.mp3"
        )
        if local_chirho.exists():
            bytes_chirho = read_chirho(local_chirho)
            if (
                len(bytes_chirho) != row_chirho["bytes_chirho"]
                or sha_chirho(bytes_chirho) != hash_chirho
            ):
                raise ValueError("Existing MP3 changed")
            return bytes_chirho
    opener_chirho = urllib.request.build_opener(NoRedirectChirho())
    for attempt_chirho in range(3):
        try:
            request_chirho = urllib.request.Request(
                row_chirho["download_url_chirho"],
                headers={
                    "User-Agent": "Hinneh-media-library-chirho/1",
                    "Accept-Encoding": "identity",
                },
            )
            with opener_chirho.open(request_chirho, timeout=30) as response_chirho:
                if response_chirho.status != 200:
                    raise ValueError("Media GET must return 200")
                bytes_chirho = response_chirho.read(row_chirho["bytes_chirho"] + 1)
            if (
                len(bytes_chirho) != row_chirho["bytes_chirho"]
                or sha_chirho(bytes_chirho) != hash_chirho
            ):
                raise ValueError("Downloaded media hash or size differs")
            return bytes_chirho
        except urllib.error.HTTPError as error_chirho:
            if error_chirho.code != 429 and error_chirho.code < 500:
                raise ValueError(
                    f"Media GET refused ({error_chirho.code})"
                ) from error_chirho
            if attempt_chirho == 2:
                raise
        except (urllib.error.URLError, TimeoutError):
            if attempt_chirho == 2:
                raise
        time.sleep(2**attempt_chirho)
    raise RuntimeError("Unreachable download state")


def entry_chirho(archive_chirho, name_chirho, bytes_chirho):
    info_chirho = zipfile.ZipInfo(name_chirho, (1980, 1, 1, 0, 0, 0))
    info_chirho.external_attr = 0o100644 << 16
    info_chirho.compress_type = zipfile.ZIP_STORED
    archive_chirho.writestr(info_chirho, bytes_chirho)


def package_chirho(
    catalogue_chirho,
    kind_chirho,
    root_chirho=ROOT_CHIRHO,
    concurrency_chirho=8,
    fetch_chirho=download_chirho,
):
    """Single archive writer; at most one bounded batch of fetched objects in memory."""
    if (
        kind_chirho not in (*KINDS_CHIRHO, "catalogue_chirho")
        or not 1 <= concurrency_chirho <= 16
    ):
        raise ValueError("Unknown package kind or concurrency")
    manifest_chirho, files_chirho, assets_chirho = plan_chirho(catalogue_chirho)
    output_chirho = (
        root_chirho
        / "build-chirho/public-media-archives-chirho"
        / (manifest_chirho["release_id_chirho"] + "-chirho")
    )
    current_chirho = root_chirho
    for part_chirho in output_chirho.relative_to(root_chirho).parts:
        current_chirho /= part_chirho
        current_chirho.mkdir(exist_ok=True)
        if current_chirho.is_symlink() or not current_chirho.is_dir():
            raise ValueError("Linked output directory")
    name_chirho = kind_chirho.replace("_", "-") + ".zip"
    target_chirho = output_chirho / name_chirho
    partial_chirho = output_chirho / (name_chirho + ".partial-chirho")
    if target_chirho.exists():
        raise ValueError("Archive already exists; refusing overwrite")
    rows_chirho = [
        row_chirho
        for row_chirho in assets_chirho
        if kind_chirho in row_chirho["kinds_chirho"]
    ]
    completed_chirho = 0
    with (
        partial_chirho.open("xb") as output_file_chirho,
        zipfile.ZipFile(output_file_chirho, "w", allowZip64=True) as archive_chirho,
    ):
        if kind_chirho == "catalogue_chirho":
            for path_chirho, bytes_chirho in sorted(files_chirho.items()):
                info_chirho = zipfile.ZipInfo(path_chirho, (1980, 1, 1, 0, 0, 0))
                info_chirho.compress_type = zipfile.ZIP_DEFLATED
                info_chirho.external_attr = 0o100644 << 16
                archive_chirho.writestr(info_chirho, bytes_chirho, compresslevel=6)
        else:
            entry_chirho(
                archive_chirho,
                "library-chirho.json",
                json.dumps(
                    {
                        "schema_version_chirho": 1,
                        "release_id_chirho": manifest_chirho["release_id_chirho"],
                        "catalogue_sha256_chirho": sha_chirho(
                            files_chirho["manifest-chirho.json"]
                        ),
                        "kind_chirho": kind_chirho,
                        "licenses_chirho": manifest_chirho["licenses_chirho"],
                    },
                    sort_keys=True,
                ).encode()
                + b"\n",
            )
            with ThreadPoolExecutor(max_workers=concurrency_chirho) as executor_chirho:
                for offset_chirho in range(0, len(rows_chirho), concurrency_chirho):
                    batch_chirho = rows_chirho[
                        offset_chirho : offset_chirho + concurrency_chirho
                    ]
                    for row_chirho, bytes_chirho in zip(
                        batch_chirho,
                        executor_chirho.map(
                            lambda item_chirho: fetch_chirho(item_chirho, root_chirho),
                            batch_chirho,
                        ),
                        strict=True,
                    ):
                        if (
                            sha_chirho(bytes_chirho) != row_chirho["sha256_chirho"]
                            or len(bytes_chirho) != row_chirho["bytes_chirho"]
                        ):
                            raise ValueError("Media changed before archive entry")
                        extension_chirho = (
                            "mp3" if kind_chirho == "word_audio_chirho" else "webp"
                        )
                        hash_chirho = row_chirho["sha256_chirho"]
                        entry_chirho(
                            archive_chirho,
                            f"objects-chirho/{hash_chirho[:2]}-chirho/{hash_chirho}-chirho.{extension_chirho}",
                            bytes_chirho,
                        )
                        completed_chirho += 1
                    if completed_chirho % 256 == 0:
                        print(
                            f"packaged {completed_chirho}/{len(rows_chirho)} {kind_chirho}",
                            flush=True,
                        )
                    if output_file_chirho.tell() >= MAX_ARCHIVE_CHIRHO:
                        raise ValueError("Archive exceeds GitHub per-asset bound")
    with zipfile.ZipFile(partial_chirho) as archive_chirho:
        for info_chirho in archive_chirho.infolist():
            bytes_chirho = archive_chirho.read(info_chirho)
            if (
                info_chirho.filename.startswith("objects-chirho/")
                and sha_chirho(bytes_chirho)
                != Path(info_chirho.filename).name.split("-chirho.")[0]
            ):
                raise ValueError("Packaged object readback differs")
    if partial_chirho.stat().st_size >= MAX_ARCHIVE_CHIRHO:
        raise ValueError("Archive exceeds GitHub per-asset bound")
    partial_chirho.rename(target_chirho)
    digest_chirho = hashlib.sha256()
    with target_chirho.open("rb") as source_chirho:
        for bytes_chirho in iter(lambda: source_chirho.read(1024 * 1024), b""):
            digest_chirho.update(bytes_chirho)
    receipt_chirho = {
        "path_chirho": target_chirho.name,
        "sha256_chirho": digest_chirho.hexdigest(),
        "bytes_chirho": target_chirho.stat().st_size,
        "assets_chirho": len(rows_chirho),
    }
    with (output_chirho / (name_chirho + ".receipt-chirho.json")).open(
        "x"
    ) as receipt_file_chirho:
        json.dump(receipt_chirho, receipt_file_chirho, indent=2)
        receipt_file_chirho.write("\n")
    return receipt_chirho


if __name__ == "__main__":
    parser_chirho = argparse.ArgumentParser(description=__doc__)
    parser_chirho.add_argument("catalogue_chirho", type=Path)
    parser_chirho.add_argument(
        "--kind-chirho",
        choices=(*KINDS_CHIRHO, "catalogue_chirho"),
        default="catalogue_chirho",
    )
    parser_chirho.add_argument("--concurrency-chirho", type=int, default=8)
    parser_chirho.add_argument("--apply-chirho", action="store_true")
    args_chirho = parser_chirho.parse_args()
    if args_chirho.apply_chirho:
        print(
            json.dumps(
                package_chirho(
                    args_chirho.catalogue_chirho,
                    args_chirho.kind_chirho,
                    concurrency_chirho=args_chirho.concurrency_chirho,
                )
            )
        )
    else:
        manifest_chirho, _, _ = plan_chirho(args_chirho.catalogue_chirho)
        print(
            json.dumps(
                {
                    "release_id_chirho": manifest_chirho["release_id_chirho"],
                    "download_plan_chirho": manifest_chirho["download_plan_chirho"],
                    "downloads_chirho": 0,
                }
            )
        )
