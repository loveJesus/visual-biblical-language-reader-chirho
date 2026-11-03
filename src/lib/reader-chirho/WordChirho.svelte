<!-- For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life. — John 3:16 (KJV) -->
<script lang="ts">
	import PronunciationNoteChirho from './audio-chirho/PronunciationNoteChirho.svelte';
	import SpeechButtonChirho from './audio-chirho/SpeechButtonChirho.svelte';
	import { spokenWordChirho } from '$lib/domain-chirho/pronunciation-chirho';

	import { cuesChirho } from '$lib/domain-chirho/cues-chirho';
	import { hebrewCueHelpChirho } from '$lib/i18n-chirho/cue-help-chirho';
	import { morphologyLabelLocalizedChirho } from '$lib/i18n-chirho/labels-chirho';
	import { localeStateChirho } from '$lib/i18n-chirho/locale-state-chirho.svelte';
	import { readerTChirho } from '$lib/i18n-chirho/reader-messages-chirho';
	import type { TokenChirho } from '$lib/domain-chirho/lesson-chirho';
	import HelpChirho from './HelpChirho.svelte';
	import IconChirho from './IconChirho.svelte';
	import type { ContextualIconChirho } from '$lib/domain-chirho/media-chirho';
	let { tokenChirho, iconChirho }: { tokenChirho: TokenChirho; iconChirho?: ContextualIconChirho } =
		$props();
	const cueChirho = $derived(cuesChirho(tokenChirho));
</script>

{#snippet markerHelpChirho(slotChirho: 'state' | 'stem' | 'conjugation', markerChirho: string)}
	{@const helpChirho = hebrewCueHelpChirho(
		tokenChirho,
		slotChirho,
		localeStateChirho.currentChirho
	)}
	{#if helpChirho}<HelpChirho
			idChirho="cue-{tokenChirho.id_chirho}-{slotChirho}"
			labelChirho={helpChirho.label_chirho}
			helpChirho={helpChirho.help_chirho}
			langChirho={helpChirho.lang_chirho}
			styleChirho="cue-help-chirho"
			><span aria-hidden="true">{markerChirho}</span><span
				class="sr-only-chirho"
				lang={helpChirho.lang_chirho}>{helpChirho.label_chirho}</span
			></HelpChirho
		>{:else}{markerChirho}{/if}
{/snippet}

<!-- Whitespace between source characters is significant; keep these two rendering blocks exact. -->
<!-- prettier-ignore -->
{#snippet surfaceChirho()}<span class="word-surface-chirho" class:verb-cues-chirho={Boolean(cueChirho.stem_marker_chirho && cueChirho.conjugation_marker_chirho)} class:pattern-solid-chirho={cueChirho.pattern_chirho === 'solid'} class:pattern-dotted-chirho={cueChirho.pattern_chirho === 'dotted'} style:background={cueChirho.background_chirho} style:border-bottom-color={cueChirho.number_color_chirho}>{#if cueChirho.state_marker_chirho}<sup class="state-marker-chirho" data-annotation-chirho>{@render markerHelpChirho('state', cueChirho.state_marker_chirho)}</sup>{/if}{#if cueChirho.stem_marker_chirho}<sup class="stem-marker-chirho" data-annotation-chirho>{@render markerHelpChirho('stem', cueChirho.stem_marker_chirho)}</sup>{/if}{#if cueChirho.conjugation_marker_chirho}<sup class="conjugation-marker-chirho" data-annotation-chirho>{@render markerHelpChirho('conjugation', cueChirho.conjugation_marker_chirho)}</sup>{/if}<a class="word-jump-chirho" href="#word-card-{tokenChirho.id_chirho}-chirho" data-word-jump-chirho="word-card-{tokenChirho.id_chirho}-chirho"><span data-source-word-chirho>{#each tokenChirho.segments_chirho as segmentChirho, indexChirho (indexChirho)}{#if indexChirho > 0}<span class="affix-dot-chirho" data-annotation-chirho aria-hidden="true">·</span>{/if}{segmentChirho}{/each}</span></a></span>{/snippet}

<!-- prettier-ignore -->
<span class="word-unit-chirho"><span class="sr-only-chirho" dir="ltr" lang={localeStateChirho.currentChirho} data-annotation-chirho>{morphologyLabelLocalizedChirho(tokenChirho, localeStateChirho.currentChirho)}. </span><span class="word-pronunciation-chirho">{@render surfaceChirho()}<SpeechButtonChirho tokenIdChirho={tokenChirho.id_chirho} textChirho={spokenWordChirho(tokenChirho)} languageChirho="he" unavailableChirho={tokenChirho.source_language_chirho === "arc"} wordChirho compactChirho /><PronunciationNoteChirho {tokenChirho} markerChirho /></span>{#if cueChirho.pattern_chirho !== 'none' && tokenChirho.form_note_chirho}<span data-annotation-chirho class="form-help-chirho"><HelpChirho idChirho="form-{tokenChirho.id_chirho}" labelChirho={readerTChirho('form_pattern_chirho')} helpChirho="{tokenChirho.form_note_chirho.text_chirho} Source: {tokenChirho.form_note_chirho.source_chirho}" helpLangChirho="en" styleChirho="word-help-chirho"><span aria-hidden="true">?</span><span class="sr-only-chirho" lang={localeStateChirho.currentChirho}>{readerTChirho('form_pattern_chirho')}</span></HelpChirho></span>{/if}<IconChirho {iconChirho} tokenIdChirho={tokenChirho.id_chirho} posChirho={tokenChirho.pos_chirho} colorChirho={cueChirho.pos_color_chirho} /></span>
