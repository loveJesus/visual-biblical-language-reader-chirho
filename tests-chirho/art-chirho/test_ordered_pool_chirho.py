# For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life. — John 3:16 (KJV)
"""Exercise real ordered installation with isolated, free local image fixtures."""

import errno
import importlib.util
import json
import shutil
import subprocess
import tempfile
import threading
import unittest
from pathlib import Path
from types import SimpleNamespace
from unittest.mock import patch

PATH_CHIRHO = (
    Path(__file__).resolve().parents[2] / "scripts-chirho/art-chirho/ordered_scenes_chirho.py"
)
SPEC_CHIRHO = importlib.util.spec_from_file_location("ordered_pool_test_chirho", PATH_CHIRHO)
WORKER_CHIRHO = importlib.util.module_from_spec(SPEC_CHIRHO)
SPEC_CHIRHO.loader.exec_module(WORKER_CHIRHO)
POOL_CHIRHO = WORKER_CHIRHO.POOL_CHIRHO


class OrderedPoolTestsChirho(unittest.TestCase):
    def setUp(self):
        self.temp_chirho = tempfile.TemporaryDirectory()
        self.root_chirho = Path(self.temp_chirho.name)
        self.home_chirho = self.root_chirho / WORKER_CHIRHO.HOME_CHIRHO
        self.home_chirho.mkdir(parents=True)
        self.jobs_chirho = [
            {
                "id_chirho": f"John.1.{number_chirho}",
                "chapter_chirho": 1,
                "verse_chirho": number_chirho,
            }
            for number_chirho in range(1, 9)
        ]
        self.fixture_chirho = self.root_chirho / "fixture-chirho.webp"
        subprocess.run(
            ["magick", "-size", "800x600", "xc:tan", str(self.fixture_chirho)], check=True
        )
        self.calls_chirho = []
        WORKER_CHIRHO.STOP_CHIRHO = WORKER_CHIRHO.DRAIN_CHIRHO = False

    def tearDown(self):
        WORKER_CHIRHO.STOP_CHIRHO = WORKER_CHIRHO.DRAIN_CHIRHO = False
        self.temp_chirho.cleanup()

    def fake_chirho(self, root_chirho, book_chirho, job_chirho, attempt_chirho):
        self.calls_chirho.append(job_chirho["id_chirho"])
        shutil.copyfile(self.fixture_chirho, attempt_chirho / "scene-chirho.webp")
        (attempt_chirho / "record-chirho.json").write_text(
            json.dumps(
                {
                    "alt_chirho": "A local fixture",
                    "reading_note_chirho": "Imaginative fixture",
                    "prompt_chirho": "No provider request in this test",
                }
            )
        )

    def run_chirho(self, generator_chirho=None):
        return WORKER_CHIRHO.run_book_chirho(
            self.root_chirho,
            "John",
            self.jobs_chirho,
            generator_chirho or self.fake_chirho,
            concurrency_chirho=3,
        )

    def test_three_requests_and_only_one_install_writer_chirho(self):
        barrier_chirho = threading.Barrier(3, timeout=4)
        lock_chirho = threading.Lock()
        active_chirho = peak_chirho = 0
        writer_chirho = threading.get_ident()
        original_chirho = WORKER_CHIRHO.install_chirho

        def generate_chirho(root_chirho, book_chirho, job_chirho, attempt_chirho):
            nonlocal active_chirho, peak_chirho
            checkpoint_chirho = json.loads((self.home_chirho / "inflight-chirho.json").read_text())
            self.assertIn(
                attempt_chirho.name,
                [
                    row_chirho["attempt_chirho"]
                    for row_chirho in checkpoint_chirho["active_jobs_chirho"]
                ],
            )
            with lock_chirho:
                active_chirho += 1
                peak_chirho = max(peak_chirho, active_chirho)
            if job_chirho["verse_chirho"] <= 3:
                barrier_chirho.wait()
            self.fake_chirho(root_chirho, book_chirho, job_chirho, attempt_chirho)
            with lock_chirho:
                active_chirho -= 1

        def install_chirho(*arguments_chirho):
            self.assertEqual(threading.get_ident(), writer_chirho)
            return original_chirho(*arguments_chirho)

        with patch.object(WORKER_CHIRHO, "install_chirho", install_chirho):
            self.assertTrue(self.run_chirho(generate_chirho))
        self.assertEqual(peak_chirho, 3)
        self.assertEqual(
            set(self.calls_chirho), {row_chirho["id_chirho"] for row_chirho in self.jobs_chirho}
        )
        self.assertEqual(len(self.calls_chirho), 8)
        self.assertTrue(self.run_chirho())
        self.assertEqual(len(self.calls_chirho), 8)

    def test_local_failure_held_and_other_verses_continue_chirho(self):
        def generate_chirho(root_chirho, book_chirho, job_chirho, attempt_chirho):
            if job_chirho["verse_chirho"] == 1:
                self.calls_chirho.append(job_chirho["id_chirho"])
                raise RuntimeError("Known item failure")
            self.fake_chirho(root_chirho, book_chirho, job_chirho, attempt_chirho)

        self.assertFalse(self.run_chirho(generate_chirho))
        self.assertEqual(len(self.calls_chirho), 8)
        self.assertEqual(WORKER_CHIRHO.RECOVERY_CHIRHO.count_chirho(self.home_chirho), 1)
        self.assertFalse(self.run_chirho())
        self.assertEqual(len(self.calls_chirho), 8)

    def test_unknown_parallel_requests_never_repeat_on_restart_chirho(self):
        rows_chirho = []
        for number_chirho in range(1, 4):
            attempt_chirho = self.home_chirho / f"attempt-john-unknown{number_chirho:04d}"
            attempt_chirho.mkdir()
            WORKER_CHIRHO.RECOVERY_CHIRHO.request_chirho(attempt_chirho)
            rows_chirho.append(
                {
                    "verse_id_chirho": f"John.1.{number_chirho}",
                    "attempt_chirho": attempt_chirho.name,
                }
            )
        WORKER_CHIRHO.BASE_CHIRHO.atomic_json_chirho(
            self.home_chirho / "inflight-chirho.json",
            {
                "book_chirho": "John",
                "active_jobs_chirho": rows_chirho,
            },
        )
        self.assertFalse(self.run_chirho())
        self.assertFalse(self.run_chirho())
        self.assertEqual(self.calls_chirho, [])
        self.assertEqual(WORKER_CHIRHO.RECOVERY_CHIRHO.count_chirho(self.home_chirho), 3)

    def test_prepared_parallel_results_recover_without_an_image_call_chirho(self):
        rows_chirho = []
        for job_chirho in self.jobs_chirho[:3]:
            attempt_chirho = (
                self.home_chirho / f"attempt-john-prepared{job_chirho['verse_chirho']:04d}"
            )
            attempt_chirho.mkdir()
            self.fake_chirho(self.root_chirho, "John", job_chirho, attempt_chirho)
            WORKER_CHIRHO.RECOVERY_CHIRHO.request_chirho(attempt_chirho)
            record_chirho = WORKER_CHIRHO.record_chirho(
                self.root_chirho, job_chirho, attempt_chirho
            )
            WORKER_CHIRHO.BASE_CHIRHO.atomic_json_chirho(
                attempt_chirho / "prepared-chirho.json", record_chirho
            )
            rows_chirho.append(
                {"verse_id_chirho": job_chirho["id_chirho"], "attempt_chirho": attempt_chirho.name}
            )
        WORKER_CHIRHO.BASE_CHIRHO.atomic_json_chirho(
            self.home_chirho / "inflight-chirho.json",
            {
                "book_chirho": "John",
                "active_jobs_chirho": rows_chirho,
            },
        )
        self.assertTrue(self.run_chirho())
        self.assertEqual(len(self.calls_chirho), 8)
        self.assertEqual(len(set(self.calls_chirho)), 8)

    def test_drain_finishes_current_three_without_starting_a_fourth_chirho(self):
        barrier_chirho = threading.Barrier(3, timeout=4)

        def generate_chirho(root_chirho, book_chirho, job_chirho, attempt_chirho):
            barrier_chirho.wait()
            WORKER_CHIRHO.drain_chirho(None, None)
            self.fake_chirho(root_chirho, book_chirho, job_chirho, attempt_chirho)

        self.assertFalse(self.run_chirho(generate_chirho))
        self.assertEqual(len(self.calls_chirho), 3)
        self.assertFalse((self.home_chirho / "inflight-chirho.json").exists())
        manifest_chirho = json.loads(
            WORKER_CHIRHO.manifest_path_chirho(self.root_chirho, "John").read_text()
        )
        self.assertEqual(len(manifest_chirho["scenes_chirho"]), 3)

    def test_low_space_refuses_before_any_new_image_chirho(self):
        with (
            patch.object(POOL_CHIRHO.shutil, "disk_usage", return_value=SimpleNamespace(free=1024)),
            self.assertRaises(OSError),
        ):
            self.run_chirho()
        self.assertEqual(self.calls_chirho, [])

    def fatal_case_chirho(self, error_chirho):
        barrier_chirho = threading.Barrier(3, timeout=4)
        failed_chirho = threading.Event()
        original_chirho = WORKER_CHIRHO.RECOVERY_CHIRHO.hold_chirho

        def hold_chirho(*arguments_chirho):
            result_chirho = original_chirho(*arguments_chirho)
            failed_chirho.set()
            return result_chirho

        def generate_chirho(root_chirho, book_chirho, job_chirho, attempt_chirho):
            barrier_chirho.wait()
            if job_chirho["verse_chirho"] == 1:
                self.calls_chirho.append(job_chirho["id_chirho"])
                raise error_chirho
            self.assertTrue(failed_chirho.wait(4))
            self.fake_chirho(root_chirho, book_chirho, job_chirho, attempt_chirho)

        with (
            patch.object(WORKER_CHIRHO.RECOVERY_CHIRHO, "hold_chirho", hold_chirho),
            self.assertRaises(type(error_chirho)),
        ):
            self.run_chirho(generate_chirho)
        self.assertEqual(len(self.calls_chirho), 3)

    def test_fatal_storage_drains_started_requests_without_replacement_chirho(self):
        self.fatal_case_chirho(OSError(errno.ENOSPC, "No space"))

    def test_shared_source_refusal_drains_without_more_dispatch_chirho(self):
        self.fatal_case_chirho(POOL_CHIRHO.SourceChangedChirho("Source changed"))

    def test_three_consecutive_failures_stop_new_dispatch_chirho(self):
        barrier_chirho = threading.Barrier(3, timeout=4)

        def generate_chirho(root_chirho, book_chirho, job_chirho, attempt_chirho):
            self.calls_chirho.append(job_chirho["id_chirho"])
            barrier_chirho.wait()
            raise RuntimeError("Generator failed")

        self.assertFalse(self.run_chirho(generate_chirho))
        self.assertEqual(len(self.calls_chirho), 3)
        state_chirho = json.loads((self.home_chirho / "status-chirho.json").read_text())
        self.assertEqual(state_chirho["state_chirho"], "waiting_for_generator")

    def test_failed_checkpoint_cannot_launch_an_image_chirho(self):
        original_chirho = WORKER_CHIRHO.BASE_CHIRHO.atomic_json_chirho

        def write_chirho(path_chirho, document_chirho):
            if path_chirho.name == "inflight-chirho.json":
                raise OSError(errno.ENOSPC, "Checkpoint refused")
            original_chirho(path_chirho, document_chirho)

        with (
            patch.object(WORKER_CHIRHO.BASE_CHIRHO, "atomic_json_chirho", write_chirho),
            self.assertRaises(OSError),
        ):
            self.run_chirho()
        self.assertEqual(self.calls_chirho, [])

    def test_exact_source_excerpt_instead_of_full_chapter_chirho(self):
        import hashlib

        verse_chirho = {
            "id_chirho": "John.1.1",
            "canonical_text_chirho": "θεὸς·",
            "tokens_chirho": [{"gloss_chirho": "God"}],
        }
        source_chirho = (
            self.root_chirho / "static/content-chirho/john-chirho/chapter-01-chirho.json"
        )
        source_chirho.parent.mkdir(parents=True)
        source_chirho.write_text(
            json.dumps({"verses_chirho": [verse_chirho, {"id_chirho": "John.1.2"}]})
        )
        attempt_chirho = self.home_chirho / "attempt-john-excerpt0001"
        attempt_chirho.mkdir()
        job_chirho = {
            **self.jobs_chirho[0],
            "reference_chirho": "John 1:1",
            "canonical_text_chirho": verse_chirho["canonical_text_chirho"],
            "canonical_sha256_chirho": hashlib.sha256(
                verse_chirho["canonical_text_chirho"].encode()
            ).hexdigest(),
        }
        WORKER_CHIRHO.prompt_chirho(self.root_chirho, job_chirho, attempt_chirho)
        excerpt_chirho = json.loads((attempt_chirho / "source-input-chirho.json").read_text())
        self.assertEqual(excerpt_chirho, {"job_chirho": job_chirho, "verse_chirho": verse_chirho})
        verse_chirho["canonical_text_chirho"] = "changed"
        source_chirho.write_text(json.dumps({"verses_chirho": [verse_chirho]}))
        with self.assertRaises(POOL_CHIRHO.SourceChangedChirho):
            WORKER_CHIRHO.prompt_chirho(self.root_chirho, job_chirho, attempt_chirho)

    def test_invalid_concurrency_refused_chirho(self):
        for value_chirho in (0, 4, True):
            with self.assertRaises(ValueError):
                WORKER_CHIRHO.run_book_chirho(
                    self.root_chirho,
                    "John",
                    self.jobs_chirho,
                    self.fake_chirho,
                    concurrency_chirho=value_chirho,
                )
        self.assertEqual(self.calls_chirho, [])


if __name__ == "__main__":
    unittest.main()
