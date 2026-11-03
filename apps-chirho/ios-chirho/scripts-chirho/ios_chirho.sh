#!/usr/bin/env bash
# For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life. — John 3:16 (KJV)
#
# Local build, test and run for the native Hinneh iOS reader. Nothing here signs, uploads or
# contacts a store. Build outputs go under HINNEH_BUILD_ROOT_CHIRHO (default: build-chirho/ in
# this app, which .gitignore excludes).
#   scripts-chirho/ios_chirho.sh icon                 # render the shared launcher mark (ignored output)
#   scripts-chirho/ios_chirho.sh test                 # core package tests on the Mac host
#   scripts-chirho/ios_chirho.sh build                # simulator app build, no signing
#   scripts-chirho/ios_chirho.sh run [passage]        # install and launch on the simulator
#   scripts-chirho/ios_chirho.sh shot <file.png>      # screenshot of the booted simulator
set -euo pipefail

app_dir_chirho="$(cd "$(dirname "$0")/.." && pwd)"
build_root_chirho="${HINNEH_BUILD_ROOT_CHIRHO:-$app_dir_chirho/build-chirho}"
device_chirho="${HINNEH_DEVICE_CHIRHO:-iPhone 17 Pro}"
os_chirho="${HINNEH_OS_CHIRHO:-26.5}"
bundle_chirho="us.hinneh.readerchirho"
# The renderer accepts only this ignored folder; the catalog is regenerated, never committed.
catalog_chirho="$app_dir_chirho/build-chirho/branding-chirho/BrandChirho.xcassets"

prepare_icon_chirho() {
  mkdir -p "$catalog_chirho/AppIcon.appiconset"
  (cd "$app_dir_chirho/../.." && bun apps-chirho/branding-chirho/render_mark_chirho.ts \
    "$catalog_chirho/AppIcon.appiconset/AppIcon-chirho.png")
  printf '%s\n' '{"info":{"author":"xcode","version":1}}' > "$catalog_chirho/Contents.json"
  printf '%s\n' '{"images":[{"filename":"AppIcon-chirho.png","idiom":"universal","platform":"ios",' \
    '"size":"1024x1024"}],"info":{"author":"xcode","version":1}}' | tr -d '\n' \
    > "$catalog_chirho/AppIcon.appiconset/Contents.json"
}

udid_chirho() {
  xcrun simctl list devices available -j | python3 -I -B -c '
import json, sys
name_chirho, os_chirho = sys.argv[1], sys.argv[2]
for runtime_chirho, devices_chirho in json.load(sys.stdin)["devices"].items():
    if runtime_chirho.endswith("iOS-" + os_chirho.replace(".", "-")):
        for device_chirho in devices_chirho:
            if device_chirho["name"] == name_chirho:
                print(device_chirho["udid"]); sys.exit(0)
sys.exit("simulator not found: " + name_chirho + " iOS " + os_chirho)
' "$device_chirho" "$os_chirho"
}

case "${1:-}" in
  icon)
    prepare_icon_chirho
    ;;
  test)
    cd "$app_dir_chirho/HinnehCoreChirho"
    swift test --scratch-path "$build_root_chirho/swiftpm-chirho"
    ;;
  build)
    [ -f "$catalog_chirho/AppIcon.appiconset/AppIcon-chirho.png" ] || prepare_icon_chirho
    cd "$app_dir_chirho"
    xcodebuild -project HinnehChirho.xcodeproj -scheme HinnehChirho -configuration Debug \
      -destination "platform=iOS Simulator,name=$device_chirho,OS=$os_chirho" \
      -derivedDataPath "$build_root_chirho/derived-chirho" \
      -clonedSourcePackagesDirPath "$build_root_chirho/spm-clones-chirho" \
      CODE_SIGNING_ALLOWED=NO build
    ;;
  run)
    target_chirho="$(udid_chirho)"
    xcrun simctl boot "$target_chirho" 2>/dev/null || true
    xcrun simctl bootstatus "$target_chirho" -b
    xcrun simctl install "$target_chirho" \
      "$build_root_chirho/derived-chirho/Build/Products/Debug-iphonesimulator/Hinneh.app"
    xcrun simctl launch --terminate-running-process "$target_chirho" "$bundle_chirho" ${2:+-hinneh-open-chirho "$2"}
    ;;
  shot)
    xcrun simctl io "$(udid_chirho)" screenshot "${2:?screenshot path}"
    ;;
  *)
    echo "usage: $0 icon|test|build|run [passage]|shot <file.png>" >&2
    exit 2
    ;;
esac
