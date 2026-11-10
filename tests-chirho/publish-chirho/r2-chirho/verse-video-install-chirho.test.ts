// For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life. — John 3:16 (KJV)
import { afterEach, describe, expect, it, vi } from 'vitest';
import {
	mkdtemp as mkdtempChirho,
	mkdir as mkdirChirho,
	writeFile as writeFileChirho,
	readFile as readFileChirho,
	realpath as realpathChirho,
	rm as rmChirho,
	symlink as symlinkChirho
} from 'node:fs/promises';
import { tmpdir as tmpdirChirho } from 'node:os';
import { join as joinChirho, dirname as dirnameChirho } from 'node:path';
import {
	execFileSync as execFileSyncChirho,
	spawnSync as spawnSyncChirho
} from 'node:child_process';
import {
	installVideosChirho,
	videoInstallArgumentsChirho,
	GENESIS_VIDEO_HOME_CHIRHO,
	PROVERBS_VIDEO_HOME_CHIRHO
} from '../../../scripts-chirho/video-chirho/install_chirho';
import { digestChirho } from '../../../scripts-chirho/publish-chirho/r2-chirho/object-store-chirho';
import {
	BEERI_ATTRIBUTION_CHIRHO,
	BEERI_LICENSE_URL_CHIRHO,
	type ReadingSourceChirho
} from '../../../src/lib/domain-chirho/pronunciation-chirho/reading-source-chirho';
import { selectedSyntheticVerseChirho } from '../../../scripts-chirho/video-chirho/finite_batch_chirho';
import {
	recordingsForLessonChirho,
	type RecordingChirho
} from '../../../src/lib/reader-chirho/audio-chirho/recordings-chirho';
import { recordingIdentityChirho } from '../../../scripts-chirho/video-chirho/selected_recording_chirho';
import type { GreekLessonChirho } from '../../../src/lib/domain-chirho/greek-chirho';
import type { VerseVideoChirho } from '../../../src/lib/domain-chirho/verse-video-chirho';
import {
	VIDEO_CATALOGUE_CHIRHO,
	type VideoEntryChirho
} from '../../../scripts-chirho/publish-chirho/video_rules_chirho';
const rootsChirho: string[] = [];
afterEach(async () => {
	for (const pathChirho of rootsChirho.splice(0))
		await rmChirho(pathChirho, { recursive: true, force: true });
});
async function fixtureChirho(proverbsChirho = false) {
	const rootChirho = await realpathChirho(
		await mkdtempChirho(joinChirho(tmpdirChirho(), 'video-install-chirho-'))
	);
	rootsChirho.push(rootChirho);
	const putChirho = async (pathChirho: string, bytesChirho: string | Uint8Array) => {
		await mkdirChirho(dirnameChirho(joinChirho(rootChirho, pathChirho)), { recursive: true });
		await writeFileChirho(joinChirho(rootChirho, pathChirho), bytesChirho);
	};
	const jsonChirho = async (pathChirho: string, valueChirho: unknown) =>
		putChirho(pathChirho, JSON.stringify(valueChirho) + '\n');
	const tempChirho = joinChirho(rootChirho, 'fixture-chirho.mp4');
	execFileSyncChirho('ffmpeg', [
		'-v',
		'error',
		'-nostdin',
		'-n',
		'-f',
		'lavfi',
		'-i',
		'color=c=blue:s=128x96:r=24:d=1',
		'-f',
		'lavfi',
		'-i',
		'sine=frequency=440:duration=1',
		'-shortest',
		'-c:v',
		'libx264',
		'-pix_fmt',
		'yuv420p',
		'-c:a',
		'aac',
		'-movflags',
		'+faststart',
		tempChirho
	]);
	const bytesChirho = await readFileChirho(tempChirho),
		shaChirho = digestChirho(bytesChirho),
		sceneShaChirho = 'e'.repeat(64);
	const sourceChirho = (gbtChirho: string): ReadingSourceChirho => ({
		kind_chirho: 'human',
		reader_id_chirho: 'rdb-chirho',
		gbt_id_chirho: gbtChirho,
		package_sha256_chirho: 'a'.repeat(64),
		chapter_sha256_chirho: 'b'.repeat(64),
		timings_sha256_chirho: 'c'.repeat(64),
		start_chirho: 0,
		end_chirho: 1,
		chapter_duration_chirho: 100,
		attribution_chirho: BEERI_ATTRIBUTION_CHIRHO,
		license_chirho: 'CC BY-SA 3.0',
		license_url_chirho: BEERI_LICENSE_URL_CHIRHO
	});
	const videoChirho = (idChirho: string, gbtChirho: string): VerseVideoChirho => ({
		lesson_id_chirho: idChirho,
		asset_path_chirho: `/video-chirho/sha256-chirho/${shaChirho}-chirho.mp4`,
		sha256_chirho: shaChirho,
		bytes_chirho: bytesChirho.length,
		duration_chirho: 1,
		width_chirho: 128,
		height_chirho: 96,
		scene_sha256_chirho: sceneShaChirho,
		canonical_sha256_chirho: digestChirho('א'),
		reading_language_chirho: 'he',
		embedded_reading_chirho: sourceChirho(gbtChirho),
		attribution_chirho: BEERI_ATTRIBUTION_CHIRHO,
		license_chirho: 'CC BY-SA 3.0',
		license_url_chirho: BEERI_LICENSE_URL_CHIRHO,
		review_chirho: 'pending'
	});
	const priorChirho: VideoEntryChirho[] = Array.from({ length: 31 }, (_, indexChirho) => ({
		video_chirho: videoChirho(`Prov.${indexChirho + 1}.1`, 'OT/RDB/Pro'),
		key_chirho: `video-chirho/sha256-chirho/${shaChirho}.mp4`,
		readback_sha256_chirho: shaChirho,
		verified_at_chirho: '2026-11-07T00:00:00.000Z'
	}));
	await jsonChirho(VIDEO_CATALOGUE_CHIRHO, {
		schema_version_chirho: 1,
		entries_chirho: priorChirho
	});
	const slugChirho = proverbsChirho ? 'proverbs-chirho' : 'genesis-chirho',
		bookChirho = proverbsChirho ? 'Prov' : 'Gen',
		homeChirho = proverbsChirho ? PROVERBS_VIDEO_HOME_CHIRHO : GENESIS_VIDEO_HOME_CHIRHO,
		videosChirho = proverbsChirho
			? priorChirho.map((rowChirho) => rowChirho.video_chirho)
			: [videoChirho('Gen.3.1', 'OT/RDB/Gen'), videoChirho('Gen.3.2', 'OT/RDB/Gen')];
	const contentEntriesChirho: { path_chirho: string; sha256_chirho: string }[] = [],
		audioEntriesChirho: { number_chirho: number; path_chirho: string; sha256_chirho: string }[] =
			[],
		mediaEntriesChirho: { path_chirho: string; sha256_chirho: string }[] = [];
	for (const chapterChirho of proverbsChirho
		? Array.from({ length: 31 }, (_, indexChirho) => indexChirho + 1)
		: [3]) {
		const subsetChirho = videosChirho.filter(
				(rowChirho) => Number(rowChirho.lesson_id_chirho.split('.')[1]) === chapterChirho
			),
			suffixChirho = String(chapterChirho).padStart(2, '0');
		const contentPathChirho = `/content-chirho/${slugChirho}/chapter-${suffixChirho}-chirho.json`,
			audioPathChirho = `/audio-chirho/${slugChirho}/chapter-${suffixChirho}-chirho.json`,
			mediaPathChirho = `/media-chirho/${slugChirho}/chapter-${suffixChirho}-chirho.json`;
		const contentChirho = {
			book_id_chirho: bookChirho,
			chapter_chirho: chapterChirho,
			verses_chirho: subsetChirho.map((rowChirho) => ({
				id_chirho: rowChirho.lesson_id_chirho,
				canonical_text_chirho: 'א',
				tokens_chirho: [
					{
						id_chirho: `token-${rowChirho.lesson_id_chirho}-chirho`,
						text_chirho: 'א',
						start_chirho: 0,
						end_chirho: 1
					}
				]
			}))
		};
		const contentTextChirho = JSON.stringify(contentChirho) + '\n';
		await putChirho('static' + contentPathChirho, contentTextChirho);
		contentEntriesChirho.push({
			path_chirho: contentPathChirho,
			sha256_chirho: digestChirho(contentTextChirho)
		});
		const readingsChirho = subsetChirho.map((rowChirho) => ({
			lesson_id_chirho: rowChirho.lesson_id_chirho,
			token_id_chirho: null,
			text_chirho: 'א',
			canonical_sha256_chirho: digestChirho('א'),
			language_chirho: 'he',
			pronunciation_chirho: 'israeli_hebrew',
			voice_name_chirho: "Rabbi Dan Be'eri",
			asset_path_chirho: `/audio-chirho/sha256-chirho/${'f'.repeat(64)}-chirho.mp3`,
			sha256_chirho: 'f'.repeat(64),
			bytes_chirho: 100,
			duration_chirho: 1,
			review_chirho: 'audition',
			reading_source_chirho: rowChirho.embedded_reading_chirho
		}));
		const audioTextChirho =
			JSON.stringify({
				schema_version_chirho: 1,
				book_id_chirho: bookChirho,
				chapter_chirho: chapterChirho,
				content_path_chirho: contentPathChirho,
				content_sha256_chirho: digestChirho(contentTextChirho),
				clips_chirho: [],
				readings_chirho: readingsChirho
			}) + '\n';
		await putChirho('static' + audioPathChirho, audioTextChirho);
		audioEntriesChirho.push({
			number_chirho: chapterChirho,
			path_chirho: audioPathChirho,
			sha256_chirho: digestChirho(audioTextChirho)
		});
		const mediaTextChirho =
			JSON.stringify({
				scenes_chirho: subsetChirho.map((rowChirho) => ({
					lesson_id_chirho: rowChirho.lesson_id_chirho,
					sha256_chirho: sceneShaChirho
				}))
			}) + '\n';
		await putChirho('build-chirho/preview-chirho/public-chirho' + mediaPathChirho, mediaTextChirho);
		mediaEntriesChirho.push({
			path_chirho: mediaPathChirho,
			sha256_chirho: digestChirho(mediaTextChirho)
		});
		for (const rowChirho of subsetChirho) {
			const verseChirho = Number(rowChirho.lesson_id_chirho.split('.')[2]);
			await putChirho(
				`${homeChirho}/${proverbsChirho ? `prov-${String(chapterChirho).padStart(3, '0')}-001` : `gen-003-${String(verseChirho).padStart(3, '0')}`}-chirho.mp4`,
				bytesChirho
			);
		}
	}
	await jsonChirho(`static/content-chirho/${slugChirho}/manifest-chirho.json`, {
		chapters_chirho: contentEntriesChirho
	});
	await jsonChirho('static/audio-chirho/manifest-chirho.json', {
		books_chirho: { [bookChirho]: { chapters_chirho: audioEntriesChirho } }
	});
	await jsonChirho(
		`build-chirho/preview-chirho/public-chirho/media-chirho/${slugChirho}/summary-chirho.json`,
		{ chapters_chirho: mediaEntriesChirho }
	);
	await jsonChirho(`${homeChirho}/videos-records-chirho.json`, { videos_chirho: videosChirho });
	const objectsChirho = new Map<string, Uint8Array>(),
		objectChirho = vi.fn(
			async (methodChirho: 'GET' | 'PUT', keyChirho: string, valueChirho?: Uint8Array) => {
				if (methodChirho === 'PUT') {
					objectsChirho.set(keyChirho, new Uint8Array(valueChirho!));
					return new Response('');
				}
				const currentChirho = objectsChirho.get(keyChirho);
				return currentChirho
					? new Response(new Uint8Array(currentChirho))
					: new Response('', { status: 404 });
			}
		);
	const optionsChirho = {
		root_chirho: rootChirho,
		scope_chirho: proverbsChirho
			? ('proverbs_openings_chirho' as const)
			: ('genesis_three_chirho' as const),
		object_chirho: objectChirho
	};
	return {
		rootChirho,
		putChirho,
		jsonChirho,
		bytesChirho,
		shaChirho,
		priorChirho,
		videosChirho,
		homeChirho,
		objectsChirho,
		objectChirho,
		optionsChirho
	};
}
describe.sequential('bounded existing verse video installation', () => {
	// This fixture creates, probes and fully decodes 31 MP4s before its awaited cleanup.
	it('preserves default31 Proverbs entries and cold replay makes zero calls or catalogue writes', async () => {
		const valueChirho = await fixtureChirho(true),
			pathChirho = joinChirho(valueChirho.rootChirho, VIDEO_CATALOGUE_CHIRHO),
			beforeChirho = await readFileChirho(pathChirho);
		expect(
			await installVideosChirho({ ...valueChirho.optionsChirho, apply_chirho: true })
		).toMatchObject({ installed_chirho: 31, replayed_chirho: 31, archived_chirho: 0 });
		expect(valueChirho.objectChirho).not.toHaveBeenCalled();
		expect(await readFileChirho(pathChirho)).toEqual(beforeChirho);
	}, 30_000);
	it('dry preflights real MP4s without remote calls, locks or changes', async () => {
		const valueChirho = await fixtureChirho(),
			beforeChirho = await readFileChirho(
				joinChirho(valueChirho.rootChirho, VIDEO_CATALOGUE_CHIRHO)
			);
		expect(await installVideosChirho(valueChirho.optionsChirho)).toMatchObject({
			installed_chirho: 31,
			archived_chirho: 0,
			apply_chirho: false
		});
		expect(valueChirho.objectChirho).not.toHaveBeenCalled();
		expect(
			await readFileChirho(joinChirho(valueChirho.rootChirho, VIDEO_CATALOGUE_CHIRHO))
		).toEqual(beforeChirho);
		await expect(
			readFileChirho(
				joinChirho(valueChirho.rootChirho, 'build-chirho/r2-chirho/video-install-chirho.lock')
			)
		).rejects.toThrow();
	});
	it('archives then adds Genesis rows without altering any old31 objects and completed replay is zero-network', async () => {
		const valueChirho = await fixtureChirho();
		expect(
			await installVideosChirho({ ...valueChirho.optionsChirho, apply_chirho: true })
		).toMatchObject({ installed_chirho: 33, archived_chirho: 2 });
		const installedChirho = JSON.parse(
			await readFileChirho(joinChirho(valueChirho.rootChirho, VIDEO_CATALOGUE_CHIRHO), 'utf8')
		);
		expect(installedChirho.entries_chirho.slice(0, 31)).toEqual(valueChirho.priorChirho);
		expect(valueChirho.objectChirho.mock.calls.map((rowChirho) => rowChirho[0])).toEqual([
			'GET',
			'PUT',
			'GET',
			'GET'
		]);
		valueChirho.objectChirho.mockClear();
		const beforeChirho = await readFileChirho(
			joinChirho(valueChirho.rootChirho, VIDEO_CATALOGUE_CHIRHO)
		);
		await installVideosChirho({ ...valueChirho.optionsChirho, apply_chirho: true });
		expect(valueChirho.objectChirho).not.toHaveBeenCalled();
		expect(
			await readFileChirho(joinChirho(valueChirho.rootChirho, VIDEO_CATALOGUE_CHIRHO))
		).toEqual(beforeChirho);
	});
	it('holds unmatched spoken text while independent verses continue', async () => {
		const valueChirho = await fixtureChirho();
		const pathChirho = 'static/audio-chirho/genesis-chirho/chapter-03-chirho.json',
			audioChirho = JSON.parse(
				await readFileChirho(joinChirho(valueChirho.rootChirho, pathChirho), 'utf8')
			) as { readings_chirho: { lesson_id_chirho: string; text_chirho: string }[] };
		audioChirho.readings_chirho[0].text_chirho = 'wrong';
		await valueChirho.jsonChirho(pathChirho, audioChirho);
		await valueChirho.jsonChirho('static/audio-chirho/manifest-chirho.json', {
			books_chirho: {
				Gen: {
					chapters_chirho: [
						{
							number_chirho: 3,
							path_chirho: '/audio-chirho/genesis-chirho/chapter-03-chirho.json',
							sha256_chirho: digestChirho(
								await readFileChirho(joinChirho(valueChirho.rootChirho, pathChirho))
							)
						}
					]
				}
			}
		});
		expect(
			await installVideosChirho({ ...valueChirho.optionsChirho, apply_chirho: true })
		).toMatchObject({ held_chirho: ['Gen.3.1'], archived_chirho: 1, installed_chirho: 32 });
	});
	it('refuses foreign scope, duplicates, excessive records and linked homes before network', async () => {
		for (const kindChirho of [
			'foreign-chirho',
			'duplicate-chirho',
			'count-chirho',
			'linked-chirho'
		]) {
			const valueChirho = await fixtureChirho();
			if (kindChirho === 'linked-chirho') {
				const movedChirho = valueChirho.homeChirho + '-original-chirho';
				await import('node:fs/promises').then((moduleChirho) =>
					moduleChirho.rename(
						joinChirho(valueChirho.rootChirho, valueChirho.homeChirho),
						joinChirho(valueChirho.rootChirho, movedChirho)
					)
				);
				await symlinkChirho(
					joinChirho(valueChirho.rootChirho, movedChirho),
					joinChirho(valueChirho.rootChirho, valueChirho.homeChirho)
				);
				await expect(
					installVideosChirho({
						...valueChirho.optionsChirho,
						apply_chirho: true
					})
				).rejects.toThrow();
			} else {
				const rowsChirho = structuredClone(valueChirho.videosChirho);
				if (kindChirho === 'foreign-chirho') rowsChirho[1].lesson_id_chirho = 'Gen.4.1';
				if (kindChirho === 'duplicate-chirho') rowsChirho[1] = rowsChirho[0];
				await valueChirho.jsonChirho(`${valueChirho.homeChirho}/videos-records-chirho.json`, {
					videos_chirho: kindChirho === 'count-chirho' ? Array(25).fill(rowsChirho[0]) : rowsChirho
				});
				await expect(
					installVideosChirho({ ...valueChirho.optionsChirho, apply_chirho: true })
				).rejects.toThrow();
			}
			expect(valueChirho.objectChirho).not.toHaveBeenCalled();
		}
	});
	it('rejects one malformed or stale later row before uploading the earlier valid row', async () => {
		for (const fieldChirho of ['sha256_chirho', 'scene_sha256_chirho', 'width_chirho'] as const) {
			const valueChirho = await fixtureChirho(),
				rowsChirho = structuredClone(valueChirho.videosChirho);
			if (fieldChirho === 'width_chirho') rowsChirho[1].width_chirho = 130;
			else rowsChirho[1][fieldChirho] = 'd'.repeat(64);
			await valueChirho.jsonChirho(`${valueChirho.homeChirho}/videos-records-chirho.json`, {
				videos_chirho: rowsChirho
			});
			await expect(
				installVideosChirho({ ...valueChirho.optionsChirho, apply_chirho: true })
			).rejects.toThrow();
			expect(valueChirho.objectChirho).not.toHaveBeenCalled();
		}
	});
	it('does not overwrite a conflicting existing verse entry or corrupt existing R2 object', async () => {
		const valueChirho = await fixtureChirho();
		valueChirho.objectsChirho.set(
			`video-chirho/sha256-chirho/${valueChirho.shaChirho}.mp4`,
			new Uint8Array([1, 2, 3])
		);
		await expect(
			installVideosChirho({ ...valueChirho.optionsChirho, apply_chirho: true })
		).rejects.toThrow(/readback/);
		expect(valueChirho.objectChirho.mock.calls.every((rowChirho) => rowChirho[0] === 'GET')).toBe(
			true
		);
		valueChirho.objectChirho.mockClear();
		const conflictChirho = {
			...valueChirho.priorChirho[0],
			video_chirho: { ...valueChirho.videosChirho[0], review_chirho: 'approved' as const }
		};
		await valueChirho.jsonChirho(VIDEO_CATALOGUE_CHIRHO, {
			schema_version_chirho: 1,
			entries_chirho: [...valueChirho.priorChirho, conflictChirho]
		});
		await expect(
			installVideosChirho({ ...valueChirho.optionsChirho, apply_chirho: true })
		).rejects.toThrow(/replacement/);
		expect(valueChirho.objectChirho).not.toHaveBeenCalled();
	});
	it('reconciles received-unpublished objects after changed-source refusal with GET only', async () => {
		const valueChirho = await fixtureChirho(),
			pathChirho = `${valueChirho.homeChirho}/videos-records-chirho.json`,
			originalChirho = await readFileChirho(joinChirho(valueChirho.rootChirho, pathChirho));
		const normalChirho = valueChirho.objectChirho.getMockImplementation()!;
		let changedChirho = false;
		valueChirho.objectChirho.mockImplementation(async (methodChirho, keyChirho, bytesChirho) => {
			const resultChirho = await normalChirho(methodChirho, keyChirho, bytesChirho);
			if (methodChirho === 'GET' && resultChirho.ok && !changedChirho) {
				changedChirho = true;
				await valueChirho.putChirho(pathChirho, Buffer.concat([originalChirho, Buffer.from(' ')]));
			}
			return resultChirho;
		});
		await expect(
			installVideosChirho({ ...valueChirho.optionsChirho, apply_chirho: true })
		).rejects.toThrow(/source changed/);
		expect(
			JSON.parse(
				await readFileChirho(joinChirho(valueChirho.rootChirho, VIDEO_CATALOGUE_CHIRHO), 'utf8')
			).entries_chirho
		).toEqual(valueChirho.priorChirho);
		await valueChirho.putChirho(pathChirho, originalChirho);
		valueChirho.objectChirho.mockClear();
		await installVideosChirho({ ...valueChirho.optionsChirho, apply_chirho: true });
		expect(valueChirho.objectChirho.mock.calls.map((rowChirho) => rowChirho[0])).toEqual([
			'GET',
			'GET'
		]);
	});
	it('preserves a foreign catalogue edit made while the object is being reconciled', async () => {
		const valueChirho = await fixtureChirho(),
			normalChirho = valueChirho.objectChirho.getMockImplementation()!;
		let editedChirho = false;
		const foreignChirho =
			JSON.stringify({
				schema_version_chirho: 1,
				entries_chirho: valueChirho.priorChirho,
				foreign_chirho: true
			}) + '\n';
		valueChirho.objectChirho.mockImplementation(async (methodChirho, keyChirho, bytesChirho) => {
			const resultChirho = await normalChirho(methodChirho, keyChirho, bytesChirho);
			if (methodChirho === 'GET' && resultChirho.ok && !editedChirho) {
				editedChirho = true;
				await valueChirho.putChirho(VIDEO_CATALOGUE_CHIRHO, foreignChirho);
			}
			return resultChirho;
		});
		await expect(
			installVideosChirho({ ...valueChirho.optionsChirho, apply_chirho: true })
		).rejects.toThrow(/Foreign video catalogue edit/);
		expect(
			await readFileChirho(joinChirho(valueChirho.rootChirho, VIDEO_CATALOGUE_CHIRHO), 'utf8')
		).toBe(foreignChirho);
	});
	it('reconciles a lost PUT response by GET without resending the successful object', async () => {
		const valueChirho = await fixtureChirho(),
			normalChirho = valueChirho.objectChirho.getMockImplementation()!;
		let interruptedChirho = false;
		valueChirho.objectChirho.mockImplementation(async (methodChirho, keyChirho, bytesChirho) => {
			const resultChirho = await normalChirho(methodChirho, keyChirho, bytesChirho);
			if (methodChirho === 'PUT' && !interruptedChirho) {
				interruptedChirho = true;
				throw Error('Lost PUT response after saved object');
			}
			return resultChirho;
		});
		await expect(
			installVideosChirho({ ...valueChirho.optionsChirho, apply_chirho: true })
		).rejects.toThrow('Lost PUT response');
		expect(
			JSON.parse(
				await readFileChirho(joinChirho(valueChirho.rootChirho, VIDEO_CATALOGUE_CHIRHO), 'utf8')
			).entries_chirho
		).toEqual(valueChirho.priorChirho);
		valueChirho.objectChirho.mockClear();
		await installVideosChirho({ ...valueChirho.optionsChirho, apply_chirho: true });
		expect(valueChirho.objectChirho.mock.calls.map((rowChirho) => rowChirho[0])).toEqual([
			'GET',
			'GET'
		]);
	});
	it('refuses a displayed-scene change during archive without publishing the now-stale video', async () => {
		const valueChirho = await fixtureChirho(),
			normalChirho = valueChirho.objectChirho.getMockImplementation()!;
		let changedChirho = false;
		valueChirho.objectChirho.mockImplementation(async (methodChirho, keyChirho, bytesChirho) => {
			const responseChirho = await normalChirho(methodChirho, keyChirho, bytesChirho);
			if (methodChirho === 'GET' && responseChirho.ok && !changedChirho) {
				changedChirho = true;
				const pathChirho =
					'build-chirho/preview-chirho/public-chirho/media-chirho/genesis-chirho/chapter-03-chirho.json';
				const sceneChirho = JSON.parse(
					await readFileChirho(joinChirho(valueChirho.rootChirho, pathChirho), 'utf8')
				) as { scenes_chirho: { sha256_chirho: string }[] };
				sceneChirho.scenes_chirho[0].sha256_chirho = 'd'.repeat(64);
				await valueChirho.jsonChirho(pathChirho, sceneChirho);
			}
			return responseChirho;
		});
		await expect(
			installVideosChirho({ ...valueChirho.optionsChirho, apply_chirho: true })
		).rejects.toThrow('source changed after archive');
		expect(
			JSON.parse(
				await readFileChirho(joinChirho(valueChirho.rootChirho, VIDEO_CATALOGUE_CHIRHO), 'utf8')
			).entries_chirho
		).toEqual(valueChirho.priorChirho);
	});
	it('refuses catalogue growth beyond its current bound before any remote action', async () => {
		const valueChirho = await fixtureChirho();
		const entriesChirho = Array.from({ length: 1000 }, (_, indexChirho) => ({
			...valueChirho.priorChirho[0],
			video_chirho: {
				...valueChirho.priorChirho[0].video_chirho,
				lesson_id_chirho: `Prov.${Math.floor(indexChirho / 40) + 1}.${(indexChirho % 40) + 1}`
			}
		}));
		await valueChirho.jsonChirho(VIDEO_CATALOGUE_CHIRHO, {
			schema_version_chirho: 1,
			entries_chirho: entriesChirho
		});
		const beforeChirho = await readFileChirho(
			joinChirho(valueChirho.rootChirho, VIDEO_CATALOGUE_CHIRHO)
		);
		await expect(
			installVideosChirho({ ...valueChirho.optionsChirho, apply_chirho: true })
		).rejects.toThrow('sharding before archive');
		expect(valueChirho.objectChirho).not.toHaveBeenCalled();
		expect(
			await readFileChirho(joinChirho(valueChirho.rootChirho, VIDEO_CATALOGUE_CHIRHO))
		).toEqual(beforeChirho);
	});
	it('holds absent, invalid, or lower-ranked matching human clips rather than using a convenient fallback', async () => {
		for (const kindChirho of ['absent-chirho', 'invalid-source-chirho', 'unselected-chirho']) {
			const valueChirho = await fixtureChirho(),
				pathChirho = 'static/audio-chirho/genesis-chirho/chapter-03-chirho.json';
			const audioChirho = JSON.parse(
				await readFileChirho(joinChirho(valueChirho.rootChirho, pathChirho), 'utf8')
			) as { readings_chirho: Record<string, unknown>[] };
			if (kindChirho === 'absent-chirho') audioChirho.readings_chirho.shift();
			else if (kindChirho === 'invalid-source-chirho')
				audioChirho.readings_chirho[0].reading_source_chirho = {
					...valueChirho.videosChirho[0].embedded_reading_chirho,
					gbt_id_chirho: 'OT/RDB/Pro'
				};
			else
				audioChirho.readings_chirho.push({
					...audioChirho.readings_chirho[0],
					review_chirho: 'approved',
					reading_source_chirho: {
						...valueChirho.videosChirho[0].embedded_reading_chirho,
						start_chirho: 10,
						end_chirho: 11
					}
				});
			await valueChirho.jsonChirho(pathChirho, audioChirho);
			await valueChirho.jsonChirho('static/audio-chirho/manifest-chirho.json', {
				books_chirho: {
					Gen: {
						chapters_chirho: [
							{
								number_chirho: 3,
								path_chirho: '/audio-chirho/genesis-chirho/chapter-03-chirho.json',
								sha256_chirho: digestChirho(
									await readFileChirho(joinChirho(valueChirho.rootChirho, pathChirho))
								)
							}
						]
					}
				}
			});
			expect(
				await installVideosChirho({ ...valueChirho.optionsChirho, apply_chirho: true })
			).toMatchObject({ held_chirho: ['Gen.3.1'], archived_chirho: 1, installed_chirho: 32 });
			const entriesChirho = JSON.parse(
				await readFileChirho(joinChirho(valueChirho.rootChirho, VIDEO_CATALOGUE_CHIRHO), 'utf8')
			).entries_chirho as VideoEntryChirho[];
			expect(
				entriesChirho.some((rowChirho) => rowChirho.video_chirho.lesson_id_chirho === 'Gen.3.1')
			).toBe(false);
		}
	});
});

/** Real codecs, synthetic source claims and fixture-only transport; never a provider or public archive. */
async function finiteFixtureChirho(syntheticChirho = false) {
	const valueChirho = await fixtureChirho();
	const idChirho = syntheticChirho ? 'Matt.1.1' : 'Gen.3.1',
		bookChirho = syntheticChirho ? 'Matt' : 'Gen';
	const folderChirho = syntheticChirho ? 'matthew-chirho' : 'genesis-chirho',
		chapterChirho = syntheticChirho ? 1 : 3,
		suffixChirho = String(chapterChirho).padStart(2, '0');
	const homeChirho = 'workspace-chirho/video-chirho/finite-fixture-chirho';
	const audioFileChirho = homeChirho + '/reading-chirho.mp3';
	await mkdirChirho(dirnameChirho(joinChirho(valueChirho.rootChirho, audioFileChirho)), {
		recursive: true
	});
	execFileSyncChirho('ffmpeg', [
		'-v',
		'error',
		'-nostdin',
		'-n',
		'-i',
		joinChirho(valueChirho.rootChirho, 'fixture-chirho.mp4'),
		'-vn',
		'-ar',
		'44100',
		'-ac',
		'1',
		'-b:a',
		'64k',
		joinChirho(valueChirho.rootChirho, audioFileChirho)
	]);
	const audioBytesChirho = await readFileChirho(
		joinChirho(valueChirho.rootChirho, audioFileChirho)
	);
	const canonicalChirho = syntheticChirho ? 'λόγος' : 'א',
		scenePathChirho = '/assets-chirho/scenes-chirho/fixture-chirho.webp';
	const contentPathChirho = `/content-chirho/${folderChirho}/chapter-${suffixChirho}-chirho.json`,
		audioPathChirho = `/audio-chirho/${folderChirho}/chapter-${suffixChirho}-chirho.json`,
		mediaPathChirho = `/media-chirho/${folderChirho}/chapter-${suffixChirho}-chirho.json`;
	const videoChirho = structuredClone(valueChirho.videosChirho[0]);
	videoChirho.lesson_id_chirho = idChirho;
	videoChirho.canonical_sha256_chirho = digestChirho(canonicalChirho);
	const clipChirho = {
		lesson_id_chirho: idChirho,
		token_id_chirho: null,
		text_chirho: canonicalChirho,
		canonical_sha256_chirho: digestChirho(canonicalChirho),
		language_chirho: syntheticChirho ? 'el' : 'he',
		pronunciation_chirho: syntheticChirho ? 'modern_greek' : 'israeli_hebrew',
		voice_name_chirho: 'Fixture voice',
		asset_path_chirho: `/audio-chirho/sha256-chirho/${digestChirho(audioBytesChirho)}-chirho.mp3`,
		sha256_chirho: digestChirho(audioBytesChirho),
		bytes_chirho: audioBytesChirho.length,
		duration_chirho: 1,
		review_chirho: 'audition',
		...(syntheticChirho
			? {
					recipe_id_chirho: 'chatterbox-v3-modern-greek-verse-v1-chirho',
					synthesis_text_chirho: canonicalChirho
				}
			: {
					voice_name_chirho: "Rabbi Dan Be'eri",
					reading_source_chirho: videoChirho.embedded_reading_chirho
				})
	};
	if (syntheticChirho) {
		videoChirho.reading_language_chirho = 'el';
		videoChirho.embedded_reading_chirho = null;
		videoChirho.embedded_clip_chirho = {
			sha256_chirho: clipChirho.sha256_chirho,
			bytes_chirho: clipChirho.bytes_chirho,
			duration_chirho: 1,
			recipe_id_chirho: 'chatterbox-v3-modern-greek-verse-v1-chirho',
			pronunciation_chirho: 'modern_greek'
		};
		videoChirho.attribution_chirho = 'Hinneh / Love Jesus Software';
		videoChirho.license_chirho = 'CC BY 4.0';
		videoChirho.license_url_chirho = 'https://creativecommons.org/licenses/by/4.0/';
	}
	await valueChirho.jsonChirho('static' + contentPathChirho, {
		book_id_chirho: bookChirho,
		chapter_chirho: chapterChirho,
		verses_chirho: [
			{
				id_chirho: idChirho,
				canonical_text_chirho: canonicalChirho,
				tokens_chirho: [
					{
						id_chirho: 'word-chirho',
						text_chirho: canonicalChirho,
						start_chirho: 0,
						end_chirho: canonicalChirho.length
					}
				]
			}
		]
	});
	const contentShaChirho = digestChirho(
		await readFileChirho(joinChirho(valueChirho.rootChirho, 'static' + contentPathChirho))
	);
	await valueChirho.jsonChirho(`static/content-chirho/${folderChirho}/manifest-chirho.json`, {
		chapters_chirho: [{ path_chirho: contentPathChirho, sha256_chirho: contentShaChirho }]
	});
	const audioChirho = {
		schema_version_chirho: 1,
		book_id_chirho: bookChirho,
		chapter_chirho: chapterChirho,
		content_path_chirho: contentPathChirho,
		content_sha256_chirho: contentShaChirho,
		clips_chirho: syntheticChirho ? [clipChirho] : [],
		readings_chirho: syntheticChirho ? [] : [clipChirho]
	};
	const mediaChirho = {
		scenes_chirho: [
			{
				lesson_id_chirho: idChirho,
				sha256_chirho: videoChirho.scene_sha256_chirho,
				asset_path_chirho: scenePathChirho
			}
		]
	};
	await valueChirho.jsonChirho(
		'build-chirho/preview-chirho/public-chirho' + mediaPathChirho,
		mediaChirho
	);
	await valueChirho.jsonChirho(
		`build-chirho/preview-chirho/public-chirho/media-chirho/${folderChirho}/summary-chirho.json`,
		{
			chapters_chirho: [
				{
					path_chirho: mediaPathChirho,
					sha256_chirho: digestChirho(
						await readFileChirho(
							joinChirho(
								valueChirho.rootChirho,
								'build-chirho/preview-chirho/public-chirho' + mediaPathChirho
							)
						)
					)
				}
			]
		}
	);
	const sceneChirho = {
		lesson_id_chirho: idChirho,
		asset_path_chirho: scenePathChirho,
		sha256_chirho: videoChirho.scene_sha256_chirho,
		alt_chirho: 'Synthetic fixture'
	};
	const jobChirho = {
		lesson_id_chirho: idChirho,
		canonical_sha256_chirho: videoChirho.canonical_sha256_chirho,
		holds_chirho: [] as string[],
		scene_chirho: sceneChirho,
		high_quality_chirho: {
			ready_chirho: true,
			delivery_sha256_chirho: videoChirho.scene_sha256_chirho,
			source_sha256_chirho: 'a'.repeat(64),
			kind_chirho: 'upgrade_chirho'
		},
		picture_review_chirho: {
			accepted_chirho: true,
			scene_sha256_chirho: videoChirho.scene_sha256_chirho
		},
		audio_chirho: clipChirho
	};
	const inventoryChirho = [
		{
			lesson_id_chirho: idChirho,
			canonical_sha256_chirho: videoChirho.canonical_sha256_chirho,
			content_path_chirho: contentPathChirho,
			content_sha256_chirho: contentShaChirho,
			picture_prerequisite_met_chirho: true,
			scene_chirho: {
				...sceneChirho,
				source_sha256_chirho: 'a'.repeat(64),
				high_quality_chirho: true,
				quality_class_chirho: 'hq_upgrade_chirho',
				delivery_lineage_chirho: {
					source_sha256_chirho: 'a'.repeat(64),
					delivery_sha256_chirho: videoChirho.scene_sha256_chirho
				}
			},
			whole_verse_audio_chirho: { ready_chirho: true, selected_chirho: clipChirho }
		}
	];
	const proofChirho = {
		lesson_id_chirho: idChirho,
		video_chirho: videoChirho,
		audio_chirho: clipChirho,
		picture_review_chirho: jobChirho.picture_review_chirho,
		raw_scene_sha256_chirho: videoChirho.scene_sha256_chirho,
		raw_clip_path_chirho: 'fixture-chirho.mp4',
		raw_clip_sha256_chirho: valueChirho.shaChirho,
		raw_frame_review_chirho: { accepted_for_composition_chirho: true, all_frames_chirho: 24 },
		full_decode_chirho: true,
		soundtrack_correlation_chirho: 1,
		lag_ms_chirho: 0
	};
	const recordsChirho = { videos_chirho: [videoChirho] };
	const batchPathChirho = homeChirho + '/batch-chirho.json',
		proofPathChirho = homeChirho + '/build-proof-chirho.json';
	const entryChirho = {
		lesson_id_chirho: idChirho,
		mp4_path_chirho: 'fixture-chirho.mp4',
		audio_path_chirho: audioFileChirho,
		build_proof_chirho: { path_chirho: proofPathChirho, sha256_chirho: '' }
	};
	const batchChirho = {
		schema_version_chirho: 1,
		source_plan_chirho: { path_chirho: homeChirho + '/plan-chirho.json', sha256_chirho: '' },
		source_inventory_chirho: {
			path_chirho: homeChirho + '/inventory-chirho.json',
			sha256_chirho: ''
		},
		source_records_chirho: { path_chirho: homeChirho + '/records-chirho.json', sha256_chirho: '' },
		entries_chirho: [entryChirho]
	};
	const optionsChirho = {
		root_chirho: valueChirho.rootChirho,
		scope_chirho: 'finite_batch_chirho' as const,
		object_chirho: valueChirho.objectChirho,
		batch_chirho: { path_chirho: batchPathChirho, sha256_chirho: '' }
	};
	const commitChirho = async () => {
		await valueChirho.jsonChirho('static' + audioPathChirho, audioChirho);
		await valueChirho.jsonChirho('static/audio-chirho/manifest-chirho.json', {
			books_chirho: {
				[bookChirho]: {
					chapters_chirho: [
						{
							number_chirho: chapterChirho,
							path_chirho: audioPathChirho,
							sha256_chirho: digestChirho(
								await readFileChirho(joinChirho(valueChirho.rootChirho, 'static' + audioPathChirho))
							)
						}
					]
				}
			}
		});
		for (const [pinChirho, bodyChirho] of [
			[batchChirho.source_plan_chirho, { schema_version_chirho: 1, jobs_chirho: [jobChirho] }],
			[batchChirho.source_inventory_chirho, inventoryChirho],
			[batchChirho.source_records_chirho, recordsChirho],
			[entryChirho.build_proof_chirho, proofChirho]
		] as const) {
			await valueChirho.jsonChirho(pinChirho.path_chirho, bodyChirho);
			pinChirho.sha256_chirho = digestChirho(
				await readFileChirho(joinChirho(valueChirho.rootChirho, pinChirho.path_chirho))
			);
		}
		await valueChirho.jsonChirho(batchPathChirho, batchChirho);
		optionsChirho.batch_chirho.sha256_chirho = digestChirho(
			await readFileChirho(joinChirho(valueChirho.rootChirho, batchPathChirho))
		);
	};
	await commitChirho();
	return {
		...valueChirho,
		optionsChirho,
		batchChirho,
		entryChirho,
		jobChirho,
		inventoryChirho,
		proofChirho,
		recordsChirho,
		videoChirho,
		clipChirho,
		audioChirho,
		proofPathChirho,
		audioFileChirho,
		commitChirho
	};
}
describe.sequential('explicit finite chapter-opening video batches', () => {
	it('requires an exact path/hash pair before touching any source or transport', () => {
		expect(videoInstallArgumentsChirho([])).toMatchObject({
			scope_chirho: 'proverbs_openings_chirho',
			apply_chirho: false
		});
		expect(videoInstallArgumentsChirho(['--genesis3-chirho'])).toMatchObject({
			scope_chirho: 'genesis_three_chirho'
		});
		for (const argsChirho of [
			['--batch-chirho', 'private-chirho.json'],
			['--batch-sha256-chirho', 'a'.repeat(64)],
			['--batch-chirho', '../private.json', '--batch-sha256-chirho', 'a'.repeat(64)],
			[
				'--genesis3-chirho',
				'--batch-chirho',
				'batch-chirho.json',
				'--batch-sha256-chirho',
				'a'.repeat(64)
			]
		])
			expect(() => videoInstallArgumentsChirho(argsChirho)).toThrow();
	});
	for (const syntheticChirho of [false, true])
		it(`dry/apply/replay preserves prior objects with ${syntheticChirho ? 'synthetic' : 'human'} source`, async () => {
			const valueChirho = await finiteFixtureChirho(syntheticChirho);
			const originalChirho = await readFileChirho(
				joinChirho(valueChirho.rootChirho, VIDEO_CATALOGUE_CHIRHO)
			);
			await installVideosChirho(valueChirho.optionsChirho);
			expect(valueChirho.objectChirho).not.toHaveBeenCalled();
			expect(
				await readFileChirho(joinChirho(valueChirho.rootChirho, VIDEO_CATALOGUE_CHIRHO))
			).toEqual(originalChirho);
			expect(
				await installVideosChirho({ ...valueChirho.optionsChirho, apply_chirho: true })
			).toMatchObject({ archived_chirho: 1, installed_chirho: 32 });
			valueChirho.objectChirho.mockClear();
			const installedChirho = await readFileChirho(
				joinChirho(valueChirho.rootChirho, VIDEO_CATALOGUE_CHIRHO)
			);
			expect(JSON.parse(installedChirho.toString()).entries_chirho.slice(0, 31)).toEqual(
				valueChirho.priorChirho
			);
			await installVideosChirho({ ...valueChirho.optionsChirho, apply_chirho: true });
			expect(valueChirho.objectChirho).not.toHaveBeenCalled();
			expect(
				await readFileChirho(joinChirho(valueChirho.rootChirho, VIDEO_CATALOGUE_CHIRHO))
			).toEqual(installedChirho);
		});
	it('checks exact pins, HQ lineage, holds, frame approval and bytes before any archive request', async () => {
		for (const mutationChirho of [
			'hash',
			'count',
			'duplicate',
			'hq',
			'hold',
			'lineage',
			'frames',
			'source',
			'audio',
			'silent'
		] as const) {
			const valueChirho = await finiteFixtureChirho();
			if (mutationChirho === 'count')
				valueChirho.batchChirho.entries_chirho = Array(31).fill(valueChirho.entryChirho);
			if (mutationChirho === 'duplicate')
				valueChirho.batchChirho.entries_chirho.push(valueChirho.entryChirho);
			if (mutationChirho === 'hq') valueChirho.jobChirho.high_quality_chirho.ready_chirho = false;
			if (mutationChirho === 'hold') valueChirho.jobChirho.holds_chirho.push('held-chirho');
			if (mutationChirho === 'lineage')
				valueChirho.inventoryChirho[0].scene_chirho.delivery_lineage_chirho.source_sha256_chirho =
					'b'.repeat(64);
			if (mutationChirho === 'frames')
				valueChirho.proofChirho.raw_frame_review_chirho.accepted_for_composition_chirho = false;
			if (mutationChirho === 'source')
				valueChirho.proofChirho.raw_clip_sha256_chirho = 'b'.repeat(64);
			if (mutationChirho === 'silent') {
				valueChirho.videoChirho.embedded_reading_chirho = null;
				valueChirho.videoChirho.reading_language_chirho = null;
				valueChirho.videoChirho.license_chirho = 'CC0';
				valueChirho.videoChirho.license_url_chirho =
					'https://creativecommons.org/publicdomain/zero/1.0/';
			}
			await valueChirho.commitChirho();
			if (mutationChirho === 'hash')
				valueChirho.optionsChirho.batch_chirho.sha256_chirho = 'b'.repeat(64);
			if (mutationChirho === 'audio')
				await valueChirho.putChirho(valueChirho.audioFileChirho, new Uint8Array([1, 2, 3]));
			await expect(
				installVideosChirho({ ...valueChirho.optionsChirho, apply_chirho: true })
			).rejects.toThrow();
			expect(valueChirho.objectChirho).not.toHaveBeenCalled();
		}
	}, 30000);
	it('reconciles a received but unpublished finite object after a pinned proof changes, without another PUT', async () => {
		const valueChirho = await finiteFixtureChirho();
		const originalChirho = await readFileChirho(
			joinChirho(valueChirho.rootChirho, valueChirho.proofPathChirho)
		);
		const normalChirho = valueChirho.objectChirho.getMockImplementation()!;
		let changedChirho = false;
		valueChirho.objectChirho.mockImplementation(async (methodChirho, keyChirho, bytesChirho) => {
			const resultChirho = await normalChirho(methodChirho, keyChirho, bytesChirho);
			if (methodChirho === 'GET' && resultChirho.ok && !changedChirho) {
				changedChirho = true;
				await valueChirho.putChirho(
					valueChirho.proofPathChirho,
					Buffer.concat([originalChirho, Buffer.from(' ')])
				);
			}
			return resultChirho;
		});
		await expect(
			installVideosChirho({ ...valueChirho.optionsChirho, apply_chirho: true })
		).rejects.toThrow(/source changed/);
		expect(
			JSON.parse(
				await readFileChirho(joinChirho(valueChirho.rootChirho, VIDEO_CATALOGUE_CHIRHO), 'utf8')
			).entries_chirho
		).toEqual(valueChirho.priorChirho);
		await valueChirho.putChirho(valueChirho.proofPathChirho, originalChirho);
		valueChirho.objectChirho.mockClear();
		await installVideosChirho({ ...valueChirho.optionsChirho, apply_chirho: true });
		expect(valueChirho.objectChirho.mock.calls.map((rowChirho) => rowChirho[0])).toEqual(['GET']);
	});
	it('a finite video cannot keep an older convenient clip after the current preferred recording changes', async () => {
		const valueChirho = await finiteFixtureChirho(true);
		valueChirho.audioChirho.clips_chirho.push({
			...valueChirho.clipChirho,
			review_chirho: 'approved',
			sha256_chirho: '8'.repeat(64),
			asset_path_chirho: '/audio-chirho/sha256-chirho/' + '8'.repeat(64) + '-chirho.mp3'
		});
		await valueChirho.commitChirho();
		await expect(
			installVideosChirho({ ...valueChirho.optionsChirho, apply_chirho: true })
		).rejects.toThrow(/selected verse soundtrack changed/);
		expect(valueChirho.objectChirho).not.toHaveBeenCalled();
	});
});

describe.sequential('finite video selection matches the actual admitted reader recordings', () => {
	it('keeps preferred legacy clips and refuses profile-scoped verse claims before video matching', async () => {
		const chapterChirho = JSON.parse(
			await readFileChirho('static/content-chirho/john-chirho/chapter-01-chirho.json', 'utf8')
		);
		const lessonChirho = chapterChirho.verses_chirho.find(
			(rowChirho: GreekLessonChirho) => rowChirho.id_chirho === 'John.1.1'
		) as GreekLessonChirho;
		const audioChirho = JSON.parse(
			await readFileChirho('static/audio-chirho/john-chirho/chapter-01-chirho.json', 'utf8')
		);
		const clipsChirho = audioChirho.clips_chirho.filter(
			(rowChirho: RecordingChirho) =>
				rowChirho.lesson_id_chirho === lessonChirho.id_chirho && rowChirho.token_id_chirho === null
		) as RecordingChirho[];
		const legacyChirho = clipsChirho.find((rowChirho) => rowChirho.recipe_id_chirho === undefined)!;
		const recipeChirho = clipsChirho.find(
			(rowChirho) => rowChirho.recipe_id_chirho === 'modern-greek-phrasing-v1-chirho'
		)!;
		expect(legacyChirho.sha256_chirho).toBe(
			'92ddb8cc02a1ae2a2fc9042e1cf332de8fe950b3d02e5c82d7700f1a5bff7d6e'
		);
		let bytesChirho = '',
			clockChirho = Date.now();
		vi.spyOn(Date, 'now').mockImplementation(() => clockChirho);
		const fetchChirho = vi.fn(async (inputChirho: string | URL | Request) => {
			if (String(inputChirho) === '/audio-chirho/manifest-chirho.json')
				return Response.json({
					schema_version_chirho: 1,
					books_chirho: {
						John: {
							chapters_chirho: [
								{
									number_chirho: 1,
									path_chirho: '/audio-chirho/john-chirho/chapter-01-chirho.json',
									sha256_chirho: digestChirho(bytesChirho)
								}
							]
						}
					}
				});
			if (String(inputChirho) === '/audio-chirho/john-chirho/chapter-01-chirho.json')
				return new Response(bytesChirho);
			throw Error('No network allowed in source selection regression');
		});
		vi.stubGlobal('fetch', fetchChirho);
		const checkChirho = async (rowsChirho: RecordingChirho[], expectedChirho: string | null) => {
			clockChirho += 61001;
			bytesChirho = JSON.stringify({
				schema_version_chirho: 1,
				book_id_chirho: 'John',
				chapter_chirho: 1,
				clips_chirho: rowsChirho,
				readings_chirho: []
			});
			const admittedChirho = await recordingsForLessonChirho(lessonChirho);
			const aspiratesChirho = admittedChirho.some(
				(rowChirho) =>
					rowChirho.token_id_chirho === null &&
					rowChirho.pronunciation_chirho === 'modern_greek_aspirates'
			);
			const actualChirho = admittedChirho.find(
				(rowChirho) =>
					rowChirho.token_id_chirho === null &&
					(aspiratesChirho
						? rowChirho.pronunciation_chirho === 'modern_greek_aspirates' ||
							(rowChirho.pronunciation_chirho === 'modern_greek' &&
								!rowChirho.text_chirho.normalize('NFD').includes('\u0314'))
						: rowChirho.pronunciation_chirho === 'modern_greek')
			);
			expect(actualChirho?.sha256_chirho ?? null).toBe(expectedChirho);
			expect(selectedSyntheticVerseChirho(rowsChirho, lessonChirho)).toEqual(actualChirho);
			return actualChirho;
		};
		try {
			await checkChirho(
				clipsChirho,
				'7d137597d5744e3deea9c102170077b7977f3206f8804bce86b6d49ac447f5a1'
			);
			const preferredChirho = await checkChirho(
				[{ ...legacyChirho, review_chirho: 'approved' }, recipeChirho],
				legacyChirho.sha256_chirho
			);
			expect(preferredChirho?.recipe_id_chirho).toBeUndefined();
			for (const claimChirho of [
				{ source_context_chirho: 'profile_chirho' },
				{ profile_id_chirho: 'fixture-chirho' },
				{ id_chirho: 'profile-fixture-chirho' }
			])
				await checkChirho([{ ...recipeChirho, ...claimChirho }], null);
			const otherChirho = {
				...recipeChirho,
				sha256_chirho: 'a'.repeat(64),
				asset_path_chirho: '/audio-chirho/sha256-chirho/' + 'a'.repeat(64) + '-chirho.mp3',
				voice_name_chirho: 'Second fixture voice'
			};
			await checkChirho([recipeChirho, otherChirho], recipeChirho.sha256_chirho);
			await checkChirho([otherChirho, recipeChirho], otherChirho.sha256_chirho);
			await checkChirho(
				[recipeChirho, { ...otherChirho, review_chirho: 'approved' }],
				otherChirho.sha256_chirho
			);
			expect(recordingIdentityChirho(recipeChirho).raw_whole_verse_shape_chirho).toBe(true);
			expect(
				recordingIdentityChirho({ ...recipeChirho, start_offset_chirho: undefined })
					.raw_whole_verse_shape_chirho
			).toBe(false);
			expect(
				recordingIdentityChirho({ ...recipeChirho, reading_source_chirho: undefined })
					.raw_whole_verse_shape_chirho
			).toBe(false);
		} finally {
			vi.unstubAllGlobals();
			vi.restoreAllMocks();
		}
	});
	it('the JSON bridge is bounded, silent and uses exactly the same selected delivery/window identity', async () => {
		const chapterChirho = JSON.parse(
			await readFileChirho('static/content-chirho/john-chirho/chapter-01-chirho.json', 'utf8')
		);
		const lessonChirho = chapterChirho.verses_chirho.find(
			(rowChirho: GreekLessonChirho) => rowChirho.id_chirho === 'John.1.1'
		);
		const audioChirho = JSON.parse(
			await readFileChirho('static/audio-chirho/john-chirho/chapter-01-chirho.json', 'utf8')
		);
		const contentJsonChirho = await readFileChirho(
				'static/content-chirho/john-chirho/chapter-01-chirho.json',
				'utf8'
			),
			audioJsonChirho = await readFileChirho(
				'static/audio-chirho/john-chirho/chapter-01-chirho.json',
				'utf8'
			);
		const inputChirho = {
			lesson_id_chirho: lessonChirho.id_chirho,
			content_chapter_json_chirho: contentJsonChirho,
			content_sha256_chirho: digestChirho(contentJsonChirho),
			audio_chapter_json_chirho: audioJsonChirho,
			audio_sha256_chirho: digestChirho(audioJsonChirho)
		};
		const packetChirho = (audioChirho: unknown) => {
			const audioJsonChirho = JSON.stringify(audioChirho);
			return {
				...inputChirho,
				audio_chapter_json_chirho: audioJsonChirho,
				audio_sha256_chirho: digestChirho(audioJsonChirho)
			};
		};
		const runChirho = (valueChirho: string) =>
			spawnSyncChirho(
				'bun',
				['--no-env-file', 'scripts-chirho/video-chirho/selected_recording_chirho.ts'],
				{
					input: valueChirho,
					encoding: 'utf8',
					env: { PATH: process.env.PATH, HOME: process.env.HOME, TMPDIR: process.env.TMPDIR },
					maxBuffer: 1024 ** 2
				}
			);
		const resultChirho = runChirho(JSON.stringify(inputChirho));
		expect(resultChirho.status).toBe(0);
		expect(resultChirho.stderr).toBe('');
		const outputChirho = JSON.parse(resultChirho.stdout);
		expect(Object.keys(outputChirho).sort()).toEqual(['lesson_id_chirho', 'selected_chirho']);
		expect(outputChirho.lesson_id_chirho).toBe('John.1.1');
		expect(outputChirho.selected_chirho.sha256_chirho).toBe(
			'7d137597d5744e3deea9c102170077b7977f3206f8804bce86b6d49ac447f5a1'
		);
		expect(outputChirho.selected_chirho.raw_whole_verse_shape_chirho).toBe(true);
		const emptyChirho = runChirho(
			JSON.stringify(packetChirho({ ...audioChirho, clips_chirho: [], readings_chirho: [] }))
		);
		expect(emptyChirho.status).toBe(0);
		expect(emptyChirho.stderr).toBe('');
		expect(JSON.parse(emptyChirho.stdout)).toEqual({
			lesson_id_chirho: 'John.1.1',
			selected_chirho: null
		});
		for (const badChirho of [
			'{',
			JSON.stringify({ ...inputChirho, content_sha256_chirho: 'a'.repeat(64) }),
			JSON.stringify(packetChirho({ ...audioChirho, chapter_chirho: 2 })),
			JSON.stringify(
				packetChirho({
					...audioChirho,
					clips_chirho: Array(2001).fill(audioChirho.clips_chirho[0])
				})
			),
			' '.repeat(4 * 1024 ** 2 + 1)
		]) {
			const refusedChirho = runChirho(badChirho);
			expect(refusedChirho.status).not.toBe(0);
			expect(refusedChirho.stdout).toBe('');
			expect(refusedChirho.stderr).toMatch(/refused|exceeds four MiB/u);
		}
	});
});
