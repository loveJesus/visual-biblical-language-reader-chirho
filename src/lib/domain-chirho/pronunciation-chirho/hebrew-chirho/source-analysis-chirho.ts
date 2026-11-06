// For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life. — John 3:16 (KJV)
// Workflow: reusable-word-audio-chirho.md. These are analysis copies, never source-text edits.
import { Text as TextChirho } from 'havarotjs';

function readingCopyChirho(sourceChirho: string): string {
	return sourceChirho.replace(/[^\s־]+/gu, (wordChirho) => {
		const matchesChirho = [...wordChirho.matchAll(/[\u05d0-\u05ea][\u0591-\u05c7]*/gu)];
		const clustersChirho = matchesChirho.map((matchChirho) => matchChirho[0]);
		const omitChirho = (indexChirho: number) =>
			wordChirho.slice(0, matchesChirho[indexChirho].index) +
			wordChirho.slice(matchesChirho[indexChirho].index + clustersChirho[indexChirho].length);
		const lettersChirho = clustersChirho.map((clusterChirho) => clusterChirho[0]).join('');
		// Issachar's second, unpointed sin is silent in the adopted reading tradition.
		// HebrewStrong H3485; Hornkohl, The Proper Name Issachar, doi:10.11647/OBP.0310.04.
		if (/^(?:ו|ל|וב|ב)?יששכר$/u.test(lettersChirho)) {
			const indexChirho = clustersChirho.findIndex((clusterChirho) => clusterChirho[0] === 'י');
			if (
				clustersChirho[indexChirho].includes('\u05b4') &&
				clustersChirho[indexChirho + 1].includes('\u05c2') &&
				!/[\u05b0-\u05bc\u05c1\u05c2\u05c7]/u.test(clustersChirho[indexChirho + 2])
			)
				return omitChirho(indexChirho + 2);
		}
		// Exact alternate spelling of Belshazzar, HebrewStrong H1112 (not Aramaic H1113).
		if (
			lettersChirho === 'בלאשצר' &&
			clustersChirho[0].includes('\u05b5') &&
			clustersChirho[1].includes('\u05b0') &&
			!/[\u05b0-\u05bc\u05c7]/u.test(clustersChirho[2]) &&
			clustersChirho[3].includes('\u05b7')
		)
			return omitChirho(2);
		return wordChirho;
	});
}

export function hebrewAnalysisWordsChirho(sourceChirho: string) {
	const copyChirho = readingCopyChirho(sourceChirho);
	const wordsChirho = new TextChirho(copyChirho, { strict: true, longVowels: false }).words.filter(
		(wordChirho) => !wordChirho.isNotHebrew
	);
	return wordsChirho.map((wordChirho) => {
		// Havarot's meteg/vowel-letter interaction can strand a mater in a zero-vowel
		// syllable. Preserve its documented shevaAfterMeteg=true behavior, including
		// vocal sheva, by reparsing only this failed shape with its long-vowel path.
		// https://github.com/charlesLoder/havarotjs/blob/v0.25.5/src/utils/syllabifier.ts
		const syllablesChirho = wordChirho.syllables;
		const strandedChirho = syllablesChirho.flatMap((syllableChirho, indexChirho) =>
			syllableChirho.vowelNames.length === 0 ? [indexChirho] : []
		);
		if (!strandedChirho.length) return wordChirho;
		if (
			strandedChirho.some((indexChirho) => {
				const previousChirho = syllablesChirho[indexChirho - 1]?.clusters.at(-1)?.text ?? '';
				return (
					!previousChirho.includes('\u05bd') ||
					!/[\u05b4\u05b9\u05ba]/u.test(previousChirho) ||
					!/^[יו][\u0591-\u05c7]*[\u05d0-\u05ea][\u0591-\u05c7]*\u05b0/u.test(
						syllablesChirho[indexChirho].text
					)
				);
			})
		)
			return wordChirho;
		const repairedChirho = new TextChirho(wordChirho.original, {
			strict: true,
			longVowels: true
		}).words.filter((valueChirho) => !valueChirho.isNotHebrew);
		const vowelsChirho = repairedChirho.flatMap((valueChirho) =>
			valueChirho.syllables.flatMap((syllableChirho) => syllableChirho.vowelNames)
		);
		const originalShevasChirho = syllablesChirho.flatMap((syllableChirho) =>
			syllableChirho.vowelNames.filter((vowelChirho) => vowelChirho === 'SHEVA')
		).length;
		if (
			repairedChirho.length !== 1 ||
			repairedChirho[0].syllables.some(
				(syllableChirho) => syllableChirho.vowelNames.length === 0
			) ||
			// Restore the stranded shevas only; other closed-syllable shevas cannot
			// become vocal merely because this word used the long-vowel path.
			vowelsChirho.filter((vowelChirho) => vowelChirho === 'SHEVA').length !==
				originalShevasChirho + strandedChirho.length ||
			// The broken old grouping can hide a real hiriq behind a hataf vowel.
			// Count explicit source vowel points rather than trusting that grouping.
			vowelsChirho.filter((vowelChirho) => vowelChirho !== 'SHEVA' && vowelChirho !== 'SHUREQ')
				.length !== (wordChirho.original.match(/[\u05b1-\u05bb\u05c7]/gu) ?? []).length
		)
			throw new Error('Unresolved meteg and vowel-letter syllables');
		return repairedChirho[0];
	});
}
