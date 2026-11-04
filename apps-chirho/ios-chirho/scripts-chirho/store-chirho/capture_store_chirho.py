#!/usr/bin/env python3
# For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life. — John 3:16 (KJV)
"""Capture a source snapshot through XCUITest; never touch a physical device or signing.

Workflow: spec-chirho/workflows-chirho/native-chirho/store-assets-chirho.md.
"""

import argparse
import hashlib
import json
import re
import shutil
import subprocess
from pathlib import Path


def run_chirho(arguments_chirho: list[str], log_chirho: Path | None = None) -> str:
    if log_chirho is None:
        return subprocess.check_output(arguments_chirho, text=True)
    with log_chirho.open("w") as output_chirho:
        subprocess.run(
            arguments_chirho, stdout=output_chirho, stderr=subprocess.STDOUT, check=True
        )
    return ""


def main_chirho() -> None:
    parser_chirho = argparse.ArgumentParser(description=__doc__)
    parser_chirho.add_argument(
        "--device-chirho", choices=["iphone-chirho", "ipad-chirho"], required=True
    )
    parser_chirho.add_argument("--output-chirho", type=Path, required=True)
    options_chirho = parser_chirho.parse_args()
    root_chirho = Path(__file__).resolve().parents[4]
    app_chirho = root_chirho / "apps-chirho/ios-chirho"
    output_chirho = options_chirho.output_chirho.resolve()
    allowed_chirho = (
        root_chirho / "workspace-chirho/native-apps-chirho/app-store-chirho"
    )
    if (
        not output_chirho.is_relative_to(allowed_chirho)
        or output_chirho == allowed_chirho
    ):
        raise ValueError(
            "Choose a dated package under workspace-chirho/native-apps-chirho/app-store-chirho"
        )
    output_chirho.mkdir(parents=True, exist_ok=True)
    device_chirho = options_chirho.device_chirho
    work_chirho = (
        root_chirho
        / "build-chirho/ios-store-chirho"
        / output_chirho.name
        / device_chirho
    )
    work_chirho.mkdir(parents=True, exist_ok=True)
    snapshot_chirho = work_chirho / "source-chirho"
    if snapshot_chirho.exists():
        raise ValueError(f"Capture snapshot already exists: {snapshot_chirho}")
    shutil.copytree(
        app_chirho,
        snapshot_chirho,
        ignore=shutil.ignore_patterns(
            "build-chirho",
            "evidence-chirho",
            ".build",
            ".swiftpm",
            "xcuserdata",
            ".DS_Store",
            ".env",
            ".env.*",
            ".dev.vars*",
        ),
    )
    icon_chirho = app_chirho / "build-chirho/branding-chirho/BrandChirho.xcassets"
    shutil.copytree(
        icon_chirho,
        snapshot_chirho / "build-chirho/branding-chirho/BrandChirho.xcassets",
    )
    shutil.copyfile(
        Path(__file__).with_name("StoreCaptureChirho.swift"),
        snapshot_chirho / "HinnehChirhoUITests/StoreCaptureChirho.swift",
    )
    devices_chirho = json.loads(
        run_chirho(["xcrun", "simctl", "list", "devices", "available", "-j"])
    )
    name_chirho = (
        "iPhone 17 Pro" if device_chirho == "iphone-chirho" else "iPad Pro 13-inch (M5)"
    )
    target_chirho = next(
        device_chirho
        for runtime_chirho, entries_chirho in devices_chirho["devices"].items()
        if runtime_chirho.endswith("iOS-26-5")
        for device_chirho in entries_chirho
        if device_chirho["name"] == name_chirho
    )
    if target_chirho["state"] != "Shutdown":
        raise ValueError(
            "Capture only an idle, shutdown simulator; preserve existing user sessions"
        )
    udid_chirho = target_chirho["udid"]
    run_chirho(["xcrun", "simctl", "boot", udid_chirho])
    try:
        run_chirho(
            ["xcrun", "simctl", "bootstatus", udid_chirho, "-b"],
            work_chirho / "boot-chirho.log",
        )
        run_chirho(["xcrun", "simctl", "ui", udid_chirho, "appearance", "light"])
        run_chirho(
            [
                "xcrun",
                "simctl",
                "status_bar",
                udid_chirho,
                "override",
                "--time",
                "9:41",
                "--dataNetwork",
                "wifi",
                "--wifiMode",
                "active",
                "--wifiBars",
                "3",
                "--batteryState",
                "charged",
                "--batteryLevel",
                "100",
            ]
        )
        result_chirho = work_chirho / "capture-chirho.xcresult"
        run_chirho(
            [
                "xcodebuild",
                "-project",
                str(snapshot_chirho / "HinnehChirho.xcodeproj"),
                "-scheme",
                "HinnehChirho",
                "-destination",
                f"platform=iOS Simulator,id={udid_chirho}",
                "-derivedDataPath",
                str(work_chirho / "derived-chirho"),
                "-resultBundlePath",
                str(result_chirho),
                "-parallel-testing-enabled",
                "NO",
                "-only-testing:HinnehChirhoUITests/StoreCaptureChirho",
                "CODE_SIGNING_ALLOWED=NO",
                "test",
            ],
            work_chirho / "capture-chirho.log",
        )
        attachments_chirho = work_chirho / "attachments-chirho"
        run_chirho(
            [
                "xcrun",
                "xcresulttool",
                "export",
                "attachments",
                "--path",
                str(result_chirho),
                "--output-path",
                str(attachments_chirho),
            ]
        )
        raw_chirho = output_chirho / "raw-chirho" / device_chirho
        raw_chirho.mkdir(parents=True, exist_ok=True)
        manifest_chirho = json.loads((attachments_chirho / "manifest.json").read_text())
        saved_chirho = []
        for test_chirho in manifest_chirho:
            for attachment_chirho in test_chirho.get("attachments", []):
                suggested_chirho = attachment_chirho.get(
                    "suggestedHumanReadableName", ""
                )
                match_chirho = re.match(
                    r"([0-9]{2}-[a-z]+-(?:en|es)-chirho)(?:_|\.png)", suggested_chirho
                )
                if match_chirho is None:
                    continue
                name_chirho = match_chirho.group(1) + ".png"
                source_chirho = (
                    attachments_chirho / attachment_chirho["exportedFileName"]
                )
                target_chirho = raw_chirho / name_chirho
                if target_chirho.exists():
                    raise ValueError(f"Existing capture: {target_chirho}")
                shutil.copyfile(source_chirho, target_chirho)
                saved_chirho.append(
                    {
                        "path_chirho": str(target_chirho.relative_to(output_chirho)),
                        "sha256_chirho": hashlib.sha256(
                            target_chirho.read_bytes()
                        ).hexdigest(),
                    }
                )
        (raw_chirho / "capture-receipt-chirho.json").write_text(
            json.dumps(
                {
                    "device_chirho": device_chirho,
                    "simulator_udid_chirho": udid_chirho,
                    "runtime_chirho": "iOS 26.5",
                    "files_chirho": saved_chirho,
                },
                indent=2,
            )
            + "\n"
        )
        if len(saved_chirho) != 12:
            raise ValueError(
                f"Expected 12 source captures; exported {len(saved_chirho)}"
            )
        print(
            json.dumps(
                {
                    "device_chirho": device_chirho,
                    "screenshots_chirho": len(saved_chirho),
                }
            )
        )
    finally:
        try:
            run_chirho(["xcrun", "simctl", "status_bar", udid_chirho, "clear"])
        finally:
            run_chirho(["xcrun", "simctl", "shutdown", udid_chirho])


if __name__ == "__main__":
    main_chirho()
