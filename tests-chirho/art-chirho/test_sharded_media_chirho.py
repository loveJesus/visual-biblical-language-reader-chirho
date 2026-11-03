# For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life. — John 3:16 (KJV)
"""Fail-closed, atomic and sanitized behavior of the chapter-sharded media refresher."""

import contextlib
import hashlib
import importlib.util
import io
import json
import tempfile
import unittest
from pathlib import Path
from unittest import mock

ROOT_CHIRHO = Path(__file__).resolve().parents[2]
SPEC_CHIRHO = importlib.util.spec_from_file_location(
    "refresh_sharded_media_chirho",
    ROOT_CHIRHO / "scripts-chirho/art-chirho/refresh_sharded_media_chirho.py",
)
MODULE_CHIRHO = importlib.util.module_from_spec(SPEC_CHIRHO)
SPEC_CHIRHO.loader.exec_module(MODULE_CHIRHO)
GREEK_CHIRHO = "λόγος"
APOSTROPHE_CHIRHO = "the word\u2019s light"


def webp_chirho(width_chirho, height_chirho):
    """Minimal VP8L header with the requested canvas, enough for the header-only reader."""
    data_chirho = bytearray(30)
    data_chirho[0:4] = b"RIFF"
    data_chirho[4:8] = (22).to_bytes(4, "little")
    data_chirho[8:16] = b"WEBPVP8L"
    data_chirho[16:20] = (10).to_bytes(4, "little")
    data_chirho[20] = 0x2F
    data_chirho[21:25] = ((width_chirho - 1) | ((height_chirho - 1) << 14)).to_bytes(4, "little")
    return bytes(data_chirho)


def asset_bytes_chirho(record_chirho):
    data_chirho = bytearray(
        webp_chirho(record_chirho["width_chirho"], record_chirho["height_chirho"])
    )
    data_chirho.extend(record_chirho["asset_path_chirho"].encode())
    data_chirho[4:8] = (len(data_chirho) - 8).to_bytes(4, "little")
    return bytes(data_chirho)


def icon_chirho(identifier_chirho, lesson_chirho, token_chirho, asset_chirho, **changes_chirho):
    record_chirho = {
        "id_chirho": identifier_chirho,
        "lesson_id_chirho": lesson_chirho,
        "token_id_chirho": token_chirho,
        "lemma_id_chirho": "H3820",
        "lemma_augment_chirho": "a",
        "sense_id_chirho": f"{identifier_chirho}-sense",
        "contextual_meaning_chirho": "heart",
        "asset_path_chirho": asset_chirho,
        "alt_chirho": "heart illustration",
        "width_chirho": 128,
        "height_chirho": 128,
        "sha256_chirho": hashlib.sha256(asset_chirho.encode()).hexdigest(),
        "sense_review_chirho": "agent_reviewed",
        "art_review_chirho": "pending",
        "evidence_refs_chirho": ["oshb-prov-chirho"],
        "display_authority_chirho": "Reviewed contextual sense.",
        "selected_chirho": True,
        "source_gloss_chirho": "private source gloss",
    }
    record_chirho.update(changes_chirho)
    if record_chirho["lesson_id_chirho"] is None:
        del record_chirho["lesson_id_chirho"]
    return record_chirho


class ShardedMediaTestChirho(unittest.TestCase):
    def setUp(self):
        temp_chirho = tempfile.TemporaryDirectory()
        self.addCleanup(temp_chirho.cleanup)
        self.root_chirho = Path(temp_chirho.name)
        for book_chirho, folder_chirho, chapters_chirho in (
            ("Prov", "proverbs-chirho", 31),
            ("John", "john-chirho", 21),
        ):
            self.write_json_chirho(
                f"static/content-chirho/{folder_chirho}/manifest-chirho.json",
                {
                    "book_id_chirho": book_chirho,
                    "chapters_chirho": [
                        {"number_chirho": number_chirho, "verse_count_chirho": 30}
                        for number_chirho in range(1, chapters_chirho + 1)
                    ],
                },
            )
        self.scene_asset_chirho = "/assets-chirho/scenes-chirho/prov-01-001-chirho.webp"
        self.curated_scene_chirho = "/assets-chirho/curated-scene-chirho.webp"
        self.worker_chirho = {
            "schema_version_chirho": 1,
            "scenes_chirho": [
                {
                    "lesson_id_chirho": "Prov.1.1",
                    "asset_path_chirho": self.scene_asset_chirho,
                    "alt_chirho": "A crowned king with a scroll.",
                    "width_chirho": 400,
                    "height_chirho": 300,
                    "sha256_chirho": "c" * 64,
                    "art_review_chirho": "pending",
                    "reading_note_chirho": "An imaginative introduction.",
                    "prompt_chirho": "private prompt text",
                    "model_chirho": "private model",
                }
            ],
            "icons_chirho": [
                icon_chirho(
                    "icon-a", "Prov.1.2", "20xAF", "/assets-chirho/icons-chirho/a-chirho.webp"
                ),
                icon_chirho(
                    "icon-greek",
                    "John.1.1",
                    "John.1.1!3",
                    "/assets-chirho/icons-chirho/greek-chirho.webp",
                    lemma_id_chirho="G3056",
                    lemma_augment_chirho=None,
                    contextual_meaning_chirho="word",
                    lexical_form_chirho=GREEK_CHIRHO,
                    alt_chirho=APOSTROPHE_CHIRHO,
                ),
                icon_chirho(
                    "icon-gen-particle",
                    "Gen.1.1",
                    "01xeN",
                    "/assets-chirho/icons-chirho/gen-particle-chirho.webp",
                    lemma_id_chirho="oshb:b",
                    lemma_augment_chirho=None,
                    contextual_meaning_chirho="in",
                    evidence_refs_chirho=["oshb-gen-chirho"],
                ),
            ],
        }
        self.curated_chirho = {
            "schema_version_chirho": 1,
            "lesson_id_chirho": "Prov.26.1",
            "icons_chirho": [
                icon_chirho(
                    "icon-snow", None, "20ikj", "/assets-chirho/icons-chirho/snow-chirho.webp"
                )
            ],
            "scenes_chirho": [
                {
                    "asset_path_chirho": self.curated_scene_chirho,
                    "sha256_chirho": "d" * 64,
                    "width_chirho": 400,
                    "height_chirho": 300,
                    "art_review_chirho": "pending",
                }
            ],
        }
        self.write_json_chirho(
            "data-chirho/reader-chirho/proverbs-26-1-presentation-chirho.json",
            {
                "asset_path_chirho": self.curated_scene_chirho,
                "alt_chirho": "Snow in summer, curated.",
                "reading_note_chirho": "No verbs here.",
            },
        )
        for manifest_chirho in (self.worker_chirho, self.curated_chirho):
            for record_chirho in manifest_chirho["scenes_chirho"] + manifest_chirho["icons_chirho"]:
                record_chirho["sha256_chirho"] = hashlib.sha256(
                    asset_bytes_chirho(record_chirho)
                ).hexdigest()
        self.write_inputs_chirho()

    def write_json_chirho(self, relative_chirho, data_chirho):
        path_chirho = self.root_chirho / relative_chirho
        path_chirho.parent.mkdir(parents=True, exist_ok=True)
        path_chirho.write_text(json.dumps(data_chirho, ensure_ascii=False), encoding="utf-8")

    def write_inputs_chirho(self):
        self.write_json_chirho("data-chirho/media-chirho/worker-chirho.json", self.worker_chirho)
        self.write_json_chirho("data-chirho/media-chirho/curated-chirho.json", self.curated_chirho)
        for manifest_chirho in (self.worker_chirho, self.curated_chirho):
            for record_chirho in manifest_chirho["scenes_chirho"] + manifest_chirho["icons_chirho"]:
                path_chirho = self.root_chirho / "static" / record_chirho["asset_path_chirho"][1:]
                path_chirho.parent.mkdir(parents=True, exist_ok=True)
                path_chirho.write_bytes(asset_bytes_chirho(record_chirho))

    def outputs_chirho(self):
        base_chirho = self.root_chirho / "static/media-chirho"
        return {
            str(path_chirho.relative_to(base_chirho)): path_chirho.read_bytes()
            for path_chirho in sorted(base_chirho.rglob("*"))
            if path_chirho.is_file()
        }

    def stats_chirho(self):
        base_chirho = self.root_chirho / "static/media-chirho"
        return {
            name_chirho: (
                (base_chirho / name_chirho).stat().st_ino,
                (base_chirho / name_chirho).stat().st_mtime_ns,
            )
            for name_chirho in self.outputs_chirho()
        }

    def test_sparse_source_verse_numbers_are_membership_not_a_maximum_chirho(self_chirho):
        home_chirho = self_chirho.root_chirho / "static/content-chirho/acts-chirho"
        home_chirho.mkdir(parents=True, exist_ok=True)
        numbers_chirho = [number_chirho for number_chirho in range(1, 28) if number_chirho != 7]
        manifest_chirho = {
            "book_id_chirho": "Acts",
            "chapters_chirho": [
                {
                    "number_chirho": 24,
                    "verse_count_chirho": 26,
                    "verse_numbers_chirho": numbers_chirho,
                }
            ],
        }
        (home_chirho / "manifest-chirho.json").write_text(json.dumps(manifest_chirho))
        membership_chirho = MODULE_CHIRHO.verse_counts_chirho(self_chirho.root_chirho)
        self_chirho.assertEqual(
            MODULE_CHIRHO.lesson_chirho("Acts.24.27", membership_chirho, "fixture-chirho"),
            ("Acts", 24, 27),
        )
        with self_chirho.assertRaises(MODULE_CHIRHO.RefusalChirho):
            MODULE_CHIRHO.lesson_chirho("Acts.24.7", membership_chirho, "fixture-chirho")
        manifest_chirho["chapters_chirho"][0]["verse_numbers_chirho"][-1] = 26
        (home_chirho / "manifest-chirho.json").write_text(json.dumps(manifest_chirho))
        with self_chirho.assertRaises(MODULE_CHIRHO.RefusalChirho):
            MODULE_CHIRHO.verse_counts_chirho(self_chirho.root_chirho)

    def test_writes_contract_shards_with_public_fields_only(self):
        self.assertGreater(MODULE_CHIRHO.refresh_chirho(self.root_chirho), 0)
        outputs_chirho = self.outputs_chirho()
        self.assertEqual(
            sorted(outputs_chirho),
            sorted(
                [
                    *(
                        folder_chirho + "/summary-chirho.json"
                        for folder_chirho, _chapters_chirho in MODULE_CHIRHO.BOOKS_CHIRHO.values()
                    ),
                    "genesis-chirho/chapter-01-chirho.json",
                    "john-chirho/chapter-01-chirho.json",
                    "proverbs-chirho/chapter-01-chirho.json",
                    "proverbs-chirho/chapter-26-chirho.json",
                ]
            ),
        )
        for folder_chirho, book_chirho in (
            ("proverbs-chirho", "Prov"),
            ("john-chirho", "John"),
            ("genesis-chirho", "Gen"),
        ):
            summary_chirho = json.loads(outputs_chirho[f"{folder_chirho}/summary-chirho.json"])
            self.assertEqual(summary_chirho["book_id_chirho"], book_chirho)
            for entry_chirho in summary_chirho["chapters_chirho"]:
                data_chirho = outputs_chirho[
                    entry_chirho["path_chirho"].removeprefix("/media-chirho/")
                ]
                self.assertEqual(
                    hashlib.sha256(data_chirho).hexdigest(), entry_chirho["sha256_chirho"]
                )
                chapter_chirho = json.loads(data_chirho)
                self.assertEqual(
                    (chapter_chirho["book_id_chirho"], chapter_chirho["chapter_chirho"]),
                    (book_chirho, entry_chirho["number_chirho"]),
                )
        chapter_chirho = json.loads(outputs_chirho["proverbs-chirho/chapter-26-chirho.json"])
        self.assertEqual(chapter_chirho["icons_chirho"][0]["lesson_id_chirho"], "Prov.26.1")
        self.assertEqual(
            chapter_chirho["scenes_chirho"][0]["alt_chirho"], "Snow in summer, curated."
        )
        first_chirho = json.loads(outputs_chirho["proverbs-chirho/chapter-01-chirho.json"])
        self.assertEqual(
            list(first_chirho["scenes_chirho"][0]),
            [f"{field_chirho}_chirho" for field_chirho in MODULE_CHIRHO.SCENE_FIELDS_CHIRHO],
        )
        self.assertEqual(
            list(first_chirho["icons_chirho"][0]),
            [f"{field_chirho}_chirho" for field_chirho in MODULE_CHIRHO.ICON_FIELDS_CHIRHO],
        )
        greek_chirho = json.loads(outputs_chirho["john-chirho/chapter-01-chirho.json"])[
            "icons_chirho"
        ][0]
        self.assertEqual(greek_chirho["lexical_form_chirho"], GREEK_CHIRHO)
        self.assertEqual(greek_chirho["token_id_chirho"], "John.1.1!3")
        self.assertNotIn("lexical_form_chirho", first_chirho["icons_chirho"][0])
        particle_chirho = json.loads(outputs_chirho["genesis-chirho/chapter-01-chirho.json"])
        self.assertEqual(particle_chirho["icons_chirho"][0]["lemma_id_chirho"], "oshb:b")
        self.assertEqual(greek_chirho["alt_chirho"], APOSTROPHE_CHIRHO)
        everything_chirho = b"".join(outputs_chirho.values())
        for private_chirho in (b"private prompt", b"private model", b"private source gloss"):
            self.assertNotIn(private_chirho, everything_chirho)
        mode_chirho = (
            (self.root_chirho / "static/media-chirho/proverbs-chirho/summary-chirho.json")
            .stat()
            .st_mode
        )
        self.assertEqual(mode_chirho & 0o777, 0o644)

    def test_unchanged_inputs_rewrite_nothing(self):
        MODULE_CHIRHO.refresh_chirho(self.root_chirho)
        before_chirho = self.stats_chirho()
        self.assertEqual(MODULE_CHIRHO.refresh_chirho(self.root_chirho), 0)
        self.assertEqual(self.stats_chirho(), before_chirho)

    def test_quality_upgrade_selects_primary_without_deleting_fallback_chirho(self):
        fallback_chirho = self.worker_chirho["scenes_chirho"][0]
        fallback_chirho["fallback_chirho"] = True
        primary_chirho = {
            **fallback_chirho,
            "fallback_chirho": False,
            "asset_path_chirho": "/assets-chirho/scenes-chirho/upgraded-chirho.webp",
            "sha256_chirho": "e" * 64,
        }
        primary_chirho["sha256_chirho"] = hashlib.sha256(
            asset_bytes_chirho(primary_chirho)
        ).hexdigest()
        self.worker_chirho["scenes_chirho"].append(primary_chirho)
        self.write_inputs_chirho()
        MODULE_CHIRHO.refresh_chirho(self.root_chirho)
        chapter_chirho = json.loads(self.outputs_chirho()["proverbs-chirho/chapter-01-chirho.json"])
        self.assertEqual(len(chapter_chirho["scenes_chirho"]), 1)
        self.assertEqual(
            chapter_chirho["scenes_chirho"][0]["asset_path_chirho"],
            primary_chirho["asset_path_chirho"],
        )
        self.assertNotIn("fallback_chirho", chapter_chirho["scenes_chirho"][0])
        self.assertEqual(chapter_chirho["scenes_chirho"][0]["art_review_chirho"], "pending")
        fallback_path_chirho = (
            self.root_chirho / "static" / fallback_chirho["asset_path_chirho"].lstrip("/")
        )
        self.assertTrue(fallback_path_chirho.is_file())
        before_chirho = self.outputs_chirho()
        fallback_path_chirho.unlink()
        with self.assertRaises(MODULE_CHIRHO.RefusalChirho):
            MODULE_CHIRHO.refresh_chirho(self.root_chirho)
        self.assertEqual(before_chirho, self.outputs_chirho())
        self.write_inputs_chirho()
        primary_chirho["fallback_chirho"] = True
        self.write_inputs_chirho()
        with self.assertRaises(MODULE_CHIRHO.RefusalChirho):
            MODULE_CHIRHO.refresh_chirho(self.root_chirho)

    def test_optional_scene_variant_preserves_other_shards_and_pending_state(self):
        MODULE_CHIRHO.refresh_chirho(self.root_chirho)
        before_chirho = self.outputs_chirho()
        reduced_chirho = {
            **self.worker_chirho["scenes_chirho"][0],
            "variant_chirho": "representation_reduced",
            "asset_path_chirho": "/assets-chirho/reduced-chirho.webp",
            "sha256_chirho": "e" * 64,
        }
        reduced_chirho["sha256_chirho"] = hashlib.sha256(
            asset_bytes_chirho(reduced_chirho)
        ).hexdigest()
        self.worker_chirho["scenes_chirho"].append(reduced_chirho)
        self.write_inputs_chirho()
        self.assertEqual(MODULE_CHIRHO.refresh_chirho(self.root_chirho), 2)
        after_chirho = self.outputs_chirho()
        for name_chirho in before_chirho:
            if name_chirho not in (
                "proverbs-chirho/chapter-01-chirho.json",
                "proverbs-chirho/summary-chirho.json",
            ):
                self.assertEqual(before_chirho[name_chirho], after_chirho[name_chirho])
        rows_chirho = json.loads(after_chirho["proverbs-chirho/chapter-01-chirho.json"])[
            "scenes_chirho"
        ]
        self.assertEqual(len(rows_chirho), 2)
        self.assertEqual(
            next(row_chirho for row_chirho in rows_chirho if "variant_chirho" in row_chirho)[
                "art_review_chirho"
            ],
            "pending",
        )

    def test_only_changed_shards_are_rewritten_and_emptied_chapters_removed(self):
        MODULE_CHIRHO.refresh_chirho(self.root_chirho)
        before_chirho = self.stats_chirho()
        self.worker_chirho["icons_chirho"][0]["alt_chirho"] = "a changed heart illustration"
        self.write_inputs_chirho()
        self.assertEqual(MODULE_CHIRHO.refresh_chirho(self.root_chirho), 2)
        after_chirho = self.stats_chirho()
        changed_chirho = sorted(
            name_chirho
            for name_chirho in after_chirho
            if after_chirho[name_chirho] != before_chirho[name_chirho]
        )
        self.assertEqual(
            changed_chirho,
            ["proverbs-chirho/chapter-01-chirho.json", "proverbs-chirho/summary-chirho.json"],
        )
        self.worker_chirho["scenes_chirho"] = []
        self.worker_chirho["icons_chirho"] = self.worker_chirho["icons_chirho"][1:]
        self.write_inputs_chirho()
        MODULE_CHIRHO.refresh_chirho(self.root_chirho)
        self.assertNotIn("proverbs-chirho/chapter-01-chirho.json", self.outputs_chirho())
        summary_chirho = json.loads(self.outputs_chirho()["proverbs-chirho/summary-chirho.json"])
        self.assertEqual(
            [entry_chirho["number_chirho"] for entry_chirho in summary_chirho["chapters_chirho"]],
            [26],
        )

    def test_bad_inputs_refuse_and_keep_the_last_good_shards(self):
        def worker_icon_chirho(changes_chirho):
            return lambda: self.worker_chirho["icons_chirho"][0].update(changes_chirho)

        def write_file_chirho(relative_chirho, data_chirho):
            return lambda: (self.root_chirho / relative_chirho).write_bytes(data_chirho)

        icon_path_chirho = "static/assets-chirho/icons-chirho/a-chirho.webp"
        cases_chirho = {
            "unknown scene version": lambda: self.worker_chirho["scenes_chirho"][0].update(
                variant_chirho="invented"
            ),
            "orphan reduced scene": lambda: self.worker_chirho["scenes_chirho"][0].update(
                variant_chirho="representation_reduced"
            ),
            "same image as reduced": lambda: self.worker_chirho["scenes_chirho"].append(
                {
                    **self.worker_chirho["scenes_chirho"][0],
                    "variant_chirho": "representation_reduced",
                }
            ),
            "unknown media array": lambda: self.worker_chirho.update(gallery_chirho=[{}]),
            "missing field": lambda: self.worker_chirho["icons_chirho"][0].pop("alt_chirho"),
            "chapter outside the book": worker_icon_chirho({"lesson_id_chirho": "Prov.32.1"}),
            "verse past the chapter": worker_icon_chirho({"lesson_id_chirho": "Prov.1.31"}),
            "unknown book": worker_icon_chirho({"lesson_id_chirho": "Invented.1.1"}),
            "two scenes for one verse": lambda: self.worker_chirho["scenes_chirho"].append(
                {
                    **self.worker_chirho["scenes_chirho"][0],
                    "asset_path_chirho": self.curated_scene_chirho,
                    "sha256_chirho": "d" * 64,
                }
            ),
            "repeated icon id": worker_icon_chirho({"id_chirho": "icon-greek"}),
            "two selected icons for one word": lambda: self.worker_chirho["icons_chirho"].append(
                icon_chirho(
                    "icon-b", "Prov.1.2", "20xAF", "/assets-chirho/icons-chirho/a-chirho.webp"
                )
            ),
            "one path with different facts": worker_icon_chirho(
                {
                    "sha256_chirho": "e" * 64,
                    "asset_path_chirho": "/assets-chirho/icons-chirho/greek-chirho.webp",
                }
            ),
            "icon over 128px": worker_icon_chirho({"width_chirho": 129}),
            "control character": worker_icon_chirho({"alt_chirho": "bell\u0007"}),
            "bidi override": worker_icon_chirho({"alt_chirho": "abc\u202edef"}),
            "local path": worker_icon_chirho(
                {"display_authority_chirho": "see /Users/someone/notes"}
            ),
            "evidence path": worker_icon_chirho({"evidence_refs_chirho": ["../secret"]}),
            "unreviewed sense": worker_icon_chirho({"sense_review_chirho": "unreviewed"}),
            "selection not boolean": worker_icon_chirho({"selected_chirho": "yes"}),
            "schema version": lambda: self.worker_chirho.update(schema_version_chirho=2),
            "Greek icon without its lexical form": lambda: self.worker_chirho["icons_chirho"][
                1
            ].pop("lexical_form_chirho"),
            "positional token for another verse": lambda: self.worker_chirho["icons_chirho"][
                1
            ].update(token_id_chirho="John.1.2!3"),
            "unsafe token id": worker_icon_chirho({"token_id_chirho": "../20xAF"}),
            "unknown OSHB particle": worker_icon_chirho({"lemma_id_chirho": "oshb:x"}),
            "malformed lemma id": worker_icon_chirho({"lemma_id_chirho": "oshb:bb"}),
            "zero Strong number": worker_icon_chirho({"lemma_id_chirho": "H0"}),
        }
        file_cases_chirho = {
            "missing WebP": lambda: (self.root_chirho / icon_path_chirho).unlink(),
            "WebP header size differs": write_file_chirho(icon_path_chirho, webp_chirho(64, 64)),
            "truncated WebP": write_file_chirho(icon_path_chirho, webp_chirho(128, 128)[:29]),
            "linked WebP": lambda: (
                (self.root_chirho / icon_path_chirho).unlink(),
                (self.root_chirho / icon_path_chirho).symlink_to(
                    self.root_chirho / "static/assets-chirho/icons-chirho/snow-chirho.webp"
                ),
            ),
            "manifest not JSON": write_file_chirho(
                "data-chirho/media-chirho/worker-chirho.json", b"{"
            ),
        }
        for label_chirho, mutate_chirho in [*cases_chirho.items(), *file_cases_chirho.items()]:
            with self.subTest(label_chirho):
                self.setUp()
                MODULE_CHIRHO.refresh_chirho(self.root_chirho)
                before_chirho = self.outputs_chirho()
                mutate_chirho()
                if label_chirho in cases_chirho:
                    self.write_inputs_chirho()
                with self.assertRaises(MODULE_CHIRHO.RefusalChirho):
                    MODULE_CHIRHO.refresh_chirho(self.root_chirho)
                self.assertEqual(self.outputs_chirho(), before_chirho)

    def test_oversized_shard_is_refused_before_writing(self):
        with (
            mock.patch.object(MODULE_CHIRHO, "SHARD_LIMIT_CHIRHO", 200),
            self.assertRaises(MODULE_CHIRHO.RefusalChirho),
        ):
            MODULE_CHIRHO.refresh_chirho(self.root_chirho)
        self.assertFalse((self.root_chirho / "static/media-chirho").exists())

    def test_stale_temporary_files_are_cleared(self):
        folder_chirho = self.root_chirho / "static/media-chirho/proverbs-chirho"
        folder_chirho.mkdir(parents=True)
        (folder_chirho / f"{MODULE_CHIRHO.TEMP_PREFIX_CHIRHO}crashed").write_bytes(b"partial")
        MODULE_CHIRHO.refresh_chirho(self.root_chirho)
        self.assertEqual(list(folder_chirho.glob(f"{MODULE_CHIRHO.TEMP_PREFIX_CHIRHO}*")), [])

    def test_watch_signature_follows_manifests_and_presentations(self):
        first_chirho = MODULE_CHIRHO.signature_chirho(self.root_chirho)
        self.worker_chirho["icons_chirho"][0]["alt_chirho"] = "changed"
        self.write_inputs_chirho()
        second_chirho = MODULE_CHIRHO.signature_chirho(self.root_chirho)
        self.assertNotEqual(first_chirho, second_chirho)
        self.write_json_chirho(
            "data-chirho/reader-chirho/proverbs-26-1-presentation-chirho.json",
            {
                "asset_path_chirho": self.curated_scene_chirho,
                "alt_chirho": "New alt.",
                "reading_note_chirho": "Note.",
            },
        )
        self.assertNotEqual(MODULE_CHIRHO.signature_chirho(self.root_chirho), second_chirho)

    def test_once_exit_codes(self):
        with (
            mock.patch.object(MODULE_CHIRHO, "ROOT_CHIRHO", self.root_chirho),
            contextlib.redirect_stdout(io.StringIO()),
        ):
            self.assertEqual(MODULE_CHIRHO.main_chirho(["--once"]), 0)
            self.worker_chirho["schema_version_chirho"] = 2
            self.write_inputs_chirho()
            self.assertEqual(MODULE_CHIRHO.main_chirho(["--once"]), 1)


if __name__ == "__main__":
    unittest.main()
