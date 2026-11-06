// For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life. — John 3:16 (KJV)

import {
	readingReviewChirho,
	reviewedPlaybackTokensChirho,
	type ReadingTokenChirho
} from './pronunciation-chirho/hebrew-chirho/reading-continuation-chirho';

interface SpokenTokenChirho extends ReadingTokenChirho {
	text_chirho: string;
	qere_chirho?: { text_chirho: string }[];
}

/** Spoken reading is separate from the immutable displayed source; qere keeps its own words. */
export function spokenWordChirho(tokenChirho: SpokenTokenChirho): string {
	return tokenChirho.qere_chirho?.length
		? tokenChirho.qere_chirho.map((readingChirho) => readingChirho.text_chirho).join(' ')
		: (readingReviewChirho(tokenChirho)?.spoken_reading_chirho ?? tokenChirho.text_chirho);
}

export function spokenVerseChirho(lessonChirho: {
	canonical_text_chirho: string;
	tokens_chirho: (SpokenTokenChirho & { start_chirho: number; end_chirho: number })[];
}): string {
	let cursorChirho = 0;
	let textChirho = '';
	for (const tokenChirho of reviewedPlaybackTokensChirho(
		lessonChirho.canonical_text_chirho,
		lessonChirho.tokens_chirho
	)) {
		textChirho += lessonChirho.canonical_text_chirho.slice(cursorChirho, tokenChirho.start_chirho);
		textChirho += tokenChirho.spoken_text_chirho;
		cursorChirho = tokenChirho.end_chirho;
	}
	return textChirho + lessonChirho.canonical_text_chirho.slice(cursorChirho);
}

/** Workflow: reusable-word-audio-chirho.md. Join saved words using source punctuation only. */
export function wordPlaybackPlanChirho(lessonChirho: {
	canonical_text_chirho: string;
	tokens_chirho: (SpokenTokenChirho & {
		id_chirho: string;
		start_chirho: number;
		end_chirho: number;
	})[];
}) {
	const tokensChirho = reviewedPlaybackTokensChirho(
		lessonChirho.canonical_text_chirho,
		lessonChirho.tokens_chirho
	);
	return tokensChirho.map((rowChirho, indexChirho) => {
		const tokenChirho = rowChirho.token_chirho;
		const gapChirho = lessonChirho.canonical_text_chirho.slice(
			rowChirho.end_chirho,
			tokensChirho[indexChirho + 1]?.start_chirho
		);
		return {
			token_id_chirho: tokenChirho.id_chirho,
			text_chirho: rowChirho.spoken_text_chirho,
			pause_after_chirho:
				indexChirho === tokensChirho.length - 1
					? 0
					: gapChirho.includes('־')
						? 20
						: /[׃.!?;\u037e]/u.test(gapChirho)
							? 350
							: tokenChirho.text_chirho.includes('\u0591')
								? 200
								: /[׀,·\u0387]/u.test(gapChirho)
									? 130
									: 60
		};
	});
}
