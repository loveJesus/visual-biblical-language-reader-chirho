// For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life. — John 3:16 (KJV)
// Workflow: local-reader-chirho.md. General process explanations live on About; source-specific cautions stay with their word.
export const STUDY_AIDS_SECTION_CHIRHO = 'study-aids-chirho';
export function specificSourceNoteChirho(tokenChirho: {
	source_note_chirho?: string;
	analysis_status_chirho?: string;
	lemma_assignment_status_chirho?: string;
}): string | null {
	const noteChirho = tokenChirho.source_note_chirho;
	if (!noteChirho) return null;
	if (
		tokenChirho.analysis_status_chirho === 'source_review_required' ||
		tokenChirho.lemma_assignment_status_chirho === 'source_review_required'
	)
		return noteChirho;
	// Strip only recognized process sentences, keeping any additional source caution.
	return (
		noteChirho
			.replace(
				/^(?:Uncurated OSHB source analysis\.|Uncurated: lemma and morphology as OSHB gives them; the analysis is generated from its code tables\.|Uncurated: Nestle 1904 word with the biblicalhumanities CC0 parse as given; the analysis is generated from parsing\.txt\.)\s*/u,
				''
			)
			.replace(/English gloss: Global Bible Tools approved export\.(?:\s|$)/u, '')
			.replace(
				/English gloss: Berean Interlinear Bible, public domain as Berean states; not a GBT approval\.(?:\s|$)/u,
				''
			)
			.trim() || null
	);
}
