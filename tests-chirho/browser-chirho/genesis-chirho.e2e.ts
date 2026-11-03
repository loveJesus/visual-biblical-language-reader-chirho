// For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life. — John 3:16 (KJV)

import { readFileSync as readFileSyncChirho } from 'node:fs';
import { test as testChirho, expect as expectChirho } from '@playwright/test';
import { readerOriginChirho } from '../fixtures-chirho/runtime-chirho';

testChirho(
	'opens Genesis with its source text and distinct English verse reference',
	async ({ page: pageChirho }) => {
		await pageChirho.goto(`${readerOriginChirho}/#Gen.32.1`);
		await expectChirho(
			pageChirho.getByRole('heading', { name: 'Genesis 32:1', exact: true })
		).toBeVisible();
		await expectChirho(
			pageChirho.getByLabel('Chapter', { exact: true }).locator('option')
		).toHaveCount(50);
		await expectChirho(pageChirho.locator('.lesson-heading-chirho')).toContainText('Genesis 31:55');
		const expectedChirho = JSON.parse(
			readFileSyncChirho('static/content-chirho/genesis-chirho/chapter-32-chirho.json', 'utf8')
		).verses_chirho[0].canonical_text_chirho;
		const textChirho = await pageChirho.locator('.verse-chirho').evaluate((elementChirho) => {
			const cloneChirho = elementChirho.cloneNode(true) as HTMLElement;
			cloneChirho
				.querySelectorAll('[data-annotation-chirho]')
				.forEach((itemChirho) => itemChirho.remove());
			return cloneChirho.textContent;
		});
		expectChirho(textChirho).toBe(expectedChirho);
		await pageChirho.reload();
		await expectChirho(
			pageChirho.getByRole('heading', { name: 'Genesis 32:1', exact: true })
		).toBeVisible();
	}
);
