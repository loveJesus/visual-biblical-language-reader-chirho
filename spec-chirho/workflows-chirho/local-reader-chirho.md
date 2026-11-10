<!-- For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life. — John 3:16 (KJV) -->

# Local reader workflows

```mermaid
flowchart TD
    pinned_chirho[Pinned OSHB and lexical evidence] --> import_chirho[Offline source import]
    import_chirho --> fixture_chirho[Curated Proverbs 26:1 fixture]
    fixture_chirho --> validate_chirho[Validate exact spans, clusters, morphology and URLs]
    gbt_chirho[Pinned approved GBT export] --> gloss_import_chirho[Hash check and verse-only import]
    gloss_import_chirho --> gloss_validate_chirho[Match stable word IDs and NFD text with boundary punctuation]
    gloss_validate_chirho --> reader_chirho
    validate_chirho -->|valid| cues_chirho[Derive independent visual cues]
    validate_chirho -->|invalid| unavailable_chirho[Safe unavailable state]
    cues_chirho --> reader_chirho[RTL verse and seven-row help]
    reader_chirho --> reveal_chirho[Saved phonetic and translation displays annotate the source words]
    reader_chirho --> word_jump_chirho[Click or press Enter on an original-language word]
    reader_chirho --> transport_chirho[Compact previous, play and next row above the words]
    reader_chirho --> trumpet_chirho[Separate word-corner pronunciation button]
    transport_chirho --> recordings_chirho[Exact source-bound saved recording when available]
    trumpet_chirho --> recordings_chirho
    recordings_chirho --> speech_chirho[Otherwise matching local voice and separate qere reading]
    recordings_chirho --> cancel_chirho
    speech_chirho --> cancel_chirho[Cancel on another playback, stop or passage change]
    word_jump_chirho --> card_chirho[Open the same word card in a dialog online]
    card_chirho --> list_chirho[View in all words restores and focuses the lower card]
    word_jump_chirho -->|saved offline page| list_chirho
    card_chirho --> return_chirho[Back to verse returns focus to the same source word without changing passage]
    return_chirho --> word_jump_chirho
    reader_chirho --> export_chirho[Exclusive-create self-contained offline snapshot]
    export_chirho --> offline_chirho[Open with network disabled and inspect]
```

```mermaid
flowchart TD
    prompt_chirho[Record 4 by 4 prompt and intended senses] --> generation_chirho[Built-in image generation]
    generation_chirho -->|failure| report_chirho[Report credit or tool failure to AICEO]
    generation_chirho -->|success| preserve_chirho[Preserve original sheet and provenance]
    preserve_chirho --> cut_chirho[ImageMagick crops at measured empty gutters]
    cut_chirho --> checks_chirho[Measure gutters, edge clearance and foreground regions]
    checks_chirho --> inspect_chirho[Inspect every cell and 19px preview]
    inspect_chirho -->|pass| pending_chirho[Pending user review with checksums]
    inspect_chirho -->|visual rejection| reject_chirho[Preserve original, selection and explicit reason]
    reject_chirho --> retry_chirho[Retry the same selected senses with the specific correction]
    retry_chirho -->|fewer than four rejected attempts| generation_chirho
    retry_chirho -->|four rejected attempts or invalid evidence| art_hold_chirho[Stop for reconciliation without publishing the sheet]
    pending_chirho --> local_preview_chirho[Local preview uses an agent-reviewed contextual sense]
    pending_chirho --> approval_chirho[L.J. approves specific artwork]
    approval_chirho --> release_chirho[Approved artwork can enter public release]
```

The original prototype and gallery are absent on this Mac. Their historical results are not
local results. Generated scenes are imaginative learning aids. Artwork measurements establish
layout properties; a human must judge subjects and contextual meaning.

Detailed source-import DAGs are in `scripts-chirho/import-chirho/README-chirho.md`.
Reviewed GBT glosses and the app-authored learning gloss never share an unmarked provenance.

```mermaid
flowchart TD
    greek_source_chirho[Pinned Greek morphology and exact text] --> greek_validate_chirho[Validate source spans and grammatical values]
    greek_validate_chirho --> greek_cues_chirho[Derive only sourced compact cues]
    greek_cues_chirho --> greek_left_chirho[Upper left: tense capital and voice lowercase]
    greek_cues_chirho --> greek_center_chirho[Centered roman case]
    greek_cues_chirho --> greek_right_chirho[Upper right: person number and mood capital]
    greek_left_chirho --> greek_word_chirho[Render cue row above preserved word and punctuation]
    greek_center_chirho --> greek_word_chirho
    greek_right_chirho --> greek_word_chirho
    greek_word_chirho --> greek_details_chirho[Word click opens its meaning and morphology dialog]
    greek_word_chirho --> cue_help_chirho[Hover, focus or tap a cue for its translated full explanation]
```

Greek cue positions, lowercase voice and roman case are Hinneh conventions; the full legend
keeps every code explicit. Source ambiguity and deponent labels are preserved. The cue row
reserves space for short participles, keeping case separate from tense, voice and mood.

Hebrew adds W weqatal, Y wayyiqtol, E weyiqtol, J jussive, O cohortative and Q ordinary waw +
qatal to the existing P/I/M/A/C/B display codes. These are local teaching conventions; imported
verb codes and sourced form/construction classifications do not change. No cue is inferred
from waw or word spelling. Superscript help reuses the EN/ES grammar key, including noun state,
stem, form and Greek case/tense/voice/person/mood. Cue buttons are siblings of the word link,
so tapping help does not navigate away and word clicks open the word detail dialog. Escape closes
the shared hover/focus/tap popup. Short verbs reserve enough width for both cues.

```mermaid
flowchart TD
    corpus_chirho[Pinned verse corpus and book-order inventory] --> queue_chirho[Find the next unillustrated verse]
    manifest_chirho[Existing scene manifests] --> queue_chirho
    queue_chirho --> lease_chirho[Single worker lease and checkpoint]
    lease_chirho --> agent_chirho[Codex worker using built-in image generation]
    agent_chirho --> quality_chirho[Inspect verse-specific scene and convert to WebP]
    quality_chirho -->|pass| receipt_chirho[Atomically record prompt, hash and pending art status]
    receipt_chirho --> index_chirho[Refresh sanitized book and chapter media shards atomically]
    index_chirho --> summary_chirho[Reader loads book summary and selected chapter]
    summary_chirho --> verify_chirho[Check chapter hash; retry summary once on mismatch]
    verify_chirho --> reader_chirho[Reader loads available artwork without a page reload]
    quality_chirho -->|fail| hold_chirho[Record failure and stop bounded retries]
    receipt_chirho --> next_chirho[Continue Proverbs, then John, then Genesis]
```

Icon candidates are grouped by lemma and contextual sense. A reviewed mapping selects an icon
for an occurrence. The reader shows one illustration for each reviewed meaning. Drawing variants
of the same sense or meaning label stay in provenance and produce a single border. A double border
opens other distinct reviewed meanings, each captioned, while the selected meaning stays explicit.
Recorded audio and film remain separate media types under the same verse identity; neither is
generated by the image worker. Playback prefers a source-bound saved MP3 and otherwise uses a
matching local device voice. The catalogue and selected audio chapter are static, hash-checked
and cached with a four-chapter limit. Playback makes no synthesis, provider or database request.
Modern Greek is preferred over ancient-Greek device voices. Spoken Hebrew follows qere while
the displayed canonical source remains unchanged. Seven earlier native-voice audition clips remain eligible after the listener-rejected Hebrew-input naveh clip was withdrawn;
they remain explicitly pending pronunciation review, and other passages retain the device
fallback. Offline HTML export retains device playback; it does not embed the new recordings.

```mermaid
flowchart TD
    pointed_chirho[Exact pointed source word and verse identity] --> trial_chirho[Source-checked Israeli Hebrew IPA trial with stress and notes]
    trial_chirho --> bind_chirho[Require exact word lemma augment morphology and canonical verse]
    bind_chirho -->|changed or missing| withhold_chirho[Withhold IPA and keep the displayed source]
    bind_chirho --> cards_chirho[Localized Look closer IPA and surprising-pronunciation marker]
    bind_chirho --> budget_chirho[Count actual IPA provider input plus the original 168-credit reservation]
    budget_chirho -->|total at most 300| reserve_chirho[Persist one request identity before synthesis]
    reserve_chirho --> cache_chirho[Save MP3 once and retain unknown results without retry]
    cache_chirho --> verify_chirho[Decode source-bind upload and verify R2 readback]
    verify_chirho --> playback_chirho[Static saved-clip playback after requested passage finishes loading]
    playback_chirho --> listen_chirho[Listener reviews vowels stress and naturalness]
```

`ipa-trial-chirho/` under the domain folder holds ten app-authored, source-checked word examples:
the nine words in Proverbs 26:1 plus kol in Proverbs 1:13. This is a bounded Israeli Hebrew IPA
trial, not an all-corpus automatic converter or a claim of reconstructed Tiberian pronunciation.
Qere or source drift withholds a trial match. Notes remain drafts pending pronunciation review.
The original four clips and their receipt ledger remain intact. The fixed IPA variant of
`audition_chirho.ts` adds four clips (99 reserved credits), for 267 total under the existing
300-credit ceiling. Cached reruns were executed with fetch refusing every request: zero calls.
Provider input is separate from the unchanged Hebrew source binding; the reader and publisher
both verify IPA against the same checked records. Approved recordings retain priority; within
auditions the chapter phrasing recipe is preferred, then the earlier IPA trial. The local comparison page preserves the original inputs.

`ReaderShellChirho` marks initial passage restoration and later loading as pending. The
self-contained speech controller disables playback and stops active speech during that state,
so a fast click cannot read the default verse before a deep-linked passage has loaded.

```mermaid
flowchart TD
    locale_chirho[English or Spanish query then stored choice] --> chrome_chirho[Localized navigation grammar help cards and audio controls]
    locale_chirho -->|Spanish only| spanish_chirho[Fetch the pinned Spanish manifest and selected chapter]
    source_chirho[Verified original-language chapter hash] --> binding_chirho[Require the same source chapter identity and bytes]
    spanish_chirho --> binding_chirho
    binding_chirho -->|valid approved layer| glosses_chirho[Show approved Spanish word glosses separately from English provenance]
    binding_chirho -->|changed or missing| missing_chirho[Withhold the layer and keep the original readable]
    chrome_chirho --> preserve_chirho[Keep Hebrew Greek accents and canonical text exact]
```

The Spanish importer and source acquisition are documented in
`scripts-chirho/translations-chirho/README-chirho.md`. There is no runtime machine translation.
The 102 layers preserve gaps in approved source coverage; English notes and source quotations
retain their original language labels. The prerendered initial document is English; the chosen
locale applies during client hydration.

```mermaid
flowchart TD
    icons_chirho[Validated contextual icon records] --> selected_chirho[Preserve the selected illustration]
    selected_chirho --> senses_chirho[Group other records by reviewed sense and meaning label]
    senses_chirho --> variants_chirho[Keep same-sense drawings in provenance]
    senses_chirho --> distinct_chirho[Deduplicate other meanings and image paths or checksums]
    distinct_chirho -->|none| single_chirho[Single border with no meaning popup]
    distinct_chirho -->|present| double_chirho[Double border and captioned other meanings]
```

For mixed-sheet recovery, exact-context deferrals and independent worker alerts, see [art recovery](./art-recovery-chirho.md). Deferred cases never acquire an icon or count as completed semantic review.

### Study-aid explanations

The About page's localized `study-aids-chirho` section explains meaning sources, code-derived morphology, unassigned roots, contextual pictures, IPA and recording review. Each Hebrew/Greek word card links directly to it through `StudyAidLinkChirho`. `specificSourceNoteChirho` hides only known generic importer boilerplate; explicit source-review flags and unknown or word-specific notes remain in the card. Actual meanings, morphology, available root relationships, qere, pronunciation cautions, source codes and required license credits stay accessible.

```mermaid
flowchart TD
    detail_source_chirho[Source-bound word detail] --> specific_note_chirho{Specific caution or source-review flag}
    specific_note_chirho -->|yes| retain_note_chirho[Retain caution beside the affected word]
    specific_note_chirho -->|generic process| about_notes_chirho[Explain once in bilingual About section]
    detail_source_chirho --> compact_source_chirho[Meaning and compact source badge]
    compact_source_chirho --> about_link_chirho[Small About meanings and study aids link]
    about_link_chirho --> about_notes_chirho
```

### Source-bound chapter pronunciation trials

The October 30 chapter trial is limited to Proverbs 26 (28 verses) and John 1 (51 verses). Hebrew is an Israeli pronunciation draft prepared offline with HavarotJS 0.25.5, qere, source accents and 26 exact stress reviews for prepositive or duplicate poetic marks. Analysis copies may be sequenced by the library; canonical source text and matching keys remain code-point exact. Final qamats plus silent yod-vav is analysed across intervening marks. This is a bounded draft, not an all-Bible certified phonetic engine. John uses its exact accented Greek and the licensed native Modern Greek voice, without blanket IPA replacement.

`chapterRecipeChirho` checks every prepared Hebrew word against source, lemma, augment, morphology and spoken qere. Maqqef words stay in one IPA group. Atnach requests a short pause; paseq/revia requests a brief pause; ordinary groups use punctuation. Greek punctuation requests comparable phrase breaks. A warm delivery tag applies without rewriting words or imposing a cheerful interpretation. These are model-requested timing classes, not exact milliseconds or a cantillation melody. Eleven v4 supports inline IPA and audio tags, not SSML break tags, per its [official guidance](https://elevenlabs.io/docs/overview/capabilities/text-to-speech/best-practices).

```mermaid
flowchart TD
    chapter_source_chirho[Exact Proverbs 26 and John 1 sources] --> chapter_recipe_chirho[Source checked Hebrew IPA or accented Modern Greek]
    chapter_recipe_chirho --> chapter_plan_chirho[Fixed 79 verse requests and source hashes]
    prior_audio_chirho[Original 267 credit evidence kept intact] --> chapter_budget_chirho[New chapter ceiling 20000 included credits cumulative]
    chapter_plan_chirho --> chapter_budget_chirho
    chapter_budget_chirho --> chapter_guard_chirho[Check included balance stable model native voice and rate]
    chapter_guard_chirho --> chapter_ledger_chirho[Fsync request identity before synthesis]
    chapter_ledger_chirho --> chapter_cache_chirho[Store original MP3 and receipt once]
    chapter_ledger_chirho -->|uncertain result| chapter_hold_chirho[Keep request and continue independent verses without retry]
    chapter_hold_chirho -->|shared refusal or repeated failures| chapter_stop_chirho[Durable provider hold until owner reconciliation]
    chapter_cache_chirho --> chapter_decode_chirho[Decode and measure then publish static catalogue]
    chapter_decode_chirho --> chapter_r2_chirho[Content addressed R2 upload with identical readback]
    chapter_r2_chirho --> chapter_preview_chirho[Test exact preview and listener comparison]
```

The original 300-credit experiment remains immutable. New chapter work has a separate fixed 20,000-credit ceiling including its 267 historical credits; the initial whole-plan estimate is under 10,000 new credits. No billing setting or overage is enabled. Dry runs do no network work. Requested results never retry automatically, cached reruns make no synthesis call, source/storage failures stop dispatch, synthesis authentication/rate/billing refusals hold immediately, and three consecutive other provider failures persist a hold across restarts. Limits count newly reserved calls, including failed responses. Each request keeps its original identity even when independent verses continue.

The rejected naveh MP3 is identified by its exact SHA-256 in `audio-reviews-chirho.json`. The installer, playback loader and publisher refuse it even if an older catalogue claims approval. Only its delivery copy is retired; the original file, request, receipt and prior R2 object remain as rejected evidence. The replacement IPA has final-stressed /naˈve/; listener acceptance of that example does not approve every future word or recording.

Preparation: `bun scripts-chirho/audio-chirho/chapter-chirho/prepare_chapter_phonetics_chirho.ts --check-chirho`. The fixed synthesis command is `bun scripts-chirho/audio-chirho/chapter-chirho/chapter_audition_chirho.ts`, dry by default; `--apply-chirho --limit-chirho 2` makes the first sample in each language. `chapter_review_chirho.ts` builds a local cached listening page with earlier samples for comparison. The ordinary installer and publisher use the same recipe validator, and playback still makes no provider or database request.

The first chapter run stopped safely after 19 received clips when a subscription metadata GET returned HTTP 429, before another synthesis reservation. Owner verification matched all 19 MP3 hashes. The resumed engine verifies a native voice once per language per run, checks the included balance at most once per minute and subtracts local reservations between checks. Only metadata GET 429 responses may retry twice with a bounded Retry-After delay; a synthesis POST is never automatically repeated. The original rate-limit log and owner reconciliation remain in the trial evidence.

### Connected Hebrew and selectable Greek renditions

L.J.'s follow-up found v1 Hebrew's per-word gaps too long. `israeli-ipa-connected-v2-chirho` retains the exact checked phonemes but sends one IPA utterance, with major-clause punctuation and no inserted word-by-word pause tags. Its first Proverbs 26:1 sample is 4.32 seconds versus 8.40 seconds for v1. Maqqef still links its accentual group; it does not create a punctuation pause. This is a listener comparison, not acceptance of the whole chapter.

The final Greek chooser has two entries, Modern with Aspirates (preferred default) and Erasmian. The first retains modern vowels but supplies the reviewed initial /h/ breathings. The second is an explicit teaching convention (eta /eː/, chi /kʰ/, theta /θ/, ou /uː/), not a certified Classical reconstruction or ancient pitch claim. The exact-source profiles cover John 1:1–2. Earlier Modern Greek audio remains in provenance and the comparison page. It is not silently substituted for a chosen rendition with a rough breathing. Device fallback is allowed only when its Modern reading matches the selected convention, such as an unaspirated word; Erasmian never falls back to a Modern device voice.

The select lives above the verse transport and persists independently of the EN/ES interface. Changing rendition stops active audio. The 0.88 playback option is 12 percent slower than the saved file, with pitch preserved; the setting can change during recorded playback. Playback remains static and makes no provider/database call. Missing rendition recordings are labelled explicitly. Comparison availability is John 1:1–2, not all of John.

Two flow requests were capped at 300 new input credits and three Greek comparison requests at 500, while carrying forward all original receipts under the same cumulative 20,000-credit ceiling. Actual new reservations: 139 and 278, or 417; cumulative 10,660. No prior request was overwritten or retried. A source-path containment mistake refused the first flow invocation before a provider call; it was corrected to a fixed relative evidence path. The completed samples, original source and rejected timing version remain separately inspectable.

```mermaid
flowchart TD
    listener_flow_chirho[Listener rejects isolated Hebrew pacing] --> connected_flow_chirho[One source-bound IPA utterance]
    listener_style_chirho[Listener chooses Modern with Aspirates and Erasmian] --> greek_profiles_chirho[Two reviewed-source opening verse drafts]
    connected_flow_chirho --> small_budget_chirho[Fixed samples with cumulative historical credit evidence]
    greek_profiles_chirho --> small_budget_chirho
    small_budget_chirho --> sample_cache_chirho[Immutable original MP3 and receipt]
    sample_cache_chirho --> source_validate_chirho[Require recipe pronunciation and exact original source]
    source_validate_chirho --> choose_style_chirho[Localized persistent pronunciation select]
    choose_style_chirho --> available_style_chirho{Matching saved rendition available}
    available_style_chirho -->|yes| recorded_style_chirho[Play at chosen rate with pitch preserved]
    available_style_chirho -->|no| honest_gap_chirho[Withhold mismatched fallback and explain availability]
    recorded_style_chirho --> listener_review_chirho[Review vowels aspiration stress and connected phrasing]
```

## November 8 word-card usability

```mermaid
flowchart TD
    SourceChirho[Exact word source notes] --> SpecificChirho[Keep source-specific cautions; strip recognized process prose]
    SpecificChirho --> CommonChirho[Find sentences repeated on every card of this verse]
    CommonChirho --> FoldChirho[Show common caution once in folded verse Sources]
    CommonChirho --> CardChirho[Keep honest meaning availability and word-specific detail]
    CardChirho --> LinkChirho[Open and focus that source fold without changing passage URL]
    CardChirho --> BackChirho[Each card keeps its own sticky Back to verse link]
    BackChirho --> WordChirho[Return focus to the selected source word]
    ParseChirho[Sourced morphology] --> SummaryChirho[Visible card summary contains known fields and readable terms]
    ParseChirho --> AccessibleChirho[Existing screen-reader parse label remains unchanged]
```

`verseStudyNotesChirho` deduplicates only sentences shared by every word in a multi-word verse. A single-word note stays with its word. Missing glosses remain missing; no corpus or alignment data are repaired by presentation. The delegated word jump opens a details target before focusing it. Each card owns its Back link, including saved offline pages; focus scroll margins keep keyboard targets below the sticky link. `morphologySummaryLocalizedChirho` omits unknown/not-applicable fields from visible card prose while leaving the sourced parse, teaching cues and accessibility labels intact.

## November 10 word details and translation editions

```mermaid
flowchart TD
    fork_chirho[Bible Tools English Readers and English or Spanish Terse] --> capture_chirho[Capture exact chapter response and declared edition]
    capture_chirho --> align_chirho[Match the whole verse source sequence and bind to its chapter hash]
    align_chirho -->|exact| layer_chirho[Publish chapter layer with source identity and review status]
    align_chirho -->|missing or different words| omit_chirho[Leave that edition unavailable for the verse]
    layer_chirho --> fetch_chirho[Verify requested locale chapter bytes and ordered token identities]
    fetch_chirho --> radios_chirho[Offer available editions in Translation and remember the choice]
    radios_chirho --> annotation_chirho[Show edition glosses beneath their words]
    word_chirho[Source word] -->|hover or focus for 250 ms| tip_chirho[Show the current word meaning]
    word_chirho -->|activate| modal_chirho[Open its existing card in a dialog]
    modal_chirho -->|close| word_chirho
    modal_chirho -->|view in all words| lower_chirho[Restore and focus the lower card]
```

The browser loads the selected chapter layer on the same origin and caches at most four chapters. Translation and phonetics have separate saved choices. Missing editions and transliterations stay out of the choices. A saved choice applies when its data is available. Readers and Terse preserve the source word order, imported review status, and deliberate empty glosses. The display renders the source’s multiword separator as a space. The original word and recorded pronunciation identities do not change.

The online dialog renders the same card as the lower list. Escape returns focus to the word, and View in all words focuses the card. Offline snapshots preserve word-card jumps, the saved phonetic control, and available word meanings. The word panel groups both display choices beneath the source text. The scene panel keeps the verse transport, speed and image reporting together. On wider panels Previous, Play and Next share a row. Narrow panels keep Play above the two step buttons.
