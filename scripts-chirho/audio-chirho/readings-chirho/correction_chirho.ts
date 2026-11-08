// For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life. — John 3:16 (KJV)
// Workflow: verse-media-chirho.md. Exact source-bound openings; no general timing shift.
import { readFile as readFileChirho } from 'node:fs/promises';
import { createHash as createHashChirho } from 'node:crypto';
import { join as joinChirho } from 'node:path';
import { isDeepStrictEqual as isDeepStrictEqualChirho } from 'node:util';

export const OPENING_PHASE_CHIRHO = 'proverbs-openings-v1-chirho';
export const CORRECTION_PATH_CHIRHO =
	'data-chirho/audio-chirho/beeri-opening-corrections-chirho.json';
export const CORRECTION_SHA_CHIRHO =
	'16daf1b1fadd6c4a73b4355f12e3a7365f4df848b3f33df76db88a14d5a2caa8';
export interface OpeningCorrectionChirho {
	lesson_id_chirho: string;
	chapter_chirho: number;
	content_path_chirho: string;
	content_sha256_chirho: string;
	canonical_sha256_chirho: string;
	spoken_sha256_chirho: string;
	chapter_sha256_chirho: string;
	chapter_duration_chirho: number;
	source_verses_chirho: number;
	timed_records_chirho: number;
	start_chirho: number;
	end_chirho: number;
}
export interface OpeningDefinitionChirho {
	phase_chirho: string;
	source_evidence_sha256_chirho: string;
	gbt_id_chirho: string;
	package_sha256_chirho: string;
	timings_sha256_chirho: string;
	manifest_sha256_chirho: string;
	source_text_chirho: { path_chirho: string; sha256_chirho: string };
	prior_plan_path_chirho: string;
	prior_plan_sha256_chirho: string;
	prior_proverbs_readings_chirho: number;
	chapters_chirho: OpeningCorrectionChirho[];
}
export interface CorrectionReadingChirho {
	lesson_id_chirho: string;
	text_chirho: string;
	canonical_sha256_chirho: string;
	content_path_chirho: string;
	content_sha256_chirho: string;
	source_correction_sha256_chirho?: string;
	source_chirho: {
		gbt_id_chirho: string;
		package_sha256_chirho: string;
		timings_sha256_chirho: string;
		manifest_sha256_chirho: string;
		chapter_sha256_chirho: string;
		chapter_duration_chirho: number;
		start_chirho: number;
		end_chirho: number;
	};
}
export interface ReadingPlanGroupChirho {
	path_chirho: string;
	clips_chirho: Record<string, unknown>[];
}
const digestChirho = (bytesChirho: Uint8Array | string): string =>
	createHashChirho('sha256').update(bytesChirho).digest('hex');

export function decodeOpeningDefinitionChirho(bytesChirho: Uint8Array): OpeningDefinitionChirho {
	if (digestChirho(bytesChirho) !== CORRECTION_SHA_CHIRHO)
		throw Error('Finite correction record changed');
	return JSON.parse(new TextDecoder().decode(bytesChirho)) as OpeningDefinitionChirho;
}

/** The original plan remains immutable, and is the before-image for the new finite phase. */
export async function loadOpeningDefinitionChirho(rootChirho: string, phaseChirho: string) {
	if (phaseChirho !== OPENING_PHASE_CHIRHO) throw Error('Unknown human-reading phase');
	const definitionChirho = decodeOpeningDefinitionChirho(
		await readFileChirho(joinChirho(rootChirho, CORRECTION_PATH_CHIRHO))
	);
	const priorBytesChirho = await readFileChirho(
		joinChirho(rootChirho, definitionChirho.prior_plan_path_chirho)
	);
	if (
		digestChirho(
			await readFileChirho(joinChirho(rootChirho, definitionChirho.source_text_chirho.path_chirho))
		) !== definitionChirho.source_text_chirho.sha256_chirho ||
		digestChirho(priorBytesChirho) !== definitionChirho.prior_plan_sha256_chirho
	)
		throw Error('Corrected opening source text or prior install plan changed');
	return {
		definition_chirho: definitionChirho,
		prior_plan_chirho: JSON.parse(priorBytesChirho.toString('utf8')) as ReadingPlanGroupChirho[]
	};
}

/** Returns null for ordinary existing readings; a correction marker never falls through. */
export function correctedOpeningWindowChirho(
	definitionChirho: OpeningDefinitionChirho | null,
	readingChirho: CorrectionReadingChirho,
	timingsChirho: Uint8Array,
	probeChirho: { sha256_chirho: string; duration_chirho: number }
): { start_chirho: number; end_chirho: number } | null {
	const expectedChirho = definitionChirho?.chapters_chirho.find(
		(rowChirho) => rowChirho.lesson_id_chirho === readingChirho.lesson_id_chirho
	);
	if (!readingChirho.source_correction_sha256_chirho && !expectedChirho) return null;
	if (
		!definitionChirho ||
		!expectedChirho ||
		readingChirho.source_correction_sha256_chirho !== definitionChirho.source_evidence_sha256_chirho
	)
		throw Error('Expected the exact corrected opening phase and evidence');
	if (
		readingChirho.content_path_chirho !== expectedChirho.content_path_chirho ||
		readingChirho.content_sha256_chirho !== expectedChirho.content_sha256_chirho ||
		readingChirho.canonical_sha256_chirho !== expectedChirho.canonical_sha256_chirho ||
		digestChirho(readingChirho.text_chirho) !== expectedChirho.spoken_sha256_chirho ||
		probeChirho.sha256_chirho !== expectedChirho.chapter_sha256_chirho ||
		probeChirho.duration_chirho !== expectedChirho.chapter_duration_chirho ||
		readingChirho.source_chirho.chapter_sha256_chirho !== expectedChirho.chapter_sha256_chirho ||
		readingChirho.source_chirho.chapter_duration_chirho !==
			expectedChirho.chapter_duration_chirho ||
		digestChirho(timingsChirho) !== definitionChirho.timings_sha256_chirho ||
		(
			[
				'gbt_id_chirho',
				'package_sha256_chirho',
				'timings_sha256_chirho',
				'manifest_sha256_chirho'
			] as const
		).some((keyChirho) => readingChirho.source_chirho[keyChirho] !== definitionChirho[keyChirho])
	)
		throw Error('Finite opening canonical or source evidence changed');
	if (timingsChirho.length % 11) throw Error('Torn opening timing record');
	const bytesChirho = Buffer.from(timingsChirho);
	const labelsChirho: number[] = [];
	let firstStartChirho: number | null = null;
	for (let offsetChirho = 0; offsetChirho < bytesChirho.length; offsetChirho += 11) {
		if (bytesChirho[offsetChirho + 1] !== expectedChirho.chapter_chirho) continue;
		if (bytesChirho[offsetChirho] !== 20) throw Error('Foreign opening timing book');
		labelsChirho.push(bytesChirho[offsetChirho + 2]);
		firstStartChirho ??= bytesChirho.readUInt32BE(offsetChirho + 3) / 100;
	}
	if (
		labelsChirho.length !== expectedChirho.timed_records_chirho ||
		labelsChirho.length !== expectedChirho.source_verses_chirho - 1 ||
		labelsChirho.some((labelChirho, indexChirho) => labelChirho !== indexChirho + 1) ||
		firstStartChirho !== expectedChirho.end_chirho ||
		readingChirho.source_chirho.start_chirho !== 0 ||
		readingChirho.source_chirho.end_chirho !== expectedChirho.end_chirho
	)
		throw Error('Finite opening timing pattern or cut window changed');
	return { start_chirho: 0, end_chirho: expectedChirho.end_chirho };
}

/** One new phase contains every prior Proverbs reading unchanged and exactly the twelve additions. */
export function verifyOpeningPhaseChirho(
	definitionChirho: OpeningDefinitionChirho,
	priorPlanChirho: ReadingPlanGroupChirho[],
	nextPlanChirho: ReadingPlanGroupChirho[]
): void {
	const previousChirho = priorPlanChirho
		.filter((groupChirho) => groupChirho.path_chirho.startsWith('/audio-chirho/proverbs-chirho/'))
		.flatMap((groupChirho) => groupChirho.clips_chirho);
	const nextChirho = nextPlanChirho.flatMap((groupChirho) => groupChirho.clips_chirho);
	const oldByIdChirho = new Map(
		previousChirho.map((clipChirho) => [clipChirho.id_chirho, clipChirho])
	);
	const addedIdsChirho = new Set(
		definitionChirho.chapters_chirho.map((rowChirho) => rowChirho.lesson_id_chirho)
	);
	const seenChirho = new Set<unknown>();
	if (
		previousChirho.length !== definitionChirho.prior_proverbs_readings_chirho ||
		oldByIdChirho.size !== previousChirho.length ||
		nextChirho.length !== previousChirho.length + addedIdsChirho.size ||
		nextPlanChirho.some(
			(groupChirho) => !groupChirho.path_chirho.startsWith('/audio-chirho/proverbs-chirho/')
		)
	)
		throw Error('Corrected opening phase membership changed');
	for (const clipChirho of nextChirho) {
		if (seenChirho.has(clipChirho.id_chirho)) throw Error('Duplicate phase reading');
		seenChirho.add(clipChirho.id_chirho);
		const oldChirho = oldByIdChirho.get(clipChirho.id_chirho);
		if (oldChirho) {
			if (!isDeepStrictEqualChirho(oldChirho, clipChirho))
				throw Error('A prior human reading changed');
		} else if (!addedIdsChirho.delete(String(clipChirho.lesson_id_chirho)))
			throw Error('Unexpected corrected opening reading');
	}
	if (
		addedIdsChirho.size ||
		[...oldByIdChirho.keys()].some((idChirho) => !seenChirho.has(idChirho))
	)
		throw Error('Corrected opening phase is incomplete');
}
