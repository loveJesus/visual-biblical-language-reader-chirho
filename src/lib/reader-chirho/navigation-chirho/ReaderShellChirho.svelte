<!-- For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life. — John 3:16 (KJV) -->
<script lang="ts">
	import type { Snippet } from 'svelte';
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
	import {
		ReaderSessionChirho,
		type OpenReasonChirho
	} from '../session-chirho/reader-session-chirho';
	import { sessionMessagesChirho } from '../session-chirho/session-messages-chirho';
	import ReaderWelcomeChirho from '../session-chirho/ReaderWelcomeChirho.svelte';
	import { mobileStoreChirho, type MobileStoreChirho } from '../session-chirho/mobile-store-chirho';
	import type { ChapterEntryChirho } from './corpus-client-chirho';
	import { fetchChapterMediaChirho, videosByLessonChirho } from './media-client-chirho';
	import { verseSwipeChirho } from './verse-swipe-chirho';
	import { readerTChirho, type ReaderKeyChirho } from '$lib/i18n-chirho/reader-messages-chirho';
	import { bookNameChirho } from '$lib/i18n-chirho/labels-chirho';
	import { siteTChirho } from '$lib/site-chirho/site-content-chirho';
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
	let readerRootChirho = $state<HTMLDivElement>();
	let sessionChirho: ReaderSessionChirho | null = null;
	let welcomeChirho = $state(false);
	let startTodayChirho = $state(true);
	let autoplayChirho = $state(true);
	let installStoreChirho = $state<MobileStoreChirho>(null);
	let navigationGenerationChirho = $state(0);
	let audioReadyChirho: { lesson_chirho: string; generation_chirho: number } | null = null;
	let mediaSettledChirho = '';
	const sessionCopyChirho = $derived(sessionMessagesChirho(localeStateChirho.currentChirho));
	let curatedChirho = $derived(lessonChirho.id_chirho === 'Prov.26.1');
	let workerScenesChirho = $state<Record<string, ScenePresentationChirho>>({});
	let workerIconsChirho = $state<unknown>({ schema_version_chirho: 1, icons_chirho: [] });
	let workerVideosChirho = $state<Record<string, unknown>>({});
	let mediaReadyChirho = $state(false);
	let mediaFetchedAtChirho = 0;
	let mediaKeyChirho = '';
	let mediaRequestChirho = 0;
	let mediaSceneCountChirho = $state(0);
	let mediaLemmaCountChirho = $state(0);
	// L.J. (2026-11-07): production details belong in an info view, so the counts sit in the verse's Sources fold.
	const artProgressChirho = $derived(
		mediaReadyChirho
			? readerTChirho('art_progress_chirho', {
					book_chirho: bookLabelChirho(bookChirho),
					scenes_chirho: mediaSceneCountChirho,
					lemmas_chirho: mediaLemmaCountChirho
				})
			: null
	);
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
	// Workflow: reader-session-chirho.md. The only automatic play request is consumed after all
	// three independently loaded identities belong to this explicit navigation generation.
	async function maybeAutoplayChirho() {
		const generationChirho = navigationGenerationChirho;
		const passageChirho = `${bookChirho}.${chapterChirho}.${verseChirho}`;
		const audioChirho = audioReadyChirho;
		if (
			!sessionChirho ||
			!restoredChirho ||
			loadingChirho ||
			errorChirho ||
			welcomeChirho ||
			document.visibilityState !== 'visible' ||
			mediaSettledChirho !== `${bookChirho}.${chapterChirho}` ||
			audioChirho?.lesson_chirho !== passageChirho ||
			audioChirho.generation_chirho !== generationChirho
		)
			return;
		await tickChirho();
		await new Promise<void>((readyChirho) => requestAnimationFrame(() => readyChirho()));
		if (generationChirho !== navigationGenerationChirho || loadingChirho || welcomeChirho) return;
		const playChirho = readerRootChirho?.querySelector<HTMLButtonElement>(
			'[data-audio-controls-chirho] .speech-button-chirho:not(.word-speech-chirho)'
		);
		// A settled but unavailable verse is a completed attempt, not a future refresh trigger.
		if (!sessionChirho.consumeAutoplayChirho(generationChirho, passageChirho)) return;
		if (
			!playChirho ||
			playChirho.disabled ||
			readerRootChirho?.querySelector('[data-pronounce-chirho][aria-busy="true"]')
		)
			return;
		playChirho.click();
	}
	function recordingsReadyChirho(lessonIdChirho: string, generationChirho: number) {
		if (generationChirho !== navigationGenerationChirho) return;
		audioReadyChirho = { lesson_chirho: lessonIdChirho, generation_chirho: generationChirho };
		void maybeAutoplayChirho();
	}
	function preferencesChangedChirho() {
		sessionChirho?.preferencesChirho(startTodayChirho, autoplayChirho);
	}
	function closeWelcomeChirho() {
		sessionChirho?.acknowledgeWelcomeChirho();
		welcomeChirho = false;
		void tickChirho().then(() =>
			document
				.getElementById('reader-chirho')
				?.scrollIntoView({ block: 'start', behavior: 'instant' })
		);
	}
	function showKeyChirho() {
		const headingChirho = document.getElementById(
			bibleBookChirho(bookChirho).language_chirho === 'grc'
				? 'greek-grammar-heading-chirho'
				: 'grammar-heading-chirho'
		);
		if (headingChirho) {
			headingChirho.tabIndex = -1;
			headingChirho.focus({ preventScroll: true });
			headingChirho.scrollIntoView({ block: 'start', behavior: 'instant' });
		}
	}
	onMount(() => {
		installStoreChirho = mobileStoreChirho(navigator);
		initLocaleChirho(new URL(window.location.href));
		let storeChirho: Storage | undefined;
		try {
			storeChirho = window.localStorage;
		} catch {
			/* Reading does not require storage. */
		}
		sessionChirho = new ReaderSessionChirho(storeChirho);
		startTodayChirho = sessionChirho.startTodayChirho;
		autoplayChirho = sessionChirho.autoplayChirho;
		const initialChirho = sessionChirho.launchChirho(window.location.hash);
		welcomeChirho = sessionChirho.welcomeChirho;
		async function restoreChirho(initialChirho = false) {
			const openingChirho = initialChirho
				? initialPassageChirho
				: openingPassageChirho(window.location.hash);
			if (!openingChirho) return;
			const bookFromUrlChirho = openingChirho.book_chirho;
			const chapterFromUrlChirho = openingChirho.chapter_chirho;
			const verseFromUrlChirho = openingChirho.verse_chirho;
			const reasonChirho = initialChirho ? 'launch-chirho' : 'restore-chirho';
			if (bookFromUrlChirho !== bookChirho) {
				await changeBookChirho(
					bookFromUrlChirho,
					chapterFromUrlChirho,
					verseFromUrlChirho,
					false,
					reasonChirho
				);
				return;
			}
			const entryChirho = chaptersChirho[chapterFromUrlChirho - 1];
			if (entryChirho && verseNumbersChirho(entryChirho).includes(verseFromUrlChirho)) {
				await selectChirho(
					chapterFromUrlChirho,
					verseFromUrlChirho,
					Boolean(window.location.hash),
					false,
					reasonChirho
				);
			}
		}
		const initialPassageChirho = initialChirho;
		const hashChangedChirho = () => {
			// Hashes written by selectChirho already have their own user-navigation intent.
			if (window.location.hash === `#${bookChirho}.${chapterChirho}.${verseChirho}`) return;
			void restoreChirho();
		};
		const cancelManualChirho = (eventChirho: Event) => {
			const targetChirho = eventChirho.target;
			if (
				targetChirho instanceof Element &&
				targetChirho.closest(
					'[data-pronounce-chirho], [data-speech-stop-chirho], [data-greek-rendition-chirho]'
				)
			)
				sessionChirho?.cancelAutoplayChirho();
		};
		const visibilityChirho = () => {
			if (document.visibilityState !== 'visible') sessionChirho?.cancelAutoplayChirho();
		};
		window.addEventListener('hashchange', hashChangedChirho);
		document.addEventListener('click', cancelManualChirho, true);
		document.addEventListener('change', cancelManualChirho, true);
		document.addEventListener('visibilitychange', visibilityChirho);
		void prepareChirho()
			.then(() => restoreChirho(true))
			.finally(() => {
				restoredChirho = true;
			});
		const timerChirho = window.setInterval(() => {
			if (document.visibilityState === 'visible') void refreshMediaChirho();
		}, 30000);
		return () => {
			sessionChirho?.cancelAutoplayChirho();
			window.removeEventListener('hashchange', hashChangedChirho);
			document.removeEventListener('click', cancelManualChirho, true);
			document.removeEventListener('change', cancelManualChirho, true);
			document.removeEventListener('visibilitychange', visibilityChirho);
			window.clearInterval(timerChirho);
		};
	});
	async function refreshMediaChirho(
		nextBookChirho = bookChirho,
		nextChapterChirho = chapterChirho
	) {
		const keyChirho = `${nextBookChirho}.${nextChapterChirho}`;
		if (keyChirho === mediaKeyChirho && Date.now() - mediaFetchedAtChirho < 5000) return;
		mediaSettledChirho = ''; // A previous visit to this chapter cannot settle the new fetch.
		mediaKeyChirho = keyChirho;
		mediaFetchedAtChirho = Date.now();
		const requestIdChirho = ++mediaRequestChirho;
		try {
			const mediaChirho = await fetchChapterMediaChirho(nextBookChirho, nextChapterChirho);
			const scenesForChapterChirho = validateScenesChirho(mediaChirho.chapterChirho);
			if (requestIdChirho !== mediaRequestChirho) return;
			workerScenesChirho = scenesForChapterChirho;
			workerIconsChirho = mediaChirho.chapterChirho;
			workerVideosChirho = videosByLessonChirho(mediaChirho.chapterChirho);
			mediaSceneCountChirho = Number(mediaChirho.summaryChirho.scene_count_chirho);
			mediaLemmaCountChirho = Number(mediaChirho.summaryChirho.lemma_icon_count_chirho ?? 0);
			mediaReadyChirho = true;
		} catch {
			// The text stays usable if the optional artwork index is unavailable.
		} finally {
			if (requestIdChirho === mediaRequestChirho) {
				mediaSettledChirho = keyChirho;
				void maybeAutoplayChirho();
			}
		}
	}
	async function selectChirho(
		nextChapterChirho: number,
		nextVerseChirho: number,
		persistHashChirho = true,
		revealChirho = false,
		reasonChirho: OpenReasonChirho = 'navigation-chirho'
	) {
		navigationGenerationChirho =
			sessionChirho?.beginChirho(
				`${bookChirho}.${nextChapterChirho}.${nextVerseChirho}`,
				reasonChirho
			) ?? navigationGenerationChirho + 1;
		audioReadyChirho = null;
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
				sessionChirho?.rememberChirho(nextLessonChirho.id_chirho);
			}
		} catch {
			if (requestIdChirho === requestChirho) errorChirho = 'error_verse_chirho';
		} finally {
			if (requestIdChirho === requestChirho) {
				loadingChirho = false;
				void maybeAutoplayChirho();
			}
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
		revealChirho = false,
		reasonChirho: OpenReasonChirho = 'navigation-chirho'
	) {
		sessionChirho?.cancelAutoplayChirho();
		const requestIdChirho = ++requestChirho;
		bookChirho = nextBookChirho;
		workerScenesChirho = {};
		workerIconsChirho = { schema_version_chirho: 1, icons_chirho: [] };
		workerVideosChirho = {};
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
			await selectChirho(nextChapterChirho, nextVerseChirho, true, revealChirho, reasonChirho);
		} catch {
			if (requestIdChirho === requestChirho) {
				loadingChirho = false;
				errorChirho = 'error_book_chirho';
			}
		}
	}
	// The one rule for stepping, shared by the Previous/Next buttons and the reader swipe.
	function canMoveChirho(nextChirho: boolean): boolean {
		if (loadingChirho || !chaptersChirho.length) return false;
		return nextChirho
			? !(chapterChirho === chaptersChirho.length && verseChirho === verseCountChirho)
			: !(chapterChirho === 1 && verseChirho === 1);
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
			{siteTChirho('start_chirho')}
		</h2>
		<div class="reader-tools-chirho">
			<details class="reader-settings-chirho">
				<summary>{sessionCopyChirho.settings_chirho}</summary>
				<div class="settings-options-chirho">
					<label
						><input
							type="checkbox"
							checked={startTodayChirho}
							onchange={(eventChirho) => {
								startTodayChirho = eventChirho.currentTarget.checked;
								preferencesChangedChirho();
							}}
						/><span
							>{sessionCopyChirho.today_chirho}<small>{sessionCopyChirho.today_hint_chirho}</small
							></span
						></label
					>
					<label
						><input
							type="checkbox"
							checked={autoplayChirho}
							onchange={(eventChirho) => {
								autoplayChirho = eventChirho.currentTarget.checked;
								preferencesChangedChirho();
							}}
						/><span
							>{sessionCopyChirho.autoplay_chirho}<small
								>{sessionCopyChirho.autoplay_hint_chirho}</small
							></span
						></label
					>
				</div>
			</details>
			<details class="reader-help-chirho">
				<summary>{sessionCopyChirho.help_chirho}</summary>
				<div class="help-links-chirho">
					<a
						href={resolveChirho(`/tutorial-chirho/?lang_chirho=${localeStateChirho.currentChirho}`)}
						>{sessionCopyChirho.tour_chirho}</a
					>
					<button type="button" onclick={showKeyChirho}>{sessionCopyChirho.key_chirho}</button>
					<a
						href={resolveChirho(
							`/about-chirho/?lang_chirho=${localeStateChirho.currentChirho}#study-aids-chirho`
						)}>{sessionCopyChirho.info_chirho}</a
					>
					{#if installStoreChirho?.url_chirho}
						<a href={installStoreChirho.url_chirho} rel="external noreferrer"
							>{sessionCopyChirho.install_chirho} {installStoreChirho.name_chirho}</a
						>
					{/if}
				</div>
			</details>
		</div>
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
							? selectChirho(chapterChirho, verseChirho, true, false, 'retry-chirho')
							: changeBookChirho(bookChirho, chapterChirho, verseChirho, false, 'retry-chirho')}
					>{readerTChirho('retry_chirho')}</button
				>{/if}
		</p>
	</nav>
{/snippet}
{#snippet verseNavigationChirho(playbackChirho: Snippet)}
	<button
		type="button"
		class="verse-step-chirho"
		aria-label={readerTChirho('previous_verse_chirho')}
		disabled={!canMoveChirho(false)}
		onclick={() => moveChirho(-1)}
		><span aria-hidden="true">←</span> {readerTChirho('previous_chirho')}</button
	>
	{@render playbackChirho()}
	<button
		type="button"
		class="verse-step-chirho"
		aria-label={readerTChirho('next_verse_chirho')}
		disabled={!canMoveChirho(true)}
		onclick={() => moveChirho(1)}
		>{readerTChirho('next_chirho')} <span aria-hidden="true">→</span></button
	>
{/snippet}
{#if welcomeChirho}<ReaderWelcomeChirho
		mobileStoreChirho={installStoreChirho}
		localeChirho={localeStateChirho.currentChirho}
		onCloseChirho={closeWelcomeChirho}
	/>{/if}
<div
	bind:this={readerRootChirho}
	data-speech-pending-chirho={!restoredChirho || loadingChirho}
	use:verseSwipeChirho={{
		canStepChirho: canMoveChirho,
		onStepChirho: (nextChirho) => moveChirho(nextChirho ? 1 : -1)
	}}
>
	{#if bibleBookChirho(bookChirho).language_chirho === 'grc' && greekLessonChirho}
		<GreekReaderChirho
			{introVisibleChirho}
			lessonChirho={greekLessonChirho}
			{headerChirho}
			{verseNavigationChirho}
			iconsChirho={iconsForLessonChirho(workerIconsChirho, greekLessonChirho)}
			presentationChirho={workerScenesChirho[greekLessonChirho.id_chirho] ?? null}
			videoChirho={workerVideosChirho[greekLessonChirho.id_chirho] ?? null}
			{spanishChirho}
			{artProgressChirho}
			{navigationGenerationChirho}
			onRecordingsReadyChirho={recordingsReadyChirho}
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
			videoChirho={workerVideosChirho[lessonChirho.id_chirho] ?? null}
			languagesChirho={curatedChirho ? initialLanguagesChirho : []}
			iconsChirho={curatedChirho
				? { ...contextualIconsChirho, ...initialIconsChirho }
				: contextualIconsChirho}
			{headerChirho}
			{verseNavigationChirho}
			{spanishChirho}
			{artProgressChirho}
			{navigationGenerationChirho}
			onRecordingsReadyChirho={recordingsReadyChirho}
		/>
	{/if}
</div>

<style>
	.reader-tools-chirho {
		display: flex;
		flex-wrap: wrap;
		align-items: flex-start;
		gap: 8px;
		margin: 0 0 12px;
	}
	.reader-tools-chirho details {
		flex: 0 1 auto;
		min-width: 0;
		border-radius: 8px;
	}
	.reader-tools-chirho summary {
		padding: 6px 10px;
		border: 1px solid #ded5c3;
		border-radius: 7px;
		font-size: 12px;
		font-weight: 600;
		cursor: pointer;
		background: #fffdf7;
	}
	.reader-tools-chirho details[open] {
		flex-basis: 100%;
		border: 1px solid #ded5c3;
		background: #fffdf7;
	}
	.reader-tools-chirho details[open] summary {
		border: 0;
		background: transparent;
		padding: 9px 12px;
	}
	.settings-options-chirho {
		display: grid;
		gap: 14px;
		padding: 6px 12px 15px;
	}
	.settings-options-chirho label {
		display: flex;
		align-items: flex-start;
		gap: 10px;
		font-size: 13px;
		font-weight: 500;
	}
	.settings-options-chirho input {
		width: 18px;
		height: 18px;
		margin: 2px 0 0;
		accent-color: #31503a;
		color: #31503a;
		flex: none;
	}
	.settings-options-chirho small {
		display: block;
		margin-top: 4px;
		color: #63705e;
		font-size: 11px;
		line-height: 1.5;
		font-weight: 400;
	}
	.help-links-chirho {
		display: flex;
		flex-direction: column;
		align-items: flex-start;
		gap: 12px;
		padding: 4px 12px 15px;
		font-size: 13px;
	}
	.navigation-chirho .help-links-chirho button {
		padding: 0;
		border: 0;
		background: transparent;
		text-decoration: underline;
	}

	.reader-entry-chirho {
		margin: 0 0 16px;
		font: 400 25px/1.2 var(--serif-chirho);
		color: #355443;
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
