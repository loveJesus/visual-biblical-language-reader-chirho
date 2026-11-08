# For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life. — John 3:16 (KJV)
"""Canonical/reference boundaries and immutable attempt copies, without image generation."""

import hashlib as hashlib_chirho
import importlib.util as util_chirho
import json as json_chirho
import tempfile as tempfile_chirho
import unittest as unittest_chirho
from pathlib import Path as PathChirho
from unittest import mock as mock_chirho

ROOT_CHIRHO = PathChirho(__file__).resolve().parents[3]
SPEC_CHIRHO = util_chirho.spec_from_file_location(
    "continuity_pack_chirho",
    ROOT_CHIRHO
    / "scripts-chirho/art-chirho/continuity-chirho/reference_pack_chirho.py",
)
MODULE_CHIRHO = util_chirho.module_from_spec(SPEC_CHIRHO)
SPEC_CHIRHO.loader.exec_module(MODULE_CHIRHO)


class ContinuityTestsChirho(unittest_chirho.TestCase):
    def setUp(self_chirho):
        temporary_chirho = tempfile_chirho.TemporaryDirectory()
        self_chirho.addCleanup(temporary_chirho.cleanup)
        self_chirho.root_chirho = PathChirho(temporary_chirho.name).resolve()
        data_chirho = self_chirho.root_chirho / "data-chirho/art-direction-chirho"
        data_chirho.mkdir(parents=True)
        self_chirho.chapter_path_chirho = (
            self_chirho.root_chirho
            / "static/content-chirho/proverbs-chirho/chapter-07-chirho.json"
        )
        self_chirho.chapter_path_chirho.parent.mkdir(parents=True)
        self_chirho.chapter_path_chirho.write_text(
            json_chirho.dumps(
                {
                    "verses_chirho": [
                        {
                            "id_chirho": "Prov.7.6",
                            "canonical_text_chirho": "source six",
                        },
                        {
                            "id_chirho": "Prov.7.7",
                            "canonical_text_chirho": "source seven",
                        },
                        {
                            "id_chirho": "Prov.7.10",
                            "canonical_text_chirho": "source ten",
                        },
                    ]
                }
            )
        )
        self_chirho.image_path_chirho = (
            self_chirho.root_chirho / "reference-chirho.webp"
        )
        self_chirho.image_path_chirho.write_bytes(b"exact-reference-fixture-chirho")
        source_chirho = {
            "source_path_chirho": "static/content-chirho/proverbs-chirho/chapter-07-chirho.json",
            "source_sha256_chirho": hashlib_chirho.sha256(
                self_chirho.chapter_path_chirho.read_bytes()
            ).hexdigest(),
        }
        registry_chirho = {
            "references_chirho": [
                {
                    "id_chirho": "watcher-chirho",
                    "path_chirho": "reference-chirho.webp",
                    "sha256_chirho": hashlib_chirho.sha256(
                        self_chirho.image_path_chirho.read_bytes()
                    ).hexdigest(),
                    "use_chirho": "agent-selected-reference",
                }
            ]
        }
        map_chirho = {
            "chapters_chirho": [{"chapter_chirho": 7, **source_chirho}],
            "units_chirho": [
                {
                    "start_chirho": "Prov.7.6",
                    "end_chirho": "Prov.7.7",
                    "unit_id_chirho": "watching-chirho",
                },
                {
                    "start_chirho": "Prov.7.10",
                    "end_chirho": "Prov.7.10",
                    "unit_id_chirho": "encounter-chirho",
                },
            ],
        }
        units_path_chirho = self_chirho.root_chirho / "units-chirho.json"
        units_path_chirho.write_text(
            json_chirho.dumps({"units_chirho": map_chirho.pop("units_chirho")})
        )
        map_chirho["chapters_chirho"][0].update(
            {
                "units_path_chirho": "units-chirho.json",
                "units_sha256_chirho": hashlib_chirho.sha256(
                    units_path_chirho.read_bytes()
                ).hexdigest(),
            }
        )
        episodes_chirho = {
            "episodes_chirho": [
                {
                    "verse_ids_chirho": ["Prov.7.6", "Prov.7.7", "Prov.7.10"],
                    "source_chirho": source_chirho,
                    "setting_reference_ids_chirho": [],
                    "roles_chirho": [
                        {
                            "role_chirho": "observer-chirho",
                            "reference_id_chirho": "watcher-chirho",
                            "applicable_verses_chirho": ["Prov.7.6", "Prov.7.7"],
                        }
                    ],
                }
            ]
        }
        for name_chirho, value_chirho in [
            ("registry-chirho", registry_chirho),
            ("proverbs-pericopes-chirho", map_chirho),
            ("episodes-chirho", episodes_chirho),
        ]:
            (data_chirho / f"{name_chirho}.json").write_text(
                json_chirho.dumps(value_chirho)
            )

    def test_same_observer_and_absent_role_chirho(self_chirho):
        six_chirho = MODULE_CHIRHO.build_pack_chirho(
            self_chirho.root_chirho, "Prov.7.6"
        )
        seven_chirho = MODULE_CHIRHO.build_pack_chirho(
            self_chirho.root_chirho, "Prov.7.7"
        )
        ten_chirho = MODULE_CHIRHO.build_pack_chirho(
            self_chirho.root_chirho, "Prov.7.10"
        )
        self_chirho.assertEqual(
            six_chirho["references_chirho"], seven_chirho["references_chirho"]
        )
        self_chirho.assertEqual(ten_chirho["active_roles_chirho"], [])
        self_chirho.assertEqual(ten_chirho["references_chirho"], [])
        self_chirho.assertIsNone(
            MODULE_CHIRHO.build_pack_chirho(self_chirho.root_chirho, "Matt.1.1")
        )

    def test_source_or_reference_change_refuses_chirho(self_chirho):
        original_chirho = self_chirho.image_path_chirho.read_bytes()
        self_chirho.image_path_chirho.write_bytes(b"different")
        with self_chirho.assertRaisesRegex(ValueError, "Reference image changed"):
            MODULE_CHIRHO.build_pack_chirho(self_chirho.root_chirho, "Prov.7.6")
        self_chirho.image_path_chirho.write_bytes(original_chirho)
        self_chirho.chapter_path_chirho.write_text("{}")
        with self_chirho.assertRaisesRegex(ValueError, "canonical source changed"):
            MODULE_CHIRHO.build_pack_chirho(self_chirho.root_chirho, "Prov.7.6")

    def test_attempt_copy_survives_library_change_and_detects_tamper_chirho(
        self_chirho,
    ):
        pack_chirho = MODULE_CHIRHO.build_pack_chirho(
            self_chirho.root_chirho, "Prov.7.6"
        )
        attempt_chirho = self_chirho.root_chirho / "attempt-chirho"
        attempt_chirho.mkdir()
        MODULE_CHIRHO.stage_pack_chirho(
            self_chirho.root_chirho, attempt_chirho, pack_chirho
        )
        self_chirho.image_path_chirho.write_bytes(b"later-library-version")
        MODULE_CHIRHO.verify_staged_pack_chirho(attempt_chirho, pack_chirho)
        with self_chirho.assertRaises(FileExistsError):
            original_reference_chirho = PathChirho(
                pack_chirho["references_chirho"][0]["path_chirho"]
            )
            original_reference_chirho.open("xb")
        original_reference_chirho.write_bytes(b"tampered")
        with self_chirho.assertRaisesRegex(
            ValueError, "Staged continuity reference changed"
        ):
            MODULE_CHIRHO.verify_staged_pack_chirho(attempt_chirho, pack_chirho)

    def test_reference_escape_and_symlink_refuse_chirho(self_chirho):
        link_chirho = self_chirho.root_chirho / "linked-chirho.webp"
        link_chirho.symlink_to(self_chirho.image_path_chirho)
        with self_chirho.assertRaisesRegex(ValueError, "unlinked"):
            MODULE_CHIRHO.checked_bytes_chirho(
                self_chirho.root_chirho, "linked-chirho.webp"
            )
        with self_chirho.assertRaisesRegex(ValueError, "escapes"):
            MODULE_CHIRHO.checked_bytes_chirho(
                self_chirho.root_chirho, "../foreign-chirho.webp"
            )

    def test_actual_producer_stages_before_generator_chirho(self_chirho):
        spec_chirho = util_chirho.spec_from_file_location(
            "scene_continuity_proof_chirho",
            ROOT_CHIRHO
            / "scripts-chirho/art-chirho/recovery-chirho/scene_upgrades_chirho.py",
        )
        runner_chirho = util_chirho.module_from_spec(spec_chirho)
        spec_chirho.loader.exec_module(runner_chirho)
        attempt_chirho = self_chirho.root_chirho / "new-attempt-chirho"
        attempt_chirho.mkdir()
        job_chirho = {
            "id_chirho": "Prov.7.6",
            "reference_chirho": "Proverbs 7:6",
            "content_path_chirho": "/content-chirho/proverbs-chirho/chapter-07-chirho.json",
            "content_sha256_chirho": hashlib_chirho.sha256(
                self_chirho.chapter_path_chirho.read_bytes()
            ).hexdigest(),
            "canonical_text_chirho": "source six",
            "canonical_sha256_chirho": hashlib_chirho.sha256(b"source six").hexdigest(),
            "slug_chirho": "proverbs-chirho",
            "chapter_chirho": 7,
            "verse_chirho": 6,
        }

        def inspect_generator_chirho(*arguments_chirho, **keywords_chirho):
            frozen_chirho = json_chirho.loads(
                (attempt_chirho / "source-input-chirho.json").read_text()
            )
            pack_chirho = frozen_chirho["visual_continuity_chirho"]
            self_chirho.assertEqual(
                pack_chirho["active_roles_chirho"][0]["role_chirho"], "observer-chirho"
            )
            MODULE_CHIRHO.verify_staged_pack_chirho(attempt_chirho, pack_chirho)
            self_chirho.assertTrue(
                (attempt_chirho / "source-pin-chirho.json").is_file()
            )
            return mock_chirho.Mock(error_chirho=None)

        with (
            mock_chirho.patch.object(runner_chirho, "REQUEST_LIMIT_CHIRHO", 1),
            mock_chirho.patch.object(runner_chirho, "DISPATCHED_CHIRHO", 0),
            mock_chirho.patch.object(runner_chirho, "command_chirho"),
            mock_chirho.patch.object(
                runner_chirho,
                "GeneratorJobChirho",
                side_effect=inspect_generator_chirho,
            ) as generator_chirho,
        ):
            runner_chirho.produce_chirho(
                self_chirho.root_chirho, None, job_chirho, attempt_chirho
            )
            generator_chirho.assert_called_once()


if __name__ == "__main__":
    unittest_chirho.main()
