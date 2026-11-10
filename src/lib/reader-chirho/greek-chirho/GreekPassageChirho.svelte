<!-- For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life. — John 3:16 (KJV) -->
<script lang="ts">
	import { greekRunsChirho, type GreekLessonChirho } from '$lib/domain-chirho/greek-chirho';
	import type { ContextualIconChirho } from '$lib/domain-chirho/media-chirho';
	import { referenceChirho } from '$lib/i18n-chirho/labels-chirho';
	import { localeStateChirho } from '$lib/i18n-chirho/locale-state-chirho.svelte';
	import { readerTChirho } from '$lib/i18n-chirho/reader-messages-chirho';
	import GreekWordChirho from './GreekWordChirho.svelte';
	let {
		lessonChirho,
		iconsChirho = {}
	}: {
		lessonChirho: GreekLessonChirho;
		iconsChirho?: Record<string, ContextualIconChirho>;
	} = $props();
	const runsChirho = $derived(greekRunsChirho(lessonChirho));
</script>

<!-- Only canonical gaps add source whitespace. Remove annotations to reconstruct the verse. -->
<!-- prettier-ignore -->
<div class="verse-chirho greek-verse-chirho" dir="ltr" lang="grc" role="group" aria-label={readerTChirho('verse_cues_label_chirho', { reference_chirho: referenceChirho(lessonChirho.id_chirho, localeStateChirho.currentChirho) })}>{#each runsChirho as runChirho, indexChirho (indexChirho)}{#if runChirho.token_chirho}<GreekWordChirho tokenChirho={runChirho.token_chirho} textChirho={runChirho.text_chirho} iconChirho={iconsChirho[runChirho.token_chirho.id_chirho]} />{:else}{runChirho.text_chirho}{/if}{/each}</div>

<style>
	.greek-verse-chirho {
		text-align: left;
	}
</style>
