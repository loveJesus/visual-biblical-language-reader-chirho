# For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life. — John 3:16 (KJV)
"""Journaled, capped video requests; workflow: chapter-opening-videos-chirho.md.

Without --apply-chirho this validates local inputs only. A request is durably
reserved before its one submission. Resuming can poll that UUID, never resend it.
"""

import argparse as argparse_chirho
import concurrent.futures as futures_chirho
import fcntl as fcntl_chirho
import importlib.util as importlib_chirho
import json as json_chirho
import os as os_chirho
import subprocess as subprocess_chirho
import threading as threading_chirho
import time as time_chirho
import uuid as uuid_chirho
from pathlib import Path as PathChirho

from opening_gate_chirho import (
    MAX_JSON_BYTES_CHIRHO,
    MODEL_CHIRHO,
    bind_inventory_chirho,
    estimated_cost_chirho,
    picture_gate_chirho,
    read_json_chirho,
    reservation_total_chirho,
    safe_child_chirho,
    sha_chirho,
    validate_authority_chirho,
    validate_plan_chirho,
)

ROOT_CHIRHO = PathChirho(__file__).resolve().parents[2]
HOME_CHIRHO = (
    ROOT_CHIRHO / "workspace-chirho/video-chirho/chapter-openings-2026-11-09-chirho"
)
SITE_CHIRHO = "https://hinneh.us"


def legacy_tools_chirho(home_chirho):
    os_chirho.environ["VIDEO_RUN_CHIRHO"] = str(home_chirho)
    path_chirho = (
        ROOT_CHIRHO
        / "workspace-chirho/video-chirho/tools-chirho/pixverse_clip_chirho.py"
    )
    spec_chirho = importlib_chirho.spec_from_file_location(
        "opening_pixverse_chirho", path_chirho
    )
    module_chirho = importlib_chirho.module_from_spec(spec_chirho)
    spec_chirho.loader.exec_module(module_chirho)
    return module_chirho


class JournalChirho:
    def __init__(
        self, home_chirho, plan_sha_chirho, cap_chirho, prior_jobs_chirho=None
    ):
        self.path_chirho = home_chirho / "journal-chirho.jsonl"
        self.plan_sha_chirho = plan_sha_chirho
        self.cap_chirho = cap_chirho
        self.lock_chirho = threading_chirho.Lock()
        self.events_chirho = []
        self.prior_jobs_chirho = prior_jobs_chirho or set()
        if self.path_chirho.exists():
            if (
                self.path_chirho.is_symlink()
                or self.path_chirho.stat().st_size > MAX_JSON_BYTES_CHIRHO
            ):
                raise ValueError("Generation journal is linked or oversized")
            self.events_chirho = [
                json_chirho.loads(line_chirho)
                for line_chirho in self.path_chirho.read_text().splitlines()
            ]
        if reservation_total_chirho(self.events_chirho, plan_sha_chirho) > cap_chirho:
            raise ValueError("Existing generation reservations exceed the approved cap")

    def append_locked_chirho(self, event_chirho):
        event_chirho = {
            **event_chirho,
            "plan_sha256_chirho": self.plan_sha_chirho,
            "at_chirho": time_chirho.strftime(
                "%Y-%m-%dT%H:%M:%SZ", time_chirho.gmtime()
            ),
        }
        bytes_chirho = (
            json_chirho.dumps(event_chirho, ensure_ascii=False) + "\n"
        ).encode()
        if (
            self.path_chirho.exists()
            and self.path_chirho.stat().st_size + len(bytes_chirho)
            > MAX_JSON_BYTES_CHIRHO
        ):
            raise ValueError("Generation journal reached its fixed size bound")
        with self.path_chirho.open("ab") as handle_chirho:
            handle_chirho.write(bytes_chirho)
            handle_chirho.flush()
            os_chirho.fsync(handle_chirho.fileno())
        self.events_chirho.append(event_chirho)
        directory_chirho = os_chirho.open(self.path_chirho.parent, os_chirho.O_RDONLY)
        try:
            os_chirho.fsync(directory_chirho)
        finally:
            os_chirho.close(directory_chirho)
        return event_chirho

    def append_chirho(self, event_chirho):
        with self.lock_chirho:
            return self.append_locked_chirho(event_chirho)

    def state_chirho(self, lesson_chirho):
        with self.lock_chirho:
            return [
                row_chirho.copy()
                for row_chirho in self.events_chirho
                if row_chirho["lesson_id_chirho"] == lesson_chirho
            ]

    def reserve_chirho(self, job_chirho, task_chirho):
        with self.lock_chirho:
            key_chirho = (
                job_chirho["lesson_id_chirho"],
                job_chirho["scene_chirho"]["sha256_chirho"],
            )
            if key_chirho in self.prior_jobs_chirho:
                raise ValueError(
                    "This lesson/scene already has a request in an earlier run; reconcile or reuse"
                )
            if any(
                row_chirho["lesson_id_chirho"] == job_chirho["lesson_id_chirho"]
                for row_chirho in self.events_chirho
            ):
                raise ValueError(
                    "This opening already has a journal outcome; reconcile it"
                )
            reserved_chirho = estimated_cost_chirho(job_chirho)
            if (
                reservation_total_chirho(self.events_chirho, self.plan_sha_chirho)
                + reserved_chirho
                > self.cap_chirho
            ):
                raise ValueError(
                    "Next request would exceed the approved generation cap"
                )
            return self.append_locked_chirho(
                {
                    "lesson_id_chirho": job_chirho["lesson_id_chirho"],
                    "state_chirho": "requested_chirho",
                    "task_uuid_chirho": task_chirho["taskUUID"],
                    "scene_sha256_chirho": job_chirho["scene_chirho"]["sha256_chirho"],
                    "reserved_micro_usd_chirho": reserved_chirho,
                    "request_sha256_chirho": sha_chirho(
                        json_chirho.dumps(task_chirho, sort_keys=True).encode()
                    ),
                    "model_chirho": task_chirho["model"],
                    "resolution_chirho": task_chirho["resolution"],
                    "seconds_chirho": task_chirho["duration"],
                    "seed_chirho": task_chirho["seed"],
                    "prompt_chirho": task_chirho["positivePrompt"],
                }
            )


def fetched_json_chirho(tools_chirho, path_chirho, captures_chirho=None):
    bytes_chirho = tools_chirho.fetch_chirho(SITE_CHIRHO + path_chirho)
    if len(bytes_chirho) > 4 * 1024**2:
        raise ValueError("Published metadata exceeds its chapter bound")
    if captures_chirho is not None:
        captures_chirho[path_chirho] = bytes_chirho
    return json_chirho.loads(bytes_chirho), sha_chirho(bytes_chirho)


def current_recording_chirho(job_chirho, content_bytes_chirho, audio_bytes_chirho):
    """Use the reader's bounded shared selector before reserving any paid call."""
    input_chirho = json_chirho.dumps(
        {
            "lesson_id_chirho": job_chirho["lesson_id_chirho"],
            "content_chapter_json_chirho": content_bytes_chirho.decode("utf-8"),
            "content_sha256_chirho": sha_chirho(content_bytes_chirho),
            "audio_chapter_json_chirho": audio_bytes_chirho.decode("utf-8"),
            "audio_sha256_chirho": sha_chirho(audio_bytes_chirho),
        },
        ensure_ascii=False,
        separators=(",", ":"),
    ).encode("utf-8")
    if len(input_chirho) > 4 * 1024**2:
        raise ValueError("Selected soundtrack chapter packet exceeds four MiB")
    try:
        result_chirho = subprocess_chirho.run(
            [
                "bun",
                "--no-env-file",
                "--no-install",
                str(
                    ROOT_CHIRHO
                    / "scripts-chirho/video-chirho/selected_recording_chirho.ts"
                ),
            ],
            input=input_chirho,
            capture_output=True,
            cwd=ROOT_CHIRHO,
            env={
                key_chirho: os_chirho.environ[key_chirho]
                for key_chirho in ("PATH", "HOME", "TMPDIR", "LANG", "LC_ALL")
                if key_chirho in os_chirho.environ
            },
            timeout=30,
            check=False,
        )
    except (OSError, subprocess_chirho.TimeoutExpired) as error_chirho:
        raise ValueError("Current soundtrack selector is unavailable") from error_chirho
    if result_chirho.returncode != 0 or len(result_chirho.stdout) > 16 * 1024:
        raise ValueError("Current soundtrack selector refused the source")
    try:
        value_chirho = json_chirho.loads(result_chirho.stdout)
    except (ValueError, UnicodeError) as error_chirho:
        raise ValueError(
            "Current soundtrack selector returned invalid data"
        ) from error_chirho
    if (
        not isinstance(value_chirho, dict)
        or value_chirho.get("lesson_id_chirho") != job_chirho["lesson_id_chirho"]
        or not isinstance(value_chirho.get("selected_chirho"), dict)
    ):
        raise ValueError("No current selected whole-verse soundtrack")
    selected_chirho = value_chirho["selected_chirho"]
    expected_chirho = job_chirho["audio_chirho"]
    keys_chirho = (
        "sha256_chirho",
        "bytes_chirho",
        "duration_chirho",
        "recipe_id_chirho",
        "pronunciation_chirho",
        "start_offset_chirho",
        "end_offset_chirho",
        "reading_source_chirho",
    )
    if any(
        selected_chirho.get(key_chirho) != expected_chirho.get(key_chirho)
        for key_chirho in keys_chirho
    ):
        raise ValueError("The reader selected a different whole-verse soundtrack")
    if expected_chirho.get("reading_source_chirho") is None and (
        selected_chirho.get("raw_whole_verse_shape_chirho") is not True
        or not isinstance(expected_chirho.get("recipe_id_chirho"), str)
    ):
        raise ValueError("Synthetic soundtrack lacks exact whole-file identity")
    return selected_chirho


def current_picture_chirho(tools_chirho, job_chirho):
    version_chirho = tools_chirho.fetch_chirho(SITE_CHIRHO + "/_app/version.json")
    lesson_chirho = job_chirho["lesson_id_chirho"]
    book_chirho, chapter_chirho, _ = lesson_chirho.split(".")
    slug_chirho = job_chirho["slug_chirho"]
    suffix_chirho = f"{int(chapter_chirho):02d}"
    content_path_chirho = (
        f"/content-chirho/{slug_chirho}/chapter-{suffix_chirho}-chirho.json"
    )
    manifest_chirho, _ = fetched_json_chirho(
        tools_chirho, f"/content-chirho/{slug_chirho}/manifest-chirho.json"
    )
    captures_chirho = {}
    content_chirho, content_sha_chirho = fetched_json_chirho(
        tools_chirho, content_path_chirho, captures_chirho
    )
    entry_chirho = next(
        row_chirho
        for row_chirho in manifest_chirho["chapters_chirho"]
        if row_chirho["path_chirho"] == content_path_chirho
    )
    verse_chirho = next(
        row_chirho
        for row_chirho in content_chirho["verses_chirho"]
        if row_chirho["id_chirho"] == lesson_chirho
    )
    if (
        entry_chirho["sha256_chirho"] != content_sha_chirho
        or content_chirho["book_id_chirho"] != book_chirho
        or sha_chirho(verse_chirho["canonical_text_chirho"].encode())
        != job_chirho["canonical_sha256_chirho"]
    ):
        raise ValueError("Published canonical verse changed")
    audio_manifest_chirho, _ = fetched_json_chirho(
        tools_chirho, "/audio-chirho/manifest-chirho.json"
    )
    audio_path_chirho = (
        f"/audio-chirho/{slug_chirho}/chapter-{suffix_chirho}-chirho.json"
    )
    audio_entry_chirho = next(
        row_chirho
        for row_chirho in audio_manifest_chirho["books_chirho"][book_chirho][
            "chapters_chirho"
        ]
        if row_chirho["path_chirho"] == audio_path_chirho
    )
    audio_chirho, audio_sha_chirho = fetched_json_chirho(
        tools_chirho, audio_path_chirho, captures_chirho
    )
    if (
        audio_entry_chirho["sha256_chirho"] != audio_sha_chirho
        or audio_chirho["content_sha256_chirho"] != content_sha_chirho
        or sum(
            row_chirho == job_chirho["audio_chirho"]
            for row_chirho in audio_chirho.get("readings_chirho", [])
            + audio_chirho["clips_chirho"]
        )
        != 1
    ):
        raise ValueError("Published whole-verse soundtrack changed")
    current_recording_chirho(
        job_chirho,
        captures_chirho[content_path_chirho],
        captures_chirho[audio_path_chirho],
    )
    summary_chirho, _ = fetched_json_chirho(
        tools_chirho, f"/media-chirho/{slug_chirho}/summary-chirho.json"
    )
    media_path_chirho = (
        f"/media-chirho/{slug_chirho}/chapter-{suffix_chirho}-chirho.json"
    )
    media_chirho, media_sha_chirho = fetched_json_chirho(
        tools_chirho, media_path_chirho
    )
    binding_chirho = next(
        row_chirho
        for row_chirho in summary_chirho["chapters_chirho"]
        if row_chirho["path_chirho"] == media_path_chirho
    )
    if binding_chirho["sha256_chirho"] != media_sha_chirho:
        raise ValueError("Published scene chapter changed during verification")
    if any(
        row_chirho["lesson_id_chirho"] == lesson_chirho
        for row_chirho in media_chirho.get("videos_chirho", [])
    ):
        raise ValueError(
            "A published video already exists; reconcile instead of purchasing"
        )
    scenes_chirho = [
        row_chirho
        for row_chirho in media_chirho["scenes_chirho"]
        if row_chirho["lesson_id_chirho"] == lesson_chirho
        and row_chirho.get("variant_chirho", "standard") == "standard"
    ]
    if len(scenes_chirho) != 1:
        raise ValueError("Published opening scene is missing or ambiguous")
    image_chirho = tools_chirho.fetch_chirho(
        SITE_CHIRHO + scenes_chirho[0]["asset_path_chirho"]
    )
    picture_gate_chirho(job_chirho, scenes_chirho[0], image_chirho)
    latest_summary_chirho, _ = fetched_json_chirho(
        tools_chirho, f"/media-chirho/{slug_chirho}/summary-chirho.json"
    )
    latest_audio_manifest_chirho, _ = fetched_json_chirho(
        tools_chirho, "/audio-chirho/manifest-chirho.json"
    )
    latest_audio_entry_chirho = next(
        row_chirho
        for row_chirho in latest_audio_manifest_chirho["books_chirho"][book_chirho][
            "chapters_chirho"
        ]
        if row_chirho["path_chirho"] == audio_path_chirho
    )
    if (
        latest_summary_chirho != summary_chirho
        or latest_audio_entry_chirho["sha256_chirho"] != audio_sha_chirho
        or tools_chirho.fetch_chirho(SITE_CHIRHO + "/_app/version.json")
        != version_chirho
    ):
        raise ValueError(
            "Site changed during picture preflight; reconcile without purchasing"
        )
    return image_chirho


def request_chirho(tools_chirho, job_chirho, image_chirho):
    import base64 as base64_chirho

    return {
        "taskType": "videoInference",
        "taskUUID": str(uuid_chirho.uuid4()),
        "model": MODEL_CHIRHO,
        "positivePrompt": tools_chirho.camera_prompt_chirho(
            job_chirho["scene_chirho"]["alt_chirho"], 6
        ),
        "duration": job_chirho["seconds_chirho"],
        "resolution": "720p",
        "seed": job_chirho["seed_chirho"],
        "outputType": "URL",
        "outputFormat": "MP4",
        "deliveryMethod": "async",
        "includeCost": True,
        "inputs": {
            "frameImages": [
                {
                    "image": "data:image/webp;base64,"
                    + base64_chirho.b64encode(image_chirho).decode("ascii"),
                    "frame": "first",
                }
            ]
        },
        "settings": {"audio": False},
    }


def run_job_chirho(tools_chirho, key_chirho, home_chirho, journal_chirho, job_chirho):
    lesson_chirho = job_chirho["lesson_id_chirho"]
    states_chirho = journal_chirho.state_chirho(lesson_chirho)
    saved_chirho = next(
        (
            row_chirho
            for row_chirho in states_chirho
            if row_chirho["state_chirho"] == "saved_chirho"
        ),
        None,
    )
    if saved_chirho:
        path_chirho = safe_child_chirho(home_chirho, saved_chirho["path_chirho"])
        if (
            path_chirho.stat().st_size != saved_chirho["bytes_chirho"]
            or sha_chirho(path_chirho.read_bytes()) != saved_chirho["sha256_chirho"]
        ):
            raise ValueError("Saved video changed; never regenerate it automatically")
        return "saved_chirho"
    if any(
        row_chirho["state_chirho"] in {"refused_chirho", "failed_chirho", "held_chirho"}
        for row_chirho in states_chirho
    ):
        return "held_chirho"
    received_chirho = next(
        (
            row_chirho
            for row_chirho in states_chirho
            if row_chirho["state_chirho"] == "received_chirho"
        ),
        None,
    )
    requested_chirho = next(
        (
            row_chirho
            for row_chirho in states_chirho
            if row_chirho["state_chirho"] == "requested_chirho"
        ),
        None,
    )
    if not requested_chirho:
        image_chirho = current_picture_chirho(tools_chirho, job_chirho)
        task_chirho = request_chirho(tools_chirho, job_chirho, image_chirho)
        requested_chirho = journal_chirho.reserve_chirho(job_chirho, task_chirho)
        status_chirho, body_chirho = tools_chirho.post_chirho(
            key_chirho, [task_chirho], 180
        )
        if status_chirho >= 400 or body_chirho.get("errors"):
            journal_chirho.append_chirho(
                {
                    "lesson_id_chirho": lesson_chirho,
                    "state_chirho": "refused_chirho",
                    "task_uuid_chirho": task_chirho["taskUUID"],
                    "http_status_chirho": status_chirho,
                    "error_codes_chirho": [
                        row_chirho.get("code")
                        for row_chirho in body_chirho.get("errors", [])
                    ],
                }
            )
            return "held_chirho"
    task_uuid_chirho = requested_chirho["task_uuid_chirho"]
    for _index_chirho in range(90):
        if received_chirho:
            break
        time_chirho.sleep(10)
        _, body_chirho = tools_chirho.post_chirho(
            key_chirho, [{"taskType": "getResponse", "taskUUID": task_uuid_chirho}], 60
        )
        row_chirho = next(
            (
                value_chirho
                for value_chirho in body_chirho.get("data", [])
                if value_chirho.get("taskUUID") == task_uuid_chirho
            ),
            None,
        )
        if row_chirho and row_chirho.get("videoURL"):
            if not row_chirho["videoURL"].startswith("https://"):
                raise ValueError(
                    "Unexpected provider result URL; request remains reserved"
                )
            received_chirho = journal_chirho.append_chirho(
                {
                    "lesson_id_chirho": lesson_chirho,
                    "state_chirho": "received_chirho",
                    "task_uuid_chirho": task_uuid_chirho,
                    "video_url_chirho": row_chirho["videoURL"],
                    "cost_usd_chirho": row_chirho.get("cost"),
                }
            )
            break
        errors_chirho = [
            value_chirho
            for value_chirho in body_chirho.get("errors", [])
            if value_chirho.get("code") != "taskNotFound"
        ]
        if errors_chirho or (
            row_chirho and row_chirho.get("status") in {"error", "failed"}
        ):
            journal_chirho.append_chirho(
                {
                    "lesson_id_chirho": lesson_chirho,
                    "state_chirho": "failed_chirho",
                    "task_uuid_chirho": task_uuid_chirho,
                    "error_codes_chirho": [
                        value_chirho.get("code") for value_chirho in errors_chirho
                    ],
                }
            )
            return "held_chirho"
    if not received_chirho:
        return "pending_chirho"
    bytes_chirho = tools_chirho.fetch_chirho(received_chirho["video_url_chirho"])
    if not 1 <= len(bytes_chirho) <= 32 * 1024**2:
        raise ValueError("Provider video is empty or oversized")
    relative_chirho = (
        f"clips-chirho/{lesson_chirho.lower().replace('.', '-')}-chirho.mp4"
    )
    path_chirho = safe_child_chirho(home_chirho, relative_chirho)
    path_chirho.parent.mkdir(exist_ok=True)
    partial_chirho = path_chirho.with_suffix(".part-chirho")
    with partial_chirho.open("wb") as handle_chirho:
        handle_chirho.write(bytes_chirho)
        handle_chirho.flush()
        os_chirho.fsync(handle_chirho.fileno())
    probe_chirho = subprocess_chirho.run(
        [
            "ffprobe",
            "-v",
            "error",
            "-show_streams",
            "-show_format",
            "-of",
            "json",
            str(partial_chirho),
        ],
        check=True,
        capture_output=True,
        text=True,
        timeout=30,
    )
    metadata_chirho = json_chirho.loads(probe_chirho.stdout)
    pictures_chirho = [
        row_chirho
        for row_chirho in metadata_chirho["streams"]
        if row_chirho["codec_type"] == "video"
    ]
    if (
        len(pictures_chirho) != 1
        or pictures_chirho[0]["codec_name"] != "h264"
        or abs(
            float(metadata_chirho["format"]["duration"]) - job_chirho["seconds_chirho"]
        )
        > 0.2
    ):
        raise ValueError(
            "Unexpected provider codec or duration; retain result for review"
        )
    subprocess_chirho.run(
        [
            "ffmpeg",
            "-v",
            "error",
            "-xerror",
            "-nostdin",
            "-i",
            str(partial_chirho),
            "-f",
            "null",
            "-",
        ],
        check=True,
        capture_output=True,
        timeout=60,
    )
    partial_chirho.replace(path_chirho)
    journal_chirho.append_chirho(
        {
            "lesson_id_chirho": lesson_chirho,
            "state_chirho": "saved_chirho",
            "task_uuid_chirho": task_uuid_chirho,
            "path_chirho": relative_chirho,
            "sha256_chirho": sha_chirho(bytes_chirho),
            "bytes_chirho": len(bytes_chirho),
            "probe_chirho": metadata_chirho,
        }
    )
    return "saved_pending_review_chirho"


def main_chirho():
    parser_chirho = argparse_chirho.ArgumentParser(description=__doc__)
    parser_chirho.add_argument("--plan-chirho", required=True, type=PathChirho)
    parser_chirho.add_argument("--plan-sha-chirho", required=True)
    parser_chirho.add_argument("--authority-chirho", type=PathChirho)
    parser_chirho.add_argument("--authority-sha-chirho")
    parser_chirho.add_argument("--maximum-jobs-chirho", type=int, default=2)
    parser_chirho.add_argument(
        "--concurrency-chirho", type=int, choices=(1, 2), default=2
    )
    parser_chirho.add_argument("--apply-chirho", action="store_true")
    args_chirho = parser_chirho.parse_args()
    plan_chirho, plan_sha_chirho = read_json_chirho(
        args_chirho.plan_chirho, args_chirho.plan_sha_chirho
    )
    validate_plan_chirho(plan_chirho)
    inventory_path_chirho = safe_child_chirho(
        ROOT_CHIRHO, plan_chirho["inventory_path_chirho"]
    )
    inventory_chirho, _ = read_json_chirho(
        inventory_path_chirho, plan_chirho["inventory_sha256_chirho"]
    )
    bind_inventory_chirho(plan_chirho, inventory_chirho)
    legacy_path_chirho = (
        ROOT_CHIRHO
        / "workspace-chirho/video-chirho/tools-chirho/pixverse_clip_chirho.py"
    )
    if (
        sha_chirho(legacy_path_chirho.read_bytes())
        != plan_chirho["legacy_tool_sha256_chirho"]
    ):
        raise ValueError("Pinned provider helper changed; reconcile before generation")
    ready_chirho = [
        row_chirho
        for row_chirho in plan_chirho["jobs_chirho"]
        if not row_chirho["holds_chirho"]
    ]
    if not args_chirho.apply_chirho:
        print(
            json_chirho.dumps(
                {
                    "jobs_chirho": len(plan_chirho["jobs_chirho"]),
                    "unheld_chirho": len(ready_chirho),
                    "estimated_micro_usd_chirho": sum(
                        estimated_cost_chirho(row_chirho) for row_chirho in ready_chirho
                    ),
                    "provider_calls_chirho": 0,
                }
            )
        )
        return
    if not args_chirho.authority_chirho or not args_chirho.authority_sha_chirho:
        raise ValueError("Apply requires the pinned direct-user spending authorization")
    authority_chirho, _ = read_json_chirho(
        args_chirho.authority_chirho, args_chirho.authority_sha_chirho
    )
    cap_chirho = validate_authority_chirho(authority_chirho, plan_sha_chirho)
    if not 1 <= args_chirho.maximum_jobs_chirho <= 66:
        raise ValueError("Each invocation is bounded to at most 66 jobs")
    home_chirho = safe_child_chirho(
        HOME_CHIRHO, f"runs-chirho/{plan_sha_chirho}-chirho"
    )
    home_chirho.mkdir(parents=True, exist_ok=True)
    lock_path_chirho = HOME_CHIRHO / "generation-chirho.lock"
    if lock_path_chirho.is_symlink():
        raise ValueError("Linked run lock")
    with lock_path_chirho.open("a") as lock_chirho:
        fcntl_chirho.flock(lock_chirho, fcntl_chirho.LOCK_EX | fcntl_chirho.LOCK_NB)
        prior_jobs_chirho = set()
        prior_paths_chirho = list(
            (HOME_CHIRHO / "runs-chirho").glob("*/journal-chirho.jsonl")
        )
        if len(prior_paths_chirho) > 100:
            raise ValueError("Generation run history requires cold retirement")
        prior_paths_chirho.extend(
            [
                ROOT_CHIRHO
                / "workspace-chirho/video-chirho/proverbs-first-verses-2026-11-06-chirho/journal-chirho.jsonl",
                ROOT_CHIRHO
                / "workspace-chirho/video-chirho/genesis-1-3-pixverse-2026-11-06-chirho/journal-chirho.jsonl",
            ]
        )
        for prior_path_chirho in prior_paths_chirho:
            if prior_path_chirho == home_chirho / "journal-chirho.jsonl":
                continue
            if (
                prior_path_chirho.is_symlink()
                or prior_path_chirho.stat().st_size > MAX_JSON_BYTES_CHIRHO
            ):
                raise ValueError("Prior generation journal is linked or oversized")
            for line_chirho in prior_path_chirho.read_text().splitlines():
                event_chirho = json_chirho.loads(line_chirho)
                if event_chirho.get("state_chirho") in {
                    "requested",
                    "requested_chirho",
                }:
                    prior_jobs_chirho.add(
                        (
                            event_chirho.get(
                                "lesson_id_chirho", event_chirho.get("verse_id_chirho")
                            ),
                            event_chirho["scene_sha256_chirho"],
                        )
                    )
        journal_chirho = JournalChirho(
            home_chirho, plan_sha_chirho, cap_chirho, prior_jobs_chirho
        )
        tools_chirho = legacy_tools_chirho(home_chirho)
        key_chirho = tools_chirho.key_chirho(ROOT_CHIRHO / ".env")
        candidates_chirho = [
            row_chirho
            for row_chirho in ready_chirho
            if not any(
                event_chirho["state_chirho"]
                in {"saved_chirho", "refused_chirho", "failed_chirho", "held_chirho"}
                for event_chirho in journal_chirho.state_chirho(
                    row_chirho["lesson_id_chirho"]
                )
            )
        ][: args_chirho.maximum_jobs_chirho]
        with futures_chirho.ThreadPoolExecutor(
            max_workers=args_chirho.concurrency_chirho
        ) as pool_chirho:
            futures_list_chirho = {
                pool_chirho.submit(
                    run_job_chirho,
                    tools_chirho,
                    key_chirho,
                    home_chirho,
                    journal_chirho,
                    row_chirho,
                ): row_chirho["lesson_id_chirho"]
                for row_chirho in candidates_chirho
            }
            for future_chirho in futures_chirho.as_completed(futures_list_chirho):
                print(
                    json_chirho.dumps(
                        {
                            "lesson_id_chirho": futures_list_chirho[future_chirho],
                            "state_chirho": future_chirho.result(),
                        }
                    ),
                    flush=True,
                )


if __name__ == "__main__":
    main_chirho()
