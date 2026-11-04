# For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life. — John 3:16 (KJV)
"""Real coordinator behavior with controlled generators; no image/provider requests."""

import json
import sys
import tempfile
import threading
import unittest
from contextlib import ExitStack
from pathlib import Path
from unittest.mock import patch

ROOT_CHIRHO = Path(__file__).resolve().parents[2]
sys.path.insert(0, str(ROOT_CHIRHO / "scripts-chirho/bible-chirho"))
import icon_worker_chirho as worker_chirho


class ParallelProducerTestsChirho(unittest.TestCase):
    def setUp(self_chirho):
        self_chirho.temporary_chirho = tempfile.TemporaryDirectory()
        self_chirho.root_chirho = Path(self_chirho.temporary_chirho.name)
        self_chirho.queue_chirho = self_chirho.root_chirho / "queue-chirho"
        self_chirho.queue_chirho.mkdir()
        self_chirho.catalogue_chirho = (
            self_chirho.root_chirho
            / "data-chirho/media-chirho/bible-worker-icons-chirho.json"
        )
        self_chirho.catalogue_chirho.parent.mkdir(parents=True)
        self_chirho.catalogue_chirho.write_text('{"icons_chirho": []}')
        self_chirho.rows_chirho = [
            {
                "lemma_id_chirho": f"H{number_chirho}",
                "lemma_augment_chirho": None,
                "status_chirho": "prepared",
            }
            for number_chirho in range(1, 97)
        ]
        self_chirho.jobs_chirho = []
        self_chirho.installed_chirho = []
        self_chirho.started_before_first_install_chirho = None
        self_chirho.finish_threads_chirho = set()
        self_chirho.fail_jobs_chirho = set()
        self_chirho.stop_after_two_chirho = False
        self_chirho.storage_failure_chirho = False
        self_chirho.expected_initial_chirho = 2
        self_chirho.stack_chirho = ExitStack()
        self_chirho.stack_chirho.enter_context(
            patch.object(worker_chirho, "ROOT_CHIRHO", self_chirho.root_chirho)
        )
        self_chirho.stack_chirho.enter_context(
            patch.object(worker_chirho, "QUEUE_CHIRHO", self_chirho.queue_chirho)
        )
        self_chirho.stack_chirho.enter_context(
            patch.object(
                worker_chirho, "candidates_chirho", return_value=self_chirho.rows_chirho
            )
        )
        self_chirho.stack_chirho.enter_context(
            patch.object(
                worker_chirho,
                "source_chirho",
                side_effect=lambda row_chirho: dict(row_chirho),
            )
        )
        self_chirho.stack_chirho.enter_context(
            patch.object(worker_chirho, "command_chirho")
        )
        self_chirho.stack_chirho.enter_context(
            patch.object(worker_chirho, "validate_generation_chirho")
        )
        self_chirho.stack_chirho.enter_context(
            patch.object(
                worker_chirho, "finish_chirho", side_effect=self_chirho.finish_chirho
            )
        )
        self_chirho.stack_chirho.enter_context(
            patch.object(
                worker_chirho,
                "GeneratorJobChirho",
                side_effect=self_chirho.start_chirho,
            )
        )
        self_chirho.stack_chirho.enter_context(
            patch.object(
                worker_chirho.LAUNCHER_CHIRHO.RECOVERY_CHIRHO,
                "active_chirho",
                return_value=False,
            )
        )
        self_chirho.stack_chirho.enter_context(
            patch.object(worker_chirho.time, "sleep")
        )
        worker_chirho.STOP_CHIRHO = False

    def tearDown(self_chirho):
        self_chirho.stack_chirho.close()
        worker_chirho.STOP_CHIRHO = False
        self_chirho.temporary_chirho.cleanup()

    def read_state_chirho(self_chirho):
        return json.loads(
            (self_chirho.queue_chirho / "worker-state-chirho.json").read_text()
        )

    def start_chirho(
        self_chirho, root_chirho, attempt_chirho, prompt_chirho, recovery_chirho
    ):
        state_chirho = self_chirho.read_state_chirho()
        relative_chirho = str(attempt_chirho.relative_to(self_chirho.queue_chirho))
        self_chirho.assertIn(relative_chirho, state_chirho["active_attempts_chirho"])
        self_chirho.assertLessEqual(len(state_chirho["active_attempts_chirho"]), 2)
        keys_chirho = {
            worker_chirho.key_chirho(row_chirho)
            for row_chirho in json.loads(
                (attempt_chirho / "plan-chirho.json").read_text()
            )["cells_chirho"]
            if not row_chirho.get("padding_chirho")
        }
        for earlier_chirho in self_chirho.jobs_chirho:
            self_chirho.assertFalse(keys_chirho & earlier_chirho.keys_chirho)
        owner_chirho = self_chirho

        class FakeJobChirho:
            def __init__(self_chirho):
                self_chirho.attempt_chirho = attempt_chirho
                self_chirho.keys_chirho = keys_chirho
                self_chirho.number_chirho = len(owner_chirho.jobs_chirho) + 1
                self_chirho.error_chirho = (
                    RuntimeError("unknown original result")
                    if self_chirho.number_chirho in owner_chirho.fail_jobs_chirho
                    else None
                )
                self_chirho.waited_chirho = False

            def poll_chirho(self_chirho):
                return (
                    len(owner_chirho.jobs_chirho)
                    >= owner_chirho.expected_initial_chirho
                )

            def wait_chirho(self_chirho):
                self_chirho.waited_chirho = True

        job_chirho = FakeJobChirho()
        self_chirho.jobs_chirho.append(job_chirho)
        if self_chirho.stop_after_two_chirho and len(self_chirho.jobs_chirho) == 2:
            worker_chirho.STOP_CHIRHO = True
        return job_chirho

    def finish_chirho(self_chirho, attempt_chirho):
        if self_chirho.started_before_first_install_chirho is None:
            self_chirho.started_before_first_install_chirho = len(
                self_chirho.jobs_chirho
            )
        self_chirho.finish_threads_chirho.add(threading.get_ident())
        if self_chirho.storage_failure_chirho:
            raise OSError("storage floor")
        rows_chirho = [
            row_chirho
            for row_chirho in json.loads(
                (attempt_chirho / "plan-chirho.json").read_text()
            )["cells_chirho"]
            if not row_chirho.get("padding_chirho")
        ]
        self_chirho.installed_chirho.extend(rows_chirho)
        (attempt_chirho / "installed-chirho.json").write_text(
            json.dumps({"holds_chirho": [], "records_chirho": rows_chirho})
        )
        (attempt_chirho / "archived-chirho.json").write_text(
            '{"state_chirho":"archived"}'
        )
        self_chirho.catalogue_chirho.write_text(
            json.dumps({"icons_chirho": self_chirho.installed_chirho})
        )
        return {"installed_chirho": len(rows_chirho), "held_chirho": 0}

    def test_two_generators_reserve_disjoint_keys_before_serial_install_chirho(
        self_chirho,
    ):
        self_chirho.assertEqual(worker_chirho.run_chirho(4, 2), 0)
        self_chirho.assertEqual(len(self_chirho.jobs_chirho), 4)
        self_chirho.assertEqual(self_chirho.started_before_first_install_chirho, 2)
        self_chirho.assertEqual(len(self_chirho.installed_chirho), 64)
        self_chirho.assertEqual(
            self_chirho.finish_threads_chirho, {threading.get_ident()}
        )
        self_chirho.assertEqual(
            self_chirho.read_state_chirho()["active_attempts_chirho"], []
        )

    def test_stop_drains_both_without_new_dispatch_chirho(self_chirho):
        self_chirho.stop_after_two_chirho = True
        self_chirho.assertEqual(worker_chirho.run_chirho(6, 2), 0)
        self_chirho.assertEqual(len(self_chirho.jobs_chirho), 2)
        self_chirho.assertEqual(len(self_chirho.installed_chirho), 32)
        self_chirho.assertEqual(
            self_chirho.read_state_chirho()["active_attempts_chirho"], []
        )
        self_chirho.assertEqual(
            json.loads((self_chirho.queue_chirho / "progress-chirho.json").read_text())[
                "state_chirho"
            ],
            "drained",
        )

    def test_shared_installer_failure_drains_children_and_preserves_both_plans_chirho(
        self_chirho,
    ):
        self_chirho.storage_failure_chirho = True
        self_chirho.assertEqual(worker_chirho.run_chirho(6, 2), 2)
        self_chirho.assertEqual(len(self_chirho.jobs_chirho), 2)
        self_chirho.assertTrue(
            all(job_chirho.waited_chirho for job_chirho in self_chirho.jobs_chirho)
        )
        self_chirho.assertEqual(
            len(self_chirho.read_state_chirho()["active_attempts_chirho"]), 2
        )
        self_chirho.assertEqual(
            json.loads((self_chirho.queue_chirho / "progress-chirho.json").read_text())[
                "state_chirho"
            ],
            "shared_source_or_storage_hold",
        )

    def test_recovery_never_reposts_unknown_plans_and_continues_other_keys_chirho(
        self_chirho,
    ):
        self_chirho.storage_failure_chirho = True
        self_chirho.assertEqual(worker_chirho.run_chirho(2, 2), 2)
        unknown_keys_chirho = set().union(
            *(job_chirho.keys_chirho for job_chirho in self_chirho.jobs_chirho)
        )
        self_chirho.storage_failure_chirho = False
        self_chirho.expected_initial_chirho = 1
        before_chirho = len(self_chirho.jobs_chirho)
        self_chirho.assertEqual(worker_chirho.run_chirho(1, 2), 0)
        self_chirho.assertEqual(len(self_chirho.jobs_chirho), before_chirho + 1)
        self_chirho.assertFalse(
            unknown_keys_chirho & self_chirho.jobs_chirho[-1].keys_chirho
        )
        self_chirho.assertTrue(
            unknown_keys_chirho
            <= set(self_chirho.read_state_chirho()["held_keys_chirho"])
        )

    def test_failure_cap_survives_success_of_already_inflight_sibling_chirho(
        self_chirho,
    ):
        self_chirho.fail_jobs_chirho = {1, 2, 3}
        self_chirho.assertEqual(worker_chirho.run_chirho(6, 2), 2)
        self_chirho.assertEqual(len(self_chirho.jobs_chirho), 4)
        self_chirho.assertEqual(
            self_chirho.read_state_chirho()["consecutive_generator_failures_chirho"], 3
        )
        self_chirho.assertEqual(len(self_chirho.installed_chirho), 16)
        self_chirho.assertEqual(worker_chirho.run_chirho(6, 2), 2)
        self_chirho.assertEqual(len(self_chirho.jobs_chirho), 4)

    def test_sheet_limit_caps_requests_even_when_results_are_unknown_chirho(
        self_chirho,
    ):
        self_chirho.fail_jobs_chirho = {1, 2}
        self_chirho.assertEqual(worker_chirho.run_chirho(2, 2), 0)
        self_chirho.assertEqual(len(self_chirho.jobs_chirho), 2)
        self_chirho.assertEqual(
            len(self_chirho.read_state_chirho()["held_keys_chirho"]), 32
        )

    def test_live_previous_child_blocks_new_dispatch_chirho(self_chirho):
        self_chirho.storage_failure_chirho = True
        self_chirho.assertEqual(worker_chirho.run_chirho(2, 2), 2)
        before_chirho = len(self_chirho.jobs_chirho)
        with patch.object(
            worker_chirho.LAUNCHER_CHIRHO.RECOVERY_CHIRHO,
            "active_chirho",
            return_value=True,
        ):
            self_chirho.assertEqual(worker_chirho.run_chirho(2, 2), 2)
        self_chirho.assertEqual(len(self_chirho.jobs_chirho), before_chirho)
        self_chirho.assertEqual(
            len(self_chirho.read_state_chirho()["active_attempts_chirho"]), 2
        )


if __name__ == "__main__":
    unittest.main()
