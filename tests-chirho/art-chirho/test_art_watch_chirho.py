# For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life. — John 3:16 (KJV)
"""Prove leases, delivered-alert deduplication and bounded failure recovery without live messages."""

import json as json_chirho
import os as os_chirho
import sys as sys_chirho
import tempfile as tempfile_chirho
import unittest as unittest_chirho
from pathlib import Path
from unittest.mock import patch as patch_chirho

sys_chirho.path.insert(0, str(Path(__file__).resolve().parents[2] / "scripts-chirho/art-chirho"))
import watch_art_progress_chirho as watch_chirho


class ArtWatchTestChirho(unittest_chirho.TestCase):
    def setUp(self_chirho):
        self_chirho.temp_chirho = tempfile_chirho.TemporaryDirectory()
        self_chirho.root_chirho = Path(self_chirho.temp_chirho.name)
        self_chirho.now_chirho = 10000
        self_chirho.path_chirho = (
            self_chirho.root_chirho
            / watch_chirho.QUEUE_CHIRHO
            / watch_chirho.TARGETS_CHIRHO["icons-chirho"][0]
        )
        self_chirho.path_chirho.parent.mkdir(parents=True)
        for relative_chirho, _lease_chirho in watch_chirho.TARGETS_CHIRHO.values():
            path_chirho = self_chirho.root_chirho / watch_chirho.QUEUE_CHIRHO / relative_chirho
            path_chirho.parent.mkdir(parents=True, exist_ok=True)
            path_chirho.write_text(json_chirho.dumps({"state_chirho": "waiting_for_proverbs"}))

    def tearDown(self_chirho):
        self_chirho.temp_chirho.cleanup()

    def progress_chirho(self_chirho, state_chirho, age_chirho=0, **extra_chirho):
        self_chirho.path_chirho.write_text(
            json_chirho.dumps({"state_chirho": state_chirho, **extra_chirho})
        )
        os_chirho.utime(
            self_chirho.path_chirho,
            (self_chirho.now_chirho - age_chirho, self_chirho.now_chirho - age_chirho),
        )

    def test_lease_requires_real_progress_not_repeated_observation_chirho(self_chirho):
        self_chirho.progress_chirho("generating", age_chirho=1400, attempt_chirho="first-chirho")
        self_chirho.assertEqual(
            watch_chirho.incidents_chirho(self_chirho.root_chirho, self_chirho.now_chirho), []
        )
        incident_chirho = watch_chirho.incidents_chirho(
            self_chirho.root_chirho, self_chirho.now_chirho + 101
        )
        self_chirho.assertEqual(incident_chirho[0]["reason_chirho"], "stalled")
        self_chirho.progress_chirho("generating", attempt_chirho="second-chirho")
        self_chirho.assertEqual(
            watch_chirho.incidents_chirho(self_chirho.root_chirho, self_chirho.now_chirho), []
        )

    def test_terminal_hold_is_delivered_once_across_restart_chirho(self_chirho):
        self_chirho.progress_chirho("needs_reconciliation", attempt_chirho="first-chirho")
        calls_chirho = []

        def deliver_chirho(incident_chirho):
            calls_chirho.append(incident_chirho)
            return 42

        state_chirho = {}
        watch_chirho.pass_chirho(
            self_chirho.root_chirho, self_chirho.now_chirho, state_chirho, deliver_chirho
        )
        path_chirho = self_chirho.path_chirho.parent / "watch-state-chirho.json"
        watch_chirho.save_chirho(path_chirho, state_chirho)
        state_chirho = json_chirho.loads(path_chirho.read_text())
        watch_chirho.pass_chirho(
            self_chirho.root_chirho, self_chirho.now_chirho + 1000, state_chirho, deliver_chirho
        )
        self_chirho.assertEqual(len(calls_chirho), 1)
        self_chirho.progress_chirho("needs_reconciliation", attempt_chirho="second-chirho")
        watch_chirho.pass_chirho(
            self_chirho.root_chirho, self_chirho.now_chirho + 1001, state_chirho, deliver_chirho
        )
        self_chirho.assertEqual(len(calls_chirho), 2)
        self_chirho.assertEqual(len(state_chirho), 1)

    def test_failed_delivery_retries_with_backoff_chirho(self_chirho):
        self_chirho.progress_chirho("stopped_layout")
        calls_chirho = []

        def deliver_chirho(_incident_chirho):
            calls_chirho.append(1)
            raise OSError("broker unavailable")

        state_chirho = {}
        for delay_chirho in (0, 30, 299, 300):
            watch_chirho.pass_chirho(
                self_chirho.root_chirho,
                self_chirho.now_chirho + delay_chirho,
                state_chirho,
                deliver_chirho,
            )
        self_chirho.assertEqual(len(calls_chirho), 2)
        self_chirho.assertNotIn("delivered_event_chirho", state_chirho["icons-chirho"])

    def test_waiting_and_complete_are_not_false_stalls_chirho(self_chirho):
        for state_chirho in (
            "waiting_for_proverbs",
            "waiting_for_proverbs_icons",
            "proverbs_first_pass_with_deferrals",
            "proverbs_first_pass_complete",
            "complete",
        ):
            self_chirho.progress_chirho(state_chirho, age_chirho=9000)
            self_chirho.assertEqual(
                watch_chirho.incidents_chirho(self_chirho.root_chirho, self_chirho.now_chirho), []
            )

    def test_raw_errors_do_not_enter_notifications_chirho(self_chirho):
        self_chirho.progress_chirho("stopped_private_example", error_chirho="secret-private-prompt")
        incident_chirho = watch_chirho.incidents_chirho(
            self_chirho.root_chirho, self_chirho.now_chirho
        )[0]
        self_chirho.assertNotIn("secret-private-prompt", json_chirho.dumps(incident_chirho))
        self_chirho.assertEqual(incident_chirho["state_chirho"], "stopped")
        result_chirho = type(
            "ResultChirho",
            (),
            {
                "stdout": json_chirho.dumps(
                    {"ok_chirho": True, "delivery_count_chirho": 1, "message_id_chirho": 42}
                )
            },
        )()
        with patch_chirho.object(
            watch_chirho.subprocess, "run", return_value=result_chirho
        ) as run_chirho:
            self_chirho.assertEqual(
                watch_chirho.notify_chirho(
                    self_chirho.root_chirho, "SESSION_CHIRHO", incident_chirho
                ),
                42,
            )
        body_chirho = run_chirho.call_args.args[0][-1]
        self_chirho.assertNotIn("secret-private-prompt", body_chirho)
        self_chirho.assertIn("SESSION_CHIRHO/gpt_chirho", run_chirho.call_args.args[0])

    def test_zero_recipients_is_not_a_delivery_receipt_chirho(self_chirho):
        self_chirho.progress_chirho("stopped_layout")
        incident_chirho = watch_chirho.incidents_chirho(
            self_chirho.root_chirho, self_chirho.now_chirho
        )[0]
        result_chirho = type(
            "ResultChirho",
            (),
            {
                "stdout": json_chirho.dumps(
                    {"ok_chirho": True, "delivery_count_chirho": 0, "message_id_chirho": 42}
                )
            },
        )()
        with (
            patch_chirho.object(watch_chirho.subprocess, "run", return_value=result_chirho),
            self_chirho.assertRaisesRegex(RuntimeError, "has not delivered"),
        ):
            watch_chirho.notify_chirho(self_chirho.root_chirho, "SESSION_CHIRHO", incident_chirho)

    def test_missing_record_alerts_and_state_retires_old_targets_chirho(self_chirho):
        self_chirho.path_chirho.unlink()
        state_chirho = {"retired-worker-chirho": {"delivered_event_chirho": "old"}}
        incidents_chirho = watch_chirho.pass_chirho(
            self_chirho.root_chirho,
            self_chirho.now_chirho,
            state_chirho,
            lambda _incident_chirho: 42,
        )
        self_chirho.assertEqual(len(incidents_chirho), 1)
        self_chirho.assertEqual(incidents_chirho[0]["state_chirho"], "unreadable")
        self_chirho.assertEqual(set(state_chirho), {"icons-chirho"})

    def test_ignored_owner_alert_escalates_once_then_retires_on_progress_chirho(self_chirho):
        self_chirho.progress_chirho("stopped_layout")
        delivered_chirho = []

        def deliver_chirho(incident_chirho):
            delivered_chirho.append(incident_chirho.get("recipient_chirho", "owner-chirho"))
            return len(delivered_chirho)

        state_chirho = {}
        for delay_chirho in (0, 30, 1800, 3600):
            watch_chirho.pass_chirho(
                self_chirho.root_chirho,
                self_chirho.now_chirho + delay_chirho,
                state_chirho,
                deliver_chirho,
            )
        self_chirho.assertEqual(delivered_chirho, ["owner-chirho", "AICEO/gpt_chirho"])
        self_chirho.progress_chirho("complete")
        watch_chirho.pass_chirho(
            self_chirho.root_chirho, self_chirho.now_chirho + 3601, state_chirho, deliver_chirho
        )
        self_chirho.assertEqual(state_chirho, {})


if __name__ == "__main__":
    unittest_chirho.main()
