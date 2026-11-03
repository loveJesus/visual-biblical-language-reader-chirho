// For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life. — John 3:16 (KJV)
// Workflow: local-reader-chirho.md. Two source-bound comparisons; old chapter requests remain immutable.
import { readFile } from 'node:fs/promises';
import { join, resolve } from 'node:path';
import { chapterJobsChirho } from './chapter_audition_chirho';
import {
	executeAudioPlanChirho,
	reserveChirho,
	sha256Chirho,
	verifiedPriorAuditionsChirho,
	type AudioJobChirho
} from '../audition_chirho';
import {
	chapterRecipeChirho,
	HEBREW_CONNECTED_RECIPE_CHIRHO,
	GREEK_ROUGH_RECIPE_CHIRHO
} from '../../../src/lib/domain-chirho/pronunciation-chirho/chapter-recipe-chirho';
import { spokenVerseChirho } from '../../../src/lib/domain-chirho/pronunciation-chirho';

export async function flowPlanChirho(rootChirho: string) {
	const chapterPlanChirho = await chapterJobsChirho(rootChirho);
	const folderChirho = join(
		rootChirho,
		'workspace-chirho/audio-chirho/audition-2026-10-30-chirho/chapter-trial-chirho'
	);
	const bytesChirho = await readFile(join(folderChirho, 'audition-manifest-chirho.json'));
	const manifestChirho = JSON.parse(bytesChirho.toString('utf8'));
	const receiptsChirho = JSON.parse(
		await readFile(join(folderChirho, 'receipts-chirho.json'), 'utf8')
	);
	const priorChirho = await verifiedPriorAuditionsChirho(rootChirho);
	if (
		JSON.stringify(manifestChirho.jobs_chirho) !== JSON.stringify(chapterPlanChirho.rows_chirho) ||
		JSON.stringify(manifestChirho.clips_chirho) !== JSON.stringify(receiptsChirho) ||
		receiptsChirho.length !== 79
	)
		throw new Error('Original completed chapter evidence changed');
	const chapterCreditsChirho = reserveChirho(
		chapterPlanChirho.rows_chirho,
		receiptsChirho,
		priorChirho,
		true
	);
	for (const receiptChirho of receiptsChirho) {
		if (
			receiptChirho.state_chirho !== 'received' ||
			sha256Chirho(await readFile(join(folderChirho, receiptChirho.path_chirho))) !==
				receiptChirho.sha256_chirho
		)
			throw new Error('Original chapter audio changed');
	}
	const rowsChirho: AudioJobChirho[] = [];
	for (const [pathChirho, idChirho, indexChirho, recipeChirho, languageChirho] of [
		[
			'static/content-chirho/proverbs-chirho/chapter-26-chirho.json',
			'prov-26-001-connected-chirho',
			0,
			HEBREW_CONNECTED_RECIPE_CHIRHO,
			'he'
		],
		[
			'static/content-chirho/john-chirho/chapter-01-chirho.json',
			'john-1-002-rough-chirho',
			1,
			GREEK_ROUGH_RECIPE_CHIRHO,
			'el'
		]
	] as const) {
		const sourceChirho = JSON.parse(await readFile(join(rootChirho, pathChirho), 'utf8'))
			.verses_chirho[indexChirho];
		const recipeInputChirho = chapterRecipeChirho(sourceChirho, recipeChirho);
		if (!recipeInputChirho) throw new Error('Flow sample source binding changed');
		rowsChirho.push({
			id_chirho: idChirho,
			lesson_id_chirho: sourceChirho.id_chirho,
			token_id_chirho: null,
			language_chirho: languageChirho,
			text_chirho: spokenVerseChirho(sourceChirho),
			canonical_sha256_chirho: sha256Chirho(sourceChirho.canonical_text_chirho),
			recipe_id_chirho: recipeChirho,
			...recipeInputChirho
		});
	}
	const inputsChirho = {
		...chapterPlanChirho.inputs_chirho,
		'workspace-chirho/audio-chirho/audition-2026-10-30-chirho/chapter-trial-chirho/audition-manifest-chirho.json':
			sha256Chirho(bytesChirho)
	};
	return {
		rows_chirho: rowsChirho,
		inputs_chirho: inputsChirho,
		prior_credits_chirho: priorChirho + chapterCreditsChirho
	};
}
if (import.meta.main) {
	if (process.argv.slice(2).some((argumentChirho) => argumentChirho !== '--apply-chirho'))
		throw new Error('Only the two fixed flow comparisons are supported');
	const rootChirho = resolve('.');
	const planChirho = await flowPlanChirho(rootChirho);
	console.log(
		JSON.stringify(
			await executeAudioPlanChirho(rootChirho, process.argv.includes('--apply-chirho'), {
				mode_chirho: 'flow_review_trial',
				rows_chirho: planChirho.rows_chirho,
				prior_credits_chirho: planChirho.prior_credits_chirho,
				folder_chirho: join(
					rootChirho,
					'workspace-chirho/audio-chirho/audition-2026-10-30-chirho/flow-review-chirho'
				),
				verify_source_chirho: async () => {
					for (const [pathChirho, hashChirho] of Object.entries(planChirho.inputs_chirho))
						if (sha256Chirho(await readFile(join(rootChirho, pathChirho))) !== hashChirho)
							throw new Error('Flow source changed after planning');
				}
			}),
			null,
			2
		)
	);
}
