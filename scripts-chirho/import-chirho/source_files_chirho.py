# For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life. — John 3:16 (KJV)
"""Pinned source files: read the acquisition manifest and refuse any file whose bytes differ.

Workflow: scripts-chirho/import-chirho/README-chirho.md, "Offline import", node verify_chirho.
Nothing is parsed until its exact bytes match the manifest, so the hash check is the trust
boundary for everything downstream.
"""

from __future__ import annotations

import hashlib
import json
import xml.etree.ElementTree as ET
from dataclasses import dataclass
from pathlib import Path

MANIFEST_NAME_CHIRHO = "acquisition-manifest-chirho.json"
GITHUB_PREFIX_CHIRHO = "https://github.com/"


class SourceIntegrityErrorChirho(Exception):
    """A pinned file is missing, escapes the sources folder, or differs from the manifest."""


@dataclass(frozen=True)
class PinnedFileChirho:
    id_chirho: str
    path_chirho: Path
    upstream_path_chirho: str
    repository_url_chirho: str
    commit_chirho: str
    role_chirho: str
    title_chirho: str
    bytes_chirho: int
    sha256_chirho: str
    license_chirho: str
    attribution_chirho: str
    adaptation_chirho: str

    @property
    def raw_url_chirho(self) -> str:
        owner_repo_chirho = self.repository_url_chirho.removeprefix(GITHUB_PREFIX_CHIRHO)
        return (
            f"https://raw.githubusercontent.com/{owner_repo_chirho}/"
            f"{self.commit_chirho}/{self.upstream_path_chirho}"
        )

    @property
    def blob_url_chirho(self) -> str:
        return f"{self.repository_url_chirho}/blob/{self.commit_chirho}/{self.upstream_path_chirho}"


def load_manifest_chirho(sources_dir_chirho: Path) -> dict[str, PinnedFileChirho]:
    """Return every pinned file keyed by id, with its local path resolved inside the folder."""
    manifest_chirho = json.loads(
        (sources_dir_chirho / MANIFEST_NAME_CHIRHO).read_text(encoding="utf-8")
    )
    root_chirho = sources_dir_chirho.resolve()
    repositories_chirho = {
        repo_chirho["id_chirho"]: repo_chirho
        for repo_chirho in manifest_chirho["repositories_chirho"]
    }
    pinned_chirho: dict[str, PinnedFileChirho] = {}
    for entry_chirho in manifest_chirho["files_chirho"]:
        repo_chirho = repositories_chirho[entry_chirho["repository_chirho"]]
        if not repo_chirho["url_chirho"].startswith(GITHUB_PREFIX_CHIRHO):
            raise SourceIntegrityErrorChirho(f"{repo_chirho['id_chirho']}: not a GitHub repository")
        path_chirho = (
            root_chirho / repo_chirho["local_dir_chirho"] / entry_chirho["upstream_path_chirho"]
        ).resolve()
        if not path_chirho.is_relative_to(root_chirho):
            raise SourceIntegrityErrorChirho(
                f"{entry_chirho['id_chirho']}: path leaves {root_chirho}"
            )
        if entry_chirho["id_chirho"] in pinned_chirho:
            raise SourceIntegrityErrorChirho(f"{entry_chirho['id_chirho']}: listed twice")
        pinned_chirho[entry_chirho["id_chirho"]] = PinnedFileChirho(
            id_chirho=entry_chirho["id_chirho"],
            path_chirho=path_chirho,
            upstream_path_chirho=entry_chirho["upstream_path_chirho"],
            repository_url_chirho=repo_chirho["url_chirho"],
            commit_chirho=repo_chirho["commit_chirho"],
            role_chirho=entry_chirho["role_chirho"],
            title_chirho=entry_chirho["title_chirho"],
            bytes_chirho=entry_chirho["bytes_chirho"],
            sha256_chirho=entry_chirho["sha256_chirho"],
            license_chirho=entry_chirho["license_chirho"],
            attribution_chirho=entry_chirho["attribution_chirho"],
            adaptation_chirho=entry_chirho["adaptation_chirho"],
        )
    return pinned_chirho


def check_pinned_bytes_chirho(pinned_chirho: PinnedFileChirho, data_chirho: bytes) -> None:
    """Raise unless data_chirho has exactly the size and sha256 the manifest pins."""
    actual_chirho = hashlib.sha256(data_chirho).hexdigest()
    if (
        len(data_chirho) != pinned_chirho.bytes_chirho
        or actual_chirho != pinned_chirho.sha256_chirho
    ):
        raise SourceIntegrityErrorChirho(
            f"{pinned_chirho.id_chirho}: got {len(data_chirho)} bytes with sha256 {actual_chirho}; "
            f"the manifest pins {pinned_chirho.bytes_chirho} bytes with sha256 "
            f"{pinned_chirho.sha256_chirho}"
        )


def read_verified_bytes_chirho(pinned_chirho: PinnedFileChirho) -> bytes:
    """Return the file's bytes only after they match the manifest; callers parse these bytes."""
    try:
        data_chirho = pinned_chirho.path_chirho.read_bytes()
    except FileNotFoundError as error_chirho:
        raise SourceIntegrityErrorChirho(
            f"{pinned_chirho.id_chirho}: missing {pinned_chirho.path_chirho}"
        ) from error_chirho
    check_pinned_bytes_chirho(pinned_chirho, data_chirho)
    return data_chirho


def parse_xml_chirho(data_chirho: bytes, label_chirho: str) -> ET.Element:
    """Parse verified XML, refusing any DTD so no entity can expand or reach outside the file."""
    if b"<!DOCTYPE" in data_chirho or b"<!ENTITY" in data_chirho:
        raise SourceIntegrityErrorChirho(f"{label_chirho}: DTD and entity declarations are refused")
    return ET.fromstring(data_chirho)


def verify_all_chirho(pinned_chirho: dict[str, PinnedFileChirho]) -> dict[str, bytes]:
    """Verify every pinned file, including license files, and return their bytes by id."""
    return {
        file_id_chirho: read_verified_bytes_chirho(entry_chirho)
        for file_id_chirho, entry_chirho in pinned_chirho.items()
    }
