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
import { execFileSync as execFileSyncChirho } from 'node:child_process';
import {
	installVideosChirho,
	GENESIS_VIDEO_HOME_CHIRHO,
	PROVERBS_VIDEO_HOME_CHIRHO
} from '../../../scripts-chirho/video-chirho/install_chirho';
import { digestChirho } from '../../../scripts-chirho/publish-chirho/r2-chirho/object-store-chirho';
import {
	BEERI_ATTRIBUTION_CHIRHO,
	BEERI_LICENSE_URL_CHIRHO,
	type ReadingSourceChirho
} from '../../../src/lib/domain-chirho/pronunciation-chirho/reading-source-chirho';
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
