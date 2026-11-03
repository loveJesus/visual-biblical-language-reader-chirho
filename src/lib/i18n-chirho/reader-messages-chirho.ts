// For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life. — John 3:16 (KJV)

import { localeStateChirho } from './locale-state-chirho.svelte';
import type { SpanishLayerResultChirho } from './spanish-glosses-chirho';
import { defineCatalogueChirho, translateChirho } from './translate-chirho';

// Reader chrome, navigation and accessibility text. Hebrew/Greek source text is never here.
export const readerCatalogueChirho = defineCatalogueChirho({
	en: {
		nav_label_chirho: 'Choose a passage',
		book_chirho: 'Book',
		high_quality_books_chirho: 'High-quality illustrations',
		other_books_chirho: 'More books',
		chapter_chirho: 'Chapter',
		verse_chirho: 'Verse',
		language_chirho: 'Language',
		loading_chirho: 'Loading {book_chirho} {chapter_chirho}:{verse_chirho}…',
		retry_chirho: 'Retry',
		error_chapters_chirho: 'The chapter list could not be loaded. Please try again.',
		error_verse_chirho: 'This verse could not be loaded or verified. Please try again.',
		error_book_chirho: 'This book could not be loaded or verified. Please try again.',
		art_progress_chirho:
			'{book_chirho} artwork: {scenes_chirho} scenes · {lemmas_chirho} word pictures',
		previous_verse_chirho: 'Previous verse',
		previous_chirho: 'Previous',
		next_verse_chirho: 'Next verse',
		next_chirho: 'Next',
		meta_hebrew_chirho:
			'Read Biblical Hebrew with a scene, compact grammar cues and meanings you can reveal when you are ready.',
		home_label_chirho: 'Hinneh home',
		tagline_chirho: 'See. Notice. Read.',
		badge_hebrew_chirho: 'Biblical Hebrew · Preview',
		eyebrow_hebrew_chirho: 'Biblical Hebrew · Read with understanding',
		kjv_numbering_chirho: 'Hebrew verse numbering · English Bible: {reference_chirho}',
		reading_grid_hebrew_chirho: 'Hebrew verse and imaginative scene',
		read_rtl_chirho: 'Read from right to left. Take your time.',
		show_translation_chirho: 'Show translation',
		app_gloss_note_chirho: 'App-authored English learning gloss.',
		gbt_order_note_chirho:
			'Approved in Global Bible Tools export. Word glosses in Hebrew order, not a sentence translation.',
		language_order_note_chirho:
			'Approved in Global Bible Tools export · {label_chirho}. Word glosses in Hebrew order, not a sentence translation. File last changed {date_chirho}.',
		scene_missing_chirho:
			'The scene is unavailable. You can still read the preserved text and its grammar cues.',
		scene_awaiting_1_chirho: 'Read the words.',
		scene_awaiting_2_chirho: 'Picture the wisdom.',
		scene_awaiting_note_chirho: 'An illustration is being prepared for this passage.',
		scene_caption_chirho: 'An imaginative learning aid',
		scene_caption_sub_chirho: 'A visual reflection on the verse',
		grammar_fallback_chirho: 'Grammar cues follow the preserved source morphology.',
		words_eyebrow_chirho: 'One word at a time',
		words_heading_chirho: 'Look a little closer.',
		meaning_language_chirho: 'Meaning language',
		option_app_chirho: 'English · app learning gloss',
		option_gbt_chirho: '{label_chirho} · GBT approved export',
		cards_open_note_chirho: 'Word meanings and morphology are open in the cards below.',
		lemma_open_chirho: 'Open verified lemma entry',
		lemma_unverified_chirho: 'Lemma link unverified',
		root_not_applicable_chirho: 'Not applicable',
		root_traditional_chirho: 'Traditional',
		root_unresolved_chirho: 'Unresolved',
		root_relationship_chirho: 'Root relationship',
		meaning_morphology_chirho: 'Meaning & morphology',
		gloss_unavailable_chirho: 'A reviewed word meaning is not available yet.',
		origin_gbt_chirho: 'Approved in Global Bible Tools export',
		origin_app_chirho: 'App-authored learning gloss',
		origin_unavailable_chirho: 'Meaning unavailable',
		language_approved_chirho: 'Approved in Global Bible Tools export · {label_chirho}',
		qere_label_chirho: 'Reading (qere)',
		qere_note_chirho: 'The reading is preserved separately from the written text (ketiv) above.',
		source_eyebrow_chirho: 'Grounded in the source',
		source_heading_chirho: 'Keep the text. Keep the context.',
		reveal_canonical_hebrew_chirho: 'Reveal the exact canonical Hebrew',
		canonical_note_chirho:
			'This is the preserved source text, without teaching dots, superscripts or icon placeholders. Select it to copy.',
		root_lemma_note_chirho:
			'Root and lemma are different. A traditional lexical relationship is not a claim of certain historical origin. Illustrations are learning aids; the original text and its sourced morphology guide the reading.',
		sources_summary_chirho: 'Sources, licenses & grammar references',
		export_line_chirho:
			'Export {exported_chirho}; file last changed {updated_chirho}. Revision {revision_chirho}; SHA-256 {sha_chirho}.',
		revision_chirho: 'Revision {revision_chirho}',
		uhg_note_chirho:
			'Grammar explanations adapt unfoldingWord Hebrew Grammar, © 2021 unfoldingWord, under {license_chirho}. They are condensed and reworded; the adapted explanations are shared under the same license. The numeric and letter codes, colors and layout are Hinneh’s teaching conventions. No endorsement is implied.',
		footer_note_chirho: 'A small beginning in the language of Scripture.',
		credit_hebrew_rest_chirho:
			'Lexical files: Open Scriptures Hebrew Bible Project. Morphology and lexical files are used under {license_chirho} and adapted here into word spans, grammar cues and source notes. The Hebrew text is public domain. No endorsement is implied.',
		credit_greek_chirho:
			'Greek text: Nestle 1904 (public domain). Morphology and lemmas: Ulrik Sandborg-Petersen and biblicalhumanities.org (CC0). English glosses: Berean Interlinear Bible, via biblicalhumanities.org; see the {terms_chirho}.',
		public_domain_terms_chirho: 'public-domain terms',
		spanish_gloss_approved_chirho: 'Spanish gloss approved in the Global Bible Tools export',
		spanish_gloss_missing_chirho: 'No approved Spanish gloss for this word in the pinned export.',
		spanish_layer_unavailable_chirho: 'Spanish glosses are not available for this chapter.',
		spanish_order_note_chirho:
			'Spanish word glosses approved in the Global Bible Tools export, in Hebrew order; not a sentence translation.',
		spanish_layer_stale_chirho:
			'Spanish glosses are withheld for this chapter: its text changed after they were prepared.',
		meta_greek_chirho:
			'Read Biblical Greek with grammar cues and word meanings to reveal when you are ready.',
		badge_greek_chirho: 'Biblical Greek · Preview',
		eyebrow_greek_chirho: 'Biblical Greek · Read with understanding',
		reading_grid_greek_chirho: 'Greek verse and imaginative scene',
		read_ltr_chirho: 'Read from left to right. Take your time.',
		scene_awaiting_passage_chirho: 'Picture the passage.',
		scene_unavailable_chirho: 'The illustration is unavailable right now.',
		verse_cues_label_chirho: '{reference_chirho} with grammar cues',
		show_meanings_chirho: 'Show word meanings',
		hide_meanings_chirho: 'Hide word meanings',
		top_meaning_berean_chirho: 'Berean interlinear:',
		top_meaning_spanish_chirho: 'GBT:',
		meaning_unavailable_short_chirho: 'unavailable',
		not_separately_short_chirho: 'not separately translated',
		not_separately_translated_chirho: 'Not separately translated',
		berean_gloss_note_chirho: 'Berean Interlinear Bible gloss, via biblicalhumanities.org',
		lexical_form_chirho: 'Lexical form:',
		source_morphology_chirho: 'Source morphology:',
		source_editor_note_chirho: 'Source editor note:',
		greek_sources_note_chirho:
			'The Greek text and grammar follow the Nestle 1904 morphology source. English word meanings are from the Berean Interlinear Bible; they are word glosses, not a sentence translation or Global Bible Tools approvals.',
		greek_spanish_note_chirho:
			'Spanish word meanings, where shown, are approved in the Global Bible Tools export and matched to the Nestle 1904 words letter for letter. Words without an approved Spanish gloss say so.',
		reveal_canonical_greek_chirho: 'Reveal the exact Greek text',
		copy_note_chirho: 'Select the preserved text to copy it.',
		sources_licenses_chirho: 'Sources and licenses',
		footer_privacy_chirho: 'No accounts · No tracking',
		grammar_eyebrow_chirho: 'A quiet reading key',
		grammar_heading_chirho: 'Small marks, useful clues.',
		grammar_hint_chirho: 'Hover, focus or tap a key to learn more.',
		grammar_note_chirho:
			'Dots separate sourced affixes for display only. ◇ means an icon is pending. Stem numbers and conjugation letters are local teaching codes.',
		grammar_references_chirho: 'Grammar references for this key',
		grammar_reference_link_chirho: 'Grammar reference ↗',
		grammar_states_note_chirho:
			'Unknown and not applicable are app data states. The color, number and letter conventions are local teaching aids.',
		greek_grammar_hint_chirho: 'Read the small codes above each word.',
		greek_cues_note_chirho:
			'Centered roman numerals mark case. At the upper left, a capital tense code is followed by a lowercase voice code. At the upper right, a person number is followed by a capital mood code. For example, Ia on the left and 3I on the right mean imperfect active, third-person indicative. A participle can also carry a centered case numeral.',
		greek_conventions_note_chirho:
			'These placements, roman case numerals and lowercase voice letters are Hinneh teaching conventions. The grammatical values and tense, person and mood codes follow the {reference_chirho}. A missing cue makes no grammatical claim. ◇ means an illustration is unavailable.',
		nestle_reference_chirho: 'Nestle 1904 parsing reference ↗',
		help_close_chirho: 'Tap again or press Escape to close.',
		form_pattern_chirho: 'Form pattern',
		general_picture_chirho: 'General word picture:',
		general_picture_caveat_chirho: 'This verse’s meaning may call for a different picture.',
		icon_outline_chirho: '{pos_chirho} outline; {state_chirho}',
		icon_general_chirho: 'general word picture',
		icon_contextual_chirho: 'contextual illustration',
		icon_unavailable_chirho: 'illustration unavailable',
		other_meanings_chirho: 'Other reviewed meanings',
		other_meanings_help_chirho:
			'The double border marks other reviewed meanings of this word. The illustration under the word shows the meaning selected for this verse.',
		here_meaning_chirho: 'Here:'
	},
	es: {
		nav_label_chirho: 'Elegir un pasaje',
		book_chirho: 'Libro',
		high_quality_books_chirho: 'Ilustraciones de alta calidad',
		other_books_chirho: 'Más libros',
		chapter_chirho: 'Capítulo',
		verse_chirho: 'Versículo',
		language_chirho: 'Idioma',
		loading_chirho: 'Cargando {book_chirho} {chapter_chirho}:{verse_chirho}…',
		retry_chirho: 'Reintentar',
		error_chapters_chirho: 'No se pudo cargar la lista de capítulos. Inténtelo de nuevo.',
		error_verse_chirho: 'No se pudo cargar ni verificar este versículo. Inténtelo de nuevo.',
		error_book_chirho: 'No se pudo cargar ni verificar este libro. Inténtelo de nuevo.',
		art_progress_chirho:
			'Ilustraciones de {book_chirho}: {scenes_chirho} escenas · {lemmas_chirho} imágenes de palabras',
		previous_verse_chirho: 'Versículo anterior',
		previous_chirho: 'Anterior',
		next_verse_chirho: 'Versículo siguiente',
		next_chirho: 'Siguiente',
		meta_hebrew_chirho:
			'Lea hebreo bíblico con una escena, indicaciones gramaticales breves y significados que puede mostrar cuando esté listo.',
		home_label_chirho: 'Inicio de Hinneh',
		tagline_chirho: 'Mira. Observa. Lee.',
		badge_hebrew_chirho: 'Hebreo bíblico · Vista previa',
		eyebrow_hebrew_chirho: 'Hebreo bíblico · Leer con comprensión',
		kjv_numbering_chirho:
			'Numeración hebrea del versículo · Biblia inglesa (KJV): {reference_chirho}',
		reading_grid_hebrew_chirho: 'Versículo hebreo y escena imaginativa',
		read_rtl_chirho: 'Lea de derecha a izquierda. Tómese su tiempo.',
		show_translation_chirho: 'Mostrar traducción',
		app_gloss_note_chirho: 'Glosa de aprendizaje en inglés escrita por la aplicación.',
		gbt_order_note_chirho:
			'Aprobado en la exportación de Global Bible Tools. Glosas por palabra en el orden del hebreo, no una traducción de la oración.',
		language_order_note_chirho:
			'Aprobado en la exportación de Global Bible Tools · {label_chirho}. Glosas por palabra en el orden del hebreo, no una traducción de la oración. Archivo modificado por última vez el {date_chirho}.',
		scene_missing_chirho:
			'La escena no está disponible. Aún puede leer el texto preservado y sus indicaciones gramaticales.',
		scene_awaiting_1_chirho: 'Lea las palabras.',
		scene_awaiting_2_chirho: 'Imagine la sabiduría.',
		scene_awaiting_note_chirho: 'Se está preparando una ilustración para este pasaje.',
		scene_caption_chirho: 'Una ayuda imaginativa para aprender',
		scene_caption_sub_chirho: 'Una reflexión visual sobre el versículo',
		grammar_fallback_chirho:
			'Las indicaciones gramaticales siguen la morfología de la fuente preservada.',
		words_eyebrow_chirho: 'Una palabra a la vez',
		words_heading_chirho: 'Mire un poco más de cerca.',
		meaning_language_chirho: 'Idioma del significado',
		option_app_chirho: 'Inglés · glosa de aprendizaje de la aplicación',
		option_gbt_chirho: '{label_chirho} · exportación aprobada de GBT',
		cards_open_note_chirho:
			'Los significados y la morfología de cada palabra están abiertos en las tarjetas de abajo.',
		lemma_open_chirho: 'Abrir la entrada verificada del lema',
		lemma_unverified_chirho: 'Enlace al lema sin verificar',
		root_not_applicable_chirho: 'No aplica',
		root_traditional_chirho: 'Tradicional',
		root_unresolved_chirho: 'Sin resolver',
		root_relationship_chirho: 'Relación con la raíz',
		meaning_morphology_chirho: 'Significado y morfología',
		gloss_unavailable_chirho: 'Todavía no hay un significado revisado para esta palabra.',
		origin_gbt_chirho: 'Aprobado en la exportación de Global Bible Tools',
		origin_app_chirho: 'Glosa de aprendizaje escrita por la aplicación',
		origin_unavailable_chirho: 'Significado no disponible',
		language_approved_chirho: 'Aprobado en la exportación de Global Bible Tools · {label_chirho}',
		qere_label_chirho: 'Lectura (qere)',
		qere_note_chirho: 'La lectura se conserva aparte del texto escrito (ketiv) de arriba.',
		source_eyebrow_chirho: 'Fundado en la fuente',
		source_heading_chirho: 'Conserve el texto. Conserve el contexto.',
		reveal_canonical_hebrew_chirho: 'Mostrar el hebreo canónico exacto',
		canonical_note_chirho:
			'Este es el texto fuente preservado, sin puntos didácticos, superíndices ni marcadores de iconos. Selecciónelo para copiarlo.',
		root_lemma_note_chirho:
			'La raíz y el lema son distintos. Una relación léxica tradicional no afirma un origen histórico seguro. Las ilustraciones son ayudas para aprender; el texto original y su morfología documentada guían la lectura.',
		sources_summary_chirho: 'Fuentes, licencias y referencias gramaticales',
		export_line_chirho:
			'Exportación {exported_chirho}; archivo modificado por última vez {updated_chirho}. Revisión {revision_chirho}; SHA-256 {sha_chirho}.',
		revision_chirho: 'Revisión {revision_chirho}',
		uhg_note_chirho:
			'Las explicaciones gramaticales adaptan la unfoldingWord Hebrew Grammar, © 2021 unfoldingWord, bajo {license_chirho}. Están resumidas y redactadas de nuevo; las explicaciones adaptadas se comparten bajo la misma licencia. Los códigos numéricos y de letras, los colores y la disposición son convenciones didácticas de Hinneh. No se implica ningún respaldo.',
		footer_note_chirho: 'Un pequeño comienzo en el idioma de las Escrituras.',
		credit_hebrew_rest_chirho:
			'Archivos léxicos: Open Scriptures Hebrew Bible Project. La morfología y los archivos léxicos se usan bajo {license_chirho} y se adaptan aquí en segmentos de palabras, indicaciones gramaticales y notas de fuente. El texto hebreo es de dominio público. No se implica ningún respaldo.',
		credit_greek_chirho:
			'Texto griego: Nestle 1904 (dominio público). Morfología y lemas: Ulrik Sandborg-Petersen y biblicalhumanities.org (CC0). Glosas en inglés: Berean Interlinear Bible, mediante biblicalhumanities.org; vea los {terms_chirho}.',
		public_domain_terms_chirho: 'términos de dominio público',
		spanish_gloss_approved_chirho:
			'Glosa en español aprobada en la exportación de Global Bible Tools',
		spanish_gloss_missing_chirho:
			'No hay una glosa en español aprobada para esta palabra en la exportación fijada.',
		spanish_layer_unavailable_chirho:
			'Las glosas en español no están disponibles para este capítulo.',
		spanish_order_note_chirho:
			'Glosas en español por palabra, aprobadas en la exportación de Global Bible Tools, en el orden del hebreo; no es una traducción de la oración.',
		spanish_layer_stale_chirho:
			'Las glosas en español se retienen en este capítulo: su texto cambió después de prepararlas.',
		meta_greek_chirho:
			'Lea griego bíblico con indicaciones gramaticales y significados de palabras que puede mostrar cuando esté listo.',
		badge_greek_chirho: 'Griego bíblico · Vista previa',
		eyebrow_greek_chirho: 'Griego bíblico · Leer con comprensión',
		reading_grid_greek_chirho: 'Versículo griego y escena imaginativa',
		read_ltr_chirho: 'Lea de izquierda a derecha. Tómese su tiempo.',
		scene_awaiting_passage_chirho: 'Imagine el pasaje.',
		scene_unavailable_chirho: 'La ilustración no está disponible en este momento.',
		verse_cues_label_chirho: '{reference_chirho} con indicaciones gramaticales',
		show_meanings_chirho: 'Mostrar significados',
		hide_meanings_chirho: 'Ocultar significados',
		top_meaning_berean_chirho: 'Berean (inglés):',
		top_meaning_spanish_chirho: 'GBT:',
		meaning_unavailable_short_chirho: 'no disponible',
		not_separately_short_chirho: 'no se traduce por separado',
		not_separately_translated_chirho: 'No se traduce por separado',
		berean_gloss_note_chirho:
			'Glosa en inglés de la Berean Interlinear Bible, mediante biblicalhumanities.org',
		lexical_form_chirho: 'Forma léxica:',
		source_morphology_chirho: 'Morfología de la fuente:',
		source_editor_note_chirho: 'Nota del editor de la fuente:',
		greek_sources_note_chirho:
			'El texto griego y la gramática siguen la fuente morfológica de Nestle 1904. Los significados en inglés provienen de la Berean Interlinear Bible; son glosas por palabra, no una traducción de la oración ni aprobaciones de Global Bible Tools.',
		greek_spanish_note_chirho:
			'Los significados en español, donde aparecen, están aprobados en la exportación de Global Bible Tools y se emparejan letra por letra con las palabras de Nestle 1904. Las palabras sin una glosa aprobada en español lo indican.',
		reveal_canonical_greek_chirho: 'Mostrar el texto griego exacto',
		copy_note_chirho: 'Seleccione el texto preservado para copiarlo.',
		sources_licenses_chirho: 'Fuentes y licencias',
		footer_privacy_chirho: 'Sin cuentas · Sin rastreo',
		grammar_eyebrow_chirho: 'Una clave de lectura discreta',
		grammar_heading_chirho: 'Marcas pequeñas, pistas útiles.',
		grammar_hint_chirho: 'Pase el cursor, enfoque o toque una clave para saber más.',
		grammar_note_chirho:
			'Los puntos separan los afijos de la fuente solo para la presentación. ◇ significa que un icono está pendiente. Los números de tema y las letras de conjugación son códigos didácticos locales.',
		grammar_references_chirho: 'Referencias gramaticales de esta clave',
		grammar_reference_link_chirho: 'Referencia gramatical (en inglés) ↗',
		grammar_states_note_chirho:
			'Desconocido y no aplica son estados de datos de la aplicación. Las convenciones de color, número y letra son ayudas didácticas locales.',
		greek_grammar_hint_chirho: 'Lea los pequeños códigos sobre cada palabra.',
		greek_cues_note_chirho:
			'Los numerales romanos centrados marcan el caso. Arriba a la izquierda, un código de tiempo en mayúscula va seguido de un código de voz en minúscula. Arriba a la derecha, un número de persona va seguido de un código de modo en mayúscula. Por ejemplo, Ia a la izquierda y 3I a la derecha significan imperfecto activo, tercera persona del indicativo. Un participio también puede llevar un numeral de caso centrado.',
		greek_conventions_note_chirho:
			'Estas posiciones, los numerales romanos de caso y las letras minúsculas de voz son convenciones didácticas de Hinneh. Los valores gramaticales y los códigos de tiempo, persona y modo siguen la {reference_chirho}; los códigos provienen de los nombres en inglés. Una indicación ausente no hace ninguna afirmación gramatical. ◇ significa que no hay ilustración disponible.',
		nestle_reference_chirho: 'referencia de análisis de Nestle 1904 (en inglés) ↗',
		help_close_chirho: 'Toque de nuevo o pulse Escape para cerrar.',
		form_pattern_chirho: 'Patrón de forma',
		general_picture_chirho: 'Imagen general de la palabra:',
		general_picture_caveat_chirho: 'El significado en este versículo puede pedir otra imagen.',
		icon_outline_chirho: 'contorno de {pos_chirho}; {state_chirho}',
		icon_general_chirho: 'imagen general de la palabra',
		icon_contextual_chirho: 'ilustración contextual',
		icon_unavailable_chirho: 'ilustración no disponible',
		other_meanings_chirho: 'Otros significados revisados',
		other_meanings_help_chirho:
			'El doble borde marca otros significados revisados de esta palabra. La ilustración bajo la palabra muestra el significado elegido para este versículo.',
		here_meaning_chirho: 'Aquí:'
	}
});

export type ReaderKeyChirho = keyof (typeof readerCatalogueChirho)['en'];

// Reads the shared locale, so calling it inside markup re-renders on a language change.
export function readerTChirho(
	keyChirho: ReaderKeyChirho,
	paramsChirho?: Record<string, string | number>
): string {
	return translateChirho(
		readerCatalogueChirho,
		localeStateChirho.currentChirho,
		keyChirho,
		paramsChirho
	);
}

// The text on either side of one inline element, such as a link, so each catalogue keeps its
// sentence whole for translation.
export function readerPartsChirho(
	keyChirho: ReaderKeyChirho,
	slotChirho: string
): [beforeChirho: string, afterChirho: string] {
	const [beforeChirho = '', afterChirho = ''] = readerTChirho(keyChirho, {
		[slotChirho]: '\u0000'
	}).split('\u0000');
	return [beforeChirho, afterChirho];
}

// Why a chapter shows no Spanish glosses: withheld after a source change, or simply unavailable.
export function spanishNoticeChirho(resultChirho: SpanishLayerResultChirho | null): string {
	return readerTChirho(
		resultChirho?.kindChirho === 'stale'
			? 'spanish_layer_stale_chirho'
			: 'spanish_layer_unavailable_chirho'
	);
}
