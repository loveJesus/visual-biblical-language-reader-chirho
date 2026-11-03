// For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life. — John 3:16 (KJV)

// Continuous, durable uploads of verified WebP media into the private Hinneh R2 library.
// Workflow: spec-chirho/research-chirho/26-10-27-publication-readiness-chirho.md (media library).
// It watches only data-chirho/media-chirho manifests (validated worker output), never image
// generation scratch. Keys are content addresses, so each new hash is sent once, and every
// success is appended to an fsync'd receipt log. Without --apply-chirho nothing leaves the Mac.
// Usage:
//   bun scripts-chirho/publish-chirho/r2_upload_watch_chirho.ts [--watch-chirho]
//   bun scripts-chirho/publish-chirho/r2_upload_watch_chirho.ts --apply-chirho
//       --confirm-chirho hinneh-media-chirho@<last 4 of the account id> [--watch-chirho]
//       [--interval-chirho SECONDS] [--concurrency-chirho N] [--limit-chirho N per pass]
// Exit 0: done or stopped. Exit 2: refused (credentials, confirmation, lock, or a remote refusal).

import { closeSync, fsyncSync, openSync, writeSync } from 'node:fs';
import { mkdir, readdir, readFile, rm, stat, writeFile } from 'node:fs/promises';
import { join, resolve } from 'node:path';
import libraryChirho from '../../config-chirho/media-library-chirho.json';
import {
	API_ROOT_CHIRHO,
	cloudflareGetChirho,
	type FetchChirho
} from './cloudflare_preflight_chirho';
import {
	KEY_PATTERN_CHIRHO,
	KEY_PREFIX_CHIRHO,
	planUploadsChirho,
	type UploadChirho
} from './r2_media_sync_chirho';
import { readMediaRecordsChirho } from './build_release_chirho';
import {
	RefusalChirho,
	deliveryEntriesChirho,
	deliveryProblemChirho,
	sha256Chirho
} from './release_rules_chirho';

export const RECEIPT_FOLDER_CHIRHO = join('build-chirho', 'r2-chirho');
export const DELIVERY_FOLDER_CHIRHO = join('build-chirho', 'delivery-media-chirho');
const BOOTSTRAP_FOLDER_CHIRHO = join('build-chirho', 'r2-bootstrap-chirho');
const ACCOUNT_PATTERN_CHIRHO = /^[0-9a-f]{32}$/;
export const MAX_ATTEMPTS_CHIRHO = 5;
const BACKOFF_BASE_MS_CHIRHO = 500;
const BACKOFF_CAP_MS_CHIRHO = 30_000;
export const CACHE_CONTROL_CHIRHO = 'public, max-age=31536000, immutable';

export interface ReceiptChirho {
	key_chirho: string;
	sha256_chirho: string;
	bytes_chirho: number;
	bucket_chirho: string;
	at_chirho: string;
	source_chirho: 'upload' | 'bootstrap';
}
export interface TargetChirho {
	account_chirho: string;
	bucket_chirho: string;
	email_chirho: string;
	api_key_chirho: string;
}
export interface DepsChirho {
	fetch_chirho: FetchChirho;
	sleep_chirho: (millisecondsChirho: number) => Promise<void>;
	log_chirho: (lineChirho: string) => void;
	now_chirho: () => Date;
}
export interface SyncResultChirho {
	planned_chirho: number;
	derivatives_chirho: number;
	received_chirho: number;
	pending_chirho: number;
	uploaded_chirho: number;
}

/** A remote answer that retrying cannot fix (auth, missing bucket, bad request). */
export class RemoteRefusalChirho extends RefusalChirho {}

function shaOfKeyChirho(keyChirho: string): string {
	return keyChirho.slice(KEY_PREFIX_CHIRHO.length, -'.webp'.length);
}

export function receiptPathChirho(rootChirho: string, bucketChirho: string): string {
	return join(rootChirho, RECEIPT_FOLDER_CHIRHO, `${bucketChirho}-receipts-chirho.jsonl`);
}

function validReceiptChirho(receiptChirho: ReceiptChirho, bucketChirho: string): boolean {
	return (
		receiptChirho?.bucket_chirho === bucketChirho &&
		KEY_PATTERN_CHIRHO.test(String(receiptChirho.key_chirho)) &&
		receiptChirho.sha256_chirho === shaOfKeyChirho(receiptChirho.key_chirho) &&
		Number.isInteger(receiptChirho.bytes_chirho) &&
		receiptChirho.bytes_chirho > 0
	);
}

/**
 * Receipts from the append-only log plus root's bootstrap receipts: single-object `.json` files
 * count only with a readback sha256 equal to the key, and `.jsonl` batch lines by key and size.
 * syncOnceChirho then trusts a receipt only when its size matches the current verified plan.
 * Unreadable lines (such as a tail torn by a crash) are skipped; those objects are re-sent
 * with the same bytes and key, which is harmless.
 */
export async function loadReceiptsChirho(
	rootChirho: string,
	bucketChirho: string,
	logChirho: (lineChirho: string) => void
): Promise<Map<string, ReceiptChirho>> {
	const receiptsChirho = new Map<string, ReceiptChirho>();
	let skippedChirho = 0;
	const textChirho = await readFile(receiptPathChirho(rootChirho, bucketChirho), 'utf8').catch(
		() => ''
	);
	for (const lineChirho of textChirho.split('\n')) {
		if (!lineChirho.trim()) continue;
		try {
			const receiptChirho = JSON.parse(lineChirho) as ReceiptChirho;
			if (validReceiptChirho(receiptChirho, bucketChirho))
				receiptsChirho.set(receiptChirho.key_chirho, receiptChirho);
			else skippedChirho++;
		} catch {
			skippedChirho++;
		}
	}
	const bootstrapChirho = join(rootChirho, BOOTSTRAP_FOLDER_CHIRHO);
	const adoptChirho = (receiptChirho: ReceiptChirho) => {
		if (!validReceiptChirho(receiptChirho, bucketChirho)) skippedChirho++;
		else if (!receiptsChirho.has(receiptChirho.key_chirho))
			receiptsChirho.set(receiptChirho.key_chirho, receiptChirho);
	};
	for (const nameChirho of (await readdir(bootstrapChirho).catch(() => [] as string[])).sort()) {
		if (nameChirho.endsWith('.jsonl')) {
			const batchChirho = await readFile(join(bootstrapChirho, nameChirho), 'utf8');
			for (const lineChirho of batchChirho.split('\n')) {
				if (!lineChirho.trim()) continue;
				try {
					const recordChirho = JSON.parse(lineChirho);
					adoptChirho({
						key_chirho: recordChirho.key_chirho,
						sha256_chirho: shaOfKeyChirho(String(recordChirho.key_chirho)),
						bytes_chirho: recordChirho.bytes_chirho,
						bucket_chirho: recordChirho.bucket_chirho,
						at_chirho: recordChirho.uploaded_at_chirho,
						source_chirho: 'bootstrap'
					});
				} catch {
					skippedChirho++;
				}
			}
			continue;
		}
		if (!nameChirho.endsWith('.json')) continue;
		try {
			const recordChirho = JSON.parse(await readFile(join(bootstrapChirho, nameChirho), 'utf8'));
			adoptChirho({
				key_chirho: recordChirho.key_chirho,
				sha256_chirho: recordChirho.readback_sha256_chirho,
				bytes_chirho: recordChirho.bytes_chirho,
				bucket_chirho: recordChirho.bucket_chirho,
				at_chirho: recordChirho.verified_at_chirho,
				source_chirho: 'bootstrap'
			});
		} catch {
			skippedChirho++;
		}
	}
	if (skippedChirho)
		logChirho(
			`${skippedChirho} unreadable receipt record(s) skipped; those objects will be re-sent`
		);
	return receiptsChirho;
}

/** Appends one receipt line and fsyncs it before the upload counts as done. */
export function appendReceiptChirho(pathChirho: string, receiptChirho: ReceiptChirho): void {
	const descriptorChirho = openSync(pathChirho, 'a');
	try {
		writeSync(descriptorChirho, `${JSON.stringify(receiptChirho)}\n`);
		fsyncSync(descriptorChirho);
	} finally {
		closeSync(descriptorChirho);
	}
}

function aliveChirho(pidChirho: number): boolean {
	try {
		process.kill(pidChirho, 0);
		return true;
	} catch (errorChirho) {
		return (errorChirho as NodeJS.ErrnoException).code === 'EPERM';
	}
}

/** One uploader at a time; a lock left by a dead process is recovered. Returns the release. */
export async function acquireLockChirho(pathChirho: string): Promise<() => Promise<void>> {
	const tokenChirho = `${process.pid} ${Date.now()}`;
	for (let attemptChirho = 0; attemptChirho < 2; attemptChirho++) {
		try {
			await writeFile(pathChirho, tokenChirho, { flag: 'wx' });
			return async () => {
				if ((await readFile(pathChirho, 'utf8').catch(() => '')) === tokenChirho)
					await rm(pathChirho, { force: true });
			};
		} catch (errorChirho) {
			if ((errorChirho as NodeJS.ErrnoException).code !== 'EEXIST') throw errorChirho;
			const ownerChirho = Number(
				(await readFile(pathChirho, 'utf8').catch(() => '')).split(' ')[0]
			);
			if (Number.isInteger(ownerChirho) && ownerChirho > 0 && aliveChirho(ownerChirho))
				throw new RefusalChirho([`another uploader (pid ${ownerChirho}) holds the lock`]);
			await rm(pathChirho, { force: true });
		}
	}
	throw new RefusalChirho(['could not take the upload lock']);
}

/** The single write this tool makes: PUT one content-addressed object into the configured bucket. */
export async function putObjectChirho(
	targetChirho: TargetChirho,
	keyChirho: string,
	bytesChirho: Uint8Array<ArrayBuffer>,
	fetchChirho: FetchChirho
): Promise<{ status_chirho: number; retry_after_ms_chirho: number | null }> {
	if (
		!KEY_PATTERN_CHIRHO.test(keyChirho) ||
		targetChirho.bucket_chirho !== libraryChirho.bucket_chirho ||
		!ACCOUNT_PATTERN_CHIRHO.test(targetChirho.account_chirho)
	)
		throw new RemoteRefusalChirho([
			`refusing to write ${JSON.stringify(keyChirho)} outside the library`
		]);
	const responseChirho = await fetchChirho(
		new URL(
			`${API_ROOT_CHIRHO}/accounts/${targetChirho.account_chirho}/r2/buckets/${targetChirho.bucket_chirho}/objects/${keyChirho}`
		),
		{
			method: 'PUT',
			redirect: 'error',
			body: bytesChirho,
			signal: AbortSignal.timeout(120_000),
			headers: {
				'X-Auth-Email': targetChirho.email_chirho,
				'X-Auth-Key': targetChirho.api_key_chirho,
				'content-type': 'image/webp',
				'cache-control': CACHE_CONTROL_CHIRHO,
				'cf-r2-data-catalog-check': 'true'
			}
		}
	);
	await responseChirho.arrayBuffer().catch(() => undefined);
	const retryChirho = Number(responseChirho.headers.get('retry-after'));
	return {
		status_chirho: responseChirho.status,
		retry_after_ms_chirho:
			Number.isFinite(retryChirho) && retryChirho > 0 ? retryChirho * 1000 : null
	};
}

/** Retries network errors, 429 and 5xx with backoff (Retry-After first); other answers stop. */
export async function uploadWithRetryChirho(
	targetChirho: TargetChirho,
	keyChirho: string,
	bytesChirho: Uint8Array<ArrayBuffer>,
	depsChirho: DepsChirho
): Promise<void> {
	for (let attemptChirho = 1; ; attemptChirho++) {
		let statusChirho = 0;
		let retryAfterChirho: number | null = null;
		try {
			({ status_chirho: statusChirho, retry_after_ms_chirho: retryAfterChirho } =
				await putObjectChirho(targetChirho, keyChirho, bytesChirho, depsChirho.fetch_chirho));
		} catch (errorChirho) {
			if (errorChirho instanceof RefusalChirho) throw errorChirho;
		}
		if (statusChirho >= 200 && statusChirho < 300) return;
		const shownChirho = statusChirho ? `HTTP ${statusChirho}` : 'a network error';
		if (statusChirho && statusChirho !== 429 && statusChirho < 500)
			throw new RemoteRefusalChirho([
				`R2 refused ${keyChirho} with ${shownChirho}; check the bucket, account and credential`
			]);
		if (attemptChirho >= MAX_ATTEMPTS_CHIRHO)
			throw new Error(`${keyChirho} failed ${attemptChirho} times (last: ${shownChirho})`);
		const delayChirho = Math.min(
			BACKOFF_CAP_MS_CHIRHO,
			retryAfterChirho ??
				BACKOFF_BASE_MS_CHIRHO * 2 ** (attemptChirho - 1) * (1 + Math.random() / 4)
		);
		depsChirho.log_chirho(
			`retrying ${keyChirho} in ${Math.round(delayChirho)} ms after ${shownChirho}`
		);
		await depsChirho.sleep_chirho(delayChirho);
	}
}

/** Runs at most `limitChirho` workers; after the first failure no new item starts. */
export async function runPoolChirho<ItemChirho>(
	itemsChirho: ItemChirho[],
	limitChirho: number,
	workerChirho: (itemChirho: ItemChirho) => Promise<void>
): Promise<void> {
	let nextChirho = 0;
	const failureChirho: { error_chirho?: unknown } = {};
	await Promise.all(
		Array.from({ length: Math.min(limitChirho, itemsChirho.length) }, async () => {
			while (!('error_chirho' in failureChirho) && nextChirho < itemsChirho.length) {
				const itemChirho = itemsChirho[nextChirho++];
				try {
					await workerChirho(itemChirho);
				} catch (errorChirho) {
					if (!('error_chirho' in failureChirho)) failureChirho.error_chirho = errorChirho;
				}
			}
		})
	);
	if ('error_chirho' in failureChirho) throw failureChirho.error_chirho;
}

/**
 * Verified delivery derivatives whose (kind, source sha256) is a current authoring record. Stale
 * mapping entries are ignored; derivatives that fail verification are skipped and logged, never
 * uploaded. Originals and derivatives share the content-address key scheme.
 */
export async function planDeliveryUploadsChirho(
	rootChirho: string,
	logChirho: (lineChirho: string) => void
): Promise<UploadChirho[]> {
	const folderChirho = join(rootChirho, DELIVERY_FOLDER_CHIRHO);
	const textChirho = await readFile(join(folderChirho, 'mapping-chirho.json'), 'utf8').catch(
		() => null
	);
	if (textChirho === null) return [];
	const reasonsChirho: string[] = [];
	let mappingChirho: unknown = null;
	try {
		mappingChirho = JSON.parse(textChirho);
	} catch {
		reasonsChirho.push('mapping-chirho.json is not valid JSON');
	}
	const entriesChirho = deliveryEntriesChirho(mappingChirho, reasonsChirho);
	const authoringChirho = new Map(
		(await readMediaRecordsChirho(rootChirho, [])).map((recordChirho) => [
			`${recordChirho.kind_chirho}:${recordChirho.sha256_chirho}`,
			recordChirho
		])
	);
	const uploadsChirho = new Map<string, UploadChirho>();
	for (const [sourceKeyChirho, entryChirho] of entriesChirho) {
		const recordChirho = authoringChirho.get(sourceKeyChirho);
		if (!recordChirho) continue;
		const fileChirho = join(folderChirho, entryChirho.delivery_path_chirho);
		const bytesChirho = await readFile(fileChirho).catch(() => null);
		const problemChirho = bytesChirho
			? deliveryProblemChirho(entryChirho, new Uint8Array(bytesChirho))
			: `${entryChirho.delivery_path_chirho} is missing`;
		if (problemChirho) {
			reasonsChirho.push(problemChirho);
			continue;
		}
		const keyChirho = `${KEY_PREFIX_CHIRHO}${entryChirho.delivery_sha256_chirho}.webp`;
		const uploadChirho = uploadsChirho.get(keyChirho) ?? {
			key_chirho: keyChirho,
			file_chirho: fileChirho,
			bytes_chirho: entryChirho.bytes_chirho,
			asset_paths_chirho: [],
			review_chirho: []
		};
		uploadChirho.asset_paths_chirho.push(...entryChirho.source_paths_chirho);
		uploadChirho.review_chirho.push(recordChirho.art_review_chirho);
		uploadsChirho.set(keyChirho, uploadChirho);
	}
	if (reasonsChirho.length)
		logChirho(`${reasonsChirho.length} delivery derivative issue(s); first: ${reasonsChirho[0]}`);
	return [...uploadsChirho.values()];
}

/** Plans from verified manifests, skips received keys, uploads the rest (dry run without a target). */
export async function syncOnceChirho(
	rootChirho: string,
	targetChirho: TargetChirho | null,
	concurrencyChirho: number,
	depsChirho: DepsChirho,
	limitChirho = Number.POSITIVE_INFINITY
): Promise<SyncResultChirho> {
	const originalsChirho = (await planUploadsChirho(rootChirho)).uploads_chirho;
	const knownChirho = new Set(originalsChirho.map((uploadChirho) => uploadChirho.key_chirho));
	const derivativesChirho = (
		await planDeliveryUploadsChirho(rootChirho, depsChirho.log_chirho)
	).filter((uploadChirho) => !knownChirho.has(uploadChirho.key_chirho));
	const plannedChirho = [...originalsChirho, ...derivativesChirho];
	const bucketChirho = targetChirho?.bucket_chirho ?? libraryChirho.bucket_chirho;
	const receiptsChirho = await loadReceiptsChirho(rootChirho, bucketChirho, depsChirho.log_chirho);
	const pendingChirho = plannedChirho.filter(
		(uploadChirho: UploadChirho) =>
			receiptsChirho.get(uploadChirho.key_chirho)?.bytes_chirho !== uploadChirho.bytes_chirho
	);
	const resultChirho: SyncResultChirho = {
		planned_chirho: plannedChirho.length,
		derivatives_chirho: derivativesChirho.length,
		received_chirho: plannedChirho.length - pendingChirho.length,
		pending_chirho: pendingChirho.length,
		uploaded_chirho: 0
	};
	if (!targetChirho || !pendingChirho.length) return resultChirho;
	await mkdir(join(rootChirho, RECEIPT_FOLDER_CHIRHO), { recursive: true });
	const logPathChirho = receiptPathChirho(rootChirho, bucketChirho);
	await runPoolChirho(
		pendingChirho.slice(0, limitChirho),
		concurrencyChirho,
		async (uploadChirho) => {
			const bytesChirho = new Uint8Array(await readFile(uploadChirho.file_chirho));
			if (sha256Chirho(bytesChirho) !== shaOfKeyChirho(uploadChirho.key_chirho))
				throw new RefusalChirho([`${uploadChirho.asset_paths_chirho[0]} changed after planning`]);
			await uploadWithRetryChirho(targetChirho, uploadChirho.key_chirho, bytesChirho, depsChirho);
			appendReceiptChirho(logPathChirho, {
				key_chirho: uploadChirho.key_chirho,
				sha256_chirho: shaOfKeyChirho(uploadChirho.key_chirho),
				bytes_chirho: bytesChirho.byteLength,
				bucket_chirho: bucketChirho,
				at_chirho: depsChirho.now_chirho().toISOString(),
				source_chirho: 'upload'
			});
			resultChirho.uploaded_chirho++;
		}
	);
	return resultChirho;
}

/** Name, inode, size and mtime of the media manifests and delivery mapping: a change triggers a pass. */
export async function manifestSignatureChirho(rootChirho: string): Promise<string> {
	const folderChirho = join(rootChirho, 'data-chirho', 'media-chirho');
	const pathsChirho = (await readdir(folderChirho).catch(() => [] as string[]))
		.filter((nameChirho) => nameChirho.endsWith('.json'))
		.sort()
		.map((nameChirho) => join(folderChirho, nameChirho));
	pathsChirho.push(join(rootChirho, DELIVERY_FOLDER_CHIRHO, 'mapping-chirho.json'));
	const partsChirho: string[] = [];
	for (const pathChirho of pathsChirho) {
		const infoChirho = await stat(pathChirho).catch(() => null);
		if (infoChirho)
			partsChirho.push(`${pathChirho}:${infoChirho.ino}:${infoChirho.size}:${infoChirho.mtimeMs}`);
	}
	return partsChirho.join('|');
}

export interface WatchStateChirho {
	done_signature_chirho: string;
	last_error_chirho: string;
}

/**
 * One poll. Manifests count as done only when nothing is left to send, so a backlog capped by
 * --limit-chirho keeps draining on later polls even when no manifest changes.
 */
export async function watchPassChirho(
	rootChirho: string,
	targetChirho: TargetChirho | null,
	concurrencyChirho: number,
	limitChirho: number,
	depsChirho: DepsChirho,
	stateChirho: WatchStateChirho,
	rethrowChirho: boolean
): Promise<WatchStateChirho> {
	const signatureChirho = await manifestSignatureChirho(rootChirho);
	if (signatureChirho === stateChirho.done_signature_chirho) return stateChirho;
	try {
		const resultChirho = await syncOnceChirho(
			rootChirho,
			targetChirho,
			concurrencyChirho,
			depsChirho,
			limitChirho
		);
		const leftChirho = targetChirho
			? resultChirho.pending_chirho - resultChirho.uploaded_chirho
			: 0;
		depsChirho.log_chirho(
			targetChirho
				? `uploaded ${resultChirho.uploaded_chirho} new object(s); ${resultChirho.received_chirho + resultChirho.uploaded_chirho} of ${resultChirho.planned_chirho} verified objects received (${resultChirho.derivatives_chirho} delivery derivatives planned); ${leftChirho} left`
				: `dry run: ${resultChirho.pending_chirho} of ${resultChirho.planned_chirho} verified objects would upload (${resultChirho.received_chirho} already received; ${resultChirho.derivatives_chirho} delivery derivatives planned)`
		);
		return {
			done_signature_chirho: leftChirho === 0 ? signatureChirho : '',
			last_error_chirho: ''
		};
	} catch (errorChirho) {
		if (rethrowChirho || errorChirho instanceof RemoteRefusalChirho) throw errorChirho;
		const messageChirho = errorChirho instanceof Error ? errorChirho.message : 'refused';
		if (messageChirho !== stateChirho.last_error_chirho)
			depsChirho.log_chirho(`pass refused, last receipts kept, retrying: ${messageChirho}`);
		return { done_signature_chirho: '', last_error_chirho: messageChirho };
	}
}

function integerFlagChirho(
	argumentsChirho: string[],
	flagChirho: string,
	fallbackChirho: number,
	minimumChirho: number,
	maximumChirho: number
): number {
	const indexChirho = argumentsChirho.indexOf(flagChirho);
	if (indexChirho < 0) return fallbackChirho;
	const valueChirho = Number(argumentsChirho[indexChirho + 1]);
	if (!Number.isInteger(valueChirho) || valueChirho < minimumChirho || valueChirho > maximumChirho)
		throw new RefusalChirho([
			`${flagChirho} must be an integer from ${minimumChirho} to ${maximumChirho}`
		]);
	return valueChirho;
}

async function mainChirho(argumentsChirho: string[]): Promise<number> {
	const valuedChirho = [
		'--confirm-chirho',
		'--interval-chirho',
		'--concurrency-chirho',
		'--limit-chirho'
	];
	const flagsChirho = ['--watch-chirho', '--apply-chirho'];
	const unknownChirho = argumentsChirho.filter(
		(argumentChirho, indexChirho) =>
			!flagsChirho.includes(argumentChirho) &&
			!valuedChirho.includes(argumentChirho) &&
			!valuedChirho.includes(argumentsChirho[indexChirho - 1])
	);
	const rootChirho = resolve('.');
	const watchChirho = argumentsChirho.includes('--watch-chirho');
	let stoppingChirho = false;
	const depsChirho: DepsChirho = {
		fetch_chirho: (urlChirho, initChirho) => fetch(urlChirho, initChirho),
		sleep_chirho: (millisecondsChirho) =>
			new Promise((doneChirho) => setTimeout(doneChirho, millisecondsChirho)),
		log_chirho: (lineChirho) => console.log(`${new Date().toISOString()} ${lineChirho}`),
		now_chirho: () => new Date()
	};
	let releaseChirho: (() => Promise<void>) | null = null;
	try {
		if (unknownChirho.length)
			throw new RefusalChirho([`unsupported arguments: ${unknownChirho.join(' ')}`]);
		const intervalChirho = integerFlagChirho(argumentsChirho, '--interval-chirho', 10, 3, 600);
		const concurrencyChirho = integerFlagChirho(argumentsChirho, '--concurrency-chirho', 4, 1, 8);
		const limitChirho = integerFlagChirho(argumentsChirho, '--limit-chirho', 100_000, 1, 100_000);
		let targetChirho: TargetChirho | null = null;
		if (argumentsChirho.includes('--apply-chirho')) {
			const emailChirho = process.env.CLOUDFLARE_GLOBAL_API_EMAIL_CHIRHO ?? '';
			const keyChirho = process.env.CLOUDFLARE_GLOBAL_API_KEY_CHIRHO ?? '';
			const accountChirho = process.env.CLOUDFLARE_GLOBAL_API_MAIN_ACCOUNT_ID_CHIRHO ?? '';
			if (!emailChirho || !keyChirho || !ACCOUNT_PATTERN_CHIRHO.test(accountChirho))
				throw new RefusalChirho([
					'CLOUDFLARE_GLOBAL_API_EMAIL_CHIRHO, _KEY_CHIRHO and _MAIN_ACCOUNT_ID_CHIRHO must be set in .env'
				]);
			const confirmIndexChirho = argumentsChirho.indexOf('--confirm-chirho');
			const expectedChirho = `${libraryChirho.bucket_chirho}@${accountChirho.slice(-4)}`;
			if (confirmIndexChirho < 0 || argumentsChirho[confirmIndexChirho + 1] !== expectedChirho)
				throw new RefusalChirho([
					`--confirm-chirho must name the library bucket and account: ${libraryChirho.bucket_chirho}@<last 4 of the account id>`
				]);
			targetChirho = {
				account_chirho: accountChirho,
				bucket_chirho: libraryChirho.bucket_chirho,
				email_chirho: emailChirho,
				api_key_chirho: keyChirho
			};
			await cloudflareGetChirho(
				`/accounts/${accountChirho}/r2/buckets/${libraryChirho.bucket_chirho}`,
				{},
				{ email_chirho: emailChirho, key_chirho: keyChirho }
			).catch((errorChirho: Error) => {
				throw new RemoteRefusalChirho([
					`the library bucket is not reachable: ${errorChirho.message}`
				]);
			});
		}
		await mkdir(join(rootChirho, RECEIPT_FOLDER_CHIRHO), { recursive: true });
		releaseChirho = await acquireLockChirho(
			join(rootChirho, RECEIPT_FOLDER_CHIRHO, 'upload-watch-chirho.lock')
		);
		for (const signalChirho of ['SIGINT', 'SIGTERM'] as const)
			process.on(signalChirho, () => {
				stoppingChirho = true;
			});
		let stateChirho: WatchStateChirho = { done_signature_chirho: '', last_error_chirho: '' };
		do {
			stateChirho = await watchPassChirho(
				rootChirho,
				targetChirho,
				concurrencyChirho,
				limitChirho,
				depsChirho,
				stateChirho,
				!watchChirho
			);
			if (watchChirho && !stoppingChirho) await depsChirho.sleep_chirho(intervalChirho * 1000);
		} while (watchChirho && !stoppingChirho);
		return 0;
	} catch (errorChirho) {
		if (!(errorChirho instanceof RefusalChirho)) throw errorChirho;
		console.error(errorChirho.message);
		return 2;
	} finally {
		await releaseChirho?.();
	}
}

if (import.meta.main) process.exitCode = await mainChirho(process.argv.slice(2));
