# For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life. — John 3:16 (KJV)
"""Real source/failure boundaries for the scene-upgrades-chirho workflow."""

import importlib as importlib_chirho
import json as json_chirho
import sys as sys_chirho
import tempfile as tempfile_chirho
import unittest as unittest_chirho
from pathlib import Path as PathChirho
from unittest import mock as mock_chirho

ROOT_CHIRHO = PathChirho(__file__).resolve().parents[3]
sys_chirho.path.insert(
    0, str(ROOT_CHIRHO / "scripts-chirho/art-chirho/recovery-chirho")
)
runner_chirho = importlib_chirho.import_module("scene_upgrades_chirho")
sources_chirho = runner_chirho.sources_chirho


class SceneUpgradesChirho(unittest_chirho.TestCase):
    def setUp(self_chirho):
        self_chirho.temporary_chirho = tempfile_chirho.TemporaryDirectory()
        self_chirho.addCleanup(self_chirho.temporary_chirho.cleanup)
        self_chirho.root_chirho = PathChirho(self_chirho.temporary_chirho.name)
        self_chirho.addCleanup(mock_chirho.patch.stopall)
        mock_chirho.patch.object(
            runner_chirho,
            "HOME_CHIRHO",
            sources_chirho.HOME_CHIRHO
            / "books-chirho/matthew-chirho/chapter-001-chirho",
        ).start()
        registry_chirho = self_chirho.root_chirho / sources_chirho.BOOKS_CHIRHO
        sources_chirho.write_chirho(
            registry_chirho, {"schema_version_chirho": 1, "books_chirho": []}
        )
        self_chirho.verse_chirho = {
            "id_chirho": "Matt.1.1",
            "reference_chirho": "Matthew 1:1",
            "canonical_text_chirho": "Βίβλος γενέσεως",
            "tokens_chirho": [],
        }
        self_chirho.chapter_path_chirho = (
            self_chirho.root_chirho
            / "static/content-chirho/matthew-chirho/chapter-01-chirho.json"
        )
        sources_chirho.write_chirho(
            self_chirho.chapter_path_chirho,
            {
                "book_id_chirho": "Matt",
                "chapter_chirho": 1,
                "verses_chirho": [self_chirho.verse_chirho],
            },
        )
        self_chirho.entry_chirho = {
            "number_chirho": 1,
            "path_chirho": "/content-chirho/matthew-chirho/chapter-01-chirho.json",
            "sha256_chirho": sources_chirho.sha_chirho(
                self_chirho.chapter_path_chirho.read_bytes()
            ),
            "verse_count_chirho": 1,
        }
        self_chirho.manifest_path_chirho = self_chirho.chapter_path_chirho.with_name(
            "manifest-chirho.json"
        )
        sources_chirho.write_chirho(
            self_chirho.manifest_path_chirho,
            {"book_id_chirho": "Matt", "chapters_chirho": [self_chirho.entry_chirho]},
        )
        self_chirho.book_chirho = {"id_chirho": "Matt", "slug_chirho": "matthew-chirho"}
        self_chirho.inventory_chirho = {
            "registry_sha256_chirho": sources_chirho.sha_chirho(
                registry_chirho.read_bytes()
            ),
            "source_manifests_chirho": {
                "Matt": {
                    "path_chirho": str(
                        self_chirho.manifest_path_chirho.relative_to(
                            self_chirho.root_chirho
                        )
                    ),
                    "sha256_chirho": sources_chirho.sha_chirho(
                        self_chirho.manifest_path_chirho.read_bytes()
                    ),
                }
            },
        }
        self_chirho.job_chirho = sources_chirho.chapter_jobs_chirho(
            self_chirho.root_chirho,
            self_chirho.inventory_chirho,
            self_chirho.book_chirho,
            self_chirho.entry_chirho,
        )[0]
        self_chirho.attempt_chirho = (
            self_chirho.root_chirho
            / runner_chirho.HOME_CHIRHO
            / "attempt-matt-fixture-chirho"
        )
        self_chirho.attempt_chirho.mkdir(parents=True)

    def record_chirho(self_chirho):
        bytes_chirho = b"immutable-scene-fixture-chirho"
        (self_chirho.attempt_chirho / "scene-chirho.webp").write_bytes(bytes_chirho)
        row_chirho = {
            "lesson_id_chirho": "Matt.1.1",
            "asset_path_chirho": runner_chirho.asset_path_chirho(
                self_chirho.job_chirho
            ),
            "sha256_chirho": sources_chirho.sha_chirho(bytes_chirho),
            "width_chirho": 1200,
            "height_chirho": 900,
            "source_binding_chirho": {
                "canonical_sha256_chirho": self_chirho.job_chirho[
                    "canonical_sha256_chirho"
                ],
                "content_sha256_chirho": self_chirho.job_chirho[
                    "content_sha256_chirho"
                ],
            },
        }
        sources_chirho.write_chirho(
            self_chirho.attempt_chirho / "verified-generation-chirho.json",
            {
                "record_sha256_chirho": sources_chirho.sha_chirho(
                    json_chirho.dumps(row_chirho, sort_keys=True).encode()
                )
            },
        )
        return row_chirho

    def test_priority_chirho(self_chirho):
        books_chirho = sources_chirho.read_chirho(
            ROOT_CHIRHO / sources_chirho.BOOKS_CHIRHO
        )["books_chirho"]
        order_chirho = sources_chirho.priority_chirho(books_chirho)
        ids_chirho = [row_chirho["id_chirho"] for row_chirho in order_chirho]
        self_chirho.assertEqual(ids_chirho[:3], ["Matt", "Mark", "Luke"])
        self_chirho.assertEqual(ids_chirho[25:28], ["Rev", "Ps", "Exod"])
        self_chirho.assertFalse(set(ids_chirho) & sources_chirho.COMPLETED_CHIRHO)
        self_chirho.assertEqual(len(ids_chirho), len(set(ids_chirho)))

    def test_source_changes_refuse_before_generation_chirho(self_chirho):
        self_chirho.chapter_path_chirho.write_text("{}")
        with self_chirho.assertRaises(ValueError):
            sources_chirho.chapter_jobs_chirho(
                self_chirho.root_chirho,
                self_chirho.inventory_chirho,
                self_chirho.book_chirho,
                self_chirho.entry_chirho,
            )
        with self_chirho.assertRaises(runner_chirho.POOL_CHIRHO.SourceChangedChirho):
            runner_chirho.source_input_chirho(
                self_chirho.root_chirho, self_chirho.job_chirho
            )

    def test_link_and_oversize_source_refuse_chirho(self_chirho):
        link_chirho = self_chirho.root_chirho / "linked-chirho.json"
        link_chirho.symlink_to(self_chirho.chapter_path_chirho)
        with self_chirho.assertRaises(ValueError):
            sources_chirho.read_chirho(link_chirho)
        with self_chirho.assertRaises(ValueError):
            sources_chirho.read_chirho(self_chirho.chapter_path_chirho, 1)

    def test_edition_number_is_not_rewritten_chirho(self_chirho):
        self_chirho.verse_chirho["id_chirho"] = "Matt.1.99"
        sources_chirho.write_chirho(
            self_chirho.chapter_path_chirho,
            {
                "book_id_chirho": "Matt",
                "chapter_chirho": 1,
                "verses_chirho": [self_chirho.verse_chirho],
            },
        )
        self_chirho.entry_chirho.update(
            {
                "verse_numbers_chirho": [99],
                "sha256_chirho": sources_chirho.sha_chirho(
                    self_chirho.chapter_path_chirho.read_bytes()
                ),
            }
        )
        row_chirho = sources_chirho.chapter_jobs_chirho(
            self_chirho.root_chirho,
            self_chirho.inventory_chirho,
            self_chirho.book_chirho,
            self_chirho.entry_chirho,
        )[0]
        self_chirho.assertEqual(row_chirho["id_chirho"], "Matt.1.99")

    def test_mark_fallback_only_preserves_original_chirho(self_chirho):
        path_chirho = (
            self_chirho.root_chirho
            / "data-chirho/media-chirho/mark-worker-scenes-chirho.json"
        )
        row_chirho = {
            "lesson_id_chirho": "Mark.1.1",
            "tool_chirho": "runware",
            "model_chirho": "runware:100@1",
            "art_review_chirho": "pending",
            "sha256_chirho": "a" * 64,
        }
        sources_chirho.write_chirho(
            path_chirho,
            {
                "schema_version_chirho": 1,
                "book_id_chirho": "Mark",
                "scenes_chirho": [row_chirho],
            },
        )
        original_chirho = path_chirho.read_bytes()
        self_chirho.assertTrue(
            sources_chirho.mark_fallback_chirho(self_chirho.root_chirho)
        )
        self_chirho.assertEqual(
            sources_chirho.read_chirho(path_chirho)["scenes_chirho"],
            [{**row_chirho, "fallback_chirho": True}],
        )
        self_chirho.assertEqual(
            (
                self_chirho.root_chirho
                / sources_chirho.HOME_CHIRHO
                / "mark-original-catalogue-chirho.json"
            ).read_bytes(),
            original_chirho,
        )
        self_chirho.assertFalse(
            sources_chirho.mark_fallback_chirho(self_chirho.root_chirho)
        )

    def test_real_high_quality_mark_is_not_demoted_chirho(self_chirho):
        path_chirho = (
            self_chirho.root_chirho
            / "data-chirho/media-chirho/mark-worker-scenes-chirho.json"
        )
        sources_chirho.write_chirho(
            path_chirho,
            {
                "scenes_chirho": [
                    {
                        "tool_chirho": "image_gen.imagegen",
                        "model_chirho": "tool-managed; not exposed",
                        "art_review_chirho": "pending",
                    }
                ]
            },
        )
        original_chirho = path_chirho.read_bytes()
        with self_chirho.assertRaises(ValueError):
            sources_chirho.mark_fallback_chirho(self_chirho.root_chirho)
        self_chirho.assertEqual(path_chirho.read_bytes(), original_chirho)

    def test_archive_failure_keeps_rasters_and_checkpoint_open_chirho(self_chirho):
        row_chirho = self_chirho.record_chirho()
        command_chirho = mock_chirho.patch.object(
            runner_chirho, "command_chirho", side_effect=OSError(69, "archive refused")
        ).start()
        with self_chirho.assertRaises(OSError):
            runner_chirho.install_chirho(
                self_chirho.root_chirho,
                "Matt",
                self_chirho.job_chirho,
                self_chirho.attempt_chirho,
                row_chirho,
            )
        self_chirho.assertTrue(
            (self_chirho.attempt_chirho / "scene-chirho.webp").exists()
        )
        self_chirho.assertFalse(
            runner_chirho.manifest_path_chirho(self_chirho.root_chirho, "Matt").exists()
        )
        self_chirho.assertEqual(command_chirho.call_count, 1)
        self_chirho.assertNotIn("retire", str(command_chirho.call_args))
        self_chirho.assertEqual(
            runner_chirho.catalogue_chirho(self_chirho.root_chirho)[
                "archive_ready_count_chirho"
            ],
            0,
        )

    def test_ready_prefix_advances_only_after_all_archive_stages_chirho(self_chirho):
        row_chirho = self_chirho.record_chirho()
        mock_chirho.patch.object(
            runner_chirho.BASE_CHIRHO, "remote_record_chirho"
        ).start()

        def stage_chirho(_root_chirho, _command_chirho, _log_chirho):
            self_chirho.assertEqual(
                runner_chirho.catalogue_chirho(self_chirho.root_chirho)[
                    "archive_ready_count_chirho"
                ],
                0,
            )

        mock_chirho.patch.object(
            runner_chirho, "command_chirho", side_effect=stage_chirho
        ).start()
        runner_chirho.install_chirho(
            self_chirho.root_chirho,
            "Matt",
            self_chirho.job_chirho,
            self_chirho.attempt_chirho,
            row_chirho,
        )
        path_chirho = self_chirho.root_chirho / sources_chirho.CATALOGUE_CHIRHO
        self_chirho.assertEqual(
            runner_chirho.catalogue_chirho(self_chirho.root_chirho)[
                "archive_ready_count_chirho"
            ],
            1,
        )
        self_chirho.assertEqual(
            sources_chirho.read_chirho(
                runner_chirho.manifest_path_chirho(self_chirho.root_chirho, "Matt")
            )["scenes_chirho"],
            [row_chirho],
        )
        before_chirho = path_chirho.read_bytes()
        runner_chirho.advance_archive_ready_chirho(self_chirho.root_chirho, row_chirho)
        self_chirho.assertEqual(path_chirho.read_bytes(), before_chirho)

    def test_refused_archive_does_not_advance_the_prefix_chirho(self_chirho):
        row_chirho = self_chirho.record_chirho()

        def stage_chirho(_root_chirho, command_chirho, _log_chirho):
            if any(
                "archive-artwork-chirho.ts" in str(item_chirho)
                for item_chirho in command_chirho
            ):
                raise OSError("archive readback refused")

        mock_chirho.patch.object(
            runner_chirho, "command_chirho", side_effect=stage_chirho
        ).start()
        with self_chirho.assertRaises(OSError):
            runner_chirho.install_chirho(
                self_chirho.root_chirho,
                "Matt",
                self_chirho.job_chirho,
                self_chirho.attempt_chirho,
                row_chirho,
            )
        self_chirho.assertEqual(
            runner_chirho.catalogue_chirho(self_chirho.root_chirho)[
                "archive_ready_count_chirho"
            ],
            0,
        )
        self_chirho.assertFalse(
            (self_chirho.attempt_chirho / "installed-chirho.json").exists()
        )
        self_chirho.assertTrue(
            (self_chirho.attempt_chirho / "scene-chirho.webp").exists()
        )

    def test_invalid_ready_marker_or_skipped_pending_scene_is_refused_chirho(
        self_chirho,
    ):
        row_chirho = self_chirho.record_chirho()
        path_chirho = self_chirho.root_chirho / sources_chirho.CATALOGUE_CHIRHO
        for marker_chirho in [-1, 2, True, 0.5, "0"]:
            sources_chirho.write_chirho(
                path_chirho,
                {
                    "schema_version_chirho": 1,
                    "scenes_chirho": [row_chirho],
                    "archive_ready_count_chirho": marker_chirho,
                },
            )
            with self_chirho.assertRaises(ValueError):
                runner_chirho.catalogue_chirho(self_chirho.root_chirho)
        next_chirho = {**row_chirho, "lesson_id_chirho": "Matt.1.2"}
        sources_chirho.write_chirho(
            path_chirho,
            {
                "schema_version_chirho": 1,
                "scenes_chirho": [row_chirho, next_chirho],
                "archive_ready_count_chirho": 0,
            },
        )
        before_chirho = path_chirho.read_bytes()
        with self_chirho.assertRaises(ValueError):
            runner_chirho.advance_archive_ready_chirho(
                self_chirho.root_chirho, next_chirho
            )
        self_chirho.assertEqual(path_chirho.read_bytes(), before_chirho)

    def test_resume_received_installation_never_renders_again_chirho(self_chirho):
        row_chirho = self_chirho.record_chirho()
        sources_chirho.write_chirho(
            self_chirho.root_chirho / sources_chirho.CATALOGUE_CHIRHO,
            {"schema_version_chirho": 1, "scenes_chirho": [row_chirho]},
        )
        sources_chirho.write_chirho(
            self_chirho.attempt_chirho / "installed-chirho.json", row_chirho
        )
        (self_chirho.attempt_chirho / "scene-chirho.webp").unlink()
        mock_chirho.patch.object(
            runner_chirho.BASE_CHIRHO, "remote_record_chirho"
        ).start()
        renderer_chirho = mock_chirho.patch.object(
            runner_chirho, "GeneratorJobChirho"
        ).start()
        command_chirho = mock_chirho.patch.object(
            runner_chirho, "command_chirho"
        ).start()
        runner_chirho.install_chirho(
            self_chirho.root_chirho,
            "Matt",
            self_chirho.job_chirho,
            self_chirho.attempt_chirho,
            row_chirho,
        )
        self_chirho.assertFalse(renderer_chirho.called)
        self_chirho.assertIn("retire-artwork-chirho.ts", str(command_chirho.call_args))
        self_chirho.assertEqual(
            sources_chirho.read_chirho(
                runner_chirho.manifest_path_chirho(self_chirho.root_chirho, "Matt")
            )["scenes_chirho"],
            [row_chirho],
        )

    def test_failed_preflight_still_consumes_bounded_dispatch_slot_chirho(self_chirho):
        mock_chirho.patch.object(runner_chirho, "DISPATCHED_CHIRHO", 0).start()
        mock_chirho.patch.object(runner_chirho, "REQUEST_LIMIT_CHIRHO", 1).start()
        source_chirho = mock_chirho.patch.object(
            runner_chirho,
            "source_input_chirho",
            side_effect=runner_chirho.POOL_CHIRHO.SourceChangedChirho("changed"),
        ).start()
        renderer_chirho = mock_chirho.patch.object(
            runner_chirho, "GeneratorJobChirho"
        ).start()
        with self_chirho.assertRaises(runner_chirho.POOL_CHIRHO.SourceChangedChirho):
            runner_chirho.produce_chirho(
                self_chirho.root_chirho,
                "Matt",
                self_chirho.job_chirho,
                self_chirho.attempt_chirho,
            )
        with self_chirho.assertRaises(OSError):
            runner_chirho.produce_chirho(
                self_chirho.root_chirho,
                "Matt",
                self_chirho.job_chirho,
                self_chirho.attempt_chirho,
            )
        self_chirho.assertEqual(source_chirho.call_count, 1)
        self_chirho.assertFalse(renderer_chirho.called)

    def test_catalogue_declaration_is_not_completed_work_chirho(self_chirho):
        row_chirho = self_chirho.record_chirho()
        sources_chirho.write_chirho(
            self_chirho.root_chirho / sources_chirho.CATALOGUE_CHIRHO,
            {"schema_version_chirho": 1, "scenes_chirho": [row_chirho]},
        )
        remote_chirho = mock_chirho.patch.object(
            runner_chirho.BASE_CHIRHO, "remote_record_chirho"
        ).start()
        self_chirho.assertEqual(
            runner_chirho.verified_completed_chirho(self_chirho.root_chirho), 0
        )
        sources_chirho.write_chirho(
            runner_chirho.manifest_path_chirho(self_chirho.root_chirho, "Matt"),
            {"book_id_chirho": "Matt", "scenes_chirho": [row_chirho]},
        )
        self_chirho.assertEqual(
            runner_chirho.verified_completed_chirho(self_chirho.root_chirho), 1
        )
        remote_chirho.assert_called_once_with(self_chirho.root_chirho, row_chirho)

    def test_restart_recovers_only_a_checkpoint_with_exact_archive_facts_chirho(
        self_chirho,
    ):
        row_chirho = self_chirho.record_chirho()
        path_chirho = self_chirho.root_chirho / sources_chirho.CATALOGUE_CHIRHO
        sources_chirho.write_chirho(
            path_chirho,
            {
                "schema_version_chirho": 1,
                "archive_ready_count_chirho": 0,
                "scenes_chirho": [row_chirho],
            },
        )
        remote_chirho = mock_chirho.patch.object(
            runner_chirho.BASE_CHIRHO, "remote_record_chirho"
        ).start()
        renderer_chirho = mock_chirho.patch.object(
            runner_chirho, "GeneratorJobChirho"
        ).start()
        self_chirho.assertEqual(
            runner_chirho.verified_completed_chirho(self_chirho.root_chirho), 0
        )
        self_chirho.assertEqual(
            runner_chirho.catalogue_chirho(self_chirho.root_chirho)[
                "archive_ready_count_chirho"
            ],
            0,
        )
        sources_chirho.write_chirho(
            runner_chirho.manifest_path_chirho(self_chirho.root_chirho, "Matt"),
            {"book_id_chirho": "Matt", "scenes_chirho": [row_chirho]},
        )
        before_chirho = path_chirho.read_bytes()
        remote_chirho.side_effect = ValueError("archive identity changed")
        with self_chirho.assertRaises(ValueError):
            runner_chirho.verified_completed_chirho(self_chirho.root_chirho)
        self_chirho.assertEqual(path_chirho.read_bytes(), before_chirho)
        remote_chirho.side_effect = None
        self_chirho.assertEqual(
            runner_chirho.verified_completed_chirho(self_chirho.root_chirho), 1
        )
        self_chirho.assertEqual(
            runner_chirho.catalogue_chirho(self_chirho.root_chirho)[
                "archive_ready_count_chirho"
            ],
            1,
        )
        ready_chirho = path_chirho.read_bytes()
        self_chirho.assertEqual(
            runner_chirho.verified_completed_chirho(self_chirho.root_chirho), 1
        )
        self_chirho.assertEqual(path_chirho.read_bytes(), ready_chirho)
        self_chirho.assertFalse(renderer_chirho.called)

    def test_large_stage_output_is_bounded_and_hash_bound_chirho(self_chirho):
        log_chirho = self_chirho.attempt_chirho / "stage-log-chirho.txt"
        bytes_chirho = b"x" * (2 * 1024**2) + b"finished-chirho\n"
        runner_chirho.command_chirho(
            self_chirho.root_chirho,
            [
                sys_chirho.executable,
                "-c",
                "import sys;sys.stdout.buffer.write(b'x'*(2*1024**2)+b'finished-chirho\\n')",
            ],
            log_chirho,
        )
        self_chirho.assertEqual(log_chirho.stat().st_size, 65536)
        self_chirho.assertTrue(log_chirho.read_bytes().endswith(b"finished-chirho\n"))
        receipt_chirho = sources_chirho.read_chirho(
            log_chirho.with_name(log_chirho.name + ".receipt-chirho.json")
        )
        self_chirho.assertEqual(
            receipt_chirho["output_bytes_chirho"], len(bytes_chirho)
        )
        self_chirho.assertEqual(
            receipt_chirho["output_sha256_chirho"],
            sources_chirho.sha_chirho(bytes_chirho),
        )

    def test_refused_stage_preserves_diagnostics_chirho(self_chirho):
        log_chirho = self_chirho.attempt_chirho / "failed-log-chirho.txt"
        with self_chirho.assertRaises(OSError):
            runner_chirho.command_chirho(
                self_chirho.root_chirho,
                [
                    sys_chirho.executable,
                    "-c",
                    "import sys;print('refused-chirho');sys.exit(7)",
                ],
                log_chirho,
            )
        self_chirho.assertIn("refused-chirho", log_chirho.read_text())

    def test_stage_timeout_does_not_wait_for_a_live_child_chirho(self_chirho):
        log_chirho = self_chirho.attempt_chirho / "timeout-log-chirho.txt"
        with self_chirho.assertRaises(OSError):
            runner_chirho.command_chirho(
                self_chirho.root_chirho,
                [
                    sys_chirho.executable,
                    "-c",
                    "import time;print('started-chirho',flush=True);time.sleep(20)",
                ],
                log_chirho,
                timeout_chirho=0.2,
            )
        receipt_chirho = sources_chirho.read_chirho(
            log_chirho.with_name(log_chirho.name + ".receipt-chirho.json")
        )
        self_chirho.assertTrue(receipt_chirho["timed_out_chirho"])


if __name__ == "__main__":
    unittest_chirho.main()
