// For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life. — John 3:16 (KJV)

import type { LocaleChirho } from './locale-chirho';

// Spanish for the Hebrew reading key and the Greek key. The English stays with its data; these
// entries are keyed by each item's stable id (rows by their English label). An entry missing
// here shows the English, marked lang="en", and the coverage test names it. The Hebrew help
// text adapts unfoldingWord Hebrew Grammar, as the reader's source notes say.
export interface LegendTextChirho {
	label_chirho: string;
	help_chirho: string;
	lang_chirho: LocaleChirho;
}

const SPANISH_ROWS_CHIRHO: Readonly<Record<string, string>> = {
	Gender: 'Género',
	Number: 'Número',
	'Noun state': 'Estado del sustantivo',
	'Verb stem LEFT': 'Tema verbal IZQUIERDA',
	'Verb conjugation RIGHT': 'Conjugación verbal DERECHA',
	'Icon outline POS': 'Contorno del icono: clase de palabra',
	'Form pattern': 'Patrón de forma',
	'Word kind': 'Clase de palabra',
	'Case · center': 'Caso · centro',
	'Verb tense · left': 'Tiempo verbal · izquierda',
	'Verb voice · left, lowercase': 'Voz verbal · izquierda, minúscula',
	'Person · right': 'Persona · derecha',
	'Verb mood · right': 'Modo verbal · derecha'
};

const SPANISH_ITEMS_CHIRHO: Readonly<
	Record<string, readonly [labelChirho: string, helpChirho: string]>
> = {
	'masculine-chirho': [
		'Masculino',
		'El azul marca el género gramatical masculino según la fuente. El género gramatical no establece el sexo del referente.'
	],
	'feminine-chirho': [
		'Femenino',
		'El rosa marca el género gramatical femenino según la fuente. Es independiente del número y de la clase de palabra.'
	],
	'clear-chirho': [
		'Ambos / común',
		'Un fondo transparente marca el género ambos/común según la fuente. Los detalles de la palabra lo distinguen de desconocido o no aplica.'
	],
	'unknown-gender-chirho': [
		'No aplica / desconocido',
		'No aplica y desconocido también tienen fondo transparente, pero siguen siendo categorías distintas en los detalles de la palabra. Ninguno significa masculino ni ambos.'
	],
	'plural-chirho': [
		'Plural',
		'Una línea amarilla bajo la palabra marca el número plural según la fuente. El icono tiene su propio contorno.'
	],
	'dual-chirho': [
		'Dual',
		'Una línea verde bajo la palabra marca el número dual según la fuente, a menudo asociado con un par.'
	],
	'unmarked-chirho': [
		'Sin línea',
		'El singular, no aplica y desconocido no tienen línea de número. La sola ausencia de línea no afirma que la palabra sea singular.'
	],
	'absolute-chirho': [
		'i · absoluto',
		'Una i romana minúscula centrada marca un sustantivo en estado absoluto. Aquí solo los sustantivos reciben este superíndice; el estado de los adjetivos queda en los detalles.'
	],
	'construct-chirho': [
		'ii · constructo',
		'Una ii romana minúscula centrada marca un sustantivo en estado constructo, usado en una construcción que lo une con lo que sigue. La determinación y la posesión no son estados adicionales.'
	],
	'qal-chirho': [
		'1 Qal',
		'El tema básico puede expresar acciones o estados. No siempre corresponde a un verbo activo en la traducción. 1 es nuestro código local, colocado arriba a la izquierda del verbo.'
	],
	'niphal-chirho': [
		'2 Niphal',
		'A menudo pasivo o medio, con variación léxica. Revise el verbo concreto y el contexto.'
	],
	'piel-chirho': [
		'3 Piel',
		'Un tema con funciones léxicas variadas. No es un intensivo universal ni una acción más fuerte.'
	],
	'pual-chirho': [
		'4 Pual',
		'A menudo la contraparte pasiva del Piel. El significado real depende del verbo.'
	],
	'hiphil-chirho': [
		'5 Hiphil',
		'A menudo causativo, pero el contexto y el significado léxico siguen importando.'
	],
	'hophal-chirho': ['6 Hophal', 'A menudo causativo pasivo, comúnmente relacionado con el Hiphil.'],
	'hithpael-chirho': [
		'7 Hithpael',
		'A menudo reflexivo o medio, y a veces recíproco. También tiene otras funciones léxicas.'
	],
	'qatal-chirho': [
		'P qatal',
		'Tradicionalmente llamado perfecto. El qatal no es un interruptor automático de tiempo pasado; el contexto determina su uso. P es un código didáctico local, colocado arriba a la derecha del verbo.'
	],
	'yiqtol-chirho': [
		'I yiqtol',
		'Tradicionalmente llamado imperfecto. El yiqtol no es un interruptor automático de tiempo futuro. La I es distinta de la M del imperativo. Una waw sola no establece un wayyiqtol.'
	],
	'imperative-chirho': [
		'M imperativo',
		'Una forma usada comúnmente en mandatos o peticiones. La M debe mantenerse distinta de la I del yiqtol.'
	],
	'participle-chirho': [
		'A participio',
		'Un participio conserva su tema; 1A significa un participio Qal. Aquí la conjugación verbal es un grupo didáctico amplio: las conjugaciones finitas, más los participios e infinitivos no finitos. Su función en la oración sigue dependiendo del contexto.'
	],
	'infinitive-construct-chirho': [
		'C infinitivo constructo',
		'Una forma verbal no finita con varios usos sintácticos. Es una forma verbal, no el numeral ii del estado del sustantivo.'
	],
	'infinitive-absolute-chirho': [
		'B infinitivo absoluto',
		'Una forma verbal no finita que puede enfatizar o matizar de otro modo una acción. Es distinta del estado absoluto i del sustantivo.'
	],
	'weqatal-chirho': [
		'W weqatal',
		'La conjugación de perfecto secuencial se conecta con un verbo anterior en una secuencia de tiempo o de pensamiento. Su uso depende del contexto, no de un tiempo verbal fijo de la traducción. Puede parecerse a una waw + qatal ordinaria, así que el lector conserva la clasificación de la fuente en lugar de adivinarla a partir de la waw.'
	],
	'wayyiqtol-chirho': [
		'Y wayyiqtol',
		'La conjugación de imperfecto secuencial suele hacer avanzar una secuencia narrativa. Tiene un patrón especial de waw y es distinta de una waw + yiqtol ordinaria. Este nombre completo requiere morfología de la fuente; la sola presencia de la waw no lo establece.'
	],
	'weyiqtol-chirho': [
		'E weyiqtol',
		'Waw conjuntiva ordinaria + yiqtol, con el yiqtol conservado como forma subyacente. Es distinta del wayyiqtol secuencial y por sí sola no asigna un tiempo verbal de la traducción. Esta etiqueta completa solo aparece cuando la fuente documenta explícitamente la construcción.'
	],
	'jussive-chirho': [
		'J yusivo',
		'Una forma volitiva que expresa deseos, mandatos indirectos y significados afines según el contexto. Suele ser de tercera persona, pero las formas de segunda persona pueden expresar mandatos negativos. Puede parecerse al yiqtol; la clasificación de yusivo de la fuente se mantiene distinta tanto de la I del yiqtol como de la M del imperativo.'
	],
	'cohortative-chirho': [
		'O cohortativo',
		'Una forma volitiva de primera persona que expresa peticiones, intenciones, deseos o significados afines según el contexto. Se parece al yiqtol, pero conserva su propia clasificación de la fuente y el código didáctico local O.'
	],
	'qatal-copulative-chirho': [
		'Q waw + qatal',
		'Un qatal unido por una waw copulativa ordinaria. Es distinto del weqatal secuencial aun cuando las formas escritas se parecen. El contexto y la clasificación registrada en la fuente determinan la distinción; una waw prefijada no basta.'
	],
	'noun-chirho': [
		'Sustantivo',
		'Un contorno redondeado verde azulado en el icono marca la palabra como sustantivo. El contorno codifica la clase de palabra, no el género.'
	],
	'verb-chirho': [
		'Verbo',
		'Un contorno redondeado morado marca un verbo, incluidos los participios en este esquema didáctico.'
	],
	'adjective-chirho': [
		'Adjetivo',
		'Un contorno redondeado naranja marca un adjetivo. Un encabezado nominal del diccionario no prevalece sobre la morfología propia del versículo.'
	],
	'particle-chirho': [
		'Partícula',
		'Un contorno redondeado gris marca una partícula. La morfología original propia del versículo sigue visible en los detalles.'
	],
	'unknown-pos-chirho': [
		'Desconocido',
		'Un contorno gris discontinuo marca una clase de palabra sin resolver. No hace ninguna afirmación gramatical.'
	],
	'exceptional-chirho': [
		'Continua · excepcional',
		'Una línea naranja continua sobre una palabra requiere una forma excepcional o supletiva documentada, una explicación y una fuente. Una ortografía inusual o una raíz sin resolver nunca bastan por sí solas para esta marca.'
	],
	'weak-chirho': [
		'Punteada · débil predecible',
		'Una línea naranja punteada sobre una palabra requiere una explicación documentada del patrón real, predecible, débil o de cambio de forma. Los patrones débiles no son automáticamente excepcionales.'
	],
	'greek-noun-chirho': [
		'Sustantivo',
		'Un sustantivo nombra una persona, un lugar, una cosa o una idea.'
	],
	'greek-verb-chirho': ['Verbo', 'Un verbo expresa una acción o un estado.'],
	'greek-adjective-chirho': ['Adjetivo', 'Un adjetivo describe o califica a un sustantivo.'],
	'greek-particle-chirho': [
		'Partícula o conector',
		'Este contorno también agrupa preposiciones, conjunciones y adverbios.'
	],
	'greek-pronoun-chirho': [
		'Pronombre · contorno redondo discontinuo',
		'Un pronombre sustituye o señala a una persona o cosa. La fuente indica su clase concreta.'
	],
	'greek-article-chirho': [
		'Artículo · contorno redondo',
		'El artículo acompaña o identifica una palabra; su forma tiene caso, número y género.'
	],
	'greek-masculine-chirho': [
		'Masculino',
		'El azul marca el género gramatical masculino según el análisis de la fuente.'
	],
	'greek-feminine-chirho': [
		'Femenino',
		'El rosa marca el género gramatical femenino según el análisis de la fuente.'
	],
	'greek-neuter-chirho': [
		'Neutro',
		'El gris marca el género gramatical neutro según el análisis de la fuente.'
	],
	'greek-no-gender-chirho': [
		'Desconocido o no aplica · transparente',
		'Un fondo transparente indica que no hay una indicación de género disponible o aplicable.'
	],
	'greek-plural-chirho': [
		'Plural · subrayado amarillo',
		'El subrayado amarillo marca un análisis de la fuente con número plural.'
	],
	'greek-other-number-chirho': [
		'Otro o desconocido · sin subrayado',
		'No se subraya el número singular, desconocido o no aplicable.'
	],
	'greek-case-i-chirho': ['i nominativo', 'Caso nominativo, según el análisis de la fuente.'],
	'greek-case-ii-chirho': ['ii genitivo', 'Caso genitivo, según el análisis de la fuente.'],
	'greek-case-iii-chirho': ['iii dativo', 'Caso dativo, según el análisis de la fuente.'],
	'greek-case-iv-chirho': ['iv acusativo', 'Caso acusativo, según el análisis de la fuente.'],
	'greek-case-v-chirho': ['v vocativo', 'Caso vocativo, según el análisis de la fuente.'],
	'greek-tense-p-chirho': ['P presente', 'La fuente analiza una forma de tiempo presente.'],
	'greek-tense-i-chirho': ['I imperfecto', 'La fuente analiza una forma de tiempo imperfecto.'],
	'greek-tense-f-chirho': ['F futuro', 'La fuente analiza una forma de tiempo futuro.'],
	'greek-tense-2f-chirho': [
		'2F segundo futuro',
		'La fuente distingue una forma de segundo futuro.'
	],
	'greek-tense-a-chirho': ['A aoristo', 'La fuente analiza una forma de tiempo aoristo.'],
	'greek-tense-2a-chirho': [
		'2A segundo aoristo',
		'La fuente distingue una forma de segundo aoristo.'
	],
	'greek-tense-r-chirho': ['R perfecto', 'La fuente analiza una forma de tiempo perfecto.'],
	'greek-tense-2r-chirho': [
		'2R segundo perfecto',
		'La fuente distingue una forma de segundo perfecto.'
	],
	'greek-tense-l-chirho': [
		'L pluscuamperfecto',
		'La fuente analiza una forma de tiempo pluscuamperfecto.'
	],
	'greek-tense-2l-chirho': [
		'2L segundo pluscuamperfecto',
		'La fuente distingue una forma de segundo pluscuamperfecto.'
	],
	'greek-voice-a-chirho': ['a activa', 'Voz activa en el análisis de la fuente.'],
	'greek-voice-m-chirho': ['m media', 'Voz media en el análisis de la fuente.'],
	'greek-voice-p-chirho': ['p pasiva', 'Voz pasiva en el análisis de la fuente.'],
	'greek-voice-e-chirho': [
		'e media o pasiva',
		'La fuente deja sin resolver la voz media o pasiva.'
	],
	'greek-voice-d-chirho': [
		'd media deponente',
		'La fuente la clasifica como media deponente; la indicación conserva esa clasificación.'
	],
	'greek-voice-o-chirho': [
		'o pasiva deponente',
		'La fuente la clasifica como pasiva deponente; la indicación conserva esa clasificación.'
	],
	'greek-voice-n-chirho': [
		'n media o pasiva deponente',
		'La fuente la clasifica como media o pasiva deponente sin elegir entre ambas.'
	],
	'greek-person-1-chirho': [
		'1 primera',
		'Primera persona en el análisis de la fuente. El número se muestra aparte con el subrayado de la palabra.'
	],
	'greek-person-2-chirho': [
		'2 segunda',
		'Segunda persona en el análisis de la fuente. El número se muestra aparte con el subrayado de la palabra.'
	],
	'greek-person-3-chirho': [
		'3 tercera',
		'Tercera persona en el análisis de la fuente. El número se muestra aparte con el subrayado de la palabra.'
	],
	'greek-mood-i-chirho': ['I indicativo', 'Una forma indicativa, según el análisis de la fuente.'],
	'greek-mood-s-chirho': ['S subjuntivo', 'Una forma subjuntiva, según el análisis de la fuente.'],
	'greek-mood-m-chirho': ['M imperativo', 'Una forma imperativa, según el análisis de la fuente.'],
	'greek-mood-n-chirho': [
		'N infinitivo',
		'Una forma de infinitivo; no tiene indicación de persona finita.'
	],
	'greek-mood-p-chirho': [
		'P participio',
		'Un participio. Su caso documentado aparece en el centro; no tiene indicación de persona finita.'
	]
};

export function legendItemTextChirho(
	itemChirho: { id_chirho: string; label_chirho: string; help_chirho: string },
	localeChirho: LocaleChirho
): LegendTextChirho {
	const spanishChirho = localeChirho === 'es' ? SPANISH_ITEMS_CHIRHO[itemChirho.id_chirho] : null;
	return spanishChirho
		? { label_chirho: spanishChirho[0], help_chirho: spanishChirho[1], lang_chirho: 'es' }
		: {
				label_chirho: itemChirho.label_chirho,
				help_chirho: itemChirho.help_chirho,
				lang_chirho: 'en'
			};
}

export function legendRowTextChirho(
	labelChirho: string,
	localeChirho: LocaleChirho
): { label_chirho: string; lang_chirho: LocaleChirho } {
	const spanishChirho = localeChirho === 'es' ? SPANISH_ROWS_CHIRHO[labelChirho] : undefined;
	return spanishChirho
		? { label_chirho: spanishChirho, lang_chirho: 'es' }
		: { label_chirho: labelChirho, lang_chirho: 'en' };
}
