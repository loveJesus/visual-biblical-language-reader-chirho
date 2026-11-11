<!-- For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life. — John 3:16 (KJV) -->

# Static word study and database cost

```mermaid
flowchart TD
  EditionsChirho[Existing frozen EN and ES edition manifest] --> VerifyChirho[Verify each chapter SHA and exact content binding]
  VerifyChirho --> AlignChirho[Check token IDs and source text in order]
  AlignChirho --> CountChirho[Offline lemma counts and all unique verse references per label]
  CountChirho --> ShardChirho[64 SHA-partitioned shards per available edition]
  ShardChirho --> PublishChirho[Normal atomic static release]
  OpenChirho[Open one word modal] --> IndexChirho[Small index revalidated at most once per five minutes]
  IndexChirho --> FetchChirho[One current-edition shard with immutable content-hash URL]
  FetchChirho --> CheckChirho[Check exact path bytes SHA edition and count conservation]
  CheckChirho --> CacheChirho[Deduplicated eight-entry LRU shared across word modals]
  CacheChirho --> ChartChirho[Distribution list filters pagination and verse links]
  FilterChirho[Filter or change list page] --> ChartChirho
  FailChirho[Network or verification failure] --> QuietChirho[Keep word details and offer retry; ten-second failure cooldown]
```

`word_study_chirho.py` is an offline build tool. It reads only local content and already imported edition data. Every source chapter is hash-bound to the edition manifest; each edition must contain the same tokens and text in the same order. Lemma keys preserve Hebrew homograph augments and separate Hebrew H identifiers from Greek G identifiers. The full indexed source corpus supplies occurrence denominators. Missing edition verses remain outside coverage; aligned empty labels remain counted as empty, never invented translations. Exact trimmed labels retain capitalization, punctuation and prefix/phrase wording. Only the translation-bearing uses enter the pie denominator. These distributions describe imported word-linked draft editions, not interchangeable dictionary senses or a translation review.

Regenerate into a new staging directory with `python3 scripts-chirho/import-chirho/word_study_chirho.py --static-chirho static --output-chirho <staging-study-chirho>`, verify, then land the new manifest and hash-named shards together. The edition manifest SHA binds provenance. At a future data update, old shards can be retired from the source tree only after their replacement manifest is available; each normal deployment remains coherent and old browser caches stay isolated by SHA. Do not append an unbounded historical shard archive to production.

The study UI lives only in the word modal. Opening the lower all-words list does not download study data. Language and edition are explicit; Spanish currently offers Terse, English Readers and Terse. A stale asynchronous result cannot populate a different word or language. Search and pagination work entirely in the bounded loaded record. References retain the reader's passage URL and use explicit navigation on a plain click, respecting saved Autoplay. Other translations expands into paged labels; each label has eight references per page, total pages and unique verse totals. Repeated uses within one verse remain separate occurrence counts, not duplicate links. Existing morphology, lexical links and the complete lower word list remain available.

The index is at most 100,000 bytes. Any single shard must be at most 2,000,000 bytes, with exact declared length and SHA. Eight cache entries bound retained data and concurrent requests; only settled entries are evicted, so pending requests are not duplicated. Failed shard promises are shared for ten seconds; changed index bindings use a different cache key. Shards use `Cache-Control: public, max-age=31536000, immutable`; the small index uses `no-cache`. No new browser persistent database or local-storage corpus is created.

Production reader content is static. The publish configuration routes study JSON directly through Workers Static Assets, without invoking the artwork/API Worker. The source tree has no D1 query path, and the November 11 read-only live Worker settings check confirms assets, R2 and secret bindings with no D1 binding. Accordingly this feature performs zero D1 reads/writes or request-time SQL aggregation. There is no production SQL query plan or D1 index to optimize for this path. If a future separate backend adds D1, review its actual query plans and access patterns then; do not introduce a database merely to cache this static corpus.

## Contexts, previews and playback

```mermaid
flowchart TD
  HoverChirho[Hover or focus a verse reference for 250 ms] --> ChapterChirho[Deduplicated verified source and edition chapter]
  ChapterChirho --> PreviewChirho[Original plus current-interface translation]
  ExamplesChirho[Up to eight varied forms of the exact lemma] --> ChapterChirho
  ChapterChirho --> ExcerptChirho[Exact token offsets bold matches and three neighbors each side]
  ExcerptChirho --> OriginalChirho[Explicit published whole-verse recording]
  ExcerptChirho --> DeviceChirho[Explicit installed local interface voice]
  OriginalChirho --> OwnerChirho[One playback owner stops main reader and prior context]
  DeviceChirho --> OwnerChirho
  CloseChirho[Close modal hide page or main Play] --> StopChirho[Cancel release and ignore stale events]
```

The eight-chapter source cache and four-chapter edition client reuse verified static content; requests in flight are shared, settled entries alone are evicted, and failures have a ten-second cooldown. Tooltips request metadata only, never an MP3. Escape first dismisses the visible preview. Context rows load when approaching the viewport and sit below the translation references, so later examples do not shift those links away from a pointer.

Context selection favors distinct forms, chapters and books among the source-bound examples. It matches lemma identity including Hebrew homograph augments, never an inferred root. Exact source offsets preserve punctuation; up to three neighboring tokens appear each side, with ellipses only at clipped edges. Matching original and aligned edition words are bold. If no edition exists in the interface language, no different-language edition is substituted.

Original playback uses admitted published recordings and the saved Greek pronunciation; an incompatible or missing recording stays unavailable. Human reading offsets follow the source window. Playback startup is bounded to fifteen seconds; failure releases the player and permits a new explicit attempt. Translation playback uses installed local-service voices only, clearly identified as device voices, and is unavailable without one. No new generation, paid voice service, D1 query or autoplay on modal opening occurs. The main reader and examples share a stop signal, so only one plays. Natural end, repeated Play, closing the modal, page hiding or main playback releases it; stale events cannot cancel a newer play. Silent decoder checks and mocked device voice tests are not listener acceptance.
