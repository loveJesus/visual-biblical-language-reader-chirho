# For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life. — John 3:16 (KJV)
"""The GBT join withholds what it cannot prove; the artwork inventories account for every verse
and word exactly once."""

from __future__ import annotations

import json
import re
import unittest

import support_chirho
from gbt_glosses_chirho import GlossJoinErrorChirho, join_glosses_chirho

GLOSS_FIXTURE_CHIRHO = (
    support_chirho.REPO_ROOT_CHIRHO
    / "data-chirho"
    / "glosses-chirho"
    / "proverbs-26-1-glosses-chirho.json"
)


class GlossJoinTestChirho(unittest.TestCase):
    def join_chirho(self, source_words_chirho, english_chirho):
        return join_glosses_chirho(
            "Prov", support_chirho.book_verses_chirho(), source_words_chirho, english_chirho
        )

    def test_pinned_export_glosses_every_word_chirho(self) -> None:
        result_chirho = self.join_chirho(*support_chirho.gbt_files_chirho())
        self.assertEqual(
            dict(result_chirho.outcomes_chirho),
            {"glossed_word": 6846, "glossed_ketiv": 69, "glossed_qere": 69, "paragraph": 52},
        )

    def test_a_changed_vowel_withholds_that_word_only_chirho(self) -> None:
        source_words_chirho, english_chirho = support_chirho.gbt_files_chirho()
        word_chirho = source_words_chirho["20026001"][1]
        word_chirho["text"] = word_chirho["text"].replace("ַ", "ָ", 1)
        result_chirho = self.join_chirho(source_words_chirho, english_chirho)
        self.assertIsNone(result_chirho.glosses_chirho["20Yxf"][0])
        self.assertIn("does not match", result_chirho.glosses_chirho["20Yxf"][1])
        self.assertEqual(result_chirho.glosses_chirho["20ikj"][0], "As snow")

    def test_a_missing_boundary_withholds_that_word_chirho(self) -> None:
        source_words_chirho, english_chirho = support_chirho.gbt_files_chirho()
        source_words_chirho["20026001"][0]["text"] = source_words_chirho["20026001"][0][
            "text"
        ].replace(" ׀", "")
        self.assertIsNone(
            self.join_chirho(source_words_chirho, english_chirho).glosses_chirho["20ikj"][0]
        )

    def test_a_shorter_verse_withholds_the_whole_verse_chirho(self) -> None:
        source_words_chirho, english_chirho = support_chirho.gbt_files_chirho()
        source_words_chirho["20001007"].pop()
        english_chirho["20001007"].pop()
        result_chirho = self.join_chirho(source_words_chirho, english_chirho)
        self.assertEqual(result_chirho.outcomes_chirho["unmatched_verse"], 8)
        self.assertIn("different number", result_chirho.glosses_chirho["20LeN"][1])

    def test_disagreeing_gbt_files_are_refused_chirho(self) -> None:
        source_words_chirho, english_chirho = support_chirho.gbt_files_chirho()
        english_chirho["20001007"].pop()
        with self.assertRaises(GlossJoinErrorChirho):
            self.join_chirho(source_words_chirho, english_chirho)

    def test_26_1_equals_the_reviewed_bounded_fixture_chirho(self) -> None:
        fixture_chirho = json.loads(GLOSS_FIXTURE_CHIRHO.read_text(encoding="utf-8"))
        english_chirho = next(
            language
            for language in fixture_chirho["languages_chirho"]
            if language["id_chirho"] == "eng"
        )
        verse_chirho = next(
            record
            for record in support_chirho.verse_records_chirho()
            if record["id_chirho"] == "Prov.26.1"
        )
        self.assertEqual(
            [
                (token["id_chirho"], token["gloss_chirho"])
                for token in verse_chirho["tokens_chirho"]
            ],
            [
                (word["token_id_chirho"], word["gloss_chirho"])
                for word in english_chirho["words_chirho"]
            ],
        )


class InventoryTestChirho(unittest.TestCase):
    def test_one_scene_job_per_verse_chirho(self) -> None:
        jobs_chirho = support_chirho.output_json_chirho(
            support_chirho.CORPUS_DIR_CHIRHO / "proverbs-image-jobs-chirho.json"
        )["jobs_chirho"]
        records_chirho = support_chirho.verse_records_chirho()
        self.assertEqual(
            [job["id_chirho"] for job in jobs_chirho],
            [record["id_chirho"] for record in records_chirho],
        )
        self.assertEqual(
            [job["canonical_text_chirho"] for job in jobs_chirho],
            [record["canonical_text_chirho"] for record in records_chirho],
        )
        destinations_chirho = [job["destination_chirho"] for job in jobs_chirho]
        self.assertEqual(len(set(destinations_chirho)), len(jobs_chirho))
        for destination_chirho in destinations_chirho:
            self.assertRegex(
                destination_chirho,
                r"^/assets-chirho/scenes-chirho/proverbs-v1-chirho/chapter-\d{2}-chirho/prov-\d{2}-\d{3}-chirho\.webp$",
            )
        self.assertEqual(
            [job["id_chirho"] for job in jobs_chirho if job["status_chirho"] != "prepared"],
            ["Prov.26.1"],
        )

    def test_lemma_inventory_holds_every_word_once_under_its_own_key_chirho(self) -> None:
        inventory_chirho = support_chirho.output_json_chirho(
            support_chirho.CORPUS_DIR_CHIRHO / "proverbs-lemma-inventory-chirho.json"
        )
        readings_chirho = {}
        for record_chirho in support_chirho.verse_records_chirho():
            for token_chirho in record_chirho["tokens_chirho"]:
                for reading_chirho in [token_chirho, *token_chirho.get("qere_chirho", [])]:
                    readings_chirho[reading_chirho["id_chirho"]] = reading_chirho
        seen_chirho = []
        keys_chirho = [entry["lemma_key_chirho"] for entry in inventory_chirho["lemmas_chirho"]]
        self.assertEqual(len(keys_chirho), len(set(keys_chirho)))
        for entry_chirho in inventory_chirho["lemmas_chirho"]:
            self.assertFalse({key for key in entry_chirho if re.search("root|sense|meaning", key)})
            if entry_chirho["lemma_augment_chirho"]:
                self.assertIn(
                    entry_chirho["lemma_key_chirho"], entry_chirho["known_augments_chirho"]
                )
            for occurrence_chirho in entry_chirho["occurrences_chirho"]:
                reading_chirho = readings_chirho[occurrence_chirho["token_id_chirho"]]
                self.assertEqual(
                    (reading_chirho["lemma_id_chirho"], reading_chirho["lemma_augment_chirho"]),
                    (entry_chirho["lemma_id_chirho"], entry_chirho["lemma_augment_chirho"]),
                )
                self.assertEqual(occurrence_chirho["gloss_chirho"], reading_chirho["gloss_chirho"])
                seen_chirho.append(occurrence_chirho["token_id_chirho"])
        self.assertEqual(sorted(seen_chirho), sorted(readings_chirho))
        self.assertEqual(inventory_chirho["occurrence_count_chirho"], len(readings_chirho))


if __name__ == "__main__":
    unittest.main()
