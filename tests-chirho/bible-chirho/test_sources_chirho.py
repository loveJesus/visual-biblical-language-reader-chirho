# For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life. — John 3:16 (KJV)
"""Independent canonical reconstruction and trust-boundary probes for all 66 source books."""

import csv
import hashlib
import html
import io
import json
import re
import sys
import unittest
from collections import defaultdict
from pathlib import Path

ROOT_CHIRHO = Path(__file__).resolve().parents[2]
sys.path[:0] = [
    str(ROOT_CHIRHO / "scripts-chirho/bible-chirho"),
    str(ROOT_CHIRHO / "scripts-chirho/corpus-chirho"),
    str(ROOT_CHIRHO / "scripts-chirho/import-chirho"),
]
from greek_chirho import gloss_entries_chirho, read_books_chirho
from hebrew_chirho import read_book_chirho
from source_files_chirho import load_manifest_chirho, read_verified_bytes_chirho


class SourceTestsChirho(unittest.TestCase):
    @classmethod
    def setUpClass(cls_chirho):
        cls_chirho.books_chirho = json.loads(
            (ROOT_CHIRHO / "config-chirho/bible-chirho/books-chirho.json").read_text()
        )["books_chirho"]
        cls_chirho.pins_chirho = load_manifest_chirho(
            ROOT_CHIRHO / "data-chirho/bible-chirho/sources-chirho"
        )
        cls_chirho.nt_chirho = (
            ROOT_CHIRHO
            / "data-chirho/corpus-chirho/sources-chirho/nestle1904-chirho/morph/Nestle1904.csv"
        ).read_bytes()

    def test_all_canonical_lines_chirho(self_chirho):
        """A regex/raw-text path independent of both importer parsers checks every displayed verse."""
        raw_greek_chirho = defaultdict(list)
        rows_chirho = csv.reader(
            io.StringIO(self_chirho.nt_chirho.decode("utf-8-sig")), delimiter="\t"
        )
        next(rows_chirho)
        for row_chirho in rows_chirho:
            book_chirho, chapter_verse_chirho = row_chirho[0].split()
            raw_greek_chirho[book_chirho + "." + chapter_verse_chirho.replace(":", ".")].append(
                row_chirho[1]
            )
        checked_chirho = 0
        for book_chirho in self_chirho.books_chirho:
            expected_chirho = {}
            if book_chirho["language_chirho"] == "he":
                raw_chirho = read_verified_bytes_chirho(
                    self_chirho.pins_chirho["oshb-" + book_chirho["id_chirho"].lower() + "-chirho"]
                ).decode()
                for verse_id_chirho, body_chirho in re.findall(
                    r'<verse osisID="([^"]+)">(.*?)</verse>', raw_chirho, re.DOTALL
                ):
                    line_chirho = re.sub(
                        r"<note\b[^>]*>.*?</note>", "", body_chirho, flags=re.DOTALL
                    )
                    line_chirho = re.sub(
                        r'<seg type="x-(?:pe|samekh|reversednun)"[^>]*>.*?</seg>',
                        "",
                        line_chirho,
                        flags=re.DOTALL,
                    )
                    line_chirho = re.sub(r"<[^>]+>", "", line_chirho).replace("/", "")
                    expected_chirho[verse_id_chirho] = " ".join(html.unescape(line_chirho).split())
            else:
                expected_chirho = {
                    id_chirho: " ".join(words_chirho)
                    for id_chirho, words_chirho in raw_greek_chirho.items()
                    if id_chirho.startswith(book_chirho["id_chirho"] + ".")
                }
            manifest_path_chirho = (
                ROOT_CHIRHO
                / "static/content-chirho"
                / book_chirho["slug_chirho"]
                / "manifest-chirho.json"
            )
            manifest_chirho = json.loads(manifest_path_chirho.read_bytes())
            self_chirho.assertEqual(
                len(manifest_chirho["chapters_chirho"]), book_chirho["chapter_count_chirho"]
            )
            seen_chirho = set()
            for entry_chirho in manifest_chirho["chapters_chirho"]:
                bytes_chirho = (
                    ROOT_CHIRHO / "static" / entry_chirho["path_chirho"].lstrip("/")
                ).read_bytes()
                self_chirho.assertEqual(
                    hashlib.sha256(bytes_chirho).hexdigest(), entry_chirho["sha256_chirho"]
                )
                self_chirho.assertLessEqual(len(bytes_chirho), 4 * 1024 * 1024)
                chapter_chirho = json.loads(bytes_chirho)
                numbers_chirho = []
                for verse_chirho in chapter_chirho["verses_chirho"]:
                    id_chirho = verse_chirho["id_chirho"]
                    self_chirho.assertEqual(
                        verse_chirho["canonical_text_chirho"], expected_chirho[id_chirho], id_chirho
                    )
                    encoded_chirho = verse_chirho["canonical_text_chirho"].encode("utf-16-le")
                    for token_chirho in verse_chirho["tokens_chirho"]:
                        self_chirho.assertEqual(
                            encoded_chirho[
                                token_chirho["start_chirho"] * 2 : token_chirho["end_chirho"] * 2
                            ].decode("utf-16-le"),
                            token_chirho["text_chirho"],
                            id_chirho,
                        )
                    self_chirho.assertNotIn(id_chirho, seen_chirho)
                    seen_chirho.add(id_chirho)
                    numbers_chirho.append(int(id_chirho.split(".")[2]))
                    checked_chirho += 1
                self_chirho.assertEqual(
                    numbers_chirho,
                    entry_chirho.get(
                        "verse_numbers_chirho",
                        list(range(1, entry_chirho["verse_count_chirho"] + 1)),
                    ),
                )
            self_chirho.assertEqual(set(expected_chirho), seen_chirho)
        self_chirho.assertEqual(checked_chirho, 31156)

    def test_source_word_change_is_detected_chirho(self_chirho):
        pin_chirho = self_chirho.pins_chirho["oshb-exod-chirho"]
        bytes_chirho = read_verified_bytes_chirho(pin_chirho)
        from source_files_chirho import (
            SourceIntegrityErrorChirho,
            check_pinned_bytes_chirho,
        )

        with self_chirho.assertRaises(SourceIntegrityErrorChirho):
            check_pinned_bytes_chirho(pin_chirho, bytes_chirho + b" ")

    def test_unknown_hebrew_markup_refused_chirho(self_chirho):
        bytes_chirho = read_verified_bytes_chirho(self_chirho.pins_chirho["oshb-obad-chirho"])
        with self_chirho.assertRaises(ValueError):
            read_book_chirho(
                bytes_chirho.replace(b'<seg type="x-sof-pasuq">', b'<seg type="x-unknown">', 1),
                "Obad",
            )

    def test_greek_extra_columns_cannot_be_ignored_chirho(self_chirho):
        with self_chirho.assertRaises(ValueError):
            read_books_chirho(self_chirho.nt_chirho.replace(b"Matt 1:1\t", b"Matt 1:1\textra\t", 1))

    def test_duplicate_or_incomplete_gloss_is_withheld_chirho(self_chirho):
        data_chirho = b'<root><verse><w osisId="Matt.1.1!1"><greek>a</greek><gloss>x</gloss></w><w osisId="Matt.1.1!1"><greek>b</greek><gloss>y</gloss></w><w osisId="Matt.1.1!2"><greek>c</greek></w></verse></root>'
        entries_chirho, notes_chirho = gloss_entries_chirho(data_chirho, "Matt")
        self_chirho.assertEqual(entries_chirho, {})
        self_chirho.assertEqual(len(notes_chirho), 2)


if __name__ == "__main__":
    unittest.main()
