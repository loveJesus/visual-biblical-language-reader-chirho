// For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life. — John 3:16 (KJV)
// Workflow: local-reader-chirho.md. Frozen source-word editions are optional, exact-chapter annotations.
import type { ContentEntryChirho } from './spanish-glosses-chirho';
export interface TranslationWordChirho {
	token_id_chirho: string;
	text_chirho: string;
	gloss_chirho: string;
	state_chirho: string;
	source_chirho: string | null;
}
export interface TranslationEditionChirho {
	source_id_chirho: string;
	words_chirho: TranslationWordChirho[];
}
export interface VerseTranslationsChirho {
	readers_chirho?: TranslationEditionChirho;
	terse_chirho?: TranslationEditionChirho;
}
interface TranslationChapterChirho {
	schema_version_chirho: 1;
	language_chirho: 'en' | 'es';
	book_id_chirho: string;
	chapter_chirho: number;
	content_path_chirho: string;
	content_sha256_chirho: string;
	verses_chirho: Record<string, VerseTranslationsChirho>;
}
interface TranslationEntryChirho extends ContentEntryChirho {
	number_chirho: number;
	content_path_chirho: string;
	content_sha256_chirho: string;
}
interface TranslationManifestChirho {
	schema_version_chirho: 1;
	languages_chirho: Partial<
		Record<
			'en' | 'es',
			{ books_chirho: Record<string, { chapters_chirho: TranslationEntryChirho[] }> }
		>
	>;
}
const MANIFEST_CHIRHO = '/glosses-chirho/editions-chirho/manifest-chirho.json';
const LIMIT_CHIRHO = 2_000_000;
async function jsonBytesChirho(responseChirho: Response): Promise<Uint8Array> {
	if (!responseChirho.ok || !responseChirho.body) throw new Error('Translation unavailable.');
	const readerChirho = responseChirho.body.getReader();
	const chunksChirho: Uint8Array[] = [];
	let sizeChirho = 0;
	try {
		while (true) {
			const partChirho = await readerChirho.read();
			if (partChirho.done) break;
			sizeChirho += partChirho.value.byteLength;
			if (sizeChirho > LIMIT_CHIRHO) throw new Error('Translation exceeds chapter bound.');
			chunksChirho.push(partChirho.value);
		}
	} finally {
		await readerChirho.cancel().catch(() => {});
		readerChirho.releaseLock();
	}
	const bytesChirho = new Uint8Array(sizeChirho);
	let offsetChirho = 0;
	for (const chunkChirho of chunksChirho) {
		bytesChirho.set(chunkChirho, offsetChirho);
		offsetChirho += chunkChirho.byteLength;
	}
	return bytesChirho;
}
export function parseTranslationChapterChirho(
	valueChirho: unknown,
	languageChirho: 'en' | 'es',
	bookChirho: string,
	chapterChirho: number,
	contentChirho: ContentEntryChirho
): TranslationChapterChirho {
	if (!valueChirho || typeof valueChirho !== 'object')
		throw new Error('Translation is not a chapter.');
	const layerChirho = valueChirho as TranslationChapterChirho;
	if (
		layerChirho.schema_version_chirho !== 1 ||
		layerChirho.language_chirho !== languageChirho ||
		layerChirho.book_id_chirho !== bookChirho ||
		layerChirho.chapter_chirho !== chapterChirho ||
		layerChirho.content_path_chirho !== contentChirho.path_chirho ||
		layerChirho.content_sha256_chirho !== contentChirho.sha256_chirho
	)
		throw new Error('Translation belongs to other content.');
	if (
		!layerChirho.verses_chirho ||
		typeof layerChirho.verses_chirho !== 'object' ||
		Array.isArray(layerChirho.verses_chirho)
	)
		throw new Error('Translation verses missing.');
	for (const [verseChirho, editionsChirho] of Object.entries(layerChirho.verses_chirho)) {
		if (
			!verseChirho.startsWith(bookChirho + '.' + chapterChirho + '.') ||
			!editionsChirho ||
			typeof editionsChirho !== 'object'
		)
			throw new Error('Translation verse identity mismatch.');
		for (const modeChirho of ['readers_chirho', 'terse_chirho'] as const) {
			const editionChirho = editionsChirho[modeChirho];
			if (editionChirho === undefined) continue;
			if (
				!editionChirho ||
				typeof editionChirho.source_id_chirho !== 'string' ||
				!editionChirho.source_id_chirho ||
				!Array.isArray(editionChirho.words_chirho) ||
				!editionChirho.words_chirho.length ||
				editionChirho.words_chirho.length > 300
			)
				throw new Error('Translation edition missing words or provenance.');
			const seenChirho = new Set<string>();
			for (const wordChirho of editionChirho.words_chirho) {
				if (
					!wordChirho ||
					typeof wordChirho.token_id_chirho !== 'string' ||
					!wordChirho.token_id_chirho ||
					seenChirho.has(wordChirho.token_id_chirho) ||
					typeof wordChirho.text_chirho !== 'string' ||
					!wordChirho.text_chirho ||
					typeof wordChirho.gloss_chirho !== 'string' ||
					wordChirho.gloss_chirho.length > 2000 ||
					typeof wordChirho.state_chirho !== 'string' ||
					!wordChirho.state_chirho ||
					(wordChirho.source_chirho !== null && typeof wordChirho.source_chirho !== 'string')
				)
					throw new Error('Translation word invalid.');
				seenChirho.add(wordChirho.token_id_chirho);
			}
		}
	}
	return layerChirho;
}
export function createTranslationClientChirho(fetchChirho: typeof fetch = fetch) {
	let manifestChirho: Promise<TranslationManifestChirho> | null = null;
	const cacheChirho = new Map<string, Promise<TranslationChapterChirho>>();
	function manifestOnceChirho() {
		manifestChirho ??= fetchChirho(MANIFEST_CHIRHO)
			.then(jsonBytesChirho)
			.then(
				(bytesChirho) =>
					JSON.parse(new TextDecoder().decode(bytesChirho)) as TranslationManifestChirho
			);
		manifestChirho.catch(() => {
			manifestChirho = null;
		});
		return manifestChirho;
	}
	return {
		async chapterChirho(
			languageChirho: 'en' | 'es',
			bookChirho: string,
			chapterChirho: number,
			contentChirho: ContentEntryChirho
		): Promise<TranslationChapterChirho | null> {
			const indexChirho = await manifestOnceChirho();
			if (indexChirho.schema_version_chirho !== 1)
				throw new Error('Translation manifest schema mismatch.');
			const entryChirho = indexChirho.languages_chirho?.[languageChirho]?.books_chirho?.[
				bookChirho
			]?.chapters_chirho?.find((rowChirho) => rowChirho.number_chirho === chapterChirho);
			if (!entryChirho) return null;
			if (
				entryChirho.content_path_chirho !== contentChirho.path_chirho ||
				entryChirho.content_sha256_chirho !== contentChirho.sha256_chirho
			)
				return null;
			if (
				!entryChirho.path_chirho.startsWith(
					'/glosses-chirho/editions-chirho/' + languageChirho + '-chirho/'
				) ||
				!/^\/glosses-chirho\/editions-chirho\/(en|es)-chirho\/[a-z0-9-]+\/chapter-[0-9]+-chirho\.json$/u.test(
					entryChirho.path_chirho
				) ||
				!/^[a-f0-9]{64}$/u.test(entryChirho.sha256_chirho)
			)
				throw new Error('Translation path or hash invalid.');
			let loadChirho = cacheChirho.get(entryChirho.path_chirho);
			if (!loadChirho) {
				loadChirho = fetchChirho(entryChirho.path_chirho)
					.then(jsonBytesChirho)
					.then(async (bytesChirho) => {
						const hashChirho = Array.from(
							new Uint8Array(
								await crypto.subtle.digest('SHA-256', bytesChirho as Uint8Array<ArrayBuffer>)
							),
							(byteChirho) => byteChirho.toString(16).padStart(2, '0')
						).join('');
						if (hashChirho !== entryChirho.sha256_chirho)
							throw new Error('Translation bytes changed.');
						return parseTranslationChapterChirho(
							JSON.parse(new TextDecoder().decode(bytesChirho)),
							languageChirho,
							bookChirho,
							chapterChirho,
							contentChirho
						);
					});
				cacheChirho.set(entryChirho.path_chirho, loadChirho);
				loadChirho.catch(() => cacheChirho.delete(entryChirho.path_chirho));
				while (cacheChirho.size > 4) cacheChirho.delete(cacheChirho.keys().next().value!);
			}
			return loadChirho;
		}
	};
}

export function translationsForWordsChirho(
	valueChirho: VerseTranslationsChirho | null,
	wordsChirho: readonly { id_chirho: string; text_chirho: string }[]
): VerseTranslationsChirho | null {
	const resultChirho: VerseTranslationsChirho = {};
	for (const modeChirho of ['readers_chirho', 'terse_chirho'] as const) {
		const editionChirho = valueChirho?.[modeChirho];
		if (
			editionChirho &&
			editionChirho.words_chirho.length === wordsChirho.length &&
			editionChirho.words_chirho.every(
				(wordChirho, indexChirho) =>
					wordChirho.token_id_chirho === wordsChirho[indexChirho].id_chirho &&
					wordChirho.text_chirho === wordsChirho[indexChirho].text_chirho
			)
		)
			resultChirho[modeChirho] = editionChirho;
	}
	return Object.keys(resultChirho).length ? resultChirho : null;
}
