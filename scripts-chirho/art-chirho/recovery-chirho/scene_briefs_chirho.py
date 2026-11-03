# For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life. — John 3:16 (KJV)
"""Workflow: selective-scene-variants-chirho.md. Reuse source-bound verse explanations across renderers."""

import hashlib
import json
import os
import re


def instruction_chirho(brief_chirho):
    if brief_chirho is not None:
        return "Copy reusable_brief_chirho.explanation_chirho verbatim."
    return (
        "No existing explanation is supplied or required. Write a concise explanation from "
        "the verified verse and its glosses, independently of the illustration."
    )


def path_chirho(root_chirho, job_chirho):
    match_chirho = re.fullmatch(
        r"(Prov|John|Gen)\.([1-9][0-9]?)\.([1-9][0-9]{0,2})", job_chirho["id_chirho"]
    )
    if (
        not match_chirho
        or hashlib.sha256(job_chirho["canonical_text_chirho"].encode()).hexdigest()
        != job_chirho["canonical_sha256_chirho"]
    ):
        raise ValueError("Scene brief source identity changed")
    folder_chirho = {"Prov": "proverbs-chirho", "John": "john-chirho", "Gen": "genesis-chirho"}[
        match_chirho[1]
    ]
    return (
        root_chirho
        / "workspace-chirho/art-chirho/briefs-chirho"
        / folder_chirho
        / f"chapter-{int(match_chirho[2]):02d}-chirho"
        / f"verse-{int(match_chirho[3]):03d}-chirho.json"
    )


def read_chirho(root_chirho, job_chirho):
    file_chirho = path_chirho(root_chirho, job_chirho)
    if not file_chirho.exists():
        return None
    value_chirho = json.loads(file_chirho.read_text(encoding="utf-8"))
    if (
        value_chirho["canonical_sha256_chirho"] != job_chirho["canonical_sha256_chirho"]
        or value_chirho["lesson_id_chirho"] != job_chirho["id_chirho"]
    ):
        raise ValueError("Stored scene explanation belongs to different source text")
    return value_chirho


def retain_chirho(root_chirho, job_chirho, explanation_chirho):
    if explanation_chirho is None:
        return None  # Historical attempts keep their original three-field records.
    if (
        not isinstance(explanation_chirho, str)
        or not explanation_chirho.strip()
        or len(explanation_chirho) > 8000
    ):
        raise ValueError("Scene explanation is missing or oversized")
    previous_chirho = read_chirho(root_chirho, job_chirho)
    if previous_chirho:
        if previous_chirho["explanation_chirho"] != explanation_chirho:
            raise ValueError("Do not silently replace a reusable verse explanation")
        return previous_chirho
    value_chirho = {
        "schema_version_chirho": 1,
        "lesson_id_chirho": job_chirho["id_chirho"],
        "canonical_sha256_chirho": job_chirho["canonical_sha256_chirho"],
        "canonical_text_chirho": job_chirho["canonical_text_chirho"],
        "explanation_chirho": explanation_chirho,
        "review_chirho": "agent_draft",
    }
    file_chirho = path_chirho(root_chirho, job_chirho)
    file_chirho.parent.mkdir(parents=True, exist_ok=True)
    with file_chirho.open("x", encoding="utf-8") as stream_chirho:
        stream_chirho.write(json.dumps(value_chirho, ensure_ascii=False, indent=2) + "\n")
        stream_chirho.flush()
        os.fsync(stream_chirho.fileno())
    return value_chirho
