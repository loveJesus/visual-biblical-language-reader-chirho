# For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life. — John 3:16 (KJV)
"""Durable concurrency/retry/recovery behavior; no image or provider requests."""

import base64
import hashlib
import json
import multiprocessing
import sys
import tempfile
import unittest
from pathlib import Path
from types import SimpleNamespace
from unittest.mock import patch

ROOT_CHIRHO = Path(__file__).resolve().parents[2]
sys.path[:0] = [
    str(ROOT_CHIRHO / "scripts-chirho/bible-chirho/icon_pipeline_chirho"),
    str(ROOT_CHIRHO / "scripts-chirho/bible-chirho"),
]
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


class OriginalReturnTestsChirho(unittest.TestCase):
    def setUp(self_chirho):
        self_chirho.temporary_chirho = tempfile.TemporaryDirectory()
        self_chirho.addCleanup(self_chirho.temporary_chirho.cleanup)
        self_chirho.home_chirho = Path(self_chirho.temporary_chirho.name)
        self_chirho.attempt_chirho = self_chirho.home_chirho / "attempt-chirho"
        self_chirho.attempt_chirho.mkdir()
        self_chirho.thread_chirho = "00000000-0000-0000-0000-000000000001"
        self_chirho.original_chirho = self_chirho.home_chirho / (
            ".codex/generated_images/"
            + self_chirho.thread_chirho
            + "/exec-00000000-0000-0000-0000-000000000002.png"
        )
        self_chirho.original_chirho.parent.mkdir(parents=True)
        self_chirho.bytes_chirho = b"exact original image bytes"
        self_chirho.original_chirho.write_bytes(self_chirho.bytes_chirho)
        self_chirho.original_chirho = self_chirho.original_chirho.resolve()
        self_chirho.sha_chirho = hashlib.sha256(self_chirho.bytes_chirho).hexdigest()
        (self_chirho.attempt_chirho / "codex-chirho.jsonl").write_text(
            json.dumps(
                {"type": "thread.started", "thread_id": self_chirho.thread_chirho}
            )
            + "\n"
        )
        self_chirho.rollout_chirho = self_chirho.home_chirho / (
            ".codex/sessions/2026/11/05/rollout-test-"
            + self_chirho.thread_chirho
            + ".jsonl"
        )
        self_chirho.rollout_chirho.parent.mkdir(parents=True)
        patch_chirho = patch.object(
            process_chirho.Path, "home", return_value=self_chirho.home_chirho
        )
        patch_chirho.start()
        self_chirho.addCleanup(patch_chirho.stop)

    def evidence_chirho(
        self_chirho,
        inline_chirho=True,
        hint_chirho=True,
        result_id_chirho="call-chirho",
        extra_chirho=False,
    ):
        output_chirho = []
        if hint_chirho:
            output_chirho.append(
                {
                    "type": "input_text",
                    "text": json.dumps(
                        {
                            "output_hint_chirho": f"Generated images are saved as {self_chirho.original_chirho} by default."
                        }
                    ),
                }
            )
        if inline_chirho:
            output_chirho.append(
                {
                    "type": "input_image",
                    "image_url": "data:image/png;base64,"
                    + base64.b64encode(self_chirho.bytes_chirho).decode(),
                }
            )
        rows_chirho = [
            {
                "type": "response_item",
                "payload": {
                    "type": "function_call",
                    "name": "exec",
                    "call_id": "call-chirho",
                    "arguments": "await tools.image_gen__imagegen({})",
                },
            },
            {
                "type": "response_item",
                "payload": {
                    "type": "function_call_output",
                    "call_id": result_id_chirho,
                    "output": output_chirho,
                },
            },
        ]
        if extra_chirho:
            rows_chirho.append(
                {
                    "type": "response_item",
                    "payload": {
                        "type": "custom_tool_call",
                        "name": "exec",
                        "call_id": "other-call-chirho",
                        "input": "await tools.image_gen__imagegen({})",
                    },
                }
            )
        self_chirho.rollout_chirho.write_text(
            "\n".join(json.dumps(row_chirho) for row_chirho in rows_chirho)
        )

    def verify_chirho(self_chirho, sha_chirho=None):
        return process_chirho.returned_original_chirho(
            self_chirho.attempt_chirho,
            self_chirho.original_chirho,
            sha_chirho or self_chirho.sha_chirho,
        )

    def test_exact_returned_image_or_original_path_is_bound_chirho(self_chirho):
        for inline_chirho, hint_chirho, binding_chirho in [
            (True, True, "returned_png"),
            (True, False, "returned_png"),
            (False, True, "returned_path"),
        ]:
            with self_chirho.subTest(
                inline_chirho=inline_chirho, hint_chirho=hint_chirho
            ):
                self_chirho.evidence_chirho(inline_chirho, hint_chirho)
                self_chirho.assertEqual(
                    self_chirho.verify_chirho()["binding_chirho"], binding_chirho
                )

    def test_changed_original_and_changed_metadata_do_not_borrow_returned_png_chirho(
        self_chirho,
    ):
        self_chirho.evidence_chirho()
        self_chirho.original_chirho.write_bytes(b"different image")
        for sha_chirho in [
            self_chirho.sha_chirho,
            hashlib.sha256(b"different image").hexdigest(),
        ]:
            with (
                self_chirho.subTest(sha_chirho=sha_chirho),
                self_chirho.assertRaises(ValueError),
            ):
                self_chirho.verify_chirho(sha_chirho)

    def test_missing_wrong_call_and_multiple_calls_remain_held_chirho(self_chirho):
        for options_chirho in [
            {"inline_chirho": False, "hint_chirho": False},
            {"result_id_chirho": "unrelated-chirho"},
            {"extra_chirho": True},
        ]:
            with self_chirho.subTest(options_chirho=options_chirho):
                self_chirho.evidence_chirho(**options_chirho)
                with self_chirho.assertRaises(ValueError):
                    self_chirho.verify_chirho()

    def test_symlink_escape_refuses_even_with_matching_saved_bytes_chirho(self_chirho):
        self_chirho.evidence_chirho()
        outside_chirho = self_chirho.home_chirho / "outside-chirho.png"
        outside_chirho.write_bytes(self_chirho.bytes_chirho)
        self_chirho.original_chirho.unlink()
        self_chirho.original_chirho.symlink_to(outside_chirho)
        with self_chirho.assertRaises(ValueError):
            self_chirho.verify_chirho()

    def test_runtime_uses_return_binding_for_external_original_chirho(self_chirho):
        self_chirho.evidence_chirho()
        plan_chirho = self_chirho.attempt_chirho / "plan-chirho.json"
        plan_chirho.write_text("{}")
        atlas_chirho = self_chirho.attempt_chirho / "keyed-sheet-chirho.webp"
        atlas_chirho.write_bytes(b"validated atlas bytes")
        metadata_chirho = {
            "original_generator_path_chirho": str(self_chirho.original_chirho),
            "original_generator_sha256_chirho": self_chirho.sha_chirho,
            "sheet_sha256_chirho": hashlib.sha256(
                atlas_chirho.read_bytes()
            ).hexdigest(),
        }
        (self_chirho.attempt_chirho / "generation-chirho.json").write_text(
            json.dumps(metadata_chirho)
        )
        queue_chirho = QueueChirho(self_chirho.home_chirho / "queue-chirho.sqlite")
        self_chirho.addCleanup(queue_chirho.db_chirho.close)
        queue_chirho.event_chirho(
            "job-chirho",
            "planned",
            {
                "plan_sha256_chirho": hashlib.sha256(
                    plan_chirho.read_bytes()
                ).hexdigest()
            },
        )
        worker_chirho = SimpleNamespace(
            sha_chirho=lambda path_chirho: hashlib.sha256(
                path_chirho.read_bytes()
            ).hexdigest(),
            read_chirho=lambda path_chirho: json.loads(path_chirho.read_text()),
            validate_generation_chirho=lambda *_arguments_chirho: None,
        )
        runtime_chirho.verify_generated_chirho(
            worker_chirho, self_chirho.attempt_chirho, queue_chirho, "job-chirho"
        )
        self_chirho.evidence_chirho(result_id_chirho="unrelated-chirho")
        with self_chirho.assertRaises(ValueError):
            runtime_chirho.verify_generated_chirho(
                worker_chirho, self_chirho.attempt_chirho, queue_chirho, "job-chirho"
            )


if __name__ == "__main__":
    unittest.main()
