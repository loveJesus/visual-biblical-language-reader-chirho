// For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life. — John 3:16 (KJV)
import { describe, it, expect } from 'vitest';
import {
	ReaderSessionChirho,
	SESSION_KEYS_CHIRHO,
	WELCOME_REVISION_CHIRHO
} from './reader-session-chirho';

function storeChirho() {
	const valuesChirho = new Map<string, string>();
	return {
		valuesChirho,
		getItem: (keyChirho: string) => valuesChirho.get(keyChirho) ?? null,
		setItem: (keyChirho: string, valueChirho: string) => {
			valuesChirho.set(keyChirho, valueChirho);
		}
	};
}
describe('local reader session', () => {
	it('defaults today and playback on, preserves each saved choice, and works when storage refuses', () => {
		const memoryChirho = storeChirho(),
			firstChirho = new ReaderSessionChirho(memoryChirho);
		expect(firstChirho.startTodayChirho).toBe(true);
		expect(firstChirho.autoplayChirho).toBe(true);
		expect(new ReaderSessionChirho().autoplayChirho).toBe(true);
		firstChirho.preferencesChirho(false, false);
		const secondChirho = new ReaderSessionChirho(memoryChirho);
		expect([secondChirho.startTodayChirho, secondChirho.autoplayChirho]).toEqual([false, false]);
		secondChirho.preferencesChirho(false, true);
		expect(new ReaderSessionChirho(memoryChirho).autoplayChirho).toBe(true);
		const blockedChirho = new ReaderSessionChirho({
			getItem() {
				throw Error('blocked');
			},
			setItem() {
				throw Error('blocked');
			}
		});
		expect(blockedChirho.autoplayChirho).toBe(true);
		expect(blockedChirho.launchChirho('', new Date(2026, 10, 8))?.chapter_chirho).toBe(8);
		expect(() => blockedChirho.acknowledgeWelcomeChirho()).not.toThrow();
		blockedChirho.preferencesChirho(false, false);
		expect(blockedChirho.autoplayChirho).toBe(false);
	});
	it('chooses cold daily or verified saved passage, with explicit links first and no foreground jump', () => {
		const memoryChirho = storeChirho(),
			dateChirho = new Date(2026, 10, 8);
		const firstChirho = new ReaderSessionChirho(memoryChirho);
		firstChirho.rememberChirho('John.3.16');
		expect(firstChirho.launchChirho('', dateChirho)).toEqual({
			book_chirho: 'Prov',
			chapter_chirho: 8,
			verse_chirho: 1
		});
		expect(firstChirho.launchChirho('', new Date(2026, 10, 9))).toBeNull();
		firstChirho.preferencesChirho(false, false);
		expect(new ReaderSessionChirho(memoryChirho).launchChirho('', dateChirho)?.book_chirho).toBe(
			'John'
		);
		expect(
			new ReaderSessionChirho(memoryChirho).launchChirho('#Gen.1.1', dateChirho)?.book_chirho
		).toBe('Gen');
		memoryChirho.setItem(SESSION_KEYS_CHIRHO.passage_chirho, 'Unknown.1.1');
		expect(new ReaderSessionChirho(memoryChirho).launchChirho('', dateChirho)?.chapter_chirho).toBe(
			8
		);
	});
	it('shows welcome once per deliberate revision and never plays behind it or on initial restore', () => {
		const memoryChirho = storeChirho(),
			firstChirho = new ReaderSessionChirho(memoryChirho);
		firstChirho.preferencesChirho(true, true);
		firstChirho.launchChirho('');
		expect(firstChirho.welcomeChirho).toBe(true);
		const hiddenChirho = firstChirho.beginChirho('John.1.1', 'navigation-chirho');
		expect(firstChirho.consumeAutoplayChirho(hiddenChirho, 'John.1.1')).toBe(false);
		firstChirho.acknowledgeWelcomeChirho();
		for (const reasonChirho of ['launch-chirho', 'restore-chirho', 'retry-chirho'] as const) {
			const generationChirho = firstChirho.beginChirho('Gen.1.1', reasonChirho);
			expect(firstChirho.consumeAutoplayChirho(generationChirho, 'Gen.1.1')).toBe(false);
		}
		const nextChirho = new ReaderSessionChirho(memoryChirho);
		nextChirho.launchChirho('');
		expect(nextChirho.welcomeChirho).toBe(false);
		memoryChirho.setItem(SESSION_KEYS_CHIRHO.welcome_chirho, `${WELCOME_REVISION_CHIRHO}-old`);
		const changedChirho = new ReaderSessionChirho(memoryChirho);
		changedChirho.launchChirho('');
		expect(changedChirho.welcomeChirho).toBe(true);
	});
	it('consumes explicit navigation once and refuses stale A/B/A, manual cancellation and disabled preferences', () => {
		const sessionChirho = new ReaderSessionChirho(storeChirho());
		sessionChirho.launchChirho('');
		sessionChirho.acknowledgeWelcomeChirho();
		sessionChirho.preferencesChirho(true, true);
		const firstAChirho = sessionChirho.beginChirho('Gen.1.1', 'navigation-chirho');
		sessionChirho.beginChirho('Gen.1.2', 'navigation-chirho');
		const newestAChirho = sessionChirho.beginChirho('Gen.1.1', 'navigation-chirho');
		expect(sessionChirho.consumeAutoplayChirho(firstAChirho, 'Gen.1.1')).toBe(false);
		expect(sessionChirho.consumeAutoplayChirho(newestAChirho, 'Gen.1.1')).toBe(true);
		expect(sessionChirho.consumeAutoplayChirho(newestAChirho, 'Gen.1.1')).toBe(false);
		const manualChirho = sessionChirho.beginChirho('Gen.1.2', 'navigation-chirho');
		sessionChirho.cancelAutoplayChirho();
		expect(sessionChirho.consumeAutoplayChirho(manualChirho, 'Gen.1.2')).toBe(false);
		const offChirho = sessionChirho.beginChirho('Gen.1.3', 'navigation-chirho');
		sessionChirho.preferencesChirho(true, false);
		sessionChirho.preferencesChirho(true, true);
		expect(sessionChirho.consumeAutoplayChirho(offChirho, 'Gen.1.3')).toBe(false);
	});
});
