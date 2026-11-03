# For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life. — John 3:16 (KJV)
"""Install one inspected whole-canon atlas through source identity and measured cell checks.

Workflow: whole-bible-chirho.md, icons_chirho. This does not call a generator or approve artwork.
Completed source/delivery files must be archived on R2 before the temporary rasters are retired.
"""

from __future__ import annotations

import argparse
import fcntl
import hashlib
import json
import os
import shutil
import tempfile
from pathlib import Path

from PIL import Image

ROOT_CHIRHO = Path(__file__).resolve().parents[2]
QUEUE_CHIRHO = ROOT_CHIRHO / "workspace-chirho/art-chirho/queue-chirho/bible-icons-chirho"


def sha_chirho(path_chirho):
    return hashlib.sha256(path_chirho.read_bytes()).hexdigest()


def atomic_chirho(path_chirho, value_chirho):
    path_chirho.parent.mkdir(parents=True, exist_ok=True)
    with tempfile.NamedTemporaryFile(dir=path_chirho.parent, delete=False) as file_chirho:
        temporary_chirho = Path(file_chirho.name)
        file_chirho.write((json.dumps(value_chirho, ensure_ascii=False, indent=2) + "\n").encode())
        file_chirho.flush()
        os.fsync(file_chirho.fileno())
    os.replace(temporary_chirho, path_chirho)


def positive_visual_chirho(attempt_chirho):
    visual_path_chirho = attempt_chirho / "visual-review-chirho.json"
    visual_chirho = json.loads(visual_path_chirho.read_bytes())
    if visual_chirho.get("visual_pass_chirho") is True:
        return True
    owner_path_chirho = attempt_chirho / "owner-review-chirho.json"
    if not owner_path_chirho.exists():
        return False
    owner_chirho = json.loads(owner_path_chirho.read_bytes())
    return (
        owner_chirho.get("inspected_chirho") is True
        and owner_chirho.get("visual_pass_chirho") is True
        and owner_chirho.get("prior_visual_sha256_chirho") == sha_chirho(visual_path_chirho)
        and owner_chirho.get("sheet_sha256_chirho") == visual_chirho.get("sheet_sha256_chirho")
    )


def rejected_cells_chirho(attempt_chirho):
    owner_path_chirho = attempt_chirho / "owner-review-chirho.json"
    path_chirho = (
        owner_path_chirho
        if owner_path_chirho.exists() and positive_visual_chirho(attempt_chirho)
        else attempt_chirho / "visual-review-chirho.json"
    )
    rows_chirho = json.loads(path_chirho.read_bytes()).get("rejected_cells_chirho", [])
    if not isinstance(rows_chirho, list) or len(rows_chirho) > 16:
        raise ValueError("Invalid per-cell visual review")
    output_chirho = {}
    for row_chirho in rows_chirho:
        number_chirho = row_chirho.get("cell_chirho")
        reason_chirho = row_chirho.get("reason_chirho")
        if (
            type(number_chirho) is not int
            or not 0 <= number_chirho < 16
            or number_chirho in output_chirho
            or not isinstance(reason_chirho, str)
            or not reason_chirho.strip()
        ):
            raise ValueError("Invalid or repeated visual cell disposition")
        output_chirho[number_chirho] = reason_chirho
    return output_chirho


def install_chirho(attempt_chirho):
    attempt_chirho = attempt_chirho.resolve()
    if not attempt_chirho.is_relative_to(
        QUEUE_CHIRHO.resolve()
    ) or not attempt_chirho.name.startswith("attempt-"):
        raise ValueError("Atlas attempt is outside its owned queue")
    read_chirho = lambda name_chirho: json.loads((attempt_chirho / name_chirho).read_bytes())
    plan_chirho = read_chirho("plan-chirho.json")
    reviews_chirho = read_chirho("reviews-chirho.json")
    visual_chirho = read_chirho("visual-review-chirho.json")
    cuts_chirho = read_chirho("cuts-chirho/manifest-chirho.json")
    if not visual_chirho.get("inspected_chirho") or visual_chirho.get(
        "sheet_sha256_chirho"
    ) != sha_chirho(attempt_chirho / "keyed-sheet-chirho.webp"):
        raise ValueError("Atlas lacks its own visual inspection")
    if visual_chirho.get("visual_pass_chirho") is False and not positive_visual_chirho(
        attempt_chirho
    ):
        raise ValueError(
            "Rejected visual needs a source-bound owner inspection before installation"
        )
    if (
        len(plan_chirho["cells_chirho"]) != 16
        or len(reviews_chirho) != 16
        or len(cuts_chirho["cells_chirho"]) != 16
    ):
        raise ValueError("Expected sixteen planned and measured cells")
    catalogue_path_chirho = ROOT_CHIRHO / "data-chirho/media-chirho/bible-worker-icons-chirho.json"
    catalogue_chirho = (
        json.loads(catalogue_path_chirho.read_bytes())
        if catalogue_path_chirho.exists()
        else {"schema_version_chirho": 1, "icons_chirho": []}
    )
    records_chirho = []
    held_chirho = []
    visual_rejected_chirho = rejected_cells_chirho(attempt_chirho)
    for number_chirho, (planned_chirho, reviewed_chirho, cut_chirho) in enumerate(
        zip(plan_chirho["cells_chirho"], reviews_chirho, cuts_chirho["cells_chirho"], strict=True)
    ):
        if planned_chirho.get("padding_chirho") is True:
            if reviewed_chirho.get("padding_chirho") is not True:
                raise ValueError("Padding cell acquired an invented word")
            continue
        for field_chirho in (
            "cell_chirho",
            "lemma_id_chirho",
            "lemma_augment_chirho",
            "lexical_form_chirho",
            "occurrence_chirho",
            "canonical_sha256_chirho",
        ):
            if planned_chirho[field_chirho] != reviewed_chirho[field_chirho]:
                raise ValueError("Reviewed cell differs from its source plan")
        if (
            reviewed_chirho["cell_chirho"] != number_chirho
            or cut_chirho["cell_chirho"] != number_chirho
        ):
            raise ValueError("Atlas order changed")
        if (
            reviewed_chirho["sense_review_chirho"] != "agent_reviewed"
            or reviewed_chirho["art_review_chirho"] != "pending"
        ):
            raise ValueError("Atlas review authority differs")
        if number_chirho in visual_rejected_chirho:
            held_chirho.append(
                {
                    "cell_chirho": number_chirho,
                    "reason_chirho": visual_rejected_chirho[number_chirho],
                    "source_chirho": planned_chirho,
                }
            )
            continue
        if not cut_chirho["layout_pass_chirho"]:
            held_chirho.append(
                {
                    "cell_chirho": number_chirho,
                    "reason_chirho": "Measured cell layout failed",
                    "source_chirho": planned_chirho,
                }
            )
            continue
        occurrence_chirho = planned_chirho["occurrence_chirho"]
        chapter_path_chirho = (
            ROOT_CHIRHO / "static" / occurrence_chirho["content_path_chirho"].lstrip("/")
        ).resolve()
        if (
            not chapter_path_chirho.is_relative_to(ROOT_CHIRHO / "static/content-chirho")
            or sha_chirho(chapter_path_chirho) != occurrence_chirho["content_sha256_chirho"]
        ):
            raise ValueError("Icon source chapter changed")
        chapter_chirho = json.loads(chapter_path_chirho.read_bytes())
        verse_chirho = next(
            row_chirho
            for row_chirho in chapter_chirho["verses_chirho"]
            if row_chirho["id_chirho"] == occurrence_chirho["lesson_id_chirho"]
        )
        token_chirho = next(
            row_chirho
            for row_chirho in verse_chirho["tokens_chirho"]
            if row_chirho["id_chirho"] == occurrence_chirho["token_id_chirho"]
        )
        if (
            any(
                token_chirho.get(field_chirho) != planned_chirho[field_chirho]
                for field_chirho in (
                    "lemma_id_chirho",
                    "lemma_augment_chirho",
                    "lexical_form_chirho",
                )
            )
            or token_chirho["text_chirho"] != occurrence_chirho["text_chirho"]
            or token_chirho["gloss_chirho"] != occurrence_chirho["gloss_chirho"]
            or hashlib.sha256(verse_chirho["canonical_text_chirho"].encode()).hexdigest()
            != planned_chirho["canonical_sha256_chirho"]
        ):
            raise ValueError("Icon word identity or contextual evidence changed")
        icon_chirho = (attempt_chirho / "cuts-chirho" / cut_chirho["icon_path_chirho"]).resolve()
        if (
            not icon_chirho.is_relative_to(attempt_chirho)
            or sha_chirho(icon_chirho) != cut_chirho["icon_sha256_chirho"]
        ):
            raise ValueError("Measured icon bytes changed")
        with Image.open(icon_chirho) as image_chirho:
            if image_chirho.format != "WEBP" or image_chirho.size != (128, 128):
                raise ValueError("Expected 128-pixel WebP icon")
        asset_chirho = f"/assets-chirho/icons-chirho/bible-v1-chirho/{attempt_chirho.name}/cell-{number_chirho:02d}-chirho.webp"
        target_chirho = ROOT_CHIRHO / "static" / asset_chirho.lstrip("/")
        target_chirho.parent.mkdir(parents=True, exist_ok=True)
        if target_chirho.exists() and sha_chirho(target_chirho) != sha_chirho(icon_chirho):
            raise ValueError("Installed icon would be overwritten")
        if not target_chirho.exists():
            shutil.copyfile(icon_chirho, target_chirho)
        records_chirho.append(
            {
                "id_chirho": f"{attempt_chirho.name}-cell-{number_chirho:02d}-chirho",
                "lesson_id_chirho": occurrence_chirho["lesson_id_chirho"],
                "token_id_chirho": occurrence_chirho["token_id_chirho"],
                **{
                    field_chirho: reviewed_chirho[field_chirho]
                    for field_chirho in (
                        "lemma_id_chirho",
                        "lemma_augment_chirho",
                        "lexical_form_chirho",
                        "sense_id_chirho",
                        "contextual_meaning_chirho",
                        "alt_chirho",
                        "sense_review_chirho",
                        "art_review_chirho",
                        "evidence_refs_chirho",
                        "display_authority_chirho",
                    )
                },
                "asset_path_chirho": asset_chirho,
                "sha256_chirho": sha_chirho(icon_chirho),
                "width_chirho": 128,
                "height_chirho": 128,
                "selected_chirho": True,
                "context_text_chirho": token_chirho["text_chirho"],
                "context_gloss_chirho": token_chirho["gloss_chirho"],
                "context_canonical_text_chirho": verse_chirho["canonical_text_chirho"],
            }
        )
    for record_chirho in records_chirho:
        previous_chirho = next(
            (
                row_chirho
                for row_chirho in catalogue_chirho["icons_chirho"]
                if row_chirho["id_chirho"] == record_chirho["id_chirho"]
            ),
            None,
        )
        if previous_chirho and previous_chirho != record_chirho:
            raise ValueError("Existing inspected icon record would change")
        if previous_chirho is None:
            catalogue_chirho["icons_chirho"].append(record_chirho)
    atomic_chirho(catalogue_path_chirho, catalogue_chirho)
    policy_path_chirho = ROOT_CHIRHO / "config-chirho/lemma-icon-library-chirho.json"
    policy_chirho = json.loads(policy_path_chirho.read_bytes())
    if catalogue_path_chirho.name not in policy_chirho["source_manifests_chirho"]:
        policy_chirho["source_manifests_chirho"].append(catalogue_path_chirho.name)
        atomic_chirho(policy_path_chirho, policy_chirho)
    atomic_chirho(
        attempt_chirho / "installed-chirho.json",
        {
            "schema_version_chirho": 1,
            "records_chirho": records_chirho,
            "holds_chirho": held_chirho,
            "plan_sha256_chirho": sha_chirho(attempt_chirho / "plan-chirho.json"),
            "visual_review_sha256_chirho": sha_chirho(attempt_chirho / "visual-review-chirho.json"),
        },
    )
    return {"installed_chirho": len(records_chirho), "held_chirho": len(held_chirho)}


if __name__ == "__main__":
    parser_chirho = argparse.ArgumentParser(description=__doc__)
    parser_chirho.add_argument("attempt_chirho", type=Path)
    options_chirho = parser_chirho.parse_args()
    with (QUEUE_CHIRHO / "installer-chirho.lock").open("a") as lock_chirho:
        fcntl.flock(lock_chirho, fcntl.LOCK_EX | fcntl.LOCK_NB)
        print(json.dumps(install_chirho(options_chirho.attempt_chirho)))
