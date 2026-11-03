// For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life. — John 3:16 (KJV)
// Workflow: reusable-word-audio-chirho.md (separately funded Hebrew IPA words).
// Reads one fixed authority, never a credential value, and plans only what its pool can carry.
import { readFile as readFileChirho } from 'node:fs/promises';
import { join as joinChirho } from 'node:path';
import {
	AUDIO_PRODUCTION_CEILING_CHIRHO,
	synthesisTextChirho,
	type AudioFundingChirho,
	type AudioJobChirho,
	type ReceiptChirho
} from '../audition_chirho';

export const EXTRA_FUNDING_PATH_CHIRHO =
	'workspace-chirho/audio-chirho/extra-key-2026-11-03-chirho/authority-chirho.json';
export const EXTRA_FUNDING_ID_CHIRHO = 'extra-key-2026-11-03-chirho';
export const EXTRA_KEY_NAME_CHIRHO = 'ELEVENLABS_API_KEY_EXTRA_CHIRHO';
export const EXTRA_ADDITIONAL_CREDITS_CHIRHO = 131_000;
export const EXTRA_MAXIMUM_CREDITS_CHIRHO = 401_000;
export const HEBREW_WORD_RECIPE_CHIRHO = 'israeli-ipa-word-library-v1-chirho';
const PRIMARY_KEY_NAMES_CHIRHO = ['ELEVENLABS_API_KEY_CHIRHO', 'ELEVEN_LABS_API_KEY_CHIRHO'];
const PAID_TIERS_CHIRHO = ['creator', 'pro', 'scale', 'business', 'enterprise'];
const AUTHORITY_KEYS_CHIRHO = [
	'additional_credits_chirho',
	'authority_chirho',
	'historical_ceiling_chirho',
	'id_chirho',
	'included_only_chirho',
	'key_name_chirho',
	'language_chirho',
	'maximum_total_credits_chirho',
	'measured_subscription_chirho',
	'schema_version_chirho'
];
const SUBSCRIPTION_KEYS_CHIRHO = [
	'can_extend_character_limit_chirho',
	'character_count_chirho',
	'character_limit_chirho',
	'status_chirho',
	'tier_chirho'
];

export class FundingRefusalChirho extends Error {}

function exactKeysChirho(valueChirho: unknown, keysChirho: string[]): boolean {
	return (
		typeof valueChirho === 'object' &&
		valueChirho !== null &&
		!Array.isArray(valueChirho) &&
		JSON.stringify(Object.keys(valueChirho).sort()) === JSON.stringify(keysChirho)
	);
}

/**
 * Validates the one fixed extra-key authority and that its named credential is present.
 * The returned pool carries the variable NAME only; callers never see the value.
 */
export async function readExtraFundingChirho(
	rootChirho: string,
	environmentChirho: Record<string, string | undefined> = process.env
): Promise<AudioFundingChirho> {
	let bytesChirho: Buffer;
	try {
		bytesChirho = await readFileChirho(joinChirho(rootChirho, EXTRA_FUNDING_PATH_CHIRHO));
	} catch (errorChirho) {
		if ((errorChirho as NodeJS.ErrnoException).code === 'ENOENT')
			throw new FundingRefusalChirho('Extra-key authority missing; no funded request');
		throw errorChirho;
	}
	if (bytesChirho.length > 4096) throw new FundingRefusalChirho('Extra-key authority too large');
	let authorityChirho: Record<string, unknown>;
	try {
		authorityChirho = JSON.parse(bytesChirho.toString('utf8'));
	} catch {
		throw new FundingRefusalChirho('Extra-key authority is not valid JSON');
	}
	const subscriptionChirho = authorityChirho?.measured_subscription_chirho as
		Record<string, unknown> | undefined;
	if (
		!exactKeysChirho(authorityChirho, AUTHORITY_KEYS_CHIRHO) ||
		!exactKeysChirho(subscriptionChirho, SUBSCRIPTION_KEYS_CHIRHO) ||
		authorityChirho.schema_version_chirho !== 1 ||
		authorityChirho.id_chirho !== EXTRA_FUNDING_ID_CHIRHO ||
		authorityChirho.key_name_chirho !== EXTRA_KEY_NAME_CHIRHO ||
		typeof authorityChirho.authority_chirho !== 'string' ||
		!authorityChirho.authority_chirho.trim() ||
		authorityChirho.authority_chirho.length > 1000 ||
		authorityChirho.historical_ceiling_chirho !== AUDIO_PRODUCTION_CEILING_CHIRHO ||
		authorityChirho.additional_credits_chirho !== EXTRA_ADDITIONAL_CREDITS_CHIRHO ||
		authorityChirho.maximum_total_credits_chirho !== EXTRA_MAXIMUM_CREDITS_CHIRHO ||
		EXTRA_MAXIMUM_CREDITS_CHIRHO !==
			AUDIO_PRODUCTION_CEILING_CHIRHO + EXTRA_ADDITIONAL_CREDITS_CHIRHO ||
		authorityChirho.included_only_chirho !== true ||
		authorityChirho.language_chirho !== 'he' ||
		subscriptionChirho?.status_chirho !== 'active' ||
		!PAID_TIERS_CHIRHO.includes(String(subscriptionChirho.tier_chirho)) ||
		subscriptionChirho.can_extend_character_limit_chirho !== false ||
		subscriptionChirho.character_limit_chirho !== EXTRA_ADDITIONAL_CREDITS_CHIRHO ||
		!Number.isSafeInteger(subscriptionChirho.character_count_chirho) ||
		(subscriptionChirho.character_count_chirho as number) < 0
	)
		throw new FundingRefusalChirho('Extra-key authority differs from its fixed allowance');
	if (PRIMARY_KEY_NAMES_CHIRHO.includes(EXTRA_KEY_NAME_CHIRHO))
		throw new FundingRefusalChirho('Extra-key mode cannot select the primary credential');
	if (!environmentChirho[EXTRA_KEY_NAME_CHIRHO]?.trim())
		throw new FundingRefusalChirho(`Funded speech credential ${EXTRA_KEY_NAME_CHIRHO} missing`);
	return {
		id_chirho: EXTRA_FUNDING_ID_CHIRHO,
		key_name_chirho: EXTRA_KEY_NAME_CHIRHO,
		maximum_total_credits_chirho: EXTRA_MAXIMUM_CREDITS_CHIRHO,
		additional_credits_chirho: EXTRA_ADDITIONAL_CREDITS_CHIRHO,
		pool_prior_credits_chirho: 0
	};
}

/** The extra key funds only Israeli-Hebrew IPA word recordings. */
export function isExtraEligibleChirho(jobChirho: AudioJobChirho): boolean {
	return (
		jobChirho.language_chirho === 'he' && jobChirho.recipe_id_chirho === HEBREW_WORD_RECIPE_CHIRHO
	);
}

export interface FundedSelectionChirho {
	/** Eligible rows without any receipt, in plan order. */
	pending_ids_chirho: string[];
	/** The leading pending rows that fit the allowance and request limit. */
	selected_ids_chirho: Set<string>;
	selected_credits_chirho: number;
	/** True when the credit allowance, not the request limit, stopped the selection. */
	exhausted_chirho: boolean;
}

/**
 * Chooses the leading eligible rows whose new reservations fit the remaining allowance.
 * Received and unknown requests are never selected again.
 */
export function selectFundedRowsChirho(
	jobsChirho: readonly AudioJobChirho[],
	receiptsChirho: readonly ReceiptChirho[],
	allowanceChirho: number,
	requestLimitChirho: number
): FundedSelectionChirho {
	if (!Number.isSafeInteger(allowanceChirho) || !Number.isSafeInteger(requestLimitChirho))
		throw new FundingRefusalChirho('Funded selection bound is not an integer');
	const pendingChirho = jobsChirho.filter(
		(jobChirho) =>
			isExtraEligibleChirho(jobChirho) &&
			!receiptsChirho.some((rowChirho) => rowChirho.id_chirho === jobChirho.id_chirho)
	);
	const selectedChirho = new Set<string>();
	let creditsChirho = 0,
		exhaustedChirho = false;
	for (const jobChirho of pendingChirho) {
		if (selectedChirho.size >= Math.max(0, requestLimitChirho)) break;
		const costChirho = [...synthesisTextChirho(jobChirho)].length;
		if (creditsChirho + costChirho > allowanceChirho) {
			exhaustedChirho = true;
			break;
		}
		creditsChirho += costChirho;
		selectedChirho.add(jobChirho.id_chirho);
	}
	return {
		pending_ids_chirho: pendingChirho.map((jobChirho) => jobChirho.id_chirho),
		selected_ids_chirho: selectedChirho,
		selected_credits_chirho: creditsChirho,
		exhausted_chirho: exhaustedChirho
	};
}
