// For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life. — John 3:16 (KJV)

import { test as testChirho, expect as expectChirho } from '@playwright/test';
import { readerOriginChirho } from '../fixtures-chirho/runtime-chirho';

for (const localeChirho of ['en', 'es'])
	for (const passageChirho of ['Prov.26.1', 'John.1.1'])
		testChirho(
			`Word-card round trip preserves passage and focus (${passageChirho}, ${localeChirho})`,
			async ({ page: pageChirho }) => {
				await pageChirho.emulateMedia({ reducedMotion: 'reduce' });
				await pageChirho.setViewportSize({ width: 390, height: 844 });
				await pageChirho.goto(
					`${readerOriginChirho}/?lang_chirho=${localeChirho}#${passageChirho}`,
					{ waitUntil: 'domcontentloaded' }
				);
				await expectChirho(
					pageChirho.getByLabel(localeChirho === 'es' ? 'Capítulo' : 'Chapter', { exact: true })
				).toBeEnabled({ timeout: 20_000 });
				if (passageChirho.startsWith('John'))
					await expectChirho(
						pageChirho.getByRole('heading', {
							name: localeChirho === 'es' ? 'Juan 1:1' : 'John 1:1',
							exact: true
						})
					).toBeVisible();
				const linksChirho = pageChirho.locator(
					'.verse-chirho .word-jump-chirho[data-word-jump-chirho]'
				);
				for (const indexChirho of [0, 1]) {
					const linkChirho = linksChirho.nth(indexChirho);
					const idChirho = await linkChirho.getAttribute('data-word-jump-chirho');
					expectChirho(idChirho).toBeTruthy();
					if (indexChirho === 0) await linkChirho.click();
					else {
						await linkChirho.focus();
						await linkChirho.press('Enter');
					}
					await expectChirho(pageChirho.locator(`[id="${idChirho}"]`)).toBeFocused();
					const inViewChirho = await pageChirho
						.locator(`[id="${idChirho}"]`)
						.evaluate((elementChirho) => {
							const rectChirho = elementChirho.getBoundingClientRect();
							return rectChirho.bottom > 0 && rectChirho.top < innerHeight;
						});
					expectChirho(inViewChirho).toBe(true);
					expectChirho(pageChirho.url()).toContain(`#${passageChirho}`);
					await expectChirho(
						pageChirho.locator(`[id="${idChirho}"] .word-details-chirho`)
					).toHaveAttribute('open', '');
					await expectChirho(
						pageChirho.locator(`[id="${idChirho}"] .word-gloss-chirho:visible`).first()
					).toBeVisible();
					const returnChirho = pageChirho.locator(`[id="${idChirho}"]`).getByRole('link', {
						name: localeChirho === 'es' ? 'Volver al versículo' : 'Back to verse'
					});
					await expectChirho(returnChirho).toBeInViewport();
					if (indexChirho === 0) await returnChirho.click();
					else {
						await returnChirho.focus();
						await returnChirho.press('Enter');
					}
					await expectChirho(linkChirho).toBeFocused();
					await expectChirho(linkChirho).toBeInViewport();
					expectChirho(pageChirho.url()).toContain(`#${passageChirho}`);
				}
			}
		);
