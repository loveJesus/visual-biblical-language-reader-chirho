# For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life. — John 3:16 (KJV)
"""One OSHB verse: exact canonical text, word and punctuation records, and UTF-16 spans.

Workflow: scripts-chirho/import-chirho/README-chirho.md, "Offline import", node verse_chirho.
The canonical text keeps the source's code points and mark order; it is never normalized
(the OSHB README warns against NFC). Word text drops only the source's "/" morpheme dividers,
and runs of XML whitespace between elements become one space. Ketiv/qere notes, paragraph
markers and nested elements are refused rather than guessed, until a lesson needs them.
"""

from __future__ import annotations

import unicodedata
import xml.etree.ElementTree as ET
from dataclasses import dataclass

from source_files_chirho import parse_xml_chirho

OSIS_NS_CHIRHO = "{http://www.bibletechnologies.net/2003/OSIS/namespace}"
PUNCTUATION_TYPES_CHIRHO = ("x-maqqef", "x-paseq", "x-sof-pasuq")
WORD_ATTRIBUTES_CHIRHO = frozenset({"lemma", "morph", "id", "n"})
DIVIDER_CHIRHO = "/"


class VerseStructureErrorChirho(ValueError):
    """The verse holds markup this importer does not handle, or breaks a segment rule."""


@dataclass(frozen=True)
class WordRecordChirho:
    oshb_id_chirho: str
    position_chirho: int
    source_text_chirho: str
    text_chirho: str
    segments_chirho: tuple[str, ...]
    start_chirho: int
    end_chirho: int
    lemma_chirho: str
    morph_chirho: str
    attributes_chirho: tuple[tuple[str, str], ...]


@dataclass(frozen=True)
class PunctuationRecordChirho:
    type_chirho: str
    text_chirho: str
    start_chirho: int
    end_chirho: int
    after_word_chirho: str


@dataclass(frozen=True)
class VerseChirho:
    osis_id_chirho: str
    canonical_text_chirho: str
    words_chirho: tuple[WordRecordChirho, ...]
    punctuation_chirho: tuple[PunctuationRecordChirho, ...]


def utf16_length_chirho(text_chirho: str) -> int:
    """Length in UTF-16 code units, the unit JavaScript string offsets use."""
    return len(text_chirho.encode("utf-16-le")) // 2


def utf16_slice_chirho(text_chirho: str, start_chirho: int, end_chirho: int) -> str:
    return text_chirho.encode("utf-16-le")[2 * start_chirho : 2 * end_chirho].decode("utf-16-le")


def check_segments_chirho(word_id_chirho: str, segments_chirho: tuple[str, ...]) -> None:
    """Every segment is nonempty and starts on a base character, never on a combining mark."""
    for segment_chirho in segments_chirho:
        if not segment_chirho:
            raise VerseStructureErrorChirho(f"{word_id_chirho}: empty segment")
        if unicodedata.category(segment_chirho[0]).startswith("M"):
            raise VerseStructureErrorChirho(
                f"{word_id_chirho}: segment {segment_chirho!r} starts with a combining mark"
            )


def find_verse_chirho(book_xml_chirho: bytes, osis_id_chirho: str) -> ET.Element:
    root_chirho = parse_xml_chirho(book_xml_chirho, osis_id_chirho)
    matches_chirho = [
        verse_chirho
        for verse_chirho in root_chirho.iter(f"{OSIS_NS_CHIRHO}verse")
        if verse_chirho.get("osisID") == osis_id_chirho
    ]
    if len(matches_chirho) != 1:
        raise VerseStructureErrorChirho(f"{osis_id_chirho}: found {len(matches_chirho)} verses")
    return matches_chirho[0]


def require_whitespace_chirho(text_chirho: str | None, where_chirho: str) -> bool:
    """True when the gap holds whitespace; text outside elements is refused."""
    if text_chirho and text_chirho.strip():
        raise VerseStructureErrorChirho(f"unexpected text {text_chirho.strip()!r} {where_chirho}")
    return bool(text_chirho)


def parse_verse_chirho(book_xml_chirho: bytes, osis_id_chirho: str) -> VerseChirho:
    verse_chirho = find_verse_chirho(book_xml_chirho, osis_id_chirho)
    require_whitespace_chirho(verse_chirho.text, f"at the start of {osis_id_chirho}")
    pieces_chirho: list[str] = []
    offset_chirho = 0
    words_chirho: list[WordRecordChirho] = []
    punctuation_chirho: list[PunctuationRecordChirho] = []
    pending_space_chirho = False

    def append_chirho(text_chirho: str) -> tuple[int, int]:
        nonlocal offset_chirho
        start_chirho = offset_chirho
        pieces_chirho.append(text_chirho)
        offset_chirho += utf16_length_chirho(text_chirho)
        return start_chirho, offset_chirho

    for child_chirho in verse_chirho:
        tag_chirho = child_chirho.tag.removeprefix(OSIS_NS_CHIRHO)
        where_chirho = f"in {osis_id_chirho} after <{tag_chirho}>"
        if len(child_chirho):
            raise VerseStructureErrorChirho(f"nested markup inside <{tag_chirho}> {where_chirho}")
        if pending_space_chirho and pieces_chirho:
            append_chirho(" ")
        if tag_chirho == "w":
            words_chirho.append(
                read_word_chirho(child_chirho, len(words_chirho) + 1, append_chirho)
            )
        elif tag_chirho == "seg" and child_chirho.get("type") in PUNCTUATION_TYPES_CHIRHO:
            if not words_chirho:
                raise VerseStructureErrorChirho(f"punctuation before any word in {osis_id_chirho}")
            text_chirho = child_chirho.text or ""
            start_chirho, end_chirho = append_chirho(text_chirho)
            punctuation_chirho.append(
                PunctuationRecordChirho(
                    type_chirho=child_chirho.get("type", ""),
                    text_chirho=text_chirho,
                    start_chirho=start_chirho,
                    end_chirho=end_chirho,
                    after_word_chirho=words_chirho[-1].oshb_id_chirho,
                )
            )
        else:
            kind_chirho = child_chirho.get("type")
            raise VerseStructureErrorChirho(
                f"unsupported <{tag_chirho}{' type=' + kind_chirho if kind_chirho else ''}> "
                f"in {osis_id_chirho}"
            )
        pending_space_chirho = require_whitespace_chirho(child_chirho.tail, where_chirho)

    return VerseChirho(
        osis_id_chirho=osis_id_chirho,
        canonical_text_chirho="".join(pieces_chirho),
        words_chirho=tuple(words_chirho),
        punctuation_chirho=tuple(punctuation_chirho),
    )


def read_word_chirho(
    element_chirho: ET.Element, position_chirho: int, append_chirho
) -> WordRecordChirho:
    attributes_chirho = dict(element_chirho.attrib)
    word_id_chirho = attributes_chirho.get("id", f"word {position_chirho}")
    unknown_chirho = sorted(set(attributes_chirho) - WORD_ATTRIBUTES_CHIRHO)
    if unknown_chirho:
        raise VerseStructureErrorChirho(
            f"{word_id_chirho}: unsupported attributes {unknown_chirho}"
        )
    for required_chirho in ("id", "lemma", "morph"):
        if not attributes_chirho.get(required_chirho):
            raise VerseStructureErrorChirho(f"{word_id_chirho}: missing {required_chirho}")
    source_text_chirho = element_chirho.text or ""
    segments_chirho = tuple(source_text_chirho.split(DIVIDER_CHIRHO))
    check_segments_chirho(word_id_chirho, segments_chirho)
    text_chirho = "".join(segments_chirho)
    start_chirho, end_chirho = append_chirho(text_chirho)
    return WordRecordChirho(
        oshb_id_chirho=attributes_chirho["id"],
        position_chirho=position_chirho,
        source_text_chirho=source_text_chirho,
        text_chirho=text_chirho,
        segments_chirho=segments_chirho,
        start_chirho=start_chirho,
        end_chirho=end_chirho,
        lemma_chirho=attributes_chirho["lemma"],
        morph_chirho=attributes_chirho["morph"],
        attributes_chirho=tuple(sorted(attributes_chirho.items())),
    )
