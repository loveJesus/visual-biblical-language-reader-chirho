# For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life. — John 3:16 (KJV)
"""Order and failure recovery with isolated source files and fake image generation."""

import fcntl
import hashlib
import importlib.util
import json
import subprocess
import tempfile
import unittest
from pathlib import Path
from unittest.mock import patch

PATH_CHIRHO = (
    Path(__file__).resolve().parents[2] / "scripts-chirho/art-chirho/ordered_scenes_chirho.py"
)
SPEC_CHIRHO = importlib.util.spec_from_file_location("ordered_scenes_chirho", PATH_CHIRHO)
WORKER_CHIRHO = importlib.util.module_from_spec(SPEC_CHIRHO)
SPEC_CHIRHO.loader.exec_module(WORKER_CHIRHO)
CONTROLLER_CHIRHO = WORKER_CHIRHO.BookIconControllerChirho


class OrderedScenesTestsChirho(unittest.TestCase):
    def setUp(self):
        self.temp_chirho = tempfile.TemporaryDirectory()
        self.root_chirho = Path(self.temp_chirho.name)
        self.calls_chirho = []
        WORKER_CHIRHO.STOP_CHIRHO = False
        self.books_chirho = patch.object(
            WORKER_CHIRHO, "BOOKS_CHIRHO", {"John": (2, 1), "Gen": (1, 1)}
        )
        self.books_chirho.start()
        self.icons_chirho = patch.object(
            WORKER_CHIRHO, "proverbs_icons_complete_chirho", return_value=(True, {})
        )
        self.icons_chirho.start()
        self.john_icons_chirho = patch.object(
            WORKER_CHIRHO, "john_icons_complete_chirho", return_value=True
        )
        self.john_icons_chirho.start()

        class FakeControllerChirho:
            def __init__(self, root_chirho, book_chirho):
                self.root_chirho = root_chirho
                self.book_chirho = book_chirho

            def check_chirho(self):
                if self.book_chirho == "John":
                    return (
                        "complete"
                        if WORKER_CHIRHO.john_icons_complete_chirho(self.root_chirho)
                        else "running"
                    )
                return "complete"

        self.controller_chirho = patch.object(
            WORKER_CHIRHO, "BookIconControllerChirho", FakeControllerChirho
        )
        self.controller_chirho.start()
        self.write_source_chirho("John", 2)

    def tearDown(self):
        self.controller_chirho.stop()
        self.john_icons_chirho.stop()
        self.icons_chirho.stop()
        self.books_chirho.stop()
        self.temp_chirho.cleanup()

    def write_chirho(self, path_chirho, value_chirho):
        path_chirho = self.root_chirho / path_chirho
        path_chirho.parent.mkdir(parents=True, exist_ok=True)
        path_chirho.write_text(json.dumps(value_chirho))

    def write_source_chirho(self, book_chirho, count_chirho):
        name_chirho = "john" if book_chirho == "John" else "genesis"
        jobs_chirho, verses_chirho = [], []
        for number_chirho in range(1, count_chirho + 1):
            identifier_chirho = f"{book_chirho}.1.{number_chirho}"
            text_chirho = f"text {identifier_chirho}"
            jobs_chirho.append(
                {
                    "id_chirho": identifier_chirho,
                    "chapter_chirho": 1,
                    "verse_chirho": number_chirho,
                    "reference_chirho": identifier_chirho,
                    "canonical_text_chirho": text_chirho,
                    "canonical_sha256_chirho": hashlib.sha256(text_chirho.encode()).hexdigest(),
                }
            )
            verses_chirho.append(
                {"id_chirho": identifier_chirho, "canonical_text_chirho": text_chirho}
            )
        self.write_chirho(
            f"data-chirho/corpus-chirho/{name_chirho}-image-jobs-chirho.json",
            {
                "book_id_chirho": book_chirho,
                "job_count_chirho": count_chirho,
                "jobs_chirho": jobs_chirho,
            },
        )
        self.write_chirho(
            f"data-chirho/corpus-chirho/{name_chirho}-chirho/chapter-01-chirho.json",
            {"book_id_chirho": book_chirho, "chapter_chirho": 1, "verses_chirho": verses_chirho},
        )

    def fake_chirho(self, root_chirho, book_chirho, job_chirho, attempt_chirho):
        self.calls_chirho.append(job_chirho["id_chirho"])
        subprocess.run(
            ["magick", "-size", "800x600", "xc:tan", str(attempt_chirho / "scene-chirho.webp")],
            check=True,
        )
        (attempt_chirho / "record-chirho.json").write_text(
            json.dumps(
                {
                    "alt_chirho": "A scene",
                    "reading_note_chirho": "Imaginative",
                    "prompt_chirho": "Prompt",
                }
            )
        )

    def test_worker_launch_follows_proverbs_gates_and_precedes_scenes_chirho(self):
        events_chirho = []

        class ControllerChirho:
            def __init__(self, root_chirho, book_chirho):
                self.book_chirho = book_chirho

            def check_chirho(self):
                events_chirho.append("icons:" + self.book_chirho)
                return "complete"

        def scene_chirho(root_chirho, book_chirho, job_chirho, attempt_chirho):
            events_chirho.append("scene:" + book_chirho)
            self.fake_chirho(root_chirho, book_chirho, job_chirho, attempt_chirho)

        self.write_source_chirho("Gen", 1)
        with (
            patch.object(WORKER_CHIRHO, "proverbs_complete_chirho", return_value=True),
            patch.object(WORKER_CHIRHO, "BookIconControllerChirho", ControllerChirho),
        ):
            self.assertEqual(
                WORKER_CHIRHO.supervise_chirho(self.root_chirho, scene_chirho, wait_chirho=False),
                "complete",
            )
        self.assertLess(events_chirho.index("icons:John"), events_chirho.index("scene:John"))
        self.assertLess(events_chirho.index("scene:John"), events_chirho.index("icons:Gen"))
        self.assertLess(events_chirho.index("icons:Gen"), events_chirho.index("scene:Gen"))

    def test_genesis_icon_completion_required_chirho(self):
        self.write_source_chirho("Gen", 1)

        class ControllerChirho:
            def __init__(self, root_chirho, book_chirho):
                self.book_chirho = book_chirho

            def check_chirho(self):
                return "complete" if self.book_chirho == "John" else "running"

        with (
            patch.object(WORKER_CHIRHO, "proverbs_complete_chirho", return_value=True),
            patch.object(WORKER_CHIRHO, "BookIconControllerChirho", ControllerChirho),
        ):
            self.assertEqual(
                WORKER_CHIRHO.supervise_chirho(
                    self.root_chirho, self.fake_chirho, wait_chirho=False
                ),
                "waiting_for_genesis_icons",
            )
        self.assertEqual(self.calls_chirho, ["John.1.1", "John.1.2", "Gen.1.1"])

    def test_icon_proof_is_rechecked_at_book_boundary_chirho(self):
        class ControllerChirho:
            def __init__(self, root_chirho, book_chirho):
                self.book_chirho = book_chirho
                self.complete_chirho = False
                self.proofs_chirho = 0

            def check_chirho(self):
                if self.complete_chirho:
                    return "complete"
                self.proofs_chirho += 1
                if self.proofs_chirho > 1:
                    return "needs_reconciliation"
                self.complete_chirho = True
                return "complete"

        with (
            patch.object(WORKER_CHIRHO, "proverbs_complete_chirho", return_value=True),
            patch.object(WORKER_CHIRHO, "BookIconControllerChirho", ControllerChirho),
        ):
            self.assertEqual(
                WORKER_CHIRHO.supervise_chirho(
                    self.root_chirho, self.fake_chirho, wait_chirho=False
                ),
                "needs_reconciliation",
            )
        self.assertEqual(self.calls_chirho, ["John.1.1", "John.1.2"])

    def test_held_icon_lane_does_not_stop_independent_scenes_chirho(self):
        events_chirho = []

        class ControllerChirho:
            def __init__(self, root_chirho, book_chirho):
                self.book_chirho = book_chirho
                self.checks_chirho = 0

            def check_chirho(self):
                self.checks_chirho += 1
                return "needs_reconciliation" if self.checks_chirho >= 3 else "running"

        def scene_chirho(root_chirho, book_chirho, job_chirho, attempt_chirho):
            events_chirho.append(job_chirho["id_chirho"])
            self.fake_chirho(root_chirho, book_chirho, job_chirho, attempt_chirho)

        with (
            patch.object(WORKER_CHIRHO, "proverbs_complete_chirho", return_value=True),
            patch.object(WORKER_CHIRHO, "BookIconControllerChirho", ControllerChirho),
        ):
            self.assertEqual(
                WORKER_CHIRHO.supervise_chirho(self.root_chirho, scene_chirho, wait_chirho=False),
                "needs_reconciliation",
            )
        self.assertEqual(events_chirho, ["John.1.1", "John.1.2"])

    def test_controller_start_claim_prevents_duplicate_and_reconciles_crash_chirho(self):
        from unittest.mock import Mock

        (self.root_chirho / WORKER_CHIRHO.HOME_CHIRHO).mkdir(parents=True)
        child_chirho = Mock(pid=12345)
        child_chirho.poll.return_value = None
        controller_chirho = CONTROLLER_CHIRHO(self.root_chirho, "John")
        with patch.object(
            WORKER_CHIRHO.subprocess, "Popen", return_value=child_chirho
        ) as spawn_chirho:
            self.assertEqual(controller_chirho.check_chirho(), "running")
            self.assertEqual(controller_chirho.check_chirho(), "running")
            spawn_chirho.assert_called_once()
            with patch.object(WORKER_CHIRHO, "process_alive_chirho", return_value=True):
                restarted_chirho = CONTROLLER_CHIRHO(self.root_chirho, "John")
                self.assertEqual(restarted_chirho.check_chirho(), "running")
                spawn_chirho.assert_called_once()
            child_chirho.poll.return_value = 1
            self.assertEqual(controller_chirho.check_chirho(), "needs_reconciliation")
        WORKER_CHIRHO.BOOK_CHILDREN_CHIRHO.clear()

    def test_controller_holds_for_lock_and_unresolved_launch_chirho(self):
        folder_chirho = self.root_chirho / WORKER_CHIRHO.HOME_CHIRHO
        folder_chirho.mkdir(parents=True)
        controller_chirho = CONTROLLER_CHIRHO(self.root_chirho, "John")
        with (
            patch.object(WORKER_CHIRHO, "book_lock_free_chirho", return_value=False),
            patch.object(WORKER_CHIRHO.subprocess, "Popen") as spawn_chirho,
        ):
            self.assertEqual(controller_chirho.check_chirho(), "running")
            spawn_chirho.assert_not_called()
        self.write_chirho(
            WORKER_CHIRHO.HOME_CHIRHO / "john-icon-launch-chirho.json",
            {"state_chirho": "starting", "book_chirho": "John"},
        )
        with patch.object(WORKER_CHIRHO.subprocess, "Popen") as spawn_chirho:
            self.assertEqual(controller_chirho.check_chirho(), "needs_reconciliation")
            spawn_chirho.assert_not_called()

    def test_prepared_icon_restart_only_when_checkpoint_exists_chirho(self):
        from unittest.mock import Mock

        ordered_chirho = self.root_chirho / WORKER_CHIRHO.HOME_CHIRHO
        ordered_chirho.mkdir(parents=True)
        controller_chirho = CONTROLLER_CHIRHO(self.root_chirho, "John")
        attempt_chirho = controller_chirho.folder_chirho / "attempt-dead-chirho"
        attempt_chirho.mkdir(parents=True)
        self.write_chirho(
            WORKER_CHIRHO.HOME_CHIRHO / "john-icon-launch-chirho.json",
            {"state_chirho": "running", "book_chirho": "John", "pid_chirho": 12345},
        )
        (controller_chirho.folder_chirho / "progress-chirho.json").write_text(
            json.dumps({"state_chirho": "generating", "attempt_chirho": attempt_chirho.name})
        )
        with (
            patch.object(WORKER_CHIRHO, "process_alive_chirho", return_value=False),
            patch.object(
                WORKER_CHIRHO.subprocess, "Popen", return_value=Mock(pid=999, poll=lambda: None)
            ) as spawn_chirho,
        ):
            self.assertEqual(controller_chirho.check_chirho(), "needs_reconciliation")
            spawn_chirho.assert_not_called()
            (attempt_chirho / "prepared-chirho.json").write_text("{}")
            self.assertEqual(controller_chirho.check_chirho(), "running")
            spawn_chirho.assert_called_once()
        WORKER_CHIRHO.BOOK_CHILDREN_CHIRHO.clear()

    def test_completion_proof_lock_contention_is_waiting_chirho(self):
        controller_chirho = CONTROLLER_CHIRHO(self.root_chirho, "John")
        controller_chirho.folder_chirho.mkdir(parents=True)
        (controller_chirho.folder_chirho / "progress-chirho.json").write_text(
            json.dumps({"state_chirho": "first_pass_complete"})
        )
        with patch.object(
            WORKER_CHIRHO,
            "john_icons_complete_chirho",
            side_effect=RuntimeError("Book icon worker already active"),
        ):
            self.assertEqual(controller_chirho.check_chirho(), "running")

    def test_static_chapters_and_media_manifest_paths_preserved_chirho(self):
        source_chirho = (
            self.root_chirho / "data-chirho/corpus-chirho/john-chirho/chapter-01-chirho.json"
        )
        target_chirho = (
            self.root_chirho / "static/content-chirho/john-chirho/chapter-01-chirho.json"
        )
        target_chirho.parent.mkdir(parents=True)
        target_chirho.write_bytes(source_chirho.read_bytes())
        source_chirho.unlink()
        self.assertEqual(len(WORKER_CHIRHO.load_jobs_chirho(self.root_chirho, "John")), 2)
        self.assertEqual(
            WORKER_CHIRHO.manifest_path_chirho(self.root_chirho, "John"),
            self.root_chirho / "data-chirho/media-chirho/john-worker-scenes-chirho.json",
        )

    def test_waits_for_proverbs_without_generating_chirho(self):
        with patch.object(WORKER_CHIRHO, "proverbs_complete_chirho", return_value=False):
            self.assertEqual(
                WORKER_CHIRHO.supervise_chirho(
                    self.root_chirho, self.fake_chirho, wait_chirho=False
                ),
                "waiting_for_proverbs",
            )
        self.assertEqual(self.calls_chirho, [])

    def test_remaining_proverbs_icons_block_progress_chirho(self):
        self.icons_chirho.stop()
        try:
            self.write_chirho(
                WORKER_CHIRHO.ICON_PROGRESS_CHIRHO,
                {"state_chirho": "proverbs_first_pass_complete", "remaining_chirho": 3},
            )
            self.write_chirho(
                WORKER_CHIRHO.HOME_CHIRHO / "icon-restart-chirho.json",
                {"baseline_remaining_chirho": 3},
            )
            with (
                patch.object(WORKER_CHIRHO, "proverbs_complete_chirho", return_value=True),
                patch.object(WORKER_CHIRHO, "icon_uncovered_chirho", return_value=3),
            ):
                self.assertEqual(
                    WORKER_CHIRHO.supervise_chirho(
                        self.root_chirho, self.fake_chirho, wait_chirho=False
                    ),
                    "stopped_icon_restart_no_progress",
                )
            self.assertEqual(self.calls_chirho, [])
        finally:
            self.icons_chirho.start()

    def test_icon_restart_once_then_stops_on_no_progress_chirho(self):
        self.icons_chirho.stop()
        calls_chirho = []
        try:
            self.write_chirho(
                WORKER_CHIRHO.ICON_PROGRESS_CHIRHO,
                {"state_chirho": "proverbs_first_pass_complete", "remaining_chirho": 3},
            )

            def restart_chirho(root_chirho, remaining_chirho):
                calls_chirho.append(remaining_chirho)
                self.write_chirho(
                    WORKER_CHIRHO.HOME_CHIRHO / "icon-restart-chirho.json",
                    {"baseline_remaining_chirho": remaining_chirho},
                )
                return False

            with (
                patch.object(WORKER_CHIRHO, "proverbs_complete_chirho", return_value=True),
                patch.object(WORKER_CHIRHO, "icon_uncovered_chirho", return_value=3),
                patch.object(WORKER_CHIRHO, "restart_icons_chirho", restart_chirho),
            ):
                self.assertEqual(
                    WORKER_CHIRHO.supervise_chirho(
                        self.root_chirho, self.fake_chirho, wait_chirho=False
                    ),
                    "stopped_icon_restart_no_progress",
                )
            self.assertEqual(calls_chirho, [3])
            self.assertEqual(self.calls_chirho, [])
        finally:
            self.icons_chirho.start()

    def test_active_icon_lock_prevents_restart_chirho(self):
        self.icons_chirho.stop()
        try:
            self.write_chirho(
                WORKER_CHIRHO.ICON_PROGRESS_CHIRHO,
                {"state_chirho": "proverbs_first_pass_complete", "remaining_chirho": 3},
            )
            lock_path_chirho = (
                self.root_chirho / WORKER_CHIRHO.ICON_PROGRESS_CHIRHO.parent / "worker.lock"
            )
            with lock_path_chirho.open("a") as lock_chirho:
                fcntl.flock(lock_chirho, fcntl.LOCK_EX | fcntl.LOCK_NB)
                with (
                    patch.object(WORKER_CHIRHO, "proverbs_complete_chirho", return_value=True),
                    patch.object(WORKER_CHIRHO, "restart_icons_chirho") as restart_chirho,
                ):
                    self.assertEqual(
                        WORKER_CHIRHO.supervise_chirho(
                            self.root_chirho, self.fake_chirho, wait_chirho=False
                        ),
                        "waiting_for_proverbs_icons",
                    )
                    restart_chirho.assert_not_called()
        finally:
            self.icons_chirho.start()

    def test_finished_initial_pass_can_be_rechecked_during_separate_backfill_chirho(self):
        self.icons_chirho.stop()
        try:
            self.write_chirho(
                WORKER_CHIRHO.ICON_PROGRESS_CHIRHO,
                {"state_chirho": "proverbs_first_pass_complete", "remaining_chirho": 0},
            )
            self.write_chirho(WORKER_CHIRHO.LEMMA_PROGRESS_CHIRHO, {"state_chirho": "generating"})
            original_chirho = (
                self.root_chirho / WORKER_CHIRHO.ICON_PROGRESS_CHIRHO.parent / "worker.lock"
            )
            phase_chirho = (
                self.root_chirho / WORKER_CHIRHO.LEMMA_PROGRESS_CHIRHO.parent / "worker.lock"
            )
            with original_chirho.open("a") as lock_chirho:
                fcntl.flock(lock_chirho, fcntl.LOCK_EX | fcntl.LOCK_NB)
                with patch.object(WORKER_CHIRHO, "icon_uncovered_chirho", return_value=0):
                    self.assertFalse(
                        WORKER_CHIRHO.proverbs_icons_complete_chirho(self.root_chirho)[0]
                    )
                    with phase_chirho.open("a") as backfill_chirho:
                        fcntl.flock(backfill_chirho, fcntl.LOCK_EX | fcntl.LOCK_NB)
                        self.assertTrue(
                            WORKER_CHIRHO.proverbs_icons_complete_chirho(self.root_chirho)[0]
                        )
                        self.write_chirho(
                            WORKER_CHIRHO.ICON_PROGRESS_CHIRHO,
                            {"state_chirho": "proverbs_first_pass_complete", "remaining_chirho": 3},
                        )
                        with patch.object(WORKER_CHIRHO, "icon_uncovered_chirho", return_value=3):
                            complete_chirho, progress_chirho = (
                                WORKER_CHIRHO.proverbs_icons_complete_chirho(self.root_chirho)
                            )
                            self.assertFalse(complete_chirho)
                            self.assertNotIn("restart_needed_chirho", progress_chirho)
        finally:
            self.icons_chirho.start()

    def test_initial_completion_refuses_a_source_snapshot_that_changes_during_count_chirho(self):
        self.icons_chirho.stop()
        try:
            self.write_chirho(
                WORKER_CHIRHO.ICON_PROGRESS_CHIRHO,
                {"state_chirho": "proverbs_first_pass_complete", "remaining_chirho": 0},
            )

            def changed_chirho(_root_chirho):
                self.write_chirho(
                    WORKER_CHIRHO.ICON_PROGRESS_CHIRHO,
                    {
                        "state_chirho": "proverbs_first_pass_complete",
                        "remaining_chirho": 0,
                        "changed_chirho": True,
                    },
                )
                return 0

            with patch.object(WORKER_CHIRHO, "icon_uncovered_chirho", side_effect=changed_chirho):
                self.assertFalse(WORKER_CHIRHO.proverbs_icons_complete_chirho(self.root_chirho)[0])
        finally:
            self.icons_chirho.start()

    def test_john_icons_hold_before_genesis_chirho(self):
        self.john_icons_chirho.stop()
        try:
            self.write_source_chirho("Gen", 1)
            with patch.object(WORKER_CHIRHO, "proverbs_complete_chirho", return_value=True):
                self.assertEqual(
                    WORKER_CHIRHO.supervise_chirho(
                        self.root_chirho, self.fake_chirho, wait_chirho=False
                    ),
                    "waiting_for_john_icons",
                )
            self.assertEqual(self.calls_chirho, ["John.1.1", "John.1.2"])
        finally:
            self.john_icons_chirho.start()

    def test_order_wait_and_restart_without_duplicate_chirho(self):
        with patch.object(WORKER_CHIRHO, "proverbs_complete_chirho", return_value=True):
            self.assertEqual(
                WORKER_CHIRHO.supervise_chirho(
                    self.root_chirho, self.fake_chirho, wait_chirho=False
                ),
                "waiting_for_source",
            )
            self.assertEqual(self.calls_chirho, ["John.1.1", "John.1.2"])
            self.assertEqual(
                WORKER_CHIRHO.supervise_chirho(
                    self.root_chirho, self.fake_chirho, wait_chirho=False
                ),
                "waiting_for_source",
            )
            self.assertEqual(self.calls_chirho, ["John.1.1", "John.1.2"])
            self.write_source_chirho("Gen", 1)
            self.assertEqual(
                WORKER_CHIRHO.supervise_chirho(
                    self.root_chirho, self.fake_chirho, wait_chirho=False
                ),
                "complete",
            )
        self.assertEqual(self.calls_chirho, ["John.1.1", "John.1.2", "Gen.1.1"])

    def test_partial_or_failed_child_cannot_advance_chirho(self):
        def fail_chirho(root_chirho, book_chirho, job_chirho, attempt_chirho):
            self.calls_chirho.append(job_chirho["id_chirho"])
            raise RuntimeError("ambiguous child failure")

        self.write_source_chirho("Gen", 1)
        with patch.object(WORKER_CHIRHO, "proverbs_complete_chirho", return_value=True):
            self.assertEqual(
                WORKER_CHIRHO.supervise_chirho(self.root_chirho, fail_chirho, wait_chirho=False),
                "needs_reconciliation",
            )
            self.assertEqual(
                WORKER_CHIRHO.supervise_chirho(
                    self.root_chirho, self.fake_chirho, wait_chirho=False
                ),
                "needs_reconciliation",
            )
        self.assertEqual(self.calls_chirho, ["John.1.1", "John.1.2"])
        holds_chirho = WORKER_CHIRHO.RECOVERY_CHIRHO.read_chirho(
            self.root_chirho / WORKER_CHIRHO.HOME_CHIRHO
        )["holds_chirho"]
        self.assertEqual(
            {
                item_chirho
                for row_chirho in holds_chirho
                for item_chirho in row_chirho["items_chirho"]
            },
            {"John.1.1", "John.1.2"},
        )

    def test_restart_with_genesis_inflight_does_not_regenerate_john_chirho(self):
        with patch.object(WORKER_CHIRHO, "proverbs_complete_chirho", return_value=True):
            self.assertEqual(
                WORKER_CHIRHO.supervise_chirho(
                    self.root_chirho, self.fake_chirho, wait_chirho=False
                ),
                "waiting_for_source",
            )
            self.write_source_chirho("Gen", 1)

            def fail_chirho(root_chirho, book_chirho, job_chirho, attempt_chirho):
                self.calls_chirho.append(job_chirho["id_chirho"])
                raise RuntimeError("interrupted")

            self.assertEqual(
                WORKER_CHIRHO.supervise_chirho(self.root_chirho, fail_chirho, wait_chirho=False),
                "needs_reconciliation",
            )
            self.assertEqual(
                WORKER_CHIRHO.supervise_chirho(
                    self.root_chirho, self.fake_chirho, wait_chirho=False
                ),
                "needs_reconciliation",
            )
        self.assertEqual(self.calls_chirho, ["John.1.1", "John.1.2", "Gen.1.1"])

    def test_partial_source_does_not_count_as_complete_chirho(self):
        path_chirho = self.root_chirho / "data-chirho/corpus-chirho/john-image-jobs-chirho.json"
        document_chirho = json.loads(path_chirho.read_text())
        document_chirho["jobs_chirho"].pop()
        path_chirho.write_text(json.dumps(document_chirho))
        with patch.object(WORKER_CHIRHO, "proverbs_complete_chirho", return_value=True):
            self.assertEqual(
                WORKER_CHIRHO.supervise_chirho(
                    self.root_chirho, self.fake_chirho, wait_chirho=False
                ),
                "retrying",
            )
        self.assertEqual(self.calls_chirho, [])

    def test_prepared_record_recovered_without_regeneration_chirho(self):
        home_chirho = self.root_chirho / WORKER_CHIRHO.HOME_CHIRHO
        attempt_chirho = home_chirho / "attempt-john-test"
        attempt_chirho.mkdir(parents=True)
        job_chirho = WORKER_CHIRHO.load_jobs_chirho(self.root_chirho, "John")[0]
        self.fake_chirho(self.root_chirho, "John", job_chirho, attempt_chirho)
        record_chirho = WORKER_CHIRHO.record_chirho(self.root_chirho, job_chirho, attempt_chirho)
        WORKER_CHIRHO.BASE_CHIRHO.atomic_json_chirho(
            attempt_chirho / "prepared-chirho.json", record_chirho
        )
        WORKER_CHIRHO.BASE_CHIRHO.atomic_json_chirho(
            home_chirho / "inflight-chirho.json",
            {
                "book_chirho": "John",
                "verse_id_chirho": "John.1.1",
                "attempt_chirho": attempt_chirho.name,
            },
        )
        with patch.object(WORKER_CHIRHO, "proverbs_complete_chirho", return_value=True):
            self.assertEqual(
                WORKER_CHIRHO.supervise_chirho(
                    self.root_chirho, self.fake_chirho, wait_chirho=False
                ),
                "waiting_for_source",
            )
        self.assertEqual(self.calls_chirho, ["John.1.1", "John.1.2"])


if __name__ == "__main__":
    unittest.main()
