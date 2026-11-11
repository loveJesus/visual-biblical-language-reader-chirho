// For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life. — John 3:16 (KJV)
// Workflow: hosting-chirho/word-study-chirho.md. Exact lemma identity and source offsets, never inferred roots.
import type { WordStudyChirho, StudyExampleChirho } from './word-study-client-chirho';
import type { VersePreviewChirho } from './verse-preview-client-chirho';
export interface ContextPartChirho {
	text_chirho: string;
	emphasis_chirho: boolean;
}
export function contextExamplesChirho(recordChirho: WordStudyChirho): StudyExampleChirho[] {
	const candidatesChirho = new Map<string, StudyExampleChirho>();
	for (const groupChirho of recordChirho.glosses_chirho)
		for (const exampleChirho of groupChirho.examples_chirho)
			if (!candidatesChirho.has(exampleChirho.verse_chirho))
				candidatesChirho.set(exampleChirho.verse_chirho, exampleChirho);
	const formsChirho = new Set<string>();
	const chaptersChirho = new Set<string>();
	const booksChirho = new Set<string>();
	const chosenChirho: StudyExampleChirho[] = [];
	const formChirho = (textChirho: string) =>
		textChirho
			.normalize('NFD')
			.replace(/[\u0591-\u05af\u05bd\u0300-\u036f]/g, '')
			.toLocaleLowerCase();
	while (chosenChirho.length < 8 && candidatesChirho.size) {
		let bestChirho: StudyExampleChirho | undefined;
		let bestScoreChirho = -1;
		for (const candidateChirho of candidatesChirho.values()) {
			const [bookChirho, chapterChirho] = candidateChirho.verse_chirho.split('.');
			const scoreChirho =
				Number(!formsChirho.has(formChirho(candidateChirho.text_chirho))) * 4 +
				Number(!chaptersChirho.has(bookChirho + '.' + chapterChirho)) * 2 +
				Number(!booksChirho.has(bookChirho));
			if (scoreChirho > bestScoreChirho) {
				bestChirho = candidateChirho;
				bestScoreChirho = scoreChirho;
			}
		}
		if (!bestChirho) break;
		chosenChirho.push(bestChirho);
		candidatesChirho.delete(bestChirho.verse_chirho);
		formsChirho.add(formChirho(bestChirho.text_chirho));
		chaptersChirho.add(bestChirho.verse_chirho.split('.').slice(0, 2).join('.'));
		booksChirho.add(bestChirho.verse_chirho.split('.')[0]);
	}
	return chosenChirho;
}
export function contextExcerptChirho(
	previewChirho: VersePreviewChirho,
	lemmaChirho: string,
	preferredTextChirho: string
): {
	original_chirho: ContextPartChirho[];
	translation_chirho: ContextPartChirho[];
	leading_chirho: boolean;
	trailing_chirho: boolean;
} | null {
	const tokensChirho = previewChirho.lesson_chirho.tokens_chirho;
	const keyChirho = (tokenChirho: (typeof tokensChirho)[number]) =>
		tokenChirho.lemma_id_chirho +
		('lemma_augment_chirho' in tokenChirho ? (tokenChirho.lemma_augment_chirho ?? '') : '');
	let indexChirho = tokensChirho.findIndex(
		(tokenChirho) =>
			keyChirho(tokenChirho) === lemmaChirho && tokenChirho.text_chirho === preferredTextChirho
	);
	if (indexChirho < 0)
		indexChirho = tokensChirho.findIndex((tokenChirho) => keyChirho(tokenChirho) === lemmaChirho);
	if (indexChirho < 0) return null;
	const startChirho = Math.max(0, indexChirho - 3);
	const endChirho = Math.min(tokensChirho.length, indexChirho + 4);
	const originalChirho: ContextPartChirho[] = [];
	const translationChirho: ContextPartChirho[] = [];
	let cursorChirho = startChirho === 0 ? 0 : tokensChirho[startChirho].start_chirho;
	for (let positionChirho = startChirho; positionChirho < endChirho; positionChirho++) {
		const tokenChirho = tokensChirho[positionChirho];
		const emphasisChirho = keyChirho(tokenChirho) === lemmaChirho;
		if (tokenChirho.start_chirho > cursorChirho)
			originalChirho.push({
				text_chirho: previewChirho.original_chirho.slice(cursorChirho, tokenChirho.start_chirho),
				emphasis_chirho: false
			});
		originalChirho.push({
			text_chirho: previewChirho.original_chirho.slice(
				tokenChirho.start_chirho,
				tokenChirho.end_chirho
			),
			emphasis_chirho: emphasisChirho
		});
		cursorChirho = tokenChirho.end_chirho;
		const wordChirho = previewChirho.words_chirho?.[positionChirho];
		if (wordChirho?.gloss_chirho.trim())
			translationChirho.push({
				text_chirho:
					(translationChirho.length ? ' ' : '') + wordChirho.gloss_chirho.replace(/–/g, ' '),
				emphasis_chirho: emphasisChirho
			});
	}
	if (endChirho === tokensChirho.length && cursorChirho < previewChirho.original_chirho.length)
		originalChirho.push({
			text_chirho: previewChirho.original_chirho.slice(cursorChirho),
			emphasis_chirho: false
		});
	return {
		original_chirho: originalChirho,
		translation_chirho: translationChirho,
		leading_chirho: startChirho > 0,
		trailing_chirho: endChirho < tokensChirho.length
	};
}
