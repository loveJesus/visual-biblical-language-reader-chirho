<!-- For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life. — John 3:16 (KJV) -->
<script lang="ts">
	import SceneChirho from '$lib/reader-chirho/scene-chirho/SceneChirho.svelte';
	import PictureNoteChirho from '../PictureNoteChirho.svelte';
	import AudioVerseChirho from '../audio-chirho/AudioVerseChirho.svelte';
	import SpeechButtonChirho from '../audio-chirho/SpeechButtonChirho.svelte';
	import { installSpeechChirho } from '../audio-chirho/speech-controls-chirho';
	import { onMount, type Snippet } from 'svelte';
	import GreekGrammarChirho from './GreekGrammarChirho.svelte';
	import { installHelpChirho } from '../controls-chirho/help-controls-chirho';
	import { installWordNavigationChirho } from '../controls-chirho/word-controls-chirho';
	import type { GreekLessonChirho } from '$lib/domain-chirho/greek-chirho';
	import type {
		ContextualIconChirho,
		ScenePresentationChirho
	} from '$lib/domain-chirho/media-chirho';
	import GreekPassageChirho from './GreekPassageChirho.svelte';
	import SourceCreditChirho from '../SourceCreditChirho.svelte';
	import SpanishWordGlossChirho from '../SpanishWordGlossChirho.svelte';
	import {
		bookNameChirho,
		greekAnalysisLocalizedChirho,
		referenceChirho
	} from '$lib/i18n-chirho/labels-chirho';
	import { localeStateChirho } from '$lib/i18n-chirho/locale-state-chirho.svelte';
	import { readerTChirho } from '$lib/i18n-chirho/reader-messages-chirho';
	import {
		readyLayerChirho,
		type SpanishLayerResultChirho
	} from '$lib/i18n-chirho/spanish-glosses-chirho';
	let {
		introVisibleChirho = false,
		lessonChirho,
		headerChirho,
		verseNavigationChirho,
		presentationChirho = null,
		iconsChirho = {},
		spanishChirho = null
	}: {
		introVisibleChirho?: boolean;
		lessonChirho: GreekLessonChirho;
		headerChirho: Snippet;
		verseNavigationChirho?: Snippet<[Snippet]>;
		presentationChirho?: ScenePresentationChirho | null;
		iconsChirho?: Record<string, ContextualIconChirho>;
		spanishChirho?: SpanishLayerResultChirho | null;
	} = $props();
	const spanishLayerChirho = $derived(readyLayerChirho(spanishChirho));
	const referenceLabelChirho = $derived(
		referenceChirho(lessonChirho.id_chirho, localeStateChirho.currentChirho)
	);
	const sourcesShownChirho = $derived(
		spanishLayerChirho
			? [...lessonChirho.sources_chirho, spanishLayerChirho.sourceChirho]
			: lessonChirho.sources_chirho
	);
	let speechControlsChirho = $state<ReturnType<typeof installSpeechChirho>>();
	$effect(() => {
		void lessonChirho.id_chirho;
		speechControlsChirho?.stopChirho();
		speechControlsChirho?.refreshChirho();
	});

	onMount(() => {
		const helpChirho = installHelpChirho(document);
		const wordsChirho = installWordNavigationChirho(document);
		speechControlsChirho = installSpeechChirho(document);
		return () => {
			speechControlsChirho?.destroyChirho();
			helpChirho();
			wordsChirho();
		};
	});
</script>

<div class="page-shell-chirho">
	<section class="reader-document-chirho">
		{@render headerChirho()}
		<div class="lesson-heading-chirho">
			<div>
				<p class="eyebrow-chirho">{readerTChirho('eyebrow_greek_chirho')}</p>
				{#if introVisibleChirho}<h2 class="passage-title-chirho">
						{referenceLabelChirho}
					</h2>{:else}<h1>{referenceLabelChirho}</h1>{/if}
			</div>
			<span class="lesson-count-chirho"
				>{bookNameChirho(
					lessonChirho.id_chirho.split('.')[0],
					localeStateChirho.currentChirho
				)}</span
			>
		</div>
		<section class="reading-grid-chirho" aria-label={readerTChirho('reading_grid_greek_chirho')}>
			<div class="verse-panel-chirho">
				<AudioVerseChirho {lessonChirho} {verseNavigationChirho} />
				{#key lessonChirho.id_chirho}<GreekPassageChirho
						{lessonChirho}
						{iconsChirho}
						{spanishLayerChirho}
					/>{/key}
				<div class="verse-bottom-chirho">
					<span class="small-note-chirho">{readerTChirho('read_ltr_chirho')}</span>
				</div>
			</div>
			<SceneChirho {presentationChirho} verseIdChirho={lessonChirho.id_chirho} />
		</section>

		<GreekGrammarChirho />
		<section class="words-section-chirho" aria-labelledby="greek-words-heading-chirho">
			<div class="section-heading-chirho">
				<div>
					<p class="eyebrow-chirho">{readerTChirho('words_eyebrow_chirho')}</p>
					<h2 id="greek-words-heading-chirho">{readerTChirho('words_heading_chirho')}</h2>
				</div>
			</div>
			<div class="word-cards-chirho">
				{#each lessonChirho.tokens_chirho as tokenChirho (tokenChirho.id_chirho)}
					<article
						class="word-card-chirho"
						id="word-card-{tokenChirho.id_chirho}-chirho"
						tabindex="-1"
						style:--gender-chirho={tokenChirho.gender_chirho === 'masculine'
							? '#dff0ff'
							: tokenChirho.gender_chirho === 'feminine'
								? '#ffe4ed'
								: tokenChirho.gender_chirho === 'neuter'
									? '#ecefe9'
									: 'transparent'}
					>
						<div class="word-card-top-chirho">
							<span class="card-hebrew-chirho" lang="grc" dir="ltr">{tokenChirho.text_chirho}</span
							><span class="small-note-chirho">{tokenChirho.lemma_id_chirho}</span>
						</div>
						<SpeechButtonChirho
							tokenIdChirho={tokenChirho.id_chirho}
							textChirho={tokenChirho.text_chirho}
							languageChirho="grc"
							wordChirho
						/>
						<p class="morphology-chirho">
							{greekAnalysisLocalizedChirho(tokenChirho, localeStateChirho.currentChirho)}
						</p>
						<PictureNoteChirho
							iconChirho={iconsChirho[tokenChirho.id_chirho]}
							verseIdChirho={lessonChirho.id_chirho}
						/>
						<details class="word-details-chirho" open>
							<summary>{readerTChirho('meaning_morphology_chirho')}</summary>
							<div>
								{#if localeStateChirho.currentChirho === 'es'}<SpanishWordGlossChirho
										{spanishChirho}
										tokenIdChirho={tokenChirho.id_chirho}
									/>{/if}
								{#if tokenChirho.gloss_chirho === null || tokenChirho.gloss_chirho === '-'}<p
										class="word-gloss-chirho"
									>
										{readerTChirho(
											tokenChirho.gloss_chirho === null
												? 'origin_unavailable_chirho'
												: 'not_separately_translated_chirho'
										)}
									</p>{:else}<p class="word-gloss-chirho" lang="en">
										{tokenChirho.gloss_chirho}
									</p>{/if}
								<small>{readerTChirho('berean_gloss_note_chirho')}</small>
								<p>
									{readerTChirho('lexical_form_chirho')}
									<span lang="grc">{tokenChirho.lexical_form_chirho}</span> · {tokenChirho.lemma_id_chirho}
								</p>
								<p>
									{readerTChirho('source_morphology_chirho')}
									<code>{tokenChirho.raw_morphology_chirho}</code>
								</p>
								{#if tokenChirho.source_note_chirho}<p class="quiet-note-chirho" lang="en">
										{tokenChirho.source_note_chirho}
									</p>{/if}
								{#each lessonChirho.source_notes_chirho ?? [] as noteChirho, indexChirho (indexChirho)}
									{#if noteChirho.kind_chirho === 'gloss_editor_note' && noteChirho.before_token_id_chirho === tokenChirho.id_chirho}<p
											class="quiet-note-chirho"
										>
											{readerTChirho('source_editor_note_chirho')}
											<span lang="en">{noteChirho.text_chirho}</span>
										</p>{/if}
								{/each}
							</div>
						</details>
					</article>{/each}
			</div>
		</section>

		<section
			class="source-section-chirho greek-sources-chirho"
			aria-labelledby="greek-source-heading-chirho"
		>
			<div class="section-heading-chirho">
				<div>
					<p class="eyebrow-chirho">{readerTChirho('source_eyebrow_chirho')}</p>
					<h2 id="greek-source-heading-chirho">{readerTChirho('source_heading_chirho')}</h2>
				</div>
			</div>
			<p class="quiet-note-chirho">{readerTChirho('greek_sources_note_chirho')}</p>
			{#if localeStateChirho.currentChirho === 'es'}<p class="quiet-note-chirho">
					{readerTChirho('greek_spanish_note_chirho')}
				</p>{/if}
			{#if presentationChirho?.reading_note_chirho && !presentationChirho.representation_reduced_chirho}<p
					class="quiet-note-chirho"
					lang="en"
				>
					{presentationChirho.reading_note_chirho}
				</p>{/if}
			<SourceCreditChirho languageChirho="grc" />
			{#each lessonChirho.source_notes_chirho ?? [] as noteChirho, indexChirho (indexChirho)}
				{#if noteChirho.kind_chirho === 'parenthesized_passage'}<p
						class="quiet-note-chirho"
						lang="en"
					>
						{noteChirho.text_chirho}
					</p>{/if}
			{/each}
			<details class="canonical-details-chirho">
				<summary>{readerTChirho('reveal_canonical_greek_chirho')}</summary>
				<p class="canonical-chirho" lang="grc" dir="ltr">{lessonChirho.canonical_text_chirho}</p>
				<p class="quiet-note-chirho">{readerTChirho('copy_note_chirho')}</p>
			</details>
			<details class="sources-details-chirho">
				<summary>{readerTChirho('sources_licenses_chirho')}</summary>
				<ul>
					{#each sourcesShownChirho as sourceChirho (sourceChirho.id_chirho)}<li>
							{#if sourceChirho.url_chirho}<a
									href={sourceChirho.url_chirho}
									target="_blank"
									rel="external noreferrer">{sourceChirho.title_chirho} ↗</a
								>{:else}<strong>{sourceChirho.title_chirho}</strong>{/if}
							<p lang="en">{sourceChirho.attribution_chirho} · {sourceChirho.license_chirho}</p>
							<small
								>{readerTChirho('revision_chirho', {
									revision_chirho: sourceChirho.revision_chirho
								})}<br />SHA-256 {sourceChirho.sha256_chirho}</small
							>
						</li>{/each}
				</ul>
			</details>
		</section>
	</section>
</div>

<style>
	:global(.greek-pronoun-key-chirho) {
		border: 2px dashed #7c8589;
		border-radius: 1em;
	}
	:global(.greek-article-key-chirho) {
		border: 2px solid #7c8589;
		border-radius: 1em;
	}
	:global(.greek-neuter-key-chirho) {
		background: #ecefe9;
	}
	.greek-sources-chirho {
		overflow-wrap: anywhere;
	}
</style>
