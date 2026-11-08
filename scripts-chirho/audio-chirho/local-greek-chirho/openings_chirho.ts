// For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life. — John 3:16 (KJV)
// Workflow: local-greek-chirho/README-chirho.md. Fixed seed-1 NT openings, never the live producer tail.
import { realpath as realpathChirho } from 'node:fs/promises';
import { isDeepStrictEqual as equalChirho } from 'node:util';
import { BIBLE_BOOKS_CHIRHO } from '../../../src/lib/bible-chirho/books-chirho';
import { sha256Chirho } from '../audition_chirho';
import {
	localGreekClipForInputChirho,
	type LocalGreekJobChirho,
	type DeliveryChirho,
	type LocalGreekManifestChirho
} from './manifest_chirho';
import {
	boundedReadChirho,
	legacyInputChirho,
	validatePhaseJobChirho,
	type ImportInputChirho
} from './phase_chirho';

export const OPENINGS_RUN_HOME_CHIRHO =
	'workspace-chirho/audio-chirho/local-greek-verses-2026-11-07-chirho/openings-2026-11-08-chirho';
export const OPENINGS_HOME_CHIRHO = 'build-chirho/local-greek-openings-2026-11-08-chirho';
export const OPENINGS_MANIFEST_SHA_CHIRHO =
	'2da5fc001ef23358b92af4f69f3aeee26f3df7f0e82b1273d76a73559f7c4cd5';
const PLAN_SHA_CHIRHO = '0150c609dac6c15c1fd444091d3ae80f7be2ef2fcbadd9ef83d821275f8f828e';
const JOURNAL_SHA_CHIRHO = '0faf2c0bd53b23a26e9db591cb00cb20901d4dcb441fa58d09e5f1eb4f5cb6b7';
export const OPENINGS_ASR_SHA_CHIRHO =
	'266d0b64baa1cf2eacae005785dfcf2f6c74c6bbd7de889bbc9a5c28888127b0';
export const OPENINGS_HANDOFF_SHA_CHIRHO =
	'7ed431cdde9b9cb6cacfa3720c93c0d4edbdd0a73c194dab4b79e13a6e46ae7a';
const FLAGGED_CHIRHO = new Set(['John.3.1', 'Acts.28.1', '1Cor.13.1']);
const INPUTS_CHIRHO = [
	['manifest-chirho.json', OPENINGS_MANIFEST_SHA_CHIRHO, 'json'],
	['plan-chirho.json', PLAN_SHA_CHIRHO, 'json'],
	['journal-chirho.jsonl', JOURNAL_SHA_CHIRHO, 'jsonl'],
	['asr-chirho.json', OPENINGS_ASR_SHA_CHIRHO, 'json'],
	['handoff-openings-chirho.json', OPENINGS_HANDOFF_SHA_CHIRHO, 'json']
] as const;

type OpeningJobChirho = Parameters<typeof validatePhaseJobChirho>[0] & {
	file_stem_chirho: string;
	reference_chirho: string;
	rough_breathing_words_chirho: number;
};
type OpeningPlanJobChirho = LocalGreekJobChirho & {
	file_stem_chirho: string;
	audio_sha256_chirho: string;
};
export interface OpeningsPlanChirho {
	model_chirho: unknown;
	jobs_chirho: OpeningPlanJobChirho[];
}
export interface OpeningsManifestChirho extends LocalGreekManifestChirho {
	model_chirho: unknown;
	counts_chirho: { done: number; flagged: number };
	asr_limit_chirho: number;
	reported_cost_chirho: number;
	jobs_chirho: OpeningJobChirho[];
}
export interface OpeningsAsrChirho {
	model_chirho: string;
	takes_chirho: Record<string, NonNullable<LocalGreekJobChirho['chosen_chirho']>['asr_chirho']>;
}
type JournalChirho = Parameters<typeof validatePhaseJobChirho>[4];

export function openingVerseIdsChirho(): string[] {
	return BIBLE_BOOKS_CHIRHO.filter((bookChirho) => bookChirho.language_chirho === 'grc')
		.flatMap((bookChirho) =>
			Array.from(
				{ length: bookChirho.chapter_count_chirho },
				(_valueChirho, indexChirho) => `${bookChirho.id_chirho}.${indexChirho + 1}.1`
			)
		)
		.filter((idChirho) => idChirho !== 'John.1.1');
}

/** A first take needs its exact plan, separately frozen screen and received request/result pair. */
export function validateOpeningJobChirho(
	jobChirho: OpeningJobChirho,
	planChirho: OpeningPlanJobChirho,
	journalChirho: JournalChirho,
	asrChirho: OpeningsAsrChirho
): void {
	const takeChirho = jobChirho.chosen_chirho;
	if (
		!takeChirho ||
		jobChirho.job_chirho !==
			`v${8001 + openingVerseIdsChirho().indexOf(jobChirho.verse_id_chirho)}` ||
		!openingVerseIdsChirho().includes(jobChirho.verse_id_chirho) ||
		jobChirho.attempts_chirho.length !== 1 ||
		jobChirho.file_stem_chirho !== planChirho.file_stem_chirho ||
		!equalChirho(takeChirho.asr_chirho, asrChirho.takes_chirho[takeChirho.task_uuid_chirho])
	)
		throw Error('Opening job, first take or separate ASR identity differs');
	const stemChirho = `${jobChirho.job_chirho}-${planChirho.file_stem_chirho}-${takeChirho.task_uuid_chirho.slice(0, 8)}-chirho`;
	if (
		takeChirho.path_chirho !== `takes-chirho/${stemChirho}.mp3` ||
		takeChirho.raw_path_chirho !== `raw-chirho/${stemChirho}.flac` ||
		!/^[a-f0-9]{8}(-[a-f0-9]{4}){3}-[a-f0-9]{12}$/.test(takeChirho.task_uuid_chirho)
	)
		throw Error('Opening original belongs to another job or path');
	validatePhaseJobChirho(
		jobChirho,
		{
			job_chirho: jobChirho.job_chirho,
			verse_id_chirho: jobChirho.verse_id_chirho,
			kind_chirho: 'first_take',
			take_sha256_chirho: takeChirho.sha256_chirho,
			raw_sha256_chirho: takeChirho.raw_sha256_chirho,
			cer_chirho: takeChirho.asr_chirho.cer_chirho
		},
		{ ...planChirho, state_chirho: 'pending', chosen_chirho: null },
		planChirho,
		journalChirho
	);
}

export function selectOpeningJobsChirho(
	manifestChirho: OpeningsManifestChirho,
	planChirho: OpeningsPlanChirho,
	journalChirho: JournalChirho,
	asrChirho: OpeningsAsrChirho,
	legacyModelChirho: unknown
): OpeningJobChirho[] {
	const expectedChirho = openingVerseIdsChirho();
	if (
		expectedChirho.length !== 259 ||
		manifestChirho.jobs_chirho.length !== 259 ||
		planChirho.jobs_chirho.length !== 259 ||
		journalChirho.length !== 518 ||
		Object.keys(asrChirho.takes_chirho).length !== 259 ||
		asrChirho.model_chirho !== 'openai-whisper large-v3-turbo' ||
		manifestChirho.plan_sha256_chirho !== PLAN_SHA_CHIRHO ||
		manifestChirho.journal_sha256_chirho !== JOURNAL_SHA_CHIRHO ||
		manifestChirho.asr_limit_chirho !== 0.35 ||
		manifestChirho.reported_cost_chirho !== 0 ||
		manifestChirho.counts_chirho.done !== 256 ||
		manifestChirho.counts_chirho.flagged !== 3 ||
		!equalChirho(manifestChirho.model_chirho, planChirho.model_chirho) ||
		!equalChirho(manifestChirho.model_chirho, legacyModelChirho)
	)
		throw Error('Fixed openings partition, model or metadata identity differs');
	const selectedChirho: OpeningJobChirho[] = [];
	const tasksChirho = new Set<string>();
	for (const [indexChirho, jobChirho] of manifestChirho.jobs_chirho.entries()) {
		const originalChirho = planChirho.jobs_chirho[indexChirho];
		const jobIdChirho = `v${8001 + indexChirho}`;
		if (
			!originalChirho ||
			jobChirho.job_chirho !== jobIdChirho ||
			originalChirho.job_chirho !== jobIdChirho ||
			jobChirho.verse_id_chirho !== expectedChirho[indexChirho] ||
			originalChirho.verse_id_chirho !== expectedChirho[indexChirho] ||
			!jobChirho.chosen_chirho ||
			tasksChirho.has(jobChirho.chosen_chirho.task_uuid_chirho)
		)
			throw Error('Opening chapter coverage, order or task differs');
		tasksChirho.add(jobChirho.chosen_chirho.task_uuid_chirho);
		if (
			!equalChirho(
				jobChirho.chosen_chirho.asr_chirho,
				asrChirho.takes_chirho[jobChirho.chosen_chirho.task_uuid_chirho]
			)
		)
			throw Error('Separate openings ASR changed');
		if (FLAGGED_CHIRHO.has(jobChirho.verse_id_chirho)) {
			if (jobChirho.state_chirho !== 'flagged')
				throw Error('Held openings cannot enter this finite phase');
			continue;
		}
		validateOpeningJobChirho(jobChirho, originalChirho, journalChirho, asrChirho);
		selectedChirho.push(jobChirho);
	}
	if (
		selectedChirho.length !== 256 ||
		journalChirho.some((eventChirho) => !tasksChirho.has(String(eventChirho.task_uuid_chirho)))
	)
		throw Error('Unknown or foreign request entered openings evidence');
	return selectedChirho;
}

export interface OpeningsHandoffChirho {
	manifest_sha256_chirho: string;
	plan_sha256_chirho: string;
	journal_sha256_chirho: string;
	asr_sha256_chirho: string;
	voice_chirho: string;
	recipe_chirho: {
		recipe_id_chirho: string;
		language_chirho: string;
		pronunciation_chirho: string;
	};
	counts_chirho: { ready_chirho: number; held_chirho: number };
	live_chapters_changed_since_plan_chirho: unknown[];
	ready_jobs_chirho: Record<string, unknown>[];
	held_jobs_chirho: {
		job_chirho: string;
		verse_id_chirho: string;
		state_chirho: string;
		cer_chirho: number;
	}[];
}

export function validateOpeningsHandoffChirho(
	handoffChirho: OpeningsHandoffChirho,
	manifestChirho: OpeningsManifestChirho,
	planChirho: OpeningsPlanChirho,
	selectedChirho: readonly OpeningJobChirho[]
): void {
	if (
		handoffChirho.manifest_sha256_chirho !== OPENINGS_MANIFEST_SHA_CHIRHO ||
		handoffChirho.plan_sha256_chirho !== PLAN_SHA_CHIRHO ||
		handoffChirho.journal_sha256_chirho !== JOURNAL_SHA_CHIRHO ||
		handoffChirho.asr_sha256_chirho !== OPENINGS_ASR_SHA_CHIRHO ||
		handoffChirho.voice_chirho !==
			(manifestChirho.model_chirho as { voice_chirho: string }).voice_chirho ||
		handoffChirho.recipe_chirho.recipe_id_chirho !== 'chatterbox-v3-modern-greek-verse-v1-chirho' ||
		handoffChirho.recipe_chirho.language_chirho !== 'el' ||
		handoffChirho.recipe_chirho.pronunciation_chirho !== 'modern_greek' ||
		handoffChirho.counts_chirho.ready_chirho !== 256 ||
		handoffChirho.counts_chirho.held_chirho !== 3 ||
		handoffChirho.live_chapters_changed_since_plan_chirho.length !== 0 ||
		handoffChirho.ready_jobs_chirho.length !== 256 ||
		selectedChirho.length !== 256
	)
		throw Error('Exact openings handoff metadata differs');
	const plansChirho = new Map(
		planChirho.jobs_chirho.map((jobChirho) => [jobChirho.job_chirho, jobChirho])
	);
	for (const [indexChirho, jobChirho] of selectedChirho.entries()) {
		const takeChirho = jobChirho.chosen_chirho;
		const expectedChirho = {
			job_chirho: jobChirho.job_chirho,
			verse_id_chirho: jobChirho.verse_id_chirho,
			reference_chirho: jobChirho.reference_chirho,
			clip_id_if_installed_chirho: `local-greek-${jobChirho.job_chirho}-chirho`,
			take_path_chirho: takeChirho.path_chirho,
			take_sha256_chirho: takeChirho.sha256_chirho,
			take_bytes_chirho: takeChirho.bytes_chirho,
			seconds_chirho: takeChirho.seconds_chirho,
			raw_path_chirho: takeChirho.raw_path_chirho,
			raw_sha256_chirho: takeChirho.raw_sha256_chirho,
			seed_chirho: 1,
			cer_chirho: takeChirho.asr_chirho.cer_chirho,
			task_uuid_chirho: takeChirho.task_uuid_chirho,
			content_path_chirho: jobChirho.content_path_chirho,
			content_sha256_chirho: jobChirho.content_sha256_chirho,
			canonical_sha256_chirho: jobChirho.canonical_sha256_chirho,
			sent_sha256_chirho: jobChirho.sent_sha256_chirho,
			planned_audio_sha256_chirho: plansChirho.get(jobChirho.job_chirho)?.audio_sha256_chirho,
			rough_breathing_words_chirho: jobChirho.rough_breathing_words_chirho
		};
		if (!equalChirho(handoffChirho.ready_jobs_chirho[indexChirho], expectedChirho))
			throw Error('Openings ready-job identity differs');
	}
	const heldChirho = manifestChirho.jobs_chirho
		.filter((jobChirho) => jobChirho.state_chirho === 'flagged')
		.map((jobChirho) => ({
			job_chirho: jobChirho.job_chirho,
			verse_id_chirho: jobChirho.verse_id_chirho,
			state_chirho: 'flagged',
			cer_chirho: jobChirho.chosen_chirho.asr_chirho.cer_chirho
		}));
	if (!equalChirho(handoffChirho.held_jobs_chirho, heldChirho))
		throw Error('Openings held set differs');
}

export async function preflightOpeningOriginalsChirho(
	rootChirho: string,
	jobsChirho: readonly OpeningJobChirho[]
): Promise<void> {
	for (const jobChirho of jobsChirho) {
		for (const [pathChirho, expectedShaChirho] of [
			[jobChirho.chosen_chirho.path_chirho, jobChirho.chosen_chirho.sha256_chirho],
			[jobChirho.chosen_chirho.raw_path_chirho, jobChirho.chosen_chirho.raw_sha256_chirho]
		]) {
			const bytesChirho = await boundedReadChirho(
				rootChirho,
				`${OPENINGS_RUN_HOME_CHIRHO}/${pathChirho}`,
				16 * 1024 ** 2
			);
			if (
				sha256Chirho(bytesChirho) !== expectedShaChirho ||
				(pathChirho === jobChirho.chosen_chirho.path_chirho &&
					bytesChirho.length !== jobChirho.chosen_chirho.bytes_chirho)
			)
				throw Error('Opening original MP3/FLAC changed before archive');
		}
	}
}

export function clipForOpeningsChirho(
	jobsChirho: readonly OpeningJobChirho[]
): ImportInputChirho['clip_chirho'] {
	const selectedChirho = new Map(
		jobsChirho.map((jobChirho) => [jobChirho.job_chirho, structuredClone(jobChirho)])
	);
	return (jobChirho, deliveryChirho, lessonChirho, contentShaChirho) => {
		if (!equalChirho(selectedChirho.get(jobChirho.job_chirho), jobChirho))
			throw Error('Job is outside the immutable openings phase');
		return {
			...localGreekClipForInputChirho(
				jobChirho,
				deliveryChirho,
				lessonChirho,
				contentShaChirho,
				OPENINGS_HOME_CHIRHO,
				1
			),
			generation_seed_chirho: 1,
			source_phase_sha256_chirho: OPENINGS_HANDOFF_SHA_CHIRHO,
			source_asr_sha256_chirho: OPENINGS_ASR_SHA_CHIRHO
		};
	};
}

export async function openingsInputChirho(rootChirho: string): Promise<ImportInputChirho> {
	const bytesChirho = new Map<string, Buffer>();
	for (const [nameChirho, digestChirho] of INPUTS_CHIRHO) {
		const rawChirho = await boundedReadChirho(
			rootChirho,
			`${OPENINGS_HOME_CHIRHO}/source-chirho/${nameChirho}`,
			32 * 1024 ** 2
		);
		if (sha256Chirho(rawChirho) !== digestChirho)
			throw Error('Frozen openings input differs: ' + nameChirho);
		bytesChirho.set(nameChirho, rawChirho);
	}
	const manifestChirho = JSON.parse(
		bytesChirho.get('manifest-chirho.json')!.toString()
	) as OpeningsManifestChirho;
	const planChirho = JSON.parse(
		bytesChirho.get('plan-chirho.json')!.toString()
	) as OpeningsPlanChirho;
	const asrChirho = JSON.parse(bytesChirho.get('asr-chirho.json')!.toString()) as OpeningsAsrChirho;
	const journalChirho = bytesChirho
		.get('journal-chirho.jsonl')!
		.toString()
		.split('\n')
		.filter(Boolean)
		.map((lineChirho) => JSON.parse(lineChirho)) as JournalChirho;
	const legacyChirho = await legacyInputChirho(rootChirho);
	const selectedChirho = selectOpeningJobsChirho(
		manifestChirho,
		planChirho,
		journalChirho,
		asrChirho,
		(legacyChirho.manifest_chirho as unknown as { model_chirho: unknown }).model_chirho
	);
	validateOpeningsHandoffChirho(
		JSON.parse(
			bytesChirho.get('handoff-openings-chirho.json')!.toString()
		) as OpeningsHandoffChirho,
		manifestChirho,
		planChirho,
		selectedChirho
	);
	await preflightOpeningOriginalsChirho(rootChirho, selectedChirho);
	return {
		manifest_chirho: { ...manifestChirho, jobs_chirho: selectedChirho },
		manifest_sha256_chirho: OPENINGS_MANIFEST_SHA_CHIRHO,
		prepared_home_chirho: OPENINGS_HOME_CHIRHO,
		run_home_chirho: OPENINGS_RUN_HOME_CHIRHO,
		expected_jobs_chirho: 256,
		flagged_excluded_chirho: 3,
		archive_inputs_chirho: INPUTS_CHIRHO.map(([nameChirho, digestChirho, extensionChirho]) => ({
			path_chirho: `${OPENINGS_HOME_CHIRHO}/source-chirho/${nameChirho}`,
			sha256_chirho: digestChirho,
			extension_chirho: extensionChirho
		})),
		clip_chirho: clipForOpeningsChirho(selectedChirho)
	};
}

export interface PreparedOpeningRowsChirho {
	manifest_sha256_chirho: string;
	recordings_chirho: DeliveryChirho[];
}
export interface OpeningPartChirho {
	input_chirho: ImportInputChirho;
	prepared_chirho: PreparedOpeningRowsChirho;
}
export interface OpeningPartProofChirho {
	prepared_sha256_chirho: string;
	receipts_sha256_chirho: string;
}

/** Finite parts retain the full validated clip closure and original manifest identity. */
export function partitionOpeningInputChirho(
	inputChirho: ImportInputChirho,
	preparedChirho: PreparedOpeningRowsChirho
): OpeningPartChirho[] {
	const jobsChirho = inputChirho.manifest_chirho.jobs_chirho;
	const expectedChirho = openingVerseIdsChirho().filter(
		(idChirho) => !FLAGGED_CHIRHO.has(idChirho)
	);
	if (
		inputChirho.prepared_home_chirho !== OPENINGS_HOME_CHIRHO ||
		inputChirho.run_home_chirho !== OPENINGS_RUN_HOME_CHIRHO ||
		inputChirho.manifest_sha256_chirho !== OPENINGS_MANIFEST_SHA_CHIRHO ||
		preparedChirho.manifest_sha256_chirho !== OPENINGS_MANIFEST_SHA_CHIRHO ||
		inputChirho.expected_jobs_chirho !== 256 ||
		jobsChirho.length !== 256 ||
		preparedChirho.recordings_chirho.length !== 256 ||
		new Set(jobsChirho.map((jobChirho) => jobChirho.content_path_chirho)).size !== 256 ||
		jobsChirho.some(
			(jobChirho, indexChirho) =>
				jobChirho.state_chirho !== 'done' ||
				jobChirho.verse_id_chirho !== expectedChirho[indexChirho]
		)
	)
		throw Error('Only the complete validated openings input can be partitioned');
	const deliveriesChirho = new Map(
		preparedChirho.recordings_chirho.map((rowChirho) => [rowChirho.job_chirho, rowChirho])
	);
	if (deliveriesChirho.size !== 256) throw Error('Prepared openings contain duplicate deliveries');
	for (const jobChirho of jobsChirho) {
		const rowChirho = deliveriesChirho.get(jobChirho.job_chirho),
			takeChirho = jobChirho.chosen_chirho;
		if (
			!rowChirho ||
			!takeChirho ||
			rowChirho.verse_id_chirho !== jobChirho.verse_id_chirho ||
			rowChirho.path_chirho !==
				`${OPENINGS_HOME_CHIRHO}/delivery-chirho/${jobChirho.job_chirho}-chirho.mp3` ||
			rowChirho.original_mp3_sha256_chirho !== takeChirho.sha256_chirho ||
			rowChirho.raw_flac_sha256_chirho !== takeChirho.raw_sha256_chirho ||
			!/^[a-f0-9]{64}$/.test(rowChirho.sha256_chirho) ||
			!Number.isSafeInteger(rowChirho.bytes_chirho) ||
			rowChirho.bytes_chirho <= 0 ||
			rowChirho.bytes_chirho > 4_000_000 ||
			!Number.isFinite(rowChirho.duration_chirho) ||
			Math.abs(rowChirho.duration_chirho - takeChirho.seconds_chirho) > 0.15
		)
			throw Error('Prepared openings delivery identity differs');
	}
	const partsChirho: OpeningPartChirho[] = [];
	for (let offsetChirho = 0; offsetChirho < jobsChirho.length; offsetChirho += 6) {
		const numberChirho = partsChirho.length + 1;
		const shardChirho = String(Math.floor((numberChirho - 1) / 10) * 10).padStart(4, '0');
		const subsetChirho = jobsChirho.slice(offsetChirho, offsetChirho + 6);
		partsChirho.push({
			input_chirho: {
				...inputChirho,
				manifest_chirho: { ...inputChirho.manifest_chirho, jobs_chirho: subsetChirho },
				prepared_home_chirho: `${OPENINGS_HOME_CHIRHO}/catalogue-parts-chirho/${shardChirho}-chirho/part-${String(numberChirho).padStart(4, '0')}-chirho`,
				expected_jobs_chirho: subsetChirho.length
			},
			prepared_chirho: {
				manifest_sha256_chirho: OPENINGS_MANIFEST_SHA_CHIRHO,
				recordings_chirho: subsetChirho.map((jobChirho) =>
					deliveriesChirho.get(jobChirho.job_chirho)!
				)
			}
		});
	}
	return partsChirho;
}

export async function readOpeningPartsChirho(
	rootChirho: string,
	inputChirho: ImportInputChirho
): Promise<OpeningPartChirho[]> {
	const rawChirho = await boundedReadChirho(
		rootChirho,
		`${OPENINGS_HOME_CHIRHO}/prepared-chirho.json`,
		2 * 1024 ** 2
	);
	return partitionOpeningInputChirho(
		inputChirho,
		JSON.parse(rawChirho.toString()) as PreparedOpeningRowsChirho
	);
}

/** All prepared files and exact archive-receipt copies must be ready before the first apply. */
export async function preflightOpeningPartsChirho(
	rootChirho: string,
	partsChirho: readonly OpeningPartChirho[]
): Promise<OpeningPartProofChirho[]> {
	if (
		partsChirho.length !== 43 ||
		partsChirho.reduce(
			(totalChirho, partChirho) => totalChirho + partChirho.input_chirho.expected_jobs_chirho,
			0
		) !== 256
	)
		throw Error('The complete bounded openings part plan is required');
	const receiptBytesChirho = await boundedReadChirho(
		rootChirho,
		`${OPENINGS_HOME_CHIRHO}/original-receipts-chirho.jsonl`,
		16 * 1024 ** 2
	);
	const expectedReceiptsChirho = new Set<string>();
	for (const partChirho of partsChirho) {
		for (const jobChirho of partChirho.input_chirho.manifest_chirho.jobs_chirho) {
			if (!jobChirho.chosen_chirho) throw Error('Missing received openings take');
			expectedReceiptsChirho.add(
				`provenance-audio-chirho/sha256-chirho/${jobChirho.chosen_chirho.sha256_chirho}.mp3`
			);
			expectedReceiptsChirho.add(
				`provenance-audio-chirho/sha256-chirho/${jobChirho.chosen_chirho.raw_sha256_chirho}.flac`
			);
		}
		for (const rowChirho of partChirho.input_chirho.archive_inputs_chirho)
			expectedReceiptsChirho.add(
				`provenance-audio-chirho/sha256-chirho/${rowChirho.sha256_chirho}.${rowChirho.extension_chirho}`
			);
	}
	const receiptsChirho = receiptBytesChirho
		.toString()
		.split('\n')
		.filter(Boolean)
		.map(
			(lineChirho) =>
				JSON.parse(lineChirho) as {
					key_chirho: string;
					sha256_chirho: string;
					readback_sha256_chirho: string;
					bytes_chirho: number;
				}
		);
	if (
		expectedReceiptsChirho.size !== 517 ||
		receiptsChirho.length !== 517 ||
		new Set(receiptsChirho.map((rowChirho) => rowChirho.key_chirho)).size !== 517 ||
		receiptsChirho.some(
			(rowChirho) =>
				!expectedReceiptsChirho.has(rowChirho.key_chirho) ||
				rowChirho.sha256_chirho !== rowChirho.readback_sha256_chirho ||
				!rowChirho.key_chirho.includes(`/${rowChirho.sha256_chirho}.`) ||
				!Number.isSafeInteger(rowChirho.bytes_chirho) ||
				rowChirho.bytes_chirho <= 0
		)
	)
		throw Error('The complete exact openings archive receipts are required');
	const proofsChirho: OpeningPartProofChirho[] = [];
	for (const [indexChirho, partChirho] of partsChirho.entries()) {
		const numberChirho = indexChirho + 1,
			shardChirho = String(Math.floor(indexChirho / 10) * 10).padStart(4, '0');
		const homeChirho = `${OPENINGS_HOME_CHIRHO}/catalogue-parts-chirho/${shardChirho}-chirho/part-${String(numberChirho).padStart(4, '0')}-chirho`;
		if (
			partChirho.input_chirho.prepared_home_chirho !== homeChirho ||
			partChirho.input_chirho.expected_jobs_chirho !==
				partChirho.input_chirho.manifest_chirho.jobs_chirho.length ||
			partChirho.input_chirho.expected_jobs_chirho > 6 ||
			partChirho.input_chirho.expected_jobs_chirho < 1
		)
			throw Error('Invalid bounded openings part identity');
		const preparedBytesChirho = await boundedReadChirho(
			rootChirho,
			`${homeChirho}/prepared-chirho.json`,
			2 * 1024 ** 2
		);
		const copiedReceiptsChirho = await boundedReadChirho(
			rootChirho,
			`${homeChirho}/original-receipts-chirho.jsonl`,
			16 * 1024 ** 2
		);
		if (
			!equalChirho(JSON.parse(preparedBytesChirho.toString()), partChirho.prepared_chirho) ||
			!copiedReceiptsChirho.equals(receiptBytesChirho)
		)
			throw Error('Prepared openings part or copied archive receipt differs');
		proofsChirho.push({
			prepared_sha256_chirho: sha256Chirho(preparedBytesChirho),
			receipts_sha256_chirho: sha256Chirho(copiedReceiptsChirho)
		});
	}
	return proofsChirho;
}

export async function recheckOpeningPartChirho(
	rootChirho: string,
	partChirho: OpeningPartChirho,
	proofChirho: OpeningPartProofChirho
): Promise<void> {
	for (const [nameChirho, expectedChirho] of [
		['prepared-chirho.json', proofChirho.prepared_sha256_chirho],
		['original-receipts-chirho.jsonl', proofChirho.receipts_sha256_chirho]
	]) {
		const bytesChirho = await boundedReadChirho(
			rootChirho,
			`${partChirho.input_chirho.prepared_home_chirho}/${nameChirho}`,
			16 * 1024 ** 2
		);
		if (sha256Chirho(bytesChirho) !== expectedChirho)
			throw Error('Frozen openings part changed after complete preflight');
	}
}

if (import.meta.main) {
	const modeChirho = process.argv.slice(2).join(' ');
	if (!['--describe-chirho', '--describe-parts-chirho'].includes(modeChirho))
		throw Error('Expected --describe-chirho or --describe-parts-chirho');
	const rootChirho = await realpathChirho('.');
	const inputChirho = await openingsInputChirho(rootChirho);
	if (modeChirho === '--describe-parts-chirho') {
		console.log(
			JSON.stringify(
				(await readOpeningPartsChirho(rootChirho, inputChirho)).map((partChirho) => ({
					prepared_home_chirho: partChirho.input_chirho.prepared_home_chirho,
					expected_jobs_chirho: partChirho.input_chirho.expected_jobs_chirho,
					prepared_chirho: partChirho.prepared_chirho
				}))
			)
		);
	} else
		console.log(
			JSON.stringify({
				manifest_sha256_chirho: inputChirho.manifest_sha256_chirho,
				prepared_home_chirho: inputChirho.prepared_home_chirho,
				run_home_chirho: inputChirho.run_home_chirho,
				archive_inputs_chirho: inputChirho.archive_inputs_chirho,
				jobs_chirho: inputChirho.manifest_chirho.jobs_chirho
			})
		);
}
