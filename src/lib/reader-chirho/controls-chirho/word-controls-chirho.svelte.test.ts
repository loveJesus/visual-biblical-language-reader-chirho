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
