// For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life. — John 3:16 (KJV)
import { expect, it } from 'vitest';
import { readFile as readFileChirho } from 'node:fs/promises';
import { createHash as createHashChirho } from 'node:crypto';
import {
	wordPhoneticsChirho,
	qerePhoneticsChirho
} from '../../../src/lib/domain-chirho/pronunciation-chirho/hebrew-chirho/word-phonetics-chirho';
import { ipaNoteChirho } from '../../../src/lib/domain-chirho/pronunciation-chirho/ipa-trial-chirho';
import reviewsChirho from '../../../src/lib/domain-chirho/pronunciation-chirho/hebrew-chirho/reading-reviews-chirho.json';
import { spokenWordChirho } from '../../../src/lib/domain-chirho/pronunciation-chirho';
import type { LessonChirho } from '../../../src/lib/domain-chirho/lesson-chirho';

it('reads exact silent-letter spellings without deleting or repointing the source', () => {
	for (const [sourceChirho, expectedChirho] of [
		['יִשָּׂשכָֽר׃', 'jisaˈxaʁ'],
		['וְיִשָּׂשכָ֖ר', 'vejisaˈxaʁ'],
		['לְיִ֨שָּׂשכָ֔ר', 'lejisaˈxaʁ'],
		['בֵּלְאשַׁצַּ֣ר', 'belʃaˈt͡saʁ']
	]) {
		const resultChirho = wordPhoneticsChirho(sourceChirho);
		expect(resultChirho.source_chirho).toBe(sourceChirho);
		expect(resultChirho.ipa_chirho).toBe(expectedChirho);
	}
	expect(() => wordPhoneticsChirho('יִשָּׂשכָר')).toThrow(/checked stress/);
	expect(() => wordPhoneticsChirho('יִשָּׁשכָ֖ר')).toThrow(/nucleus/);
});

it('retains meteg, vocal sheva and final silluq when a vowel letter was stranded', () => {
	for (const [sourceChirho, expectedChirho] of [
		['וֶאֱלִֽיפְלֵ֗הוּ', 'veʔelifeˈlehu'],
		['בְּסֽוֹדְיָ֑ה', 'besodeˈja'],
		['נְפִֽישְׁסִֽים׃', 'nefiʃeˈsim'],
		['כְּגִֽילְכֶ֔ם', 'keɡileˈxem']
	])
		expect(wordPhoneticsChirho(sourceChirho).ipa_chirho).toBe(expectedChirho);
	expect(wordPhoneticsChirho('מֶֽלֶךְ׃').ipa_chirho).toBe('ˈmelex');
	// Other stranded-mater families remain outside this source-reviewed repair.
	expect(() => wordPhoneticsChirho('בֵּֽינְךָ֙')).toThrow(/nucleus/);
});

it('uses zaqef after metiga only for the exact paired accent family', () => {
	expect(wordPhoneticsChirho('וְהַ֨מְּדָנִ֔ים').ipa_chirho).toBe('vehamedaˈnim');
	expect(wordPhoneticsChirho('הַ֨דָּאָ֔ה').ipa_chirho).toBe('hadaˈʔa');
	expect(() => wordPhoneticsChirho('וְהַ֨מְּדָנִ֔ים֖')).toThrow(/Conflicting/);
	expect(() => wordPhoneticsChirho('וְהַ֔מְּדָנִ֨ים')).toThrow(/Conflicting/);
});

it('requires each explicitly attached multiword qere to resolve independently', () => {
	for (const [sourceChirho, expectedChirho] of [
		['בָּ֣א גָ֑ד', 'ba ɡad'],
		['אֵ֥שׁ דָּ֖ת', 'ʔeʃ dat'],
		['יַשִּׁ֤י מָ֨וֶת', 'jaˈʃi ˈmavet'],
		['מֵימֵ֥י רַגְלֵיהֶ֖ם', 'meˈme ʁaɡleˈhem'],
		['מֵאֵ֖שׁ תַּ֣ם', 'meˈʔeʃ tam']
	])
		expect(qerePhoneticsChirho(sourceChirho).ipa_chirho).toBe(expectedChirho);
	expect(() => qerePhoneticsChirho('מימֵ֥י רַגְלֵיהֶ֖ם')).toThrow(/nucleus/);
	expect(() => qerePhoneticsChirho('מֶלֶךְ מֶ֥לֶךְ')).toThrow(/checked stress/);
	expect(() => wordPhoneticsChirho('בָּ֣א גָ֑ד')).toThrow(/one reading/);
	expect(() => qerePhoneticsChirho('בָּ֣א')).toThrow(/two to four/);
});

it('binds lexical stress reviews to their exact source tokens and pinned dictionary', async () => {
	const hashChirho = (bytesChirho: string | Buffer) =>
		createHashChirho('sha256').update(bytesChirho).digest('hex');
	const lexiconChirho = await readFileChirho(
		'data-chirho/sources-chirho/hebrew-lexicon-chirho/HebrewStrong.xml'
	);
	for (const reviewChirho of reviewsChirho.words_chirho) {
		const bytesChirho = await readFileChirho(
			'static' + reviewChirho.evidence_chirho.content_path_chirho
		);
		expect(hashChirho(bytesChirho)).toBe(reviewChirho.evidence_chirho.content_sha256_chirho);
		expect(hashChirho(lexiconChirho)).toBe(reviewChirho.evidence_chirho.lexicon_sha256_chirho);
		const verseChirho = (
			JSON.parse(bytesChirho.toString('utf8')).verses_chirho as LessonChirho[]
		).find((rowChirho) => rowChirho.id_chirho === reviewChirho.lesson_id_chirho)!;
		expect(hashChirho(verseChirho.canonical_text_chirho)).toBe(
			reviewChirho.evidence_chirho.canonical_sha256_chirho
		);
		const tokenChirho = verseChirho.tokens_chirho.find(
			(rowChirho) => rowChirho.id_chirho === reviewChirho.token_id_chirho
		)!;
		expect(spokenWordChirho(tokenChirho)).toBe(reviewChirho.text_chirho);
		expect(ipaNoteChirho(tokenChirho)?.ipa_chirho).toBe(reviewChirho.ipa_chirho);
		for (const changedChirho of [
			{ ...tokenChirho, text_chirho: tokenChirho.text_chirho + 'ה' },
			{ ...tokenChirho, lemma_id_chirho: 'H1' },
			{ ...tokenChirho, lemma_augment_chirho: 'changed-chirho' },
			{
				...tokenChirho,
				raw_morphology_chirho: 'HNcmsa' === tokenChirho.raw_morphology_chirho ? 'HNcfsa' : 'HNcmsa'
			},
			{ ...tokenChirho, qere_chirho: [{ text_chirho: tokenChirho.text_chirho }] }
		])
			expect(ipaNoteChirho(changedChirho)).toBeNull();
	}
	const nonfinalChirho = reviewsChirho.words_chirho.find(
		(rowChirho) => rowChirho.lemma_id_chirho === 'H7730'
	)!;
	expect(nonfinalChirho.ipa_chirho).toBe('ˈsovex');
	expect(() => wordPhoneticsChirho(nonfinalChirho.text_chirho)).toThrow(/checked stress/);
});
