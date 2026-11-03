// For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life. — John 3:16 (KJV)

import { greekCueGroupsChirho } from '../../domain-chirho/greek-cues-chirho';

// The Greek reading key in its source language, English. Each item id is stable, so the
// interface catalogues can translate it (see i18n-chirho/legend-messages-chirho.ts).
export const greekKeyRowsChirho = [
	{
		label_chirho: 'Word kind',
		items_chirho: [
			{
				id_chirho: 'greek-noun-chirho',
				label_chirho: 'Noun',
				style_chirho: 'pos-noun-chirho',
				help_chirho: 'A noun names a person, place, thing or idea.'
			},
			{
				id_chirho: 'greek-verb-chirho',
				label_chirho: 'Verb',
				style_chirho: 'pos-verb-chirho',
				help_chirho: 'A verb expresses an action or state.'
			},
			{
				id_chirho: 'greek-adjective-chirho',
				label_chirho: 'Adjective',
				style_chirho: 'pos-adjective-chirho',
				help_chirho: 'An adjective describes or qualifies a noun.'
			},
			{
				id_chirho: 'greek-particle-chirho',
				label_chirho: 'Particle or connector',
				style_chirho: 'pos-particle-chirho',
				help_chirho: 'This outline also groups prepositions, conjunctions and adverbs.'
			},
			{
				id_chirho: 'greek-pronoun-chirho',
				label_chirho: 'Pronoun · dashed round outline',
				style_chirho: 'greek-pronoun-key-chirho',
				help_chirho:
					'A pronoun stands for or points to a person or thing. The source gives its particular kind.'
			},
			{
				id_chirho: 'greek-article-chirho',
				label_chirho: 'Article · round outline',
				style_chirho: 'greek-article-key-chirho',
				help_chirho:
					'The article accompanies or identifies a word; its form has case, number and gender.'
			}
		]
	},
	{
		label_chirho: 'Gender',
		items_chirho: [
			{
				id_chirho: 'greek-masculine-chirho',
				label_chirho: 'Masculine',
				style_chirho: 'gender-masculine-chirho',
				help_chirho: 'Blue marks masculine grammatical gender as parsed in the source.'
			},
			{
				id_chirho: 'greek-feminine-chirho',
				label_chirho: 'Feminine',
				style_chirho: 'gender-feminine-chirho',
				help_chirho: 'Pink marks feminine grammatical gender as parsed in the source.'
			},
			{
				id_chirho: 'greek-neuter-chirho',
				label_chirho: 'Neuter',
				style_chirho: 'greek-neuter-key-chirho',
				help_chirho: 'Gray marks neuter grammatical gender as parsed in the source.'
			},
			{
				id_chirho: 'greek-no-gender-chirho',
				label_chirho: 'Unknown or not applicable · clear',
				style_chirho: '',
				help_chirho: 'A clear background indicates no gender cue is available or applicable.'
			}
		]
	},
	{
		label_chirho: 'Number',
		items_chirho: [
			{
				id_chirho: 'greek-plural-chirho',
				label_chirho: 'Plural · yellow underline',
				style_chirho: 'number-plural-chirho',
				help_chirho: 'The yellow underline marks a source parse of plural number.'
			},
			{
				id_chirho: 'greek-other-number-chirho',
				label_chirho: 'Other or unknown · no underline',
				style_chirho: '',
				help_chirho: 'No underline is used for singular, unknown or inapplicable number.'
			}
		]
	},
	...Object.entries(greekCueGroupsChirho).map(([groupChirho, recordChirho]) => ({
		label_chirho: recordChirho.label_chirho,
		items_chirho: Object.entries(recordChirho.definitions_chirho).map(
			([labelChirho, definitionChirho]) => ({
				id_chirho: `greek-${groupChirho.replace('_chirho', '')}-${definitionChirho.code_chirho.toLowerCase()}-chirho`,
				label_chirho: `${definitionChirho.code_chirho} ${labelChirho}`,
				style_chirho: '',
				help_chirho: definitionChirho.help_chirho
			})
		)
	}))
];
