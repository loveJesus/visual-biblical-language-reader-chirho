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
		'Una clase gramatical marcada en azul. Los adjetivos, pronombres y formas verbales relacionadas pueden concordar con un sustantivo masculino en género y número. La concordancia ayuda a reconocer qué palabras se relacionan.'
	],
	'feminine-chirho': [
		'Femenino',
		'Una clase gramatical marcada en rosa. Los adjetivos, pronombres y formas verbales relacionadas pueden concordar con un sustantivo femenino en género y número. La concordancia ayuda a reconocer qué palabras se relacionan.'
	],
	'clear-chirho': [
		'Ambos / común',
		'Una forma que puede tener referencia masculina o femenina, como algunas formas verbales de primera persona, «yo» o «nosotros». Su fondo es transparente. Los detalles indican el género exacto según la fuente.'
	],
	'unknown-gender-chirho': [
		'No aplica / desconocido',
		'No aplica y desconocido también tienen fondo transparente, pero siguen siendo categorías distintas en los detalles de la palabra. Ninguno significa masculino ni ambos.'
	],
	'plural-chirho': [
		'Plural',
		'Más de uno, como «reyes», «ellos» o «nosotros». La línea amarilla bajo la palabra marca el plural. El contorno de la imagen indica por separado la clase de palabra.'
	],
	'dual-chirho': [
		'Dual',
		'Una forma de número que suele indicar dos o un par natural, como manos u ojos. La línea verde bajo la palabra marca el dual. La palabra concreta y la oración determinan la cantidad.'
	],
	'unmarked-chirho': [
		'Sin línea',
		'El singular, no aplica y desconocido no tienen línea de número. La sola ausencia de línea no afirma que la palabra sea singular.'
	],
	'absolute-chirho': [
		'i · absoluto',
		'La forma habitual de un sustantivo cuando se usa por sí mismo, como «rey». En una cadena como «el rey de Israel», el último sustantivo suele estar en absoluto. Aquí se marca con una i centrada.'
	],
	'construct-chirho': [
		'ii · constructo',
		'Une un sustantivo con lo que sigue, a menudo mediante «de» en español, como «la palabra de Dios» o «el rey de Israel». Un sufijo puede señalar la persona relacionada, como «su palabra». Se marca con ii.'
	],
	'qal-chirho': [
		'1 Qal',
		'El tema verbal básico del hebreo, un patrón de consonantes de la raíz y vocales. Puede expresar una acción, como «escribió», o un estado, como «era grande». El verbo concreto y el contexto dan el significado.'
	],
	'niphal-chirho': [
		'2 Niphal',
		'A menudo describe al sujeto recibiendo una acción o experimentando un cambio, como «fue guardado». También puede expresar la participación del propio sujeto, como «se reunieron». El verbo concreto determina el sentido.'
	],
	'piel-chirho': [
		'3 Piel',
		'Un tema verbal que a menudo duplica la consonante central de la raíz. Su significado varía según el verbo, como «hablar» o «enseñar», y puede expresar un resultado o una acción intensificada. Consulte el verbo en su contexto.'
	],
	'pual-chirho': [
		'4 Pual',
		'Suele expresar la recepción de una acción Piel, como «fue enseñado». El sujeto experimenta la acción. El sentido preciso depende del verbo.'
	],
	'hiphil-chirho': [
		'5 Hiphil',
		'Suele expresar que alguien hace actuar a otra persona o cosa, o la lleva a un estado, como «hizo entrar» a partir de «entrar». Algunos verbos tienen sentidos más específicos en este tema.'
	],
	'hophal-chirho': [
		'6 Hophal',
		'Suele expresar la recepción de una acción causada, como «fue introducido». A menudo corresponde al Hiphil, donde alguien hace que ocurra esa acción.'
	],
	'hithpael-chirho': [
		'7 Hithpael',
		'Suele describir al sujeto actuando sobre sí mismo, como «se escondió», o a varias personas actuando unas con otras. Algunos verbos tienen otros sentidos, por lo que el verbo concreto y la oración orientan la traducción.'
	],
	'qatal-chirho': [
		'P qatal',
		'Tradicionalmente llamado perfecto. Suele presentar una acción como completa o un estado como establecido, como «escribió» o «ha escrito». La oración determina si la referencia temporal es pasada, presente o futura.'
	],
	'yiqtol-chirho': [
		'I yiqtol',
		'Tradicionalmente llamado imperfecto. Suele describir una acción en desarrollo, repetida, posible o futura, como «escribe», «puede escribir» o «escribirá». La oración determina su tiempo y sentido.'
	],
	'imperative-chirho': [
		'M imperativo',
		'Se dirige a alguien con una orden, instrucción o petición, como «¡escucha!» o «danos pan». La forma indica si se habla a una persona o a varias.'
	],
	'participle-chirho': [
		'A participio',
		'Una forma verbal que puede describir una acción o a quien la realiza, como «guardando» o «el que guarda». Puede funcionar como verbo, adjetivo o sustantivo. El tema y el contexto orientan su sentido.'
	],
	'infinitive-construct-chirho': [
		'C infinitivo constructo',
		'Una forma verbal que puede nombrar una acción o relacionarla con otra, como «guardar», «para guardar» o «al guardar». Suele seguir a una preposición y puede llevar un sufijo.'
	],
	'infinitive-absolute-chirho': [
		'B infinitivo absoluto',
		'Una forma verbal que puede enfatizar otro verbo, como «ciertamente morirás», o describir cómo se realiza una acción. La oración determina su función.'
	],
	'weqatal-chirho': [
		'W weqatal',
		'Waw más qatal usado para continuar una secuencia de sucesos o de pensamiento. Suele desarrollar instrucciones o una situación futura, como «entonces harás...». La oración determina su referencia temporal.'
	],
	'wayyiqtol-chirho': [
		'Y wayyiqtol',
		'Una forma verbal que suele hacer avanzar un relato, como «y dijo» o «entonces fue». Su patrón especial de waw ayuda a marcar el siguiente suceso narrado.'
	],
	'weyiqtol-chirho': [
		'E weyiqtol',
		'Una «y» ordinaria unida a yiqtol, como «y hará» o «y puede hacer». El yiqtol conserva su propio sentido, determinado por la oración.'
	],
	'jussive-chirho': [
		'J yusivo',
		'Expresa un deseo, permiso o mandato indirecto, como «que vaya» o «que sea». Suele ser de tercera persona. Con una negación también puede pedir a alguien que se abstenga de una acción.'
	],
	'cohortative-chirho': [
		'O cohortativo',
		'Una forma de primera persona que expresa intención, petición o decisión de quien habla, como «déjeme ir» o «vayamos». La terminación y la oración ayudan a determinar su sentido.'
	],
	'qatal-copulative-chirho': [
		'Q waw + qatal',
		'Una «y» ordinaria unida a qatal, como «y escribió». La conjunción enlaza la oración con lo anterior. El contexto determina su referencia temporal.'
	],
	'noun-chirho': [
		'Sustantivo',
		'Nombra una persona, lugar, cosa o idea, como «rey», «Jerusalén» o «sabiduría». Un contorno verde azulado alrededor de la imagen marca esta clase de palabra.'
	],
	'verb-chirho': [
		'Verbo',
		'Expresa una acción o un estado, como «escribió» o «era grande». Un contorno morado marca los verbos, incluidos los participios en esta clave de lectura.'
	],
	'adjective-chirho': [
		'Adjetivo',
		'Describe un sustantivo, como «buena» en «una palabra buena». Su forma suele concordar con el sustantivo en género y número. Un contorno naranja marca esta clase de palabra.'
	],
	'particle-chirho': [
		'Partícula',
		'Una palabra breve que enlaza o matiza otras palabras, como «y», «en» o «porque». El contorno gris agrupa estas palabras; los detalles indican su clase concreta.'
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
		'Una clase gramatical marcada en azul. Los artículos y adjetivos toman formas concordantes cuando acompañan a un sustantivo masculino. El género del sustantivo orienta esa concordancia.'
	],
	'greek-feminine-chirho': [
		'Femenino',
		'Una clase gramatical marcada en rosa. Los artículos y adjetivos toman formas concordantes cuando acompañan a un sustantivo femenino. El género del sustantivo orienta esa concordancia.'
	],
	'greek-neuter-chirho': [
		'Neutro',
		'Una clase gramatical marcada en gris. Los artículos y adjetivos toman formas concordantes cuando acompañan a un sustantivo neutro. El género del sustantivo orienta esa concordancia.'
	],
	'greek-no-gender-chirho': [
		'Desconocido o no aplica · transparente',
		'Un fondo transparente indica que no hay una indicación de género disponible o aplicable.'
	],
	'greek-plural-chirho': [
		'Plural · subrayado amarillo',
		'Más de uno, como en «personas», «ellos» o «nosotros». El subrayado amarillo marca sustantivos, palabras relacionadas y formas verbales en plural.'
	],
	'greek-other-number-chirho': [
		'Otro o desconocido · sin subrayado',
		'No se subraya el número singular, desconocido o no aplicable.'
	],
	'greek-case-i-chirho': [
		'i nominativo',
		'Suele marcar el sujeto, la persona o cosa que actúa o de la que se dice algo. También aparece con verbos de enlace, como en «el Verbo era Dios», donde ambos sustantivos están en nominativo.'
	],
	'greek-case-ii-chirho': [
		'ii genitivo',
		'Suele relacionar un sustantivo con otra palabra, como «de Dios» o «el libro de Juan». Puede expresar posesión, una parte de algo, origen u otras relaciones. El contexto determina la conexión.'
	],
	'greek-case-iii-chirho': [
		'iii dativo',
		'Suele indicar quién recibe algo o a quién afecta la acción, como «a él» o «para ella». También expresa medio, lugar o tiempo, como «en el principio». El verbo o la preposición orientan su función.'
	],
	'greek-case-iv-chirho': [
		'iv acusativo',
		'Suele marcar el complemento directo, la persona o cosa a la que llega la acción, como «lo» en «ella lo vio». Con preposiciones también expresa dirección u otras relaciones.'
	],
	'greek-case-v-chirho': [
		'v vocativo',
		'Se usa para dirigirse directamente a alguien, como «¡Señor!» o «¡Maestro!». Identifica a la persona a quien se habla.'
	],
	'greek-tense-p-chirho': [
		'P presente',
		'Presenta una acción en desarrollo o repetida, como «está enseñando» o «enseña». En indicativo suele referirse al presente.'
	],
	'greek-tense-i-chirho': [
		'I imperfecto',
		'Presenta una acción en desarrollo o repetida en el pasado, como «estaba enseñando» o «solía enseñar». A menudo da el trasfondo de un relato.'
	],
	'greek-tense-f-chirho': [
		'F futuro',
		'Suele referirse a lo que sucederá, como «enseñará». La oración también puede darle el sentido de una promesa o una orden.'
	],
	'greek-tense-2f-chirho': [
		'2F segundo futuro',
		'Una formación alternativa del futuro, a menudo con otra raíz o terminación. Como las demás formas de futuro, suele referirse a lo que sucederá.'
	],
	'greek-tense-a-chirho': [
		'A aoristo',
		'Presenta un acontecimiento en su conjunto, como «enseñó». En indicativo suele referirse al pasado. En otras formas verbales, la oración determina la referencia temporal.'
	],
	'greek-tense-2a-chirho': [
		'2A segundo aoristo',
		'Una formación alternativa del aoristo, con otra raíz. Presenta un acontecimiento en su conjunto, con el mismo sentido básico que las demás formas de aoristo.'
	],
	'greek-tense-r-chirho': [
		'R perfecto',
		'Destaca un estado que resulta de una acción anterior, como «ha escrito» o «está escrito». En indicativo, el estado resultante suele mantenerse en el presente.'
	],
	'greek-tense-2r-chirho': [
		'2R segundo perfecto',
		'Una formación alternativa del perfecto. Como las demás formas de perfecto, destaca un estado que resulta de una acción anterior.'
	],
	'greek-tense-l-chirho': [
		'L pluscuamperfecto',
		'Describe un estado resultante de una acción anterior, visto desde un momento del pasado, como «había escrito».'
	],
	'greek-tense-2l-chirho': [
		'2L segundo pluscuamperfecto',
		'Una formación alternativa del pluscuamperfecto. Como las demás formas de este tiempo, contempla un estado resultante desde un momento del pasado.'
	],
	'greek-voice-a-chirho': [
		'a activa',
		'El sujeto realiza la acción o se encuentra en el estado que expresa el verbo, como «ella enseña» o «él está de pie».'
	],
	'greek-voice-m-chirho': [
		'm media',
		'El sujeto participa en su propia acción o resulta afectado por ella, como «él se lava» o «ella prepara algo para sí». El significado del verbo orienta la traducción.'
	],
	'greek-voice-p-chirho': [
		'p pasiva',
		'El sujeto recibe o experimenta la acción, como «él es enseñado». La oración también puede indicar quién realiza la acción.'
	],
	'greek-voice-e-chirho': [
		'e media o pasiva',
		'Estas terminaciones pueden expresar participación media, como «se lava», o recepción pasiva, como «es lavado». El verbo y el contexto determinan el sentido.'
	],
	'greek-voice-d-chirho': [
		'd media deponente',
		'Una forma media de un verbo llamado tradicionalmente deponente. Estos verbos suelen traducirse con voz activa en español, como «vengo». Su significado propio orienta la traducción.'
	],
	'greek-voice-o-chirho': [
		'o pasiva deponente',
		'Una forma pasiva de un verbo llamado tradicionalmente deponente. Estas formas suelen describir una acción o experiencia del sujeto, como «fui». Su significado propio orienta la traducción.'
	],
	'greek-voice-n-chirho': [
		'n media o pasiva deponente',
		'Una forma con terminaciones compartidas de media y pasiva, llamada tradicionalmente deponente. Suele traducirse con voz activa en español. El verbo y el contexto determinan el sentido.'
	],
	'greek-person-1-chirho': [
		'1 primera',
		'Incluye a quien habla, como «yo» en singular o «nosotros» en plural. El subrayado amarillo marca el plural.'
	],
	'greek-person-2-chirho': [
		'2 segunda',
		'La persona a quien se habla, como «tú» o «vosotros». El subrayado amarillo marca el plural. La traducción también puede usar «usted» o «ustedes» según el trato.'
	],
	'greek-person-3-chirho': [
		'3 tercera',
		'La persona o cosa de la que se habla, como «él», «ella», «ello», «ellos» o «ellas». El subrayado amarillo marca el plural.'
	],
	'greek-mood-i-chirho': [
		'I indicativo',
		'Presenta una acción o un estado como una afirmación, o pregunta por ellos, como «él enseña» o «¿enseña él?».'
	],
	'greek-mood-s-chirho': [
		'S subjuntivo',
		'Se usa para posibilidades, propósitos, condiciones y exhortaciones, como «enseñe», «para que enseñe» o «vayamos». La oración determina su sentido.'
	],
	'greek-mood-m-chirho': [
		'M imperativo',
		'Expresa una orden, petición o instrucción, como «¡escucha!» o «danos pan».'
	],
	'greek-mood-n-chirho': [
		'N infinitivo',
		'Una forma verbal que puede nombrar una actividad o completar otro verbo, como «enseñar» o «quiere enseñar».'
	],
	'greek-mood-p-chirho': [
		'P participio',
		'Una forma verbal que puede describir a una persona o cosa, como «el que enseña», o expresar circunstancias, como «mientras enseña». Su caso, número y género lo relacionan con la palabra que describe.'
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
