// For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life. — John 3:16 (KJV)
// Workflow: reusable-word-audio-chirho.md. Reuse prior decode proof only for identical installed bytes.
import { readFile as readFileChirho, mkdir as mkdirChirho } from 'node:fs/promises';
import { join as joinChirho } from 'node:path';
import { cacheKeyChirho, sha256Chirho, type ReceiptChirho } from '../audition_chirho';
import { audioReceiptsChirho } from '../r2_recordings_chirho';
import { acquireLockChirho } from '../../publish-chirho/r2_upload_watch_chirho';
import { validRecordingWindowChirho } from '../../../src/lib/domain-chirho/pronunciation-chirho/production-recipe-chirho';
import type { LibraryWordChirho } from './prepare_words_chirho';

import { isBibleChapterPathChirho } from '../../../src/lib/bible-chirho/books-chirho';
interface ChapterChirho {
	content_path_chirho: string;
	content_sha256_chirho: string;
	clips_chirho: Record<string, unknown>[];
}

/** Source occurrences are checked by verifyWordSourcesChirho before this offline shortcut. */
export async function wordsInstalledChirho(
	rootChirho: string,
	folderChirho: string,
	wordsChirho: LibraryWordChirho[],
	receiptsChirho: ReceiptChirho[]
): Promise<boolean> {
	if (!wordsChirho.length || wordsChirho.length > 96) return false;
	await mkdirChirho(joinChirho(rootChirho, 'build-chirho/r2-chirho'), { recursive: true });
	const releaseChirho = await acquireLockChirho(
		joinChirho(rootChirho, 'build-chirho/r2-chirho/audio-catalogue-chirho.lock')
	);
	try {
		const archiveChirho = await audioReceiptsChirho(rootChirho);
		const manifestBytesChirho = await readFileChirho(
			joinChirho(rootChirho, 'static/audio-chirho/manifest-chirho.json')
		);
		if (manifestBytesChirho.length > 512_000) return false;
		const manifestChirho = JSON.parse(manifestBytesChirho.toString('utf8')) as {
			books_chirho: Record<
				string,
				{ chapters_chirho: { path_chirho: string; sha256_chirho: string }[] }
			>;
		};
		const entriesChirho = new Map(
			Object.values(manifestChirho.books_chirho)
				.flatMap((bookChirho) => bookChirho.chapters_chirho)
				.map((entryChirho) => [entryChirho.path_chirho, entryChirho])
		);
		if (entriesChirho.size > 1200) return false;
		const chaptersChirho = new Map<string, ChapterChirho>();
		for (const wordChirho of wordsChirho) {
			const receiptChirho = receiptsChirho.find(
				(rowChirho) => rowChirho.id_chirho === wordChirho.job_chirho.id_chirho
			);
			if (
				receiptChirho?.state_chirho !== 'received' ||
				receiptChirho.key_chirho !== cacheKeyChirho(wordChirho.job_chirho) ||
				!receiptChirho.sha256_chirho ||
				!receiptChirho.path_chirho ||
				!/^[a-z0-9-]+\.mp3$/u.test(receiptChirho.path_chirho)
			)
				return false;
			const shaChirho = receiptChirho.sha256_chirho;
			const assetChirho = `/audio-chirho/sha256-chirho/${shaChirho}-chirho.mp3`;
			const archivedChirho = archiveChirho.get(`audio-chirho/sha256-chirho/${shaChirho}.mp3`);
			if (
				!/^[a-f0-9]{64}$/u.test(shaChirho) ||
				archivedChirho?.readback_sha256_chirho !== shaChirho ||
				archivedChirho.bytes_chirho !== receiptChirho.bytes_chirho
			)
				return false;
			for (const pathChirho of [
				joinChirho(folderChirho, receiptChirho.path_chirho),
				joinChirho(rootChirho, 'static', assetChirho)
			]) {
				const bytesChirho = await readFileChirho(pathChirho);
				if (
					bytesChirho.length !== receiptChirho.bytes_chirho ||
					sha256Chirho(bytesChirho) !== shaChirho
				)
					return false;
			}
			for (const occurrenceChirho of wordChirho.occurrences_chirho) {
				if (!isBibleChapterPathChirho(occurrenceChirho.content_path_chirho, '/content-chirho/'))
					return false;
				const audioPathChirho = occurrenceChirho.content_path_chirho.replace(
					'/content-chirho/',
					'/audio-chirho/'
				);
				let chapterChirho = chaptersChirho.get(audioPathChirho);
				if (!chapterChirho) {
					const entryChirho = entriesChirho.get(audioPathChirho);
					if (!entryChirho) return false;
					const bytesChirho = await readFileChirho(
						joinChirho(rootChirho, 'static', audioPathChirho)
					);
					if (
						bytesChirho.length > 2_000_000 ||
						sha256Chirho(bytesChirho) !== entryChirho.sha256_chirho
					)
						return false;
					chapterChirho = JSON.parse(bytesChirho.toString('utf8')) as ChapterChirho;
					if (
						!Array.isArray(chapterChirho.clips_chirho) ||
						chapterChirho.clips_chirho.length > 2000
					)
						return false;
					chaptersChirho.set(audioPathChirho, chapterChirho);
				}
				const clipChirho = chapterChirho.clips_chirho.find(
					(rowChirho) =>
						rowChirho.lesson_id_chirho === occurrenceChirho.lesson_id_chirho &&
						rowChirho.token_id_chirho === occurrenceChirho.token_id_chirho &&
						rowChirho.recipe_id_chirho === wordChirho.job_chirho.recipe_id_chirho
				);
				if (
					chapterChirho.content_path_chirho !== occurrenceChirho.content_path_chirho ||
					chapterChirho.content_sha256_chirho !== occurrenceChirho.content_sha256_chirho ||
					!clipChirho ||
					clipChirho.sha256_chirho !== shaChirho ||
					clipChirho.asset_path_chirho !== assetChirho ||
					clipChirho.bytes_chirho !== receiptChirho.bytes_chirho ||
					clipChirho.text_chirho !== occurrenceChirho.text_chirho ||
					clipChirho.canonical_sha256_chirho !== occurrenceChirho.canonical_sha256_chirho ||
					clipChirho.synthesis_text_chirho !== wordChirho.job_chirho.synthesis_text_chirho ||
					clipChirho.ipa_chirho !== wordChirho.job_chirho.ipa_chirho ||
					typeof clipChirho.duration_chirho !== 'number' ||
					!Number.isFinite(clipChirho.duration_chirho) ||
					clipChirho.duration_chirho <= 0 ||
					clipChirho.duration_chirho > 30 ||
					typeof clipChirho.start_offset_chirho !== 'number' ||
					typeof clipChirho.end_offset_chirho !== 'number' ||
					!validRecordingWindowChirho(clipChirho)
				)
					return false;
			}
		}
		return true;
	} catch (errorChirho) {
		if ((errorChirho as NodeJS.ErrnoException).code === 'ENOENT') return false;
		throw errorChirho;
	} finally {
		await releaseChirho();
	}
}
