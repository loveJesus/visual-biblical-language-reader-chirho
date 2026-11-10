// For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life. — John 3:16 (KJV)

import { expect as expectChirho, test as testChirho } from '@playwright/test';
import { readerOriginChirho } from '../fixtures-chirho/runtime-chirho';

testChirho(
	'successive word speakers play existing MP3s through their spoken end',
	async ({ page: pageChirho }) => {
		await pageChirho.addInitScript(() => {
			const NativeAudioChirho = window.Audio;
			const proofChirho = {
				pauses_chirho: [] as { source_chirho: string; time_chirho: number }[],
				playing_chirho: [] as string[],
				rates_chirho: [] as number[],
				errors_chirho: [] as string[]
			};
			Object.defineProperty(window, 'wordPlaybackProofChirho', { value: proofChirho });
			window.Audio = class extends NativeAudioChirho {
				constructor(sourceChirho?: string) {
					super(sourceChirho);
					this.addEventListener('playing', () => {
						proofChirho.playing_chirho.push(new URL(this.src).pathname);
						proofChirho.rates_chirho.push(this.playbackRate);
					});
					this.addEventListener('ended', () =>
						proofChirho.pauses_chirho.push({
							source_chirho: new URL(this.src).pathname,
							time_chirho: this.currentTime
						})
					);
					this.addEventListener('error', () =>
						proofChirho.errors_chirho.push(this.currentSrc || this.src)
					);
				}
				pause() {
					if (!this.paused)
						proofChirho.pauses_chirho.push({
							source_chirho: new URL(this.src).pathname,
							time_chirho: this.currentTime
						});
					super.pause();
				}
			};
		});
		await pageChirho.goto(`${readerOriginChirho}?lang_chirho=en#Prov.2.1`);
		const buttonsChirho = pageChirho.locator('.verse-chirho .word-speech-chirho');
		await expectChirho(buttonsChirho.nth(2)).toBeEnabled();
		const clipsChirho = JSON.parse(
			(await pageChirho
				.locator('[data-speech-recordings-chirho]')
				.getAttribute('data-speech-recordings-chirho')) ?? '[]'
		) as {
			token_id_chirho: string;
			asset_path_chirho: string;
			duration_chirho: number;
			end_offset_chirho: number;
		}[];
		for (const [indexChirho, rateChirho] of [
			[0, '0.85'],
			[2, '0.85'],
			[4, '0.85'],
			[2, '1'],
			[2, '0.65'],
			[2, '0.88']
		] as const) {
			await pageChirho.locator('[data-speech-rate-chirho]').selectOption(rateChirho);
			const buttonChirho = buttonsChirho.nth(indexChirho);
			const tokenChirho = await buttonChirho.getAttribute('data-speech-token-chirho');
			const clipChirho = clipsChirho.find(
				(itemChirho) => itemChirho.token_id_chirho === tokenChirho
			)!;
			await buttonChirho.click();
			await expectChirho(buttonChirho).toHaveAttribute('aria-busy', 'true');
			await expectChirho(buttonChirho).not.toHaveAttribute('aria-busy', 'true', {
				timeout: 10_000
			});
			const proofChirho = await pageChirho.evaluate(
				() =>
					(
						window as unknown as {
							wordPlaybackProofChirho: {
								pauses_chirho: { source_chirho: string; time_chirho: number }[];
								playing_chirho: string[];
								rates_chirho: number[];
								errors_chirho: string[];
							};
						}
					).wordPlaybackProofChirho
			);
			expectChirho(proofChirho.playing_chirho.at(-1)).toBe(clipChirho.asset_path_chirho);
			expectChirho(proofChirho.rates_chirho.at(-1)).toBe(Number(rateChirho));
			expectChirho(proofChirho.errors_chirho).toEqual([]);
			const pauseChirho = proofChirho.pauses_chirho
				.filter((itemChirho) => itemChirho.source_chirho === clipChirho.asset_path_chirho)
				.at(-1)!;
			expectChirho(pauseChirho.time_chirho).toBeGreaterThanOrEqual(
				clipChirho.duration_chirho - 0.04
			);
		}
		await buttonsChirho.nth(1).click();
		await buttonsChirho.nth(2).click();
		await expectChirho(buttonsChirho.nth(1)).not.toHaveAttribute('aria-busy', 'true');
		await expectChirho(buttonsChirho.nth(2)).not.toHaveAttribute('aria-busy', 'true', {
			timeout: 10_000
		});
	}
);

testChirho(
	'word grammar cues explain their sourced dimensions on hover and focus in both languages',
	async ({ page: pageChirho }) => {
		for (const widthChirho of [1440, 390, 320]) {
			await pageChirho.setViewportSize({ width: widthChirho, height: 1000 });
			for (const localeChirho of ['en', 'es']) {
				for (const passageChirho of ['Gen.1.3', 'John.1.1', 'Prov.26.1']) {
					await pageChirho.goto(
						`${readerOriginChirho}?lang_chirho=${localeChirho}#${passageChirho}`
					);
					const surfaceChirho = pageChirho
						.locator(
							passageChirho.startsWith('Gen')
								? '.verse-chirho .verb-cues-chirho'
								: passageChirho.startsWith('Prov')
									? '.verse-chirho .word-surface-chirho'
									: '.verse-chirho .greek-word-surface-chirho'
						)
						.filter({
							has: pageChirho.locator(
								passageChirho.startsWith('Gen')
									? '.conjugation-marker-chirho'
									: passageChirho.startsWith('Prov')
										? '.state-marker-chirho'
										: '[data-greek-cue-chirho="tense-voice"]'
							)
						})
						.first();
					const triggersChirho = surfaceChirho.locator('button[data-help-trigger-chirho]');
					await expectChirho(triggersChirho.first()).toBeVisible();
					for (const triggerChirho of await triggersChirho.all()) {
						const popupChirho = pageChirho.locator(
							`[id="${await triggerChirho.getAttribute('aria-describedby')}"]`
						);
						await triggerChirho.hover();
						await expectChirho(popupChirho).toBeVisible();
						const boundsChirho = await popupChirho.boundingBox();
						expectChirho(boundsChirho!.x).toBeGreaterThanOrEqual(0);
						expectChirho(boundsChirho!.x + boundsChirho!.width).toBeLessThanOrEqual(widthChirho);
						expectChirho(boundsChirho!.y).toBeGreaterThanOrEqual(0);
						expectChirho(boundsChirho!.y + boundsChirho!.height).toBeLessThanOrEqual(1000);
						await expectChirho(popupChirho.locator('strong')).toHaveAttribute('lang', localeChirho);
						await triggerChirho.focus();
						await triggerChirho.press('Escape');
						await expectChirho(popupChirho).toBeHidden();
					}
					expectChirho(await pageChirho.locator('a button').count()).toBe(0);
					expectChirho(
						await pageChirho.evaluate(
							() => document.documentElement.scrollWidth <= document.documentElement.clientWidth
						)
					).toBe(true);
					await surfaceChirho.locator('[data-word-jump-chirho]').click();
					await expectChirho(
						pageChirho.getByRole('dialog').locator('.word-card-chirho')
					).toHaveCount(1);
				}
			}
		}
	}
);
