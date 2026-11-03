# For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life. — John 3:16 (KJV)
"""Whole-WLC canonical text and source variants, including structures absent from the first books.

Workflow: whole-bible-chirho.md, hebrew_chirho. Word bytes never normalize. Unknown teaching
analysis stays explicitly unavailable; notes and variant readings are retained beside the line.
"""

from __future__ import annotations

import re
from dataclasses import replace

from corpus_tokens_chirho import reading_fields_chirho
from oshb_book_chirho import (
    OSIS_NS_CHIRHO,
    PARAGRAPH_CHIRHO,
    PUNCTUATION_CHIRHO,
    BookVerseChirho,
    SourceWordChirho,
    VerseNoteChirho,
    VerseWordChirho,
    utf16_length_chirho,
)
from source_files_chirho import parse_xml_chirho

LETTER_MARKS_CHIRHO = frozenset(("x-small", "x-large", "x-suspended"))
LAYOUT_MARKS_CHIRHO = frozenset(("x-reversednun", *PARAGRAPH_CHIRHO))


def word_chirho(element_chirho) -> SourceWordChirho:
    if set(element_chirho.attrib) - {"lemma", "morph", "id", "n", "type"}:
        raise ValueError(f"Unsupported source word attributes: {element_chirho.attrib}")
    for required_chirho in ("id", "lemma", "morph"):
        if not element_chirho.get(required_chirho):
            raise ValueError(f"Missing source word {required_chirho}")
    for child_chirho in element_chirho:
        if (
            child_chirho.tag != OSIS_NS_CHIRHO + "seg"
            or child_chirho.get("type") not in LETTER_MARKS_CHIRHO
            or len(child_chirho)
        ):
            raise ValueError("Unknown markup inside WLC word")
    text_chirho = "".join(element_chirho.itertext())
    if not text_chirho or any(character_chirho.isspace() for character_chirho in text_chirho):
        raise ValueError("Empty or whitespace-containing WLC word")
    return SourceWordChirho(
        element_chirho.get("id"),
        text_chirho,
        element_chirho.get("lemma"),
        element_chirho.get("morph"),
        element_chirho.get("n"),
        (),
    )


def read_book_chirho(bytes_chirho: bytes, book_chirho: str) -> tuple[BookVerseChirho, ...]:
    root_chirho = parse_xml_chirho(bytes_chirho, book_chirho)
    book_elements_chirho = [
        element_chirho
        for element_chirho in root_chirho.iter(OSIS_NS_CHIRHO + "div")
        if element_chirho.get("type") == "book"
    ]
    if len(book_elements_chirho) != 1 or book_elements_chirho[0].get("osisID") != book_chirho:
        raise ValueError("Wrong WLC book")
    verses_chirho = []
    for chapter_number_chirho, chapter_chirho in enumerate(book_elements_chirho[0], 1):
        if (
            chapter_chirho.tag != OSIS_NS_CHIRHO + "chapter"
            or chapter_chirho.get("osisID") != f"{book_chirho}.{chapter_number_chirho}"
        ):
            raise ValueError("Wrong WLC chapter order")
        for number_chirho, element_chirho in enumerate(chapter_chirho, 1):
            id_chirho = f"{book_chirho}.{chapter_number_chirho}.{number_chirho}"
            if (
                element_chirho.tag != OSIS_NS_CHIRHO + "verse"
                or element_chirho.get("osisID") != id_chirho
            ):
                raise ValueError("Wrong WLC verse order")
            words_chirho = []
            notes_chirho = []
            line_chirho = ""
            gap_chirho = bool(element_chirho.text)
            if (element_chirho.text or "").strip():
                raise ValueError("Loose WLC verse text")
            for child_chirho in element_chirho:
                tag_chirho = child_chirho.tag.removeprefix(OSIS_NS_CHIRHO)
                kind_chirho = child_chirho.get("type")
                last_id_chirho = words_chirho[-1].word_chirho.id_chirho if words_chirho else None
                if tag_chirho == "w":
                    source_word_chirho = word_chirho(child_chirho)
                    if gap_chirho and line_chirho:
                        line_chirho += " "
                    start_chirho = utf16_length_chirho(line_chirho)
                    line_chirho += source_word_chirho.text_chirho
                    words_chirho.append(
                        VerseWordChirho(
                            source_word_chirho,
                            start_chirho,
                            utf16_length_chirho(line_chirho),
                            kind_chirho == "x-ketiv",
                            (),
                        )
                    )
                    gap_chirho = False
                    for nested_chirho in child_chirho:
                        notes_chirho.append(
                            VerseNoteChirho(
                                "letter_display",
                                nested_chirho.get("type"),
                                nested_chirho.text or "",
                                source_word_chirho.id_chirho,
                                "inside_word",
                            )
                        )
                elif tag_chirho == "seg" and kind_chirho in PUNCTUATION_CHIRHO:
                    _, text_chirho = PUNCTUATION_CHIRHO[kind_chirho]
                    if (
                        child_chirho.text != text_chirho
                        or len(child_chirho)
                        or set(child_chirho.attrib) - {"type", "subType"}
                    ):
                        raise ValueError("Malformed WLC punctuation")
                    if gap_chirho and line_chirho:
                        line_chirho += " "
                    line_chirho += text_chirho
                    gap_chirho = False
                elif tag_chirho == "seg" and kind_chirho in LAYOUT_MARKS_CHIRHO:
                    if len(child_chirho) or set(child_chirho.attrib) != {"type"}:
                        raise ValueError("Malformed WLC layout mark")
                    notes_chirho.append(
                        VerseNoteChirho(
                            "paragraph" if kind_chirho in PARAGRAPH_CHIRHO else "layout",
                            kind_chirho,
                            child_chirho.text or "",
                            last_id_chirho,
                            "word",
                        )
                    )
                elif tag_chirho == "note":
                    plain_chirho = " ".join("".join(child_chirho.itertext()).split())
                    if not child_chirho.attrib:
                        if not re.fullmatch(
                            r"KJV:[1-3]?[A-Za-z]+\.\d+\.\d+(?:![a-z])?", plain_chirho
                        ):
                            raise ValueError("Unknown WLC plain note")
                        notes_chirho.append(
                            VerseNoteChirho(
                                "versification",
                                "KJV",
                                plain_chirho.removeprefix("KJV:"),
                                last_id_chirho,
                                "word",
                            )
                        )
                    elif set(child_chirho.attrib) == {"n"}:
                        if len(child_chirho):
                            raise ValueError("Markup in WLC editorial note")
                        notes_chirho.append(
                            VerseNoteChirho(
                                "editorial",
                                child_chirho.get("n"),
                                plain_chirho,
                                last_id_chirho,
                                "word",
                            )
                        )
                    elif child_chirho.attrib == {"type": "variant"}:
                        catch_chirho = child_chirho.find(OSIS_NS_CHIRHO + "catchWord")
                        reading_chirho = child_chirho.find(OSIS_NS_CHIRHO + "rdg")
                        if (
                            reading_chirho is None
                            or reading_chirho.attrib != {"type": "x-qere"}
                            or any(
                                nested_chirho.tag
                                not in (OSIS_NS_CHIRHO + "catchWord", OSIS_NS_CHIRHO + "rdg")
                                for nested_chirho in child_chirho
                            )
                        ):
                            raise ValueError("Unknown WLC variant")
                        readings_chirho = []
                        for nested_chirho in reading_chirho:
                            if nested_chirho.tag == OSIS_NS_CHIRHO + "w":
                                readings_chirho.append(word_chirho(nested_chirho))
                            elif (
                                nested_chirho.tag == OSIS_NS_CHIRHO + "seg"
                                and nested_chirho.get("type") in PUNCTUATION_CHIRHO
                            ):
                                continue
                            else:
                                raise ValueError("Unknown WLC qere element")
                        catch_text_chirho = (
                            "".join(catch_chirho.itertext()) if catch_chirho is not None else ""
                        )
                        if (
                            words_chirho
                            and catch_text_chirho == words_chirho[-1].word_chirho.marked_text_chirho
                        ):
                            words_chirho[-1] = replace(
                                words_chirho[-1], qere_chirho=tuple(readings_chirho)
                            )
                        # Preserve every source reading, also qere without a written counterpart,
                        # multi-word catchwords, and intentionally empty qere, without inventing spans.
                        notes_chirho.append(
                            VerseNoteChirho(
                                "qere_source",
                                "x-qere",
                                plain_chirho or "(empty qere reading)",
                                last_id_chirho,
                                "variant",
                            )
                        )
                    elif child_chirho.attrib in ({"type": "alternative"}, {"type": "exegesis"}):
                        notes_chirho.append(
                            VerseNoteChirho(
                                "alternative_accent"
                                if kind_chirho == "alternative"
                                else "exegesis",
                                kind_chirho,
                                plain_chirho,
                                last_id_chirho,
                                "word",
                            )
                        )
                    else:
                        raise ValueError("Unknown WLC note")
                else:
                    raise ValueError(
                        f"Unknown WLC verse element: {tag_chirho} {child_chirho.attrib}"
                    )
                if (child_chirho.tail or "").strip():
                    raise ValueError("Loose WLC text after verse element")
                if child_chirho.tail:
                    gap_chirho = True
            if not words_chirho:
                raise ValueError("WLC verse contains no main-line words")
            verses_chirho.append(
                BookVerseChirho(
                    id_chirho,
                    chapter_number_chirho,
                    number_chirho,
                    line_chirho,
                    tuple(words_chirho),
                    tuple(notes_chirho),
                )
            )
    return tuple(verses_chirho)


def reading_chirho(
    source_word_chirho,
    lexicon_chirho,
    gloss_chirho=None,
    gloss_note_chirho="No aligned approved gloss.",
):
    """Retain a source lemma as a claim, but exclude conflicting analyses from picture reuse."""
    from corpus_morphology_chirho import describe_corpus_word_chirho

    try:
        fields_chirho, morphology_chirho = reading_fields_chirho(source_word_chirho, lexicon_chirho)
        fields_chirho["analysis_chirho"] = describe_corpus_word_chirho(morphology_chirho)
        fields_chirho["source_note_chirho"] = "Uncurated OSHB source analysis. " + gloss_note_chirho
    except ValueError as error_chirho:
        head_chirho = source_word_chirho.lemma_chirho.split("/")[-1].removesuffix("+")
        match_chirho = re.fullmatch(r"(\d+)(?: ([a-z]))?", head_chirho)
        lemma_chirho = (
            f"H{int(match_chirho[1])}"
            if match_chirho
            else f"oshb:{head_chirho}"
            if re.fullmatch("[bcdiklms]", head_chirho)
            else f"oshb:unresolved:{source_word_chirho.id_chirho}"
        )
        entry_chirho = lexicon_chirho.strong_chirho.get(lemma_chirho)
        fields_chirho = {
            "id_chirho": source_word_chirho.id_chirho,
            "text_chirho": source_word_chirho.text_chirho,
            "segments_chirho": list(source_word_chirho.segments_chirho),
            "raw_morphology_chirho": source_word_chirho.morph_chirho,
            "raw_lemma_chirho": source_word_chirho.lemma_chirho,
            "lemma_id_chirho": lemma_chirho,
            "lemma_augment_chirho": match_chirho[2] if match_chirho else None,
            "lexical_form_chirho": entry_chirho.lemma_chirho
            if entry_chirho
            else source_word_chirho.text_chirho,
            "pos_chirho": "unknown",
            "gender_chirho": "unknown",
            "number_chirho": "unknown",
            "state_chirho": "unknown",
            "analysis_chirho": "Teaching analysis withheld; the original source code is retained.",
            "analysis_status_chirho": "source_review_required",
            "lemma_assignment_status_chirho": "source_review_required",
            "source_note_chirho": f"Source review required: {error_chirho}. Raw lemma and morphology are unchanged. {gloss_note_chirho}",
        }
    fields_chirho["source_language_chirho"] = (
        "arc" if source_word_chirho.morph_chirho.startswith("A") else "he"
    )
    fields_chirho["gloss_chirho"] = gloss_chirho
    return fields_chirho
