<!-- For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life. — John 3:16 (KJV) -->
<script lang="ts">
	import { artworkUrlChirho } from '$lib/media-review-chirho/artwork-url-chirho';
	import ReportArtworkChirho from '$lib/media-review-chirho/ReportArtworkChirho.svelte';
	import { onMount } from 'svelte';
	import type { ScenePresentationChirho } from '$lib/domain-chirho/media-chirho';
	import { localeStateChirho } from '$lib/i18n-chirho/locale-state-chirho.svelte';
	import { readerTChirho } from '$lib/i18n-chirho/reader-messages-chirho';
	import { defineCatalogueChirho, translateChirho } from '$lib/i18n-chirho/translate-chirho';
	let {
		presentationChirho,
		verseIdChirho
	}: { presentationChirho: ScenePresentationChirho | null; verseIdChirho: string } = $props();
	const messagesChirho = defineCatalogueChirho({
		en: {
			image_version_chirho: 'Illustration',
			standard_chirho: 'Standard',
			reduced_chirho: 'Representation reduced'
		},
		es: {
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
				<ReportArtworkChirho
					assetPathChirho={sceneChirho.asset_path_chirho}
					sha256Chirho={sceneChirho.sha256_chirho}
					{verseIdChirho}
				/>
			</div>{/if}
	</figcaption>
</figure>

<style>
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
