# For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life. — John 3:16 (KJV)
"""An unresolved context must not acquire an icon or block unrelated reviewed work."""

import fcntl as fcntl_chirho
import tempfile as tempfile_chirho
import unittest as unittest_chirho
from pathlib import Path
from unittest.mock import patch as patch_chirho

from test_icon_worker_chirho import (
    fake_generator_chirho,
    fixture_chirho,
    worker_chirho,
    write_chirho,
)

DEFERRALS_CHIRHO = Path("data-chirho/reader-chirho/icon-deferrals-chirho.json")


class IconReviewsTestChirho(unittest_chirho.TestCase):
    def setUp(self_chirho):
        self_chirho.temp_chirho = tempfile_chirho.TemporaryDirectory()
        self_chirho.root_chirho = Path(self_chirho.temp_chirho.name)
        fixture_chirho(self_chirho.root_chirho)
        # The registry uses unique pinned occurrences, unlike the synthetic deduplication fixture.
        path_chirho = self_chirho.root_chirho / worker_chirho.INVENTORY_CHIRHO
        inventory_chirho = worker_chirho.load_chirho(path_chirho)
        for lemma_chirho in inventory_chirho["lemmas_chirho"]:
            lemma_chirho["occurrences_chirho"] = lemma_chirho["occurrences_chirho"][:1]
        write_chirho(path_chirho, inventory_chirho)

    def tearDown(self_chirho):
        self_chirho.temp_chirho.cleanup()

    def defer_chirho(self_chirho, selected_chirho):
        write_chirho(
            self_chirho.root_chirho / DEFERRALS_CHIRHO,
            {
                "schema_version_chirho": 1,
                "book_id_chirho": "Prov",
                "deferrals_chirho": [
                    {
                        **row_chirho,
                        "review_status_chirho": "unresolved",
                        "reason_chirho": "Synthetic disagreement between pinned sources.",
                        "evidence_refs_chirho": [
                            "oshb-prov-chirho",
                            "gbt-english-prov-chirho",
                            "lexical-index-chirho",
                        ],
                    }
                    for row_chirho in selected_chirho
                ],
            },
        )

    def attempt_chirho(self_chirho):
        attempt_chirho = (
            self_chirho.root_chirho
            / worker_chirho.QUEUE_CHIRHO
            / ("attempt-" + "c" * 32 + "-chirho")
        )
        attempt_chirho.mkdir(parents=True)
        write_chirho(
            attempt_chirho / "candidates-chirho.json",
            worker_chirho.candidates_chirho(self_chirho.root_chirho),
        )
        fake_generator_chirho(self_chirho.root_chirho, attempt_chirho)
        return attempt_chirho

    def defer_lemmas_chirho(self_chirho, lemmas_chirho=None):
        inventory_chirho = worker_chirho.load_chirho(
            self_chirho.root_chirho / worker_chirho.INVENTORY_CHIRHO
        )
        rows_chirho = []
        for lemma_chirho in lemmas_chirho or inventory_chirho["lemmas_chirho"]:
            example_chirho = lemma_chirho["occurrences_chirho"][0]
            rows_chirho.append(
                {
                    "lemma_id_chirho": lemma_chirho["lemma_id_chirho"],
                    "lemma_augment_chirho": lemma_chirho.get("lemma_augment_chirho"),
                    "lexical_form_chirho": lemma_chirho["lexical_form_chirho"],
                    "example_chirho": {
                        key_chirho: example_chirho[key_chirho]
                        for key_chirho in ("verse_id_chirho", "token_id_chirho", "gloss_chirho")
                    },
                    "review_status_chirho": "deferred_for_initial_pass",
                    "reason_chirho": "Synthetic initial-pass picture preparation backlog.",
                    "reviewed_by_chirho": "gpt_chirho",
                    "evidence_refs_chirho": [
                        "oshb-prov-chirho",
                        "gbt-english-prov-chirho",
                        "lexical-index-chirho",
                    ],
                }
            )
        document_chirho = {
            "schema_version_chirho": 1,
            "book_id_chirho": "Prov",
            "scope_chirho": "initial_icon_pass",
            "inventory_sha256_chirho": worker_chirho.digest_chirho(
                self_chirho.root_chirho / worker_chirho.INVENTORY_CHIRHO
            ),
            "lemma_deferrals_chirho": rows_chirho,
        }
        write_chirho(
            self_chirho.root_chirho
            / "data-chirho/reader-chirho/icon-first-pass-deferrals-chirho.json",
            document_chirho,
        )
        return document_chirho

    def test_first_pass_backlog_is_scoped_and_preserves_sources_chirho(self_chirho):
        path_chirho = self_chirho.root_chirho / worker_chirho.INVENTORY_CHIRHO
        original_chirho = path_chirho.read_bytes()
        inventory_chirho = worker_chirho.load_chirho(path_chirho)
        self_chirho.defer_lemmas_chirho(inventory_chirho["lemmas_chirho"][:1])
        available_chirho = worker_chirho.candidates_chirho(self_chirho.root_chirho)
        self_chirho.assertEqual(len(available_chirho), 31)
        self_chirho.assertNotIn(
            "H1", [row_chirho["lemma_id_chirho"] for row_chirho in available_chirho]
        )
        self_chirho.assertEqual(path_chirho.read_bytes(), original_chirho)
        self_chirho.assertEqual(
            worker_chirho.load_chirho(self_chirho.root_chirho / worker_chirho.CATALOGUES_CHIRHO[1])[
                "icons_chirho"
            ],
            [],
        )

    def test_first_pass_homographs_remain_distinct_chirho(self_chirho):
        path_chirho = self_chirho.root_chirho / worker_chirho.INVENTORY_CHIRHO
        inventory_chirho = worker_chirho.load_chirho(path_chirho)
        chapter_path_chirho = (
            self_chirho.root_chirho / "static/content-chirho/proverbs-chirho/chapter-01-chirho.json"
        )
        chapter_chirho = worker_chirho.load_chirho(chapter_path_chirho)
        for index_chirho, augment_chirho in enumerate(("a", "b")):
            inventory_chirho["lemmas_chirho"][index_chirho].update(
                lemma_id_chirho="H1", lemma_augment_chirho=augment_chirho
            )
            chapter_chirho["verses_chirho"][0]["tokens_chirho"][index_chirho].update(
                lemma_id_chirho="H1", lemma_augment_chirho=augment_chirho
            )
        write_chirho(path_chirho, inventory_chirho)
        write_chirho(chapter_path_chirho, chapter_chirho)
        self_chirho.defer_lemmas_chirho(inventory_chirho["lemmas_chirho"][:1])
        keys_chirho = {
            worker_chirho.key_chirho(row_chirho)
            for row_chirho in worker_chirho.candidates_chirho(self_chirho.root_chirho)
        }
        self_chirho.assertNotIn(("H1", "a"), keys_chirho)
        self_chirho.assertIn(("H1", "b"), keys_chirho)

    def test_exact_variant_holds_match_ketiv_and_qere_without_holding_other_words_chirho(
        self_chirho,
    ):
        path_chirho = self_chirho.root_chirho / worker_chirho.INVENTORY_CHIRHO
        inventory_chirho = worker_chirho.load_chirho(path_chirho)
        held_chirho = []
        for index_chirho, reading_chirho in enumerate(("ketiv", "qere")):
            lemma_chirho = inventory_chirho["lemmas_chirho"][index_chirho]
            occurrence_chirho = lemma_chirho["occurrences_chirho"][0]
            occurrence_chirho["reading_chirho"] = reading_chirho
            held_chirho.append(
                {
                    **occurrence_chirho,
                    "lemma_id_chirho": lemma_chirho["lemma_id_chirho"],
                    "lemma_augment_chirho": None,
                }
            )
        write_chirho(path_chirho, inventory_chirho)
        self_chirho.defer_chirho(held_chirho)
        available_chirho = worker_chirho.candidates_chirho(self_chirho.root_chirho, True)
        self_chirho.assertEqual(len(available_chirho), 30)
        self_chirho.assertFalse(
            {"H1", "H2"}.intersection(
                row_chirho["lemma_id_chirho"] for row_chirho in available_chirho
            )
        )
        held_chirho[0]["gloss_chirho"] = "changed source wording"
        self_chirho.defer_chirho(held_chirho)
        with self_chirho.assertRaisesRegex(ValueError, "pinned occurrence"):
            worker_chirho.candidates_chirho(self_chirho.root_chirho, True)

    def test_lemma_first_reconsiders_preparation_but_keeps_exact_holds_chirho(self_chirho):
        inventory_chirho = worker_chirho.load_chirho(
            self_chirho.root_chirho / worker_chirho.INVENTORY_CHIRHO
        )
        self_chirho.defer_lemmas_chirho(inventory_chirho["lemmas_chirho"][:2])
        first_chirho = inventory_chirho["lemmas_chirho"][0]
        self_chirho.defer_chirho(
            [
                {
                    **first_chirho["occurrences_chirho"][0],
                    "lemma_id_chirho": "H1",
                    "lemma_augment_chirho": None,
                }
            ]
        )
        self_chirho.assertEqual(len(worker_chirho.candidates_chirho(self_chirho.root_chirho)), 30)
        available_chirho = worker_chirho.candidates_chirho(self_chirho.root_chirho, True)
        self_chirho.assertEqual(len(available_chirho), 31)
        self_chirho.assertNotIn(
            "H1", [row_chirho["lemma_id_chirho"] for row_chirho in available_chirho]
        )
        self_chirho.assertIn(
            "H2", [row_chirho["lemma_id_chirho"] for row_chirho in available_chirho]
        )
        with patch_chirho(
            "refresh_sharded_media_chirho.lemma_library_chirho",
            return_value=(
                {("H3", None, None): {"lemma_id_chirho": "H3", "lemma_augment_chirho": None}},
                {},
            ),
        ):
            available_chirho = worker_chirho.candidates_chirho(self_chirho.root_chirho, True)
            self_chirho.assertEqual(len(available_chirho), 30)
            self_chirho.assertNotIn(
                "H3", [row_chirho["lemma_id_chirho"] for row_chirho in available_chirho]
            )

    def test_lemma_first_includes_exact_ketiv_and_qere_identities_chirho(self_chirho):
        path_chirho = self_chirho.root_chirho / worker_chirho.INVENTORY_CHIRHO
        inventory_chirho = worker_chirho.load_chirho(path_chirho)
        for index_chirho, reading_chirho in enumerate(("ketiv", "qere")):
            inventory_chirho["lemmas_chirho"][index_chirho]["occurrences_chirho"][0][
                "reading_chirho"
            ] = reading_chirho
        chapter_path_chirho = (
            self_chirho.root_chirho / "static/content-chirho/proverbs-chirho/chapter-01-chirho.json"
        )
        chapter_chirho = worker_chirho.load_chirho(chapter_path_chirho)
        tokens_chirho = chapter_chirho["verses_chirho"][0]["tokens_chirho"]
        tokens_chirho[0]["qere_chirho"] = [tokens_chirho.pop(1)]
        write_chirho(path_chirho, inventory_chirho)
        write_chirho(chapter_path_chirho, chapter_chirho)
        available_chirho = worker_chirho.candidates_chirho(self_chirho.root_chirho, True)
        identities_chirho = {
            row_chirho["token_id_chirho"]: row_chirho["reading_chirho"]
            for row_chirho in available_chirho
        }
        self_chirho.assertEqual(identities_chirho["token-0"], "ketiv")
        self_chirho.assertEqual(identities_chirho["token-1"], "qere")
        self_chirho.assertEqual(len(identities_chirho), 32)

    def test_lemma_first_cannot_bypass_old_or_new_unresolved_attempts_chirho(self_chirho):
        original_chirho = self_chirho.root_chirho / worker_chirho.QUEUE_CHIRHO
        original_chirho.mkdir(parents=True)

        def no_generation_chirho(*_arguments_chirho):
            raise AssertionError("Held attempts must not generate again")

        for state_chirho in (
            "generating",
            "needs_reconciliation",
            "stopped_layout",
            "retrying_layout",
        ):
            write_chirho(
                original_chirho / "progress-chirho.json",
                {"state_chirho": state_chirho, "rejections_chirho": 4},
            )
            with self_chirho.assertRaisesRegex(RuntimeError, "Original icon pass"):
                worker_chirho.work_chirho(self_chirho.root_chirho, no_generation_chirho, True, True)
        write_chirho(
            original_chirho / "progress-chirho.json",
            {"state_chirho": "proverbs_first_pass_complete"},
        )
        with (original_chirho / "worker.lock").open("a") as lock_chirho:
            fcntl_chirho.flock(lock_chirho, fcntl_chirho.LOCK_EX | fcntl_chirho.LOCK_NB)
            with self_chirho.assertRaisesRegex(RuntimeError, "catalogue lock"):
                worker_chirho.work_chirho(self_chirho.root_chirho, no_generation_chirho, True, True)
        for state_chirho in ("generating", "needs_reconciliation", "stopped_layout"):
            write_chirho(
                self_chirho.root_chirho / worker_chirho.LEMMA_QUEUE_CHIRHO / "progress-chirho.json",
                {"state_chirho": state_chirho, "rejections_chirho": 4},
            )
            with self_chirho.assertRaises(RuntimeError):
                worker_chirho.work_chirho(self_chirho.root_chirho, no_generation_chirho, True, True)

    def test_lemma_first_uses_separate_checkpoints_and_same_verified_installer_chirho(self_chirho):
        original_chirho = (
            self_chirho.root_chirho / worker_chirho.QUEUE_CHIRHO / "progress-chirho.json"
        )
        write_chirho(original_chirho, {"state_chirho": "proverbs_first_pass_complete"})
        original_bytes_chirho = original_chirho.read_bytes()
        self_chirho.assertEqual(
            worker_chirho.work_chirho(self_chirho.root_chirho, fake_generator_chirho, True, True), 0
        )
        progress_chirho = worker_chirho.load_chirho(
            self_chirho.root_chirho / worker_chirho.LEMMA_QUEUE_CHIRHO / "progress-chirho.json"
        )
        self_chirho.assertEqual(progress_chirho["state_chirho"], "completed")
        self_chirho.assertEqual(original_chirho.read_bytes(), original_bytes_chirho)
        attempt_chirho = (
            self_chirho.root_chirho
            / worker_chirho.LEMMA_QUEUE_CHIRHO
            / progress_chirho["attempt_chirho"]
        )
        self_chirho.assertTrue((attempt_chirho / "lemma-first-policy-chirho.json").exists())
        self_chirho.assertIn(
            "LATEST OWNER DIRECTION",
            worker_chirho.prompt_chirho(self_chirho.root_chirho, attempt_chirho),
        )
        catalogue_chirho = worker_chirho.load_chirho(
            self_chirho.root_chirho / worker_chirho.CATALOGUES_CHIRHO[1]
        )
        self_chirho.assertEqual(len(catalogue_chirho["icons_chirho"]), 16)
        self_chirho.assertTrue(
            all(
                row_chirho["art_review_chirho"] == "pending"
                for row_chirho in catalogue_chirho["icons_chirho"]
            )
        )

    def test_first_pass_review_drift_refuses_before_generation_chirho(self_chirho):
        document_chirho = self_chirho.defer_lemmas_chirho()
        document_chirho["lemma_deferrals_chirho"][0]["example_chirho"]["gloss_chirho"] = (
            "unreviewed meaning"
        )
        write_chirho(
            self_chirho.root_chirho
            / "data-chirho/reader-chirho/icon-first-pass-deferrals-chirho.json",
            document_chirho,
        )

        def no_generation_chirho(*_arguments_chirho):
            raise AssertionError("A drifted review cannot generate")

        with self_chirho.assertRaises(ValueError):
            worker_chirho.work_chirho(self_chirho.root_chirho, no_generation_chirho, True)
        self_chirho.defer_lemmas_chirho()
        path_chirho = self_chirho.root_chirho / worker_chirho.INVENTORY_CHIRHO
        inventory_chirho = worker_chirho.load_chirho(path_chirho)
        inventory_chirho["changed_revision_chirho"] = True
        write_chirho(path_chirho, inventory_chirho)
        with self_chirho.assertRaises(ValueError):
            worker_chirho.work_chirho(self_chirho.root_chirho, no_generation_chirho, True)

    def test_initial_pass_completion_keeps_both_backlogs_explicit_chirho(self_chirho):
        self_chirho.defer_lemmas_chirho()

        def no_generation_chirho(*_arguments_chirho):
            raise AssertionError("A reviewed empty initial queue must not request a picture")

        self_chirho.assertEqual(
            worker_chirho.work_chirho(self_chirho.root_chirho, no_generation_chirho, True), 0
        )
        path_chirho = self_chirho.root_chirho / worker_chirho.QUEUE_CHIRHO / "progress-chirho.json"
        progress_chirho = worker_chirho.load_chirho(path_chirho)
        self_chirho.assertEqual(
            progress_chirho["state_chirho"], "proverbs_first_pass_with_deferrals"
        )
        self_chirho.assertEqual(progress_chirho["deferred_lemmas_chirho"], 32)
        self_chirho.assertEqual(progress_chirho["deferred_occurrences_chirho"], 0)
        from test_ordered_scenes_chirho import WORKER_CHIRHO as ordered_chirho

        self_chirho.assertTrue(
            ordered_chirho.proverbs_icons_complete_chirho(self_chirho.root_chirho)[0]
        )
        progress_chirho["deferred_lemmas_chirho"] = 0
        write_chirho(path_chirho, progress_chirho)
        with self_chirho.assertRaises(ValueError):
            ordered_chirho.proverbs_icons_complete_chirho(self_chirho.root_chirho)

    def test_good_cells_install_without_the_deferred_cell_chirho(self_chirho):
        attempt_chirho = self_chirho.attempt_chirho()
        selected_chirho = worker_chirho.load_chirho(attempt_chirho / "selection-chirho.json")
        self_chirho.defer_chirho(selected_chirho[:1])
        staged_chirho = worker_chirho.load_chirho(attempt_chirho / "staged-chirho.json")
        staged_chirho["cells_chirho"][0]["sense_review_chirho"] = "deferred"
        write_chirho(attempt_chirho / "staged-chirho.json", staged_chirho)
        records_chirho = worker_chirho.validate_chirho(self_chirho.root_chirho, attempt_chirho)
        self_chirho.assertEqual(len(records_chirho), 15)
        self_chirho.assertNotIn(
            selected_chirho[0]["token_id_chirho"],
            [row_chirho["token_id_chirho"] for row_chirho in records_chirho],
        )
        worker_chirho.install_chirho(self_chirho.root_chirho, attempt_chirho, records_chirho)
        for record_chirho in records_chirho:
            source_chirho = (
                self_chirho.root_chirho / "static" / record_chirho["asset_path_chirho"].lstrip("/")
            )
            self_chirho.assertEqual(
                worker_chirho.digest_chirho(source_chirho), record_chirho["sha256_chirho"]
            )
            self_chirho.assertEqual(record_chirho["art_review_chirho"], "pending")
        self_chirho.assertEqual(len(worker_chirho.candidates_chirho(self_chirho.root_chirho)), 16)

    def test_unregistered_or_unresolved_review_cannot_be_attached_chirho(self_chirho):
        attempt_chirho = self_chirho.attempt_chirho()
        staged_chirho = worker_chirho.load_chirho(attempt_chirho / "staged-chirho.json")
        staged_chirho["cells_chirho"][0]["sense_review_chirho"] = "deferred"
        write_chirho(attempt_chirho / "staged-chirho.json", staged_chirho)
        with self_chirho.assertRaisesRegex(ValueError, "reviewed exact-context hold"):
            worker_chirho.validate_chirho(self_chirho.root_chirho, attempt_chirho)
        self_chirho.defer_chirho(
            worker_chirho.load_chirho(attempt_chirho / "selection-chirho.json")[:1]
        )
        staged_chirho["cells_chirho"][0]["sense_review_chirho"] = "agent_reviewed"
        write_chirho(attempt_chirho / "staged-chirho.json", staged_chirho)
        with self_chirho.assertRaisesRegex(ValueError, "Unresolved context"):
            worker_chirho.validate_chirho(self_chirho.root_chirho, attempt_chirho)

    def test_partial_checkpoint_recovers_without_regeneration_chirho(self_chirho):
        attempt_chirho = self_chirho.attempt_chirho()
        selected_chirho = worker_chirho.load_chirho(attempt_chirho / "selection-chirho.json")
        self_chirho.defer_chirho(selected_chirho[:1])
        staged_chirho = worker_chirho.load_chirho(attempt_chirho / "staged-chirho.json")
        staged_chirho["cells_chirho"][0]["sense_review_chirho"] = "deferred"
        write_chirho(attempt_chirho / "staged-chirho.json", staged_chirho)
        records_chirho = worker_chirho.validate_chirho(self_chirho.root_chirho, attempt_chirho)
        write_chirho(attempt_chirho / "prepared-chirho.json", records_chirho)
        write_chirho(
            self_chirho.root_chirho / worker_chirho.QUEUE_CHIRHO / "progress-chirho.json",
            {"state_chirho": "needs_reconciliation", "attempt_chirho": attempt_chirho.name},
        )
        original_chirho = worker_chirho.atomic_chirho

        def fail_catalogue_chirho(path_chirho, value_chirho):
            if path_chirho == self_chirho.root_chirho / worker_chirho.CATALOGUES_CHIRHO[1]:
                raise OSError("synthetic interruption after asset install")
            return original_chirho(path_chirho, value_chirho)

        with (
            patch_chirho.object(worker_chirho, "atomic_chirho", fail_catalogue_chirho),
            self_chirho.assertRaises(OSError),
        ):
            worker_chirho.install_chirho(self_chirho.root_chirho, attempt_chirho, records_chirho)

        def no_generation_chirho(*_arguments_chirho):
            raise AssertionError("Recovery must reuse the prepared sheet")

        self_chirho.assertEqual(
            worker_chirho.work_chirho(self_chirho.root_chirho, no_generation_chirho, True), 0
        )
        catalogue_chirho = worker_chirho.load_chirho(
            self_chirho.root_chirho / worker_chirho.CATALOGUES_CHIRHO[1]
        )["icons_chirho"]
        self_chirho.assertEqual(len(catalogue_chirho), 15)
        self_chirho.assertNotIn(
            selected_chirho[0]["token_id_chirho"],
            [row_chirho["token_id_chirho"] for row_chirho in catalogue_chirho],
        )

    def test_drifted_deferral_refuses_before_generation_chirho(self_chirho):
        selected_chirho = worker_chirho.candidates_chirho(self_chirho.root_chirho)[:1]
        self_chirho.defer_chirho([{**selected_chirho[0], "gloss_chirho": "wrong gloss"}])
        with self_chirho.assertRaisesRegex(ValueError, "pinned occurrence inventory"):
            worker_chirho.candidates_chirho(self_chirho.root_chirho)

    def test_production_pass_does_not_claim_unresolved_cases_complete_chirho(self_chirho):
        self_chirho.defer_chirho(worker_chirho.candidates_chirho(self_chirho.root_chirho))

        def forbidden_chirho(*arguments_chirho):
            raise AssertionError("No image call is appropriate for a deferred-only queue")

        self_chirho.assertEqual(
            worker_chirho.work_chirho(self_chirho.root_chirho, forbidden_chirho, True), 0
        )
        progress_chirho = worker_chirho.load_chirho(
            self_chirho.root_chirho / worker_chirho.QUEUE_CHIRHO / "progress-chirho.json"
        )
        self_chirho.assertEqual(
            progress_chirho["state_chirho"], "proverbs_first_pass_with_deferrals"
        )
        self_chirho.assertEqual(progress_chirho["deferred_occurrences_chirho"], 32)
        from test_ordered_scenes_chirho import WORKER_CHIRHO as ordered_chirho

        passed_chirho, proof_chirho = ordered_chirho.proverbs_icons_complete_chirho(
            self_chirho.root_chirho
        )
        self_chirho.assertTrue(passed_chirho)
        self_chirho.assertEqual(proof_chirho["deferred_occurrences_chirho"], 32)
        progress_chirho["deferred_occurrences_chirho"] = 0
        write_chirho(
            self_chirho.root_chirho / worker_chirho.QUEUE_CHIRHO / "progress-chirho.json",
            progress_chirho,
        )
        with self_chirho.assertRaisesRegex(ValueError, "unresolved review counts"):
            ordered_chirho.proverbs_icons_complete_chirho(self_chirho.root_chirho)


if __name__ == "__main__":
    unittest_chirho.main()
