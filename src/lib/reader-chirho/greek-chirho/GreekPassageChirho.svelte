<!-- For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life. — John 3:16 (KJV) -->
<script lang="ts">
	import { greekRunsChirho, type GreekLessonChirho } from '$lib/domain-chirho/greek-chirho';
	import type { ContextualIconChirho } from '$lib/domain-chirho/media-chirho';
	import { referenceChirho } from '$lib/i18n-chirho/labels-chirho';
	import { localeStateChirho } from '$lib/i18n-chirho/locale-state-chirho.svelte';
	import { readerTChirho } from '$lib/i18n-chirho/reader-messages-chirho';
	import type { SpanishLayerChirho } from '$lib/i18n-chirho/spanish-glosses-chirho';
	import GreekWordChirho from './GreekWordChirho.svelte';
	let {
		lessonChirho,
		iconsChirho = {},
		spanishLayerChirho = null
	}: {
		lessonChirho: GreekLessonChirho;
		iconsChirho?: Record<string, ContextualIconChirho>;
		spanishLayerChirho?: SpanishLayerChirho | null;
	} = $props();
	let meaningsOpenChirho = $state(false);
	const runsChirho = $derived(greekRunsChirho(lessonChirho));
</script>

<button
	class="meaning-toggle-chirho"
	type="button"
	aria-expanded={meaningsOpenChirho}
	onclick={() => (meaningsOpenChirho = !meaningsOpenChirho)}
	>{readerTChirho(meaningsOpenChirho ? 'hide_meanings_chirho' : 'show_meanings_chirho')}</button
>
<!-- Only canonical gaps add source whitespace. Remove annotations to reconstruct the verse. -->
<!-- prettier-ignore -->
<div class="verse-chirho greek-verse-chirho" dir="ltr" lang="grc" role="group" aria-label={readerTChirho('verse_cues_label_chirho', { reference_chirho: referenceChirho(lessonChirho.id_chirho, localeStateChirho.currentChirho) })}>{#each runsChirho as runChirho, indexChirho (indexChirho)}{#if runChirho.token_chirho}<GreekWordChirho tokenChirho={runChirho.token_chirho} textChirho={runChirho.text_chirho} iconChirho={iconsChirho[runChirho.token_chirho.id_chirho]} spanishGlossChirho={spanishLayerChirho?.glossesChirho[runChirho.token_chirho.id_chirho] ?? null} {meaningsOpenChirho} />{:else}{runChirho.text_chirho}{/if}{/each}</div>

<style>
	.meaning-toggle-chirho {
		border: 1px solid #d9dfd3;
		background: #fcfcf8;
		color: #4c5c50;
		border-radius: 5px;
		padding: 7px 10px;
		cursor: pointer;
	}
	.meaning-toggle-chirho:focus-visible {
		outline: 3px solid #3a5682;
		outline-offset: 3px;
	}
	.greek-verse-chirho {
		text-align: left;
	}
</style>
