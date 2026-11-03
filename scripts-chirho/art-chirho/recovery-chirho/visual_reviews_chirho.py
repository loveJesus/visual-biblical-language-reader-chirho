# For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life. — John 3:16 (KJV)
"""Reject unresolved visual decisions; bind any separate owner reconciliation to exact evidence."""

import hashlib
import json

LIMIT_CHIRHO = 1_000_000


def digest_chirho(path_chirho):
    return hashlib.sha256(path_chirho.read_bytes()).hexdigest()


def read_chirho(path_chirho):
    if not path_chirho.is_file() or path_chirho.stat().st_size > LIMIT_CHIRHO:
        raise ValueError("Missing or oversized visual-review evidence")
    return json.loads(path_chirho.read_text(encoding="utf-8"))


def resolution_chirho(attempt_chirho, rejection_chirho):
    path_chirho = attempt_chirho.parent / "owner-visual-resolutions-chirho.json"
    if not path_chirho.is_file():
        raise ValueError("Sheet visually rejected; owner reconciliation required")
    document_chirho = read_chirho(path_chirho)
    rows_chirho = document_chirho.get("resolutions_chirho")
    if (
        document_chirho.get("schema_version_chirho") != 1
        or not isinstance(rows_chirho, list)
        or len(rows_chirho) > 256
    ):
        raise ValueError("Invalid bounded owner visual-review index")
    matches_chirho = [
        row_chirho
        for row_chirho in rows_chirho
        if isinstance(row_chirho, dict) and row_chirho.get("attempt_chirho") == attempt_chirho.name
    ]
    if len(matches_chirho) != 1:
        raise ValueError("Sheet visually rejected; unique owner reconciliation required")
    row_chirho = matches_chirho[0]
    files_chirho = {
        "plan_sha256_chirho": "plan-chirho.json",
        "original_sha256_chirho": "sheet-original-chirho.webp",
        "sheet_sha256_chirho": "keyed-sheet-chirho.webp",
        "visual_review_sha256_chirho": "visual-review-chirho.json",
    }
    if (
        row_chirho.get("reviewed_by_chirho") != "gpt_chirho"
        or row_chirho.get("decision_chirho") != "agent_visual_review_reconciled"
        or row_chirho.get("inspected_chirho") is not True
        or row_chirho.get("art_review_chirho") != "pending"
        or not isinstance(row_chirho.get("basis_chirho"), str)
        or not row_chirho["basis_chirho"].strip()
        or any(
            row_chirho.get(key_chirho) != digest_chirho(attempt_chirho / file_chirho)
            for key_chirho, file_chirho in files_chirho.items()
        )
        or row_chirho.get("rejection_sha256_chirho")
        != (
            digest_chirho(rejection_chirho)
            if rejection_chirho.exists() or rejection_chirho.is_symlink()
            else None
        )
    ):
        raise ValueError("Rejected sheet owner review is stale, incomplete or changes pending art")
    return row_chirho


def review_chirho(attempt_chirho, allow_partial_chirho=False):
    # Workflow: art-recovery-chirho.md. The generating child cannot silently clear its rejection.
    rejection_chirho = attempt_chirho / "visual-rejected-chirho.json"
    review_chirho = read_chirho(attempt_chirho / "visual-review-chirho.json")
    rejected_chirho = (
        rejection_chirho.exists()
        or rejection_chirho.is_symlink()
        or review_chirho.get("visual_pass_chirho") is False
        or review_chirho.get("layout_constraints_met_chirho") is False
        or review_chirho.get("layout_review_chirho") == "rejected"
        or review_chirho.get("outcome_chirho") not in (None, "passed", "visual_passed")
    )
    if rejected_chirho:
        owner_chirho = resolution_chirho(attempt_chirho, rejection_chirho)
        if "excluded_cells_chirho" in owner_chirho:
            exclusions_chirho = owner_chirho["excluded_cells_chirho"]
            if (
                not allow_partial_chirho
                or not isinstance(exclusions_chirho, list)
                or not 1 <= len(exclusions_chirho) < 16
                or any(
                    not isinstance(cell_chirho, dict)
                    or type(cell_chirho.get("cell_chirho")) is not int
                    or not 0 <= cell_chirho["cell_chirho"] < 16
                    or not isinstance(cell_chirho.get("reason_chirho"), str)
                    or not cell_chirho["reason_chirho"].strip()
                    for cell_chirho in exclusions_chirho
                )
                or len({cell_chirho["cell_chirho"] for cell_chirho in exclusions_chirho})
                != len(exclusions_chirho)
                or owner_chirho.get("reviews_sha256_chirho")
                != digest_chirho(attempt_chirho / "reviews-chirho.json")
            ):
                raise ValueError("Invalid or unsupported partial visual recovery")
            return {**review_chirho, "owner_partial_review_chirho": owner_chirho}
    return review_chirho


def included_cells_chirho(review_chirho, selected_chirho):
    """Retain original cell identities; an excluded primary also excludes its alternates."""
    exclusions_chirho = {
        cell_chirho["cell_chirho"]
        for cell_chirho in review_chirho.get("owner_partial_review_chirho", {}).get(
            "excluded_cells_chirho", []
        )
    }
    return {
        index_chirho
        for index_chirho, cell_chirho in enumerate(selected_chirho)
        if index_chirho not in exclusions_chirho
        and cell_chirho.get("alternate_of_cell_chirho") not in exclusions_chirho
    }
