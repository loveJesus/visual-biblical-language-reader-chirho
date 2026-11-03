// For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life. — John 3:16 (KJV)

import { readFileSync as readFileSyncChirho } from 'node:fs';
import { createHash as createHashChirho } from 'node:crypto';
import { test as testChirho, expect as expectChirho } from '@playwright/test';
import { readerOriginChirho } from '../fixtures-chirho/runtime-chirho';

testChirho(
	'reads John in original Greek with optional sourced meanings and preserves navigation',
	async ({ page: pageChirho }) => {
		await pageChirho.setViewportSize({ width: 320, height: 800 });
		await pageChirho.goto(`${readerOriginChirho}#Prov.26.1`);
		await expectChirho(pageChirho.getByLabel('Chapter', { exact: true })).toBeEnabled();
		await pageChirho.getByLabel('Book', { exact: true }).selectOption('John');
		await expectChirho(
			pageChirho.getByRole('heading', { name: 'John 1:1', exact: true })
		).toBeVisible();
		const dataChirho = JSON.parse(
			readFileSyncChirho('static/content-chirho/john-chirho/chapter-01-chirho.json', 'utf8')
		);
		const textChirho = await pageChirho.locator('.verse-chirho').evaluate((elementChirho) => {
			const cloneChirho = elementChirho.cloneNode(true) as HTMLElement;
			cloneChirho
				.querySelectorAll('[data-annotation-chirho]')
				.forEach((itemChirho) => itemChirho.remove());
			return cloneChirho.textContent;
		});
		expectChirho(textChirho).toBe(dataChirho.verses_chirho[0].canonical_text_chirho);
		for (const widthChirho of [320, 390]) {
			await pageChirho.setViewportSize({ width: widthChirho, height: 800 });
			const loosePunctuationChirho = await pageChirho
				.locator('.greek-verse-chirho')
				.evaluate((elementChirho) =>
					Array.from(elementChirho.childNodes).some(
						(nodeChirho) =>
							nodeChirho.nodeType === Node.TEXT_NODE && /\S/u.test(nodeChirho.textContent ?? '')
					)
				);
			expectChirho(loosePunctuationChirho).toBe(false);
			await expectChirho(
				pageChirho.locator('.greek-verse-chirho .word-unit-chirho').last()
			).toContainText('.');
		}
		await expectChirho(pageChirho.locator('.meaning-chirho')).toHaveCount(0);
		await pageChirho.getByRole('button', { name: 'Show word meanings' }).click();
		await expectChirho(pageChirho.locator('.meaning-chirho').first()).toContainText(
			'Berean interlinear'
		);
		expectChirho(
			await pageChirho.evaluate(
				() => document.documentElement.scrollWidth <= document.documentElement.clientWidth
			)
		).toBe(true);
		await pageChirho.reload();
		await expectChirho(
			pageChirho.getByRole('heading', { name: 'John 1:1', exact: true })
		).toBeVisible();
		await expectChirho(pageChirho.locator('.meaning-chirho')).toHaveCount(0);
		await pageChirho.getByLabel('Book', { exact: true }).selectOption('Prov');
		await expectChirho(
			pageChirho.getByRole('heading', { name: 'Proverbs 1:1', exact: true })
		).toBeVisible();
	}
);

testChirho(
	'Greek cues stay above their own words without collisions at desktop and phone widths',
	async ({ page: pageChirho }) => {
		for (const verseChirho of [1, 18]) {
			await pageChirho.goto(`${readerOriginChirho}#John.1.${verseChirho}`);
			await expectChirho(
				pageChirho.getByRole('heading', { name: `John 1:${verseChirho}`, exact: true })
			).toBeVisible();
			for (const widthChirho of [1440, 390, 320]) {
				await pageChirho.setViewportSize({ width: widthChirho, height: 844 });
				const faultsChirho = await pageChirho
					.locator('.greek-word-surface-chirho')
					.evaluateAll((surfacesChirho) => {
						const failuresChirho: string[] = [];
						const baselinesChirho = new Map<number, number>();
						for (const surfaceChirho of surfacesChirho) {
							const sourceChirho = surfaceChirho
								.querySelector('[data-source-word-chirho]')!
								.getBoundingClientRect();
							const surfaceBoxChirho = surfaceChirho.getBoundingClientRect();
							const rowChirho = Math.round(
								surfaceChirho.closest('.word-unit-chirho')!.getBoundingClientRect().top
							);
							const baselineChirho = baselinesChirho.get(rowChirho);
							if (baselineChirho !== undefined && Math.abs(baselineChirho - sourceChirho.top) > 1)
								failuresChirho.push('words in a row are not aligned');
							baselinesChirho.set(rowChirho, sourceChirho.top);
							const markersChirho = [...surfaceChirho.querySelectorAll('[data-greek-cue-chirho]')];
							for (let indexChirho = 0; indexChirho < markersChirho.length; indexChirho++) {
								const markerChirho = markersChirho[indexChirho];
								const boxChirho = markerChirho.getBoundingClientRect();
								if (boxChirho.bottom > sourceChirho.top + 1)
									failuresChirho.push('cue crosses source text');
								if (
									markerChirho.getAttribute('data-greek-cue-chirho') === 'case' &&
									Math.abs(
										(boxChirho.left +
											boxChirho.right -
											surfaceBoxChirho.left -
											surfaceBoxChirho.right) /
											2
									) > 1
								)
									failuresChirho.push('case is not centered');
								for (const otherChirho of markersChirho.slice(indexChirho + 1)) {
									const otherBoxChirho = otherChirho.getBoundingClientRect();
									if (
										Math.min(boxChirho.right, otherBoxChirho.right) -
											Math.max(boxChirho.left, otherBoxChirho.left) >
										1
									)
										failuresChirho.push('cues overlap');
								}
							}
						}
						if (document.documentElement.scrollWidth > document.documentElement.clientWidth)
							failuresChirho.push('page overflows');
						return failuresChirho;
					});
				expectChirho(faultsChirho).toEqual([]);
			}
			if (verseChirho === 1) {
				const verbChirho = pageChirho
					.locator('.word-unit-chirho')
					.filter({ has: pageChirho.locator('[data-source-word-chirho]', { hasText: /^ἦν$/u }) })
					.first();
				await expectChirho(
					verbChirho.locator('[data-greek-cue-chirho="tense-voice"] button > [aria-hidden="true"]')
				).toHaveText('Ia');
				await expectChirho(
					verbChirho.locator('[data-greek-cue-chirho="person-mood"] button > [aria-hidden="true"]')
				).toHaveText('3I');
			}
		}
	}
);

testChirho(
	'labels distinct reviewed Greek meanings while hiding another drawing of the selected sense',
	async ({ page: pageChirho }) => {
		const lessonChirho = JSON.parse(
			readFileSyncChirho('static/content-chirho/john-chirho/chapter-01-chirho.json', 'utf8')
		).verses_chirho[0];
		const tokenChirho = lessonChirho.tokens_chirho[0];
		const iconChirho = {
			lesson_id_chirho: lessonChirho.id_chirho,
			token_id_chirho: tokenChirho.id_chirho,
			lemma_id_chirho: tokenChirho.lemma_id_chirho,
			lemma_augment_chirho: null,
			lexical_form_chirho: tokenChirho.lexical_form_chirho,
			sense_id_chirho: 'test-in-sense-chirho',
			contextual_meaning_chirho: 'in',
			asset_path_chirho:
				'/assets-chirho/icons-chirho/proverbs-v1-chirho/0000-chirho/cell-07-chirho.webp',
			alt_chirho: 'First illustration',
			width_chirho: 128,
			height_chirho: 128,
			sha256_chirho: 'a'.repeat(64),
			sense_review_chirho: 'agent_reviewed',
			art_review_chirho: 'pending',
			evidence_refs_chirho: [lessonChirho.sources_chirho[0].id_chirho],
			display_authority_chirho: 'Local preview',
			selected_chirho: true
		};
		const chapterChirho = JSON.stringify({
			schema_version_chirho: 1,
			book_id_chirho: 'John',
			chapter_chirho: 1,
			scenes_chirho: [],
			icons_chirho: [
				iconChirho,
				{
					...iconChirho,
					selected_chirho: false,
					sense_id_chirho: 'test-among-sense-chirho',
					contextual_meaning_chirho: 'among',
					sha256_chirho: 'b'.repeat(64),
					alt_chirho: 'Alternative illustration',
					asset_path_chirho:
						'/assets-chirho/icons-chirho/proverbs-v1-chirho/0000-chirho/cell-05-chirho.webp'
				},
				{
					...iconChirho,
					selected_chirho: false,
					sha256_chirho: 'c'.repeat(64),
					alt_chirho: 'Another drawing of in',
					asset_path_chirho:
						'/assets-chirho/icons-chirho/proverbs-v1-chirho/0000-chirho/cell-04-chirho.webp'
				}
			]
		});
		const hashChirho = createHashChirho('sha256').update(chapterChirho).digest('hex');
		await pageChirho.route('**/media-chirho/john-chirho/summary-chirho.json', (routeChirho) =>
			routeChirho.fulfill({
				json: {
					schema_version_chirho: 1,
					book_id_chirho: 'John',
					scene_count_chirho: 0,
					icon_count_chirho: 3,
					chapters_chirho: [
						{
							number_chirho: 1,
							path_chirho: '/media-chirho/john-chirho/chapter-01-chirho.json',
							sha256_chirho: hashChirho,
							scene_count_chirho: 0,
							icon_count_chirho: 3
						}
					]
				}
			})
		);
		await pageChirho.route('**/media-chirho/john-chirho/chapter-01-chirho.json', (routeChirho) =>
			routeChirho.fulfill({ body: chapterChirho, contentType: 'application/json' })
		);
		await pageChirho.goto(`${readerOriginChirho}#John.1.1`);
		await expectChirho(
			pageChirho.getByRole('heading', { name: 'John 1:1', exact: true })
		).toBeVisible();
		await expectChirho(pageChirho.locator('.verse-chirho [data-icon-chirho]')).toHaveCount(1);
		const galleryChirho = pageChirho.locator('.verse-chirho .icon-help-chirho');
		await expectChirho(galleryChirho.locator('.sticker-chirho')).toHaveClass(
			/double-border-chirho/u
		);
		await galleryChirho.click();
		await expectChirho(pageChirho.getByAltText('Alternative illustration')).toBeVisible();
		const popupIdChirho = await galleryChirho.getAttribute('aria-describedby');
		const popupChirho = pageChirho.locator(`[id="${popupIdChirho}"]`);
		await expectChirho(popupChirho.locator('img')).toHaveCount(1);
		await expectChirho(popupChirho.locator('.icon-selected-meaning-chirho')).toContainText(
			iconChirho.contextual_meaning_chirho
		);
		await expectChirho(popupChirho.locator('.icon-sense-label-chirho')).toHaveText('among');
		await expectChirho(pageChirho.getByAltText('Another drawing of in')).toHaveCount(0);
		await pageChirho.keyboard.press('Escape');
		await expectChirho(popupChirho).toBeHidden();
	}
);
