// For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life. — John 3:16 (KJV)
// Workflow: reusable-word-audio-chirho.md. Raw reservations remain immutable; only sealed receipts settle.
import { createHash as createHashChirho } from 'node:crypto';

export interface AccountableReceiptChirho {
	id_chirho: string;
	key_chirho: string;
	state_chirho: 'requested' | 'received';
	reserved_credits_chirho: number;
	funding_id_chirho?: string;
}
export interface SettledReceiptChirho {
	receipt_sha256_chirho: string;
	accounted_credits_chirho: number;
}
export interface AudioSettlementChirho {
	id_chirho: string;
	reset_unix_chirho: number;
	receipt_charges_chirho: ReadonlyMap<string, SettledReceiptChirho>;
}
export function receiptIdentityChirho(receiptChirho: AccountableReceiptChirho): string {
	return JSON.stringify([receiptChirho.id_chirho, receiptChirho.key_chirho]);
}
export function receiptFingerprintChirho(receiptChirho: object): string {
	return createHashChirho('sha256')
		.update(
			JSON.stringify(
				Object.fromEntries(
					Object.entries(receiptChirho).sort(([leftChirho], [rightChirho]) =>
						leftChirho < rightChirho ? -1 : leftChirho > rightChirho ? 1 : 0
					)
				)
			)
		)
		.digest('hex');
}
/** Accounting allocations are aggregate conservative charges, never claimed per-request bills. */
export function accountedReceiptCreditsChirho(
	receiptChirho: AccountableReceiptChirho,
	fundingChirho?: { id_chirho: string; settlement_chirho?: AudioSettlementChirho }
): number {
	const settledChirho = fundingChirho?.settlement_chirho?.receipt_charges_chirho.get(
		receiptIdentityChirho(receiptChirho)
	);
	if (!settledChirho) return receiptChirho.reserved_credits_chirho;
	if (
		receiptChirho.state_chirho !== 'received' ||
		receiptChirho.funding_id_chirho !== fundingChirho?.id_chirho ||
		receiptFingerprintChirho(receiptChirho) !== settledChirho.receipt_sha256_chirho ||
		!Number.isSafeInteger(settledChirho.accounted_credits_chirho) ||
		settledChirho.accounted_credits_chirho < 0 ||
		settledChirho.accounted_credits_chirho > receiptChirho.reserved_credits_chirho
	)
		throw new Error('Settled receipt identity or charge changed');
	return settledChirho.accounted_credits_chirho;
}
