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
import { chapterJobsChirho } from '../../../scripts-chirho/audio-chirho/chapter-chirho/chapter_audition_chirho';
import {
	chapterRecipeChirho,
	HEBREW_CONNECTED_RECIPE_CHIRHO,
	GREEK_ROUGH_RECIPE_CHIRHO,
	GREEK_ERASMIAN_RECIPE_CHIRHO
} from '../../../src/lib/domain-chirho/pronunciation-chirho/chapter-recipe-chirho';
import chapterChirho from '../../../static/content-chirho/proverbs-chirho/chapter-26-chirho.json';
import johnChirho from '../../../static/content-chirho/john-chirho/chapter-01-chirho.json';
import { hebrewPhoneticsChirho } from '../../../scripts-chirho/audio-chirho/chapter-chirho/hebrew_phonetics_chirho';

const wordChirho: AudioJobChirho = {
	id_chirho: 'he-word-chirho',
	lesson_id_chirho: 'Prov.26.1',
	token_id_chirho: '20wMm',
	language_chirho: 'he',
	text_chirho: 'נָאוֶ֖ה',
	canonical_sha256_chirho: 'a'.repeat(64)
};
const receiptChirho = {
	id_chirho: wordChirho.id_chirho,
	key_chirho: cacheKeyChirho(wordChirho),
	reserved_credits_chirho: [...wordChirho.text_chirho].length,
	state_chirho: 'requested' as const,
	voice_id_chirho: 'l7Q9rbdCC6j3J5dNlOOg',
	voice_name_chirho: 'Itamar - Israeli Hebrew Narrator'
};

describe('bounded speech audition', () => {
	it('never repeats an uncertain charge or accepts forged budget evidence', () => {
		expect(() => reserveChirho([wordChirho], [receiptChirho])).toThrow(/reconcile/);
		expect(() =>
			reserveChirho([wordChirho], [{ ...receiptChirho, reserved_credits_chirho: -1 }])
		).toThrow();
		expect(() => reserveChirho([wordChirho], [receiptChirho, receiptChirho])).toThrow();
	});
	it('refuses a plan beyond its fixed request or included-credit ceiling', () => {
		expect(() =>
			reserveChirho(
				Array.from({ length: 5 }, (_, indexChirho) => ({
					...wordChirho,
					id_chirho: String(indexChirho)
				})),
				[]
			)
		).toThrow();
		expect(() =>
			reserveChirho(
				Array.from({ length: 3 }, (_, indexChirho) => ({
					...wordChirho,
					id_chirho: String(indexChirho),
					text_chirho: 'א'.repeat(110)
				})),
				[]
			)
		).toThrow(/budget/);
		expect(reserveChirho([wordChirho], [])).toBe([...wordChirho.text_chirho].length);
	});
	it('keys the actual spoken form rather than the lemma or UI language', () => {
		expect(cacheKeyChirho({ ...wordChirho, text_chirho: 'מוּסָר' })).not.toBe(
			cacheKeyChirho({ ...wordChirho, text_chirho: 'לְמוּסָר' })
		);
		const greekChirho = { ...wordChirho, language_chirho: 'el' as const, text_chirho: 'Λόγος' };
		expect(cacheKeyChirho(greekChirho)).not.toBe(
			cacheKeyChirho({ ...greekChirho, text_chirho: greekChirho.text_chirho.normalize('NFC') })
		);
	});
	it('requires the saved exact audio path and refuses source changes', () => {
		const completeChirho = {
			...receiptChirho,
			state_chirho: 'received' as const,
			path_chirho: `${wordChirho.id_chirho}-${receiptChirho.key_chirho.slice(0, 12)}-chirho.mp3`,
			sha256_chirho: 'a'.repeat(64),
			bytes_chirho: 2000
		};
		expect(reserveChirho([wordChirho], [completeChirho])).toBe(7);
		expect(() =>
			reserveChirho([wordChirho], [{ ...completeChirho, path_chirho: '../../../.env' }])
		).toThrow();
		expect(() =>
			reserveChirho([{ ...wordChirho, text_chirho: 'changed' }], [completeChirho])
		).toThrow();
	});
});

describe('chapter trials preserve source, cost and uncertain-request boundaries', () => {
	it('limits the revised comparison to two exact verses and keeps the prior chapter credits', async () => {
		const chapterJobsRowsChirho = (await chapterJobsChirho(process.cwd())).rows_chirho;
		const revisionsChirho = [
			{
				...chapterJobsRowsChirho[0],
				id_chirho: 'he-flow-chirho',
				recipe_id_chirho: HEBREW_CONNECTED_RECIPE_CHIRHO,
				...chapterRecipeChirho(chapterChirho.verses_chirho[0], HEBREW_CONNECTED_RECIPE_CHIRHO)!
			},
			{
				...chapterJobsRowsChirho.find((rowChirho) => rowChirho.lesson_id_chirho === 'John.1.2')!,
				id_chirho: 'el-rough-chirho',
				recipe_id_chirho: GREEK_ROUGH_RECIPE_CHIRHO,
				...chapterRecipeChirho(johnChirho.verses_chirho[1], GREEK_ROUGH_RECIPE_CHIRHO)!
			}
		];
		const creditsChirho = reserveChirho(revisionsChirho, [], 10243, 'flow_review_trial');
		expect(creditsChirho).toBeLessThanOrEqual(300);
		expect(revisionsChirho[0].synthesis_text_chirho.match(/"\//gu)).toHaveLength(1);
		expect(revisionsChirho[0].synthesis_text_chirho).not.toContain('[brief pause]');
		expect(revisionsChirho[0].synthesis_text_chirho).toContain('lo naˈve');
		expect(revisionsChirho[1].synthesis_text_chirho).toContain('/ˈhutos/');
		expect(revisionsChirho[1].text_chirho).toContain('Οὗτος');
		expect(() =>
			reserveChirho(revisionsChirho, [], 20001 - creditsChirho, 'flow_review_trial')
		).toThrow(/budget/);
		expect(() =>
			reserveChirho(
				[...revisionsChirho, { ...revisionsChirho[0], id_chirho: 'third-chirho' }],
				[],
				10243,
				'flow_review_trial'
			)
		).toThrow();
		expect(() =>
			reserveChirho(
				[{ ...revisionsChirho[0], synthesis_text_chirho: 'a'.repeat(301) }],
				[],
				10243,
				'flow_review_trial'
			)
		).toThrow(/budget/);
		expect(() =>
			reserveChirho(
				[{ ...revisionsChirho[1], lesson_id_chirho: 'John.1.3' }],
				[],
				10243,
				'flow_review_trial'
			)
		).toThrow(/scope/);
		expect(chapterRecipeChirho(johnChirho.verses_chirho[2], GREEK_ROUGH_RECIPE_CHIRHO)).toBeNull();
	});
	it('allows only the three new opening-verse renditions within the retained total budget', async () => {
		const oldJobsChirho = (await chapterJobsChirho(process.cwd())).rows_chirho;
		const rowsChirho = [
			[0, GREEK_ROUGH_RECIPE_CHIRHO],
			[0, GREEK_ERASMIAN_RECIPE_CHIRHO],
			[1, GREEK_ERASMIAN_RECIPE_CHIRHO]
		].map(([indexChirho, recipeChirho], positionChirho) => {
			const lessonChirho = johnChirho.verses_chirho[indexChirho as number];
			return {
				...oldJobsChirho.find(
					(jobChirho) => jobChirho.lesson_id_chirho === lessonChirho.id_chirho
				)!,
				id_chirho: `style-${positionChirho}-chirho`,
				recipe_id_chirho: recipeChirho as string,
				...chapterRecipeChirho(lessonChirho, recipeChirho)!
			};
		});
		const creditsChirho = reserveChirho(rowsChirho, [], 10382, 'john_styles_trial');
		expect(creditsChirho).toBeLessThanOrEqual(500);
		expect(rowsChirho[0].synthesis_text_chirho).toContain('/ho/');
		expect(rowsChirho[1].ipa_chirho).toContain('kʰeː');
		expect(() =>
			reserveChirho([...rowsChirho, rowsChirho[0]], [], 10382, 'john_styles_trial')
		).toThrow();
		expect(() =>
			reserveChirho(
				[rowsChirho[0], { ...rowsChirho[0], id_chirho: 'again-chirho' }],
				[],
				10382,
				'john_styles_trial'
			)
		).toThrow(/Duplicate/);
		expect(() => reserveChirho(rowsChirho, [], 20001 - creditsChirho, 'john_styles_trial')).toThrow(
			/budget/
		);
		expect(() =>
			reserveChirho(
				[{ ...rowsChirho[0], synthesis_text_chirho: 'a'.repeat(501) }],
				[],
				10382,
				'john_styles_trial'
			)
		).toThrow(/budget/);
	});
	it('keeps analysis separate from source and distinguishes qamats and silent matres', () => {
		const sourceChirho = 'בְּעֵינָֽיו׃';
		expect(hebrewPhoneticsChirho(sourceChirho)).toMatchObject({
			source_chirho: sourceChirho,
			ipa_chirho: 'beʔeˈnav'
		});
		expect(hebrewPhoneticsChirho('כָּל־').ipa_chirho).toBe('kol');
		expect(hebrewPhoneticsChirho('כָּבֽוֹד׃').ipa_chirho).toBe('kaˈvod');
		expect(() => hebrewPhoneticsChirho('בשפתו')).toThrow(/Unpointed/);
	});
	const rootsChirho: string[] = [];
	afterEach(async () => {
		vi.unstubAllGlobals();
		vi.unstubAllEnvs();
		await Promise.all(
			rootsChirho.splice(0).map((rootChirho) => rm(rootChirho, { recursive: true, force: true }))
		);
	});
	async function fixtureChirho(countChirho = 4, failureStatusChirho = 0) {
		const rootChirho = await mkdtemp(join(tmpdir(), 'hinneh-speech-chirho-'));
		rootsChirho.push(rootChirho);
		const folderChirho = join(
			rootChirho,
			'workspace-chirho/audio-chirho/audition-2026-10-30-chirho/chapter-trial-chirho'
		);
		const jobsChirho = (await chapterJobsChirho(process.cwd())).rows_chirho.slice(0, countChirho);
		const ledgerChirho = join(folderChirho, 'receipts-chirho.json');
		let postsChirho = 0;
		vi.stubEnv('ELEVENLABS_API_KEY_CHIRHO', 'test-credential-chirho');
		const fetchChirho = vi.fn(async (urlChirho: string, initChirho?: RequestInit) => {
			const pathChirho = new URL(urlChirho).pathname;
			if (initChirho?.method === 'POST') {
				// The request identity must survive a crash before the provider gets any bytes.
				const ledgerRowsChirho = JSON.parse(await readFile(ledgerChirho, 'utf8'));
				expect(
					ledgerRowsChirho.filter(
						(rowChirho: { state_chirho: string }) => rowChirho.state_chirho === 'requested'
					).length
				).toBeGreaterThan(0);
				postsChirho++;
				return failureStatusChirho
					? new Response('', { status: failureStatusChirho })
					: new Response(new Uint8Array(2000), { headers: { 'content-type': 'audio/mpeg' } });
			}
			if (pathChirho === '/v1/user/subscription')
				return Response.json({
					status: 'active',
					tier: 'creator',
					character_limit: 100000,
					character_count: 0
				});
			if (pathChirho === '/v1/models')
				return Response.json([
					{
						model_id: 'eleven_v4',
						can_do_text_to_speech: true,
						model_rates: { character_cost_multiplier: 1 }
					}
				]);
			const voicesChirho = [
				{ voice_id: 'l7Q9rbdCC6j3J5dNlOOg', rate: 1, language: 'he' },
				{ voice_id: 'WAiDT3LdFjZHIgDuqoqD', rate: 1, language: 'el' }
			];
			if (pathChirho === '/v1/voices' || pathChirho === '/v1/shared-voices')
				return Response.json({ voices: voicesChirho });
			throw new Error(`Unexpected provider route: ${pathChirho}`);
		});
		vi.stubGlobal('fetch', fetchChirho);
		return {
			rootChirho,
			folderChirho,
			jobsChirho,
			ledgerChirho,
			fetchChirho,
			postsChirho: () => postsChirho,
			planChirho: {
				mode_chirho: 'chapter_trial' as const,
				rows_chirho: jobsChirho,
				folder_chirho: folderChirho,
				prior_credits_chirho: 267,
				verify_source_chirho: async () => {}
			}
		};
	}
	it('binds both complete chapters and retains qere, maqqef and canonical source', async () => {
		const planChirho = await chapterJobsChirho(process.cwd());
		expect(planChirho.rows_chirho).toHaveLength(79);
		expect(
			planChirho.rows_chirho.slice(0, 2).map((rowChirho) => rowChirho.language_chirho)
		).toEqual(['he', 'el']);
		expect(reserveChirho(planChirho.rows_chirho, [], 267, true)).toBeLessThan(20_000 - 267);
		const firstChirho = planChirho.rows_chirho[0];
		expect(firstChirho.synthesis_text_chirho).toContain('/lo naˈve/');
		expect(firstChirho.synthesis_text_chirho).toContain('[short pause]');
		const lessonChirho = chapterChirho.verses_chirho[23];
		expect(chapterRecipeChirho(lessonChirho, firstChirho.recipe_id_chirho)).not.toBeNull();
		// Narrow the JSON verse to the recipe's Hebrew lesson shape: a checked annotation, not a cast.
		const changedChirho: Parameters<typeof chapterRecipeChirho>[0] = structuredClone(lessonChirho);
		expect(changedChirho.tokens_chirho[0].qere_chirho).toBeDefined();
		changedChirho.tokens_chirho[0].qere_chirho = [{ text_chirho: 'wrong' }];
		expect(chapterRecipeChirho(changedChirho, firstChirho.recipe_id_chirho)).toBeNull();
		expect(
			chapterRecipeChirho(
				{ ...lessonChirho, canonical_text_chirho: lessonChirho.canonical_text_chirho + ' ' },
				firstChirho.recipe_id_chirho
			)
		).toBeNull();
		for (const changedJobChirho of [
			{ ...firstChirho, lesson_id_chirho: 'Prov.25.1' },
			{ ...firstChirho, language_chirho: 'el' as const },
			{ ...firstChirho, token_id_chirho: 'word-chirho' }
		])
			expect(() => reserveChirho([changedJobChirho], [], 267, true)).toThrow();
		expect(() =>
			reserveChirho([firstChirho, { ...firstChirho, id_chirho: 'duplicate-chirho' }], [], 267, true)
		).toThrow();
		expect(() =>
			reserveChirho(
				planChirho.rows_chirho.map((rowChirho) => ({
					...rowChirho,
					synthesis_text_chirho: 'a'.repeat(1500)
				})),
				[],
				267,
				true
			)
		).toThrow(/budget/);
	});
	it('persists before charging, obeys limits and never repeats cached requests', async () => {
		const fixtureRowsChirho = await fixtureChirho(2);
		const firstChirho = await executeAudioPlanChirho(fixtureRowsChirho.rootChirho, true, {
			...fixtureRowsChirho.planChirho,
			limit_chirho: 1
		});
		expect(firstChirho).toMatchObject({ received_requests_chirho: 1, complete_chirho: false });
		expect(fixtureRowsChirho.postsChirho()).toBe(1);
		await executeAudioPlanChirho(fixtureRowsChirho.rootChirho, true, fixtureRowsChirho.planChirho);
		expect(fixtureRowsChirho.postsChirho()).toBe(2);
		expect(
			fixtureRowsChirho.fetchChirho.mock.calls.filter(
				([urlChirho]) => new URL(urlChirho).pathname === '/v1/user/subscription'
			).length
		).toBe(4);
		fixtureRowsChirho.fetchChirho.mockClear();
		expect(
			await executeAudioPlanChirho(fixtureRowsChirho.rootChirho, true, fixtureRowsChirho.planChirho)
		).toMatchObject({ cache_hit_chirho: true, complete_chirho: true });
		expect(fixtureRowsChirho.fetchChirho).not.toHaveBeenCalled();
	});
	it('retries only a bounded metadata GET after Retry-After, never a synthesis POST', async () => {
		const fixtureRowsChirho = await fixtureChirho(1);
		fixtureRowsChirho.fetchChirho.mockResolvedValueOnce(
			new Response('', { status: 429, headers: { 'retry-after': '0' } })
		);
		expect(
			await executeAudioPlanChirho(fixtureRowsChirho.rootChirho, true, fixtureRowsChirho.planChirho)
		).toMatchObject({ received_requests_chirho: 1 });
		expect(fixtureRowsChirho.postsChirho()).toBe(1);
		expect(
			fixtureRowsChirho.fetchChirho.mock.calls.filter(
				([urlChirho]) => new URL(urlChirho).pathname === '/v1/user/subscription'
			).length
		).toBe(3);
	});
	it('skips an unknown result and continues disjoint verses without resetting it', async () => {
		const fixtureRowsChirho = await fixtureChirho(2);
		const jobChirho = fixtureRowsChirho.jobsChirho[0];
		await mkdir(fixtureRowsChirho.folderChirho, { recursive: true });
		await writeFile(
			fixtureRowsChirho.ledgerChirho,
			JSON.stringify([
				{
					...receiptChirho,
					id_chirho: jobChirho.id_chirho,
					key_chirho: cacheKeyChirho(jobChirho),
					reserved_credits_chirho: [...jobChirho.synthesis_text_chirho!].length
				}
			])
		);
		expect(
			await executeAudioPlanChirho(fixtureRowsChirho.rootChirho, true, fixtureRowsChirho.planChirho)
		).toMatchObject({
			held_requests_chirho: 1,
			received_requests_chirho: 1,
			complete_chirho: false
		});
		expect(fixtureRowsChirho.postsChirho()).toBe(1);
	});
	it.each([500, 401])(
		'retains a provider hold across restart after HTTP %i',
		async (statusChirho) => {
			const fixtureRowsChirho = await fixtureChirho(4, statusChirho);
			await executeAudioPlanChirho(
				fixtureRowsChirho.rootChirho,
				true,
				fixtureRowsChirho.planChirho
			);
			expect(fixtureRowsChirho.postsChirho()).toBe(statusChirho === 500 ? 3 : 1);
			fixtureRowsChirho.fetchChirho.mockClear();
			await expect(
				executeAudioPlanChirho(fixtureRowsChirho.rootChirho, true, fixtureRowsChirho.planChirho)
			).rejects.toThrow(/reconciliation/);
			expect(fixtureRowsChirho.fetchChirho).not.toHaveBeenCalled();
		}
	);
	it('makes no request after changed source, inadequate credits or invalid scope', async () => {
		const fixtureRowsChirho = await fixtureChirho(2);
		await expect(
			executeAudioPlanChirho(fixtureRowsChirho.rootChirho, true, {
				...fixtureRowsChirho.planChirho,
				verify_source_chirho: async () => {
					throw new Error('Source changed');
				}
			})
		).rejects.toThrow(/Source/);
		expect(fixtureRowsChirho.fetchChirho).not.toHaveBeenCalled();
		fixtureRowsChirho.fetchChirho.mockResolvedValue(
			Response.json({ status: 'active', tier: 'creator', character_limit: 100, character_count: 0 })
		);
		await expect(
			executeAudioPlanChirho(fixtureRowsChirho.rootChirho, true, fixtureRowsChirho.planChirho)
		).rejects.toThrow(/overage/);
		expect(fixtureRowsChirho.postsChirho()).toBe(0);
		await expect(
			executeAudioPlanChirho(fixtureRowsChirho.rootChirho, true, {
				...fixtureRowsChirho.planChirho,
				folder_chirho: fixtureRowsChirho.rootChirho
			})
		).rejects.toThrow(/escapes/);
	});
});
