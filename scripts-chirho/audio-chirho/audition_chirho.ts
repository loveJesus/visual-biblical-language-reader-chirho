// For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life. — John 3:16 (KJV)
import {
	accountedReceiptCreditsChirho,
	type AudioSettlementChirho
} from './production-chirho/credit_accounting_chirho';
import {
	readCompletionGuardChirho,
	completionBalanceAllowsChirho
} from './production-chirho/completion_guard_chirho';
// Workflow: spec-chirho/workflows-chirho/local-reader-chirho.md (cached original-language audio).
import { bibleBookChirho, isPassageIdChirho } from '../../src/lib/bible-chirho/books-chirho';
import { createHash as createHashChirho } from 'node:crypto';
import { mkdir, open, readFile, rename, stat, unlink } from 'node:fs/promises';
import { dirname, join, resolve } from 'node:path';
import {
	spokenVerseChirho,
	spokenWordChirho
} from '../../src/lib/domain-chirho/pronunciation-chirho';
import {
	ipaForRecordingChirho,
	ipaInputChirho
} from '../../src/lib/domain-chirho/pronunciation-chirho/ipa-trial-chirho';

const ORIGIN_CHIRHO = 'https://api.elevenlabs.io';
const MODEL_CHIRHO = 'eleven_v4';
const CREDIT_LIMIT_CHIRHO = 300;
const REQUEST_LIMIT_CHIRHO = 4;
export const AUDIO_PRODUCTION_CEILING_CHIRHO = 270_000;
const FOLDER_CHIRHO = 'workspace-chirho/audio-chirho/audition-2026-10-30-chirho';
const VOICES_CHIRHO = {
	he: {
		id_chirho: 'l7Q9rbdCC6j3J5dNlOOg',
		owner_chirho: '6aefa3b3749bd39dc0c76e9d149e2651e9badc0eeea7ec873910315bf2f06e98',
		name_chirho: 'Itamar - Israeli Hebrew Narrator'
	},
	el: {
		id_chirho: 'WAiDT3LdFjZHIgDuqoqD',
		owner_chirho: '134fc3db66a5493c59aaf7b8b33a596952524371d9de444f0f892683ef598ffa',
		name_chirho: 'Angelos - Warm & Expressive Narrator'
	}
} as const;
const SETTINGS_CHIRHO = {
	stability: 0.5,
	similarity_boost: 0.75,
	style: 0,
	use_speaker_boost: true,
	speed: 0.9
};
class SpeechProviderErrorChirho extends Error {
	constructor(
		readonly statusChirho: number,
		methodChirho: string
	) {
		super(`Speech provider refused ${methodChirho} with HTTP ${statusChirho}; no automatic retry`);
	}
}
/** A budget refusal: 'ledger' is the reserved-credit ceiling or pool, 'quota' the live balance. */
export class AudioBudgetErrorChirho extends Error {
	constructor(
		readonly kindChirho: 'ledger' | 'quota',
		messageChirho: string
	) {
		super(messageChirho);
	}
}
/**
 * A separately authorized included-credit pool for word production. Only the environment
 * variable NAME of its key is carried or recorded; the credential value never leaves the request.
 */
export interface AudioFundingChirho {
	id_chirho: string;
	key_name_chirho: string;
	maximum_total_credits_chirho: number;
	additional_credits_chirho: number;
	/** Reservations already charged to this pool outside the plan being checked. */
	pool_prior_credits_chirho: number;
	settlement_chirho?: AudioSettlementChirho;
	/** Verified earlier pools retain their own receipt identities and accounting cuts. */
	prior_settlements_chirho?: ReadonlyMap<string, AudioSettlementChirho>;
	billing_cycle_reset_chirho?: number;
}
export interface ReserveOptionsChirho {
	funding_chirho?: AudioFundingChirho;
	/** Rows this run may request; an unrequested row without a receipt reserves nothing. */
	eligible_chirho?: (jobChirho: AudioJobChirho) => boolean;
}
const FUNDING_ID_PATTERN_CHIRHO = /^[a-z0-9-]{1,80}$/u;
const KEY_NAME_PATTERN_CHIRHO = /^[A-Z][A-Z0-9_]{2,80}$/u;
function validFundingChirho(fundingChirho: AudioFundingChirho) {
	return (
		FUNDING_ID_PATTERN_CHIRHO.test(fundingChirho.id_chirho) &&
		KEY_NAME_PATTERN_CHIRHO.test(fundingChirho.key_name_chirho) &&
		[
			fundingChirho.maximum_total_credits_chirho,
			fundingChirho.additional_credits_chirho,
			fundingChirho.pool_prior_credits_chirho
		].every((valueChirho) => Number.isSafeInteger(valueChirho) && valueChirho >= 0) &&
		fundingChirho.maximum_total_credits_chirho > AUDIO_PRODUCTION_CEILING_CHIRHO &&
		fundingChirho.pool_prior_credits_chirho <= fundingChirho.additional_credits_chirho &&
		(fundingChirho.billing_cycle_reset_chirho === undefined ||
			(Number.isSafeInteger(fundingChirho.billing_cycle_reset_chirho) &&
				fundingChirho.billing_cycle_reset_chirho > 0 &&
				(!fundingChirho.settlement_chirho ||
					fundingChirho.settlement_chirho.reset_unix_chirho ===
						fundingChirho.billing_cycle_reset_chirho)))
	);
}
type LanguageChirho = keyof typeof VOICES_CHIRHO;
export interface AudioJobChirho {
	id_chirho: string;
	lesson_id_chirho: string;
	token_id_chirho: string | null;
	language_chirho: LanguageChirho;
	text_chirho: string;
	synthesis_text_chirho?: string;
	ipa_chirho?: string;
	recipe_id_chirho?: string;
	canonical_sha256_chirho: string;
}
export interface ReceiptChirho {
	id_chirho: string;
	key_chirho: string;
	reserved_credits_chirho: number;
	state_chirho: 'requested' | 'received';
	path_chirho?: string;
	sha256_chirho?: string;
	bytes_chirho?: number;
	request_id_chirho?: string | null;
	voice_id_chirho: string;
	voice_name_chirho: string;
	reused_chirho?: boolean;
	/** Separately authorized pool; legacy receipts without it belong to the original ceiling. */
	funding_id_chirho?: string;
	/** The credential's environment variable NAME only, never its value. */
	funding_key_name_chirho?: string;
	settlement_id_chirho?: string;
}
/** Credits reserved by receipts charged to one funding pool, including unknown requests. */
export function fundedCreditsChirho(
	receiptsChirho: readonly ReceiptChirho[],
	fundingIdChirho: string,
	fundingChirho?: AudioFundingChirho
): number {
	return receiptsChirho.reduce(
		(totalChirho, rowChirho) =>
			rowChirho.funding_id_chirho === fundingIdChirho
				? totalChirho + accountedReceiptCreditsChirho(rowChirho, fundingChirho)
				: totalChirho,
		0
	);
}
export const sha256Chirho = (valueChirho: string | Uint8Array) =>
	createHashChirho('sha256').update(valueChirho).digest('hex');
export const synthesisTextChirho = (jobChirho: AudioJobChirho) =>
	jobChirho.synthesis_text_chirho ?? jobChirho.text_chirho;
export function cacheKeyChirho(jobChirho: AudioJobChirho) {
	return sha256Chirho(
		JSON.stringify({
			text_chirho: synthesisTextChirho(jobChirho),
			language_chirho: jobChirho.language_chirho,
			voice_chirho: VOICES_CHIRHO[jobChirho.language_chirho].id_chirho,
			model_chirho: MODEL_CHIRHO,
			settings_chirho: SETTINGS_CHIRHO
		})
	);
}
export function reserveChirho(
	jobsChirho: AudioJobChirho[],
	receiptsChirho: ReceiptChirho[],
	priorCreditsChirho = 0,
	chapterTrialChirho: boolean | 'flow_review_trial' | 'john_styles_trial' | 'production' = false,
	optionsChirho: ReserveOptionsChirho = {}
) {
	const productionChirho = chapterTrialChirho === 'production';
	const flowTrialChirho = chapterTrialChirho === 'flow_review_trial';
	const stylesTrialChirho = chapterTrialChirho === 'john_styles_trial';
	const fundingChirho = optionsChirho.funding_chirho;
	if (fundingChirho && (!productionChirho || !validFundingChirho(fundingChirho)))
		throw new Error('Separate funding applies only to valid word production');
	// Without explicit funding the original production ceiling is unchanged.
	const ceilingChirho = productionChirho
		? (fundingChirho?.maximum_total_credits_chirho ?? AUDIO_PRODUCTION_CEILING_CHIRHO)
		: chapterTrialChirho
			? 20_000
			: CREDIT_LIMIT_CHIRHO;
	const requestsChirho = productionChirho
		? 200
		: stylesTrialChirho
			? 3
			: flowTrialChirho
				? 2
				: chapterTrialChirho
					? 79
					: REQUEST_LIMIT_CHIRHO;
	if (
		!Number.isSafeInteger(priorCreditsChirho) ||
		priorCreditsChirho < 0 ||
		priorCreditsChirho >
			(productionChirho
				? ceilingChirho
				: flowTrialChirho || stylesTrialChirho
					? 20_000
					: CREDIT_LIMIT_CHIRHO)
	)
		throw new Error('Invalid prior audition reservation');
	if (
		!Array.isArray(receiptsChirho) ||
		receiptsChirho.length > requestsChirho ||
		new Set(receiptsChirho.map((rowChirho) => rowChirho.id_chirho)).size !== receiptsChirho.length
	)
		throw new Error('Malformed audition receipt index');
	if (
		jobsChirho.length > requestsChirho ||
		new Set(jobsChirho.map((rowChirho) => rowChirho.id_chirho)).size !== jobsChirho.length
	)
		throw new Error('Audition request count or identity refused');
	if (
		chapterTrialChirho &&
		!productionChirho &&
		!stylesTrialChirho &&
		new Set(jobsChirho.map((rowChirho) => rowChirho.lesson_id_chirho)).size !== jobsChirho.length
	)
		throw new Error('Only one chapter trial request per verse is allowed');
	if (
		stylesTrialChirho &&
		new Set(
			jobsChirho.map((jobChirho) => jobChirho.lesson_id_chirho + '|' + jobChirho.recipe_id_chirho)
		).size !== jobsChirho.length
	)
		throw new Error('Duplicate pronunciation request');
	let creditsChirho = 0,
		prospectiveChirho = 0;
	for (const jobChirho of jobsChirho) {
		if (
			productionChirho &&
			(jobChirho.language_chirho === 'el') !==
				(jobChirho.recipe_id_chirho === 'modern-greek-word-library-v1-chirho')
		)
			throw new Error('Word pronunciation language/recipe mismatch');
		if (
			productionChirho &&
			(!isPassageIdChirho(jobChirho.lesson_id_chirho) ||
				!['israeli-ipa-word-library-v1-chirho', 'modern-greek-word-library-v1-chirho'].includes(
					jobChirho.recipe_id_chirho ?? ''
				))
		)
			throw new Error('Production audio source/recipe scope differs');
		if (
			stylesTrialChirho &&
			!(
				(jobChirho.lesson_id_chirho === 'John.1.1' &&
					jobChirho.recipe_id_chirho === 'modern-vowels-rough-breathing-v2-chirho') ||
				(/^John\.1\.[12]$/.test(jobChirho.lesson_id_chirho) &&
					jobChirho.recipe_id_chirho === 'erasmian-teaching-v1-chirho')
			)
		)
			throw new Error('Greek comparison scope differs');
		if (
			flowTrialChirho &&
			!(
				(jobChirho.lesson_id_chirho === 'Prov.26.1' &&
					jobChirho.recipe_id_chirho === 'israeli-ipa-connected-v2-chirho') ||
				(jobChirho.lesson_id_chirho === 'John.1.2' &&
					jobChirho.recipe_id_chirho === 'modern-vowels-rough-breathing-v2-chirho')
			)
		)
			throw new Error('Flow sample scope differs');
		if (
			chapterTrialChirho &&
			!productionChirho &&
			!/^(?:Prov\.26\.(?:[1-9]|1\d|2[0-8])|John\.1\.(?:[1-9]|[1-4]\d|5[01]))$/.test(
				jobChirho.lesson_id_chirho
			)
		)
			throw new Error('Chapter trial is limited to Proverbs 26 and John 1');
		if (
			chapterTrialChirho &&
			((productionChirho
				? typeof jobChirho.token_id_chirho !== 'string' || !jobChirho.token_id_chirho
				: jobChirho.token_id_chirho !== null) ||
				jobChirho.language_chirho !==
					(productionChirho
						? bibleBookChirho(jobChirho.lesson_id_chirho.split('.')[0]).language_chirho === 'grc'
							? 'el'
							: 'he'
						: jobChirho.lesson_id_chirho.startsWith('John.')
							? 'el'
							: 'he'))
		)
			throw new Error('Chapter trial language or verse scope differs');
		if (
			!VOICES_CHIRHO[jobChirho.language_chirho] ||
			!jobChirho.text_chirho.trim() ||
			[...synthesisTextChirho(jobChirho)].length > (chapterTrialChirho ? 1500 : 150) ||
			!synthesisTextChirho(jobChirho).trim()
		)
			throw new Error('Invalid bounded audition text');
		const previousChirho = receiptsChirho.find(
			(rowChirho) => rowChirho.id_chirho === jobChirho.id_chirho
		);
		if (previousChirho && previousChirho.key_chirho !== cacheKeyChirho(jobChirho))
			throw new Error('Audition identity changed; preserve its original request');
		if (
			previousChirho &&
			(previousChirho.reserved_credits_chirho !==
				(productionChirho &&
				previousChirho.reused_chirho === true &&
				previousChirho.state_chirho === 'received'
					? 0
					: [...synthesisTextChirho(jobChirho)].length) ||
				!['requested', 'received'].includes(previousChirho.state_chirho) ||
				!/^[A-Za-z0-9]{20}$/.test(previousChirho.voice_id_chirho) ||
				previousChirho.voice_name_chirho !== VOICES_CHIRHO[jobChirho.language_chirho].name_chirho)
		)
			throw new Error('Audio receipt credit or voice evidence changed');
		if (
			previousChirho?.state_chirho === 'received' &&
			(previousChirho.path_chirho !==
				`${jobChirho.id_chirho}-${previousChirho.key_chirho.slice(0, 12)}-chirho.mp3` ||
				!/^[a-f0-9]{64}$/.test(previousChirho.sha256_chirho ?? '') ||
				!Number.isSafeInteger(previousChirho.bytes_chirho) ||
				(previousChirho.bytes_chirho ?? 0) < 1000 ||
				(previousChirho.bytes_chirho ?? Infinity) > 8 * 1024 ** 2)
		)
			throw new Error('Audio receipt path or byte evidence changed');
		if (previousChirho?.state_chirho === 'requested' && !chapterTrialChirho)
			throw new Error('Unknown prior audio result; reconcile history before another request');
		if (
			previousChirho &&
			(previousChirho.funding_id_chirho !== undefined ||
				previousChirho.funding_key_name_chirho !== undefined) &&
			!(
				productionChirho &&
				FUNDING_ID_PATTERN_CHIRHO.test(previousChirho.funding_id_chirho ?? '') &&
				KEY_NAME_PATTERN_CHIRHO.test(previousChirho.funding_key_name_chirho ?? '')
			)
		)
			throw new Error('Audio receipt funding evidence changed');
		// A row this run will not request reserves nothing until it actually has a receipt.
		if (
			!previousChirho &&
			optionsChirho.eligible_chirho &&
			!optionsChirho.eligible_chirho(jobChirho)
		)
			continue;
		creditsChirho += previousChirho
			? accountedReceiptCreditsChirho(previousChirho, fundingChirho)
			: [...synthesisTextChirho(jobChirho)].length;
		if (!previousChirho && fundingChirho)
			prospectiveChirho += [...synthesisTextChirho(jobChirho)].length;
	}
	if (
		receiptsChirho.some(
			(rowChirho) => !jobsChirho.some((jobChirho) => jobChirho.id_chirho === rowChirho.id_chirho)
		)
	)
		throw new Error('Audition included-credit budget refused');
	if (
		creditsChirho + priorCreditsChirho > ceilingChirho ||
		(fundingChirho &&
			fundingChirho.pool_prior_credits_chirho +
				fundedCreditsChirho(receiptsChirho, fundingChirho.id_chirho, fundingChirho) +
				prospectiveChirho >
				fundingChirho.additional_credits_chirho) ||
		(flowTrialChirho && creditsChirho > CREDIT_LIMIT_CHIRHO) ||
		(stylesTrialChirho && creditsChirho > 500)
	)
		throw new AudioBudgetErrorChirho('ledger', 'Audition included-credit budget refused');
	return creditsChirho;
}
export async function writeChirho(pathChirho: string, bytesChirho: string | Uint8Array) {
	await mkdir(dirname(pathChirho), { recursive: true });
	const tempChirho = `${pathChirho}.${crypto.randomUUID()}.tmp-chirho`;
	const fileChirho = await open(tempChirho, 'wx');
	try {
		await fileChirho.writeFile(bytesChirho);
		await fileChirho.sync();
	} finally {
		await fileChirho.close();
	}
	await rename(tempChirho, pathChirho);
	const directoryChirho = await open(dirname(pathChirho), 'r');
	try {
		await directoryChirho.sync();
	} finally {
		await directoryChirho.close();
	}
}
async function jsonChirho(pathChirho: string) {
	return JSON.parse(await readFile(pathChirho, 'utf8'));
}
async function existsChirho(pathChirho: string) {
	try {
		return (await stat(pathChirho)).isFile();
	} catch (errorChirho) {
		if ((errorChirho as NodeJS.ErrnoException).code === 'ENOENT') return false;
		throw errorChirho;
	}
}
async function jobsChirho(rootChirho: string): Promise<AudioJobChirho[]> {
	const hebrewChirho = await jsonChirho(
		join(rootChirho, 'data-chirho/lessons-chirho/proverbs-26-1-chirho.json')
	);
	const greekChirho = (
		await jsonChirho(join(rootChirho, 'static/content-chirho/john-chirho/chapter-01-chirho.json'))
	).verses_chirho[0];
	const rowsChirho: AudioJobChirho[] = [];
	for (const [languageChirho, lessonChirho, lemmaChirho] of [
		['he', hebrewChirho, 'H5000'],
		['el', greekChirho, 'G3056']
	] as const) {
		const tokenChirho = lessonChirho.tokens_chirho.find(
			(rowChirho: { lemma_id_chirho: string }) => rowChirho.lemma_id_chirho === lemmaChirho
		);
		if (!tokenChirho) throw new Error('Audition source word missing');
		const commonChirho = {
			lesson_id_chirho: lessonChirho.id_chirho,
			language_chirho: languageChirho,
			canonical_sha256_chirho: sha256Chirho(lessonChirho.canonical_text_chirho)
		};
		rowsChirho.push({
			...commonChirho,
			id_chirho: `${languageChirho}-verse-chirho`,
			token_id_chirho: null,
			text_chirho: spokenVerseChirho(lessonChirho)
		});
		rowsChirho.push({
			...commonChirho,
			id_chirho: `${languageChirho}-word-chirho`,
			token_id_chirho: tokenChirho.id_chirho,
			text_chirho: spokenWordChirho(tokenChirho)
		});
	}
	return rowsChirho;
}
export async function ipaJobsChirho(rootChirho: string): Promise<AudioJobChirho[]> {
	const rowsChirho: AudioJobChirho[] = [];
	for (const [chapterChirho, verseChirho, lemmaChirho, nameChirho] of [
		[26, 1, null, 'verse'],
		[26, 1, 'H5000', 'naveh'],
		[26, 1, 'H3519', 'kavod'],
		[1, 13, 'H3605', 'kol']
	] as const) {
		const chapterDocChirho = await jsonChirho(
			join(
				rootChirho,
				`static/content-chirho/proverbs-chirho/chapter-${String(chapterChirho).padStart(2, '0')}-chirho.json`
			)
		);
		const lessonChirho = chapterDocChirho.verses_chirho.find(
			(rowChirho: { id_chirho: string }) =>
				rowChirho.id_chirho === `Prov.${chapterChirho}.${verseChirho}`
		);
		const tokenChirho = lemmaChirho
			? lessonChirho?.tokens_chirho.find(
					(rowChirho: { lemma_id_chirho: string }) => rowChirho.lemma_id_chirho === lemmaChirho
				)
			: null;
		if (!lessonChirho || (lemmaChirho && !tokenChirho))
			throw new Error('IPA trial source unavailable');
		const ipaChirho = ipaForRecordingChirho(lessonChirho, tokenChirho?.id_chirho ?? null);
		if (!ipaChirho) throw new Error('IPA trial source binding changed');
		rowsChirho.push({
			id_chirho: `he-ipa-${nameChirho}-chirho`,
			lesson_id_chirho: lessonChirho.id_chirho,
			token_id_chirho: tokenChirho?.id_chirho ?? null,
			language_chirho: 'he',
			text_chirho: tokenChirho ? spokenWordChirho(tokenChirho) : spokenVerseChirho(lessonChirho),
			canonical_sha256_chirho: sha256Chirho(lessonChirho.canonical_text_chirho),
			synthesis_text_chirho: ipaInputChirho(ipaChirho),
			ipa_chirho: ipaChirho
		});
	}
	return rowsChirho;
}
async function priorReservationChirho(rootChirho: string) {
	const rowsChirho = await jobsChirho(rootChirho);
	const folderChirho = join(rootChirho, FOLDER_CHIRHO);
	const receiptsChirho: ReceiptChirho[] = await jsonChirho(
		join(folderChirho, 'receipts-chirho.json')
	);
	const manifestChirho = await jsonChirho(join(folderChirho, 'audition-manifest-chirho.json'));
	const creditsChirho = reserveChirho(rowsChirho, receiptsChirho);
	if (
		receiptsChirho.length !== rowsChirho.length ||
		JSON.stringify(manifestChirho.jobs_chirho) !== JSON.stringify(rowsChirho) ||
		JSON.stringify(manifestChirho.clips_chirho) !== JSON.stringify(receiptsChirho)
	)
		throw new Error('Original audition reservation changed; preserve its evidence');
	for (const receiptChirho of receiptsChirho) {
		if (
			!receiptChirho.path_chirho ||
			sha256Chirho(await readFile(join(folderChirho, receiptChirho.path_chirho))) !==
				receiptChirho.sha256_chirho
		)
			throw new Error('Original audition bytes changed');
	}
	return creditsChirho;
}
export async function verifiedPriorAuditionsChirho(rootChirho: string) {
	const originalCreditsChirho = await priorReservationChirho(rootChirho);
	const rowsChirho = await ipaJobsChirho(rootChirho);
	const folderChirho = join(rootChirho, FOLDER_CHIRHO, 'ipa-chirho');
	const receiptsChirho: ReceiptChirho[] = await jsonChirho(
		join(folderChirho, 'receipts-chirho.json')
	);
	const manifestChirho = await jsonChirho(join(folderChirho, 'audition-manifest-chirho.json'));
	const creditsChirho = reserveChirho(rowsChirho, receiptsChirho, originalCreditsChirho);
	if (
		receiptsChirho.length !== rowsChirho.length ||
		JSON.stringify(manifestChirho.jobs_chirho) !== JSON.stringify(rowsChirho) ||
		JSON.stringify(manifestChirho.clips_chirho) !== JSON.stringify(receiptsChirho)
	)
		throw new Error('Completed IPA experiment changed; no chapter generation');
	for (const receiptChirho of receiptsChirho) {
		if (
			receiptChirho.state_chirho !== 'received' ||
			!receiptChirho.path_chirho ||
			sha256Chirho(await readFile(join(folderChirho, receiptChirho.path_chirho))) !==
				receiptChirho.sha256_chirho
		)
			throw new Error('Prior IPA recording evidence changed');
	}
	return originalCreditsChirho + creditsChirho;
}
export async function auditionChirho(
	rootChirho: string,
	applyChirho = false,
	ipaTrialChirho = false
) {
	const rowsChirho = ipaTrialChirho
		? await ipaJobsChirho(rootChirho)
		: await jobsChirho(rootChirho);
	const priorCreditsChirho = ipaTrialChirho ? await priorReservationChirho(rootChirho) : 0;
	const folderChirho = join(rootChirho, FOLDER_CHIRHO, ...(ipaTrialChirho ? ['ipa-chirho'] : []));
	return executeAudioPlanChirho(rootChirho, applyChirho, {
		rows_chirho: rowsChirho,
		folder_chirho: folderChirho,
		prior_credits_chirho: priorCreditsChirho,
		mode_chirho: 'audition',
		verify_source_chirho: async () => {
			if (ipaTrialChirho && (await priorReservationChirho(rootChirho)) !== priorCreditsChirho)
				throw new Error('Prior speech reservation changed');
		}
	});
}

export async function executeAudioPlanChirho(
	rootChirho: string,
	applyChirho: boolean,
	planChirho: {
		rows_chirho: AudioJobChirho[];
		folder_chirho: string;
		prior_credits_chirho: number;
		mode_chirho:
			'audition' | 'chapter_trial' | 'flow_review_trial' | 'john_styles_trial' | 'production';
		limit_chirho?: number;
		verify_source_chirho: () => Promise<void>;
		on_receipt_chirho?: (receiptsChirho: ReceiptChirho[]) => Promise<void>;
		should_stop_chirho?: () => boolean;
		completion_authority_sha256_chirho?: string;
	} & ReserveOptionsChirho
) {
	const rowsChirho = planChirho.rows_chirho;
	const folderChirho = planChirho.folder_chirho;
	const priorCreditsChirho = planChirho.prior_credits_chirho;
	const productionChirho = planChirho.mode_chirho === 'production';
	const flowTrialChirho = planChirho.mode_chirho === 'flow_review_trial';
	const stylesTrialChirho = planChirho.mode_chirho === 'john_styles_trial';
	const chapterTrialChirho = planChirho.mode_chirho !== 'audition';
	const fundingChirho = planChirho.funding_chirho;
	if (planChirho.completion_authority_sha256_chirho && !productionChirho)
		throw new Error('Completion exception is only for source-bound word production');
	const ceilingChirho = productionChirho
		? (fundingChirho?.maximum_total_credits_chirho ?? AUDIO_PRODUCTION_CEILING_CHIRHO)
		: chapterTrialChirho
			? 20_000
			: CREDIT_LIMIT_CHIRHO;
	const selectiveChirho = Boolean(fundingChirho || planChirho.eligible_chirho);
	const requestableChirho = (jobChirho: AudioJobChirho) =>
		!planChirho.eligible_chirho || planChirho.eligible_chirho(jobChirho);
	const completionChirho = planChirho.completion_authority_sha256_chirho
		? await readCompletionGuardChirho(
				rootChirho,
				planChirho.completion_authority_sha256_chirho,
				rowsChirho.filter(requestableChirho).map(cacheKeyChirho),
				fundingChirho
			)
		: null;
	const requestLimitChirho = productionChirho
		? 200
		: stylesTrialChirho
			? 3
			: flowTrialChirho
				? 2
				: chapterTrialChirho
					? 79
					: REQUEST_LIMIT_CHIRHO;
	const limitChirho = planChirho.limit_chirho ?? requestLimitChirho;
	if (!Number.isSafeInteger(limitChirho) || limitChirho < 1 || limitChirho > requestLimitChirho)
		throw new Error('Invalid fixed audio request limit');
	const evidenceRootsChirho = (
		productionChirho
			? [
					'workspace-chirho/audio-chirho/production-2026-10-31-chirho',
					'workspace-chirho/audio-chirho/production-bible-2026-11-02-chirho'
				]
			: [FOLDER_CHIRHO]
	).map((pathChirho) => join(resolve(rootChirho), pathChirho));
	if (
		!evidenceRootsChirho.some(
			(evidenceRootChirho) =>
				resolve(folderChirho).startsWith(evidenceRootChirho + '/') ||
				(!productionChirho && resolve(folderChirho) === evidenceRootChirho)
		)
	)
		throw new Error('Audio evidence folder escapes its authorized tree');
	const reservePlanChirho = (receiptsChirho: ReceiptChirho[]) =>
		reserveChirho(
			rowsChirho,
			receiptsChirho,
			priorCreditsChirho,
			productionChirho
				? 'production'
				: stylesTrialChirho
					? 'john_styles_trial'
					: flowTrialChirho
						? 'flow_review_trial'
						: chapterTrialChirho,
			{ funding_chirho: fundingChirho, eligible_chirho: planChirho.eligible_chirho }
		);
	const ledgerPathChirho = join(folderChirho, 'receipts-chirho.json');
	let receiptsChirho: ReceiptChirho[] = (await existsChirho(ledgerPathChirho))
		? await jsonChirho(ledgerPathChirho)
		: [];
	const creditsChirho = reservePlanChirho(receiptsChirho);
	if (!applyChirho)
		return {
			dry_run_chirho: true,
			jobs_chirho: rowsChirho,
			reserved_credits_chirho: creditsChirho,
			previous_reserved_credits_chirho: priorCreditsChirho,
			total_reserved_credits_chirho: creditsChirho + priorCreditsChirho,
			maximum_credits_chirho: ceilingChirho
		};
	await mkdir(folderChirho, { recursive: true });
	const lockPathChirho = join(folderChirho, 'generation-chirho.lock');
	const lockChirho = await open(lockPathChirho, 'wx');
	await lockChirho.writeFile(String(process.pid));
	await lockChirho.sync();
	try {
		receiptsChirho = (await existsChirho(ledgerPathChirho))
			? await jsonChirho(ledgerPathChirho)
			: [];
		reservePlanChirho(receiptsChirho);
		await planChirho.verify_source_chirho();
		const manifestPathChirho = join(folderChirho, 'audition-manifest-chirho.json');
		if (
			receiptsChirho.length === rowsChirho.length &&
			receiptsChirho.every((receiptChirho) => receiptChirho.state_chirho === 'received') &&
			(await existsChirho(manifestPathChirho))
		) {
			for (const receiptChirho of receiptsChirho) {
				if (
					!receiptChirho.path_chirho ||
					sha256Chirho(await readFile(join(folderChirho, receiptChirho.path_chirho))) !==
						receiptChirho.sha256_chirho
				)
					throw new Error('Cached audio changed; refusing replacement synthesis');
			}
			const previousChirho = await jsonChirho(manifestPathChirho);
			if (JSON.stringify(previousChirho.jobs_chirho) !== JSON.stringify(rowsChirho))
				throw new Error('Cached recording source identity changed');
			return { ...previousChirho, cache_hit_chirho: true };
		}
		// A selective run with nothing left to request never contacts the provider.
		if (
			selectiveChirho &&
			!rowsChirho.some(
				(jobChirho) =>
					requestableChirho(jobChirho) &&
					!receiptsChirho.some((rowChirho) => rowChirho.id_chirho === jobChirho.id_chirho)
			)
		)
			return {
				no_request_needed_chirho: true,
				reserved_credits_chirho: creditsChirho,
				previous_reserved_credits_chirho: priorCreditsChirho,
				total_reserved_credits_chirho: creditsChirho + priorCreditsChirho,
				maximum_credits_chirho: ceilingChirho
			};
		const statusPathChirho = join(folderChirho, 'batch-status-chirho.json');
		if (
			chapterTrialChirho &&
			(await existsChirho(statusPathChirho)) &&
			(await jsonChirho(statusPathChirho)).provider_hold_chirho === true
		)
			throw new Error(
				'Prior repeated speech failures require owner reconciliation; no automatic restart'
			);
		// A funded plan uses only its named credential; it never falls back to the primary key.
		const keyChirho = fundingChirho
			? process.env[fundingChirho.key_name_chirho]?.trim()
			: (process.env.ELEVENLABS_API_KEY_CHIRHO ?? process.env.ELEVEN_LABS_API_KEY_CHIRHO);
		if (!keyChirho)
			throw new Error(
				fundingChirho
					? `Funded speech credential ${fundingChirho.key_name_chirho} missing`
					: 'Speech credential missing'
			);
		const requestChirho = async (
			pathChirho: string,
			methodChirho = 'GET',
			bodyChirho?: unknown
		) => {
			let responseChirho: Response;
			for (let attemptChirho = 0; ; attemptChirho++) {
				responseChirho = await fetch(`${ORIGIN_CHIRHO}${pathChirho}`, {
					method: methodChirho,
					headers: {
						'xi-api-key': keyChirho,
						...(bodyChirho ? { 'content-type': 'application/json' } : {})
					},
					...(bodyChirho ? { body: JSON.stringify(bodyChirho) } : {}),
					signal: AbortSignal.timeout(90000)
				});
				// Only metadata GETs can retry. A synthesis POST always keeps its one durable identity.
				if (methodChirho !== 'GET' || responseChirho.status !== 429 || attemptChirho >= 2) break;
				const retryHeaderChirho = responseChirho.headers.get('retry-after');
				const retrySecondsChirho = retryHeaderChirho === null ? NaN : Number(retryHeaderChirho);
				const waitChirho = Number.isFinite(retrySecondsChirho)
					? retrySecondsChirho * 1000
					: 5000 * (attemptChirho + 1);
				if (waitChirho > 30_000 || waitChirho < 0) break;
				await responseChirho.arrayBuffer();
				await new Promise((resolveChirho) => setTimeout(resolveChirho, waitChirho));
			}
			if (!responseChirho.ok)
				throw new SpeechProviderErrorChirho(responseChirho.status, methodChirho);
			return responseChirho;
		};
		const subscriptionChirho = await (await requestChirho('/v1/user/subscription')).json();
		const includedNeedChirho = productionChirho
			? Math.max(
					0,
					creditsChirho -
						receiptsChirho.reduce(
							(totalChirho, rowChirho) =>
								totalChirho + accountedReceiptCreditsChirho(rowChirho, fundingChirho),
							0
						)
				)
			: ceilingChirho;
		if (
			subscriptionChirho.status !== 'active' ||
			!['creator', 'pro', 'scale', 'business', 'enterprise'].includes(subscriptionChirho.tier)
		)
			throw new Error('Paid speech subscription unavailable; no request');
		if (fundingChirho && subscriptionChirho.can_extend_character_limit !== false)
			throw new Error('Funded speech account permits overage; included-only funding refused');
		if (
			(fundingChirho?.billing_cycle_reset_chirho ??
				fundingChirho?.settlement_chirho?.reset_unix_chirho) &&
			subscriptionChirho.next_character_count_reset_unix !==
				(fundingChirho?.billing_cycle_reset_chirho ??
					fundingChirho?.settlement_chirho?.reset_unix_chirho)
		)
			throw new Error('Speech billing cycle changed; settlement cannot cross a reset');
		if (
			subscriptionChirho.character_limit - subscriptionChirho.character_count <
				includedNeedChirho + (completionChirho?.minimum_balance_chirho ?? 1000) ||
			!completionBalanceAllowsChirho(completionChirho, subscriptionChirho, 0, includedNeedChirho)
		)
			throw new AudioBudgetErrorChirho(
				'quota',
				'Included speech credits unavailable; overage refused'
			);
		const modelsChirho = await (await requestChirho('/v1/models')).json();
		const modelChirho = modelsChirho.find(
			(rowChirho: { model_id: string }) => rowChirho.model_id === MODEL_CHIRHO
		);
		if (
			!modelChirho?.can_do_text_to_speech ||
			modelChirho.requires_alpha_access ||
			modelChirho.model_rates?.character_cost_multiplier !== 1
		)
			throw new Error('Verified non-beta Hebrew/Greek model/rate unavailable');
		const availableChirho = (await (await requestChirho('/v1/voices')).json()).voices;
		const verifiedLanguagesChirho = new Set<LanguageChirho>();
		let balanceChirho = subscriptionChirho;
		let balanceCheckedAtChirho = Date.now();
		let reservedSinceBalanceChirho = 0;
		let generatedChirho = 0;
		let consecutiveFailuresChirho = 0;
		const failuresChirho: { id_chirho: string; reason_chirho: string }[] = [];
		for (const jobChirho of rowsChirho) {
			const previousChirho = receiptsChirho.find(
				(rowChirho) => rowChirho.id_chirho === jobChirho.id_chirho
			);
			if (previousChirho) {
				if (chapterTrialChirho && previousChirho.state_chirho === 'requested') continue;
				if (
					!previousChirho.path_chirho ||
					sha256Chirho(await readFile(join(folderChirho, previousChirho.path_chirho))) !==
						previousChirho.sha256_chirho
				)
					throw new Error('Cached audio changed; refusing replacement synthesis');
				continue;
			}
			if (!requestableChirho(jobChirho)) continue;
			if (generatedChirho >= limitChirho || planChirho.should_stop_chirho?.()) break;
			await planChirho.verify_source_chirho();
			const voiceChirho = VOICES_CHIRHO[jobChirho.language_chirho];
			if (!verifiedLanguagesChirho.has(jobChirho.language_chirho)) {
				const sharedChirho = (
					await (
						await requestChirho(
							`/v1/shared-voices?language=${jobChirho.language_chirho}&page_size=100`
						)
					).json()
				).voices.find(
					(rowChirho: { voice_id: string }) => rowChirho.voice_id === voiceChirho.id_chirho
				);
				if (
					!sharedChirho ||
					sharedChirho.rate !== 1 ||
					sharedChirho.language !== jobChirho.language_chirho
				)
					throw new Error('Native voice/rate changed; refusing synthesis');
				verifiedLanguagesChirho.add(jobChirho.language_chirho);
			}
			let libraryChirho = availableChirho.find(
				(rowChirho: { voice_id: string; sharing?: { original_voice_id?: string } }) =>
					rowChirho.voice_id === voiceChirho.id_chirho ||
					rowChirho.sharing?.original_voice_id === voiceChirho.id_chirho
			);
			if (!libraryChirho) {
				if (chapterTrialChirho)
					throw new Error(
						'Existing chapter voice unavailable; refusing another voice or account change'
					);
				const addedChirho = await (
					await requestChirho(
						`/v1/voices/add/${voiceChirho.owner_chirho}/${voiceChirho.id_chirho}`,
						'POST',
						{ new_name: `Hinneh - ${voiceChirho.name_chirho}` }
					)
				).json();
				libraryChirho = {
					voice_id: addedChirho.voice_id,
					sharing: { original_voice_id: voiceChirho.id_chirho }
				};
				availableChirho.push(libraryChirho);
			}
			// Reserve locally between bounded metadata checks instead of hammering the subscription API.
			if (Date.now() - balanceCheckedAtChirho >= 60_000) {
				balanceChirho = await (await requestChirho('/v1/user/subscription')).json();
				balanceCheckedAtChirho = Date.now();
				reservedSinceBalanceChirho = 0;
			}
			if (
				(fundingChirho?.billing_cycle_reset_chirho ??
					fundingChirho?.settlement_chirho?.reset_unix_chirho) &&
				balanceChirho.next_character_count_reset_unix !==
					(fundingChirho?.billing_cycle_reset_chirho ??
						fundingChirho?.settlement_chirho?.reset_unix_chirho)
			)
				throw new Error('Speech billing cycle changed; no new request');
			if (fundingChirho && balanceChirho.can_extend_character_limit !== false)
				throw new Error('Funded speech account permits overage; no new request');
			if (
				balanceChirho.character_limit - balanceChirho.character_count - reservedSinceBalanceChirho <
					(productionChirho ? [...synthesisTextChirho(jobChirho)].length : ceilingChirho) +
						(completionChirho?.minimum_balance_chirho ?? 1000) ||
				!completionBalanceAllowsChirho(
					completionChirho,
					balanceChirho,
					reservedSinceBalanceChirho,
					productionChirho ? [...synthesisTextChirho(jobChirho)].length : ceilingChirho
				) ||
				balanceChirho.character_count - subscriptionChirho.character_count >
					(fundingChirho?.additional_credits_chirho ?? ceilingChirho)
			)
				throw new AudioBudgetErrorChirho(
					'quota',
					'Speech balance changed; no overage or further generation'
				);
			const receiptChirho: ReceiptChirho = {
				id_chirho: jobChirho.id_chirho,
				key_chirho: cacheKeyChirho(jobChirho),
				reserved_credits_chirho: [...synthesisTextChirho(jobChirho)].length,
				state_chirho: 'requested',
				voice_id_chirho: libraryChirho.voice_id,
				voice_name_chirho: voiceChirho.name_chirho,
				...(fundingChirho
					? {
							funding_id_chirho: fundingChirho.id_chirho,
							funding_key_name_chirho: fundingChirho.key_name_chirho,
							...(fundingChirho.settlement_chirho
								? { settlement_id_chirho: fundingChirho.settlement_chirho.id_chirho }
								: {})
						}
					: {})
			};
			receiptsChirho.push(receiptChirho);
			await writeChirho(ledgerPathChirho, JSON.stringify(receiptsChirho, null, 2) + '\n');
			reservedSinceBalanceChirho += receiptChirho.reserved_credits_chirho;
			generatedChirho++;
			try {
				const responseChirho = await requestChirho(
					`/v1/text-to-speech/${libraryChirho.voice_id}?output_format=mp3_44100_128`,
					'POST',
					{
						text: synthesisTextChirho(jobChirho),
						model_id: MODEL_CHIRHO,
						language_code: jobChirho.language_chirho,
						apply_text_normalization: 'off',
						voice_settings: SETTINGS_CHIRHO
					}
				);
				const bufferChirho = new Uint8Array(await responseChirho.arrayBuffer());
				if (
					bufferChirho.length < 1000 ||
					bufferChirho.length > 8 * 1024 ** 2 ||
					!responseChirho.headers.get('content-type')?.includes('audio')
				)
					throw new Error('Audio response invalid; retain request for reconciliation');
				receiptChirho.path_chirho = `${jobChirho.id_chirho}-${receiptChirho.key_chirho.slice(0, 12)}-chirho.mp3`;
				await writeChirho(join(folderChirho, receiptChirho.path_chirho), bufferChirho);
				receiptChirho.state_chirho = 'received';
				receiptChirho.sha256_chirho = sha256Chirho(bufferChirho);
				receiptChirho.bytes_chirho = bufferChirho.length;
				receiptChirho.request_id_chirho = responseChirho.headers.get('request-id');
				await writeChirho(ledgerPathChirho, JSON.stringify(receiptsChirho, null, 2) + '\n');
				await planChirho.on_receipt_chirho?.(receiptsChirho);
				consecutiveFailuresChirho = 0;
			} catch (errorChirho) {
				if (
					!chapterTrialChirho ||
					['ENOSPC', 'EACCES', 'EROFS', 'EMFILE'].includes(
						(errorChirho as NodeJS.ErrnoException).code ?? ''
					)
				)
					throw errorChirho;
				failuresChirho.push({
					id_chirho: jobChirho.id_chirho,
					reason_chirho:
						errorChirho instanceof Error ? errorChirho.message : 'Unknown speech response'
				});
				consecutiveFailuresChirho++;
				await writeChirho(
					statusPathChirho,
					JSON.stringify(
						{
							provider_hold_chirho:
								consecutiveFailuresChirho >= 3 ||
								(errorChirho instanceof SpeechProviderErrorChirho &&
									[401, 402, 403, 429].includes(errorChirho.statusChirho)),
							failures_chirho: failuresChirho
						},
						null,
						2
					) + '\n'
				);
				console.error(`Held ${jobChirho.id_chirho}; no retry of its reserved request.`);
				if (
					consecutiveFailuresChirho >= 3 ||
					(errorChirho instanceof SpeechProviderErrorChirho &&
						[401, 402, 403, 429].includes(errorChirho.statusChirho))
				)
					break;
			}
		}
		const afterChirho = await (await requestChirho('/v1/user/subscription')).json();
		const resultChirho = {
			generated_at_chirho: new Date().toISOString(),
			model_chirho: MODEL_CHIRHO,
			review_chirho: 'pending_listener_review',
			license_chirho:
				'Generated during paid ElevenLabs subscription; source text public domain. Native voice selections from the licensed public voice library.',
			included_credits_before_chirho:
				subscriptionChirho.character_limit - subscriptionChirho.character_count,
			used_credit_delta_chirho: afterChirho.character_count - subscriptionChirho.character_count,
			reserved_credits_chirho: creditsChirho,
			previous_reserved_credits_chirho: priorCreditsChirho,
			total_reserved_credits_chirho: creditsChirho + priorCreditsChirho,
			...(fundingChirho
				? {
						funding_id_chirho: fundingChirho.id_chirho,
						funding_key_name_chirho: fundingChirho.key_name_chirho
					}
				: {}),
			jobs_chirho: rowsChirho,
			clips_chirho: receiptsChirho,
			...(chapterTrialChirho
				? {
						planned_requests_chirho: rowsChirho.length,
						received_requests_chirho: receiptsChirho.filter(
							(rowChirho) => rowChirho.state_chirho === 'received'
						).length,
						held_requests_chirho: receiptsChirho.filter(
							(rowChirho) => rowChirho.state_chirho === 'requested'
						).length,
						requested_credits_chirho: receiptsChirho.reduce(
							(totalChirho, rowChirho) => totalChirho + rowChirho.reserved_credits_chirho,
							0
						),
						complete_chirho:
							receiptsChirho.length === rowsChirho.length &&
							receiptsChirho.every((rowChirho) => rowChirho.state_chirho === 'received'),
						failures_chirho: failuresChirho
					}
				: {})
		};
		await writeChirho(
			join(folderChirho, 'audition-manifest-chirho.json'),
			JSON.stringify(resultChirho, null, 2) + '\n'
		);
		return resultChirho;
	} finally {
		await lockChirho.close();
		await unlink(lockPathChirho);
	}
}
if (import.meta.main) {
	const argumentsChirho = process.argv.slice(2);
	if (
		argumentsChirho.some(
			(argumentChirho) => !['--apply-chirho', '--ipa-trial-chirho'].includes(argumentChirho)
		)
	)
		throw new Error(
			'Only the fixed original/IPA trial and --apply-chirho are supported; no bulk or paid-overage mode'
		);
	const resultChirho = await auditionChirho(
		resolve('.'),
		argumentsChirho.includes('--apply-chirho'),
		argumentsChirho.includes('--ipa-trial-chirho')
	);
	console.log(JSON.stringify(resultChirho, null, 2));
}
