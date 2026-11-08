// For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life. — John 3:16 (KJV)

import { expect as expectChirho, test as testChirho } from 'vitest';
import { verseStudyNotesChirho } from './study-aids-chirho';

const PROCESS_CHIRHO =
	'Uncurated: lemma and morphology as OSHB gives them; the analysis is generated from its code tables.';
const VERSE_CHIRHO =
	'No English gloss: GBT and OSHB list a different number of words for this verse.';
const WORD_CHIRHO =
	'The wayyiqtol form has no local conjugation letter; it is not shown as qatal or yiqtol.';

testChirho(
	'a caution every word repeats is kept once for the verse; word notes stay on their cards',
	() => {
		const { verseNotesChirho, cardNotesChirho } = verseStudyNotesChirho([
			{ id_chirho: 'a', source_note_chirho: `${PROCESS_CHIRHO} ${WORD_CHIRHO} ${VERSE_CHIRHO}` },
			{ id_chirho: 'b', source_note_chirho: `${PROCESS_CHIRHO} ${VERSE_CHIRHO}` },
			{ id_chirho: 'c', source_note_chirho: `${VERSE_CHIRHO}` }
		]);
		expectChirho(verseNotesChirho).toEqual([VERSE_CHIRHO]);
		expectChirho([...cardNotesChirho]).toEqual([
			['a', WORD_CHIRHO],
			['b', null],
			['c', null]
		]);
	}
);

testChirho('a note only some words carry, or a one-word verse, stays on its card', () => {
	const someChirho = verseStudyNotesChirho([
		{ id_chirho: 'a', source_note_chirho: `${PROCESS_CHIRHO} ${WORD_CHIRHO}` },
		{ id_chirho: 'b', source_note_chirho: PROCESS_CHIRHO }
	]);
	expectChirho(someChirho.verseNotesChirho).toEqual([]);
	expectChirho(someChirho.cardNotesChirho.get('a')).toBe(WORD_CHIRHO);
	expectChirho(someChirho.cardNotesChirho.get('b')).toBeNull();
	const oneChirho = verseStudyNotesChirho([{ id_chirho: 'a', source_note_chirho: VERSE_CHIRHO }]);
	expectChirho(oneChirho.verseNotesChirho).toEqual([]);
	expectChirho(oneChirho.cardNotesChirho.get('a')).toBe(VERSE_CHIRHO);
});

testChirho('a word that needs source review keeps its whole note on its card', () => {
	const { verseNotesChirho, cardNotesChirho } = verseStudyNotesChirho([
		{
			id_chirho: 'a',
			source_note_chirho: `${PROCESS_CHIRHO} ${VERSE_CHIRHO}`,
			analysis_status_chirho: 'source_review_required'
		},
		{ id_chirho: 'b', source_note_chirho: WORD_CHIRHO }
	]);
	expectChirho(verseNotesChirho).toEqual([]);
	expectChirho(cardNotesChirho.get('a')).toBe(`${PROCESS_CHIRHO} ${VERSE_CHIRHO}`);
});
