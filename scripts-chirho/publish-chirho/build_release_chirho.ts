// For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life. — John 3:16 (KJV)

// Deterministic local release builder for config-chirho/wrangler-publish-chirho.jsonc.
// Workflow: spec-chirho/research-chirho/26-10-27-publication-readiness-chirho.md
// Usage:
//   bun scripts-chirho/publish-chirho/build_release_chirho.ts [--allow-pending-media-chirho]
//       [--skip-build-chirho] [--root-chirho DIR]
//   bun scripts-chirho/publish-chirho/build_release_chirho.ts --verify-chirho [--review-chirho]
// Only a fresh `bun run build` of a clean, committed tree without pending media writes
// build-chirho/public-chirho, the one directory the publish config deploys. Anything else is a
// local review build in build-chirho/review-chirho. Exit 2: refused, nothing written.

import { verifiedVideoFactsChirho } from './video_rules_chirho';
import { addVerifiedTutorialFactsChirho } from './r2-chirho/tutorial-rules-chirho';
import { readEffectiveMediaDocumentsChirho } from './r2-chirho/scene-corrections-chirho';
import { spawnSync } from 'node:child_process';
import { mkdir, readdir, readFile, realpath, rename, rm, writeFile } from 'node:fs/promises';
import { homedir } from 'node:os';
import { dirname, join, resolve } from 'node:path';
import { verifyGlossesChirho } from './gloss_rules_chirho';
import { verifyAudioChirho } from './audio_rules_chirho';
import {
	LIBRARY_PATH_CHIRHO,
	SITEMAP_PATH_CHIRHO,
	verifyLibraryChirho,
	verifySitemapChirho
} from '../../src/lib/site-chirho/library-chirho';
import {
	r2ModeChirho,
	remoteMediaChirho,
	buildArtworkWorkerChirho,
	remoteReleaseIdChirho,
	type RemoteReleaseChirho
} from './r2-chirho/release-artwork-chirho';
import {
	ASSET_FILE_LIMIT_CHIRHO,
	ASSET_MAX_BYTES_CHIRHO,
	PREVIEW_HEADERS_CHIRHO,
	RELEASE_HEADERS_CHIRHO,
	RefusalChirho,
	classifyPathChirho,
	envSecretsChirho,
	mediaRecordsChirho,
	releaseFilesChirho,
	scanPrivateChirho,
	sha256Chirho,
	verifyContentChirho,
	verifyMediaChirho,
	verifyMediaIndexChirho,
	verifyMediaShardsChirho,
	type FilesChirho,
	type MediaRecordChirho,
	type MediaShardReportChirho,
	type ReleaseFileChirho
} from './release_rules_chirho';

export interface GitStateChirho {
	commit_chirho: string | null;
	clean_chirho: boolean;
}
export type ReleaseKindChirho = 'publishable' | 'local_review' | 'recorded_preview';
/** A recorded preview: built from a snapshot copy, under L.J.'s recorded preview authority. */
export interface PreviewChirho {
	authority_sha256_chirho: string;
	output_root_chirho: string;
	secret_paths_chirho: string[];
	snapshot_chirho: Record<string, unknown>;
}
export interface BuildOptionsChirho {
	root_chirho: string;
	allow_pending_media_chirho: boolean;
	fresh_build_chirho: boolean;
	git_chirho: GitStateChirho;
	local_paths_chirho: string[];
	preview_chirho?: PreviewChirho;
}
export interface ReleaseManifestChirho {
	schema_version_chirho: 1;
	release_kind_chirho: ReleaseKindChirho;
	preview_authority_sha256_chirho: string | null;
	snapshot_chirho: Record<string, unknown> | null;
	release_id_chirho: string;
	git_commit_chirho: string | null;
	git_clean_chirho: boolean;
	fresh_build_chirho: boolean;
	app_version_chirho: string | null;
	file_count_chirho: number;
	total_bytes_chirho: number;
	headers_sha256_chirho: string;
	excluded_server_artifacts_chirho: string[];
	content_chirho: { manifest_chirho: string; chapters_chirho: number }[];
	media_chirho: MediaRecordChirho[];
	media_shards_chirho: MediaShardReportChirho[];
	files_chirho: ReleaseFileChirho[];
	artwork_chirho?: RemoteReleaseChirho;
}

/** Reads a directory into memory in sorted order; links and special files are refused. */
export async function readTreeChirho(
	dirChirho: string,
	reasonsChirho: string[]
): Promise<FilesChirho> {
	const filesChirho: FilesChirho = new Map();
	async function walkChirho(relativeChirho: string): Promise<void> {
		const entriesChirho = await readdir(join(dirChirho, relativeChirho), { withFileTypes: true });
		entriesChirho.sort((aChirho, bChirho) => (aChirho.name < bChirho.name ? -1 : 1));
		for (const entryChirho of entriesChirho) {
			const pathChirho = relativeChirho
				? `${relativeChirho}/${entryChirho.name}`
				: entryChirho.name;
			if (entryChirho.isDirectory()) await walkChirho(pathChirho);
			else if (entryChirho.isFile())
				filesChirho.set(pathChirho, new Uint8Array(await readFile(join(dirChirho, pathChirho))));
			else reasonsChirho.push(`${pathChirho} is a link or special file`);
		}
	}
	await walkChirho('');
	return filesChirho;
}

export function readGitStateChirho(rootChirho: string): GitStateChirho {
	const gitChirho = (argumentsChirho: string[]) =>
		spawnSync('git', ['-C', rootChirho, ...argumentsChirho], { encoding: 'utf8' });
	const headChirho = gitChirho(['rev-parse', '--verify', 'HEAD']);
	if (headChirho.status !== 0) return { commit_chirho: null, clean_chirho: false };
	const statusChirho = gitChirho(['status', '--porcelain']);
	return {
		commit_chirho: headChirho.stdout.trim(),
		clean_chirho: statusChirho.status === 0 && statusChirho.stdout.trim() === ''
	};
}

async function readOptionalChirho(pathChirho: string): Promise<string> {
	return readFile(pathChirho, 'utf8').catch(() => '');
}

function appVersionChirho(filesChirho: FilesChirho): string | null {
	try {
		const versionChirho = JSON.parse(
			new TextDecoder().decode(filesChirho.get('_app/version.json') ?? new Uint8Array())
		) as { version?: unknown };
		return typeof versionChirho.version === 'string' ? versionChirho.version : null;
	} catch {
		return null;
	}
}

/** Workflow: media-delivery-chirho.md. Effective media plus retained archive-only aliases. */
export async function readMediaRecordsChirho(
	rootChirho: string,
	reasonsChirho: string[]
): Promise<MediaRecordChirho[]> {
	const recordsChirho: MediaRecordChirho[] = [];
	const effectiveChirho = await readEffectiveMediaDocumentsChirho(rootChirho, reasonsChirho).catch(
		(errorChirho: unknown) => {
			reasonsChirho.push(
				...(errorChirho instanceof RefusalChirho
					? errorChirho.reasonsChirho
					: [
							`Media inputs refused: ${errorChirho instanceof Error ? errorChirho.message : 'invalid documents'}`
						])
			);
			return null;
		}
	);
	if (!effectiveChirho) return recordsChirho;
	for (const {
		name_chirho: nameChirho,
		document_chirho: documentChirho
	} of effectiveChirho.documents_chirho) {
		try {
			recordsChirho.push(...mediaRecordsChirho(nameChirho, documentChirho, reasonsChirho));
		} catch {
			reasonsChirho.push(`data-chirho/media-chirho/${nameChirho} is not valid JSON`);
		}
	}
	return [...recordsChirho, ...effectiveChirho.retained_aliases_chirho];
}

/** Validates the adapter output and writes the release; throws RefusalChirho before any write. */
export async function buildReleaseChirho(optionsChirho: BuildOptionsChirho): Promise<{
	manifest_chirho: ReleaseManifestChirho;
	directory_chirho: string;
}> {
	const rootChirho = resolve(optionsChirho.root_chirho);
	const reasonsChirho: string[] = [];
	const remoteModeChirho = await r2ModeChirho(rootChirho);
	const sourceChirho = await readTreeChirho(
		join(rootChirho, '.svelte-kit', 'cloudflare'),
		reasonsChirho
	);
	if (!sourceChirho.has('index.html'))
		reasonsChirho.push(
			'.svelte-kit/cloudflare/index.html is missing; the root route must be prerendered'
		);
	const publicChirho: FilesChirho = new Map();
	const excludedChirho: string[] = [];
	for (const [pathChirho, bytesChirho] of sourceChirho) {
		const areaChirho = classifyPathChirho(pathChirho);
		if (remoteModeChirho && areaChirho === 'media') {
			reasonsChirho.push('R2 artwork release still contains a local raster');
			continue;
		}
		if (areaChirho === 'server') excludedChirho.push(pathChirho);
		else if (!['app', 'page', 'media', 'content', 'static'].includes(areaChirho))
			reasonsChirho.push(areaChirho);
		else if (bytesChirho.byteLength > ASSET_MAX_BYTES_CHIRHO)
			reasonsChirho.push(`${pathChirho} exceeds the 25 MiB static asset limit`);
		else publicChirho.set(pathChirho, bytesChirho);
	}
	if (
		[...publicChirho.keys()].filter(
			(pathChirho) =>
				!remoteModeChirho ||
				!/^audio-chirho\/sha256-chirho\/[a-f0-9]{64}-chirho\.mp3$/u.test(pathChirho)
		).length > ASSET_FILE_LIMIT_CHIRHO
	)
		reasonsChirho.push(
			`${publicChirho.size} files exceed the ${ASSET_FILE_LIMIT_CHIRHO}-file limit`
		);
	const declaredMediaChirho = await readMediaRecordsChirho(rootChirho, reasonsChirho);
	const remoteChirho = remoteModeChirho
		? await remoteMediaChirho(
				rootChirho,
				declaredMediaChirho,
				optionsChirho.allow_pending_media_chirho || Boolean(optionsChirho.preview_chirho),
				reasonsChirho
			)
		: null;
	const mediaChirho =
		remoteChirho?.media_chirho ??
		verifyMediaChirho(
			declaredMediaChirho,
			publicChirho,
			optionsChirho.allow_pending_media_chirho || Boolean(optionsChirho.preview_chirho),
			reasonsChirho
		);
	verifyMediaIndexChirho(publicChirho, mediaChirho, reasonsChirho);
	// A single WebP may have many word assignments; retain every source identity for defaults.
	const shardsChirho = verifyMediaShardsChirho(publicChirho, declaredMediaChirho, reasonsChirho);
	const contentChirho = verifyContentChirho(publicChirho, reasonsChirho);
	if (
		publicChirho.has(LIBRARY_PATH_CHIRHO) &&
		!verifyLibraryChirho(publicChirho.get(LIBRARY_PATH_CHIRHO))
	)
		reasonsChirho.push('Native book bootstrap differs from the public book registry');
	if (
		publicChirho.has(SITEMAP_PATH_CHIRHO) &&
		!verifySitemapChirho(publicChirho.get(SITEMAP_PATH_CHIRHO))
	)
		reasonsChirho.push('Sitemap differs from the public route registry');
	verifyGlossesChirho(publicChirho, reasonsChirho);
	verifyAudioChirho(
		publicChirho,
		optionsChirho.allow_pending_media_chirho || Boolean(optionsChirho.preview_chirho),
		reasonsChirho
	);
	const videoFactsChirho = await verifiedVideoFactsChirho(
		rootChirho,
		publicChirho,
		reasonsChirho,
		optionsChirho.allow_pending_media_chirho || Boolean(optionsChirho.preview_chirho)
	);
	await addVerifiedTutorialFactsChirho(rootChirho, publicChirho, reasonsChirho, videoFactsChirho);
	const previewChirho = optionsChirho.preview_chirho;
	const secretTextsChirho: string[] = [];
	for (const pathChirho of previewChirho?.secret_paths_chirho ?? [
		join(rootChirho, '.env'),
		join(rootChirho, '.dev.vars')
	])
		secretTextsChirho.push(await readOptionalChirho(pathChirho));
	const secretsChirho = envSecretsChirho(secretTextsChirho.join('\n'));
	if (previewChirho && !optionsChirho.fresh_build_chirho)
		reasonsChirho.push('a recorded preview must come from a fresh build of its snapshot');
	scanPrivateChirho(publicChirho, secretsChirho, optionsChirho.local_paths_chirho, reasonsChirho);
	if (reasonsChirho.length) throw new RefusalChirho(reasonsChirho);
	const buildRootChirho = join(
		resolve(previewChirho?.output_root_chirho ?? rootChirho),
		'build-chirho'
	);
	const workerBuildChirho = join(buildRootChirho, `.artwork-worker-build-chirho-${process.pid}`);
	const remoteDescriptionChirho = remoteChirho
		? await buildArtworkWorkerChirho(
				rootChirho,
				workerBuildChirho,
				publicChirho,
				remoteChirho,
				videoFactsChirho
			)
		: null;
	// The exact decoded/hash-checked audio enters the Worker allowlist before static retirement.
	if (remoteDescriptionChirho?.audio_objects_chirho) {
		for (const pathChirho of publicChirho.keys())
			if (/^audio-chirho\/sha256-chirho\/[a-f0-9]{64}-chirho\.mp3$/u.test(pathChirho))
				publicChirho.delete(pathChirho);
	}
	const workerBytesChirho = remoteDescriptionChirho
		? await readFile(join(workerBuildChirho, 'artwork-worker-chirho.mjs'))
		: null;
	if (workerBytesChirho)
		scanPrivateChirho(
			new Map([['artwork-worker-chirho.mjs', new Uint8Array(workerBytesChirho)]]),
			secretsChirho,
			optionsChirho.local_paths_chirho,
			reasonsChirho
		);
	if (reasonsChirho.length) throw new RefusalChirho(reasonsChirho);

	const headersChirho = previewChirho ? PREVIEW_HEADERS_CHIRHO : RELEASE_HEADERS_CHIRHO;
	const publishableChirho =
		!previewChirho &&
		!optionsChirho.allow_pending_media_chirho &&
		optionsChirho.fresh_build_chirho &&
		optionsChirho.git_chirho.clean_chirho &&
		optionsChirho.git_chirho.commit_chirho !== null;
	const { files_chirho: filesChirho, release_id_chirho: fileIdChirho } =
		releaseFilesChirho(publicChirho);
	const releaseIdChirho = remoteReleaseIdChirho(fileIdChirho, remoteDescriptionChirho);
	const manifestChirho: ReleaseManifestChirho = {
		schema_version_chirho: 1,
		release_kind_chirho: previewChirho
			? 'recorded_preview'
			: publishableChirho
				? 'publishable'
				: 'local_review',
		preview_authority_sha256_chirho: previewChirho?.authority_sha256_chirho ?? null,
		snapshot_chirho: previewChirho?.snapshot_chirho ?? null,
		release_id_chirho: releaseIdChirho,
		git_commit_chirho: optionsChirho.git_chirho.commit_chirho,
		git_clean_chirho: optionsChirho.git_chirho.clean_chirho,
		fresh_build_chirho: optionsChirho.fresh_build_chirho,
		app_version_chirho: appVersionChirho(publicChirho),
		file_count_chirho: filesChirho.length,
		total_bytes_chirho: filesChirho.reduce(
			(sumChirho, fileChirho) => sumChirho + fileChirho.bytes_chirho,
			0
		),
		headers_sha256_chirho: sha256Chirho(headersChirho),
		excluded_server_artifacts_chirho: excludedChirho.sort(),
		content_chirho: contentChirho,
		media_chirho: mediaChirho,
		media_shards_chirho: shardsChirho,
		files_chirho: filesChirho,
		...(remoteDescriptionChirho ? { artwork_chirho: remoteDescriptionChirho } : {})
	};
	const outChirho = releaseDirectoryChirho(buildRootChirho, manifestChirho.release_kind_chirho);
	const stagingChirho = join(buildRootChirho, `.staging-chirho-${process.pid}`);
	await rm(stagingChirho, { recursive: true, force: true });
	for (const [pathChirho, bytesChirho] of publicChirho) {
		const targetChirho = join(stagingChirho, 'public-chirho', pathChirho);
		await mkdir(dirname(targetChirho), { recursive: true });
		await writeFile(targetChirho, bytesChirho, { flag: 'wx' });
	}
	await writeFile(join(stagingChirho, 'public-chirho', '_headers'), headersChirho, {
		flag: 'wx'
	});
	await writeFile(
		join(stagingChirho, 'release-manifest-chirho.json'),
		`${JSON.stringify(manifestChirho, null, '\t')}\n`,
		{ flag: 'wx' }
	);
	if (workerBytesChirho)
		await writeFile(join(stagingChirho, 'artwork-worker-chirho.mjs'), workerBytesChirho, {
			flag: 'wx'
		});
	await mkdir(outChirho, { recursive: true });
	for (const nameChirho of [
		'public-chirho',
		'release-manifest-chirho.json',
		...(workerBytesChirho ? ['artwork-worker-chirho.mjs'] : [])
	]) {
		await rm(join(outChirho, nameChirho), { recursive: true, force: true });
		await rename(join(stagingChirho, nameChirho), join(outChirho, nameChirho));
	}
	await rm(stagingChirho, { recursive: true, force: true });
	if (workerBytesChirho) await rm(workerBuildChirho, { recursive: true, force: true });
	return { manifest_chirho: manifestChirho, directory_chirho: join(outChirho, 'public-chirho') };
}

export function releaseDirectoryChirho(buildRootChirho: string, kindChirho: ReleaseKindChirho) {
	return kindChirho === 'publishable'
		? buildRootChirho
		: join(buildRootChirho, kindChirho === 'recorded_preview' ? 'preview-chirho' : 'review-chirho');
}

/** Rechecks a written release against its manifest, and a publishable one against git HEAD. */
export async function verifyReleaseChirho(
	rootChirho: string,
	kindChirho: ReleaseKindChirho,
	gitChirho: GitStateChirho
): Promise<string[]> {
	const outChirho = releaseDirectoryChirho(join(resolve(rootChirho), 'build-chirho'), kindChirho);
	const reasonsChirho: string[] = [];
	const manifestChirho = JSON.parse(
		await readFile(join(outChirho, 'release-manifest-chirho.json'), 'utf8')
	) as ReleaseManifestChirho;
	const filesChirho = await readTreeChirho(join(outChirho, 'public-chirho'), reasonsChirho);
	const headersChirho = filesChirho.get('_headers');
	filesChirho.delete('_headers');
	const expectedHeadersChirho =
		kindChirho === 'recorded_preview' ? PREVIEW_HEADERS_CHIRHO : RELEASE_HEADERS_CHIRHO;
	if (!headersChirho || new TextDecoder().decode(headersChirho) !== expectedHeadersChirho)
		reasonsChirho.push('_headers differs from the release rules');
	if (manifestChirho.release_kind_chirho !== kindChirho)
		reasonsChirho.push(
			`the release manifest is ${manifestChirho.release_kind_chirho}, not ${kindChirho}`
		);
	if (
		remoteReleaseIdChirho(
			releaseFilesChirho(filesChirho).release_id_chirho,
			manifestChirho.artwork_chirho ?? null
		) !== manifestChirho.release_id_chirho
	)
		reasonsChirho.push('files on disk differ from release-manifest-chirho.json');
	if (manifestChirho.artwork_chirho) {
		const workerChirho = await readFile(join(outChirho, 'artwork-worker-chirho.mjs')).catch(
			() => null
		);
		if (
			!workerChirho ||
			sha256Chirho(workerChirho) !== manifestChirho.artwork_chirho.worker_sha256_chirho
		)
			reasonsChirho.push('artwork Worker differs from its release');
		if ([...filesChirho.keys()].some((pathChirho) => classifyPathChirho(pathChirho) === 'media'))
			reasonsChirho.push('R2 artwork release retains local image files');
	}
	if (
		kindChirho === 'publishable' &&
		(!gitChirho.clean_chirho || gitChirho.commit_chirho !== manifestChirho.git_commit_chirho)
	)
		reasonsChirho.push('the publishable release no longer matches a clean checkout of its commit');
	return reasonsChirho;
}

async function mainChirho(argumentsChirho: string[]): Promise<number> {
	const knownChirho = [
		'--allow-pending-media-chirho',
		'--skip-build-chirho',
		'--verify-chirho',
		'--review-chirho',
		'--preview-chirho',
		'--root-chirho'
	];
	const rootIndexChirho = argumentsChirho.indexOf('--root-chirho');
	const rootChirho = resolve(rootIndexChirho >= 0 ? argumentsChirho[rootIndexChirho + 1] : '.');
	const unknownChirho = argumentsChirho.filter(
		(argumentChirho, indexChirho) =>
			!knownChirho.includes(argumentChirho) && indexChirho !== rootIndexChirho + 1
	);
	if (unknownChirho.length || (rootIndexChirho >= 0 && !argumentsChirho[rootIndexChirho + 1])) {
		console.error(
			`Unsupported arguments: ${unknownChirho.join(' ') || '--root-chirho needs a value'}`
		);
		return 1;
	}
	if (argumentsChirho.includes('--verify-chirho')) {
		const reasonsChirho = await verifyReleaseChirho(
			rootChirho,
			argumentsChirho.includes('--preview-chirho')
				? 'recorded_preview'
				: argumentsChirho.includes('--review-chirho')
					? 'local_review'
					: 'publishable',
			readGitStateChirho(rootChirho)
		);
		console.log(
			reasonsChirho.length ? `Verify failed:\n- ${reasonsChirho.join('\n- ')}` : 'Release verified.'
		);
		return reasonsChirho.length ? 2 : 0;
	}
	const freshChirho = !argumentsChirho.includes('--skip-build-chirho');
	if (
		freshChirho &&
		spawnSync('bun', ['run', 'build'], { cwd: rootChirho, stdio: 'inherit' }).status !== 0
	) {
		console.error('bun run build failed; no release written.');
		return 1;
	}
	try {
		const { manifest_chirho: manifestChirho, directory_chirho: directoryChirho } =
			await buildReleaseChirho({
				root_chirho: rootChirho,
				allow_pending_media_chirho: argumentsChirho.includes('--allow-pending-media-chirho'),
				fresh_build_chirho: freshChirho,
				git_chirho: readGitStateChirho(rootChirho),
				local_paths_chirho: [
					...new Set([homedir(), rootChirho, await realpath(rootChirho)])
				].filter((pathChirho) => pathChirho.length >= 8)
			});
		const pendingChirho = manifestChirho.media_chirho.filter(
			(mediaChirho) => mediaChirho.art_review_chirho === 'pending'
		).length;
		console.log(
			[
				`${manifestChirho.release_kind_chirho === 'publishable' ? 'PUBLISHABLE' : 'LOCAL REVIEW ONLY'} release ${manifestChirho.release_id_chirho}`,
				directoryChirho,
				`${manifestChirho.file_count_chirho} files, ${manifestChirho.total_bytes_chirho} bytes; media ${manifestChirho.media_chirho.length} (${pendingChirho} pending); content manifests ${manifestChirho.content_chirho.length}`,
				`Excluded server artifacts: ${manifestChirho.excluded_server_artifacts_chirho.join(', ') || 'none'}`,
				/^\d{13}$/.test(manifestChirho.app_version_chirho ?? '')
					? 'Note: the SvelteKit version is a build timestamp, so rebuilding changes the release id; pin kit version.name to the commit for byte-reproducible releases.'
					: `App version ${manifestChirho.app_version_chirho ?? 'unknown'}.`,
				manifestChirho.release_kind_chirho === 'publishable'
					? 'Deploying it is a separate step that needs L.J.: bunx wrangler deploy --config config-chirho/wrangler-publish-chirho.jsonc'
					: 'Not deployable: built with pending media, a skipped build or an uncommitted tree.'
			].join('\n')
		);
		return 0;
	} catch (errorChirho) {
		if (!(errorChirho instanceof RefusalChirho)) throw errorChirho;
		console.error(errorChirho.message);
		return 2;
	}
}

if (import.meta.main) process.exitCode = await mainChirho(process.argv.slice(2));
