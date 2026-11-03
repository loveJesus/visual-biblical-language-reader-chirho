// For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life. — John 3:16 (KJV)

import { afterEach, describe, expect, it, vi } from 'vitest';
import { createHash as createHashChirho } from 'node:crypto';
import { fetchChapterMediaChirho } from '../../src/lib/reader-chirho/navigation-chirho/media-client-chirho';

const chapterChirho = JSON.stringify({
	schema_version_chirho: 1,
	book_id_chirho: 'Prov',
	chapter_chirho: 1,
	scenes_chirho: [],
	icons_chirho: []
});
const digestChirho = createHashChirho('sha256').update(chapterChirho).digest('hex');
function summaryChirho(hashChirho: string) {
	return JSON.stringify({
		schema_version_chirho: 1,
		book_id_chirho: 'Prov',
		scene_count_chirho: 0,
		icon_count_chirho: 0,
		chapters_chirho: [
			{
				number_chirho: 1,
				path_chirho: '/media-chirho/proverbs-chirho/chapter-01-chirho.json',
				sha256_chirho: hashChirho,
				scene_count_chirho: 0,
				icon_count_chirho: 0
			}
		]
	});
}
afterEach(() => vi.unstubAllGlobals());
describe('chapter media', () => {
	it('loads chapter lemma defaults from the same two static requests, including cross-book sources', async () => {
		const bodyChirho = JSON.stringify({
			...JSON.parse(chapterChirho),
			lemma_icons_chirho: [
				{
					id_chirho: 'source-chirho',
					lesson_id_chirho: 'Gen.1.1',
					token_id_chirho: '01aaa',
					lemma_id_chirho: 'H4148'
				}
			]
		});
		const documentChirho = JSON.parse(
			summaryChirho(createHashChirho('sha256').update(bodyChirho).digest('hex'))
		);
		documentChirho.lemma_icon_count_chirho = 1;
		documentChirho.chapters_chirho[0].lemma_icon_count_chirho = 1;
		const fetchChirho = vi.fn(
			async (pathChirho: string) =>
				new Response(pathChirho.includes('summary') ? JSON.stringify(documentChirho) : bodyChirho)
		);
		vi.stubGlobal('fetch', fetchChirho);
		const resultChirho = await fetchChapterMediaChirho('Prov', 1);
		expect(resultChirho.chapterChirho.lemma_icons_chirho).toHaveLength(1);
		expect(fetchChirho).toHaveBeenCalledTimes(2);
	});
	it('refuses inconsistent default counts before using a chapter library', async () => {
		const bodyChirho = JSON.stringify({ ...JSON.parse(chapterChirho), lemma_icons_chirho: [] });
		const documentChirho = JSON.parse(
			summaryChirho(createHashChirho('sha256').update(bodyChirho).digest('hex'))
		);
		documentChirho.chapters_chirho[0].lemma_icon_count_chirho = 1;
		vi.stubGlobal(
			'fetch',
			vi.fn(
				async (pathChirho: string) =>
					new Response(pathChirho.includes('summary') ? JSON.stringify(documentChirho) : bodyChirho)
			)
		);
		await expect(fetchChapterMediaChirho('Prov', 1)).rejects.toThrow('Invalid media chapter');
	});
	it('refetches the summary once if a chapter changes during a refresh', async () => {
		let summariesChirho = 0;
		vi.stubGlobal(
			'fetch',
			vi.fn(
				async (pathChirho: string) =>
					new Response(
						pathChirho.includes('summary')
							? summaryChirho(++summariesChirho === 1 ? '0'.repeat(64) : digestChirho)
							: chapterChirho
					)
			)
		);
		const resultChirho = await fetchChapterMediaChirho('Prov', 1);
		expect(resultChirho.chapterChirho.scenes_chirho).toEqual([]);
		expect(summariesChirho).toBe(2);
	});
	it('refuses a chapter that still does not match after the retry', async () => {
		vi.stubGlobal(
			'fetch',
			vi.fn(
				async (pathChirho: string) =>
					new Response(
						pathChirho.includes('summary') ? summaryChirho('0'.repeat(64)) : chapterChirho
					)
			)
		);
		await expect(fetchChapterMediaChirho('Prov', 1)).rejects.toThrow('integrity');
	});
});
