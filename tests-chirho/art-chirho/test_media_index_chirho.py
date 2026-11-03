# For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life. — John 3:16 (KJV)

import importlib.util
import json
import tempfile
import unittest
from pathlib import Path

ROOT_CHIRHO = Path(__file__).resolve().parents[2]
SPEC_CHIRHO = importlib.util.spec_from_file_location(
    "refresh_media_index_chirho",
    ROOT_CHIRHO / "scripts-chirho/art-chirho/refresh_media_index_chirho.py",
)
MODULE_CHIRHO = importlib.util.module_from_spec(SPEC_CHIRHO)
SPEC_CHIRHO.loader.exec_module(MODULE_CHIRHO)


class MediaIndexTestChirho(unittest.TestCase):
    def setUp(self):
        self.temp_chirho = tempfile.TemporaryDirectory()
        self.addCleanup(self.temp_chirho.cleanup)
        self.root_chirho = Path(self.temp_chirho.name)
        (self.root_chirho / "data-chirho/media-chirho").mkdir(parents=True)
        (self.root_chirho / "static").mkdir()
        self.scene_chirho = {
            "lesson_id_chirho": "Prov.1.1",
            "asset_path_chirho": "/assets-chirho/a.webp",
            "alt_chirho": "A scene",
            "width_chirho": 10,
            "height_chirho": 10,
            "sha256_chirho": "a" * 64,
            "art_review_chirho": "pending",
            "reading_note_chirho": "A note",
            "prompt_chirho": "private prompt",
        }
        self.icon_chirho = {
            "id_chirho": "icon",
            "lesson_id_chirho": "Prov.1.1",
            "token_id_chirho": "token",
            "lemma_id_chirho": "H1",
            "lemma_augment_chirho": None,
            "sense_id_chirho": "sense",
            "contextual_meaning_chirho": "meaning",
            "asset_path_chirho": "/assets-chirho/a.webp",
            "alt_chirho": "icon",
            "width_chirho": 128,
            "height_chirho": 128,
            "sha256_chirho": "b" * 64,
            "sense_review_chirho": "agent_reviewed",
            "art_review_chirho": "pending",
            "evidence_refs_chirho": ["source"],
            "display_authority_chirho": "reviewed",
            "selected_chirho": True,
            "internal_path_chirho": "/private",
        }
        self.write_chirho("scenes", [self.scene_chirho])
        self.write_chirho("icons", [self.icon_chirho])

    def write_chirho(self, kind_chirho, records_chirho):
        path_chirho = (
            self.root_chirho / f"data-chirho/media-chirho/proverbs-worker-{kind_chirho}-chirho.json"
        )
        path_chirho.write_text(
            json.dumps({"schema_version_chirho": 1, f"{kind_chirho}_chirho": records_chirho})
        )

    def test_sanitized_and_unchanged_chirho(self):
        self.assertTrue(MODULE_CHIRHO.refresh_chirho(self.root_chirho))
        path_chirho = self.root_chirho / "static/media-index-chirho.json"
        result_chirho = json.loads(path_chirho.read_text())
        self.assertEqual(result_chirho["scenes_chirho"][0]["lesson_id_chirho"], "Prov.1.1")
        self.assertNotIn("prompt_chirho", result_chirho["scenes_chirho"][0])
        self.assertNotIn("internal_path_chirho", result_chirho["icons_chirho"][0])
        stat_chirho = path_chirho.stat()
        self.assertFalse(MODULE_CHIRHO.refresh_chirho(self.root_chirho))
        self.assertEqual(
            (stat_chirho.st_ino, stat_chirho.st_mtime_ns),
            (path_chirho.stat().st_ino, path_chirho.stat().st_mtime_ns),
        )

    def test_invalid_retains_previous_chirho(self):
        MODULE_CHIRHO.refresh_chirho(self.root_chirho)
        path_chirho = self.root_chirho / "static/media-index-chirho.json"
        previous_chirho = path_chirho.read_bytes()
        for field_chirho, invalid_chirho in [
            ("asset_path_chirho", "/assets-chirho/../bad.webp"),
            ("sha256_chirho", "no"),
            ("width_chirho", True),
            ("art_review_chirho", "unknown"),
        ]:
            record_chirho = {**self.scene_chirho, field_chirho: invalid_chirho}
            self.write_chirho("scenes", [record_chirho])
            with self.assertRaises(ValueError):
                MODULE_CHIRHO.refresh_chirho(self.root_chirho)
            self.assertEqual(path_chirho.read_bytes(), previous_chirho)
        (
            self.root_chirho / "data-chirho/media-chirho/proverbs-worker-scenes-chirho.json"
        ).write_text("{")
        with self.assertRaises(ValueError):
            MODULE_CHIRHO.refresh_chirho(self.root_chirho)
        self.assertEqual(path_chirho.read_bytes(), previous_chirho)


if __name__ == "__main__":
    unittest.main()
