// For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life. — John 3:16 (KJV)

import { readFileSync as readFileSyncChirho } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { validateLessonChirho } from '../../src/lib/domain-chirho/lesson-chirho';
import {
	lemmaIconsForLessonChirho,
	lemmaIconKeyChirho
} from '../../src/lib/domain-chirho/lemma-icons-chirho';
import {
	iconsForLessonChirho,
	validateIconsChirho,
	alternativeIconsChirho,
	type ContextualIconChirho
} from '../../src/lib/domain-chirho/media-chirho';
import { validateGreekLessonChirho } from '../../src/lib/domain-chirho/greek-chirho';

function readChirho(pathChirho: string) {
	return JSON.parse(readFileSyncChirho(pathChirho, 'utf8'));
}
const sourceChirho = readChirho(
	'data-chirho/media-chirho/proverbs-worker-icons-chirho.json'
).icons_chirho.find(
	(rowChirho: ContextualIconChirho) => rowChirho.lemma_id_chirho === 'H4148'
) as ContextualIconChirho;
function hebrewChirho(chapterChirho: number, verseChirho: number) {
	return validateLessonChirho(
		readChirho(
			`static/content-chirho/proverbs-chirho/chapter-${String(chapterChirho).padStart(2, '0')}-chirho.json`
		).verses_chirho[verseChirho - 1]
	);
}

describe('lemma-first pictures', () => {
	it('shares one source picture across conjunctions, construct state and attached prepositions', () => {
		for (const [chapterChirho, verseChirho] of [
			[1, 2],
			[1, 3],
			[23, 12]
		]) {
			const lessonChirho = hebrewChirho(chapterChirho, verseChirho);
			const tokenChirho = lessonChirho.tokens_chirho.find(
				(rowChirho) => rowChirho.lemma_id_chirho === 'H4148'
			)!;
			const chosenChirho = lemmaIconsForLessonChirho([sourceChirho], lessonChirho)[
				tokenChirho.id_chirho
			];
			expect(chosenChirho.asset_path_chirho).toBe(sourceChirho.asset_path_chirho);
			expect(chosenChirho.assignment_chirho).toBe('lemma_default');
			expect(chosenChirho.source_lesson_id_chirho).toBe(sourceChirho.lesson_id_chirho);
			expect(chosenChirho.art_review_chirho).toBe('pending');
			expect(alternativeIconsChirho(chosenChirho)).toEqual([]);
		}
	});
	it('lets an explicit contextual assignment override the general picture', () => {
		const lessonChirho = hebrewChirho(1, 2);
		const generalChirho = {
			...sourceChirho,
			id_chirho: 'general-instruction-chirho',
			asset_path_chirho: '/assets-chirho/general-chirho.webp'
		};
		const iconsChirho = iconsForLessonChirho(
			{
				schema_version_chirho: 1,
				icons_chirho: [sourceChirho],
				lemma_icons_chirho: [generalChirho]
			},
			lessonChirho
		);
		expect(iconsChirho[sourceChirho.token_id_chirho].asset_path_chirho).toBe(
			sourceChirho.asset_path_chirho
		);
		expect(iconsChirho[sourceChirho.token_id_chirho].assignment_chirho).toBeUndefined();
	});
	it('keeps Hebrew homograph augments separate', () => {
		const lessonChirho = hebrewChirho(26, 1);
		const harvestChirho = readChirho(
			'data-chirho/media-chirho/proverbs-26-1-icons-chirho.json'
		).icons_chirho.find(
			(rowChirho: ContextualIconChirho) =>
				rowChirho.lemma_id_chirho === 'H7105' && rowChirho.selected_chirho
		);
		expect(
			lemmaIconsForLessonChirho(
				[{ ...harvestChirho, lesson_id_chirho: 'Prov.26.1', lemma_augment_chirho: 'b' }],
				lessonChirho
			)
		).toEqual({});
		expect(lemmaIconKeyChirho(harvestChirho)).not.toBe(
			lemmaIconKeyChirho({ ...harvestChirho, lemma_augment_chirho: 'b' })
		);
	});
	it('keeps exact Greek forms separate even when they share a Strong number', () => {
		const lessonChirho: unknown = readChirho(
			'static/content-chirho/john-chirho/chapter-01-chirho.json'
		).verses_chirho[0];
		validateGreekLessonChirho(lessonChirho);
		const tokenChirho = lessonChirho.tokens_chirho.find(
			(rowChirho) => rowChirho.lemma_id_chirho === 'G3056'
		)!;
		const greekChirho = {
			...sourceChirho,
			id_chirho: 'greek-general-chirho',
			lesson_id_chirho: lessonChirho.id_chirho,
			token_id_chirho: tokenChirho.id_chirho,
			lemma_id_chirho: tokenChirho.lemma_id_chirho,
			lexical_form_chirho: tokenChirho.lexical_form_chirho,
			lemma_augment_chirho: null
		};
		expect(
			Object.keys(lemmaIconsForLessonChirho([greekChirho], lessonChirho)).length
		).toBeGreaterThan(0);
		expect(
			lemmaIconsForLessonChirho(
				[{ ...greekChirho, lexical_form_chirho: 'a different lemma' }],
				lessonChirho
			)
		).toEqual({});
		expect(tokenChirho.lexical_form_chirho.normalize('NFC')).not.toBe(
			tokenChirho.lexical_form_chirho
		);
		expect(
			lemmaIconsForLessonChirho(
				[{ ...greekChirho, lexical_form_chirho: tokenChirho.lexical_form_chirho.normalize('NFC') }],
				lessonChirho
			)
		).toEqual({});
	});
	it('does not present a default as a reviewed contextual selection', () => {
		const lessonChirho = hebrewChirho(1, 2);
		const generalChirho = lemmaIconsForLessonChirho([sourceChirho], lessonChirho)[
			sourceChirho.token_id_chirho
		];
		expect(() =>
			validateIconsChirho(
				{
					schema_version_chirho: 1,
					lesson_id_chirho: lessonChirho.id_chirho,
					icons_chirho: [generalChirho]
				},
				lessonChirho
			)
		).toThrow(/not a contextual/u);
	});
	it('refuses unsafe assets, oversized pictures and competing defaults', () => {
		const lessonChirho = hebrewChirho(1, 2);
		for (const changedChirho of [
			{ ...sourceChirho, asset_path_chirho: 'https://elsewhere.example/image.webp' },
			{ ...sourceChirho, width_chirho: 129 }
		])
			expect(() => lemmaIconsForLessonChirho([changedChirho], lessonChirho)).toThrow();
		expect(() =>
			lemmaIconsForLessonChirho(
				[sourceChirho, { ...sourceChirho, id_chirho: 'other-default-chirho' }],
				lessonChirho
			)
		).toThrow(/Repeated default/u);
	});
});
