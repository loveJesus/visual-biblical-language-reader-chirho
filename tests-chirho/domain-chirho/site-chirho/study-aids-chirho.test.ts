// For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life. — John 3:16 (KJV)
import { expect as expectChirho, it as itChirho } from 'vitest';
import { specificSourceNoteChirho } from '../../../src/lib/bible-chirho/study-aids-chirho';

itChirho(
	'centralizes known boilerplate while retaining source-specific cautions and unknown notes',
	() => {
		expectChirho(
			specificSourceNoteChirho({
				source_note_chirho:
					'Uncurated OSHB source analysis. English gloss: Global Bible Tools approved export.'
			})
		).toBeNull();
		const noteChirho = 'This token has an unresolved source assignment.';
		const greekChirho =
			'Uncurated: Nestle 1904 word with the biblicalhumanities CC0 parse as given; the analysis is generated from parsing.txt. English gloss: Berean Interlinear Bible, public domain as Berean states; not a GBT approval.';
		expectChirho(specificSourceNoteChirho({ source_note_chirho: greekChirho })).toBeNull();
		expectChirho(
			specificSourceNoteChirho({ source_note_chirho: greekChirho + ' ' + noteChirho })
		).toBe(noteChirho);
		expectChirho(specificSourceNoteChirho({ source_note_chirho: noteChirho })).toBe(noteChirho);
		expectChirho(
			specificSourceNoteChirho({
				source_note_chirho:
					'Uncurated OSHB source analysis. English gloss: Global Bible Tools approved export. ' +
					noteChirho
			})
		).toBe(noteChirho);
		const generalChirho =
			'Uncurated: lemma and morphology as OSHB gives them; source needs inspection.';
		expectChirho(
			specificSourceNoteChirho({
				source_note_chirho: generalChirho,
				lemma_assignment_status_chirho: 'source_review_required'
			})
		).toBe(generalChirho);
		expectChirho(
			specificSourceNoteChirho({
				source_note_chirho: generalChirho,
				analysis_status_chirho: 'source_review_required'
			})
		).toBe(generalChirho);
	}
);
