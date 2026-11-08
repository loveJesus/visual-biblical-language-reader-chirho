#!/usr/bin/env python3
# For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life. — John 3:16 (KJV)
"""Index pinned people/place data for art research, without importing biographies or images."""

import argparse as argparse_chirho
import hashlib as hashlib_chirho
import json as json_chirho
import re as re_chirho
from pathlib import Path as PathChirho

HEADER_CHIRHO = re_chirho.compile(r"^[^\t@]+@[A-Za-z0-9.?()-]+=[HG]\d+[A-Z]?")
REFERENCE_CHIRHO = re_chirho.compile(r"\b([1-3]?[A-Z][a-z]{1,3})\.(\d+)\.(\d+)[a-z]?\b")


def index_people_chirho(path_chirho):
    people_chirho = []
    current_chirho = None
    for line_chirho in path_chirho.read_text().splitlines():
        fields_chirho = line_chirho.split("\t")
        if HEADER_CHIRHO.match(fields_chirho[0]):
            current_chirho = None
            if len(fields_chirho) > 8 and fields_chirho[8] in ("Male", "Female"):
                current_chirho = {
                    "source_id_chirho": fields_chirho[0],
                    "name_chirho": fields_chirho[0].split("@")[0],
                    "sex_chirho": fields_chirho[8],
                    "mentions_chirho": set(),
                    "alias_forms_chirho": set(),
                }
                people_chirho.append(current_chirho)
        elif (
            current_chirho is not None
            and fields_chirho[0].startswith("– ")
            and fields_chirho[0] != "– Total"
            and len(fields_chirho) > 4
        ):
            current_chirho["alias_forms_chirho"].add(fields_chirho[3])
            for match_chirho in REFERENCE_CHIRHO.finditer(fields_chirho[4]):
                current_chirho["mentions_chirho"].add(".".join(match_chirho.groups()))
    for person_chirho in people_chirho:
        mentions_chirho = sorted(person_chirho["mentions_chirho"])
        person_chirho["mentions_chirho"] = mentions_chirho
        person_chirho["alias_forms_chirho"] = sorted(
            person_chirho["alias_forms_chirho"]
        )
        chapters_chirho = {
            ".".join(ref_chirho.split(".")[:2]) for ref_chirho in mentions_chirho
        }
        person_chirho["distinct_chapters_chirho"] = len(chapters_chirho)
        person_chirho["cross_chapter_candidate_chirho"] = len(chapters_chirho) > 1
        person_chirho["scope_note_chirho"] = (
            "Named mentions, not appearances or pericopes. Cross-chapter is a triage candidate only. "
            "English-source numbering and ambiguous identities require local source checking. "
            "A mention may be genealogy, quotation or reference to an absent person."
        )
    return people_chirho


def index_places_chirho(path_chirho):
    places_chirho = []
    for line_chirho in path_chirho.read_text().splitlines():
        original_chirho = json_chirho.loads(line_chirho)
        places_chirho.append(
            {
                "source_id_chirho": original_chirho["id"],
                "name_chirho": original_chirho["friendly_id"],
                "types_chirho": original_chirho.get("types", []),
                "mentions_chirho": sorted(
                    {
                        verse_chirho["osis"]
                        for verse_chirho in original_chirho.get("verses", [])
                    }
                ),
                "identification_candidates_chirho": [
                    {
                        "description_chirho": identification_chirho.get("description"),
                        "confidence_tags_chirho": identification_chirho.get("tags", {}),
                    }
                    for identification_chirho in original_chirho.get(
                        "identifications", []
                    )
                ],
                "scope_note_chirho": (
                    "Place identity/mentions only. Building, room, historical period and actual "
                    "scene presence need a separate source-checked art binding. No map geometry "
                    "or third-party thumbnail is imported."
                ),
            }
        )
    return places_chirho


def main_chirho():
    parser_chirho = argparse_chirho.ArgumentParser(description=__doc__)
    parser_chirho.add_argument("source_home_chirho", type=PathChirho)
    parser_chirho.add_argument("output_home_chirho", type=PathChirho)
    arguments_chirho = parser_chirho.parse_args()
    home_chirho = arguments_chirho.source_home_chirho
    records_chirho = json_chirho.loads(
        (home_chirho / "sources-chirho.json").read_text()
    )
    for record_chirho in records_chirho:
        path_chirho = PathChirho(record_chirho["path_chirho"])
        if (
            path_chirho.is_symlink()
            or not path_chirho.is_file()
            or path_chirho.stat().st_size > 32_000_000
            or hashlib_chirho.sha256(path_chirho.read_bytes()).hexdigest()
            != record_chirho["sha256_chirho"]
        ):
            raise ValueError("Pinned upstream source differs")
    people_chirho = index_people_chirho(home_chirho / "tipnr-original-chirho.txt")
    places_chirho = index_places_chirho(
        home_chirho / "openbible-ancient-original-chirho.jsonl"
    )
    output_chirho = arguments_chirho.output_home_chirho
    output_chirho.mkdir(parents=True, exist_ok=False)
    for name_chirho, value_chirho, attribution_chirho in (
        (
            "people-chirho",
            people_chirho,
            "STEP Bible, https://www.STEPBible.org, CC BY 4.0",
        ),
        (
            "places-chirho",
            places_chirho,
            "OpenBible.info Bible Geocoding Data, CC BY 4.0",
        ),
    ):
        (output_chirho / f"{name_chirho}.json").write_text(
            json_chirho.dumps(
                {
                    "schema_version_chirho": 1,
                    "attribution_chirho": attribution_chirho,
                    "license_chirho": "CC-BY-4.0",
                    "changes_chirho": "Extracted IDs, names, aliases, mentions and place uncertainty; biographies, geometry and images omitted.",
                    "sources_chirho": records_chirho,
                    "records_chirho": value_chirho,
                },
                ensure_ascii=False,
                separators=(",", ":"),
            )
            + "\n"
        )
    print(
        json_chirho.dumps(
            {
                "people_chirho": len(people_chirho),
                "cross_chapter_candidates_chirho": sum(
                    person_chirho["cross_chapter_candidate_chirho"]
                    for person_chirho in people_chirho
                ),
                "places_chirho": len(places_chirho),
            }
        )
    )


if __name__ == "__main__":
    main_chirho()
