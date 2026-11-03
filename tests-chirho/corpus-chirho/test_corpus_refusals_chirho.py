# For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life. — John 3:16 (KJV)
"""Targeted malformed input: structures the corpus does not handle are refused, never skipped."""

from __future__ import annotations

import unittest

import support_chirho
from corpus_tokens_chirho import TokenErrorChirho, reading_fields_chirho
from oshb_book_chirho import BookFormatErrorChirho, SourceWordChirho, parse_verse_chirho

SNOW_CHIRHO = '<w lemma="7950" morph="HNcmsa" id="20aaa">שֶׁ֤לֶג</w>'
SOF_PASUQ_CHIRHO = '<seg type="x-sof-pasuq">׃</seg>'
KETIV_CHIRHO = '<w type="x-ketiv" lemma="7950" morph="HNcmsa" id="20kkk">שלג</w>'
QERE_CHIRHO = (
    '<note type="variant"><catchWord>שלג</catchWord><rdg type="x-qere">'
    '<w lemma="7950" morph="HNcmsa" id="20qqq">שֶׁ֤לֶג</w></rdg></note>'
)


def word_chirho(text_chirho: str, lemma_chirho: str, morph_chirho: str, id_chirho: str = "20zzz"):
    return SourceWordChirho(id_chirho, text_chirho, lemma_chirho, morph_chirho, None, ())


class VerseRefusalTestChirho(unittest.TestCase):
    def refused_chirho(self, inner_chirho: str, fragment_chirho: str) -> None:
        with self.assertRaisesRegex(BookFormatErrorChirho, fragment_chirho):
            parse_verse_chirho(support_chirho.synthetic_verse_chirho(inner_chirho), 1, 1)

    def test_supported_shapes_are_accepted_chirho(self) -> None:
        verse_chirho = parse_verse_chirho(
            support_chirho.synthetic_verse_chirho(
                f'{SNOW_CHIRHO}\n<seg type="x-paseq">׀</seg>\n{KETIV_CHIRHO}{QERE_CHIRHO}'
                f'<note n="U">Editorial.</note>{SOF_PASUQ_CHIRHO}\n<seg type="x-pe">פ</seg>'
            ),
            1,
            1,
        )
        self.assertEqual(verse_chirho.canonical_text_chirho, "שֶׁ֤לֶג ׀ שלג׃")
        self.assertEqual(
            [word.qere_chirho[0].id_chirho for word in verse_chirho.words_chirho[1:]], ["20qqq"]
        )
        self.assertEqual(
            [
                (note.kind_chirho, note.after_token_id_chirho, note.anchor_chirho)
                for note in verse_chirho.notes_chirho
            ],
            [("editorial", "20kkk", "variant"), ("paragraph", "20kkk", "sof_pasuq")],
        )

    def test_unknown_seg_type_is_refused_chirho(self) -> None:
        self.refused_chirho(f'{SNOW_CHIRHO}<seg type="x-reversednun">׆</seg>', "unsupported <seg>")

    def test_ketiv_without_its_qere_is_refused_chirho(self) -> None:
        self.refused_chirho(KETIV_CHIRHO + SOF_PASUQ_CHIRHO, "has no qere")
        self.refused_chirho(f"{KETIV_CHIRHO} {QERE_CHIRHO}", "space between ketiv and qere")

    def test_catch_word_must_equal_the_ketiv_chirho(self) -> None:
        self.refused_chirho(
            KETIV_CHIRHO + QERE_CHIRHO.replace("<catchWord>שלג", "<catchWord>שלך"), "catchWord"
        )

    def test_variant_note_without_a_ketiv_is_refused_chirho(self) -> None:
        self.refused_chirho(SNOW_CHIRHO + QERE_CHIRHO, "unsupported <note>")

    def test_editorial_note_with_markup_is_refused_chirho(self) -> None:
        self.refused_chirho(f'{SNOW_CHIRHO}<note n="U">text <hi>bold</hi></note>', "editorial note")

    def test_whitespace_before_maqqef_is_refused_chirho(self) -> None:
        self.refused_chirho(
            f'{SNOW_CHIRHO} <seg type="x-maqqef">־</seg>{SNOW_CHIRHO}', "whitespace before"
        )

    def test_unknown_word_attribute_is_refused_chirho(self) -> None:
        self.refused_chirho(
            SNOW_CHIRHO.replace('id="20aaa"', 'id="20aaa" type="x-other"'), "<w> with attributes"
        )

    def test_punctuation_before_any_word_is_refused_chirho(self) -> None:
        self.refused_chirho(f'<seg type="x-paseq">׀</seg> {SNOW_CHIRHO}', "before any word")

    def test_segment_starting_on_a_mark_is_refused_chirho(self) -> None:
        self.refused_chirho(SNOW_CHIRHO.replace("שֶׁ֤לֶג", "ש/ֶׁ֤לֶג"), "start on a base letter")

    def test_loose_text_is_refused_chirho(self) -> None:
        self.refused_chirho(f"{SNOW_CHIRHO} stray", "loose text")


class TokenRefusalTestChirho(unittest.TestCase):
    def test_lemma_must_cover_the_morphology_chirho(self) -> None:
        with self.assertRaisesRegex(TokenErrorChirho, "does not cover"):
            reading_fields_chirho(
                word_chirho("שֶׁ֤לֶג", "c/7950", "HNcmsa"), support_chirho.lexicon_chirho()
            )

    def test_prefix_lemma_must_sit_on_its_own_segment_chirho(self) -> None:
        with self.assertRaisesRegex(TokenErrorChirho, "sits on"):
            reading_fields_chirho(
                word_chirho("כְּ/שֶׁ֤לֶג", "c/7950", "HR/Ncmsa"), support_chirho.lexicon_chirho()
            )

    def test_the_known_exception_matches_only_its_exact_word_chirho(self) -> None:
        # Prov 23:24's b/8055 on HR/Sp3ms is allowed for word 208VV alone.
        fields_chirho, _ = reading_fields_chirho(
            word_chirho("בּֽ/וֹ", "b/8055", "HR/Sp3ms", "208VV"), support_chirho.lexicon_chirho()
        )
        self.assertEqual(fields_chirho["lemma_id_chirho"], "oshb:b")
        with self.assertRaisesRegex(TokenErrorChirho, "does not cover"):
            reading_fields_chirho(
                word_chirho("בּֽ/וֹ", "b/8055", "HR/Sp3ms", "20zzz"), support_chirho.lexicon_chirho()
            )

    def test_text_and_morphology_segments_must_line_up_chirho(self) -> None:
        with self.assertRaisesRegex(TokenErrorChirho, "text segments"):
            reading_fields_chirho(
                word_chirho("כְּשֶׁ֤לֶג", "k/7950", "HR/Ncmsa"), support_chirho.lexicon_chirho()
            )


if __name__ == "__main__":
    unittest.main()
