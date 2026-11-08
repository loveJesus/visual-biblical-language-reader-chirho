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


class ReplayBoundaryReachedChirho(Exception):
    """Stop the recorder after frozen source/reference checks, before output/archive work."""


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

    def period_fixture_chirho(self_chirho):
        data_chirho = self_chirho.root_chirho / "data-chirho/art-direction-chirho"
        registry_path_chirho = data_chirho / "registry-chirho.json"
        episodes_path_chirho = data_chirho / "episodes-chirho.json"
        registry_chirho = json_chirho.loads(registry_path_chirho.read_text())
        directions_chirho = json_chirho.loads(episodes_path_chirho.read_text())
        identity_chirho = {
            "place_id_chirho": "city-chirho",
            "building_id_chirho": "second-temple-chirho",
            "era_id_chirho": "first-century-chirho",
        }
        reference_chirho = registry_chirho["references_chirho"][0]
        reference_chirho.update(
            {
                "kind_chirho": "existing-scene",
                "setting_identity_chirho": identity_chirho,
            }
        )
        episode_chirho = directions_chirho["episodes_chirho"][0]
        episode_chirho.update(
            {
                "id_chirho": "episode-one-chirho",
                "place_id_chirho": "city-gate-chirho",
                "setting_identity_chirho": identity_chirho,
                "setting_reference_ids_chirho": ["watcher-chirho"],
            }
        )
        episode_chirho["roles_chirho"][0]["wardrobe_anchor_chirho"] = {
            "episode_id_chirho": "episode-one-chirho",
            "reference_id_chirho": "watcher-chirho",
            "reference_sha256_chirho": reference_chirho["sha256_chirho"],
            "clothing_direction_chirho": "Keep this episode's anchor garment.",
            "props_chirho": [],
        }
        directions_chirho["place_bindings_chirho"] = [
            {
                "id_chirho": "city-gate-chirho",
                "setting_identity_chirho": identity_chirho,
                "binding_status_chirho": "reference-bound",
                "existing_reference_ids_chirho": ["watcher-chirho"],
            }
        ]
        registry_path_chirho.write_text(json_chirho.dumps(registry_chirho))
        episodes_path_chirho.write_text(json_chirho.dumps(directions_chirho))
        return (
            registry_path_chirho,
            episodes_path_chirho,
            registry_chirho,
            directions_chirho,
        )

    def test_setting_era_is_checked_and_unbound_or_unmapped_stays_available_chirho(
        self_chirho,
    ):
        (
            _registry_path_chirho,
            episodes_path_chirho,
            _registry_chirho,
            directions_chirho,
        ) = self_chirho.period_fixture_chirho()
        pack_chirho = MODULE_CHIRHO.build_pack_chirho(
            self_chirho.root_chirho, "Prov.7.6"
        )
        self_chirho.assertEqual(
            pack_chirho["place_binding_chirho"]["id_chirho"], "city-gate-chirho"
        )
        directions_chirho["episodes_chirho"][0]["setting_identity_chirho"] = {
            "place_id_chirho": "city-chirho",
            "building_id_chirho": "first-temple-chirho",
            "era_id_chirho": "solomonic-chirho",
        }
        directions_chirho["place_bindings_chirho"][0]["setting_identity_chirho"] = (
            directions_chirho["episodes_chirho"][0]["setting_identity_chirho"]
        )
        episodes_path_chirho.write_text(json_chirho.dumps(directions_chirho))
        with self_chirho.assertRaisesRegex(ValueError, "another place/building/era"):
            MODULE_CHIRHO.build_pack_chirho(self_chirho.root_chirho, "Prov.7.6")
        directions_chirho["place_bindings_chirho"][0].update(
            {"binding_status_chirho": "unbound", "existing_reference_ids_chirho": []}
        )
        with self_chirho.assertRaisesRegex(ValueError, "unbound"):
            episodes_path_chirho.write_text(json_chirho.dumps(directions_chirho))
            MODULE_CHIRHO.build_pack_chirho(self_chirho.root_chirho, "Prov.7.6")
        directions_chirho["episodes_chirho"][0].update(
            {"setting_reference_ids_chirho": [], "roles_chirho": []}
        )
        episodes_path_chirho.write_text(json_chirho.dumps(directions_chirho))
        unbound_chirho = MODULE_CHIRHO.build_pack_chirho(
            self_chirho.root_chirho, "Prov.7.6"
        )
        self_chirho.assertEqual(unbound_chirho["references_chirho"], [])
        self_chirho.assertEqual(
            unbound_chirho["place_binding_chirho"]["binding_status_chirho"], "unbound"
        )
        self_chirho.assertIsNone(
            MODULE_CHIRHO.build_pack_chirho(self_chirho.root_chirho, "Matt.1.1")
        )
        # A typed setting cannot bypass the guard by deleting the episode identity.
        del directions_chirho["episodes_chirho"][0]["setting_identity_chirho"]
        directions_chirho["episodes_chirho"][0]["setting_reference_ids_chirho"] = [
            "watcher-chirho"
        ]
        episodes_path_chirho.write_text(json_chirho.dumps(directions_chirho))
        with self_chirho.assertRaisesRegex(ValueError, "explicit episode identity"):
            MODULE_CHIRHO.build_pack_chirho(self_chirho.root_chirho, "Prov.7.6")

    def test_outfit_anchors_are_episode_local_and_not_neutral_portraits_chirho(
        self_chirho,
    ):
        (
            registry_path_chirho,
            episodes_path_chirho,
            registry_chirho,
            directions_chirho,
        ) = self_chirho.period_fixture_chirho()
        first_chirho = MODULE_CHIRHO.build_pack_chirho(
            self_chirho.root_chirho, "Prov.7.6"
        )
        other_chirho = json_chirho.loads(
            json_chirho.dumps(directions_chirho["episodes_chirho"][0])
        )
        other_chirho.update(
            {"id_chirho": "episode-two-chirho", "verse_ids_chirho": ["Prov.7.10"]}
        )
        other_chirho["roles_chirho"][0]["applicable_verses_chirho"] = ["Prov.7.10"]
        anchor_chirho = other_chirho["roles_chirho"][0]["wardrobe_anchor_chirho"]
        anchor_chirho.update(
            {
                "episode_id_chirho": "episode-two-chirho",
                "clothing_direction_chirho": "This distinct episode chooses its own garments.",
            }
        )
        directions_chirho["episodes_chirho"][0]["verse_ids_chirho"] = [
            "Prov.7.6",
            "Prov.7.7",
        ]
        directions_chirho["episodes_chirho"].append(other_chirho)
        episodes_path_chirho.write_text(json_chirho.dumps(directions_chirho))
        second_chirho = MODULE_CHIRHO.build_pack_chirho(
            self_chirho.root_chirho, "Prov.7.10"
        )
        self_chirho.assertNotEqual(
            first_chirho["active_roles_chirho"][0]["wardrobe_anchor_chirho"],
            second_chirho["active_roles_chirho"][0]["wardrobe_anchor_chirho"],
        )
        self_chirho.assertEqual(
            first_chirho["references_chirho"], second_chirho["references_chirho"]
        )
        anchor_chirho["episode_id_chirho"] = "episode-one-chirho"
        episodes_path_chirho.write_text(json_chirho.dumps(directions_chirho))
        with self_chirho.assertRaisesRegex(ValueError, "Wardrobe anchor"):
            MODULE_CHIRHO.build_pack_chirho(self_chirho.root_chirho, "Prov.7.10")
        anchor_chirho["episode_id_chirho"] = "episode-two-chirho"
        episodes_path_chirho.write_text(json_chirho.dumps(directions_chirho))
        registry_chirho["references_chirho"][0]["kind_chirho"] = (
            "watercolor-portrait-cell"
        )
        registry_path_chirho.write_text(json_chirho.dumps(registry_chirho))
        with self_chirho.assertRaisesRegex(ValueError, "Wardrobe anchor"):
            MODULE_CHIRHO.build_pack_chirho(self_chirho.root_chirho, "Prov.7.10")

    def test_old_attempt_replay_does_not_rederive_new_era_or_wardrobe_rules_chirho(
        self_chirho,
    ):
        # This is a legacy pack without the new optional fields.
        old_pack_chirho = MODULE_CHIRHO.build_pack_chirho(
            self_chirho.root_chirho, "Prov.7.6"
        )
        attempt_chirho = self_chirho.root_chirho / "old-attempt-chirho"
        attempt_chirho.mkdir()
        MODULE_CHIRHO.stage_pack_chirho(
            self_chirho.root_chirho, attempt_chirho, old_pack_chirho
        )
        frozen_chirho = json_chirho.dumps(
            {"visual_continuity_chirho": old_pack_chirho}
        ).encode()
        (attempt_chirho / "source-input-chirho.json").write_bytes(frozen_chirho)
        pin_chirho = hashlib_chirho.sha256(frozen_chirho).hexdigest()
        pin_path_chirho = attempt_chirho / "source-pin-chirho.json"
        pin_path_chirho.write_text(json_chirho.dumps({"sha256_chirho": pin_chirho}))
        pin_bytes_chirho = pin_path_chirho.read_bytes()
        (
            _registry_path_chirho,
            episodes_path_chirho,
            _registry_chirho,
            directions_chirho,
        ) = self_chirho.period_fixture_chirho()
        directions_chirho["episodes_chirho"][0]["setting_identity_chirho"][
            "era_id_chirho"
        ] = "wrong-era-chirho"
        episodes_path_chirho.write_text(json_chirho.dumps(directions_chirho))
        with self_chirho.assertRaises(ValueError):
            MODULE_CHIRHO.build_pack_chirho(self_chirho.root_chirho, "Prov.7.6")
        MODULE_CHIRHO.verify_staged_pack_chirho(attempt_chirho, old_pack_chirho)
        self_chirho.assertEqual(
            (attempt_chirho / "source-input-chirho.json").read_bytes(), frozen_chirho
        )
        self_chirho.assertEqual(
            hashlib_chirho.sha256(frozen_chirho).hexdigest(), pin_chirho
        )
        self_chirho.assertEqual(pin_path_chirho.read_bytes(), pin_bytes_chirho)
        self_chirho.assertEqual(
            hashlib_chirho.sha256(
                (attempt_chirho / "source-input-chirho.json").read_bytes()
            ).hexdigest(),
            json_chirho.loads(pin_path_chirho.read_bytes())["sha256_chirho"],
        )
        runner_chirho, _unused_attempt_chirho, job_chirho = (
            self_chirho.producer_fixture_chirho()
        )
        read_chirho = runner_chirho.sources_chirho.read_chirho

        def stop_after_reference_checks_chirho(path_chirho, *arguments_chirho):
            if path_chirho.name == "record-chirho.json":
                raise ReplayBoundaryReachedChirho()
            return read_chirho(path_chirho, *arguments_chirho)

        with (
            mock_chirho.patch.object(
                runner_chirho, "image_calls_chirho", return_value=1
            ),
            mock_chirho.patch.object(
                runner_chirho.sources_chirho,
                "read_chirho",
                side_effect=stop_after_reference_checks_chirho,
            ),
            mock_chirho.patch.object(
                runner_chirho.reference_pack_chirho,
                "build_pack_chirho",
                side_effect=AssertionError("Old recorder must not rebuild a pack"),
            ),
            mock_chirho.patch.object(
                runner_chirho.reference_pack_chirho,
                "verify_staged_pack_chirho",
                wraps=runner_chirho.reference_pack_chirho.verify_staged_pack_chirho,
            ) as verify_chirho,
        ):
            with self_chirho.assertRaises(ReplayBoundaryReachedChirho):
                runner_chirho.record_chirho(
                    self_chirho.root_chirho, job_chirho, attempt_chirho
                )
            verify_chirho.assert_called_once()
        self_chirho.assertEqual(pin_path_chirho.read_bytes(), pin_bytes_chirho)

    def test_wrong_era_is_refused_before_actual_generator_construction_chirho(
        self_chirho,
    ):
        (
            _registry_path_chirho,
            episodes_path_chirho,
            _registry_chirho,
            directions_chirho,
        ) = self_chirho.period_fixture_chirho()
        directions_chirho["episodes_chirho"][0]["setting_identity_chirho"][
            "era_id_chirho"
        ] = "wrong-era-chirho"
        episodes_path_chirho.write_text(json_chirho.dumps(directions_chirho))
        runner_chirho, attempt_chirho, job_chirho = (
            self_chirho.producer_fixture_chirho()
        )
        with (
            mock_chirho.patch.object(runner_chirho, "REQUEST_LIMIT_CHIRHO", 1),
            mock_chirho.patch.object(runner_chirho, "DISPATCHED_CHIRHO", 0),
            mock_chirho.patch.object(runner_chirho, "command_chirho") as command_chirho,
            mock_chirho.patch.object(
                runner_chirho, "GeneratorJobChirho"
            ) as generator_chirho,
        ):
            with self_chirho.assertRaises(ValueError):
                runner_chirho.produce_chirho(
                    self_chirho.root_chirho, None, job_chirho, attempt_chirho
                )
            generator_chirho.assert_not_called()
            command_chirho.assert_not_called()
        self_chirho.assertFalse((attempt_chirho / "source-pin-chirho.json").exists())

    def producer_fixture_chirho(self_chirho):
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

        return runner_chirho, attempt_chirho, job_chirho

    def test_actual_producer_stages_before_generator_chirho(self_chirho):
        self_chirho.period_fixture_chirho()
        runner_chirho, attempt_chirho, job_chirho = (
            self_chirho.producer_fixture_chirho()
        )

        def inspect_generator_chirho(*arguments_chirho, **keywords_chirho):
            frozen_chirho = json_chirho.loads(
                (attempt_chirho / "source-input-chirho.json").read_text()
            )
            pack_chirho = frozen_chirho["visual_continuity_chirho"]
            self_chirho.assertEqual(
                pack_chirho["active_roles_chirho"][0]["role_chirho"], "observer-chirho"
            )
            MODULE_CHIRHO.verify_staged_pack_chirho(attempt_chirho, pack_chirho)
            self_chirho.assertEqual(
                pack_chirho["place_binding_chirho"]["setting_identity_chirho"][
                    "era_id_chirho"
                ],
                "first-century-chirho",
            )
            self_chirho.assertEqual(
                pack_chirho["active_roles_chirho"][0]["wardrobe_anchor_chirho"][
                    "reference_sha256_chirho"
                ],
                pack_chirho["references_chirho"][0]["sha256_chirho"],
            )
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
