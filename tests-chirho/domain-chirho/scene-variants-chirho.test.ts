// For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life. — John 3:16 (KJV)

import { describe, expect, it } from 'vitest';
import { validateScenesChirho } from '../../src/lib/domain-chirho/media-chirho';

const standardChirho = {
	lesson_id_chirho: 'John.1.2',
	asset_path_chirho: '/assets-chirho/standard-chirho.webp',
	alt_chirho: 'A figure within blue and gold clouds.',
	width_chirho: 1448,
	height_chirho: 1086,
	sha256_chirho: 'a'.repeat(64),
	art_review_chirho: 'pending',
	reading_note_chirho: 'An imaginative Standard scene.'
};
const reducedChirho = {
	...standardChirho,
	variant_chirho: 'representation_reduced',
	asset_path_chirho: '/assets-chirho/reduced-chirho.webp',
	sha256_chirho: 'b'.repeat(64),
	alt_chirho: 'An unlettered scroll in golden light.',
	reading_note_chirho: 'An optional symbolic composition.'
};
const catalogueChirho = (scenesChirho: unknown[]) => ({
	schema_version_chirho: 1,
	scenes_chirho: scenesChirho
});

describe('selective scene versions', () => {
	it('keeps legacy single images and joins an optional version independent of array order', () => {
		const singleChirho = validateScenesChirho(catalogueChirho([standardChirho]));
		expect(singleChirho['John.1.2'].asset_path_chirho).toBe(standardChirho.asset_path_chirho);
		expect(singleChirho['John.1.2'].representation_reduced_chirho).toBeUndefined();
		for (const entriesChirho of [
			[standardChirho, reducedChirho],
			[reducedChirho, standardChirho]
		]) {
			const joinedChirho = validateScenesChirho(catalogueChirho(entriesChirho));
			expect(Object.keys(joinedChirho)).toEqual(['John.1.2']);
			expect(joinedChirho['John.1.2'].asset_path_chirho).toBe(standardChirho.asset_path_chirho);
			expect(joinedChirho['John.1.2'].representation_reduced_chirho?.reading_note_chirho).toBe(
				reducedChirho.reading_note_chirho
			);
		}
	});
	it('refuses duplicates, orphaned versions, unknown choices and identical image bytes', () => {
		for (const entriesChirho of [
			[standardChirho, standardChirho],
			[standardChirho, reducedChirho, reducedChirho],
			[reducedChirho],
			[standardChirho, { ...reducedChirho, lesson_id_chirho: 'John.1.3' }],
			[standardChirho, { ...reducedChirho, variant_chirho: 'invented' }],
			[{ ...standardChirho, variant_chirho: null }],
			[standardChirho, { ...reducedChirho, asset_path_chirho: standardChirho.asset_path_chirho }],
			[standardChirho, { ...reducedChirho, sha256_chirho: standardChirho.sha256_chirho }]
		])
			expect(() => validateScenesChirho(catalogueChirho(entriesChirho))).toThrow();
	});
});
