# For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life. — John 3:16 (KJV)
"""Join Berean Interlinear English glosses to Nestle 1904 words, guarded by the Greek word.

Workflow: scripts-chirho/corpus-chirho/README-chirho.md, "Greek corpus import", node berean_chirho.
biblicalhumanities extracted the Berean Interlinear glosses into <w osisId="John.1.1!1">
elements, each holding <greek> and <gloss>. A token takes the gloss at its own id only when that
<greek> is NFD-equal to the token's word; otherwise it gets none, and its note says why. Glosses
are kept as given, "-" included (Berean's mark for a word left untranslated). They are Berean
glosses, not Global Bible Tools approvals, and their public-domain status is stated by Berean,
not a CC0 dedication (see the acquisition manifest).
"""

from __future__ import annotations

import unicodedata
from collections import Counter

from nestle_book_chirho import GreekVerseChirho
from source_files_chirho import parse_xml_chirho

GLOSS_NOTE_CHIRHO = (
    "English gloss: Berean Interlinear Bible, public domain as Berean states; not a GBT approval."
)
MISMATCH_NOTE_CHIRHO = (
    "No English gloss: the Berean entry at this id has a different Greek word ({greek})."
)
MISSING_NOTE_CHIRHO = "No English gloss: the Berean file has no entry for this word."
EMPTY_NOTE_CHIRHO = "No English gloss: the Berean entry is empty."


class BereanGlossErrorChirho(ValueError):
    """The glosses file has a shape this join does not handle, so no gloss is taken from it."""


def status_text_chirho(element_chirho) -> str:
    """The editor's <status> notes are plain text; any markup inside one is refused."""
    if element_chirho.attrib or len(element_chirho) or not (element_chirho.text or "").strip():
        raise BereanGlossErrorChirho("a <status> note with attributes, markup or no text")
    return element_chirho.text.strip()


# (verse id or None, id of the word the note precedes or None, note text)
EditorNoteChirho = tuple[str | None, str | None, str]


def berean_entries_chirho(
    data_chirho: bytes, book_chirho: str
) -> tuple[dict[str, tuple[str, str]], list[EditorNoteChirho]]:
    """osisId -> (Greek word, gloss) for one book, plus the editor's notes that touch it.

    Entries of other books are not interpreted. The file's <status> notes (for example "BIB
    combines the next two words into one gloss.") are kept, with the word each one precedes,
    when they sit in one of the book's verses or name the book.
    """
    root_chirho = parse_xml_chirho(data_chirho, "berean-interlinear-glosses.xml")
    if root_chirho.tag != "root":
        raise BereanGlossErrorChirho(f"unexpected root <{root_chirho.tag}>")
    entries_chirho: dict[str, tuple[str, str]] = {}
    notes_chirho: list[EditorNoteChirho] = []
    for verse_chirho in root_chirho:
        if verse_chirho.tag == "status":
            text_chirho = status_text_chirho(verse_chirho)
            if f"{book_chirho}." in text_chirho:
                notes_chirho.append((None, None, text_chirho))
            continue
        if verse_chirho.tag != "verse":
            raise BereanGlossErrorChirho(f"unexpected <{verse_chirho.tag}> under <root>")
        in_book_chirho = any(
            (word.get("osisId") or "").startswith(f"{book_chirho}.") for word in verse_chirho
        )
        children_chirho = list(verse_chirho)
        for index_chirho, word_chirho in enumerate(children_chirho):
            if word_chirho.tag == "status":
                text_chirho = status_text_chirho(word_chirho)
                if in_book_chirho or f"{book_chirho}." in text_chirho:
                    following_chirho = next(
                        (
                            later.get("osisId")
                            for later in children_chirho[index_chirho + 1 :]
                            if later.tag == "w" and later.get("osisId")
                        ),
                        None,
                    )
                    verse_id_chirho = following_chirho.split("!")[0] if following_chirho else None
                    notes_chirho.append((verse_id_chirho, following_chirho, text_chirho))
                continue
            id_chirho = word_chirho.get("osisId") or ""
            if not id_chirho.startswith(f"{book_chirho}."):
                continue
            if word_chirho.tag != "w" or [child.tag for child in word_chirho] != ["greek", "gloss"]:
                raise BereanGlossErrorChirho(f"{id_chirho}: entry is not <w><greek/><gloss/></w>")
            if id_chirho in entries_chirho:
                raise BereanGlossErrorChirho(f"{id_chirho}: listed twice")
            entries_chirho[id_chirho] = (
                word_chirho.findtext("greek") or "",
                word_chirho.findtext("gloss") or "",
            )
    if not entries_chirho:
        raise BereanGlossErrorChirho(f"no glosses for {book_chirho}")
    return entries_chirho, notes_chirho


def join_berean_chirho(
    verses_chirho: tuple[GreekVerseChirho, ...], entries_chirho: dict[str, tuple[str, str]]
) -> tuple[dict[str, tuple[str | None, str]], Counter]:
    """Token id -> (gloss or None, provenance note), with a count of each outcome."""
    glosses_chirho: dict[str, tuple[str | None, str]] = {}
    outcomes_chirho: Counter = Counter()
    for verse_chirho in verses_chirho:
        for word_chirho, _, _ in verse_chirho.words_chirho:
            entry_chirho = entries_chirho.get(word_chirho.id_chirho)
            if entry_chirho is None:
                glosses_chirho[word_chirho.id_chirho] = (None, MISSING_NOTE_CHIRHO)
                outcomes_chirho["missing"] += 1
                continue
            greek_chirho, gloss_chirho = entry_chirho
            if unicodedata.normalize("NFD", greek_chirho) != unicodedata.normalize(
                "NFD", word_chirho.text_chirho
            ):
                glosses_chirho[word_chirho.id_chirho] = (
                    None,
                    MISMATCH_NOTE_CHIRHO.format(greek=greek_chirho),
                )
                outcomes_chirho["greek_mismatch"] += 1
            elif not gloss_chirho.strip():
                glosses_chirho[word_chirho.id_chirho] = (None, EMPTY_NOTE_CHIRHO)
                outcomes_chirho["empty"] += 1
            else:
                glosses_chirho[word_chirho.id_chirho] = (gloss_chirho.strip(), GLOSS_NOTE_CHIRHO)
                outcomes_chirho["glossed"] += 1
    token_ids_chirho = set(glosses_chirho)
    outcomes_chirho["unused_entries"] = sum(
        1 for id_chirho in entries_chirho if id_chirho not in token_ids_chirho
    )
    return glosses_chirho, outcomes_chirho
