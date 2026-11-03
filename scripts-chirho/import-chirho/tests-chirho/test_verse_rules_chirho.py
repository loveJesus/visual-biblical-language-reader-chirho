# For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life. — John 3:16 (KJV)
"""Verse and morphology rules, on synthetic developer XML: exact spacing, UTF-16 spans, refusals."""

from __future__ import annotations

import unittest

import support_chirho
from morphology_chirho import (
    MorphologyErrorChirho,
    decode_word_chirho,
    lesson_categories_chirho,
)
from oshb_verse_chirho import VerseStructureErrorChirho, parse_verse_chirho

MAQQEF_CHIRHO, PASEQ_CHIRHO, SOF_PASUQ_CHIRHO, PATAH_CHIRHO = "־", "׀", "׃", "ַ"


def word_chirho(text_chirho: str, word_id_chirho: str, extra_chirho: str = "") -> str:
    return f'<w lemma="1" morph="HTn" id="{word_id_chirho}"{extra_chirho}>{text_chirho}</w>'


class VerseRulesTestsChirho(unittest.TestCase):
    def test_spacing_and_punctuation_follow_the_source_chirho(self) -> None:
        inner_chirho = (
            f'\n  {word_chirho("ab", "a1")}<seg type="x-maqqef">{MAQQEF_CHIRHO}</seg>'
            f'{word_chirho("cd", "a2")}\n  <seg type="x-paseq">{PASEQ_CHIRHO}</seg>\n  '
            f'{word_chirho("e/f", "a3")}<seg type="x-sof-pasuq">{SOF_PASUQ_CHIRHO}</seg>\n'
        )
        verse_chirho = parse_verse_chirho(
            support_chirho.synthetic_verse_chirho(inner_chirho), "Test.1.1"
        )
        self.assertEqual(
            verse_chirho.canonical_text_chirho,
            f"ab{MAQQEF_CHIRHO}cd {PASEQ_CHIRHO} ef{SOF_PASUQ_CHIRHO}",
        )
        last_chirho = verse_chirho.words_chirho[2]
        self.assertEqual((last_chirho.segments_chirho, last_chirho.start_chirho), (("e", "f"), 8))
        self.assertEqual(
            [mark_chirho.after_word_chirho for mark_chirho in verse_chirho.punctuation_chirho],
            ["a1", "a2", "a3"],
        )

    def test_offsets_count_utf16_code_units_chirho(self) -> None:
        inner_chirho = f"{word_chirho(chr(0x1F600), 'a1')} {word_chirho('ab', 'a2')}"
        verse_chirho = parse_verse_chirho(
            support_chirho.synthetic_verse_chirho(inner_chirho), "Test.1.1"
        )
        self.assertEqual(
            [
                (w_chirho.start_chirho, w_chirho.end_chirho)
                for w_chirho in verse_chirho.words_chirho
            ],
            [(0, 2), (3, 5)],
        )

    def test_unsupported_markup_is_refused_chirho(self) -> None:
        cases_chirho = {
            "ketiv word": word_chirho("ab", "a1", ' type="x-ketiv"'),
            "variant note": word_chirho("ab", "a1")
            + '<note type="variant"><catchWord>ab</catchWord></note>',
            "paragraph marker": word_chirho("ab", "a1") + '<seg type="x-pe">p</seg>',
            "nested markup": '<w lemma="1" morph="HTn" id="a1">a<seg type="x-small">b</seg></w>',
            "loose text": word_chirho("ab", "a1") + " cd ",
            "segment starting on a mark": word_chirho(f"a/{PATAH_CHIRHO}b", "a1"),
            "empty segment": word_chirho("a//b", "a1"),
        }
        for label_chirho, inner_chirho in cases_chirho.items():
            with self.subTest(label_chirho), self.assertRaises(VerseStructureErrorChirho):
                parse_verse_chirho(support_chirho.synthetic_verse_chirho(inner_chirho), "Test.1.1")


class MorphologyRulesTestsChirho(unittest.TestCase):
    def test_this_verse_codes_map_to_handoff_categories_chirho(self) -> None:
        expected_chirho = {
            "HRd/Ncmsa": ("noun", "masculine", "singular", "absolute"),
            "HNcbsa": ("noun", "common", "singular", "absolute"),
            "HR/Aamsa": ("adjective", "masculine", "singular", "absolute"),
            "HTm": ("particle", "na", "na", "na"),
            "HTn": ("particle", "na", "na", "na"),
            "HNcxsa": ("noun", "unknown", "singular", "absolute"),
        }
        for code_chirho, categories_chirho in expected_chirho.items():
            with self.subTest(code_chirho):
                result_chirho = lesson_categories_chirho(decode_word_chirho(code_chirho))
                self.assertEqual(tuple(result_chirho.values()), categories_chirho)

    def test_codes_outside_the_tables_or_lesson_v1_are_refused_chirho(self) -> None:
        for code_chirho in ("HVqp3ms", "HQ", "HNcmza", "XNcmsa", "HNcmsad", "HNcfsd", "H"):
            with self.subTest(code_chirho), self.assertRaises(MorphologyErrorChirho):
                lesson_categories_chirho(decode_word_chirho(code_chirho))
        with self.assertRaises(MorphologyErrorChirho):
            lesson_categories_chirho(decode_word_chirho("HR/Sp3ms"))


if __name__ == "__main__":
    unittest.main()
