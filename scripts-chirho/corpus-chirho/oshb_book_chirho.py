# For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life. — John 3:16 (KJV)
"""Read every verse of a pinned OSHB book into a canonical line, word spans and source notes.

Workflow: scripts-chirho/corpus-chirho/README-chirho.md, "Corpus import", node book_chirho.
The canonical line is OSHB's main line: each word without its morpheme slashes, then maqqef,
paseq and sof pasuq, with every run of XML whitespace written as one space. A ketiv stays in
that line exactly as written and its qere comes back as a reading attached to it. Paragraph
letters, editorial notes and small letters are recorded beside the line, never inside it. Any
element, attribute or seg type not handled here stops the import instead of being skipped.
"""

from __future__ import annotations

import re
import unicodedata
import xml.etree.ElementTree as ET
from dataclasses import dataclass

from source_files_chirho import parse_xml_chirho

OSIS_NS_CHIRHO = "{http://www.bibletechnologies.net/2003/OSIS/namespace}"
# Punctuation of the canonical line, each with the one character its seg must hold.
PUNCTUATION_CHIRHO = {
    "x-maqqef": ("maqqef", "־"),
    "x-paseq": ("paseq", "׀"),
    "x-sof-pasuq": ("sof_pasuq", "׃"),
}
# Maqqef and sof pasuq join the word before them; whitespace there would be a new structure.
ATTACHED_CHIRHO = frozenset({"maqqef", "sof_pasuq"})
# Paragraph letters (petuchah, setumah) are layout marks: recorded, kept out of the line.
PARAGRAPH_CHIRHO = {"x-pe": ("pe", "פ"), "x-samekh": ("samekh", "ס")}
# OSHB marks where Hebrew and English (KJV) verse numbers differ, e.g. KJV:Gen.31.55 on Gen 32:1.
KJV_NOTE_CHIRHO = re.compile(r"KJV:(?P<verse>[1-3]?[A-Za-z]+\.[1-9]\d*\.[1-9]\d*)")
REQUIRED_WORD_ATTRIBUTES_CHIRHO = frozenset({"lemma", "morph", "id"})
OPTIONAL_WORD_ATTRIBUTES_CHIRHO = frozenset({"n"})


class BookFormatErrorChirho(ValueError):
    """The book uses a structure this reader does not handle, so nothing is guessed."""


def utf16_length_chirho(text_chirho: str) -> int:
    """Length in UTF-16 code units, the unit of JavaScript string offsets."""
    return len(text_chirho.encode("utf-16-le")) // 2


def tag_chirho(element_chirho: ET.Element) -> str:
    return element_chirho.tag.removeprefix(OSIS_NS_CHIRHO)


@dataclass(frozen=True)
class SourceWordChirho:
    """One <w>: its text with OSHB's morpheme slashes, raw attributes and any small letters."""

    id_chirho: str
    marked_text_chirho: str
    lemma_chirho: str
    morph_chirho: str
    accents_chirho: str | None
    # (UTF-16 offset inside text_chirho, letter) for each <seg type="x-small">.
    small_letters_chirho: tuple[tuple[int, str], ...]

    @property
    def text_chirho(self) -> str:
        return self.marked_text_chirho.replace("/", "")

    @property
    def segments_chirho(self) -> tuple[str, ...]:
        return tuple(self.marked_text_chirho.split("/"))


@dataclass(frozen=True)
class VerseWordChirho:
    """A main-line word placed in the canonical line, with the qere when it is a ketiv."""

    word_chirho: SourceWordChirho
    start_chirho: int
    end_chirho: int
    ketiv_chirho: bool
    qere_chirho: tuple[SourceWordChirho, ...]


@dataclass(frozen=True)
class VerseNoteChirho:
    """A source mark kept beside the line: paragraph letter, editorial note or small letter."""

    kind_chirho: str
    code_chirho: str
    text_chirho: str
    after_token_id_chirho: str | None
    anchor_chirho: str
    start_chirho: int | None = None
    end_chirho: int | None = None


@dataclass(frozen=True)
class BookVerseChirho:
    osis_id_chirho: str
    chapter_chirho: int
    verse_chirho: int
    canonical_text_chirho: str
    words_chirho: tuple[VerseWordChirho, ...]
    notes_chirho: tuple[VerseNoteChirho, ...]


def whitespace_only_chirho(text_chirho: str | None, where_chirho: str) -> bool:
    """True when the text is whitespace; loose source text outside a word is refused."""
    if (text_chirho or "").strip():
        raise BookFormatErrorChirho(f"{where_chirho}: loose text {text_chirho.strip()!r}")
    return bool(text_chirho)


def read_word_chirho(
    element_chirho: ET.Element, where_chirho: str, ketiv_allowed_chirho: bool
) -> SourceWordChirho:
    attributes_chirho = set(element_chirho.attrib)
    allowed_chirho = REQUIRED_WORD_ATTRIBUTES_CHIRHO | OPTIONAL_WORD_ATTRIBUTES_CHIRHO
    if ketiv_allowed_chirho:
        allowed_chirho = allowed_chirho | {"type"}
    if not REQUIRED_WORD_ATTRIBUTES_CHIRHO <= attributes_chirho <= allowed_chirho or (
        element_chirho.get("type", "x-ketiv") != "x-ketiv"
    ):
        raise BookFormatErrorChirho(
            f"{where_chirho}: <w> with attributes {sorted(element_chirho.attrib.items())}"
        )
    id_chirho = element_chirho.get("id", "")
    marked_chirho = element_chirho.text or ""
    small_chirho: list[tuple[int, str]] = []
    for child_chirho in element_chirho:
        if (
            tag_chirho(child_chirho) != "seg"
            or child_chirho.attrib != {"type": "x-small"}
            or len(child_chirho)
            or not child_chirho.text
        ):
            raise BookFormatErrorChirho(f"{where_chirho}: unsupported markup inside {id_chirho}")
        offset_chirho = utf16_length_chirho(marked_chirho.replace("/", ""))
        small_chirho.append((offset_chirho, child_chirho.text))
        marked_chirho += child_chirho.text + (child_chirho.tail or "")
    word_chirho = SourceWordChirho(
        id_chirho=id_chirho,
        marked_text_chirho=marked_chirho,
        lemma_chirho=element_chirho.get("lemma", ""),
        morph_chirho=element_chirho.get("morph", ""),
        accents_chirho=element_chirho.get("n"),
        small_letters_chirho=tuple(small_chirho),
    )
    for segment_chirho in word_chirho.segments_chirho:
        if (
            not segment_chirho
            or any(character_chirho.isspace() for character_chirho in segment_chirho)
            or unicodedata.category(segment_chirho[0]).startswith("M")
        ):
            raise BookFormatErrorChirho(
                f"{where_chirho}: {id_chirho} has segment {segment_chirho!r}; a segment must be "
                "non-empty, without spaces, and start on a base letter"
            )
    return word_chirho


def read_qere_chirho(
    note_chirho: ET.Element | None, ketiv_chirho: SourceWordChirho, where_chirho: str
) -> tuple[SourceWordChirho, ...]:
    """Return the qere words of the variant note that must follow a ketiv."""
    if (
        note_chirho is None
        or tag_chirho(note_chirho) != "note"
        or note_chirho.attrib != {"type": "variant"}
    ):
        raise BookFormatErrorChirho(f"{where_chirho}: ketiv {ketiv_chirho.id_chirho} has no qere")
    whitespace_only_chirho(note_chirho.text, where_chirho)
    children_chirho = list(note_chirho)
    if [tag_chirho(child_chirho) for child_chirho in children_chirho] != ["catchWord", "rdg"]:
        raise BookFormatErrorChirho(f"{where_chirho}: variant note shape is not catchWord + rdg")
    catch_chirho, reading_chirho = children_chirho
    if (
        catch_chirho.attrib
        or len(catch_chirho)
        or catch_chirho.text != ketiv_chirho.marked_text_chirho
    ):
        raise BookFormatErrorChirho(
            f"{where_chirho}: catchWord {catch_chirho.text!r} is not ketiv "
            f"{ketiv_chirho.marked_text_chirho!r}"
        )
    if reading_chirho.attrib != {"type": "x-qere"}:
        raise BookFormatErrorChirho(
            f"{where_chirho}: reading {reading_chirho.attrib} is not a qere"
        )
    whitespace_only_chirho(reading_chirho.text, where_chirho)
    qere_chirho = []
    for child_chirho in reading_chirho:
        if tag_chirho(child_chirho) != "w":
            raise BookFormatErrorChirho(f"{where_chirho}: qere holds <{tag_chirho(child_chirho)}>")
        qere_chirho.append(read_word_chirho(child_chirho, where_chirho, ketiv_allowed_chirho=False))
        whitespace_only_chirho(child_chirho.tail, where_chirho)
    for child_chirho in children_chirho:
        whitespace_only_chirho(child_chirho.tail, where_chirho)
    if not qere_chirho:
        raise BookFormatErrorChirho(f"{where_chirho}: empty qere for {ketiv_chirho.id_chirho}")
    return tuple(qere_chirho)


def read_alternative_chirho(
    note_chirho: ET.Element,
    words_chirho: list[VerseWordChirho],
    where_chirho: str,
    anchor_chirho: str,
) -> VerseNoteChirho:
    """An alternative accentuation of the word just before it (Gen 35:22's two accent systems)."""
    children_chirho = list(note_chirho)
    whitespace_only_chirho(note_chirho.text, where_chirho)
    if [tag_chirho(child) for child in children_chirho] != ["catchWord", "rdg"] or not words_chirho:
        raise BookFormatErrorChirho(
            f"{where_chirho}: alternative note shape is not catchWord + rdg"
        )
    catch_chirho, reading_chirho = children_chirho
    word_chirho = words_chirho[-1].word_chirho
    if (
        catch_chirho.attrib
        or len(catch_chirho)
        or catch_chirho.text != word_chirho.marked_text_chirho
        or reading_chirho.attrib != {"type": "x-accent"}
        or len(reading_chirho)
        or not (reading_chirho.text or "").strip()
    ):
        raise BookFormatErrorChirho(
            f"{where_chirho}: alternative reading does not match word {word_chirho.id_chirho}"
        )
    for child_chirho in children_chirho:
        whitespace_only_chirho(child_chirho.tail, where_chirho)
    return VerseNoteChirho(
        "alternative_accent",
        "x-accent",
        reading_chirho.text.replace("/", ""),
        word_chirho.id_chirho,
        anchor_chirho,
    )


def read_exegesis_chirho(
    note_chirho: ET.Element, after_id_chirho: str | None, anchor_chirho: str, where_chirho: str
) -> VerseNoteChirho:
    """OSHB's editorial explanation, e.g. how WLC divides a word; only plain <rdg> inside."""
    for child_chirho in note_chirho:
        if tag_chirho(child_chirho) != "rdg" or child_chirho.attrib or len(child_chirho):
            raise BookFormatErrorChirho(f"{where_chirho}: exegesis note with unsupported markup")
    text_chirho = " ".join("".join(note_chirho.itertext()).split())
    if not text_chirho:
        raise BookFormatErrorChirho(f"{where_chirho}: empty exegesis note")
    return VerseNoteChirho("exegesis", "exegesis", text_chirho, after_id_chirho, anchor_chirho)


def parse_verse_chirho(
    verse_element_chirho: ET.Element, chapter_chirho: int, verse_chirho: int
) -> BookVerseChirho:
    osis_id_chirho = verse_element_chirho.get("osisID", "")
    line_chirho: list[str] = []
    length_chirho = 0
    gap_chirho = whitespace_only_chirho(verse_element_chirho.text, osis_id_chirho)
    words_chirho: list[VerseWordChirho] = []
    notes_chirho: list[VerseNoteChirho] = []
    anchor_chirho = "verse_start"

    def append_chirho(text_chirho: str, attached_chirho: bool) -> tuple[int, int]:
        nonlocal length_chirho, gap_chirho
        if gap_chirho and attached_chirho:
            raise BookFormatErrorChirho(f"{osis_id_chirho}: whitespace before {text_chirho!r}")
        if gap_chirho and line_chirho:
            line_chirho.append(" ")
            length_chirho += 1
        start_chirho = length_chirho
        line_chirho.append(text_chirho)
        length_chirho += utf16_length_chirho(text_chirho)
        gap_chirho = False
        return start_chirho, length_chirho

    def last_id_chirho() -> str | None:
        return words_chirho[-1].word_chirho.id_chirho if words_chirho else None

    children_chirho = list(verse_element_chirho)
    index_chirho = 0
    while index_chirho < len(children_chirho):
        element_chirho = children_chirho[index_chirho]
        tag_name_chirho = tag_chirho(element_chirho)
        tail_holder_chirho = element_chirho
        if tag_name_chirho == "w":
            ketiv_chirho = element_chirho.get("type") == "x-ketiv"
            word_chirho = read_word_chirho(
                element_chirho, osis_id_chirho, ketiv_allowed_chirho=True
            )
            qere_chirho: tuple[SourceWordChirho, ...] = ()
            if ketiv_chirho:
                # The variant note sits directly after its ketiv; nothing may come between.
                whitespace_only_chirho(element_chirho.tail, osis_id_chirho)
                if element_chirho.tail:
                    raise BookFormatErrorChirho(f"{osis_id_chirho}: space between ketiv and qere")
                note_chirho = (
                    children_chirho[index_chirho + 1]
                    if index_chirho + 1 < len(children_chirho)
                    else None
                )
                qere_chirho = read_qere_chirho(note_chirho, word_chirho, osis_id_chirho)
                index_chirho += 1
                tail_holder_chirho = note_chirho
            start_chirho, end_chirho = append_chirho(word_chirho.text_chirho, False)
            words_chirho.append(
                VerseWordChirho(word_chirho, start_chirho, end_chirho, ketiv_chirho, qere_chirho)
            )
            for offset_chirho, letter_chirho in word_chirho.small_letters_chirho:
                notes_chirho.append(
                    VerseNoteChirho(
                        kind_chirho="small_letter",
                        code_chirho="x-small",
                        text_chirho=letter_chirho,
                        after_token_id_chirho=word_chirho.id_chirho,
                        anchor_chirho="inside_word",
                        start_chirho=start_chirho + offset_chirho,
                        end_chirho=start_chirho
                        + offset_chirho
                        + utf16_length_chirho(letter_chirho),
                    )
                )
            anchor_chirho = "variant" if ketiv_chirho else "word"
        elif tag_name_chirho == "seg" and element_chirho.get("type") in PUNCTUATION_CHIRHO:
            kind_chirho, character_chirho = PUNCTUATION_CHIRHO[element_chirho.get("type")]
            if (
                element_chirho.attrib.keys() != {"type"}
                or len(element_chirho)
                or (element_chirho.text != character_chirho)
            ):
                raise BookFormatErrorChirho(f"{osis_id_chirho}: malformed {kind_chirho}")
            if not words_chirho:
                raise BookFormatErrorChirho(f"{osis_id_chirho}: {kind_chirho} before any word")
            append_chirho(character_chirho, kind_chirho in ATTACHED_CHIRHO)
            anchor_chirho = kind_chirho
        elif tag_name_chirho == "seg" and element_chirho.get("type") in PARAGRAPH_CHIRHO:
            code_chirho, character_chirho = PARAGRAPH_CHIRHO[element_chirho.get("type")]
            if (
                element_chirho.attrib.keys() != {"type"}
                or len(element_chirho)
                or (element_chirho.text != character_chirho)
            ):
                raise BookFormatErrorChirho(f"{osis_id_chirho}: malformed paragraph {code_chirho}")
            notes_chirho.append(
                VerseNoteChirho(
                    "paragraph", code_chirho, character_chirho, last_id_chirho(), anchor_chirho
                )
            )
        elif tag_name_chirho == "note" and element_chirho.attrib.keys() == {"n"}:
            if len(element_chirho) or not (element_chirho.text or "").strip():
                raise BookFormatErrorChirho(f"{osis_id_chirho}: editorial note with markup")
            notes_chirho.append(
                VerseNoteChirho(
                    "editorial",
                    element_chirho.get("n", ""),
                    element_chirho.text.strip(),
                    last_id_chirho(),
                    anchor_chirho,
                )
            )
        elif tag_name_chirho == "note" and not element_chirho.attrib:
            match_chirho = KJV_NOTE_CHIRHO.fullmatch((element_chirho.text or "").strip())
            if len(element_chirho) or not match_chirho:
                raise BookFormatErrorChirho(
                    f"{osis_id_chirho}: unsupported plain note {element_chirho.text!r}"
                )
            notes_chirho.append(
                VerseNoteChirho(
                    "versification", "KJV", match_chirho["verse"], last_id_chirho(), anchor_chirho
                )
            )
        elif tag_name_chirho == "note" and element_chirho.attrib == {"type": "alternative"}:
            notes_chirho.append(
                read_alternative_chirho(element_chirho, words_chirho, osis_id_chirho, anchor_chirho)
            )
        elif tag_name_chirho == "note" and element_chirho.attrib == {"type": "exegesis"}:
            notes_chirho.append(
                read_exegesis_chirho(
                    element_chirho, last_id_chirho(), anchor_chirho, osis_id_chirho
                )
            )
        else:
            raise BookFormatErrorChirho(
                f"{osis_id_chirho}: unsupported <{tag_name_chirho}> {dict(element_chirho.attrib)}"
            )
        if whitespace_only_chirho(tail_holder_chirho.tail, osis_id_chirho):
            gap_chirho = True
        index_chirho += 1
    if not words_chirho:
        raise BookFormatErrorChirho(f"{osis_id_chirho}: verse without words")
    return BookVerseChirho(
        osis_id_chirho=osis_id_chirho,
        chapter_chirho=chapter_chirho,
        verse_chirho=verse_chirho,
        canonical_text_chirho="".join(line_chirho),
        words_chirho=tuple(words_chirho),
        notes_chirho=tuple(notes_chirho),
    )


def parse_book_chirho(data_chirho: bytes, book_id_chirho: str) -> tuple[BookVerseChirho, ...]:
    """Every verse of the book, after checking chapter and verse numbering is 1, 2, 3, ..."""
    root_chirho = parse_xml_chirho(data_chirho, f"{book_id_chirho}.xml")
    books_chirho = [
        division_chirho
        for division_chirho in root_chirho.iter(f"{OSIS_NS_CHIRHO}div")
        if division_chirho.get("type") == "book"
    ]
    if len(books_chirho) != 1 or books_chirho[0].get("osisID") != book_id_chirho:
        raise BookFormatErrorChirho(f"expected exactly one book division {book_id_chirho}")
    verses_chirho: list[BookVerseChirho] = []
    for chapter_number_chirho, chapter_chirho in enumerate(books_chirho[0], start=1):
        chapter_id_chirho = f"{book_id_chirho}.{chapter_number_chirho}"
        if (
            tag_chirho(chapter_chirho) != "chapter"
            or chapter_chirho.get("osisID") != chapter_id_chirho
        ):
            raise BookFormatErrorChirho(f"expected chapter {chapter_id_chirho}")
        whitespace_only_chirho(chapter_chirho.text, chapter_id_chirho)
        for verse_number_chirho, verse_element_chirho in enumerate(chapter_chirho, start=1):
            verse_id_chirho = f"{chapter_id_chirho}.{verse_number_chirho}"
            if (
                tag_chirho(verse_element_chirho) != "verse"
                or verse_element_chirho.get("osisID") != verse_id_chirho
            ):
                raise BookFormatErrorChirho(f"expected verse {verse_id_chirho}")
            whitespace_only_chirho(verse_element_chirho.tail, verse_id_chirho)
            verses_chirho.append(
                parse_verse_chirho(verse_element_chirho, chapter_number_chirho, verse_number_chirho)
            )
    if not verses_chirho:
        raise BookFormatErrorChirho(f"{book_id_chirho}: no verses")
    return tuple(verses_chirho)
