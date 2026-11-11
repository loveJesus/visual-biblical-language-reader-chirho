<!-- For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life. — John 3:16 (KJV) -->
<script lang="ts">
	import { onMount } from 'svelte';
	import { resolve as resolveChirho } from '$app/paths';
	import { referenceChirho } from '$lib/i18n-chirho/labels-chirho';
	import { localeStateChirho } from '$lib/i18n-chirho/locale-state-chirho.svelte';
	import { versePreviewChirho, type VersePreviewChirho } from './verse-preview-client-chirho';
	let { verseChirho, modeChirho }: { verseChirho: string; modeChirho: 'readers' | 'terse' } =
		$props();
	const idChirho = $props.id();
	let linkChirho = $state<HTMLAnchorElement>();
	let containerChirho = $state<HTMLSpanElement>();
	let shownChirho = $state(false);
	let valueChirho = $state<VersePreviewChirho | null>(null);
	let failedChirho = $state(false);
	let topChirho = $state(0);
	let leftChirho = $state(0);
	let timerChirho: ReturnType<typeof setTimeout> | undefined;
	let hideTimerChirho: ReturnType<typeof setTimeout> | undefined;
	let generationChirho = 0;
	const spanishChirho = $derived(localeStateChirho.currentChirho === 'es');
	function hideChirho() {
		clearTimeout(timerChirho);
		clearTimeout(hideTimerChirho);
		timerChirho = undefined;
		hideTimerChirho = undefined;
		generationChirho++;
		shownChirho = false;
	}
	function showChirho() {
		clearTimeout(hideTimerChirho);
		if (shownChirho || timerChirho) return;
		timerChirho = setTimeout(async () => {
			timerChirho = undefined;
			if (!linkChirho?.isConnected) return;
			const generationNowChirho = ++generationChirho;
			const rectChirho = linkChirho.getBoundingClientRect();
			const widthChirho = Math.min(360, innerWidth - 24);
			leftChirho = Math.max(12, Math.min(rectChirho.left, innerWidth - widthChirho - 12));
			topChirho = rectChirho.bottom + 8;
			if (topChirho + 260 > innerHeight - 12) topChirho = Math.max(12, rectChirho.top - 268);
			shownChirho = true;
			failedChirho = false;
			valueChirho = null;
			try {
				const resultChirho = await versePreviewChirho(
					verseChirho,
					localeStateChirho.currentChirho,
					modeChirho
				);
				if (generationNowChirho === generationChirho) valueChirho = resultChirho;
			} catch {
				if (generationNowChirho === generationChirho) failedChirho = true;
			}
		}, 250);
	}
	function leaveChirho(eventChirho: PointerEvent | FocusEvent) {
		if (
			eventChirho.relatedTarget instanceof Node &&
			containerChirho?.contains(eventChirho.relatedTarget)
		)
			return;
		clearTimeout(timerChirho);
		timerChirho = undefined;
		hideTimerChirho = setTimeout(hideChirho, 120);
	}
	onMount(() => {
		const escapeChirho = (eventChirho: KeyboardEvent) => {
			if (shownChirho && eventChirho.key === 'Escape') {
				eventChirho.preventDefault();
				eventChirho.stopPropagation();
				hideChirho();
			}
		};
		document.addEventListener('keydown', escapeChirho, true);
		window.addEventListener('resize', hideChirho);
		return () => {
			hideChirho();
			window.removeEventListener('resize', hideChirho);
			document.removeEventListener('keydown', escapeChirho, true);
		};
	});
	$effect(() => {
		void verseChirho;
		void modeChirho;
		void localeStateChirho.currentChirho;
		hideChirho();
	});
</script>

<span
	class="verse-reference-chirho"
	role="presentation"
	bind:this={containerChirho}
	onpointerenter={showChirho}
	onpointerleave={leaveChirho}
	onfocusin={showChirho}
	onfocusout={leaveChirho}
>
	<a
		bind:this={linkChirho}
		href={resolveChirho(`/?lang_chirho=${localeStateChirho.currentChirho}#${verseChirho}`)}
		data-passage-link-chirho={verseChirho}
		aria-describedby={shownChirho ? idChirho : undefined}
		onkeydown={(eventChirho) => {
			if (eventChirho.key === 'Escape' && shownChirho) {
				eventChirho.preventDefault();
				eventChirho.stopPropagation();
				hideChirho();
			}
		}}>{referenceChirho(verseChirho, localeStateChirho.currentChirho)}</a
	>
	{#if shownChirho}<span
			role="tooltip"
			id={idChirho}
			class="verse-preview-chirho"
			style:top={`${topChirho}px`}
			style:left={`${leftChirho}px`}
			><strong>{referenceChirho(verseChirho, localeStateChirho.currentChirho)}</strong
			>{#if valueChirho}<span
					class="preview-original-chirho"
					dir={valueChirho.language_chirho === 'he' ? 'rtl' : 'ltr'}
					lang={valueChirho.language_chirho}>{valueChirho.original_chirho}</span
				>{#if valueChirho.translation_chirho}<span
						class="preview-translation-chirho"
						lang={localeStateChirho.currentChirho}>{valueChirho.translation_chirho}</span
					><small
						>{valueChirho.edition_chirho} · {spanishChirho
							? 'borrador importado'
							: 'imported draft'}</small
					>{:else}<span
						>{spanishChirho ? 'Traducción no disponible.' : 'Translation unavailable.'}</span
					>{/if}{:else}<span
					>{failedChirho
						? spanishChirho
							? 'Vista previa no disponible. El enlace sigue disponible.'
							: 'Preview unavailable. The verse link still works.'
						: spanishChirho
							? 'Cargando versículo…'
							: 'Loading verse…'}</span
				>{/if}</span
		>{/if}
</span>

<style>
	.verse-reference-chirho {
		display: inline-block;
	}
	a {
		display: inline-block;
		padding: 5px 0;
		color: #486943;
		text-decoration: underline;
		text-decoration-color: #a3b59a;
		text-underline-offset: 3px;
		font-size: 12px;
	}
	a:hover {
		text-decoration-color: currentColor;
	}
	a:focus-visible {
		outline: 3px solid #405a89;
		outline-offset: 3px;
	}
	.verse-preview-chirho {
		position: fixed;
		z-index: 5;
		display: flex;
		flex-direction: column;
		gap: 10px;
		width: min(360px, calc(100vw - 24px));
		max-height: 260px;
		overflow: auto;
		box-sizing: border-box;
		border: 1px solid #bdcbb1;
		border-radius: 12px;
		background: #fffef6;
		padding: 15px 17px;
		color: #334835;
		box-shadow: 0 8px 30px #20371b30;
		font-size: 13px;
		line-height: 1.7;
		text-align: start;
	}
	.verse-preview-chirho strong {
		font-size: 13px;
	}
	.preview-original-chirho {
		font-size: 22px;
		line-height: 1.8;
	}
	.preview-translation-chirho {
		border-top: 1px solid #e2e7d8;
		padding-top: 10px;
	}
	small {
		color: #74806b;
		font-size: 10px;
	}
</style>
