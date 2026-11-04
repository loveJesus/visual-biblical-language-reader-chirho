// For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life. — John 3:16 (KJV)
import { isReaderRequestChirho } from '../fixtures-chirho/runtime-chirho';

import { test as testChirho, expect as expectChirho } from '@playwright/test';
import { readerOriginChirho } from '../fixtures-chirho/runtime-chirho';

testChirho.beforeEach(async ({ page: pageChirho }) => {
	await pageChirho.addInitScript(() => {
		const localHebrewChirho = {
			name: 'Local Hebrew',
			lang: 'he-IL',
			localService: true,
			default: false,
			voiceURI: 'he-local'
		};
		const localGreekChirho = {
			name: 'Local Greek',
			lang: 'el-GR',
			localService: true,
			default: false,
			voiceURI: 'el-local'
		};
		const remoteChirho = {
			name: 'Remote Hebrew',
			lang: 'he-IL',
			localService: false,
			default: true,
			voiceURI: 'he-remote'
		};
		const ancientGreekChirho = {
			...localGreekChirho,
			name: 'Ancient Greek',
			lang: 'grc',
			default: true,
			voiceURI: 'grc-local'
		};
		const callsChirho: {
			text_chirho: string;
			voice_chirho: typeof localHebrewChirho;
			rate_chirho: number;
		}[] = [];
		let cancellationsChirho = 0;
		let voicesChirho = [remoteChirho, localHebrewChirho, ancientGreekChirho, localGreekChirho];
		const eventsChirho = new EventTarget();
		Object.defineProperty(window, 'SpeechSynthesisUtterance', {
			configurable: true,
			value: class {
				text: string;
				voice = localHebrewChirho;
				lang = '';
				rate = 1;
				onend: (() => void) | null = null;
				onerror: (() => void) | null = null;
				constructor(textChirho: string) {
					this.text = textChirho;
				}
			}
		});
		Object.defineProperty(window, 'speechSynthesis', {
			configurable: true,
			value: {
				getVoices: () => voicesChirho,
				cancel: () => {
					cancellationsChirho += 1;
				},
				speak: (utteranceChirho: { text: string; voice: typeof localHebrewChirho; rate: number }) =>
					callsChirho.push({
						text_chirho: utteranceChirho.text,
						voice_chirho: utteranceChirho.voice,
						rate_chirho: utteranceChirho.rate
					}),
				addEventListener: eventsChirho.addEventListener.bind(eventsChirho),
				removeEventListener: eventsChirho.removeEventListener.bind(eventsChirho)
			}
		});
		Object.defineProperty(window, 'speechProofChirho', {
			value: {
				callsChirho,
				get cancellationsChirho() {
					return cancellationsChirho;
				},
				setVoicesChirho: (nextChirho: typeof voicesChirho) => {
					voicesChirho = nextChirho;
					eventsChirho.dispatchEvent(new Event('voiceschanged'));
				}
			}
		});
	});
});

testChirho(
	'word playback uses source readings and local voices; navigation cancels',
	async ({ page: pageChirho }) => {
		const requestsChirho: string[] = [];
		pageChirho.on('request', (requestChirho) => requestsChirho.push(requestChirho.url()));
		await pageChirho.route('**/audio-chirho/**', (routeChirho) =>
			routeChirho.fulfill({ status: 404 })
		);
		await pageChirho.goto(`${readerOriginChirho}#Prov.19.19`);
		const wordChirho = pageChirho
			.locator('.verse-chirho')
			.getByRole('button', { name: 'Pronounce גְּֽדָל', exact: true });
		await expectChirho(wordChirho).toBeEnabled();
		await wordChirho.click();
		let proofChirho = await pageChirho.evaluate(
			() =>
				(
					window as unknown as {
						speechProofChirho: {
							callsChirho: {
								text_chirho: string;
								voice_chirho: { localService: boolean; lang: string };
								rate_chirho: number;
							}[];
							cancellationsChirho: number;
						};
					}
				).speechProofChirho
		);
		expectChirho(proofChirho.callsChirho).toHaveLength(1);
		expectChirho(proofChirho.callsChirho[0].voice_chirho).toMatchObject({
			localService: true,
			lang: 'he-IL'
		});
		expectChirho(proofChirho.callsChirho[0].rate_chirho).toBe(0.85);
		expectChirho(proofChirho.callsChirho[0].text_chirho.startsWith('גְּֽדָל')).toBe(true);

		await wordChirho.click();
		proofChirho = await pageChirho.evaluate(
			() => (window as unknown as { speechProofChirho: typeof proofChirho }).speechProofChirho
		);
		expectChirho(proofChirho.callsChirho.at(-1)?.text_chirho).toBe('גְּֽדָל');
		await expectChirho(wordChirho).not.toHaveAttribute('aria-busy', 'true');
		// A second tap stops; start a new word playback before proving navigation cancellation.
		await wordChirho.click();
		await expectChirho(wordChirho).toHaveAttribute('aria-busy', 'true');
		const cancelledChirho = proofChirho.cancellationsChirho;
		await pageChirho.evaluate(() => {
			location.hash = 'John.2.1';
		});
		await expectChirho(
			pageChirho.getByRole('heading', { name: 'John 2:1', exact: true })
		).toBeVisible();
		await expectChirho
			.poll(async () =>
				pageChirho.evaluate(
					() =>
						(window as unknown as { speechProofChirho: { cancellationsChirho: number } })
							.speechProofChirho.cancellationsChirho
				)
			)
			.toBeGreaterThan(cancelledChirho);
		// Modern device speech remains valid for an unaspirated word, without impersonating a rendition.
		await pageChirho.locator('.verse-chirho .compact-speech-chirho:enabled').first().click();
		proofChirho = await pageChirho.evaluate(
			() => (window as unknown as { speechProofChirho: typeof proofChirho }).speechProofChirho
		);
		expectChirho(proofChirho.callsChirho.at(-1)?.voice_chirho).toMatchObject({
			localService: true,
			lang: 'el-GR'
		});
		await pageChirho.getByRole('button', { name: 'Stop', exact: true }).click();
		await expectChirho(
			pageChirho.getByRole('button', { name: 'Stop', exact: true })
		).toBeDisabled();
		expectChirho(
			requestsChirho.filter(
				(urlChirho) =>
					!isReaderRequestChirho(urlChirho) || new URL(urlChirho).pathname.startsWith('/api')
			)
		).toEqual([]);
	}
);

testChirho(
	'word rendition choice keeps cached pronunciation, pitch and missing-profile boundaries',
	async ({ page: pageChirho }) => {
		await pageChirho.addInitScript(() => {
			const NativeAudioChirho = window.Audio;
			Object.defineProperty(window, 'renditionAudiosChirho', { value: [] });
			window.Audio = class extends NativeAudioChirho {
				constructor(sourceChirho?: string) {
					super(sourceChirho);
					(
						window as unknown as { renditionAudiosChirho: HTMLAudioElement[] }
					).renditionAudiosChirho.push(this);
				}
			};
		});
		await pageChirho.goto(`${readerOriginChirho}?lang_chirho=en#John.1.1`);
		const selectChirho = pageChirho.getByLabel('Pronunciation', { exact: true });
		const wordChirho = pageChirho.locator('.greek-verse-chirho .compact-speech-chirho').first();
		await selectChirho.selectOption('modern');
		await expectChirho(wordChirho).toBeEnabled();
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
		const tokenChirho = await wordChirho.getAttribute('data-speech-token-chirho');
		const clipsChirho = JSON.parse(
			(await pageChirho
				.locator('[data-speech-recordings-chirho]')
				.getAttribute('data-speech-recordings-chirho')) ?? '[]'
		);
		const expectedChirho = clipsChirho.find(
			(rowChirho: { token_id_chirho: string; pronunciation_chirho: string }) =>
				rowChirho.token_id_chirho === tokenChirho &&
				rowChirho.pronunciation_chirho === 'modern_greek'
		);
		expectChirho(expectedChirho).toBeTruthy();
		await wordChirho.click();
		await expectChirho
			.poll(() =>
				pageChirho.evaluate(() => {
					const audioChirho = (
						window as unknown as { renditionAudiosChirho: HTMLAudioElement[] }
					).renditionAudiosChirho.at(-1);
					return audioChirho && !audioChirho.paused && audioChirho.currentTime > 0;
				})
			)
			.toBe(true);
		const proofChirho = await pageChirho.evaluate(() => {
			const audioChirho = (
				window as unknown as { renditionAudiosChirho: HTMLAudioElement[] }
			).renditionAudiosChirho.at(-1)!;
			return {
				src_chirho: new URL(audioChirho.src).pathname,
				rate_chirho: audioChirho.playbackRate,
				pitch_chirho: audioChirho.preservesPitch
			};
		});
		expectChirho(proofChirho).toEqual({
			src_chirho: expectedChirho.asset_path_chirho,
			rate_chirho: 0.88,
			pitch_chirho: true
		});
		await pageChirho.getByRole('button', { name: 'Stop', exact: true }).click();
		await selectChirho.selectOption('erasmian');
		await expectChirho(wordChirho).toBeDisabled();
		await expectChirho(pageChirho.locator('[data-audio-status-chirho]')).toContainText(
			'not recorded'
		);
		expectChirho(
			await pageChirho.evaluate(
				() =>
					(window as unknown as { speechProofChirho: { callsChirho: unknown[] } }).speechProofChirho
						.callsChirho
			)
		).toEqual([]);
		await pageChirho.reload();
		await expectChirho(selectChirho).toHaveValue('erasmian');
	}
);

testChirho(
	'missing local voice never falls back to a remote voice and becomes available after a voice event',
	async ({ page: pageChirho }) => {
		await pageChirho.route('**/audio-chirho/**', (routeChirho) =>
			routeChirho.fulfill({ status: 404 })
		);
		await pageChirho.goto(`${readerOriginChirho}#Prov.19.20`);
		const wordChirho = pageChirho.locator('.verse-chirho .compact-speech-chirho').first();
		await expectChirho(wordChirho).toBeEnabled();
		await pageChirho.evaluate(() =>
			(
				window as unknown as {
					speechProofChirho: { setVoicesChirho: (voicesChirho: unknown[]) => void };
				}
			).speechProofChirho.setVoicesChirho([
				{
					name: 'Remote only',
					lang: 'he-IL',
					localService: false,
					default: true,
					voiceURI: 'remote'
				}
			])
		);
		await expectChirho(wordChirho).toBeDisabled();
		await expectChirho(pageChirho.locator('[data-audio-status-chirho]')).toContainText(
			'not available'
		);
		await pageChirho.evaluate(() =>
			(
				window as unknown as {
					speechProofChirho: { setVoicesChirho: (voicesChirho: unknown[]) => void };
				}
			).speechProofChirho.setVoicesChirho([
				{
					name: 'Added locally',
					lang: 'he-IL',
					localService: true,
					default: true,
					voiceURI: 'local'
				}
			])
		);
		await expectChirho(wordChirho).toBeEnabled();
	}
);

testChirho(
	'corner pronunciation controls preserve grammar cues and word navigation at phone widths',
	async ({ page: pageChirho }) => {
		for (const widthChirho of [1440, 390, 320]) {
			await pageChirho.setViewportSize({ width: widthChirho, height: 900 });
			for (const passageChirho of ['Prov.26.1', 'Prov.3.1', 'John.1.1']) {
				await pageChirho.goto(`${readerOriginChirho}#${passageChirho}`);
				const titleChirho = passageChirho
					.replace('Prov.', 'Proverbs ')
					.replace('John.', 'John ')
					.replace('.', ':');
				await expectChirho(
					pageChirho.getByRole('heading', { name: titleChirho, exact: true })
				).toBeVisible();
				const proofChirho = await pageChirho.evaluate(() => {
					const collisionsChirho: string[] = [];
					for (const unitChirho of document.querySelectorAll('.word-pronunciation-chirho')) {
						const buttonChirho = unitChirho
							.querySelector('.compact-speech-chirho')!
							.getBoundingClientRect();
						for (const textChirho of unitChirho.querySelectorAll('sup')) {
							// Measure the actual cue hit area, excluding clipped screen-reader text
							// and hidden tooltip content whose Range rectangles are not painted.
							const targetChirho = textChirho.querySelector('.cue-help-chirho') ?? textChirho;
							for (const rectChirho of [targetChirho.getBoundingClientRect()])
								if (
									Math.min(buttonChirho.right, rectChirho.right) -
										Math.max(buttonChirho.left, rectChirho.left) >
										1 &&
									Math.min(buttonChirho.bottom, rectChirho.bottom) -
										Math.max(buttonChirho.top, rectChirho.top) >
										1
								)
									collisionsChirho.push(textChirho.textContent ?? '');
						}
					}
					const controlsChirho = Array.from(
						document.querySelectorAll('.verse-transport-chirho > button'),
						(buttonChirho) => {
							const rectChirho = buttonChirho.getBoundingClientRect();
							return rectChirho.top + rectChirho.height / 2;
						}
					);
					const transportChirho = document
						.querySelector('.verse-transport-chirho')!
						.getBoundingClientRect();
					const controlsFitChirho = Array.from(
						document.querySelectorAll('.verse-transport-chirho > button')
					).every((buttonChirho) => {
						const rectChirho = buttonChirho.getBoundingClientRect();
						return (
							rectChirho.left >= transportChirho.left - 1 &&
							rectChirho.right <= transportChirho.right + 1
						);
					});
					return {
						overflow_chirho: document.documentElement.scrollWidth > innerWidth,
						collisions_chirho: collisionsChirho,
						controls_chirho: controlsChirho,
						controls_fit_chirho: controlsFitChirho
					};
				});
				expectChirho(proofChirho.overflow_chirho).toBe(false);
				expectChirho(proofChirho.collisions_chirho).toEqual([]);
				expectChirho(proofChirho.controls_fit_chirho).toBe(true);
				expectChirho(
					Math.max(...proofChirho.controls_chirho) - Math.min(...proofChirho.controls_chirho)
				).toBeLessThan(1);
				const wordChirho = pageChirho.locator('.verse-chirho .compact-speech-chirho').first();
				await expectChirho(wordChirho).toBeEnabled();
				await wordChirho.click();
				expectChirho(pageChirho.url()).toContain(`#${passageChirho}`);
			}
		}
	}
);

testChirho(
	'cached auditions play without a device voice or provider request and stop on navigation',
	async ({ page: pageChirho }) => {
		await pageChirho.addInitScript(() => {
			const NativeAudioChirho = window.Audio;
			const proofChirho = { sources_chirho: [] as string[] };
			Object.defineProperty(window, 'audioProofChirho', { value: proofChirho });
			Object.defineProperty(window, 'Audio', {
				configurable: true,
				value: function trackedAudioChirho(sourceChirho?: string) {
					const elementChirho = new NativeAudioChirho(sourceChirho);
					elementChirho.addEventListener('playing', () => {
						if (!proofChirho.sources_chirho.includes(elementChirho.src))
							proofChirho.sources_chirho.push(elementChirho.src);
					});
					return elementChirho;
				}
			});
		});
		const requestsChirho: string[] = [];
		pageChirho.on('request', (requestChirho) => requestsChirho.push(requestChirho.url()));
		for (const passageChirho of ['Prov.26.1', 'John.1.1']) {
			await pageChirho.goto(`${readerOriginChirho}?lang_chirho=es#${passageChirho}`);
			await expectChirho(pageChirho.locator('[data-audio-status-chirho]')).toContainText(
				'Prueba de voz IA'
			);
			await pageChirho.evaluate(() =>
				(
					window as unknown as {
						speechProofChirho: { setVoicesChirho: (voicesChirho: unknown[]) => void };
					}
				).speechProofChirho.setVoicesChirho([])
			);
			const firstWordChirho = pageChirho
				.locator('.verse-chirho .compact-speech-chirho:enabled')
				.first();
			await expectChirho(firstWordChirho).toBeEnabled();
			const clipsBeforeChirho = await pageChirho.evaluate(
				() =>
					(window as unknown as { audioProofChirho: { sources_chirho: string[] } }).audioProofChirho
						.sources_chirho.length
			);
			await firstWordChirho.click();
			await expectChirho(firstWordChirho).toHaveAttribute('aria-busy', 'true');
			await expectChirho(pageChirho.locator('[data-audio-status-chirho]')).toContainText(
				'Reproduciendo la grabación'
			);
			await expectChirho
				.poll(() =>
					pageChirho.evaluate(
						() =>
							(window as unknown as { audioProofChirho: { sources_chirho: string[] } })
								.audioProofChirho.sources_chirho.length
					)
				)
				.toBe(clipsBeforeChirho + 1);
			await pageChirho.getByRole('button', { name: 'Detener', exact: true }).click();
			await expectChirho(firstWordChirho).not.toHaveAttribute('aria-busy', 'true');
			const wordChirho = pageChirho.locator('.verse-chirho .compact-speech-chirho:enabled').nth(1);
			await wordChirho.click();
			await expectChirho(wordChirho).toHaveAttribute('aria-busy', 'true');
			await expectChirho
				.poll(() =>
					pageChirho.evaluate(
						() =>
							(window as unknown as { audioProofChirho: { sources_chirho: string[] } })
								.audioProofChirho.sources_chirho.length
					)
				)
				.toBe(clipsBeforeChirho + 2);
			await pageChirho.evaluate(() => {
				location.hash = 'Prov.26.2';
			});
			await expectChirho(
				pageChirho.getByRole('heading', { name: 'Proverbios 26:2', exact: true })
			).toBeVisible();
			await expectChirho(
				pageChirho.getByRole('button', { name: 'Detener', exact: true })
			).toBeDisabled();
			expectChirho(
				await pageChirho.evaluate(
					() =>
						(window as unknown as { speechProofChirho: { callsChirho: unknown[] } })
							.speechProofChirho.callsChirho
				)
			).toEqual([]);
		}
		expectChirho(
			requestsChirho.filter((urlChirho) => new URL(urlChirho).pathname.endsWith('.mp3')).length
		).toBeGreaterThanOrEqual(4);
		expectChirho(
			requestsChirho.filter(
				(urlChirho) =>
					!isReaderRequestChirho(urlChirho) || new URL(urlChirho).pathname.startsWith('/api')
			)
		).toEqual([]);
	}
);

testChirho(
	'the reader exposes only word audio while keeping passage navigation and pronunciation controls',
	async ({ page: pageChirho }) => {
		for (const passageChirho of ['Prov.26.1', 'John.1.1']) {
			await pageChirho.goto(`${readerOriginChirho}?lang_chirho=en#${passageChirho}`);
			await expectChirho(pageChirho.locator('[data-speech-recordings-chirho]')).toBeVisible();
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
				pageChirho.locator('[data-pronounce-chirho]:not(.word-speech-chirho)')
			).toHaveCount(0);
			const clipsChirho = JSON.parse(
				(await pageChirho
					.locator('[data-speech-recordings-chirho]')
					.getAttribute('data-speech-recordings-chirho')) ?? '[]'
			);
			expectChirho(
				clipsChirho.every(
					(rowChirho: { token_id_chirho: string | null }) => rowChirho.token_id_chirho !== null
				)
			).toBe(true);
			await expectChirho(
				pageChirho.getByRole('button', { name: 'Next verse', exact: true })
			).toBeEnabled();
			await expectChirho(
				pageChirho.getByRole('checkbox', { name: 'Show IPA', exact: true })
			).toBeVisible();
			await expectChirho(pageChirho.locator('[data-speech-rate-chirho]')).toBeVisible();
			await pageChirho.getByRole('button', { name: 'Next verse', exact: true }).click();
			await expectChirho(pageChirho).toHaveURL(
				new RegExp(passageChirho.replace(/\./g, '\\.').replace(/1$/, '2') + '$')
			);
			await expectChirho(
				pageChirho.locator('[data-pronounce-chirho]:not(.word-speech-chirho)')
			).toHaveCount(0);
		}
	}
);
