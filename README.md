<!-- For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life. — John 3:16 (KJV) -->

# Hinneh

Hinneh's original code is licensed under GPL-3.0-or-later. Hinneh-created media and the media rights we hold are shared under CC BY 4.0. Third-party Bible texts, linguistic data, glosses and adapted grammar material retain their own licenses. See LICENSE and LICENSES-chirho/README-chirho.md for the scope and credits.

Behold the Bible in its original languages at https://hinneh.us/. Hinneh is a free visual reader with all 66 books in its pinned Hebrew/Greek editions, compact grammar cues, word pictures and reusable pronunciation recordings. Proverbs, John and Genesis also have extensive verse illustrations. The interface is English or Spanish. A fresh visit offers an introduction and starts the reader at the Proverbs chapter matching the visitor's local day; explicit passage links take precedence. Media and Spanish-gloss coverage remain incomplete and are identified honestly.

Canonical Hebrew/Greek code points stay unchanged. Lower Look closer cards open meaning and morphology by default; the separate translation and reading-line meanings remain optional. Word text opens its card, while the small corner sound button plays pronunciation. Sources, review status, withheld meanings and pronunciation cautions remain reachable.

## Local development

```bash
bun install --frozen-lockfile
bun run dev --host 127.0.0.1
```

Open http://127.0.0.1:5173/. Artwork and saved word audio stream through Hinneh's existing public delivery routes during local development; there is no need to bundle the generated media or supply a speech-provider key merely to read or listen. Local Worker-binding preparation creates no cloud resource. The live Turnstile widget is scoped to the public hostname; local/mock checks are distinct from a genuine hosted challenge. Production and generation tools require the operator's own credentials and explicit authority.

## Data and provenance

Pinned OSHB/WLC supplies Hebrew text and morphology; Nestle 1904 supplies Greek text, lemmas and parsing. English OT and approved Spanish layers use pinned GBT exports. John's English meanings are Berean Interlinear glosses, labelled by provenance. A gloss is not automatically a sentence translation or proof of original authorship. Sources and licence/attribution records appear in the reader.

Hebrew augments and exact Greek lexical forms distinguish homographs. Checked contextual pictures override general lemma defaults; general defaults make no claim that each target context has been reviewed. Repeated drawings of one meaning do not create an alternative-sense border. Root relationships and unresolved source questions are preserved honestly. Generated art and AI pronunciation still carry their own review boundaries.

The checked-in chapters let the reader build without downloading upstream data. To reproduce cold imports, first run the pinned acquisition scripts described in the import/corpus/translation READMEs. The public source cut omits GBT's matching-only `hbo+grc` alignment exports, whose license statement does not itemize those files; the importer acquires them from their recorded public upstream revisions. Then check the imports:

```bash
python3 -I -B scripts-chirho/import-chirho/import_lesson_chirho.py --check
python3 -I -B scripts-chirho/corpus-chirho/build_corpus_chirho.py --check
python3 -I -B scripts-chirho/translations-chirho/build_spanish_glosses_chirho.py --check
```

These imports are offline and hash-gated. Their acquisition scripts separately compare pinned public upstream bytes. Do not format or normalize vendored sources or generated chapters. See the import/corpus READMEs for handling rules, licence evidence and source exceptions.

## Artwork storage and reports

Persistent artwork lives in the private `hinneh-media-chirho` R2 bucket. Public images are compressed lossy WebP: scenes at most 1200 pixels wide and icons at most 128×128. Exact originals, held outputs and sheets remain privately archived for recovery. Local source/request/review metadata and hashed recovery receipts are retained; temporary raster bytes are retired after checked remote preservation.

The reader's static bundle contains no artwork files. A release-pinned Worker allowlist serves verified artwork and word-audio delivery objects from R2 through an edge cache. Unknown media paths, HEAD and unchanged ETags need no R2 object read. Source text and catalogues remain static assets. There is no D1 binding or request-time generation. The flag intake uses a real Turnstile challenge, strict hostname/action validation and a deduplicated private R2 queue, without storing visitor IPs, challenge tokens, email or free text in reports.

Scenes and word-picture cards have a Report image issue button. The owner reviews each real report before preparing a checked high-quality internal replacement. Reports do not directly trigger generation, spend, retry resets or approval; the current image stays until a replacement is ready. Controlled owner acceptance-test reports are explicitly marked in triage metadata and never become regeneration jobs.

For deliberate inspection of an archived style image without keeping it on disk:

```bash
bun scripts-chirho/publish-chirho/r2-chirho/with-artwork-chirho.ts static/assets-chirho/proverbs-26-1-scene-chirho.webp -- magick identify static/assets-chirho/proverbs-26-1-scene-chirho.webp
```

The wrapper restores exact verified bytes only for the command and removes the unchanged temporary file afterward. Its private archive tooling requires the operator's credentials and recovery receipts. Unknown results and exhausted layout budgets remain held.

See `spec-chirho/workflows-chirho/media-delivery-chirho.md`, `art-recovery-chirho.md` and `shared-icons-chirho.md` for publication, retirement and recovery workflows. Do not restart an old uploader that assumes a local raster mirror.

## Offline export

With a local server running, export to a new filename:

```bash
bun scripts-chirho/export-chirho/offline_chirho.ts workspace-chirho/previews-chirho/NEW-hinneh-preview-chirho.html http://127.0.0.1:5173
```

The exporter verifies and embeds the saved passage's R2 images and styles, refuses to overwrite a file, and removes online report controls. Reading that deliberately saved HTML needs no network; ordinary external attribution/lemma links still require one. It is a frozen snapshot, not a PWA.

## Verification and publication

```bash
bun run check
bun run lint
bun run test:unit --run
CHOKIDAR_USEPOLLING=true CHOKIDAR_INTERVAL=10000 bun run test:e2e
```

Tests cover source reconstruction, contextual identity, pronunciation/source bindings, responsive layout, accessible help/navigation, bounded guest reports, R2 cache behavior, private-file refusals and offline export. Human art, linguistic and screen-reader acceptance remain separate from automated results. Temporary browser captures go under ignored test output.

The native SwiftUI iOS and Kotlin/Compose Android readers are under apps-chirho/. Their READMEs give local build/test commands and the current feature and device limits. Signing and app-store distribution require the developer's own accounts.

Hinneh is offered freely as a Christian ministry. See https://sellingjesus.org/ for the conviction that ministry should be supported rather than sold. For contributions and reuse, preserve source code licenses, upstream attribution and review states. Publishing or funding your own media/generation pipeline is separate from reading the existing site.

## Public source cut

The public `main_chirho` branch is a reviewed source mirror. It includes the web and native app sources, tests, public corpus/catalogues, build configuration, license notices and workflow documentation. Credentials, private authoring queues, provider receipts, operational progress history, generated media bytes and native build outputs are excluded. Images and recordings remain available through the public reader's delivery routes.

The owner prepares a new cut with `scripts-chirho/site-chirho/prepare_public_source_chirho.ts`, verifies its exact path/hash manifest and secret scan, and tests that isolated source before publishing. A source cut never exports the private checkout's Git history. Contributors can build and test the public branch normally; creating or funding a private generation pipeline is optional.
