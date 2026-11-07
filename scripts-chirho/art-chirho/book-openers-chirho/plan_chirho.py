#!/usr/bin/env python3
# For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life. — John 3:16 (KJV)
"""Freeze the finite book-opening task. Workflow: book-openers-chirho.md."""

import importlib as importlib_chirho
import json as json_chirho
import sys as sys_chirho
from pathlib import Path as PathChirho

ROOT_CHIRHO = PathChirho(__file__).resolve().parents[3]
sys_chirho.path.insert(
    0, str(ROOT_CHIRHO / "scripts-chirho/art-chirho/recovery-chirho")
)
sources_chirho = importlib_chirho.import_module("scene_upgrade_sources_chirho")
HOME_CHIRHO = PathChirho(
    "workspace-chirho/art-chirho/queue-chirho/book-openers-2026-11-06-chirho"
)
MODEL_CHIRHO = "openai:gpt-image@2.6-flare"
MAXIMUM_USD_CHIRHO = 35
RESERVATION_USD_CHIRHO = 1


def prompt_chirho(job_chirho):
    return f"""Create one exquisite, source-faithful hand-painted watercolor storybook illustration for {job_chirho["reference_chirho"]}, a scene at the opening of this Bible book. Landscape 4:3. Rich but gentle colors, warm luminous natural light, finely drawn expressive figures, restrained soft ink contours, layered washes and textured paper. Reverent, sober and quietly joyful, beautifully finished as a Bible illustration, neither generic clip art nor a toy or game.

Exact original-language verse: {job_chirho["canonical_text_chirho"]}
Source word meanings in original order (a study gloss, not polished English): {job_chirho["word_glosses_chirho"]}
Previously source-bound composition to develop with greater artistry: {job_chirho["composition_chirho"]}

Let this verse, rather than later events, determine the subject. For headings, lists of names, letters and abstract teaching, use an honest imaginative scene of the corresponding people, setting, scrolls or listeners, without pretending an abstract phrase describes a literal event. Do not put readable writing on scrolls. Keep the historical setting ancient, with natural materials, modest loose garments and believable anatomy. Show Jesus indirectly, outside the frame; at most a relevant hand may be seen. Never show a human figure as God, and never replace Jesus with an unrelated dove or a misleading symbol. Light and the actual landscape can suggest unseen divine speech. Avoid graphic injury, nudity or sexual acts; use a restrained indirect composition where needed. No captions, letters, numbers, diagrams, frames, borders, panels, collage, signatures or watermarks. One beautiful continuous scene that fills the canvas."""


def build_chirho(root_chirho=ROOT_CHIRHO):
    registry_chirho = sources_chirho.read_chirho(
        root_chirho / sources_chirho.BOOKS_CHIRHO
    )
    inventory_chirho = sources_chirho.read_chirho(
        root_chirho / sources_chirho.HOME_CHIRHO / "inventory-chirho.json"
    )
    retained_chirho = {}
    for name_chirho in [
        "proverbs-scenes-chirho.json",
        "proverbs-worker-scenes-chirho.json",
        "john-worker-scenes-chirho.json",
        "genesis-worker-scenes-chirho.json",
        "bible-high-quality-scenes-chirho.json",
    ]:
        for row_chirho in sources_chirho.read_chirho(
            root_chirho / "data-chirho/media-chirho" / name_chirho
        )["scenes_chirho"]:
            if row_chirho.get(
                "variant_chirho", "standard"
            ) == "standard" and not row_chirho.get("fallback_chirho", False):
                retained_chirho[row_chirho["lesson_id_chirho"]] = row_chirho
    old_jobs_chirho = {}
    old_home_chirho = (
        root_chirho
        / "workspace-chirho/art-chirho/bible-schnell-2026-11-04-chirho/books-chirho"
    )
    for path_chirho in old_home_chirho.glob(
        "*/*/jobs-chirho/chapter-001-jobs-chirho.jsonl"
    ):
        for line_chirho in path_chirho.read_text().splitlines()[:2]:
            row_chirho = json_chirho.loads(line_chirho)
            old_jobs_chirho[row_chirho["verse_id_chirho"]] = row_chirho
    jobs_chirho, kept_chirho = [], []
    for book_chirho in registry_chirho["books_chirho"]:
        manifest_chirho = sources_chirho.read_chirho(
            root_chirho
            / inventory_chirho["source_manifests_chirho"][book_chirho["id_chirho"]][
                "path_chirho"
            ]
        )
        entry_chirho = next(
            row_chirho
            for row_chirho in manifest_chirho["chapters_chirho"]
            if row_chirho["number_chirho"] == 1
        )
        chapter_jobs_chirho = sources_chirho.chapter_jobs_chirho(
            root_chirho, inventory_chirho, book_chirho, entry_chirho
        )
        chapter_chirho = sources_chirho.read_chirho(
            root_chirho / "static" / entry_chirho["path_chirho"].lstrip("/")
        )
        media_path_chirho = (
            root_chirho
            / "static/media-chirho"
            / book_chirho["slug_chirho"]
            / "chapter-01-chirho.json"
        )
        media_chirho = sources_chirho.read_chirho(media_path_chirho)
        for verse_chirho in (1, 2):
            job_chirho = next(
                row_chirho
                for row_chirho in chapter_jobs_chirho
                if row_chirho["verse_chirho"] == verse_chirho
            )
            id_chirho = job_chirho["id_chirho"]
            if id_chirho in retained_chirho:
                kept_chirho.append(
                    {
                        "job_chirho": job_chirho,
                        "record_chirho": retained_chirho[id_chirho],
                    }
                )
                continue
            source_chirho = next(
                row_chirho
                for row_chirho in chapter_chirho["verses_chirho"]
                if row_chirho["id_chirho"] == id_chirho
            )
            scene_chirho = next(
                row_chirho
                for row_chirho in media_chirho["scenes_chirho"]
                if row_chirho["lesson_id_chirho"] == id_chirho
                and row_chirho.get("variant_chirho", "standard") == "standard"
            )
            old_chirho = old_jobs_chirho.get(id_chirho)
            job_chirho |= {
                "book_id_chirho": book_chirho["id_chirho"],
                "word_glosses_chirho": " ".join(
                    token_chirho.get("gloss_chirho") or "[meaning unavailable]"
                    for token_chirho in source_chirho["tokens_chirho"]
                ),
                "composition_chirho": old_chirho["prompt_chirho"]
                if old_chirho
                else scene_chirho["alt_chirho"]
                + " "
                + scene_chirho.get("reading_note_chirho", ""),
                "previous_scene_chirho": scene_chirho,
                "previous_job_sha256_chirho": sources_chirho.sha_chirho(
                    json_chirho.dumps(old_chirho, sort_keys=True).encode()
                )
                if old_chirho
                else None,
            }
            job_chirho["prompt_chirho"] = prompt_chirho(job_chirho)
            job_chirho["prompt_sha256_chirho"] = sources_chirho.sha_chirho(
                job_chirho["prompt_chirho"].encode()
            )
            jobs_chirho.append(job_chirho)
    all_ids_chirho = {row_chirho["id_chirho"] for row_chirho in jobs_chirho} | {
        row_chirho["job_chirho"]["id_chirho"] for row_chirho in kept_chirho
    }
    if len(all_ids_chirho) != 132 or any(
        id_chirho.split(".")[1] != "1" or id_chirho.split(".")[2] not in {"1", "2"}
        for id_chirho in all_ids_chirho
    ):
        raise ValueError(
            "Opening source scope must be exactly the first two verses of all 66 books"
        )
    return {
        "schema_version_chirho": 1,
        "authority_chirho": "L.J. 2026-11-06: high quality first two verses of every Bible book; Runware GPT Image 2.6 explicitly permitted for this task only",
        "model_chirho": MODEL_CHIRHO,
        "width_chirho": 1536,
        "height_chirho": 1152,
        "quality_chirho": "medium",
        "thinking_level_chirho": "high",
        "maximum_usd_chirho": MAXIMUM_USD_CHIRHO,
        "reservation_usd_chirho": RESERVATION_USD_CHIRHO,
        "maximum_concurrency_chirho": 3,
        "maximum_requests_per_verse_chirho": 1,
        "registry_sha256_chirho": inventory_chirho["registry_sha256_chirho"],
        "retained_chirho": kept_chirho,
        "jobs_chirho": jobs_chirho,
    }


def freeze_chirho(root_chirho=ROOT_CHIRHO):
    path_chirho = root_chirho / HOME_CHIRHO / "plan-chirho.json"
    if path_chirho.exists():
        return sources_chirho.read_chirho(path_chirho)
    value_chirho = build_chirho(root_chirho)
    sources_chirho.write_chirho(path_chirho, value_chirho)
    return value_chirho


if __name__ == "__main__":
    plan_chirho = freeze_chirho()
    print(
        json_chirho.dumps(
            {
                "retained_chirho": len(plan_chirho["retained_chirho"]),
                "pending_chirho": len(plan_chirho["jobs_chirho"]),
                "model_chirho": plan_chirho["model_chirho"],
                "maximum_usd_chirho": MAXIMUM_USD_CHIRHO,
            }
        )
    )
