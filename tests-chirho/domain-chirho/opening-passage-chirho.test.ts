// For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life. — John 3:16 (KJV)
import { describe, expect, it } from 'vitest';
import { openingPassageChirho } from '../../src/lib/reader-chirho/navigation-chirho/opening-passage-chirho';

describe('daily Proverbs opening', () => {
	it('uses every local calendar day including leap day and the thirty-first', () => {
		for (const dayChirho of [1, 15, 28, 29, 30, 31])
			expect(openingPassageChirho('', new Date(2026, 0, dayChirho, 23, 59))).toEqual({
				book_chirho: 'Prov',
				chapter_chirho: dayChirho,
				verse_chirho: 1
			});
		expect(openingPassageChirho('', new Date(2028, 1, 29))).toMatchObject({ chapter_chirho: 29 });
	});
	it('preserves explicit Hebrew/Greek passages and leaves malformed fragments to the existing behavior', () => {
		expect(openingPassageChirho('#John.3.16', new Date(2026, 9, 31))).toEqual({
			book_chirho: 'John',
			chapter_chirho: 3,
			verse_chirho: 16
		});
		expect(openingPassageChirho('#Prov.26.1')).toMatchObject({ chapter_chirho: 26 });
		expect(openingPassageChirho('#Gen.1.1')).toMatchObject({ book_chirho: 'Gen' });
		expect(openingPassageChirho('#../private')).toBeNull();
	});
});
