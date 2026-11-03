// For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life. — John 3:16 (KJV)

import { bytesChirho, parseChirho } from './corpus-client-chirho';

import { bibleBookChirho } from '$lib/bible-chirho/books-chirho';
type BookChirho = string;
type EntryChirho = {
	number_chirho: number;
	path_chirho: string;
	sha256_chirho: string;
	scene_count_chirho: number;
	icon_count_chirho: number;
	lemma_icon_count_chirho?: number;
};

// Workflow: read the small book summary, then verify only the selected chapter.
export async function fetchChapterMediaChirho(bookChirho: BookChirho, chapterChirho: number) {
	const entryBookChirho = bibleBookChirho(bookChirho);
	const folderChirho = entryBookChirho.slug_chirho;
	const maxChaptersChirho = entryBookChirho.chapter_count_chirho;
	if (!Number.isInteger(chapterChirho) || chapterChirho < 1 || chapterChirho > maxChaptersChirho)
		throw new Error('Invalid media chapter.');
	for (let attemptChirho = 0; attemptChirho < 2; attemptChirho++) {
		const summaryChirho = parseChirho(
			await bytesChirho(`/media-chirho/${folderChirho}/summary-chirho.json`)
		) as {
			schema_version_chirho?: unknown;
			book_id_chirho?: unknown;
			scene_count_chirho?: unknown;
			icon_count_chirho?: unknown;
			lemma_icon_count_chirho?: unknown;
			chapters_chirho?: unknown;
		};
		if (
			summaryChirho?.schema_version_chirho !== 1 ||
			summaryChirho.book_id_chirho !== bookChirho ||
			!Array.isArray(summaryChirho.chapters_chirho) ||
			summaryChirho.chapters_chirho.length > maxChaptersChirho ||
			!Number.isSafeInteger(summaryChirho.scene_count_chirho) ||
			!Number.isSafeInteger(summaryChirho.icon_count_chirho) ||
			Number(summaryChirho.scene_count_chirho) < 0 ||
			Number(summaryChirho.icon_count_chirho) < 0
		)
			throw new Error('Invalid media summary.');
		const entriesChirho = summaryChirho.chapters_chirho as EntryChirho[];
		let previousChirho = 0;
		for (const entryChirho of entriesChirho) {
			if (
				!entryChirho ||
				!Number.isInteger(entryChirho.number_chirho) ||
				entryChirho.number_chirho <= previousChirho ||
				entryChirho.number_chirho > maxChaptersChirho ||
				entryChirho.path_chirho !==
					`/media-chirho/${folderChirho}/chapter-${String(entryChirho.number_chirho).padStart(2, '0')}-chirho.json` ||
				!/^[a-f0-9]{64}$/u.test(entryChirho.sha256_chirho) ||
				!Number.isSafeInteger(entryChirho.scene_count_chirho) ||
				entryChirho.scene_count_chirho < 0 ||
				!Number.isSafeInteger(entryChirho.icon_count_chirho) ||
				entryChirho.icon_count_chirho < 0 ||
				(entryChirho.lemma_icon_count_chirho !== undefined &&
					(!Number.isSafeInteger(entryChirho.lemma_icon_count_chirho) ||
						entryChirho.lemma_icon_count_chirho < 0 ||
						entryChirho.lemma_icon_count_chirho > 4096))
			)
				throw new Error('Invalid media chapter entry.');
			previousChirho = entryChirho.number_chirho;
		}
		if (
			entriesChirho.reduce(
				(sumChirho, entryChirho) => sumChirho + entryChirho.scene_count_chirho,
				0
			) !== summaryChirho.scene_count_chirho ||
			entriesChirho.reduce(
				(sumChirho, entryChirho) => sumChirho + entryChirho.icon_count_chirho,
				0
			) !== summaryChirho.icon_count_chirho
		)
			throw new Error('Invalid media totals.');
		const entryChirho = entriesChirho.find(
			(itemChirho) => itemChirho.number_chirho === chapterChirho
		);
		if (!entryChirho)
			return {
				summaryChirho,
				chapterChirho: { schema_version_chirho: 1, scenes_chirho: [], icons_chirho: [] }
			};
		const rawChirho = await bytesChirho(entryChirho.path_chirho);
		const hashChirho = Array.from(
			new Uint8Array(await crypto.subtle.digest('SHA-256', rawChirho)),
			(byteChirho) => byteChirho.toString(16).padStart(2, '0')
		).join('');
		if (hashChirho !== entryChirho.sha256_chirho) {
			if (attemptChirho === 0) continue;
			throw new Error('Media chapter integrity check failed.');
		}
		const dataChirho = parseChirho(rawChirho) as {
			schema_version_chirho?: unknown;
			book_id_chirho?: unknown;
			chapter_chirho?: unknown;
			scenes_chirho?: unknown;
			icons_chirho?: unknown;
			lemma_icons_chirho?: unknown;
		};
		if (
			dataChirho?.schema_version_chirho !== 1 ||
			dataChirho.book_id_chirho !== bookChirho ||
			dataChirho.chapter_chirho !== chapterChirho ||
			!Array.isArray(dataChirho.scenes_chirho) ||
			dataChirho.scenes_chirho.length !== entryChirho.scene_count_chirho ||
			!Array.isArray(dataChirho.icons_chirho) ||
			dataChirho.icons_chirho.length !== entryChirho.icon_count_chirho ||
			(dataChirho.lemma_icons_chirho !== undefined &&
				!Array.isArray(dataChirho.lemma_icons_chirho)) ||
			((dataChirho.lemma_icons_chirho as unknown[] | undefined)?.length ?? 0) !==
				(entryChirho.lemma_icon_count_chirho ?? 0)
		)
			throw new Error('Invalid media chapter.');
		const prefixChirho = `${bookChirho}.${chapterChirho}.`;
		if (
			[...dataChirho.scenes_chirho, ...dataChirho.icons_chirho].some(
				(recordChirho) =>
					!recordChirho ||
					typeof recordChirho !== 'object' ||
					typeof recordChirho.lesson_id_chirho !== 'string' ||
					!recordChirho.lesson_id_chirho.startsWith(prefixChirho)
			)
		)
			throw new Error('Media record belongs to another chapter.');
		return { summaryChirho, chapterChirho: dataChirho };
	}
	throw new Error('Media is unavailable.');
}
