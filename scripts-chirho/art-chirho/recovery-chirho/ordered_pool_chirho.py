# For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life. — John 3:16 (KJV)
"""Bounded ordered-book generation; only the calling owner installs catalogue records."""

import errno
import re
import shutil
import subprocess
import time
import uuid
from concurrent.futures import FIRST_COMPLETED, ThreadPoolExecutor, wait
from datetime import UTC, datetime

MAX_CONCURRENCY_CHIRHO = 3
MINIMUM_FREE_BYTES_CHIRHO = 2 * 1024**3
ERRORS_CHIRHO = (OSError, RuntimeError, ValueError, KeyError, TypeError, subprocess.SubprocessError)


class SourceChangedChirho(ValueError):
    """A shared source disagreement stops dispatch while started requests drain."""


class OrderedPoolChirho:
    """Workflow: art-recovery-chirho.md; identities are durable before every image request."""

    def __init__(self, owner_chirho, root_chirho, book_chirho, jobs_chirho, concurrency_chirho):
        if type(concurrency_chirho) is not int or not 1 <= concurrency_chirho <= 3:
            raise ValueError("Ordered scene concurrency must be between one and three")
        self.owner_chirho = owner_chirho
        self.base_chirho = owner_chirho.BASE_CHIRHO
        self.recovery_chirho = owner_chirho.RECOVERY_CHIRHO
        self.root_chirho = root_chirho
        self.book_chirho = book_chirho
        self.jobs_chirho = jobs_chirho
        self.by_id_chirho = {job_chirho["id_chirho"]: job_chirho for job_chirho in jobs_chirho}
        if len(self.by_id_chirho) != len(jobs_chirho):
            raise ValueError("Duplicate verse in ordered scene queue")
        self.concurrency_chirho = concurrency_chirho
        self.home_chirho = root_chirho / owner_chirho.HOME_CHIRHO
        self.inflight_chirho = self.home_chirho / "inflight-chirho.json"
        self.seen_chirho = set()
        self.active_chirho = []
        self.failed_chirho = 0

    def status_chirho(self, state_chirho, **extra_chirho):
        self.owner_chirho.status_chirho(
            self.root_chirho,
            state_chirho,
            book_chirho=self.book_chirho,
            concurrency_chirho=self.concurrency_chirho,
            completed_chirho=len(self.seen_chirho),
            total_chirho=len(self.jobs_chirho),
            held_requests_chirho=self.recovery_chirho.count_chirho(self.home_chirho),
            **extra_chirho,
        )

    def recover_chirho(self):
        prepared_chirho = []
        for path_chirho in sorted(
            self.home_chirho.glob(f"attempt-{self.book_chirho.lower()}-*/prepared-chirho.json")
        ):
            row_chirho = self.base_chirho.load_chirho(path_chirho)
            if row_chirho["lesson_id_chirho"] not in self.by_id_chirho:
                raise ValueError("Prepared record outside source queue")
            prepared_chirho.append((path_chirho, row_chirho))
        pending_reader_chirho = getattr(self.owner_chirho, "pending_prepared_chirho", None)
        pending_chirho = pending_reader_chirho(self.root_chirho) if pending_reader_chirho else None
        outside_chirho = (
            pending_chirho is not None
            and pending_chirho["lesson_id_chirho"] not in self.by_id_chirho
        )
        if outside_chirho and prepared_chirho:
            self.status_chirho("waiting_for_archive")
            return False
        if pending_chirho is not None and not outside_chirho:
            matches_chirho = [
                item_chirho
                for item_chirho in prepared_chirho
                if item_chirho[1]["lesson_id_chirho"] == pending_chirho["lesson_id_chirho"]
            ]
            if len(matches_chirho) != 1 or matches_chirho[0][1] != pending_chirho:
                raise ValueError(
                    "Pending archive has no unique exact prepared output; reconcile first"
                )
            # UUID order has no authority over the append-only archive frontier.
            first_chirho = matches_chirho[0]
            prepared_chirho = [first_chirho] + [
                item_chirho for item_chirho in prepared_chirho if item_chirho != first_chirho
            ]
        for path_chirho, row_chirho in prepared_chirho:
            self.owner_chirho.install_chirho(
                self.root_chirho,
                self.book_chirho,
                self.by_id_chirho[row_chirho["lesson_id_chirho"]],
                path_chirho.parent,
                row_chirho,
            )
            self.recovery_chirho.resolve_chirho(self.home_chirho, path_chirho.parent)
        path_chirho = self.owner_chirho.manifest_path_chirho(self.root_chirho, self.book_chirho)
        manifest_chirho = (
            self.base_chirho.load_chirho(path_chirho)
            if path_chirho.exists()
            else {"book_id_chirho": self.book_chirho, "scenes_chirho": []}
        )
        if manifest_chirho["book_id_chirho"] != self.book_chirho:
            raise ValueError("Manifest book mismatch")
        for row_chirho in manifest_chirho["scenes_chirho"]:
            identifier_chirho = row_chirho["lesson_id_chirho"]
            if identifier_chirho in self.seen_chirho or identifier_chirho not in self.by_id_chirho:
                raise ValueError("Duplicate or out-of-scope scene record")
            self.owner_chirho.verify_chirho(
                self.root_chirho, self.by_id_chirho[identifier_chirho], row_chirho
            )
            self.seen_chirho.add(identifier_chirho)
        if outside_chirho and len(self.seen_chirho) != len(self.jobs_chirho):
            self.status_chirho("waiting_for_archive")
            return False
        if not self.inflight_chirho.exists():
            return True
        previous_chirho = self.base_chirho.load_chirho(self.inflight_chirho)
        if previous_chirho.get("book_chirho") != self.book_chirho:
            if len(self.seen_chirho) == len(self.jobs_chirho):
                return True
            raise ValueError("Unresolved generation belongs to another book")
        rows_chirho = previous_chirho.get("active_jobs_chirho", [previous_chirho])
        if not isinstance(rows_chirho, list) or not 1 <= len(rows_chirho) <= 3:
            raise ValueError("Invalid bounded ordered in-flight checkpoint")
        identities_chirho = set()
        active_unknown_chirho = False
        for row_chirho in rows_chirho:
            identifier_chirho = row_chirho.get("verse_id_chirho")
            attempt_name_chirho = row_chirho.get("attempt_chirho", "")
            if (
                identifier_chirho not in self.by_id_chirho
                or identifier_chirho in identities_chirho
                or not re.fullmatch(
                    rf"attempt-{self.book_chirho.lower()}-[a-z0-9-]{{1,128}}",
                    attempt_name_chirho,
                )
            ):
                raise ValueError("Invalid or repeated ordered recovery identity")
            identities_chirho.add(identifier_chirho)
            if identifier_chirho in self.seen_chirho:
                continue
            attempt_chirho = self.home_chirho / attempt_name_chirho
            self.recovery_chirho.hold_chirho(
                self.home_chirho,
                attempt_chirho,
                "verse",
                [identifier_chirho],
                "Prior generation retained; never repeat this uncertain request",
                row_chirho,
            )
            active_unknown_chirho |= self.recovery_chirho.active_chirho(attempt_chirho)
        if active_unknown_chirho:
            self.status_chirho("needs_reconciliation", active_jobs_chirho=rows_chirho)
            return False
        self.inflight_chirho.unlink()
        return True

    def checkpoint_chirho(self):
        rows_chirho = [
            {
                "verse_id_chirho": item_chirho["job_chirho"]["id_chirho"],
                "attempt_chirho": item_chirho["attempt_chirho"].name,
                "started_at_chirho": item_chirho["started_at_chirho"],
            }
            for item_chirho in self.active_chirho
        ]
        if not rows_chirho:
            self.inflight_chirho.unlink(missing_ok=True)
            return
        self.base_chirho.atomic_json_chirho(
            self.inflight_chirho,
            {
                "schema_version_chirho": 1,
                "book_chirho": self.book_chirho,
                "concurrency_chirho": self.concurrency_chirho,
                "active_jobs_chirho": rows_chirho,
            },
        )
        self.status_chirho("generating", **rows_chirho[0], active_jobs_chirho=rows_chirho)

    def generate_chirho(self, generator_chirho, context_chirho):
        # Only attempt-local files are written by this thread. A crash leaves dispatch unknown.
        try:
            generator_chirho(
                self.root_chirho,
                self.book_chirho,
                context_chirho["job_chirho"],
                context_chirho["attempt_chirho"],
            )
        finally:
            self.recovery_chirho.request_chirho(
                context_chirho["attempt_chirho"], finished_chirho=True
            )

    def prepare_chirho(self, context_chirho):
        context_chirho["future_chirho"].result()
        job_chirho, attempt_chirho = (
            context_chirho["job_chirho"],
            context_chirho["attempt_chirho"],
        )
        row_chirho = self.owner_chirho.record_chirho(self.root_chirho, job_chirho, attempt_chirho)
        self.base_chirho.atomic_json_chirho(attempt_chirho / "prepared-chirho.json", row_chirho)
        return row_chirho

    def install_prepared_chirho(self_chirho, context_chirho, row_chirho):
        job_chirho, attempt_chirho = (
            context_chirho["job_chirho"],
            context_chirho["attempt_chirho"],
        )
        self_chirho.owner_chirho.install_chirho(
            self_chirho.root_chirho, self_chirho.book_chirho, job_chirho, attempt_chirho, row_chirho
        )
        self_chirho.recovery_chirho.resolve_chirho(self_chirho.home_chirho, attempt_chirho)
        self_chirho.seen_chirho.add(job_chirho["id_chirho"])
        self_chirho.failed_chirho = 0

    def run_chirho(self, generator_chirho, watch_chirho):
        if not self.recover_chirho():
            return False
        held_chirho = self.recovery_chirho.blocked_chirho(self.home_chirho, "verse")
        pending_chirho = iter(
            job_chirho
            for job_chirho in self.jobs_chirho
            if job_chirho["id_chirho"] not in self.seen_chirho
            and self.recovery_chirho.key_chirho(job_chirho["id_chirho"]) not in held_chirho
        )
        exhausted_chirho = False
        fatal_chirho = None
        last_watch_chirho = 0
        with ThreadPoolExecutor(max_workers=self.concurrency_chirho) as pool_chirho:

            def refill_chirho():
                nonlocal exhausted_chirho, fatal_chirho
                while (
                    len(self.active_chirho) < self.concurrency_chirho
                    and not exhausted_chirho
                    and not self.owner_chirho.draining_chirho()
                    and fatal_chirho is None
                    and self.failed_chirho < 3
                    and (self.failed_chirho == 0 or not self.active_chirho)
                ):
                    # Consume a peer's already-known failure before another external request.
                    if any(
                        item_chirho["future_chirho"].done()
                        and (
                            item_chirho["future_chirho"].cancelled()
                            or item_chirho["future_chirho"].exception() is not None
                        )
                        for item_chirho in self.active_chirho
                    ):
                        break
                    job_chirho = next(pending_chirho, None)
                    if job_chirho is None:
                        exhausted_chirho = True
                        break
                    if shutil.disk_usage(self.root_chirho).free < MINIMUM_FREE_BYTES_CHIRHO:
                        fatal_chirho = OSError(
                            errno.ENOSPC, "Less than 2 GiB free; no new image request"
                        )
                        break
                    attempt_chirho = self.home_chirho / (
                        f"attempt-{self.book_chirho.lower()}-{uuid.uuid4().hex}"
                    )
                    attempt_chirho.mkdir()
                    context_chirho = {
                        "job_chirho": job_chirho,
                        "attempt_chirho": attempt_chirho,
                        "started_at_chirho": datetime.now(UTC).isoformat(),
                    }
                    self.recovery_chirho.request_chirho(attempt_chirho)
                    self.active_chirho.append(context_chirho)
                    self.checkpoint_chirho()
                    context_chirho["future_chirho"] = pool_chirho.submit(
                        self.generate_chirho, generator_chirho, context_chirho
                    )

            while self.active_chirho or not exhausted_chirho:
                if watch_chirho and time.monotonic() - last_watch_chirho >= 10:
                    if watch_chirho() == "needs_reconciliation":
                        print("Icon lane held; continuing independent verse scenes.", flush=True)
                    last_watch_chirho = time.monotonic()
                refill_chirho()
                if not self.active_chirho:
                    break
                done_chirho, _waiting_chirho = wait(
                    [item_chirho["future_chirho"] for item_chirho in self.active_chirho],
                    timeout=0.5,
                    return_when=FIRST_COMPLETED,
                )
                for context_chirho in list(self.active_chirho):
                    if context_chirho["future_chirho"] not in done_chirho:
                        continue
                    try:
                        row_chirho = self.prepare_chirho(context_chirho)
                        # Prepared bytes survive a crash and recover before in-flight requests.
                        # Only this finished slot is freed; the owner still installs serially.
                        self.active_chirho.remove(context_chirho)
                        self.checkpoint_chirho()
                        refill_chirho()
                        self.install_prepared_chirho(context_chirho, row_chirho)
                    except ERRORS_CHIRHO as error_chirho:
                        self.recovery_chirho.hold_chirho(
                            self.home_chirho,
                            context_chirho["attempt_chirho"],
                            "verse",
                            [context_chirho["job_chirho"]["id_chirho"]],
                            error_chirho,
                            {
                                key_chirho: value_chirho
                                for key_chirho, value_chirho in context_chirho.items()
                                if key_chirho in ("started_at_chirho",)
                            },
                        )
                        self.failed_chirho += 1
                        if isinstance(error_chirho, SourceChangedChirho) or (
                            isinstance(error_chirho, OSError)
                            and error_chirho.errno in (13, 28, 30, 69)
                        ):
                            fatal_chirho = error_chirho
                    if context_chirho in self.active_chirho:
                        self.active_chirho.remove(context_chirho)
                    self.checkpoint_chirho()
                if fatal_chirho or self.failed_chirho >= 3 or self.owner_chirho.draining_chirho():
                    exhausted_chirho = True
        if fatal_chirho:
            self.status_chirho(
                "waiting_for_source"
                if isinstance(fatal_chirho, SourceChangedChirho)
                else "stopped_storage",
                error_chirho=str(fatal_chirho),
            )
            raise fatal_chirho
        if self.owner_chirho.draining_chirho():
            self.status_chirho("drained")
            return False
        complete_chirho = len(self.seen_chirho) == len(self.jobs_chirho)
        self.status_chirho(
            "completed_verse"
            if complete_chirho
            else "waiting_for_generator"
            if self.failed_chirho >= 3
            else "scenes_with_holds"
        )
        return complete_chirho


def run_chirho(
    owner_chirho,
    root_chirho,
    book_chirho,
    jobs_chirho,
    generator_chirho,
    watch_chirho=None,
    concurrency_chirho=1,
):
    return OrderedPoolChirho(
        owner_chirho, root_chirho, book_chirho, jobs_chirho, concurrency_chirho
    ).run_chirho(generator_chirho, watch_chirho)
