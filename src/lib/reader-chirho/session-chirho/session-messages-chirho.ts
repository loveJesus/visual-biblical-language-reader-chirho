// For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life. — John 3:16 (KJV)
import type { LocaleChirho } from '$lib/i18n-chirho/locale-chirho';

const SESSION_MESSAGES_CHIRHO = {
	en: {
		welcome_chirho: 'Open the Word.',
		hero_alt_chirho: 'An open Bible among olive trees above a sunlit lake.',
		intro_chirho: 'Read the Bible in Hebrew and Greek with pictures, word meanings and recordings.',
		use_chirho:
			'Tap a word to look closer. Play a verse to hear it, with video when available. More languages are planned.',
		open_chirho: 'Open source · Licensed study materials',
		start_chirho: 'Start reading',
		tour_chirho: 'Watch quick tour',
		install_chirho: 'Get it on',
		reopen_chirho: 'You can open the tutorial at any time from Help.',
		settings_chirho: 'Settings',
		help_chirho: 'Help',
		info_chirho: 'Info',
		today_chirho: "Open today's Proverbs",
		today_hint_chirho: 'At the start of a visit. Turn off to resume your last passage.',
		autoplay_chirho: 'Play after changing verse',
		autoplay_hint_chirho: 'Play the available video or recording when you choose another verse.',
		key_chirho: 'Reading key',
		tour_title_chirho: 'A quick tour of Hinneh',
		tour_intro_chirho: 'Choose Play for a short guide, or start reading right away.',
		transcript_chirho: 'Read the transcript',
		loading_chirho: 'Loading the tour…',
		unavailable_chirho: 'The tour could not load. You can still start reading.',
		captions_chirho: 'English captions',
		video_chirho: 'Hinneh quick tour'
	},
	es: {
		welcome_chirho: 'Abra la Palabra.',
		hero_alt_chirho: 'Una Biblia abierta entre olivos junto a un lago iluminado.',
		intro_chirho: 'Lea la Biblia en hebreo y griego con imágenes, significados y grabaciones.',
		use_chirho:
			'Toque una palabra para verla de cerca. Reproduzca un versículo para escucharlo, con video cuando esté disponible. Se planean más idiomas.',
		open_chirho: 'Código abierto · Materiales con licencia',
		start_chirho: 'Empezar a leer',
		tour_chirho: 'Ver el recorrido breve',
		install_chirho: 'Instalar desde',
		reopen_chirho: 'Puede abrir el tutorial en cualquier momento desde Ayuda.',
		settings_chirho: 'Configuración',
		help_chirho: 'Ayuda',
		info_chirho: 'Info',
		today_chirho: 'Abrir los Proverbios de hoy',
		today_hint_chirho: 'Al comenzar una visita. Desactívelo para volver a su último pasaje.',
		autoplay_chirho: 'Reproducir al cambiar de versículo',
		autoplay_hint_chirho: 'Reproduce el video o la grabación disponible al elegir otro versículo.',
		key_chirho: 'Clave de lectura',
		tour_title_chirho: 'Un recorrido breve por Hinneh',
		tour_intro_chirho: 'Pulse Reproducir para ver una guía breve o empiece a leer ahora.',
		transcript_chirho: 'Leer la transcripción',
		loading_chirho: 'Cargando el recorrido…',
		unavailable_chirho: 'No se pudo cargar el recorrido. Aun así, puede empezar a leer.',
		captions_chirho: 'Subtítulos en español',
		video_chirho: 'Recorrido breve por Hinneh'
	}
} as const;
export function sessionMessagesChirho(localeChirho: LocaleChirho) {
	return SESSION_MESSAGES_CHIRHO[localeChirho];
}
