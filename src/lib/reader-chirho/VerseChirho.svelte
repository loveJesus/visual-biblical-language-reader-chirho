<!-- For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life. — John 3:16 (KJV) -->
<script lang="ts">
	import { sourceRunsChirho, type LessonChirho } from '$lib/domain-chirho/lesson-chirho';
	import WordChirho from './WordChirho.svelte';
	import { referenceChirho } from '$lib/i18n-chirho/labels-chirho';
	import { localeStateChirho } from '$lib/i18n-chirho/locale-state-chirho.svelte';
	import { readerTChirho } from '$lib/i18n-chirho/reader-messages-chirho';
	import type { ContextualIconChirho } from '$lib/domain-chirho/media-chirho';
	let {
		lessonChirho,
		iconsChirho = {}
	}: { lessonChirho: LessonChirho; iconsChirho?: Record<string, ContextualIconChirho> } = $props();
	const runsChirho = $derived(sourceRunsChirho(lessonChirho));
</script>

<!-- Only canonical source gaps may introduce whitespace in this rendering block. -->
<!-- prettier-ignore -->
<div class="verse-chirho" dir="rtl" lang="he" role="group" aria-label={readerTChirho('verse_cues_label_chirho', { reference_chirho: referenceChirho(lessonChirho.id_chirho, localeStateChirho.currentChirho) })}>{#each runsChirho as runChirho, indexChirho (runChirho.token_chirho?.id_chirho ?? indexChirho)}{#if runChirho.token_chirho}<WordChirho tokenChirho={runChirho.token_chirho} iconChirho={iconsChirho[runChirho.token_chirho.id_chirho]} />{:else}{runChirho.text_chirho}{/if}{/each}</div>
