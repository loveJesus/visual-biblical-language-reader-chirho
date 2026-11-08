# For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life. — John 3:16 (KJV)
"""The finite correction cannot become a generic timing shift or mutate older preparation."""

import copy as copy_chirho
import importlib.util as importlib_chirho
import json as json_chirho
import struct as struct_chirho
import tempfile as tempfile_chirho
import unittest as unittest_chirho
from pathlib import Path as PathChirho
from unittest import mock as mock_chirho

ROOT_CHIRHO = PathChirho(__file__).resolve().parents[3]


def module_chirho(name_chirho):
    spec_chirho = importlib_chirho.spec_from_file_location(
        name_chirho,
        ROOT_CHIRHO
        / "scripts-chirho/audio-chirho/readings-chirho"
        / (name_chirho + ".py"),
    )
    value_chirho = importlib_chirho.module_from_spec(spec_chirho)
    spec_chirho.loader.exec_module(value_chirho)
    return value_chirho


CORRECTION_CHIRHO = module_chirho("beeri_correction_chirho")
PREPARE_CHIRHO = module_chirho("beeri_prepare_chirho")


def fixture_chirho():
    source_bytes_chirho = b"preserved source bytes, not a generated recording"
    timings_chirho = bytes([20, 3, 1]) + struct_chirho.pack(">II", 600, 0)
    verses_chirho = [
        {
            "lesson_id_chirho": f"Prov.3.{number_chirho}",
            "text_chirho": f"source {number_chirho}",
            "canonical_sha256_chirho": str(number_chirho) * 64,
        }
        for number_chirho in (1, 2)
    ]
    snapshot_chirho = {
        "book_id_chirho": "Prov",
        "chapter_chirho": 3,
        "content_path_chirho": "/content-chirho/proverbs-chirho/chapter-03-chirho.json",
        "content_sha256_chirho": "a" * 64,
        "verses_chirho": verses_chirho,
    }
    source_chirho = {
        "gbt_id_chirho": "OT/RDB/Pro",
        "package_sha256_chirho": "b" * 64,
        "manifest_sha256_chirho": "c" * 64,
        "files_chirho": {
            "chapter-003-chirho.mp3": CORRECTION_CHIRHO.sha_chirho(source_bytes_chirho),
            "timings-chirho.bin": CORRECTION_CHIRHO.sha_chirho(timings_chirho),
        },
    }
    record_chirho = {
        "lesson_id_chirho": "Prov.3.1",
        "chapter_chirho": 3,
        "content_path_chirho": snapshot_chirho["content_path_chirho"],
        "content_sha256_chirho": "a" * 64,
        "canonical_sha256_chirho": "1" * 64,
        "spoken_sha256_chirho": CORRECTION_CHIRHO.sha_chirho(b"source 1"),
        "chapter_sha256_chirho": CORRECTION_CHIRHO.sha_chirho(source_bytes_chirho),
        "chapter_duration_chirho": 20,
        "source_verses_chirho": 2,
        "timed_records_chirho": 1,
        "start_chirho": 0,
        "end_chirho": 6,
    }
    definition_chirho = {
        **source_chirho,
        "timings_sha256_chirho": CORRECTION_CHIRHO.sha_chirho(timings_chirho),
        "source_evidence_sha256_chirho": "d" * 64,
        "chapters_chirho": [record_chirho],
    }
    return (
        definition_chirho,
        snapshot_chirho,
        source_chirho,
        source_bytes_chirho,
        timings_chirho,
    )


class CorrectedOpeningTestsChirho(unittest_chirho.TestCase):
    def test_changed_source_text_and_prior_plan_refuse_chirho(self_chirho):
        record_bytes_chirho = (
            ROOT_CHIRHO / CORRECTION_CHIRHO.RECORD_PATH_CHIRHO
        ).read_bytes()
        definition_chirho = CORRECTION_CHIRHO.decode_definition_chirho(
            record_bytes_chirho
        )
        with tempfile_chirho.TemporaryDirectory() as temporary_chirho:
            root_chirho = PathChirho(temporary_chirho)
            record_path_chirho = root_chirho / CORRECTION_CHIRHO.RECORD_PATH_CHIRHO
            source_path_chirho = (
                root_chirho / definition_chirho["source_text_chirho"]["path_chirho"]
            )
            prior_path_chirho = (
                root_chirho / definition_chirho["prior_plan_path_chirho"]
            )
            for path_chirho in (
                record_path_chirho,
                source_path_chirho,
                prior_path_chirho,
            ):
                path_chirho.parent.mkdir(parents=True, exist_ok=True)
            record_path_chirho.write_bytes(record_bytes_chirho)
            source_path_chirho.write_bytes(b"changed source")
            prior_path_chirho.write_bytes(b"changed old plan")
            for source_bytes_chirho in (
                b"changed source",
                (
                    ROOT_CHIRHO / definition_chirho["source_text_chirho"]["path_chirho"]
                ).read_bytes(),
            ):
                source_path_chirho.write_bytes(source_bytes_chirho)
                with self_chirho.assertRaisesRegex(ValueError, "source text or prior"):
                    CORRECTION_CHIRHO.definition_chirho(
                        root_chirho,
                        CORRECTION_CHIRHO.PHASE_CHIRHO,
                        root_chirho / CORRECTION_CHIRHO.RUN_PATH_CHIRHO,
                        ["Prov"],
                        None,
                    )

    def test_pinned_record_and_phase_are_exact_chirho(self_chirho):
        bytes_chirho = (ROOT_CHIRHO / CORRECTION_CHIRHO.RECORD_PATH_CHIRHO).read_bytes()
        record_chirho = CORRECTION_CHIRHO.decode_definition_chirho(bytes_chirho)
        self_chirho.assertEqual(
            record_chirho["phase_chirho"], CORRECTION_CHIRHO.PHASE_CHIRHO
        )
        self_chirho.assertEqual(len(record_chirho["chapters_chirho"]), 12)
        with self_chirho.assertRaises(ValueError):
            CORRECTION_CHIRHO.decode_definition_chirho(bytes_chirho + b" ")
        for phase_chirho, books_chirho, limit_chirho in [
            ("other-chirho", ["Prov"], None),
            (CORRECTION_CHIRHO.PHASE_CHIRHO, ["Gen", "Prov"], None),
            (CORRECTION_CHIRHO.PHASE_CHIRHO, ["Prov"], 3),
        ]:
            with self_chirho.assertRaises(ValueError):
                CORRECTION_CHIRHO.definition_chirho(
                    ROOT_CHIRHO,
                    phase_chirho,
                    ROOT_CHIRHO / CORRECTION_CHIRHO.RUN_PATH_CHIRHO,
                    books_chirho,
                    limit_chirho,
                )

    def test_only_the_checked_opening_is_returned_chirho(self_chirho):
        self_chirho.assertEqual(
            CORRECTION_CHIRHO.opening_rows_chirho(*fixture_chirho()),
            [
                {"verse_chirho": 1, "start_chirho": 0},
                {"verse_chirho": 2, "start_chirho": 6},
            ],
        )

    def test_source_timing_canonical_and_incorrect_verse_refuse_chirho(self_chirho):
        for changed_index_chirho, field_chirho, value_chirho in [
            (1, "chapter_chirho", 4),
            (1, "content_sha256_chirho", "e" * 64),
            (2, "package_sha256_chirho", "e" * 64),
        ]:
            args_chirho = list(copy_chirho.deepcopy(fixture_chirho()))
            args_chirho[changed_index_chirho][field_chirho] = value_chirho
            with self_chirho.assertRaises(ValueError):
                CORRECTION_CHIRHO.opening_rows_chirho(*args_chirho)
        for changed_index_chirho in (3, 4):
            args_chirho = list(fixture_chirho())
            args_chirho[changed_index_chirho] += b"x"
            with self_chirho.assertRaises(ValueError):
                CORRECTION_CHIRHO.opening_rows_chirho(*args_chirho)
        args_chirho = list(copy_chirho.deepcopy(fixture_chirho()))
        args_chirho[2]["files_chirho"]["chapter-003-chirho.mp3"] = "e" * 64
        with self_chirho.assertRaises(ValueError):
            CORRECTION_CHIRHO.opening_rows_chirho(*args_chirho)
        for field_chirho, value_chirho in [
            ("lesson_id_chirho", "Prov.3.2"),
            ("text_chirho", "different"),
            ("canonical_sha256_chirho", "e" * 64),
        ]:
            args_chirho = list(copy_chirho.deepcopy(fixture_chirho()))
            args_chirho[1]["verses_chirho"][0][field_chirho] = value_chirho
            with self_chirho.assertRaises(ValueError):
                CORRECTION_CHIRHO.opening_rows_chirho(*args_chirho)

    def test_phase_resume_keeps_old_hold_and_reuses_the_exact_prepared_bytes_chirho(
        self_chirho,
    ):
        (
            definition_chirho,
            snapshot_chirho,
            source_chirho,
            source_bytes_chirho,
            timing_bytes_chirho,
        ) = fixture_chirho()
        with tempfile_chirho.TemporaryDirectory() as temporary_chirho:
            root_chirho = PathChirho(temporary_chirho)
            run_chirho = root_chirho / "workspace-chirho/audio-chirho/run-chirho"
            home_chirho = run_chirho / "books-chirho/proverbs-chirho"
            source_home_chirho = home_chirho / "source-chirho"
            snapshot_home_chirho = home_chirho / "snapshots-chirho"
            chapter_home_chirho = home_chirho / "chapters-chirho/003-chirho"
            for folder_chirho in (
                source_home_chirho,
                snapshot_home_chirho,
                chapter_home_chirho,
            ):
                folder_chirho.mkdir(parents=True)
            (source_home_chirho / "chapter-003-chirho.mp3").write_bytes(
                source_bytes_chirho
            )
            (source_home_chirho / "timings-chirho.bin").write_bytes(timing_bytes_chirho)
            (source_home_chirho / "source-chirho.json").write_text(
                json_chirho.dumps(source_chirho)
            )
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
                                "sha256_chirho": CORRECTION_CHIRHO.sha_chirho(
                                    snapshot_bytes_chirho
                                ),
                            }
                        ]
                    }
                )
            )
            hold_chirho = chapter_home_chirho / "hold-chirho.json"
            hold_chirho.write_bytes(b'{"reason_chirho":"old immutable hold"}\n')
            before_chirho = hold_chirho.read_bytes()
            generated_chirho = []

            def run_stub_chirho(command_chirho, **_options_chirho):
                if command_chirho[0] == "ffmpeg":
                    PathChirho(command_chirho[-1]).write_bytes(b"stub cut bytes")
                    generated_chirho.append(command_chirho)

            with (
                mock_chirho.patch.multiple(PREPARE_CHIRHO, ROOT_CHIRHO=root_chirho),
                mock_chirho.patch.object(
                    PREPARE_CHIRHO, "package_chirho", return_value=source_chirho
                ),
                mock_chirho.patch.object(
                    PREPARE_CHIRHO, "pauses_chirho", return_value=[(5.8, 6.2)]
                ),
                mock_chirho.patch.object(
                    PREPARE_CHIRHO,
                    "inspect_chirho",
                    side_effect=lambda path_chirho: (
                        20 if path_chirho.parent == source_home_chirho else 6
                    ),
                ),
                mock_chirho.patch.object(
                    PREPARE_CHIRHO.subprocess_chirho, "run", side_effect=run_stub_chirho
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
                record_path_chirho = chapter_home_chirho / "001-chirho.json"
                record_chirho = json_chirho.loads(record_path_chirho.read_text())
                record_chirho["source_chirho"]["end_chirho"] = 7
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
                record_chirho["source_chirho"]["end_chirho"] = 6
                record_path_chirho.write_text(json_chirho.dumps(record_chirho))
            self_chirho.assertEqual(len(generated_chirho), 1)
            self_chirho.assertEqual(before_chirho, hold_chirho.read_bytes())
            record_chirho = json_chirho.loads(
                (chapter_home_chirho / "001-chirho.json").read_text()
            )
            self_chirho.assertEqual(record_chirho["source_chirho"]["start_chirho"], 0)
            self_chirho.assertEqual(record_chirho["source_chirho"]["end_chirho"], 6)
            self_chirho.assertEqual(
                record_chirho["source_correction_sha256_chirho"], "d" * 64
            )


if __name__ == "__main__":
    unittest_chirho.main()
