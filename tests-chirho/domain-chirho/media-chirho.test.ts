// For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life. — John 3:16 (KJV)

import { describe, expect, it } from 'vitest';
import fixtureChirho from '../../data-chirho/lessons-chirho/proverbs-26-1-chirho.json';
import catalogueChirho from '../../data-chirho/media-chirho/proverbs-26-1-icons-chirho.json';
import { validateLessonChirho } from '../../src/lib/domain-chirho/lesson-chirho';
import {
	alternativeIconsChirho,
	iconsForLessonChirho,
	validateIconsChirho
} from '../../src/lib/domain-chirho/media-chirho';

describe('reviewed meaning galleries', () => {
	const selectedChirho = validateIconsChirho(catalogueChirho, validateLessonChirho(fixtureChirho));
	const iconChirho = Object.values(selectedChirho).find(
		(itemChirho) => (itemChirho.alternatives_chirho?.length ?? 0) > 1
	)!;
	const drawingChirho = iconChirho.alternatives_chirho!.find(
		(itemChirho) => itemChirho.asset_path_chirho !== iconChirho.asset_path_chirho
	)!;
	const otherChirho = {
		...drawingChirho,
		sense_id_chirho: 'other-reviewed-sense-chirho',
		contextual_meaning_chirho: 'another reviewed meaning'
	};

	it('keeps the selected artwork while hiding same-sense variants for the real verse', () => {
		for (const selectedIconChirho of Object.values(selectedChirho)) {
			const variantsChirho = selectedIconChirho.alternatives_chirho;
			expect(alternativeIconsChirho(selectedIconChirho)).toEqual([]);
			expect(selectedIconChirho.alternatives_chirho).toBe(variantsChirho);
		}
	});

	it('shows one drawing per other sense and collapses repeated meaning labels', () => {
		expect(
			alternativeIconsChirho({
				...iconChirho,
				alternatives_chirho: [
					drawingChirho,
					{
						...drawingChirho,
						sense_id_chirho: 'duplicate-label-chirho',
						contextual_meaning_chirho: `  ${iconChirho.contextual_meaning_chirho.toUpperCase()}  `
					},
					otherChirho,
					{
						...otherChirho,
						asset_path_chirho: '/assets-chirho/another-drawing-chirho.webp',
						sha256_chirho: 'c'.repeat(64)
					},
					{
						...otherChirho,
						sense_id_chirho: 'another-label-chirho',
						contextual_meaning_chirho: 'Another   reviewed meaning',
						asset_path_chirho: '/assets-chirho/duplicate-label-chirho.webp',
						sha256_chirho: 'd'.repeat(64)
					}
				]
			})
		).toEqual([otherChirho]);
	});

	it('excludes selected and repeated image bytes even across distinct sense records', () => {
		const duplicatedChirho = {
			...iconChirho,
			alternatives_chirho: [
				iconChirho,
				{
					...iconChirho,
					sense_id_chirho: 'same-path-chirho',
					contextual_meaning_chirho: 'same picture path'
				},
				{
					...iconChirho,
					sense_id_chirho: 'same-bytes-chirho',
					contextual_meaning_chirho: 'same picture bytes',
					asset_path_chirho: '/assets-chirho/copy-chirho.webp'
				},
				otherChirho,
				otherChirho,
				{ ...otherChirho, asset_path_chirho: '/assets-chirho/second-copy-chirho.webp' }
			]
		};
		expect(alternativeIconsChirho(duplicatedChirho)).toEqual([otherChirho]);
		expect(
			alternativeIconsChirho({ ...iconChirho, alternatives_chirho: [iconChirho, iconChirho] })
		).toEqual([]);
	});
});

describe('reviewed shared icon assignments', () => {
	const lessonChirho = validateLessonChirho(fixtureChirho);
	const recordsChirho = catalogueChirho.icons_chirho.map((iconChirho) => {
		const tokenChirho = lessonChirho.tokens_chirho.find(
			(candidateChirho) => candidateChirho.id_chirho === iconChirho.token_id_chirho
		)!;
		return {
			...iconChirho,
			lesson_id_chirho: lessonChirho.id_chirho,
			context_text_chirho: tokenChirho.text_chirho,
			context_gloss_chirho: tokenChirho.gloss_chirho!,
			context_canonical_text_chirho: lessonChirho.canonical_text_chirho
		};
	});
	const sharedChirho = { schema_version_chirho: 1, icons_chirho: recordsChirho };

	it('keeps original paths and preserves valid words when another reviewed gloss changes', () => {
		const beforeChirho = iconsForLessonChirho(sharedChirho, lessonChirho);
		const tokenChirho = lessonChirho.tokens_chirho[0];
		const changedChirho = {
			...lessonChirho,
			tokens_chirho: lessonChirho.tokens_chirho.map((candidateChirho) =>
				candidateChirho.id_chirho === tokenChirho.id_chirho
					? { ...candidateChirho, gloss_chirho: 'a different contextual meaning' }
					: candidateChirho
			)
		};
		const afterChirho = iconsForLessonChirho(sharedChirho, changedChirho);
		expect(afterChirho[tokenChirho.id_chirho]).toBeUndefined();
		expect(Object.keys(afterChirho).length).toBe(Object.keys(beforeChirho).length - 1);
		for (const [idChirho, iconChirho] of Object.entries(afterChirho))
			expect(iconChirho.asset_path_chirho).toBe(beforeChirho[idChirho].asset_path_chirho);
	});

	it('withholds reused pictures when the reviewed surrounding text changes', () => {
		expect(
			iconsForLessonChirho(sharedChirho, {
				...lessonChirho,
				canonical_text_chirho: `${lessonChirho.canonical_text_chirho} `
			})
		).toEqual({});
		expect(() =>
			validateIconsChirho(
				{ ...sharedChirho, lesson_id_chirho: lessonChirho.id_chirho },
				{
					...lessonChirho,
					canonical_text_chirho: lessonChirho.canonical_text_chirho.normalize('NFC')
				}
			)
		).toThrow(/context changed/u);
	});

	it('rejects partial context pins while retaining existing unpinned records', () => {
		const partialChirho = { ...recordsChirho[0], context_gloss_chirho: undefined };
		expect(() =>
			validateIconsChirho(
				{
					schema_version_chirho: 1,
					lesson_id_chirho: lessonChirho.id_chirho,
					icons_chirho: [partialChirho]
				},
				lessonChirho
			)
		).toThrow(/context changed/u);
		expect(Object.keys(validateIconsChirho(catalogueChirho, lessonChirho)).length).toBeGreaterThan(
			0
		);
	});
});
