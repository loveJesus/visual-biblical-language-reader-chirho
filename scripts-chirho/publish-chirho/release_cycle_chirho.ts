// For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life. — John 3:16 (KJV)

// Bounded, serialized preview release cycle for Hinneh's configured reader domains.
// Workflow: spec-chirho/research-chirho/26-10-27-publication-readiness-chirho.md (release cycle).
// One cycle: refresh delivery derivatives, copy a snapshot, hold if application code differs
// from root's accepted baseline, overlay verified derivatives, rebuild shards, build, validate
// the exact release, require an R2 receipt for every delivered image, probe it locally, skip it
// when unchanged since the last deploy, and deploy only with --apply-chirho.
// Usage:
//   bun scripts-chirho/publish-chirho/release_cycle_chirho.ts                  # one dry cycle
//   bun scripts-chirho/publish-chirho/release_cycle_chirho.ts --apply-chirho
//       --confirm-chirho hinneh.us@<last 4 of the account id>      # one real deploy
//   bun scripts-chirho/publish-chirho/release_cycle_chirho.ts --accept-baseline-chirho
//   bun scripts-chirho/publish-chirho/release_cycle_chirho.ts --watch-chirho --apply-chirho
//       --confirm-chirho ... [--interval-minutes-chirho 30..1440] [--quiet-seconds-chirho 3..60, default 5]
// Exit 0: deployed, dry-run passed, skipped or held. Exit 2: refused.

import { spawnSync } from 'node:child_process';
import { closeSync, fsyncSync, openSync, writeSync } from 'node:fs';
import { mkdir, readdir, readFile, realpath, rm, stat, writeFile } from 'node:fs/promises';
import { homedir } from 'node:os';
import { join, resolve } from 'node:path';
import libraryChirho from '../../config-chirho/media-library-chirho.json';
import { SITE_HOSTNAME_CHIRHO } from '../../src/lib/site-chirho';
import {
	buildReleaseChirho,
	readGitStateChirho,
	verifyReleaseChirho,
	type ReleaseManifestChirho
} from './build_release_chirho';
import {
	copySnapshotChirho,
	overlayDeliveryChirho,
	refreshSnapshotShardsChirho,
	retireSnapshotBuildChirho,
	verifySnapshotReuseChirho
} from './preview_snapshot_chirho';
import { probeReleaseChirho } from './probe_release_chirho';
import { KEY_PREFIX_CHIRHO } from './r2_media_sync_chirho';
import { audioReceiptsChirho } from '../audio-chirho/r2_recordings_chirho';
import {
	DELIVERY_FOLDER_CHIRHO,
	acquireLockChirho,
	loadReceiptsChirho
} from './r2_upload_watch_chirho';
import { RefusalChirho, sha256Chirho, wranglerEnvironmentChirho } from './release_rules_chirho';
import { r2ModeChirho, overlayRemoteArtworkChirho } from './r2-chirho/release-artwork-chirho';

export const CYCLE_FOLDER_CHIRHO = join('build-chirho', 'release-cycle-chirho');
export const MINIMUM_INTERVAL_MINUTES_CHIRHO = 30;
const ACCOUNT_PATTERN_CHIRHO = /^[0-9a-f]{32}$/;
const HOSTNAME_CHIRHO = SITE_HOSTNAME_CHIRHO;

export interface BaselineChirho {
	code_fingerprint_chirho: string;
	release_id_chirho: string;
	accepted_at_chirho: string;
}
export interface DeployReceiptChirho {
	release_id_chirho: string;
	code_fingerprint_chirho: string;
	media_fingerprint_chirho: string;
	version_id_chirho: string | null;
	at_chirho: string;
}
export type OutcomeChirho =
	| { status_chirho: 'deployed'; release_id_chirho: string; version_id_chirho: string | null }
	| { status_chirho: 'dry_run' | 'skipped'; release_id_chirho: string }
	| { status_chirho: 'held'; reason_chirho: string };
export interface CycleOptionsChirho {
	apply_chirho: boolean;
	first_deploy_allowed_chirho: boolean;
	credentials_chirho: Record<string, string> | null;
	log_chirho: (lineChirho: string) => void;
}

const folderChirho = (rootChirho: string) => join(rootChirho, CYCLE_FOLDER_CHIRHO);

/** A failed local check is safe to repeat: no remote deployment has begun at this point. */
export async function requireLocalProbeChirho(probeChirho: () => Promise<string[]>): Promise<void> {
	let failedChirho: string[];
	try {
		failedChirho = await probeChirho();
	} catch {
		// Do not copy child output or environment into the watcher log.
		throw new RefusalChirho(['local preview probe could not run; no deployment attempted']);
	}
	if (failedChirho.length)
		throw new RefusalChirho([`local probe failed: ${failedChirho.join(', ')}`]);
}

/** The recorded preview authority must exist and be well formed; its bytes are hashed. */
export async function readAuthorityChirho(rootChirho: string): Promise<string> {
	const bytesChirho = await readFile(
		join(rootChirho, 'config-chirho', 'preview-authority-chirho.json')
	).catch(() => null);
	const recordChirho = bytesChirho ? JSON.parse(new TextDecoder().decode(bytesChirho)) : null;
	if (
		!bytesChirho ||
		recordChirho?.schema_version_chirho !== 1 ||
		recordChirho.release_kind_chirho !== 'recorded_preview' ||
		typeof recordChirho.authority_chirho !== 'string' ||
		!recordChirho.authority_chirho.trim() ||
		typeof recordChirho.scope_chirho !== 'string' ||
		!recordChirho.scope_chirho.trim()
	)
		throw new RefusalChirho(['config-chirho/preview-authority-chirho.json is missing or invalid']);
	return sha256Chirho(bytesChirho);
}

export async function readBaselineChirho(rootChirho: string): Promise<BaselineChirho | null> {
	return readFile(join(folderChirho(rootChirho), 'code-baseline-chirho.json'), 'utf8')
		.then((textChirho) => JSON.parse(textChirho) as BaselineChirho)
		.catch(() => null);
}

export async function lastDeployChirho(rootChirho: string): Promise<DeployReceiptChirho | null> {
	const textChirho = await readFile(
		join(folderChirho(rootChirho), 'deploys-chirho.jsonl'),
		'utf8'
	).catch(() => '');
	const linesChirho = textChirho.split('\n').filter((lineChirho) => lineChirho.trim());
	for (let indexChirho = linesChirho.length - 1; indexChirho >= 0; indexChirho--) {
		try {
			return JSON.parse(linesChirho[indexChirho]) as DeployReceiptChirho;
		} catch {
			continue;
		}
	}
	return null;
}

/** Holds unless the snapshot's application code equals root's accepted baseline. */
export function baselineDecisionChirho(
	baselineChirho: BaselineChirho | null,
	codeFingerprintChirho: string,
	firstDeployAllowedChirho: boolean
): string | null {
	if (!baselineChirho)
		return firstDeployAllowedChirho
			? null
			: 'no accepted code baseline yet; root deploys once with --apply-chirho, verifies, then runs --accept-baseline-chirho';
	return baselineChirho.code_fingerprint_chirho === codeFingerprintChirho
		? null
		: 'application code changed since the accepted baseline; holding until root verifies and accepts it';
}

/** Due when the interval since the last deploy has passed and media inputs have been quiet. */
export function cycleDueChirho(
	nowMsChirho: number,
	lastDeployMsChirho: number | null,
	newestInputMsChirho: number,
	intervalMinutesChirho: number,
	quietSecondsChirho: number
): string | null {
	if (
		lastDeployMsChirho !== null &&
		nowMsChirho - lastDeployMsChirho < intervalMinutesChirho * 60_000
	)
		return 'the minimum interval since the last deploy has not passed';
	if (nowMsChirho - newestInputMsChirho < quietSecondsChirho * 1000)
		return 'media inputs changed recently; waiting for them to settle';
	return null;
}

/** Delivered image hashes (every shipped /assets-chirho/ file) without an R2 receipt. */
export async function missingReceiptsChirho(
	rootChirho: string,
	manifestChirho: ReleaseManifestChirho,
	logChirho: (lineChirho: string) => void
): Promise<string[]> {
	const receiptsChirho = await loadReceiptsChirho(
		rootChirho,
		libraryChirho.bucket_chirho,
		logChirho
	);
	const missingImagesChirho = manifestChirho.files_chirho
		.filter((fileChirho) => fileChirho.path_chirho.startsWith('/assets-chirho/'))
		.filter(
			(fileChirho) =>
				receiptsChirho.get(`${KEY_PREFIX_CHIRHO}${fileChirho.sha256_chirho}.webp`)?.bytes_chirho !==
				fileChirho.bytes_chirho
		)
		.map((fileChirho) => fileChirho.path_chirho);
	if (manifestChirho.artwork_chirho) {
		const textChirho = await readFile(
			join(rootChirho, 'build-chirho/r2-chirho/artwork-readbacks-chirho.jsonl'),
			'utf8'
		).catch(() => '');
		if (Buffer.byteLength(textChirho) > 64 * 1024 ** 2)
			throw new RefusalChirho(['artwork proof receipts need cold retirement']);
		const verifiedChirho = new Map<string, number>();
		for (const lineChirho of textChirho.split('\n')) {
			try {
				const proofChirho = JSON.parse(lineChirho);
				if (
					(proofChirho.key_chirho ===
						`media-chirho/sha256-chirho/${proofChirho.sha256_chirho}.webp` ||
						proofChirho.key_chirho ===
							`media-chirho/sha256-chirho/${proofChirho.sha256_chirho}.jpg`) &&
					Number.isFinite(Date.parse(proofChirho.verified_at_chirho)) &&
					proofChirho.lossy_chirho === true
				)
					verifiedChirho.set(proofChirho.key_chirho, proofChirho.bytes_chirho);
			} catch {
				/* A torn tail has no authority. */
			}
		}
		for (const objectChirho of manifestChirho.artwork_chirho.objects_chirho)
			if (verifiedChirho.get(objectChirho.key_chirho) !== objectChirho.bytes_chirho)
				missingImagesChirho.push(objectChirho.key_chirho);
	}
	const audioChirho = await audioReceiptsChirho(rootChirho);
	const missingAudioChirho = manifestChirho.files_chirho
		.filter(
			(fileChirho) =>
				fileChirho.path_chirho.startsWith('/audio-chirho/sha256-chirho/') &&
				audioChirho.get(`audio-chirho/sha256-chirho/${fileChirho.sha256_chirho}.mp3`)
					?.bytes_chirho !== fileChirho.bytes_chirho
		)
		.map((fileChirho) => fileChirho.path_chirho);
	for (const objectChirho of manifestChirho.artwork_chirho?.audio_objects_chirho ?? []) {
		const receiptChirho = audioChirho.get(objectChirho.key_chirho);
		if (
			receiptChirho?.readback_sha256_chirho !== objectChirho.sha256_chirho ||
			receiptChirho.bytes_chirho !== objectChirho.bytes_chirho
		)
			missingAudioChirho.push(objectChirho.key_chirho);
	}
	return [...missingImagesChirho, ...missingAudioChirho];
}

/** Give the already-running uploader at most thirty seconds to finish this frozen release. */
export async function waitForReceiptsChirho(
	checkChirho: () => Promise<string[]>,
	sleepChirho: (millisecondsChirho: number) => Promise<void>
): Promise<string[]> {
	for (let checkNumberChirho = 0; ; checkNumberChirho++) {
		const missingChirho = await checkChirho();
		if (!missingChirho.length || checkNumberChirho === 15) return missingChirho;
		await sleepChirho(2000);
	}
}

async function newestInputMsChirho(rootChirho: string): Promise<number> {
	const pathsChirho = [
		...(await readdir(join(rootChirho, 'data-chirho', 'media-chirho')).catch(() => [] as string[]))
			.filter((nameChirho) => nameChirho.endsWith('.json'))
			.map((nameChirho) => join(rootChirho, 'data-chirho', 'media-chirho', nameChirho)),
		join(rootChirho, DELIVERY_FOLDER_CHIRHO, 'mapping-chirho.json')
	];
	let newestChirho = 0;
	for (const pathChirho of pathsChirho)
		newestChirho = Math.max(newestChirho, (await stat(pathChirho).catch(() => null))?.mtimeMs ?? 0);
	return newestChirho;
}

function runChirho(
	commandChirho: string,
	argumentsChirho: string[],
	cwdChirho: string,
	environmentChirho?: Record<string, string>
): { status_chirho: number; output_chirho: string } {
	const resultChirho = spawnSync(commandChirho, argumentsChirho, {
		cwd: cwdChirho,
		env: environmentChirho ?? process.env,
		encoding: 'utf8',
		timeout: 15 * 60_000,
		maxBuffer: 64 * 1024 * 1024
	});
	return {
		status_chirho: resultChirho.status ?? 1,
		output_chirho: `${resultChirho.stdout ?? ''}${resultChirho.stderr ?? ''}`
	};
}

/** One complete cycle; every refusal or hold leaves the deployed site untouched. */
export async function runCycleChirho(
	rootChirho: string,
	optionsChirho: CycleOptionsChirho
): Promise<OutcomeChirho> {
	const logChirho = optionsChirho.log_chirho;
	const authorityChirho = await readAuthorityChirho(rootChirho);
	const snapshotChirho = await copySnapshotChirho(
		rootChirho,
		join(folderChirho(rootChirho), 'snapshot-chirho')
	);
	const holdChirho = baselineDecisionChirho(
		await readBaselineChirho(rootChirho),
		snapshotChirho.code_fingerprint_chirho,
		optionsChirho.first_deploy_allowed_chirho
	);
	if (holdChirho && optionsChirho.apply_chirho)
		return { status_chirho: 'held', reason_chirho: holdChirho };
	if (holdChirho) logChirho(`dry run note: a real cycle would hold: ${holdChirho}`);
	// Freeze the release's catalogue before deriving. A producer may append new records while
	// compression runs; those newer records must not enter this already frozen snapshot.
	const deriverChirho = (await r2ModeChirho(rootChirho))
		? { status_chirho: 0, output_chirho: 'Verified R2 artwork catalogue' }
		: runChirho(
				'python3',
				['-B', join('scripts-chirho', 'art-chirho', 'prepare_delivery_media_chirho.py')],
				rootChirho
			);
	if (deriverChirho.status_chirho !== 0)
		return {
			status_chirho: 'held',
			reason_chirho: `delivery deriver failed: ${deriverChirho.output_chirho.trim().slice(-300)}`
		};
	// Review pins refer to original artwork, so verify before the delivery overlay changes hashes.
	await verifySnapshotReuseChirho(snapshotChirho.directory_chirho);
	const overlayChirho = (await r2ModeChirho(rootChirho))
		? await overlayRemoteArtworkChirho(snapshotChirho.directory_chirho)
		: await overlayDeliveryChirho(
				snapshotChirho.directory_chirho,
				join(rootChirho, DELIVERY_FOLDER_CHIRHO)
			);
	await rm(join(snapshotChirho.directory_chirho, 'static', 'media-index-chirho.json'), {
		force: true
	});
	refreshSnapshotShardsChirho(snapshotChirho.directory_chirho);
	const buildChirho = runChirho('bun', ['run', 'build'], snapshotChirho.directory_chirho);
	if (buildChirho.status_chirho !== 0)
		throw new RefusalChirho([
			`snapshot build failed: ${buildChirho.output_chirho.trim().slice(-400)}`
		]);
	const gitChirho = readGitStateChirho(rootChirho);
	const { manifest_chirho: manifestChirho } = await buildReleaseChirho({
		root_chirho: snapshotChirho.directory_chirho,
		allow_pending_media_chirho: false,
		fresh_build_chirho: true,
		git_chirho: gitChirho,
		local_paths_chirho: [
			...new Set([
				homedir(),
				rootChirho,
				await realpath(rootChirho),
				snapshotChirho.directory_chirho
			])
		].filter((pathChirho) => pathChirho.length >= 8),
		preview_chirho: {
			authority_sha256_chirho: authorityChirho,
			output_root_chirho: rootChirho,
			secret_paths_chirho: [join(rootChirho, '.env'), join(rootChirho, '.dev.vars')],
			snapshot_chirho: {
				code_fingerprint_chirho: snapshotChirho.code_fingerprint_chirho,
				media_fingerprint_chirho: snapshotChirho.media_fingerprint_chirho,
				input_files_chirho: snapshotChirho.input_files_chirho,
				overlay_chirho: overlayChirho
			}
		}
	});
	const verifyChirho = await verifyReleaseChirho(rootChirho, 'recorded_preview', gitChirho);
	if (verifyChirho.length) throw new RefusalChirho(verifyChirho);
	await retireSnapshotBuildChirho(rootChirho, snapshotChirho.directory_chirho);
	const checkReceiptsChirho = () => missingReceiptsChirho(rootChirho, manifestChirho, logChirho);
	const unreceivedChirho = optionsChirho.apply_chirho
		? await waitForReceiptsChirho(
				checkReceiptsChirho,
				(millisecondsChirho) =>
					new Promise((resolveChirho) => setTimeout(resolveChirho, millisecondsChirho))
			)
		: await checkReceiptsChirho();
	if (unreceivedChirho.length) {
		const reasonChirho = `${unreceivedChirho.length} delivered media file(s) have no R2 receipt yet (first: ${unreceivedChirho[0]})`;
		if (optionsChirho.apply_chirho) return { status_chirho: 'held', reason_chirho: reasonChirho };
		logChirho(`dry run note: a real cycle would hold: ${reasonChirho}`);
	}
	await requireLocalProbeChirho(() => probeReleaseChirho(rootChirho, 'recorded_preview'));
	const releaseIdChirho = manifestChirho.release_id_chirho;
	if ((await lastDeployChirho(rootChirho))?.release_id_chirho === releaseIdChirho)
		return { status_chirho: 'skipped', release_id_chirho: releaseIdChirho };
	const configChirho = join(rootChirho, 'config-chirho', 'wrangler-preview-chirho.jsonc');
	const environmentChirho = wranglerEnvironmentChirho(
		rootChirho,
		optionsChirho.apply_chirho ? (optionsChirho.credentials_chirho ?? {}) : {}
	);
	await mkdir(environmentChirho.HOME, { recursive: true });
	const deployChirho = runChirho(
		'bunx',
		[
			'wrangler',
			'deploy',
			...(optionsChirho.apply_chirho ? [] : ['--dry-run']),
			'--config',
			configChirho
		],
		rootChirho,
		environmentChirho
	);
	if (deployChirho.status_chirho !== 0) {
		if (optionsChirho.apply_chirho)
			throw new Error(
				`Remote deploy exited ${deployChirho.status_chirho}; reconcile the provider result before another deploy.`
			);
		throw new RefusalChirho([`wrangler deploy --dry-run exited ${deployChirho.status_chirho}`]);
	}
	if (!optionsChirho.apply_chirho)
		return { status_chirho: 'dry_run', release_id_chirho: releaseIdChirho };
	const versionChirho =
		/Current Version ID: ([0-9a-f-]{36})/.exec(deployChirho.output_chirho)?.[1] ?? null;
	const receiptChirho: DeployReceiptChirho = {
		release_id_chirho: releaseIdChirho,
		code_fingerprint_chirho: snapshotChirho.code_fingerprint_chirho,
		media_fingerprint_chirho: snapshotChirho.media_fingerprint_chirho,
		version_id_chirho: versionChirho,
		at_chirho: new Date().toISOString()
	};
	const descriptorChirho = openSync(join(folderChirho(rootChirho), 'deploys-chirho.jsonl'), 'a');
	try {
		writeSync(descriptorChirho, `${JSON.stringify(receiptChirho)}\n`);
		fsyncSync(descriptorChirho);
	} finally {
		closeSync(descriptorChirho);
	}
	return {
		status_chirho: 'deployed',
		release_id_chirho: releaseIdChirho,
		version_id_chirho: versionChirho
	};
}

/** Root pins the code fingerprint of the verified preview release now on disk. */
export async function acceptBaselineChirho(rootChirho: string): Promise<BaselineChirho> {
	const reasonsChirho = await verifyReleaseChirho(
		rootChirho,
		'recorded_preview',
		readGitStateChirho(rootChirho)
	);
	if (reasonsChirho.length) throw new RefusalChirho(reasonsChirho);
	const manifestChirho = JSON.parse(
		await readFile(
			join(rootChirho, 'build-chirho', 'preview-chirho', 'release-manifest-chirho.json'),
			'utf8'
		)
	) as ReleaseManifestChirho;
	const codeChirho = manifestChirho.snapshot_chirho?.code_fingerprint_chirho;
	if (typeof codeChirho !== 'string' || !/^[0-9a-f]{64}$/.test(codeChirho))
		throw new RefusalChirho(['the preview release has no code fingerprint']);
	const baselineChirho: BaselineChirho = {
		code_fingerprint_chirho: codeChirho,
		release_id_chirho: manifestChirho.release_id_chirho,
		accepted_at_chirho: new Date().toISOString()
	};
	await writeFile(
		join(folderChirho(rootChirho), 'code-baseline-chirho.json'),
		`${JSON.stringify(baselineChirho, null, '\t')}\n`
	);
	return baselineChirho;
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
	const flagsChirho = ['--watch-chirho', '--apply-chirho', '--accept-baseline-chirho'];
	const valuedChirho = ['--confirm-chirho', '--interval-minutes-chirho', '--quiet-seconds-chirho'];
	const unknownChirho = argumentsChirho.filter(
		(argumentChirho, indexChirho) =>
			!flagsChirho.includes(argumentChirho) &&
			!valuedChirho.includes(argumentChirho) &&
			!valuedChirho.includes(argumentsChirho[indexChirho - 1])
	);
	const rootChirho = resolve('.');
	const logChirho = (lineChirho: string) =>
		console.log(`${new Date().toISOString()} ${lineChirho}`);
	let releaseChirho: (() => Promise<void>) | null = null;
	let stoppingChirho = false;
	try {
		if (unknownChirho.length)
			throw new RefusalChirho([`unsupported arguments: ${unknownChirho.join(' ')}`]);
		const watchChirho = argumentsChirho.includes('--watch-chirho');
		const applyChirho = argumentsChirho.includes('--apply-chirho');
		const intervalChirho = integerFlagChirho(
			argumentsChirho,
			'--interval-minutes-chirho',
			MINIMUM_INTERVAL_MINUTES_CHIRHO,
			MINIMUM_INTERVAL_MINUTES_CHIRHO,
			1440
		);
		const quietChirho = integerFlagChirho(argumentsChirho, '--quiet-seconds-chirho', 5, 3, 60);
		await mkdir(folderChirho(rootChirho), { recursive: true });
		releaseChirho = await acquireLockChirho(join(folderChirho(rootChirho), 'cycle-chirho.lock'));
		if (argumentsChirho.includes('--accept-baseline-chirho')) {
			const baselineChirho = await acceptBaselineChirho(rootChirho);
			logChirho(
				`accepted code baseline ${baselineChirho.code_fingerprint_chirho} from release ${baselineChirho.release_id_chirho}`
			);
			return 0;
		}
		let credentialsChirho: Record<string, string> | null = null;
		if (applyChirho) {
			const accountChirho = process.env.CLOUDFLARE_GLOBAL_API_MAIN_ACCOUNT_ID_CHIRHO ?? '';
			const confirmIndexChirho = argumentsChirho.indexOf('--confirm-chirho');
			if (
				!ACCOUNT_PATTERN_CHIRHO.test(accountChirho) ||
				!process.env.CLOUDFLARE_GLOBAL_API_KEY_CHIRHO ||
				!process.env.CLOUDFLARE_GLOBAL_API_EMAIL_CHIRHO ||
				confirmIndexChirho < 0 ||
				argumentsChirho[confirmIndexChirho + 1] !== `${HOSTNAME_CHIRHO}@${accountChirho.slice(-4)}`
			)
				throw new RefusalChirho([
					`--apply-chirho needs the .env Cloudflare key and --confirm-chirho ${HOSTNAME_CHIRHO}@<last 4 of the account id>`
				]);
			credentialsChirho = {
				CLOUDFLARE_API_KEY: process.env.CLOUDFLARE_GLOBAL_API_KEY_CHIRHO,
				CLOUDFLARE_EMAIL: process.env.CLOUDFLARE_GLOBAL_API_EMAIL_CHIRHO,
				CLOUDFLARE_ACCOUNT_ID: accountChirho
			};
		}
		for (const signalChirho of ['SIGINT', 'SIGTERM'] as const)
			process.on(signalChirho, () => {
				stoppingChirho = true;
			});
		let lastMessageChirho = '';
		let lastAttemptMsChirho = 0;
		do {
			const lastChirho = await lastDeployChirho(rootChirho);
			const waitChirho = watchChirho
				? (cycleDueChirho(
						Date.now(),
						lastChirho ? Date.parse(lastChirho.at_chirho) : null,
						await newestInputMsChirho(rootChirho),
						intervalChirho,
						quietChirho
					) ??
					(Date.now() - lastAttemptMsChirho < 5 * 60_000
						? 'retrying at most every 5 minutes'
						: null))
				: null;
			if (!waitChirho) {
				lastAttemptMsChirho = Date.now();
				try {
					const outcomeChirho = await runCycleChirho(rootChirho, {
						apply_chirho: applyChirho,
						first_deploy_allowed_chirho: applyChirho && !watchChirho,
						credentials_chirho: credentialsChirho,
						log_chirho: logChirho
					});
					const messageChirho =
						outcomeChirho.status_chirho === 'held'
							? `held: ${outcomeChirho.reason_chirho}`
							: `${outcomeChirho.status_chirho}: release ${outcomeChirho.release_id_chirho}${'version_id_chirho' in outcomeChirho && outcomeChirho.version_id_chirho ? ` (version ${outcomeChirho.version_id_chirho})` : ''}`;
					if (messageChirho !== lastMessageChirho || !watchChirho) logChirho(messageChirho);
					lastMessageChirho = messageChirho;
				} catch (errorChirho) {
					if (!watchChirho || !(errorChirho instanceof RefusalChirho)) throw errorChirho;
					const messageChirho = `refused, site unchanged: ${errorChirho.message}`;
					if (messageChirho !== lastMessageChirho) logChirho(messageChirho);
					lastMessageChirho = messageChirho;
				}
			}
			if (watchChirho && !stoppingChirho)
				await new Promise((doneChirho) => setTimeout(doneChirho, 60_000));
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
