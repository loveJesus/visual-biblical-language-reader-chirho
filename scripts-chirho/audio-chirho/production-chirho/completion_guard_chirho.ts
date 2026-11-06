// For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life. — John 3:16 (KJV)
// Workflow: reusable-word-audio-chirho.md. A named completion exception never widens the funding pool.
import { lstat as lstatChirho, readFile as readFileChirho } from 'node:fs/promises';
import { join as joinChirho } from 'node:path';
import { createHash as createHashChirho } from 'node:crypto';

export const COMPLETION_AUTHORITY_CHIRHO =
	'workspace-chirho/audio-chirho/hebrew-ipa-completion-2026-11-06-chirho/authority-chirho.json';
const PREPARATION_CHIRHO =
	'build-chirho/remaining-media-2026-11-06-chirho/audit-chirho/audio-preparation-chirho.json';
const shaChirho = (valueChirho: Uint8Array) =>
	createHashChirho('sha256').update(valueChirho).digest('hex');
export interface CompletionGuardChirho {
	minimum_balance_chirho: 200;
	baseline_usage_chirho: number;
	maximum_usage_chirho: number;
	reset_unix_chirho: number;
}

export async function readCompletionGuardChirho(
	rootChirho: string,
	authorityShaChirho: string,
	requestedKeysChirho: readonly string[],
	fundingChirho?: {
		id_chirho: string;
		key_name_chirho: string;
		maximum_total_credits_chirho: number;
		additional_credits_chirho: number;
	}
): Promise<CompletionGuardChirho> {
	if (
		!/^[a-f0-9]{64}$/u.test(authorityShaChirho) ||
		fundingChirho?.id_chirho !== 'extra-key-2026-11-03-chirho' ||
		fundingChirho.key_name_chirho !== 'ELEVENLABS_API_KEY_EXTRA_CHIRHO' ||
		fundingChirho.maximum_total_credits_chirho !== 401000 ||
		fundingChirho.additional_credits_chirho !== 131000
	)
		throw new Error('Completion exception requires the unchanged extra-key authority');
	const pathChirho = joinChirho(rootChirho, COMPLETION_AUTHORITY_CHIRHO),
		infoChirho = await lstatChirho(pathChirho);
	if (!infoChirho.isFile() || infoChirho.isSymbolicLink() || infoChirho.size > 32768)
		throw new Error('Completion authority file refused');
	const bytesChirho = await readFileChirho(pathChirho);
	if (shaChirho(bytesChirho) !== authorityShaChirho)
		throw new Error('Completion authority fingerprint differs');
	const authorityChirho = JSON.parse(bytesChirho.toString());
	if (
		authorityChirho.schema_version_chirho !== 1 ||
		authorityChirho.id_chirho !== 'hebrew-ipa-completion-2026-11-06-chirho' ||
		authorityChirho.authorized_chirho !== true ||
		typeof authorityChirho.authority_chirho !== 'string' ||
		!authorityChirho.authority_chirho.trim() ||
		authorityChirho.minimum_balance_chirho !== 200 ||
		authorityChirho.maximum_additional_credits_chirho !== 800 ||
		!Number.isSafeInteger(authorityChirho.baseline_usage_chirho) ||
		authorityChirho.baseline_usage_chirho !== 129936 ||
		!Number.isSafeInteger(authorityChirho.reset_unix_chirho) ||
		authorityChirho.reset_unix_chirho <= 0 ||
		!Array.isArray(authorityChirho.allowed_keys_chirho) ||
		!authorityChirho.allowed_keys_chirho.length ||
		authorityChirho.allowed_keys_chirho.length > 104
	)
		throw new Error('Completion allowance differs from its named limits');
	const preparationBytesChirho = await readFileChirho(joinChirho(rootChirho, PREPARATION_CHIRHO));
	if (
		preparationBytesChirho.length > 2 * 1024 ** 2 ||
		shaChirho(preparationBytesChirho) !== authorityChirho.preparation_sha256_chirho
	)
		throw new Error('Completion source preparation differs');
	const preparationChirho = JSON.parse(preparationBytesChirho.toString());
	const receivedChirho = new Set<string>(
		preparationChirho.historical_scan_chirho.matches_chirho
			.filter(
				(rowChirho: { path_chirho: string; receipt_chirho: { state_chirho: string } }) =>
					rowChirho.path_chirho.endsWith('/receipts-chirho.json') &&
					rowChirho.receipt_chirho.state_chirho === 'received'
			)
			.map(
				(rowChirho: { receipt_chirho: { key_chirho: string } }) =>
					rowChirho.receipt_chirho.key_chirho
			)
	);
	const preparedChirho = new Set<string>(
		preparationChirho.selected_chirho
			.map((rowChirho: { word_chirho: { key_chirho: string } }) => rowChirho.word_chirho.key_chirho)
			.filter((keyChirho: string) => !receivedChirho.has(keyChirho))
	);
	const allowedChirho = new Set<string>(authorityChirho.allowed_keys_chirho);
	if (
		allowedChirho.size !== authorityChirho.allowed_keys_chirho.length ||
		[...allowedChirho].some(
			(keyChirho) => !/^[a-f0-9]{64}$/u.test(keyChirho) || !preparedChirho.has(keyChirho)
		) ||
		!requestedKeysChirho.length ||
		requestedKeysChirho.some((keyChirho) => !allowedChirho.has(keyChirho))
	)
		throw new Error('Completion exception cannot request an unlisted pronunciation');
	return {
		minimum_balance_chirho: 200,
		baseline_usage_chirho: authorityChirho.baseline_usage_chirho,
		maximum_usage_chirho: authorityChirho.baseline_usage_chirho + 800,
		reset_unix_chirho: authorityChirho.reset_unix_chirho
	};
}

export function completionBalanceAllowsChirho(
	guardChirho: CompletionGuardChirho | null,
	balanceChirho: { character_count: number; next_character_count_reset_unix: number },
	reservedChirho: number,
	needChirho: number
): boolean {
	return (
		!guardChirho ||
		(balanceChirho.next_character_count_reset_unix === guardChirho.reset_unix_chirho &&
			balanceChirho.character_count >= guardChirho.baseline_usage_chirho &&
			balanceChirho.character_count + reservedChirho + needChirho <=
				guardChirho.maximum_usage_chirho)
	);
}
