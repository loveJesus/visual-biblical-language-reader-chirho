<!-- For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life. — John 3:16 (KJV) -->

# Reader welcome and local preferences

The welcome is one short screen, acknowledged once per deliberate welcome-content revision. A deployment hash and periodic media refresh never change this revision. Start reading is primary; the optional tutorial is reachable from Help. The welcome requests neither tutorial MP4 bytes nor audio playback. Info links to the existing About study-aids and license information.

```mermaid
flowchart TD
  LaunchChirho[Cold browser mount] --> ExplicitChirho{Valid passage fragment?}
  ExplicitChirho -->|Yes| LinkedChirho[Open linked passage quietly]
  ExplicitChirho -->|No| TodayChirho{Open today's Proverbs?}
  TodayChirho -->|On| DailyChirho[Local-day Proverbs chapter verse 1]
  TodayChirho -->|Off| SavedChirho{Valid saved passage?}
  SavedChirho -->|Yes| ResumeChirho[Resume saved passage quietly]
  SavedChirho -->|No| DailyChirho
  LinkedChirho --> VerifiedChirho[Validate and display source]
  DailyChirho --> VerifiedChirho
  ResumeChirho --> VerifiedChirho
  VerifiedChirho --> RememberChirho[Replace single saved passage]
  NavigateChirho[Explicit chooser button or swipe] --> IntentChirho[New generation cancels prior intent]
  IntentChirho --> ReadyChirho{Same-generation text scene verification media and audio settled?}
  ReadyChirho -->|Yes| OptedChirho{Autoplay on and welcome closed?}
  OptedChirho -->|Yes| OnceChirho[Consume intent once]
  OnceChirho --> SelectorChirho[Existing verified Play selector]
  SelectorChirho --> BlockedChirho{Browser playback blocked?}
  BlockedChirho -->|Yes| ManualChirho[Manual Play remains available]
```

Autoplay appears once beside Speed in the media controls, with a compact Problems disclosure beneath it. The existing session object remains its only storage and navigation-intent owner. Top Settings retains the start-today choice. The disclosure gives Safari site settings, Firefox audio/video permission and Chrome/Edge first-interaction guidance; changing the switch never changes browser permissions.

Preferences use local storage only. Today and autoplay default on; an explicitly saved false keeps either preference off. Storage denial falls back to these defaults without preventing reading, and choices still work for the current visit. Only a successfully validated source replaces the single last-passage value. Neither foregrounding, hash restoration, retry, rendition changes nor closing the welcome creates an autoplay intent.

After mounting, the pure mobile-store helper selects an existing App Store link for iPhone, iPad, iPod or touch-enabled desktop-mode iPadOS, or an existing Google Play link for Android. Desktop, unknown and legacy Windows Phone browsers receive no mobile suggestion. The matching optional link appears only in Welcome and Help; the tutorial remains available. Browser properties are used locally for this display hint, without network lookups, tracking or device persistence. A store opens only when the reader chooses its link.

Scene passes its current canonical verification readiness through the shared controls snippet. AudioVerse reports its captured navigation generation and lesson identity only after both recordings and that scene check settle. A rejected scene check permits the existing audio fallback; a pending check cannot consume the video opportunity. A later passage cancels the pending check and its autoplay intent. The shell also waits for settled media and verified source, then invokes the existing verse Play control once. This preserves the normal video/human/synthetic/assembled-word selection, speed, rendition, failure fallback and cancellation rules. A stale first-A callback cannot consume the newest A after A/B/A navigation. A settled verse with no available playback consumes the intent without playing; a later periodic media refresh cannot revive it. Manual audio/Stop/rendition actions, a newer passage, disabling autoplay, hiding the page and component destruction cancel pending intent. Opening a word card keeps the currently playing reading.

The tutorial is a separate prerendered page with a lazy EN/ES manifest, user-controlled MP4, captions and transcript. Its videos remain separate from canonical Bible verse media. Changing language, leaving the route or hiding the document explicitly pauses/releases the tour's player. Root's tutorial delivery workflow validates the two archived videos and companions before publication.

Unattended playback tests force the native media gain to zero before every play and block device speech. Silent decoding, rate and cancellation checks are not audible or listener acceptance.

The main verse action uses the same selected reading and matching visible-video predicate as playback. It says Play verse video only when the next Play uses that video, Listen to verse for audio/assembled words, and Stop while active. A failed visit-local video changes the next action to audio without replacing the failure status. Labels-only observer updates notice matching video insertion/hash changes, ignore their own text writes, and preserve the controller's self-contained offline form.

A NotAllowedError from the browser restores idle controls and offers a short localized prompt to tap Play. It does not mark a verified video as failed: manual Play retries that same video. Other playback or media errors retain the existing visit-local video failure and next-Play audio fallback. Stale rejection callbacks cannot change a newer play.

## Welcoming artwork and one media transport

The welcome uses one adopted CC0 watercolor hero, a short introduction, two read-only source-bound word examples from the existing home preview, and an always reachable Start reading action. Only Start reading is pinned in the footer. The hero, examples, optional tour, Info, matching mobile store link and license note scroll together on small-height or enlarged-text screens. The examples are text, never inactive buttons or automatic speaker requests.

The hero's sole static path, bytes, SHA-256 and dimensions live in the shared welcome-hero constants. The release classifier accepts only that exact onboarding path. A real source tree containing the welcome requires the adopted WebP; byte substitution or different dimensions refuse the release. Root preserves originals and derivatives before publication. The hero is UI artwork, never a canonical verse scene, chapter video or permission to expand a provider budget.

```mermaid
flowchart TD
  SourceChirho[Verified verse and selected reading] --> MediaChirho[One fixed scene or video slot]
  MediaChirho --> PrimaryChirho[One primary verse control directly below art]
  PrimaryChirho --> VideoChirho{Matching valid video?}
  VideoChirho -->|Yes| PlayVideoChirho[Existing synchronized video selector]
  VideoChirho -->|No| PlayAudioChirho[Existing recorded or complete-word reading selector]
  PrimaryChirho --> OptionsChirho[Existing speed pronunciation IPA and status]
```

The same AudioVerse instance supplies the one primary action for either media path, with selectors and status retained. Scene has no duplicate caption Play. Below-art placement is shared by Hebrew and Greek; on narrow screens artwork and its transport precede the source words. The visible action keeps its selected-media label and Stop behavior. Scene/reading validation, failure fallback, cancellation, word speakers and pronunciation choices are unchanged.
