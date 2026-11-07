# For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life. — John 3:16 (KJV)
"""Money and unknown-result behavior of the bounded book-opening producer."""

import importlib.util as importlib_chirho
import json as json_chirho
import tempfile as tempfile_chirho
import unittest as unittest_chirho
from pathlib import Path as PathChirho
from unittest.mock import patch as patch_chirho

ROOT_CHIRHO = PathChirho(__file__).resolve().parents[3]
PATH_CHIRHO = (
    ROOT_CHIRHO / "scripts-chirho/art-chirho/book-openers-chirho/run_chirho.py"
)
SPEC_CHIRHO = importlib_chirho.spec_from_file_location(
    "opening_run_chirho", PATH_CHIRHO
)
RUN_CHIRHO = importlib_chirho.module_from_spec(SPEC_CHIRHO)
SPEC_CHIRHO.loader.exec_module(RUN_CHIRHO)


class OpeningRunTestsChirho(unittest_chirho.TestCase):
    def setUp(self_chirho):
        self_chirho.temp_chirho = tempfile_chirho.TemporaryDirectory()
        self_chirho.addCleanup(self_chirho.temp_chirho.cleanup)
        self_chirho.home_chirho = PathChirho(self_chirho.temp_chirho.name)
        self_chirho.plan_chirho = {
            "model_chirho": RUN_CHIRHO.plan_module_chirho.MODEL_CHIRHO,
            "maximum_usd_chirho": 35,
            "reservation_usd_chirho": 1,
            "maximum_requests_per_verse_chirho": 1,
            "maximum_concurrency_chirho": 3,
            "width_chirho": 1536,
            "height_chirho": 1152,
            "quality_chirho": "medium",
            "thinking_level_chirho": "high",
        }
        self_chirho.job_chirho = {
            "id_chirho": "Exod.1.1",
            "prompt_chirho": "A historical watercolor scene",
            "prompt_sha256_chirho": RUN_CHIRHO.bytes_sha_chirho(
                b"A historical watercolor scene"
            ),
        }

    def test_scope_model_and_rendering_cannot_drift_chirho(self_chirho):
        for field_chirho, value_chirho in [
            ("model_chirho", "runware:100@1"),
            ("maximum_usd_chirho", 36),
            ("quality_chirho", "high"),
            ("maximum_concurrency_chirho", 8),
            ("maximum_requests_per_verse_chirho", 2),
        ]:
            with (
                self_chirho.subTest(field_chirho=field_chirho),
                self_chirho.assertRaises(ValueError),
            ):
                RUN_CHIRHO.task_chirho(
                    self_chirho.plan_chirho | {field_chirho: value_chirho},
                    self_chirho.job_chirho,
                    "task",
                )
        with self_chirho.assertRaises(ValueError):
            RUN_CHIRHO.task_chirho(
                self_chirho.plan_chirho,
                self_chirho.job_chirho | {"id_chirho": "Exod.2.1"},
                "task",
            )

    def test_unknown_reservations_consume_the_allowance_chirho(self_chirho):
        for index_chirho in range(35):
            RUN_CHIRHO.reserve_chirho(
                self_chirho.home_chirho,
                self_chirho.plan_chirho,
                "pin",
                self_chirho.job_chirho | {"id_chirho": f"Book{index_chirho}.1.1"},
            )
        with self_chirho.assertRaises(ValueError):
            RUN_CHIRHO.reserve_chirho(
                self_chirho.home_chirho,
                self_chirho.plan_chirho,
                "pin",
                self_chirho.job_chirho | {"id_chirho": "Last.1.2"},
            )
        self_chirho.assertEqual(
            35,
            sum(
                row_chirho["accounted_usd_chirho"]
                for row_chirho in RUN_CHIRHO.load_ledger_chirho(
                    self_chirho.home_chirho, "pin"
                )
            ),
        )

    def test_received_cost_releases_only_unused_reservation_chirho(self_chirho):
        RUN_CHIRHO.reserve_chirho(
            self_chirho.home_chirho,
            self_chirho.plan_chirho,
            "pin",
            self_chirho.job_chirho,
        )
        path_chirho = (
            self_chirho.home_chirho
            / "attempts-chirho/exod-1-1-chirho/result-chirho.json"
        )
        path_chirho.write_text(json_chirho.dumps({"cost_usd_chirho": 0.173}))
        self_chirho.assertEqual(
            0.173,
            RUN_CHIRHO.load_ledger_chirho(self_chirho.home_chirho, "pin")[0][
                "accounted_usd_chirho"
            ],
        )
        with self_chirho.assertRaises(ValueError):
            RUN_CHIRHO.load_ledger_chirho(self_chirho.home_chirho, "another-plan")

    def test_lost_request_is_reconciled_and_never_resent_chirho(self_chirho):
        calls_chirho = []

        def post_chirho(_key_chirho, tasks_chirho):
            calls_chirho.append(tasks_chirho[0]["taskType"])
            return {
                "http_status_chirho": 200,
                "body_chirho": {"errors": [{"code": "taskNotFound"}]},
            }

        with (
            patch_chirho.object(RUN_CHIRHO, "source_chirho"),
            patch_chirho.object(RUN_CHIRHO, "post_chirho", side_effect=post_chirho),
        ):
            for _index_chirho in range(2):
                value_chirho = RUN_CHIRHO.generate_chirho(
                    self_chirho.home_chirho,
                    self_chirho.home_chirho,
                    self_chirho.plan_chirho,
                    "pin",
                    self_chirho.job_chirho,
                    "test-only",
                )
                self_chirho.assertEqual("held", value_chirho["state_chirho"])
        self_chirho.assertEqual(
            ["imageInference", "getTaskDetails", "getTaskDetails"], calls_chirho
        )
        self_chirho.assertEqual(
            1, len(RUN_CHIRHO.load_ledger_chirho(self_chirho.home_chirho, "pin"))
        )

    def test_existing_unknown_request_before_post_is_not_sent_chirho(self_chirho):
        RUN_CHIRHO.reserve_chirho(
            self_chirho.home_chirho,
            self_chirho.plan_chirho,
            "pin",
            self_chirho.job_chirho,
        )
        with (
            patch_chirho.object(RUN_CHIRHO, "source_chirho"),
            patch_chirho.object(
                RUN_CHIRHO,
                "post_chirho",
                return_value={"http_status_chirho": 200, "body_chirho": {}},
            ) as post_chirho,
        ):
            RUN_CHIRHO.generate_chirho(
                self_chirho.home_chirho,
                self_chirho.home_chirho,
                self_chirho.plan_chirho,
                "pin",
                self_chirho.job_chirho,
                "test-only",
            )
            self_chirho.assertEqual(
                "getTaskDetails", post_chirho.call_args.args[1][0]["taskType"]
            )

    def test_download_never_contacts_untrusted_host_chirho(self_chirho):
        with patch_chirho.object(
            RUN_CHIRHO.request_chirho, "build_opener"
        ) as opener_chirho:
            with self_chirho.assertRaises(ValueError):
                RUN_CHIRHO.download_chirho(
                    {"imageURL": "https://example.invalid/a.png"}
                )
            opener_chirho.assert_not_called()


if __name__ == "__main__":
    unittest_chirho.main()
