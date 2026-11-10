# For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life. — John 3:16 (KJV)
"""Recover a real HQ archive frontier before later prepared images, without generation."""

import json as json_chirho
import sys as sys_chirho
import unittest as unittest_chirho
from pathlib import Path as PathChirho
from unittest import mock as mock_chirho

from PIL import Image as ImageChirho

sys_chirho.path[:0] = [
    str(PathChirho(__file__).resolve().parents[1] / "scene-upgrades-chirho"),
]
import test_scene_upgrades_chirho as fixture_chirho

RUNNER_CHIRHO = fixture_chirho.runner_chirho
SOURCES_CHIRHO = fixture_chirho.sources_chirho


class FrontierTestsChirho(unittest_chirho.TestCase):
    setUp = fixture_chirho.SceneUpgradesChirho.setUp
    record_chirho = fixture_chirho.SceneUpgradesChirho.record_chirho

    def exercise_frontier_chirho(self_chirho, adapter_chirho=False):
        verses_chirho = [
            {**self_chirho.verse_chirho, "id_chirho": f"Matt.1.{number_chirho}"}
            for number_chirho in range(1, 5)
        ]
        SOURCES_CHIRHO.write_chirho(
            self_chirho.chapter_path_chirho,
            {
                "book_id_chirho": "Matt",
                "chapter_chirho": 1,
                "verses_chirho": verses_chirho,
            },
        )
        self_chirho.entry_chirho.update(
            {
                "sha256_chirho": SOURCES_CHIRHO.sha_chirho(
                    self_chirho.chapter_path_chirho.read_bytes()
                ),
                "verse_count_chirho": 4,
            }
        )
        SOURCES_CHIRHO.write_chirho(
            self_chirho.manifest_path_chirho,
            {
                "book_id_chirho": "Matt",
                "chapters_chirho": [self_chirho.entry_chirho],
            },
        )
        self_chirho.inventory_chirho["source_manifests_chirho"]["Matt"]["sha256_chirho"] = (
            SOURCES_CHIRHO.sha_chirho(self_chirho.manifest_path_chirho.read_bytes())
        )
        jobs_chirho = SOURCES_CHIRHO.chapter_jobs_chirho(
            self_chirho.root_chirho,
            self_chirho.inventory_chirho,
            self_chirho.book_chirho,
            self_chirho.entry_chirho,
        )
        rows_chirho = []
        for index_chirho, job_chirho in enumerate(jobs_chirho):
            suffix_chirho = "zzzz" if index_chirho == 0 else f"aaaa{index_chirho}"
            self_chirho.job_chirho = job_chirho
            self_chirho.attempt_chirho = (
                self_chirho.root_chirho
                / RUNNER_CHIRHO.HOME_CHIRHO
                / f"attempt-matt-{suffix_chirho}"
            )
            self_chirho.attempt_chirho.mkdir()
            row_chirho = self_chirho.record_chirho()
            image_path_chirho = self_chirho.attempt_chirho / "scene-chirho.webp"
            ImageChirho.new("RGB", (1200, 900), "tan").save(
                image_path_chirho, format="WEBP", lossless=True
            )
            row_chirho.update(
                {
                    "lesson_id_chirho": job_chirho["id_chirho"],
                    "sha256_chirho": SOURCES_CHIRHO.sha_chirho(image_path_chirho.read_bytes()),
                }
            )
            SOURCES_CHIRHO.write_chirho(
                self_chirho.attempt_chirho / "verified-generation-chirho.json",
                {
                    "record_sha256_chirho": SOURCES_CHIRHO.sha_chirho(
                        json_chirho.dumps(row_chirho, sort_keys=True).encode()
                    ),
                },
            )
            SOURCES_CHIRHO.write_chirho(
                self_chirho.attempt_chirho / "prepared-chirho.json", row_chirho
            )
            rows_chirho.append(row_chirho)
        SOURCES_CHIRHO.write_chirho(
            self_chirho.root_chirho / SOURCES_CHIRHO.CATALOGUE_CHIRHO,
            {
                "schema_version_chirho": 1,
                "archive_ready_count_chirho": 0,
                "scenes_chirho": [rows_chirho[0]],
            },
        )
        original_chirho = RUNNER_CHIRHO.install_chirho
        installed_chirho = []

        def install_chirho(*arguments_chirho):
            original_chirho(*arguments_chirho)
            installed_chirho.append(arguments_chirho[-1]["lesson_id_chirho"])

        def stage_chirho(_root_chirho, _arguments_chirho, _log_chirho):
            self_chirho.assertEqual(
                RUNNER_CHIRHO.catalogue_chirho(self_chirho.root_chirho)[
                    "archive_ready_count_chirho"
                ],
                len(installed_chirho),
            )

        forbidden_chirho = mock_chirho.Mock(
            side_effect=AssertionError("recovery cannot regenerate")
        )
        with (
            mock_chirho.patch.object(RUNNER_CHIRHO, "ROOT_CHIRHO", self_chirho.root_chirho),
            mock_chirho.patch.object(RUNNER_CHIRHO, "STOP_CHIRHO", False),
            mock_chirho.patch.object(
                RUNNER_CHIRHO,
                "INVENTORY_CHIRHO",
                {
                    **self_chirho.inventory_chirho,
                    "total_chirho": 4,
                    "books_chirho": [self_chirho.book_chirho],
                },
            ),
            mock_chirho.patch.object(RUNNER_CHIRHO, "CURRENT_CHAPTER_CHIRHO", 1),
            mock_chirho.patch.object(RUNNER_CHIRHO, "install_chirho", install_chirho),
            mock_chirho.patch.object(RUNNER_CHIRHO, "command_chirho", stage_chirho),
            mock_chirho.patch.object(RUNNER_CHIRHO.BASE_CHIRHO, "remote_record_chirho"),
        ):
            owner_chirho = (
                RUNNER_CHIRHO.chapter_openings_chirho.ChapterOwnerChirho(
                    RUNNER_CHIRHO, self_chirho.book_chirho, 1
                )
                if adapter_chirho
                else RUNNER_CHIRHO
            )
            self_chirho.assertTrue(
                RUNNER_CHIRHO.POOL_CHIRHO.run_chirho(
                    owner_chirho,
                    self_chirho.root_chirho,
                    "Matt",
                    jobs_chirho,
                    forbidden_chirho,
                )
            )
        forbidden_chirho.assert_not_called()
        self_chirho.assertEqual(installed_chirho[0], "Matt.1.1")
        self_chirho.assertEqual(
            set(installed_chirho), {job_chirho["id_chirho"] for job_chirho in jobs_chirho}
        )
        document_chirho = RUNNER_CHIRHO.catalogue_chirho(self_chirho.root_chirho)
        self_chirho.assertEqual(document_chirho["archive_ready_count_chirho"], 4)
        self_chirho.assertEqual(document_chirho["scenes_chirho"][0], rows_chirho[0])

    def test_four_saved_images_resume_exact_pending_archive_before_uuid_order_chirho(self_chirho):
        self_chirho.exercise_frontier_chirho()

    def test_chapter_owner_forwards_exact_frontier_recovery_chirho(self_chirho):
        self_chirho.exercise_frontier_chirho(adapter_chirho=True)


if __name__ == "__main__":
    unittest_chirho.main()
