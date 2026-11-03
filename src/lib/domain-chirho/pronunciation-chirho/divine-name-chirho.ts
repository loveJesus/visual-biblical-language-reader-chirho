// For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life. — John 3:16 (KJV)

const NAME_CHIRHO = /י[\u0591-\u05c7]*ה[\u0591-\u05c7]*ו[\u0591-\u05c7]*ה[\u0591-\u05c7]*/u;
export const DIVINE_NAME_SOURCE_CHIRHO =
	'https://www.sefaria.org/topics/the-tetragrammaton?tab=sources';

/** Traditional reading cue, not a reconstruction of the Name; displayed source stays untouched. */
export function divineNameReadingChirho(tokenChirho: {
	text_chirho: string;
	lemma_id_chirho?: string;
}) {
	if (
		!['H3068', 'H3069'].includes(tokenChirho.lemma_id_chirho ?? '') ||
		!NAME_CHIRHO.test(tokenChirho.text_chirho)
	)
		return null;
	const elohimChirho = tokenChirho.lemma_id_chirho === 'H3069';
	return {
		name_chirho: elohimChirho ? 'Elohim' : 'Adonai',
		ipa_chirho: elohimChirho ? 'ʔeloˈhim' : 'ʔadoˈnaj',
		// The analysis spelling carries explicit final stress. Prefixes remain from the source.
		analysis_text_chirho: tokenChirho.text_chirho.replace(
			NAME_CHIRHO,
			elohimChirho ? 'אֱלֹהִ֑ים' : 'אֲדֹנָ֑י'
		)
	};
}
