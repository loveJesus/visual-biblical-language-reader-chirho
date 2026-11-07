# For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life. — John 3:16 (KJV)
"""A catalogue declaration cannot become a background completion without R2 proof."""

import importlib.util as importlib_chirho
import sys as sys_chirho
import tempfile as tempfile_chirho
import unittest as unittest_chirho
from pathlib import Path as PathChirho
from unittest import mock as mock_chirho

ROOT_CHIRHO = PathChirho(__file__).resolve().parents[3]
sys_chirho.path.insert(
    0, str(ROOT_CHIRHO / "scripts-chirho/art-chirho/book-openers-chirho")
)
SPEC_CHIRHO = importlib_chirho.spec_from_file_location(
    "opening_install_chirho",
    ROOT_CHIRHO / "scripts-chirho/art-chirho/book-openers-chirho/install_chirho.py",
)
INSTALL_CHIRHO = importlib_chirho.module_from_spec(SPEC_CHIRHO)
SPEC_CHIRHO.loader.exec_module(INSTALL_CHIRHO)


class ProviderAdoptionTestsChirho(unittest_chirho.TestCase):
    def test_remote_failure_keeps_checkpoint_absent_and_success_adopts_exact_record_chirho(
        self_chirho,
    ):
        with tempfile_chirho.TemporaryDirectory() as name_chirho:
            root_chirho = PathChirho(name_chirho)
            job_chirho = {
                "id_chirho": "Mark.1.1",
                "book_id_chirho": "Mark",
                "slug_chirho": "mark-chirho",
            }
            record_chirho = {
                "lesson_id_chirho": "Mark.1.1",
                "model_chirho": "openai:gpt-image@2.6-flare",
            }
            catalogue_path_chirho = (
                root_chirho / INSTALL_CHIRHO.sources_chirho.CATALOGUE_CHIRHO
            )
            INSTALL_CHIRHO.sources_chirho.write_chirho(
                catalogue_path_chirho,
                {"schema_version_chirho": 1, "scenes_chirho": [record_chirho]},
            )
            checkpoint_chirho = (
                root_chirho
                / INSTALL_CHIRHO.sources_chirho.HOME_CHIRHO
                / "books-chirho/mark-chirho/chapter-001-chirho/installed-scenes-chirho.json"
            )
            with (
                mock_chirho.patch.object(
                    INSTALL_CHIRHO.provider_chirho, "source_chirho"
                ),
                mock_chirho.patch.object(
                    INSTALL_CHIRHO.runner_chirho.BASE_CHIRHO,
                    "remote_record_chirho",
                    side_effect=OSError("R2 bytes differ"),
                ),
                self_chirho.assertRaises(OSError),
            ):
                INSTALL_CHIRHO.adopt_chirho(
                    root_chirho,
                    [(job_chirho, root_chirho / "attempt-chirho", record_chirho)],
                )
            self_chirho.assertFalse(checkpoint_chirho.exists())
            with (
                mock_chirho.patch.object(
                    INSTALL_CHIRHO.provider_chirho, "source_chirho"
                ),
                mock_chirho.patch.object(
                    INSTALL_CHIRHO.runner_chirho.BASE_CHIRHO, "remote_record_chirho"
                ) as remote_chirho,
            ):
                INSTALL_CHIRHO.adopt_chirho(
                    root_chirho,
                    [(job_chirho, root_chirho / "attempt-chirho", record_chirho)],
                )
                remote_chirho.assert_called_once_with(root_chirho, record_chirho)
            self_chirho.assertEqual(
                [record_chirho],
                INSTALL_CHIRHO.sources_chirho.read_chirho(checkpoint_chirho)[
                    "scenes_chirho"
                ],
            )
            with self_chirho.assertRaises(ValueError):
                INSTALL_CHIRHO.adopt_chirho(
                    root_chirho,
                    [
                        (
                            job_chirho,
                            root_chirho / "attempt-chirho",
                            record_chirho | {"model_chirho": "other"},
                        )
                    ],
                )


if __name__ == "__main__":
    unittest_chirho.main()
