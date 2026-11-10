# For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life. — John 3:16 (KJV)
"""Finite HQ-picture and spending gates for chapter-opening-videos-chirho.md."""

import hashlib as hashlib_chirho
import json as json_chirho
import math as math_chirho
import re as re_chirho
import stat as stat_chirho
from pathlib import Path as PathChirho

MODEL_CHIRHO = "pixverse:1@8"
RATE_MICRO_USD_CHIRHO = 45_000
MAX_JOBS_CHIRHO = 1_200
MAX_JSON_BYTES_CHIRHO = 16 * 1024**2
PHASES_CHIRHO = (
    "book_openings_chirho",
    "nt_openings_chirho",
    "ot_openings_chirho",
)


def sha_chirho(bytes_chirho):
    return hashlib_chirho.sha256(bytes_chirho).hexdigest()


def read_json_chirho(path_chirho, expected_sha_chirho=None):
    info_chirho = path_chirho.lstat()
    if (
        not stat_chirho.S_ISREG(info_chirho.st_mode)
        or info_chirho.st_size > MAX_JSON_BYTES_CHIRHO
    ):
        raise ValueError("Linked, non-file or oversized video input")
    bytes_chirho = path_chirho.read_bytes()
    if len(bytes_chirho) > MAX_JSON_BYTES_CHIRHO:
        raise ValueError("Video input grew beyond its bound")
    if (
        expected_sha_chirho is not None
        and sha_chirho(bytes_chirho) != expected_sha_chirho
    ):
        raise ValueError("Pinned video input hash differs")
    return json_chirho.loads(bytes_chirho), sha_chirho(bytes_chirho)


def hash_chirho(value_chirho):
    return isinstance(value_chirho, str) and re_chirho.fullmatch(
        r"[a-f0-9]{64}", value_chirho
    )


def integer_chirho(value_chirho, minimum_chirho, maximum_chirho):
    return (
        type(value_chirho) is int and minimum_chirho <= value_chirho <= maximum_chirho
    )


def validate_plan_chirho(plan_chirho):
    if (
        plan_chirho.get("schema_version_chirho") != 1
        or plan_chirho.get("provider_chirho") != "runware_chirho"
        or plan_chirho.get("model_chirho") != MODEL_CHIRHO
        or plan_chirho.get("resolution_chirho") != "720p"
        or plan_chirho.get("provider_audio_chirho") is not False
        or plan_chirho.get("rate_micro_usd_chirho") != RATE_MICRO_USD_CHIRHO
        or plan_chirho.get("phase_chirho") not in PHASES_CHIRHO
        or not hash_chirho(plan_chirho.get("inventory_sha256_chirho"))
        or not hash_chirho(plan_chirho.get("legacy_tool_sha256_chirho"))
        or not isinstance(plan_chirho.get("jobs_chirho"), list)
        or not 1 <= len(plan_chirho["jobs_chirho"]) <= MAX_JOBS_CHIRHO
    ):
        raise ValueError("Unsupported or unbounded video plan")
    seen_chirho = set()
    for job_chirho in plan_chirho["jobs_chirho"]:
        lesson_chirho = job_chirho.get("lesson_id_chirho", "")
        if (
            not re_chirho.fullmatch(
                r"[1-3]?[A-Za-z]+\.[1-9][0-9]{0,2}\.1", lesson_chirho
            )
            or lesson_chirho in seen_chirho
            or not re_chirho.fullmatch(
                r"[a-z0-9]+(?:-[a-z0-9]+)*-chirho", job_chirho.get("slug_chirho", "")
            )
            or not hash_chirho(job_chirho.get("canonical_sha256_chirho"))
            or not integer_chirho(job_chirho.get("seconds_chirho"), 1, 15)
            or not integer_chirho(job_chirho.get("seed_chirho"), 0, 2_147_483_647)
            or not isinstance(job_chirho.get("holds_chirho"), list)
        ):
            raise ValueError("Invalid, duplicate or off-target opening video job")
        if plan_chirho[
            "phase_chirho"
        ] == "book_openings_chirho" and not lesson_chirho.endswith(".1.1"):
            raise ValueError("Book phase contains a later chapter")
        scene_chirho = job_chirho.get("scene_chirho", {})
        if (
            scene_chirho.get("lesson_id_chirho") != lesson_chirho
            or not hash_chirho(scene_chirho.get("sha256_chirho"))
            or not isinstance(scene_chirho.get("alt_chirho"), str)
            or not 1 <= len(scene_chirho["alt_chirho"]) <= 4_000
            or not isinstance(scene_chirho.get("asset_path_chirho"), str)
            or not scene_chirho["asset_path_chirho"].startswith(
                "/assets-chirho/scenes-chirho/"
            )
            or any(
                part_chirho in {".", ".."}
                for part_chirho in scene_chirho["asset_path_chirho"].split("/")
            )
            or any(
                char_chirho in scene_chirho["asset_path_chirho"]
                for char_chirho in "?\\#\x00"
            )
        ):
            raise ValueError("Invalid opening scene binding")
        seen_chirho.add(lesson_chirho)
    return plan_chirho


def validate_authority_chirho(authority_chirho, plan_sha_chirho):
    if (
        authority_chirho.get("schema_version_chirho") != 1
        or authority_chirho.get("plan_sha256_chirho") != plan_sha_chirho
        or authority_chirho.get("authority_chirho") != "direct_user_chirho"
        or not isinstance(authority_chirho.get("approval_text_chirho"), str)
        or not authority_chirho["approval_text_chirho"].strip()
        or not integer_chirho(
            authority_chirho.get("cap_micro_usd_chirho"), 1, 1_000_000_000
        )
    ):
        raise ValueError("An exact approved plan and finite spending cap are required")
    return authority_chirho["cap_micro_usd_chirho"]


def bind_inventory_chirho(plan_chirho, inventory_chirho):
    """Join every paid candidate to the pinned actual-loader/HQ-lineage audit."""
    if (
        not isinstance(inventory_chirho, list)
        or len(inventory_chirho) > MAX_JOBS_CHIRHO
    ):
        raise ValueError("Invalid opening inventory")
    by_id_chirho = {
        row_chirho["lesson_id_chirho"]: row_chirho for row_chirho in inventory_chirho
    }
    if len(by_id_chirho) != len(inventory_chirho):
        raise ValueError("Duplicate inventory position")
    tier_chirho = PHASES_CHIRHO.index(plan_chirho["phase_chirho"]) + 1
    for job_chirho in plan_chirho["jobs_chirho"]:
        row_chirho = by_id_chirho.get(job_chirho["lesson_id_chirho"])
        if (
            row_chirho is None
            or row_chirho["tier_chirho"] != tier_chirho
            or row_chirho["book_slug_chirho"] != job_chirho["slug_chirho"]
            or row_chirho["canonical_sha256_chirho"]
            != job_chirho["canonical_sha256_chirho"]
            or row_chirho["existing_video_count_chirho"] != 0
            or row_chirho["missing_video_chirho"] is not True
        ):
            raise ValueError(
                "Opening is absent, already has video, or differs from its pinned inventory"
            )
        scene_chirho = row_chirho["scene_chirho"]
        expected_scene_chirho = {
            key_chirho: scene_chirho[key_chirho]
            for key_chirho in ("asset_path_chirho", "sha256_chirho", "alt_chirho")
        }
        expected_scene_chirho["lesson_id_chirho"] = row_chirho["lesson_id_chirho"]
        expected_proof_chirho = {
            "ready_chirho": row_chirho["picture_prerequisite_met_chirho"] is True,
            "delivery_sha256_chirho": scene_chirho["sha256_chirho"],
            "source_sha256_chirho": scene_chirho["source_sha256_chirho"],
            "kind_chirho": {
                "preserved_high_quality_chirho": "preserved_chirho",
                "hq_upgrade_chirho": "upgrade_chirho",
            }.get(scene_chirho["quality_class_chirho"]),
        }
        lineage_chirho = scene_chirho["delivery_lineage_chirho"]
        if (
            job_chirho["scene_chirho"] != expected_scene_chirho
            or job_chirho["high_quality_chirho"] != expected_proof_chirho
            or scene_chirho["high_quality_chirho"] is not True
            or expected_proof_chirho["kind_chirho"] is None
            or lineage_chirho["delivery_sha256_chirho"] != scene_chirho["sha256_chirho"]
            or lineage_chirho["source_sha256_chirho"]
            != scene_chirho["source_sha256_chirho"]
        ):
            raise ValueError(
                "HQ assertion is not proven by the pinned source/delivery inventory"
            )
        audio_chirho = row_chirho["whole_verse_audio_chirho"]
        selected_chirho = audio_chirho.get("selected_chirho")
        if (
            audio_chirho["ready_chirho"] is not True
            or not isinstance(selected_chirho, dict)
            or job_chirho.get("audio_chirho") != selected_chirho
            or selected_chirho.get("token_id_chirho") is not None
            or selected_chirho.get("lesson_id_chirho") != job_chirho["lesson_id_chirho"]
            or selected_chirho.get("canonical_sha256_chirho")
            != job_chirho["canonical_sha256_chirho"]
            or not hash_chirho(selected_chirho.get("sha256_chirho"))
            or not integer_chirho(selected_chirho.get("bytes_chirho"), 1, 4_000_000)
            or type(selected_chirho.get("duration_chirho")) not in {float, int}
            or not 0 < selected_chirho["duration_chirho"] <= 120
            or any(
                selected_chirho.get(key_chirho) is not None
                for key_chirho in ("start_offset_chirho", "end_offset_chirho")
            )
        ):
            raise ValueError("Exact admitted whole-verse soundtrack is unavailable")
        holds_chirho = row_chirho["known_holds_chirho"]
        if (
            holds_chirho.get("audio_chirho")
            or holds_chirho.get("clarity_chirho")
            or holds_chirho.get("current_scene_blocked_chirho")
        ) and not job_chirho["holds_chirho"]:
            raise ValueError("An existing source or picture hold was removed")
    return plan_chirho


def estimated_cost_chirho(job_chirho):
    return job_chirho["seconds_chirho"] * RATE_MICRO_USD_CHIRHO


def reservation_total_chirho(events_chirho, plan_sha_chirho):
    reservations_chirho = {}
    received_chirho = set()
    for event_chirho in events_chirho:
        if event_chirho.get("plan_sha256_chirho") != plan_sha_chirho:
            raise ValueError("Foreign plan in generation journal")
        lesson_chirho = event_chirho.get("lesson_id_chirho")
        state_chirho = event_chirho.get("state_chirho")
        if state_chirho == "requested_chirho":
            if lesson_chirho in reservations_chirho:
                raise ValueError("Duplicate paid request in generation journal")
            reserved_chirho = event_chirho.get("reserved_micro_usd_chirho")
            if not integer_chirho(reserved_chirho, 1, 15 * RATE_MICRO_USD_CHIRHO):
                raise ValueError("Invalid generation reservation")
            reservations_chirho[lesson_chirho] = reserved_chirho
        elif state_chirho == "received_chirho":
            if lesson_chirho not in reservations_chirho:
                raise ValueError("Result without a reserved generation request")
            cost_chirho = event_chirho.get("cost_usd_chirho")
            if (
                isinstance(cost_chirho, bool)
                or not isinstance(cost_chirho, (int, float))
                or not math_chirho.isfinite(cost_chirho)
                or cost_chirho < 0
            ):
                raise ValueError("Provider cost is unavailable; stop and reconcile")
            if lesson_chirho in received_chirho:
                raise ValueError("Duplicate generation result in journal")
            reservations_chirho[lesson_chirho] = max(
                reservations_chirho[lesson_chirho],
                math_chirho.ceil(cost_chirho * 1_000_000),
            )
            received_chirho.add(lesson_chirho)
    return sum(reservations_chirho.values())


def picture_gate_chirho(job_chirho, live_scene_chirho, image_chirho):
    if job_chirho["holds_chirho"]:
        raise ValueError("Opening has an unresolved picture, source or audio hold")
    proof_chirho = job_chirho.get("high_quality_chirho", {})
    review_chirho = job_chirho.get("picture_review_chirho", {})
    expected_chirho = job_chirho["scene_chirho"]
    scene_sha_chirho = expected_chirho["sha256_chirho"]
    if (
        proof_chirho.get("ready_chirho") is not True
        or proof_chirho.get("delivery_sha256_chirho") != scene_sha_chirho
        or not hash_chirho(proof_chirho.get("source_sha256_chirho"))
        or proof_chirho.get("kind_chirho") not in {"preserved_chirho", "upgrade_chirho"}
        or review_chirho.get("accepted_chirho") is not True
        or review_chirho.get("scene_sha256_chirho") != scene_sha_chirho
        or not review_chirho.get("reviewer_chirho")
    ):
        raise ValueError("Current HQ picture proof and its visual review are required")
    for key_chirho in (
        "lesson_id_chirho",
        "sha256_chirho",
        "asset_path_chirho",
        "alt_chirho",
    ):
        if live_scene_chirho.get(key_chirho) != expected_chirho.get(key_chirho):
            raise ValueError(
                "Published scene changed; reconcile before video generation"
            )
    if (
        not 1 <= len(image_chirho) <= 4 * 1024**2
        or sha_chirho(image_chirho) != scene_sha_chirho
    ):
        raise ValueError("Published HQ image bytes differ")


def safe_child_chirho(root_chirho, relative_chirho):
    path_chirho = PathChirho(relative_chirho)
    if (
        path_chirho.is_absolute()
        or not path_chirho.parts
        or any(
            part_chirho in {"", ".", ".."}
            for part_chirho in str(relative_chirho).split("/")
        )
    ):
        raise ValueError("Video path is outside its owned run")
    result_chirho = root_chirho / path_chirho
    if result_chirho.resolve() != result_chirho or not result_chirho.is_relative_to(
        root_chirho
    ):
        raise ValueError("Linked or foreign video path")
    return result_chirho
