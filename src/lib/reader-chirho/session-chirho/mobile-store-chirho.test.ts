// For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life. — John 3:16 (KJV)
import { describe, expect, it } from 'vitest';
import { APP_STORES_CHIRHO } from '$lib/site-chirho/apps-chirho/downloads-chirho';
import { mobileStoreChirho } from './mobile-store-chirho';

describe('local mobile install hint', () => {
	it('uses the existing Apple listing for iPhone, iPad, iPod and desktop-mode iPadOS', () => {
		const appleChirho = APP_STORES_CHIRHO.find(
			(storeChirho) => storeChirho.id_chirho === 'apple-chirho'
		);
		for (const userAgentChirho of [
			'Mozilla/5.0 (iPhone)',
			'Mozilla/5.0 (iPad)',
			'Mozilla/5.0 (iPod)'
		])
			expect(
				mobileStoreChirho({ userAgent: userAgentChirho, platform: '', maxTouchPoints: 1 })
			).toBe(appleChirho);
		expect(
			mobileStoreChirho({
				userAgent: 'Mozilla/5.0 (Macintosh)',
				platform: 'MacIntel',
				maxTouchPoints: 5
			})
		).toBe(appleChirho);
	});
	it('uses only the existing Google listing for Android phones and tablets', () => {
		const googleChirho = APP_STORES_CHIRHO.find(
			(storeChirho) => storeChirho.id_chirho === 'google-chirho'
		);
		for (const userAgentChirho of [
			'Mozilla/5.0 (Linux; Android 16; Phone)',
			'Mozilla/5.0 (Linux; Android 16; Tablet)'
		])
			expect(
				mobileStoreChirho({
					userAgent: userAgentChirho,
					platform: 'Linux armv8l',
					maxTouchPoints: 5
				})
			).toBe(googleChirho);
	});
	it('offers no mobile store on desktops, unknown platforms, or legacy Windows Phone Android tokens', () => {
		expect(mobileStoreChirho()).toBeNull();
		for (const navigatorChirho of [
			{ userAgent: 'Mozilla/5.0 (Macintosh)', platform: 'MacIntel', maxTouchPoints: 0 },
			{ userAgent: 'Mozilla/5.0 (Windows NT 10.0)', platform: 'Win32', maxTouchPoints: 10 },
			{ userAgent: 'Mozilla/5.0 (X11; Linux x86_64)', platform: 'Linux x86_64', maxTouchPoints: 0 },
			{ userAgent: 'Unknown browser', platform: '', maxTouchPoints: 0 },
			{
				userAgent: 'Mozilla/5.0 (Windows Phone 10.0; Android 6.0.1)',
				platform: 'Win32',
				maxTouchPoints: 5
			}
		])
			expect(mobileStoreChirho(navigatorChirho)).toBeNull();
	});
});
