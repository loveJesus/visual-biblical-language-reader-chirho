// For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life. — John 3:16 (KJV)
// Workflow: reusable-word-audio-chirho.md. One producer; durable per-batch receipts, no POST retry.
import {
	readFile as readFileChirho,
	statfs as statfsChirho,
	mkdir as mkdirChirho
} from 'node:fs/promises';
import { dirname as dirnameChirho, join as joinChirho, resolve as resolveChirho } from 'node:path';
import {
	AudioBudgetErrorChirho,
	cacheKeyChirho,
	executeAudioPlanChirho,
	fundedCreditsChirho,
	reserveChirho,
	sha256Chirho,
	writeChirho,
	type AudioFundingChirho,
	type ReceiptChirho
} from '../audition_chirho';
import { WORD_HOME_CHIRHO, type LibraryWordChirho } from './prepare_words_chirho';
import { installWordsChirho } from './install_words_chirho';
import { reuseWordsChirho } from './reuse_words_chirho';
import { wordsInstalledChirho } from './installed_words_chirho';
import { acquireLockChirho, type TargetChirho } from '../../publish-chirho/r2_upload_watch_chirho';
import { productionWordRecipeChirho } from '../../../src/lib/domain-chirho/pronunciation-chirho/production-recipe-chirho';
import { spokenWordChirho } from '../../../src/lib/domain-chirho/pronunciation-chirho';

import { BIBLE_WORD_HOME_CHIRHO, otherReservationsChirho } from './global_budget_chirho';
import {
	FundingRefusalChirho,
	isExtraEligibleChirho,
	readExtraFundingChirho,
	selectFundedRowsChirho
} from './funding_chirho';
import { extendLibrariesChirho } from '../../bible-chirho/libraries_chirho';
import { isBibleChapterPathChirho } from '../../../src/lib/bible-chirho/books-chirho';
import { accountedReceiptCreditsChirho } from './credit_accounting_chirho';
import { reconcileFundingChirho } from './reconcile_funding_chirho';
import { lemmaPriorityChirho } from './lemma_priority_chirho';
import {
	maqqefContextRequiredChirho,
	verifyMaqqefOccurrenceChirho,
	type MaqqefVerseChirho
} from './maqqef-chirho/context_chirho';

interface BatchEntryChirho {
	path_chirho: string;
	sha256_chirho: string;
	count_chirho: number;
}
interface BatchRunChirho {
	entry_chirho: BatchEntryChirho;
	folder_chirho: string;
	words_chirho: LibraryWordChirho[];
	receipts_chirho: ReceiptChirho[];
}
interface WordIndexChirho {
	schema_version_chirho: number;
	maximum_total_credits_chirho: number;
	historical_reserved_credits_chirho: number;
	word_count_chirho: number;
	occurrence_count_chirho: number;
	held_occurrences_chirho: number;
	estimated_new_credits_chirho: number;
	batches_chirho: BatchEntryChirho[];
}
/** A changed or unverifiable source occurrence; the batch is held, never guessed. */
export class WordSourceRefusalChirho extends Error {}
export type HoldKindChirho =
	| 'funding_exhausted'
	| 'quota_exhausted'
	| 'provider_hold'
	| 'source_changed'
	| 'storage_floor'
	| 'malformed'
	| 'refused';
class ProducerHoldChirho extends Error {
	constructor(
		readonly kindChirho: HoldKindChirho,
		messageChirho: string
	) {
		super(messageChirho);
	}
}
/** Checkpoint vocabulary: exhausted pools and quotas stay distinct from malformed work. */
export function holdKindChirho(errorChirho: unknown): HoldKindChirho {
	if (errorChirho instanceof ProducerHoldChirho) return errorChirho.kindChirho;
	if (errorChirho instanceof AudioBudgetErrorChirho)
		return errorChirho.kindChirho === 'ledger' ? 'funding_exhausted' : 'quota_exhausted';
	if (errorChirho instanceof WordSourceRefusalChirho) return 'source_changed';
	if (errorChirho instanceof FundingRefusalChirho) return 'refused';
	if (errorChirho instanceof Error && /reconciliation|Provider hold/u.test(errorChirho.message))
		return 'provider_hold';
	return 'refused';
}
const readJsonChirho = async <ValueChirho>(pathChirho: string) =>
	JSON.parse(await readFileChirho(pathChirho, 'utf8')) as ValueChirho;
async function receiptsChirho(folderChirho: string): Promise<ReceiptChirho[]> {
	try {
		return await readJsonChirho<ReceiptChirho[]>(joinChirho(folderChirho, 'receipts-chirho.json'));
	} catch (errorChirho) {
		if ((errorChirho as NodeJS.ErrnoException).code === 'ENOENT') return [];
		throw errorChirho;
	}
}
const sumReservedChirho = (
	rowsChirho: readonly ReceiptChirho[],
	fundingChirho?: AudioFundingChirho
) =>
	rowsChirho.reduce(
		(totalChirho, rowChirho) =>
			totalChirho + accountedReceiptCreditsChirho(rowChirho, fundingChirho),
		0
	);
const receivedChirho = (rowsChirho: readonly ReceiptChirho[]) =>
	rowsChirho.filter((rowChirho) => rowChirho.state_chirho === 'received').length;
export async function verifyWordSourcesChirho(
	rootChirho: string,
	wordsChirho: LibraryWordChirho[]
) {
	const chaptersChirho = new Map<
		string,
		{
			sha_chirho: string;
			verses_chirho: MaqqefVerseChirho[];
		}
	>();
	for (const wordChirho of wordsChirho) {
		if (
			wordChirho.key_chirho.length !== 64 ||
			wordChirho.key_chirho !== cacheKeyChirho(wordChirho.job_chirho) ||
			wordChirho.occurrences_chirho.length < 1 ||
			wordChirho.occurrences_chirho.length > 30000
		)
			throw new WordSourceRefusalChirho('Word source scope refused');
		const jobChirho = wordChirho.job_chirho;
		if (
			!wordChirho.occurrences_chirho.some(
				(rowChirho) =>
					rowChirho.lesson_id_chirho === jobChirho.lesson_id_chirho &&
					rowChirho.token_id_chirho === jobChirho.token_id_chirho &&
					rowChirho.canonical_sha256_chirho === jobChirho.canonical_sha256_chirho &&
					rowChirho.text_chirho === jobChirho.text_chirho
			)
		)
			throw new WordSourceRefusalChirho('Word representative is not in its source');
		for (const occurrenceChirho of wordChirho.occurrences_chirho) {
			if (!isBibleChapterPathChirho(occurrenceChirho.content_path_chirho, '/content-chirho/'))
				throw new WordSourceRefusalChirho('Word source path refused');
			let chapterChirho = chaptersChirho.get(occurrenceChirho.content_path_chirho);
			if (!chapterChirho) {
				const bytesChirho = await readFileChirho(
					joinChirho(rootChirho, 'static', occurrenceChirho.content_path_chirho)
				);
				chapterChirho = {
					sha_chirho: sha256Chirho(bytesChirho),
					verses_chirho: JSON.parse(bytesChirho.toString('utf8')).verses_chirho
				};
				chaptersChirho.set(occurrenceChirho.content_path_chirho, chapterChirho);
			}
			if (chapterChirho.sha_chirho !== occurrenceChirho.content_sha256_chirho)
				throw new WordSourceRefusalChirho('Word source chapter changed');
			const verseChirho = chapterChirho.verses_chirho.find(
				(rowChirho) => rowChirho.id_chirho === occurrenceChirho.lesson_id_chirho
			);
			const tokenChirho = verseChirho?.tokens_chirho.find(
				(rowChirho) => rowChirho.id_chirho === occurrenceChirho.token_id_chirho
			);
			if (
				!verseChirho ||
				!tokenChirho ||
				sha256Chirho(verseChirho.canonical_text_chirho) !==
					occurrenceChirho.canonical_sha256_chirho ||
				spokenWordChirho(tokenChirho) !== occurrenceChirho.text_chirho
			)
				throw new WordSourceRefusalChirho('Word context changed');
			if (maqqefContextRequiredChirho(wordChirho)) {
				try {
					verifyMaqqefOccurrenceChirho(
						verseChirho,
						occurrenceChirho,
						jobChirho,
						wordChirho.source_context_chirho
					);
				} catch (errorChirho) {
					throw new WordSourceRefusalChirho(
						errorChirho instanceof Error ? errorChirho.message : 'Maqqef source context refused'
					);
				}
			}
			const inputChirho = productionWordRecipeChirho(
				occurrenceChirho.text_chirho,
				jobChirho.recipe_id_chirho,
				jobChirho.ipa_chirho
			);
			if (!inputChirho || inputChirho.synthesis_text_chirho !== jobChirho.synthesis_text_chirho)
				throw new WordSourceRefusalChirho(
					'Shared word pronunciation does not match its occurrence'
				);
		}
	}
}

async function runUnlockedWordsChirho(
	rootChirho: string,
	applyChirho = false,
	limitChirho = 20000,
	wholeBibleChirho = false,
	fundingChirho?: AudioFundingChirho,
	reconcileChirho = false,
	lemmaFirstChirho = false
) {
	const scopeHomeChirho = wholeBibleChirho ? BIBLE_WORD_HOME_CHIRHO : WORD_HOME_CHIRHO;
	const homeChirho = joinChirho(rootChirho, scopeHomeChirho),
		indexBytesChirho = await readFileChirho(joinChirho(homeChirho, 'index-chirho.json'));
	const indexChirho = JSON.parse(indexBytesChirho.toString('utf8')) as WordIndexChirho;
	if (
		indexChirho.schema_version_chirho !== 1 ||
		indexChirho.historical_reserved_credits_chirho !== 10660 ||
		indexChirho.maximum_total_credits_chirho !== 270000 ||
		indexChirho.batches_chirho.length > (wholeBibleChirho ? 1000 : 250) ||
		!Number.isSafeInteger(limitChirho) ||
		limitChirho < 1 ||
		limitChirho > 20000
	)
		throw new ProducerHoldChirho('malformed', 'Word production bound differs');
	// The prepared index keeps its 270,000 ceiling; only the explicit funded mode may exceed it.
	const ceilingChirho =
		fundingChirho?.maximum_total_credits_chirho ?? indexChirho.maximum_total_credits_chirho;
	const reserveOptionsChirho = fundingChirho
		? { funding_chirho: fundingChirho, eligible_chirho: isExtraEligibleChirho }
		: {};
	const entriesChirho: BatchRunChirho[] = [];
	const pathsChirho = new Set<string>(),
		keysChirho = new Set<string>();
	const otherChirho = await otherReservationsChirho(rootChirho, scopeHomeChirho);
	let priorChirho = indexChirho.historical_reserved_credits_chirho + otherChirho.credits_chirho,
		poolChirho = 0,
		pendingHebrewChirho = 0,
		pendingHebrewCreditsChirho = 0;
	for (const entryChirho of indexChirho.batches_chirho) {
		if (
			!/^batches-chirho\/\d{4}-chirho\/batch-\d{4}-chirho\/plan-chirho\.json$/u.test(
				entryChirho.path_chirho
			)
		)
			throw new ProducerHoldChirho('malformed', 'Word batch path refused');
		if (pathsChirho.has(entryChirho.path_chirho))
			throw new ProducerHoldChirho('malformed', 'Duplicate word batch refused');
		pathsChirho.add(entryChirho.path_chirho);
		const pathChirho = joinChirho(homeChirho, entryChirho.path_chirho),
			bytesChirho = await readFileChirho(pathChirho);
		if (bytesChirho.length > 4_000_000 || sha256Chirho(bytesChirho) !== entryChirho.sha256_chirho)
			throw new ProducerHoldChirho('malformed', 'Prepared word batch changed');
		const wordsChirho = (
			JSON.parse(bytesChirho.toString('utf8')) as { words_chirho: LibraryWordChirho[] }
		).words_chirho;
		if (wordsChirho.length !== entryChirho.count_chirho || wordsChirho.length > 96)
			throw new ProducerHoldChirho('malformed', 'Word batch count differs');
		for (const wordChirho of wordsChirho) {
			if (
				keysChirho.has(wordChirho.key_chirho) ||
				otherChirho.keys_chirho.has(wordChirho.key_chirho)
			)
				throw new ProducerHoldChirho('malformed', 'Duplicate pronunciation request refused');
			keysChirho.add(wordChirho.key_chirho);
		}
		const folderChirho = dirnameChirho(pathChirho),
			batchReceiptsChirho = await receiptsChirho(folderChirho);
		reserveChirho(
			wordsChirho.map((rowChirho) => rowChirho.job_chirho),
			batchReceiptsChirho,
			0,
			'production',
			reserveOptionsChirho
		);
		priorChirho += sumReservedChirho(batchReceiptsChirho);
		if (fundingChirho) {
			poolChirho += fundedCreditsChirho(batchReceiptsChirho, fundingChirho.id_chirho);
			for (const wordChirho of wordsChirho)
				if (
					isExtraEligibleChirho(wordChirho.job_chirho) &&
					!batchReceiptsChirho.some(
						(rowChirho) => rowChirho.id_chirho === wordChirho.job_chirho.id_chirho
					)
				) {
					pendingHebrewChirho++;
					pendingHebrewCreditsChirho += [
						...(wordChirho.job_chirho.synthesis_text_chirho ?? wordChirho.job_chirho.text_chirho)
					].length;
				}
		}
		entriesChirho.push({
			entry_chirho: entryChirho,
			folder_chirho: folderChirho,
			words_chirho: wordsChirho,
			receipts_chirho: batchReceiptsChirho
		});
	}
	if (keysChirho.size !== indexChirho.word_count_chirho)
		throw new ProducerHoldChirho('malformed', 'Word inventory count differs');
	let settlementReportChirho: Record<string, string | number> | undefined;
	if (reconcileChirho) {
		if (!fundingChirho)
			throw new FundingRefusalChirho('Reconciliation requires explicit extra-key funding');
		const resultChirho = await reconcileFundingChirho(
			rootChirho,
			fundingChirho,
			entriesChirho.map((batchChirho) => ({
				path_chirho: batchChirho.entry_chirho.path_chirho.replace(
					/plan-chirho\.json$/u,
					'receipts-chirho.json'
				),
				receipts_chirho: batchChirho.receipts_chirho
			})),
			applyChirho
		);
		fundingChirho.settlement_chirho = resultChirho.settlement_chirho;
		settlementReportChirho = resultChirho.report_chirho;
		const rawPoolChirho = poolChirho;
		poolChirho = entriesChirho.reduce(
			(totalChirho, batchChirho) =>
				totalChirho +
				fundedCreditsChirho(batchChirho.receipts_chirho, fundingChirho!.id_chirho, fundingChirho),
			0
		);
		priorChirho -= rawPoolChirho - poolChirho;
	}
	if (priorChirho > ceilingChirho)
		throw new ProducerHoldChirho(
			'funding_exhausted',
			'Reserved word credits exceed the fixed ceiling'
		);
	if (fundingChirho && poolChirho > fundingChirho.additional_credits_chirho)
		throw new ProducerHoldChirho('malformed', 'Funded reservations exceed their authority');
	const priorityChirho = lemmaFirstChirho
		? await lemmaPriorityChirho(rootChirho, entriesChirho)
		: undefined;
	const fundingReportChirho = () =>
		fundingChirho
			? {
					funding_id_chirho: fundingChirho.id_chirho,
					funding_key_name_chirho: fundingChirho.key_name_chirho,
					funding_reserved_credits_chirho: poolChirho,
					funding_limit_credits_chirho: fundingChirho.additional_credits_chirho,
					selection_chirho: 'israeli-hebrew-ipa-only',
					...(priorityChirho ? { lemma_priority_chirho: priorityChirho.report_chirho } : {}),
					...(settlementReportChirho
						? {
								settlement_id_chirho: fundingChirho.settlement_chirho?.id_chirho,
								settlement_chirho: settlementReportChirho
							}
						: {})
				}
			: {};
	if (!applyChirho)
		return {
			dry_run_chirho: true,
			unique_words_chirho: indexChirho.word_count_chirho,
			occurrences_chirho: indexChirho.occurrence_count_chirho,
			source_holds_chirho: indexChirho.held_occurrences_chirho,
			reserved_credits_chirho: priorChirho,
			estimated_new_credits_chirho: indexChirho.estimated_new_credits_chirho,
			...(fundingChirho
				? {
						...fundingReportChirho(),
						maximum_total_credits_chirho: ceilingChirho,
						pending_hebrew_words_chirho: pendingHebrewChirho,
						pending_hebrew_credits_chirho: pendingHebrewCreditsChirho
					}
				: {})
		};
	const accountChirho = process.env.CLOUDFLARE_GLOBAL_API_MAIN_ACCOUNT_ID_CHIRHO ?? '';
	if (
		!/^[a-f0-9]{32}$/u.test(accountChirho) ||
		!accountChirho.endsWith('84bd') ||
		!process.env.CLOUDFLARE_GLOBAL_API_EMAIL_CHIRHO ||
		!process.env.CLOUDFLARE_GLOBAL_API_KEY_CHIRHO
	)
		throw new Error('Hinneh archive target unavailable');
	const targetChirho: TargetChirho = {
		account_chirho: accountChirho,
		bucket_chirho: 'hinneh-media-chirho',
		email_chirho: process.env.CLOUDFLARE_GLOBAL_API_EMAIL_CHIRHO,
		api_key_chirho: process.env.CLOUDFLARE_GLOBAL_API_KEY_CHIRHO
	};
	const releaseChirho = await acquireLockChirho(
		joinChirho(homeChirho, 'word-production-chirho.lock')
	);
	let stoppingChirho = false,
		fundingExhaustedChirho = false,
		requestsChirho = 0,
		receivedCountChirho = entriesChirho.reduce(
			(totalChirho, rowChirho) => totalChirho + receivedChirho(rowChirho.receipts_chirho),
			0
		);
	const sourceHoldsChirho: { batch_chirho: string; reason_chirho: string }[] = [];
	const stopChirho = () => {
		stoppingChirho = true;
	};
	process.once('SIGINT', stopChirho);
	process.once('SIGTERM', stopChirho);
	const progressChirho = async (stateChirho: string, extraChirho: Record<string, unknown> = {}) =>
		writeChirho(
			joinChirho(homeChirho, 'progress-chirho.json'),
			JSON.stringify(
				{
					state_chirho: stateChirho,
					updated_at_chirho: new Date().toISOString(),
					unique_words_chirho: indexChirho.word_count_chirho,
					received_words_chirho: receivedCountChirho,
					source_held_occurrences_chirho: indexChirho.held_occurrences_chirho,
					reserved_credits_chirho: priorChirho,
					maximum_total_credits_chirho: ceilingChirho,
					...fundingReportChirho(),
					...(fundingChirho ? { source_hold_batches_chirho: sourceHoldsChirho } : {}),
					...extraChirho
				},
				null,
				2
			) + '\n'
		);
	const publishChirho = async (batchChirho: BatchRunChirho, currentChirho: ReceiptChirho[]) => {
		await installWordsChirho(
			rootChirho,
			batchChirho.folder_chirho,
			batchChirho.words_chirho,
			currentChirho,
			targetChirho
		);
		if (wholeBibleChirho) {
			const releaseLibraryChirho = await acquireLockChirho(
				joinChirho(rootChirho, 'build-chirho/r2-chirho/audio-catalogue-chirho.lock')
			);
			try {
				await extendLibrariesChirho(rootChirho);
			} finally {
				await releaseLibraryChirho();
			}
		}
	};
	try {
		const passesChirho = priorityChirho
			? [
					...entriesChirho.map((batchChirho) => ({ batchChirho, seedChirho: true })),
					...entriesChirho.map((batchChirho) => ({ batchChirho, seedChirho: false }))
				]
			: entriesChirho.map((batchChirho) => ({ batchChirho, seedChirho: false }));
		for (const { batchChirho, seedChirho } of passesChirho) {
			if (stoppingChirho || requestsChirho >= limitChirho) break;
			const fsChirho = await statfsChirho(rootChirho);
			if (fsChirho.bavail * fsChirho.bsize < 2 * 1024 ** 3)
				throw new ProducerHoldChirho('storage_floor', 'Storage floor reached; no new word request');
			try {
				await verifyWordSourcesChirho(rootChirho, batchChirho.words_chirho);
			} catch (errorChirho) {
				// Funded mode holds only the changed batch and continues independent ready words.
				if (!fundingChirho || !(errorChirho instanceof WordSourceRefusalChirho)) throw errorChirho;
				sourceHoldsChirho.push({
					batch_chirho: batchChirho.entry_chirho.path_chirho,
					reason_chirho: errorChirho.message
				});
				await progressChirho('source_held', { batch_chirho: batchChirho.entry_chirho.path_chirho });
				continue;
			}
			if (fundingChirho) {
				const hasPendingChirho = batchChirho.words_chirho.some(
					(wordChirho) =>
						isExtraEligibleChirho(wordChirho.job_chirho) &&
						!batchChirho.receipts_chirho.some(
							(rowChirho) => rowChirho.id_chirho === wordChirho.job_chirho.id_chirho
						)
				);
				if (!hasPendingChirho) {
					// Nothing to request: only repair a received word that never reached publication.
					const receivedWordsChirho = batchChirho.words_chirho.filter((wordChirho) =>
						batchChirho.receipts_chirho.some(
							(rowChirho) =>
								rowChirho.id_chirho === wordChirho.job_chirho.id_chirho &&
								rowChirho.state_chirho === 'received'
						)
					);
					if (
						receivedWordsChirho.length &&
						!(await wordsInstalledChirho(
							rootChirho,
							batchChirho.folder_chirho,
							receivedWordsChirho,
							batchChirho.receipts_chirho
						))
					) {
						await publishChirho(batchChirho, batchChirho.receipts_chirho);
						await progressChirho('installed', {
							batch_chirho: batchChirho.entry_chirho.path_chirho,
							repaired_chirho: true
						});
					}
					continue;
				}
			} else if (
				await wordsInstalledChirho(
					rootChirho,
					batchChirho.folder_chirho,
					batchChirho.words_chirho,
					batchChirho.receipts_chirho
				)
			) {
				await progressChirho('installed', {
					batch_chirho: batchChirho.entry_chirho.path_chirho,
					cache_hit_chirho: true
				});
				console.log(
					JSON.stringify({
						at_chirho: new Date().toISOString(),
						batch_chirho: batchChirho.entry_chirho.path_chirho,
						cache_hit_chirho: true,
						verification_chirho: 'source_archive_and_installed_hashes'
					})
				);
				continue;
			}
			const receivedBeforeReuseChirho = receivedChirho(batchChirho.receipts_chirho);
			await reuseWordsChirho(
				rootChirho,
				batchChirho.folder_chirho,
				batchChirho.words_chirho,
				batchChirho.receipts_chirho
			);
			receivedCountChirho +=
				receivedChirho(batchChirho.receipts_chirho) - receivedBeforeReuseChirho;
			const previousCostChirho = sumReservedChirho(batchChirho.receipts_chirho, fundingChirho);
			const previousPoolChirho = fundingChirho
				? fundedCreditsChirho(batchChirho.receipts_chirho, fundingChirho.id_chirho, fundingChirho)
				: 0;
			const beforeChirho = receivedChirho(batchChirho.receipts_chirho);
			const jobsChirho = batchChirho.words_chirho.map((rowChirho) => rowChirho.job_chirho);
			const selectionChirho = fundingChirho
				? selectFundedRowsChirho(
						jobsChirho.filter(
							(jobChirho) => !seedChirho || priorityChirho!.ids_chirho.has(jobChirho.id_chirho)
						),
						batchChirho.receipts_chirho,
						Math.min(
							fundingChirho.additional_credits_chirho - poolChirho,
							ceilingChirho - priorChirho
						),
						Math.min(200, limitChirho - requestsChirho)
					)
				: null;
			if (selectionChirho && !selectionChirho.selected_ids_chirho.size) {
				// Historical clips adopted by reuse still reach publication before any stop.
				if (receivedChirho(batchChirho.receipts_chirho) > receivedBeforeReuseChirho)
					await publishChirho(batchChirho, batchChirho.receipts_chirho);
				if (selectionChirho.exhausted_chirho) {
					fundingExhaustedChirho = true;
					break;
				}
				continue;
			}
			await progressChirho('generating', { batch_chirho: batchChirho.entry_chirho.path_chirho });
			const resultChirho = await executeAudioPlanChirho(rootChirho, true, {
				mode_chirho: 'production',
				should_stop_chirho: () => stoppingChirho,
				on_receipt_chirho: async (rowsChirho) =>
					progressChirho('generating', {
						batch_chirho: batchChirho.entry_chirho.path_chirho,
						received_words_chirho: receivedCountChirho + receivedChirho(rowsChirho) - beforeChirho,
						reserved_credits_chirho:
							priorChirho - previousCostChirho + sumReservedChirho(rowsChirho, fundingChirho)
					}),
				rows_chirho: jobsChirho,
				folder_chirho: batchChirho.folder_chirho,
				prior_credits_chirho: priorChirho - previousCostChirho,
				limit_chirho: selectionChirho
					? selectionChirho.selected_ids_chirho.size
					: Math.min(200, limitChirho - requestsChirho),
				verify_source_chirho: async () => {
					await verifyWordSourcesChirho(rootChirho, batchChirho.words_chirho);
				},
				...(fundingChirho && selectionChirho
					? {
							funding_chirho: {
								...fundingChirho,
								pool_prior_credits_chirho: poolChirho - previousPoolChirho
							},
							eligible_chirho: (jobChirho: { id_chirho: string }) =>
								selectionChirho.selected_ids_chirho.has(jobChirho.id_chirho)
						}
					: {})
			});
			const currentChirho = await receiptsChirho(batchChirho.folder_chirho);
			requestsChirho += currentChirho.length - batchChirho.receipts_chirho.length;
			priorChirho += sumReservedChirho(currentChirho, fundingChirho) - previousCostChirho;
			if (fundingChirho)
				poolChirho +=
					fundedCreditsChirho(currentChirho, fundingChirho.id_chirho, fundingChirho) -
					previousPoolChirho;
			receivedCountChirho += receivedChirho(currentChirho) - beforeChirho;
			batchChirho.receipts_chirho = currentChirho;
			await publishChirho(batchChirho, currentChirho);
			await progressChirho('installed', {
				batch_chirho: batchChirho.entry_chirho.path_chirho,
				unknown_requests_chirho: currentChirho.filter(
					(rowChirho) => rowChirho.state_chirho === 'requested'
				).length
			});
			console.log(
				JSON.stringify({
					at_chirho: new Date().toISOString(),
					received_words_chirho: receivedCountChirho,
					total_words_chirho: indexChirho.word_count_chirho,
					reserved_credits_chirho: priorChirho,
					...(fundingChirho ? { funding_reserved_credits_chirho: poolChirho } : {}),
					batch_chirho: batchChirho.entry_chirho.path_chirho,
					cache_hit_chirho:
						'cache_hit_chirho' in resultChirho ? resultChirho.cache_hit_chirho : false
				})
			);
			const providerStateChirho = await readJsonChirho<{ provider_hold_chirho?: boolean }>(
				joinChirho(batchChirho.folder_chirho, 'batch-status-chirho.json')
			).catch((errorChirho) => {
				if ((errorChirho as NodeJS.ErrnoException).code === 'ENOENT')
					return { provider_hold_chirho: false };
				throw errorChirho;
			});
			if (providerStateChirho.provider_hold_chirho)
				throw new ProducerHoldChirho(
					'provider_hold',
					'Provider hold retained; unknown requests will not retry'
				);
			if (selectionChirho?.exhausted_chirho) {
				fundingExhaustedChirho = true;
				break;
			}
		}
		await progressChirho(
			stoppingChirho
				? 'drained'
				: fundingExhaustedChirho
					? 'funding_exhausted'
					: receivedCountChirho === indexChirho.word_count_chirho
						? 'generated_with_source_holds'
						: 'bounded_pass_finished'
		);
		return {
			received_words_chirho: receivedCountChirho,
			new_requests_chirho: requestsChirho,
			drained_chirho: stoppingChirho,
			reserved_credits_chirho: priorChirho,
			...(fundingChirho
				? {
						...fundingReportChirho(),
						funding_exhausted_chirho: fundingExhaustedChirho,
						source_hold_batches_chirho: sourceHoldsChirho.length
					}
				: {})
		};
	} catch (errorChirho) {
		await progressChirho('held', {
			reason_chirho: errorChirho instanceof Error ? errorChirho.message : 'Unknown producer error',
			hold_kind_chirho: holdKindChirho(errorChirho)
		});
		throw errorChirho;
	} finally {
		process.removeListener('SIGINT', stopChirho);
		process.removeListener('SIGTERM', stopChirho);
		await releaseChirho();
	}
}
export async function runWordsChirho(
	rootChirho: string,
	applyChirho = false,
	limitChirho = 20000,
	wholeBibleChirho = false,
	extraKeyChirho = false,
	reconcileChirho = false,
	lemmaFirstChirho = false,
	continueIncludedChirho = false
) {
	if (extraKeyChirho && !wholeBibleChirho)
		throw new FundingRefusalChirho('Extra-key mode requires --whole-bible-chirho');
	if (reconcileChirho && !extraKeyChirho)
		throw new FundingRefusalChirho('Reconciliation requires --extra-key-chirho');
	if (lemmaFirstChirho && !extraKeyChirho)
		throw new FundingRefusalChirho('Lemma-first mode requires --extra-key-chirho');
	if (continueIncludedChirho && (!applyChirho || !reconcileChirho || !lemmaFirstChirho))
		throw new FundingRefusalChirho(
			'Included continuation requires apply, reconciliation and lemma-first mode'
		);
	// The fixed authority and its named credential are checked before any ledger is read.
	const fundingChirho = extraKeyChirho ? await readExtraFundingChirho(rootChirho) : undefined;
	if (!applyChirho)
		return runUnlockedWordsChirho(
			rootChirho,
			false,
			limitChirho,
			wholeBibleChirho,
			fundingChirho,
			reconcileChirho,
			lemmaFirstChirho
		);
	// Lock before reading either queue's reservations, so a second scope cannot spend a stale balance.
	await mkdirChirho(joinChirho(rootChirho, 'build-chirho/r2-chirho'), { recursive: true });
	const releaseChirho = await acquireLockChirho(
		joinChirho(rootChirho, 'build-chirho/r2-chirho/audio-production-chirho.lock')
	);
	let stoppingChirho = false;
	const stopChirho = () => {
		stoppingChirho = true;
	};
	process.on('SIGINT', stopChirho);
	process.on('SIGTERM', stopChirho);
	let totalRequestsChirho = 0;
	try {
		for (let roundChirho = 1; roundChirho <= 16; roundChirho++) {
			const resultChirho = await runUnlockedWordsChirho(
				rootChirho,
				true,
				limitChirho - totalRequestsChirho,
				wholeBibleChirho,
				roundChirho === 1 ? fundingChirho : await readExtraFundingChirho(rootChirho),
				reconcileChirho,
				lemmaFirstChirho
			);
			if (!('new_requests_chirho' in resultChirho))
				throw new Error('Applied producer returned a dry result');
			totalRequestsChirho += resultChirho.new_requests_chirho;
			if (
				!continueIncludedChirho ||
				stoppingChirho ||
				!continueIncludedRoundChirho(resultChirho, roundChirho, totalRequestsChirho, limitChirho)
			)
				return {
					...resultChirho,
					new_requests_chirho: totalRequestsChirho,
					settlement_rounds_chirho: roundChirho
				};
		}
		throw new Error('Included continuation exceeded its fixed round bound');
	} finally {
		process.removeListener('SIGINT', stopChirho);
		process.removeListener('SIGTERM', stopChirho);
		await releaseChirho();
	}
}
/** Only a productive estimate-limited pass may reconcile again within the same fixed allowance. */
export function continueIncludedRoundChirho(
	resultChirho: {
		new_requests_chirho: number;
		funding_exhausted_chirho?: boolean;
		drained_chirho?: boolean;
	},
	roundChirho: number,
	totalRequestsChirho: number,
	limitChirho: number
) {
	return (
		resultChirho.funding_exhausted_chirho === true &&
		resultChirho.drained_chirho !== true &&
		Number.isSafeInteger(resultChirho.new_requests_chirho) &&
		resultChirho.new_requests_chirho > 0 &&
		roundChirho >= 1 &&
		roundChirho < 16 &&
		totalRequestsChirho > 0 &&
		totalRequestsChirho < limitChirho
	);
}
if (import.meta.main) {
	const argumentsChirho = process.argv.slice(2);
	const limitIndexChirho = argumentsChirho.indexOf('--limit-chirho');
	for (const [indexChirho, valueChirho] of argumentsChirho.entries())
		if (
			![
				'--apply-chirho',
				'--limit-chirho',
				'--whole-bible-chirho',
				'--extra-key-chirho',
				'--reconcile-extra-key-chirho',
				'--lemma-first-chirho',
				'--continue-included-chirho'
			].includes(valueChirho) &&
			argumentsChirho[indexChirho - 1] !== '--limit-chirho'
		)
			throw new Error('Unsupported word producer argument');
	console.log(
		JSON.stringify(
			await runWordsChirho(
				resolveChirho('.'),
				argumentsChirho.includes('--apply-chirho'),
				limitIndexChirho < 0 ? 20000 : Number(argumentsChirho[limitIndexChirho + 1]),
				argumentsChirho.includes('--whole-bible-chirho'),
				argumentsChirho.includes('--extra-key-chirho'),
				argumentsChirho.includes('--reconcile-extra-key-chirho'),
				argumentsChirho.includes('--lemma-first-chirho'),
				argumentsChirho.includes('--continue-included-chirho')
			)
		)
	);
}
