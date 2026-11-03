// For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life. — John 3:16 (KJV)

import { expect as expectChirho, test as testChirho } from 'vitest';
import lessonFixtureChirho from '../../data-chirho/lessons-chirho/proverbs-26-1-chirho.json';
import glossFixtureChirho from '../../data-chirho/glosses-chirho/proverbs-26-1-glosses-chirho.json';
import {
	validateLessonChirho,
	safeAssetPathChirho
} from '../../src/lib/domain-chirho/lesson-chirho';
import { validateGlossesChirho } from '../../src/lib/domain-chirho/glosses-chirho';
import { syntheticLessonChirho, syntheticTokenChirho } from '../fixtures-chirho/synthetic-chirho';

testChirho(
	'five pinned approved layers align to source IDs without changing Hebrew or gloss bytes',
	() => {
		const lessonChirho = validateLessonChirho(lessonFixtureChirho);
		const beforeChirho = JSON.stringify(glossFixtureChirho);
		const layersChirho = validateGlossesChirho(glossFixtureChirho, lessonChirho);
		expectChirho(layersChirho).toHaveLength(5);
		expectChirho(
			layersChirho.flatMap((languageChirho) => languageChirho.words_chirho)
		).toHaveLength(45);
		expectChirho(
			layersChirho.find((languageChirho) => languageChirho.id_chirho === 'arb')
				?.source_folder_chirho
		).toBe('are');
		expectChirho(JSON.stringify(glossFixtureChirho)).toBe(beforeChirho);
	}
);

testChirho.each(['review', 'word_id', 'mark', 'missing_gloss', 'hash'] as const)(
	'rejects broken gloss %s instead of blending an unverified layer',
	(mutationChirho) => {
		const brokenChirho = structuredClone(glossFixtureChirho);
		const languageChirho = brokenChirho.languages_chirho[0];
		if (mutationChirho === 'review') languageChirho.approval_status_chirho = 'machine';
		if (mutationChirho === 'word_id')
			languageChirho.words_chirho[0].token_id_chirho = 'wrong-chirho';
		if (mutationChirho === 'mark')
			languageChirho.words_chirho[0].text_chirho =
				languageChirho.words_chirho[0].text_chirho.replace(/\p{M}/u, '');
		if (mutationChirho === 'missing_gloss') languageChirho.words_chirho[0].gloss_chirho = '';
		if (mutationChirho === 'hash') languageChirho.source_sha256_chirho = 'not-a-hash';
		expectChirho(() =>
			validateGlossesChirho(brokenChirho, validateLessonChirho(lessonFixtureChirho))
		).toThrow();
	}
);

testChirho.each([
	'traditional_missing',
	'unresolved_entry',
	'double_augment',
	'bad_hash',
	'oversized_span'
] as const)('rejects inconsistent curated metadata: %s', (mutationChirho) => {
	const tokenChirho = syntheticTokenChirho();
	const lessonChirho = syntheticLessonChirho(tokenChirho);
	if (mutationChirho === 'traditional_missing') tokenChirho.root_status_chirho = 'traditional';
	if (mutationChirho === 'unresolved_entry') tokenChirho.root_entry_id_chirho = 'H1';
	if (mutationChirho === 'double_augment') {
		tokenChirho.lemma_id_chirho = 'H7105a';
		tokenChirho.lemma_augment_chirho = 'a';
	}
	if (mutationChirho === 'bad_hash') lessonChirho.sources_chirho[0].sha256_chirho = 'xyz';
	if (mutationChirho === 'oversized_span') tokenChirho.end_chirho = 100;
	expectChirho(() => validateLessonChirho(lessonChirho)).toThrow();
});

testChirho.each([
	'https://example.com/image.png',
	'/assets-chirho/../private-chirho.png',
	'/assets-chirho/%2e%2e/file.png',
	'/.env'
])('rejects unsafe scene path %s', (pathChirho) => {
	expectChirho(() => safeAssetPathChirho(pathChirho)).toThrow();
});
