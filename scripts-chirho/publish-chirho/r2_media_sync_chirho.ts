// For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life. — John 3:16 (KJV)

// Plans, and only on explicit request applies, uploads of declared WebP media into the PRIVATE
// Hinneh media library. Object keys are content addresses of verified bytes, so callers cannot
// choose keys, and the bucket must equal config-chirho/media-library-chirho.json.
// Workflow: spec-chirho/research-chirho/26-10-27-publication-readiness-chirho.md
// Usage:
//   bun scripts-chirho/publish-chirho/r2_media_sync_chirho.ts           # plan only, no network
//   bun scripts-chirho/publish-chirho/r2_media_sync_chirho.ts --apply-chirho --bucket-chirho NAME
//       --confirm-chirho PLAN_ID (--local-chirho PERSIST_DIR | --remote-chirho)
// --remote-chirho needs L.J.'s release decision and an existing bucket; it has never been run.

import { spawnSync } from 'node:child_process';
import { mkdirSync } from 'node:fs';
import { readFile } from 'node:fs/promises';
import { join, resolve } from 'node:path';
import libraryChirho from '../../config-chirho/media-library-chirho.json';
import { readMediaRecordsChirho } from './build_release_chirho';
import {
	RefusalChirho,
	mediaProblemChirho,
	sha256Chirho,
	wranglerEnvironmentChirho,
	type ReviewStateChirho
} from './release_rules_chirho';

export const KEY_PREFIX_CHIRHO = 'media-chirho/sha256-chirho/';
export const KEY_PATTERN_CHIRHO = /^media-chirho\/sha256-chirho\/[0-9a-f]{64}\.webp$/;

export interface UploadChirho {
	key_chirho: string;
	file_chirho: string;
	bytes_chirho: number;
	asset_paths_chirho: string[];
	review_chirho: ReviewStateChirho[];
}
export interface PlanChirho {
	bucket_chirho: string;
	plan_id_chirho: string;
	total_bytes_chirho: number;
	uploads_chirho: UploadChirho[];
}
export type TargetChirho =
	{ remote_chirho: true } | { remote_chirho: false; persist_chirho: string };

/** Verifies every declared file in static/ and derives one content-addressed key per byte string. */
export async function planUploadsChirho(rootChirho: string): Promise<PlanChirho> {
	const reasonsChirho: string[] = [];
	const uploadsChirho = new Map<string, UploadChirho>();
	for (const recordChirho of await readMediaRecordsChirho(rootChirho, reasonsChirho)) {
		const fileChirho = join(resolve(rootChirho), 'static', recordChirho.asset_path_chirho.slice(1));
		const bytesChirho = await readFile(fileChirho).catch(() => null);
		const problemChirho = bytesChirho
			? mediaProblemChirho(recordChirho, new Uint8Array(bytesChirho))
			: `${recordChirho.asset_path_chirho} is missing from static/`;
		if (problemChirho || !bytesChirho) {
			reasonsChirho.push(problemChirho ?? 'unreadable media');
			continue;
		}
		const keyChirho = `${KEY_PREFIX_CHIRHO}${recordChirho.sha256_chirho}.webp`;
		const uploadChirho = uploadsChirho.get(keyChirho) ?? {
			key_chirho: keyChirho,
			file_chirho: fileChirho,
			bytes_chirho: bytesChirho.byteLength,
			asset_paths_chirho: [],
			review_chirho: []
		};
		uploadChirho.asset_paths_chirho.push(recordChirho.asset_path_chirho);
		uploadChirho.review_chirho.push(recordChirho.art_review_chirho);
		uploadsChirho.set(keyChirho, uploadChirho);
	}
	if (reasonsChirho.length) throw new RefusalChirho(reasonsChirho);
	const listChirho = [...uploadsChirho.values()].sort((aChirho, bChirho) =>
		aChirho.key_chirho < bChirho.key_chirho ? -1 : 1
	);
	return {
		bucket_chirho: libraryChirho.bucket_chirho,
		plan_id_chirho: sha256Chirho(
			JSON.stringify([
				libraryChirho.bucket_chirho,
				listChirho.map((uploadChirho) => [uploadChirho.key_chirho, uploadChirho.bytes_chirho])
			])
		),
		total_bytes_chirho: listChirho.reduce(
			(sumChirho, uploadChirho) => sumChirho + uploadChirho.bytes_chirho,
			0
		),
		uploads_chirho: listChirho
	};
}

/** Wrangler arguments for one upload; refuses any key outside the content-address scheme. */
export function putArgumentsChirho(
	bucketChirho: string,
	uploadChirho: UploadChirho,
	targetChirho: TargetChirho
): string[] {
	if (!KEY_PATTERN_CHIRHO.test(uploadChirho.key_chirho))
		throw new RefusalChirho([`refusing object key ${JSON.stringify(uploadChirho.key_chirho)}`]);
	return [
		'wrangler',
		'r2',
		'object',
		'put',
		`${bucketChirho}/${uploadChirho.key_chirho}`,
		'--file',
		uploadChirho.file_chirho,
		'--content-type',
		'image/webp',
		'--cache-control',
		'public, max-age=31536000, immutable',
		...(targetChirho.remote_chirho
			? ['--remote']
			: ['--local', '--persist-to', targetChirho.persist_chirho])
	];
}

/** Applies a freshly computed plan only to the configured bucket and only with its exact id. */
export async function applyPlanChirho(
	planChirho: PlanChirho,
	bucketChirho: string,
	confirmChirho: string,
	uploadChirho: (uploadChirho: UploadChirho) => Promise<void>
): Promise<number> {
	const reasonsChirho: string[] = [];
	if (bucketChirho !== libraryChirho.bucket_chirho || planChirho.bucket_chirho !== bucketChirho)
		reasonsChirho.push(
			`bucket must be the configured media library ${libraryChirho.bucket_chirho}`
		);
	if (confirmChirho !== planChirho.plan_id_chirho)
		reasonsChirho.push('--confirm-chirho does not match the current plan id');
	for (const itemChirho of planChirho.uploads_chirho)
		if (!KEY_PATTERN_CHIRHO.test(itemChirho.key_chirho))
			reasonsChirho.push(`refusing object key ${JSON.stringify(itemChirho.key_chirho)}`);
	if (reasonsChirho.length) throw new RefusalChirho(reasonsChirho);
	for (const itemChirho of planChirho.uploads_chirho) await uploadChirho(itemChirho);
	return planChirho.uploads_chirho.length;
}

function wranglerUploaderChirho(
	rootChirho: string,
	bucketChirho: string,
	targetChirho: TargetChirho
): (uploadChirho: UploadChirho) => Promise<void> {
	// A local apply carries no Cloudflare credential at all; remote uses the existing .env key.
	const environmentChirho = wranglerEnvironmentChirho(
		rootChirho,
		targetChirho.remote_chirho
			? {
					CLOUDFLARE_API_KEY: process.env.CLOUDFLARE_GLOBAL_API_KEY_CHIRHO ?? '',
					CLOUDFLARE_EMAIL: process.env.CLOUDFLARE_GLOBAL_API_EMAIL_CHIRHO ?? '',
					CLOUDFLARE_ACCOUNT_ID: process.env.CLOUDFLARE_GLOBAL_API_MAIN_ACCOUNT_ID_CHIRHO ?? ''
				}
			: {}
	);
	mkdirSync(environmentChirho.HOME, { recursive: true });
	return async (uploadChirho) => {
		const resultChirho = spawnSync(
			'bunx',
			putArgumentsChirho(bucketChirho, uploadChirho, targetChirho),
			{ cwd: rootChirho, env: environmentChirho, stdio: ['ignore', 'ignore', 'inherit'] }
		);
		if (resultChirho.status !== 0) throw new Error(`Upload failed for ${uploadChirho.key_chirho}.`);
	};
}

async function mainChirho(argumentsChirho: string[]): Promise<number> {
	const valueChirho = (flagChirho: string) => {
		const indexChirho = argumentsChirho.indexOf(flagChirho);
		return indexChirho >= 0 ? (argumentsChirho[indexChirho + 1] ?? '') : null;
	};
	const flagsChirho = ['--apply-chirho', '--remote-chirho'];
	const valuedChirho = ['--bucket-chirho', '--confirm-chirho', '--local-chirho'];
	const unknownChirho = argumentsChirho.filter(
		(argumentChirho, indexChirho) =>
			!flagsChirho.includes(argumentChirho) &&
			!valuedChirho.includes(argumentChirho) &&
			!valuedChirho.includes(argumentsChirho[indexChirho - 1])
	);
	if (unknownChirho.length) {
		console.error(`Unsupported arguments: ${unknownChirho.join(' ')}`);
		return 1;
	}
	const rootChirho = resolve('.');
	try {
		const planChirho = await planUploadsChirho(rootChirho);
		const pendingChirho = planChirho.uploads_chirho.filter((uploadChirho) =>
			uploadChirho.review_chirho.includes('pending')
		).length;
		console.log(
			[
				`Plan ${planChirho.plan_id_chirho} for private bucket ${planChirho.bucket_chirho}`,
				`${planChirho.uploads_chirho.length} content-addressed objects (${pendingChirho} still pending art review), ${planChirho.total_bytes_chirho} bytes; one R2 Class A PutObject each.`,
				...planChirho.uploads_chirho
					.slice(0, 3)
					.map(
						(uploadChirho) =>
							`  ${uploadChirho.key_chirho} <- ${uploadChirho.asset_paths_chirho[0]}`
					)
			].join('\n')
		);
		if (!argumentsChirho.includes('--apply-chirho')) {
			console.log('Plan only; nothing uploaded.');
			return 0;
		}
		const localChirho = valueChirho('--local-chirho');
		const remoteChirho = argumentsChirho.includes('--remote-chirho');
		if (Boolean(localChirho) === remoteChirho)
			throw new RefusalChirho(['choose exactly one of --local-chirho DIR or --remote-chirho']);
		const targetChirho: TargetChirho = remoteChirho
			? { remote_chirho: true }
			: { remote_chirho: false, persist_chirho: resolve(localChirho ?? '') };
		const bucketChirho = valueChirho('--bucket-chirho') ?? '';
		const countChirho = await applyPlanChirho(
			planChirho,
			bucketChirho,
			valueChirho('--confirm-chirho') ?? '',
			wranglerUploaderChirho(rootChirho, bucketChirho, targetChirho)
		);
		console.log(
			`Uploaded ${countChirho} object(s) to ${remoteChirho ? 'REMOTE' : 'local'} ${bucketChirho}.`
		);
		return 0;
	} catch (errorChirho) {
		if (!(errorChirho instanceof RefusalChirho)) throw errorChirho;
		console.error(errorChirho.message);
		return 2;
	}
}

if (import.meta.main) process.exitCode = await mainChirho(process.argv.slice(2));
