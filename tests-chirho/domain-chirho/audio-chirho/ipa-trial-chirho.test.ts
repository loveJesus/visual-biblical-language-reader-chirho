// For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life. — John 3:16 (KJV)
import { describe, expect, it, vi } from 'vitest';
import lessonChirho from '../../../data-chirho/lessons-chirho/proverbs-26-1-chirho.json';
import chapterChirho from '../../../static/content-chirho/proverbs-chirho/chapter-01-chirho.json';
import {
	ipaForRecordingChirho,
	ipaNoteChirho
} from '../../../src/lib/domain-chirho/pronunciation-chirho/ipa-trial-chirho';
import {
	ipaJobsChirho,
	reserveChirho,
	cacheKeyChirho,
	sha256Chirho
} from '../../../scripts-chirho/audio-chirho/audition_chirho';
import { rejectedAudioChirho } from '../../../src/lib/domain-chirho/pronunciation-chirho/audio-reviews-chirho';
import { chapterJobsChirho } from '../../../scripts-chirho/audio-chirho/chapter-chirho/chapter_audition_chirho';
import proverbsChapterChirho from '../../../static/content-chirho/proverbs-chirho/chapter-26-chirho.json';
import johnChapterChirho from '../../../static/content-chirho/john-chirho/chapter-01-chirho.json';

describe('source-bound IPA trial', () => {
	it('plays only a matching chapter recipe, with phrasing preferred to an older audition', async () => {
		const jobsChirho = (await chapterJobsChirho(process.cwd())).rows_chirho.slice(0, 2);
		try {
			for (const jobChirho of jobsChirho) {
				const lessonChirho =
					jobChirho.language_chirho === 'he'
						? proverbsChapterChirho.verses_chirho[0]
						: johnChapterChirho.verses_chirho[0];
				const bookChirho = jobChirho.language_chirho === 'he' ? 'Prov' : 'John';
				const numberChirho = jobChirho.language_chirho === 'he' ? 26 : 1;
				const pathChirho = `/audio-chirho/${bookChirho === 'Prov' ? 'proverbs-chirho' : 'john-chirho'}/chapter-${String(numberChirho).padStart(2, '0')}-chirho.json`;
				for (const changedChirho of [false, true]) {
					vi.resetModules();
					const chapterTextChirho = JSON.stringify({
						schema_version_chirho: 1,
						book_id_chirho: bookChirho,
						chapter_chirho: numberChirho,
						clips_chirho: [
							{
								...jobChirho,
								recipe_id_chirho: undefined,
								ipa_chirho: undefined,
								synthesis_text_chirho: undefined,
								voice_name_chirho: 'Earlier',
								pronunciation_chirho: bookChirho === 'Prov' ? 'israeli_hebrew' : 'modern_greek',
								asset_path_chirho: `/audio-chirho/sha256-chirho/${'a'.repeat(64)}-chirho.mp3`,
								sha256_chirho: 'a'.repeat(64),
								bytes_chirho: 2000,
								duration_chirho: 2,
								review_chirho: 'audition'
							},
							{
								...jobChirho,
								recipe_id_chirho: changedChirho
									? 'unknown-recipe-chirho'
									: jobChirho.recipe_id_chirho,
								synthesis_text_chirho: changedChirho ? undefined : jobChirho.synthesis_text_chirho,
								ipa_chirho: changedChirho ? undefined : jobChirho.ipa_chirho,
								voice_name_chirho: 'Phrased',
								pronunciation_chirho: bookChirho === 'Prov' ? 'israeli_hebrew' : 'modern_greek',
								asset_path_chirho: `/audio-chirho/sha256-chirho/${'b'.repeat(64)}-chirho.mp3`,
								sha256_chirho: 'b'.repeat(64),
								bytes_chirho: 2000,
								duration_chirho: 2,
								review_chirho: 'audition'
							}
						]
					});
					const manifestTextChirho = JSON.stringify({
						schema_version_chirho: 1,
						books_chirho: {
							[bookChirho]: {
								chapters_chirho: [
									{
										number_chirho: numberChirho,
										path_chirho: pathChirho,
										sha256_chirho: sha256Chirho(chapterTextChirho)
									}
								]
							}
						}
					});
					vi.stubGlobal(
						'fetch',
						vi.fn(
							async (requestChirho: string) =>
								new Response(requestChirho === pathChirho ? chapterTextChirho : manifestTextChirho)
						)
					);
					const { recordingsForLessonChirho } =
						await import('../../../src/lib/reader-chirho/audio-chirho/recordings-chirho');
					const foundChirho = await recordingsForLessonChirho(lessonChirho);
					expect(foundChirho).toHaveLength(changedChirho ? 1 : 2);
					expect(foundChirho[0].voice_name_chirho).toBe(changedChirho ? 'Earlier' : 'Phrased');
				}
			}
		} finally {
			vi.unstubAllGlobals();
			vi.resetModules();
		}
	});
	it('withholds the listener-rejected bytes even when an old catalogue relabels them approved', async () => {
		const wordChirho = lessonChirho.tokens_chirho.find(
			(rowChirho) => rowChirho.id_chirho === '20wMm'
		)!;
		try {
			for (const hashChirho of ['a'.repeat(64), rejectedAudioChirho[0].sha256_chirho]) {
				vi.resetModules();
				const pathChirho = '/audio-chirho/proverbs-chirho/chapter-26-chirho.json';
				const chapterTextChirho = JSON.stringify({
					schema_version_chirho: 1,
					book_id_chirho: 'Prov',
					chapter_chirho: 26,
					clips_chirho: [
						{
							lesson_id_chirho: lessonChirho.id_chirho,
							token_id_chirho: wordChirho.id_chirho,
							text_chirho: wordChirho.text_chirho,
							canonical_sha256_chirho: sha256Chirho(lessonChirho.canonical_text_chirho),
							language_chirho: 'he',
							pronunciation_chirho: 'israeli_hebrew',
							voice_name_chirho: 'Test voice',
							asset_path_chirho: `/audio-chirho/sha256-chirho/${hashChirho}-chirho.mp3`,
							sha256_chirho: hashChirho,
							bytes_chirho: 17597,
							duration_chirho: 1,
							review_chirho: 'approved'
						}
					]
				});
				const manifestTextChirho = JSON.stringify({
					schema_version_chirho: 1,
					books_chirho: {
						Prov: {
							chapters_chirho: [
								{
									number_chirho: 26,
									path_chirho: pathChirho,
									sha256_chirho: sha256Chirho(chapterTextChirho)
								}
							]
						}
					}
				});
				vi.stubGlobal(
					'fetch',
					vi.fn(
						async (requestChirho: string) =>
							new Response(requestChirho === pathChirho ? chapterTextChirho : manifestTextChirho)
					)
				);
				const { recordingsForLessonChirho } =
					await import('../../../src/lib/reader-chirho/audio-chirho/recordings-chirho');
				expect(await recordingsForLessonChirho(lessonChirho)).toHaveLength(
					hashChirho === rejectedAudioChirho[0].sha256_chirho ? 0 : 1
				);
			}
		} finally {
			vi.unstubAllGlobals();
			vi.resetModules();
		}
	});
	it('keeps original text distinct from provider phonemes and retains the combined budget', async () => {
		const jobsChirho = await ipaJobsChirho(process.cwd());
		expect(jobsChirho).toHaveLength(4);
		expect(reserveChirho(jobsChirho, [], 168)).toBe(99);
		expect(() => reserveChirho(jobsChirho, [], 202)).toThrow(/budget/);
		expect(() => reserveChirho(jobsChirho, [], -1)).toThrow();
		const wordChirho = jobsChirho.find((rowChirho) => rowChirho.id_chirho.includes('naveh'))!;
		expect(wordChirho.text_chirho).toBe('נָאוֶ֖ה');
		expect(wordChirho.synthesis_text_chirho).toContain('naˈve');
		expect(cacheKeyChirho(wordChirho)).not.toBe(
			cacheKeyChirho({ ...wordChirho, synthesis_text_chirho: undefined })
		);
		expect(() =>
			reserveChirho(
				jobsChirho,
				[
					{
						id_chirho: wordChirho.id_chirho,
						key_chirho: cacheKeyChirho(wordChirho),
						reserved_credits_chirho: [...wordChirho.synthesis_text_chirho!].length,
						state_chirho: 'requested',
						voice_id_chirho: 'l7Q9rbdCC6j3J5dNlOOg',
						voice_name_chirho: 'Itamar - Israeli Hebrew Narrator'
					}
				],
				168
			)
		).toThrow(/reconcile/);
	});
	it('withholds annotations and whole-verse synthesis on changed source or qere', () => {
		const wordChirho = lessonChirho.tokens_chirho.find(
			(rowChirho) => rowChirho.lemma_id_chirho === 'H5000'
		)!;
		expect(ipaNoteChirho(wordChirho)?.surprising_chirho).toBe(true);
		for (const changedChirho of [
			{ ...wordChirho, text_chirho: 'נָאָה' },
			{ ...wordChirho, lemma_id_chirho: 'H1' },
			{ ...wordChirho, lemma_augment_chirho: 'a' },
			{ ...wordChirho, raw_morphology_chirho: 'HVqp3ms' },
			{ ...wordChirho, qere_chirho: [{ text_chirho: wordChirho.text_chirho }] }
		])
			expect(ipaNoteChirho(changedChirho)).toBeNull();
		expect(ipaForRecordingChirho(lessonChirho, null)).toContain('naˈve');
		expect(
			ipaForRecordingChirho(
				{
					...lessonChirho,
					canonical_text_chirho: lessonChirho.canonical_text_chirho.normalize('NFC')
				},
				null
			)
		).toBeNull();
		expect(
			ipaForRecordingChirho(
				{ ...lessonChirho, tokens_chirho: lessonChirho.tokens_chirho.slice(1) },
				null
			)
		).toBeNull();
		expect(
			ipaForRecordingChirho({ ...lessonChirho, id_chirho: 'Prov.26.2' }, wordChirho.id_chirho)
		).toBeNull();
	});
	it('distinguishes the checked qamats examples and leaves unprepared words without guessed IPA', () => {
		const verseChirho = chapterChirho.verses_chirho.find(
			(rowChirho) => rowChirho.id_chirho === 'Prov.1.13'
		)!;
		const kolChirho = verseChirho.tokens_chirho[0];
		expect(ipaNoteChirho(kolChirho)?.ipa_chirho).toBe('kol');
		expect(ipaForRecordingChirho(verseChirho, null)).toBeNull();
		expect(ipaNoteChirho(verseChirho.tokens_chirho[1])).toBeNull();
		expect(
			ipaNoteChirho(
				lessonChirho.tokens_chirho.find((rowChirho) => rowChirho.lemma_id_chirho === 'H3519')!
			)?.ipa_chirho
		).toBe('kaˈvod');
	});
});
