<!-- For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life. — John 3:16 (KJV) -->
<script lang="ts">
	import WordIpaChirho from '../audio-chirho/WordIpaChirho.svelte';
	import SpeechButtonChirho from '../audio-chirho/SpeechButtonChirho.svelte';

	import { greekCategoryChirho, type GreekTokenChirho } from '$lib/domain-chirho/greek-chirho';
	import { greekAnalysisLocalizedChirho } from '$lib/i18n-chirho/labels-chirho';
	import { localeStateChirho } from '$lib/i18n-chirho/locale-state-chirho.svelte';
	import { readerTChirho } from '$lib/i18n-chirho/reader-messages-chirho';
	import { greekCuesChirho } from '$lib/domain-chirho/greek-cues-chirho';
	import { greekCueHelpChirho } from '$lib/i18n-chirho/cue-help-chirho';
	import HelpChirho from '../HelpChirho.svelte';
	import { paletteChirho } from '$lib/domain-chirho/cues-chirho';
	import type { ContextualIconChirho } from '$lib/domain-chirho/media-chirho';
	import IconChirho from '../IconChirho.svelte';
	let {
		tokenChirho,
		textChirho,
		iconChirho,
		spanishGlossChirho = null,
		meaningsOpenChirho
	}: {
		tokenChirho: GreekTokenChirho;
		textChirho: string;
		iconChirho?: ContextualIconChirho;
		// The approved Spanish gloss, offered only while the interface is Spanish.
		spanishGlossChirho?: string | null;
		meaningsOpenChirho: boolean;
	} = $props();
	const categoryChirho = $derived(greekCategoryChirho(tokenChirho));
	const cuesChirho = $derived(greekCuesChirho(tokenChirho));
	const colorChirho = $derived(
		categoryChirho === 'noun'
			? paletteChirho.noun_chirho
			: categoryChirho === 'verb'
				? paletteChirho.verb_chirho
				: categoryChirho === 'adjective'
					? paletteChirho.adjective_chirho
					: paletteChirho.particle_chirho
	);
	const backgroundChirho = $derived(
		tokenChirho.gender_chirho === 'masculine'
			? paletteChirho.masculine_chirho
			: tokenChirho.gender_chirho === 'feminine'
				? paletteChirho.feminine_chirho
				: tokenChirho.gender_chirho === 'neuter'
					? '#ecefe9'
					: 'transparent'
	);
</script>

{#snippet markerHelpChirho(slotChirho: 'left' | 'center' | 'right', markerChirho: string)}
	{@const helpChirho = greekCueHelpChirho(tokenChirho, slotChirho, localeStateChirho.currentChirho)}
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

<!-- The cue row reserves intrinsic space, so short participles cannot collide with their case. -->
<!-- prettier-ignore -->
<span class="word-unit-chirho"><span class="sr-only-chirho" data-annotation-chirho lang={localeStateChirho.currentChirho}>{greekAnalysisLocalizedChirho(tokenChirho, localeStateChirho.currentChirho)}. </span><span class="word-pronunciation-chirho"><span class="word-surface-chirho greek-word-surface-chirho" style:background={backgroundChirho} style:border-bottom-color={tokenChirho.number_chirho === 'plural' ? paletteChirho.plural_chirho : 'transparent'}>{#if cuesChirho.left_chirho}<sup class="greek-cue-chirho greek-cue-left-chirho" data-greek-cue-chirho="tense-voice" data-annotation-chirho>{@render markerHelpChirho('left', cuesChirho.left_chirho)}</sup>{/if}{#if cuesChirho.center_chirho}<sup class="greek-cue-chirho greek-cue-center-chirho" data-greek-cue-chirho="case" data-annotation-chirho>{@render markerHelpChirho('center', cuesChirho.center_chirho)}</sup>{/if}{#if cuesChirho.right_chirho}<sup class="greek-cue-chirho greek-cue-right-chirho" data-greek-cue-chirho="person-mood" data-annotation-chirho>{@render markerHelpChirho('right', cuesChirho.right_chirho)}</sup>{/if}<a class="word-jump-chirho" id="verse-word-{tokenChirho.id_chirho}-chirho" href="#word-card-{tokenChirho.id_chirho}-chirho" data-word-jump-chirho="word-card-{tokenChirho.id_chirho}-chirho"><span class="greek-source-word-chirho" data-source-word-chirho>{textChirho}</span></a></span><SpeechButtonChirho tokenIdChirho={tokenChirho.id_chirho} textChirho={tokenChirho.text_chirho} languageChirho="grc" wordChirho compactChirho /></span><WordIpaChirho {tokenChirho} languageChirho="grc" /><IconChirho {iconChirho} tokenIdChirho={tokenChirho.id_chirho} posChirho={categoryChirho} {colorChirho} />{#if meaningsOpenChirho}<span class="meaning-chirho" data-annotation-chirho lang={localeStateChirho.currentChirho}>{#if spanishGlossChirho}{readerTChirho('top_meaning_spanish_chirho')} <span lang="es">{spanishGlossChirho}</span>{:else}{readerTChirho('top_meaning_berean_chirho')} {#if tokenChirho.gloss_chirho === null}{readerTChirho('meaning_unavailable_short_chirho')}{:else if tokenChirho.gloss_chirho === '-'}{readerTChirho('not_separately_short_chirho')}{:else}<span lang="en">{tokenChirho.gloss_chirho}</span>{/if}{/if}</span>{/if}</span>

<style>
	.word-jump-chirho {
		display: flex;
		grid-column: 1 / -1;
		grid-row: 2;
		justify-content: center;
	}
	.greek-word-surface-chirho {
		display: inline-grid;
		grid-template-columns: 1fr auto 1fr;
		grid-template-rows: 16px auto;
		column-gap: 6px;
		row-gap: 2px;
	}
	.greek-word-surface-chirho .greek-cue-chirho {
		position: static;
		grid-row: 1;
		align-self: end;
		font-variant-numeric: lining-nums;
	}
	.greek-cue-left-chirho {
		grid-column: 1;
		justify-self: start;
	}
	.greek-cue-center-chirho {
		grid-column: 2;
		justify-self: center;
	}
	.greek-cue-right-chirho {
		grid-column: 3;
		justify-self: end;
	}
	.greek-source-word-chirho {
		text-align: center;
	}
	.meaning-chirho {
		max-width: 8rem;
		font: 11px/1.4 sans-serif;
		color: #4c5c50;
		text-align: center;
	}
</style>
