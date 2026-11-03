// For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life. — John 3:16 (KJV)

import {
	DEFAULT_LOCALE_CHIRHO,
	LOCALE_QUERY_CHIRHO,
	LOCALE_STORAGE_KEY_CHIRHO,
	resolveLocaleChirho,
	type LocaleChirho
} from './locale-chirho';

// The one reactive interface locale shared by the reader and the audio controls.
const stateChirho = $state<{ currentChirho: LocaleChirho }>({
	currentChirho: DEFAULT_LOCALE_CHIRHO
});

export const localeStateChirho: { readonly currentChirho: LocaleChirho } = stateChirho;

function storedLocaleChirho(): string | null {
	try {
		return globalThis.localStorage?.getItem(LOCALE_STORAGE_KEY_CHIRHO) ?? null;
	} catch {
		return null; // private windows and blocked storage simply fall back to the default
	}
}

function applyDocumentLangChirho(localeChirho: LocaleChirho): void {
	if (typeof document !== 'undefined') document.documentElement.lang = localeChirho;
}

export function initLocaleChirho(urlChirho: URL): void {
	stateChirho.currentChirho = resolveLocaleChirho(
		urlChirho.searchParams.get(LOCALE_QUERY_CHIRHO),
		storedLocaleChirho()
	);
	applyDocumentLangChirho(stateChirho.currentChirho);
}

export function setLocaleChirho(localeChirho: LocaleChirho): void {
	stateChirho.currentChirho = localeChirho;
	try {
		globalThis.localStorage?.setItem(LOCALE_STORAGE_KEY_CHIRHO, localeChirho);
	} catch {
		/* the choice still applies for this visit */
	}
	applyDocumentLangChirho(localeChirho);
}
