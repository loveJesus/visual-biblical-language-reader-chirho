# For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life. — John 3:16 (KJV)
"""Hermetic source/alias tests; fake archive metadata is not remote or visual evidence."""

import copy as copy_chirho
import hashlib as hashlib_chirho
import importlib.util as importlib_util_chirho
import json as json_chirho
import shutil as shutil_chirho
import tempfile as tempfile_chirho
import unittest as unittest_chirho
from pathlib import Path as PathChirho
from unittest.mock import patch as patch_chirho

ROOT_CHIRHO = PathChirho(__file__).resolve().parents[2]


def module_chirho(name_chirho, relative_chirho):
    spec_chirho = importlib_util_chirho.spec_from_file_location(
        name_chirho, ROOT_CHIRHO / relative_chirho
    )
    result_chirho = importlib_util_chirho.module_from_spec(spec_chirho)
    spec_chirho.loader.exec_module(result_chirho)
    return result_chirho


CORRECTIONS_CHIRHO = module_chirho(
    "scene_corrections_test_chirho",
    "scripts-chirho/art-chirho/recovery-chirho/scene_corrections_chirho.py",
)
SHARDS_CHIRHO = module_chirho(
    "correction_shards_test_chirho",
    "scripts-chirho/art-chirho/refresh_sharded_media_chirho.py",
)
DELIVERY_CHIRHO = module_chirho(
    "correction_delivery_test_chirho",
    "scripts-chirho/art-chirho/prepare_delivery_media_chirho.py",
)


class SceneCorrectionsTestsChirho(unittest_chirho.TestCase):
    def setUp(self):
        self.temporary_chirho = tempfile_chirho.TemporaryDirectory(
            prefix="scene-corrections-chirho-"
        )
        self.addCleanup(self.temporary_chirho.cleanup)
        self.root_chirho = PathChirho(self.temporary_chirho.name)
        self.fixture_chirho = json_chirho.loads(
            (
                ROOT_CHIRHO
                / "tests-chirho/fixtures-chirho/art-chirho/scene-corrections-chirho.json"
            ).read_bytes()
        )
        self.row_chirho = self.fixture_chirho["catalogue_chirho"]["corrections_chirho"][
            0
        ]
        for document_chirho in self.fixture_chirho["documents_chirho"]:
            self.write_chirho(
                "data-chirho/media-chirho/" + document_chirho["name_chirho"],
                document_chirho["document_chirho"],
            )
        self.write_chirho(
            CORRECTIONS_CHIRHO.CATALOGUE_CHIRHO, self.fixture_chirho["catalogue_chirho"]
        )
        source_chirho = self.root_chirho / (
            "static" + self.row_chirho["content_path_chirho"]
        )
        source_chirho.parent.mkdir(parents=True, exist_ok=True)
        source_chirho.write_text(self.fixture_chirho["chapter_text_chirho"])
        self.write_chirho(
            str(
                source_chirho.parent.relative_to(self.root_chirho)
                / "manifest-chirho.json"
            ),
            {
                "book_id_chirho": "1Cor",
                "chapters_chirho": [
                    {
                        "number_chirho": 1,
                        "verse_count_chirho": 1,
                        "path_chirho": self.row_chirho["content_path_chirho"],
                        "sha256_chirho": self.row_chirho["content_sha256_chirho"],
                    }
                ],
            },
        )
        self.write_archive_chirho()

    def write_archive_chirho(self):
        groups_chirho = {}
        for entry_chirho in self.fixture_chirho["archive_entries_chirho"]:
            groups_chirho.setdefault(
                entry_chirho["source_chirho"]["sha256_chirho"][:2], []
            ).append(entry_chirho)
        shards_chirho = []
        for prefix_chirho, entries_chirho in groups_chirho.items():
            path_chirho = f"objects-chirho/{prefix_chirho}-chirho.json"
            bytes_chirho = self.write_chirho(
                "data-chirho/delivery-chirho/artwork-chirho/" + path_chirho,
                {"schema_version_chirho": 1, "entries_chirho": entries_chirho},
            )
            shards_chirho.append(
                {
                    "path_chirho": path_chirho,
                    "entries_chirho": len(entries_chirho),
                    "sha256_chirho": hashlib_chirho.sha256(bytes_chirho).hexdigest(),
                }
            )
        self.write_chirho(
            "data-chirho/delivery-chirho/artwork-chirho/index-chirho.json",
            {
                "schema_version_chirho": 1,
                "bucket_chirho": "hinneh-media-chirho",
                "entry_count_chirho": len(
                    self.fixture_chirho["archive_entries_chirho"]
                ),
                "shards_chirho": shards_chirho,
            },
        )

    def write_chirho(self, relative_chirho, value_chirho):
        path_chirho = self.root_chirho / relative_chirho
        path_chirho.parent.mkdir(parents=True, exist_ok=True)
        bytes_chirho = (
            json_chirho.dumps(value_chirho, ensure_ascii=False, indent=2) + "\n"
        ).encode()
        path_chirho.write_bytes(bytes_chirho)
        return bytes_chirho

    def test_effective_shards_and_archive_sources_are_distinct_chirho(self):
        before_chirho = (
            self.root_chirho / self.row_chirho["target_document_chirho"]
        ).read_bytes()
        result_chirho = SHARDS_CHIRHO.collect_chirho(self.root_chirho)
        paths_chirho = {
            row_chirho["asset_path_chirho"] for _, row_chirho in result_chirho["scene"]
        }
        self.assertIn(
            self.row_chirho["replacement_record_chirho"]["asset_path_chirho"],
            paths_chirho,
        )
        self.assertNotIn(
            self.row_chirho["base_record_chirho"]["asset_path_chirho"], paths_chirho
        )
        archive_chirho = SHARDS_CHIRHO.collect_chirho(
            self.root_chirho,
            include_fallbacks_chirho=True,
            include_correction_sources_chirho=True,
        )
        archived_paths_chirho = {
            row_chirho["asset_path_chirho"] for _, row_chirho in archive_chirho["scene"]
        }
        self.assertTrue(paths_chirho <= archived_paths_chirho)
        self.assertIn(
            self.row_chirho["base_record_chirho"]["asset_path_chirho"],
            archived_paths_chirho,
        )
        self.assertIn(
            self.fixture_chirho["documents_chirho"][1]["document_chirho"][
                "scenes_chirho"
            ][0]["asset_path_chirho"],
            archived_paths_chirho,
        )
        self.assertEqual(
            (self.root_chirho / self.row_chirho["target_document_chirho"]).read_bytes(),
            before_chirho,
        )

    def test_delivery_preparation_retains_every_cached_alias_without_encoding_chirho(
        self,
    ):
        executable_chirho = shutil_chirho.which("cwebp")
        self.assertIsNotNone(executable_chirho)
        version_chirho = "fixture-v1-chirho"
        recipe_chirho = DELIVERY_CHIRHO.recipe_chirho("scene", version_chirho)
        rows_chirho = []
        for entry_chirho in self.fixture_chirho["archive_entries_chirho"]:
            entry_chirho["recipe_chirho"] = recipe_chirho
            delivery_chirho = entry_chirho["delivery_chirho"]
            sha_chirho = delivery_chirho["sha256_chirho"]
            rows_chirho.append(
                {
                    "kind_chirho": "scene",
                    "source_sha256_chirho": entry_chirho["source_chirho"][
                        "sha256_chirho"
                    ],
                    "source_paths_chirho": entry_chirho["source_paths_chirho"],
                    "recipe_chirho": recipe_chirho,
                    "delivery_sha256_chirho": sha_chirho,
                    "delivery_path_chirho": f"objects-chirho/{sha_chirho[:2]}-chirho/{sha_chirho}-chirho.webp",
                    "bytes_chirho": delivery_chirho["bytes_chirho"],
                    "width_chirho": delivery_chirho["width_chirho"],
                    "height_chirho": delivery_chirho["height_chirho"],
                }
            )
        self.write_archive_chirho()
        self.write_chirho(
            "build-chirho/delivery-media-chirho/mapping-chirho.json",
            {
                "schema_version_chirho": 1,
                "encoder_chirho": {
                    "name_chirho": "cwebp",
                    "version_chirho": version_chirho,
                    "executable_sha256_chirho": hashlib_chirho.sha256(
                        PathChirho(executable_chirho).read_bytes()
                    ).hexdigest(),
                },
                "entries_chirho": rows_chirho,
            },
        )
        with patch_chirho.object(
            DELIVERY_CHIRHO,
            "encode_chirho",
            side_effect=AssertionError("no fixture encoding authorized"),
        ) as encoder_chirho:
            result_chirho = DELIVERY_CHIRHO.prepare_chirho(self.root_chirho)
        encoder_chirho.assert_not_called()
        self.assertEqual(
            {
                row_chirho["source_sha256_chirho"]: row_chirho
                for row_chirho in result_chirho["entries_chirho"]
            },
            {
                row_chirho["source_sha256_chirho"]: row_chirho
                for row_chirho in rows_chirho
            },
        )

    def test_exact_materialized_replay_preserves_old_delivery_alias_chirho(self):
        document_chirho = self.fixture_chirho["documents_chirho"][0]["document_chirho"]
        replacement_chirho = copy_chirho.deepcopy(
            self.row_chirho["replacement_record_chirho"]
        )
        replacement_chirho.update(
            {
                key_chirho: self.fixture_chirho["archive_entries_chirho"][1][
                    "delivery_chirho"
                ][key_chirho]
                for key_chirho in ("sha256_chirho", "width_chirho", "height_chirho")
            }
        )
        document_chirho["scenes_chirho"][0] = replacement_chirho
        self.write_chirho(self.row_chirho["target_document_chirho"], document_chirho)
        first_chirho = CORRECTIONS_CHIRHO.read_effective_media_documents_chirho(
            self.root_chirho
        )
        self.assertEqual(
            first_chirho,
            CORRECTIONS_CHIRHO.read_effective_media_documents_chirho(self.root_chirho),
        )
        self.assertEqual(
            first_chirho["retained_aliases_chirho"][0]["sha256_chirho"],
            self.fixture_chirho["archive_entries_chirho"][0]["delivery_chirho"][
                "sha256_chirho"
            ],
        )
        replacement_chirho["width_chirho"] += 1
        self.write_chirho(self.row_chirho["target_document_chirho"], document_chirho)
        with self.assertRaises(ValueError):
            CORRECTIONS_CHIRHO.read_effective_media_documents_chirho(self.root_chirho)

    def test_linked_correction_is_refused_chirho(self):
        outside_chirho = self.root_chirho / "outside-catalogue-chirho.json"
        outside_chirho.write_text(
            json_chirho.dumps(self.fixture_chirho["catalogue_chirho"])
        )
        path_chirho = self.root_chirho / CORRECTIONS_CHIRHO.CATALOGUE_CHIRHO
        path_chirho.unlink()
        path_chirho.symlink_to(outside_chirho)
        with self.assertRaises(ValueError):
            CORRECTIONS_CHIRHO.read_effective_media_documents_chirho(self.root_chirho)

    def test_overlay_only_change_triggers_existing_watcher_chirho(self):
        before_chirho = SHARDS_CHIRHO.signature_chirho(self.root_chirho)
        path_chirho = self.root_chirho / CORRECTIONS_CHIRHO.CATALOGUE_CHIRHO
        path_chirho.write_bytes(path_chirho.read_bytes() + b" ")
        self.assertNotEqual(
            before_chirho, SHARDS_CHIRHO.signature_chirho(self.root_chirho)
        )

    def test_source_or_base_drift_refuses_before_shard_outputs_chirho(self):
        document_chirho = self.fixture_chirho["documents_chirho"][0]["document_chirho"]
        document_chirho["scenes_chirho"][0]["alt_chirho"] += " changed"
        self.write_chirho(self.row_chirho["target_document_chirho"], document_chirho)
        with self.assertRaises(ValueError):
            SHARDS_CHIRHO.collect_chirho(self.root_chirho)
        self.assertFalse((self.root_chirho / "static/media-chirho").exists())

    def test_duplicate_chain_and_foreign_scope_are_refused_chirho(self):
        catalogue_chirho = copy_chirho.deepcopy(self.fixture_chirho["catalogue_chirho"])
        catalogue_chirho["corrections_chirho"].append(
            copy_chirho.deepcopy(self.row_chirho)
        )
        with self.assertRaises(ValueError):
            CORRECTIONS_CHIRHO.parse_chirho(
                json_chirho.dumps(catalogue_chirho).encode()
            )
        foreign_chirho = copy_chirho.deepcopy(self.fixture_chirho["catalogue_chirho"])
        foreign_chirho["corrections_chirho"][0]["target_document_chirho"] = (
            "../outside-chirho.json"
        )
        with self.assertRaises(ValueError):
            CORRECTIONS_CHIRHO.parse_chirho(json_chirho.dumps(foreign_chirho).encode())
        chain_chirho = copy_chirho.deepcopy(self.row_chirho)
        chain_chirho["id_chirho"] = "second-correction-chirho"
        chain_chirho["lesson_id_chirho"] = "Gen.1.1"
        chain_chirho["base_record_chirho"] = copy_chirho.deepcopy(
            self.row_chirho["replacement_record_chirho"]
        )
        chain_chirho["base_record_chirho"]["lesson_id_chirho"] = "Gen.1.1"
        chain_chirho["base_record_sha256_chirho"] = CORRECTIONS_CHIRHO.digest_chirho(
            chain_chirho["base_record_chirho"]
        )
        chain_chirho["replacement_record_chirho"] = copy_chirho.deepcopy(
            chain_chirho["base_record_chirho"]
        )
        chain_chirho["replacement_record_chirho"].update(
            asset_path_chirho="/assets-chirho/scenes-chirho/third-chirho.webp",
            sha256_chirho="c" * 64,
        )
        with self.assertRaisesRegex(ValueError, "chains"):
            CORRECTIONS_CHIRHO.parse_chirho(
                json_chirho.dumps(
                    {
                        "schema_version_chirho": 1,
                        "corrections_chirho": [self.row_chirho, chain_chirho],
                    }
                ).encode()
            )


if __name__ == "__main__":
    unittest_chirho.main()
