// For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life. — John 3:16 (KJV)
// Workflow: reusable-word-audio-chirho.md. Finite source profiles, never a new generic stress fallback.
import { isBibleChapterPathChirho } from '../../../../src/lib/bible-chirho/books-chirho';
import {
	hasProfileReadingChirho,
	verifyProfileRecordingChirho,
	type ProfileVerseChirho
} from '../../../../src/lib/domain-chirho/pronunciation-chirho/hebrew-chirho/profile-readings-chirho';
import { readMaqqefFileChirho } from '../maqqef-chirho/funding_chirho';
import { sha256Chirho } from '../../audition_chirho';
import type { LibraryWordChirho } from '../prepare_words_chirho';
import { readingMatchesChirho } from '../../../../src/lib/domain-chirho/pronunciation-chirho/hebrew-chirho/reading-continuation-chirho';

interface ProfileScopeChirho {
	id_chirho?: unknown;
	token_id_chirho?: unknown;
	source_context_chirho?: unknown;
	profile_id_chirho?: unknown;
	job_chirho?: { id_chirho: string; token_id_chirho: string | null };
	occurrences_chirho?: readonly { token_id_chirho: string; profile_id_chirho?: unknown }[];
}
/** A deleted marker cannot turn a known finite profile or its job into an ordinary word. */
export function profileContextRequiredChirho(valueChirho: ProfileScopeChirho): boolean {
	return (
		valueChirho.source_context_chirho === 'profile_chirho' ||
		valueChirho.profile_id_chirho !== undefined ||
		(typeof valueChirho.id_chirho === 'string' && valueChirho.id_chirho.startsWith('profile-')) ||
		(typeof valueChirho.token_id_chirho === 'string' &&
			hasProfileReadingChirho(valueChirho.token_id_chirho)) ||
		valueChirho.job_chirho?.id_chirho.startsWith('profile-') === true ||
		valueChirho.occurrences_chirho?.some(
			(occurrenceChirho) =>
				occurrenceChirho.profile_id_chirho !== undefined ||
				hasProfileReadingChirho(occurrenceChirho.token_id_chirho)
		) === true
	);
}

/** Read exact chapter bytes and verify every profile before installer writes, uploads or speech. */
export async function verifyProfileWordSourcesChirho(
	rootChirho: string,
	wordsChirho: readonly LibraryWordChirho[]
) {
	const chaptersChirho = new Map<
		string,
		{ sha256_chirho: string; verses_chirho: ProfileVerseChirho[] }
	>();
	for (const wordChirho of wordsChirho) {
		if (!profileContextRequiredChirho(wordChirho)) continue;
		if (!wordChirho.occurrences_chirho.length) throw Error('Profile source occurrences missing');
		for (const occurrenceChirho of wordChirho.occurrences_chirho) {
			if (!isBibleChapterPathChirho(occurrenceChirho.content_path_chirho, '/content-chirho/'))
				throw Error('Profile source path refused');
			let chapterChirho = chaptersChirho.get(occurrenceChirho.content_path_chirho);
			if (!chapterChirho) {
				const bytesChirho = await readMaqqefFileChirho(
					rootChirho,
					'static' + occurrenceChirho.content_path_chirho,
					4 * 1024 ** 2
				);
				chapterChirho = {
					sha256_chirho: sha256Chirho(bytesChirho),
					verses_chirho: JSON.parse(bytesChirho.toString()).verses_chirho
				};
				chaptersChirho.set(occurrenceChirho.content_path_chirho, chapterChirho);
			}
			if (chapterChirho.sha256_chirho !== occurrenceChirho.content_sha256_chirho)
				throw Error('Profile chapter changed');
			const verseChirho = chapterChirho.verses_chirho.find(
				(valueChirho) => valueChirho.id_chirho === occurrenceChirho.lesson_id_chirho
			);
			if (
				!verseChirho ||
				sha256Chirho(verseChirho.canonical_text_chirho) !== occurrenceChirho.canonical_sha256_chirho
			)
				throw Error('Profile canonical source changed');
			const profileChirho = verifyProfileRecordingChirho(verseChirho, occurrenceChirho, {
				...wordChirho.job_chirho,
				canonical_sha256_chirho: occurrenceChirho.canonical_sha256_chirho,
				source_context_chirho: wordChirho.source_context_chirho
			});
			if (
				profileChirho.content_path_chirho !== occurrenceChirho.content_path_chirho ||
				profileChirho.content_sha256_chirho !== occurrenceChirho.content_sha256_chirho
			)
				throw Error('Profile exact chapter binding differs');
			for (const evidenceChirho of [
				profileChirho.stress_evidence_chirho,
				profileChirho.tail_stress_evidence_chirho
			]) {
				if (!evidenceChirho) continue;
				if (!isBibleChapterPathChirho(evidenceChirho.content_path_chirho, '/content-chirho/'))
					throw Error('Profile stress evidence path refused');
				const bytesChirho = await readMaqqefFileChirho(
					rootChirho,
					'static' + evidenceChirho.content_path_chirho,
					4 * 1024 ** 2
				);
				if (sha256Chirho(bytesChirho) !== evidenceChirho.content_sha256_chirho)
					throw Error('Profile stress evidence chapter changed');
				const chapterChirho = JSON.parse(bytesChirho.toString()) as {
					verses_chirho: ProfileVerseChirho[];
				};
				const verseChirho = chapterChirho.verses_chirho.find(
					(rowChirho) => rowChirho.id_chirho === evidenceChirho.lesson_id_chirho
				);
				const tokenChirho = verseChirho?.tokens_chirho.find(
					(rowChirho) => rowChirho.id_chirho === evidenceChirho.token_id_chirho
				);
				if (
					!verseChirho ||
					!tokenChirho ||
					verseChirho.canonical_text_chirho !== evidenceChirho.canonical_text_chirho ||
					sha256Chirho(verseChirho.canonical_text_chirho) !==
						evidenceChirho.canonical_sha256_chirho ||
					!readingMatchesChirho(tokenChirho, evidenceChirho.source_token_chirho)
				)
					throw Error('Profile stress evidence source changed');
			}
		}
	}
}
