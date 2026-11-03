// For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life. — John 3:16 (KJV)
import { createBibleClientChirho } from '$lib/bible-chirho/content-client-chirho';
import { bibleBookChirho } from '$lib/bible-chirho/books-chirho';
import type { GreekLessonChirho } from '$lib/domain-chirho/greek-chirho';
export function createGreekClientChirho(bookChirho = 'John') {
	if (bibleBookChirho(bookChirho).language_chirho !== 'grc')
		throw new Error('Expected a Greek source book.');
	const clientChirho = createBibleClientChirho(bookChirho);
	return {
		chaptersChirho: clientChirho.chaptersChirho,
		lessonChirho: async (chapterChirho: number, verseChirho: number) =>
			(await clientChirho.lessonChirho(chapterChirho, verseChirho)) as GreekLessonChirho
	};
}
