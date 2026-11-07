// For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life. — John 3:16 (KJV)
// Workflow: reusable-word-audio-chirho.md. Decode, archive, then publish exact occurrence references.
import { readFile as readFileChirho, mkdir as mkdirChirho } from 'node:fs/promises';
import { join as joinChirho } from 'node:path';
import { inspectWordChirho } from './inspect_word_chirho';
import { cacheKeyChirho, sha256Chirho, writeChirho, type ReceiptChirho } from '../audition_chirho';
import { spokenWordChirho } from '../../../src/lib/domain-chirho/pronunciation-chirho';
import { uploadAudioChirho, type AudioUploadChirho } from '../r2_recordings_chirho';
import { acquireLockChirho, type TargetChirho } from '../../publish-chirho/r2_upload_watch_chirho';
import type { LibraryWordChirho } from './prepare_words_chirho';
import {
	maqqefContextRequiredChirho,
	verifyMaqqefOccurrenceChirho,
	verifyMaqqefWordSourcesChirho
} from './maqqef-chirho/context_chirho';

interface PublicChapterChirho {
	schema_version_chirho: number;
	book_id_chirho: string;
	chapter_chirho: number;
	content_path_chirho: string;
	content_sha256_chirho: string;
	clips_chirho: Record<string, unknown>[];
}
interface AudioIndexChirho {
	schema_version_chirho: number;
	books_chirho: Record<
		string,
		{ chapters_chirho: { number_chirho: number; path_chirho: string; sha256_chirho: string }[] }
	>;
}
async function jsonOrChirho<ValueChirho>(
	pathChirho: string,
	fallbackChirho: ValueChirho
): Promise<ValueChirho> {
	try {
		return JSON.parse(await readFileChirho(pathChirho, 'utf8')) as ValueChirho;
	} catch (errorChirho) {
		if ((errorChirho as NodeJS.ErrnoException).code === 'ENOENT') return fallbackChirho;
		throw errorChirho;
	}
}
async function installUnlockedWordsChirho(
	rootChirho: string,
	folderChirho: string,
	wordsChirho: LibraryWordChirho[],
	receiptsChirho: ReceiptChirho[],
	targetChirho: TargetChirho | null,
	fetchChirho: typeof fetch = fetch
) {
	const changesChirho = new Map<
		string,
		{
			occurrence_chirho: LibraryWordChirho['occurrences_chirho'][number];
			clip_chirho: Record<string, unknown>;
		}[]
	>();
	const uploadsChirho: AudioUploadChirho[] = [];
	for (const wordChirho of wordsChirho) {
		const receiptChirho = receiptsChirho.find(
			(rowChirho) => rowChirho.id_chirho === wordChirho.job_chirho.id_chirho
		);
		if (receiptChirho?.state_chirho !== 'received') continue;
		if (receiptChirho.key_chirho !== cacheKeyChirho(wordChirho.job_chirho))
			throw new Error('Word recording pronunciation identity changed');
		if (!receiptChirho.path_chirho || !/^[a-z0-9-]+\.mp3$/u.test(receiptChirho.path_chirho))
			throw new Error('Word receipt path refused');
		const pathChirho = joinChirho(folderChirho, receiptChirho.path_chirho),
			bytesChirho = await readFileChirho(pathChirho);
		if (
			sha256Chirho(bytesChirho) !== receiptChirho.sha256_chirho ||
			bytesChirho.length !== receiptChirho.bytes_chirho
		)
			throw new Error('Word audio changed');
		const timingChirho = inspectWordChirho(pathChirho);
		const assetPathChirho = `/audio-chirho/sha256-chirho/${receiptChirho.sha256_chirho}-chirho.mp3`;
		await mkdirChirho(joinChirho(rootChirho, 'static/audio-chirho/sha256-chirho'), {
			recursive: true
		});
		await writeChirho(joinChirho(rootChirho, 'static', assetPathChirho), bytesChirho);
		uploadsChirho.push({
			asset_path_chirho: assetPathChirho,
			key_chirho: `audio-chirho/sha256-chirho/${receiptChirho.sha256_chirho}.mp3`,
			sha256_chirho: receiptChirho.sha256_chirho!,
			bytes_chirho: bytesChirho.length
		});
		for (const occurrenceChirho of wordChirho.occurrences_chirho) {
			const clipChirho = {
				...wordChirho.job_chirho,
				lesson_id_chirho: occurrenceChirho.lesson_id_chirho,
				token_id_chirho: occurrenceChirho.token_id_chirho,
				text_chirho: occurrenceChirho.text_chirho,
				canonical_sha256_chirho: occurrenceChirho.canonical_sha256_chirho,
				...(maqqefContextRequiredChirho(wordChirho)
					? {
							source_context_chirho: 'maqqef_chirho',
							maqqef_group_chirho: occurrenceChirho.maqqef_group_chirho
						}
					: {}),
				voice_name_chirho: receiptChirho.voice_name_chirho,
				asset_path_chirho: assetPathChirho,
				sha256_chirho: receiptChirho.sha256_chirho,
				bytes_chirho: bytesChirho.length,
				...timingChirho,
				review_chirho: 'audition',
				pronunciation_chirho:
					wordChirho.job_chirho.language_chirho === 'el' ? 'modern_greek' : 'israeli_hebrew',
				provider_chirho: 'ElevenLabs',
				model_chirho: 'eleven_v4',
				license_chirho:
					'Generated during a paid ElevenLabs subscription using licensed public-library voices. Source text public domain. Reusable pronunciation draft, awaiting listener review.'
			};
			const groupChirho = changesChirho.get(occurrenceChirho.content_path_chirho) ?? [];
			groupChirho.push({ occurrence_chirho: occurrenceChirho, clip_chirho: clipChirho });
			changesChirho.set(occurrenceChirho.content_path_chirho, groupChirho);
		}
	}
	// One archive receipt writer; an offline rebuild may reuse verified existing receipts only.
	await mkdirChirho(joinChirho(rootChirho, 'build-chirho/r2-chirho'), { recursive: true });
	const releaseChirho = await acquireLockChirho(
		joinChirho(rootChirho, 'build-chirho/r2-chirho/audio-upload-chirho.lock')
	);
	let uploadedChirho;
	try {
		uploadedChirho = await uploadAudioChirho(rootChirho, uploadsChirho, targetChirho, fetchChirho);
		if (!targetChirho && uploadedChirho.pending_chirho > 0)
			throw new Error('Word recordings need verified Hinneh R2 receipts before publication');
	} finally {
		await releaseChirho();
	}
	const outputsChirho: {
		path_chirho: string;
		bytes_chirho: string;
		book_chirho: string;
		chapter_chirho: number;
	}[] = [];
	for (const [contentPathChirho, entriesChirho] of changesChirho) {
		const bytesChirho = await readFileChirho(joinChirho(rootChirho, 'static', contentPathChirho));
		if (
			entriesChirho.some(
				(entryChirho) =>
					entryChirho.occurrence_chirho.content_sha256_chirho !== sha256Chirho(bytesChirho)
			)
		)
			throw new Error('Word occurrence source chapter changed');
		const contentChirho = JSON.parse(bytesChirho.toString('utf8'));
		const folderNameChirho = contentPathChirho.split('/')[2];
		const audioPathChirho = `/audio-chirho/${folderNameChirho}/chapter-${String(contentChirho.chapter_chirho).padStart(2, '0')}-chirho.json`;
		const chapterChirho = await jsonOrChirho<PublicChapterChirho>(
			joinChirho(rootChirho, 'static', audioPathChirho),
			{
				schema_version_chirho: 1,
				book_id_chirho: contentChirho.book_id_chirho,
				chapter_chirho: contentChirho.chapter_chirho,
				content_path_chirho: contentPathChirho,
				content_sha256_chirho: sha256Chirho(bytesChirho),
				clips_chirho: []
			}
		);
		if (chapterChirho.content_sha256_chirho !== sha256Chirho(bytesChirho))
			throw new Error('Existing recording chapter source changed');
		const clipsChirho = chapterChirho.clips_chirho as Record<string, unknown>[];
		for (const entryChirho of entriesChirho) {
			const sourceChirho = contentChirho.verses_chirho.find(
				(rowChirho: { id_chirho: string }) =>
					rowChirho.id_chirho === entryChirho.occurrence_chirho.lesson_id_chirho
			);
			const tokenChirho = sourceChirho?.tokens_chirho.find(
				(rowChirho: { id_chirho: string }) =>
					rowChirho.id_chirho === entryChirho.occurrence_chirho.token_id_chirho
			);
			if (
				!sourceChirho ||
				sha256Chirho(sourceChirho.canonical_text_chirho) !==
					entryChirho.occurrence_chirho.canonical_sha256_chirho ||
				!tokenChirho ||
				spokenWordChirho(tokenChirho) !== entryChirho.occurrence_chirho.text_chirho
			)
				throw new Error('Word occurrence no longer agrees with the source');
			if (maqqefContextRequiredChirho(entryChirho.clip_chirho))
				verifyMaqqefOccurrenceChirho(
					sourceChirho,
					entryChirho.occurrence_chirho,
					entryChirho.clip_chirho,
					entryChirho.clip_chirho.source_context_chirho
				);
			const previousChirho = clipsChirho.find(
				(rowChirho) =>
					rowChirho.lesson_id_chirho === entryChirho.clip_chirho.lesson_id_chirho &&
					rowChirho.token_id_chirho === entryChirho.clip_chirho.token_id_chirho &&
					rowChirho.recipe_id_chirho === entryChirho.clip_chirho.recipe_id_chirho
			);
			if (previousChirho) {
				if (previousChirho.sha256_chirho !== entryChirho.clip_chirho.sha256_chirho)
					throw new Error('Existing word recording would change');
			} else clipsChirho.push(entryChirho.clip_chirho);
		}
		if (clipsChirho.length > 2000)
			throw new Error('Audio chapter needs finer sharding before growing');
		const encodedChirho = JSON.stringify(chapterChirho, null, 2) + '\n';
		if (Buffer.byteLength(encodedChirho) > 2_000_000)
			throw new Error('Audio chapter exceeds the client limit');
		outputsChirho.push({
			path_chirho: audioPathChirho,
			bytes_chirho: encodedChirho,
			book_chirho: contentChirho.book_id_chirho,
			chapter_chirho: contentChirho.chapter_chirho
		});
	}
	const manifestPathChirho = joinChirho(rootChirho, 'static/audio-chirho/manifest-chirho.json');
	const manifestChirho = await jsonOrChirho<AudioIndexChirho>(manifestPathChirho, {
		schema_version_chirho: 1,
		books_chirho: {}
	});
	for (const outputChirho of outputsChirho) {
		await writeChirho(
			joinChirho(rootChirho, 'static', outputChirho.path_chirho),
			outputChirho.bytes_chirho
		);
		const bookChirho = (manifestChirho.books_chirho[outputChirho.book_chirho] ??= {
			chapters_chirho: []
		});
		const chaptersChirho = bookChirho.chapters_chirho as {
			number_chirho: number;
			path_chirho: string;
			sha256_chirho: string;
		}[];
		const entryChirho = {
			number_chirho: outputChirho.chapter_chirho,
			path_chirho: outputChirho.path_chirho,
			sha256_chirho: sha256Chirho(outputChirho.bytes_chirho)
		};
		const indexChirho = chaptersChirho.findIndex(
			(rowChirho) => rowChirho.number_chirho === entryChirho.number_chirho
		);
		if (indexChirho < 0) chaptersChirho.push(entryChirho);
		else chaptersChirho[indexChirho] = entryChirho;
		chaptersChirho.sort(
			(leftChirho, rightChirho) => leftChirho.number_chirho - rightChirho.number_chirho
		);
	}
	if (outputsChirho.length)
		await writeChirho(manifestPathChirho, JSON.stringify(manifestChirho, null, 2) + '\n');
	return {
		word_files_chirho: uploadsChirho.length,
		chapters_updated_chirho: outputsChirho.length,
		uploaded_chirho: uploadedChirho.uploaded_chirho
	};
}

export async function installWordsChirho(
	rootChirho: string,
	folderChirho: string,
	wordsChirho: LibraryWordChirho[],
	receiptsChirho: ReceiptChirho[],
	targetChirho: TargetChirho | null,
	fetchChirho: typeof fetch = fetch
) {
	// Refuse a changed maqqef proof even before creating installer lock directories.
	const receivedWordsChirho = wordsChirho.filter((wordChirho) =>
		receiptsChirho.some(
			(receiptChirho) =>
				receiptChirho.id_chirho === wordChirho.job_chirho.id_chirho &&
				receiptChirho.state_chirho === 'received'
		)
	);
	await verifyMaqqefWordSourcesChirho(rootChirho, receivedWordsChirho);
	await mkdirChirho(joinChirho(rootChirho, 'build-chirho/r2-chirho'), { recursive: true });
	const releaseChirho = await acquireLockChirho(
		joinChirho(rootChirho, 'build-chirho/r2-chirho/audio-catalogue-chirho.lock')
	);
	try {
		await verifyMaqqefWordSourcesChirho(rootChirho, receivedWordsChirho);
		return await installUnlockedWordsChirho(
			rootChirho,
			folderChirho,
			wordsChirho,
			receiptsChirho,
			targetChirho,
			fetchChirho
		);
	} finally {
		await releaseChirho();
	}
}
