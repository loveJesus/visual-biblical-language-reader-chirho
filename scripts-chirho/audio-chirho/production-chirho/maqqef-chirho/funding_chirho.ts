// For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life. — John 3:16 (KJV)
// Workflow: reusable-word-audio-chirho.md. One new exact pass; prior allowances stay reserved.
import {
	lstat as lstatChirho,
	readFile as readFileChirho,
	realpath as realpathChirho
} from 'node:fs/promises';
import { join as joinChirho, resolve as resolveChirho } from 'node:path';
import { sha256Chirho, type AudioFundingChirho } from '../../audition_chirho';
import {
	INFLECTION_HOME_CHIRHO,
	INFLECTION_KEY_CHIRHO
} from '../inflections-chirho/funding_chirho';

export const MAQQEF_HOME_CHIRHO =
	'workspace-chirho/audio-chirho/maqqef-continuation-2026-11-07-chirho';
export const MAQQEF_PLAN_HOME_CHIRHO =
	'workspace-chirho/audio-chirho/production-bible-2026-11-02-chirho/continuations-chirho/maqqef-2026-11-07-chirho';
export const MAQQEF_ID_CHIRHO = 'maqqef-2026-11-07-chirho';
export const MAQQEF_PRIOR_CHIRHO = 443483;
export const MAQQEF_MAXIMUM_UNITS_CHIRHO = 11198;
export const MAQQEF_MAXIMUM_FORMS_CHIRHO = 1081;
const HASH_CHIRHO = /^[a-f0-9]{64}$/u;
export interface MaqqefAuthorityChirho {
	schema_version_chirho: 1;
	id_chirho: string;
	authorized_chirho: true;
	authority_chirho: string;
	key_name_chirho: string;
	included_only_chirho: true;
	total_forms_chirho: number;
	maximum_requests_chirho: number;
	maximum_raw_credits_chirho: number;
	prior_accounted_credits_chirho: number;
	maximum_total_credits_chirho: number;
	new_keys_chirho: string[];
	account_id_sha256_chirho: string;
	baseline_usage_chirho: number;
	character_limit_chirho: number;
	reset_unix_chirho: number;
	candidates_sha256_chirho: string;
	index_sha256_chirho: string;
	prior_ledger_sha256_chirho: string;
	previous_authority_sha256_chirho: string;
}
export interface MaqqefSubscriptionChirho {
	status: string;
	tier: string;
	character_count: number;
	character_limit: number;
	can_extend_character_limit: boolean;
	next_character_count_reset_unix: number;
}
export function validateMaqqefAuthorityChirho(valueChirho: MaqqefAuthorityChirho) {
	if (
		valueChirho.schema_version_chirho !== 1 ||
		valueChirho.id_chirho !== MAQQEF_ID_CHIRHO ||
		valueChirho.authorized_chirho !== true ||
		!valueChirho.authority_chirho?.trim() ||
		valueChirho.key_name_chirho !== INFLECTION_KEY_CHIRHO ||
		valueChirho.included_only_chirho !== true ||
		valueChirho.total_forms_chirho !== MAQQEF_MAXIMUM_FORMS_CHIRHO ||
		!Number.isSafeInteger(valueChirho.maximum_requests_chirho) ||
		valueChirho.maximum_requests_chirho < 0 ||
		valueChirho.maximum_requests_chirho > MAQQEF_MAXIMUM_FORMS_CHIRHO ||
		!Number.isSafeInteger(valueChirho.maximum_raw_credits_chirho) ||
		valueChirho.maximum_raw_credits_chirho < 0 ||
		valueChirho.maximum_raw_credits_chirho > MAQQEF_MAXIMUM_UNITS_CHIRHO ||
		(valueChirho.maximum_requests_chirho === 0) !==
			(valueChirho.maximum_raw_credits_chirho === 0) ||
		valueChirho.prior_accounted_credits_chirho !== MAQQEF_PRIOR_CHIRHO ||
		valueChirho.maximum_total_credits_chirho !==
			MAQQEF_PRIOR_CHIRHO + valueChirho.maximum_raw_credits_chirho ||
		valueChirho.baseline_usage_chirho !== 18982 ||
		valueChirho.character_limit_chirho !== 131000 ||
		valueChirho.reset_unix_chirho !== 1796586535 ||
		!Array.isArray(valueChirho.new_keys_chirho) ||
		valueChirho.new_keys_chirho.length !== valueChirho.maximum_requests_chirho ||
		new Set(valueChirho.new_keys_chirho).size !== valueChirho.new_keys_chirho.length ||
		!valueChirho.new_keys_chirho.every((keyChirho) => HASH_CHIRHO.test(keyChirho)) ||
		![
			valueChirho.account_id_sha256_chirho,
			valueChirho.candidates_sha256_chirho,
			valueChirho.index_sha256_chirho,
			valueChirho.prior_ledger_sha256_chirho,
			valueChirho.previous_authority_sha256_chirho
		].every((hashChirho) => HASH_CHIRHO.test(hashChirho))
	)
		throw Error('Maqqef included-only authority differs from its bounded continuation');
}
/** No symlinked file or ancestor can substitute a production proof. */
export async function readMaqqefFileChirho(
	rootChirho: string,
	pathChirho: string,
	maximumChirho = 32 * 1024 ** 2
) {
	if (
		!/^[a-zA-Z0-9_./-]+$/u.test(pathChirho) ||
		pathChirho.startsWith('/') ||
		pathChirho
			.split('/')
			.some((partChirho) => !partChirho || partChirho === '.' || partChirho === '..')
	)
		throw Error('Maqqef evidence path refused');
	const pathResolvedChirho = resolveChirho(rootChirho, pathChirho);
	const infoChirho = await lstatChirho(pathResolvedChirho);
	if (
		!infoChirho.isFile() ||
		infoChirho.isSymbolicLink() ||
		infoChirho.size > maximumChirho ||
		(await realpathChirho(pathResolvedChirho)) !==
			joinChirho(await realpathChirho(rootChirho), pathChirho)
	)
		throw Error('Maqqef evidence file is linked, oversized or not regular');
	return readFileChirho(pathResolvedChirho);
}
export async function readMaqqefAuthorityChirho(rootChirho: string) {
	const bytesChirho = await readMaqqefFileChirho(
		rootChirho,
		MAQQEF_HOME_CHIRHO + '/authority-chirho.json',
		128 * 1024
	);
	const authorityChirho = JSON.parse(bytesChirho.toString()) as MaqqefAuthorityChirho;
	validateMaqqefAuthorityChirho(authorityChirho);
	if (
		sha256Chirho(
			await readMaqqefFileChirho(
				rootChirho,
				INFLECTION_HOME_CHIRHO + '/authority-chirho.json',
				8192
			)
		) !== authorityChirho.previous_authority_sha256_chirho
	)
		throw Error('Previous inflection authority changed');
	return authorityChirho;
}
export function validateMaqqefAccountChirho(
	authorityChirho: MaqqefAuthorityChirho,
	userChirho: { user_id?: string },
	subscriptionChirho: MaqqefSubscriptionChirho
) {
	validateMaqqefAuthorityChirho(authorityChirho);
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
			authorityChirho.maximum_raw_credits_chirho ||
		subscriptionChirho.character_limit - subscriptionChirho.character_count < 1000
	)
		throw Error('Maqqef account identity, included balance or billing cycle changed');
}
export function maqqefFundingChirho(
	authorityChirho: MaqqefAuthorityChirho,
	batchUnitsChirho: number
): AudioFundingChirho {
	validateMaqqefAuthorityChirho(authorityChirho);
	if (
		!Number.isSafeInteger(batchUnitsChirho) ||
		batchUnitsChirho < 0 ||
		batchUnitsChirho > authorityChirho.maximum_raw_credits_chirho
	)
		throw Error('Maqqef batch exceeds its full-pass reservation');
	return {
		id_chirho: MAQQEF_ID_CHIRHO,
		key_name_chirho: INFLECTION_KEY_CHIRHO,
		maximum_total_credits_chirho: authorityChirho.maximum_total_credits_chirho,
		additional_credits_chirho: authorityChirho.maximum_raw_credits_chirho,
		pool_prior_credits_chirho: authorityChirho.maximum_raw_credits_chirho - batchUnitsChirho,
		billing_cycle_reset_chirho: authorityChirho.reset_unix_chirho
	};
}
/** GETs only. Speech requests remain exclusively inside the journalled adapter. */
export async function maqqefAccountChirho(
	authorityChirho: MaqqefAuthorityChirho,
	environmentChirho: Record<string, string | undefined> = process.env,
	fetchChirho: typeof fetch = fetch
) {
	const keyChirho = environmentChirho[INFLECTION_KEY_CHIRHO]?.trim();
	if (!keyChirho) throw Error('Dedicated maqqef credential missing');
	const getChirho = async (pathChirho: string) => {
		for (let attemptChirho = 0; attemptChirho < 3; attemptChirho++) {
			const responseChirho = await fetchChirho('https://api.elevenlabs.io' + pathChirho, {
				headers: { 'xi-api-key': keyChirho },
				redirect: 'error',
				signal: AbortSignal.timeout(30000)
			});
			if (responseChirho.ok) return responseChirho.json();
			const retryChirho = Number(
				responseChirho.headers.get('retry-after') ?? 5 * (attemptChirho + 1)
			);
			if (
				responseChirho.status !== 429 ||
				attemptChirho === 2 ||
				!Number.isFinite(retryChirho) ||
				retryChirho < 0 ||
				retryChirho > 30
			)
				throw Error('Maqqef metadata refused (' + responseChirho.status + ')');
			await responseChirho.arrayBuffer();
			await new Promise((resolveChirho) => setTimeout(resolveChirho, retryChirho * 1000));
		}
		throw Error('Maqqef metadata retry bound');
	};
	const [userChirho, subscriptionChirho] = await Promise.all([
		getChirho('/v1/user'),
		getChirho('/v1/user/subscription')
	]);
	validateMaqqefAccountChirho(authorityChirho, userChirho, subscriptionChirho);
	return subscriptionChirho as MaqqefSubscriptionChirho;
}
