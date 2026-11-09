// For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life. — John 3:16 (KJV)
// Workflow: hosting-chirho/native-readers-chirho.md. Export existing Greek teaching IPA, never speech or new phonology.
import { createHash as createHashChirho } from 'node:crypto';
import { readFileSync as readFileSyncChirho } from 'node:fs';
import { join as joinChirho } from 'node:path';
import assertChirho from 'node:assert/strict';
import { BIBLE_BOOKS_CHIRHO } from '../../../src/lib/bible-chirho/books-chirho';
import { validateGreekLessonChirho } from '../../../src/lib/domain-chirho/greek-chirho';
import { spokenWordChirho } from '../../../src/lib/domain-chirho/pronunciation-chirho';
import {
	greekWordIpaChirho,
	type GreekIpaProfileChirho
} from '../../../src/lib/domain-chirho/pronunciation-chirho/greek-ipa-chirho';

export const GREEK_GUIDE_RECIPE_CHIRHO = 'greek-word-ipa-guide-v1-chirho';
export const GREEK_GUIDE_PROFILES_CHIRHO = ['modern', 'modern_aspirates', 'erasmian'] as const;
export const GREEK_GUIDE_LIMITS_CHIRHO = {
	part_count_chirho: 8,
	max_forms_chirho: 25000,
	max_part_forms_chirho: 4096,
	max_part_bytes_chirho: 1048576,
	max_manifest_bytes_chirho: 131072,
	max_total_bytes_chirho: 9437184,
	max_text_bytes_chirho: 1024,
	max_ipa_bytes_chirho: 2048
} as const;
export const GREEK_GUIDE_MANIFEST_CHIRHO = 'greek-ipa-manifest-chirho.json';
export const greekGuideHashChirho = (bytesChirho: Uint8Array | string) =>
	createHashChirho('sha256').update(bytesChirho).digest('hex');
export const greekGuidePartIndexChirho = (keyChirho: string) => {
	assertChirho.match(keyChirho, /^[a-f0-9]{64}$/u);
	return Number.parseInt(keyChirho.slice(0, 2), 16) & 7;
};
export const greekGuidePartNameChirho = (indexChirho: number) => {
	assertChirho.ok(Number.isInteger(indexChirho) && indexChirho >= 0 && indexChirho < 8);
	return `greek-ipa-part-${String(indexChirho).padStart(2, '0')}-chirho.json`;
};
const encodeChirho = (valueChirho: unknown) => JSON.stringify(valueChirho, null, '\t') + '\n';
const objectChirho = (valueChirho: unknown): Record<string, unknown> => {
	assertChirho.ok(valueChirho && typeof valueChirho === 'object' && !Array.isArray(valueChirho));
	return valueChirho as Record<string, unknown>;
};
const utf8EqualChirho = (leftChirho: string, rightChirho: string) =>
	Buffer.from(leftChirho).equals(Buffer.from(rightChirho));
export interface GreekGuideRowChirho {
	text_chirho: string;
	ipa_chirho: Record<GreekIpaProfileChirho, string | null>;
}
export interface GreekGuidePartChirho {
	schema_version_chirho: 1;
	recipe_id_chirho: string;
	part_index_chirho: number;
	entries_chirho: Record<string, GreekGuideRowChirho>;
}
export interface GreekGuidePartPinChirho {
	part_index_chirho: number;
	file_chirho: string;
	sha256_chirho: string;
	bytes_chirho: number;
	count_chirho: number;
}
export interface GreekGuideChapterPinChirho {
	book_id_chirho: string;
	chapter_chirho: number;
	path_chirho: string;
	sha256_chirho: string;
	bytes_chirho: number;
	verses_chirho: number;
}
export interface GreekGuideCorpusChirho {
	registry_sha256_chirho: string;
	manifest_pins_chirho: { book_id_chirho: string; path_chirho: string; sha256_chirho: string }[];
	chapter_pins_chirho: GreekGuideChapterPinChirho[];
	chapter_count_chirho: number;
	verse_count_chirho: number;
	token_count_chirho: number;
	sha256_chirho: string;
}
export interface GreekGuideManifestChirho {
	schema_version_chirho: 1;
	recipe_id_chirho: string;
	kind_chirho: 'teaching_guide';
	language_chirho: 'grc';
	profiles_chirho: readonly GreekIpaProfileChirho[];
	key_algorithm_chirho: 'sha256-utf8-exact-chirho';
	shard_algorithm_chirho: 'first-sha256-byte-and-7-chirho';
	part_count_chirho: 8;
	form_count_chirho: number;
	input_sha256_chirho: string;
	source_functions_chirho: {
		function_chirho: string;
		path_chirho: string;
		sha256_chirho: string;
	}[];
	corpus_chirho: GreekGuideCorpusChirho;
	limits_chirho: typeof GREEK_GUIDE_LIMITS_CHIRHO;
	parts_chirho: GreekGuidePartPinChirho[];
}

/** Cold hash-check every canonical Greek chapter before collecting exact spoken inputs. */
export function greekGuideCorpusChirho(rootChirho: string): {
	forms_chirho: string[];
	corpus_chirho: GreekGuideCorpusChirho;
} {
	const registryPathChirho = 'config-chirho/bible-chirho/books-chirho.json';
	const registryBytesChirho = readFileSyncChirho(joinChirho(rootChirho, registryPathChirho));
	const booksChirho = BIBLE_BOOKS_CHIRHO.filter(
		(bookChirho) => bookChirho.language_chirho === 'grc'
	);
	assertChirho.equal(booksChirho.length, 27);
	assertChirho.deepEqual(
		JSON.parse(registryBytesChirho.toString('utf8')).books_chirho,
		BIBLE_BOOKS_CHIRHO
	);
	const manifestPinsChirho: GreekGuideCorpusChirho['manifest_pins_chirho'] = [],
		chapterPinsChirho: GreekGuideChapterPinChirho[] = [];
	const formsChirho = new Set<string>();
	const verseIdsChirho = new Set<string>();
	let versesChirho = 0,
		tokensChirho = 0;
	for (const bookChirho of booksChirho) {
		const manifestPathChirho = `/content-chirho/${bookChirho.slug_chirho}/manifest-chirho.json`;
		const manifestBytesChirho = readFileSyncChirho(
			joinChirho(rootChirho, 'static', manifestPathChirho)
		);
		const manifestChirho = JSON.parse(manifestBytesChirho.toString('utf8')) as {
			book_id_chirho: string;
			language_chirho: string;
			chapters_chirho: {
				number_chirho: number;
				path_chirho: string;
				sha256_chirho: string;
				verse_count_chirho: number;
			}[];
		};
		assertChirho.equal(manifestChirho.book_id_chirho, bookChirho.id_chirho);
		assertChirho.equal(manifestChirho.language_chirho, 'grc');
		assertChirho.equal(manifestChirho.chapters_chirho.length, bookChirho.chapter_count_chirho);
		manifestPinsChirho.push({
			book_id_chirho: bookChirho.id_chirho,
			path_chirho: manifestPathChirho,
			sha256_chirho: greekGuideHashChirho(manifestBytesChirho)
		});
		for (const [indexChirho, entryChirho] of manifestChirho.chapters_chirho.entries()) {
			assertChirho.equal(entryChirho.number_chirho, indexChirho + 1);
			assertChirho.equal(
				entryChirho.path_chirho,
				`/content-chirho/${bookChirho.slug_chirho}/chapter-${String(indexChirho + 1).padStart(2, '0')}-chirho.json`
			);
			const chapterBytesChirho = readFileSyncChirho(
				joinChirho(rootChirho, 'static', entryChirho.path_chirho)
			);
			assertChirho.equal(
				greekGuideHashChirho(chapterBytesChirho),
				entryChirho.sha256_chirho,
				'Canonical Greek chapter changed'
			);
			const chapterChirho = JSON.parse(chapterBytesChirho.toString('utf8')) as {
				book_id_chirho: string;
				chapter_chirho: number;
				verses_chirho: unknown[];
			};
			assertChirho.equal(chapterChirho.book_id_chirho, bookChirho.id_chirho);
			assertChirho.equal(chapterChirho.chapter_chirho, indexChirho + 1);
			assertChirho.equal(chapterChirho.verses_chirho.length, entryChirho.verse_count_chirho);
			for (const valueChirho of chapterChirho.verses_chirho) {
				validateGreekLessonChirho(valueChirho);
				assertChirho.ok(
					valueChirho.id_chirho.startsWith(`${bookChirho.id_chirho}.${indexChirho + 1}.`)
				);
				assertChirho.ok(!verseIdsChirho.has(valueChirho.id_chirho));
				verseIdsChirho.add(valueChirho.id_chirho);
				for (const tokenChirho of valueChirho.tokens_chirho) {
					const textChirho = spokenWordChirho(tokenChirho);
					assertChirho.ok(
						Buffer.byteLength(textChirho) <= GREEK_GUIDE_LIMITS_CHIRHO.max_text_bytes_chirho
					);
					formsChirho.add(textChirho);
					tokensChirho++;
				}
				versesChirho++;
			}
			chapterPinsChirho.push({
				book_id_chirho: bookChirho.id_chirho,
				chapter_chirho: indexChirho + 1,
				path_chirho: entryChirho.path_chirho,
				sha256_chirho: entryChirho.sha256_chirho,
				bytes_chirho: chapterBytesChirho.byteLength,
				verses_chirho: entryChirho.verse_count_chirho
			});
		}
	}
	assertChirho.equal(chapterPinsChirho.length, 260);
	assertChirho.ok(
		formsChirho.size > 0 && formsChirho.size <= GREEK_GUIDE_LIMITS_CHIRHO.max_forms_chirho
	);
	assertChirho.ok(tokensChirho <= 200000);
	return {
		forms_chirho: [...formsChirho].sort((aChirho, bChirho) =>
			Buffer.compare(Buffer.from(aChirho), Buffer.from(bChirho))
		),
		corpus_chirho: {
			registry_sha256_chirho: greekGuideHashChirho(registryBytesChirho),
			manifest_pins_chirho: manifestPinsChirho,
			chapter_pins_chirho: chapterPinsChirho,
			chapter_count_chirho: chapterPinsChirho.length,
			verse_count_chirho: versesChirho,
			token_count_chirho: tokensChirho,
			sha256_chirho: greekGuideHashChirho(JSON.stringify(chapterPinsChirho))
		}
	};
}
/** Only the existing shared helper computes IPA. The raw source is also retained beside its exact-byte key. */
export function greekGuidePartsChirho(formsChirho: readonly string[]): GreekGuidePartChirho[] {
	assertChirho.ok(formsChirho.length <= GREEK_GUIDE_LIMITS_CHIRHO.max_forms_chirho);
	const partsChirho: GreekGuidePartChirho[] = Array.from(
		{ length: 8 },
		(unusedChirho, indexChirho) => ({
			schema_version_chirho: 1,
			recipe_id_chirho: GREEK_GUIDE_RECIPE_CHIRHO,
			part_index_chirho: indexChirho,
			entries_chirho: {}
		})
	);
	for (const textChirho of formsChirho) {
		assertChirho.ok(
			Buffer.byteLength(textChirho) <= GREEK_GUIDE_LIMITS_CHIRHO.max_text_bytes_chirho
		);
		const keyChirho = greekGuideHashChirho(textChirho),
			partChirho = partsChirho[greekGuidePartIndexChirho(keyChirho)];
		const priorChirho = partChirho.entries_chirho[keyChirho];
		if (priorChirho) {
			assertChirho.ok(utf8EqualChirho(priorChirho.text_chirho, textChirho), 'Exact key collision');
			continue;
		}
		const ipaChirho = Object.fromEntries(
			GREEK_GUIDE_PROFILES_CHIRHO.map((profileChirho) => {
				const valueChirho = greekWordIpaChirho(textChirho, profileChirho);
				assertChirho.ok(
					valueChirho === null ||
						Buffer.byteLength(valueChirho) <= GREEK_GUIDE_LIMITS_CHIRHO.max_ipa_bytes_chirho
				);
				return [profileChirho, valueChirho];
			})
		) as GreekGuideRowChirho['ipa_chirho'];
		partChirho.entries_chirho[keyChirho] = { text_chirho: textChirho, ipa_chirho: ipaChirho };
	}
	for (const partChirho of partsChirho) {
		partChirho.entries_chirho = Object.fromEntries(
			Object.entries(partChirho.entries_chirho).sort(([aChirho], [bChirho]) =>
				aChirho.localeCompare(bChirho)
			)
		);
		assertChirho.ok(
			Object.keys(partChirho.entries_chirho).length <=
				GREEK_GUIDE_LIMITS_CHIRHO.max_part_forms_chirho
		);
	}
	return partsChirho;
}
/** Return complete deterministic file bytes; the caller's existing --check/write path owns filesystem changes. */
export function nativeGreekGuideChirho(rootChirho: string): Map<string, string> {
	const inventoryChirho = greekGuideCorpusChirho(rootChirho);
	const outputsChirho = new Map<string, string>();
	const pinsChirho: GreekGuidePartPinChirho[] = [];
	for (const partChirho of greekGuidePartsChirho(inventoryChirho.forms_chirho)) {
		const textChirho = encodeChirho(partChirho),
			bytesChirho = Buffer.byteLength(textChirho);
		assertChirho.ok(
			bytesChirho <= GREEK_GUIDE_LIMITS_CHIRHO.max_part_bytes_chirho,
			'Greek IPA part exceeds fixed bound'
		);
		const nameChirho = greekGuidePartNameChirho(partChirho.part_index_chirho);
		outputsChirho.set(nameChirho, textChirho);
		pinsChirho.push({
			part_index_chirho: partChirho.part_index_chirho,
			file_chirho: nameChirho,
			sha256_chirho: greekGuideHashChirho(textChirho),
			bytes_chirho: bytesChirho,
			count_chirho: Object.keys(partChirho.entries_chirho).length
		});
	}
	const sourceFilesChirho = [
		{
			function_chirho: 'greekWordIpaChirho',
			path_chirho: 'src/lib/domain-chirho/pronunciation-chirho/greek-ipa-chirho.ts'
		},
		{
			function_chirho: 'spokenWordChirho',
			path_chirho: 'src/lib/domain-chirho/pronunciation-chirho.ts'
		},
		{
			function_chirho: 'nativeGreekGuideChirho',
			path_chirho: 'apps-chirho/ios-chirho/scripts-chirho/export_greek_ipa_chirho.ts'
		}
	];
	const manifestChirho: GreekGuideManifestChirho = {
		schema_version_chirho: 1,
		recipe_id_chirho: GREEK_GUIDE_RECIPE_CHIRHO,
		kind_chirho: 'teaching_guide',
		language_chirho: 'grc',
		profiles_chirho: GREEK_GUIDE_PROFILES_CHIRHO,
		key_algorithm_chirho: 'sha256-utf8-exact-chirho',
		shard_algorithm_chirho: 'first-sha256-byte-and-7-chirho',
		part_count_chirho: 8,
		form_count_chirho: inventoryChirho.forms_chirho.length,
		input_sha256_chirho: greekGuideHashChirho(JSON.stringify(inventoryChirho.forms_chirho)),
		source_functions_chirho: sourceFilesChirho.map((rowChirho) => ({
			...rowChirho,
			sha256_chirho: greekGuideHashChirho(
				readFileSyncChirho(joinChirho(rootChirho, rowChirho.path_chirho))
			)
		})),
		corpus_chirho: inventoryChirho.corpus_chirho,
		limits_chirho: GREEK_GUIDE_LIMITS_CHIRHO,
		parts_chirho: pinsChirho
	};
	const manifestTextChirho = encodeChirho(manifestChirho);
	assertChirho.ok(
		Buffer.byteLength(manifestTextChirho) <= GREEK_GUIDE_LIMITS_CHIRHO.max_manifest_bytes_chirho
	);
	assertChirho.ok(
		pinsChirho.reduce(
			(sumChirho, rowChirho) => sumChirho + rowChirho.bytes_chirho,
			Buffer.byteLength(manifestTextChirho)
		) <= GREEK_GUIDE_LIMITS_CHIRHO.max_total_bytes_chirho
	);
	outputsChirho.set(GREEK_GUIDE_MANIFEST_CHIRHO, manifestTextChirho);
	return outputsChirho;
}
/** Reference native lookup contract: verify bounded bundled bytes, then use exact UTF-8 hash keys and no profile fallback. */
export function loadGreekGuideChirho(
	manifestTextChirho: string,
	partsChirho: ReadonlyMap<string, string>
) {
	assertChirho.ok(
		Buffer.byteLength(manifestTextChirho) <= GREEK_GUIDE_LIMITS_CHIRHO.max_manifest_bytes_chirho
	);
	const manifestChirho = objectChirho(JSON.parse(manifestTextChirho));
	assertChirho.equal(manifestChirho.schema_version_chirho, 1);
	assertChirho.equal(manifestChirho.recipe_id_chirho, GREEK_GUIDE_RECIPE_CHIRHO);
	assertChirho.equal(manifestChirho.kind_chirho, 'teaching_guide');
	assertChirho.equal(manifestChirho.language_chirho, 'grc');
	assertChirho.deepEqual(manifestChirho.profiles_chirho, GREEK_GUIDE_PROFILES_CHIRHO);
	assertChirho.equal(manifestChirho.key_algorithm_chirho, 'sha256-utf8-exact-chirho');
	assertChirho.equal(manifestChirho.shard_algorithm_chirho, 'first-sha256-byte-and-7-chirho');
	assertChirho.equal(manifestChirho.part_count_chirho, 8);
	assertChirho.ok(
		Array.isArray(manifestChirho.parts_chirho) && manifestChirho.parts_chirho.length === 8
	);
	assertChirho.ok(
		typeof manifestChirho.form_count_chirho === 'number' &&
			manifestChirho.form_count_chirho > 0 &&
			manifestChirho.form_count_chirho <= GREEK_GUIDE_LIMITS_CHIRHO.max_forms_chirho
	);
	const rowsChirho = new Map<string, GreekGuideRowChirho>();
	let totalBytesChirho = Buffer.byteLength(manifestTextChirho);
	for (const [indexChirho, valueChirho] of manifestChirho.parts_chirho.entries()) {
		const pinChirho = objectChirho(valueChirho);
		assertChirho.equal(pinChirho.part_index_chirho, indexChirho);
		assertChirho.equal(pinChirho.file_chirho, greekGuidePartNameChirho(indexChirho));
		assertChirho.ok(
			typeof pinChirho.bytes_chirho === 'number' &&
				pinChirho.bytes_chirho > 0 &&
				pinChirho.bytes_chirho <= GREEK_GUIDE_LIMITS_CHIRHO.max_part_bytes_chirho
		);
		const textChirho = partsChirho.get(pinChirho.file_chirho);
		assertChirho.equal(typeof textChirho, 'string');
		assertChirho.equal(Buffer.byteLength(textChirho!), pinChirho.bytes_chirho);
		assertChirho.equal(greekGuideHashChirho(textChirho!), pinChirho.sha256_chirho);
		totalBytesChirho += pinChirho.bytes_chirho;
		const partChirho = objectChirho(JSON.parse(textChirho!));
		assertChirho.equal(partChirho.schema_version_chirho, 1);
		assertChirho.equal(partChirho.recipe_id_chirho, GREEK_GUIDE_RECIPE_CHIRHO);
		assertChirho.equal(partChirho.part_index_chirho, indexChirho);
		const entriesChirho = Object.entries(objectChirho(partChirho.entries_chirho));
		assertChirho.equal(entriesChirho.length, pinChirho.count_chirho);
		assertChirho.ok(entriesChirho.length <= GREEK_GUIDE_LIMITS_CHIRHO.max_part_forms_chirho);
		for (const [keyChirho, valueChirho] of entriesChirho) {
			assertChirho.equal(greekGuidePartIndexChirho(keyChirho), indexChirho);
			assertChirho.ok(!rowsChirho.has(keyChirho));
			const rowChirho = objectChirho(valueChirho);
			assertChirho.equal(typeof rowChirho.text_chirho, 'string');
			assertChirho.ok(
				Buffer.byteLength(rowChirho.text_chirho as string) <=
					GREEK_GUIDE_LIMITS_CHIRHO.max_text_bytes_chirho
			);
			assertChirho.equal(greekGuideHashChirho(rowChirho.text_chirho as string), keyChirho);
			const ipaChirho = objectChirho(rowChirho.ipa_chirho);
			assertChirho.deepEqual(
				Object.keys(ipaChirho).sort(),
				[...GREEK_GUIDE_PROFILES_CHIRHO].sort()
			);
			for (const profileChirho of GREEK_GUIDE_PROFILES_CHIRHO)
				assertChirho.ok(
					ipaChirho[profileChirho] === null ||
						(typeof ipaChirho[profileChirho] === 'string' &&
							Buffer.byteLength(ipaChirho[profileChirho]) <=
								GREEK_GUIDE_LIMITS_CHIRHO.max_ipa_bytes_chirho)
				);
			rowsChirho.set(keyChirho, rowChirho as unknown as GreekGuideRowChirho);
		}
	}
	assertChirho.equal(rowsChirho.size, manifestChirho.form_count_chirho);
	assertChirho.ok(totalBytesChirho <= GREEK_GUIDE_LIMITS_CHIRHO.max_total_bytes_chirho);
	return (textChirho: string, profileChirho: GreekIpaProfileChirho): string | null => {
		if (!GREEK_GUIDE_PROFILES_CHIRHO.includes(profileChirho)) return null;
		if (Buffer.byteLength(textChirho) > GREEK_GUIDE_LIMITS_CHIRHO.max_text_bytes_chirho)
			return null;
		const rowChirho = rowsChirho.get(greekGuideHashChirho(textChirho));
		return rowChirho && utf8EqualChirho(rowChirho.text_chirho, textChirho)
			? (rowChirho.ipa_chirho[profileChirho] ?? null)
			: null;
	};
}
