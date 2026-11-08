// For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life. — John 3:16 (KJV)

import { expect as expectChirho, test as testChirho } from 'vitest';
import type { TokenChirho } from '$lib/domain-chirho/lesson-chirho';
import { morphologyLabelLocalizedChirho, morphologySummaryLocalizedChirho } from './labels-chirho';

const tokenChirho = (fieldsChirho: Partial<TokenChirho>) =>
	({
		pos_chirho: 'noun',
		gender_chirho: 'unknown',
		number_chirho: 'unknown',
		state_chirho: 'unknown',
		verb_form_chirho: null,
		verb_stem_chirho: null,
		verb_construction_chirho: null,
		verb_code_chirho: null,
		...fieldsChirho
	}) as TokenChirho;

testChirho('the visible card line names only what the source gives, in both languages', () => {
	const properNounChirho = tokenChirho({});
	expectChirho(morphologySummaryLocalizedChirho(properNounChirho, 'en')).toBe('noun');
	expectChirho(morphologySummaryLocalizedChirho(properNounChirho, 'es')).toBe('sustantivo');
	const particleChirho = tokenChirho({
		pos_chirho: 'particle',
		gender_chirho: 'na',
		number_chirho: 'na',
		state_chirho: 'na'
	});
	expectChirho(morphologySummaryLocalizedChirho(particleChirho, 'en')).toBe('particle');
	const nounChirho = tokenChirho({
		gender_chirho: 'masculine',
		number_chirho: 'plural',
		state_chirho: 'construct'
	});
	expectChirho(morphologySummaryLocalizedChirho(nounChirho, 'es')).toBe(
		'sustantivo; género masculino; número plural; estado constructo'
	);
});

testChirho('verb constructions read as words rather than source keys', () => {
	const participleChirho = tokenChirho({
		pos_chirho: 'verb',
		gender_chirho: 'masculine',
		number_chirho: 'singular',
		state_chirho: 'absolute',
		verb_form_chirho: 'participle_active',
		verb_stem_chirho: 'niphal'
	});
	expectChirho(morphologySummaryLocalizedChirho(participleChirho, 'en')).toBe(
		'verb; gender masculine; number singular; state absolute; niphal active participle'
	);
	expectChirho(morphologySummaryLocalizedChirho(participleChirho, 'es')).toBe(
		'verbo; género masculino; número singular; estado absoluto; niphal participio activo'
	);
	const wawQatalChirho = tokenChirho({
		pos_chirho: 'verb',
		gender_chirho: 'masculine',
		number_chirho: 'singular',
		state_chirho: 'na',
		verb_form_chirho: 'qatal',
		verb_stem_chirho: 'qal',
		verb_construction_chirho: 'qatal_copulative'
	});
	expectChirho(morphologySummaryLocalizedChirho(wawQatalChirho, 'en')).toBe(
		'verb; gender masculine; number singular; qal waw + qatal'
	);
});

testChirho('the screen-reader label keeps every field, including not applicable', () => {
	const particleChirho = tokenChirho({
		pos_chirho: 'particle',
		gender_chirho: 'na',
		number_chirho: 'na',
		state_chirho: 'na'
	});
	expectChirho(morphologyLabelLocalizedChirho(particleChirho, 'en')).toBe(
		'particle; gender not applicable; number not applicable; state not applicable'
	);
});
