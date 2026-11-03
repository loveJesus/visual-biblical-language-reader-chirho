// For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life. — John 3:16 (KJV)
// Workflow: selective-scene-variants-chirho.md. Durable batches; reconcile an existing task, never replay generation.
import {
	mkdir as mkdirChirho,
	readFile as readFileChirho,
	statfs as statfsChirho
} from 'node:fs/promises';
import { join as joinChirho, resolve as resolveChirho } from 'node:path';
import { execFileSync as execFileSyncChirho } from 'node:child_process';
import { sha256Chirho, writeChirho } from '../../audio-chirho/audition_chirho';
import { acquireLockChirho } from '../../publish-chirho/r2_upload_watch_chirho';
import { GENESIS_BRIEFS_CHIRHO, SCENE_STYLE_CHIRHO } from './genesis_briefs_chirho';

export const COMPARISON_HOME_CHIRHO =
	'workspace-chirho/art-chirho/model-comparison-2026-10-31-chirho';
const MODELS_CHIRHO = {
	sdxl_chirho: 'civitai:101055@128078',
	flux_chirho: 'runware:100@1'
} as const;
export interface SceneJobChirho {
	lesson_id_chirho: string;
	verse_chirho: number;
	model_chirho: string;
	model_name_chirho: string;
	explanation_chirho: string;
	composition_chirho: string;
	canonical_text_chirho: string;
	canonical_sha256_chirho: string;
	positive_prompt_chirho: string;
	steps_chirho: number;
	seed_chirho: number;
}
interface ScenePlanChirho {
	schema_version_chirho: number;
	content_sha256_chirho: string;
	source_path_chirho: string;
	maximum_requests_chirho: number;
	reservation_per_request_usd_chirho: number;
	maximum_reserved_usd_chirho: number;
	jobs_chirho: SceneJobChirho[];
}
export interface SceneReceiptChirho {
	lesson_id_chirho: string;
	task_uuid_chirho: string;
	request_sha256_chirho: string;
	state_chirho: 'requested' | 'received' | 'error';
	reserved_usd_chirho: number;
	response_chirho?: Record<string, unknown>;
	error_chirho?: string;
	asset_file_chirho?: string;
	sha256_chirho?: string;
	original_sha256_chirho?: string;
	bytes_chirho?: number;
}
async function jsonOrChirho<ValueChirho>(
	pathChirho: string,
	fallbackChirho: ValueChirho
): Promise<ValueChirho> {
	try {
		return JSON.parse(await readFileChirho(pathChirho, 'utf8'));
	} catch (errorChirho) {
		if ((errorChirho as NodeJS.ErrnoException).code === 'ENOENT') return fallbackChirho;
		throw errorChirho;
	}
}
export async function prepareComparisonChirho(rootChirho: string) {
	const sourcePathChirho = 'static/content-chirho/genesis-chirho/chapter-01-chirho.json';
	const bytesChirho = await readFileChirho(joinChirho(rootChirho, sourcePathChirho));
	const sourceChirho = JSON.parse(bytesChirho.toString('utf8'));
	const manifestChirho = JSON.parse(
		await readFileChirho(
			joinChirho(rootChirho, 'static/content-chirho/genesis-chirho/manifest-chirho.json'),
			'utf8'
		)
	);
	if (
		sourceChirho.book_id_chirho !== 'Gen' ||
		sourceChirho.chapter_chirho !== 1 ||
		sourceChirho.verses_chirho.length !== 31 ||
		manifestChirho.chapters_chirho[0].sha256_chirho !== sha256Chirho(bytesChirho)
	)
		throw new Error('Genesis 1 source changed');
	const jobsChirho = GENESIS_BRIEFS_CHIRHO.map(
		([explanationChirho, compositionChirho], indexChirho) => {
			const verseChirho = indexChirho + 1,
				sourceVerseChirho = sourceChirho.verses_chirho[indexChirho];
			if (sourceVerseChirho.id_chirho !== `Gen.1.${verseChirho}`)
				throw new Error('Genesis verse order changed');
			return {
				lesson_id_chirho: sourceVerseChirho.id_chirho,
				verse_chirho: verseChirho,
				model_chirho: verseChirho % 2 ? MODELS_CHIRHO.sdxl_chirho : MODELS_CHIRHO.flux_chirho,
				model_name_chirho: verseChirho % 2 ? 'SDXL 1.0 VAE Fix' : 'FLUX.1 Schnell',
				explanation_chirho: explanationChirho,
				composition_chirho: compositionChirho,
				canonical_text_chirho: sourceVerseChirho.canonical_text_chirho,
				canonical_sha256_chirho: sha256Chirho(sourceVerseChirho.canonical_text_chirho),
				positive_prompt_chirho: `${compositionChirho} ${SCENE_STYLE_CHIRHO}`,
				steps_chirho: verseChirho % 2 ? 28 : 4,
				seed_chirho: 101000 + verseChirho
			};
		}
	);
	const planChirho: ScenePlanChirho = {
		schema_version_chirho: 1,
		content_sha256_chirho: sha256Chirho(bytesChirho),
		source_path_chirho: sourcePathChirho,
		maximum_requests_chirho: 31,
		reservation_per_request_usd_chirho: 0.02,
		maximum_reserved_usd_chirho: 1,
		jobs_chirho: jobsChirho
	};
	const homeChirho = joinChirho(rootChirho, COMPARISON_HOME_CHIRHO),
		pathChirho = joinChirho(homeChirho, 'plan-chirho.json');
	const previousChirho = await jsonOrChirho<ScenePlanChirho | null>(pathChirho, null);
	if (previousChirho && JSON.stringify(previousChirho) !== JSON.stringify(planChirho))
		throw new Error('Preserve the existing comparison plan and requests');
	await mkdirChirho(homeChirho, { recursive: true });
	if (!previousChirho) await writeChirho(pathChirho, JSON.stringify(planChirho, null, 2) + '\n');
	return planChirho;
}
export function requestForSceneChirho(jobChirho: SceneJobChirho, uuidChirho: string) {
	if (
		!/^Gen\.1\.(?:[1-9]|[12]\d|3[01])$/u.test(jobChirho.lesson_id_chirho) ||
		![MODELS_CHIRHO.sdxl_chirho, MODELS_CHIRHO.flux_chirho].includes(
			jobChirho.model_chirho as typeof MODELS_CHIRHO.sdxl_chirho
		) ||
		jobChirho.positive_prompt_chirho.length > 3000 ||
		jobChirho.steps_chirho !== (jobChirho.model_chirho === MODELS_CHIRHO.sdxl_chirho ? 28 : 4)
	)
		throw new Error('Comparison model/source/settings refused');
	return {
		taskType: 'imageInference',
		taskUUID: uuidChirho,
		model: jobChirho.model_chirho,
		positivePrompt: jobChirho.positive_prompt_chirho,
		width: 1024,
		height: 768,
		steps: jobChirho.steps_chirho,
		CFGScale: jobChirho.model_chirho === MODELS_CHIRHO.sdxl_chirho ? 7 : 1,
		seed: jobChirho.seed_chirho,
		numberResults: 1,
		outputType: 'URL',
		outputFormat: 'WEBP',
		outputQuality: 90,
		includeCost: true
	};
}
export function reserveScenesChirho(
	planChirho: ScenePlanChirho,
	receiptsChirho: SceneReceiptChirho[],
	countChirho: number
) {
	if (
		planChirho.maximum_requests_chirho !== 31 ||
		planChirho.jobs_chirho.length !== 31 ||
		planChirho.maximum_reserved_usd_chirho !== 1 ||
		planChirho.reservation_per_request_usd_chirho !== 0.02 ||
		!Number.isInteger(countChirho) ||
		countChirho < 0 ||
		countChirho > 3 ||
		new Set(receiptsChirho.map((rowChirho) => rowChirho.lesson_id_chirho)).size !==
			receiptsChirho.length ||
		receiptsChirho.some(
			(rowChirho) =>
				rowChirho.reserved_usd_chirho !== 0.02 ||
				!planChirho.jobs_chirho.some(
					(jobChirho) => jobChirho.lesson_id_chirho === rowChirho.lesson_id_chirho
				)
		) ||
		receiptsChirho.length + countChirho > 31
	)
		throw new Error('Comparison request bound refused');
	const spentChirho = receiptsChirho.reduce(
		(totalChirho, rowChirho) =>
			totalChirho +
			Math.max(rowChirho.reserved_usd_chirho, Number(rowChirho.response_chirho?.cost ?? 0)),
		0
	);
	if (!Number.isFinite(spentChirho) || spentChirho + countChirho * 0.02 > 1)
		throw new Error('Comparison budget held');
	return spentChirho;
}
async function callChirho(tasksChirho: object[], fetchChirho: typeof fetch) {
	const keyChirho = process.env.RUNWARE_API_KEY_CHIRHO;
	if (!keyChirho) throw new Error('Runware key unavailable');
	const responseChirho = await fetchChirho('https://api.runware.ai/v1', {
		method: 'POST',
		headers: { Authorization: `Bearer ${keyChirho}`, 'Content-Type': 'application/json' },
		body: JSON.stringify(tasksChirho),
		signal: AbortSignal.timeout(125000),
		redirect: 'error'
	});
	if (!responseChirho.ok)
		throw new Error(`Runware HTTP ${responseChirho.status}; saved requests require reconciliation`);
	return (await responseChirho.json()) as {
		data?: Record<string, unknown>[];
		errors?: { taskUUID?: string; code?: string; message?: string }[];
	};
}
export async function dispatchScenesChirho(
	homeChirho: string,
	planChirho: ScenePlanChirho,
	receiptsChirho: SceneReceiptChirho[],
	jobsChirho: SceneJobChirho[],
	fetchChirho: typeof fetch = fetch
) {
	reserveScenesChirho(planChirho, receiptsChirho, jobsChirho.length);
	const tasksChirho = jobsChirho.map((jobChirho) => {
		if (
			receiptsChirho.some((rowChirho) => rowChirho.lesson_id_chirho === jobChirho.lesson_id_chirho)
		)
			throw new Error('Generation already requested; poll its task ID instead');
		const taskChirho = requestForSceneChirho(jobChirho, crypto.randomUUID());
		receiptsChirho.push({
			lesson_id_chirho: jobChirho.lesson_id_chirho,
			task_uuid_chirho: taskChirho.taskUUID,
			request_sha256_chirho: sha256Chirho(JSON.stringify(taskChirho)),
			reserved_usd_chirho: 0.02,
			state_chirho: 'requested'
		});
		return taskChirho;
	});
	await writeChirho(
		joinChirho(homeChirho, 'receipts-chirho.json'),
		JSON.stringify(receiptsChirho, null, 2) + '\n'
	);
	const responseChirho = await callChirho(tasksChirho, fetchChirho);
	mergeResponseChirho(receiptsChirho, responseChirho);
	await writeChirho(
		joinChirho(homeChirho, 'receipts-chirho.json'),
		JSON.stringify(receiptsChirho, null, 2) + '\n'
	);
}
function mergeResponseChirho(
	receiptsChirho: SceneReceiptChirho[],
	responseChirho: {
		data?: Record<string, unknown>[];
		errors?: { taskUUID?: string; code?: string; message?: string }[];
	}
) {
	for (const resultChirho of responseChirho.data ?? []) {
		const rowChirho = receiptsChirho.find(
			(receiptChirho) => receiptChirho.task_uuid_chirho === resultChirho.taskUUID
		);
		if (!rowChirho) throw new Error('Runware returned an unknown task');
		if (resultChirho.imageURL) rowChirho.response_chirho = resultChirho;
	}
	for (const errorChirho of responseChirho.errors ?? []) {
		const rowChirho = receiptsChirho.find(
			(receiptChirho) => receiptChirho.task_uuid_chirho === errorChirho.taskUUID
		);
		if (rowChirho) {
			rowChirho.state_chirho = 'error';
			rowChirho.error_chirho = errorChirho.code ?? 'providerError';
		}
	}
}
async function downloadSceneChirho(
	homeChirho: string,
	jobChirho: SceneJobChirho,
	rowChirho: SceneReceiptChirho,
	fetchChirho: typeof fetch
) {
	const sourceChirho = rowChirho.response_chirho?.imageURL;
	if (typeof sourceChirho !== 'string') return;
	const urlChirho = new URL(sourceChirho);
	if (
		urlChirho.protocol !== 'https:' ||
		!/^(?:im|mim|assets|cdn)\.runware\.ai$/u.test(urlChirho.hostname) ||
		urlChirho.username ||
		urlChirho.password ||
		urlChirho.port
	)
		throw new Error('Image download host refused');
	const nameChirho = `verse-${String(jobChirho.verse_chirho).padStart(3, '0')}-chirho.webp`,
		originalChirho = nameChirho.replace('-chirho.webp', '-original-chirho.webp');
	let bytesChirho = await readFileChirho(joinChirho(homeChirho, originalChirho)).catch(
		(errorChirho: NodeJS.ErrnoException) => {
			if (errorChirho.code === 'ENOENT') return null;
			throw errorChirho;
		}
	);
	if (!bytesChirho) {
		const responseChirho = await fetchChirho(sourceChirho, {
			redirect: 'error',
			signal: AbortSignal.timeout(30000)
		});
		if (!responseChirho.ok || Number(responseChirho.headers.get('content-length')) > 8_000_000)
			throw new Error('Image download refused');
		const bufferChirho = await responseChirho.arrayBuffer();
		if (bufferChirho.byteLength > 8_000_000) throw new Error('Image download oversized');
		bytesChirho = Buffer.from(bufferChirho);
		if (
			bytesChirho.toString('ascii', 0, 4) !== 'RIFF' ||
			bytesChirho.toString('ascii', 8, 12) !== 'WEBP'
		)
			throw new Error('Provider did not return WebP');
		await writeChirho(joinChirho(homeChirho, originalChirho), bytesChirho);
	}
	const dimensionsChirho = execFileSyncChirho(
		'magick',
		['identify', '-format', '%w %h', joinChirho(homeChirho, originalChirho)],
		{ encoding: 'utf8', timeout: 15000 }
	);
	if (dimensionsChirho !== '1024 768') throw new Error('Generated dimensions differ');
	execFileSyncChirho(
		'magick',
		[
			joinChirho(homeChirho, originalChirho),
			'-strip',
			'-quality',
			'82',
			joinChirho(homeChirho, nameChirho)
		],
		{ timeout: 30000 }
	);
	const deliveryChirho = await readFileChirho(joinChirho(homeChirho, nameChirho));
	rowChirho.state_chirho = 'received';
	rowChirho.asset_file_chirho = nameChirho;
	rowChirho.sha256_chirho = sha256Chirho(deliveryChirho);
	rowChirho.original_sha256_chirho = sha256Chirho(bytesChirho);
	rowChirho.bytes_chirho = deliveryChirho.length;
}
export async function runComparisonChirho(
	rootChirho: string,
	applyChirho = false,
	limitChirho = 31,
	fetchChirho: typeof fetch = fetch
) {
	const planChirho = await prepareComparisonChirho(rootChirho),
		homeChirho = joinChirho(rootChirho, COMPARISON_HOME_CHIRHO);
	if (!Number.isInteger(limitChirho) || limitChirho < 1 || limitChirho > 31)
		throw new Error('Comparison limit refused');
	const releaseChirho = await acquireLockChirho(joinChirho(homeChirho, 'comparison-chirho.lock'));
	try {
		const pathChirho = joinChirho(homeChirho, 'receipts-chirho.json'),
			receiptsChirho = await jsonOrChirho<SceneReceiptChirho[]>(pathChirho, []);
		reserveScenesChirho(planChirho, receiptsChirho, 0);
		for (const rowChirho of receiptsChirho) {
			const jobChirho = planChirho.jobs_chirho.find(
				(valueChirho) => valueChirho.lesson_id_chirho === rowChirho.lesson_id_chirho
			)!;
			if (
				sha256Chirho(
					JSON.stringify(requestForSceneChirho(jobChirho, rowChirho.task_uuid_chirho))
				) !== rowChirho.request_sha256_chirho
			)
				throw new Error('Saved generation identity changed');
			if (
				rowChirho.state_chirho === 'received' &&
				sha256Chirho(await readFileChirho(joinChirho(homeChirho, rowChirho.asset_file_chirho!))) !==
					rowChirho.sha256_chirho
			)
				throw new Error('Saved comparison image changed');
		}
		if (!applyChirho)
			return {
				dry_run_chirho: true,
				planned_chirho: 31,
				requested_chirho: receiptsChirho.length,
				received_chirho: receiptsChirho.filter((rowChirho) => rowChirho.state_chirho === 'received')
					.length
			};
		const spaceChirho = await statfsChirho(rootChirho);
		if (spaceChirho.bavail * spaceChirho.bsize < 2 * 1024 ** 3)
			throw new Error('Storage floor reached');
		const unresolvedChirho = receiptsChirho.filter(
			(rowChirho) => rowChirho.state_chirho === 'requested' && !rowChirho.response_chirho
		);
		for (const rowChirho of unresolvedChirho)
			mergeResponseChirho(
				receiptsChirho,
				await callChirho(
					[{ taskType: 'getResponse', taskUUID: rowChirho.task_uuid_chirho }],
					fetchChirho
				)
			);
		await writeChirho(pathChirho, JSON.stringify(receiptsChirho, null, 2) + '\n');
		let dispatchedChirho = 0;
		while (true) {
			for (const rowChirho of receiptsChirho.filter(
				(rowChirho) => rowChirho.state_chirho === 'requested' && rowChirho.response_chirho
			)) {
				await downloadSceneChirho(
					homeChirho,
					planChirho.jobs_chirho.find(
						(jobChirho) => jobChirho.lesson_id_chirho === rowChirho.lesson_id_chirho
					)!,
					rowChirho,
					fetchChirho
				);
				await writeChirho(pathChirho, JSON.stringify(receiptsChirho, null, 2) + '\n');
			}
			const pendingChirho = planChirho.jobs_chirho
				.filter(
					(jobChirho) =>
						!receiptsChirho.some(
							(rowChirho) => rowChirho.lesson_id_chirho === jobChirho.lesson_id_chirho
						)
				)
				.slice(0, Math.min(3, limitChirho - dispatchedChirho));
			if (!pendingChirho.length) break;
			await dispatchScenesChirho(
				homeChirho,
				planChirho,
				receiptsChirho,
				pendingChirho,
				fetchChirho
			);
			dispatchedChirho += pendingChirho.length;
			console.log(
				JSON.stringify({
					requested_chirho: receiptsChirho.length,
					received_chirho: receiptsChirho.filter(
						(rowChirho) => rowChirho.state_chirho === 'received'
					).length
				})
			);
		}
		return {
			requested_chirho: receiptsChirho.length,
			received_chirho: receiptsChirho.filter((rowChirho) => rowChirho.state_chirho === 'received')
				.length,
			actual_cost_usd_chirho: receiptsChirho.reduce(
				(sumChirho, rowChirho) => sumChirho + Number(rowChirho.response_chirho?.cost ?? 0),
				0
			),
			held_chirho: receiptsChirho.filter((rowChirho) => rowChirho.state_chirho !== 'received')
				.length
		};
	} finally {
		await releaseChirho();
	}
}
if (import.meta.main) {
	const argumentsChirho = process.argv.slice(2),
		indexChirho = argumentsChirho.indexOf('--limit-chirho');
	if (
		argumentsChirho.some(
			(valueChirho, numberChirho) =>
				!['--apply-chirho', '--limit-chirho'].includes(valueChirho) &&
				argumentsChirho[numberChirho - 1] !== '--limit-chirho'
		)
	)
		throw new Error('Unsupported comparison argument');
	console.log(
		JSON.stringify(
			await runComparisonChirho(
				resolveChirho('.'),
				argumentsChirho.includes('--apply-chirho'),
				indexChirho < 0 ? 31 : Number(argumentsChirho[indexChirho + 1])
			)
		)
	);
}
