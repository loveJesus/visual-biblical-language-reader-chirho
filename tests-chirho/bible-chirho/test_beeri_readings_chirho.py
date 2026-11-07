# For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life. — John 3:16 (KJV)
"""Source timing and immutable-resume trust boundaries for human verse recordings."""

import importlib.util as importlib_chirho
import json as json_chirho
import struct as struct_chirho
import tempfile as tempfile_chirho
import unittest as unittest_chirho
from pathlib import Path as PathChirho

ROOT_CHIRHO = PathChirho(__file__).resolve().parents[2]
SPEC_CHIRHO = importlib_chirho.spec_from_file_location(
    "beeri_prepare_chirho",
    ROOT_CHIRHO / "scripts-chirho/audio-chirho/readings-chirho/beeri_prepare_chirho.py",
)
MODULE_CHIRHO = importlib_chirho.module_from_spec(SPEC_CHIRHO)
SPEC_CHIRHO.loader.exec_module(MODULE_CHIRHO)


class BeeriTimingTestsChirho(unittest_chirho.TestCase):
    def test_rollover_end_uses_current_chapter_duration_chirho(self):
        bytes_chirho = (
            bytes([1, 1, 1])
            + struct_chirho.pack(">II", 59, 620)
            + bytes([1, 1, 2])
            + struct_chirho.pack(">II", 620, 0)
        )
        rows_chirho = MODULE_CHIRHO.timings_chirho(bytes_chirho, 1)[1]
        self.assertEqual(
            MODULE_CHIRHO.window_chirho(rows_chirho, 1, 15.0, [(6.0, 6.5)]), (6.2, 15.0)
        )

    def test_duplicate_foreign_and_torn_timings_refuse_chirho(self):
        row_chirho = bytes([1, 1, 1]) + struct_chirho.pack(">II", 0, 200)
        for bytes_chirho, book_chirho in [
            (row_chirho + row_chirho, 1),
            (row_chirho, 20),
            (row_chirho[:-1], 1),
        ]:
            with self.assertRaises(ValueError):
                MODULE_CHIRHO.timings_chirho(bytes_chirho, book_chirho)

    def test_mid_speech_boundary_refuses_chirho(self):
        rows_chirho = [{"start_chirho": 0}, {"start_chirho": 4}]
        with self.assertRaisesRegex(ValueError, "measured pause"):
            MODULE_CHIRHO.window_chirho(rows_chirho, 0, 10, [(2, 2.5), (7, 8)])

    def test_invalid_and_oversized_windows_refuse_chirho(self):
        for rows_chirho, duration_chirho in [
            ([{"start_chirho": 8}, {"start_chirho": 7}], 10),
            ([{"start_chirho": 0}], 121),
            ([{"start_chirho": 12}], 10),
        ]:
            with self.assertRaises(ValueError):
                MODULE_CHIRHO.window_chirho(rows_chirho, 0, duration_chirho, [(0, 130)])

    def test_immutable_evidence_reuses_identical_but_refuses_change_chirho(self):
        with tempfile_chirho.TemporaryDirectory() as folder_chirho:
            path_chirho = PathChirho(folder_chirho) / "record-chirho.json"
            MODULE_CHIRHO.write_json_chirho(path_chirho, {"value_chirho": 1})
            before_chirho = path_chirho.read_bytes()
            MODULE_CHIRHO.write_json_chirho(path_chirho, {"value_chirho": 1})
            self.assertEqual(before_chirho, path_chirho.read_bytes())
            self.assertEqual(json_chirho.loads(before_chirho)["value_chirho"], 1)
            with self.assertRaisesRegex(ValueError, "Immutable"):
                MODULE_CHIRHO.write_json_chirho(path_chirho, {"value_chirho": 2})


if __name__ == "__main__":
    unittest_chirho.main()
