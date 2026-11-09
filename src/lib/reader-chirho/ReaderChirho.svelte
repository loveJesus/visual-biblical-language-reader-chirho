<!-- For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life. — John 3:16 (KJV) -->
<script lang="ts">
	import StudyAidLinkChirho from '$lib/bible-chirho/StudyAidLinkChirho.svelte';
	import { verseStudyNotesChirho } from '$lib/bible-chirho/study-aids-chirho';
	import { installIpaChirho } from './controls-chirho/ipa-controls-chirho';
	import SceneChirho from '$lib/reader-chirho/scene-chirho/SceneChirho.svelte';
	import PronunciationNoteChirho from './audio-chirho/PronunciationNoteChirho.svelte';
	import PictureNoteChirho from './PictureNoteChirho.svelte';
	import SourceNotesChirho from '$lib/bible-chirho/SourceNotesChirho.svelte';
	import { lexiconLinkChirho } from '$lib/bible-chirho/lexicon-links-chirho';
	import AudioVerseChirho from './audio-chirho/AudioVerseChirho.svelte';
	import ReadingCreditChirho from './audio-chirho/ReadingCreditChirho.svelte';
	import type { RecordingChirho } from './audio-chirho/recordings-chirho';
	import SpeechButtonChirho from './audio-chirho/SpeechButtonChirho.svelte';
	import { installSpeechChirho } from './audio-chirho/speech-controls-chirho';
	import { spokenWordChirho } from '$lib/domain-chirho/pronunciation-chirho';
	import { onMount, type Snippet } from 'svelte';
	import { lemmaKeyChirho, type LessonChirho } from '$lib/domain-chirho/lesson-chirho';
	import { cuesChirho } from '$lib/domain-chirho/cues-chirho';
	import { installHelpChirho } from './controls-chirho/help-controls-chirho';
	import { installMediaChirho } from './controls-chirho/media-controls-chirho';
	import { installGlossesChirho } from './controls-chirho/gloss-controls-chirho';
	import { installWordNavigationChirho } from './controls-chirho/word-controls-chirho';
	import type { GlossLanguageChirho } from '$lib/domain-chirho/glosses-chirho';
	import type { ContextualIconChirho } from '$lib/domain-chirho/media-chirho';
	import GrammarChirho from './GrammarChirho.svelte';
	import VerseChirho from './VerseChirho.svelte';
	import SourceCreditChirho from './SourceCreditChirho.svelte';
	import SpanishWordGlossChirho from './SpanishWordGlossChirho.svelte';
	import {
		readerPartsChirho,
		readerTChirho,
		spanishNoticeChirho
	} from '$lib/i18n-chirho/reader-messages-chirho';
	import {
		bookNameChirho,
		morphologySummaryLocalizedChirho,
		referenceChirho
	} from '$lib/i18n-chirho/labels-chirho';
	import { localeStateChirho } from '$lib/i18n-chirho/locale-state-chirho.svelte';
	import {
		readyLayerChirho,
		type SpanishLayerResultChirho
	} from '$lib/i18n-chirho/spanish-glosses-chirho';
	let {
		introVisibleChirho = false,
		lessonChirho,
		lemmaLinksChirho,
		presentationChirho,
		languagesChirho,
		iconsChirho,
		headerChirho,
		verseNavigationChirho,
		spanishChirho = null,
		videoChirho = null,
		artProgressChirho = null,
		navigationGenerationChirho = 0,
		onRecordingsReadyChirho
	}: {
		/** This book's artwork counts, listed in the Sources fold. */
		artProgressChirho?: string | null;
		navigationGenerationChirho?: number;
		onRecordingsReadyChirho?: (lessonIdChirho: string, generationChirho: number) => void;
		/** The chapter catalogue's record for this verse, unvalidated; the scene and player check it. */
		videoChirho?: unknown;
		spanishChirho?: SpanishLayerResultChirho | null;
		headerChirho?: Snippet;
		verseNavigationChirho?: Snippet<[Snippet]>;
		introVisibleChirho?: boolean;
		lessonChirho: LessonChirho;
		iconsChirho: Record<string, ContextualIconChirho>;
		languagesChirho: GlossLanguageChirho[];
		lemmaLinksChirho: Record<string, string>;
		presentationChirho: import('$lib/domain-chirho/media-chirho').ScenePresentationChirho | null;
	} = $props();
	let readerElementChirho = $state<HTMLDivElement>();
	// A caution repeated by every word is shown once, folded with the sources; cards keep their own notes.
	const studyNotesChirho = $derived(verseStudyNotesChirho(lessonChirho.tokens_chirho));
	let humanReadingChirho = $state<RecordingChirho | null>(null);
	let speechControlsChirho = $state<ReturnType<typeof installSpeechChirho>>();
	$effect(() => {
		void lessonChirho.id_chirho;
		speechControlsChirho?.stopChirho();
		speechControlsChirho?.refreshChirho();
	});
	let spanishLayerChirho = $derived(readyLayerChirho(spanishChirho));
	let uhgPartsChirho = $derived(readerPartsChirho('uhg_note_chirho', 'license_chirho'));
	let sourcesShownChirho = $derived(
		spanishLayerChirho
			? [...lessonChirho.sources_chirho, spanishLayerChirho.sourceChirho]
			: lessonChirho.sources_chirho
	);
	let defaultGlossChirho = $derived(
		localeStateChirho.currentChirho === 'es' ? 'es-gbt-chirho' : 'app'
	);
	let referenceLabelChirho = $derived(
		referenceChirho(lessonChirho.id_chirho, localeStateChirho.currentChirho)
	);
	$effect(() => {
		// A new passage or interface language resets the reveal and opens the lower word cards.
		void lessonChirho.id_chirho;
		void localeStateChirho.currentChirho;
		for (const detailsChirho of readerElementChirho?.querySelectorAll<HTMLDetailsElement>(
			'.translation-chirho, .word-details-chirho'
		) ?? [])
			detailsChirho.open = detailsChirho.classList.contains('word-details-chirho');
	});
	$effect(() => {
		// Follow the interface, including an explicit unavailable notice for a withheld Spanish layer.
		void lessonChirho.id_chirho;
		const glossDefaultChirho = defaultGlossChirho;
		for (const blockChirho of readerElementChirho?.querySelectorAll<HTMLElement>(
			'[data-gloss-language-chirho]'
		) ?? [])
			blockChirho.hidden = blockChirho.dataset.glossLanguageChirho !== glossDefaultChirho;
		const selectChirho = readerElementChirho?.querySelector(
			'[data-gloss-select-chirho]'
		) as unknown as HTMLSelectElement | null;
		if (selectChirho) selectChirho.value = glossDefaultChirho;
	});
	onMount(() => {
		const helpChirho = installHelpChirho(document);
		const ipaChirho = installIpaChirho(document);
		const mediaChirho = installMediaChirho(document);
		const glossesChirho = installGlossesChirho(document);
		const wordsChirho = installWordNavigationChirho(document);
		speechControlsChirho = installSpeechChirho(document);
		return () => {
			speechControlsChirho?.destroyChirho();
			ipaChirho();
			helpChirho();
			mediaChirho();
			glossesChirho();
			wordsChirho();
		};
	});
</script>

<div class="page-shell-chirho" bind:this={readerElementChirho}>
	<section class="reader-document-chirho">
		{#if headerChirho}{@render headerChirho()}{/if}
		<div class="lesson-heading-chirho">
			<div>
				<p class="eyebrow-chirho">{readerTChirho('eyebrow_hebrew_chirho')}</p>
				{#if introVisibleChirho}<h2 class="passage-title-chirho">
						{referenceLabelChirho}
					</h2>{:else}<h1>{referenceLabelChirho}</h1>{/if}
				{#if lessonChirho.kjv_verse_id_chirho}<p class="quiet-note-chirho">
						{readerTChirho('kjv_numbering_chirho', {
							reference_chirho: referenceChirho(lessonChirho.kjv_verse_id_chirho, 'en')
						})}
					</p>{/if}
			</div>
			<span class="lesson-count-chirho"
				>{bookNameChirho(
					lessonChirho.id_chirho.split('.')[0],
					localeStateChirho.currentChirho
				)}</span
			>
		</div>
		<section class="reading-grid-chirho" aria-label={readerTChirho('reading_grid_hebrew_chirho')}>
			<div class="verse-panel-chirho">
				<AudioVerseChirho
					{lessonChirho}
					{verseNavigationChirho}
					{videoChirho}
					{navigationGenerationChirho}
					onReadyChirho={onRecordingsReadyChirho}
					onHumanReadingChirho={(readingChirho) => (humanReadingChirho = readingChirho)}
				/>
				<SourceNotesChirho notesChirho={lessonChirho.source_notes_chirho} />
				<VerseChirho {lessonChirho} {iconsChirho} />
				<div class="verse-bottom-chirho">
					<span class="small-note-chirho">{readerTChirho('read_rtl_chirho')}</span>
					<details class="translation-chirho">
						<summary
							>{readerTChirho('show_translation_chirho')}
							<span aria-hidden="true">＋</span></summary
						>
						<div data-gloss-language-chirho="app">
							<p>
								{lessonChirho.translation_chirho ??
									lessonChirho.tokens_chirho
										.map((tokenChirho) => tokenChirho.gloss_chirho ?? '…')
										.join(' · ')}
							</p>
							<small
								>{lessonChirho.translation_chirho
									? readerTChirho('app_gloss_note_chirho')
									: readerTChirho('gbt_order_note_chirho')}</small
							>
						</div>
						{#each languagesChirho as languageChirho (languageChirho.id_chirho)}<div
								data-gloss-language-chirho={languageChirho.id_chirho}
								hidden
							>
								<p dir={languageChirho.direction_chirho} lang={languageChirho.lang_chirho}>
									{languageChirho.words_chirho
										.map((wordChirho) => wordChirho.gloss_chirho)
										.join(' · ')}
								</p>
								<small
									>{readerTChirho('language_order_note_chirho', {
										label_chirho: languageChirho.label_chirho,
										date_chirho: languageChirho.file_updated_at_chirho.slice(0, 10)
									})}</small
								>
							</div>{/each}
						<div data-gloss-language-chirho="es-gbt-chirho" hidden lang="es">
							{#if spanishLayerChirho}<p>
									{lessonChirho.tokens_chirho
										.map(
											(tokenChirho) =>
												spanishLayerChirho.glossesChirho[tokenChirho.id_chirho] ?? '…'
										)
										.join(' · ')}
								</p>
								<small>{readerTChirho('spanish_order_note_chirho')}</small>
							{:else}<small>{spanishNoticeChirho(spanishChirho)}</small>{/if}
						</div>
					</details>
				</div>
			</div>
			<SceneChirho
				{presentationChirho}
				verseIdChirho={lessonChirho.id_chirho}
				{videoChirho}
				canonicalTextChirho={lessonChirho.canonical_text_chirho}
			/>
		</section>
		<GrammarChirho
			lessonNoteChirho={(presentationChirho?.representation_reduced_chirho
				? null
				: presentationChirho?.reading_note_chirho) ?? readerTChirho('grammar_fallback_chirho')}
			lessonNoteLangChirho={presentationChirho ? 'en' : localeStateChirho.currentChirho}
		/>
		<section class="words-section-chirho" aria-labelledby="words-heading-chirho">
			<div class="section-heading-chirho">
				<div>
					<p class="eyebrow-chirho">{readerTChirho('words_eyebrow_chirho')}</p>
					<h2 id="words-heading-chirho">{readerTChirho('words_heading_chirho')}</h2>
				</div>
				<div class="gloss-select-field-chirho">
					<label for="meaning-language-chirho">{readerTChirho('meaning_language_chirho')}</label
					><select id="meaning-language-chirho" data-gloss-select-chirho
						><option value="app">{readerTChirho('option_app_chirho')}</option><option
							value="es-gbt-chirho"
							>{readerTChirho('option_gbt_chirho', { label_chirho: 'Español' })}</option
						>{#each languagesChirho as languageChirho (languageChirho.id_chirho)}<option
								value={languageChirho.id_chirho}
								>{readerTChirho('option_gbt_chirho', {
									label_chirho: languageChirho.label_chirho
								})}</option
							>{/each}</select
					><small>{readerTChirho('cards_open_note_chirho')}</small>
				</div>
			</div>
			<div class="word-cards-chirho">
				{#each lessonChirho.tokens_chirho as tokenChirho, indexChirho (tokenChirho.id_chirho)}
					{@const linkChirho = lexiconLinkChirho(
						tokenChirho,
						localeStateChirho.currentChirho,
						lemmaLinksChirho
					)}
					<article
						class="word-card-chirho"
						id="word-card-{tokenChirho.id_chirho}-chirho"
						tabindex="-1"
						style:--gender-chirho={cuesChirho(tokenChirho).background_chirho}
					>
						<a
							class="back-to-verse-chirho"
							href="#verse-word-{tokenChirho.id_chirho}-chirho"
							data-word-jump-chirho="verse-word-{tokenChirho.id_chirho}-chirho"
							><span aria-hidden="true">↑</span> {readerTChirho('back_to_verse_chirho')}</a
						>
						<div class="word-card-top-chirho">
							<span class="card-hebrew-chirho" dir="rtl" lang="he">{tokenChirho.text_chirho}</span
							>{#if linkChirho}<a
									class="lemma-link-chirho"
									href={linkChirho.href_chirho}
									target="_blank"
									rel="external noreferrer"
									>{lemmaKeyChirho(tokenChirho)}{#if linkChirho.kind_chirho === 'search'}
										· {readerTChirho('lemma_search_chirho')}{/if} ↗<span class="sr-only-chirho">
										{linkChirho.kind_chirho === 'entry'
											? readerTChirho('lemma_open_chirho')
											: ''}</span
									></a
								>{:else}<span class="small-note-chirho"
									>{readerTChirho('lemma_unverified_chirho')}</span
								>{/if}
						</div>
						<SpeechButtonChirho
							tokenIdChirho={tokenChirho.id_chirho}
							textChirho={spokenWordChirho(tokenChirho)}
							languageChirho="he"
							unavailableChirho={tokenChirho.source_language_chirho === 'arc'}
							wordChirho
						/>
						{#if tokenChirho.root_text_chirho}<p class="root-line-chirho">
								<span class="root-status-chirho"
									>{tokenChirho.root_status_chirho === 'not_applicable'
										? readerTChirho('root_not_applicable_chirho')
										: tokenChirho.root_status_chirho === 'traditional'
											? readerTChirho('root_traditional_chirho')
											: readerTChirho('root_unresolved_chirho')}</span
								>
								{readerTChirho('root_relationship_chirho')}
								<span dir="rtl" lang="he">{tokenChirho.root_text_chirho ?? '—'}</span>
							</p>{/if}
						<p class="morphology-chirho">
							{morphologySummaryLocalizedChirho(tokenChirho, localeStateChirho.currentChirho)}
						</p>
						<PictureNoteChirho
							iconChirho={iconsChirho[tokenChirho.id_chirho]}
							verseIdChirho={lessonChirho.id_chirho}
						/>
						<details class="word-details-chirho" open>
							<summary>{readerTChirho('meaning_morphology_chirho')}</summary>
							<div>
								<div data-gloss-language-chirho="app">
									<p class="word-gloss-chirho" lang="en">
										{tokenChirho.gloss_chirho ?? readerTChirho('gloss_unavailable_chirho')}
									</p>
									<small class="gloss-source-chirho"
										>{(tokenChirho.gloss_origin_chirho ?? lessonChirho.gloss_origin_chirho) ===
										'gbt_approved'
											? 'GBT'
											: tokenChirho.gloss_chirho
												? 'Hinneh'
												: ''}</small
									>
								</div>
								{#each languagesChirho as languageChirho (languageChirho.id_chirho)}<div
										data-gloss-language-chirho={languageChirho.id_chirho}
										hidden
									>
										<p
											class="word-gloss-chirho"
											dir={languageChirho.direction_chirho}
											lang={languageChirho.lang_chirho}
										>
											{languageChirho.words_chirho[indexChirho].gloss_chirho}
										</p>
										<small class="gloss-source-chirho">GBT</small>
									</div>{/each}
								<div data-gloss-language-chirho="es-gbt-chirho" hidden>
									<SpanishWordGlossChirho {spanishChirho} tokenIdChirho={tokenChirho.id_chirho} />
								</div>
								<p lang="en">{tokenChirho.analysis_chirho}</p>
								<PronunciationNoteChirho {tokenChirho} />
								{#if tokenChirho.qere_chirho?.length}<div class="qere-reading-chirho">
										<p>{readerTChirho('qere_label_chirho')}</p>
										{#each tokenChirho.qere_chirho as readingChirho (readingChirho.id_chirho)}<p
												dir="rtl"
												lang="he"
											>
												{readingChirho.text_chirho}
											</p>
											<p lang="en">{readingChirho.gloss_chirho}</p>{/each}<small
											>{readerTChirho('qere_note_chirho')}</small
										>
									</div>{/if}
								{#if tokenChirho.root_text_chirho}<p lang="en">
										{tokenChirho.root_note_chirho}
									</p>{/if}
								{#if studyNotesChirho.cardNotesChirho.get(tokenChirho.id_chirho)}<p lang="en">
										{studyNotesChirho.cardNotesChirho.get(tokenChirho.id_chirho)}
									</p>{/if}
								{#if studyNotesChirho.verseNotesChirho.length}<p class="verse-note-link-chirho">
										<a href="#verse-notes-chirho" data-word-jump-chirho="verse-notes-chirho"
											>{readerTChirho('verse_note_link_chirho')}</a
										>
									</p>{/if}
								<p class="raw-morphology-chirho">
									OSHB: <code>{tokenChirho.raw_morphology_chirho}</code>
								</p>
							</div>
						</details>
						<StudyAidLinkChirho />
					</article>
				{/each}
			</div>
		</section>
		<section class="source-section-chirho" aria-labelledby="source-heading-chirho">
			<div class="section-heading-chirho">
				<div>
					<p class="eyebrow-chirho">{readerTChirho('source_eyebrow_chirho')}</p>
					<h2 id="source-heading-chirho">{readerTChirho('source_heading_chirho')}</h2>
				</div>
			</div>
			<details class="canonical-details-chirho">
				<summary>{readerTChirho('reveal_canonical_hebrew_chirho')}</summary>
				<p class="canonical-chirho" dir="rtl" lang="he">{lessonChirho.canonical_text_chirho}</p>
				<p class="quiet-note-chirho">
					{readerTChirho('canonical_note_chirho')}
				</p>
			</details>
			<div class="source-notes-chirho">
				<StudyAidLinkChirho />
			</div>
			{#if studyNotesChirho.verseNotesChirho.length}
				<!-- Workflow: local-reader-chirho.md. A caution every word shares is kept once, folded here. -->
				<details class="verse-notes-chirho" id="verse-notes-chirho" tabindex="-1">
					<summary>{readerTChirho('verse_notes_summary_chirho')}</summary>
					{#each studyNotesChirho.verseNotesChirho as noteChirho (noteChirho)}<p lang="en">
							{noteChirho}
						</p>{/each}
				</details>
			{/if}
			<details class="sources-details-chirho">
				<summary>{readerTChirho('sources_summary_chirho')}</summary>
				<ul>
					{#if humanReadingChirho}<li>
							<ReadingCreditChirho readingChirho={humanReadingChirho} />
						</li>{/if}
					<!-- L.J. (2026-11-07): credits live in this info fold, not the main reading flow. -->
					<li><SourceCreditChirho languageChirho="he" /></li>
					{#each languagesChirho as languageChirho (languageChirho.id_chirho)}<li>
							<a href={languageChirho.source_url_chirho} rel="external noreferrer" target="_blank"
								>Global Bible Tools · {languageChirho.label_chirho} ↗</a
							>
							<p>{languageChirho.attribution_chirho}</p>
							<p>{languageChirho.license_chirho}</p>
							<small
								>{readerTChirho('export_line_chirho', {
									exported_chirho: languageChirho.exported_at_chirho,
									updated_chirho: languageChirho.file_updated_at_chirho,
									revision_chirho: languageChirho.revision_chirho,
									sha_chirho: languageChirho.source_sha256_chirho
								})}</small
							>
						</li>{/each}
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
					<li>
						<a
							href="https://uhg.readthedocs.io/en/stable/"
							hreflang="en"
							target="_blank"
							rel="external noreferrer">unfoldingWord Hebrew Grammar ↗</a
						>
						<p>
							{uhgPartsChirho[0]}<a
								href="https://creativecommons.org/licenses/by-sa/4.0/"
								target="_blank"
								rel="external noreferrer">CC BY-SA 4.0</a
							>{uhgPartsChirho[1]}
						</p>
					</li>
					{#if artProgressChirho}<li><p>{artProgressChirho}</p></li>{/if}
				</ul>
			</details>
		</section>
	</section>
</div>
