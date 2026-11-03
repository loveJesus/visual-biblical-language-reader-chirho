#!/usr/bin/env python3
# For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life. — John 3:16 (KJV)
"""Independent, bounded progress leases and durable internal alerts; never resets workers."""

import argparse
import fcntl
import hashlib
import json
import os
import signal
import subprocess
import threading
import time
from pathlib import Path

ROOT_CHIRHO = Path(__file__).resolve().parents[2]
QUEUE_CHIRHO = Path("workspace-chirho/art-chirho/queue-chirho")
STATE_CHIRHO = QUEUE_CHIRHO / "art-watch-chirho/state-chirho.json"
TARGETS_CHIRHO = {
    "scenes-chirho": ("scene-worker-chirho/progress-chirho.json", 900),
    "icons-chirho": ("icon-worker-chirho/progress-chirho.json", 1500),
    "lemma-icons-chirho": ("lemma-worker-chirho/progress-chirho.json", 1500),
    "book-order-chirho": ("ordered-scenes-chirho/status-chirho.json", 1800),
    "bible-icons-chirho": ("bible-icons-chirho/progress-chirho.json", 1500),
}
STOP_CHIRHO = threading.Event()
OWNER_RECOVERY_SECONDS_CHIRHO = 1800


def incidents_chirho(root_chirho, now_chirho):
    # Workflow: spec-chirho/workflows-chirho/art-recovery-chirho.md (independent art leases).
    result_chirho = []
    for worker_chirho, (relative_chirho, lease_chirho) in TARGETS_CHIRHO.items():
        path_chirho = root_chirho / QUEUE_CHIRHO / relative_chirho
        try:
            with path_chirho.open(encoding="utf-8") as file_chirho:
                stat_chirho = os.fstat(file_chirho.fileno())
                if stat_chirho.st_size > 65536:
                    raise ValueError("Oversized progress record")
                progress_chirho = json.load(file_chirho)
            state_chirho = progress_chirho["state_chirho"]
            age_chirho = max(0, now_chirho - stat_chirho.st_mtime)
            held_chirho = state_chirho.startswith("stopped") or state_chirho in (
                "needs_reconciliation",
                "needs_alternate_review",
                "waiting_for_source",
                "waiting_for_generator",
                "waiting_for_inflight",
                "proverbs_lemma_first_with_holds",
                "proverbs_first_pass_with_holds",
                "scenes_with_holds",
                "shared_source_or_storage_hold",
                "generator_capacity_hold",
                "image_tool_unavailable",
                "eligible_complete_with_holds",
            )
            stalled_chirho = (
                state_chirho in ("generating", "completed", "completed_verse", "retrying")
                and age_chirho > lease_chirho
            )
            if not held_chirho and not stalled_chirho:
                continue
            reason_chirho = "stalled" if stalled_chirho else "held"
        except (OSError, ValueError, KeyError, TypeError, AttributeError):
            progress_chirho = {}
            state_chirho, reason_chirho = "unreadable", "unreadable"
        # Timer or pane liveness cannot renew a lease. Only producer-owned progress is read.
        identity_chirho = json.dumps(
            [
                worker_chirho,
                reason_chirho,
                state_chirho,
                progress_chirho.get("attempt_chirho"),
                progress_chirho.get("verse_id_chirho"),
                progress_chirho.get("error_chirho"),
            ],
            sort_keys=True,
        )
        event_chirho = hashlib.sha256(identity_chirho.encode()).hexdigest()
        safe_state_chirho = (
            state_chirho
            if state_chirho
            in (
                "needs_reconciliation",
                "needs_alternate_review",
                "waiting_for_source",
                "waiting_for_generator",
                "waiting_for_inflight",
                "proverbs_lemma_first_with_holds",
                "proverbs_first_pass_with_holds",
                "scenes_with_holds",
                "shared_source_or_storage_hold",
                "generator_capacity_hold",
                "image_tool_unavailable",
                "eligible_complete_with_holds",
                "unreadable",
                "generating",
                "completed",
                "completed_verse",
                "retrying",
                "stopped_layout",
                "stopped",
            )
            else "stopped"
        )
        result_chirho.append(
            {
                "worker_chirho": worker_chirho,
                "state_chirho": safe_state_chirho,
                "reason_chirho": reason_chirho,
                "event_id_chirho": event_chirho,
                "progress_path_chirho": str(QUEUE_CHIRHO / relative_chirho),
            }
        )
    return result_chirho


def notify_chirho(root_chirho, session_chirho, incident_chirho):
    broker_chirho = root_chirho.parent / "metropoleluya-chirho/target/release/metropoleluya-chirho"
    recipient_chirho = incident_chirho.get("recipient_chirho", session_chirho + "/gpt_chirho")
    if recipient_chirho not in (session_chirho + "/gpt_chirho", "AICEO/gpt_chirho"):
        raise ValueError("Unexpected art-recovery recipient")
    body_chirho = (
        f"Hinneh art alert {incident_chirho['event_id_chirho'][:16]}: "
        f"{incident_chirho['worker_chirho']} is {incident_chirho['reason_chirho']} "
        f"(state {incident_chirho['state_chirho']}). "
        f"Read {incident_chirho['progress_path_chirho']}. "
        "GPT works alone and owns recovery; do not assign Claude. Reconcile existing outputs, keep uncertain contexts deferred, "
        "and do not reset retry caps or use a paid fallback. This is an automated progress alert, not human approval."
    )
    result_chirho = subprocess.run(
        [
            str(broker_chirho),
            "post",
            "--from-session",
            session_chirho,
            "--from-agent",
            "art_watch_chirho",
            "--room",
            "vblreader-chirho",
            "--topic",
            "worker-alert-chirho",
            "--to",
            recipient_chirho,
            "--body",
            body_chirho,
        ],
        capture_output=True,
        text=True,
        timeout=30,
        check=True,
    )
    receipt_chirho = json.loads(result_chirho.stdout)
    if not receipt_chirho.get("ok_chirho") or receipt_chirho.get("delivery_count_chirho", 0) < 1:
        raise RuntimeError("Broker has not delivered the alert to the GPT owner")
    return receipt_chirho["message_id_chirho"]


def pass_chirho(root_chirho, now_chirho, state_chirho, deliver_chirho):
    for retired_chirho in set(state_chirho) - set(TARGETS_CHIRHO):
        del state_chirho[retired_chirho]
    active_chirho = incidents_chirho(root_chirho, now_chirho)
    active_workers_chirho = {row_chirho["worker_chirho"] for row_chirho in active_chirho}
    for recovered_chirho in set(state_chirho) - active_workers_chirho:
        del state_chirho[recovered_chirho]
    for incident_chirho in active_chirho:
        worker_chirho = incident_chirho["worker_chirho"]
        previous_chirho = state_chirho.get(worker_chirho, {})
        if previous_chirho.get("attempted_event_chirho") != incident_chirho["event_id_chirho"]:
            previous_chirho = {}
        first_chirho = previous_chirho.get("incident_started_at_chirho", now_chirho)
        if (
            now_chirho - first_chirho >= OWNER_RECOVERY_SECONDS_CHIRHO
            and not previous_chirho.get("escalated_message_id_chirho")
            and now_chirho - previous_chirho.get("escalation_attempted_at_chirho", 0) >= 300
        ):
            previous_chirho["escalation_attempted_at_chirho"] = now_chirho
            try:
                previous_chirho["escalated_message_id_chirho"] = deliver_chirho(
                    {
                        **incident_chirho,
                        "recipient_chirho": "AICEO/gpt_chirho",
                        "reason_chirho": "unresolved after the GPT recovery lease expired",
                    }
                )
            except (OSError, ValueError, RuntimeError, subprocess.SubprocessError):
                previous_chirho["escalation_pending_chirho"] = True
            state_chirho[worker_chirho] = previous_chirho
        if previous_chirho.get("delivered_event_chirho") == incident_chirho["event_id_chirho"]:
            continue
        if (
            previous_chirho.get("attempted_event_chirho") == incident_chirho["event_id_chirho"]
            and now_chirho - previous_chirho.get("attempted_at_chirho", 0) < 300
        ):
            continue
        entry_chirho = {
            **previous_chirho,
            "incident_started_at_chirho": first_chirho,
            "attempted_event_chirho": incident_chirho["event_id_chirho"],
            "attempted_at_chirho": now_chirho,
        }
        try:
            entry_chirho["message_id_chirho"] = deliver_chirho(incident_chirho)
            entry_chirho["delivered_event_chirho"] = incident_chirho["event_id_chirho"]
        except (OSError, ValueError, RuntimeError, subprocess.SubprocessError):
            entry_chirho["delivery_pending_chirho"] = True
        state_chirho[worker_chirho] = entry_chirho
    # Fixed per-worker state: no growing history or prompt/error prose in notifications.
    return active_chirho


def save_chirho(path_chirho, state_chirho):
    temp_chirho = path_chirho.with_suffix(".tmp")
    with temp_chirho.open("w", encoding="utf-8") as file_chirho:
        json.dump(state_chirho, file_chirho, indent=2)
        file_chirho.flush()
        os.fsync(file_chirho.fileno())
    os.replace(temp_chirho, path_chirho)
    directory_chirho = os.open(path_chirho.parent, os.O_RDONLY)
    try:
        os.fsync(directory_chirho)
    finally:
        os.close(directory_chirho)


def main_chirho():
    parser_chirho = argparse.ArgumentParser(description=__doc__)
    parser_chirho.add_argument("--session-chirho", required=True)
    parser_chirho.add_argument("--watch-chirho", action="store_true")
    parser_chirho.add_argument("--notify-chirho", action="store_true")
    parser_chirho.add_argument("--interval-chirho", type=int, default=30)
    arguments_chirho = parser_chirho.parse_args()
    if not 10 <= arguments_chirho.interval_chirho <= 300:
        parser_chirho.error("interval must be 10..300 seconds")
    for signal_chirho in (signal.SIGINT, signal.SIGTERM):
        signal.signal(signal_chirho, lambda *_arguments_chirho: STOP_CHIRHO.set())
    state_path_chirho = ROOT_CHIRHO / STATE_CHIRHO
    state_path_chirho.parent.mkdir(parents=True, exist_ok=True)
    with (state_path_chirho.parent / "watcher.lock").open("a") as lock_chirho:
        fcntl.flock(lock_chirho, fcntl.LOCK_EX | fcntl.LOCK_NB)
        state_chirho = (
            json.loads(state_path_chirho.read_text()) if state_path_chirho.exists() else {}
        )
        while not STOP_CHIRHO.is_set():
            if arguments_chirho.notify_chirho:
                active_chirho = pass_chirho(
                    ROOT_CHIRHO,
                    time.time(),
                    state_chirho,
                    lambda incident_chirho: notify_chirho(
                        ROOT_CHIRHO, arguments_chirho.session_chirho, incident_chirho
                    ),
                )
                save_chirho(state_path_chirho, state_chirho)
            else:
                active_chirho = incidents_chirho(ROOT_CHIRHO, time.time())
            print(json.dumps({"art_incidents_chirho": active_chirho}), flush=True)
            if not arguments_chirho.watch_chirho:
                break
            STOP_CHIRHO.wait(arguments_chirho.interval_chirho)


if __name__ == "__main__":
    main_chirho()
