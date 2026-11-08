#!/usr/bin/env python3
# For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life. — John 3:16 (KJV)
"""Losslessly cut a reference sheet. Workflow: continuity-chirho/visual-references-chirho.md."""

import argparse as argparse_chirho
import hashlib as hashlib_chirho
import json as json_chirho
from pathlib import Path as PathChirho

from PIL import Image as ImageChirho


def split_sheet_chirho(sheet_path_chirho, output_path_chirho, cells_chirho):
    if sheet_path_chirho.is_symlink() or not sheet_path_chirho.is_file():
        raise ValueError("Reference sheet must be a regular original")
    if len(cells_chirho) != 9 or len(set(cells_chirho)) != 9:
        raise ValueError("Exactly nine distinct cell identifiers are required")
    for id_chirho in cells_chirho:
        if not id_chirho.endswith("-chirho") or any(
            character_chirho not in "abcdefghijklmnopqrstuvwxyz0123456789-"
            for character_chirho in id_chirho
        ):
            raise ValueError("Unsafe cell identifier")
    with ImageChirho.open(sheet_path_chirho) as sheet_chirho:
        sheet_chirho.load()
        width_chirho, height_chirho = sheet_chirho.size
        if width_chirho != height_chirho or width_chirho < 900:
            raise ValueError("Expected a square reference sheet of at least 900 pixels")
        output_path_chirho.mkdir(parents=True, exist_ok=False)
        rows_chirho = []
        for index_chirho, id_chirho in enumerate(cells_chirho):
            column_chirho, row_chirho = index_chirho % 3, index_chirho // 3
            box_chirho = (
                column_chirho * width_chirho // 3,
                row_chirho * height_chirho // 3,
                (column_chirho + 1) * width_chirho // 3,
                (row_chirho + 1) * height_chirho // 3,
            )
            cell_chirho = sheet_chirho.crop(box_chirho)
            target_chirho = output_path_chirho / f"{id_chirho}.png"
            with target_chirho.open("xb") as stream_chirho:
                cell_chirho.save(stream_chirho, format="PNG")
            with ImageChirho.open(target_chirho) as decoded_chirho:
                if decoded_chirho.tobytes() != cell_chirho.tobytes():
                    raise ValueError("Saved crop pixels differ from original cell")
            rows_chirho.append(
                {
                    "id_chirho": id_chirho,
                    "cell_chirho": index_chirho,
                    "box_chirho": box_chirho,
                    "path_chirho": str(target_chirho),
                    "sha256_chirho": hashlib_chirho.sha256(
                        target_chirho.read_bytes()
                    ).hexdigest(),
                    "width_chirho": cell_chirho.width,
                    "height_chirho": cell_chirho.height,
                    "review_chirho": "candidate; pending adoption",
                }
            )
    manifest_chirho = {
        "schema_version_chirho": 1,
        "sheet_path_chirho": str(sheet_path_chirho),
        "sheet_sha256_chirho": hashlib_chirho.sha256(
            sheet_path_chirho.read_bytes()
        ).hexdigest(),
        "grid_chirho": [3, 3],
        "pixels_unchanged_chirho": True,
        "license_chirho": "CC0-1.0",
        "cells_chirho": rows_chirho,
    }
    (output_path_chirho / "manifest-chirho.json").write_text(
        json_chirho.dumps(manifest_chirho, indent=2) + "\n"
    )
    return manifest_chirho


def main_chirho():
    parser_chirho = argparse_chirho.ArgumentParser(description=__doc__)
    parser_chirho.add_argument("sheet_chirho", type=PathChirho)
    parser_chirho.add_argument("output_chirho", type=PathChirho)
    parser_chirho.add_argument("--cells-chirho", required=True)
    arguments_chirho = parser_chirho.parse_args()
    manifest_chirho = split_sheet_chirho(
        arguments_chirho.sheet_chirho,
        arguments_chirho.output_chirho,
        arguments_chirho.cells_chirho.split(","),
    )
    print(json_chirho.dumps({"cut_cells_chirho": len(manifest_chirho["cells_chirho"])}))


if __name__ == "__main__":
    main_chirho()
