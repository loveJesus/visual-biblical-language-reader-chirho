<!-- For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life. — John 3:16 (KJV) -->

# Hinneh for iOS

A native SwiftUI reader for the original-language Bible text at <https://hinneh.us/>. It is not a
WebView or a wrapper, and the corpus is not bundled.

The app reads one verified chapter at a time and shows:

- the Hebrew or Greek words with their teaching marks;
- word pictures and the verse scene;
- word cards for meaning and morphology;
- individual word recordings.

The shared remote contract is in [../README-chirho.md](../README-chirho.md).

## Layout

| Path                     | What it holds                                                                                                                                                       |
| ------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `HinnehCoreChirho/`      | Swift package: trusted origin and bounded verified fetch, the content contract and its validation, cues, media/audio/Spanish selection, EN/ES messages and passages |
| `HinnehChirho/`          | SwiftUI app: `ReaderChirho/` screens, `SupportChirho/` reader model, artwork store, player and flow layout                                                          |
| `HinnehChirhoTests/`     | Hosted model tests with a delayed transport (rendition race)                                                                                                        |
| `HinnehChirhoUITests/`   | XCUITest checks against the live site                                                                                                                               |
| `HinnehChirho.xcodeproj` | Small hand-written project using Xcode synchronized folders; scheme `HinnehChirho`                                                                                  |
| `scripts-chirho/`        | `ios_chirho.sh` (test, build, run, shot) and `export_teaching_chirho.ts`                                                                                            |

The bundle id is `us.hinneh.readerchirho` (local only; no store identity is reserved). The
display name is Hinneh, the minimum is iOS 18.0, and the language mode is Swift 6.

## Commands

```bash
scripts-chirho/ios_chirho.sh icon                          # render the shared launcher mark (ignored)
scripts-chirho/ios_chirho.sh test                          # core tests on the Mac host
HINNEH_LIVE_CHIRHO=1 scripts-chirho/ios_chirho.sh test     # plus read-only live smoke tests
scripts-chirho/ios_chirho.sh build                         # simulator build, unsigned
scripts-chirho/ios_chirho.sh run John.3.16                 # install and open a passage
xcodebuild -project HinnehChirho.xcodeproj -scheme HinnehChirho \
  -destination 'platform=iOS Simulator,name=iPhone 17 Pro,OS=26.5' test   # UI tests
bun apps-chirho/ios-chirho/scripts-chirho/export_teaching_chirho.ts --check   # from the repo root
```

From the repository root, run the complete offline source contract with `HINNEH_STATIC_ROOT_CHIRHO="$PWD/static" bash apps-chirho/ios-chirho/scripts-chirho/ios_chirho.sh test`. GPT added this integration check after the lane handoff: all 66 book manifests and 31,156 verses pass through the real bounded client, chapter hashes, validators and visible-source surface ordering. It uses no network and does not rewrite corpus files. Without that variable, the corpus suite is skipped; the live smoke tests are independently opt-in.

Build outputs default to `build-chirho/` here, which `.gitignore` excludes. Set
`HINNEH_BUILD_ROOT_CHIRHO` to build elsewhere.

The launcher icon is the shared mark in `apps-chirho/branding-chirho/`. The `icon` step renders it
with that folder's `render_mark_chirho.ts` into the ignored catalog
`build-chirho/branding-chirho/BrandChirho.xcassets`, which the project references. `build` runs the
step when the catalog is missing; building straight from Xcode needs it run once first.

Launch arguments:

- `-hinneh-open-chirho John.3.16` opens a passage.
- `-hinneh-locale-chirho es` sets the interface language.

## What the app trusts, and how

- **Origin.** Only `https://hinneh.us` is used. Each resource kind has one path shape and one size
  limit. Redirects, other hosts, schemes, queries and traversal are refused before any request.
- **Text.**
  - A book manifest, then one chapter, whose SHA-256 must match the manifest.
  - Verse ids follow the edition's explicit verse numbers.
  - Word spans are checked as the publisher's UTF-16 offsets. Comparisons are scalar for scalar,
    because Swift's `==` would accept canonically equivalent forms.
  - Nothing is normalized.
- **Media.**
  - The book summary, then the selected chapter's media file, with one summary retry after a hash
    mismatch.
  - Reviewed contextual pictures win over full-lemma defaults.
  - Scene and picture bytes are SHA-verified before they are shown.
- **Audio.**
  - The global manifest names the chapter catalogue. That catalogue must be bound to the exact
    content chapter, and each clip to the verse's canonical text hash and the word's spoken form,
    which follows the qere.
  - Each MP3 is SHA-verified, then plays complete to its natural end. Greek plays at 0.88 with its
    pitch preserved (AVPlayer spectral time-pitch); Hebrew plays at 1.0.
  - Greek defaults to Modern with aspirates. A bulk modern recording stands in only for words
    without rough breathing. Erasmian and plain Modern accept only their own recordings.
  - Each play carries its own identity: a late end or failure from an earlier play, even of the
    same word, is ignored. Rejected recordings never play.
- **Spanish meanings.** Fetched only for the chapter on screen, and only when the interface is
  Spanish. A layer must be hash-checked and bound to the chapter bytes; otherwise it is withheld.
- **Caches.** Bounded to four chapters per client, plus limited URL and image caches. Navigation
  cancels stale requests and playback.
- **Credits.** The Hebrew reading-key explanations adapt unfoldingWord Hebrew Grammar under
  CC BY-SA 4.0. The credit appears with the key, in each Hebrew word card and in the verse's
  sources.

## Books

The public bootstrap `/library-chirho/books-chirho.json` is used when it validates. Otherwise the
app uses `HinnehCoreChirho/Sources/HinnehCoreChirho/ResourcesChirho/books-fallback-chirho.json`.
That file holds identities only. It is exported, with the teaching tables, from the website
registry and modules by `scripts-chirho/export_teaching_chirho.ts`.

## Local integration result

November 3: GPT independently verified the unsigned build, 25 core tests plus both opt-in live tests, the complete offline corpus check, and all six hosted model/UI cases on iPhone 17e with iOS 26.5. The simulator UI covers the corner speaker independently of Look closer, natural verse playback to its end, next verse, absent-verse recovery and Spanish Greek meanings. Exact Greek byte keys, rendition selection and per-play UUID identity remain covered. The same six cases passed in the lane on iPhone 17 Pro; the lane also reported an iPad visual check. The AppIntents metadata processor emits a tool warning when it finds no AppIntents dependency; compiler warnings are zero.

This is an unsigned simulator reader, not a physical-device or store release. VoiceOver listening and language switching remain unverified. Natural verse recordings play where available; word-clip verse assembly, lexicon links, the reduced-scene chooser, native report controls and universal links are not in v1. Pronunciation and artwork review states are unchanged. GPT owns further integration after the scoped Claude lane was handed off and closed.
