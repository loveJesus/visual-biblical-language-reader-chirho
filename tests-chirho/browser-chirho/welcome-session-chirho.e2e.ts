// For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life. — John 3:16 (KJV)
import { test as testChirho, expect as expectChirho } from '@playwright/test';
import { readerOriginChirho } from '../fixtures-chirho/runtime-chirho';

testChirho.beforeEach(async ({ page: pageChirho }) => {
	await pageChirho.addInitScript(() => {
		const nativeVolumeChirho = Object.getOwnPropertyDescriptor(
			HTMLMediaElement.prototype,
			'volume'
		)!;
		const nativePlayChirho = HTMLMediaElement.prototype.play;
		Object.assign(window, { __readerPlaysChirho: 0 });
		Object.defineProperty(HTMLMediaElement.prototype, 'volume', {
			configurable: true,
			get() {
				return nativeVolumeChirho.get!.call(this);
			},
			set() {
				nativeVolumeChirho.set!.call(this, 0);
			}
		});
		HTMLMediaElement.prototype.play = function () {
			nativeVolumeChirho.set!.call(this, 0);
			if (nativeVolumeChirho.get!.call(this) !== 0)
				return Promise.reject(new Error('Quiet output unavailable'));
			const stateChirho = window as typeof window & { __readerPlaysChirho: number };
			stateChirho.__readerPlaysChirho += 1;
			return nativePlayChirho.call(this);
		};
		if (typeof SpeechSynthesis !== 'undefined') SpeechSynthesis.prototype.speak = () => {};
	});
});

testChirho(
	'welcome stays quiet, closes with keyboard, and is not repeated on routine reload',
	async ({ page: pageChirho }) => {
		const videosChirho: string[] = [];
		pageChirho.on('request', (requestChirho) => {
			if (/\.mp4(?:$|\?)/u.test(requestChirho.url())) videosChirho.push(requestChirho.url());
		});
		await pageChirho.goto(`${readerOriginChirho}/?lang_chirho=en#Prov.1.1`);
		await expectChirho(
			pageChirho.locator('dialog[aria-labelledby="welcome-heading-chirho"]')
		).toBeVisible();
		await expectChirho(pageChirho.locator('.welcome-start-chirho')).toBeVisible();
		await expectChirho(pageChirho.locator('.welcome-tour-chirho')).toHaveAttribute(
			'href',
			/\/tutorial-chirho\/\?lang_chirho=en$/u
		);
		expectChirho(videosChirho).toHaveLength(0);
		expectChirho(
			await pageChirho.evaluate(
				() => (window as typeof window & { __readerPlaysChirho: number }).__readerPlaysChirho
			)
		).toBe(0);
		await pageChirho.keyboard.press('Escape');
		await expectChirho(
			pageChirho.locator('dialog[aria-labelledby="welcome-heading-chirho"]')
		).toHaveCount(0);
		await pageChirho.reload();
		await expectChirho(pageChirho.locator('[data-speech-pending-chirho="true"]')).toHaveCount(0);
		await expectChirho(
			pageChirho.locator('dialog[aria-labelledby="welcome-heading-chirho"]')
		).toHaveCount(0);
	}
);

testChirho(
	'turning today off resumes the verified passage, while a linked passage wins',
	async ({ page: pageChirho }) => {
		await pageChirho.goto(`${readerOriginChirho}/?lang_chirho=en#John.3.16`);
		await pageChirho.locator('.welcome-start-chirho').click();
		await expectChirho(pageChirho.locator('.lesson-heading-chirho')).toContainText('3:16');
		await pageChirho.locator('.reader-settings-chirho summary').click();
		await pageChirho.locator('.reader-settings-chirho input').first().uncheck();
		await expectChirho
			.poll(() => pageChirho.evaluate(() => localStorage.getItem('hinneh-start-today-chirho')))
			.toBe('false');
		await pageChirho.goto(`${readerOriginChirho}/?lang_chirho=en`);
		await expectChirho(pageChirho.locator('.lesson-heading-chirho')).toContainText('3:16');
		await pageChirho.goto(`${readerOriginChirho}/?lang_chirho=en#Gen.1.1`);
		await expectChirho(pageChirho.locator('.lesson-heading-chirho')).toContainText('1:1');
		await expectChirho
			.poll(() => pageChirho.evaluate(() => localStorage.getItem('hinneh-last-passage-chirho')))
			.toBe('Gen.1.1');
	}
);

testChirho(
	'an opted-in preference still leaves initial loading and welcome silent',
	async ({ page: pageChirho }) => {
		await pageChirho.addInitScript(() =>
			localStorage.setItem('hinneh-autoplay-verse-chirho', 'true')
		);
		await pageChirho.goto(`${readerOriginChirho}/?lang_chirho=en#Prov.1.1`);
		await pageChirho.locator('.welcome-start-chirho').click();
		await expectChirho(pageChirho.locator('[data-speech-pending-chirho="true"]')).toHaveCount(0);
		await expectChirho
			.poll(() =>
				pageChirho.evaluate(
					() => (window as typeof window & { __readerPlaysChirho: number }).__readerPlaysChirho
				)
			)
			.toBe(0);
		await pageChirho.locator('.reader-help-chirho summary').click();
		await expectChirho(pageChirho.locator('.reader-help-chirho a').first()).toHaveAttribute(
			'href',
			/\/tutorial-chirho\/\?lang_chirho=en$/u
		);
	}
);

testChirho(
	'denied local storage does not prevent opening and reading a linked passage',
	async ({ page: pageChirho }) => {
		await pageChirho.addInitScript(() =>
			Object.defineProperty(window, 'localStorage', {
				configurable: true,
				get() {
					throw new DOMException('test storage denied', 'SecurityError');
				}
			})
		);
		await pageChirho.goto(`${readerOriginChirho}/?lang_chirho=en#John.1.1`);
		await pageChirho.locator('.welcome-start-chirho').click();
		await expectChirho(pageChirho.locator('.lesson-heading-chirho')).toContainText('1:1');
		await expectChirho(pageChirho.locator('[data-speech-pending-chirho="true"]')).toHaveCount(0);
		await expectChirho
			.poll(() =>
				pageChirho.evaluate(
					() => (window as typeof window & { __readerPlaysChirho: number }).__readerPlaysChirho
				)
			)
			.toBe(0);
	}
);

for (const platformChirho of [
	{
		id_chirho: 'iphone-chirho',
		user_agent_chirho: 'Mozilla/5.0 (iPhone)',
		platform_chirho: 'iPhone',
		touches_chirho: 5,
		host_chirho: 'apps.apple.com',
		width_chirho: 320
	},
	{
		id_chirho: 'android-chirho',
		user_agent_chirho: 'Mozilla/5.0 (Linux; Android 16)',
		platform_chirho: 'Linux armv8l',
		touches_chirho: 5,
		host_chirho: 'play.google.com',
		width_chirho: 320
	},
	{
		id_chirho: 'desktop-chirho',
		user_agent_chirho: 'Mozilla/5.0 (Macintosh)',
		platform_chirho: 'MacIntel',
		touches_chirho: 0,
		host_chirho: null,
		width_chirho: 1440
	}
])
	for (const localeChirho of ['en', 'es']) {
		testChirho(
			`${platformChirho.id_chirho} ${localeChirho}: matching optional install link, quiet default on, saved off`,
			async ({ page: pageChirho }) => {
				await pageChirho.setViewportSize({ width: platformChirho.width_chirho, height: 844 });
				await pageChirho.addInitScript((valuesChirho) => {
					Object.defineProperties(navigator, {
						userAgent: { get: () => valuesChirho.user_agent_chirho },
						platform: { get: () => valuesChirho.platform_chirho },
						maxTouchPoints: { get: () => valuesChirho.touches_chirho }
					});
				}, platformChirho);
				await pageChirho.goto(`${readerOriginChirho}/?lang_chirho=${localeChirho}#Prov.1.1`);
				const installChirho = pageChirho.locator('.welcome-install-chirho a');
				await expectChirho(installChirho).toHaveCount(platformChirho.host_chirho ? 1 : 0);
				const hrefChirho = platformChirho.host_chirho
					? await installChirho.getAttribute('href')
					: null;
				if (hrefChirho) expectChirho(new URL(hrefChirho).hostname).toBe(platformChirho.host_chirho);
				await expectChirho(pageChirho.locator('.welcome-tour-chirho')).toHaveAttribute(
					'href',
					new RegExp(`lang_chirho=${localeChirho}$`, 'u')
				);
				await pageChirho.locator('.welcome-start-chirho').click();
				await pageChirho.locator('.reader-help-chirho summary').click();
				if (hrefChirho)
					await expectChirho(
						pageChirho.locator('.reader-help-chirho a').filter({ hasText: 'Hinneh' })
					).toHaveAttribute('href', hrefChirho);
				else
					await expectChirho(
						pageChirho.locator('.reader-help-chirho a').filter({ hasText: 'Hinneh' })
					).toHaveCount(0);
				await pageChirho.locator('.reader-settings-chirho summary').click();
				const autoplayChirho = pageChirho.locator('.reader-settings-chirho input').nth(1);
				await expectChirho(autoplayChirho).toBeChecked();
				await autoplayChirho.uncheck();
				expectChirho(
					await pageChirho.evaluate(() => localStorage.getItem('hinneh-autoplay-verse-chirho'))
				).toBe('false');
				await pageChirho.reload();
				await pageChirho.locator('.reader-settings-chirho summary').click();
				await expectChirho(autoplayChirho).not.toBeChecked();
				expectChirho(
					await pageChirho.evaluate(() => document.documentElement.scrollWidth <= innerWidth)
				).toBe(true);
				expectChirho(
					await pageChirho.evaluate(
						() => (window as typeof window & { __readerPlaysChirho: number }).__readerPlaysChirho
					)
				).toBe(0);
			}
		);
	}

testChirho(
	'policy-blocked navigation keeps its verified video for a successful manual retry',
	async ({ page: pageChirho }) => {
		await pageChirho.goto(`${readerOriginChirho}/?lang_chirho=en#Prov.1.2`);
		await pageChirho.locator('.welcome-start-chirho').click();
		await expectChirho(pageChirho.locator('.lesson-heading-chirho')).toContainText('1:2');
		await expectChirho(pageChirho.locator('[data-speech-pending-chirho="true"]')).toHaveCount(0);
		await pageChirho.evaluate(() => {
			const nativePlayChirho = HTMLMediaElement.prototype.play;
			const stateChirho = window as typeof window & { __blockedVideoAttemptsChirho: number };
			stateChirho.__blockedVideoAttemptsChirho = 0;
			HTMLMediaElement.prototype.play = function () {
				if (this instanceof HTMLVideoElement && stateChirho.__blockedVideoAttemptsChirho++ === 0)
					return Promise.reject(new DOMException('User gesture required', 'NotAllowedError'));
				return nativePlayChirho.call(this);
			};
		});
		await pageChirho.locator('.verse-step-chirho').first().click();
		await expectChirho
			.poll(() =>
				pageChirho.evaluate(
					() =>
						(window as typeof window & { __blockedVideoAttemptsChirho: number })
							.__blockedVideoAttemptsChirho
				)
			)
			.toBe(1);
		const buttonChirho = pageChirho.locator('[data-audio-controls-chirho] .speech-button-chirho');
		await expectChirho(buttonChirho).toBeEnabled();
		await expectChirho(buttonChirho).not.toHaveAttribute('aria-busy', 'true');
		await expectChirho(pageChirho.locator('video[data-scene-video-chirho]')).not.toHaveAttribute(
			'data-video-failed-chirho',
			'true'
		);
		await buttonChirho.click();
		await expectChirho(pageChirho.locator('video[data-scene-video-chirho]')).toBeVisible();
		await expectChirho(buttonChirho).toHaveAttribute('aria-busy', 'true');
		await buttonChirho.click();
		await expectChirho(pageChirho.locator('video[data-scene-video-chirho]')).toBeHidden();
	}
);
