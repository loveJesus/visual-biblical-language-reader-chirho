// For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life. — John 3:16 (KJV)

import type { LocaleChirho } from './locale-chirho';

// One catalogue per feature; TypeScript requires every locale to carry exactly the same keys.
export type CatalogueChirho<KeyChirho extends string> = {
	readonly [CodeChirho in LocaleChirho]: Readonly<Record<KeyChirho, string>>;
};

export function defineCatalogueChirho<const KeyChirho extends string>(
	catalogueChirho: CatalogueChirho<KeyChirho>
): CatalogueChirho<KeyChirho> {
	return catalogueChirho;
}

// Fills {name_chirho} placeholders; an unknown placeholder is left visible rather than guessed.
export function translateChirho<KeyChirho extends string>(
	catalogueChirho: CatalogueChirho<KeyChirho>,
	localeChirho: LocaleChirho,
	keyChirho: KeyChirho,
	paramsChirho: Record<string, string | number> = {}
): string {
	return catalogueChirho[localeChirho][keyChirho].replace(
		/\{(\w+)\}/g,
		(matchChirho, nameChirho) =>
			nameChirho in paramsChirho ? String(paramsChirho[nameChirho]) : matchChirho
	);
}
