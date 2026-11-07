<!-- For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life. — John 3:16 (KJV) -->
<script lang="ts">
	import { artworkUrlChirho } from '$lib/media-review-chirho/artwork-url-chirho';
	import ReportArtworkChirho from '$lib/media-review-chirho/ReportArtworkChirho.svelte';
	import { onMount } from 'svelte';
	import type { ScenePresentationChirho } from '$lib/domain-chirho/media-chirho';
	import { localeStateChirho } from '$lib/i18n-chirho/locale-state-chirho.svelte';
	import { readerTChirho } from '$lib/i18n-chirho/reader-messages-chirho';
	import { defineCatalogueChirho, translateChirho } from '$lib/i18n-chirho/translate-chirho';
	import { validVerseVideoChirho } from '$lib/domain-chirho/verse-video-chirho';
	let {
		presentationChirho,
		verseIdChirho,
		videoChirho = null,
		canonicalTextChirho = ''
	}: {
		presentationChirho: ScenePresentationChirho | null;
		verseIdChirho: string;
		/** The catalogue's record for this verse; shown only if it starts from the scene displayed here. */
		videoChirho?: unknown;
		canonicalTextChirho?: string;
	} = $props();
	let canonicalShaChirho = $state('');
	$effect(() => {
		const textChirho = canonicalTextChirho;
		let currentChirho = true;
		canonicalShaChirho = '';
		if (textChirho)
			void crypto.subtle
				.digest('SHA-256', new TextEncoder().encode(textChirho))
				.then((digestChirho) => {
					if (currentChirho)
						canonicalShaChirho = Array.from(new Uint8Array(digestChirho), (byteChirho) =>
							byteChirho.toString(16).padStart(2, '0')
						).join('');
				});
		return () => {
			currentChirho = false;
		};
	});
	const messagesChirho = defineCatalogueChirho({
		en: {
			play_video_chirho: 'Play verse video',
			captions_chirho: 'Verse text',
			image_version_chirho: 'Illustration',
			standard_chirho: 'Standard',
			reduced_chirho: 'Representation reduced'
		},
		es: {
			play_video_chirho: 'Reproducir video del versículo',
			captions_chirho: 'Texto del versículo',
			image_version_chirho: 'Ilustración',
			standard_chirho: 'Estándar',
			reduced_chirho: 'Representación reducida'
		}
	});
	const storageKeyChirho = 'hinneh-scene-version-chirho';
	let preferenceChirho = $state('standard');
	let failedPathChirho = $state<string | null>(null);
	const sceneChirho = $derived(
		preferenceChirho === 'representation_reduced' &&
			presentationChirho?.representation_reduced_chirho
			? presentationChirho.representation_reduced_chirho
			: presentationChirho
	);
	const selectedChirho = $derived(
		preferenceChirho === 'representation_reduced' &&
			presentationChirho?.representation_reduced_chirho
			? 'representation_reduced'
			: 'standard'
	);
	// Workflow: verse-media-chirho.md. A verse video stands in for the displayed standard scene only,
	// and only while it is playing; its own validity and canonical binding use root's shared rules.
	let failedVideoChirho = $state<string | null>(null);
	const verseVideoChirho = $derived.by(() => {
		const sceneShaChirho = sceneChirho?.sha256_chirho;
		const candidateChirho = videoChirho;
		if (selectedChirho !== 'standard' || !sceneShaChirho || !canonicalShaChirho) return null;
		if (!validVerseVideoChirho(candidateChirho, verseIdChirho, canonicalShaChirho, sceneShaChirho))
			return null;
		return failedVideoChirho === candidateChirho.sha256_chirho ? null : candidateChirho;
	});
	// Captions: the video's sound is this verse read aloud, so its one cue is the verse text.
	const captionsChirho = $derived.by(() => {
		if (!verseVideoChirho) return '';
		const millisecondsChirho = Math.round(verseVideoChirho.duration_chirho * 1000);
		const clockChirho = [
			Math.floor(millisecondsChirho / 3_600_000),
			Math.floor(millisecondsChirho / 60_000) % 60,
			Math.floor(millisecondsChirho / 1000) % 60
		]
			.map((partChirho) => String(partChirho).padStart(2, '0'))
			.join(':');
		const endChirho = `${clockChirho}.${String(millisecondsChirho % 1000).padStart(3, '0')}`;
		return `data:text/vtt;charset=utf-8,${encodeURIComponent(
			`WEBVTT\n\n00:00:00.000 --> ${endChirho}\n${canonicalTextChirho}\n`
		)}`;
	});
	onMount(() => {
		try {
			if (localStorage.getItem(storageKeyChirho) === 'representation_reduced')
				preferenceChirho = 'representation_reduced';
		} catch {
			// Storage is optional; the selector still works in this visit.
		}
	});
	// Workflow: selective-scene-variants-chirho.md; a preference never invents a missing variant.
	function chooseChirho(eventChirho: Event): void {
		preferenceChirho = (eventChirho.currentTarget as HTMLSelectElement).value;
		try {
			localStorage.setItem(storageKeyChirho, preferenceChirho);
		} catch {
			// A storage refusal does not prevent selecting the image.
		}
	}
</script>

<figure class="scene-panel-chirho">
	{#if presentationChirho?.representation_reduced_chirho}
		<label class="scene-choice-chirho">
			<span
				>{translateChirho(
					messagesChirho,
					localeStateChirho.currentChirho,
					'image_version_chirho'
				)}</span
			>
			<select value={selectedChirho} onchange={chooseChirho}>
				<option value="standard"
					>{translateChirho(
						messagesChirho,
						localeStateChirho.currentChirho,
						'standard_chirho'
					)}</option
				>
				<option value="representation_reduced"
					>{translateChirho(
						messagesChirho,
						localeStateChirho.currentChirho,
						'reduced_chirho'
					)}</option
				>
			</select>
		</label>
	{/if}
	{#if sceneChirho}
		<img
			src={artworkUrlChirho(sceneChirho.asset_path_chirho)}
			alt={sceneChirho.alt_chirho}
			lang="en"
			width={sceneChirho.width_chirho}
			height={sceneChirho.height_chirho}
			data-scene-chirho
			hidden={failedPathChirho === sceneChirho.asset_path_chirho}
			onerror={() => (failedPathChirho = sceneChirho?.asset_path_chirho ?? null)}
			onload={() => (failedPathChirho = null)}
		/>
		{#if verseVideoChirho}
			<!-- Loads nothing until Play; the verse player shows it in the scene's place and restores the still. -->
			<video
				data-scene-video-chirho
				data-verse-video-play-chirho
				data-video-sha-chirho={verseVideoChirho.sha256_chirho}
				src={verseVideoChirho.asset_path_chirho}
				poster={artworkUrlChirho(sceneChirho.asset_path_chirho)}
				width={verseVideoChirho.width_chirho}
				height={verseVideoChirho.height_chirho}
				preload="none"
				playsinline
				hidden
				aria-label={sceneChirho.alt_chirho}
				lang="en"
				onerror={() => (failedVideoChirho = verseVideoChirho?.sha256_chirho ?? null)}
				><track
					kind="captions"
					src={captionsChirho}
					srclang={verseVideoChirho.reading_language_chirho ?? 'he'}
					label={translateChirho(
						messagesChirho,
						localeStateChirho.currentChirho,
						'captions_chirho'
					)}
				/></video
			>
		{/if}
		<p
			class="scene-missing-chirho"
			data-scene-missing-chirho
			hidden={failedPathChirho !== sceneChirho.asset_path_chirho}
		>
			{readerTChirho('scene_missing_chirho')}
		</p>
	{:else}
		<div class="scene-awaiting-chirho">
			<span aria-hidden="true">✧</span>
			<p>
				{readerTChirho('scene_awaiting_1_chirho')}<br />{readerTChirho(
					'scene_awaiting_passage_chirho'
				)}
			</p>
			<small>{readerTChirho('scene_awaiting_note_chirho')}</small>
		</div>
	{/if}
	<figcaption>
		<span class="scene-caption-mark-chirho" aria-hidden="true">✧</span>
		{readerTChirho('scene_caption_chirho')}
		<span>{readerTChirho('scene_caption_sub_chirho')}</span>
		{#if presentationChirho?.representation_reduced_chirho && sceneChirho}
			<p class="scene-reading-note-chirho" lang="en">{sceneChirho.reading_note_chirho}</p>
		{/if}
		{#if sceneChirho}<div>
				{#if verseVideoChirho}<button
						type="button"
						class="scene-video-play-chirho"
						data-verse-video-play-chirho
						>▶ {translateChirho(
							messagesChirho,
							localeStateChirho.currentChirho,
							'play_video_chirho'
						)}</button
					>{/if}
				<ReportArtworkChirho
					assetPathChirho={sceneChirho.asset_path_chirho}
					sha256Chirho={sceneChirho.sha256_chirho}
					{verseIdChirho}
				/>
			</div>{/if}
	</figcaption>
</figure>

<style>
	/* The playing video takes the still's exact slot (layout.css sizes .scene-panel-chirho img). */
	video[data-scene-video-chirho] {
		display: block;
		width: 100%;
		height: 100%;
		min-height: 340px;
		object-fit: cover;
		flex: 1;
		background: #efeadd;
		cursor: pointer;
	}
	video[data-scene-video-chirho][hidden] {
		display: none;
	}
	@media (max-width: 640px) {
		video[data-scene-video-chirho] {
			min-height: 0;
			height: auto;
			aspect-ratio: 3 / 2;
		}
	}
	.scene-video-play-chirho {
		font: inherit;
		font-size: 12px;
		padding: 5px 9px;
		margin: 10px 8px 0 0;
		border: 1px solid #9fb29a;
		border-radius: 7px;
		color: #2f4a36;
		background: #fffefa;
		cursor: pointer;
	}
	.scene-video-play-chirho:focus-visible {
		outline: 2px solid #405a89;
		outline-offset: 2px;
	}
	.scene-choice-chirho {
		display: flex;
		align-items: center;
		justify-content: space-between;
		flex-wrap: wrap;
		gap: 8px 16px;
		padding: 12px 16px;
		border-bottom: 1px solid var(--line-chirho, #d8dece);
		font-size: 12px;
		font-weight: 650;
	}
	.scene-choice-chirho select {
		max-width: 100%;
		min-width: 0;
		padding: 8px 28px 8px 10px;
		border: 1px solid #bac5b3;
		border-radius: 8px;
		background-color: #fffefa;
		color: #334b3a;
		font: inherit;
	}
	.scene-reading-note-chirho {
		margin: 12px 0 0;
		font-size: 12px;
		line-height: 1.6;
		font-style: normal;
	}
</style>
