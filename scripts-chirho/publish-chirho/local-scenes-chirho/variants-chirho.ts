// For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life. — John 3:16 (KJV)
// Workflow: media-delivery-chirho.md. Saved resumes and explicitly authorized Runware outputs.
import { readdir as readdirChirho } from 'node:fs/promises';
import { join as joinChirho } from 'node:path';
import { digestChirho } from '../r2-chirho/object-store-chirho';
import {
	completeLinesChirho,
	completedJobsChirho,
	loadChapterChirho,
	optionalReadChirho,
	readBoundedChirho,
	recordChirho,
	RUN_CHIRHO,
	type BoundJobChirho,
	type CompletedJobChirho
} from './source-chirho';

/** Reconcile a saved intentional retry of a known 429 refusal; this never requests a retry. */
export function reconcileRefusalsChirho(bytesChirho: Uint8Array, journalChirho: Uint8Array | null) {
	const linesChirho = completeLinesChirho(bytesChirho);
	const rowsChirho = linesChirho.map((lineChirho) => recordChirho(JSON.parse(lineChirho)));
	const omittedChirho = new Set<number>();
	const proofsChirho = new Map<
		string,
		NonNullable<CompletedJobChirho['provider_refusal_chirho']>
	>();
	for (const [indexChirho, rowChirho] of rowsChirho.entries()) {
		if (rowChirho.ok_chirho !== false || rowChirho.provider_chirho !== 'runware') continue;
		const idChirho = String(rowChirho.job_id_chirho);
		const laterChirho = rowsChirho.filter(
			(otherChirho, laterIndexChirho) =>
				laterIndexChirho > indexChirho && otherChirho.job_id_chirho === idChirho
		);
		if (!laterChirho.length) continue;
		const successfulChirho = laterChirho[0];
		const historyChirho = completeLinesChirho(journalChirho ?? new Uint8Array())
			.map((lineChirho) => recordChirho(JSON.parse(lineChirho)))
			.filter((entryChirho) => entryChirho.job_id_chirho === idChirho);
		if (
			laterChirho.length !== 1 ||
			successfulChirho.ok_chirho !== true ||
			rowChirho.error_chirho !== 'serviceOverloaded' ||
			historyChirho.map((entryChirho) => entryChirho.state_chirho).join(',') !==
				'requested,error,requested,received,saved' ||
			historyChirho[1].http_chirho !== 429 ||
			historyChirho[1].code_chirho !== 'serviceOverloaded' ||
			historyChirho[0].task_uuid_chirho === historyChirho[2].task_uuid_chirho ||
			historyChirho[2].task_uuid_chirho !== successfulChirho.task_uuid_chirho ||
			historyChirho[3].cost_usd_chirho !== successfulChirho.cost_usd_chirho ||
			historyChirho[4].output_sha256_chirho !== successfulChirho.output_sha256_chirho ||
			![historyChirho[0], historyChirho[2]].every(
				(entryChirho) =>
					typeof entryChirho.request_sha256_chirho === 'string' &&
					/^[a-f0-9]{64}$/u.test(entryChirho.request_sha256_chirho)
			)
		)
			throw new Error('Repeated Runware result lacks exact known-refusal reconciliation');
		omittedChirho.add(indexChirho);
		proofsChirho.set(idChirho, {
			prior_record_sha256_chirho: digestChirho(linesChirho[indexChirho]),
			journal_sha256_chirho: digestChirho(JSON.stringify(historyChirho))
		});
	}
	return {
		bytes_chirho: Buffer.from(
			linesChirho.filter((_lineChirho, indexChirho) => !omittedChirho.has(indexChirho)).join('\n') +
				'\n'
		),
		proofs_chirho: proofsChirho
	};
}

/** Runware may change only the source container/provider fields of an original validated plan. */
export function runwareJobsChirho(
	bytesChirho: Uint8Array,
	originalChirho: Map<string, BoundJobChirho>,
	chapterChirho: number
) {
	if (chapterChirho < 3 || chapterChirho > 16 || bytesChirho.at(-1) !== 10)
		throw new Error('Runware chapter scope or complete plan differs');
	const linesChirho = completeLinesChirho(bytesChirho);
	if (linesChirho.length !== originalChirho.size) throw new Error('Runware plan coverage differs');
	const jobsChirho = new Map<string, BoundJobChirho>();
	for (const [indexChirho, sourceChirho] of [...originalChirho.values()].entries()) {
		const rowChirho = recordChirho(JSON.parse(linesChirho[indexChirho]));
		const outputChirho = sourceChirho.output_chirho.replace(
			'-schnell-q4-chirho.png',
			'-runware-schnell-chirho.png'
		);
		if (
			rowChirho.provider_chirho !== 'runware' ||
			rowChirho.model_chirho !== 'runware:100@1' ||
			rowChirho.chapter_chirho !== chapterChirho ||
			rowChirho.output_chirho !== outputChirho ||
			rowChirho.steps_chirho !== 4 ||
			rowChirho.width_chirho !== 1024 ||
			rowChirho.height_chirho !== 768 ||
			[
				'job_id_chirho',
				'verse_id_chirho',
				'prompt_chirho',
				'prompt_sha256_chirho',
				'jesus_presence_chirho',
				'seed_chirho'
			].some(
				(fieldChirho) =>
					rowChirho[fieldChirho] !== sourceChirho[fieldChirho as keyof BoundJobChirho]
			)
		)
			throw new Error('Runware job differs from its original plan');
		jobsChirho.set(sourceChirho.job_id_chirho, {
			...sourceChirho,
			provider_chirho: 'runware',
			model_chirho: 'runware:100@1',
			output_chirho: outputChirho,
			job_sha256_chirho: digestChirho(linesChirho[indexChirho])
		});
	}
	return jobsChirho;
}

export async function loadCompletedChapterChirho(rootChirho: string, chapterChirho: number) {
	const originalChirho = await loadChapterChirho(rootChirho, chapterChirho);
	if (!originalChirho) return null;
	const prefixChirho = `chapter-${String(chapterChirho).padStart(2, '0')}`;
	const runChirho = joinChirho(rootChirho, RUN_CHIRHO);
	const namesChirho = await readdirChirho(joinChirho(runChirho, 'records-chirho')).catch(
		(errorChirho: NodeJS.ErrnoException) => {
			if (errorChirho.code === 'ENOENT') return [];
			throw errorChirho;
		}
	);
	if (namesChirho.length > 256) throw new Error('Mark records need cold retirement');
	const resumesChirho = namesChirho
		.filter((nameChirho) =>
			new RegExp(`^${prefixChirho}-resume-(?:[1-9]|1[0-6])-records-chirho\\.jsonl$`, 'u').test(
				nameChirho
			)
		)
		.sort();
	const streamsChirho = [
		{ name_chirho: `${prefixChirho}-records-chirho.jsonl`, jobs_chirho: originalChirho }
	];
	for (const nameChirho of resumesChirho) {
		const planNameChirho = nameChirho.replace('-records-chirho.jsonl', '-jobs-chirho.jsonl');
		const bytesChirho = await readBoundedChirho(
			joinChirho(runChirho, 'jobs-chirho', planNameChirho),
			1024 ** 2
		);
		if (bytesChirho.at(-1) !== 10) throw new Error('Resume plan is incomplete');
		const jobsChirho = new Map<string, BoundJobChirho>();
		for (const lineChirho of completeLinesChirho(bytesChirho)) {
			const rowChirho = recordChirho(JSON.parse(lineChirho));
			const jobChirho = originalChirho.get(String(rowChirho.job_id_chirho));
			if (
				!jobChirho ||
				jobChirho.job_sha256_chirho !== digestChirho(lineChirho) ||
				jobsChirho.has(jobChirho.job_id_chirho)
			)
				throw new Error('Resume plan differs from original job lines');
			jobsChirho.set(jobChirho.job_id_chirho, jobChirho);
		}
		streamsChirho.push({ name_chirho: nameChirho, jobs_chirho: jobsChirho });
	}
	const runwareBytesChirho = await optionalReadChirho(
		joinChirho(runChirho, 'jobs-chirho', `${prefixChirho}-runware-jobs-chirho.jsonl`),
		1024 ** 2
	);
	if (runwareBytesChirho)
		streamsChirho.push({
			name_chirho: `${prefixChirho}-runware-records-chirho.jsonl`,
			jobs_chirho: runwareJobsChirho(runwareBytesChirho, originalChirho, chapterChirho)
		});
	const seenChirho = new Set<string>(),
		completedChirho: CompletedJobChirho[] = [],
		heldChirho: string[] = [];
	for (const streamChirho of streamsChirho) {
		const bytesChirho = await optionalReadChirho(
			joinChirho(runChirho, 'records-chirho', streamChirho.name_chirho),
			4 * 1024 ** 2
		);
		if (!bytesChirho) continue;
		const reconciledChirho = streamChirho.name_chirho.includes('-runware-')
			? reconcileRefusalsChirho(
					bytesChirho,
					await optionalReadChirho(
						joinChirho(runChirho, 'records-chirho/runware-journal-chirho.jsonl'),
						4 * 1024 ** 2
					)
				)
			: {
					bytes_chirho: bytesChirho,
					proofs_chirho: new Map<
						string,
						NonNullable<CompletedJobChirho['provider_refusal_chirho']>
					>()
				};
		const resultChirho = completedJobsChirho(
			reconciledChirho.bytes_chirho,
			streamChirho.jobs_chirho
		);
		for (const itemChirho of resultChirho.completed_chirho) {
			const proofChirho = reconciledChirho.proofs_chirho.get(itemChirho.job_chirho.job_id_chirho);
			if (proofChirho) itemChirho.provider_refusal_chirho = proofChirho;
		}
		for (const lineChirho of completeLinesChirho(reconciledChirho.bytes_chirho)) {
			const rowChirho = recordChirho(JSON.parse(lineChirho));
			if (rowChirho.kind_chirho !== 'job') continue;
			const idChirho = String(rowChirho.job_id_chirho);
			if (seenChirho.has(idChirho))
				throw new Error('Repeated result across Mark resume/provider streams');
			seenChirho.add(idChirho);
		}
		completedChirho.push(...resultChirho.completed_chirho);
		heldChirho.push(...resultChirho.held_chirho);
	}
	return { completed_chirho: completedChirho, held_chirho: heldChirho };
}
