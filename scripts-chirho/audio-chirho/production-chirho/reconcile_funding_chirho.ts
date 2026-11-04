// For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life. — John 3:16 (KJV)
// Workflow: reusable-word-audio-chirho.md. Same-cycle usage settles only sealed received estimates.
import {
	readFile as readFileChirho,
	mkdir as mkdirChirho,
	open as openChirho,
	lstat as lstatChirho
} from 'node:fs/promises';
import { join as joinChirho } from 'node:path';
import { randomUUID as randomUUIDChirho, createHash as createHashChirho } from 'node:crypto';
import type { AudioFundingChirho, ReceiptChirho } from '../audition_chirho';
import {
	EXTRA_FUNDING_ID_CHIRHO,
	EXTRA_KEY_NAME_CHIRHO,
	EXTRA_FUNDING_PATH_CHIRHO,
	FundingRefusalChirho
} from './funding_chirho';
import {
	receiptIdentityChirho,
	receiptFingerprintChirho,
	type AudioSettlementChirho
} from './credit_accounting_chirho';

export const RECONCILIATION_AUTHORITY_CHIRHO =
	'workspace-chirho/audio-chirho/extra-key-2026-11-03-chirho/reconciliation-authority-chirho.json';
interface SubscriptionChirho {
	status: string;
	tier: string;
	character_count: number;
	character_limit: number;
	can_extend_character_limit: boolean;
	next_character_count_reset_unix: number;
}
export interface ReceiptGroupChirho {
	path_chirho: string;
	receipts_chirho: readonly ReceiptChirho[];
}
const shaChirho = (bytesChirho: string | Uint8Array) =>
	createHashChirho('sha256').update(bytesChirho).digest('hex');

/** Counts all account usage conservatively; unknown requests keep their full reservation too. */
export function settleReceivedChirho(
	groupsChirho: readonly ReceiptGroupChirho[],
	subscriptionChirho: SubscriptionChirho,
	resetChirho: number,
	idChirho: string
): {
	settlement_chirho: AudioSettlementChirho;
	report_chirho: Record<string, string | number>;
	charges_chirho: Record<string, string | number>[];
} {
	if (
		!/^[a-z0-9-]{1,80}$/u.test(idChirho) ||
		subscriptionChirho.status !== 'active' ||
		!['creator', 'pro', 'scale', 'business', 'enterprise'].includes(subscriptionChirho.tier) ||
		subscriptionChirho.character_limit !== 131000 ||
		subscriptionChirho.can_extend_character_limit !== false ||
		!Number.isSafeInteger(subscriptionChirho.character_count) ||
		subscriptionChirho.character_count < 0 ||
		subscriptionChirho.character_count > 131000 ||
		subscriptionChirho.next_character_count_reset_unix !== resetChirho ||
		!Number.isSafeInteger(resetChirho) ||
		resetChirho <= 0
	)
		throw new FundingRefusalChirho(
			'Reconciliation needs the same active included-only billing cycle'
		);
	if (groupsChirho.length > 1000) throw new FundingRefusalChirho('Receipt groups exceed bound');
	const seenPathsChirho = new Set<string>();
	const seenIdsChirho = new Set<string>();
	const receivedChirho: ReceiptChirho[] = [];
	let rawChirho = 0,
		unknownChirho = 0;
	for (const groupChirho of groupsChirho) {
		if (
			!/^batches-chirho\/[0-9]{4}-chirho\/batch-[0-9]{4}-chirho\/receipts-chirho\.json$/u.test(
				groupChirho.path_chirho
			) ||
			seenPathsChirho.has(groupChirho.path_chirho) ||
			groupChirho.receipts_chirho.length > 96
		)
			throw new FundingRefusalChirho('Invalid settlement receipt group');
		seenPathsChirho.add(groupChirho.path_chirho);
		for (const rowChirho of groupChirho.receipts_chirho) {
			if (rowChirho.funding_id_chirho !== EXTRA_FUNDING_ID_CHIRHO) continue;
			const identityChirho = receiptIdentityChirho(rowChirho);
			if (
				rowChirho.funding_key_name_chirho !== EXTRA_KEY_NAME_CHIRHO ||
				seenIdsChirho.has(identityChirho) ||
				!Number.isSafeInteger(rowChirho.reserved_credits_chirho) ||
				rowChirho.reserved_credits_chirho < 0 ||
				!['requested', 'received'].includes(rowChirho.state_chirho)
			)
				throw new FundingRefusalChirho('Changed or duplicate funded receipt');
			seenIdsChirho.add(identityChirho);
			rawChirho += rowChirho.reserved_credits_chirho;
			if (rowChirho.state_chirho === 'requested') {
				unknownChirho += rowChirho.reserved_credits_chirho;
				continue;
			}
			if (
				!/^[a-f0-9]{64}$/u.test(rowChirho.sha256_chirho ?? '') ||
				!Number.isSafeInteger(rowChirho.bytes_chirho) ||
				(rowChirho.bytes_chirho ?? 0) < 1000 ||
				!rowChirho.request_id_chirho
			)
				throw new FundingRefusalChirho('Received settlement needs original response evidence');
			receivedChirho.push(rowChirho);
		}
	}
	const receivedRawChirho = rawChirho - unknownChirho;
	if (subscriptionChirho.character_count > receivedRawChirho)
		throw new FundingRefusalChirho(
			'Usage exceeds settled received estimates; owner reconciliation required'
		);
	let unallocatedChirho = subscriptionChirho.character_count;
	const chargesChirho: Record<string, string | number>[] = [];
	const receiptChargesChirho = new Map();
	for (const rowChirho of receivedChirho.sort((leftChirho, rightChirho) =>
		receiptIdentityChirho(leftChirho).localeCompare(receiptIdentityChirho(rightChirho))
	)) {
		const chargeChirho = Math.min(rowChirho.reserved_credits_chirho, unallocatedChirho);
		unallocatedChirho -= chargeChirho;
		const valueChirho = {
			receipt_sha256_chirho: receiptFingerprintChirho(rowChirho),
			accounted_credits_chirho: chargeChirho
		};
		receiptChargesChirho.set(receiptIdentityChirho(rowChirho), valueChirho);
		chargesChirho.push({
			id_chirho: rowChirho.id_chirho,
			key_chirho: rowChirho.key_chirho,
			...valueChirho
		});
	}
	const sealChirho = groupsChirho.map((groupChirho) => [
		groupChirho.path_chirho,
		groupChirho.receipts_chirho.map(receiptFingerprintChirho)
	]);
	return {
		settlement_chirho: {
			id_chirho: idChirho,
			reset_unix_chirho: resetChirho,
			receipt_charges_chirho: receiptChargesChirho
		},
		report_chirho: {
			raw_funded_reservations_chirho: rawChirho,
			received_raw_reservations_chirho: receivedRawChirho,
			unknown_reservations_retained_chirho: unknownChirho,
			provider_usage_chirho: subscriptionChirho.character_count,
			accounted_funded_credits_chirho: subscriptionChirho.character_count + unknownChirho,
			settled_estimate_adjustment_chirho: receivedRawChirho - subscriptionChirho.character_count,
			received_receipts_chirho: receivedChirho.length,
			receipt_prefix_sha256_chirho: shaChirho(JSON.stringify(sealChirho)),
			included_credit_limit_chirho: 131000
		},
		charges_chirho: chargesChirho
	};
}

export async function reconcileFundingChirho(
	rootChirho: string,
	fundingChirho: AudioFundingChirho,
	groupsChirho: readonly ReceiptGroupChirho[],
	applyChirho: boolean
) {
	if (
		fundingChirho.id_chirho !== EXTRA_FUNDING_ID_CHIRHO ||
		fundingChirho.key_name_chirho !== EXTRA_KEY_NAME_CHIRHO ||
		fundingChirho.additional_credits_chirho !== 131000 ||
		fundingChirho.maximum_total_credits_chirho !== 401000
	)
		throw new FundingRefusalChirho('Reconciliation cannot change the original funding allowance');
	const originalChirho = await readFileChirho(joinChirho(rootChirho, EXTRA_FUNDING_PATH_CHIRHO));
	const authorityBytesChirho = await readFileChirho(
		joinChirho(rootChirho, RECONCILIATION_AUTHORITY_CHIRHO)
	);
	if (authorityBytesChirho.length > 4096)
		throw new FundingRefusalChirho('Reconciliation authority oversized');
	const authorityChirho = JSON.parse(authorityBytesChirho.toString());
	if (
		authorityChirho.schema_version_chirho !== 1 ||
		authorityChirho.funding_id_chirho !== EXTRA_FUNDING_ID_CHIRHO ||
		authorityChirho.original_authority_sha256_chirho !== shaChirho(originalChirho) ||
		authorityChirho.included_credit_limit_chirho !== 131000 ||
		authorityChirho.key_name_chirho !== EXTRA_KEY_NAME_CHIRHO ||
		typeof authorityChirho.authority_chirho !== 'string' ||
		!authorityChirho.authority_chirho.trim()
	)
		throw new FundingRefusalChirho('Reconciliation authority differs');
	const keyChirho = process.env[EXTRA_KEY_NAME_CHIRHO]?.trim();
	if (!keyChirho) throw new FundingRefusalChirho('Extra speech credential missing');
	const responseChirho = await fetch('https://api.elevenlabs.io/v1/user/subscription', {
		headers: { 'xi-api-key': keyChirho },
		redirect: 'error',
		signal: AbortSignal.timeout(15000)
	});
	if (!responseChirho.ok)
		throw new FundingRefusalChirho(
			`Subscription reconciliation refused (${responseChirho.status})`
		);
	const subscriptionChirho = (await responseChirho.json()) as SubscriptionChirho;
	const idChirho = 'settle-' + randomUUIDChirho() + '-chirho';
	const resultChirho = settleReceivedChirho(
		groupsChirho,
		subscriptionChirho,
		authorityChirho.reset_unix_chirho,
		idChirho
	);
	if (applyChirho) {
		const partsChirho = [
			'workspace-chirho',
			'audio-chirho',
			'extra-key-2026-11-03-chirho',
			'settlements-chirho',
			idChirho
		];
		let folderChirho = rootChirho;
		for (const [indexChirho, partChirho] of partsChirho.entries()) {
			folderChirho = joinChirho(folderChirho, partChirho);
			await mkdirChirho(folderChirho, { recursive: indexChirho < partsChirho.length - 1 });
			if (
				!(await lstatChirho(folderChirho)).isDirectory() ||
				(await lstatChirho(folderChirho)).isSymbolicLink()
			)
				throw new FundingRefusalChirho('Linked settlement output refused');
		}
		const shardsChirho = [];
		const writeChirho = async (pathChirho: string, valueChirho: unknown) => {
			const bytesChirho = Buffer.from(JSON.stringify(valueChirho) + '\n');
			if (bytesChirho.length > 2 * 1024 ** 2)
				throw new FundingRefusalChirho('Settlement shard exceeds bound');
			const fileChirho = await openChirho(pathChirho, 'wx');
			try {
				await fileChirho.writeFile(bytesChirho);
				await fileChirho.sync();
			} finally {
				await fileChirho.close();
			}
			return shaChirho(bytesChirho);
		};
		for (
			let offsetChirho = 0;
			offsetChirho < resultChirho.charges_chirho.length;
			offsetChirho += 512
		) {
			const numberChirho = offsetChirho / 512;
			const groupChirho = String(Math.floor(numberChirho / 10) * 10).padStart(4, '0') + '-chirho';
			await mkdirChirho(joinChirho(folderChirho, groupChirho), { recursive: true });
			const pathChirho =
				groupChirho + '/part-' + String(numberChirho).padStart(4, '0') + '-chirho.json';
			shardsChirho.push({
				path_chirho: pathChirho,
				sha256_chirho: await writeChirho(
					joinChirho(folderChirho, pathChirho),
					resultChirho.charges_chirho.slice(offsetChirho, offsetChirho + 512)
				)
			});
		}
		await writeChirho(joinChirho(folderChirho, 'manifest-chirho.json'), {
			schema_version_chirho: 1,
			id_chirho: idChirho,
			at_chirho: new Date().toISOString(),
			authority_sha256_chirho: shaChirho(authorityBytesChirho),
			reset_unix_chirho: authorityChirho.reset_unix_chirho,
			...resultChirho.report_chirho,
			allocation_note_chirho:
				'Conservative aggregate accounting allocation, not claimed per-request provider bills. Original reservations and all unknown requests remain immutable.',
			shards_chirho: shardsChirho
		});
		const descriptorChirho = await openChirho(folderChirho, 'r');
		try {
			await descriptorChirho.sync();
		} finally {
			await descriptorChirho.close();
		}
	}
	return resultChirho;
}
