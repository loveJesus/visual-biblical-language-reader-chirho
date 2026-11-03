# For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life. — John 3:16 (KJV)
"""The corpus line, spans and counts agree with the raw source read a second, independent way."""

from __future__ import annotations

import hashlib
import json
import re
import unittest
from collections import Counter

import support_chirho

LESSON_PATH_CHIRHO = (
    support_chirho.REPO_ROOT_CHIRHO / "data-chirho" / "lessons-chirho" / "proverbs-26-1-chirho.json"
)
GAP_CHIRHO = re.compile(r"[ ־׀]*")


def utf16_slice_chirho(text_chirho: str, start_chirho: int, end_chirho: int) -> str:
    return text_chirho.encode("utf-16-le")[start_chirho * 2 : end_chirho * 2].decode("utf-16-le")


class CorpusTextTestChirho(unittest.TestCase):
    def test_every_verse_equals_a_regex_reconstruction_of_the_raw_xml_chirho(self) -> None:
        # Not ElementTree: drop notes and paragraph letters, then tags, slashes, whitespace runs.
        raw_verses_chirho = re.findall(
            r'<verse osisID="([^"]+)">(.*?)</verse>', support_chirho.prov_text_chirho(), re.DOTALL
        )
        records_chirho = {
            record["id_chirho"]: record for record in support_chirho.verse_records_chirho()
        }
        self.assertEqual(len(raw_verses_chirho), 915)
        self.assertEqual(set(records_chirho), {osis_chirho for osis_chirho, _ in raw_verses_chirho})
        for osis_chirho, body_chirho in raw_verses_chirho:
            text_chirho = re.sub(r"<note\b.*?</note>", "", body_chirho, flags=re.DOTALL)
            text_chirho = re.sub(r'<seg type="x-(?:pe|samekh)">.</seg>', "", text_chirho)
            text_chirho = " ".join(re.sub(r"<[^>]+>", "", text_chirho).replace("/", "").split())
            self.assertEqual(
                records_chirho[osis_chirho]["canonical_text_chirho"], text_chirho, osis_chirho
            )

    def test_tokens_tile_the_line_in_order_chirho(self) -> None:
        for record_chirho in support_chirho.verse_records_chirho():
            line_chirho = record_chirho["canonical_text_chirho"]
            cursor_chirho = 0
            for token_chirho in record_chirho["tokens_chirho"]:
                start_chirho, end_chirho = token_chirho["start_chirho"], token_chirho["end_chirho"]
                gap_chirho = utf16_slice_chirho(line_chirho, cursor_chirho, start_chirho)
                self.assertRegex(gap_chirho, f"^{GAP_CHIRHO.pattern}$", record_chirho["id_chirho"])
                self.assertEqual(
                    utf16_slice_chirho(line_chirho, start_chirho, end_chirho),
                    token_chirho["text_chirho"],
                )
                self.assertEqual(
                    "".join(token_chirho["segments_chirho"]), token_chirho["text_chirho"]
                )
                cursor_chirho = end_chirho
            tail_chirho = utf16_slice_chirho(
                line_chirho, cursor_chirho, len(line_chirho.encode("utf-16-le")) // 2
            )
            self.assertEqual(tail_chirho, "׃", record_chirho["id_chirho"])

    def test_word_counts_and_ids_match_the_raw_source_chirho(self) -> None:
        raw_chirho = support_chirho.prov_text_chirho()
        notes_chirho = re.findall(r"<note\b.*?</note>", raw_chirho, re.DOTALL)
        in_notes_chirho = sum(note_chirho.count("<w ") for note_chirho in notes_chirho)
        tokens_chirho = [
            token
            for record in support_chirho.verse_records_chirho()
            for token in record["tokens_chirho"]
        ]
        qere_chirho = [
            reading for token in tokens_chirho for reading in token.get("qere_chirho", [])
        ]
        self.assertEqual(len(tokens_chirho), raw_chirho.count("<w ") - in_notes_chirho)
        self.assertEqual(len(qere_chirho), in_notes_chirho)
        ids_chirho = [word["id_chirho"] for word in tokens_chirho + qere_chirho]
        self.assertEqual(len(ids_chirho), len(set(ids_chirho)))
        self.assertEqual(set(ids_chirho), set(re.findall(r'<w [^>]*\bid="([^"]+)"', raw_chirho)))

    def test_manifest_lists_chapters_with_their_hashes_and_counts_chirho(self) -> None:
        manifest_chirho = support_chirho.output_json_chirho(
            support_chirho.CONTENT_DIR_CHIRHO / "manifest-chirho.json"
        )
        per_chapter_chirho = Counter(
            int(osis_chirho.split(".")[1])
            for osis_chirho in re.findall(
                r'<verse osisID="([^"]+)"', support_chirho.prov_text_chirho()
            )
        )
        chapters_chirho = manifest_chirho["chapters_chirho"]
        self.assertEqual(
            [chapter["number_chirho"] for chapter in chapters_chirho], list(range(1, 32))
        )
        for chapter_chirho in chapters_chirho:
            name_chirho = f"chapter-{chapter_chirho['number_chirho']:02d}-chirho.json"
            self.assertEqual(
                chapter_chirho["path_chirho"], f"/content-chirho/proverbs-chirho/{name_chirho}"
            )
            text_chirho = support_chirho.fresh_outputs_chirho()[
                support_chirho.CONTENT_DIR_CHIRHO / name_chirho
            ]
            self.assertEqual(
                chapter_chirho["sha256_chirho"], hashlib.sha256(text_chirho.encode()).hexdigest()
            )
            self.assertEqual(
                chapter_chirho["verse_count_chirho"],
                per_chapter_chirho[chapter_chirho["number_chirho"]],
            )
        self.assertEqual(sum(per_chapter_chirho.values()), 915)

    def test_written_files_equal_a_fresh_import_chirho(self) -> None:
        for path_chirho, text_chirho in support_chirho.fresh_outputs_chirho().items():
            self.assertEqual(path_chirho.read_text(encoding="utf-8"), text_chirho, path_chirho)

    def test_curated_26_1_agrees_with_the_corpus_chirho(self) -> None:
        # Two code paths over the same pinned file: the curated lesson importer and this corpus.
        curated_chirho = json.loads(LESSON_PATH_CHIRHO.read_text(encoding="utf-8"))
        corpus_chirho = next(
            record
            for record in support_chirho.verse_records_chirho()
            if record["id_chirho"] == "Prov.26.1"
        )
        self.assertEqual(
            corpus_chirho["canonical_text_chirho"], curated_chirho["canonical_text_chirho"]
        )
        keys_chirho = (
            "id_chirho",
            "text_chirho",
            "segments_chirho",
            "start_chirho",
            "end_chirho",
            "raw_morphology_chirho",
            "lemma_id_chirho",
            "lemma_augment_chirho",
            "lexical_form_chirho",
            "pos_chirho",
            "gender_chirho",
            "number_chirho",
            "state_chirho",
            "analysis_chirho",
        )
        self.assertEqual(
            [[token[key] for key in keys_chirho] for token in corpus_chirho["tokens_chirho"]],
            [[token[key] for key in keys_chirho] for token in curated_chirho["tokens_chirho"]],
        )

    def test_source_notes_point_at_real_tokens_chirho(self) -> None:
        kinds_chirho: Counter = Counter()
        for record_chirho in support_chirho.verse_records_chirho():
            ids_chirho = {token["id_chirho"] for token in record_chirho["tokens_chirho"]}
            for note_chirho in record_chirho.get("source_notes_chirho", []):
                kinds_chirho[note_chirho["kind_chirho"]] += 1
                self.assertIn(note_chirho["after_token_id_chirho"], ids_chirho)
                if note_chirho["kind_chirho"] == "small_letter":
                    self.assertEqual(
                        utf16_slice_chirho(
                            record_chirho["canonical_text_chirho"],
                            note_chirho["start_chirho"],
                            note_chirho["end_chirho"],
                        ),
                        note_chirho["text_chirho"],
                    )
        raw_chirho = support_chirho.prov_text_chirho()
        self.assertEqual(
            kinds_chirho["paragraph"], len(re.findall(r'type="x-(?:pe|samekh)"', raw_chirho))
        )
        self.assertEqual(kinds_chirho["editorial"], len(re.findall(r'<note n="', raw_chirho)))
        self.assertEqual(kinds_chirho["small_letter"], raw_chirho.count('type="x-small"'))


if __name__ == "__main__":
    unittest.main()
