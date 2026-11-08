# For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life. — John 3:16 (KJV)
"""Real local codecs and exclusive outputs; no speech generation, archive or network."""

import importlib.util as util_chirho
import json as json_chirho
import subprocess as subprocess_chirho
import tempfile as tempfile_chirho
import unittest as unittest_chirho
from pathlib import Path as PathChirho

ROOT_CHIRHO = PathChirho(__file__).resolve().parents[3]
SPEC_CHIRHO = util_chirho.spec_from_file_location(
    "phase_preparation_chirho",
    ROOT_CHIRHO
    / "scripts-chirho/audio-chirho/local-greek-chirho/prepare_phase_chirho.py",
)
MODULE_CHIRHO = util_chirho.module_from_spec(SPEC_CHIRHO)
SPEC_CHIRHO.loader.exec_module(MODULE_CHIRHO)


class PhasePreparationTestsChirho(unittest_chirho.TestCase):
    def setUp(self_chirho):
        temporary_chirho = tempfile_chirho.TemporaryDirectory()
        self_chirho.addCleanup(temporary_chirho.cleanup)
        self_chirho.root_chirho = PathChirho(temporary_chirho.name).resolve()
        self_chirho.run_chirho = (
            self_chirho.root_chirho
            / "workspace-chirho/audio-chirho/local-greek-verses-2026-11-07-chirho"
        )
        self_chirho.run_chirho.mkdir(parents=True)
        self_chirho.mp3_chirho = self_chirho.run_chirho / "original-chirho.mp3"
        self_chirho.raw_chirho = self_chirho.run_chirho / "original-chirho.flac"
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
                "sine=frequency=440:duration=0.4",
                "-ar",
                "24000",
                "-ac",
                "1",
                "-c:a",
                "libmp3lame",
                "-b:a",
                "64k",
                str(self_chirho.mp3_chirho),
                "-ar",
                "24000",
                "-ac",
                "1",
                "-c:a",
                "flac",
                str(self_chirho.raw_chirho),
            ],
            check=True,
            capture_output=True,
        )
        canonical_chirho = "θεός"
        chapter_chirho = json_chirho.dumps(
            {
                "verses_chirho": [
                    {"id_chirho": "Matt.1.2", "canonical_text_chirho": canonical_chirho}
                ]
            }
        ).encode()
        content_chirho = (
            self_chirho.root_chirho
            / "static/content-chirho/matthew-chirho/chapter-01-chirho.json"
        )
        content_chirho.parent.mkdir(parents=True)
        content_chirho.write_bytes(chapter_chirho)
        digest_chirho = MODULE_CHIRHO.COMMON_CHIRHO.digest_chirho
        self_chirho.job_chirho = {
            "job_chirho": "v0001",
            "verse_id_chirho": "Matt.1.2",
            "state_chirho": "done",
            "content_path_chirho": "matthew-chirho/chapter-01-chirho.json",
            "content_sha256_chirho": digest_chirho(chapter_chirho),
            "canonical_text_chirho": canonical_chirho,
            "canonical_sha256_chirho": digest_chirho(canonical_chirho.encode()),
            "sent_chirho": canonical_chirho,
            "sent_sha256_chirho": digest_chirho(canonical_chirho.encode()),
            "chosen_chirho": {
                "path_chirho": "original-chirho.mp3",
                "sha256_chirho": digest_chirho(self_chirho.mp3_chirho.read_bytes()),
                "bytes_chirho": self_chirho.mp3_chirho.stat().st_size,
                "raw_path_chirho": "original-chirho.flac",
                "raw_sha256_chirho": digest_chirho(self_chirho.raw_chirho.read_bytes()),
                "seconds_chirho": 0.4,
                "flag_chirho": None,
                "asr_chirho": {"cer_chirho": 0.1},
            },
        }

    def test_original_codec_hash_and_canonical_source_are_verified_chirho(self_chirho):
        MODULE_CHIRHO.verify_originals_chirho(
            self_chirho.root_chirho, self_chirho.job_chirho
        )
        original_chirho = self_chirho.raw_chirho.read_bytes()
        self_chirho.raw_chirho.write_bytes(b"changed source")
        with self_chirho.assertRaisesRegex(ValueError, "bytes differ"):
            MODULE_CHIRHO.verify_originals_chirho(
                self_chirho.root_chirho, self_chirho.job_chirho
            )
        self_chirho.raw_chirho.write_bytes(original_chirho)
        self_chirho.job_chirho["content_sha256_chirho"] = "0" * 64
        with self_chirho.assertRaisesRegex(ValueError, "chapter differs"):
            MODULE_CHIRHO.verify_originals_chirho(
                self_chirho.root_chirho, self_chirho.job_chirho
            )

    def test_an_unchanged_pinned_hash_does_not_excuse_a_wrong_stream_rate_chirho(
        self_chirho,
    ):
        self_chirho.raw_chirho.unlink()
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
                "sine=frequency=440:duration=0.4",
                "-ar",
                "44100",
                "-ac",
                "1",
                "-c:a",
                "flac",
                str(self_chirho.raw_chirho),
            ],
            check=True,
            capture_output=True,
        )
        self_chirho.job_chirho["chosen_chirho"]["raw_sha256_chirho"] = (
            MODULE_CHIRHO.COMMON_CHIRHO.digest_chirho(
                self_chirho.raw_chirho.read_bytes()
            )
        )
        with self_chirho.assertRaisesRegex(ValueError, "stream"):
            MODULE_CHIRHO.verify_originals_chirho(
                self_chirho.root_chirho, self_chirho.job_chirho
            )

    def test_derivative_replay_checks_independent_bytes_and_preserves_a_conflict_chirho(
        self_chirho,
    ):
        common_chirho = MODULE_CHIRHO.COMMON_CHIRHO
        common_chirho.ROOT_CHIRHO = self_chirho.root_chirho
        common_chirho.RUN_CHIRHO = self_chirho.run_chirho
        outputs_chirho = []
        for index_chirho in range(2):
            common_chirho.OUTPUT_CHIRHO = (
                self_chirho.root_chirho / f"check-{index_chirho}-chirho"
            )
            (common_chirho.OUTPUT_CHIRHO / "delivery-chirho").mkdir(parents=True)
            row_chirho = common_chirho.derive_chirho(self_chirho.job_chirho)
            outputs_chirho.append(
                (self_chirho.root_chirho / row_chirho["path_chirho"]).read_bytes()
            )
        self_chirho.assertEqual(outputs_chirho[0], outputs_chirho[1])
        home_chirho = self_chirho.root_chirho / "output-chirho"
        target_chirho = home_chirho / "delivery-chirho/verse-chirho.mp3"
        self_chirho.assertTrue(
            MODULE_CHIRHO.keep_exact_chirho(
                target_chirho, outputs_chirho[0], home_chirho
            )
        )
        self_chirho.assertFalse(
            MODULE_CHIRHO.keep_exact_chirho(
                target_chirho, outputs_chirho[1], home_chirho
            )
        )
        conflicting_chirho = bytearray(outputs_chirho[0])
        conflicting_chirho[-1] ^= 1
        target_chirho.write_bytes(conflicting_chirho)
        with self_chirho.assertRaisesRegex(ValueError, "independent"):
            MODULE_CHIRHO.keep_exact_chirho(
                target_chirho, outputs_chirho[1], home_chirho
            )
        self_chirho.assertEqual(target_chirho.read_bytes(), conflicting_chirho)

    def test_redirected_output_never_creates_an_outside_directory_chirho(self_chirho):
        home_chirho = self_chirho.root_chirho / "output-chirho"
        home_chirho.mkdir()
        outside_chirho = self_chirho.root_chirho / "outside-chirho"
        outside_chirho.mkdir()
        (home_chirho / "link-chirho").symlink_to(
            outside_chirho, target_is_directory=True
        )
        with self_chirho.assertRaisesRegex(ValueError, "Redirected"):
            MODULE_CHIRHO.keep_exact_chirho(
                home_chirho / "link-chirho/nested-chirho/file-chirho.mp3",
                b"data",
                home_chirho,
            )
        self_chirho.assertEqual(list(outside_chirho.iterdir()), [])


if __name__ == "__main__":
    unittest_chirho.main()
