// For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life. — John 3:16 (KJV)
// Workflow: reusable-word-audio-chirho.md. Three disjoint batches, one installer and a fully reserved pass.
import {
	readFile as readFileChirho,
	statfs as statfsChirho,
	lstat as lstatChirho,
	appendFile as appendFileChirho
} from 'node:fs/promises';
import { join as joinChirho, dirname as dirnameChirho } from 'node:path';
import {
	cacheKeyChirho,
	executeAudioPlanChirho,
	sha256Chirho,
	writeChirho,
	type ReceiptChirho
} from '../../audition_chirho';
import { BIBLE_WORD_HOME_CHIRHO, otherReservationsChirho } from '../global_budget_chirho';
import {
	readExtraFundingChirho,
	isExtraEligibleChirho,
	EXTRA_FUNDING_PATH_CHIRHO
} from '../funding_chirho';
import { accountedReceiptCreditsChirho } from '../credit_accounting_chirho';
import { reconcileFundingChirho } from '../reconcile_funding_chirho';
import { verifyWordSourcesChirho } from '../run_words_chirho';
import { installWordsChirho } from '../install_words_chirho';
import type { LibraryWordChirho } from '../prepare_words_chirho';
import {
	acquireLockChirho,
	type TargetChirho
} from '../../../publish-chirho/r2_upload_watch_chirho';
import { extendLibrariesChirho } from '../../../bible-chirho/libraries_chirho';
import {
	INFLECTION_HOME_CHIRHO,
	INFLECTION_ID_CHIRHO,
	INFLECTION_KEY_CHIRHO,
	INFLECTION_LIMIT_CHIRHO,
	readInflectionAuthorityChirho,
	inflectionAccountChirho,
	inflectionFundingChirho
} from './funding_chirho';
interface PendingChirho {
	batch_path_chirho: string;
	plan_sha256_chirho: string;
	key_chirho: string;
	characters_chirho: number;
	word_chirho: LibraryWordChirho;
}
interface OriginalChirho {
	plan_path_chirho: string;
	plan_sha256_chirho: string;
	receipt_path_chirho: string;
	receipt_sha256_chirho: string | null;
	receipts_chirho: ReceiptChirho[];
}
interface BatchChirho {
	path_chirho: string;
	folder_chirho: string;
	words_chirho: LibraryWordChirho[];
	selected_chirho: LibraryWordChirho[];
	credits_chirho: number;
	old_credits_chirho: number;
	receipts_chirho: ReceiptChirho[];
}
async function jsonChirho<ValueChirho>(
	pathChirho: string,
	maximumChirho = 32 * 1024 ** 2
): Promise<ValueChirho> {
	const infoChirho = await lstatChirho(pathChirho);
	if (!infoChirho.isFile() || infoChirho.isSymbolicLink() || infoChirho.size > maximumChirho)
		throw Error('Private production record refused');
	return JSON.parse(await readFileChirho(pathChirho, 'utf8'));
}
async function receiptsChirho(folderChirho: string) {
	try {
		return await jsonChirho<ReceiptChirho[]>(joinChirho(folderChirho, 'receipts-chirho.json'));
	} catch (errorChirho) {
		if ((errorChirho as NodeJS.ErrnoException).code === 'ENOENT') return [];
		throw errorChirho;
	}
}
export async function runInflectionsChirho(
	rootChirho: string,
	applyChirho = false,
	requestLimitChirho = 3343,
	workersChirho = 3
) {
	if (
		!Number.isSafeInteger(requestLimitChirho) ||
		requestLimitChirho < 1 ||
		requestLimitChirho > 3343 ||
		!Number.isSafeInteger(workersChirho) ||
		workersChirho < 1 ||
		workersChirho > 3
	)
		throw Error('Inflection request or concurrency bound refused');
	const homeChirho = joinChirho(rootChirho, INFLECTION_HOME_CHIRHO),
		authorityChirho = await readInflectionAuthorityChirho(rootChirho);
	const snapshotBytesChirho = await readFileChirho(joinChirho(homeChirho, 'pending-chirho.json'));
	if (
		snapshotBytesChirho.length > 32 * 1024 ** 2 ||
		sha256Chirho(snapshotBytesChirho) !== authorityChirho.snapshot_sha256_chirho
	)
		throw Error('Approved pronunciation snapshot changed');
	const snapshotChirho = JSON.parse(snapshotBytesChirho.toString()) as {
		index_sha256_chirho: string;
		pending_chirho: PendingChirho[];
		source_holds_chirho: unknown[];
	};
	const originalBytesChirho = await readFileChirho(
		joinChirho(homeChirho, 'original-ledger-chirho.json')
	);
	if (
		originalBytesChirho.length > 128 * 1024 ** 2 ||
		sha256Chirho(originalBytesChirho) !== authorityChirho.original_ledger_sha256_chirho
	)
		throw Error('Original funding snapshot changed');
	const originalsChirho = JSON.parse(originalBytesChirho.toString()) as {
		index_sha256_chirho: string;
		entries_chirho: OriginalChirho[];
	};
	const indexBytesChirho = await readFileChirho(
		joinChirho(rootChirho, BIBLE_WORD_HOME_CHIRHO, 'index-chirho.json')
	);
	if (
		sha256Chirho(indexBytesChirho) !== authorityChirho.index_sha256_chirho ||
		snapshotChirho.index_sha256_chirho !== authorityChirho.index_sha256_chirho ||
		originalsChirho.index_sha256_chirho !== authorityChirho.index_sha256_chirho ||
		snapshotChirho.source_holds_chirho.length ||
		snapshotChirho.pending_chirho.length !== 3343 ||
		originalsChirho.entries_chirho.length > 1000
	)
		throw Error('Approved prepared index differs');
	if (
		sha256Chirho(await readFileChirho(joinChirho(rootChirho, EXTRA_FUNDING_PATH_CHIRHO))) !==
		authorityChirho.previous_authority_sha256_chirho
	)
		throw Error('Previous funding authority changed');
	const allowedChirho = new Set(
		snapshotChirho.pending_chirho.map((rowChirho) => rowChirho.key_chirho)
	);
	if (
		allowedChirho.size !== 3343 ||
		snapshotChirho.pending_chirho.reduce(
			(sumChirho, rowChirho) => sumChirho + rowChirho.characters_chirho,
			0
		) !== INFLECTION_LIMIT_CHIRHO
	)
		throw Error('Pass key or credit bound differs');
	const releaseChirho = await acquireLockChirho(
		joinChirho(rootChirho, 'build-chirho/r2-chirho/audio-production-chirho.lock')
	);
	let localReleaseChirho: (() => Promise<void>) | undefined;
	let stoppingChirho = false,
		dirtyChirho = false,
		requestedChirho = 0,
		receivedChirho = 0,
		firstFailureChirho: unknown;
	const installedChirho = new Set<string>();
	const stopChirho = () => {
		stoppingChirho = true;
	};
	process.on('SIGTERM', stopChirho);
	process.on('SIGINT', stopChirho);
	try {
		localReleaseChirho = await acquireLockChirho(
			joinChirho(rootChirho, BIBLE_WORD_HOME_CHIRHO, 'word-production-chirho.lock')
		);
		const oldFundingChirho = await readExtraFundingChirho(rootChirho);
		const groupsChirho = originalsChirho.entries_chirho.map((rowChirho) => ({
			path_chirho: rowChirho.plan_path_chirho
				.slice(joinChirho(rootChirho, BIBLE_WORD_HOME_CHIRHO).length + 1)
				.replace(/plan-chirho\.json$/u, 'receipts-chirho.json'),
			receipts_chirho: rowChirho.receipts_chirho
		}));
		const settledChirho = await reconcileFundingChirho(
			rootChirho,
			oldFundingChirho,
			groupsChirho,
			false
		);
		oldFundingChirho.settlement_chirho = settledChirho.settlement_chirho;
		const otherChirho = await otherReservationsChirho(rootChirho, BIBLE_WORD_HOME_CHIRHO);
		const sumChirho = (rowsChirho: ReceiptChirho[]) =>
			rowsChirho.reduce(
				(totalChirho, rowChirho) =>
					totalChirho + accountedReceiptCreditsChirho(rowChirho, oldFundingChirho),
				0
			);
		const legacyCreditsChirho =
			JSON.parse(indexBytesChirho.toString()).historical_reserved_credits_chirho +
			otherChirho.credits_chirho +
			originalsChirho.entries_chirho.reduce(
				(totalChirho, rowChirho) => totalChirho + sumChirho(rowChirho.receipts_chirho),
				0
			);
		if (legacyCreditsChirho > 401000)
			throw Error('Existing funding exceeds its unchanged authority');
		const batchesChirho: BatchChirho[] = [];
		const seenChirho = new Set<string>();
		for (const originalChirho of originalsChirho.entries_chirho) {
			const bytesChirho = await readFileChirho(originalChirho.plan_path_chirho);
			if (sha256Chirho(bytesChirho) !== originalChirho.plan_sha256_chirho)
				throw Error('Original plan changed');
			const wordsChirho = JSON.parse(bytesChirho.toString()).words_chirho as LibraryWordChirho[];
			const folderChirho = dirnameChirho(originalChirho.plan_path_chirho),
				currentChirho = await receiptsChirho(folderChirho);
			if (
				JSON.stringify(currentChirho.slice(0, originalChirho.receipts_chirho.length)) !==
				JSON.stringify(originalChirho.receipts_chirho)
			)
				throw Error('Original receipt prefix changed');
			const selectedChirho = wordsChirho.filter((wordChirho) =>
				allowedChirho.has(wordChirho.key_chirho)
			);
			for (const wordChirho of selectedChirho) {
				const snapshotRowChirho = snapshotChirho.pending_chirho.find(
					(rowChirho) => rowChirho.key_chirho === wordChirho.key_chirho
				)!;
				if (
					seenChirho.has(wordChirho.key_chirho) ||
					cacheKeyChirho(wordChirho.job_chirho) !== wordChirho.key_chirho ||
					!isExtraEligibleChirho(wordChirho.job_chirho) ||
					JSON.stringify(snapshotRowChirho.word_chirho) !== JSON.stringify(wordChirho) ||
					snapshotRowChirho.plan_sha256_chirho !== originalChirho.plan_sha256_chirho
				)
					throw Error('Disjoint Hebrew source reservation changed');
				seenChirho.add(wordChirho.key_chirho);
			}
			const newRowsChirho = currentChirho.slice(originalChirho.receipts_chirho.length);
			for (const rowChirho of newRowsChirho) {
				if (
					!allowedChirho.has(rowChirho.key_chirho) ||
					rowChirho.funding_id_chirho !== INFLECTION_ID_CHIRHO ||
					rowChirho.funding_key_name_chirho !== INFLECTION_KEY_CHIRHO
				)
					throw Error('Foreign or unbound new receipt');
				if (rowChirho.state_chirho === 'received') receivedChirho++;
				else firstFailureChirho ??= Error('Existing unknown speech receipt retained without retry');
			}
			if (selectedChirho.length)
				batchesChirho.push({
					path_chirho: originalChirho.plan_path_chirho,
					folder_chirho: folderChirho,
					words_chirho: wordsChirho,
					selected_chirho: selectedChirho,
					credits_chirho: selectedChirho.reduce(
						(totalChirho, wordChirho) =>
							totalChirho + [...wordChirho.job_chirho.synthesis_text_chirho!].length,
						0
					),
					old_credits_chirho: sumChirho(originalChirho.receipts_chirho),
					receipts_chirho: currentChirho
				});
		}
		if (seenChirho.size !== 3343) throw Error('Some approved key has no original plan');
		if (!applyChirho)
			return {
				apply_chirho: false,
				prepared_chirho: 3343,
				received_chirho: receivedChirho,
				raw_credit_envelope_chirho: INFLECTION_LIMIT_CHIRHO,
				legacy_accounted_credits_chirho: legacyCreditsChirho,
				total_envelope_chirho: legacyCreditsChirho + INFLECTION_LIMIT_CHIRHO,
				workers_chirho: workersChirho
			};
		const initialAccountChirho = await inflectionAccountChirho(authorityChirho);
		if (
			initialAccountChirho.character_count > INFLECTION_LIMIT_CHIRHO ||
			initialAccountChirho.character_limit - initialAccountChirho.character_count <
				INFLECTION_LIMIT_CHIRHO + 1000
		)
			throw Error('Full remaining pass does not fit the included account');
		const targetChirho: TargetChirho = {
			account_chirho: process.env.CLOUDFLARE_GLOBAL_API_MAIN_ACCOUNT_ID_CHIRHO!,
			bucket_chirho: 'hinneh-media-chirho',
			email_chirho: process.env.CLOUDFLARE_GLOBAL_API_EMAIL_CHIRHO!,
			api_key_chirho: process.env.CLOUDFLARE_GLOBAL_API_KEY_CHIRHO!
		};
		if (
			!/^[a-f0-9]{32}$/u.test(targetChirho.account_chirho) ||
			!targetChirho.account_chirho.endsWith('84bd') ||
			!targetChirho.email_chirho ||
			!targetChirho.api_key_chirho
		)
			throw Error('Archive account unavailable');
		let installerChirho = Promise.resolve();
		const progressChirho = async (stateChirho: string) =>
			writeChirho(
				joinChirho(homeChirho, 'progress-chirho.json'),
				JSON.stringify(
					{
						at_chirho: new Date().toISOString(),
						state_chirho: stateChirho,
						total_forms_chirho: 3343,
						received_forms_chirho: receivedChirho,
						installed_this_run_chirho: installedChirho.size,
						requests_this_run_chirho: requestedChirho,
						raw_credit_envelope_chirho: INFLECTION_LIMIT_CHIRHO,
						legacy_accounted_credits_chirho: legacyCreditsChirho,
						maximum_total_credits_chirho: authorityChirho.maximum_total_credits_chirho,
						workers_chirho: workersChirho,
						...(firstFailureChirho ? { failure_chirho: String(firstFailureChirho) } : {})
					},
					null,
					2
				) + '\n'
			);
		const installChirho = async (batchChirho: BatchChirho, rowsChirho: ReceiptChirho[]) => {
			const workChirho = installerChirho.then(async () => {
				await appendFileChirho(
					joinChirho(homeChirho, 'events-chirho.jsonl'),
					JSON.stringify({
						at_chirho: new Date().toISOString(),
						kind_chirho: 'installation_started',
						batch_path_chirho: batchChirho.path_chirho
					}) + '\n',
					{ mode: 0o600 }
				);
				await installWordsChirho(
					rootChirho,
					batchChirho.folder_chirho,
					batchChirho.selected_chirho,
					rowsChirho,
					targetChirho
				);
				for (const rowChirho of rowsChirho)
					if (allowedChirho.has(rowChirho.key_chirho) && rowChirho.state_chirho === 'received')
						installedChirho.add(rowChirho.key_chirho);
				dirtyChirho = true;
				await appendFileChirho(
					joinChirho(homeChirho, 'events-chirho.jsonl'),
					JSON.stringify({
						at_chirho: new Date().toISOString(),
						kind_chirho: 'installation_finished',
						batch_path_chirho: batchChirho.path_chirho
					}) + '\n',
					{ mode: 0o600 }
				);
			});
			installerChirho = workChirho.catch(() => {});
			await workChirho;
		};
		for (const batchChirho of batchesChirho)
			if (
				batchChirho.receipts_chirho.some(
					(rowChirho) =>
						allowedChirho.has(rowChirho.key_chirho) && rowChirho.state_chirho === 'received'
				)
			)
				await installChirho(batchChirho, batchChirho.receipts_chirho);
		const eventChirho = async (kindChirho: string, batchChirho: BatchChirho) =>
			appendFileChirho(
				joinChirho(homeChirho, 'events-chirho.jsonl'),
				JSON.stringify({
					at_chirho: new Date().toISOString(),
					kind_chirho: kindChirho,
					batch_path_chirho: batchChirho.path_chirho
				}) + '\n',
				{ mode: 0o600 }
			);
		const pendingChirho = (batchChirho: BatchChirho) =>
			batchChirho.selected_chirho.filter(
				(wordChirho) =>
					!batchChirho.receipts_chirho.some(
						(rowChirho) => rowChirho.key_chirho === wordChirho.key_chirho
					)
			);
		async function processChirho(batchChirho: BatchChirho, limitChirho: number) {
			if (stoppingChirho) return;
			const storageChirho = await statfsChirho(rootChirho);
			if (storageChirho.bavail * storageChirho.bsize < 2 * 1024 ** 3)
				throw Error('Audio storage floor');
			await verifyWordSourcesChirho(rootChirho, batchChirho.selected_chirho);
			await inflectionAccountChirho(authorityChirho);
			const beforeChirho = batchChirho.receipts_chirho.length;
			const fundingChirho = inflectionFundingChirho(
				authorityChirho,
				settledChirho.settlement_chirho,
				batchChirho.credits_chirho
			);
			const reservedOutsideChirho =
				legacyCreditsChirho -
				batchChirho.old_credits_chirho +
				INFLECTION_LIMIT_CHIRHO -
				batchChirho.credits_chirho;
			await eventChirho('speech_batch_started', batchChirho);
			await executeAudioPlanChirho(rootChirho, true, {
				mode_chirho: 'production',
				rows_chirho: batchChirho.words_chirho.map((wordChirho) => wordChirho.job_chirho),
				folder_chirho: batchChirho.folder_chirho,
				prior_credits_chirho: reservedOutsideChirho,
				limit_chirho: limitChirho,
				funding_chirho: fundingChirho,
				eligible_chirho: (jobChirho) =>
					allowedChirho.has(cacheKeyChirho(jobChirho)) && isExtraEligibleChirho(jobChirho),
				verify_source_chirho: () =>
					verifyWordSourcesChirho(rootChirho, batchChirho.selected_chirho),
				should_stop_chirho: () => stoppingChirho
			});
			await eventChirho('speech_batch_finished', batchChirho);
			const currentChirho = await receiptsChirho(batchChirho.folder_chirho),
				addedChirho = currentChirho.slice(beforeChirho);
			batchChirho.receipts_chirho = currentChirho;
			requestedChirho += addedChirho.length;
			receivedChirho += addedChirho.filter(
				(rowChirho) => rowChirho.state_chirho === 'received'
			).length;
			if (addedChirho.some((rowChirho) => rowChirho.state_chirho !== 'received')) {
				firstFailureChirho = Error('Unknown speech outcome retained without retry');
				stoppingChirho = true;
			}
			await installChirho(batchChirho, currentChirho);
			await progressChirho('generating');
		}
		// One real first request imports the exact licensed voice once, before parallel batches.
		const firstChirho = batchesChirho.find((batchChirho) => pendingChirho(batchChirho).length);
		if (firstChirho && receivedChirho === 0) {
			await processChirho(firstChirho, 1);
		}
		let nextChirho = 0,
			remainingLimitChirho = requestLimitChirho - requestedChirho;
		await Promise.all(
			Array.from({ length: workersChirho }, async () => {
				while (!stoppingChirho && nextChirho < batchesChirho.length && remainingLimitChirho > 0) {
					const batchChirho = batchesChirho[nextChirho++],
						countChirho = Math.min(pendingChirho(batchChirho).length, remainingLimitChirho);
					if (!countChirho) continue;
					remainingLimitChirho -= countChirho;
					try {
						await processChirho(batchChirho, countChirho);
					} catch (errorChirho) {
						firstFailureChirho ??= errorChirho;
						stoppingChirho = true;
					}
				}
			})
		);
		await installerChirho;
		const accountChirho = await inflectionAccountChirho(authorityChirho);
		await writeChirho(
			joinChirho(homeChirho, 'account-final-chirho.json'),
			JSON.stringify(
				{
					at_chirho: new Date().toISOString(),
					character_count_chirho: accountChirho.character_count,
					character_limit_chirho: accountChirho.character_limit,
					can_extend_character_limit_chirho: accountChirho.can_extend_character_limit,
					next_reset_unix_chirho: accountChirho.next_character_count_reset_unix
				},
				null,
				2
			) + '\n'
		);
		await progressChirho(
			firstFailureChirho ? 'held' : receivedChirho === 3343 ? 'complete' : 'bounded_run_finished'
		);
		if (firstFailureChirho) throw firstFailureChirho;
		return {
			received_chirho: receivedChirho,
			requested_chirho: requestedChirho,
			complete_chirho: receivedChirho === 3343
		};
	} catch (errorChirho) {
		if (applyChirho)
			await writeChirho(
				joinChirho(homeChirho, 'progress-chirho.json'),
				JSON.stringify(
					{
						at_chirho: new Date().toISOString(),
						state_chirho: 'held',
						received_forms_chirho: receivedChirho,
						requests_this_run_chirho: requestedChirho,
						failure_chirho: String(errorChirho)
					},
					null,
					2
				) + '\n'
			);
		throw errorChirho;
	} finally {
		try {
			if (applyChirho && dirtyChirho) {
				const libraryReleaseChirho = await acquireLockChirho(
					joinChirho(rootChirho, 'build-chirho/r2-chirho/audio-catalogue-chirho.lock')
				);
				try {
					await extendLibrariesChirho(rootChirho);
				} finally {
					await libraryReleaseChirho();
				}
			}
		} finally {
			process.off('SIGTERM', stopChirho);
			process.off('SIGINT', stopChirho);
			await localReleaseChirho?.();
			await releaseChirho();
		}
	}
}
if (import.meta.main) {
	const argumentsChirho = process.argv.slice(2);
	if (
		argumentsChirho.some(
			(argumentChirho) => !['--apply-chirho', '--pilot-chirho'].includes(argumentChirho)
		)
	)
		throw Error('Unknown inflection producer flag');
	console.log(
		await runInflectionsChirho(
			process.cwd(),
			argumentsChirho.includes('--apply-chirho'),
			argumentsChirho.includes('--pilot-chirho') ? 1 : 3343
		)
	);
}
