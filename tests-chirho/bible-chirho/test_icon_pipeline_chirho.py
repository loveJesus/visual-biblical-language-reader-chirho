# For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life. — John 3:16 (KJV)
"""Durable concurrency/retry/recovery behavior; no image or provider requests."""

import json
import multiprocessing
import sys
import tempfile
import unittest
from pathlib import Path
from types import SimpleNamespace
from unittest.mock import patch

ROOT_CHIRHO = Path(__file__).resolve().parents[2]
sys.path.insert(
    0, str(ROOT_CHIRHO / "scripts-chirho/bible-chirho/icon_pipeline_chirho")
)
import process_chirho
import runtime_chirho
from queue_chirho import MAX_ATTEMPTS_CHIRHO, MAX_BACKLOG_CHIRHO, QueueChirho


def checker_process_chirho(path_chirho, started_chirho, release_chirho):
    queue_chirho = QueueChirho(Path(path_chirho))
    id_chirho = queue_chirho.checking_chirho()
    started_chirho.put(id_chirho)
    release_chirho.wait(10)


def claim_process_chirho(path_chirho, results_chirho):
    queue_chirho = QueueChirho(Path(path_chirho))
    claimed_chirho = queue_chirho.generation_chirho()
    results_chirho.put(claimed_chirho)


class IconPipelineTestsChirho(unittest.TestCase):
    def setUp(self_chirho):
        self_chirho.temporary_chirho = tempfile.TemporaryDirectory()
        self_chirho.root_chirho = Path(self_chirho.temporary_chirho.name)
        self_chirho.path_chirho = self_chirho.root_chirho / "queue-chirho.sqlite"
        self_chirho.queue_chirho = QueueChirho(self_chirho.path_chirho)

    def tearDown(self_chirho):
        self_chirho.queue_chirho.db_chirho.close()
        self_chirho.temporary_chirho.cleanup()

    def seed_chirho(self_chirho, count_chirho=80, attempts_chirho=0):
        self_chirho.rows_chirho = [
            {
                "key_chirho": str(number_chirho),
                "payload_chirho": {"key_chirho": str(number_chirho)},
                "state_chirho": "queued",
                "attempts_chirho": attempts_chirho,
                "reason_chirho": None,
                "origin_chirho": [],
            }
            for number_chirho in range(count_chirho)
        ]
        self_chirho.queue_chirho.seed_chirho(
            self_chirho.rows_chirho, {"source_chirho": "fixed"}
        )

    def generated_chirho(self_chirho):
        id_chirho, rows_chirho = self_chirho.queue_chirho.generation_chirho()
        self_chirho.queue_chirho.transition_chirho(id_chirho, "generating", "generated")
        return id_chirho, {row_chirho["key_chirho"] for row_chirho in rows_chirho}

    def test_real_checker_process_does_not_block_independent_generation_chirho(
        self_chirho,
    ):
        self_chirho.seed_chirho()
        first_chirho, _keys_chirho = self_chirho.generated_chirho()
        context_chirho = multiprocessing.get_context("spawn")
        started_chirho, release_chirho = context_chirho.Queue(), context_chirho.Event()
        child_chirho = context_chirho.Process(
            target=checker_process_chirho,
            args=(str(self_chirho.path_chirho), started_chirho, release_chirho),
        )
        child_chirho.start()
        try:
            self_chirho.assertEqual(started_chirho.get(timeout=10), first_chirho)
            for _number_chirho in range(3):
                self_chirho.generated_chirho()
            self_chirho.assertTrue(child_chirho.is_alive())
            self_chirho.assertEqual(
                self_chirho.queue_chirho.status_chirho()["jobs_chirho"],
                {"checking": 1, "generated": 3},
            )
        finally:
            release_chirho.set()
            child_chirho.join(10)
        self_chirho.assertEqual(child_chirho.exitcode, 0)

    def test_concurrent_claims_never_duplicate_lemmas_or_exceed_two_generators_chirho(
        self_chirho,
    ):
        self_chirho.seed_chirho()
        context_chirho = multiprocessing.get_context("spawn")
        results_chirho = context_chirho.Queue()
        children_chirho = [
            context_chirho.Process(
                target=claim_process_chirho,
                args=(str(self_chirho.path_chirho), results_chirho),
            )
            for _number_chirho in range(4)
        ]
        for child_chirho in children_chirho:
            child_chirho.start()
        claims_chirho = [
            results_chirho.get(timeout=10) for _child_chirho in children_chirho
        ]
        for child_chirho in children_chirho:
            child_chirho.join(10)
            self_chirho.assertEqual(child_chirho.exitcode, 0)
        claims_chirho = [claim_chirho for claim_chirho in claims_chirho if claim_chirho]
        self_chirho.assertEqual(len(claims_chirho), 2)
        self_chirho.assertEqual(
            len(
                {
                    row_chirho["key_chirho"]
                    for claim_chirho in claims_chirho
                    for row_chirho in claim_chirho[1]
                }
            ),
            32,
        )

    def test_only_failed_cells_return_to_tail_after_untried_lemmas_chirho(self_chirho):
        self_chirho.seed_chirho(48)
        first_chirho, keys_chirho = self_chirho.generated_chirho()
        self_chirho.assertEqual(
            self_chirho.queue_chirho.checking_chirho(), first_chirho
        )
        accepted_chirho = {str(number_chirho) for number_chirho in range(8)}
        self_chirho.queue_chirho.settle_chirho(
            first_chirho,
            accepted_chirho,
            keys_chirho - accepted_chirho,
            set(),
            "Known partial failure",
        )
        for expected_chirho in (
            set(map(str, range(16, 32))),
            set(map(str, range(32, 48))),
            keys_chirho - accepted_chirho,
        ):
            id_chirho, actual_chirho = self_chirho.generated_chirho()
            self_chirho.assertEqual(actual_chirho, expected_chirho)
            self_chirho.queue_chirho.checking_chirho()
            self_chirho.queue_chirho.settle_chirho(
                id_chirho, actual_chirho, set(), set(), "Done"
            )
        self_chirho.assertEqual(
            self_chirho.queue_chirho.status_chirho()["lemmas_chirho"], {"done": 48}
        )

    def test_retry_cap_includes_original_attempt_and_survives_reopening_chirho(
        self_chirho,
    ):
        self_chirho.seed_chirho(1, 1)
        self_chirho.assertEqual(MAX_ATTEMPTS_CHIRHO, 3)
        for _number_chirho in range(2):
            id_chirho, keys_chirho = self_chirho.generated_chirho()
            self_chirho.queue_chirho.checking_chirho()
            self_chirho.queue_chirho.settle_chirho(
                id_chirho, set(), keys_chirho, set(), "Known rejected drawing"
            )
        reopened_chirho = QueueChirho(self_chirho.path_chirho)
        self_chirho.assertIsNone(reopened_chirho.generation_chirho())
        self_chirho.assertEqual(
            reopened_chirho.status_chirho()["lemmas_chirho"], {"held": 1}
        )
        reopened_chirho.db_chirho.close()

    def test_unknown_results_never_requeue_and_seed_does_not_reset_them_chirho(
        self_chirho,
    ):
        self_chirho.seed_chirho(32)
        id_chirho, rows_chirho = self_chirho.queue_chirho.generation_chirho()
        keys_chirho = {row_chirho["key_chirho"] for row_chirho in rows_chirho}
        self_chirho.queue_chirho.settle_chirho(
            id_chirho, set(), set(), keys_chirho, "Unknown original result"
        )
        self_chirho.assertFalse(
            self_chirho.queue_chirho.seed_chirho(
                self_chirho.rows_chirho, {"source_chirho": "fixed"}
            )
        )
        next_chirho = self_chirho.queue_chirho.generation_chirho()
        self_chirho.assertFalse(
            keys_chirho & {row_chirho["key_chirho"] for row_chirho in next_chirho[1]}
        )
        with self_chirho.assertRaises(ValueError):
            self_chirho.queue_chirho.seed_chirho(
                self_chirho.rows_chirho, {"source_chirho": "changed"}
            )

    def test_storage_backpressure_and_single_checker_chirho(self_chirho):
        self_chirho.seed_chirho(160)
        first_chirho = None
        for _number_chirho in range(MAX_BACKLOG_CHIRHO):
            id_chirho, _keys_chirho = self_chirho.generated_chirho()
            first_chirho = first_chirho or id_chirho
        self_chirho.assertIsNone(self_chirho.queue_chirho.generation_chirho())
        self_chirho.assertEqual(
            self_chirho.queue_chirho.checking_chirho(), first_chirho
        )
        self_chirho.assertIsNone(self_chirho.queue_chirho.checking_chirho())
        self_chirho.queue_chirho.settle_chirho(
            first_chirho,
            runtime_chirho.keys_chirho(self_chirho.queue_chirho, first_chirho),
            set(),
            set(),
            "Archived",
        )
        self_chirho.assertIsNotNone(self_chirho.queue_chirho.generation_chirho())

    def test_invalid_outcome_partition_rolls_back_chirho(self_chirho):
        self_chirho.seed_chirho(16)
        id_chirho, keys_chirho = self_chirho.generated_chirho()
        self_chirho.queue_chirho.checking_chirho()
        with self_chirho.assertRaises(ValueError):
            self_chirho.queue_chirho.settle_chirho(
                id_chirho, keys_chirho, keys_chirho, set(), "Invalid"
            )
        self_chirho.assertEqual(
            self_chirho.queue_chirho.status_chirho()["jobs_chirho"], {"checking": 1}
        )

    def test_archive_failure_stops_generation_without_requeuing_image_chirho(
        self_chirho,
    ):
        self_chirho.seed_chirho(32)
        id_chirho, _keys_chirho = self_chirho.generated_chirho()
        worker_chirho = SimpleNamespace(
            QUEUE_CHIRHO=self_chirho.root_chirho,
            finish_chirho=lambda _path_chirho: (
                _number_chirho for _number_chirho in ()
            ).throw(OSError("R2 unavailable")),
            AtlasLayoutRefusalChirho=type("LayoutErrorChirho", (ValueError,), {}),
        )
        attempt_chirho = runtime_chirho.attempt_path_chirho(worker_chirho, id_chirho)
        attempt_chirho.mkdir(parents=True)
        (attempt_chirho / "visual-review-chirho.json").write_text("{}")
        with self_chirho.assertRaises(OSError):
            runtime_chirho.checking_chirho(
                worker_chirho, self_chirho.queue_chirho, lambda: False
            )
        self_chirho.assertEqual(
            self_chirho.queue_chirho.status_chirho()["jobs_chirho"], {"installing": 1}
        )
        self_chirho.assertIsNone(self_chirho.queue_chirho.generation_chirho())

    def test_source_stop_is_per_cell_and_never_retries_after_image_call_chirho(
        self_chirho,
    ):
        self_chirho.seed_chirho(16)
        id_chirho, rows_chirho = self_chirho.queue_chirho.generation_chirho()
        attempt_chirho = self_chirho.root_chirho / "attempt-chirho"
        attempt_chirho.mkdir()
        (attempt_chirho / "plan-chirho.json").write_text(
            json.dumps({"cells_chirho": rows_chirho})
        )
        (attempt_chirho / "source-review-needed-chirho.json").write_text(
            '[{"cell_chirho":0,"reason_chirho":"Unknown lexical assignment"}]'
        )
        worker_chirho = SimpleNamespace(
            read_chirho=lambda path_chirho: json.loads(path_chirho.read_text()),
            key_chirho=lambda row_chirho: row_chirho["key_chirho"],
        )
        with (
            patch.object(runtime_chirho, "image_calls_chirho", return_value=1),
            self_chirho.assertRaises(ValueError),
        ):
            runtime_chirho.source_disposition_chirho(
                worker_chirho, self_chirho.queue_chirho, id_chirho, attempt_chirho
            )
        with patch.object(runtime_chirho, "image_calls_chirho", return_value=0):
            runtime_chirho.source_disposition_chirho(
                worker_chirho, self_chirho.queue_chirho, id_chirho, attempt_chirho
            )
        self_chirho.assertEqual(
            self_chirho.queue_chirho.status_chirho()["lemmas_chirho"],
            {"held": 1, "queued": 15},
        )

    def test_call_evidence_counts_custom_and_function_calls_but_not_documentation_chirho(
        self_chirho,
    ):
        attempt_chirho = self_chirho.root_chirho / "attempt-chirho"
        attempt_chirho.mkdir()
        thread_chirho = "00000000-0000-0000-0000-000000000001"
        (attempt_chirho / "codex-chirho.jsonl").write_text(
            json.dumps({"type": "thread.started", "thread_id": thread_chirho}) + "\n"
        )
        session_chirho = self_chirho.root_chirho / ".codex/sessions/2026/11/05"
        session_chirho.mkdir(parents=True)
        rows_chirho = [
            {
                "type": "session_meta",
                "payload": {"documentation": "tools.image_gen__imagegen("},
            },
            {
                "type": "response_item",
                "payload": {
                    "type": "custom_tool_call",
                    "name": "functions.exec",
                    "input": "await tools.image_gen__imagegen({prompt: 'one'})",
                },
            },
            {
                "type": "response_item",
                "payload": {
                    "type": "function_call",
                    "name": "functions.exec",
                    "arguments": "await tools.image_gen__imagegen({prompt: 'two'})",
                },
            },
        ]
        (session_chirho / ("rollout-test-" + thread_chirho + ".jsonl")).write_text(
            "\n".join(json.dumps(row_chirho) for row_chirho in rows_chirho)
        )
        with patch.object(
            process_chirho.Path, "home", return_value=self_chirho.root_chirho
        ):
            self_chirho.assertEqual(
                process_chirho.image_calls_chirho(attempt_chirho), 2
            )

    def test_malformed_review_is_archived_and_other_sheets_continue_chirho(self_chirho):
        self_chirho.seed_chirho(48)
        first_chirho, _first_keys_chirho = self_chirho.generated_chirho()
        second_chirho, second_keys_chirho = self_chirho.generated_chirho()
        retired_chirho = []
        worker_chirho = SimpleNamespace(
            QUEUE_CHIRHO=self_chirho.root_chirho,
            read_chirho=lambda path_chirho: json.loads(path_chirho.read_text()),
            key_chirho=lambda row_chirho: row_chirho["key_chirho"],
            retire_chirho=lambda path_chirho: retired_chirho.append(path_chirho.name),
            atomic_chirho=lambda _path_chirho, _value_chirho: None,
            AtlasLayoutRefusalChirho=type("LayoutErrorChirho", (ValueError,), {}),
        )
        for id_chirho in (first_chirho, second_chirho):
            path_chirho = runtime_chirho.attempt_path_chirho(worker_chirho, id_chirho)
            path_chirho.mkdir(parents=True)
            (path_chirho / "visual-review-chirho.json").write_text("{}")

        def finish_chirho(path_chirho):
            if path_chirho.name == first_chirho:
                raise ValueError("Malformed per-cell review")
            (path_chirho / "installed-chirho.json").write_text(
                json.dumps(
                    {
                        "records_chirho": [
                            {"key_chirho": key_chirho}
                            for key_chirho in second_keys_chirho
                        ],
                        "holds_chirho": [],
                    }
                )
            )

        worker_chirho.finish_chirho = finish_chirho
        self_chirho.queue_chirho.meta_chirho("producer_done_chirho", True)
        runtime_chirho.checking_chirho(
            worker_chirho, self_chirho.queue_chirho, lambda: False
        )
        self_chirho.assertEqual(retired_chirho, [first_chirho])
        self_chirho.assertIsNone(
            self_chirho.queue_chirho.status_chirho()["stop_chirho"]
        )
        self_chirho.assertEqual(
            self_chirho.queue_chirho.status_chirho()["lemmas_chirho"],
            {"done": 16, "held": 16, "queued": 16},
        )

    def test_changed_source_plan_refuses_before_inspection_or_install_chirho(
        self_chirho,
    ):
        self_chirho.seed_chirho(16)
        id_chirho, _rows_chirho = self_chirho.queue_chirho.generation_chirho()
        self_chirho.queue_chirho.event_chirho(
            id_chirho, "planned", {"plan_sha256_chirho": "original"}
        )
        worker_chirho = SimpleNamespace(sha_chirho=lambda _path_chirho: "changed")
        with self_chirho.assertRaisesRegex(ValueError, "durable parent reservation"):
            runtime_chirho.verify_generated_chirho(
                worker_chirho,
                self_chirho.root_chirho,
                self_chirho.queue_chirho,
                id_chirho,
            )

    def test_restart_keeps_unknown_generation_held_and_rechecks_saved_images_chirho(
        self_chirho,
    ):
        self_chirho.seed_chirho(48)
        unknown_chirho, _unknown_rows_chirho = (
            self_chirho.queue_chirho.generation_chirho()
        )
        saved_chirho, _saved_keys_chirho = self_chirho.generated_chirho()
        self_chirho.queue_chirho.checking_chirho()
        worker_chirho = SimpleNamespace(
            QUEUE_CHIRHO=self_chirho.root_chirho,
            LAUNCHER_CHIRHO=SimpleNamespace(
                RECOVERY_CHIRHO=SimpleNamespace(
                    active_chirho=lambda _path_chirho: False
                )
            ),
        )
        with patch.object(
            runtime_chirho,
            "verify_generated_chirho",
            side_effect=ValueError("No returned image"),
        ):
            runtime_chirho.recover_chirho(worker_chirho, self_chirho.queue_chirho)
        self_chirho.assertEqual(
            self_chirho.queue_chirho.status_chirho()["jobs_chirho"],
            {"generated": 1, "held": 1},
        )
        self_chirho.assertEqual(
            self_chirho.queue_chirho.checking_chirho(), saved_chirho
        )
        next_chirho = self_chirho.queue_chirho.generation_chirho()
        self_chirho.assertNotEqual(next_chirho[0], unknown_chirho)

    def test_status_reads_do_not_manufacture_progress_timestamps_chirho(self_chirho):
        self_chirho.seed_chirho(16)
        before_chirho = self_chirho.queue_chirho.status_chirho()["at_chirho"]
        self_chirho.assertEqual(
            self_chirho.queue_chirho.status_chirho()["at_chirho"], before_chirho
        )
        self_chirho.queue_chirho.generation_chirho()
        self_chirho.assertNotEqual(
            self_chirho.queue_chirho.status_chirho()["at_chirho"], before_chirho
        )

    def test_definitive_model_refusal_releases_only_its_unsent_reservation_once_chirho(
        self_chirho,
    ):
        self_chirho.seed_chirho(16, 1)
        id_chirho, rows_chirho = self_chirho.queue_chirho.generation_chirho()
        keys_chirho = {row_chirho["key_chirho"] for row_chirho in rows_chirho}
        self_chirho.queue_chirho.settle_chirho(
            id_chirho,
            set(),
            set(),
            keys_chirho,
            "Read-only preflight reconciliation pending",
        )
        self_chirho.queue_chirho.meta_chirho("generator_failures_chirho", 2)
        with self_chirho.assertRaises(ValueError):
            self_chirho.queue_chirho.reconcile_unsent_chirho(
                id_chirho, {"confirmed_no_image_chirho": True}
            )
        proof_chirho = {
            "confirmed_no_image_chirho": True,
            "code_chirho": "model_not_found",
            "image_calls_chirho": 0,
            "log_sha256_chirho": "a" * 64,
        }
        self_chirho.queue_chirho.reconcile_unsent_chirho(id_chirho, proof_chirho)
        self_chirho.assertEqual(
            self_chirho.queue_chirho.meta_chirho("generator_failures_chirho"), 2
        )
        self_chirho.assertEqual(
            self_chirho.queue_chirho.db_chirho.execute(
                "SELECT distinct attempts_chirho FROM lemmas_chirho"
            ).fetchall()[0][0],
            1,
        )
        with self_chirho.assertRaises(ValueError):
            self_chirho.queue_chirho.reconcile_unsent_chirho(id_chirho, proof_chirho)


if __name__ == "__main__":
    unittest.main()
