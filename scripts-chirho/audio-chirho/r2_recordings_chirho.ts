// For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life. — John 3:16 (KJV)
// Workflow: media-delivery-chirho.md. Offline plan, explicit upload, verified readback, durable receipt.
import { closeSync, fsyncSync, openSync, writeSync } from 'node:fs';
import { mkdir, readFile, readdir } from 'node:fs/promises';
import { join, resolve } from 'node:path';
import libraryChirho from '../../config-chirho/media-library-chirho.json';
import { verifyAudioChirho } from '../publish-chirho/audio_rules_chirho';
import {
	acquireLockChirho,
	runPoolChirho,
	type TargetChirho
} from '../publish-chirho/r2_upload_watch_chirho';
import {
	RefusalChirho,
	sha256Chirho,
	type FilesChirho
} from '../publish-chirho/release_rules_chirho';

export const AUDIO_RECEIPTS_CHIRHO = 'build-chirho/r2-chirho/audio-receipts-chirho.jsonl';
const KEY_CHIRHO = /^audio-chirho\/sha256-chirho\/([a-f0-9]{64})\.mp3$/;
export interface AudioUploadChirho {
	key_chirho: string;
	sha256_chirho: string;
	bytes_chirho: number;
	asset_path_chirho: string;
}
interface AudioReceiptChirho extends AudioUploadChirho {
	bucket_chirho: string;
	readback_sha256_chirho: string;
	at_chirho: string;
}

export async function audioReceiptsChirho(rootChirho: string) {
	const bytesChirho = await readFile(join(rootChirho, AUDIO_RECEIPTS_CHIRHO)).catch(
		() => new Uint8Array()
	);
	if (bytesChirho.length > 64 * 1024 * 1024)
		throw new RefusalChirho(['audio receipts need cold retirement']);
	const resultChirho = new Map<string, AudioReceiptChirho>();
	for (const lineChirho of new TextDecoder().decode(bytesChirho).split('\n')) {
		if (!lineChirho.trim()) continue;
		try {
			const rowChirho = JSON.parse(lineChirho) as AudioReceiptChirho;
			if (
				rowChirho.bucket_chirho === libraryChirho.bucket_chirho &&
				KEY_CHIRHO.exec(rowChirho.key_chirho)?.[1] === rowChirho.sha256_chirho &&
				rowChirho.readback_sha256_chirho === rowChirho.sha256_chirho &&
				Number.isSafeInteger(rowChirho.bytes_chirho) &&
				rowChirho.bytes_chirho > 0
			)
				resultChirho.set(rowChirho.key_chirho, rowChirho);
		} catch {
			/* A torn receipt is replayed with the same content-addressed bytes. */
		}
	}
	if (resultChirho.size > 100_000)
		throw new RefusalChirho([
			'audio archive needs cold retirement before exceeding the whole-canon bound'
		]);
	return resultChirho;
}

export async function audioPlanChirho(rootChirho: string): Promise<AudioUploadChirho[]> {
	const filesChirho: FilesChirho = new Map();
	const folderChirho = join(rootChirho, 'static/audio-chirho');
	for (const pathChirho of await readdir(folderChirho, { recursive: true, withFileTypes: true })) {
		if (pathChirho.isSymbolicLink()) throw new RefusalChirho(['audio symlink refused']);
		if (!pathChirho.isFile()) continue;
		const relativeChirho = join(pathChirho.parentPath, pathChirho.name).slice(
			join(rootChirho, 'static').length + 1
		);
		if (filesChirho.size >= 16_000)
			throw new RefusalChirho(['audio plan needs a larger verified delivery tier']);
		filesChirho.set(
			relativeChirho,
			new Uint8Array(await readFile(join(rootChirho, 'static', relativeChirho)))
		);
	}
	for (const [pathChirho, bytesChirho] of [...filesChirho]) {
		if (
			!/^audio-chirho\/(?:proverbs-chirho|john-chirho|genesis-chirho)\/chapter-\d{2}-chirho\.json$/.test(
				pathChirho
			)
		)
			continue;
		const documentChirho = JSON.parse(new TextDecoder().decode(bytesChirho));
		const contentChirho = documentChirho.content_path_chirho;
		if (
			typeof contentChirho !== 'string' ||
			!/^\/content-chirho\/(?:proverbs-chirho|john-chirho|genesis-chirho)\/chapter-\d{2}-chirho\.json$/.test(
				contentChirho
			)
		)
			throw new RefusalChirho(['audio source path refused']);
		filesChirho.set(
			contentChirho.slice(1),
			new Uint8Array(await readFile(join(rootChirho, 'static', contentChirho)))
		);
	}
	const reasonsChirho: string[] = [];
	verifyAudioChirho(filesChirho, true, reasonsChirho);
	if (reasonsChirho.length) throw new RefusalChirho(reasonsChirho);
	return [...filesChirho.entries()]
		.filter(([pathChirho]) => pathChirho.endsWith('.mp3'))
		.map(([pathChirho, bytesChirho]) => ({
			key_chirho: `audio-chirho/sha256-chirho/${sha256Chirho(bytesChirho)}.mp3`,
			sha256_chirho: sha256Chirho(bytesChirho),
			bytes_chirho: bytesChirho.length,
			asset_path_chirho: `/${pathChirho}`
		}));
}

async function archiveRequestChirho(
	fetchChirho: typeof fetch,
	urlChirho: string,
	initChirho: RequestInit,
	sleepChirho: (millisecondsChirho: number) => Promise<void>
): Promise<Response> {
	for (let attemptChirho = 0; attemptChirho < 5; attemptChirho++) {
		let waitMsChirho = Math.min(8_000, 500 * 2 ** attemptChirho);
		try {
			const responseChirho = await fetchChirho(urlChirho, {
				...initChirho,
				signal: AbortSignal.timeout(60_000)
			});
			if (responseChirho.status !== 429 && responseChirho.status < 500) return responseChirho;
			const retryAfterChirho = responseChirho.headers.get('retry-after');
			const secondsChirho = retryAfterChirho === null ? NaN : Number(retryAfterChirho);
			const requestedMsChirho = Number.isFinite(secondsChirho)
				? secondsChirho * 1_000
				: Date.parse(retryAfterChirho ?? '') - Date.now();
			// A longer provider cooldown becomes a hold instead of retrying earlier than requested.
			if (requestedMsChirho > 60_000) return responseChirho;
			if (requestedMsChirho > 0) waitMsChirho = requestedMsChirho;
			if (attemptChirho === 4) return responseChirho;
			await responseChirho.arrayBuffer();
		} catch {
			if (attemptChirho === 4)
				throw new RefusalChirho(['audio archive network retries exhausted; saved audio retained']);
		}
		await sleepChirho(waitMsChirho);
	}
	throw new RefusalChirho(['audio archive retry bound reached']);
}

export async function uploadAudioChirho(
	rootChirho: string,
	planChirho: AudioUploadChirho[],
	targetChirho: TargetChirho | null,
	fetchChirho: typeof fetch = fetch,
	sleepChirho: (millisecondsChirho: number) => Promise<void> = (millisecondsChirho) =>
		new Promise((doneChirho) => setTimeout(doneChirho, millisecondsChirho))
): Promise<{ planned_chirho: number; pending_chirho: number; uploaded_chirho: number }> {
	if (
		targetChirho &&
		(targetChirho.bucket_chirho !== libraryChirho.bucket_chirho ||
			!/^[a-f0-9]{32}$/.test(targetChirho.account_chirho))
	)
		throw new RefusalChirho(['audio target is outside the Hinneh library']);
	const receiptsChirho = await audioReceiptsChirho(rootChirho);
	const pendingChirho = planChirho.filter(
		(rowChirho) => receiptsChirho.get(rowChirho.key_chirho)?.bytes_chirho !== rowChirho.bytes_chirho
	);
	let uploadedChirho = 0;
	if (!targetChirho)
		return {
			planned_chirho: planChirho.length,
			pending_chirho: pendingChirho.length,
			uploaded_chirho: 0
		};
	await runPoolChirho(pendingChirho, 4, async (rowChirho) => {
		if (
			KEY_CHIRHO.exec(rowChirho.key_chirho)?.[1] !== rowChirho.sha256_chirho ||
			rowChirho.asset_path_chirho !==
				`/audio-chirho/sha256-chirho/${rowChirho.sha256_chirho}-chirho.mp3`
		)
			throw new RefusalChirho(['audio object identity refused']);
		const bytesChirho = new Uint8Array(
			await readFile(join(rootChirho, 'static', rowChirho.asset_path_chirho))
		);
		if (
			sha256Chirho(bytesChirho) !== rowChirho.sha256_chirho ||
			bytesChirho.length !== rowChirho.bytes_chirho
		)
			throw new RefusalChirho(['audio bytes changed after planning']);
		const urlChirho = `https://api.cloudflare.com/client/v4/accounts/${targetChirho.account_chirho}/r2/buckets/${targetChirho.bucket_chirho}/objects/${rowChirho.key_chirho}`;
		const headersChirho = {
			'X-Auth-Email': targetChirho.email_chirho,
			'X-Auth-Key': targetChirho.api_key_chirho
		};
		const putChirho = await archiveRequestChirho(
			fetchChirho,
			urlChirho,
			{
				method: 'PUT',
				redirect: 'error',
				signal: AbortSignal.timeout(60_000),
				body: bytesChirho,
				headers: {
					...headersChirho,
					'content-type': 'audio/mpeg',
					'cache-control': 'public, max-age=31536000, immutable',
					'cf-r2-data-catalog-check': 'true'
				}
			},
			sleepChirho
		);
		await putChirho.arrayBuffer();
		if (!putChirho.ok)
			throw new RefusalChirho([
				`audio upload refused with HTTP ${putChirho.status}; no receipt recorded`
			]);
		const getChirho = await archiveRequestChirho(
			fetchChirho,
			urlChirho,
			{
				method: 'GET',
				redirect: 'error',
				signal: AbortSignal.timeout(60_000),
				headers: headersChirho
			},
			sleepChirho
		);
		const returnedChirho = new Uint8Array(await getChirho.arrayBuffer());
		if (
			!getChirho.ok ||
			returnedChirho.length !== rowChirho.bytes_chirho ||
			sha256Chirho(returnedChirho) !== rowChirho.sha256_chirho
		)
			throw new RefusalChirho(['audio R2 readback differs; no receipt recorded']);
		await mkdir(join(rootChirho, 'build-chirho/r2-chirho'), { recursive: true });
		const receiptChirho: AudioReceiptChirho = {
			...rowChirho,
			bucket_chirho: targetChirho.bucket_chirho,
			readback_sha256_chirho: sha256Chirho(returnedChirho),
			at_chirho: new Date().toISOString()
		};
		const descriptorChirho = openSync(join(rootChirho, AUDIO_RECEIPTS_CHIRHO), 'a');
		try {
			writeSync(descriptorChirho, JSON.stringify(receiptChirho) + '\n');
			fsyncSync(descriptorChirho);
		} finally {
			closeSync(descriptorChirho);
		}
		uploadedChirho++;
	});
	return {
		planned_chirho: planChirho.length,
		pending_chirho: pendingChirho.length,
		uploaded_chirho: uploadedChirho
	};
}

async function mainChirho() {
	const argumentsChirho = process.argv.slice(2);
	const applyChirho = argumentsChirho.includes('--apply-chirho');
	const confirmationChirho = argumentsChirho.indexOf('--confirm-chirho');
	if (
		argumentsChirho.some(
			(valueChirho, indexChirho) =>
				!['--apply-chirho', '--confirm-chirho'].includes(valueChirho) &&
				argumentsChirho[indexChirho - 1] !== '--confirm-chirho'
		)
	)
		throw new RefusalChirho(['unsupported audio upload argument']);
	const accountChirho = process.env.CLOUDFLARE_GLOBAL_API_MAIN_ACCOUNT_ID_CHIRHO ?? '';
	let targetChirho: TargetChirho | null = null;
	if (applyChirho) {
		if (
			!/^[a-f0-9]{32}$/.test(accountChirho) ||
			!process.env.CLOUDFLARE_GLOBAL_API_EMAIL_CHIRHO ||
			!process.env.CLOUDFLARE_GLOBAL_API_KEY_CHIRHO ||
			confirmationChirho < 0 ||
			argumentsChirho[confirmationChirho + 1] !==
				`${libraryChirho.bucket_chirho}@${accountChirho.slice(-4)}`
		)
			throw new RefusalChirho([
				'audio upload requires the exact Hinneh account-and-bucket confirmation'
			]);
		targetChirho = {
			account_chirho: accountChirho,
			bucket_chirho: libraryChirho.bucket_chirho,
			email_chirho: process.env.CLOUDFLARE_GLOBAL_API_EMAIL_CHIRHO,
			api_key_chirho: process.env.CLOUDFLARE_GLOBAL_API_KEY_CHIRHO
		};
	}
	const rootChirho = resolve('.');
	const planChirho = await audioPlanChirho(rootChirho);
	let releaseChirho: (() => Promise<void>) | undefined;
	try {
		if (applyChirho) {
			await mkdir(join(rootChirho, 'build-chirho/r2-chirho'), { recursive: true });
			releaseChirho = await acquireLockChirho(
				join(rootChirho, 'build-chirho/r2-chirho/audio-upload-chirho.lock')
			);
		}
		console.log(JSON.stringify(await uploadAudioChirho(rootChirho, planChirho, targetChirho)));
	} finally {
		await releaseChirho?.();
	}
}
if (import.meta.main)
	await mainChirho().catch((errorChirho: Error) => {
		console.error(
			errorChirho instanceof RefusalChirho
				? errorChirho.message
				: 'audio upload failed; inspect saved receipts before retrying'
		);
		process.exitCode = 2;
	});
