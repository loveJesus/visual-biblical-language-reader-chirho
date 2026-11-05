# For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life. — John 3:16 (KJV)
"""Per-child ownership and evidence checks without provider requests."""

import json
import signal
import sys
import tempfile
import unittest
from pathlib import Path
from types import SimpleNamespace
from unittest.mock import Mock, patch

sys.path.insert(
    0, str(Path(__file__).resolve().parents[2] / "scripts-chirho/bible-chirho")
)
import icon_generation_chirho as generation_chirho


class GeneratorLifecycleTestsChirho(unittest.TestCase):
    def setUp(self_chirho):
        self_chirho.temporary_chirho = tempfile.TemporaryDirectory()
        self_chirho.addCleanup(self_chirho.temporary_chirho.cleanup)
        self_chirho.root_chirho = Path(self_chirho.temporary_chirho.name)
        self_chirho.recovery_chirho = SimpleNamespace(request_chirho=Mock())

    def attempt_chirho(self_chirho, name_chirho):
        path_chirho = self_chirho.root_chirho / name_chirho
        path_chirho.mkdir()
        return path_chirho

    def test_independent_handles_and_journal_before_spawn_chirho(self_chirho):
        children_chirho = [Mock(pid=101), Mock(pid=202)]
        children_chirho[0].poll.return_value = 0
        children_chirho[1].poll.return_value = None

        def spawn_chirho(*args_chirho, **kwargs_chirho):
            self_chirho.assertEqual(
                len(self_chirho.recovery_chirho.request_chirho.call_args.args), 1
            )
            self_chirho.assertTrue(kwargs_chirho["start_new_session"])
            return children_chirho.pop(0)

        with patch.object(
            generation_chirho.subprocess, "Popen", side_effect=spawn_chirho
        ):
            first_chirho = generation_chirho.GeneratorJobChirho(
                self_chirho.root_chirho,
                self_chirho.attempt_chirho("first-chirho"),
                "first",
                self_chirho.recovery_chirho,
            )
            second_chirho = generation_chirho.GeneratorJobChirho(
                self_chirho.root_chirho,
                self_chirho.attempt_chirho("second-chirho"),
                "second",
                self_chirho.recovery_chirho,
            )
        self_chirho.assertTrue(first_chirho.poll_chirho())
        self_chirho.assertFalse(second_chirho.poll_chirho())
        self_chirho.assertTrue(first_chirho.log_chirho.closed)
        self_chirho.assertFalse(second_chirho.log_chirho.closed)
        second_chirho.child_chirho.poll.return_value = 0
        second_chirho.wait_chirho()
        self_chirho.assertTrue(second_chirho.log_chirho.closed)

    def test_initial_journal_failure_never_spawns_chirho(self_chirho):
        self_chirho.recovery_chirho.request_chirho.side_effect = OSError(
            "disk unavailable"
        )
        with (
            patch.object(generation_chirho.subprocess, "Popen") as spawn_chirho,
            self_chirho.assertRaises(OSError),
        ):
            generation_chirho.GeneratorJobChirho(
                self_chirho.root_chirho,
                self_chirho.attempt_chirho("failed-chirho"),
                "prompt",
                self_chirho.recovery_chirho,
            )
        spawn_chirho.assert_not_called()

    def test_explicit_pipeline_model_does_not_change_legacy_default_or_fallback_chirho(
        self_chirho,
    ):
        child_chirho = Mock(pid=505)
        child_chirho.poll.return_value = 0
        with patch.object(
            generation_chirho.subprocess, "Popen", return_value=child_chirho
        ) as spawn_chirho:
            legacy_chirho = generation_chirho.GeneratorJobChirho(
                self_chirho.root_chirho,
                self_chirho.attempt_chirho("legacy-chirho"),
                "prompt",
                self_chirho.recovery_chirho,
            )
            self_chirho.assertEqual(spawn_chirho.call_args.args[0][3], "gpt-6.1-terra")
            legacy_chirho.wait_chirho()
            configured_chirho = generation_chirho.GeneratorJobChirho(
                self_chirho.root_chirho,
                self_chirho.attempt_chirho("configured-chirho"),
                "prompt",
                self_chirho.recovery_chirho,
                model_chirho="gpt-6.1-sol",
            )
            self_chirho.assertEqual(spawn_chirho.call_args.args[0][3], "gpt-6.1-sol")
            configured_chirho.wait_chirho()
            self_chirho.assertEqual(spawn_chirho.call_count, 2)

    def test_pid_journal_failure_drains_owned_child_chirho(self_chirho):
        child_chirho = Mock(pid=303)
        self_chirho.recovery_chirho.request_chirho.side_effect = [
            None,
            OSError("pid journal full"),
        ]
        with (
            patch.object(
                generation_chirho.subprocess, "Popen", return_value=child_chirho
            ),
            patch.object(generation_chirho.os, "killpg") as kill_chirho,
            self_chirho.assertRaises(OSError),
        ):
            generation_chirho.GeneratorJobChirho(
                self_chirho.root_chirho,
                self_chirho.attempt_chirho("pid-failed-chirho"),
                "prompt",
                self_chirho.recovery_chirho,
            )
        child_chirho.wait.assert_called_once_with(timeout=1200)
        kill_chirho.assert_not_called()

    def test_timeout_kills_only_owned_group_and_retains_unknown_result_chirho(
        self_chirho,
    ):
        child_chirho = Mock(pid=404)
        child_chirho.poll.return_value = None
        with patch.object(
            generation_chirho.subprocess, "Popen", return_value=child_chirho
        ):
            job_chirho = generation_chirho.GeneratorJobChirho(
                self_chirho.root_chirho,
                self_chirho.attempt_chirho("timeout-chirho"),
                "prompt",
                self_chirho.recovery_chirho,
            )
        with (
            patch.object(
                generation_chirho.time,
                "monotonic",
                return_value=job_chirho.started_chirho + 1201,
            ),
            patch.object(generation_chirho.os, "killpg") as kill_chirho,
        ):
            self_chirho.assertTrue(job_chirho.poll_chirho())
        kill_chirho.assert_called_once_with(404, signal.SIGKILL)
        self_chirho.assertIn("reconcile", str(job_chirho.error_chirho))
        self_chirho.recovery_chirho.request_chirho.assert_called_with(
            job_chirho.attempt_chirho, 404, True
        )

    def test_original_call_evidence_required_except_source_hold_chirho(self_chirho):
        attempt_chirho = self_chirho.attempt_chirho("evidence-chirho")
        generation_chirho.validate_generation_chirho(
            attempt_chirho, lambda path_chirho: True
        )
        thread_chirho = "12345678-1234-1234-1234-123456789abc"
        (attempt_chirho / "codex-chirho.jsonl").write_text(
            json.dumps({"type": "thread.started", "thread_id": thread_chirho})
        )
        home_chirho = self_chirho.root_chirho / "home-chirho"
        sessions_chirho = home_chirho / ".codex/sessions/2026/11/04"
        sessions_chirho.mkdir(parents=True)
        rollout_chirho = sessions_chirho / f"rollout-test-{thread_chirho}.jsonl"
        rollout_chirho.write_text("no image call")
        with patch.object(generation_chirho.Path, "home", return_value=home_chirho):
            with self_chirho.assertRaisesRegex(ValueError, "Original built-in"):
                generation_chirho.validate_generation_chirho(
                    attempt_chirho, lambda path_chirho: False
                )
            rollout_chirho.write_text("tools.image_gen__imagegen({})")
            generation_chirho.validate_generation_chirho(
                attempt_chirho, lambda path_chirho: False
            )


if __name__ == "__main__":
    unittest.main()
