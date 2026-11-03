// For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life. — John 3:16 (KJV)
// Workflow: hosting-chirho/public-site-chirho.md. Small remote bootstrap, no corpus or credentials.
import { BIBLE_BOOKS_CHIRHO } from '../bible-chirho/books-chirho';
export const LIBRARY_PATH_CHIRHO = 'library-chirho/books-chirho.json';
export function libraryManifestChirho() {
	return {
		schema_version_chirho: 1,
		books_chirho: BIBLE_BOOKS_CHIRHO.map((bookChirho) => ({
			id_chirho: bookChirho.id_chirho,
			label_chirho: bookChirho.label_chirho,
			spanish_label_chirho: bookChirho.spanish_label_chirho,
			slug_chirho: bookChirho.slug_chirho,
			language_chirho: bookChirho.language_chirho,
			testament_chirho: bookChirho.testament_chirho,
			chapter_count_chirho: bookChirho.chapter_count_chirho,
			featured_chirho: bookChirho.featured_chirho
		}))
	};
}
export function verifyLibraryChirho(bytesChirho: Uint8Array | undefined): boolean {
	if (!bytesChirho || bytesChirho.length > 64 * 1024) return false;
	try {
		return (
			JSON.stringify(JSON.parse(new TextDecoder('utf-8', { fatal: true }).decode(bytesChirho))) ===
			JSON.stringify(libraryManifestChirho())
		);
	} catch {
		return false;
	}
}
