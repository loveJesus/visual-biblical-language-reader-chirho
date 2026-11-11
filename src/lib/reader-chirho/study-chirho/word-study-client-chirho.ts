// For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life. — John 3:16 (KJV)
// Workflow: hosting-chirho/word-study-chirho.md. Hash-bound static summaries; no query or aggregation at request time.
export interface StudyExampleChirho {
	verse_chirho: string;
	reference_chirho: string;
	text_chirho: string;
}
export interface StudyGlossChirho {
	verse_ids_chirho?: string[];
	gloss_chirho: string;
	count_chirho: number;
	examples_chirho: StudyExampleChirho[];
}
export interface WordStudyChirho {
	total_chirho: number;
	covered_chirho: number;
	empty_chirho: number;
	glosses_chirho: StudyGlossChirho[];
}
interface StudyBindingChirho {
	path_chirho: string;
	sha256_chirho: string;
	bytes_chirho: number;
}
interface StudyEditionChirho {
	language_chirho: string;
	mode_chirho: string;
	shards_chirho: Record<string, StudyBindingChirho>;
}
interface StudyManifestChirho {
	schema_version_chirho: number;
	editions_chirho: Record<string, StudyEditionChirho>;
}
interface StudyShardChirho {
	schema_version_chirho: number;
	edition_chirho: string;
	lemmas_chirho: Record<string, WordStudyChirho>;
}
const LIMIT_CHIRHO = 2_000_000;
const CACHE_LIMIT_CHIRHO = 8;
async function bytesChirho(
	responseChirho: Response,
	limitChirho: number
): Promise<Uint8Array<ArrayBuffer>> {
	if (!responseChirho.ok || !responseChirho.body) throw new Error('Study data unavailable');
	const readerChirho = responseChirho.body.getReader();
	const chunksChirho: Uint8Array[] = [];
	let sizeChirho = 0;
	try {
		while (true) {
			const partChirho = await readerChirho.read();
			if (partChirho.done) break;
			sizeChirho += partChirho.value.byteLength;
			if (sizeChirho > limitChirho) throw new Error('Study response exceeds bound');
			chunksChirho.push(partChirho.value);
		}
	} finally {
		await readerChirho.cancel().catch(() => {});
		readerChirho.releaseLock();
	}
	const resultChirho = new Uint8Array(sizeChirho);
	let offsetChirho = 0;
	for (const chunkChirho of chunksChirho) {
		resultChirho.set(chunkChirho, offsetChirho);
		offsetChirho += chunkChirho.byteLength;
	}
	return resultChirho;
}
export async function studyHashChirho(bytesChirho: Uint8Array<ArrayBuffer>): Promise<string> {
	return Array.from(
		new Uint8Array(await crypto.subtle.digest('SHA-256', bytesChirho)),
		(byteChirho) => byteChirho.toString(16).padStart(2, '0')
	).join('');
}
export function validStudyRecordChirho(rowChirho: WordStudyChirho): boolean {
	return (
		!!rowChirho &&
		Number.isSafeInteger(rowChirho.total_chirho) &&
		rowChirho.total_chirho >= rowChirho.covered_chirho &&
		Number.isSafeInteger(rowChirho.covered_chirho) &&
		rowChirho.covered_chirho >= rowChirho.empty_chirho &&
		Number.isSafeInteger(rowChirho.empty_chirho) &&
		rowChirho.empty_chirho >= 0 &&
		Array.isArray(rowChirho.glosses_chirho) &&
		rowChirho.glosses_chirho.length <= 10_000 &&
		rowChirho.glosses_chirho.every(
			(groupChirho) =>
				typeof groupChirho.gloss_chirho === 'string' &&
				groupChirho.gloss_chirho.length > 0 &&
				groupChirho.gloss_chirho.length <= 2000 &&
				Number.isSafeInteger(groupChirho.count_chirho) &&
				groupChirho.count_chirho > 0 &&
				Array.isArray(groupChirho.examples_chirho) &&
				groupChirho.examples_chirho.length <= 3 &&
				(groupChirho.verse_ids_chirho === undefined ||
					(Array.isArray(groupChirho.verse_ids_chirho) &&
						groupChirho.verse_ids_chirho.length <= 32000 &&
						groupChirho.verse_ids_chirho.length <= groupChirho.count_chirho &&
						new Set(groupChirho.verse_ids_chirho).size === groupChirho.verse_ids_chirho.length &&
						groupChirho.verse_ids_chirho.every((idChirho) =>
							/^[1-3]?[A-Za-z]+\.\d{1,3}\.\d{1,3}$/.test(idChirho)
						))) &&
				groupChirho.examples_chirho.every(
					(exampleChirho) =>
						/^[1-3]?[A-Za-z]+\.\d{1,3}\.\d{1,3}$/.test(exampleChirho.verse_chirho) &&
						typeof exampleChirho.reference_chirho === 'string' &&
						exampleChirho.reference_chirho.length <= 100 &&
						typeof exampleChirho.text_chirho === 'string' &&
						exampleChirho.text_chirho.length <= 1000
				)
		) &&
		rowChirho.glosses_chirho.reduce(
			(sumChirho, groupChirho) => sumChirho + groupChirho.count_chirho,
			0
		) ===
			rowChirho.covered_chirho - rowChirho.empty_chirho
	);
}
export function createWordStudyClientChirho(
	fetchChirho: typeof fetch = fetch,
	nowChirho: () => number = Date.now
) {
	let manifestChirho: Promise<StudyManifestChirho> | null = null;
	let manifestAtChirho = 0;
	const cacheChirho = new Map<
		string,
		{
			promiseChirho: Promise<StudyShardChirho>;
			settledChirho: boolean;
			failedAtChirho: number | null;
		}
	>();
	async function indexChirho(): Promise<StudyManifestChirho> {
		if (!manifestChirho || nowChirho() - manifestAtChirho > 300_000) {
			manifestAtChirho = nowChirho();
			const requestChirho = fetchChirho('/study-chirho/manifest-chirho.json', { cache: 'no-cache' })
				.then((responseChirho) => bytesChirho(responseChirho, 100_000))
				.then((dataChirho) => {
					const valueChirho = JSON.parse(
						new TextDecoder().decode(dataChirho)
					) as StudyManifestChirho;
					if (
						valueChirho.schema_version_chirho !== 1 ||
						!valueChirho.editions_chirho ||
						typeof valueChirho.editions_chirho !== 'object'
					)
						throw new Error('Study index invalid');
					return valueChirho;
				});
			manifestChirho = requestChirho;
			requestChirho.catch(() => {
				if (manifestChirho === requestChirho) manifestAtChirho = nowChirho() - 290_000;
			});
		}
		return manifestChirho;
	}
	return {
		async wordChirho(
			languageChirho: 'en' | 'es',
			modeChirho: 'readers' | 'terse',
			lemmaChirho: string
		): Promise<WordStudyChirho | null> {
			if (!/^[HG]\d+[a-z]?$/.test(lemmaChirho)) return null;
			const editionKeyChirho = `${languageChirho}-${modeChirho}`;
			const indexValueChirho = await indexChirho();
			const editionChirho = indexValueChirho.editions_chirho[editionKeyChirho];
			if (!editionChirho) return null;
			const partChirho = (
				parseInt((await studyHashChirho(new TextEncoder().encode(lemmaChirho))).slice(0, 2), 16) &
				63
			)
				.toString(16)
				.padStart(2, '0');
			const bindingChirho = editionChirho.shards_chirho?.[partChirho];
			if (!bindingChirho) return null;
			if (
				editionChirho.language_chirho !== languageChirho ||
				editionChirho.mode_chirho !== modeChirho ||
				!/^[a-f0-9]{64}$/.test(bindingChirho.sha256_chirho) ||
				bindingChirho.path_chirho !==
					`/study-chirho/shards-chirho/${editionKeyChirho}-chirho/${partChirho}-chirho/${bindingChirho.sha256_chirho}-chirho.json` ||
				!Number.isSafeInteger(bindingChirho.bytes_chirho) ||
				bindingChirho.bytes_chirho < 1 ||
				bindingChirho.bytes_chirho > LIMIT_CHIRHO
			)
				throw new Error('Study binding invalid');
			let cachedChirho = cacheChirho.get(bindingChirho.path_chirho);
			if (
				cachedChirho?.failedAtChirho !== null &&
				cachedChirho?.failedAtChirho !== undefined &&
				nowChirho() - cachedChirho.failedAtChirho >= 10_000
			) {
				cacheChirho.delete(bindingChirho.path_chirho);
				cachedChirho = undefined;
			}
			if (!cachedChirho) {
				if (cacheChirho.size >= CACHE_LIMIT_CHIRHO) {
					const victimChirho = [...cacheChirho].find(
						([, entryChirho]) => entryChirho.settledChirho
					);
					if (!victimChirho) throw new Error('Study requests busy');
					cacheChirho.delete(victimChirho[0]);
				}
				const entryChirho = {
					promiseChirho: Promise.resolve(null as unknown as StudyShardChirho),
					settledChirho: false,
					failedAtChirho: null as number | null
				};
				entryChirho.promiseChirho = fetchChirho(bindingChirho.path_chirho, { cache: 'force-cache' })
					.then((responseChirho) => bytesChirho(responseChirho, bindingChirho.bytes_chirho))
					.then(async (dataChirho) => {
						if (
							dataChirho.byteLength !== bindingChirho.bytes_chirho ||
							(await studyHashChirho(dataChirho)) !== bindingChirho.sha256_chirho
						)
							throw new Error('Study bytes changed');
						const shardChirho = JSON.parse(
							new TextDecoder().decode(dataChirho)
						) as StudyShardChirho;
						if (
							shardChirho.schema_version_chirho !== 1 ||
							shardChirho.edition_chirho !== editionKeyChirho ||
							!shardChirho.lemmas_chirho ||
							typeof shardChirho.lemmas_chirho !== 'object'
						)
							throw new Error('Study shard invalid');
						return shardChirho;
					});
				entryChirho.promiseChirho.then(
					() => {
						entryChirho.settledChirho = true;
					},
					() => {
						entryChirho.settledChirho = true;
						entryChirho.failedAtChirho = nowChirho();
					}
				);
				cacheChirho.set(bindingChirho.path_chirho, entryChirho);
				cachedChirho = entryChirho;
			} else {
				cacheChirho.delete(bindingChirho.path_chirho);
				cacheChirho.set(bindingChirho.path_chirho, cachedChirho);
			}
			const rowChirho = (await cachedChirho.promiseChirho).lemmas_chirho[lemmaChirho];
			if (!rowChirho) return null;
			if (!validStudyRecordChirho(rowChirho)) throw new Error('Study counts invalid');
			return rowChirho;
		}
	};
}
export const wordStudyClientChirho = createWordStudyClientChirho();
