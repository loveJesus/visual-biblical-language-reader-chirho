# For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life. — John 3:16 (KJV)
"""Finite credential-free acquisition, private frozen layers, no shared-tree writes."""

from __future__ import annotations

import argparse
import concurrent.futures
import datetime
import gzip
import hashlib
import json
import os
import shutil
import threading
import time
import urllib.error
import urllib.request
from pathlib import Path

from bible_tools_edition_contract_chirho import (
    EditionUnavailableChirho,
    align_edition_chirho,
    decode_reader_chirho,
    verify_content_chirho,
)

# Workflow: BIBLE-TOOLS-EDITIONS-CHIRHO.md. Explicit private output; no default GET.
HERE_CHIRHO = Path(__file__).resolve().parent
REPO_CHIRHO = HERE_CHIRHO.parents[1]
RUN_CHIRHO = HERE_CHIRHO / "acquisition-chirho"
OUTPUT_CHIRHO = HERE_CHIRHO / "static-chirho"
OFFLINE_CHIRHO = False
BASE_URL_CHIRHO = "https://global-tools.bible.systems"
MAX_BODY_CHIRHO = 2_000_000
MAX_TOTAL_CHIRHO = 2_000_000_000
MIN_FREE_CHIRHO = 20 * 1024**3
LOCK_CHIRHO = threading.Lock()
TOTAL_CHIRHO = [0]


def json_bytes_chirho(value_chirho: object) -> bytes:
    return (
        json.dumps(value_chirho, ensure_ascii=False, separators=(",", ":")) + "\n"
    ).encode()


def configure_chirho(
    repository_chirho: Path, evidence_chirho: Path, offline_chirho: bool
) -> None:
    global HERE_CHIRHO, REPO_CHIRHO, RUN_CHIRHO, OUTPUT_CHIRHO, OFFLINE_CHIRHO
    repository_chirho = repository_chirho.resolve()
    evidence_chirho = evidence_chirho.resolve()
    if evidence_chirho.is_relative_to(
        repository_chirho
    ) and not evidence_chirho.is_relative_to(repository_chirho / "build-chirho"):
        raise ValueError("evidence root must be isolated from tracked/public inputs")
    if not (
        repository_chirho / "config-chirho/bible-chirho/books-chirho.json"
    ).is_file():
        raise ValueError("repository has no Hinneh book registry")
    HERE_CHIRHO = evidence_chirho
    REPO_CHIRHO = repository_chirho
    RUN_CHIRHO = evidence_chirho / "acquisition-chirho"
    OUTPUT_CHIRHO = evidence_chirho / "static-chirho"
    OFFLINE_CHIRHO = offline_chirho
    for child_chirho in [RUN_CHIRHO, OUTPUT_CHIRHO]:
        if child_chirho.resolve() != child_chirho:
            raise ValueError("evidence output root may not be a symlink")


def write_chirho(path_chirho: Path, body_chirho: bytes) -> None:
    if not path_chirho.resolve().is_relative_to(HERE_CHIRHO):
        raise ValueError("refusing a write outside isolated evidence root")
    path_chirho.parent.mkdir(parents=True, exist_ok=True)
    temporary_chirho = path_chirho.with_name(path_chirho.name + ".tmp-chirho")
    with temporary_chirho.open("xb") as output_chirho:
        output_chirho.write(body_chirho)
        output_chirho.flush()
        os.fsync(output_chirho.fileno())
    temporary_chirho.replace(path_chirho)


def plan_chirho() -> dict:
    registry_path_chirho = REPO_CHIRHO / "config-chirho/bible-chirho/books-chirho.json"
    registry_body_chirho = registry_path_chirho.read_bytes()
    registry_chirho = json.loads(registry_body_chirho)["books_chirho"]
    chapters_chirho = []
    for book_number_chirho, book_chirho in enumerate(registry_chirho, 1):
        if int(book_chirho["gbt_file_chirho"].split("-", 1)[0]) != book_number_chirho:
            raise ValueError("registry order differs from Bible Tools book numbers")
        slug_chirho = book_chirho["slug_chirho"]
        manifest_path_chirho = (
            REPO_CHIRHO / "static/content-chirho" / slug_chirho / "manifest-chirho.json"
        )
        manifest_chirho = json.loads(manifest_path_chirho.read_bytes())
        if manifest_chirho["book_id_chirho"] != book_chirho["id_chirho"]:
            raise ValueError("registry and chapter manifest differ")
        for entry_chirho in manifest_chirho["chapters_chirho"]:
            expected_path_chirho = f"/content-chirho/{slug_chirho}/chapter-{entry_chirho['number_chirho']:02d}-chirho.json"
            if entry_chirho["path_chirho"] != expected_path_chirho:
                raise ValueError("content path differs from the canonical chapter path")
            chapters_chirho.append(
                {
                    "book_number_chirho": book_number_chirho,
                    "book_id_chirho": book_chirho["id_chirho"],
                    "slug_chirho": slug_chirho,
                    "number_chirho": entry_chirho["number_chirho"],
                    "content_path_chirho": entry_chirho["path_chirho"],
                    "content_sha256_chirho": entry_chirho["sha256_chirho"],
                }
            )
    if len(registry_chirho) != 66 or len(chapters_chirho) != 1189:
        raise ValueError("unexpected finite content inventory")
    return {
        "schema_version_chirho": 1,
        "purpose_chirho": "private candidate; no publication or shared source/data mutation",
        "registry_sha256_chirho": hashlib.sha256(registry_body_chirho).hexdigest(),
        "editions_chirho": {"en": ["readers", "terse"], "es": ["terse"]},
        "requested_chapter_variants_chirho": 3567,
        "max_concurrent_gets_chirho": 2,
        "timeout_seconds_chirho": 30,
        "maximum_transient_retries_per_request_chirho": 1,
        "max_response_bytes_chirho": MAX_BODY_CHIRHO,
        "max_total_response_bytes_chirho": MAX_TOTAL_CHIRHO,
        "chapters_chirho": chapters_chirho,
    }


def cached_sample_chirho(
    language_chirho: str, book_chirho: int, chapter_chirho: int, edition_chirho: str
) -> tuple[bytes, dict] | None:
    filename_chirho = f"{language_chirho}-{book_chirho:02d}-{chapter_chirho:03d}-{edition_chirho}-chirho.json"
    path_chirho = HERE_CHIRHO / "reader-samples-chirho" / filename_chirho
    if not path_chirho.exists():
        return None
    receipts_chirho = []
    for name_chirho in [
        "reader-receipts-chirho.json",
        "reader-receipts-additional-chirho.json",
    ]:
        receipts_chirho.extend(json.loads((HERE_CHIRHO / name_chirho).read_bytes()))
    matching_chirho = [
        receipt_chirho
        for receipt_chirho in receipts_chirho
        if Path(receipt_chirho.get("path_chirho", "")).name == filename_chirho
        and receipt_chirho.get("status_chirho") == 200
    ]
    body_chirho = path_chirho.read_bytes()
    if (
        len(matching_chirho) != 1
        or hashlib.sha256(body_chirho).hexdigest()
        != matching_chirho[0]["sha256_chirho"]
    ):
        raise ValueError("sample receipt mismatch")
    return body_chirho, matching_chirho[0]


def fetch_chirho(
    language_chirho: str, entry_chirho: dict, edition_chirho: str
) -> tuple[bytes | None, dict]:
    book_chirho = entry_chirho["book_number_chirho"]
    chapter_chirho = entry_chirho["number_chirho"]
    key_chirho = (
        f"{language_chirho}-{book_chirho:02d}-{chapter_chirho:03d}-{edition_chirho}"
    )
    receipt_path_chirho = (
        RUN_CHIRHO
        / "receipts-chirho"
        / f"{book_chirho:02d}-chirho"
        / (key_chirho + "-chirho.json")
    )
    body_path_chirho = (
        RUN_CHIRHO
        / "bodies-chirho"
        / f"{book_chirho:02d}-chirho"
        / (key_chirho + "-chirho.json.gz")
    )
    if receipt_path_chirho.exists():
        receipt_chirho = json.loads(receipt_path_chirho.read_bytes())
        if receipt_chirho["outcome_chirho"] != "received":
            return None, receipt_chirho
        body_chirho = gzip.decompress(body_path_chirho.read_bytes())
        if (
            len(body_chirho) != receipt_chirho["bytes_chirho"]
            or hashlib.sha256(body_chirho).hexdigest()
            != receipt_chirho["sha256_chirho"]
        ):
            raise ValueError("retained body differs from receipt")
        reserve_bytes_chirho(len(body_chirho))
        return body_chirho, receipt_chirho
    if OFFLINE_CHIRHO:
        raise ValueError(f"no retained receipt for offline job {key_chirho}")
    language_code_chirho = "eng" if language_chirho == "en" else "spa"
    url_chirho = f"{BASE_URL_CHIRHO}/read-chirho/{language_code_chirho}/{book_chirho:02d}{chapter_chirho:03d}/__data.json?type={edition_chirho}"
    receipt_chirho = {"url_chirho": url_chirho, "attempts_chirho": []}
    sample_chirho = cached_sample_chirho(
        language_code_chirho, book_chirho, chapter_chirho, edition_chirho
    )
    if sample_chirho:
        body_chirho, sample_receipt_chirho = sample_chirho
        if sample_receipt_chirho["url_chirho"] != url_chirho:
            raise ValueError("sample URL differs from frozen source")
        receipt_chirho["reused_sample_receipt_chirho"] = sample_receipt_chirho
    else:
        body_chirho = None
        for attempt_number_chirho in range(2):
            attempt_chirho = {
                "started_at_chirho": datetime.datetime.now(datetime.UTC).isoformat(),
                "number_chirho": attempt_number_chirho + 1,
            }
            receipt_chirho["attempts_chirho"].append(attempt_chirho)
            if shutil.disk_usage(HERE_CHIRHO).free < MIN_FREE_CHIRHO:
                raise RuntimeError(
                    "free disk below unchanged private-acquisition 20 GiB floor"
                )
            receipt_chirho["outcome_chirho"] = "fetch_started"
            write_chirho(receipt_path_chirho, json_bytes_chirho(receipt_chirho))
            try:
                with urllib.request.urlopen(
                    urllib.request.Request(
                        url_chirho,
                        headers={
                            "User-Agent": "Hinneh-read-only-edition-acquisition-chirho/1"
                        },
                    ),
                    timeout=30,
                ) as response_chirho:
                    if response_chirho.geturl() != url_chirho:
                        raise ValueError(
                            "reader response changed origin or request identity"
                        )
                    body_chirho = response_chirho.read(MAX_BODY_CHIRHO + 1)
                    attempt_chirho["status_chirho"] = response_chirho.status
                if len(body_chirho) > MAX_BODY_CHIRHO:
                    raise ValueError("reader response exceeds 2 MB")
                break
            except (
                urllib.error.URLError,
                TimeoutError,
                ConnectionError,
            ) as error_chirho:
                attempt_chirho["error_chirho"] = str(error_chirho)
                write_chirho(receipt_path_chirho, json_bytes_chirho(receipt_chirho))
                transient_chirho = not isinstance(
                    error_chirho, urllib.error.HTTPError
                ) or error_chirho.code in {408, 429, 500, 502, 503, 504}
                if not transient_chirho or attempt_number_chirho == 1:
                    break
                time.sleep(1)
    if body_chirho is None:
        receipt_chirho["outcome_chirho"] = "held_fetch_failure"
    else:
        reserve_bytes_chirho(len(body_chirho))
        receipt_chirho.update(
            outcome_chirho="received",
            bytes_chirho=len(body_chirho),
            sha256_chirho=hashlib.sha256(body_chirho).hexdigest(),
            body_path_chirho=str(body_path_chirho),
        )
        write_chirho(body_path_chirho, gzip.compress(body_chirho, mtime=0))
    write_chirho(receipt_path_chirho, json_bytes_chirho(receipt_chirho))
    return body_chirho, receipt_chirho


def reserve_bytes_chirho(count_chirho: int) -> None:
    with LOCK_CHIRHO:
        TOTAL_CHIRHO[0] += count_chirho
        if TOTAL_CHIRHO[0] > MAX_TOTAL_CHIRHO:
            raise RuntimeError("finite total byte cap exceeded")


def chapter_chirho(entry_chirho: dict) -> dict:
    content_body_chirho = (
        REPO_CHIRHO / "static" / entry_chirho["content_path_chirho"].lstrip("/")
    ).read_bytes()
    content_chirho = verify_content_chirho(
        content_body_chirho, entry_chirho["content_sha256_chirho"]
    )
    result_chirho = {"entry_chirho": entry_chirho, "languages_chirho": {}}
    for language_chirho, editions_chirho in {
        "en": ["readers", "terse"],
        "es": ["terse"],
    }.items():
        verses_chirho = {}
        sources_chirho = []
        holds_chirho = {}
        for edition_chirho in editions_chirho:
            body_chirho, receipt_chirho = fetch_chirho(
                language_chirho, entry_chirho, edition_chirho
            )
            if body_chirho is None:
                holds_chirho[edition_chirho] = {
                    "chapter_chirho": receipt_chirho["outcome_chirho"]
                }
                continue
            try:
                source_verses_chirho = decode_reader_chirho(
                    body_chirho,
                    "eng" if language_chirho == "en" else "spa",
                    entry_chirho["book_number_chirho"],
                    entry_chirho["number_chirho"],
                    edition_chirho,
                )
                source_id_chirho = f"bible-tools-{language_chirho}-{edition_chirho}-{entry_chirho['book_number_chirho']:02d}-{entry_chirho['number_chirho']:03d}-chirho"
                aligned_chirho, held_chirho = align_edition_chirho(
                    content_chirho, source_verses_chirho, source_id_chirho
                )
                holds_chirho[edition_chirho] = held_chirho
                for lesson_chirho, aligned_verse_chirho in aligned_chirho.items():
                    verses_chirho.setdefault(lesson_chirho, {})[
                        edition_chirho + "_chirho"
                    ] = aligned_verse_chirho
                sources_chirho.append(
                    {
                        "id_chirho": source_id_chirho,
                        "title_chirho": f"Bible Tools {edition_chirho.title()} (imported draft)",
                        "url_chirho": receipt_chirho["url_chirho"],
                        "revision_chirho": receipt_chirho["sha256_chirho"],
                        "sha256_chirho": receipt_chirho["sha256_chirho"],
                        "attribution_chirho": "Love Jesus Project / Bible Tools, https://global-tools.bible.systems/",
                        "review_chirho": "source state and origin preserved per word; not GBT-approved",
                        "license_evidence_chirho": "Love Jesus Project SWORD EN/ES module metadata declares CC BY 4.0; preserve underlying imported-source rights and edition scope",
                        "publication_chirho": "private candidate; source rights reconciliation remains Root-owned",
                    }
                )
            except (
                EditionUnavailableChirho,
                ValueError,
                KeyError,
                TypeError,
            ) as error_chirho:
                holds_chirho[edition_chirho] = {"chapter_chirho": str(error_chirho)}
        layer_chirho = {
            "schema_version_chirho": 1,
            "language_chirho": language_chirho,
            "book_id_chirho": entry_chirho["book_id_chirho"],
            "chapter_chirho": entry_chirho["number_chirho"],
            "content_path_chirho": entry_chirho["content_path_chirho"],
            "content_sha256_chirho": entry_chirho["content_sha256_chirho"],
            "sources_chirho": sources_chirho,
            "verses_chirho": verses_chirho,
        }
        public_path_chirho = f"/glosses-chirho/editions-chirho/{language_chirho}-chirho/{entry_chirho['slug_chirho']}/chapter-{entry_chirho['number_chirho']:02d}-chirho.json"
        layer_body_chirho = json_bytes_chirho(layer_chirho)
        write_chirho(OUTPUT_CHIRHO / public_path_chirho.lstrip("/"), layer_body_chirho)
        result_chirho["languages_chirho"][language_chirho] = {
            "path_chirho": public_path_chirho,
            "sha256_chirho": hashlib.sha256(layer_body_chirho).hexdigest(),
            "bytes_chirho": len(layer_body_chirho),
            "variant_counts_chirho": {
                edition_chirho: sum(
                    edition_chirho + "_chirho" in verse_chirho
                    for verse_chirho in verses_chirho.values()
                )
                for edition_chirho in editions_chirho
            },
            "holds_chirho": holds_chirho,
        }
    return result_chirho


def main_chirho() -> None:
    parser_chirho = argparse.ArgumentParser()
    parser_chirho.add_argument("--run-chirho", action="store_true")
    parser_chirho.add_argument("--chapter-limit-chirho", type=int)
    parser_chirho.add_argument("--repository-chirho", type=Path, default=REPO_CHIRHO)
    parser_chirho.add_argument("--evidence-chirho", type=Path, required=True)
    parser_chirho.add_argument("--offline-chirho", action="store_true")
    arguments_chirho = parser_chirho.parse_args()
    configure_chirho(
        arguments_chirho.repository_chirho,
        arguments_chirho.evidence_chirho,
        arguments_chirho.offline_chirho,
    )
    RUN_CHIRHO.mkdir(parents=True, exist_ok=True)
    expected_plan_chirho = plan_chirho()
    plan_path_chirho = RUN_CHIRHO / "plan-chirho.json"
    plan_body_chirho = json_bytes_chirho(expected_plan_chirho)
    if plan_path_chirho.exists() and plan_path_chirho.read_bytes() != plan_body_chirho:
        raise ValueError("frozen plan differs; no source pin refreshed")
    if not plan_path_chirho.exists():
        write_chirho(plan_path_chirho, plan_body_chirho)
        plan_path_chirho.chmod(0o444)
    if not arguments_chirho.run_chirho:
        print(
            json.dumps(
                {
                    "chapters_chirho": len(expected_plan_chirho["chapters_chirho"]),
                    "requests_chirho": 3567,
                    "plan_sha256_chirho": hashlib.sha256(plan_body_chirho).hexdigest(),
                }
            )
        )
        return
    entries_chirho = expected_plan_chirho["chapters_chirho"]
    if arguments_chirho.chapter_limit_chirho is not None:
        if not 1 <= arguments_chirho.chapter_limit_chirho <= len(entries_chirho):
            raise ValueError("bad finite chapter limit")
        entries_chirho = entries_chirho[: arguments_chirho.chapter_limit_chirho]
    lock_path_chirho = RUN_CHIRHO / "owner-lock-chirho.json"
    if not lock_path_chirho.resolve().is_relative_to(HERE_CHIRHO):
        raise ValueError("owner lock outside isolated evidence root")
    descriptor_chirho = os.open(
        lock_path_chirho, os.O_WRONLY | os.O_CREAT | os.O_EXCL, 0o600
    )
    os.write(descriptor_chirho, json_bytes_chirho({"pid_chirho": os.getpid()}))
    os.close(descriptor_chirho)
    manifest_chirho = {
        "schema_version_chirho": 1,
        "languages_chirho": {"en": {"books_chirho": {}}, "es": {"books_chirho": {}}},
        "complete_chirho": False,
    }
    results_chirho = []
    try:
        with concurrent.futures.ThreadPoolExecutor(max_workers=2) as pool_chirho:
            for result_chirho in pool_chirho.map(
                chapter_chirho, entries_chirho, buffersize=2
            ):
                results_chirho.append(result_chirho)
                entry_chirho = result_chirho["entry_chirho"]
                for language_chirho, layer_chirho in result_chirho[
                    "languages_chirho"
                ].items():
                    books_chirho = manifest_chirho["languages_chirho"][language_chirho][
                        "books_chirho"
                    ]
                    book_chirho = books_chirho.setdefault(
                        entry_chirho["book_id_chirho"], {"chapters_chirho": []}
                    )
                    book_chirho["chapters_chirho"].append(
                        {
                            "number_chirho": entry_chirho["number_chirho"],
                            "path_chirho": layer_chirho["path_chirho"],
                            "sha256_chirho": layer_chirho["sha256_chirho"],
                            "content_path_chirho": entry_chirho["content_path_chirho"],
                            "content_sha256_chirho": entry_chirho[
                                "content_sha256_chirho"
                            ],
                        }
                    )
                if len(results_chirho) == 1 or len(results_chirho) % 10 == 0:
                    write_chirho(
                        OUTPUT_CHIRHO
                        / "glosses-chirho/editions-chirho/manifest-chirho.json",
                        json_bytes_chirho(manifest_chirho),
                    )
                    print(
                        json.dumps(
                            {
                                "completed_chapters_chirho": len(results_chirho),
                                "planned_chapters_chirho": len(entries_chirho),
                                "last_chirho": entry_chirho["book_id_chirho"]
                                + "."
                                + str(entry_chirho["number_chirho"]),
                                "retained_body_bytes_chirho": TOTAL_CHIRHO[0],
                            }
                        ),
                        flush=True,
                    )
                    write_chirho(
                        RUN_CHIRHO / "progress-chirho.json",
                        json_bytes_chirho(
                            {
                                "completed_chapters_chirho": len(results_chirho),
                                "planned_chapters_chirho": len(entries_chirho),
                                "pid_chirho": os.getpid(),
                            }
                        ),
                    )
        manifest_chirho["complete_chirho"] = len(results_chirho) == 1189
        write_chirho(
            OUTPUT_CHIRHO / "glosses-chirho/editions-chirho/manifest-chirho.json",
            json_bytes_chirho(manifest_chirho),
        )
        write_chirho(
            RUN_CHIRHO / "results-chirho.json", json_bytes_chirho(results_chirho)
        )
    finally:
        lock_path_chirho.unlink()


if __name__ == "__main__":
    main_chirho()
