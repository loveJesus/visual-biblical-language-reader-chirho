// For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life. — John 3:16 (KJV)
import { describe, it, expect, vi as viChirho, afterEach } from 'vitest';
import { readFile as readFileChirho } from 'node:fs/promises';
import { resolve as resolveChirho } from 'node:path';
import { createHash as createHashChirho } from 'node:crypto';
import {
	BIBLE_BOOKS_CHIRHO,
	isPassageIdChirho,
	isBibleChapterPathChirho
} from '../../src/lib/bible-chirho/books-chirho';
import {
	createBibleClientChirho,
	verseNumbersChirho
} from '../../src/lib/bible-chirho/content-client-chirho';
import { validateLessonChirho } from '../../src/lib/domain-chirho/lesson-chirho';
import { lemmaIconsForLessonChirho } from '../../src/lib/domain-chirho/lemma-icons-chirho';
import { validateGreekLessonChirho } from '../../src/lib/domain-chirho/greek-chirho';
import {
	iconsForLessonChirho,
	validateScenesChirho
} from '../../src/lib/domain-chirho/media-chirho';

afterEach(() => viChirho.unstubAllGlobals());
const sourceFetchChirho = async (inputChirho: RequestInfo | URL) => {
	const pathChirho = String(inputChirho);
	if (!pathChirho.startsWith('/content-chirho/') || pathChirho.includes('..'))
		throw new Error('Not a corpus path.');
	return new Response(await readFileChirho(resolveChirho('static' + pathChirho)));
};
describe('whole-canon reader boundaries', () => {
	it('loads every chapter picture library and contextual assignment through the real reader domain', async () => {
		let picturedChirho = 0;
		for (const bookChirho of BIBLE_BOOKS_CHIRHO) {
			for (
				let chapterChirho = 1;
				chapterChirho <= bookChirho.chapter_count_chirho;
				chapterChirho++
			) {
				const filenameChirho =
					'/chapter-' + String(chapterChirho).padStart(2, '0') + '-chirho.json';
				const mediaChirho = JSON.parse(
					await readFileChirho(
						'static/media-chirho/' + bookChirho.slug_chirho + filenameChirho,
						'utf8'
					)
				);
				validateScenesChirho(mediaChirho);
				const contentChirho = JSON.parse(
					await readFileChirho(
						'static/content-chirho/' + bookChirho.slug_chirho + filenameChirho,
						'utf8'
					)
				);
				for (const verseChirho of contentChirho.verses_chirho) {
					const lessonChirho =
						verseChirho.id_chirho === 'Prov.26.1'
							? JSON.parse(
									await readFileChirho(
										'data-chirho/lessons-chirho/proverbs-26-1-chirho.json',
										'utf8'
									)
								)
							: verseChirho;
					if (bookChirho.language_chirho === 'grc') validateGreekLessonChirho(lessonChirho);
					else validateLessonChirho(lessonChirho);
					try {
						lemmaIconsForLessonChirho(mediaChirho.lemma_icons_chirho, lessonChirho);
					} catch (errorChirho) {
						throw new Error(verseChirho.id_chirho + ': ' + String(errorChirho), {
							cause: errorChirho
						});
					}
					picturedChirho += Object.keys(iconsForLessonChirho(mediaChirho, lessonChirho)).length;
				}
			}
		}
		expect(picturedChirho).toBeGreaterThan(300000);
	}, 30000);

	it('hashes and validates every published source verse across the fixed canon', async () => {
		let countChirho = 0;
		for (const bookChirho of BIBLE_BOOKS_CHIRHO) {
			const manifestChirho = JSON.parse(
				await readFileChirho(
					'static/content-chirho/' + bookChirho.slug_chirho + '/manifest-chirho.json',
					'utf8'
				)
			);
			expect(manifestChirho.chapters_chirho.length).toBe(bookChirho.chapter_count_chirho);
			for (const entryChirho of manifestChirho.chapters_chirho) {
				const bytesChirho = await readFileChirho('static' + entryChirho.path_chirho);
				expect(createHashChirho('sha256').update(bytesChirho).digest('hex')).toBe(
					entryChirho.sha256_chirho
				);
				for (const verseChirho of JSON.parse(bytesChirho.toString('utf8')).verses_chirho) {
					if (bookChirho.language_chirho === 'grc') validateGreekLessonChirho(verseChirho);
					else validateLessonChirho(verseChirho);
					countChirho++;
				}
			}
		}
		expect(countChirho).toBeGreaterThan(31000);
		expect(BIBLE_BOOKS_CHIRHO).toHaveLength(66);
	});
	it('reads the longest Psalm and later NT books with one chapter cache', async () => {
		const fetchChirho = viChirho.fn(sourceFetchChirho);
		viChirho.stubGlobal('fetch', fetchChirho);
		const psalmsChirho = createBibleClientChirho('Ps');
		expect((await psalmsChirho.lessonChirho(119, 176)).id_chirho).toBe('Ps.119.176');
		expect((await psalmsChirho.lessonChirho(119, 1)).id_chirho).toBe('Ps.119.1');
		expect(fetchChirho).toHaveBeenCalledTimes(2);
		expect((await createBibleClientChirho('Rev').lessonChirho(22, 21)).language_chirho).toBe('grc');
	});
	it('preserves edition gaps instead of relabelling a later verse', async () => {
		viChirho.stubGlobal('fetch', sourceFetchChirho);
		const markChirho = createBibleClientChirho('Mark');
		const entryChirho = (await markChirho.chaptersChirho())[6];
		expect(verseNumbersChirho(entryChirho)).not.toContain(16);
		await expect(markChirho.lessonChirho(7, 16)).rejects.toThrow(/absent/);
		expect((await markChirho.lessonChirho(7, 17)).id_chirho).toBe('Mark.7.17');
	});
	it('refuses altered chapter bytes before selecting a verse', async () => {
		viChirho.stubGlobal('fetch', async (inputChirho: RequestInfo | URL) => {
			const responseChirho = await sourceFetchChirho(inputChirho);
			if (String(inputChirho).includes('chapter-'))
				return new Response(
					(await responseChirho.text()).replace('canonical_text_chirho', 'altered_text_chirho')
				);
			return responseChirho;
		});
		await expect(createBibleClientChirho('Ruth').lessonChirho(1, 1)).rejects.toThrow(/integrity/);
	});
	it('rejects invented books and noncanonical path spellings', () => {
		expect(isPassageIdChirho('Ps.119.176')).toBe(true);
		expect(isPassageIdChirho('Fake.1.1')).toBe(false);
		expect(
			isBibleChapterPathChirho(
				'/content-chirho/psalms-chirho/chapter-119-chirho.json',
				'/content-chirho/'
			)
		).toBe(true);
		expect(
			isBibleChapterPathChirho(
				'/content-chirho/psalms-chirho/chapter-001-chirho.json',
				'/content-chirho/'
			)
		).toBe(false);
		expect(() => createBibleClientChirho('Fake')).toThrow();
	});
});
