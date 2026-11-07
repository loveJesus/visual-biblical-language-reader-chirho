# For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life. — John 3:16 (KJV)
"""Disjoint chapter workers and single-installer behavior under real threads."""

import concurrent.futures as futures_chirho
import importlib as importlib_chirho
import sys as sys_chirho
import tempfile as tempfile_chirho
import threading as threading_chirho
import time as time_chirho
import types as types_chirho
import unittest as unittest_chirho
from pathlib import Path as PathChirho
from unittest import mock as mock_chirho

ROOT_CHIRHO = PathChirho(__file__).resolve().parents[3]
sys_chirho.path.insert(
    0, str(ROOT_CHIRHO / "scripts-chirho/art-chirho/recovery-chirho")
)
module_chirho = importlib_chirho.import_module("chapter_openings_chirho")
sources_chirho = importlib_chirho.import_module("scene_upgrade_sources_chirho")


class ChapterOpeningTestsChirho(unittest_chirho.TestCase):
    def runner_chirho(self_chirho):
        return types_chirho.SimpleNamespace(
            MASTER_HOME_CHIRHO=PathChirho("queue-chirho"),
            HOME_CHIRHO=PathChirho("parent-chirho"),
            CURRENT_CHAPTER_CHIRHO=99,
            BASE_CHIRHO=None,
            RECOVERY_CHIRHO=None,
        )

    def test_three_chapters_install_serially_and_keep_exact_identity_chirho(
        self_chirho,
    ):
        runner_chirho = self_chirho.runner_chirho()
        owners_chirho = [
            module_chirho.ChapterOwnerChirho(
                runner_chirho,
                {"id_chirho": "Matt", "slug_chirho": "matthew-chirho"},
                number_chirho,
            )
            for number_chirho in (7, 8, 9)
        ]
        barrier_chirho = threading_chirho.Barrier(3)
        state_chirho = {"active_chirho": 0, "maximum_chirho": 0, "seen_chirho": []}

        def install_chirho(expected_chirho):
            state_chirho["active_chirho"] += 1
            state_chirho["maximum_chirho"] = max(
                state_chirho["maximum_chirho"], state_chirho["active_chirho"]
            )
            before_chirho = (
                runner_chirho.HOME_CHIRHO,
                runner_chirho.CURRENT_CHAPTER_CHIRHO,
            )
            time_chirho.sleep(0.015)
            self_chirho.assertEqual(
                before_chirho,
                (runner_chirho.HOME_CHIRHO, runner_chirho.CURRENT_CHAPTER_CHIRHO),
            )
            self_chirho.assertEqual(
                expected_chirho, runner_chirho.CURRENT_CHAPTER_CHIRHO
            )
            self_chirho.assertIn(
                f"chapter-{expected_chirho:03d}-chirho", str(runner_chirho.HOME_CHIRHO)
            )
            state_chirho["seen_chirho"].append(expected_chirho)
            state_chirho["active_chirho"] -= 1

        runner_chirho.install_chirho = install_chirho

        def work_chirho(owner_chirho):
            barrier_chirho.wait(timeout=3)
            owner_chirho.install_chirho(owner_chirho.chapter_chirho)

        with futures_chirho.ThreadPoolExecutor(max_workers=3) as pool_chirho:
            list(pool_chirho.map(work_chirho, owners_chirho))
        self_chirho.assertEqual(1, state_chirho["maximum_chirho"])
        self_chirho.assertEqual({7, 8, 9}, set(state_chirho["seen_chirho"]))
        self_chirho.assertEqual(
            (PathChirho("parent-chirho"), 99),
            (runner_chirho.HOME_CHIRHO, runner_chirho.CURRENT_CHAPTER_CHIRHO),
        )

    def test_failed_install_restores_parent_context_chirho(self_chirho):
        runner_chirho = self_chirho.runner_chirho()
        owner_chirho = module_chirho.ChapterOwnerChirho(
            runner_chirho, {"slug_chirho": "mark-chirho"}, 4
        )
        runner_chirho.install_chirho = mock_chirho.Mock(
            side_effect=OSError("archive unavailable")
        )
        with self_chirho.assertRaises(OSError):
            owner_chirho.install_chirho()
        self_chirho.assertEqual(
            (PathChirho("parent-chirho"), 99),
            (runner_chirho.HOME_CHIRHO, runner_chirho.CURRENT_CHAPTER_CHIRHO),
        )

    def test_existing_hold_skips_dispatch_and_completed_rows_remain_in_recovery_scope_chirho(
        self_chirho,
    ):
        with tempfile_chirho.TemporaryDirectory() as name_chirho:
            root_chirho = PathChirho(name_chirho)
            runner_chirho = self_chirho.runner_chirho()
            book_chirho = {"id_chirho": "Matt", "slug_chirho": "matthew-chirho"}
            runner_chirho.INVENTORY_CHIRHO = {
                "books_chirho": [book_chirho],
                "source_manifests_chirho": {
                    "Matt": {"path_chirho": "manifest-chirho.json"}
                },
            }
            sources_chirho.write_chirho(
                root_chirho / "manifest-chirho.json",
                {
                    "chapters_chirho": [
                        {"number_chirho": number_chirho} for number_chirho in (6, 7, 8)
                    ]
                },
            )
            runner_chirho.sources_chirho = types_chirho.SimpleNamespace(
                read_chirho=sources_chirho.read_chirho,
                chapter_jobs_chirho=lambda _root_chirho, _inventory_chirho, _book_chirho, entry_chirho: [
                    {
                        "id_chirho": f"Matt.{entry_chirho['number_chirho']}.{number_chirho}"
                    }
                    for number_chirho in range(1, 5)
                ],
            )
            runner_chirho.RECOVERY_CHIRHO = types_chirho.SimpleNamespace(
                key_chirho=lambda id_chirho: id_chirho,
                blocked_chirho=lambda home_chirho, _scope_chirho: (
                    {"Matt.6.1"} if "chapter-006" in str(home_chirho) else set()
                ),
            )
            sources_chirho.write_chirho(
                root_chirho
                / "queue-chirho/books-chirho/matthew-chirho/chapter-007-chirho/installed-scenes-chirho.json",
                {
                    "scenes_chirho": [
                        {"lesson_id_chirho": "Matt.7.2"},
                        {"lesson_id_chirho": "Matt.7.4"},
                    ]
                },
            )
            sources_chirho.write_chirho(
                root_chirho
                / "queue-chirho/books-chirho/matthew-chirho/chapter-008-chirho/installed-scenes-chirho.json",
                {"scenes_chirho": [{"lesson_id_chirho": "Matt.8.1"}]},
            )
            chosen_chirho = list(
                module_chirho.candidates_chirho(root_chirho, runner_chirho)
            )
            self_chirho.assertEqual(1, len(chosen_chirho))
            self_chirho.assertEqual(7, chosen_chirho[0][0].chapter_chirho)
            self_chirho.assertEqual(
                ["Matt.7.1", "Matt.7.2", "Matt.7.4"],
                [row_chirho["id_chirho"] for row_chirho in chosen_chirho[0][1]],
            )


if __name__ == "__main__":
    unittest_chirho.main()
