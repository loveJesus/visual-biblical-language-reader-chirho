# For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life. — John 3:16 (KJV)
"""Chapter-first scheduling over the same durable scene queues and single installer.

Workflow: scene-upgrades-chirho.md. No new renderer, attempt allowance or fallback.
"""

import concurrent.futures as futures_chirho
import threading as threading_chirho

INSTALL_MUTEX_CHIRHO = threading_chirho.RLock()
POLICY_NAME_CHIRHO = "chapter-opening-priority-chirho.json"


class ChapterOwnerChirho:
    """An immutable per-chapter owner; only installation temporarily selects parent state."""

    def __init__(self_chirho, runner_chirho, book_chirho, chapter_chirho):
        self_chirho.runner_chirho = runner_chirho
        self_chirho.book_chirho = book_chirho
        self_chirho.chapter_chirho = chapter_chirho
        self_chirho.HOME_CHIRHO = (
            runner_chirho.MASTER_HOME_CHIRHO
            / "books-chirho"
            / book_chirho["slug_chirho"]
            / f"chapter-{chapter_chirho:03d}-chirho"
        )
        self_chirho.BASE_CHIRHO = runner_chirho.BASE_CHIRHO
        self_chirho.RECOVERY_CHIRHO = runner_chirho.RECOVERY_CHIRHO

    def manifest_path_chirho(self_chirho, root_chirho, _book_chirho):
        return root_chirho / self_chirho.HOME_CHIRHO / "installed-scenes-chirho.json"

    def draining_chirho(self_chirho):
        return self_chirho.runner_chirho.draining_chirho()

    def record_chirho(self_chirho, *arguments_chirho):
        return self_chirho.runner_chirho.record_chirho(*arguments_chirho)

    def verify_chirho(self_chirho, *arguments_chirho):
        return self_chirho.runner_chirho.verify_chirho(*arguments_chirho)

    def selected_chirho(self_chirho, operation_chirho):
        with INSTALL_MUTEX_CHIRHO:
            runner_chirho = self_chirho.runner_chirho
            previous_chirho = (
                runner_chirho.HOME_CHIRHO,
                runner_chirho.CURRENT_CHAPTER_CHIRHO,
            )
            runner_chirho.HOME_CHIRHO = self_chirho.HOME_CHIRHO
            runner_chirho.CURRENT_CHAPTER_CHIRHO = self_chirho.chapter_chirho
            try:
                return operation_chirho()
            finally:
                runner_chirho.HOME_CHIRHO, runner_chirho.CURRENT_CHAPTER_CHIRHO = (
                    previous_chirho
                )

    def status_chirho(self_chirho, *arguments_chirho, **options_chirho):
        self_chirho.selected_chirho(
            lambda: self_chirho.runner_chirho.status_chirho(
                *arguments_chirho, phase_chirho="chapter_openings", **options_chirho
            )
        )

    def install_chirho(self_chirho, *arguments_chirho):
        return self_chirho.selected_chirho(
            lambda: self_chirho.runner_chirho.install_chirho(*arguments_chirho)
        )


def freeze_policy_chirho(root_chirho, runner_chirho):
    value_chirho = {
        "schema_version_chirho": 1,
        "authority_chirho": "L.J. 2026-11-06: first image of every Bible chapter after the book openings; use integrated image generation for those other chapter openings",
        "registry_sha256_chirho": runner_chirho.INVENTORY_CHIRHO[
            "registry_sha256_chirho"
        ],
        "provider_chirho": "built-in image_gen.imagegen only",
        "maximum_concurrency_chirho": 3,
        "existing_attempts_and_holds_chirho": "preserved in their original per-chapter queues",
    }
    path_chirho = root_chirho / runner_chirho.MASTER_HOME_CHIRHO / POLICY_NAME_CHIRHO
    if path_chirho.exists():
        if runner_chirho.sources_chirho.read_chirho(path_chirho) != value_chirho:
            raise ValueError(
                "Chapter-opening policy differs from its source/renderer scope"
            )
    else:
        runner_chirho.sources_chirho.write_chirho(path_chirho, value_chirho)


def candidates_chirho(root_chirho, runner_chirho):
    for book_chirho in runner_chirho.INVENTORY_CHIRHO["books_chirho"]:
        pin_chirho = runner_chirho.INVENTORY_CHIRHO["source_manifests_chirho"][
            book_chirho["id_chirho"]
        ]
        manifest_chirho = runner_chirho.sources_chirho.read_chirho(
            root_chirho / pin_chirho["path_chirho"]
        )
        for entry_chirho in manifest_chirho["chapters_chirho"]:
            owner_chirho = ChapterOwnerChirho(
                runner_chirho, book_chirho, entry_chirho["number_chirho"]
            )
            home_chirho = root_chirho / owner_chirho.HOME_CHIRHO
            checkpoint_path_chirho = owner_chirho.manifest_path_chirho(
                root_chirho, book_chirho["id_chirho"]
            )
            seen_chirho = (
                {
                    row_chirho["lesson_id_chirho"]
                    for row_chirho in runner_chirho.sources_chirho.read_chirho(
                        checkpoint_path_chirho
                    )["scenes_chirho"]
                }
                if checkpoint_path_chirho.exists()
                else set()
            )
            id_chirho = f"{book_chirho['id_chirho']}.{entry_chirho['number_chirho']}.1"
            if id_chirho in seen_chirho or runner_chirho.RECOVERY_CHIRHO.key_chirho(
                id_chirho
            ) in runner_chirho.RECOVERY_CHIRHO.blocked_chirho(home_chirho, "verse"):
                continue
            jobs_chirho = runner_chirho.sources_chirho.chapter_jobs_chirho(
                root_chirho, runner_chirho.INVENTORY_CHIRHO, book_chirho, entry_chirho
            )
            prepared_chirho = {
                runner_chirho.sources_chirho.read_chirho(path_chirho)[
                    "lesson_id_chirho"
                ]
                for path_chirho in home_chirho.glob("attempt-*/prepared-chirho.json")
            }
            chosen_chirho = seen_chirho | prepared_chirho | {id_chirho}
            selected_chirho = [
                row_chirho
                for row_chirho in jobs_chirho
                if row_chirho["id_chirho"] in chosen_chirho
            ]
            if id_chirho not in {
                row_chirho["id_chirho"] for row_chirho in selected_chirho
            }:
                raise ValueError("Canonical chapter has no verse one")
            home_chirho.mkdir(parents=True, exist_ok=True)
            yield owner_chirho, selected_chirho


def run_chirho(root_chirho, runner_chirho, concurrency_chirho, limit_chirho):
    """Three independent chapter artists, one installer, original per-chapter recovery."""
    freeze_policy_chirho(root_chirho, runner_chirho)
    remaining_chirho = limit_chirho - runner_chirho.DISPATCHED_CHIRHO
    if remaining_chirho <= 0:
        return False
    iterator_chirho = iter(candidates_chirho(root_chirho, runner_chirho))
    failures_chirho, selected_chirho = 0, 0
    active_chirho = {}
    with futures_chirho.ThreadPoolExecutor(
        max_workers=concurrency_chirho
    ) as executor_chirho:
        exhausted_chirho = False
        while active_chirho or not exhausted_chirho:
            while (
                len(active_chirho) < concurrency_chirho
                and not exhausted_chirho
                and failures_chirho < 3
                and not runner_chirho.draining_chirho()
                and selected_chirho < remaining_chirho
            ):
                candidate_chirho = next(iterator_chirho, None)
                if candidate_chirho is None:
                    exhausted_chirho = True
                    break
                owner_chirho, jobs_chirho = candidate_chirho
                pool_chirho = runner_chirho.POOL_CHIRHO.OrderedPoolChirho(
                    owner_chirho,
                    root_chirho,
                    owner_chirho.book_chirho["id_chirho"],
                    jobs_chirho,
                    1,
                )
                future_chirho = executor_chirho.submit(
                    pool_chirho.run_chirho, runner_chirho.produce_chirho, None
                )
                active_chirho[future_chirho] = pool_chirho
                selected_chirho += 1
            if not active_chirho:
                break
            done_chirho, _pending_chirho = futures_chirho.wait(
                active_chirho, timeout=0.5, return_when=futures_chirho.FIRST_COMPLETED
            )
            for future_chirho in done_chirho:
                pool_chirho = active_chirho.pop(future_chirho)
                future_chirho.result()
                failures_chirho = (
                    failures_chirho + 1 if pool_chirho.failed_chirho else 0
                )
            if (
                failures_chirho >= 3
                or runner_chirho.draining_chirho()
                or selected_chirho >= remaining_chirho
            ):
                exhausted_chirho = True
    return (
        failures_chirho < 3
        and not runner_chirho.draining_chirho()
        and selected_chirho < remaining_chirho
    )
