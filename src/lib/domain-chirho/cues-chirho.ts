// For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life. — John 3:16 (KJV)

import { safeSourceUrlChirho, type TokenChirho } from './lesson-chirho';
import { verbFormMarkerChirho, verbStemNumberChirho } from './verb-forms-chirho';

export const paletteChirho = {
	masculine_chirho: '#dff0ff',
	feminine_chirho: '#ffe4ed',
	plural_chirho: '#e9c92d',
	dual_chirho: '#36a36a',
	noun_chirho: '#18847d',
	verb_chirho: '#8152b1',
	adjective_chirho: '#c57820',
	particle_chirho: '#7c8589',
	unknown_chirho: '#7c8589',
	pattern_chirho: '#dd7b24'
} as const;

// Workflow: validated lesson → independent cues; no cue is inferred from spelling or a root.
export function cuesChirho(tokenChirho: TokenChirho) {
	let patternChirho: 'none' | 'dotted' | 'solid' = 'none';
	const noteChirho = tokenChirho.form_note_chirho;
	if (noteChirho?.text_chirho.trim()) {
		try {
			safeSourceUrlChirho(noteChirho.source_chirho);
			if (noteChirho.kind_chirho === 'predictable_weak') patternChirho = 'dotted';
			if (['exceptional', 'suppletive'].includes(noteChirho.kind_chirho)) patternChirho = 'solid';
		} catch {
			/* Invalid curated data is rejected by validation; it must not acquire a cue. */
		}
	}
	const verbCodeChirho =
		tokenChirho.pos_chirho === 'verb' && /^[1-7][PIMACB]$/.test(tokenChirho.verb_code_chirho ?? '')
			? tokenChirho.verb_code_chirho
			: undefined;
	return {
		background_chirho:
			tokenChirho.gender_chirho === 'masculine'
				? paletteChirho.masculine_chirho
				: tokenChirho.gender_chirho === 'feminine'
					? paletteChirho.feminine_chirho
					: 'transparent',
		number_color_chirho:
			tokenChirho.number_chirho === 'plural'
				? paletteChirho.plural_chirho
				: tokenChirho.number_chirho === 'dual'
					? paletteChirho.dual_chirho
					: 'transparent',
		pos_color_chirho: paletteChirho[`${tokenChirho.pos_chirho}_chirho`],
		state_marker_chirho:
			tokenChirho.pos_chirho === 'noun'
				? tokenChirho.state_chirho === 'absolute'
					? 'i'
					: tokenChirho.state_chirho === 'construct'
						? 'ii'
						: ''
				: '',
		stem_marker_chirho:
			tokenChirho.pos_chirho === 'verb'
				? verbStemNumberChirho(tokenChirho.verb_stem_chirho) || verbCodeChirho?.[0] || ''
				: '',
		conjugation_marker_chirho:
			tokenChirho.pos_chirho === 'verb'
				? verbFormMarkerChirho(
						tokenChirho.verb_form_chirho,
						tokenChirho.verb_construction_chirho
					) ||
					verbCodeChirho?.[1] ||
					''
				: '',
		pattern_chirho: patternChirho
	};
}

export function morphologyLabelChirho(tokenChirho: TokenChirho): string {
	return `${tokenChirho.pos_chirho}; gender ${tokenChirho.gender_chirho === 'na' ? 'not applicable' : tokenChirho.gender_chirho}; number ${tokenChirho.number_chirho === 'na' ? 'not applicable' : tokenChirho.number_chirho}; state ${tokenChirho.state_chirho === 'na' ? 'not applicable' : tokenChirho.state_chirho}${tokenChirho.verb_form_chirho ? `; ${tokenChirho.verb_stem_chirho ?? ''} ${tokenChirho.verb_construction_chirho ?? tokenChirho.verb_form_chirho}` : tokenChirho.verb_code_chirho ? `; local verb code ${tokenChirho.verb_code_chirho}` : ''}`;
}
