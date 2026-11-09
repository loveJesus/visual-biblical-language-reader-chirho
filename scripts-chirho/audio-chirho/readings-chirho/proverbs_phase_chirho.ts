// For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life. — John 3:16 (KJV)
// Workflow: verse-media-chirho.md. Exact remaining cuts from the twelve already-proved sources.
import { open as openChirho } from 'node:fs/promises';
import { join as joinChirho } from 'node:path';
import { isDeepStrictEqual as isDeepStrictEqualChirho } from 'node:util';
import { sha256Chirho } from '../audition_chirho';
import { boundedReadChirho } from '../local-greek-chirho/phase_chirho';
import {
	BEERI_RUN_CHIRHO,
	ownedDirectoryChirho,
	type BoundedPhaseChirho
} from './bounded_plan_chirho';
import {
	CORRECTION_PATH_CHIRHO,
	CORRECTION_SHA_CHIRHO,
	decodeOpeningDefinitionChirho,
	correctedOpeningWindowChirho,
	type OpeningDefinitionChirho,
	type OpeningCorrectionChirho,
	type CorrectionReadingChirho,
	type ReadingPlanGroupChirho
} from './correction_chirho';

export const PROVERBS_PHASE_CHIRHO = 'proverbs-remainder-v1-chirho';
export const PROVERBS_HOME_CHIRHO = `${BEERI_RUN_CHIRHO}/${PROVERBS_PHASE_CHIRHO}`;
export const PROVERBS_DEFINITION_PATH_CHIRHO =
	'data-chirho/audio-chirho/beeri-proverbs-remainder-chirho.json';
export const PROVERBS_DEFINITION_SHA_CHIRHO =
	'51c19d8ddd8e2f8e6413de0def2289a5414a39677d9d17888dfa5cf0490834b7';
interface ProverbsWindowChirho {
	lesson_id_chirho: string;
	start_chirho: number;
	end_chirho: number;
	canonical_sha256_chirho: string;
	spoken_sha256_chirho: string;
}
export interface ProverbsDefinitionChirho extends OpeningDefinitionChirho {
	opening_definition_sha256_chirho: string;
	added_readings_chirho: number;
	chapters_chirho: (OpeningCorrectionChirho & { windows_chirho: ProverbsWindowChirho[] })[];
}
export function decodeProverbsDefinitionChirho(bytesChirho: Uint8Array): ProverbsDefinitionChirho {
	if (sha256Chirho(bytesChirho) !== PROVERBS_DEFINITION_SHA_CHIRHO)
		throw Error('Finite remaining-Proverbs definition changed');
	return JSON.parse(new TextDecoder().decode(bytesChirho)) as ProverbsDefinitionChirho;
}
export async function loadProverbsDefinitionChirho(rootChirho: string) {
	const definitionChirho = decodeProverbsDefinitionChirho(
		await boundedReadChirho(rootChirho, PROVERBS_DEFINITION_PATH_CHIRHO, 256_000)
	);
	const openingChirho = decodeOpeningDefinitionChirho(
		await boundedReadChirho(rootChirho, CORRECTION_PATH_CHIRHO, 32_000)
	);
	const chaptersChirho = definitionChirho.chapters_chirho.map(
		({ windows_chirho: windowsChirho, ...chapterChirho }) => {
			if (
				windowsChirho.length !== chapterChirho.source_verses_chirho - 1 ||
				windowsChirho.some(
					(rowChirho, indexChirho) =>
						rowChirho.lesson_id_chirho !== `Prov.${chapterChirho.chapter_chirho}.${indexChirho + 2}`
				)
			)
				throw Error('Finite remaining-Proverbs membership differs');
			return chapterChirho;
		}
	);
	const priorBytesChirho = await boundedReadChirho(
		rootChirho,
		definitionChirho.prior_plan_path_chirho,
		4_000_000
	);
	if (
		definitionChirho.phase_chirho !== PROVERBS_PHASE_CHIRHO ||
		definitionChirho.added_readings_chirho !== 342 ||
		definitionChirho.prior_proverbs_readings_chirho !== 573 ||
		definitionChirho.opening_definition_sha256_chirho !== CORRECTION_SHA_CHIRHO ||
		!isDeepStrictEqualChirho(chaptersChirho, openingChirho.chapters_chirho) ||
		(
			[
				'source_evidence_sha256_chirho',
				'gbt_id_chirho',
				'package_sha256_chirho',
				'timings_sha256_chirho',
				'manifest_sha256_chirho',
				'source_text_chirho'
			] as const
		).some(
			(keyChirho) => !isDeepStrictEqualChirho(definitionChirho[keyChirho], openingChirho[keyChirho])
		) ||
		sha256Chirho(
			await boundedReadChirho(
				rootChirho,
				definitionChirho.source_text_chirho.path_chirho,
				4_000_000
			)
		) !== definitionChirho.source_text_chirho.sha256_chirho ||
		sha256Chirho(priorBytesChirho) !== definitionChirho.prior_plan_sha256_chirho
	)
		throw Error('Remaining-Proverbs source or prior plan changed');
	return {
		definition_chirho: definitionChirho,
		prior_plan_chirho: JSON.parse(priorBytesChirho.toString()) as ReadingPlanGroupChirho[]
	};
}
/** A pinned opening's spoken hash cannot be reconstructed from its hash; this adapter receives its exact canonical source text. */
export function verifyProverbsWindowChirho(
	definitionChirho: ProverbsDefinitionChirho,
	readingChirho: CorrectionReadingChirho,
	timingsChirho: Uint8Array,
	probeChirho: { sha256_chirho: string; duration_chirho: number },
	openingTextChirho: string
) {
	const chapterChirho = definitionChirho.chapters_chirho.find(
		(rowChirho) => rowChirho.chapter_chirho === Number(readingChirho.lesson_id_chirho.split('.')[1])
	);
	const windowChirho = chapterChirho?.windows_chirho.find(
		(rowChirho) => rowChirho.lesson_id_chirho === readingChirho.lesson_id_chirho
	);
	if (!chapterChirho || !windowChirho) throw Error('Verse outside finite remaining-Proverbs phase');
	correctedOpeningWindowChirho(
		definitionChirho,
		{
			...readingChirho,
			lesson_id_chirho: chapterChirho.lesson_id_chirho,
			canonical_sha256_chirho: chapterChirho.canonical_sha256_chirho,
			text_chirho: openingTextChirho,
			source_chirho: {
				...readingChirho.source_chirho,
				start_chirho: 0,
				end_chirho: chapterChirho.end_chirho
			}
		},
		timingsChirho,
		probeChirho
	);
	const startsChirho: number[] = [];
	const bytesChirho = Buffer.from(timingsChirho);
	for (let offsetChirho = 0; offsetChirho < bytesChirho.length; offsetChirho += 11)
		if (bytesChirho[offsetChirho + 1] === chapterChirho.chapter_chirho)
			startsChirho.push(bytesChirho.readUInt32BE(offsetChirho + 3) / 100);
	const indexChirho = Number(readingChirho.lesson_id_chirho.split('.')[2]) - 2;
	if (
		readingChirho.canonical_sha256_chirho !== windowChirho.canonical_sha256_chirho ||
		sha256Chirho(readingChirho.text_chirho) !== windowChirho.spoken_sha256_chirho ||
		readingChirho.source_chirho.start_chirho !== windowChirho.start_chirho ||
		readingChirho.source_chirho.end_chirho !== windowChirho.end_chirho ||
		windowChirho.start_chirho !== startsChirho[indexChirho] ||
		windowChirho.end_chirho !== (startsChirho[indexChirho + 1] ?? probeChirho.duration_chirho)
	)
		throw Error('Remaining-Proverbs exact verse/window changed');
	return { start_chirho: windowChirho.start_chirho, end_chirho: windowChirho.end_chirho };
}
export async function prepareProverbsPhaseChirho(rootChirho: string): Promise<BoundedPhaseChirho> {
	const { definition_chirho: definitionChirho } = await loadProverbsDefinitionChirho(rootChirho);
	const chaptersChirho = [];
	for (const chapterChirho of definitionChirho.chapters_chirho) {
		const pathChirho = `${PROVERBS_HOME_CHIRHO}/books-chirho/proverbs-chirho/chapters-chirho/${String(chapterChirho.chapter_chirho).padStart(3, '0')}-chirho/manifest-chirho.json`;
		const bytesChirho = await boundedReadChirho(rootChirho, pathChirho, 4_000_000);
		const valueChirho = JSON.parse(bytesChirho.toString()) as {
			content_sha256_chirho: string;
			recordings_chirho: CorrectionReadingChirho[];
		};
		if (
			valueChirho.content_sha256_chirho !== chapterChirho.content_sha256_chirho ||
			!Array.isArray(valueChirho.recordings_chirho) ||
			!isDeepStrictEqualChirho(
				valueChirho.recordings_chirho.map((rowChirho) => rowChirho.lesson_id_chirho),
				chapterChirho.windows_chirho.map((rowChirho) => rowChirho.lesson_id_chirho)
			)
		)
			throw Error('Prepared remaining-Proverbs membership differs');
		chaptersChirho.push({
			book_id_chirho: 'Prov',
			chapter_chirho: chapterChirho.chapter_chirho,
			prepared_manifest_path_chirho: pathChirho,
			prepared_manifest_sha256_chirho: sha256Chirho(bytesChirho),
			canonical_chapter_sha256_chirho: chapterChirho.content_sha256_chirho,
			source_chapter_sha256_chirho: chapterChirho.chapter_sha256_chirho,
			readings_chirho: valueChirho.recordings_chirho.length
		});
	}
	if (
		chaptersChirho.length !== 12 ||
		chaptersChirho.reduce((sumChirho, rowChirho) => sumChirho + rowChirho.readings_chirho, 0) !==
			342
	)
		throw Error('Remaining-Proverbs finite count differs');
	return {
		id_chirho: PROVERBS_PHASE_CHIRHO,
		chapters_chirho: chaptersChirho,
		readings_chirho: 342
	};
}
export async function readProverbsPhaseChirho(rootChirho: string): Promise<BoundedPhaseChirho> {
	const phaseChirho = JSON.parse(
		(
			await boundedReadChirho(rootChirho, `${PROVERBS_HOME_CHIRHO}/plan-chirho.json`, 32_000)
		).toString()
	) as BoundedPhaseChirho;
	if (!isDeepStrictEqualChirho(phaseChirho, await prepareProverbsPhaseChirho(rootChirho)))
		throw Error('Frozen remaining-Proverbs phase differs');
	return phaseChirho;
}
export async function freezeProverbsPhaseChirho(rootChirho: string) {
	const phaseChirho = await prepareProverbsPhaseChirho(rootChirho);
	await ownedDirectoryChirho(rootChirho, PROVERBS_HOME_CHIRHO);
	let fileChirho;
	try {
		fileChirho = await openChirho(
			joinChirho(rootChirho, PROVERBS_HOME_CHIRHO, 'plan-chirho.json'),
			'wx'
		);
	} catch (errorChirho) {
		if ((errorChirho as NodeJS.ErrnoException).code !== 'EEXIST') throw errorChirho;
		return readProverbsPhaseChirho(rootChirho);
	}
	try {
		await fileChirho.writeFile(JSON.stringify(phaseChirho, null, 2) + '\n');
		await fileChirho.sync();
	} finally {
		await fileChirho.close();
	}
	const directoryChirho = await openChirho(joinChirho(rootChirho, PROVERBS_HOME_CHIRHO), 'r');
	try {
		await directoryChirho.sync();
	} finally {
		await directoryChirho.close();
	}
	return phaseChirho;
}
/** All 573 earlier human objects stay exact. New rows must be one of this phase's validated clips. */
export async function verifyPriorProverbsChirho(
	rootChirho: string,
	groupsChirho: { rows_chirho: { clip_chirho: Record<string, unknown> }[] }[],
	completeChirho: boolean,
	sourceChirho: {
		definition_chirho: ProverbsDefinitionChirho;
		prior_plan_chirho: ReadingPlanGroupChirho[];
	}
) {
	const { definition_chirho: definitionChirho, prior_plan_chirho: priorChirho } = sourceChirho;
	const expectedChirho = new Map(
		[
			...priorChirho.flatMap((rowChirho) => rowChirho.clips_chirho),
			...groupsChirho.flatMap((groupChirho) =>
				groupChirho.rows_chirho.map((rowChirho) => rowChirho.clip_chirho)
			)
		].map((rowChirho) => [rowChirho.id_chirho, rowChirho])
	);
	const priorIdsChirho = new Set(
		priorChirho
			.flatMap((rowChirho) => rowChirho.clips_chirho)
			.map((rowChirho) => rowChirho.id_chirho)
	);
	const indexChirho = JSON.parse(
		(
			await boundedReadChirho(rootChirho, 'static/audio-chirho/manifest-chirho.json', 2_000_000)
		).toString()
	);
	const seenChirho = new Set<unknown>();
	for (const groupChirho of priorChirho) {
		const bytesChirho = await boundedReadChirho(
			rootChirho,
			`static${groupChirho.path_chirho}`,
			2_000_000
		);
		const entriesChirho = indexChirho.books_chirho.Prov.chapters_chirho.filter(
			(rowChirho: { path_chirho: string }) => rowChirho.path_chirho === groupChirho.path_chirho
		);
		if (entriesChirho.length !== 1 || entriesChirho[0].sha256_chirho !== sha256Chirho(bytesChirho))
			throw Error('Prior Proverbs chapter index differs');
		const chapterChirho = JSON.parse(bytesChirho.toString());
		if (!Array.isArray(chapterChirho.readings_chirho))
			throw Error('Prior Proverbs readings absent');
		for (const clipChirho of chapterChirho.readings_chirho as Record<string, unknown>[]) {
			if (
				seenChirho.has(clipChirho.id_chirho) ||
				!isDeepStrictEqualChirho(expectedChirho.get(clipChirho.id_chirho), clipChirho)
			)
				throw Error('Prior Proverbs reading or finite membership changed');
			seenChirho.add(clipChirho.id_chirho);
		}
	}
	if (
		priorIdsChirho.size !== definitionChirho.prior_proverbs_readings_chirho ||
		[...priorIdsChirho].some((idChirho) => !seenChirho.has(idChirho)) ||
		(completeChirho &&
			(seenChirho.size !== expectedChirho.size ||
				[...expectedChirho.keys()].some((idChirho) => !seenChirho.has(idChirho))))
	)
		throw Error('Prior Proverbs phase incomplete');
}
if (import.meta.main) {
	const argumentsChirho = process.argv.slice(2);
	if (
		argumentsChirho.length > 1 ||
		argumentsChirho.some((argumentChirho) => argumentChirho !== '--freeze-chirho')
	)
		throw Error('Expected only optional --freeze-chirho');
	const phaseChirho = argumentsChirho.length
		? await freezeProverbsPhaseChirho(process.cwd())
		: await prepareProverbsPhaseChirho(process.cwd());
	console.log(
		JSON.stringify({
			phase_chirho: phaseChirho.id_chirho,
			readings_chirho: phaseChirho.readings_chirho,
			chapters_chirho: phaseChirho.chapters_chirho.length,
			frozen_chirho: argumentsChirho.length === 1
		})
	);
}
