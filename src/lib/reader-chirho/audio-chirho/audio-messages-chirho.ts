// For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life. — John 3:16 (KJV)
import { defineCatalogueChirho, translateChirho } from '$lib/i18n-chirho/translate-chirho';
import { localeStateChirho } from '$lib/i18n-chirho/locale-state-chirho.svelte';

export const AUDIO_MESSAGES_CHIRHO = defineCatalogueChirho({
	en: {
		show_ipa_chirho: 'Show IPA',
		ipa_unavailable_chirho: 'IPA unavailable for this reading',
		ipa_guide_chirho: 'IPA guide · Draft; — marks an unresolved reading.',
		pronunciation_note_chirho: 'Pronunciation note',
		ipa_draft_chirho: 'Israeli Hebrew · IPA draft, awaiting pronunciation review.',
		recorded_ipa_ready_chirho:
			'AI voice audition · IPA · {name_chirho}. Pronunciation awaits review.',
		play_chirho: 'Play',
		rendition_chirho: 'Pronunciation',
		modern_aspirates_chirho: 'Modern with Aspirates',
		modern_choice_chirho: 'Modern Greek',
		assembled_ready_chirho:
			'Word recordings are ready for an assembled reading. Natural verse recordings take priority.',
		assembled_playing_chirho: 'Playing an assembled reading from saved word recordings.',
		erasmian_chirho: 'Erasmian',
		slightly_slower_chirho: '12% slower',
		rendition_unavailable_chirho: 'This pronunciation is not recorded for this passage yet.',
		rendition_coverage_chirho:
			'Compare pronunciations in John 1:1–2. Both are AI auditions awaiting pronunciation review.',
		recorded_ready_chirho:
			'AI voice audition · {name_chirho}. Pronunciation awaits review; other words use the device voice.',
		recorded_playing_chirho: 'Playing the saved {name_chirho} recording.',
		recorded_failed_chirho: 'The recording could not be played. Please try again.',
		stop_chirho: 'Stop',
		speed_chirho: 'Speed',
		slow_chirho: 'Slow',
		gentle_chirho: 'Gentle',
		normal_chirho: 'Normal',
		listen_verse_chirho: 'Listen to this verse',
		pronounce_word_chirho: 'Pronounce {word_chirho}',
		hear_word_chirho: 'Hear word',
		navigation_chirho: 'Verse navigation and playback',
		reading_speed_chirho: 'Reading speed',
		checking_chirho: 'Checking for a local voice on this device.',
		qere_chirho: 'The spoken reading follows the listed qere where the written form differs.',
		javascript_chirho: 'Enable JavaScript to hear the original text.',
		unavailable_chirho: 'Audio playback is unavailable in this browser.',
		no_voice_chirho:
			'A local {language_chirho} voice is not available on this device. Add one in your device’s speech settings.',
		hebrew_chirho: 'Hebrew',
		greek_chirho: 'Greek',
		device_hebrew_chirho: 'Device Hebrew pronunciation',
		ancient_greek_chirho: 'Ancient Greek device voice',
		modern_greek_chirho: 'Modern Greek pronunciation',
		voice_ready_chirho: '{pronunciation_chirho} · {name_chirho}. Plays locally on this device.',
		reading_chirho: 'Reading with {name_chirho}.',
		failed_chirho: 'The device could not read this text. You can try another word or verse.'
	},
	es: {
		show_ipa_chirho: 'Mostrar AFI',
		ipa_unavailable_chirho: 'AFI no disponible para esta lectura',
		ipa_guide_chirho: 'Guía AFI · Borrador; — indica una lectura sin resolver.',
		pronunciation_note_chirho: 'Nota de pronunciación',
		ipa_draft_chirho: 'Hebreo israelí · AFI provisional, pendiente de revisión de pronunciación.',
		recorded_ipa_ready_chirho:
			'Prueba de voz IA · AFI · {name_chirho}. Pronunciación pendiente de revisión.',
		play_chirho: 'Reproducir',
		rendition_chirho: 'Pronunciación',
		modern_aspirates_chirho: 'Moderna con aspiración',
		modern_choice_chirho: 'Griega moderna',
		assembled_ready_chirho:
			'Las grabaciones de palabras permiten una lectura ensamblada. Las grabaciones naturales del versículo tienen prioridad.',
		assembled_playing_chirho:
			'Reproduciendo una lectura ensamblada con las grabaciones de palabras.',
		erasmian_chirho: 'Erasmiana',
		slightly_slower_chirho: '12% más lenta',
		rendition_unavailable_chirho: 'Esta pronunciación aún no está grabada para este pasaje.',
		rendition_coverage_chirho:
			'Compara las pronunciaciones en Juan 1:1–2. Ambas son pruebas de voz IA pendientes de revisión.',
		recorded_ready_chirho:
			'Prueba de voz IA · {name_chirho}. Pronunciación pendiente de revisión; otras palabras usan la voz del dispositivo.',
		recorded_playing_chirho: 'Reproduciendo la grabación guardada de {name_chirho}.',
		recorded_failed_chirho: 'No se pudo reproducir la grabación. Inténtalo de nuevo.',
		stop_chirho: 'Detener',
		speed_chirho: 'Velocidad',
		slow_chirho: 'Lenta',
		gentle_chirho: 'Pausada',
		normal_chirho: 'Normal',
		listen_verse_chirho: 'Escuchar este versículo',
		pronounce_word_chirho: 'Pronunciar {word_chirho}',
		hear_word_chirho: 'Oír la palabra',
		navigation_chirho: 'Navegación y audio del versículo',
		reading_speed_chirho: 'Velocidad de lectura',
		checking_chirho: 'Buscando una voz local en este dispositivo.',
		qere_chirho:
			'La lectura en voz alta sigue el qere indicado cuando difiere de la forma escrita.',
		javascript_chirho: 'Activa JavaScript para escuchar el texto original.',
		unavailable_chirho: 'El audio no está disponible en este navegador.',
		no_voice_chirho:
			'No hay una voz local de {language_chirho} disponible en este dispositivo. Añade una en los ajustes de voz del dispositivo.',
		hebrew_chirho: 'hebreo',
		greek_chirho: 'griego',
		device_hebrew_chirho: 'Pronunciación hebrea del dispositivo',
		ancient_greek_chirho: 'Voz de griego antiguo del dispositivo',
		modern_greek_chirho: 'Pronunciación griega moderna',
		voice_ready_chirho:
			'{pronunciation_chirho} · {name_chirho}. Se reproduce localmente en este dispositivo.',
		reading_chirho: 'Leyendo con {name_chirho}.',
		failed_chirho: 'El dispositivo no pudo leer este texto. Puedes probar otra palabra o versículo.'
	}
});
export type AudioMessageKeyChirho = keyof typeof AUDIO_MESSAGES_CHIRHO.en;
export function audioTChirho(
	keyChirho: AudioMessageKeyChirho,
	paramsChirho?: Record<string, string | number>
) {
	return translateChirho(
		AUDIO_MESSAGES_CHIRHO,
		localeStateChirho.currentChirho,
		keyChirho,
		paramsChirho
	);
}
