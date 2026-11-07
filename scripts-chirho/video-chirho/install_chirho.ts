// For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life. — John 3:16 (KJV)
// Workflow: verse-media-chirho.md. Existing Proverbs MP4s only; no synthesis or local retirement.
import {
	readFile as readFileChirho,
	writeFile as writeFileChirho,
	lstat as lstatChirho
} from 'node:fs/promises';
import { spawnSync as spawnSyncChirho } from 'node:child_process';
import {
	validVerseVideoChirho,
	sameEmbeddedReadingChirho,
	type VerseVideoChirho
} from '../../src/lib/domain-chirho/verse-video-chirho';
import {
	readVideoCatalogueChirho,
	VIDEO_CATALOGUE_CHIRHO,
	type VideoEntryChirho
} from '../publish-chirho/video_rules_chirho';
import { objectRequestChirho, digestChirho } from '../publish-chirho/r2-chirho/object-store-chirho';
import { acquireLockChirho } from '../publish-chirho/r2_upload_watch_chirho';
const rootChirho = process.cwd(),
	homeChirho =
		'workspace-chirho/video-chirho/proverbs-first-verses-2026-11-06-chirho/videos-chirho';
const argsChirho = process.argv.slice(2);
if (argsChirho.some((valueChirho) => !['--apply-chirho'].includes(valueChirho)))
	throw Error('Expected only optional apply');
const sourceChirho = JSON.parse(
	await readFileChirho(homeChirho + '/videos-records-chirho.json', 'utf8')
) as { videos_chirho: VerseVideoChirho[] };
const releaseChirho = await acquireLockChirho('build-chirho/r2-chirho/video-install-chirho.lock');
try {
	const entriesChirho = await readVideoCatalogueChirho(rootChirho),
		heldChirho: string[] = [];
	for (const videoChirho of sourceChirho.videos_chirho) {
		const matchChirho = /^Prov\.([1-9][0-9]?)\.1$/.exec(videoChirho.lesson_id_chirho);
		if (!matchChirho) throw Error('Unowned verse video');
		const chapterChirho = Number(matchChirho[1]),
			suffixChirho = String(chapterChirho).padStart(2, '0');
		const contentChirho = JSON.parse(
			await readFileChirho(
				`static/content-chirho/proverbs-chirho/chapter-${suffixChirho}-chirho.json`,
				'utf8'
			)
		);
		const verseChirho = contentChirho.verses_chirho.find(
			(rowChirho: { id_chirho: string }) => rowChirho.id_chirho === videoChirho.lesson_id_chirho
		);
		const audioChirho = JSON.parse(
			await readFileChirho(
				`static/audio-chirho/proverbs-chirho/chapter-${suffixChirho}-chirho.json`,
				'utf8'
			)
		);
		const sceneChirho = JSON.parse(
			await readFileChirho(
				`build-chirho/preview-chirho/public-chirho/media-chirho/proverbs-chirho/chapter-${suffixChirho}-chirho.json`,
				'utf8'
			)
		).scenes_chirho.find(
			(rowChirho: { lesson_id_chirho: string; variant_chirho?: string }) =>
				rowChirho.lesson_id_chirho === videoChirho.lesson_id_chirho &&
				(!rowChirho.variant_chirho || rowChirho.variant_chirho === 'standard')
		);
		if (
			!verseChirho ||
			!sceneChirho ||
			!validVerseVideoChirho(
				videoChirho,
				verseChirho.id_chirho,
				digestChirho(verseChirho.canonical_text_chirho),
				sceneChirho.sha256_chirho
			)
		)
			throw Error('Video source scene/canonical binding differs');
		if (
			!audioChirho.readings_chirho?.some(
				(clipChirho: Parameters<typeof sameEmbeddedReadingChirho>[1]) =>
					sameEmbeddedReadingChirho(videoChirho, clipChirho)
			)
		) {
			heldChirho.push(videoChirho.lesson_id_chirho);
			continue;
		}
		const pathChirho = `${homeChirho}/prov-${String(chapterChirho).padStart(3, '0')}-001-chirho.mp4`,
			infoChirho = await lstatChirho(pathChirho);
		if (
			!infoChirho.isFile() ||
			infoChirho.isSymbolicLink() ||
			infoChirho.size !== videoChirho.bytes_chirho
		)
			throw Error('Video file differs');
		const bytesChirho = new Uint8Array(await readFileChirho(pathChirho));
		if (digestChirho(bytesChirho) !== videoChirho.sha256_chirho) throw Error('Video bytes differ');
		const probeChirho = spawnSyncChirho(
			'ffprobe',
			['-v', 'error', '-show_streams', '-show_format', '-of', 'json', pathChirho],
			{ encoding: 'utf8', timeout: 30000 }
		);
		if (probeChirho.status !== 0) throw Error('Video decode failed');
		const metadataChirho = JSON.parse(probeChirho.stdout),
			pictureChirho = metadataChirho.streams.find(
				(rowChirho: { codec_type: string }) => rowChirho.codec_type === 'video'
			),
			soundChirho = metadataChirho.streams.find(
				(rowChirho: { codec_type: string }) => rowChirho.codec_type === 'audio'
			);
		if (
			pictureChirho?.codec_name !== 'h264' ||
			pictureChirho.width !== videoChirho.width_chirho ||
			pictureChirho.height !== videoChirho.height_chirho ||
			soundChirho?.codec_name !== 'aac' ||
			Math.abs(Number(metadataChirho.format.duration) - videoChirho.duration_chirho) > 0.15
		)
			throw Error('Video codec/length differs');
		const priorChirho = entriesChirho.find(
			(entryChirho) => entryChirho.video_chirho.lesson_id_chirho === videoChirho.lesson_id_chirho
		);
		if (priorChirho && JSON.stringify(priorChirho.video_chirho) !== JSON.stringify(videoChirho))
			throw Error('Existing verse video must be reconciled before replacement');
		if (argsChirho.includes('--apply-chirho') && !priorChirho) {
			const keyChirho = `video-chirho/sha256-chirho/${videoChirho.sha256_chirho}.mp4`;
			const putChirho = await objectRequestChirho('PUT', keyChirho, bytesChirho);
			await putChirho.arrayBuffer();
			if (!putChirho.ok) throw Error('Video R2 upload refused');
			const getChirho = await objectRequestChirho('GET', keyChirho),
				returnedChirho = new Uint8Array(await getChirho.arrayBuffer());
			if (
				!getChirho.ok ||
				returnedChirho.length !== bytesChirho.length ||
				digestChirho(returnedChirho) !== videoChirho.sha256_chirho
			)
				throw Error('Video R2 readback differs');
			const entryChirho: VideoEntryChirho = {
				video_chirho: videoChirho,
				key_chirho: keyChirho,
				readback_sha256_chirho: videoChirho.sha256_chirho,
				verified_at_chirho: new Date().toISOString()
			};
			entriesChirho.push(entryChirho);
			await writeFileChirho(
				VIDEO_CATALOGUE_CHIRHO + '.new',
				JSON.stringify({ schema_version_chirho: 1, entries_chirho: entriesChirho }, null, '\t') +
					'\n'
			);
			await import('node:fs/promises').then((moduleChirho) =>
				moduleChirho.rename(VIDEO_CATALOGUE_CHIRHO + '.new', VIDEO_CATALOGUE_CHIRHO)
			);
			console.log(
				JSON.stringify({
					archived_chirho: videoChirho.lesson_id_chirho,
					sha256_chirho: videoChirho.sha256_chirho
				})
			);
		}
	}
	console.log(
		JSON.stringify({
			installed_chirho: entriesChirho.length,
			held_chirho: heldChirho,
			apply_chirho: argsChirho.includes('--apply-chirho')
		})
	);
} finally {
	await releaseChirho();
}
