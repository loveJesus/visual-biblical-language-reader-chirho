// For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life. — John 3:16 (KJV)
import { afterEach as afterEachChirho, expect as expectChirho, it as itChirho, vi } from 'vitest';
import { readFile as readFileChirho } from 'node:fs/promises';
import { createHash as createHashChirho } from 'node:crypto';
import dataChirho from '../../../src/lib/domain-chirho/pronunciation-chirho/hebrew-chirho/profile-readings-chirho/profiles-chirho.json';
import {
	profileReadingChirho,
	hasProfileReadingChirho,
	verifyProfileRecordingChirho,
	type ProfileReadingChirho,
	type ProfileVerseChirho
} from '../../../src/lib/domain-chirho/pronunciation-chirho/hebrew-chirho/profile-readings-chirho';
import {
	HEBREW_WORD_RECIPE_CHIRHO,
	productionWordRecipeChirho
} from '../../../src/lib/domain-chirho/pronunciation-chirho/production-recipe-chirho';
import { deriveMaqqefContextChirho } from '../../../scripts-chirho/audio-chirho/production-chirho/maqqef-chirho/context_chirho';

const profilesChirho = dataChirho.profiles_chirho as ProfileReadingChirho[];
const shaChirho = (bytesChirho: Uint8Array | string) =>
	createHashChirho('sha256').update(bytesChirho).digest('hex');
async function sourceChirho(profileChirho: ProfileReadingChirho) {
	const bytesChirho = await readFileChirho('static' + profileChirho.content_path_chirho);
	expectChirho(shaChirho(bytesChirho)).toBe(profileChirho.content_sha256_chirho);
	const chapterChirho = JSON.parse(bytesChirho.toString()) as {
		verses_chirho: ProfileVerseChirho[];
	};
	const verseChirho = chapterChirho.verses_chirho.find(
		(verseChirho) => verseChirho.id_chirho === profileChirho.lesson_id_chirho
	)!;
	return verseChirho;
}
function inputChirho(profileChirho: ProfileReadingChirho) {
	return {
		source_context_chirho: 'profile_chirho',
		language_chirho: 'he',
		recipe_id_chirho: HEBREW_WORD_RECIPE_CHIRHO,
		canonical_sha256_chirho: profileChirho.canonical_sha256_chirho,
		...productionWordRecipeChirho(
			profileChirho.spoken_text_chirho,
			HEBREW_WORD_RECIPE_CHIRHO,
			profileChirho.ipa_chirho
		)
	};
}
function occurrenceChirho(profileChirho: ProfileReadingChirho) {
	return {
		token_id_chirho: profileChirho.token_id_chirho,
		text_chirho: profileChirho.spoken_text_chirho,
		profile_id_chirho: profileChirho.id_chirho,
		lesson_id_chirho: profileChirho.lesson_id_chirho,
		canonical_sha256_chirho: profileChirho.canonical_sha256_chirho,
		content_path_chirho: profileChirho.content_path_chirho,
		content_sha256_chirho: profileChirho.content_sha256_chirho
	};
}
afterEachChirho(() => {
	vi.doUnmock(
		'../../../src/lib/domain-chirho/pronunciation-chirho/hebrew-chirho/profile-readings-chirho/profiles-chirho.json'
	);
	vi.resetModules();
});

itChirho(
	'accepts all finite profiles against their real exact chapter and recursive reading identities',
	async () => {
		const seenChirho = new Set<string>(),
			ipaChirho = new Set<string>();
		for (const profileChirho of profilesChirho) {
			const verseChirho = await sourceChirho(profileChirho);
			expectChirho(shaChirho(verseChirho.canonical_text_chirho)).toBe(
				profileChirho.canonical_sha256_chirho
			);
			expectChirho(hasProfileReadingChirho(profileChirho.token_id_chirho)).toBe(true);
			expectChirho(profileReadingChirho(verseChirho, profileChirho.token_id_chirho)).toEqual(
				profileChirho
			);
			expectChirho(
				verifyProfileRecordingChirho(
					verseChirho,
					occurrenceChirho(profileChirho),
					inputChirho(profileChirho)
				)
			).toEqual(profileChirho);
			seenChirho.add(profileChirho.token_id_chirho);
			ipaChirho.add(profileChirho.ipa_chirho);
		}
		expectChirho(seenChirho.size).toBe(167);
		expectChirho(ipaChirho.size).toBe(48);
	}
);
itChirho(
	'rejects a divine member changed from H3068 Adonai to H3069 Elohim without raw-name fallback',
	async () => {
		const profileChirho = profilesChirho.find(
				(rowChirho) => rowChirho.profile_kind_chirho === 'divine_maqqef_chirho'
			)!,
			verseChirho = structuredClone(await sourceChirho(profileChirho));
		const memberChirho = verseChirho.tokens_chirho.find(
			(tokenChirho) =>
				tokenChirho.id_chirho === profileChirho.members_chirho.at(-1)!.token_chirho.id_chirho
		)!;
		memberChirho.lemma_id_chirho = 'H3069';
		expectChirho(profileReadingChirho(verseChirho, profileChirho.token_id_chirho)).toBeNull();
		expectChirho(() =>
			verifyProfileRecordingChirho(
				verseChirho,
				occurrenceChirho(profileChirho),
				inputChirho(profileChirho)
			)
		).toThrow();
	}
);
itChirho('rejects changed maqqef members, spans, order and canonical text', async () => {
	const profileChirho = profilesChirho.find(
		(rowChirho) => rowChirho.profile_kind_chirho === 'divine_maqqef_chirho'
	)!;
	const originalChirho = await sourceChirho(profileChirho);
	const variantsChirho = Array.from({ length: 4 }, () => ({
		...structuredClone(originalChirho),
		tokens_chirho: structuredClone([...originalChirho.tokens_chirho])
	}));
	variantsChirho[0].tokens_chirho.find(
		(tokenChirho) => tokenChirho.id_chirho === profileChirho.token_id_chirho
	)!.raw_morphology_chirho = 'HNp';
	variantsChirho[1].tokens_chirho.find(
		(tokenChirho) => tokenChirho.id_chirho === profileChirho.token_id_chirho
	)!.end_chirho!++;
	const firstChirho = variantsChirho[2].tokens_chirho.findIndex(
		(tokenChirho) => tokenChirho.id_chirho === profileChirho.token_id_chirho
	);
	[variantsChirho[2].tokens_chirho[firstChirho], variantsChirho[2].tokens_chirho[firstChirho + 1]] =
		[
			variantsChirho[2].tokens_chirho[firstChirho + 1],
			variantsChirho[2].tokens_chirho[firstChirho]
		];
	variantsChirho[3].canonical_text_chirho += ' ';
	for (const verseChirho of variantsChirho)
		expectChirho(profileReadingChirho(verseChirho, profileChirho.token_id_chirho)).toBeNull();
});
itChirho(
	'retains differing ketiv/qere lemma identities and refuses a changed or deleted qere child',
	async () => {
		const profileChirho = profilesChirho.find(
			(rowChirho) =>
				rowChirho.profile_kind_chirho === 'qere_maqqef_chirho' &&
				rowChirho.source_token_chirho.qere_chirho?.length &&
				rowChirho.source_token_chirho.qere_chirho[0].lemma_id_chirho !==
					rowChirho.source_token_chirho.lemma_id_chirho
		)!;
		const originalChirho = await sourceChirho(profileChirho);
		const changedChirho = structuredClone(originalChirho),
			tokenChirho = changedChirho.tokens_chirho.find(
				(rowChirho) => rowChirho.id_chirho === profileChirho.token_id_chirho
			)!;
		tokenChirho.qere_chirho![0].lemma_id_chirho = tokenChirho.lemma_id_chirho;
		expectChirho(profileReadingChirho(changedChirho, profileChirho.token_id_chirho)).toBeNull();
		const deletedChirho = structuredClone(originalChirho);
		delete deletedChirho.tokens_chirho.find(
			(rowChirho) => rowChirho.id_chirho === profileChirho.token_id_chirho
		)!.qere_chirho;
		expectChirho(profileReadingChirho(deletedChirho, profileChirho.token_id_chirho)).toBeNull();
	}
);
itChirho(
	'refuses missing/altered profile proof, spoken text, IPA, recipe and synthesis input',
	async () => {
		const profileChirho = profilesChirho[0],
			verseChirho = await sourceChirho(profileChirho),
			validOccurrenceChirho = occurrenceChirho(profileChirho),
			validInputChirho = inputChirho(profileChirho);
		for (const overrideChirho of [
			{ profile_id_chirho: undefined },
			{ profile_id_chirho: 'profile-unknown-chirho' },
			{ text_chirho: 'different' },
			{ content_sha256_chirho: '0'.repeat(64) }
		])
			expectChirho(() =>
				verifyProfileRecordingChirho(
					verseChirho,
					{ ...validOccurrenceChirho, ...overrideChirho },
					validInputChirho
				)
			).toThrow();
		for (const overrideChirho of [
			{ source_context_chirho: undefined },
			{ source_context_chirho: 'maqqef_chirho' },
			{ ipa_chirho: undefined },
			{ ipa_chirho: 'wrong' },
			{ recipe_id_chirho: undefined },
			{ synthesis_text_chirho: 'raw Hebrew' },
			{ language_chirho: 'el' }
		])
			expectChirho(() =>
				verifyProfileRecordingChirho(verseChirho, validOccurrenceChirho, {
					...validInputChirho,
					...overrideChirho
				})
			).toThrow();
	}
);
itChirho(
	'preserves both generic maqqef exclusions rather than admitting profile contexts generically',
	async () => {
		for (const kindChirho of ['divine_maqqef_chirho', 'qere_maqqef_chirho']) {
			const profileChirho = profilesChirho.find(
					(rowChirho) => rowChirho.profile_kind_chirho === kindChirho
				)!,
				verseChirho = await sourceChirho(profileChirho);
			expectChirho(() =>
				deriveMaqqefContextChirho(
					verseChirho as Parameters<typeof deriveMaqqefContextChirho>[0],
					profileChirho.token_id_chirho
				)
			).toThrow();
		}
	}
);
itChirho('keeps the independent known-token guard when a finite profile is deleted', async () => {
	const profileChirho = profilesChirho[0],
		verseChirho = await sourceChirho(profileChirho);
	vi.resetModules();
	vi.doMock(
		'../../../src/lib/domain-chirho/pronunciation-chirho/hebrew-chirho/profile-readings-chirho/profiles-chirho.json',
		() => ({
			default: {
				token_ids_chirho: dataChirho.token_ids_chirho,
				profiles_chirho: dataChirho.profiles_chirho.filter(
					(rowChirho) => rowChirho.token_id_chirho !== profileChirho.token_id_chirho
				)
			}
		})
	);
	const moduleChirho =
		await import('../../../src/lib/domain-chirho/pronunciation-chirho/hebrew-chirho/profile-readings-chirho');
	expectChirho(moduleChirho.hasProfileReadingChirho(profileChirho.token_id_chirho)).toBe(true);
	expectChirho(
		moduleChirho.profileReadingChirho(verseChirho, profileChirho.token_id_chirho)
	).toBeNull();
	expectChirho(() =>
		moduleChirho.verifyProfileRecordingChirho(
			verseChirho,
			occurrenceChirho(profileChirho),
			inputChirho(profileChirho)
		)
	).toThrow();
});
itChirho(
	'refuses a deleted compiled profile id or IPA and exposes no mutable profile data',
	async () => {
		const profileChirho = profilesChirho[0],
			verseChirho = await sourceChirho(profileChirho),
			resolvedChirho = profileReadingChirho(verseChirho, profileChirho.token_id_chirho)!;
		expectChirho(Object.isFrozen(resolvedChirho)).toBe(true);
		expectChirho(Object.isFrozen(resolvedChirho.source_token_chirho)).toBe(true);
		for (const fieldChirho of ['id_chirho', 'ipa_chirho']) {
			const changedChirho = JSON.parse(JSON.stringify(dataChirho));
			delete changedChirho.profiles_chirho[0][fieldChirho];
			vi.resetModules();
			vi.doMock(
				'../../../src/lib/domain-chirho/pronunciation-chirho/hebrew-chirho/profile-readings-chirho/profiles-chirho.json',
				() => ({ default: changedChirho })
			);
			const moduleChirho =
				await import('../../../src/lib/domain-chirho/pronunciation-chirho/hebrew-chirho/profile-readings-chirho');
			expectChirho(moduleChirho.hasProfileReadingChirho(profileChirho.token_id_chirho)).toBe(true);
			expectChirho(
				moduleChirho.profileReadingChirho(verseChirho, profileChirho.token_id_chirho)
			).toBeNull();
			expectChirho(() =>
				moduleChirho.verifyProfileRecordingChirho(
					verseChirho,
					{ ...occurrenceChirho(profileChirho), profile_id_chirho: undefined },
					inputChirho(profileChirho)
				)
			).toThrow();
		}
	}
);
itChirho(
	'never transfers a finite parallel override to another source or changed morphology',
	async () => {
		const profileChirho = profilesChirho.find(
				(rowChirho) => rowChirho.profile_kind_chirho === 'exact_stress_parallel_chirho'
			)!,
			verseChirho = structuredClone(await sourceChirho(profileChirho));
		verseChirho.tokens_chirho.find(
			(tokenChirho) => tokenChirho.id_chirho === profileChirho.token_id_chirho
		)!.lemma_augment_chirho = 'different';
		expectChirho(profileReadingChirho(verseChirho, profileChirho.token_id_chirho)).toBeNull();
		expectChirho(profileReadingChirho(verseChirho, 'unregistered-chirho')).toBeNull();
		expectChirho(hasProfileReadingChirho('unregistered-chirho')).toBe(false);
	}
);
