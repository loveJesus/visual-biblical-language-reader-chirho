// For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life. — John 3:16 (KJV)
// One contract for the contact form and its Worker intake, so both sides enforce the same limits.
// Workflow: spec-chirho/workflows-chirho/hosting-chirho/contact-chirho.md
// Pure TypeScript only: the Worker bundle imports this file without SvelteKit aliases.
export const CONTACT_PATH_CHIRHO = '/api-chirho/contact-chirho';
export const CONTACT_ACTION_CHIRHO = 'contact_message_chirho';
export const CONTACT_LIMITS_CHIRHO = {
	name_chirho: 100,
	email_chirho: 254,
	message_chirho: 4000
} as const;
// Attempts per hashed connection per hour, counted before the challenge is checked.
export const CONTACT_RATE_CHIRHO = 5;
// The provider's 2,048-character token plus a maximal four-byte message, with JSON overhead.
export const CONTACT_MAX_BODY_CHIRHO = 24_576;
const CONTACT_LOCALES_CHIRHO = ['en', 'es'] as const;
const CONTACT_FIELDS_CHIRHO = [
	'name_chirho',
	'email_chirho',
	'message_chirho',
	'locale_chirho',
	'turnstile_token_chirho'
];
export interface ContactInputChirho {
	name_chirho: string;
	email_chirho: string;
	message_chirho: string;
	locale_chirho: (typeof CONTACT_LOCALES_CHIRHO)[number];
	turnstile_token_chirho: string;
}
// Exactly one address: no spaces, separators, quotes or brackets that could add a recipient.
const EMAIL_PATTERN_CHIRHO =
	/^[^\s@,;:<>()[\]\\"]+@[^\s@,;:<>()[\]\\".]+(?:\.[^\s@,;:<>()[\]\\".]+)*\.[^\s@,;:<>()[\]\\".]{2,}$/u;
const lengthChirho = (valueChirho: string) => [...valueChirho].length;
export function isContactEmailChirho(valueChirho: unknown): valueChirho is string {
	return (
		typeof valueChirho === 'string' &&
		valueChirho.length <= CONTACT_LIMITS_CHIRHO.email_chirho &&
		EMAIL_PATTERN_CHIRHO.test(valueChirho)
	);
}
// Returns the trimmed message, or null for anything the intake must refuse.
export function parseContactChirho(inputChirho: unknown): ContactInputChirho | null {
	if (!inputChirho || typeof inputChirho !== 'object' || Array.isArray(inputChirho)) return null;
	const recordChirho = inputChirho as Record<string, unknown>;
	if (Object.keys(recordChirho).some((keyChirho) => !CONTACT_FIELDS_CHIRHO.includes(keyChirho)))
		return null;
	const nameChirho = recordChirho.name_chirho;
	const emailChirho = recordChirho.email_chirho;
	const messageChirho = recordChirho.message_chirho;
	const localeChirho = CONTACT_LOCALES_CHIRHO.find(
		(candidateChirho) => candidateChirho === recordChirho.locale_chirho
	);
	const tokenChirho = recordChirho.turnstile_token_chirho;
	if (
		typeof nameChirho !== 'string' ||
		typeof emailChirho !== 'string' ||
		typeof messageChirho !== 'string' ||
		typeof tokenChirho !== 'string' ||
		!localeChirho ||
		!tokenChirho ||
		tokenChirho.length > 2048
	)
		return null;
	const cleanNameChirho = nameChirho.trim();
	const cleanEmailChirho = emailChirho.trim();
	const cleanMessageChirho = messageChirho.trim();
	if (
		lengthChirho(cleanNameChirho) > CONTACT_LIMITS_CHIRHO.name_chirho ||
		/\p{Cc}/u.test(cleanNameChirho) ||
		!isContactEmailChirho(cleanEmailChirho) ||
		!cleanMessageChirho ||
		lengthChirho(cleanMessageChirho) > CONTACT_LIMITS_CHIRHO.message_chirho ||
		// Line breaks and tabs are part of a message; every other control character is refused.
		/[^\P{Cc}\t\n\r]/u.test(cleanMessageChirho)
	)
		return null;
	return {
		name_chirho: cleanNameChirho,
		email_chirho: cleanEmailChirho,
		message_chirho: cleanMessageChirho,
		locale_chirho: localeChirho,
		turnstile_token_chirho: tokenChirho
	};
}
