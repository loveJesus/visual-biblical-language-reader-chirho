// For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life. — John 3:16 (KJV)
import { readerArtworkUrlChirho } from '../fixtures-chirho/runtime-chirho';

import { readFileSync as readFileSyncChirho } from 'node:fs';
import { test as testChirho, expect as expectChirho } from '@playwright/test';
import { readerOriginChirho } from '../fixtures-chirho/runtime-chirho';

interface SharedIconChirho {
	lesson_id_chirho: string;
	token_id_chirho: string;
	asset_path_chirho: string;
	selected_chirho: boolean;
	lemma_id_chirho: string;
}

function sharedIconsChirho(bookChirho: string): SharedIconChirho[] {
	return JSON.parse(
		readFileSyncChirho(`data-chirho/media-chirho/reused-${bookChirho}-icons-chirho.json`, 'utf8')
	).icons_chirho;
}

testChirho(
	'reviewed words in all three books load the same existing artwork on phones',
	async ({ page: pageChirho }) => {
		await pageChirho.setViewportSize({ width: 390, height: 844 });
		const errorsChirho: string[] = [];
		pageChirho.on('pageerror', (errorChirho) => errorsChirho.push(errorChirho.message));
		for (const bookChirho of ['proverbs', 'john', 'genesis']) {
			const iconChirho = sharedIconsChirho(bookChirho).find(
				(rowChirho) => rowChirho.selected_chirho
			);
			expectChirho(iconChirho).toBeTruthy();
			if (!iconChirho) throw new Error('Shared artwork fixture unavailable');
			await pageChirho.goto(`${readerOriginChirho}#${iconChirho.lesson_id_chirho}`);
			const wordChirho = pageChirho.locator('.verse-chirho .word-unit-chirho').filter({
				has: pageChirho.locator(
					`[data-word-jump-chirho="word-card-${iconChirho.token_id_chirho}-chirho"]`
				)
			});
			const imageChirho = wordChirho.locator('[data-icon-chirho]');
			await expectChirho(imageChirho).toHaveAttribute(
				'src',
				readerArtworkUrlChirho(iconChirho.asset_path_chirho)
			);
			await expectChirho
				.poll(() =>
					imageChirho.evaluate(
						(elementChirho: HTMLImageElement) =>
							elementChirho.complete && elementChirho.naturalWidth === 128
					)
				)
				.toBe(true);
			expectChirho(
				await pageChirho.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)
			).toBe(true);
		}
		expectChirho(errorsChirho).toEqual([]);
	}
);

testChirho(
	'reused drawing variants of one sense keep the selected image and a single border',
	async ({ page: pageChirho }) => {
		const iconsChirho = sharedIconsChirho('proverbs');
		const selectedChirho = iconsChirho.find(
			(rowChirho) =>
				rowChirho.selected_chirho &&
				iconsChirho.some(
					(candidateChirho) =>
						!candidateChirho.selected_chirho &&
						candidateChirho.lesson_id_chirho === rowChirho.lesson_id_chirho &&
						candidateChirho.token_id_chirho === rowChirho.token_id_chirho
				)
		);
		if (!selectedChirho) throw new Error('Shared alternatives fixture unavailable');
		await pageChirho.goto(`${readerOriginChirho}#${selectedChirho.lesson_id_chirho}`);
		const wordChirho = pageChirho.locator('.verse-chirho .word-unit-chirho').filter({
			has: pageChirho.locator(
				`[data-word-jump-chirho="word-card-${selectedChirho.token_id_chirho}-chirho"]`
			)
		});
		await expectChirho(wordChirho.locator('[data-icon-chirho]')).toHaveAttribute(
			'src',
			readerArtworkUrlChirho(selectedChirho.asset_path_chirho)
		);
		await expectChirho(wordChirho.locator('.icon-help-chirho')).toHaveCount(0);
		await expectChirho(wordChirho.locator('.sticker-chirho')).not.toHaveClass(
			/double-border-chirho/u
		);
	}
);

testChirho(
	'musar reuses the instruction picture in absolute and construct contexts',
	async ({ page: pageChirho }) => {
		const sharedChirho = sharedIconsChirho('proverbs').find(
			(rowChirho) =>
				rowChirho.lesson_id_chirho === 'Prov.1.3' &&
				rowChirho.lemma_id_chirho === 'H4148' &&
				rowChirho.selected_chirho
		);
		if (!sharedChirho) throw new Error('Reviewed musar reuse missing');
		for (const passageChirho of ['Prov.1.2', 'Prov.1.3', 'Prov.1.8']) {
			await pageChirho.goto(`${readerOriginChirho}#${passageChirho}`);
			const imageChirho = pageChirho.locator(
				`.verse-chirho [data-icon-chirho][src="${readerArtworkUrlChirho(sharedChirho.asset_path_chirho)}"]`
			);
			await expectChirho(imageChirho).toBeVisible();
			await expectChirho
				.poll(() =>
					imageChirho.evaluate(
						(elementChirho: HTMLImageElement) =>
							elementChirho.complete && elementChirho.naturalWidth === 128
					)
				)
				.toBe(true);
		}
	}
);
