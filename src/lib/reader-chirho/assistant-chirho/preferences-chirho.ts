// For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life. — John 3:16 (KJV)
// Workflow: hosting-chirho/ai-handoff-chirho.md. Local preferences and explicit user-controlled handoff only.
export const AI_PREFERENCE_KEY_CHIRHO = 'hinneh-ai-preferences-chirho';
export const AI_PROVIDERS_CHIRHO = {
	chatgpt_chirho: { name_chirho: 'ChatGPT', url_chirho: 'https://chatgpt.com/' },
	claude_chirho: { name_chirho: 'Claude', url_chirho: 'https://claude.ai/' },
	gemini_chirho: { name_chirho: 'Gemini', url_chirho: 'https://gemini.google.com/' },
	copy_chirho: { name_chirho: 'Other AI', url_chirho: null }
} as const;
export type AiProviderChirho = keyof typeof AI_PROVIDERS_CHIRHO;
export type AiModeChirho = 'text_chirho' | 'voice_chirho';
export type AiFocusChirho = 'language_chirho' | 'context_chirho' | 'both_chirho';
export interface AiPreferencesChirho {
	schema_version_chirho: 1;
	provider_chirho: AiProviderChirho;
	mode_chirho: AiModeChirho;
	focus_chirho: AiFocusChirho;
}
export function parseAiPreferencesChirho(rawChirho: string | null): AiPreferencesChirho | null {
	if (!rawChirho || rawChirho.length > 2048) return null;
	try {
		const valueChirho = JSON.parse(rawChirho) as AiPreferencesChirho;
		if (
			!valueChirho ||
			valueChirho.schema_version_chirho !== 1 ||
			!Object.hasOwn(AI_PROVIDERS_CHIRHO, valueChirho.provider_chirho) ||
			!['text_chirho', 'voice_chirho'].includes(valueChirho.mode_chirho) ||
			!['language_chirho', 'context_chirho', 'both_chirho'].includes(valueChirho.focus_chirho) ||
			(valueChirho.mode_chirho === 'voice_chirho' &&
				valueChirho.provider_chirho !== 'chatgpt_chirho')
		)
			return null;
		return {
			schema_version_chirho: 1,
			provider_chirho: valueChirho.provider_chirho,
			mode_chirho: valueChirho.mode_chirho,
			focus_chirho: valueChirho.focus_chirho
		};
	} catch {
		return null;
	}
}
export function aiVoiceAvailableChirho(providerChirho: string, mobileChirho: boolean): boolean {
	return providerChirho === 'chatgpt_chirho' && mobileChirho;
}
export function aiPromptChirho(
	verseChirho: { id_chirho: string; canonical_text_chirho: string; language_chirho: string },
	questionChirho: string,
	localeChirho: 'en' | 'es',
	focusChirho: AiFocusChirho
): string {
	if (
		!/^[1-3]?[A-Za-z]+\.\d{1,3}\.\d{1,3}$/.test(verseChirho.id_chirho) ||
		!verseChirho.canonical_text_chirho.trim() ||
		verseChirho.canonical_text_chirho.length > 20000 ||
		!['he', 'grc'].includes(verseChirho.language_chirho) ||
		questionChirho.length > 2000
	)
		throw new Error('Verse or question exceeds handoff bounds');
	const languageChirho =
		verseChirho.language_chirho === 'he'
			? localeChirho === 'es'
				? 'hebreo bíblico'
				: 'Biblical Hebrew'
			: localeChirho === 'es'
				? 'griego del Nuevo Testamento'
				: 'New Testament Greek';
	const focusTextChirho =
		localeChirho === 'es'
			? {
					language_chirho: 'Céntrese en vocabulario y gramática.',
					context_chirho: 'Céntrese en el sentido del versículo y su contexto.',
					both_chirho: 'Explique el vocabulario, la gramática y el contexto del versículo.'
				}[focusChirho]
			: {
					language_chirho: 'Focus on vocabulary and grammar.',
					context_chirho: 'Focus on the verse’s meaning and context.',
					both_chirho: 'Explain the vocabulary, grammar and context of the verse.'
				}[focusChirho];
	return localeChirho === 'es'
		? `Estoy leyendo ${languageChirho} con Hinneh. Responda en español.\n\nPasaje: ${verseChirho.id_chirho}\nTexto original: ${verseChirho.canonical_text_chirho}\n\n${focusTextChirho} Distinga el análisis lingüístico de la interpretación y señale lo que no sea seguro.\n\nMi pregunta: ${questionChirho.trim() || 'Ayúdeme a comprender este versículo.'}`
		: `I am reading ${languageChirho} with Hinneh. Please answer in English.\n\nPassage: ${verseChirho.id_chirho}\nOriginal text: ${verseChirho.canonical_text_chirho}\n\n${focusTextChirho} Distinguish language analysis from interpretation and identify uncertainty.\n\nMy question: ${questionChirho.trim() || 'Help me understand this verse.'}`;
}
