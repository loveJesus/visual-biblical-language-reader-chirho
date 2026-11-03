# For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life. — John 3:16 (KJV)
import hashlib
import importlib.util
import json
import multiprocessing
import sqlite3
import tempfile
import unittest
from pathlib import Path

from PIL import Image

PATH_CHIRHO = Path(__file__).resolve().parents[2] / "scripts-chirho/art-chirho/icon_queue_chirho.py"
SPEC_CHIRHO = importlib.util.spec_from_file_location("icon_queue_chirho", PATH_CHIRHO)
MODULE_CHIRHO = importlib.util.module_from_spec(SPEC_CHIRHO)
SPEC_CHIRHO.loader.exec_module(MODULE_CHIRHO)


def worker_chirho(queue_chirho, results_chirho):
    try:
        results_chirho.put(
            MODULE_CHIRHO.claim_chirho(Path(queue_chirho), 1, 60, now_chirho=10)["claim_id_chirho"]
        )
    except ValueError:
        results_chirho.put("blocked")


class IconQueueChirho(unittest.TestCase):
    def setUp(self):
        self.temp_chirho = tempfile.TemporaryDirectory()
        self.root_chirho = Path(self.temp_chirho.name)
        self.queue_chirho = self.root_chirho / "queue-chirho"
        self.inventory_chirho = self.root_chirho / "inventory.json"
        self.media_chirho = self.root_chirho / "media.json"
        self.inventory_chirho.write_text(
            json.dumps(
                {
                    "lemmas_chirho": [
                        {
                            "lemma_key_chirho": key_chirho,
                            "lemma_id_chirho": "H1",
                            "lemma_augment_chirho": augment_chirho,
                            "lexical_form_chirho": "same",
                            "occurrences_chirho": [
                                {
                                    "verse_id_chirho": "Prov.1.1",
                                    "token_id_chirho": key_chirho,
                                    "reading_chirho": "main",
                                    "gloss_chirho": gloss_chirho,
                                }
                                for gloss_chirho in ("father", "parent")
                            ],
                        }
                        for key_chirho, augment_chirho in [
                            ("H1:a", "a"),
                            ("H1:b", "b"),
                            ("oshb:prefix", None),
                        ]
                    ]
                }
            )
        )
        self.media_chirho.write_text(json.dumps({"icons_chirho": []}))
        MODULE_CHIRHO.init_chirho(self.queue_chirho, self.inventory_chirho, self.media_chirho)

    def tearDown(self):
        self.temp_chirho.cleanup()

    def test_candidates_and_limits_chirho(self):
        preview_chirho = MODULE_CHIRHO.claim_chirho(self.queue_chirho, 16, 10, True, 1)
        self.assertEqual(len(preview_chirho["candidates_chirho"]), 6)
        self.assertEqual(
            len(
                {
                    (row_chirho["lemma_key_chirho"], row_chirho["gloss_chirho"])
                    for row_chirho in preview_chirho["candidates_chirho"]
                }
            ),
            6,
        )
        with self.assertRaises(ValueError):
            MODULE_CHIRHO.claim_chirho(self.queue_chirho, 17, 10)
        with self.assertRaises(FileExistsError):
            MODULE_CHIRHO.init_chirho(self.queue_chirho, self.inventory_chirho, self.media_chirho)

    def test_concurrency_expiry_release_chirho(self):
        results_chirho = multiprocessing.Queue()
        workers_chirho = [
            multiprocessing.Process(
                target=worker_chirho, args=(str(self.queue_chirho), results_chirho)
            )
            for index_chirho in range(2)
        ]
        for worker_item_chirho in workers_chirho:
            worker_item_chirho.start()
        for worker_item_chirho in workers_chirho:
            worker_item_chirho.join()
        outcome_chirho = [results_chirho.get(timeout=2) for index_chirho in range(2)]
        self.assertEqual(outcome_chirho.count("blocked"), 1)
        next_chirho = MODULE_CHIRHO.claim_chirho(self.queue_chirho, 1, 10, now_chirho=71)
        with self.assertRaises(ValueError):
            MODULE_CHIRHO.finish_chirho(
                self.queue_chirho,
                next(item_chirho for item_chirho in outcome_chirho if item_chirho != "blocked"),
                now_chirho=71,
            )
        MODULE_CHIRHO.finish_chirho(
            self.queue_chirho, next_chirho["claim_id_chirho"], now_chirho=72
        )
        self.assertEqual(
            len(
                MODULE_CHIRHO.claim_chirho(self.queue_chirho, 16, 10, True, 73)["candidates_chirho"]
            ),
            6,
        )

    def test_completion_validation_atomic_chirho(self):
        claim_chirho = MODULE_CHIRHO.claim_chirho(self.queue_chirho, 1, 60, now_chirho=10)
        row_chirho = claim_chirho["candidates_chirho"][0]
        icon_chirho = self.root_chirho / "cell.webp"
        Image.new("RGBA", (128, 128), "red").save(icon_chirho, "WEBP")
        manifest_chirho = self.root_chirho / "manifest.json"
        cell_chirho = {
            "candidate_id_chirho": row_chirho["candidate_id_chirho"],
            "cell_chirho": 0,
            "lemma_key_chirho": row_chirho["lemma_key_chirho"],
            "gloss_chirho": row_chirho["gloss_chirho"],
            "sense_review_chirho": "agent_reviewed",
            "art_review_chirho": "pending",
            "sense_id_chirho": "reviewed",
            "contextual_meaning_chirho": "father",
            "layout_pass_chirho": True,
            "icon_path_chirho": "cell.webp",
            "icon_sha256_chirho": "wrong",
        }
        manifest_chirho.write_text(
            json.dumps(
                {
                    "prompt_chirho": "prompt",
                    "tool_chirho": "image_gen.imagegen",
                    "model_chirho": "tool-managed",
                    "created_at_chirho": "date",
                    "grid_chirho": [4, 4],
                    "sheet_sha256_chirho": "a" * 64,
                    "cells_chirho": [cell_chirho],
                }
            )
        )
        with self.assertRaises(ValueError):
            MODULE_CHIRHO.finish_chirho(
                self.queue_chirho,
                claim_chirho["claim_id_chirho"],
                manifest_chirho,
                self.root_chirho,
                now_chirho=11,
            )
        cell_chirho["icon_sha256_chirho"] = hashlib.sha256(icon_chirho.read_bytes()).hexdigest()
        manifest_chirho.write_text(
            json.dumps(
                {
                    "prompt_chirho": "prompt",
                    "tool_chirho": "image_gen.imagegen",
                    "model_chirho": "tool-managed",
                    "created_at_chirho": "date",
                    "grid_chirho": [4, 4],
                    "sheet_sha256_chirho": "a" * 64,
                    "cells_chirho": [cell_chirho],
                }
            )
        )
        MODULE_CHIRHO.finish_chirho(
            self.queue_chirho,
            claim_chirho["claim_id_chirho"],
            manifest_chirho,
            self.root_chirho,
            now_chirho=11,
        )
        with self.assertRaises(ValueError):
            MODULE_CHIRHO.finish_chirho(
                self.queue_chirho, claim_chirho["claim_id_chirho"], now_chirho=12
            )

    def test_dry_run_no_create_chirho(self):
        missing_chirho = self.root_chirho / "missing"
        MODULE_CHIRHO.init_chirho(missing_chirho, self.inventory_chirho, self.media_chirho, True)
        self.assertFalse(missing_chirho.exists())
        with self.assertRaises(sqlite3.OperationalError):
            MODULE_CHIRHO.claim_chirho(missing_chirho, 1, 10, True)
        self.assertFalse(missing_chirho.exists())


if __name__ == "__main__":
    unittest.main()
