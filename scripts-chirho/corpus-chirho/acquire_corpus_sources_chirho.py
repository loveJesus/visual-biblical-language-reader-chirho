# For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life. — John 3:16 (KJV)
"""Re-download each pinned corpus file at its pinned commit and compare it with the manifest.

Workflow: scripts-chirho/corpus-chirho/README-chirho.md, "Acquisition", node fetch_chirho.

    python3 -I scripts-chirho/corpus-chirho/acquire_corpus_sources_chirho.py            # compare
    python3 -I scripts-chirho/corpus-chirho/acquire_corpus_sources_chirho.py --restore  # create

The manifest is data-chirho/corpus-chirho/sources-chirho/acquisition-manifest-chirho.json. The
comparison and exclusive creation are the lesson importer's own (reconcile_chirho): a local file
that differs is reported, never overwritten. This is the corpus lane's only network step.
"""

from __future__ import annotations

import argparse
import sys
from pathlib import Path

HERE_CHIRHO = Path(__file__).resolve().parent
sys.path[:0] = [str(HERE_CHIRHO), str(HERE_CHIRHO.parent / "import-chirho")]
sys.dont_write_bytecode = True

from acquire_sources_chirho import reconcile_chirho
from source_files_chirho import SourceIntegrityErrorChirho, load_manifest_chirho

SOURCES_DIR_CHIRHO = HERE_CHIRHO.parents[1] / "data-chirho" / "corpus-chirho" / "sources-chirho"


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
