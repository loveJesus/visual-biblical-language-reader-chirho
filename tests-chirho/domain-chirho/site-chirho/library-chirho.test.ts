// For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life. — John 3:16 (KJV)
import { expect, it } from 'vitest';
import { BIBLE_BOOKS_CHIRHO } from '../../../src/lib/bible-chirho/books-chirho';
import {
	PUBLIC_ROUTE_PATHS_CHIRHO,
	libraryManifestChirho,
	sitemapXmlChirho,
	verifyLibraryChirho,
	verifySitemapChirho
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

it('builds a deterministic sitemap with canonical routes and hreflang alternates and refuses tampered XML', () => {
	const xmlChirho = sitemapXmlChirho();
	expect(PUBLIC_ROUTE_PATHS_CHIRHO).toEqual([
		'/',
		'/about-chirho/',
		'/privacy-chirho/',
		'/terms-chirho/',
		'/sources-chirho/',
		'/contact-chirho/'
	]);
	for (const pathChirho of PUBLIC_ROUTE_PATHS_CHIRHO) {
		expect(xmlChirho).toContain(`<loc>https://hinneh.us${pathChirho}</loc>`);
		expect(xmlChirho).toContain(
			`<xhtml:link rel="alternate" hreflang="en" href="https://hinneh.us${pathChirho}?lang_chirho=en" />`
		);
		expect(xmlChirho).toContain(
			`<xhtml:link rel="alternate" hreflang="es" href="https://hinneh.us${pathChirho}?lang_chirho=es" />`
		);
		expect(xmlChirho).toContain(
			`<xhtml:link rel="alternate" hreflang="x-default" href="https://hinneh.us${pathChirho}" />`
		);
	}
	const encodeTextChirho = (textChirho: string) => new TextEncoder().encode(textChirho);
	expect(verifySitemapChirho(encodeTextChirho(xmlChirho))).toBe(true);
	expect(
		verifySitemapChirho(
			encodeTextChirho(xmlChirho.replace('https://hinneh.us/', 'https://evil.example/'))
		)
	).toBe(false);
	expect(verifySitemapChirho(new Uint8Array(70 * 1024))).toBe(false);
});
