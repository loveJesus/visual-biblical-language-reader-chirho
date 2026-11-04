<!-- For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life. — John 3:16 (KJV) -->
<script lang="ts">
	import { onDestroy } from 'svelte';
	import { resolve as resolveChirho } from '$app/paths';
	import { localeStateChirho } from '$lib/i18n-chirho/locale-state-chirho.svelte';
	import { defineCatalogueChirho, translateChirho } from '$lib/i18n-chirho/translate-chirho';
	import previewChirho from '../../../data-chirho/reader-chirho/home-preview-chirho.json';
	import { isRejectedAudioChirho } from '$lib/domain-chirho/pronunciation-chirho/audio-reviews-chirho';
	let { compactChirho = false }: { compactChirho?: boolean } = $props();
	const instanceChirho = $props.id();
	const messagesChirho = defineCatalogueChirho({
		en: {
			hebrew_chirho: 'Hebrew',
			greek_chirho: 'Greek',
			genesis_chirho: 'Genesis 1:1',
			john_chirho: 'John 1:1',
			excerpt_chirho: 'An opening in the original',
			select_chirho: 'Choose a word. Look closer.',
			meaning_chirho: 'Word meaning',
			listen_chirho: 'Hear this word',
			stop_chirho: 'Stop',
			open_chirho: 'Read the passage',
			error_chirho: 'The saved recording could not be played. Try again.',
			aids_chirho: 'AI-assisted artwork and pronunciation · awaiting review',
			gloss_chirho: 'Word gloss',
			spanish_gloss_chirho: 'Approved GBT Spanish gloss',
			source_chirho: 'Sources & credits',
			color_chirho: 'Color',
			symbol_chirho: 'Symbols',
			picture_chirho: 'Word picture',
			masculine_chirho: 'Masculine',
			feminine_chirho: 'Feminine',
			neutral_chirho: 'No gender shading',
			plural_chirho: 'Plural underline',
			singular_chirho: 'Singular',
			general_chirho: 'A general picture of this word; explore its use in the passage.',
			contextual_chirho: 'A picture selected for this word in this passage.'
		},
		es: {
			hebrew_chirho: 'Hebreo',
			greek_chirho: 'Griego',
			genesis_chirho: 'Génesis 1:1',
			john_chirho: 'Juan 1:1',
			excerpt_chirho: 'Un comienzo en el original',
			select_chirho: 'Elige una palabra. Mira más de cerca.',
			meaning_chirho: 'Significado de la palabra',
			listen_chirho: 'Escucha esta palabra',
			stop_chirho: 'Detener',
			open_chirho: 'Leer el pasaje',
			error_chirho: 'No se pudo reproducir la grabación. Inténtalo de nuevo.',
			aids_chirho: 'Arte y pronunciación con ayuda de IA · pendientes de revisión',
			gloss_chirho: 'Glosa de la palabra',
			spanish_gloss_chirho: 'Glosa española aprobada por GBT',
			source_chirho: 'Fuentes y créditos',
			color_chirho: 'Color',
			symbol_chirho: 'Símbolos',
			picture_chirho: 'Imagen de la palabra',
			masculine_chirho: 'Masculino',
			feminine_chirho: 'Femenino',
			neutral_chirho: 'Sin color de género',
			plural_chirho: 'Subrayado plural',
			singular_chirho: 'Singular',
			general_chirho: 'Una imagen general de esta palabra; explora su uso en el pasaje.',
			contextual_chirho: 'Una imagen elegida para esta palabra en este pasaje.'
		}
	});
	function tChirho(keyChirho: keyof typeof messagesChirho.en) {
		return translateChirho(messagesChirho, localeStateChirho.currentChirho, keyChirho);
	}
	let exampleIndexChirho = $state(0);
	let wordIndexChirho = $state(1);
	let playingChirho = $state(false);
	let failedChirho = $state(false);
	let currentAudioChirho: HTMLAudioElement | null = null;
	const exampleChirho = $derived(previewChirho.excerpts_chirho[exampleIndexChirho]);
	const wordChirho = $derived(exampleChirho.words_chirho[wordIndexChirho]);
	const greekChirho = $derived(exampleChirho.language_chirho === 'grc');
	const playableChirho = $derived(
		wordChirho.audio_chirho && !isRejectedAudioChirho(wordChirho.audio_chirho.sha256_chirho)
			? wordChirho.audio_chirho
			: null
	);
	const referenceChirho = $derived(tChirho(greekChirho ? 'john_chirho' : 'genesis_chirho'));
	const meaningChirho = $derived(
		localeStateChirho.currentChirho === 'es'
			? (wordChirho.spanish_gloss_chirho ?? wordChirho.gloss_chirho)
			: wordChirho.gloss_chirho
	);
	function stopChirho() {
		if (currentAudioChirho) {
			currentAudioChirho.onended = currentAudioChirho.onerror = null;
			currentAudioChirho.pause();
			currentAudioChirho.removeAttribute('src');
			currentAudioChirho.load();
			currentAudioChirho = null;
		}
		playingChirho = false;
	}
	function chooseExampleChirho(indexChirho: number) {
		stopChirho();
		failedChirho = false;
		exampleIndexChirho = indexChirho;
		wordIndexChirho = 1;
	}
	function chooseWordChirho(indexChirho: number) {
		stopChirho();
		failedChirho = false;
		wordIndexChirho = indexChirho;
	}
	// Workflow: public-site-chirho.md. Reuse a saved exact word; never synthesize or autoplay.
	async function playChirho() {
		if (playingChirho) {
			stopChirho();
			return;
		}
		const clipChirho = playableChirho;
		if (!clipChirho) return;
		stopChirho();
		failedChirho = false;
		const audioChirho = new Audio(clipChirho.asset_path_chirho);
		currentAudioChirho = audioChirho;
		audioChirho.playbackRate = 1;
		audioChirho.preservesPitch = true;
		const finishChirho = (errorChirho = false) => {
			if (currentAudioChirho !== audioChirho) return;
			stopChirho();
			failedChirho = errorChirho;
		};
		audioChirho.onended = () => finishChirho();
		audioChirho.onerror = () => finishChirho(true);
		playingChirho = true;
		try {
			await audioChirho.play();
		} catch {
			finishChirho(true);
		}
	}
	onDestroy(stopChirho);
</script>

<div class="experience-chirho" class:compact-chirho={compactChirho}>
	<div class="experience-toolbar-chirho">
		<span class="experience-heading-chirho">{tChirho('excerpt_chirho')}</span>
		<div class="script-choices-chirho" aria-label={tChirho('excerpt_chirho')}>
			<button type="button" aria-pressed={!greekChirho} onclick={() => chooseExampleChirho(0)}
				>{tChirho('hebrew_chirho')}</button
			>
			<button type="button" aria-pressed={greekChirho} onclick={() => chooseExampleChirho(1)}
				>{tChirho('greek_chirho')}</button
			>
		</div>
	</div>
	<div class="experience-scene-chirho">
		<img
			src={exampleChirho.scene_chirho.asset_path_chirho}
			alt={exampleChirho.scene_chirho.alt_chirho}
			lang="en"
			width="1200"
			height="900"
			fetchpriority={compactChirho ? 'auto' : 'high'}
		/>
		<div class="scene-shade-chirho"></div>
		<p class="experience-reference-chirho">
			{referenceChirho}<span aria-hidden="true"> · </span><span
				>{tChirho(greekChirho ? 'greek_chirho' : 'hebrew_chirho')}</span
			>
		</p>
	</div>
	<div class="experience-paper-chirho">
		<p class="experience-invitation-chirho">{tChirho('select_chirho')}</p>
		<div class="experience-words-chirho" dir={greekChirho ? 'ltr' : 'rtl'}>
			{#each exampleChirho.words_chirho as itemChirho, indexChirho (itemChirho.id_chirho)}
				<button
					class="experience-word-chirho"
					type="button"
					aria-pressed={wordIndexChirho === indexChirho}
					aria-label={itemChirho.text_chirho}
					lang={greekChirho ? 'grc' : 'he'}
					aria-describedby={wordIndexChirho === indexChirho
						? `${instanceChirho}-meaning-chirho`
						: undefined}
					onclick={() => chooseWordChirho(indexChirho)}
				>
					<span
						class="experience-surface-chirho"
						style:background={itemChirho.cues_chirho.background_chirho}
						style:border-bottom-color={itemChirho.cues_chirho.underline_chirho}
					>
						<span class="cue-left-chirho" aria-hidden="true"
							>{itemChirho.cues_chirho.left_chirho}</span
						>
						<span class="cue-center-chirho" aria-hidden="true"
							>{itemChirho.cues_chirho.center_chirho}</span
						>
						<span class="cue-right-chirho" aria-hidden="true"
							>{itemChirho.cues_chirho.right_chirho}</span
						>
						<span lang={greekChirho ? 'grc' : 'he'}>{itemChirho.text_chirho}</span>
					</span>
					{#if itemChirho.icon_chirho}<span
							class="experience-sticker-chirho"
							style:border-color={itemChirho.cues_chirho.outline_chirho}
						>
							<img
								src={itemChirho.icon_chirho.asset_path_chirho}
								alt={itemChirho.icon_chirho.alt_chirho}
								lang="en"
								width="128"
								height="128"
								loading="lazy"
							/>
						</span>{/if}
				</button>
			{/each}
		</div>
		<div
			class="experience-detail-chirho"
			id={`${instanceChirho}-meaning-chirho`}
			aria-live="polite"
		>
			<div class="meaning-heading-chirho">
				<div>
					<p class="meaning-label-chirho">{tChirho('meaning_chirho')}</p>
					<p
						class="meaning-value-chirho"
						lang={localeStateChirho.currentChirho === 'es' && wordChirho.spanish_gloss_chirho
							? 'es'
							: 'en'}
					>
						{meaningChirho}
					</p>
				</div>
				<button
					class="experience-listen-chirho"
					type="button"
					onclick={playChirho}
					disabled={!playableChirho}
					aria-pressed={playingChirho}
				>
					<svg
						aria-hidden="true"
						viewBox="0 0 24 24"
						width="18"
						height="18"
						fill="none"
						stroke="currentColor"
						stroke-width="1.7"
						><path
							d={playingChirho
								? 'M7 5h10v14H7z'
								: 'M11 4 6 8H3v8h3l5 4V4Zm4 4a6 6 0 0 1 0 8m3-11a10 10 0 0 1 0 14'}
						/></svg
					>
					{tChirho(playingChirho ? 'stop_chirho' : 'listen_chirho')}
				</button>
			</div>
			<div class="experience-key-chirho">
				<span
					><i style:background={wordChirho.cues_chirho.background_chirho}></i>{tChirho(
						'color_chirho'
					)}: {tChirho(
						wordChirho.gender_chirho === 'feminine'
							? 'feminine_chirho'
							: wordChirho.gender_chirho === 'masculine'
								? 'masculine_chirho'
								: 'neutral_chirho'
					)}</span
				>
				{#if wordChirho.number_chirho === 'plural'}<span class="plural-key-chirho"
						>{tChirho('plural_chirho')}</span
					>{/if}
				{#if wordChirho.cues_chirho.left_chirho || wordChirho.cues_chirho.center_chirho || wordChirho.cues_chirho.right_chirho}<span
						>{tChirho('symbol_chirho')}:
						<b
							>{[
								wordChirho.cues_chirho.left_chirho,
								wordChirho.cues_chirho.center_chirho,
								wordChirho.cues_chirho.right_chirho
							]
								.filter(Boolean)
								.join(' · ')}</b
						></span
					>{/if}
			</div>
			<p class="experience-picture-note-chirho">
				{tChirho(
					wordChirho.icon_chirho?.assignment_chirho === 'lemma_default'
						? 'general_chirho'
						: 'contextual_chirho'
				)}
			</p>
			<p class="experience-gloss-origin-chirho">
				{tChirho(
					localeStateChirho.currentChirho === 'es' && wordChirho.spanish_gloss_chirho
						? 'spanish_gloss_chirho'
						: 'gloss_chirho'
				)}
			</p>
			{#if failedChirho}<p class="experience-error-chirho" role="status">
					{tChirho('error_chirho')}
				</p>{/if}
		</div>
		<div class="experience-footer-chirho">
			<a
				href={resolveChirho(
					`/?lang_chirho=${localeStateChirho.currentChirho}#${exampleChirho.id_chirho}` as `/${string}`
				)}>{tChirho('open_chirho')} <span aria-hidden="true">↗</span></a
			>
			<a
				class="experience-source-chirho"
				href={resolveChirho(`/sources-chirho/?lang_chirho=${localeStateChirho.currentChirho}`)}
				>{tChirho('source_chirho')}</a
			>
		</div>
		<p class="experience-review-chirho">{tChirho('aids_chirho')}</p>
	</div>
</div>

<style>
	.experience-chirho {
		width: 100%;
		max-width: 570px;
		margin-inline: auto;
		border: 1px solid #d6ccba;
		border-radius: 18px;
		background: #fffdf8;
		box-shadow:
			0 20px 60px #263f3020,
			0 3px 10px #263f3008;
		overflow: hidden;
		color: #2e3d34;
		text-align: left;
	}
	.experience-toolbar-chirho {
		min-height: 60px;
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 12px;
		padding: 10px 18px;
	}
	.experience-heading-chirho {
		font-size: 11px;
		letter-spacing: 0.09em;
		text-transform: uppercase;
		font-weight: 650;
		color: #78664d;
	}
	.script-choices-chirho {
		display: flex;
		gap: 3px;
		padding: 3px;
		background: #eeeade;
		border-radius: 7px;
		flex-shrink: 0;
	}
	.script-choices-chirho button {
		border: 0;
		background: transparent;
		color: #4b5d4f;
		border-radius: 5px;
		font-size: 12px;
		min-height: 36px;
		padding: 6px 12px;
	}
	.script-choices-chirho button[aria-pressed='true'] {
		background: #fffdf8;
		color: #2d4837;
		box-shadow: 0 1px 4px #233b2912;
	}
	button {
		cursor: pointer;
		font: inherit;
	}
	button:focus-visible,
	a:focus-visible {
		outline: 3px solid #b7793e;
		outline-offset: 4px;
	}
	.experience-scene-chirho {
		position: relative;
		height: 235px;
		overflow: hidden;
		background: #485b4f;
	}
	.experience-scene-chirho > img {
		width: 100%;
		height: 100%;
		object-fit: cover;
		object-position: center 44%;
	}
	.scene-shade-chirho {
		position: absolute;
		inset: 45% 0 0;
		background: linear-gradient(transparent, #10251ee8);
		pointer-events: none;
	}
	.experience-reference-chirho {
		position: absolute;
		inset-inline: 22px;
		bottom: 18px;
		margin: 0;
		color: #fffdf4;
		font: 24px/1.2 var(--serif-chirho);
	}
	.experience-reference-chirho span {
		font: 12px/1.4 var(--sans-chirho, sans-serif);
		letter-spacing: 0.02em;
	}
	.experience-reference-chirho > span:first-child {
		margin-inline: 6px;
	}
	.experience-paper-chirho {
		position: relative;
		padding: 22px 24px 17px;
	}
	.experience-invitation-chirho {
		margin: 0;
		text-align: center;
		font-size: 12px;
		color: #667361;
	}
	.experience-words-chirho {
		display: flex;
		align-items: flex-start;
		justify-content: center;
		gap: 16px;
		padding: 29px 0 21px;
	}
	.experience-word-chirho {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 12px;
		background: transparent;
		border: 0;
		padding: 5px 1px;
		border-radius: 8px;
		min-width: 80px;
	}
	.experience-word-chirho[aria-pressed='true'] {
		box-shadow: 0 0 0 1px #b7a184;
		background: #f6f1e7;
	}
	.experience-surface-chirho {
		position: relative;
		display: block;
		border-radius: 5px;
		border-bottom: 4px solid transparent;
		padding: 10px 9px 6px;
		font: 44px/1.25 var(--serif-chirho);
		color: #283d31;
	}
	.cue-left-chirho,
	.cue-center-chirho,
	.cue-right-chirho {
		position: absolute;
		top: -17px;
		color: #606d5c;
		font:
			14px/1 Georgia,
			serif;
	}
	.cue-left-chirho {
		left: 5px;
	}
	.cue-right-chirho {
		right: 5px;
	}
	.cue-center-chirho {
		left: 50%;
		transform: translateX(-50%);
	}
	.experience-sticker-chirho {
		width: 57px;
		height: 57px;
		display: grid;
		place-items: center;
		border: 2px solid;
		border-radius: 8px;
		background: #fffcf5;
	}
	.experience-sticker-chirho img {
		width: 49px;
		height: 49px;
		object-fit: contain;
	}
	.experience-detail-chirho {
		border-top: 1px solid #e1d9c9;
		padding: 17px 0 12px;
	}
	.meaning-heading-chirho {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 12px;
	}
	.meaning-label-chirho {
		font-size: 10px;
		color: #6b705f;
		text-transform: uppercase;
		letter-spacing: 0.12em;
		margin: 0 0 4px;
	}
	.meaning-value-chirho {
		font: 28px/1.2 var(--serif-chirho);
		margin: 0;
	}
	.experience-listen-chirho {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		gap: 7px;
		background: #eef1e8;
		color: #355443;
		border: 1px solid #c7d0be;
		border-radius: 7px;
		min-height: 44px;
		padding: 8px 11px;
		font-size: 12px;
		flex-shrink: 0;
	}
	.experience-listen-chirho[aria-pressed='true'] {
		background: #355443;
		color: #fffdf8;
	}
	.experience-key-chirho {
		display: flex;
		flex-wrap: wrap;
		gap: 8px 16px;
		margin-top: 14px;
		font-size: 11px;
		line-height: 1.5;
		color: #536552;
	}
	.experience-key-chirho span {
		display: inline-flex;
		align-items: center;
		gap: 5px;
	}
	.experience-key-chirho i {
		width: 12px;
		height: 12px;
		border: 1px solid #a7ac9c;
		border-radius: 3px;
	}
	.plural-key-chirho {
		text-decoration: underline;
		text-decoration-color: #b99408;
		text-decoration-thickness: 3px;
		text-underline-offset: 3px;
	}
	.experience-picture-note-chirho {
		font-size: 11px;
		line-height: 1.6;
		color: #66725f;
		margin: 11px 0 5px;
	}
	.experience-gloss-origin-chirho {
		margin: 0;
		font-size: 10px;
		color: #706b5f;
	}
	.experience-footer-chirho {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 15px;
		padding-top: 12px;
		border-top: 1px solid #e1d9c9;
	}
	.experience-footer-chirho a {
		font-size: 12px;
		color: #355443;
		text-underline-offset: 4px;
	}
	.experience-footer-chirho a.experience-source-chirho {
		font-size: 10px;
		color: #6a7162;
	}
	.experience-review-chirho {
		margin: 13px 0 0;
		font-size: 10px;
		line-height: 1.6;
		color: #706b5f;
	}
	.experience-error-chirho {
		font-size: 12px;
		color: #8a3a2c;
	}
	.compact-chirho {
		max-width: 590px;
	}
	.compact-chirho .experience-scene-chirho {
		height: 180px;
	}
	@media (max-width: 600px) {
		.experience-toolbar-chirho {
			padding: 9px 12px;
			gap: 8px;
			min-height: 58px;
		}
		.experience-heading-chirho {
			max-width: 115px;
			font-size: 9px;
			line-height: 1.6;
		}
		.script-choices-chirho button {
			min-height: 44px;
			padding-inline: 10px;
		}
		.experience-scene-chirho {
			height: 205px;
		}
		.experience-paper-chirho {
			padding: 19px 15px 14px;
		}
		.experience-words-chirho {
			gap: 9px;
		}
		.experience-word-chirho {
			min-width: 64px;
			gap: 9px;
		}
		.experience-surface-chirho {
			font-size: clamp(28px, 7.8vw, 40px);
			padding-inline: 5px;
		}
		.experience-sticker-chirho {
			width: 49px;
			height: 49px;
		}
		.experience-sticker-chirho img {
			width: 43px;
			height: 43px;
		}
		.meaning-value-chirho {
			font-size: 25px;
		}
		.experience-listen-chirho {
			max-width: 140px;
			line-height: 1.4;
		}
	}
</style>
