// For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life. — John 3:16 (KJV)
import { test, expect } from '@playwright/test';

test('whole-canon deep links load only their chapter, including Psalms above 99', async ({
	page: pageChirho
}) => {
	const chaptersChirho: string[] = [];
	pageChirho.on('request', (requestChirho) => {
		const pathChirho = new URL(requestChirho.url()).pathname;
		if (pathChirho.startsWith('/content-chirho/') && pathChirho.includes('/chapter-'))
			chaptersChirho.push(pathChirho);
	});
	await pageChirho.goto('/#Ps.119.176');
	await expect(pageChirho.getByRole('heading', { level: 1 })).toHaveText('Psalms 119:176');
	await expect(
		pageChirho.getByRole('combobox', { name: 'Book', exact: true }).locator('option')
	).toHaveCount(66);
	expect(chaptersChirho).toEqual(['/content-chirho/psalms-chirho/chapter-119-chirho.json']);
	await expect(pageChirho.locator('[data-source-word-chirho]').first()).toBeVisible();
	await expect(pageChirho.locator('.word-unit-chirho img').first()).toBeVisible();
	await pageChirho.goto('/#Rev.22.21');
	await expect(pageChirho.getByRole('heading', { level: 1 })).toHaveText('Revelation 22:21');
	await expect(pageChirho.locator('[data-source-word-chirho]').first()).toBeVisible();
});

test('Greek navigation skips a verse absent from the source instead of shifting its numbering', async ({
	page: pageChirho
}) => {
	await pageChirho.goto('/#Mark.7.15');
	await expect(pageChirho.getByRole('heading', { level: 1 })).toHaveText('Mark 7:15');
	await pageChirho.getByRole('button', { name: 'Next verse', exact: true }).click();
	await expect(pageChirho.getByRole('heading', { level: 1 })).toHaveText('Mark 7:17');
	await expect(
		pageChirho.getByRole('combobox', { name: 'Verse', exact: true }).locator('option[value="16"]')
	).toHaveCount(0);
});

test('Spanish whole-canon navigation fits phones and keeps Aramaic pronunciation explicit', async ({
	page: pageChirho
}) => {
	await pageChirho.setViewportSize({ width: 390, height: 844 });
	await pageChirho.goto('/?lang_chirho=es#Ezra.4.8');
	await expect(pageChirho.getByRole('heading', { level: 1 })).toHaveText('Esdras 4:8');
	await expect(pageChirho.getByText('Se está preparando la pronunciación aramea.')).toBeVisible();
	await expect(
		pageChirho.locator('button[data-speech-unavailable-chirho="true"]').first()
	).toBeDisabled();
	expect(
		await pageChirho.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)
	).toBe(true);
	await pageChirho.getByRole('combobox', { name: 'Libro', exact: true }).selectOption('2Thess');
	await expect(pageChirho.getByRole('heading', { level: 1 })).toHaveText('2 Tesalonicenses 1:1');
	expect(
		await pageChirho.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)
	).toBe(true);
});
