// For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life. — John 3:16 (KJV)
import { defineCatalogueChirho, translateChirho } from './translate-chirho';
import { localeStateChirho } from './locale-state-chirho.svelte';
const ROUTE_MESSAGES_CHIRHO = defineCatalogueChirho({
	en: {
		lesson_title_chirho: 'Lesson unavailable',
		lesson_chirho: 'This lesson is unavailable.',
		lesson_note_chirho: 'Its source data could not be validated. Please try again later.',
		page_title_chirho: 'Unavailable',
		page_chirho: 'This page is unavailable.',
		retry_chirho: 'Please try again later.'
	},
	es: {
		lesson_title_chirho: 'Lección no disponible',
		lesson_chirho: 'Esta lección no está disponible.',
		lesson_note_chirho:
			'No se pudieron validar los datos de la fuente. Inténtalo de nuevo más tarde.',
		page_title_chirho: 'No disponible',
		page_chirho: 'Esta página no está disponible.',
		retry_chirho: 'Inténtalo de nuevo más tarde.'
	}
});
export function routeTChirho(keyChirho: keyof typeof ROUTE_MESSAGES_CHIRHO.en) {
	return translateChirho(ROUTE_MESSAGES_CHIRHO, localeStateChirho.currentChirho, keyChirho);
}
