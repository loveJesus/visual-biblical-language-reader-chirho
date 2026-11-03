// For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life. — John 3:16 (KJV)
import { afterEach, describe, expect, it, vi } from 'vitest';
import { mkdtemp, mkdir, readFile, writeFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import {
	cacheKeyChirho,
	executeAudioPlanChirho,
	reserveChirho,
	type AudioJobChirho
} from '../../../scripts-chirho/audio-chirho/audition_chirho';
import {
	productionWordRecipeChirho,
	HEBREW_WORD_RECIPE_CHIRHO,
	GREEK_WORD_RECIPE_CHIRHO
} from '../../../src/lib/domain-chirho/pronunciation-chirho/production-recipe-chirho';
import { divineNameReadingChirho } from '../../../src/lib/domain-chirho/pronunciation-chirho/divine-name-chirho';

import { wordPhoneticsChirho } from '../../../scripts-chirho/audio-chirho/production-chirho/word_phonetics_chirho';

const wordChirho: AudioJobChirho = {
	id_chirho: 'word-one-chirho',
	lesson_id_chirho: 'Prov.1.2',
	token_id_chirho: '20abc',
	text_chirho: 'מוּסָר',
	language_chirho: 'he',
	recipe_id_chirho: HEBREW_WORD_RECIPE_CHIRHO,
	canonical_sha256_chirho: 'a'.repeat(64),
	...productionWordRecipeChirho('מוּסָר', HEBREW_WORD_RECIPE_CHIRHO, 'muˈsaʁ')!
};
const rootsChirho: string[] = [];
afterEach(async () => {
	vi.unstubAllGlobals();
	vi.unstubAllEnvs();
	await Promise.all(
		rootsChirho.splice(0).map((rootChirho) => rm(rootChirho, { recursive: true, force: true }))
	);
});

describe('reusable pronunciation library', () => {
	it('locates stress from the source, including paired poetic marks, and withholds an unmarked guess', () => {
		expect(wordPhoneticsChirho('מֶ֝֗לֶךְ').ipa_chirho).toBe('ˈmelex');
		expect(wordPhoneticsChirho('מֶ֥לֶךְ').ipa_chirho).toBe('ˈmelex');
		expect(wordPhoneticsChirho('מֶֽלֶךְ׃').ipa_chirho).toBe('ˈmelex');
		expect(wordPhoneticsChirho('נָאוֶ֖ה').ipa_chirho).toBe('naˈve');
		expect(wordPhoneticsChirho('בֹּ֣צֵֽעַ').ipa_chirho).toBe('ˈbot͡seaʔ');
		expect(() => wordPhoneticsChirho('מֶלֶךְ')).toThrow(/checked stress/);
		expect(() => wordPhoneticsChirho('מֶ֭לֶךְ')).toThrow(/checked stress/);
	});
	it('shares exact pronunciation across source occurrences while keeping prefixes and stress distinct', () => {
		expect(cacheKeyChirho(wordChirho)).toBe(
			cacheKeyChirho({ ...wordChirho, lesson_id_chirho: 'Prov.1.3', token_id_chirho: '20def' })
		);
		expect(
			cacheKeyChirho({
				...wordChirho,
				...productionWordRecipeChirho('לְמוּסָר', HEBREW_WORD_RECIPE_CHIRHO, 'lemuˈsaʁ')!
			})
		).not.toBe(cacheKeyChirho(wordChirho));
		expect(productionWordRecipeChirho('Λόγος', GREEK_WORD_RECIPE_CHIRHO)).toEqual(
			productionWordRecipeChirho('λόγος', GREEK_WORD_RECIPE_CHIRHO)
		);
	});
	it('retains historical reservations, counts unknown requests, and preserves the old trial boundary', () => {
		const amountChirho = [...wordChirho.synthesis_text_chirho!].length;
		expect(reserveChirho([wordChirho], [], 10660, 'production')).toBe(amountChirho);
		expect(() => reserveChirho([wordChirho], [], 270001 - amountChirho, 'production')).toThrow(
			/budget/
		);
		expect(() => reserveChirho([wordChirho], [], 10660, true)).toThrow();
		expect(() =>
			reserveChirho([{ ...wordChirho, language_chirho: 'el' }], [], 10660, 'production')
		).toThrow(/mismatch/);
	});
	it('uses the traditional divine-name cue without changing the displayed source', () => {
		const tokenChirho = { text_chirho: 'בַּיהוָ֖ה', lemma_id_chirho: 'H3068' };
		const originalChirho = tokenChirho.text_chirho;
		expect(divineNameReadingChirho(tokenChirho)).toMatchObject({
			name_chirho: 'Adonai',
			ipa_chirho: 'ʔadoˈnaj'
		});
		expect(tokenChirho.text_chirho).toBe(originalChirho);
		expect(
			divineNameReadingChirho({ text_chirho: 'יֱהֹוִה', lemma_id_chirho: 'H3069' })?.name_chirho
		).toBe('Elohim');
		expect(divineNameReadingChirho({ text_chirho: 'יהוה', lemma_id_chirho: 'H1' })).toBeNull();
	});
	it('reserves before POST, continues an independent word after failure, and never repeats an uncertain request', async () => {
		const rootChirho = await mkdtemp(join(tmpdir(), 'hinneh-word-audio-chirho-'));
		rootsChirho.push(rootChirho);
		const folderChirho = join(
			rootChirho,
			'workspace-chirho/audio-chirho/production-2026-10-31-chirho/batches-chirho/0000-chirho/batch-0000-chirho'
		);
		await mkdir(folderChirho, { recursive: true });
		const rowsChirho = [
			wordChirho,
			{
				...wordChirho,
				id_chirho: 'word-two-chirho',
				token_id_chirho: '20xyz',
				text_chirho: 'לְמוּסָר',
				...productionWordRecipeChirho('לְמוּסָר', HEBREW_WORD_RECIPE_CHIRHO, 'lemuˈsaʁ')!
			}
		];
		let postsChirho = 0;
		vi.stubEnv('ELEVENLABS_API_KEY_CHIRHO', 'test-credential-chirho');
		const fetchChirho = vi.fn(async (urlChirho: string, initChirho?: RequestInit) => {
			if (initChirho?.method === 'POST') {
				const receiptsChirho = JSON.parse(
					await readFile(join(folderChirho, 'receipts-chirho.json'), 'utf8')
				);
				expect(
					receiptsChirho.filter(
						(rowChirho: { state_chirho: string }) => rowChirho.state_chirho === 'requested'
					).length
				).toBeGreaterThan(0);
				postsChirho++;
				return postsChirho === 1
					? new Response('', { status: 500 })
					: new Response(new Uint8Array(2000), { headers: { 'content-type': 'audio/mpeg' } });
			}
			const pathChirho = new URL(urlChirho).pathname;
			if (pathChirho === '/v1/user/subscription')
				return Response.json({
					status: 'active',
					tier: 'creator',
					character_limit: 300000,
					character_count: 10660
				});
			if (pathChirho === '/v1/models')
				return Response.json([
					{
						model_id: 'eleven_v4',
						can_do_text_to_speech: true,
						model_rates: { character_cost_multiplier: 1 }
					}
				]);
			if (pathChirho === '/v1/voices' || pathChirho === '/v1/shared-voices')
				return Response.json({
					voices: [{ voice_id: 'l7Q9rbdCC6j3J5dNlOOg', language: 'he', rate: 1 }]
				});
			throw new Error('Unexpected provider route');
		});
		vi.stubGlobal('fetch', fetchChirho);
		const planChirho = {
			rows_chirho: rowsChirho,
			folder_chirho: folderChirho,
			prior_credits_chirho: 10660,
			mode_chirho: 'production' as const,
			verify_source_chirho: async () => {}
		};
		const resultChirho = await executeAudioPlanChirho(rootChirho, true, planChirho);
		expect(resultChirho).toMatchObject({
			received_requests_chirho: 1,
			held_requests_chirho: 1,
			complete_chirho: false
		});
		expect(postsChirho).toBe(2);
		await executeAudioPlanChirho(rootChirho, true, planChirho);
		expect(postsChirho).toBe(2);
		const receiptsChirho = JSON.parse(
			await readFile(join(folderChirho, 'receipts-chirho.json'), 'utf8')
		);
		const keyChirho = receiptsChirho[0].key_chirho;
		await expect(
			executeAudioPlanChirho(rootChirho, true, {
				...planChirho,
				rows_chirho: [{ ...rowsChirho[0], synthesis_text_chirho: 'changed' }, rowsChirho[1]]
			})
		).rejects.toThrow(/identity/);
		expect(
			JSON.parse(await readFile(join(folderChirho, 'receipts-chirho.json'), 'utf8'))[0].key_chirho
		).toBe(keyChirho);
		await writeFile(
			join(folderChirho, 'receipt-test-chirho.txt'),
			'No provider credentials stored.'
		);
	});
});
