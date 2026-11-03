# For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life. — John 3:16 (KJV)
"""Pinned whole-canon acquisition. Workflow: spec-chirho/workflows-chirho/whole-bible-chirho.md.

First acquisition compares Git blob SHA-1 with the pinned repository tree and records SHA-256.
Subsequent imports are offline and refuse drift. Existing files are never silently overwritten.
"""

from __future__ import annotations

import argparse
import hashlib
import json
import sys
import urllib.request
from concurrent.futures import ThreadPoolExecutor
from pathlib import Path

ROOT_CHIRHO = Path(__file__).resolve().parents[2]
sys.path[:0] = [str(ROOT_CHIRHO / "scripts-chirho/import-chirho")]
from source_files_chirho import load_manifest_chirho, read_verified_bytes_chirho

HOME_CHIRHO = ROOT_CHIRHO / "data-chirho/bible-chirho/sources-chirho"
REGISTRY_CHIRHO = ROOT_CHIRHO / "config-chirho/bible-chirho/books-chirho.json"
PINS_CHIRHO = {
    "morphhb-chirho": ("openscriptures/morphhb", "3d15126fb1ef74867fc1434be1942e837932691f"),
    "gbt-data-chirho": ("globalbibletools/data", "6c511c2a8cc4ab341337f912763592f3ab5da0b1"),
}


def fetch_chirho(url_chirho: str) -> bytes:
    request_chirho = urllib.request.Request(
        url_chirho, headers={"User-Agent": "Hinneh-pinned-import-chirho"}
    )
    with urllib.request.urlopen(request_chirho, timeout=60) as response_chirho:
        if response_chirho.url != url_chirho:
            raise ValueError("Pinned acquisition redirected")
        bytes_chirho = response_chirho.read(32 * 1024 * 1024 + 1)
    if len(bytes_chirho) > 32 * 1024 * 1024:
        raise ValueError("Pinned input exceeds 32 MiB")
    return bytes_chirho


def acquire_chirho() -> None:
    books_chirho = json.loads(REGISTRY_CHIRHO.read_text())["books_chirho"]
    template_chirho = json.loads(
        (
            ROOT_CHIRHO
            / "data-chirho/corpus-chirho/sources-chirho/acquisition-manifest-chirho.json"
        ).read_text()
    )
    existing_chirho = {
        entry_chirho["id_chirho"]: entry_chirho for entry_chirho in template_chirho["files_chirho"]
    }
    base_oshb_chirho = json.loads(
        (ROOT_CHIRHO / "data-chirho/sources-chirho/acquisition-manifest-chirho.json").read_text()
    )["files_chirho"][0]
    jobs_chirho = []
    repositories_chirho = []
    for repo_id_chirho, (repo_chirho, pin_chirho) in PINS_CHIRHO.items():
        tree_url_chirho = (
            f"https://api.github.com/repos/{repo_chirho}/git/trees/{pin_chirho}?recursive=1"
        )
        tree_bytes_chirho = fetch_chirho(tree_url_chirho)
        tree_chirho = json.loads(tree_bytes_chirho)
        if tree_chirho.get("truncated") or tree_chirho.get("sha") != pin_chirho:
            raise ValueError("Incomplete or wrong pinned tree")
        blobs_chirho = {
            entry_chirho["path"]: entry_chirho["sha"]
            for entry_chirho in tree_chirho["tree"]
            if entry_chirho["type"] == "blob"
        }
        HOME_CHIRHO.mkdir(parents=True, exist_ok=True)
        (HOME_CHIRHO / f"{repo_id_chirho}-tree-chirho.json").write_bytes(tree_bytes_chirho)
        repositories_chirho.append(
            {
                "id_chirho": repo_id_chirho,
                "url_chirho": f"https://github.com/{repo_chirho}",
                "commit_chirho": pin_chirho,
                "local_dir_chirho": repo_id_chirho,
            }
        )
        for book_chirho in books_chirho:
            if book_chirho["language_chirho"] != "he":
                continue
            id_chirho = book_chirho["id_chirho"]
            if repo_id_chirho == "morphhb-chirho":
                paths_chirho = [
                    (f"wlc/{id_chirho}.xml", f"oshb-{id_chirho.lower()}-chirho", base_oshb_chirho)
                ]
            else:
                paths_chirho = [
                    (
                        f"eng/{book_chirho['gbt_file_chirho']}",
                        f"gbt-english-{id_chirho.lower()}-chirho",
                        existing_chirho["gbt-english-gen-chirho"],
                    ),
                    (
                        f"hbo+grc/{book_chirho['gbt_file_chirho']}",
                        f"gbt-source-words-{id_chirho.lower()}-chirho",
                        existing_chirho["gbt-source-words-gen-chirho"],
                    ),
                ]
            for path_chirho, file_id_chirho, source_template_chirho in paths_chirho:
                if path_chirho not in blobs_chirho:
                    raise ValueError(f"Missing pinned source: {repo_chirho}/{path_chirho}")
                jobs_chirho.append(
                    (
                        repo_id_chirho,
                        repo_chirho,
                        pin_chirho,
                        path_chirho,
                        file_id_chirho,
                        source_template_chirho,
                        blobs_chirho[path_chirho],
                        book_chirho,
                    )
                )

    def download_chirho(job_chirho):
        (
            repo_id_chirho,
            repo_chirho,
            pin_chirho,
            path_chirho,
            file_id_chirho,
            source_template_chirho,
            blob_chirho,
            book_chirho,
        ) = job_chirho
        url_chirho = f"https://raw.githubusercontent.com/{repo_chirho}/{pin_chirho}/{path_chirho}"
        target_chirho = HOME_CHIRHO / repo_id_chirho / path_chirho
        bytes_chirho = (
            target_chirho.read_bytes() if target_chirho.exists() else fetch_chirho(url_chirho)
        )
        git_hash_chirho = hashlib.sha1(
            b"blob " + str(len(bytes_chirho)).encode() + b"\0" + bytes_chirho
        ).hexdigest()
        if git_hash_chirho != blob_chirho:
            raise ValueError(f"Pinned Git blob differs: {path_chirho}")
        target_chirho.parent.mkdir(parents=True, exist_ok=True)
        if not target_chirho.exists():
            with target_chirho.open("xb") as output_chirho:
                output_chirho.write(bytes_chirho)
        entry_chirho = {
            key_chirho: source_template_chirho[key_chirho]
            for key_chirho in (
                "role_chirho",
                "license_chirho",
                "attribution_chirho",
                "adaptation_chirho",
            )
        }
        entry_chirho |= {
            "id_chirho": file_id_chirho,
            "repository_chirho": repo_id_chirho,
            "upstream_path_chirho": path_chirho,
            "title_chirho": f"{book_chirho['label_chirho']}: {'OSHB WLC text, lemmas and morphology' if repo_id_chirho == 'morphhb-chirho' else 'Global Bible Tools approved English gloss export' if path_chirho.startswith('eng/') else 'Global Bible Tools source-word alignment file (not displayed)'}",
            "bytes_chirho": len(bytes_chirho),
            "sha256_chirho": hashlib.sha256(bytes_chirho).hexdigest(),
            "git_blob_chirho": blob_chirho,
        }
        if repo_id_chirho == "gbt-data-chirho":
            entry_chirho["license_chirho"] = (
                entry_chirho["license_chirho"]
                .replace(
                    "this file is GBT's own OT export of 2026-01-26 (Genesis)",
                    "this is GBT's own Old Testament export",
                )
                .replace("export of 2026-01-26", "export at the recorded commit")
            )
        return entry_chirho

    with ThreadPoolExecutor(max_workers=4) as executor_chirho:
        files_chirho = list(executor_chirho.map(download_chirho, jobs_chirho))
    manifest_chirho = {
        "schema_version_chirho": 1,
        "repositories_chirho": repositories_chirho,
        "files_chirho": files_chirho,
    }
    (HOME_CHIRHO / "acquisition-manifest-chirho.json").write_text(
        json.dumps(manifest_chirho, ensure_ascii=False, indent=2) + "\n"
    )
    print(f"Acquired and pinned {len(files_chirho)} exact files")


def main_chirho() -> None:
    parser_chirho = argparse.ArgumentParser(description=__doc__)
    parser_chirho.add_argument("--acquire-chirho", action="store_true")
    options_chirho = parser_chirho.parse_args()
    if options_chirho.acquire_chirho:
        acquire_chirho()
    else:
        pinned_chirho = load_manifest_chirho(HOME_CHIRHO)
        for entry_chirho in pinned_chirho.values():
            read_verified_bytes_chirho(entry_chirho)
        print(f"Verified {len(pinned_chirho)} pinned files offline")


if __name__ == "__main__":
    main_chirho()
