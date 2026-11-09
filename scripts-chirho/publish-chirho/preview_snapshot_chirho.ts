// For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life. — John 3:16 (KJV)

// Coherent preview snapshots. The build inputs are copied, application code is fingerprinted
// apart from media (code changes hold the cycle; media flows), and verified delivery
// derivatives replace the media bytes inside the copy only. Originals are never touched.
// Workflow: spec-chirho/research-chirho/26-10-27-publication-readiness-chirho.md (release cycle).

import { isBibleChapterPathChirho } from '../../src/lib/bible-chirho/books-chirho';
import { spawnSync } from 'node:child_process';
import {
	lstat,
	mkdir,
	readdir,
	readFile,
	realpath,
	rm,
	symlink,
	writeFile
} from 'node:fs/promises';
import { dirname, join, resolve, sep } from 'node:path';
import { readMediaRecordsChirho } from './build_release_chirho';
import { r2ModeChirho } from './r2-chirho/release-artwork-chirho';
import {
	readEffectiveMediaDocumentsChirho,
	sceneCorrectionInputPathsChirho,
	SCENE_CORRECTIONS_PATH_CHIRHO
} from './r2-chirho/scene-corrections-chirho';
import {
	RefusalChirho,
	deliveryEntriesChirho,
	deliveryProblemChirho,
	sha256Chirho
} from './release_rules_chirho';

// Inputs whose changes flow into previews automatically; every other input is code or content.
export const MEDIA_INPUT_PATTERN_CHIRHO =
	/^(?:data-chirho\/media-chirho\/|data-chirho\/art-corrections-chirho\/|data-chirho\/video-chirho\/|data-chirho\/delivery-chirho\/artwork-chirho\/|static\/assets-chirho\/|static\/media-chirho\/|static\/audio-chirho\/|data-chirho\/reader-chirho\/icon-reuse-chirho\/[0-9]{4}-chirho\/[a-z0-9-]+-chirho\.json$)/;
// Not build inputs: history, dependencies, outputs, private and fleet material, and tests/docs.
const SKIPPED_TOP_CHIRHO = new Set([
	'.git',
	'node_modules',
	'apps-chirho',
	'.svelte-kit',
	'build-chirho',
	'.wrangler',
	'test-results',
	'playwright-report',
	'workspace-chirho',
	'spec-chirho',
	'tests-chirho',
	'.playwright-mcp',
	'.ruff_cache',
	'.vscode',
	'AGENTS.md',
	'CLAUDE.md',
	'README.md'
]);
const SKIPPED_ANYWHERE_CHIRHO = new Set(['__pycache__', '.DS_Store']);
// Secrets never enter a snapshot: .env, .env.*, .dev.vars and .dev.vars.* at any depth.
const SECRET_NAME_CHIRHO = /^(?:\.env|\.dev\.vars)(?:\..*)?$/;

export interface SnapshotChirho {
	directory_chirho: string;
	code_fingerprint_chirho: string;
	media_fingerprint_chirho: string;
	input_files_chirho: number;
}
export interface OverlayReportChirho {
	mapping_sha256_chirho: string;
	encoder_chirho: unknown;
	records_chirho: number;
	source_bytes_chirho: number;
	delivery_bytes_chirho: number;
	overlaid_chirho: {
		asset_path_chirho: string;
		source_sha256_chirho: string;
		delivery_sha256_chirho: string;
		recipe_chirho: Record<string, unknown>;
	}[];
}

/** Freeze authoring records before their proof index; later producer additions wait for the next release. */
export async function snapshotArtworkInputsChirho(rootChirho: string) {
	const homeChirho = await realpath(rootChirho);
	const metadataChirho = new Map<string, Uint8Array>();
	async function captureChirho(pathChirho: string, maximumChirho: number) {
		const absoluteChirho = join(homeChirho, pathChirho);
		if ((await realpath(dirname(absoluteChirho))) !== dirname(absoluteChirho))
			throw new RefusalChirho(['artwork snapshot parent is redirected']);
		const infoChirho = await lstat(absoluteChirho);
		if (!infoChirho.isFile() || infoChirho.size > maximumChirho)
			throw new RefusalChirho(['artwork snapshot input is not a bounded regular file']);
		const bytesChirho = await readFile(absoluteChirho);
		if (bytesChirho.length > maximumChirho)
			throw new RefusalChirho(['artwork snapshot input changed beyond its bound']);
		metadataChirho.set(pathChirho, bytesChirho);
		return bytesChirho;
	}
	const correctionBytesChirho = await captureChirho(
		SCENE_CORRECTIONS_PATH_CHIRHO,
		512 * 1024
	).catch((errorChirho: NodeJS.ErrnoException) => {
		if (errorChirho.code === 'ENOENT') return null;
		throw errorChirho;
	});
	if (correctionBytesChirho)
		for (const inputPathChirho of sceneCorrectionInputPathsChirho(correctionBytesChirho))
			await captureChirho(inputPathChirho, 4 * 1024 ** 2);
	const manifestsChirho = (await readdir(join(homeChirho, 'data-chirho/media-chirho')))
		.filter((nameChirho) => nameChirho.endsWith('.json'))
		.sort();
	if (manifestsChirho.length > 256)
		throw new RefusalChirho(['artwork manifest scope needs cold retirement']);
	for (const nameChirho of manifestsChirho) {
		if (!/^[a-z0-9][a-z0-9-]*\.json$/u.test(nameChirho))
			throw new RefusalChirho(['artwork manifest path is invalid']);
		await captureChirho('data-chirho/media-chirho/' + nameChirho, 64 * 1024 ** 2);
	}
	const prefixChirho = 'data-chirho/delivery-chirho/artwork-chirho/';
	const indexChirho = JSON.parse(
		Buffer.from(await captureChirho(prefixChirho + 'index-chirho.json', 128 * 1024)).toString(
			'utf8'
		)
	) as {
		shards_chirho?: { path_chirho: string; sha256_chirho: string }[];
	};
	if (!Array.isArray(indexChirho.shards_chirho) || indexChirho.shards_chirho.length > 256)
		throw new RefusalChirho(['artwork proof index is invalid']);
	const seenChirho = new Set<string>();
	for (const shardChirho of indexChirho.shards_chirho) {
		if (
			!/^objects-chirho\/[a-f0-9]{2}-chirho\.json$/u.test(shardChirho.path_chirho) ||
			seenChirho.has(shardChirho.path_chirho)
		)
			throw new RefusalChirho(['artwork proof shard path is invalid']);
		seenChirho.add(shardChirho.path_chirho);
		const bytesChirho = await captureChirho(prefixChirho + shardChirho.path_chirho, 2 * 1024 ** 2);
		if (sha256Chirho(bytesChirho) !== shardChirho.sha256_chirho)
			throw new RefusalChirho([
				'artwork proof changed during snapshot; retry from the completed index'
			]);
	}
	const correctionAfterChirho = await captureChirho(
		SCENE_CORRECTIONS_PATH_CHIRHO,
		512 * 1024
	).catch((errorChirho: NodeJS.ErrnoException) => {
		if (errorChirho.code === 'ENOENT') return null;
		throw errorChirho;
	});
	if (
		(correctionBytesChirho === null) !== (correctionAfterChirho === null) ||
		(correctionBytesChirho &&
			correctionAfterChirho &&
			!Buffer.from(correctionBytesChirho).equals(correctionAfterChirho))
	)
		throw new RefusalChirho(['scene correction changed during artwork snapshot']);
	return metadataChirho;
}

/** Freeze reachable audio metadata first; received but unpublished worker files stay on the Mac. */
export async function snapshotAudioInputsChirho(rootChirho: string) {
	const manifestPathChirho = 'static/audio-chirho/manifest-chirho.json';
	const bytesChirho = await readFile(join(rootChirho, manifestPathChirho)).catch(
		(errorChirho: NodeJS.ErrnoException) => {
			if (errorChirho.code === 'ENOENT') return null;
			throw errorChirho;
		}
	);
	if (!bytesChirho) return null;
	if (bytesChirho.length > 2_000_000) throw new RefusalChirho(['audio manifest oversized']);
	const metadataChirho = new Map([[manifestPathChirho, bytesChirho]]);
	const assetsChirho = new Set<string>();
	const manifestChirho = JSON.parse(bytesChirho.toString('utf8'));
	if (manifestChirho.schema_version_chirho !== 1 || !manifestChirho.books_chirho)
		throw new RefusalChirho(['audio manifest invalid']);
	let countChirho = 0;
	for (const bookChirho of Object.values(manifestChirho.books_chirho) as {
		chapters_chirho: { path_chirho: string; sha256_chirho: string }[];
	}[]) {
		if (!Array.isArray(bookChirho.chapters_chirho))
			throw new RefusalChirho(['audio chapters invalid']);
		for (const chapterChirho of bookChirho.chapters_chirho) {
			if (
				++countChirho > 1200 ||
				!isBibleChapterPathChirho(chapterChirho.path_chirho, '/audio-chirho/')
			)
				throw new RefusalChirho(['audio chapter scope invalid']);
			const pathChirho = 'static' + chapterChirho.path_chirho;
			const dataChirho = await readFile(join(rootChirho, pathChirho));
			if (dataChirho.length > 2_000_000 || sha256Chirho(dataChirho) !== chapterChirho.sha256_chirho)
				throw new RefusalChirho([
					'audio catalogue changed during snapshot; retry from its published manifest'
				]);
			metadataChirho.set(pathChirho, dataChirho);
			const catalogueChirho = JSON.parse(dataChirho.toString('utf8'));
			const readingsChirho = catalogueChirho.readings_chirho ?? [];
			if (
				!Array.isArray(catalogueChirho.clips_chirho) ||
				!Array.isArray(readingsChirho) ||
				catalogueChirho.clips_chirho.length + readingsChirho.length > 2000
			)
				throw new RefusalChirho(['audio clips invalid']);
			const valuesChirho = [...catalogueChirho.clips_chirho, ...readingsChirho];
			for (const clipChirho of valuesChirho) {
				if (
					!/^\/audio-chirho\/sha256-chirho\/[a-f0-9]{64}-chirho\.mp3$/u.test(
						clipChirho.asset_path_chirho
					)
				)
					throw new RefusalChirho(['audio asset path invalid']);
				assetsChirho.add('static' + clipChirho.asset_path_chirho);
			}
		}
	}
	return { metadata_chirho: metadataChirho, assets_chirho: assetsChirho };
}

/** Shared review data may flow as media only when its frozen assignments are still current. */
export async function verifySnapshotReuseChirho(snapshotChirho: string): Promise<void> {
	const reviewFolderChirho = join(
		snapshotChirho,
		'data-chirho',
		'reader-chirho',
		'icon-reuse-chirho'
	);
	if (!(await readdir(reviewFolderChirho).catch(() => [])).length) return;
	const resultChirho = spawnSync(
		'python3',
		[
			'-B',
			join(snapshotChirho, 'scripts-chirho', 'art-chirho', 'reuse_icons_chirho.py'),
			'--check-chirho'
		],
		{ cwd: snapshotChirho, encoding: 'utf8' }
	);
	if (resultChirho.status !== 0)
		throw new RefusalChirho([
			`shared icon assignments are stale or invalid: ${(resultChirho.stderr || resultChirho.stdout || '').trim().slice(-500)}`
		]);
}

/** Copies the build inputs into a fresh directory and fingerprints code apart from media. */
export async function copySnapshotChirho(
	rootChirho: string,
	directoryChirho: string
): Promise<SnapshotChirho> {
	const allowedChirho = join(resolve(rootChirho), 'build-chirho', 'release-cycle-chirho') + sep;
	if (!resolve(directoryChirho).startsWith(allowedChirho))
		throw new RefusalChirho([`a snapshot may only replace a directory under ${allowedChirho}`]);
	await rm(directoryChirho, { recursive: true, force: true });
	await mkdir(directoryChirho, { recursive: true });
	const codeChirho: string[] = [];
	const mediaChirho: string[] = [];
	const copiedPathsChirho = new Set<string>();
	const audioChirho = await snapshotAudioInputsChirho(rootChirho);
	const remoteArtworkChirho = await r2ModeChirho(rootChirho);
	const artworkChirho = remoteArtworkChirho ? await snapshotArtworkInputsChirho(rootChirho) : null;
	async function walkChirho(relativeChirho: string): Promise<void> {
		const entriesChirho = await readdir(join(rootChirho, relativeChirho), { withFileTypes: true });
		entriesChirho.sort((aChirho, bChirho) => (aChirho.name < bChirho.name ? -1 : 1));
		for (const entryChirho of entriesChirho) {
			if (
				(!relativeChirho && SKIPPED_TOP_CHIRHO.has(entryChirho.name)) ||
				SKIPPED_ANYWHERE_CHIRHO.has(entryChirho.name) ||
				SECRET_NAME_CHIRHO.test(entryChirho.name)
			)
				continue;
			const pathChirho = relativeChirho
				? `${relativeChirho}/${entryChirho.name}`
				: entryChirho.name;
			if (remoteArtworkChirho && pathChirho === 'static/assets-chirho') continue;
			// Cold acquisition/production inventories are not application inputs; chapters carry provenance.
			if (pathChirho === 'data-chirho/bible-chirho') continue;
			if (entryChirho.isDirectory()) {
				await mkdir(join(directoryChirho, pathChirho));
				await walkChirho(pathChirho);
			} else if (entryChirho.isFile()) {
				if (
					artworkChirho &&
					/^(?:data-chirho\/media-chirho\/.*\.json|data-chirho\/art-corrections-chirho\/|data-chirho\/delivery-chirho\/artwork-chirho\/)/u.test(
						pathChirho
					) &&
					!artworkChirho.has(pathChirho)
				)
					continue;
				if (
					audioChirho &&
					((/^static\/audio-chirho\/sha256-chirho\/[a-f0-9]{64}-chirho\.mp3$/u.test(pathChirho) &&
						!audioChirho.assets_chirho.has(pathChirho)) ||
						(isBibleChapterPathChirho(pathChirho, 'static/audio-chirho/') &&
							!audioChirho.metadata_chirho.has(pathChirho)))
				)
					continue;
				const bytesChirho =
					artworkChirho?.get(pathChirho) ??
					audioChirho?.metadata_chirho.get(pathChirho) ??
					(await readFile(join(rootChirho, pathChirho)));
				await writeFile(join(directoryChirho, pathChirho), bytesChirho);
				copiedPathsChirho.add(pathChirho);
				(MEDIA_INPUT_PATTERN_CHIRHO.test(pathChirho) ? mediaChirho : codeChirho).push(
					`${pathChirho}\0${sha256Chirho(bytesChirho)}`
				);
			}
		}
	}
	await walkChirho('');
	// A captured correction/source/proof must survive even if its live directory changes later.
	for (const [pathChirho, bytesChirho] of artworkChirho ?? []) {
		if (copiedPathsChirho.has(pathChirho)) continue;
		await mkdir(dirname(join(directoryChirho, pathChirho)), { recursive: true });
		await writeFile(join(directoryChirho, pathChirho), bytesChirho);
		(MEDIA_INPUT_PATTERN_CHIRHO.test(pathChirho) ? mediaChirho : codeChirho).push(
			`${pathChirho}\0${sha256Chirho(bytesChirho)}`
		);
	}
	codeChirho.sort();
	mediaChirho.sort();
	await symlink(join(rootChirho, 'node_modules'), join(directoryChirho, 'node_modules'));
	return {
		directory_chirho: directoryChirho,
		code_fingerprint_chirho: sha256Chirho(codeChirho.join('\n')),
		media_fingerprint_chirho: sha256Chirho(mediaChirho.join('\n')),
		input_files_chirho: codeChirho.length + mediaChirho.length
	};
}

/** After release verification, retire duplicate compiler output; preserve the public artifact. */
export async function retireSnapshotBuildChirho(
	rootChirho: string,
	directoryChirho: string
): Promise<void> {
	// Workflow: media-delivery-chirho.md. Never accept a caller-selected cleanup target.
	const expectedChirho = join(
		await realpath(rootChirho),
		'build-chirho',
		'release-cycle-chirho',
		'snapshot-chirho'
	);
	if ((await realpath(directoryChirho)) !== expectedChirho)
		throw new RefusalChirho(['compiler cleanup requires the owned release snapshot']);
	await rm(join(expectedChirho, '.svelte-kit'), { recursive: true, force: true });
}

/**
 * Replaces every media record's bytes in the snapshot with its verified derivative, keeping the
 * public asset path, and rewrites that record's sha256/size (and matching presentation sizes).
 * Coverage is checked against the snapshot's own records: any record without a verified
 * derivative refuses the snapshot.
 */
export async function overlayDeliveryChirho(
	snapshotChirho: string,
	deliveryFolderChirho: string
): Promise<OverlayReportChirho> {
	const reasonsChirho: string[] = [];
	await readMediaRecordsChirho(snapshotChirho, reasonsChirho);
	const mappingBytesChirho = await readFile(
		join(deliveryFolderChirho, 'mapping-chirho.json')
	).catch(() => null);
	if (!mappingBytesChirho) throw new RefusalChirho(['no delivery mapping-chirho.json yet']);
	let mappingChirho: { encoder_chirho?: unknown } = {};
	try {
		mappingChirho = JSON.parse(
			new TextDecoder('utf-8', { fatal: true }).decode(mappingBytesChirho)
		);
	} catch {
		reasonsChirho.push('mapping-chirho.json is not valid UTF-8 JSON');
	}
	const entriesChirho = deliveryEntriesChirho(mappingChirho, reasonsChirho);
	if (reasonsChirho.length) throw new RefusalChirho(reasonsChirho);
	const reportChirho: OverlayReportChirho = {
		mapping_sha256_chirho: sha256Chirho(mappingBytesChirho),
		encoder_chirho: mappingChirho.encoder_chirho ?? null,
		records_chirho: 0,
		source_bytes_chirho: 0,
		delivery_bytes_chirho: 0,
		overlaid_chirho: []
	};
	const verifiedChirho = new Map<string, Uint8Array>();
	// asset path -> [declared source sha256, delivery sha256] once its original bytes are checked.
	const pathsDoneChirho = new Map<string, [string, string]>();
	const sizesChirho = new Map<string, [number, number]>();
	const missingChirho: string[] = [];
	const mediaFolderChirho = join(snapshotChirho, 'data-chirho', 'media-chirho');
	const effectiveChirho = await readEffectiveMediaDocumentsChirho(snapshotChirho);
	const documentsChirho = effectiveChirho.documents_chirho.map((documentChirho) => ({
		path_chirho: join(mediaFolderChirho, documentChirho.name_chirho) as string | null,
		document_chirho: documentChirho.document_chirho
	}));
	if (effectiveChirho.retained_scenes_chirho.length)
		documentsChirho.push({
			path_chirho: null,
			document_chirho: { scenes_chirho: effectiveChirho.retained_scenes_chirho }
		});
	for (const documentChirho of documentsChirho) {
		const manifestChirho = documentChirho.document_chirho;
		for (const [keyChirho, kindChirho] of [
			['icons_chirho', 'icon'],
			['scenes_chirho', 'scene']
		] as const) {
			const itemsChirho = manifestChirho[keyChirho];
			if (itemsChirho !== undefined && !Array.isArray(itemsChirho))
				throw new Error('Media collection is not an array');
			for (const itemChirho of Array.isArray(itemsChirho) ? itemsChirho : []) {
				reportChirho.records_chirho++;
				const entryChirho = entriesChirho.get(`${kindChirho}:${itemChirho.sha256_chirho}`);
				if (!entryChirho) {
					missingChirho.push(itemChirho.asset_path_chirho);
					continue;
				}
				let bytesChirho = verifiedChirho.get(entryChirho.delivery_sha256_chirho);
				if (!bytesChirho) {
					const rawChirho = await readFile(
						join(deliveryFolderChirho, entryChirho.delivery_path_chirho)
					).catch(() => null);
					const problemChirho = rawChirho
						? deliveryProblemChirho(entryChirho, new Uint8Array(rawChirho))
						: `${entryChirho.delivery_path_chirho} is missing`;
					if (problemChirho || !rawChirho) {
						reasonsChirho.push(problemChirho ?? 'unreadable derivative');
						continue;
					}
					bytesChirho = new Uint8Array(rawChirho);
					verifiedChirho.set(entryChirho.delivery_sha256_chirho, bytesChirho);
				}
				const targetChirho = join(snapshotChirho, 'static', itemChirho.asset_path_chirho.slice(1));
				const doneChirho = pathsDoneChirho.get(itemChirho.asset_path_chirho);
				if (doneChirho) {
					if (
						doneChirho[0] !== itemChirho.sha256_chirho ||
						doneChirho[1] !== entryChirho.delivery_sha256_chirho
					)
						reasonsChirho.push(
							`${itemChirho.asset_path_chirho} is declared with different sources`
						);
				} else {
					const originalChirho = await readFile(targetChirho).catch(() => null);
					if (!originalChirho || sha256Chirho(originalChirho) !== itemChirho.sha256_chirho) {
						reasonsChirho.push(
							`${itemChirho.asset_path_chirho} original bytes do not match its declared sha256`
						);
						continue;
					}
					pathsDoneChirho.set(itemChirho.asset_path_chirho, [
						itemChirho.sha256_chirho,
						entryChirho.delivery_sha256_chirho
					]);
					reportChirho.source_bytes_chirho += originalChirho.byteLength;
					reportChirho.delivery_bytes_chirho += bytesChirho.byteLength;
					await writeFile(targetChirho, bytesChirho);
				}
				reportChirho.overlaid_chirho.push({
					asset_path_chirho: itemChirho.asset_path_chirho,
					source_sha256_chirho: itemChirho.sha256_chirho,
					delivery_sha256_chirho: entryChirho.delivery_sha256_chirho,
					recipe_chirho: entryChirho.recipe_chirho
				});
				itemChirho.sha256_chirho = entryChirho.delivery_sha256_chirho;
				itemChirho.width_chirho = entryChirho.width_chirho;
				itemChirho.height_chirho = entryChirho.height_chirho;
				sizesChirho.set(itemChirho.asset_path_chirho, [
					entryChirho.width_chirho,
					entryChirho.height_chirho
				]);
			}
		}
		if (documentChirho.path_chirho)
			await writeFile(
				documentChirho.path_chirho,
				`${JSON.stringify(manifestChirho, null, '\t')}\n`
			);
	}
	if (missingChirho.length)
		reasonsChirho.push(
			`${missingChirho.length} media record(s) have no verified delivery derivative yet (first: ${missingChirho[0]})`
		);
	if (reasonsChirho.length) throw new RefusalChirho(reasonsChirho);
	const readerFolderChirho = join(snapshotChirho, 'data-chirho', 'reader-chirho');
	for (const nameChirho of (await readdir(readerFolderChirho).catch(() => [] as string[])).sort()) {
		if (!nameChirho.endsWith('-presentation-chirho.json')) continue;
		const recordChirho = JSON.parse(await readFile(join(readerFolderChirho, nameChirho), 'utf8'));
		const sizeChirho = sizesChirho.get(recordChirho.asset_path_chirho);
		if (!sizeChirho) continue;
		[recordChirho.width_chirho, recordChirho.height_chirho] = sizeChirho;
		await writeFile(
			join(readerFolderChirho, nameChirho),
			`${JSON.stringify(recordChirho, null, '\t')}\n`
		);
	}
	return reportChirho;
}

/** Rebuilds the snapshot's media shards with the snapshot's own refresher copy. */
export function refreshSnapshotShardsChirho(snapshotChirho: string): void {
	const resultChirho = spawnSync(
		'python3',
		[
			'-I',
			'-B',
			join(snapshotChirho, 'scripts-chirho', 'art-chirho', 'refresh_sharded_media_chirho.py'),
			'--once'
		],
		{ cwd: snapshotChirho, encoding: 'utf8' }
	);
	if (resultChirho.status !== 0)
		throw new RefusalChirho([
			`snapshot media shards refused: ${(resultChirho.stdout + resultChirho.stderr).trim().slice(-400)}`
		]);
}
