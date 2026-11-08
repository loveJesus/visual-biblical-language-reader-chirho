# For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life. — John 3:16 (KJV)
"""Stage local verse videos on a development device (workflow: spec-chirho/workflows-chirho/native-chirho/verse-video-chirho.md) for a debug build of the Android reader.

Reads a video folder's per-verse records (claude2's video lane writes <name>-chirho.json beside each
<name>-chirho.mp4), converts them to GPT's verse-video record (verse-video-chirho.ts, DM #3399), checks every
file's length and SHA-256, and pushes index-chirho.json plus <sha>-chirho.mp4 files to the debug app's own
external files folder. Release builds never read this folder; only published videos play there.

The embedded reading is the verse's verified Be'eri cut from this repository's static audio chapter
(readings_chirho, or clips_chirho before GPT's migration), used only when the video's source chapter and window
match it within 0.3 s; other videos are skipped and named. The app checks text and scene hashes again.

  python3 -I stage_videos_chirho.py <videos folder> --serial emulator-5556 [--dry-run]

The device serial is always explicit, so another project's emulator is never touched by default.
"""
import argparse
import hashlib
import json
import subprocess
import sys
import tempfile
from pathlib import Path

PACKAGE_CHIRHO = "us.hinneh.readerchirho"
REPO_CHIRHO = Path(__file__).resolve().parents[3]
STATIC_CHIRHO = REPO_CHIRHO / "static"
WINDOW_SLACK_CHIRHO = 0.3  # seconds, as sameEmbeddedReadingChirho allows
DEVICE_FOLDER_CHIRHO = f"/sdcard/Android/data/{PACKAGE_CHIRHO}/files/staged-videos-chirho"


def probe_size_chirho(path_chirho: Path) -> tuple[int, int]:
    done_chirho = subprocess.run(["ffprobe", "-v", "error", "-select_streams", "v:0", "-show_entries", "stream=width,height", "-of", "csv=p=0",
                                  str(path_chirho)], capture_output=True, text=True, check=True)
    width_chirho, height_chirho = done_chirho.stdout.strip().split(",")
    return int(width_chirho), int(height_chirho)


def chapter_file_chirho(folder_chirho: str, verse_id_chirho: str) -> dict:
    books_chirho = json.loads((REPO_CHIRHO / "config-chirho/bible-chirho/books-chirho.json").read_text())["books_chirho"]
    book_chirho, chapter_chirho, _ = verse_id_chirho.split(".")
    slug_chirho = next(b["slug_chirho"] for b in books_chirho if b["id_chirho"] == book_chirho)
    return json.loads((STATIC_CHIRHO / folder_chirho / slug_chirho / f"chapter-{int(chapter_chirho):02d}-chirho.json").read_text())


def canonical_sha_chirho(verse_id_chirho: str) -> str:
    verse_chirho = next(v for v in chapter_file_chirho("content-chirho", verse_id_chirho)["verses_chirho"] if v["id_chirho"] == verse_id_chirho)
    return hashlib.sha256(verse_chirho["canonical_text_chirho"].encode()).hexdigest()


def published_reading_chirho(verse_id_chirho: str) -> dict | None:
    audio_chirho = chapter_file_chirho("audio-chirho", verse_id_chirho)
    for entry_chirho in audio_chirho.get("readings_chirho", []) + audio_chirho.get("clips_chirho", []):
        if entry_chirho.get("lesson_id_chirho") == verse_id_chirho and "reading_source_chirho" in entry_chirho:
            return entry_chirho["reading_source_chirho"]
    return None


def record_chirho(json_path_chirho: Path) -> tuple[dict, Path] | str:
    """The staged record and its file, or the reason this video cannot be staged yet."""
    source_chirho = json.loads(json_path_chirho.read_text())
    video_chirho, reading_chirho = source_chirho["video_chirho"], source_chirho["reading_chirho"]
    verse_id_chirho = source_chirho["verse_id_chirho"]
    window_chirho = reading_chirho["window_chirho"]
    published_chirho = published_reading_chirho(verse_id_chirho)
    if published_chirho is None:
        return f"{verse_id_chirho}: no verified Be'eri cut published for this verse yet"
    if (published_chirho["gbt_id_chirho"] != reading_chirho["gbt_id_chirho"]
            or published_chirho["chapter_sha256_chirho"] != reading_chirho["chapter_file_sha256_chirho"]
            or abs(published_chirho["start_chirho"] - window_chirho["verse_start_chirho"]) > WINDOW_SLACK_CHIRHO
            or abs(published_chirho["end_chirho"] - window_chirho["end_chirho"]) > WINDOW_SLACK_CHIRHO):
        return f"{verse_id_chirho}: the video's reading is not the published Be'eri cut"

    mp4_chirho = json_path_chirho.with_name(video_chirho["file_chirho"])
    data_chirho = mp4_chirho.read_bytes()
    sha_chirho = hashlib.sha256(data_chirho).hexdigest()
    if sha_chirho != video_chirho["sha256_chirho"] or len(data_chirho) != video_chirho["bytes_chirho"]:
        raise SystemExit(f"{mp4_chirho.name}: bytes differ from its record; nothing staged")
    width_chirho, height_chirho = probe_size_chirho(mp4_chirho)
    return {
        "lesson_id_chirho": verse_id_chirho,
        "asset_path_chirho": f"/video-chirho/sha256-chirho/{sha_chirho}-chirho.mp4",
        "sha256_chirho": sha_chirho,
        "bytes_chirho": len(data_chirho),
        "duration_chirho": source_chirho["seconds_chirho"],
        "width_chirho": width_chirho,
        "height_chirho": height_chirho,
        "scene_sha256_chirho": source_chirho["scene_chirho"]["sha256_chirho"],
        "canonical_sha256_chirho": canonical_sha_chirho(verse_id_chirho),
        "reading_language_chirho": "he",
        "embedded_reading_chirho": published_chirho,
        "attribution_chirho": published_chirho["attribution_chirho"],
        "license_chirho": published_chirho["license_chirho"],
        "license_url_chirho": published_chirho["license_url_chirho"],
        "review_chirho": "pending",
    }, mp4_chirho


def main_chirho() -> None:
    parser_chirho = argparse.ArgumentParser(description=__doc__.splitlines()[0])
    parser_chirho.add_argument("videos", type=Path)
    parser_chirho.add_argument("--serial", required=True, help="adb device serial, for example emulator-5556")
    parser_chirho.add_argument("--dry-run", action="store_true")
    args_chirho = parser_chirho.parse_args()
    results_chirho = [record_chirho(path_chirho) for path_chirho in sorted(args_chirho.videos.glob("*-chirho.json"))]
    for skipped_chirho in (r for r in results_chirho if isinstance(r, str)):
        print("skipped", skipped_chirho)
    pairs_chirho = [r for r in results_chirho if not isinstance(r, str)]
    if not pairs_chirho:
        raise SystemExit("no video can be staged")
    records_chirho = [record_chirho_ for record_chirho_, _ in pairs_chirho]
    print(f"{len(records_chirho)} videos verified: {records_chirho[0]['lesson_id_chirho']} .. {records_chirho[-1]['lesson_id_chirho']}, "
          f"{sum(r['bytes_chirho'] for r in records_chirho) / 1e6:.1f} MB")
    if args_chirho.dry_run:
        return
    adb_chirho = ["adb", "-s", args_chirho.serial]
    subprocess.run([*adb_chirho, "shell", "mkdir", "-p", DEVICE_FOLDER_CHIRHO], check=True)
    with tempfile.TemporaryDirectory() as temporary_chirho:
        index_chirho = Path(temporary_chirho) / "index-chirho.json"
        index_chirho.write_text(json.dumps(records_chirho, ensure_ascii=False, indent=1) + "\n")
        for record_chirho_, mp4_chirho in pairs_chirho:
            subprocess.run([*adb_chirho, "push", str(mp4_chirho), f"{DEVICE_FOLDER_CHIRHO}/{record_chirho_['sha256_chirho']}-chirho.mp4"],
                           check=True, capture_output=True)
        # The index goes last, so the app never lists a video whose file is still arriving.
        subprocess.run([*adb_chirho, "push", str(index_chirho), f"{DEVICE_FOLDER_CHIRHO}/index-chirho.json"], check=True, capture_output=True)
    listed_chirho = subprocess.run([*adb_chirho, "shell", "ls", DEVICE_FOLDER_CHIRHO], check=True, capture_output=True, text=True).stdout.split()
    print(f"staged on {args_chirho.serial}: {len(listed_chirho) - 1} videos and index-chirho.json in {DEVICE_FOLDER_CHIRHO}")


if __name__ == "__main__":
    sys.exit(main_chirho())
