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
			nominative: {
				code_chirho: 'i',
				help_chirho:
					"Usually marks the subject, the person or thing doing something or being described. It also appears with linking verbs, as in 'the Word was God', where both nouns are nominative."
			},
			genitive: {
				code_chirho: 'ii',
				help_chirho:
					"Often links a noun to another word, as 'of God' or 'John’s book'. It can express possession, a part of something, source or other relationships. The surrounding words determine the connection."
			},
			dative: {
				code_chirho: 'iii',
				help_chirho:
					"Often marks the recipient or person affected, as 'to him' or 'for her'. It can also express means, place or time, as 'in the beginning'. The verb or preposition helps show its role."
			},
			accusative: {
				code_chirho: 'iv',
				help_chirho:
					"Usually marks the direct object, the person or thing an action reaches, as 'him' in 'she saw him'. With prepositions it can also express direction or other relationships."
			},
			vocative: {
				code_chirho: 'v',
				help_chirho:
					"Used to address someone directly, as 'Lord!' or 'Teacher!' It identifies the person being spoken to."
			}
		}
	},
	tense_chirho: {
		label_chirho: 'Verb tense · left',
		definitions_chirho: {
			present: {
				code_chirho: 'P',
				help_chirho:
					"Presents an action as unfolding or repeated, as 'is teaching' or 'teaches'. In the indicative it often refers to present time."
			},
			imperfect: {
				code_chirho: 'I',
				help_chirho:
					"Presents an action as unfolding or repeated in the past, as 'was teaching' or 'used to teach'. It often supplies the background of a story."
			},
			future: {
				code_chirho: 'F',
				help_chirho:
					"Usually refers to what will happen, as 'will teach'. The surrounding sentence can also give it the force of a promise or command."
			},
			'second future': {
				code_chirho: '2F',
				help_chirho:
					'An alternative formation of the future tense, often with a different stem or ending. Like other future forms, it usually refers to what will happen.'
			},
			aorist: {
				code_chirho: 'A',
				help_chirho:
					"Presents an event as a whole, as 'taught'. In the indicative it usually refers to the past. Other verb forms take their time reference from the surrounding sentence."
			},
			'second aorist': {
				code_chirho: '2A',
				help_chirho:
					'An alternative formation of the aorist, using a different stem. It presents an event as a whole, with the same basic force as other aorist forms.'
			},
			perfect: {
				code_chirho: 'R',
				help_chirho:
					"Focuses on a state resulting from an earlier action, as 'has written' or 'stands written'. In the indicative the resulting state usually holds in the present."
			},
			'second perfect': {
				code_chirho: '2R',
				help_chirho:
					'An alternative formation of the perfect tense. Like other perfect forms, it focuses on a state resulting from an earlier action.'
			},
			pluperfect: {
				code_chirho: 'L',
				help_chirho:
					"Describes a state resulting from an earlier action, viewed from a point in the past, as 'had written'."
			},
			'second pluperfect': {
				code_chirho: '2L',
				help_chirho:
					'An alternative formation of the pluperfect tense. Like other pluperfect forms, it views a resulting state from a point in the past.'
			}
		}
	},
	voice_chirho: {
		label_chirho: 'Verb voice · left, lowercase',
		definitions_chirho: {
			active: {
				code_chirho: 'a',
				help_chirho:
					"The subject performs the action or is in the state the verb describes, as 'she teaches' or 'he stands'."
			},
			middle: {
				code_chirho: 'm',
				help_chirho:
					"The subject is involved in or affected by its own action, as 'he washes himself' or 'she prepares something for herself'. The verb’s meaning guides the translation."
			},
			passive: {
				code_chirho: 'p',
				help_chirho:
					"The subject receives or undergoes the action, as 'he is taught'. The sentence may also name who performs the action."
			},
			'middle or passive': {
				code_chirho: 'e',
				help_chirho:
					"These endings can express either middle involvement, as 'washes himself', or passive reception, as 'is washed'. The verb and its context determine the meaning."
			},
			'middle deponent': {
				code_chirho: 'd',
				help_chirho:
					"A middle form of a verb traditionally called deponent. Such verbs often translate with an English active verb, as 'I come'. The verb’s own meaning guides the translation."
			},
			'passive deponent': {
				code_chirho: 'o',
				help_chirho:
					"A passive form of a verb traditionally called deponent. Such forms often describe the subject’s action or experience, as 'I went'. The verb’s own meaning guides the translation."
			},
			'middle or passive deponent': {
				code_chirho: 'n',
				help_chirho:
					'A form with shared middle/passive endings, traditionally called deponent. It often translates with an English active verb. The verb and its context determine the meaning.'
			}
		}
	},
	person_chirho: {
		label_chirho: 'Person · right',
		definitions_chirho: {
			first: {
				code_chirho: '1',
				help_chirho:
					"The speaker is involved, as 'I' for singular or 'we' for plural. A yellow underline marks plural."
			},
			second: {
				code_chirho: '2',
				help_chirho:
					"The person being addressed, as 'you' for one person or 'you all' for more than one. A yellow underline marks plural."
			},
			third: {
				code_chirho: '3',
				help_chirho:
					"Someone or something being spoken about, as 'he', 'she', 'it' or 'they'. A yellow underline marks plural."
			}
		}
	},
	mood_chirho: {
		label_chirho: 'Verb mood · right',
		definitions_chirho: {
			indicative: {
				code_chirho: 'I',
				help_chirho:
					"Presents an action or state as a statement, or asks about it, as 'he teaches' or 'does he teach?'"
			},
			subjunctive: {
				code_chirho: 'S',
				help_chirho:
					"Used for possibilities, purposes, conditions and appeals, as 'may teach', 'so that he may teach' or 'let us go'. The surrounding clause determines its force."
			},
			imperative: {
				code_chirho: 'M',
				help_chirho: "Expresses a command, request or instruction, as 'listen!' or 'give us bread'."
			},
			infinitive: {
				code_chirho: 'N',
				help_chirho:
					"A verb form often translated with 'to', as 'to teach'. It can name an activity or complete another verb, as 'wants to teach'."
			},
			participle: {
				code_chirho: 'P',
				help_chirho:
					"A verb form that can describe a person or thing, as 'the one teaching', or give circumstances, as 'while teaching'. Its case, number and gender connect it to the word it describes."
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
