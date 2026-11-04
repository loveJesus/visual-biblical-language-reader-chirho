#!/usr/bin/env python3
# For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life. — John 3:16 (KJV)
"""New restrained Genesis compositions, staged separately from the sole media installer.

Workflow: selective-scene-variants-chirho.md. Original failed requests remain immutable.
"""

import argparse
import fcntl
import json
import signal
import subprocess
import sys
import time
import uuid
from datetime import UTC, datetime
from pathlib import Path

ROOT_CHIRHO = Path(__file__).resolve().parents[3]
sys.path[:0] = [
    str(ROOT_CHIRHO / "scripts-chirho/bible-chirho"),
    str(ROOT_CHIRHO / "scripts-chirho/art-chirho"),
]
import ordered_scenes_chirho as scenes_chirho
from icon_generation_chirho import GeneratorJobChirho, validate_generation_chirho

HOME_CHIRHO = (
    ROOT_CHIRHO / scenes_chirho.HOME_CHIRHO / "genesis-repair-2026-11-04-chirho"
)
COMPOSITIONS_CHIRHO = {
    "Gen.1.27": "Two adult people, a man and a woman in simple modest full-length robes, standing together in a beautiful dawn garden. Ordinary human figures, no visible divine figure. Clothing is an imaginative modest illustration convention, not a historical claim about that moment.",
    "Gen.2.25": "A peaceful Eden garden with a stream and dense flowering foliage. Two adult faces, a man and a woman, visible among the greenery in the middle distance, looking at each other without fear or shame. Only their faces are in view; every other part of both figures is entirely obscured by dense foliage. The garden and peaceful relationship carry the scene.",
    "Gen.3.6": "A woman and a man, both adults wearing simple modest full-length robes, standing by a fruit tree. The woman holds a single piece of fruit toward the man, who is receiving it. Faces convey a serious choice. Clothing is a modest illustrative convention. No snake or extra event is required.",
    "Gen.9.22": "Outside an ancient tent: fully clothed adult Ham speaking to his two fully clothed adult brothers. The tent entrance is closed and Noah is not visible. Illustrate the telling to the brothers, not the private incident inside.",
    "Gen.19.32": "Two fully clothed adult women speaking gravely at a rocky cave entrance, with an earthenware wine jar between them. Their elderly father is not visible. Show only the conversation and setting, with no intimate act or suggestive pose.",
    "Gen.19.34": "At a rocky cave entrance on the next day, two fully clothed adult women converse beside an earthenware wine jar. Serious restrained mood. Their father is not visible. Illustrate only the conversation and setting, not any intimate event.",
    "Gen.19.36": "Two fully clothed adult pregnant women standing at a quiet cave entrance in daylight, shown respectfully and without intimacy. Their father is not visible. This is an indirect aftermath scene showing the stated pregnancies, not the act that preceded them.",
    "Gen.21.7": "Elderly Sarah wearing a modest full-length robe, joyfully cradling her fully swaddled infant son. Elderly Abraham listens nearby in their tent doorway. The infant is held high against Sarah's shoulder; this image shows maternal joy and the promised child, with no feeding action or exposed chest.",
    "Gen.22.9": "Abraham arranging pieces of wood on a low stone altar in a rocky landscape. Isaac stands safely beside him, fully clothed and unharmed. No weapon, restraint, threat or injury. Show the arrival and altar preparation portion of this verse; the note must explain that the binding is not depicted.",
    "Gen.25.25": "A fully swaddled newborn boy with a rosy face, held gently by an adult caregiver's hands. Rebekah is visible resting in the background beneath blankets and wearing a modest robe. Warm intimate family watercolor, no delivery procedure or exposed infant body. The rosy child represents Esau.",
    "Gen.25.26": "Two newborn boys fully swaddled in soft cloth, supported safely by an adult caregiver. The younger baby's one small hand gently rests on the covered heel of the older baby's wrapped foot. Clearly distinguish the tiny hand from a foot. All infant bodies remain covered; no childbirth procedure. Show the hand-to-heel detail as a gentle family illustration.",
    "Gen.29.23": "At dusk, Laban leads his adult daughter Leah, fully clothed in a long robe and veil, toward the entrance of Jacob's lamplit tent. Jacob stands fully clothed outside the doorway. Portray only the arrival and introduction; no intimate act or bed scene.",
    "Gen.34.2": "A sober exterior view of ancient Shechem: a quiet stone city gate and street beyond it under an overcast sky. No people are shown. This indirect location scene acknowledges a grave event without attempting to depict the assault. Do not invent an event or imply the verse describes a peaceful encounter.",
    "Gen.38.9": "A fully clothed adult man standing alone beside a closed tent at night, turning his face away with a troubled expression. No other person, intimate act, bed or bodily detail. This is an indirect representation of Onan's refusal of family responsibility, not a literal depiction of his act.",
    "Gen.38.16": "A fully clothed adult Judah speaking to a fully clothed, veiled adult Tamar at the roadside near a tree. They stand apart with restrained ordinary gestures. Portray only the roadside conversation, with no intimate act, touching or erotic presentation.",
    "Gen.38.28": "Close-up of a tiny newborn HAND emerging from soft swaddling cloth while an adult midwife's hands gently tie a scarlet thread around its wrist. The small palm, thumb and fingers must be unmistakably a hand, never a foot. The infant's body and the birth setting are entirely outside the frame. No medical procedure or exposed body is shown; just the wrist and thread detail.",
    "Gen.40.19": "A solemn empty Egyptian courtyard outside a high palace gate. A discarded woven bread basket lies on a stone ledge and a few birds fly high above the wall. No human body, execution, injury or violence is shown. This is a symbolic setting for the baker's foretold judgment, not a literal depiction of the punishment.",
}
STOP_CHIRHO = False


def write_chirho(path_chirho, value_chirho):
    scenes_chirho.BASE_CHIRHO.atomic_json_chirho(path_chirho, value_chirho)


def prepare_chirho():
    index_chirho = HOME_CHIRHO / "index-chirho.json"
    if index_chirho.exists():
        return json.loads(index_chirho.read_text())
    jobs_chirho = {
        row_chirho["id_chirho"]: row_chirho
        for row_chirho in scenes_chirho.load_jobs_chirho(ROOT_CHIRHO, "Gen")
    }
    holds_chirho = scenes_chirho.RECOVERY_CHIRHO.read_chirho(
        ROOT_CHIRHO / scenes_chirho.HOME_CHIRHO
    )["holds_chirho"]
    rows_chirho = []
    for number_chirho, (verse_chirho, composition_chirho) in enumerate(
        COMPOSITIONS_CHIRHO.items()
    ):
        original_chirho = [
            row_chirho["attempt_chirho"]
            for row_chirho in holds_chirho
            if row_chirho["scope_chirho"] == "verse"
            and verse_chirho in row_chirho["items_chirho"]
        ]
        if len(original_chirho) != 1:
            raise ValueError("Expected one preserved original scene hold")
        name_chirho = (
            f"{number_chirho // 10 * 10:04d}-chirho/attempt-gen-{uuid.uuid4().hex}"
        )
        attempt_chirho = HOME_CHIRHO / name_chirho
        attempt_chirho.mkdir(parents=True)
        job_chirho = jobs_chirho[verse_chirho]
        chapter_chirho = json.loads(
            (
                ROOT_CHIRHO / "static" / job_chirho["content_path_chirho"].lstrip("/")
            ).read_text()
        )
        source_chirho = next(
            row_chirho
            for row_chirho in chapter_chirho["verses_chirho"]
            if row_chirho["id_chirho"] == verse_chirho
        )
        brief_chirho = scenes_chirho.BASE_CHIRHO.BRIEFS_CHIRHO.read_chirho(
            ROOT_CHIRHO, job_chirho
        )
        write_chirho(
            attempt_chirho / "source-input-chirho.json",
            {
                "job_chirho": job_chirho,
                "verse_chirho": source_chirho,
                "reusable_brief_chirho": brief_chirho,
                "composition_chirho": composition_chirho,
            },
        )
        rows_chirho.append(
            {
                "lesson_id_chirho": verse_chirho,
                "attempt_chirho": name_chirho,
                "original_attempt_chirho": original_chirho[0],
                "composition_chirho": composition_chirho,
            }
        )
    value_chirho = {
        "schema_version_chirho": 1,
        "authority_chirho": "L.J., 2026-11-04: finish the missing Genesis scenes; new restrained compositions, preserving the earlier failed attempts.",
        "rows_chirho": rows_chirho,
    }
    write_chirho(index_chirho, value_chirho)
    return value_chirho


def prompt_chirho(attempt_chirho):
    source_chirho = attempt_chirho / "source-input-chirho.json"
    return f"""You are a bounded GPT Genesis scene artist. Work ONLY inside {attempt_chirho}. Read {source_chirho}; it contains the exact source verse, glosses, job identity and a new, expressly authorized composition_chirho. Previous failed requests are preserved elsewhere; do not read or retry them. Implement the supplied restrained composition faithfully. This is one new illustration, not an edit of or attempt to recover a rejected output. Use the imagegen skill and exactly ONE built-in image_gen call, no paid API, alternate provider or automatic replacement after an unknown result.

First inspect {attempt_chirho}/style-reference-chirho.webp with view_image. Match its warm, detailed hand-painted watercolor storybook style, landscape 4:3, no text, border, collage, watermark or depiction of God. The safe composition is intentionally selective or indirect: the reading note must state what part of the verse is depicted and what is not depicted, without pretending the illustration covers every act in the text. Do not add graphic violence, explicit nudity, sexual acts, suggestive posing or childbirth procedures. All visible people are modestly presented as specified. For hands and scarlet thread, visually verify the actual anatomy and exact identifying detail.

Save the actual complete image prompt as prompt-chirho.txt before the call. After generation, inspect the actual saved original with view_image. Save a centered 4:3 WebP as scene-chirho.webp using ImageMagick, then inspect that file. Write record-chirho.json with four nonempty strings: verse_explanation_chirho, alt_chirho, reading_note_chirho, prompt_chirho. If reusable_brief_chirho is non-null, copy its explanation_chirho verbatim; otherwise explain the verified verse concisely and independently of the illustration. prompt_chirho is the COMPLETE actual tool prompt, never a summary. The alt and reading note must match the inspected image. Also write provenance-chirho.json with original_generator_path_chirho and original_generator_sha256_chirho, retaining the original for the parent's verified R2 archive. Read both JSON files back and verify all required fields before finishing. Artwork remains pending human review. If the tool refuses or the image is inaccurate, write failure-chirho.json explaining the observed result and stop; do not create an inaccurate ready record or make another image call. Prefix every shell command with rtk proxy, use Chirho identifiers, and do not write project source/catalogues, Git, cloud, DB, other queues or messages."""


def validate_chirho(attempt_chirho):
    validate_generation_chirho(attempt_chirho, lambda path_chirho: False)
    failure_path_chirho = attempt_chirho / "failure-chirho.json"
    if failure_path_chirho.exists():
        review_path_chirho = attempt_chirho / "owner-review-chirho.json"
        review_chirho = (
            json.loads(review_path_chirho.read_text())
            if review_path_chirho.exists()
            else {}
        )
        if (
            review_chirho.get("disposition_chirho") != "accepted_composition_refinement"
            or review_chirho.get("failure_sha256_chirho")
            != scenes_chirho.BASE_CHIRHO.digest_chirho(failure_path_chirho)
            or review_chirho.get("scene_sha256_chirho")
            != scenes_chirho.BASE_CHIRHO.digest_chirho(
                attempt_chirho / "scene-chirho.webp"
            )
        ):
            raise ValueError("Artist retained a failed or inaccurate result")
    record_chirho = json.loads((attempt_chirho / "record-chirho.json").read_text())
    for name_chirho in (
        "verse_explanation_chirho",
        "alt_chirho",
        "reading_note_chirho",
        "prompt_chirho",
    ):
        if (
            not isinstance(record_chirho.get(name_chirho), str)
            or not record_chirho[name_chirho].strip()
        ):
            raise ValueError("Incomplete inspected scene record")
    width_chirho, height_chirho = scenes_chirho.BASE_CHIRHO.image_info_chirho(
        attempt_chirho / "scene-chirho.webp"
    )
    if width_chirho * 3 != height_chirho * 4 or max(width_chirho, height_chirho) > 4096:
        raise ValueError("Scene must be bounded 4:3 artwork")
    provenance_chirho = json.loads(
        (attempt_chirho / "provenance-chirho.json").read_text()
    )
    original_chirho = Path(provenance_chirho["original_generator_path_chirho"])
    if (
        scenes_chirho.BASE_CHIRHO.digest_chirho(original_chirho)
        != provenance_chirho["original_generator_sha256_chirho"]
    ):
        raise ValueError("Original generator bytes differ")


def generate_chirho(index_chirho):
    active_chirho = {}
    previous_progress_chirho = None
    pending_chirho = iter(index_chirho["rows_chirho"])
    exhausted_chirho = False
    try:
        while active_chirho or not exhausted_chirho:
            while len(active_chirho) < 2 and not exhausted_chirho and not STOP_CHIRHO:
                row_chirho = next(pending_chirho, None)
                if row_chirho is None:
                    exhausted_chirho = True
                    break
                attempt_chirho = HOME_CHIRHO / row_chirho["attempt_chirho"]
                if (attempt_chirho / "ready-chirho.json").exists() or (
                    attempt_chirho / "generator-request-chirho.json"
                ).exists():
                    continue  # Existing/unknown calls are never automatically repeated.
                style_chirho = "static" + scenes_chirho.BASE_CHIRHO.STYLE_CHIRHO
                with (attempt_chirho / "style-log-chirho.txt").open(
                    "wb"
                ) as output_chirho:
                    subprocess.run(
                        [
                            "bun",
                            "scripts-chirho/publish-chirho/r2-chirho/with-artwork-chirho.ts",
                            style_chirho,
                            "--",
                            "magick",
                            style_chirho,
                            str(attempt_chirho / "style-reference-chirho.webp"),
                        ],
                        cwd=ROOT_CHIRHO,
                        stdout=output_chirho,
                        stderr=subprocess.STDOUT,
                        check=True,
                    )
                active_chirho[row_chirho["lesson_id_chirho"]] = GeneratorJobChirho(
                    ROOT_CHIRHO,
                    attempt_chirho,
                    prompt_chirho(attempt_chirho),
                    scenes_chirho.RECOVERY_CHIRHO,
                )
            if STOP_CHIRHO:
                exhausted_chirho = True
            for verse_chirho, job_chirho in list(active_chirho.items()):
                if not job_chirho.poll_chirho():
                    continue
                try:
                    if job_chirho.error_chirho:
                        raise job_chirho.error_chirho
                    validate_chirho(job_chirho.attempt_chirho)
                    write_chirho(
                        job_chirho.attempt_chirho / "ready-chirho.json",
                        {
                            "lesson_id_chirho": verse_chirho,
                            "at_chirho": datetime.now(UTC).isoformat(),
                            "scene_sha256_chirho": scenes_chirho.BASE_CHIRHO.digest_chirho(
                                job_chirho.attempt_chirho / "scene-chirho.webp"
                            ),
                        },
                    )
                    print(f"ready {verse_chirho}", flush=True)
                except (OSError, ValueError, RuntimeError, KeyError) as error_chirho:
                    write_chirho(
                        job_chirho.attempt_chirho / "owner-hold-chirho.json",
                        {
                            "lesson_id_chirho": verse_chirho,
                            "reason_chirho": str(error_chirho),
                            "at_chirho": datetime.now(UTC).isoformat(),
                        },
                    )
                    print(f"held {verse_chirho}: {error_chirho}", flush=True)
                del active_chirho[verse_chirho]
            progress_chirho = {
                "state_chirho": "generating" if active_chirho else "settled",
                "active_verses_chirho": list(active_chirho),
                "ready_chirho": sum(
                    (
                        HOME_CHIRHO / row_chirho["attempt_chirho"] / "ready-chirho.json"
                    ).exists()
                    for row_chirho in index_chirho["rows_chirho"]
                ),
                "total_chirho": len(index_chirho["rows_chirho"]),
            }
            if progress_chirho != previous_progress_chirho:
                write_chirho(
                    HOME_CHIRHO / "progress-chirho.json",
                    {**progress_chirho, "at_chirho": datetime.now(UTC).isoformat()},
                )
                previous_progress_chirho = progress_chirho
            if active_chirho:
                time.sleep(0.5)
    finally:
        for job_chirho in active_chirho.values():
            job_chirho.wait_chirho()


def stop_chirho(signal_chirho, frame_chirho):
    global STOP_CHIRHO
    STOP_CHIRHO = True


if __name__ == "__main__":
    parser_chirho = argparse.ArgumentParser(description=__doc__)
    parser_chirho.add_argument("--generate-chirho", action="store_true")
    args_chirho = parser_chirho.parse_args()
    if not args_chirho.generate_chirho:
        print(
            json.dumps(
                {
                    "scene_ids_chirho": list(COMPOSITIONS_CHIRHO),
                    "image_requests_chirho": 0,
                }
            )
        )
    else:
        HOME_CHIRHO.mkdir(parents=True, exist_ok=True)
        signal.signal(signal.SIGINT, stop_chirho)
        signal.signal(signal.SIGTERM, stop_chirho)
        with (HOME_CHIRHO / "generation-chirho.lock").open("a") as lock_chirho:
            fcntl.flock(lock_chirho, fcntl.LOCK_EX | fcntl.LOCK_NB)
            generate_chirho(prepare_chirho())
