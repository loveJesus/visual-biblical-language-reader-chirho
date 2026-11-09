// For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life. — John 3:16 (KJV)
import { afterEach, describe, expect, it, vi } from 'vitest';
import { readFileSync as readFileSyncChirho } from 'node:fs';
import {
	mkdtemp as mkdtempChirho,
	mkdir as mkdirChirho,
	writeFile as writeFileChirho,
	readFile as readFileChirho,
	rm as rmChirho,
	realpath as realpathChirho,
	symlink as symlinkChirho
} from 'node:fs/promises';
import { tmpdir as tmpdirChirho } from 'node:os';
import { join as joinChirho } from 'node:path';
import { execFileSync as execFileSyncChirho } from 'node:child_process';
import { chapterRecipeChirho } from '../../../src/lib/domain-chirho/pronunciation-chirho/chapter-recipe-chirho';
import { LOCAL_GREEK_VERSE_RECIPE_CHIRHO } from '../../../src/lib/domain-chirho/pronunciation-chirho/greek-chirho/local-verse-chirho';
import { spokenVerseChirho } from '../../../src/lib/domain-chirho/pronunciation-chirho';
import { sha256Chirho } from '../../../scripts-chirho/audio-chirho/audition_chirho';
import {
	RUN_HOME_CHIRHO,
	localGreekClipForInputChirho
} from '../../../scripts-chirho/audio-chirho/local-greek-chirho/manifest_chirho';
import {
	MAIN_PLAN_SHA_CHIRHO,
	reconstructHandoffJobsChirho,
	preflightHandoffCatalogueChirho,
	handoffInputChirho,
	type FiniteHandoffChirho,
	type HandoffPlanJobChirho,
	type HandoffAsrChirho
} from '../../../scripts-chirho/audio-chirho/local-greek-chirho/handoff_chirho';
import {
	partitionHandoffChirho,
	preflightHandoffPartsChirho,
	recheckHandoffPartChirho,
	recoverHandoffPartsChirho
} from '../../../scripts-chirho/audio-chirho/local-greek-chirho/handoff_parts_chirho';
import type { ImportInputChirho } from '../../../scripts-chirho/audio-chirho/local-greek-chirho/phase_chirho';

const rootsChirho: string[] = [];
afterEach(async () => {
	vi.unstubAllGlobals();
	for (const rootChirho of rootsChirho.splice(0))
		await rmChirho(rootChirho, { recursive: true, force: true });
});
const homeChirho = 'build-chirho/finite-handoff-chirho';
function fixtureChirho() {
	const sourceChirho = readFileSyncChirho(
		new URL('../../../static/content-chirho/mark-chirho/chapter-03-chirho.json', import.meta.url)
	);
	const lessonChirho = (
		JSON.parse(sourceChirho.toString()).verses_chirho as Parameters<typeof chapterRecipeChirho>[0][]
	).find((rowChirho) => rowChirho.id_chirho === 'Mark.3.3')!;
	const sentChirho = chapterRecipeChirho(
		lessonChirho,
		LOCAL_GREEK_VERSE_RECIPE_CHIRHO
	)!.synthesis_text_chirho;
	const taskChirho = '00000000-0000-4000-8000-000000000001';
	const plannedChirho: HandoffPlanJobChirho = {
		job_chirho: 'v0001',
		verse_id_chirho: lessonChirho.id_chirho,
		reference_chirho: 'Mark 3:3',
		file_stem_chirho: '41-mark-03-03',
		content_path_chirho: 'mark-chirho/chapter-03-chirho.json',
		content_sha256_chirho: sha256Chirho(sourceChirho),
		audio_sha256_chirho: 'e'.repeat(64),
		canonical_text_chirho: lessonChirho.canonical_text_chirho,
		canonical_sha256_chirho: sha256Chirho(lessonChirho.canonical_text_chirho),
		spoken_text_chirho: spokenVerseChirho(lessonChirho),
		sent_chirho: sentChirho,
		sent_sha256_chirho: sha256Chirho(sentChirho),
		state_chirho: 'pending',
		chosen_chirho: null,
		rough_breathing_words_chirho: 0,
		token_ids_chirho: lessonChirho.tokens_chirho.map((tokenChirho) => tokenChirho.id_chirho)
	};
	const takeChirho = {
		path_chirho: 'takes-chirho/v0001-41-mark-03-03-00000000-chirho.mp3',
		sha256_chirho: 'a'.repeat(64),
		bytes_chirho: 100,
		seconds_chirho: 1,
		flag_chirho: null,
		raw_path_chirho: 'raw-chirho/v0001-41-mark-03-03-00000000-chirho.flac',
		raw_sha256_chirho: 'b'.repeat(64),
		seed_chirho: 1,
		sample_rate_chirho: 24000,
		task_uuid_chirho: taskChirho
	};
	const screenChirho = {
		job_chirho: 'v0001',
		sha256_chirho: takeChirho.sha256_chirho,
		cer_chirho: 0.1,
		heard_chirho: 'synthetic screen fixture'
	};
	const journalChirho: Record<string, unknown>[] = [
		{
			event_chirho: 'request',
			job_chirho: 'v0001',
			task_uuid_chirho: taskChirho,
			at_chirho: 'request-time-chirho',
			kind_chirho: 'first',
			sent_chirho: sentChirho
		},
		{
			...takeChirho,
			event_chirho: 'result',
			job_chirho: 'v0001',
			at_chirho: 'result-time-chirho',
			cost_chirho: 0,
			sent_sha256_chirho: plannedChirho.sent_sha256_chirho
		}
	];
	const modelChirho = { voice_chirho: 'synthetic fixture identity' };
	const asrChirho: HandoffAsrChirho = {
		model_chirho: 'openai-whisper large-v3-turbo',
		takes_chirho: { [taskChirho]: screenChirho }
	};
	const handoffChirho: FiniteHandoffChirho = {
		handoff_id_chirho: 'fixture-chirho',
		batch_folder_chirho: RUN_HOME_CHIRHO,
		model_chirho: modelChirho,
		recipe_chirho: {
			recipe_id_chirho: LOCAL_GREEK_VERSE_RECIPE_CHIRHO,
			language_chirho: 'el',
			pronunciation_chirho: 'modern_greek'
		},
		snapshots_chirho: {
			plan_chirho: {
				path_chirho: 'plan-snapshot-chirho.json',
				sha256_chirho: MAIN_PLAN_SHA_CHIRHO,
				bytes_chirho: 1
			},
			journal_chirho: {
				path_chirho: 'journal-snapshot-chirho.jsonl',
				sha256_chirho: 'c'.repeat(64),
				bytes_chirho: 1
			},
			asr_chirho: {
				path_chirho: 'asr-snapshot-chirho.json',
				sha256_chirho: 'd'.repeat(64),
				bytes_chirho: 1
			}
		},
		earlier_handoffs_chirho: [],
		counts_chirho: { admitted_chirho: 1 },
		screen_chirho: { limit_chirho: 0.35, model_chirho: asrChirho.model_chirho },
		skipped_inside_admitted_range_chirho: [],
		ready_jobs_chirho: [
			{
				plan_index_chirho: 0,
				job_chirho: 'v0001',
				verse_id_chirho: lessonChirho.id_chirho,
				reference_chirho: plannedChirho.reference_chirho,
				clip_id_if_installed_chirho: 'local-greek-v0001-chirho',
				kind_chirho: 'first',
				requested_at_chirho: 'request-time-chirho',
				result_at_chirho: 'result-time-chirho',
				take_path_chirho: takeChirho.path_chirho,
				take_sha256_chirho: takeChirho.sha256_chirho,
				take_bytes_chirho: takeChirho.bytes_chirho,
				seconds_chirho: 1,
				decoded_mp3_seconds_chirho: 1,
				decoded_flac_seconds_chirho: 1,
				raw_path_chirho: takeChirho.raw_path_chirho,
				raw_sha256_chirho: takeChirho.raw_sha256_chirho,
				seed_chirho: 1,
				sample_rate_chirho: 24000,
				task_uuid_chirho: taskChirho,
				cer_chirho: 0.1,
				heard_chirho: screenChirho.heard_chirho,
				second_opinion_chirho: false,
				content_path_chirho: plannedChirho.content_path_chirho,
				content_sha256_chirho: plannedChirho.content_sha256_chirho,
				canonical_sha256_chirho: plannedChirho.canonical_sha256_chirho,
				sent_sha256_chirho: plannedChirho.sent_sha256_chirho,
				planned_audio_sha256_chirho: plannedChirho.audio_sha256_chirho,
				rough_breathing_words_chirho: 0
			}
		]
	};
	const planChirho = { model_chirho: modelChirho, jobs_chirho: [plannedChirho] };
	const jobsChirho = reconstructHandoffJobsChirho(
		handoffChirho,
		planChirho,
		journalChirho,
		asrChirho,
		new Set()
	);
	const inputChirho: ImportInputChirho = {
		manifest_chirho: {
			plan_sha256_chirho: MAIN_PLAN_SHA_CHIRHO,
			journal_sha256_chirho: 'c'.repeat(64),
			jobs_chirho: jobsChirho
		},
		manifest_sha256_chirho: 'd'.repeat(64),
		prepared_home_chirho: homeChirho,
		run_home_chirho: RUN_HOME_CHIRHO,
		expected_jobs_chirho: 1,
		flagged_excluded_chirho: 0,
		archive_inputs_chirho: [],
		clip_chirho: (jobChirho, rowChirho, lessonValueChirho, sourceShaChirho) =>
			localGreekClipForInputChirho(
				jobChirho,
				rowChirho,
				lessonValueChirho,
				sourceShaChirho,
				homeChirho,
				1
			)
	};
	const preparedChirho = {
		manifest_sha256_chirho: inputChirho.manifest_sha256_chirho,
		recordings_chirho: [
			{
				job_chirho: 'v0001',
				verse_id_chirho: lessonChirho.id_chirho,
				path_chirho: `${homeChirho}/delivery-chirho/v0001-chirho.mp3`,
				sha256_chirho: 'e'.repeat(64),
				bytes_chirho: 100,
				duration_chirho: 1,
				original_mp3_sha256_chirho: takeChirho.sha256_chirho,
				raw_flac_sha256_chirho: takeChirho.raw_sha256_chirho
			}
		]
	};
	return {
		handoffChirho,
		planChirho,
		journalChirho,
		asrChirho,
		inputChirho,
		preparedChirho,
		sourceChirho,
		lessonChirho
	};
}
async function temporaryRootChirho() {
	const rootChirho = await realpathChirho(
		await mkdtempChirho(joinChirho(tmpdirChirho(), 'finite-handoff-chirho-'))
	);
	rootsChirho.push(rootChirho);
	return rootChirho;
}
async function saveChirho(rootChirho: string, pathChirho: string, valueChirho: string | Buffer) {
	await mkdirChirho(joinChirho(rootChirho, pathChirho, '..'), { recursive: true });
	await writeFileChirho(joinChirho(rootChirho, pathChirho), valueChirho);
}

const mutationsChirho = [
	'canonical',
	'sent',
	'seed',
	'screen-sha',
	'screen-rate',
	'path',
	'unknown',
	'other-task',
	'duplicate',
	'excluded',
	'cap',
	'model'
] as const;
describe('finite screened handoff admission', () => {
	it.each([0, 0.3457])('accepts an exact same-take second opinion with score %s', (scoreChirho) => {
		const rowChirho = fixtureChirho();
		const selectedChirho = rowChirho.handoffChirho.ready_jobs_chirho[0];
		const screenChirho = rowChirho.asrChirho.takes_chirho[selectedChirho.task_uuid_chirho];
		Object.assign(screenChirho, {
			first_cer_chirho: 0.358,
			second_cer_chirho: scoreChirho,
			second_heard_chirho: 'synthetic second-pass fixture',
			second_model_chirho: 'openai-whisper large-v3, beam 5',
			cer_chirho: scoreChirho
		});
		selectedChirho.cer_chirho = scoreChirho;
		selectedChirho.second_opinion_chirho = true;
		const jobsChirho = reconstructHandoffJobsChirho(
			rowChirho.handoffChirho,
			rowChirho.planChirho,
			rowChirho.journalChirho,
			rowChirho.asrChirho,
			new Set()
		);
		expect(jobsChirho[0].chosen_chirho!.asr_chirho).toMatchObject({
			sha256_chirho: selectedChirho.take_sha256_chirho,
			cer_chirho: scoreChirho,
			heard_chirho: selectedChirho.heard_chirho,
			second_heard_chirho: 'synthetic second-pass fixture'
		});
	});
	it.each([
		'missing-first',
		'missing-second-transcript',
		'wrong-second-model',
		'non-finite-first',
		'negative-second',
		'forged-minimum',
		'still-over-limit',
		'concealed-second-opinion',
		'flag-without-second-score',
		'partial-second-evidence'
	] as const)('refuses %s before any archive action', (mutationChirho) => {
		const rowChirho = fixtureChirho();
		const selectedChirho = rowChirho.handoffChirho.ready_jobs_chirho[0];
		const screenChirho = rowChirho.asrChirho.takes_chirho[selectedChirho.task_uuid_chirho];
		Object.assign(screenChirho, {
			first_cer_chirho: 0.4,
			second_cer_chirho: 0.1,
			second_heard_chirho: 'synthetic second-pass fixture',
			second_model_chirho: 'openai-whisper large-v3, beam 5'
		});
		selectedChirho.second_opinion_chirho = true;
		switch (mutationChirho) {
			case 'missing-first':
				delete screenChirho.first_cer_chirho;
				break;
			case 'missing-second-transcript':
				delete screenChirho.second_heard_chirho;
				break;
			case 'wrong-second-model':
				screenChirho.second_model_chirho = 'another model';
				break;
			case 'non-finite-first':
				screenChirho.first_cer_chirho = NaN;
				break;
			case 'negative-second':
				screenChirho.second_cer_chirho = -0.1;
				break;
			case 'forged-minimum':
				screenChirho.second_cer_chirho = 0.2;
				break;
			case 'still-over-limit':
				screenChirho.second_cer_chirho = screenChirho.cer_chirho = selectedChirho.cer_chirho = 0.36;
				break;
			case 'concealed-second-opinion':
				selectedChirho.second_opinion_chirho = false;
				break;
			case 'flag-without-second-score':
				delete screenChirho.first_cer_chirho;
				delete screenChirho.second_cer_chirho;
				delete screenChirho.second_heard_chirho;
				delete screenChirho.second_model_chirho;
				Object.assign(screenChirho, { second_opinion_chirho: true });
				break;
			case 'partial-second-evidence':
				delete screenChirho.second_cer_chirho;
				selectedChirho.second_opinion_chirho = false;
				break;
		}
		expect(() =>
			reconstructHandoffJobsChirho(
				rowChirho.handoffChirho,
				rowChirho.planChirho,
				rowChirho.journalChirho,
				rowChirho.asrChirho,
				new Set()
			)
		).toThrow();
	});
	it('reconstructs source-bound seed1 work without the mutable producer manifest or networking', () => {
		const rowChirho = fixtureChirho(),
			fetchChirho = vi.fn();
		vi.stubGlobal('fetch', fetchChirho);
		const jobsChirho = reconstructHandoffJobsChirho(
			rowChirho.handoffChirho,
			rowChirho.planChirho,
			rowChirho.journalChirho,
			rowChirho.asrChirho,
			new Set()
		);
		expect(jobsChirho[0].chosen_chirho!.seed_chirho).toBe(1);
		expect(jobsChirho[0].sent_chirho).toBe(rowChirho.planChirho.jobs_chirho[0].sent_chirho);
		expect(fetchChirho).not.toHaveBeenCalled();
	});
	it.each(mutationsChirho)('refuses %s drift before any archive action', (mutationChirho) => {
		const rowChirho = fixtureChirho(),
			selectedChirho = rowChirho.handoffChirho.ready_jobs_chirho[0],
			excludedChirho = new Set<string>();
		switch (mutationChirho) {
			case 'canonical':
				selectedChirho.canonical_sha256_chirho = 'f'.repeat(64);
				break;
			case 'sent':
				rowChirho.journalChirho[0].sent_chirho = 'changed-chirho';
				break;
			case 'seed':
				rowChirho.journalChirho[1].seed_chirho = 2;
				break;
			case 'screen-sha':
				rowChirho.asrChirho.takes_chirho[selectedChirho.task_uuid_chirho].sha256_chirho =
					'f'.repeat(64);
				break;
			case 'screen-rate':
				selectedChirho.cer_chirho = 0.4;
				rowChirho.asrChirho.takes_chirho[selectedChirho.task_uuid_chirho].cer_chirho = 0.4;
				break;
			case 'path':
				selectedChirho.take_path_chirho = '../outside-chirho.mp3';
				break;
			case 'unknown':
				rowChirho.journalChirho.pop();
				break;
			case 'other-task':
				rowChirho.journalChirho.push({
					event_chirho: 'request',
					job_chirho: 'v0001',
					task_uuid_chirho: 'unknown-chirho'
				});
				break;
			case 'duplicate':
				rowChirho.handoffChirho.ready_jobs_chirho.push(structuredClone(selectedChirho));
				rowChirho.handoffChirho.counts_chirho.admitted_chirho = 2;
				break;
			case 'excluded':
				excludedChirho.add(selectedChirho.verse_id_chirho);
				break;
			case 'cap':
				rowChirho.handoffChirho.ready_jobs_chirho = Array.from(
					{ length: 501 },
					() => selectedChirho
				);
				rowChirho.handoffChirho.counts_chirho.admitted_chirho = 501;
				break;
			case 'model':
				rowChirho.handoffChirho.model_chirho = 'another voice';
				break;
		}
		expect(() =>
			reconstructHandoffJobsChirho(
				rowChirho.handoffChirho,
				rowChirho.planChirho,
				rowChirho.journalChirho,
				rowChirho.asrChirho,
				excludedChirho
			)
		).toThrow();
	});
	it('refuses changed, escaping or symlinked immutable inputs before parsing them', async () => {
		const rootChirho = await temporaryRootChirho(),
			pathChirho = `${RUN_HOME_CHIRHO}/handoffs-chirho/fixture-chirho/handoff-chirho.json`;
		await saveChirho(rootChirho, pathChirho, '{}');
		const optionsChirho = {
			handoff_path_chirho: pathChirho,
			handoff_sha256_chirho: 'f'.repeat(64),
			prepared_home_chirho: homeChirho
		};
		await expect(handoffInputChirho(rootChirho, optionsChirho)).rejects.toThrow(/SHA differs/);
		await expect(
			handoffInputChirho(rootChirho, {
				...optionsChirho,
				handoff_path_chirho: pathChirho.replace('/fixture-chirho/', '/../')
			})
		).rejects.toThrow(/Uncontained/);
		await rmChirho(joinChirho(rootChirho, pathChirho));
		await symlinkChirho(
			joinChirho(rootChirho, 'outside-chirho.json'),
			joinChirho(rootChirho, pathChirho)
		);
		await expect(handoffInputChirho(rootChirho, optionsChirho)).rejects.toThrow(/Redirected/);
	});
	it.each(['clips_chirho', 'readings_chirho'] as const)(
		'refuses a whole-verse conflict in %s before archive',
		async (arrayChirho) => {
			const rowChirho = fixtureChirho(),
				rootChirho = await temporaryRootChirho();
			const chapterChirho = {
				clips_chirho: [],
				readings_chirho: [],
				[arrayChirho]: [
					{ lesson_id_chirho: 'Mark.3.3', token_id_chirho: null, id_chirho: 'prior-human-chirho' }
				]
			};
			const textChirho = JSON.stringify(chapterChirho),
				pathChirho = '/audio-chirho/mark-chirho/chapter-03-chirho.json';
			await saveChirho(rootChirho, `static${pathChirho}`, textChirho);
			await saveChirho(
				rootChirho,
				'static/audio-chirho/manifest-chirho.json',
				JSON.stringify({
					books_chirho: {
						Mark: {
							chapters_chirho: [
								{ path_chirho: pathChirho, sha256_chirho: sha256Chirho(textChirho) }
							]
						}
					}
				})
			);
			await expect(
				preflightHandoffCatalogueChirho(rootChirho, rowChirho.inputChirho)
			).rejects.toThrow(/whole-verse reading/);
		}
	);
});

describe('bounded finite handoff parts and recovery', () => {
	it('groups many verses of six chapters together, preserving the unchanged clip closure and limits', () => {
		const rowChirho = fixtureChirho(),
			firstChirho = rowChirho.inputChirho.manifest_chirho.jobs_chirho[0],
			deliveryChirho = rowChirho.preparedChirho.recordings_chirho[0];
		const jobsChirho = Array.from({ length: 14 }, (_unusedChirho, indexChirho) => ({
			...firstChirho,
			job_chirho: `v${String(indexChirho + 1).padStart(4, '0')}`,
			verse_id_chirho: `Mark.${Math.floor(indexChirho / 2) + 1}.${(indexChirho % 2) + 1}`,
			content_path_chirho: `mark-chirho/chapter-${String(Math.floor(indexChirho / 2) + 1).padStart(2, '0')}-chirho.json`
		}));
		rowChirho.inputChirho.manifest_chirho.jobs_chirho = jobsChirho;
		rowChirho.inputChirho.expected_jobs_chirho = jobsChirho.length;
		rowChirho.preparedChirho.recordings_chirho = jobsChirho.map((jobChirho) => ({
			...deliveryChirho,
			job_chirho: jobChirho.job_chirho,
			verse_id_chirho: jobChirho.verse_id_chirho,
			path_chirho: `${homeChirho}/delivery-chirho/${jobChirho.job_chirho}-chirho.mp3`
		}));
		const partsChirho = partitionHandoffChirho(rowChirho.inputChirho, rowChirho.preparedChirho);
		expect(partsChirho.map((partChirho) => partChirho.input_chirho.expected_jobs_chirho)).toEqual([
			12, 2
		]);
		expect(partsChirho[0].input_chirho.clip_chirho).toBe(rowChirho.inputChirho.clip_chirho);
		rowChirho.preparedChirho.recordings_chirho[0].raw_flac_sha256_chirho = 'f'.repeat(64);
		expect(() => partitionHandoffChirho(rowChirho.inputChirho, rowChirho.preparedChirho)).toThrow(
			/identity/
		);
	});
	it('preflights actual MP3 bytes, recovers an interrupted chapter/index pair through the shared writer, then replays cold', async () => {
		const rowChirho = fixtureChirho(),
			rootChirho = await temporaryRootChirho();
		// Real codec bytes, never played. This proves integrity/recovery, not speech acceptance.
		const audioChirho = execFileSyncChirho('ffmpeg', [
			'-v',
			'error',
			'-nostdin',
			'-f',
			'lavfi',
			'-i',
			'anullsrc=r=44100:cl=mono',
			'-t',
			'1',
			'-b:a',
			'64k',
			'-f',
			'mp3',
			'pipe:1'
		]);
		Object.assign(rowChirho.preparedChirho.recordings_chirho[0], {
			sha256_chirho: sha256Chirho(audioChirho),
			bytes_chirho: audioChirho.length
		});
		const partsChirho = partitionHandoffChirho(rowChirho.inputChirho, rowChirho.preparedChirho),
			partChirho = partsChirho[0];
		await saveChirho(
			rootChirho,
			rowChirho.preparedChirho.recordings_chirho[0].path_chirho,
			audioChirho
		);
		await saveChirho(
			rootChirho,
			`${partChirho.input_chirho.prepared_home_chirho}/prepared-chirho.json`,
			JSON.stringify(partChirho.prepared_chirho)
		);
		const proofsChirho = await preflightHandoffPartsChirho(rootChirho, partsChirho);
		const beforeChirho = JSON.stringify({
			clips_chirho: [{ id_chirho: 'kept-word-chirho' }],
			videos_chirho: [{ id_chirho: 'kept-video-chirho' }]
		});
		const afterChirho = JSON.stringify({
			...JSON.parse(beforeChirho),
			added_chirho: 'new-reading-chirho'
		});
		const chapterPathChirho = 'static/audio-chirho/mark-chirho/chapter-03-chirho.json',
			indexPathChirho = 'static/audio-chirho/manifest-chirho.json';
		await saveChirho(rootChirho, chapterPathChirho, afterChirho);
		await saveChirho(rootChirho, indexPathChirho, 'old-index-chirho');
		const bindingChirho = sha256Chirho(
			partChirho.input_chirho.manifest_sha256_chirho + proofsChirho[0].prepared_sha256_chirho
		);
		await saveChirho(
			rootChirho,
			`${partChirho.input_chirho.prepared_home_chirho}/catalogue-commit-chirho.json`,
			JSON.stringify({
				binding_sha256_chirho: bindingChirho,
				writes_chirho: [
					{
						path_chirho: chapterPathChirho,
						before_sha256_chirho: sha256Chirho(beforeChirho),
						text_chirho: afterChirho
					},
					{
						path_chirho: indexPathChirho,
						before_sha256_chirho: sha256Chirho('old-index-chirho'),
						text_chirho: 'new-index-chirho'
					}
				]
			})
		);
		await mkdirChirho(joinChirho(rootChirho, 'build-chirho/r2-chirho'), { recursive: true });
		vi.stubGlobal('fetch', () => {
			throw Error('No provider call permitted');
		});
		await recoverHandoffPartsChirho(rootChirho, partsChirho, proofsChirho);
		expect(await readFileChirho(joinChirho(rootChirho, indexPathChirho), 'utf8')).toBe(
			'new-index-chirho'
		);
		expect(
			JSON.parse(await readFileChirho(joinChirho(rootChirho, chapterPathChirho), 'utf8'))
				.videos_chirho
		).toEqual([{ id_chirho: 'kept-video-chirho' }]);
		await recoverHandoffPartsChirho(rootChirho, partsChirho, proofsChirho);
		await saveChirho(
			rootChirho,
			`${partChirho.input_chirho.prepared_home_chirho}/prepared-chirho.json`,
			'{}'
		);
		await expect(recheckHandoffPartChirho(rootChirho, partChirho, proofsChirho[0])).rejects.toThrow(
			/changed/
		);
	});
	it('refuses a missing last part or corrupt MP3 before any recovery/store call', async () => {
		const rowChirho = fixtureChirho(),
			rootChirho = await temporaryRootChirho(),
			partsChirho = partitionHandoffChirho(rowChirho.inputChirho, rowChirho.preparedChirho);
		await expect(preflightHandoffPartsChirho(rootChirho, partsChirho)).rejects.toThrow();
		await saveChirho(
			rootChirho,
			`${partsChirho[0].input_chirho.prepared_home_chirho}/prepared-chirho.json`,
			JSON.stringify(partsChirho[0].prepared_chirho)
		);
		await saveChirho(
			rootChirho,
			rowChirho.preparedChirho.recordings_chirho[0].path_chirho,
			'corrupt-chirho'
		);
		await expect(preflightHandoffPartsChirho(rootChirho, partsChirho)).rejects.toThrow(
			/bytes differ/
		);
	});
});
