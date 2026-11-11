// For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life. — John 3:16 (KJV)

import { namedVerbFormsChirho } from './verb-forms-chirho';

export interface LegendItemChirho {
	id_chirho: string;
	label_chirho: string;
	help_chirho: string;
	style_chirho: string;
	source_chirho: string;
}
export interface LegendRowChirho {
	label_chirho: string;
	items_chirho: LegendItemChirho[];
}

const grammarBaseChirho = 'https://uhg.readthedocs.io/en/stable/';
function itemChirho(
	idChirho: string,
	labelChirho: string,
	helpChirho: string,
	pageChirho: string,
	styleChirho = ''
): LegendItemChirho {
	return {
		id_chirho: idChirho,
		label_chirho: labelChirho,
		help_chirho: helpChirho,
		style_chirho: styleChirho,
		source_chirho: pageChirho ? `${grammarBaseChirho}${pageChirho}.html` : grammarBaseChirho
	};
}

// Grammar descriptions cite unfoldingWord; the physical cues and numeric/letter codes are local.
export const legendRowsChirho: LegendRowChirho[] = [
	{
		label_chirho: 'Gender',
		items_chirho: [
			itemChirho(
				'masculine-chirho',
				'Masculine',
				'A grammatical class marked in blue. Adjectives, pronouns and related verb forms can agree with a masculine noun in gender and number. This agreement helps show which words belong together.',
				'gender_masculine',
				'gender-masculine-chirho'
			),
			itemChirho(
				'feminine-chirho',
				'Feminine',
				'A grammatical class marked in pink. Adjectives, pronouns and related verb forms can agree with a feminine noun in gender and number. This agreement helps show which words belong together.',
				'gender_feminine',
				'gender-feminine-chirho'
			),
			itemChirho(
				'clear-chirho',
				'Both / common',
				"A form usable with masculine or feminine reference, such as some first-person verb forms meaning 'I' or 'we'. It has a clear background. Word details give the source’s exact gender label.",
				'gender_both'
			),
			itemChirho(
				'unknown-gender-chirho',
				'N/A / unknown',
				'Not applicable and unknown also have a clear background, but remain distinct categories in word details. Neither means masculine or both.',
				''
			)
		]
	},
	{
		label_chirho: 'Number',
		items_chirho: [
			itemChirho(
				'plural-chirho',
				'Plural',
				"More than one, as 'kings', 'they' or 'we'. The yellow line under the word marks plural number. The picture outline separately shows the word class.",
				'number_plural',
				'number-plural-chirho'
			),
			itemChirho(
				'dual-chirho',
				'Dual',
				'A number form often used for two or a natural pair, such as hands or eyes. A green line under the word marks the dual. The particular word and sentence show the intended count.',
				'number_dual',
				'number-dual-chirho'
			),
			itemChirho(
				'unmarked-chirho',
				'No line',
				'Singular, not applicable and unknown have no number line. An absent line alone is not a positive claim of singular.',
				'number_singular'
			)
		]
	},
	{
		label_chirho: 'Noun state',
		items_chirho: [
			itemChirho(
				'absolute-chirho',
				'i · absolute',
				"The usual form of a noun when it stands on its own, as 'king'. In a chain such as 'the king of Israel', the final noun is commonly absolute. A centered i marks this state here.",
				'state_absolute'
			),
			itemChirho(
				'construct-chirho',
				'ii · construct',
				"Links a noun to what follows, often translated with 'of', as 'the word of God' or 'the king of Israel'. A suffix can express the connected person, as 'his word'. A centered ii marks this state.",
				'state_construct'
			)
		]
	},
	{
		label_chirho: 'Verb stem LEFT',
		items_chirho: [
			itemChirho(
				'qal-chirho',
				'1 Qal',
				"The basic Hebrew verb stem, a pattern of root letters and vowels. It can express an action, as 'he wrote', or a state, as 'he was great'. The individual verb and its context give the meaning.",
				'stem_qal'
			),
			itemChirho(
				'niphal-chirho',
				'2 Niphal',
				"Often describes the subject receiving an action or undergoing a change, as 'was guarded'. It can also describe the subject’s own involvement, as 'gathered together'. The particular verb determines its meaning.",
				'stem_niphal'
			),
			itemChirho(
				'piel-chirho',
				'3 Piel',
				"A verb stem often formed with a doubled middle root letter. Its meaning varies by verb, as 'speak' or 'teach', and can express a resulting state or intensified action. Check the individual verb in context.",
				'stem_piel'
			),
			itemChirho(
				'pual-chirho',
				'4 Pual',
				"Often expresses the receiving side of a Piel action, as 'was taught'. The subject undergoes the action. Its precise meaning depends on the verb.",
				'stem_pual'
			),
			itemChirho(
				'hiphil-chirho',
				'5 Hiphil',
				"Often expresses causing someone or something to act or enter a state, as 'brought in' from 'enter'. Some verbs have a more specialized meaning in this stem.",
				'stem_hiphil'
			),
			itemChirho(
				'hophal-chirho',
				'6 Hophal',
				"Often expresses receiving a caused action, as 'was brought in'. It commonly corresponds to Hiphil, where someone causes that action.",
				'stem_hophal'
			),
			itemChirho(
				'hithpael-chirho',
				'7 Hithpael',
				"Often describes the subject acting on itself, as 'hid himself', or participants acting toward each other. Some verbs have other meanings, so the particular verb and sentence guide the translation.",
				'stem_hithpael'
			)
		]
	},
	{
		label_chirho: 'Verb conjugation RIGHT',
		items_chirho: [
			itemChirho(
				'qatal-chirho',
				'P qatal',
				"Traditionally called perfect. Often presents an action as completed or a state as established, as 'he wrote' or 'he has written'. The sentence determines whether its time reference is past, present or future.",
				'verb_perfect'
			),
			itemChirho(
				'yiqtol-chirho',
				'I yiqtol',
				"Traditionally called imperfect. Often describes an unfolding, repeated, possible or future action, as 'he writes', 'he may write' or 'he will write'. The sentence determines its time and force.",
				'verb_imperfect'
			),
			itemChirho(
				'imperative-chirho',
				'M imperative',
				"Directly addresses someone with a command, instruction or request, as 'listen!' or 'give us bread'. Its form shows whether one or more people are addressed.",
				'verb_imperative'
			),
			itemChirho(
				'participle-chirho',
				'A participle',
				"A verb form that can describe an action or the person doing it, as 'guarding' or 'the one guarding'. It may function like a verb, adjective or noun. Its stem and context guide its meaning.",
				'verb'
			),
			itemChirho(
				'infinitive-construct-chirho',
				'C infinitive construct',
				"A verb form that can name an action or relate it to another action, as 'to guard', 'in order to guard' or 'when guarding'. It often follows a preposition and may carry a suffix.",
				'infinitive_construct'
			),
			itemChirho(
				'infinitive-absolute-chirho',
				'B infinitive absolute',
				"A verb form that can emphasize another verb, as 'you shall surely die', or describe how an action is done. Its function comes from the surrounding sentence.",
				'infinitive_absolute'
			),
			...namedVerbFormsChirho.map((formChirho) =>
				itemChirho(
					formChirho.id_chirho,
					`${formChirho.marker_chirho} ${formChirho.label_chirho}`,
					formChirho.help_chirho,
					formChirho.source_page_chirho
				)
			)
		]
	},
	{
		label_chirho: 'Icon outline POS',
		items_chirho: [
			itemChirho(
				'noun-chirho',
				'Noun',
				"Names a person, place, thing or idea, as 'king', 'Jerusalem' or 'wisdom'. A teal outline around the picture marks this word class.",
				'noun',
				'pos-noun-chirho'
			),
			itemChirho(
				'verb-chirho',
				'Verb',
				"Expresses an action or state, as 'wrote' or 'was great'. A purple picture outline marks verbs, including participles in this reading key.",
				'verb',
				'pos-verb-chirho'
			),
			itemChirho(
				'adjective-chirho',
				'Adjective',
				"Describes a noun, as 'good' in 'a good word'. Its form commonly agrees with the noun in gender and number. An orange picture outline marks this word class.",
				'adjective',
				'pos-adjective-chirho'
			),
			itemChirho(
				'particle-chirho',
				'Particle',
				"A small word that connects or qualifies other words, as 'and', 'in' or 'because'. The gray picture outline groups these words, while the details give their particular kind.",
				'particle',
				'pos-particle-chirho'
			),
			itemChirho(
				'unknown-pos-chirho',
				'Unknown',
				'A dashed gray outline marks an unresolved word class. It does not make a grammatical claim.',
				'',
				'pos-unknown-chirho'
			)
		]
	},
	{
		label_chirho: 'Form pattern',
		items_chirho: [
			itemChirho(
				'exceptional-chirho',
				'Solid · exceptional',
				'A solid orange line over a word requires a documented exceptional or suppletive form, an explanation, and a source. An unusual spelling or unresolved root alone never earns this mark.',
				'verb',
				'pattern-solid-chirho'
			),
			itemChirho(
				'weak-chirho',
				'Dotted · predictable weak',
				'A dotted orange line over a word requires a sourced explanation of the actual predictable weak or form-change pattern. Weak patterns are not automatically exceptional.',
				'verb',
				'pattern-dotted-chirho'
			)
		]
	}
];
