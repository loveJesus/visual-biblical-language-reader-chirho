// For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life. — John 3:16 (KJV)
import { defineCatalogueChirho, translateChirho } from '$lib/i18n-chirho/translate-chirho';
import { localeStateChirho } from '$lib/i18n-chirho/locale-state-chirho.svelte';

export const LEARNING_ANCHOR_CHIRHO = 'learning-paths-chirho';
// Official sites and the channels linked by those sites, checked November 5, 2026.
export const LEARNING_PATHS_CHIRHO = [
	{
		name_chirho: 'Lingua Deo Gloria',
		website_chirho: 'https://www.linguadeogloria.org/',
		youtube_chirho: 'https://www.youtube.com/@LinguaDeoGloria',
		language_key_chirho: 'both_chirho',
		body_key_chirho: 'lingua_chirho'
	},
	{
		name_chirho: 'Aleph with Beth',
		website_chirho: 'https://freehebrew.online/',
		youtube_chirho: 'https://www.youtube.com/channel/UCkKmeTinUEU27syZPKrzWQQ',
		language_key_chirho: 'hebrew_chirho',
		body_key_chirho: 'beth_chirho'
	},
	{
		name_chirho: 'Alpha with Angela',
		website_chirho: 'https://freegreek.online/',
		youtube_chirho: 'https://www.youtube.com/channel/UCe0ilqwSO8XVnCw4m3UYC1Q',
		language_key_chirho: 'greek_chirho',
		body_key_chirho: 'angela_chirho'
	}
] as const;

const LEARNING_MESSAGES_CHIRHO = defineCatalogueChirho({
	en: {
		link_chirho: 'Learning paths',
		home_chirho: 'Learning Hebrew or Greek? Explore free courses',
		title_chirho: 'Keep learning the biblical languages',
		body_chirho:
			'For a guided path alongside your reading, begin with the first lesson and build understanding through listening, stories and practice. These freely available courses are offered by fellow ministries.',
		both_chirho: 'Hebrew & Greek',
		hebrew_chirho: 'Biblical Hebrew',
		greek_chirho: 'Biblical Greek',
		lingua_chirho:
			'Learn through stories and comprehensible input, with courses and reading resources for both languages.',
		beth_chirho:
			'Learn Hebrew through Hebrew, step by step, with visual lessons that build on one another.',
		angela_chirho:
			'Learn New Testament Greek through Greek, following a growing sequence of visual video lessons.',
		website_chirho: 'Visit website',
		youtube_chirho: 'YouTube channel'
	},
	es: {
		link_chirho: 'Rutas de aprendizaje',
		home_chirho: '¿Estás aprendiendo hebreo o griego? Explora cursos gratuitos',
		title_chirho: 'Sigue aprendiendo los idiomas bíblicos',
		body_chirho:
			'Para seguir una ruta guiada junto con tu lectura, empieza por la primera lección y crece en comprensión escuchando, con historias y con práctica. Otros ministerios ofrecen estos cursos gratuitamente.',
		both_chirho: 'Hebreo y griego',
		hebrew_chirho: 'Hebreo bíblico',
		greek_chirho: 'Griego bíblico',
		lingua_chirho:
			'Aprende con historias y contenido comprensible, con cursos y recursos de lectura para ambos idiomas.',
		beth_chirho:
			'Aprende hebreo por medio del hebreo, paso a paso, con lecciones visuales que se apoyan en las anteriores.',
		angela_chirho:
			'Aprende el griego del Nuevo Testamento por medio del griego, siguiendo una secuencia creciente de lecciones en video.',
		website_chirho: 'Visitar sitio web',
		youtube_chirho: 'Canal de YouTube'
	}
});

export function learningTChirho(keyChirho: keyof typeof LEARNING_MESSAGES_CHIRHO.en) {
	return translateChirho(LEARNING_MESSAGES_CHIRHO, localeStateChirho.currentChirho, keyChirho);
}
