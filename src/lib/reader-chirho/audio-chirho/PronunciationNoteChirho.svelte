<!-- For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life. — John 3:16 (KJV) -->
<script lang="ts">
	import { ipaNoteChirho } from '$lib/domain-chirho/pronunciation-chirho/ipa-trial-chirho';
	import {
		divineNameReadingChirho,
		DIVINE_NAME_SOURCE_CHIRHO
	} from '$lib/domain-chirho/pronunciation-chirho/divine-name-chirho';
	import type { TokenChirho } from '$lib/domain-chirho/lesson-chirho';
	import { localeStateChirho } from '$lib/i18n-chirho/locale-state-chirho.svelte';
	import { audioTChirho } from './audio-messages-chirho';
	let { tokenChirho, markerChirho = false }: { tokenChirho: TokenChirho; markerChirho?: boolean } =
		$props();
	const noteChirho = $derived(ipaNoteChirho(tokenChirho));
	const divineChirho = $derived(divineNameReadingChirho(tokenChirho));
</script>

{#if divineChirho && !markerChirho}
	<div
		class="pronunciation-note-chirho"
		data-annotation-chirho
		lang={localeStateChirho.currentChirho}
	>
		<p>
			<strong>{audioTChirho('pronunciation_note_chirho')}</strong>
			{divineChirho.name_chirho}
			<span class="ipa-transcription-chirho" dir="ltr" lang="he-fonipa"
				>/{divineChirho.ipa_chirho}/</span
			>
		</p>
		<p>
			{localeStateChirho.currentChirho === 'es'
				? 'Las consonantes escritas son YHWH. En la lectura tradicional, los puntos vocálicos indican Adonai; en ciertos contextos indican Elohim. No se leen simplemente combinando esos puntos con las cuatro consonantes. El texto mostrado conserva su forma original.'
				: 'The written consonants are YHWH. In the traditional reading, the vowel points cue Adonai; certain contexts cue Elohim. They are not simply sounded through with the four written consonants. The displayed text keeps its original form.'}
		</p>
		<a href={DIVINE_NAME_SOURCE_CHIRHO} target="_blank" rel="external noreferrer"
			>{localeStateChirho.currentChirho === 'es' ? 'Convención de lectura' : 'Reading convention'} ↗</a
		>
	</div>
{:else if noteChirho}
	{#if markerChirho && noteChirho.surprising_chirho}
		<a
			class="pronunciation-marker-chirho"
			href="#word-card-{tokenChirho.id_chirho}-chirho"
			data-word-jump-chirho="word-card-{tokenChirho.id_chirho}-chirho"
			data-annotation-chirho
			lang={localeStateChirho.currentChirho}
			aria-label={audioTChirho('pronunciation_note_chirho')}
			title={audioTChirho('pronunciation_note_chirho')}><span aria-hidden="true">※</span></a
		>
	{:else if !markerChirho}
		<div
			class="pronunciation-note-chirho"
			data-annotation-chirho
			lang={localeStateChirho.currentChirho}
		>
			<p>
				<strong>{audioTChirho('pronunciation_note_chirho')}</strong>
				<span class="ipa-transcription-chirho" dir="ltr" lang="he-fonipa"
					>/{noteChirho.ipa_chirho}/</span
				>
			</p>
			<p>{noteChirho.explanation_chirho[localeStateChirho.currentChirho]}</p>
			<p class="pronunciation-sources-chirho">
				{#each noteChirho.sources_chirho as sourceChirho (sourceChirho.url_chirho)}<a
						href={sourceChirho.url_chirho}
						target="_blank"
						rel="external noreferrer">{sourceChirho.label_chirho} ↗</a
					>{/each}
			</p>
		</div>
	{/if}
{/if}

<style>
	.pronunciation-marker-chirho {
		position: absolute;
		left: -8px;
		bottom: -7px;
		z-index: 2;
		display: grid;
		place-items: center;
		width: 21px;
		height: 21px;
		border: 1px dotted #8b672e;
		border-radius: 50%;
		background: #fffdf5;
		color: #795821;
		font:
			15px/1 Georgia,
			serif;
		text-decoration: none;
	}
	.pronunciation-marker-chirho:focus-visible {
		outline: 2px solid #405a89;
		outline-offset: 2px;
	}
	.pronunciation-note-chirho {
		margin: 1rem 0;
		padding: 0.75rem;
		border-inline-start: 3px solid #b6a078;
		background: #f8f5ed;
		border-radius: 4px;
	}
	.pronunciation-note-chirho p {
		margin: 0.25rem 0 0.5rem;
	}
	.ipa-transcription-chirho {
		display: inline-block;
		margin-inline-start: 0.4rem;
		font-family: 'Charis SIL', 'DejaVu Sans', sans-serif;
		font-size: 1.1rem;
		overflow-wrap: anywhere;
	}
	.pronunciation-sources-chirho {
		display: flex;
		flex-wrap: wrap;
		gap: 0.75rem;
		font-size: 0.8rem;
	}
</style>
