# For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life. — John 3:16 (KJV)
"""Exact-base scene overlays; workflow: spec-chirho/workflows-chirho/media-delivery-chirho.md."""

import copy as copy_chirho
import hashlib as hashlib_chirho
import importlib.util as importlib_util_chirho
import json as json_chirho
import re as re_chirho
import stat as stat_chirho
from pathlib import Path as PathChirho

CATALOGUE_CHIRHO = "data-chirho/art-corrections-chirho/catalogue-chirho.json"
MAXIMUM_CHIRHO = 512 * 1024
REMOTE_CHIRHO = None


def object_chirho(value_chirho):
    if not isinstance(value_chirho, dict):
        raise TypeError("Scene correction expected an object")
    return value_chirho


def scene_record_json_chirho(value_chirho):
    """Match JavaScript sorted JSON, retaining exact scalars and safe integer values."""
    if value_chirho is None or isinstance(value_chirho, bool):
        return json_chirho.dumps(value_chirho)
    if isinstance(value_chirho, str):
        value_chirho.encode("utf-8", errors="strict")
        return json_chirho.dumps(value_chirho, ensure_ascii=False)
    if type(value_chirho) is int and abs(value_chirho) <= 2**53 - 1:
        return str(value_chirho)
    if isinstance(value_chirho, list):
        return "[" + ",".join(map(scene_record_json_chirho, value_chirho)) + "]"
    object_chirho(value_chirho)
    return (
        "{"
        + ",".join(
            scene_record_json_chirho(key_chirho)
            + ":"
            + scene_record_json_chirho(value_chirho[key_chirho])
            for key_chirho in sorted(
                value_chirho, key=lambda key_chirho: key_chirho.encode("utf-16-be")
            )
        )
        + "}"
    )


def digest_chirho(value_chirho):
    return hashlib_chirho.sha256(
        scene_record_json_chirho(value_chirho).encode()
    ).hexdigest()


def alias_chirho(row_chirho):
    object_chirho(row_chirho)
    if (
        not isinstance(row_chirho.get("asset_path_chirho"), str)
        or not re_chirho.fullmatch(
            r"/assets-chirho(?:/[a-z0-9][a-z0-9-]*)+\.webp",
            row_chirho["asset_path_chirho"],
        )
        or not isinstance(row_chirho.get("sha256_chirho"), str)
        or not re_chirho.fullmatch(r"[a-f0-9]{64}", row_chirho["sha256_chirho"])
        or any(
            type(row_chirho.get(key_chirho)) is not int
            or not 1 <= row_chirho[key_chirho] <= 4096
            for key_chirho in ("width_chirho", "height_chirho")
        )
        or row_chirho.get("art_review_chirho") not in ("pending", "approved")
    ):
        raise ValueError("Scene correction has invalid scene facts")
    return {
        "kind_chirho": "scene",
        **{
            key_chirho: row_chirho[key_chirho]
            for key_chirho in (
                "asset_path_chirho",
                "sha256_chirho",
                "width_chirho",
                "height_chirho",
                "art_review_chirho",
            )
        },
    }


def parse_chirho(bytes_chirho):
    if len(bytes_chirho) > MAXIMUM_CHIRHO:
        raise ValueError("Scene correction catalogue exceeds its bound")
    catalogue_chirho = object_chirho(json_chirho.loads(bytes_chirho))
    rows_chirho = catalogue_chirho.get("corrections_chirho")
    if (
        type(catalogue_chirho.get("schema_version_chirho")) is not int
        or catalogue_chirho["schema_version_chirho"] != 1
        or set(catalogue_chirho) != {"schema_version_chirho", "corrections_chirho"}
        or not isinstance(rows_chirho, list)
        or len(rows_chirho) > 64
    ):
        raise ValueError("Scene correction catalogue scope differs")
    ids_chirho, targets_chirho, bases_chirho, replacements_chirho = (
        set(),
        set(),
        set(),
        set(),
    )
    fields_chirho = {
        "id_chirho",
        "target_document_chirho",
        "lesson_id_chirho",
        "variant_chirho",
        "content_path_chirho",
        "content_sha256_chirho",
        "canonical_sha256_chirho",
        "base_record_sha256_chirho",
        "base_record_chirho",
        "replacement_record_chirho",
    }
    for row_chirho in rows_chirho:
        object_chirho(row_chirho)
        if (
            set(row_chirho) != fields_chirho
            or not isinstance(row_chirho["id_chirho"], str)
            or len(row_chirho["id_chirho"]) > 128
            or not re_chirho.fullmatch(r"[-a-z0-9]+-chirho", row_chirho["id_chirho"])
            or not isinstance(row_chirho["target_document_chirho"], str)
            or not re_chirho.fullmatch(
                r"data-chirho/media-chirho/[a-z0-9][a-z0-9-]*\.json",
                row_chirho["target_document_chirho"],
            )
            or not isinstance(row_chirho["lesson_id_chirho"], str)
            or not re_chirho.fullmatch(
                r"[A-Za-z0-9]+\.[1-9][0-9]{0,2}\.[1-9][0-9]{0,2}",
                row_chirho["lesson_id_chirho"],
            )
            or row_chirho["variant_chirho"]
            not in ("standard", "representation_reduced")
            or not isinstance(row_chirho["content_path_chirho"], str)
            or not re_chirho.fullmatch(
                r"/content-chirho/[a-z0-9-]+/chapter-[0-9]{2,3}-chirho\.json",
                row_chirho["content_path_chirho"],
            )
            or any(
                not isinstance(row_chirho[key_chirho], str)
                or not re_chirho.fullmatch(r"[a-f0-9]{64}", row_chirho[key_chirho])
                for key_chirho in (
                    "content_sha256_chirho",
                    "canonical_sha256_chirho",
                    "base_record_sha256_chirho",
                )
            )
        ):
            raise ValueError("Scene correction target binding differs")
        base_chirho, replacement_chirho = (
            object_chirho(row_chirho["base_record_chirho"]),
            object_chirho(row_chirho["replacement_record_chirho"]),
        )
        alias_chirho(base_chirho)
        alias_chirho(replacement_chirho)
        if (
            digest_chirho(base_chirho) != row_chirho["base_record_sha256_chirho"]
            or replacement_chirho["art_review_chirho"] != "pending"
            or base_chirho["asset_path_chirho"]
            == replacement_chirho["asset_path_chirho"]
            or base_chirho["sha256_chirho"] == replacement_chirho["sha256_chirho"]
        ):
            raise ValueError("Scene correction base digest/replacement differs")
        for scene_chirho in (base_chirho, replacement_chirho):
            binding_chirho = object_chirho(scene_chirho.get("source_binding_chirho"))
            if (
                scene_chirho.get("lesson_id_chirho") != row_chirho["lesson_id_chirho"]
                or scene_chirho.get("variant_chirho", "standard")
                != row_chirho["variant_chirho"]
                or scene_chirho.get("fallback_chirho") is True
                or any(
                    binding_chirho.get(key_chirho) != row_chirho[key_chirho]
                    for key_chirho in (
                        "content_path_chirho",
                        "content_sha256_chirho",
                        "canonical_sha256_chirho",
                    )
                )
            ):
                raise ValueError("Scene correction crosses target/source/fallback")
        target_chirho = (row_chirho["lesson_id_chirho"], row_chirho["variant_chirho"])
        if (
            row_chirho["id_chirho"] in ids_chirho
            or target_chirho in targets_chirho
            or base_chirho["asset_path_chirho"] in bases_chirho
            or replacement_chirho["asset_path_chirho"] in replacements_chirho
        ):
            raise ValueError("Duplicate scene correction")
        ids_chirho.add(row_chirho["id_chirho"])
        targets_chirho.add(target_chirho)
        bases_chirho.add(base_chirho["asset_path_chirho"])
        replacements_chirho.add(replacement_chirho["asset_path_chirho"])
    if bases_chirho & replacements_chirho:
        raise ValueError("Scene correction chains are not supported")
    return rows_chirho


def bounded_chirho(root_chirho, relative_chirho, maximum_chirho, optional_chirho=False):
    path_chirho = root_chirho / relative_chirho
    try:
        info_chirho = path_chirho.lstat()
    except FileNotFoundError:
        if optional_chirho:
            return None
        raise
    if (
        not stat_chirho.S_ISREG(info_chirho.st_mode)
        or info_chirho.st_size > maximum_chirho
        or path_chirho.parent.resolve() != path_chirho.parent
    ):
        raise ValueError(
            "Scene correction input is not a bounded contained regular file"
        )
    bytes_chirho = path_chirho.read_bytes()
    if len(bytes_chirho) > maximum_chirho:
        raise ValueError("Scene correction input grew beyond its bound")
    return bytes_chirho


def source_chirho(root_chirho, row_chirho):
    relative_chirho = "static" + row_chirho["content_path_chirho"]
    bytes_chirho = bounded_chirho(root_chirho, relative_chirho, 4 * 1024**2)
    if (
        hashlib_chirho.sha256(bytes_chirho).hexdigest()
        != row_chirho["content_sha256_chirho"]
    ):
        raise ValueError("Scene correction canonical source bytes changed")
    chapter_chirho = object_chirho(json_chirho.loads(bytes_chirho))
    book_chirho, number_chirho, _verse_chirho = row_chirho["lesson_id_chirho"].split(
        "."
    )
    verses_chirho = [
        verse_chirho
        for verse_chirho in chapter_chirho.get("verses_chirho", [])
        if object_chirho(verse_chirho).get("id_chirho")
        == row_chirho["lesson_id_chirho"]
    ]
    if (
        chapter_chirho.get("book_id_chirho") != book_chirho
        or type(chapter_chirho.get("chapter_chirho")) is not int
        or chapter_chirho.get("chapter_chirho") != int(number_chirho)
        or len(verses_chirho) != 1
        or not isinstance(verses_chirho[0].get("canonical_text_chirho"), str)
        or hashlib_chirho.sha256(
            verses_chirho[0]["canonical_text_chirho"].encode()
        ).hexdigest()
        != row_chirho["canonical_sha256_chirho"]
    ):
        raise ValueError("Scene correction canonical verse identity changed")
    manifest_path_chirho = re_chirho.sub(
        r"chapter-[0-9]{2,3}-chirho\.json$", "manifest-chirho.json", relative_chirho
    )
    manifest_chirho = object_chirho(
        json_chirho.loads(bounded_chirho(root_chirho, manifest_path_chirho, 1024**2))
    )
    entries_chirho = [
        entry_chirho
        for entry_chirho in manifest_chirho.get("chapters_chirho", [])
        if type(object_chirho(entry_chirho).get("number_chirho")) is int
        and entry_chirho.get("number_chirho") == int(number_chirho)
    ]
    if (
        manifest_chirho.get("book_id_chirho") != book_chirho
        or len(entries_chirho) != 1
        or entries_chirho[0].get("path_chirho") != row_chirho["content_path_chirho"]
        or entries_chirho[0].get("sha256_chirho") != row_chirho["content_sha256_chirho"]
    ):
        raise ValueError("Scene correction source manifest binding changed")


def correction_signature_chirho(root_chirho):
    bytes_chirho = bounded_chirho(
        PathChirho(root_chirho).resolve(strict=True),
        CATALOGUE_CHIRHO,
        MAXIMUM_CHIRHO,
        optional_chirho=True,
    )
    return (
        hashlib_chirho.sha256(bytes_chirho).hexdigest()
        if bytes_chirho is not None
        else None
    )


def delivered_chirho(root_chirho, row_chirho):
    global REMOTE_CHIRHO
    if REMOTE_CHIRHO is None:
        path_chirho = (
            PathChirho(__file__).resolve().parents[2]
            / "publish-chirho/r2-chirho/remote_artwork_chirho.py"
        )
        spec_chirho = importlib_util_chirho.spec_from_file_location(
            "scene_correction_remote_chirho", path_chirho
        )
        REMOTE_CHIRHO = importlib_util_chirho.module_from_spec(spec_chirho)
        spec_chirho.loader.exec_module(REMOTE_CHIRHO)
    proof_chirho = REMOTE_CHIRHO.source_fact_chirho(root_chirho, row_chirho, "scene")
    if (
        proof_chirho is None
        or proof_chirho["matched_fact_chirho"] != proof_chirho["source_chirho"]
    ):
        raise ValueError(
            "Scene correction materialization lacks exact source archive proof"
        )
    return {
        **row_chirho,
        **{
            key_chirho: proof_chirho["delivery_chirho"][key_chirho]
            for key_chirho in ("sha256_chirho", "width_chirho", "height_chirho")
        },
    }


def read_effective_media_documents_chirho(root_chirho):
    root_chirho = PathChirho(root_chirho).resolve(strict=True)
    bytes_chirho = bounded_chirho(
        root_chirho, CATALOGUE_CHIRHO, MAXIMUM_CHIRHO, optional_chirho=True
    )
    corrections_chirho = parse_chirho(bytes_chirho) if bytes_chirho is not None else []
    names_chirho = sorted((root_chirho / "data-chirho/media-chirho").glob("*.json"))
    if len(names_chirho) > 256:
        raise ValueError("Scene correction manifest scope needs cold retirement")
    documents_chirho = []
    for path_chirho in names_chirho:
        if not re_chirho.fullmatch(r"[a-z0-9][a-z0-9-]*\.json", path_chirho.name):
            raise ValueError("Scene correction invalid media filename")
        documents_chirho.append(
            {
                "name_chirho": path_chirho.name,
                "document_chirho": json_chirho.loads(
                    bounded_chirho(
                        root_chirho,
                        str(path_chirho.relative_to(root_chirho)),
                        64 * 1024**2,
                    )
                ),
            }
        )
    retained_chirho = []
    for correction_chirho in corrections_chirho:
        source_chirho(root_chirho, correction_chirho)
        matching_chirho = [
            document_chirho
            for document_chirho in documents_chirho
            if "data-chirho/media-chirho/" + document_chirho["name_chirho"]
            == correction_chirho["target_document_chirho"]
        ]
        scenes_chirho = (
            matching_chirho[0]["document_chirho"].get("scenes_chirho")
            if matching_chirho
            else None
        )
        if (
            not matching_chirho
            or type(matching_chirho[0]["document_chirho"].get("schema_version_chirho"))
            is not int
            or matching_chirho[0]["document_chirho"]["schema_version_chirho"] != 1
            or not isinstance(scenes_chirho, list)
        ):
            raise TypeError("Scene correction target document is absent/malformed")
        positions_chirho = [
            index_chirho
            for index_chirho, scene_chirho in enumerate(scenes_chirho)
            if object_chirho(scene_chirho).get("lesson_id_chirho")
            == correction_chirho["lesson_id_chirho"]
            and scene_chirho.get("variant_chirho", "standard")
            == correction_chirho["variant_chirho"]
        ]
        if len(positions_chirho) != 1:
            raise ValueError("Scene correction target scene is absent/repeated")
        index_chirho = positions_chirho[0]
        base_chirho, replacement_chirho = (
            correction_chirho["base_record_chirho"],
            correction_chirho["replacement_record_chirho"],
        )
        for candidate_document_chirho in documents_chirho:
            for candidate_index_chirho, candidate_scene_chirho in enumerate(
                candidate_document_chirho["document_chirho"].get("scenes_chirho", [])
            ):
                if object_chirho(candidate_scene_chirho).get(
                    "asset_path_chirho"
                ) == replacement_chirho["asset_path_chirho"] and (
                    candidate_document_chirho is not matching_chirho[0]
                    or candidate_index_chirho != index_chirho
                ):
                    raise ValueError(
                        "Scene correction replacement asset belongs to another scene"
                    )
        materialized_chirho = False
        if scene_record_json_chirho(
            scenes_chirho[index_chirho]
        ) == scene_record_json_chirho(base_chirho):
            scenes_chirho[index_chirho] = copy_chirho.deepcopy(replacement_chirho)
        elif scene_record_json_chirho(
            scenes_chirho[index_chirho]
        ) != scene_record_json_chirho(replacement_chirho):
            if scene_record_json_chirho(
                scenes_chirho[index_chirho]
            ) != scene_record_json_chirho(
                delivered_chirho(root_chirho, replacement_chirho)
            ):
                raise ValueError("Scene correction exact base/replacement changed")
            materialized_chirho = True
        retained_chirho.append(
            delivered_chirho(root_chirho, base_chirho)
            if materialized_chirho
            else copy_chirho.deepcopy(base_chirho)
        )
    return {
        "documents_chirho": documents_chirho,
        "retained_scenes_chirho": retained_chirho,
        "retained_aliases_chirho": [
            alias_chirho(row_chirho) for row_chirho in retained_chirho
        ],
        "corrections_sha256_chirho": hashlib_chirho.sha256(bytes_chirho).hexdigest()
        if bytes_chirho is not None
        else None,
    }
