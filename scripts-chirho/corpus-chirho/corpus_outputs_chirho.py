# For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life. — John 3:16 (KJV)
"""Corpus outputs: deterministic JSON text, chapter files, the manifest and the import report.

Workflow: scripts-chirho/corpus-chirho/README-chirho.md, "Corpus import", node outputs_chirho.
Every output is a pure function of the pinned inputs, so --check can rebuild and compare bytes.
"""

from __future__ import annotations

import hashlib
import json
from collections import Counter

from source_files_chirho import PinnedFileChirho

# What the corpus does with each pinned OSHB file, stated in its attribution.
CORPUS_ADAPTATIONS_CHIRHO = {
    "oshb-prov-chirho": (
        "every verse read into one canonical line: word-division slashes removed, XML "
        "whitespace written as single spaces, each ketiv kept in the line with its qere "
        "attached, paragraph letters, small letters and editorial notes recorded beside the "
        "line, and morphology codes decoded into English labels and teaching categories"
    ),
    "oshb-morphology-codes-chirho": (
        "code tables, verbs included, transcribed into the corpus importer's decoder"
    ),
    "strong-chirho": "headwords used as each word's lexical form",
    "aug-index-chirho": "used to resolve augmented lemmas such as 7105 a and the prefix lemmas b, l and m",
    "lexical-index-chirho": (
        "used to confirm augmented lemmas and to give lexical forms for the prefix lemmas"
    ),
}


def json_text_chirho(value_chirho: object, compact_depth_chirho: int) -> str:
    """Tab-indented JSON whose containers at compact_depth_chirho or deeper fit on one line."""

    def render_chirho(node_chirho: object, depth_chirho: int) -> str:
        if (
            depth_chirho >= compact_depth_chirho
            or not isinstance(node_chirho, (dict, list))
            or not node_chirho
        ):
            return json.dumps(node_chirho, ensure_ascii=False, separators=(",", ":"))
        outer_chirho = "\t" * depth_chirho
        inner_chirho = outer_chirho + "\t"
        if isinstance(node_chirho, dict):
            items_chirho = [
                f"{inner_chirho}{json.dumps(key_chirho, ensure_ascii=False)}: "
                f"{render_chirho(child_chirho, depth_chirho + 1)}"
                for key_chirho, child_chirho in node_chirho.items()
            ]
            opening_chirho, closing_chirho = "{", "}"
        else:
            items_chirho = [
                inner_chirho + render_chirho(child_chirho, depth_chirho + 1)
                for child_chirho in node_chirho
            ]
            opening_chirho, closing_chirho = "[", "]"
        return (
            f"{opening_chirho}\n" + ",\n".join(items_chirho) + f"\n{outer_chirho}{closing_chirho}"
        )

    return render_chirho(value_chirho, 0) + "\n"


def sha256_text_chirho(text_chirho: str) -> str:
    return hashlib.sha256(text_chirho.encode()).hexdigest()


def source_record_chirho(pinned_chirho: PinnedFileChirho, adaptation_chirho: str) -> dict:
    """A SourceChirho record for one pinned file, as the reader's source notes show it."""
    return {
        "id_chirho": pinned_chirho.id_chirho,
        "title_chirho": pinned_chirho.title_chirho,
        "url_chirho": pinned_chirho.blob_url_chirho,
        "revision_chirho": pinned_chirho.commit_chirho,
        "sha256_chirho": pinned_chirho.sha256_chirho,
        "license_chirho": pinned_chirho.license_chirho,
        "attribution_chirho": f"{pinned_chirho.attribution_chirho}. Adapted here: "
        f"{adaptation_chirho}. No endorsement is implied.",
    }


def chapter_name_chirho(number_chirho: int) -> str:
    return f"chapter-{number_chirho:02d}-chirho.json"


def chapter_texts_chirho(book_id_chirho: str, records_chirho: list[dict]) -> dict[int, str]:
    """Chapter number -> chapter file text, verses in source order."""
    chapters_chirho: dict[int, list[dict]] = {}
    for record_chirho in records_chirho:
        number_chirho = int(record_chirho["id_chirho"].split(".")[1])
        chapters_chirho.setdefault(number_chirho, []).append(record_chirho)
    return {
        number_chirho: json_text_chirho(
            {
                "book_id_chirho": book_id_chirho,
                "chapter_chirho": number_chirho,
                "verses_chirho": verses_chirho,
            },
            compact_depth_chirho=4,
        )
        for number_chirho, verses_chirho in chapters_chirho.items()
    }


def manifest_text_chirho(
    book_id_chirho: str,
    label_chirho: str,
    source_chirho: PinnedFileChirho,
    chapters_chirho: dict[int, str],
    verse_counts_chirho: Counter,
    public_prefix_chirho: str,
    state_chirho: dict[str, object] | None = None,
) -> str:
    """The reader's book manifest; state fields (staged, local reader) come before the chapters."""
    manifest_chirho: dict = {
        "schema_version_chirho": 1,
        "book_id_chirho": book_id_chirho,
        "label_chirho": label_chirho,
        "language_chirho": "he",
        "revision_chirho": source_chirho.commit_chirho,
        "source_sha256_chirho": source_chirho.sha256_chirho,
    }
    manifest_chirho |= state_chirho or {}
    return json_text_chirho(
        manifest_chirho
        | {
            "chapters_chirho": [
                {
                    "number_chirho": number_chirho,
                    "verse_count_chirho": verse_counts_chirho[number_chirho],
                    "path_chirho": public_prefix_chirho + chapter_name_chirho(number_chirho),
                    "sha256_chirho": sha256_text_chirho(text_chirho),
                }
                for number_chirho, text_chirho in sorted(chapters_chirho.items())
            ],
        },
        compact_depth_chirho=99,
    )


def report_text_chirho(records_chirho: list[dict], gloss_outcomes_chirho: Counter) -> str:
    """Measured facts about the import, for the handoff and for the corpus tests."""
    tokens_chirho = [
        token_chirho
        for record_chirho in records_chirho
        for token_chirho in record_chirho["tokens_chirho"]
    ]
    qere_chirho = [
        reading_chirho
        for token_chirho in tokens_chirho
        for reading_chirho in token_chirho.get("qere_chirho", [])
    ]
    notes_chirho = [
        note_chirho
        for record_chirho in records_chirho
        for note_chirho in record_chirho.get("source_notes_chirho", [])
    ]
    verbs_chirho = [
        token_chirho for token_chirho in tokens_chirho if token_chirho["pos_chirho"] == "verb"
    ]

    def counted_chirho(values_chirho) -> dict[str, int]:
        return dict(sorted(Counter(values_chirho).items()))

    return json_text_chirho(
        {
            "schema_version_chirho": 1,
            "verses_chirho": len(records_chirho),
            "main_line_words_chirho": len(tokens_chirho),
            "ketiv_words_chirho": sum(
                "qere_chirho" in token_chirho for token_chirho in tokens_chirho
            ),
            "qere_words_chirho": len(qere_chirho),
            "unique_main_line_lemmas_chirho": len(
                {
                    (token_chirho["lemma_id_chirho"], token_chirho["lemma_augment_chirho"])
                    for token_chirho in tokens_chirho
                }
            ),
            "pos_chirho": counted_chirho(
                token_chirho["pos_chirho"] for token_chirho in tokens_chirho
            ),
            "verb_forms_chirho": counted_chirho(
                token_chirho["verb_form_chirho"] for token_chirho in verbs_chirho
            ),
            "verb_stems_chirho": counted_chirho(
                token_chirho["verb_stem_chirho"] for token_chirho in verbs_chirho
            ),
            "verb_constructions_chirho": counted_chirho(
                token_chirho["verb_construction_chirho"]
                for token_chirho in verbs_chirho
                if "verb_construction_chirho" in token_chirho
            ),
            "verbs_with_local_code_chirho": sum(
                "verb_code_chirho" in token_chirho for token_chirho in verbs_chirho
            ),
            "verbs_without_local_code_chirho": sum(
                "verb_code_chirho" not in token_chirho for token_chirho in verbs_chirho
            ),
            "source_notes_chirho": counted_chirho(
                f"{note_chirho['kind_chirho']}:{note_chirho['code_chirho']}"
                for note_chirho in notes_chirho
            ),
            "glossed_tokens_chirho": sum(
                token_chirho["gloss_chirho"] is not None for token_chirho in tokens_chirho
            ),
            "gloss_origin_chirho": counted_chirho(
                record_chirho["gloss_origin_chirho"] for record_chirho in records_chirho
            ),
            "glossed_qere_chirho": sum(
                reading_chirho["gloss_chirho"] is not None for reading_chirho in qere_chirho
            ),
            "gloss_join_chirho": dict(sorted(gloss_outcomes_chirho.items())),
        },
        compact_depth_chirho=2,
    )
