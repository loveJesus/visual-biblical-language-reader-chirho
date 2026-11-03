// For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life. — John 3:16 (KJV)

import { mkdir, readFile, rm, symlink, writeFile } from 'node:fs/promises';
import { dirname, join, resolve } from 'node:path';
import { parseConfigFileTextToJson } from 'typescript';
import { afterEach, describe, expect, it } from 'vitest';
import {
	buildReleaseChirho,
	verifyReleaseChirho
} from '../../scripts-chirho/publish-chirho/build_release_chirho';
import {
	copySnapshotChirho,
	snapshotArtworkInputsChirho,
	overlayDeliveryChirho,
	retireSnapshotBuildChirho,
	verifySnapshotReuseChirho
} from '../../scripts-chirho/publish-chirho/preview_snapshot_chirho';
import {
	baselineDecisionChirho,
	cycleDueChirho,
	readAuthorityChirho,
	requireLocalProbeChirho
} from '../../scripts-chirho/publish-chirho/release_cycle_chirho';
import {
	PREVIEW_HEADERS_CHIRHO,
	RefusalChirho,
	sha256Chirho
} from '../../scripts-chirho/publish-chirho/release_rules_chirho';
import {
	baseProjectChirho,
	temporaryRootChirho,
	webpChirho,
	writeProjectChirho,
	type ProjectChirho
} from './support-chirho';
import {
	checkedArtworkChirho,
	type ArtworkCatalogueChirho
} from '../../scripts-chirho/publish-chirho/r2-chirho/catalogue-chirho';
import type { MediaRecordChirho } from '../../scripts-chirho/publish-chirho/release_rules_chirho';

const rootsChirho: string[] = [];
const REPO_CHIRHO = resolve(import.meta.dirname, '../..');

it('freezes the image list with its proof bytes before a producer adds the next batch', async () => {
	const rootChirho = await temporaryRootChirho();
	rootsChirho.push(rootChirho);
	const mediaPathChirho = 'data-chirho/media-chirho/example-icons-chirho.json';
	const prefixChirho = 'data-chirho/delivery-chirho/artwork-chirho/';
	const shardPathChirho = 'objects-chirho/ab-chirho.json';
	const firstMediaChirho = JSON.stringify({ schema_version_chirho: 1, icons_chirho: [] });
	const firstProofChirho = JSON.stringify({ schema_version_chirho: 1, entries_chirho: [] });
	async function writeInputChirho(pathChirho: string, textChirho: string) {
		const targetChirho = join(rootChirho, pathChirho);
		await mkdir(dirname(targetChirho), { recursive: true });
		await writeFile(targetChirho, textChirho);
	}
	async function writeVersionChirho(mediaChirho: string, proofChirho: string) {
		await writeInputChirho(mediaPathChirho, mediaChirho);
		await writeInputChirho(prefixChirho + shardPathChirho, proofChirho);
		await writeInputChirho(
			prefixChirho + 'index-chirho.json',
			JSON.stringify({
				schema_version_chirho: 1,
				shards_chirho: [{ path_chirho: shardPathChirho, sha256_chirho: sha256Chirho(proofChirho) }]
			})
		);
	}
	await writeVersionChirho(firstMediaChirho, firstProofChirho);
	const frozenChirho = await snapshotArtworkInputsChirho(rootChirho);
	const nextMediaChirho = JSON.stringify({
		schema_version_chirho: 1,
		icons_chirho: [{ id_chirho: 'next-batch-chirho' }]
	});
	const nextProofChirho = JSON.stringify({
		schema_version_chirho: 1,
		entries_chirho: [{ id_chirho: 'next-proof-chirho' }]
	});
	await writeVersionChirho(nextMediaChirho, nextProofChirho);
	expect(Buffer.from(frozenChirho.get(mediaPathChirho)!).toString()).toBe(firstMediaChirho);
	expect(Buffer.from(frozenChirho.get(prefixChirho + shardPathChirho)!).toString()).toBe(
		firstProofChirho
	);
	const freshChirho = await snapshotArtworkInputsChirho(rootChirho);
	expect(Buffer.from(freshChirho.get(mediaPathChirho)!).toString()).toBe(nextMediaChirho);
	await writeInputChirho(prefixChirho + shardPathChirho, firstProofChirho);
	await expect(snapshotArtworkInputsChirho(rootChirho)).rejects.toBeInstanceOf(RefusalChirho);
});

it('keeps an unfinished remote upload as a release refusal and resumes only with exact proof', () => {
	const recordChirho: MediaRecordChirho = {
		asset_path_chirho: '/assets-chirho/example-chirho.webp',
		sha256_chirho: 'a'.repeat(64),
		width_chirho: 128,
		height_chirho: 128,
		art_review_chirho: 'pending',
		kind_chirho: 'icon'
	};
	const catalogueChirho: ArtworkCatalogueChirho = {
		entries_chirho: new Map(),
		index_sha256_chirho: 'b'.repeat(64)
	};
	expect(() => checkedArtworkChirho(catalogueChirho, recordChirho)).toThrow(RefusalChirho);
	const proofChirho = {
		key_chirho: 'media-chirho/sha256-chirho/' + recordChirho.sha256_chirho + '.webp',
		sha256_chirho: recordChirho.sha256_chirho,
		bytes_chirho: 100,
		width_chirho: 128,
		height_chirho: 128,
		lossy_chirho: true,
		verified_at_chirho: new Date().toISOString()
	};
	const entryChirho = {
		kind_chirho: 'icon' as const,
		source_paths_chirho: [recordChirho.asset_path_chirho],
		source_chirho: proofChirho,
		delivery_chirho: proofChirho,
		recipe_chirho: {}
	};
	catalogueChirho.entries_chirho.set('icon:' + recordChirho.sha256_chirho, entryChirho);
	expect(checkedArtworkChirho(catalogueChirho, recordChirho)).toBe(entryChirho);
	expect(() =>
		checkedArtworkChirho(catalogueChirho, { ...recordChirho, width_chirho: 127 })
	).toThrow(RefusalChirho);
});

it('holds a failed local probe without leaking child output and permits a later successful check', async () => {
	await expect(
		requireLocalProbeChirho(async () => {
			throw new Error('spawn EBADF private-child-output-chirho');
		})
	).rejects.toThrow('local preview probe could not run; no deployment attempted');
	await expect(requireLocalProbeChirho(async () => ['root page'])).rejects.toBeInstanceOf(
		RefusalChirho
	);
	await expect(requireLocalProbeChirho(async () => [])).resolves.toBeUndefined();
});

afterEach(async () => {
	await Promise.all(
		rootsChirho.splice(0).map((rootChirho) => rm(rootChirho, { recursive: true, force: true }))
	);
});

async function fixtureChirho(): Promise<ProjectChirho> {
	const rootChirho = await temporaryRootChirho();
	rootsChirho.push(rootChirho);
	const projectChirho = baseProjectChirho(rootChirho);
	for (const mediaChirho of projectChirho.media_chirho) mediaChirho.art_review_chirho = 'pending';
	await writeProjectChirho(projectChirho);
	return projectChirho;
}

/** Writes derivatives and a mapping for each declared record except `skipChirho` kinds. */
async function deliveryChirho(
	projectChirho: ProjectChirho,
	skipChirho: string[] = []
): Promise<string> {
	const folderChirho = join(projectChirho.root_chirho, 'build-chirho', 'delivery-media-chirho');
	const entriesChirho = [];
	for (const mediaChirho of projectChirho.media_chirho) {
		const kindChirho = mediaChirho.key_chirho === 'icons_chirho' ? 'icon' : 'scene';
		if (skipChirho.includes(kindChirho)) continue;
		const [widthChirho, heightChirho] = kindChirho === 'icon' ? [64, 64] : [300, 225];
		const bytesChirho = webpChirho(widthChirho, heightChirho);
		const shaChirho = sha256Chirho(bytesChirho);
		const pathChirho = `objects-chirho/${shaChirho.slice(0, 2)}-chirho/${shaChirho}-chirho.webp`;
		await mkdir(dirname(join(folderChirho, pathChirho)), { recursive: true });
		await writeFile(join(folderChirho, pathChirho), bytesChirho);
		entriesChirho.push({
			source_paths_chirho: [String(mediaChirho.asset_path_chirho)],
			source_sha256_chirho: String(mediaChirho.sha256_chirho),
			kind_chirho: kindChirho,
			delivery_path_chirho: pathChirho,
			delivery_sha256_chirho: shaChirho,
			bytes_chirho: bytesChirho.byteLength,
			width_chirho: widthChirho,
			height_chirho: heightChirho,
			recipe_chirho: { quality_chirho: 80 }
		});
	}
	await writeFile(
		join(folderChirho, 'mapping-chirho.json'),
		JSON.stringify({ schema_version_chirho: 1, entries_chirho: entriesChirho })
	);
	return folderChirho;
}

describe('recorded preview snapshot and overlay', () => {
	it('retires only verified-snapshot compiler output while retaining inputs and public evidence', async () => {
		const rootChirho = await temporaryRootChirho();
		rootsChirho.push(rootChirho);
		const snapshotChirho = join(rootChirho, 'build-chirho/release-cycle-chirho/snapshot-chirho');
		const compilerChirho = join(snapshotChirho, '.svelte-kit/output/chunk-chirho.js');
		const sourceChirho = join(snapshotChirho, 'static/source-chirho.webp');
		const publicChirho = join(
			rootChirho,
			'build-chirho/preview-chirho/public-chirho/a-chirho.webp'
		);
		for (const pathChirho of [compilerChirho, sourceChirho, publicChirho]) {
			await mkdir(dirname(pathChirho), { recursive: true });
			await writeFile(pathChirho, 'retained-by-scope-chirho');
		}
		await expect(retireSnapshotBuildChirho(rootChirho, rootChirho)).rejects.toBeInstanceOf(
			RefusalChirho
		);
		await expect(readFile(compilerChirho, 'utf8')).resolves.toBe('retained-by-scope-chirho');
		await retireSnapshotBuildChirho(rootChirho, snapshotChirho);
		await expect(readFile(compilerChirho)).rejects.toThrow();
		for (const pathChirho of [sourceChirho, publicChirho])
			await expect(readFile(pathChirho, 'utf8')).resolves.toBe('retained-by-scope-chirho');
		await expect(retireSnapshotBuildChirho(rootChirho, snapshotChirho)).resolves.toBeUndefined();
	});
	it('refuses a redirected snapshot and does not follow a compiler-directory symlink', async () => {
		const rootChirho = await temporaryRootChirho();
		rootsChirho.push(rootChirho);
		const snapshotChirho = join(rootChirho, 'build-chirho/release-cycle-chirho/snapshot-chirho');
		const outsideChirho = join(rootChirho, 'originals-chirho');
		await mkdir(dirname(snapshotChirho), { recursive: true });
		await mkdir(outsideChirho);
		const evidenceChirho = join(outsideChirho, 'original-chirho.webp');
		await writeFile(evidenceChirho, 'original-chirho');
		await symlink(outsideChirho, snapshotChirho);
		await expect(retireSnapshotBuildChirho(rootChirho, snapshotChirho)).rejects.toBeInstanceOf(
			RefusalChirho
		);
		await rm(snapshotChirho);
		await mkdir(snapshotChirho);
		await symlink(outsideChirho, join(snapshotChirho, '.svelte-kit'));
		await retireSnapshotBuildChirho(rootChirho, snapshotChirho);
		await expect(readFile(evidenceChirho, 'utf8')).resolves.toBe('original-chirho');
	});

	it('overlays verified derivatives on every record, keeping public paths', async () => {
		const projectChirho = await fixtureChirho();
		const rootChirho = projectChirho.root_chirho;
		const presentationChirho = join(
			rootChirho,
			'data-chirho',
			'reader-chirho',
			'a-presentation-chirho.json'
		);
		await mkdir(dirname(presentationChirho), { recursive: true });
		await writeFile(
			presentationChirho,
			JSON.stringify({
				asset_path_chirho: '/assets-chirho/scene-chirho.webp',
				width_chirho: 400,
				height_chirho: 300
			})
		);
		const reportChirho = await overlayDeliveryChirho(
			rootChirho,
			await deliveryChirho(projectChirho)
		);
		expect(reportChirho.overlaid_chirho).toHaveLength(2);
		expect(
			await readFile(join(rootChirho, 'static', 'assets-chirho', 'scene-chirho.webp'))
		).toEqual(Buffer.from(webpChirho(300, 225)));
		const manifestChirho = JSON.parse(
			await readFile(join(rootChirho, 'data-chirho', 'media-chirho', 'media-chirho.json'), 'utf8')
		);
		expect(manifestChirho.scenes_chirho[0]).toMatchObject({
			sha256_chirho: sha256Chirho(webpChirho(300, 225)),
			width_chirho: 300,
			height_chirho: 225,
			art_review_chirho: 'pending'
		});
		expect(JSON.parse(await readFile(presentationChirho, 'utf8'))).toMatchObject({
			width_chirho: 300,
			height_chirho: 225
		});
	});

	it('refuses a snapshot whose own records lack a derivative or whose originals changed', async () => {
		const missingChirho = await fixtureChirho();
		await expect(
			overlayDeliveryChirho(
				missingChirho.root_chirho,
				await deliveryChirho(missingChirho, ['scene'])
			)
		).rejects.toThrow(/no verified delivery derivative/);
		const alteredChirho = await fixtureChirho();
		const folderChirho = await deliveryChirho(alteredChirho);
		await writeFile(
			join(alteredChirho.root_chirho, 'static', 'assets-chirho', 'scene-chirho.webp'),
			webpChirho(401, 300)
		);
		await expect(overlayDeliveryChirho(alteredChirho.root_chirho, folderChirho)).rejects.toThrow(
			/original bytes do not match/
		);
	});

	it('checks an aliased asset path once, against its original bytes', async () => {
		const projectChirho = await fixtureChirho();
		projectChirho.media_chirho.push({ ...projectChirho.media_chirho[0] });
		await writeProjectChirho(projectChirho);
		const reportChirho = await overlayDeliveryChirho(
			projectChirho.root_chirho,
			await deliveryChirho(projectChirho)
		);
		expect(reportChirho.overlaid_chirho).toHaveLength(3);
	});

	it('copies only build inputs into the cycle folder and fingerprints code apart from media', async () => {
		const rootChirho = await temporaryRootChirho();
		rootsChirho.push(rootChirho);
		for (const [pathChirho, textChirho] of [
			['src/app.ts', 'export {};'],
			['static/assets-chirho/a-chirho.webp', 'media'],
			['.env', 'SECRET=1'],
			['.env.local', 'SECRET=2'],
			['src/.dev.vars.preview', 'SECRET=3'],
			['tests-chirho/a.test.ts', 'test'],
			['apps-chirho/ios-chirho/AppChirho.swift', 'native-source-chirho'],
			['apps-chirho/android-chirho/.gradle/cache-chirho.bin', 'native-build-chirho'],
			['node_modules/.keep', '']
		]) {
			await mkdir(dirname(join(rootChirho, pathChirho)), { recursive: true });
			await writeFile(join(rootChirho, pathChirho), textChirho);
		}
		await expect(copySnapshotChirho(rootChirho, join(rootChirho, 'src'))).rejects.toBeInstanceOf(
			RefusalChirho
		);
		const snapshotChirho = join(
			rootChirho,
			'build-chirho',
			'release-cycle-chirho',
			'snapshot-chirho'
		);
		const firstChirho = await copySnapshotChirho(rootChirho, snapshotChirho);
		for (const absentChirho of [
			'.env',
			'.env.local',
			'src/.dev.vars.preview',
			'tests-chirho/a.test.ts',
			'apps-chirho'
		])
			await expect(readFile(join(snapshotChirho, absentChirho))).rejects.toThrow();
		await writeFile(
			join(rootChirho, 'apps-chirho/ios-chirho/AppChirho.swift'),
			'native-edit-chirho'
		);
		expect((await copySnapshotChirho(rootChirho, snapshotChirho)).code_fingerprint_chirho).toBe(
			firstChirho.code_fingerprint_chirho
		);
		await writeFile(join(rootChirho, 'static/assets-chirho/a-chirho.webp'), 'new media');
		const mediaChirho = await copySnapshotChirho(rootChirho, snapshotChirho);
		expect(mediaChirho.code_fingerprint_chirho).toBe(firstChirho.code_fingerprint_chirho);
		expect(mediaChirho.media_fingerprint_chirho).not.toBe(firstChirho.media_fingerprint_chirho);
		await writeFile(join(rootChirho, 'src/app.ts'), 'export const changed = 1;');
		expect((await copySnapshotChirho(rootChirho, snapshotChirho)).code_fingerprint_chirho).not.toBe(
			firstChirho.code_fingerprint_chirho
		);
	});

	it('treats reviewed JSON as media while keeping executable changes behind the code baseline', async () => {
		const rootChirho = await temporaryRootChirho();
		rootsChirho.push(rootChirho);
		const folderChirho = join(
			rootChirho,
			'data-chirho/reader-chirho/icon-reuse-chirho/0000-chirho'
		);
		await mkdir(folderChirho, { recursive: true });
		await writeFile(join(folderChirho, 'water-chirho.json'), '{}');
		const destinationChirho = join(rootChirho, 'build-chirho/release-cycle-chirho/snapshot-chirho');
		const beforeChirho = await copySnapshotChirho(rootChirho, destinationChirho);
		await writeFile(join(folderChirho, 'water-chirho.json'), '{"reviewed_chirho":true}');
		const mediaChirho = await copySnapshotChirho(rootChirho, destinationChirho);
		expect(mediaChirho.code_fingerprint_chirho).toBe(beforeChirho.code_fingerprint_chirho);
		expect(mediaChirho.media_fingerprint_chirho).not.toBe(beforeChirho.media_fingerprint_chirho);
		await writeFile(join(folderChirho, 'code-chirho.ts'), 'export {};');
		expect(
			(await copySnapshotChirho(rootChirho, destinationChirho)).code_fingerprint_chirho
		).not.toBe(mediaChirho.code_fingerprint_chirho);
	});

	it('refuses stale shared assignments before the delivery overlay', async () => {
		const rootChirho = await temporaryRootChirho();
		rootsChirho.push(rootChirho);
		await mkdir(join(rootChirho, 'data-chirho/reader-chirho/icon-reuse-chirho/0000-chirho'), {
			recursive: true
		});
		const scriptChirho = join(rootChirho, 'scripts-chirho/art-chirho/reuse_icons_chirho.py');
		await mkdir(dirname(scriptChirho), { recursive: true });
		await writeFile(scriptChirho, 'raise SystemExit(2)\n');
		await expect(verifySnapshotReuseChirho(rootChirho)).rejects.toThrow(/shared icon assignments/u);
		await writeFile(scriptChirho, 'raise SystemExit(0)\n');
		await expect(verifySnapshotReuseChirho(rootChirho)).resolves.toBeUndefined();
	});

	it('builds a recorded preview with pending art kept pending and noindex headers', async () => {
		const projectChirho = await fixtureChirho();
		const rootChirho = projectChirho.root_chirho;
		const optionsChirho = {
			root_chirho: rootChirho,
			allow_pending_media_chirho: false,
			fresh_build_chirho: true,
			git_chirho: { commit_chirho: null, clean_chirho: false },
			local_paths_chirho: [rootChirho],
			preview_chirho: {
				authority_sha256_chirho: 'a'.repeat(64),
				output_root_chirho: rootChirho,
				secret_paths_chirho: [join(rootChirho, '.env')],
				snapshot_chirho: { code_fingerprint_chirho: 'b'.repeat(64) }
			}
		};
		const { manifest_chirho: manifestChirho, directory_chirho: directoryChirho } =
			await buildReleaseChirho(optionsChirho);
		expect(manifestChirho.release_kind_chirho).toBe('recorded_preview');
		expect(directoryChirho).toBe(
			join(rootChirho, 'build-chirho', 'preview-chirho', 'public-chirho')
		);
		expect(
			manifestChirho.media_chirho.every(
				(mediaChirho) => mediaChirho.art_review_chirho === 'pending'
			)
		).toBe(true);
		expect(await readFile(join(directoryChirho, '_headers'), 'utf8')).toBe(PREVIEW_HEADERS_CHIRHO);
		expect(PREVIEW_HEADERS_CHIRHO).toMatch(/^\/\*\n {2}X-Robots-Tag: noindex\n/);
		expect(
			await verifyReleaseChirho(rootChirho, 'recorded_preview', optionsChirho.git_chirho)
		).toEqual([]);
		await expect(
			buildReleaseChirho({ ...optionsChirho, fresh_build_chirho: false })
		).rejects.toThrow(/fresh build/);
	});
});

describe('release cycle decisions', () => {
	it('holds on code changes, allowing only an explicit first deploy without a baseline', () => {
		const baselineChirho = {
			code_fingerprint_chirho: 'c'.repeat(64),
			release_id_chirho: 'r',
			accepted_at_chirho: 'now'
		};
		expect(baselineDecisionChirho(null, 'c'.repeat(64), false)).toMatch(
			/no accepted code baseline/
		);
		expect(baselineDecisionChirho(null, 'c'.repeat(64), true)).toBeNull();
		expect(baselineDecisionChirho(baselineChirho, 'c'.repeat(64), false)).toBeNull();
		expect(baselineDecisionChirho(baselineChirho, 'd'.repeat(64), true)).toMatch(/code changed/);
	});

	it('deploys at most every interval and waits only a short debounce after media changes', () => {
		const nowChirho = Date.parse('2026-10-27T21:00:00Z');
		const minuteChirho = 60_000;
		expect(cycleDueChirho(nowChirho, nowChirho - 10 * minuteChirho, 0, 30, 5)).toMatch(
			/minimum interval/
		);
		expect(
			cycleDueChirho(nowChirho, nowChirho - 31 * minuteChirho, nowChirho - 2_000, 30, 5)
		).toMatch(/settle/);
		expect(
			cycleDueChirho(nowChirho, nowChirho - 31 * minuteChirho, nowChirho - 6_000, 30, 5)
		).toBeNull();
		expect(cycleDueChirho(nowChirho, null, nowChirho - 6_000, 30, 5)).toBeNull();
	});

	it('requires the recorded authority, and the preview config equals the publish config but its directory', async () => {
		expect(await readAuthorityChirho(REPO_CHIRHO)).toMatch(/^[0-9a-f]{64}$/);
		const parseChirho = async (nameChirho: string) => {
			const pathChirho = join(REPO_CHIRHO, 'config-chirho', nameChirho);
			return parseConfigFileTextToJson(pathChirho, await readFile(pathChirho, 'utf8')).config;
		};
		const publishChirho = await parseChirho('wrangler-publish-chirho.jsonc');
		const previewChirho = await parseChirho('wrangler-preview-chirho.jsonc');
		expect(previewChirho.assets.directory).toBe('../build-chirho/preview-chirho/public-chirho');
		expect(previewChirho.main).toBe('../build-chirho/preview-chirho/artwork-worker-chirho.mjs');
		expect({
			...previewChirho,
			main: null,
			assets: { ...previewChirho.assets, directory: null }
		}).toEqual({
			...publishChirho,
			main: null,
			assets: { ...publishChirho.assets, directory: null }
		});
	});
});

it('snapshots only catalogue-referenced audio while preserving incoming worker files', async () => {
	const rootChirho = await temporaryRootChirho();
	rootsChirho.push(rootChirho);
	const hashChirho = 'a'.repeat(64),
		incomingChirho = 'b'.repeat(64);
	const folderChirho = join(rootChirho, 'static/audio-chirho');
	await mkdir(join(folderChirho, 'proverbs-chirho'), { recursive: true });
	await mkdir(join(folderChirho, 'sha256-chirho'), { recursive: true });
	const chapterChirho = JSON.stringify({
		clips_chirho: [{ asset_path_chirho: `/audio-chirho/sha256-chirho/${hashChirho}-chirho.mp3` }]
	});
	await writeFile(join(folderChirho, 'proverbs-chirho/chapter-01-chirho.json'), chapterChirho);
	await writeFile(
		join(folderChirho, 'manifest-chirho.json'),
		JSON.stringify({
			schema_version_chirho: 1,
			books_chirho: {
				Prov: {
					chapters_chirho: [
						{
							path_chirho: '/audio-chirho/proverbs-chirho/chapter-01-chirho.json',
							sha256_chirho: sha256Chirho(chapterChirho)
						}
					]
				}
			}
		})
	);
	await writeFile(join(folderChirho, `sha256-chirho/${hashChirho}-chirho.mp3`), 'published clip');
	await writeFile(
		join(folderChirho, `sha256-chirho/${incomingChirho}-chirho.mp3`),
		'incoming clip'
	);
	const destinationChirho = join(rootChirho, 'build-chirho/release-cycle-chirho/snapshot-chirho');
	await copySnapshotChirho(rootChirho, destinationChirho);
	expect(
		await readFile(
			join(destinationChirho, `static/audio-chirho/sha256-chirho/${hashChirho}-chirho.mp3`),
			'utf8'
		)
	).toBe('published clip');
	await expect(
		readFile(
			join(destinationChirho, `static/audio-chirho/sha256-chirho/${incomingChirho}-chirho.mp3`)
		)
	).rejects.toThrow();
	expect(
		await readFile(join(folderChirho, `sha256-chirho/${incomingChirho}-chirho.mp3`), 'utf8')
	).toBe('incoming clip');
	await writeFile(join(folderChirho, 'proverbs-chirho/chapter-01-chirho.json'), 'changed');
	await expect(copySnapshotChirho(rootChirho, destinationChirho)).rejects.toThrow(
		/catalogue changed/
	);
});
