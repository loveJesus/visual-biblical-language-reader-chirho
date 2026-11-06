# For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life. — John 3:16 (KJV)
"""An exact known-failure exception never resets attempts or releases uncertainty."""

import sys
import tempfile
import unittest
from pathlib import Path

ROOT_CHIRHO = Path(__file__).resolve().parents[2]
sys.path.insert(
    0, str(ROOT_CHIRHO / "scripts-chirho/bible-chirho/icon_pipeline_chirho")
)
from queue_chirho import QueueChirho


class IconExceptionTestsChirho(unittest.TestCase):
    def setUp(self_chirho):
        self_chirho.home_chirho = tempfile.TemporaryDirectory()
        self_chirho.queue_chirho = QueueChirho(
            Path(self_chirho.home_chirho.name) / "queue-chirho.sqlite"
        )
        self_chirho.queue_chirho.seed_chirho(
            [
                {
                    "key_chirho": str(index_chirho),
                    "payload_chirho": {"key_chirho": str(index_chirho)},
                    "state_chirho": "queued",
                    "attempts_chirho": 2,
                    "reason_chirho": None,
                    "origin_chirho": [],
                }
                for index_chirho in range(9)
            ],
            {"source_chirho": "fixed"},
        )
        self_chirho.id_chirho, _rows_chirho = (
            self_chirho.queue_chirho.generation_chirho()
        )
        self_chirho.keys_chirho = {str(index_chirho) for index_chirho in range(9)}

    def tearDown(self_chirho):
        self_chirho.queue_chirho.db_chirho.close()
        self_chirho.home_chirho.cleanup()

    def test_one_extra_request_then_exhaustion_without_counter_reset_chirho(
        self_chirho,
    ):
        self_chirho.queue_chirho.settle_chirho(
            self_chirho.id_chirho,
            set(),
            self_chirho.keys_chirho,
            set(),
            "Known failed artwork",
        )
        self_chirho.queue_chirho.grant_known_failure_chirho("0", "a" * 64)
        id_chirho, rows_chirho = self_chirho.queue_chirho.generation_chirho()
        self_chirho.assertEqual(rows_chirho, [{"key_chirho": "0"}])
        row_chirho = self_chirho.queue_chirho.db_chirho.execute(
            "SELECT attempts_chirho FROM lemmas_chirho WHERE key_chirho='0'"
        ).fetchone()
        self_chirho.assertEqual(row_chirho[0], 4)
        self_chirho.queue_chirho.settle_chirho(
            id_chirho, set(), {"0"}, set(), "Known fourth failure"
        )
        self_chirho.assertIsNone(self_chirho.queue_chirho.generation_chirho())
        with self_chirho.assertRaises(ValueError):
            self_chirho.queue_chirho.grant_known_failure_chirho("0", "a" * 64)

    def test_unknown_outcome_cannot_be_released_by_exception_chirho(self_chirho):
        self_chirho.queue_chirho.settle_chirho(
            self_chirho.id_chirho,
            set(),
            set(),
            self_chirho.keys_chirho,
            "Unknown original",
        )
        with self_chirho.assertRaisesRegex(ValueError, "unknown outcomes"):
            self_chirho.queue_chirho.grant_known_failure_chirho("0", "a" * 64)
        self_chirho.assertIsNone(self_chirho.queue_chirho.generation_chirho())

    def test_only_seven_named_exceptions_and_exact_authority_chirho(self_chirho):
        self_chirho.queue_chirho.settle_chirho(
            self_chirho.id_chirho,
            set(),
            self_chirho.keys_chirho,
            set(),
            "Known failed artwork",
        )
        with self_chirho.assertRaises(ValueError):
            self_chirho.queue_chirho.grant_known_failure_chirho("0", "missing")
        for index_chirho in range(7):
            self_chirho.queue_chirho.grant_known_failure_chirho(
                str(index_chirho), "a" * 64
            )
        with self_chirho.assertRaisesRegex(ValueError, "Seven named"):
            self_chirho.queue_chirho.grant_known_failure_chirho("7", "a" * 64)
        self_chirho.assertEqual(
            dict(
                self_chirho.queue_chirho.db_chirho.execute(
                    "SELECT attempts_chirho,count(*) FROM lemmas_chirho GROUP BY attempts_chirho"
                )
            ),
            {3: 9},
        )


if __name__ == "__main__":
    unittest.main()
