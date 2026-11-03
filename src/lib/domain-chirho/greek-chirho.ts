// For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life. — John 3:16 (KJV)

import type { SourceChirho } from './lesson-chirho';

export interface GreekTokenChirho {
	id_chirho: string;
	text_chirho: string;
	segments_chirho: string[];
	start_chirho: number;
	end_chirho: number;
	raw_morphology_chirho: string;
	raw_form_morphology_chirho: string;
	raw_strongs_chirho: string;
	lemma_id_chirho: string;
	lexical_form_chirho: string;
	part_of_speech_chirho: string;
	case_chirho: string;
	number_chirho: string;
	gender_chirho: string;
	person_chirho?: string;
	tense_chirho?: string;
	voice_chirho?: string;
	mood_chirho?: string;
	gloss_chirho: string | null;
	analysis_chirho: string;
	source_note_chirho: string;
}
export interface GreekLessonChirho {
	schema_version_chirho: 1;
	id_chirho: string;
	language_chirho: 'grc';
	reference_chirho: string;
	canonical_text_chirho: string;
	translation_chirho: null;
	gloss_origin_chirho: 'berean_interlinear';
	tokens_chirho: GreekTokenChirho[];
	sources_chirho: SourceChirho[];
	source_notes_chirho?: {
		kind_chirho: string;
		text_chirho: string;
		before_token_id_chirho?: string;
	}[];
}
export type GreekCategoryChirho =
	'noun' | 'verb' | 'adjective' | 'particle' | 'pronoun' | 'article' | 'unknown';
export interface GreekRunChirho {
	text_chirho: string;
	token_chirho?: GreekTokenChirho;
}

const valuesChirho: Record<string, readonly string[]> = {
	case_chirho: ['na', 'unknown', 'nominative', 'genitive', 'dative', 'accusative', 'vocative'],
	number_chirho: ['na', 'unknown', 'singular', 'plural'],
	gender_chirho: ['na', 'unknown', 'masculine', 'feminine', 'neuter'],
	person_chirho: ['first', 'second', 'third'],
	tense_chirho: [
		'present',
		'imperfect',
		'future',
		'aorist',
		'perfect',
		'pluperfect',
		'second aorist',
		'second future',
		'second perfect',
		'second pluperfect',
		'no tense stated'
	],
	voice_chirho: [
		'active',
		'middle',
		'passive',
		'middle deponent',
		'passive deponent',
		'middle or passive',
		'middle or passive deponent',
		'impersonal active',
		'no voice'
	],
	mood_chirho: [
		'indicative',
		'subjunctive',
		'imperative',
		'infinitive',
		'participle',
		'optative',
		'imperative participle'
	]
};
const partsChirho = [
	'unknown',
	'interjection',
	'correlative or interrogative pronoun',
	'letter indeclinable',
	'noun other type indeclinable',
	'adjective',
	'adverb',
	'aramaic',
	'article',
	'cond',
	'conjunction',
	'correlative pronoun',
	'demonstrative pronoun',
	'hebrew',
	'indefinite pronoun',
	'interrogative pronoun',
	'noun',
	'numeral indeclinable',
	'particle',
	'personal pronoun',
	'possessive pronoun',
	'preposition',
	'proper noun indeclinable',
	'reciprocal pronoun',
	'reflexive pronoun',
	'relative pronoun',
	'verb'
];
function objectChirho(valueChirho: unknown): Record<string, unknown> {
	if (!valueChirho || typeof valueChirho !== 'object' || Array.isArray(valueChirho))
		throw new Error('Expected Greek source record');
	return valueChirho as Record<string, unknown>;
}
function requiredChirho(valueChirho: unknown): asserts valueChirho is string {
	if (typeof valueChirho !== 'string' || !valueChirho.trim())
		throw new Error('Missing Greek source field');
}
/** Validate staged Greek records without changing their Unicode or inferring their morphology. */
export function validateGreekLessonChirho(
	valueChirho: unknown
): asserts valueChirho is GreekLessonChirho {
	const lessonChirho = objectChirho(valueChirho);
	if (
		lessonChirho.schema_version_chirho !== 1 ||
		lessonChirho.language_chirho !== 'grc' ||
		lessonChirho.translation_chirho !== null ||
		lessonChirho.gloss_origin_chirho !== 'berean_interlinear'
	)
		throw new Error('Invalid Greek lesson provenance');
	for (const keyChirho of ['id_chirho', 'reference_chirho', 'canonical_text_chirho'])
		requiredChirho(lessonChirho[keyChirho]);
	const textChirho = lessonChirho.canonical_text_chirho as string;
	if (
		!Array.isArray(lessonChirho.sources_chirho) ||
		!Array.isArray(lessonChirho.tokens_chirho) ||
		!lessonChirho.tokens_chirho.length
	)
		throw new Error('Missing Greek sources or tokens');
	const sourcesChirho = lessonChirho.sources_chirho.map(objectChirho);
	for (const idChirho of [
		'nestle1904-morph-chirho',
		'nestle1904-parsing-chirho',
		'berean-glosses-chirho'
	])
		if (!sourcesChirho.some((sourceChirho) => sourceChirho.id_chirho === idChirho))
			throw new Error('Missing Greek provenance');
	for (const sourceChirho of sourcesChirho) {
		for (const keyChirho of [
			'id_chirho',
			'title_chirho',
			'url_chirho',
			'revision_chirho',
			'sha256_chirho',
			'license_chirho',
			'attribution_chirho'
		])
			requiredChirho(sourceChirho[keyChirho]);
		if (!/^[a-f0-9]{64}$/.test(sourceChirho.sha256_chirho as string))
			throw new Error('Invalid Greek source digest');
		const urlChirho = new URL(sourceChirho.url_chirho as string);
		if (urlChirho.protocol !== 'https:' || urlChirho.username || urlChirho.password)
			throw new Error('Invalid Greek source URL');
	}
	let endChirho = 0;
	const idsChirho = new Set<string>();
	for (const itemChirho of lessonChirho.tokens_chirho) {
		const tokenChirho = objectChirho(itemChirho);
		for (const keyChirho of [
			'id_chirho',
			'text_chirho',
			'raw_morphology_chirho',
			'raw_form_morphology_chirho',
			'raw_strongs_chirho',
			'lemma_id_chirho',
			'lexical_form_chirho',
			'part_of_speech_chirho',
			'analysis_chirho',
			'source_note_chirho'
		])
			requiredChirho(tokenChirho[keyChirho]);
		if (
			idsChirho.has(tokenChirho.id_chirho as string) ||
			!new RegExp(
				`^${(lessonChirho.id_chirho as string).replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}!\\d+$`
			).test(tokenChirho.id_chirho as string)
		)
			throw new Error('Invalid Greek token identity');
		idsChirho.add(tokenChirho.id_chirho as string);
		if (
			!/^G\d+$/.test(tokenChirho.lemma_id_chirho as string) ||
			!partsChirho.includes(tokenChirho.part_of_speech_chirho as string)
		)
			throw new Error('Invalid Greek lemma or part of speech');
		for (const [keyChirho, allowedChirho] of Object.entries(valuesChirho)) {
			const fieldChirho = tokenChirho[keyChirho];
			if (
				fieldChirho === undefined &&
				['person_chirho', 'tense_chirho', 'voice_chirho', 'mood_chirho'].includes(keyChirho)
			)
				continue;
			if (typeof fieldChirho !== 'string' || !allowedChirho.includes(fieldChirho))
				throw new Error(`Invalid Greek ${keyChirho}`);
		}
		if (tokenChirho.gloss_chirho !== null && typeof tokenChirho.gloss_chirho !== 'string')
			throw new Error('Invalid Greek gloss');
		const startChirho = tokenChirho.start_chirho;
		const nextChirho = tokenChirho.end_chirho;
		if (
			!Number.isInteger(startChirho) ||
			!Number.isInteger(nextChirho) ||
			(startChirho as number) < endChirho ||
			(nextChirho as number) <= (startChirho as number) ||
			(nextChirho as number) > textChirho.length ||
			textChirho.slice(startChirho as number, nextChirho as number) !== tokenChirho.text_chirho ||
			!/^[\s\p{P}]*$/u.test(textChirho.slice(endChirho, startChirho as number))
		)
			throw new Error('Invalid Greek source span or gap');
		if (
			!Array.isArray(tokenChirho.segments_chirho) ||
			tokenChirho.segments_chirho.some(
				(segmentChirho: unknown) => typeof segmentChirho !== 'string' || !segmentChirho
			) ||
			tokenChirho.segments_chirho.join('') !== tokenChirho.text_chirho
		)
			throw new Error('Invalid Greek segments');
		endChirho = nextChirho as number;
	}
	if (!/^[\s\p{P}]*$/u.test(textChirho.slice(endChirho)))
		throw new Error('Invalid Greek final gap');
}
export function greekRunsChirho(lessonChirho: GreekLessonChirho): GreekRunChirho[] {
	let endChirho = 0;
	const runsChirho: GreekRunChirho[] = [];
	for (const tokenChirho of lessonChirho.tokens_chirho) {
		const gapChirho = lessonChirho.canonical_text_chirho.slice(endChirho, tokenChirho.start_chirho);
		let prefixChirho = gapChirho;
		if (runsChirho.length) {
			const splitChirho = /^(\S*)(\s+)(\S*)$/u.exec(gapChirho);
			if (!splitChirho) throw new Error('Invalid Greek word separation');
			runsChirho[runsChirho.length - 1].text_chirho += splitChirho[1];
			runsChirho.push({ text_chirho: splitChirho[2] });
			prefixChirho = splitChirho[3];
		}
		runsChirho.push({
			text_chirho: prefixChirho + tokenChirho.text_chirho,
			token_chirho: tokenChirho
		});
		endChirho = tokenChirho.end_chirho;
	}
	if (runsChirho.length)
		runsChirho[runsChirho.length - 1].text_chirho +=
			lessonChirho.canonical_text_chirho.slice(endChirho);
	return runsChirho;
}
export function greekCategoryChirho(tokenChirho: GreekTokenChirho): GreekCategoryChirho {
	const partChirho = tokenChirho.part_of_speech_chirho;
	if (partChirho === 'article') return 'article';
	if (partChirho.endsWith(' pronoun')) return 'pronoun';
	if (partChirho === 'noun' || partChirho === 'proper noun indeclinable') return 'noun';
	if (partChirho === 'verb' || partChirho === 'adjective') return partChirho;
	if (['particle', 'preposition', 'conjunction', 'adverb', 'cond'].includes(partChirho))
		return 'particle';
	return 'unknown';
}
export function greekAnalysisChirho(tokenChirho: GreekTokenChirho): string {
	return [
		tokenChirho.part_of_speech_chirho,
		...(
			[
				'case_chirho',
				'number_chirho',
				'gender_chirho',
				'tense_chirho',
				'voice_chirho',
				'mood_chirho',
				'person_chirho'
			] as const
		)
			.map((keyChirho) => tokenChirho[keyChirho])
			.filter((valueChirho) => valueChirho && valueChirho !== 'na' && valueChirho !== 'unknown')
	].join(', ');
}
