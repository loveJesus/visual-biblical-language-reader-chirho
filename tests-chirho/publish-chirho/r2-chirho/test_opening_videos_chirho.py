# For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life. — John 3:16 (KJV)
"""No paid or network calls: prove HQ, money, and no-resend recovery behavior."""

import concurrent.futures as futures_chirho
import copy as copy_chirho
import json as json_chirho
import subprocess as subprocess_chirho
import sys as sys_chirho
import tempfile as tempfile_chirho
import unittest as unittest_chirho
from pathlib import Path as PathChirho
from types import SimpleNamespace as NamespaceChirho
from unittest.mock import Mock as MockChirho
from unittest.mock import patch as patch_chirho

ROOT_CHIRHO = PathChirho(__file__).resolve().parents[3]
sys_chirho.path.insert(0, str(ROOT_CHIRHO / "scripts-chirho/video-chirho"))
from opening_gate_chirho import (
    bind_inventory_chirho,
    picture_gate_chirho,
    reservation_total_chirho,
    sha_chirho,
    validate_authority_chirho,
    validate_plan_chirho,
)
from opening_runner_chirho import (
    JournalChirho,
    current_recording_chirho,
    run_job_chirho,
)


def fixture_chirho():
    image_chirho = b"an exact source image fixture"
    scene_sha_chirho = sha_chirho(image_chirho)
    scene_chirho = {
        "lesson_id_chirho": "Gen.1.1",
        "sha256_chirho": scene_sha_chirho,
        "asset_path_chirho": "/assets-chirho/scenes-chirho/gen-001-001-chirho.webp",
        "alt_chirho": "Light over water.",
    }
    job_chirho = {
        "lesson_id_chirho": "Gen.1.1",
        "slug_chirho": "genesis-chirho",
        "canonical_sha256_chirho": "a" * 64,
        "seconds_chirho": 2,
        "seed_chirho": 1,
        "holds_chirho": [],
        "scene_chirho": scene_chirho,
        "high_quality_chirho": {
            "ready_chirho": True,
            "delivery_sha256_chirho": scene_sha_chirho,
            "source_sha256_chirho": "b" * 64,
            "kind_chirho": "preserved_chirho",
        },
        "picture_review_chirho": {
            "accepted_chirho": True,
            "scene_sha256_chirho": scene_sha_chirho,
            "reviewer_chirho": "test_reviewer_chirho",
        },
    }
    plan_chirho = {
        "schema_version_chirho": 1,
        "provider_chirho": "runware_chirho",
        "model_chirho": "pixverse:1@8",
        "resolution_chirho": "720p",
        "provider_audio_chirho": False,
        "rate_micro_usd_chirho": 45_000,
        "phase_chirho": "book_openings_chirho",
        "inventory_sha256_chirho": "c" * 64,
        "legacy_tool_sha256_chirho": "d" * 64,
        "jobs_chirho": [job_chirho],
    }
    return image_chirho, job_chirho, plan_chirho


def source_fixture_chirho():
    image_chirho, job_chirho, _ = fixture_chirho()
    lesson_chirho = "Matt.1.1"
    canonical_chirho = "λόγος"
    slug_chirho = "matthew-chirho"
    job_chirho.update(
        lesson_id_chirho=lesson_chirho,
        slug_chirho=slug_chirho,
        canonical_sha256_chirho=sha_chirho(canonical_chirho.encode()),
    )
    job_chirho["scene_chirho"]["lesson_id_chirho"] = lesson_chirho
    clip_chirho = {
        "id_chirho": "fixture-audio-chirho",
        "lesson_id_chirho": lesson_chirho,
        "token_id_chirho": None,
        "text_chirho": canonical_chirho,
        "canonical_sha256_chirho": job_chirho["canonical_sha256_chirho"],
        "language_chirho": "el",
        "pronunciation_chirho": "modern_greek",
        "voice_name_chirho": "Fixture voice",
        "sha256_chirho": sha_chirho(b"fixture delivery bytes"),
        "bytes_chirho": len(b"fixture delivery bytes"),
        "duration_chirho": 2,
        "recipe_id_chirho": "chatterbox-v3-modern-greek-verse-v1-chirho",
        "synthesis_text_chirho": canonical_chirho,
        "review_chirho": "audition",
    }
    clip_chirho["asset_path_chirho"] = (
        "/audio-chirho/sha256-chirho/" + clip_chirho["sha256_chirho"] + "-chirho.mp3"
    )
    job_chirho["audio_chirho"] = clip_chirho

    def encoded_chirho(value_chirho):
        return json_chirho.dumps(value_chirho, ensure_ascii=False).encode()

    content_path_chirho = f"/content-chirho/{slug_chirho}/chapter-01-chirho.json"
    content_bytes_chirho = encoded_chirho(
        {
            "book_id_chirho": "Matt",
            "chapter_chirho": 1,
            "verses_chirho": [
                {
                    "id_chirho": lesson_chirho,
                    "canonical_text_chirho": canonical_chirho,
                    "tokens_chirho": [
                        {
                            "id_chirho": "fixture-word-chirho",
                            "text_chirho": canonical_chirho,
                            "start_chirho": 0,
                            "end_chirho": len(canonical_chirho),
                        }
                    ],
                }
            ],
        }
    )
    audio_path_chirho = f"/audio-chirho/{slug_chirho}/chapter-01-chirho.json"
    audio_bytes_chirho = encoded_chirho(
        {
            "schema_version_chirho": 1,
            "book_id_chirho": "Matt",
            "chapter_chirho": 1,
            "content_path_chirho": content_path_chirho,
            "content_sha256_chirho": sha_chirho(content_bytes_chirho),
            "clips_chirho": [clip_chirho],
            "readings_chirho": [],
        }
    )
    media_path_chirho = f"/media-chirho/{slug_chirho}/chapter-01-chirho.json"
    media_bytes_chirho = encoded_chirho(
        {"scenes_chirho": [job_chirho["scene_chirho"]], "videos_chirho": []}
    )
    endpoints_chirho = {
        "/_app/version.json": encoded_chirho({"version": "fixture-chirho"}),
        f"/content-chirho/{slug_chirho}/manifest-chirho.json": encoded_chirho(
            {
                "chapters_chirho": [
                    {
                        "path_chirho": content_path_chirho,
                        "sha256_chirho": sha_chirho(content_bytes_chirho),
                    }
                ]
            }
        ),
        content_path_chirho: content_bytes_chirho,
        "/audio-chirho/manifest-chirho.json": encoded_chirho(
            {
                "schema_version_chirho": 1,
                "books_chirho": {
                    "Matt": {
                        "chapters_chirho": [
                            {
                                "path_chirho": audio_path_chirho,
                                "sha256_chirho": sha_chirho(audio_bytes_chirho),
                            }
                        ]
                    }
                },
            }
        ),
        audio_path_chirho: audio_bytes_chirho,
        f"/media-chirho/{slug_chirho}/summary-chirho.json": encoded_chirho(
            {
                "chapters_chirho": [
                    {
                        "path_chirho": media_path_chirho,
                        "sha256_chirho": sha_chirho(media_bytes_chirho),
                    }
                ]
            }
        ),
        media_path_chirho: media_bytes_chirho,
        job_chirho["scene_chirho"]["asset_path_chirho"]: image_chirho,
    }
    return job_chirho, endpoints_chirho, content_bytes_chirho, audio_bytes_chirho


def selected_descriptor_chirho(job_chirho):
    return {
        "lesson_id_chirho": job_chirho["lesson_id_chirho"],
        "selected_chirho": {
            "raw_whole_verse_shape_chirho": True,
            **{
                key_chirho: job_chirho["audio_chirho"].get(key_chirho)
                for key_chirho in (
                    "sha256_chirho",
                    "bytes_chirho",
                    "duration_chirho",
                    "recipe_id_chirho",
                    "pronunciation_chirho",
                    "start_offset_chirho",
                    "end_offset_chirho",
                    "reading_source_chirho",
                )
            },
        },
    }


def task_chirho():
    return {
        "taskUUID": "07bb5916-df87-44ce-a0a8-a60f86c1027a",
        "model": "pixverse:1@8",
        "resolution": "720p",
        "duration": 2,
        "seed": 1,
        "positivePrompt": "Camera motion.",
    }


class OpeningVideosTestChirho(unittest_chirho.TestCase):
    def test_current_hq_picture_and_review_are_both_required_chirho(self):
        image_chirho, job_chirho, _ = fixture_chirho()
        picture_gate_chirho(job_chirho, job_chirho["scene_chirho"], image_chirho)
        mutations_chirho = [
            ("high_quality_chirho", "ready_chirho", False),
            ("high_quality_chirho", "delivery_sha256_chirho", "e" * 64),
            ("high_quality_chirho", "source_sha256_chirho", None),
            ("picture_review_chirho", "accepted_chirho", False),
            ("picture_review_chirho", "scene_sha256_chirho", "e" * 64),
        ]
        for parent_chirho, key_chirho, value_chirho in mutations_chirho:
            changed_chirho = copy_chirho.deepcopy(job_chirho)
            changed_chirho[parent_chirho][key_chirho] = value_chirho
            with self.subTest(key_chirho=key_chirho), self.assertRaises(ValueError):
                picture_gate_chirho(
                    changed_chirho, job_chirho["scene_chirho"], image_chirho
                )
        for key_chirho in ("sha256_chirho", "asset_path_chirho", "alt_chirho"):
            live_chirho = {**job_chirho["scene_chirho"], key_chirho: "changed"}
            with self.subTest(key_chirho=key_chirho), self.assertRaises(ValueError):
                picture_gate_chirho(job_chirho, live_chirho, image_chirho)
        with self.assertRaises(ValueError):
            picture_gate_chirho(
                job_chirho, job_chirho["scene_chirho"], image_chirho + b"changed"
            )
        job_chirho["holds_chirho"] = ["known image hold"]
        with self.assertRaises(ValueError):
            picture_gate_chirho(job_chirho, job_chirho["scene_chirho"], image_chirho)

    def test_finite_plan_refuses_duplicate_or_off_target_jobs_chirho(self):
        _, job_chirho, plan_chirho = fixture_chirho()
        validate_plan_chirho(plan_chirho)
        plan_chirho["jobs_chirho"].append(copy_chirho.deepcopy(job_chirho))
        with self.assertRaises(ValueError):
            validate_plan_chirho(plan_chirho)
        plan_chirho["jobs_chirho"] = [job_chirho]
        job_chirho["lesson_id_chirho"] = "Gen.2.1"
        job_chirho["scene_chirho"]["lesson_id_chirho"] = "Gen.2.1"
        with self.assertRaises(ValueError):
            validate_plan_chirho(plan_chirho)

    def test_exact_plan_and_direct_spending_authority_required_chirho(self):
        authority_chirho = {
            "schema_version_chirho": 1,
            "plan_sha256_chirho": "a" * 64,
            "authority_chirho": "direct_user_chirho",
            "approval_text_chirho": "Approve this finite batch, cap $5.",
            "cap_micro_usd_chirho": 5_000_000,
        }
        self.assertEqual(
            validate_authority_chirho(authority_chirho, "a" * 64), 5_000_000
        )
        for key_chirho, value_chirho in (
            ("authority_chirho", "agent_receipt_chirho"),
            ("approval_text_chirho", ""),
            ("cap_micro_usd_chirho", True),
            ("cap_micro_usd_chirho", 0),
            ("plan_sha256_chirho", "b" * 64),
        ):
            with self.subTest(key_chirho=key_chirho), self.assertRaises(ValueError):
                validate_authority_chirho(
                    {**authority_chirho, key_chirho: value_chirho}, "a" * 64
                )

    def test_plan_cannot_relabel_inventory_quality_or_invent_audio_chirho(self):
        _, job_chirho, plan_chirho = fixture_chirho()
        clip_chirho = {
            "lesson_id_chirho": "Gen.1.1",
            "token_id_chirho": None,
            "canonical_sha256_chirho": "a" * 64,
            "sha256_chirho": "e" * 64,
            "bytes_chirho": 123,
            "duration_chirho": 3.5,
        }
        job_chirho["audio_chirho"] = clip_chirho
        scene_chirho = {
            **job_chirho["scene_chirho"],
            "source_sha256_chirho": "b" * 64,
            "high_quality_chirho": True,
            "quality_class_chirho": "preserved_high_quality_chirho",
            "delivery_lineage_chirho": {
                "delivery_sha256_chirho": job_chirho["scene_chirho"]["sha256_chirho"],
                "source_sha256_chirho": "b" * 64,
            },
        }
        row_chirho = {
            "lesson_id_chirho": "Gen.1.1",
            "tier_chirho": 1,
            "book_slug_chirho": "genesis-chirho",
            "canonical_sha256_chirho": "a" * 64,
            "existing_video_count_chirho": 0,
            "missing_video_chirho": True,
            "scene_chirho": scene_chirho,
            "picture_prerequisite_met_chirho": True,
            "whole_verse_audio_chirho": {
                "ready_chirho": True,
                "selected_chirho": clip_chirho,
            },
            "known_holds_chirho": {},
        }
        bind_inventory_chirho(plan_chirho, [row_chirho])
        changed_chirho = copy_chirho.deepcopy(row_chirho)
        changed_chirho["scene_chirho"]["quality_class_chirho"] = "fallback_chirho"
        with self.assertRaises(ValueError):
            bind_inventory_chirho(plan_chirho, [changed_chirho])
        changed_chirho = copy_chirho.deepcopy(row_chirho)
        changed_chirho["whole_verse_audio_chirho"]["ready_chirho"] = False
        with self.assertRaises(ValueError):
            bind_inventory_chirho(plan_chirho, [changed_chirho])
        changed_chirho = copy_chirho.deepcopy(row_chirho)
        changed_chirho["known_holds_chirho"]["clarity_chirho"] = (
            "listener report unresolved"
        )
        with self.assertRaises(ValueError):
            bind_inventory_chirho(plan_chirho, [changed_chirho])

    def test_another_plan_cannot_purchase_a_previously_requested_scene_chirho(self):
        _, job_chirho, _ = fixture_chirho()
        prior_chirho = {
            (
                job_chirho["lesson_id_chirho"],
                job_chirho["scene_chirho"]["sha256_chirho"],
            )
        }
        with tempfile_chirho.TemporaryDirectory() as directory_chirho:
            journal_chirho = JournalChirho(
                PathChirho(directory_chirho), "e" * 64, 1_000_000, prior_chirho
            )
            with self.assertRaises(ValueError):
                journal_chirho.reserve_chirho(job_chirho, task_chirho())
            self.assertEqual(journal_chirho.events_chirho, [])

    def test_budget_is_reserved_before_a_second_request_and_survives_restart_chirho(
        self,
    ):
        _, job_chirho, _ = fixture_chirho()
        with tempfile_chirho.TemporaryDirectory() as directory_chirho:
            home_chirho = PathChirho(directory_chirho)
            journal_chirho = JournalChirho(home_chirho, "a" * 64, 100_000)
            journal_chirho.reserve_chirho(job_chirho, task_chirho())
            restarted_chirho = JournalChirho(home_chirho, "a" * 64, 100_000)
            next_chirho = {**job_chirho, "lesson_id_chirho": "Exod.1.1"}
            with self.assertRaises(ValueError):
                restarted_chirho.reserve_chirho(next_chirho, task_chirho())
            self.assertEqual(len(restarted_chirho.events_chirho), 1)
            self.assertEqual(
                reservation_total_chirho(restarted_chirho.events_chirho, "a" * 64),
                90_000,
            )

    def test_parallel_reservations_cannot_cross_the_cap_chirho(self):
        _, job_chirho, _ = fixture_chirho()
        with tempfile_chirho.TemporaryDirectory() as directory_chirho:
            journal_chirho = JournalChirho(
                PathChirho(directory_chirho), "a" * 64, 100_000
            )
            jobs_chirho = [job_chirho, {**job_chirho, "lesson_id_chirho": "Exod.1.1"}]
            with futures_chirho.ThreadPoolExecutor(max_workers=2) as pool_chirho:
                requests_chirho = [
                    pool_chirho.submit(
                        journal_chirho.reserve_chirho, row_chirho, task_chirho()
                    )
                    for row_chirho in jobs_chirho
                ]
                outcomes_chirho = [
                    future_chirho.exception() for future_chirho in requests_chirho
                ]
            self.assertEqual(
                sum(value_chirho is None for value_chirho in outcomes_chirho), 1
            )
            self.assertEqual(
                reservation_total_chirho(journal_chirho.events_chirho, "a" * 64), 90_000
            )

    def test_unknown_request_is_only_polled_and_refusal_is_not_resent_chirho(self):
        _, job_chirho, _ = fixture_chirho()
        calls_chirho = []

        def post_chirho(_key_chirho, tasks_chirho, _timeout_chirho):
            calls_chirho.extend(tasks_chirho)
            return 400, {"errors": [{"code": "originalTaskFailed"}]}

        tools_chirho = NamespaceChirho(post_chirho=post_chirho)
        with tempfile_chirho.TemporaryDirectory() as directory_chirho:
            home_chirho = PathChirho(directory_chirho)
            journal_chirho = JournalChirho(home_chirho, "a" * 64, 100_000)
            journal_chirho.reserve_chirho(job_chirho, task_chirho())
            with patch_chirho("opening_runner_chirho.time_chirho.sleep"):
                self.assertEqual(
                    run_job_chirho(
                        tools_chirho, "unused", home_chirho, journal_chirho, job_chirho
                    ),
                    "held_chirho",
                )
            self.assertEqual(
                [row_chirho["taskType"] for row_chirho in calls_chirho], ["getResponse"]
            )
            self.assertEqual(calls_chirho[0]["taskUUID"], task_chirho()["taskUUID"])
            self.assertEqual(
                run_job_chirho(
                    tools_chirho, "unused", home_chirho, journal_chirho, job_chirho
                ),
                "held_chirho",
            )
            self.assertEqual(len(calls_chirho), 1)

    def test_actual_price_increase_and_missing_cost_stop_later_requests_chirho(self):
        _, job_chirho, _ = fixture_chirho()
        with tempfile_chirho.TemporaryDirectory() as directory_chirho:
            journal_chirho = JournalChirho(
                PathChirho(directory_chirho), "a" * 64, 100_000
            )
            journal_chirho.reserve_chirho(job_chirho, task_chirho())
            journal_chirho.append_chirho(
                {
                    "lesson_id_chirho": "Gen.1.1",
                    "state_chirho": "received_chirho",
                    "cost_usd_chirho": 0.2,
                }
            )
            with self.assertRaises(ValueError):
                journal_chirho.reserve_chirho(
                    {**job_chirho, "lesson_id_chirho": "Exod.1.1"}, task_chirho()
                )
            journal_chirho.events_chirho[-1]["cost_usd_chirho"] = None
            with self.assertRaises(ValueError):
                reservation_total_chirho(journal_chirho.events_chirho, "a" * 64)

    def test_current_selection_mismatch_stops_job_before_reservation_or_post_chirho(
        self,
    ):
        job_chirho, endpoints_chirho, content_chirho, audio_chirho = (
            source_fixture_chirho()
        )
        tools_chirho = NamespaceChirho(
            fetch_chirho=MockChirho(
                side_effect=lambda url_chirho: endpoints_chirho[
                    url_chirho.removeprefix("https://hinneh.us")
                ]
            ),
            camera_prompt_chirho=MockChirho(return_value="Camera motion."),
            post_chirho=MockChirho(return_value=(400, {"errors": []})),
        )
        with tempfile_chirho.TemporaryDirectory() as directory_chirho:
            journal_chirho = JournalChirho(
                PathChirho(directory_chirho), "a" * 64, 100_000
            )
            with (
                patch_chirho(
                    "opening_runner_chirho.current_recording_chirho",
                    side_effect=ValueError("selection mismatch"),
                ) as selected_chirho,
                patch_chirho.object(
                    journal_chirho,
                    "reserve_chirho",
                    wraps=journal_chirho.reserve_chirho,
                ) as reserve_chirho,
                self.assertRaisesRegex(ValueError, "selection mismatch"),
            ):
                run_job_chirho(
                    tools_chirho,
                    "",
                    PathChirho(directory_chirho),
                    journal_chirho,
                    job_chirho,
                )
            selected_chirho.assert_called_once_with(
                job_chirho, content_chirho, audio_chirho
            )
            reserve_chirho.assert_not_called()
            tools_chirho.post_chirho.assert_not_called()
            self.assertEqual(journal_chirho.events_chirho, [])
            self.assertFalse(journal_chirho.path_chirho.exists())

    def test_current_recording_requires_exact_identity_and_raw_synthetic_shape_chirho(
        self,
    ):
        job_chirho, _, content_chirho, audio_chirho = source_fixture_chirho()
        value_chirho = selected_descriptor_chirho(job_chirho)

        def result_chirho(value_chirho):
            return NamespaceChirho(
                returncode=0, stdout=json_chirho.dumps(value_chirho).encode()
            )

        with patch_chirho(
            "opening_runner_chirho.subprocess_chirho.run",
            return_value=result_chirho(value_chirho),
        ) as bridge_chirho:
            self.assertEqual(
                current_recording_chirho(job_chirho, content_chirho, audio_chirho),
                value_chirho["selected_chirho"],
            )
            packet_chirho = json_chirho.loads(bridge_chirho.call_args.kwargs["input"])
            self.assertEqual(
                packet_chirho["content_chapter_json_chirho"].encode(), content_chirho
            )
            self.assertEqual(
                packet_chirho["audio_chapter_json_chirho"].encode(), audio_chirho
            )
            self.assertEqual(
                packet_chirho["content_sha256_chirho"], sha_chirho(content_chirho)
            )
            self.assertEqual(
                packet_chirho["audio_sha256_chirho"], sha_chirho(audio_chirho)
            )
        for key_chirho, changed_chirho in (
            ("sha256_chirho", sha_chirho(b"different current recording")),
            ("raw_whole_verse_shape_chirho", None),
        ):
            invalid_chirho = copy_chirho.deepcopy(value_chirho)
            invalid_chirho["selected_chirho"][key_chirho] = changed_chirho
            with (
                self.subTest(key_chirho=key_chirho),
                patch_chirho(
                    "opening_runner_chirho.subprocess_chirho.run",
                    return_value=result_chirho(invalid_chirho),
                ),
                self.assertRaises(ValueError),
            ):
                current_recording_chirho(job_chirho, content_chirho, audio_chirho)
        legacy_chirho = copy_chirho.deepcopy(job_chirho)
        legacy_chirho["audio_chirho"].pop("recipe_id_chirho")
        with (
            patch_chirho(
                "opening_runner_chirho.subprocess_chirho.run",
                return_value=result_chirho(selected_descriptor_chirho(legacy_chirho)),
            ),
            self.assertRaisesRegex(ValueError, "whole-file identity"),
        ):
            current_recording_chirho(legacy_chirho, content_chirho, audio_chirho)

    def test_current_recording_bridge_errors_fail_closed_without_real_process_chirho(
        self,
    ):
        job_chirho, _, content_chirho, audio_chirho = source_fixture_chirho()
        for result_chirho in (
            NamespaceChirho(returncode=1, stdout=b""),
            NamespaceChirho(returncode=0, stdout=b"not JSON"),
            NamespaceChirho(
                returncode=0,
                stdout=json_chirho.dumps(
                    {
                        "lesson_id_chirho": job_chirho["lesson_id_chirho"],
                        "selected_chirho": None,
                    }
                ).encode(),
            ),
        ):
            with (
                self.subTest(result_chirho=result_chirho),
                patch_chirho(
                    "opening_runner_chirho.subprocess_chirho.run",
                    return_value=result_chirho,
                ),
                self.assertRaises(ValueError),
            ):
                current_recording_chirho(job_chirho, content_chirho, audio_chirho)
        with (
            patch_chirho(
                "opening_runner_chirho.subprocess_chirho.run",
                side_effect=subprocess_chirho.TimeoutExpired("mock selector", 30),
            ),
            self.assertRaisesRegex(ValueError, "unavailable"),
        ):
            current_recording_chirho(job_chirho, content_chirho, audio_chirho)


if __name__ == "__main__":
    unittest_chirho.main()
