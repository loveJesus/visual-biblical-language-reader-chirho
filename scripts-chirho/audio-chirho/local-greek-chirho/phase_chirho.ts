// For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life. — John 3:16 (KJV)
// Workflow: README-chirho.md. Exact immutable producer phases, never the growing live manifest.
import {
	readFile as readFileChirho,
	lstat as lstatChirho,
	realpath as realpathChirho
} from 'node:fs/promises';
import { join as joinChirho } from 'node:path';
import { createHash as createHashChirho } from 'node:crypto';
import { isDeepStrictEqual as equalChirho } from 'node:util';
import { sha256Chirho } from '../audition_chirho';
import {
	PREPARED_HOME_CHIRHO,
	RUN_HOME_CHIRHO,
	MANIFEST_SHA_CHIRHO,
	localGreekClipChirho,
	localGreekClipForInputChirho,
	type LocalGreekManifestChirho,
	type LocalGreekJobChirho
} from './manifest_chirho';

export const PHASE_HOME_CHIRHO = 'build-chirho/local-greek-install-2026-11-08-retakes-chirho';
export const PHASE_MANIFEST_SHA_CHIRHO =
	'248ebbfdbc6ea52ca899a59067f0ccdd482a8f78614493711a5e93a15a237348';
export const HANDOFF_SHA_CHIRHO =
	'919cf4afe06b4e094b9fbc6c2f67c0105933b5027d5ba64672bcd8f8acb1db55';
const PLAN_SHA_CHIRHO = '463074392aa874ca484ad8c45f9729ca262e3469297f4604b8c82d2beca78631';
const JOURNAL_SHA_CHIRHO = '17cf5e5c3969870d672afa9347be742435d0f6b7b22b23007eca0d680f609639';
export interface ArchiveInputChirho {
	path_chirho: string;
	sha256_chirho: string;
	extension_chirho: 'json' | 'jsonl';
	bytes_chirho?: Buffer;
}
export interface ImportInputChirho {
	manifest_chirho: LocalGreekManifestChirho;
	manifest_sha256_chirho: string;
	prepared_home_chirho: string;
	run_home_chirho?: string;
	expected_jobs_chirho: number;
	flagged_excluded_chirho: number;
	archive_inputs_chirho: ArchiveInputChirho[];
	clip_chirho: typeof localGreekClipChirho;
}
export interface HandoffJobChirho {
	job_chirho: string;
	verse_id_chirho: string;
	kind_chirho: 'retake_seed_2' | 'first_take';
	take_sha256_chirho: string;
	raw_sha256_chirho: string;
	cer_chirho: number;
}
type ProducerJobChirho = LocalGreekJobChirho & {
	attempts_chirho: { task_uuid_chirho: string; kind_chirho: string; outcome_chirho: string }[];
	chosen_chirho: NonNullable<LocalGreekJobChirho['chosen_chirho']> & { task_uuid_chirho: string };
};
type JournalRowChirho = Record<string, unknown>;

export async function boundedReadChirho(
	rootChirho: string,
	pathChirho: string,
	limitChirho: number
) {
	if (
		pathChirho.startsWith('/') ||
		pathChirho.split('/').some((partChirho) => ['..', '.'].includes(partChirho))
	)
		throw Error('Unowned audio path');
	const fullChirho = joinChirho(rootChirho, pathChirho);
	const infoChirho = await lstatChirho(fullChirho);
	if (
		!infoChirho.isFile() ||
		infoChirho.isSymbolicLink() ||
		infoChirho.size > limitChirho ||
		(await realpathChirho(fullChirho)) !== fullChirho
	)
		throw Error('Redirected or oversized audio input');
	const bytesChirho = await readFileChirho(fullChirho);
	if (bytesChirho.length > limitChirho) throw Error('Audio input grew beyond bound');
	return bytesChirho;
}

/** The old completed import names an immutable prefix, not the live append-only file's tail. */
export function journalPrefixChirho(bytesChirho: Buffer, expectedShaChirho: string): Buffer {
	const digestChirho = createHashChirho('sha256');
	let offsetChirho = 0;
	while (offsetChirho < bytesChirho.length) {
		const newlineChirho = bytesChirho.indexOf(10, offsetChirho);
		const endChirho = newlineChirho < 0 ? bytesChirho.length : newlineChirho + 1;
		digestChirho.update(bytesChirho.subarray(offsetChirho, endChirho));
		if (digestChirho.copy().digest('hex') === expectedShaChirho)
			return bytesChirho.subarray(0, endChirho);
		offsetChirho = endChirho;
	}
	throw Error('Exact original journal prefix is unavailable; do not replace its evidence');
}

export async function legacyInputChirho(rootChirho: string): Promise<ImportInputChirho> {
	const manifestPathChirho = `${PREPARED_HOME_CHIRHO}/source-chirho/manifest-chirho.json`;
	const manifestBytesChirho = await boundedReadChirho(
		rootChirho,
		manifestPathChirho,
		32 * 1024 ** 2
	);
	if (sha256Chirho(manifestBytesChirho) !== MANIFEST_SHA_CHIRHO)
		throw Error('Frozen night-one manifest differs');
	const manifestChirho = JSON.parse(manifestBytesChirho.toString()) as LocalGreekManifestChirho;
	const planPathChirho = `${PREPARED_HOME_CHIRHO}/source-chirho/plan-chirho.json`;
	const planBytesChirho = await boundedReadChirho(rootChirho, planPathChirho, 32 * 1024 ** 2);
	if (sha256Chirho(planBytesChirho) !== manifestChirho.plan_sha256_chirho)
		throw Error('Original local Greek plan differs');
	const journalPathChirho = `${PREPARED_HOME_CHIRHO}/source-chirho/journal-chirho.jsonl`;
	const journalBytesChirho = await boundedReadChirho(rootChirho, journalPathChirho, 32 * 1024 ** 2);
	const prefixChirho = journalPrefixChirho(
		journalBytesChirho,
		manifestChirho.journal_sha256_chirho
	);
	if (prefixChirho.length !== journalBytesChirho.length)
		throw Error('Frozen night-one journal has an unrelated tail');
	return {
		manifest_chirho: manifestChirho,
		manifest_sha256_chirho: MANIFEST_SHA_CHIRHO,
		prepared_home_chirho: PREPARED_HOME_CHIRHO,
		expected_jobs_chirho: 1084,
		flagged_excluded_chirho: manifestChirho.jobs_chirho.filter(
			(rowChirho) => rowChirho.state_chirho === 'flagged'
		).length,
		archive_inputs_chirho: [
			{
				path_chirho: manifestPathChirho,
				sha256_chirho: MANIFEST_SHA_CHIRHO,
				extension_chirho: 'json'
			},
			{
				path_chirho: planPathChirho,
				sha256_chirho: manifestChirho.plan_sha256_chirho,
				extension_chirho: 'json'
			},
			{
				path_chirho: journalPathChirho,
				sha256_chirho: manifestChirho.journal_sha256_chirho,
				extension_chirho: 'jsonl',
				bytes_chirho: prefixChirho
			}
		],
		clip_chirho: localGreekClipChirho
	};
}

/** A seed-2 take enters only through this source/received-result bound handoff; the v1 wrapper
 * remains seed-1-only and no shared recipe/rendition rule changes. */
export function validatePhaseJobChirho(
	jobChirho: ProducerJobChirho,
	handoffChirho: HandoffJobChirho,
	oldChirho: LocalGreekJobChirho,
	planChirho: LocalGreekJobChirho,
	journalChirho: JournalRowChirho[]
): 1 | 2 {
	const seedChirho = handoffChirho.kind_chirho === 'retake_seed_2' ? 2 : 1;
	const takeChirho = jobChirho.chosen_chirho;
	if (
		!['retake_seed_2', 'first_take'].includes(handoffChirho.kind_chirho) ||
		jobChirho.job_chirho !== handoffChirho.job_chirho ||
		jobChirho.verse_id_chirho !== handoffChirho.verse_id_chirho ||
		oldChirho.job_chirho !== jobChirho.job_chirho ||
		oldChirho.verse_id_chirho !== jobChirho.verse_id_chirho ||
		oldChirho.state_chirho === 'done' ||
		jobChirho.state_chirho !== 'done' ||
		!takeChirho ||
		takeChirho.seed_chirho !== seedChirho ||
		takeChirho.flag_chirho !== null ||
		takeChirho.sha256_chirho !== handoffChirho.take_sha256_chirho ||
		takeChirho.raw_sha256_chirho !== handoffChirho.raw_sha256_chirho ||
		takeChirho.asr_chirho?.sha256_chirho !== takeChirho.sha256_chirho ||
		takeChirho.asr_chirho.job_chirho !== jobChirho.job_chirho ||
		takeChirho.asr_chirho.cer_chirho !== handoffChirho.cer_chirho ||
		!Number.isFinite(handoffChirho.cer_chirho) ||
		handoffChirho.cer_chirho < 0 ||
		handoffChirho.cer_chirho > 0.35 ||
		(seedChirho === 2 &&
			(oldChirho.state_chirho !== 'flagged' || oldChirho.chosen_chirho?.seed_chirho !== 1)) ||
		(seedChirho === 1 && (oldChirho.state_chirho !== 'pending' || oldChirho.chosen_chirho !== null))
	)
		throw Error('Phase accepts only the exact newly screened received handoff take');
	for (const fieldChirho of [
		'job_chirho',
		'verse_id_chirho',
		'content_path_chirho',
		'content_sha256_chirho',
		'canonical_text_chirho',
		'canonical_sha256_chirho',
		'spoken_text_chirho',
		'sent_chirho',
		'sent_sha256_chirho'
	] as const)
		if (
			jobChirho[fieldChirho] !== planChirho[fieldChirho] ||
			jobChirho[fieldChirho] !== oldChirho[fieldChirho]
		)
			throw Error('Phase changed the original source/voice input plan');
	if (
		!jobChirho.attempts_chirho?.length ||
		jobChirho.attempts_chirho.some((attemptChirho) => attemptChirho.outcome_chirho !== 'result') ||
		jobChirho.attempts_chirho.filter(
			(attemptChirho) =>
				attemptChirho.task_uuid_chirho === takeChirho.task_uuid_chirho &&
				attemptChirho.kind_chirho === (seedChirho === 2 ? 'retake' : 'first')
		).length !== 1
	)
		throw Error('Unknown or mismatched local generation attempt stays held');
	const eventsChirho = journalChirho.filter(
		(rowChirho) => rowChirho.task_uuid_chirho === takeChirho.task_uuid_chirho
	);
	const requestChirho = eventsChirho.find((rowChirho) => rowChirho.event_chirho === 'request');
	const resultChirho = eventsChirho.find((rowChirho) => rowChirho.event_chirho === 'result');
	if (
		eventsChirho.length !== 2 ||
		!requestChirho ||
		!resultChirho ||
		requestChirho.job_chirho !== jobChirho.job_chirho ||
		requestChirho.sent_chirho !== jobChirho.sent_chirho ||
		requestChirho.kind_chirho !== (seedChirho === 2 ? 'retake' : 'first') ||
		resultChirho.job_chirho !== jobChirho.job_chirho ||
		resultChirho.cost_chirho !== 0 ||
		resultChirho.sent_sha256_chirho !== jobChirho.sent_sha256_chirho ||
		[
			'path_chirho',
			'sha256_chirho',
			'bytes_chirho',
			'seconds_chirho',
			'flag_chirho',
			'raw_path_chirho',
			'raw_sha256_chirho',
			'seed_chirho',
			'sample_rate_chirho'
		].some(
			(fieldChirho) =>
				resultChirho[fieldChirho] !==
				(takeChirho as unknown as Record<string, unknown>)[fieldChirho]
		)
	)
		throw Error('The handed-off take lacks its exact complete local request/result pair');
	return seedChirho;
}

export async function phaseInputChirho(rootChirho: string): Promise<ImportInputChirho> {
	const inputsChirho = [
		['manifest-chirho.json', PHASE_MANIFEST_SHA_CHIRHO, 'json'],
		['handoff-chirho.json', HANDOFF_SHA_CHIRHO, 'json'],
		['plan-chirho.json', PLAN_SHA_CHIRHO, 'json'],
		['journal-chirho.jsonl', JOURNAL_SHA_CHIRHO, 'jsonl']
	] as const;
	const bytesChirho = new Map<string, Buffer>();
	for (const [nameChirho, expectedChirho] of inputsChirho) {
		const valueChirho = await boundedReadChirho(
			rootChirho,
			`${PHASE_HOME_CHIRHO}/source-chirho/${nameChirho}`,
			32 * 1024 ** 2
		);
		if (sha256Chirho(valueChirho) !== expectedChirho)
			throw Error('Immutable phase source differs: ' + nameChirho);
		bytesChirho.set(nameChirho, valueChirho);
	}
	const manifestChirho = JSON.parse(
		bytesChirho.get('manifest-chirho.json')!.toString()
	) as LocalGreekManifestChirho & { model_chirho: unknown };
	const handoffChirho = JSON.parse(bytesChirho.get('handoff-chirho.json')!.toString()) as {
		manifest_sha256_chirho: string;
		night_1_manifest_sha256_chirho: string;
		ready_jobs_chirho: HandoffJobChirho[];
	};
	const planChirho = JSON.parse(bytesChirho.get('plan-chirho.json')!.toString()) as {
		jobs_chirho: LocalGreekJobChirho[];
		model_chirho: unknown;
	};
	const oldInputChirho = await legacyInputChirho(rootChirho);
	if (
		handoffChirho.manifest_sha256_chirho !== PHASE_MANIFEST_SHA_CHIRHO ||
		handoffChirho.night_1_manifest_sha256_chirho !== MANIFEST_SHA_CHIRHO ||
		manifestChirho.plan_sha256_chirho !== PLAN_SHA_CHIRHO ||
		manifestChirho.journal_sha256_chirho !== JOURNAL_SHA_CHIRHO ||
		handoffChirho.ready_jobs_chirho.length !== 24 ||
		new Set(handoffChirho.ready_jobs_chirho.map((rowChirho) => rowChirho.job_chirho)).size !== 24 ||
		handoffChirho.ready_jobs_chirho.filter((rowChirho) => rowChirho.kind_chirho === 'retake_seed_2')
			.length !== 21 ||
		!equalChirho(manifestChirho.model_chirho, planChirho.model_chirho) ||
		!equalChirho(
			manifestChirho.model_chirho,
			(oldInputChirho.manifest_chirho as unknown as { model_chirho: unknown }).model_chirho
		)
	)
		throw Error('Fixed local Greek handoff/model partition differs');
	const jobsChirho = new Map(
		manifestChirho.jobs_chirho.map((rowChirho) => [rowChirho.job_chirho, rowChirho])
	);
	const oldJobsChirho = new Map(
		oldInputChirho.manifest_chirho.jobs_chirho.map((rowChirho) => [rowChirho.job_chirho, rowChirho])
	);
	const plansChirho = new Map(
		planChirho.jobs_chirho.map((rowChirho) => [rowChirho.job_chirho, rowChirho])
	);
	const previousDoneChirho = oldInputChirho.manifest_chirho.jobs_chirho.filter(
		(rowChirho) => rowChirho.state_chirho === 'done'
	);
	if (
		previousDoneChirho.length !== 1084 ||
		previousDoneChirho.some(
			(rowChirho) =>
				jobsChirho.get(rowChirho.job_chirho)?.state_chirho !== 'done' ||
				!equalChirho(jobsChirho.get(rowChirho.job_chirho)?.chosen_chirho, rowChirho.chosen_chirho)
		)
	)
		throw Error('The prior 1084 received takes changed');
	const journalChirho = bytesChirho
		.get('journal-chirho.jsonl')!
		.toString()
		.split('\n')
		.filter(Boolean)
		.map((lineChirho) => JSON.parse(lineChirho) as JournalRowChirho);
	const selectedChirho = handoffChirho.ready_jobs_chirho.map((rowChirho) => {
		const jobChirho = jobsChirho.get(rowChirho.job_chirho) as ProducerJobChirho | undefined;
		const oldChirho = oldJobsChirho.get(rowChirho.job_chirho),
			originalChirho = plansChirho.get(rowChirho.job_chirho);
		if (!jobChirho || !oldChirho || !originalChirho) throw Error('Missing fixed phase source job');
		validatePhaseJobChirho(jobChirho, rowChirho, oldChirho, originalChirho, journalChirho);
		return jobChirho;
	});
	const selectedByIdChirho = new Map(
		selectedChirho.map((rowChirho) => [rowChirho.job_chirho, rowChirho])
	);
	// Check every original before an apply can archive even the metadata objects.
	for (const jobChirho of selectedChirho) {
		const takeChirho = jobChirho.chosen_chirho;
		for (const [pathChirho, expectedShaChirho] of [
			[takeChirho.path_chirho, takeChirho.sha256_chirho],
			[takeChirho.raw_path_chirho, takeChirho.raw_sha256_chirho]
		]) {
			const originalChirho = await boundedReadChirho(
				rootChirho,
				`${RUN_HOME_CHIRHO}/${pathChirho}`,
				16 * 1024 ** 2
			);
			if (
				sha256Chirho(originalChirho) !== expectedShaChirho ||
				(pathChirho === takeChirho.path_chirho && originalChirho.length !== takeChirho.bytes_chirho)
			)
				throw Error('A phase original MP3/FLAC changed before archive preflight');
		}
	}
	return {
		manifest_chirho: { ...manifestChirho, jobs_chirho: selectedChirho },
		manifest_sha256_chirho: PHASE_MANIFEST_SHA_CHIRHO,
		prepared_home_chirho: PHASE_HOME_CHIRHO,
		expected_jobs_chirho: 24,
		flagged_excluded_chirho: 4,
		archive_inputs_chirho: inputsChirho.map(([nameChirho, shaChirho, extensionChirho]) => ({
			path_chirho: `${PHASE_HOME_CHIRHO}/source-chirho/${nameChirho}`,
			sha256_chirho: shaChirho,
			extension_chirho: extensionChirho
		})),
		clip_chirho(jobChirho, deliveryChirho, lessonChirho, contentShaChirho) {
			const selectedValueChirho = selectedByIdChirho.get(jobChirho.job_chirho);
			if (!selectedValueChirho || !equalChirho(selectedValueChirho, jobChirho))
				throw Error('Job is outside the immutable phase');
			const seedChirho = selectedValueChirho.chosen_chirho.seed_chirho;
			if (seedChirho !== 1 && seedChirho !== 2) throw Error('Unapproved local take seed');
			return {
				...localGreekClipForInputChirho(
					jobChirho,
					deliveryChirho,
					lessonChirho,
					contentShaChirho,
					PHASE_HOME_CHIRHO,
					seedChirho
				),
				generation_seed_chirho: seedChirho,
				source_phase_sha256_chirho: HANDOFF_SHA_CHIRHO
			};
		}
	};
}

if (import.meta.main) {
	if (process.argv.slice(2).join(' ') !== '--describe-chirho')
		throw Error('Expected --describe-chirho');
	const inputChirho = await phaseInputChirho(await realpathChirho('.'));
	console.log(
		JSON.stringify({
			manifest_sha256_chirho: inputChirho.manifest_sha256_chirho,
			prepared_home_chirho: inputChirho.prepared_home_chirho,
			jobs_chirho: inputChirho.manifest_chirho.jobs_chirho
		})
	);
}
