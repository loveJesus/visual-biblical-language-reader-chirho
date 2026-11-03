# For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life. — John 3:16 (KJV)
"""Cut an even sticker sheet with ImageMagick; measure alpha without changing the art."""

import argparse
import hashlib
import json
import os
import subprocess
from collections import deque
from datetime import UTC, datetime
from pathlib import Path

from PIL import Image, ImageFilter


def prepare_icons_chirho(output_chirho, cells_chirho):
    """Trim empty margins only after the entire sheet passes its original cell checks."""
    if not all(cell_chirho["layout_pass_chirho"] for cell_chirho in cells_chirho):
        return
    for cell_chirho in cells_chirho:
        source_chirho = output_chirho / cell_chirho["filename_chirho"]
        icon_chirho = output_chirho / "icons-chirho" / cell_chirho["filename_chirho"]
        icon_chirho.parent.mkdir(parents=True, exist_ok=True)
        subprocess.run(
            ["magick", str(source_chirho), "-trim", "+repage", str(icon_chirho)], check=True
        )
        cell_chirho["icon_filename_chirho"] = str(icon_chirho.relative_to(output_chirho))
        cell_chirho["icon_sha256_chirho"] = hashlib.sha256(icon_chirho.read_bytes()).hexdigest()


def cluster_count_chirho(alpha_chirho):
    """Count separated foreground groups after a declared proximity merge, not semantic objects."""
    probe_chirho = alpha_chirho.resize((40, 40)).filter(ImageFilter.MaxFilter(7))
    foreground_chirho = {
        (x_chirho, y_chirho)
        for y_chirho in range(40)
        for x_chirho in range(40)
        if probe_chirho.getpixel((x_chirho, y_chirho)) > 32
    }
    count_chirho = 0
    while foreground_chirho:
        count_chirho += 1
        pending_chirho = deque([foreground_chirho.pop()])
        while pending_chirho:
            x_chirho, y_chirho = pending_chirho.popleft()
            for dx_chirho, dy_chirho in ((1, 0), (-1, 0), (0, 1), (0, -1)):
                neighbor_chirho = x_chirho + dx_chirho, y_chirho + dy_chirho
                if neighbor_chirho in foreground_chirho:
                    foreground_chirho.remove(neighbor_chirho)
                    pending_chirho.append(neighbor_chirho)
    return count_chirho


def main_chirho():
    # Workflow: spec-chirho/workflows-chirho/local-reader-chirho.md, preserve → cut → checks.
    parser_chirho = argparse.ArgumentParser(description=__doc__)
    parser_chirho.add_argument("sheet_chirho", type=Path)
    parser_chirho.add_argument("output_chirho", type=Path)
    parser_chirho.add_argument("--prompt-file-chirho", required=True, type=Path)
    args_chirho = parser_chirho.parse_args()
    prompt_text_chirho = args_chirho.prompt_file_chirho.read_text()
    if args_chirho.output_chirho.exists():
        raise SystemExit("Refusing to overwrite an existing sheet review directory.")
    with Image.open(args_chirho.sheet_chirho) as sheet_chirho:
        width_chirho, height_chirho = sheet_chirho.size
        if width_chirho != height_chirho or "A" not in sheet_chirho.getbands():
            raise SystemExit("Expected a square RGBA image.")
    args_chirho.output_chirho.mkdir(parents=True)
    subprocess.run(
        [
            "magick",
            str(args_chirho.sheet_chirho),
            "-crop",
            "4x4@",
            "+repage",
            "+adjoin",
            str(args_chirho.output_chirho / "cell-%02d-chirho.png"),
        ],
        check=True,
    )
    cells_chirho = []
    for index_chirho in range(16):
        file_chirho = args_chirho.output_chirho / f"cell-{index_chirho:02d}-chirho.png"
        shard_chirho = args_chirho.output_chirho / (
            "0000-chirho" if index_chirho < 10 else "0010-chirho"
        )
        shard_chirho.mkdir(exist_ok=True)
        file_chirho = file_chirho.rename(shard_chirho / file_chirho.name)
        with Image.open(file_chirho) as cell_chirho:
            alpha_chirho = cell_chirho.getchannel("A")
            bbox_chirho = alpha_chirho.point(
                lambda value_chirho: 255 if value_chirho > 8 else 0
            ).getbbox()
            cell_width_chirho, cell_height_chirho = cell_chirho.size
            clearance_chirho = (
                min(
                    bbox_chirho[0],
                    bbox_chirho[1],
                    cell_width_chirho - bbox_chirho[2],
                    cell_height_chirho - bbox_chirho[3],
                )
                if bbox_chirho
                else 0
            )
            gutter_clear_chirho = all(
                alpha_chirho.crop(region_chirho).getextrema()[1] == 0
                for region_chirho in (
                    (0, 0, cell_width_chirho, 8),
                    (0, cell_height_chirho - 8, cell_width_chirho, cell_height_chirho),
                    (0, 0, 8, cell_height_chirho),
                    (cell_width_chirho - 8, 0, cell_width_chirho, cell_height_chirho),
                )
            )
            clusters_chirho = cluster_count_chirho(alpha_chirho)
        row_chirho = index_chirho // 4
        cells_chirho.append(
            {
                "cell_chirho": index_chirho,
                "row_chirho": row_chirho,
                "column_chirho": index_chirho % 4,
                "intended_lemma_chirho": "H7950" if row_chirho in (0, 2) else "H4306",
                "intended_sense_chirho": "snow" if row_chirho in (0, 2) else "rain",
                "filename_chirho": str(file_chirho.relative_to(args_chirho.output_chirho)),
                "sha256_chirho": hashlib.sha256(file_chirho.read_bytes()).hexdigest(),
                "cell_size_chirho": [cell_width_chirho, cell_height_chirho],
                "alpha_bbox_chirho": bbox_chirho,
                "minimum_edge_clearance_px_chirho": clearance_chirho,
                "empty_8px_edge_gutters_chirho": gutter_clear_chirho,
                "proximity_foreground_clusters_chirho": clusters_chirho,
                "layout_pass_chirho": bool(bbox_chirho)
                and gutter_clear_chirho
                and clearance_chirho >= 16
                and clusters_chirho == 1,
                "subject_review_chirho": "pending_agent_visual_review",
                "review_status_chirho": "pending",
            }
        )
    prepare_icons_chirho(args_chirho.output_chirho, cells_chirho)
    manifest_chirho = {
        "created_at_chirho": datetime.now(UTC).isoformat(),
        "tool_chirho": "built-in image_gen.imagegen",
        "model_chirho": "tool-managed; model version not exposed by tool result",
        "grid_chirho": [4, 4],
        "sheet_size_chirho": [width_chirho, height_chirho],
        "sheet_sha256_chirho": hashlib.sha256(args_chirho.sheet_chirho.read_bytes()).hexdigest(),
        "prompt_file_chirho": os.path.relpath(
            args_chirho.prompt_file_chirho, args_chirho.output_chirho
        ),
        "prompt_chirho": prompt_text_chirho.partition("\n\n")[2].strip() or prompt_text_chirho,
        "measurement_note_chirho": "Alpha >8 defines bbox; all alpha must be zero in each 8px edge gutter. Foreground groups use 40px alpha and a 7px max filter; this proximity heuristic is not semantic object detection. Human review is required.",
        "cells_chirho": cells_chirho,
    }
    (args_chirho.output_chirho / "manifest-chirho.json").write_text(
        json.dumps(manifest_chirho, indent=2) + "\n"
    )
    print(
        json.dumps(
            {
                "cells_chirho": len(cells_chirho),
                "layout_pass_chirho": sum(
                    cell_chirho["layout_pass_chirho"] for cell_chirho in cells_chirho
                ),
                "review_status_chirho": "pending",
            }
        )
    )
    if not all(cell_chirho["layout_pass_chirho"] for cell_chirho in cells_chirho):
        raise SystemExit(2)


if __name__ == "__main__":
    main_chirho()
