# For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life. — John 3:16 (KJV)
"""Public distribution integrity; no provider, credentials or real network."""

import json
import sys
import tempfile
import threading
import time
import unittest
import zipfile
from pathlib import Path
from unittest.mock import patch

sys.path.insert(
    0, str(Path(__file__).resolve().parents[2] / "scripts-chirho/bible-chirho")
)
import package_media_library_chirho as package_chirho


class PackageTestsChirho(unittest.TestCase):
    def setUp(self_chirho):
        temporary_chirho = tempfile.TemporaryDirectory()
        self_chirho.addCleanup(temporary_chirho.cleanup)
        self_chirho.root_chirho = Path(temporary_chirho.name).resolve()
        self_chirho.catalogue_chirho = self_chirho.root_chirho / "catalogue-chirho"
        (self_chirho.catalogue_chirho / "assets-chirho").mkdir(parents=True)
        self_chirho.bytes_chirho = [
            f"object-{number_chirho}-chirho".encode() for number_chirho in range(4)
        ]
        self_chirho.assets_chirho = [
            {
                "sha256_chirho": package_chirho.sha_chirho(bytes_chirho),
                "bytes_chirho": len(bytes_chirho),
                "kinds_chirho": ["icons_chirho"],
                "download_url_chirho": f"https://hinneh.us/assets-chirho/sha256-chirho/{package_chirho.sha_chirho(bytes_chirho)}-chirho.webp",
            }
            for bytes_chirho in self_chirho.bytes_chirho
        ]
        self_chirho.manifest_chirho = {
            "schema_version_chirho": 1,
            "release_id_chirho": "a" * 64,
            "licenses_chirho": {"artwork_chirho": {"spdx_chirho": "CC0-1.0"}},
            "shards_chirho": [],
            "download_plan_chirho": {
                kind_chirho: {
                    "unique_assets_chirho": 4 if kind_chirho == "icons_chirho" else 0,
                    "bytes_chirho": sum(map(len, self_chirho.bytes_chirho))
                    if kind_chirho == "icons_chirho"
                    else 0,
                }
                for kind_chirho in package_chirho.KINDS_CHIRHO
            },
        }
        self_chirho.write_chirho()

    def write_chirho(self_chirho):
        bytes_chirho = json.dumps(
            {
                "schema_version_chirho": 1,
                "release_id_chirho": "a" * 64,
                "records_chirho": self_chirho.assets_chirho,
            }
        ).encode()
        (
            self_chirho.catalogue_chirho / "assets-chirho/part-0000-chirho.json"
        ).write_bytes(bytes_chirho)
        self_chirho.manifest_chirho["shards_chirho"] = [
            {
                "path_chirho": "assets-chirho/part-0000-chirho.json",
                "bytes_chirho": len(bytes_chirho),
                "sha256_chirho": package_chirho.sha_chirho(bytes_chirho),
                "records_chirho": 4,
            }
        ]
        (self_chirho.catalogue_chirho / "manifest-chirho.json").write_text(
            json.dumps(self_chirho.manifest_chirho)
        )
        (self_chirho.catalogue_chirho / "README-chirho.md").write_text("Public library")

    def test_exact_archive_with_bounded_workers_and_no_raster_mirror_chirho(
        self_chirho,
    ):
        active_chirho = 0
        peak_chirho = 0
        lock_chirho = threading.Lock()
        objects_chirho = {
            package_chirho.sha_chirho(bytes_chirho): bytes_chirho
            for bytes_chirho in self_chirho.bytes_chirho
        }

        def fetch_chirho(row_chirho, root_chirho):
            nonlocal active_chirho, peak_chirho
            with lock_chirho:
                active_chirho += 1
                peak_chirho = max(peak_chirho, active_chirho)
            time.sleep(0.01)
            with lock_chirho:
                active_chirho -= 1
            return objects_chirho[row_chirho["sha256_chirho"]]

        receipt_chirho = package_chirho.package_chirho(
            self_chirho.catalogue_chirho,
            "icons_chirho",
            self_chirho.root_chirho,
            2,
            fetch_chirho,
        )
        target_chirho = (
            self_chirho.root_chirho
            / "build-chirho/public-media-archives-chirho"
            / ("a" * 64 + "-chirho")
            / receipt_chirho["path_chirho"]
        )
        self_chirho.assertEqual(peak_chirho, 2)
        self_chirho.assertEqual(
            receipt_chirho["sha256_chirho"],
            package_chirho.sha_chirho(target_chirho.read_bytes()),
        )
        with zipfile.ZipFile(target_chirho) as archive_chirho:
            self_chirho.assertEqual(len(archive_chirho.namelist()), 5)
            self_chirho.assertEqual(
                {
                    archive_chirho.read(name_chirho)
                    for name_chirho in archive_chirho.namelist()
                    if name_chirho.endswith(".webp")
                },
                set(self_chirho.bytes_chirho),
            )
        self_chirho.assertFalse(list(self_chirho.root_chirho.rglob("*.webp")))
        with self_chirho.assertRaisesRegex(ValueError, "overwrite"):
            package_chirho.package_chirho(
                self_chirho.catalogue_chirho,
                "icons_chirho",
                self_chirho.root_chirho,
                2,
                fetch_chirho,
            )

    def test_tampered_shard_or_untrusted_url_refuses_before_fetch_chirho(self_chirho):
        shard_chirho = (
            self_chirho.catalogue_chirho / "assets-chirho/part-0000-chirho.json"
        )
        shard_chirho.write_bytes(shard_chirho.read_bytes() + b" ")
        with self_chirho.assertRaisesRegex(ValueError, "hash or size"):
            package_chirho.plan_chirho(self_chirho.catalogue_chirho)
        self_chirho.assets_chirho[0]["download_url_chirho"] = (
            "https://attacker.invalid/object"
        )
        self_chirho.write_chirho()
        with self_chirho.assertRaisesRegex(ValueError, "exact public"):
            package_chirho.plan_chirho(self_chirho.catalogue_chirho)
        with (
            patch.object(
                package_chirho.urllib.request, "build_opener"
            ) as opener_chirho,
            self_chirho.assertRaisesRegex(ValueError, "Unsafe"),
        ):
            package_chirho.download_chirho(self_chirho.assets_chirho[0])
        opener_chirho.assert_not_called()

    def test_bad_object_keeps_partial_archive_and_never_creates_final_chirho(
        self_chirho,
    ):
        with self_chirho.assertRaisesRegex(ValueError, "before archive"):
            package_chirho.package_chirho(
                self_chirho.catalogue_chirho,
                "icons_chirho",
                self_chirho.root_chirho,
                2,
                lambda row_chirho, root_chirho: b"altered",
            )
        self_chirho.assertFalse(
            list((self_chirho.root_chirho / "build-chirho").rglob("*.zip"))
        )
        self_chirho.assertEqual(
            len(list(self_chirho.root_chirho.rglob("*.partial-chirho"))), 1
        )

    def test_local_audio_is_reused_only_with_matching_hash_chirho(self_chirho):
        row_chirho = dict(self_chirho.assets_chirho[0])
        row_chirho["kinds_chirho"] = ["word_audio_chirho"]
        row_chirho["download_url_chirho"] = (
            row_chirho["download_url_chirho"]
            .replace("assets-chirho", "audio-chirho")
            .replace(".webp", ".mp3")
        )
        path_chirho = (
            self_chirho.root_chirho
            / "static"
            / row_chirho["download_url_chirho"].removeprefix("https://hinneh.us/")
        )
        path_chirho.parent.mkdir(parents=True)
        path_chirho.write_bytes(self_chirho.bytes_chirho[0])
        with patch.object(
            package_chirho.urllib.request, "build_opener"
        ) as opener_chirho:
            self_chirho.assertEqual(
                package_chirho.download_chirho(row_chirho, self_chirho.root_chirho),
                self_chirho.bytes_chirho[0],
            )
            path_chirho.write_bytes(b"changed")
            with self_chirho.assertRaisesRegex(ValueError, "MP3 changed"):
                package_chirho.download_chirho(row_chirho, self_chirho.root_chirho)
        opener_chirho.assert_not_called()

    def test_linked_output_is_refused_chirho(self_chirho):
        (self_chirho.root_chirho / "build-chirho").symlink_to(
            self_chirho.catalogue_chirho, target_is_directory=True
        )
        with self_chirho.assertRaisesRegex(ValueError, "Linked output"):
            package_chirho.package_chirho(
                self_chirho.catalogue_chirho,
                "catalogue_chirho",
                self_chirho.root_chirho,
            )


if __name__ == "__main__":
    unittest.main()
