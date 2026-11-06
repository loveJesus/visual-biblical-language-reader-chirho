# For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life. — John 3:16 (KJV)
"""Durable FIFO and exclusive lemma reservations. Workflow: whole-bible-chirho.md."""

from __future__ import annotations

import json
import re
import sqlite3
import uuid
from contextlib import contextmanager
from datetime import UTC, datetime

MAX_ATTEMPTS_CHIRHO = 3
MAX_BACKLOG_CHIRHO = 8
MAX_SHEETS_CHIRHO = 1000


def now_chirho():
    return datetime.now(UTC).isoformat()


class QueueChirho:
    def __init__(self_chirho, path_chirho):
        path_chirho.parent.mkdir(parents=True, exist_ok=True)
        if path_chirho.is_symlink():
            raise ValueError("Queue cannot be linked")
        self_chirho.db_chirho = sqlite3.connect(
            path_chirho, timeout=20, isolation_level=None
        )
        self_chirho.db_chirho.row_factory = sqlite3.Row
        self_chirho.db_chirho.execute("PRAGMA journal_mode=WAL")
        self_chirho.db_chirho.execute("PRAGMA synchronous=FULL")
        self_chirho.db_chirho.executescript("""
            CREATE TABLE IF NOT EXISTS lemmas_chirho (
                key_chirho TEXT PRIMARY KEY, payload_chirho TEXT NOT NULL,
                state_chirho TEXT NOT NULL, attempts_chirho INTEGER NOT NULL,
                rank_chirho INTEGER NOT NULL, job_chirho TEXT, reason_chirho TEXT,
                origin_chirho TEXT NOT NULL
            );
            CREATE INDEX IF NOT EXISTS ready_chirho ON lemmas_chirho(state_chirho, rank_chirho);
            CREATE TABLE IF NOT EXISTS jobs_chirho (
                id_chirho TEXT PRIMARY KEY, state_chirho TEXT NOT NULL,
                keys_chirho TEXT NOT NULL, created_chirho TEXT NOT NULL,
                result_chirho TEXT, updated_chirho TEXT NOT NULL
            );
            CREATE TABLE IF NOT EXISTS events_chirho (
                id_chirho INTEGER PRIMARY KEY, job_chirho TEXT,
                action_chirho TEXT NOT NULL, at_chirho TEXT NOT NULL, detail_chirho TEXT NOT NULL
            );
            CREATE TABLE IF NOT EXISTS metadata_chirho (key_chirho TEXT PRIMARY KEY, value_chirho TEXT NOT NULL);
            CREATE TABLE IF NOT EXISTS attempt_exceptions_chirho (
                key_chirho TEXT PRIMARY KEY REFERENCES lemmas_chirho(key_chirho),
                maximum_attempts_chirho INTEGER NOT NULL CHECK(maximum_attempts_chirho=4),
                authority_sha256_chirho TEXT NOT NULL
            );
        """)

    @contextmanager
    def transaction_chirho(self_chirho):
        self_chirho.db_chirho.execute("BEGIN IMMEDIATE")
        try:
            yield
        except BaseException:
            self_chirho.db_chirho.execute("ROLLBACK")
            raise
        else:
            self_chirho.db_chirho.execute("COMMIT")

    def event_chirho(self_chirho, job_chirho, action_chirho, detail_chirho):
        self_chirho.db_chirho.execute(
            "INSERT INTO events_chirho(job_chirho,action_chirho,at_chirho,detail_chirho) VALUES(?,?,?,?)",
            (
                job_chirho,
                action_chirho,
                now_chirho(),
                json.dumps(detail_chirho, ensure_ascii=False),
            ),
        )

    def seed_chirho(self_chirho, rows_chirho, evidence_chirho):
        with self_chirho.transaction_chirho():
            previous_chirho = self_chirho.db_chirho.execute(
                "SELECT value_chirho FROM metadata_chirho WHERE key_chirho='seed_chirho'"
            ).fetchone()
            if previous_chirho:
                if json.loads(previous_chirho[0]) != evidence_chirho:
                    raise ValueError("Immutable seed evidence changed; queue not reset")
                return False
            for rank_chirho, row_chirho in enumerate(rows_chirho):
                self_chirho.db_chirho.execute(
                    "INSERT INTO lemmas_chirho VALUES(?,?,?,?,?,NULL,?,?)",
                    (
                        row_chirho["key_chirho"],
                        json.dumps(row_chirho["payload_chirho"], ensure_ascii=False),
                        row_chirho["state_chirho"],
                        row_chirho["attempts_chirho"],
                        rank_chirho,
                        row_chirho["reason_chirho"],
                        json.dumps(row_chirho["origin_chirho"], ensure_ascii=False),
                    ),
                )
            self_chirho.db_chirho.execute(
                "INSERT INTO metadata_chirho VALUES('seed_chirho',?)",
                (json.dumps(evidence_chirho),),
            )
            self_chirho.event_chirho(None, "seeded", evidence_chirho)
            self_chirho.meta_chirho(
                "generator_failures_chirho",
                evidence_chirho.get("generator_failures_chirho", 0),
            )
        return True

    def meta_chirho(self_chirho, key_chirho, value_chirho=None):
        if value_chirho is not None:
            self_chirho.db_chirho.execute(
                "INSERT INTO metadata_chirho VALUES(?,?) ON CONFLICT(key_chirho) DO UPDATE SET value_chirho=excluded.value_chirho",
                (key_chirho, json.dumps(value_chirho)),
            )
        row_chirho = self_chirho.db_chirho.execute(
            "SELECT value_chirho FROM metadata_chirho WHERE key_chirho=?", (key_chirho,)
        ).fetchone()
        return json.loads(row_chirho[0]) if row_chirho else None

    def generation_chirho(self_chirho, sheet_limit_chirho=MAX_SHEETS_CHIRHO):
        if not 1 <= sheet_limit_chirho <= MAX_SHEETS_CHIRHO:
            raise ValueError("Sheet bound exceeded")
        with self_chirho.transaction_chirho():
            if self_chirho.meta_chirho("stop_chirho"):
                return None
            states_chirho = dict(
                self_chirho.db_chirho.execute(
                    "SELECT state_chirho,count(*) FROM jobs_chirho GROUP BY state_chirho"
                )
            )
            if (
                states_chirho.get("generating", 0) >= 2
                or sum(
                    states_chirho.get(state_chirho, 0)
                    for state_chirho in (
                        "generating",
                        "generated",
                        "checking",
                        "installing",
                    )
                )
                >= MAX_BACKLOG_CHIRHO
            ):
                return None
            if sum(states_chirho.values()) >= sheet_limit_chirho:
                return None
            rows_chirho = self_chirho.db_chirho.execute(
                "SELECT l.* FROM lemmas_chirho l LEFT JOIN attempt_exceptions_chirho e USING(key_chirho) WHERE l.state_chirho='queued' AND l.attempts_chirho<coalesce(e.maximum_attempts_chirho,?) ORDER BY l.rank_chirho LIMIT 16",
                (MAX_ATTEMPTS_CHIRHO,),
            ).fetchall()
            if not rows_chirho:
                return None
            id_chirho = "attempt-pipeline-" + uuid.uuid4().hex + "-chirho"
            keys_chirho = [row_chirho["key_chirho"] for row_chirho in rows_chirho]
            self_chirho.db_chirho.execute(
                "INSERT INTO jobs_chirho VALUES(?,?,?,?,NULL,?)",
                (
                    id_chirho,
                    "generating",
                    json.dumps(keys_chirho, ensure_ascii=False),
                    now_chirho(),
                    now_chirho(),
                ),
            )
            self_chirho.db_chirho.executemany(
                "UPDATE lemmas_chirho SET state_chirho='generating',attempts_chirho=attempts_chirho+1,job_chirho=? WHERE key_chirho=? AND state_chirho='queued'",
                [(id_chirho, key_chirho) for key_chirho in keys_chirho],
            )
            self_chirho.event_chirho(id_chirho, "reserved", keys_chirho)
            return id_chirho, [
                json.loads(row_chirho["payload_chirho"]) for row_chirho in rows_chirho
            ]

    def grant_known_failure_chirho(self_chirho, key_chirho, authority_sha256_chirho):
        """One extra attempt for a named known failure; old counters never decrease."""
        if not re.fullmatch(r"[a-f0-9]{64}", authority_sha256_chirho):
            raise ValueError("Exact separately recorded authority required")
        with self_chirho.transaction_chirho():
            row_chirho = self_chirho.db_chirho.execute(
                "SELECT * FROM lemmas_chirho WHERE key_chirho=?", (key_chirho,)
            ).fetchone()
            if (
                not row_chirho
                or row_chirho["state_chirho"] != "held"
                or row_chirho["attempts_chirho"] != MAX_ATTEMPTS_CHIRHO
            ):
                raise ValueError("Only an exhausted held lemma is eligible")
            job_chirho = self_chirho.db_chirho.execute(
                "SELECT * FROM jobs_chirho WHERE id_chirho=?",
                (row_chirho["job_chirho"],),
            ).fetchone()
            result_chirho = (
                json.loads(job_chirho["result_chirho"]) if job_chirho else None
            )
            if (
                not job_chirho
                or job_chirho["state_chirho"] != "done"
                or not result_chirho
                or key_chirho not in result_chirho.get("rejected_chirho", [])
                or result_chirho.get("uncertain_chirho")
                or result_chirho.get("request_made_chirho") is not True
            ):
                raise ValueError(
                    "Known returned failure required; unknown outcomes cannot receive an exception"
                )
            if (
                self_chirho.db_chirho.execute(
                    "SELECT count(*) FROM attempt_exceptions_chirho"
                ).fetchone()[0]
                >= 7
            ):
                raise ValueError("Seven named exception bound reached")
            self_chirho.db_chirho.execute(
                "INSERT INTO attempt_exceptions_chirho VALUES(?,4,?)",
                (key_chirho, authority_sha256_chirho),
            )
            rank_chirho = self_chirho.db_chirho.execute(
                "SELECT max(rank_chirho)+1 FROM lemmas_chirho"
            ).fetchone()[0]
            self_chirho.db_chirho.execute(
                "UPDATE lemmas_chirho SET state_chirho='queued',rank_chirho=?,reason_chirho='Separately authorized one-attempt known-failure exception; original attempts retained' WHERE key_chirho=?",
                (rank_chirho, key_chirho),
            )
            self_chirho.event_chirho(
                row_chirho["job_chirho"],
                "known_failure_exception",
                {
                    "key_chirho": key_chirho,
                    "maximum_attempts_chirho": 4,
                    "authority_sha256_chirho": authority_sha256_chirho,
                },
            )

    def transition_chirho(
        self_chirho, id_chirho, expected_chirho, state_chirho, detail_chirho=None
    ):
        with self_chirho.transaction_chirho():
            changed_chirho = self_chirho.db_chirho.execute(
                "UPDATE jobs_chirho SET state_chirho=?,updated_chirho=?,result_chirho=? WHERE id_chirho=? AND state_chirho=?",
                (
                    state_chirho,
                    now_chirho(),
                    json.dumps(detail_chirho),
                    id_chirho,
                    expected_chirho,
                ),
            ).rowcount
            if changed_chirho != 1:
                raise ValueError("Job changed ownership or state")
            self_chirho.event_chirho(id_chirho, state_chirho, detail_chirho)

    def checking_chirho(self_chirho):
        with self_chirho.transaction_chirho():
            if self_chirho.db_chirho.execute(
                "SELECT 1 FROM jobs_chirho WHERE state_chirho IN ('checking','installing') LIMIT 1"
            ).fetchone():
                return None
            row_chirho = self_chirho.db_chirho.execute(
                "SELECT id_chirho FROM jobs_chirho WHERE state_chirho='generated' ORDER BY created_chirho LIMIT 1"
            ).fetchone()
            if not row_chirho:
                return None
            self_chirho.db_chirho.execute(
                "UPDATE jobs_chirho SET state_chirho='checking',updated_chirho=? WHERE id_chirho=?",
                (now_chirho(), row_chirho[0]),
            )
            self_chirho.event_chirho(row_chirho[0], "checking", None)
            return row_chirho[0]

    def settle_chirho(
        self_chirho,
        id_chirho,
        accepted_chirho,
        rejected_chirho,
        uncertain_chirho,
        reason_chirho,
        request_made_chirho=True,
    ):
        """Only confirmed rejected cells go to the tail; uncertainty stays off the queue."""
        with self_chirho.transaction_chirho():
            job_chirho = self_chirho.db_chirho.execute(
                "SELECT * FROM jobs_chirho WHERE id_chirho=?", (id_chirho,)
            ).fetchone()
            keys_chirho = set(json.loads(job_chirho["keys_chirho"]))
            if job_chirho["state_chirho"] not in (
                "generating",
                "checking",
                "installing",
            ):
                raise ValueError("Job was already settled")
            if not request_made_chirho and (
                accepted_chirho or job_chirho["state_chirho"] != "generating"
            ):
                raise ValueError(
                    "Only a proven pre-image stop may release its reservation"
                )
            if (
                accepted_chirho & rejected_chirho
                or accepted_chirho & uncertain_chirho
                or rejected_chirho & uncertain_chirho
                or keys_chirho != accepted_chirho | rejected_chirho | uncertain_chirho
            ):
                raise ValueError("Outcome must partition every reserved lemma")
            rank_chirho = self_chirho.db_chirho.execute(
                "SELECT coalesce(max(rank_chirho),0) FROM lemmas_chirho"
            ).fetchone()[0]
            for key_chirho in sorted(keys_chirho):
                row_chirho = self_chirho.db_chirho.execute(
                    "SELECT * FROM lemmas_chirho WHERE key_chirho=?", (key_chirho,)
                ).fetchone()
                if row_chirho["job_chirho"] != id_chirho:
                    raise ValueError("Lemma reservation changed")
                state_chirho = "done" if key_chirho in accepted_chirho else "held"
                attempts_chirho = row_chirho["attempts_chirho"] - (
                    0 if request_made_chirho else 1
                )
                exception_chirho = self_chirho.db_chirho.execute(
                    "SELECT maximum_attempts_chirho FROM attempt_exceptions_chirho WHERE key_chirho=?",
                    (key_chirho,),
                ).fetchone()
                if key_chirho in rejected_chirho and attempts_chirho < (
                    exception_chirho[0] if exception_chirho else MAX_ATTEMPTS_CHIRHO
                ):
                    state_chirho = "queued"
                rank_chirho += 1
                self_chirho.db_chirho.execute(
                    "UPDATE lemmas_chirho SET state_chirho=?,rank_chirho=?,reason_chirho=?,attempts_chirho=? WHERE key_chirho=?",
                    (
                        state_chirho,
                        rank_chirho,
                        reason_chirho,
                        attempts_chirho,
                        key_chirho,
                    ),
                )
            result_chirho = {
                "accepted_chirho": sorted(accepted_chirho),
                "rejected_chirho": sorted(rejected_chirho),
                "uncertain_chirho": sorted(uncertain_chirho),
                "reason_chirho": reason_chirho,
                "request_made_chirho": request_made_chirho,
            }
            self_chirho.db_chirho.execute(
                "UPDATE jobs_chirho SET state_chirho=?,updated_chirho=?,result_chirho=? WHERE id_chirho=?",
                (
                    "held" if uncertain_chirho else "done",
                    now_chirho(),
                    json.dumps(result_chirho),
                    id_chirho,
                ),
            )
            self_chirho.event_chirho(id_chirho, "settled", result_chirho)

    def reconcile_unsent_chirho(self_chirho, id_chirho, proof_chirho):
        if (
            proof_chirho.get("confirmed_no_image_chirho") is not True
            or proof_chirho.get("code_chirho") != "model_not_found"
            or proof_chirho.get("image_calls_chirho") != 0
            or len(proof_chirho.get("log_sha256_chirho", "")) != 64
        ):
            raise ValueError("Definitive no-request evidence required")
        with self_chirho.transaction_chirho():
            job_chirho = self_chirho.db_chirho.execute(
                "SELECT * FROM jobs_chirho WHERE id_chirho=?", (id_chirho,)
            ).fetchone()
            if not job_chirho or job_chirho["state_chirho"] != "held":
                raise ValueError(
                    "Only this exact held preflight may be reconciled once"
                )
            rank_chirho = self_chirho.db_chirho.execute(
                "SELECT coalesce(max(rank_chirho),0) FROM lemmas_chirho"
            ).fetchone()[0]
            for key_chirho in json.loads(job_chirho["keys_chirho"]):
                rank_chirho += 1
                changed_chirho = self_chirho.db_chirho.execute(
                    "UPDATE lemmas_chirho SET state_chirho='queued',attempts_chirho=attempts_chirho-1,rank_chirho=?,reason_chirho='Confirmed no image request; original failure retained' WHERE key_chirho=? AND job_chirho=? AND state_chirho='held' AND attempts_chirho>0",
                    (rank_chirho, key_chirho, id_chirho),
                ).rowcount
                if changed_chirho != 1:
                    raise ValueError("The original lemma reservation changed")
            self_chirho.db_chirho.execute(
                "UPDATE jobs_chirho SET state_chirho='confirmed_no_request',updated_chirho=? WHERE id_chirho=?",
                (now_chirho(), id_chirho),
            )
            self_chirho.event_chirho(id_chirho, "confirmed_no_request", proof_chirho)

    def status_chirho(self_chirho):
        latest_chirho = self_chirho.db_chirho.execute(
            "SELECT at_chirho FROM events_chirho ORDER BY id_chirho DESC LIMIT 1"
        ).fetchone()
        return {
            "at_chirho": latest_chirho[0] if latest_chirho else None,
            "lemmas_chirho": dict(
                self_chirho.db_chirho.execute(
                    "SELECT state_chirho,count(*) FROM lemmas_chirho GROUP BY state_chirho"
                )
            ),
            "jobs_chirho": dict(
                self_chirho.db_chirho.execute(
                    "SELECT state_chirho,count(*) FROM jobs_chirho GROUP BY state_chirho"
                )
            ),
            "stop_chirho": self_chirho.meta_chirho("stop_chirho"),
        }
