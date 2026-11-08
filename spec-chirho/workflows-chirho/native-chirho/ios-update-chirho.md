<!-- For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life. — John 3:16 (KJV) -->

# iOS reader update and release

Root owns the iOS implementation and App Store submission. The November 8 update preserves the existing app, signing team, privacy declarations, localized metadata and automatic-after-approval release choice. Android and web implementation remain with their respective writers.

```mermaid
flowchart TD
    PassageChirho[Choose or swipe to a source passage] --> CancelChirho[Cancel old loads and stop its playback]
    CancelChirho --> TextChirho[Verify the canonical chapter and edition numbering]
    TextChirho --> LayersChirho[Load verified scene, pictures and recordings]
    LayersChirho --> RenditionChirho[Saved pronunciation wins; otherwise prefer available Aspirates then Modern]
    RenditionChirho --> PlayChirho[Explicit Play at saved speed; fresh default Normal]
    PlayChirho --> MatchChirho{Video matches source scene and selected reading?}
    MatchChirho -->|yes| VideoChirho[One verified MP4 and embedded soundtrack]
    MatchChirho -->|no| AudioChirho[Verified MP3 over the still]
    VideoChirho --> FailureChirho[On failure retain video SHA; next explicit Play uses MP3]
    FailureChirho --> AudioChirho
    VideoChirho --> StopChirho[Stop, word speaker, rendition change or navigation cancels]
    AudioChirho --> StopChirho
    LayersChirho --> HelpChirho[Word details stay concise; Sources and Reading key retain credit and help]
```

ReaderModelChirho invalidates audio selection with a request identity and cancellation, including repeated A/B/A choices and revisiting a passage. Old recordings disappear immediately while a different pronunciation loads. AudioPlayerChirho identifies each play independently, verifies the complete asset before AVPlayer starts, and rejects late callbacks. Speed applies to words, verse MP3s and matching videos with pitch preserved. Video scrubbing and browser-style edge starts are excluded from verse swipes; vertical scrolling remains available. Edition-aware previous/next targets also control disabled buttons and navigation returns to the heading.

The iOS video validator requires explicit soundtrack keys, even for a silent CC0 record, and withholds duplicate records for a verse. Invalid video selection leaves valid scene and word pictures available. Exact Be'eri attribution and its license remain in each verse's Sources fold. General AI/source-review explanations live in reading help and About.

```mermaid
flowchart TD
    AuthorityChirho[Explicit project deployment authority] --> ReconcileChirho[Read exact app, public predecessor, builds and retained upload claims]
    ReconcileChirho --> NativeChirho[Core contracts plus real iPhone and iPad playback/UI checks]
    NativeChirho --> FreezeChirho[Freeze source hashes and intended marketing/build numbers]
    FreezeChirho --> ArchiveChirho[Sign and export with selected shared Apple credentials]
    ArchiveChirho --> InspectChirho[Inspect actual IPA, devices, encryption and privacy manifest]
    InspectChirho --> ValidateChirho[Apple archive validation]
    ValidateChirho --> UploadChirho[One durable upload claim and exact-byte transfer]
    UploadChirho --> ProcessChirho[Read VALID and APP_STORE_ELIGIBLE for the exact version/build]
    ProcessChirho --> AttachChirho[Attach only that build to the localized update]
    AttachChirho --> ReadyChirho[Read metadata, screenshots, privacy URLs and private contact presence]
    ReadyChirho --> SubmitChirho[Submit the exact version item under existing authority]
    SubmitChirho --> ReviewChirho[Read back review state; approval and public distribution are separate]
```

The next-version operator, its bounded private journal and command contract are documented in apps-chirho/ios-chirho/scripts-chirho/release-chirho/README-chirho.md. Shared upload claims and unknown outcomes are retained. A lost response never authorizes a duplicate POST/upload. No owner legal declaration is inferred from a successful build. The private progress database and store responses remain outside the public source mirror; binaries stay in ignored build output.

## Reviewed spoken forms and human Aramaic readings

```mermaid
flowchart TD
    ReviewsChirho[Source-bound web reading reviews] --> ExportChirho[Cold-check canonical chapter and full token identity]
    ExportChirho --> AssetChirho[One separate small spoken-overrides asset in both native apps]
    AssetChirho --> QereChirho{Content qere available?}
    QereChirho -->|Yes| SourceChirho[Use the content reading]
    QereChirho -->|No| MatchChirho{Written token, lemma, augment, morphology and recursive qere match?}
    MatchChirho -->|No| WrittenChirho[Use written source text]
    MatchChirho -->|Yes| WordChirho[Word speaker uses the exact reviewed reading]
    WordChirho --> GroupChirho{Whole consecutive group and canonical verse match?}
    GroupChirho -->|Yes| VerseChirho[Whole verse replaces group once at its last member]
    GroupChirho -->|No| FallbackChirho[Whole verse retains source words without collapsing]
```

The exporter writes only the three reviewed overrides not already carried by content qere. Native assets are byte-identical and malformed assets give no overrides. iOS compares Unicode scalars exactly, preserving the web identity boundary rather than Swift's normalization-equivalent String equality. No canonical Scripture or phonetic guess is introduced. Valid human Be'eri recordings in Aramaic or mixed-language passages may pass the human validator; the existing exclusions still apply to synthesized Aramaic words and verses. A failed human claim is never treated as an AI clip.

The0.1.2/build4 source candidate repairs the97 safely withheld human readings in0.1.1/build3. A pending submitted version stays immutable. Candidate archive/export, Apple validation, upload, review and public release are separate evidence states; preparing the next binary does not withdraw or replace an existing review. Silent file/core checks can run while the submitted version awaits Apple.
