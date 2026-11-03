# For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life. — John 3:16 (KJV)
"""Verb forms come from OSHB's conjugation letter; local codes only where they fit exactly."""

from __future__ import annotations

import re
import unittest
from collections import Counter

import support_chirho
from corpus_morphology_chirho import (
    CONJUGATIONS_CHIRHO,
    corpus_fields_chirho,
    decode_corpus_word_chirho,
)
from corpus_tokens_chirho import reading_fields_chirho
from morphology_chirho import MorphologyErrorChirho
from oshb_book_chirho import SourceWordChirho


def fields_chirho(morph_chirho: str) -> dict[str, str]:
    return corpus_fields_chirho(decode_corpus_word_chirho(morph_chirho))


class VerbMappingTestChirho(unittest.TestCase):
    def test_codes_constructions_and_forms_chirho(self) -> None:
        # morph -> (verb_form, local code or None, construction or None)
        cases_chirho = {
            "HVqp3ms": ("qatal", "1P", None),
            "HC/Vqp3ms": ("qatal", "1P", "qatal_copulative"),
            "HC/Vqq3ms": ("weqatal", None, None),
            "HVqi3ms": ("yiqtol", "1I", None),
            "HC/Vqi3ms": ("yiqtol", "1I", "weyiqtol"),
            "HC/Vqw3ms": ("wayyiqtol", None, None),
            "HVqj3ms": ("jussive", None, None),
            "HC/Vqj3ms": ("jussive", None, None),
            "HVqh1cs": ("cohortative", None, None),
            "HVqv2ms": ("imperative", "1M", None),
            "HVqrmsa": ("participle_active", "1A", None),
            "HVqsmsa": ("participle_passive", "1A", None),
            "HR/Vqc": ("infinitive_construct", "1C", None),
            "HVqa": ("infinitive_absolute", "1B", None),
            "HVtp3ms": ("qatal", "7P", None),
            "HVormsa": ("participle_active", None, None),
            "HVQp3ms": ("qatal", None, None),
        }
        for morph_chirho, (form_chirho, code_chirho, construction_chirho) in cases_chirho.items():
            with self.subTest(morph_chirho):
                result_chirho = fields_chirho(morph_chirho)
                self.assertEqual(result_chirho["verb_form_chirho"], form_chirho)
                self.assertEqual(result_chirho.get("verb_code_chirho"), code_chirho)
                self.assertEqual(result_chirho.get("verb_construction_chirho"), construction_chirho)

    def test_no_form_is_read_from_a_waw_letter_chirho(self) -> None:
        # Spelled with an initial waw but parsed without a conjunction segment: no construction.
        waw_spelling_chirho = SourceWordChirho("20zzz", "וְיִצְפֹּ֣ן", "6845", "HVqi3ms", None, ())
        fields_from_text_chirho, _ = reading_fields_chirho(
            waw_spelling_chirho, support_chirho.lexicon_chirho()
        )
        self.assertNotIn("verb_construction_chirho", fields_from_text_chirho)
        self.assertEqual(fields_from_text_chirho["verb_form_chirho"], "yiqtol")

    def test_categories_follow_the_slot_rules_chirho(self) -> None:
        self.assertEqual(
            [
                fields_chirho("HVqrfpc")[key]
                for key in ("gender_chirho", "number_chirho", "state_chirho")
            ],
            ["feminine", "plural", "construct"],
        )
        self.assertEqual(
            [
                fields_chirho("HVqc")[key]
                for key in ("gender_chirho", "number_chirho", "state_chirho")
            ],
            ["na", "na", "na"],
        )
        self.assertEqual(
            [
                fields_chirho("HVqp1cs")[key]
                for key in ("gender_chirho", "number_chirho", "state_chirho")
            ],
            ["common", "singular", "na"],
        )
        self.assertEqual(fields_chirho("HVQp3ms")["verb_stem_chirho"], "qal passive")

    def test_undefined_letters_are_refused_chirho(self) -> None:
        for morph_chirho in ("HVXp3ms", "HVqZ3ms", "HVqp3xs9", "AVqp3ms", "HVqp3bs"):
            with self.subTest(morph_chirho), self.assertRaises(MorphologyErrorChirho):
                fields_chirho(morph_chirho)

    def test_corpus_forms_match_the_raw_conjugation_letters_chirho(self) -> None:
        # Count main-line head conjugation letters straight from the morph attributes.
        main_line_chirho = re.sub(
            r"<note\b.*?</note>", "", support_chirho.prov_text_chirho(), flags=re.DOTALL
        )
        expected_chirho: Counter = Counter()
        for morph_chirho in re.findall(r'morph="([^"]+)"', main_line_chirho):
            head_chirho = [
                code for code in morph_chirho[1:].split("/") if not code.startswith("S")
            ][-1]
            if head_chirho.startswith("V"):
                expected_chirho[CONJUGATIONS_CHIRHO[head_chirho[2]][0]] += 1
        actual_chirho = Counter(
            token["verb_form_chirho"]
            for record in support_chirho.verse_records_chirho()
            for token in record["tokens_chirho"]
            if token["pos_chirho"] == "verb"
        )
        self.assertEqual(actual_chirho, expected_chirho)


if __name__ == "__main__":
    unittest.main()
