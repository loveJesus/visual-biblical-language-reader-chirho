// For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life. — John 3:16 (KJV)
import { afterEach, expect, it, vi } from 'vitest';
import {
	mkdtemp as mkdtempChirho,
	mkdir as mkdirChirho,
	readFile as readFileChirho,
	writeFile as writeFileChirho,
	rm as rmChirho
} from 'node:fs/promises';
import { tmpdir as tmpdirChirho } from 'node:os';
import { join as joinChirho, dirname as dirnameChirho } from 'node:path';
import {
	cacheKeyChirho,
	executeAudioPlanChirho,
	sha256Chirho,
	type AudioJobChirho
} from '../../../scripts-chirho/audio-chirho/audition_chirho';
import { COMPLETION_AUTHORITY_CHIRHO } from '../../../scripts-chirho/audio-chirho/production-chirho/completion_guard_chirho';

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
async function fixtureChirho(countChirho = 130500, resetChirho = 1796331115) {
	const rootChirho = await mkdtempChirho(joinChirho(tmpdirChirho(), 'hinneh-completion-chirho-'));
	rootsChirho.push(rootChirho);
	const wordChirho = JSON.parse(
		await readFileChirho(
			joinChirho(
				import.meta.dirname,
				'../../fixtures-chirho/audio-chirho/whole-bible-words-chirho.json'
			),
			'utf8'
		)
	).words_chirho[0];
	const jobChirho = wordChirho.job_chirho as AudioJobChirho;
	const keyChirho = cacheKeyChirho(jobChirho);
	const preparationChirho = JSON.stringify({
		selected_chirho: [{ word_chirho: { key_chirho: keyChirho } }],
		historical_scan_chirho: { matches_chirho: [] }
	});
	const preparationPathChirho = joinChirho(
		rootChirho,
		'build-chirho/remaining-media-2026-11-06-chirho/audit-chirho/audio-preparation-chirho.json'
	);
	await mkdirChirho(dirnameChirho(preparationPathChirho), { recursive: true });
	await writeFileChirho(preparationPathChirho, preparationChirho);
	const authorityChirho = {
		schema_version_chirho: 1,
		id_chirho: 'hebrew-ipa-completion-2026-11-06-chirho',
		authorized_chirho: true,
		authority_chirho: 'Test-only explicit bounded completion approval.',
		minimum_balance_chirho: 200,
		maximum_additional_credits_chirho: 800,
		baseline_usage_chirho: 129936,
		reset_unix_chirho: 1796331115,
		preparation_sha256_chirho: sha256Chirho(preparationChirho),
		allowed_keys_chirho: [keyChirho]
	};
	const authorityPathChirho = joinChirho(rootChirho, COMPLETION_AUTHORITY_CHIRHO);
	await mkdirChirho(dirnameChirho(authorityPathChirho), { recursive: true });
	await writeFileChirho(authorityPathChirho, JSON.stringify(authorityChirho));
	const postsChirho: string[] = [];
	vi.stubEnv('ELEVENLABS_API_KEY_EXTRA_CHIRHO', 'test-extra-chirho');
	vi.stubGlobal(
		'fetch',
		vi.fn(async (urlChirho: string, initChirho?: RequestInit) => {
			expect(new Headers(initChirho?.headers).get('xi-api-key')).toBe('test-extra-chirho');
			const pathChirho = new URL(urlChirho).pathname;
			if (initChirho?.method === 'POST') {
				postsChirho.push(pathChirho);
				return new Response(new Uint8Array(2000), { headers: { 'content-type': 'audio/mpeg' } });
			}
			if (pathChirho === '/v1/user/subscription')
				return Response.json({
					status: 'active',
					tier: 'creator',
					character_limit: 131000,
					character_count: countChirho,
					can_extend_character_limit: false,
					next_character_count_reset_unix: resetChirho
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
					voices: [{ voice_id: 'l7Q9rbdCC6j3J5dNlOOg', rate: 1, language: 'he' }]
				});
			throw new Error('Unexpected provider route');
		})
	);
	return {
		rootChirho,
		postsChirho,
		authorityPathChirho,
		authorityChirho,
		planChirho: {
			rows_chirho: [jobChirho],
			folder_chirho: joinChirho(
				rootChirho,
				'workspace-chirho/audio-chirho/production-bible-2026-11-02-chirho/batches-chirho/0000-chirho/batch-0000-chirho'
			),
			mode_chirho: 'production' as const,
			prior_credits_chirho: 269903,
			verify_source_chirho: async () => {},
			funding_chirho: {
				id_chirho: 'extra-key-2026-11-03-chirho',
				key_name_chirho: 'ELEVENLABS_API_KEY_EXTRA_CHIRHO',
				maximum_total_credits_chirho: 401000,
				additional_credits_chirho: 131000,
				pool_prior_credits_chirho: 0
			},
			completion_authority_sha256_chirho: sha256Chirho(JSON.stringify(authorityChirho))
		}
	};
}

it('preserves the normal reserve and only the exact approved completion can use its lower floor', async () => {
	const fChirho = await fixtureChirho();
	await expect(
		executeAudioPlanChirho(fChirho.rootChirho, true, {
			...fChirho.planChirho,
			completion_authority_sha256_chirho: undefined
		})
	).rejects.toThrow(/Included speech credits/);
	expect(fChirho.postsChirho).toHaveLength(0);
	await executeAudioPlanChirho(fChirho.rootChirho, true, fChirho.planChirho);
	expect(fChirho.postsChirho).toHaveLength(1);
});

it('refuses the spend cap and billing-cycle change before a speech request', async () => {
	for (const [countChirho, resetChirho] of [
		[130735, 1796331115],
		[130500, 1796331116]
	]) {
		const fChirho = await fixtureChirho(countChirho, resetChirho);
		await expect(
			executeAudioPlanChirho(fChirho.rootChirho, true, fChirho.planChirho)
		).rejects.toThrow(/Included speech credits/);
		expect(fChirho.postsChirho).toHaveLength(0);
	}
});

it('refuses changed authority, a larger allowance and any unlisted IPA key', async () => {
	const fChirho = await fixtureChirho();
	await expect(
		executeAudioPlanChirho(fChirho.rootChirho, true, {
			...fChirho.planChirho,
			completion_authority_sha256_chirho: 'a'.repeat(64)
		})
	).rejects.toThrow(/fingerprint/);
	await expect(
		executeAudioPlanChirho(fChirho.rootChirho, true, {
			...fChirho.planChirho,
			rows_chirho: [{ ...fChirho.planChirho.rows_chirho[0], synthesis_text_chirho: 'different' }]
		})
	).rejects.toThrow(/unlisted/);
	const changedChirho = JSON.stringify({
		...fChirho.authorityChirho,
		maximum_additional_credits_chirho: 801
	});
	await writeFileChirho(fChirho.authorityPathChirho, changedChirho);
	await expect(
		executeAudioPlanChirho(fChirho.rootChirho, true, {
			...fChirho.planChirho,
			completion_authority_sha256_chirho: sha256Chirho(changedChirho)
		})
	).rejects.toThrow(/named limits/);
	expect(fChirho.postsChirho).toHaveLength(0);
});
