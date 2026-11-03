// For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life. — John 3:16 (KJV)

import { describe, expect, it } from 'vitest';
import {
	mediaRecordsChirho,
	sha256Chirho,
	verifyMediaShardsChirho,
	type FilesChirho
} from '../../scripts-chirho/publish-chirho/release_rules_chirho';

const standardChirho = {
	lesson_id_chirho: 'John.1.2',
	asset_path_chirho: '/assets-chirho/standard-chirho.webp',
	sha256_chirho: 'a'.repeat(64),
	width_chirho: 400,
	height_chirho: 300,
	art_review_chirho: 'pending'
};
const reducedChirho = {
	...standardChirho,
	variant_chirho: 'representation_reduced',
	asset_path_chirho: '/assets-chirho/reduced-chirho.webp',
	sha256_chirho: 'b'.repeat(64)
};

function verifyChirho(
	rowsChirho: Record<string, unknown>[],
	declarationsChirho: Record<string, unknown>[] = [standardChirho, reducedChirho]
) {
	const reasonsChirho: string[] = [];
	const mediaChirho = mediaRecordsChirho(
		'scenes-chirho.json',
		{ scenes_chirho: declarationsChirho },
		reasonsChirho
	);
	const chapterChirho = new TextEncoder().encode(
		JSON.stringify({
			schema_version_chirho: 1,
			book_id_chirho: 'John',
			chapter_chirho: 1,
			scenes_chirho: rowsChirho,
			icons_chirho: []
		})
	);
	const summaryChirho = new TextEncoder().encode(
		JSON.stringify({
			schema_version_chirho: 1,
			book_id_chirho: 'John',
			scene_count_chirho: rowsChirho.length,
			icon_count_chirho: 0,
			chapters_chirho: [
				{
					number_chirho: 1,
					path_chirho: '/media-chirho/john-chirho/chapter-01-chirho.json',
					sha256_chirho: sha256Chirho(chapterChirho),
					scene_count_chirho: rowsChirho.length,
					icon_count_chirho: 0
				}
			]
		})
	);
	const filesChirho: FilesChirho = new Map([
		['media-chirho/john-chirho/chapter-01-chirho.json', chapterChirho],
		['media-chirho/john-chirho/summary-chirho.json', summaryChirho]
	]);
	verifyMediaShardsChirho(filesChirho, mediaChirho, reasonsChirho);
	return { reasonsChirho, mediaChirho };
}

describe('scene variant publication boundary', () => {
	it('selects the quality upgrade while retaining declared fallback bytes and review states', () => {
		const fallbackChirho = {
			...standardChirho,
			fallback_chirho: true,
			asset_path_chirho: '/assets-chirho/fallback-chirho.webp',
			sha256_chirho: 'c'.repeat(64)
		};
		for (const declarationsChirho of [
			[fallbackChirho, standardChirho],
			[standardChirho, fallbackChirho]
		]) {
			const resultChirho = verifyChirho([standardChirho], declarationsChirho);
			expect(resultChirho.reasonsChirho).toEqual([]);
			expect(resultChirho.mediaChirho).toHaveLength(2);
			expect(
				resultChirho.mediaChirho.every(
					(recordChirho) => recordChirho.art_review_chirho === 'pending'
				)
			).toBe(true);
			expect(
				verifyChirho([fallbackChirho], declarationsChirho).reasonsChirho.length
			).toBeGreaterThan(0);
		}
		expect(verifyChirho([fallbackChirho], [fallbackChirho]).reasonsChirho).toEqual([]);
		expect(
			verifyChirho(
				[standardChirho],
				[
					fallbackChirho,
					{ ...fallbackChirho, asset_path_chirho: '/assets-chirho/another-fallback-chirho.webp' },
					standardChirho
				]
			).reasonsChirho.length
		).toBeGreaterThan(0);
		expect(
			verifyChirho([], [{ ...fallbackChirho, fallback_chirho: 'yes' }]).reasonsChirho.length
		).toBeGreaterThan(0);
		expect(
			verifyChirho([], [{ ...reducedChirho, fallback_chirho: true }]).reasonsChirho.length
		).toBeGreaterThan(0);
	});
	it('accepts single scenes and optional distinct versions without changing pending approval', () => {
		expect(verifyChirho([standardChirho], [standardChirho]).reasonsChirho).toEqual([]);
		const resultChirho = verifyChirho([reducedChirho, standardChirho]);
		expect(resultChirho.reasonsChirho).toEqual([]);
		expect(
			resultChirho.mediaChirho.every((recordChirho) => recordChirho.art_review_chirho === 'pending')
		).toBe(true);
	});
	it('refuses a rehashed shard that swaps variant identity, duplicates a choice, or omits Standard', () => {
		for (const rowsChirho of [
			[standardChirho, { ...reducedChirho, variant_chirho: 'standard' }],
			[standardChirho, { ...reducedChirho, lesson_id_chirho: 'John.1.3' }],
			[standardChirho, { ...reducedChirho, variant_chirho: 'invented' }],
			[standardChirho, reducedChirho, reducedChirho],
			[reducedChirho],
			[standardChirho, { ...reducedChirho, art_review_chirho: 'approved' }]
		])
			expect(verifyChirho(rowsChirho).reasonsChirho.length).toBeGreaterThan(0);
	});
	it('refuses invalid declarations and the same bytes under both choices', () => {
		expect(
			verifyChirho([], [{ ...reducedChirho, variant_chirho: 'invented' }]).reasonsChirho.length
		).toBeGreaterThan(0);
		const repeatedChirho = { ...reducedChirho, sha256_chirho: standardChirho.sha256_chirho };
		expect(
			verifyChirho([standardChirho, repeatedChirho], [standardChirho, repeatedChirho]).reasonsChirho
				.length
		).toBeGreaterThan(0);
		expect(
			verifyChirho([standardChirho], [standardChirho, standardChirho]).reasonsChirho.length
		).toBeGreaterThan(0);
	});
});
