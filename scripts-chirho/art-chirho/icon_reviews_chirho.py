# For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life. — John 3:16 (KJV)
"""Exact-context review holds, separate from runnable image jobs and approved senses."""

import hashlib
import json
from pathlib import Path

DEFERRALS_CHIRHO = Path("data-chirho/reader-chirho/icon-deferrals-chirho.json")
INVENTORY_CHIRHO = Path("data-chirho/corpus-chirho/proverbs-lemma-inventory-chirho.json")
FIRST_PASS_DEFERRALS_CHIRHO = Path(
    "data-chirho/reader-chirho/icon-first-pass-deferrals-chirho.json"
)


def identity_chirho(row_chirho):
    return (
        row_chirho.get("verse_id_chirho"),
        row_chirho.get("token_id_chirho"),
        row_chirho.get("lemma_id_chirho"),
        row_chirho.get("lemma_augment_chirho"),
    )


def first_pass_deferrals_chirho(root_chirho, inventory_chirho=None):
    # Workflow: art-recovery-chirho.md (reviewed, reversible initial-pass picture backlog).
    path_chirho = root_chirho / FIRST_PASS_DEFERRALS_CHIRHO
    if not path_chirho.exists():
        return {}
    document_chirho = json.loads(path_chirho.read_text(encoding="utf-8"))
    source_chirho = (root_chirho / INVENTORY_CHIRHO).read_bytes()
    if (
        document_chirho.get("schema_version_chirho") != 1
        or document_chirho.get("book_id_chirho") != "Prov"
        or document_chirho.get("scope_chirho") != "initial_icon_pass"
        or document_chirho.get("inventory_sha256_chirho")
        != hashlib.sha256(source_chirho).hexdigest()
    ):
        raise ValueError("Initial-pass picture review pin or scope changed")
    inventory_chirho = inventory_chirho or json.loads(source_chirho)
    known_chirho = {
        (row_chirho["lemma_id_chirho"], row_chirho.get("lemma_augment_chirho")): row_chirho
        for row_chirho in inventory_chirho["lemmas_chirho"]
    }
    rows_chirho = document_chirho.get("lemma_deferrals_chirho")
    if not isinstance(rows_chirho, list) or len(rows_chirho) > len(known_chirho):
        raise ValueError("Invalid initial-pass picture review list")
    result_chirho = {}
    for row_chirho in rows_chirho:
        key_chirho = (row_chirho.get("lemma_id_chirho"), row_chirho.get("lemma_augment_chirho"))
        lemma_chirho = known_chirho.get(key_chirho)
        example_chirho = row_chirho.get("example_chirho")
        if (
            lemma_chirho is None
            or key_chirho in result_chirho
            or row_chirho.get("lexical_form_chirho") != lemma_chirho["lexical_form_chirho"]
            or row_chirho.get("review_status_chirho") != "deferred_for_initial_pass"
            or row_chirho.get("reviewed_by_chirho") != "gpt_chirho"
            or not isinstance(row_chirho.get("reason_chirho"), str)
            or not row_chirho["reason_chirho"].strip()
            or not isinstance(example_chirho, dict)
            or not {"oshb-prov-chirho", "gbt-english-prov-chirho", "lexical-index-chirho"}
            <= set(row_chirho.get("evidence_refs_chirho", []))
        ):
            raise ValueError("Invalid or duplicate reviewed initial-pass lemma")
        if not any(
            occurrence_chirho["reading_chirho"] == "main"
            and all(
                example_chirho.get(field_chirho) == occurrence_chirho[field_chirho]
                for field_chirho in ("verse_id_chirho", "token_id_chirho", "gloss_chirho")
            )
            for occurrence_chirho in lemma_chirho["occurrences_chirho"]
        ):
            raise ValueError("Initial-pass example differs from the pinned occurrence")
        result_chirho[key_chirho] = row_chirho
    return result_chirho


def deferrals_chirho(root_chirho, inventory_chirho=None):
    # Workflow: spec-chirho/workflows-chirho/art-recovery-chirho.md (deferred art review).
    path_chirho = root_chirho / DEFERRALS_CHIRHO
    if not path_chirho.exists():
        return {}
    document_chirho = json.loads(path_chirho.read_text(encoding="utf-8"))
    if (
        document_chirho.get("schema_version_chirho") != 1
        or document_chirho.get("book_id_chirho") != "Prov"
    ):
        raise ValueError("Invalid icon review registry")
    rows_chirho = document_chirho.get("deferrals_chirho")
    if not isinstance(rows_chirho, list):
        raise TypeError("Missing icon review deferrals")
    result_chirho = {}
    for row_chirho in rows_chirho:
        key_chirho = identity_chirho(row_chirho)
        if key_chirho in result_chirho or not all(
            isinstance(value_chirho, str) and value_chirho for value_chirho in key_chirho[:3]
        ):
            raise ValueError("Invalid or duplicate deferred identity")
        if (
            row_chirho.get("review_status_chirho") != "unresolved"
            or not all(
                isinstance(row_chirho.get(field_chirho), str) and row_chirho[field_chirho].strip()
                for field_chirho in ("reason_chirho", "gloss_chirho")
            )
            or not {"oshb-prov-chirho", "gbt-english-prov-chirho", "lexical-index-chirho"}
            <= set(row_chirho.get("evidence_refs_chirho", []))
        ):
            raise ValueError("Deferral requires unresolved status, reason and source evidence")
        result_chirho[key_chirho] = row_chirho
    if inventory_chirho is not None:
        known_chirho = {
            (
                occurrence_chirho["verse_id_chirho"],
                occurrence_chirho["token_id_chirho"],
                lemma_chirho["lemma_id_chirho"],
                lemma_chirho["lemma_augment_chirho"],
            ): occurrence_chirho["gloss_chirho"]
            for lemma_chirho in inventory_chirho["lemmas_chirho"]
            for occurrence_chirho in lemma_chirho["occurrences_chirho"]
        }
        if any(
            known_chirho.get(key_chirho) != row_chirho["gloss_chirho"]
            for key_chirho, row_chirho in result_chirho.items()
        ):
            raise ValueError("Deferral does not match the pinned occurrence inventory")
    return result_chirho
