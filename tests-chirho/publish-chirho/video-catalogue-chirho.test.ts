// For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life. — John 3:16 (KJV)
import { it as itChirho, expect as expectChirho } from 'vitest';
import {
	mkdtemp as mkdtempChirho,
	mkdir as mkdirChirho,
	writeFile as writeFileChirho,
	readFile as readFileChirho,
	rm as rmChirho
} from 'node:fs/promises';
import { tmpdir as tmpdirChirho } from 'node:os';
import { join as joinChirho } from 'node:path';
import {
	overlayVerseVideosChirho,
	readVideoCatalogueChirho,
	verifiedVideoFactsChirho,
	VIDEO_CATALOGUE_CHIRHO,
	type VideoEntryChirho
} from '../../scripts-chirho/publish-chirho/video_rules_chirho';
import { BEERI_ATTRIBUTION_CHIRHO } from '../../src/lib/domain-chirho/pronunciation-chirho/reading-source-chirho';
import {
	sha256Chirho,
	type FilesChirho
} from '../../scripts-chirho/publish-chirho/release_rules_chirho';
async function fixtureChirho() {
	const rootChirho = await mkdtempChirho(joinChirho(tmpdirChirho(), 'verse-video-chirho-'));
	const sourceChirho = {
		kind_chirho: 'human' as const,
		reader_id_chirho: 'rdb-chirho' as const,
		gbt_id_chirho: 'OT/RDB/Pro',
		package_sha256_chirho: 'a'.repeat(64),
		chapter_sha256_chirho: 'b'.repeat(64),
		timings_sha256_chirho: 'c'.repeat(64),
		start_chirho: 0,
		end_chirho: 5,
		chapter_duration_chirho: 200,
		attribution_chirho: BEERI_ATTRIBUTION_CHIRHO,
		license_chirho: 'CC BY-SA 3.0' as const,
		license_url_chirho: 'https://creativecommons.org/licenses/by-sa/3.0/' as const
	};
	const entryChirho: VideoEntryChirho = {
		key_chirho: `video-chirho/sha256-chirho/${'d'.repeat(64)}.mp4`,
		readback_sha256_chirho: 'd'.repeat(64),
		verified_at_chirho: '2026-11-07T10:00:00Z',
		video_chirho: {
			lesson_id_chirho: 'Prov.1.1',
			canonical_sha256_chirho: sha256Chirho('א'),
			scene_sha256_chirho: 'e'.repeat(64),
			asset_path_chirho: `/video-chirho/sha256-chirho/${'d'.repeat(64)}-chirho.mp4`,
			sha256_chirho: 'd'.repeat(64),
			bytes_chirho: 1000,
			duration_chirho: 5,
			width_chirho: 100,
			height_chirho: 100,
			embedded_reading_chirho: sourceChirho,
			reading_language_chirho: 'he',
			attribution_chirho: BEERI_ATTRIBUTION_CHIRHO,
			license_chirho: 'CC BY-SA 3.0',
			license_url_chirho: 'https://creativecommons.org/licenses/by-sa/3.0/',
			review_chirho: 'pending'
		}
	};
	const writeChirho = async (pathChirho: string, valueChirho: unknown) => {
		await mkdirChirho(joinChirho(rootChirho, pathChirho, '..'), { recursive: true });
		await writeFileChirho(joinChirho(rootChirho, pathChirho), JSON.stringify(valueChirho));
	};
	await writeChirho(VIDEO_CATALOGUE_CHIRHO, {
		schema_version_chirho: 1,
		entries_chirho: [entryChirho]
	});
	const mediaPathChirho = 'media-chirho/proverbs-chirho/chapter-01-chirho.json',
		contentPathChirho = 'content-chirho/proverbs-chirho/chapter-01-chirho.json',
		audioPathChirho = 'audio-chirho/proverbs-chirho/chapter-01-chirho.json';
	await writeChirho('static/' + mediaPathChirho, {
		scenes_chirho: [{ lesson_id_chirho: 'Prov.1.1', sha256_chirho: 'e'.repeat(64) }]
	});
	await writeChirho('static/' + contentPathChirho, {
		verses_chirho: [{ id_chirho: 'Prov.1.1', canonical_text_chirho: 'א' }]
	});
	await writeChirho('static/' + audioPathChirho, {
		readings_chirho: [
			{
				lesson_id_chirho: 'Prov.1.1',
				canonical_sha256_chirho: sha256Chirho('א'),
				reading_source_chirho: sourceChirho
			}
		]
	});
	await writeChirho('static/media-chirho/proverbs-chirho/summary-chirho.json', {
		chapters_chirho: [{ path_chirho: '/' + mediaPathChirho, sha256_chirho: 'old' }]
	});
	const filesChirho = async () =>
		new Map(
			await Promise.all(
				[mediaPathChirho, contentPathChirho, audioPathChirho].map(
					async (pathChirho) =>
						[
							pathChirho,
							new Uint8Array(await readFileChirho(joinChirho(rootChirho, 'static', pathChirho)))
						] as const
				)
			)
		) as FilesChirho;
	return { rootChirho, entryChirho, writeChirho, filesChirho, mediaPathChirho, audioPathChirho };
}
itChirho(
	'binds published video facts to canonical text, delivered scene and verified archive; updates the summary hash',
	async () => {
		const valueChirho = await fixtureChirho();
		try {
			expectChirho(await overlayVerseVideosChirho(valueChirho.rootChirho)).toEqual({
				published_chirho: 1,
				held_chirho: []
			});
			const reasonsChirho: string[] = [];
			expectChirho(
				await verifiedVideoFactsChirho(
					valueChirho.rootChirho,
					await valueChirho.filesChirho(),
					reasonsChirho,
					true
				)
			).toEqual({ ['d'.repeat(64)]: 1000 });
			expectChirho(reasonsChirho).toEqual([]);
			const pendingChirho: string[] = [];
			await verifiedVideoFactsChirho(
				valueChirho.rootChirho,
				await valueChirho.filesChirho(),
				pendingChirho
			);
			expectChirho(pendingChirho).not.toEqual([]);
			const mismatchChirho = await valueChirho.filesChirho();
			mismatchChirho.set(
				valueChirho.audioPathChirho,
				new TextEncoder().encode(JSON.stringify({ readings_chirho: [] }))
			);
			const readingRefusalChirho: string[] = [];
			expectChirho(
				await verifiedVideoFactsChirho(
					valueChirho.rootChirho,
					mismatchChirho,
					readingRefusalChirho,
					true
				)
			).toEqual({});
			expectChirho(readingRefusalChirho).not.toEqual([]);
			const summaryChirho = JSON.parse(
				await readFileChirho(
					joinChirho(
						valueChirho.rootChirho,
						'static/media-chirho/proverbs-chirho/summary-chirho.json'
					),
					'utf8'
				)
			);
			expectChirho(summaryChirho.chapters_chirho[0].sha256_chirho).toBe(
				sha256Chirho(
					await readFileChirho(
						joinChirho(valueChirho.rootChirho, 'static', valueChirho.mediaPathChirho)
					)
				)
			);
			const filesChirho = await valueChirho.filesChirho();
			const chapterChirho = JSON.parse(
				new TextDecoder().decode(filesChirho.get(valueChirho.mediaPathChirho))
			);
			chapterChirho.videos_chirho[0].bytes_chirho++;
			filesChirho.set(
				valueChirho.mediaPathChirho,
				new TextEncoder().encode(JSON.stringify(chapterChirho))
			);
			const refusedChirho: string[] = [];
			expectChirho(
				await verifiedVideoFactsChirho(valueChirho.rootChirho, filesChirho, refusedChirho, true)
			).toEqual({});
			expectChirho(refusedChirho).not.toEqual([]);
		} finally {
			await rmChirho(valueChirho.rootChirho, { recursive: true, force: true });
		}
	}
);
itChirho(
	'withholds a changed scene or missing human window without altering the still chapter',
	async () => {
		for (const kindChirho of ['scene', 'reading']) {
			const valueChirho = await fixtureChirho();
			try {
				if (kindChirho === 'scene')
					await valueChirho.writeChirho('static/' + valueChirho.mediaPathChirho, {
						scenes_chirho: [{ lesson_id_chirho: 'Prov.1.1', sha256_chirho: 'f'.repeat(64) }]
					});
				else
					await valueChirho.writeChirho('static/' + valueChirho.audioPathChirho, {
						readings_chirho: []
					});
				const beforeChirho = await readFileChirho(
					joinChirho(valueChirho.rootChirho, 'static', valueChirho.mediaPathChirho)
				);
				expectChirho(await overlayVerseVideosChirho(valueChirho.rootChirho)).toEqual({
					published_chirho: 0,
					held_chirho: ['Prov.1.1']
				});
				expectChirho(
					await readFileChirho(
						joinChirho(valueChirho.rootChirho, 'static', valueChirho.mediaPathChirho)
					)
				).toEqual(beforeChirho);
			} finally {
				await rmChirho(valueChirho.rootChirho, { recursive: true, force: true });
			}
		}
	}
);
itChirho('refuses forged readback facts and duplicate verse identities', async () => {
	const valueChirho = await fixtureChirho();
	try {
		for (const entriesChirho of [
			[{ ...valueChirho.entryChirho, readback_sha256_chirho: '0'.repeat(64) }],
			[valueChirho.entryChirho, valueChirho.entryChirho]
		]) {
			await valueChirho.writeChirho(VIDEO_CATALOGUE_CHIRHO, {
				schema_version_chirho: 1,
				entries_chirho: entriesChirho
			});
			await expectChirho(readVideoCatalogueChirho(valueChirho.rootChirho)).rejects.toThrow();
		}
	} finally {
		await rmChirho(valueChirho.rootChirho, { recursive: true, force: true });
	}
});
