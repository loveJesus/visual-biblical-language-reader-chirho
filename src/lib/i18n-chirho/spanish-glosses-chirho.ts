// For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life. — John 3:16 (KJV)

// Spanish word glosses: one static, hash-checked layer per chapter, fetched only for the chapter
// being read. No provider, database or model is asked anything at runtime. Each layer is bound to
// the exact chapter bytes it was built from; a layer for different bytes is withheld, never reused.
// Workflow: scripts-chirho/translations-chirho/README-chirho.md, node fetch_chirho.
import type { SourceChirho } from '../domain-chirho/lesson-chirho';

export const SPANISH_MANIFEST_PATH_CHIRHO = '/glosses-chirho/es-chirho/manifest-chirho.json';
const MAX_LAYER_BYTES_CHIRHO = 2_000_000;
const MAX_CACHED_CHAPTERS_CHIRHO = 4;

// The reader's own chapter entry: its public path and the SHA-256 of its bytes.
export interface ContentEntryChirho {
	path_chirho: string;
	sha256_chirho: string;
}

export type SpanishLayerResultChirho =
	| { kindChirho: 'ready'; layerChirho: SpanishLayerChirho }
	| { kindChirho: 'absent' } // the pinned export has no layer for this chapter
	| { kindChirho: 'stale' }; // built from other chapter bytes: withheld until rebuilt offline

export interface SpanishLayerChirho {
	bookIdChirho: string;
	chapterChirho: number;
	// Token id -> the approved Spanish gloss, or null where the pinned export has none.
	glossesChirho: Readonly<Record<string, string | null>>;
	// The pinned export these glosses come from, listed with the reader's other sources.
	sourceChirho: SourceChirho;
}

const SOURCE_FIELDS_CHIRHO = [
	'id_chirho',
	'title_chirho',
	'url_chirho',
	'revision_chirho',
	'sha256_chirho',
	'license_chirho',
	'attribution_chirho'
] as const;

interface SpanishManifestChirho {
	books_chirho: Record<
		string,
		{
			chapters_chirho: Array<{
				number_chirho: number;
				path_chirho: string;
				sha256_chirho: string;
				content_path_chirho: string;
				content_sha256_chirho: string;
			}>;
		}
	>;
}

type ManifestEntryChirho = SpanishManifestChirho['books_chirho'][string]['chapters_chirho'][number];

async function sha256HexChirho(bytesChirho: ArrayBuffer): Promise<string> {
	const digestChirho = await crypto.subtle.digest('SHA-256', bytesChirho);
	return Array.from(new Uint8Array(digestChirho), (byteChirho) =>
		byteChirho.toString(16).padStart(2, '0')
	).join('');
}

function recordChirho(valueChirho: unknown, whatChirho: string): Record<string, unknown> {
	if (!valueChirho || typeof valueChirho !== 'object' || Array.isArray(valueChirho))
		throw new Error(`Spanish gloss layer: ${whatChirho} is not an object.`);
	return valueChirho as Record<string, unknown>;
}

// Checks the shape of a verified layer; anything unexpected is refused, never repaired.
export function parseSpanishLayerChirho(
	valueChirho: unknown,
	bookIdChirho: string,
	chapterChirho: number,
	contentChirho: ContentEntryChirho
): SpanishLayerChirho {
	const layerChirho = recordChirho(valueChirho, 'layer');
	if (
		layerChirho.schema_version_chirho !== 1 ||
		layerChirho.language_chirho !== 'es' ||
		layerChirho.book_id_chirho !== bookIdChirho ||
		layerChirho.chapter_chirho !== chapterChirho
	)
		throw new Error('Spanish gloss layer: wrong schema, language, book or chapter.');
	if (
		layerChirho.content_path_chirho !== contentChirho.path_chirho ||
		layerChirho.content_sha256_chirho !== contentChirho.sha256_chirho
	)
		throw new Error('Spanish gloss layer: bound to other chapter bytes than its manifest says.');
	const glossesChirho = recordChirho(layerChirho.glosses_chirho, 'glosses');
	for (const [tokenChirho, glossChirho] of Object.entries(glossesChirho))
		if (glossChirho !== null && (typeof glossChirho !== 'string' || !glossChirho.trim()))
			throw new Error(`Spanish gloss layer: invalid gloss for ${tokenChirho}.`);
	const sourceChirho = recordChirho(layerChirho.source_chirho, 'source');
	for (const fieldChirho of SOURCE_FIELDS_CHIRHO) {
		const valueChirho = sourceChirho[fieldChirho];
		if (typeof valueChirho !== 'string' || !valueChirho.trim())
			throw new Error(`Spanish gloss layer: source ${fieldChirho} missing.`);
	}
	if (!/^https:\/\/[^\s@]+$/u.test(sourceChirho.url_chirho as string))
		throw new Error('Spanish gloss layer: source link is not https.');
	return {
		bookIdChirho,
		chapterChirho,
		glossesChirho: glossesChirho as Record<string, string | null>,
		sourceChirho: Object.fromEntries(
			SOURCE_FIELDS_CHIRHO.map((fieldChirho) => [fieldChirho, sourceChirho[fieldChirho]])
		) as unknown as SourceChirho
	};
}

export function createSpanishGlossClientChirho(fetchChirho: typeof fetch = fetch) {
	let manifestChirho: Promise<SpanishManifestChirho> | null = null;
	const cacheChirho = new Map<string, Promise<SpanishLayerChirho>>();

	function manifestOnceChirho(): Promise<SpanishManifestChirho> {
		manifestChirho ??= fetchChirho(SPANISH_MANIFEST_PATH_CHIRHO).then(async (responseChirho) => {
			if (!responseChirho.ok) throw new Error('Spanish gloss manifest unavailable.');
			return (await responseChirho.json()) as SpanishManifestChirho;
		});
		manifestChirho.catch(() => (manifestChirho = null));
		return manifestChirho;
	}

	async function loadChirho(
		entryChirho: ManifestEntryChirho,
		bookIdChirho: string,
		chapterChirho: number
	): Promise<SpanishLayerChirho> {
		const responseChirho = await fetchChirho(entryChirho.path_chirho);
		if (!responseChirho.ok) throw new Error('Spanish gloss layer unavailable.');
		const bytesChirho = await responseChirho.arrayBuffer();
		if (bytesChirho.byteLength > MAX_LAYER_BYTES_CHIRHO)
			throw new Error('Spanish gloss layer: too large.');
		if ((await sha256HexChirho(bytesChirho)) !== entryChirho.sha256_chirho)
			throw new Error('Spanish gloss layer: hash differs from its manifest.');
		return parseSpanishLayerChirho(
			JSON.parse(new TextDecoder().decode(bytesChirho)),
			bookIdChirho,
			chapterChirho,
			{
				path_chirho: entryChirho.content_path_chirho,
				sha256_chirho: entryChirho.content_sha256_chirho
			}
		);
	}

	return {
		// contentChirho is the reader's verified entry for the chapter on screen. Its bytes must be
		// the ones this layer was built from; otherwise the layer is withheld and not even fetched.
		async chapterLayerChirho(
			bookIdChirho: string,
			chapterChirho: number,
			contentChirho: ContentEntryChirho
		): Promise<SpanishLayerResultChirho> {
			const manifestValueChirho = await manifestOnceChirho();
			const entryChirho = manifestValueChirho.books_chirho?.[bookIdChirho]?.chapters_chirho?.find(
				(candidateChirho) => candidateChirho.number_chirho === chapterChirho
			);
			if (!entryChirho) return { kindChirho: 'absent' };
			if (!/^\/glosses-chirho\/es-chirho\/[a-z0-9/-]+\.json$/u.test(entryChirho.path_chirho))
				throw new Error('Spanish gloss layer: unexpected path.');
			if (entryChirho.content_path_chirho !== contentChirho.path_chirho)
				throw new Error('Spanish gloss layer: asked with another chapter’s content entry.');
			if (entryChirho.content_sha256_chirho !== contentChirho.sha256_chirho)
				return { kindChirho: 'stale' };
			let layerChirho = cacheChirho.get(entryChirho.path_chirho);
			if (!layerChirho) {
				const keyChirho = entryChirho.path_chirho;
				layerChirho = loadChirho(entryChirho, bookIdChirho, chapterChirho);
				layerChirho.catch(() => cacheChirho.delete(keyChirho));
				cacheChirho.set(keyChirho, layerChirho);
				while (cacheChirho.size > MAX_CACHED_CHAPTERS_CHIRHO)
					cacheChirho.delete(cacheChirho.keys().next().value as string);
			}
			return { kindChirho: 'ready', layerChirho: await layerChirho };
		}
	};
}

export function readyLayerChirho(
	resultChirho: SpanishLayerResultChirho | null
): SpanishLayerChirho | null {
	return resultChirho?.kindChirho === 'ready' ? resultChirho.layerChirho : null;
}
