# For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life. — John 3:16 (KJV)
"""Workflow: hosting-chirho/word-study-chirho.md. Offline, hash-bound lemma counts; no database."""

import argparse
import hashlib
import json
import re
from collections import Counter, defaultdict
from pathlib import Path


def digest_chirho(bytes_chirho):
    return hashlib.sha256(bytes_chirho).hexdigest()


def json_bytes_chirho(value_chirho):
    return (
        json.dumps(value_chirho, ensure_ascii=False, separators=(",", ":")) + "\n"
    ).encode()


def verified_chirho(root_chirho, path_chirho, sha_chirho):
    file_chirho = root_chirho / path_chirho.lstrip("/")
    if not file_chirho.resolve().is_relative_to(root_chirho.resolve()):
        raise ValueError("Source escapes static root")
    bytes_chirho = file_chirho.read_bytes()
    if digest_chirho(bytes_chirho) != sha_chirho:
        raise ValueError("Source hash mismatch: " + path_chirho)
    return json.loads(bytes_chirho)


def lemma_chirho(token_chirho):
    key_chirho = token_chirho["lemma_id_chirho"] + (
        token_chirho.get("lemma_augment_chirho") or ""
    )
    return key_chirho if re.fullmatch(r"[HG][0-9]+[a-z]?", key_chirho) else None


def aggregate_chirho(content_chirho, layer_chirho, edition_chirho, records_chirho):
    """Count only exact aligned source tokens; empty glosses stay outside the chart denominator."""
    for verse_chirho in content_chirho["verses_chirho"]:
        words_chirho = (
            layer_chirho["verses_chirho"]
            .get(verse_chirho["id_chirho"], {})
            .get(edition_chirho + "_chirho")
        )
        if words_chirho is None:
            continue
        tokens_chirho = verse_chirho["tokens_chirho"]
        aligned_chirho = words_chirho["words_chirho"]
        if len(tokens_chirho) != len(aligned_chirho) or any(
            token_chirho["id_chirho"] != word_chirho["token_id_chirho"]
            or token_chirho["text_chirho"] != word_chirho["text_chirho"]
            for token_chirho, word_chirho in zip(tokens_chirho, aligned_chirho)
        ):
            raise ValueError(
                "Edition token alignment changed: " + verse_chirho["id_chirho"]
            )
        source_chirho = words_chirho["source_id_chirho"]
        if source_chirho not in {
            row_chirho["id_chirho"] for row_chirho in layer_chirho["sources_chirho"]
        }:
            raise ValueError("Edition source missing")
        for token_chirho, word_chirho in zip(tokens_chirho, aligned_chirho):
            key_chirho = lemma_chirho(token_chirho)
            if key_chirho is None:
                continue
            record_chirho = records_chirho.setdefault(
                key_chirho,
                {"covered_chirho": 0, "empty_chirho": 0, "glosses_chirho": {}},
            )
            record_chirho["covered_chirho"] += 1
            gloss_chirho = word_chirho["gloss_chirho"].strip()
            if not gloss_chirho:
                record_chirho["empty_chirho"] += 1
                continue
            group_chirho = record_chirho["glosses_chirho"].setdefault(
                gloss_chirho,
                {
                    "gloss_chirho": gloss_chirho,
                    "count_chirho": 0,
                    "examples_chirho": [],
                    "verse_ids_chirho": [],
                    "seen_verses_chirho": set(),
                },
            )
            group_chirho["count_chirho"] += 1
            if verse_chirho["id_chirho"] not in group_chirho["seen_verses_chirho"]:
                group_chirho["seen_verses_chirho"].add(verse_chirho["id_chirho"])
                group_chirho["verse_ids_chirho"].append(verse_chirho["id_chirho"])
            examples_chirho = group_chirho["examples_chirho"]
            if len(examples_chirho) < 3 and not any(
                row_chirho["verse_chirho"] == verse_chirho["id_chirho"]
                for row_chirho in examples_chirho
            ):
                examples_chirho.append(
                    {
                        "verse_chirho": verse_chirho["id_chirho"],
                        "reference_chirho": verse_chirho["reference_chirho"],
                        "text_chirho": token_chirho["text_chirho"],
                    }
                )


def build_chirho(root_chirho, output_chirho):
    manifest_bytes_chirho = (
        root_chirho / "glosses-chirho/editions-chirho/manifest-chirho.json"
    ).read_bytes()
    manifest_chirho = json.loads(manifest_bytes_chirho)
    entries_chirho = {}
    for language_chirho in manifest_chirho["languages_chirho"].values():
        for book_chirho in language_chirho["books_chirho"].values():
            for entry_chirho in book_chirho["chapters_chirho"]:
                entries_chirho[entry_chirho["content_path_chirho"]] = entry_chirho[
                    "content_sha256_chirho"
                ]
    totals_chirho = Counter()
    for path_chirho, sha_chirho in entries_chirho.items():
        content_chirho = verified_chirho(root_chirho, path_chirho, sha_chirho)
        for verse_chirho in content_chirho["verses_chirho"]:
            for token_chirho in verse_chirho["tokens_chirho"]:
                key_chirho = lemma_chirho(token_chirho)
                if key_chirho:
                    totals_chirho[key_chirho] += 1
    result_chirho = {
        "schema_version_chirho": 1,
        "edition_manifest_sha256_chirho": digest_chirho(manifest_bytes_chirho),
        "editions_chirho": {},
    }
    output_chirho.mkdir(parents=True, exist_ok=True)
    for language_chirho, language_data_chirho in manifest_chirho[
        "languages_chirho"
    ].items():
        records_chirho = {"readers": {}, "terse": {}}
        for book_chirho in language_data_chirho["books_chirho"].values():
            for entry_chirho in book_chirho["chapters_chirho"]:
                layer_chirho = verified_chirho(
                    root_chirho,
                    entry_chirho["path_chirho"],
                    entry_chirho["sha256_chirho"],
                )
                content_chirho = verified_chirho(
                    root_chirho,
                    entry_chirho["content_path_chirho"],
                    entry_chirho["content_sha256_chirho"],
                )
                if (
                    layer_chirho["schema_version_chirho"] != 1
                    or layer_chirho["language_chirho"] != language_chirho
                    or layer_chirho["content_path_chirho"]
                    != entry_chirho["content_path_chirho"]
                    or layer_chirho["content_sha256_chirho"]
                    != entry_chirho["content_sha256_chirho"]
                ):
                    raise ValueError("Edition content binding changed")
                for edition_chirho, edition_records_chirho in records_chirho.items():
                    aggregate_chirho(
                        content_chirho,
                        layer_chirho,
                        edition_chirho,
                        edition_records_chirho,
                    )
        for edition_chirho, lemma_records_chirho in records_chirho.items():
            if not lemma_records_chirho:
                continue
            edition_key_chirho = language_chirho + "-" + edition_chirho
            shards_chirho = defaultdict(dict)
            for key_chirho, record_chirho in sorted(lemma_records_chirho.items()):
                record_chirho["total_chirho"] = totals_chirho[key_chirho]
                for group_chirho in record_chirho["glosses_chirho"].values():
                    del group_chirho["seen_verses_chirho"]
                record_chirho["glosses_chirho"] = sorted(
                    record_chirho["glosses_chirho"].values(),
                    key=lambda row_chirho: (
                        -row_chirho["count_chirho"],
                        row_chirho["gloss_chirho"],
                    ),
                )
                part_chirho = (
                    f"{int(digest_chirho(key_chirho.encode())[:2], 16) & 63:02x}"
                )
                shards_chirho[part_chirho][key_chirho] = record_chirho
            bindings_chirho = {}
            for part_chirho, rows_chirho in sorted(shards_chirho.items()):
                bytes_chirho = json_bytes_chirho(
                    {
                        "schema_version_chirho": 1,
                        "edition_chirho": edition_key_chirho,
                        "lemmas_chirho": rows_chirho,
                    }
                )
                if len(bytes_chirho) > 2_000_000:
                    raise ValueError("Shard exceeds client limit")
                sha_chirho = digest_chirho(bytes_chirho)
                relative_chirho = f"{edition_key_chirho}-chirho/{part_chirho}-chirho/{sha_chirho}-chirho.json"
                target_chirho = output_chirho / "shards-chirho" / relative_chirho
                target_chirho.parent.mkdir(parents=True, exist_ok=True)
                target_chirho.write_bytes(bytes_chirho)
                bindings_chirho[part_chirho] = {
                    "path_chirho": "/study-chirho/shards-chirho/" + relative_chirho,
                    "sha256_chirho": sha_chirho,
                    "bytes_chirho": len(bytes_chirho),
                }
            result_chirho["editions_chirho"][edition_key_chirho] = {
                "language_chirho": language_chirho,
                "mode_chirho": edition_chirho,
                "lemmas_chirho": len(lemma_records_chirho),
                "shards_chirho": bindings_chirho,
            }
    (output_chirho / "manifest-chirho.json").write_bytes(
        json_bytes_chirho(result_chirho)
    )
    return {
        "source_chapters_chirho": len(entries_chirho),
        "source_tokens_chirho": sum(totals_chirho.values()),
        "editions_chirho": {
            key_chirho: value_chirho["lemmas_chirho"]
            for key_chirho, value_chirho in result_chirho["editions_chirho"].items()
        },
    }


if __name__ == "__main__":
    parser_chirho = argparse.ArgumentParser()
    parser_chirho.add_argument("--static-chirho", type=Path, required=True)
    parser_chirho.add_argument("--output-chirho", type=Path, required=True)
    arguments_chirho = parser_chirho.parse_args()
    print(
        json.dumps(
            build_chirho(arguments_chirho.static_chirho, arguments_chirho.output_chirho)
        )
    )
