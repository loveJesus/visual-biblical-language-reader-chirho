// For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life. — John 3:16 (KJV)
import { describe as describeChirho, it as itChirho, expect as expectChirho } from 'vitest';
import { contextExcerptChirho, contextExamplesChirho } from './context-chirho';
import type { VersePreviewChirho } from './verse-preview-client-chirho';
import type { WordStudyChirho } from './word-study-client-chirho';
function previewChirho(indexChirho: number): VersePreviewChirho {
	const lettersChirho = 'α β γ δ ε ζ η θ ι'.split(' ');
	const canonicalChirho = lettersChirho.join(' ') + '.';
	const tokensChirho = lettersChirho.map((letterChirho, positionChirho) => ({
		id_chirho: 'word-' + positionChirho + '-chirho',
		text_chirho: letterChirho,
		lemma_id_chirho: positionChirho === indexChirho ? 'G1' : 'G2',
		start_chirho: positionChirho * 2,
		end_chirho: positionChirho * 2 + 1
	}));
	return {
		original_chirho: canonicalChirho,
		translation_chirho: 'one two three four five six seven eight nine',
		edition_chirho: 'Terse',
		language_chirho: 'grc',
		lesson_chirho: {
			tokens_chirho: tokensChirho
		} as unknown as VersePreviewChirho['lesson_chirho'],
		words_chirho: tokensChirho.map((tokenChirho, positionChirho) => ({
			token_id_chirho: tokenChirho.id_chirho,
			text_chirho: tokenChirho.text_chirho,
			gloss_chirho: String(positionChirho),
			state_chirho: 'UNAPPROVED',
			source_chirho: 'IMPORT'
		}))
	};
}
describeChirho('source-bound contexts', () => {
	itChirho(
		'shows three neighboring words and bolds only the actual lemma with edge ellipses',
		() => {
			const resultChirho = contextExcerptChirho(previewChirho(4), 'G1', 'ε')!;
			expectChirho(
				resultChirho.original_chirho.map((partChirho) => partChirho.text_chirho).join('')
			).toBe('β γ δ ε ζ η θ');
			expectChirho(
				resultChirho.original_chirho
					.filter((partChirho) => partChirho.emphasis_chirho)
					.map((partChirho) => partChirho.text_chirho)
			).toEqual(['ε']);
			expectChirho(
				resultChirho.translation_chirho
					.filter((partChirho) => partChirho.emphasis_chirho)
					.map((partChirho) => partChirho.text_chirho)
			).toEqual([' 4']);
			expectChirho(resultChirho.leading_chirho).toBe(true);
			expectChirho(resultChirho.trailing_chirho).toBe(true);
		}
	);
	itChirho(
		'keeps start/end boundaries and rejects a different lemma instead of inventing a root match',
		() => {
			const firstChirho = contextExcerptChirho(previewChirho(0), 'G1', 'α')!;
			expectChirho(firstChirho.leading_chirho).toBe(false);
			const lastChirho = contextExcerptChirho(previewChirho(8), 'G1', 'ι')!;
			expectChirho(lastChirho.trailing_chirho).toBe(false);
			expectChirho(
				lastChirho.original_chirho.map((partChirho) => partChirho.text_chirho).join('')
			).toBe('ζ η θ ι.');
			expectChirho(contextExcerptChirho(previewChirho(4), 'H1', 'ε')).toBeNull();
		}
	);
	itChirho(
		'selects up to eight distinct verses with varied forms, without manufacturing missing uses',
		() => {
			const recordChirho = {
				glosses_chirho: Array.from({ length: 12 }, (_, indexChirho) => ({
					examples_chirho: [
						{
							verse_chirho: `John.${indexChirho + 1}.1`,
							reference_chirho: `John ${indexChirho + 1}:1`,
							text_chirho: 'form-' + indexChirho + '-chirho'
						}
					]
				}))
			} as WordStudyChirho;
			const choicesChirho = contextExamplesChirho(recordChirho);
			expectChirho(choicesChirho).toHaveLength(8);
			expectChirho(
				new Set(choicesChirho.map((choiceChirho) => choiceChirho.verse_chirho)).size
			).toBe(8);
			expectChirho(
				contextExamplesChirho({ glosses_chirho: [] } as unknown as WordStudyChirho)
			).toEqual([]);
		}
	);
});
