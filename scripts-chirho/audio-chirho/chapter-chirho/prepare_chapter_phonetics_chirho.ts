// For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life. — John 3:16 (KJV)
// Workflow: local-reader-chirho.md. This source-bound chapter trial is prepared offline, never on playback.
import { readFile, mkdir, writeFile } from 'node:fs/promises';
import { resolve, join } from 'node:path';
import { hebrewPhoneticsChirho } from './hebrew_phonetics_chirho';
import reviewsChirho from './stress_reviews_chirho.json';
import { ipaNoteChirho } from '../../../src/lib/domain-chirho/pronunciation-chirho/ipa-trial-chirho';
import { sha256Chirho } from '../audition_chirho';
import { spokenWordChirho } from '../../../src/lib/domain-chirho/pronunciation-chirho';
import type { LessonChirho } from '../../../src/lib/domain-chirho/lesson-chirho';

export async function chapterPhoneticsChirho(rootChirho: string) {
	const pathChirho = 'static/content-chirho/proverbs-chirho/chapter-26-chirho.json';
	const bytesChirho = await readFile(join(rootChirho, pathChirho));
	const chapterChirho = JSON.parse(bytesChirho.toString('utf8')) as {
		verses_chirho: LessonChirho[];
	};
	const unusedChirho = new Set(
		reviewsChirho.reviews_chirho.map((rowChirho) => rowChirho.token_id_chirho)
	);
	const versesChirho = chapterChirho.verses_chirho.map((lessonChirho) => {
		const wordsChirho = lessonChirho.tokens_chirho.map((tokenChirho, indexChirho) => {
			const nextChirho = lessonChirho.tokens_chirho[indexChirho + 1];
			const gapChirho = lessonChirho.canonical_text_chirho.slice(
				tokenChirho.end_chirho,
				nextChirho?.start_chirho
			);
			const readingChirho = spokenWordChirho(tokenChirho);
			const reviewChirho = reviewsChirho.reviews_chirho.find(
				(rowChirho) => rowChirho.token_id_chirho === tokenChirho.id_chirho
			);
			if (reviewChirho && reviewChirho.text_chirho !== readingChirho)
				throw new Error('Reviewed stress source changed');
			const prepositiveChirho =
				/\u05ad/u.test(readingChirho) ||
				(/\u059d/u.test(readingChirho) && !/\u0597/u.test(readingChirho));
			if (prepositiveChirho && !reviewChirho)
				throw new Error(`Unreviewed prepositive stress: ${tokenChirho.id_chirho} ${readingChirho}`);
			if (reviewChirho) unusedChirho.delete(tokenChirho.id_chirho);
			const suffixChirho = gapChirho.includes('־') ? '־' : gapChirho.includes('׃') ? '׃' : '';
			const parsedChirho = hebrewPhoneticsChirho(
				readingChirho + suffixChirho,
				reviewChirho?.syllable_chirho
			);
			const checkedChirho = ipaNoteChirho(tokenChirho);
			return {
				token_id_chirho: tokenChirho.id_chirho,
				text_chirho: tokenChirho.text_chirho,
				spoken_text_chirho: readingChirho,
				lemma_id_chirho: tokenChirho.lemma_id_chirho,
				lemma_augment_chirho: tokenChirho.lemma_augment_chirho,
				raw_morphology_chirho: tokenChirho.raw_morphology_chirho,
				ipa_chirho: checkedChirho?.ipa_chirho ?? parsedChirho.ipa_chirho,
				stress_review_chirho: reviewChirho
					? 'agent_lexical_review'
					: checkedChirho
						? 'existing_checked_trial'
						: 'source_accent_analysis',
				analysis_chirho: parsedChirho.words_chirho,
				gap_after_chirho: gapChirho
			};
		});
		return {
			lesson_id_chirho: lessonChirho.id_chirho,
			canonical_text_chirho: lessonChirho.canonical_text_chirho,
			canonical_sha256_chirho: sha256Chirho(lessonChirho.canonical_text_chirho),
			ipa_chirho: wordsChirho.map((wordChirho) => wordChirho.ipa_chirho).join(' '),
			words_chirho: wordsChirho
		};
	});
	if (versesChirho.length !== 28 || unusedChirho.size)
		throw new Error('Chapter or stress-review scope changed');
	return {
		schema_version_chirho: 1,
		book_id_chirho: 'Prov',
		chapter_chirho: 26,
		tradition_chirho: 'israeli_hebrew',
		review_chirho: 'agent_prepared_trial_awaiting_listener_review',
		analysis_engine_chirho:
			'havarotjs@0.25.5; analysis copy only; source identities retained byte-exact',
		content_path_chirho: '/' + pathChirho.replace(/^static\//, ''),
		content_sha256_chirho: sha256Chirho(bytesChirho),
		stress_reviews_sha256_chirho: sha256Chirho(
			await readFile(
				join(rootChirho, 'scripts-chirho/audio-chirho/chapter-chirho/stress_reviews_chirho.json')
			)
		),
		verses_chirho: versesChirho
	};
}

if (import.meta.main) {
	const rootChirho = resolve('.');
	const documentChirho = await chapterPhoneticsChirho(rootChirho);
	const pathChirho = join(rootChirho, 'data-chirho/audio-chirho/proverbs-26-phonetics-chirho.json');
	const textChirho = JSON.stringify(documentChirho, null, 2) + '\n';
	if (process.argv.includes('--check-chirho')) {
		if ((await readFile(pathChirho, 'utf8')) !== textChirho)
			throw new Error('Chapter phonetic profile drift');
	} else {
		await mkdir(join(rootChirho, 'data-chirho/audio-chirho'), { recursive: true });
		await writeFile(pathChirho, textChirho);
	}
	console.log(
		`Prepared 28 source-bound verse drafts, ${documentChirho.verses_chirho.reduce((totalChirho, verseChirho) => totalChirho + verseChirho.words_chirho.length, 0)} words; no speech request.`
	);
}
