# For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life. — John 3:16 (KJV)
import importlib.util
import tempfile
import unittest
from pathlib import Path

spec_chirho = importlib.util.spec_from_file_location(
    "word_study_chirho", Path(__file__).parents[1] / "word_study_chirho.py"
)
module_chirho = importlib.util.module_from_spec(spec_chirho)
spec_chirho.loader.exec_module(module_chirho)


class WordStudyTestChirho(unittest.TestCase):
    def fixture_chirho(self):
        tokens_chirho = [
            {
                "id_chirho": "one-chirho",
                "text_chirho": "λόγος",
                "lemma_id_chirho": "G3056",
            },
            {
                "id_chirho": "two-chirho",
                "text_chirho": "λόγον",
                "lemma_id_chirho": "G3056",
            },
        ]
        content_chirho = {
            "verses_chirho": [
                {
                    "id_chirho": "John.1.1",
                    "reference_chirho": "John 1:1",
                    "tokens_chirho": tokens_chirho,
                }
            ]
        }
        words_chirho = [
            {
                "token_id_chirho": token_chirho["id_chirho"],
                "text_chirho": token_chirho["text_chirho"],
                "gloss_chirho": gloss_chirho,
            }
            for token_chirho, gloss_chirho in zip(tokens_chirho, ["word", ""])
        ]
        layer_chirho = {
            "sources_chirho": [{"id_chirho": "source-chirho"}],
            "verses_chirho": {
                "John.1.1": {
                    "readers_chirho": {
                        "source_id_chirho": "source-chirho",
                        "words_chirho": words_chirho,
                    }
                }
            },
        }
        return content_chirho, layer_chirho

    def test_counts_forms_and_empty_glosses_without_inventing_translation_chirho(self):
        content_chirho, layer_chirho = self.fixture_chirho()
        rows_chirho = {}
        module_chirho.aggregate_chirho(
            content_chirho, layer_chirho, "readers", rows_chirho
        )
        self.assertEqual(rows_chirho["G3056"]["covered_chirho"], 2)
        self.assertEqual(rows_chirho["G3056"]["empty_chirho"], 1)
        self.assertEqual(
            rows_chirho["G3056"]["glosses_chirho"]["word"]["count_chirho"], 1
        )
        self.assertEqual(
            module_chirho.lemma_chirho(
                {"lemma_id_chirho": "H157", "lemma_augment_chirho": "a"}
            ),
            "H157a",
        )

    def test_changed_token_identity_refuses_instead_of_counting_another_word_chirho(
        self,
    ):
        content_chirho, layer_chirho = self.fixture_chirho()
        layer_chirho["verses_chirho"]["John.1.1"]["readers_chirho"]["words_chirho"][0][
            "token_id_chirho"
        ] = "wrong-chirho"
        with self.assertRaisesRegex(ValueError, "alignment"):
            module_chirho.aggregate_chirho(content_chirho, layer_chirho, "readers", {})

    def test_corrupt_source_and_path_escape_refuse_chirho(self):
        with tempfile.TemporaryDirectory(suffix="-chirho") as directory_chirho:
            root_chirho = Path(directory_chirho)
            (root_chirho / "chapter-chirho.json").write_bytes(b"{}")
            with self.assertRaisesRegex(ValueError, "hash"):
                module_chirho.verified_chirho(
                    root_chirho, "/chapter-chirho.json", "0" * 64
                )
            with self.assertRaisesRegex(ValueError, "escapes"):
                module_chirho.verified_chirho(
                    root_chirho, "../outside-chirho.json", "0" * 64
                )


if __name__ == "__main__":
    unittest.main()
