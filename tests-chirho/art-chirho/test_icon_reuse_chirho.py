# For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life. — John 3:16 (KJV)
"""Shared byte reuse needs an explicit reviewed source, exact target and live context pins."""

import hashlib
import importlib.util
import json
import sys
import tempfile
import unittest
from pathlib import Path

from test_sharded_media_chirho import webp_chirho

SCRIPTS_CHIRHO = Path(__file__).resolve().parents[2] / "scripts-chirho/art-chirho"
sys.path.insert(0, str(SCRIPTS_CHIRHO))
try:
    SPEC_CHIRHO = importlib.util.spec_from_file_location(
        "reuse_icons_chirho", SCRIPTS_CHIRHO / "reuse_icons_chirho.py"
    )
    MODULE_CHIRHO = importlib.util.module_from_spec(SPEC_CHIRHO)
    SPEC_CHIRHO.loader.exec_module(MODULE_CHIRHO)
finally:
    sys.path.remove(str(SCRIPTS_CHIRHO))


class IconReuseTestsChirho(unittest.TestCase):
    def setUp(self):
        self.temp_chirho = tempfile.TemporaryDirectory()
        self.root_chirho = Path(self.temp_chirho.name)
        self.asset_chirho = "/assets-chirho/water-chirho.webp"
        path_chirho = self.root_chirho / "static" / self.asset_chirho.lstrip("/")
        path_chirho.parent.mkdir(parents=True)
        path_chirho.write_bytes(webp_chirho(128, 128))
        self.sha_chirho = hashlib.sha256(path_chirho.read_bytes()).hexdigest()
        self.token_chirho = {
            "id_chirho": "source",
            "text_chirho": "מַיִם",
            "gloss_chirho": "water",
            "lemma_id_chirho": "H4325",
            "lemma_augment_chirho": None,
            "lexical_form_chirho": "מַיִם",
        }
        self.verse_chirho = self.verse_chirho_for("Prov.1.1", self.token_chirho)
        self.greek_chirho = {
            "id_chirho": "John.1.1!1",
            "text_chirho": "ὕδωρ",
            "gloss_chirho": "water",
            "lemma_id_chirho": "G5204",
            "lemma_augment_chirho": None,
            "lexical_form_chirho": "ὕδωρ",
        }
        self.target_chirho = self.verse_chirho_for("John.1.1", self.greek_chirho)
        self.write_book_chirho("Prov", [self.verse_chirho])
        self.write_book_chirho("John", [self.target_chirho])
        self.source_chirho = {
            "id_chirho": "source-icon-chirho",
            "lesson_id_chirho": "Prov.1.1",
            "token_id_chirho": "source",
            "lemma_id_chirho": "H4325",
            "lemma_augment_chirho": None,
            "sense_id_chirho": "water-sense-chirho",
            "contextual_meaning_chirho": "water",
            "asset_path_chirho": self.asset_chirho,
            "alt_chirho": "A drop of water",
            "width_chirho": 128,
            "height_chirho": 128,
            "sha256_chirho": self.sha_chirho,
            "art_review_chirho": "pending",
            "sense_review_chirho": "agent_reviewed",
            "evidence_refs_chirho": ["source-chirho"],
            "selected_chirho": True,
            "display_authority_chirho": "Agent reviewed meaning; art pending.",
        }
        self.write_chirho(
            MODULE_CHIRHO.MEDIA_CHIRHO / "source-icons-chirho.json",
            {"schema_version_chirho": 1, "icons_chirho": [self.source_chirho]},
        )
        self.rule_path_chirho = MODULE_CHIRHO.REVIEWS_CHIRHO / "0000-chirho/water-chirho.json"
        self.rule_chirho = {
            "schema_version_chirho": 1,
            "id_chirho": "water-bridge-chirho",
            "reviewed_by_chirho": "gpt_chirho",
            "sense_review_chirho": "agent_reviewed",
            "review_note_chirho": "The pinned Hebrew and Greek words share this reviewed water sense.",
            "source_icon_id_chirho": self.source_chirho["id_chirho"],
            "source_sha256_chirho": self.sha_chirho,
            "source_word_chirho": self.pin_chirho(self.verse_chirho, self.token_chirho),
            "target_lexeme_chirho": MODULE_CHIRHO.lexeme_chirho(self.greek_chirho),
            "contextual_meaning_chirho": "water",
            "evidence_refs_chirho": ["source-chirho"],
            "targets_chirho": [self.pin_chirho(self.target_chirho, self.greek_chirho)],
        }
        self.write_chirho(self.rule_path_chirho, self.rule_chirho)

    def tearDown(self):
        self.temp_chirho.cleanup()

    def write_chirho(self, path_chirho, value_chirho):
        path_chirho = self.root_chirho / path_chirho
        path_chirho.parent.mkdir(parents=True, exist_ok=True)
        path_chirho.write_text(json.dumps(value_chirho, ensure_ascii=False))

    def verse_chirho_for(self, identifier_chirho, token_chirho):
        return {
            "id_chirho": identifier_chirho,
            "canonical_text_chirho": token_chirho["text_chirho"],
            "tokens_chirho": [token_chirho],
            "sources_chirho": [{"id_chirho": "source-chirho"}],
        }

    def write_book_chirho(self, book_chirho, verses_chirho):
        folder_chirho = MODULE_CHIRHO.BOOKS_CHIRHO[book_chirho][0]
        base_chirho = Path("static/content-chirho") / folder_chirho
        chapter_chirho = base_chirho / "chapter-01-chirho.json"
        self.write_chirho(
            chapter_chirho,
            {"book_id_chirho": book_chirho, "chapter_chirho": 1, "verses_chirho": verses_chirho},
        )
        self.write_chirho(
            base_chirho / "manifest-chirho.json",
            {
                "book_id_chirho": book_chirho,
                "chapters_chirho": [
                    {
                        "number_chirho": 1,
                        "sha256_chirho": hashlib.sha256(
                            (self.root_chirho / chapter_chirho).read_bytes()
                        ).hexdigest(),
                    }
                ],
            },
        )

    def pin_chirho(self, verse_chirho, token_chirho):
        return {
            "verse_id_chirho": verse_chirho["id_chirho"],
            "token_id_chirho": token_chirho["id_chirho"],
            "text_chirho": token_chirho["text_chirho"],
            "gloss_chirho": token_chirho["gloss_chirho"],
            "canonical_sha256_chirho": hashlib.sha256(
                verse_chirho["canonical_text_chirho"].encode()
            ).hexdigest(),
        }

    def test_cross_language_reuses_identical_bytes_and_pins_target_chirho(self):
        result_chirho = MODULE_CHIRHO.refresh_chirho(self.root_chirho)
        self.assertEqual(result_chirho["word_contexts_chirho"], 1)
        self.assertEqual(len(list((self.root_chirho / "static").rglob("*.webp"))), 1)
        row_chirho = MODULE_CHIRHO.build_chirho(self.root_chirho)["John"][0]
        self.assertEqual(
            (row_chirho["asset_path_chirho"], row_chirho["sha256_chirho"]),
            (self.asset_chirho, self.sha_chirho),
        )
        self.assertEqual(row_chirho["lemma_id_chirho"], "G5204")
        self.assertEqual(
            row_chirho["lexical_form_chirho"], self.greek_chirho["lexical_form_chirho"]
        )
        self.assertEqual(
            row_chirho["context_canonical_text_chirho"], self.target_chirho["canonical_text_chirho"]
        )
        self.assertEqual(row_chirho["art_review_chirho"], "pending")
        self.assertEqual(
            MODULE_CHIRHO.refresh_chirho(self.root_chirho, True)["changed_files_chirho"], 0
        )
        self.assertEqual(
            MODULE_CHIRHO.coverage_keys_chirho(self.root_chirho, "John"),
            {("John", "G5204", "ὕδωρ")},
        )

    def test_stale_shared_coverage_cannot_silently_skip_generation_chirho(self):
        MODULE_CHIRHO.refresh_chirho(self.root_chirho)
        path_chirho = MODULE_CHIRHO.output_path_chirho(self.root_chirho, "John")
        data_chirho = json.loads(path_chirho.read_text())
        data_chirho["icons_chirho"][0]["lemma_id_chirho"] = "G5205"
        path_chirho.write_text(json.dumps(data_chirho))
        with self.assertRaisesRegex(ValueError, "coverage is stale"):
            MODULE_CHIRHO.coverage_keys_chirho(self.root_chirho, "John")

    def test_unresolved_context_stays_unassigned_chirho(self):
        token_chirho = {**self.token_chirho, "id_chirho": "target"}
        verse_chirho = self.verse_chirho_for("Prov.1.2", token_chirho)
        self.write_book_chirho("Prov", [self.verse_chirho, verse_chirho])
        self.write_chirho(
            self.rule_path_chirho,
            {
                **self.rule_chirho,
                "target_lexeme_chirho": MODULE_CHIRHO.lexeme_chirho(token_chirho),
                "targets_chirho": [self.pin_chirho(verse_chirho, token_chirho)],
            },
        )
        self.write_chirho(
            Path("data-chirho/reader-chirho/icon-deferrals-chirho.json"),
            {
                "schema_version_chirho": 1,
                "book_id_chirho": "Prov",
                "deferrals_chirho": [
                    {
                        "verse_id_chirho": "Prov.1.2",
                        "token_id_chirho": "target",
                        "lemma_id_chirho": "H4325",
                        "lemma_augment_chirho": None,
                        "review_status_chirho": "unresolved",
                        "reason_chirho": "This exact contextual meaning is held.",
                        "gloss_chirho": "water",
                        "evidence_refs_chirho": [
                            "oshb-prov-chirho",
                            "gbt-english-prov-chirho",
                            "lexical-index-chirho",
                        ],
                    }
                ],
            },
        )
        with self.assertRaisesRegex(ValueError, "unresolved word context"):
            MODULE_CHIRHO.build_chirho(self.root_chirho)

    def test_changed_gloss_or_surrounding_verse_keeps_last_good_output_chirho(self):
        MODULE_CHIRHO.refresh_chirho(self.root_chirho)
        path_chirho = MODULE_CHIRHO.output_path_chirho(self.root_chirho, "John")
        before_chirho = path_chirho.read_bytes()
        for field_chirho, value_chirho in [
            ("gloss_chirho", "other meaning"),
            ("canonical_text_chirho", "different surrounding text"),
        ]:
            changed_token_chirho = {**self.greek_chirho}
            changed_verse_chirho = {**self.target_chirho, "tokens_chirho": [changed_token_chirho]}
            if field_chirho == "gloss_chirho":
                changed_token_chirho[field_chirho] = value_chirho
            else:
                changed_verse_chirho[field_chirho] = value_chirho
            self.write_book_chirho("John", [changed_verse_chirho])
            with self.assertRaisesRegex(ValueError, "verse, word or gloss changed"):
                MODULE_CHIRHO.refresh_chirho(self.root_chirho)
            self.assertEqual(path_chirho.read_bytes(), before_chirho)

    def test_full_greek_lexical_form_and_hebrew_augment_are_exact_chirho(self):
        for key_chirho, value_chirho in [
            ("lexical_form_chirho", "another lemma"),
            ("lemma_augment_chirho", "a"),
            ("lemma_id_chirho", "G5205"),
        ]:
            rule_chirho = {
                **self.rule_chirho,
                "target_lexeme_chirho": {
                    **self.rule_chirho["target_lexeme_chirho"],
                    key_chirho: value_chirho,
                },
            }
            self.write_chirho(self.rule_path_chirho, rule_chirho)
            with self.assertRaisesRegex(ValueError, "full target lexical identity"):
                MODULE_CHIRHO.build_chirho(self.root_chirho)

    def test_unreviewed_missing_evidence_or_changed_art_refuses_chirho(self):
        for change_chirho in [
            {"sense_review_chirho": "machine"},
            {"reviewed_by_chirho": "unknown"},
            {"evidence_refs_chirho": ["missing-chirho"]},
            {"source_sha256_chirho": "0" * 64},
        ]:
            self.write_chirho(self.rule_path_chirho, {**self.rule_chirho, **change_chirho})
            with self.assertRaises(ValueError):
                MODULE_CHIRHO.build_chirho(self.root_chirho)

    def test_duplicate_target_is_refused_chirho(self):
        self.write_chirho(
            self.rule_path_chirho,
            {**self.rule_chirho, "targets_chirho": self.rule_chirho["targets_chirho"] * 2},
        )
        with self.assertRaisesRegex(ValueError, "Duplicate target"):
            MODULE_CHIRHO.build_chirho(self.root_chirho)

    def test_existing_selection_is_preserved_chirho(self):
        existing_chirho = {
            **self.source_chirho,
            "id_chirho": "existing-target-chirho",
            "lesson_id_chirho": "John.1.1",
            "token_id_chirho": "John.1.1!1",
            **MODULE_CHIRHO.lexeme_chirho(self.greek_chirho),
        }
        self.write_chirho(
            MODULE_CHIRHO.MEDIA_CHIRHO / "existing-icons-chirho.json",
            {"icons_chirho": [existing_chirho]},
        )
        self.assertEqual(MODULE_CHIRHO.build_chirho(self.root_chirho)["John"], [])

    def test_review_upgrade_is_inherited_without_relabelling_pending_art_chirho(self):
        self.assertEqual(
            MODULE_CHIRHO.build_chirho(self.root_chirho)["John"][0]["art_review_chirho"], "pending"
        )
        self.write_chirho(
            MODULE_CHIRHO.MEDIA_CHIRHO / "source-icons-chirho.json",
            {"icons_chirho": [{**self.source_chirho, "art_review_chirho": "approved"}]},
        )
        self.assertEqual(
            MODULE_CHIRHO.build_chirho(self.root_chirho)["John"][0]["art_review_chirho"], "approved"
        )

    def test_path_escape_and_asset_mutation_are_refused_chirho(self):
        icon_chirho = {
            **self.source_chirho,
            "asset_path_chirho": "/assets-chirho/../../private.webp",
        }
        self.write_chirho(
            MODULE_CHIRHO.MEDIA_CHIRHO / "source-icons-chirho.json", {"icons_chirho": [icon_chirho]}
        )
        with self.assertRaisesRegex(ValueError, "artwork path"):
            MODULE_CHIRHO.build_chirho(self.root_chirho)
        self.write_chirho(
            MODULE_CHIRHO.MEDIA_CHIRHO / "source-icons-chirho.json",
            {"icons_chirho": [self.source_chirho]},
        )
        (self.root_chirho / "static" / self.asset_chirho.lstrip("/")).write_bytes(
            webp_chirho(127, 128)
        )
        with self.assertRaises(ValueError):
            MODULE_CHIRHO.build_chirho(self.root_chirho)


if __name__ == "__main__":
    unittest.main()
