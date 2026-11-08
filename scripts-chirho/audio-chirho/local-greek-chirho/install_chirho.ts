// For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life. — John 3:16 (KJV)
// Workflow: verse-media-chirho.md. Archive originals and delivery before publishing any new reference.
import {
	readFile as readFileChirho,
	mkdir as mkdirChirho,
	realpath as realpathChirho
} from 'node:fs/promises';
import { join as joinChirho, resolve as resolveChirho, dirname as dirnameChirho } from 'node:path';
import {
	openSync as openSyncChirho,
	writeSync as writeSyncChirho,
	fsyncSync as fsyncSyncChirho,
	closeSync as closeSyncChirho
} from 'node:fs';
import { sha256Chirho, writeChirho } from '../audition_chirho';
import { uploadAudioChirho, type AudioUploadChirho } from '../r2_recordings_chirho';
import {
	acquireLockChirho,
	runPoolChirho,
	type TargetChirho
} from '../../publish-chirho/r2_upload_watch_chirho';
import {
	recoverCatalogueChirho,
	commitCatalogueChirho,
	type CatalogueWriteChirho
} from './catalogue_commit_chirho';
import { objectRequestChirho } from '../../publish-chirho/r2-chirho/object-store-chirho';
import { hasMp3HeaderChirho } from '../../publish-chirho/audio_rules_chirho';
import { RUN_HOME_CHIRHO, type DeliveryChirho } from './manifest_chirho';
import { boundedReadChirho, legacyInputChirho, type ImportInputChirho } from './phase_chirho';
import type { chapterRecipeChirho } from '../../../src/lib/domain-chirho/pronunciation-chirho/chapter-recipe-chirho';

interface AudioChapterChirho {
	schema_version_chirho: number;
	book_id_chirho: string;
	chapter_chirho: number;
	content_path_chirho: string;
	content_sha256_chirho: string;
	clips_chirho: Record<string, unknown>[];
	readings_chirho?: Record<string, unknown>[];
}
interface AudioIndexChirho {
	books_chirho: Record<
		string,
		{ chapters_chirho: { path_chirho: string; sha256_chirho: string }[] }
	>;
}
interface OriginalReceiptChirho {
	key_chirho: string;
	sha256_chirho: string;
	bytes_chirho: number;
	readback_sha256_chirho: string;
}
/** One archive/recovery/catalogue implementation, supplied only with a validated immutable phase. */
export async function installLocalGreekChirho(
	inputChirho: ImportInputChirho,
	applyChirho: boolean,
	rootChirho: string
) {
	const homeChirho = joinChirho(rootChirho, inputChirho.prepared_home_chirho);
	const runHomeChirho = inputChirho.run_home_chirho ?? RUN_HOME_CHIRHO;
	const manifestChirho = inputChirho.manifest_chirho;
	const manifestShaChirho = inputChirho.manifest_sha256_chirho;
	const expectedChirho = inputChirho.expected_jobs_chirho;
	const preparedBytesChirho = await boundedReadChirho(
		rootChirho,
		`${inputChirho.prepared_home_chirho}/prepared-chirho.json`,
		2 * 1024 ** 2
	);
	const preparedChirho = JSON.parse(preparedBytesChirho.toString()) as {
		manifest_sha256_chirho: string;
		recordings_chirho: DeliveryChirho[];
	};
	const jobsChirho = manifestChirho.jobs_chirho.filter(
		(rowChirho) => rowChirho.state_chirho === 'done'
	);
	if (
		preparedChirho.manifest_sha256_chirho !== manifestShaChirho ||
		jobsChirho.length !== expectedChirho ||
		preparedChirho.recordings_chirho.length !== expectedChirho ||
		new Set(jobsChirho.map((rowChirho) => rowChirho.verse_id_chirho)).size !== expectedChirho
	)
		throw Error('Eligible partition differs');
	const preparedByJobChirho = new Map(
		preparedChirho.recordings_chirho.map((rowChirho) => [rowChirho.job_chirho, rowChirho])
	);
	if (preparedByJobChirho.size !== expectedChirho) throw Error('Duplicate delivery job');
	const sourceChirho = new Map<
		string,
		{ hash_chirho: string; verses_chirho: Parameters<typeof chapterRecipeChirho>[0][] }
	>();
	const rowsChirho = [];
	for (const jobChirho of jobsChirho) {
		const contentPathChirho = `static/content-chirho/${jobChirho.content_path_chirho}`;
		let chapterChirho = sourceChirho.get(contentPathChirho);
		if (!chapterChirho) {
			const bytesChirho = await boundedReadChirho(rootChirho, contentPathChirho, 4 * 1024 ** 2);
			chapterChirho = {
				hash_chirho: sha256Chirho(bytesChirho),
				verses_chirho: JSON.parse(bytesChirho.toString()).verses_chirho
			};
			sourceChirho.set(contentPathChirho, chapterChirho);
		}
		const lessonChirho = chapterChirho.verses_chirho.find(
			(rowChirho) => rowChirho.id_chirho === jobChirho.verse_id_chirho
		);
		const deliveryChirho = preparedByJobChirho.get(jobChirho.job_chirho);
		if (!lessonChirho || !deliveryChirho) throw Error('Missing source or derivative');
		const clipChirho = inputChirho.clip_chirho(
			jobChirho,
			deliveryChirho,
			lessonChirho,
			chapterChirho.hash_chirho
		);
		const bytesChirho = await boundedReadChirho(rootChirho, deliveryChirho.path_chirho, 4_000_000);
		if (
			sha256Chirho(bytesChirho) !== clipChirho.sha256_chirho ||
			bytesChirho.length !== clipChirho.bytes_chirho ||
			!hasMp3HeaderChirho(bytesChirho)
		)
			throw Error('Delivery MP3 bytes differ');
		rowsChirho.push({ job_chirho: jobChirho, clip_chirho: clipChirho, bytes_chirho: bytesChirho });
	}
	// The shared transaction admits 30 chapters and its manifest. Refuse before archive work.
	if (sourceChirho.size > 30)
		throw Error('Local Greek catalogue phase exceeds 30 chapters; partition the input');
	console.log(
		JSON.stringify({
			eligible_chirho: rowsChirho.length,
			chapters_chirho: sourceChirho.size,
			flagged_excluded_chirho: inputChirho.flagged_excluded_chirho,
			delivery_bytes_chirho: rowsChirho.reduce(
				(totalChirho, rowChirho) => totalChirho + rowChirho.bytes_chirho.length,
				0
			),
			apply_chirho: applyChirho
		})
	);
	if (!applyChirho) return;
	const accountChirho = process.env.CLOUDFLARE_GLOBAL_API_MAIN_ACCOUNT_ID_CHIRHO ?? '';
	const targetChirho: TargetChirho = {
		account_chirho: accountChirho,
		bucket_chirho: 'hinneh-media-chirho',
		email_chirho: process.env.CLOUDFLARE_GLOBAL_API_EMAIL_CHIRHO ?? '',
		api_key_chirho: process.env.CLOUDFLARE_GLOBAL_API_KEY_CHIRHO ?? ''
	};
	if (
		!/^[a-f0-9]{32}$/.test(accountChirho) ||
		!accountChirho.endsWith('84bd') ||
		!targetChirho.email_chirho ||
		!targetChirho.api_key_chirho
	)
		throw Error('Hinneh archive target unavailable');
	await mkdirChirho(joinChirho(rootChirho, 'build-chirho/r2-chirho'), { recursive: true });
	const releaseChirho = await acquireLockChirho(
		joinChirho(rootChirho, 'build-chirho/r2-chirho/audio-catalogue-chirho.lock')
	);
	try {
		// Recheck every canonical chapter after waiting; no stale source enters a catalogue.
		for (const [pathChirho, chapterChirho] of sourceChirho)
			if (
				sha256Chirho(await boundedReadChirho(rootChirho, pathChirho, 4 * 1024 ** 2)) !==
				chapterChirho.hash_chirho
			)
				throw Error('Canonical source changed under lock');
		const receiptPathChirho = joinChirho(homeChirho, 'original-receipts-chirho.jsonl');
		const receiptsChirho = new Map<string, OriginalReceiptChirho>();
		const previousChirho = await readFileChirho(receiptPathChirho, 'utf8').catch(
			(errorChirho: NodeJS.ErrnoException) => {
				if (errorChirho.code === 'ENOENT') return '';
				throw errorChirho;
			}
		);
		for (const lineChirho of previousChirho.split('\n').filter(Boolean)) {
			try {
				const valueChirho = JSON.parse(lineChirho) as OriginalReceiptChirho;
				if (valueChirho.readback_sha256_chirho === valueChirho.sha256_chirho)
					receiptsChirho.set(valueChirho.key_chirho, valueChirho);
			} catch {
				/* Torn receipt gets an exact idempotent readback again. */
			}
		}
		async function originalChirho(
			pathChirho: string,
			expectedChirho: string,
			extensionChirho: 'mp3' | 'flac' | 'json' | 'jsonl',
			frozenBytesChirho?: Buffer
		) {
			const bytesChirho =
				frozenBytesChirho ?? (await boundedReadChirho(rootChirho, pathChirho, 16 * 1024 ** 2));
			if (bytesChirho.length > 16 * 1024 ** 2 || sha256Chirho(bytesChirho) !== expectedChirho)
				throw Error('Original archive input differs');
			const keyChirho = `provenance-audio-chirho/sha256-chirho/${expectedChirho}.${extensionChirho}`;
			if (receiptsChirho.get(keyChirho)?.bytes_chirho === bytesChirho.length) return;
			let responseChirho = await objectRequestChirho('GET', keyChirho);
			if (responseChirho.status === 404) {
				await responseChirho.arrayBuffer();
				const putChirho = await objectRequestChirho('PUT', keyChirho, bytesChirho);
				await putChirho.arrayBuffer();
				if (!putChirho.ok) throw Error('Original archive PUT refused');
				responseChirho = await objectRequestChirho('GET', keyChirho);
			}
			const returnedChirho = new Uint8Array(await responseChirho.arrayBuffer());
			if (
				!responseChirho.ok ||
				returnedChirho.length !== bytesChirho.length ||
				sha256Chirho(returnedChirho) !== expectedChirho
			)
				throw Error('Original archive readback differs');
			const receiptChirho = {
				key_chirho: keyChirho,
				sha256_chirho: expectedChirho,
				bytes_chirho: bytesChirho.length,
				readback_sha256_chirho: expectedChirho,
				at_chirho: new Date().toISOString()
			};
			const fdChirho = openSyncChirho(receiptPathChirho, 'a');
			try {
				writeSyncChirho(fdChirho, JSON.stringify(receiptChirho) + '\n');
				fsyncSyncChirho(fdChirho);
			} finally {
				closeSyncChirho(fdChirho);
			}
			receiptsChirho.set(keyChirho, receiptChirho);
		}
		for (const evidenceChirho of inputChirho.archive_inputs_chirho)
			await originalChirho(
				evidenceChirho.path_chirho,
				evidenceChirho.sha256_chirho,
				evidenceChirho.extension_chirho,
				evidenceChirho.bytes_chirho
			);
		await runPoolChirho(rowsChirho, 4, async (rowChirho) => {
			const takeChirho = rowChirho.job_chirho.chosen_chirho!;
			await originalChirho(
				`${runHomeChirho}/${takeChirho.path_chirho}`,
				takeChirho.sha256_chirho,
				'mp3'
			);
			await originalChirho(
				`${runHomeChirho}/${takeChirho.raw_path_chirho}`,
				takeChirho.raw_sha256_chirho,
				'flac'
			);
		});
		const uploadsChirho: AudioUploadChirho[] = [];
		for (const rowChirho of rowsChirho) {
			await mkdirChirho(
				dirnameChirho(joinChirho(rootChirho, 'static', rowChirho.clip_chirho.asset_path_chirho)),
				{ recursive: true }
			);
			await writeChirho(
				joinChirho(rootChirho, 'static', rowChirho.clip_chirho.asset_path_chirho),
				rowChirho.bytes_chirho
			);
			uploadsChirho.push({
				key_chirho: `audio-chirho/sha256-chirho/${rowChirho.clip_chirho.sha256_chirho}.mp3`,
				asset_path_chirho: rowChirho.clip_chirho.asset_path_chirho,
				sha256_chirho: rowChirho.clip_chirho.sha256_chirho,
				bytes_chirho: rowChirho.clip_chirho.bytes_chirho
			});
		}
		const releaseUploadChirho = await acquireLockChirho(
			joinChirho(rootChirho, 'build-chirho/r2-chirho/audio-upload-chirho.lock')
		);
		try {
			// Use the existing private bucket's S3 transport rather than consuming the account API quota.
			// The established uploader still verifies bytes and fsyncs the standard delivery receipts.
			const s3FetchChirho: typeof fetch = async (inputChirho, initChirho) => {
				const urlChirho = String(inputChirho);
				const prefixChirho = `https://api.cloudflare.com/client/v4/accounts/${accountChirho}/r2/buckets/hinneh-media-chirho/objects/`;
				if (!urlChirho.startsWith(prefixChirho)) throw Error('Foreign upload transport target');
				const keyChirho = urlChirho.slice(prefixChirho.length);
				if (!/^audio-chirho\/sha256-chirho\/[a-f0-9]{64}\.mp3$/.test(keyChirho))
					throw Error('Foreign upload transport key');
				if (initChirho?.method === 'GET') return objectRequestChirho('GET', keyChirho);
				if (initChirho?.method !== 'PUT' || !(initChirho.body instanceof Uint8Array))
					throw Error('Foreign upload transport method/body');
				return objectRequestChirho('PUT', keyChirho, initChirho.body);
			};
			await uploadAudioChirho(rootChirho, uploadsChirho, targetChirho, s3FetchChirho);
		} finally {
			await releaseUploadChirho();
		}
		for (const [pathChirho, chapterChirho] of sourceChirho)
			if (
				sha256Chirho(await boundedReadChirho(rootChirho, pathChirho, 4 * 1024 ** 2)) !==
				chapterChirho.hash_chirho
			)
				throw Error('Canonical source changed during archive');
		const bindingChirho = sha256Chirho(manifestShaChirho + sha256Chirho(preparedBytesChirho));
		const recoveredChirho = await recoverCatalogueChirho(rootChirho, homeChirho, bindingChirho);
		if (recoveredChirho)
			console.log('Reconciled partial catalogue commit from its exact archived input');
		const indexPathChirho = joinChirho(rootChirho, 'static/audio-chirho/manifest-chirho.json');
		const indexBytesChirho = await readFileChirho(indexPathChirho);
		const indexChirho = JSON.parse(indexBytesChirho.toString()) as AudioIndexChirho;
		const outputsChirho = new Map<
			string,
			{
				chapter_chirho: AudioChapterChirho;
				entry_chirho: { path_chirho: string; sha256_chirho: string };
			}
		>();
		for (const rowChirho of rowsChirho) {
			const [bookChirho, numberChirho] = rowChirho.job_chirho.verse_id_chirho.split('.');
			const pathChirho = `/audio-chirho/${rowChirho.job_chirho.content_path_chirho}`;
			let outputChirho = outputsChirho.get(pathChirho);
			if (!outputChirho) {
				const bytesChirho = await boundedReadChirho(rootChirho, `static${pathChirho}`, 2_000_000);
				const chapterChirho = JSON.parse(bytesChirho.toString()) as AudioChapterChirho;
				const entryChirho = indexChirho.books_chirho[bookChirho]?.chapters_chirho.find(
					(valueChirho) => valueChirho.path_chirho === pathChirho
				);
				if (
					!entryChirho ||
					sha256Chirho(bytesChirho) !== entryChirho.sha256_chirho ||
					chapterChirho.book_id_chirho !== bookChirho ||
					chapterChirho.chapter_chirho !== Number(numberChirho) ||
					chapterChirho.content_sha256_chirho !== rowChirho.job_chirho.content_sha256_chirho
				)
					throw Error('Existing audio chapter identity differs');
				outputChirho = { chapter_chirho: chapterChirho, entry_chirho: entryChirho };
				outputsChirho.set(pathChirho, outputChirho);
			}
			const priorChirho = outputChirho.chapter_chirho.clips_chirho.find(
				(clipChirho) => clipChirho.id_chirho === rowChirho.clip_chirho.id_chirho
			);
			if (priorChirho && JSON.stringify(priorChirho) !== JSON.stringify(rowChirho.clip_chirho))
				throw Error('Existing local recording differs');
			if (
				!priorChirho &&
				[
					...outputChirho.chapter_chirho.clips_chirho,
					...(outputChirho.chapter_chirho.readings_chirho ?? [])
				].some(
					(clipChirho) =>
						clipChirho.token_id_chirho === null &&
						clipChirho.lesson_id_chirho === rowChirho.job_chirho.verse_id_chirho
				)
			)
				throw Error('A verse reading appeared since the producer plan; reconcile before adding');
			if (!priorChirho) outputChirho.chapter_chirho.clips_chirho.push(rowChirho.clip_chirho);
		}
		const writesChirho: CatalogueWriteChirho[] = [];
		for (const [pathChirho, outputChirho] of outputsChirho) {
			const textChirho = JSON.stringify(outputChirho.chapter_chirho, null, 2) + '\n';
			if (
				Buffer.byteLength(textChirho) > 2_000_000 ||
				outputChirho.chapter_chirho.clips_chirho.length +
					(outputChirho.chapter_chirho.readings_chirho?.length ?? 0) >
					2000
			)
				throw Error('Audio chapter bound exceeded');
			writesChirho.push({
				path_chirho: `static${pathChirho}`,
				before_sha256_chirho: sha256Chirho(
					await readFileChirho(joinChirho(rootChirho, 'static', pathChirho))
				),
				text_chirho: textChirho
			});
			outputChirho.entry_chirho.sha256_chirho = sha256Chirho(textChirho);
		}
		writesChirho.push({
			path_chirho: 'static/audio-chirho/manifest-chirho.json',
			before_sha256_chirho: sha256Chirho(indexBytesChirho),
			text_chirho: JSON.stringify(indexChirho, null, 2) + '\n'
		});
		await commitCatalogueChirho(rootChirho, homeChirho, bindingChirho, writesChirho);
		await writeChirho(
			joinChirho(homeChirho, 'installed-chirho.json'),
			JSON.stringify(
				{
					manifest_sha256_chirho: manifestShaChirho,
					prepared_sha256_chirho: sha256Chirho(preparedBytesChirho),
					installed_chirho: rowsChirho.length,
					chapters_chirho: outputsChirho.size,
					originals_verified_chirho: receiptsChirho.size,
					flagged_excluded_chirho: inputChirho.flagged_excluded_chirho
				},
				null,
				2
			) + '\n'
		);
		console.log('Installed source-bound local Greek recordings after exact archive readbacks');
	} finally {
		await releaseChirho();
	}
}
if (import.meta.main) {
	const argumentsChirho = process.argv.slice(2);
	if (
		argumentsChirho.some((valueChirho) => valueChirho !== '--apply-chirho') ||
		argumentsChirho.length > 1
	)
		throw Error('Expected only optional --apply-chirho');
	const rootChirho = await realpathChirho(resolveChirho('.'));
	await installLocalGreekChirho(
		await legacyInputChirho(rootChirho),
		argumentsChirho.includes('--apply-chirho'),
		rootChirho
	);
}
