// For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life. — John 3:16 (KJV)
// Workflow: local-reader-chirho.md. Offline draft analysis only; canonical text is never rewritten.
import { Text as TextChirho } from 'havarotjs';
import type { Syllable as SyllableChirho } from 'havarotjs/syllable';

const CONSONANTS_CHIRHO: Record<string, string> = {
	א: 'ʔ',
	ב: 'v',
	ג: 'ɡ',
	ד: 'd',
	ה: 'h',
	ו: 'v',
	ז: 'z',
	ח: 'x',
	ט: 't',
	י: 'j',
	כ: 'x',
	ך: 'x',
	ל: 'l',
	מ: 'm',
	ם: 'm',
	נ: 'n',
	ן: 'n',
	ס: 's',
	ע: 'ʔ',
	פ: 'f',
	ף: 'f',
	צ: 't͡s',
	ץ: 't͡s',
	ק: 'k',
	ר: 'ʁ',
	ש: 'ʃ',
	ת: 't'
};
const VOWELS_CHIRHO: Record<string, string> = {
	SHEVA: 'e',
	HATAF_SEGOL: 'e',
	HATAF_PATAH: 'a',
	HATAF_QAMATS: 'o',
	HIRIQ: 'i',
	TSERE: 'e',
	SEGOL: 'e',
	PATAH: 'a',
	QAMATS: 'a',
	QAMATS_QATAN: 'o',
	HOLAM: 'o',
	HOLAM_HASER: 'o',
	QUBUTS: 'u',
	SHUREQ: 'u'
};

function consonantsChirho(textChirho: string, codaChirho = false): string {
	const clustersChirho = textChirho.match(/[\u05d0-\u05ea][\u0591-\u05c7]*/gu) ?? [];
	return clustersChirho
		.map((clusterChirho) => {
			const letterChirho = clusterChirho[0];
			if (
				codaChirho &&
				(letterChirho === 'א' ||
					(letterChirho === 'ה' && !/[\u05b0-\u05bc\u05c7]/u.test(clusterChirho)))
			)
				return '';
			if (letterChirho === 'ש') return clusterChirho.includes('\u05c2') ? 's' : 'ʃ';
			if (clusterChirho.includes('\u05bc')) {
				if (letterChirho === 'ב') return 'b';
				if (letterChirho === 'כ' || letterChirho === 'ך') return 'k';
				if (letterChirho === 'פ' || letterChirho === 'ף') return 'p';
			}
			const resultChirho = CONSONANTS_CHIRHO[letterChirho];
			if (resultChirho === undefined) throw new Error('Unmapped Hebrew consonant');
			return resultChirho;
		})
		.join('');
}

function syllableChirho(valueChirho: SyllableChirho): string {
	const [onsetChirho, nucleusChirho, codaChirho] = valueChirho.structure();
	const namesChirho = valueChirho.vowelNames;
	// Patah under a final guttural is spoken before that consonant, not after it.
	const furtiveChirho = valueChirho.isFinal && /[חעה][\u0591-\u05c7]*\u05b7/u.test(codaChirho);
	const primaryNamesChirho = furtiveChirho
		? namesChirho.filter((nameChirho) => nameChirho !== 'PATAH')
		: namesChirho;
	if (primaryNamesChirho.length !== 1)
		throw new Error(`Unresolved syllable nucleus: ${valueChirho.text}`);
	const vowelChirho = VOWELS_CHIRHO[primaryNamesChirho[0]];
	if (!vowelChirho || !nucleusChirho) throw new Error('Unmapped Hebrew vowel');
	const onsetIpaChirho = consonantsChirho(onsetChirho);
	const codaIpaChirho = consonantsChirho(
		primaryNamesChirho[0] === 'QAMATS' && codaChirho.replace(/[\u0591-\u05c7]/gu, '') === 'יו'
			? codaChirho.replace(/י[\u0591-\u05c7]*/u, '')
			: codaChirho,
		true
	);
	return onsetIpaChirho + vowelChirho + (furtiveChirho ? 'a' : '') + codaIpaChirho;
}

export function hebrewPhoneticsChirho(sourceChirho: string, stressOverrideChirho?: number) {
	if (!sourceChirho || !/[\u05b0-\u05bc\u05c7]/u.test(sourceChirho))
		throw new Error('Unpointed or empty reading needs an explicit pronunciation review');
	// Havarot sequences an analysis copy. Retain sourceChirho verbatim as the binding identity.
	const analysisChirho = new TextChirho(sourceChirho, { strict: true, longVowels: false });
	const wordsChirho = analysisChirho.words.filter((wordChirho) => !wordChirho.isNotHebrew);
	const outputChirho = wordsChirho.map((wordChirho) => {
		if (wordChirho.hasDivineName) throw new Error('Divine-name reading needs an explicit profile');
		const syllablesChirho = wordChirho.syllables;
		if (!syllablesChirho.length) throw new Error('No Hebrew syllables found');
		const accentedChirho = syllablesChirho.filter((valueChirho) => valueChirho.isAccented);
		if (
			stressOverrideChirho !== undefined &&
			(wordsChirho.length !== 1 ||
				!Number.isInteger(stressOverrideChirho) ||
				stressOverrideChirho < 0 ||
				stressOverrideChirho >= syllablesChirho.length)
		)
			throw new Error('Invalid reviewed stress override');
		if (
			stressOverrideChirho === undefined &&
			(accentedChirho.length > 1 || (!wordChirho.isInConstruct && accentedChirho.length !== 1))
		)
			throw new Error(`Unresolved primary stress: ${wordChirho.original}`);
		const piecesChirho = syllablesChirho.map((valueChirho, indexChirho) => ({
			analysis_text_chirho: valueChirho.text,
			ipa_chirho: syllableChirho(valueChirho),
			stressed_chirho:
				!wordChirho.isInConstruct &&
				(stressOverrideChirho === undefined
					? valueChirho.isAccented
					: indexChirho === stressOverrideChirho),
			qamats_qatan_chirho: valueChirho.vowelNames.includes('QAMATS_QATAN')
		}));
		return {
			source_word_chirho: wordChirho.original,
			maqqef_linked_chirho: wordChirho.isInConstruct,
			ipa_chirho: piecesChirho
				.map(
					(pieceChirho) =>
						(pieceChirho.stressed_chirho && piecesChirho.length > 1 ? 'ˈ' : '') +
						pieceChirho.ipa_chirho
				)
				.join(''),
			syllables_chirho: piecesChirho
		};
	});
	if (!outputChirho.length) throw new Error('No pronounceable Hebrew word found');
	return {
		source_chirho: sourceChirho,
		ipa_chirho: outputChirho.map((wordChirho) => wordChirho.ipa_chirho).join(' '),
		words_chirho: outputChirho
	};
}
