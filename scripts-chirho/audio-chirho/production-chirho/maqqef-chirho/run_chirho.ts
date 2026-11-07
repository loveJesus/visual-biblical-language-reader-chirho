// For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life. — John 3:16 (KJV)
// Workflow: reusable-word-audio-chirho.md. Two speech lanes share one exact reserve and installer.
import {
	appendFile as appendFileChirho,
	mkdir as mkdirChirho,
	statfs as statfsChirho
} from 'node:fs/promises';
import { dirname as dirnameChirho, join as joinChirho } from 'node:path';
import {
	cacheKeyChirho,
	executeAudioPlanChirho,
	reserveChirho,
	sha256Chirho,
	synthesisTextChirho,
	writeChirho,
	type ReceiptChirho
} from '../../audition_chirho';
import {
	HEBREW_WORD_RECIPE_CHIRHO,
	productionWordRecipeChirho
} from '../../../../src/lib/domain-chirho/pronunciation-chirho/production-recipe-chirho';
import { verifyWordSourcesChirho } from '../run_words_chirho';
import { installWordsChirho } from '../install_words_chirho';
import type { LibraryWordChirho } from '../prepare_words_chirho';
import {
	acquireLockChirho,
	type TargetChirho
} from '../../../publish-chirho/r2_upload_watch_chirho';
import { extendLibrariesChirho } from '../../../bible-chirho/libraries_chirho';
import { INFLECTION_KEY_CHIRHO } from '../inflections-chirho/funding_chirho';
import {
	MAQQEF_HOME_CHIRHO,
	MAQQEF_PLAN_HOME_CHIRHO,
	MAQQEF_ID_CHIRHO,
	MAQQEF_PRIOR_CHIRHO,
	maqqefAccountChirho,
	maqqefFundingChirho,
	readMaqqefAuthorityChirho,
	readMaqqefFileChirho,
	validateMaqqefAuthorityChirho,
	type MaqqefAuthorityChirho,
	type MaqqefSubscriptionChirho
} from './funding_chirho';

export interface MaqqefPlanChirho {
	words_chirho: LibraryWordChirho[];
	reused_receipts_chirho: ReceiptChirho[];
}
interface MaqqefBatchChirho extends MaqqefPlanChirho {
	path_chirho: string;
	sha256_chirho: string;
	folder_chirho: string;
	new_units_chirho: number;
	receipts_chirho: ReceiptChirho[];
}
interface MaqqefCandidatesChirho {
	words_chirho: LibraryWordChirho[];
}
interface MaqqefPriorChirho {
	accounted_credits_chirho: number;
	files_chirho: { path_chirho: string; sha256_chirho: string }[];
}
export interface MaqqefServicesChirho {
	verify_source_chirho: typeof verifyWordSourcesChirho;
	account_chirho: (authorityChirho: MaqqefAuthorityChirho) => Promise<MaqqefSubscriptionChirho>;
	execute_chirho: typeof executeAudioPlanChirho;
	install_chirho: (...argumentsChirho: Parameters<typeof installWordsChirho>) => Promise<unknown>;
	extend_chirho: (rootChirho: string) => Promise<unknown>;
	target_chirho: () => TargetChirho;
	storage_chirho: (rootChirho: string) => Promise<number>;
}
const unitsChirho = (wordChirho: LibraryWordChirho) =>
	[...synthesisTextChirho(wordChirho.job_chirho)].length;
const receiptBytesChirho = (rowsChirho: ReceiptChirho[]) => JSON.stringify(rowsChirho);

/** Pure pass validation binds the disjoint plans, explicit new keys and zero-cost reused prefix. */
export function validateMaqqefPlansChirho(
	authorityChirho: MaqqefAuthorityChirho,
	candidatesChirho: MaqqefCandidatesChirho,
	plansChirho: MaqqefPlanChirho[]
) {
	validateMaqqefAuthorityChirho(authorityChirho);
	if (
		!Array.isArray(candidatesChirho.words_chirho) ||
		candidatesChirho.words_chirho.length !== authorityChirho.total_forms_chirho ||
		plansChirho.length < 1 ||
		plansChirho.length > 20
	)
		throw Error('Maqqef candidate or batch bound differs');
	const candidatesByKeyChirho = new Map(
		candidatesChirho.words_chirho.map((wordChirho) => [wordChirho.key_chirho, wordChirho])
	);
	if (candidatesByKeyChirho.size !== authorityChirho.total_forms_chirho)
		throw Error('Maqqef candidate keys are not disjoint');
	const seenChirho = new Set<string>(),
		newKeysChirho = new Set(authorityChirho.new_keys_chirho);
	let newUnitsChirho = 0;
	for (const planChirho of plansChirho) {
		if (
			!Array.isArray(planChirho.words_chirho) ||
			!Array.isArray(planChirho.reused_receipts_chirho) ||
			planChirho.words_chirho.length < 1 ||
			planChirho.words_chirho.length > 96 ||
			new Set(planChirho.reused_receipts_chirho.map((rowChirho) => rowChirho.id_chirho)).size !==
				planChirho.reused_receipts_chirho.length
		)
			throw Error('Maqqef plan or reused receipt bound differs');
		for (const wordChirho of planChirho.words_chirho) {
			const candidateChirho = candidatesByKeyChirho.get(wordChirho.key_chirho),
				jobChirho = wordChirho.job_chirho,
				recipeChirho = productionWordRecipeChirho(
					jobChirho.text_chirho,
					jobChirho.recipe_id_chirho,
					jobChirho.ipa_chirho
				),
				reusedChirho = planChirho.reused_receipts_chirho.find(
					(rowChirho) => rowChirho.id_chirho === jobChirho.id_chirho
				);
			if (
				seenChirho.has(wordChirho.key_chirho) ||
				!candidateChirho ||
				cacheKeyChirho(jobChirho) !== wordChirho.key_chirho ||
				jobChirho.language_chirho !== 'he' ||
				jobChirho.recipe_id_chirho !== HEBREW_WORD_RECIPE_CHIRHO ||
				!recipeChirho ||
				recipeChirho.synthesis_text_chirho !== jobChirho.synthesis_text_chirho ||
				JSON.stringify(jobChirho) !== JSON.stringify(candidateChirho.job_chirho) ||
				JSON.stringify(wordChirho.occurrences_chirho) !==
					JSON.stringify(candidateChirho.occurrences_chirho) ||
				(wordChirho as LibraryWordChirho & { source_context_chirho?: string })
					.source_context_chirho !== 'maqqef_chirho' ||
				!wordChirho.analysis_note_chirho?.trim() ||
				!wordChirho.occurrences_chirho.length ||
				Boolean(reusedChirho) === newKeysChirho.has(wordChirho.key_chirho)
			)
				throw Error('Maqqef exact source, recipe or new/reused key partition differs');
			if (
				reusedChirho &&
				(reusedChirho.key_chirho !== wordChirho.key_chirho ||
					reusedChirho.state_chirho !== 'received' ||
					reusedChirho.reused_chirho !== true ||
					reusedChirho.reserved_credits_chirho !== 0)
			)
				throw Error('Maqqef reused pronunciation is not an exact received zero-cost take');
			if (newKeysChirho.has(wordChirho.key_chirho)) newUnitsChirho += unitsChirho(wordChirho);
			seenChirho.add(wordChirho.key_chirho);
		}
		if (
			planChirho.reused_receipts_chirho.some(
				(rowChirho) =>
					!planChirho.words_chirho.some(
						(wordChirho) => wordChirho.job_chirho.id_chirho === rowChirho.id_chirho
					)
			)
		)
			throw Error('Maqqef foreign reused receipt');
	}
	if (
		seenChirho.size !== authorityChirho.total_forms_chirho ||
		[...newKeysChirho].some((keyChirho) => !seenChirho.has(keyChirho)) ||
		newUnitsChirho !== authorityChirho.maximum_raw_credits_chirho
	)
		throw Error('Maqqef full-pass key or raw-unit reservation differs');
	return newUnitsChirho;
}
/** Unknown requests are retained and drain the whole continuation before another POST. */
export function validateMaqqefReceiptsChirho(
	authorityChirho: MaqqefAuthorityChirho,
	planChirho: MaqqefPlanChirho,
	rowsChirho: ReceiptChirho[]
) {
	if (
		receiptBytesChirho(rowsChirho.slice(0, planChirho.reused_receipts_chirho.length)) !==
		receiptBytesChirho(planChirho.reused_receipts_chirho)
	)
		throw Error('Maqqef original reused receipt prefix changed');
	const newKeysChirho = new Set(authorityChirho.new_keys_chirho);
	for (const rowChirho of rowsChirho.slice(planChirho.reused_receipts_chirho.length)) {
		if (
			!newKeysChirho.has(rowChirho.key_chirho) ||
			rowChirho.funding_id_chirho !== MAQQEF_ID_CHIRHO ||
			rowChirho.funding_key_name_chirho !== INFLECTION_KEY_CHIRHO ||
			rowChirho.reused_chirho
		)
			throw Error('Maqqef foreign or unbound new receipt');
	}
	const batchUnitsChirho = planChirho.words_chirho.reduce(
		(sumChirho, wordChirho) =>
			sumChirho + (newKeysChirho.has(wordChirho.key_chirho) ? unitsChirho(wordChirho) : 0),
		0
	);
	reserveChirho(
		planChirho.words_chirho.map((wordChirho) => wordChirho.job_chirho),
		rowsChirho,
		MAQQEF_PRIOR_CHIRHO + authorityChirho.maximum_raw_credits_chirho - batchUnitsChirho,
		'production',
		{
			funding_chirho: maqqefFundingChirho(authorityChirho, batchUnitsChirho),
			eligible_chirho: (jobChirho) => newKeysChirho.has(cacheKeyChirho(jobChirho))
		}
	);
	if (rowsChirho.some((rowChirho) => rowChirho.state_chirho === 'requested'))
		throw Error('Existing unknown maqqef request retained; reconcile it without resending');
}
async function currentReceiptsChirho(rootChirho: string, folderChirho: string) {
	try {
		return JSON.parse(
			(
				await readMaqqefFileChirho(rootChirho, folderChirho + '/receipts-chirho.json', 512 * 1024)
			).toString()
		) as ReceiptChirho[];
	} catch (errorChirho) {
		if ((errorChirho as NodeJS.ErrnoException).code === 'ENOENT') return [];
		throw errorChirho;
	}
}
async function verifyPriorChirho(rootChirho: string, authorityChirho: MaqqefAuthorityChirho) {
	const bytesChirho = await readMaqqefFileChirho(
		rootChirho,
		MAQQEF_HOME_CHIRHO + '/prior-ledger-chirho.json'
	);
	if (sha256Chirho(bytesChirho) !== authorityChirho.prior_ledger_sha256_chirho)
		throw Error('Maqqef prior ledger snapshot changed');
	const priorChirho = JSON.parse(bytesChirho.toString()) as MaqqefPriorChirho;
	if (
		priorChirho.accounted_credits_chirho !== MAQQEF_PRIOR_CHIRHO ||
		!Array.isArray(priorChirho.files_chirho) ||
		priorChirho.files_chirho.length < 1 ||
		priorChirho.files_chirho.length > 4096 ||
		new Set(priorChirho.files_chirho.map((fileChirho) => fileChirho.path_chirho)).size !==
			priorChirho.files_chirho.length
	)
		throw Error('Maqqef old allowance or prior evidence bound differs');
	for (const fileChirho of priorChirho.files_chirho) {
		if (
			!fileChirho.path_chirho.startsWith('workspace-chirho/audio-chirho/') ||
			fileChirho.path_chirho.startsWith(MAQQEF_PLAN_HOME_CHIRHO + '/') ||
			!fileChirho.path_chirho.endsWith('.json') ||
			!/^[a-f0-9]{64}$/u.test(fileChirho.sha256_chirho) ||
			sha256Chirho(
				await readMaqqefFileChirho(rootChirho, fileChirho.path_chirho, 128 * 1024 ** 2)
			) !== fileChirho.sha256_chirho
		)
			throw Error('Maqqef prior plan, receipt or authority changed');
	}
}
async function loadPassChirho(rootChirho: string, authorityChirho: MaqqefAuthorityChirho) {
	const indexBytesChirho = await readMaqqefFileChirho(
			rootChirho,
			MAQQEF_PLAN_HOME_CHIRHO + '/index-chirho.json',
			128 * 1024
		),
		candidateBytesChirho = await readMaqqefFileChirho(
			rootChirho,
			MAQQEF_HOME_CHIRHO + '/candidates-chirho.json'
		);
	if (
		sha256Chirho(indexBytesChirho) !== authorityChirho.index_sha256_chirho ||
		sha256Chirho(candidateBytesChirho) !== authorityChirho.candidates_sha256_chirho
	)
		throw Error('Maqqef approved candidate or index snapshot changed');
	const indexChirho = JSON.parse(indexBytesChirho.toString()) as {
		schema_version_chirho: number;
		batches_chirho: { path_chirho: string; sha256_chirho: string }[];
	};
	if (
		indexChirho.schema_version_chirho !== 1 ||
		!Array.isArray(indexChirho.batches_chirho) ||
		indexChirho.batches_chirho.length < 1 ||
		indexChirho.batches_chirho.length > 20 ||
		new Set(indexChirho.batches_chirho.map((rowChirho) => rowChirho.path_chirho)).size !==
			indexChirho.batches_chirho.length
	)
		throw Error('Maqqef index bound differs');
	const newKeysChirho = new Set(authorityChirho.new_keys_chirho),
		batchesChirho: MaqqefBatchChirho[] = [];
	for (const entryChirho of indexChirho.batches_chirho) {
		if (!/^batches-chirho\/[0-9]{4}-chirho\/plan-chirho\.json$/u.test(entryChirho.path_chirho))
			throw Error('Maqqef plan path refused');
		const pathChirho = MAQQEF_PLAN_HOME_CHIRHO + '/' + entryChirho.path_chirho,
			bytesChirho = await readMaqqefFileChirho(rootChirho, pathChirho),
			folderChirho = dirnameChirho(pathChirho);
		if (sha256Chirho(bytesChirho) !== entryChirho.sha256_chirho)
			throw Error('Maqqef approved plan changed');
		const planChirho = JSON.parse(bytesChirho.toString()) as MaqqefPlanChirho;
		batchesChirho.push({
			...planChirho,
			path_chirho: pathChirho,
			sha256_chirho: entryChirho.sha256_chirho,
			folder_chirho: folderChirho,
			new_units_chirho: planChirho.words_chirho.reduce(
				(sumChirho, wordChirho) =>
					sumChirho + (newKeysChirho.has(wordChirho.key_chirho) ? unitsChirho(wordChirho) : 0),
				0
			),
			receipts_chirho: await currentReceiptsChirho(rootChirho, folderChirho)
		});
	}
	validateMaqqefPlansChirho(
		authorityChirho,
		JSON.parse(candidateBytesChirho.toString()),
		batchesChirho
	);
	for (const batchChirho of batchesChirho)
		validateMaqqefReceiptsChirho(authorityChirho, batchChirho, batchChirho.receipts_chirho);
	await verifyPriorChirho(rootChirho, authorityChirho);
	return batchesChirho;
}
const defaultsChirho: MaqqefServicesChirho = {
	verify_source_chirho: verifyWordSourcesChirho,
	account_chirho: maqqefAccountChirho,
	execute_chirho: executeAudioPlanChirho,
	install_chirho: installWordsChirho,
	extend_chirho: extendLibrariesChirho,
	storage_chirho: async (rootChirho) => {
		const storageChirho = await statfsChirho(rootChirho);
		return storageChirho.bavail * storageChirho.bsize;
	},
	target_chirho: () => {
		const targetChirho = {
			account_chirho: process.env.CLOUDFLARE_GLOBAL_API_MAIN_ACCOUNT_ID_CHIRHO ?? '',
			bucket_chirho: 'hinneh-media-chirho',
			email_chirho: process.env.CLOUDFLARE_GLOBAL_API_EMAIL_CHIRHO ?? '',
			api_key_chirho: process.env.CLOUDFLARE_GLOBAL_API_KEY_CHIRHO ?? ''
		};
		if (
			!/^[a-f0-9]{32}$/u.test(targetChirho.account_chirho) ||
			!targetChirho.account_chirho.endsWith('84bd') ||
			!targetChirho.email_chirho ||
			!targetChirho.api_key_chirho
		)
			throw Error('Maqqef archive account unavailable');
		return targetChirho;
	}
};
export async function runMaqqefChirho(
	rootChirho: string,
	applyChirho = false,
	pilotChirho = false,
	servicesChirho: MaqqefServicesChirho = defaultsChirho
) {
	const authorityChirho = await readMaqqefAuthorityChirho(rootChirho);
	const authorityShaChirho = sha256Chirho(
		await readMaqqefFileChirho(
			rootChirho,
			MAQQEF_HOME_CHIRHO + '/authority-chirho.json',
			128 * 1024
		)
	);
	const verifyPinsChirho = async () => {
		for (const [pathChirho, hashChirho] of [
			[MAQQEF_HOME_CHIRHO + '/authority-chirho.json', authorityShaChirho],
			[MAQQEF_HOME_CHIRHO + '/candidates-chirho.json', authorityChirho.candidates_sha256_chirho],
			[MAQQEF_PLAN_HOME_CHIRHO + '/index-chirho.json', authorityChirho.index_sha256_chirho],
			[MAQQEF_HOME_CHIRHO + '/prior-ledger-chirho.json', authorityChirho.prior_ledger_sha256_chirho]
		])
			if (sha256Chirho(await readMaqqefFileChirho(rootChirho, pathChirho)) !== hashChirho)
				throw Error('Maqqef approved authority or pass snapshot changed');
	};
	let releaseChirho: (() => Promise<void>) | undefined,
		localReleaseChirho: (() => Promise<void>) | undefined;
	if (applyChirho) {
		await mkdirChirho(joinChirho(rootChirho, 'build-chirho/r2-chirho'), { recursive: true });
		releaseChirho = await acquireLockChirho(
			joinChirho(rootChirho, 'build-chirho/r2-chirho/audio-production-chirho.lock')
		);
		try {
			localReleaseChirho = await acquireLockChirho(
				joinChirho(
					rootChirho,
					'workspace-chirho/audio-chirho/production-bible-2026-11-02-chirho/word-production-chirho.lock'
				)
			);
		} catch (errorChirho) {
			await releaseChirho();
			throw errorChirho;
		}
	}
	let stoppingChirho = false,
		dirtyChirho = false,
		firstFailureChirho: unknown;
	const stopChirho = () => {
			stoppingChirho = true;
		},
		installedChirho = new Set<string>();
	process.on('SIGTERM', stopChirho);
	process.on('SIGINT', stopChirho);
	try {
		const batchesChirho = await loadPassChirho(rootChirho, authorityChirho),
			newKeysChirho = new Set(authorityChirho.new_keys_chirho);
		await verifyPinsChirho();
		for (const batchChirho of batchesChirho)
			await servicesChirho.verify_source_chirho(rootChirho, batchChirho.words_chirho);
		const pendingChirho = (batchChirho: MaqqefBatchChirho) =>
			batchChirho.words_chirho.filter(
				(wordChirho) =>
					newKeysChirho.has(wordChirho.key_chirho) &&
					!batchChirho.receipts_chirho.some(
						(rowChirho) => rowChirho.key_chirho === wordChirho.key_chirho
					)
			);
		const receivedCountChirho = () =>
			batchesChirho.reduce(
				(sumChirho, batchChirho) =>
					sumChirho +
					batchChirho.receipts_chirho.filter((rowChirho) => rowChirho.state_chirho === 'received')
						.length,
				0
			);
		if (!applyChirho)
			return {
				apply_chirho: false,
				total_forms_chirho: authorityChirho.total_forms_chirho,
				received_chirho: receivedCountChirho(),
				pending_requests_chirho: batchesChirho.reduce(
					(sumChirho, batchChirho) => sumChirho + pendingChirho(batchChirho).length,
					0
				),
				raw_credit_envelope_chirho: authorityChirho.maximum_raw_credits_chirho,
				prior_accounted_credits_chirho: MAQQEF_PRIOR_CHIRHO,
				maximum_total_credits_chirho: authorityChirho.maximum_total_credits_chirho,
				workers_chirho: 2
			};
		const initialAccountChirho = await servicesChirho.account_chirho(authorityChirho);
		if (
			initialAccountChirho.character_limit - initialAccountChirho.character_count <
			authorityChirho.maximum_raw_credits_chirho + 1000
		)
			throw Error('Maqqef full pass does not fit included balance');
		const targetChirho = servicesChirho.target_chirho();
		let installerChirho = Promise.resolve();
		const initialCountsChirho = new Map(
			batchesChirho.map((batchChirho) => [
				batchChirho.folder_chirho,
				batchChirho.receipts_chirho.length
			])
		);
		const requestedChirho = () =>
			batchesChirho.reduce(
				(sumChirho, batchChirho) =>
					sumChirho +
					batchChirho.receipts_chirho.length -
					initialCountsChirho.get(batchChirho.folder_chirho)!,
				0
			);
		const progressChirho = async (stateChirho: string) =>
			writeChirho(
				joinChirho(rootChirho, MAQQEF_HOME_CHIRHO, 'progress-chirho.json'),
				JSON.stringify(
					{
						at_chirho: new Date().toISOString(),
						state_chirho: stateChirho,
						total_forms_chirho: authorityChirho.total_forms_chirho,
						received_forms_chirho: receivedCountChirho(),
						installed_this_run_chirho: installedChirho.size,
						requests_this_run_chirho: requestedChirho(),
						workers_chirho: 2,
						raw_credit_envelope_chirho: authorityChirho.maximum_raw_credits_chirho,
						...(firstFailureChirho ? { failure_chirho: String(firstFailureChirho) } : {})
					},
					null,
					2
				) + '\n'
			);
		const eventChirho = async (kindChirho: string, batchChirho: MaqqefBatchChirho) =>
			appendFileChirho(
				joinChirho(rootChirho, MAQQEF_HOME_CHIRHO, 'events-chirho.jsonl'),
				JSON.stringify({
					at_chirho: new Date().toISOString(),
					kind_chirho: kindChirho,
					batch_path_chirho: batchChirho.path_chirho
				}) + '\n',
				{ mode: 0o600 }
			);
		const installChirho = async (batchChirho: MaqqefBatchChirho) => {
			const workChirho = installerChirho.then(async () => {
				await verifyPinsChirho();
				await servicesChirho.verify_source_chirho(rootChirho, batchChirho.words_chirho);
				await eventChirho('installation_started', batchChirho);
				await servicesChirho.install_chirho(
					rootChirho,
					joinChirho(rootChirho, batchChirho.folder_chirho),
					batchChirho.words_chirho,
					batchChirho.receipts_chirho,
					targetChirho
				);
				for (const rowChirho of batchChirho.receipts_chirho)
					if (rowChirho.state_chirho === 'received') installedChirho.add(rowChirho.key_chirho);
				dirtyChirho = true;
				await eventChirho('installation_finished', batchChirho);
			});
			installerChirho = workChirho.catch(() => {});
			await workChirho;
		};
		for (const batchChirho of batchesChirho)
			if (batchChirho.receipts_chirho.length) await installChirho(batchChirho);
		const processChirho = async (batchChirho: MaqqefBatchChirho, limitChirho: number) => {
			if (stoppingChirho) return;
			if ((await servicesChirho.storage_chirho(rootChirho)) < 2 * 1024 ** 3)
				throw Error('Maqqef audio storage floor');
			await servicesChirho.account_chirho(authorityChirho);
			const verifyChirho = async () => {
				await verifyPinsChirho();
				if (
					sha256Chirho(await readMaqqefFileChirho(rootChirho, batchChirho.path_chirho)) !==
					batchChirho.sha256_chirho
				)
					throw Error('Maqqef approved plan changed during synthesis');
				await servicesChirho.verify_source_chirho(rootChirho, batchChirho.words_chirho);
			};
			await verifyChirho();
			await eventChirho('speech_batch_started', batchChirho);
			try {
				await servicesChirho.execute_chirho(rootChirho, true, {
					mode_chirho: 'production',
					rows_chirho: batchChirho.words_chirho.map((wordChirho) => wordChirho.job_chirho),
					folder_chirho: joinChirho(rootChirho, batchChirho.folder_chirho),
					prior_credits_chirho:
						MAQQEF_PRIOR_CHIRHO +
						authorityChirho.maximum_raw_credits_chirho -
						batchChirho.new_units_chirho,
					limit_chirho: limitChirho,
					funding_chirho: maqqefFundingChirho(authorityChirho, batchChirho.new_units_chirho),
					eligible_chirho: (jobChirho) => newKeysChirho.has(cacheKeyChirho(jobChirho)),
					verify_source_chirho: verifyChirho,
					on_receipt_chirho: async (rowsChirho) => {
						batchChirho.receipts_chirho = rowsChirho;
						await progressChirho('generating');
					},
					should_stop_chirho: () => stoppingChirho
				});
			} finally {
				batchChirho.receipts_chirho = await currentReceiptsChirho(
					rootChirho,
					batchChirho.folder_chirho
				);
			}
			validateMaqqefReceiptsChirho(authorityChirho, batchChirho, batchChirho.receipts_chirho);
			await eventChirho('speech_batch_finished', batchChirho);
			await installChirho(batchChirho);
			await progressChirho('generating');
		};
		await progressChirho('generating');
		if (pilotChirho) {
			const firstChirho = batchesChirho.find((batchChirho) => pendingChirho(batchChirho).length);
			if (firstChirho) await processChirho(firstChirho, 1);
		} else {
			let nextChirho = 0;
			await Promise.all(
				Array.from({ length: 2 }, async () => {
					while (!stoppingChirho && nextChirho < batchesChirho.length) {
						const batchChirho = batchesChirho[nextChirho++];
						if (!pendingChirho(batchChirho).length) continue;
						try {
							await processChirho(batchChirho, pendingChirho(batchChirho).length);
						} catch (errorChirho) {
							firstFailureChirho ??= errorChirho;
							stoppingChirho = true;
						}
					}
				})
			);
		}
		await installerChirho;
		await verifyPinsChirho();
		await verifyPriorChirho(rootChirho, authorityChirho);
		const finalAccountChirho = await servicesChirho.account_chirho(authorityChirho);
		await writeChirho(
			joinChirho(rootChirho, MAQQEF_HOME_CHIRHO, 'account-final-chirho.json'),
			JSON.stringify(
				{
					at_chirho: new Date().toISOString(),
					character_count_chirho: finalAccountChirho.character_count,
					character_limit_chirho: finalAccountChirho.character_limit,
					can_extend_character_limit_chirho: finalAccountChirho.can_extend_character_limit,
					next_reset_unix_chirho: finalAccountChirho.next_character_count_reset_unix,
					baseline_usage_chirho: authorityChirho.baseline_usage_chirho,
					usage_since_baseline_chirho:
						finalAccountChirho.character_count - authorityChirho.baseline_usage_chirho
				},
				null,
				2
			) + '\n'
		);
		await progressChirho(
			firstFailureChirho
				? 'held'
				: receivedCountChirho() === authorityChirho.total_forms_chirho
					? 'complete'
					: 'bounded_run_finished'
		);
		if (firstFailureChirho) throw firstFailureChirho;
		return {
			received_chirho: receivedCountChirho(),
			requested_chirho: requestedChirho(),
			complete_chirho: receivedCountChirho() === authorityChirho.total_forms_chirho
		};
	} catch (errorChirho) {
		if (applyChirho)
			await writeChirho(
				joinChirho(rootChirho, MAQQEF_HOME_CHIRHO, 'progress-chirho.json'),
				JSON.stringify(
					{
						at_chirho: new Date().toISOString(),
						state_chirho: 'held',
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
					await servicesChirho.extend_chirho(rootChirho);
				} finally {
					await libraryReleaseChirho();
				}
			}
		} finally {
			process.off('SIGTERM', stopChirho);
			process.off('SIGINT', stopChirho);
			await localReleaseChirho?.();
			await releaseChirho?.();
		}
	}
}
if (import.meta.main) {
	const argumentsChirho = process.argv.slice(2);
	if (
		argumentsChirho.some(
			(argumentChirho) => !['--apply-chirho', '--pilot-chirho'].includes(argumentChirho)
		) ||
		new Set(argumentsChirho).size !== argumentsChirho.length
	)
		throw Error('Unknown or repeated maqqef producer flag');
	console.log(
		await runMaqqefChirho(
			process.cwd(),
			argumentsChirho.includes('--apply-chirho'),
			argumentsChirho.includes('--pilot-chirho')
		)
	);
}
