# For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life. — John 3:16 (KJV)
"""Small checked remote artwork facts for offline source/recovery scripts; never generates."""

import hashlib
import json
import re
from pathlib import Path

HOME_CHIRHO = Path("data-chirho/delivery-chirho/artwork-chirho")
SHA_CHIRHO = re.compile(r"[a-f0-9]{64}")
CACHE_CHIRHO = {}


def catalogue_chirho(root_chirho):
    root_chirho = Path(root_chirho).resolve(strict=True)
    index_chirho = root_chirho / HOME_CHIRHO / "index-chirho.json"
    if not index_chirho.exists():
        return None
    state_chirho = index_chirho.stat()
    signature_chirho = (state_chirho.st_mtime_ns, state_chirho.st_size)
    saved_chirho = CACHE_CHIRHO.get(str(index_chirho))
    if saved_chirho is not None and saved_chirho[0] == signature_chirho:
        return saved_chirho[1]
    if state_chirho.st_size > 128 * 1024:
        raise ValueError("Remote artwork index oversized")
    document_chirho = json.loads(index_chirho.read_bytes())
    shards_chirho = document_chirho.get("shards_chirho")
    if (
        document_chirho.get("schema_version_chirho") != 1
        or document_chirho.get("bucket_chirho") != "hinneh-media-chirho"
        or not isinstance(shards_chirho, list)
        or len(shards_chirho) > 256
    ):
        raise ValueError("Remote artwork index scope differs")
    result_chirho, delivered_chirho, seen_chirho = {}, {}, set()
    for shard_chirho in shards_chirho:
        relative_chirho = shard_chirho.get("path_chirho", "")
        if (
            not re.fullmatch(r"objects-chirho/[a-f0-9]{2}-chirho\.json", relative_chirho)
            or relative_chirho in seen_chirho
        ):
            raise ValueError("Remote artwork shard path differs")
        seen_chirho.add(relative_chirho)
        path_chirho = root_chirho / HOME_CHIRHO / relative_chirho
        bytes_chirho = path_chirho.read_bytes()
        if len(bytes_chirho) > 2 * 1024**2 or hashlib.sha256(
            bytes_chirho
        ).hexdigest() != shard_chirho.get("sha256_chirho"):
            raise ValueError("Remote artwork shard checksum differs")
        data_chirho = json.loads(bytes_chirho)
        rows_chirho = data_chirho.get("entries_chirho")
        if (
            data_chirho.get("schema_version_chirho") != 1
            or not isinstance(rows_chirho, list)
            or len(rows_chirho) != shard_chirho.get("entries_chirho")
        ):
            raise ValueError("Remote artwork shard count differs")
        for row_chirho in rows_chirho:
            source_chirho, delivery_chirho = (
                row_chirho.get("source_chirho", {}),
                row_chirho.get("delivery_chirho", {}),
            )
            kind_chirho = row_chirho.get("kind_chirho")
            if kind_chirho not in ("scene", "icon"):
                raise ValueError("Remote artwork kind differs")
            for fact_chirho in (source_chirho, delivery_chirho):
                sha_chirho = fact_chirho.get("sha256_chirho", "")
                if (
                    not SHA_CHIRHO.fullmatch(sha_chirho)
                    or fact_chirho.get("key_chirho")
                    != f"media-chirho/sha256-chirho/{sha_chirho}.webp"
                    or any(
                        type(fact_chirho.get(field_chirho)) is not int
                        or fact_chirho[field_chirho] <= 0
                        for field_chirho in ("bytes_chirho", "width_chirho", "height_chirho")
                    )
                    or type(fact_chirho.get("lossy_chirho")) is not bool
                    or not isinstance(fact_chirho.get("verified_at_chirho"), str)
                ):
                    raise ValueError("Remote artwork proof differs")
            if (
                not delivery_chirho["lossy_chirho"]
                or delivery_chirho["bytes_chirho"] > 2 * 1024**2
                or not relative_chirho.startswith(
                    f"objects-chirho/{source_chirho['sha256_chirho'][:2]}-"
                )
                or (
                    max(delivery_chirho["width_chirho"], delivery_chirho["height_chirho"]) > 128
                    if kind_chirho == "icon"
                    else delivery_chirho["width_chirho"] > 1200
                )
            ):
                raise ValueError("Remote artwork delivery differs")
            key_chirho = (kind_chirho, source_chirho["sha256_chirho"])
            if key_chirho in result_chirho:
                raise ValueError("Remote artwork identity repeated")
            result_chirho[key_chirho] = row_chirho
            delivery_key_chirho = (kind_chirho, delivery_chirho["sha256_chirho"])
            delivered_chirho.setdefault(delivery_key_chirho, []).append(row_chirho)
    if len(result_chirho) != document_chirho.get("entry_count_chirho"):
        raise ValueError("Remote artwork index count differs")
    CACHE_CHIRHO[str(index_chirho)] = (signature_chirho, result_chirho, delivered_chirho)
    return result_chirho


def source_fact_chirho(root_chirho, record_chirho, kind_chirho=None):
    records_chirho = catalogue_chirho(root_chirho)
    if records_chirho is None:
        return None
    if kind_chirho is None:
        matches_chirho = [
            row_chirho
            for candidate_kind_chirho in ("scene", "icon")
            if (
                row_chirho := records_chirho.get(
                    (candidate_kind_chirho, record_chirho["sha256_chirho"])
                )
            )
            and record_chirho["asset_path_chirho"] in row_chirho["source_paths_chirho"]
        ]
        if len(matches_chirho) > 1:
            raise ValueError("Remote artwork kind is not unique")
        row_chirho = matches_chirho[0] if matches_chirho else None
    else:
        row_chirho = records_chirho.get((kind_chirho, record_chirho["sha256_chirho"]))
    fact_chirho = row_chirho.get("source_chirho") if row_chirho else None
    if row_chirho is None:
        index_chirho = str(Path(root_chirho).resolve() / HOME_CHIRHO / "index-chirho.json")
        delivered_chirho = CACHE_CHIRHO[index_chirho][2]
        matches_chirho = [
            candidate_chirho
            for candidate_kind_chirho in ((kind_chirho,) if kind_chirho else ("scene", "icon"))
            for candidate_chirho in delivered_chirho.get(
                (candidate_kind_chirho, record_chirho["sha256_chirho"]), []
            )
            if record_chirho["asset_path_chirho"] in candidate_chirho["source_paths_chirho"]
        ]
        if len(matches_chirho) == 1:
            row_chirho = matches_chirho[0]
            fact_chirho = row_chirho["delivery_chirho"]
    if (
        row_chirho is None
        or record_chirho["asset_path_chirho"] not in row_chirho["source_paths_chirho"]
        or any(
            fact_chirho[field_chirho] != record_chirho[field_chirho]
            for field_chirho in ("width_chirho", "height_chirho", "sha256_chirho")
        )
    ):
        raise ValueError("Artwork lacks its exact verified remote source")
    return {**row_chirho, "matched_fact_chirho": fact_chirho}
