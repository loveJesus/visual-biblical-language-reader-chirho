# For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life. — John 3:16 (KJV)
"""Production identity and failure-recovery checks; no image or paid provider calls."""

import json
import sys
import tempfile
import unittest
from pathlib import Path
from unittest.mock import patch

ROOT_CHIRHO = Path(__file__).resolve().parents[2]
sys.path.insert(0, str(ROOT_CHIRHO / "scripts-chirho/bible-chirho"))
import icon_worker_chirho as worker_chirho


class IconProducerTestsChirho(unittest.TestCase):
    def test_rejected_visual_does_not_install_chirho(self_chirho):
        with tempfile.TemporaryDirectory() as name_chirho:
            home_chirho = Path(name_chirho)
            (home_chirho / "visual-review-chirho.json").write_text(
                json.dumps({"inspected_chirho": True, "visual_pass_chirho": False})
            )
            with (
                patch.object(worker_chirho, "install_chirho") as install_chirho,
                self_chirho.assertRaises(worker_chirho.AtlasLayoutRefusalChirho),
            ):
                worker_chirho.finish_chirho(home_chirho)
            install_chirho.assert_not_called()

    def test_completed_partial_recovery_keeps_rejected_cells_held_chirho(self_chirho):
        with tempfile.TemporaryDirectory() as name_chirho:
            root_chirho = Path(name_chirho).resolve()
            queue_chirho = root_chirho / "queue-chirho"
            attempt_chirho = queue_chirho / "attempt-saved-chirho"
            attempt_chirho.mkdir(parents=True)
            (attempt_chirho / "archived-chirho.json").write_text("{}")
            source_chirho = {
                "lemma_id_chirho": "G2563",
                "lexical_form_chirho": "κάλαμος",
            }
            (attempt_chirho / "installed-chirho.json").write_text(
                json.dumps({"holds_chirho": [{"source_chirho": source_chirho}]})
            )
            (queue_chirho / "worker-state-chirho.json").write_text(
                json.dumps(
                    {
                        "held_keys_chirho": [],
                        "attempt_count_chirho": 1,
                        "active_attempt_chirho": attempt_chirho.name,
                    }
                )
            )
            catalogue_chirho = (
                root_chirho / "data-chirho/media-chirho/bible-worker-icons-chirho.json"
            )
            catalogue_chirho.parent.mkdir(parents=True)
            catalogue_chirho.write_text(json.dumps({"icons_chirho": []}))
            with (
                patch.object(worker_chirho, "ROOT_CHIRHO", root_chirho),
                patch.object(worker_chirho, "QUEUE_CHIRHO", queue_chirho),
                patch.object(worker_chirho, "candidates_chirho", return_value=[]),
                patch.object(worker_chirho, "finish_chirho"),
                patch.object(
                    worker_chirho.LAUNCHER_CHIRHO.RECOVERY_CHIRHO,
                    "active_chirho",
                    return_value=False,
                ),
                patch.object(worker_chirho, "GeneratorJobChirho") as generator_chirho,
            ):
                self_chirho.assertEqual(worker_chirho.run_chirho(1), 0)
                generator_chirho.assert_not_called()
            state_chirho = json.loads(
                (queue_chirho / "worker-state-chirho.json").read_text()
            )
            self_chirho.assertIn(
                worker_chirho.key_chirho(source_chirho),
                state_chirho["held_keys_chirho"],
            )
            self_chirho.assertEqual(state_chirho["attempt_count_chirho"], 1)
            self_chirho.assertIsNone(state_chirho["active_attempt_chirho"])

    def test_full_identity_and_legacy_holds_chirho(self_chirho):
        rows_chirho = [
            {
                "lemma_id_chirho": "H7105",
                "lemma_augment_chirho": "a",
                "status_chirho": "legacy_hold",
            },
            {
                "lemma_id_chirho": "H7105",
                "lemma_augment_chirho": "b",
                "status_chirho": "prepared",
            },
        ]
        with tempfile.TemporaryDirectory() as name_chirho:
            queue_chirho = Path(name_chirho).resolve()
            (queue_chirho / "candidates-chirho").mkdir()
            (queue_chirho / "candidates-chirho/test-chirho.json").write_text(
                json.dumps({"candidates_chirho": rows_chirho})
            )
            (queue_chirho / "index-chirho.json").write_text(
                json.dumps(
                    {
                        "candidate_paths_chirho": [
                            "candidates-chirho/test-chirho.json"
                        ],
                        "candidate_count_chirho": len(rows_chirho),
                    }
                )
            )
            with patch.object(worker_chirho, "QUEUE_CHIRHO", queue_chirho):
                rows_chirho = worker_chirho.candidates_chirho()
        self_chirho.assertTrue(
            any(
                row_chirho["status_chirho"] == "legacy_hold"
                for row_chirho in rows_chirho
            )
        )
        self_chirho.assertEqual(
            len(rows_chirho),
            len({worker_chirho.key_chirho(row_chirho) for row_chirho in rows_chirho}),
        )
        self_chirho.assertNotEqual(
            worker_chirho.key_chirho(
                {"lemma_id_chirho": "H7105", "lemma_augment_chirho": "a"}
            ),
            worker_chirho.key_chirho(
                {"lemma_id_chirho": "H7105", "lemma_augment_chirho": "b"}
            ),
        )
        self_chirho.assertNotEqual(
            worker_chirho.key_chirho(
                {"lemma_id_chirho": "G782", "lexical_form_chirho": "ἀσπάζομαι"}
            ),
            worker_chirho.key_chirho(
                {"lemma_id_chirho": "G782", "lexical_form_chirho": "ἀπασπάζομαι"}
            ),
        )

    def test_source_hash_change_refuses_before_generation_chirho(self_chirho):
        row_chirho = {
            "examples_chirho": [
                {
                    "gloss_chirho": "word",
                    "content_path_chirho": "/content-chirho/proverbs-chirho/chapter-01-chirho.json",
                    "content_sha256_chirho": "1" * 64,
                }
            ]
        }
        with (
            patch.object(worker_chirho, "sha_chirho", return_value="0" * 64),
            self_chirho.assertRaisesRegex(ValueError, "source chapter changed"),
        ):
            worker_chirho.source_chirho(row_chirho)

    def test_failure_budget_survives_restart_chirho(self_chirho):
        with tempfile.TemporaryDirectory() as name_chirho:
            home_chirho = Path(name_chirho)
            (home_chirho / "worker-state-chirho.json").write_text(
                json.dumps(
                    {
                        "held_keys_chirho": [],
                        "attempt_count_chirho": 3,
                        "active_attempt_chirho": None,
                        "consecutive_generator_failures_chirho": 3,
                    }
                )
            )
            with (
                patch.object(worker_chirho, "QUEUE_CHIRHO", home_chirho),
                patch.object(worker_chirho, "candidates_chirho", return_value=[]),
                patch.object(worker_chirho, "GeneratorJobChirho") as generator_chirho,
            ):
                self_chirho.assertEqual(worker_chirho.run_chirho(1), 2)
                generator_chirho.assert_not_called()
            self_chirho.assertEqual(
                json.loads((home_chirho / "progress-chirho.json").read_text())[
                    "state_chirho"
                ],
                "generator_capacity_hold",
            )


if __name__ == "__main__":
    unittest.main()
