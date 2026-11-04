// For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life. — John 3:16 (KJV)
import { afterEach, describe, expect, it, vi as viChirho } from 'vitest';
import {
	mkdtemp as mkdtempChirho,
	mkdir as mkdirChirho,
	readFile as readFileChirho,
	realpath as realpathChirho,
	rm as rmChirho,
	symlink as symlinkChirho,
	writeFile as writeFileChirho
} from 'node:fs/promises';
import { tmpdir as tmpdirChirho } from 'node:os';
import { dirname as dirnameChirho, join as joinChirho } from 'node:path';
import { execFileSync as execFileSyncChirho } from 'node:child_process';
import { digestChirho } from '../../../scripts-chirho/publish-chirho/r2-chirho/object-store-chirho';
import {
	completedJobsChirho,
	loadChapterChirho,
	MAX_PNG_BYTES_CHIRHO,
	readBoundedChirho,
	RUN_CHIRHO,
	STAGE_CHIRHO
} from '../../../scripts-chirho/publish-chirho/local-scenes-chirho/source-chirho';
import {
	archiveCompletedChirho,
	decodePngChirho,
	inspectPngChirho,
	stageDirectoryChirho
} from '../../../scripts-chirho/publish-chirho/local-scenes-chirho/archive-chirho';
import {
	loadCompletedChapterChirho,
	reconcileRefusalsChirho,
	runwareJobsChirho
} from '../../../scripts-chirho/publish-chirho/local-scenes-chirho/variants-chirho';
import { archivePassChirho } from '../../../scripts-chirho/publish-chirho/local-scenes-chirho/watch-chirho';
import {
	repairJobChirho,
	repairRecordChirho
} from '../../../scripts-chirho/publish-chirho/local-scenes-chirho/repairs-chirho';

const rootsChirho: string[] = [];
afterEach(async () => {
	await Promise.all(
		rootsChirho
			.splice(0)
			.map((rootChirho) => rmChirho(rootChirho, { recursive: true, force: true }))
	);
});
async function saveChirho(pathChirho: string, valueChirho: unknown) {
	await mkdirChirho(dirnameChirho(pathChirho), { recursive: true });
	await writeFileChirho(pathChirho, JSON.stringify(valueChirho));
}
async function fixtureChirho(chapterChirho = 1) {
	const rootChirho = await realpathChirho(
		await mkdtempChirho(joinChirho(tmpdirChirho(), 'mark-archive-chirho-'))
	);
	rootsChirho.push(rootChirho);
	const paddedChirho = String(chapterChirho).padStart(2, '0');
	const chapterPathChirho = `/content-chirho/mark-chirho/chapter-${paddedChirho}-chirho.json`;
	const versesChirho = [1, chapterChirho === 16 ? 99 : 2].map((verseChirho) => ({
		id_chirho: `Mark.${chapterChirho}.${verseChirho}`,
		reference_chirho: `Mark ${chapterChirho}:${verseChirho}`,
		language_chirho: 'grc',
		canonical_text_chirho: `Ἀρχὴ ${verseChirho}`,
		tokens_chirho: [
			{ gloss_chirho: 'beginning' },
			{ gloss_chirho: '-' },
			{ gloss_chirho: 'good news' }
		]
	}));
	const chapterValueChirho = {
		book_id_chirho: 'Mark',
		chapter_chirho: chapterChirho,
		verses_chirho: versesChirho
	};
	await saveChirho(joinChirho(rootChirho, 'static', chapterPathChirho), chapterValueChirho);
	const manifestPathChirho = joinChirho(
		rootChirho,
		'static/content-chirho/mark-chirho/manifest-chirho.json'
	);
	await saveChirho(manifestPathChirho, {
		book_id_chirho: 'Mark',
		chapters_chirho: [
			{
				number_chirho: chapterChirho,
				verse_count_chirho: 2,
				path_chirho: chapterPathChirho,
				sha256_chirho: digestChirho(JSON.stringify(chapterValueChirho))
			}
		]
	});
	const snapshotPathChirho = joinChirho(
		rootChirho,
		RUN_CHIRHO,
		`verses-chirho/chapter-${paddedChirho}-verses-chirho.json`
	);
	await saveChirho(
		snapshotPathChirho,
		versesChirho.map((verseChirho) => ({
			verse_id_chirho: verseChirho.id_chirho,
			reference_chirho: verseChirho.reference_chirho,
			word_glosses_in_greek_order_chirho: 'beginning good news'
		}))
	);
	const pngChirho = Buffer.from('test-png-evidence-chirho');
	const jobsChirho = versesChirho.map((verseChirho) => {
		const numberChirho = Number(verseChirho.id_chirho.split('.')[2]);
		const jobIdChirho = `mark-${paddedChirho}-${String(numberChirho).padStart(3, '0')}`;
		const seedChirho = 300000 + chapterChirho * 1000 + numberChirho;
		return {
			job_id_chirho: jobIdChirho,
			verse_id_chirho: verseChirho.id_chirho,
			prompt_chirho: 'Watercolor illustration of a rocky path by the lake.',
			prompt_sha256_chirho: digestChirho('Watercolor illustration of a rocky path by the lake.'),
			jesus_presence_chirho: 'offscreen',
			seed_chirho: seedChirho,
			steps_chirho: 4,
			width_chirho: 1024,
			height_chirho: 768,
			output_chirho: joinChirho(
				rootChirho,
				RUN_CHIRHO,
				`originals-chirho/chapter-${paddedChirho}/${jobIdChirho}-seed-${seedChirho}-schnell-q4-chirho.png`
			)
		};
	});
	const jobsPathChirho = joinChirho(
		rootChirho,
		RUN_CHIRHO,
		`jobs-chirho/chapter-${paddedChirho}-jobs-chirho.jsonl`
	);
	async function saveJobsChirho() {
		await mkdirChirho(dirnameChirho(jobsPathChirho), { recursive: true });
		await writeFileChirho(
			jobsPathChirho,
			jobsChirho.map((jobChirho) => JSON.stringify(jobChirho) + '\n').join('')
		);
	}
	await saveJobsChirho();
	for (const jobChirho of jobsChirho) {
		await mkdirChirho(dirnameChirho(jobChirho.output_chirho), { recursive: true });
		await writeFileChirho(jobChirho.output_chirho, pngChirho);
	}
	const recordsChirho = jobsChirho.map((jobChirho) => ({
		kind_chirho: 'job',
		ok_chirho: true,
		job_id_chirho: jobChirho.job_id_chirho,
		output_chirho: jobChirho.output_chirho,
		width_px_chirho: 1024,
		height_px_chirho: 768,
		output_sha256_chirho: digestChirho(pngChirho)
	}));
	const recordBytesChirho = () =>
		Buffer.from(recordsChirho.map((rowChirho) => JSON.stringify(rowChirho) + '\n').join(''));
	const boundChirho = (await loadChapterChirho(rootChirho, chapterChirho))!;
	const completedChirho = completedJobsChirho(recordBytesChirho(), boundChirho).completed_chirho;
	const remoteChirho = new Map<string, Uint8Array>();
	const requestChirho = viChirho.fn(
		async (methodChirho: 'GET' | 'HEAD' | 'PUT', keyChirho: string, bytesChirho?: Uint8Array) => {
			if (methodChirho === 'PUT') {
				remoteChirho.set(keyChirho, bytesChirho!);
				return new Response(null, { status: 200 });
			}
			return remoteChirho.has(keyChirho)
				? new Response(new Uint8Array(remoteChirho.get(keyChirho)!))
				: new Response(null, { status: 404 });
		}
	);
	const dependenciesChirho = {
		request_chirho: requestChirho,
		decode_chirho: viChirho.fn(async () => {})
	};
	const receiptPathChirho = joinChirho(
		rootChirho,
		STAGE_CHIRHO,
		`chapter-${paddedChirho}-chirho/${jobsChirho[0].job_id_chirho}-chirho.json`
	);
	return {
		rootChirho,
		chapterChirho,
		chapterPathChirho,
		chapterValueChirho,
		manifestPathChirho,
		snapshotPathChirho,
		jobsChirho,
		jobsPathChirho,
		saveJobsChirho,
		boundChirho,
		pngChirho,
		recordsChirho,
		recordBytesChirho,
		completedChirho,
		remoteChirho,
		requestChirho,
		dependenciesChirho,
		receiptPathChirho
	};
}
describe('local Mark provenance preservation', () => {
	it('binds completed repairs to the unchanged original and their own request journal', async () => {
		const fixtureValueChirho = await fixtureChirho(3);
		const originalRowChirho = {
			...fixtureValueChirho.jobsChirho[0],
			provider_chirho: 'runware',
			model_chirho: 'runware:100@1',
			chapter_chirho: 3,
			output_chirho: fixtureValueChirho.jobsChirho[0].output_chirho.replace(
				'-schnell-q4-chirho.png',
				'-runware-schnell-chirho.png'
			)
		};
		const originalChirho = [
			...runwareJobsChirho(
				Buffer.from(
					[
						originalRowChirho,
						{
							...fixtureValueChirho.jobsChirho[1],
							provider_chirho: 'runware',
							model_chirho: 'runware:100@1',
							chapter_chirho: 3,
							output_chirho: fixtureValueChirho.jobsChirho[1].output_chirho.replace(
								'-schnell-q4-chirho.png',
								'-runware-schnell-chirho.png'
							)
						}
					]
						.map((rowChirho) => JSON.stringify(rowChirho) + '\n')
						.join('')
				),
				fixtureValueChirho.boundChirho,
				3
			).values()
		][0];
		const repairRowChirho = {
			...originalRowChirho,
			output_chirho: originalRowChirho.output_chirho.replace(
				'-runware-schnell-chirho.png',
				'-runware-schnell-r2-chirho.png'
			)
		};
		const jobChirho = repairJobChirho(JSON.stringify(repairRowChirho), originalChirho, 2, 3);
		expect(jobChirho.repair_pass_chirho).toBe(2);
		expect(() =>
			repairJobChirho(JSON.stringify({ ...repairRowChirho, seed_chirho: 1 }), originalChirho, 2, 3)
		).toThrow('original source');
		const rowChirho = {
			...fixtureValueChirho.recordsChirho[0],
			provider_chirho: 'runware',
			model_chirho: 'runware:100@1',
			output_chirho: jobChirho.output_chirho,
			task_uuid_chirho: 'f2307d22-3114-407b-9df8-4971a0d52a3e',
			image_uuid_chirho: 'fde46f46-a5dc-4c2f-a34b-0e714bb0be01',
			cost_usd_chirho: 0.0006
		};
		const historyChirho = [
			{
				state_chirho: 'requested',
				task_uuid_chirho: rowChirho.task_uuid_chirho,
				request_sha256_chirho: 'a'.repeat(64)
			},
			{ state_chirho: 'received', cost_usd_chirho: 0.0006 },
			{ state_chirho: 'saved', output_sha256_chirho: rowChirho.output_sha256_chirho }
		];
		const resultChirho = repairRecordChirho(
			JSON.stringify(rowChirho),
			jobChirho,
			fixtureValueChirho.completedChirho[0],
			historyChirho,
			255
		);
		expect(resultChirho.record_sha256_chirho).toBe(digestChirho(JSON.stringify(rowChirho)));
		expect(resultChirho.replacement_chirho?.previous_record_sha256_chirho).toBe(
			fixtureValueChirho.completedChirho[0].record_sha256_chirho
		);
		expect(() =>
			repairRecordChirho(
				JSON.stringify(rowChirho),
				jobChirho,
				fixtureValueChirho.completedChirho[0],
				historyChirho,
				0
			)
		).toThrow('pixel state');
	});
	it('keeps an original receipt unchanged when preserving a separate failed repair', async () => {
		const fixtureValueChirho = await fixtureChirho();
		const originalChirho = fixtureValueChirho.completedChirho[0];
		await archiveCompletedChirho(
			fixtureValueChirho.rootChirho,
			originalChirho,
			true,
			fixtureValueChirho.dependenciesChirho
		);
		const priorChirho = await readFileChirho(fixtureValueChirho.receiptPathChirho);
		const repairChirho = {
			...originalChirho,
			job_chirho: { ...originalChirho.job_chirho, repair_pass_chirho: 2 as const },
			pixel_hold_chirho: 'blackOutput' as const
		};
		await archiveCompletedChirho(
			fixtureValueChirho.rootChirho,
			repairChirho,
			true,
			fixtureValueChirho.dependenciesChirho
		);
		expect(await readFileChirho(fixtureValueChirho.receiptPathChirho)).toEqual(priorChirho);
		const pathChirho = fixtureValueChirho.receiptPathChirho.replace(
			'-chirho.json',
			'-r2-chirho.json'
		);
		expect(JSON.parse((await readFileChirho(pathChirho)).toString()).pixel_hold_chirho).toBe(
			'blackOutput'
		);
	});
	it('accepts a saved known-refusal retry only with its full matching request journal', () => {
		const idChirho = 'mark-04-034';
		const successfulChirho = {
			job_id_chirho: idChirho,
			ok_chirho: true,
			provider_chirho: 'runware',
			task_uuid_chirho: 'f2307d22-3114-407b-9df8-4971a0d52a3e',
			cost_usd_chirho: 0.0006,
			output_sha256_chirho: 'a'.repeat(64)
		};
		const failedChirho = {
			job_id_chirho: idChirho,
			ok_chirho: false,
			provider_chirho: 'runware',
			error_chirho: 'serviceOverloaded'
		};
		const recordsChirho = Buffer.from(
			[failedChirho, successfulChirho].map((rowChirho) => JSON.stringify(rowChirho) + '\n').join('')
		);
		const historyChirho = [
			{
				job_id_chirho: idChirho,
				state_chirho: 'requested',
				task_uuid_chirho: '6e63a0ad-d9b5-409c-9383-aa453c65ce1e',
				request_sha256_chirho: 'b'.repeat(64)
			},
			{
				job_id_chirho: idChirho,
				state_chirho: 'error',
				http_chirho: 429,
				code_chirho: 'serviceOverloaded'
			},
			{
				job_id_chirho: idChirho,
				state_chirho: 'requested',
				task_uuid_chirho: successfulChirho.task_uuid_chirho,
				request_sha256_chirho: 'c'.repeat(64)
			},
			{
				job_id_chirho: idChirho,
				state_chirho: 'received',
				cost_usd_chirho: successfulChirho.cost_usd_chirho
			},
			{
				job_id_chirho: idChirho,
				state_chirho: 'saved',
				output_sha256_chirho: successfulChirho.output_sha256_chirho
			}
		];
		const bytesChirho = () =>
			Buffer.from(historyChirho.map((rowChirho) => JSON.stringify(rowChirho) + '\n').join(''));
		const resultChirho = reconcileRefusalsChirho(recordsChirho, bytesChirho());
		expect(resultChirho.proofs_chirho.get(idChirho)?.prior_record_sha256_chirho).toBe(
			digestChirho(JSON.stringify(failedChirho))
		);
		expect(resultChirho.bytes_chirho.toString()).toBe(JSON.stringify(successfulChirho) + '\n');
		expect(() => reconcileRefusalsChirho(recordsChirho, null)).toThrow('reconciliation');
		historyChirho[1].http_chirho = 503;
		expect(() => reconcileRefusalsChirho(recordsChirho, bytesChirho())).toThrow('reconciliation');
	});
	it('accepts only unchanged Runware derivatives of chapter 3 through 16 plans', async () => {
		const fixtureValueChirho = await fixtureChirho(3);
		const rowsChirho = fixtureValueChirho.jobsChirho.map((jobChirho) => ({
			...jobChirho,
			output_chirho: jobChirho.output_chirho.replace(
				'-schnell-q4-chirho.png',
				'-runware-schnell-chirho.png'
			),
			provider_chirho: 'runware',
			model_chirho: 'runware:100@1',
			chapter_chirho: 3
		}));
		const bytesChirho = () =>
			Buffer.from(rowsChirho.map((rowChirho) => JSON.stringify(rowChirho) + '\n').join(''));
		expect(
			[...runwareJobsChirho(bytesChirho(), fixtureValueChirho.boundChirho, 3).values()][0]
		).toMatchObject({ provider_chirho: 'runware', model_chirho: 'runware:100@1' });
		const originalChirho = { ...rowsChirho[0] };
		for (const mutationChirho of [
			{ model_chirho: 'another-model' },
			{ seed_chirho: 42 },
			{ prompt_chirho: 'modified prompt' }
		]) {
			Object.assign(rowsChirho[0], originalChirho, mutationChirho);
			expect(() => runwareJobsChirho(bytesChirho(), fixtureValueChirho.boundChirho, 3)).toThrow(
				'original plan'
			);
		}
		expect(() => runwareJobsChirho(bytesChirho(), fixtureValueChirho.boundChirho, 2)).toThrow(
			'scope'
		);
	});
	it('binds Runware results to provider, model, UUIDs and returned seed', async () => {
		const fixtureValueChirho = await fixtureChirho(3);
		const jobChirho = {
			...fixtureValueChirho.completedChirho[0].job_chirho,
			provider_chirho: 'runware' as const,
			model_chirho: 'runware:100@1' as const
		};
		const jobsChirho = new Map([[jobChirho.job_id_chirho, jobChirho]]);
		const rowChirho = {
			...fixtureValueChirho.recordsChirho[0],
			provider_chirho: 'runware',
			model_chirho: 'runware:100@1',
			task_uuid_chirho: 'c42315e7-1778-41be-af51-fbef852f2926',
			image_uuid_chirho: '0fc62f1c-59a6-4f84-a2be-4aea2a7eaa05',
			cost_usd_chirho: 0.0006,
			seed_returned_chirho: jobChirho.seed_chirho
		};
		const bytesChirho = (valueChirho: unknown) => Buffer.from(JSON.stringify(valueChirho) + '\n');
		expect(completedJobsChirho(bytesChirho(rowChirho), jobsChirho).completed_chirho).toHaveLength(
			1
		);
		for (const mutationChirho of [
			{ model_chirho: 'other' },
			{ task_uuid_chirho: 'missing' },
			{ seed_returned_chirho: 999 },
			{ cost_usd_chirho: -1 }
		])
			expect(() =>
				completedJobsChirho(bytesChirho({ ...rowChirho, ...mutationChirho }), jobsChirho)
			).toThrow('Runware result');
	});
	it('adds byte-identical resumed job subsets while refusing duplicates across streams', async () => {
		const fixtureValueChirho = await fixtureChirho();
		const runChirho = joinChirho(fixtureValueChirho.rootChirho, RUN_CHIRHO);
		await mkdirChirho(joinChirho(runChirho, 'records-chirho'), { recursive: true });
		const originalPathChirho = joinChirho(
			runChirho,
			'records-chirho/chapter-01-records-chirho.jsonl'
		);
		const resumePlanChirho = joinChirho(
			runChirho,
			'jobs-chirho/chapter-01-resume-1-jobs-chirho.jsonl'
		);
		await writeFileChirho(
			originalPathChirho,
			JSON.stringify(fixtureValueChirho.recordsChirho[0]) + '\n'
		);
		await writeFileChirho(
			resumePlanChirho,
			JSON.stringify(fixtureValueChirho.jobsChirho[1]) + '\n'
		);
		await writeFileChirho(
			joinChirho(runChirho, 'records-chirho/chapter-01-resume-1-records-chirho.jsonl'),
			JSON.stringify(fixtureValueChirho.recordsChirho[1]) + '\n'
		);
		expect(
			(await loadCompletedChapterChirho(fixtureValueChirho.rootChirho, 1))?.completed_chirho
		).toHaveLength(2);
		await writeFileChirho(originalPathChirho, fixtureValueChirho.recordBytesChirho());
		await expect(loadCompletedChapterChirho(fixtureValueChirho.rootChirho, 1)).rejects.toThrow(
			'Repeated result across'
		);
		await writeFileChirho(
			resumePlanChirho,
			JSON.stringify({ ...fixtureValueChirho.jobsChirho[1], seed_chirho: 1 }) + '\n'
		);
		await expect(loadCompletedChapterChirho(fixtureValueChirho.rootChirho, 1)).rejects.toThrow(
			'original job lines'
		);
	});
	it('drains an unchanged backlog under a concurrent limit without repeated uploads', async () => {
		const fixtureValueChirho = await fixtureChirho();
		const runChirho = joinChirho(fixtureValueChirho.rootChirho, RUN_CHIRHO);
		await mkdirChirho(joinChirho(runChirho, 'records-chirho'), { recursive: true });
		await writeFileChirho(
			joinChirho(runChirho, 'records-chirho/chapter-01-records-chirho.jsonl'),
			fixtureValueChirho.recordBytesChirho()
		);
		const savedChirho = new Set<string>();
		const callsChirho: string[] = [];
		const archiveChirho: typeof archiveCompletedChirho = async (
			_rootChirho,
			itemChirho,
			applyChirho
		) => {
			const idChirho = itemChirho.job_chirho.verse_id_chirho;
			if (savedChirho.has(idChirho))
				return { state_chirho: 'already_archived', verse_id_chirho: idChirho, uploaded_chirho: 0 };
			if (!applyChirho)
				return { state_chirho: 'would_archive', verse_id_chirho: idChirho, uploaded_chirho: 0 };
			await new Promise((resolveChirho) => setTimeout(resolveChirho, 2));
			callsChirho.push(idChirho);
			savedChirho.add(idChirho);
			return { state_chirho: 'archived', verse_id_chirho: idChirho, uploaded_chirho: 1 };
		};
		expect(
			(await archivePassChirho(fixtureValueChirho.rootChirho, true, 1, () => false, archiveChirho))
				.uploaded_chirho
		).toBe(1);
		expect(
			(await archivePassChirho(fixtureValueChirho.rootChirho, true, 1, () => false, archiveChirho))
				.archived_chirho
		).toBe(2);
		expect(
			(await archivePassChirho(fixtureValueChirho.rootChirho, true, 1, () => false, archiveChirho))
				.uploaded_chirho
		).toBe(0);
		expect(callsChirho).toEqual(['Mark.1.1', 'Mark.1.2']);
	});
	it('refuses linked staging parents before creating anything outside the project', async () => {
		const fixtureValueChirho = await fixtureChirho();
		const outsideChirho = await realpathChirho(
			await mkdtempChirho(joinChirho(tmpdirChirho(), 'mark-outside-chirho-'))
		);
		rootsChirho.push(outsideChirho);
		await symlinkChirho(outsideChirho, joinChirho(fixtureValueChirho.rootChirho, 'build-chirho'));
		await expect(
			stageDirectoryChirho(
				fixtureValueChirho.rootChirho,
				joinChirho(fixtureValueChirho.rootChirho, STAGE_CHIRHO)
			)
		).rejects.toThrow('Linked');
		await expect(
			realpathChirho(joinChirho(outsideChirho, 'local-scenes-chirho'))
		).rejects.toMatchObject({ code: 'ENOENT' });
	});
	it('binds the real shorter-ending number and omits only missing gloss placeholders', async () => {
		const fixtureValueChirho = await fixtureChirho(16);
		expect(
			[...fixtureValueChirho.boundChirho.values()].map((rowChirho) => rowChirho.verse_id_chirho)
		).toEqual(['Mark.16.1', 'Mark.16.99']);
		expect(fixtureValueChirho.completedChirho[1].job_chirho.canonical_sha256_chirho).toBe(
			digestChirho('Ἀρχὴ 99')
		);
	});
	it('refuses changed source bytes and snapshot meanings', async () => {
		const fixtureValueChirho = await fixtureChirho();
		await writeFileChirho(
			joinChirho(fixtureValueChirho.rootChirho, 'static', fixtureValueChirho.chapterPathChirho),
			'{}'
		);
		await expect(loadChapterChirho(fixtureValueChirho.rootChirho, 1)).rejects.toThrow(
			'hash differs'
		);
		await saveChirho(
			joinChirho(fixtureValueChirho.rootChirho, 'static', fixtureValueChirho.chapterPathChirho),
			fixtureValueChirho.chapterValueChirho
		);
		const snapshotChirho = JSON.parse(
			(await readFileChirho(fixtureValueChirho.snapshotPathChirho)).toString()
		);
		snapshotChirho[0].word_glosses_in_greek_order_chirho = 'a different meaning';
		await saveChirho(fixtureValueChirho.snapshotPathChirho, snapshotChirho);
		await expect(loadChapterChirho(fixtureValueChirho.rootChirho, 1)).rejects.toThrow('snapshot');
	});
	it('refuses escaped output paths, modified prompt hashes and changed seeds', async () => {
		const fixtureValueChirho = await fixtureChirho();
		const originalChirho = { ...fixtureValueChirho.jobsChirho[0] };
		for (const mutationChirho of [
			{ output_chirho: '/tmp/other-chirho.png' },
			{ prompt_chirho: 'different prompt' },
			{ seed_chirho: 1 }
		]) {
			Object.assign(fixtureValueChirho.jobsChirho[0], originalChirho, mutationChirho);
			await fixtureValueChirho.saveJobsChirho();
			await expect(loadChapterChirho(fixtureValueChirho.rootChirho, 1)).rejects.toThrow('identity');
		}
	});
	it('refuses symlinked output files and oversized input', async () => {
		const fixtureValueChirho = await fixtureChirho();
		const pathChirho = fixtureValueChirho.jobsChirho[0].output_chirho;
		await rmChirho(pathChirho);
		await symlinkChirho(fixtureValueChirho.jobsChirho[1].output_chirho, pathChirho);
		await expect(
			archiveCompletedChirho(
				fixtureValueChirho.rootChirho,
				fixtureValueChirho.completedChirho[0],
				true,
				fixtureValueChirho.dependenciesChirho
			)
		).rejects.toThrow('Linked');
		await rmChirho(pathChirho);
		await writeFileChirho(pathChirho, Buffer.alloc(MAX_PNG_BYTES_CHIRHO + 1));
		await expect(readBoundedChirho(pathChirho, MAX_PNG_BYTES_CHIRHO)).rejects.toThrow('bounded');
		expect(fixtureValueChirho.requestChirho).not.toHaveBeenCalled();
	});
	it('ignores a torn tail and refuses unknown or duplicate complete results', async () => {
		const fixtureValueChirho = await fixtureChirho();
		const firstChirho = JSON.stringify(fixtureValueChirho.recordsChirho[0]) + '\n';
		expect(
			completedJobsChirho(
				Buffer.from(firstChirho + '{"kind_chirho":'),
				fixtureValueChirho.boundChirho
			).completed_chirho
		).toHaveLength(1);
		expect(() =>
			completedJobsChirho(Buffer.from(firstChirho + firstChirho), fixtureValueChirho.boundChirho)
		).toThrow('repeated');
		expect(() =>
			completedJobsChirho(
				Buffer.from(
					JSON.stringify({ ...fixtureValueChirho.recordsChirho[0], job_id_chirho: 'unknown' }) +
						'\n'
				),
				fixtureValueChirho.boundChirho
			)
		).toThrow('Unknown');
	});
	it('retains failed jobs while selecting independent successful results', async () => {
		const fixtureValueChirho = await fixtureChirho();
		fixtureValueChirho.recordsChirho[0].ok_chirho = false;
		const resultChirho = completedJobsChirho(
			fixtureValueChirho.recordBytesChirho(),
			fixtureValueChirho.boundChirho
		);
		expect(resultChirho.completed_chirho).toHaveLength(1);
		expect(resultChirho.held_chirho).toHaveLength(1);
	});
	it('defaults to a network-free dry plan without receipts or deletion', async () => {
		const fixtureValueChirho = await fixtureChirho();
		expect(
			(
				await archiveCompletedChirho(
					fixtureValueChirho.rootChirho,
					fixtureValueChirho.completedChirho[0],
					false,
					fixtureValueChirho.dependenciesChirho
				)
			).state_chirho
		).toBe('would_archive');
		expect(fixtureValueChirho.requestChirho).not.toHaveBeenCalled();
		await expect(readFileChirho(fixtureValueChirho.receiptPathChirho)).rejects.toMatchObject({
			code: 'ENOENT'
		});
		expect(await readFileChirho(fixtureValueChirho.jobsChirho[0].output_chirho)).toEqual(
			fixtureValueChirho.pngChirho
		);
	});
	it('requires exact R2 readback, preserves pending review, and replays without network', async () => {
		const fixtureValueChirho = await fixtureChirho();
		await archiveCompletedChirho(
			fixtureValueChirho.rootChirho,
			fixtureValueChirho.completedChirho[0],
			true,
			fixtureValueChirho.dependenciesChirho
		);
		expect(fixtureValueChirho.requestChirho.mock.calls.map((callChirho) => callChirho[0])).toEqual([
			'GET',
			'PUT',
			'GET'
		]);
		const receiptChirho = JSON.parse(
			(await readFileChirho(fixtureValueChirho.receiptPathChirho)).toString()
		);
		expect(receiptChirho).toMatchObject({
			art_review_chirho: 'pending',
			visual_review_chirho: 'not_performed_user_directed',
			local_deletions_chirho: 0
		});
		expect(receiptChirho.binding_chirho.key_chirho).toMatch(
			/^provenance-chirho\/sha256-chirho\/[a-f0-9]{64}\.png$/u
		);
		fixtureValueChirho.requestChirho.mockClear();
		expect(
			(
				await archiveCompletedChirho(
					fixtureValueChirho.rootChirho,
					fixtureValueChirho.completedChirho[0],
					true,
					fixtureValueChirho.dependenciesChirho
				)
			).state_chirho
		).toBe('already_archived');
		expect(fixtureValueChirho.requestChirho).not.toHaveBeenCalled();
		expect(await readFileChirho(fixtureValueChirho.jobsChirho[0].output_chirho)).toEqual(
			fixtureValueChirho.pngChirho
		);
	});
	it('refuses changed local bytes even with a prior successful receipt', async () => {
		const fixtureValueChirho = await fixtureChirho();
		await archiveCompletedChirho(
			fixtureValueChirho.rootChirho,
			fixtureValueChirho.completedChirho[0],
			true,
			fixtureValueChirho.dependenciesChirho
		);
		fixtureValueChirho.requestChirho.mockClear();
		await writeFileChirho(fixtureValueChirho.jobsChirho[0].output_chirho, 'changed');
		await expect(
			archiveCompletedChirho(
				fixtureValueChirho.rootChirho,
				fixtureValueChirho.completedChirho[0],
				true,
				fixtureValueChirho.dependenciesChirho
			)
		).rejects.toThrow('hash differs');
		expect(fixtureValueChirho.requestChirho).not.toHaveBeenCalled();
	});
	it('never saves proof after changed or overlong remote bytes', async () => {
		const fixtureValueChirho = await fixtureChirho();
		for (const remoteChirho of [
			Buffer.alloc(fixtureValueChirho.pngChirho.length, 1),
			Buffer.alloc(fixtureValueChirho.pngChirho.length + 1)
		]) {
			fixtureValueChirho.requestChirho.mockImplementation(
				async () => new Response(new Uint8Array(remoteChirho))
			);
			await expect(
				archiveCompletedChirho(
					fixtureValueChirho.rootChirho,
					fixtureValueChirho.completedChirho[0],
					true,
					fixtureValueChirho.dependenciesChirho
				)
			).rejects.toThrow(/readback/u);
			await expect(readFileChirho(fixtureValueChirho.receiptPathChirho)).rejects.toMatchObject({
				code: 'ENOENT'
			});
		}
		expect(await readFileChirho(fixtureValueChirho.jobsChirho[0].output_chirho)).toEqual(
			fixtureValueChirho.pngChirho
		);
	});
	it('reconciles an uncertain PUT by GET before any repeat upload', async () => {
		const fixtureValueChirho = await fixtureChirho();
		const originalChirho =
			fixtureValueChirho.dependenciesChirho.request_chirho.getMockImplementation()!;
		fixtureValueChirho.requestChirho.mockImplementation(async (...argumentsChirho) => {
			const responseChirho = await originalChirho(...argumentsChirho);
			if (argumentsChirho[0] === 'PUT') throw new Error('connection lost after storing');
			return responseChirho;
		});
		await expect(
			archiveCompletedChirho(
				fixtureValueChirho.rootChirho,
				fixtureValueChirho.completedChirho[0],
				true,
				fixtureValueChirho.dependenciesChirho
			)
		).rejects.toThrow('connection lost');
		fixtureValueChirho.requestChirho.mockClear();
		await archiveCompletedChirho(
			fixtureValueChirho.rootChirho,
			fixtureValueChirho.completedChirho[0],
			true,
			fixtureValueChirho.dependenciesChirho
		);
		expect(fixtureValueChirho.requestChirho.mock.calls.map((callChirho) => callChirho[0])).toEqual([
			'GET'
		]);
	});
	it('refuses a changed source binding against an existing receipt', async () => {
		const fixtureValueChirho = await fixtureChirho();
		await archiveCompletedChirho(
			fixtureValueChirho.rootChirho,
			fixtureValueChirho.completedChirho[0],
			true,
			fixtureValueChirho.dependenciesChirho
		);
		fixtureValueChirho.completedChirho[0].job_chirho.canonical_sha256_chirho = 'a'.repeat(64);
		await expect(
			archiveCompletedChirho(
				fixtureValueChirho.rootChirho,
				fixtureValueChirho.completedChirho[0],
				true,
				fixtureValueChirho.dependenciesChirho
			)
		).rejects.toThrow('binding differs');
	});
	it('executes the real PNG decoder on a valid and a truncated image', async () => {
		const pngChirho = execFileSyncChirho('python3', [
			'-I',
			'-c',
			'import sys; from PIL import Image; Image.new("RGB", (1024,768), (12,34,56)).save(sys.stdout.buffer, format="PNG")'
		]);
		await expect(decodePngChirho(pngChirho)).resolves.toBeUndefined();
		await expect(inspectPngChirho(pngChirho)).resolves.toBe(56);
		await expect(decodePngChirho(pngChirho.subarray(0, 60))).rejects.toThrow('decode refused');
	});
});
