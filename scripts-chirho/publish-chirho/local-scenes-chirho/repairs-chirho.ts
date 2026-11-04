// For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life. — John 3:16 (KJV)
// Workflow: media-delivery-chirho.md. Read completed black-output repairs; never request them.
import { join as joinChirho } from 'node:path';
import { realpath as realpathChirho } from 'node:fs/promises';
import { digestChirho } from '../r2-chirho/object-store-chirho';
import { acquireLockChirho } from '../r2_upload_watch_chirho';
import { inspectPngChirho, stageDirectoryChirho, writeJsonChirho } from './archive-chirho';
import { archiveItemsChirho } from './watch-chirho';
import { loadCompletedChapterChirho } from './variants-chirho';
import {
	completeLinesChirho,
	completedJobsChirho,
	optionalReadChirho,
	readBoundedChirho,
	recordChirho,
	RUN_CHIRHO,
	STAGE_CHIRHO,
	MAX_PNG_BYTES_CHIRHO,
	type CompletedJobChirho,
	type BoundJobChirho
} from './source-chirho';

export function repairJobChirho(
	lineChirho: string,
	originalChirho: BoundJobChirho,
	passChirho: 2 | 3 | 4,
	chapterChirho: number
) {
	const rowChirho = recordChirho(JSON.parse(lineChirho));
	const outputChirho = originalChirho.output_chirho.replace(
		'-runware-schnell-chirho.png',
		`-runware-schnell-r${passChirho}-chirho.png`
	);
	if (
		originalChirho.provider_chirho !== 'runware' ||
		originalChirho.repair_pass_chirho ||
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
				rowChirho[fieldChirho] !== originalChirho[fieldChirho as keyof BoundJobChirho]
		)
	)
		throw new Error('Repair changed its original source, prompt, seed, model or output scope');
	return {
		...originalChirho,
		output_chirho: outputChirho,
		job_sha256_chirho: digestChirho(lineChirho),
		repair_pass_chirho: passChirho
	};
}

export function repairRecordChirho(
	lineChirho: string,
	jobChirho: BoundJobChirho,
	previousChirho: CompletedJobChirho,
	historyChirho: Record<string, unknown>[],
	maximumChirho: number
) {
	const rowChirho = recordChirho(JSON.parse(lineChirho));
	const blackChirho = rowChirho.ok_chirho === false && rowChirho.error_chirho === 'blackOutput';
	const statesChirho = blackChirho ? 'requested,received,black' : 'requested,received,saved';
	if (
		(rowChirho.ok_chirho !== true && !blackChirho) ||
		maximumChirho <= 8 !== blackChirho ||
		historyChirho.map((entryChirho) => entryChirho.state_chirho).join(',') !== statesChirho ||
		historyChirho[0].task_uuid_chirho !== rowChirho.task_uuid_chirho ||
		historyChirho[1].cost_usd_chirho !== rowChirho.cost_usd_chirho ||
		historyChirho[2].output_sha256_chirho !== rowChirho.output_sha256_chirho ||
		typeof historyChirho[0].request_sha256_chirho !== 'string' ||
		!/^[a-f0-9]{64}$/u.test(historyChirho[0].request_sha256_chirho)
	)
		throw new Error('Repair result, deterministic pixel state or request journal differs');
	// A black download is preserved as failed artwork. Its decoded canvas supplies missing dimensions.
	const validatedChirho = completedJobsChirho(
		Buffer.from(
			JSON.stringify({
				...rowChirho,
				...(blackChirho
					? {
							ok_chirho: true,
							model_chirho: jobChirho.model_chirho,
							width_px_chirho: 1024,
							height_px_chirho: 768
						}
					: {})
			}) + '\n'
		),
		new Map([[jobChirho.job_id_chirho, jobChirho]])
	).completed_chirho[0];
	return {
		...validatedChirho,
		record_sha256_chirho: digestChirho(lineChirho),
		...(blackChirho ? { pixel_hold_chirho: 'blackOutput' as const } : {}),
		replacement_chirho: {
			previous_png_sha256_chirho: previousChirho.output_sha256_chirho,
			previous_record_sha256_chirho: previousChirho.record_sha256_chirho,
			journal_sha256_chirho: digestChirho(JSON.stringify(historyChirho))
		}
	};
}

export async function loadRepairsChirho(rootChirho: string) {
	const runChirho = joinChirho(rootChirho, RUN_CHIRHO);
	const currentChirho = new Map<string, CompletedJobChirho>();
	for (let chapterChirho = 1; chapterChirho <= 16; chapterChirho++) {
		const resultChirho = await loadCompletedChapterChirho(rootChirho, chapterChirho);
		if (!resultChirho || resultChirho.held_chirho.length)
			throw new Error('Original Mark results are not reconciled');
		for (const itemChirho of resultChirho.completed_chirho)
			currentChirho.set(itemChirho.job_chirho.job_id_chirho, itemChirho);
	}
	if (currentChirho.size !== 674) throw new Error('Original Mark coverage differs');
	const originalsChirho = new Map(currentChirho);
	const pixelsChirho = new Map<string, Promise<number>>();
	async function maximumChirho(itemChirho: CompletedJobChirho) {
		const bytesChirho = await readBoundedChirho(
			itemChirho.job_chirho.output_chirho,
			MAX_PNG_BYTES_CHIRHO
		);
		if (digestChirho(bytesChirho) !== itemChirho.output_sha256_chirho)
			throw new Error('Repair PNG differs from its source record');
		if (!pixelsChirho.has(itemChirho.output_sha256_chirho))
			pixelsChirho.set(itemChirho.output_sha256_chirho, inspectPngChirho(bytesChirho));
		return pixelsChirho.get(itemChirho.output_sha256_chirho)!;
	}
	const outputsChirho: CompletedJobChirho[] = [];
	for (const passChirho of [2, 3, 4] as const) {
		const journalBytesChirho = await optionalReadChirho(
			joinChirho(runChirho, `records-chirho/runware-r${passChirho}-journal-chirho.jsonl`),
			4 * 1024 ** 2
		);
		if (!journalBytesChirho) continue;
		const journalChirho = completeLinesChirho(journalBytesChirho).map((lineChirho) =>
			recordChirho(JSON.parse(lineChirho))
		);
		for (let chapterChirho = 3; chapterChirho <= 16; chapterChirho++) {
			const prefixChirho = `chapter-${String(chapterChirho).padStart(2, '0')}-runware-r${passChirho}`;
			const jobBytesChirho = await optionalReadChirho(
				joinChirho(runChirho, 'jobs-chirho', `${prefixChirho}-jobs-chirho.jsonl`),
				1024 ** 2
			);
			if (!jobBytesChirho) continue;
			if (jobBytesChirho.length === 0) {
				const extraChirho = await optionalReadChirho(
					joinChirho(runChirho, 'records-chirho', `${prefixChirho}-records-chirho.jsonl`),
					4 * 1024 ** 2
				);
				if (extraChirho?.length) throw new Error('Result exists outside an empty repair plan');
				continue;
			}
			if (jobBytesChirho.at(-1) !== 10) throw new Error('Repair plan is incomplete');
			const jobsChirho = new Map<string, BoundJobChirho>();
			for (const lineChirho of completeLinesChirho(jobBytesChirho)) {
				const idChirho = String(recordChirho(JSON.parse(lineChirho)).job_id_chirho);
				const originalChirho = originalsChirho.get(idChirho);
				if (!originalChirho || jobsChirho.has(idChirho))
					throw new Error('Unknown or repeated repair plan');
				jobsChirho.set(
					idChirho,
					repairJobChirho(lineChirho, originalChirho.job_chirho, passChirho, chapterChirho)
				);
			}
			const recordBytesChirho = await readBoundedChirho(
				joinChirho(runChirho, 'records-chirho', `${prefixChirho}-records-chirho.jsonl`),
				4 * 1024 ** 2
			);
			const seenChirho = new Set<string>();
			for (const lineChirho of completeLinesChirho(recordBytesChirho)) {
				const rowChirho = recordChirho(JSON.parse(lineChirho));
				const idChirho = String(rowChirho.job_id_chirho),
					jobChirho = jobsChirho.get(idChirho),
					previousChirho = currentChirho.get(idChirho);
				if (
					!jobChirho ||
					!previousChirho ||
					seenChirho.has(idChirho) ||
					previousChirho.job_chirho.repair_pass_chirho !==
						(passChirho === 2 ? undefined : passChirho - 1) ||
					(await maximumChirho(previousChirho)) > 8
				)
					throw new Error('Repair does not follow a known black output');
				seenChirho.add(idChirho);
				if (
					typeof rowChirho.output_sha256_chirho !== 'string' ||
					!/^[a-f0-9]{64}$/u.test(rowChirho.output_sha256_chirho)
				)
					throw new Error('Repair output hash missing');
				const temporaryChirho: CompletedJobChirho = {
					job_chirho: jobChirho,
					output_sha256_chirho: rowChirho.output_sha256_chirho,
					record_sha256_chirho: digestChirho(lineChirho)
				};
				const itemChirho = repairRecordChirho(
					lineChirho,
					jobChirho,
					previousChirho,
					journalChirho.filter((entryChirho) => entryChirho.job_id_chirho === idChirho),
					await maximumChirho(temporaryChirho)
				);
				outputsChirho.push(itemChirho);
				currentChirho.set(idChirho, itemChirho);
			}
			if (seenChirho.size !== jobsChirho.size)
				throw new Error('Repair plan has an unresolved result');
		}
	}
	const inventoryChirho = recordChirho(
		JSON.parse(
			(
				await readBoundedChirho(joinChirho(runChirho, 'usable-outputs-chirho.json'), 2 * 1024 ** 2)
			).toString()
		)
	);
	if (Object.keys(inventoryChirho).length !== 674)
		throw new Error('Usable inventory coverage differs');
	for (const [idChirho, itemChirho] of currentChirho) {
		const declaredChirho = recordChirho(inventoryChirho[idChirho]);
		if (
			declaredChirho.output_chirho !== itemChirho.job_chirho.output_chirho ||
			declaredChirho.output_sha256_chirho !== itemChirho.output_sha256_chirho ||
			(await maximumChirho(itemChirho)) <= 8
		)
			throw new Error('Usable inventory does not select a verified nonblack result');
	}
	return { outputs_chirho: outputsChirho, selected_chirho: [...currentChirho.values()] };
}

if (import.meta.main) {
	const rootChirho = await realpathChirho(process.cwd());
	const applyChirho = process.argv.slice(2).includes('--apply-chirho');
	if (process.argv.slice(2).some((argumentChirho) => argumentChirho !== '--apply-chirho'))
		throw new Error('Unknown repair preservation argument');
	let releaseChirho: (() => Promise<void>) | undefined;
	if (applyChirho) {
		await stageDirectoryChirho(rootChirho, joinChirho(rootChirho, STAGE_CHIRHO));
		releaseChirho = await acquireLockChirho(
			joinChirho(rootChirho, STAGE_CHIRHO, 'archive-chirho.lock')
		);
	}
	let stoppingChirho = false;
	process.on('SIGTERM', () => {
		stoppingChirho = true;
	});
	process.on('SIGINT', () => {
		stoppingChirho = true;
	});
	try {
		const repairChirho = await loadRepairsChirho(rootChirho);
		const resultChirho = await archiveItemsChirho(
			rootChirho,
			repairChirho.outputs_chirho,
			applyChirho,
			674,
			() => stoppingChirho
		);
		if (applyChirho)
			await writeJsonChirho(
				rootChirho,
				joinChirho(rootChirho, STAGE_CHIRHO, 'repair-preservation-chirho.json'),
				resultChirho
			);
		console.log(JSON.stringify(resultChirho));
		if (
			resultChirho.held_chirho.length ||
			(applyChirho && resultChirho.archived_chirho !== resultChirho.expected_chirho)
		)
			process.exitCode = 2;
	} finally {
		await releaseChirho?.();
	}
}
