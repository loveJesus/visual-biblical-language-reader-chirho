// For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life. — John 3:16 (KJV)

// Interface languages. The Hebrew and Greek source text never changes with the locale.
export type LocaleChirho = 'en' | 'es';
export const LOCALES_CHIRHO = ['en', 'es'] as const satisfies readonly LocaleChirho[];
export const DEFAULT_LOCALE_CHIRHO: LocaleChirho = 'en';
export const LOCALE_STORAGE_KEY_CHIRHO = 'hinneh-locale-chirho';
export const LOCALE_QUERY_CHIRHO = 'lang_chirho';

export function isLocaleChirho(valueChirho: unknown): valueChirho is LocaleChirho {
	return (LOCALES_CHIRHO as readonly unknown[]).includes(valueChirho);
}

// An explicit ?lang_chirho= wins, then the reader's saved choice, then English.
export function resolveLocaleChirho(
	queryChirho: string | null,
	storedChirho: string | null
): LocaleChirho {
	if (isLocaleChirho(queryChirho)) return queryChirho;
	if (isLocaleChirho(storedChirho)) return storedChirho;
	return DEFAULT_LOCALE_CHIRHO;
}
