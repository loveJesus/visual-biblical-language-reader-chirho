// For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life. — John 3:16 (KJV)
// Workflow: media-delivery-chirho.md. Consume existing provider results; never request generation.
import {
	lstat as lstatChirho,
	readFile as readFileChirho,
	realpath as realpathChirho
} from 'node:fs/promises';
import { join as joinChirho, resolve as resolveChirho } from 'node:path';
import {
	BIBLE_BOOKS_CHIRHO,
	type BibleBookChirho
} from '../../../../src/lib/bible-chirho/books-chirho';
import { digestChirho } from '../../r2-chirho/object-store-chirho';

export const RUN_CHIRHO = 'workspace-chirho/art-chirho/bible-schnell-2026-11-04-chirho';
export const STAGE_CHIRHO = 'build-chirho/provider-scenes-2026-11-04-chirho';
export const MANIFEST_CHIRHO = 'data-chirho/media-chirho/bible-runware-scenes-chirho.json';
export const PASSTHROUGH_RECIPE_CHIRHO = {
	format_chirho: 'webp',
	quality_chirho: 45,
	provider_chirho: 'runware',
	model_chirho: 'runware:100@1',
	operation_chirho: 'provider_passthrough'
} as const;
const SECTIONS_CHIRHO: readonly [string, readonly string[]][] = [
	['ot-1-law-chirho', ['Exod', 'Lev', 'Num', 'Deut']],
	[
		'ot-2-history-chirho',
		['Josh', 'Judg', 'Ruth', '1Sam', '2Sam', '1Kgs', '2Kgs', '1Chr', '2Chr', 'Ezra', 'Neh', 'Esth']
	],
	['ot-3-poetry-chirho', ['Job', 'Ps', 'Eccl', 'Song']],
	['ot-4-major-prophets-chirho', ['Isa', 'Jer', 'Lam', 'Ezek', 'Dan']],
	[
		'ot-5-minor-prophets-chirho',
		['Hos', 'Joel', 'Amos', 'Obad', 'Jonah', 'Mic', 'Nah', 'Hab', 'Zeph', 'Hag', 'Zech', 'Mal']
	],
	['nt-1-gospels-acts-chirho', ['Matt', 'Luke', 'Acts']],
	[
		'nt-2-pauline-chirho',
		[
			'Rom',
			'1Cor',
			'2Cor',
			'Gal',
			'Eph',
			'Phil',
			'Col',
			'1Thess',
			'2Thess',
			'1Tim',
			'2Tim',
			'Titus',
			'Phlm'
		]
	],
	[
		'nt-3-general-revelation-chirho',
		['Heb', '1Pet', '2Pet', '1John', '2John', '3John', 'Jude', 'Rev']
	],
	['nt-3-general-revelation-chirho', ['Jas']]
];
export function bookHomeChirho(bookChirho: BibleBookChirho) {
	const sectionChirho = SECTIONS_CHIRHO.find(([, idsChirho]) =>
		idsChirho.includes(bookChirho.id_chirho)
	)?.[0];
	if (!sectionChirho) throw new Error('Book is outside the remaining-scene scope');
	const numberChirho =
		BIBLE_BOOKS_CHIRHO.findIndex((valueChirho) => valueChirho.id_chirho === bookChirho.id_chirho) +
		1;
	return `${RUN_CHIRHO}/books-chirho/${sectionChirho}/${String(numberChirho).padStart(2, '0')}-${bookChirho.slug_chirho}`;
}
export const BOOKS_CHIRHO = BIBLE_BOOKS_CHIRHO.filter(
	(bookChirho) => !['Gen', 'Prov', 'John', 'Mark'].includes(bookChirho.id_chirho)
);

export async function readOwnedChirho(
	rootChirho: string,
	relativeChirho: string,
	maximumChirho: number,
	optionalChirho = false
) {
	if (
		!relativeChirho ||
		relativeChirho.startsWith('/') ||
		relativeChirho
			.split('/')
			.some((partChirho) => !partChirho || ['.', '..'].includes(partChirho)) ||
		relativeChirho.includes('\\')
	)
		throw new Error('Owned path escapes its root');
	const pathChirho = joinChirho(rootChirho, relativeChirho);
	let statChirho;
	try {
		statChirho = await lstatChirho(pathChirho);
	} catch (errorChirho) {
		if (optionalChirho && (errorChirho as NodeJS.ErrnoException).code === 'ENOENT') return null;
		throw errorChirho;
	}
	if (
		!statChirho.isFile() ||
		statChirho.size > maximumChirho ||
		(await realpathChirho(pathChirho)) !== resolveChirho(pathChirho)
	)
		throw new Error(
			`Owned record is oversized, linked or not regular: ${relativeChirho} (${statChirho.size} bytes; limit ${maximumChirho})`
		);
	const bytesChirho = await readFileChirho(pathChirho);
	if (bytesChirho.length > maximumChirho) throw new Error('Owned record grew beyond its bound');
	return bytesChirho;
}
export function linesChirho(bytesChirho: Uint8Array) {
	const textChirho = Buffer.from(bytesChirho).toString('utf8');
	const rowsChirho = textChirho.split('\n');
	rowsChirho.pop(); // No authority comes from a partial last line.
	return rowsChirho
		.filter((rowChirho) => rowChirho.trim())
		.map((rowChirho) => JSON.parse(rowChirho));
}
export interface JobChirho {
	job_id_chirho: string;
	book_id_chirho: string;
	chapter_chirho: number;
	verse_id_chirho: string;
	prompt_chirho: string;
	prompt_sha256_chirho: string;
	jesus_presence_chirho: string;
	seed_chirho: number;
	steps_chirho: number;
	width_chirho: number;
	height_chirho: number;
	output_format_chirho: string;
	output_quality_chirho: number;
	output_chirho: string;
	snapshot_sha256_chirho: string;
}
export interface ResultChirho {
	job_id_chirho: string;
	verse_id_chirho: string;
	attempt_chirho: number;
	task_uuid_chirho: string;
	image_uuid_chirho: string;
	provider_chirho: string;
	model_chirho: string;
	seed_returned_chirho: number;
	output_sha256_chirho: string;
	output_chirho: string;
	bytes_chirho: number;
	format_chirho: string;
	output_quality_chirho: number;
	width_px_chirho: number;
	height_px_chirho: number;
	ok_chirho: boolean;
	cost_usd_chirho: number;
}
interface TokenChirho {
	gloss_chirho?: string | null;
}
interface VerseChirho {
	id_chirho: string;
	reference_chirho: string;
	language_chirho: string;
	canonical_text_chirho: string;
	tokens_chirho: TokenChirho[];
}
export interface CompletedChirho {
	job_chirho: JobChirho;
	result_chirho: ResultChirho;
	content_path_chirho: string;
	content_sha256_chirho: string;
	canonical_sha256_chirho: string;
	request_sha256_chirho: string;
	selected_journal_sha256_chirho: string;
}
function pythonJsonChirho(valueChirho: unknown): string {
	if (valueChirho !== null && typeof valueChirho === 'object' && !Array.isArray(valueChirho))
		return (
			'{' +
			Object.entries(valueChirho)
				.sort(([leftChirho], [rightChirho]) => leftChirho.localeCompare(rightChirho))
				.map(
					([keyChirho, itemChirho]) =>
						pythonJsonChirho(keyChirho) + ': ' + pythonJsonChirho(itemChirho)
				)
				.join(', ') +
			'}'
		);
	if (Array.isArray(valueChirho)) return '[' + valueChirho.map(pythonJsonChirho).join(', ') + ']';
	return JSON.stringify(valueChirho).replace(
		/[\u007f-\uffff]/g,
		(characterChirho) => '\\u' + characterChirho.charCodeAt(0).toString(16).padStart(4, '0')
	);
}
export function requestHashChirho(jobChirho: JobChirho, taskUuidChirho: string) {
	return digestChirho(
		pythonJsonChirho({
			taskType: 'imageInference',
			taskUUID: taskUuidChirho,
			model: 'runware:100@1',
			positivePrompt: jobChirho.prompt_chirho,
			width: 1024,
			height: 768,
			steps: 4,
			CFGScale: 1,
			seed: jobChirho.seed_chirho,
			numberResults: 1,
			outputType: 'URL',
			outputFormat: 'WEBP',
			outputQuality: 45,
			includeCost: true
		})
	);
}
function echoChirho(valueChirho: string) {
	return valueChirho
		.toLowerCase()
		.replace(/[^\p{L}\p{N}_\s'-]/gu, ' ')
		.trim()
		.split(/\s+/u)
		.slice(-4)
		.join(' ');
}
export async function loadBookChirho(rootChirho: string, bookChirho: BibleBookChirho) {
	const homeChirho = bookHomeChirho(bookChirho);
	const journalBytesChirho = await readOwnedChirho(
		rootChirho,
		`${homeChirho}/records-chirho/journal-chirho.jsonl`,
		32 * 1024 ** 2,
		true
	);
	if (!journalBytesChirho)
		return {
			completed_chirho: [] as CompletedChirho[],
			expected_chirho: 0,
			complete_chirho: false
		};
	const journalChirho = linesChirho(journalBytesChirho);
	const tasksChirho = new Map<string, typeof journalChirho>();
	for (const eventChirho of journalChirho) {
		if (!eventChirho.task_uuid_chirho) continue;
		const rowsChirho = tasksChirho.get(eventChirho.task_uuid_chirho) ?? [];
		rowsChirho.push(eventChirho);
		tasksChirho.set(eventChirho.task_uuid_chirho, rowsChirho);
	}
	const manifestChirho = JSON.parse(
		(await readOwnedChirho(
			rootChirho,
			`static/content-chirho/${bookChirho.slug_chirho}/manifest-chirho.json`,
			128 * 1024
		))!.toString()
	);
	if (
		manifestChirho.book_id_chirho !== bookChirho.id_chirho ||
		manifestChirho.chapters_chirho.length > bookChirho.chapter_count_chirho
	)
		throw new Error('Source book manifest differs');
	const completedChirho: CompletedChirho[] = [];
	let expectedChirho = 0;
	const seenChirho = new Set<string>();
	for (const entryChirho of manifestChirho.chapters_chirho as {
		number_chirho: number;
		path_chirho: string;
		sha256_chirho: string;
		verse_count_chirho: number;
	}[]) {
		const chapterChirho = entryChirho.number_chirho;
		if (
			!Number.isInteger(chapterChirho) ||
			chapterChirho < 1 ||
			chapterChirho > bookChirho.chapter_count_chirho ||
			entryChirho.path_chirho !==
				`/content-chirho/${bookChirho.slug_chirho}/chapter-${String(chapterChirho).padStart(2, '0')}-chirho.json`
		)
			throw new Error('Source chapter identity differs');
		expectedChirho += entryChirho.verse_count_chirho;
		const chapterStemChirho = `chapter-${String(chapterChirho).padStart(3, '0')}`;
		const jobsBytesChirho = await readOwnedChirho(
			rootChirho,
			`${homeChirho}/jobs-chirho/${chapterStemChirho}-jobs-chirho.jsonl`,
			2 * 1024 ** 2,
			true
		);
		if (!jobsBytesChirho) continue;
		if (!jobsBytesChirho.toString().endsWith('\n'))
			throw new Error('Immutable job plan is incomplete');
		const jobsChirho: JobChirho[] = linesChirho(jobsBytesChirho);
		const sourceBytesChirho = (await readOwnedChirho(
			rootChirho,
			'static' + entryChirho.path_chirho,
			4 * 1024 ** 2 // Same chapter ceiling as the reader and audio release validator; Psalm 119 exceeds 2 MiB.
		))!;
		if (digestChirho(sourceBytesChirho) !== entryChirho.sha256_chirho)
			throw new Error('Source chapter drift');
		const sourceChirho = JSON.parse(sourceBytesChirho.toString()) as {
			book_id_chirho: string;
			verses_chirho: VerseChirho[];
		};
		if (
			sourceChirho.book_id_chirho !== bookChirho.id_chirho ||
			sourceChirho.verses_chirho.length !== entryChirho.verse_count_chirho ||
			jobsChirho.length !== sourceChirho.verses_chirho.length
		)
			throw new Error('Chapter source or planned verse count differs');
		const snapshotBytesChirho = (await readOwnedChirho(
			rootChirho,
			`${homeChirho}/verses-chirho/${chapterStemChirho}-verses-chirho.json`,
			2 * 1024 ** 2
		))!;
		const snapshotChirho = sourceChirho.verses_chirho.map((verseChirho) => ({
			verse_id_chirho: verseChirho.id_chirho,
			reference_chirho: verseChirho.reference_chirho,
			source_language_chirho: verseChirho.language_chirho,
			word_glosses_in_source_order_chirho: verseChirho.tokens_chirho
				.map((tokenChirho) => tokenChirho.gloss_chirho)
				.filter(
					(glossChirho): glossChirho is string =>
						typeof glossChirho === 'string' && glossChirho !== '' && glossChirho !== '-'
				)
				.join(' ')
		}));
		if (
			JSON.stringify(JSON.parse(snapshotBytesChirho.toString())) !== JSON.stringify(snapshotChirho)
		)
			throw new Error('Original gloss snapshot differs from source');
		const promptsBytesChirho = (await readOwnedChirho(
			rootChirho,
			`${homeChirho}/prompts-chirho/${chapterStemChirho}-prompts-chirho.jsonl`,
			2 * 1024 ** 2
		))!;
		const promptsChirho = linesChirho(promptsBytesChirho);
		if (promptsChirho.length !== jobsChirho.length)
			throw new Error('Prompt worksheet count differs');
		const recordsBytesChirho = await readOwnedChirho(
			rootChirho,
			`${homeChirho}/records-chirho/${chapterStemChirho}-records-chirho.jsonl`,
			4 * 1024 ** 2,
			true
		);
		const resultsChirho: ResultChirho[] = recordsBytesChirho
			? linesChirho(recordsBytesChirho).filter((rowChirho) => rowChirho.ok_chirho === true)
			: [];
		const byJobChirho = new Map<string, ResultChirho>();
		for (const rowChirho of resultsChirho) {
			if (byJobChirho.has(rowChirho.job_id_chirho))
				throw new Error('More than one successful result for a scene');
			byJobChirho.set(rowChirho.job_id_chirho, rowChirho);
		}
		for (let indexChirho = 0; indexChirho < jobsChirho.length; indexChirho++) {
			const jobChirho = jobsChirho[indexChirho],
				verseChirho = sourceChirho.verses_chirho[indexChirho],
				promptChirho = promptsChirho[indexChirho];
			const verseNumberChirho = Number(verseChirho.id_chirho.split('.')[2]);
			const idChirho = `${bookChirho.id_chirho.toLowerCase()}-${String(chapterChirho).padStart(3, '0')}-${String(verseNumberChirho).padStart(3, '0')}`;
			const seedChirho =
				(BIBLE_BOOKS_CHIRHO.findIndex((rowChirho) => rowChirho.id_chirho === bookChirho.id_chirho) +
					1) *
					1_000_000 +
				chapterChirho * 1000 +
				verseNumberChirho;
			const sceneChirho = String(promptChirho.scene_chirho).trim().replace(/\s+/gu, ' ');
			const expectedPromptChirho =
				'Watercolor storybook illustration: ' +
				sceneChirho +
				(/[.!]$/u.test(sceneChirho) ? '' : '.') +
				' Soft ink lines, textured paper, warm gentle light.';
			if (
				jobChirho.job_id_chirho !== idChirho ||
				jobChirho.verse_id_chirho !== verseChirho.id_chirho ||
				jobChirho.book_id_chirho !== bookChirho.id_chirho ||
				jobChirho.chapter_chirho !== chapterChirho ||
				seenChirho.has(idChirho) ||
				jobChirho.seed_chirho !== seedChirho ||
				jobChirho.output_chirho !==
					`${homeChirho}/scenes-chirho/chapter-${String(chapterChirho).padStart(3, '0')}/${idChirho}-seed-${seedChirho}-schnell-chirho.webp` ||
				jobChirho.steps_chirho !== 4 ||
				jobChirho.width_chirho !== 1024 ||
				jobChirho.height_chirho !== 768 ||
				jobChirho.output_format_chirho !== 'WEBP' ||
				jobChirho.output_quality_chirho !== 45 ||
				!['absent', 'offscreen', 'hand'].includes(jobChirho.jesus_presence_chirho) ||
				jobChirho.prompt_chirho !== expectedPromptChirho ||
				jobChirho.prompt_chirho.length > 2048 ||
				jobChirho.prompt_sha256_chirho !== digestChirho(jobChirho.prompt_chirho) ||
				jobChirho.snapshot_sha256_chirho !== digestChirho(snapshotBytesChirho) ||
				promptChirho.verse_id_chirho !== verseChirho.id_chirho ||
				promptChirho.jesus_presence_chirho !== jobChirho.jesus_presence_chirho ||
				echoChirho(String(promptChirho.gloss_echo_chirho)) !==
					echoChirho(snapshotChirho[indexChirho].word_glosses_in_source_order_chirho)
			)
				throw new Error('Scene plan, prompt or source binding differs');
			seenChirho.add(idChirho);
			const resultChirho = byJobChirho.get(idChirho);
			if (!resultChirho) continue;
			const eventsChirho = tasksChirho.get(resultChirho.task_uuid_chirho) ?? [];
			const requestedChirho = eventsChirho.filter(
					(rowChirho) => rowChirho.state_chirho === 'requested'
				),
				receivedChirho = eventsChirho.filter((rowChirho) => rowChirho.state_chirho === 'received'),
				savedChirho = eventsChirho.filter((rowChirho) => rowChirho.state_chirho === 'saved');
			const requestShaChirho = requestHashChirho(jobChirho, resultChirho.task_uuid_chirho);
			if (
				!/^[a-f0-9-]{36}$/u.test(resultChirho.task_uuid_chirho) ||
				!/^[a-f0-9-]{36}$/u.test(resultChirho.image_uuid_chirho) ||
				resultChirho.verse_id_chirho !== verseChirho.id_chirho ||
				resultChirho.output_chirho !== jobChirho.output_chirho ||
				resultChirho.seed_returned_chirho !== seedChirho ||
				resultChirho.provider_chirho !== 'runware' ||
				resultChirho.model_chirho !== 'runware:100@1' ||
				resultChirho.format_chirho !== 'WEBP' ||
				resultChirho.output_quality_chirho !== 45 ||
				resultChirho.width_px_chirho !== 1024 ||
				resultChirho.height_px_chirho !== 768 ||
				!Number.isSafeInteger(resultChirho.bytes_chirho) ||
				resultChirho.bytes_chirho <= 0 ||
				resultChirho.bytes_chirho > 2 * 1024 ** 2 ||
				!/^[a-f0-9]{64}$/u.test(resultChirho.output_sha256_chirho) ||
				!Number.isFinite(resultChirho.cost_usd_chirho) ||
				resultChirho.cost_usd_chirho < 0 ||
				resultChirho.cost_usd_chirho > 0.01 ||
				!Number.isInteger(resultChirho.attempt_chirho) ||
				resultChirho.attempt_chirho < 1 ||
				resultChirho.attempt_chirho > 16 ||
				requestedChirho.length !== 1 ||
				receivedChirho.length !== 1 ||
				savedChirho.length !== 1 ||
				eventsChirho[0] !== requestedChirho[0] ||
				eventsChirho.at(-1) !== savedChirho[0] ||
				eventsChirho.indexOf(receivedChirho[0]) > eventsChirho.indexOf(savedChirho[0]) ||
				eventsChirho.some(
					(rowChirho) =>
						rowChirho.job_id_chirho !== idChirho ||
						rowChirho.attempt_chirho !== resultChirho.attempt_chirho ||
						!['requested', 'unknown', 'stillUnknown', 'received', 'undelivered', 'saved'].includes(
							rowChirho.state_chirho
						)
				) ||
				requestedChirho[0].request_sha256_chirho !== requestShaChirho ||
				receivedChirho[0].image_uuid_chirho !== resultChirho.image_uuid_chirho ||
				receivedChirho[0].cost_usd_chirho !== resultChirho.cost_usd_chirho ||
				savedChirho[0].output_sha256_chirho !== resultChirho.output_sha256_chirho ||
				savedChirho[0].bytes_chirho !== resultChirho.bytes_chirho
			)
				throw new Error('Provider result or original request journal differs');
			completedChirho.push({
				job_chirho: jobChirho,
				result_chirho: resultChirho,
				content_path_chirho: entryChirho.path_chirho,
				content_sha256_chirho: entryChirho.sha256_chirho,
				canonical_sha256_chirho: digestChirho(verseChirho.canonical_text_chirho),
				request_sha256_chirho: requestShaChirho,
				selected_journal_sha256_chirho: digestChirho(JSON.stringify(eventsChirho))
			});
		}
		if (resultsChirho.some((rowChirho) => !seenChirho.has(rowChirho.job_id_chirho)))
			throw new Error('Result names a scene outside its chapter');
	}
	const markerBytesChirho = await readOwnedChirho(
		rootChirho,
		`${homeChirho}/usable-outputs-chirho.json`,
		4 * 1024 ** 2,
		true
	);
	if (markerBytesChirho) {
		const markerChirho = JSON.parse(markerBytesChirho.toString());
		const outputsChirho = new Map(
			completedChirho.map((rowChirho) => [rowChirho.job_chirho.job_id_chirho, rowChirho])
		);
		if (
			markerChirho.book_id_chirho !== bookChirho.id_chirho ||
			markerChirho.model_chirho !== 'runware:100@1' ||
			markerChirho.output_format_chirho !== 'WEBP' ||
			markerChirho.output_quality_chirho !== 45 ||
			completedChirho.length !== expectedChirho ||
			markerChirho.verse_count_chirho !== expectedChirho ||
			markerChirho.outputs_chirho.length !== expectedChirho ||
			new Set(
				markerChirho.outputs_chirho.map(
					(rowChirho: { job_id_chirho: string }) => rowChirho.job_id_chirho
				)
			).size !== expectedChirho ||
			markerChirho.outputs_chirho.some(
				(rowChirho: {
					job_id_chirho: string;
					output_chirho: string;
					output_sha256_chirho: string;
					bytes_chirho: number;
				}) => {
					const selectedChirho = outputsChirho.get(rowChirho.job_id_chirho);
					return (
						!selectedChirho ||
						rowChirho.output_chirho !== selectedChirho.job_chirho.output_chirho ||
						rowChirho.output_sha256_chirho !== selectedChirho.result_chirho.output_sha256_chirho ||
						rowChirho.bytes_chirho !== selectedChirho.result_chirho.bytes_chirho
					);
				}
			)
		)
			throw new Error('Book completion marker differs from exact saved results');
	}
	return {
		completed_chirho: completedChirho,
		expected_chirho: expectedChirho,
		complete_chirho: markerBytesChirho !== null
	};
}
