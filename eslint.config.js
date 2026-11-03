// For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life. — John 3:16 (KJV)

import prettierChirho from 'eslint-config-prettier';
import pathChirho from 'node:path';
import jsChirho from '@eslint/js';
import svelteChirho from 'eslint-plugin-svelte';
import { defineConfig, globalIgnores, includeIgnoreFile } from 'eslint/config';
import globalsChirho from 'globals';
import tsChirho from 'typescript-eslint';

const gitignorePathChirho = pathChirho.resolve(import.meta.dirname, '.gitignore');

export default defineConfig(
	includeIgnoreFile(gitignorePathChirho),
	globalIgnores(['worker-configuration.d.ts', 'apps-chirho/**']),
	jsChirho.configs.recommended,
	tsChirho.configs.recommended,
	svelteChirho.configs.recommended,
	prettierChirho,
	svelteChirho.configs.prettier,
	{
		languageOptions: { globals: { ...globalsChirho.browser, ...globalsChirho.node } },
		rules: {
			// typescript-eslint strongly recommend that you do not use the no-undef lint rule on TypeScript projects.
			// see: https://typescript-eslint.io/troubleshooting/faqs/eslint/#i-get-errors-from-the-no-undef-rule-about-global-variables-not-being-defined-even-though-there-are-no-typescript-errors
			'no-undef': 'off'
		}
	},
	{
		files: ['**/*.svelte', '**/*.svelte.ts', '**/*.svelte.js'],
		languageOptions: {
			parserOptions: {
				projectService: true,
				extraFileExtensions: ['.svelte'],
				parser: tsChirho.parser
			}
		}
	},
	{
		// Override or add rule settings here, such as:
		// 'svelte/button-has-type': 'error'
		rules: {}
	}
);
