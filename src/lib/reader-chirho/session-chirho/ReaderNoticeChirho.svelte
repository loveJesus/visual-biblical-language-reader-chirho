<!-- For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life. — John 3:16 (KJV) -->
<script lang="ts">
	import { localeStateChirho } from '$lib/i18n-chirho/locale-state-chirho.svelte';
	let {
		languageChirho,
		kindChirho,
		textChirho
	}: {
		languageChirho: 'he' | 'grc';
		kindChirho: 'direction_chirho' | 'recordings_chirho';
		textChirho: string;
	} = $props();
	const keyChirho = $derived(`hinneh-reader-notice-${languageChirho}-${kindChirho}`);
	let hiddenChirho = $state(false);
	$effect(() => {
		const currentChirho = keyChirho;
		try {
			hiddenChirho = localStorage.getItem(currentChirho) === 'hidden_chirho';
		} catch {
			hiddenChirho = false;
		}
	});
	// Workflow: hosting-chirho/reader-session-chirho.md. Each Biblical language and notice has its own local preference.
	function dismissChirho() {
		hiddenChirho = true;
		try {
			localStorage.setItem(keyChirho, 'hidden_chirho');
		} catch {
			/* A dismissal still works for this visit. */
		}
	}
</script>

{#if !hiddenChirho}<aside
		class="reader-notice-chirho"
		data-reader-notice-chirho={kindChirho}
		data-notice-language-chirho={languageChirho}
	>
		<span>{textChirho}</span><button
			type="button"
			onclick={dismissChirho}
			aria-label={localeStateChirho.currentChirho === 'es'
				? 'Ocultar este aviso'
				: 'Dismiss this notice'}>×</button
		>
	</aside>{/if}

<style>
	.reader-notice-chirho {
		display: flex;
		align-items: start;
		gap: 8px;
		max-width: 100%;
		color: #6a786c;
		font-size: 12px;
		line-height: 1.7;
	}
	span {
		min-width: 0;
	}
	button {
		flex-shrink: 0;
		display: grid;
		place-items: center;
		width: 24px;
		height: 24px;
		padding: 0;
		border: 1px solid transparent;
		border-radius: 50%;
		background: transparent;
		color: inherit;
		font: inherit;
		font-size: 17px;
		line-height: 1;
		cursor: pointer;
	}
	button:hover {
		border-color: #c3cebb;
		background: #f0f4e9;
	}
	button:focus-visible {
		outline: 3px solid #405a89;
		outline-offset: 2px;
	}
</style>
