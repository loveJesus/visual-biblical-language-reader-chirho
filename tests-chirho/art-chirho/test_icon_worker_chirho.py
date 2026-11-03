# For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life. — John 3:16 (KJV)
"""Exercise the icon worker with isolated fake sheets, never production generation."""

import fcntl
import hashlib
import importlib.util
import json
import subprocess
import tempfile
import unittest
from pathlib import Path
from unittest.mock import Mock as MockChirho
from unittest.mock import patch

from PIL import Image, ImageDraw

ROOT_CHIRHO = Path(__file__).resolve().parents[2]
SCRIPT_CHIRHO = ROOT_CHIRHO / "scripts-chirho/art-chirho"
import sys

sys.path.insert(0, str(SCRIPT_CHIRHO))
spec_chirho = importlib.util.spec_from_file_location(
    "icon_worker_chirho", SCRIPT_CHIRHO / "icon_worker_chirho.py"
)
worker_chirho = importlib.util.module_from_spec(spec_chirho)
spec_chirho.loader.exec_module(worker_chirho)


def write_chirho(path_chirho, value_chirho):
    path_chirho.parent.mkdir(parents=True, exist_ok=True)
    path_chirho.write_text(json.dumps(value_chirho), encoding="utf-8")


def fixture_chirho(root_chirho):
    lemmas_chirho, tokens_chirho = [], []
    for index_chirho in range(32):
        lemma_chirho = f"H{index_chirho + 1}"
        token_chirho = f"token-{index_chirho}"
        gloss_chirho = f"meaning {index_chirho}"
        occurrence_chirho = {
            "verse_id_chirho": "Prov.1.1",
            "token_id_chirho": token_chirho,
            "reading_chirho": "main",
            "gloss_chirho": gloss_chirho,
        }
        lemmas_chirho.append(
            {
                "lemma_id_chirho": lemma_chirho,
                "lemma_augment_chirho": None,
                "lexical_form_chirho": "x",
                "lexical_index_id_chirho": "x",
                "occurrences_chirho": [
                    occurrence_chirho,
                    {**occurrence_chirho, "gloss_chirho": "different inflection"},
                ],
            }
        )
        tokens_chirho.append(
            {
                "id_chirho": token_chirho,
                "lemma_id_chirho": lemma_chirho,
                "lemma_augment_chirho": None,
                "gloss_chirho": gloss_chirho,
            }
        )
    write_chirho(root_chirho / worker_chirho.INVENTORY_CHIRHO, {"lemmas_chirho": lemmas_chirho})
    for path_chirho in worker_chirho.CATALOGUES_CHIRHO:
        write_chirho(root_chirho / path_chirho, {"icons_chirho": []})
    write_chirho(
        root_chirho / "static/content-chirho/proverbs-chirho/chapter-01-chirho.json",
        {"verses_chirho": [{"id_chirho": "Prov.1.1", "tokens_chirho": tokens_chirho}]},
    )


def fake_generator_chirho(root_chirho, attempt_chirho):
    image_chirho = Image.new("RGBA", (1024, 1024), (0, 0, 0, 0))
    draw_chirho = ImageDraw.Draw(image_chirho)
    for index_chirho in range(16):
        x_chirho, y_chirho = (index_chirho % 4) * 256 + 80, (index_chirho // 4) * 256 + 80
        draw_chirho.rectangle(
            (x_chirho, y_chirho, x_chirho + 70, y_chirho + 70), fill=(index_chirho, 80, 120, 255)
        )
        hash_chirho = hashlib.sha256(attempt_chirho.name.encode()).digest()
        image_chirho.putpixel((x_chirho + 1, y_chirho + 1), (*hash_chirho[:3], 255))
    image_chirho.putpixel((0, 0), (1, 2, 3, 8))
    image_chirho.save(attempt_chirho / "sheet-original-chirho.webp", lossless=True, exact=True)
    image_chirho.putpixel((0, 0), (1, 2, 3, 0))
    image_chirho.save(attempt_chirho / "keyed-sheet-chirho.webp", lossless=True, exact=True)
    (attempt_chirho / "prompt-chirho.txt").write_text("fake test prompt")
    subprocess.run(
        [
            sys.executable,
            str(SCRIPT_CHIRHO / "prepare_icon_sheet_chirho.py"),
            str(attempt_chirho / "keyed-sheet-chirho.webp"),
            str(attempt_chirho / "cuts-chirho"),
            "--prompt-chirho",
            str(attempt_chirho / "prompt-chirho.txt"),
        ],
        check=True,
        capture_output=True,
    )
    cuts_chirho = worker_chirho.load_chirho(attempt_chirho / "cuts-chirho/manifest-chirho.json")
    candidates_chirho = worker_chirho.load_chirho(attempt_chirho / "candidates-chirho.json")[:16]
    write_chirho(attempt_chirho / "selection-chirho.json", candidates_chirho)
    cells_chirho = []
    for index_chirho, candidate_chirho in enumerate(candidates_chirho):
        cut_chirho = cuts_chirho["cells_chirho"][index_chirho]
        cells_chirho.append(
            {
                "cell_chirho": index_chirho,
                "verse_id_chirho": candidate_chirho["verse_id_chirho"],
                "token_id_chirho": candidate_chirho["token_id_chirho"],
                "lemma_id_chirho": candidate_chirho["lemma_id_chirho"],
                "lemma_augment_chirho": candidate_chirho["lemma_augment_chirho"],
                "source_gloss_chirho": candidate_chirho["gloss_chirho"],
                "contextual_meaning_chirho": candidate_chirho.get(
                    "contextual_meaning_chirho", candidate_chirho["gloss_chirho"]
                ),
                **(
                    {"sense_id_chirho": candidate_chirho["sense_id_chirho"]}
                    if "alternate_of_chirho" in candidate_chirho
                    else {}
                ),
                "sense_review_chirho": "agent_reviewed",
                "sense_note_chirho": "Test lexical evidence",
                "evidence_refs_chirho": [
                    "oshb-prov-chirho",
                    "gbt-english-prov-chirho",
                    "lexical-index-chirho",
                ],
                "alt_chirho": "test square",
                "icon_path_chirho": "cuts-chirho/" + cut_chirho["icon_path_chirho"],
                "icon_sha256_chirho": cut_chirho["icon_sha256_chirho"],
                "art_review_chirho": "pending",
            }
        )
    write_chirho(
        attempt_chirho / "staged-chirho.json",
        {
            "prompt_chirho": "fake test prompt",
            "created_at_chirho": "2026-10-27T00:00:00Z",
            "review_notes_chirho": "synthetic",
            "tool_chirho": "image_gen.imagegen",
            "model_chirho": "tool-managed; not exposed",
            "grid_chirho": [4, 4],
            "original_sha256_chirho": worker_chirho.digest_chirho(
                attempt_chirho / "sheet-original-chirho.webp"
            ),
            "sheet_sha256_chirho": worker_chirho.digest_chirho(
                attempt_chirho / "keyed-sheet-chirho.webp"
            ),
            "style_reference_chirho": worker_chirho.STYLE_CHIRHO,
            "cells_chirho": cells_chirho,
        },
    )


class WorkerTestChirho(unittest.TestCase):
    def setUp(self):
        self.temp_chirho = tempfile.TemporaryDirectory()
        self.root_chirho = Path(self.temp_chirho.name)
        fixture_chirho(self.root_chirho)

    def tearDown(self):
        self.temp_chirho.cleanup()

    def test_launcher_preserves_source_hold_and_image_attestation_chirho(self_chirho):
        for proposal_chirho, exit_code_chirho in (
            ("source-review-needed-chirho.json", 0),
            ("selection-shortfall-chirho.json", 0),
            (None, 0),
            ("source-review-needed-chirho.json", 3),
            ("selection-shortfall-chirho.json", 3),
        ):
            with (
                self_chirho.subTest(
                    proposal_chirho=proposal_chirho, exit_code_chirho=exit_code_chirho
                ),
                tempfile.TemporaryDirectory() as directory_chirho,
            ):
                root_chirho = Path(directory_chirho)
                attempt_chirho = root_chirho / "attempt-chirho"
                attempt_chirho.mkdir()
                if proposal_chirho:
                    write_chirho(attempt_chirho / proposal_chirho, {})
                child_chirho = MockChirho()
                child_chirho.pid = 123456
                child_chirho.wait.return_value = exit_code_chirho

                def launch_chirho(*_arguments_chirho, child_chirho=child_chirho, **options_chirho):
                    options_chirho["stdout"].write(
                        json.dumps(
                            {
                                "type": "thread.started",
                                "thread_id": "11111111-1111-1111-1111-111111111111",
                            }
                        )
                        + "\n"
                    )
                    return child_chirho

                with (
                    patch.object(worker_chirho.subprocess, "Popen", side_effect=launch_chirho),
                    patch.object(worker_chirho.Path, "home", return_value=root_chirho),
                ):
                    if exit_code_chirho:
                        with self_chirho.assertRaisesRegex(RuntimeError, "failed or interrupted"):
                            worker_chirho.run_generator_chirho(root_chirho, attempt_chirho)
                    elif proposal_chirho:
                        worker_chirho.run_generator_chirho(root_chirho, attempt_chirho)
                    else:
                        with self_chirho.assertRaisesRegex(
                            ValueError, "image_gen call not verified"
                        ):
                            worker_chirho.run_generator_chirho(root_chirho, attempt_chirho)
                self_chirho.assertFalse((attempt_chirho / "sheet-original-chirho.webp").exists())

    def test_source_review_holds_without_retry_or_install_chirho(self_chirho):
        for proposal_chirho, staged_chirho in (
            (name_chirho, staged_chirho)
            for name_chirho in worker_chirho.REVIEW_PROPOSALS_CHIRHO
            for staged_chirho in (False, True)
        ):
            with (
                self_chirho.subTest(proposal_chirho=proposal_chirho, staged_chirho=staged_chirho),
                tempfile.TemporaryDirectory() as directory_chirho,
            ):
                root_chirho = Path(directory_chirho)
                fixture_chirho(root_chirho)
                calls_chirho = []

                def source_review_chirho(
                    root_chirho,
                    attempt_chirho,
                    staged_chirho=staged_chirho,
                    calls_chirho=calls_chirho,
                    proposal_chirho=proposal_chirho,
                ):
                    calls_chirho.append(attempt_chirho)
                    if staged_chirho:
                        fake_generator_chirho(root_chirho, attempt_chirho)
                    selected_chirho = worker_chirho.candidates_chirho(root_chirho)[:16]
                    write_chirho(attempt_chirho / "selection-chirho.json", selected_chirho)
                    write_chirho(
                        attempt_chirho / proposal_chirho,
                        {
                            "selection_chirho": selected_chirho,
                            "reason_chirho": "Synthetic owner review.",
                        },
                    )

                with patch.object(
                    worker_chirho.time,
                    "sleep",
                    side_effect=AssertionError("An owner hold must not schedule image retries"),
                ):
                    self_chirho.assertEqual(
                        worker_chirho.work_chirho(root_chirho, source_review_chirho, False), 0
                    )
                self_chirho.assertEqual(len(calls_chirho), 2)
                protected_chirho = [
                    worker_chirho.load_chirho(item_chirho / "selection-chirho.json")
                    for item_chirho in calls_chirho
                ]
                self_chirho.assertFalse(
                    {worker_chirho.key_chirho(row_chirho) for row_chirho in protected_chirho[0]}
                    & {worker_chirho.key_chirho(row_chirho) for row_chirho in protected_chirho[1]}
                )
                progress_chirho = worker_chirho.load_chirho(
                    root_chirho / worker_chirho.QUEUE_CHIRHO / "progress-chirho.json"
                )
                self_chirho.assertEqual(
                    progress_chirho["state_chirho"], "proverbs_first_pass_with_holds"
                )
                self_chirho.assertEqual(progress_chirho["held_requests_chirho"], 2)
                self_chirho.assertTrue((calls_chirho[0] / proposal_chirho).is_file())
                for catalogue_chirho in worker_chirho.CATALOGUES_CHIRHO:
                    self_chirho.assertEqual(
                        worker_chirho.load_chirho(root_chirho / catalogue_chirho)["icons_chirho"],
                        [],
                    )
                self_chirho.assertEqual(
                    worker_chirho.work_chirho(root_chirho, source_review_chirho, True), 0
                )
                self_chirho.assertEqual(len(calls_chirho), 2)

    def test_once_and_dedupe_chirho(self):
        self.assertEqual(len(worker_chirho.candidates_chirho(self.root_chirho)), 32)
        self.assertEqual(
            worker_chirho.work_chirho(self.root_chirho, fake_generator_chirho, True), 0
        )
        records_chirho = worker_chirho.load_chirho(
            self.root_chirho / worker_chirho.CATALOGUES_CHIRHO[1]
        )["icons_chirho"]
        self.assertEqual(len(records_chirho), 16)
        self.assertTrue(
            all(row_chirho["art_review_chirho"] == "pending" for row_chirho in records_chirho)
        )
        self.assertIn("/0000-chirho/", records_chirho[9]["asset_path_chirho"])
        self.assertIn("/0010-chirho/", records_chirho[10]["asset_path_chirho"])
        self.assertEqual(len(worker_chirho.candidates_chirho(self.root_chirho)), 16)

    def test_logged_failed_selection_does_not_repeat_or_block_disjoint_work_chirho(self):
        attempted_chirho = []

        def generate_chirho(root_chirho, attempt_chirho):
            selected_chirho = worker_chirho.load_chirho(attempt_chirho / "candidates-chirho.json")[
                :16
            ]
            write_chirho(attempt_chirho / "selection-chirho.json", selected_chirho)
            attempted_chirho.append(
                [worker_chirho.key_chirho(row_chirho) for row_chirho in selected_chirho]
            )
            if len(attempted_chirho) == 1:
                raise RuntimeError("Synthetic failed item; result retained for review")
            fake_generator_chirho(root_chirho, attempt_chirho)

        self.assertEqual(worker_chirho.work_chirho(self.root_chirho, generate_chirho), 0)
        self.assertEqual(len(attempted_chirho), 2)
        self.assertFalse(set(attempted_chirho[0]).intersection(attempted_chirho[1]))
        queue_chirho = self.root_chirho / worker_chirho.QUEUE_CHIRHO
        held_chirho = worker_chirho.RECOVERY_CHIRHO.read_chirho(queue_chirho)["holds_chirho"]
        self.assertEqual(len(held_chirho), 1)
        self.assertTrue(
            (queue_chirho / held_chirho[0]["attempt_chirho"] / "failure-chirho.json").exists()
        )
        self.assertEqual(
            len(
                worker_chirho.load_chirho(self.root_chirho / worker_chirho.CATALOGUES_CHIRHO[1])[
                    "icons_chirho"
                ]
            ),
            16,
        )

        def no_repeat_chirho(*_arguments_chirho):
            raise AssertionError("A held request must not be generated again on restart")

        self.assertEqual(worker_chirho.work_chirho(self.root_chirho, no_repeat_chirho), 0)

    def test_final_remainder_and_alternate_restart_chirho(self):
        self.assertEqual(
            worker_chirho.work_chirho(self.root_chirho, fake_generator_chirho, True), 0
        )
        inventory_path_chirho = self.root_chirho / worker_chirho.INVENTORY_CHIRHO
        inventory_chirho = worker_chirho.load_chirho(inventory_path_chirho)
        inventory_chirho["lemmas_chirho"] = inventory_chirho["lemmas_chirho"][:20]
        write_chirho(inventory_path_chirho, inventory_chirho)
        original_chirho = worker_chirho.load_chirho(
            self.root_chirho / worker_chirho.CATALOGUES_CHIRHO[1]
        )["icons_chirho"]
        real_atomic_chirho = worker_chirho.atomic_chirho

        def fail_catalogue_chirho(path_chirho, value_chirho):
            if path_chirho == self.root_chirho / worker_chirho.CATALOGUES_CHIRHO[1]:
                raise OSError("synthetic crash at catalogue write")
            return real_atomic_chirho(path_chirho, value_chirho)

        with patch.object(worker_chirho, "atomic_chirho", fail_catalogue_chirho):
            self.assertEqual(
                worker_chirho.work_chirho(self.root_chirho, fake_generator_chirho, True), 0
            )
        self.assertEqual(
            worker_chirho.work_chirho(self.root_chirho, fake_generator_chirho, True), 0
        )
        records_chirho = worker_chirho.load_chirho(
            self.root_chirho / worker_chirho.CATALOGUES_CHIRHO[1]
        )["icons_chirho"]
        self.assertEqual(len(records_chirho), 32)
        self.assertEqual(
            sum(row_chirho.get("selected_chirho") is False for row_chirho in records_chirho), 12
        )
        for alternative_chirho in records_chirho[20:]:
            source_chirho = next(
                row_chirho
                for row_chirho in original_chirho
                if row_chirho["id_chirho"] == alternative_chirho["alternate_of_chirho"]
            )
            for field_chirho in (
                "lemma_id_chirho",
                "lemma_augment_chirho",
                "lesson_id_chirho",
                "token_id_chirho",
                "sense_id_chirho",
                "contextual_meaning_chirho",
            ):
                self.assertEqual(source_chirho[field_chirho], alternative_chirho[field_chirho])
        self.assertEqual(
            worker_chirho.work_chirho(self.root_chirho, fake_generator_chirho, True), 0
        )
        self.assertEqual(
            worker_chirho.load_chirho(
                self.root_chirho / worker_chirho.QUEUE_CHIRHO / "progress-chirho.json"
            )["state_chirho"],
            "proverbs_first_pass_complete",
        )
        self.assertEqual(
            len(
                worker_chirho.load_chirho(self.root_chirho / worker_chirho.CATALOGUES_CHIRHO[1])[
                    "icons_chirho"
                ]
            ),
            32,
        )

    def test_no_false_completion_without_reviewed_alternates_chirho(self):
        write_chirho(
            self.root_chirho / worker_chirho.CATALOGUES_CHIRHO[1],
            {
                "icons_chirho": [
                    {"lemma_id_chirho": f"H{index_chirho}", "lemma_augment_chirho": None}
                    for index_chirho in range(1, 32)
                ]
            },
        )
        self.assertEqual(
            worker_chirho.work_chirho(self.root_chirho, fake_generator_chirho, True), 1
        )
        state_chirho = worker_chirho.load_chirho(
            self.root_chirho / worker_chirho.QUEUE_CHIRHO / "progress-chirho.json"
        )
        self.assertEqual(state_chirho["state_chirho"], "needs_alternate_review")
        self.assertEqual(state_chirho["remaining_chirho"], 1)

    def test_alternate_requires_exact_reviewed_context_chirho(self):
        self.assertEqual(
            worker_chirho.work_chirho(self.root_chirho, fake_generator_chirho, True), 0
        )
        candidate_chirho = worker_chirho.alternate_candidates_chirho(self.root_chirho, 1)[0]
        worker_chirho.verify_alternate_chirho(self.root_chirho, candidate_chirho)
        for field_chirho in (
            "sense_id_chirho",
            "contextual_meaning_chirho",
            "verse_id_chirho",
            "token_id_chirho",
            "lemma_id_chirho",
            "lemma_augment_chirho",
        ):
            altered_chirho = {**candidate_chirho, field_chirho: "wrong"}
            with self.assertRaises(ValueError):
                worker_chirho.verify_alternate_chirho(self.root_chirho, altered_chirho)

    def test_missing_chapter_tokens_do_not_complete_chirho(self):
        write_chirho(
            self.root_chirho / "static/content-chirho/proverbs-chirho/chapter-01-chirho.json",
            {"verses_chirho": []},
        )
        with self.assertRaisesRegex(ValueError, "no matching chapter token"):
            worker_chirho.work_chirho(self.root_chirho, fake_generator_chirho, True)

    def test_lock_chirho(self):
        queue_chirho = self.root_chirho / worker_chirho.QUEUE_CHIRHO
        queue_chirho.mkdir(parents=True)
        with (queue_chirho / "worker.lock").open("a") as lock_chirho:
            fcntl.flock(lock_chirho, fcntl.LOCK_EX | fcntl.LOCK_NB)
            with self.assertRaises(RuntimeError):
                worker_chirho.work_chirho(self.root_chirho, fake_generator_chirho, True)

    def test_unknown_selection_is_held_without_a_repeated_request_chirho(self):
        calls_chirho = []

        def fail_chirho(root_chirho, attempt_chirho):
            calls_chirho.append(1)
            raise RuntimeError("image tool unavailable")

        self.assertEqual(worker_chirho.work_chirho(self.root_chirho, fail_chirho, True), 0)
        self.assertEqual(worker_chirho.work_chirho(self.root_chirho, fail_chirho, True), 0)
        self.assertEqual(len(calls_chirho), 1)

    def test_explicit_layout_rejection_retries_same_batch_chirho(self):
        calls_chirho = []

        def reject_then_succeed_chirho(root_chirho, attempt_chirho):
            calls_chirho.append(1)
            if len(calls_chirho) == 2:
                return fake_generator_chirho(root_chirho, attempt_chirho)
            selection_chirho = worker_chirho.load_chirho(attempt_chirho / "candidates-chirho.json")[
                :16
            ]
            write_chirho(attempt_chirho / "selection-chirho.json", selection_chirho)
            image_chirho = Image.new("RGBA", (1024, 1024), (100, 100, 100, 255))
            image_chirho.putpixel((0, 0), (0, 0, 0, 0))
            image_chirho.save(attempt_chirho / "sheet-original-chirho.webp", lossless=True)
            image_chirho.save(attempt_chirho / "keyed-sheet-chirho.webp", lossless=True)
            (attempt_chirho / "prompt-chirho.txt").write_text("rejected")
            write_chirho(
                attempt_chirho / "layout-rejected-chirho.json",
                {
                    "outcome_chirho": "layout_rejected",
                    "reason_chirho": "gutter",
                    "selection_chirho": selection_chirho,
                    "original_sha256_chirho": worker_chirho.digest_chirho(
                        attempt_chirho / "sheet-original-chirho.webp"
                    ),
                    "sheet_sha256_chirho": worker_chirho.digest_chirho(
                        attempt_chirho / "keyed-sheet-chirho.webp"
                    ),
                },
            )

        with patch.object(worker_chirho.time, "sleep"):
            self.assertEqual(
                worker_chirho.work_chirho(self.root_chirho, reject_then_succeed_chirho, True), 0
            )
        self.assertEqual(len(calls_chirho), 2)
        self.assertEqual(
            len(
                worker_chirho.load_chirho(self.root_chirho / worker_chirho.CATALOGUES_CHIRHO[1])[
                    "icons_chirho"
                ]
            ),
            16,
        )

    def test_recovery_no_duplicates_chirho(self):
        real_atomic_chirho = worker_chirho.atomic_chirho

        def fail_catalogue_chirho(path_chirho, value_chirho):
            if path_chirho == self.root_chirho / worker_chirho.CATALOGUES_CHIRHO[1]:
                raise OSError("synthetic crash at catalogue write")
            return real_atomic_chirho(path_chirho, value_chirho)

        with patch.object(worker_chirho, "atomic_chirho", fail_catalogue_chirho):
            self.assertEqual(
                worker_chirho.work_chirho(self.root_chirho, fake_generator_chirho, True), 0
            )
        queue_chirho = self.root_chirho / worker_chirho.QUEUE_CHIRHO
        attempt_chirho = next(queue_chirho.glob("attempt-*"))
        records_chirho = worker_chirho.load_chirho(attempt_chirho / "prepared-chirho.json")
        self.assertEqual(
            worker_chirho.work_chirho(self.root_chirho, fake_generator_chirho, True), 0
        )
        worker_chirho.install_chirho(self.root_chirho, attempt_chirho, records_chirho)
        self.assertEqual(
            len(
                worker_chirho.load_chirho(self.root_chirho / worker_chirho.CATALOGUES_CHIRHO[1])[
                    "icons_chirho"
                ]
            ),
            16,
        )

    def test_visual_rejection_retries_same_senses_with_correction_chirho(self):
        calls_chirho = []
        rejected_hashes_chirho = set()

        def reject_then_succeed_chirho(root_chirho, attempt_chirho):
            fake_generator_chirho(root_chirho, attempt_chirho)
            selection_chirho = worker_chirho.load_chirho(attempt_chirho / "selection-chirho.json")
            calls_chirho.append(selection_chirho)
            if len(calls_chirho) == 2:
                self.assertEqual(calls_chirho[0], selection_chirho)
                self.assertIn(
                    "question mark", (attempt_chirho / "retry-note-chirho.txt").read_text()
                )
                return
            staged_path_chirho = attempt_chirho / "staged-chirho.json"
            staged_chirho = worker_chirho.load_chirho(staged_path_chirho)
            rejected_hashes_chirho.update(
                row_chirho["icon_sha256_chirho"] for row_chirho in staged_chirho["cells_chirho"]
            )
            staged_path_chirho.unlink()
            write_chirho(
                attempt_chirho / "visual-rejected-chirho.json",
                {
                    "outcome_chirho": "visual_rejected",
                    "reason_chirho": "A question mark is forbidden text.",
                    "selection_chirho": selection_chirho,
                    "original_sha256_chirho": staged_chirho["original_sha256_chirho"],
                    "sheet_sha256_chirho": staged_chirho["sheet_sha256_chirho"],
                },
            )

        with patch.object(worker_chirho.time, "sleep"):
            self.assertEqual(
                worker_chirho.work_chirho(self.root_chirho, reject_then_succeed_chirho, True), 0
            )
        records_chirho = worker_chirho.load_chirho(
            self.root_chirho / worker_chirho.CATALOGUES_CHIRHO[1]
        )["icons_chirho"]
        self.assertEqual(len(calls_chirho), 2)
        self.assertEqual(len(records_chirho), 16)
        self.assertTrue(
            all(row_chirho["art_review_chirho"] == "pending" for row_chirho in records_chirho)
        )
        self.assertTrue(
            rejected_hashes_chirho.isdisjoint(
                row_chirho["sha256_chirho"] for row_chirho in records_chirho
            )
        )

    def test_unrelated_checkpoint_cannot_clear_a_pending_failure_chirho(self):
        self.assertEqual(
            worker_chirho.work_chirho(self.root_chirho, fake_generator_chirho, True), 0
        )
        progress_path_chirho = (
            self.root_chirho / worker_chirho.QUEUE_CHIRHO / "progress-chirho.json"
        )
        failure_chirho = {
            "state_chirho": "needs_reconciliation",
            "attempt_chirho": "unresolved-chirho",
        }
        write_chirho(progress_path_chirho, failure_chirho)
        with self.assertRaisesRegex(RuntimeError, "manual reconciliation"):
            worker_chirho.work_chirho(self.root_chirho, fake_generator_chirho, True)
        self.assertEqual(worker_chirho.load_chirho(progress_path_chirho), failure_chirho)

    def test_held_identity_is_exact_immutable_and_bounded_chirho(self):
        recovery_chirho = worker_chirho.RECOVERY_CHIRHO
        folder_chirho = self.root_chirho / "recovery-test-chirho"
        attempt_chirho = folder_chirho / "attempt-identity0001-chirho"
        attempt_chirho.mkdir(parents=True)
        first_chirho = recovery_chirho.hold_chirho(
            folder_chirho, attempt_chirho, "lexeme", [["G1", "ά"]], "retained"
        )
        self.assertEqual(
            recovery_chirho.hold_chirho(
                folder_chirho, attempt_chirho, "lexeme", [["G1", "ά"]], "repeat"
            ),
            first_chirho,
        )
        with self.assertRaisesRegex(ValueError, "cannot change"):
            recovery_chirho.hold_chirho(
                folder_chirho, attempt_chirho, "lexeme", [["G1", "ά"]], "normalized"
            )
        other_chirho = folder_chirho / "attempt-identity0002-chirho"
        other_chirho.mkdir()
        with (
            patch.object(recovery_chirho, "MAX_HOLDS_CHIRHO", 1),
            self.assertRaisesRegex(ValueError, "bounded limit"),
        ):
            recovery_chirho.hold_chirho(
                folder_chirho, other_chirho, "verse", ["John.1.1"], "bounded"
            )
        recovery_chirho.resolve_chirho(folder_chirho, attempt_chirho)
        self.assertEqual(recovery_chirho.count_chirho(folder_chirho), 0)
        self.assertEqual(
            worker_chirho.load_chirho(attempt_chirho / "failure-chirho.json"), first_chirho
        )

    def test_unidentified_dispatch_is_never_treated_as_finished_chirho(self):
        recovery_chirho = worker_chirho.RECOVERY_CHIRHO
        attempt_chirho = self.root_chirho / "request-test-chirho"
        recovery_chirho.request_chirho(attempt_chirho)
        self.assertTrue(recovery_chirho.active_chirho(attempt_chirho))
        recovery_chirho.request_chirho(attempt_chirho, finished_chirho=True)
        self.assertFalse(recovery_chirho.active_chirho(attempt_chirho))

    def test_layout_retry_limit_chirho(self):
        calls_chirho = []

        def reject_chirho(root_chirho, attempt_chirho):
            calls_chirho.append(attempt_chirho)
            write_chirho(
                attempt_chirho / "layout-rejected-chirho.json",
                {"reason_chirho": "synthetic layout failure"},
            )

        def checked_rejection_chirho(attempt_chirho):
            return worker_chirho.load_chirho(attempt_chirho / "candidates-chirho.json")[:16]

        with (
            patch.object(worker_chirho, "validate_rejection_chirho", checked_rejection_chirho),
            patch.object(worker_chirho.time, "sleep"),
        ):
            self.assertEqual(worker_chirho.work_chirho(self.root_chirho, reject_chirho, True), 0)
            self.assertEqual(len(calls_chirho), 4)
            self.assertEqual(worker_chirho.work_chirho(self.root_chirho, reject_chirho, True), 0)
            self.assertEqual(len(calls_chirho), 8)
            self.assertEqual(worker_chirho.work_chirho(self.root_chirho, reject_chirho, True), 0)
        self.assertEqual(len(calls_chirho), 8)
        selected_chirho = [checked_rejection_chirho(item_chirho) for item_chirho in calls_chirho]
        self.assertTrue(
            all(item_chirho == selected_chirho[0] for item_chirho in selected_chirho[:4])
        )
        self.assertTrue(
            all(item_chirho == selected_chirho[4] for item_chirho in selected_chirho[4:])
        )
        self.assertFalse(
            {worker_chirho.key_chirho(row_chirho) for row_chirho in selected_chirho[0]}
            & {worker_chirho.key_chirho(row_chirho) for row_chirho in selected_chirho[4]}
        )
        queue_chirho = self.root_chirho / worker_chirho.QUEUE_CHIRHO
        self.assertEqual(
            worker_chirho.load_chirho(queue_chirho / "progress-chirho.json")["state_chirho"],
            "proverbs_first_pass_with_holds",
        )
        holds_chirho = worker_chirho.RECOVERY_CHIRHO.read_chirho(queue_chirho)["holds_chirho"]
        self.assertEqual(len(holds_chirho), 2)
        self.assertTrue(
            all(
                row_chirho["checkpoint_chirho"]["rejections_chirho"] == 4
                for row_chirho in holds_chirho
            )
        )

    def test_reject_duplicate_context_chirho(self):
        queue_chirho = self.root_chirho / worker_chirho.QUEUE_CHIRHO
        attempt_chirho = queue_chirho / ("attempt-" + "a" * 32)
        attempt_chirho.mkdir(parents=True)
        write_chirho(
            attempt_chirho / "candidates-chirho.json",
            worker_chirho.candidates_chirho(self.root_chirho),
        )
        fake_generator_chirho(self.root_chirho, attempt_chirho)
        staged_chirho = worker_chirho.load_chirho(attempt_chirho / "staged-chirho.json")
        staged_chirho["cells_chirho"][1] = {**staged_chirho["cells_chirho"][0], "cell_chirho": 1}
        write_chirho(attempt_chirho / "staged-chirho.json", staged_chirho)
        with self.assertRaises(ValueError):
            worker_chirho.validate_chirho(self.root_chirho, attempt_chirho)

    def test_reject_keying_that_alters_visible_pixels_chirho(self):
        attempt_chirho = self.root_chirho / worker_chirho.QUEUE_CHIRHO / ("attempt-" + "b" * 32)
        attempt_chirho.mkdir(parents=True)
        write_chirho(
            attempt_chirho / "candidates-chirho.json",
            worker_chirho.candidates_chirho(self.root_chirho),
        )
        fake_generator_chirho(self.root_chirho, attempt_chirho)
        keyed_chirho = attempt_chirho / "keyed-sheet-chirho.webp"
        with Image.open(keyed_chirho) as source_chirho:
            image_chirho = source_chirho.convert("RGBA")
        image_chirho.putpixel((80, 80), (200, 80, 120, 255))
        image_chirho.save(keyed_chirho, lossless=True, exact=True)
        staged_chirho = worker_chirho.load_chirho(attempt_chirho / "staged-chirho.json")
        staged_chirho["sheet_sha256_chirho"] = worker_chirho.digest_chirho(keyed_chirho)
        write_chirho(attempt_chirho / "staged-chirho.json", staged_chirho)
        with self.assertRaisesRegex(ValueError, "Keying altered"):
            worker_chirho.validate_chirho(self.root_chirho, attempt_chirho)


if __name__ == "__main__":
    unittest.main()
