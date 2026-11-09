// For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life. — John 3:16 (KJV)
import { expect, it, vi } from 'vitest';
import { SITE_ORIGIN_CHIRHO } from '$lib/site-chirho';
const environmentChirho = vi.hoisted(() => ({ developmentChirho: true }));
vi.mock('$app/environment', () => ({
	get dev() {
		return environmentChirho.developmentChirho;
	}
}));
import { artworkUrlChirho } from './artwork-url-chirho';

it('uses the canonical media origin in development and relative delivery in production', () => {
	const pathChirho = '/assets-chirho/scenes-chirho/test-chirho/scene-chirho.webp';
	expect(artworkUrlChirho(pathChirho)).toBe(SITE_ORIGIN_CHIRHO + pathChirho);
	environmentChirho.developmentChirho = false;
	try {
		expect(artworkUrlChirho(pathChirho)).toBe(pathChirho);
	} finally {
		environmentChirho.developmentChirho = true;
	}
});
