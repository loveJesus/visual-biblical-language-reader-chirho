// For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life. — John 3:16 (KJV)
// Workflow: local-reader-chirho.md. Opening-verse renditions, bounded before any chapter expansion.
import { readFile } from 'node:fs/promises';
import { join, resolve } from 'node:path';
import { flowPlanChirho } from './flow_audition_chirho';
import {
	executeAudioPlanChirho,
	reserveChirho,
	sha256Chirho,
	type AudioJobChirho
} from '../audition_chirho';
import {
	chapterRecipeChirho,
	GREEK_ROUGH_RECIPE_CHIRHO,
	GREEK_ERASMIAN_RECIPE_CHIRHO
} from '../../../src/lib/domain-chirho/pronunciation-chirho/chapter-recipe-chirho';
import { spokenVerseChirho } from '../../../src/lib/domain-chirho/pronunciation-chirho';

export async function johnStylesPlanChirho(rootChirho: string) {
	const flowChirho = await flowPlanChirho(rootChirho);
	const flowRelativeChirho =
		'workspace-chirho/audio-chirho/audition-2026-10-30-chirho/flow-review-chirho';
	const flowBytesChirho = await readFile(
		join(rootChirho, flowRelativeChirho, 'audition-manifest-chirho.json')
	);
	const flowManifestChirho = JSON.parse(flowBytesChirho.toString('utf8'));
	const receiptsChirho = JSON.parse(
		await readFile(join(rootChirho, flowRelativeChirho, 'receipts-chirho.json'), 'utf8')
	);
	if (
		receiptsChirho.length !== 2 ||
		JSON.stringify(flowManifestChirho.jobs_chirho) !== JSON.stringify(flowChirho.rows_chirho) ||
		JSON.stringify(flowManifestChirho.clips_chirho) !== JSON.stringify(receiptsChirho)
	)
		throw new Error('Flow evidence changed');
	const flowCreditsChirho = reserveChirho(
		flowChirho.rows_chirho,
		receiptsChirho,
		flowChirho.prior_credits_chirho,
		'flow_review_trial'
	);
	for (const receiptChirho of receiptsChirho)
		if (
			receiptChirho.state_chirho !== 'received' ||
			sha256Chirho(
				await readFile(join(rootChirho, flowRelativeChirho, receiptChirho.path_chirho))
			) !== receiptChirho.sha256_chirho
		)
			throw new Error('Flow recording changed');
	const contentPathChirho = 'static/content-chirho/john-chirho/chapter-01-chirho.json';
	const contentChirho = JSON.parse(await readFile(join(rootChirho, contentPathChirho), 'utf8'));
	const rowsChirho: AudioJobChirho[] = [];
	for (const [indexChirho, recipeChirho, suffixChirho] of [
		[0, GREEK_ROUGH_RECIPE_CHIRHO, 'rough'],
		[0, GREEK_ERASMIAN_RECIPE_CHIRHO, 'erasmian'],
		[1, GREEK_ERASMIAN_RECIPE_CHIRHO, 'erasmian']
	] as const) {
		const lessonChirho = contentChirho.verses_chirho[indexChirho];
		const inputChirho = chapterRecipeChirho(lessonChirho, recipeChirho);
		if (!inputChirho) throw new Error('Greek rendition source changed');
		rowsChirho.push({
			id_chirho: `john-1-${String(indexChirho + 1).padStart(3, '0')}-${suffixChirho}-chirho`,
			lesson_id_chirho: lessonChirho.id_chirho,
			token_id_chirho: null,
			language_chirho: 'el',
			text_chirho: spokenVerseChirho(lessonChirho),
			canonical_sha256_chirho: sha256Chirho(lessonChirho.canonical_text_chirho),
			recipe_id_chirho: recipeChirho,
			...inputChirho
		});
	}
	const profilePathChirho =
		'src/lib/domain-chirho/pronunciation-chirho/greek-renditions-chirho.json';
	return {
		rows_chirho: rowsChirho,
		prior_credits_chirho: flowChirho.prior_credits_chirho + flowCreditsChirho,
		inputs_chirho: {
			...flowChirho.inputs_chirho,
			[flowRelativeChirho + '/audition-manifest-chirho.json']: sha256Chirho(flowBytesChirho),
			[profilePathChirho]: sha256Chirho(await readFile(join(rootChirho, profilePathChirho)))
		}
	};
}
if (import.meta.main) {
	if (process.argv.slice(2).some((argumentChirho) => argumentChirho !== '--apply-chirho'))
		throw new Error('Only the three fixed Greek comparison requests are supported');
	const rootChirho = resolve('.');
	const planChirho = await johnStylesPlanChirho(rootChirho);
	console.log(
		JSON.stringify(
			await executeAudioPlanChirho(rootChirho, process.argv.includes('--apply-chirho'), {
				mode_chirho: 'john_styles_trial',
				rows_chirho: planChirho.rows_chirho,
				prior_credits_chirho: planChirho.prior_credits_chirho,
				folder_chirho: join(
					rootChirho,
					'workspace-chirho/audio-chirho/audition-2026-10-30-chirho/john-styles-chirho'
				),
				verify_source_chirho: async () => {
					for (const [pathChirho, hashChirho] of Object.entries(planChirho.inputs_chirho))
						if (sha256Chirho(await readFile(join(rootChirho, pathChirho))) !== hashChirho)
							throw new Error('Greek comparison source changed');
				}
			}),
			null,
			2
		)
	);
}
