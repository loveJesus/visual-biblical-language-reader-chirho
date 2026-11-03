# For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life. — John 3:16 (KJV)
"""Robinson-style Greek parsing codes, decoded with the tables of the pinned code document.

Workflow: scripts-chirho/corpus-chirho/README-chirho.md, "Greek corpus import", node
greek_morphology_chirho. Every table transcribes
data-chirho/corpus-chirho/sources-chirho/nestle1904-chirho/morph/parsing.txt (Nestle1904
713f28a3). A code that matches none of its patterns raises GreekMorphologyErrorChirho; nothing is
guessed. Labels are the document's own words.
"""

from __future__ import annotations

import re

NOMINAL_CHIRHO = {"N": "noun", "A": "adjective", "T": "article"}
PRONOMINAL_CHIRHO = {
    "P": "personal pronoun",
    "R": "relative pronoun",
    "C": "reciprocal pronoun",
    "D": "demonstrative pronoun",
    "K": "correlative pronoun",
    "I": "interrogative pronoun",
    "X": "indefinite pronoun",
    "Q": "correlative or interrogative pronoun",
    "F": "reflexive pronoun",
    "S": "possessive pronoun",
}
INDECLINABLE_CHIRHO = {
    "ADV": "adverb",
    "CONJ": "conjunction",
    "COND": "cond",
    "PRT": "particle",
    "PREP": "preposition",
    "INJ": "interjection",
    "ARAM": "aramaic",
    "HEB": "hebrew",
    "N-PRI": "proper noun indeclinable",
    "A-NUI": "numeral indeclinable",
    "N-LI": "letter indeclinable",
    "N-OI": "noun other type indeclinable",
}
CASES_CHIRHO = {
    "N": "nominative",
    "V": "vocative",
    "G": "genitive",
    "D": "dative",
    "A": "accusative",
}
NUMBERS_CHIRHO = {"S": "singular", "P": "plural"}
GENDERS_CHIRHO = {"M": "masculine", "F": "feminine", "N": "neuter"}
PERSONS_CHIRHO = {"1": "first", "2": "second", "3": "third"}
TENSES_CHIRHO = {
    "P": "present",
    "I": "imperfect",
    "F": "future",
    "2F": "second future",
    "A": "aorist",
    "2A": "second aorist",
    "R": "perfect",
    "2R": "second perfect",
    "L": "pluperfect",
    "2L": "second pluperfect",
    "X": "no tense stated",
}
VOICES_CHIRHO = {
    "A": "active",
    "M": "middle",
    "P": "passive",
    "E": "middle or passive",
    "D": "middle deponent",
    "O": "passive deponent",
    "N": "middle or passive deponent",
    "Q": "impersonal active",
    "X": "no voice",
}
MOODS_CHIRHO = {
    "I": "indicative",
    "S": "subjunctive",
    "O": "optative",
    "M": "imperative",
    "N": "infinitive",
    "P": "participle",
    "R": "imperative participle",
}
VERB_EXTRAS_CHIRHO = {
    "M": "middle significance",
    "C": "contracted form",
    "T": "transitive",
    "A": "aeolic",
    "ATT": "attic",
    "AP": "apocopated form",
    "IRR": "irregular or impure form",
}
SUFFIXES_CHIRHO = {
    "S": "superlative",
    "C": "comparative",
    "ABB": "abbreviated",
    "I": "interrogative",
    "N": "negative",
    "ATT": "attic",
    "P": "particle attached",
    "K": "crasis",
}
DEGREES_CHIRHO = {"C": "comparative", "S": "superlative"}

SUFFIX_PATTERN_CHIRHO = (
    "(?:-(?P<suffix>" + "|".join(sorted(SUFFIXES_CHIRHO, key=len, reverse=True)) + "))?"
)
EXTRA_PATTERN_CHIRHO = (
    "(?:-(?P<extra>" + "|".join(sorted(VERB_EXTRAS_CHIRHO, key=len, reverse=True)) + "))?"
)
NOMINAL_PATTERN_CHIRHO = re.compile(
    r"(?P<pos>[NAT])-(?P<case>[NVGDA])(?P<number>[SP])(?P<gender>[MFN])" + SUFFIX_PATTERN_CHIRHO
)
POSSESSIVE_PATTERN_CHIRHO = re.compile(
    r"S-(?P<owner_person>[123])(?P<owner_number>[SP])(?P<case>[NVGDA])(?P<number>[SP])(?P<gender>[MFN])"
    + SUFFIX_PATTERN_CHIRHO
)
PRONOMINAL_PATTERN_CHIRHO = re.compile(
    r"(?P<pos>[PRCDKIXQF])-(?P<person>[123])?(?P<case>[NVGDA])(?P<number>[SP])(?P<gender>[MFN])?"
    + SUFFIX_PATTERN_CHIRHO
)
VERB_PATTERN_CHIRHO = re.compile(
    r"V-(?P<tense>2?[PIFARLX])(?P<voice>[AMPEDONQX])(?P<mood>[ISOMNPR])"
    r"(?:-(?P<person>[123])(?P<number>[SP])|-(?P<case>[NVGDA])(?P<pnumber>[SP])(?P<gender>[MFN]))?"
    + EXTRA_PATTERN_CHIRHO
)
FINITE_MOODS_CHIRHO = frozenset("ISOM")
PARTICIPLE_MOODS_CHIRHO = frozenset("PR")


class GreekMorphologyErrorChirho(ValueError):
    """A parsing code the pinned document does not define."""


def indeclinable_chirho(code_chirho: str) -> dict[str, str | list[str]] | None:
    base_chirho, _, suffix_chirho = code_chirho.rpartition("-")
    if code_chirho in INDECLINABLE_CHIRHO:
        base_chirho, suffix_chirho = code_chirho, ""
    if base_chirho not in INDECLINABLE_CHIRHO or (
        suffix_chirho and suffix_chirho not in SUFFIXES_CHIRHO
    ):
        return None
    fields_chirho: dict[str, str | list[str]] = {
        "part_of_speech_chirho": INDECLINABLE_CHIRHO[base_chirho]
    }
    if suffix_chirho:
        fields_chirho["suffixes_chirho"] = [SUFFIXES_CHIRHO[suffix_chirho]]
        if base_chirho == "ADV" and suffix_chirho in DEGREES_CHIRHO:
            fields_chirho["degree_chirho"] = DEGREES_CHIRHO[suffix_chirho]
    return fields_chirho


def decode_greek_chirho(code_chirho: str) -> dict[str, str | list[str]]:
    """The document's labels for one code: part of speech plus each slot it fills."""
    fields_chirho = indeclinable_chirho(code_chirho)
    if fields_chirho is not None:
        return fields_chirho
    if match_chirho := VERB_PATTERN_CHIRHO.fullmatch(code_chirho):
        mood_chirho = match_chirho["mood"]
        if (mood_chirho in FINITE_MOODS_CHIRHO) != bool(match_chirho["person"]) or (
            mood_chirho in PARTICIPLE_MOODS_CHIRHO
        ) != bool(match_chirho["case"]):
            raise GreekMorphologyErrorChirho(
                f"{code_chirho}: slots do not fit the {MOODS_CHIRHO[mood_chirho]}"
            )
        fields_chirho = {
            "part_of_speech_chirho": "verb",
            "tense_chirho": TENSES_CHIRHO[match_chirho["tense"]],
            "voice_chirho": VOICES_CHIRHO[match_chirho["voice"]],
            "mood_chirho": MOODS_CHIRHO[mood_chirho],
        }
        if match_chirho["person"]:
            fields_chirho |= {
                "person_chirho": PERSONS_CHIRHO[match_chirho["person"]],
                "number_chirho": NUMBERS_CHIRHO[match_chirho["number"]],
            }
        if match_chirho["case"]:
            fields_chirho |= {
                "case_chirho": CASES_CHIRHO[match_chirho["case"]],
                "number_chirho": NUMBERS_CHIRHO[match_chirho["pnumber"]],
                "gender_chirho": GENDERS_CHIRHO[match_chirho["gender"]],
            }
        if match_chirho["extra"]:
            fields_chirho["verb_extras_chirho"] = [VERB_EXTRAS_CHIRHO[match_chirho["extra"]]]
        return fields_chirho
    if match_chirho := NOMINAL_PATTERN_CHIRHO.fullmatch(code_chirho):
        fields_chirho = {"part_of_speech_chirho": NOMINAL_CHIRHO[match_chirho["pos"]]}
    elif match_chirho := POSSESSIVE_PATTERN_CHIRHO.fullmatch(code_chirho):
        fields_chirho = {
            "part_of_speech_chirho": PRONOMINAL_CHIRHO["S"],
            "possessor_person_chirho": PERSONS_CHIRHO[match_chirho["owner_person"]],
            "possessor_number_chirho": NUMBERS_CHIRHO[match_chirho["owner_number"]],
        }
    elif match_chirho := PRONOMINAL_PATTERN_CHIRHO.fullmatch(code_chirho):
        fields_chirho = {"part_of_speech_chirho": PRONOMINAL_CHIRHO[match_chirho["pos"]]}
        if match_chirho["person"]:
            fields_chirho["person_chirho"] = PERSONS_CHIRHO[match_chirho["person"]]
    else:
        raise GreekMorphologyErrorChirho(f"{code_chirho}: matches no pattern of parsing.txt")
    fields_chirho["case_chirho"] = CASES_CHIRHO[match_chirho["case"]]
    fields_chirho["number_chirho"] = NUMBERS_CHIRHO[match_chirho["number"]]
    if match_chirho["gender"]:
        fields_chirho["gender_chirho"] = GENDERS_CHIRHO[match_chirho["gender"]]
    if match_chirho["suffix"]:
        suffix_chirho = match_chirho["suffix"]
        fields_chirho["suffixes_chirho"] = [SUFFIXES_CHIRHO[suffix_chirho]]
        if (
            fields_chirho["part_of_speech_chirho"] == "adjective"
            and suffix_chirho in DEGREES_CHIRHO
        ):
            fields_chirho["degree_chirho"] = DEGREES_CHIRHO[suffix_chirho]
    return fields_chirho


def teaching_group_chirho(part_of_speech_chirho: str) -> str:
    """The reader's outline group; article, pronouns and foreign words wait for a category."""
    if part_of_speech_chirho in (
        "noun",
        "proper noun indeclinable",
        "letter indeclinable",
        "noun other type indeclinable",
    ):
        return "noun"
    if part_of_speech_chirho in ("adjective", "numeral indeclinable"):
        return "adjective"
    if part_of_speech_chirho == "verb":
        return "verb"
    if part_of_speech_chirho in (
        "adverb",
        "conjunction",
        "cond",
        "particle",
        "preposition",
        "interjection",
    ):
        return "particle"
    return "unknown"


def greek_categories_chirho(fields_chirho: dict) -> dict[str, str]:
    """Case, number and gender in the reader's vocabulary: na where the form has no such slot."""
    part_chirho = fields_chirho["part_of_speech_chirho"]
    indeclinable_noun_chirho = part_chirho in (
        "proper noun indeclinable",
        "letter indeclinable",
        "noun other type indeclinable",
        "numeral indeclinable",
    )
    missing_chirho = "unknown" if indeclinable_noun_chirho else "na"
    return {
        "case_chirho": fields_chirho.get("case_chirho", missing_chirho),
        "number_chirho": fields_chirho.get("number_chirho", missing_chirho),
        "gender_chirho": fields_chirho.get("gender_chirho", missing_chirho),
    }


def describe_greek_chirho(fields_chirho: dict) -> str:
    """English parse from the document's labels, in the code's own slot order."""
    parts_chirho = [fields_chirho["part_of_speech_chirho"]]
    for key_chirho in (
        "tense_chirho",
        "voice_chirho",
        "mood_chirho",
        "possessor_person_chirho",
        "possessor_number_chirho",
        "person_chirho",
        "case_chirho",
        "number_chirho",
        "gender_chirho",
    ):
        if key_chirho in fields_chirho:
            label_chirho = fields_chirho[key_chirho]
            if key_chirho == "person_chirho":
                label_chirho = f"{label_chirho} person"
            elif key_chirho.startswith("possessor_"):
                label_chirho = f"possessor {label_chirho}"
            parts_chirho.append(label_chirho)
    parts_chirho += fields_chirho.get("suffixes_chirho", []) + fields_chirho.get(
        "verb_extras_chirho", []
    )
    text_chirho = ", ".join(parts_chirho)
    return text_chirho[:1].upper() + text_chirho[1:]
