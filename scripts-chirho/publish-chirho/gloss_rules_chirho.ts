// For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life. — John 3:16 (KJV)
// Workflow: media-delivery-chirho.md. Static translated glosses stay bound to the source chapter.
import {
	isBibleChapterPathChirho,
	BIBLE_BOOKS_CHIRHO
} from '../../src/lib/bible-chirho/books-chirho';
import { createHash as createHashChirho } from 'node:crypto';
import type { FilesChirho } from './release_rules_chirho';

const ROOT_CHIRHO = 'glosses-chirho/es-chirho/';
const LIMIT_CHIRHO = 2_000_000;
const BOOKS_CHIRHO: Record<string, readonly [string, number]> = Object.fromEntries(
	BIBLE_BOOKS_CHIRHO.map((bookChirho) => [
		bookChirho.id_chirho,
		[bookChirho.slug_chirho, bookChirho.chapter_count_chirho] as const
	])
);
const HEX_CHIRHO = /^[a-f0-9]{64}$/;
const hashChirho = (bytesChirho: Uint8Array) =>
	createHashChirho('sha256').update(bytesChirho).digest('hex');
export const isGlossPathChirho = (pathChirho: string) =>
	pathChirho === ROOT_CHIRHO + 'manifest-chirho.json' ||
	isBibleChapterPathChirho(pathChirho, ROOT_CHIRHO);
function objectChirho(valueChirho: unknown): Record<string, unknown> {
	if (!valueChirho || typeof valueChirho !== 'object' || Array.isArray(valueChirho))
		throw new Error('expected an object');
	return valueChirho as Record<string, unknown>;
}
function parseChirho(bytesChirho: Uint8Array | undefined) {
	if (!bytesChirho || bytesChirho.byteLength > LIMIT_CHIRHO)
		throw new Error('missing or oversized JSON');
	return objectChirho(JSON.parse(new TextDecoder('utf-8', { fatal: true }).decode(bytesChirho)));
}
export function verifyGlossesChirho(filesChirho: FilesChirho, reasonsChirho: string[]) {
	const pathsChirho = [...filesChirho.keys()].filter((pathChirho) =>
		pathChirho.startsWith('glosses-chirho/')
	);
	if (!pathsChirho.length) return;
	const listedChirho = new Set([`${ROOT_CHIRHO}manifest-chirho.json`]);
	try {
		const manifestChirho = parseChirho(filesChirho.get(`${ROOT_CHIRHO}manifest-chirho.json`));
		if (
			manifestChirho.schema_version_chirho !== 1 ||
			manifestChirho.language_chirho !== 'es' ||
			manifestChirho.gloss_state_chirho !== 'gbt_approved'
		)
			throw new Error('manifest language, schema or approval state differs');
		for (const [bookIdChirho, valueChirho] of Object.entries(
			objectChirho(manifestChirho.books_chirho)
		)) {
			if (!Object.hasOwn(BOOKS_CHIRHO, bookIdChirho)) throw new Error('unlisted book');
			const [folderChirho, maximumChirho] = BOOKS_CHIRHO[bookIdChirho as keyof typeof BOOKS_CHIRHO];
			const chaptersChirho = objectChirho(valueChirho).chapters_chirho;
			if (!Array.isArray(chaptersChirho) || chaptersChirho.length > maximumChirho)
				throw new Error('invalid chapter list');
			let lastChirho = 0;
			for (const entryValueChirho of chaptersChirho) {
				const entryChirho = objectChirho(entryValueChirho);
				const numberChirho = Number(entryChirho.number_chirho);
				const paddedChirho = String(numberChirho).padStart(2, '0');
				const pathChirho = `${ROOT_CHIRHO}${folderChirho}/chapter-${paddedChirho}-chirho.json`;
				const contentPathChirho = `content-chirho/${folderChirho}/chapter-${paddedChirho}-chirho.json`;
				if (
					!Number.isSafeInteger(numberChirho) ||
					numberChirho <= lastChirho ||
					numberChirho > maximumChirho ||
					entryChirho.path_chirho !== `/${pathChirho}` ||
					typeof entryChirho.sha256_chirho !== 'string' ||
					!HEX_CHIRHO.test(entryChirho.sha256_chirho)
				)
					throw new Error('invalid chapter identity or path');
				lastChirho = numberChirho;
				const bytesChirho = filesChirho.get(pathChirho);
				const chapterChirho = parseChirho(bytesChirho);
				if (!bytesChirho || hashChirho(bytesChirho) !== entryChirho.sha256_chirho)
					throw new Error(`${pathChirho} hash differs`);
				if (
					chapterChirho.schema_version_chirho !== 1 ||
					chapterChirho.language_chirho !== 'es' ||
					chapterChirho.gloss_state_chirho !== 'gbt_approved' ||
					chapterChirho.book_id_chirho !== bookIdChirho ||
					chapterChirho.chapter_chirho !== numberChirho
				)
					throw new Error(`${pathChirho} source identity or approval differs`);
				const contentBytesChirho = filesChirho.get(contentPathChirho);
				if (
					chapterChirho.content_path_chirho !== `/${contentPathChirho}` ||
					typeof chapterChirho.content_sha256_chirho !== 'string' ||
					!HEX_CHIRHO.test(chapterChirho.content_sha256_chirho) ||
					!contentBytesChirho ||
					hashChirho(contentBytesChirho) !== chapterChirho.content_sha256_chirho
				)
					throw new Error(`${pathChirho} source chapter changed`);
				const contentChirho = parseChirho(contentBytesChirho);
				if (!Array.isArray(contentChirho.verses_chirho))
					throw new Error('source chapter has no verses');
				const idsChirho = new Set<string>();
				for (const verseValueChirho of contentChirho.verses_chirho) {
					const tokensChirho = objectChirho(verseValueChirho).tokens_chirho;
					if (!Array.isArray(tokensChirho)) throw new Error('source verse has no words');
					for (const tokenValueChirho of tokensChirho) {
						const tokenChirho = objectChirho(tokenValueChirho);
						if (typeof tokenChirho.id_chirho !== 'string')
							throw new Error('source word has no identity');
						idsChirho.add(tokenChirho.id_chirho);
						for (const readingValueChirho of Array.isArray(tokenChirho.qere_chirho)
							? tokenChirho.qere_chirho
							: []) {
							const readingChirho = objectChirho(readingValueChirho);
							if (typeof readingChirho.id_chirho !== 'string')
								throw new Error('qere has no identity');
							idsChirho.add(readingChirho.id_chirho);
						}
					}
				}
				const sourceChirho = objectChirho(chapterChirho.source_chirho);
				if (
					typeof sourceChirho.url_chirho !== 'string' ||
					!/^https:\/\/github\.com\/globalbibletools\/data\/blob\/[a-f0-9]{40}\/spa\//.test(
						sourceChirho.url_chirho
					) ||
					typeof sourceChirho.sha256_chirho !== 'string' ||
					!HEX_CHIRHO.test(sourceChirho.sha256_chirho) ||
					typeof sourceChirho.license_chirho !== 'string' ||
					!sourceChirho.license_chirho.includes('CC0') ||
					typeof sourceChirho.attribution_chirho !== 'string' ||
					!sourceChirho.attribution_chirho.trim()
				)
					throw new Error('Spanish source provenance missing');
				let glossedChirho = 0,
					missingChirho = 0;
				for (const [idChirho, glossChirho] of Object.entries(
					objectChirho(chapterChirho.glosses_chirho)
				)) {
					if (
						!idsChirho.has(idChirho) ||
						(glossChirho !== null &&
							(typeof glossChirho !== 'string' || !glossChirho.trim() || glossChirho.length > 1000))
					)
						throw new Error('Spanish gloss refers to an unknown word or invalid meaning');
					if (glossChirho === null) missingChirho++;
					else glossedChirho++;
				}
				if (
					chapterChirho.glossed_chirho !== glossedChirho ||
					chapterChirho.missing_chirho !== missingChirho ||
					entryChirho.glossed_chirho !== glossedChirho ||
					entryChirho.missing_chirho !== missingChirho
				)
					throw new Error('Spanish coverage counts differ');
				listedChirho.add(pathChirho);
			}
		}
	} catch (errorChirho) {
		reasonsChirho.push(`Spanish gloss publication refused: ${(errorChirho as Error).message}`);
	}
	for (const pathChirho of pathsChirho)
		if (!listedChirho.has(pathChirho))
			reasonsChirho.push(`/${pathChirho} is not listed by the Spanish manifest`);
}
