#!/usr/bin/env python3
# For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life. — John 3:16 (KJV)
"""Local ordered scene supervisor; no provider fallback or publication."""

import argparse
import fcntl
import hashlib
import importlib.util
import os
import signal
import subprocess
import sys
import threading
from pathlib import Path
from types import SimpleNamespace

ROOT_CHIRHO = Path(__file__).resolve().parents[2]
HOME_CHIRHO = Path("workspace-chirho/art-chirho/queue-chirho/ordered-scenes-chirho")
PROVERBS_PROGRESS_CHIRHO = Path(
    "workspace-chirho/art-chirho/queue-chirho/scene-worker-chirho/progress-chirho.json"
)
ICON_PROGRESS_CHIRHO = Path(
    "workspace-chirho/art-chirho/queue-chirho/icon-worker-chirho/progress-chirho.json"
)
LEMMA_PROGRESS_CHIRHO = Path(
    "workspace-chirho/art-chirho/queue-chirho/lemma-worker-chirho/progress-chirho.json"
)
BOOKS_CHIRHO = {"John": (879, 21), "Gen": (1533, 50)}
STOP_CHIRHO = False
DRAIN_CHIRHO = False
STOP_EVENT_CHIRHO = threading.Event()
ICON_CHILD_CHIRHO = None
BOOK_CHILDREN_CHIRHO = {}
BOOK_MODULE_CHIRHO = None
SPEC_CHIRHO = importlib.util.spec_from_file_location(
    "scene_worker_chirho", Path(__file__).with_name("scene_worker_chirho.py")
)
BASE_CHIRHO = importlib.util.module_from_spec(SPEC_CHIRHO)
SPEC_CHIRHO.loader.exec_module(BASE_CHIRHO)
RECOVERY_SPEC_CHIRHO = importlib.util.spec_from_file_location(
    "ordered_failures_chirho", Path(__file__).parent / "recovery-chirho/failures_chirho.py"
)
RECOVERY_CHIRHO = importlib.util.module_from_spec(RECOVERY_SPEC_CHIRHO)
RECOVERY_SPEC_CHIRHO.loader.exec_module(RECOVERY_CHIRHO)
POOL_SPEC_CHIRHO = importlib.util.spec_from_file_location(
    "ordered_pool_chirho", Path(__file__).parent / "recovery-chirho/ordered_pool_chirho.py"
)
POOL_CHIRHO = importlib.util.module_from_spec(POOL_SPEC_CHIRHO)
POOL_SPEC_CHIRHO.loader.exec_module(POOL_CHIRHO)


def status_chirho(root_chirho, state_chirho, **extra_chirho):
    BASE_CHIRHO.atomic_json_chirho(
        root_chirho / HOME_CHIRHO / "status-chirho.json",
        {"state_chirho": state_chirho, **extra_chirho},
    )


def chapter_folder_chirho(root_chirho, book_chirho):
    name_chirho = "john" if book_chirho == "John" else "genesis"
    static_chirho = root_chirho / f"static/content-chirho/{name_chirho}-chirho"
    staged_chirho = root_chirho / f"data-chirho/corpus-chirho/{name_chirho}-chirho"
    return static_chirho if static_chirho.is_dir() else staged_chirho


def load_jobs_chirho(root_chirho, book_chirho):
    count_chirho, chapters_chirho = BOOKS_CHIRHO[book_chirho]
    name_chirho = "john" if book_chirho == "John" else "genesis"
    path_chirho = root_chirho / f"data-chirho/corpus-chirho/{name_chirho}-image-jobs-chirho.json"
    folder_chirho = chapter_folder_chirho(root_chirho, book_chirho)
    if not path_chirho.exists() or not folder_chirho.is_dir():
        return None
    document_chirho = BASE_CHIRHO.load_chirho(path_chirho)
    jobs_chirho = document_chirho["jobs_chirho"]
    if (
        document_chirho["book_id_chirho"] != book_chirho
        or document_chirho["job_count_chirho"] != count_chirho
        or len(jobs_chirho) != count_chirho
    ):
        raise ValueError(f"{book_chirho} queue is incomplete or mismatched")
    chapter_data_chirho = {}
    seen_chirho = set()
    for job_chirho in jobs_chirho:
        chapter_chirho, verse_chirho = job_chirho["chapter_chirho"], job_chirho["verse_chirho"]
        identifier_chirho = f"{book_chirho}.{chapter_chirho}.{verse_chirho}"
        if (
            not (1 <= chapter_chirho <= chapters_chirho and verse_chirho > 0)
            or job_chirho["id_chirho"] != identifier_chirho
            or identifier_chirho in seen_chirho
        ):
            raise ValueError(f"Invalid or duplicate {book_chirho} job identity")
        seen_chirho.add(identifier_chirho)
        if chapter_chirho not in chapter_data_chirho:
            chapter_path_chirho = folder_chirho / f"chapter-{chapter_chirho:02d}-chirho.json"
            if not chapter_path_chirho.exists():
                return None
            chapter_doc_chirho = BASE_CHIRHO.load_chirho(chapter_path_chirho)
            if (
                chapter_doc_chirho["book_id_chirho"] != book_chirho
                or chapter_doc_chirho["chapter_chirho"] != chapter_chirho
            ):
                raise ValueError("Chapter identity mismatch")
            chapter_data_chirho[chapter_chirho] = {
                verse_row_chirho["id_chirho"]: verse_row_chirho
                for verse_row_chirho in chapter_doc_chirho["verses_chirho"]
            }
        verse_row_chirho = chapter_data_chirho[chapter_chirho].get(identifier_chirho)
        text_chirho = job_chirho["canonical_text_chirho"]
        if (
            not verse_row_chirho
            or verse_row_chirho["canonical_text_chirho"] != text_chirho
            or hashlib.sha256(text_chirho.encode()).hexdigest()
            != job_chirho["canonical_sha256_chirho"]
        ):
            raise ValueError(f"Source text mismatch for {identifier_chirho}")
    if len(chapter_data_chirho) != chapters_chirho:
        raise ValueError(f"{book_chirho} chapter set is incomplete")
    return jobs_chirho


def proverbs_complete_chirho(root_chirho):
    path_chirho = root_chirho / PROVERBS_PROGRESS_CHIRHO
    if (
        not path_chirho.exists()
        or BASE_CHIRHO.load_chirho(path_chirho).get("state_chirho") != "proverbs_complete_john_next"
    ):
        return False
    jobs_doc_chirho = BASE_CHIRHO.load_chirho(root_chirho / BASE_CHIRHO.JOBS_CHIRHO)
    expected_chirho = {job_chirho["id_chirho"] for job_chirho in jobs_doc_chirho["jobs_chirho"]}
    if (
        jobs_doc_chirho["job_count_chirho"] != 915
        or len(expected_chirho) != 915
        or "Prov.26.1" not in expected_chirho
    ):
        raise ValueError("Proverbs inventory is incomplete")
    records_chirho = [
        record_chirho
        for path_chirho in BASE_CHIRHO.MANIFESTS_CHIRHO
        for record_chirho in BASE_CHIRHO.load_chirho(root_chirho / path_chirho)["scenes_chirho"]
    ]
    ids_chirho = [record_chirho["lesson_id_chirho"] for record_chirho in records_chirho]
    if (
        len(ids_chirho) != len(set(ids_chirho))
        or set(ids_chirho) | {"Prov.26.1"} != expected_chirho
    ):
        raise ValueError("Proverbs completion checkpoint does not match its scene catalogues")
    for record_chirho in records_chirho:
        BASE_CHIRHO.verify_record_chirho(root_chirho, record_chirho)
    if (
        BASE_CHIRHO.style_digest_chirho(root_chirho)
        != jobs_doc_chirho["style_reference_chirho"]["sha256_chirho"]
    ):
        raise ValueError("Proverbs 26:1 reference checksum mismatch")
    return True


def icon_lock_free_chirho(root_chirho, progress_chirho=ICON_PROGRESS_CHIRHO):
    path_chirho = root_chirho / progress_chirho.parent / "worker.lock"
    path_chirho.parent.mkdir(parents=True, exist_ok=True)
    with path_chirho.open("a") as lock_chirho:
        try:
            fcntl.flock(lock_chirho, fcntl.LOCK_EX | fcntl.LOCK_NB)
        except BlockingIOError:
            return False
        return True


def icon_uncovered_chirho(root_chirho):
    script_dir_chirho = str(Path(__file__).parent)
    sys.path.insert(0, script_dir_chirho)
    try:
        spec_chirho = importlib.util.spec_from_file_location(
            "icon_worker_chirho", Path(script_dir_chirho) / "icon_worker_chirho.py"
        )
        module_chirho = importlib.util.module_from_spec(spec_chirho)
        spec_chirho.loader.exec_module(module_chirho)
        return len(module_chirho.candidates_chirho(root_chirho))
    finally:
        sys.path.remove(script_dir_chirho)


def restart_icons_chirho(root_chirho, remaining_chirho):
    global ICON_CHILD_CHIRHO
    home_chirho = root_chirho / HOME_CHIRHO
    marker_chirho = home_chirho / "icon-restart-chirho.json"
    if marker_chirho.exists():
        return False
    BASE_CHIRHO.atomic_json_chirho(marker_chirho, {"baseline_remaining_chirho": remaining_chirho})
    status_chirho(root_chirho, "restarting_proverbs_icons", remaining_chirho=remaining_chirho)
    with (home_chirho / "icon-restart-log-chirho.txt").open("a") as log_chirho:
        ICON_CHILD_CHIRHO = subprocess.Popen(
            [sys.executable, str(root_chirho / "scripts-chirho/art-chirho/icon_worker_chirho.py")],
            cwd=root_chirho,
            stdin=subprocess.DEVNULL,
            stdout=log_chirho,
            stderr=subprocess.STDOUT,
            start_new_session=True,
        )
        try:
            while ICON_CHILD_CHIRHO.poll() is None:
                STOP_EVENT_CHIRHO.wait(2)
                if STOP_CHIRHO and ICON_CHILD_CHIRHO.poll() is None:
                    os.killpg(ICON_CHILD_CHIRHO.pid, signal.SIGTERM)
            return ICON_CHILD_CHIRHO.returncode == 0
        finally:
            ICON_CHILD_CHIRHO = None


def initial_icon_snapshot_chirho(root_chirho):
    paths_chirho = (
        ICON_PROGRESS_CHIRHO,
        Path("data-chirho/corpus-chirho/proverbs-lemma-inventory-chirho.json"),
        Path("data-chirho/reader-chirho/icon-deferrals-chirho.json"),
        Path("data-chirho/reader-chirho/icon-first-pass-deferrals-chirho.json"),
        Path("data-chirho/media-chirho/proverbs-26-1-icons-chirho.json"),
        Path("data-chirho/media-chirho/proverbs-worker-icons-chirho.json"),
    )
    return {
        str(path_chirho): BASE_CHIRHO.digest_chirho(root_chirho / path_chirho)
        for path_chirho in paths_chirho
        if (root_chirho / path_chirho).exists()
    }


def proverbs_icons_complete_chirho(root_chirho):
    path_chirho = root_chirho / ICON_PROGRESS_CHIRHO
    progress_chirho = BASE_CHIRHO.load_chirho(path_chirho) if path_chirho.exists() else {}
    if progress_chirho.get("state_chirho") not in (
        "proverbs_first_pass_complete",
        "proverbs_first_pass_with_deferrals",
    ):
        return False, progress_chirho
    # Workflow: shared-icons-chirho.md. The later backfill shares the catalogue lock, but
    # cannot undo a coherent, independently rechecked completion of the original pass.
    backfill_chirho = False
    if not icon_lock_free_chirho(root_chirho):
        phase_chirho = root_chirho / LEMMA_PROGRESS_CHIRHO
        if (
            not phase_chirho.exists()
            or icon_lock_free_chirho(root_chirho, LEMMA_PROGRESS_CHIRHO)
            or BASE_CHIRHO.load_chirho(phase_chirho).get("state_chirho")
            not in ("generating", "completed", "retrying_layout", "continuing_with_holds")
        ):
            return False, progress_chirho
        backfill_chirho = True
    snapshot_chirho = initial_icon_snapshot_chirho(root_chirho)
    remaining_chirho = icon_uncovered_chirho(root_chirho)
    review_path_chirho = root_chirho / "data-chirho/reader-chirho/icon-deferrals-chirho.json"
    deferred_count_chirho = (
        len(BASE_CHIRHO.load_chirho(review_path_chirho)["deferrals_chirho"])
        if review_path_chirho.exists()
        else 0
    )
    pass_path_chirho = (
        root_chirho / "data-chirho/reader-chirho/icon-first-pass-deferrals-chirho.json"
    )
    deferred_lemmas_chirho = (
        len(BASE_CHIRHO.load_chirho(pass_path_chirho)["lemma_deferrals_chirho"])
        if pass_path_chirho.exists()
        else 0
    )
    if snapshot_chirho != initial_icon_snapshot_chirho(root_chirho):
        return False, progress_chirho
    if (
        deferred_count_chirho != progress_chirho.get("deferred_occurrences_chirho", 0)
        or deferred_lemmas_chirho != progress_chirho.get("deferred_lemmas_chirho", 0)
        or bool(deferred_count_chirho or deferred_lemmas_chirho)
        != (progress_chirho["state_chirho"] == "proverbs_first_pass_with_deferrals")
    ):
        raise ValueError("Icon checkpoint and unresolved review counts disagree")
    if remaining_chirho != progress_chirho.get("remaining_chirho"):
        raise ValueError("Icon checkpoint and independently counted uncovered lemmas disagree")
    if remaining_chirho == 0:
        return True, progress_chirho
    if backfill_chirho:
        return False, progress_chirho  # Never start another writer while the backfill owns it.
    marker_chirho = root_chirho / HOME_CHIRHO / "icon-restart-chirho.json"
    if marker_chirho.exists():
        baseline_chirho = BASE_CHIRHO.load_chirho(marker_chirho)["baseline_remaining_chirho"]
        progress_chirho = {
            **progress_chirho,
            "restart_attempted_chirho": True,
            "restart_no_progress_chirho": remaining_chirho >= baseline_chirho,
        }
    else:
        progress_chirho = {**progress_chirho, "restart_needed_chirho": True}
    return False, progress_chirho


def book_icon_module_chirho():
    global BOOK_MODULE_CHIRHO
    if BOOK_MODULE_CHIRHO is not None:
        return BOOK_MODULE_CHIRHO
    spec_chirho = importlib.util.spec_from_file_location(
        "book_icons_chirho", Path(__file__).with_name("book_icons_chirho.py")
    )
    module_chirho = importlib.util.module_from_spec(spec_chirho)
    spec_chirho.loader.exec_module(module_chirho)
    BOOK_MODULE_CHIRHO = module_chirho
    return module_chirho


def john_icons_complete_chirho(root_chirho):
    # Processing readiness includes exact owner-reviewed deferrals; it never means every
    # lemma is pictured. The book module's completion_chirho retains that stricter proof.
    return book_icon_module_chirho().readiness_chirho(root_chirho, "John")


def genesis_icons_complete_chirho(root_chirho):
    return book_icon_module_chirho().completion_chirho(root_chirho, "Gen")


def process_alive_chirho(pid_chirho):
    if type(pid_chirho) is not int or pid_chirho <= 0:
        raise ValueError("Invalid worker process identity")
    try:
        os.kill(pid_chirho, 0)
    except ProcessLookupError:
        return False
    except PermissionError:
        return True
    return True


def book_lock_free_chirho(root_chirho, book_chirho):
    folder_chirho = book_icon_module_chirho().home_chirho(root_chirho, book_chirho)
    folder_chirho.mkdir(parents=True, exist_ok=True)
    with (folder_chirho / "worker.lock").open("a") as lock_chirho:
        try:
            fcntl.flock(lock_chirho, fcntl.LOCK_EX | fcntl.LOCK_NB)
        except BlockingIOError:
            return False
    return True


class BookIconControllerChirho:
    """One persisted launch claim per book; ambiguous launches require reconciliation."""

    def __init__(self, root_chirho, book_chirho):
        self.root_chirho = root_chirho
        self.book_chirho = book_chirho
        self.module_chirho = book_icon_module_chirho()
        self.folder_chirho = self.module_chirho.home_chirho(root_chirho, book_chirho)
        self.marker_chirho = (
            root_chirho / HOME_CHIRHO / (book_chirho.lower() + "-icon-launch-chirho.json")
        )
        self.child_chirho = None
        self.complete_chirho = False

    def check_chirho(self):
        if self.complete_chirho:
            return "complete"
        progress_path_chirho = self.folder_chirho / "progress-chirho.json"
        progress_chirho = (
            BASE_CHIRHO.load_chirho(progress_path_chirho) if progress_path_chirho.exists() else {}
        )
        state_chirho = progress_chirho.get("state_chirho")
        if self.child_chirho is not None:
            code_chirho = self.child_chirho.poll()
            if code_chirho is None:
                return "running"
            BOOK_CHILDREN_CHIRHO.pop(self.book_chirho, None)
            self.child_chirho = None
            progress_chirho = (
                BASE_CHIRHO.load_chirho(progress_path_chirho)
                if progress_path_chirho.exists()
                else {}
            )
            state_chirho = progress_chirho.get("state_chirho")
            if code_chirho != 0:
                if state_chirho == "waiting_for_source":
                    return "waiting_for_source"
                return "needs_reconciliation"
        if not book_lock_free_chirho(self.root_chirho, self.book_chirho):
            return "running"
        if state_chirho == "first_pass_complete" or (
            self.book_chirho == "John" and state_chirho == "first_pass_with_holds"
        ):
            try:
                proof_chirho = (
                    john_icons_complete_chirho(self.root_chirho)
                    if self.book_chirho == "John"
                    else genesis_icons_complete_chirho(self.root_chirho)
                )
            except RuntimeError as error_chirho:
                if str(error_chirho) == "Book icon worker already active":
                    return "running"
                raise
            except self.module_chirho.SourceWaitChirho:
                return "waiting_for_source"
            if not proof_chirho:
                return "needs_reconciliation"
            self.complete_chirho = True
            return "complete"
        if state_chirho in ("first_pass_with_holds", "waiting_for_generator"):
            return "needs_reconciliation"
        if state_chirho in (
            "generating",
            "needs_reconciliation",
            "stopped_layout",
            "waiting_for_inflight",
            "continuing_with_holds",
        ):
            name_chirho = progress_chirho.get("attempt_chirho", "")
            if (
                not isinstance(name_chirho, str)
                or not name_chirho.startswith("attempt-")
                or "/" in name_chirho
                or ".." in name_chirho
                or not any(
                    (self.folder_chirho / name_chirho / file_chirho).is_file()
                    for file_chirho in ("prepared-chirho.json", "plan-chirho.json")
                )
            ):
                return "needs_reconciliation"
            if (
                state_chirho == "waiting_for_inflight"
                and self.module_chirho.ICON_CHIRHO.RECOVERY_CHIRHO.active_chirho(
                    self.folder_chirho / name_chirho
                )
            ):
                return "running"
        marker_chirho = (
            BASE_CHIRHO.load_chirho(self.marker_chirho) if self.marker_chirho.exists() else {}
        )
        if marker_chirho.get("state_chirho") == "starting":
            return "needs_reconciliation"
        if marker_chirho.get("state_chirho") == "running" and process_alive_chirho(
            marker_chirho.get("pid_chirho")
        ):
            return "running"
        if state_chirho == "waiting_for_source":
            try:
                self.module_chirho.source_snapshot_chirho(self.root_chirho, self.book_chirho)
            except self.module_chirho.SourceWaitChirho:
                return "waiting_for_source"
        if state_chirho not in (
            None,
            "waiting_for_source",
            "waiting_for_proverbs",
            "waiting_for_john",
            "completed_sheet",
            "retrying_layout",
            "generating",
            "needs_reconciliation",
            "stopped_layout",
            "waiting_for_inflight",
            "continuing_with_holds",
        ):
            return "needs_reconciliation"
        BASE_CHIRHO.atomic_json_chirho(
            self.marker_chirho, {"state_chirho": "starting", "book_chirho": self.book_chirho}
        )
        log_path_chirho = (
            self.root_chirho / HOME_CHIRHO / (self.book_chirho.lower() + "-icons-log-chirho.txt")
        )
        with log_path_chirho.open("a") as log_chirho:
            child_chirho = subprocess.Popen(
                [
                    sys.executable,
                    str(self.root_chirho / "scripts-chirho/art-chirho/book_icons_chirho.py"),
                    self.book_chirho,
                ],
                cwd=self.root_chirho,
                stdin=subprocess.DEVNULL,
                stdout=log_chirho,
                stderr=subprocess.STDOUT,
                start_new_session=True,
            )
        self.child_chirho = child_chirho
        BOOK_CHILDREN_CHIRHO[self.book_chirho] = child_chirho
        BASE_CHIRHO.atomic_json_chirho(
            self.marker_chirho,
            {
                "state_chirho": "running",
                "book_chirho": self.book_chirho,
                "pid_chirho": child_chirho.pid,
            },
        )
        return "running"


def manifest_path_chirho(root_chirho, book_chirho):
    name_chirho = "john" if book_chirho == "John" else "genesis"
    return root_chirho / "data-chirho/media-chirho" / f"{name_chirho}-worker-scenes-chirho.json"


def asset_path_chirho(root_chirho, job_chirho):
    name_chirho = "john" if job_chirho["id_chirho"].startswith("John.") else "genesis"
    chapter_chirho, verse_chirho = job_chirho["chapter_chirho"], job_chirho["verse_chirho"]
    relative_chirho = f"/assets-chirho/scenes-chirho/{name_chirho}-ordered-v1-chirho/chapter-{chapter_chirho:02d}-chirho/{name_chirho}-{chapter_chirho:02d}-{verse_chirho:03d}-chirho.webp"
    return root_chirho / "static" / relative_chirho.lstrip("/"), relative_chirho


def verify_chirho(root_chirho, job_chirho, record_chirho):
    path_chirho, asset_chirho = asset_path_chirho(root_chirho, job_chirho)
    if (
        record_chirho["lesson_id_chirho"] != job_chirho["id_chirho"]
        or record_chirho["asset_path_chirho"] != asset_chirho
    ):
        raise ValueError("Scene record identity mismatch")
    if not path_chirho.exists():
        BASE_CHIRHO.remote_record_chirho(root_chirho, record_chirho)
        return
    width_chirho, height_chirho = BASE_CHIRHO.image_info_chirho(path_chirho)
    if (width_chirho, height_chirho) != (
        record_chirho["width_chirho"],
        record_chirho["height_chirho"],
    ) or BASE_CHIRHO.digest_chirho(path_chirho) != record_chirho["sha256_chirho"]:
        raise ValueError("Scene checksum or dimensions mismatch")


def install_chirho(root_chirho, book_chirho, job_chirho, attempt_chirho, record_chirho):
    destination_chirho, asset_chirho = asset_path_chirho(root_chirho, job_chirho)
    if (
        record_chirho["lesson_id_chirho"] != job_chirho["id_chirho"]
        or record_chirho["asset_path_chirho"] != asset_chirho
    ):
        raise ValueError("Prepared record identity mismatch")
    path_chirho = manifest_path_chirho(root_chirho, book_chirho)
    manifest_chirho = (
        BASE_CHIRHO.load_chirho(path_chirho)
        if path_chirho.exists()
        else {"schema_version_chirho": 1, "book_id_chirho": book_chirho, "scenes_chirho": []}
    )
    matches_chirho = [
        item_chirho
        for item_chirho in manifest_chirho["scenes_chirho"]
        if item_chirho["lesson_id_chirho"] == job_chirho["id_chirho"]
    ]
    if matches_chirho and matches_chirho != [record_chirho]:
        raise ValueError("Conflicting manifest record")
    destination_chirho.parent.mkdir(parents=True, exist_ok=True)
    with (attempt_chirho / "scene-chirho.webp").open("rb") as file_chirho:
        os.fsync(file_chirho.fileno())
    try:
        os.link(attempt_chirho / "scene-chirho.webp", destination_chirho)
    except FileExistsError:
        if BASE_CHIRHO.digest_chirho(destination_chirho) != record_chirho["sha256_chirho"]:
            raise ValueError("Existing asset differs; refusing overwrite")
    fd_chirho = os.open(destination_chirho.parent, os.O_RDONLY)
    try:
        os.fsync(fd_chirho)
    finally:
        os.close(fd_chirho)
    verify_chirho(root_chirho, job_chirho, record_chirho)
    if not matches_chirho:
        manifest_chirho["scenes_chirho"].append(record_chirho)
        BASE_CHIRHO.atomic_json_chirho(path_chirho, manifest_chirho)
    (attempt_chirho / "prepared-chirho.json").unlink(missing_ok=True)


def prompt_chirho(root_chirho, job_chirho, attempt_chirho):
    book_chirho = "John" if job_chirho["id_chirho"].startswith("John.") else "Gen"
    chapter_chirho = (
        chapter_folder_chirho(root_chirho, book_chirho)
        / f"chapter-{job_chirho['chapter_chirho']:02d}-chirho.json"
    )
    chapter_data_chirho = BASE_CHIRHO.load_chirho(chapter_chirho)
    matches_chirho = [
        row_chirho
        for row_chirho in chapter_data_chirho["verses_chirho"]
        if row_chirho["id_chirho"] == job_chirho["id_chirho"]
    ]
    if len(matches_chirho) != 1 or (
        matches_chirho[0]["canonical_text_chirho"] != job_chirho["canonical_text_chirho"]
        or hashlib.sha256(job_chirho["canonical_text_chirho"].encode()).hexdigest()
        != job_chirho["canonical_sha256_chirho"]
    ):
        raise POOL_CHIRHO.SourceChangedChirho("Scene source changed before generator dispatch")
    input_chirho = attempt_chirho / "source-input-chirho.json"
    input_data_chirho = {"job_chirho": job_chirho, "verse_chirho": matches_chirho[0]}
    brief_chirho = BASE_CHIRHO.BRIEFS_CHIRHO.read_chirho(root_chirho, job_chirho)
    if brief_chirho is not None:
        input_data_chirho["reusable_brief_chirho"] = brief_chirho
    BASE_CHIRHO.atomic_json_chirho(input_chirho, input_data_chirho)
    style_chirho = root_chirho / "static" / BASE_CHIRHO.STYLE_CHIRHO.lstrip("/")
    return f"""Create one individual imaginative scene for {job_chirho["reference_chirho"]} ({job_chirho["id_chirho"]}). Read the exact verse and token glosses only from {input_chirho}, respecting its stated gloss source. This owner-verified excerpt is the complete source for this scene; no chapter or full queue needs to be read. Use {style_chirho} for style only: first inspect using view_image. Match its warm detailed hand-painted watercolor storybook style. Depict the verse faithfully and appropriately. Use direct human representations of Jesus sparingly, where they serve the literal narrative. When an indirect composition can express the verse faithfully, prefer it; do not mechanically substitute a dove or other misleading symbol. Existing saved attempt prompts and images remain unchanged. Landscape 4:3, no lettering, border, collage, or watermark. Use only built-in image_gen.imagegen with the style reference; never use API, CLI, or paid-provider fallback. Inspect the actual image using view_image. Save a centered 4:3 WebP at {attempt_chirho / "scene-chirho.webp"} using ImageMagick. Save {attempt_chirho / "record-chirho.json"} with verse_explanation_chirho explaining the verse independently of this image ({BASE_CHIRHO.BRIEFS_CHIRHO.instruction_chirho(brief_chirho)}), alt_chirho describing the image, reading_note_chirho describing the verse relationship as imaginative, and prompt_chirho containing the complete actual image generation prompt. Write no other project files. If generation fails, stop."""


def produce_chirho(root_chirho, book_chirho, job_chirho, attempt_chirho):
    BASE_CHIRHO.prompt_chirho = prompt_chirho
    BASE_CHIRHO.run_generator_chirho(
        root_chirho, job_chirho, attempt_chirho, root_chirho / HOME_CHIRHO
    )


def record_chirho(root_chirho, job_chirho, attempt_chirho):
    raw_chirho = BASE_CHIRHO.load_chirho(attempt_chirho / "record-chirho.json")
    for key_chirho in ("alt_chirho", "reading_note_chirho", "prompt_chirho"):
        if not isinstance(raw_chirho.get(key_chirho), str) or not raw_chirho[key_chirho].strip():
            raise ValueError("Missing scene description or prompt")
    BASE_CHIRHO.BRIEFS_CHIRHO.retain_chirho(
        root_chirho, job_chirho, raw_chirho.get("verse_explanation_chirho")
    )
    source_chirho = attempt_chirho / "scene-chirho.webp"
    width_chirho, height_chirho = BASE_CHIRHO.image_info_chirho(source_chirho)
    _, asset_chirho = asset_path_chirho(root_chirho, job_chirho)
    return {
        "lesson_id_chirho": job_chirho["id_chirho"],
        "asset_path_chirho": asset_chirho,
        "alt_chirho": raw_chirho["alt_chirho"],
        "width_chirho": width_chirho,
        "height_chirho": height_chirho,
        "sha256_chirho": BASE_CHIRHO.digest_chirho(source_chirho),
        "art_review_chirho": "pending",
        "reading_note_chirho": raw_chirho["reading_note_chirho"],
        "prompt_chirho": raw_chirho["prompt_chirho"],
        "tool_chirho": "image_gen.imagegen",
        "model_chirho": "tool-managed; not exposed",
        "style_reference_chirho": BASE_CHIRHO.STYLE_CHIRHO,
    }


def draining_chirho():
    return STOP_CHIRHO or DRAIN_CHIRHO


def run_book_chirho(
    root_chirho,
    book_chirho,
    jobs_chirho,
    generator_chirho,
    watch_chirho=None,
    concurrency_chirho=1,
):
    # Workflow: art-recovery-chirho.md. Threads generate; this owner alone installs records.
    owner_chirho = SimpleNamespace(
        BASE_CHIRHO=BASE_CHIRHO,
        RECOVERY_CHIRHO=RECOVERY_CHIRHO,
        HOME_CHIRHO=HOME_CHIRHO,
        status_chirho=status_chirho,
        manifest_path_chirho=manifest_path_chirho,
        verify_chirho=verify_chirho,
        install_chirho=install_chirho,
        record_chirho=record_chirho,
        draining_chirho=draining_chirho,
    )
    return POOL_CHIRHO.run_chirho(
        owner_chirho,
        root_chirho,
        book_chirho,
        jobs_chirho,
        generator_chirho,
        watch_chirho,
        concurrency_chirho,
    )


def supervise_chirho(
    root_chirho,
    generator_chirho=produce_chirho,
    poll_chirho=300,
    wait_chirho=True,
    concurrency_chirho=1,
):
    home_chirho = root_chirho / HOME_CHIRHO
    home_chirho.mkdir(parents=True, exist_ok=True)
    with (home_chirho / "supervisor.lock").open("a") as lock_chirho:
        try:
            fcntl.flock(lock_chirho, fcntl.LOCK_EX | fcntl.LOCK_NB)
        except BlockingIOError:
            raise RuntimeError("Another ordered scene supervisor holds the lock")
        failures_chirho = 0
        proverbs_passed_chirho = False
        icons_passed_chirho = False
        finished_chirho = set()
        scenes_finished_chirho = set()
        controllers_chirho = {}
        while not draining_chirho():
            try:
                if not proverbs_passed_chirho:
                    if not proverbs_complete_chirho(root_chirho):
                        status_chirho(root_chirho, "waiting_for_proverbs")
                        if not wait_chirho:
                            return "waiting_for_proverbs"
                        STOP_EVENT_CHIRHO.wait(poll_chirho)
                        continue
                    proverbs_passed_chirho = True
                if not icons_passed_chirho:
                    complete_chirho, icon_progress_chirho = proverbs_icons_complete_chirho(
                        root_chirho
                    )
                    if not complete_chirho:
                        if icon_progress_chirho.get("restart_needed_chirho"):
                            restart_icons_chirho(
                                root_chirho, icon_progress_chirho["remaining_chirho"]
                            )
                            continue
                        if icon_progress_chirho.get("restart_no_progress_chirho"):
                            status_chirho(
                                root_chirho,
                                "stopped_icon_restart_no_progress",
                                remaining_chirho=icon_progress_chirho["remaining_chirho"],
                            )
                            return "stopped_icon_restart_no_progress"
                        status_chirho(
                            root_chirho,
                            "waiting_for_proverbs_icons",
                            icon_state_chirho=icon_progress_chirho.get(
                                "state_chirho", "unavailable"
                            ),
                            remaining_chirho=icon_progress_chirho.get("remaining_chirho"),
                            message_chirho="Waiting for zero uncovered Proverbs lemmas.",
                        )
                        if not wait_chirho:
                            return "waiting_for_proverbs_icons"
                        STOP_EVENT_CHIRHO.wait(poll_chirho)
                        continue
                    icons_passed_chirho = True
                for book_chirho in ("John", "Gen"):
                    if book_chirho in finished_chirho:
                        continue
                    jobs_chirho = (
                        load_jobs_chirho(root_chirho, book_chirho)
                        if book_chirho not in scenes_finished_chirho
                        else []
                    )
                    if jobs_chirho is None:
                        status_chirho(root_chirho, "waiting_for_source", book_chirho=book_chirho)
                        if not wait_chirho:
                            return "waiting_for_source"
                        STOP_EVENT_CHIRHO.wait(poll_chirho)
                        break
                    if book_chirho not in controllers_chirho:
                        controllers_chirho[book_chirho] = BookIconControllerChirho(
                            root_chirho, book_chirho
                        )
                    controller_chirho = controllers_chirho[book_chirho]
                    if book_chirho not in scenes_finished_chirho:
                        status_chirho(root_chirho, "generating", book_chirho=book_chirho)
                        icon_state_chirho = controller_chirho.check_chirho()
                        if icon_state_chirho == "needs_reconciliation":
                            print("Icon lane held; scene dispatch stays independent.", flush=True)
                        if not run_book_chirho(
                            root_chirho,
                            book_chirho,
                            jobs_chirho,
                            generator_chirho,
                            controller_chirho.check_chirho,
                            concurrency_chirho,
                        ):
                            return "drained" if DRAIN_CHIRHO else "needs_reconciliation"
                        scenes_finished_chirho.add(book_chirho)
                    # The book worker accepts this exact status during its final proof.
                    if book_chirho == "John":
                        status_chirho(
                            root_chirho, "waiting_for_john_icons", book_chirho=book_chirho
                        )
                    else:
                        status_chirho(
                            root_chirho,
                            "completed_verse",
                            book_chirho=book_chirho,
                            icon_state_chirho="waiting",
                        )
                    # Recheck at the book boundary even if coverage was proven earlier.
                    controller_chirho.complete_chirho = False
                    icon_state_chirho = controller_chirho.check_chirho()
                    if icon_state_chirho == "needs_reconciliation":
                        status_chirho(
                            root_chirho,
                            "needs_reconciliation",
                            book_chirho=book_chirho,
                            error_chirho="Book icon worker needs reconciliation",
                        )
                        return "needs_reconciliation"
                    if icon_state_chirho != "complete":
                        if not wait_chirho:
                            return (
                                "waiting_for_john_icons"
                                if book_chirho == "John"
                                else "waiting_for_genesis_icons"
                            )
                        STOP_EVENT_CHIRHO.wait(poll_chirho)
                        break
                    finished_chirho.add(book_chirho)
                else:
                    status_chirho(root_chirho, "complete")
                    return "complete"
                failures_chirho = 0
            except (
                OSError,
                RuntimeError,
                ValueError,
                KeyError,
                TypeError,
                subprocess.SubprocessError,
            ) as error_chirho:
                failures_chirho += 1
                status_chirho(
                    root_chirho,
                    "stopped" if failures_chirho >= 3 else "retrying",
                    error_chirho=str(error_chirho),
                    consecutive_failures_chirho=failures_chirho,
                )
                if failures_chirho >= 3 or not wait_chirho:
                    return "stopped" if failures_chirho >= 3 else "retrying"
                STOP_EVENT_CHIRHO.wait(poll_chirho * failures_chirho)
        status_chirho(root_chirho, "drained" if DRAIN_CHIRHO else "stopped")
        return "drained" if DRAIN_CHIRHO else "stopped"


def drain_chirho(signum_chirho, frame_chirho):
    global DRAIN_CHIRHO
    DRAIN_CHIRHO = True  # Finish started scenes; the independent icon child keeps running.


def signal_chirho(signum_chirho, frame_chirho):
    global STOP_CHIRHO
    STOP_CHIRHO = True
    STOP_EVENT_CHIRHO.set()
    if ICON_CHILD_CHIRHO is not None and ICON_CHILD_CHIRHO.poll() is None:
        os.killpg(ICON_CHILD_CHIRHO.pid, signal.SIGTERM)
    for child_chirho in BOOK_CHILDREN_CHIRHO.values():
        if child_chirho.poll() is None:
            try:
                os.killpg(child_chirho.pid, signal.SIGTERM)
            except ProcessLookupError:
                pass
    BASE_CHIRHO.stop_handler_chirho(signum_chirho, frame_chirho)


def main_chirho():
    parser_chirho = argparse.ArgumentParser(description=__doc__)
    parser_chirho.add_argument("--poll-seconds", type=int, default=300)
    parser_chirho.add_argument("--concurrency-chirho", type=int, choices=range(1, 4), default=3)
    args_chirho = parser_chirho.parse_args()
    if args_chirho.poll_seconds < 60:
        parser_chirho.error("poll interval must be at least 60 seconds")
    signal.signal(signal.SIGINT, signal_chirho)
    signal.signal(signal.SIGTERM, signal_chirho)
    signal.signal(signal.SIGUSR1, drain_chirho)
    try:
        result_chirho = supervise_chirho(
            ROOT_CHIRHO,
            poll_chirho=args_chirho.poll_seconds,
            concurrency_chirho=args_chirho.concurrency_chirho,
        )
        return 0 if result_chirho in ("complete", "drained") else 1
    except (OSError, RuntimeError, ValueError) as error_chirho:
        print(str(error_chirho), file=sys.stderr)
        return 1


if __name__ == "__main__":
    sys.exit(main_chirho())
