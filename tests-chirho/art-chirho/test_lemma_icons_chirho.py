# For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life. — John 3:16 (KJV)
"""General pictures reuse full lemma identities without promoting contextual review."""

import hashlib
import json
import tempfile
import unittest
from pathlib import Path

from test_sharded_media_chirho import MODULE_CHIRHO, icon_chirho, webp_chirho


class LemmaLibraryTestChirho(unittest.TestCase):
    def setUp(self):
        temporary_chirho = tempfile.TemporaryDirectory()
        self.addCleanup(temporary_chirho.cleanup)
        self.root_chirho = Path(temporary_chirho.name)
        self.asset_chirho = "/assets-chirho/icons-chirho/instruction-chirho.webp"
        self.source_chirho = icon_chirho(
            "instruction-chirho",
            "Prov.1.1",
            "20aaa",
            self.asset_chirho,
            lemma_id_chirho="H4148",
            lemma_augment_chirho=None,
            lexical_form_chirho="מוּסָר",
            contextual_meaning_chirho="instruction",
            sha256_chirho=hashlib.sha256(webp_chirho(128, 128)).hexdigest(),
        )
        asset_chirho = self.root_chirho / "static" / self.asset_chirho[1:]
        asset_chirho.parent.mkdir(parents=True)
        asset_chirho.write_bytes(webp_chirho(128, 128))
        self.words_chirho = {
            "Prov": [
                {
                    "id_chirho": "20aaa",
                    "lemma_id_chirho": "H4148",
                    "lemma_augment_chirho": None,
                },
                {
                    "id_chirho": "20bbb",
                    "lemma_id_chirho": "H4148",
                    "lemma_augment_chirho": None,
                },
            ],
            "Gen": [
                {
                    "id_chirho": "01aaa",
                    "lemma_id_chirho": "H4148",
                    "lemma_augment_chirho": None,
                }
            ],
        }
        self.write_chirho(
            "config-chirho/lemma-icon-library-chirho.json",
            {
                "schema_version_chirho": 1,
                "source_manifests_chirho": ["library-icons-chirho.json"],
            },
        )
        self.sources_chirho = [self.source_chirho]
        self.sync_chirho()

    def write_chirho(self, name_chirho, data_chirho):
        path_chirho = self.root_chirho / name_chirho
        path_chirho.parent.mkdir(parents=True, exist_ok=True)
        path_chirho.write_text(json.dumps(data_chirho, ensure_ascii=False) + "\n")

    def sync_chirho(self):
        self.write_chirho(
            "data-chirho/media-chirho/library-icons-chirho.json",
            {"schema_version_chirho": 1, "icons_chirho": self.sources_chirho},
        )
        for book_chirho, tokens_chirho in self.words_chirho.items():
            folder_chirho = MODULE_CHIRHO.BOOKS_CHIRHO[book_chirho][0]
            name_chirho = (
                f"static/content-chirho/{folder_chirho}/chapter-01-chirho.json"
            )
            self.write_chirho(
                name_chirho,
                {
                    "book_id_chirho": book_chirho,
                    "chapter_chirho": 1,
                    "verses_chirho": [
                        {
                            "id_chirho": f"{book_chirho}.1.1",
                            "tokens_chirho": tokens_chirho,
                        }
                    ],
                },
            )
            digest_chirho = hashlib.sha256(
                (self.root_chirho / name_chirho).read_bytes()
            ).hexdigest()
            self.write_chirho(
                f"static/content-chirho/{folder_chirho}/manifest-chirho.json",
                {
                    "book_id_chirho": book_chirho,
                    "chapters_chirho": [
                        {
                            "number_chirho": 1,
                            "verse_count_chirho": 1,
                            "path_chirho": f"/content-chirho/{folder_chirho}/chapter-01-chirho.json",
                            "sha256_chirho": digest_chirho,
                        }
                    ],
                },
            )

    def test_one_picture_per_chapter_lemma_reuses_the_original_bytes_chirho(self):
        MODULE_CHIRHO.refresh_chirho(self.root_chirho)
        chapter_chirho = json.loads(
            (
                self.root_chirho
                / "static/media-chirho/genesis-chirho/chapter-01-chirho.json"
            ).read_text()
        )
        self.assertEqual(len(chapter_chirho["lemma_icons_chirho"]), 1)
        default_chirho = chapter_chirho["lemma_icons_chirho"][0]
        self.assertEqual(default_chirho["asset_path_chirho"], self.asset_chirho)
        self.assertEqual(default_chirho["lesson_id_chirho"], "Prov.1.1")
        self.assertEqual(default_chirho["art_review_chirho"], "pending")
        self.assertNotIn("source_gloss_chirho", default_chirho)
        self.assertEqual(
            len(list((self.root_chirho / "static/assets-chirho").rglob("*.webp"))), 1
        )

    def test_augments_and_exact_greek_forms_are_not_merged_chirho(self):
        self.words_chirho["Gen"][0]["lemma_augment_chirho"] = "a"
        form_chirho = "λόγος"
        self.words_chirho["John"] = [
            {
                "id_chirho": "John.1.1!1",
                "lemma_id_chirho": "G3056",
                "lexical_form_chirho": form_chirho,
            },
            {
                "id_chirho": "John.1.1!2",
                "lemma_id_chirho": "G3056",
                "lexical_form_chirho": "λόγος",
            },
        ]
        self.sources_chirho.append(
            {
                **self.source_chirho,
                "id_chirho": "greek-word-chirho",
                "lesson_id_chirho": "John.1.1",
                "token_id_chirho": "John.1.1!1",
                "lemma_id_chirho": "G3056",
                "lexical_form_chirho": form_chirho,
            }
        )
        self.sync_chirho()
        library_chirho, chapters_chirho = MODULE_CHIRHO.lemma_library_chirho(
            self.root_chirho
        )
        self.assertFalse(chapters_chirho[("Gen", 1)].intersection(library_chirho))
        self.assertIn(("G3056", None, form_chirho), library_chirho)
        self.assertNotIn(("G3056", None, "λόγος"), library_chirho)

    def test_new_sense_art_does_not_replace_the_first_default_chirho(self):
        self.sources_chirho.append(
            {
                **self.source_chirho,
                "id_chirho": "later-sense-chirho",
                "token_id_chirho": "20bbb",
                "sense_id_chirho": "later-sense-chirho",
                "contextual_meaning_chirho": "another sense",
            }
        )
        self.sync_chirho()
        library_chirho, _chapters_chirho = MODULE_CHIRHO.lemma_library_chirho(
            self.root_chirho
        )
        self.assertEqual(
            library_chirho[("H4148", None, None)]["id_chirho"], "instruction-chirho"
        )

    def test_changed_source_identity_preserves_last_good_shards_chirho(self):
        MODULE_CHIRHO.refresh_chirho(self.root_chirho)
        path_chirho = (
            self.root_chirho
            / "static/media-chirho/proverbs-chirho/chapter-01-chirho.json"
        )
        before_chirho = path_chirho.read_bytes()
        self.source_chirho["lemma_id_chirho"] = "H1"
        self.sync_chirho()
        with self.assertRaisesRegex(
            MODULE_CHIRHO.RefusalChirho, "source word identity"
        ):
            MODULE_CHIRHO.refresh_chirho(self.root_chirho)
        self.assertEqual(path_chirho.read_bytes(), before_chirho)

    def test_changed_asset_and_corpus_bytes_are_refused_chirho(self):
        path_chirho = self.root_chirho / "static" / self.asset_chirho[1:]
        path_chirho.write_bytes(path_chirho.read_bytes()[:-1] + b"x")
        with self.assertRaises(MODULE_CHIRHO.RefusalChirho):
            MODULE_CHIRHO.lemma_library_chirho(self.root_chirho)
        path_chirho.write_bytes(webp_chirho(128, 128))
        chapter_chirho = (
            self.root_chirho
            / "static/content-chirho/proverbs-chirho/chapter-01-chirho.json"
        )
        chapter_chirho.write_text(chapter_chirho.read_text() + " ")
        with self.assertRaisesRegex(MODULE_CHIRHO.RefusalChirho, "corpus bytes"):
            MODULE_CHIRHO.lemma_library_chirho(self.root_chirho)

    def test_policy_paths_cannot_escape_the_catalogue_chirho(self):
        self.write_chirho(
            "config-chirho/lemma-icon-library-chirho.json",
            {
                "schema_version_chirho": 1,
                "source_manifests_chirho": ["../../outside-icons-chirho.json"],
            },
        )
        with self.assertRaises(MODULE_CHIRHO.RefusalChirho):
            MODULE_CHIRHO.lemma_library_chirho(self.root_chirho)

    def test_unavailable_gloss_supports_only_a_verified_general_picture_chirho(self):
        self.source_chirho.update(
            context_text_chirho="מוּסָר",
            context_gloss_chirho=None,
            context_canonical_text_chirho="מוּסָר",
            meaning_evidence_chirho={"kind_chirho": "pinned_lexical_definition"},
        )
        self.words_chirho["Prov"][0].update(text_chirho="מוּסָר", gloss_chirho=None)
        self.sync_chirho()
        MODULE_CHIRHO.refresh_chirho(self.root_chirho)
        for folder_chirho in ("proverbs-chirho", "genesis-chirho"):
            chapter_chirho = json.loads(
                (
                    self.root_chirho
                    / "static/media-chirho"
                    / folder_chirho
                    / "chapter-01-chirho.json"
                ).read_bytes()
            )
            self.assertEqual(chapter_chirho["icons_chirho"], [])
            self.assertEqual(len(chapter_chirho["lemma_icons_chirho"]), 1)
            default_chirho = chapter_chirho["lemma_icons_chirho"][0]
            self.assertEqual(default_chirho["asset_path_chirho"], self.asset_chirho)
            self.assertNotIn("context_gloss_chirho", default_chirho)
        self.words_chirho["Prov"][0]["gloss_chirho"] = "changed"
        self.sync_chirho()
        with self.assertRaisesRegex(MODULE_CHIRHO.RefusalChirho, "source changed"):
            MODULE_CHIRHO.lemma_library_chirho(self.root_chirho)

    def test_null_gloss_without_lexical_evidence_and_partial_pins_stay_refused_chirho(
        self,
    ):
        self.source_chirho.update(
            context_text_chirho="מוּסָר",
            context_gloss_chirho=None,
            context_canonical_text_chirho="מוּסָר",
        )
        self.sync_chirho()
        with self.assertRaises(MODULE_CHIRHO.RefusalChirho):
            MODULE_CHIRHO.lemma_library_chirho(self.root_chirho)
        self.source_chirho["meaning_evidence_chirho"] = {
            "kind_chirho": "pinned_lexical_definition"
        }
        del self.source_chirho["context_canonical_text_chirho"]
        self.sync_chirho()
        with self.assertRaises(MODULE_CHIRHO.RefusalChirho):
            MODULE_CHIRHO.lemma_library_chirho(self.root_chirho)
