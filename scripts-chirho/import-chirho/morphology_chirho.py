# For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life. — John 3:16 (KJV)
"""OSHB morphology codes, decoded with the tables of the pinned code document.

Workflow: scripts-chirho/import-chirho/README-chirho.md, "Offline import", node decode_chirho.
Every table transcribes data-chirho/sources-chirho/morphhb-chirho/parsing/HebrewMorphologyCodes.html
(morphhb 3d15126). A letter missing from these tables raises MorphologyErrorChirho; nothing is
guessed. Verb codes are refused on purpose: their slots depend on the conjugation type, and
lesson schema v1 has no verb fields yet.
"""

from __future__ import annotations

from dataclasses import dataclass

LANGUAGE_CHIRHO = {"H": "Hebrew", "A": "Aramaic"}
PART_OF_SPEECH_CHIRHO = {
    "A": "adjective",
    "C": "conjunction",
    "D": "adverb",
    "N": "noun",
    "P": "pronoun",
    "R": "preposition",
    "S": "suffix",
    "T": "particle",
    "V": "verb",
}
TYPES_CHIRHO = {
    "A": {"a": "adjective", "c": "cardinal number", "g": "gentilic", "o": "ordinal number"},
    "N": {"c": "common", "g": "gentilic", "p": "proper name"},
    "P": {
        "d": "demonstrative",
        "f": "indefinite",
        "i": "interrogative",
        "p": "personal",
        "r": "relative",
    },
    "R": {"d": "definite article"},
    "S": {"d": "directional he", "h": "paragogic he", "n": "paragogic nun", "p": "pronominal"},
    "T": {
        "a": "affirmation",
        "d": "definite article",
        "e": "exhortation",
        "i": "interrogative",
        "j": "interjection",
        "m": "demonstrative",
        "n": "negative",
        "o": "direct object marker",
        "r": "relative",
    },
}
FEATURES_CHIRHO = {
    "person": {"1": "first", "2": "second", "3": "third"},
    "gender": {"b": "both", "c": "common", "f": "feminine", "m": "masculine"},
    "number": {"d": "dual", "p": "plural", "s": "singular"},
    "state": {"a": "absolute", "c": "construct", "d": "determined"},
}
# Slots after the part-of-speech letter, in the document's column order.
SLOTS_CHIRHO = {
    "A": ("type", "gender", "number", "state"),
    "C": (),
    "D": (),
    "N": ("type", "gender", "number", "state"),
    "P": ("type", "person", "gender", "number"),
    "R": ("type",),
    "S": ("type", "person", "gender", "number"),
    "T": ("type",),
}
# The document's placeholder for an unknown or unnecessary value.
PLACEHOLDER_CHIRHO = "x"

# Lesson categories (handoff section 6) for the head segment. A sourced adverb is grouped with
# the particles for teaching; the raw code always travels with the token.
LESSON_POS_CHIRHO = {"N": "noun", "A": "adjective", "D": "particle", "T": "particle"}
# OSHB gender b means both; the handoff shows it as common, never as masculine-only.
LESSON_GENDER_CHIRHO = {
    "masculine": "masculine",
    "feminine": "feminine",
    "both": "common",
    "unknown": "unknown",
}
LESSON_NUMBER_CHIRHO = {
    "singular": "singular",
    "plural": "plural",
    "dual": "dual",
    "unknown": "unknown",
}
LESSON_STATE_CHIRHO = {"absolute": "absolute", "construct": "construct", "unknown": "unknown"}


class MorphologyErrorChirho(ValueError):
    """A morphology code that the pinned tables do not define, or that lesson v1 cannot carry."""


@dataclass(frozen=True)
class SegmentMorphologyChirho:
    code_chirho: str
    letter_chirho: str
    part_of_speech_chirho: str
    features_chirho: tuple[tuple[str, str], ...]

    def feature_chirho(self, slot_chirho: str) -> str | None:
        return dict(self.features_chirho).get(slot_chirho)

    @property
    def is_suffix_chirho(self) -> bool:
        return self.letter_chirho == "S"


@dataclass(frozen=True)
class WordMorphologyChirho:
    raw_chirho: str
    language_chirho: str
    segments_chirho: tuple[SegmentMorphologyChirho, ...]

    @property
    def head_index_chirho(self) -> int:
        """The main word is the last segment that is not a suffix."""
        for index_chirho in range(len(self.segments_chirho) - 1, -1, -1):
            if not self.segments_chirho[index_chirho].is_suffix_chirho:
                return index_chirho
        raise MorphologyErrorChirho(f"{self.raw_chirho}: no main word, only suffixes")

    @property
    def head_chirho(self) -> SegmentMorphologyChirho:
        return self.segments_chirho[self.head_index_chirho]


def decode_segment_chirho(code_chirho: str) -> SegmentMorphologyChirho:
    letter_chirho, values_chirho = code_chirho[:1], code_chirho[1:]
    if letter_chirho == "V":
        raise MorphologyErrorChirho(f"{code_chirho}: verb codes are not decoded by importer v1")
    if letter_chirho not in SLOTS_CHIRHO:
        raise MorphologyErrorChirho(f"{code_chirho}: unknown part of speech {letter_chirho!r}")
    slots_chirho = SLOTS_CHIRHO[letter_chirho]
    if len(values_chirho) > len(slots_chirho):
        raise MorphologyErrorChirho(f"{code_chirho}: more values than its part of speech has")
    features_chirho = []
    for slot_chirho, value_chirho in zip(slots_chirho, values_chirho):
        table_chirho = (
            TYPES_CHIRHO[letter_chirho] if slot_chirho == "type" else FEATURES_CHIRHO[slot_chirho]
        )
        if value_chirho == PLACEHOLDER_CHIRHO:
            label_chirho = "unknown"
        elif value_chirho in table_chirho:
            label_chirho = table_chirho[value_chirho]
        else:
            raise MorphologyErrorChirho(f"{code_chirho}: unknown {slot_chirho} {value_chirho!r}")
        features_chirho.append((slot_chirho, label_chirho))
    return SegmentMorphologyChirho(
        code_chirho=code_chirho,
        letter_chirho=letter_chirho,
        part_of_speech_chirho=PART_OF_SPEECH_CHIRHO[letter_chirho],
        features_chirho=tuple(features_chirho),
    )


def decode_word_chirho(raw_chirho: str) -> WordMorphologyChirho:
    """Decode a whole morph attribute; its first letter is the language of every segment."""
    language_chirho, rest_chirho = raw_chirho[:1], raw_chirho[1:]
    if language_chirho not in LANGUAGE_CHIRHO:
        raise MorphologyErrorChirho(f"{raw_chirho}: unknown language {language_chirho!r}")
    codes_chirho = rest_chirho.split("/")
    if not all(codes_chirho):
        raise MorphologyErrorChirho(f"{raw_chirho}: empty segment code")
    return WordMorphologyChirho(
        raw_chirho=raw_chirho,
        language_chirho=LANGUAGE_CHIRHO[language_chirho],
        segments_chirho=tuple(decode_segment_chirho(code_chirho) for code_chirho in codes_chirho),
    )


def lesson_categories_chirho(word_chirho: WordMorphologyChirho) -> dict[str, str]:
    """Map the head segment onto the handoff's lesson categories, or refuse it."""
    head_chirho = word_chirho.head_chirho
    if head_chirho.letter_chirho not in LESSON_POS_CHIRHO:
        raise MorphologyErrorChirho(
            f"{word_chirho.raw_chirho}: a {head_chirho.part_of_speech_chirho} head is outside "
            "lesson schema v1"
        )
    if head_chirho.letter_chirho in ("D", "T"):
        return {
            "pos_chirho": LESSON_POS_CHIRHO[head_chirho.letter_chirho],
            "gender_chirho": "na",
            "number_chirho": "na",
            "state_chirho": "na",
        }
    categories_chirho = {"pos_chirho": LESSON_POS_CHIRHO[head_chirho.letter_chirho]}
    for slot_chirho, table_chirho in (
        ("gender", LESSON_GENDER_CHIRHO),
        ("number", LESSON_NUMBER_CHIRHO),
        ("state", LESSON_STATE_CHIRHO),
    ):
        label_chirho = head_chirho.feature_chirho(slot_chirho) or "unknown"
        if label_chirho not in table_chirho:
            raise MorphologyErrorChirho(
                f"{word_chirho.raw_chirho}: {slot_chirho} {label_chirho!r} has no lesson category"
            )
        categories_chirho[f"{slot_chirho}_chirho"] = table_chirho[label_chirho]
    return categories_chirho


def describe_segment_chirho(segment_chirho: SegmentMorphologyChirho) -> str:
    """English parse of one segment, worded with the code document's own labels."""
    head_word_chirho = segment_chirho.part_of_speech_chirho
    parts_chirho: list[str] = []
    for slot_chirho, label_chirho in segment_chirho.features_chirho:
        if slot_chirho == "type" and segment_chirho.letter_chirho == "R":
            head_word_chirho = f"preposition with {label_chirho}"
        elif slot_chirho == "type" and label_chirho == segment_chirho.part_of_speech_chirho:
            continue
        elif label_chirho == "unknown":
            parts_chirho.append(f"{slot_chirho} unknown")
        elif slot_chirho == "gender" and label_chirho in ("both", "common"):
            parts_chirho.append(f"gender {label_chirho}")
        else:
            parts_chirho.append(label_chirho)
    return ", ".join([head_word_chirho, *parts_chirho])


def describe_word_chirho(word_chirho: WordMorphologyChirho) -> str:
    text_chirho = " + ".join(
        describe_segment_chirho(segment_chirho) for segment_chirho in word_chirho.segments_chirho
    )
    return text_chirho[:1].upper() + text_chirho[1:]
