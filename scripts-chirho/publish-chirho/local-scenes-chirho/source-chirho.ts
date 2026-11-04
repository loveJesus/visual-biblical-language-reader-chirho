// For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life. — John 3:16 (KJV)
// Workflow: media-delivery-chirho.md, local placeholder preservation.
import { constants as constantsChirho } from 'node:fs';
import { open as openChirho, realpath as realpathChirho } from 'node:fs/promises';
import { join as joinChirho, resolve as resolveChirho } from 'node:path';
import { digestChirho } from '../r2-chirho/object-store-chirho';

export const RUN_CHIRHO = 'workspace-chirho/art-chirho/mark-schnell-2026-11-04-chirho';
export const STAGE_CHIRHO = 'build-chirho/local-scenes-chirho/mark-schnell-2026-11-04-chirho';
export const MAX_PNG_BYTES_CHIRHO = 25 * 1024 ** 2;
export interface BoundJobChirho {
	provider_chirho?: 'runware';
	model_chirho?: 'runware:100@1';
	repair_pass_chirho?: 2 | 3 | 4;
	job_id_chirho: string;
	verse_id_chirho: string;
	prompt_chirho: string;
	prompt_sha256_chirho: string;
	jesus_presence_chirho: 'absent' | 'offscreen' | 'hand';
	seed_chirho: number;
	output_chirho: string;
	job_sha256_chirho: string;
	chapter_path_chirho: string;
	chapter_sha256_chirho: string;
	canonical_sha256_chirho: string;
	snapshot_sha256_chirho: string;
}
export interface CompletedJobChirho {
	replacement_chirho?: {
		previous_png_sha256_chirho: string;
		previous_record_sha256_chirho: string;
		journal_sha256_chirho: string;
	};
	pixel_hold_chirho?: 'blackOutput';
	provider_refusal_chirho?: { prior_record_sha256_chirho: string; journal_sha256_chirho: string };
	job_chirho: BoundJobChirho;
	output_sha256_chirho: string;
	record_sha256_chirho: string;
}
export function recordChirho(valueChirho: unknown): Record<string, unknown> {
	if (!valueChirho || typeof valueChirho !== 'object' || Array.isArray(valueChirho))
		throw new Error('Expected a record');
	return valueChirho as Record<string, unknown>;
}
export function rowsChirho(valueChirho: unknown): Record<string, unknown>[] {
	if (!Array.isArray(valueChirho)) throw new Error('Expected rows');
	return valueChirho.map(recordChirho);
}
export async function readBoundedChirho(pathChirho: string, maximumChirho: number) {
	if ((await realpathChirho(pathChirho)) !== resolveChirho(pathChirho))
		throw new Error('Linked scene input refused');
	const fileChirho = await openChirho(
		pathChirho,
		constantsChirho.O_RDONLY | constantsChirho.O_NOFOLLOW
	);
	try {
		const statChirho = await fileChirho.stat();
		if (!statChirho.isFile() || statChirho.size > maximumChirho)
			throw new Error('Scene input is not a bounded regular file');
		const bytesChirho = await fileChirho.readFile();
		if (bytesChirho.length !== statChirho.size || bytesChirho.length > maximumChirho)
			throw new Error('Scene input changed while reading');
		return bytesChirho;
	} finally {
		await fileChirho.close();
	}
}
export async function optionalReadChirho(pathChirho: string, maximumChirho: number) {
	try {
		return await readBoundedChirho(pathChirho, maximumChirho);
	} catch (errorChirho) {
		if ((errorChirho as NodeJS.ErrnoException).code === 'ENOENT') return null;
		throw errorChirho;
	}
}
export function completeLinesChirho(bytesChirho: Uint8Array): string[] {
	const textChirho = Buffer.from(bytesChirho).toString('utf8');
	return textChirho
		.slice(0, textChirho.lastIndexOf('\n') + 1)
		.split('\n')
		.filter(Boolean);
}

/** Bind child jobs to the shipped chapter and the exact source snapshot used for prompts. */
export async function loadChapterChirho(rootChirho: string, chapterChirho: number) {
	if (!Number.isInteger(chapterChirho) || chapterChirho < 1 || chapterChirho > 16)
		throw new Error('Mark chapter refused');
	const paddedChirho = String(chapterChirho).padStart(2, '0');
	const runChirho = joinChirho(rootChirho, RUN_CHIRHO);
	const jobsBytesChirho = await optionalReadChirho(
		joinChirho(runChirho, `jobs-chirho/chapter-${paddedChirho}-jobs-chirho.jsonl`),
		1024 ** 2
	);
	if (!jobsBytesChirho) return null;
	if (jobsBytesChirho.at(-1) !== 10) throw new Error('Job plan is incomplete');
	const manifestChirho = recordChirho(
		JSON.parse(
			(
				await readBoundedChirho(
					joinChirho(rootChirho, 'static/content-chirho/mark-chirho/manifest-chirho.json'),
					128 * 1024
				)
			).toString()
		)
	);
	const entryChirho = rowsChirho(manifestChirho.chapters_chirho).find(
		(rowChirho) => rowChirho.number_chirho === chapterChirho
	);
	const chapterPathChirho = `/content-chirho/mark-chirho/chapter-${paddedChirho}-chirho.json`;
	if (manifestChirho.book_id_chirho !== 'Mark' || entryChirho?.path_chirho !== chapterPathChirho)
		throw new Error('Chapter manifest binding differs');
	const chapterBytesChirho = await readBoundedChirho(
		joinChirho(rootChirho, 'static', chapterPathChirho),
		8 * 1024 ** 2
	);
	const chapterShaChirho = digestChirho(chapterBytesChirho);
	if (entryChirho.sha256_chirho !== chapterShaChirho)
		throw new Error('Source chapter hash differs');
	const sourceChirho = recordChirho(JSON.parse(chapterBytesChirho.toString()));
	if (sourceChirho.book_id_chirho !== 'Mark' || sourceChirho.chapter_chirho !== chapterChirho)
		throw new Error('Source chapter identity differs');
	const versesChirho = rowsChirho(sourceChirho.verses_chirho);
	if (versesChirho.length !== entryChirho.verse_count_chirho)
		throw new Error('Source count differs');
	const snapshotBytesChirho = await readBoundedChirho(
		joinChirho(runChirho, `verses-chirho/chapter-${paddedChirho}-verses-chirho.json`),
		1024 ** 2
	);
	const snapshotChirho = rowsChirho(JSON.parse(snapshotBytesChirho.toString()));
	const jobsChirho = completeLinesChirho(jobsBytesChirho);
	if (snapshotChirho.length !== versesChirho.length || jobsChirho.length !== versesChirho.length)
		throw new Error('Snapshot or plan coverage differs');
	const boundChirho = new Map<string, BoundJobChirho>();
	for (const [indexChirho, verseChirho] of versesChirho.entries()) {
		const savedChirho = snapshotChirho[indexChirho];
		const jobChirho = recordChirho(JSON.parse(jobsChirho[indexChirho]));
		const idChirho = String(verseChirho.id_chirho);
		if (
			!new RegExp(`^Mark\\.${chapterChirho}\\.[1-9][0-9]{0,2}$`, 'u').test(idChirho) ||
			typeof verseChirho.canonical_text_chirho !== 'string' ||
			verseChirho.language_chirho !== 'grc'
		)
			throw new Error('Source verse identity differs');
		const glossChirho = rowsChirho(verseChirho.tokens_chirho)
			.map((tokenChirho) => tokenChirho.gloss_chirho)
			.filter(
				(glossChirho) =>
					typeof glossChirho === 'string' && glossChirho !== '' && glossChirho !== '-'
			)
			.join(' ');
		if (
			savedChirho.verse_id_chirho !== idChirho ||
			savedChirho.reference_chirho !== verseChirho.reference_chirho ||
			savedChirho.word_glosses_in_greek_order_chirho !== glossChirho ||
			jobChirho.verse_id_chirho !== idChirho
		)
			throw new Error('Prompt snapshot no longer matches source');
		const verseNumberChirho = Number(idChirho.split('.')[2]);
		const jobIdChirho = `mark-${paddedChirho}-${String(verseNumberChirho).padStart(3, '0')}`;
		const seedChirho = 300000 + chapterChirho * 1000 + verseNumberChirho;
		const outputChirho = joinChirho(
			runChirho,
			`originals-chirho/chapter-${paddedChirho}/${jobIdChirho}-seed-${seedChirho}-schnell-q4-chirho.png`
		);
		const presenceChirho = jobChirho.jesus_presence_chirho;
		if (
			jobChirho.job_id_chirho !== jobIdChirho ||
			jobChirho.output_chirho !== outputChirho ||
			jobChirho.seed_chirho !== seedChirho ||
			jobChirho.steps_chirho !== 4 ||
			jobChirho.width_chirho !== 1024 ||
			jobChirho.height_chirho !== 768 ||
			typeof jobChirho.prompt_chirho !== 'string' ||
			jobChirho.prompt_chirho.length > 1500 ||
			digestChirho(jobChirho.prompt_chirho) !== jobChirho.prompt_sha256_chirho ||
			(presenceChirho !== 'absent' &&
				presenceChirho !== 'offscreen' &&
				presenceChirho !== 'hand') ||
			boundChirho.has(jobIdChirho)
		)
			throw new Error('Local job identity or recipe differs');
		boundChirho.set(jobIdChirho, {
			job_id_chirho: jobIdChirho,
			verse_id_chirho: idChirho,
			prompt_chirho: jobChirho.prompt_chirho,
			prompt_sha256_chirho: digestChirho(jobChirho.prompt_chirho),
			jesus_presence_chirho: presenceChirho,
			seed_chirho: seedChirho,
			output_chirho: outputChirho,
			job_sha256_chirho: digestChirho(jobsChirho[indexChirho]),
			chapter_path_chirho: chapterPathChirho,
			chapter_sha256_chirho: chapterShaChirho,
			canonical_sha256_chirho: digestChirho(verseChirho.canonical_text_chirho),
			snapshot_sha256_chirho: digestChirho(snapshotBytesChirho)
		});
	}
	return boundChirho;
}

export function completedJobsChirho(
	bytesChirho: Uint8Array,
	jobsChirho: Map<string, BoundJobChirho>
) {
	const completedChirho: CompletedJobChirho[] = [],
		heldChirho: string[] = [];
	const seenChirho = new Set<string>();
	for (const lineChirho of completeLinesChirho(bytesChirho)) {
		const rowChirho = recordChirho(JSON.parse(lineChirho));
		if (rowChirho.kind_chirho === 'loaded') continue;
		const jobChirho = jobsChirho.get(String(rowChirho.job_id_chirho));
		if (rowChirho.kind_chirho !== 'job' || !jobChirho || seenChirho.has(jobChirho.job_id_chirho))
			throw new Error('Unknown or repeated generation result');
		seenChirho.add(jobChirho.job_id_chirho);
		if (rowChirho.ok_chirho === false) {
			heldChirho.push(`${jobChirho.verse_id_chirho}: generation failed; original result retained`);
			continue;
		}
		if (
			rowChirho.ok_chirho !== true ||
			rowChirho.output_chirho !== jobChirho.output_chirho ||
			rowChirho.width_px_chirho !== 1024 ||
			rowChirho.height_px_chirho !== 768 ||
			typeof rowChirho.output_sha256_chirho !== 'string' ||
			!/^[a-f0-9]{64}$/u.test(rowChirho.output_sha256_chirho)
		)
			throw new Error('Completed output facts differ');
		if (
			jobChirho.provider_chirho === 'runware' &&
			(rowChirho.provider_chirho !== 'runware' ||
				rowChirho.model_chirho !== 'runware:100@1' ||
				!['task_uuid_chirho', 'image_uuid_chirho'].every(
					(fieldChirho) =>
						typeof rowChirho[fieldChirho] === 'string' &&
						/^[a-f0-9]{8}(?:-[a-f0-9]{4}){3}-[a-f0-9]{12}$/u.test(rowChirho[fieldChirho] as string)
				) ||
				typeof rowChirho.cost_usd_chirho !== 'number' ||
				!Number.isFinite(rowChirho.cost_usd_chirho) ||
				rowChirho.cost_usd_chirho < 0 ||
				(rowChirho.seed_returned_chirho !== null &&
					rowChirho.seed_returned_chirho !== undefined &&
					rowChirho.seed_returned_chirho !== jobChirho.seed_chirho))
		)
			throw new Error('Runware result identity differs');
		completedChirho.push({
			job_chirho: jobChirho,
			output_sha256_chirho: rowChirho.output_sha256_chirho,
			record_sha256_chirho: digestChirho(lineChirho)
		});
	}
	return { completed_chirho: completedChirho, held_chirho: heldChirho };
}
