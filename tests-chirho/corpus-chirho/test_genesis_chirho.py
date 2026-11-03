# For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life. — John 3:16 (KJV)
"""Genesis: rebuilt a second way, KJV verse numbers carried, GBT join rules proven both ways."""

from __future__ import annotations

import re
import unittest

import support_chirho
from corpus_tokens_chirho import TokenErrorChirho, reading_fields_chirho
from oshb_book_chirho import BookFormatErrorChirho, SourceWordChirho, parse_verse_chirho
from source_files_chirho import read_verified_bytes_chirho

STATIC_CHIRHO = support_chirho.REPO_ROOT_CHIRHO / "static" / "content-chirho" / "genesis-chirho"
SNOW_CHIRHO = '<w lemma="7950" morph="HNcmsa" id="20aaa">שֶׁ֤לֶג</w>'


def genesis_records_chirho() -> list[dict]:
    manifest_chirho = support_chirho.output_json_chirho(STATIC_CHIRHO / "manifest-chirho.json")
    return [
        verse
        for chapter in manifest_chirho["chapters_chirho"]
        for verse in support_chirho.output_json_chirho(
            STATIC_CHIRHO / chapter["path_chirho"].rsplit("/", 1)[1]
        )["verses_chirho"]
    ]


def tokens_by_id_chirho() -> dict[str, dict]:
    return {
        token["id_chirho"]: token
        for record in genesis_records_chirho()
        for token in record["tokens_chirho"]
    }


class GenesisTextTestChirho(unittest.TestCase):
    def test_every_verse_equals_a_regex_reconstruction_chirho(self) -> None:
        raw_chirho = read_verified_bytes_chirho(
            support_chirho.corpus_pinned_chirho()["oshb-gen-chirho"]
        ).decode("utf-8")
        raw_verses_chirho = re.findall(
            r'<verse osisID="([^"]+)">(.*?)</verse>', raw_chirho, re.DOTALL
        )
        records_chirho = {record["id_chirho"]: record for record in genesis_records_chirho()}
        self.assertEqual(len(raw_verses_chirho), 1533)
        self.assertEqual(set(records_chirho), {osis for osis, _ in raw_verses_chirho})
        for osis_chirho, body_chirho in raw_verses_chirho:
            text_chirho = re.sub(r"<note\b.*?</note>", "", body_chirho, flags=re.DOTALL)
            text_chirho = re.sub(r'<seg type="x-(?:pe|samekh)">.</seg>', "", text_chirho)
            text_chirho = " ".join(re.sub(r"<[^>]+>", "", text_chirho).replace("/", "").split())
            self.assertEqual(
                records_chirho[osis_chirho]["canonical_text_chirho"], text_chirho, osis_chirho
            )

    def test_kjv_verse_numbers_travel_with_verses_and_jobs_chirho(self) -> None:
        kjv_chirho = {
            record["id_chirho"]: record["kjv_verse_id_chirho"]
            for record in genesis_records_chirho()
            if "kjv_verse_id_chirho" in record
        }
        self.assertEqual(len(kjv_chirho), 33)
        self.assertEqual(kjv_chirho["Gen.32.1"], "Gen.31.55")
        self.assertEqual(kjv_chirho["Gen.32.33"], "Gen.32.32")
        jobs_chirho = support_chirho.output_json_chirho(
            support_chirho.CORPUS_DIR_CHIRHO / "genesis-image-jobs-chirho.json"
        )["jobs_chirho"]
        self.assertEqual(len(jobs_chirho), 1533)
        self.assertEqual(
            {
                job["id_chirho"]: job["kjv_verse_id_chirho"]
                for job in jobs_chirho
                if "kjv_verse_id_chirho" in job
            },
            kjv_chirho,
        )
        self.assertEqual(
            {job["content_path_chirho"] for job in jobs_chirho},
            {
                f"/content-chirho/genesis-chirho/chapter-{number:02d}-chirho.json"
                for number in range(1, 51)
            },
        )
        manifest_chirho = support_chirho.output_json_chirho(STATIC_CHIRHO / "manifest-chirho.json")
        self.assertEqual(manifest_chirho["reader_state_chirho"], "local_reader")
        self.assertNotIn("staged_chirho", manifest_chirho)


class GenesisGlossRulesTestChirho(unittest.TestCase):
    def test_hebrew_32_1_takes_the_gbt_gloss_of_english_31_55_chirho(self) -> None:
        verse_chirho = next(
            record for record in genesis_records_chirho() if record["id_chirho"] == "Gen.32.1"
        )
        self.assertEqual(verse_chirho["tokens_chirho"][1]["gloss_chirho"], "Laban")

    def test_qadma_is_read_as_pashta_only_for_comparison_chirho(self) -> None:
        # Tokens keep OSHB's U+05A8; none is withheld for a text mismatch outside the known verses.
        qadma_chirho = [
            (record["id_chirho"], token)
            for record in genesis_records_chirho()
            for token in record["tokens_chirho"]
            if "\u05a8" in token["text_chirho"]
        ]
        self.assertGreater(len(qadma_chirho), 700)
        mismatched_chirho = {
            verse_id
            for verse_id, token in qadma_chirho
            if token["gloss_chirho"] is None and "does not match" in token["source_note_chirho"]
        }
        self.assertLessEqual(mismatched_chirho, {"Gen.35.22", "Gen.4.22"})
        self.assertGreater(sum(token["gloss_chirho"] is not None for _, token in qadma_chirho), 700)

    def test_joined_names_gloss_the_first_word_and_say_so_on_the_next_chirho(self) -> None:
        tokens_chirho = list(tokens_by_id_chirho().values())
        joined_chirho = [
            (first, second)
            for first, second in zip(tokens_chirho, tokens_chirho[1:])
            if first["raw_lemma_chirho"].endswith("+") and first["gloss_chirho"] is not None
        ]
        self.assertEqual(len(joined_chirho), 60)
        for first_chirho, second_chirho in joined_chirho:
            self.assertIn("and the next as one name", first_chirho["source_note_chirho"])
            self.assertIsNone(second_chirho["gloss_chirho"])
            self.assertIn("with the previous one as one name", second_chirho["source_note_chirho"])

    def test_unprovable_words_are_withheld_with_their_reason_chirho(self) -> None:
        withheld_chirho = {}
        for record_chirho in genesis_records_chirho():
            for token_chirho in record_chirho["tokens_chirho"]:
                if (
                    token_chirho["gloss_chirho"] is None
                    and "previous one as one name" not in token_chirho["source_note_chirho"]
                ):
                    withheld_chirho.setdefault(record_chirho["id_chirho"], []).append(
                        token_chirho["source_note_chirho"]
                    )
        self.assertEqual(sorted(withheld_chirho), ["Gen.31.47", "Gen.35.22", "Gen.4.22"])
        self.assertEqual(len(withheld_chirho["Gen.31.47"]), 9)
        self.assertTrue(
            all("different number of words" in note for note in withheld_chirho["Gen.31.47"])
        )
        self.assertEqual(len(withheld_chirho["Gen.35.22"]), 4)
        self.assertTrue(
            all(
                "does not match" in note
                for note in withheld_chirho["Gen.35.22"] + withheld_chirho["Gen.4.22"]
            )
        )


class GenesisRefusalTestChirho(unittest.TestCase):
    def refused_chirho(self, inner_chirho: str, fragment_chirho: str) -> None:
        with self.assertRaisesRegex(BookFormatErrorChirho, fragment_chirho):
            parse_verse_chirho(support_chirho.synthetic_verse_chirho(inner_chirho), 1, 1)

    def test_new_note_shapes_are_read_chirho(self) -> None:
        verse_chirho = parse_verse_chirho(
            support_chirho.synthetic_verse_chirho(
                f"<note>KJV:Prov.1.2</note>{SNOW_CHIRHO}"
                '<note type="alternative"><catchWord>שֶׁ֤לֶג</catchWord><rdg type="x-accent">שֶׁ֣לֶג</rdg></note>'
                '<note type="exegesis">WLC divides it as <rdg>שֶׁ/לֶג</rdg>.</note>'
            ),
            1,
            1,
        )
        self.assertEqual(
            [(note.kind_chirho, note.text_chirho) for note in verse_chirho.notes_chirho],
            [
                ("versification", "Prov.1.2"),
                ("alternative_accent", "שֶׁ֣לֶג"),
                ("exegesis", "WLC divides it as שֶׁ/לֶג."),
            ],
        )

    def test_malformed_new_notes_are_refused_chirho(self) -> None:
        self.refused_chirho(f"{SNOW_CHIRHO}<note>KJV:Gen.31</note>", "plain note")
        self.refused_chirho(f"{SNOW_CHIRHO}<note>see elsewhere</note>", "plain note")
        self.refused_chirho(
            f'{SNOW_CHIRHO}<note type="alternative"><catchWord>שלג</catchWord><rdg type="x-accent">x</rdg></note>',
            "does not match word",
        )
        self.refused_chirho(
            f'{SNOW_CHIRHO}<note type="exegesis">see <hi>this</hi></note>', "exegesis note"
        )

    def test_a_plus_lemma_on_a_prefix_is_refused_chirho(self) -> None:
        word_chirho = SourceWordChirho("20zzz", "בְּ/שֶׁ֤לֶג", "b+/7950", "HR/Ncmsa", None, ())
        with self.assertRaisesRegex(TokenErrorChirho, r"b\+"):
            reading_fields_chirho(word_chirho, support_chirho.lexicon_chirho())


if __name__ == "__main__":
    unittest.main()
