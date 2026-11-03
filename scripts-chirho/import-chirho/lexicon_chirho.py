# For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life. — John 3:16 (KJV)
"""OSHB Hebrew Lexicon: Strong entries, augmented ids, Lexical Index roots and root assessment.

Workflow: scripts-chirho/import-chirho/README-chirho.md, "Offline import", node lexicon_chirho.
A Strong number is a lexical entry, not proof of a root (handoff section 7). A root counts as a
traditional relationship only when two pinned sources agree on it: Strong's <source> names one
derivation, and the Lexical Index files that entry in the same root family. If they disagree
or Strong's offers alternatives, the root is unresolved. If neither gives a root, there is
none to show.
"""

from __future__ import annotations

import re
import xml.etree.ElementTree as ET
from dataclasses import dataclass

from source_files_chirho import parse_xml_chirho

LEXICON_NS_CHIRHO = "{http://openscriptures.github.com/morphhb/namespace}"
# OSHB writes augmented Strong numbers with a space ("7105 a"); AugIndex writes them without.
LEMMA_PATTERN_CHIRHO = re.compile(r"(\d+)(?: ([a-z]))?")

TRADITIONAL_CHIRHO = "traditional"
UNRESOLVED_CHIRHO = "unresolved"
NOT_APPLICABLE_CHIRHO = "not_applicable"


class LexiconErrorChirho(ValueError):
    """A lemma or entry the pinned lexicon files cannot resolve."""


@dataclass(frozen=True)
class LemmaIdChirho:
    raw_chirho: str
    strong_id_chirho: str
    augment_chirho: str | None

    @property
    def aug_index_key_chirho(self) -> str:
        return self.strong_id_chirho.removeprefix("H") + (self.augment_chirho or "")


@dataclass(frozen=True)
class StrongEntryChirho:
    strong_id_chirho: str
    lemma_chirho: str
    attributes_chirho: tuple[tuple[str, str], ...]
    source_text_chirho: str
    source_refs_chirho: tuple[str, ...]
    meaning_text_chirho: str
    usage_text_chirho: str


@dataclass(frozen=True)
class LexicalEntryChirho:
    id_chirho: str
    lemma_chirho: str
    xlit_chirho: str | None
    pos_chirho: str | None
    def_chirho: str | None
    xref_chirho: tuple[tuple[str, str], ...]
    etym_type_chirho: str | None
    etym_root_chirho: str | None
    etym_targets_chirho: tuple[str, ...]

    @property
    def strong_id_chirho(self) -> str | None:
        number_chirho = dict(self.xref_chirho).get("strong")
        return f"H{number_chirho}" if number_chirho else None


@dataclass(frozen=True)
class RootAssessmentChirho:
    status_chirho: str
    root_text_chirho: str | None
    root_entry_id_chirho: str | None
    strong_refs_chirho: tuple[str, ...]
    family_entry_chirho: str | None
    family_strong_ids_chirho: tuple[str, ...]


def parse_lemma_chirho(raw_chirho: str) -> LemmaIdChirho:
    match_chirho = LEMMA_PATTERN_CHIRHO.fullmatch(raw_chirho)
    if not match_chirho:
        raise LexiconErrorChirho(f"{raw_chirho!r} is not a Strong number with optional augment")
    return LemmaIdChirho(
        raw_chirho=raw_chirho,
        strong_id_chirho=f"H{match_chirho.group(1)}",
        augment_chirho=match_chirho.group(2),
    )


def element_text_chirho(element_chirho: ET.Element | None) -> str:
    return "".join(element_chirho.itertext()).strip() if element_chirho is not None else ""


def parse_strong_chirho(data_chirho: bytes) -> dict[str, StrongEntryChirho]:
    """Read every HebrewStrong.xml entry, keyed by its id (H7950)."""
    entries_chirho: dict[str, StrongEntryChirho] = {}
    for entry_chirho in parse_xml_chirho(data_chirho, "HebrewStrong.xml").iter(
        f"{LEXICON_NS_CHIRHO}entry"
    ):
        strong_id_chirho = entry_chirho.get("id", "")
        if strong_id_chirho in entries_chirho:
            raise LexiconErrorChirho(f"HebrewStrong.xml lists {strong_id_chirho} twice")
        word_chirho = entry_chirho.find(f"{LEXICON_NS_CHIRHO}w")
        source_chirho = entry_chirho.find(f"{LEXICON_NS_CHIRHO}source")
        if word_chirho is None:
            raise LexiconErrorChirho(f"HebrewStrong.xml {strong_id_chirho} has no headword")
        refs_chirho = (
            tuple(
                ref_chirho.get("src", "")
                for ref_chirho in source_chirho.iter(f"{LEXICON_NS_CHIRHO}w")
                if ref_chirho.get("src")
            )
            if source_chirho is not None
            else ()
        )
        entries_chirho[strong_id_chirho] = StrongEntryChirho(
            strong_id_chirho=strong_id_chirho,
            lemma_chirho=word_chirho.text or "",
            attributes_chirho=tuple(sorted(word_chirho.attrib.items())),
            source_text_chirho=element_text_chirho(source_chirho),
            source_refs_chirho=refs_chirho,
            meaning_text_chirho=element_text_chirho(
                entry_chirho.find(f"{LEXICON_NS_CHIRHO}meaning")
            ),
            usage_text_chirho=element_text_chirho(entry_chirho.find(f"{LEXICON_NS_CHIRHO}usage")),
        )
    return entries_chirho


def strong_entry_for_chirho(
    strong_id_chirho: str, strong_entries_chirho: dict[str, StrongEntryChirho]
) -> StrongEntryChirho:
    if strong_id_chirho not in strong_entries_chirho:
        raise LexiconErrorChirho(f"HebrewStrong.xml has no entry {strong_id_chirho}")
    return strong_entries_chirho[strong_id_chirho]


def parse_aug_index_chirho(data_chirho: bytes) -> dict[str, str]:
    """Map each augmented Strong key ("7105a") to its Lexical Index id ("lkv")."""
    index_chirho: dict[str, str] = {}
    for word_chirho in parse_xml_chirho(data_chirho, "AugIndex.xml").iter(f"{LEXICON_NS_CHIRHO}w"):
        key_chirho = word_chirho.get("aug", "")
        if key_chirho in index_chirho:
            raise LexiconErrorChirho(f"AugIndex.xml lists {key_chirho} twice")
        index_chirho[key_chirho] = (word_chirho.text or "").strip()
    return index_chirho


def parse_lexical_index_chirho(data_chirho: bytes) -> dict[str, LexicalEntryChirho]:
    entries_chirho: dict[str, LexicalEntryChirho] = {}
    for entry_chirho in parse_xml_chirho(data_chirho, "LexicalIndex.xml").iter(
        f"{LEXICON_NS_CHIRHO}entry"
    ):
        entry_id_chirho = entry_chirho.get("id", "")
        if entry_id_chirho in entries_chirho:
            raise LexiconErrorChirho(f"LexicalIndex.xml lists {entry_id_chirho} twice")
        word_chirho = entry_chirho.find(f"{LEXICON_NS_CHIRHO}w")
        xref_chirho = entry_chirho.find(f"{LEXICON_NS_CHIRHO}xref")
        etym_chirho = entry_chirho.find(f"{LEXICON_NS_CHIRHO}etym")
        targets_chirho = element_text_chirho(etym_chirho)
        entries_chirho[entry_id_chirho] = LexicalEntryChirho(
            id_chirho=entry_id_chirho,
            lemma_chirho=(word_chirho.text or "") if word_chirho is not None else "",
            xlit_chirho=word_chirho.get("xlit") if word_chirho is not None else None,
            pos_chirho=element_text_chirho(entry_chirho.find(f"{LEXICON_NS_CHIRHO}pos")) or None,
            def_chirho=element_text_chirho(entry_chirho.find(f"{LEXICON_NS_CHIRHO}def")) or None,
            xref_chirho=tuple(sorted(xref_chirho.attrib.items()))
            if xref_chirho is not None
            else (),
            etym_type_chirho=etym_chirho.get("type") if etym_chirho is not None else None,
            etym_root_chirho=etym_chirho.get("root") if etym_chirho is not None else None,
            etym_targets_chirho=tuple(
                target_chirho.strip()
                for target_chirho in targets_chirho.split(",")
                if target_chirho.strip()
            ),
        )
    return entries_chirho


def lexical_entry_for_chirho(
    lemma_chirho: LemmaIdChirho,
    aug_index_chirho: dict[str, str],
    lexical_index_chirho: dict[str, LexicalEntryChirho],
) -> LexicalEntryChirho:
    key_chirho = lemma_chirho.aug_index_key_chirho
    if key_chirho not in aug_index_chirho:
        raise LexiconErrorChirho(f"AugIndex.xml has no key {key_chirho}")
    entry_id_chirho = aug_index_chirho[key_chirho]
    if entry_id_chirho not in lexical_index_chirho:
        raise LexiconErrorChirho(
            f"AugIndex.xml maps {key_chirho} to missing entry {entry_id_chirho}"
        )
    entry_chirho = lexical_index_chirho[entry_id_chirho]
    entry_augment_chirho = dict(entry_chirho.xref_chirho).get("aug")
    if (
        entry_chirho.strong_id_chirho != lemma_chirho.strong_id_chirho
        or entry_augment_chirho != lemma_chirho.augment_chirho
    ):
        raise LexiconErrorChirho(
            f"{key_chirho} maps to {entry_id_chirho}, which is Strong "
            f"{entry_chirho.strong_id_chirho} augment {entry_augment_chirho}"
        )
    return entry_chirho


def family_head_chirho(
    entry_chirho: LexicalEntryChirho, lexical_index_chirho: dict[str, LexicalEntryChirho]
) -> LexicalEntryChirho | None:
    """The main entry carrying the root of this entry's family, if the index gives exactly one."""
    if entry_chirho.etym_type_chirho == "main":
        return entry_chirho if entry_chirho.etym_root_chirho else None
    if entry_chirho.etym_type_chirho != "sub" or len(entry_chirho.etym_targets_chirho) != 1:
        return None
    head_chirho = lexical_index_chirho.get(entry_chirho.etym_targets_chirho[0])
    if (
        head_chirho is None
        or head_chirho.etym_type_chirho != "main"
        or not head_chirho.etym_root_chirho
    ):
        return None
    return head_chirho


def assess_root_chirho(
    strong_entry_chirho: StrongEntryChirho,
    lexical_entry_chirho: LexicalEntryChirho,
    lexical_index_chirho: dict[str, LexicalEntryChirho],
) -> RootAssessmentChirho:
    refs_chirho = strong_entry_chirho.source_refs_chirho
    head_chirho = family_head_chirho(lexical_entry_chirho, lexical_index_chirho)
    family_chirho: tuple[str, ...] = ()
    if head_chirho is not None:
        members_chirho = [head_chirho] + [
            lexical_index_chirho[target_chirho]
            for target_chirho in head_chirho.etym_targets_chirho
            if target_chirho in lexical_index_chirho
        ]
        family_chirho = tuple(
            sorted(
                {
                    member_chirho.strong_id_chirho
                    for member_chirho in members_chirho
                    if member_chirho.strong_id_chirho
                }
            )
        )
    if len(refs_chirho) == 1 and head_chirho is not None and refs_chirho[0] in family_chirho:
        status_chirho, root_text_chirho, root_entry_chirho = (
            TRADITIONAL_CHIRHO,
            head_chirho.etym_root_chirho,
            refs_chirho[0],
        )
    elif not refs_chirho and head_chirho is None:
        status_chirho, root_text_chirho, root_entry_chirho = NOT_APPLICABLE_CHIRHO, None, None
    else:
        status_chirho, root_text_chirho, root_entry_chirho = UNRESOLVED_CHIRHO, None, None
    return RootAssessmentChirho(
        status_chirho=status_chirho,
        root_text_chirho=root_text_chirho,
        root_entry_id_chirho=root_entry_chirho,
        strong_refs_chirho=refs_chirho,
        family_entry_chirho=head_chirho.id_chirho if head_chirho is not None else None,
        family_strong_ids_chirho=family_chirho,
    )
