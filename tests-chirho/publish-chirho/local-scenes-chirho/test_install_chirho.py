# For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life. — John 3:16 (KJV)
"""Source preservation, nonempty scenes and exclusive installation behavior."""

import hashlib
import importlib.util
import json
import subprocess
import tempfile
import unittest
from pathlib import Path
from unittest.mock import patch

from PIL import Image

MODULE_PATH_CHIRHO = (
    Path(__file__).resolve().parents[3]
    / "scripts-chirho/publish-chirho/local-scenes-chirho/install_chirho.py"
)
SPEC_CHIRHO = importlib.util.spec_from_file_location(
    "mark_install_chirho", MODULE_PATH_CHIRHO
)
INSTALL_CHIRHO = importlib.util.module_from_spec(SPEC_CHIRHO)
SPEC_CHIRHO.loader.exec_module(INSTALL_CHIRHO)


class InstallTestsChirho(unittest.TestCase):
    def setUp(self_chirho):
        self_chirho.temporary_chirho = tempfile.TemporaryDirectory()
        self_chirho.addCleanup(self_chirho.temporary_chirho.cleanup)
        self_chirho.root_chirho = Path(self_chirho.temporary_chirho.name).resolve()

    def item_chirho(self_chirho, uniform_chirho=False):
        path_chirho = (
            self_chirho.root_chirho
            / INSTALL_CHIRHO.RUN_CHIRHO
            / "originals-chirho/chapter-01/source-chirho.png"
        )
        path_chirho.parent.mkdir(parents=True, exist_ok=True)
        image_chirho = Image.new("RGB", (1024, 768), (0, 0, 0))
        if not uniform_chirho:
            image_chirho.paste((40, 80, 120), (10, 10, 400, 500))
        image_chirho.save(path_chirho, format="PNG")
        sha_chirho = hashlib.sha256(path_chirho.read_bytes()).hexdigest()
        return {
            "completed_chirho": {
                "job_chirho": {"output_chirho": str(path_chirho)},
                "output_sha256_chirho": sha_chirho,
            },
            "scene_chirho": {
                "lesson_id_chirho": "Mark.1.1",
                "asset_path_chirho": INSTALL_CHIRHO.ASSET_PREFIX_CHIRHO
                + "chapter-01-chirho/mark-01-001-chirho.webp",
                "art_review_chirho": "pending",
                "source_binding_chirho": {"original_png_sha256_chirho": sha_chirho},
            },
        }

    def test_lossless_source_and_idempotent_preparation_chirho(self_chirho):
        item_chirho = self_chirho.item_chirho()
        first_chirho = INSTALL_CHIRHO.encode_item_chirho(
            self_chirho.root_chirho, item_chirho
        )
        second_chirho = INSTALL_CHIRHO.encode_item_chirho(
            self_chirho.root_chirho, item_chirho
        )
        self_chirho.assertEqual(first_chirho, second_chirho)
        self_chirho.assertEqual(
            first_chirho["scene_chirho"]["art_review_chirho"], "pending"
        )
        with (
            Image.open(
                item_chirho["completed_chirho"]["job_chirho"]["output_chirho"]
            ) as source_chirho,
            Image.open(first_chirho["prepared_path_chirho"]) as webp_chirho,
        ):
            self_chirho.assertEqual(
                source_chirho.convert("RGBA").tobytes(),
                webp_chirho.convert("RGBA").tobytes(),
            )
        self_chirho.assertFalse((self_chirho.root_chirho / "static").exists())

    def test_uniform_output_is_preserved_and_withheld_chirho(self_chirho):
        item_chirho = self_chirho.item_chirho(True)
        result_chirho = INSTALL_CHIRHO.encode_item_chirho(
            self_chirho.root_chirho, item_chirho
        )
        self_chirho.assertIn("held_chirho", result_chirho)
        self_chirho.assertEqual(
            result_chirho["held_chirho"]["sha256_chirho"],
            item_chirho["completed_chirho"]["output_sha256_chirho"],
        )
        self_chirho.assertTrue(
            Path(
                item_chirho["completed_chirho"]["job_chirho"]["output_chirho"]
            ).exists()
        )
        self_chirho.assertFalse(
            (
                self_chirho.root_chirho
                / INSTALL_CHIRHO.STAGE_CHIRHO
                / "source-webp-chirho"
            ).exists()
        )

    def test_near_black_pixels_are_rejected_without_vision_chirho(self_chirho):
        item_chirho = self_chirho.item_chirho(True)
        path_chirho = Path(
            item_chirho["completed_chirho"]["job_chirho"]["output_chirho"]
        )
        image_chirho = Image.new("RGB", (1024, 768), (1, 2, 3))
        image_chirho.putpixel((10, 10), (8, 7, 6))
        image_chirho.save(path_chirho, format="PNG")
        item_chirho["completed_chirho"]["output_sha256_chirho"] = hashlib.sha256(
            path_chirho.read_bytes()
        ).hexdigest()
        result_chirho = INSTALL_CHIRHO.encode_item_chirho(
            self_chirho.root_chirho, item_chirho
        )
        self_chirho.assertIn("held_chirho", result_chirho)

    def test_changed_source_and_changed_prepared_bytes_refuse_chirho(self_chirho):
        item_chirho = self_chirho.item_chirho()
        result_chirho = INSTALL_CHIRHO.encode_item_chirho(
            self_chirho.root_chirho, item_chirho
        )
        Path(result_chirho["prepared_path_chirho"]).write_bytes(b"changed")
        with self_chirho.assertRaisesRegex(ValueError, "refusing overwrite"):
            INSTALL_CHIRHO.encode_item_chirho(self_chirho.root_chirho, item_chirho)
        Path(
            item_chirho["completed_chirho"]["job_chirho"]["output_chirho"]
        ).write_bytes(b"changed")
        with self_chirho.assertRaisesRegex(ValueError, "changed after"):
            INSTALL_CHIRHO.encode_item_chirho(self_chirho.root_chirho, item_chirho)

    def test_asset_escape_and_review_promotion_refuse_chirho(self_chirho):
        item_chirho = self_chirho.item_chirho()
        item_chirho["scene_chirho"]["asset_path_chirho"] = (
            INSTALL_CHIRHO.ASSET_PREFIX_CHIRHO + "../../escape-chirho.webp"
        )
        with self_chirho.assertRaisesRegex(ValueError, "scope"):
            INSTALL_CHIRHO.encode_item_chirho(self_chirho.root_chirho, item_chirho)
        item_chirho["scene_chirho"]["asset_path_chirho"] = (
            INSTALL_CHIRHO.ASSET_PREFIX_CHIRHO + "safe-chirho.webp"
        )
        item_chirho["scene_chirho"]["art_review_chirho"] = "approved"
        with self_chirho.assertRaisesRegex(ValueError, "review state"):
            INSTALL_CHIRHO.encode_item_chirho(self_chirho.root_chirho, item_chirho)

    def test_linked_parent_refuses_before_writing_outside_chirho(self_chirho):
        outside_chirho = self_chirho.root_chirho / "outside-chirho"
        outside_chirho.mkdir()
        (self_chirho.root_chirho / "build-chirho").symlink_to(
            outside_chirho, target_is_directory=True
        )
        with self_chirho.assertRaisesRegex(ValueError, "Redirected"):
            INSTALL_CHIRHO.encode_item_chirho(
                self_chirho.root_chirho, self_chirho.item_chirho()
            )
        self_chirho.assertEqual(list(outside_chirho.iterdir()), [])

    def test_real_coordinator_lock_excludes_a_second_process_chirho(self_chirho):
        path_chirho = (
            self_chirho.root_chirho
            / "workspace-chirho/art-chirho/queue-chirho/bible-icons-chirho/worker-chirho.lock"
        )
        path_chirho.parent.mkdir(parents=True)
        code_chirho = "import fcntl,sys; f_chirho=open(sys.argv[1],'a'); fcntl.flock(f_chirho,fcntl.LOCK_EX|fcntl.LOCK_NB)"
        with INSTALL_CHIRHO.writer_lock_chirho(self_chirho.root_chirho):
            result_chirho = subprocess.run(
                ["python3", "-I", "-c", code_chirho, str(path_chirho)],
                capture_output=True,
                check=False,
            )
            self_chirho.assertNotEqual(result_chirho.returncode, 0)
        result_chirho = subprocess.run(
            ["python3", "-I", "-c", code_chirho, str(path_chirho)],
            capture_output=True,
            check=False,
        )
        self_chirho.assertEqual(result_chirho.returncode, 0)

    def test_partial_installation_is_explicit_and_uses_existing_chain_chirho(
        self_chirho,
    ):
        prepared_chirho = INSTALL_CHIRHO.encode_item_chirho(
            self_chirho.root_chirho, self_chirho.item_chirho()
        )
        held_chirho = {
            "held_chirho": {
                "lesson_id_chirho": "Mark.1.2",
                "reason_chirho": "uniform_or_invisible_output",
            }
        }
        with patch.object(INSTALL_CHIRHO.subprocess, "run") as run_chirho:
            with self_chirho.assertRaisesRegex(ValueError, "explicit"):
                INSTALL_CHIRHO.install_chirho(
                    self_chirho.root_chirho, [prepared_chirho, held_chirho], False
                )
            self_chirho.assertFalse((self_chirho.root_chirho / "static").exists())
            result_chirho = INSTALL_CHIRHO.install_chirho(
                self_chirho.root_chirho, [prepared_chirho, held_chirho], True
            )
            self_chirho.assertEqual(result_chirho["installed_chirho"], 1)
            self_chirho.assertEqual(result_chirho["withheld_uniform_chirho"], 1)
            commands_chirho = [
                call_chirho.args[0] for call_chirho in run_chirho.call_args_list
            ]
            archive_chirho = next(
                index_chirho
                for index_chirho, command_chirho in enumerate(commands_chirho)
                if "--verify-remote-chirho" in command_chirho
            )
            expose_chirho = next(
                index_chirho
                for index_chirho, command_chirho in enumerate(commands_chirho)
                if "--once" in command_chirho
            )
            self_chirho.assertLess(archive_chirho, expose_chirho)
            manifest_chirho = json.loads(
                (
                    self_chirho.root_chirho
                    / "data-chirho/media-chirho/mark-worker-scenes-chirho.json"
                ).read_bytes()
            )
            self_chirho.assertEqual(len(manifest_chirho["scenes_chirho"]), 1)
            self_chirho.assertEqual(
                manifest_chirho["scenes_chirho"][0]["art_review_chirho"], "pending"
            )


if __name__ == "__main__":
    unittest.main()
