# For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life. — John 3:16 (KJV)
"""A separate owner grant cannot resend the old unknown or retry a failed replacement."""

import json
import sys
import tempfile
import unittest
from pathlib import Path

sys.path.insert(
    0,
    str(
        Path(__file__).resolve().parents[2]
        / "scripts-chirho/bible-chirho/icon_pipeline_chirho"
    ),
)
from queue_chirho import QueueChirho


class ReplacementTestsChirho(unittest.TestCase):
    def setUp(self_chirho):
        self_chirho.temp_chirho = tempfile.TemporaryDirectory()
        self_chirho.queue_chirho = QueueChirho(
            Path(self_chirho.temp_chirho.name) / "queue-chirho.sqlite"
        )
        self_chirho.attempt_chirho = "attempts-chirho/0000-chirho/unknown-chirho"
        self_chirho.plan_sha_chirho = "b" * 64
        self_chirho.origin_chirho = [
            {
                "attempt_chirho": self_chirho.attempt_chirho,
                "plan_sha256_chirho": self_chirho.plan_sha_chirho,
                "disposition_chirho": "unknown",
            }
        ]
        self_chirho.keys_chirho = [str(index_chirho) for index_chirho in range(16)]
        self_chirho.queue_chirho.seed_chirho(
            [
                {
                    "key_chirho": key_chirho,
                    "payload_chirho": {"key_chirho": key_chirho},
                    "state_chirho": "held",
                    "attempts_chirho": 1,
                    "reason_chirho": "Historical request outcome unknown; never automatically regenerate",
                    "origin_chirho": self_chirho.origin_chirho,
                }
                for key_chirho in self_chirho.keys_chirho
            ],
            {"source_chirho": "fixed"},
        )
        self_chirho.queue_chirho.db_chirho.execute(
            "INSERT INTO jobs_chirho VALUES('old-unknown-chirho','held',?,'before',?,'before')",
            (
                json.dumps(self_chirho.keys_chirho),
                json.dumps({"uncertain_chirho": self_chirho.keys_chirho}),
            ),
        )
        self_chirho.old_job_chirho = tuple(
            self_chirho.queue_chirho.db_chirho.execute(
                "SELECT * FROM jobs_chirho WHERE id_chirho='old-unknown-chirho'"
            ).fetchone()
        )

    def tearDown(self_chirho):
        self_chirho.queue_chirho.db_chirho.close()
        self_chirho.temp_chirho.cleanup()

    def grant_chirho(self_chirho, keys_chirho=None, authority_chirho="a" * 64):
        self_chirho.queue_chirho.grant_unknown_replacement_chirho(
            self_chirho.keys_chirho if keys_chirho is None else keys_chirho,
            authority_chirho,
            self_chirho.attempt_chirho,
            self_chirho.plan_sha_chirho,
        )

    def test_one_separate_replacement_without_retry_or_history_change_chirho(
        self_chirho,
    ):
        self_chirho.assertIsNone(self_chirho.queue_chirho.generation_chirho())
        self_chirho.grant_chirho()
        self_chirho.assertEqual(
            {
                row_chirho[0]
                for row_chirho in self_chirho.queue_chirho.db_chirho.execute(
                    "SELECT attempts_chirho FROM lemmas_chirho"
                )
            },
            {1},
        )
        id_chirho, rows_chirho = self_chirho.queue_chirho.generation_chirho()
        self_chirho.assertNotEqual(id_chirho, "old-unknown-chirho")
        self_chirho.assertEqual(len(rows_chirho), 16)
        self_chirho.queue_chirho.settle_chirho(
            id_chirho,
            set(),
            set(self_chirho.keys_chirho),
            set(),
            "Known failed replacement",
        )
        self_chirho.assertIsNone(self_chirho.queue_chirho.generation_chirho())
        self_chirho.assertEqual(
            {
                tuple(row_chirho)
                for row_chirho in self_chirho.queue_chirho.db_chirho.execute(
                    "SELECT state_chirho,attempts_chirho FROM lemmas_chirho"
                )
            },
            {("held", 2)},
        )
        for row_chirho in self_chirho.queue_chirho.db_chirho.execute(
            "SELECT origin_chirho FROM lemmas_chirho"
        ):
            self_chirho.assertEqual(
                json.loads(row_chirho[0]), self_chirho.origin_chirho
            )
        self_chirho.assertEqual(
            tuple(
                self_chirho.queue_chirho.db_chirho.execute(
                    "SELECT * FROM jobs_chirho WHERE id_chirho='old-unknown-chirho'"
                ).fetchone()
            ),
            self_chirho.old_job_chirho,
        )
        with self_chirho.assertRaisesRegex(ValueError, "already reserved"):
            self_chirho.grant_chirho()

    def test_only_exact_sixteen_unknowns_with_recorded_authority_chirho(self_chirho):
        for keys_chirho, authority_chirho in [
            (self_chirho.keys_chirho[:15], "a" * 64),
            (self_chirho.keys_chirho + ["16"], "a" * 64),
            (self_chirho.keys_chirho, "missing"),
        ]:
            with self_chirho.assertRaises(ValueError):
                self_chirho.grant_chirho(keys_chirho, authority_chirho)
        self_chirho.queue_chirho.db_chirho.execute(
            "UPDATE lemmas_chirho SET attempts_chirho=2 WHERE key_chirho='0'"
        )
        with self_chirho.assertRaisesRegex(ValueError, "exact original unknown"):
            self_chirho.grant_chirho()
        self_chirho.assertEqual(
            self_chirho.queue_chirho.db_chirho.execute(
                "SELECT count(*) FROM replacement_grants_chirho"
            ).fetchone()[0],
            0,
        )
        self_chirho.assertEqual(
            self_chirho.queue_chirho.db_chirho.execute(
                "SELECT count(*) FROM lemmas_chirho WHERE state_chirho='held'"
            ).fetchone()[0],
            16,
        )

    def test_changed_original_rolls_back_the_whole_grant_chirho(self_chirho):
        self_chirho.queue_chirho.db_chirho.execute(
            "UPDATE lemmas_chirho SET origin_chirho='[]' WHERE key_chirho='9'"
        )
        with self_chirho.assertRaisesRegex(ValueError, "exact original unknown"):
            self_chirho.grant_chirho()
        self_chirho.assertEqual(
            self_chirho.queue_chirho.db_chirho.execute(
                "SELECT count(*) FROM replacement_grants_chirho"
            ).fetchone()[0],
            0,
        )
        self_chirho.assertEqual(
            self_chirho.queue_chirho.db_chirho.execute(
                "SELECT count(*) FROM lemmas_chirho WHERE state_chirho='held'"
            ).fetchone()[0],
            16,
        )


if __name__ == "__main__":
    unittest.main()
