// For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life. — John 3:16 (KJV)
import { readFileSync as readFileSyncChirho } from 'node:fs';
import { createHash as createHashChirho } from 'node:crypto';
import { expect, it } from 'vitest';
import {
	CONTINUATION_READINGS_CHIRHO,
	readingReviewChirho
} from '../../../src/lib/domain-chirho/pronunciation-chirho/hebrew-chirho/reading-continuation-chirho';
import { ipaNoteChirho } from '../../../src/lib/domain-chirho/pronunciation-chirho/ipa-trial-chirho';
import {
	spokenVerseChirho,
	spokenWordChirho,
	wordPlaybackPlanChirho
} from '../../../src/lib/domain-chirho/pronunciation-chirho';
import { wordPhoneticsChirho } from '../../../src/lib/domain-chirho/pronunciation-chirho/hebrew-chirho/word-phonetics-chirho';
import type { LessonChirho } from '../../../src/lib/domain-chirho/lesson-chirho';

const shaChirho = (valueChirho: string | Buffer) =>
	createHashChirho('sha256').update(valueChirho).digest('hex');
const readChirho = (pathChirho: string) => JSON.parse(readFileSyncChirho(pathChirho, 'utf8'));

it('binds every reviewed reading to its actual source and explicit analysis profile', () => {
	const chaptersChirho = new Map<string, { bytes_chirho: Buffer; verses_chirho: LessonChirho[] }>();
	const lemmasChirho = new Set<string>();
	for (const noteChirho of CONTINUATION_READINGS_CHIRHO) {
		const evidenceChirho = noteChirho.evidence_chirho as {
			chapter_path_chirho: string;
			chapter_sha256_chirho: string;
			canonical_sha256_chirho: string;
			analysis_copy_chirho?: string;
			proposed_reading_chirho: string;
			stress_index_chirho: number;
			lemma_key_chirho: string;
		};
		let chapterChirho = chaptersChirho.get(evidenceChirho.chapter_path_chirho);
		if (!chapterChirho) {
			const bytesChirho = readFileSyncChirho(evidenceChirho.chapter_path_chirho);
			chapterChirho = {
				bytes_chirho: bytesChirho,
				verses_chirho: JSON.parse(bytesChirho.toString()).verses_chirho
			};
			chaptersChirho.set(evidenceChirho.chapter_path_chirho, chapterChirho);
		}
		expect(shaChirho(chapterChirho.bytes_chirho)).toBe(evidenceChirho.chapter_sha256_chirho);
		const verseChirho = chapterChirho.verses_chirho.find(
			(verseChirho) => verseChirho.id_chirho === noteChirho.lesson_id_chirho
		)!;
		expect(shaChirho(verseChirho.canonical_text_chirho)).toBe(
			evidenceChirho.canonical_sha256_chirho
		);
		const tokenChirho = verseChirho.tokens_chirho.find(
			(tokenChirho) => tokenChirho.id_chirho === noteChirho.token_id_chirho
		)!;
		expect(readingReviewChirho(tokenChirho)).toBe(noteChirho);
		expect(ipaNoteChirho(tokenChirho)?.ipa_chirho).toBe(noteChirho.ipa_chirho);
		expect(
			wordPhoneticsChirho(
				evidenceChirho.analysis_copy_chirho ?? evidenceChirho.proposed_reading_chirho,
				evidenceChirho.stress_index_chirho
			).ipa_chirho
		).toBe(noteChirho.ipa_chirho);
		lemmasChirho.add(evidenceChirho.lemma_key_chirho);
	}
	expect(lemmasChirho.size).toBe(118);
});

it('speaks the explicit grouped qere once and preserves source objects and punctuation', () => {
	const verseChirho = (
		readChirho('static/content-chirho/lamentations-chirho/chapter-04-chirho.json')
			.verses_chirho as LessonChirho[]
	).find((verseChirho) => verseChirho.id_chirho === 'Lam.4.3')!;
	const beforeChirho = JSON.stringify(verseChirho);
	const firstChirho = verseChirho.tokens_chirho.find(
		(tokenChirho) => tokenChirho.id_chirho === '257vQ'
	)!;
	const lastChirho = verseChirho.tokens_chirho.find(
		(tokenChirho) => tokenChirho.id_chirho === '25JoL'
	)!;
	const readingChirho = 'כַּיְעֵנִ֖ים';
	expect(spokenWordChirho(firstChirho)).toBe(readingChirho);
	expect(spokenWordChirho(lastChirho)).toBe(readingChirho);
	expect(spokenVerseChirho(verseChirho)).toBe(
		verseChirho.canonical_text_chirho.replace('תנין', 'תַּנִּים֙').replace('כי ענים', readingChirho)
	);
	const planChirho = wordPlaybackPlanChirho(verseChirho);
	expect(planChirho.filter((rowChirho) => rowChirho.text_chirho === readingChirho)).toHaveLength(1);
	expect(planChirho.some((rowChirho) => rowChirho.token_id_chirho === firstChirho.id_chirho)).toBe(
		false
	);
	expect(planChirho).toHaveLength(verseChirho.tokens_chirho.length - 1);
	expect(JSON.stringify(verseChirho)).toBe(beforeChirho);
});

it('does not suppress or substitute a word when the group or exact identity changes', () => {
	const verseChirho = (
		readChirho('static/content-chirho/lamentations-chirho/chapter-04-chirho.json')
			.verses_chirho as LessonChirho[]
	).find((verseChirho) => verseChirho.id_chirho === 'Lam.4.3')!;
	const firstChirho = verseChirho.tokens_chirho.find(
		(tokenChirho) => tokenChirho.id_chirho === '257vQ'
	)!;
	firstChirho.text_chirho += 'x';
	const planChirho = wordPlaybackPlanChirho(verseChirho);
	expect(planChirho).toHaveLength(verseChirho.tokens_chirho.length);
	expect(planChirho.some((rowChirho) => rowChirho.text_chirho === 'כַּיְעֵנִ֖ים')).toBe(false);
	for (const noteChirho of CONTINUATION_READINGS_CHIRHO) {
		const tokenChirho = { id_chirho: noteChirho.token_id_chirho, ...noteChirho };
		for (const changedChirho of [
			{ ...tokenChirho, text_chirho: 'changed' },
			{ ...tokenChirho, lemma_id_chirho: 'H1' },
			{ ...tokenChirho, lemma_augment_chirho: 'z' },
			{ ...tokenChirho, raw_morphology_chirho: 'HNcmsa-x' }
		])
			expect(readingReviewChirho(changedChirho)).toBeNull();
	}
});

it('uses the explicit one-word qere across the intervening source note', () => {
	const verseChirho = (
		readChirho('static/content-chirho/jeremiah-chirho/chapter-48-chirho.json')
			.verses_chirho as LessonChirho[]
	).find((verseChirho) => verseChirho.id_chirho === 'Jer.48.44')!;
	const tokenChirho = verseChirho.tokens_chirho.find(
		(tokenChirho) => tokenChirho.id_chirho === '24PtS'
	)!;
	expect(tokenChirho.text_chirho).toBe('הניס');
	expect(spokenWordChirho(tokenChirho)).toBe('הַנָּ֞ס');
	expect(ipaNoteChirho(tokenChirho)?.ipa_chirho).toBe('haˈnas');
	expect(spokenWordChirho({ ...tokenChirho, lemma_id_chirho: 'H1' })).toBe('הניס');
});
