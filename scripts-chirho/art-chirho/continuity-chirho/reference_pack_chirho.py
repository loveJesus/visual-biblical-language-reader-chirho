#!/usr/bin/env python3
# For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life. — John 3:16 (KJV)
"""Build a checked artist reference pack; workflow: continuity-chirho/visual-references-chirho.md."""

import argparse as argparse_chirho
import hashlib as hashlib_chirho
import json as json_chirho
from pathlib import Path as PathChirho


def checked_bytes_chirho(root_chirho, relative_chirho, maximum_chirho=16_000_000):
    path_chirho = root_chirho / relative_chirho
    resolved_chirho = path_chirho.resolve()
    if not resolved_chirho.is_relative_to(root_chirho.resolve()):
        raise ValueError("Reference path escapes project")
    if (
        any(
            candidate_chirho.is_symlink()
            for candidate_chirho in (path_chirho, *path_chirho.parents)
            if candidate_chirho.is_relative_to(root_chirho)
        )
        or not path_chirho.is_file()
    ):
        raise ValueError("Reference must be a regular, unlinked file")
    if path_chirho.stat().st_size > maximum_chirho:
        raise ValueError("Reference exceeds byte bound")
    return path_chirho.read_bytes()


def checked_source_chirho(root_chirho, source_chirho):
    raw_chirho = checked_bytes_chirho(root_chirho, source_chirho["source_path_chirho"])
    if (
        hashlib_chirho.sha256(raw_chirho).hexdigest()
        != source_chirho["source_sha256_chirho"]
    ):
        raise ValueError("Reference-pack canonical source changed")
    return json_chirho.loads(raw_chirho)


def setting_binding_chirho(episode_chirho, directions_chirho, references_chirho):
    """Validate a selected setting's place/building/era; unbound places supply no image."""
    identity_chirho = episode_chirho.get("setting_identity_chirho")
    bindings_chirho = [
        row_chirho
        for row_chirho in directions_chirho.get("place_bindings_chirho", [])
        if row_chirho["id_chirho"] == episode_chirho.get("place_id_chirho")
    ]
    setting_ids_chirho = episode_chirho["setting_reference_ids_chirho"]
    if identity_chirho is None:
        if bindings_chirho or any(
            references_chirho[id_chirho].get("setting_identity_chirho")
            for id_chirho in setting_ids_chirho
        ):
            raise ValueError(
                "A period-bound setting needs an explicit episode identity"
            )
        return None
    if (
        not isinstance(identity_chirho, dict)
        or set(identity_chirho)
        != {"place_id_chirho", "building_id_chirho", "era_id_chirho"}
        or any(
            not isinstance(value_chirho, str) or not value_chirho
            for value_chirho in identity_chirho.values()
        )
        or len(bindings_chirho) != 1
    ):
        raise ValueError("Setting identity or selected place binding is invalid")
    binding_chirho = bindings_chirho[0]
    if binding_chirho.get(
        "setting_identity_chirho"
    ) != identity_chirho or binding_chirho.get("binding_status_chirho") not in (
        "reference-bound",
        "unbound",
    ):
        raise ValueError("Selected place/building/era differs from the episode")
    if binding_chirho["binding_status_chirho"] == "unbound":
        if setting_ids_chirho or binding_chirho["existing_reference_ids_chirho"]:
            raise ValueError("An unbound place cannot supply a setting image")
        return binding_chirho
    for id_chirho in setting_ids_chirho:
        if (
            id_chirho not in binding_chirho["existing_reference_ids_chirho"]
            or references_chirho[id_chirho].get("setting_identity_chirho")
            != identity_chirho
        ):
            raise ValueError("Setting reference belongs to another place/building/era")
    return binding_chirho


def wardrobe_anchor_chirho(episode_chirho, role_chirho, reference_chirho):
    """An outfit anchor belongs to this episode's existing scene, never a neutral portrait."""
    anchor_chirho = role_chirho.get("wardrobe_anchor_chirho")
    if anchor_chirho is None:
        return
    if (
        anchor_chirho.get("episode_id_chirho") != episode_chirho.get("id_chirho")
        or anchor_chirho.get("reference_id_chirho")
        != role_chirho["reference_id_chirho"]
        or anchor_chirho.get("reference_sha256_chirho")
        != reference_chirho["sha256_chirho"]
        or reference_chirho.get("kind_chirho") != "existing-scene"
        or not isinstance(anchor_chirho.get("clothing_direction_chirho"), str)
        or not anchor_chirho["clothing_direction_chirho"].strip()
        or not isinstance(anchor_chirho.get("props_chirho"), list)
        or any(
            not isinstance(prop_chirho, str) or not prop_chirho
            for prop_chirho in anchor_chirho["props_chirho"]
        )
    ):
        raise ValueError("Wardrobe anchor is not this episode's exact existing scene")


def build_pack_chirho(root_chirho, lesson_id_chirho):
    data_home_chirho = "data-chirho/art-direction-chirho/"
    registry_raw_chirho = checked_bytes_chirho(
        root_chirho, data_home_chirho + "registry-chirho.json"
    )
    registry_chirho = json_chirho.loads(registry_raw_chirho)
    map_raw_chirho = checked_bytes_chirho(
        root_chirho, data_home_chirho + "proverbs-pericopes-chirho.json"
    )
    map_chirho = json_chirho.loads(map_raw_chirho)
    directions_raw_chirho = checked_bytes_chirho(
        root_chirho, data_home_chirho + "episodes-chirho.json"
    )
    directions_chirho = json_chirho.loads(directions_raw_chirho)
    episode_chirho = next(
        (
            row_chirho
            for row_chirho in directions_chirho["episodes_chirho"]
            if lesson_id_chirho in row_chirho["verse_ids_chirho"]
        ),
        None,
    )
    unit_chirho = None
    units_raw_chirho = b""
    if lesson_id_chirho.startswith("Prov."):
        chapter_number_chirho = int(lesson_id_chirho.split(".")[1])
        chapter_source_chirho = next(
            row_chirho
            for row_chirho in map_chirho["chapters_chirho"]
            if row_chirho["chapter_chirho"] == chapter_number_chirho
        )
        chapter_chirho = checked_source_chirho(root_chirho, chapter_source_chirho)
        verses_chirho = [
            row_chirho["id_chirho"] for row_chirho in chapter_chirho["verses_chirho"]
        ]
        if lesson_id_chirho not in verses_chirho:
            raise ValueError("Lesson is not in the checked source")
        units_raw_chirho = checked_bytes_chirho(
            root_chirho, chapter_source_chirho["units_path_chirho"]
        )
        if (
            hashlib_chirho.sha256(units_raw_chirho).hexdigest()
            != chapter_source_chirho["units_sha256_chirho"]
        ):
            raise ValueError("Reading-unit shard changed")
        for row_chirho in json_chirho.loads(units_raw_chirho)["units_chirho"]:
            if (
                row_chirho["start_chirho"] in verses_chirho
                and row_chirho["end_chirho"] in verses_chirho
            ):
                start_chirho = verses_chirho.index(row_chirho["start_chirho"])
                end_chirho = verses_chirho.index(row_chirho["end_chirho"])
                if lesson_id_chirho in verses_chirho[start_chirho : end_chirho + 1]:
                    unit_chirho = row_chirho
                    break
        if unit_chirho is None:
            raise ValueError("Proverbs lesson has no reading unit")
    elif episode_chirho is not None:
        chapter_chirho = checked_source_chirho(
            root_chirho, episode_chirho["source_chirho"]
        )
    else:
        return None
    verse_chirho = next(
        row_chirho
        for row_chirho in chapter_chirho["verses_chirho"]
        if row_chirho["id_chirho"] == lesson_id_chirho
    )
    references_chirho = []
    roles_chirho = []
    binding_chirho = None
    if episode_chirho is not None:
        checked_source_chirho(root_chirho, episode_chirho["source_chirho"])
        roles_chirho = [
            role_chirho
            for role_chirho in episode_chirho["roles_chirho"]
            if lesson_id_chirho in role_chirho["applicable_verses_chirho"]
        ]
        references_by_id_chirho = {
            row_chirho["id_chirho"]: row_chirho
            for row_chirho in registry_chirho["references_chirho"]
        }
        binding_chirho = setting_binding_chirho(
            episode_chirho, directions_chirho, references_by_id_chirho
        )
        for role_chirho in roles_chirho:
            wardrobe_anchor_chirho(
                episode_chirho,
                role_chirho,
                references_by_id_chirho[role_chirho["reference_id_chirho"]],
            )
        ids_chirho = set(episode_chirho["setting_reference_ids_chirho"])
        ids_chirho.update(
            role_chirho["reference_id_chirho"] for role_chirho in roles_chirho
        )
        for id_chirho in sorted(ids_chirho):
            reference_chirho = next(
                row_chirho
                for row_chirho in registry_chirho["references_chirho"]
                if row_chirho["id_chirho"] == id_chirho
            )
            if reference_chirho["use_chirho"] != "agent-selected-reference":
                raise ValueError(
                    "Unadopted candidate cannot silently become a reference"
                )
            raw_chirho = checked_bytes_chirho(
                root_chirho, reference_chirho["path_chirho"]
            )
            if (
                hashlib_chirho.sha256(raw_chirho).hexdigest()
                != reference_chirho["sha256_chirho"]
            ):
                raise ValueError("Reference image changed")
            references_chirho.append(reference_chirho)
    return {
        "schema_version_chirho": 1,
        "lesson_id_chirho": lesson_id_chirho,
        "canonical_sha256_chirho": hashlib_chirho.sha256(
            verse_chirho["canonical_text_chirho"].encode()
        ).hexdigest(),
        "reading_unit_chirho": unit_chirho,
        "episode_chirho": episode_chirho,
        "active_roles_chirho": roles_chirho,
        "place_binding_chirho": binding_chirho,
        "references_chirho": references_chirho,
        "directions_chirho": [
            "Inspect each supplied image. Preserve recurring identity, the selected age, and the episode's clothes, architecture, props and time progression.",
            "Identity references do not mandate the same clothes across distinct episodes. A setting reference supplies architecture only; do not copy its unrelated people.",
            "A wardrobe_anchor_chirho applies only to its named episode and exact existing scene. Use its clothing and verse-appropriate props; a neutral identity portrait is not an episode outfit. A selected setting must keep the supplied place/building/era identity; an unbound place supplies no substitute architecture.",
            "Use only roles present in this verse or explicitly justified by its narrative context. A named mention, ancestor, quotation, absent person or described object is not automatically on screen.",
            "Standalone Proverbs sayings do not inherit people, place, clothes or events from adjacent sayings. Anonymous story roles stay local and are not renamed as universal-cast people.",
            "These visual conventions are imaginative. Keep source facts, editorial grouping, art choices and unresolved identity/place/age questions distinct.",
        ],
        "metadata_sha256_chirho": hashlib_chirho.sha256(
            registry_raw_chirho
            + map_raw_chirho
            + units_raw_chirho
            + directions_raw_chirho
        ).hexdigest(),
    }


def main_chirho():
    parser_chirho = argparse_chirho.ArgumentParser(description=__doc__)
    parser_chirho.add_argument("lesson_id_chirho")
    parser_chirho.add_argument("output_chirho", type=PathChirho)
    arguments_chirho = parser_chirho.parse_args()
    root_chirho = PathChirho(__file__).resolve().parents[3]
    value_chirho = build_pack_chirho(root_chirho, arguments_chirho.lesson_id_chirho)
    arguments_chirho.output_chirho.parent.mkdir(parents=True, exist_ok=True)
    with arguments_chirho.output_chirho.open("x") as stream_chirho:
        stream_chirho.write(
            json_chirho.dumps(value_chirho, ensure_ascii=False, indent=2) + "\n"
        )
    print(
        json_chirho.dumps(
            {
                "reference_pack_chirho": str(arguments_chirho.output_chirho),
                "mapped_chirho": value_chirho is not None,
            }
        )
    )


def stage_pack_chirho(root_chirho, attempt_chirho, pack_chirho):
    """Copy exact checked images into a new attempt; never rewrite an earlier request."""
    for index_chirho, reference_chirho in enumerate(pack_chirho["references_chirho"]):
        raw_chirho = checked_bytes_chirho(root_chirho, reference_chirho["path_chirho"])
        if (
            hashlib_chirho.sha256(raw_chirho).hexdigest()
            != reference_chirho["sha256_chirho"]
        ):
            raise ValueError("Reference changed before attempt staging")
        suffix_chirho = PathChirho(reference_chirho["path_chirho"]).suffix
        if suffix_chirho not in (".png", ".webp"):
            raise ValueError("Unsupported reference image type")
        target_chirho = (
            attempt_chirho
            / f"continuity-reference-{index_chirho:03d}-chirho{suffix_chirho}"
        )
        with target_chirho.open("xb") as stream_chirho:
            stream_chirho.write(raw_chirho)
        reference_chirho["library_path_chirho"] = reference_chirho["path_chirho"]
        reference_chirho["path_chirho"] = str(target_chirho)
    return pack_chirho


def verify_staged_pack_chirho(attempt_chirho, pack_chirho):
    references_chirho = pack_chirho["references_chirho"]
    if len(references_chirho) > 8:
        raise ValueError("Too many continuity reference images in one attempt")
    for index_chirho, reference_chirho in enumerate(references_chirho):
        path_chirho = PathChirho(reference_chirho["path_chirho"])
        expected_chirho = (
            attempt_chirho
            / f"continuity-reference-{index_chirho:03d}-chirho{path_chirho.suffix}"
        )
        if path_chirho != expected_chirho or path_chirho.suffix not in (
            ".png",
            ".webp",
        ):
            raise ValueError("Staged reference is not owned by this attempt")
        raw_chirho = checked_bytes_chirho(attempt_chirho, str(path_chirho))
        if (
            hashlib_chirho.sha256(raw_chirho).hexdigest()
            != reference_chirho["sha256_chirho"]
        ):
            raise ValueError("Staged continuity reference changed")


if __name__ == "__main__":
    main_chirho()
