// For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life. — John 3:16 (KJV)
import registryChirho from '../../../config-chirho/bible-chirho/books-chirho.json';

export interface BibleBookChirho {
	id_chirho: string;
	label_chirho: string;
	spanish_label_chirho: string;
	slug_chirho: string;
	language_chirho: 'he' | 'grc';
	testament_chirho: 'old' | 'new';
	chapter_count_chirho: number;
	featured_chirho: boolean;
}
export const BIBLE_BOOKS_CHIRHO = registryChirho.books_chirho as BibleBookChirho[];
const booksChirho = new Map(
	BIBLE_BOOKS_CHIRHO.map((bookChirho) => [bookChirho.id_chirho, bookChirho])
);
export function bibleBookChirho(idChirho: string): BibleBookChirho {
	const bookChirho = booksChirho.get(idChirho);
	if (!bookChirho) throw new Error('Unknown Bible book.');
	return bookChirho;
}
export function isBibleBookChirho(idChirho: string): boolean {
	return booksChirho.has(idChirho);
}
export function isPassageIdChirho(idChirho: string): boolean {
	const matchChirho = /^([1-3]?[A-Za-z]+)\.([1-9]\d{0,2})\.([1-9]\d{0,2})$/u.exec(idChirho);
	return (
		!!matchChirho &&
		booksChirho.has(matchChirho[1]) &&
		Number(matchChirho[2]) <= bibleBookChirho(matchChirho[1]).chapter_count_chirho &&
		Number(matchChirho[3]) <= 200
	);
}

const foldersChirho = new Map(
	BIBLE_BOOKS_CHIRHO.map((bookChirho) => [bookChirho.slug_chirho, bookChirho])
);
/** Only canonical registry slugs and chapter names; caller supplies its fixed public prefix. */
export function isBibleChapterPathChirho(pathChirho: string, prefixChirho: string): boolean {
	if (!pathChirho.startsWith(prefixChirho)) return false;
	const matchChirho = /^([a-z0-9-]+)\/chapter-(\d{2,3})-chirho\.json$/u.exec(
		pathChirho.slice(prefixChirho.length)
	);
	if (!matchChirho) return false;
	const bookChirho = foldersChirho.get(matchChirho[1]);
	const numberChirho = Number(matchChirho[2]);
	return (
		!!bookChirho &&
		numberChirho >= 1 &&
		numberChirho <= bookChirho.chapter_count_chirho &&
		matchChirho[2] === String(numberChirho).padStart(2, '0')
	);
}
