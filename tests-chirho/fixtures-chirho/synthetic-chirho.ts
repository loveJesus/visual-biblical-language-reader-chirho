// For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life. — John 3:16 (KJV)

import type { LessonChirho, TokenChirho } from '../../src/lib/domain-chirho/lesson-chirho';

// Developer-only combinations. These are deliberately not biblical analyses or available lessons.
export function syntheticTokenChirho(overridesChirho: Partial<TokenChirho> = {}): TokenChirho {
	return {
		id_chirho: 'synthetic-only-chirho',
		text_chirho: 'אָב',
		segments_chirho: ['אָב'],
		start_chirho: 0,
		end_chirho: 3,
		raw_morphology_chirho: 'SYNTHETIC',
		lemma_id_chirho: 'H1',
		lemma_augment_chirho: null,
		lexical_form_chirho: 'אָב',
		pos_chirho: 'noun',
		gender_chirho: 'unknown',
		number_chirho: 'unknown',
		state_chirho: 'unknown',
		root_text_chirho: null,
		root_entry_id_chirho: null,
		root_status_chirho: 'unresolved',
		root_note_chirho: 'Synthetic fixture, no root claim.',
		gloss_chirho: 'Developer fixture',
		analysis_chirho: 'Synthetic independent-cue combinations, not a biblical analysis.',
		source_note_chirho: 'Developer-only fixture.',
		...overridesChirho
	};
}

export function syntheticLessonChirho(tokenChirho = syntheticTokenChirho()): LessonChirho {
	return {
		schema_version_chirho: 1,
		id_chirho: 'synthetic-only-chirho',
		reference_chirho: 'Synthetic developer fixture',
		language_chirho: 'he',
		canonical_text_chirho: tokenChirho.text_chirho,
		translation_chirho: 'Not a real verse.',
		tokens_chirho: [tokenChirho],
		sources_chirho: [
			{
				id_chirho: 'developer-only-chirho',
				title_chirho: 'Synthetic fixture',
				url_chirho: null,
				revision_chirho: '1',
				sha256_chirho: '0'.repeat(64),
				license_chirho: 'App-authored',
				attribution_chirho: 'Developer fixture, not sourced morphology.'
			}
		]
	};
}
