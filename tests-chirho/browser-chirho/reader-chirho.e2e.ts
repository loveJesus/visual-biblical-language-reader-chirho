// For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life. — John 3:16 (KJV)

import { test as testChirho, expect as expectChirho } from '@playwright/test';
import { readerOriginChirho } from '../fixtures-chirho/runtime-chirho';
import { execFileSync as execFileSyncChirho } from 'node:child_process';
import {
	mkdtempSync as mkdtempSyncChirho,
	readFileSync as readFileSyncChirho,
	rmSync as rmSyncChirho
} from 'node:fs';
import { tmpdir as tmpdirChirho } from 'node:os';
import { join as joinChirho } from 'node:path';
import { pathToFileURL as pathToFileURLChirho } from 'node:url';
import { legendRowsChirho } from '../../src/lib/domain-chirho/legend-chirho';
import fixtureChirho from '../../data-chirho/lessons-chirho/proverbs-26-1-chirho.json' with { type: 'json' };
import glossFixtureChirho from '../../data-chirho/glosses-chirho/proverbs-26-1-glosses-chirho.json' with { type: 'json' };

testChirho(
	'source-faithful reader keeps translation optional, opens word details and supports grammar help',
	async ({ page: pageChirho }) => {
		const failuresChirho: string[] = [];
		pageChirho.on('pageerror', (errorChirho) => failuresChirho.push(errorChirho.message));
		await pageChirho.goto(`${readerOriginChirho}#Prov.26.1`);
		await expectChirho(pageChirho.locator('.word-unit-chirho')).toHaveCount(9);
		await expectChirho(pageChirho.locator('.state-marker-chirho')).toHaveCount(5);
		await expectChirho(pageChirho.locator('.sticker-chirho')).toHaveCount(9);
		await expectChirho(pageChirho.locator('.legend-row-chirho')).toHaveCount(7);
		await expectChirho(
			pageChirho.locator('.grammar-section-chirho [data-help-trigger-chirho]')
		).toHaveCount(legendRowsChirho.flatMap((rowChirho) => rowChirho.items_chirho).length);
		const reconstructedChirho = await pageChirho
			.locator('.verse-chirho')
			.evaluate((elementChirho) => {
				const cloneChirho = elementChirho.cloneNode(true) as HTMLElement;
				cloneChirho
					.querySelectorAll('[data-annotation-chirho]')
					.forEach((annotationChirho) => annotationChirho.remove());
				return cloneChirho.textContent;
			});
		expectChirho(reconstructedChirho).toBe(fixtureChirho.canonical_text_chirho);
		await expectChirho(
			pageChirho.locator('.translation-chirho > [data-gloss-language-chirho="app"]')
		).toBeHidden();
		await expectChirho(pageChirho.locator('.word-gloss-chirho').first()).toBeVisible();
		for (let iterationChirho = 0; iterationChirho < 2; iterationChirho++) {
			await pageChirho.locator('.translation-chirho summary').click();
			await expectChirho(
				pageChirho.locator('.translation-chirho > [data-gloss-language-chirho="app"]')
			).toBeVisible();
			await pageChirho.locator('.translation-chirho summary').click();
			await expectChirho(
				pageChirho.locator('.translation-chirho > [data-gloss-language-chirho="app"]')
			).toBeHidden();
		}
		const niphalChirho = pageChirho.getByRole('button', { name: '2 Niphal', exact: true });
		await niphalChirho.focus();
		await expectChirho(niphalChirho).toHaveAttribute('aria-expanded', 'true');
		await pageChirho.keyboard.press('Enter');
		await expectChirho(niphalChirho).toHaveAttribute('aria-expanded', 'true');
		await pageChirho.keyboard.press('Escape');
		await expectChirho(niphalChirho).toHaveAttribute('aria-expanded', 'false');
		await pageChirho.locator('.translation-chirho summary').focus();
		await pageChirho.mouse.move(0, 0);
		await niphalChirho.hover();
		await expectChirho(niphalChirho).toHaveAttribute('aria-expanded', 'true');
		await pageChirho.locator('#niphal-chirho-help-chirho').hover();
		await pageChirho.waitForTimeout(200);
		await expectChirho(pageChirho.locator('#niphal-chirho-help-chirho')).toBeVisible();
		await pageChirho.mouse.move(0, 0);
		await expectChirho(niphalChirho).toHaveAttribute('aria-expanded', 'false');
		await niphalChirho.click();
		await expectChirho(niphalChirho).toHaveAttribute('aria-expanded', 'true');
		await niphalChirho.click();
		await expectChirho(niphalChirho).toHaveAttribute('aria-expanded', 'false');
		await pageChirho.getByRole('button', { name: 'I yiqtol', exact: true }).focus();
		await pageChirho.keyboard.press('Tab');
		await expectChirho(
			pageChirho.getByRole('button', { name: 'M imperative', exact: true })
		).toBeFocused();
		expectChirho(
			await pageChirho
				.locator('.scene-panel-chirho img')
				.evaluate((imageChirho: HTMLImageElement) => imageChirho.naturalWidth)
		).toBeGreaterThan(0);
		expectChirho(failuresChirho).toEqual([]);
	}
);

for (const widthChirho of [1440, 390, 320]) {
	testChirho(
		`no page or card overflow at ${widthChirho}px; visual capture`,
		async ({ page: pageChirho }) => {
			await pageChirho.setViewportSize({ width: widthChirho, height: 1000 });
			await pageChirho.goto(`${readerOriginChirho}#Prov.26.1`);
			const geometryChirho = await pageChirho.evaluate(() => ({
				overflow_chirho:
					document.documentElement.scrollWidth > document.documentElement.clientWidth,
				cards_overflow_chirho: [
					...document.querySelectorAll<HTMLElement>('.word-card-chirho')
				].some((elementChirho) => elementChirho.scrollWidth > elementChirho.clientWidth),
				verse_chirho: document
					.querySelector('.verse-panel-chirho')!
					.getBoundingClientRect()
					.toJSON(),
				scene_chirho: document
					.querySelector('.scene-panel-chirho')!
					.getBoundingClientRect()
					.toJSON()
			}));
			expectChirho(geometryChirho.overflow_chirho).toBe(false);
			expectChirho(geometryChirho.cards_overflow_chirho).toBe(false);
			if (widthChirho > 640)
				expectChirho(geometryChirho.verse_chirho.x).toBeLessThan(geometryChirho.scene_chirho.x);
			else
				expectChirho(geometryChirho.verse_chirho.bottom).toBeLessThanOrEqual(
					geometryChirho.scene_chirho.y + 1
				);
			await pageChirho.screenshot({
				path: `test-results/previews-chirho/reader-${widthChirho}-chirho.png`,
				fullPage: true
			});
		}
	);
}

testChirho(
	'unknown lesson and traversal requests never return a fabricated lesson or local secret',
	async ({ request: requestChirho }) => {
		for (const pathChirho of [
			'/api-chirho/lessons-chirho/Unknown.1.1',
			'/.env',
			'/data-chirho/lessons-chirho/proverbs-26-1-chirho.json'
		]) {
			const responseChirho = await requestChirho.get(`${readerOriginChirho}${pathChirho}`);
			expectChirho(responseChirho.status()).toBe(404);
			expectChirho(await responseChirho.text()).not.toContain('OPENAI_API_KEY');
		}
	}
);

testChirho(
	'touch help stays inside a narrow viewport and toggles without a focus trap',
	async ({ browser: browserChirho }) => {
		const contextChirho = await browserChirho.newContext({
			hasTouch: true,
			isMobile: true,
			viewport: { width: 320, height: 640 }
		});
		const pageChirho = await contextChirho.newPage();
		try {
			await pageChirho.goto(`${readerOriginChirho}#Prov.26.1`);
			// Passage restoration and font layout must finish before measuring a touch popup.
			await expectChirho(pageChirho.locator('[data-speech-pending-chirho]')).toHaveAttribute(
				'data-speech-pending-chirho',
				'false'
			);
			await pageChirho.evaluate(() => document.fonts.ready.then(() => undefined));
			const triggerChirho = pageChirho.getByRole('button', {
				name: 'Dotted · predictable weak',
				exact: true
			});
			await triggerChirho.tap();
			await expectChirho(triggerChirho).toHaveAttribute('aria-expanded', 'true');
			const boxChirho = await pageChirho.locator('#weak-chirho-help-chirho').boundingBox();
			expectChirho(boxChirho!.x).toBeGreaterThanOrEqual(0);
			expectChirho(boxChirho!.x + boxChirho!.width).toBeLessThanOrEqual(320);
			await triggerChirho.tap();
			await expectChirho(triggerChirho).toHaveAttribute('aria-expanded', 'false');
		} finally {
			await contextChirho.close();
		}
	}
);

testChirho(
	'standalone export works without network and refuses to overwrite an existing snapshot',
	async ({ page: pageChirho, context: contextChirho }) => {
		const directoryChirho = mkdtempSyncChirho(joinChirho(tmpdirChirho(), 'hinneh-export-chirho-'));
		const outputChirho = joinChirho(directoryChirho, 'snapshot-chirho.html');
		try {
			execFileSyncChirho('bun', [
				'scripts-chirho/export-chirho/offline_chirho.ts',
				outputChirho,
				readerOriginChirho
			]);
			const originalChirho = readFileSyncChirho(outputChirho);
			expectChirho(() =>
				execFileSyncChirho(
					'bun',
					['scripts-chirho/export-chirho/offline_chirho.ts', outputChirho, readerOriginChirho],
					{ stdio: 'pipe' }
				)
			).toThrow();
			expectChirho(readFileSyncChirho(outputChirho)).toEqual(originalChirho);
			const errorsChirho: string[] = [];
			const networkChirho: string[] = [];
			pageChirho.on('pageerror', (errorChirho) => errorsChirho.push(errorChirho.message));
			pageChirho.on('request', (requestChirho) => {
				if (/^https?:/.test(requestChirho.url())) networkChirho.push(requestChirho.url());
			});
			await contextChirho.setOffline(true);
			await pageChirho.goto(pathToFileURLChirho(outputChirho).href);
			await expectChirho(pageChirho.locator('.word-unit-chirho')).toHaveCount(9);
			await pageChirho.getByRole('checkbox', { name: 'Show IPA', exact: true }).check();
			await expectChirho(
				pageChirho.locator('.verse-chirho [data-word-ipa-chirho]').filter({ hasText: '/naˈve/' })
			).toBeVisible();
			const wordLinkChirho = pageChirho.locator('[data-word-jump-chirho]').first();
			const wordCardIdChirho = await wordLinkChirho.getAttribute('data-word-jump-chirho');
			await wordLinkChirho.click();
			await expectChirho(pageChirho.locator(`[id="${wordCardIdChirho}"]`)).toBeFocused();
			await expectChirho(
				pageChirho.locator('.translation-chirho > [data-gloss-language-chirho="app"]')
			).toBeHidden();
			await pageChirho.locator('.translation-chirho summary').click();
			await expectChirho(
				pageChirho.locator('.translation-chirho > [data-gloss-language-chirho="app"]')
			).toBeVisible();
			await pageChirho.getByRole('button', { name: '2 Niphal', exact: true }).click();
			await expectChirho(
				pageChirho.getByRole('button', { name: '2 Niphal', exact: true })
			).toHaveAttribute('aria-expanded', 'true');
			expectChirho(
				await pageChirho
					.locator('.scene-panel-chirho img')
					.evaluate((imageChirho: HTMLImageElement) => imageChirho.naturalWidth)
			).toBeGreaterThan(0);
			expectChirho(networkChirho).toEqual([]);
			expectChirho(errorsChirho).toEqual([]);
		} finally {
			rmSyncChirho(directoryChirho, { recursive: true, force: true });
		}
	}
);

testChirho(
	'reviewed language changes preserve expanded word meanings and explicit provenance',
	async ({ page: pageChirho }) => {
		await pageChirho.goto(`${readerOriginChirho}#Prov.26.1`);
		const selectionChirho = pageChirho.getByLabel('Meaning language');
		for (const languageChirho of glossFixtureChirho.languages_chirho) {
			await selectionChirho.selectOption(languageChirho.id_chirho);
			await expectChirho(pageChirho.locator('.word-details-chirho[open]')).toHaveCount(9);
			await expectChirho(pageChirho.locator('.translation-chirho[open]')).toHaveCount(0);
			const groupChirho = pageChirho
				.locator('.word-card-chirho')
				.first()
				.locator(`[data-gloss-language-chirho="${languageChirho.id_chirho}"]`);
			await expectChirho(groupChirho).toBeVisible();
			await expectChirho(groupChirho.locator('.word-gloss-chirho')).toHaveText(
				languageChirho.words_chirho[0].gloss_chirho
			);
			await expectChirho(groupChirho).toContainText('Approved in Global Bible Tools export');
			await expectChirho(groupChirho.locator('.word-gloss-chirho')).toHaveAttribute(
				'dir',
				languageChirho.direction_chirho
			);
			await pageChirho.locator('.word-details-chirho summary').first().click();
			await expectChirho(groupChirho).toBeHidden();
			await pageChirho.locator('.word-details-chirho summary').first().click();
		}
	}
);

testChirho(
	'missing scene preserves the reader and explains the unavailable illustration',
	async ({ page: pageChirho }) => {
		await pageChirho.route('**/assets-chirho/proverbs-26-1-scene-chirho.webp', (routeChirho) =>
			routeChirho.abort()
		);
		await pageChirho.goto(`${readerOriginChirho}#Prov.26.1`);
		await expectChirho(pageChirho.locator('[data-scene-missing-chirho]')).toBeVisible();
		await expectChirho(pageChirho.locator('.word-unit-chirho')).toHaveCount(9);
		await pageChirho.getByLabel('Chapter', { exact: true }).selectOption('16');
		await pageChirho.getByLabel('Verse', { exact: true }).selectOption('24');
		await expectChirho(pageChirho.locator('[data-scene-chirho]')).toBeVisible();
		await expectChirho(pageChirho.locator('[data-scene-missing-chirho]')).toBeHidden();
	}
);

testChirho(
	'help remains hoverable across the gap, keeps popup clicks, and expires after leave plus scroll',
	async ({ page: pageChirho }) => {
		await pageChirho.goto(`${readerOriginChirho}#Prov.26.1`);
		const triggerChirho = pageChirho.getByRole('button', { name: '1 Qal', exact: true });
		await triggerChirho.evaluate((elementChirho) =>
			elementChirho.scrollIntoView({ block: 'center' })
		);
		await triggerChirho.hover();
		const boxChirho = await triggerChirho.boundingBox();
		await pageChirho.mouse.move(
			boxChirho!.x + boxChirho!.width / 2,
			boxChirho!.y + boxChirho!.height + 4
		);
		await pageChirho.waitForTimeout(300);
		await expectChirho(triggerChirho).toHaveAttribute('aria-expanded', 'true');
		await triggerChirho.click();
		await pageChirho.locator('#qal-chirho-help-chirho').click();
		await expectChirho(triggerChirho).toHaveAttribute('aria-expanded', 'true');
		await pageChirho.keyboard.press('Escape');
		await pageChirho.locator('.translation-chirho summary').focus();
		await pageChirho.mouse.move(0, 0);
		await triggerChirho.hover();
		await pageChirho.mouse.move(0, 0);
		await pageChirho.evaluate(() => window.scrollBy(0, 10));
		await expectChirho(triggerChirho).toHaveAttribute('aria-expanded', 'false');
	}
);

testChirho(
	'200 percent zoom equivalent at 1440 physical pixels preserves a readable layout',
	async ({ browser: browserChirho }) => {
		const contextChirho = await browserChirho.newContext({
			viewport: { width: 720, height: 500 },
			deviceScaleFactor: 2
		});
		const pageChirho = await contextChirho.newPage();
		try {
			await pageChirho.goto(`${readerOriginChirho}#Prov.26.1`);
			expectChirho(
				await pageChirho.evaluate(
					() => document.documentElement.scrollWidth <= document.documentElement.clientWidth
				)
			).toBe(true);
			await pageChirho.screenshot({
				path: 'test-results/previews-chirho/zoom-equivalent-chirho.png',
				fullPage: false
			});
		} finally {
			await contextChirho.close();
		}
	}
);
