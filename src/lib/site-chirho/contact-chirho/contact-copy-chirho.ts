// For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life. — John 3:16 (KJV)
import { defineCatalogueChirho, translateChirho } from '$lib/i18n-chirho/translate-chirho';
import { localeStateChirho } from '$lib/i18n-chirho/locale-state-chirho.svelte';
export const CONTACT_MESSAGES_CHIRHO = defineCatalogueChirho({
	en: {
		form_chirho: 'Contact form',
		name_chirho: 'Name',
		name_help_chirho: 'Optional.',
		email_chirho: 'Your email',
		email_help_chirho: 'Used only to reply to you. It is never published.',
		message_chirho: 'Message',
		message_help_chirho:
			'Up to {max_chirho} characters. Please leave out sensitive personal information.',
		verification_chirho: 'Verification',
		send_chirho: 'Send message',
		busy_chirho: 'Sending…',
		waiting_chirho: 'Complete the verification to send.',
		ready_chirho: 'Ready to send.',
		sent_chirho: 'Thank you. Your message was sent.',
		invalid_chirho: 'Please check your email address and message, then try again.',
		rate_chirho: 'Too many messages were sent from this connection. Please try again later.',
		error_chirho: 'Your message could not be sent. Please try again in a few minutes.',
		challenge_error_chirho: 'The verification could not load. Reload the page and try again.',
		report_note_chirho:
			'To report a flaw in an illustration, use “Report image issue” beside the picture. It goes straight to illustration review.'
	},
	es: {
		form_chirho: 'Formulario de contacto',
		name_chirho: 'Nombre',
		name_help_chirho: 'Opcional.',
		email_chirho: 'Tu correo electrónico',
		email_help_chirho: 'Solo se usa para responderte. Nunca se publica.',
		message_chirho: 'Mensaje',
		message_help_chirho:
			'Hasta {max_chirho} caracteres. No incluyas información personal sensible.',
		verification_chirho: 'Verificación',
		send_chirho: 'Enviar mensaje',
		busy_chirho: 'Enviando…',
		waiting_chirho: 'Completa la verificación para enviar.',
		ready_chirho: 'Listo para enviar.',
		sent_chirho: 'Gracias. Tu mensaje fue enviado.',
		invalid_chirho: 'Revisa tu correo electrónico y el mensaje, e inténtalo de nuevo.',
		rate_chirho: 'Se enviaron demasiados mensajes desde esta conexión. Inténtalo más tarde.',
		error_chirho: 'No se pudo enviar tu mensaje. Inténtalo de nuevo en unos minutos.',
		challenge_error_chirho:
			'No se pudo cargar la verificación. Recarga la página e inténtalo de nuevo.',
		report_note_chirho:
			'Para señalar un defecto en una ilustración, usa «Informar de un problema» junto a la imagen. El informe va directamente a la revisión de ilustraciones.'
	}
});
export function contactTChirho(
	keyChirho: keyof typeof CONTACT_MESSAGES_CHIRHO.en,
	paramsChirho: Record<string, string | number> = {}
) {
	return translateChirho(
		CONTACT_MESSAGES_CHIRHO,
		localeStateChirho.currentChirho,
		keyChirho,
		paramsChirho
	);
}
