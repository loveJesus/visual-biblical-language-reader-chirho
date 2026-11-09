// For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life. — John 3:16 (KJV)
// Workflow: README-chirho.md. Finite screened snapshots; this adapter never reads the mutable producer tail.
import { realpath as realpathChirho } from 'node:fs/promises';
import { dirname as dirnameChirho } from 'node:path';
import { isDeepStrictEqual as equalChirho } from 'node:util';
import { sha256Chirho } from '../audition_chirho';
import {
	RUN_HOME_CHIRHO,
	localGreekClipForInputChirho,
	type LocalGreekJobChirho,
	type LocalGreekManifestChirho,
	type DeliveryChirho
} from './manifest_chirho';
import {
	boundedReadChirho,
	validatePhaseJobChirho,
	type ImportInputChirho,
	type ArchiveInputChirho
} from './phase_chirho';
import type { chapterRecipeChirho } from '../../../src/lib/domain-chirho/pronunciation-chirho/chapter-recipe-chirho';

export const MAIN_PLAN_SHA_CHIRHO =
	'463074392aa874ca484ad8c45f9729ca262e3469297f4604b8c82d2beca78631';
export const MAX_HANDOFF_JOBS_CHIRHO = 500;
type JournalChirho = Parameters<typeof validatePhaseJobChirho>[4];
type ReceivedJobChirho = Parameters<typeof validatePhaseJobChirho>[0];
export interface HandoffPlanJobChirho extends LocalGreekJobChirho {
	reference_chirho: string;
	file_stem_chirho: string;
	audio_sha256_chirho: string;
	rough_breathing_words_chirho: number;
	token_ids_chirho: string[];
}
export interface HandoffRowChirho {
	plan_index_chirho: number;
	job_chirho: string;
	verse_id_chirho: string;
	reference_chirho: string;
	clip_id_if_installed_chirho: string;
	kind_chirho: string;
	requested_at_chirho: string;
	result_at_chirho: string;
	take_path_chirho: string;
	take_sha256_chirho: string;
	take_bytes_chirho: number;
	seconds_chirho: number;
	decoded_mp3_seconds_chirho: number;
	decoded_flac_seconds_chirho: number;
	raw_path_chirho: string;
	raw_sha256_chirho: string;
	seed_chirho: number;
	sample_rate_chirho: number;
	task_uuid_chirho: string;
	cer_chirho: number;
	heard_chirho: string;
	second_opinion_chirho: boolean;
	content_path_chirho: string;
	content_sha256_chirho: string;
	canonical_sha256_chirho: string;
	sent_sha256_chirho: string;
	planned_audio_sha256_chirho: string;
	rough_breathing_words_chirho: number;
}
export interface FiniteHandoffChirho {
	handoff_id_chirho: string;
	batch_folder_chirho: string;
	model_chirho: unknown;
	recipe_chirho: {
		recipe_id_chirho: string;
		language_chirho: string;
		pronunciation_chirho: string;
	};
	snapshots_chirho: Record<
		'plan_chirho' | 'journal_chirho' | 'asr_chirho',
		{ path_chirho: string; sha256_chirho: string; bytes_chirho: number }
	>;
	earlier_handoffs_chirho: { path_chirho: string; sha256_chirho: string; rows_chirho: number }[];
	counts_chirho: { admitted_chirho: number };
	screen_chirho: { limit_chirho: number; model_chirho: string };
	ready_jobs_chirho: HandoffRowChirho[];
	skipped_inside_admitted_range_chirho: unknown[];
}
export interface HandoffAsrChirho {
	model_chirho: string;
	takes_chirho: Record<
		string,
		NonNullable<LocalGreekJobChirho['chosen_chirho']>['asr_chirho'] & {
			heard_chirho: string;
			second_opinion_chirho?: unknown;
		}
	>;
}
export interface HandoffOptionsChirho {
	handoff_path_chirho: string;
	handoff_sha256_chirho: string;
	prepared_home_chirho: string;
}
export interface HandoffInputChirho extends ImportInputChirho {
	manifest_bytes_chirho: Buffer;
	handoff_sha256_chirho: string;
}

/** Reconstruct the received take from a frozen plan/request/result/screen, never handoff assertions alone. */
export function reconstructHandoffJobsChirho(
	handoffChirho: FiniteHandoffChirho,
	planChirho: { model_chirho: unknown; jobs_chirho: HandoffPlanJobChirho[] },
	journalChirho: JournalChirho,
	asrChirho: HandoffAsrChirho,
	excludedChirho: ReadonlySet<string>
): ReceivedJobChirho[] {
	const rowsChirho = handoffChirho.ready_jobs_chirho;
	if (
		!Array.isArray(rowsChirho) ||
		rowsChirho.length < 1 ||
		rowsChirho.length > MAX_HANDOFF_JOBS_CHIRHO ||
		handoffChirho.counts_chirho.admitted_chirho !== rowsChirho.length ||
		handoffChirho.batch_folder_chirho !== RUN_HOME_CHIRHO ||
		handoffChirho.snapshots_chirho.plan_chirho.sha256_chirho !== MAIN_PLAN_SHA_CHIRHO ||
		handoffChirho.recipe_chirho.recipe_id_chirho !== 'chatterbox-v3-modern-greek-verse-v1-chirho' ||
		handoffChirho.recipe_chirho.language_chirho !== 'el' ||
		handoffChirho.recipe_chirho.pronunciation_chirho !== 'modern_greek' ||
		handoffChirho.screen_chirho.limit_chirho !== 0.35 ||
		handoffChirho.screen_chirho.model_chirho !== 'openai-whisper large-v3-turbo' ||
		asrChirho.model_chirho !== handoffChirho.screen_chirho.model_chirho ||
		!equalChirho(handoffChirho.model_chirho, planChirho.model_chirho)
	)
		throw Error('Finite handoff scope/model/recipe/screen differs');
	const eventsChirho = new Map<string, JournalChirho>();
	for (const eventChirho of journalChirho) {
		const taskChirho = String(eventChirho.task_uuid_chirho);
		const entriesChirho = eventsChirho.get(taskChirho) ?? [];
		entriesChirho.push(eventChirho);
		eventsChirho.set(taskChirho, entriesChirho);
	}
	const tasksChirho = new Set<string>(),
		versesChirho = new Set<string>();
	let priorIndexChirho = -1;
	return rowsChirho.map((rowChirho) => {
		const plannedChirho = planChirho.jobs_chirho[rowChirho.plan_index_chirho];
		if (
			!plannedChirho ||
			!Number.isSafeInteger(rowChirho.plan_index_chirho) ||
			rowChirho.plan_index_chirho <= priorIndexChirho ||
			rowChirho.job_chirho !== `v${String(rowChirho.plan_index_chirho + 1).padStart(4, '0')}` ||
			plannedChirho.job_chirho !== rowChirho.job_chirho ||
			plannedChirho.verse_id_chirho !== rowChirho.verse_id_chirho ||
			excludedChirho.has(rowChirho.verse_id_chirho) ||
			versesChirho.has(rowChirho.verse_id_chirho) ||
			tasksChirho.has(rowChirho.task_uuid_chirho) ||
			!/^[a-f0-9]{8}(-[a-f0-9]{4}){3}-[a-f0-9]{12}$/.test(rowChirho.task_uuid_chirho)
		)
			throw Error('Handoff order, exclusion or unique plan identity differs');
		priorIndexChirho = rowChirho.plan_index_chirho;
		tasksChirho.add(rowChirho.task_uuid_chirho);
		versesChirho.add(rowChirho.verse_id_chirho);
		const pairChirho = eventsChirho.get(rowChirho.task_uuid_chirho) ?? [];
		const requestChirho = pairChirho.find((eventChirho) => eventChirho.event_chirho === 'request');
		const resultChirho = pairChirho.find((eventChirho) => eventChirho.event_chirho === 'result');
		const screenChirho = asrChirho.takes_chirho[rowChirho.task_uuid_chirho];
		if (!requestChirho || !resultChirho || pairChirho.length !== 2 || !screenChirho)
			throw Error('Handoff lacks one received pair and separate screen');
		const stemChirho = `${rowChirho.job_chirho}-${plannedChirho.file_stem_chirho}-${rowChirho.task_uuid_chirho.slice(0, 8)}-chirho`;
		const expectedChirho: HandoffRowChirho = {
			plan_index_chirho: rowChirho.plan_index_chirho,
			job_chirho: plannedChirho.job_chirho,
			verse_id_chirho: plannedChirho.verse_id_chirho,
			reference_chirho: plannedChirho.reference_chirho,
			clip_id_if_installed_chirho: `local-greek-${plannedChirho.job_chirho}-chirho`,
			kind_chirho: 'first',
			requested_at_chirho: String(requestChirho.at_chirho),
			result_at_chirho: String(resultChirho.at_chirho),
			take_path_chirho: String(resultChirho.path_chirho),
			take_sha256_chirho: String(resultChirho.sha256_chirho),
			take_bytes_chirho: Number(resultChirho.bytes_chirho),
			seconds_chirho: Number(resultChirho.seconds_chirho),
			decoded_mp3_seconds_chirho: rowChirho.decoded_mp3_seconds_chirho,
			decoded_flac_seconds_chirho: rowChirho.decoded_flac_seconds_chirho,
			raw_path_chirho: String(resultChirho.raw_path_chirho),
			raw_sha256_chirho: String(resultChirho.raw_sha256_chirho),
			seed_chirho: 1,
			sample_rate_chirho: 24000,
			task_uuid_chirho: rowChirho.task_uuid_chirho,
			cer_chirho: screenChirho.cer_chirho,
			heard_chirho: screenChirho.heard_chirho,
			second_opinion_chirho: Boolean(screenChirho.second_opinion_chirho),
			content_path_chirho: plannedChirho.content_path_chirho,
			content_sha256_chirho: plannedChirho.content_sha256_chirho,
			canonical_sha256_chirho: plannedChirho.canonical_sha256_chirho,
			sent_sha256_chirho: plannedChirho.sent_sha256_chirho,
			planned_audio_sha256_chirho: plannedChirho.audio_sha256_chirho,
			rough_breathing_words_chirho: plannedChirho.rough_breathing_words_chirho
		};
		if (
			!equalChirho(rowChirho, expectedChirho) ||
			rowChirho.take_path_chirho !== `takes-chirho/${stemChirho}.mp3` ||
			rowChirho.raw_path_chirho !== `raw-chirho/${stemChirho}.flac` ||
			![rowChirho.decoded_mp3_seconds_chirho, rowChirho.decoded_flac_seconds_chirho].every(
				(secondsChirho) =>
					Number.isFinite(secondsChirho) &&
					Math.abs(secondsChirho - rowChirho.seconds_chirho) <= 0.1
			)
		)
			throw Error('Handoff row differs from independently bound evidence');
		// A different attempt for the same job is uncertainty, even when its task id is not the chosen one.
		const jobEventsChirho = journalChirho.filter(
			(eventChirho) => eventChirho.job_chirho === plannedChirho.job_chirho
		);
		if (jobEventsChirho.length !== 2)
			throw Error('A job with another or unknown attempt stays held');
		const chosenChirho = {
			...resultChirho,
			asr_chirho: screenChirho
		} as unknown as ReceivedJobChirho['chosen_chirho'];
		const jobChirho: ReceivedJobChirho = {
			...plannedChirho,
			state_chirho: 'done',
			chosen_chirho: chosenChirho,
			attempts_chirho: [
				{
					task_uuid_chirho: rowChirho.task_uuid_chirho,
					kind_chirho: 'first',
					outcome_chirho: 'result'
				}
			]
		};
		validatePhaseJobChirho(
			jobChirho,
			{
				job_chirho: jobChirho.job_chirho,
				verse_id_chirho: jobChirho.verse_id_chirho,
				kind_chirho: 'first_take',
				take_sha256_chirho: rowChirho.take_sha256_chirho,
				raw_sha256_chirho: rowChirho.raw_sha256_chirho,
				cer_chirho: rowChirho.cer_chirho
			},
			{ ...plannedChirho, state_chirho: 'pending', chosen_chirho: null },
			plannedChirho,
			pairChirho
		);
		return jobChirho;
	});
}

function relativeHomeChirho(pathChirho: string, prefixChirho: string): void {
	if (
		!pathChirho.startsWith(prefixChirho) ||
		!pathChirho
			.split('/')
			.every((partChirho) => /^[a-zA-Z0-9_-]+(?:\.[a-zA-Z0-9_-]+)?$/.test(partChirho))
	)
		throw Error('Uncontained finite handoff/output path');
}

/** Verify both arrays and the manifest chain before any archive or catalogue write. */
export async function preflightHandoffCatalogueChirho(
	rootChirho: string,
	inputChirho: ImportInputChirho
): Promise<void> {
	const indexChirho = JSON.parse(
		(
			await boundedReadChirho(rootChirho, 'static/audio-chirho/manifest-chirho.json', 4 * 1024 ** 2)
		).toString()
	) as {
		books_chirho: Record<
			string,
			{ chapters_chirho: { path_chirho: string; sha256_chirho: string }[] }
		>;
	};
	const chaptersChirho = new Map<
		string,
		{ clips_chirho: Record<string, unknown>[]; readings_chirho?: Record<string, unknown>[] }
	>();
	for (const jobChirho of inputChirho.manifest_chirho.jobs_chirho) {
		const pathChirho = `/audio-chirho/${jobChirho.content_path_chirho}`;
		let chapterChirho = chaptersChirho.get(pathChirho);
		if (!chapterChirho) {
			const rawChirho = await boundedReadChirho(rootChirho, `static${pathChirho}`, 2_000_000);
			const entryChirho = indexChirho.books_chirho[
				jobChirho.verse_id_chirho.split('.')[0]
			]?.chapters_chirho.filter((rowChirho) => rowChirho.path_chirho === pathChirho);
			if (entryChirho?.length !== 1 || entryChirho[0].sha256_chirho !== sha256Chirho(rawChirho))
				throw Error('Existing audio hash chain differs');
			chapterChirho = JSON.parse(rawChirho.toString());
			chaptersChirho.set(pathChirho, chapterChirho!);
		}
		const readingsChirho = [
			...chapterChirho!.clips_chirho,
			...(chapterChirho!.readings_chirho ?? [])
		].filter(
			(rowChirho) =>
				rowChirho.lesson_id_chirho === jobChirho.verse_id_chirho &&
				rowChirho.token_id_chirho === null
		);
		if (!readingsChirho.length) continue;
		if (
			readingsChirho.length !== 1 ||
			readingsChirho[0].id_chirho !== `local-greek-${jobChirho.job_chirho}-chirho`
		)
			throw Error('A whole-verse reading appeared; reconcile before archive');
		const rawPreparedChirho = await boundedReadChirho(
			rootChirho,
			`${inputChirho.prepared_home_chirho}/prepared-chirho.json`,
			2 * 1024 ** 2
		);
		const preparedChirho = JSON.parse(rawPreparedChirho.toString()) as {
			recordings_chirho: DeliveryChirho[];
		};
		const deliveryChirho = preparedChirho.recordings_chirho.filter(
			(rowChirho) => rowChirho.job_chirho === jobChirho.job_chirho
		);
		const contentChirho = await boundedReadChirho(
			rootChirho,
			`static/content-chirho/${jobChirho.content_path_chirho}`,
			4 * 1024 ** 2
		);
		const lessonChirho = (
			JSON.parse(contentChirho.toString()).verses_chirho as Parameters<
				typeof chapterRecipeChirho
			>[0][]
		).find((rowChirho) => rowChirho.id_chirho === jobChirho.verse_id_chirho);
		if (
			deliveryChirho.length !== 1 ||
			!lessonChirho ||
			!equalChirho(
				readingsChirho[0],
				inputChirho.clip_chirho(
					jobChirho,
					deliveryChirho[0],
					lessonChirho,
					sha256Chirho(contentChirho)
				)
			)
		)
			throw Error('Existing handoff recording differs from its exact delivery');
	}
}

export async function handoffInputChirho(
	rootChirho: string,
	optionsChirho: HandoffOptionsChirho,
	catalogueChirho = true
): Promise<HandoffInputChirho> {
	relativeHomeChirho(optionsChirho.handoff_path_chirho, `${RUN_HOME_CHIRHO}/handoffs-chirho/`);
	relativeHomeChirho(optionsChirho.prepared_home_chirho, 'build-chirho/');
	if (!/^[a-f0-9]{64}$/.test(optionsChirho.handoff_sha256_chirho))
		throw Error('Expected explicit immutable handoff SHA');
	const handoffBytesChirho = await boundedReadChirho(
		rootChirho,
		optionsChirho.handoff_path_chirho,
		2 * 1024 ** 2
	);
	if (sha256Chirho(handoffBytesChirho) !== optionsChirho.handoff_sha256_chirho)
		throw Error('Immutable handoff SHA differs');
	const handoffChirho = JSON.parse(handoffBytesChirho.toString()) as FiniteHandoffChirho;
	const directoryChirho = dirnameChirho(optionsChirho.handoff_path_chirho);
	const archiveChirho: ArchiveInputChirho[] = [
		{
			path_chirho: optionsChirho.handoff_path_chirho,
			sha256_chirho: optionsChirho.handoff_sha256_chirho,
			extension_chirho: 'json'
		}
	];
	const bytesChirho = new Map<string, Buffer>();
	for (const [keyChirho, nameChirho] of [
		['plan_chirho', 'plan-snapshot-chirho.json'],
		['journal_chirho', 'journal-snapshot-chirho.jsonl'],
		['asr_chirho', 'asr-snapshot-chirho.json']
	] as const) {
		const pinChirho = handoffChirho.snapshots_chirho[keyChirho];
		if (pinChirho.path_chirho !== nameChirho || !/^[a-f0-9]{64}$/.test(pinChirho.sha256_chirho))
			throw Error('Snapshot path/digest differs');
		const pathChirho = `${directoryChirho}/${nameChirho}`;
		const rawChirho = await boundedReadChirho(rootChirho, pathChirho, 16 * 1024 ** 2);
		if (
			rawChirho.length !== pinChirho.bytes_chirho ||
			sha256Chirho(rawChirho) !== pinChirho.sha256_chirho
		)
			throw Error('Frozen snapshot identity differs');
		bytesChirho.set(keyChirho, rawChirho);
		archiveChirho.push({
			path_chirho: pathChirho,
			sha256_chirho: pinChirho.sha256_chirho,
			extension_chirho: keyChirho === 'journal_chirho' ? 'jsonl' : 'json'
		});
	}
	const excludedChirho = new Set<string>();
	if (
		!Array.isArray(handoffChirho.earlier_handoffs_chirho) ||
		handoffChirho.earlier_handoffs_chirho.length > 100
	)
		throw Error('Earlier handoff list is unbounded');
	for (const pinChirho of handoffChirho.earlier_handoffs_chirho) {
		relativeHomeChirho(`${RUN_HOME_CHIRHO}/${pinChirho.path_chirho}`, `${RUN_HOME_CHIRHO}/`);
		const pathChirho = `${RUN_HOME_CHIRHO}/${pinChirho.path_chirho}`;
		const rawChirho = await boundedReadChirho(rootChirho, pathChirho, 16 * 1024 ** 2);
		if (sha256Chirho(rawChirho) !== pinChirho.sha256_chirho)
			throw Error('Earlier handoff identity differs');
		const earlierChirho = JSON.parse(rawChirho.toString()) as {
			jobs_chirho?: LocalGreekJobChirho[];
			ready_jobs_chirho?: { verse_id_chirho: string }[];
		};
		const rowsChirho =
			earlierChirho.ready_jobs_chirho ??
			earlierChirho.jobs_chirho?.filter((jobChirho) => jobChirho.state_chirho === 'done');
		if (!rowsChirho || rowsChirho.length !== pinChirho.rows_chirho)
			throw Error('Earlier handoff partition differs');
		rowsChirho.forEach((rowChirho) => excludedChirho.add(rowChirho.verse_id_chirho));
		archiveChirho.push({
			path_chirho: pathChirho,
			sha256_chirho: pinChirho.sha256_chirho,
			extension_chirho: 'json'
		});
	}
	if (
		!Array.isArray(handoffChirho.skipped_inside_admitted_range_chirho) ||
		handoffChirho.skipped_inside_admitted_range_chirho.length > 7633
	)
		throw Error('Invalid recorded within-range screen exclusions');
	const planChirho = JSON.parse(bytesChirho.get('plan_chirho')!.toString()) as {
		model_chirho: unknown;
		jobs_chirho: HandoffPlanJobChirho[];
	};
	const journalChirho = bytesChirho
		.get('journal_chirho')!
		.toString()
		.split('\n')
		.filter(Boolean)
		.map((lineChirho) => JSON.parse(lineChirho)) as JournalChirho;
	const asrChirho = JSON.parse(bytesChirho.get('asr_chirho')!.toString()) as HandoffAsrChirho;
	const jobsChirho = reconstructHandoffJobsChirho(
		handoffChirho,
		planChirho,
		journalChirho,
		asrChirho,
		excludedChirho
	);
	const manifestChirho = {
		plan_sha256_chirho: MAIN_PLAN_SHA_CHIRHO,
		journal_sha256_chirho: handoffChirho.snapshots_chirho.journal_chirho.sha256_chirho,
		source_handoff_sha256_chirho: optionsChirho.handoff_sha256_chirho,
		source_asr_sha256_chirho: handoffChirho.snapshots_chirho.asr_chirho.sha256_chirho,
		model_chirho: planChirho.model_chirho,
		jobs_chirho: jobsChirho
	} satisfies LocalGreekManifestChirho & Record<string, unknown>;
	const manifestBytesChirho = Buffer.from(JSON.stringify(manifestChirho, null, 2) + '\n');
	const selectedChirho = new Map(
		jobsChirho.map((jobChirho) => [jobChirho.job_chirho, structuredClone(jobChirho)])
	);
	const clipChirho: ImportInputChirho['clip_chirho'] = (
		jobChirho,
		deliveryChirho,
		lessonChirho,
		contentShaChirho
	) => {
		if (!equalChirho(selectedChirho.get(jobChirho.job_chirho), jobChirho))
			throw Error('Job is outside immutable finite handoff');
		return {
			...localGreekClipForInputChirho(
				jobChirho,
				deliveryChirho,
				lessonChirho,
				contentShaChirho,
				optionsChirho.prepared_home_chirho,
				1
			),
			generation_seed_chirho: 1,
			source_phase_sha256_chirho: optionsChirho.handoff_sha256_chirho,
			source_asr_sha256_chirho: handoffChirho.snapshots_chirho.asr_chirho.sha256_chirho
		};
	};
	const inputChirho: HandoffInputChirho = {
		manifest_chirho: manifestChirho,
		manifest_sha256_chirho: sha256Chirho(manifestBytesChirho),
		manifest_bytes_chirho: manifestBytesChirho,
		handoff_sha256_chirho: optionsChirho.handoff_sha256_chirho,
		prepared_home_chirho: optionsChirho.prepared_home_chirho,
		run_home_chirho: RUN_HOME_CHIRHO,
		expected_jobs_chirho: jobsChirho.length,
		flagged_excluded_chirho: handoffChirho.skipped_inside_admitted_range_chirho.length,
		archive_inputs_chirho: [
			...archiveChirho,
			{
				path_chirho: `${optionsChirho.prepared_home_chirho}/source-chirho/manifest-chirho.json`,
				sha256_chirho: sha256Chirho(manifestBytesChirho),
				extension_chirho: 'json',
				bytes_chirho: manifestBytesChirho
			}
		],
		clip_chirho: clipChirho
	};
	const contentsChirho = new Map<
		string,
		{ bytes_chirho: Buffer; verses_chirho: Parameters<typeof chapterRecipeChirho>[0][] }
	>();
	for (const jobChirho of jobsChirho) {
		let contentChirho = contentsChirho.get(jobChirho.content_path_chirho);
		if (!contentChirho) {
			const rawChirho = await boundedReadChirho(
				rootChirho,
				`static/content-chirho/${jobChirho.content_path_chirho}`,
				4 * 1024 ** 2
			);
			contentChirho = {
				bytes_chirho: rawChirho,
				verses_chirho: JSON.parse(rawChirho.toString()).verses_chirho
			};
			contentsChirho.set(jobChirho.content_path_chirho, contentChirho);
		}
		const lessonChirho = contentChirho.verses_chirho.find(
			(rowChirho) => rowChirho.id_chirho === jobChirho.verse_id_chirho
		);
		const plannedChirho = planChirho.jobs_chirho.find(
			(rowChirho) => rowChirho.job_chirho === jobChirho.job_chirho
		)!;
		if (
			!lessonChirho ||
			!equalChirho(
				lessonChirho.tokens_chirho.map((tokenChirho) => tokenChirho.id_chirho),
				plannedChirho.token_ids_chirho
			)
		)
			throw Error('Current token ids differ');
		clipChirho(
			jobChirho,
			{
				job_chirho: jobChirho.job_chirho,
				verse_id_chirho: jobChirho.verse_id_chirho,
				path_chirho: `${optionsChirho.prepared_home_chirho}/delivery-chirho/${jobChirho.job_chirho}-chirho.mp3`,
				sha256_chirho: jobChirho.chosen_chirho.sha256_chirho,
				bytes_chirho: jobChirho.chosen_chirho.bytes_chirho,
				duration_chirho: jobChirho.chosen_chirho.seconds_chirho,
				original_mp3_sha256_chirho: jobChirho.chosen_chirho.sha256_chirho,
				raw_flac_sha256_chirho: jobChirho.chosen_chirho.raw_sha256_chirho
			},
			lessonChirho,
			sha256Chirho(contentChirho.bytes_chirho)
		);
		for (const [pathChirho, digestChirho] of [
			[jobChirho.chosen_chirho.path_chirho, jobChirho.chosen_chirho.sha256_chirho],
			[jobChirho.chosen_chirho.raw_path_chirho, jobChirho.chosen_chirho.raw_sha256_chirho]
		]) {
			const rawChirho = await boundedReadChirho(
				rootChirho,
				`${RUN_HOME_CHIRHO}/${pathChirho}`,
				16 * 1024 ** 2
			);
			if (
				sha256Chirho(rawChirho) !== digestChirho ||
				(pathChirho === jobChirho.chosen_chirho.path_chirho &&
					rawChirho.length !== jobChirho.chosen_chirho.bytes_chirho)
			)
				throw Error('Original take bytes differ');
		}
	}
	if (catalogueChirho) await preflightHandoffCatalogueChirho(rootChirho, inputChirho);
	return inputChirho;
}

export function handoffArgumentsChirho(argumentsChirho: string[]) {
	const valuesChirho = new Map<string, string>();
	let applyChirho = false;
	for (let indexChirho = 0; indexChirho < argumentsChirho.length; indexChirho++) {
		const keyChirho = argumentsChirho[indexChirho];
		if (['--apply-chirho', '--describe-chirho', '--describe-parts-chirho'].includes(keyChirho)) {
			if (keyChirho === '--apply-chirho') applyChirho = true;
			continue;
		}
		if (
			![
				'--root-chirho',
				'--handoff-chirho',
				'--handoff-sha256-chirho',
				'--prepared-home-chirho'
			].includes(keyChirho) ||
			valuesChirho.has(keyChirho) ||
			!argumentsChirho[indexChirho + 1]
		)
			throw Error('Unknown, repeated or missing finite handoff argument');
		valuesChirho.set(keyChirho, argumentsChirho[++indexChirho]);
	}
	const optionsChirho: HandoffOptionsChirho = {
		handoff_path_chirho: valuesChirho.get('--handoff-chirho') ?? '',
		handoff_sha256_chirho: valuesChirho.get('--handoff-sha256-chirho') ?? '',
		prepared_home_chirho: valuesChirho.get('--prepared-home-chirho') ?? ''
	};
	return {
		root_chirho: valuesChirho.get('--root-chirho') ?? '.',
		options_chirho: optionsChirho,
		apply_chirho: applyChirho
	};
}
if (import.meta.main) {
	if (!process.argv.includes('--describe-chirho')) throw Error('Expected --describe-chirho');
	const argumentsChirho = handoffArgumentsChirho(process.argv.slice(2));
	const inputChirho = await handoffInputChirho(
		await realpathChirho(argumentsChirho.root_chirho),
		argumentsChirho.options_chirho
	);
	console.log(
		JSON.stringify({
			manifest_sha256_chirho: inputChirho.manifest_sha256_chirho,
			prepared_home_chirho: inputChirho.prepared_home_chirho,
			run_home_chirho: inputChirho.run_home_chirho,
			manifest_json_chirho: inputChirho.manifest_bytes_chirho.toString(),
			archive_inputs_chirho: inputChirho.archive_inputs_chirho.map((rowChirho) => ({
				path_chirho: rowChirho.path_chirho,
				sha256_chirho: rowChirho.sha256_chirho,
				extension_chirho: rowChirho.extension_chirho
			})),
			jobs_chirho: inputChirho.manifest_chirho.jobs_chirho
		})
	);
}
