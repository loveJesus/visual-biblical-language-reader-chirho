# For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life. — John 3:16 (KJV)
"""Behavioral tests use isolated files and a fake generator, never an image service."""

import fcntl
import importlib.util
import json
import os
import subprocess
import tempfile
import unittest
from pathlib import Path
from unittest.mock import patch

PATH_CHIRHO = (
    Path(__file__).resolve().parents[2] / "scripts-chirho/art-chirho/scene_worker_chirho.py"
)
SPEC_CHIRHO = importlib.util.spec_from_file_location("scene_worker_chirho", PATH_CHIRHO)
WORKER_CHIRHO = importlib.util.module_from_spec(SPEC_CHIRHO)
SPEC_CHIRHO.loader.exec_module(WORKER_CHIRHO)


class SceneWorkerTestsChirho(unittest.TestCase):
    def setUp(self):
        self.temp_chirho = tempfile.TemporaryDirectory()
        self.root_chirho = Path(self.temp_chirho.name)
        self.calls_chirho = []
        WORKER_CHIRHO.STOP_CHIRHO = False
        WORKER_CHIRHO.DRAIN_CHIRHO = False
        self.write_chirho(
            WORKER_CHIRHO.JOBS_CHIRHO, {"jobs_chirho": [self.job_chirho(1), self.job_chirho(2)]}
        )
        for path_chirho in WORKER_CHIRHO.MANIFESTS_CHIRHO:
            self.write_chirho(
                path_chirho, {"schema_version_chirho": 1, "icons_chirho": [], "scenes_chirho": []}
            )

    def tearDown(self):
        self.temp_chirho.cleanup()

    def job_chirho(self, verse_chirho):
        return {
            "id_chirho": f"Prov.1.{verse_chirho}",
            "chapter_chirho": 1,
            "verse_chirho": verse_chirho,
        }

    def write_chirho(self, path_chirho, value_chirho):
        path_chirho = self.root_chirho / path_chirho
        path_chirho.parent.mkdir(parents=True, exist_ok=True)
        path_chirho.write_text(json.dumps(value_chirho))

    def fake_chirho(self, root_chirho, job_chirho, attempt_chirho, queue_chirho):
        self.calls_chirho.append(job_chirho["id_chirho"])
        subprocess.run(
            ["magick", "-size", "800x600", "xc:tan", str(attempt_chirho / "scene-chirho.webp")],
            check=True,
        )
        (attempt_chirho / "record-chirho.json").write_text(
            json.dumps(
                {
                    "alt_chirho": "A scene.",
                    "reading_note_chirho": "Imaginative.",
                    "prompt_chirho": "Actual prompt.",
                }
            )
        )

    def test_selection_and_no_duplicate_chirho(self):
        asset_chirho = "/assets-chirho/scenes-chirho/proverbs-v1-chirho/chapter-01-chirho/prov-01-001-chirho.webp"
        path_chirho = WORKER_CHIRHO.checked_path_chirho(self.root_chirho, asset_chirho, True)
        path_chirho.parent.mkdir(parents=True)
        subprocess.run(["magick", "-size", "800x600", "xc:tan", str(path_chirho)], check=True)
        self.write_chirho(
            WORKER_CHIRHO.MANIFESTS_CHIRHO[0],
            {
                "scenes_chirho": [
                    {
                        "lesson_id_chirho": "Prov.1.1",
                        "asset_path_chirho": asset_chirho,
                        "width_chirho": 800,
                        "height_chirho": 600,
                        "sha256_chirho": WORKER_CHIRHO.digest_chirho(path_chirho),
                    }
                ]
            },
        )
        self.assertEqual(WORKER_CHIRHO.work_chirho(self.root_chirho, self.fake_chirho, True, 0), 0)
        self.assertEqual(self.calls_chirho, ["Prov.1.2"])
        self.assertEqual(WORKER_CHIRHO.work_chirho(self.root_chirho, self.fake_chirho, True, 0), 0)
        self.assertEqual(self.calls_chirho, ["Prov.1.2"])
        state_chirho = WORKER_CHIRHO.load_chirho(
            self.root_chirho / WORKER_CHIRHO.QUEUE_CHIRHO / "progress-chirho.json"
        )
        self.assertEqual(state_chirho["state_chirho"], "proverbs_complete_john_next")

    def test_recover_installed_before_manifest_chirho(self):
        job_chirho = self.job_chirho(1)
        attempt_chirho = self.root_chirho / WORKER_CHIRHO.QUEUE_CHIRHO / "attempt-crash"
        attempt_chirho.mkdir(parents=True)
        self.fake_chirho(self.root_chirho, job_chirho, attempt_chirho, attempt_chirho.parent)
        original_chirho = os.link

        def crash_chirho(source_chirho, dest_chirho):
            original_chirho(source_chirho, dest_chirho)
            raise RuntimeError("simulated crash")

        with patch.object(WORKER_CHIRHO.os, "link", crash_chirho), self.assertRaises(RuntimeError):
            WORKER_CHIRHO.finish_chirho(self.root_chirho, job_chirho, attempt_chirho)
        self.write_chirho(
            WORKER_CHIRHO.QUEUE_CHIRHO / "progress-chirho.json",
            {"state_chirho": "generating", "verse_id_chirho": "Prov.1.1"},
        )
        self.assertEqual(WORKER_CHIRHO.work_chirho(self.root_chirho, self.fake_chirho, True, 0), 0)
        self.assertEqual(self.calls_chirho, ["Prov.1.1", "Prov.1.2"])
        records_chirho = WORKER_CHIRHO.load_chirho(
            self.root_chirho / WORKER_CHIRHO.MANIFESTS_CHIRHO[1]
        )["scenes_chirho"]
        self.assertEqual(
            [row_chirho["lesson_id_chirho"] for row_chirho in records_chirho],
            ["Prov.1.1", "Prov.1.2"],
        )

    def test_same_process_recovers_prepared_before_advancing_chirho(self):
        original_chirho = os.link
        links_chirho = []

        def transient_chirho(source_chirho, dest_chirho):
            original_chirho(source_chirho, dest_chirho)
            links_chirho.append(str(dest_chirho))
            if len(links_chirho) == 1:
                raise OSError("temporary interruption after install")

        with patch.object(WORKER_CHIRHO.os, "link", transient_chirho):
            self.assertEqual(
                WORKER_CHIRHO.work_chirho(self.root_chirho, self.fake_chirho, False, 0), 0
            )
        records_chirho = WORKER_CHIRHO.load_chirho(
            self.root_chirho / WORKER_CHIRHO.MANIFESTS_CHIRHO[1]
        )["scenes_chirho"]
        self.assertEqual(
            [row_chirho["lesson_id_chirho"] for row_chirho in records_chirho],
            ["Prov.1.1", "Prov.1.2"],
        )
        self.assertEqual(self.calls_chirho, ["Prov.1.1", "Prov.1.2"])

    def test_unfinished_child_requires_reconciliation_chirho(self):
        self.write_chirho(
            WORKER_CHIRHO.QUEUE_CHIRHO / "progress-chirho.json",
            {
                "state_chirho": "generating",
                "verse_id_chirho": "Prov.1.1",
                "attempt_chirho": "attempt-crash",
            },
        )
        self.assertEqual(WORKER_CHIRHO.work_chirho(self.root_chirho, self.fake_chirho, True, 0), 1)
        self.assertEqual(self.calls_chirho, [])
        state_chirho = WORKER_CHIRHO.load_chirho(
            self.root_chirho / WORKER_CHIRHO.QUEUE_CHIRHO / "progress-chirho.json"
        )
        self.assertEqual(state_chirho["state_chirho"], "needs_reconciliation")

    def test_queue_is_loaded_once_per_successful_run_chirho(self):
        with patch.object(
            WORKER_CHIRHO, "load_queue_chirho", wraps=WORKER_CHIRHO.load_queue_chirho
        ) as load_chirho:
            self.assertEqual(
                WORKER_CHIRHO.work_chirho(self.root_chirho, self.fake_chirho, False, 0), 0
            )
            self.assertEqual(load_chirho.call_count, 1)
        self.assertEqual(self.calls_chirho, ["Prov.1.1", "Prov.1.2"])

    def test_exclusive_lock_chirho(self):
        queue_chirho = self.root_chirho / WORKER_CHIRHO.QUEUE_CHIRHO
        queue_chirho.mkdir(parents=True)
        with (queue_chirho / "worker.lock").open("a") as lock_chirho:
            fcntl.flock(lock_chirho, fcntl.LOCK_EX | fcntl.LOCK_NB)
            with self.assertRaisesRegex(RuntimeError, "holds the lock"):
                WORKER_CHIRHO.work_chirho(self.root_chirho, self.fake_chirho, True, 0)
        self.assertEqual(self.calls_chirho, [])

    def test_broken_manifest_stops_after_three_retries_chirho(self):
        (self.root_chirho / WORKER_CHIRHO.MANIFESTS_CHIRHO[0]).write_text("not-json")
        self.assertEqual(WORKER_CHIRHO.work_chirho(self.root_chirho, self.fake_chirho, True, 0), 1)
        state_chirho = WORKER_CHIRHO.load_chirho(
            self.root_chirho / WORKER_CHIRHO.QUEUE_CHIRHO / "progress-chirho.json"
        )
        self.assertEqual(state_chirho["consecutive_failures_chirho"], 3)
        self.assertEqual(state_chirho["state_chirho"], "stopped")
        self.assertEqual(WORKER_CHIRHO.work_chirho(self.root_chirho, self.fake_chirho, True, 0), 1)
        self.assertEqual(self.calls_chirho, [])

    def test_conflicting_destination_is_not_overwritten_chirho(self):
        job_chirho = self.job_chirho(1)
        destination_chirho = WORKER_CHIRHO.checked_path_chirho(
            self.root_chirho, WORKER_CHIRHO.asset_name_chirho(job_chirho)
        )
        destination_chirho.parent.mkdir(parents=True)
        destination_chirho.write_bytes(b"keep")
        self.assertEqual(WORKER_CHIRHO.work_chirho(self.root_chirho, self.fake_chirho, True, 0), 1)
        self.assertEqual(destination_chirho.read_bytes(), b"keep")


if __name__ == "__main__":
    unittest.main()


class ReusableSceneBriefTestsChirho(unittest.TestCase):
    def test_source_bound_explanation_reused_without_silent_replacement_chirho(self):
        import hashlib

        with tempfile.TemporaryDirectory() as directory_chirho:
            root_chirho = Path(directory_chirho)
            job_chirho = {
                "id_chirho": "Gen.1.1",
                "canonical_text_chirho": "בְּרֵאשִׁית",
                "canonical_sha256_chirho": hashlib.sha256("בְּרֵאשִׁית".encode()).hexdigest(),
            }
            first_chirho = WORKER_CHIRHO.BRIEFS_CHIRHO.retain_chirho(
                root_chirho, job_chirho, "God creates the heavens and the earth."
            )
            self.assertEqual(
                WORKER_CHIRHO.BRIEFS_CHIRHO.read_chirho(root_chirho, job_chirho), first_chirho
            )
            self.assertEqual(
                WORKER_CHIRHO.BRIEFS_CHIRHO.retain_chirho(
                    root_chirho, job_chirho, first_chirho["explanation_chirho"]
                ),
                first_chirho,
            )
            with self.assertRaisesRegex(ValueError, "silently replace"):
                WORKER_CHIRHO.BRIEFS_CHIRHO.retain_chirho(
                    root_chirho, job_chirho, "Different interpretation."
                )
            changed_chirho = dict(job_chirho, canonical_text_chirho="changed")
            with self.assertRaisesRegex(ValueError, "source identity"):
                WORKER_CHIRHO.BRIEFS_CHIRHO.read_chirho(root_chirho, changed_chirho)

    def test_historical_attempt_without_explanation_stays_unchanged_chirho(self):
        self.assertIsNone(
            WORKER_CHIRHO.BRIEFS_CHIRHO.retain_chirho(Path("/unused-chirho"), {}, None)
        )
