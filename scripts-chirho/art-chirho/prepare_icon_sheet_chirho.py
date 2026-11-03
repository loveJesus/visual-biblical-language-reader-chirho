#!/usr/bin/env python3
# For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life. — John 3:16 (KJV)
"""Measure real empty gutters in a 4x4 atlas, then crop lossless WebP icons up to 128px."""

import argparse
import hashlib
import json
import subprocess
from datetime import UTC, datetime
from itertools import pairwise as pairwise_chirho
from pathlib import Path

from cut_sheet_chirho import cluster_count_chirho
from PIL import Image


def cuts_chirho(alpha_chirho, axis_chirho):
    size_chirho = alpha_chirho.width if axis_chirho == "x" else alpha_chirho.height
    empty_chirho = []
    for position_chirho in range(size_chirho):
        box_chirho = (
            (position_chirho, 0, position_chirho + 1, alpha_chirho.height)
            if axis_chirho == "x"
            else (0, position_chirho, alpha_chirho.width, position_chirho + 1)
        )
        empty_chirho.append(alpha_chirho.crop(box_chirho).getextrema()[1] == 0)
    runs_chirho = []
    start_chirho = None
    for position_chirho, clear_chirho in enumerate(empty_chirho + [False]):
        if clear_chirho and start_chirho is None:
            start_chirho = position_chirho
        if not clear_chirho and start_chirho is not None:
            if position_chirho - start_chirho >= 16:
                runs_chirho.append((start_chirho, position_chirho))
            start_chirho = None
    boundaries_chirho = [0]
    for fraction_chirho in (0.25, 0.5, 0.75):
        candidates_chirho = [
            run_chirho
            for run_chirho in runs_chirho
            if abs(sum(run_chirho) / 2 - size_chirho * fraction_chirho) <= size_chirho * 0.13
        ]
        if not candidates_chirho:
            raise ValueError(f"No proven empty {axis_chirho} gutter near {fraction_chirho}.")
        run_chirho = min(
            candidates_chirho,
            key=lambda candidate_chirho: abs(
                sum(candidate_chirho) / 2 - size_chirho * fraction_chirho
            ),
        )
        boundaries_chirho.append(sum(run_chirho) // 2)
    boundaries_chirho.append(size_chirho)
    if any(
        end_chirho - start_chirho < 64
        for start_chirho, end_chirho in pairwise_chirho(boundaries_chirho)
    ):
        raise ValueError("Gutters do not form four distinct cells.")
    return boundaries_chirho


def main_chirho():
    # Workflow: source atlas → measured empty separators → checked cell → 128px WebP.
    parser_chirho = argparse.ArgumentParser(description=__doc__)
    parser_chirho.add_argument("sheet_chirho", type=Path)
    parser_chirho.add_argument("output_chirho", type=Path)
    parser_chirho.add_argument("--prompt-chirho", required=True, type=Path)
    args_chirho = parser_chirho.parse_args()
    if args_chirho.output_chirho.exists():
        raise SystemExit("Refusing to overwrite an existing atlas review.")
    with Image.open(args_chirho.sheet_chirho) as source_chirho:
        if (
            source_chirho.width > 4096
            or source_chirho.height > 4096
            or "A" not in source_chirho.getbands()
        ):
            raise SystemExit("Expected an alpha atlas no larger than 4096px.")
        alpha_chirho = source_chirho.getchannel("A")
        x_cuts_chirho = cuts_chirho(alpha_chirho, "x")
        y_cuts_chirho = cuts_chirho(alpha_chirho, "y")
        size_chirho = list(source_chirho.size)
    args_chirho.output_chirho.mkdir(parents=True)
    cells_chirho = []
    for index_chirho in range(16):
        column_chirho, row_chirho = index_chirho % 4, index_chirho // 4
        x_chirho, y_chirho = x_cuts_chirho[column_chirho], y_cuts_chirho[row_chirho]
        width_chirho = x_cuts_chirho[column_chirho + 1] - x_chirho
        height_chirho = y_cuts_chirho[row_chirho + 1] - y_chirho
        shard_chirho = args_chirho.output_chirho / (
            "0000-chirho" if index_chirho < 10 else "0010-chirho"
        )
        shard_chirho.mkdir(exist_ok=True)
        cut_chirho = shard_chirho / f"cell-{index_chirho:02d}-cut-chirho.webp"
        icon_chirho = shard_chirho / f"cell-{index_chirho:02d}-icon-chirho.webp"
        subprocess.run(
            [
                "magick",
                str(args_chirho.sheet_chirho),
                "-crop",
                f"{width_chirho}x{height_chirho}+{x_chirho}+{y_chirho}",
                "+repage",
                "-define",
                "webp:lossless=true",
                str(cut_chirho),
            ],
            check=True,
        )
        with Image.open(cut_chirho) as cell_chirho:
            cell_alpha_chirho = cell_chirho.getchannel("A")
            bbox_chirho = cell_alpha_chirho.getbbox()
            clearance_chirho = (
                min(
                    bbox_chirho[0],
                    bbox_chirho[1],
                    width_chirho - bbox_chirho[2],
                    height_chirho - bbox_chirho[3],
                )
                if bbox_chirho
                else 0
            )
            groups_chirho = cluster_count_chirho(cell_alpha_chirho)
        passed_chirho = bool(bbox_chirho) and clearance_chirho >= 8 and groups_chirho == 1
        if passed_chirho:
            subprocess.run(
                [
                    "magick",
                    str(cut_chirho),
                    "-trim",
                    "+repage",
                    "-resize",
                    "120x120>",
                    "-background",
                    "none",
                    "-gravity",
                    "center",
                    "-extent",
                    "128x128",
                    "-define",
                    "webp:lossless=true",
                    str(icon_chirho),
                ],
                check=True,
            )
        cells_chirho.append(
            {
                "cell_chirho": index_chirho,
                "source_box_chirho": [x_chirho, y_chirho, width_chirho, height_chirho],
                "alpha_bbox_chirho": bbox_chirho,
                "clearance_px_chirho": clearance_chirho,
                "foreground_groups_chirho": groups_chirho,
                "layout_pass_chirho": passed_chirho,
                "cut_path_chirho": str(cut_chirho.relative_to(args_chirho.output_chirho)),
                "icon_path_chirho": str(icon_chirho.relative_to(args_chirho.output_chirho))
                if passed_chirho
                else None,
                "icon_sha256_chirho": hashlib.sha256(icon_chirho.read_bytes()).hexdigest()
                if passed_chirho
                else None,
                "width_chirho": 128 if passed_chirho else None,
                "height_chirho": 128 if passed_chirho else None,
            }
        )
    manifest_chirho = {
        "created_at_chirho": datetime.now(UTC).isoformat(),
        "grid_chirho": [4, 4],
        "sheet_size_chirho": size_chirho,
        "sheet_sha256_chirho": hashlib.sha256(args_chirho.sheet_chirho.read_bytes()).hexdigest(),
        "prompt_chirho": args_chirho.prompt_chirho.read_text(),
        "tool_chirho": "image_gen.imagegen",
        "model_chirho": "tool-managed; version not exposed",
        "method_chirho": "4x4 cut boundaries measured at genuinely empty full-height/full-width gutters; nonuniform cells declared; no subject moved or repaired",
        "x_cuts_chirho": x_cuts_chirho,
        "y_cuts_chirho": y_cuts_chirho,
        "review_status_chirho": "pending",
        "cells_chirho": cells_chirho,
    }
    (args_chirho.output_chirho / "manifest-chirho.json").write_text(
        json.dumps(manifest_chirho, indent=2) + "\n"
    )
    print(
        json.dumps(
            {
                "cells_chirho": 16,
                "passed_chirho": sum(
                    cell_chirho["layout_pass_chirho"] for cell_chirho in cells_chirho
                ),
                "x_cuts_chirho": x_cuts_chirho,
                "y_cuts_chirho": y_cuts_chirho,
            }
        )
    )
    if not all(cell_chirho["layout_pass_chirho"] for cell_chirho in cells_chirho):
        raise SystemExit(2)


if __name__ == "__main__":
    main_chirho()
