// For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life. — John 3:16 (KJV)
// Workflow: hosting-chirho/word-study-chirho.md. Lazy bilingual previews reuse verified, bounded static chapter clients.
import type { LessonChirho } from '$lib/domain-chirho/lesson-chirho';
import type { GreekLessonChirho } from '$lib/domain-chirho/greek-chirho';
import type { TranslationWordChirho } from '$lib/i18n-chirho/verse-translation-chirho';
import { createBibleClientChirho } from '$lib/bible-chirho/content-client-chirho';
import {
	createTranslationClientChirho,
	translationsForWordsChirho
} from '$lib/i18n-chirho/verse-translation-chirho';
const translationsChirho = createTranslationClientChirho();
interface ChapterReadyChirho {
	clientChirho: ReturnType<typeof createBibleClientChirho>;
	entryChirho: Awaited<
		ReturnType<ReturnType<typeof createBibleClientChirho>['chaptersChirho']>
	>[number];
}
const chaptersChirho = new Map<
	string,
	{
		promiseChirho: Promise<ChapterReadyChirho>;
		settledChirho: boolean;
		failedAtChirho: number | null;
	}
>();
export interface VersePreviewChirho {
	lesson_chirho: LessonChirho | GreekLessonChirho;
	words_chirho: TranslationWordChirho[] | null;
	original_chirho: string;
	translation_chirho: string | null;
	edition_chirho: string | null;
	language_chirho: 'he' | 'grc';
}
export async function versePreviewChirho(
	idChirho: string,
	localeChirho: 'en' | 'es',
	modeChirho: 'readers' | 'terse'
): Promise<VersePreviewChirho> {
	const matchChirho = /^([1-3]?[A-Za-z]+)\.(\d{1,3})\.(\d{1,3})$/.exec(idChirho);
	if (!matchChirho) throw new Error('Invalid preview reference');
	const [, bookChirho, chapterTextChirho, verseTextChirho] = matchChirho;
	const chapterChirho = Number(chapterTextChirho);
	const verseChirho = Number(verseTextChirho);
	const keyChirho = bookChirho + '.' + chapterChirho;
	let cachedChirho = chaptersChirho.get(keyChirho);
	if (
		cachedChirho?.failedAtChirho !== null &&
		cachedChirho?.failedAtChirho !== undefined &&
		Date.now() - cachedChirho.failedAtChirho > 10000
	) {
		chaptersChirho.delete(keyChirho);
		cachedChirho = undefined;
	}
	if (!cachedChirho) {
		if (chaptersChirho.size >= 8) {
			const victimChirho = [...chaptersChirho].find(([, entryChirho]) => entryChirho.settledChirho);
			if (!victimChirho) throw new Error('Preview requests busy');
			chaptersChirho.delete(victimChirho[0]);
		}
		const clientChirho = createBibleClientChirho(bookChirho);
		const entryChirho = {
			promiseChirho: Promise.resolve(null as unknown as ChapterReadyChirho),
			settledChirho: false,
			failedAtChirho: null as number | null
		};
		entryChirho.promiseChirho = clientChirho.chaptersChirho().then(async (entriesChirho) => {
			const bindingChirho = entriesChirho[chapterChirho - 1];
			if (!bindingChirho) throw new Error('Preview chapter absent');
			await clientChirho.lessonChirho(chapterChirho, verseChirho);
			return { clientChirho, entryChirho: bindingChirho };
		});
		entryChirho.promiseChirho.then(
			() => {
				entryChirho.settledChirho = true;
			},
			() => {
				entryChirho.settledChirho = true;
				entryChirho.failedAtChirho = Date.now();
			}
		);
		chaptersChirho.set(keyChirho, entryChirho);
		cachedChirho = entryChirho;
	} else {
		chaptersChirho.delete(keyChirho);
		chaptersChirho.set(keyChirho, cachedChirho);
	}
	const readyChirho = await cachedChirho.promiseChirho;
	const lessonChirho = await readyChirho.clientChirho.lessonChirho(chapterChirho, verseChirho);
	const chapterLayerChirho = await translationsChirho
		.chapterChirho(localeChirho, bookChirho, chapterChirho, {
			path_chirho: readyChirho.entryChirho.path_chirho,
			sha256_chirho: readyChirho.entryChirho.sha256_chirho
		})
		.catch(() => null);
	const editionsChirho = translationsForWordsChirho(
		chapterLayerChirho?.verses_chirho[idChirho] ?? null,
		lessonChirho.tokens_chirho
	);
	for (const choiceChirho of [...new Set([modeChirho, 'terse', 'readers'] as const)]) {
		const editionChirho = editionsChirho?.[`${choiceChirho}_chirho`];
		if (!editionChirho) continue;
		const textChirho = editionChirho.words_chirho
			.map((wordChirho) => wordChirho.gloss_chirho.replace(/–/g, ' '))
			.join(' ')
			.replace(/\s+([,.;:!?])/g, '$1')
			.replace(/\s+/g, ' ')
			.trim();
		if (textChirho)
			return {
				lesson_chirho: lessonChirho,
				words_chirho: editionChirho.words_chirho,
				original_chirho: lessonChirho.canonical_text_chirho,
				translation_chirho: textChirho,
				edition_chirho: choiceChirho === 'terse' ? 'Terse' : 'Readers',
				language_chirho: lessonChirho.language_chirho
			};
	}
	return {
		lesson_chirho: lessonChirho,
		words_chirho: null,
		original_chirho: lessonChirho.canonical_text_chirho,
		translation_chirho:
			localeChirho === 'en'
				? lessonChirho.tokens_chirho
						.map((tokenChirho) => tokenChirho.gloss_chirho ?? '')
						.join(' ')
						.trim() || null
				: null,
		edition_chirho: localeChirho === 'en' ? 'Word meanings' : null,
		language_chirho: lessonChirho.language_chirho
	};
}
