# For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life. — John 3:16 (KJV)
"""Finite remainder preparation preserves the opening-only phase and old source bytes."""

import copy as copy_chirho
import importlib.util as importlib_chirho
import json as json_chirho
import tempfile as tempfile_chirho
import unittest as unittest_chirho
from pathlib import Path as PathChirho
from unittest import mock as mock_chirho

SPEC_CHIRHO = importlib_chirho.spec_from_file_location(
    "old_tests_chirho",
    PathChirho(__file__).with_name("test_beeri_corrections_chirho.py"),
)
OLD_CHIRHO = importlib_chirho.module_from_spec(SPEC_CHIRHO)
SPEC_CHIRHO.loader.exec_module(OLD_CHIRHO)
ROOT_CHIRHO = OLD_CHIRHO.ROOT_CHIRHO
PREPARE_CHIRHO = OLD_CHIRHO.PREPARE_CHIRHO
REMAINDER_CHIRHO = PREPARE_CHIRHO.PROVERBS_CHIRHO


def fixture_chirho():
    args_chirho = list(OLD_CHIRHO.fixture_chirho())
    definition_chirho = args_chirho[0]
    definition_chirho["phase_chirho"] = REMAINDER_CHIRHO.PHASE_CHIRHO
    definition_chirho["chapters_chirho"][0]["windows_chirho"] = [
        {
            "lesson_id_chirho": "Prov.3.2",
            "start_chirho": 6,
            "end_chirho": 20,
            "canonical_sha256_chirho": "2" * 64,
            "spoken_sha256_chirho": REMAINDER_CHIRHO.sha_chirho(b"source 2"),
        }
    ]
    args_chirho.append([{"verse_chirho": 1, "start_chirho": 6}])
    return args_chirho


class RemainingProverbsTestsChirho(unittest_chirho.TestCase):
    def test_definition_is_exact_and_embeds_all_finite_members_chirho(self_chirho):
        bytes_chirho = (ROOT_CHIRHO / REMAINDER_CHIRHO.RECORD_PATH_CHIRHO).read_bytes()
        self_chirho.assertEqual(
            REMAINDER_CHIRHO.sha_chirho(bytes_chirho),
            REMAINDER_CHIRHO.RECORD_SHA_CHIRHO,
        )
        value_chirho = json_chirho.loads(bytes_chirho)
        self_chirho.assertEqual(len(value_chirho["chapters_chirho"]), 12)
        self_chirho.assertEqual(
            sum(
                len(row_chirho["windows_chirho"])
                for row_chirho in value_chirho["chapters_chirho"]
            ),
            342,
        )
        for row_chirho in value_chirho["chapters_chirho"]:
            self_chirho.assertEqual(
                [
                    window_chirho["lesson_id_chirho"]
                    for window_chirho in row_chirho["windows_chirho"]
                ],
                [
                    f"Prov.{row_chirho['chapter_chirho']}.{number_chirho}"
                    for number_chirho in range(
                        2, row_chirho["source_verses_chirho"] + 1
                    )
                ],
            )
        for phase_chirho, books_chirho, limit_chirho in [
            ("other-chirho", ["Prov"], None),
            (REMAINDER_CHIRHO.PHASE_CHIRHO, ["Gen"], None),
            (REMAINDER_CHIRHO.PHASE_CHIRHO, ["Prov"], 3),
        ]:
            with self_chirho.assertRaises(ValueError):
                REMAINDER_CHIRHO.definition_chirho(
                    ROOT_CHIRHO,
                    phase_chirho,
                    ROOT_CHIRHO / REMAINDER_CHIRHO.RUN_PATH_CHIRHO,
                    books_chirho,
                    limit_chirho,
                )

    def test_final_verse_uses_proved_source_duration_and_old_opening_stays_same_chirho(
        self_chirho,
    ):
        args_chirho = fixture_chirho()
        self_chirho.assertEqual(
            REMAINDER_CHIRHO.aligned_rows_chirho(*args_chirho),
            [{"verse_chirho": 2, "start_chirho": 6}],
        )
        self_chirho.assertEqual(
            OLD_CHIRHO.CORRECTION_CHIRHO.opening_rows_chirho(*args_chirho[:5]),
            [
                {"verse_chirho": 1, "start_chirho": 0},
                {"verse_chirho": 2, "start_chirho": 6},
            ],
        )
        self_chirho.assertEqual(
            PREPARE_CHIRHO.window_chirho(
                REMAINDER_CHIRHO.aligned_rows_chirho(*args_chirho), 0, 20, [(5.8, 6.2)]
            ),
            (6, 20),
        )

    def test_source_membership_text_and_window_tampering_refuse_chirho(self_chirho):
        for kind_chirho in range(9):
            args_chirho = copy_chirho.deepcopy(fixture_chirho())
            if kind_chirho == 0:
                args_chirho[3] += b"changed"
            elif kind_chirho == 1:
                args_chirho[4] += b"changed"
            elif kind_chirho == 2:
                args_chirho[2]["package_sha256_chirho"] = "f" * 64
            elif kind_chirho == 3:
                args_chirho[1]["verses_chirho"][1]["text_chirho"] = "wrong"
            elif kind_chirho == 4:
                args_chirho[1]["verses_chirho"][1]["canonical_sha256_chirho"] = "f" * 64
            elif kind_chirho == 5:
                args_chirho[0]["chapters_chirho"][0]["windows_chirho"][0][
                    "start_chirho"
                ] = 7
            elif kind_chirho == 6:
                args_chirho[0]["chapters_chirho"][0]["windows_chirho"][0][
                    "end_chirho"
                ] = 19
            elif kind_chirho == 7:
                args_chirho[-1][0]["verse_chirho"] = 2
            else:
                args_chirho[1]["verses_chirho"] = args_chirho[1]["verses_chirho"][:1]
            with self_chirho.assertRaises(ValueError):
                REMAINDER_CHIRHO.aligned_rows_chirho(*args_chirho)

    def test_prepare_and_resume_write_only_new_phase_chirho(self_chirho):
        (
            definition_chirho,
            snapshot_chirho,
            source_chirho,
            source_bytes_chirho,
            timing_bytes_chirho,
            _rows_chirho,
        ) = fixture_chirho()
        with tempfile_chirho.TemporaryDirectory() as temporary_chirho:
            root_chirho = PathChirho(temporary_chirho)
            run_chirho = root_chirho / REMAINDER_CHIRHO.RUN_PATH_CHIRHO
            old_home_chirho = run_chirho / "books-chirho/proverbs-chirho"
            source_home_chirho = old_home_chirho / "source-chirho"
            snapshot_home_chirho = old_home_chirho / "snapshots-chirho"
            source_home_chirho.mkdir(parents=True)
            snapshot_home_chirho.mkdir()
            (source_home_chirho / "source-chirho.json").write_text(
                json_chirho.dumps(source_chirho)
            )
            (source_home_chirho / "chapter-003-chirho.mp3").write_bytes(
                source_bytes_chirho
            )
            (source_home_chirho / "timings-chirho.bin").write_bytes(timing_bytes_chirho)
            snapshot_bytes_chirho = json_chirho.dumps(snapshot_chirho).encode()
            (snapshot_home_chirho / "chapter-003-chirho.json").write_bytes(
                snapshot_bytes_chirho
            )
            (snapshot_home_chirho / "index-chirho.json").write_text(
                json_chirho.dumps(
                    {
                        "chapters_chirho": [
                            {
                                "chapter_chirho": 3,
                                "path_chirho": "chapter-003-chirho.json",
                                "sha256_chirho": REMAINDER_CHIRHO.sha_chirho(
                                    snapshot_bytes_chirho
                                ),
                            }
                        ]
                    }
                )
            )
            hold_chirho = (
                old_home_chirho / "chapters-chirho/003-chirho/hold-chirho.json"
            )
            hold_chirho.parent.mkdir(parents=True)
            hold_chirho.write_bytes(b"old hold remains")
            old_bytes_chirho = {
                str(path_chirho): path_chirho.read_bytes()
                for path_chirho in old_home_chirho.rglob("*")
                if path_chirho.is_file()
            }
            generated_chirho = []

            def run_chirho_stub(command_chirho, **_options_chirho):
                self_chirho.assertEqual(command_chirho[0], "ffmpeg")
                PathChirho(command_chirho[-1]).write_bytes(b"new cut only")
                generated_chirho.append(command_chirho)

            with (
                mock_chirho.patch.object(PREPARE_CHIRHO, "ROOT_CHIRHO", root_chirho),
                mock_chirho.patch.object(
                    PREPARE_CHIRHO, "pauses_chirho", return_value=[(5.8, 6.2)]
                ),
                mock_chirho.patch.object(
                    PREPARE_CHIRHO,
                    "inspect_chirho",
                    side_effect=lambda path_chirho: (
                        20 if path_chirho.parent == source_home_chirho else 14
                    ),
                ),
                mock_chirho.patch.object(
                    PREPARE_CHIRHO.subprocess_chirho, "run", side_effect=run_chirho_stub
                ),
                mock_chirho.patch.object(
                    PREPARE_CHIRHO.shutil_chirho,
                    "disk_usage",
                    return_value=type("UsageChirho", (), {"free": 40 * 1024**3})(),
                ),
            ):
                for _index_chirho in range(2):
                    result_chirho = PREPARE_CHIRHO.prepare_chirho(
                        run_chirho,
                        {
                            "slug_chirho": "proverbs-chirho",
                            "id_chirho": "Prov",
                            "gbt_file_chirho": "20-Pro.json",
                        },
                        {},
                        None,
                        definition_chirho,
                    )
                    self_chirho.assertEqual(result_chirho["prepared_chirho"], 1)
                record_path_chirho = (
                    run_chirho
                    / REMAINDER_CHIRHO.PHASE_CHIRHO
                    / "books-chirho/proverbs-chirho/chapters-chirho/003-chirho/002-chirho.json"
                )
                record_chirho = json_chirho.loads(record_path_chirho.read_bytes())
                record_chirho["source_chirho"]["end_chirho"] = 19
                record_path_chirho.write_text(json_chirho.dumps(record_chirho))
                with self_chirho.assertRaisesRegex(ValueError, "Existing corrected"):
                    PREPARE_CHIRHO.prepare_chirho(
                        run_chirho,
                        {
                            "slug_chirho": "proverbs-chirho",
                            "id_chirho": "Prov",
                            "gbt_file_chirho": "20-Pro.json",
                        },
                        {},
                        None,
                        definition_chirho,
                    )
            self_chirho.assertEqual(len(generated_chirho), 1)
            self_chirho.assertEqual(
                old_bytes_chirho,
                {
                    str(path_chirho): path_chirho.read_bytes()
                    for path_chirho in old_home_chirho.rglob("*")
                    if path_chirho.is_file()
                },
            )


if __name__ == "__main__":
    unittest_chirho.main()
