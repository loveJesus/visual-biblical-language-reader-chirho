<!-- For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life. — John 3:16 (KJV) -->
<script lang="ts">
	import { audioTChirho } from './audio-messages-chirho';
	import { localeStateChirho } from '$lib/i18n-chirho/locale-state-chirho.svelte';
	let {
		textChirho,
		languageChirho,
		tokenIdChirho,
		wordChirho = false,
		compactChirho = false,
		unavailableChirho = false
	}: {
		textChirho: string;
		languageChirho: 'he' | 'grc';
		tokenIdChirho?: string;
		wordChirho?: boolean;
		compactChirho?: boolean;
		unavailableChirho?: boolean;
	} = $props();
</script>

<button
	type="button"
	class:word-speech-chirho={wordChirho}
	class:compact-speech-chirho={compactChirho}
	class="speech-button-chirho"
	data-pronounce-chirho={textChirho}
	data-speech-token-chirho={tokenIdChirho}
	data-speech-language-chirho={languageChirho}
	data-speech-unavailable-chirho={unavailableChirho ? 'true' : undefined}
	data-annotation-chirho
	aria-label={wordChirho
		? audioTChirho('pronounce_word_chirho', { word_chirho: textChirho })
		: audioTChirho('listen_verse_chirho')}
	aria-describedby="audio-status-chirho"
	lang={localeStateChirho.currentChirho}
	disabled
>
	<svg
		aria-hidden="true"
		width="17"
		height="17"
		viewBox="0 0 24 24"
		fill="none"
		stroke="currentColor"
		stroke-width="1.7"
		><path
			d={wordChirho
				? 'M3 10h9l6-5v14l-6-5H3v-4Zm3 4v5h4v-5M21 8v8'
				: 'M11 4 6 8H3v8h3l5 4V4Zm4 4a6 6 0 0 1 0 8m3-11a10 10 0 0 1 0 14'}
		/></svg
	>
	{#if !compactChirho}{audioTChirho(wordChirho ? 'hear_word_chirho' : 'play_chirho')}{/if}
</button>
