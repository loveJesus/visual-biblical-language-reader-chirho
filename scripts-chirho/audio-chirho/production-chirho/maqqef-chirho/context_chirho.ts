// For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life. — John 3:16 (KJV)
// Workflow: reusable-word-audio-chirho.md. Cold source validation, never a guessed stress fallback.
import { readFile as readFileChirho } from 'node:fs/promises';
import { createHash as createHashChirho } from 'node:crypto';
import { join as joinChirho } from 'node:path';
import { isBibleChapterPathChirho } from '../../../../src/lib/bible-chirho/books-chirho';
import { hebrewPhoneticsChirho } from '../../../../src/lib/domain-chirho/pronunciation-chirho/hebrew-chirho/hebrew-phonetics-chirho';
import { wordPhoneticsChirho } from '../../../../src/lib/domain-chirho/pronunciation-chirho/hebrew-chirho/word-phonetics-chirho';
import { divineNameReadingChirho } from '../../../../src/lib/domain-chirho/pronunciation-chirho/divine-name-chirho';
import {
	HEBREW_WORD_RECIPE_CHIRHO,
	productionWordRecipeChirho
} from '../../../../src/lib/domain-chirho/pronunciation-chirho/production-recipe-chirho';
import type { LibraryWordChirho } from '../prepare_words_chirho';

interface MaqqefTokenChirho {
	id_chirho: string;
	text_chirho: string;
	start_chirho: number;
	end_chirho: number;
	qere_chirho?: { text_chirho: string }[];
	written_reading_chirho?: string;
	source_language_chirho?: string;
	raw_morphology_chirho?: string;
	lemma_id_chirho?: string;
}
export interface MaqqefVerseChirho {
	id_chirho: string;
	canonical_text_chirho: string;
	tokens_chirho: MaqqefTokenChirho[];
}
interface MaqqefScopeChirho {
	id_chirho?: unknown;
	source_context_chirho?: unknown;
	maqqef_group_chirho?: unknown;
	job_chirho?: { id_chirho: string };
	occurrences_chirho?: readonly { maqqef_group_chirho?: unknown }[];
}
interface MaqqefOccurrenceChirho {
	token_id_chirho: string;
	text_chirho: string;
	maqqef_group_chirho?: unknown;
}
interface MaqqefInputChirho {
	language_chirho?: unknown;
	recipe_id_chirho?: unknown;
	ipa_chirho?: unknown;
	synthesis_text_chirho?: unknown;
}
const hashChirho = (bytesChirho: string | Buffer) =>
	createHashChirho('sha256').update(bytesChirho).digest('hex');

/** Existing maqqef job IDs keep a deleted proof from silently becoming a legacy word. */
export function maqqefContextRequiredChirho(valueChirho: MaqqefScopeChirho): boolean {
	return (
		valueChirho.source_context_chirho !== undefined ||
		valueChirho.maqqef_group_chirho !== undefined ||
		(typeof valueChirho.id_chirho === 'string' && valueChirho.id_chirho.startsWith('maqqef-')) ||
		valueChirho.job_chirho?.id_chirho.startsWith('maqqef-') === true ||
		valueChirho.occurrences_chirho?.some(
			(occurrenceChirho) => occurrenceChirho.maqqef_group_chirho !== undefined
		) === true
	);
}

/** GKC16a/29a: a nonfinal maqqef member has no independent primary tone. */
export function deriveMaqqefContextChirho(verseChirho: MaqqefVerseChirho, tokenIdChirho: string) {
	const firstChirho = verseChirho.tokens_chirho.findIndex(
		(tokenChirho) => tokenChirho.id_chirho === tokenIdChirho
	);
	if (firstChirho < 0) throw new Error('Maqqef source token missing');
	let lastChirho = firstChirho;
	while (
		lastChirho + 1 < verseChirho.tokens_chirho.length &&
		verseChirho.canonical_text_chirho.slice(
			verseChirho.tokens_chirho[lastChirho].end_chirho,
			verseChirho.tokens_chirho[lastChirho + 1].start_chirho
		) === '־'
	)
		lastChirho++;
	const membersChirho = verseChirho.tokens_chirho.slice(firstChirho, lastChirho + 1);
	if (membersChirho.length < 2) throw new Error('Maqqef source has no exact following join');
	if (membersChirho.some((tokenChirho) => divineNameReadingChirho(tokenChirho)))
		throw new Error('Maqqef divine-name member needs an explicit profile');
	if (
		membersChirho.some(
			(tokenChirho) =>
				tokenChirho.qere_chirho?.length ||
				tokenChirho.written_reading_chirho === 'ketiv' ||
				tokenChirho.source_language_chirho === 'arc' ||
				tokenChirho.raw_morphology_chirho?.startsWith('A') ||
				!Number.isSafeInteger(tokenChirho.start_chirho) ||
				!Number.isSafeInteger(tokenChirho.end_chirho) ||
				tokenChirho.start_chirho < 0 ||
				tokenChirho.end_chirho <= tokenChirho.start_chirho ||
				verseChirho.canonical_text_chirho.slice(
					tokenChirho.start_chirho,
					tokenChirho.end_chirho
				) !== tokenChirho.text_chirho
		)
	)
		throw new Error('Maqqef source span, language or qere needs explicit review');
	if (
		membersChirho
			.slice(0, -1)
			.some((tokenChirho) => /[\u0591-\u05af]/u.test(tokenChirho.text_chirho))
	)
		throw new Error('Maqqef nonfinal source accent needs explicit review');
	const tailChirho = membersChirho.at(-1)!;
	const finalChirho =
		lastChirho === verseChirho.tokens_chirho.length - 1 &&
		verseChirho.canonical_text_chirho.slice(tailChirho.end_chirho).includes('׃')
			? '׃'
			: '';
	const groupChirho =
		verseChirho.canonical_text_chirho.slice(membersChirho[0].start_chirho, tailChirho.end_chirho) +
		finalChirho;
	const phoneticsChirho = hebrewPhoneticsChirho(groupChirho);
	const headChirho = phoneticsChirho.words_chirho[0];
	if (
		phoneticsChirho.words_chirho.length !== membersChirho.length ||
		!headChirho.maqqef_linked_chirho ||
		headChirho.syllables_chirho.some((syllableChirho) => syllableChirho.stressed_chirho) ||
		/[ˈˌ]/u.test(headChirho.ipa_chirho) ||
		phoneticsChirho.words_chirho.at(-1)!.ipa_chirho !==
			wordPhoneticsChirho(tailChirho.text_chirho + finalChirho).ipa_chirho
	)
		throw new Error('Maqqef group and checked tail pronunciation disagree');
	return { group_chirho: groupChirho, ipa_chirho: headChirho.ipa_chirho };
}

export function verifyMaqqefOccurrenceChirho(
	verseChirho: MaqqefVerseChirho,
	occurrenceChirho: MaqqefOccurrenceChirho,
	inputChirho: MaqqefInputChirho,
	contextChirho?: unknown
) {
	if (contextChirho !== undefined && contextChirho !== 'maqqef_chirho')
		throw new Error('Unsupported maqqef source context');
	if (typeof occurrenceChirho.maqqef_group_chirho !== 'string')
		throw new Error('Maqqef context proof missing');
	const derivedChirho = deriveMaqqefContextChirho(verseChirho, occurrenceChirho.token_id_chirho);
	const tokenChirho = verseChirho.tokens_chirho.find(
		(valueChirho) => valueChirho.id_chirho === occurrenceChirho.token_id_chirho
	)!;
	const recipeChirho = productionWordRecipeChirho(
		occurrenceChirho.text_chirho,
		HEBREW_WORD_RECIPE_CHIRHO,
		derivedChirho.ipa_chirho
	);
	if (
		inputChirho.language_chirho !== 'he' ||
		inputChirho.recipe_id_chirho !== HEBREW_WORD_RECIPE_CHIRHO ||
		tokenChirho.text_chirho !== occurrenceChirho.text_chirho ||
		occurrenceChirho.maqqef_group_chirho !== derivedChirho.group_chirho ||
		inputChirho.ipa_chirho !== derivedChirho.ipa_chirho ||
		!recipeChirho ||
		inputChirho.synthesis_text_chirho !== recipeChirho.synthesis_text_chirho
	)
		throw new Error('Maqqef source context and pronunciation differ');
	return derivedChirho;
}

/** Complete preflight before installer asset writes or uploads; legacy words retain their path. */
export async function verifyMaqqefWordSourcesChirho(
	rootChirho: string,
	wordsChirho: readonly LibraryWordChirho[]
) {
	const chaptersChirho = new Map<
		string,
		{ hash_chirho: string; verses_chirho: MaqqefVerseChirho[] }
	>();
	for (const wordChirho of wordsChirho) {
		if (!maqqefContextRequiredChirho(wordChirho)) continue;
		if (!wordChirho.occurrences_chirho.length) throw new Error('Maqqef source occurrences missing');
		for (const occurrenceChirho of wordChirho.occurrences_chirho) {
			if (!isBibleChapterPathChirho(occurrenceChirho.content_path_chirho, '/content-chirho/'))
				throw new Error('Maqqef source path refused');
			let chapterChirho = chaptersChirho.get(occurrenceChirho.content_path_chirho);
			if (!chapterChirho) {
				const bytesChirho = await readFileChirho(
					joinChirho(rootChirho, 'static', occurrenceChirho.content_path_chirho)
				);
				chapterChirho = {
					hash_chirho: hashChirho(bytesChirho),
					verses_chirho: JSON.parse(bytesChirho.toString('utf8')).verses_chirho
				};
				chaptersChirho.set(occurrenceChirho.content_path_chirho, chapterChirho);
			}
			if (chapterChirho.hash_chirho !== occurrenceChirho.content_sha256_chirho)
				throw new Error('Maqqef source chapter changed');
			const verseChirho = chapterChirho.verses_chirho.find(
				(valueChirho) => valueChirho.id_chirho === occurrenceChirho.lesson_id_chirho
			);
			if (
				!verseChirho ||
				hashChirho(verseChirho.canonical_text_chirho) !== occurrenceChirho.canonical_sha256_chirho
			)
				throw new Error('Maqqef canonical source changed');
			verifyMaqqefOccurrenceChirho(
				verseChirho,
				occurrenceChirho,
				wordChirho.job_chirho,
				wordChirho.source_context_chirho
			);
		}
	}
}
