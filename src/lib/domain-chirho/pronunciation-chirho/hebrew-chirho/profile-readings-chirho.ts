// For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life. — John 3:16 (KJV)
// Workflow: reusable-word-audio-chirho.md. Finite exact-source profiles, never a general stress fallback.
import dataChirho from './profile-readings-chirho/profiles-chirho.json';
import {
	readingMatchesChirho,
	sourceSpokenWordChirho,
	type ReadingTokenChirho
} from './reading-continuation-chirho';
import { divineNameReadingChirho } from '../divine-name-chirho';
import { hebrewPhoneticsChirho } from './hebrew-phonetics-chirho';
import { wordPhoneticsChirho } from './word-phonetics-chirho';
import { HEBREW_WORD_RECIPE_CHIRHO, productionWordRecipeChirho } from '../production-recipe-chirho';

export interface ProfileTokenChirho extends ReadingTokenChirho {
	id_chirho?: string;
	start_chirho?: number;
	end_chirho?: number;
	raw_lemma_chirho?: string;
	source_language_chirho?: string;
	written_reading_chirho?: string;
	qere_chirho?: readonly ProfileTokenChirho[];
}
export interface ProfileVerseChirho {
	id_chirho: string;
	canonical_text_chirho: string;
	tokens_chirho: readonly ProfileTokenChirho[];
}
type AnalysisWordsChirho = ReturnType<typeof hebrewPhoneticsChirho>['words_chirho'];
type DivineReadingChirho = ReturnType<typeof divineNameReadingChirho>;
interface ProfileMemberChirho {
	token_chirho: ProfileTokenChirho;
	analysis_text_chirho: string;
	divine_reading_chirho: DivineReadingChirho;
}
interface StressEvidenceChirho {
	lesson_id_chirho: string;
	token_id_chirho: string;
	content_path_chirho: string;
	content_sha256_chirho: string;
	canonical_text_chirho: string;
	canonical_sha256_chirho: string;
	source_token_chirho: ProfileTokenChirho;
	analysis_text_chirho: string;
	analysis_words_chirho: AnalysisWordsChirho;
	ipa_chirho: string;
	stress_index_chirho: number;
}
export interface ProfileReadingChirho {
	id_chirho: string;
	lesson_id_chirho: string;
	token_id_chirho: string;
	text_chirho: string;
	spoken_text_chirho: string;
	profile_kind_chirho:
		'divine_maqqef_chirho' | 'qere_maqqef_chirho' | 'exact_stress_parallel_chirho';
	content_path_chirho: string;
	content_sha256_chirho: string;
	canonical_text_chirho: string;
	canonical_sha256_chirho: string;
	ipa_chirho: string;
	source_token_chirho: ProfileTokenChirho;
	source_group_chirho: string | null;
	analysis_text_chirho: string;
	analysis_words_chirho: AnalysisWordsChirho;
	members_chirho: readonly ProfileMemberChirho[];
	checked_tail_ipa_chirho: string | null;
	stress_index_chirho: number | null;
	stress_evidence_chirho: StressEvidenceChirho | null;
}
export interface ProfileOccurrenceChirho {
	token_id_chirho: string;
	text_chirho: string;
	profile_id_chirho?: unknown;
	lesson_id_chirho?: unknown;
	canonical_sha256_chirho?: unknown;
	content_path_chirho?: unknown;
	content_sha256_chirho?: unknown;
}
export interface ProfileRecordingInputChirho {
	source_context_chirho?: unknown;
	language_chirho?: unknown;
	recipe_id_chirho?: unknown;
	ipa_chirho?: unknown;
	synthesis_text_chirho?: unknown;
	canonical_sha256_chirho?: unknown;
}
function freezeChirho(valueChirho: object): void {
	for (const childChirho of Object.values(valueChirho))
		if (childChirho && typeof childChirho === 'object') freezeChirho(childChirho);
	Object.freeze(valueChirho);
}
const profilesChirho = new Map<string, ProfileReadingChirho>();
for (const profileChirho of dataChirho.profiles_chirho as ProfileReadingChirho[]) {
	if (profilesChirho.has(profileChirho.token_id_chirho))
		throw Error('Duplicate finite profile token');
	freezeChirho(profileChirho);
	profilesChirho.set(profileChirho.token_id_chirho, profileChirho);
}
// Independent token inventory retains fail-closed detection when an individual profile is absent.
const tokenIdsChirho = new Set<string>(dataChirho.token_ids_chirho);
export function hasProfileReadingChirho(tokenIdChirho: string): boolean {
	return tokenIdsChirho.has(tokenIdChirho);
}
function sameTokenChirho(
	actualChirho: ProfileTokenChirho,
	expectedChirho: ProfileTokenChirho
): boolean {
	return (
		readingMatchesChirho(actualChirho, expectedChirho) &&
		actualChirho.start_chirho === expectedChirho.start_chirho &&
		actualChirho.end_chirho === expectedChirho.end_chirho &&
		actualChirho.raw_lemma_chirho === expectedChirho.raw_lemma_chirho &&
		actualChirho.source_language_chirho === expectedChirho.source_language_chirho &&
		actualChirho.written_reading_chirho === expectedChirho.written_reading_chirho &&
		(actualChirho.qere_chirho ?? []).every((childChirho, indexChirho) =>
			sameTokenChirho(childChirho, expectedChirho.qere_chirho![indexChirho])
		)
	);
}
function sourceTokenChirho(
	verseChirho: ProfileVerseChirho,
	expectedChirho: ProfileTokenChirho
): ProfileTokenChirho | null {
	const matchesChirho = verseChirho.tokens_chirho.filter(
		(tokenChirho) => tokenChirho.id_chirho === expectedChirho.id_chirho
	);
	const actualChirho = matchesChirho[0];
	if (
		matchesChirho.length !== 1 ||
		!sameTokenChirho(actualChirho, expectedChirho) ||
		!Number.isSafeInteger(actualChirho.start_chirho) ||
		!Number.isSafeInteger(actualChirho.end_chirho) ||
		(actualChirho.start_chirho ?? -1) < 0 ||
		(actualChirho.end_chirho ?? -1) <= (actualChirho.start_chirho ?? -1) ||
		verseChirho.canonical_text_chirho.slice(actualChirho.start_chirho, actualChirho.end_chirho) !==
			actualChirho.text_chirho
	)
		return null;
	if (
		actualChirho.source_language_chirho === 'arc' ||
		actualChirho.raw_morphology_chirho?.startsWith('A')
	)
		return null;
	return actualChirho;
}
function finalChirho(verseChirho: ProfileVerseChirho, tokenChirho: ProfileTokenChirho): string {
	return verseChirho.tokens_chirho.at(-1) === tokenChirho &&
		verseChirho.canonical_text_chirho.slice(tokenChirho.end_chirho).includes('׃')
		? '׃'
		: '';
}
const sameWordsChirho = (actualChirho: AnalysisWordsChirho, expectedChirho: AnalysisWordsChirho) =>
	JSON.stringify(actualChirho) === JSON.stringify(expectedChirho);
function samePolicyChirho(
	actualChirho: DivineReadingChirho,
	expectedChirho: DivineReadingChirho
): boolean {
	return actualChirho === null
		? expectedChirho === null
		: expectedChirho !== null &&
				actualChirho.name_chirho === expectedChirho.name_chirho &&
				actualChirho.ipa_chirho === expectedChirho.ipa_chirho &&
				actualChirho.analysis_text_chirho === expectedChirho.analysis_text_chirho;
}
function readingIdentityChirho(tokenChirho: ProfileTokenChirho): unknown[] {
	return [
		tokenChirho.lemma_id_chirho,
		tokenChirho.lemma_augment_chirho ?? null,
		tokenChirho.raw_morphology_chirho,
		sourceSpokenWordChirho(tokenChirho).replace(/[\u0591-\u05af]/gu, ''),
		(tokenChirho.qere_chirho ?? []).map(readingIdentityChirho)
	];
}
function syllableIdentityChirho(wordsChirho: AnalysisWordsChirho): string {
	return JSON.stringify(
		wordsChirho.map((wordChirho) =>
			wordChirho.syllables_chirho.map((syllableChirho) => [
				syllableChirho.ipa_chirho,
				syllableChirho.stressed_chirho,
				syllableChirho.qamats_qatan_chirho
			])
		)
	);
}
function checkStressChirho(
	profileChirho: ProfileReadingChirho,
	verseChirho: ProfileVerseChirho,
	tokenChirho: ProfileTokenChirho
): boolean {
	const evidenceChirho = profileChirho.stress_evidence_chirho;
	if (
		!evidenceChirho ||
		profileChirho.stress_index_chirho !== evidenceChirho.stress_index_chirho ||
		JSON.stringify(readingIdentityChirho(tokenChirho)) !==
			JSON.stringify(readingIdentityChirho(evidenceChirho.source_token_chirho))
	)
		return false;
	const evidenceTokenChirho = evidenceChirho.source_token_chirho;
	if (
		evidenceTokenChirho.id_chirho !== evidenceChirho.token_id_chirho ||
		evidenceChirho.canonical_text_chirho.slice(
			evidenceTokenChirho.start_chirho,
			evidenceTokenChirho.end_chirho
		) !== evidenceTokenChirho.text_chirho
	)
		return false;
	const evidenceSuffixChirho = evidenceChirho.canonical_text_chirho.slice(
		evidenceTokenChirho.end_chirho
	);
	const evidenceTextChirho =
		sourceSpokenWordChirho(evidenceTokenChirho) +
		(evidenceSuffixChirho.includes('׃') && !/[\u05d0-\u05ea]/u.test(evidenceSuffixChirho)
			? '׃'
			: '');
	if (evidenceTextChirho !== evidenceChirho.analysis_text_chirho) return false;
	const checkedChirho = wordPhoneticsChirho(evidenceTextChirho);
	const indexChirho = checkedChirho.words_chirho[0].syllables_chirho.findIndex(
		(syllableChirho) => syllableChirho.stressed_chirho
	);
	const inputChirho = sourceSpokenWordChirho(tokenChirho) + finalChirho(verseChirho, tokenChirho);
	if (
		indexChirho !== profileChirho.stress_index_chirho ||
		inputChirho !== profileChirho.analysis_text_chirho ||
		checkedChirho.ipa_chirho !== evidenceChirho.ipa_chirho ||
		!sameWordsChirho(checkedChirho.words_chirho, evidenceChirho.analysis_words_chirho)
	)
		return false;
	const parsedChirho = wordPhoneticsChirho(inputChirho, indexChirho);
	return (
		parsedChirho.ipa_chirho === profileChirho.ipa_chirho &&
		parsedChirho.ipa_chirho === checkedChirho.ipa_chirho &&
		sameWordsChirho(parsedChirho.words_chirho, profileChirho.analysis_words_chirho) &&
		syllableIdentityChirho(parsedChirho.words_chirho) ===
			syllableIdentityChirho(checkedChirho.words_chirho)
	);
}
function checkGroupChirho(
	profileChirho: ProfileReadingChirho,
	verseChirho: ProfileVerseChirho,
	tokenChirho: ProfileTokenChirho
): boolean {
	const firstChirho = verseChirho.tokens_chirho.indexOf(tokenChirho);
	let lastChirho = firstChirho;
	while (
		lastChirho + 1 < verseChirho.tokens_chirho.length &&
		verseChirho.canonical_text_chirho.slice(
			verseChirho.tokens_chirho[lastChirho].end_chirho,
			verseChirho.tokens_chirho[lastChirho + 1].start_chirho
		) === '־'
	)
		lastChirho++;
	const membersChirho = verseChirho.tokens_chirho.slice(firstChirho, lastChirho + 1),
		tailChirho = membersChirho.at(-1);
	if (
		!tailChirho ||
		membersChirho.length < 2 ||
		membersChirho.length !== profileChirho.members_chirho.length
	)
		return false;
	if (
		verseChirho.canonical_text_chirho.slice(tokenChirho.start_chirho, tailChirho.end_chirho) +
			finalChirho(verseChirho, tailChirho) !==
		profileChirho.source_group_chirho
	)
		return false;
	let divineMembersChirho = 0;
	const textsChirho: string[] = [];
	for (let indexChirho = 0; indexChirho < membersChirho.length; indexChirho++) {
		const actualChirho = membersChirho[indexChirho],
			boundChirho = profileChirho.members_chirho[indexChirho];
		if (sourceTokenChirho(verseChirho, boundChirho.token_chirho) !== actualChirho) return false;
		const policyChirho = divineNameReadingChirho(actualChirho);
		if (!samePolicyChirho(policyChirho, boundChirho.divine_reading_chirho)) return false;
		if (profileChirho.profile_kind_chirho === 'divine_maqqef_chirho') {
			if (actualChirho.qere_chirho?.length || actualChirho.written_reading_chirho === 'ketiv')
				return false;
			if (policyChirho) divineMembersChirho++;
		} else if (
			profileChirho.profile_kind_chirho !== 'qere_maqqef_chirho' ||
			policyChirho ||
			(actualChirho.written_reading_chirho === 'ketiv' && !actualChirho.qere_chirho?.length)
		)
			return false;
		const textChirho = policyChirho?.analysis_text_chirho ?? sourceSpokenWordChirho(actualChirho);
		if (
			textChirho !== boundChirho.analysis_text_chirho ||
			/\s|־/u.test(textChirho) ||
			(indexChirho < membersChirho.length - 1 && /[\u0591-\u05af]/u.test(textChirho))
		)
			return false;
		textsChirho.push(textChirho);
	}
	if (profileChirho.profile_kind_chirho === 'divine_maqqef_chirho' && divineMembersChirho === 0)
		return false;
	const analysisChirho = textsChirho.join('־') + finalChirho(verseChirho, tailChirho);
	if (analysisChirho !== profileChirho.analysis_text_chirho) return false;
	const parsedChirho = hebrewPhoneticsChirho(analysisChirho),
		headChirho = parsedChirho.words_chirho[0],
		checkedTailChirho = wordPhoneticsChirho(
			textsChirho.at(-1)! + finalChirho(verseChirho, tailChirho)
		);
	return (
		parsedChirho.words_chirho.length === membersChirho.length &&
		headChirho.maqqef_linked_chirho &&
		!headChirho.syllables_chirho.some((syllableChirho) => syllableChirho.stressed_chirho) &&
		!/[ˈˌ]/u.test(headChirho.ipa_chirho) &&
		headChirho.ipa_chirho === profileChirho.ipa_chirho &&
		parsedChirho.words_chirho.at(-1)!.ipa_chirho === checkedTailChirho.ipa_chirho &&
		checkedTailChirho.ipa_chirho === profileChirho.checked_tail_ipa_chirho &&
		sameWordsChirho(parsedChirho.words_chirho, profileChirho.analysis_words_chirho)
	);
}
/** Exact finite source/profile lookup. A changed source or unavailable profile never borrows a reading. */
export function profileReadingChirho(
	verseChirho: ProfileVerseChirho,
	tokenIdChirho: string
): ProfileReadingChirho | null {
	const profileChirho = profilesChirho.get(tokenIdChirho);
	if (
		!profileChirho ||
		!/^profile-[a-f0-9]{24}-chirho$/u.test(profileChirho.id_chirho) ||
		typeof profileChirho.ipa_chirho !== 'string' ||
		!profileChirho.ipa_chirho ||
		!hasProfileReadingChirho(tokenIdChirho) ||
		profileChirho.lesson_id_chirho !== verseChirho.id_chirho ||
		profileChirho.canonical_text_chirho !== verseChirho.canonical_text_chirho
	)
		return null;
	const tokenChirho = sourceTokenChirho(verseChirho, profileChirho.source_token_chirho);
	if (
		!tokenChirho ||
		tokenChirho.id_chirho !== profileChirho.token_id_chirho ||
		tokenChirho.text_chirho !== profileChirho.text_chirho ||
		sourceSpokenWordChirho(tokenChirho) !== profileChirho.spoken_text_chirho
	)
		return null;
	try {
		return (
			profileChirho.profile_kind_chirho === 'exact_stress_parallel_chirho'
				? checkStressChirho(profileChirho, verseChirho, tokenChirho)
				: checkGroupChirho(profileChirho, verseChirho, tokenChirho)
		)
			? profileChirho
			: null;
	} catch {
		return null;
	}
}
/** Shared producer/installer/publisher/selector boundary: missing or altered proof refuses. */
export function verifyProfileRecordingChirho(
	verseChirho: ProfileVerseChirho,
	occurrenceChirho: ProfileOccurrenceChirho,
	inputChirho: ProfileRecordingInputChirho
): ProfileReadingChirho {
	const profileChirho = profileReadingChirho(verseChirho, occurrenceChirho.token_id_chirho);
	if (
		!profileChirho ||
		inputChirho.source_context_chirho !== 'profile_chirho' ||
		occurrenceChirho.profile_id_chirho !== profileChirho.id_chirho ||
		occurrenceChirho.text_chirho !== profileChirho.spoken_text_chirho ||
		inputChirho.language_chirho !== 'he' ||
		inputChirho.recipe_id_chirho !== HEBREW_WORD_RECIPE_CHIRHO ||
		inputChirho.ipa_chirho !== profileChirho.ipa_chirho
	)
		throw Error('Exact finite source profile proof is missing or changed');
	for (const [keyChirho, valueChirho] of Object.entries({
		lesson_id_chirho: profileChirho.lesson_id_chirho,
		canonical_sha256_chirho: profileChirho.canonical_sha256_chirho,
		content_path_chirho: profileChirho.content_path_chirho,
		content_sha256_chirho: profileChirho.content_sha256_chirho
	}))
		if (
			keyChirho in occurrenceChirho &&
			occurrenceChirho[keyChirho as keyof ProfileOccurrenceChirho] !== valueChirho
		)
			throw Error('Finite profile source binding differs');
	if (
		inputChirho.canonical_sha256_chirho !== undefined &&
		inputChirho.canonical_sha256_chirho !== profileChirho.canonical_sha256_chirho
	)
		throw Error('Finite profile canonical hash differs');
	const recipeChirho = productionWordRecipeChirho(
		profileChirho.spoken_text_chirho,
		HEBREW_WORD_RECIPE_CHIRHO,
		profileChirho.ipa_chirho
	);
	if (!recipeChirho || inputChirho.synthesis_text_chirho !== recipeChirho.synthesis_text_chirho)
		throw Error('Finite profile synthesis input differs');
	return profileChirho;
}
