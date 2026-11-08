// For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life. — John 3:16 (KJV)
import { afterEach, describe, expect, it, vi } from 'vitest';
import { readFileSync as readFileSyncChirho } from 'node:fs';
import {
	mkdtemp as mkdtempChirho,
	mkdir as mkdirChirho,
	writeFile as writeFileChirho,
	rm as rmChirho,
	realpath as realpathChirho
} from 'node:fs/promises';
import { tmpdir as tmpdirChirho } from 'node:os';
import { execFileSync as execFileSyncChirho } from 'node:child_process';
import { join as joinChirho } from 'node:path';
import { bibleBookChirho } from '../../../src/lib/bible-chirho/books-chirho';
import { chapterRecipeChirho } from '../../../src/lib/domain-chirho/pronunciation-chirho/chapter-recipe-chirho';
import { LOCAL_GREEK_VERSE_RECIPE_CHIRHO } from '../../../src/lib/domain-chirho/pronunciation-chirho/greek-chirho/local-verse-chirho';
import { spokenVerseChirho } from '../../../src/lib/domain-chirho/pronunciation-chirho';
import { sha256Chirho } from '../../../scripts-chirho/audio-chirho/audition_chirho';
import {
	OPENINGS_HOME_CHIRHO,
	OPENINGS_MANIFEST_SHA_CHIRHO,
	OPENINGS_RUN_HOME_CHIRHO,
	OPENINGS_HANDOFF_SHA_CHIRHO,
	openingVerseIdsChirho,
	validateOpeningJobChirho,
	selectOpeningJobsChirho,
	clipForOpeningsChirho,
	preflightOpeningOriginalsChirho,
	openingsInputChirho,
	partitionOpeningInputChirho,
	preflightOpeningPartsChirho,
	recheckOpeningPartChirho,
	type OpeningsManifestChirho,
	type OpeningsPlanChirho,
	type OpeningsAsrChirho
} from '../../../scripts-chirho/audio-chirho/local-greek-chirho/openings_chirho';

import { installLocalGreekChirho } from '../../../scripts-chirho/audio-chirho/local-greek-chirho/install_chirho';
import { RUN_HOME_CHIRHO } from '../../../scripts-chirho/audio-chirho/local-greek-chirho/manifest_chirho';
import type { ImportInputChirho } from '../../../scripts-chirho/audio-chirho/local-greek-chirho/phase_chirho';
const requestsChirho = vi.hoisted(() => ({ callChirho: vi.fn() }));
vi.mock('../../../scripts-chirho/publish-chirho/r2-chirho/object-store-chirho', () => ({
	objectRequestChirho: requestsChirho.callChirho
}));
const rootsChirho: string[] = [];
afterEach(async () => {
	vi.unstubAllEnvs();
	requestsChirho.callChirho.mockReset();
	vi.unstubAllGlobals();
	for (const rootChirho of rootsChirho.splice(0))
		await rmChirho(rootChirho, { recursive: true, force: true });
});
const heldChirho = new Set(['John.3.1', 'Acts.28.1', '1Cor.13.1']);
const modelChirho = {
	voice_chirho: 'built-in voice (conds.pt), no reference clip',
	weights_chirho: 'fixture model identity'
};

function fixtureChirho() {
	const journalChirho: Record<string, unknown>[] = [];
	const asrChirho: OpeningsAsrChirho = {
		model_chirho: 'openai-whisper large-v3-turbo',
		takes_chirho: {}
	};
	const lessonsChirho = new Map<string, Parameters<typeof chapterRecipeChirho>[0]>();
	const plansChirho: OpeningsPlanChirho['jobs_chirho'] = [];
	const jobsChirho = openingVerseIdsChirho().map((idChirho, indexChirho) => {
		const [bookIdChirho, chapterChirho] = idChirho.split('.');
		const bookChirho = bibleBookChirho(bookIdChirho);
		const contentPathChirho = `${bookChirho.slug_chirho}/chapter-${chapterChirho.padStart(2, '0')}-chirho.json`;
		const bytesChirho = readFileSyncChirho(
			new URL(`../../../static/content-chirho/${contentPathChirho}`, import.meta.url)
		);
		const chapterValueChirho = JSON.parse(bytesChirho.toString()) as {
			verses_chirho: Parameters<typeof chapterRecipeChirho>[0][];
		};
		const lessonChirho = chapterValueChirho.verses_chirho.find(
			(rowChirho) => rowChirho.id_chirho === idChirho
		)!;
		const recipeChirho = chapterRecipeChirho(lessonChirho, LOCAL_GREEK_VERSE_RECIPE_CHIRHO)!;
		lessonsChirho.set(idChirho, lessonChirho);
		const jobIdChirho = `v${8001 + indexChirho}`;
		const taskChirho = `00000000-0000-4000-8000-${String(indexChirho + 1).padStart(12, '0')}`;
		const fileStemChirho = `opening-${indexChirho + 1}-chirho`;
		const takeBytesChirho = Buffer.from(`MP3 identity ${jobIdChirho}`),
			rawBytesChirho = Buffer.from(`FLAC identity ${jobIdChirho}`);
		const screenChirho = {
			job_chirho: jobIdChirho,
			sha256_chirho: sha256Chirho(takeBytesChirho),
			cer_chirho: heldChirho.has(idChirho) ? 0.4 : 0.1
		};
		const takeChirho = {
			path_chirho: `takes-chirho/${jobIdChirho}-${fileStemChirho}-00000000-chirho.mp3`,
			sha256_chirho: sha256Chirho(takeBytesChirho),
			bytes_chirho: takeBytesChirho.length,
			seconds_chirho: 1,
			flag_chirho: null,
			task_uuid_chirho: taskChirho,
			raw_path_chirho: `raw-chirho/${jobIdChirho}-${fileStemChirho}-00000000-chirho.flac`,
			raw_sha256_chirho: sha256Chirho(rawBytesChirho),
			seed_chirho: 1,
			sample_rate_chirho: 24000,
			asr_chirho: screenChirho
		};
		const jobChirho: OpeningsManifestChirho['jobs_chirho'][number] = {
			job_chirho: jobIdChirho,
			verse_id_chirho: idChirho,
			reference_chirho: idChirho,
			rough_breathing_words_chirho: 0,
			file_stem_chirho: fileStemChirho,
			content_path_chirho: contentPathChirho,
			content_sha256_chirho: sha256Chirho(bytesChirho),
			canonical_text_chirho: lessonChirho.canonical_text_chirho,
			canonical_sha256_chirho: sha256Chirho(lessonChirho.canonical_text_chirho),
			spoken_text_chirho: spokenVerseChirho(lessonChirho),
			sent_chirho: recipeChirho.synthesis_text_chirho,
			sent_sha256_chirho: sha256Chirho(recipeChirho.synthesis_text_chirho),
			state_chirho: heldChirho.has(idChirho) ? 'flagged' : 'done',
			chosen_chirho: takeChirho,
			attempts_chirho: [
				{ task_uuid_chirho: taskChirho, kind_chirho: 'first', outcome_chirho: 'result' }
			]
		};
		plansChirho.push({
			...structuredClone(jobChirho),
			state_chirho: 'pending',
			chosen_chirho: null,
			audio_sha256_chirho: 'f'.repeat(64)
		});
		asrChirho.takes_chirho[taskChirho] = structuredClone(screenChirho);
		journalChirho.push(
			{
				event_chirho: 'request',
				task_uuid_chirho: taskChirho,
				job_chirho: jobIdChirho,
				kind_chirho: 'first',
				sent_chirho: jobChirho.sent_chirho
			},
			{
				...takeChirho,
				event_chirho: 'result',
				job_chirho: jobIdChirho,
				sent_sha256_chirho: jobChirho.sent_sha256_chirho,
				cost_chirho: 0
			}
		);
		return jobChirho;
	});
	const planChirho: OpeningsPlanChirho = {
		model_chirho: structuredClone(modelChirho),
		jobs_chirho: plansChirho
	};
	const manifestChirho: OpeningsManifestChirho = {
		plan_sha256_chirho: '0150c609dac6c15c1fd444091d3ae80f7be2ef2fcbadd9ef83d821275f8f828e',
		journal_sha256_chirho: '0faf2c0bd53b23a26e9db591cb00cb20901d4dcb441fa58d09e5f1eb4f5cb6b7',
		model_chirho: structuredClone(modelChirho),
		jobs_chirho: jobsChirho,
		counts_chirho: { done: 256, flagged: 3 },
		asr_limit_chirho: 0.35,
		reported_cost_chirho: 0
	};
	return { manifestChirho, planChirho, journalChirho, asrChirho, lessonsChirho };
}
const baseChirho = fixtureChirho();

function partsFixtureChirho() {
	const selectedChirho = selectOpeningJobsChirho(
		baseChirho.manifestChirho,
		baseChirho.planChirho,
		baseChirho.journalChirho,
		baseChirho.asrChirho,
		modelChirho
	);
	const inputChirho: ImportInputChirho = {
		manifest_chirho: { ...baseChirho.manifestChirho, jobs_chirho: selectedChirho },
		manifest_sha256_chirho: OPENINGS_MANIFEST_SHA_CHIRHO,
		prepared_home_chirho: OPENINGS_HOME_CHIRHO,
		run_home_chirho: OPENINGS_RUN_HOME_CHIRHO,
		expected_jobs_chirho: 256,
		flagged_excluded_chirho: 3,
		archive_inputs_chirho: Array.from({ length: 5 }, (_valueChirho, indexChirho) => ({
			path_chirho: `metadata-${indexChirho}-chirho.json`,
			sha256_chirho: String(indexChirho).repeat(64),
			extension_chirho: 'json' as const
		})),
		clip_chirho: clipForOpeningsChirho(selectedChirho)
	};
	const preparedChirho = {
		manifest_sha256_chirho: OPENINGS_MANIFEST_SHA_CHIRHO,
		recordings_chirho: selectedChirho.map((jobChirho) => ({
			job_chirho: jobChirho.job_chirho,
			verse_id_chirho: jobChirho.verse_id_chirho,
			path_chirho: `${OPENINGS_HOME_CHIRHO}/delivery-chirho/${jobChirho.job_chirho}-chirho.mp3`,
			sha256_chirho: 'd'.repeat(64),
			bytes_chirho: 123,
			duration_chirho: 1,
			original_mp3_sha256_chirho: jobChirho.chosen_chirho.sha256_chirho,
			raw_flac_sha256_chirho: jobChirho.chosen_chirho.raw_sha256_chirho
		}))
	};
	return {
		inputChirho,
		preparedChirho,
		partsChirho: partitionOpeningInputChirho(inputChirho, preparedChirho)
	};
}

describe('finite local Greek openings input', () => {
	it('selects exactly256 seed1 received openings and excludes the3 held verses with no networking', () => {
		const fetchChirho = vi.fn();
		vi.stubGlobal('fetch', fetchChirho);
		const selectedChirho = selectOpeningJobsChirho(
			baseChirho.manifestChirho,
			baseChirho.planChirho,
			baseChirho.journalChirho,
			baseChirho.asrChirho,
			modelChirho
		);
		expect(selectedChirho).toHaveLength(256);
		expect(selectedChirho.some((jobChirho) => heldChirho.has(jobChirho.verse_id_chirho))).toBe(
			false
		);
		expect(openingVerseIdsChirho()).not.toContain('John.1.1');
		expect(fetchChirho).not.toHaveBeenCalled();
	});
	it('rejects changed source, ASR, unknown/flagged takes, foreign jobs, seed or paths', () => {
		for (const kindChirho of [
			'source',
			'asr',
			'unknown',
			'flagged',
			'foreign-job',
			'foreign-path',
			'seed'
		]) {
			const jobChirho = structuredClone(baseChirho.manifestChirho.jobs_chirho[0]);
			if (kindChirho === 'source') jobChirho.canonical_text_chirho += ' changed';
			if (kindChirho === 'asr') jobChirho.chosen_chirho.asr_chirho.cer_chirho = 0.2;
			if (kindChirho === 'unknown') jobChirho.attempts_chirho[0].outcome_chirho = 'unknown';
			if (kindChirho === 'flagged') jobChirho.state_chirho = 'flagged';
			if (kindChirho === 'foreign-job') jobChirho.job_chirho = 'v8000';
			if (kindChirho === 'foreign-path')
				jobChirho.chosen_chirho.path_chirho = 'takes-chirho/foreign.mp3';
			if (kindChirho === 'seed') jobChirho.chosen_chirho.seed_chirho = 2;
			expect(() =>
				validateOpeningJobChirho(
					jobChirho,
					baseChirho.planChirho.jobs_chirho[0],
					baseChirho.journalChirho,
					baseChirho.asrChirho
				)
			).toThrow();
		}
	});
	it('rejects changed model and incomplete or duplicate canonical opening coverage', () => {
		for (const kindChirho of ['model', 'coverage', 'unknown-journal']) {
			const rowChirho = structuredClone(baseChirho);
			if (kindChirho === 'model')
				rowChirho.manifestChirho.model_chirho = { voice_chirho: 'another voice' };
			if (kindChirho === 'coverage')
				rowChirho.manifestChirho.jobs_chirho[1].verse_id_chirho = 'Matt.1.1';
			if (kindChirho === 'unknown-journal') rowChirho.journalChirho[1].event_chirho = 'unknown';
			expect(() =>
				selectOpeningJobsChirho(
					rowChirho.manifestChirho,
					rowChirho.planChirho,
					rowChirho.journalChirho,
					rowChirho.asrChirho,
					modelChirho
				)
			).toThrow();
		}
	});
	it('keeps derivative identity independent and the clip closure immutable', () => {
		const jobChirho = structuredClone(baseChirho.manifestChirho.jobs_chirho[0]);
		const clipChirho = clipForOpeningsChirho([jobChirho]);
		const deliveryChirho = {
			job_chirho: jobChirho.job_chirho,
			verse_id_chirho: jobChirho.verse_id_chirho,
			path_chirho: `${OPENINGS_HOME_CHIRHO}/delivery-chirho/${jobChirho.job_chirho}-chirho.mp3`,
			sha256_chirho: 'd'.repeat(64),
			bytes_chirho: 123,
			duration_chirho: 1,
			original_mp3_sha256_chirho: jobChirho.chosen_chirho.sha256_chirho,
			raw_flac_sha256_chirho: jobChirho.chosen_chirho.raw_sha256_chirho
		};
		const lessonChirho = baseChirho.lessonsChirho.get('Matt.1.1')!;
		const selectedChirho = clipChirho(
			jobChirho,
			deliveryChirho,
			lessonChirho,
			jobChirho.content_sha256_chirho
		);
		expect(selectedChirho.sha256_chirho).toBe('d'.repeat(64));
		expect(selectedChirho).toHaveProperty(
			'source_phase_sha256_chirho',
			OPENINGS_HANDOFF_SHA_CHIRHO
		);
		expect(() =>
			clipChirho(
				jobChirho,
				{ ...deliveryChirho, path_chirho: 'foreign.mp3' },
				lessonChirho,
				jobChirho.content_sha256_chirho
			)
		).toThrow();
		jobChirho.chosen_chirho.asr_chirho.cer_chirho = 0.2;
		expect(() =>
			clipChirho(jobChirho, deliveryChirho, lessonChirho, jobChirho.content_sha256_chirho)
		).toThrow(/immutable/);
	});
	it('the installer reads explicit openings run home and preserves the legacy default', async () => {
		const deliveryBytesChirho = execFileSyncChirho('ffmpeg', [
			'-v',
			'error',
			'-nostdin',
			'-f',
			'lavfi',
			'-i',
			'sine=frequency=440:duration=1',
			'-ar',
			'44100',
			'-ac',
			'1',
			'-b:a',
			'64k',
			'-f',
			'mp3',
			'pipe:1'
		]);
		vi.stubEnv('CLOUDFLARE_GLOBAL_API_MAIN_ACCOUNT_ID_CHIRHO', '0'.repeat(28) + '84bd');
		vi.stubEnv('CLOUDFLARE_GLOBAL_API_EMAIL_CHIRHO', 'fixture@example.invalid');
		vi.stubEnv('CLOUDFLARE_GLOBAL_API_KEY_CHIRHO', 'fixture');
		for (const runHomeChirho of [OPENINGS_RUN_HOME_CHIRHO, undefined]) {
			const rootChirho = await realpathChirho(
				await mkdtempChirho(joinChirho(tmpdirChirho(), 'openings-installer-chirho-'))
			);
			rootsChirho.push(rootChirho);
			const jobChirho = structuredClone(baseChirho.manifestChirho.jobs_chirho[0]);
			const deliveryPathChirho = `${OPENINGS_HOME_CHIRHO}/delivery-chirho/${jobChirho.job_chirho}-chirho.mp3`;
			const deliveryChirho = {
				job_chirho: jobChirho.job_chirho,
				verse_id_chirho: jobChirho.verse_id_chirho,
				path_chirho: deliveryPathChirho,
				sha256_chirho: sha256Chirho(deliveryBytesChirho),
				bytes_chirho: deliveryBytesChirho.length,
				duration_chirho: 1,
				original_mp3_sha256_chirho: jobChirho.chosen_chirho.sha256_chirho,
				raw_flac_sha256_chirho: jobChirho.chosen_chirho.raw_sha256_chirho
			};
			const pathsChirho: [string, Buffer][] = [
				[
					`static/content-chirho/${jobChirho.content_path_chirho}`,
					readFileSyncChirho(
						new URL(
							`../../../static/content-chirho/${jobChirho.content_path_chirho}`,
							import.meta.url
						)
					)
				],
				[
					`${OPENINGS_HOME_CHIRHO}/prepared-chirho.json`,
					Buffer.from(
						JSON.stringify({
							manifest_sha256_chirho: 'fixture-manifest-chirho',
							recordings_chirho: [deliveryChirho]
						})
					)
				],
				[deliveryPathChirho, deliveryBytesChirho],
				[
					`${runHomeChirho ?? RUN_HOME_CHIRHO}/${jobChirho.chosen_chirho.path_chirho}`,
					Buffer.from('MP3 identity v8001')
				]
			];
			for (const [pathChirho, bytesChirho] of pathsChirho) {
				await mkdirChirho(
					joinChirho(rootChirho, pathChirho.substring(0, pathChirho.lastIndexOf('/'))),
					{ recursive: true }
				);
				await writeFileChirho(joinChirho(rootChirho, pathChirho), bytesChirho);
			}
			const inputChirho: ImportInputChirho = {
				manifest_chirho: { ...baseChirho.manifestChirho, jobs_chirho: [jobChirho] },
				manifest_sha256_chirho: 'fixture-manifest-chirho',
				prepared_home_chirho: OPENINGS_HOME_CHIRHO,
				run_home_chirho: runHomeChirho,
				expected_jobs_chirho: 1,
				flagged_excluded_chirho: 0,
				archive_inputs_chirho: [],
				clip_chirho: clipForOpeningsChirho([jobChirho])
			};
			requestsChirho.callChirho.mockReset().mockRejectedValue(Error('archive boundary reached'));
			await expect(installLocalGreekChirho(inputChirho, true, rootChirho)).rejects.toThrow(
				'archive boundary reached'
			);
			expect(requestsChirho.callChirho).toHaveBeenCalledExactlyOnceWith(
				'GET',
				`provenance-audio-chirho/sha256-chirho/${jobChirho.chosen_chirho.sha256_chirho}.mp3`
			);
		}
	});
	it('partitions the complete input into43 deterministic parts of at most6 chapters without raising caps', async () => {
		const rowChirho = partsFixtureChirho();
		expect(rowChirho.partsChirho).toHaveLength(43);
		expect(rowChirho.partsChirho[0].input_chirho.prepared_home_chirho).toBe(
			`${OPENINGS_HOME_CHIRHO}/catalogue-parts-chirho/0000-chirho/part-0001-chirho`
		);
		expect(rowChirho.partsChirho[10].input_chirho.prepared_home_chirho).toBe(
			`${OPENINGS_HOME_CHIRHO}/catalogue-parts-chirho/0010-chirho/part-0011-chirho`
		);
		expect(rowChirho.partsChirho.at(-1)?.input_chirho.expected_jobs_chirho).toBe(4);
		for (const partChirho of rowChirho.partsChirho) {
			expect(partChirho.input_chirho.expected_jobs_chirho).toBeLessThanOrEqual(6);
			expect(partChirho.input_chirho.clip_chirho).toBe(rowChirho.inputChirho.clip_chirho);
			expect(partChirho.input_chirho.run_home_chirho).toBe(OPENINGS_RUN_HOME_CHIRHO);
		}
		expect(
			rowChirho.partsChirho.flatMap((partChirho) => partChirho.prepared_chirho.recordings_chirho)
		).toEqual(rowChirho.preparedChirho.recordings_chirho);
		expect(() =>
			partitionOpeningInputChirho(
				rowChirho.partsChirho[0].input_chirho,
				rowChirho.partsChirho[0].prepared_chirho
			)
		).toThrow(/complete/);
		await expect(
			preflightOpeningPartsChirho('/not-read-chirho', [
				{ input_chirho: rowChirho.inputChirho, prepared_chirho: rowChirho.preparedChirho }
			])
		).rejects.toThrow(/complete bounded/);
		const changedChirho = structuredClone(rowChirho.preparedChirho);
		changedChirho.recordings_chirho[0].original_mp3_sha256_chirho = 'f'.repeat(64);
		expect(() => partitionOpeningInputChirho(rowChirho.inputChirho, changedChirho)).toThrow(
			/identity/
		);
	});
	it('requires all prepared parts and exact receipt copies before any apply, then detects drift on replay', async () => {
		const rowChirho = partsFixtureChirho();
		const rootChirho = await realpathChirho(
			await mkdtempChirho(joinChirho(tmpdirChirho(), 'openings-parts-chirho-'))
		);
		rootsChirho.push(rootChirho);
		const keysChirho = rowChirho.inputChirho.manifest_chirho.jobs_chirho.flatMap((jobChirho) => [
			`provenance-audio-chirho/sha256-chirho/${jobChirho.chosen_chirho!.sha256_chirho}.mp3`,
			`provenance-audio-chirho/sha256-chirho/${jobChirho.chosen_chirho!.raw_sha256_chirho}.flac`
		]);
		keysChirho.push(
			...rowChirho.inputChirho.archive_inputs_chirho.map(
				(valueChirho) =>
					`provenance-audio-chirho/sha256-chirho/${valueChirho.sha256_chirho}.${valueChirho.extension_chirho}`
			)
		);
		const receiptsChirho = Buffer.from(
			keysChirho
				.map((keyChirho) => {
					const shaChirho = keyChirho.split('/').at(-1)!.split('.')[0];
					return JSON.stringify({
						key_chirho: keyChirho,
						sha256_chirho: shaChirho,
						readback_sha256_chirho: shaChirho,
						bytes_chirho: 1
					});
				})
				.join('\n') + '\n'
		);
		await mkdirChirho(joinChirho(rootChirho, OPENINGS_HOME_CHIRHO), { recursive: true });
		await writeFileChirho(
			joinChirho(rootChirho, OPENINGS_HOME_CHIRHO, 'original-receipts-chirho.jsonl'),
			receiptsChirho
		);
		const failedChirho = joinChirho(
			rootChirho,
			OPENINGS_HOME_CHIRHO,
			'catalogue-intent-chirho.json'
		);
		await writeFileChirho(failedChirho, 'preserved failed top intent');
		const writePartChirho = async (indexChirho: number) => {
			const partChirho = rowChirho.partsChirho[indexChirho];
			const homeChirho = joinChirho(rootChirho, partChirho.input_chirho.prepared_home_chirho);
			await mkdirChirho(homeChirho, { recursive: true });
			await writeFileChirho(
				joinChirho(homeChirho, 'prepared-chirho.json'),
				JSON.stringify(partChirho.prepared_chirho)
			);
			await writeFileChirho(
				joinChirho(homeChirho, 'original-receipts-chirho.jsonl'),
				receiptsChirho
			);
		};
		for (let indexChirho = 0; indexChirho < 42; indexChirho++) await writePartChirho(indexChirho);
		await expect(preflightOpeningPartsChirho(rootChirho, rowChirho.partsChirho)).rejects.toThrow();
		expect(requestsChirho.callChirho).not.toHaveBeenCalled();
		await writePartChirho(42);
		const proofsChirho = await preflightOpeningPartsChirho(rootChirho, rowChirho.partsChirho);
		expect(await preflightOpeningPartsChirho(rootChirho, rowChirho.partsChirho)).toEqual(
			proofsChirho
		);
		await recheckOpeningPartChirho(rootChirho, rowChirho.partsChirho[0], proofsChirho[0]);
		await writeFileChirho(
			joinChirho(
				rootChirho,
				rowChirho.partsChirho[0].input_chirho.prepared_home_chirho,
				'prepared-chirho.json'
			),
			'{}'
		);
		await expect(
			recheckOpeningPartChirho(rootChirho, rowChirho.partsChirho[0], proofsChirho[0])
		).rejects.toThrow(/changed/);
		await expect(preflightOpeningPartsChirho(rootChirho, rowChirho.partsChirho)).rejects.toThrow(
			/differs/
		);
		expect(readFileSyncChirho(failedChirho, 'utf8')).toBe('preserved failed top intent');
		expect(requestsChirho.callChirho).not.toHaveBeenCalled();
	});
	it('checks frozen metadata and original MP3/FLAC before any archive action', async () => {
		const rootChirho = await realpathChirho(
			await mkdtempChirho(joinChirho(tmpdirChirho(), 'openings-chirho-'))
		);
		rootsChirho.push(rootChirho);
		await mkdirChirho(joinChirho(rootChirho, OPENINGS_HOME_CHIRHO, 'source-chirho'), {
			recursive: true
		});
		await writeFileChirho(
			joinChirho(rootChirho, OPENINGS_HOME_CHIRHO, 'source-chirho/manifest-chirho.json'),
			'{}'
		);
		await expect(openingsInputChirho(rootChirho)).rejects.toThrow(/Frozen openings/);
		const jobChirho = structuredClone(baseChirho.manifestChirho.jobs_chirho[0]);
		for (const [pathChirho, bytesChirho] of [
			[jobChirho.chosen_chirho.path_chirho, Buffer.from('MP3 identity v8001')],
			[jobChirho.chosen_chirho.raw_path_chirho, Buffer.from('FLAC identity v8001')]
		] as const) {
			await mkdirChirho(
				joinChirho(rootChirho, OPENINGS_RUN_HOME_CHIRHO, pathChirho.split('/')[0]),
				{ recursive: true }
			);
			await writeFileChirho(
				joinChirho(rootChirho, OPENINGS_RUN_HOME_CHIRHO, pathChirho),
				bytesChirho
			);
		}
		await preflightOpeningOriginalsChirho(rootChirho, [jobChirho]);
		await writeFileChirho(
			joinChirho(rootChirho, OPENINGS_RUN_HOME_CHIRHO, jobChirho.chosen_chirho.raw_path_chirho),
			'changed FLAC'
		);
		await expect(preflightOpeningOriginalsChirho(rootChirho, [jobChirho])).rejects.toThrow(
			/original/
		);
		jobChirho.chosen_chirho.path_chirho = '../foreign.mp3';
		await expect(preflightOpeningOriginalsChirho(rootChirho, [jobChirho])).rejects.toThrow(
			/Unowned/
		);
	});
});
