// For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life. — John 3:16 (KJV)

import { describe as describeChirho, expect as expectChirho, it as itChirho } from 'vitest';
import { createHash as createHashChirho } from 'node:crypto';
import { legendRowsChirho } from '../../src/lib/domain-chirho/legend-chirho';
import {
	legendItemTextChirho,
	legendRowTextChirho
} from '../../src/lib/i18n-chirho/legend-messages-chirho';
import { isLocaleChirho, resolveLocaleChirho } from '../../src/lib/i18n-chirho/locale-chirho';
import { defineCatalogueChirho, translateChirho } from '../../src/lib/i18n-chirho/translate-chirho';
import {
	createSpanishGlossClientChirho,
	parseSpanishLayerChirho,
	SPANISH_MANIFEST_PATH_CHIRHO
} from '../../src/lib/i18n-chirho/spanish-glosses-chirho';
import { greekKeyRowsChirho } from '../../src/lib/reader-chirho/greek-chirho/greek-key-chirho';

const contentChirho = (numberChirho: number) => ({
	path_chirho: `/content-chirho/proverbs-chirho/chapter-0${numberChirho}-chirho.json`,
	sha256_chirho: String(numberChirho).repeat(64)
});

const layerValueChirho = (chapterChirho: number) => ({
	schema_version_chirho: 1,
	book_id_chirho: 'Prov',
	chapter_chirho: chapterChirho,
	content_path_chirho: contentChirho(chapterChirho).path_chirho,
	content_sha256_chirho: contentChirho(chapterChirho).sha256_chirho,
	language_chirho: 'es',
	source_chirho: {
		id_chirho: 'gbt-spanish-prov-chirho',
		title_chirho: 'GBT Spanish',
		url_chirho: 'https://github.com/globalbibletools/data',
		revision_chirho: 'abc',
		sha256_chirho: 'def',
		license_chirho: 'CC0 1.0',
		attribution_chirho: 'Global Bible Tools'
	},
	glosses_chirho: { '20ikj': 'Como nieve', '20Yxf': null }
});

function fetchStubChirho({
	tamperedChirho = false,
	boundElsewhereChirho = false
}: { tamperedChirho?: boolean; boundElsewhereChirho?: boolean } = {}) {
	const requestedChirho: string[] = [];
	const bodiesChirho = new Map<string, string>();
	const chaptersChirho = [];
	for (let numberChirho = 1; numberChirho <= 6; numberChirho += 1) {
		const pathChirho = `/glosses-chirho/es-chirho/proverbs-chirho/chapter-0${numberChirho}-chirho.json`;
		const valueChirho = layerValueChirho(numberChirho);
		if (boundElsewhereChirho) valueChirho.content_sha256_chirho = 'f'.repeat(64);
		const textChirho = JSON.stringify(valueChirho);
		bodiesChirho.set(
			pathChirho,
			tamperedChirho ? textChirho.replace('nieve', 'nievE') : textChirho
		);
		chaptersChirho.push({
			number_chirho: numberChirho,
			path_chirho: pathChirho,
			sha256_chirho: createHashChirho('sha256').update(textChirho).digest('hex'),
			content_path_chirho: contentChirho(numberChirho).path_chirho,
			content_sha256_chirho: contentChirho(numberChirho).sha256_chirho
		});
	}
	bodiesChirho.set(
		SPANISH_MANIFEST_PATH_CHIRHO,
		JSON.stringify({ books_chirho: { Prov: { chapters_chirho: chaptersChirho } } })
	);
	const fetchChirho = (async (urlChirho: string) => {
		requestedChirho.push(urlChirho);
		const bodyChirho = bodiesChirho.get(urlChirho);
		return new Response(bodyChirho ?? '', { status: bodyChirho === undefined ? 404 : 200 });
	}) as unknown as typeof fetch;
	return { fetchChirho, requestedChirho };
}

describeChirho('interface locale', () => {
	itChirho('prefers ?lang_chirho=, then the saved choice, then English', () => {
		expectChirho(resolveLocaleChirho('es', 'en')).toBe('es');
		expectChirho(resolveLocaleChirho(null, 'es')).toBe('es');
		expectChirho(resolveLocaleChirho('fr', 'xx')).toBe('en');
		expectChirho(isLocaleChirho('es')).toBe(true);
		expectChirho(isLocaleChirho('ES')).toBe(false);
	});

	itChirho('fills placeholders and leaves unknown ones visible', () => {
		const catalogueChirho = defineCatalogueChirho({
			en: {
				greet_chirho: 'Loading {book_chirho} {chapter_chirho}',
				other_chirho: '{missing_chirho}'
			},
			es: {
				greet_chirho: 'Cargando {book_chirho} {chapter_chirho}',
				other_chirho: '{missing_chirho}'
			}
		});
		expectChirho(
			translateChirho(catalogueChirho, 'es', 'greet_chirho', {
				book_chirho: 'Juan',
				chapter_chirho: 3
			})
		).toBe('Cargando Juan 3');
		expectChirho(translateChirho(catalogueChirho, 'en', 'other_chirho')).toBe('{missing_chirho}');
	});

	itChirho('has Spanish for every Hebrew and Greek reading-key item and row', () => {
		const untranslatedChirho = [...legendRowsChirho, ...greekKeyRowsChirho].flatMap((rowChirho) => [
			...(legendRowTextChirho(rowChirho.label_chirho, 'es').lang_chirho === 'es'
				? []
				: [rowChirho.label_chirho]),
			...rowChirho.items_chirho
				.filter((itemChirho) => legendItemTextChirho(itemChirho, 'es').lang_chirho !== 'es')
				.map((itemChirho) => itemChirho.id_chirho)
		]);
		expectChirho(untranslatedChirho).toEqual([]);
		const itemChirho = legendRowsChirho[0].items_chirho[0];
		expectChirho(legendItemTextChirho(itemChirho, 'en')).toEqual({
			label_chirho: itemChirho.label_chirho,
			help_chirho: itemChirho.help_chirho,
			lang_chirho: 'en'
		});
	});
});

describeChirho('Spanish gloss layers', () => {
	itChirho(
		'fetches only the selected chapter, after its manifest, and verifies its hash',
		async () => {
			const { fetchChirho, requestedChirho } = fetchStubChirho();
			const resultChirho = await createSpanishGlossClientChirho(fetchChirho).chapterLayerChirho(
				'Prov',
				3,
				contentChirho(3)
			);
			if (resultChirho.kindChirho !== 'ready') throw new Error(resultChirho.kindChirho);
			expectChirho(resultChirho.layerChirho.glossesChirho['20ikj']).toBe('Como nieve');
			expectChirho(resultChirho.layerChirho.glossesChirho['20Yxf']).toBeNull();
			expectChirho(resultChirho.layerChirho.sourceChirho.id_chirho).toBe('gbt-spanish-prov-chirho');
			expectChirho(requestedChirho).toEqual([
				SPANISH_MANIFEST_PATH_CHIRHO,
				'/glosses-chirho/es-chirho/proverbs-chirho/chapter-03-chirho.json'
			]);
		}
	);

	itChirho('withholds a layer built from other chapter bytes, without fetching it', async () => {
		const { fetchChirho, requestedChirho } = fetchStubChirho();
		const clientChirho = createSpanishGlossClientChirho(fetchChirho);
		const changedChirho = { ...contentChirho(2), sha256_chirho: 'a'.repeat(64) };
		expectChirho(await clientChirho.chapterLayerChirho('Prov', 2, changedChirho)).toEqual({
			kindChirho: 'stale'
		});
		expectChirho(requestedChirho).toEqual([SPANISH_MANIFEST_PATH_CHIRHO]);
		await expectChirho(
			clientChirho.chapterLayerChirho('Prov', 2, contentChirho(4))
		).rejects.toThrow('another chapter');
	});

	itChirho('refuses a layer whose bytes or binding differ from its manifest', async () => {
		await expectChirho(
			createSpanishGlossClientChirho(
				fetchStubChirho({ tamperedChirho: true }).fetchChirho
			).chapterLayerChirho('Prov', 1, contentChirho(1))
		).rejects.toThrow('hash differs');
		await expectChirho(
			createSpanishGlossClientChirho(
				fetchStubChirho({ boundElsewhereChirho: true }).fetchChirho
			).chapterLayerChirho('Prov', 1, contentChirho(1))
		).rejects.toThrow('other chapter bytes');
	});

	itChirho('reports a chapter without a layer as absent', async () => {
		const { fetchChirho } = fetchStubChirho();
		expectChirho(
			await createSpanishGlossClientChirho(fetchChirho).chapterLayerChirho(
				'Prov',
				9,
				contentChirho(9)
			)
		).toEqual({ kindChirho: 'absent' });
		expectChirho(
			await createSpanishGlossClientChirho(fetchChirho).chapterLayerChirho(
				'Gen',
				1,
				contentChirho(1)
			)
		).toEqual({ kindChirho: 'absent' });
	});

	itChirho('keeps a bounded cache of chapters', async () => {
		const { fetchChirho, requestedChirho } = fetchStubChirho();
		const clientChirho = createSpanishGlossClientChirho(fetchChirho);
		for (let numberChirho = 1; numberChirho <= 5; numberChirho += 1)
			await clientChirho.chapterLayerChirho('Prov', numberChirho, contentChirho(numberChirho));
		await clientChirho.chapterLayerChirho('Prov', 5, contentChirho(5));
		await clientChirho.chapterLayerChirho('Prov', 1, contentChirho(1));
		const chapterOneChirho = '/glosses-chirho/es-chirho/proverbs-chirho/chapter-01-chirho.json';
		const chapterFiveChirho = '/glosses-chirho/es-chirho/proverbs-chirho/chapter-05-chirho.json';
		expectChirho(
			requestedChirho.filter((urlChirho) => urlChirho === chapterOneChirho)
		).toHaveLength(2);
		expectChirho(
			requestedChirho.filter((urlChirho) => urlChirho === chapterFiveChirho)
		).toHaveLength(1);
	});

	itChirho('refuses malformed layers instead of repairing them', () => {
		const goodChirho = layerValueChirho(1);
		const boundChirho = contentChirho(1);
		expectChirho(parseSpanishLayerChirho(goodChirho, 'Prov', 1, boundChirho).bookIdChirho).toBe(
			'Prov'
		);
		for (const badChirho of [
			{ ...goodChirho, chapter_chirho: 2 },
			{ ...goodChirho, language_chirho: 'en' },
			{ ...goodChirho, glosses_chirho: { x: '  ' } },
			{
				...goodChirho,
				source_chirho: { ...goodChirho.source_chirho, url_chirho: 'http://x.test' }
			},
			{ ...goodChirho, source_chirho: { ...goodChirho.source_chirho, license_chirho: '' } }
		])
			expectChirho(() => parseSpanishLayerChirho(badChirho, 'Prov', 1, boundChirho)).toThrow();
	});
});
