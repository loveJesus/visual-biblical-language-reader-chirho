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
		unavailableChirho = false,
		savedOnlyChirho = false
	}: {
		textChirho: string;
		languageChirho: 'he' | 'grc';
		tokenIdChirho?: string;
		wordChirho?: boolean;
		compactChirho?: boolean;
		unavailableChirho?: boolean;
		savedOnlyChirho?: boolean;
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
	data-speech-saved-only-chirho={savedOnlyChirho ? 'true' : undefined}
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
		>{#if wordChirho}<path d="M3 10h9l6-5v14l-6-5H3v-4Zm3 4v5h4v-5M21 8v8" />{:else}<path
				class="verse-start-glyph-chirho"
				d="M8 5 19 12 8 19Z"
				fill="currentColor"
				stroke="none"
			/><rect
				class="verse-stop-glyph-chirho"
				x="7"
				y="7"
				width="10"
				height="10"
				rx="1"
				fill="currentColor"
				stroke="none"
			/>{/if}</svg
	>

	{#if !compactChirho}{#if wordChirho}{audioTChirho('hear_word_chirho')}{:else}<span
				data-verse-action-label-chirho>{audioTChirho('play_verse_chirho')}</span
			>{/if}{/if}
</button>

<style>
	.verse-stop-glyph-chirho {
		display: none;
	}
	.speech-button-chirho:global([aria-busy='true']) .verse-start-glyph-chirho {
		display: none;
	}
	.speech-button-chirho:global([aria-busy='true']) .verse-stop-glyph-chirho {
		display: block;
	}

	[data-verse-action-label-chirho] {
		display: block;
		min-width: 0;
		white-space: normal;
		line-height: 1.2;
		text-align: center;
	}
	.speech-button-chirho:not(.word-speech-chirho) {
		min-width: 0;
	}
	.speech-button-chirho:not(.word-speech-chirho) svg {
		flex-shrink: 0;
	}
</style>
