// For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life. — John 3:16 (KJV)
// Workflow: reusable-word-audio-chirho.md. Exact lexical reviews, never a guessed parser default.
export interface ReadingTokenChirho {
	id_chirho?: string;
	text_chirho: string;
	lemma_id_chirho?: string;
	lemma_augment_chirho?: string | null;
	raw_morphology_chirho?: string;
	qere_chirho?: readonly ReadingTokenChirho[];
}
export interface ReadingReviewChirho {
	lesson_id_chirho: string;
	token_id_chirho: string;
	text_chirho: string;
	lemma_id_chirho: string;
	lemma_augment_chirho: string | null;
	raw_morphology_chirho: string;
	ipa_chirho: string;
	spoken_reading_chirho: string;
	qere_binding_chirho: readonly ReadingTokenChirho[] | null;
	surprising_chirho: boolean;
	explanation_chirho: { en: string; es: string };
	sources_chirho: { label_chirho: string; url_chirho: string }[];
	written_group_chirho: readonly ReadingTokenChirho[] | null;
	canonical_text_chirho: string | null;
	evidence_chirho: object;
}
import part0Chirho from './reading-continuation-chirho/part-00-chirho.json';
import part1Chirho from './reading-continuation-chirho/part-01-chirho.json';
import part2Chirho from './reading-continuation-chirho/part-02-chirho.json';
import part3Chirho from './reading-continuation-chirho/part-03-chirho.json';
import part4Chirho from './reading-continuation-chirho/part-04-chirho.json';
import part5Chirho from './reading-continuation-chirho/part-05-chirho.json';
import part6Chirho from './reading-continuation-chirho/part-06-chirho.json';
import part7Chirho from './reading-continuation-chirho/part-07-chirho.json';
import part8Chirho from './reading-continuation-chirho/part-08-chirho.json';
import part9Chirho from './reading-continuation-chirho/part-09-chirho.json';
export const CONTINUATION_READINGS_CHIRHO: readonly ReadingReviewChirho[] = [
	...part0Chirho.words_chirho,
	...part1Chirho.words_chirho,
	...part2Chirho.words_chirho,
	...part3Chirho.words_chirho,
	...part4Chirho.words_chirho,
	...part5Chirho.words_chirho,
	...part6Chirho.words_chirho,
	...part7Chirho.words_chirho,
	...part8Chirho.words_chirho,
	...part9Chirho.words_chirho
];

const notesChirho = new Map(
	CONTINUATION_READINGS_CHIRHO.map((noteChirho) => [noteChirho.token_id_chirho, noteChirho])
);
export function readingMatchesChirho(
	tokenChirho: ReadingTokenChirho,
	memberChirho: ReadingTokenChirho
): boolean {
	return (
		tokenChirho.id_chirho === memberChirho.id_chirho &&
		tokenChirho.text_chirho === memberChirho.text_chirho &&
		tokenChirho.lemma_id_chirho === memberChirho.lemma_id_chirho &&
		(tokenChirho.lemma_augment_chirho ?? null) === (memberChirho.lemma_augment_chirho ?? null) &&
		tokenChirho.raw_morphology_chirho === memberChirho.raw_morphology_chirho &&
		(tokenChirho.qere_chirho?.length ?? 0) === (memberChirho.qere_chirho?.length ?? 0) &&
		(tokenChirho.qere_chirho ?? []).every((qereChirho, indexChirho) =>
			readingMatchesChirho(qereChirho, memberChirho.qere_chirho![indexChirho])
		)
	);
}
export function readingReviewChirho(tokenChirho: ReadingTokenChirho): ReadingReviewChirho | null {
	const noteChirho = notesChirho.get(tokenChirho.id_chirho ?? '');
	return noteChirho &&
		readingMatchesChirho(tokenChirho, {
			id_chirho: noteChirho.token_id_chirho,
			...noteChirho,
			qere_chirho: noteChirho.qere_binding_chirho ?? undefined
		})
		? noteChirho
		: null;
}
export function sourceSpokenWordChirho(tokenChirho: ReadingTokenChirho) {
	return tokenChirho.qere_chirho?.length
		? tokenChirho.qere_chirho.map((readingChirho) => readingChirho.text_chirho).join(' ')
		: tokenChirho.text_chirho;
}
/** Resolve a qere spanning written words only when the entire consecutive source group matches. */
export function reviewedPlaybackTokensChirho<
	TokenChirho extends ReadingTokenChirho & { start_chirho: number; end_chirho: number }
>(canonicalChirho: string, tokensChirho: TokenChirho[]) {
	const positionsChirho = new Map(
		tokensChirho.map((tokenChirho, indexChirho) => [tokenChirho.id_chirho, indexChirho])
	);
	return tokensChirho.flatMap((tokenChirho) => {
		const noteChirho = readingReviewChirho(tokenChirho);
		const groupChirho = noteChirho?.written_group_chirho;
		if (noteChirho && groupChirho?.length) {
			const firstChirho = positionsChirho.get(groupChirho[0].id_chirho);
			const matchesChirho =
				firstChirho !== undefined &&
				noteChirho.canonical_text_chirho === canonicalChirho &&
				groupChirho.every((memberChirho, indexChirho) => {
					const actualChirho = tokensChirho[firstChirho + indexChirho];
					return !!actualChirho && readingMatchesChirho(actualChirho, memberChirho);
				});
			if (matchesChirho) {
				if (tokenChirho.id_chirho !== groupChirho.at(-1)!.id_chirho) return [];
				return [
					{
						token_chirho: tokenChirho,
						start_chirho: tokensChirho[firstChirho].start_chirho,
						end_chirho: tokenChirho.end_chirho,
						spoken_text_chirho: noteChirho.spoken_reading_chirho
					}
				];
			}
			// A changed group never borrows the old shared qere or suppresses a written word.
			return [
				{
					token_chirho: tokenChirho,
					start_chirho: tokenChirho.start_chirho,
					end_chirho: tokenChirho.end_chirho,
					spoken_text_chirho: sourceSpokenWordChirho(tokenChirho)
				}
			];
		}
		return [
			{
				token_chirho: tokenChirho,
				start_chirho: tokenChirho.start_chirho,
				end_chirho: tokenChirho.end_chirho,
				spoken_text_chirho: noteChirho?.spoken_reading_chirho ?? sourceSpokenWordChirho(tokenChirho)
			}
		];
	});
}
