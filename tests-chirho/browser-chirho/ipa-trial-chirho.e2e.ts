// For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life. — John 3:16 (KJV)
import { test as testChirho, expect as expectChirho } from '@playwright/test';
import { readerOriginChirho } from '../fixtures-chirho/runtime-chirho';
import lessonChirho from '../../data-chirho/lessons-chirho/proverbs-26-1-chirho.json' with { type: 'json' };

testChirho(
	'a delayed deep link cannot play the initial fixture while its target loads',
	async ({ page: pageChirho }) => {
		let releaseChirho: () => void = () => undefined;
		const holdChirho = new Promise<void>((resolveChirho) => {
			releaseChirho = resolveChirho;
		});
		await pageChirho.route(
			'**/content-chirho/proverbs-chirho/chapter-19-chirho.json',
			async (routeChirho) => {
				await holdChirho;
				await routeChirho.continue();
			}
		);
		await pageChirho.goto(`${readerOriginChirho}#Prov.19.19`);
		await expectChirho
			.poll(
				async () =>
					JSON.parse(
						(await pageChirho
							.locator('[data-speech-recordings-chirho]')
							.getAttribute('data-speech-recordings-chirho')) ?? '[]'
					).length
			)
			.toBeGreaterThan(0);
		await expectChirho(
			pageChirho.locator('.verse-chirho .compact-speech-chirho').first()
		).toBeDisabled();
		releaseChirho();
		await expectChirho(
			pageChirho.getByRole('heading', { name: 'Proverbs 19:19', exact: true })
		).toBeVisible();
	}
);

testChirho(
	'IPA notes preserve Hebrew, jump to the word, and play a real saved clip',
	async ({ page: pageChirho }) => {
		const requestsChirho: string[] = [];
		pageChirho.on('request', (requestChirho) => requestsChirho.push(requestChirho.url()));
		await pageChirho.addInitScript(() => {
			const playingChirho: string[] = [];
			const NativeAudioChirho = window.Audio;
			Object.defineProperty(window, 'ipaPlayingChirho', { value: playingChirho });
			window.Audio = class extends NativeAudioChirho {
				constructor(sourceChirho?: string) {
					super(sourceChirho);
					this.addEventListener('playing', () => playingChirho.push(this.currentSrc));
				}
			};
		});
		await pageChirho.goto(`${readerOriginChirho}?lang_chirho=en#Prov.26.1`);
		const markerChirho = pageChirho.locator(
			'.pronunciation-marker-chirho[href="#word-card-20wMm-chirho"]'
		);
		await expectChirho(markerChirho).toBeVisible();
		const sourceChirho = await pageChirho.locator('.verse-chirho').evaluate((elementChirho) => {
			const cloneChirho = elementChirho.cloneNode(true) as HTMLElement;
			for (const annotationChirho of cloneChirho.querySelectorAll('[data-annotation-chirho]'))
				annotationChirho.remove();
			return cloneChirho.textContent;
		});
		expectChirho(sourceChirho).toBe(lessonChirho.canonical_text_chirho);
		await markerChirho.click();
		const cardChirho = pageChirho.locator('#word-card-20wMm-chirho');
		await expectChirho(cardChirho).toBeFocused();
		await expectChirho(cardChirho.locator('.ipa-transcription-chirho')).toHaveText('/naˈve/');
		await expectChirho
			.poll(async () => {
				const rawChirho = await pageChirho
					.locator('[data-speech-recordings-chirho]')
					.getAttribute('data-speech-recordings-chirho');
				return JSON.parse(rawChirho ?? '[]').some(
					(rowChirho: { ipa_chirho?: string }) => rowChirho.ipa_chirho === 'naˈve'
				);
			})
			.toBe(true);
		await cardChirho.locator('[data-pronounce-chirho]').click();
		await expectChirho
			.poll(() =>
				pageChirho.evaluate(
					() => (window as unknown as { ipaPlayingChirho: string[] }).ipaPlayingChirho.length
				)
			)
			.toBeGreaterThan(0);
		await pageChirho.locator('[data-speech-stop-chirho]').click();
		expectChirho(
			requestsChirho.some((urlChirho) => urlChirho.includes('/audio-chirho/sha256-chirho/'))
		).toBe(true);
		expectChirho(
			requestsChirho.some((urlChirho) => /api\.elevenlabs|text-to-speech/.test(urlChirho))
		).toBe(false);
	}
);

testChirho(
	'pronunciation notes and markers fit phone widths in English and Spanish',
	async ({ page: pageChirho }) => {
		for (const widthChirho of [320, 390]) {
			await pageChirho.setViewportSize({ width: widthChirho, height: 844 });
			for (const localeChirho of ['en', 'es']) {
				await pageChirho.goto(`${readerOriginChirho}?lang_chirho=${localeChirho}#Prov.1.13`);
				await expectChirho(pageChirho.locator('#word-card-20fQr-chirho')).toBeVisible();
				await expectChirho(
					pageChirho.locator('#word-card-20fQr-chirho .ipa-transcription-chirho')
				).toHaveText('/kol/');
				await expectChirho(pageChirho.locator('.pronunciation-note-chirho')).toHaveAttribute(
					'lang',
					localeChirho
				);
				expectChirho(
					await pageChirho.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1)
				).toBe(true);
				const markerChirho = pageChirho.locator('.pronunciation-marker-chirho');
				await expectChirho(markerChirho).toHaveCount(1);
				await markerChirho.click();
				await expectChirho(pageChirho.locator('#word-card-20fQr-chirho')).toBeFocused();
			}
		}
	}
);

testChirho(
	'optional IPA follows Hebrew words, persists, and remains a source annotation',
	async ({ page: pageChirho }) => {
		const audioRequestsChirho: string[] = [];
		pageChirho.on('request', (requestChirho) => {
			if (requestChirho.url().endsWith('.mp3')) audioRequestsChirho.push(requestChirho.url());
		});
		await pageChirho.goto('/?lang_chirho=en#Prov.26.1');
		const wordsChirho = pageChirho.locator('.verse-chirho [data-source-word-chirho]');
		await expectChirho(wordsChirho).toHaveCount(9);
		const sourceChirho = await wordsChirho.allTextContents();
		const toggleChirho = pageChirho.getByRole('radio', { name: 'IPA', exact: true });
		await expectChirho(toggleChirho).not.toBeChecked();
		await expectChirho(
			pageChirho.locator('.verse-chirho [data-word-ipa-chirho]').first()
		).toBeHidden();
		await expectChirho(toggleChirho).toBeEnabled();
		await toggleChirho.focus();
		await pageChirho.keyboard.press('Space');
		await expectChirho(
			pageChirho.locator('.verse-chirho [data-word-ipa-chirho]').filter({ hasText: '/naˈve/' })
		).toBeVisible();
		expectChirho(await wordsChirho.allTextContents()).toEqual(sourceChirho);
		await pageChirho.reload();
		await expectChirho(toggleChirho).toBeChecked();
		for (const widthChirho of [320, 390, 1440]) {
			await pageChirho.setViewportSize({ width: widthChirho, height: 900 });
			expectChirho(
				await pageChirho.evaluate(() => document.documentElement.scrollWidth <= innerWidth)
			).toBe(true);
		}
		await pageChirho
			.getByRole('radio', { name: 'None', exact: true })
			.and(pageChirho.locator('[data-phonetic-choice-chirho]'))
			.check();
		await expectChirho(
			pageChirho.locator('.verse-chirho [data-word-ipa-chirho]').first()
		).toBeHidden();
		expectChirho(audioRequestsChirho).toEqual([]);
		await pageChirho.goto('/?lang_chirho=en#Prov.8.35');
		await expectChirho(toggleChirho).toBeEnabled();
		await toggleChirho.check();
		// With no saved clip supplying IPA, the source-derived reading retains the prefix.
		await pageChirho
			.locator('[data-speech-recordings-chirho]')
			.evaluate((elementChirho) =>
				elementChirho.setAttribute('data-speech-recordings-chirho', '[]')
			);
		await expectChirho(
			pageChirho.locator('.verse-chirho [data-ipa-token-chirho="20pBm"]')
		).toHaveText('/meʔadoˈnaj/');
	}
);

testChirho(
	'Greek IPA follows the selected pronunciation and the Spanish switch',
	async ({ page: pageChirho }) => {
		await pageChirho.goto('/?lang_chirho=en#John.1.2');
		await pageChirho.getByRole('radio', { name: 'IPA', exact: true }).check();
		const choiceChirho = pageChirho.locator('[data-greek-rendition-chirho]');
		const ipaChirho = pageChirho.locator('.greek-verse-chirho [data-word-ipa-chirho]').first();
		await choiceChirho.selectOption('modern_aspirates');
		await expectChirho(ipaChirho).toHaveText('/ˈhutos/');
		await choiceChirho.selectOption('modern');
		await expectChirho(ipaChirho).toHaveText('/ˈutos/');
		await choiceChirho.selectOption('erasmian');
		await expectChirho(ipaChirho).toHaveText('/ˈhuːtos/');
		await pageChirho.goto('/?lang_chirho=es#John.1.2');
		await expectChirho(pageChirho.getByRole('radio', { name: 'AFI', exact: true })).toBeChecked();
		await expectChirho(ipaChirho).toHaveText('/ˈhuːtos/');
		for (const widthChirho of [320, 390]) {
			await pageChirho.setViewportSize({ width: widthChirho, height: 900 });
			expectChirho(
				await pageChirho.evaluate(() => document.documentElement.scrollWidth <= innerWidth)
			).toBe(true);
		}
	}
);
