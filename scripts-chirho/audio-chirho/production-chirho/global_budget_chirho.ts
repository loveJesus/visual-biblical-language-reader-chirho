// For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life. — John 3:16 (KJV)
// Workflow: whole-bible-chirho.md. One unchanged credit ceiling across old and whole-canon queues.
import { readFile as readFileChirho, readdir as readdirChirho } from 'node:fs/promises';
import { join as joinChirho, dirname as dirnameChirho } from 'node:path';
import { sha256Chirho, cacheKeyChirho, type ReceiptChirho } from '../audition_chirho';
import type { LibraryWordChirho } from './prepare_words_chirho';

export const BIBLE_WORD_HOME_CHIRHO =
	'workspace-chirho/audio-chirho/production-bible-2026-11-02-chirho';
export const ORIGINAL_WORD_HOME_CHIRHO =
	'workspace-chirho/audio-chirho/production-2026-10-31-chirho';
async function optionalJsonChirho<ValueChirho>(pathChirho: string): Promise<ValueChirho | null> {
	try {
		return JSON.parse(await readFileChirho(pathChirho, 'utf8')) as ValueChirho;
	} catch (errorChirho) {
		if ((errorChirho as NodeJS.ErrnoException).code === 'ENOENT') return null;
		throw errorChirho;
	}
}
export async function otherReservationsChirho(rootChirho: string, currentHomeChirho: string) {
	if (![ORIGINAL_WORD_HOME_CHIRHO, BIBLE_WORD_HOME_CHIRHO].includes(currentHomeChirho))
		throw new Error('Unknown production ledger.');
	let creditsChirho = 0;
	const keysChirho = new Set<string>();
	for (const homeChirho of [ORIGINAL_WORD_HOME_CHIRHO, BIBLE_WORD_HOME_CHIRHO]) {
		if (homeChirho === currentHomeChirho) continue;
		const indexChirho = await optionalJsonChirho<{
			batches_chirho: { path_chirho: string; sha256_chirho: string }[];
		}>(joinChirho(rootChirho, homeChirho, 'index-chirho.json'));
		if (!indexChirho) continue;
		if (indexChirho.batches_chirho.length > 1000)
			throw new Error('Other audio ledger exceeds whole-canon bound.');
		for (const entryChirho of indexChirho.batches_chirho) {
			if (
				!/^batches-chirho\/\d{4}-chirho\/batch-\d{4}-chirho\/plan-chirho\.json$/u.test(
					entryChirho.path_chirho
				)
			)
				throw new Error('Other ledger path refused.');
			const pathChirho = joinChirho(rootChirho, homeChirho, entryChirho.path_chirho);
			const bytesChirho = await readFileChirho(pathChirho);
			if (sha256Chirho(bytesChirho) !== entryChirho.sha256_chirho)
				throw new Error('Other audio plan drift.');
			const wordsChirho = (
				JSON.parse(bytesChirho.toString('utf8')) as { words_chirho: LibraryWordChirho[] }
			).words_chirho;
			const receiptsChirho =
				(await optionalJsonChirho<ReceiptChirho[]>(
					joinChirho(dirnameChirho(pathChirho), 'receipts-chirho.json')
				)) ?? [];
			if (receiptsChirho.length > 96 || wordsChirho.length > 96)
				throw new Error('Other audio receipt count differs.');
			for (const receiptChirho of receiptsChirho) {
				const wordChirho = wordsChirho.find(
					(wordChirho) => wordChirho.job_chirho.id_chirho === receiptChirho.id_chirho
				);
				if (
					!wordChirho ||
					receiptChirho.key_chirho !== cacheKeyChirho(wordChirho.job_chirho) ||
					!Number.isSafeInteger(receiptChirho.reserved_credits_chirho) ||
					receiptChirho.reserved_credits_chirho < 0
				)
					throw new Error('Other audio reservation identity differs.');
				creditsChirho += receiptChirho.reserved_credits_chirho;
				keysChirho.add(receiptChirho.key_chirho);
			}
		}
	}
	const correctionHomeChirho = joinChirho(
		rootChirho,
		ORIGINAL_WORD_HOME_CHIRHO,
		'corrections-chirho'
	);
	const correctionsChirho = await readdirChirho(correctionHomeChirho, {
		withFileTypes: true
	}).catch((errorChirho) => {
		if (errorChirho.code === 'ENOENT') return [];
		throw errorChirho;
	});
	if (correctionsChirho.length > 100) throw new Error('Correction receipts need cold retirement.');
	for (const entryChirho of correctionsChirho) {
		if (!entryChirho.isDirectory() || !/^[a-z0-9-]+$/u.test(entryChirho.name))
			throw new Error('Unexpected correction receipt directory.');
		const rowsChirho =
			(await optionalJsonChirho<ReceiptChirho[]>(
				joinChirho(correctionHomeChirho, entryChirho.name, 'receipts-chirho.json')
			)) ?? [];
		if (rowsChirho.length > 96) throw new Error('Correction receipt count differs.');
		for (const rowChirho of rowsChirho) {
			if (
				!Number.isSafeInteger(rowChirho.reserved_credits_chirho) ||
				rowChirho.reserved_credits_chirho < 0
			)
				throw new Error('Invalid correction reservation.');
			creditsChirho += rowChirho.reserved_credits_chirho;
		}
	}
	return { credits_chirho: creditsChirho, keys_chirho: keysChirho };
}
