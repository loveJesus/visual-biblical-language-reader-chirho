// For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life. — John 3:16 (KJV)
import { test as testChirho, expect as expectChirho } from '@playwright/test';
import { readerOriginChirho } from '../fixtures-chirho/runtime-chirho';

testChirho(
	'locale choice preserves the passage, survives reload and fetches only selected Spanish chapters',
	async ({ page: pageChirho }) => {
		const pathsChirho: string[] = [];
		pageChirho.on('request', (requestChirho) =>
			pathsChirho.push(new URL(requestChirho.url()).pathname)
		);
		await pageChirho.goto(`${readerOriginChirho}?lang_chirho=en#John.3.16`);
		await expectChirho(
			pageChirho.getByRole('heading', { name: 'John 3:16', exact: true })
		).toBeVisible();
		expectChirho(
			pathsChirho.filter((pathChirho) => pathChirho.startsWith('/glosses-chirho/'))
		).toEqual([]);
		await pageChirho.locator('[data-locale-select-chirho]').selectOption('es');
		await expectChirho(
			pageChirho.getByRole('heading', { name: 'Juan 3:16', exact: true })
		).toBeVisible();
		await expectChirho(pageChirho.locator('html')).toHaveAttribute('lang', 'es');
		await expectChirho
			.poll(
				() => pathsChirho.filter((pathChirho) => pathChirho.startsWith('/glosses-chirho/')).length
			)
			.toBe(2);
		expectChirho(
			pathsChirho.filter((pathChirho) => pathChirho.startsWith('/glosses-chirho/'))
		).toEqual([
			'/glosses-chirho/es-chirho/manifest-chirho.json',
			'/glosses-chirho/es-chirho/john-chirho/chapter-03-chirho.json'
		]);
		await pageChirho.reload();
		await expectChirho(
			pageChirho.getByRole('heading', { name: 'Juan 3:16', exact: true })
		).toBeVisible();
		await pageChirho.locator('[data-locale-select-chirho]').selectOption('en');
		await pageChirho.reload();
		await expectChirho(pageChirho).toHaveURL(/lang_chirho=en#John\.3\.16$/);
		await expectChirho(
			pageChirho.getByRole('heading', { name: 'John 3:16', exact: true })
		).toBeVisible();
	}
);

testChirho(
	'Spanish phone layouts keep original scripts and the compact audio row intact',
	async ({ page: pageChirho }) => {
		for (const widthChirho of [1440, 390, 320]) {
			await pageChirho.setViewportSize({ width: widthChirho, height: 900 });
			for (const [passageChirho, headingChirho, languageChirho] of [
				['Prov.26.1', 'Proverbios 26:1', 'he'],
				['John.1.1', 'Juan 1:1', 'grc'],
				['Gen.1.1', 'Génesis 1:1', 'he']
			]) {
				await pageChirho.goto(`${readerOriginChirho}?lang_chirho=es#${passageChirho}`);
				await expectChirho(
					pageChirho.getByRole('heading', { name: headingChirho, exact: true })
				).toBeVisible();
				await expectChirho(pageChirho.locator('.verse-chirho')).toHaveAttribute(
					'lang',
					languageChirho
				);
				await expectChirho(
					pageChirho.getByRole('button', { name: 'Escuchar este versículo', exact: true })
				).toBeVisible();
				const geometryChirho = await pageChirho.evaluate(() => {
					const transportChirho = document
						.querySelector('.verse-transport-chirho')!
						.getBoundingClientRect();
					const controlsChirho = [
						...document.querySelectorAll('.verse-transport-chirho > button')
					].map((buttonChirho) => buttonChirho.getBoundingClientRect());
					return {
						overflow_chirho: document.documentElement.scrollWidth > innerWidth,
						contained_chirho: controlsChirho.every(
							(rectChirho) =>
								rectChirho.left >= transportChirho.left - 1 &&
								rectChirho.right <= transportChirho.right + 1
						),
						line_difference_chirho:
							Math.max(
								...controlsChirho.map((rectChirho) => rectChirho.top + rectChirho.height / 2)
							) -
							Math.min(
								...controlsChirho.map((rectChirho) => rectChirho.top + rectChirho.height / 2)
							)
					};
				});
				expectChirho(geometryChirho.overflow_chirho).toBe(false);
				expectChirho(geometryChirho.contained_chirho).toBe(true);
				expectChirho(geometryChirho.line_difference_chirho).toBeLessThan(1);
			}
		}
	}
);

testChirho(
	'an altered Spanish layer is withheld while the original remains readable',
	async ({ page: pageChirho }) => {
		let mutatedChirho: () => void = () => undefined;
		const mutationDoneChirho = new Promise<void>((resolveChirho) => {
			mutatedChirho = resolveChirho;
		});
		await pageChirho.route(
			'**/glosses-chirho/es-chirho/proverbs-chirho/chapter-01-chirho.json',
			async (routeChirho) => {
				const responseChirho = await routeChirho.fetch();
				await routeChirho.fulfill({
					response: responseChirho,
					body: (await responseChirho.text()).replace('sabiduría', 'changed-chirho')
				});
				mutatedChirho();
			}
		);
		await pageChirho.goto(`${readerOriginChirho}?lang_chirho=es#Prov.1.2`);
		await mutationDoneChirho;
		await expectChirho(
			pageChirho.getByRole('heading', { name: 'Proverbios 1:2', exact: true })
		).toBeVisible();
		await expectChirho(pageChirho.locator('.word-cards-chirho')).not.toContainText(
			'changed-chirho'
		);
		await expectChirho(
			pageChirho
				.locator('.word-cards-chirho')
				.getByText('Las glosas en español no están disponibles para este capítulo.')
				.first()
		).toBeVisible();
		await expectChirho(
			pageChirho.locator('.verse-chirho').getByRole('link', { name: 'לָדַ֣עַת', exact: true })
		).toBeVisible();
		await pageChirho.unrouteAll({ behavior: 'wait' });
	}
);
