// For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life. — John 3:16 (KJV)
import { afterEach, describe, expect, it, vi } from 'vitest';
import {
	mkdtemp as mkdtempChirho,
	mkdir as mkdirChirho,
	writeFile as writeFileChirho,
	readFile as readFileChirho,
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
	type BoundedPlanChirho,
	type BoundedPhaseChirho
} from '../../../scripts-chirho/audio-chirho/readings-chirho/bounded_plan_chirho';
import {
	readingContextChirho,
	validatePreparedChapterChirho,
	type PreparedReadingChirho
} from '../../../scripts-chirho/audio-chirho/readings-chirho/validation_chirho';
import type { TargetChirho } from '../../../scripts-chirho/publish-chirho/r2_upload_watch_chirho';

const stateChirho = vi.hoisted(() => ({ plan_chirho: null as unknown, interrupt_chirho: false }));
vi.mock(
	'../../../scripts-chirho/audio-chirho/readings-chirho/bounded_plan_chirho',
	async (originalChirho) => ({
		...(await originalChirho<object>()),
		readBoundedPlanChirho: async () => stateChirho.plan_chirho
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
				pathChirho.endsWith('/static/audio-chirho/obadiah-chirho/chapter-01-chirho.json')
			) {
				stateChirho.interrupt_chirho = false;
				throw Error('Injected process interruption after chapter rename');
			}
		}
	};
});
const temporaryChirho: string[] = [];
afterEach(async () => {
	stateChirho.interrupt_chirho = false;
	stateChirho.plan_chirho = null;
	for (const pathChirho of temporaryChirho.splice(0))
		await rmChirho(pathChirho, { recursive: true, force: true });
});
async function fixtureRootChirho() {
	const rootChirho = await realpathChirho(
		await mkdtempChirho(joinChirho(tmpdirChirho(), 'beeri-bounded-chirho-'))
	);
	temporaryChirho.push(rootChirho);
	const putChirho = async (pathChirho: string, bytesChirho: string | Uint8Array) => {
		await mkdirChirho(dirnameChirho(joinChirho(rootChirho, pathChirho)), { recursive: true });
		await writeFileChirho(joinChirho(rootChirho, pathChirho), bytesChirho);
	};
	const contentPathChirho = '/content-chirho/obadiah-chirho/chapter-01-chirho.json';
	const chapterTextChirho = JSON.stringify(fixtureChirho.chapter_chirho) + '\n';
	await putChirho(`static${contentPathChirho}`, chapterTextChirho);
	await putChirho(
		'build-chirho/verse-media-2026-11-07-chirho/gbt-audio-manifest-chirho.jsonl',
		fixtureChirho.gbt_manifest_text_chirho
	);
	const sourceHomeChirho = `${BEERI_RUN_CHIRHO}/books-chirho/obadiah-chirho/source-chirho`;
	await mkdirChirho(joinChirho(rootChirho, sourceHomeChirho), { recursive: true });
	const sourcePathChirho = joinChirho(rootChirho, sourceHomeChirho, 'chapter-001-chirho.mp3');
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
	const sourceBytesChirho = await readFileChirho(sourcePathChirho);
	const durationChirho = Number(
		execFileSyncChirho(
			'ffprobe',
			['-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', sourcePathChirho],
			{ encoding: 'utf8' }
		).trim()
	);
	const timingsChirho = Buffer.alloc(22);
	for (let indexChirho = 0; indexChirho < 2; indexChirho++) {
		timingsChirho[indexChirho * 11] = 31;
		timingsChirho[indexChirho * 11 + 1] = 1;
		timingsChirho[indexChirho * 11 + 2] = indexChirho + 1;
		timingsChirho.writeUInt32BE(indexChirho * 150, indexChirho * 11 + 3);
		timingsChirho.writeUInt32BE((indexChirho + 1) * 150, indexChirho * 11 + 7);
	}
	await putChirho(`${sourceHomeChirho}/timings-chirho.bin`, timingsChirho);
	const packageChirho = fixtureChirho.gbt_manifest_text_chirho
		.trim()
		.split('\n')
		.map((lineChirho) => JSON.parse(lineChirho))
		.find((rowChirho) => rowChirho.id === 'OT/RDB/Oba');
	const rowsChirho: PreparedReadingChirho[] = [];
	for (let indexChirho = 0; indexChirho < 2; indexChirho++) {
		const pathChirho = joinChirho(rootChirho, `tone-${indexChirho}-chirho.mp3`);
		execFileSyncChirho('ffmpeg', [
			'-v',
			'error',
			'-nostdin',
			'-n',
			'-f',
			'lavfi',
			'-i',
			`sine=frequency=${440 + indexChirho * 110}:duration=1.5`,
			'-ar',
			'44100',
			'-ac',
			'1',
			'-c:a',
			'libmp3lame',
			'-b:a',
			'64k',
			pathChirho
		]);
		const bytesChirho = await readFileChirho(pathChirho),
			shaChirho = sha256Chirho(bytesChirho);
		const lessonChirho = fixtureChirho.chapter_chirho.verses_chirho[indexChirho];
		const relativeChirho = `${BEERI_RUN_CHIRHO}/books-chirho/obadiah-chirho/chapters-chirho/001-chirho/${shaChirho}-chirho.mp3`;
		await putChirho(relativeChirho, bytesChirho);
		rowsChirho.push({
			lesson_id_chirho: lessonChirho.id_chirho,
			text_chirho: spokenVerseChirho(lessonChirho),
			canonical_sha256_chirho: sha256Chirho(lessonChirho.canonical_text_chirho),
			content_path_chirho: contentPathChirho,
			content_sha256_chirho: sha256Chirho(chapterTextChirho),
			path_chirho: relativeChirho,
			sha256_chirho: shaChirho,
			bytes_chirho: bytesChirho.length,
			duration_chirho: 1.5,
			source_chirho: {
				gbt_id_chirho: 'OT/RDB/Oba',
				package_sha256_chirho: packageChirho.sha256,
				chapter_sha256_chirho: sha256Chirho(sourceBytesChirho),
				timings_sha256_chirho: sha256Chirho(timingsChirho),
				start_chirho: indexChirho * 1.5,
				end_chirho: indexChirho === 0 ? 1.5 : durationChirho,
				chapter_duration_chirho: durationChirho,
				attribution_chirho: 'unused producer field',
				license_chirho: 'CC BY-SA 3.0',
				license_url_chirho: 'unused producer field',
				files_chirho: {},
				manifest_sha256_chirho: sha256Chirho(fixtureChirho.gbt_manifest_text_chirho)
			}
		});
	}
	const manifestPathChirho = `${BEERI_RUN_CHIRHO}/books-chirho/obadiah-chirho/chapters-chirho/001-chirho/manifest-chirho.json`;
	const manifestTextChirho = JSON.stringify({ recordings_chirho: rowsChirho }) + '\n';
	await putChirho(manifestPathChirho, manifestTextChirho);
	const phaseChirho: BoundedPhaseChirho = {
		id_chirho: 'batch-001-chirho',
		readings_chirho: 2,
		chapters_chirho: [
			{
				book_id_chirho: 'Obad',
				chapter_chirho: 1,
				prepared_manifest_path_chirho: manifestPathChirho,
				prepared_manifest_sha256_chirho: sha256Chirho(manifestTextChirho),
				canonical_chapter_sha256_chirho: sha256Chirho(chapterTextChirho),
				source_chapter_sha256_chirho: sha256Chirho(sourceBytesChirho),
				readings_chirho: 2
			}
		]
	};
	stateChirho.plan_chirho = {
		schema_version_chirho: 1,
		audit_sha256_chirho: 'a'.repeat(64),
		run_chirho: BEERI_RUN_CHIRHO,
		readings_chirho: 2,
		chapters_chirho: 1,
		excluded_chirho: [],
		phases_chirho: [phaseChirho]
	} satisfies BoundedPlanChirho;
	const audioPathChirho = 'static/audio-chirho/obadiah-chirho/chapter-01-chirho.json';
	const audioTextChirho =
		JSON.stringify({
			schema_version_chirho: 1,
			book_id_chirho: 'Obad',
			chapter_chirho: 1,
			content_path_chirho: contentPathChirho,
			content_sha256_chirho: sha256Chirho(chapterTextChirho),
			clips_chirho: []
		}) + '\n';
	await putChirho(audioPathChirho, audioTextChirho);
	const indexPathChirho = 'static/audio-chirho/manifest-chirho.json';
	const indexTextChirho =
		JSON.stringify({
			schema_version_chirho: 1,
			books_chirho: {
				Obad: {
					chapters_chirho: [
						{
							number_chirho: 1,
							path_chirho: '/audio-chirho/obadiah-chirho/chapter-01-chirho.json',
							sha256_chirho: sha256Chirho(audioTextChirho)
						}
					]
				}
			}
		}) + '\n';
	await putChirho(indexPathChirho, indexTextChirho);
	const targetChirho: TargetChirho = {
		account_chirho: '1'.repeat(28) + '84bd',
		bucket_chirho: 'hinneh-media-chirho',
		email_chirho: 'stub-chirho',
		api_key_chirho: 'stub-chirho'
	};
	const objectsChirho = new Map<string, Uint8Array>();
	const fetchChirho = vi.fn<typeof fetch>(async (inputChirho, initChirho) => {
		const keyChirho = String(inputChirho);
		if (initChirho?.method === 'PUT') {
			objectsChirho.set(keyChirho, new Uint8Array(initChirho.body as Uint8Array));
			return new Response('');
		}
		const bytesChirho = objectsChirho.get(keyChirho);
		return new Response(bytesChirho ? new Uint8Array(bytesChirho) : undefined);
	});
	const archiveChirho = {
		target_chirho: targetChirho,
		fetch_chirho: fetchChirho,
		sleep_chirho: async () => {}
	};
	return {
		rootChirho,
		putChirho,
		rowsChirho,
		phaseChirho,
		manifestPathChirho,
		manifestTextChirho,
		contentPathChirho,
		chapterTextChirho,
		sourceHomeChirho,
		audioPathChirho,
		audioTextChirho,
		indexPathChirho,
		indexTextChirho,
		archiveChirho,
		fetchChirho,
		objectsChirho
	};
}
describe('bounded Beeri archive and catalogue recovery', () => {
	it('archives before commit and cold-replays completed source-bound clips with zero fetches, preserving unrelated index additions and unknown receipts', async () => {
		const valueChirho = await fixtureRootChirho();
		const unknownChirho =
			'{"outcome_chirho":"unknown","task_uuid_chirho":"do-not-remove-chirho"}\n';
		await valueChirho.putChirho(
			'build-chirho/r2-chirho/audio-receipts-chirho.jsonl',
			unknownChirho
		);
		expect(
			(await installBoundedPhaseChirho(valueChirho.rootChirho, 'batch-001-chirho', false))
				.writes_chirho
		).toBe(0);
		expect(valueChirho.fetchChirho).not.toHaveBeenCalled();
		expect(
			(
				await installBoundedPhaseChirho(
					valueChirho.rootChirho,
					'batch-001-chirho',
					true,
					valueChirho.archiveChirho
				)
			).writes_chirho
		).toBe(2);
		expect(valueChirho.fetchChirho).toHaveBeenCalledTimes(4);
		const indexChirho = JSON.parse(
			await readFileChirho(joinChirho(valueChirho.rootChirho, valueChirho.indexPathChirho), 'utf8')
		);
		indexChirho.books_chirho.Later_chirho = { chapters_chirho: [] };
		await valueChirho.putChirho(valueChirho.indexPathChirho, JSON.stringify(indexChirho) + '\n');
		valueChirho.fetchChirho.mockClear();
		const beforeChirho = await readFileChirho(
			joinChirho(valueChirho.rootChirho, valueChirho.indexPathChirho)
		);
		expect(
			await installBoundedPhaseChirho(
				valueChirho.rootChirho,
				'batch-001-chirho',
				true,
				valueChirho.archiveChirho
			)
		).toMatchObject({ replayed_chirho: true, writes_chirho: 0 });
		expect(valueChirho.fetchChirho).not.toHaveBeenCalled();
		expect(
			await readFileChirho(joinChirho(valueChirho.rootChirho, valueChirho.indexPathChirho))
		).toEqual(beforeChirho);
		expect(
			(
				await readFileChirho(
					joinChirho(valueChirho.rootChirho, 'build-chirho/r2-chirho/audio-receipts-chirho.jsonl'),
					'utf8'
				)
			).startsWith(unknownChirho)
		).toBe(true);
	});
	it('recovers a real partial chapter/index commit before old coherence checks, without another upload', async () => {
		const valueChirho = await fixtureRootChirho();
		stateChirho.interrupt_chirho = true;
		await expect(
			installBoundedPhaseChirho(
				valueChirho.rootChirho,
				'batch-001-chirho',
				true,
				valueChirho.archiveChirho
			)
		).rejects.toThrow(/Injected/);
		expect(
			await readFileChirho(joinChirho(valueChirho.rootChirho, valueChirho.indexPathChirho), 'utf8')
		).toBe(valueChirho.indexTextChirho);
		expect(
			await readFileChirho(joinChirho(valueChirho.rootChirho, valueChirho.audioPathChirho), 'utf8')
		).not.toBe(valueChirho.audioTextChirho);
		valueChirho.fetchChirho.mockClear();
		await installBoundedPhaseChirho(
			valueChirho.rootChirho,
			'batch-001-chirho',
			true,
			valueChirho.archiveChirho
		);
		expect(valueChirho.fetchChirho).not.toHaveBeenCalled();
	});
	it('refuses a foreign edit during partial recovery and preserves it without network', async () => {
		const valueChirho = await fixtureRootChirho();
		stateChirho.interrupt_chirho = true;
		await expect(
			installBoundedPhaseChirho(
				valueChirho.rootChirho,
				'batch-001-chirho',
				true,
				valueChirho.archiveChirho
			)
		).rejects.toThrow();
		const foreignChirho = '{"foreign_chirho":true}\n';
		await valueChirho.putChirho(valueChirho.audioPathChirho, foreignChirho);
		valueChirho.fetchChirho.mockClear();
		await expect(
			installBoundedPhaseChirho(
				valueChirho.rootChirho,
				'batch-001-chirho',
				true,
				valueChirho.archiveChirho
			)
		).rejects.toThrow(/Foreign catalogue edit/);
		expect(
			await readFileChirho(joinChirho(valueChirho.rootChirho, valueChirho.audioPathChirho), 'utf8')
		).toBe(foreignChirho);
		expect(valueChirho.fetchChirho).not.toHaveBeenCalled();
	});
	it('retains successful partial archive receipts and never publishes after failed readback; cold resume uploads only the unreceipted object', async () => {
		const valueChirho = await fixtureRootChirho();
		const normalChirho = valueChirho.fetchChirho.getMockImplementation()!;
		let corruptChirho = true;
		valueChirho.fetchChirho.mockImplementation(async (inputChirho, initChirho) =>
			initChirho?.method === 'GET' &&
			String(inputChirho).includes(valueChirho.rowsChirho[1].sha256_chirho) &&
			corruptChirho
				? new Response('wrong')
				: normalChirho(inputChirho, initChirho)
		);
		await expect(
			installBoundedPhaseChirho(
				valueChirho.rootChirho,
				'batch-001-chirho',
				true,
				valueChirho.archiveChirho
			)
		).rejects.toThrow(/readback differs/);
		expect(
			await readFileChirho(joinChirho(valueChirho.rootChirho, valueChirho.audioPathChirho), 'utf8')
		).toBe(valueChirho.audioTextChirho);
		expect(
			await readFileChirho(joinChirho(valueChirho.rootChirho, valueChirho.indexPathChirho), 'utf8')
		).toBe(valueChirho.indexTextChirho);
		corruptChirho = false;
		valueChirho.fetchChirho.mockClear();
		await installBoundedPhaseChirho(
			valueChirho.rootChirho,
			'batch-001-chirho',
			true,
			valueChirho.archiveChirho
		);
		expect(valueChirho.fetchChirho).toHaveBeenCalledTimes(2);
	});
	it('rechecks canonical and source bytes under the lock after archive, leaving metadata unchanged', async () => {
		const valueChirho = await fixtureRootChirho();
		const normalChirho = valueChirho.fetchChirho.getMockImplementation()!;
		let changedChirho = false;
		valueChirho.fetchChirho.mockImplementation(async (inputChirho, initChirho) => {
			const responseChirho = await normalChirho(inputChirho, initChirho);
			if (initChirho?.method === 'GET' && !changedChirho) {
				changedChirho = true;
				await valueChirho.putChirho(
					`static${valueChirho.contentPathChirho}`,
					valueChirho.chapterTextChirho + ' '
				);
			}
			return responseChirho;
		});
		await expect(
			installBoundedPhaseChirho(
				valueChirho.rootChirho,
				'batch-001-chirho',
				true,
				valueChirho.archiveChirho
			)
		).rejects.toThrow(/canonical chapter changed/);
		expect(
			await readFileChirho(joinChirho(valueChirho.rootChirho, valueChirho.audioPathChirho), 'utf8')
		).toBe(valueChirho.audioTextChirho);
	});
	it('uses the one shared source/window validator and rejects changed timing, window, MP3 and frozen manifest identities', async () => {
		const valueChirho = await fixtureRootChirho();
		const validateChirho = async () =>
			validatePreparedChapterChirho(
				valueChirho.rootChirho,
				joinChirho(valueChirho.rootChirho, BEERI_RUN_CHIRHO),
				'Obad',
				'001-chirho',
				await readingContextChirho(valueChirho.rootChirho)
			);
		expect((await validateChirho()).rows_chirho).toHaveLength(2);
		const originalChirho = await readFileChirho(
			joinChirho(valueChirho.rootChirho, `${valueChirho.sourceHomeChirho}/timings-chirho.bin`)
		);
		await valueChirho.putChirho(
			`${valueChirho.sourceHomeChirho}/timings-chirho.bin`,
			Buffer.concat([originalChirho, Buffer.of(1)])
		);
		await expect(validateChirho()).rejects.toThrow(/source evidence changed/);
		await valueChirho.putChirho(
			`${valueChirho.sourceHomeChirho}/timings-chirho.bin`,
			originalChirho
		);
		const changedChirho = JSON.parse(valueChirho.manifestTextChirho);
		changedChirho.recordings_chirho[0].source_chirho.start_chirho = 0.1;
		await valueChirho.putChirho(valueChirho.manifestPathChirho, JSON.stringify(changedChirho));
		await expect(validateChirho()).rejects.toThrow(/cut window/);
		await expect(
			installBoundedPhaseChirho(valueChirho.rootChirho, 'batch-001-chirho', false)
		).rejects.toThrow(/Frozen prepared manifest/);
		await valueChirho.putChirho(valueChirho.manifestPathChirho, valueChirho.manifestTextChirho);
		await valueChirho.putChirho(valueChirho.rowsChirho[0].path_chirho, 'bad');
		await expect(validateChirho()).rejects.toThrow(/MP3 bytes/);
	});
	it('refuses absent targets, overlarge chapters and >30 chapter phases before archive', async () => {
		const valueChirho = await fixtureRootChirho();
		await rmChirho(joinChirho(valueChirho.rootChirho, valueChirho.audioPathChirho));
		await expect(
			installBoundedPhaseChirho(
				valueChirho.rootChirho,
				'batch-001-chirho',
				true,
				valueChirho.archiveChirho
			)
		).rejects.toThrow();
		expect(valueChirho.fetchChirho).not.toHaveBeenCalled();
		const chapterChirho = JSON.parse(valueChirho.audioTextChirho);
		chapterChirho.clips_chirho = Array.from({ length: 2000 }, (_, indexChirho) => ({
			id_chirho: `existing-${indexChirho}-chirho`
		}));
		const textChirho = JSON.stringify(chapterChirho) + '\n';
		await valueChirho.putChirho(valueChirho.audioPathChirho, textChirho);
		const indexChirho = JSON.parse(valueChirho.indexTextChirho);
		indexChirho.books_chirho.Obad.chapters_chirho[0].sha256_chirho = sha256Chirho(textChirho);
		await valueChirho.putChirho(valueChirho.indexPathChirho, JSON.stringify(indexChirho));
		await expect(
			installBoundedPhaseChirho(
				valueChirho.rootChirho,
				'batch-001-chirho',
				true,
				valueChirho.archiveChirho
			)
		).rejects.toThrow(/bound exceeded/);
		valueChirho.phaseChirho.chapters_chirho = Array.from(
			{ length: 31 },
			() => valueChirho.phaseChirho.chapters_chirho[0]
		);
		await expect(
			installBoundedPhaseChirho(
				valueChirho.rootChirho,
				'batch-001-chirho',
				true,
				valueChirho.archiveChirho
			)
		).rejects.toThrow(/chapter count/);
		expect(valueChirho.fetchChirho).not.toHaveBeenCalled();
	});
	it('does not skip an unfinished prior phase or accept a completed import with lost archive proof', async () => {
		const valueChirho = await fixtureRootChirho();
		const planChirho = stateChirho.plan_chirho as BoundedPlanChirho;
		planChirho.phases_chirho.push({ ...valueChirho.phaseChirho, id_chirho: 'batch-002-chirho' });
		await expect(
			installBoundedPhaseChirho(
				valueChirho.rootChirho,
				'batch-002-chirho',
				true,
				valueChirho.archiveChirho
			)
		).rejects.toThrow();
		expect(valueChirho.fetchChirho).not.toHaveBeenCalled();
		await installBoundedPhaseChirho(
			valueChirho.rootChirho,
			'batch-001-chirho',
			true,
			valueChirho.archiveChirho
		);
		await valueChirho.putChirho(
			'build-chirho/r2-chirho/audio-receipts-chirho.jsonl',
			'{"outcome_chirho":"unknown"}\n'
		);
		valueChirho.fetchChirho.mockClear();
		await expect(
			installBoundedPhaseChirho(
				valueChirho.rootChirho,
				'batch-001-chirho',
				true,
				valueChirho.archiveChirho
			)
		).rejects.toThrow(/archive readback proof missing/);
		expect(valueChirho.fetchChirho).not.toHaveBeenCalled();
	});
	it('refuses an oversized resulting chapter before any upload, preserving its original bytes', async () => {
		const valueChirho = await fixtureRootChirho();
		const chapterChirho = JSON.parse(valueChirho.audioTextChirho);
		chapterChirho.extra_chirho = 'x'.repeat(1_998_000);
		const textChirho = JSON.stringify(chapterChirho) + '\n';
		expect(Buffer.byteLength(textChirho)).toBeLessThan(2_000_000);
		await valueChirho.putChirho(valueChirho.audioPathChirho, textChirho);
		const indexChirho = JSON.parse(valueChirho.indexTextChirho);
		indexChirho.books_chirho.Obad.chapters_chirho[0].sha256_chirho = sha256Chirho(textChirho);
		await valueChirho.putChirho(valueChirho.indexPathChirho, JSON.stringify(indexChirho));
		await expect(
			installBoundedPhaseChirho(
				valueChirho.rootChirho,
				'batch-001-chirho',
				true,
				valueChirho.archiveChirho
			)
		).rejects.toThrow(/delivery bound/);
		expect(valueChirho.fetchChirho).not.toHaveBeenCalled();
		expect(
			await readFileChirho(joinChirho(valueChirho.rootChirho, valueChirho.audioPathChirho), 'utf8')
		).toBe(textChirho);
	});
	it('routes every other-book apply away from the old non-journalled entry point before target or source access', async () => {
		const rootChirho = await realpathChirho(
			await mkdtempChirho(joinChirho(tmpdirChirho(), 'beeri-old-apply-chirho-'))
		);
		temporaryChirho.push(rootChirho);
		expect(() =>
			execFileSyncChirho(
				'bun',
				[
					'--no-env-file',
					new URL(
						'../../../scripts-chirho/audio-chirho/readings-chirho/install_chirho.ts',
						import.meta.url
					).pathname,
					'--run-chirho',
					joinChirho(rootChirho, BEERI_RUN_CHIRHO),
					'--books-chirho',
					'Obad',
					'--apply-chirho'
				],
				{ cwd: rootChirho, encoding: 'utf8', stdio: 'pipe' }
			)
		).toThrow(/bounded source-bound installer/);
	});
});
