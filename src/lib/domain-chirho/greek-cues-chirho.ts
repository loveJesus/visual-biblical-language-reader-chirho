// For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life. — John 3:16 (KJV)

import type { GreekTokenChirho } from './greek-chirho';

export interface GreekCueDefinitionChirho {
	code_chirho: string;
	help_chirho: string;
}
export interface GreekCueGroupChirho {
	label_chirho: string;
	definitions_chirho: Record<string, GreekCueDefinitionChirho>;
}

// Workflow: spec-chirho/workflows-chirho/local-reader-chirho.md (Greek reading cues).
// Placement and roman case numerals are local teaching conventions. Tense, mood and person
// retain the pinned Nestle parsing codes; voice uses their lowercase equivalents.
export const greekCueGroupsChirho = {
	case_chirho: {
		label_chirho: 'Case · center',
		definitions_chirho: {
			nominative: { code_chirho: 'i', help_chirho: 'Nominative case, as parsed in the source.' },
			genitive: { code_chirho: 'ii', help_chirho: 'Genitive case, as parsed in the source.' },
			dative: { code_chirho: 'iii', help_chirho: 'Dative case, as parsed in the source.' },
			accusative: { code_chirho: 'iv', help_chirho: 'Accusative case, as parsed in the source.' },
			vocative: { code_chirho: 'v', help_chirho: 'Vocative case, as parsed in the source.' }
		}
	},
	tense_chirho: {
		label_chirho: 'Verb tense · left',
		definitions_chirho: {
			present: { code_chirho: 'P', help_chirho: 'The source parses a present tense form.' },
			imperfect: { code_chirho: 'I', help_chirho: 'The source parses an imperfect tense form.' },
			future: { code_chirho: 'F', help_chirho: 'The source parses a future tense form.' },
			'second future': {
				code_chirho: '2F',
				help_chirho: 'The source distinguishes a second future form.'
			},
			aorist: { code_chirho: 'A', help_chirho: 'The source parses an aorist tense form.' },
			'second aorist': {
				code_chirho: '2A',
				help_chirho: 'The source distinguishes a second aorist form.'
			},
			perfect: { code_chirho: 'R', help_chirho: 'The source parses a perfect tense form.' },
			'second perfect': {
				code_chirho: '2R',
				help_chirho: 'The source distinguishes a second perfect form.'
			},
			pluperfect: { code_chirho: 'L', help_chirho: 'The source parses a pluperfect tense form.' },
			'second pluperfect': {
				code_chirho: '2L',
				help_chirho: 'The source distinguishes a second pluperfect form.'
			}
		}
	},
	voice_chirho: {
		label_chirho: 'Verb voice · left, lowercase',
		definitions_chirho: {
			active: { code_chirho: 'a', help_chirho: 'Active voice in the source parse.' },
			middle: { code_chirho: 'm', help_chirho: 'Middle voice in the source parse.' },
			passive: { code_chirho: 'p', help_chirho: 'Passive voice in the source parse.' },
			'middle or passive': {
				code_chirho: 'e',
				help_chirho: 'The source leaves middle or passive voice unresolved.'
			},
			'middle deponent': {
				code_chirho: 'd',
				help_chirho:
					'The source labels this middle deponent; the cue preserves that classification.'
			},
			'passive deponent': {
				code_chirho: 'o',
				help_chirho:
					'The source labels this passive deponent; the cue preserves that classification.'
			},
			'middle or passive deponent': {
				code_chirho: 'n',
				help_chirho:
					'The source labels this middle or passive deponent without choosing between them.'
			}
		}
	},
	person_chirho: {
		label_chirho: 'Person · right',
		definitions_chirho: {
			first: {
				code_chirho: '1',
				help_chirho:
					'First person in the source parse. Number is shown separately by the word underline.'
			},
			second: {
				code_chirho: '2',
				help_chirho:
					'Second person in the source parse. Number is shown separately by the word underline.'
			},
			third: {
				code_chirho: '3',
				help_chirho:
					'Third person in the source parse. Number is shown separately by the word underline.'
			}
		}
	},
	mood_chirho: {
		label_chirho: 'Verb mood · right',
		definitions_chirho: {
			indicative: { code_chirho: 'I', help_chirho: 'An indicative form, as parsed in the source.' },
			subjunctive: {
				code_chirho: 'S',
				help_chirho: 'A subjunctive form, as parsed in the source.'
			},
			imperative: { code_chirho: 'M', help_chirho: 'An imperative form, as parsed in the source.' },
			infinitive: {
				code_chirho: 'N',
				help_chirho: 'An infinitive form; it has no finite person cue.'
			},
			participle: {
				code_chirho: 'P',
				help_chirho:
					'A participle. Its sourced case appears in the center; it has no finite person cue.'
			}
		}
	}
} satisfies Record<string, GreekCueGroupChirho>;

function codeChirho(groupChirho: keyof typeof greekCueGroupsChirho, valueChirho?: string): string {
	const definitionsChirho: Record<string, GreekCueDefinitionChirho> =
		greekCueGroupsChirho[groupChirho].definitions_chirho;
	return valueChirho ? (definitionsChirho[valueChirho]?.code_chirho ?? '') : '';
}

/** Derive display annotations only; never mutate or guess the source analysis. */
export function greekCuesChirho(tokenChirho: GreekTokenChirho): {
	left_chirho: string;
	center_chirho: string;
	right_chirho: string;
} {
	const verbChirho = tokenChirho.part_of_speech_chirho === 'verb';
	return {
		left_chirho: verbChirho
			? codeChirho('tense_chirho', tokenChirho.tense_chirho) +
				codeChirho('voice_chirho', tokenChirho.voice_chirho)
			: '',
		center_chirho: codeChirho('case_chirho', tokenChirho.case_chirho),
		right_chirho:
			codeChirho('person_chirho', tokenChirho.person_chirho) +
			(verbChirho ? codeChirho('mood_chirho', tokenChirho.mood_chirho) : '')
	};
}
