#!/usr/bin/env python3
# For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life. — John 3:16 (KJV)
"""Finite Runware generation with durable reservations; never resend an uncertain task.

Workflow: book-openers-chirho.md. No catalogue, deployment or retirement writes.
"""

import argparse as argparse_chirho
import concurrent.futures as futures_chirho
import fcntl as fcntl_chirho
import hashlib as hashlib_chirho
import io as io_chirho
import json as json_chirho
import math as math_chirho
import os as os_chirho
import shutil as shutil_chirho
import sys as sys_chirho
import threading as threading_chirho
import time as time_chirho
import urllib.error as error_chirho
import urllib.parse as parse_chirho
import urllib.request as request_chirho
import uuid as uuid_chirho
from datetime import UTC as UTC_CHIRHO
from datetime import datetime as DatetimeChirho
from pathlib import Path as PathChirho

from PIL import Image as ImageChirho

sys_chirho.path.insert(0, str(PathChirho(__file__).parent))
import plan_chirho as plan_module_chirho

ROOT_CHIRHO = plan_module_chirho.ROOT_CHIRHO
HOME_CHIRHO = plan_module_chirho.HOME_CHIRHO
sources_chirho = plan_module_chirho.sources_chirho
ENDPOINT_CHIRHO = "https://api.runware.ai/v1"
HOSTS_CHIRHO = {
    "im.runware.ai",
    "mim.runware.ai",
    "assets.runware.ai",
    "cdn.runware.ai",
}
MUTEX_CHIRHO = threading_chirho.Lock()


class NoRedirectChirho(request_chirho.HTTPRedirectHandler):
    def redirect_request(
        self_chirho,
        req_chirho,
        fp_chirho,
        code_chirho,
        msg_chirho,
        headers_chirho,
        newurl_chirho,
    ):
        raise ValueError("Runware transport redirect refused")


def bytes_sha_chirho(bytes_chirho):
    return hashlib_chirho.sha256(bytes_chirho).hexdigest()


def key_chirho(root_chirho):
    for line_chirho in (root_chirho / ".env").read_text().splitlines():
        line_chirho = line_chirho.strip().removeprefix("export ").strip()
        if line_chirho.startswith("RUNWARE_API_KEY_CHIRHO="):
            value_chirho = line_chirho.split("=", 1)[1].strip().strip("'\"")
            if value_chirho:
                return value_chirho
    raise ValueError("RUNWARE_API_KEY_CHIRHO is unavailable")


def post_chirho(key_value_chirho, tasks_chirho):
    call_chirho = request_chirho.Request(
        ENDPOINT_CHIRHO,
        data=json_chirho.dumps(tasks_chirho).encode(),
        method="POST",
        headers={
            "Authorization": f"Bearer {key_value_chirho}",
            "Content-Type": "application/json",
        },
    )
    opener_chirho = request_chirho.build_opener(NoRedirectChirho())
    try:
        response_chirho = opener_chirho.open(call_chirho, timeout=150)
    except error_chirho.HTTPError as failure_chirho:
        response_chirho = failure_chirho
    with response_chirho:
        bytes_chirho = response_chirho.read(2 * 1024**2 + 1)
        if len(bytes_chirho) > 2 * 1024**2:
            raise ValueError("Provider JSON exceeds response bound")
        return {
            "http_status_chirho": response_chirho.code,
            "body_chirho": json_chirho.loads(bytes_chirho),
        }


def task_chirho(plan_value_chirho, job_chirho, task_uuid_chirho):
    if (
        plan_value_chirho["model_chirho"] != plan_module_chirho.MODEL_CHIRHO
        or plan_value_chirho["maximum_usd_chirho"] != 35
        or plan_value_chirho["reservation_usd_chirho"] != 1
        or plan_value_chirho["maximum_requests_per_verse_chirho"] != 1
        or plan_value_chirho["maximum_concurrency_chirho"] != 3
    ):
        raise ValueError("Opening task authority differs")
    if (
        plan_value_chirho["width_chirho"],
        plan_value_chirho["height_chirho"],
        plan_value_chirho["quality_chirho"],
        plan_value_chirho["thinking_level_chirho"],
    ) != (1536, 1152, "medium", "high"):
        raise ValueError("Frozen rendering recipe differs")
    if (
        job_chirho["id_chirho"].split(".")[1:] not in [["1", "1"], ["1", "2"]]
        or len(job_chirho["prompt_chirho"]) > 16000
        or bytes_sha_chirho(job_chirho["prompt_chirho"].encode())
        != job_chirho["prompt_sha256_chirho"]
    ):
        raise ValueError("Opening job is outside its exact source/prompt scope")
    return {
        "taskType": "imageInference",
        "taskUUID": task_uuid_chirho,
        "model": plan_value_chirho["model_chirho"],
        "positivePrompt": job_chirho["prompt_chirho"],
        "width": 1536,
        "height": 1152,
        "numberResults": 1,
        "outputType": "URL",
        "outputFormat": "PNG",
        "includeCost": True,
        "settings": {
            "quality": "medium",
            "thinkingLevel": "high",
            "background": "opaque",
        },
    }


def source_chirho(root_chirho, job_chirho):
    path_chirho = root_chirho / "static" / job_chirho["content_path_chirho"].lstrip("/")
    chapter_chirho = sources_chirho.read_chirho(
        path_chirho, sources_chirho.MAX_CHAPTER_CHIRHO
    )
    verse_chirho = next(
        row_chirho
        for row_chirho in chapter_chirho["verses_chirho"]
        if row_chirho["id_chirho"] == job_chirho["id_chirho"]
    )
    if (
        bytes_sha_chirho(path_chirho.read_bytes())
        != job_chirho["content_sha256_chirho"]
        or verse_chirho["canonical_text_chirho"] != job_chirho["canonical_text_chirho"]
        or bytes_sha_chirho(verse_chirho["canonical_text_chirho"].encode())
        != job_chirho["canonical_sha256_chirho"]
    ):
        raise ValueError("Opening canonical source changed before dispatch")


def load_ledger_chirho(home_chirho, plan_sha_chirho):
    rows_chirho = []
    for path_chirho in sorted(
        (home_chirho / "attempts-chirho").glob("*-chirho/request-chirho.json")
    ):
        row_chirho = sources_chirho.read_chirho(path_chirho)
        if row_chirho["plan_sha256_chirho"] != plan_sha_chirho:
            raise ValueError("Request belongs to another frozen plan")
        result_path_chirho = path_chirho.with_name("result-chirho.json")
        if result_path_chirho.exists():
            result_chirho = sources_chirho.read_chirho(result_path_chirho)
            cost_chirho = result_chirho.get("cost_usd_chirho")
            if (
                not isinstance(cost_chirho, (float, int))
                or not math_chirho.isfinite(cost_chirho)
                or cost_chirho < 0
            ):
                raise ValueError("Reported task cost is invalid")
            row_chirho["accounted_usd_chirho"] = cost_chirho
        else:
            row_chirho["accounted_usd_chirho"] = row_chirho["reserved_usd_chirho"]
        rows_chirho.append(row_chirho)
    if len(rows_chirho) > 124 or len(
        {row_chirho["id_chirho"] for row_chirho in rows_chirho}
    ) != len(rows_chirho):
        raise ValueError("Request ledger exceeded the finite opening scope")
    return rows_chirho


def reserve_chirho(home_chirho, plan_value_chirho, plan_sha_chirho, job_chirho):
    with MUTEX_CHIRHO:
        rows_chirho = load_ledger_chirho(home_chirho, plan_sha_chirho)
        existing_chirho = [
            row_chirho
            for row_chirho in rows_chirho
            if row_chirho["id_chirho"] == job_chirho["id_chirho"]
        ]
        if existing_chirho:
            return existing_chirho[0], False
        if (
            any(row_chirho["accounted_usd_chirho"] > 1 for row_chirho in rows_chirho)
            or sum(row_chirho["accounted_usd_chirho"] for row_chirho in rows_chirho) + 1
            > 35
        ):
            raise ValueError(
                "Opening allowance exhausted or a task exceeded its conservative reservation"
            )
        task_value_chirho = task_chirho(
            plan_value_chirho, job_chirho, str(uuid_chirho.uuid4())
        )
        row_chirho = {
            "id_chirho": job_chirho["id_chirho"],
            "plan_sha256_chirho": plan_sha_chirho,
            "reserved_usd_chirho": 1,
            "at_chirho": DatetimeChirho.now(UTC_CHIRHO).isoformat(),
            "task_chirho": task_value_chirho,
        }
        path_chirho = (
            home_chirho
            / "attempts-chirho"
            / (job_chirho["id_chirho"].lower().replace(".", "-") + "-chirho")
            / "request-chirho.json"
        )
        sources_chirho.write_chirho(path_chirho, row_chirho)
        return row_chirho, True


def choose_result_chirho(body_chirho, task_uuid_chirho):
    matches_chirho = [
        row_chirho
        for row_chirho in body_chirho.get("data", [])
        if row_chirho.get("taskUUID") == task_uuid_chirho and row_chirho.get("imageURL")
    ]
    if len(matches_chirho) > 1:
        raise ValueError("Provider returned multiple images for one opening")
    return matches_chirho[0] if matches_chirho else None


def reconcile_chirho(key_value_chirho, request_value_chirho, attempt_chirho):
    task_uuid_chirho = request_value_chirho["task_chirho"]["taskUUID"]
    response_chirho = post_chirho(
        key_value_chirho, [{"taskType": "getTaskDetails", "taskUUID": task_uuid_chirho}]
    )
    path_chirho = attempt_chirho / (
        "details-" + str(time_chirho.time_ns()) + "-chirho.json"
    )
    sources_chirho.write_chirho(path_chirho, response_chirho)
    for row_chirho in response_chirho["body_chirho"].get("data", []):
        result_chirho = choose_result_chirho(
            row_chirho.get("response") or {}, task_uuid_chirho
        )
        if result_chirho:
            return result_chirho
    return None


def download_chirho(result_chirho):
    parsed_chirho = parse_chirho.urlparse(result_chirho["imageURL"])
    if (
        parsed_chirho.scheme != "https"
        or parsed_chirho.hostname not in HOSTS_CHIRHO
        or parsed_chirho.username
        or parsed_chirho.password
    ):
        raise ValueError("Provider image URL is outside the trusted hosts")
    opener_chirho = request_chirho.build_opener(NoRedirectChirho())
    with opener_chirho.open(result_chirho["imageURL"], timeout=90) as response_chirho:
        data_chirho = response_chirho.read(32 * 1024**2 + 1)
    if len(data_chirho) > 32 * 1024**2:
        raise ValueError("Provider image exceeds size bound")
    with ImageChirho.open(io_chirho.BytesIO(data_chirho)) as image_chirho:
        image_chirho.load()
        if (
            image_chirho.format != "PNG"
            or image_chirho.size != (1536, 1152)
            or any(
                high_chirho - low_chirho < 12
                for low_chirho, high_chirho in image_chirho.convert("RGB").getextrema()
            )
        ):
            raise ValueError("Opening image format, dimensions or pixel range differs")
    return data_chirho


def generate_chirho(
    root_chirho,
    home_chirho,
    plan_value_chirho,
    plan_sha_chirho,
    job_chirho,
    key_value_chirho,
):
    if shutil_chirho.disk_usage(root_chirho).free < 15 * 1024**3:
        raise ValueError("Existing 15 GiB storage floor reached")
    source_chirho(root_chirho, job_chirho)
    reserved_chirho, new_chirho = reserve_chirho(
        home_chirho, plan_value_chirho, plan_sha_chirho, job_chirho
    )
    attempt_chirho = (
        home_chirho
        / "attempts-chirho"
        / (job_chirho["id_chirho"].lower().replace(".", "-") + "-chirho")
    )
    result_path_chirho = attempt_chirho / "result-chirho.json"
    if result_path_chirho.exists():
        return sources_chirho.read_chirho(result_path_chirho)
    task_uuid_chirho = reserved_chirho["task_chirho"]["taskUUID"]
    response_path_chirho = attempt_chirho / "response-chirho.json"
    if new_chirho:
        response_chirho = post_chirho(
            key_value_chirho, [reserved_chirho["task_chirho"]]
        )
        sources_chirho.write_chirho(response_path_chirho, response_chirho)
    else:
        response_chirho = (
            sources_chirho.read_chirho(response_path_chirho)
            if response_path_chirho.exists()
            else {"body_chirho": {}}
        )
    result_chirho = choose_result_chirho(
        response_chirho["body_chirho"], task_uuid_chirho
    )
    if result_chirho is None:
        result_chirho = reconcile_chirho(
            key_value_chirho, reserved_chirho, attempt_chirho
        )
    if result_chirho is None:
        sources_chirho.write_chirho(
            attempt_chirho / "held-chirho.json",
            {
                "reason_chirho": "Original task unresolved or refused; no inference resend",
                "task_uuid_chirho": task_uuid_chirho,
            },
        )
        return {"id_chirho": job_chirho["id_chirho"], "state_chirho": "held"}
    cost_chirho = result_chirho.get("cost")
    if (
        not isinstance(cost_chirho, (float, int))
        or not math_chirho.isfinite(cost_chirho)
        or cost_chirho < 0
    ):
        raise ValueError("Result lacks a valid reported cost; reservation retained")
    data_chirho = download_chirho(result_chirho)
    path_chirho = attempt_chirho / "original-chirho.png"
    if path_chirho.exists():
        if path_chirho.read_bytes() != data_chirho:
            raise ValueError(
                "Previously received original differs; retain both request and uncertainty"
            )
    else:
        with path_chirho.open("xb") as stream_chirho:
            stream_chirho.write(data_chirho)
            stream_chirho.flush()
            os_chirho.fsync(stream_chirho.fileno())
    value_chirho = {
        "id_chirho": job_chirho["id_chirho"],
        "task_uuid_chirho": task_uuid_chirho,
        "image_uuid_chirho": result_chirho["imageUUID"],
        "cost_usd_chirho": cost_chirho,
        "original_path_chirho": str(path_chirho.relative_to(root_chirho)),
        "original_sha256_chirho": bytes_sha_chirho(data_chirho),
        "bytes_chirho": len(data_chirho),
        "provider_result_chirho": result_chirho,
        "state_chirho": "received",
    }
    sources_chirho.write_chirho(result_path_chirho, value_chirho)
    (attempt_chirho / "held-chirho.json").unlink(missing_ok=True)
    return value_chirho


def main_chirho():
    parser_chirho = argparse_chirho.ArgumentParser(description=__doc__)
    parser_chirho.add_argument("--apply-chirho", action="store_true")
    parser_chirho.add_argument(
        "--limit-chirho", type=int, default=1, choices=range(1, 125)
    )
    arguments_chirho = parser_chirho.parse_args()
    plan_value_chirho = plan_module_chirho.freeze_chirho()
    home_chirho = ROOT_CHIRHO / HOME_CHIRHO
    plan_sha_chirho = bytes_sha_chirho((home_chirho / "plan-chirho.json").read_bytes())
    with (home_chirho / "run-chirho.lock").open("a") as lock_chirho:
        fcntl_chirho.flock(lock_chirho, fcntl_chirho.LOCK_EX | fcntl_chirho.LOCK_NB)
        rows_chirho = load_ledger_chirho(home_chirho, plan_sha_chirho)
        if not arguments_chirho.apply_chirho:
            print(
                json_chirho.dumps(
                    {
                        "planned_chirho": len(plan_value_chirho["jobs_chirho"]),
                        "requests_chirho": len(rows_chirho),
                        "accounted_usd_chirho": sum(
                            row_chirho["accounted_usd_chirho"]
                            for row_chirho in rows_chirho
                        ),
                    }
                )
            )
            return
        key_value_chirho = key_chirho(ROOT_CHIRHO)
        with futures_chirho.ThreadPoolExecutor(
            max_workers=min(3, arguments_chirho.limit_chirho)
        ) as pool_chirho:
            tasks_chirho = [
                pool_chirho.submit(
                    generate_chirho,
                    ROOT_CHIRHO,
                    home_chirho,
                    plan_value_chirho,
                    plan_sha_chirho,
                    job_chirho,
                    key_value_chirho,
                )
                for job_chirho in plan_value_chirho["jobs_chirho"][
                    : arguments_chirho.limit_chirho
                ]
            ]
            for task_value_chirho in futures_chirho.as_completed(tasks_chirho):
                result_chirho = task_value_chirho.result()
                print(
                    json_chirho.dumps(
                        {
                            key_chirho: result_chirho.get(key_chirho)
                            for key_chirho in (
                                "id_chirho",
                                "state_chirho",
                                "cost_usd_chirho",
                            )
                        }
                    ),
                    flush=True,
                )


if __name__ == "__main__":
    main_chirho()
