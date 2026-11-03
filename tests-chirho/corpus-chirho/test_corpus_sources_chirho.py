# For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life. — John 3:16 (KJV)
"""Source records state each licence basis as checked, and keep the residual facts and inference."""

from __future__ import annotations

import json
import unittest

import support_chirho


def displayed_sources_chirho() -> dict[str, dict]:
    """Every distinct source record the corpus chapters carry, by id (identical across verses)."""
    records_chirho: dict[str, dict] = {}
    for path_chirho, text_chirho in support_chirho.fresh_outputs_chirho().items():
        if not path_chirho.name.startswith("chapter-"):
            continue
        for verse_chirho in json.loads(text_chirho)["verses_chirho"]:
            for source_chirho in verse_chirho["sources_chirho"]:
                previous_chirho = records_chirho.setdefault(
                    source_chirho["id_chirho"], source_chirho
                )
                if previous_chirho != source_chirho:
                    raise AssertionError(f"{source_chirho['id_chirho']} differs between verses")
    return records_chirho


class SourceRecordTestChirho(unittest.TestCase):
    def test_no_output_keeps_the_superseded_local_only_sentence_chirho(self) -> None:
        for path_chirho, text_chirho in support_chirho.fresh_outputs_chirho().items():
            self.assertNotIn("No public use is granted", text_chirho, path_chirho)

    def test_gbt_english_states_the_upstream_cc0_basis_and_the_missing_licence_file_chirho(
        self,
    ) -> None:
        sources_chirho = displayed_sources_chirho()
        for source_id_chirho in ("gbt-english-prov-chirho", "gbt-english-gen-chirho"):
            licence_chirho = sources_chirho[source_id_chirho]["license_chirho"]
            self.assertTrue(licence_chirho.startswith("CC0 1.0 Universal"))
            for fact_chirho in (
                "globalbibletools/platform@5d4041d4",
                'licenseCode: "cc0_1_0"',
                "Only English New Testament glosses",
                "carries no LICENSE file",
                "26-10-27-release-license-check-chirho.md",
            ):
                self.assertIn(fact_chirho, licence_chirho)

    def test_gbt_source_words_claim_no_licence_they_do_not_have_chirho(self) -> None:
        sources_chirho = displayed_sources_chirho()
        for source_id_chirho in ("gbt-source-words-prov-chirho", "gbt-source-words-gen-chirho"):
            licence_chirho = sources_chirho[source_id_chirho]["license_chirho"]
            self.assertTrue(licence_chirho.startswith("Not displayed"))
            self.assertIn("does not itemize this source-word file", licence_chirho)
            self.assertFalse(licence_chirho.startswith("CC0"))

    def test_berean_keeps_its_stated_public_domain_and_inference_chirho(self) -> None:
        licence_chirho = displayed_sources_chirho()["berean-glosses-chirho"]["license_chirho"]
        for fact_chirho in ("Public domain as stated, not CC0", "is an inference", "Berean name"):
            self.assertIn(fact_chirho, licence_chirho)

    def test_cc_by_sources_carry_their_required_attribution_chirho(self) -> None:
        sources_chirho = displayed_sources_chirho()
        self.assertTrue(
            sources_chirho["oshb-prov-chirho"]["attribution_chirho"].startswith(
                "Original work of the Open Scriptures Hebrew Bible available at "
                "https://github.com/openscriptures/morphhb"
            )
        )
        self.assertIn("CC BY 4.0", sources_chirho["oshb-gen-chirho"]["license_chirho"])
        self.assertIn(
            "Open Scriptures Hebrew Bible Project",
            sources_chirho["strong-chirho"]["attribution_chirho"],
        )


if __name__ == "__main__":
    unittest.main()
