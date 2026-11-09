// For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life. — John 3:16 (KJV)
// Snapshot audio metadata is required in both modes; only local serving needs MP3 bodies.
import {
	mkdir as mkdirChirho,
	readFile as readFileChirho,
	rm as rmChirho,
	writeFile as writeFileChirho
} from 'node:fs/promises';
import { dirname as dirnameChirho, join as joinChirho } from 'node:path';
import { afterEach as afterEachChirho, expect as expectChirho, it as itChirho } from 'vitest';
import { copySnapshotChirho } from '../../scripts-chirho/publish-chirho/preview_snapshot_chirho';
import { sha256Chirho } from '../../scripts-chirho/publish-chirho/release_rules_chirho';
import { temporaryRootChirho } from '../../tests-chirho/publish-chirho/support-chirho';

const rootsChirho: string[] = [];
afterEachChirho(async () => {
	await Promise.all(
		rootsChirho
			.splice(0)
			.map((rootChirho) => rmChirho(rootChirho, { recursive: true, force: true }))
	);
});
async function fixtureChirho(remoteChirho: boolean) {
	const rootChirho = await temporaryRootChirho();
	rootsChirho.push(rootChirho);
	const bodyChirho = Buffer.from('eligible published audio fixture chirho');
	const incomingChirho = Buffer.from('unreferenced incoming take fixture chirho');
	const bodyPathChirho = `static/audio-chirho/sha256-chirho/${sha256Chirho(bodyChirho)}-chirho.mp3`;
	const incomingPathChirho = `static/audio-chirho/sha256-chirho/${sha256Chirho(incomingChirho)}-chirho.mp3`;
	const chapterPathChirho = 'static/audio-chirho/proverbs-chirho/chapter-01-chirho.json';
	const manifestPathChirho = 'static/audio-chirho/manifest-chirho.json';
	const chapterChirho = Buffer.from(
		JSON.stringify({
			schema_version_chirho: 1,
			book_id_chirho: 'Prov',
			chapter_chirho: 1,
			clips_chirho: [{ asset_path_chirho: bodyPathChirho.slice('static'.length) }],
			readings_chirho: []
		}) + '\n'
	);
	const manifestChirho = Buffer.from(
		JSON.stringify({
			schema_version_chirho: 1,
			books_chirho: {
				Prov: {
					chapters_chirho: [
						{
							number_chirho: 1,
							path_chirho: chapterPathChirho.slice('static'.length),
							sha256_chirho: sha256Chirho(chapterChirho)
						}
					]
				}
			}
		}) + '\n'
	);
	const filesChirho = new Map<string, Uint8Array | string>([
		[manifestPathChirho, manifestChirho],
		[chapterPathChirho, chapterChirho],
		[bodyPathChirho, bodyChirho],
		[incomingPathChirho, incomingChirho],
		[
			'config-chirho/media-library-chirho.json',
			JSON.stringify({ storage_mode_chirho: remoteChirho ? 'r2' : 'local' })
		],
		[
			'data-chirho/media-chirho/fixture-chirho.json',
			JSON.stringify({ schema_version_chirho: 1, scenes_chirho: [], icons_chirho: [] })
		],
		[
			'data-chirho/delivery-chirho/artwork-chirho/index-chirho.json',
			JSON.stringify({ schema_version_chirho: 1, shards_chirho: [] })
		]
	]);
	for (const [pathChirho, bytesChirho] of filesChirho) {
		await mkdirChirho(dirnameChirho(joinChirho(rootChirho, pathChirho)), { recursive: true });
		await writeFileChirho(joinChirho(rootChirho, pathChirho), bytesChirho);
	}
	const snapshotChirho = joinChirho(
		rootChirho,
		'build-chirho/release-cycle-chirho/snapshot-chirho'
	);
	await copySnapshotChirho(rootChirho, snapshotChirho);
	return {
		root_chirho: rootChirho,
		snapshot_chirho: snapshotChirho,
		body_path_chirho: bodyPathChirho,
		body_chirho: bodyChirho,
		incoming_path_chirho: incomingPathChirho,
		incoming_chirho: incomingChirho,
		chapter_path_chirho: chapterPathChirho,
		chapter_chirho: chapterChirho,
		manifest_path_chirho: manifestPathChirho,
		manifest_chirho: manifestChirho
	};
}
itChirho(
	'R2 snapshot keeps exact published audio metadata without copying its local MP3 body',
	async () => {
		const valueChirho = await fixtureChirho(true);
		expectChirho(
			await readFileChirho(
				joinChirho(valueChirho.snapshot_chirho, valueChirho.manifest_path_chirho)
			)
		).toEqual(valueChirho.manifest_chirho);
		expectChirho(
			await readFileChirho(joinChirho(valueChirho.snapshot_chirho, valueChirho.chapter_path_chirho))
		).toEqual(valueChirho.chapter_chirho);
		await expectChirho(
			readFileChirho(joinChirho(valueChirho.snapshot_chirho, valueChirho.incoming_path_chirho))
		).rejects.toMatchObject({ code: 'ENOENT' });
		expectChirho(
			await readFileChirho(joinChirho(valueChirho.root_chirho, valueChirho.body_path_chirho))
		).toEqual(valueChirho.body_chirho);
		expectChirho(
			await readFileChirho(joinChirho(valueChirho.root_chirho, valueChirho.incoming_path_chirho))
		).toEqual(valueChirho.incoming_chirho);
		// The old implementation fails only this assertion: R2 serving obtains this body remotely.
		await expectChirho(
			readFileChirho(joinChirho(valueChirho.snapshot_chirho, valueChirho.body_path_chirho))
		).rejects.toMatchObject({ code: 'ENOENT' });
	}
);
itChirho(
	'local snapshot keeps its eligible MP3 and exact metadata while excluding an unreferenced take',
	async () => {
		const valueChirho = await fixtureChirho(false);
		expectChirho(
			await readFileChirho(
				joinChirho(valueChirho.snapshot_chirho, valueChirho.manifest_path_chirho)
			)
		).toEqual(valueChirho.manifest_chirho);
		expectChirho(
			await readFileChirho(joinChirho(valueChirho.snapshot_chirho, valueChirho.chapter_path_chirho))
		).toEqual(valueChirho.chapter_chirho);
		expectChirho(
			await readFileChirho(joinChirho(valueChirho.snapshot_chirho, valueChirho.body_path_chirho))
		).toEqual(valueChirho.body_chirho);
		await expectChirho(
			readFileChirho(joinChirho(valueChirho.snapshot_chirho, valueChirho.incoming_path_chirho))
		).rejects.toMatchObject({ code: 'ENOENT' });
		expectChirho(
			await readFileChirho(joinChirho(valueChirho.root_chirho, valueChirho.incoming_path_chirho))
		).toEqual(valueChirho.incoming_chirho);
	}
);
