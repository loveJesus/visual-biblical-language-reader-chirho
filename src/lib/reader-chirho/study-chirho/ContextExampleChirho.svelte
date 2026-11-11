<!-- For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life. — John 3:16 (KJV) -->
<script lang="ts">
	import { onMount } from 'svelte';
	import type { StudyExampleChirho } from './word-study-client-chirho';
	import { versePreviewChirho, type VersePreviewChirho } from './verse-preview-client-chirho';
	import { contextExcerptChirho } from './context-chirho';
	import { localeStateChirho } from '$lib/i18n-chirho/locale-state-chirho.svelte';
	import {
		recordingsForLessonChirho,
		type RecordingChirho
	} from '../audio-chirho/recordings-chirho';
	import {
		contextRecordingChirho,
		subscribeContextPlaybackChirho,
		localInterfaceVoiceChirho,
		playContextOriginalChirho,
		playContextTranslationChirho
	} from './context-playback-chirho';
	import VerseReferenceChirho from './VerseReferenceChirho.svelte';
	let {
		exampleChirho,
		lemmaChirho,
		modeChirho
	}: { exampleChirho: StudyExampleChirho; lemmaChirho: string; modeChirho: 'readers' | 'terse' } =
		$props();
	let cardChirho = $state<HTMLDivElement>();
	let previewChirho = $state<VersePreviewChirho | null>(null);
	let clipChirho = $state<RecordingChirho>();
	let loadingChirho = $state(true);
	let failedChirho = $state(false);
	let activeChirho = $state('');
	let errorChirho = $state(false);
	let voiceChirho = $state(false);
	const spanishChirho = $derived(localeStateChirho.currentChirho === 'es');
	const excerptChirho = $derived(
		previewChirho
			? contextExcerptChirho(previewChirho, lemmaChirho, exampleChirho.text_chirho)
			: null
	);
	onMount(() => {
		let aliveChirho = true;
		let startedChirho = false;
		const unsubscribeChirho = subscribeContextPlaybackChirho((keyChirho, failedChirho) => {
			activeChirho = failedChirho ? '' : keyChirho;
			errorChirho = failedChirho && keyChirho.startsWith(exampleChirho.verse_chirho + ':');
		});
		const updateVoiceChirho = () => {
			voiceChirho = Boolean(localInterfaceVoiceChirho(localeStateChirho.currentChirho));
		};
		updateVoiceChirho();
		if (typeof speechSynthesis !== 'undefined')
			speechSynthesis.addEventListener('voiceschanged', updateVoiceChirho);
		const loadChirho = async () => {
			if (startedChirho) return;
			startedChirho = true;
			try {
				const valueChirho = await versePreviewChirho(
					exampleChirho.verse_chirho,
					localeStateChirho.currentChirho,
					modeChirho
				);
				if (!aliveChirho) return;
				previewChirho = valueChirho;
				const clipsChirho = await recordingsForLessonChirho(valueChirho.lesson_chirho).catch(
					() => []
				);
				let renditionChirho: string | null = null;
				try {
					renditionChirho = localStorage.getItem('hinneh-greek-rendition-chirho');
				} catch {
					/* Automatic reading remains available. */
				}
				if (aliveChirho)
					clipChirho = contextRecordingChirho(
						clipsChirho,
						valueChirho.lesson_chirho,
						renditionChirho
					);
			} catch {
				if (aliveChirho) failedChirho = true;
			} finally {
				if (aliveChirho) loadingChirho = false;
			}
		};
		const observerChirho = new IntersectionObserver(
			(entriesChirho) => {
				if (entriesChirho.some((entryChirho) => entryChirho.isIntersecting)) {
					void loadChirho();
					observerChirho.disconnect();
				}
			},
			{ rootMargin: '100px' }
		);
		if (cardChirho) observerChirho.observe(cardChirho);
		return () => {
			aliveChirho = false;
			observerChirho.disconnect();
			unsubscribeChirho();
			if (typeof speechSynthesis !== 'undefined')
				speechSynthesis.removeEventListener('voiceschanged', updateVoiceChirho);
		};
	});
	function playOriginalChirho() {
		if (!clipChirho) return;
		const rateChirho = Number(
			(document.querySelector('[data-speech-rate-chirho]') as HTMLSelectElement | null)?.value ?? 1
		);
		playContextOriginalChirho(
			exampleChirho.verse_chirho + ':original-chirho',
			clipChirho,
			[0.65, 0.85, 0.88, 1].includes(rateChirho) ? rateChirho : 1
		);
	}
</script>

<div class="context-example-chirho" bind:this={cardChirho}>
	<VerseReferenceChirho verseChirho={exampleChirho.verse_chirho} {modeChirho} />
	{#if excerptChirho && previewChirho}<p
			class="context-original-chirho"
			dir={previewChirho.language_chirho === 'he' ? 'rtl' : 'ltr'}
			lang={previewChirho.language_chirho}
		>
			{#if excerptChirho.leading_chirho}…
			{/if}{#each excerptChirho.original_chirho as partChirho, indexChirho (indexChirho)}{#if partChirho.emphasis_chirho}<strong
						>{partChirho.text_chirho}</strong
					>{:else}{partChirho.text_chirho}{/if}{/each}{#if excerptChirho.trailing_chirho}
				…{/if}
		</p>
		{#if excerptChirho.translation_chirho.length}<p
				class="context-translation-chirho"
				lang={localeStateChirho.currentChirho}
			>
				{#if excerptChirho.leading_chirho}…
				{/if}{#each excerptChirho.translation_chirho as partChirho, indexChirho (indexChirho)}{#if partChirho.emphasis_chirho}<strong
							>{partChirho.text_chirho}</strong
						>{:else}{partChirho.text_chirho}{/if}{/each}{#if excerptChirho.trailing_chirho}
					…{/if}
			</p>{/if}{:else}<p class="context-loading-chirho">
			{failedChirho
				? spanishChirho
					? 'Ejemplo no disponible.'
					: 'Example unavailable.'
				: spanishChirho
					? 'Cargando contexto…'
					: 'Loading context…'}
		</p>{/if}
	<div class="context-audio-chirho">
		<button
			type="button"
			data-context-play-chirho
			disabled={loadingChirho || !clipChirho}
			onclick={playOriginalChirho}
			aria-label={activeChirho === exampleChirho.verse_chirho + ':original-chirho'
				? spanishChirho
					? 'Detener versículo original'
					: 'Stop original verse'
				: spanishChirho
					? 'Escuchar versículo original'
					: 'Play original verse'}
			>{activeChirho === exampleChirho.verse_chirho + ':original-chirho' ? '■' : '▶'}
			{spanishChirho ? 'Original' : 'Original'}</button
		><button
			type="button"
			data-context-play-chirho
			disabled={!voiceChirho || !previewChirho?.translation_chirho}
			onclick={() => {
				if (previewChirho?.translation_chirho)
					playContextTranslationChirho(
						exampleChirho.verse_chirho + ':translation-chirho',
						previewChirho.translation_chirho,
						localeStateChirho.currentChirho
					);
			}}
			title={voiceChirho
				? spanishChirho
					? 'Voz del dispositivo'
					: 'Device voice'
				: spanishChirho
					? 'No hay voz local instalada para este idioma.'
					: 'No installed local voice is available for this language.'}
			aria-label={activeChirho === exampleChirho.verse_chirho + ':translation-chirho'
				? spanishChirho
					? 'Detener traducción'
					: 'Stop translation'
				: spanishChirho
					? 'Escuchar traducción con voz del dispositivo'
					: 'Play translation with device voice'}
			>{activeChirho === exampleChirho.verse_chirho + ':translation-chirho' ? '■' : '▶'}
			{spanishChirho ? 'Español' : 'English'}</button
		><small>{spanishChirho ? 'audio del versículo completo' : 'full-verse audio'}</small>
	</div>
	{#if errorChirho}<p class="context-loading-chirho" role="status">
			{spanishChirho
				? 'No se pudo reproducir. Pulse de nuevo para intentarlo.'
				: 'Playback could not start. Choose Play to try again.'}
		</p>{/if}
</div>

<style>
	.context-example-chirho {
		border: 1px solid #dde4d4;
		background: #f8faf3;
		border-radius: 10px;
		padding: 12px 14px;
		min-height: 90px;
		margin-top: 10px;
	}
	.context-original-chirho {
		margin: 8px 0 6px;
		font-size: 24px;
		line-height: 1.8;
		color: #314830;
	}
	.context-original-chirho strong {
		font-weight: 800;
		background: #e3ebcd;
		border-radius: 3px;
	}
	.context-translation-chirho {
		font-size: 13px;
		line-height: 1.8;
		margin: 0 0 10px;
		color: #63735a;
	}
	.context-translation-chirho strong {
		color: #3c5733;
		font-weight: 700;
	}
	.context-audio-chirho {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		gap: 6px 10px;
	}
	button {
		min-height: 32px;
		padding: 5px 9px;
		background: #f1f5e9;
		border: 1px solid #c4d0b9;
		border-radius: 7px;
		color: #3d5834;
		font-size: 11px;
		cursor: pointer;
	}
	button:disabled {
		opacity: 0.4;
		cursor: default;
	}
	small,
	.context-loading-chirho {
		font-size: 10px;
		line-height: 1.6;
		color: #7b876f;
	}
	button:focus-visible {
		outline: 3px solid #405a89;
		outline-offset: 3px;
	}
</style>
