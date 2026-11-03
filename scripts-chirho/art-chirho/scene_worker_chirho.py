#!/usr/bin/env python3
# For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life. — John 3:16 (KJV)
"""Checkpointed local Proverbs scene worker. Run only after the other scene writer hands off."""

import argparse
import fcntl
import hashlib
import importlib.util
import json
import os
import re
import signal
import subprocess
import sys
import threading
import time
import uuid
from concurrent.futures import FIRST_COMPLETED, ThreadPoolExecutor, wait
from datetime import UTC, datetime, timedelta
from pathlib import Path

ROOT_CHIRHO = Path(__file__).resolve().parents[2]
QUEUE_CHIRHO = Path("workspace-chirho/art-chirho/queue-chirho/scene-worker-chirho")
JOBS_CHIRHO = Path("data-chirho/corpus-chirho/proverbs-image-jobs-chirho.json")
MANIFESTS_CHIRHO = [
    Path("data-chirho/media-chirho/proverbs-scenes-chirho.json"),
    Path("data-chirho/media-chirho/proverbs-worker-scenes-chirho.json"),
]
STYLE_CHIRHO = "/assets-chirho/proverbs-26-1-scene-chirho.webp"
BRIEF_SPEC_CHIRHO = importlib.util.spec_from_file_location(
    "scene_briefs_chirho", Path(__file__).parent / "recovery-chirho/scene_briefs_chirho.py"
)
BRIEFS_CHIRHO = importlib.util.module_from_spec(BRIEF_SPEC_CHIRHO)
BRIEF_SPEC_CHIRHO.loader.exec_module(BRIEFS_CHIRHO)
REMOTE_SPEC_CHIRHO = importlib.util.spec_from_file_location(
    "scene_remote_artwork_chirho",
    Path(__file__).resolve().parents[1] / "publish-chirho/r2-chirho/remote_artwork_chirho.py",
)
REMOTE_CHIRHO = importlib.util.module_from_spec(REMOTE_SPEC_CHIRHO)
REMOTE_SPEC_CHIRHO.loader.exec_module(REMOTE_CHIRHO)


def remote_record_chirho(root_chirho, record_chirho):
    if REMOTE_CHIRHO.source_fact_chirho(root_chirho, record_chirho, "scene") is None:
        raise ValueError("Missing scene has no verified R2 source")


def style_digest_chirho(root_chirho):
    path_chirho = root_chirho / "static" / STYLE_CHIRHO.lstrip("/")
    if path_chirho.exists():
        return digest_chirho(path_chirho)
    catalogue_chirho = REMOTE_CHIRHO.catalogue_chirho(root_chirho)
    rows_chirho = [
        row_chirho
        for row_chirho in (catalogue_chirho or {}).values()
        if STYLE_CHIRHO in row_chirho["source_paths_chirho"]
    ]
    if len(rows_chirho) != 1:
        raise ValueError("Style reference has no unique verified R2 source")
    return rows_chirho[0]["source_chirho"]["sha256_chirho"]


STOP_CHIRHO = False
DRAIN_CHIRHO = False
CHILDREN_CHIRHO = {}
CHILD_LOCK_CHIRHO = threading.RLock()
MAX_CONCURRENCY_CHIRHO = 3


def atomic_json_chirho(path_chirho, value_chirho):
    path_chirho.parent.mkdir(parents=True, exist_ok=True)
    temp_chirho = path_chirho.with_name(path_chirho.name + "." + uuid.uuid4().hex + ".tmp")
    try:
        with temp_chirho.open("x", encoding="utf-8") as file_chirho:
            text_chirho = json.dumps(value_chirho, ensure_ascii=False, indent="\t") + "\n"
            if path_chirho.name.endswith("-worker-scenes-chirho.json"):
                text_chirho = subprocess.run(
                    ["bunx", "prettier", "--stdin-filepath", str(path_chirho)],
                    input=text_chirho,
                    text=True,
                    capture_output=True,
                    check=True,
                ).stdout
            file_chirho.write(text_chirho)
            file_chirho.flush()
            os.fsync(file_chirho.fileno())
        os.replace(temp_chirho, path_chirho)
        fd_chirho = os.open(path_chirho.parent, os.O_RDONLY)
        try:
            os.fsync(fd_chirho)
        finally:
            os.close(fd_chirho)
    finally:
        temp_chirho.unlink(missing_ok=True)


def load_chirho(path_chirho):
    with path_chirho.open(encoding="utf-8") as file_chirho:
        return json.load(file_chirho)


def digest_chirho(path_chirho):
    return hashlib.sha256(path_chirho.read_bytes()).hexdigest()


def image_info_chirho(path_chirho):
    output_chirho = subprocess.check_output(
        ["magick", "identify", "-format", "%m %w %h", str(path_chirho)], text=True
    ).split()
    if len(output_chirho) != 3 or output_chirho[0] != "WEBP":
        raise ValueError("Image is not a single WebP")
    width_chirho, height_chirho = map(int, output_chirho[1:])
    if width_chirho < 800 or height_chirho < 600 or width_chirho * 3 != height_chirho * 4:
        raise ValueError("Image must be at least 800x600 and exactly 4:3")
    return width_chirho, height_chirho


def checked_path_chirho(root_chirho, asset_chirho, allow_primary_chirho=False):
    version_chirho = (
        r"(?:proverbs-worker-v1-chirho|proverbs-v1-chirho)"
        if allow_primary_chirho
        else "proverbs-worker-v1-chirho"
    )
    if not re.fullmatch(
        r"/assets-chirho/scenes-chirho/"
        + version_chirho
        + r"/chapter-\d{2}-chirho/prov-\d{2}-\d{3}-chirho\.webp",
        asset_chirho,
    ):
        raise ValueError("Invalid worker asset path")
    return root_chirho / "static" / asset_chirho.lstrip("/")


def asset_name_chirho(job_chirho):
    return f"/assets-chirho/scenes-chirho/proverbs-worker-v1-chirho/chapter-{job_chirho['chapter_chirho']:02d}-chirho/prov-{job_chirho['chapter_chirho']:02d}-{job_chirho['verse_chirho']:03d}-chirho.webp"


def verify_record_chirho(root_chirho, record_chirho):
    path_chirho = checked_path_chirho(
        root_chirho, record_chirho["asset_path_chirho"], allow_primary_chirho=True
    )
    if not path_chirho.exists():
        remote_record_chirho(root_chirho, record_chirho)
        return
    width_chirho, height_chirho = image_info_chirho(path_chirho)
    if (width_chirho, height_chirho) != (
        record_chirho["width_chirho"],
        record_chirho["height_chirho"],
    ) or digest_chirho(path_chirho) != record_chirho["sha256_chirho"]:
        raise ValueError("Manifest asset checksum or dimensions do not match")


def load_queue_chirho(root_chirho):
    jobs_chirho = load_chirho(root_chirho / JOBS_CHIRHO)["jobs_chirho"]
    seen_chirho = {"Prov.26.1"}
    for manifest_chirho in MANIFESTS_CHIRHO:
        for record_chirho in load_chirho(root_chirho / manifest_chirho)["scenes_chirho"]:
            seen_chirho.add(record_chirho["lesson_id_chirho"])
            verify_record_chirho(root_chirho, record_chirho)
    return iter(
        job_chirho for job_chirho in jobs_chirho if job_chirho["id_chirho"] not in seen_chirho
    ), seen_chirho


def prompt_chirho(root_chirho, job_chirho, attempt_chirho):
    chapter_chirho = root_chirho / "static" / job_chirho["content_path_chirho"].lstrip("/")
    verses_chirho = [
        item_chirho
        for item_chirho in load_chirho(chapter_chirho)["verses_chirho"]
        if item_chirho["id_chirho"] == job_chirho["id_chirho"]
    ]
    if (
        len(verses_chirho) != 1
        or verses_chirho[0]["canonical_text_chirho"] != job_chirho["canonical_text_chirho"]
        or hashlib.sha256(job_chirho["canonical_text_chirho"].encode()).hexdigest()
        != job_chirho["canonical_sha256_chirho"]
    ):
        raise ValueError("Scene source does not match its pinned verse job")
    input_chirho = attempt_chirho / "verse-input-chirho.json"
    input_data_chirho = {"job_chirho": job_chirho, "verse_chirho": verses_chirho[0]}
    brief_chirho = BRIEFS_CHIRHO.read_chirho(root_chirho, job_chirho)
    if brief_chirho is not None:
        input_data_chirho["reusable_brief_chirho"] = brief_chirho
    atomic_json_chirho(input_chirho, input_data_chirho)
    style_chirho = root_chirho / "static" / STYLE_CHIRHO.lstrip("/")
    return f"""Create one single original scene for {job_chirho["reference_chirho"]} ({job_chirho["id_chirho"]}). Read its exact pinned verse, approved token glosses and job from {input_chirho}; this is the complete source excerpt for this scene, so no other chapter or queue needs to be read. Use {style_chirho} as a style-only reference: first inspect it using view_image. Render an imaginative, faithful verse-specific scene in its warm detailed hand-painted watercolor storybook style, 4:3 landscape, no lettering, border, collage, or watermark. For figurative warnings involving injury, depict the lesson through safe actions or objects, without portraying self-harm. Explain that imaginative interpretation in reading_note_chirho. Use only the built-in image_gen.imagegen tool, supplying the style image as reference. Never use API/CLI fallback or other generators; if unavailable or it fails, stop. Inspect the actual generated image with view_image and ensure it matches the verse and contains no inappropriate text. Save a centered 4:3 crop as WebP at {attempt_chirho / "scene-chirho.webp"} with ImageMagick. In {attempt_chirho / "record-chirho.json"}, write a JSON object with these keys: verse_explanation_chirho (a reusable explanation of the verse itself, independent of this particular image; {BRIEFS_CHIRHO.instruction_chirho(brief_chirho)}), alt_chirho (accurate visual description), reading_note_chirho (brief verse relationship, identify it as imaginative), prompt_chirho (the actual complete image generator prompt). Do not write any other project files. Do not claim success without those files."""


def run_generator_chirho(root_chirho, job_chirho, attempt_chirho, queue_chirho):
    instruction_chirho = prompt_chirho(root_chirho, job_chirho, attempt_chirho)
    log_chirho = queue_chirho / (attempt_chirho.name + ".jsonl")
    start_chirho = datetime.now(UTC).date()
    with log_chirho.open("x", encoding="utf-8") as file_chirho:
        with CHILD_LOCK_CHIRHO:
            if STOP_CHIRHO:
                raise RuntimeError("Worker stopped before generator dispatch")
            command_chirho = [
                "codex",
                "exec",
                "-m",
                "gpt-6.1-terra",
                "-c",
                "daybreak=false",
                "-s",
                "workspace-write",
                "--json",
                instruction_chirho,
            ]
            style_chirho = root_chirho / "static" / STYLE_CHIRHO.lstrip("/")
            if not style_chirho.exists():
                command_chirho = [
                    "bun",
                    str(
                        root_chirho
                        / "scripts-chirho/publish-chirho/r2-chirho/with-artwork-chirho.ts"
                    ),
                    str(style_chirho),
                    "--",
                    *command_chirho,
                ]
            child_chirho = subprocess.Popen(
                command_chirho,
                cwd=root_chirho,
                stdin=subprocess.DEVNULL,
                stdout=file_chirho,
                stderr=subprocess.STDOUT,
                start_new_session=True,
            )
            CHILDREN_CHIRHO[child_chirho.pid] = child_chirho
        try:
            code_chirho = child_chirho.wait(timeout=600)
        except subprocess.TimeoutExpired:
            os.killpg(child_chirho.pid, signal.SIGTERM)
            try:
                child_chirho.wait(timeout=10)
            except subprocess.TimeoutExpired:
                os.killpg(child_chirho.pid, signal.SIGKILL)
                child_chirho.wait()
            raise RuntimeError("Generator timed out")
        finally:
            with CHILD_LOCK_CHIRHO:
                CHILDREN_CHIRHO.pop(child_chirho.pid, None)
    if code_chirho != 0 or STOP_CHIRHO:
        raise RuntimeError(f"Generator interrupted or exited {code_chirho}; see {log_chirho}")
    attest_generator_chirho(log_chirho, start_chirho)


def attest_generator_chirho(log_chirho, start_chirho=None):
    """Verify a saved original before normal installation; see art-recovery-chirho.md."""
    if start_chirho is None:
        start_chirho = datetime.fromtimestamp(log_chirho.stat().st_mtime, UTC).date()
    # The JSONL stream omits built-in tool events. Verify the saved Codex rollout instead.
    events_chirho = [
        json.loads(line_chirho)
        for line_chirho in log_chirho.read_text().splitlines()
        if line_chirho.startswith("{")
    ]
    thread_chirho = next(
        (
            event_chirho.get("thread_id")
            for event_chirho in events_chirho
            if event_chirho.get("type") == "thread.started"
        ),
        None,
    )
    if not thread_chirho or not re.fullmatch(r"[0-9a-f-]{36}", thread_chirho):
        raise ValueError("Missing Codex thread id")
    sessions_chirho = Path.home() / ".codex/sessions"
    end_chirho = datetime.now(UTC).date()
    day_chirho = start_chirho - timedelta(days=1)
    rollouts_chirho = []
    while day_chirho <= end_chirho + timedelta(days=1):
        directory_chirho = sessions_chirho / day_chirho.strftime("%Y/%m/%d")
        rollouts_chirho.extend(directory_chirho.glob(f"rollout-*-{thread_chirho}.jsonl"))
        day_chirho += timedelta(days=1)
    if len(rollouts_chirho) != 1:
        raise ValueError("Cannot verify generator tool call")
    found_chirho = False
    with rollouts_chirho[0].open(encoding="utf-8") as file_chirho:
        for line_chirho in file_chirho:
            row_chirho = json.loads(line_chirho)
            payload_chirho = row_chirho.get("payload", {})
            if (
                row_chirho.get("type") == "response_item"
                and payload_chirho.get("type") == "custom_tool_call"
                and "tools.image_gen__imagegen(" in payload_chirho.get("input", "")
            ):
                found_chirho = True
    if not found_chirho:
        raise ValueError("No built-in image_gen call in worker rollout")


def finish_chirho(root_chirho, job_chirho, attempt_chirho):
    raw_chirho = load_chirho(attempt_chirho / "record-chirho.json")
    for key_chirho in ("alt_chirho", "reading_note_chirho", "prompt_chirho"):
        if not isinstance(raw_chirho.get(key_chirho), str) or not raw_chirho[key_chirho].strip():
            raise ValueError("Missing scene description or actual prompt")
    BRIEFS_CHIRHO.retain_chirho(root_chirho, job_chirho, raw_chirho.get("verse_explanation_chirho"))
    source_chirho = attempt_chirho / "scene-chirho.webp"
    width_chirho, height_chirho = image_info_chirho(source_chirho)
    asset_chirho = asset_name_chirho(job_chirho)
    record_chirho = {
        "lesson_id_chirho": job_chirho["id_chirho"],
        "asset_path_chirho": asset_chirho,
        "alt_chirho": raw_chirho["alt_chirho"],
        "width_chirho": width_chirho,
        "height_chirho": height_chirho,
        "sha256_chirho": digest_chirho(source_chirho),
        "art_review_chirho": "pending",
        "reading_note_chirho": raw_chirho["reading_note_chirho"],
        "prompt_chirho": raw_chirho["prompt_chirho"],
        "tool_chirho": "image_gen.imagegen",
        "model_chirho": "tool-managed; not exposed",
        "style_reference_chirho": STYLE_CHIRHO,
    }
    atomic_json_chirho(attempt_chirho / "prepared-chirho.json", record_chirho)
    install_chirho(root_chirho, attempt_chirho, record_chirho)


def install_chirho(root_chirho, attempt_chirho, record_chirho):
    destination_chirho = checked_path_chirho(root_chirho, record_chirho["asset_path_chirho"])
    destination_chirho.parent.mkdir(parents=True, exist_ok=True)
    with (attempt_chirho / "scene-chirho.webp").open("rb") as file_chirho:
        os.fsync(file_chirho.fileno())
    try:
        os.link(attempt_chirho / "scene-chirho.webp", destination_chirho)
    except FileExistsError:
        if digest_chirho(destination_chirho) != record_chirho["sha256_chirho"]:
            raise ValueError("Destination exists with different content; refusing overwrite")
    dir_fd_chirho = os.open(destination_chirho.parent, os.O_RDONLY)
    try:
        os.fsync(dir_fd_chirho)
    finally:
        os.close(dir_fd_chirho)
    verify_record_chirho(root_chirho, record_chirho)
    for manifest_path_chirho in MANIFESTS_CHIRHO:
        manifest_chirho = load_chirho(root_chirho / manifest_path_chirho)
        matches_chirho = [
            item_chirho
            for item_chirho in manifest_chirho["scenes_chirho"]
            if item_chirho["lesson_id_chirho"] == record_chirho["lesson_id_chirho"]
        ]
        if matches_chirho:
            if manifest_path_chirho != MANIFESTS_CHIRHO[1] or matches_chirho != [record_chirho]:
                raise ValueError("Conflicting existing scene; stopping")
            (attempt_chirho / "prepared-chirho.json").unlink(missing_ok=True)
            return
    manifest_chirho = load_chirho(root_chirho / MANIFESTS_CHIRHO[1])
    manifest_chirho["scenes_chirho"].append(record_chirho)
    atomic_json_chirho(root_chirho / MANIFESTS_CHIRHO[1], manifest_chirho)
    (attempt_chirho / "prepared-chirho.json").unlink(missing_ok=True)


def stop_handler_chirho(signum_chirho, frame_chirho):
    global STOP_CHIRHO
    STOP_CHIRHO = True
    with CHILD_LOCK_CHIRHO:
        children_chirho = list(CHILDREN_CHIRHO.values())
    for child_chirho in children_chirho:
        if child_chirho.poll() is not None:
            continue
        try:
            os.killpg(child_chirho.pid, signal.SIGTERM)
        except ProcessLookupError:
            pass


def drain_handler_chirho(signum_chirho, frame_chirho):
    global DRAIN_CHIRHO
    DRAIN_CHIRHO = True


ERRORS_CHIRHO = (
    OSError,
    RuntimeError,
    ValueError,
    KeyError,
    TypeError,
    subprocess.SubprocessError,
)


def recover_queue_chirho(root_chirho, queue_chirho, progress_chirho):
    """Recover installed checkpoints without repeating an uncertain image generation."""
    for prepared_chirho in sorted(queue_chirho.glob("attempt-*/prepared-chirho.json")):
        install_chirho(root_chirho, prepared_chirho.parent, load_chirho(prepared_chirho))
    pending_chirho, seen_chirho = load_queue_chirho(root_chirho)
    previous_chirho = load_chirho(progress_chirho) if progress_chirho.exists() else {}
    if (
        "active_jobs_chirho" in previous_chirho
        or previous_chirho.get("attempt_chirho")
        or previous_chirho.get("state_chirho") in ("generating", "needs_reconciliation")
    ):
        prior_chirho = previous_chirho.get("active_jobs_chirho", [previous_chirho])
        if (
            not isinstance(prior_chirho, list)
            or not 1 <= len(prior_chirho) <= MAX_CONCURRENCY_CHIRHO
            or not all(isinstance(item_chirho, dict) for item_chirho in prior_chirho)
        ):
            raise ValueError("Invalid in-flight scene checkpoint; manual reconciliation required")
        unresolved_chirho = [
            item_chirho
            for item_chirho in prior_chirho
            if item_chirho.get("verse_id_chirho") not in seen_chirho
        ]
        if unresolved_chirho:
            atomic_json_chirho(
                progress_chirho,
                {
                    **previous_chirho,
                    "state_chirho": "needs_reconciliation",
                    "active_jobs_chirho": unresolved_chirho,
                    "message_chirho": "Prior generations may have finished; inspect every unresolved attempt and rollout before restarting.",
                },
            )
            return None
    return pending_chirho, seen_chirho


def active_record_chirho(context_chirho):
    return {
        "verse_id_chirho": context_chirho["job_chirho"]["id_chirho"],
        "attempt_chirho": context_chirho["attempt_chirho"].name,
        "started_at_chirho": context_chirho["started_at_chirho"],
    }


def record_active_chirho(progress_chirho, active_chirho, unresolved_chirho, concurrency_chirho):
    records_chirho = unresolved_chirho + [
        active_record_chirho(item_chirho) for item_chirho in active_chirho
    ]
    if records_chirho:
        atomic_json_chirho(
            progress_chirho,
            {
                "state_chirho": "needs_reconciliation" if unresolved_chirho else "generating",
                **records_chirho[0],
                "concurrency_chirho": concurrency_chirho,
                "active_jobs_chirho": records_chirho,
            },
        )


def finish_with_recovery_chirho(root_chirho, job_chirho, attempt_chirho, backoff_chirho):
    """Only retry an already prepared local installation, never the generator."""
    try:
        finish_chirho(root_chirho, job_chirho, attempt_chirho)
        return
    except ERRORS_CHIRHO:
        prepared_chirho = attempt_chirho / "prepared-chirho.json"
        if not prepared_chirho.exists():
            raise
    for retry_chirho in range(1, 3):
        time.sleep(backoff_chirho * retry_chirho)
        try:
            install_chirho(root_chirho, attempt_chirho, load_chirho(prepared_chirho))
            return
        except ERRORS_CHIRHO:
            if retry_chirho == 2:
                raise


def dispatch_chirho(
    root_chirho,
    queue_chirho,
    progress_chirho,
    pending_chirho,
    generator_chirho,
    concurrency_chirho,
    once_chirho,
    backoff_chirho,
):
    """One owner dispatches bounded jobs and serializes all installs; see art-recovery-chirho.md."""
    active_chirho = []
    unresolved_chirho = []
    dispatched_chirho = set()
    exhausted_chirho = False
    completed_id_chirho = None
    with ThreadPoolExecutor(max_workers=concurrency_chirho) as pool_chirho:
        while active_chirho or not exhausted_chirho:
            while (
                len(active_chirho) < concurrency_chirho
                and not exhausted_chirho
                and not unresolved_chirho
                and not STOP_CHIRHO
                and not DRAIN_CHIRHO
            ):
                job_chirho = next(pending_chirho, None)
                if job_chirho is None:
                    exhausted_chirho = True
                    break
                if job_chirho["id_chirho"] in dispatched_chirho:
                    raise ValueError("Duplicate verse in scene dispatch queue")
                attempt_chirho = queue_chirho / ("attempt-" + uuid.uuid4().hex)
                attempt_chirho.mkdir()
                context_chirho = {
                    "job_chirho": job_chirho,
                    "attempt_chirho": attempt_chirho,
                    "started_at_chirho": datetime.now(UTC).isoformat(),
                }
                active_chirho.append(context_chirho)
                # Durable identities precede every launch, including crashes during submission.
                record_active_chirho(progress_chirho, active_chirho, [], concurrency_chirho)
                context_chirho["future_chirho"] = pool_chirho.submit(
                    generator_chirho, root_chirho, job_chirho, attempt_chirho, queue_chirho
                )
                dispatched_chirho.add(job_chirho["id_chirho"])
                if once_chirho:
                    exhausted_chirho = True
            if not active_chirho:
                break
            done_chirho, _pending_futures_chirho = wait(
                [item_chirho["future_chirho"] for item_chirho in active_chirho],
                timeout=0.5,
                return_when=FIRST_COMPLETED,
            )
            for context_chirho in list(active_chirho):
                if context_chirho["future_chirho"] not in done_chirho:
                    continue
                try:
                    context_chirho["future_chirho"].result()
                    finish_with_recovery_chirho(
                        root_chirho,
                        context_chirho["job_chirho"],
                        context_chirho["attempt_chirho"],
                        backoff_chirho,
                    )
                    completed_id_chirho = context_chirho["job_chirho"]["id_chirho"]
                except ERRORS_CHIRHO as error_chirho:
                    unresolved_chirho.append(
                        {**active_record_chirho(context_chirho), "error_chirho": str(error_chirho)}
                    )
                active_chirho.remove(context_chirho)
                record_active_chirho(
                    progress_chirho, active_chirho, unresolved_chirho, concurrency_chirho
                )
            if unresolved_chirho or STOP_CHIRHO or DRAIN_CHIRHO:
                # Drain already-started jobs; no new image call after an observed failure.
                exhausted_chirho = True
    if unresolved_chirho:
        return 1
    if STOP_CHIRHO or DRAIN_CHIRHO:
        value_chirho = {
            "state_chirho": "stopped",
            "message_chirho": "Drained all started scenes; no unresolved attempt.",
        }
    elif once_chirho and completed_id_chirho:
        value_chirho = {"state_chirho": "completed", "verse_id_chirho": completed_id_chirho}
    else:
        value_chirho = {
            "state_chirho": "proverbs_complete_john_next",
            "message_chirho": "All Proverbs scenes installed; John follows under the book supervisor.",
        }
    atomic_json_chirho(progress_chirho, value_chirho)
    return 0


def work_chirho(
    root_chirho,
    generator_chirho=run_generator_chirho,
    once_chirho=False,
    backoff_chirho=30,
    concurrency_chirho=1,
):
    if type(concurrency_chirho) is not int or not 1 <= concurrency_chirho <= MAX_CONCURRENCY_CHIRHO:
        raise ValueError("Scene concurrency must be between one and three")
    concurrency_chirho = 1 if once_chirho else concurrency_chirho
    queue_chirho = root_chirho / QUEUE_CHIRHO
    queue_chirho.mkdir(parents=True, exist_ok=True)
    with (queue_chirho / "worker.lock").open("a") as lock_chirho:
        try:
            fcntl.flock(lock_chirho, fcntl.LOCK_EX | fcntl.LOCK_NB)
        except BlockingIOError:
            raise RuntimeError("Another scene worker holds the lock")
        progress_chirho = queue_chirho / "progress-chirho.json"
        saved_chirho = load_chirho(progress_chirho) if progress_chirho.exists() else {}
        failures_chirho = saved_chirho.get("consecutive_failures_chirho", 0)
        if failures_chirho >= 3:
            return 1
        while not STOP_CHIRHO:
            try:
                recovered_chirho = recover_queue_chirho(root_chirho, queue_chirho, progress_chirho)
                break
            except ERRORS_CHIRHO as error_chirho:
                failures_chirho += 1
                atomic_json_chirho(
                    progress_chirho,
                    {
                        **saved_chirho,
                        "state_chirho": "stopped" if failures_chirho >= 3 else "retrying",
                        "error_chirho": str(error_chirho),
                        "consecutive_failures_chirho": failures_chirho,
                    },
                )
                if failures_chirho >= 3:
                    return 1
                time.sleep(backoff_chirho * failures_chirho)
        else:
            return 0
        if recovered_chirho is None:
            return 1
        pending_chirho, _seen_chirho = recovered_chirho
        return dispatch_chirho(
            root_chirho,
            queue_chirho,
            progress_chirho,
            pending_chirho,
            generator_chirho,
            concurrency_chirho,
            once_chirho,
            backoff_chirho,
        )


def main_chirho():
    parser_chirho = argparse.ArgumentParser(description=__doc__)
    parser_chirho.add_argument("--once", action="store_true", help="Generate at most one new verse")
    parser_chirho.add_argument(
        "--concurrency-chirho",
        type=int,
        choices=range(1, MAX_CONCURRENCY_CHIRHO + 1),
        default=1,
        help="Bound in-flight generations; one owner installs completed scenes",
    )
    args_chirho = parser_chirho.parse_args()
    signal.signal(signal.SIGTERM, stop_handler_chirho)
    signal.signal(signal.SIGINT, stop_handler_chirho)
    signal.signal(signal.SIGUSR1, drain_handler_chirho)
    try:
        return work_chirho(
            ROOT_CHIRHO,
            once_chirho=args_chirho.once,
            concurrency_chirho=args_chirho.concurrency_chirho,
        )
    except (OSError, RuntimeError, ValueError) as error_chirho:
        print(str(error_chirho), file=sys.stderr)
        return 1


if __name__ == "__main__":
    sys.exit(main_chirho())
