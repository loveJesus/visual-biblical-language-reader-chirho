// For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life. — John 3:16 (KJV)
// Workflow: local-reader-chirho.md. Fixed trial delivery directions are separate from canonical text.
import phoneticsChirho from '../../../../data-chirho/audio-chirho/proverbs-26-phonetics-chirho.json';
import greekRenditionsChirho from './greek-renditions-chirho.json';
import { spokenVerseChirho, spokenWordChirho } from '../pronunciation-chirho';
import { BIBLE_BOOKS_CHIRHO } from '../../bible-chirho/books-chirho';
import {
	LOCAL_GREEK_VERSE_RECIPE_CHIRHO,
	localGreekVerseTextChirho
} from './greek-chirho/local-verse-chirho';

export const HEBREW_CHAPTER_RECIPE_CHIRHO = 'israeli-ipa-phrasing-v1-chirho';
export const HEBREW_CONNECTED_RECIPE_CHIRHO = 'israeli-ipa-connected-v2-chirho';
export const GREEK_CHAPTER_RECIPE_CHIRHO = 'modern-greek-phrasing-v1-chirho';
export const GREEK_ROUGH_RECIPE_CHIRHO = 'modern-vowels-rough-breathing-v2-chirho';
export const GREEK_ERASMIAN_RECIPE_CHIRHO = 'erasmian-teaching-v1-chirho';
export function greekPronunciationChirho(recipeChirho: unknown) {
	return recipeChirho === GREEK_ROUGH_RECIPE_CHIRHO
		? 'modern_greek_aspirates'
		: recipeChirho === GREEK_ERASMIAN_RECIPE_CHIRHO
			? 'erasmian_greek'
			: 'modern_greek';
}
interface RecipeLessonChirho {
	id_chirho: string;
	canonical_text_chirho: string;
	tokens_chirho: {
		id_chirho: string;
		text_chirho: string;
		start_chirho: number;
		end_chirho: number;
		lemma_id_chirho?: string;
		lemma_augment_chirho?: string | null;
		raw_morphology_chirho?: string;
		qere_chirho?: { text_chirho: string }[];
	}[];
}

/** Requested timing classes, not promised millisecond durations or a cantillation melody. */
export function chapterRecipeChirho(
	lessonChirho: RecipeLessonChirho,
	recipeIdChirho: unknown
): {
	ipa_chirho?: string;
	synthesis_text_chirho: string;
} | null {
	if (
		recipeIdChirho === LOCAL_GREEK_VERSE_RECIPE_CHIRHO &&
		BIBLE_BOOKS_CHIRHO.some(
			(bookChirho) =>
				bookChirho.language_chirho === 'grc' &&
				lessonChirho.id_chirho.startsWith(bookChirho.id_chirho + '.')
		)
	)
		return { synthesis_text_chirho: localGreekVerseTextChirho(lessonChirho.canonical_text_chirho) };
	if (
		recipeIdChirho === HEBREW_CHAPTER_RECIPE_CHIRHO ||
		recipeIdChirho === HEBREW_CONNECTED_RECIPE_CHIRHO
	) {
		const verseChirho = phoneticsChirho.verses_chirho.find(
			(rowChirho) =>
				rowChirho.lesson_id_chirho === lessonChirho.id_chirho &&
				rowChirho.canonical_text_chirho === lessonChirho.canonical_text_chirho
		);
		if (!verseChirho || verseChirho.words_chirho.length !== lessonChirho.tokens_chirho.length)
			return null;
		for (let indexChirho = 0; indexChirho < verseChirho.words_chirho.length; indexChirho++) {
			const wordChirho = verseChirho.words_chirho[indexChirho],
				tokenChirho = lessonChirho.tokens_chirho[indexChirho];
			if (
				wordChirho.token_id_chirho !== tokenChirho.id_chirho ||
				wordChirho.text_chirho !== tokenChirho.text_chirho ||
				wordChirho.spoken_text_chirho !== spokenWordChirho(tokenChirho) ||
				wordChirho.lemma_id_chirho !== tokenChirho.lemma_id_chirho ||
				wordChirho.lemma_augment_chirho !== (tokenChirho.lemma_augment_chirho ?? null) ||
				wordChirho.raw_morphology_chirho !== tokenChirho.raw_morphology_chirho
			)
				return null;
		}
		if (recipeIdChirho === HEBREW_CONNECTED_RECIPE_CHIRHO) {
			// One phonetic utterance, not separate quoted words: only the major clause gets a comma.
			// Maqqef remains an ordinary word boundary within its linked accentual group.
			const phraseChirho = verseChirho.words_chirho
				.map(
					(wordChirho, indexChirho) =>
						wordChirho.ipa_chirho +
						(indexChirho < verseChirho.words_chirho.length - 1 &&
						wordChirho.text_chirho.includes('\u0591')
							? ','
							: '')
				)
				.join(' ');
			return {
				ipa_chirho: verseChirho.ipa_chirho,
				synthesis_text_chirho: `[warm] "/${phraseChirho}/".`
			};
		}
		let inputChirho = '[warm] ',
			groupChirho: string[] = [];
		for (let indexChirho = 0; indexChirho < verseChirho.words_chirho.length; indexChirho++) {
			const wordChirho = verseChirho.words_chirho[indexChirho];
			groupChirho.push(wordChirho.ipa_chirho);
			if (wordChirho.gap_after_chirho.includes('־')) continue;
			inputChirho += `"/${groupChirho.join(' ')}/"`;
			groupChirho = [];
			if (indexChirho === verseChirho.words_chirho.length - 1) inputChirho += '.';
			else if (wordChirho.text_chirho.includes('\u0591')) inputChirho += ' [short pause] ';
			else if (
				wordChirho.gap_after_chirho.includes('׀') ||
				wordChirho.text_chirho.includes('\u0597')
			)
				inputChirho += ' [brief pause] ';
			else inputChirho += ', ';
		}
		return { ipa_chirho: verseChirho.ipa_chirho, synthesis_text_chirho: inputChirho };
	}
	if (
		(recipeIdChirho === GREEK_CHAPTER_RECIPE_CHIRHO ||
			recipeIdChirho === GREEK_ROUGH_RECIPE_CHIRHO ||
			recipeIdChirho === GREEK_ERASMIAN_RECIPE_CHIRHO) &&
		/^John\.1\.(?:[1-9]|[1-4]\d|5[01])$/.test(lessonChirho.id_chirho)
	) {
		let spokenChirho = spokenVerseChirho(lessonChirho);
		if (recipeIdChirho !== GREEK_CHAPTER_RECIPE_CHIRHO) {
			const reviewChirho = greekRenditionsChirho.verses_chirho.find(
				(rowChirho) =>
					rowChirho.lesson_id_chirho === lessonChirho.id_chirho &&
					rowChirho.canonical_text_chirho === lessonChirho.canonical_text_chirho
			);
			if (
				!reviewChirho ||
				reviewChirho.tokens_chirho.length !== lessonChirho.tokens_chirho.length ||
				reviewChirho.tokens_chirho.some((wordChirho, indexChirho) => {
					const tokenChirho = lessonChirho.tokens_chirho[indexChirho];
					return (
						wordChirho.id_chirho !== tokenChirho.id_chirho ||
						wordChirho.text_chirho !== tokenChirho.text_chirho ||
						wordChirho.lemma_id_chirho !== tokenChirho.lemma_id_chirho
					);
				})
			)
				return null;
			if (recipeIdChirho === GREEK_ERASMIAN_RECIPE_CHIRHO)
				return {
					ipa_chirho: reviewChirho.erasmian_ipa_chirho,
					synthesis_text_chirho: `[warm] "/${reviewChirho.erasmian_ipa_chirho}/".`
				};
			// Exact reviewed forms only, keeping the existing native Greek delivery around them.
			if (lessonChirho.id_chirho === 'John.1.2')
				spokenChirho = spokenChirho.replace(/^Οὗτος/u, '"/ˈhutos/"');
			else
				for (const tokenChirho of [...lessonChirho.tokens_chirho].reverse()) {
					if (tokenChirho.text_chirho === 'ὁ')
						spokenChirho =
							spokenChirho.slice(0, tokenChirho.start_chirho) +
							'"/ho/"' +
							spokenChirho.slice(tokenChirho.end_chirho);
				}
		}
		const inputChirho = spokenChirho
			.replace(/([,\u0387\u00b7])/gu, (markChirho) => markChirho + ' [brief pause] ')
			.replace(/([;\u037e.!?])/gu, (markChirho) => markChirho + ' [short pause] ');
		return { synthesis_text_chirho: '[warm] ' + inputChirho.trim() };
	}
	return null;
}
