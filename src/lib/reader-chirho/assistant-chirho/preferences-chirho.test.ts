// For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life. — John 3:16 (KJV)
import { describe as describeChirho, it as itChirho, expect as expectChirho } from 'vitest';
import {
	AI_PROVIDERS_CHIRHO,
	aiPromptChirho,
	aiVoiceAvailableChirho,
	parseAiPreferencesChirho
} from './preferences-chirho';
const preferenceChirho = {
	schema_version_chirho: 1,
	provider_chirho: 'chatgpt_chirho',
	mode_chirho: 'text_chirho',
	focus_chirho: 'both_chirho'
};
describeChirho('local unset AI handoff preferences', () => {
	itChirho('starts unset and withholds malformed or injected destinations', () => {
		expectChirho(parseAiPreferencesChirho(null)).toBeNull();
		for (const rawChirho of [
			'{}',
			'{',
			' '.repeat(2049),
			JSON.stringify({ ...preferenceChirho, provider_chirho: 'javascript:alert(1)' }),
			JSON.stringify({ ...preferenceChirho, schema_version_chirho: 2 })
		])
			expectChirho(parseAiPreferencesChirho(rawChirho)).toBeNull();
		expectChirho(
			parseAiPreferencesChirho(
				JSON.stringify({ ...preferenceChirho, url_chirho: 'https://evil.test' })
			)
		).toEqual(preferenceChirho);
	});
	itChirho('allows only the guided ChatGPT-mobile voice choice and trusted home origins', () => {
		expectChirho(aiVoiceAvailableChirho('chatgpt_chirho', true)).toBe(true);
		expectChirho(aiVoiceAvailableChirho('chatgpt_chirho', false)).toBe(false);
		expectChirho(aiVoiceAvailableChirho('claude_chirho', true)).toBe(false);
		expectChirho(
			parseAiPreferencesChirho(
				JSON.stringify({
					...preferenceChirho,
					provider_chirho: 'claude_chirho',
					mode_chirho: 'voice_chirho'
				})
			)
		).toBeNull();
		expectChirho(
			Object.values(AI_PROVIDERS_CHIRHO)
				.filter((providerChirho) => providerChirho.url_chirho)
				.every(
					(providerChirho) =>
						new URL(providerChirho.url_chirho!).protocol === 'https:' &&
						new URL(providerChirho.url_chirho!).search === ''
				)
		).toBe(true);
	});
	itChirho(
		'builds a bounded current-verse prompt without using cookies storage or any network call',
		() => {
			const verseChirho = {
				id_chirho: 'John.1.1',
				canonical_text_chirho: 'Ἐν ἀρχῇ ἦν ὁ λόγος',
				language_chirho: 'grc'
			};
			const promptChirho = aiPromptChirho(verseChirho, 'What is logos?', 'en', 'language_chirho');
			expectChirho(promptChirho).toContain(verseChirho.canonical_text_chirho);
			expectChirho(promptChirho).toContain('John.1.1');
			expectChirho(promptChirho).toContain('What is logos?');
			expectChirho(aiPromptChirho(verseChirho, '', 'es', 'context_chirho')).toContain('español');
			expectChirho(() =>
				aiPromptChirho(verseChirho, 'x'.repeat(2001), 'en', 'both_chirho')
			).toThrow();
		}
	);
});
