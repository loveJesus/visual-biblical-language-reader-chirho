// For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life. — John 3:16 (KJV)
// Workflow: verse-media-chirho.md. Deterministic spelling of the local plain-Modern voice input.
export const LOCAL_GREEK_VERSE_RECIPE_CHIRHO = 'chatterbox-v3-modern-greek-verse-v1-chirho';
const VOWELS_CHIRHO = new Set('αεηιουω');
const DIPHTHONGS_CHIRHO = new Set(['αι', 'ει', 'οι', 'υι', 'αυ', 'ευ', 'ου', 'ηυ']);

function syllablesChirho(wordChirho: string): number {
	const lettersChirho: { textChirho: string; diaeresisChirho: boolean }[] = [];
	for (const characterChirho of wordChirho.toLowerCase().normalize('NFD')) {
		if (/\p{L}/u.test(characterChirho))
			lettersChirho.push({ textChirho: characterChirho, diaeresisChirho: false });
		else if (characterChirho === '\u0308' && lettersChirho.length)
			lettersChirho[lettersChirho.length - 1].diaeresisChirho = true;
	}
	let countChirho = 0;
	for (let indexChirho = 0; indexChirho < lettersChirho.length; indexChirho++) {
		if (!VOWELS_CHIRHO.has(lettersChirho[indexChirho].textChirho)) continue;
		countChirho++;
		const nextChirho = lettersChirho[indexChirho + 1];
		if (
			nextChirho &&
			!nextChirho.diaeresisChirho &&
			DIPHTHONGS_CHIRHO.has(lettersChirho[indexChirho].textChirho + nextChirho.textChirho)
		)
			indexChirho++;
	}
	return countChirho;
}

/** Matches the producer's pinned plain_sent_chirho, retaining case and diaeresis; never inserts H. */
export function localGreekVerseTextChirho(canonicalChirho: string): string {
	return canonicalChirho
		.split(' ')
		.map((wordChirho) => {
			let modernChirho = wordChirho
				.normalize('NFD')
				.replace(/[\u0313\u0314\u0345]/gu, '')
				.replace(/[\u0300\u0342]/gu, '\u0301');
			if (syllablesChirho(wordChirho) <= 1) modernChirho = modernChirho.replaceAll('\u0301', '');
			return modernChirho.normalize('NFC');
		})
		.join(' ')
		.replace(/[\u0387\u00b7]/gu, ',')
		.replaceAll('[', '')
		.replaceAll(']', '');
}
