# For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life. — John 3:16 (KJV)
"""Bounded generation overlaps while one owner installs and preserves recovery evidence."""

import hashlib
import json
import signal
import threading
import time
import unittest
from datetime import UTC, datetime
from pathlib import Path
from unittest.mock import Mock, patch

import test_scene_worker_chirho as scene_test_chirho

WORKER_CHIRHO = scene_test_chirho.WORKER_CHIRHO


class SceneConcurrencyTestsChirho(unittest.TestCase):
    setUp = scene_test_chirho.SceneWorkerTestsChirho.setUp
    tearDown = scene_test_chirho.SceneWorkerTestsChirho.tearDown
    write_chirho = scene_test_chirho.SceneWorkerTestsChirho.write_chirho
    job_chirho = scene_test_chirho.SceneWorkerTestsChirho.job_chirho
    fake_chirho = scene_test_chirho.SceneWorkerTestsChirho.fake_chirho

    def test_three_overlap_with_serial_installs_and_no_duplicates_chirho(self):
        self.write_chirho(
            WORKER_CHIRHO.JOBS_CHIRHO,
            {"jobs_chirho": [self.job_chirho(index_chirho) for index_chirho in range(1, 5)]},
        )
        barrier_chirho = threading.Barrier(3, timeout=5)
        second_installed_chirho = threading.Event()
        lock_chirho = threading.Lock()
        entered_chirho = []
        installs_chirho = []
        owner_chirho = threading.get_ident()
        original_finish_chirho = WORKER_CHIRHO.finish_chirho

        def generate_chirho(root_chirho, job_chirho, attempt_chirho, queue_chirho):
            with lock_chirho:
                entered_chirho.append(job_chirho["id_chirho"])
                first_wave_chirho = len(entered_chirho) <= 3
            if first_wave_chirho:
                checkpoint_chirho = WORKER_CHIRHO.load_chirho(queue_chirho / "progress-chirho.json")
                self.assertIn(
                    job_chirho["id_chirho"],
                    [
                        item_chirho["verse_id_chirho"]
                        for item_chirho in checkpoint_chirho["active_jobs_chirho"]
                    ],
                )
                barrier_chirho.wait()
            if job_chirho["verse_chirho"] == 1:
                self.assertTrue(second_installed_chirho.wait(8))
            self.fake_chirho(root_chirho, job_chirho, attempt_chirho, queue_chirho)

        def finish_chirho(root_chirho, job_chirho, attempt_chirho):
            self.assertEqual(threading.get_ident(), owner_chirho)
            original_finish_chirho(root_chirho, job_chirho, attempt_chirho)
            installs_chirho.append(job_chirho["id_chirho"])
            if job_chirho["verse_chirho"] == 2:
                second_installed_chirho.set()

        with patch.object(WORKER_CHIRHO, "finish_chirho", finish_chirho):
            self.assertEqual(
                WORKER_CHIRHO.work_chirho(
                    self.root_chirho, generate_chirho, backoff_chirho=0, concurrency_chirho=3
                ),
                0,
            )
        self.assertCountEqual(
            entered_chirho, [f"Prov.1.{index_chirho}" for index_chirho in range(1, 5)]
        )
        self.assertLess(installs_chirho.index("Prov.1.2"), installs_chirho.index("Prov.1.1"))
        records_chirho = WORKER_CHIRHO.load_chirho(
            self.root_chirho / WORKER_CHIRHO.MANIFESTS_CHIRHO[1]
        )["scenes_chirho"]
        self.assertCountEqual(
            [item_chirho["lesson_id_chirho"] for item_chirho in records_chirho], entered_chirho
        )
        self.assertTrue(
            all(item_chirho["art_review_chirho"] == "pending" for item_chirho in records_chirho)
        )

    def test_failure_stops_new_dispatch_drains_peers_and_refuses_replay_chirho(self):
        self.write_chirho(
            WORKER_CHIRHO.JOBS_CHIRHO,
            {"jobs_chirho": [self.job_chirho(index_chirho) for index_chirho in range(1, 5)]},
        )
        barrier_chirho = threading.Barrier(3, timeout=5)
        called_chirho = []

        def generate_chirho(root_chirho, job_chirho, attempt_chirho, queue_chirho):
            called_chirho.append(job_chirho["id_chirho"])
            barrier_chirho.wait()
            if job_chirho["verse_chirho"] == 1:
                raise RuntimeError("uncertain image output")
            deadline_chirho = time.monotonic() + 5
            while (
                WORKER_CHIRHO.load_chirho(queue_chirho / "progress-chirho.json")["state_chirho"]
                != "needs_reconciliation"
            ):
                if time.monotonic() >= deadline_chirho:
                    raise RuntimeError("owner did not preserve the failure")
                time.sleep(0.01)
            self.fake_chirho(root_chirho, job_chirho, attempt_chirho, queue_chirho)

        self.assertEqual(
            WORKER_CHIRHO.work_chirho(
                self.root_chirho, generate_chirho, backoff_chirho=0, concurrency_chirho=3
            ),
            1,
        )
        self.assertCountEqual(called_chirho, ["Prov.1.1", "Prov.1.2", "Prov.1.3"])
        records_chirho = WORKER_CHIRHO.load_chirho(
            self.root_chirho / WORKER_CHIRHO.MANIFESTS_CHIRHO[1]
        )["scenes_chirho"]
        self.assertCountEqual(
            [item_chirho["lesson_id_chirho"] for item_chirho in records_chirho],
            ["Prov.1.2", "Prov.1.3"],
        )
        checkpoint_chirho = WORKER_CHIRHO.load_chirho(
            self.root_chirho / WORKER_CHIRHO.QUEUE_CHIRHO / "progress-chirho.json"
        )
        self.assertEqual(
            [
                item_chirho["verse_id_chirho"]
                for item_chirho in checkpoint_chirho["active_jobs_chirho"]
            ],
            ["Prov.1.1"],
        )
        forbidden_chirho = Mock(side_effect=AssertionError("must reconcile before spending again"))
        self.assertEqual(
            WORKER_CHIRHO.work_chirho(self.root_chirho, forbidden_chirho, concurrency_chirho=3), 1
        )
        forbidden_chirho.assert_not_called()

    def test_restart_reconciles_every_prior_job_not_just_first_chirho(self):
        job_chirho = self.job_chirho(1)
        attempt_chirho = self.root_chirho / WORKER_CHIRHO.QUEUE_CHIRHO / "attempt-installed"
        attempt_chirho.mkdir(parents=True)
        self.fake_chirho(self.root_chirho, job_chirho, attempt_chirho, attempt_chirho.parent)
        WORKER_CHIRHO.finish_chirho(self.root_chirho, job_chirho, attempt_chirho)
        self.write_chirho(
            WORKER_CHIRHO.QUEUE_CHIRHO / "progress-chirho.json",
            {
                "state_chirho": "generating",
                "verse_id_chirho": "Prov.1.1",
                "active_jobs_chirho": [
                    {"verse_id_chirho": "Prov.1.1", "attempt_chirho": attempt_chirho.name},
                    {"verse_id_chirho": "Prov.1.2", "attempt_chirho": "attempt-uncertain"},
                ],
            },
        )
        forbidden_chirho = Mock(side_effect=AssertionError("unresolved second job must hold"))
        self.assertEqual(
            WORKER_CHIRHO.work_chirho(self.root_chirho, forbidden_chirho, concurrency_chirho=3), 1
        )
        forbidden_chirho.assert_not_called()
        state_chirho = WORKER_CHIRHO.load_chirho(
            self.root_chirho / WORKER_CHIRHO.QUEUE_CHIRHO / "progress-chirho.json"
        )
        self.assertEqual(
            [item_chirho["verse_id_chirho"] for item_chirho in state_chirho["active_jobs_chirho"]],
            ["Prov.1.2"],
        )

    def test_once_still_spends_at_most_one_generation_chirho(self):
        self.assertEqual(
            WORKER_CHIRHO.work_chirho(
                self.root_chirho, self.fake_chirho, once_chirho=True, concurrency_chirho=3
            ),
            0,
        )
        self.assertEqual(self.calls_chirho, ["Prov.1.1"])

    def test_startup_error_keeps_unresolved_jobs_across_retry_chirho(self):
        self.write_chirho(
            WORKER_CHIRHO.QUEUE_CHIRHO / "progress-chirho.json",
            {
                "state_chirho": "generating",
                "verse_id_chirho": "Prov.1.1",
                "active_jobs_chirho": [
                    {"verse_id_chirho": "Prov.1.1", "attempt_chirho": "attempt-uncertain"}
                ],
            },
        )
        original_chirho = WORKER_CHIRHO.load_queue_chirho
        calls_chirho = []

        def load_chirho(root_chirho):
            calls_chirho.append(root_chirho)
            if len(calls_chirho) == 1:
                raise OSError("temporary catalogue read failure")
            return original_chirho(root_chirho)

        forbidden_chirho = Mock(side_effect=AssertionError("retry must retain the no-spend hold"))
        with patch.object(WORKER_CHIRHO, "load_queue_chirho", load_chirho):
            self.assertEqual(
                WORKER_CHIRHO.work_chirho(
                    self.root_chirho, forbidden_chirho, backoff_chirho=0, concurrency_chirho=3
                ),
                1,
            )
        forbidden_chirho.assert_not_called()
        state_chirho = WORKER_CHIRHO.load_chirho(
            self.root_chirho / WORKER_CHIRHO.QUEUE_CHIRHO / "progress-chirho.json"
        )
        self.assertEqual(
            state_chirho["active_jobs_chirho"][0]["attempt_chirho"], "attempt-uncertain"
        )
        self.assertEqual(state_chirho["consecutive_failures_chirho"], 1)

    def test_invalid_pool_size_refuses_before_generation_chirho(self):
        forbidden_chirho = Mock()
        for value_chirho in (0, 4, -1, True, "3"):
            with self.subTest(concurrency_chirho=value_chirho), self.assertRaises(ValueError):
                WORKER_CHIRHO.work_chirho(
                    self.root_chirho, forbidden_chirho, concurrency_chirho=value_chirho
                )
        forbidden_chirho.assert_not_called()

    def test_graceful_drain_installs_started_jobs_without_next_generation_chirho(self):
        self.write_chirho(
            WORKER_CHIRHO.JOBS_CHIRHO,
            {"jobs_chirho": [self.job_chirho(index_chirho) for index_chirho in range(1, 5)]},
        )
        barrier_chirho = threading.Barrier(2, timeout=5)

        def generate_chirho(root_chirho, job_chirho, attempt_chirho, queue_chirho):
            barrier_chirho.wait()
            WORKER_CHIRHO.drain_handler_chirho(signal.SIGUSR1, None)
            self.fake_chirho(root_chirho, job_chirho, attempt_chirho, queue_chirho)

        self.assertEqual(
            WORKER_CHIRHO.work_chirho(
                self.root_chirho, generate_chirho, backoff_chirho=0, concurrency_chirho=2
            ),
            0,
        )
        self.assertCountEqual(self.calls_chirho, ["Prov.1.1", "Prov.1.2"])
        state_chirho = WORKER_CHIRHO.load_chirho(
            self.root_chirho / WORKER_CHIRHO.QUEUE_CHIRHO / "progress-chirho.json"
        )
        self.assertEqual(state_chirho["state_chirho"], "stopped")

    def test_stop_signals_all_registered_children_chirho(self):
        children_chirho = {
            index_chirho: Mock(pid=index_chirho, poll=Mock(return_value=None))
            for index_chirho in range(1, 4)
        }
        with (
            patch.object(WORKER_CHIRHO, "CHILDREN_CHIRHO", children_chirho),
            patch.object(WORKER_CHIRHO.os, "killpg") as kill_chirho,
        ):
            WORKER_CHIRHO.stop_handler_chirho(signal.SIGTERM, None)
            self.assertCountEqual(
                kill_chirho.call_args_list,
                [((index_chirho, signal.SIGTERM),) for index_chirho in range(1, 4)],
            )

    def test_exact_source_excerpt_and_drift_before_generation_chirho(self):
        text_chirho = "כַּשֶּׁלֶג"
        job_chirho = {
            **self.job_chirho(1),
            "reference_chirho": "Proverbs 1:1",
            "content_path_chirho": "/content-chirho/test-chirho.json",
            "canonical_text_chirho": text_chirho,
            "canonical_sha256_chirho": hashlib.sha256(text_chirho.encode()).hexdigest(),
        }
        verse_chirho = {
            "id_chirho": "Prov.1.1",
            "canonical_text_chirho": text_chirho,
            "tokens_chirho": [{"text_chirho": text_chirho, "gloss_chirho": "like snow"}],
        }
        self.write_chirho(
            Path("static/content-chirho/test-chirho.json"),
            {
                "verses_chirho": [
                    verse_chirho,
                    {"id_chirho": "Prov.1.2", "canonical_text_chirho": "other"},
                ]
            },
        )
        attempt_chirho = self.root_chirho / "attempt-excerpt"
        attempt_chirho.mkdir()
        WORKER_CHIRHO.prompt_chirho(self.root_chirho, job_chirho, attempt_chirho)
        data_chirho = WORKER_CHIRHO.load_chirho(attempt_chirho / "verse-input-chirho.json")
        self.assertEqual(data_chirho["verse_chirho"], verse_chirho)
        with self.assertRaisesRegex(ValueError, "pinned verse"):
            WORKER_CHIRHO.prompt_chirho(
                self.root_chirho, {**job_chirho, "canonical_text_chirho": "changed"}, attempt_chirho
            )

    def test_saved_tool_attestation_cannot_leak_between_threads_chirho(self):
        date_chirho = datetime.now(UTC)
        folder_chirho = self.root_chirho / ".codex/sessions" / date_chirho.strftime("%Y/%m/%d")
        folder_chirho.mkdir(parents=True)
        for number_chirho in (1, 2):
            thread_chirho = f"00000000-0000-0000-0000-{number_chirho:012d}"
            log_chirho = self.root_chirho / f"thread-{number_chirho}.jsonl"
            log_chirho.write_text(
                json.dumps({"type": "thread.started", "thread_id": thread_chirho}) + "\n"
            )
            (folder_chirho / f"rollout-test-{thread_chirho}.jsonl").write_text(
                json.dumps(
                    {
                        "type": "response_item",
                        "payload": {
                            "type": "custom_tool_call",
                            "input": "await tools.image_gen__imagegen({})"
                            if number_chirho == 1
                            else "text('no image')",
                        },
                    }
                )
                + "\n"
            )
            with patch.object(WORKER_CHIRHO.Path, "home", return_value=self.root_chirho):
                if number_chirho == 1:
                    WORKER_CHIRHO.attest_generator_chirho(log_chirho)
                else:
                    with self.assertRaisesRegex(ValueError, "No built-in"):
                        WORKER_CHIRHO.attest_generator_chirho(log_chirho)


if __name__ == "__main__":
    unittest.main()
