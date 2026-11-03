// For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life. — John 3:16 (KJV)
import { isReaderRequestChirho } from '../fixtures-chirho/runtime-chirho';

import { readFileSync as readFileSyncChirho } from 'node:fs';
import {
	test as testChirho,
	expect as expectChirho,
	type Page as PageChirho
} from '@playwright/test';
import { readerOriginChirho } from '../fixtures-chirho/runtime-chirho';

function passageChirho(folderChirho: string, chapterChirho: number, verseChirho: number) {
	return JSON.parse(
		readFileSyncChirho(
			`static/content-chirho/${folderChirho}-chirho/chapter-${String(chapterChirho).padStart(2, '0')}-chirho.json`,
			'utf8'
		)
	).verses_chirho[verseChirho - 1];
}
async function wordChirho(
	pageChirho: PageChirho,
	lessonChirho: {
		id_chirho: string;
		reference_chirho: string;
		tokens_chirho: { id_chirho: string; lemma_id_chirho: string }[];
	},
	lemmaChirho: string
) {
	await pageChirho.goto(`${readerOriginChirho}#${lessonChirho.id_chirho}`);
	await expectChirho(
		pageChirho.getByRole('heading', { name: lessonChirho.reference_chirho, exact: true })
	).toBeVisible();
	const tokenChirho = lessonChirho.tokens_chirho.find(
		(rowChirho) => rowChirho.lemma_id_chirho === lemmaChirho
	)!;
	return {
		tokenChirho,
		unitChirho: pageChirho.locator('.verse-chirho .word-unit-chirho').filter({
			has: pageChirho.locator(`[data-word-jump-chirho="word-card-${tokenChirho.id_chirho}-chirho"]`)
		})
	};
}
testChirho(
	'musar gets a general picture outside reviewed contexts while contextual choices retain priority',
	async ({ page: pageChirho }) => {
		await pageChirho.setViewportSize({ width: 390, height: 844 });
		await pageChirho.emulateMedia({ reducedMotion: 'reduce' });
		const firstChirho = await wordChirho(pageChirho, passageChirho('proverbs', 1, 3), 'H4148');
		const originalPathChirho = await firstChirho.unitChirho
			.locator('[data-icon-chirho]')
			.getAttribute('src');
		await expectChirho(firstChirho.unitChirho.locator('[data-lemma-picture-chirho]')).toHaveCount(
			0
		);
		const generalChirho = await wordChirho(pageChirho, passageChirho('proverbs', 13, 18), 'H4148');
		await expectChirho(
			generalChirho.unitChirho.locator('[data-lemma-picture-chirho]')
		).toHaveAttribute('src', originalPathChirho!);
		await expectChirho(generalChirho.unitChirho.locator('.double-border-chirho')).toHaveCount(0);
		await generalChirho.unitChirho.locator('[data-word-jump-chirho]').click();
		const cardChirho = pageChirho.locator(
			`[id="word-card-${generalChirho.tokenChirho.id_chirho}-chirho"]`
		);
		await expectChirho(cardChirho).toBeFocused();
		await expectChirho(cardChirho.locator('.lemma-picture-note-chirho')).toBeVisible();
		await expectChirho(cardChirho.locator('.word-details-chirho')).toHaveAttribute('open', '');
	}
);

testChirho(
	'Hebrew and Greek use chapter lemma pictures without extra service requests',
	async ({ page: pageChirho }) => {
		await pageChirho.setViewportSize({ width: 390, height: 844 });
		const requestsChirho: string[] = [];
		const errorsChirho: string[] = [];
		pageChirho.on('request', (requestChirho) => requestsChirho.push(requestChirho.url()));
		pageChirho.on('pageerror', (errorChirho) => errorsChirho.push(errorChirho.message));
		for (const [folderChirho, chapterChirho, verseChirho, lemmaChirho] of [
			['genesis', 1, 1, 'H776'],
			['john', 10, 34, 'G2316']
		] as const) {
			const chosenChirho = await wordChirho(
				pageChirho,
				passageChirho(folderChirho, chapterChirho, verseChirho),
				lemmaChirho
			);
			const imageChirho = chosenChirho.unitChirho.locator('[data-lemma-picture-chirho]');
			await expectChirho(imageChirho).toBeVisible();
			await expectChirho
				.poll(() =>
					imageChirho.evaluate(
						(elementChirho: HTMLImageElement) =>
							elementChirho.complete && elementChirho.naturalWidth === 128
					)
				)
				.toBe(true);
			await expectChirho(chosenChirho.unitChirho.locator('.icon-help-chirho')).toHaveCount(0);
			expectChirho(
				await pageChirho.evaluate(() => document.documentElement.scrollWidth <= innerWidth)
			).toBe(true);
		}
		expectChirho(errorsChirho).toEqual([]);
		expectChirho(
			requestsChirho.filter(
				(urlChirho) => !isReaderRequestChirho(urlChirho) || urlChirho.includes('/api-chirho/')
			)
		).toEqual([]);
	}
);
