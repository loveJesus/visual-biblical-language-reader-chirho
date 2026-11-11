// For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life. — John 3:16 (KJV)
import { afterEach as afterEachChirho, expect as expectChirho, test as testChirho } from 'vitest';
import { installMeaningsChirho } from './meaning-controls-chirho';
let cleanupChirho: (() => void) | undefined;
afterEachChirho(() => {
	cleanupChirho?.();
	cleanupChirho = undefined;
	localStorage.removeItem('hinneh-translation-display-chirho');
});
function fixtureChirho() {
	const hostChirho = document.createElement('div');
	hostChirho.innerHTML =
		'<fieldset><label><input type="radio" name="translation-chirho" value="none" data-translation-display-chirho>None</label><label data-translation-mode-chirho="readers"><input type="radio" name="translation-chirho" value="readers" data-translation-display-chirho>Readers</label><label data-translation-mode-chirho="terse"><input type="radio" name="translation-chirho" value="terse" data-translation-display-chirho>Terse</label></fieldset><span class="word-unit-chirho"><a class="word-jump-chirho" data-meaning-token-chirho="w1-chirho" data-word-jump-chirho="meaning-test-card-chirho"><span data-source-word-chirho>Λόγος</span></a><span class="word-meaning-chirho" data-word-meaning-chirho hidden></span></span><article id="meaning-test-card-chirho"><p class="word-gloss-chirho" lang="en">Word</p></article>';
	const dataChirho = document.createElement('div');
	dataChirho.hidden = true;
	dataChirho.dataset.translationLocaleChirho = 'en';
	dataChirho.dataset.verseTranslationsChirho = JSON.stringify({
		terse_chirho: { words_chirho: [{ token_id_chirho: 'w1-chirho', gloss_chirho: 'Word' }] }
	});
	hostChirho.appendChild(dataChirho);
	document.body.appendChild(hostChirho);
	const stopChirho = installMeaningsChirho(document);
	cleanupChirho = () => {
		stopChirho();
		hostChirho.remove();
	};
	return hostChirho;
}
testChirho('the annotation never replaces source letters and choices persist', async () => {
	const hostChirho = fixtureChirho();
	const wordChirho = hostChirho.querySelector('a')!;
	const outputChirho = hostChirho.querySelector<HTMLElement>('.word-meaning-chirho')!;
	expectChirho(wordChirho.textContent).toBe('Λόγος');
	expectChirho(outputChirho.hidden).toBe(true);
	hostChirho.querySelector<HTMLInputElement>('[value="terse"]')!.click();
	await new Promise<void>((resolveChirho) => setTimeout(resolveChirho, 0));
	expectChirho(outputChirho.textContent).toBe('Word');
	expectChirho(outputChirho.hidden).toBe(false);
	expectChirho(wordChirho.textContent).toBe('Λόγος');
	expectChirho(wordChirho.hidden).toBe(false);
	expectChirho(localStorage.getItem('hinneh-translation-display-chirho')).toBe('terse');
	hostChirho.querySelector<HTMLInputElement>('[value="none"]')!.click();
	expectChirho(outputChirho.hidden).toBe(true);
	expectChirho(wordChirho.dataset.wordMeaningChirho).toBe('Word');
});
testChirho(
	'unavailable modes stay hidden; current-language changes cannot expose hidden English',
	async () => {
		localStorage.setItem('hinneh-translation-display-chirho', 'readers');
		const hostChirho = fixtureChirho();
		expectChirho(
			hostChirho.querySelector<HTMLElement>('[data-translation-mode-chirho="readers"]')!.hidden
		).toBe(true);
		const cardChirho = hostChirho.querySelector('article')!;
		hostChirho.querySelector<HTMLElement>(
			'[data-verse-translations-chirho]'
		)!.dataset.verseTranslationsChirho = '{}';
		cardChirho.innerHTML =
			'<p class="word-gloss-chirho" lang="en" hidden>Word</p><p class="word-gloss-chirho" lang="es" data-meaning-unavailable-chirho="true">Sin traducción</p>';
		await new Promise<void>((resolveChirho) => setTimeout(resolveChirho, 0));
		expectChirho(hostChirho.querySelector<HTMLElement>('a')!.dataset.wordMeaningChirho).toBe('');
		expectChirho(
			hostChirho.querySelector<HTMLElement>('[data-translation-mode-chirho="terse"]')!.hidden
		).toBe(true);
		const dataChirho = hostChirho.querySelector<HTMLElement>('[data-verse-translations-chirho]')!;
		dataChirho.dataset.translationLocaleChirho = 'es';
		dataChirho.dataset.verseTranslationsChirho = JSON.stringify({
			readers_chirho: {
				words_chirho: [{ token_id_chirho: 'w1-chirho', gloss_chirho: 'La Palabra' }]
			}
		});
		await new Promise<void>((resolveChirho) => setTimeout(resolveChirho, 0));
		expectChirho(hostChirho.querySelector<HTMLElement>('.word-meaning-chirho')!.textContent).toBe(
			'La Palabra'
		);
		expectChirho(hostChirho.querySelector<HTMLInputElement>('[value="readers"]')!.checked).toBe(
			true
		);
		expectChirho(
			hostChirho.querySelector<HTMLElement>('a')!.dataset.wordMeaningLanguageChirho
		).toBe('es');
	}
);

testChirho(
	'None hover uses Terse then Readers then the existing interface-language meaning',
	async () => {
		const hostChirho = fixtureChirho();
		const dataChirho = hostChirho.querySelector<HTMLElement>('[data-verse-translations-chirho]')!;
		const linkChirho = hostChirho.querySelector<HTMLElement>('a')!;
		const setChirho = async (terseChirho: string | null, readersChirho: string | null) => {
			dataChirho.dataset.verseTranslationsChirho = JSON.stringify({
				...(terseChirho === null
					? {}
					: {
							terse_chirho: {
								words_chirho: [{ token_id_chirho: 'w1-chirho', gloss_chirho: terseChirho }]
							}
						}),
				...(readersChirho === null
					? {}
					: {
							readers_chirho: {
								words_chirho: [{ token_id_chirho: 'w1-chirho', gloss_chirho: readersChirho }]
							}
						})
			});
			await new Promise((resolveChirho) => setTimeout(resolveChirho, 0));
		};
		await setChirho('short', 'expanded');
		expectChirho(linkChirho.dataset.wordMeaningChirho).toBe('short');
		expectChirho(hostChirho.querySelector<HTMLElement>('.word-meaning-chirho')!.hidden).toBe(true);
		await setChirho('', 'expanded');
		expectChirho(linkChirho.dataset.wordMeaningChirho).toBe('expanded');
		await setChirho(null, null);
		expectChirho(linkChirho.dataset.wordMeaningChirho).toBe('Word');
		dataChirho.dataset.translationLocaleChirho = 'es';
		await setChirho(null, null);
		expectChirho(linkChirho.dataset.wordMeaningChirho).toBe('');
		await setChirho('breve', 'amplio');
		expectChirho(linkChirho.dataset.wordMeaningChirho).toBe('breve');
		expectChirho(linkChirho.dataset.wordMeaningLanguageChirho).toBe('es');
	}
);
