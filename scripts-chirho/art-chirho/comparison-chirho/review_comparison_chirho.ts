// For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life. — John 3:16 (KJV)
// Workflow: selective-scene-variants-chirho.md. Local comparison evidence includes the failures.
import {
	readFile as readFileChirho,
	mkdir as mkdirChirho,
	copyFile as copyFileChirho
} from 'node:fs/promises';
import { join as joinChirho, resolve as resolveChirho } from 'node:path';
import { sha256Chirho, writeChirho } from '../../audio-chirho/audition_chirho';
import {
	COMPARISON_HOME_CHIRHO,
	type SceneJobChirho,
	type SceneReceiptChirho
} from './run_comparison_chirho';

// Visual inspection of both labelled contact sheets plus enlarged anatomy/problem examples.
const REVIEW_CHIRHO: Record<number, [string, string?]> = {
	1: ['Added boat; giant celestial object dominates the scene.'],
	2: ['Added a dove despite the intended indirect composition.'],
	3: ['Added sun/moons, trees and a developed landscape before their place in the chapter.'],
	4: ['Added a moon before day four.'],
	5: ['Added sun and vegetation before their place in the chapter.'],
	6: ['A sun disc appears below the sky.'],
	7: ['Dry land and vegetation appear before day three.'],
	8: ['A sun disc appears before day four.'],
	9: [
		'Suitable as a pending imaginative scene.',
		'Bare rocky shores surround a newly gathered expanse of blue water.'
	],
	10: ['Small generated signature/lettering in the lower-left corner.'],
	11: [
		'Suitable as a pending imaginative scene.',
		'Delicate green trees, grasses and seed heads grow beside blue water.'
	],
	12: [
		'Suitable as a pending imaginative scene.',
		'Golden seed-bearing grasses and an orange-bearing tree fill a lush green landscape.'
	],
	13: ['Sun and small distant structures appear in the third-day scene.'],
	14: [
		'Suitable as a pending imaginative scene.',
		'A golden sun, crescent moon and stars shine over varied woodland and low hills.'
	],
	15: [
		'Suitable as a pending imaginative scene.',
		'A large golden light rises over a green and blue waterscape beneath a painted sky.'
	],
	16: ['The lesser light is missing and the sun has distracting crescent-shaped markings.'],
	17: [
		'Suitable as a pending imaginative scene.',
		'A crescent moon and stars shine in a curved blue night sky over autumn-colored hills.'
	],
	18: [
		'Suitable as a pending imaginative scene.',
		'A quiet landscape transitions from warm daylight to a moonlit, starry sky.'
	],
	19: [
		'Suitable as a pending imaginative scene.',
		'A large pale moon, stars and warm dawn colors appear above a wooded shoreline.'
	],
	20: ['Needs a closer anatomy check before reader use.'],
	21: [
		'Suitable as a pending imaginative scene.',
		'A large whale swims among small fish above a colorful undersea habitat.'
	],
	22: ['Bird/fish hybrids and implausible sea-creature anatomy.'],
	23: ['Needs a closer bird anatomy check before reader use.'],
	24: ['Generated signature at the lower right; animal anatomy also needs review.'],
	25: ['Overlapping livestock forms need closer anatomy review.'],
	26: ['Only one human figure; does not realize the planned composition.'],
	27: ['Two elderly seated men instead of male and female.'],
	28: ['Modern-looking clothing and a developed agricultural landscape.'],
	29: ['Added an open written book.'],
	30: ['Bird/mammal hybrids and malformed animals.'],
	31: ['Malformed fish and an unclear mixed habitat; needs revision.']
};
const escapeChirho = (valueChirho: string) =>
	valueChirho
		.replaceAll('&', '&amp;')
		.replaceAll('<', '&lt;')
		.replaceAll('>', '&gt;')
		.replaceAll('"', '&quot;');
export async function reviewComparisonChirho(rootChirho: string, installChirho = false) {
	const homeChirho = joinChirho(rootChirho, COMPARISON_HOME_CHIRHO);
	const planChirho = JSON.parse(
		await readFileChirho(joinChirho(homeChirho, 'plan-chirho.json'), 'utf8')
	) as { jobs_chirho: SceneJobChirho[]; content_sha256_chirho: string };
	const receiptsChirho = JSON.parse(
		await readFileChirho(joinChirho(homeChirho, 'receipts-chirho.json'), 'utf8')
	) as SceneReceiptChirho[];
	const scenesChirho = [];
	const reviewsChirho = [];
	const cardsChirho = [];
	for (const jobChirho of planChirho.jobs_chirho) {
		const receiptChirho = receiptsChirho.find(
			(rowChirho) => rowChirho.lesson_id_chirho === jobChirho.lesson_id_chirho
		);
		if (
			!receiptChirho ||
			receiptChirho.state_chirho !== 'received' ||
			!receiptChirho.asset_file_chirho
		)
			throw new Error('Comparison output incomplete');
		const bytesChirho = await readFileChirho(
			joinChirho(homeChirho, receiptChirho.asset_file_chirho)
		);
		if (sha256Chirho(bytesChirho) !== receiptChirho.sha256_chirho)
			throw new Error('Comparison bytes changed');
		const [noteChirho, altChirho] = REVIEW_CHIRHO[jobChirho.verse_chirho];
		reviewsChirho.push({
			lesson_id_chirho: jobChirho.lesson_id_chirho,
			sha256_chirho: receiptChirho.sha256_chirho,
			disposition_chirho: altChirho ? 'pending_reader_scene' : 'withheld_reader_scene',
			note_chirho: noteChirho,
			art_review_chirho: 'pending'
		});
		if (altChirho) {
			const assetPathChirho = `/assets-chirho/scenes-chirho/genesis-comparison-v1-chirho/chapter-01-chirho/gen-01-${String(jobChirho.verse_chirho).padStart(3, '0')}-chirho.webp`;
			if (installChirho) {
				const destinationChirho = joinChirho(rootChirho, 'static', assetPathChirho);
				await mkdirChirho(joinChirho(destinationChirho, '..'), { recursive: true });
				await copyFileChirho(
					joinChirho(homeChirho, receiptChirho.asset_file_chirho),
					destinationChirho
				);
			}
			scenesChirho.push({
				fallback_chirho: true,
				lesson_id_chirho: jobChirho.lesson_id_chirho,
				asset_path_chirho: assetPathChirho,
				alt_chirho: altChirho,
				width_chirho: 1024,
				height_chirho: 768,
				sha256_chirho: receiptChirho.sha256_chirho,
				art_review_chirho: 'pending',
				reading_note_chirho: `An imaginative illustration of Genesis 1:${jobChirho.verse_chirho}. ${jobChirho.explanation_chirho} It is not a literal reconstruction of the creation event.`,
				verse_explanation_chirho: jobChirho.explanation_chirho,
				model_chirho: jobChirho.model_chirho,
				tool_chirho: 'Runware API',
				prompt_chirho: jobChirho.positive_prompt_chirho,
				source_sha256_chirho: jobChirho.canonical_sha256_chirho,
				cost_usd_chirho: receiptChirho.response_chirho?.cost
			});
		}
		cardsChirho.push(
			`<article id="verse-${jobChirho.verse_chirho}-chirho"><div class="heading-chirho"><h2>Genesis 1:${jobChirho.verse_chirho}</h2><span>${escapeChirho(jobChirho.model_name_chirho)}</span></div><a href="${receiptChirho.asset_file_chirho}"><img src="${receiptChirho.asset_file_chirho}" width="1024" height="768" alt="Genesis 1:${jobChirho.verse_chirho} comparison output" loading="lazy"></a><p>${escapeChirho(jobChirho.explanation_chirho)}</p><p class="review-chirho">${altChirho ? 'Reader preview candidate' : 'Held from reader'}: ${escapeChirho(noteChirho)}</p><p class="cost-chirho">Generation: $${Number(receiptChirho.response_chirho?.cost).toFixed(4)} · Artwork awaiting L.J.'s review</p><details><summary>Reusable explanation and prompt</summary><p>${escapeChirho(jobChirho.explanation_chirho)}</p><pre>${escapeChirho(jobChirho.positive_prompt_chirho)}</pre></details></article>`
		);
	}
	const costChirho = receiptsChirho.reduce(
		(sumChirho, rowChirho) => sumChirho + Number(rowChirho.response_chirho?.cost ?? 0),
		0
	);
	await writeChirho(
		joinChirho(homeChirho, 'visual-review-chirho.json'),
		JSON.stringify({ schema_version_chirho: 1, reviews_chirho: reviewsChirho }, null, 2) + '\n'
	);
	await writeChirho(
		joinChirho(homeChirho, 'index-chirho.html'),
		`<!doctype html>
<!-- For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life. — John 3:16 (KJV) -->
<html lang="en"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Hinneh · Genesis 1 model comparison</title><link rel="icon" href="data:,"><style>body{margin:0;background:#f7f3e9;color:#253b32;font:17px/1.55 system-ui}header,main{max-width:1400px;margin:auto;padding:28px}h1{font:600 clamp(28px,5vw,48px) Georgia;margin:0}header p{max-width:850px}.grid-chirho{display:grid;grid-template-columns:repeat(auto-fit,minmax(min(100%,420px),1fr));gap:24px}article{background:#fffdf8;border:1px solid #cdd5c6;border-radius:14px;overflow:hidden;scroll-margin-top:20px}article p,details{margin:14px 20px}.heading-chirho{padding:14px 20px;display:flex;align-items:center;justify-content:space-between;gap:12px;flex-wrap:wrap}h2{font:600 25px Georgia;margin:0}.heading-chirho span{font-size:13px;background:#e6eddf;padding:5px 10px;border-radius:20px}img{display:block;width:100%;height:auto}.review-chirho{border-left:3px solid #ae8b48;padding-left:12px}.cost-chirho{font-size:13px;color:#60705f}pre{white-space:pre-wrap;font:13px/1.5 monospace}a{color:inherit}</style><header><p>HINNEH · ARTWORK COMPARISON</p><h1>Genesis 1, two inexpensive models</h1><p>Odd verses: SDXL 1.0 VAE Fix, 28 steps. Even verses: FLUX.1 Schnell, 4 steps. All are 1024×768 WebP with the same watercolor art direction. Total provider-reported generation cost: <strong>$${costChirho.toFixed(4)}</strong>.</p><p>Adjacent verses compare the visual styles, not identical-scene performance. Every output is retained here, including failures. The explanation is saved once for later high-quality artwork. Images remain pending review.</p></header><main class="grid-chirho">${cardsChirho.join('\n')}</main></html>\n`
	);
	if (installChirho) {
		const sourceChirho = await readFileChirho(
			joinChirho(rootChirho, 'static/content-chirho/genesis-chirho/chapter-01-chirho.json')
		);
		if (sha256Chirho(sourceChirho) !== planChirho.content_sha256_chirho)
			throw new Error('Comparison source changed');
		await writeChirho(
			joinChirho(rootChirho, 'data-chirho/media-chirho/genesis-comparison-scenes-chirho.json'),
			JSON.stringify({ schema_version_chirho: 1, scenes_chirho: scenesChirho }, null, 2) + '\n'
		);
	}
	return {
		generated_chirho: 31,
		reader_candidates_chirho: scenesChirho.length,
		cost_usd_chirho: costChirho
	};
}
if (import.meta.main) {
	const argsChirho = process.argv.slice(2);
	if (argsChirho.some((valueChirho) => valueChirho !== '--install-chirho'))
		throw new Error('Unsupported comparison review argument');
	console.log(
		JSON.stringify(
			await reviewComparisonChirho(resolveChirho('.'), argsChirho.includes('--install-chirho'))
		)
	);
}
