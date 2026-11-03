// For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life. — John 3:16 (KJV)
// Workflow: reusable-word-audio-chirho.md. Source accents, never the parser's fallback stress.
import { Text as TextChirho } from 'havarotjs';
import { hebrewPhoneticsChirho } from './hebrew-phonetics-chirho';

// Positional helpers and pre/postpositive marks cannot independently locate primary stress.
// See Unicode L2/25-242 and https://mechon-mamre.org/c/hr/codes.htm.
const DIRECT_ACCENTS_CHIRHO =
	/[\u0591\u0593-\u0597\u059b\u059c\u059e\u059f\u05a1-\u05a8\u05aa\u05ac]/u;
export function wordPhoneticsChirho(sourceChirho: string, overrideChirho?: number) {
	const analysisChirho = sourceChirho.replace(/[־׀]/gu, '');
	const wordsChirho = new TextChirho(analysisChirho, {
		strict: true,
		longVowels: false
	}).words.filter((wordChirho) => !wordChirho.isNotHebrew);
	if (wordsChirho.length !== 1) throw new Error('A word-library entry needs one reading');
	const syllablesChirho = wordsChirho[0].syllables;
	let indexChirho = overrideChirho;
	if (indexChirho === undefined) {
		const candidatesChirho = syllablesChirho.flatMap((rowChirho, numberChirho) =>
			DIRECT_ACCENTS_CHIRHO.test(rowChirho.text) ? [numberChirho] : []
		);
		if (candidatesChirho.length === 1) indexChirho = candidatesChirho[0];
		else if (candidatesChirho.length > 1) throw new Error('Conflicting source stress marks');
		else if (syllablesChirho.length === 1) indexChirho = 0;
		else if (analysisChirho.includes('׃')) {
			// Silluq shares U+05BD with meteg; the final such mark before sof pasuq is silluq.
			indexChirho = syllablesChirho.findLastIndex((rowChirho) => rowChirho.text.includes('\u05bd'));
			if (indexChirho < 0) throw new Error('Verse-final stress is unmarked');
		} else if (analysisChirho.includes('\u0599')) {
			// WLC doubles pashta (or supplies qadma) for non-final stress.
			indexChirho = syllablesChirho.findIndex((rowChirho) => rowChirho.text.includes('\u0599'));
		} else throw new Error('Non-positional or absent accent needs checked stress evidence');
	}
	return hebrewPhoneticsChirho(analysisChirho, indexChirho);
}
