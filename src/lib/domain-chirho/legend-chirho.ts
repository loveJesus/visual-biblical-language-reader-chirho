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
				'Blue marks sourced masculine grammatical gender. Grammatical gender does not establish the sex of a referent.',
				'gender_masculine',
				'gender-masculine-chirho'
			),
			itemChirho(
				'feminine-chirho',
				'Feminine',
				'Pink marks sourced feminine grammatical gender. It is independent of number and word class.',
				'gender_feminine',
				'gender-feminine-chirho'
			),
			itemChirho(
				'clear-chirho',
				'Both / common',
				'A clear background marks sourced both/common gender. Word details distinguish this from unknown or not applicable.',
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
				'A yellow line under the word marks sourced plural number. The sticker has its own outline.',
				'number_plural',
				'number-plural-chirho'
			),
			itemChirho(
				'dual-chirho',
				'Dual',
				'A green line under the word marks sourced dual number, often associated with a pair.',
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
				'A centered lowercase Roman i marks a noun in the absolute state. Only nouns receive this superscript here; adjective state stays in details.',
				'state_absolute'
			),
			itemChirho(
				'construct-chirho',
				'ii · construct',
				'A centered lowercase Roman ii marks a noun in the construct state, used in a construction linking it with what follows. Definiteness and possession are not extra states.',
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
				'The basic stem can express actions or states. It does not always correspond to an active English verb. 1 is our local code, physically above the left of a verb.',
				'stem_qal'
			),
			itemChirho(
				'niphal-chirho',
				'2 Niphal',
				'Often passive or middle, with lexical variation. Check the particular verb and context.',
				'stem_niphal'
			),
			itemChirho(
				'piel-chirho',
				'3 Piel',
				'A stem with varied lexical functions. It is not a universal intensive or stronger action.',
				'stem_piel'
			),
			itemChirho(
				'pual-chirho',
				'4 Pual',
				'Often the passive counterpart of Piel. The actual meaning depends on the verb.',
				'stem_pual'
			),
			itemChirho(
				'hiphil-chirho',
				'5 Hiphil',
				'Often causative, but context and lexical meaning still matter.',
				'stem_hiphil'
			),
			itemChirho(
				'hophal-chirho',
				'6 Hophal',
				'Often passive causative, commonly related to Hiphil.',
				'stem_hophal'
			),
			itemChirho(
				'hithpael-chirho',
				'7 Hithpael',
				'Often reflexive or middle, and sometimes reciprocal. It has other lexical functions too.',
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
				'Traditionally called perfect. Qatal is not an automatic past-tense switch; context determines its use. P is a local teaching code above the right of a verb.',
				'verb_perfect'
			),
			itemChirho(
				'yiqtol-chirho',
				'I yiqtol',
				'Traditionally called imperfect. Yiqtol is not an automatic future-tense switch. I is distinct from imperative M. A waw alone does not establish wayyiqtol.',
				'verb_imperfect'
			),
			itemChirho(
				'imperative-chirho',
				'M imperative',
				'A form commonly used in commands or requests. M must remain distinct from yiqtol I.',
				'verb_imperative'
			),
			itemChirho(
				'participle-chirho',
				'A participle',
				'A participle retains its stem; 1A means a Qal participle. Verb conjugation is a broad teaching group here: finite conjugations, plus non-finite participles and infinitives. Their function in a sentence still depends on context.',
				'verb'
			),
			itemChirho(
				'infinitive-construct-chirho',
				'C infinitive construct',
				'A non-finite verb form with several syntactic uses. It is a verb form, not the noun-state numeral ii.',
				'infinitive_construct'
			),
			itemChirho(
				'infinitive-absolute-chirho',
				'B infinitive absolute',
				'A non-finite verb form that may emphasize or otherwise qualify an action. It is distinct from noun absolute state i.',
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
				'A teal rounded icon outline marks the word as a noun. The outline encodes word class, not gender.',
				'noun',
				'pos-noun-chirho'
			),
			itemChirho(
				'verb-chirho',
				'Verb',
				'A purple rounded outline marks a verb, including participles in this teaching scheme.',
				'verb',
				'pos-verb-chirho'
			),
			itemChirho(
				'adjective-chirho',
				'Adjective',
				'An orange rounded outline marks an adjective. A dictionary noun heading does not override verse-specific morphology.',
				'adjective',
				'pos-adjective-chirho'
			),
			itemChirho(
				'particle-chirho',
				'Particle',
				'A gray rounded outline marks a particle. Raw verse-specific morphology remains visible in details.',
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
