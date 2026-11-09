// For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life. — John 3:16 (KJV)
// Workflow: media-delivery-chirho.md. Project verified remote facts into a frozen release only.
import {
	readdir as readdirChirho,
	readFile as readFileChirho,
	writeFile as writeFileChirho,
	mkdir as mkdirChirho
} from 'node:fs/promises';
import { join as joinChirho } from 'node:path';
import { spawnSync as spawnSyncChirho } from 'node:child_process';
import { readArtworkCatalogueChirho, checkedArtworkChirho } from './catalogue-chirho';
import type { ArtworkEntryChirho } from './archive-artwork-chirho';
import type { OverlayReportChirho } from '../preview_snapshot_chirho';
import { sha256Chirho, type MediaRecordChirho, type FilesChirho } from '../release_rules_chirho';
import type { MediaCatalogueChirho } from '../../../workers-chirho/artwork-chirho/types-chirho';
import { SITE_HOSTNAME_CHIRHO, SITE_HOSTNAMES_CHIRHO } from '../../../src/lib/site-chirho';
import { readBrandingChirho } from '../../site-chirho/branding-chirho';
import { readEffectiveMediaDocumentsChirho } from './scene-corrections-chirho';

export interface RemoteReleaseChirho {
	schema_version_chirho: 1;
	worker_sha256_chirho: string;
	catalogue_sha256_chirho: string;
	registry_sha256_chirho: string;
	object_count_chirho: number;
	video_objects_chirho?: { sha256_chirho: string; bytes_chirho: number; key_chirho: string }[];
	audio_objects_chirho?: { sha256_chirho: string; bytes_chirho: number; key_chirho: string }[];
	objects_chirho: { sha256_chirho: string; bytes_chirho: number; key_chirho: string }[];
}
export async function r2ModeChirho(rootChirho: string) {
	const fileChirho = await readFileChirho(
		joinChirho(rootChirho, 'config-chirho/media-library-chirho.json'),
		'utf8'
	).catch(() => null);
	return !!fileChirho && JSON.parse(fileChirho).storage_mode_chirho === 'r2';
}
export async function overlayRemoteArtworkChirho(
	snapshotChirho: string
): Promise<OverlayReportChirho> {
	const catalogueChirho = await readArtworkCatalogueChirho(snapshotChirho);
	if (!catalogueChirho) throw new Error('R2 artwork requires its verified catalogue');
	const reportChirho: OverlayReportChirho = {
		mapping_sha256_chirho: catalogueChirho.index_sha256_chirho,
		encoder_chirho: { name_chirho: 'verified-r2-webp-chirho' },
		records_chirho: 0,
		source_bytes_chirho: 0,
		delivery_bytes_chirho: 0,
		overlaid_chirho: []
	};
	const byPathChirho = new Map<string, ArtworkEntryChirho>();
	const homeChirho = joinChirho(snapshotChirho, 'data-chirho/media-chirho');
	const effectiveChirho = await readEffectiveMediaDocumentsChirho(snapshotChirho);
	const documentsChirho = effectiveChirho.documents_chirho.map((documentChirho) => ({
		path_chirho: joinChirho(homeChirho, documentChirho.name_chirho) as string | null,
		document_chirho: documentChirho.document_chirho
	}));
	if (effectiveChirho.retained_scenes_chirho.length)
		documentsChirho.push({
			path_chirho: null,
			document_chirho: { scenes_chirho: effectiveChirho.retained_scenes_chirho }
		});
	for (const documentChirho of documentsChirho) {
		const pathChirho = documentChirho.path_chirho,
			recordChirho = documentChirho.document_chirho;
		for (const [arrayChirho, kindChirho] of [
			['icons_chirho', 'icon'],
			['scenes_chirho', 'scene']
		] as const) {
			const itemsChirho = recordChirho[arrayChirho];
			if (itemsChirho !== undefined && !Array.isArray(itemsChirho))
				throw new Error('Media collection is not an array');
			for (const itemChirho of Array.isArray(itemsChirho) ? itemsChirho : []) {
				const entryChirho = checkedArtworkChirho(catalogueChirho, {
					...itemChirho,
					kind_chirho: kindChirho
				});
				const previousChirho = byPathChirho.get(itemChirho.asset_path_chirho);
				if (
					previousChirho &&
					previousChirho.delivery_chirho.sha256_chirho !== entryChirho.delivery_chirho.sha256_chirho
				)
					throw new Error('R2 artwork aliases disagree');
				byPathChirho.set(itemChirho.asset_path_chirho, entryChirho);
				itemChirho.sha256_chirho = entryChirho.delivery_chirho.sha256_chirho;
				itemChirho.width_chirho = entryChirho.delivery_chirho.width_chirho;
				itemChirho.height_chirho = entryChirho.delivery_chirho.height_chirho;
				reportChirho.records_chirho++;
			}
		}
		if (pathChirho) await writeFileChirho(pathChirho, JSON.stringify(recordChirho, null, 2) + '\n');
	}
	for (const [pathChirho, entryChirho] of byPathChirho) {
		reportChirho.source_bytes_chirho += entryChirho.source_chirho.bytes_chirho;
		reportChirho.delivery_bytes_chirho += entryChirho.delivery_chirho.bytes_chirho;
		reportChirho.overlaid_chirho.push({
			asset_path_chirho: pathChirho,
			source_sha256_chirho: entryChirho.source_chirho.sha256_chirho,
			delivery_sha256_chirho: entryChirho.delivery_chirho.sha256_chirho,
			recipe_chirho: entryChirho.recipe_chirho
		});
	}
	const presentationHomeChirho = joinChirho(snapshotChirho, 'data-chirho/reader-chirho');
	for (const nameChirho of (await readdirChirho(presentationHomeChirho)).filter((nameChirho) =>
		nameChirho.endsWith('-presentation-chirho.json')
	)) {
		const pathChirho = joinChirho(presentationHomeChirho, nameChirho),
			recordChirho = JSON.parse(await readFileChirho(pathChirho, 'utf8'));
		function updateChirho(valueChirho: unknown) {
			if (!valueChirho || typeof valueChirho !== 'object') return;
			const rowChirho = valueChirho as Record<string, unknown>;
			const entryChirho =
				typeof rowChirho.asset_path_chirho === 'string'
					? byPathChirho.get(rowChirho.asset_path_chirho)
					: null;
			if (entryChirho) {
				rowChirho.width_chirho = entryChirho.delivery_chirho.width_chirho;
				rowChirho.height_chirho = entryChirho.delivery_chirho.height_chirho;
				rowChirho.sha256_chirho = entryChirho.delivery_chirho.sha256_chirho;
			}
			for (const childChirho of Object.values(rowChirho)) updateChirho(childChirho);
		}
		updateChirho(recordChirho);
		await writeFileChirho(pathChirho, JSON.stringify(recordChirho, null, 2) + '\n');
	}
	return reportChirho;
}
export async function remoteMediaChirho(
	rootChirho: string,
	recordsChirho: MediaRecordChirho[],
	allowPendingChirho: boolean,
	reasonsChirho: string[]
) {
	const catalogueChirho = await readArtworkCatalogueChirho(rootChirho);
	if (!catalogueChirho) throw new Error('Remote media catalogue unavailable');
	const byPathChirho = new Map<string, ArtworkEntryChirho>();
	for (const entryChirho of catalogueChirho.entries_chirho.values())
		for (const pathChirho of entryChirho.source_paths_chirho) {
			const previousChirho = byPathChirho.get(pathChirho);
			if (
				previousChirho &&
				previousChirho.delivery_chirho.sha256_chirho !== entryChirho.delivery_chirho.sha256_chirho
			)
				throw new Error('Remote alias ambiguity');
			byPathChirho.set(pathChirho, entryChirho);
		}
	const assetsChirho: MediaCatalogueChirho['assets_chirho'] = {};
	for (const recordChirho of recordsChirho) {
		const entryChirho = byPathChirho.get(recordChirho.asset_path_chirho),
			deliveryChirho = entryChirho?.delivery_chirho;
		if (
			!entryChirho ||
			!deliveryChirho ||
			entryChirho.kind_chirho !== recordChirho.kind_chirho ||
			deliveryChirho.sha256_chirho !== recordChirho.sha256_chirho ||
			deliveryChirho.width_chirho !== recordChirho.width_chirho ||
			deliveryChirho.height_chirho !== recordChirho.height_chirho
		) {
			reasonsChirho.push('Declared remote media differs from its verified delivery');
			continue;
		}
		if (!allowPendingChirho && recordChirho.art_review_chirho !== 'approved')
			reasonsChirho.push('Remote artwork remains pending review');
		const factChirho = {
			sha256_chirho: deliveryChirho.sha256_chirho,
			key_chirho: deliveryChirho.key_chirho,
			bytes_chirho: deliveryChirho.bytes_chirho,
			width_chirho: deliveryChirho.width_chirho,
			height_chirho: deliveryChirho.height_chirho
		};
		assetsChirho[recordChirho.asset_path_chirho] = factChirho;
		assetsChirho[`/assets-chirho/sha256-chirho/${factChirho.sha256_chirho}-chirho.webp`] =
			factChirho;
	}
	return {
		media_chirho: recordsChirho,
		assets_chirho: assetsChirho,
		registry_sha256_chirho: catalogueChirho.index_sha256_chirho
	};
}
export async function buildArtworkWorkerChirho(
	rootChirho: string,
	outputChirho: string,
	filesChirho: FilesChirho,
	remoteChirho: Awaited<ReturnType<typeof remoteMediaChirho>>,
	videoFactsChirho: Record<string, number> = {}
): Promise<RemoteReleaseChirho> {
	const configurationChirho = JSON.parse(
		await readFileChirho(joinChirho(rootChirho, 'config-chirho/artifact-flags-chirho.json'), 'utf8')
	);
	if (
		configurationChirho.hostname_chirho !== SITE_HOSTNAME_CHIRHO ||
		!/^0x4[A-Za-z0-9_-]+$/.test(configurationChirho.sitekey_chirho)
	)
		throw new Error('Artifact reporting needs the real scoped public widget');
	const versesChirho: Record<string, true> = {};
	for (const [pathChirho, bytesChirho] of filesChirho)
		if (/^content-chirho\/[^/]+\/chapter-\d{2,3}-chirho\.json$/.test(pathChirho)) {
			const chapterChirho = JSON.parse(new TextDecoder().decode(bytesChirho));
			for (const verseChirho of chapterChirho.verses_chirho)
				versesChirho[verseChirho.id_chirho] = true;
		}
	const audioChirho: Record<string, number> = {};
	for (const [pathChirho, bytesChirho] of filesChirho) {
		const matchChirho = /^audio-chirho\/sha256-chirho\/([a-f0-9]{64})-chirho\.mp3$/u.exec(
			pathChirho
		);
		if (!matchChirho) continue;
		if (sha256Chirho(bytesChirho) !== matchChirho[1])
			throw new Error('R2 audio source hash changed.');
		audioChirho[matchChirho[1]] = bytesChirho.length;
	}
	const catalogueChirho: MediaCatalogueChirho = {
		schema_version_chirho: 1,
		assets_chirho: remoteChirho.assets_chirho,
		audio_chirho: audioChirho,
		video_chirho: videoFactsChirho,
		verses_chirho: versesChirho,
		hostname_chirho: configurationChirho.hostname_chirho,
		hostnames_chirho: SITE_HOSTNAMES_CHIRHO,
		sitekey_chirho: configurationChirho.sitekey_chirho
	};
	const brandingChirho = await readBrandingChirho(rootChirho);
	if (brandingChirho)
		catalogueChirho.assets_chirho[brandingChirho.asset_path_chirho] =
			brandingChirho.delivery_chirho;
	const textChirho = JSON.stringify(catalogueChirho);
	await mkdirChirho(outputChirho, { recursive: true });
	const entryChirho = joinChirho(outputChirho, 'entry-chirho.ts'),
		bundleChirho = joinChirho(outputChirho, 'artwork-worker-chirho.mjs');
	await writeFileChirho(
		entryChirho,
		`import {createArtworkWorkerChirho} from ${JSON.stringify(joinChirho(rootChirho, 'workers-chirho/artwork-chirho/index-chirho.ts'))};\nexport default createArtworkWorkerChirho(${textChirho});\n`
	);
	const buildChirho = spawnSyncChirho(
		'bun',
		['build', entryChirho, '--target=browser', '--minify', '--outfile', bundleChirho],
		{ encoding: 'utf8', timeout: 120000 }
	);
	if (buildChirho.status !== 0) throw new Error('Artwork Worker bundle failed');
	const bytesChirho = await readFileChirho(bundleChirho);
	const objectsChirho = [
		...new Map(
			Object.values(catalogueChirho.assets_chirho).map((rowChirho) => [
				rowChirho.sha256_chirho,
				{
					sha256_chirho: rowChirho.sha256_chirho,
					bytes_chirho: rowChirho.bytes_chirho,
					key_chirho: rowChirho.key_chirho
				}
			])
		).values()
	].sort((leftChirho, rightChirho) =>
		leftChirho.sha256_chirho.localeCompare(rightChirho.sha256_chirho)
	);
	return {
		schema_version_chirho: 1,
		worker_sha256_chirho: sha256Chirho(bytesChirho),
		catalogue_sha256_chirho: sha256Chirho(textChirho),
		registry_sha256_chirho: remoteChirho.registry_sha256_chirho,
		object_count_chirho: objectsChirho.length,
		video_objects_chirho: Object.entries(videoFactsChirho)
			.sort(([leftChirho], [rightChirho]) => leftChirho.localeCompare(rightChirho))
			.map(([shaChirho, bytesChirho]) => ({
				sha256_chirho: shaChirho,
				bytes_chirho: bytesChirho,
				key_chirho: `video-chirho/sha256-chirho/${shaChirho}.mp4`
			})),
		audio_objects_chirho: Object.entries(audioChirho)
			.map(([shaChirho, bytesChirho]) => ({
				sha256_chirho: shaChirho,
				bytes_chirho: bytesChirho,
				key_chirho: 'audio-chirho/sha256-chirho/' + shaChirho + '.mp3'
			}))
			.sort((leftChirho, rightChirho) =>
				leftChirho.sha256_chirho.localeCompare(rightChirho.sha256_chirho)
			),
		objects_chirho: objectsChirho
	};
}
export function remoteReleaseIdChirho(
	filesIdChirho: string,
	remoteChirho: RemoteReleaseChirho | null
) {
	return remoteChirho
		? sha256Chirho(`${filesIdChirho}\0${JSON.stringify(remoteChirho)}`)
		: filesIdChirho;
}
