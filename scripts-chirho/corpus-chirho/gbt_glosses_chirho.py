# For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life. — John 3:16 (KJV)
"""Join approved English glosses from the pinned Global Bible Tools export to OSHB words.

Workflow: scripts-chirho/corpus-chirho/README-chirho.md, "Corpus import", node glosses_chirho.
GBT numbers each verse's words 01, 02, ... in its source-word file (hbo+grc). That list holds the
main-line words, each ketiv in [brackets] followed by its qere in (parentheses), and each
paragraph letter as a word of its own. It numbers verses the English (KJV) way, so where OSHB
records a KJV verse id (Hebrew Gen 32:1 is KJV 31:55) the join looks that verse up instead. The
join walks the list against the OSHB verse in the same order. Each pair must agree on NFD text once GBT's brackets and the boundary punctuation
OSHB records after the word are removed. GBT's Unicode format characters (bidi embeddings, ZWJ)
are ignored for the comparison only; the pinned OSHB file contains none. A word that does not
agree gets no gloss, and a verse whose lists differ in length gets none at all. The token's
source note says which.
"""

from __future__ import annotations

import json
import unicodedata
from collections import Counter
from dataclasses import dataclass

from oshb_book_chirho import BookVerseChirho

GLOSS_NOTE_CHIRHO = "English gloss: Global Bible Tools approved export."
UNMATCHED_WORD_NOTE_CHIRHO = (
    "No English gloss: the GBT word at this position does not match the OSHB text."
)
UNMATCHED_VERSE_NOTE_CHIRHO = (
    "No English gloss: GBT and OSHB list a different number of words for this verse."
)
EMPTY_NOTE_CHIRHO = "No approved English gloss in the pinned GBT export."
JOINED_FIRST_NOTE_CHIRHO = "GBT glosses this word and the next as one name."
JOINED_REST_NOTE_CHIRHO = (
    "No separate English gloss: GBT glosses this word with the previous one as one name."
)
BOOK_NUMBER_CHIRHO = {"Gen": 1, "Prov": 20}


class GlossJoinErrorChirho(ValueError):
    """The two GBT files disagree with each other or lack a verse, so no join is attempted."""


@dataclass(frozen=True)
class ExpectedWordChirho:
    kind_chirho: str  # word | joined | ketiv | qere | paragraph
    oshb_id_chirho: str | None
    text_chirho: str
    boundary_chirho: str
    # A joined name's OSHB word ids, first to last; the gloss goes on the first.
    member_ids_chirho: tuple[str, ...] = ()


@dataclass(frozen=True)
class GlossJoinChirho:
    # OSHB word id (main line and qere) -> (gloss or None, provenance note)
    glosses_chirho: dict[str, tuple[str | None, str]]
    outcomes_chirho: Counter


def gbt_verses_chirho(data_chirho: bytes, label_chirho: str) -> dict[str, list[dict]]:
    """GBT verse id (20026001) -> its word records, after checking ids run 01, 02, ..."""
    verses_chirho: dict[str, list[dict]] = {}
    for chapter_chirho in json.loads(data_chirho)["chapters"]:
        for verse_chirho in chapter_chirho["verses"]:
            words_chirho = verse_chirho["words"]
            expected_ids_chirho = [
                f"{verse_chirho['id']}{index_chirho:02d}"
                for index_chirho in range(1, len(words_chirho) + 1)
            ]
            if [word_chirho["id"] for word_chirho in words_chirho] != expected_ids_chirho:
                raise GlossJoinErrorChirho(
                    f"{label_chirho} {verse_chirho['id']}: word ids out of order"
                )
            verses_chirho[verse_chirho["id"]] = words_chirho
    return verses_chirho


def comparable_chirho(text_chirho: str) -> str:
    """NFD without format characters, with qadma read as pashta: GBT writes the first of a
    doubled pashta as U+0599 where OSHB writes U+05A8 (Gen 1:2 תֹ֨הוּ֙). Comparison only."""
    return unicodedata.normalize(
        "NFD",
        "".join(
            character_chirho
            for character_chirho in text_chirho
            if unicodedata.category(character_chirho) != "Cf"
        ),
    ).replace("\u05a8", "\u0599")


def without_boundary_chirho(
    text_chirho: str, boundary_chirho: str, required_chirho: bool
) -> str | None:
    if not boundary_chirho:
        return text_chirho
    if text_chirho.endswith(boundary_chirho):
        return text_chirho[: -len(boundary_chirho)].rstrip(" ")
    return None if required_chirho else text_chirho


def expected_words_chirho(verse_chirho: BookVerseChirho) -> list[ExpectedWordChirho]:
    """The word list GBT should hold for this verse, in order, with each word's boundary.

    A word whose OSHB lemma ends in "+" runs on into the next one as a single name, and GBT
    writes the whole name as one word with OSHB's own separator inside (לְבֵֽית־אֵ֖ל, בְּאֵ֥ר שָֽׁבַע);
    a ketiv never joins.
    """
    line_chirho = verse_chirho.canonical_text_chirho.encode("utf-16-le")
    placed_chirho = verse_chirho.words_chirho

    def boundary_chirho(index_chirho: int) -> str:
        stop_chirho = (
            placed_chirho[index_chirho + 1].start_chirho
            if index_chirho + 1 < len(placed_chirho)
            else len(line_chirho) // 2
        )
        start_chirho = placed_chirho[index_chirho].end_chirho
        return line_chirho[start_chirho * 2 : stop_chirho * 2].decode("utf-16-le").strip()

    expected_chirho: list[ExpectedWordChirho] = []
    index_chirho = 0
    while index_chirho < len(placed_chirho):
        placed_word_chirho = placed_chirho[index_chirho]
        source_chirho = placed_word_chirho.word_chirho
        if placed_word_chirho.ketiv_chirho:
            members_chirho = [placed_word_chirho]
            expected_chirho.append(
                ExpectedWordChirho(
                    "ketiv",
                    source_chirho.id_chirho,
                    source_chirho.text_chirho,
                    boundary_chirho(index_chirho),
                )
            )
            expected_chirho.extend(
                ExpectedWordChirho(
                    "qere",
                    qere_chirho.id_chirho,
                    qere_chirho.text_chirho,
                    boundary_chirho(index_chirho),
                )
                for qere_chirho in placed_word_chirho.qere_chirho
            )
        else:
            members_chirho = [placed_word_chirho]
            while (
                members_chirho[-1].word_chirho.lemma_chirho.endswith("+")
                and index_chirho + len(members_chirho) < len(placed_chirho)
                and not placed_chirho[index_chirho + len(members_chirho)].ketiv_chirho
            ):
                members_chirho.append(placed_chirho[index_chirho + len(members_chirho)])
            last_boundary_chirho = boundary_chirho(index_chirho + len(members_chirho) - 1)
            if len(members_chirho) == 1:
                expected_chirho.append(
                    ExpectedWordChirho(
                        "word",
                        source_chirho.id_chirho,
                        source_chirho.text_chirho,
                        last_boundary_chirho,
                    )
                )
            else:
                expected_chirho.append(
                    ExpectedWordChirho(
                        "joined",
                        source_chirho.id_chirho,
                        # GBT keeps OSHB's own separator (space or maqqef) between the parts.
                        line_chirho[
                            members_chirho[0].start_chirho * 2 : members_chirho[-1].end_chirho * 2
                        ].decode("utf-16-le"),
                        last_boundary_chirho,
                        tuple(member.word_chirho.id_chirho for member in members_chirho),
                    )
                )
        member_ids_chirho = {member.word_chirho.id_chirho for member in members_chirho}
        expected_chirho.extend(
            ExpectedWordChirho("paragraph", None, note_chirho.text_chirho, "")
            for note_chirho in verse_chirho.notes_chirho
            if note_chirho.kind_chirho == "paragraph"
            and note_chirho.after_token_id_chirho in member_ids_chirho
        )
        index_chirho += len(members_chirho)
    return expected_chirho


def matches_chirho(expected_chirho: ExpectedWordChirho, gbt_text_chirho: str) -> bool:
    text_chirho = comparable_chirho(gbt_text_chirho)
    if expected_chirho.kind_chirho == "paragraph":
        return text_chirho == expected_chirho.text_chirho
    if expected_chirho.kind_chirho in ("ketiv", "qere"):
        opening_chirho, closing_chirho = (
            ("[", "]") if expected_chirho.kind_chirho == "ketiv" else ("(", ")")
        )
        if not (text_chirho.startswith(opening_chirho) and text_chirho.endswith(closing_chirho)):
            return False
        # GBT puts the boundary inside the brackets of the ketiv, the qere, or both.
        core_chirho = without_boundary_chirho(
            text_chirho[1:-1], expected_chirho.boundary_chirho, False
        )
    else:
        core_chirho = without_boundary_chirho(text_chirho, expected_chirho.boundary_chirho, True)
    return core_chirho == comparable_chirho(expected_chirho.text_chirho)


def gbt_verse_number_chirho(book_id_chirho: str, verse_chirho: BookVerseChirho) -> tuple[int, int]:
    """GBT numbers verses the English (KJV) way: where OSHB records a KJV verse id, use it."""
    kjv_chirho = [
        note_chirho.text_chirho
        for note_chirho in verse_chirho.notes_chirho
        if note_chirho.kind_chirho == "versification"
    ]
    if not kjv_chirho:
        return verse_chirho.chapter_chirho, verse_chirho.verse_chirho
    book_chirho, chapter_chirho, number_chirho = kjv_chirho[0].split(".")
    if len(kjv_chirho) > 1 or book_chirho != book_id_chirho:
        raise GlossJoinErrorChirho(f"{verse_chirho.osis_id_chirho}: KJV verse notes {kjv_chirho}")
    return int(chapter_chirho), int(number_chirho)


def join_glosses_chirho(
    book_id_chirho: str,
    verses_chirho: tuple[BookVerseChirho, ...],
    source_words_chirho: dict[str, list[dict]],
    english_chirho: dict[str, list[dict]],
) -> GlossJoinChirho:
    glosses_chirho: dict[str, tuple[str | None, str]] = {}
    outcomes_chirho: Counter = Counter()
    for verse_chirho in verses_chirho:
        chapter_chirho, number_chirho = gbt_verse_number_chirho(book_id_chirho, verse_chirho)
        verse_id_chirho = (
            f"{BOOK_NUMBER_CHIRHO[book_id_chirho]:02d}{chapter_chirho:03d}{number_chirho:03d}"
        )
        sources_chirho = source_words_chirho.get(verse_id_chirho)
        glossed_chirho = english_chirho.get(verse_id_chirho)
        if (
            sources_chirho is None
            or glossed_chirho is None
            or [word_chirho["id"] for word_chirho in sources_chirho]
            != [word_chirho["id"] for word_chirho in glossed_chirho]
        ):
            raise GlossJoinErrorChirho(f"GBT files disagree on verse {verse_id_chirho}")
        expected_chirho = expected_words_chirho(verse_chirho)
        if len(expected_chirho) != len(sources_chirho):
            for entry_chirho in expected_chirho:
                for member_chirho in entry_chirho.member_ids_chirho or (
                    (entry_chirho.oshb_id_chirho,) if entry_chirho.oshb_id_chirho else ()
                ):
                    glosses_chirho[member_chirho] = (None, UNMATCHED_VERSE_NOTE_CHIRHO)
                    outcomes_chirho["unmatched_verse"] += 1
            continue
        for entry_chirho, source_chirho, english_word_chirho in zip(
            expected_chirho, sources_chirho, glossed_chirho
        ):
            matched_chirho = matches_chirho(entry_chirho, source_chirho["text"])
            if entry_chirho.kind_chirho == "paragraph":
                outcomes_chirho["paragraph" if matched_chirho else "paragraph_unmatched"] += 1
                continue
            gloss_chirho = english_word_chirho.get("gloss")
            members_chirho = entry_chirho.member_ids_chirho or (entry_chirho.oshb_id_chirho,)
            if not matched_chirho:
                note_chirho, outcome_chirho = UNMATCHED_WORD_NOTE_CHIRHO, "unmatched_word"
            elif not isinstance(gloss_chirho, str) or not gloss_chirho.strip():
                note_chirho, outcome_chirho = EMPTY_NOTE_CHIRHO, "empty"
            else:
                note_chirho, outcome_chirho = None, f"glossed_{entry_chirho.kind_chirho}"
            outcomes_chirho[outcome_chirho] += 1
            if note_chirho is not None:
                glosses_chirho |= {
                    member_chirho: (None, note_chirho) for member_chirho in members_chirho
                }
                continue
            first_chirho, *rest_chirho = members_chirho
            glosses_chirho[first_chirho] = (
                gloss_chirho.strip(),
                f"{GLOSS_NOTE_CHIRHO} {JOINED_FIRST_NOTE_CHIRHO}"
                if rest_chirho
                else GLOSS_NOTE_CHIRHO,
            )
            glosses_chirho |= {
                member_chirho: (None, JOINED_REST_NOTE_CHIRHO) for member_chirho in rest_chirho
            }
    return GlossJoinChirho(glosses_chirho, outcomes_chirho)
