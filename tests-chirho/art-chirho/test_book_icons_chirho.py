# For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life. — John 3:16 (KJV)
"""Tests for the read-only John source preflight, not for generation or completion."""

import importlib.util
import json
import tempfile
import unittest
from pathlib import Path
from unittest import mock

from PIL import Image, ImageDraw

ROOT_CHIRHO = Path(__file__).resolve().parents[2]
SPEC_CHIRHO = importlib.util.spec_from_file_location(
    "book_icons_chirho", ROOT_CHIRHO / "scripts-chirho/art-chirho/book_icons_chirho.py"
)
MODULE_CHIRHO = importlib.util.module_from_spec(SPEC_CHIRHO)
SPEC_CHIRHO.loader.exec_module(MODULE_CHIRHO)


class SourceTestsChirho(unittest.TestCase):
    def setUp(self):
        self.temp_chirho = tempfile.TemporaryDirectory()
        self.addCleanup(self.temp_chirho.cleanup)
        self.root_chirho = Path(self.temp_chirho.name)
        style_chirho = self.root_chirho / "static" / MODULE_CHIRHO.STYLE_CHIRHO.lstrip("/")
        style_chirho.parent.mkdir(parents=True)
        style_chirho.write_bytes(b"fake style")
        self.corpus_chirho = self.root_chirho / "data-chirho/corpus-chirho"
        self.folder_chirho = self.corpus_chirho / "john-chirho"
        self.folder_chirho.mkdir(parents=True)
        for relative_chirho in (
            "sources-chirho/nestle1904-chirho/morph/Nestle1904.csv",
            "sources-chirho/nestle1904-chirho/morph/parsing.txt",
            "sources-chirho/nestle1904-chirho/glosses/berean-interlinear-glosses.xml",
            "sources-chirho/acquisition-manifest-chirho.json",
        ):
            path_chirho = self.corpus_chirho / relative_chirho
            path_chirho.parent.mkdir(parents=True, exist_ok=True)
            path_chirho.write_bytes(b"fake pinned source")
        manifest_chirho = (
            self.root_chirho / "data-chirho/sources-chirho/acquisition-manifest-chirho.json"
        )
        manifest_chirho.parent.mkdir(parents=True, exist_ok=True)
        manifest_chirho.write_bytes(b"fake manifest")
        entries_chirho = []
        for index_chirho, form_chirho in enumerate(("ἀγγέλλω", "ἀπαγγέλλω"), 1):
            occurrence_chirho = {
                "verse_id_chirho": "John.1.1",
                "token_id_chirho": f"John.1.1!{index_chirho}",
                "berean_gloss_chirho": "say",
                "source_form_chirho": form_chirho,
            }
            entries_chirho.append(
                {
                    "lemma_id_chirho": "G518",
                    "lexical_form_chirho": form_chirho,
                    "occurrence_count_chirho": 1,
                    "occurrences_chirho": [occurrence_chirho],
                }
            )
        self.inventory_chirho = {
            "book_id_chirho": "John",
            "lemma_count_chirho": 2,
            "occurrence_count_chirho": 2,
            "lemmas_chirho": entries_chirho,
        }
        self.inventory_path_chirho = self.corpus_chirho / "john-lemma-inventory-chirho.json"
        self.write_chirho(self.inventory_path_chirho, self.inventory_chirho)
        for chapter_chirho in range(1, 22):
            tokens_chirho = (
                [
                    {
                        "id_chirho": row_chirho["occurrences_chirho"][0]["token_id_chirho"],
                        "lemma_id_chirho": row_chirho["lemma_id_chirho"],
                        "lexical_form_chirho": row_chirho["lexical_form_chirho"],
                        "gloss_chirho": "say",
                        "text_chirho": row_chirho["lexical_form_chirho"],
                    }
                    for row_chirho in entries_chirho
                ]
                if chapter_chirho == 1
                else []
            )
            self.write_chirho(
                self.folder_chirho / f"chapter-{chapter_chirho:02d}-chirho.json",
                {
                    "book_id_chirho": "John",
                    "chapter_chirho": chapter_chirho,
                    "verses_chirho": [{"id_chirho": "John.1.1", "tokens_chirho": tokens_chirho}]
                    if tokens_chirho
                    else [],
                },
            )

    def write_chirho(self, path_chirho, data_chirho):
        path_chirho.write_text(json.dumps(data_chirho), encoding="utf-8")

    def test_hebrew_ketiv_and_qere_are_distinct_occurrences(self):
        folder_chirho = self.root_chirho / "static/content-chirho/genesis-chirho"
        folder_chirho.mkdir(parents=True)
        ketiv_chirho = {
            "id_chirho": "k",
            "lemma_id_chirho": "H1",
            "lemma_augment_chirho": None,
            "gloss_chirho": None,
        }
        qere_chirho = {
            "id_chirho": "q",
            "lemma_id_chirho": "H2",
            "lemma_augment_chirho": "a",
            "gloss_chirho": None,
        }
        ketiv_chirho["qere_chirho"] = [qere_chirho]
        entries_chirho = []
        for token_chirho, role_chirho in ((ketiv_chirho, "ketiv"), (qere_chirho, "qere")):
            occurrence_chirho = {
                "verse_id_chirho": "Gen.1.1",
                "token_id_chirho": token_chirho["id_chirho"],
                "reading_chirho": role_chirho,
                "gloss_chirho": None,
            }
            entries_chirho.append(
                {
                    "lemma_id_chirho": token_chirho["lemma_id_chirho"],
                    "lemma_augment_chirho": token_chirho["lemma_augment_chirho"],
                    "occurrence_count_chirho": 1,
                    "occurrences_chirho": [occurrence_chirho],
                }
            )
        inventory_chirho = {
            "book_id_chirho": "Gen",
            "lemma_count_chirho": 2,
            "occurrence_count_chirho": 2,
            "lemmas_chirho": entries_chirho,
        }
        path_chirho = self.corpus_chirho / "genesis-lemma-inventory-chirho.json"
        self.write_chirho(path_chirho, inventory_chirho)
        for number_chirho in range(1, 51):
            self.write_chirho(
                folder_chirho / f"chapter-{number_chirho:02d}-chirho.json",
                {
                    "book_id_chirho": "Gen",
                    "chapter_chirho": number_chirho,
                    "verses_chirho": [{"id_chirho": "Gen.1.1", "tokens_chirho": [ketiv_chirho]}]
                    if number_chirho == 1
                    else [],
                },
            )
        self.assertEqual(len(MODULE_CHIRHO.genesis_candidates_chirho(self.root_chirho)), 2)
        entries_chirho[1]["occurrences_chirho"][0]["reading_chirho"] = "main"
        self.write_chirho(path_chirho, inventory_chirho)
        with self.assertRaises(ValueError):
            MODULE_CHIRHO.genesis_candidates_chirho(self.root_chirho)

    def test_qere_projection_preserves_exact_reading(self):
        occurrence_chirho = {
            "verse_id_chirho": "Gen.1.1",
            "token_id_chirho": "q1",
            "reading_chirho": "qere",
            "gloss_chirho": None,
        }
        key_chirho = ["Gen", "H2", None]
        candidate_chirho = {
            "lexeme_key_chirho": key_chirho,
            "occurrences_chirho": [occurrence_chirho],
        }
        row_chirho = {
            "lexeme_key_chirho": key_chirho,
            "occurrence_chirho": occurrence_chirho,
            "cell_chirho": 0,
            "alternate_chirho": False,
            "alternate_of_cell_chirho": None,
            "sense_id_chirho": "sense-test-chirho",
            "contextual_meaning_chirho": "reviewed sense",
            "alt_chirho": "subject",
            "sense_review_chirho": "agent_reviewed",
            "art_review_chirho": "pending",
            "evidence_refs_chirho": MODULE_CHIRHO.GENESIS_EVIDENCE_CHIRHO,
            "sha256_chirho": "a" * 64,
            "asset_path_chirho": "/assets-chirho/icons-chirho/genesis-worker-v1-chirho/attempt-"
            + "a" * 32
            + "-chirho/0000-chirho/cell-00-chirho.webp",
        }
        icon_chirho = MODULE_CHIRHO.media_document_chirho("Gen", [row_chirho], [candidate_chirho])[
            "icons_chirho"
        ][0]
        self.assertEqual(
            (
                icon_chirho["lesson_id_chirho"],
                icon_chirho["token_id_chirho"],
                icon_chirho["reading_chirho"],
            ),
            ("Gen.1.1", "q1", "qere"),
        )
        prefix_key_chirho = ["Gen", "oshb:b", None]
        prefix_candidate_chirho = {
            "lexeme_key_chirho": prefix_key_chirho,
            "occurrences_chirho": [occurrence_chirho],
        }
        prefix_row_chirho = {**row_chirho, "lexeme_key_chirho": prefix_key_chirho}
        prefix_icon_chirho = MODULE_CHIRHO.media_document_chirho(
            "Gen", [prefix_row_chirho], [prefix_candidate_chirho]
        )["icons_chirho"][0]
        self.assertEqual(prefix_icon_chirho["lemma_id_chirho"], "oshb:b")
        wrong_chirho = dict(
            row_chirho, occurrence_chirho={**occurrence_chirho, "token_id_chirho": "different"}
        )
        with self.assertRaises(ValueError):
            MODULE_CHIRHO.media_document_chirho("Gen", [wrong_chirho], [candidate_chirho])

    def test_distinct_lexical_forms_are_not_collapsed(self):
        result_chirho = MODULE_CHIRHO.john_candidates_chirho(self.root_chirho)
        self.assertEqual(
            len({tuple(row_chirho["lexeme_key_chirho"]) for row_chirho in result_chirho}), 2
        )

    def test_wrong_gloss_is_refused(self):
        self.inventory_chirho["lemmas_chirho"][0]["occurrences_chirho"][0][
            "berean_gloss_chirho"
        ] = "different"
        self.write_chirho(self.inventory_path_chirho, self.inventory_chirho)
        with self.assertRaises(ValueError):
            MODULE_CHIRHO.john_candidates_chirho(self.root_chirho)

    def test_missing_chapter_is_source_wait(self):
        (self.folder_chirho / "chapter-21-chirho.json").unlink()
        with self.assertRaises(MODULE_CHIRHO.SourceWaitChirho):
            MODULE_CHIRHO.john_candidates_chirho(self.root_chirho)

    def test_incomplete_inventory_is_refused(self):
        self.inventory_chirho["lemmas_chirho"].pop()
        self.inventory_chirho["lemma_count_chirho"] = 1
        self.inventory_chirho["occurrence_count_chirho"] = 1
        self.write_chirho(self.inventory_path_chirho, self.inventory_chirho)
        with self.assertRaises(ValueError):
            MODULE_CHIRHO.john_candidates_chirho(self.root_chirho)


class WorkerTestsChirho(SourceTestsChirho):
    def setUp(self):
        super().setUp()
        patch_chirho = mock.patch.object(
            MODULE_CHIRHO, "tool_attestation_chirho", return_value={"fake_chirho": True}
        )
        patch_chirho.start()
        self.addCleanup(patch_chirho.stop)

    def candidates_chirho(self, root_chirho, book_chirho):
        return MODULE_CHIRHO.john_candidates_chirho(root_chirho)

    def gate_chirho(self, root_chirho, book_chirho):
        return True

    def generator_chirho(self, root_chirho, attempt_chirho, bad_chirho=False):
        plan_chirho = json.loads((attempt_chirho / "plan-chirho.json").read_text())
        reviews_chirho = []
        image_chirho = Image.new("RGBA", (1024, 1024), (0, 0, 0, 0))
        draw_chirho = ImageDraw.Draw(image_chirho)
        seed_chirho = int(attempt_chirho.name[8:12], 16)
        for index_chirho, cell_chirho in enumerate(plan_chirho["cells_chirho"]):
            source_index_chirho = cell_chirho.get("alternate_of_cell_chirho", index_chirho)
            row_chirho = {
                field_chirho: cell_chirho[field_chirho]
                for field_chirho in ("lexeme_key_chirho", "occurrence_chirho", "alternate_chirho")
            }
            row_chirho.update(
                {
                    "cell_chirho": index_chirho,
                    "sense_id_chirho": f"sense-{attempt_chirho.name}-{source_index_chirho}-chirho",
                    "contextual_meaning_chirho": "reviewed meaning",
                    "sense_note_chirho": "specific contextual reasoning",
                    "evidence_refs_chirho": MODULE_CHIRHO.EVIDENCE_CHIRHO
                    if plan_chirho["book_id_chirho"] == "John"
                    else MODULE_CHIRHO.GENESIS_EVIDENCE_CHIRHO,
                    "sense_review_chirho": "agent_reviewed",
                    "art_review_chirho": "pending",
                    "alt_chirho": "one subject",
                }
            )
            reviews_chirho.append(row_chirho)
            if not bad_chirho:
                x_chirho, y_chirho = (index_chirho % 4) * 256 + 64, (index_chirho // 4) * 256 + 64
                draw_chirho.ellipse(
                    (x_chirho, y_chirho, x_chirho + 100, y_chirho + 100),
                    fill=(seed_chirho % 256, seed_chirho // 256, index_chirho * 13, 255),
                )
        self.write_chirho(attempt_chirho / "reviews-chirho.json", reviews_chirho)
        (attempt_chirho / "prompt-chirho.txt").write_text("transparent sheet", encoding="utf-8")
        image_chirho.save(attempt_chirho / "sheet-original-chirho.webp", lossless=True)
        image_chirho.save(attempt_chirho / "keyed-sheet-chirho.webp", lossless=True)
        self.write_chirho(
            attempt_chirho / "visual-review-chirho.json",
            {
                "inspected_chirho": True,
                "sheet_sha256_chirho": MODULE_CHIRHO.ICON_CHIRHO.digest_chirho(
                    attempt_chirho / "keyed-sheet-chirho.webp"
                ),
                "notes_chirho": "Synthetic shapes inspected for test.",
            },
        )

    def run_chirho(self, generator_chirho=None, **kwargs_chirho):
        return MODULE_CHIRHO.work_chirho(
            self.root_chirho,
            generator_chirho=generator_chirho or self.generator_chirho,
            source_chirho=self.candidates_chirho,
            gate_chirho=self.gate_chirho,
            **kwargs_chirho,
        )

    def test_ordering_gate_blocks_generator_and_preserves_checkpoint(self):
        called_chirho = []
        result_chirho = MODULE_CHIRHO.work_chirho(
            self.root_chirho,
            generator_chirho=lambda *_args_chirho: called_chirho.append(True),
            gate_chirho=lambda *_args_chirho: False,
            source_chirho=self.candidates_chirho,
        )
        self.assertEqual(result_chirho, "waiting_for_proverbs")
        self.assertEqual(called_chirho, [])
        progress_chirho = (
            MODULE_CHIRHO.home_chirho(self.root_chirho, "John") / "progress-chirho.json"
        )
        self.write_chirho(
            progress_chirho, {"state_chirho": "generating", "attempt_chirho": "attempt-abc-chirho"}
        )
        MODULE_CHIRHO.work_chirho(self.root_chirho, gate_chirho=lambda *_args_chirho: False)
        self.assertEqual(json.loads(progress_chirho.read_text())["state_chirho"], "generating")

    def test_partial_sheet_and_pending_review(self):
        self.assertEqual(self.run_chirho(once_chirho=True), "completed_sheet")
        rows_chirho = MODULE_CHIRHO.records_chirho(self.root_chirho, "John")
        self.assertEqual(len(rows_chirho), 16)
        self.assertEqual(sum(not row_chirho["alternate_chirho"] for row_chirho in rows_chirho), 2)
        self.assertTrue(
            all(row_chirho["art_review_chirho"] == "pending" for row_chirho in rows_chirho)
        )
        media_chirho = json.loads(
            MODULE_CHIRHO.media_path_chirho(self.root_chirho, "John").read_text()
        )
        self.assertEqual(len(media_chirho["icons_chirho"]), 16)
        primaries_chirho = [
            row_chirho
            for row_chirho in media_chirho["icons_chirho"]
            if row_chirho["selected_chirho"]
        ]
        self.assertEqual(
            {row_chirho["token_id_chirho"] for row_chirho in primaries_chirho},
            {"John.1.1!1", "John.1.1!2"},
        )
        self.assertEqual(
            {row_chirho["lexical_form_chirho"] for row_chirho in primaries_chirho},
            {"ἀγγέλλω", "ἀπαγγέλλω"},
        )
        self.assertTrue(
            all(
                row_chirho["art_review_chirho"] == "pending"
                for row_chirho in media_chirho["icons_chirho"]
            )
        )
        self.assertTrue(
            all(
                row_chirho.get("alternate_of_chirho")
                for row_chirho in media_chirho["icons_chirho"]
                if not row_chirho["selected_chirho"]
            )
        )
        found_chirho = MODULE_CHIRHO.SHARDS_CHIRHO.collect_chirho(self.root_chirho)
        self.assertEqual(len(found_chirho["icon"]), 16)
        self.assertEqual(self.run_chirho(), "first_pass_complete")
        with (
            mock.patch.object(MODULE_CHIRHO, "order_ready_chirho", self.gate_chirho),
            mock.patch.object(MODULE_CHIRHO, "source_check_chirho", self.candidates_chirho),
        ):
            self.assertTrue(MODULE_CHIRHO.completion_chirho(self.root_chirho))

    def test_prepared_crash_recovers_without_regeneration(self):
        with mock.patch.object(
            MODULE_CHIRHO, "install_chirho", side_effect=OSError("simulated crash")
        ):
            self.assertEqual(self.run_chirho(once_chirho=True), "continuing_with_holds")
        self.assertEqual(
            MODULE_CHIRHO.work_chirho(
                self.root_chirho,
                generator_chirho=lambda *_args_chirho: self.fail("must recover"),
                source_chirho=self.candidates_chirho,
                gate_chirho=self.gate_chirho,
                once_chirho=True,
            ),
            "completed_sheet",
        )
        self.assertEqual(len(MODULE_CHIRHO.records_chirho(self.root_chirho, "John")), 16)

    def test_partial_recovery_installs_only_accepted_cells_and_keeps_hold_chirho(self):
        def partial_chirho(root_chirho, attempt_chirho):
            self.generator_chirho(root_chirho, attempt_chirho)
            self.write_chirho(
                attempt_chirho / "visual-rejected-chirho.json", {"reason_chirho": "cell zero"}
            )
            owner_chirho = {
                "attempt_chirho": attempt_chirho.name,
                "reviewed_by_chirho": "gpt_chirho",
                "decision_chirho": "agent_visual_review_reconciled",
                "inspected_chirho": True,
                "art_review_chirho": "pending",
                "basis_chirho": "Recover the distinct good primary; retain failed primary and alternates.",
                "excluded_cells_chirho": [{"cell_chirho": 0, "reason_chirho": "Unclear subject"}],
            }
            for key_chirho, name_chirho in (
                ("plan_sha256_chirho", "plan-chirho.json"),
                ("original_sha256_chirho", "sheet-original-chirho.webp"),
                ("sheet_sha256_chirho", "keyed-sheet-chirho.webp"),
                ("visual_review_sha256_chirho", "visual-review-chirho.json"),
                ("rejection_sha256_chirho", "visual-rejected-chirho.json"),
                ("reviews_sha256_chirho", "reviews-chirho.json"),
            ):
                owner_chirho[key_chirho] = MODULE_CHIRHO.ICON_CHIRHO.digest_chirho(
                    attempt_chirho / name_chirho
                )
            self.write_chirho(
                attempt_chirho.parent / "owner-visual-resolutions-chirho.json",
                {"schema_version_chirho": 1, "resolutions_chirho": [owner_chirho]},
            )

        self.assertEqual(
            self.run_chirho(generator_chirho=partial_chirho, once_chirho=True), "completed_sheet"
        )
        rows_chirho = MODULE_CHIRHO.records_chirho(self.root_chirho, "John")
        self.assertEqual(
            [row_chirho["cell_chirho"] for row_chirho in rows_chirho], list(range(1, 16, 2))
        )
        self.assertTrue(
            all(row_chirho["art_review_chirho"] == "pending" for row_chirho in rows_chirho)
        )
        self.assertEqual(
            self.run_chirho(
                generator_chirho=lambda *_arguments_chirho: self.fail(
                    "held cells cannot be regenerated"
                )
            ),
            "first_pass_with_holds",
        )
        folder_chirho = MODULE_CHIRHO.home_chirho(self.root_chirho, "John")
        attempt_chirho = (
            folder_chirho
            / MODULE_CHIRHO.read_chirho(folder_chirho / "index-chirho.json")["attempts_chirho"][0]
        )
        self.assertTrue((attempt_chirho / "visual-rejected-chirho.json").exists())
        checkpoint_chirho = MODULE_CHIRHO.read_chirho(attempt_chirho / "prepared-chirho.json")
        checkpoint_chirho["records_chirho"].append({**rows_chirho[0], "cell_chirho": 0})
        with self.assertRaisesRegex(ValueError, "excluded cells"):
            MODULE_CHIRHO.install_chirho(self.root_chirho, attempt_chirho, checkpoint_chirho)
        candidates_chirho = self.candidates_chirho(self.root_chirho, "John")
        plan_chirho = MODULE_CHIRHO.read_chirho(attempt_chirho / "plan-chirho.json")
        registry_chirho = {
            "schema_version_chirho": 1,
            "book_id_chirho": "John",
            "scope_chirho": "initial_lemma_picture_only",
            "reviewed_by_chirho": "gpt_chirho",
            "art_review_chirho": "pending",
            "inventory_sha256_chirho": MODULE_CHIRHO.inventory_digest_chirho(
                self.root_chirho, "John"
            ),
            "source_snapshot_chirho": MODULE_CHIRHO.source_snapshot_chirho(
                self.root_chirho, "John"
            ),
            "deferrals_chirho": [
                {
                    "lexeme_key_chirho": plan_chirho["cells_chirho"][0]["lexeme_key_chirho"],
                    "occurrence_chirho": plan_chirho["cells_chirho"][0]["occurrence_chirho"],
                    "status_chirho": "deferred_art",
                    "reason_chirho": "The inspected primary remains unclear; no replacement call.",
                    "attempt_chirho": attempt_chirho.name,
                    "cell_chirho": 0,
                    "plan_sha256_chirho": MODULE_CHIRHO.ICON_CHIRHO.digest_chirho(
                        attempt_chirho / "plan-chirho.json"
                    ),
                    "evidence_sha256_chirho": MODULE_CHIRHO.ICON_CHIRHO.digest_chirho(
                        attempt_chirho / "visual-rejected-chirho.json"
                    ),
                }
            ],
        }
        registry_path_chirho = MODULE_CHIRHO.DISPOSITIONS_CHIRHO.path_chirho(
            self.root_chirho, "John"
        )
        registry_path_chirho.parent.mkdir(parents=True, exist_ok=True)
        self.write_chirho(registry_path_chirho, registry_chirho)
        with (
            mock.patch.object(MODULE_CHIRHO, "source_check_chirho", return_value=candidates_chirho),
            mock.patch.object(MODULE_CHIRHO, "order_ready_chirho", return_value=True),
        ):
            self.assertTrue(MODULE_CHIRHO.readiness_chirho(self.root_chirho, "John"))
            self.assertFalse(MODULE_CHIRHO.completion_chirho(self.root_chirho, "John"))
        for key_chirho, bad_chirho in (
            ("art_review_chirho", "approved"),
            ("inventory_sha256_chirho", "0" * 64),
            ("deferrals_chirho", []),
            ("source_snapshot_chirho", {}),
        ):
            with self.subTest(key_chirho=key_chirho):
                self.write_chirho(registry_path_chirho, {**registry_chirho, key_chirho: bad_chirho})
                with self.assertRaises(ValueError):
                    MODULE_CHIRHO.DISPOSITIONS_CHIRHO.check_chirho(
                        self.root_chirho,
                        "John",
                        candidates_chirho,
                        rows_chirho,
                        registry_chirho["source_snapshot_chirho"],
                        registry_chirho["inventory_sha256_chirho"],
                        VISUAL_CHIRHO,
                        MODULE_CHIRHO.ICON_CHIRHO.RECOVERY_CHIRHO,
                    )
        self.write_chirho(registry_path_chirho, registry_chirho)
        MODULE_CHIRHO.ICON_CHIRHO.RECOVERY_CHIRHO.resolve_chirho(folder_chirho, attempt_chirho)
        with self.assertRaisesRegex(ValueError, "unprotected"):
            MODULE_CHIRHO.DISPOSITIONS_CHIRHO.check_chirho(
                self.root_chirho,
                "John",
                candidates_chirho,
                rows_chirho,
                registry_chirho["source_snapshot_chirho"],
                registry_chirho["inventory_sha256_chirho"],
                VISUAL_CHIRHO,
                MODULE_CHIRHO.ICON_CHIRHO.RECOVERY_CHIRHO,
            )

    def test_prepared_batch_recovers_after_an_earlier_disjoint_hold_chirho(self):
        folder_chirho = MODULE_CHIRHO.home_chirho(self.root_chirho, "John")
        earlier_chirho = folder_chirho / "attempt-held-source-chirho"
        earlier_chirho.mkdir(parents=True)
        candidates_chirho = self.candidates_chirho(self.root_chirho, "John")
        MODULE_CHIRHO.ICON_CHIRHO.RECOVERY_CHIRHO.hold_chirho(
            folder_chirho,
            earlier_chirho,
            "lexeme",
            [candidates_chirho[0]["lexeme_key_chirho"]],
            "source review",
        )
        with mock.patch.object(
            MODULE_CHIRHO, "install_chirho", side_effect=OSError("interrupted install")
        ):
            self.assertEqual(self.run_chirho(once_chirho=True), "continuing_with_holds")
        self.assertEqual(
            MODULE_CHIRHO.work_chirho(
                self.root_chirho,
                generator_chirho=lambda *_arguments_chirho: self.fail(
                    "must recover without another image"
                ),
                source_chirho=self.candidates_chirho,
                gate_chirho=self.gate_chirho,
                once_chirho=True,
            ),
            "completed_sheet",
        )
        rows_chirho = MODULE_CHIRHO.records_chirho(self.root_chirho, "John")
        self.assertEqual(len(rows_chirho), 16)
        self.assertEqual(
            {MODULE_CHIRHO.key_chirho(row_chirho) for row_chirho in rows_chirho},
            {MODULE_CHIRHO.key_chirho(candidates_chirho[1])},
        )
        self.assertEqual(MODULE_CHIRHO.ICON_CHIRHO.RECOVERY_CHIRHO.count_chirho(folder_chirho), 1)

    def test_missing_attempt_review_is_logged_without_repeating_the_image_chirho(self):
        def incomplete_chirho(root_chirho, attempt_chirho):
            self.generator_chirho(root_chirho, attempt_chirho)
            (attempt_chirho / "visual-review-chirho.json").unlink()

        self.assertEqual(
            MODULE_CHIRHO.work_chirho(
                self.root_chirho,
                generator_chirho=incomplete_chirho,
                source_chirho=self.candidates_chirho,
                gate_chirho=self.gate_chirho,
                once_chirho=True,
            ),
            "continuing_with_holds",
        )
        self.assertEqual(
            MODULE_CHIRHO.work_chirho(
                self.root_chirho,
                generator_chirho=lambda *_arguments_chirho: self.fail("held image must not repeat"),
                source_chirho=self.candidates_chirho,
                gate_chirho=self.gate_chirho,
            ),
            "first_pass_with_holds",
        )

    def test_visual_rejected_outcome_blocks_install_and_another_request_chirho(self):
        def rejected_chirho(root_chirho, attempt_chirho):
            self.generator_chirho(root_chirho, attempt_chirho)
            path_chirho = attempt_chirho / "visual-review-chirho.json"
            review_chirho = MODULE_CHIRHO.read_chirho(path_chirho)
            review_chirho["outcome_chirho"] = "visual_rejected"
            self.write_chirho(path_chirho, review_chirho)

        self.assertEqual(
            self.run_chirho(generator_chirho=rejected_chirho, once_chirho=True),
            "continuing_with_holds",
        )
        self.assertEqual(MODULE_CHIRHO.records_chirho(self.root_chirho, "John"), [])
        self.assertEqual(
            MODULE_CHIRHO.work_chirho(
                self.root_chirho,
                generator_chirho=lambda *_arguments_chirho: self.fail(
                    "visual rejection cannot repeat automatically"
                ),
                source_chirho=self.candidates_chirho,
                gate_chirho=self.gate_chirho,
            ),
            "first_pass_with_holds",
        )

    def test_visual_rejection_marker_blocks_an_otherwise_valid_sheet_chirho(self):
        def rejected_chirho(root_chirho, attempt_chirho):
            self.generator_chirho(root_chirho, attempt_chirho)
            self.write_chirho(
                attempt_chirho / "visual-rejected-chirho.json",
                {"outcome_chirho": "visual_rejected"},
            )

        self.assertEqual(
            self.run_chirho(generator_chirho=rejected_chirho, once_chirho=True),
            "continuing_with_holds",
        )
        self.assertEqual(MODULE_CHIRHO.records_chirho(self.root_chirho, "John"), [])

    def test_later_visual_rejection_blocks_catalogue_replay_and_prepared_install_chirho(self):
        self.assertEqual(self.run_chirho(once_chirho=True), "completed_sheet")
        folder_chirho = MODULE_CHIRHO.home_chirho(self.root_chirho, "John")
        name_chirho = MODULE_CHIRHO.read_chirho(folder_chirho / "index-chirho.json")[
            "attempts_chirho"
        ][0]
        attempt_chirho = folder_chirho / name_chirho
        checkpoint_chirho = MODULE_CHIRHO.read_chirho(attempt_chirho / "prepared-chirho.json")
        review_chirho = MODULE_CHIRHO.read_chirho(attempt_chirho / "visual-review-chirho.json")
        review_chirho["visual_pass_chirho"] = False
        self.write_chirho(attempt_chirho / "visual-review-chirho.json", review_chirho)
        with self.assertRaisesRegex(ValueError, "visual"):
            MODULE_CHIRHO.records_chirho(self.root_chirho, "John")
        with self.assertRaisesRegex(ValueError, "visual"):
            MODULE_CHIRHO.install_chirho(
                self.root_chirho, attempt_chirho, checkpoint_chirho, [], []
            )

    def test_source_proposal_never_installs_or_consumes_layout_retries_chirho(self):
        def proposal_chirho(root_chirho, attempt_chirho):
            cells_chirho = MODULE_CHIRHO.read_chirho(attempt_chirho / "plan-chirho.json")[
                "cells_chirho"
            ]
            self.write_chirho(
                attempt_chirho / "source-review-needed-chirho.json",
                {
                    "selection_chirho": cells_chirho,
                    "concerns_chirho": [{"cell_chirho": 0, "reason_chirho": "source disagreement"}],
                },
            )

        self.assertEqual(
            MODULE_CHIRHO.work_chirho(
                self.root_chirho,
                generator_chirho=proposal_chirho,
                source_chirho=self.candidates_chirho,
                gate_chirho=self.gate_chirho,
            ),
            "first_pass_with_holds",
        )
        folder_chirho = MODULE_CHIRHO.home_chirho(self.root_chirho, "John")
        held_chirho = MODULE_CHIRHO.ICON_CHIRHO.RECOVERY_CHIRHO.read_chirho(folder_chirho)[
            "holds_chirho"
        ]
        self.assertEqual(len(held_chirho), 1)
        self.assertEqual(held_chirho[0]["checkpoint_chirho"]["rejections_chirho"], 0)
        self.assertFalse((folder_chirho / "index-chirho.json").exists())

    def test_manifest_write_crash_recovers_without_new_generation(self):
        media_path_chirho = MODULE_CHIRHO.media_path_chirho(self.root_chirho, "John")
        original_chirho = MODULE_CHIRHO.atomic_chirho

        def crash_chirho(path_chirho, value_chirho):
            if path_chirho == media_path_chirho:
                raise OSError("simulated manifest write crash")
            return original_chirho(path_chirho, value_chirho)

        with mock.patch.object(MODULE_CHIRHO, "atomic_chirho", side_effect=crash_chirho):
            self.assertEqual(self.run_chirho(once_chirho=True), "continuing_with_holds")
        self.assertTrue(
            (MODULE_CHIRHO.home_chirho(self.root_chirho, "John") / "index-chirho.json").exists()
        )
        self.assertFalse(media_path_chirho.exists())
        result_chirho = MODULE_CHIRHO.work_chirho(
            self.root_chirho,
            generator_chirho=lambda *_args_chirho: self.fail("must recover"),
            source_chirho=self.candidates_chirho,
            gate_chirho=self.gate_chirho,
            once_chirho=True,
        )
        self.assertEqual(result_chirho, "completed_sheet")
        self.assertEqual(len(json.loads(media_path_chirho.read_text())["icons_chirho"]), 16)
        self.assertEqual(
            len(MODULE_CHIRHO.SHARDS_CHIRHO.collect_chirho(self.root_chirho)["icon"]), 16
        )

    def test_manifest_divergence_is_not_overwritten(self):
        self.assertEqual(self.run_chirho(once_chirho=True), "completed_sheet")
        path_chirho = MODULE_CHIRHO.media_path_chirho(self.root_chirho, "John")
        document_chirho = json.loads(path_chirho.read_text())
        document_chirho["icons_chirho"][0]["art_review_chirho"] = "approved"
        self.write_chirho(path_chirho, document_chirho)
        with self.assertRaises(ValueError):
            self.run_chirho()
        self.assertEqual(json.loads(path_chirho.read_text()), document_chirho)

    def test_completion_refuses_missing_manifest(self):
        self.assertEqual(self.run_chirho(), "first_pass_complete")
        MODULE_CHIRHO.media_path_chirho(self.root_chirho, "John").unlink()
        with (
            mock.patch.object(MODULE_CHIRHO, "order_ready_chirho", self.gate_chirho),
            mock.patch.object(MODULE_CHIRHO, "source_check_chirho", self.candidates_chirho),
        ):
            self.assertFalse(MODULE_CHIRHO.completion_chirho(self.root_chirho))

    def test_remainder_after_full_sheet(self):
        chapter_path_chirho = self.folder_chirho / "chapter-01-chirho.json"
        chapter_chirho = json.loads(chapter_path_chirho.read_text())
        for index_chirho in range(3, 18):
            form_chirho = f"form-{index_chirho}"
            occurrence_chirho = {
                "verse_id_chirho": "John.1.1",
                "token_id_chirho": f"John.1.1!{index_chirho}",
                "berean_gloss_chirho": "say",
                "source_form_chirho": form_chirho,
            }
            lemma_chirho = {
                "lemma_id_chirho": f"G{index_chirho}",
                "lexical_form_chirho": form_chirho,
                "occurrence_count_chirho": 1,
                "occurrences_chirho": [occurrence_chirho],
            }
            self.inventory_chirho["lemmas_chirho"].append(lemma_chirho)
            chapter_chirho["verses_chirho"][0]["tokens_chirho"].append(
                {
                    "id_chirho": occurrence_chirho["token_id_chirho"],
                    "lemma_id_chirho": lemma_chirho["lemma_id_chirho"],
                    "lexical_form_chirho": form_chirho,
                    "gloss_chirho": "say",
                    "text_chirho": form_chirho,
                }
            )
        self.inventory_chirho["lemma_count_chirho"] = 17
        self.inventory_chirho["occurrence_count_chirho"] = 17
        self.write_chirho(self.inventory_path_chirho, self.inventory_chirho)
        self.write_chirho(chapter_path_chirho, chapter_chirho)
        self.assertEqual(self.run_chirho(), "first_pass_complete")
        rows_chirho = MODULE_CHIRHO.records_chirho(self.root_chirho, "John")
        self.assertEqual(sum(not row_chirho["alternate_chirho"] for row_chirho in rows_chirho), 17)
        self.assertEqual(sum(row_chirho["alternate_chirho"] for row_chirho in rows_chirho), 15)

    def test_unreviewed_child_is_rejected(self):
        def invalid_chirho(root_chirho, attempt_chirho):
            self.generator_chirho(root_chirho, attempt_chirho)
            path_chirho = attempt_chirho / "reviews-chirho.json"
            reviews_chirho = json.loads(path_chirho.read_text())
            reviews_chirho[0]["sense_review_chirho"] = "unreviewed"
            self.write_chirho(path_chirho, reviews_chirho)

        self.assertEqual(
            MODULE_CHIRHO.work_chirho(
                self.root_chirho,
                generator_chirho=invalid_chirho,
                source_chirho=self.candidates_chirho,
                gate_chirho=self.gate_chirho,
            ),
            "first_pass_with_holds",
        )

    def test_source_change_during_generation_stops_install(self):
        def drift_chirho(root_chirho, attempt_chirho):
            self.generator_chirho(root_chirho, attempt_chirho)
            (self.folder_chirho / "chapter-01-chirho.json").write_text("changed", encoding="utf-8")

        with self.assertRaisesRegex(ValueError, "Source changed during generation"):
            MODULE_CHIRHO.work_chirho(
                self.root_chirho,
                generator_chirho=drift_chirho,
                source_chirho=self.candidates_chirho,
                gate_chirho=self.gate_chirho,
            )
        self.assertFalse(
            (MODULE_CHIRHO.home_chirho(self.root_chirho, "John") / "index-chirho.json").exists()
        )

    def test_inflight_crash_stops_without_regeneration(self):
        self.assertEqual(
            MODULE_CHIRHO.work_chirho(
                self.root_chirho,
                generator_chirho=lambda *_args_chirho: (_ for _ in ()).throw(
                    RuntimeError("failure")
                ),
                source_chirho=self.candidates_chirho,
                gate_chirho=self.gate_chirho,
            ),
            "first_pass_with_holds",
        )
        self.assertEqual(self.run_chirho(), "first_pass_with_holds")

    def test_lock_refuses_second_writer(self):
        with MODULE_CHIRHO.lock_chirho(self.root_chirho, "John"), self.assertRaises(RuntimeError):
            self.run_chirho()

    def test_missing_source_does_not_clear_inflight_claim(self):
        progress_chirho = (
            MODULE_CHIRHO.home_chirho(self.root_chirho, "John") / "progress-chirho.json"
        )
        progress_chirho.parent.mkdir(parents=True)
        self.write_chirho(
            progress_chirho, {"state_chirho": "generating", "attempt_chirho": "attempt-abc-chirho"}
        )
        (self.folder_chirho / "chapter-01-chirho.json").unlink()
        self.assertEqual(self.run_chirho(), "waiting_for_source")
        self.assertEqual(json.loads(progress_chirho.read_text())["state_chirho"], "generating")

    def test_real_gate_requires_john_supervisor_state_and_both_proverbs_checks(self):
        status_chirho = (
            self.root_chirho / MODULE_CHIRHO.ORDER_CHIRHO.HOME_CHIRHO / "status-chirho.json"
        )
        status_chirho.parent.mkdir(parents=True)
        with (
            mock.patch.object(
                MODULE_CHIRHO.ORDER_CHIRHO, "proverbs_complete_chirho", return_value=True
            ),
            mock.patch.object(
                MODULE_CHIRHO.ORDER_CHIRHO,
                "proverbs_icons_complete_chirho",
                return_value=(True, {}),
            ),
        ):
            self.assertFalse(MODULE_CHIRHO.order_ready_chirho(self.root_chirho, "John"))
            self.write_chirho(status_chirho, {"state_chirho": "generating", "book_chirho": "Gen"})
            self.assertFalse(MODULE_CHIRHO.order_ready_chirho(self.root_chirho, "John"))
            self.write_chirho(status_chirho, {"state_chirho": "generating", "book_chirho": "John"})
            self.assertTrue(MODULE_CHIRHO.order_ready_chirho(self.root_chirho, "John"))
            with mock.patch.object(
                MODULE_CHIRHO.ORDER_CHIRHO,
                "proverbs_icons_complete_chirho",
                return_value=(False, {}),
            ):
                self.assertFalse(MODULE_CHIRHO.order_ready_chirho(self.root_chirho, "John"))

    def test_genesis_waits_for_source(self):
        self.assertEqual(
            MODULE_CHIRHO.work_chirho(
                self.root_chirho,
                "Gen",
                generator_chirho=lambda *_args_chirho: self.fail("must not generate"),
                gate_chirho=self.gate_chirho,
            ),
            "waiting_for_source",
        )

    def test_genesis_gate_requires_completed_john_scenes_and_icons(self):
        status_chirho = (
            self.root_chirho / MODULE_CHIRHO.ORDER_CHIRHO.HOME_CHIRHO / "status-chirho.json"
        )
        status_chirho.parent.mkdir(parents=True)
        self.write_chirho(status_chirho, {"state_chirho": "generating", "book_chirho": "Gen"})
        with (
            mock.patch.object(
                MODULE_CHIRHO.ORDER_CHIRHO, "proverbs_complete_chirho", return_value=True
            ),
            mock.patch.object(
                MODULE_CHIRHO.ORDER_CHIRHO,
                "proverbs_icons_complete_chirho",
                return_value=(True, {}),
            ),
            mock.patch.object(MODULE_CHIRHO, "john_scenes_complete_chirho", return_value=True),
            mock.patch.object(
                MODULE_CHIRHO, "first_pass_ready_chirho", return_value=False
            ) as proof_chirho,
        ):
            self.assertFalse(MODULE_CHIRHO.order_ready_chirho(self.root_chirho, "Gen"))
            proof_chirho.return_value = True
            self.assertTrue(MODULE_CHIRHO.order_ready_chirho(self.root_chirho, "Gen"))
            with mock.patch.object(
                MODULE_CHIRHO, "john_scenes_complete_chirho", return_value=False
            ):
                self.assertFalse(MODULE_CHIRHO.order_ready_chirho(self.root_chirho, "Gen"))

    def test_genesis_worker_uses_separate_hebrew_sources_and_assets(self):
        folder_chirho = self.root_chirho / "static/content-chirho/genesis-chirho"
        folder_chirho.mkdir(parents=True)
        token_chirho = {
            "id_chirho": "g1",
            "lemma_id_chirho": "H1",
            "lemma_augment_chirho": None,
            "gloss_chirho": "father",
            "qere_chirho": [
                {
                    "id_chirho": "q1",
                    "lemma_id_chirho": "H2",
                    "lemma_augment_chirho": None,
                    "gloss_chirho": None,
                }
            ],
        }
        occurrence_chirho = {
            "verse_id_chirho": "Gen.1.1",
            "token_id_chirho": "g1",
            "reading_chirho": "ketiv",
            "gloss_chirho": "father",
        }
        inventory_chirho = {
            "book_id_chirho": "Gen",
            "lemma_count_chirho": 2,
            "occurrence_count_chirho": 2,
            "lemmas_chirho": [
                {
                    "lemma_id_chirho": "H1",
                    "lemma_augment_chirho": None,
                    "occurrence_count_chirho": 1,
                    "occurrences_chirho": [occurrence_chirho],
                },
                {
                    "lemma_id_chirho": "H2",
                    "lemma_augment_chirho": None,
                    "occurrence_count_chirho": 1,
                    "occurrences_chirho": [
                        {
                            "verse_id_chirho": "Gen.1.1",
                            "token_id_chirho": "q1",
                            "reading_chirho": "qere",
                            "gloss_chirho": None,
                        }
                    ],
                },
            ],
        }
        self.write_chirho(
            self.corpus_chirho / "genesis-lemma-inventory-chirho.json", inventory_chirho
        )
        for number_chirho in range(1, 51):
            self.write_chirho(
                folder_chirho / f"chapter-{number_chirho:02d}-chirho.json",
                {
                    "book_id_chirho": "Gen",
                    "chapter_chirho": number_chirho,
                    "verses_chirho": [{"id_chirho": "Gen.1.1", "tokens_chirho": [token_chirho]}]
                    if number_chirho == 1
                    else [],
                },
            )
        for relative_chirho in (
            "data-chirho/corpus-chirho/sources-chirho/morphhb-chirho/wlc/Gen.xml",
            "data-chirho/corpus-chirho/sources-chirho/gbt-data-chirho/eng/01-Gen.json",
            "data-chirho/corpus-chirho/sources-chirho/gbt-data-chirho/hbo+grc/01-Gen.json",
            "data-chirho/sources-chirho/morphhb-chirho/parsing/HebrewMorphologyCodes.html",
            "data-chirho/sources-chirho/hebrew-lexicon-chirho/HebrewStrong.xml",
            "data-chirho/sources-chirho/hebrew-lexicon-chirho/AugIndex.xml",
            "data-chirho/sources-chirho/hebrew-lexicon-chirho/LexicalIndex.xml",
        ):
            path_chirho = self.root_chirho / relative_chirho
            path_chirho.parent.mkdir(parents=True, exist_ok=True)
            path_chirho.write_bytes(b"fake Hebrew source")
        source_chirho = lambda root_chirho, _book_chirho: MODULE_CHIRHO.genesis_candidates_chirho(
            root_chirho
        )
        self.assertEqual(
            MODULE_CHIRHO.work_chirho(
                self.root_chirho,
                "Gen",
                generator_chirho=self.generator_chirho,
                source_chirho=source_chirho,
                gate_chirho=self.gate_chirho,
            ),
            "first_pass_complete",
        )
        rows_chirho = MODULE_CHIRHO.records_chirho(self.root_chirho, "Gen")
        self.assertEqual(len(rows_chirho), 16)
        self.assertTrue(
            all(
                "/genesis-worker-v1-chirho/" in row_chirho["asset_path_chirho"]
                for row_chirho in rows_chirho
            )
        )
        self.assertEqual(
            rows_chirho[0]["evidence_refs_chirho"], MODULE_CHIRHO.GENESIS_EVIDENCE_CHIRHO
        )
        media_chirho = json.loads(
            MODULE_CHIRHO.media_path_chirho(self.root_chirho, "Gen").read_text()
        )
        self.assertEqual(media_chirho["icons_chirho"][0]["reading_chirho"], "ketiv")
        self.assertEqual(media_chirho["icons_chirho"][0]["token_id_chirho"], "g1")
        collected_chirho = MODULE_CHIRHO.SHARDS_CHIRHO.collect_chirho(self.root_chirho)["icon"]
        self.assertEqual(len(collected_chirho), 16)
        self.assertIn("q1", {row_chirho["token_id_chirho"] for _, row_chirho in collected_chirho})
        with (
            mock.patch.object(MODULE_CHIRHO, "order_ready_chirho", self.gate_chirho),
            mock.patch.object(MODULE_CHIRHO, "source_check_chirho", source_chirho),
        ):
            self.assertTrue(MODULE_CHIRHO.completion_chirho(self.root_chirho, "Gen"))
        self.assertFalse(
            (MODULE_CHIRHO.home_chirho(self.root_chirho, "John") / "index-chirho.json").exists()
        )

    def test_layout_failures_stop_at_four(self):
        attempts_chirho = []

        def bad_generator_chirho(root_chirho, attempt_chirho):
            attempts_chirho.append(attempt_chirho)
            self.generator_chirho(root_chirho, attempt_chirho, bad_chirho=True)

        result_chirho = MODULE_CHIRHO.work_chirho(
            self.root_chirho,
            generator_chirho=bad_generator_chirho,
            source_chirho=self.candidates_chirho,
            gate_chirho=self.gate_chirho,
        )
        self.assertEqual(result_chirho, "first_pass_with_holds")
        self.assertEqual(len(attempts_chirho), 4)
        first_chirho = MODULE_CHIRHO.read_chirho(attempts_chirho[0] / "plan-chirho.json")
        self.assertNotIn("layout_retry_chirho", first_chirho)
        for index_chirho, attempt_chirho in enumerate(attempts_chirho[1:], 1):
            plan_chirho = MODULE_CHIRHO.read_chirho(attempt_chirho / "plan-chirho.json")
            self.assertEqual(plan_chirho["cells_chirho"], first_chirho["cells_chirho"])
            self.assertEqual(plan_chirho["layout_retry_chirho"]["rejections_chirho"], index_chirho)
            self.assertIn(
                plan_chirho["layout_retry_chirho"]["reason_chirho"],
                MODULE_CHIRHO.prompt_chirho(self.root_chirho, attempt_chirho),
            )
        self.assertEqual(self.run_chirho(), "first_pass_with_holds")

        held_chirho = MODULE_CHIRHO.ICON_CHIRHO.RECOVERY_CHIRHO.read_chirho(
            MODULE_CHIRHO.home_chirho(self.root_chirho, "John")
        )["holds_chirho"]
        self.assertEqual(len(held_chirho), 1)
        self.assertEqual(held_chirho[0]["checkpoint_chirho"]["rejections_chirho"], 4)


class SharedVocabularyBudgetTestsChirho(unittest.TestCase):
    def test_new_defaults_preserve_already_dispatched_selection_chirho(self):
        rows_chirho = [
            {
                "lexeme_key_chirho": ["John", "G1", form_chirho],
                "occurrences_chirho": [
                    {"verse_id_chirho": "John.1.1", "token_id_chirho": f"John.1.1!{index_chirho}"}
                ],
            }
            for index_chirho, form_chirho in enumerate(("α", "β"), 1)
        ]
        with tempfile.TemporaryDirectory() as temporary_chirho:
            root_chirho = Path(temporary_chirho)
            folder_chirho = MODULE_CHIRHO.home_chirho(root_chirho, "John")
            attempt_chirho = "attempt-" + "a" * 32 + "-chirho"
            (folder_chirho / attempt_chirho).mkdir(parents=True)
            (folder_chirho / "progress-chirho.json").write_text(
                json.dumps(
                    {"state_chirho": "needs_reconciliation", "attempt_chirho": attempt_chirho}
                )
            )
            (folder_chirho / attempt_chirho / "plan-chirho.json").write_text(
                json.dumps({"cells_chirho": MODULE_CHIRHO.plan_chirho(rows_chirho, [])})
            )
            with (
                mock.patch.object(
                    MODULE_CHIRHO, "john_candidates_chirho", return_value=rows_chirho
                ),
                mock.patch.object(
                    MODULE_CHIRHO.subprocess, "run", return_value=mock.Mock(returncode=0)
                ),
                mock.patch.object(
                    MODULE_CHIRHO.REUSE_CHIRHO, "coverage_keys_chirho", return_value=set()
                ),
                mock.patch.object(
                    MODULE_CHIRHO.SHARDS_CHIRHO,
                    "lemma_library_chirho",
                    return_value=({("G1", None, "α"): {}}, {}),
                ),
                mock.patch.object(MODULE_CHIRHO, "records_chirho", return_value=[]),
            ):
                eligible_chirho = MODULE_CHIRHO.source_check_chirho(root_chirho, "John")
            self.assertEqual(
                MODULE_CHIRHO.plan_chirho(eligible_chirho, []),
                MODULE_CHIRHO.plan_chirho(rows_chirho, []),
            )

    def test_general_lemma_pictures_save_generation_and_keep_owned_proofs_chirho(self):
        rows_chirho = [
            {
                "lexeme_key_chirho": ["John", "G1", form_chirho],
                "occurrences_chirho": [
                    {"verse_id_chirho": "John.1.1", "token_id_chirho": f"John.1.1!{number_chirho}"}
                ],
            }
            for number_chirho, form_chirho in enumerate(("α", "β"), 1)
        ]
        for owned_chirho in (
            [],
            [
                {
                    "lexeme_key_chirho": ["John", "G1", "α"],
                    "occurrence_chirho": rows_chirho[0]["occurrences_chirho"][0],
                    "alternate_chirho": False,
                }
            ],
        ):
            with (
                mock.patch.object(
                    MODULE_CHIRHO, "john_candidates_chirho", return_value=rows_chirho
                ),
                mock.patch.object(
                    MODULE_CHIRHO.subprocess, "run", return_value=mock.Mock(returncode=0)
                ),
                mock.patch.object(
                    MODULE_CHIRHO.REUSE_CHIRHO, "coverage_keys_chirho", return_value=set()
                ),
                mock.patch.object(
                    MODULE_CHIRHO.SHARDS_CHIRHO,
                    "lemma_library_chirho",
                    return_value=({("G1", None, "α"): {}}, {}),
                ),
                mock.patch.object(MODULE_CHIRHO, "records_chirho", return_value=owned_chirho),
            ):
                eligible_chirho = MODULE_CHIRHO.source_check_chirho(Path("/unused"), "John")
            self.assertEqual(len(eligible_chirho), 2 if owned_chirho else 1)
            planned_chirho = MODULE_CHIRHO.plan_chirho(eligible_chirho, owned_chirho)
            self.assertEqual(
                {tuple(row_chirho["lexeme_key_chirho"]) for row_chirho in planned_chirho},
                {("John", "G1", "β")},
            )

    def test_shared_lexemes_do_not_enter_the_generation_plan_chirho(self):
        rows_chirho = [
            {
                "lexeme_key_chirho": ["John", "G1", "α"],
                "occurrences_chirho": [
                    {"verse_id_chirho": "John.1.1", "token_id_chirho": "John.1.1!1"}
                ],
            },
            {
                "lexeme_key_chirho": ["John", "G2", "β"],
                "occurrences_chirho": [
                    {"verse_id_chirho": "John.1.1", "token_id_chirho": "John.1.1!2"}
                ],
            },
        ]
        with (
            mock.patch.object(MODULE_CHIRHO, "john_candidates_chirho", return_value=rows_chirho),
            mock.patch.object(
                MODULE_CHIRHO.subprocess, "run", return_value=mock.Mock(returncode=0)
            ),
            mock.patch.object(
                MODULE_CHIRHO.REUSE_CHIRHO,
                "coverage_keys_chirho",
                return_value={("John", "G1", "α")},
            ),
            mock.patch.object(MODULE_CHIRHO, "records_chirho", return_value=[]),
        ):
            eligible_chirho = MODULE_CHIRHO.source_check_chirho(Path("/unused"), "John")
        planned_chirho = MODULE_CHIRHO.plan_chirho(eligible_chirho, [])
        self.assertEqual(
            {tuple(row_chirho["lexeme_key_chirho"]) for row_chirho in planned_chirho},
            {("John", "G2", "β")},
        )

    def test_later_shared_coverage_keeps_generated_sheet_proofs_valid_chirho(self):
        occurrence_chirho = {"verse_id_chirho": "John.1.1", "token_id_chirho": "John.1.1!1"}
        candidate_chirho = {
            "lexeme_key_chirho": ["John", "G1", "α"],
            "occurrences_chirho": [occurrence_chirho],
        }
        owned_chirho = {
            "lexeme_key_chirho": candidate_chirho["lexeme_key_chirho"],
            "occurrence_chirho": occurrence_chirho,
            "alternate_chirho": False,
        }
        with (
            mock.patch.object(
                MODULE_CHIRHO, "john_candidates_chirho", return_value=[candidate_chirho]
            ),
            mock.patch.object(
                MODULE_CHIRHO.subprocess, "run", return_value=mock.Mock(returncode=0)
            ),
            mock.patch.object(
                MODULE_CHIRHO.REUSE_CHIRHO,
                "coverage_keys_chirho",
                return_value={("John", "G1", "α")},
            ),
            mock.patch.object(MODULE_CHIRHO, "records_chirho", return_value=[owned_chirho]),
        ):
            eligible_chirho = MODULE_CHIRHO.source_check_chirho(Path("/unused"), "John")
        MODULE_CHIRHO.check_coverage_chirho(eligible_chirho, [owned_chirho])
        self.assertEqual(MODULE_CHIRHO.plan_chirho(eligible_chirho, [owned_chirho]), [])


VISUAL_CHIRHO = MODULE_CHIRHO.VISUAL_CHIRHO


class VisualReviewsTestsChirho(unittest.TestCase):
    def setUp(self):
        self.temp_chirho = tempfile.TemporaryDirectory()
        self.addCleanup(self.temp_chirho.cleanup)
        self.home_chirho = Path(self.temp_chirho.name)
        self.attempt_chirho = self.home_chirho / "attempt-test-chirho"
        self.attempt_chirho.mkdir()
        self.review_chirho = {"outcome_chirho": "visual_rejected", "inspected_chirho": True}
        self.write_chirho("visual-review-chirho.json", self.review_chirho)
        self.write_chirho("visual-rejected-chirho.json", {"reason_chirho": "size"})
        for file_chirho in (
            "plan-chirho.json",
            "sheet-original-chirho.webp",
            "keyed-sheet-chirho.webp",
        ):
            (self.attempt_chirho / file_chirho).write_bytes(file_chirho.encode())

    def write_chirho(self, file_chirho, value_chirho):
        (self.attempt_chirho / file_chirho).write_text(json.dumps(value_chirho))

    def resolution_chirho(self):
        row_chirho = {
            "attempt_chirho": self.attempt_chirho.name,
            "reviewed_by_chirho": "gpt_chirho",
            "decision_chirho": "agent_visual_review_reconciled",
            "inspected_chirho": True,
            "art_review_chirho": "pending",
            "basis_chirho": "Inspected original, measured cuts and 19px render.",
        }
        for key_chirho, file_chirho in (
            ("plan_sha256_chirho", "plan-chirho.json"),
            ("original_sha256_chirho", "sheet-original-chirho.webp"),
            ("sheet_sha256_chirho", "keyed-sheet-chirho.webp"),
            ("visual_review_sha256_chirho", "visual-review-chirho.json"),
            ("rejection_sha256_chirho", "visual-rejected-chirho.json"),
        ):
            row_chirho[key_chirho] = VISUAL_CHIRHO.digest_chirho(self.attempt_chirho / file_chirho)
        return row_chirho

    def save_chirho(self, rows_chirho):
        (self.home_chirho / "owner-visual-resolutions-chirho.json").write_text(
            json.dumps({"schema_version_chirho": 1, "resolutions_chirho": rows_chirho})
        )

    def test_rejection_without_owner_evidence_refuses(self):
        with self.assertRaises(ValueError):
            VISUAL_CHIRHO.review_chirho(self.attempt_chirho)

    def test_exact_owner_review_retains_original_negative_and_pending_art(self):
        self.save_chirho([self.resolution_chirho()])
        self.assertEqual(VISUAL_CHIRHO.review_chirho(self.attempt_chirho), self.review_chirho)
        self.assertTrue((self.attempt_chirho / "visual-rejected-chirho.json").is_file())

    def test_changed_evidence_cannot_reuse_owner_review(self):
        for file_chirho in (
            "plan-chirho.json",
            "sheet-original-chirho.webp",
            "keyed-sheet-chirho.webp",
            "visual-review-chirho.json",
            "visual-rejected-chirho.json",
        ):
            with self.subTest(file_chirho=file_chirho):
                path_chirho = self.attempt_chirho / file_chirho
                original_chirho = path_chirho.read_bytes()
                self.save_chirho([self.resolution_chirho()])
                path_chirho.write_bytes(original_chirho + b" ")
                with self.assertRaises(ValueError):
                    VISUAL_CHIRHO.review_chirho(self.attempt_chirho)
                path_chirho.write_bytes(original_chirho)

    def test_owner_identity_inspection_and_pending_state_required(self):
        for key_chirho, value_chirho in (
            ("reviewed_by_chirho", "child_chirho"),
            ("inspected_chirho", False),
            ("art_review_chirho", "approved"),
            ("basis_chirho", ""),
        ):
            with self.subTest(key_chirho=key_chirho):
                row_chirho = self.resolution_chirho()
                row_chirho[key_chirho] = value_chirho
                self.save_chirho([row_chirho])
                with self.assertRaises(ValueError):
                    VISUAL_CHIRHO.review_chirho(self.attempt_chirho)

    def test_duplicate_owner_decisions_refuse(self):
        self.save_chirho([self.resolution_chirho(), self.resolution_chirho()])
        with self.assertRaises(ValueError):
            VISUAL_CHIRHO.review_chirho(self.attempt_chirho)

    def test_partial_review_requires_consumer_support_and_exact_cell_evidence_chirho(self):
        self.write_chirho("reviews-chirho.json", [])
        row_chirho = self.resolution_chirho()
        row_chirho["reviews_sha256_chirho"] = VISUAL_CHIRHO.digest_chirho(
            self.attempt_chirho / "reviews-chirho.json"
        )
        for excluded_chirho in (
            [],
            [{"cell_chirho": True, "reason_chirho": "bad"}],
            [{"cell_chirho": 16, "reason_chirho": "bad"}],
            [{"cell_chirho": 2, "reason_chirho": ""}],
        ):
            self.save_chirho([{**row_chirho, "excluded_cells_chirho": excluded_chirho}])
            with self.assertRaises(ValueError):
                VISUAL_CHIRHO.review_chirho(self.attempt_chirho, allow_partial_chirho=True)
        self.save_chirho(
            [{**row_chirho, "excluded_cells_chirho": [{"cell_chirho": 2, "reason_chirho": "bad"}]}]
        )
        with self.assertRaises(ValueError):
            VISUAL_CHIRHO.review_chirho(self.attempt_chirho)
        self.assertIn(
            "owner_partial_review_chirho",
            VISUAL_CHIRHO.review_chirho(self.attempt_chirho, allow_partial_chirho=True),
        )
        self.write_chirho("reviews-chirho.json", ["changed"])
        with self.assertRaises(ValueError):
            VISUAL_CHIRHO.review_chirho(self.attempt_chirho, allow_partial_chirho=True)


if __name__ == "__main__":
    unittest.main()
