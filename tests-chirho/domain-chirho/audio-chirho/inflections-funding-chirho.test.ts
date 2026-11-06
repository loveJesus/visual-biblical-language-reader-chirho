// For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life. — John 3:16 (KJV)
import { afterEach, describe, expect, it, vi } from 'vitest';
import {
	mkdtemp as mkdtempChirho,
	mkdir as mkdirChirho,
	writeFile as writeFileChirho,
	readFile as readFileChirho,
	rm as rmChirho
} from 'node:fs/promises';
import { tmpdir as tmpdirChirho } from 'node:os';
import { join as joinChirho } from 'node:path';
import {
	sha256Chirho,
	cacheKeyChirho,
	reserveChirho,
	executeAudioPlanChirho,
	synthesisTextChirho,
	type AudioJobChirho,
	type ReceiptChirho
} from '../../../scripts-chirho/audio-chirho/audition_chirho';
import {
	accountedReceiptCreditsChirho,
	receiptFingerprintChirho,
	receiptIdentityChirho,
	type AudioSettlementChirho
} from '../../../scripts-chirho/audio-chirho/production-chirho/credit_accounting_chirho';
import { isExtraEligibleChirho } from '../../../scripts-chirho/audio-chirho/production-chirho/funding_chirho';
import {
	INFLECTION_HOME_CHIRHO,
	INFLECTION_KEY_CHIRHO,
	INFLECTION_ID_CHIRHO,
	INFLECTION_LIMIT_CHIRHO,
	validateInflectionAuthorityChirho,
	validateInflectionAccountChirho,
	readInflectionAuthorityChirho,
	inflectionFundingChirho,
	type InflectionAuthorityChirho
} from '../../../scripts-chirho/audio-chirho/production-chirho/inflections-chirho/funding_chirho';
const authorityChirho: InflectionAuthorityChirho = {
	schema_version_chirho: 1,
	id_chirho: INFLECTION_ID_CHIRHO,
	authorized_chirho: true,
	authority_chirho: 'Dedicated included-credit fixture pass',
	key_name_chirho: INFLECTION_KEY_CHIRHO,
	included_only_chirho: true,
	maximum_requests_chirho: 3343,
	maximum_raw_credits_chirho: 42483,
	maximum_total_credits_chirho: 443483,
	account_id_sha256_chirho: sha256Chirho('fixture-account-chirho'),
	baseline_usage_chirho: 0,
	character_limit_chirho: 131000,
	reset_unix_chirho: 1796586535,
	snapshot_sha256_chirho: 'a'.repeat(64),
	index_sha256_chirho: 'b'.repeat(64),
	original_ledger_sha256_chirho: 'c'.repeat(64),
	previous_authority_sha256_chirho: 'd'.repeat(64)
};
const subscriptionChirho = {
	status: 'active',
	tier: 'creator',
	character_count: 0,
	character_limit: 131000,
	can_extend_character_limit: false,
	next_character_count_reset_unix: 1796586535
};
const oldSettlementChirho: AudioSettlementChirho = {
	id_chirho: 'sealed-old-account-chirho',
	reset_unix_chirho: 1796331115,
	receipt_charges_chirho: new Map()
};
const wordsChirho = JSON.parse(
	await readFileChirho(
		joinChirho(
			import.meta.dirname,
			'../../fixtures-chirho/audio-chirho/whole-bible-words-chirho.json'
		),
		'utf8'
	)
).words_chirho as { job_chirho: AudioJobChirho }[];
const hebrewChirho = wordsChirho
		.map((wordChirho) => wordChirho.job_chirho)
		.filter(isExtraEligibleChirho),
	greekChirho = wordsChirho
		.map((wordChirho) => wordChirho.job_chirho)
		.find((jobChirho) => jobChirho.language_chirho === 'el')!;
const costChirho = (jobChirho: AudioJobChirho) => [...synthesisTextChirho(jobChirho)].length;
const rootsChirho: string[] = [];
afterEach(async () => {
	vi.unstubAllGlobals();
	vi.unstubAllEnvs();
	vi.restoreAllMocks();
	await Promise.all(
		rootsChirho
			.splice(0)
			.map((rootChirho) => rmChirho(rootChirho, { recursive: true, force: true }))
	);
});
async function temporaryChirho() {
	const pathChirho = await mkdtempChirho(joinChirho(tmpdirChirho(), 'inflections-test-chirho-'));
	rootsChirho.push(pathChirho);
	return pathChirho;
}
describe('a separately identified included-credit inflection pass', () => {
	it('requires the dedicated key and the fixed scope rather than a primary fallback', async () => {
		const rootChirho = await temporaryChirho(),
			homeChirho = joinChirho(rootChirho, INFLECTION_HOME_CHIRHO);
		await mkdirChirho(homeChirho, { recursive: true });
		await writeFileChirho(
			joinChirho(homeChirho, 'authority-chirho.json'),
			JSON.stringify(authorityChirho)
		);
		await expect(
			readInflectionAuthorityChirho(rootChirho, { ELEVENLABS_API_KEY_CHIRHO: 'primary-chirho' })
		).rejects.toThrow(/Dedicated/);
		await expect(
			readInflectionAuthorityChirho(rootChirho, { [INFLECTION_KEY_CHIRHO]: 'new-account-chirho' })
		).resolves.toEqual(authorityChirho);
		for (const changeChirho of [
			{ maximum_requests_chirho: 3344 },
			{ maximum_raw_credits_chirho: 42484 },
			{ maximum_total_credits_chirho: 443484 },
			{ key_name_chirho: 'ELEVENLABS_API_KEY_EXTRA_CHIRHO' },
			{ included_only_chirho: false },
			{ reset_unix_chirho: 1796586536 },
			{ baseline_usage_chirho: 1 },
			{ original_ledger_sha256_chirho: 'missing' }
		])
			expect(() =>
				validateInflectionAuthorityChirho({
					...authorityChirho,
					...changeChirho
				} as InflectionAuthorityChirho)
			).toThrow();
	});
	it('rejects another account, a new cycle, overages, excess usage and insufficient included balance', () => {
		expect(() =>
			validateInflectionAccountChirho(
				authorityChirho,
				{ user_id: 'fixture-account-chirho' },
				subscriptionChirho
			)
		).not.toThrow();
		expect(() =>
			validateInflectionAccountChirho(
				authorityChirho,
				{ user_id: 'another-account-chirho' },
				subscriptionChirho
			)
		).toThrow();
		for (const changeChirho of [
			{ next_character_count_reset_unix: 1796586536 },
			{ can_extend_character_limit: true },
			{ character_count: 42484 },
			{ character_count: 130500 },
			{ status: 'past_due' },
			{ character_limit: 132000 }
		])
			expect(() =>
				validateInflectionAccountChirho(
					authorityChirho,
					{ user_id: 'fixture-account-chirho' },
					{ ...subscriptionChirho, ...changeChirho }
				)
			).toThrow();
	});
	it('keeps sealed old charges while the new pool reserves the full pass outside each batch', () => {
		const jobChirho = hebrewChirho[0],
			receiptChirho: ReceiptChirho = {
				id_chirho: jobChirho.id_chirho,
				key_chirho: cacheKeyChirho(jobChirho),
				state_chirho: 'received',
				reserved_credits_chirho: costChirho(jobChirho),
				path_chirho: `${jobChirho.id_chirho}-${cacheKeyChirho(jobChirho).slice(0, 12)}-chirho.mp3`,
				sha256_chirho: 'a'.repeat(64),
				bytes_chirho: 2000,
				funding_id_chirho: 'extra-key-2026-11-03-chirho',
				funding_key_name_chirho: 'ELEVENLABS_API_KEY_EXTRA_CHIRHO',
				voice_id_chirho: 'l7Q9rbdCC6j3J5dNlOOg',
				voice_name_chirho: 'Itamar - Israeli Hebrew Narrator'
			};
		const settledChirho = {
			...oldSettlementChirho,
			receipt_charges_chirho: new Map([
				[
					receiptIdentityChirho(receiptChirho),
					{
						receipt_sha256_chirho: receiptFingerprintChirho(receiptChirho),
						accounted_credits_chirho: 1
					}
				]
			])
		};
		const newJobChirho = hebrewChirho[1],
			fundingChirho = inflectionFundingChirho(
				authorityChirho,
				settledChirho,
				costChirho(newJobChirho)
			);
		expect(accountedReceiptCreditsChirho(receiptChirho, fundingChirho)).toBe(1);
		expect(fundingChirho.pool_prior_credits_chirho).toBe(
			INFLECTION_LIMIT_CHIRHO - costChirho(newJobChirho)
		);
		const optionsChirho = { funding_chirho: fundingChirho, eligible_chirho: isExtraEligibleChirho },
			priorChirho = 443483 - 1 - costChirho(newJobChirho);
		expect(
			reserveChirho(
				[jobChirho, newJobChirho],
				[receiptChirho],
				priorChirho,
				'production',
				optionsChirho
			)
		).toBe(1 + costChirho(newJobChirho));
		expect(() =>
			reserveChirho(
				[jobChirho, newJobChirho],
				[receiptChirho],
				priorChirho + 1,
				'production',
				optionsChirho
			)
		).toThrow();
		expect(() =>
			accountedReceiptCreditsChirho({ ...receiptChirho, state_chirho: 'requested' }, fundingChirho)
		).toThrow();
		expect(() =>
			accountedReceiptCreditsChirho(
				{ ...receiptChirho, reserved_credits_chirho: 100 },
				fundingChirho
			)
		).toThrow();
		expect(
			accountedReceiptCreditsChirho(
				{ ...receiptChirho, funding_id_chirho: 'unsettled-chirho' },
				fundingChirho
			)
		).toBe(costChirho(jobChirho));
	});
});
async function providerChirho(
	jobChirho: AudioJobChirho,
	subscriptionChangeChirho: Record<string, unknown> = {},
	failChirho = false
) {
	const rootChirho = await temporaryChirho(),
		folderChirho = joinChirho(
			rootChirho,
			'workspace-chirho/audio-chirho/production-bible-2026-11-02-chirho/batches-chirho/0000-chirho/batch-0000-chirho'
		);
	vi.stubEnv(INFLECTION_KEY_CHIRHO, 'dedicated-value-chirho');
	vi.stubEnv('ELEVENLABS_API_KEY_CHIRHO', 'primary-value-chirho');
	const postsChirho: string[] = [],
		keysChirho = new Set<string | null>();
	vi.stubGlobal(
		'fetch',
		vi.fn(async (urlChirho: string, initChirho?: RequestInit) => {
			const pathChirho = new URL(urlChirho).pathname;
			keysChirho.add(new Headers(initChirho?.headers).get('xi-api-key'));
			if (initChirho?.method === 'POST') {
				postsChirho.push(JSON.parse(String(initChirho.body)).text);
				return failChirho
					? new Response('', { status: 500 })
					: new Response(new Uint8Array(2000), {
							headers: { 'content-type': 'audio/mpeg', 'request-id': 'fixture-request-chirho' }
						});
			}
			if (pathChirho === '/v1/user/subscription')
				return Response.json({ ...subscriptionChirho, ...subscriptionChangeChirho });
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
			throw Error('Unexpected provider metadata');
		})
	);
	const allowedChirho = new Set([cacheKeyChirho(jobChirho)]);
	const planChirho = {
		mode_chirho: 'production' as const,
		rows_chirho: [jobChirho, greekChirho],
		folder_chirho: folderChirho,
		prior_credits_chirho: 401000 + INFLECTION_LIMIT_CHIRHO - costChirho(jobChirho),
		verify_source_chirho: async () => {},
		funding_chirho: inflectionFundingChirho(
			authorityChirho,
			oldSettlementChirho,
			costChirho(jobChirho)
		),
		eligible_chirho: (candidateChirho: AudioJobChirho) =>
			isExtraEligibleChirho(candidateChirho) && allowedChirho.has(cacheKeyChirho(candidateChirho))
	};
	return {
		root_chirho: rootChirho,
		folder_chirho: folderChirho,
		plan_chirho: planChirho,
		posts_chirho: postsChirho,
		keys_chirho: keysChirho
	};
}
describe('the production speech executor with the new account', () => {
	it('uses only the dedicated key, excludes Greek and records funding names without secret values', async () => {
		const fixtureChirho = await providerChirho(hebrewChirho[0]);
		await executeAudioPlanChirho(fixtureChirho.root_chirho, true, fixtureChirho.plan_chirho);
		expect(fixtureChirho.posts_chirho).toEqual([synthesisTextChirho(hebrewChirho[0])]);
		expect([...fixtureChirho.keys_chirho]).toEqual(['dedicated-value-chirho']);
		const receiptTextChirho = await readFileChirho(
			joinChirho(fixtureChirho.folder_chirho, 'receipts-chirho.json'),
			'utf8'
		);
		expect(receiptTextChirho).toContain(INFLECTION_ID_CHIRHO);
		expect(receiptTextChirho).toContain(INFLECTION_KEY_CHIRHO);
		expect(receiptTextChirho).not.toContain('dedicated-value-chirho');
		await executeAudioPlanChirho(fixtureChirho.root_chirho, true, fixtureChirho.plan_chirho);
		expect(fixtureChirho.posts_chirho).toHaveLength(1);
	});
	it('refuses a rollover and overage-enabled account before a speech POST', async () => {
		for (const changeChirho of [
			{ next_character_count_reset_unix: 1796586536 },
			{ can_extend_character_limit: true }
		]) {
			const fixtureChirho = await providerChirho(hebrewChirho[0], changeChirho);
			await expect(
				executeAudioPlanChirho(fixtureChirho.root_chirho, true, fixtureChirho.plan_chirho)
			).rejects.toThrow();
			expect(fixtureChirho.posts_chirho).toHaveLength(0);
		}
	});
	it('never repeats an unknown speech outcome on restart', async () => {
		const fixtureChirho = await providerChirho(hebrewChirho[0], {}, true);
		vi.spyOn(console, 'error').mockImplementation(() => {});
		await executeAudioPlanChirho(fixtureChirho.root_chirho, true, fixtureChirho.plan_chirho);
		expect(fixtureChirho.posts_chirho).toHaveLength(1);
		const receiptChirho = JSON.parse(
			await readFileChirho(joinChirho(fixtureChirho.folder_chirho, 'receipts-chirho.json'), 'utf8')
		)[0];
		expect(receiptChirho.state_chirho).toBe('requested');
		await executeAudioPlanChirho(fixtureChirho.root_chirho, true, fixtureChirho.plan_chirho);
		expect(fixtureChirho.posts_chirho).toHaveLength(1);
	});
});
