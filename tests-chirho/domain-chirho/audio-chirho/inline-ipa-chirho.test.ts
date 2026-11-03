// For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life. — John 3:16 (KJV)
import { describe, expect, it } from 'vitest';
import { greekWordIpaChirho } from '../../../src/lib/domain-chirho/pronunciation-chirho/greek-ipa-chirho';
import renditionsChirho from '../../../src/lib/domain-chirho/pronunciation-chirho/greek-renditions-chirho.json';
import { wordPhoneticsChirho } from '../../../src/lib/domain-chirho/pronunciation-chirho/hebrew-chirho/word-phonetics-chirho';

describe('source-aware IPA reading guides', () => {
	it('retains the established Erasmian convention for the two existing recorded passages', () => {
		for (const verseChirho of renditionsChirho.verses_chirho)
			expect(
				verseChirho.tokens_chirho
					.map((tokenChirho) => greekWordIpaChirho(tokenChirho.text_chirho, 'erasmian'))
					.join(' ')
			).toBe(verseChirho.erasmian_ipa_chirho);
	});
	it('distinguishes modern vowels with and without requested rough breathing, without mutating the source', () => {
		const sourceChirho = 'Οὗτος';
		expect(greekWordIpaChirho(sourceChirho, 'modern')).toBe('ˈutos');
		expect(greekWordIpaChirho(sourceChirho, 'modern_aspirates')).toBe('ˈhutos');
		expect(greekWordIpaChirho(sourceChirho, 'erasmian')).toBe('ˈhuːtos');
		expect(sourceChirho).toBe('Οὗτος');
		expect(greekWordIpaChirho('ἀρχῇ', 'modern')).toBe('arˈçi');
		expect(greekWordIpaChirho('ὁ', 'modern_aspirates')).toBe('ho');
	});
	it('keeps diaeresis, accent, nasal clusters and voiced/voiceless vowel digraphs meaningful', () => {
		for (const [sourceChirho, ipaChirho] of [
			['αὐτός', 'afˈtos'],
			['εὐαγγέλιον', 'evaɲˈɟelion'],
			['ἄγγελος', 'ˈaɲɟelos'],
			['ἀΐδιος', 'aˈiðios'],
			['Λόγος', 'ˈloɣos']
		])
			expect(greekWordIpaChirho(sourceChirho, 'modern')).toBe(ipaChirho);
		expect(greekWordIpaChirho('ἀΐδιος'.normalize('NFD'), 'modern')).toBe('aˈiðios');
		expect(greekWordIpaChirho('unmapped', 'modern')).toBeNull();
	});
	it('reuses the production Hebrew stress and vowel analysis and withholds unsupported stress', () => {
		expect(wordPhoneticsChirho('נָאוֶ֖ה').ipa_chirho).toBe('naˈve');
		expect(wordPhoneticsChirho('כָּל־').ipa_chirho).toBe('kol');
		expect(() => wordPhoneticsChirho('מֶלֶךְ')).toThrow(/stress/);
	});
});
