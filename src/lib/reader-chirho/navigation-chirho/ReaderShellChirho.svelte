<!-- For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life. — John 3:16 (KJV) -->
<script lang="ts">
	import { SvelteMap } from 'svelte/reactivity';
	import { onMount, untrack, tick as tickChirho } from 'svelte';
	import { browser as browserChirho } from '$app/environment';
	import { replaceState as replaceStateChirho } from '$app/navigation';
	import type { LessonChirho } from '$lib/domain-chirho/lesson-chirho';
	import type { GreekLessonChirho } from '$lib/domain-chirho/greek-chirho';
	import type { GlossLanguageChirho } from '$lib/domain-chirho/glosses-chirho';
	import type {
		ContextualIconChirho,
		ScenePresentationChirho
	} from '$lib/domain-chirho/media-chirho';
	import { iconsForLessonChirho, validateScenesChirho } from '$lib/domain-chirho/media-chirho';
	import ReaderChirho from '../ReaderChirho.svelte';
	import GreekReaderChirho from '../greek-chirho/GreekReaderChirho.svelte';
	import { BIBLE_BOOKS_CHIRHO, bibleBookChirho } from '$lib/bible-chirho/books-chirho';
	import {
		createBibleClientChirho,
		verseNumbersChirho
	} from '$lib/bible-chirho/content-client-chirho';
	import { openingPassageChirho } from './opening-passage-chirho';
	import type { ChapterEntryChirho } from './corpus-client-chirho';
	import { fetchChapterMediaChirho } from './media-client-chirho';
	import { readerTChirho, type ReaderKeyChirho } from '$lib/i18n-chirho/reader-messages-chirho';
	import { bookNameChirho } from '$lib/i18n-chirho/labels-chirho';
	import {
		createSpanishGlossClientChirho,
		type SpanishLayerResultChirho
	} from '$lib/i18n-chirho/spanish-glosses-chirho';
	import { resolve as resolveChirho } from '$app/paths';
	import { page as pageChirho } from '$app/state';
	import {
		isLocaleChirho,
		LOCALE_QUERY_CHIRHO,
		type LocaleChirho
	} from '$lib/i18n-chirho/locale-chirho';
	import {
		initLocaleChirho,
		localeStateChirho,
		setLocaleChirho
	} from '$lib/i18n-chirho/locale-state-chirho.svelte';
	let {
		introVisibleChirho = false,
		initialLessonChirho,
		lemmaLinksChirho,
		initialPresentationChirho,
		initialLanguagesChirho,
		initialIconsChirho,
		scenesChirho
	}: {
		introVisibleChirho?: boolean;
		initialLessonChirho: LessonChirho;
		lemmaLinksChirho: Record<string, string>;
		initialPresentationChirho: {
			asset_path_chirho: string;
			alt_chirho: string;
			width_chirho: number;
			height_chirho: number;
			reading_note_chirho: string;
		};
		initialLanguagesChirho: GlossLanguageChirho[];
		initialIconsChirho: Record<string, ContextualIconChirho>;
		scenesChirho: Record<string, ScenePresentationChirho>;
	} = $props();
	type BookChirho = string;
	// Keep at most three books' single-chapter caches, even after browsing the entire canon.
	const clientsChirho = new SvelteMap<string, ReturnType<typeof createBibleClientChirho>>();
	function clientForBookChirho(bookChirho: BookChirho) {
		let clientChirho = clientsChirho.get(bookChirho);
		if (!clientChirho) {
			clientChirho = createBibleClientChirho(bookChirho);
			clientsChirho.set(bookChirho, clientChirho);
			if (clientsChirho.size > 3) clientsChirho.delete(clientsChirho.keys().next().value!);
		}
		return clientChirho;
	}
	function bookLabelChirho(bookChirho: BookChirho) {
		return bookNameChirho(bookChirho, localeStateChirho.currentChirho);
	}
	let bookChirho = $state<BookChirho>('Prov');
	let greekLessonChirho = $state<GreekLessonChirho | null>(null);
	let chaptersChirho = $state<ChapterEntryChirho[]>([]);
	let chapterChirho = $state(26);
	let verseChirho = $state(1);
	let lessonChirho = $state(untrack(() => initialLessonChirho));
	let loadingChirho = $state(false);
	let errorChirho = $state<ReaderKeyChirho | ''>('');
	let requestChirho = 0;
	let curatedChirho = $derived(lessonChirho.id_chirho === 'Prov.26.1');
	let workerScenesChirho = $state<Record<string, ScenePresentationChirho>>({});
	let workerIconsChirho = $state<unknown>({ schema_version_chirho: 1, icons_chirho: [] });
	let mediaReadyChirho = $state(false);
	let mediaFetchedAtChirho = 0;
	let mediaKeyChirho = '';
	let mediaRequestChirho = 0;
	let mediaSceneCountChirho = $state(0);
	let mediaLemmaCountChirho = $state(0);
	let contextualIconsChirho = $derived(iconsForLessonChirho(workerIconsChirho, lessonChirho));
	let verseChoicesChirho = $derived(
		chaptersChirho[chapterChirho - 1] ? verseNumbersChirho(chaptersChirho[chapterChirho - 1]) : [1]
	);
	let verseCountChirho = $derived(verseChoicesChirho.at(-1) ?? 1);
	// The chooser also writes ?lang_chirho=, because an explicit query wins on load: a refresh or a
	// shared link then keeps the language last chosen. The verse fragment stays as it is.
	function chooseLocaleChirho(localeChirho: LocaleChirho): void {
		if (!browserChirho) return;
		setLocaleChirho(localeChirho);
		// Persist the URL in this same event, before a reload can restore an older query value.
		const urlChirho = new URL(window.location.href);
		if (urlChirho.searchParams.get(LOCALE_QUERY_CHIRHO) === localeChirho) return;
		urlChirho.searchParams.set(LOCALE_QUERY_CHIRHO, localeChirho);
		// This single-page reader lives at the root route; only its query and fragment change.
		replaceStateChirho(
			resolveChirho(`/?${urlChirho.searchParams.toString()}${urlChirho.hash}` as const),
			pageChirho.state
		);
	}
	const spanishClientChirho = createSpanishGlossClientChirho();
	let spanishChirho = $state<SpanishLayerResultChirho | null>(null);
	// The passage in the URL is applied first, so a deep link fetches only its own chapter's layer.
	let restoredChirho = $state(false);
	$effect(() => {
		// Only the chapter being read is fetched, only while the interface is Spanish, and only
		// when its layer was built from exactly this verified chapter.
		const localeChirho = localeStateChirho.currentChirho;
		const layerBookChirho = bookChirho;
		const layerChapterChirho = chapterChirho;
		const contentChirho = chaptersChirho[layerChapterChirho - 1];
		spanishChirho = null;
		if (!restoredChirho || localeChirho !== 'es' || !contentChirho) return;
		let liveChirho = true;
		spanishClientChirho
			.chapterLayerChirho(layerBookChirho, layerChapterChirho, contentChirho)
			.then((resultChirho) => {
				if (liveChirho) spanishChirho = resultChirho;
			})
			.catch(() => {
				if (liveChirho) spanishChirho = null;
			});
		return () => {
			liveChirho = false;
		};
	});
	async function prepareChirho() {
		try {
			chaptersChirho = await clientForBookChirho(bookChirho).chaptersChirho();
			errorChirho = '';
		} catch {
			errorChirho = 'error_chapters_chirho';
		}
	}
	onMount(() => {
		initLocaleChirho(new URL(window.location.href));
		async function restoreChirho() {
			const openingChirho = openingPassageChirho(window.location.hash);
			if (!openingChirho) return;
			const bookFromUrlChirho = openingChirho.book_chirho;
			const chapterFromUrlChirho = openingChirho.chapter_chirho;
			const verseFromUrlChirho = openingChirho.verse_chirho;
			if (bookFromUrlChirho !== bookChirho) {
				await changeBookChirho(bookFromUrlChirho, chapterFromUrlChirho, verseFromUrlChirho);
				return;
			}
			const entryChirho = chaptersChirho[chapterFromUrlChirho - 1];
			if (
				entryChirho &&
				verseFromUrlChirho >= 1 &&
				verseNumbersChirho(entryChirho).includes(verseFromUrlChirho) &&
				(chapterFromUrlChirho !== chapterChirho || verseFromUrlChirho !== verseChirho)
			)
				await selectChirho(chapterFromUrlChirho, verseFromUrlChirho, Boolean(window.location.hash));
			else void refreshMediaChirho();
		}
		window.addEventListener('hashchange', restoreChirho);
		void prepareChirho()
			.then(restoreChirho)
			.finally(() => (restoredChirho = true));
		const timerChirho = window.setInterval(() => {
			if (document.visibilityState === 'visible') void refreshMediaChirho();
		}, 30000);
		return () => {
			window.removeEventListener('hashchange', restoreChirho);
			window.clearInterval(timerChirho);
		};
	});
	async function refreshMediaChirho(
		nextBookChirho = bookChirho,
		nextChapterChirho = chapterChirho
	) {
		const keyChirho = `${nextBookChirho}.${nextChapterChirho}`;
		if (keyChirho === mediaKeyChirho && Date.now() - mediaFetchedAtChirho < 5000) return;
		mediaKeyChirho = keyChirho;
		mediaFetchedAtChirho = Date.now();
		const requestIdChirho = ++mediaRequestChirho;
		try {
			const mediaChirho = await fetchChapterMediaChirho(nextBookChirho, nextChapterChirho);
			const scenesForChapterChirho = validateScenesChirho(mediaChirho.chapterChirho);
			if (requestIdChirho !== mediaRequestChirho) return;
			workerScenesChirho = scenesForChapterChirho;
			workerIconsChirho = mediaChirho.chapterChirho;
			mediaSceneCountChirho = Number(mediaChirho.summaryChirho.scene_count_chirho);
			mediaLemmaCountChirho = Number(mediaChirho.summaryChirho.lemma_icon_count_chirho ?? 0);
			mediaReadyChirho = true;
		} catch {
			// The text stays usable if the optional artwork index is unavailable.
		}
	}
	async function selectChirho(
		nextChapterChirho: number,
		nextVerseChirho: number,
		persistHashChirho = true,
		revealChirho = false
	) {
		void refreshMediaChirho(bookChirho, nextChapterChirho);
		const selectedBookChirho = bookChirho;
		const fragmentChirho = `#${selectedBookChirho}.${nextChapterChirho}.${nextVerseChirho}`;
		// The automatic daily selection keeps the fresh home URL clean; visitor selections persist.
		if (persistHashChirho && window.location.hash !== fragmentChirho)
			window.location.hash = fragmentChirho;
		const requestIdChirho = ++requestChirho;
		chapterChirho = nextChapterChirho;
		verseChirho = nextVerseChirho;
		loadingChirho = true;
		errorChirho = '';
		try {
			const nextLessonChirho =
				selectedBookChirho === 'Prov' && nextChapterChirho === 26 && nextVerseChirho === 1
					? initialLessonChirho
					: await clientForBookChirho(selectedBookChirho).lessonChirho(
							nextChapterChirho,
							nextVerseChirho
						);
			if (requestIdChirho === requestChirho) {
				if (nextLessonChirho.language_chirho === 'grc') greekLessonChirho = nextLessonChirho;
				else lessonChirho = nextLessonChirho;
			}
		} catch {
			if (requestIdChirho === requestChirho) errorChirho = 'error_verse_chirho';
		} finally {
			if (requestIdChirho === requestChirho) loadingChirho = false;
		}
		// Visitor passage changes reveal the newly rendered card; an older slow load cannot scroll it.
		if (revealChirho && requestIdChirho === requestChirho && !errorChirho) {
			await tickChirho();
			await new Promise<void>((readyChirho) => window.requestAnimationFrame(() => readyChirho()));
			await document.fonts.ready;
			if (requestIdChirho === requestChirho)
				document.querySelector('.lesson-heading-chirho')?.scrollIntoView({
					block: 'start',
					behavior: 'instant'
				});
		}
	}
	async function changeBookChirho(
		nextBookChirho: BookChirho,
		nextChapterChirho = 1,
		nextVerseChirho = 1,
		revealChirho = false
	) {
		const requestIdChirho = ++requestChirho;
		bookChirho = nextBookChirho;
		workerScenesChirho = {};
		workerIconsChirho = { schema_version_chirho: 1, icons_chirho: [] };
		mediaReadyChirho = false;
		chaptersChirho = [];
		loadingChirho = true;
		errorChirho = '';
		try {
			const entriesChirho = await clientForBookChirho(nextBookChirho).chaptersChirho();
			if (requestIdChirho !== requestChirho) return;
			if (
				!entriesChirho[nextChapterChirho - 1] ||
				nextVerseChirho < 1 ||
				!verseNumbersChirho(entriesChirho[nextChapterChirho - 1]).includes(nextVerseChirho)
			)
				throw new Error('Invalid passage.');
			chaptersChirho = entriesChirho;
			await selectChirho(nextChapterChirho, nextVerseChirho, true, revealChirho);
		} catch {
			if (requestIdChirho === requestChirho) {
				loadingChirho = false;
				errorChirho = 'error_book_chirho';
			}
		}
	}
	function moveChirho(directionChirho: number) {
		let nextChapterChirho = chapterChirho;
		const indexChirho = verseChoicesChirho.indexOf(verseChirho);
		let nextVerseChirho = verseChoicesChirho[indexChirho + directionChirho];
		if (nextVerseChirho === undefined) {
			nextChapterChirho += directionChirho;
			const entryChirho = chaptersChirho[nextChapterChirho - 1];
			if (!entryChirho) return;
			const numbersChirho = verseNumbersChirho(entryChirho);
			nextVerseChirho = directionChirho < 0 ? numbersChirho.at(-1)! : numbersChirho[0];
		}
		void selectChirho(nextChapterChirho, nextVerseChirho, true, true);
	}
</script>

{#snippet headerChirho()}
	<nav
		id="reader-chirho"
		tabindex="-1"
		class="navigation-chirho"
		data-online-navigation-chirho
		aria-label={readerTChirho('nav_label_chirho')}
	>
		<h2 class="reader-entry-chirho">
			{localeStateChirho.currentChirho === 'es' ? 'Úsalo aquí' : 'Use it here'}
		</h2>
		<div class="fields-chirho">
			<label
				>{readerTChirho('book_chirho')}<select
					aria-label={readerTChirho('book_chirho')}
					value={bookChirho}
					onchange={(eventChirho) =>
						changeBookChirho(eventChirho.currentTarget.value as BookChirho, 1, 1, true)}
				>
					<optgroup label={readerTChirho('high_quality_books_chirho')}>
						{#each ['Prov', 'John', 'Gen'] as idChirho (idChirho)}
							<option value={idChirho}>{bookLabelChirho(idChirho)}</option>
						{/each}
					</optgroup>
					{#each ['old', 'new'] as testamentChirho (testamentChirho)}
						<optgroup
							label={localeStateChirho.currentChirho === 'es'
								? testamentChirho === 'old'
									? 'Antiguo Testamento'
									: 'Nuevo Testamento'
								: testamentChirho === 'old'
									? 'Old Testament'
									: 'New Testament'}
						>
							{#each BIBLE_BOOKS_CHIRHO.filter((entryChirho) => !entryChirho.featured_chirho && entryChirho.testament_chirho === testamentChirho) as entryChirho (entryChirho.id_chirho)}
								<option value={entryChirho.id_chirho}
									>{bookLabelChirho(entryChirho.id_chirho)}</option
								>
							{/each}
						</optgroup>
					{/each}
				</select></label
			>
			<label
				>{readerTChirho('chapter_chirho')}<select
					aria-label={readerTChirho('chapter_chirho')}
					value={chapterChirho}
					disabled={!chaptersChirho.length}
					onchange={(eventChirho) =>
						selectChirho(Number(eventChirho.currentTarget.value), 1, true, true)}
					>{#each chaptersChirho as entryChirho (entryChirho.number_chirho)}<option
							value={entryChirho.number_chirho}>{entryChirho.number_chirho}</option
						>{/each}</select
				></label
			>
			<label
				>{readerTChirho('verse_chirho')}<select
					aria-label={readerTChirho('verse_chirho')}
					value={verseChirho}
					disabled={!chaptersChirho.length}
					onchange={(eventChirho) =>
						selectChirho(chapterChirho, Number(eventChirho.currentTarget.value), true, true)}
					>{#each verseChoicesChirho as numberChirho (numberChirho)}<option value={numberChirho}
							>{numberChirho}</option
						>{/each}</select
				></label
			>
			<label
				>{readerTChirho('language_chirho')}<select
					aria-label={readerTChirho('language_chirho')}
					data-locale-select-chirho
					value={localeStateChirho.currentChirho}
					onchange={(eventChirho) => {
						const chosenChirho = eventChirho.currentTarget.value;
						if (isLocaleChirho(chosenChirho)) chooseLocaleChirho(chosenChirho);
					}}
					><option value="en" lang="en">English</option><option value="es" lang="es">Español</option
					></select
				></label
			>
		</div>

		<p class="status-chirho" role="status" aria-live="polite">
			{#if loadingChirho}{readerTChirho('loading_chirho', {
					book_chirho: bookLabelChirho(bookChirho),
					chapter_chirho: chapterChirho,
					verse_chirho: verseChirho
				})}{:else if errorChirho}{readerTChirho(errorChirho)}
				<button
					type="button"
					onclick={() =>
						chaptersChirho.length
							? selectChirho(chapterChirho, verseChirho)
							: changeBookChirho(bookChirho)}>{readerTChirho('retry_chirho')}</button
				>{/if}
		</p>
		{#if mediaReadyChirho}<p class="art-progress-chirho">
				{readerTChirho('art_progress_chirho', {
					book_chirho: bookLabelChirho(bookChirho),
					scenes_chirho: mediaSceneCountChirho,
					lemmas_chirho: mediaLemmaCountChirho
				})}
			</p>{/if}
	</nav>
{/snippet}
{#snippet verseNavigationChirho()}
	<button
		type="button"
		class="verse-step-chirho"
		aria-label={readerTChirho('previous_verse_chirho')}
		disabled={loadingChirho || !chaptersChirho.length || (chapterChirho === 1 && verseChirho === 1)}
		onclick={() => moveChirho(-1)}
		><span aria-hidden="true">←</span> {readerTChirho('previous_chirho')}</button
	>
	<button
		type="button"
		class="verse-step-chirho"
		aria-label={readerTChirho('next_verse_chirho')}
		disabled={loadingChirho ||
			!chaptersChirho.length ||
			(chapterChirho === chaptersChirho.length && verseChirho === verseCountChirho)}
		onclick={() => moveChirho(1)}
		>{readerTChirho('next_chirho')} <span aria-hidden="true">→</span></button
	>
{/snippet}
<div data-speech-pending-chirho={!restoredChirho || loadingChirho}>
	{#if bibleBookChirho(bookChirho).language_chirho === 'grc' && greekLessonChirho}
		<GreekReaderChirho
			{introVisibleChirho}
			lessonChirho={greekLessonChirho}
			{headerChirho}
			{verseNavigationChirho}
			iconsChirho={iconsForLessonChirho(workerIconsChirho, greekLessonChirho)}
			presentationChirho={workerScenesChirho[greekLessonChirho.id_chirho] ?? null}
			{spanishChirho}
		/>
	{:else}<ReaderChirho
			{introVisibleChirho}
			{lessonChirho}
			lemmaLinksChirho={curatedChirho ? lemmaLinksChirho : {}}
			presentationChirho={curatedChirho
				? initialPresentationChirho
				: (scenesChirho[lessonChirho.id_chirho] ??
					workerScenesChirho[lessonChirho.id_chirho] ??
					null)}
			languagesChirho={curatedChirho ? initialLanguagesChirho : []}
			iconsChirho={curatedChirho
				? { ...contextualIconsChirho, ...initialIconsChirho }
				: contextualIconsChirho}
			{headerChirho}
			{verseNavigationChirho}
			{spanishChirho}
		/>
	{/if}
</div>

<style>
	.reader-entry-chirho {
		margin: 0 0 16px;
		font: 400 25px/1.2 var(--serif-chirho);
		color: #355443;
	}
	.art-progress-chirho {
		margin: 0.5rem 0 0;
		color: #526757;
		font-size: 0.8rem;
	}
	.navigation-chirho {
		margin: 1rem 0;
		padding: 0.75rem;
		border: 1px solid #d8d1c4;
		border-radius: 0.75rem;
		background: #faf8f2;
	}
	.fields-chirho {
		display: flex;
		flex-wrap: wrap;
		gap: 0.75rem;
	}
	label {
		display: grid;
		gap: 0.3rem;
		flex: 1 1 7rem;
		font-size: 0.8rem;
		font-weight: 600;
	}
	.navigation-chirho select,
	.navigation-chirho button {
		font: inherit;
		color: inherit;
		border: 1px solid #b8ae9d;
		border-radius: 0.4rem;
		background: white;
		padding: 0.55rem 0.7rem;
	}
	button {
		cursor: pointer;
	}
	button:disabled,
	select:disabled {
		opacity: 0.55;
		cursor: default;
	}
	.status-chirho {
		margin: 0.5rem 0 0;
		font-size: 0.85rem;
	}
	.status-chirho:empty {
		display: none;
	}
</style>
