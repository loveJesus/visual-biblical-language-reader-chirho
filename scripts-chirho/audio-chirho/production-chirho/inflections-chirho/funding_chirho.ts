// For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life. — John 3:16 (KJV)
// Workflow: reusable-word-audio-chirho.md. One exact prepared pass on a separately identified account.
import { readFile as readFileChirho, lstat as lstatChirho } from 'node:fs/promises';
import { join as joinChirho } from 'node:path';
import { sha256Chirho, type AudioFundingChirho } from '../../audition_chirho';
import type { AudioSettlementChirho } from '../credit_accounting_chirho';
export const INFLECTION_HOME_CHIRHO = 'workspace-chirho/audio-chirho/inflections-2026-11-06-chirho';
export const INFLECTION_KEY_CHIRHO = 'ELEVENLABS_API_KEY_INFLECTIONS_CHIRHO';
export const INFLECTION_ID_CHIRHO = 'inflections-2026-11-06-chirho';
export const INFLECTION_LIMIT_CHIRHO = 42483;
export interface InflectionAuthorityChirho {
	schema_version_chirho: 1;
	id_chirho: string;
	authorized_chirho: true;
	authority_chirho: string;
	key_name_chirho: string;
	included_only_chirho: true;
	maximum_requests_chirho: number;
	maximum_raw_credits_chirho: number;
	maximum_total_credits_chirho: number;
	account_id_sha256_chirho: string;
	baseline_usage_chirho: number;
	character_limit_chirho: number;
	reset_unix_chirho: number;
	snapshot_sha256_chirho: string;
	index_sha256_chirho: string;
	original_ledger_sha256_chirho: string;
	previous_authority_sha256_chirho: string;
}
export function validateInflectionAuthorityChirho(valueChirho: InflectionAuthorityChirho) {
	if (
		valueChirho.schema_version_chirho !== 1 ||
		valueChirho.id_chirho !== INFLECTION_ID_CHIRHO ||
		valueChirho.authorized_chirho !== true ||
		!valueChirho.authority_chirho?.trim() ||
		valueChirho.key_name_chirho !== INFLECTION_KEY_CHIRHO ||
		valueChirho.included_only_chirho !== true ||
		valueChirho.maximum_requests_chirho !== 3343 ||
		valueChirho.maximum_raw_credits_chirho !== INFLECTION_LIMIT_CHIRHO ||
		valueChirho.maximum_total_credits_chirho !== 401000 + INFLECTION_LIMIT_CHIRHO ||
		valueChirho.baseline_usage_chirho !== 0 ||
		valueChirho.character_limit_chirho !== 131000 ||
		valueChirho.reset_unix_chirho !== 1796586535 ||
		![
			valueChirho.account_id_sha256_chirho,
			valueChirho.snapshot_sha256_chirho,
			valueChirho.index_sha256_chirho,
			valueChirho.original_ledger_sha256_chirho,
			valueChirho.previous_authority_sha256_chirho
		].every((hashChirho) => /^[a-f0-9]{64}$/u.test(hashChirho))
	)
		throw Error('Inflection account authority differs from the bounded included-only pass');
}
export function validateInflectionAccountChirho(
	authorityChirho: InflectionAuthorityChirho,
	userChirho: { user_id?: string },
	subscriptionChirho: {
		status: string;
		tier: string;
		character_count: number;
		character_limit: number;
		can_extend_character_limit: boolean;
		next_character_count_reset_unix: number;
	}
) {
	validateInflectionAuthorityChirho(authorityChirho);
	if (
		!userChirho.user_id ||
		sha256Chirho(userChirho.user_id) !== authorityChirho.account_id_sha256_chirho ||
		subscriptionChirho.status !== 'active' ||
		!['creator', 'pro', 'scale', 'business', 'enterprise'].includes(subscriptionChirho.tier) ||
		subscriptionChirho.character_limit !== authorityChirho.character_limit_chirho ||
		subscriptionChirho.can_extend_character_limit !== false ||
		subscriptionChirho.next_character_count_reset_unix !== authorityChirho.reset_unix_chirho ||
		!Number.isSafeInteger(subscriptionChirho.character_count) ||
		subscriptionChirho.character_count < authorityChirho.baseline_usage_chirho ||
		subscriptionChirho.character_count - authorityChirho.baseline_usage_chirho >
			INFLECTION_LIMIT_CHIRHO ||
		subscriptionChirho.character_limit - subscriptionChirho.character_count < 1000
	)
		throw Error('Inflection account identity, cycle or included balance changed');
}
export async function readInflectionAuthorityChirho(
	rootChirho: string,
	environmentChirho: Record<string, string | undefined> = process.env
) {
	const pathChirho = joinChirho(rootChirho, INFLECTION_HOME_CHIRHO, 'authority-chirho.json'),
		infoChirho = await lstatChirho(pathChirho);
	if (
		!infoChirho.isFile() ||
		infoChirho.isSymbolicLink() ||
		infoChirho.size > 8192 ||
		!environmentChirho[INFLECTION_KEY_CHIRHO]?.trim()
	)
		throw Error('Dedicated inflection authority or credential missing');
	const valueChirho = JSON.parse(
		await readFileChirho(pathChirho, 'utf8')
	) as InflectionAuthorityChirho;
	validateInflectionAuthorityChirho(valueChirho);
	return valueChirho;
}
export function inflectionFundingChirho(
	authorityChirho: InflectionAuthorityChirho,
	oldSettlementChirho: AudioSettlementChirho,
	batchCreditsChirho: number
): AudioFundingChirho {
	validateInflectionAuthorityChirho(authorityChirho);
	if (
		!Number.isSafeInteger(batchCreditsChirho) ||
		batchCreditsChirho < 0 ||
		batchCreditsChirho > INFLECTION_LIMIT_CHIRHO
	)
		throw Error('Inflection batch exceeds its full-pass reservation');
	return {
		id_chirho: INFLECTION_ID_CHIRHO,
		key_name_chirho: INFLECTION_KEY_CHIRHO,
		additional_credits_chirho: INFLECTION_LIMIT_CHIRHO,
		maximum_total_credits_chirho: authorityChirho.maximum_total_credits_chirho,
		pool_prior_credits_chirho: INFLECTION_LIMIT_CHIRHO - batchCreditsChirho,
		billing_cycle_reset_chirho: authorityChirho.reset_unix_chirho,
		prior_settlements_chirho: new Map([['extra-key-2026-11-03-chirho', oldSettlementChirho]])
	};
}
/** Metadata retries are bounded and cannot resend speech or a voice-import POST. */
export async function inflectionAccountChirho(
	authorityChirho: InflectionAuthorityChirho,
	environmentChirho: Record<string, string | undefined> = process.env
) {
	const keyChirho = environmentChirho[INFLECTION_KEY_CHIRHO];
	if (!keyChirho) throw Error('Dedicated inflection key missing');
	const getChirho = async (pathChirho: string) => {
		for (let attemptChirho = 0; attemptChirho < 3; attemptChirho++) {
			const responseChirho = await fetch('https://api.elevenlabs.io' + pathChirho, {
				headers: { 'xi-api-key': keyChirho },
				redirect: 'error',
				signal: AbortSignal.timeout(30000)
			});
			if (responseChirho.ok) return responseChirho.json();
			if (responseChirho.status !== 429 || attemptChirho === 2)
				throw Error('Inflection metadata refused (' + responseChirho.status + ')');
			await new Promise((resolveChirho) => setTimeout(resolveChirho, 10000));
		}
		throw Error('Metadata retry bound');
	};
	const [userChirho, subscriptionChirho] = await Promise.all([
		getChirho('/v1/user'),
		getChirho('/v1/user/subscription')
	]);
	validateInflectionAccountChirho(authorityChirho, userChirho, subscriptionChirho);
	return subscriptionChirho;
}
