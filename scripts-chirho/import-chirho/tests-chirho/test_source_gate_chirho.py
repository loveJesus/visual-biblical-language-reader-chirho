# For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life. — John 3:16 (KJV)
"""The hash gate: pinned files must match the manifest byte for byte before anything is parsed."""

from __future__ import annotations

import hashlib
import json
import tempfile
import unittest
from pathlib import Path

import support_chirho
from source_files_chirho import (
    SourceIntegrityErrorChirho,
    load_manifest_chirho,
    parse_xml_chirho,
    read_verified_bytes_chirho,
)


def write_manifest_chirho(
    folder_chirho: Path, upstream_path_chirho: str, data_chirho: bytes
) -> None:
    """A one-file manifest pinning data_chirho, in the real manifest's shape."""
    (folder_chirho / "repo-chirho").mkdir()
    manifest_chirho = {
        "repositories_chirho": [
            {
                "id_chirho": "repo-chirho",
                "url_chirho": "https://github.com/example/repo",
                "commit_chirho": "0" * 40,
                "local_dir_chirho": "repo-chirho",
            }
        ],
        "files_chirho": [
            {
                "id_chirho": "file-chirho",
                "repository_chirho": "repo-chirho",
                "upstream_path_chirho": upstream_path_chirho,
                "role_chirho": "data",
                "title_chirho": "synthetic",
                "bytes_chirho": len(data_chirho),
                "sha256_chirho": hashlib.sha256(data_chirho).hexdigest(),
                "license_chirho": "synthetic",
                "attribution_chirho": "synthetic",
                "adaptation_chirho": "none",
            }
        ],
    }
    (folder_chirho / "acquisition-manifest-chirho.json").write_text(json.dumps(manifest_chirho))


class SourceGateTestsChirho(unittest.TestCase):
    def test_every_pinned_file_matches_the_manifest_chirho(self) -> None:
        pinned_chirho = load_manifest_chirho(support_chirho.SOURCES_DIR_CHIRHO)
        self.assertEqual(set(support_chirho.pinned_bytes_chirho()), set(pinned_chirho))

    def test_pinned_prov_hash_is_the_one_the_handoff_records_chirho(self) -> None:
        pinned_chirho = load_manifest_chirho(support_chirho.SOURCES_DIR_CHIRHO)
        handoff_chirho = support_chirho.HANDOFF_FILE_CHIRHO.read_text(encoding="utf-8")
        self.assertIn(pinned_chirho["oshb-prov-chirho"].sha256_chirho, handoff_chirho)

    def test_one_changed_byte_is_refused_chirho(self) -> None:
        with tempfile.TemporaryDirectory() as folder_name_chirho:
            folder_chirho = Path(folder_name_chirho)
            write_manifest_chirho(folder_chirho, "data.xml", b"<pinned/>")
            (folder_chirho / "repo-chirho" / "data.xml").write_bytes(b"<pinned/>")
            pinned_chirho = load_manifest_chirho(folder_chirho)["file-chirho"]
            self.assertEqual(read_verified_bytes_chirho(pinned_chirho), b"<pinned/>")
            (folder_chirho / "repo-chirho" / "data.xml").write_bytes(b"<pinneD/>")
            with self.assertRaises(SourceIntegrityErrorChirho):
                read_verified_bytes_chirho(pinned_chirho)

    def test_missing_file_is_refused_chirho(self) -> None:
        with tempfile.TemporaryDirectory() as folder_name_chirho:
            folder_chirho = Path(folder_name_chirho)
            write_manifest_chirho(folder_chirho, "data.xml", b"<pinned/>")
            pinned_chirho = load_manifest_chirho(folder_chirho)["file-chirho"]
            with self.assertRaises(SourceIntegrityErrorChirho):
                read_verified_bytes_chirho(pinned_chirho)

    def test_manifest_path_cannot_leave_the_sources_folder_chirho(self) -> None:
        with tempfile.TemporaryDirectory() as folder_name_chirho:
            folder_chirho = Path(folder_name_chirho)
            write_manifest_chirho(folder_chirho, "../../outside.xml", b"<pinned/>")
            with self.assertRaises(SourceIntegrityErrorChirho):
                load_manifest_chirho(folder_chirho)

    def test_xml_with_a_dtd_is_refused_chirho(self) -> None:
        with self.assertRaises(SourceIntegrityErrorChirho):
            parse_xml_chirho(b'<!DOCTYPE x [<!ENTITY e "boom">]><x>&e;</x>', "synthetic")


if __name__ == "__main__":
    unittest.main()
