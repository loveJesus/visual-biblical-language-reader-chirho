// For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life. — John 3:16 (KJV)

import { expect as expectChirho, test as testChirho } from 'vitest';
import { render as renderChirho } from 'vitest-browser-svelte';
import { page as browserPageChirho } from 'vitest/browser';
import WordChirho from './WordChirho.svelte';
import { installHelpChirho } from './controls-chirho/help-controls-chirho';
import { syntheticTokenChirho } from '../../../tests-chirho/fixtures-chirho/synthetic-chirho';
import '../../routes/layout.css';

testChirho(
	'synthetic verb marks occupy physical sides and coexist with gender, number and sourced pattern help',
	async () => {
		const tokenChirho = syntheticTokenChirho({
			pos_chirho: 'verb',
			gender_chirho: 'feminine',
			number_chirho: 'dual',
			verb_code_chirho: '1A',
			form_note_chirho: {
				kind_chirho: 'predictable_weak',
				text_chirho: 'Synthetic predictable pattern; not a real analysis.',
				source_chirho: 'https://uhg.readthedocs.io/en/stable/verb.html'
			}
		});

		renderChirho(WordChirho, { tokenChirho });
		const cleanupChirho = installHelpChirho(document);
		try {
			const surfaceChirho = document.querySelector<HTMLElement>('.word-surface-chirho')!;
			const stemChirho = document.querySelector<HTMLElement>('.stem-marker-chirho')!;
			const formChirho = document.querySelector<HTMLElement>('.conjugation-marker-chirho')!;
			expectChirho(getComputedStyle(surfaceChirho).backgroundColor).toBe('rgb(255, 228, 237)');
			expectChirho(getComputedStyle(surfaceChirho).borderBottomColor).toBe('rgb(54, 163, 106)');
			expectChirho(getComputedStyle(surfaceChirho, '::before').borderTopStyle).toBe('dotted');
			expectChirho(stemChirho.getBoundingClientRect().x).toBeLessThan(
				formChirho.getBoundingClientRect().x
			);
			const triggerChirho = document.querySelector<HTMLButtonElement>(
				'.form-help-chirho button[data-help-trigger-chirho]'
			)!;
			triggerChirho.focus();
			expectChirho(triggerChirho.getAttribute('aria-expanded')).toBe('true');
			triggerChirho.click();
			expectChirho(
				document.getElementById(triggerChirho.getAttribute('aria-describedby')!)!.hidden
			).toBe(false);
			triggerChirho.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
			expectChirho(triggerChirho.getAttribute('aria-expanded')).toBe('false');
		} finally {
			cleanupChirho();
		}
	}
);

testChirho(
	'separate developer fixtures render the absent cue combinations for visual inspection',
	async () => {
		const previousDirectionChirho = document.body.dir;
		const previousFontChirho = document.body.style.fontSize;
		const previousFamilyChirho = document.body.style.fontFamily;
		const previousPaddingChirho = document.body.style.padding;
		await browserPageChirho.viewport(640, 600);
		document.body.dir = 'rtl';
		document.body.style.fontSize = '43px';
		document.body.style.fontFamily = 'var(--hebrew-chirho)';
		document.body.style.padding = '28px';
		const headingChirho = document.createElement('p');
		headingChirho.textContent = 'Synthetic developer fixtures; not biblical analyses.';
		headingChirho.dir = 'ltr';
		headingChirho.style.fontSize = '16px';
		document.body.appendChild(headingChirho);
		try {
			const noteChirho = {
				text_chirho: 'Synthetic documented-pattern fixture.',
				source_chirho: 'https://uhg.readthedocs.io/en/stable/verb.html'
			};
			const casesChirho = [
				syntheticTokenChirho({
					id_chirho: 'synthetic-1-chirho',
					gender_chirho: 'masculine',
					number_chirho: 'plural',
					state_chirho: 'construct',
					form_note_chirho: { ...noteChirho, kind_chirho: 'predictable_weak' }
				}),
				syntheticTokenChirho({
					id_chirho: 'synthetic-2-chirho',
					pos_chirho: 'verb',
					gender_chirho: 'feminine',
					number_chirho: 'dual',
					verb_code_chirho: '1A',
					form_note_chirho: { ...noteChirho, kind_chirho: 'exceptional' }
				}),
				syntheticTokenChirho({
					id_chirho: 'synthetic-3-chirho',
					pos_chirho: 'verb',
					gender_chirho: 'common',
					number_chirho: 'plural',
					verb_code_chirho: '7M',
					form_note_chirho: { ...noteChirho, kind_chirho: 'suppletive' }
				}),
				syntheticTokenChirho({
					id_chirho: 'synthetic-4-chirho',
					pos_chirho: 'unknown',
					gender_chirho: 'unknown',
					number_chirho: 'unknown'
				})
			];
			for (const tokenChirho of casesChirho) renderChirho(WordChirho, { tokenChirho });
			expectChirho(document.querySelectorAll('.word-unit-chirho')).toHaveLength(4);
			expectChirho(document.querySelectorAll('.pattern-solid-chirho')).toHaveLength(2);
		} finally {
			document.body.dir = previousDirectionChirho;
			document.body.style.fontSize = previousFontChirho;
			document.body.style.fontFamily = previousFamilyChirho;
			document.body.style.padding = previousPaddingChirho;
			headingChirho.remove();
		}
	}
);
