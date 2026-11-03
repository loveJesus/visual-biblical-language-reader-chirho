// For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life. — John 3:16 (KJV)

interface SpokenTokenChirho {
	text_chirho: string;
	qere_chirho?: { text_chirho: string }[];
}

/** Spoken reading is separate from the immutable displayed source; qere keeps its own words. */
export function spokenWordChirho(tokenChirho: SpokenTokenChirho): string {
	return tokenChirho.qere_chirho?.length
		? tokenChirho.qere_chirho.map((readingChirho) => readingChirho.text_chirho).join(' ')
		: tokenChirho.text_chirho;
}

export function spokenVerseChirho(lessonChirho: {
	canonical_text_chirho: string;
	tokens_chirho: (SpokenTokenChirho & { start_chirho: number; end_chirho: number })[];
}): string {
	let cursorChirho = 0;
	let textChirho = '';
	for (const tokenChirho of lessonChirho.tokens_chirho) {
		textChirho += lessonChirho.canonical_text_chirho.slice(cursorChirho, tokenChirho.start_chirho);
		textChirho += spokenWordChirho(tokenChirho);
		cursorChirho = tokenChirho.end_chirho;
	}
	return textChirho + lessonChirho.canonical_text_chirho.slice(cursorChirho);
}
