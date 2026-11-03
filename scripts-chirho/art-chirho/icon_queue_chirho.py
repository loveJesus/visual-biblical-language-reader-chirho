#!/usr/bin/env python3
# For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life. — John 3:16 (KJV)
"""Local, single-atlas authoring queue. No generation or reader attachment occurs here."""

import argparse
import fcntl
import hashlib
import json
import os
import re
import sqlite3
import sys
import time
import uuid
from contextlib import contextmanager
from pathlib import Path

from PIL import Image

ROOT_CHIRHO = Path(__file__).resolve().parents[2]
ART_CHIRHO = ROOT_CHIRHO / "workspace-chirho/art-chirho"
QUEUE_CHIRHO = ART_CHIRHO / "queue-chirho"
INVENTORY_CHIRHO = ROOT_CHIRHO / "data-chirho/corpus-chirho/proverbs-lemma-inventory-chirho.json"
MEDIA_CHIRHO = ROOT_CHIRHO / "data-chirho/media-chirho/proverbs-26-1-icons-chirho.json"


def candidates_chirho(inventory_chirho, media_chirho):
    existing_chirho = {}
    for icon_chirho in media_chirho["icons_chirho"]:
        existing_chirho.setdefault(
            (
                icon_chirho["token_id_chirho"],
                icon_chirho["lemma_id_chirho"],
                icon_chirho["lemma_augment_chirho"],
            ),
            [],
        ).append(
            {
                "sense_id_chirho": icon_chirho["sense_id_chirho"],
                "contextual_meaning_chirho": icon_chirho["contextual_meaning_chirho"],
                "sense_review_chirho": icon_chirho["sense_review_chirho"],
                "art_review_chirho": icon_chirho["art_review_chirho"],
            }
        )
    grouped_chirho = {}
    for lemma_chirho in inventory_chirho["lemmas_chirho"]:
        for occurrence_chirho in lemma_chirho["occurrences_chirho"]:
            key_chirho = (lemma_chirho["lemma_key_chirho"], occurrence_chirho["gloss_chirho"])
            if key_chirho not in grouped_chirho:
                grouped_chirho[key_chirho] = {
                    "lemma_key_chirho": key_chirho[0],
                    "gloss_chirho": key_chirho[1],
                    "lemma_id_chirho": lemma_chirho["lemma_id_chirho"],
                    "lemma_augment_chirho": lemma_chirho["lemma_augment_chirho"],
                    "lexical_form_chirho": lemma_chirho["lexical_form_chirho"],
                    "sense_status_chirho": "prepared_candidate",
                    "art_status_chirho": "not_generated",
                    "occurrences_chirho": [],
                }
            copy_chirho = dict(occurrence_chirho)
            copy_chirho["existing_context_records_chirho"] = existing_chirho.get(
                (
                    occurrence_chirho["token_id_chirho"],
                    lemma_chirho["lemma_id_chirho"],
                    lemma_chirho["lemma_augment_chirho"],
                ),
                [],
            )
            grouped_chirho[key_chirho]["occurrences_chirho"].append(copy_chirho)
    return [grouped_chirho[key_chirho] for key_chirho in sorted(grouped_chirho)]


@contextmanager
def connect_chirho(queue_chirho, readonly_chirho=False):
    path_chirho = queue_chirho / "queue-chirho.sqlite"
    db_chirho = (
        sqlite3.connect(path_chirho.resolve().as_uri() + "?mode=ro", uri=True, timeout=30)
        if readonly_chirho
        else sqlite3.connect(path_chirho, timeout=30)
    )
    try:
        db_chirho.execute("PRAGMA foreign_keys=ON")
        with db_chirho:
            yield db_chirho
    finally:
        db_chirho.close()


def init_chirho(queue_chirho, inventory_chirho, media_chirho, dry_chirho=False):
    rows_chirho = candidates_chirho(
        json.loads(inventory_chirho.read_text()), json.loads(media_chirho.read_text())
    )
    if dry_chirho:
        return {"candidates_chirho": len(rows_chirho), "dry_run_chirho": True}
    queue_chirho.mkdir(parents=True, exist_ok=True)
    path_chirho = queue_chirho / "queue-chirho.sqlite"
    fd_chirho = os.open(path_chirho, os.O_CREAT | os.O_EXCL | os.O_WRONLY, 0o600)
    os.close(fd_chirho)
    try:
        with connect_chirho(queue_chirho) as db_chirho:
            db_chirho.executescript("""CREATE TABLE candidate_chirho (id_chirho INTEGER PRIMARY KEY, body_chirho TEXT NOT NULL, state_chirho TEXT NOT NULL, claim_chirho TEXT);
CREATE INDEX candidate_state_chirho ON candidate_chirho(state_chirho, id_chirho);
CREATE TABLE claim_chirho (id_chirho TEXT PRIMARY KEY, expires_chirho REAL NOT NULL, state_chirho TEXT NOT NULL, receipt_chirho TEXT);
CREATE INDEX claim_state_chirho ON claim_chirho(state_chirho);
CREATE TABLE meta_chirho (key_chirho TEXT PRIMARY KEY, value_chirho TEXT NOT NULL);""")
            db_chirho.executemany(
                "INSERT INTO candidate_chirho(body_chirho,state_chirho) VALUES (?,?)",
                [
                    (json.dumps(row_chirho, ensure_ascii=False), "ready")
                    for row_chirho in rows_chirho
                ],
            )
            for key_chirho, path_source_chirho in [
                ("inventory_sha256_chirho", inventory_chirho),
                ("media_sha256_chirho", media_chirho),
            ]:
                db_chirho.execute(
                    "INSERT INTO meta_chirho VALUES (?,?)",
                    (key_chirho, hashlib.sha256(path_source_chirho.read_bytes()).hexdigest()),
                )
    except BaseException:
        path_chirho.unlink(missing_ok=True)
        raise
    return {"candidates_chirho": len(rows_chirho), "dry_run_chirho": False}


def locked_chirho(queue_chirho):
    # flock serializes all writers; SQLite transactions make claim/receipt updates atomic.
    if not (queue_chirho / "queue-chirho.sqlite").is_file():
        raise ValueError("Queue is not initialized.")
    return open(queue_chirho / "lock-chirho", "a+")


def reclaim_chirho(db_chirho, now_chirho):
    expired_chirho = db_chirho.execute(
        "SELECT id_chirho FROM claim_chirho WHERE state_chirho='active' AND expires_chirho<=?",
        (now_chirho,),
    ).fetchall()
    for (claim_id_chirho,) in expired_chirho:
        db_chirho.execute(
            "UPDATE candidate_chirho SET state_chirho='ready',claim_chirho=NULL WHERE claim_chirho=?",
            (claim_id_chirho,),
        )
        db_chirho.execute(
            "UPDATE claim_chirho SET state_chirho='expired',receipt_chirho=? WHERE id_chirho=?",
            (json.dumps({"expired_at_chirho": now_chirho}), claim_id_chirho),
        )


def claim_chirho(queue_chirho, count_chirho, lease_chirho, dry_chirho=False, now_chirho=None):
    if not 1 <= count_chirho <= 16 or not 1 <= lease_chirho <= 86400:
        raise ValueError("Count must be 1..16 and lease seconds 1..86400.")
    now_chirho = time.time() if now_chirho is None else now_chirho
    if dry_chirho:
        with connect_chirho(queue_chirho, readonly_chirho=True) as db_chirho:
            active_chirho = db_chirho.execute(
                "SELECT id_chirho FROM claim_chirho WHERE state_chirho='active' AND expires_chirho>?",
                (now_chirho,),
            ).fetchone()
            rows_chirho = db_chirho.execute(
                "SELECT id_chirho,body_chirho FROM candidate_chirho WHERE state_chirho='ready' OR claim_chirho IN (SELECT id_chirho FROM claim_chirho WHERE state_chirho='active' AND expires_chirho<=?) ORDER BY id_chirho LIMIT ?",
                (now_chirho, count_chirho),
            ).fetchall()
            return {
                "active_chirho": bool(active_chirho),
                "candidates_chirho": [
                    dict(json.loads(body_chirho), candidate_id_chirho=id_chirho)
                    for id_chirho, body_chirho in rows_chirho
                ],
                "dry_run_chirho": True,
            }
    with locked_chirho(queue_chirho) as lock_chirho:
        fcntl.flock(lock_chirho, fcntl.LOCK_EX)
        with connect_chirho(queue_chirho) as db_chirho:
            db_chirho.execute("BEGIN IMMEDIATE")
            reclaim_chirho(db_chirho, now_chirho)
            if db_chirho.execute(
                "SELECT 1 FROM claim_chirho WHERE state_chirho='active'"
            ).fetchone():
                raise ValueError("An unexpired claim is already active.")
            rows_chirho = db_chirho.execute(
                "SELECT id_chirho,body_chirho FROM candidate_chirho WHERE state_chirho='ready' ORDER BY id_chirho LIMIT ?",
                (count_chirho,),
            ).fetchall()
            if not rows_chirho:
                return {"candidates_chirho": []}
            claim_id_chirho = uuid.uuid4().hex
            db_chirho.execute(
                "INSERT INTO claim_chirho VALUES (?,?,?,NULL)",
                (claim_id_chirho, now_chirho + lease_chirho, "active"),
            )
            db_chirho.executemany(
                "UPDATE candidate_chirho SET state_chirho='claimed',claim_chirho=? WHERE id_chirho=?",
                [(claim_id_chirho, row_chirho[0]) for row_chirho in rows_chirho],
            )
    return {
        "claim_id_chirho": claim_id_chirho,
        "expires_at_unix_chirho": now_chirho + lease_chirho,
        "candidates_chirho": [
            dict(json.loads(body_chirho), candidate_id_chirho=id_chirho)
            for id_chirho, body_chirho in rows_chirho
        ],
        "instruction_chirho": "Review contextual senses before attaching icons. Generate using Codex image_gen; art remains pending L.J. review.",
    }


def validate_manifest_chirho(path_chirho, art_chirho, rows_chirho):
    root_chirho = art_chirho.resolve(strict=True)
    path_chirho = path_chirho.resolve(strict=True)
    if not path_chirho.is_relative_to(root_chirho) or not path_chirho.is_file():
        raise ValueError("Manifest must be a file inside the art directory.")
    manifest_chirho = json.loads(path_chirho.read_text())
    for field_chirho in ("prompt_chirho", "tool_chirho", "model_chirho", "created_at_chirho"):
        if (
            not isinstance(manifest_chirho.get(field_chirho), str)
            or not manifest_chirho[field_chirho].strip()
        ):
            raise ValueError("Missing manifest provenance: " + field_chirho)
    if (
        manifest_chirho["grid_chirho"] != [4, 4]
        or "image_gen" not in manifest_chirho["tool_chirho"]
    ):
        raise ValueError("Expected a 4x4 Codex image_gen sheet.")
    if not re.fullmatch(r"[0-9a-f]{64}", manifest_chirho.get("sheet_sha256_chirho", "")):
        raise ValueError("Missing sheet SHA-256.")
    cells_chirho = manifest_chirho["cells_chirho"]
    if (
        not isinstance(cells_chirho, list)
        or not 1 <= len(cells_chirho) <= 16
        or len(cells_chirho) != len(rows_chirho)
    ):
        raise ValueError("Manifest must cover exactly the claimed candidates, at most 16.")
    expected_chirho = {id_chirho: json.loads(body_chirho) for id_chirho, body_chirho in rows_chirho}
    seen_chirho, indexes_chirho = set(), set()
    for cell_chirho in cells_chirho:
        id_chirho = cell_chirho.get("candidate_id_chirho")
        index_chirho = cell_chirho.get("cell_chirho")
        if (
            id_chirho not in expected_chirho
            or id_chirho in seen_chirho
            or type(index_chirho) is not int
            or not 0 <= index_chirho < 16
            or index_chirho in indexes_chirho
        ):
            raise ValueError("Invalid or duplicate candidate/cell.")
        seen_chirho.add(id_chirho)
        indexes_chirho.add(index_chirho)
        candidate_chirho = expected_chirho[id_chirho]
        if (
            cell_chirho.get("lemma_key_chirho") != candidate_chirho["lemma_key_chirho"]
            or cell_chirho.get("gloss_chirho") != candidate_chirho["gloss_chirho"]
        ):
            raise ValueError("Cell candidate identity mismatch.")
        if (
            cell_chirho.get("sense_review_chirho") not in ("agent_reviewed", "human_reviewed")
            or cell_chirho.get("art_review_chirho") != "pending"
            or not cell_chirho.get("sense_id_chirho")
            or not cell_chirho.get("contextual_meaning_chirho")
            or cell_chirho.get("layout_pass_chirho") is not True
        ):
            raise ValueError(
                "Cell needs an explicit reviewed sense, passing layout and pending art."
            )
        relative_chirho = Path(cell_chirho["icon_path_chirho"])
        if relative_chirho.is_absolute() or ".." in relative_chirho.parts:
            raise ValueError("Icon path must be relative to the manifest.")
        icon_chirho = (path_chirho.parent / relative_chirho).resolve(strict=True)
        if (
            not icon_chirho.is_relative_to(path_chirho.parent)
            or not icon_chirho.is_relative_to(root_chirho)
            or not icon_chirho.is_file()
            or icon_chirho.suffix.lower() != ".webp"
        ):
            raise ValueError("Icon escapes manifest directory or is not WebP.")
        if hashlib.sha256(icon_chirho.read_bytes()).hexdigest() != cell_chirho.get(
            "icon_sha256_chirho"
        ):
            raise ValueError("Icon hash mismatch.")
        with Image.open(icon_chirho) as image_chirho:
            if image_chirho.format != "WEBP" or image_chirho.size != (128, 128):
                raise ValueError("Icon must be a 128x128 WebP.")
            image_chirho.load()
    return {
        "manifest_chirho": str(path_chirho.relative_to(root_chirho)),
        "sha256_chirho": hashlib.sha256(path_chirho.read_bytes()).hexdigest(),
        "cells_chirho": len(cells_chirho),
    }


def finish_chirho(
    queue_chirho,
    claim_id_chirho,
    manifest_chirho=None,
    art_chirho=ART_CHIRHO,
    dry_chirho=False,
    now_chirho=None,
):
    now_chirho = time.time() if now_chirho is None else now_chirho

    def perform_chirho(db_chirho):
        claim_row_chirho = db_chirho.execute(
            "SELECT expires_chirho,state_chirho FROM claim_chirho WHERE id_chirho=?",
            (claim_id_chirho,),
        ).fetchone()
        if (
            not claim_row_chirho
            or claim_row_chirho[1] != "active"
            or claim_row_chirho[0] <= now_chirho
        ):
            raise ValueError("Claim is missing, inactive or expired.")
        rows_chirho = db_chirho.execute(
            "SELECT id_chirho,body_chirho FROM candidate_chirho WHERE claim_chirho=? ORDER BY id_chirho",
            (claim_id_chirho,),
        ).fetchall()
        receipt_chirho = (
            validate_manifest_chirho(manifest_chirho, art_chirho, rows_chirho)
            if manifest_chirho
            else {"released_at_chirho": now_chirho}
        )
        if not dry_chirho:
            state_chirho = "completed" if manifest_chirho else "released"
            db_chirho.execute(
                "UPDATE claim_chirho SET state_chirho=?,receipt_chirho=? WHERE id_chirho=?",
                (state_chirho, json.dumps(receipt_chirho), claim_id_chirho),
            )
            db_chirho.execute(
                "UPDATE candidate_chirho SET state_chirho=?,claim_chirho=? WHERE claim_chirho=?",
                (
                    "completed" if manifest_chirho else "ready",
                    claim_id_chirho if manifest_chirho else None,
                    claim_id_chirho,
                ),
            )
        return {"receipt_chirho": receipt_chirho, "dry_run_chirho": dry_chirho}

    if dry_chirho:
        with connect_chirho(queue_chirho, readonly_chirho=True) as db_chirho:
            return perform_chirho(db_chirho)
    with locked_chirho(queue_chirho) as lock_chirho:
        fcntl.flock(lock_chirho, fcntl.LOCK_EX)
        with connect_chirho(queue_chirho) as db_chirho:
            db_chirho.execute("BEGIN IMMEDIATE")
            return perform_chirho(db_chirho)


def main_chirho():
    parser_chirho = argparse.ArgumentParser(description=__doc__)
    parser_chirho.add_argument("--queue-chirho", type=Path, default=QUEUE_CHIRHO)
    parser_chirho.add_argument("--dry-run", action="store_true")
    commands_chirho = parser_chirho.add_subparsers(dest="command_chirho", required=True)
    commands_chirho.add_parser("init")
    commands_chirho.add_parser("status")
    claim_parser_chirho = commands_chirho.add_parser("claim")
    claim_parser_chirho.add_argument("--count-chirho", type=int, default=16)
    claim_parser_chirho.add_argument("--lease-seconds-chirho", type=int, default=3600)
    for command_chirho in ("complete", "release"):
        sub_chirho = commands_chirho.add_parser(command_chirho)
        sub_chirho.add_argument("claim_id_chirho")
        if command_chirho == "complete":
            sub_chirho.add_argument("manifest_chirho", type=Path)
    args_chirho = parser_chirho.parse_args()
    try:
        if args_chirho.command_chirho == "init":
            result_chirho = init_chirho(
                args_chirho.queue_chirho, INVENTORY_CHIRHO, MEDIA_CHIRHO, args_chirho.dry_run
            )
        elif args_chirho.command_chirho == "claim":
            result_chirho = claim_chirho(
                args_chirho.queue_chirho,
                args_chirho.count_chirho,
                args_chirho.lease_seconds_chirho,
                args_chirho.dry_run,
            )
        elif args_chirho.command_chirho in ("complete", "release"):
            result_chirho = finish_chirho(
                args_chirho.queue_chirho,
                args_chirho.claim_id_chirho,
                getattr(args_chirho, "manifest_chirho", None),
                dry_chirho=args_chirho.dry_run,
            )
        else:
            if not (args_chirho.queue_chirho / "queue-chirho.sqlite").is_file():
                raise ValueError("Queue is not initialized.")
            with connect_chirho(args_chirho.queue_chirho, readonly_chirho=True) as db_chirho:
                result_chirho = {
                    "counts_chirho": dict(
                        db_chirho.execute(
                            "SELECT state_chirho,count(*) FROM candidate_chirho GROUP BY state_chirho"
                        )
                    ),
                    "active_claim_chirho": db_chirho.execute(
                        "SELECT id_chirho,expires_chirho FROM claim_chirho WHERE state_chirho='active'"
                    ).fetchone(),
                }
        print(json.dumps(result_chirho, ensure_ascii=False, indent=2))
    except (ValueError, OSError, sqlite3.Error, KeyError, json.JSONDecodeError) as error_chirho:
        print(str(error_chirho), file=sys.stderr)
        raise SystemExit(1) from error_chirho


if __name__ == "__main__":
    main_chirho()
