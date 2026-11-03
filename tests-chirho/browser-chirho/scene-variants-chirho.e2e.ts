// For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life. — John 3:16 (KJV)
import { isReaderRequestChirho } from '../fixtures-chirho/runtime-chirho';

import { test as testChirho, expect as expectChirho } from '@playwright/test';
import { readerOriginChirho } from '../fixtures-chirho/runtime-chirho';

testChirho(
	'selective image versions preserve Standard, remember a preference and share ordinary scenes',
	async ({ page: pageChirho }) => {
		const requestsChirho: string[] = [];
		pageChirho.on('request', (requestChirho) => requestsChirho.push(requestChirho.url()));
		await pageChirho.goto(`${readerOriginChirho}?lang_chirho=en#John.1.2`);
		const figureChirho = pageChirho.locator('.scene-panel-chirho');
		const chooserChirho = figureChirho.getByRole('combobox');
		await expectChirho(chooserChirho).toHaveValue('standard');
		const standardChirho = await figureChirho.locator('img').getAttribute('src');
		await chooserChirho.selectOption('representation_reduced');
		await expectChirho(figureChirho.locator('img')).not.toHaveAttribute('src', standardChirho!);
		const reducedChirho = await figureChirho.locator('img').getAttribute('src');
		await pageChirho.reload();
		await expectChirho(chooserChirho).toHaveValue('representation_reduced');
		await expectChirho(figureChirho.locator('img')).toHaveAttribute('src', reducedChirho!);
		await pageChirho.evaluate(() => {
			location.hash = 'John.1.3';
		});
		await expectChirho(
			pageChirho.getByRole('heading', { name: 'John 1:3', exact: true })
		).toBeVisible();
		await expectChirho(chooserChirho).toHaveCount(0);
		await expectChirho(figureChirho.locator('img')).toBeVisible();
		await pageChirho.evaluate(() => {
			location.hash = 'John.1.2';
		});
		await expectChirho(chooserChirho).toHaveValue('representation_reduced');
		await chooserChirho.selectOption('standard');
		await expectChirho(figureChirho.locator('img')).toHaveAttribute('src', standardChirho!);
		await pageChirho.evaluate(() => {
			location.hash = 'Prov.26.1';
		});
		await expectChirho(chooserChirho).toHaveCount(0);
		await expectChirho(figureChirho.locator('img')).toBeVisible();
		expectChirho(requestsChirho.every(isReaderRequestChirho)).toBe(true);
	}
);

testChirho(
	'a missing selected variant shows an unavailable message while preserving the words and a working Standard choice',
	async ({ page: pageChirho }) => {
		await pageChirho.goto(`${readerOriginChirho}#John.1.2`);
		const figureChirho = pageChirho.locator('.scene-panel-chirho');
		await pageChirho.route('**/john-reduced-v1-chirho/**', (routeChirho) => routeChirho.abort());
		await figureChirho.getByRole('combobox').selectOption('representation_reduced');
		await expectChirho(figureChirho.locator('[data-scene-missing-chirho]')).toBeVisible();
		await expectChirho(pageChirho.locator('.verse-chirho')).toBeVisible();
		await figureChirho.getByRole('combobox').selectOption('standard');
		await expectChirho(figureChirho.locator('img')).toBeVisible();
		await expectChirho(figureChirho.locator('[data-scene-missing-chirho]')).toBeHidden();
	}
);
