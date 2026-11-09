// For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life. — John 3:16 (KJV)
import { afterEach, describe, expect, it, vi } from 'vitest';
import {
	mkdtemp as mkdtempChirho,
	mkdir as mkdirChirho,
	readFile as readFileChirho,
	writeFile as writeFileChirho,
	rm as rmChirho,
	realpath as realpathChirho
} from 'node:fs/promises';
import { join as joinChirho, dirname as dirnameChirho } from 'node:path';
import { tmpdir as tmpdirChirho } from 'node:os';
import { execFileSync as execFileSyncChirho } from 'node:child_process';
import fixtureChirho from '../../fixtures-chirho/audio-chirho/beeri-bounded-chirho.json';
import { sha256Chirho } from '../../../scripts-chirho/audio-chirho/audition_chirho';
import { spokenVerseChirho } from '../../../src/lib/domain-chirho/pronunciation-chirho';
import { installBoundedPhaseChirho } from '../../../scripts-chirho/audio-chirho/readings-chirho/bounded_install_chirho';
import {
	BEERI_RUN_CHIRHO,
	type BoundedPhaseChirho
} from '../../../scripts-chirho/audio-chirho/readings-chirho/bounded_plan_chirho';
import {
	PROVERBS_PHASE_CHIRHO,
	PROVERBS_HOME_CHIRHO,
	decodeProverbsDefinitionChirho,
	verifyProverbsWindowChirho
} from '../../../scripts-chirho/audio-chirho/readings-chirho/proverbs_phase_chirho';
import type { CorrectionReadingChirho } from '../../../scripts-chirho/audio-chirho/readings-chirho/correction_chirho';
import type { PreparedReadingChirho } from '../../../scripts-chirho/audio-chirho/readings-chirho/validation_chirho';
const stateChirho = vi.hoisted(() => ({
	phase_chirho: null as unknown,
	source_chirho: null as unknown,
	interrupt_chirho: false
}));
vi.mock(
	'../../../scripts-chirho/audio-chirho/readings-chirho/proverbs_phase_chirho',
	async (originalChirho) => ({
		...(await originalChirho<object>()),
		loadProverbsDefinitionChirho: async () => stateChirho.source_chirho,
		readProverbsPhaseChirho: async () => stateChirho.phase_chirho
	})
);
vi.mock('../../../scripts-chirho/audio-chirho/audition_chirho', async (originalChirho) => {
	const actualChirho =
		await originalChirho<typeof import('../../../scripts-chirho/audio-chirho/audition_chirho')>();
	return {
		...actualChirho,
		writeChirho: async (pathChirho: string, bytesChirho: string | Uint8Array) => {
			await actualChirho.writeChirho(pathChirho, bytesChirho);
			if (
				stateChirho.interrupt_chirho &&
				pathChirho.endsWith('/static/audio-chirho/proverbs-chirho/chapter-03-chirho.json')
			) {
				stateChirho.interrupt_chirho = false;
				throw Error('Injected remainder interruption after chapter rename');
			}
		}
	};
});
const definitionBytesChirho = await readFileChirho(
	new URL('../../../data-chirho/audio-chirho/beeri-proverbs-remainder-chirho.json', import.meta.url)
);
const originalChirho = decodeProverbsDefinitionChirho(definitionBytesChirho);
const temporaryChirho: string[] = [];
afterEach(async () => {
	stateChirho.phase_chirho = null;
	stateChirho.source_chirho = null;
	stateChirho.interrupt_chirho = false;
	for (const pathChirho of temporaryChirho.splice(0))
		await rmChirho(pathChirho, { recursive: true, force: true });
});
function windowFixtureChirho() {
	const definitionChirho = structuredClone(originalChirho);
	const chapterChirho = definitionChirho.chapters_chirho[0];
	definitionChirho.chapters_chirho = [chapterChirho];
	definitionChirho.prior_proverbs_readings_chirho = 1;
	definitionChirho.added_readings_chirho = 2;
	chapterChirho.source_verses_chirho = 3;
	chapterChirho.timed_records_chirho = 2;
	chapterChirho.end_chirho = 1;
	chapterChirho.chapter_duration_chirho = 3.2;
	chapterChirho.spoken_sha256_chirho = sha256Chirho('opening');
	chapterChirho.windows_chirho = [2, 3].map((verseChirho) => ({
		lesson_id_chirho: `Prov.3.${verseChirho}`,
		start_chirho: verseChirho - 1,
		end_chirho: verseChirho === 2 ? 2 : 3.2,
		canonical_sha256_chirho: sha256Chirho(`canonical ${verseChirho}`),
		spoken_sha256_chirho: sha256Chirho(`spoken ${verseChirho}`)
	}));
	const timingBytesChirho = Buffer.alloc(22);
	for (let indexChirho = 0; indexChirho < 2; indexChirho++) {
		timingBytesChirho[indexChirho * 11] = 20;
		timingBytesChirho[indexChirho * 11 + 1] = 3;
		timingBytesChirho[indexChirho * 11 + 2] = indexChirho + 1;
		timingBytesChirho.writeUInt32BE((indexChirho + 1) * 100, indexChirho * 11 + 3);
	}
	definitionChirho.timings_sha256_chirho = sha256Chirho(timingBytesChirho);
	const readingsChirho: CorrectionReadingChirho[] = chapterChirho.windows_chirho.map(
		(windowChirho, indexChirho) => ({
			lesson_id_chirho: windowChirho.lesson_id_chirho,
			text_chirho: `spoken ${indexChirho + 2}`,
			canonical_sha256_chirho: windowChirho.canonical_sha256_chirho,
			content_path_chirho: chapterChirho.content_path_chirho,
			content_sha256_chirho: chapterChirho.content_sha256_chirho,
			source_correction_sha256_chirho: definitionChirho.source_evidence_sha256_chirho,
			source_chirho: {
				gbt_id_chirho: definitionChirho.gbt_id_chirho,
				package_sha256_chirho: definitionChirho.package_sha256_chirho,
				manifest_sha256_chirho: definitionChirho.manifest_sha256_chirho,
				timings_sha256_chirho: definitionChirho.timings_sha256_chirho,
				chapter_sha256_chirho: chapterChirho.chapter_sha256_chirho,
				chapter_duration_chirho: chapterChirho.chapter_duration_chirho,
				start_chirho: windowChirho.start_chirho,
				end_chirho: windowChirho.end_chirho
			}
		})
	);
	return {
		definitionChirho,
		chapterChirho,
		timingBytesChirho,
		readingsChirho,
		probeChirho: {
			sha256_chirho: chapterChirho.chapter_sha256_chirho,
			duration_chirho: chapterChirho.chapter_duration_chirho
		}
	};
}
async function fixtureRootChirho() {
	const rootChirho = await realpathChirho(
		await mkdtempChirho(joinChirho(tmpdirChirho(), 'beeri-remainder-chirho-'))
	);
	temporaryChirho.push(rootChirho);
	const putChirho = async (pathChirho: string, bytesChirho: string | Uint8Array) => {
		await mkdirChirho(dirnameChirho(joinChirho(rootChirho, pathChirho)), { recursive: true });
		await writeFileChirho(joinChirho(rootChirho, pathChirho), bytesChirho);
	};
	const valueChirho = windowFixtureChirho();
	const contentPathChirho = '/content-chirho/proverbs-chirho/chapter-03-chirho.json';
	const contentChirho = JSON.parse(
		await readFileChirho(
			new URL(
				'../../../static/content-chirho/proverbs-chirho/chapter-03-chirho.json',
				import.meta.url
			),
			'utf8'
		)
	);
	contentChirho.verses_chirho = contentChirho.verses_chirho.slice(0, 3);
	const contentBytesChirho = JSON.stringify(contentChirho) + '\n';
	await putChirho(`static${contentPathChirho}`, contentBytesChirho);
	await putChirho(
		'build-chirho/verse-media-2026-11-07-chirho/gbt-audio-manifest-chirho.jsonl',
		fixtureChirho.gbt_manifest_text_chirho
	);
	const sourceHomeChirho = `${BEERI_RUN_CHIRHO}/books-chirho/proverbs-chirho/source-chirho`;
	const sourcePathChirho = joinChirho(rootChirho, sourceHomeChirho, 'chapter-003-chirho.mp3');
	await mkdirChirho(dirnameChirho(sourcePathChirho), { recursive: true });
	execFileSyncChirho('ffmpeg', [
		'-v',
		'error',
		'-nostdin',
		'-n',
		'-f',
		'lavfi',
		'-i',
		'sine=frequency=330:duration=3',
		'-ar',
		'44100',
		'-ac',
		'1',
		'-c:a',
		'libmp3lame',
		'-b:a',
		'64k',
		sourcePathChirho
	]);
	const inspectChirho = (pathChirho: string) =>
		Number(
			execFileSyncChirho(
				'ffprobe',
				['-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', pathChirho],
				{ encoding: 'utf8' }
			).trim()
		);
	const sourceBytesChirho = await readFileChirho(sourcePathChirho);
	const durationChirho = inspectChirho(sourcePathChirho);
	await putChirho(`${sourceHomeChirho}/timings-chirho.bin`, valueChirho.timingBytesChirho);
	Object.assign(valueChirho.chapterChirho, {
		content_path_chirho: contentPathChirho,
		content_sha256_chirho: sha256Chirho(contentBytesChirho),
		canonical_sha256_chirho: sha256Chirho(contentChirho.verses_chirho[0].canonical_text_chirho),
		spoken_sha256_chirho: sha256Chirho(spokenVerseChirho(contentChirho.verses_chirho[0])),
		chapter_sha256_chirho: sha256Chirho(sourceBytesChirho),
		chapter_duration_chirho: durationChirho
	});
	const rowsChirho: PreparedReadingChirho[] = [];
	for (let indexChirho = 0; indexChirho < 2; indexChirho++) {
		const lessonChirho = contentChirho.verses_chirho[indexChirho + 1];
		const startChirho = indexChirho + 1,
			endChirho = indexChirho === 0 ? 2 : durationChirho;
		const pendingChirho = joinChirho(rootChirho, `cut-${indexChirho}-chirho.mp3`);
		execFileSyncChirho('ffmpeg', [
			'-v',
			'error',
			'-nostdin',
			'-n',
			'-ss',
			String(startChirho),
			'-i',
			sourcePathChirho,
			'-t',
			String(endChirho - startChirho),
			'-map_metadata',
			'-1',
			'-ar',
			'44100',
			'-ac',
			'1',
			'-c:a',
			'libmp3lame',
			'-b:a',
			'64k',
			pendingChirho
		]);
		const bytesChirho = await readFileChirho(pendingChirho),
			shaChirho = sha256Chirho(bytesChirho);
		const pathChirho = `${PROVERBS_HOME_CHIRHO}/books-chirho/proverbs-chirho/chapters-chirho/003-chirho/${shaChirho}-chirho.mp3`;
		await putChirho(pathChirho, bytesChirho);
		const windowChirho = valueChirho.chapterChirho.windows_chirho[indexChirho];
		Object.assign(windowChirho, {
			canonical_sha256_chirho: sha256Chirho(lessonChirho.canonical_text_chirho),
			spoken_sha256_chirho: sha256Chirho(spokenVerseChirho(lessonChirho)),
			end_chirho: endChirho
		});
		rowsChirho.push({
			lesson_id_chirho: lessonChirho.id_chirho,
			text_chirho: spokenVerseChirho(lessonChirho),
			canonical_sha256_chirho: windowChirho.canonical_sha256_chirho,
			content_path_chirho: contentPathChirho,
			content_sha256_chirho: sha256Chirho(contentBytesChirho),
			path_chirho: pathChirho,
			sha256_chirho: shaChirho,
			bytes_chirho: bytesChirho.length,
			duration_chirho: inspectChirho(pendingChirho),
			source_correction_sha256_chirho: valueChirho.definitionChirho.source_evidence_sha256_chirho,
			source_chirho: {
				...valueChirho.readingsChirho[indexChirho].source_chirho,
				chapter_sha256_chirho: sha256Chirho(sourceBytesChirho),
				chapter_duration_chirho: durationChirho,
				start_chirho: startChirho,
				end_chirho: endChirho,
				files_chirho: {},
				attribution_chirho: 'synthetic test source',
				license_chirho: 'CC BY-SA 3.0',
				license_url_chirho: 'https://creativecommons.org/licenses/by-sa/3.0/'
			}
		});
	}
	const manifestPathChirho = `${PROVERBS_HOME_CHIRHO}/books-chirho/proverbs-chirho/chapters-chirho/003-chirho/manifest-chirho.json`;
	const manifestTextChirho =
		JSON.stringify({
			content_sha256_chirho: sha256Chirho(contentBytesChirho),
			recordings_chirho: rowsChirho
		}) + '\n';
	await putChirho(manifestPathChirho, manifestTextChirho);
	const phaseChirho: BoundedPhaseChirho = {
		id_chirho: PROVERBS_PHASE_CHIRHO,
		readings_chirho: 2,
		chapters_chirho: [
			{
				book_id_chirho: 'Prov',
				chapter_chirho: 3,
				prepared_manifest_path_chirho: manifestPathChirho,
				prepared_manifest_sha256_chirho: sha256Chirho(manifestTextChirho),
				canonical_chapter_sha256_chirho: sha256Chirho(contentBytesChirho),
				source_chapter_sha256_chirho: sha256Chirho(sourceBytesChirho),
				readings_chirho: 2
			}
		]
	};
	const audioPathChirho = 'static/audio-chirho/proverbs-chirho/chapter-03-chirho.json';
	const oldChirho = {
		id_chirho: 'beeri-prov-3-1-chirho',
		lesson_id_chirho: 'Prov.3.1',
		sha256_chirho: 'a'.repeat(64),
		old_evidence_chirho: 'preserve exactly'
	};
	const chapterChirho = {
		schema_version_chirho: 1,
		book_id_chirho: 'Prov',
		chapter_chirho: 3,
		content_path_chirho: contentPathChirho,
		content_sha256_chirho: sha256Chirho(contentBytesChirho),
		clips_chirho: [{ id_chirho: 'existing-word-chirho', metadata_chirho: 'unchanged' }],
		readings_chirho: [oldChirho],
		videos_chirho: [{ id_chirho: 'existing-video-chirho' }]
	};
	const audioTextChirho = JSON.stringify(chapterChirho) + '\n';
	await putChirho(audioPathChirho, audioTextChirho);
	const indexPathChirho = 'static/audio-chirho/manifest-chirho.json';
	const indexTextChirho =
		JSON.stringify({
			schema_version_chirho: 1,
			books_chirho: {
				Prov: {
					chapters_chirho: [
						{
							number_chirho: 3,
							path_chirho: audioPathChirho.slice(6),
							sha256_chirho: sha256Chirho(audioTextChirho)
						}
					]
				}
			}
		}) + '\n';
	await putChirho(indexPathChirho, indexTextChirho);
	stateChirho.phase_chirho = phaseChirho;
	stateChirho.source_chirho = {
		definition_chirho: valueChirho.definitionChirho,
		prior_plan_chirho: [{ path_chirho: audioPathChirho.slice(6), clips_chirho: [oldChirho] }]
	};
	const preservedChirho = new Map<string, Buffer>([
		[`${sourceHomeChirho}/chapter-003-chirho.mp3`, sourceBytesChirho],
		[`${sourceHomeChirho}/timings-chirho.bin`, valueChirho.timingBytesChirho]
	]);
	for (const nameChirho of ['hold-chirho.json', 'manifest-chirho.json']) {
		const pathChirho = `${BEERI_RUN_CHIRHO}/books-chirho/proverbs-chirho/chapters-chirho/003-chirho/${nameChirho}`;
		const bytesChirho = Buffer.from(`{"old_chirho":"${nameChirho}"}\n`);
		await putChirho(pathChirho, bytesChirho);
		preservedChirho.set(pathChirho, bytesChirho);
	}
	const objectsChirho = new Map<string, Uint8Array>();
	const fetchChirho = vi.fn<typeof fetch>(async (inputChirho, initChirho) => {
		const keyChirho = String(inputChirho);
		if (initChirho?.method === 'PUT') {
			objectsChirho.set(keyChirho, new Uint8Array(initChirho.body as Uint8Array));
			return new Response('');
		}
		return new Response(new Uint8Array(objectsChirho.get(keyChirho) ?? []));
	});
	return {
		rootChirho,
		putChirho,
		rowsChirho,
		phaseChirho,
		manifestPathChirho,
		manifestTextChirho,
		audioPathChirho,
		audioTextChirho,
		indexPathChirho,
		indexTextChirho,
		oldChirho,
		chapterChirho,
		preservedChirho,
		fetchChirho,
		installChirho: (applyChirho: boolean) =>
			installBoundedPhaseChirho(rootChirho, PROVERBS_PHASE_CHIRHO, applyChirho, {
				target_chirho: {
					account_chirho: '1'.repeat(28) + '84bd',
					bucket_chirho: 'hinneh-media-chirho',
					email_chirho: 'stub-chirho',
					api_key_chirho: 'stub-chirho'
				},
				fetch_chirho: fetchChirho,
				sleep_chirho: async () => {}
			})
	};
}
describe('finite remaining Proverbs cuts', () => {
	it('pins the full342 record and admits only shifted exact windows, including the source-duration tail', () => {
		expect(originalChirho.chapters_chirho).toHaveLength(12);
		expect(
			originalChirho.chapters_chirho.flatMap((rowChirho) => rowChirho.windows_chirho)
		).toHaveLength(342);
		expect(() =>
			decodeProverbsDefinitionChirho(Buffer.concat([definitionBytesChirho, Buffer.of(32)]))
		).toThrow(/definition changed/);
		const valueChirho = windowFixtureChirho();
		for (const readingChirho of valueChirho.readingsChirho)
			expect(
				verifyProverbsWindowChirho(
					valueChirho.definitionChirho,
					readingChirho,
					valueChirho.timingBytesChirho,
					valueChirho.probeChirho,
					'opening'
				)
			).toEqual({
				start_chirho: readingChirho.source_chirho.start_chirho,
				end_chirho: readingChirho.source_chirho.end_chirho
			});
	});
	it('refuses missing evidence, foreign verses and substituted canonical, source, text or timing windows', () => {
		const valueChirho = windowFixtureChirho(),
			readingChirho = valueChirho.readingsChirho[0];
		for (const changedChirho of [
			{ ...readingChirho, lesson_id_chirho: 'Prov.3.1' },
			{ ...readingChirho, lesson_id_chirho: 'Prov.4.2' },
			{ ...readingChirho, source_correction_sha256_chirho: undefined },
			{ ...readingChirho, source_correction_sha256_chirho: 'f'.repeat(64) },
			{ ...readingChirho, text_chirho: 'another verse' },
			{ ...readingChirho, canonical_sha256_chirho: 'f'.repeat(64) },
			{ ...readingChirho, content_sha256_chirho: 'f'.repeat(64) },
			{
				...readingChirho,
				source_chirho: { ...readingChirho.source_chirho, package_sha256_chirho: 'f'.repeat(64) }
			},
			{ ...readingChirho, source_chirho: { ...readingChirho.source_chirho, start_chirho: 0 } },
			{ ...readingChirho, source_chirho: { ...readingChirho.source_chirho, end_chirho: 2.01 } }
		])
			expect(() =>
				verifyProverbsWindowChirho(
					valueChirho.definitionChirho,
					changedChirho,
					valueChirho.timingBytesChirho,
					valueChirho.probeChirho,
					'opening'
				)
			).toThrow();
		const duplicatedChirho = Buffer.from(valueChirho.timingBytesChirho);
		duplicatedChirho[13] = 1;
		const hashChirho = sha256Chirho(duplicatedChirho);
		expect(() =>
			verifyProverbsWindowChirho(
				{ ...valueChirho.definitionChirho, timings_sha256_chirho: hashChirho },
				{
					...readingChirho,
					source_chirho: { ...readingChirho.source_chirho, timings_sha256_chirho: hashChirho }
				},
				duplicatedChirho,
				valueChirho.probeChirho,
				'opening'
			)
		).toThrow(/timing pattern/);
	});
	it('uses real source validation and recoverable commit, then cold-replays without fetch while retaining prior metadata and old phase files', async () => {
		const valueChirho = await fixtureRootChirho();
		expect(await valueChirho.installChirho(false)).toMatchObject({
			readings_chirho: 2,
			writes_chirho: 0
		});
		expect(valueChirho.fetchChirho).not.toHaveBeenCalled();
		stateChirho.interrupt_chirho = true;
		await expect(valueChirho.installChirho(true)).rejects.toThrow(/Injected remainder/);
		expect(
			await readFileChirho(joinChirho(valueChirho.rootChirho, valueChirho.indexPathChirho), 'utf8')
		).toBe(valueChirho.indexTextChirho);
		expect(valueChirho.fetchChirho).toHaveBeenCalledTimes(4);
		valueChirho.fetchChirho.mockClear();
		valueChirho.fetchChirho.mockImplementation(async () => {
			throw Error('Recovery/replay must not fetch');
		});
		await valueChirho.installChirho(true);
		const installedBytesChirho = await readFileChirho(
			joinChirho(valueChirho.rootChirho, valueChirho.audioPathChirho)
		);
		const installedChirho = JSON.parse(installedBytesChirho.toString());
		expect(installedChirho.readings_chirho).toHaveLength(3);
		expect(installedChirho.readings_chirho[0]).toEqual(valueChirho.oldChirho);
		expect(installedChirho.clips_chirho).toEqual(valueChirho.chapterChirho.clips_chirho);
		expect(installedChirho.videos_chirho).toEqual(valueChirho.chapterChirho.videos_chirho);
		expect(
			installedChirho.readings_chirho
				.slice(1)
				.map((rowChirho: { lesson_id_chirho: string }) => rowChirho.lesson_id_chirho)
		).toEqual(['Prov.3.2', 'Prov.3.3']);
		expect(await valueChirho.installChirho(true)).toMatchObject({
			replayed_chirho: true,
			writes_chirho: 0
		});
		expect(valueChirho.fetchChirho).not.toHaveBeenCalled();
		expect(
			await readFileChirho(joinChirho(valueChirho.rootChirho, valueChirho.audioPathChirho))
		).toEqual(installedBytesChirho);
		for (const [pathChirho, bytesChirho] of valueChirho.preservedChirho)
			expect(await readFileChirho(joinChirho(valueChirho.rootChirho, pathChirho))).toEqual(
				bytesChirho
			);
	}, 15000);
	it('refuses a changed prepared phase or prior human object before archive', async () => {
		const valueChirho = await fixtureRootChirho();
		await valueChirho.putChirho(
			valueChirho.manifestPathChirho,
			valueChirho.manifestTextChirho + ' '
		);
		await expect(valueChirho.installChirho(true)).rejects.toThrow(/Frozen prepared manifest/);
		await valueChirho.putChirho(valueChirho.manifestPathChirho, valueChirho.manifestTextChirho);
		const alteredChirho = JSON.parse(valueChirho.audioTextChirho);
		alteredChirho.readings_chirho[0].sha256_chirho = 'f'.repeat(64);
		const textChirho = JSON.stringify(alteredChirho) + '\n';
		await valueChirho.putChirho(valueChirho.audioPathChirho, textChirho);
		const indexChirho = JSON.parse(valueChirho.indexTextChirho);
		indexChirho.books_chirho.Prov.chapters_chirho[0].sha256_chirho = sha256Chirho(textChirho);
		await valueChirho.putChirho(valueChirho.indexPathChirho, JSON.stringify(indexChirho));
		await expect(valueChirho.installChirho(true)).rejects.toThrow(/Prior Proverbs reading/);
		expect(valueChirho.fetchChirho).not.toHaveBeenCalled();
	}, 15000);
});
