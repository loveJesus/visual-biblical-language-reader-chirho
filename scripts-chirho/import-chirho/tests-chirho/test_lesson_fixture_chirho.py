# For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life. — John 3:16 (KJV)
"""The real Proverbs 26:1 lesson: exact source text, spans, handoff facts, roots and attribution."""

from __future__ import annotations

import copy
import hashlib
import json
import re
import unicodedata
import unittest
from collections import Counter

import support_chirho
from import_lesson_chirho import (
    CurationErrorChirho,
    build_outputs_chirho,
    build_word_chirho,
    load_curation_chirho,
)
from oshb_verse_chirho import utf16_slice_chirho


class LessonFixtureTestsChirho(unittest.TestCase):
    @classmethod
    def setUpClass(cls) -> None:
        cls.outputs_chirho = build_outputs_chirho()
        by_name_chirho = {
            path_chirho.name: data_chirho for path_chirho, data_chirho in cls.outputs_chirho.items()
        }
        cls.lesson_chirho = json.loads(by_name_chirho["proverbs-26-1-chirho.json"])
        cls.extract_chirho = json.loads(by_name_chirho["prov-26-1-extract-chirho.json"])
        cls.curation_bytes_chirho = support_chirho.CURATION_FILE_CHIRHO.read_bytes()
        cls.curation_chirho = load_curation_chirho(cls.curation_bytes_chirho)
        cls.tokens_chirho = cls.lesson_chirho["tokens_chirho"]

    def test_committed_files_match_a_fresh_import_chirho(self) -> None:
        for path_chirho, data_chirho in self.outputs_chirho.items():
            with self.subTest(path_chirho.name):
                self.assertEqual(path_chirho.read_bytes(), data_chirho)

    def test_canonical_text_is_the_source_verse_exactly_chirho(self) -> None:
        raw_chirho = support_chirho.pinned_bytes_chirho()["oshb-prov-chirho"].decode("utf-8")
        body_chirho = re.search(
            r'<verse osisID="Prov\.26\.1">(.*?)</verse>', raw_chirho, re.DOTALL
        ).group(1)
        rebuilt_chirho = re.sub(
            r"\s+", " ", re.sub(r"<[^>]+>", "", body_chirho).replace("/", "")
        ).strip()
        self.assertEqual(self.lesson_chirho["canonical_text_chirho"], rebuilt_chirho)

    def test_spans_segments_and_gaps_rebuild_the_verse_chirho(self) -> None:
        canonical_chirho = self.lesson_chirho["canonical_text_chirho"]
        covered_chirho = []
        for token_chirho in self.tokens_chirho:
            start_chirho, end_chirho = token_chirho["start_chirho"], token_chirho["end_chirho"]
            self.assertEqual(
                utf16_slice_chirho(canonical_chirho, start_chirho, end_chirho),
                token_chirho["text_chirho"],
            )
            self.assertEqual("".join(token_chirho["segments_chirho"]), token_chirho["text_chirho"])
            for segment_chirho in token_chirho["segments_chirho"]:
                self.assertFalse(
                    unicodedata.category(segment_chirho[0]).startswith("M"), segment_chirho
                )
            covered_chirho.append((start_chirho, end_chirho))
        for mark_chirho in self.extract_chirho["punctuation_chirho"]:
            self.assertEqual(
                utf16_slice_chirho(
                    canonical_chirho, mark_chirho["start_chirho"], mark_chirho["end_chirho"]
                ),
                mark_chirho["text_chirho"],
            )
            covered_chirho.append((mark_chirho["start_chirho"], mark_chirho["end_chirho"]))
        position_chirho, gaps_chirho = 0, ""
        for start_chirho, end_chirho in sorted(covered_chirho):
            self.assertGreaterEqual(start_chirho, position_chirho, "spans overlap")
            gaps_chirho += utf16_slice_chirho(canonical_chirho, position_chirho, start_chirho)
            position_chirho = end_chirho
        self.assertEqual(position_chirho, len(canonical_chirho.encode("utf-16-le")) // 2)
        self.assertEqual(set(gaps_chirho), {" "})

    def test_handoff_copies_are_exact_and_the_paste_is_only_equivalent_chirho(self) -> None:
        self.assertEqual(
            self.curation_chirho["handoff_text_chirho"], support_chirho.handoff_line_chirho(58)
        )
        self.assertEqual(
            self.lesson_chirho["translation_chirho"], support_chirho.handoff_line_chirho(61)
        )
        canonical_chirho = self.lesson_chirho["canonical_text_chirho"]
        pasted_chirho = support_chirho.handoff_line_chirho(58)
        self.assertEqual(
            unicodedata.normalize("NFD", canonical_chirho),
            unicodedata.normalize("NFD", pasted_chirho),
        )
        comparison_chirho = self.extract_chirho["handoff_comparison_chirho"]
        self.assertEqual(comparison_chirho["byte_exact_chirho"], canonical_chirho == pasted_chirho)
        self.assertEqual(comparison_chirho["kept_chirho"], "source")
        if not comparison_chirho["byte_exact_chirho"]:
            self.assertTrue(comparison_chirho["differences_chirho"])

    def test_morphology_facts_match_the_handoff_chirho(self) -> None:
        def count_chirho(key_chirho: str) -> Counter:
            return Counter(token_chirho[key_chirho] for token_chirho in self.tokens_chirho)

        self.assertEqual(len(self.tokens_chirho), 9)
        self.assertEqual(count_chirho("pos_chirho"), Counter(noun=5, adjective=2, particle=2))
        self.assertEqual(count_chirho("gender_chirho"), Counter(masculine=6, common=1, na=2))
        self.assertEqual(count_chirho("number_chirho"), Counter(singular=7, na=2))
        noun_states_chirho = {
            t_chirho["state_chirho"]
            for t_chirho in self.tokens_chirho
            if t_chirho["pos_chirho"] == "noun"
        }
        self.assertEqual(noun_states_chirho, {"absolute"})

    def test_root_states_are_truthful_chirho(self) -> None:
        by_lemma_chirho = {
            token_chirho["lemma_id_chirho"]
            + (token_chirho["lemma_augment_chirho"] or ""): token_chirho
            for token_chirho in self.tokens_chirho
        }
        for token_chirho in self.tokens_chirho:
            traditional_chirho = token_chirho["root_status_chirho"] == "traditional"
            self.assertIn(
                token_chirho["root_status_chirho"], {"traditional", "unresolved", "not_applicable"}
            )
            self.assertEqual(token_chirho["root_text_chirho"] is not None, traditional_chirho)
            self.assertEqual(token_chirho["root_entry_id_chirho"] is not None, traditional_chirho)
        self.assertEqual(by_lemma_chirho["H5000"]["root_status_chirho"], "unresolved")
        self.assertEqual(by_lemma_chirho["H3808"]["root_status_chirho"], "not_applicable")
        self.assertEqual(by_lemma_chirho["H3651c"]["root_status_chirho"], "unresolved")
        self.assertEqual(by_lemma_chirho["H7950"]["root_entry_id_chirho"], "H7949")

    def test_curated_root_that_the_sources_contradict_is_refused_chirho(self) -> None:
        words_chirho = {
            word_chirho.oshb_id_chirho: word_chirho
            for word_chirho in support_chirho.real_verse_chirho().words_chirho
        }
        contradictions_chirho = {
            "20wMm": ("traditional", "H4998"),
            "20DYG": ("unresolved", None),
            "20ikj": ("unresolved", None),
            "20baH": ("traditional", "H3559"),
        }
        for word_id_chirho, (status_chirho, entry_chirho) in contradictions_chirho.items():
            curated_chirho = copy.deepcopy(self.curation_chirho["tokens_chirho"][word_id_chirho])
            curated_chirho.update(
                root_status_chirho=status_chirho, root_entry_id_chirho=entry_chirho
            )
            with self.subTest(word_id_chirho), self.assertRaises(CurationErrorChirho):
                build_word_chirho(
                    words_chirho[word_id_chirho], curated_chirho, *support_chirho.lexicons_chirho()
                )

    def test_malformed_curation_is_refused_chirho(self) -> None:
        original_chirho = json.loads(self.curation_bytes_chirho)
        typo_chirho = copy.deepcopy(original_chirho)
        typo_chirho["tokens_chirho"]["20ikj"]["root_stauts_chirho"] = typo_chirho["tokens_chirho"][
            "20ikj"
        ].pop("root_status_chirho")
        blank_chirho = copy.deepcopy(original_chirho)
        blank_chirho["tokens_chirho"]["20ikj"]["gloss_chirho"] = " "
        path_chirho = copy.deepcopy(original_chirho)
        path_chirho["lesson_file_chirho"] = "../escape-chirho.json"
        for label_chirho, bad_chirho in (
            ("typo", typo_chirho),
            ("blank", blank_chirho),
            ("path", path_chirho),
        ):
            with self.subTest(label_chirho), self.assertRaises(CurationErrorChirho):
                load_curation_chirho(json.dumps(bad_chirho).encode("utf-8"))

    def test_sources_are_pinned_and_attributed_as_required_chirho(self) -> None:
        license_chirho = (
            support_chirho.SOURCES_DIR_CHIRHO / "morphhb-chirho/LICENSE.md"
        ).read_text(encoding="utf-8")
        required_chirho = re.search(
            r'attribute the work as follows: "([^"]+)"', license_chirho
        ).group(1)
        sources_chirho = self.lesson_chirho["sources_chirho"]
        prov_chirho = next(
            source_chirho
            for source_chirho in sources_chirho
            if source_chirho["id_chirho"] == "oshb-prov-chirho"
        )
        self.assertTrue(prov_chirho["attribution_chirho"].startswith(required_chirho))
        pinned_chirho = support_chirho.load_manifest_chirho(support_chirho.SOURCES_DIR_CHIRHO)
        for source_chirho in sources_chirho:
            with self.subTest(source_chirho["id_chirho"]):
                if source_chirho["url_chirho"] is None:
                    self.assertEqual(
                        source_chirho["sha256_chirho"],
                        hashlib.sha256(self.curation_bytes_chirho).hexdigest(),
                    )
                    continue
                entry_chirho = pinned_chirho[source_chirho["id_chirho"]]
                self.assertTrue(source_chirho["url_chirho"].startswith("https://github.com/"))
                self.assertIn(source_chirho["revision_chirho"], source_chirho["url_chirho"])
                self.assertEqual(source_chirho["sha256_chirho"], entry_chirho.sha256_chirho)
                self.assertIn("No endorsement is implied.", source_chirho["attribution_chirho"])


if __name__ == "__main__":
    unittest.main()
