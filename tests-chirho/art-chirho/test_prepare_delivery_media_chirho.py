# For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life. — John 3:16 (KJV)
"""Delivery preparation tests using real cwebp and isolated synthetic source media."""

import fcntl
import hashlib
import importlib.util
import json
import tempfile
import unittest
from pathlib import Path
from unittest import mock

from PIL import Image, ImageDraw

ROOT_CHIRHO = Path(__file__).resolve().parents[2]
SPEC_CHIRHO = importlib.util.spec_from_file_location(
    "delivery_chirho", ROOT_CHIRHO / "scripts-chirho/art-chirho/prepare_delivery_media_chirho.py"
)
MODULE_CHIRHO = importlib.util.module_from_spec(SPEC_CHIRHO)
SPEC_CHIRHO.loader.exec_module(MODULE_CHIRHO)
COLLECT_CHIRHO = MODULE_CHIRHO.SHARDS_CHIRHO.collect_chirho


class DeliveryTestsChirho(unittest.TestCase):
    def setUp(self):
        self.temp_chirho = tempfile.TemporaryDirectory()
        self.addCleanup(self.temp_chirho.cleanup)
        self.root_chirho = Path(self.temp_chirho.name)
        self.static_chirho = self.root_chirho / "static"
        self.assets_chirho = self.static_chirho / "assets-chirho"
        self.assets_chirho.mkdir(parents=True)
        scene_chirho = Image.new("RGB", (1600, 800), (100, 140, 190))
        scene_chirho.save(self.assets_chirho / "scene-chirho.webp", lossless=True)
        icon_chirho = Image.new("RGBA", (128, 128), (0, 0, 0, 0))
        draw_chirho = ImageDraw.Draw(icon_chirho)
        draw_chirho.ellipse((20, 20, 108, 108), fill=(250, 80, 50, 143))
        icon_chirho.save(self.assets_chirho / "icon-chirho.webp", lossless=True, exact=True)
        self.records_chirho = {"scene": [], "icon": []}
        for kind_chirho, size_chirho in (("scene", (1600, 800)), ("icon", (128, 128))):
            path_chirho = self.assets_chirho / f"{kind_chirho}-chirho.webp"
            self.records_chirho[kind_chirho].append(
                (
                    ("John", 1, 1),
                    {
                        "asset_path_chirho": f"/assets-chirho/{kind_chirho}-chirho.webp",
                        "sha256_chirho": hashlib.sha256(path_chirho.read_bytes()).hexdigest(),
                        "width_chirho": size_chirho[0],
                        "height_chirho": size_chirho[1],
                    },
                )
            )
        self.collect_chirho = mock.patch.object(
            MODULE_CHIRHO.SHARDS_CHIRHO,
            "collect_chirho",
            side_effect=lambda _root_chirho, **_options_chirho: self.records_chirho,
        )
        self.collect_chirho.start()
        self.addCleanup(self.collect_chirho.stop)

    def prepare_chirho(self):
        return MODULE_CHIRHO.prepare_chirho(self.root_chirho)

    def test_derivatives_are_deterministic_and_sources_unchanged(self):
        originals_chirho = {
            path_chirho: path_chirho.read_bytes() for path_chirho in self.assets_chirho.iterdir()
        }
        first_chirho = self.prepare_chirho()
        with mock.patch.object(
            MODULE_CHIRHO.subprocess, "run", wraps=MODULE_CHIRHO.subprocess.run
        ) as subprocess_chirho:
            second_chirho = self.prepare_chirho()
        self.assertEqual(first_chirho, second_chirho)
        self.assertEqual(
            [
                call_chirho
                for call_chirho in subprocess_chirho.call_args_list
                if call_chirho.args[0][0] == "cwebp"
            ],
            [],
        )
        self.assertEqual(
            {path_chirho: path_chirho.read_bytes() for path_chirho in self.assets_chirho.iterdir()},
            originals_chirho,
        )
        by_kind_chirho = {
            row_chirho["kind_chirho"]: row_chirho for row_chirho in first_chirho["entries_chirho"]
        }
        self.assertEqual(
            (by_kind_chirho["scene"]["width_chirho"], by_kind_chirho["scene"]["height_chirho"]),
            (1200, 600),
        )
        self.assertEqual(
            (by_kind_chirho["icon"]["width_chirho"], by_kind_chirho["icon"]["height_chirho"]),
            (128, 128),
        )
        self.assertEqual(by_kind_chirho["scene"]["recipe_chirho"]["quality_chirho"], 78)
        self.assertEqual(by_kind_chirho["icon"]["recipe_chirho"]["quality_chirho"], 80)
        self.assertEqual(
            by_kind_chirho["icon"]["recipe_chirho"]["cwebp_version_chirho"],
            first_chirho["encoder_chirho"]["version_chirho"],
        )
        output_chirho = self.root_chirho / MODULE_CHIRHO.DELIVERY_CHIRHO
        with (
            Image.open(self.assets_chirho / "icon-chirho.webp") as original_chirho,
            Image.open(
                output_chirho / by_kind_chirho["icon"]["delivery_path_chirho"]
            ) as result_chirho,
        ):
            self.assertEqual(
                original_chirho.convert("RGBA").getchannel("A").tobytes(),
                result_chirho.convert("RGBA").getchannel("A").tobytes(),
            )

    def test_tampered_cached_object_refuses_and_keeps_mapping(self):
        first_chirho = self.prepare_chirho()
        output_chirho = self.root_chirho / MODULE_CHIRHO.DELIVERY_CHIRHO
        mapping_chirho = output_chirho / "mapping-chirho.json"
        before_chirho = mapping_chirho.read_bytes()
        (output_chirho / first_chirho["entries_chirho"][0]["delivery_path_chirho"]).write_bytes(
            b"tampered"
        )
        with self.assertRaises(ValueError):
            self.prepare_chirho()
        self.assertEqual(mapping_chirho.read_bytes(), before_chirho)

    def test_only_new_source_is_encoded(self):
        self.prepare_chirho()
        path_chirho = self.assets_chirho / "new-chirho.webp"
        Image.new("RGBA", (128, 128), (80, 40, 180, 120)).save(path_chirho, lossless=True)
        record_chirho = {
            "asset_path_chirho": "/assets-chirho/new-chirho.webp",
            "sha256_chirho": hashlib.sha256(path_chirho.read_bytes()).hexdigest(),
            "width_chirho": 128,
            "height_chirho": 128,
        }
        self.records_chirho["icon"].append((("John", 1, 2), record_chirho))
        with mock.patch.object(
            MODULE_CHIRHO.subprocess, "run", wraps=MODULE_CHIRHO.subprocess.run
        ) as subprocess_chirho:
            result_chirho = self.prepare_chirho()
        cwebp_calls_chirho = [
            call_chirho
            for call_chirho in subprocess_chirho.call_args_list
            if call_chirho.args[0][0] == "cwebp"
        ]
        self.assertEqual(len(cwebp_calls_chirho), 1)
        self.assertEqual(len(result_chirho["entries_chirho"]), 3)

    def test_tampered_recipe_refuses(self):
        self.prepare_chirho()
        path_chirho = self.root_chirho / MODULE_CHIRHO.DELIVERY_CHIRHO / "mapping-chirho.json"
        mapping_chirho = json.loads(path_chirho.read_text())
        mapping_chirho["entries_chirho"][0]["recipe_chirho"]["quality_chirho"] = 1
        path_chirho.write_text(json.dumps(mapping_chirho))
        with self.assertRaises(ValueError):
            self.prepare_chirho()

    def test_changed_encoder_requires_explicit_cache_retirement(self):
        self.prepare_chirho()
        path_chirho = self.root_chirho / MODULE_CHIRHO.DELIVERY_CHIRHO / "mapping-chirho.json"
        mapping_chirho = json.loads(path_chirho.read_text())
        mapping_chirho["encoder_chirho"]["executable_sha256_chirho"] = "0" * 64
        path_chirho.write_text(json.dumps(mapping_chirho))
        with self.assertRaises(ValueError):
            self.prepare_chirho()

    def test_source_checksum_and_dimensions_refuse(self):
        self.records_chirho["icon"][0][1]["sha256_chirho"] = "0" * 64
        with self.assertRaises(ValueError):
            self.prepare_chirho()
        self.records_chirho["icon"][0][1]["sha256_chirho"] = hashlib.sha256(
            (self.assets_chirho / "icon-chirho.webp").read_bytes()
        ).hexdigest()
        self.records_chirho["icon"][0][1]["width_chirho"] = 127
        with self.assertRaises(ValueError):
            self.prepare_chirho()

    def test_path_escape_is_rejected(self):
        outside_chirho = self.root_chirho / "outside-chirho.webp"
        outside_chirho.write_bytes((self.assets_chirho / "icon-chirho.webp").read_bytes())
        (self.assets_chirho / "icon-chirho.webp").unlink()
        (self.assets_chirho / "icon-chirho.webp").symlink_to(outside_chirho)
        with self.assertRaises(ValueError):
            self.prepare_chirho()

    def test_symlinked_build_directory_is_rejected_before_writing(self):
        other_chirho = self.root_chirho / "other-chirho"
        other_chirho.mkdir()
        (self.root_chirho / "build-chirho").symlink_to(other_chirho)
        with self.assertRaises(ValueError):
            self.prepare_chirho()
        self.assertEqual(list(other_chirho.iterdir()), [])

    def test_static_root_cannot_point_outside_workspace(self):
        with tempfile.TemporaryDirectory() as outside_chirho:
            moved_chirho = Path(outside_chirho) / "static-chirho"
            self.static_chirho.rename(moved_chirho)
            self.static_chirho.symlink_to(moved_chirho)
            with self.assertRaises(ValueError):
                self.prepare_chirho()

    def test_lock_refuses_second_writer(self):
        output_chirho = self.root_chirho / MODULE_CHIRHO.DELIVERY_CHIRHO
        output_chirho.mkdir(parents=True)
        with (output_chirho / "worker.lock").open("a") as lock_chirho:
            fcntl.flock(lock_chirho, fcntl.LOCK_EX | fcntl.LOCK_NB)
            with self.assertRaises(RuntimeError):
                self.prepare_chirho()

    def test_failed_manifest_does_not_replace_last_good_mapping(self):
        self.prepare_chirho()
        path_chirho = self.root_chirho / MODULE_CHIRHO.DELIVERY_CHIRHO / "mapping-chirho.json"
        before_chirho = path_chirho.read_bytes()
        self.records_chirho["scene"][0][1]["sha256_chirho"] = "0" * 64
        with self.assertRaises(ValueError):
            self.prepare_chirho()
        self.assertEqual(path_chirho.read_bytes(), before_chirho)

    def test_resume_after_mapping_write_failure(self):
        with (
            mock.patch.object(
                MODULE_CHIRHO, "atomic_json_chirho", side_effect=OSError("interrupted")
            ),
            self.assertRaises(OSError),
        ):
            self.prepare_chirho()
        output_chirho = self.root_chirho / MODULE_CHIRHO.DELIVERY_CHIRHO
        self.assertFalse((output_chirho / "mapping-chirho.json").exists())
        recovered_chirho = self.prepare_chirho()
        self.assertEqual(len(recovered_chirho["entries_chirho"]), 2)
        self.assertTrue((output_chirho / "mapping-chirho.json").is_file())

    def test_changed_source_identity_in_cached_mapping_refuses(self):
        self.prepare_chirho()
        path_chirho = self.root_chirho / MODULE_CHIRHO.DELIVERY_CHIRHO / "mapping-chirho.json"
        mapping_chirho = json.loads(path_chirho.read_text())
        mapping_chirho["entries_chirho"][0]["source_sha256_chirho"] = "0" * 64
        path_chirho.write_text(json.dumps(mapping_chirho))
        with self.assertRaises(ValueError):
            self.prepare_chirho()

    def test_actual_shard_manifest_and_asset_contract(self):
        scene_chirho = self.records_chirho["scene"][0][1]
        icon_chirho = self.records_chirho["icon"][0][1]
        document_chirho = {
            "schema_version_chirho": 1,
            "scenes_chirho": [
                {
                    **scene_chirho,
                    "lesson_id_chirho": "John.1.1",
                    "alt_chirho": "Scene",
                    "art_review_chirho": "pending",
                    "reading_note_chirho": "Imaginative",
                }
            ],
            "icons_chirho": [
                {
                    **icon_chirho,
                    "id_chirho": "icon-test-chirho",
                    "lesson_id_chirho": "John.1.1",
                    "token_id_chirho": "John.1.1!1",
                    "lemma_id_chirho": "G518",
                    "lemma_augment_chirho": None,
                    "lexical_form_chirho": "ἀγγέλλω",
                    "sense_id_chirho": "sense-test-chirho",
                    "contextual_meaning_chirho": "announce",
                    "alt_chirho": "subject",
                    "sense_review_chirho": "agent_reviewed",
                    "art_review_chirho": "pending",
                    "evidence_refs_chirho": ["nestle1904-morph-chirho"],
                    "display_authority_chirho": "Pending artwork",
                    "selected_chirho": True,
                }
            ],
        }
        media_chirho = self.root_chirho / "data-chirho/media-chirho"
        media_chirho.mkdir(parents=True)
        (media_chirho / "test-chirho.json").write_text(
            json.dumps(document_chirho, ensure_ascii=False)
        )
        with mock.patch.object(MODULE_CHIRHO.SHARDS_CHIRHO, "collect_chirho", wraps=COLLECT_CHIRHO):
            output_chirho = self.prepare_chirho()
        self.assertEqual(len(output_chirho["entries_chirho"]), 2)

    def test_removed_source_refuses_cached_reuse(self):
        self.prepare_chirho()
        self.records_chirho["scene"] = []
        with self.assertRaises(ValueError):
            self.prepare_chirho()

    def test_quality_upgrade_keeps_fallback_in_delivery_mapping_chirho(self):
        base_chirho = self.records_chirho["scene"][0][1]
        fallback_chirho = {
            **base_chirho,
            "lesson_id_chirho": "John.1.1",
            "art_review_chirho": "pending",
            "alt_chirho": "Economy trial.",
            "reading_note_chirho": "Imaginative scene.",
            "fallback_chirho": True,
        }
        folder_chirho = self.root_chirho / "data-chirho/media-chirho"
        folder_chirho.mkdir(parents=True)
        manifest_chirho = folder_chirho / "scenes-chirho.json"
        manifest_chirho.write_text(
            json.dumps({"schema_version_chirho": 1, "scenes_chirho": [fallback_chirho]})
        )
        with mock.patch.object(MODULE_CHIRHO.SHARDS_CHIRHO, "collect_chirho", wraps=COLLECT_CHIRHO):
            first_chirho = self.prepare_chirho()
            primary_path_chirho = self.assets_chirho / "primary-chirho.webp"
            Image.new("RGB", (1600, 800), (220, 120, 70)).save(primary_path_chirho, lossless=True)
            primary_chirho = {
                **fallback_chirho,
                "fallback_chirho": False,
                "asset_path_chirho": "/assets-chirho/primary-chirho.webp",
                "sha256_chirho": hashlib.sha256(primary_path_chirho.read_bytes()).hexdigest(),
            }
            manifest_chirho.write_text(
                json.dumps(
                    {"schema_version_chirho": 1, "scenes_chirho": [fallback_chirho, primary_chirho]}
                )
            )
            second_chirho = self.prepare_chirho()
        self.assertEqual(len(second_chirho["entries_chirho"]), 2)
        fallback_entry_chirho = next(
            row_chirho
            for row_chirho in second_chirho["entries_chirho"]
            if fallback_chirho["asset_path_chirho"] in row_chirho["source_paths_chirho"]
        )
        self.assertEqual(first_chirho["entries_chirho"][0], fallback_entry_chirho)
        public_chirho = COLLECT_CHIRHO(self.root_chirho)
        self.assertEqual(len(public_chirho["scene"]), 1)
        self.assertEqual(
            public_chirho["scene"][0][1]["asset_path_chirho"], primary_chirho["asset_path_chirho"]
        )

    def test_unlisted_request_is_refused(self):
        with self.assertRaises(ValueError):
            MODULE_CHIRHO.prepare_chirho(self.root_chirho, ["/assets-chirho/unknown-chirho.webp"])

    def test_manifest_change_during_encoding_refuses_mapping_commit(self):
        changed_chirho = {
            "scene": [],
            "icon": list(self.records_chirho["icon"]),
        }
        with (
            mock.patch.object(
                MODULE_CHIRHO.SHARDS_CHIRHO,
                "collect_chirho",
                side_effect=[self.records_chirho, changed_chirho],
            ),
            self.assertRaises(ValueError),
        ):
            self.prepare_chirho()
        path_chirho = self.root_chirho / MODULE_CHIRHO.DELIVERY_CHIRHO / "mapping-chirho.json"
        self.assertFalse(path_chirho.exists())

    def test_append_only_manifest_growth_is_included(self):
        original_chirho = self.assets_chirho / "icon-chirho.webp"
        alias_chirho = self.assets_chirho / "alias-chirho.webp"
        alias_chirho.write_bytes(original_chirho.read_bytes())
        alias_record_chirho = {
            **self.records_chirho["icon"][0][1],
            "asset_path_chirho": "/assets-chirho/alias-chirho.webp",
        }
        grown_chirho = {
            "scene": list(self.records_chirho["scene"]),
            "icon": list(self.records_chirho["icon"]) + [(("John", 1, 2), alias_record_chirho)],
        }
        with mock.patch.object(
            MODULE_CHIRHO.SHARDS_CHIRHO,
            "collect_chirho",
            side_effect=[
                self.records_chirho,
                grown_chirho,
                grown_chirho,
                grown_chirho,
                grown_chirho,
                grown_chirho,
            ],
        ):
            result_chirho = self.prepare_chirho()
        icon_chirho = next(
            row_chirho
            for row_chirho in result_chirho["entries_chirho"]
            if row_chirho["kind_chirho"] == "icon"
        )
        self.assertEqual(
            set(icon_chirho["source_paths_chirho"]),
            {"/assets-chirho/icon-chirho.webp", "/assets-chirho/alias-chirho.webp"},
        )

    def test_manifest_change_during_final_source_check_is_rejected(self):
        changed_chirho = {"scene": [], "icon": list(self.records_chirho["icon"])}
        with (
            mock.patch.object(
                MODULE_CHIRHO.SHARDS_CHIRHO,
                "collect_chirho",
                side_effect=[
                    self.records_chirho,
                    self.records_chirho,
                    self.records_chirho,
                    changed_chirho,
                ],
            ),
            self.assertRaises(ValueError),
        ):
            self.prepare_chirho()
        path_chirho = self.root_chirho / MODULE_CHIRHO.DELIVERY_CHIRHO / "mapping-chirho.json"
        self.assertFalse(path_chirho.exists())

    def test_append_during_final_source_verification_is_caught_up(self):
        original_chirho = self.assets_chirho / "icon-chirho.webp"
        alias_chirho = self.assets_chirho / "alias-chirho.webp"
        alias_chirho.write_bytes(original_chirho.read_bytes())
        grown_chirho = {
            "scene": list(self.records_chirho["scene"]),
            "icon": list(self.records_chirho["icon"])
            + [
                (
                    ("John", 1, 2),
                    {
                        **self.records_chirho["icon"][0][1],
                        "asset_path_chirho": "/assets-chirho/alias-chirho.webp",
                    },
                )
            ],
        }
        with mock.patch.object(
            MODULE_CHIRHO.SHARDS_CHIRHO,
            "collect_chirho",
            side_effect=[
                self.records_chirho,
                self.records_chirho,
                grown_chirho,
                grown_chirho,
                grown_chirho,
                grown_chirho,
            ],
        ):
            result_chirho = self.prepare_chirho()
        icon_chirho = next(
            row_chirho
            for row_chirho in result_chirho["entries_chirho"]
            if row_chirho["kind_chirho"] == "icon"
        )
        self.assertIn("/assets-chirho/alias-chirho.webp", icon_chirho["source_paths_chirho"])

    def test_source_bytes_changed_after_encoding_refuse_commit(self):
        encode_chirho = MODULE_CHIRHO.encode_chirho

        def mutate_chirho(*arguments_chirho):
            result_chirho = encode_chirho(*arguments_chirho)
            if arguments_chirho[2] == "icon":
                (self.assets_chirho / "scene-chirho.webp").write_bytes(b"changed original")
            return result_chirho

        with (
            mock.patch.object(MODULE_CHIRHO, "encode_chirho", side_effect=mutate_chirho),
            self.assertRaisesRegex(ValueError, "Source checksum mismatch"),
        ):
            self.prepare_chirho()
        self.assertFalse(
            (self.root_chirho / MODULE_CHIRHO.DELIVERY_CHIRHO / "mapping-chirho.json").exists()
        )


if __name__ == "__main__":
    unittest.main()
