# For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life. — John 3:16 (KJV)
"""Preparation inventories for artwork: one scene job per verse and one entry per lemma.

Workflow: scripts-chirho/corpus-chirho/README-chirho.md, "Corpus import", node inventories_chirho.
Both files only prepare work. Nothing here generates an image, assigns a sense or approves art:
review states live in GPT's media catalogue (data-chirho/media-chirho/). Lemma entries are keyed
by lemma id plus augment, so homographs such as H7105a and H7105b stay apart and nothing is
matched by consonants. No root meaning or universal sense is attached; each occurrence carries
only its own approved contextual gloss.
"""

from __future__ import annotations

import hashlib
import re
from dataclasses import dataclass

from corpus_outputs_chirho import json_text_chirho, sha256_text_chirho
from source_files_chirho import PinnedFileChirho

STYLE_REFERENCE_ID_CHIRHO = "Prov.26.1"
STYLE_REFERENCE_ASSET_CHIRHO = "/assets-chirho/proverbs-26-1-scene-chirho.webp"
STYLE_REFERENCE_PRESENTATION_CHIRHO = (
    "data-chirho/reader-chirho/proverbs-26-1-presentation-chirho.json"
)
AUGMENTED_KEY_CHIRHO = re.compile(r"(\d+)([a-z])")


@dataclass(frozen=True)
class SceneBookChirho:
    """One book's scene queue: every book matches the same Prov 26:1 style reference."""

    book_id_chirho: str
    scene_set_chirho: str
    file_prefix_chirho: str
    # Root-relative chapter files the reader loads, or None while the book is only staged.
    content_prefix_chirho: str | None


PROVERBS_SCENES_CHIRHO = SceneBookChirho(
    "Prov", "proverbs-v1-chirho", "prov", "/content-chirho/proverbs-chirho/"
)


def scene_destination_chirho(
    book_chirho: SceneBookChirho, chapter_chirho: int, verse_chirho: int
) -> str:
    """Versioned public path; a regenerated scene set gets a new set folder, never an overwrite."""
    return (
        f"/assets-chirho/scenes-chirho/{book_chirho.scene_set_chirho}/chapter-{chapter_chirho:02d}-chirho/"
        f"{book_chirho.file_prefix_chirho}-{chapter_chirho:02d}-{verse_chirho:03d}-chirho.webp"
    )


def image_jobs_text_chirho(
    records_chirho: list[dict],
    book_chirho: SceneBookChirho,
    source_chirho: PinnedFileChirho,
    style_bytes_chirho: bytes,
    textual_notes_chirho: dict[str, str] | None = None,
) -> str:
    """One prepared scene job per verse; textual notes flag verses the edition sets apart."""
    jobs_chirho = []
    for record_chirho in records_chirho:
        _, chapter_text_chirho, verse_text_chirho = record_chirho["id_chirho"].split(".")
        chapter_chirho, verse_chirho = int(chapter_text_chirho), int(verse_text_chirho)
        job_chirho = {
            "id_chirho": record_chirho["id_chirho"],
            "reference_chirho": record_chirho["reference_chirho"],
            "chapter_chirho": chapter_chirho,
            "verse_chirho": verse_chirho,
            "canonical_text_chirho": record_chirho["canonical_text_chirho"],
            **(
                {"kjv_verse_id_chirho": record_chirho["kjv_verse_id_chirho"]}
                if "kjv_verse_id_chirho" in record_chirho
                else {}
            ),
            "canonical_sha256_chirho": sha256_text_chirho(record_chirho["canonical_text_chirho"]),
            "content_path_chirho": f"{book_chirho.content_prefix_chirho}chapter-{chapter_chirho:02d}-chirho.json"
            if book_chirho.content_prefix_chirho
            else None,
            "destination_chirho": scene_destination_chirho(
                book_chirho, chapter_chirho, verse_chirho
            ),
            "status_chirho": "prepared",
        }
        if textual_notes_chirho and record_chirho["id_chirho"] in textual_notes_chirho:
            job_chirho["textual_note_chirho"] = textual_notes_chirho[record_chirho["id_chirho"]]
        if record_chirho["id_chirho"] == STYLE_REFERENCE_ID_CHIRHO:
            job_chirho |= {
                "status_chirho": "style_reference",
                "existing_asset_chirho": STYLE_REFERENCE_ASSET_CHIRHO,
            }
        jobs_chirho.append(job_chirho)
    return json_text_chirho(
        {
            "schema_version_chirho": 1,
            "book_id_chirho": book_chirho.book_id_chirho,
            "source_chirho": {
                "id_chirho": source_chirho.id_chirho,
                "revision_chirho": source_chirho.commit_chirho,
                "sha256_chirho": source_chirho.sha256_chirho,
            },
            "style_reference_chirho": {
                "verse_id_chirho": STYLE_REFERENCE_ID_CHIRHO,
                "asset_path_chirho": STYLE_REFERENCE_ASSET_CHIRHO,
                "sha256_chirho": hashlib.sha256(style_bytes_chirho).hexdigest(),
                "presentation_path_chirho": STYLE_REFERENCE_PRESENTATION_CHIRHO,
            },
            "statuses_chirho": {
                "prepared": "job defined from the pinned verse; no image exists",
                "style_reference": "the existing scene every job matches in style; its review "
                "state lives in the media catalogue",
            },
            "job_count_chirho": len(jobs_chirho),
            "jobs_chirho": jobs_chirho,
        },
        compact_depth_chirho=2,
    )


def lemma_sort_key_chirho(key_chirho: tuple[str, str | None]) -> tuple:
    lemma_id_chirho, augment_chirho = key_chirho
    if lemma_id_chirho.startswith("H"):
        return (0, int(lemma_id_chirho[1:]), augment_chirho or "")
    return (1, lemma_id_chirho, "")


def lemma_inventory_text_chirho(
    records_chirho: list[dict],
    aug_index_chirho: dict[str, str],
    pins_chirho: list[PinnedFileChirho],
    book_id_chirho: str,
) -> str:
    """One entry per lemma id + augment, with every occurrence in the book and its gloss."""
    augments_chirho: dict[str, list[str]] = {}
    for aug_key_chirho in aug_index_chirho:
        match_chirho = AUGMENTED_KEY_CHIRHO.fullmatch(aug_key_chirho)
        if match_chirho:
            augments_chirho.setdefault(match_chirho.group(1), []).append(f"H{aug_key_chirho}")
    entries_chirho: dict[tuple[str, str | None], dict] = {}
    for record_chirho in records_chirho:
        for token_chirho in record_chirho["tokens_chirho"]:
            readings_chirho = [("ketiv" if "qere_chirho" in token_chirho else "main", token_chirho)]
            readings_chirho += [
                ("qere", reading_chirho) for reading_chirho in token_chirho.get("qere_chirho", [])
            ]
            for role_chirho, reading_chirho in readings_chirho:
                key_chirho = (
                    reading_chirho["lemma_id_chirho"],
                    reading_chirho["lemma_augment_chirho"],
                )
                entry_chirho = entries_chirho.setdefault(
                    key_chirho,
                    {
                        "lemma_key_chirho": f"{key_chirho[0]}{key_chirho[1] or ''}",
                        "lemma_id_chirho": key_chirho[0],
                        "lemma_augment_chirho": key_chirho[1],
                        "lexical_form_chirho": reading_chirho["lexical_form_chirho"],
                        "lexical_index_id_chirho": aug_index_chirho.get(
                            key_chirho[0].removeprefix("H").removeprefix("oshb:")
                            + (key_chirho[1] or "")
                        ),
                        "known_augments_chirho": sorted(
                            augments_chirho.get(key_chirho[0].removeprefix("H"), [])
                            if key_chirho[0].startswith("H")
                            else []
                        ),
                        "pos_chirho": [],
                        "occurrence_count_chirho": 0,
                        "occurrences_chirho": [],
                        "preparation_status_chirho": "prepared",
                    },
                )
                if reading_chirho["pos_chirho"] not in entry_chirho["pos_chirho"]:
                    entry_chirho["pos_chirho"].append(reading_chirho["pos_chirho"])
                entry_chirho["occurrence_count_chirho"] += 1
                entry_chirho["occurrences_chirho"].append(
                    {
                        "verse_id_chirho": record_chirho["id_chirho"],
                        "token_id_chirho": reading_chirho["id_chirho"],
                        "reading_chirho": role_chirho,
                        "gloss_chirho": reading_chirho["gloss_chirho"],
                    }
                )
    lemmas_chirho = [
        entries_chirho[key_chirho]
        for key_chirho in sorted(entries_chirho, key=lemma_sort_key_chirho)
    ]
    for entry_chirho in lemmas_chirho:
        entry_chirho["pos_chirho"].sort()
    return json_text_chirho(
        {
            "schema_version_chirho": 1,
            "book_id_chirho": book_id_chirho,
            "sources_chirho": [
                {
                    "id_chirho": pin_chirho.id_chirho,
                    "revision_chirho": pin_chirho.commit_chirho,
                    "sha256_chirho": pin_chirho.sha256_chirho,
                }
                for pin_chirho in pins_chirho
            ],
            "policy_chirho": (
                "Preparation only. Keyed by lemma id + augment: homographs stay apart and nothing "
                "is matched by consonants. No root meaning or universal sense is given; each "
                "occurrence keeps its own GBT-approved contextual gloss. Senses, icons and their "
                "review states belong to the media catalogue."
            ),
            "lemma_count_chirho": len(lemmas_chirho),
            "occurrence_count_chirho": sum(
                entry_chirho["occurrence_count_chirho"] for entry_chirho in lemmas_chirho
            ),
            "lemmas_chirho": lemmas_chirho,
        },
        compact_depth_chirho=2,
    )


def greek_lemma_inventory_text_chirho(
    records_chirho: list[dict], pins_chirho: list[PinnedFileChirho], book_id_chirho: str
) -> str:
    """One entry per Strong's G id and source lemma, with every occurrence and its Berean gloss.

    A G id that the source pairs with more than one lemma becomes one entry per lemma (its key
    then names the lemma too): Strong's numbering is coarser than the source's lemmas, and
    entries are never merged by number alone.
    """
    forms_chirho: dict[str, set[str]] = {}
    for record_chirho in records_chirho:
        for token_chirho in record_chirho["tokens_chirho"]:
            forms_chirho.setdefault(token_chirho["lemma_id_chirho"], set()).add(
                token_chirho["lexical_form_chirho"]
            )
    entries_chirho: dict[tuple[str, str], dict] = {}
    for record_chirho in records_chirho:
        for token_chirho in record_chirho["tokens_chirho"]:
            lemma_id_chirho = token_chirho["lemma_id_chirho"]
            form_chirho = token_chirho["lexical_form_chirho"]
            shared_chirho = len(forms_chirho[lemma_id_chirho]) > 1
            entry_chirho = entries_chirho.setdefault(
                (lemma_id_chirho, form_chirho),
                {
                    "lemma_key_chirho": f"{lemma_id_chirho}:{form_chirho}"
                    if shared_chirho
                    else lemma_id_chirho,
                    "lemma_id_chirho": lemma_id_chirho,
                    "lexical_form_chirho": form_chirho,
                    "shares_strong_number_chirho": shared_chirho,
                    "raw_strongs_values_chirho": [],
                    "part_of_speech_chirho": [],
                    "occurrence_count_chirho": 0,
                    "occurrences_chirho": [],
                    "preparation_status_chirho": "prepared",
                },
            )
            raw_chirho = token_chirho["raw_strongs_chirho"].split("&")[0]
            if raw_chirho not in entry_chirho["raw_strongs_values_chirho"]:
                entry_chirho["raw_strongs_values_chirho"].append(raw_chirho)
            if token_chirho["part_of_speech_chirho"] not in entry_chirho["part_of_speech_chirho"]:
                entry_chirho["part_of_speech_chirho"].append(token_chirho["part_of_speech_chirho"])
            entry_chirho["occurrence_count_chirho"] += 1
            entry_chirho["occurrences_chirho"].append(
                {
                    "verse_id_chirho": record_chirho["id_chirho"],
                    "token_id_chirho": token_chirho["id_chirho"],
                    "source_form_chirho": token_chirho["text_chirho"],
                    "berean_gloss_chirho": token_chirho["gloss_chirho"],
                }
            )
    lemmas_chirho = [
        entries_chirho[key_chirho]
        for key_chirho in sorted(entries_chirho, key=lambda key: (int(key[0][1:]), key[1]))
    ]
    for entry_chirho in lemmas_chirho:
        entry_chirho["raw_strongs_values_chirho"].sort()
        entry_chirho["part_of_speech_chirho"].sort()
    return json_text_chirho(
        {
            "schema_version_chirho": 1,
            "book_id_chirho": book_id_chirho,
            "staged_chirho": True,
            "sources_chirho": [
                {
                    "id_chirho": pin_chirho.id_chirho,
                    "revision_chirho": pin_chirho.commit_chirho,
                    "sha256_chirho": pin_chirho.sha256_chirho,
                }
                for pin_chirho in pins_chirho
            ],
            "policy_chirho": (
                "Preparation only. Each entry is a Strong's G id with the source's own lemma "
                "(Nestle 1904, biblicalhumanities CC0); entries are never merged by number alone. "
                "source_form_chirho is the word as printed in Nestle 1904. berean_gloss_chirho is "
                "the Berean Interlinear contextual gloss (public domain as Berean states, not a GBT "
                "approval), null where the Berean Greek did not match the source word. No root "
                "meaning or universal sense is given; senses and icons belong to the media catalogue."
            ),
            "lemma_count_chirho": len(lemmas_chirho),
            "occurrence_count_chirho": sum(
                entry_chirho["occurrence_count_chirho"] for entry_chirho in lemmas_chirho
            ),
            "lemmas_chirho": lemmas_chirho,
        },
        compact_depth_chirho=2,
    )
