// For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life. — John 3:16 (KJV)
// Workflow: local-reader-chirho.md. Exactly two requested chapters; cached provider output, no live synthesis.
import { readFile } from 'node:fs/promises';
import { resolve, join } from 'node:path';
import {
	chapterRecipeChirho,
	HEBREW_CHAPTER_RECIPE_CHIRHO,
	GREEK_CHAPTER_RECIPE_CHIRHO
} from '../../../src/lib/domain-chirho/pronunciation-chirho/chapter-recipe-chirho';
import { spokenVerseChirho } from '../../../src/lib/domain-chirho/pronunciation-chirho';
import {
	executeAudioPlanChirho,
	sha256Chirho,
	verifiedPriorAuditionsChirho,
	type AudioJobChirho
} from '../audition_chirho';
import type { LessonChirho } from '../../../src/lib/domain-chirho/lesson-chirho';
import type { GreekLessonChirho } from '../../../src/lib/domain-chirho/greek-chirho';

export async function chapterJobsChirho(rootChirho: string) {
	const inputsChirho: Record<string, string> = {};
	const rowsChirho: AudioJobChirho[] = [];
	for (const [
		bookChirho,
		folderChirho,
		chapterChirho,
		languageChirho,
		countChirho,
		recipeChirho
	] of [
		['Prov', 'proverbs-chirho', 26, 'he', 28, HEBREW_CHAPTER_RECIPE_CHIRHO],
		['John', 'john-chirho', 1, 'el', 51, GREEK_CHAPTER_RECIPE_CHIRHO]
	] as const) {
		const pathChirho = `static/content-chirho/${folderChirho}/chapter-${String(chapterChirho).padStart(2, '0')}-chirho.json`;
		const bytesChirho = await readFile(join(rootChirho, pathChirho));
		inputsChirho[pathChirho] = sha256Chirho(bytesChirho);
		const contentChirho = JSON.parse(bytesChirho.toString('utf8')) as {
			verses_chirho: (LessonChirho | GreekLessonChirho)[];
		};
		if (contentChirho.verses_chirho.length !== countChirho)
			throw new Error('Requested chapter changed');
		for (const [indexChirho, lessonChirho] of contentChirho.verses_chirho.entries()) {
			if (lessonChirho.id_chirho !== `${bookChirho}.${chapterChirho}.${indexChirho + 1}`)
				throw new Error('Chapter verse order changed');
			const preparedChirho = chapterRecipeChirho(lessonChirho, recipeChirho);
			if (!preparedChirho)
				throw new Error(`Chapter pronunciation/phrasing source changed: ${lessonChirho.id_chirho}`);
			rowsChirho.push({
				id_chirho: `${bookChirho.toLowerCase()}-${chapterChirho}-${String(indexChirho + 1).padStart(3, '0')}-phrased-chirho`,
				lesson_id_chirho: lessonChirho.id_chirho,
				token_id_chirho: null,
				language_chirho: languageChirho,
				text_chirho: spokenVerseChirho(lessonChirho),
				canonical_sha256_chirho: sha256Chirho(lessonChirho.canonical_text_chirho),
				recipe_id_chirho: recipeChirho,
				...preparedChirho
			});
		}
	}
	for (const pathChirho of [
		'data-chirho/audio-chirho/proverbs-26-phonetics-chirho.json',
		'scripts-chirho/audio-chirho/chapter-chirho/stress_reviews_chirho.json'
	])
		inputsChirho[pathChirho] = sha256Chirho(await readFile(join(rootChirho, pathChirho)));
	if (rowsChirho.length !== 79) throw new Error('Fixed chapter request count changed');
	// A limit of two auditions covers one verse in each language before the rest of either chapter.
	rowsChirho.sort(
		(leftChirho, rightChirho) =>
			Number(
				rightChirho.lesson_id_chirho === 'Prov.26.1' || rightChirho.lesson_id_chirho === 'John.1.1'
			) -
			Number(
				leftChirho.lesson_id_chirho === 'Prov.26.1' || leftChirho.lesson_id_chirho === 'John.1.1'
			)
	);
	return { rows_chirho: rowsChirho, inputs_chirho: inputsChirho };
}

if (import.meta.main) {
	const argumentsChirho = process.argv.slice(2);
	for (let indexChirho = 0; indexChirho < argumentsChirho.length; indexChirho++) {
		if (argumentsChirho[indexChirho] === '--limit-chirho') {
			indexChirho++;
			continue;
		}
		if (argumentsChirho[indexChirho] !== '--apply-chirho')
			throw new Error('Only fixed chapter trial, --limit-chirho and --apply-chirho supported');
	}
	const rootChirho = resolve('.');
	const planChirho = await chapterJobsChirho(rootChirho);
	const priorCreditsChirho = await verifiedPriorAuditionsChirho(rootChirho);
	const limitIndexChirho = argumentsChirho.indexOf('--limit-chirho');
	const limitChirho = limitIndexChirho < 0 ? 79 : Number(argumentsChirho[limitIndexChirho + 1]);
	const resultChirho = await executeAudioPlanChirho(
		rootChirho,
		argumentsChirho.includes('--apply-chirho'),
		{
			mode_chirho: 'chapter_trial',
			rows_chirho: planChirho.rows_chirho,
			folder_chirho: join(
				rootChirho,
				'workspace-chirho/audio-chirho/audition-2026-10-30-chirho/chapter-trial-chirho'
			),
			prior_credits_chirho: priorCreditsChirho,
			limit_chirho: limitChirho,
			verify_source_chirho: async () => {
				for (const [pathChirho, hashChirho] of Object.entries(planChirho.inputs_chirho))
					if (sha256Chirho(await readFile(join(rootChirho, pathChirho))) !== hashChirho)
						throw new Error('Chapter input changed after planning');
			}
		}
	);
	console.log(JSON.stringify(resultChirho, null, 2));
}
