<!-- For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life. — John 3:16 (KJV) -->
<script lang="ts">
	import { onMount } from 'svelte';
	import type { WordStudyChirho } from './word-study-client-chirho';
	import { contextExamplesChirho } from './context-chirho';
	import {
		installContextPlaybackChirho,
		stopContextPlaybackChirho
	} from './context-playback-chirho';
	import { localeStateChirho } from '$lib/i18n-chirho/locale-state-chirho.svelte';
	import ContextExampleChirho from './ContextExampleChirho.svelte';
	let {
		recordChirho,
		lemmaChirho,
		modeChirho
	}: { recordChirho: WordStudyChirho; lemmaChirho: string; modeChirho: 'readers' | 'terse' } =
		$props();
	const examplesChirho = $derived(contextExamplesChirho(recordChirho));
	const spanishChirho = $derived(localeStateChirho.currentChirho === 'es');
	onMount(installContextPlaybackChirho);
</script>

<details
	class="context-uses-chirho"
	open
	ontoggle={(eventChirho) => {
		if (!eventChirho.currentTarget.open) stopContextPlaybackChirho();
	}}
>
	<summary
		>{spanishChirho ? 'La palabra en contexto' : 'In context'}
		<span>{examplesChirho.length} {spanishChirho ? 'ejemplos' : 'examples'}</span></summary
	>
	<p>
		{spanishChirho
			? 'Formas del mismo lema en distintos contextos, con la palabra destacada y hasta tres palabras a cada lado. La traducción usa la edición elegida.'
			: 'Forms of the same lemma in varied contexts, with the matching word highlighted and up to three neighboring words on each side. The translation follows the selected edition.'}
	</p>
	<p>
		{spanishChirho
			? 'Original: grabación publicada, cuando existe. Español: voz local del dispositivo, si está instalada.'
			: 'Original: published recording where available. English: a local device voice, if installed.'}
	</p>
	{#each examplesChirho as exampleChirho (exampleChirho.verse_chirho)}<ContextExampleChirho
			{exampleChirho}
			{lemmaChirho}
			{modeChirho}
		/>{/each}
</details>

<style>
	.context-uses-chirho {
		margin: 20px 0;
		border: 1px solid #d1ddc5;
		border-radius: 11px;
		background: #f4f7ee;
		padding: 0 12px 12px;
	}
	summary {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 12px;
		font-family: Georgia, serif;
		font-size: 20px;
		padding: 14px 0;
		cursor: pointer;
	}
	summary span {
		font-family: Arial, sans-serif;
		font-size: 11px;
		color: #728268;
	}
	p {
		font-size: 11px;
		line-height: 1.7;
		margin: 0 0 7px;
		color: #6a7a61;
	}
	summary:focus-visible {
		outline: 3px solid #405a89;
		outline-offset: 3px;
	}
</style>
