// For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life. — John 3:16 (KJV)
import { createBibleClientChirho } from '$lib/bible-chirho/content-client-chirho';
import { bibleBookChirho } from '$lib/bible-chirho/books-chirho';
import type { LessonChirho } from '$lib/domain-chirho/lesson-chirho';
export {
	bytesChirho,
	parseChirho,
	type ChapterEntryChirho
} from '$lib/bible-chirho/content-client-chirho';
export function createCorpusClientChirho(bookChirho = 'Prov') {
	if (bibleBookChirho(bookChirho).language_chirho !== 'he')
		throw new Error('Expected a Hebrew-script source book.');
	const clientChirho = createBibleClientChirho(bookChirho);
	return {
		chaptersChirho: clientChirho.chaptersChirho,
		lessonChirho: async (chapterChirho: number, verseChirho: number) =>
			(await clientChirho.lessonChirho(chapterChirho, verseChirho)) as LessonChirho
	};
}
