// For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life. — John 3:16 (KJV)

import { test as testChirho, expect as expectChirho } from 'vitest';
import { mount as mountChirho, unmount as unmountChirho, tick as tickChirho } from 'svelte';
import HelpChirho from '../HelpChirho.svelte';
import { installHelpChirho } from './help-controls-chirho';
testChirho(
	'newly rendered grammar cues show only the custom note and close with Escape',
	async () => {
		const hostChirho = document.createElement('div');
		document.body.appendChild(hostChirho);
		const removeChirho = installHelpChirho(document);
		const componentChirho = mountChirho(HelpChirho, {
			target: hostChirho,
			props: {
				idChirho: 'dynamic-note-chirho',
				labelChirho: '2',
				helpChirho: 'Subject receives the action.'
			}
		});
		try {
			await tickChirho();
			const triggerChirho = hostChirho.querySelector<HTMLButtonElement>('button')!;
			expectChirho(triggerChirho.hasAttribute('title')).toBe(false);
			triggerChirho.dispatchEvent(new MouseEvent('mouseover', { bubbles: true }));
			const popupChirho = hostChirho.querySelector<HTMLElement>('[role="tooltip"]')!;
			expectChirho(popupChirho.hidden).toBe(false);
			expectChirho(triggerChirho.getAttribute('aria-describedby')).toBe(popupChirho.id);
			triggerChirho.click();
			triggerChirho.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
			expectChirho(popupChirho.hidden).toBe(true);
		} finally {
			removeChirho();
			await unmountChirho(componentChirho);
			hostChirho.remove();
		}
	}
);
