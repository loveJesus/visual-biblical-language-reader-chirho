// For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life. — John 3:16 (KJV)
import { afterEach as afterEachChirho, expect as expectChirho, it as itChirho, vi } from 'vitest';
import { readFile as readFileChirho } from 'node:fs/promises';
import { createHash as createHashChirho } from 'node:crypto';
import oldChirho from '../../../src/lib/domain-chirho/pronunciation-chirho/hebrew-chirho/profile-readings-chirho/profiles-chirho.json';
import nextChirho from '../../../src/lib/domain-chirho/pronunciation-chirho/hebrew-chirho/profile-readings-chirho/continuation-01-chirho.json';
import {
	productionWordRecipeChirho,
	HEBREW_WORD_RECIPE_CHIRHO
} from '../../../src/lib/domain-chirho/pronunciation-chirho/production-recipe-chirho';
import { readingMatchesChirho } from '../../../src/lib/domain-chirho/pronunciation-chirho/hebrew-chirho/reading-continuation-chirho';
import type {
	ProfileReadingChirho,
	ProfileVerseChirho
} from '../../../src/lib/domain-chirho/pronunciation-chirho/hebrew-chirho/profile-readings-chirho';
type ApiChirho =
	typeof import('../../../src/lib/domain-chirho/pronunciation-chirho/hebrew-chirho/profile-readings-chirho');
async function apiChirho(): Promise<ApiChirho> {
	return process.env.PROFILE_TEST_MODULE_CHIRHO
		? ((await import(process.env.PROFILE_TEST_MODULE_CHIRHO)) as ApiChirho)
		: await import('../../../src/lib/domain-chirho/pronunciation-chirho/hebrew-chirho/profile-readings-chirho');
}
const initialApiChirho = await apiChirho();
const profilesChirho = nextChirho.profiles_chirho as unknown as ProfileReadingChirho[];
const hashChirho = (bytesChirho: string | Uint8Array) =>
	createHashChirho('sha256').update(bytesChirho).digest('hex');
async function sourceChirho(
	profileChirho: Pick<
		ProfileReadingChirho,
		'content_path_chirho' | 'content_sha256_chirho' | 'lesson_id_chirho'
	>
) {
	const bytesChirho = await readFileChirho('static' + profileChirho.content_path_chirho);
	expectChirho(hashChirho(bytesChirho)).toBe(profileChirho.content_sha256_chirho);
	return (JSON.parse(bytesChirho.toString()).verses_chirho as ProfileVerseChirho[]).find(
		(verseChirho) => verseChirho.id_chirho === profileChirho.lesson_id_chirho
	)!;
}
const occurrenceChirho = (profileChirho: ProfileReadingChirho) => ({
	token_id_chirho: profileChirho.token_id_chirho,
	text_chirho: profileChirho.spoken_text_chirho,
	profile_id_chirho: profileChirho.id_chirho,
	canonical_sha256_chirho: profileChirho.canonical_sha256_chirho
});
const inputChirho = (profileChirho: ProfileReadingChirho) => ({
	source_context_chirho: 'profile_chirho',
	language_chirho: 'he',
	recipe_id_chirho: HEBREW_WORD_RECIPE_CHIRHO,
	...productionWordRecipeChirho(
		profileChirho.spoken_text_chirho,
		HEBREW_WORD_RECIPE_CHIRHO,
		profileChirho.ipa_chirho
	)
});
afterEachChirho(() => {
	vi.doUnmock(
		'../../../src/lib/domain-chirho/pronunciation-chirho/hebrew-chirho/profile-readings-chirho/continuation-01-chirho.json'
	);
	vi.resetModules();
});
itChirho('preserves exact old data bytes and all old returned profile values', async () => {
	expectChirho(
		hashChirho(
			await readFileChirho(
				'src/lib/domain-chirho/pronunciation-chirho/hebrew-chirho/profile-readings-chirho/profiles-chirho.json'
			)
		)
	).toBe('61d5dfe0db76d127063a6ac2260b03d1510e738bc17568139bbc3e034c19bd42');
	for (const profileChirho of oldChirho.profiles_chirho as ProfileReadingChirho[]) {
		const verseChirho = await sourceChirho(profileChirho);
		expectChirho(
			JSON.stringify(
				initialApiChirho.profileReadingChirho(verseChirho, profileChirho.token_id_chirho)
			)
		).toBe(JSON.stringify(profileChirho));
	}
});
itChirho(
	'accepts all 277 real source bindings and verifies actual directly accented evidence chapters',
	async () => {
		const idsChirho = new Set<string>();
		for (const profileChirho of profilesChirho) {
			const verseChirho = await sourceChirho(profileChirho),
				resolvedChirho = initialApiChirho.profileReadingChirho(
					verseChirho,
					profileChirho.token_id_chirho
				)!;
			expectChirho(resolvedChirho).not.toBeNull();
			expectChirho(resolvedChirho.ipa_chirho).toBe(profileChirho.ipa_chirho);
			expectChirho(
				initialApiChirho.verifyProfileRecordingChirho(
					verseChirho,
					occurrenceChirho(profileChirho),
					inputChirho(profileChirho)
				)
			).toBe(resolvedChirho);
			idsChirho.add(profileChirho.token_id_chirho);
		}
		for (const evidenceChirho of nextChirho.stress_evidence_chirho) {
			const verseChirho = await sourceChirho(evidenceChirho),
				actualChirho = verseChirho.tokens_chirho.find(
					(tokenChirho) => tokenChirho.id_chirho === evidenceChirho.token_id_chirho
				)!;
			expectChirho(verseChirho.canonical_text_chirho).toBe(evidenceChirho.canonical_text_chirho);
			expectChirho(readingMatchesChirho(actualChirho, evidenceChirho.source_token_chirho)).toBe(
				true
			);
		}
		expectChirho(idsChirho.size).toBe(277);
	}
);
itChirho(
	'rejects altered Yetiv and doubled helper marks at their exact source positions',
	async () => {
		for (const kindChirho of [
			'yetiv_initial_chirho',
			'doubled_telisha_qetanah_chirho',
			'doubled_telisha_gedolah_chirho'
		]) {
			const profileChirho = profilesChirho.find(
					(profileChirho) => profileChirho.profile_kind_chirho === kindChirho
				)!,
				verseChirho = structuredClone(await sourceChirho(profileChirho)),
				tokenChirho = verseChirho.tokens_chirho.find(
					(tokenChirho) => tokenChirho.id_chirho === profileChirho.token_id_chirho
				)!;
			tokenChirho.text_chirho = tokenChirho.text_chirho.replace(/[\u059a\u05a9\u05a0]/u, '');
			expectChirho(
				initialApiChirho.profileReadingChirho(verseChirho, profileChirho.token_id_chirho)
			).toBeNull();
			expectChirho(() =>
				initialApiChirho.verifyProfileRecordingChirho(
					verseChirho,
					occurrenceChirho(profileChirho),
					inputChirho(profileChirho)
				)
			).toThrow();
		}
	}
);
itChirho(
	'derives finite accent stress from actual marks rather than a changed frozen integer',
	async () => {
		for (const kindChirho of [
			'yetiv_initial_chirho',
			'doubled_telisha_qetanah_chirho',
			'doubled_telisha_gedolah_chirho'
		]) {
			const dataChirho = JSON.parse(JSON.stringify(nextChirho)),
				rowChirho = dataChirho.profiles_chirho.find(
					(rowChirho: ProfileReadingChirho) => rowChirho.profile_kind_chirho === kindChirho
				),
				profileChirho = profilesChirho.find(
					(profileChirho) => profileChirho.token_id_chirho === rowChirho.token_id_chirho
				)!;
			rowChirho.stress_index_chirho++;
			vi.resetModules();
			vi.doMock(
				'../../../src/lib/domain-chirho/pronunciation-chirho/hebrew-chirho/profile-readings-chirho/continuation-01-chirho.json',
				() => ({ default: dataChirho })
			);
			const changedApiChirho = await apiChirho();
			expectChirho(
				changedApiChirho.profileReadingChirho(
					await sourceChirho(profileChirho),
					profileChirho.token_id_chirho
				)
			).toBeNull();
		}
	}
);
itChirho('does not fold away meteg or alter recursive qere identities', async () => {
	const candidatesChirho = [
			...profilesChirho,
			...(oldChirho.profiles_chirho as ProfileReadingChirho[])
		],
		withMetegChirho = candidatesChirho.find((profileChirho) =>
			profileChirho.source_token_chirho.text_chirho.includes('\u05bd')
		)!,
		withQereChirho = candidatesChirho.find(
			(profileChirho) => profileChirho.source_token_chirho.qere_chirho?.length
		)!;
	const metegVerseChirho = structuredClone(await sourceChirho(withMetegChirho));
	metegVerseChirho.tokens_chirho.find(
		(tokenChirho) => tokenChirho.id_chirho === withMetegChirho.token_id_chirho
	)!.text_chirho = withMetegChirho.text_chirho.replace('\u05bd', '');
	expectChirho(
		initialApiChirho.profileReadingChirho(metegVerseChirho, withMetegChirho.token_id_chirho)
	).toBeNull();
	const qereVerseChirho = structuredClone(await sourceChirho(withQereChirho));
	qereVerseChirho.tokens_chirho.find(
		(tokenChirho) => tokenChirho.id_chirho === withQereChirho.token_id_chirho
	)!.qere_chirho![0].lemma_id_chirho = 'changed-chirho';
	expectChirho(
		initialApiChirho.profileReadingChirho(qereVerseChirho, withQereChirho.token_id_chirho)
	).toBeNull();
});
itChirho('refuses a different source lemma or phonetic profile in parallel evidence', async () => {
	const dataChirho = JSON.parse(JSON.stringify(nextChirho)),
		rowChirho = dataChirho.profiles_chirho.find(
			(rowChirho: ProfileReadingChirho) =>
				rowChirho.profile_kind_chirho === 'exact_stress_parallel_chirho'
		),
		profileChirho = profilesChirho.find(
			(profileChirho) => profileChirho.token_id_chirho === rowChirho.token_id_chirho
		)!;
	dataChirho.stress_evidence_chirho.find(
		(evidenceChirho: { id_chirho: string }) =>
			evidenceChirho.id_chirho === rowChirho.stress_evidence_id_chirho
	).source_token_chirho.lemma_id_chirho = 'different-chirho';
	vi.resetModules();
	vi.doMock(
		'../../../src/lib/domain-chirho/pronunciation-chirho/hebrew-chirho/profile-readings-chirho/continuation-01-chirho.json',
		() => ({ default: dataChirho })
	);
	expectChirho(
		(await apiChirho()).profileReadingChirho(
			await sourceChirho(profileChirho),
			profileChirho.token_id_chirho
		)
	).toBeNull();
});
itChirho(
	'requires the independent source evidence for a maqqef tail even when whole-group parsing succeeds',
	async () => {
		const dataChirho = JSON.parse(JSON.stringify(nextChirho)),
			rowChirho = dataChirho.profiles_chirho.find(
				(rowChirho: ProfileReadingChirho) =>
					rowChirho.profile_kind_chirho === 'checked_tail_maqqef_chirho'
			),
			profileChirho = profilesChirho.find(
				(profileChirho) => profileChirho.token_id_chirho === rowChirho.token_id_chirho
			)!;
		dataChirho.stress_evidence_chirho = dataChirho.stress_evidence_chirho.filter(
			(evidenceChirho: { id_chirho: string }) =>
				evidenceChirho.id_chirho !== rowChirho.tail_stress_evidence_id_chirho
		);
		vi.resetModules();
		vi.doMock(
			'../../../src/lib/domain-chirho/pronunciation-chirho/hebrew-chirho/profile-readings-chirho/continuation-01-chirho.json',
			() => ({ default: dataChirho })
		);
		const changedApiChirho = await apiChirho();
		expectChirho(changedApiChirho.hasProfileReadingChirho(profileChirho.token_id_chirho)).toBe(
			true
		);
		expectChirho(
			changedApiChirho.profileReadingChirho(
				await sourceChirho(profileChirho),
				profileChirho.token_id_chirho
			)
		).toBeNull();
	}
);
itChirho('refuses deleted profile markers, ids, text and IPA without legacy fallback', async () => {
	const profileChirho = profilesChirho[0],
		verseChirho = await sourceChirho(profileChirho);
	for (const valueChirho of [
		{ ...occurrenceChirho(profileChirho), profile_id_chirho: undefined },
		{ ...occurrenceChirho(profileChirho), text_chirho: 'wrong-chirho' }
	])
		expectChirho(() =>
			initialApiChirho.verifyProfileRecordingChirho(
				verseChirho,
				valueChirho,
				inputChirho(profileChirho)
			)
		).toThrow();
	for (const valueChirho of [
		{ ...inputChirho(profileChirho), source_context_chirho: undefined },
		{ ...inputChirho(profileChirho), ipa_chirho: undefined },
		{ ...inputChirho(profileChirho), synthesis_text_chirho: 'wrong-chirho' }
	])
		expectChirho(() =>
			initialApiChirho.verifyProfileRecordingChirho(
				verseChirho,
				occurrenceChirho(profileChirho),
				valueChirho
			)
		).toThrow();
});
itChirho(
	'keeps unapproved silent-shewa Yetiv and every named source caution outside the finite map',
	async () => {
		const chapterChirho = JSON.parse(
				await readFileChirho(
					'static/content-chirho/leviticus-chirho/chapter-23-chirho.json',
					'utf8'
				)
			),
			verseChirho = chapterChirho.verses_chirho.find(
				(verseChirho: ProfileVerseChirho) => verseChirho.id_chirho === 'Lev.23.17'
			),
			tokenChirho = verseChirho.tokens_chirho.find(
				(tokenChirho: { text_chirho: string }) =>
					tokenChirho.text_chirho.includes('\u059a') &&
					tokenChirho.text_chirho.replace(/[^\u05d0-\u05ea]/gu, '') === 'שתים'
			);
		expectChirho(tokenChirho).toBeDefined();
		expectChirho(initialApiChirho.hasProfileReadingChirho(tokenChirho.id_chirho)).toBe(false);
		expectChirho(
			initialApiChirho.profileReadingChirho(verseChirho, tokenChirho.id_chirho)
		).toBeNull();
		for (const tokenIdChirho of ['24Gyf', '13R3h', '13Mge', '192Bq', '18NKo'])
			expectChirho(initialApiChirho.hasProfileReadingChirho(tokenIdChirho)).toBe(false);
	}
);
