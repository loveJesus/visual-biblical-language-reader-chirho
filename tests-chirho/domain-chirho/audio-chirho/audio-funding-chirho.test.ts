// For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life. — John 3:16 (KJV)
import { afterEach, describe, expect, it, vi } from 'vitest';
import { mkdtemp, mkdir, readFile, readdir, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import {
	AUDIO_PRODUCTION_CEILING_CHIRHO,
	AudioBudgetErrorChirho,
	cacheKeyChirho,
	executeAudioPlanChirho,
	fundedCreditsChirho,
	reserveChirho,
	sha256Chirho,
	synthesisTextChirho,
	type AudioFundingChirho,
	type AudioJobChirho,
	type ReceiptChirho
} from '../../../scripts-chirho/audio-chirho/audition_chirho';
import {
	EXTRA_FUNDING_PATH_CHIRHO,
	EXTRA_KEY_NAME_CHIRHO,
	FundingRefusalChirho,
	isExtraEligibleChirho,
	readExtraFundingChirho,
	selectFundedRowsChirho
} from '../../../scripts-chirho/audio-chirho/production-chirho/funding_chirho';
import {
	BIBLE_WORD_HOME_CHIRHO,
	ORIGINAL_WORD_HOME_CHIRHO
} from '../../../scripts-chirho/audio-chirho/production-chirho/global_budget_chirho';
import {
	holdKindChirho,
	runWordsChirho,
	WordSourceRefusalChirho
} from '../../../scripts-chirho/audio-chirho/production-chirho/run_words_chirho';
import type { LibraryWordChirho } from '../../../scripts-chirho/audio-chirho/production-chirho/prepare_words_chirho';

const EXTRA_SECRET_CHIRHO = 'extra-secret-value-chirho';
const PRIMARY_SECRET_CHIRHO = 'primary-secret-value-chirho';
const fundingChirho: AudioFundingChirho = {
	id_chirho: 'extra-key-2026-11-03-chirho',
	key_name_chirho: EXTRA_KEY_NAME_CHIRHO,
	maximum_total_credits_chirho: 401_000,
	additional_credits_chirho: 131_000,
	pool_prior_credits_chirho: 0
};
const authorityChirho = {
	schema_version_chirho: 1,
	id_chirho: 'extra-key-2026-11-03-chirho',
	key_name_chirho: EXTRA_KEY_NAME_CHIRHO,
	authority_chirho: 'Test copy of the fixed extra-key allowance.',
	historical_ceiling_chirho: 270000,
	additional_credits_chirho: 131000,
	maximum_total_credits_chirho: 401000,
	included_only_chirho: true,
	language_chirho: 'he',
	measured_subscription_chirho: {
		status_chirho: 'active',
		tier_chirho: 'creator',
		character_count_chirho: 0,
		character_limit_chirho: 131000,
		can_extend_character_limit_chirho: false
	}
};
// Unchanged rows from the first mixed whole-Bible word plan, kept as a public fixture so the
// test needs no private workspace: no receipts, requests, funding authority or credentials.
const planWordsChirho: LibraryWordChirho[] = JSON.parse(
	await readFile(
		join(import.meta.dirname, '../../fixtures-chirho/audio-chirho/whole-bible-words-chirho.json'),
		'utf8'
	)
).words_chirho;
const hebrewChirho = planWordsChirho.filter((wordChirho) =>
	isExtraEligibleChirho(wordChirho.job_chirho)
);
const greekChirho = planWordsChirho.filter(
	(wordChirho) => wordChirho.job_chirho.language_chirho === 'el'
);
const [he1Chirho, he2Chirho, he3Chirho] = hebrewChirho.map((wordChirho) => wordChirho.job_chirho);
const el1Chirho = greekChirho[0].job_chirho;
const costChirho = (jobChirho: AudioJobChirho) => [...synthesisTextChirho(jobChirho)].length;
function receivedReceiptChirho(jobChirho: AudioJobChirho, fundedChirho = false): ReceiptChirho {
	const keyChirho = cacheKeyChirho(jobChirho);
	return {
		id_chirho: jobChirho.id_chirho,
		key_chirho: keyChirho,
		reserved_credits_chirho: costChirho(jobChirho),
		state_chirho: 'received',
		path_chirho: `${jobChirho.id_chirho}-${keyChirho.slice(0, 12)}-chirho.mp3`,
		sha256_chirho: 'a'.repeat(64),
		bytes_chirho: 2000,
		voice_id_chirho:
			jobChirho.language_chirho === 'he' ? 'l7Q9rbdCC6j3J5dNlOOg' : 'WAiDT3LdFjZHIgDuqoqD',
		voice_name_chirho:
			jobChirho.language_chirho === 'he'
				? 'Itamar - Israeli Hebrew Narrator'
				: 'Angelos - Warm & Expressive Narrator',
		...(fundedChirho
			? {
					funding_id_chirho: fundingChirho.id_chirho,
					funding_key_name_chirho: EXTRA_KEY_NAME_CHIRHO
				}
			: {})
	};
}

const rootsChirho: string[] = [];
afterEach(async () => {
	vi.unstubAllGlobals();
	vi.unstubAllEnvs();
	vi.restoreAllMocks();
	await Promise.all(
		rootsChirho.splice(0).map((rootChirho) => rm(rootChirho, { recursive: true, force: true }))
	);
});
async function rootChirho() {
	const pathChirho = await mkdtemp(join(tmpdir(), 'hinneh-funding-chirho-'));
	rootsChirho.push(pathChirho);
	return pathChirho;
}
async function writeAuthorityChirho(rootPathChirho: string, valueChirho: unknown) {
	const pathChirho = join(rootPathChirho, EXTRA_FUNDING_PATH_CHIRHO);
	await mkdir(join(pathChirho, '..'), { recursive: true });
	await writeFile(
		pathChirho,
		typeof valueChirho === 'string' ? valueChirho : JSON.stringify(valueChirho)
	);
}

describe('separately funded Hebrew IPA word production', () => {
	it('keeps the original 270,000 production ceiling without explicit funding', () => {
		expect(AUDIO_PRODUCTION_CEILING_CHIRHO).toBe(270_000);
		const fitChirho = 270_000 - costChirho(he1Chirho);
		expect(reserveChirho([he1Chirho], [], fitChirho, 'production')).toBe(costChirho(he1Chirho));
		expect(() => reserveChirho([he1Chirho], [], fitChirho + 1, 'production')).toThrow(
			AudioBudgetErrorChirho
		);
		expect(() =>
			reserveChirho([he1Chirho], [], 0, true, { funding_chirho: fundingChirho })
		).toThrow(/Separate funding/);
	});

	it('allows only the explicit additional allowance, by pool and by total', () => {
		const optionsChirho = { funding_chirho: fundingChirho, eligible_chirho: isExtraEligibleChirho };
		expect(reserveChirho([he1Chirho], [], 269_903, 'production', optionsChirho)).toBe(
			costChirho(he1Chirho)
		);
		const poolFullChirho = {
			...optionsChirho,
			funding_chirho: {
				...fundingChirho,
				pool_prior_credits_chirho: 131_000 - costChirho(he1Chirho) + 1
			}
		};
		expect(() => reserveChirho([he1Chirho], [], 269_903, 'production', poolFullChirho)).toThrow(
			AudioBudgetErrorChirho
		);
		expect(() =>
			reserveChirho(
				[he1Chirho],
				[],
				401_000 - costChirho(he1Chirho) + 1,
				'production',
				optionsChirho
			)
		).toThrow(AudioBudgetErrorChirho);
		for (const invalidChirho of [
			{ ...fundingChirho, maximum_total_credits_chirho: 270_000 },
			{ ...fundingChirho, pool_prior_credits_chirho: 131_001 },
			{ ...fundingChirho, key_name_chirho: 'not a name' }
		])
			expect(() =>
				reserveChirho([he1Chirho], [], 0, 'production', { funding_chirho: invalidChirho })
			).toThrow(/Separate funding/);
	});

	it('reserves nothing for unselected Greek rows and keeps legacy receipts valid', () => {
		const optionsChirho = { funding_chirho: fundingChirho, eligible_chirho: isExtraEligibleChirho };
		expect(reserveChirho([he1Chirho, el1Chirho], [], 0, 'production', optionsChirho)).toBe(
			costChirho(he1Chirho)
		);
		// A legacy (unfunded) Greek receipt counts toward the total but not the extra pool.
		const exactPoolChirho = {
			...optionsChirho,
			funding_chirho: {
				...fundingChirho,
				pool_prior_credits_chirho: 131_000 - costChirho(he1Chirho)
			}
		};
		expect(
			reserveChirho(
				[he1Chirho, el1Chirho],
				[receivedReceiptChirho(el1Chirho)],
				0,
				'production',
				exactPoolChirho
			)
		).toBe(costChirho(he1Chirho) + costChirho(el1Chirho));
		expect(() =>
			reserveChirho(
				[he1Chirho],
				[{ ...receivedReceiptChirho(he1Chirho, true), funding_key_name_chirho: 'bad name' }],
				0,
				'production',
				optionsChirho
			)
		).toThrow(/funding evidence/);
	});

	it('validates the exact fixed authority and its named credential', async () => {
		const validRootChirho = await rootChirho();
		await writeAuthorityChirho(validRootChirho, authorityChirho);
		const poolChirho = await readExtraFundingChirho(validRootChirho, {
			[EXTRA_KEY_NAME_CHIRHO]: EXTRA_SECRET_CHIRHO
		});
		expect(poolChirho).toEqual(fundingChirho);
		expect(JSON.stringify(poolChirho)).not.toContain(EXTRA_SECRET_CHIRHO);
		await expect(
			readExtraFundingChirho(await rootChirho(), { [EXTRA_KEY_NAME_CHIRHO]: EXTRA_SECRET_CHIRHO })
		).rejects.toThrow(/authority missing/);
		const subscriptionChirho = authorityChirho.measured_subscription_chirho;
		for (const changedChirho of [
			{ ...authorityChirho, additional_credits_chirho: 131_001 },
			{ ...authorityChirho, maximum_total_credits_chirho: 401_001 },
			{ ...authorityChirho, historical_ceiling_chirho: 270_001 },
			{ ...authorityChirho, included_only_chirho: false },
			{ ...authorityChirho, language_chirho: 'el' },
			{ ...authorityChirho, key_name_chirho: 'ELEVENLABS_API_KEY_CHIRHO' },
			{ ...authorityChirho, id_chirho: 'another-pool-chirho' },
			{ ...authorityChirho, schema_version_chirho: 2 },
			{ ...authorityChirho, unexpected_chirho: true },
			{
				...authorityChirho,
				measured_subscription_chirho: {
					...subscriptionChirho,
					can_extend_character_limit_chirho: true
				}
			},
			{
				...authorityChirho,
				measured_subscription_chirho: { ...subscriptionChirho, character_limit_chirho: 500_000 }
			},
			'{ not json',
			JSON.stringify({ ...authorityChirho, authority_chirho: 'x'.repeat(5000) })
		]) {
			const changedRootChirho = await rootChirho();
			await writeAuthorityChirho(changedRootChirho, changedChirho);
			await expect(
				readExtraFundingChirho(changedRootChirho, { [EXTRA_KEY_NAME_CHIRHO]: EXTRA_SECRET_CHIRHO })
			).rejects.toThrow(FundingRefusalChirho);
		}
		for (const environmentChirho of [{}, { [EXTRA_KEY_NAME_CHIRHO]: '   ' }])
			await expect(readExtraFundingChirho(validRootChirho, environmentChirho)).rejects.toThrow(
				`${EXTRA_KEY_NAME_CHIRHO} missing`
			);
	});

	it('selects only Israeli-Hebrew IPA rows that fit the remaining allowance', () => {
		expect(isExtraEligibleChirho(he1Chirho)).toBe(true);
		expect(isExtraEligibleChirho(el1Chirho)).toBe(false);
		expect(isExtraEligibleChirho({ ...he1Chirho, recipe_id_chirho: 'another-chirho' })).toBe(false);
		const rowsChirho = [he1Chirho, el1Chirho, he2Chirho, he3Chirho];
		const fitChirho = costChirho(he1Chirho) + costChirho(he2Chirho);
		const poolChirho = selectFundedRowsChirho(rowsChirho, [], fitChirho, 200);
		expect([...poolChirho.selected_ids_chirho]).toEqual([he1Chirho.id_chirho, he2Chirho.id_chirho]);
		expect(poolChirho.pending_ids_chirho).toHaveLength(3);
		expect(poolChirho.exhausted_chirho).toBe(true);
		const limitedChirho = selectFundedRowsChirho(rowsChirho, [], 131_000, 1);
		expect([...limitedChirho.selected_ids_chirho]).toEqual([he1Chirho.id_chirho]);
		expect(limitedChirho.exhausted_chirho).toBe(false);
		const doneChirho = selectFundedRowsChirho(
			rowsChirho,
			[{ ...receivedReceiptChirho(he1Chirho, true), state_chirho: 'requested' }],
			131_000,
			200
		);
		expect(doneChirho.pending_ids_chirho).not.toContain(he1Chirho.id_chirho);
	});

	it('classifies exhausted pools and quotas apart from malformed or changed work', () => {
		expect(holdKindChirho(new AudioBudgetErrorChirho('ledger', 'x'))).toBe('funding_exhausted');
		expect(holdKindChirho(new AudioBudgetErrorChirho('quota', 'x'))).toBe('quota_exhausted');
		expect(holdKindChirho(new WordSourceRefusalChirho('Word context changed'))).toBe(
			'source_changed'
		);
		expect(
			holdKindChirho(
				new Error(
					'Prior repeated speech failures require owner reconciliation; no automatic restart'
				)
			)
		).toBe('provider_hold');
		expect(holdKindChirho(new FundingRefusalChirho('x'))).toBe('refused');
	});
});

describe('funded provider requests', () => {
	async function providerFixtureChirho(
		rowsChirho: AudioJobChirho[],
		subscriptionChirho: Record<string, unknown> = {},
		failedTextsChirho: string[] = []
	) {
		const rootPathChirho = await rootChirho();
		const folderChirho = join(
			rootPathChirho,
			BIBLE_WORD_HOME_CHIRHO,
			'batches-chirho/0000-chirho/batch-0000-chirho'
		);
		vi.stubEnv('ELEVENLABS_API_KEY_CHIRHO', PRIMARY_SECRET_CHIRHO);
		vi.stubEnv(EXTRA_KEY_NAME_CHIRHO, EXTRA_SECRET_CHIRHO);
		const postsChirho: { text_chirho: string; key_chirho: string | null }[] = [];
		const keysChirho = new Set<string | null>();
		const fetchChirho = vi.fn(async (urlChirho: string, initChirho?: RequestInit) => {
			const pathChirho = new URL(urlChirho).pathname;
			const keyChirho = new Headers(initChirho?.headers).get('xi-api-key');
			keysChirho.add(keyChirho);
			if (initChirho?.method === 'POST') {
				const textChirho = JSON.parse(String(initChirho.body)).text;
				postsChirho.push({ text_chirho: textChirho, key_chirho: keyChirho });
				return failedTextsChirho.includes(textChirho)
					? new Response('', { status: 500 })
					: new Response(new Uint8Array(2000), { headers: { 'content-type': 'audio/mpeg' } });
			}
			if (pathChirho === '/v1/user/subscription')
				return Response.json({
					status: 'active',
					tier: 'creator',
					character_limit: 131_000,
					character_count: 0,
					can_extend_character_limit: false,
					...subscriptionChirho
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
		const planChirho = {
			mode_chirho: 'production' as const,
			rows_chirho: rowsChirho,
			folder_chirho: folderChirho,
			prior_credits_chirho: 269_903,
			verify_source_chirho: async () => {},
			funding_chirho: fundingChirho,
			eligible_chirho: isExtraEligibleChirho
		};
		const evidenceChirho = async () =>
			(
				await Promise.all(
					(await readdir(folderChirho))
						.filter((nameChirho) => nameChirho.endsWith('.json'))
						.map((nameChirho) => readFile(join(folderChirho, nameChirho), 'utf8'))
				)
			).join('\n');
		return {
			rootPathChirho,
			folderChirho,
			fetchChirho,
			postsChirho,
			keysChirho,
			planChirho,
			evidenceChirho
		};
	}

	it('requests only Hebrew with the extra key and records its name, never a value', async () => {
		const logChirho = vi.spyOn(console, 'log');
		const errorChirho = vi.spyOn(console, 'error');
		const fixtureChirho = await providerFixtureChirho([he1Chirho, el1Chirho, he2Chirho]);
		expect(
			await executeAudioPlanChirho(fixtureChirho.rootPathChirho, false, fixtureChirho.planChirho)
		).toMatchObject({
			dry_run_chirho: true,
			reserved_credits_chirho: costChirho(he1Chirho) + costChirho(he2Chirho),
			maximum_credits_chirho: 401_000
		});
		expect(fixtureChirho.fetchChirho).not.toHaveBeenCalled();
		await executeAudioPlanChirho(fixtureChirho.rootPathChirho, true, fixtureChirho.planChirho);
		expect(fixtureChirho.postsChirho.map((rowChirho) => rowChirho.text_chirho)).toEqual([
			synthesisTextChirho(he1Chirho),
			synthesisTextChirho(he2Chirho)
		]);
		expect([...fixtureChirho.keysChirho]).toEqual([EXTRA_SECRET_CHIRHO]);
		const receiptsChirho: ReceiptChirho[] = JSON.parse(
			await readFile(join(fixtureChirho.folderChirho, 'receipts-chirho.json'), 'utf8')
		);
		expect(receiptsChirho.map((rowChirho) => rowChirho.id_chirho)).toEqual([
			he1Chirho.id_chirho,
			he2Chirho.id_chirho
		]);
		expect(
			receiptsChirho.every(
				(rowChirho) =>
					rowChirho.funding_id_chirho === fundingChirho.id_chirho &&
					rowChirho.funding_key_name_chirho === EXTRA_KEY_NAME_CHIRHO &&
					rowChirho.state_chirho === 'received'
			)
		).toBe(true);
		expect(fundedCreditsChirho(receiptsChirho, fundingChirho.id_chirho)).toBe(
			costChirho(he1Chirho) + costChirho(he2Chirho)
		);
		const evidenceChirho = await fixtureChirho.evidenceChirho();
		const loggedChirho = JSON.stringify([...logChirho.mock.calls, ...errorChirho.mock.calls]);
		for (const secretChirho of [EXTRA_SECRET_CHIRHO, PRIMARY_SECRET_CHIRHO]) {
			expect(evidenceChirho).not.toContain(secretChirho);
			expect(loggedChirho).not.toContain(secretChirho);
		}
		fixtureChirho.fetchChirho.mockClear();
		expect(
			await executeAudioPlanChirho(fixtureChirho.rootPathChirho, true, fixtureChirho.planChirho)
		).toMatchObject({ no_request_needed_chirho: true });
		expect(fixtureChirho.fetchChirho).not.toHaveBeenCalled();
	});

	it('retains an unknown funded reservation and never repeats its synthesis', async () => {
		const fixtureChirho = await providerFixtureChirho([he1Chirho, he2Chirho], {}, [
			synthesisTextChirho(he1Chirho)
		]);
		const rootPathChirho = fixtureChirho.rootPathChirho;
		await executeAudioPlanChirho(rootPathChirho, true, fixtureChirho.planChirho);
		expect(fixtureChirho.postsChirho).toHaveLength(2);
		const receiptsChirho: ReceiptChirho[] = JSON.parse(
			await readFile(join(fixtureChirho.folderChirho, 'receipts-chirho.json'), 'utf8')
		);
		expect(receiptsChirho.map((rowChirho) => rowChirho.state_chirho)).toEqual([
			'requested',
			'received'
		]);
		expect(fundedCreditsChirho(receiptsChirho, fundingChirho.id_chirho)).toBe(
			costChirho(he1Chirho) + costChirho(he2Chirho)
		);
		fixtureChirho.fetchChirho.mockClear();
		await executeAudioPlanChirho(rootPathChirho, true, fixtureChirho.planChirho);
		expect(fixtureChirho.fetchChirho).not.toHaveBeenCalled();
		expect(fixtureChirho.postsChirho).toHaveLength(2);
	});

	it('refuses an exhausted quota, an overage-capable account, a full pool or a missing key', async () => {
		const quotaChirho = await providerFixtureChirho([he1Chirho], { character_count: 130_500 });
		const errorChirho = await executeAudioPlanChirho(
			quotaChirho.rootPathChirho,
			true,
			quotaChirho.planChirho
		).catch((errorChirho) => errorChirho);
		expect(errorChirho).toBeInstanceOf(AudioBudgetErrorChirho);
		expect((errorChirho as AudioBudgetErrorChirho).kindChirho).toBe('quota');
		expect(quotaChirho.postsChirho).toHaveLength(0);

		const overageChirho = await providerFixtureChirho([he1Chirho], {
			can_extend_character_limit: true
		});
		await expect(
			executeAudioPlanChirho(overageChirho.rootPathChirho, true, overageChirho.planChirho)
		).rejects.toThrow(/overage/);
		expect(overageChirho.postsChirho).toHaveLength(0);

		const poolChirho = await providerFixtureChirho([he1Chirho]);
		await expect(
			executeAudioPlanChirho(poolChirho.rootPathChirho, true, {
				...poolChirho.planChirho,
				funding_chirho: { ...fundingChirho, pool_prior_credits_chirho: 131_000 }
			})
		).rejects.toThrow(AudioBudgetErrorChirho);
		expect(poolChirho.fetchChirho).not.toHaveBeenCalled();

		const keyChirho = await providerFixtureChirho([he1Chirho]);
		vi.stubEnv(EXTRA_KEY_NAME_CHIRHO, '');
		const missingChirho = await executeAudioPlanChirho(
			keyChirho.rootPathChirho,
			true,
			keyChirho.planChirho
		).catch((errorChirho) => errorChirho);
		expect(String(missingChirho)).toContain(`${EXTRA_KEY_NAME_CHIRHO} missing`);
		expect(String(missingChirho)).not.toContain(PRIMARY_SECRET_CHIRHO);
		expect(keyChirho.fetchChirho).not.toHaveBeenCalled();
	});
});

describe('word producer funded mode', () => {
	async function ledgerRootChirho(correctionCreditsChirho = 0) {
		const rootPathChirho = await rootChirho();
		const pathChirho = 'batches-chirho/0000-chirho/batch-0000-chirho/plan-chirho.json';
		const wordsChirho = [hebrewChirho[0], greekChirho[0], hebrewChirho[1]];
		const planChirho = JSON.stringify({ words_chirho: wordsChirho });
		const folderChirho = join(
			rootPathChirho,
			BIBLE_WORD_HOME_CHIRHO,
			'batches-chirho/0000-chirho/batch-0000-chirho'
		);
		await mkdir(folderChirho, { recursive: true });
		await writeFile(join(folderChirho, 'plan-chirho.json'), planChirho);
		await writeFile(
			join(folderChirho, 'receipts-chirho.json'),
			JSON.stringify([receivedReceiptChirho(el1Chirho)])
		);
		await writeFile(
			join(rootPathChirho, BIBLE_WORD_HOME_CHIRHO, 'index-chirho.json'),
			JSON.stringify({
				schema_version_chirho: 1,
				maximum_total_credits_chirho: 270000,
				historical_reserved_credits_chirho: 10660,
				word_count_chirho: 3,
				occurrence_count_chirho: 3,
				held_occurrences_chirho: 0,
				estimated_new_credits_chirho: 30,
				batches_chirho: [
					{ path_chirho: pathChirho, sha256_chirho: sha256Chirho(planChirho), count_chirho: 3 }
				]
			})
		);
		if (correctionCreditsChirho) {
			const correctionChirho = join(
				rootPathChirho,
				ORIGINAL_WORD_HOME_CHIRHO,
				'corrections-chirho/test-chirho'
			);
			await mkdir(correctionChirho, { recursive: true });
			await writeFile(
				join(correctionChirho, 'receipts-chirho.json'),
				JSON.stringify([{ reserved_credits_chirho: correctionCreditsChirho }])
			);
		}
		await writeAuthorityChirho(rootPathChirho, authorityChirho);
		return rootPathChirho;
	}

	it('plans only Hebrew under the authority and leaves the default dry run unchanged', async () => {
		vi.stubEnv(EXTRA_KEY_NAME_CHIRHO, EXTRA_SECRET_CHIRHO);
		const rootPathChirho = await ledgerRootChirho();
		const fundedChirho = await runWordsChirho(rootPathChirho, false, 20000, true, true);
		expect(fundedChirho).toMatchObject({
			dry_run_chirho: true,
			reserved_credits_chirho: 10660 + costChirho(el1Chirho),
			funding_id_chirho: fundingChirho.id_chirho,
			funding_key_name_chirho: EXTRA_KEY_NAME_CHIRHO,
			funding_reserved_credits_chirho: 0,
			funding_limit_credits_chirho: 131_000,
			maximum_total_credits_chirho: 401_000,
			pending_hebrew_words_chirho: 2,
			pending_hebrew_credits_chirho: costChirho(he1Chirho) + costChirho(he2Chirho)
		});
		expect(JSON.stringify(fundedChirho)).not.toContain(EXTRA_SECRET_CHIRHO);
		const defaultChirho = await runWordsChirho(rootPathChirho, false, 20000, true);
		expect(defaultChirho).not.toHaveProperty('funding_id_chirho');
		expect(defaultChirho).toMatchObject({ reserved_credits_chirho: 10660 + costChirho(el1Chirho) });
		await expect(runWordsChirho(rootPathChirho, false, 20000, false, true)).rejects.toThrow(
			/whole-bible/
		);
	});

	it('keeps the default 270,000 refusal while the authorized mode can continue', async () => {
		vi.stubEnv(EXTRA_KEY_NAME_CHIRHO, EXTRA_SECRET_CHIRHO);
		const rootPathChirho = await ledgerRootChirho(259_500);
		const defaultChirho = await runWordsChirho(rootPathChirho, false, 20000, true).catch(
			(errorChirho) => errorChirho
		);
		expect(String(defaultChirho)).toMatch(/exceed the fixed ceiling/);
		expect(holdKindChirho(defaultChirho)).toBe('funding_exhausted');
		expect(await runWordsChirho(rootPathChirho, false, 20000, true, true)).toMatchObject({
			reserved_credits_chirho: 10660 + 259_500 + costChirho(el1Chirho),
			maximum_total_credits_chirho: 401_000
		});
	});

	it('refuses a missing key or malformed ledger and labels the malformed hold', async () => {
		const rootPathChirho = await ledgerRootChirho();
		vi.stubEnv(EXTRA_KEY_NAME_CHIRHO, '');
		await expect(runWordsChirho(rootPathChirho, false, 20000, true, true)).rejects.toThrow(
			`${EXTRA_KEY_NAME_CHIRHO} missing`
		);
		vi.stubEnv(EXTRA_KEY_NAME_CHIRHO, EXTRA_SECRET_CHIRHO);
		const indexPathChirho = join(rootPathChirho, BIBLE_WORD_HOME_CHIRHO, 'index-chirho.json');
		const changedChirho = JSON.parse(await readFile(indexPathChirho, 'utf8'));
		await writeFile(
			indexPathChirho,
			JSON.stringify({ ...changedChirho, historical_reserved_credits_chirho: 1 })
		);
		const malformedChirho = await runWordsChirho(rootPathChirho, false, 20000, true, true).catch(
			(errorChirho) => errorChirho
		);
		expect(holdKindChirho(malformedChirho)).toBe('malformed');
	});
});
