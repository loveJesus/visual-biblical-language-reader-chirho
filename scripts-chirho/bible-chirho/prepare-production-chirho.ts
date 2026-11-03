// For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life. — John 3:16 (KJV)
// Workflow: whole-bible-chirho.md. Immutable new requests use one source representative each;
// the separate source-bound library later fans each received clip out to all its exact matches.
import { readFile as readFileChirho } from 'node:fs/promises';
import { join as joinChirho, resolve as resolveChirho } from 'node:path';
import {
	BIBLE_WORD_HOME_CHIRHO,
	otherReservationsChirho
} from '../audio-chirho/production-chirho/global_budget_chirho';
import { cacheKeyChirho, sha256Chirho, writeChirho } from '../audio-chirho/audition_chirho';
import type { LibraryWordChirho } from '../audio-chirho/production-chirho/prepare_words_chirho';

export async function prepareProductionChirho(rootChirho: string) {
	const planHomeChirho = joinChirho(
		rootChirho,
		'workspace-chirho/audio-chirho/bible-2026-11-02-chirho'
	);
	const libraryHomeChirho = joinChirho(rootChirho, 'data-chirho/bible-chirho/library-chirho');
	const indexChirho = JSON.parse(
		await readFileChirho(joinChirho(planHomeChirho, 'index-chirho.json'), 'utf8')
	);
	const neededChirho = JSON.parse(
		await readFileChirho(joinChirho(libraryHomeChirho, 'audio-missing-chirho.json'), 'utf8')
	);
	const neededKeysChirho = new Set<string>(
		neededChirho.words_chirho.map((wordChirho: { key_chirho: string }) => wordChirho.key_chirho)
	);
	const otherChirho = await otherReservationsChirho(rootChirho, BIBLE_WORD_HOME_CHIRHO);
	const wordsChirho: { word_chirho: LibraryWordChirho; frequency_chirho: number }[] = [];
	for (const batchChirho of indexChirho.batches_chirho) {
		const bytesChirho = await readFileChirho(joinChirho(planHomeChirho, batchChirho.path_chirho));
		if (sha256Chirho(bytesChirho) !== batchChirho.sha256_chirho)
			throw new Error('Whole-canon source plan changed.');
		for (const wordChirho of (
			JSON.parse(bytesChirho.toString('utf8')) as { words_chirho: LibraryWordChirho[] }
		).words_chirho) {
			if (
				!neededKeysChirho.has(wordChirho.key_chirho) ||
				otherChirho.keys_chirho.has(wordChirho.key_chirho)
			)
				continue;
			if (cacheKeyChirho(wordChirho.job_chirho) !== wordChirho.key_chirho)
				throw new Error('Prepared audio key changed.');
			wordsChirho.push({
				word_chirho: {
					...wordChirho,
					occurrences_chirho: wordChirho.occurrences_chirho.slice(0, 1)
				},
				frequency_chirho: wordChirho.occurrences_chirho.length
			});
		}
	}
	wordsChirho.sort(
		(leftChirho, rightChirho) =>
			rightChirho.frequency_chirho - leftChirho.frequency_chirho ||
			leftChirho.word_chirho.key_chirho.localeCompare(rightChirho.word_chirho.key_chirho)
	);
	const homeChirho = joinChirho(rootChirho, BIBLE_WORD_HOME_CHIRHO);
	const batchesChirho = [];
	for (let offsetChirho = 0; offsetChirho < wordsChirho.length; offsetChirho += 96) {
		const numberChirho = offsetChirho / 96;
		const folderChirho =
			'batches-chirho/' +
			String(Math.floor(numberChirho / 10) * 10).padStart(4, '0') +
			'-chirho/batch-' +
			String(numberChirho).padStart(4, '0') +
			'-chirho';
		const pathChirho = folderChirho + '/plan-chirho.json';
		const batchChirho = wordsChirho
			.slice(offsetChirho, offsetChirho + 96)
			.map((wordChirho) => wordChirho.word_chirho);
		const encodedChirho =
			JSON.stringify({ schema_version_chirho: 1, words_chirho: batchChirho }, null, 2) + '\n';
		const previousChirho = await readFileChirho(joinChirho(homeChirho, pathChirho), 'utf8').catch(
			(errorChirho) => {
				if (errorChirho.code === 'ENOENT') return null;
				throw errorChirho;
			}
		);
		if (previousChirho !== null && previousChirho !== encodedChirho)
			throw new Error('Existing production request plan differs; preserve its identity.');
		if (previousChirho === null)
			await writeChirho(joinChirho(homeChirho, pathChirho), encodedChirho);
		batchesChirho.push({
			path_chirho: pathChirho,
			sha256_chirho: sha256Chirho(encodedChirho),
			count_chirho: batchChirho.length
		});
	}
	const outputChirho = {
		schema_version_chirho: 1,
		maximum_total_credits_chirho: 270000,
		historical_reserved_credits_chirho: 10660,
		authority_chirho:
			'L.J., November 2: whole-Bible reusable word audio; existing total cap unchanged, included credits only.',
		source_library_path_chirho:
			'workspace-chirho/audio-chirho/bible-2026-11-02-chirho/index-chirho.json',
		word_count_chirho: wordsChirho.length,
		occurrence_count_chirho: wordsChirho.length,
		held_occurrences_chirho: indexChirho.held_occurrences_chirho,
		estimated_new_credits_chirho: wordsChirho.reduce(
			(sumChirho, rowChirho) =>
				sumChirho + [...rowChirho.word_chirho.job_chirho.synthesis_text_chirho!].length,
			0
		),
		batches_chirho: batchesChirho
	};
	const encodedIndexChirho = JSON.stringify(outputChirho, null, 2) + '\n';
	const previousIndexChirho = await readFileChirho(
		joinChirho(homeChirho, 'index-chirho.json'),
		'utf8'
	).catch((errorChirho) => {
		if (errorChirho.code === 'ENOENT') return null;
		throw errorChirho;
	});
	if (previousIndexChirho !== null && previousIndexChirho !== encodedIndexChirho)
		throw new Error('Production index changed; do not rewrite request evidence.');
	if (previousIndexChirho === null)
		await writeChirho(joinChirho(homeChirho, 'index-chirho.json'), encodedIndexChirho);
	return {
		...outputChirho,
		batches_chirho: batchesChirho.length,
		prior_reserved_credits_chirho: 10660 + otherChirho.credits_chirho
	};
}
if (import.meta.main)
	console.log(JSON.stringify(await prepareProductionChirho(resolveChirho('.')), null, 2));
