// For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life. — John 3:16 (KJV)

export const HEBREW_WORD_RECIPE_CHIRHO = 'israeli-ipa-word-library-v1-chirho';
export const GREEK_WORD_RECIPE_CHIRHO = 'modern-greek-word-library-v1-chirho';

export function validRecordingWindowChirho(clipChirho: {
	token_id_chirho?: unknown;
	duration_chirho?: unknown;
	start_offset_chirho?: unknown;
	end_offset_chirho?: unknown;
}) {
	if (clipChirho.start_offset_chirho === undefined && clipChirho.end_offset_chirho === undefined)
		return true;
	return (
		typeof clipChirho.token_id_chirho === 'string' &&
		typeof clipChirho.duration_chirho === 'number' &&
		typeof clipChirho.start_offset_chirho === 'number' &&
		typeof clipChirho.end_offset_chirho === 'number' &&
		Number.isFinite(clipChirho.start_offset_chirho) &&
		Number.isFinite(clipChirho.end_offset_chirho) &&
		clipChirho.start_offset_chirho >= 0 &&
		clipChirho.end_offset_chirho - clipChirho.start_offset_chirho >= 0.1 &&
		clipChirho.end_offset_chirho <= clipChirho.duration_chirho
	);
}

export function productionWordRecipeChirho(
	textChirho: string,
	recipeChirho: unknown,
	ipaChirho?: string
) {
	if (
		recipeChirho === GREEK_WORD_RECIPE_CHIRHO &&
		ipaChirho === undefined &&
		textChirho.trim() &&
		textChirho.length <= 200
	)
		// Analysis copy only: equivalent accents and capitalization share a spoken form.
		return { synthesis_text_chirho: textChirho.normalize('NFC').toLocaleLowerCase('el') };
	if (
		recipeChirho === HEBREW_WORD_RECIPE_CHIRHO &&
		typeof ipaChirho === 'string' &&
		ipaChirho.length > 0 &&
		ipaChirho.length <= 200 &&
		/^[\p{L}\p{M}\sˈˌ]+$/u.test(ipaChirho)
	)
		return { synthesis_text_chirho: `"/${ipaChirho}/"`, ipa_chirho: ipaChirho };
	return null;
}
