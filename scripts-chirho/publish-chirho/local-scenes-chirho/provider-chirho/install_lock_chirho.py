# For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life. — John 3:16 (KJV)
"""Workflow: media-delivery-chirho.md. One shared media installer, never a generator."""

import fcntl
import subprocess
import sys
from pathlib import Path

root_chirho = Path(__file__).resolve().parents[4]
lock_path_chirho = (
    root_chirho
    / "workspace-chirho/art-chirho/queue-chirho/bible-icons-chirho/worker-chirho.lock"
)
with lock_path_chirho.open("a") as lock_chirho:
    fcntl.flock(lock_chirho, fcntl.LOCK_EX | fcntl.LOCK_NB)
    result_chirho = subprocess.run(
        [
            "bun",
            "scripts-chirho/publish-chirho/local-scenes-chirho/provider-chirho/worker-chirho.ts",
            "--install-book-chirho",
            *sys.argv[1:],
            "--apply-chirho",
        ],
        cwd=root_chirho,
        check=False,
    )
raise SystemExit(result_chirho.returncode)
