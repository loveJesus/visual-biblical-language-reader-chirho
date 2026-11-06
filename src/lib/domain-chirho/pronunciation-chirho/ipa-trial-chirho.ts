// For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life. — John 3:16 (KJV)
// Workflow: local-reader-chirho.md. Trial IPA is an additive, exact-source-bound pronunciation layer.
import trialChirho from './ipa-trial-chirho.json';
import readingsChirho from './hebrew-chirho/reading-reviews-chirho.json';

export interface IpaNoteChirho {
	lesson_id_chirho: string;
	token_id_chirho: string;
	text_chirho: string;
	lemma_id_chirho: string;
	lemma_augment_chirho: string | null;
	raw_morphology_chirho: string;
	ipa_chirho: string;
	surprising_chirho: boolean;
	explanation_chirho: { en: string; es: string };
	sources_chirho: { label_chirho: string; url_chirho: string }[];
}
interface IpaTokenChirho {
	id_chirho: string;
	text_chirho: string;
	lemma_id_chirho?: string;
	lemma_augment_chirho?: string | null;
	raw_morphology_chirho?: string;
	qere_chirho?: { text_chirho: string }[];
}
const notesChirho = new Map<string, IpaNoteChirho>(
	[...trialChirho.words_chirho, ...readingsChirho.words_chirho].map((rowChirho) => [
		rowChirho.token_id_chirho,
		rowChirho
	])
);

export function ipaNoteChirho(tokenChirho: IpaTokenChirho): IpaNoteChirho | null {
	const noteChirho = notesChirho.get(tokenChirho.id_chirho);
	return noteChirho &&
		noteChirho.text_chirho === tokenChirho.text_chirho &&
		noteChirho.lemma_id_chirho === tokenChirho.lemma_id_chirho &&
		noteChirho.lemma_augment_chirho === (tokenChirho.lemma_augment_chirho ?? null) &&
		noteChirho.raw_morphology_chirho === tokenChirho.raw_morphology_chirho &&
		!tokenChirho.qere_chirho?.length
		? noteChirho
		: null;
}

/** Only the explicitly checked trial words can supply provider phonemes; no guessed fallback. */
export function ipaForRecordingChirho(
	lessonChirho: {
		id_chirho: string;
		canonical_text_chirho: string;
		tokens_chirho: IpaTokenChirho[];
	},
	tokenIdChirho: string | null
): string | null {
	const passageChirho = trialChirho.passages_chirho.find(
		(rowChirho) =>
			rowChirho.lesson_id_chirho === lessonChirho.id_chirho &&
			rowChirho.canonical_text_chirho === lessonChirho.canonical_text_chirho
	);
	if (!passageChirho) return null;
	if (tokenIdChirho !== null) {
		const tokenChirho = lessonChirho.tokens_chirho.find(
			(rowChirho) => rowChirho.id_chirho === tokenIdChirho
		);
		const noteChirho = tokenChirho ? ipaNoteChirho(tokenChirho) : null;
		return noteChirho?.lesson_id_chirho === lessonChirho.id_chirho ? noteChirho.ipa_chirho : null;
	}
	if (!passageChirho.verse_trial_chirho) return null;
	const expectedChirho = trialChirho.words_chirho.filter(
		(rowChirho) => rowChirho.lesson_id_chirho === lessonChirho.id_chirho
	);
	if (
		lessonChirho.tokens_chirho.length !== expectedChirho.length ||
		lessonChirho.tokens_chirho.some(
			(tokenChirho, indexChirho) =>
				tokenChirho.id_chirho !== expectedChirho[indexChirho].token_id_chirho
		)
	)
		return null;
	const partsChirho = lessonChirho.tokens_chirho.map((tokenChirho) => ipaNoteChirho(tokenChirho));
	if (partsChirho.some((noteChirho) => noteChirho?.lesson_id_chirho !== lessonChirho.id_chirho))
		return null;
	return partsChirho.map((noteChirho) => noteChirho!.ipa_chirho).join(' ');
}

export const ipaInputChirho = (ipaChirho: string) => `"/${ipaChirho}/"`;
