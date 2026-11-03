# For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life. — John 3:16 (KJV)
"""John from Nestle 1904: every verse rebuilt a second way, codes decoded, bad input refused."""

from __future__ import annotations

import csv
import hashlib
import io
import re
import unittest

import support_chirho
from berean_glosses_chirho import (
    BereanGlossErrorChirho,
    berean_entries_chirho,
    join_berean_chirho,
)
from greek_morphology_chirho import GreekMorphologyErrorChirho, decode_greek_chirho
from nestle_book_chirho import NestleFormatErrorChirho, read_book_chirho
from source_files_chirho import read_verified_bytes_chirho

STAGED_CHIRHO = support_chirho.CORPUS_DIR_CHIRHO / "john-chirho"
HEADER_CHIRHO = "﻿BCV\ttext\tfunc_morph\tform_morph\tstrongs\tlemma\tnormalized\r\n"
GAP_CHIRHO = re.compile(r"[ ,.·;()—]*")


def csv_bytes_chirho(*rows_chirho: str) -> bytes:
    return (HEADER_CHIRHO + "".join(f"{row}\t\r\n" for row in rows_chirho)).encode()


def john_records_chirho() -> list[dict]:
    manifest_chirho = support_chirho.output_json_chirho(STAGED_CHIRHO / "manifest-chirho.json")
    return [
        verse
        for chapter in manifest_chirho["chapters_chirho"]
        for verse in support_chirho.output_json_chirho(
            STAGED_CHIRHO / chapter["path_chirho"].rsplit("/", 1)[1]
        )["verses_chirho"]
    ]


def utf16_slice_chirho(text_chirho: str, start_chirho: int, end_chirho: int) -> str:
    return text_chirho.encode("utf-16-le")[start_chirho * 2 : end_chirho * 2].decode("utf-16-le")


class JohnTextTestChirho(unittest.TestCase):
    def test_every_verse_equals_a_csv_module_rebuild_chirho(self) -> None:
        data_chirho = read_verified_bytes_chirho(
            support_chirho.corpus_pinned_chirho()["nestle1904-morph-chirho"]
        )
        reader_chirho = csv.reader(
            io.StringIO(data_chirho.decode("utf-8-sig"), newline=""),
            delimiter="\t",
            quoting=csv.QUOTE_NONE,
        )
        expected_chirho: dict[str, list[str]] = {}
        for row_chirho in reader_chirho:
            if row_chirho and row_chirho[0].startswith("John "):
                chapter_chirho, verse_chirho = row_chirho[0][5:].split(":")
                expected_chirho.setdefault(f"John.{chapter_chirho}.{verse_chirho}", []).append(
                    row_chirho[1]
                )
        records_chirho = john_records_chirho()
        self.assertEqual(len(records_chirho), 879)
        self.assertEqual([record["id_chirho"] for record in records_chirho], list(expected_chirho))
        for record_chirho in records_chirho:
            self.assertEqual(
                record_chirho["canonical_text_chirho"],
                " ".join(expected_chirho[record_chirho["id_chirho"]]),
            )
        self.assertEqual(sum(map(len, expected_chirho.values())), 15643)

    def test_tokens_tile_the_line_with_only_punctuation_between_chirho(self) -> None:
        for record_chirho in john_records_chirho():
            line_chirho = record_chirho["canonical_text_chirho"]
            cursor_chirho = 0
            for index_chirho, token_chirho in enumerate(record_chirho["tokens_chirho"], start=1):
                self.assertEqual(
                    token_chirho["id_chirho"], f"{record_chirho['id_chirho']}!{index_chirho}"
                )
                gap_chirho = utf16_slice_chirho(
                    line_chirho, cursor_chirho, token_chirho["start_chirho"]
                )
                self.assertRegex(gap_chirho, f"^{GAP_CHIRHO.pattern}$", record_chirho["id_chirho"])
                self.assertEqual(
                    utf16_slice_chirho(
                        line_chirho, token_chirho["start_chirho"], token_chirho["end_chirho"]
                    ),
                    token_chirho["text_chirho"],
                )
                cursor_chirho = token_chirho["end_chirho"]
            tail_chirho = utf16_slice_chirho(
                line_chirho, cursor_chirho, len(line_chirho.encode("utf-16-le")) // 2
            )
            self.assertRegex(tail_chirho, f"^{GAP_CHIRHO.pattern}$")

    def test_only_the_two_multi_verse_passages_are_flagged_chirho(self) -> None:
        flagged_chirho = [
            record["id_chirho"]
            for record in john_records_chirho()
            if any(
                note["kind_chirho"] == "parenthesized_passage"
                for note in record.get("source_notes_chirho", [])
            )
        ]
        expected_chirho = ["John.5.3", "John.5.4", "John.7.53"] + [
            f"John.8.{verse}" for verse in range(1, 12)
        ]
        self.assertEqual(flagged_chirho, expected_chirho)
        jobs_chirho = support_chirho.output_json_chirho(
            support_chirho.CORPUS_DIR_CHIRHO / "john-image-jobs-chirho.json"
        )["jobs_chirho"]
        self.assertEqual(
            [job["id_chirho"] for job in jobs_chirho if "textual_note_chirho" in job],
            expected_chirho,
        )
        self.assertEqual(len({job["destination_chirho"] for job in jobs_chirho}), 879)
        self.assertEqual(
            {job["content_path_chirho"] for job in jobs_chirho},
            {
                f"/content-chirho/john-chirho/chapter-{number:02d}-chirho.json"
                for number in range(1, 22)
            },
        )

    def test_strongs_numbers_are_read_in_base_ten_with_the_raw_value_kept_chirho(self) -> None:
        tokens_chirho = [
            token for record in john_records_chirho() for token in record["tokens_chirho"]
        ]
        padded_chirho = [
            token for token in tokens_chirho if token["raw_strongs_chirho"].startswith("0")
        ]
        self.assertEqual(len(padded_chirho), 9)
        for token_chirho in padded_chirho:
            number_chirho = token_chirho["raw_strongs_chirho"].split("&")[0]
            self.assertEqual(token_chirho["lemma_id_chirho"], f"G{int(number_chirho)}")
            self.assertIn("leading zero", token_chirho["source_note_chirho"])


class GreekDecoderTestChirho(unittest.TestCase):
    def test_document_patterns_chirho(self) -> None:
        cases_chirho = {
            "V-PAI-3S": {
                "tense_chirho": "present",
                "voice_chirho": "active",
                "mood_chirho": "indicative",
                "person_chirho": "third",
                "number_chirho": "singular",
            },
            "V-2AAP-GSM": {
                "tense_chirho": "second aorist",
                "mood_chirho": "participle",
                "case_chirho": "genitive",
                "gender_chirho": "masculine",
            },
            "V-AAN": {"mood_chirho": "infinitive"},
            "T-ASN": {
                "part_of_speech_chirho": "article",
                "case_chirho": "accusative",
                "gender_chirho": "neuter",
            },
            "P-1NS-K": {"person_chirho": "first", "suffixes_chirho": ["crasis"]},
            "S-1SNSM": {
                "possessor_person_chirho": "first",
                "possessor_number_chirho": "singular",
                "case_chirho": "nominative",
            },
            "A-NSM-C": {"degree_chirho": "comparative"},
            "PRT-N": {"part_of_speech_chirho": "particle", "suffixes_chirho": ["negative"]},
            "N-PRI": {"part_of_speech_chirho": "proper noun indeclinable"},
        }
        for code_chirho, expected_chirho in cases_chirho.items():
            with self.subTest(code_chirho):
                fields_chirho = decode_greek_chirho(code_chirho)
                self.assertEqual(
                    {key: fields_chirho.get(key) for key in expected_chirho}, expected_chirho
                )

    def test_codes_outside_the_document_are_refused_chirho(self) -> None:
        # V-APS2P occurs once in the pinned file (outside John) without its hyphen.
        for code_chirho in ("V-APS2P", "V-PAI", "V-PAP-3S", "N-NSX", "Q-", "ADV-Z", "V-PAI-3S-ZZ"):
            with self.subTest(code_chirho), self.assertRaises(GreekMorphologyErrorChirho):
                decode_greek_chirho(code_chirho)


class NestleRefusalTestChirho(unittest.TestCase):
    def refused_chirho(self, data_chirho: bytes, fragment_chirho: str) -> None:
        with self.assertRaisesRegex(NestleFormatErrorChirho, fragment_chirho):
            read_book_chirho(data_chirho, "John")

    def test_well_formed_rows_are_read_chirho(self) -> None:
        verses_chirho = read_book_chirho(
            csv_bytes_chirho(
                "John 1:1\t(Ἐν\tPREP\tPREP\t1722\tἐν\tἘν",
                "John 1:1\tἀρχῇ\u0387\tN-DSF\tN-DSF\t746\tἀρχή\tἀρχῇ",
            ),
            "John",
        )
        self.assertEqual(verses_chirho[0].canonical_text_chirho, "(Ἐν ἀρχῇ\u0387")
        self.assertEqual(
            [(word.text_chirho, start, end) for word, start, end in verses_chirho[0].words_chirho],
            [("Ἐν", 1, 3), ("ἀρχῇ", 4, 8)],
        )

    def test_bad_structures_are_refused_chirho(self) -> None:
        good_chirho = "John 1:1\tἘν\tPREP\tPREP\t1722\tἐν\tἘν"
        self.refused_chirho(good_chirho.encode(), "header")
        self.refused_chirho(
            csv_bytes_chirho(good_chirho).replace(b"\r\n", b"\n"), "header or line endings"
        )
        self.refused_chirho(csv_bytes_chirho(good_chirho + "\textra"), "row shape")
        self.refused_chirho(
            csv_bytes_chirho(good_chirho, good_chirho.replace("1:1", "1:3")), "numbering"
        )
        self.refused_chirho(
            csv_bytes_chirho(good_chirho, good_chirho.replace("1:1", "1:2"), good_chirho),
            "numbering",
        )
        self.refused_chirho(
            csv_bytes_chirho(good_chirho.replace("\tἘν\t", "\tἘ;ν\t", 1)), "cannot separate"
        )
        self.refused_chirho(
            csv_bytes_chirho(good_chirho.replace("1722", "G1722")), "Strong's value"
        )
        self.refused_chirho(csv_bytes_chirho(good_chirho.replace("John", "Mark")), "no rows")


def glosses_xml_chirho(inner_chirho: str) -> bytes:
    return f"<root>{inner_chirho}</root>".encode()


ENTRY_CHIRHO = '<w word="1" sort="1" osisId="John.1.1!1"><greek>Ἐν</greek><gloss>In</gloss></w>'


class BereanJoinTestChirho(unittest.TestCase):
    def berean_chirho(self):
        entries_chirho, notes_chirho = support_chirho.berean_john_chirho()
        return dict(entries_chirho), notes_chirho

    def john_verses_chirho(self):
        return support_chirho.nestle_john_chirho()

    def test_pinned_glosses_cover_john_with_one_withheld_word_chirho(self) -> None:
        entries_chirho, notes_chirho = self.berean_chirho()
        glosses_chirho, outcomes_chirho = join_berean_chirho(
            self.john_verses_chirho(), entries_chirho
        )
        self.assertEqual(
            dict(outcomes_chirho), {"glossed": 15642, "greek_mismatch": 1, "unused_entries": 0}
        )
        self.assertEqual(glosses_chirho["John.8.10!9"][0], None)
        self.assertIn("τὴς", glosses_chirho["John.8.10!9"][1])
        self.assertEqual(
            [note[1] for note in notes_chirho],
            ["John.8.4!8", "John.8.8!3", "John.8.25!13", "John.14.13!2"],
        )

    def test_a_changed_greek_word_or_missing_entry_withholds_that_gloss_chirho(self) -> None:
        entries_chirho, _ = self.berean_chirho()
        entries_chirho["John.1.1!5"] = ("λόγος", "Word")  # lower case: no longer the Nestle word
        del entries_chirho["John.1.1!2"]
        glosses_chirho, outcomes_chirho = join_berean_chirho(
            self.john_verses_chirho(), entries_chirho
        )
        self.assertIsNone(glosses_chirho["John.1.1!5"][0])
        self.assertIn("no entry", glosses_chirho["John.1.1!2"][1])
        self.assertEqual(glosses_chirho["John.1.1!1"][0], "In [the]")
        self.assertEqual((outcomes_chirho["greek_mismatch"], outcomes_chirho["missing"]), (2, 1))

    def test_glossed_verses_cite_berean_and_never_gbt_chirho(self) -> None:
        for record_chirho in john_records_chirho():
            self.assertEqual(record_chirho["gloss_origin_chirho"], "berean_interlinear")
            source_ids_chirho = [source["id_chirho"] for source in record_chirho["sources_chirho"]]
            self.assertIn("berean-glosses-chirho", source_ids_chirho)
            self.assertFalse([source_id for source_id in source_ids_chirho if "gbt" in source_id])
            notes_chirho = [token["source_note_chirho"] for token in record_chirho["tokens_chirho"]]
            self.assertFalse([note for note in notes_chirho if "GBT approved" in note])

    def test_editor_notes_sit_on_the_words_they_precede_chirho(self) -> None:
        anchored_chirho = {
            note["before_token_id_chirho"]
            for record in john_records_chirho()
            for note in record.get("source_notes_chirho", [])
            if note["kind_chirho"] == "gloss_editor_note"
        }
        self.assertEqual(
            anchored_chirho, {"John.8.4!8", "John.8.8!3", "John.8.25!13", "John.14.13!2"}
        )

    def test_malformed_gloss_files_are_refused_chirho(self) -> None:
        cases_chirho = {
            f"<verse>{ENTRY_CHIRHO}</verse><other/>": "unexpected <other>",
            f"<verse>{ENTRY_CHIRHO}<status>note <b>x</b></status></verse>": "status",
            f"<verse>{ENTRY_CHIRHO.replace('<gloss>In</gloss>', '')}</verse>": "is not <w>",
            f"<verse>{ENTRY_CHIRHO}{ENTRY_CHIRHO}</verse>": "listed twice",
            f"<verse>{ENTRY_CHIRHO.replace('John', 'Mark')}</verse>": "no glosses",
        }
        for inner_chirho, fragment_chirho in cases_chirho.items():
            with (
                self.subTest(fragment_chirho),
                self.assertRaisesRegex(BereanGlossErrorChirho, fragment_chirho),
            ):
                berean_entries_chirho(glosses_xml_chirho(inner_chirho), "John")


class JohnLemmaInventoryTestChirho(unittest.TestCase):
    def test_every_occurrence_once_under_its_own_lemma_chirho(self) -> None:
        inventory_chirho = support_chirho.output_json_chirho(
            support_chirho.CORPUS_DIR_CHIRHO / "john-lemma-inventory-chirho.json"
        )
        tokens_chirho = {
            token["id_chirho"]: token
            for record in john_records_chirho()
            for token in record["tokens_chirho"]
        }
        keys_chirho = [entry["lemma_key_chirho"] for entry in inventory_chirho["lemmas_chirho"]]
        self.assertEqual(len(keys_chirho), len(set(keys_chirho)))
        seen_chirho = []
        for entry_chirho in inventory_chirho["lemmas_chirho"]:
            self.assertRegex(entry_chirho["lemma_id_chirho"], r"^G[1-9]\d*$")
            for occurrence_chirho in entry_chirho["occurrences_chirho"]:
                token_chirho = tokens_chirho[occurrence_chirho["token_id_chirho"]]
                self.assertEqual(token_chirho["lemma_id_chirho"], entry_chirho["lemma_id_chirho"])
                self.assertEqual(
                    token_chirho["lexical_form_chirho"], entry_chirho["lexical_form_chirho"]
                )
                self.assertEqual(
                    occurrence_chirho["source_form_chirho"], token_chirho["text_chirho"]
                )
                self.assertEqual(
                    occurrence_chirho["berean_gloss_chirho"], token_chirho["gloss_chirho"]
                )
                seen_chirho.append(occurrence_chirho["token_id_chirho"])
        self.assertEqual(sorted(seen_chirho), sorted(tokens_chirho))
        withheld_chirho = [
            occurrence["token_id_chirho"]
            for entry in inventory_chirho["lemmas_chirho"]
            for occurrence in entry["occurrences_chirho"]
            if occurrence["berean_gloss_chirho"] is None
        ]
        self.assertEqual(withheld_chirho, ["John.8.10!9"])

    def test_a_strong_number_with_two_lemmas_stays_split_chirho(self) -> None:
        inventory_chirho = support_chirho.output_json_chirho(
            support_chirho.CORPUS_DIR_CHIRHO / "john-lemma-inventory-chirho.json"
        )
        # Looked up by number: the source's Greek uses oxia accents (U+1F79), which typed
        # tonos letters would not match.
        shared_chirho: dict[str, list[list[str]]] = {}
        for entry_chirho in inventory_chirho["lemmas_chirho"]:
            if entry_chirho["shares_strong_number_chirho"]:
                self.assertEqual(
                    entry_chirho["lemma_key_chirho"],
                    f"{entry_chirho['lemma_id_chirho']}:{entry_chirho['lexical_form_chirho']}",
                )
                shared_chirho.setdefault(entry_chirho["lemma_id_chirho"], []).append(
                    entry_chirho["raw_strongs_values_chirho"]
                )
        self.assertEqual(sorted(shared_chirho["G4263"]), [["04263"], ["4263"]])
        self.assertEqual(sorted(shared_chirho), ["G2596", "G4263", "G4319", "G518", "G5621"])


class JohnStaticCopyTestChirho(unittest.TestCase):
    def test_static_chapters_equal_the_staged_ones_and_the_manifest_chirho(self) -> None:
        static_dir_chirho = (
            support_chirho.REPO_ROOT_CHIRHO / "static" / "content-chirho" / "john-chirho"
        )
        manifest_chirho = support_chirho.output_json_chirho(
            static_dir_chirho / "manifest-chirho.json"
        )
        self.assertEqual(manifest_chirho["reader_state_chirho"], "local_reader")
        self.assertNotIn("staged_chirho", manifest_chirho)
        for chapter_chirho in manifest_chirho["chapters_chirho"]:
            name_chirho = chapter_chirho["path_chirho"].rsplit("/", 1)[1]
            text_chirho = support_chirho.fresh_outputs_chirho()[static_dir_chirho / name_chirho]
            self.assertEqual(
                text_chirho, support_chirho.fresh_outputs_chirho()[STAGED_CHIRHO / name_chirho]
            )
            self.assertEqual(
                chapter_chirho["sha256_chirho"], hashlib.sha256(text_chirho.encode()).hexdigest()
            )


if __name__ == "__main__":
    unittest.main()
