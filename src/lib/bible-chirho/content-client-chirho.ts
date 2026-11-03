// For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life. — John 3:16 (KJV)
// Workflow: whole-bible-chirho.md. Fetch one hash-bound chapter; preserve source numbering gaps.
import { bibleBookChirho } from './books-chirho';
import { validateLessonChirho, type LessonChirho } from '../domain-chirho/lesson-chirho';
import { validateGreekLessonChirho, type GreekLessonChirho } from '../domain-chirho/greek-chirho';

export type ChapterEntryChirho = {
	number_chirho: number;
	verse_count_chirho: number;
	verse_numbers_chirho?: number[];
	path_chirho: string;
	sha256_chirho: string;
};
export function verseNumbersChirho(entryChirho: ChapterEntryChirho): number[] {
	return (
		entryChirho.verse_numbers_chirho ??
		Array.from({ length: entryChirho.verse_count_chirho }, (_, indexChirho) => indexChirho + 1)
	);
}
export async function bytesChirho(
	pathChirho: string,
	limitChirho = 2 * 1024 * 1024
): Promise<Uint8Array<ArrayBuffer>> {
	const responseChirho = await fetch(pathChirho, { redirect: 'error' });
	if (!responseChirho.ok || !responseChirho.body) throw new Error('Content could not be loaded.');
	const lengthChirho = responseChirho.headers.get('content-length');
	if (lengthChirho !== null && (!/^\d+$/u.test(lengthChirho) || Number(lengthChirho) > limitChirho))
		throw new Error('Content exceeds the size limit.');
	const readerChirho = responseChirho.body.getReader();
	const chunksChirho: Uint8Array[] = [];
	let sizeChirho = 0;
	try {
		while (true) {
			const partChirho = await readerChirho.read();
			if (partChirho.done) break;
			sizeChirho += partChirho.value.byteLength;
			if (sizeChirho > limitChirho) {
				await readerChirho.cancel();
				throw new Error('Content exceeds the size limit.');
			}
			chunksChirho.push(partChirho.value);
		}
	} finally {
		readerChirho.releaseLock();
	}
	const resultChirho = new Uint8Array(sizeChirho);
	let offsetChirho = 0;
	for (const chunkChirho of chunksChirho) {
		resultChirho.set(chunkChirho, offsetChirho);
		offsetChirho += chunkChirho.byteLength;
	}
	return resultChirho;
}
export function parseChirho(bytesChirho: Uint8Array): unknown {
	return JSON.parse(new TextDecoder('utf-8', { fatal: true }).decode(bytesChirho));
}
export function createBibleClientChirho(bookIdChirho: string) {
	const bookChirho = bibleBookChirho(bookIdChirho);
	const prefixChirho = '/content-chirho/' + bookChirho.slug_chirho + '/';
	let manifestChirho: ChapterEntryChirho[] | null = null;
	let cacheChirho: { number_chirho: number; verses_chirho: unknown[] } | null = null;
	async function chaptersChirho(): Promise<ChapterEntryChirho[]> {
		if (manifestChirho) return manifestChirho;
		const dataChirho = parseChirho(
			await bytesChirho(prefixChirho + 'manifest-chirho.json', 128 * 1024)
		) as {
			schema_version_chirho?: unknown;
			book_id_chirho?: unknown;
			language_chirho?: unknown;
			chapters_chirho?: unknown;
		};
		if (
			dataChirho?.schema_version_chirho !== 1 ||
			dataChirho.book_id_chirho !== bookIdChirho ||
			dataChirho.language_chirho !== bookChirho.language_chirho ||
			!Array.isArray(dataChirho.chapters_chirho) ||
			dataChirho.chapters_chirho.length !== bookChirho.chapter_count_chirho
		)
			throw new Error('Invalid Bible book manifest.');
		const entriesChirho = dataChirho.chapters_chirho as ChapterEntryChirho[];
		for (const [indexChirho, entryChirho] of entriesChirho.entries()) {
			const numberChirho = indexChirho + 1;
			if (
				!entryChirho ||
				entryChirho.number_chirho !== numberChirho ||
				!Number.isInteger(entryChirho.verse_count_chirho) ||
				entryChirho.verse_count_chirho < 1 ||
				entryChirho.verse_count_chirho > 200 ||
				entryChirho.path_chirho !==
					prefixChirho + 'chapter-' + String(numberChirho).padStart(2, '0') + '-chirho.json' ||
				!/^[a-f0-9]{64}$/u.test(entryChirho.sha256_chirho)
			)
				throw new Error('Invalid Bible chapter entry.');
			if (entryChirho.verse_numbers_chirho !== undefined) {
				if (
					!Array.isArray(entryChirho.verse_numbers_chirho) ||
					entryChirho.verse_numbers_chirho.length !== entryChirho.verse_count_chirho ||
					entryChirho.verse_numbers_chirho.some(
						(verseChirho, positionChirho, numbersChirho) =>
							!Number.isInteger(verseChirho) ||
							verseChirho < 1 ||
							verseChirho > 200 ||
							verseChirho <= (numbersChirho[positionChirho - 1] ?? 0)
					)
				)
					throw new Error('Invalid source verse numbering.');
			}
		}
		manifestChirho = entriesChirho;
		return entriesChirho;
	}
	async function lessonChirho(
		chapterChirho: number,
		verseChirho: number
	): Promise<LessonChirho | GreekLessonChirho> {
		if (!Number.isInteger(chapterChirho)) throw new Error('Invalid chapter selection.');
		const entryChirho = (await chaptersChirho())[chapterChirho - 1];
		if (!entryChirho || !verseNumbersChirho(entryChirho).includes(verseChirho))
			throw new Error('The selected verse is absent from this source edition.');
		let versesChirho =
			cacheChirho?.number_chirho === chapterChirho ? cacheChirho.verses_chirho : null;
		if (!versesChirho) {
			const rawChirho = await bytesChirho(entryChirho.path_chirho, 4 * 1024 * 1024);
			const hashChirho = Array.from(
				new Uint8Array(await crypto.subtle.digest('SHA-256', rawChirho)),
				(byteChirho) => byteChirho.toString(16).padStart(2, '0')
			).join('');
			if (hashChirho !== entryChirho.sha256_chirho)
				throw new Error('Chapter integrity check failed.');
			const chapterDataChirho = parseChirho(rawChirho) as {
				book_id_chirho?: unknown;
				chapter_chirho?: unknown;
				verses_chirho?: unknown;
			};
			if (
				chapterDataChirho?.book_id_chirho !== bookIdChirho ||
				chapterDataChirho.chapter_chirho !== chapterChirho ||
				!Array.isArray(chapterDataChirho.verses_chirho) ||
				chapterDataChirho.verses_chirho.length !== entryChirho.verse_count_chirho
			)
				throw new Error('Invalid chapter data.');
			versesChirho = chapterDataChirho.verses_chirho;
			for (const [indexChirho, verseDataChirho] of versesChirho.entries()) {
				if (
					!verseDataChirho ||
					typeof verseDataChirho !== 'object' ||
					(verseDataChirho as { id_chirho?: unknown }).id_chirho !==
						bookIdChirho + '.' + chapterChirho + '.' + verseNumbersChirho(entryChirho)[indexChirho]
				)
					throw new Error('Chapter verse identity mismatch.');
			}
			cacheChirho = { number_chirho: chapterChirho, verses_chirho: versesChirho };
		}
		const lessonChirho = versesChirho[verseNumbersChirho(entryChirho).indexOf(verseChirho)];
		if (bookChirho.language_chirho === 'grc') validateGreekLessonChirho(lessonChirho);
		else validateLessonChirho(lessonChirho);
		const verifiedChirho = lessonChirho as LessonChirho | GreekLessonChirho;
		if (
			verifiedChirho.reference_chirho !==
			bookChirho.label_chirho + ' ' + chapterChirho + ':' + verseChirho
		)
			throw new Error('Verse reference does not match the selection.');
		return verifiedChirho;
	}
	return { chaptersChirho, lessonChirho };
}
