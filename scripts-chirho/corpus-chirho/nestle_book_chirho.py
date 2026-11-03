# For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life. — John 3:16 (KJV)
"""Read one book of the pinned Nestle 1904 morphology CSV into canonical verse lines and words.

Workflow: scripts-chirho/corpus-chirho/README-chirho.md, "Greek corpus import", node
nestle_book_chirho. The CSV (morph/Nestle1904.csv: CC0 morphology over the public-domain 1904
text) has one word per CRLF row: BCV, the word as printed with its punctuation, functional parse,
formal parse, Strong's number (many verbs add Strong's TVM code after "&"), lemma and normalized
form, then an empty column. A verse's canonical line is its printed words joined by single
spaces. A token is the word inside the printed text: an opening "(" or "—" and closing
punctuation stay outside it, an elision apostrophe stays in it. Only the requested book's rows
are interpreted, and each must have exactly this shape; its chapters and verses must run
1, 2, 3, ...
"""

from __future__ import annotations

import re
import unicodedata
from dataclasses import dataclass

HEADER_CHIRHO = ["BCV", "text", "func_morph", "form_morph", "strongs", "lemma", "normalized"]
BCV_PATTERN_CHIRHO = re.compile(
    r"(?P<book>[1-3]?[A-Za-z]+) (?P<chapter>[1-9]\d*):(?P<verse>[1-9]\d*)"
)
# README: "a single Strong's number in base 10", optionally "&" and a TVM number. A few values
# carry a leading zero (0964); the raw value is kept and the number is read in base 10.
STRONGS_PATTERN_CHIRHO = re.compile(r"(?P<number>0*[1-9]\d*)(?:&(?P<tvm>5\d{3}))?")
# Exact code points of the printed punctuation. The text is never normalized: NFC would turn
# U+0387 GREEK ANO TELEIA into U+00B7 and U+037E GREEK QUESTION MARK into ";".
LEADING_CHIRHO = "(—"
TRAILING_CHIRHO = ",.·;)—("
ELISION_CHIRHO = "’"


class NestleFormatErrorChirho(ValueError):
    """The CSV holds a row or structure this reader does not handle, so nothing is guessed."""


def utf16_length_chirho(text_chirho: str) -> int:
    return len(text_chirho.encode("utf-16-le")) // 2


@dataclass(frozen=True)
class GreekWordChirho:
    id_chirho: str
    printed_chirho: str
    text_chirho: str
    leading_chirho: str
    func_morph_chirho: str
    form_morph_chirho: str
    strongs_chirho: str
    tvm_chirho: str | None
    lemma_chirho: str
    normalized_chirho: str


@dataclass(frozen=True)
class GreekVerseChirho:
    osis_id_chirho: str
    chapter_chirho: int
    verse_chirho: int
    canonical_text_chirho: str
    # (word, start, end) with UTF-16 offsets of the token inside the canonical line
    words_chirho: tuple[tuple[GreekWordChirho, int, int], ...]


def split_printed_chirho(printed_chirho: str, where_chirho: str) -> tuple[str, str, str]:
    """(leading punctuation, word, trailing punctuation) of one printed word."""
    core_chirho = printed_chirho.lstrip(LEADING_CHIRHO)
    leading_chirho = printed_chirho[: len(printed_chirho) - len(core_chirho)]
    word_chirho = core_chirho.rstrip(TRAILING_CHIRHO)
    trailing_chirho = core_chirho[len(word_chirho) :]
    if (
        not word_chirho
        or not unicodedata.category(word_chirho[0]).startswith("L")
        or any(
            not unicodedata.category(character_chirho)[0] in "LM"
            and character_chirho != ELISION_CHIRHO
            for character_chirho in word_chirho
        )
        or ELISION_CHIRHO in word_chirho[:-1]
    ):
        raise NestleFormatErrorChirho(
            f"{where_chirho}: cannot separate the word in {printed_chirho!r}"
        )
    return leading_chirho, word_chirho, trailing_chirho


def book_rows_chirho(data_chirho: bytes, book_chirho: str) -> list[list[str]]:
    text_chirho = data_chirho.decode("utf-8").removeprefix("﻿")
    lines_chirho = text_chirho.split("\r\n")
    if (
        lines_chirho[0].split("\t") != HEADER_CHIRHO
        or lines_chirho[-1] != ""
        or "\n" in "".join(lines_chirho)
    ):
        raise NestleFormatErrorChirho("Nestle1904.csv: unexpected header or line endings")
    rows_chirho = []
    for line_chirho in lines_chirho[1:-1]:
        if not line_chirho.startswith(f"{book_chirho} "):
            continue
        fields_chirho = line_chirho.split("\t")
        if len(fields_chirho) != 8 or fields_chirho[7] != "" or not all(fields_chirho[:7]):
            raise NestleFormatErrorChirho(f"unsupported row shape: {line_chirho!r}")
        rows_chirho.append(fields_chirho[:7])
    if not rows_chirho:
        raise NestleFormatErrorChirho(f"no rows for {book_chirho}")
    return rows_chirho


def read_book_chirho(data_chirho: bytes, book_chirho: str) -> tuple[GreekVerseChirho, ...]:
    grouped_chirho: dict[tuple[int, int], list[list[str]]] = {}
    last_chirho: tuple[int, int] | None = None
    for fields_chirho in book_rows_chirho(data_chirho, book_chirho):
        match_chirho = BCV_PATTERN_CHIRHO.fullmatch(fields_chirho[0])
        if not match_chirho or match_chirho["book"] != book_chirho:
            raise NestleFormatErrorChirho(f"bad reference {fields_chirho[0]!r}")
        key_chirho = (int(match_chirho["chapter"]), int(match_chirho["verse"]))
        if key_chirho != last_chirho:
            # Each new verse is the next one, or verse 1 of the next chapter; rows never return.
            follows_chirho = (
                key_chirho == (1, 1)
                if last_chirho is None
                else key_chirho in ((last_chirho[0], last_chirho[1] + 1), (last_chirho[0] + 1, 1))
            )
            if key_chirho in grouped_chirho or not follows_chirho:
                raise NestleFormatErrorChirho(
                    f"{fields_chirho[0]}: verse numbering gap or disorder"
                )
            grouped_chirho[key_chirho] = []
            last_chirho = key_chirho
        grouped_chirho[key_chirho].append(fields_chirho)
    verses_chirho = []
    for (chapter_chirho, verse_chirho), rows_chirho in grouped_chirho.items():
        osis_chirho = f"{book_chirho}.{chapter_chirho}.{verse_chirho}"
        printed_chirho: list[str] = []
        words_chirho = []
        cursor_chirho = 0
        for index_chirho, fields_chirho in enumerate(rows_chirho, start=1):
            (
                printed_word_chirho,
                func_chirho,
                form_chirho,
                strongs_chirho,
                lemma_chirho,
                normalized_chirho,
            ) = fields_chirho[1:]
            leading_chirho, word_chirho, _ = split_printed_chirho(printed_word_chirho, osis_chirho)
            strongs_match_chirho = STRONGS_PATTERN_CHIRHO.fullmatch(strongs_chirho)
            if not strongs_match_chirho:
                raise NestleFormatErrorChirho(f"{osis_chirho}: Strong's value {strongs_chirho!r}")
            if printed_chirho:
                cursor_chirho += 1
            start_chirho = cursor_chirho + utf16_length_chirho(leading_chirho)
            words_chirho.append(
                (
                    GreekWordChirho(
                        id_chirho=f"{osis_chirho}!{index_chirho}",
                        printed_chirho=printed_word_chirho,
                        text_chirho=word_chirho,
                        leading_chirho=leading_chirho,
                        func_morph_chirho=func_chirho,
                        form_morph_chirho=form_chirho,
                        strongs_chirho=strongs_match_chirho["number"],
                        tvm_chirho=strongs_match_chirho["tvm"],
                        lemma_chirho=lemma_chirho,
                        normalized_chirho=normalized_chirho,
                    ),
                    start_chirho,
                    start_chirho + utf16_length_chirho(word_chirho),
                )
            )
            printed_chirho.append(printed_word_chirho)
            cursor_chirho += utf16_length_chirho(printed_word_chirho)
        verses_chirho.append(
            GreekVerseChirho(
                osis_chirho,
                chapter_chirho,
                verse_chirho,
                " ".join(printed_chirho),
                tuple(words_chirho),
            )
        )
    return tuple(verses_chirho)


def parenthesized_passages_chirho(
    verses_chirho: tuple[GreekVerseChirho, ...],
) -> list[tuple[str, str]]:
    """(first verse id, last verse id) of each printed parenthesis that spans verses.

    Parentheses inside one verse (the "which means ..." asides) are not passages and are skipped.
    """
    passages_chirho: list[tuple[str, str]] = []
    opened_chirho: str | None = None
    for verse_chirho in verses_chirho:
        for word_chirho, _, _ in verse_chirho.words_chirho:
            for character_chirho in word_chirho.printed_chirho:
                if character_chirho == "(":
                    if opened_chirho is not None:
                        raise NestleFormatErrorChirho(
                            f"{verse_chirho.osis_id_chirho}: nested parenthesis"
                        )
                    opened_chirho = verse_chirho.osis_id_chirho
                elif character_chirho == ")":
                    if opened_chirho is None:
                        raise NestleFormatErrorChirho(
                            f"{verse_chirho.osis_id_chirho}: unmatched parenthesis"
                        )
                    if opened_chirho != verse_chirho.osis_id_chirho:
                        passages_chirho.append((opened_chirho, verse_chirho.osis_id_chirho))
                    opened_chirho = None
    if opened_chirho is not None:
        raise NestleFormatErrorChirho(f"{opened_chirho}: parenthesis never closed")
    return passages_chirho
