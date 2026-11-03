# For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life. — John 3:16 (KJV)
"""Re-download every pinned file at its pinned commit and compare it with the manifest.

Workflow: scripts-chirho/import-chirho/README-chirho.md, "Acquisition", node fetch_chirho.

    python3 -I scripts-chirho/import-chirho/acquire_sources_chirho.py            # compare only
    python3 -I scripts-chirho/import-chirho/acquire_sources_chirho.py --restore  # recreate missing

This is the only script here that uses the network, and only for raw.githubusercontent.com.
It never overwrites an existing file: a local file that differs is reported, not repaired.
"""

from __future__ import annotations

import argparse
import sys
import urllib.request
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
sys.dont_write_bytecode = True

from source_files_chirho import (
    PinnedFileChirho,
    SourceIntegrityErrorChirho,
    check_pinned_bytes_chirho,
    load_manifest_chirho,
)

SOURCES_DIR_CHIRHO = Path(__file__).resolve().parents[2] / "data-chirho" / "sources-chirho"
RAW_PREFIX_CHIRHO = "https://raw.githubusercontent.com/"
TIMEOUT_SECONDS_CHIRHO = 60


def download_chirho(pinned_chirho: PinnedFileChirho) -> bytes:
    url_chirho = pinned_chirho.raw_url_chirho
    if not url_chirho.startswith(RAW_PREFIX_CHIRHO):
        raise SourceIntegrityErrorChirho(f"{pinned_chirho.id_chirho}: refusing {url_chirho}")
    with urllib.request.urlopen(url_chirho, timeout=TIMEOUT_SECONDS_CHIRHO) as response_chirho:
        # One byte past the pinned size is enough to prove an oversized download wrong.
        return response_chirho.read(pinned_chirho.bytes_chirho + 1)


def reconcile_chirho(pinned_chirho: PinnedFileChirho, restore_chirho: bool) -> str:
    """Return a one-line status; raise when upstream or the local copy disagrees with the pin."""
    upstream_chirho = download_chirho(pinned_chirho)
    check_pinned_bytes_chirho(pinned_chirho, upstream_chirho)
    if pinned_chirho.path_chirho.is_file():
        if pinned_chirho.path_chirho.read_bytes() != upstream_chirho:
            raise SourceIntegrityErrorChirho(f"{pinned_chirho.id_chirho}: local copy differs")
        return "upstream and local copy match the pin"
    if not restore_chirho:
        raise SourceIntegrityErrorChirho(
            f"{pinned_chirho.id_chirho}: missing locally (use --restore)"
        )
    pinned_chirho.path_chirho.parent.mkdir(parents=True, exist_ok=True)
    with pinned_chirho.path_chirho.open("xb") as handle_chirho:
        handle_chirho.write(upstream_chirho)
    return "restored from upstream"


def main_chirho(argv_chirho: list[str] | None = None) -> int:
    parser_chirho = argparse.ArgumentParser(description=__doc__.splitlines()[0])
    parser_chirho.add_argument(
        "--restore", action="store_true", help="create pinned files that are missing locally"
    )
    options_chirho = parser_chirho.parse_args(argv_chirho)
    failures_chirho = 0
    for pinned_chirho in load_manifest_chirho(SOURCES_DIR_CHIRHO).values():
        label_chirho = f"{pinned_chirho.id_chirho} @ {pinned_chirho.commit_chirho[:12]}"
        try:
            status_chirho = reconcile_chirho(pinned_chirho, options_chirho.restore)
        except (SourceIntegrityErrorChirho, OSError) as error_chirho:
            failures_chirho += 1
            print(f"FAIL {label_chirho}: {error_chirho}", file=sys.stderr)
            continue
        print(
            f"ok   {label_chirho}: {status_chirho} (sha256 {pinned_chirho.sha256_chirho[:16]}...)"
        )
    return 1 if failures_chirho else 0


if __name__ == "__main__":
    raise SystemExit(main_chirho())
