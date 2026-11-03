// For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life. — John 3:16 (KJV)
import { readerArtworkUrlChirho } from '../fixtures-chirho/runtime-chirho';

import { readFileSync as readFileSyncChirho } from 'node:fs';
import { readerOriginChirho } from '../fixtures-chirho/runtime-chirho';
import {
	test as testChirho,
	expect as expectChirho,
	type Page as PageChirho
} from '@playwright/test';
import manifestChirho from '../../static/content-chirho/proverbs-chirho/manifest-chirho.json' with { type: 'json' };
import iconsChirho from '../../data-chirho/media-chirho/proverbs-26-1-icons-chirho.json' with { type: 'json' };

type VerseChirho = {
	reference_chirho: string;
	canonical_text_chirho: string;
	tokens_chirho: { verb_form_chirho?: string; verb_construction_chirho?: string }[];
};
function chapterChirho(numberChirho: number): VerseChirho[] {
	const pathChirho = manifestChirho.chapters_chirho[numberChirho - 1].path_chirho;
	return JSON.parse(readFileSyncChirho(`static${pathChirho}`, 'utf8'))
		.verses_chirho as VerseChirho[];
}
async function assertVerseChirho(pageChirho: PageChirho, verseChirho: VerseChirho) {
	await expectChirho(
		pageChirho.getByRole('heading', { name: verseChirho.reference_chirho, exact: true })
	).toBeVisible();
	await expectChirho
		.poll(() =>
			pageChirho.locator('.verse-chirho').evaluate((elementChirho) => {
				const cloneChirho = elementChirho.cloneNode(true) as HTMLElement;
				cloneChirho
					.querySelectorAll('[data-annotation-chirho]')
					.forEach((annotationChirho) => annotationChirho.remove());
				return cloneChirho.textContent;
			})
		)
		.toBe(verseChirho.canonical_text_chirho);
}

testChirho(
	'visitor passage choices reveal the loaded reading card while the fresh home stays at the top',
	async ({ page: pageChirho }) => {
		await pageChirho.emulateMedia({ reducedMotion: 'reduce' });
		await pageChirho.goto('/?lang_chirho=en');
		await expectChirho(pageChirho.locator('[data-speech-pending-chirho]')).toHaveAttribute(
			'data-speech-pending-chirho',
			'false'
		);
		expectChirho(await pageChirho.evaluate(() => scrollY)).toBe(0);
		await expectChirho(pageChirho.locator('[data-online-intro-chirho]')).toBeVisible();
		for (const widthChirho of [390, 1440]) {
			await pageChirho.setViewportSize({ width: widthChirho, height: 900 });
			await pageChirho.getByLabel('Book', { exact: true }).selectOption('John');
			await expectChirho(
				pageChirho.getByRole('heading', { name: 'John 1:1', exact: true })
			).toBeVisible();
			await expectChirho
				.poll(async () => (await pageChirho.locator('.lesson-heading-chirho').boundingBox())?.y)
				.toBeLessThan(96);
			await pageChirho.getByLabel('Chapter', { exact: true }).selectOption('3');
			await expectChirho(
				pageChirho.getByRole('heading', { name: 'John 3:1', exact: true })
			).toBeVisible();
			await expectChirho
				.poll(async () => (await pageChirho.locator('.lesson-heading-chirho').boundingBox())?.y)
				.toBeLessThan(96);
			await pageChirho.getByLabel('Verse', { exact: true }).selectOption('16');
			await expectChirho(
				pageChirho.getByRole('heading', { name: 'John 3:16', exact: true })
			).toBeVisible();
			await expectChirho
				.poll(async () => (await pageChirho.locator('.lesson-heading-chirho').boundingBox())?.y)
				.toBeLessThan(96);
			await pageChirho.getByLabel('Book', { exact: true }).selectOption('Prov');
			await expectChirho(
				pageChirho.getByRole('heading', { name: 'Proverbs 1:1', exact: true })
			).toBeVisible();
			await expectChirho
				.poll(async () => (await pageChirho.locator('.lesson-heading-chirho').boundingBox())?.y)
				.toBeLessThan(96);
		}
	}
);

testChirho(
	'navigates chapter boundaries and preserves a real sequential verb verse',
	async ({ page: pageChirho }) => {
		await pageChirho.goto(`${readerOriginChirho}#Prov.26.1`);
		const chaptersChirho = pageChirho.getByLabel('Chapter');
		const versesChirho = pageChirho.getByLabel('Verse', { exact: true });
		await expectChirho(chaptersChirho).toBeEnabled();
		await pageChirho.locator('.translation-chirho summary').click();
		await chaptersChirho.selectOption('1');
		await assertVerseChirho(pageChirho, chapterChirho(1)[0]);
		await expectChirho(pageChirho.locator('.translation-chirho[open]')).toHaveCount(0);
		await expectChirho(pageChirho.locator('.word-details-chirho[open]')).toHaveCount(
			chapterChirho(1)[0].tokens_chirho.length
		);
		const verseNumberChirho =
			chapterChirho(1).findIndex((verseChirho) =>
				verseChirho.tokens_chirho.some(
					(tokenChirho) =>
						tokenChirho.verb_form_chirho === 'wayyiqtol' ||
						tokenChirho.verb_form_chirho === 'weqatal'
				)
			) + 1;
		expectChirho(verseNumberChirho).toBeGreaterThan(0);
		await versesChirho.selectOption(String(verseNumberChirho));
		await assertVerseChirho(pageChirho, chapterChirho(1)[verseNumberChirho - 1]);
		const verbNamesChirho = chapterChirho(1)
			[verseNumberChirho - 1].tokens_chirho.map((tokenChirho) => tokenChirho.verb_form_chirho)
			.filter((formChirho) => formChirho === 'wayyiqtol' || formChirho === 'weqatal');
		for (const formChirho of verbNamesChirho)
			await expectChirho(
				pageChirho
					.locator('.conjugation-marker-chirho button')
					.filter({ hasText: formChirho === 'wayyiqtol' ? /^Y/ : /^W/ })
					.first()
			).toBeVisible();
		const lastChirho = manifestChirho.chapters_chirho[0].verse_count_chirho;
		await versesChirho.selectOption(String(lastChirho));
		await assertVerseChirho(pageChirho, chapterChirho(1)[lastChirho - 1]);
		await pageChirho.getByRole('button', { name: /next verse/i }).click();
		await assertVerseChirho(pageChirho, chapterChirho(2)[0]);
		await pageChirho.getByRole('button', { name: /previous verse/i }).click();
		await assertVerseChirho(pageChirho, chapterChirho(1)[lastChirho - 1]);
	}
);

testChirho(
	'rejects corrupt data, retries, and ignores an older slow selection',
	async ({ page: pageChirho }) => {
		let corruptChirho = true;
		let releaseChirho: () => void = () => {};
		let startedChirho: () => void = () => {};
		const slowStartedChirho = new Promise<void>((resolveChirho) => {
			startedChirho = resolveChirho;
		});
		const slowReleaseChirho = new Promise<void>((resolveChirho) => {
			releaseChirho = resolveChirho;
		});
		await pageChirho.route(
			'**/content-chirho/proverbs-chirho/chapter-01-chirho.json',
			async (routeChirho) => {
				if (corruptChirho) {
					corruptChirho = false;
					await routeChirho.fulfill({ status: 200, contentType: 'application/json', body: '{}' });
				} else await routeChirho.continue();
			}
		);
		await pageChirho.route(
			'**/content-chirho/proverbs-chirho/chapter-02-chirho.json',
			async (routeChirho) => {
				startedChirho();
				await slowReleaseChirho;
				await routeChirho.continue();
			}
		);
		await pageChirho.goto(`${readerOriginChirho}#Prov.26.1`);
		const chaptersChirho = pageChirho.getByLabel('Chapter');
		await expectChirho(chaptersChirho).toBeEnabled();
		const initialChirho = await pageChirho.locator('.canonical-chirho').textContent();
		await chaptersChirho.selectOption('1');
		await expectChirho(pageChirho.getByRole('button', { name: 'Retry' })).toBeVisible();
		await expectChirho(pageChirho.locator('.canonical-chirho')).toHaveText(initialChirho ?? '');
		await pageChirho.getByRole('button', { name: 'Retry' }).click();
		await assertVerseChirho(pageChirho, chapterChirho(1)[0]);
		await chaptersChirho.selectOption('2');
		await slowStartedChirho;
		await chaptersChirho.selectOption('3');
		await assertVerseChirho(pageChirho, chapterChirho(3)[0]);
		const slowResponseChirho = pageChirho.waitForResponse((responseChirho) =>
			responseChirho.url().endsWith('chapter-02-chirho.json')
		);
		releaseChirho();
		await slowResponseChirho;
		await assertVerseChirho(pageChirho, chapterChirho(3)[0]);
	}
);

testChirho(
	'selected illustrations load while same-sense drawing variants keep a single border',
	async ({ page: pageChirho }) => {
		await pageChirho.goto(`${readerOriginChirho}#Prov.26.1`);
		const selectedChirho = iconsChirho.icons_chirho.filter(
			(iconChirho) => iconChirho.selected_chirho
		);
		const shownChirho = pageChirho.locator('[data-icon-chirho]');
		await expectChirho(shownChirho).toHaveCount(selectedChirho.length);
		for (const iconChirho of selectedChirho) {
			const imageChirho = pageChirho.locator(
				`[data-icon-chirho][src="${readerArtworkUrlChirho(iconChirho.asset_path_chirho)}"]`
			);
			await expectChirho(imageChirho).toBeVisible();
			await expectChirho
				.poll(() =>
					imageChirho.evaluate(
						(elementChirho: HTMLImageElement) =>
							elementChirho.complete &&
							elementChirho.naturalWidth === 128 &&
							elementChirho.naturalHeight === 128
					)
				)
				.toBe(true);
		}
		await expectChirho(pageChirho.locator('.verse-chirho .icon-help-chirho')).toHaveCount(0);
		await expectChirho(pageChirho.locator('.verse-chirho .double-border-chirho')).toHaveCount(0);
	}
);

testChirho(
	'shows reviewed contextual icons in other Proverbs verses',
	async ({ page: pageChirho }) => {
		await pageChirho.goto(`${readerOriginChirho}#Prov.26.1`);
		await pageChirho.getByLabel('Chapter', { exact: true }).selectOption('2');
		await pageChirho.getByLabel('Verse', { exact: true }).selectOption('2');
		await expectChirho(
			pageChirho.getByRole('heading', { name: 'Proverbs 2:2', exact: true })
		).toBeVisible();
		const imagesChirho = pageChirho.locator('.verse-chirho [data-icon-chirho]');
		await expectChirho.poll(() => imagesChirho.count()).toBeGreaterThanOrEqual(2);
		await pageChirho.reload();
		await expectChirho(
			pageChirho.getByRole('heading', { name: 'Proverbs 2:2', exact: true })
		).toBeVisible();
		await expectChirho.poll(() => imagesChirho.count()).toBeGreaterThanOrEqual(2);
		await expectChirho
			.poll(() =>
				imagesChirho.evaluateAll((elementsChirho) =>
					elementsChirho.every(
						(imageChirho) =>
							(imageChirho as HTMLImageElement).complete &&
							(imageChirho as HTMLImageElement).naturalWidth === 128
					)
				)
			)
			.toBe(true);
	}
);
