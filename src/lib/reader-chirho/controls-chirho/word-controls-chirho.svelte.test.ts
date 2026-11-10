// For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life. — John 3:16 (KJV)

import { afterEach as afterEachChirho, expect as expectChirho, test as testChirho } from 'vitest';
import { installWordNavigationChirho } from './word-controls-chirho';

let cleanupChirho: (() => void) | undefined;
afterEachChirho(() => {
	cleanupChirho?.();
	cleanupChirho = undefined;
});

testChirho(
	"a jump to the verse's folded source notes opens them, focuses them and keeps the passage URL",
	() => {
		const hostChirho = document.createElement('div');
		hostChirho.innerHTML =
			'<a href="#verse-notes-chirho" data-word-jump-chirho="verse-notes-chirho">Source note</a>' +
			'<details id="verse-notes-chirho" tabindex="-1"><summary>Source notes</summary><p>Note</p></details>';
		document.body.appendChild(hostChirho);
		const removeChirho = installWordNavigationChirho(document);
		cleanupChirho = () => {
			removeChirho();
			hostChirho.remove();
		};
		const hashChirho = location.hash;
		const notesChirho = hostChirho.querySelector('details')!;
		expectChirho(notesChirho.open).toBe(false);
		hostChirho.querySelector('a')!.click();
		expectChirho(notesChirho.open).toBe(true);
		expectChirho(document.activeElement).toBe(notesChirho);
		expectChirho(location.hash).toBe(hashChirho);
	}
);

testChirho('source word activation opens its exact modal without changing the passage URL', () => {
	const hostChirho = document.createElement('div');
	hostChirho.innerHTML =
		'<a class="word-jump-chirho" href="#navigation-card-chirho" data-word-jump-chirho="navigation-card-chirho">Λόγος</a><article id="navigation-card-chirho" class="word-card-chirho" tabindex="-1"></article>';
	document.body.appendChild(hostChirho);
	let openedChirho = '';
	const stopChirho = installWordNavigationChirho(document, (idChirho) => {
		openedChirho = idChirho;
	});
	cleanupChirho = () => {
		stopChirho();
		hostChirho.remove();
	};
	const hashChirho = location.hash;
	hostChirho.querySelector('a')!.click();
	expectChirho(openedChirho).toBe('navigation-card-chirho');
	expectChirho(location.hash).toBe(hashChirho);
	expectChirho(hostChirho.querySelector('a')!.getAttribute('aria-haspopup')).toBe('dialog');
});

testChirho(
	'hover is delayed, survives earlier leave timers and dismisses with Escape',
	async () => {
		const hostChirho = document.createElement('div');
		hostChirho.innerHTML =
			'<span id="navigation-old-chirho">old</span><a class="word-jump-chirho" href="#navigation-card-chirho" data-word-jump-chirho="navigation-card-chirho" data-word-meaning-chirho="Word" data-word-meaning-language-chirho="en">Λόγος</a><article id="navigation-card-chirho" class="word-card-chirho"></article>';
		document.body.appendChild(hostChirho);
		const stopChirho = installWordNavigationChirho(document);
		cleanupChirho = () => {
			stopChirho();
			hostChirho.remove();
		};
		const oldChirho = hostChirho.querySelector('span')!;
		const wordChirho = hostChirho.querySelector('a')!;
		oldChirho.dispatchEvent(new MouseEvent('mouseout', { bubbles: true }));
		oldChirho.dispatchEvent(new MouseEvent('mouseout', { bubbles: true }));
		wordChirho.dispatchEvent(new MouseEvent('mouseover', { bubbles: true }));
		await new Promise<void>((resolveChirho) => setTimeout(resolveChirho, 100));
		const tooltipChirho = document.querySelector<HTMLElement>('.word-meaning-tooltip-chirho')!;
		expectChirho(tooltipChirho.hidden).toBe(true);
		await new Promise<void>((resolveChirho) => setTimeout(resolveChirho, 200));
		expectChirho(tooltipChirho.hidden).toBe(false);
		expectChirho(tooltipChirho.textContent).toBe('Word');
		expectChirho(wordChirho.getAttribute('aria-describedby')).toBe(tooltipChirho.id);
		wordChirho.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
		expectChirho(tooltipChirho.hidden).toBe(true);
		expectChirho(wordChirho.hasAttribute('aria-describedby')).toBe(false);
	}
);
