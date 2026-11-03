// For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life. — John 3:16 (KJV)
import { expect, it } from 'vitest';
import { BIBLE_BOOKS_CHIRHO } from '../../../src/lib/bible-chirho/books-chirho';
import {
	libraryManifestChirho,
	verifyLibraryChirho
} from '../../../src/lib/site-chirho/library-chirho';

it('publishes book identities without internal importer fields and refuses corrupted bootstraps', () => {
	const valueChirho = libraryManifestChirho();
	expect(valueChirho.books_chirho.map((bookChirho) => bookChirho.id_chirho)).toEqual(
		BIBLE_BOOKS_CHIRHO.map((bookChirho) => bookChirho.id_chirho)
	);
	expect(
		valueChirho.books_chirho.every((bookChirho) => !Object.hasOwn(bookChirho, 'gbt_file_chirho'))
	).toBe(true);
	const encodeChirho = (inputChirho: unknown) =>
		new TextEncoder().encode(JSON.stringify(inputChirho));
	expect(verifyLibraryChirho(encodeChirho(valueChirho))).toBe(true);
	valueChirho.books_chirho[0].slug_chirho = '../private-chirho';
	expect(verifyLibraryChirho(encodeChirho(valueChirho))).toBe(false);
	expect(verifyLibraryChirho(new Uint8Array(70 * 1024))).toBe(false);
});
