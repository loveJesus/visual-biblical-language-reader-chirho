# For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life. — John 3:16 (KJV)
"""Exact lexical identity and pinned-byte behavior for general memory pictures."""

import copy
import json
import shutil
import sys
import tempfile
import unittest
from pathlib import Path

ROOT_CHIRHO = Path(__file__).resolve().parents[2]
sys.path.insert(0, str(ROOT_CHIRHO / "scripts-chirho/bible-chirho"))
import icon_lexicon_chirho
import icon_worker_chirho


class IconLexiconTestsChirho(unittest.TestCase):
    def tearDown(self_chirho):
        icon_lexicon_chirho.dictionaries_chirho.cache_clear()

    def test_augmented_identity_never_borrows_another_sense_chirho(self_chirho):
        result_chirho = icon_lexicon_chirho.lexical_meaning_chirho(
            ROOT_CHIRHO, {"lemma_id_chirho": "H4427", "lemma_augment_chirho": "b"}
        )
        self_chirho.assertEqual(result_chirho["general_meaning_chirho"], "counsel")
        self_chirho.assertEqual(
            result_chirho["meaning_evidence_chirho"]["lemma_augment_chirho"], "b"
        )
        for augment_chirho in (None, "z"):
            with self_chirho.assertRaises(ValueError):
                icon_lexicon_chirho.lexical_meaning_chirho(
                    ROOT_CHIRHO,
                    {
                        "lemma_id_chirho": "H4427",
                        "lemma_augment_chirho": augment_chirho,
                    },
                )

    def test_null_verse_gloss_stays_null_while_dictionary_supports_picture_chirho(
        self_chirho,
    ):
        path_chirho = (
            ROOT_CHIRHO / "static/content-chirho/psalms-chirho/chapter-03-chirho.json"
        )
        chapter_chirho = json.loads(path_chirho.read_bytes())
        verse_chirho = chapter_chirho["verses_chirho"][0]
        token_chirho = next(
            row_chirho
            for row_chirho in verse_chirho["tokens_chirho"]
            if row_chirho["lemma_id_chirho"] == "H4210"
        )
        example_chirho = {
            "lesson_id_chirho": verse_chirho["id_chirho"],
            "token_id_chirho": token_chirho["id_chirho"],
            "text_chirho": token_chirho["text_chirho"],
            "gloss_chirho": token_chirho["gloss_chirho"],
            "content_path_chirho": "/content-chirho/psalms-chirho/chapter-03-chirho.json",
            "content_sha256_chirho": icon_worker_chirho.sha_chirho(path_chirho),
        }
        candidate_chirho = {**token_chirho, "examples_chirho": [example_chirho]}
        result_chirho = icon_worker_chirho.source_chirho(candidate_chirho)
        self_chirho.assertIsNone(result_chirho["occurrence_chirho"]["gloss_chirho"])
        self_chirho.assertEqual(result_chirho["general_meaning_chirho"], "melody")
        self_chirho.assertEqual(result_chirho["occurrence_chirho"], example_chirho)
        candidate_chirho["examples_chirho"] = [
            {**example_chirho, "text_chirho": "changed"}
        ]
        with self_chirho.assertRaises(ValueError):
            icon_worker_chirho.source_chirho(candidate_chirho)

    def test_dictionary_change_refuses_instead_of_trusting_new_definition_chirho(
        self_chirho,
    ):
        with tempfile.TemporaryDirectory() as temporary_chirho:
            root_chirho = Path(temporary_chirho)
            target_chirho = root_chirho / "data-chirho/sources-chirho"
            target_chirho.mkdir(parents=True)
            source_chirho = ROOT_CHIRHO / "data-chirho/sources-chirho"
            shutil.copy2(
                source_chirho / "acquisition-manifest-chirho.json", target_chirho
            )
            (target_chirho / "hebrew-lexicon-chirho").mkdir()
            for name_chirho in ("AugIndex.xml", "LexicalIndex.xml"):
                shutil.copy2(
                    source_chirho / "hebrew-lexicon-chirho" / name_chirho,
                    target_chirho / "hebrew-lexicon-chirho",
                )
            path_chirho = target_chirho / "hebrew-lexicon-chirho/LexicalIndex.xml"
            path_chirho.write_bytes(
                path_chirho.read_bytes().replace(b"melody", b"poison")
            )
            with self_chirho.assertRaisesRegex(ValueError, "bytes changed"):
                icon_lexicon_chirho.lexical_meaning_chirho(
                    root_chirho, {"lemma_id_chirho": "H4210"}
                )

    def test_missing_or_other_language_meaning_is_not_invented_chirho(self_chirho):
        for id_chirho in ("H3651", "G1424"):
            with self_chirho.assertRaises(ValueError):
                icon_lexicon_chirho.lexical_meaning_chirho(
                    ROOT_CHIRHO, {"lemma_id_chirho": id_chirho}
                )

    def test_review_or_plan_cannot_change_dictionary_identity_or_meaning_chirho(
        self_chirho,
    ):
        planned_chirho = {"lemma_id_chirho": "H4427", "lemma_augment_chirho": "b"}
        planned_chirho.update(
            icon_lexicon_chirho.lexical_meaning_chirho(ROOT_CHIRHO, planned_chirho)
        )
        icon_lexicon_chirho.validate_lexical_chirho(
            ROOT_CHIRHO, planned_chirho, planned_chirho
        )
        for field_chirho, value_chirho in (
            ("general_meaning_chirho", "reign"),
            ("meaning_evidence_chirho", {}),
        ):
            changed_chirho = copy.deepcopy(planned_chirho)
            changed_chirho[field_chirho] = value_chirho
            with self_chirho.assertRaises(ValueError):
                icon_lexicon_chirho.validate_lexical_chirho(
                    ROOT_CHIRHO, planned_chirho, changed_chirho
                )
            with self_chirho.assertRaises(ValueError):
                icon_lexicon_chirho.validate_lexical_chirho(
                    ROOT_CHIRHO, changed_chirho, changed_chirho
                )


if __name__ == "__main__":
    unittest.main()
