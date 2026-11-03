# For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life. — John 3:16 (KJV)
"""Turn source words into reader tokens: lemma ids, lexical forms, categories and notes.

Workflow: scripts-chirho/corpus-chirho/README-chirho.md, "Corpus import", node tokens_chirho.
Every field comes from a pinned file or from a rule written here; nothing is reviewed by hand.
So roots stay unresolved, glosses come only from the approved GBT export, and every note says
the token is uncurated.
"""

from __future__ import annotations

import re
from dataclasses import dataclass

from corpus_morphology_chirho import (
    HEBREW_STEMS_CHIRHO,
    LOCAL_STEM_DIGITS_CHIRHO,
    corpus_fields_chirho,
    decode_corpus_word_chirho,
    describe_corpus_word_chirho,
)
from lexicon_chirho import (
    LexicalEntryChirho,
    StrongEntryChirho,
    lexical_entry_for_chirho,
    parse_lemma_chirho,
    strong_entry_for_chirho,
)
from morphology_chirho import WordMorphologyChirho
from oshb_book_chirho import BookVerseChirho, SourceWordChirho, VerseNoteChirho

# OSHB's lemma prefixes and the morphology segment each may sit on (README "Word tag
# attributes"; AugIndex lists each letter as its own Lexical Index entry).
PREFIX_SEGMENTS_CHIRHO = {
    "b": frozenset({"R", "Rd"}),
    "k": frozenset({"R", "Rd"}),
    "l": frozenset({"R", "Rd"}),
    "m": frozenset({"R", "Rd"}),
    "c": frozenset({"C"}),
    "d": frozenset({"Td"}),
    "i": frozenset({"Ti"}),
    "s": frozenset({"Tr"}),
}
PREFIX_LEMMA_CHIRHO = re.compile(r"[bcdiklms]")
# Known source inconsistencies, matched exactly by (word id, lemma, morph); any other mismatch
# still stops the import. In each, text and morphology agree on a preposition with a suffix and
# the lemma lists a part with no segment, so only the aligned part is used:
# Prov 23:24 בּוֹ b/8055; Gen 19:29 and 30:26 בָּהֵן b/2004 (the suffix's pronoun lemma);
# Gen 42:16 מִכֶּם m/4480 a, which OSHB elsewhere lemmatizes 4480 a.
LEMMA_OVERFLOWS_CHIRHO = {
    ("208VV", "b/8055", "HR/Sp3ms"): "b",
    ("016sk", "b/2004", "HR/Sp3fp"): "b",
    ("01bED", "b/2004", "HR/Sp3fp"): "b",
    ("01fAp", "m/4480 a", "HR/Sp2mp"): "4480 a",
}
# Five Genesis questions whose OSHB lemma prefix is d (article) while the morphology parses the
# same הַ as the interrogative particle (Ti), the prefix OSHB writes i elsewhere (60 times in
# Genesis and Proverbs). The morphology is shown and the head lemma is unaffected.
PREFIX_MISMATCHES_CHIRHO = frozenset(
    {
        ("01EGe", "d/l/1121 a", "HTi/R/Ncmsc"),
        ("01Vdn", "d/1293", "HTi/Ncfsa"),
        ("01Ucz", "d/3045", "HTi/Vqp2mp"),
        ("01bn4", "d/4592", "HTi/Ncmsa"),
        ("01mpZ", "d/k/2181", "HTi/R/Vqrfsa"),
    }
)
ROOT_NOTE_CHIRHO = "Not reviewed: no root is assigned to this word yet."
UNCURATED_NOTE_CHIRHO = (
    "Uncurated: lemma and morphology as OSHB gives them; the analysis is generated from its "
    "code tables."
)
KETIV_NOTE_CHIRHO = (
    "Ketiv (written form), kept as OSHB's main line; the qere (read form) is in qere_chirho."
)
PRONOUN_NOTE_CHIRHO = "Pronouns have no teaching category yet; the raw code keeps the parse."
# OSHB word id (main line or qere) -> (approved gloss or None, provenance note).
GlossesChirho = dict[str, tuple[str | None, str]]
LOCAL_STEM_LABELS_CHIRHO = frozenset(
    HEBREW_STEMS_CHIRHO[letter_chirho] for letter_chirho in LOCAL_STEM_DIGITS_CHIRHO
)


class TokenErrorChirho(ValueError):
    """A word whose lemma, text and morphology do not line up, so no token is produced."""


@dataclass(frozen=True)
class LexiconChirho:
    strong_chirho: dict[str, StrongEntryChirho]
    aug_index_chirho: dict[str, str]
    lexical_index_chirho: dict[str, LexicalEntryChirho]


def lemma_fields_chirho(
    word_chirho: SourceWordChirho,
    morphology_chirho: WordMorphologyChirho,
    lexicon_chirho: LexiconChirho,
) -> dict[str, str | None]:
    """lemma_id, lemma_augment and lexical form of the head, after checking every prefix."""
    parts_chirho = word_chirho.lemma_chirho.split("/")
    overflow_chirho = LEMMA_OVERFLOWS_CHIRHO.get(
        (word_chirho.id_chirho, word_chirho.lemma_chirho, word_chirho.morph_chirho)
    )
    if overflow_chirho is not None:
        parts_chirho = overflow_chirho.split("/")
    head_index_chirho = morphology_chirho.head_index_chirho
    if len(parts_chirho) != head_index_chirho + 1:
        raise TokenErrorChirho(
            f"{word_chirho.id_chirho}: lemma {word_chirho.lemma_chirho!r} does not cover "
            f"morph {word_chirho.morph_chirho!r}"
        )
    known_mismatch_chirho = (
        word_chirho.id_chirho,
        word_chirho.lemma_chirho,
        word_chirho.morph_chirho,
    ) in PREFIX_MISMATCHES_CHIRHO
    for part_chirho, segment_chirho in zip(parts_chirho, morphology_chirho.segments_chirho):
        if known_mismatch_chirho and (part_chirho, segment_chirho.code_chirho) == ("d", "Ti"):
            continue
        if PREFIX_LEMMA_CHIRHO.fullmatch(part_chirho) and (
            segment_chirho.code_chirho not in PREFIX_SEGMENTS_CHIRHO[part_chirho]
        ):
            raise TokenErrorChirho(
                f"{word_chirho.id_chirho}: lemma prefix {part_chirho!r} sits on "
                f"{segment_chirho.code_chirho!r}"
            )
    if any(not PREFIX_LEMMA_CHIRHO.fullmatch(part_chirho) for part_chirho in parts_chirho[:-1]):
        raise TokenErrorChirho(f"{word_chirho.id_chirho}: unknown lemma prefix in {parts_chirho}")
    # A trailing "+" joins this word with the next one in a single name (בֵּית 1008+ אֵל 1008).
    head_chirho = parts_chirho[-1].removesuffix("+")
    if "+" in head_chirho or any("+" in part_chirho for part_chirho in parts_chirho[:-1]):
        raise TokenErrorChirho(f"{word_chirho.id_chirho}: unsupported '+' in {parts_chirho}")
    if PREFIX_LEMMA_CHIRHO.fullmatch(head_chirho):
        entry_id_chirho = lexicon_chirho.aug_index_chirho.get(head_chirho, "")
        entry_chirho = lexicon_chirho.lexical_index_chirho.get(entry_id_chirho)
        if entry_chirho is None or dict(entry_chirho.xref_chirho).get("strong") != head_chirho:
            raise TokenErrorChirho(
                f"{word_chirho.id_chirho}: no Lexical Index entry for {head_chirho}"
            )
        return {
            "lemma_id_chirho": f"oshb:{head_chirho}",
            "lemma_augment_chirho": None,
            "lexical_form_chirho": entry_chirho.lemma_chirho,
        }
    lemma_chirho = parse_lemma_chirho(head_chirho)
    strong_chirho = strong_entry_for_chirho(
        lemma_chirho.strong_id_chirho, lexicon_chirho.strong_chirho
    )
    if lemma_chirho.augment_chirho:
        # Proves the augmented id is a known Lexical Index entry for the same Strong number.
        lexical_entry_for_chirho(
            lemma_chirho, lexicon_chirho.aug_index_chirho, lexicon_chirho.lexical_index_chirho
        )
    return {
        "lemma_id_chirho": lemma_chirho.strong_id_chirho,
        "lemma_augment_chirho": lemma_chirho.augment_chirho,
        "lexical_form_chirho": strong_chirho.lemma_chirho,
    }


def reading_fields_chirho(
    word_chirho: SourceWordChirho, lexicon_chirho: LexiconChirho
) -> tuple[dict, WordMorphologyChirho]:
    """Fields shared by main-line tokens and qere readings, in the lesson's key order."""
    morphology_chirho = decode_corpus_word_chirho(word_chirho.morph_chirho)
    if len(word_chirho.segments_chirho) != len(morphology_chirho.segments_chirho):
        raise TokenErrorChirho(
            f"{word_chirho.id_chirho}: {len(word_chirho.segments_chirho)} text segments but "
            f"{len(morphology_chirho.segments_chirho)} morphology segments"
        )
    categories_chirho = corpus_fields_chirho(morphology_chirho)
    fields_chirho = {
        "id_chirho": word_chirho.id_chirho,
        "text_chirho": word_chirho.text_chirho,
        "segments_chirho": list(word_chirho.segments_chirho),
    }
    return fields_chirho | {
        "raw_morphology_chirho": word_chirho.morph_chirho,
        "raw_lemma_chirho": word_chirho.lemma_chirho,
        **lemma_fields_chirho(word_chirho, morphology_chirho, lexicon_chirho),
        **categories_chirho,
    }, morphology_chirho


def source_note_chirho(fields_chirho: dict, ketiv_chirho: bool) -> str:
    notes_chirho = [UNCURATED_NOTE_CHIRHO]
    overflow_chirho = LEMMA_OVERFLOWS_CHIRHO.get(
        (
            fields_chirho["id_chirho"],
            fields_chirho["raw_lemma_chirho"],
            fields_chirho["raw_morphology_chirho"],
        )
    )
    if overflow_chirho is not None:
        notes_chirho.append(
            f"OSHB's lemma {fields_chirho['raw_lemma_chirho']} has a part with no morphology "
            f"segment; only the aligned part {overflow_chirho} is used."
        )
    if ketiv_chirho:
        notes_chirho.append(KETIV_NOTE_CHIRHO)
    if (
        fields_chirho["id_chirho"],
        fields_chirho["raw_lemma_chirho"],
        fields_chirho["raw_morphology_chirho"],
    ) in PREFIX_MISMATCHES_CHIRHO:
        notes_chirho.append(
            "OSHB's lemma prefix d (article) sits on what its morphology parses as the "
            "interrogative particle (Ti); the morphology is shown."
        )
    if fields_chirho["raw_lemma_chirho"].endswith("+"):
        notes_chirho.append(
            f"OSHB's lemma {fields_chirho['raw_lemma_chirho']} joins this word with the next one "
            "in a single name."
        )
    if fields_chirho["pos_chirho"] == "verb" and "verb_code_chirho" not in fields_chirho:
        stem_chirho = fields_chirho["verb_stem_chirho"]
        form_chirho = fields_chirho["verb_form_chirho"].replace("_", " ")
        if stem_chirho not in LOCAL_STEM_LABELS_CHIRHO:
            notes_chirho.append(f"The {stem_chirho} stem has no local teaching code.")
        else:
            notes_chirho.append(
                f"The {form_chirho} form has no local conjugation letter; it is not shown as "
                "qatal or yiqtol."
            )
    if fields_chirho["pos_chirho"] == "unknown":
        notes_chirho.append(PRONOUN_NOTE_CHIRHO)
    return " ".join(notes_chirho)


def qere_record_chirho(
    word_chirho: SourceWordChirho, lexicon_chirho: LexiconChirho, glosses_chirho: GlossesChirho
) -> dict:
    fields_chirho, morphology_chirho = reading_fields_chirho(word_chirho, lexicon_chirho)
    return fields_chirho | {
        "gloss_chirho": glosses_chirho[word_chirho.id_chirho][0],
        "analysis_chirho": describe_corpus_word_chirho(morphology_chirho),
    }


def token_record_chirho(
    word_chirho: SourceWordChirho,
    start_chirho: int,
    end_chirho: int,
    ketiv_chirho: bool,
    qere_chirho: tuple[SourceWordChirho, ...],
    lexicon_chirho: LexiconChirho,
    glosses_chirho: GlossesChirho,
) -> dict:
    fields_chirho, morphology_chirho = reading_fields_chirho(word_chirho, lexicon_chirho)
    gloss_chirho, gloss_note_chirho = glosses_chirho[word_chirho.id_chirho]
    record_chirho = {
        key_chirho: fields_chirho[key_chirho]
        for key_chirho in ("id_chirho", "text_chirho", "segments_chirho")
    }
    record_chirho |= {"start_chirho": start_chirho, "end_chirho": end_chirho}
    record_chirho |= {
        key_chirho: value_chirho
        for key_chirho, value_chirho in fields_chirho.items()
        if key_chirho not in record_chirho
    }
    record_chirho |= {
        "root_text_chirho": None,
        "root_entry_id_chirho": None,
        "root_status_chirho": "unresolved",
        "root_note_chirho": ROOT_NOTE_CHIRHO,
        "gloss_chirho": gloss_chirho,
        "analysis_chirho": describe_corpus_word_chirho(morphology_chirho),
        "source_note_chirho": f"{source_note_chirho(fields_chirho, ketiv_chirho)} {gloss_note_chirho}",
    }
    if qere_chirho:
        record_chirho["qere_chirho"] = [
            qere_record_chirho(reading_chirho, lexicon_chirho, glosses_chirho)
            for reading_chirho in qere_chirho
        ]
    return record_chirho


def note_record_chirho(note_chirho: VerseNoteChirho) -> dict:
    record_chirho = {
        "kind_chirho": note_chirho.kind_chirho,
        "code_chirho": note_chirho.code_chirho,
        "text_chirho": note_chirho.text_chirho,
        "after_token_id_chirho": note_chirho.after_token_id_chirho,
        "anchor_chirho": note_chirho.anchor_chirho,
    }
    if note_chirho.start_chirho is not None:
        record_chirho |= {
            "start_chirho": note_chirho.start_chirho,
            "end_chirho": note_chirho.end_chirho,
        }
    return record_chirho


def kjv_field_chirho(verse_chirho: BookVerseChirho) -> dict[str, str]:
    """The English (KJV) verse id where OSHB records one, e.g. Gen.31.55 for Hebrew Gen 32:1."""
    kjv_chirho = [
        note_chirho.text_chirho
        for note_chirho in verse_chirho.notes_chirho
        if note_chirho.kind_chirho == "versification"
    ]
    if len(kjv_chirho) > 1:
        raise TokenErrorChirho(f"{verse_chirho.osis_id_chirho}: more than one KJV verse note")
    return {"kjv_verse_id_chirho": kjv_chirho[0]} if kjv_chirho else {}


def verse_record_chirho(
    verse_chirho: BookVerseChirho,
    label_chirho: str,
    lexicon_chirho: LexiconChirho,
    glosses_chirho: GlossesChirho,
    sources_chirho: list[dict],
    gloss_sources_chirho: list[dict],
) -> dict:
    """One verse in the LessonChirho shape; GBT sources are cited only where a gloss is used."""
    tokens_chirho = []
    for placed_chirho in verse_chirho.words_chirho:
        tokens_chirho.append(
            token_record_chirho(
                placed_chirho.word_chirho,
                placed_chirho.start_chirho,
                placed_chirho.end_chirho,
                placed_chirho.ketiv_chirho,
                placed_chirho.qere_chirho,
                lexicon_chirho,
                glosses_chirho,
            )
        )
    supplied_chirho = any(
        token_chirho["gloss_chirho"] is not None for token_chirho in tokens_chirho
    )
    record_chirho = {
        "schema_version_chirho": 1,
        "id_chirho": verse_chirho.osis_id_chirho,
        "language_chirho": "he",
        "reference_chirho": f"{label_chirho} {verse_chirho.chapter_chirho}:{verse_chirho.verse_chirho}",
        "canonical_text_chirho": verse_chirho.canonical_text_chirho,
        **kjv_field_chirho(verse_chirho),
        "translation_chirho": None,
        "gloss_origin_chirho": "gbt_approved" if supplied_chirho else "unavailable",
        "tokens_chirho": tokens_chirho,
    }
    if verse_chirho.notes_chirho:
        record_chirho["source_notes_chirho"] = [
            note_record_chirho(note_chirho) for note_chirho in verse_chirho.notes_chirho
        ]
    record_chirho["sources_chirho"] = sources_chirho + (
        gloss_sources_chirho if supplied_chirho else []
    )
    return record_chirho
