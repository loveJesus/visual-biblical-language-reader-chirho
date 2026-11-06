// For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life. — John 3:16 (KJV)
// Workflow: reusable-word-audio-chirho.md. Cold, deterministic source analysis; no provider calls.
import { readFile as readFileChirho, mkdir as mkdirChirho } from 'node:fs/promises';
import { join as joinChirho, resolve as resolveChirho } from 'node:path';
import { wordPhoneticsChirho } from './word_phonetics_chirho';
import { qerePhoneticsChirho } from '../../../src/lib/domain-chirho/pronunciation-chirho/hebrew-chirho/word-phonetics-chirho';
import { ipaNoteChirho } from '../../../src/lib/domain-chirho/pronunciation-chirho/ipa-trial-chirho';
import reviewsChirho from '../chapter-chirho/stress_reviews_chirho.json';
import knownChirho from '../../../data-chirho/audio-chirho/proverbs-26-phonetics-chirho.json';
import { cacheKeyChirho, sha256Chirho, writeChirho, type AudioJobChirho } from '../audition_chirho';
import {
	productionWordRecipeChirho,
	HEBREW_WORD_RECIPE_CHIRHO,
	GREEK_WORD_RECIPE_CHIRHO
} from '../../../src/lib/domain-chirho/pronunciation-chirho/production-recipe-chirho';
import { divineNameReadingChirho } from '../../../src/lib/domain-chirho/pronunciation-chirho/divine-name-chirho';
import { spokenWordChirho } from '../../../src/lib/domain-chirho/pronunciation-chirho';
import type { LessonChirho, TokenChirho } from '../../../src/lib/domain-chirho/lesson-chirho';
import type { GreekLessonChirho } from '../../../src/lib/domain-chirho/greek-chirho';

import { BIBLE_BOOKS_CHIRHO, bibleBookChirho } from '../../../src/lib/bible-chirho/books-chirho';

export const WORD_HOME_CHIRHO = 'workspace-chirho/audio-chirho/production-2026-10-31-chirho';
type SourceLessonChirho = LessonChirho | GreekLessonChirho;
export interface WordOccurrenceChirho {
	lesson_id_chirho: string;
	token_id_chirho: string;
	text_chirho: string;
	canonical_sha256_chirho: string;
	content_path_chirho: string;
	content_sha256_chirho: string;
}
export interface LibraryWordChirho {
	key_chirho: string;
	job_chirho: AudioJobChirho;
	occurrences_chirho: WordOccurrenceChirho[];
	analysis_note_chirho: string;
}
interface SourceChapterChirho {
	book_chirho: string;
	chapter_chirho: number;
	path_chirho: string;
	sha256_chirho: string;
	verses_chirho: SourceLessonChirho[];
}
const formKeyChirho = (tokenChirho: TokenChirho, readingChirho: string) =>
	JSON.stringify([
		tokenChirho.lemma_id_chirho,
		tokenChirho.lemma_augment_chirho,
		tokenChirho.raw_morphology_chirho,
		readingChirho.replace(/[\u0591-\u05af\u05bd]/gu, '')
	]);

export async function prepareWordsChirho(rootChirho: string, wholeBibleChirho = false) {
	const chaptersChirho: SourceChapterChirho[] = [];
	for (const [bookChirho, folderChirho] of wholeBibleChirho
		? BIBLE_BOOKS_CHIRHO.map((bookChirho) => [bookChirho.id_chirho, bookChirho.slug_chirho])
		: [
				['Prov', 'proverbs-chirho'],
				['John', 'john-chirho'],
				['Gen', 'genesis-chirho']
			]) {
		const manifestChirho = JSON.parse(
			await readFileChirho(
				joinChirho(rootChirho, `static/content-chirho/${folderChirho}/manifest-chirho.json`),
				'utf8'
			)
		);
		for (const entryChirho of manifestChirho.chapters_chirho) {
			const bytesChirho = await readFileChirho(
				joinChirho(rootChirho, 'static', entryChirho.path_chirho)
			);
			if (sha256Chirho(bytesChirho) !== entryChirho.sha256_chirho)
				throw new Error('Word library source hash changed');
			const chapterChirho = JSON.parse(bytesChirho.toString('utf8'));
			if (
				chapterChirho.book_id_chirho !== bookChirho ||
				chapterChirho.chapter_chirho !== entryChirho.number_chirho
			)
				throw new Error('Word library source identity changed');
			chaptersChirho.push({
				book_chirho: bookChirho,
				chapter_chirho: entryChirho.number_chirho,
				path_chirho: entryChirho.path_chirho,
				sha256_chirho: entryChirho.sha256_chirho,
				verses_chirho: chapterChirho.verses_chirho
			});
		}
	}
	// Match only the same pointed form, lemma and morphology with an unambiguous sourced stress.
	const stressesChirho = new Map<string, Map<number, string>>();
	for (const chapterChirho of chaptersChirho.filter(
		(rowChirho) => bibleBookChirho(rowChirho.book_chirho).language_chirho === 'he'
	))
		for (const verseChirho of chapterChirho.verses_chirho as LessonChirho[])
			for (const tokenChirho of verseChirho.tokens_chirho) {
				const readingChirho =
					spokenWordChirho(tokenChirho) +
					(verseChirho.tokens_chirho.at(-1) === tokenChirho &&
					verseChirho.canonical_text_chirho.slice(tokenChirho.end_chirho).includes('׃')
						? '׃'
						: '');
				if (divineNameReadingChirho(tokenChirho)) continue;
				try {
					const parsedChirho = wordPhoneticsChirho(readingChirho);
					if (parsedChirho.words_chirho.length !== 1) continue;
					const indexChirho = parsedChirho.words_chirho[0].syllables_chirho.findIndex(
						(rowChirho) => rowChirho.stressed_chirho
					);
					if (indexChirho < 0) continue;
					const keyChirho = formKeyChirho(tokenChirho, readingChirho.replace(/׃/gu, '')),
						candidatesChirho = stressesChirho.get(keyChirho) ?? new Map<number, string>();
					candidatesChirho.set(indexChirho, verseChirho.id_chirho + '!' + tokenChirho.id_chirho);
					stressesChirho.set(keyChirho, candidatesChirho);
				} catch {
					/* Other uncertain source words cannot become stress evidence. */
				}
			}
	const knownWordsChirho = new Map(
		knownChirho.verses_chirho.flatMap((verseChirho) =>
			verseChirho.words_chirho.map(
				(wordChirho) => [wordChirho.token_id_chirho, wordChirho] as const
			)
		)
	);
	const libraryChirho = new Map<string, LibraryWordChirho>();
	const holdsChirho: {
		lesson_id_chirho: string;
		token_id_chirho: string;
		text_chirho: string;
		reason_chirho: string;
	}[] = [];
	for (const chapterChirho of chaptersChirho)
		for (const verseChirho of chapterChirho.verses_chirho)
			for (const tokenChirho of verseChirho.tokens_chirho) {
				const textChirho = spokenWordChirho(tokenChirho);
				try {
					if (
						'source_language_chirho' in tokenChirho &&
						tokenChirho.source_language_chirho === 'arc'
					)
						throw new Error('Aramaic needs its own reviewed pronunciation analysis.');
					if (
						'written_reading_chirho' in tokenChirho &&
						tokenChirho.written_reading_chirho === 'ketiv' &&
						!('qere_chirho' in tokenChirho && tokenChirho.qere_chirho?.length)
					)
						throw new Error('Written ketiv has no unambiguous attached qere reading.');
					let ipaChirho: string | undefined,
						analysisNoteChirho =
							'Native Modern Greek, exact accented source; capitalization and canonically equivalent marks folded on the synthesis copy only.';
					const recipeChirho =
						bibleBookChirho(chapterChirho.book_chirho).language_chirho === 'grc'
							? GREEK_WORD_RECIPE_CHIRHO
							: HEBREW_WORD_RECIPE_CHIRHO;
					if (bibleBookChirho(chapterChirho.book_chirho).language_chirho === 'he') {
						const hebrewChirho = tokenChirho as TokenChirho;
						const knownWordChirho = knownWordsChirho.get(tokenChirho.id_chirho);
						const reviewedChirho = ipaNoteChirho(hebrewChirho);
						if (reviewedChirho) {
							ipaChirho = reviewedChirho.ipa_chirho;
							analysisNoteChirho = reviewedChirho.explanation_chirho.en;
						} else if (
							knownWordChirho &&
							knownWordChirho.text_chirho === tokenChirho.text_chirho &&
							knownWordChirho.spoken_text_chirho === textChirho &&
							knownWordChirho.raw_morphology_chirho === tokenChirho.raw_morphology_chirho
						) {
							ipaChirho = knownWordChirho.ipa_chirho;
							analysisNoteChirho =
								'Existing source-bound Proverbs 26 IPA analysis; pending listener review.';
						} else {
							const divineChirho = divineNameReadingChirho(hebrewChirho);
							let readingChirho = divineChirho?.analysis_text_chirho ?? textChirho;
							const multiwordQereChirho =
								!!hebrewChirho.qere_chirho?.length && /\s/u.test(textChirho);
							const parseChirho = (overrideChirho?: number) =>
								multiwordQereChirho
									? qerePhoneticsChirho(readingChirho)
									: wordPhoneticsChirho(readingChirho, overrideChirho);
							if (
								verseChirho.tokens_chirho.at(-1) === tokenChirho &&
								verseChirho.canonical_text_chirho.slice(hebrewChirho.end_chirho).includes('׃')
							)
								readingChirho += '׃';
							let overrideChirho = reviewsChirho.reviews_chirho.find(
								(rowChirho) =>
									rowChirho.token_id_chirho === tokenChirho.id_chirho &&
									rowChirho.text_chirho === textChirho
							)?.syllable_chirho;
							analysisNoteChirho = divineChirho
								? `Traditional reading ${divineChirho.name_chirho}; source display unchanged.`
								: 'Source accent and pointed-form analysis; pending listener review.';
							if (overrideChirho === undefined) {
								try {
									parseChirho();
								} catch {
									const candidatesChirho = stressesChirho.get(
										formKeyChirho(hebrewChirho, textChirho)
									);
									if (candidatesChirho?.size !== 1)
										throw new Error('Source stress needs a checked pronunciation');
									overrideChirho = candidatesChirho.keys().next().value;
									analysisNoteChirho =
										'Stress from identical pointed form, lemma and morphology at ' +
										candidatesChirho.values().next().value +
										'; pending listener review.';
								}
							}

							ipaChirho = parseChirho(overrideChirho).ipa_chirho;
						}
					}
					const inputChirho = productionWordRecipeChirho(textChirho, recipeChirho, ipaChirho);
					if (!inputChirho) throw new Error('Unrepresentable word pronunciation');
					const jobChirho: AudioJobChirho = {
						id_chirho: 'pending-chirho',
						lesson_id_chirho: verseChirho.id_chirho,
						token_id_chirho: tokenChirho.id_chirho,
						language_chirho:
							bibleBookChirho(chapterChirho.book_chirho).language_chirho === 'grc' ? 'el' : 'he',
						text_chirho: textChirho,
						canonical_sha256_chirho: sha256Chirho(verseChirho.canonical_text_chirho),
						recipe_id_chirho: recipeChirho,
						...inputChirho
					};
					const keyChirho = cacheKeyChirho(jobChirho);
					jobChirho.id_chirho = `word-${keyChirho.slice(0, 24)}-chirho`;
					const occurrenceChirho: WordOccurrenceChirho = {
						lesson_id_chirho: verseChirho.id_chirho,
						token_id_chirho: tokenChirho.id_chirho,
						text_chirho: textChirho,
						canonical_sha256_chirho: jobChirho.canonical_sha256_chirho,
						content_path_chirho: chapterChirho.path_chirho,
						content_sha256_chirho: chapterChirho.sha256_chirho
					};
					const existingChirho = libraryChirho.get(keyChirho);
					if (existingChirho) existingChirho.occurrences_chirho.push(occurrenceChirho);
					else
						libraryChirho.set(keyChirho, {
							key_chirho: keyChirho,
							job_chirho: jobChirho,
							occurrences_chirho: [occurrenceChirho],
							analysis_note_chirho: analysisNoteChirho
						});
				} catch (errorChirho) {
					holdsChirho.push({
						lesson_id_chirho: verseChirho.id_chirho,
						token_id_chirho: tokenChirho.id_chirho,
						text_chirho: textChirho,
						reason_chirho: errorChirho instanceof Error ? errorChirho.message : 'Unresolved word'
					});
				}
			}
	const homeChirho = joinChirho(
		rootChirho,
		wholeBibleChirho ? 'workspace-chirho/audio-chirho/bible-2026-11-02-chirho' : WORD_HOME_CHIRHO
	);
	await mkdirChirho(homeChirho, { recursive: true });
	const batchesChirho = [];
	const wordsChirho = [...libraryChirho.values()];
	for (let indexChirho = 0; indexChirho < wordsChirho.length; indexChirho += 96) {
		const numberChirho = Math.floor(indexChirho / 96),
			groupChirho = String(Math.floor(numberChirho / 10) * 10).padStart(4, '0');
		const folderChirho = `batches-chirho/${groupChirho}-chirho/batch-${String(numberChirho).padStart(4, '0')}-chirho`;
		const pathChirho = folderChirho + '/plan-chirho.json';
		const dataChirho =
			JSON.stringify(
				{
					schema_version_chirho: 1,
					words_chirho: wordsChirho.slice(indexChirho, indexChirho + 96)
				},
				null,
				2
			) + '\n';
		const existingChirho = await readFileChirho(joinChirho(homeChirho, pathChirho), 'utf8').catch(
			(errorChirho) => {
				if (errorChirho.code === 'ENOENT') return null;
				throw errorChirho;
			}
		);
		if (existingChirho !== null && existingChirho !== dataChirho)
			throw new Error(
				'Prepared word queue changed; extend it without overwriting existing requests'
			);
		if (existingChirho === null) await writeChirho(joinChirho(homeChirho, pathChirho), dataChirho);
		batchesChirho.push({
			path_chirho: pathChirho,
			sha256_chirho: sha256Chirho(dataChirho),
			count_chirho: Math.min(96, wordsChirho.length - indexChirho)
		});
	}
	const reportChirho = {
		schema_version_chirho: 1,
		authority_chirho:
			'L.J., 2026-10-31: prioritize the reusable word library, retain natural recordings; finish what can be done with Modern Greek and Hebrew IPA.',
		maximum_total_credits_chirho: 270000,
		historical_reserved_credits_chirho: 10660,
		word_count_chirho: wordsChirho.length,
		occurrence_count_chirho: wordsChirho.reduce(
			(totalChirho, rowChirho) => totalChirho + rowChirho.occurrences_chirho.length,
			0
		),
		held_occurrences_chirho: holdsChirho.length,
		estimated_new_credits_chirho: wordsChirho.reduce(
			(totalChirho, rowChirho) =>
				totalChirho + [...rowChirho.job_chirho.synthesis_text_chirho!].length,
			0
		),
		batches_chirho: batchesChirho
	};
	await writeChirho(
		joinChirho(homeChirho, 'index-chirho.json'),
		JSON.stringify(reportChirho, null, 2) + '\n'
	);
	await writeChirho(
		joinChirho(homeChirho, 'pronunciation-holds-chirho.json'),
		JSON.stringify({ schema_version_chirho: 1, holds_chirho: holdsChirho }, null, 2) + '\n'
	);
	return reportChirho;
}
if (import.meta.main)
	console.log(
		JSON.stringify(
			await prepareWordsChirho(resolveChirho('.'), process.argv.includes('--whole-bible-chirho')),
			null,
			2
		)
	);
