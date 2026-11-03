// For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life. — John 3:16 (KJV)
// Workflow: reusable-word-audio-chirho.md. Adopt exact historical word clips; never split natural verses.
import { readFile as readFileChirho } from 'node:fs/promises';
import { join as joinChirho } from 'node:path';
import {
	cacheKeyChirho,
	sha256Chirho,
	writeChirho,
	type AudioJobChirho,
	type ReceiptChirho
} from '../audition_chirho';
import { isRejectedAudioChirho } from '../../../src/lib/domain-chirho/pronunciation-chirho/audio-reviews-chirho';
import type { LibraryWordChirho } from './prepare_words_chirho';

export async function reuseWordsChirho(
	rootChirho: string,
	folderChirho: string,
	wordsChirho: LibraryWordChirho[],
	receiptsChirho: ReceiptChirho[]
) {
	for (const subfolderChirho of ['', 'ipa-chirho']) {
		const originChirho = joinChirho(
			rootChirho,
			'workspace-chirho/audio-chirho/audition-2026-10-30-chirho',
			subfolderChirho
		);
		const manifestChirho = JSON.parse(
			await readFileChirho(joinChirho(originChirho, 'audition-manifest-chirho.json'), 'utf8')
		) as { jobs_chirho: AudioJobChirho[]; clips_chirho: ReceiptChirho[] };
		for (const jobChirho of manifestChirho.jobs_chirho) {
			if (jobChirho.token_id_chirho === null) continue;
			const keyChirho = cacheKeyChirho(jobChirho);
			const wordChirho = wordsChirho.find((rowChirho) => rowChirho.key_chirho === keyChirho);
			if (
				!wordChirho ||
				receiptsChirho.some((rowChirho) => rowChirho.id_chirho === wordChirho.job_chirho.id_chirho)
			)
				continue;
			const receiptChirho = manifestChirho.clips_chirho.find(
				(rowChirho) => rowChirho.id_chirho === jobChirho.id_chirho
			);
			if (
				receiptChirho?.state_chirho !== 'received' ||
				!receiptChirho.path_chirho ||
				!/^[a-z0-9-]+\.mp3$/u.test(receiptChirho.path_chirho) ||
				receiptChirho.key_chirho !== keyChirho ||
				isRejectedAudioChirho(receiptChirho.sha256_chirho)
			)
				continue;
			const bytesChirho = await readFileChirho(joinChirho(originChirho, receiptChirho.path_chirho));
			if (
				sha256Chirho(bytesChirho) !== receiptChirho.sha256_chirho ||
				bytesChirho.length !== receiptChirho.bytes_chirho
			)
				throw new Error('Historical word audio changed');
			const pathChirho = `${wordChirho.job_chirho.id_chirho}-${keyChirho.slice(0, 12)}-chirho.mp3`;
			await writeChirho(joinChirho(folderChirho, pathChirho), bytesChirho);
			receiptsChirho.push({
				...receiptChirho,
				id_chirho: wordChirho.job_chirho.id_chirho,
				path_chirho: pathChirho,
				reserved_credits_chirho: 0,
				reused_chirho: true
			});
			await writeChirho(
				joinChirho(folderChirho, 'receipts-chirho.json'),
				JSON.stringify(receiptsChirho, null, 2) + '\n'
			);
		}
	}
	return receiptsChirho;
}
