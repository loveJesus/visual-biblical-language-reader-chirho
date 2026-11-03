// For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life. — John 3:16 (KJV)

import { isPassageIdChirho } from '$lib/bible-chirho/books-chirho';

/** Fresh visits follow the reader's local calendar; explicit passage links always win. */
export function openingPassageChirho(fragmentChirho: string, dateChirho = new Date()) {
	if (!fragmentChirho)
		return { book_chirho: 'Prov' as const, chapter_chirho: dateChirho.getDate(), verse_chirho: 1 };
	const matchChirho = /^#([1-3]?[A-Za-z]+)\.(\d{1,3})\.(\d{1,3})$/u.exec(fragmentChirho);
	return matchChirho && isPassageIdChirho(fragmentChirho.slice(1))
		? {
				book_chirho: matchChirho[1],
				chapter_chirho: Number(matchChirho[2]),
				verse_chirho: Number(matchChirho[3])
			}
		: null;
}
