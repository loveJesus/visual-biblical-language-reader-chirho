# For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life. — John 3:16 (KJV)
"""Spanish layers: rebuilt exactly, hash-listed, bound to their published chapter, never invented."""

from __future__ import annotations

import hashlib
import json
import sys
import tempfile
import unittest
from functools import cache
from pathlib import Path

REPO_ROOT_CHIRHO = Path(__file__).resolve().parents[3]
sys.path.insert(0, str(REPO_ROOT_CHIRHO / "scripts-chirho" / "translations-chirho"))
sys.dont_write_bytecode = True

import build_spanish_glosses_chirho as builder_chirho

LAYERS_CHIRHO = REPO_ROOT_CHIRHO / "static" / "glosses-chirho" / "es-chirho"
SLUGS_CHIRHO = {"Prov": "proverbs", "Gen": "genesis", "John": "john"}


@cache
def outputs_chirho() -> dict[Path, str]:
    return builder_chirho.build_outputs_chirho(REPO_ROOT_CHIRHO)


class SpanishLayerTestChirho(unittest.TestCase):
    def test_written_layers_equal_a_fresh_build_and_stay_in_their_folder_chirho(
        self,
    ) -> None:
        for path_chirho, text_chirho in outputs_chirho().items():
            self.assertTrue(path_chirho.is_relative_to(LAYERS_CHIRHO), path_chirho)
            self.assertEqual(path_chirho.read_text(encoding="utf-8"), text_chirho, path_chirho)

    def test_manifest_hashes_content_binding_and_corpus_keys_chirho(self) -> None:
        manifest_chirho = json.loads(outputs_chirho()[LAYERS_CHIRHO / "manifest-chirho.json"])
        for book_chirho, entry_chirho in manifest_chirho["books_chirho"].items():
            for chapter_chirho in entry_chirho["chapters_chirho"]:
                text_chirho = outputs_chirho()[
                    LAYERS_CHIRHO
                    / chapter_chirho["path_chirho"].removeprefix("/glosses-chirho/es-chirho/")
                ]
                self.assertEqual(
                    chapter_chirho["sha256_chirho"],
                    hashlib.sha256(text_chirho.encode()).hexdigest(),
                )
                content_path_chirho = (
                    f"/content-chirho/{SLUGS_CHIRHO[book_chirho]}-chirho"
                    f"/chapter-{chapter_chirho['number_chirho']:02d}-chirho.json"
                )
                content_bytes_chirho = (
                    REPO_ROOT_CHIRHO / "static" / content_path_chirho.lstrip("/")
                ).read_bytes()
                binding_chirho = {
                    "content_path_chirho": content_path_chirho,
                    "content_sha256_chirho": hashlib.sha256(content_bytes_chirho).hexdigest(),
                }
                layer_value_chirho = json.loads(text_chirho)
                for holder_chirho in (chapter_chirho, layer_value_chirho):
                    self.assertEqual(
                        {key_chirho: holder_chirho[key_chirho] for key_chirho in binding_chirho},
                        binding_chirho,
                    )
                corpus_chirho = json.loads(content_bytes_chirho)
                expected_chirho = {
                    word_chirho["id_chirho"]
                    for verse_chirho in corpus_chirho["verses_chirho"]
                    for token_chirho in verse_chirho["tokens_chirho"]
                    for word_chirho in [
                        token_chirho,
                        *token_chirho.get("qere_chirho", []),
                    ]
                }
                self.assertEqual(
                    set(layer_value_chirho["glosses_chirho"]),
                    expected_chirho,
                    (book_chirho, chapter_chirho["number_chirho"]),
                )

    def test_proverbs_26_1_equals_the_reviewed_fixture_chirho(self) -> None:
        fixture_chirho = json.loads(
            (
                REPO_ROOT_CHIRHO
                / "data-chirho"
                / "glosses-chirho"
                / "proverbs-26-1-glosses-chirho.json"
            ).read_text(encoding="utf-8")
        )
        spanish_chirho = next(
            language_chirho
            for language_chirho in fixture_chirho["languages_chirho"]
            if language_chirho["id_chirho"] == "spa"
        )
        layer_chirho = json.loads(
            outputs_chirho()[LAYERS_CHIRHO / "proverbs-chirho" / "chapter-26-chirho.json"]
        )
        for word_chirho in spanish_chirho["words_chirho"]:
            self.assertEqual(
                layer_chirho["glosses_chirho"][word_chirho["token_id_chirho"]],
                word_chirho["gloss_chirho"],
            )

    def test_sub_entries_are_dropped_and_foreign_ids_refused_chirho(self) -> None:
        def book_chirho(ids_chirho):
            return json.dumps(
                {
                    "chapters": [
                        {
                            "verses": [
                                {
                                    "id": "43001037",
                                    "words": [
                                        {"id": id_chirho, "gloss": "x"} for id_chirho in ids_chirho
                                    ],
                                }
                            ]
                        }
                    ]
                }
            ).encode()

        verses_chirho = builder_chirho.glosses_by_verse_chirho(
            book_chirho(["4300103701", "4300103701-01"])
        )
        self.assertEqual(
            [word_chirho["id"] for word_chirho in verses_chirho["43001037"]],
            ["4300103701"],
        )
        for ids_chirho in (["4300103801"], ["4300103701", "4300103701"], ["430010370"]):
            with (
                self.subTest(ids_chirho),
                self.assertRaises(builder_chirho.SpanishSourceErrorChirho),
            ):
                builder_chirho.glosses_by_verse_chirho(book_chirho(ids_chirho))

    def test_binding_refuses_a_changed_or_misplaced_chapter_chirho(self) -> None:
        path_chirho = "/content-chirho/john-chirho/chapter-01-chirho.json"
        data_chirho = json.dumps(
            {
                "verses_chirho": [
                    {"tokens_chirho": [{"id_chirho": "John.1.1!1", "text_chirho": "Ἐν"}]}
                ]
            }
        ).encode()
        with tempfile.TemporaryDirectory() as folder_chirho:
            root_chirho = Path(folder_chirho)
            (root_chirho / "static" / "content-chirho" / "john-chirho").mkdir(parents=True)
            (root_chirho / "static" / path_chirho.lstrip("/")).write_bytes(data_chirho)
            entry_chirho = {
                "path_chirho": path_chirho,
                "sha256_chirho": hashlib.sha256(data_chirho).hexdigest(),
            }
            words_chirho = {"John.1.1!1": "Ἐν"}
            self.assertEqual(
                builder_chirho.content_binding_chirho(root_chirho, entry_chirho, words_chirho),
                {
                    "content_path_chirho": path_chirho,
                    "content_sha256_chirho": entry_chirho["sha256_chirho"],
                },
            )
            for case_chirho, entry_case_chirho, words_case_chirho in (
                ("bytes differ", {**entry_chirho, "sha256_chirho": "0" * 64}, words_chirho),
                ("word text differs", entry_chirho, {"John.1.1!1": "ἐν"}),
                ("word missing", entry_chirho, {**words_chirho, "John.1.1!2": "ἀρχῇ"}),
                (
                    "path outside content",
                    {**entry_chirho, "path_chirho": "/content-chirho/../x.json"},
                    words_chirho,
                ),
            ):
                with (
                    self.subTest(case_chirho),
                    self.assertRaises(builder_chirho.ContentBindingErrorChirho),
                ):
                    builder_chirho.content_binding_chirho(
                        root_chirho, entry_case_chirho, words_case_chirho
                    )


if __name__ == "__main__":
    unittest.main()
