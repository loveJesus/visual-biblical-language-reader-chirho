# For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life. — John 3:16 (KJV)
"""OSHB morphology for the book corpus: every part of speech, verbs included.

Workflow: scripts-chirho/corpus-chirho/README-chirho.md, "Corpus import", node morphology_chirho.
Non-verb segments use the tables already transcribed in scripts-chirho/import-chirho/
morphology_chirho.py. This module adds the Hebrew verb tables of the same pinned document
(data-chirho/sources-chirho/morphhb-chirho/parsing/HebrewMorphologyCodes.html, morphhb 3d15126):
the stem list, the eleven conjugation types and their slot rules. A letter these tables do not
define raises MorphologyErrorChirho. A verb form comes only from its conjugation letter; a waw
in the spelling never decides one.
"""

from __future__ import annotations

from morphology_chirho import (
    FEATURES_CHIRHO,
    LANGUAGE_CHIRHO,
    LESSON_GENDER_CHIRHO,
    LESSON_NUMBER_CHIRHO,
    LESSON_STATE_CHIRHO,
    PLACEHOLDER_CHIRHO,
    MorphologyErrorChirho,
    SegmentMorphologyChirho,
    WordMorphologyChirho,
    decode_segment_chirho,
)

HEBREW_STEMS_CHIRHO = {
    "q": "qal",
    "N": "niphal",
    "p": "piel",
    "P": "pual",
    "h": "hiphil",
    "H": "hophal",
    "t": "hithpael",
    "o": "polel",
    "O": "polal",
    "r": "hithpolel",
    "m": "poel",
    "M": "poal",
    "k": "palel",
    "K": "pulal",
    "Q": "qal passive",
    "l": "pilpel",
    "L": "polpal",
    "f": "hithpalpel",
    "D": "nithpael",
    "j": "pealal",
    "i": "pilel",
    "u": "hothpaal",
    "c": "tiphil",
    "v": "hishtaphel",
    "w": "nithpalel",
    "y": "nithpoel",
    "z": "hithpoel",
}
# OSHB letter -> (verb_form_chirho value, description). The document writes "perfect (qatal)";
# the handoff makes qatal/yiqtol the primary labels, so descriptions lead with them.
CONJUGATIONS_CHIRHO = {
    "p": ("qatal", "qatal (perfect)"),
    "q": ("weqatal", "weqatal (sequential perfect)"),
    "i": ("yiqtol", "yiqtol (imperfect)"),
    "w": ("wayyiqtol", "wayyiqtol (sequential imperfect)"),
    "h": ("cohortative", "cohortative"),
    "j": ("jussive", "jussive"),
    "v": ("imperative", "imperative"),
    "r": ("participle_active", "participle active"),
    "s": ("participle_passive", "participle passive"),
    "a": ("infinitive_absolute", "infinitive absolute"),
    "c": ("infinitive_construct", "infinitive construct"),
}
# The document's slot notes: finite verbs take person; participles take state instead.
PARTICIPLES_CHIRHO = frozenset("rs")
INFINITIVES_CHIRHO = frozenset("ac")
# Handoff section 6 local teaching codes. Only an exact fit is coded: UHG treats the sequential
# forms, jussive and cohortative as forms of their own, so q, w, h, j and stems beyond the seven
# get no code and keep their full names in verb_stem_chirho and verb_form_chirho.
LOCAL_STEM_DIGITS_CHIRHO = {"q": "1", "N": "2", "p": "3", "P": "4", "h": "5", "H": "6", "t": "7"}
LOCAL_FORM_LETTERS_CHIRHO = {"p": "P", "i": "I", "v": "M", "r": "A", "s": "A", "c": "C", "a": "B"}
# Named only when OSHB itself parses a conjunction segment directly before the verb.
CONSTRUCTIONS_CHIRHO = {"i": "weyiqtol", "p": "qatal_copulative"}
# Verb and pronoun genders: "common" is the verb value; "both" belongs to nouns only.
PERSONAL_GENDER_CHIRHO = {
    "masculine": "masculine",
    "feminine": "feminine",
    "common": "common",
    "unknown": "unknown",
}


def decode_verb_segment_chirho(code_chirho: str, language_chirho: str) -> SegmentMorphologyChirho:
    if language_chirho != "Hebrew":
        raise MorphologyErrorChirho(f"{code_chirho}: {language_chirho} verbs are outside this book")
    stem_chirho, type_chirho, values_chirho = code_chirho[1:2], code_chirho[2:3], code_chirho[3:]
    if stem_chirho not in HEBREW_STEMS_CHIRHO:
        raise MorphologyErrorChirho(f"{code_chirho}: unknown verb stem {stem_chirho!r}")
    if type_chirho not in CONJUGATIONS_CHIRHO:
        raise MorphologyErrorChirho(f"{code_chirho}: unknown conjugation type {type_chirho!r}")
    if type_chirho in INFINITIVES_CHIRHO:
        slots_chirho: tuple[str, ...] = ()
    elif type_chirho in PARTICIPLES_CHIRHO:
        slots_chirho = ("gender", "number", "state")
    else:
        slots_chirho = ("person", "gender", "number")
    if len(values_chirho) > len(slots_chirho):
        raise MorphologyErrorChirho(f"{code_chirho}: more values than its conjugation takes")
    features_chirho = [
        ("stem", HEBREW_STEMS_CHIRHO[stem_chirho]),
        ("type", CONJUGATIONS_CHIRHO[type_chirho][1]),
    ]
    for slot_chirho, value_chirho in zip(slots_chirho, values_chirho):
        if value_chirho == PLACEHOLDER_CHIRHO:
            features_chirho.append((slot_chirho, "unknown"))
        elif value_chirho in FEATURES_CHIRHO[slot_chirho]:
            features_chirho.append((slot_chirho, FEATURES_CHIRHO[slot_chirho][value_chirho]))
        else:
            raise MorphologyErrorChirho(f"{code_chirho}: unknown {slot_chirho} {value_chirho!r}")
    return SegmentMorphologyChirho(
        code_chirho=code_chirho,
        letter_chirho="V",
        part_of_speech_chirho="verb",
        features_chirho=tuple(features_chirho),
    )


def decode_corpus_word_chirho(raw_chirho: str) -> WordMorphologyChirho:
    """Decode a whole morph attribute; its first letter is the language of every segment."""
    language_letter_chirho, rest_chirho = raw_chirho[:1], raw_chirho[1:]
    if language_letter_chirho not in LANGUAGE_CHIRHO:
        raise MorphologyErrorChirho(f"{raw_chirho}: unknown language {language_letter_chirho!r}")
    language_chirho = LANGUAGE_CHIRHO[language_letter_chirho]
    codes_chirho = rest_chirho.split("/")
    if not all(codes_chirho):
        raise MorphologyErrorChirho(f"{raw_chirho}: empty segment code")
    return WordMorphologyChirho(
        raw_chirho=raw_chirho,
        language_chirho=language_chirho,
        segments_chirho=tuple(
            decode_verb_segment_chirho(code_chirho, language_chirho)
            if code_chirho.startswith("V")
            else decode_segment_chirho(code_chirho)
            for code_chirho in codes_chirho
        ),
    )


def category_chirho(
    segment_chirho: SegmentMorphologyChirho, slot_chirho: str, table_chirho: dict
) -> str:
    label_chirho = segment_chirho.feature_chirho(slot_chirho) or "unknown"
    if label_chirho not in table_chirho:
        raise MorphologyErrorChirho(
            f"{segment_chirho.code_chirho}: {slot_chirho} {label_chirho!r} has no lesson category"
        )
    return table_chirho[label_chirho]


def verb_fields_chirho(word_chirho: WordMorphologyChirho) -> dict[str, str]:
    """Teaching categories plus verb_stem/form/construction/code for a verb head."""
    head_chirho = word_chirho.head_chirho
    stem_chirho, type_chirho = head_chirho.code_chirho[1], head_chirho.code_chirho[2]
    fields_chirho = {"pos_chirho": "verb"}
    if type_chirho in INFINITIVES_CHIRHO:
        fields_chirho.update(gender_chirho="na", number_chirho="na", state_chirho="na")
    else:
        fields_chirho["gender_chirho"] = category_chirho(
            head_chirho, "gender", PERSONAL_GENDER_CHIRHO
        )
        fields_chirho["number_chirho"] = category_chirho(
            head_chirho, "number", LESSON_NUMBER_CHIRHO
        )
        fields_chirho["state_chirho"] = (
            category_chirho(head_chirho, "state", LESSON_STATE_CHIRHO)
            if type_chirho in PARTICIPLES_CHIRHO
            else "na"
        )
    fields_chirho["verb_stem_chirho"] = HEBREW_STEMS_CHIRHO[stem_chirho]
    fields_chirho["verb_form_chirho"] = CONJUGATIONS_CHIRHO[type_chirho][0]
    index_chirho = word_chirho.head_index_chirho
    if (
        type_chirho in CONSTRUCTIONS_CHIRHO
        and index_chirho > 0
        and word_chirho.segments_chirho[index_chirho - 1].code_chirho == "C"
    ):
        fields_chirho["verb_construction_chirho"] = CONSTRUCTIONS_CHIRHO[type_chirho]
    if stem_chirho in LOCAL_STEM_DIGITS_CHIRHO and type_chirho in LOCAL_FORM_LETTERS_CHIRHO:
        fields_chirho["verb_code_chirho"] = (
            LOCAL_STEM_DIGITS_CHIRHO[stem_chirho] + LOCAL_FORM_LETTERS_CHIRHO[type_chirho]
        )
    return fields_chirho


def corpus_fields_chirho(word_chirho: WordMorphologyChirho) -> dict[str, str]:
    """Map the head segment onto the lesson's categories; unsupported heads stay unknown."""
    head_chirho = word_chirho.head_chirho
    letter_chirho = head_chirho.letter_chirho
    if letter_chirho == "V":
        return verb_fields_chirho(word_chirho)
    if letter_chirho in ("N", "A"):
        return {
            "pos_chirho": "noun" if letter_chirho == "N" else "adjective",
            "gender_chirho": category_chirho(head_chirho, "gender", LESSON_GENDER_CHIRHO),
            "number_chirho": category_chirho(head_chirho, "number", LESSON_NUMBER_CHIRHO),
            "state_chirho": category_chirho(head_chirho, "state", LESSON_STATE_CHIRHO),
        }
    if letter_chirho in ("R", "C", "D", "T"):
        # Prepositions, conjunctions, adverbs and particles share the particle teaching group.
        return {
            "pos_chirho": "particle",
            "gender_chirho": "na",
            "number_chirho": "na",
            "state_chirho": "na",
        }
    if letter_chirho == "P":
        # The lesson has no pronoun category yet: the part of speech stays unknown while the
        # sourced gender and number still show.
        return {
            "pos_chirho": "unknown",
            "gender_chirho": category_chirho(head_chirho, "gender", PERSONAL_GENDER_CHIRHO),
            "number_chirho": category_chirho(head_chirho, "number", LESSON_NUMBER_CHIRHO),
            "state_chirho": "na",
        }
    raise MorphologyErrorChirho(f"{word_chirho.raw_chirho}: head {letter_chirho!r} is unsupported")


def describe_corpus_segment_chirho(segment_chirho: SegmentMorphologyChirho) -> str:
    """English parse of one segment, worded with the code document's labels."""
    head_word_chirho = segment_chirho.part_of_speech_chirho
    parts_chirho: list[str] = []
    for slot_chirho, label_chirho in segment_chirho.features_chirho:
        if slot_chirho == "type" and segment_chirho.letter_chirho == "R":
            head_word_chirho = f"preposition with {label_chirho}"
        elif slot_chirho == "type" and label_chirho == segment_chirho.part_of_speech_chirho:
            continue
        elif label_chirho == "unknown":
            parts_chirho.append(f"{slot_chirho} unknown")
        elif slot_chirho == "person":
            parts_chirho.append(f"{label_chirho} person")
        elif slot_chirho == "gender" and label_chirho in ("both", "common"):
            parts_chirho.append(f"gender {label_chirho}")
        else:
            parts_chirho.append(label_chirho)
    return ", ".join([head_word_chirho, *parts_chirho])


def describe_corpus_word_chirho(word_chirho: WordMorphologyChirho) -> str:
    text_chirho = " + ".join(
        describe_corpus_segment_chirho(segment_chirho)
        for segment_chirho in word_chirho.segments_chirho
    )
    return text_chirho[:1].upper() + text_chirho[1:]
