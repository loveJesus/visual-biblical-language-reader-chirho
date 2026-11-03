// For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life. — John 3:16 (KJV)

import { safeSourceUrlChirho, type LessonChirho } from './lesson-chirho';

export interface GlossLanguageChirho {
	lang_chirho: string;
	id_chirho: string;
	label_chirho: string;
	direction_chirho: 'ltr' | 'rtl';
	source_folder_chirho: string;
	revision_chirho: string;
	source_url_chirho: string;
	source_sha256_chirho: string;
	approval_status_chirho: 'approved_upstream';
	exported_at_chirho: string;
	file_updated_at_chirho: string;
	license_chirho: string;
	attribution_chirho: string;
	words_chirho: Array<{
		token_id_chirho: string;
		upstream_word_id_chirho: string;
		text_chirho: string;
		gloss_chirho: string;
	}>;
}

// Workflow: pinned GBT extract → checked word-ID alignment → explicitly labeled reveal.
export function validateGlossesChirho(
	inputChirho: unknown,
	lessonChirho: LessonChirho
): GlossLanguageChirho[] {
	if (!inputChirho || typeof inputChirho !== 'object')
		throw new Error('Gloss fixture unavailable.');
	const draftChirho = inputChirho as {
		schema_version_chirho: number;
		reference_id_chirho: string;
		languages_chirho: GlossLanguageChirho[];
	};
	if (
		draftChirho.schema_version_chirho !== 1 ||
		draftChirho.reference_id_chirho !== lessonChirho.id_chirho ||
		!Array.isArray(draftChirho.languages_chirho) ||
		draftChirho.languages_chirho.length > 40
	)
		throw new Error('Unsupported gloss fixture.');
	const idsChirho = new Set<string>();
	for (const languageChirho of draftChirho.languages_chirho) {
		if (
			!languageChirho ||
			!/^[a-z]{2,3}$/.test(languageChirho.id_chirho) ||
			idsChirho.has(languageChirho.id_chirho)
		)
			throw new Error('Invalid or duplicate gloss language.');
		idsChirho.add(languageChirho.id_chirho);
		if (
			!['ltr', 'rtl'].includes(languageChirho.direction_chirho) ||
			languageChirho.approval_status_chirho !== 'approved_upstream' ||
			!/^[a-f0-9]{40}$/.test(languageChirho.revision_chirho) ||
			!/^[a-f0-9]{64}$/.test(languageChirho.source_sha256_chirho)
		)
			throw new Error('Unverified gloss provenance.');
		for (const keyChirho of [
			'label_chirho',
			'source_folder_chirho',
			'exported_at_chirho',
			'file_updated_at_chirho',
			'license_chirho',
			'attribution_chirho'
		] as const)
			if (typeof languageChirho[keyChirho] !== 'string' || !languageChirho[keyChirho].trim())
				throw new Error('Missing gloss provenance.');
		safeSourceUrlChirho(languageChirho.source_url_chirho);
		if (
			!Array.isArray(languageChirho.words_chirho) ||
			languageChirho.words_chirho.length !== lessonChirho.tokens_chirho.length
		)
			throw new Error('Gloss word count does not match the source.');
		for (const [indexChirho, tokenChirho] of lessonChirho.tokens_chirho.entries()) {
			const wordChirho = languageChirho.words_chirho[indexChirho];
			const nextChirho =
				lessonChirho.tokens_chirho[indexChirho + 1]?.start_chirho ??
				lessonChirho.canonical_text_chirho.length;
			const expectedChirho =
				tokenChirho.text_chirho +
				lessonChirho.canonical_text_chirho.slice(tokenChirho.end_chirho, nextChirho).trimEnd();
			if (
				!wordChirho ||
				wordChirho.token_id_chirho !== tokenChirho.id_chirho ||
				!/^\d{10}$/.test(wordChirho.upstream_word_id_chirho) ||
				typeof wordChirho.gloss_chirho !== 'string' ||
				!wordChirho.gloss_chirho.trim() ||
				typeof wordChirho.text_chirho !== 'string' ||
				wordChirho.text_chirho.normalize('NFD') !== expectedChirho.normalize('NFD')
			)
				throw new Error('Gloss alignment or review data is invalid.');
		}
	}
	return draftChirho.languages_chirho;
}
