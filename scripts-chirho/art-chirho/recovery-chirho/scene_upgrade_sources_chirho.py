# For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life. — John 3:16 (KJV)
"""Source inventory and priority for scene-upgrades-chirho.md; no image requests."""

import hashlib as hashlib_chirho
import json as json_chirho
import os as os_chirho
import stat as stat_chirho
from pathlib import Path as PathChirho

HOME_CHIRHO = PathChirho(
    "workspace-chirho/art-chirho/queue-chirho/high-quality-scenes-chirho"
)
CATALOGUE_CHIRHO = PathChirho(
    "data-chirho/media-chirho/bible-high-quality-scenes-chirho.json"
)
BOOKS_CHIRHO = PathChirho("config-chirho/bible-chirho/books-chirho.json")
COMPLETED_CHIRHO = {"Gen", "Prov", "John"}
MAX_SCENES_CHIRHO = 32_000
MAX_CHAPTER_CHIRHO = 4 * 1024**2


def sha_chirho(bytes_chirho):
    return hashlib_chirho.sha256(bytes_chirho).hexdigest()


def read_chirho(path_chirho, maximum_chirho=64 * 1024**2):
    info_chirho = path_chirho.lstat()
    if (
        not stat_chirho.S_ISREG(info_chirho.st_mode)
        or info_chirho.st_size > maximum_chirho
    ):
        raise ValueError("Scene input is oversized, linked or not regular")
    bytes_chirho = path_chirho.read_bytes()
    if len(bytes_chirho) > maximum_chirho:
        raise ValueError("Scene input grew beyond its bound")
    return json_chirho.loads(bytes_chirho)


def write_chirho(path_chirho, value_chirho):
    path_chirho.parent.mkdir(parents=True, exist_ok=True)
    bytes_chirho = (
        json_chirho.dumps(value_chirho, ensure_ascii=False, indent="\t") + "\n"
    ).encode()
    if len(bytes_chirho) > 64 * 1024**2:
        raise ValueError("Scene catalogue needs cold sharding")
    temporary_chirho = path_chirho.with_name(path_chirho.name + ".new-chirho")
    with temporary_chirho.open("wb") as stream_chirho:
        stream_chirho.write(bytes_chirho)
        stream_chirho.flush()
        os_chirho.fsync(stream_chirho.fileno())
    os_chirho.replace(temporary_chirho, path_chirho)
    descriptor_chirho = os_chirho.open(path_chirho.parent, os_chirho.O_RDONLY)
    try:
        os_chirho.fsync(descriptor_chirho)
    finally:
        os_chirho.close(descriptor_chirho)


def priority_chirho(books_chirho):
    ready_chirho = [
        row_chirho
        for row_chirho in books_chirho
        if row_chirho["id_chirho"] not in COMPLETED_CHIRHO
    ]
    return (
        [
            row_chirho
            for row_chirho in ready_chirho
            if row_chirho["testament_chirho"] == "new"
        ]
        + [row_chirho for row_chirho in ready_chirho if row_chirho["id_chirho"] == "Ps"]
        + [
            row_chirho
            for row_chirho in ready_chirho
            if row_chirho["testament_chirho"] == "old"
            and row_chirho["id_chirho"] != "Ps"
        ]
    )


def completed_ids_chirho(root_chirho):
    result_chirho = {"Prov.26.1"}
    for name_chirho in [
        "proverbs-scenes-chirho.json",
        "proverbs-worker-scenes-chirho.json",
        "john-worker-scenes-chirho.json",
        "genesis-worker-scenes-chirho.json",
    ]:
        for row_chirho in read_chirho(
            root_chirho / "data-chirho/media-chirho" / name_chirho
        )["scenes_chirho"]:
            if row_chirho.get("variant_chirho", "standard") != "standard":
                continue
            if row_chirho["lesson_id_chirho"].split(".")[0] not in COMPLETED_CHIRHO:
                raise ValueError("Completed high-quality catalogue names another book")
            if (
                row_chirho.get("tool_chirho", "image_gen.imagegen")
                != "image_gen.imagegen"
            ):
                raise ValueError("A completed scene is not from the built-in generator")
            result_chirho.add(row_chirho["lesson_id_chirho"])
    return result_chirho


def freeze_chirho(root_chirho):
    registry_bytes_chirho = (root_chirho / BOOKS_CHIRHO).read_bytes()
    books_chirho = read_chirho(root_chirho / BOOKS_CHIRHO)["books_chirho"]
    if (
        len(books_chirho) != 66
        or len({row_chirho["id_chirho"] for row_chirho in books_chirho}) != 66
    ):
        raise ValueError("Whole-canon book registry differs")
    manifests_chirho = {}
    expected_completed_chirho = set()
    total_chirho = 0
    for book_chirho in books_chirho:
        relative_chirho = (
            f"static/content-chirho/{book_chirho['slug_chirho']}/manifest-chirho.json"
        )
        bytes_chirho = (root_chirho / relative_chirho).read_bytes()
        manifest_chirho = read_chirho(root_chirho / relative_chirho, MAX_CHAPTER_CHIRHO)
        if (
            manifest_chirho["book_id_chirho"] != book_chirho["id_chirho"]
            or len(manifest_chirho["chapters_chirho"])
            != book_chirho["chapter_count_chirho"]
        ):
            raise ValueError("Source book manifest differs")
        manifests_chirho[book_chirho["id_chirho"]] = {
            "path_chirho": relative_chirho,
            "sha256_chirho": sha_chirho(bytes_chirho),
        }
        for chapter_chirho in manifest_chirho["chapters_chirho"]:
            if book_chirho["id_chirho"] in COMPLETED_CHIRHO:
                numbers_chirho = chapter_chirho.get(
                    "verse_numbers_chirho",
                    list(range(1, chapter_chirho["verse_count_chirho"] + 1)),
                )
                expected_completed_chirho.update(
                    f"{book_chirho['id_chirho']}.{chapter_chirho['number_chirho']}.{number_chirho}"
                    for number_chirho in numbers_chirho
                )
            else:
                total_chirho += chapter_chirho["verse_count_chirho"]
    if expected_completed_chirho != completed_ids_chirho(root_chirho):
        raise ValueError("Existing high-quality scene set is incomplete")
    if total_chirho > MAX_SCENES_CHIRHO:
        raise ValueError("High-quality scene plan exceeds its bounded canon scope")
    value_chirho = {
        "schema_version_chirho": 1,
        "authority_chirho": "L.J., 2026-11-06: continue background high-quality scenes, New Testament then Psalms then remaining Old Testament",
        "registry_sha256_chirho": sha_chirho(registry_bytes_chirho),
        "books_chirho": priority_chirho(books_chirho),
        "source_manifests_chirho": manifests_chirho,
        "total_chirho": total_chirho,
        "preserved_high_quality_chirho": len(expected_completed_chirho),
        "provider_chirho": "built-in image_gen.imagegen only",
        "maximum_concurrency_chirho": 3,
        "maximum_attempts_per_verse_chirho": 1,
    }
    path_chirho = root_chirho / HOME_CHIRHO / "inventory-chirho.json"
    if path_chirho.exists():
        if read_chirho(path_chirho) != value_chirho:
            raise ValueError("Frozen high-quality scene inventory differs")
    else:
        write_chirho(path_chirho, value_chirho)
    return value_chirho


def chapter_jobs_chirho(root_chirho, inventory_chirho, book_chirho, entry_chirho):
    if (
        sha_chirho((root_chirho / BOOKS_CHIRHO).read_bytes())
        != inventory_chirho["registry_sha256_chirho"]
    ):
        raise ValueError("Book registry changed after the scene plan")
    manifest_pin_chirho = inventory_chirho["source_manifests_chirho"][
        book_chirho["id_chirho"]
    ]
    if (
        sha_chirho((root_chirho / manifest_pin_chirho["path_chirho"]).read_bytes())
        != manifest_pin_chirho["sha256_chirho"]
    ):
        raise ValueError("Pinned source manifest changed")
    expected_path_chirho = f"/content-chirho/{book_chirho['slug_chirho']}/chapter-{entry_chirho['number_chirho']:02d}-chirho.json"
    if entry_chirho["path_chirho"] != expected_path_chirho:
        raise ValueError("Scene chapter path differs")
    path_chirho = root_chirho / "static" / expected_path_chirho.lstrip("/")
    chapter_chirho = read_chirho(path_chirho, MAX_CHAPTER_CHIRHO)
    if (
        sha_chirho(path_chirho.read_bytes()) != entry_chirho["sha256_chirho"]
        or chapter_chirho["book_id_chirho"] != book_chirho["id_chirho"]
        or chapter_chirho["chapter_chirho"] != entry_chirho["number_chirho"]
    ):
        raise ValueError("Canonical source chapter differs")
    rows_chirho = chapter_chirho["verses_chirho"]
    numbers_chirho = entry_chirho.get(
        "verse_numbers_chirho", list(range(1, entry_chirho["verse_count_chirho"] + 1))
    )
    if [row_chirho["id_chirho"] for row_chirho in rows_chirho] != [
        f"{book_chirho['id_chirho']}.{entry_chirho['number_chirho']}.{number_chirho}"
        for number_chirho in numbers_chirho
    ]:
        raise ValueError("Source verse identities differ")
    return [
        {
            "id_chirho": row_chirho["id_chirho"],
            "reference_chirho": row_chirho["reference_chirho"],
            "canonical_text_chirho": row_chirho["canonical_text_chirho"],
            "canonical_sha256_chirho": sha_chirho(
                row_chirho["canonical_text_chirho"].encode()
            ),
            "content_path_chirho": expected_path_chirho,
            "content_sha256_chirho": entry_chirho["sha256_chirho"],
            "chapter_chirho": entry_chirho["number_chirho"],
            "verse_chirho": number_chirho,
            "slug_chirho": book_chirho["slug_chirho"],
        }
        for row_chirho, number_chirho in zip(rows_chirho, numbers_chirho, strict=True)
    ]


def mark_fallback_chirho(root_chirho):
    path_chirho = (
        root_chirho / "data-chirho/media-chirho/mark-worker-scenes-chirho.json"
    )
    bytes_chirho = path_chirho.read_bytes()
    document_chirho = read_chirho(path_chirho)
    if any(
        row_chirho.get("tool_chirho") not in {"runware", "local_mflux"}
        or "schnell" not in row_chirho.get("model_chirho", "").lower()
        and row_chirho.get("model_chirho") != "runware:100@1"
        or row_chirho.get("art_review_chirho") != "pending"
        for row_chirho in document_chirho["scenes_chirho"]
    ):
        raise ValueError("Only pending Schnell Mark scenes can become fallbacks")
    if all(
        row_chirho.get("fallback_chirho") is True
        for row_chirho in document_chirho["scenes_chirho"]
    ):
        return False
    backup_chirho = root_chirho / HOME_CHIRHO / "mark-original-catalogue-chirho.json"
    if backup_chirho.exists():
        if backup_chirho.read_bytes() != bytes_chirho:
            raise ValueError("Mark fallback migration needs reconciliation")
    else:
        backup_chirho.parent.mkdir(parents=True, exist_ok=True)
        with backup_chirho.open("xb") as stream_chirho:
            stream_chirho.write(bytes_chirho)
            stream_chirho.flush()
            os_chirho.fsync(stream_chirho.fileno())
    for row_chirho in document_chirho["scenes_chirho"]:
        row_chirho["fallback_chirho"] = True
    write_chirho(path_chirho, document_chirho)
    write_chirho(
        root_chirho / HOME_CHIRHO / "mark-fallback-migration-chirho.json",
        {
            "original_sha256_chirho": sha_chirho(bytes_chirho),
            "fallback_sha256_chirho": sha_chirho(path_chirho.read_bytes()),
            "records_chirho": len(document_chirho["scenes_chirho"]),
            "changed_field_chirho": "fallback_chirho only",
        },
    )
    return True
