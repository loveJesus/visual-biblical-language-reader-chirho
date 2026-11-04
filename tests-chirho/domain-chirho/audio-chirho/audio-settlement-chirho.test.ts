// For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life. — John 3:16 (KJV)
import { afterEach, expect, it, vi as viChirho } from 'vitest';
import {
	mkdtemp as mkdtempChirho,
	mkdir as mkdirChirho,
	writeFile as writeFileChirho,
	readFile as readFileChirho,
	readdir as readdirChirho,
	rm as rmChirho
} from 'node:fs/promises';
import { tmpdir as tmpdirChirho } from 'node:os';
import { join as joinChirho } from 'node:path';
import {
	cacheKeyChirho,
	synthesisTextChirho,
	reserveChirho,
	fundedCreditsChirho,
	executeAudioPlanChirho,
	sha256Chirho,
	type ReceiptChirho,
	type AudioFundingChirho
} from '../../../scripts-chirho/audio-chirho/audition_chirho';
import {
	settleReceivedChirho,
	reconcileFundingChirho,
	RECONCILIATION_AUTHORITY_CHIRHO
} from '../../../scripts-chirho/audio-chirho/production-chirho/reconcile_funding_chirho';
import {
	accountedReceiptCreditsChirho,
	receiptIdentityChirho
} from '../../../scripts-chirho/audio-chirho/production-chirho/credit_accounting_chirho';
import {
	EXTRA_FUNDING_PATH_CHIRHO,
	EXTRA_KEY_NAME_CHIRHO
} from '../../../scripts-chirho/audio-chirho/production-chirho/funding_chirho';
import type { LibraryWordChirho } from '../../../scripts-chirho/audio-chirho/production-chirho/prepare_words_chirho';
import {
	seedLemmaJobsChirho,
	hebrewLemmaKeyChirho
} from '../../../scripts-chirho/audio-chirho/production-chirho/lemma_priority_chirho';
import {
	continueIncludedRoundChirho,
	runWordsChirho
} from '../../../scripts-chirho/audio-chirho/production-chirho/run_words_chirho';

const wordsChirho: LibraryWordChirho[] = JSON.parse(
	await readFileChirho(
		joinChirho(
			import.meta.dirname,
			'../../fixtures-chirho/audio-chirho/whole-bible-words-chirho.json'
		),
		'utf8'
	)
).words_chirho;
it('continues only productive estimate-limited passes within the request and settlement bounds', () => {
	const resultChirho = { new_requests_chirho: 20, funding_exhausted_chirho: true };
	expect(continueIncludedRoundChirho(resultChirho, 1, 20, 100)).toBe(true);
	for (const changedChirho of [
		{ ...resultChirho, new_requests_chirho: 0 },
		{ ...resultChirho, new_requests_chirho: -1 },
		{ ...resultChirho, funding_exhausted_chirho: false },
		{ ...resultChirho, drained_chirho: true }
	])
		expect(continueIncludedRoundChirho(changedChirho, 1, 20, 100)).toBe(false);
	expect(continueIncludedRoundChirho(resultChirho, 16, 20, 100)).toBe(false);
	expect(continueIncludedRoundChirho(resultChirho, 1, 100, 100)).toBe(false);
});
it('refuses continuation without every explicit funding and execution mode before reading credentials', async () => {
	await expect(
		runWordsChirho('/missing-chirho', false, 3, true, true, true, true, true)
	).rejects.toThrow('requires apply');
	await expect(
		runWordsChirho('/missing-chirho', true, 3, true, true, false, true, true)
	).rejects.toThrow('requires apply');
	await expect(
		runWordsChirho('/missing-chirho', true, 3, true, true, true, false, true)
	).rejects.toThrow('requires apply');
});
const jobsChirho = wordsChirho
	.filter((wordChirho) => wordChirho.job_chirho.language_chirho === 'he')
	.map((wordChirho) => wordChirho.job_chirho);
const rootsChirho: string[] = [];
afterEach(async () => {
	viChirho.unstubAllGlobals();
	viChirho.unstubAllEnvs();
	viChirho.restoreAllMocks();
	await Promise.all(
		rootsChirho
			.splice(0)
			.map((rootChirho) => rmChirho(rootChirho, { recursive: true, force: true }))
	);
});
const fundingChirho: AudioFundingChirho = {
	id_chirho: 'extra-key-2026-11-03-chirho',
	key_name_chirho: EXTRA_KEY_NAME_CHIRHO,
	additional_credits_chirho: 131000,
	maximum_total_credits_chirho: 401000,
	pool_prior_credits_chirho: 0
};
const usageChirho = {
	status: 'active',
	tier: 'creator',
	character_limit: 131000,
	character_count: 2,
	can_extend_character_limit: false,
	next_character_count_reset_unix: 1900000000
};
const bytesChirho = new Uint8Array(2000).fill(7);
function receiptChirho(numberChirho = 0): ReceiptChirho {
	const jobChirho = jobsChirho[numberChirho];
	const keyChirho = cacheKeyChirho(jobChirho);
	return {
		id_chirho: jobChirho.id_chirho,
		key_chirho: keyChirho,
		reserved_credits_chirho: [...synthesisTextChirho(jobChirho)].length,
		state_chirho: 'received',
		path_chirho: `${jobChirho.id_chirho}-${keyChirho.slice(0, 12)}-chirho.mp3`,
		sha256_chirho: sha256Chirho(bytesChirho),
		bytes_chirho: bytesChirho.length,
		request_id_chirho: 'test-response-chirho',
		voice_id_chirho: 'l7Q9rbdCC6j3J5dNlOOg',
		voice_name_chirho: 'Itamar - Israeli Hebrew Narrator',
		funding_id_chirho: fundingChirho.id_chirho,
		funding_key_name_chirho: EXTRA_KEY_NAME_CHIRHO
	};
}
const groupChirho = (rowsChirho: ReceiptChirho[]) => [
	{
		path_chirho: 'batches-chirho/0000-chirho/batch-0000-chirho/receipts-chirho.json',
		receipts_chirho: rowsChirho
	}
];

it('settles received estimates without changing raw receipts, ceilings or unknown reservations', () => {
	const receivedChirho = receiptChirho();
	const unknownChirho = { ...receiptChirho(1), state_chirho: 'requested' as const };
	const beforeChirho = JSON.stringify([receivedChirho, unknownChirho]);
	const resultChirho = settleReceivedChirho(
		groupChirho([receivedChirho, unknownChirho]),
		usageChirho,
		1900000000,
		'settle-test-chirho'
	);
	const fundedChirho = { ...fundingChirho, settlement_chirho: resultChirho.settlement_chirho };
	expect(accountedReceiptCreditsChirho(receivedChirho, fundedChirho)).toBe(2);
	expect(accountedReceiptCreditsChirho(unknownChirho, fundedChirho)).toBe(
		unknownChirho.reserved_credits_chirho
	);
	expect(
		fundedCreditsChirho([receivedChirho, unknownChirho], fundingChirho.id_chirho, fundedChirho)
	).toBe(2 + unknownChirho.reserved_credits_chirho);
	expect(fundedCreditsChirho([receivedChirho], fundingChirho.id_chirho)).toBe(
		receivedChirho.reserved_credits_chirho
	);
	expect(JSON.stringify([receivedChirho, unknownChirho])).toBe(beforeChirho);
	expect(fundedChirho.additional_credits_chirho).toBe(131000);
	expect(fundedChirho.maximum_total_credits_chirho).toBe(401000);
});

it('refuses changed, unknown or differently funded settled identities', () => {
	const originalChirho = receiptChirho();
	const resultChirho = settleReceivedChirho(
		groupChirho([originalChirho]),
		usageChirho,
		1900000000,
		'settle-test-chirho'
	);
	const fundedChirho = { ...fundingChirho, settlement_chirho: resultChirho.settlement_chirho };
	for (const changedChirho of [
		{ ...originalChirho, state_chirho: 'requested' as const },
		{ ...originalChirho, sha256_chirho: 'f'.repeat(64) },
		{ ...originalChirho, reserved_credits_chirho: 1 },
		{ ...originalChirho, funding_id_chirho: 'another-pool-chirho' }
	])
		expect(() => accountedReceiptCreditsChirho(changedChirho, fundedChirho)).toThrow(
			/Settled receipt/
		);
	expect(
		resultChirho.settlement_chirho.receipt_charges_chirho.has(
			receiptIdentityChirho({ ...originalChirho, id_chirho: 'another-chirho' })
		)
	).toBe(false);
});

it('refuses overages, resets, increased limits, duplicate receipts and unaccounted usage', () => {
	const originalChirho = receiptChirho();
	for (const changedChirho of [
		{ ...usageChirho, can_extend_character_limit: true },
		{ ...usageChirho, character_limit: 200000 },
		{ ...usageChirho, next_character_count_reset_unix: 1900000001 },
		{ ...usageChirho, character_count: -1 },
		{ ...usageChirho, character_count: originalChirho.reserved_credits_chirho + 1 },
		{ ...usageChirho, status: 'inactive' }
	])
		expect(() =>
			settleReceivedChirho(
				groupChirho([originalChirho]),
				changedChirho,
				1900000000,
				'settle-test-chirho'
			)
		).toThrow();
	expect(() =>
		settleReceivedChirho(
			groupChirho([originalChirho, originalChirho]),
			usageChirho,
			1900000000,
			'settle-test-chirho'
		)
	).toThrow(/duplicate/);
	expect(() =>
		settleReceivedChirho(
			groupChirho([{ ...originalChirho, request_id_chirho: null }]),
			usageChirho,
			1900000000,
			'settle-test-chirho'
		)
	).toThrow(/response evidence/);
});

it('uses accounted historical charges while enforcing both original budget boundaries', () => {
	const originalChirho = receiptChirho();
	const resultChirho = settleReceivedChirho(
		groupChirho([originalChirho]),
		usageChirho,
		1900000000,
		'settle-test-chirho'
	);
	const nextCostChirho = [...synthesisTextChirho(jobsChirho[1])].length;
	const fundedChirho = {
		...fundingChirho,
		settlement_chirho: resultChirho.settlement_chirho,
		pool_prior_credits_chirho: 131000 - 2 - nextCostChirho
	};
	const optionsChirho = { funding_chirho: fundedChirho, eligible_chirho: () => true };
	expect(
		reserveChirho(
			jobsChirho.slice(0, 2),
			[originalChirho],
			401000 - 2 - nextCostChirho,
			'production',
			optionsChirho
		)
	).toBe(2 + nextCostChirho);
	expect(() =>
		reserveChirho(
			jobsChirho.slice(0, 2),
			[originalChirho],
			401000 - 2 - nextCostChirho + 1,
			'production',
			optionsChirho
		)
	).toThrow(/budget/);
	expect(() =>
		reserveChirho(jobsChirho.slice(0, 2), [originalChirho], 0, 'production', {
			...optionsChirho,
			funding_chirho: {
				...fundedChirho,
				pool_prior_credits_chirho: fundedChirho.pool_prior_credits_chirho + 1
			}
		})
	).toThrow(/budget/);
});

async function rootChirho() {
	const pathChirho = await mkdtempChirho(joinChirho(tmpdirChirho(), 'hinneh-settlement-chirho-'));
	rootsChirho.push(pathChirho);
	return pathChirho;
}
async function authorityChirho(rootPathChirho: string) {
	const originalChirho = Buffer.from('original-allowance-chirho');
	await mkdirChirho(joinChirho(rootPathChirho, EXTRA_FUNDING_PATH_CHIRHO, '..'), {
		recursive: true
	});
	await writeFileChirho(joinChirho(rootPathChirho, EXTRA_FUNDING_PATH_CHIRHO), originalChirho);
	await writeFileChirho(
		joinChirho(rootPathChirho, RECONCILIATION_AUTHORITY_CHIRHO),
		JSON.stringify({
			schema_version_chirho: 1,
			funding_id_chirho: fundingChirho.id_chirho,
			original_authority_sha256_chirho: sha256Chirho(originalChirho),
			included_credit_limit_chirho: 131000,
			key_name_chirho: EXTRA_KEY_NAME_CHIRHO,
			authority_chirho: 'L.J. authorizes continuing within the same included pool.',
			reset_unix_chirho: 1900000000
		})
	);
}

it('performs only an extra-key GET in dry mode and writes immutable settlement proof on apply', async () => {
	const rootPathChirho = await rootChirho();
	await authorityChirho(rootPathChirho);
	viChirho.stubEnv(EXTRA_KEY_NAME_CHIRHO, 'extra-test-secret-chirho');
	viChirho.stubEnv('ELEVENLABS_API_KEY_CHIRHO', 'primary-test-secret-chirho');
	const fetchChirho = viChirho.fn(async (urlChirho: string, initChirho?: RequestInit) => {
		expect(urlChirho).toBe('https://api.elevenlabs.io/v1/user/subscription');
		expect(initChirho?.method ?? 'GET').toBe('GET');
		expect(new Headers(initChirho?.headers).get('xi-api-key')).toBe('extra-test-secret-chirho');
		return Response.json(usageChirho);
	});
	viChirho.stubGlobal('fetch', fetchChirho);
	const beforeChirho = JSON.stringify(receiptChirho());
	const dryChirho = await reconcileFundingChirho(
		rootPathChirho,
		{ ...fundingChirho },
		groupChirho([receiptChirho()]),
		false
	);
	expect(dryChirho.report_chirho.accounted_funded_credits_chirho).toBe(2);
	const folderChirho = joinChirho(
		rootPathChirho,
		EXTRA_FUNDING_PATH_CHIRHO,
		'..',
		'settlements-chirho'
	);
	await expect(readdirChirho(folderChirho)).rejects.toMatchObject({ code: 'ENOENT' });
	const appliedChirho = await reconcileFundingChirho(
		rootPathChirho,
		{ ...fundingChirho },
		groupChirho([receiptChirho()]),
		true
	);
	const manifestChirho = await readFileChirho(
		joinChirho(folderChirho, appliedChirho.settlement_chirho.id_chirho, 'manifest-chirho.json'),
		'utf8'
	);
	expect(manifestChirho).toContain('131000');
	expect(manifestChirho).not.toContain('extra-test-secret-chirho');
	expect(manifestChirho).not.toContain('primary-test-secret-chirho');
	expect(JSON.stringify(receiptChirho())).toBe(beforeChirho);
	expect(fetchChirho).toHaveBeenCalledTimes(2);
});

it('a changed billing cycle prevents any synthesis POST even with a settlement', async () => {
	const rootPathChirho = await rootChirho();
	const originalChirho = receiptChirho();
	const resultChirho = settleReceivedChirho(
		groupChirho([originalChirho]),
		usageChirho,
		1900000000,
		'settle-test-chirho'
	);
	const folderChirho = joinChirho(
		rootPathChirho,
		'workspace-chirho/audio-chirho/production-bible-2026-11-02-chirho/batches-chirho/0000-chirho/batch-0000-chirho'
	);
	await mkdirChirho(folderChirho, { recursive: true });
	await writeFileChirho(
		joinChirho(folderChirho, 'receipts-chirho.json'),
		JSON.stringify([originalChirho])
	);
	await writeFileChirho(joinChirho(folderChirho, originalChirho.path_chirho!), bytesChirho);
	viChirho.stubEnv(EXTRA_KEY_NAME_CHIRHO, 'extra-test-secret-chirho');
	const fetchChirho = viChirho.fn(async (urlChirho: string, initChirho?: RequestInit) => {
		expect(initChirho?.method ?? 'GET').toBe('GET');
		expect(urlChirho).toContain('/v1/user/subscription');
		return Response.json({ ...usageChirho, next_character_count_reset_unix: 1900000001 });
	});
	viChirho.stubGlobal('fetch', fetchChirho);
	await expect(
		executeAudioPlanChirho(rootPathChirho, true, {
			mode_chirho: 'production',
			rows_chirho: jobsChirho.slice(0, 2),
			folder_chirho: folderChirho,
			prior_credits_chirho: 269903,
			limit_chirho: 1,
			verify_source_chirho: async () => {},
			funding_chirho: { ...fundingChirho, settlement_chirho: resultChirho.settlement_chirho },
			eligible_chirho: (jobChirho) => jobChirho.id_chirho === jobsChirho[1].id_chirho
		})
	).rejects.toThrow(/billing cycle/);
	expect(fetchChirho).toHaveBeenCalledTimes(1);
});

it('seeds missing lemmas before further forms and never repeats an uncertain request', () => {
	const hebrewWordsChirho = wordsChirho.filter(
		(wordChirho) => wordChirho.job_chirho.language_chirho === 'he'
	);
	const occurrencesChirho = new Map<string, string>();
	hebrewWordsChirho.forEach((wordChirho, indexChirho) =>
		wordChirho.occurrences_chirho.forEach((occurrenceChirho) =>
			occurrencesChirho.set(
				occurrenceChirho.lesson_id_chirho + '!' + occurrenceChirho.token_id_chirho,
				indexChirho < 2 ? 'lemma-a-chirho' : 'lemma-b-chirho'
			)
		)
	);
	const firstChirho = seedLemmaJobsChirho(
		[{ words_chirho: wordsChirho, receipts_chirho: [] }],
		occurrencesChirho,
		new Set()
	);
	expect([...firstChirho.ids_chirho]).toEqual([jobsChirho[0].id_chirho, jobsChirho[2].id_chirho]);
	expect(firstChirho.new_lemmas_chirho).toBe(2);
	const alreadyChirho = seedLemmaJobsChirho(
		[{ words_chirho: wordsChirho, receipts_chirho: [] }],
		occurrencesChirho,
		new Set(['lemma-a-chirho'])
	);
	expect([...alreadyChirho.ids_chirho]).toEqual([jobsChirho[2].id_chirho]);
	const unknownChirho = seedLemmaJobsChirho(
		[
			{
				words_chirho: wordsChirho,
				receipts_chirho: [{ ...receiptChirho(), state_chirho: 'requested' }]
			}
		],
		occurrencesChirho,
		new Set()
	);
	expect([...unknownChirho.ids_chirho]).toEqual([jobsChirho[1].id_chirho, jobsChirho[2].id_chirho]);
});

it('retains Hebrew augments and excludes unsupported Aramaic or disputed source identities', () => {
	const tokenChirho = {
		id_chirho: 'test-chirho',
		text_chirho: 'test',
		lemma_id_chirho: 'H1',
		lemma_augment_chirho: 'a'
	};
	expect(hebrewLemmaKeyChirho(tokenChirho)).not.toBe(
		hebrewLemmaKeyChirho({ ...tokenChirho, lemma_augment_chirho: 'b' })
	);
	expect(hebrewLemmaKeyChirho({ ...tokenChirho, source_language_chirho: 'arc' })).toBe(null);
	expect(hebrewLemmaKeyChirho({ ...tokenChirho, raw_morphology_chirho: 'ANcmsa' })).toBe(null);
	expect(
		hebrewLemmaKeyChirho({
			...tokenChirho,
			lemma_assignment_status_chirho: 'source_review_required'
		})
	).toBe(null);
});

it('refuses an altered reconciliation authority before even its metadata GET', async () => {
	const rootPathChirho = await rootChirho();
	await authorityChirho(rootPathChirho);
	const pathChirho = joinChirho(rootPathChirho, RECONCILIATION_AUTHORITY_CHIRHO);
	const changedChirho = JSON.parse(await readFileChirho(pathChirho, 'utf8'));
	changedChirho.included_credit_limit_chirho = 131001;
	await writeFileChirho(pathChirho, JSON.stringify(changedChirho));
	const fetchChirho = viChirho.fn();
	viChirho.stubGlobal('fetch', fetchChirho);
	await expect(
		reconcileFundingChirho(
			rootPathChirho,
			{ ...fundingChirho },
			groupChirho([receiptChirho()]),
			true
		)
	).rejects.toThrow(/authority differs/);
	expect(fetchChirho).not.toHaveBeenCalled();
});
