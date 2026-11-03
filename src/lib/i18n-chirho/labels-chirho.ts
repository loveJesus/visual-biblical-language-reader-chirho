// For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life. — John 3:16 (KJV)

import { morphologyLabelChirho } from '$lib/domain-chirho/cues-chirho';
import { greekAnalysisChirho, type GreekTokenChirho } from '$lib/domain-chirho/greek-chirho';
import type { TokenChirho } from '$lib/domain-chirho/lesson-chirho';
import type { LocaleChirho } from './locale-chirho';

import { bibleBookChirho, isBibleBookChirho } from '$lib/bible-chirho/books-chirho';

export function bookNameChirho(bookChirho: string, localeChirho: LocaleChirho): string {
	if (!isBibleBookChirho(bookChirho)) return bookChirho;
	const entryChirho = bibleBookChirho(bookChirho);
	return localeChirho === 'es' ? entryChirho.spanish_label_chirho : entryChirho.label_chirho;
}

// "Prov.26.1" -> "Proverbios 26:1"; the canonical id itself never changes.
export function referenceChirho(osisIdChirho: string, localeChirho: LocaleChirho): string {
	const [bookChirho, chapterChirho, verseChirho] = osisIdChirho.split('.');
	return `${bookNameChirho(bookChirho, localeChirho)} ${chapterChirho}:${verseChirho}`;
}

// Source grammar values (Hebrew and Greek) -> Spanish terms. Keys are the sources' own values.
const SPANISH_TERMS_CHIRHO: Record<string, string> = {
	noun: 'sustantivo',
	verb: 'verbo',
	adjective: 'adjetivo',
	particle: 'partícula',
	pronoun: 'pronombre',
	article: 'artículo',
	unknown: 'sin categoría',
	masculine: 'masculino',
	feminine: 'femenino',
	neuter: 'neutro',
	common: 'común',
	singular: 'singular',
	plural: 'plural',
	dual: 'dual',
	absolute: 'absoluto',
	construct: 'constructo',
	na: 'no aplica',
	adverb: 'adverbio',
	aramaic: 'arameo',
	cond: 'condicional',
	conjunction: 'conjunción',
	'correlative pronoun': 'pronombre correlativo',
	'demonstrative pronoun': 'pronombre demostrativo',
	hebrew: 'hebreo',
	'indefinite pronoun': 'pronombre indefinido',
	'interrogative pronoun': 'pronombre interrogativo',
	'numeral indeclinable': 'numeral indeclinable',
	'personal pronoun': 'pronombre personal',
	'possessive pronoun': 'pronombre posesivo',
	preposition: 'preposición',
	'proper noun indeclinable': 'nombre propio indeclinable',
	'reciprocal pronoun': 'pronombre recíproco',
	'reflexive pronoun': 'pronombre reflexivo',
	'relative pronoun': 'pronombre relativo',
	nominative: 'nominativo',
	genitive: 'genitivo',
	dative: 'dativo',
	accusative: 'acusativo',
	vocative: 'vocativo',
	present: 'presente',
	imperfect: 'imperfecto',
	future: 'futuro',
	aorist: 'aoristo',
	perfect: 'perfecto',
	pluperfect: 'pluscuamperfecto',
	'second aorist': 'segundo aoristo',
	'second future': 'segundo futuro',
	'second perfect': 'segundo perfecto',
	'second pluperfect': 'segundo pluscuamperfecto',
	active: 'activa',
	middle: 'media',
	passive: 'pasiva',
	'middle deponent': 'media deponente',
	'passive deponent': 'pasiva deponente',
	'middle or passive': 'media o pasiva',
	'middle or passive deponent': 'media o pasiva deponente',
	indicative: 'indicativo',
	subjunctive: 'subjuntivo',
	imperative: 'imperativo',
	infinitive: 'infinitivo',
	participle: 'participio',
	participle_active: 'participio activo',
	participle_passive: 'participio pasivo',
	infinitive_absolute: 'infinitivo absoluto',
	infinitive_construct: 'infinitivo constructo',
	cohortative: 'cohortativo',
	jussive: 'yusivo',
	qatal_copulative: 'qatal con conjunción copulativa',
	first: 'primera persona',
	second: 'segunda persona',
	third: 'tercera persona'
};

// An unlisted value stays visible as the source gives it rather than being guessed.
export function termChirho(valueChirho: string, localeChirho: LocaleChirho): string {
	return localeChirho === 'es' ? (SPANISH_TERMS_CHIRHO[valueChirho] ?? valueChirho) : valueChirho;
}

// The English label stays the domain's own; Spanish mirrors it term for term. Stem and form
// names (qal, yiqtol, wayyiqtol) are transliterated terms and stay as they are.
export function morphologyLabelLocalizedChirho(
	tokenChirho: TokenChirho,
	localeChirho: LocaleChirho
): string {
	if (localeChirho === 'en') return morphologyLabelChirho(tokenChirho);
	const verbChirho = tokenChirho.verb_form_chirho
		? `; ${tokenChirho.verb_stem_chirho ?? ''} ${termChirho(tokenChirho.verb_construction_chirho ?? tokenChirho.verb_form_chirho, 'es')}`
		: tokenChirho.verb_code_chirho
			? `; código verbal local ${tokenChirho.verb_code_chirho}`
			: '';
	return `${termChirho(tokenChirho.pos_chirho, 'es')}; género ${termChirho(tokenChirho.gender_chirho, 'es')}; número ${termChirho(tokenChirho.number_chirho, 'es')}; estado ${termChirho(tokenChirho.state_chirho, 'es')}${verbChirho}`;
}

// Mirrors greekAnalysisChirho: part of speech, then each known parse value, in the same order.
export function greekAnalysisLocalizedChirho(
	tokenChirho: GreekTokenChirho,
	localeChirho: LocaleChirho
): string {
	if (localeChirho === 'en') return greekAnalysisChirho(tokenChirho);
	return [
		tokenChirho.part_of_speech_chirho,
		...[
			tokenChirho.case_chirho,
			tokenChirho.number_chirho,
			tokenChirho.gender_chirho,
			tokenChirho.tense_chirho,
			tokenChirho.voice_chirho,
			tokenChirho.mood_chirho,
			tokenChirho.person_chirho
		].filter(
			(valueChirho): valueChirho is string =>
				!!valueChirho && valueChirho !== 'na' && valueChirho !== 'unknown'
		)
	]
		.map((valueChirho) => termChirho(valueChirho, 'es'))
		.join(', ');
}
