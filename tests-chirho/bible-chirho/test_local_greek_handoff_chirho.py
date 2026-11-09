# For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life. — John 3:16 (KJV)
"""Finite adapter replay uses real codecs and the unchanged decoder/encoder; never audio playback."""

import hashlib as hashlib_chirho
import importlib.util as util_chirho
import json as json_chirho
import shutil as shutil_chirho
import subprocess as subprocess_chirho
import tempfile as tempfile_chirho
import unittest as unittest_chirho
from pathlib import Path as PathChirho
from unittest.mock import patch as patch_chirho

ROOT_CHIRHO = PathChirho(__file__).resolve().parents[2]
SPEC_CHIRHO = util_chirho.spec_from_file_location(
    "handoff_prepare_chirho",
    ROOT_CHIRHO
    / "scripts-chirho/audio-chirho/local-greek-chirho/prepare_handoff_chirho.py",
)
PREPARE_CHIRHO = util_chirho.module_from_spec(SPEC_CHIRHO)
SPEC_CHIRHO.loader.exec_module(PREPARE_CHIRHO)
RUN_CHIRHO = "workspace-chirho/audio-chirho/local-greek-verses-2026-11-07-chirho"
HOME_CHIRHO = "build-chirho/finite-handoff-chirho"


def digest_chirho(bytes_chirho):
    return hashlib_chirho.sha256(bytes_chirho).hexdigest()


class HandoffPreparationTestChirho(unittest_chirho.TestCase):
    def setUp(self):
        self.temporary_chirho = tempfile_chirho.TemporaryDirectory(
            prefix="handoff-codecs-chirho-"
        )
        self.root_chirho = PathChirho(self.temporary_chirho.name).resolve()
        self.addCleanup(self.temporary_chirho.cleanup)
        source_chirho = (
            ROOT_CHIRHO / "static/content-chirho/mark-chirho/chapter-03-chirho.json"
        ).read_bytes()
        source_path_chirho = (
            self.root_chirho
            / "static/content-chirho/mark-chirho/chapter-03-chirho.json"
        )
        source_path_chirho.parent.mkdir(parents=True)
        source_path_chirho.write_bytes(source_chirho)
        tone_chirho = self.root_chirho / "tone-chirho"
        subprocess_chirho.run(
            [
                "ffmpeg",
                "-v",
                "error",
                "-nostdin",
                "-n",
                "-f",
                "lavfi",
                "-i",
                "sine=frequency=440:duration=0.2",
                "-ar",
                "24000",
                "-ac",
                "1",
                "-c:a",
                "libmp3lame",
                "-b:a",
                "64k",
                str(tone_chirho) + ".mp3",
                "-ar",
                "24000",
                "-ac",
                "1",
                "-c:a",
                "flac",
                str(tone_chirho) + ".flac",
            ],
            check=True,
        )
        self.jobs_chirho = []
        for number_chirho, lesson_chirho in enumerate(
            json_chirho.loads(source_chirho)["verses_chirho"][2:4], 1
        ):
            job_id_chirho = f"v{number_chirho:04d}"
            take_path_chirho = f"takes-chirho/{job_id_chirho}-chirho.mp3"
            raw_path_chirho = f"raw-chirho/{job_id_chirho}-chirho.flac"
            for name_chirho, extension_chirho in [
                (take_path_chirho, "mp3"),
                (raw_path_chirho, "flac"),
            ]:
                path_chirho = self.root_chirho / RUN_CHIRHO / name_chirho
                path_chirho.parent.mkdir(parents=True, exist_ok=True)
                shutil_chirho.copyfile(
                    str(tone_chirho) + "." + extension_chirho, path_chirho
                )
            mp3_chirho = (self.root_chirho / RUN_CHIRHO / take_path_chirho).read_bytes()
            raw_chirho = (self.root_chirho / RUN_CHIRHO / raw_path_chirho).read_bytes()
            canonical_chirho = lesson_chirho["canonical_text_chirho"]
            self.jobs_chirho.append(
                {
                    "job_chirho": job_id_chirho,
                    "verse_id_chirho": lesson_chirho["id_chirho"],
                    "content_path_chirho": "mark-chirho/chapter-03-chirho.json",
                    "content_sha256_chirho": digest_chirho(source_chirho),
                    "canonical_text_chirho": canonical_chirho,
                    "canonical_sha256_chirho": digest_chirho(canonical_chirho.encode()),
                    "sent_chirho": canonical_chirho,
                    "sent_sha256_chirho": digest_chirho(canonical_chirho.encode()),
                    "state_chirho": "done",
                    "chosen_chirho": {
                        "path_chirho": take_path_chirho,
                        "sha256_chirho": digest_chirho(mp3_chirho),
                        "bytes_chirho": len(mp3_chirho),
                        "seconds_chirho": 0.2,
                        "flag_chirho": None,
                        "raw_path_chirho": raw_path_chirho,
                        "raw_sha256_chirho": digest_chirho(raw_chirho),
                        "seed_chirho": 1,
                        "sample_rate_chirho": 24000,
                        "asr_chirho": {
                            "sha256_chirho": digest_chirho(mp3_chirho),
                            "job_chirho": job_id_chirho,
                            "cer_chirho": 0.1,
                        },
                    },
                }
            )
        manifest_chirho = json_chirho.dumps({"jobs_chirho": self.jobs_chirho}) + "\n"
        self.description_chirho = {
            "manifest_sha256_chirho": digest_chirho(manifest_chirho.encode()),
            "manifest_json_chirho": manifest_chirho,
            "run_home_chirho": RUN_CHIRHO,
            "jobs_chirho": self.jobs_chirho,
        }

    def describe_fixture_chirho(
        self,
        _root_chirho,
        _handoff_chirho,
        _digest_chirho,
        _home_chirho,
        parts_chirho=False,
    ):
        if parts_chirho:
            prepared_chirho = json_chirho.loads(
                (self.root_chirho / HOME_CHIRHO / "prepared-chirho.json").read_bytes()
            )
            return [
                {
                    "prepared_home_chirho": HOME_CHIRHO
                    + "/catalogue-parts-chirho/0000-chirho/part-0001-chirho",
                    "prepared_chirho": prepared_chirho,
                }
            ]
        return self.description_chirho

    def prepare_chirho(self):
        with patch_chirho.object(
            PREPARE_CHIRHO, "describe_chirho", self.describe_fixture_chirho
        ):
            return PREPARE_CHIRHO.prepare_handoff_chirho(
                self.root_chirho, "handoff-chirho.json", "f" * 64, HOME_CHIRHO, True
            )

    def test_actual_decode_derivation_and_completed_replay_are_exact_chirho(self):
        self.assertEqual(self.prepare_chirho()["independently_rederived_chirho"], 2)
        home_chirho = self.root_chirho / HOME_CHIRHO
        before_chirho = {
            str(path_chirho.relative_to(home_chirho)): path_chirho.read_bytes()
            for path_chirho in home_chirho.rglob("*")
            if path_chirho.is_file()
        }
        self.assertEqual(self.prepare_chirho()["parts_chirho"], 1)
        after_chirho = {
            str(path_chirho.relative_to(home_chirho)): path_chirho.read_bytes()
            for path_chirho in home_chirho.rglob("*")
            if path_chirho.is_file()
        }
        self.assertEqual(before_chirho, after_chirho)
        rows_chirho = json_chirho.loads(
            (home_chirho / "prepared-chirho.json").read_bytes()
        )["recordings_chirho"]
        self.assertEqual(
            [row_chirho["job_chirho"] for row_chirho in rows_chirho], ["v0001", "v0002"]
        )
        self.assertFalse((home_chirho / "prepare-lock-chirho").exists())

    def test_a_plausible_but_changed_delivery_is_not_trusted_chirho(self):
        self.prepare_chirho()
        path_chirho = (
            self.root_chirho / HOME_CHIRHO / "delivery-chirho/v0001-chirho.mp3"
        )
        bytes_chirho = path_chirho.read_bytes()
        path_chirho.write_bytes(bytes_chirho[:-1] + bytes([bytes_chirho[-1] ^ 1]))
        with self.assertRaisesRegex(ValueError, "independent derivation"):
            self.prepare_chirho()
        self.assertFalse(
            (self.root_chirho / HOME_CHIRHO / "prepare-lock-chirho").exists()
        )

    def test_changed_raw_or_canonical_inputs_refuse_before_prepared_files_chirho(self):
        raw_chirho = (
            self.root_chirho
            / RUN_CHIRHO
            / self.jobs_chirho[1]["chosen_chirho"]["raw_path_chirho"]
        )
        raw_chirho.write_bytes(b"changed original")
        with self.assertRaisesRegex(ValueError, "bytes differ"):
            self.prepare_chirho()
        self.assertFalse(
            (self.root_chirho / HOME_CHIRHO / "prepared-chirho.json").exists()
        )

    def test_redirected_output_never_receives_delivery_files_chirho(self):
        outside_chirho = self.root_chirho / "outside-chirho"
        outside_chirho.mkdir()
        home_chirho = self.root_chirho / HOME_CHIRHO
        home_chirho.parent.mkdir(parents=True)
        home_chirho.symlink_to(outside_chirho, target_is_directory=True)
        with self.assertRaisesRegex(ValueError, "Redirected"):
            self.prepare_chirho()
        self.assertEqual(list(outside_chirho.iterdir()), [])


if __name__ == "__main__":
    unittest_chirho.main()
