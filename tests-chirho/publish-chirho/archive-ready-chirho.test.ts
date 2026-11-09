// For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life. — John 3:16 (KJV)
import {
	mkdir as mkdirChirho,
	readFile as readFileChirho,
	rm as rmChirho,
	writeFile as writeFileChirho
} from 'node:fs/promises';
import { dirname as dirnameChirho, join as joinChirho } from 'node:path';
import { afterEach as afterEachChirho, expect as expectChirho, it as itChirho } from 'vitest';
import {
	archiveReadyScenesChirho,
	snapshotArtworkInputsChirho
} from '../../scripts-chirho/publish-chirho/preview_snapshot_chirho';
import { overlayRemoteArtworkChirho } from '../../scripts-chirho/publish-chirho/r2-chirho/release-artwork-chirho';
import { sha256Chirho } from '../../scripts-chirho/publish-chirho/release_rules_chirho';
import { temporaryRootChirho } from './support-chirho';

const rootsChirho: string[] = [];
afterEachChirho(async () => {
	await Promise.all(
		rootsChirho
			.splice(0)
			.map((rootChirho) => rmChirho(rootChirho, { recursive: true, force: true }))
	);
});

itChirho(
	'freezes only the completed prefix while the next source remains private and unproved',
	async () => {
		const rootChirho = await temporaryRootChirho();
		rootsChirho.push(rootChirho);
		const sourceHashChirho = 'a'.repeat(64);
		const readyChirho = {
			lesson_id_chirho: 'Matt.1.1',
			asset_path_chirho: '/assets-chirho/scenes-chirho/ready-chirho.webp',
			sha256_chirho: sourceHashChirho,
			width_chirho: 1448,
			height_chirho: 1086,
			art_review_chirho: 'pending'
		};
		const pendingChirho = {
			...readyChirho,
			lesson_id_chirho: 'Matt.1.2',
			asset_path_chirho: '/assets-chirho/scenes-chirho/pending-chirho.webp',
			sha256_chirho: 'b'.repeat(64)
		};
		const mediaPathChirho = 'data-chirho/media-chirho/bible-high-quality-scenes-chirho.json';
		const mediaChirho = {
			schema_version_chirho: 1,
			archive_ready_count_chirho: 1,
			scenes_chirho: [readyChirho, pendingChirho]
		};
		const proofChirho = (
			hashChirho: string,
			widthChirho: number,
			heightChirho: number,
			lossyChirho: boolean
		) => ({
			sha256_chirho: hashChirho,
			key_chirho: `media-chirho/sha256-chirho/${hashChirho}.webp`,
			bytes_chirho: 100,
			width_chirho: widthChirho,
			height_chirho: heightChirho,
			lossy_chirho: lossyChirho,
			verified_at_chirho: '2026-11-09T20:00:00Z'
		});
		const shardPathChirho =
			'data-chirho/delivery-chirho/artwork-chirho/objects-chirho/aa-chirho.json';
		const shardChirho = JSON.stringify({
			schema_version_chirho: 1,
			entries_chirho: [
				{
					kind_chirho: 'scene',
					source_paths_chirho: [readyChirho.asset_path_chirho],
					source_chirho: proofChirho(sourceHashChirho, 1448, 1086, false),
					delivery_chirho: proofChirho('c'.repeat(64), 1200, 900, true),
					recipe_chirho: { encoder_chirho: 'fixture-chirho' }
				}
			]
		});
		async function writeChirho(
			relativeChirho: string,
			bytesChirho: string | Uint8Array,
			homeChirho = rootChirho
		) {
			const pathChirho = joinChirho(homeChirho, relativeChirho);
			await mkdirChirho(dirnameChirho(pathChirho), { recursive: true });
			await writeFileChirho(pathChirho, bytesChirho);
		}
		await writeChirho(mediaPathChirho, JSON.stringify(mediaChirho));
		await writeChirho(shardPathChirho, shardChirho);
		await writeChirho(
			'data-chirho/delivery-chirho/artwork-chirho/index-chirho.json',
			JSON.stringify({
				schema_version_chirho: 1,
				bucket_chirho: 'hinneh-media-chirho',
				entry_count_chirho: 1,
				shards_chirho: [
					{
						path_chirho: 'objects-chirho/aa-chirho.json',
						entries_chirho: 1,
						sha256_chirho: sha256Chirho(shardChirho)
					}
				]
			})
		);
		const beforeChirho = await readFileChirho(joinChirho(rootChirho, mediaPathChirho));
		async function freezeChirho(nameChirho: string) {
			const inputsChirho = await snapshotArtworkInputsChirho(rootChirho);
			const frozenChirho = joinChirho(rootChirho, nameChirho);
			for (const [pathChirho, bytesChirho] of inputsChirho)
				await writeChirho(pathChirho, bytesChirho, frozenChirho);
			await mkdirChirho(joinChirho(frozenChirho, 'data-chirho/reader-chirho'), { recursive: true });
			return frozenChirho;
		}
		const frozenChirho = await freezeChirho('first-chirho');
		expectChirho(
			JSON.parse(await readFileChirho(joinChirho(frozenChirho, mediaPathChirho), 'utf8'))
				.scenes_chirho
		).toEqual([readyChirho]);
		expectChirho((await overlayRemoteArtworkChirho(frozenChirho)).records_chirho).toBe(1);
		expectChirho(await readFileChirho(joinChirho(rootChirho, mediaPathChirho))).toEqual(
			beforeChirho
		);
		// A claimed-ready marker never grants an absent archive proof.
		await writeChirho(
			mediaPathChirho,
			JSON.stringify({ ...mediaChirho, archive_ready_count_chirho: 2 })
		);
		await expectChirho(
			overlayRemoteArtworkChirho(await freezeChirho('unproved-chirho'))
		).rejects.toThrow('exact verified remote source');
		await writeChirho(
			mediaPathChirho,
			JSON.stringify({ schema_version_chirho: 1, scenes_chirho: mediaChirho.scenes_chirho })
		);
		await expectChirho(
			overlayRemoteArtworkChirho(await freezeChirho('legacy-chirho'))
		).rejects.toThrow('exact verified remote source');
	}
);

itChirho(
	'keeps complete and legacy bytes exact and refuses malformed archive-ready markers',
	() => {
		for (const documentChirho of [
			{ scenes_chirho: [] },
			{ archive_ready_count_chirho: 1, scenes_chirho: [{ id_chirho: 'ready-chirho' }] }
		]) {
			const bytesChirho = Buffer.from(JSON.stringify(documentChirho));
			expectChirho(archiveReadyScenesChirho(bytesChirho)).toBe(bytesChirho);
		}
		for (const markerChirho of [-1, 2, 0.5, true, '0']) {
			expectChirho(() =>
				archiveReadyScenesChirho(
					Buffer.from(
						JSON.stringify({ archive_ready_count_chirho: markerChirho, scenes_chirho: [{}] })
					)
				)
			).toThrow('archive-ready prefix');
		}
	}
);
