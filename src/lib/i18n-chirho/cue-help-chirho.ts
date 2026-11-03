// For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life. — John 3:16 (KJV)

import {
	greekCueGroupsChirho,
	type GreekCueDefinitionChirho
} from '$lib/domain-chirho/greek-cues-chirho';
import type { GreekTokenChirho } from '$lib/domain-chirho/greek-chirho';
import { legendRowsChirho } from '$lib/domain-chirho/legend-chirho';
import type { TokenChirho } from '$lib/domain-chirho/lesson-chirho';
import { namedVerbFormsChirho } from '$lib/domain-chirho/verb-forms-chirho';
import { legendItemTextChirho, type LegendTextChirho } from './legend-messages-chirho';
import type { LocaleChirho } from './locale-chirho';

const hebrewItemsChirho = new Map(
	legendRowsChirho
		.flatMap((rowChirho) => rowChirho.items_chirho)
		.map((itemChirho) => [itemChirho.id_chirho, itemChirho])
);
const stemIdsChirho = ['qal', 'niphal', 'piel', 'pual', 'hiphil', 'hophal', 'hithpael'];
const basicFormsChirho: Readonly<Record<string, string>> = {
	qatal: 'qatal',
	yiqtol: 'yiqtol',
	imperative: 'imperative',
	participle_active: 'participle',
	participle_passive: 'participle',
	infinitive_construct: 'infinitive-construct',
	infinitive_absolute: 'infinitive-absolute',
	P: 'qatal',
	I: 'yiqtol',
	M: 'imperative',
	A: 'participle',
	C: 'infinitive-construct',
	B: 'infinitive-absolute'
};

// Workflow: local-reader-chirho.md. Cue popups reuse the translated reading key, never a
// guessed root, spelling analysis or duplicated grammar explanation.
export function hebrewCueHelpChirho(
	tokenChirho: TokenChirho,
	slotChirho: 'state' | 'stem' | 'conjugation',
	localeChirho: LocaleChirho
): LegendTextChirho | null {
	let idChirho: string | undefined;
	if (slotChirho === 'state') idChirho = tokenChirho.state_chirho;
	if (slotChirho === 'stem')
		idChirho =
			tokenChirho.verb_stem_chirho ?? stemIdsChirho[Number(tokenChirho.verb_code_chirho?.[0]) - 1];
	if (slotChirho === 'conjugation') {
		const namedChirho = namedVerbFormsChirho.find(
			(formChirho) =>
				formChirho.form_chirho === tokenChirho.verb_form_chirho &&
				formChirho.construction_chirho === (tokenChirho.verb_construction_chirho ?? null)
		);
		idChirho =
			namedChirho?.id_chirho.replace(/-chirho$/, '') ??
			basicFormsChirho[tokenChirho.verb_form_chirho ?? tokenChirho.verb_code_chirho?.[1] ?? ''];
	}
	const itemChirho = idChirho ? hebrewItemsChirho.get(`${idChirho}-chirho`) : undefined;
	return itemChirho ? legendItemTextChirho(itemChirho, localeChirho) : null;
}

const greekSlotsChirho = {
	left: ['tense_chirho', 'voice_chirho'],
	center: ['case_chirho'],
	right: ['person_chirho', 'mood_chirho']
} as const;

export function greekCueHelpChirho(
	tokenChirho: GreekTokenChirho,
	slotChirho: keyof typeof greekSlotsChirho,
	localeChirho: LocaleChirho
): LegendTextChirho | null {
	const partsChirho = greekSlotsChirho[slotChirho].flatMap((groupChirho) => {
		if (
			groupChirho !== 'case_chirho' &&
			groupChirho !== 'person_chirho' &&
			tokenChirho.part_of_speech_chirho !== 'verb'
		)
			return [];
		const valueChirho = tokenChirho[groupChirho];
		const definitionsChirho: Readonly<Record<string, GreekCueDefinitionChirho>> =
			greekCueGroupsChirho[groupChirho].definitions_chirho;
		const definitionChirho = valueChirho ? definitionsChirho[valueChirho] : undefined;
		return definitionChirho
			? [
					legendItemTextChirho(
						{
							id_chirho: `greek-${groupChirho.replace('_chirho', '')}-${definitionChirho.code_chirho.toLowerCase()}-chirho`,
							label_chirho: `${definitionChirho.code_chirho} ${valueChirho}`,
							help_chirho: definitionChirho.help_chirho
						},
						localeChirho
					)
				]
			: [];
	});
	return partsChirho.length
		? {
				label_chirho: partsChirho.map((partChirho) => partChirho.label_chirho).join(' · '),
				help_chirho: partsChirho.map((partChirho) => partChirho.help_chirho).join(' '),
				lang_chirho: localeChirho
			}
		: null;
}
