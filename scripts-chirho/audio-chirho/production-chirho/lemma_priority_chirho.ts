// For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life. — John 3:16 (KJV)
// Workflow: reusable-word-audio-chirho.md. Seed unrecorded Hebrew lemmas before more inflections.
import { readFile as readFileChirho } from 'node:fs/promises';
import { join as joinChirho } from 'node:path';
import { BIBLE_BOOKS_CHIRHO } from '../../../src/lib/bible-chirho/books-chirho';
import { spokenWordChirho } from '../../../src/lib/domain-chirho/pronunciation-chirho';
import { isRejectedAudioChirho } from '../../../src/lib/domain-chirho/pronunciation-chirho/audio-reviews-chirho';
import { validRecordingWindowChirho } from '../../../src/lib/domain-chirho/pronunciation-chirho/production-recipe-chirho';
import { sha256Chirho, type ReceiptChirho } from '../audition_chirho';
import type { LibraryWordChirho } from './prepare_words_chirho';
import { isExtraEligibleChirho } from './funding_chirho';

interface TokenChirho {
	id_chirho: string;
	text_chirho: string;
	lemma_id_chirho: string;
	lemma_augment_chirho?: string | null;
	source_language_chirho?: string;
	lemma_assignment_status_chirho?: string;
	raw_morphology_chirho?: string;
	qere_chirho?: { text_chirho: string }[];
}
export function hebrewLemmaKeyChirho(tokenChirho: TokenChirho): string | null {
	if (
		tokenChirho.source_language_chirho === 'arc' ||
		tokenChirho.raw_morphology_chirho?.startsWith('A') ||
		tokenChirho.lemma_assignment_status_chirho === 'source_review_required' ||
		!/^(?:H[1-9][0-9]*|oshb:[bcdiklms])$/u.test(tokenChirho.lemma_id_chirho)
	)
		return null;
	return JSON.stringify([tokenChirho.lemma_id_chirho, tokenChirho.lemma_augment_chirho ?? null]);
}
export function seedLemmaJobsChirho(
	batchesChirho: readonly {
		words_chirho: readonly LibraryWordChirho[];
		receipts_chirho: readonly ReceiptChirho[];
	}[],
	occurrenceLemmasChirho: ReadonlyMap<string, string>,
	recordedLemmasChirho: ReadonlySet<string>
) {
	const plannedChirho = new Set(recordedLemmasChirho);
	const selectedChirho = new Set<string>();
	let newLemmasChirho = 0;
	for (const batchChirho of batchesChirho)
		for (const wordChirho of batchChirho.words_chirho) {
			if (
				!isExtraEligibleChirho(wordChirho.job_chirho) ||
				batchChirho.receipts_chirho.some(
					(rowChirho) => rowChirho.id_chirho === wordChirho.job_chirho.id_chirho
				)
			)
				continue;
			const keysChirho = new Set(
				wordChirho.occurrences_chirho
					.map((occurrenceChirho) =>
						occurrenceLemmasChirho.get(
							occurrenceChirho.lesson_id_chirho + '!' + occurrenceChirho.token_id_chirho
						)
					)
					.filter((keyChirho): keyChirho is string => Boolean(keyChirho))
			);
			const missingChirho = [...keysChirho].filter((keyChirho) => !plannedChirho.has(keyChirho));
			if (!missingChirho.length) continue;
			selectedChirho.add(wordChirho.job_chirho.id_chirho);
			for (const keyChirho of missingChirho) plannedChirho.add(keyChirho);
			newLemmasChirho += missingChirho.length;
		}
	return { ids_chirho: selectedChirho, new_lemmas_chirho: newLemmasChirho };
}

export async function lemmaPriorityChirho(
	rootChirho: string,
	batchesChirho: readonly {
		words_chirho: readonly LibraryWordChirho[];
		receipts_chirho: readonly ReceiptChirho[];
	}[]
) {
	const readChirho = async (pathChirho: string) =>
		JSON.parse(await readFileChirho(joinChirho(rootChirho, 'static', pathChirho), 'utf8'));
	const audioManifestChirho = await readChirho('/audio-chirho/manifest-chirho.json');
	const recordedChirho = new Set<string>();
	const allChirho = new Set<string>();
	const occurrencesChirho = new Map<string, string>();
	for (const bookChirho of BIBLE_BOOKS_CHIRHO.filter(
		(bookChirho) => bookChirho.language_chirho === 'he'
	)) {
		const contentManifestChirho = await readChirho(
			'/content-chirho/' + bookChirho.slug_chirho + '/manifest-chirho.json'
		);
		const audioEntriesChirho =
			audioManifestChirho.books_chirho[bookChirho.id_chirho]?.chapters_chirho ?? [];
		for (const entryChirho of contentManifestChirho.chapters_chirho) {
			const bytesChirho = await readFileChirho(
				joinChirho(rootChirho, 'static', entryChirho.path_chirho)
			);
			if (sha256Chirho(bytesChirho) !== entryChirho.sha256_chirho)
				throw new Error('Lemma priority source chapter changed');
			const chapterChirho = JSON.parse(bytesChirho.toString());
			const audioEntryChirho = audioEntriesChirho.find(
				(rowChirho: { number_chirho: number }) =>
					rowChirho.number_chirho === entryChirho.number_chirho
			);
			let clipsChirho: {
				token_id_chirho: string | null;
				lesson_id_chirho: string;
				canonical_sha256_chirho: string;
				text_chirho: string;
				ipa_chirho?: string;
				sha256_chirho: string;
				pronunciation_chirho: string;
				review_chirho: string;
				duration_chirho: number;
			}[] = [];
			if (audioEntryChirho) {
				const audioBytesChirho = await readFileChirho(
					joinChirho(rootChirho, 'static', audioEntryChirho.path_chirho)
				);
				if (sha256Chirho(audioBytesChirho) !== audioEntryChirho.sha256_chirho)
					throw new Error('Lemma priority audio chapter changed');
				const audioChirho = JSON.parse(audioBytesChirho.toString());
				if (
					audioChirho.content_path_chirho !== entryChirho.path_chirho ||
					audioChirho.content_sha256_chirho !== entryChirho.sha256_chirho
				)
					throw new Error('Lemma priority audio binding differs');
				clipsChirho = audioChirho.clips_chirho;
			}
			const clipsByWordChirho = new Map<string, typeof clipsChirho>();
			for (const clipChirho of clipsChirho) {
				if (
					!clipChirho.token_id_chirho ||
					!clipChirho.ipa_chirho ||
					clipChirho.pronunciation_chirho !== 'israeli_hebrew' ||
					!['audition', 'approved'].includes(clipChirho.review_chirho) ||
					isRejectedAudioChirho(clipChirho.sha256_chirho) ||
					!validRecordingWindowChirho(clipChirho)
				)
					continue;
				const keyChirho = clipChirho.lesson_id_chirho + '!' + clipChirho.token_id_chirho;
				const rowsChirho = clipsByWordChirho.get(keyChirho) ?? [];
				rowsChirho.push(clipChirho);
				clipsByWordChirho.set(keyChirho, rowsChirho);
			}
			for (const verseChirho of chapterChirho.verses_chirho) {
				const canonicalChirho = sha256Chirho(verseChirho.canonical_text_chirho);
				for (const tokenChirho of verseChirho.tokens_chirho as TokenChirho[]) {
					const keyChirho = hebrewLemmaKeyChirho(tokenChirho);
					if (!keyChirho) continue;
					allChirho.add(keyChirho);
					const identityChirho = verseChirho.id_chirho + '!' + tokenChirho.id_chirho;
					occurrencesChirho.set(identityChirho, keyChirho);
					if (
						(clipsByWordChirho.get(identityChirho) ?? []).some(
							(clipChirho) =>
								clipChirho.canonical_sha256_chirho === canonicalChirho &&
								clipChirho.text_chirho === spokenWordChirho(tokenChirho)
						)
					)
						recordedChirho.add(keyChirho);
				}
			}
		}
	}
	const selectedChirho = seedLemmaJobsChirho(batchesChirho, occurrencesChirho, recordedChirho);
	return {
		...selectedChirho,
		report_chirho: {
			initial_eligible_hebrew_lemmas_chirho: allChirho.size,
			initial_lemmas_without_ipa_chirho: allChirho.size - recordedChirho.size,
			seedable_missing_lemmas_chirho: selectedChirho.new_lemmas_chirho,
			seed_requests_chirho: selectedChirho.ids_chirho.size
		}
	};
}
