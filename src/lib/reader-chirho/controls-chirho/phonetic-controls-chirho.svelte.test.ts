// For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life. — John 3:16 (KJV)
import {
	afterEach as afterEachChirho,
	expect as expectChirho,
	test as testChirho,
	vi as viChirho
} from 'vitest';
import { render as renderChirho } from 'vitest-browser-svelte';
import { syntheticTokenChirho } from '../../../../tests-chirho/fixtures-chirho/synthetic-chirho';
import WordIpaChirho from '../audio-chirho/WordIpaChirho.svelte';
import { installIpaChirho } from './ipa-controls-chirho';

const cleanupsChirho: Array<() => void> = [];
afterEachChirho(() => {
	while (cleanupsChirho.length) cleanupsChirho.pop()?.();
	viChirho.restoreAllMocks();
	localStorage.removeItem('hinneh-phonetic-display-chirho');
	localStorage.removeItem('hinneh-show-ipa-chirho');
});

function hostChirho(): HTMLElement {
	const hostChirho = document.createElement('section');
	hostChirho.innerHTML =
		'<div data-phonetic-locale-chirho="en" data-speech-recordings-chirho="[]"></div>' +
		'<fieldset><input type="radio" name="synthetic-phonetic-chirho" value="none" data-phonetic-choice-chirho disabled>' +
		'<input type="radio" name="synthetic-phonetic-chirho" value="ipa" data-phonetic-choice-chirho data-show-ipa-chirho disabled>' +
		'<input type="radio" name="synthetic-phonetic-chirho" value="transliteration" data-phonetic-choice-chirho disabled></fieldset>' +
		'<span data-word-ipa-chirho data-ipa-language-chirho="he" data-ipa-token-chirho="fixture-word-chirho" data-ipa-text-chirho="אָב" hidden></span>' +
		'<p data-ipa-guide-chirho hidden></p><p data-transliteration-guide-chirho hidden></p>';
	const wordChirho = hostChirho.querySelector<HTMLElement>('[data-word-ipa-chirho]')!;
	wordChirho.dataset.ipaValuesChirho = JSON.stringify([
		{ profile_chirho: 'he', ipa_chirho: 'guide-fixture-chirho' }
	]);
	document.body.appendChild(hostChirho);
	cleanupsChirho.push(() => hostChirho.remove());
	return hostChirho;
}

function choiceChirho(hostChirho: HTMLElement, valueChirho: string): HTMLInputElement {
	return hostChirho.querySelector<HTMLInputElement>(
		`[data-phonetic-choice-chirho][value="${valueChirho}"]`
	)!;
}

testChirho(
	'a legacy saved IPA choice migrates and keeps the exact matching recorded IPA first',
	() => {
		localStorage.setItem('hinneh-show-ipa-chirho', 'true');
		const rootChirho = hostChirho();
		rootChirho.querySelector<HTMLElement>(
			'[data-speech-recordings-chirho]'
		)!.dataset.speechRecordingsChirho = JSON.stringify([
			{
				token_id_chirho: 'another-word-chirho',
				text_chirho: 'אָב',
				pronunciation_chirho: 'israeli_hebrew',
				ipa_chirho: 'wrong-fixture-chirho'
			},
			{
				token_id_chirho: 'fixture-word-chirho',
				text_chirho: 'אָב',
				pronunciation_chirho: 'israeli_hebrew',
				ipa_chirho: 'recorded-fixture-chirho'
			}
		]);
		cleanupsChirho.push(installIpaChirho(rootChirho));
		expectChirho(choiceChirho(rootChirho, 'ipa').checked).toBe(true);
		expectChirho(localStorage.getItem('hinneh-phonetic-display-chirho')).toBe('ipa');
		expectChirho(rootChirho.querySelector('[data-word-ipa-chirho]')!.textContent).toBe(
			'/recorded-fixture-chirho/'
		);
		expectChirho(choiceChirho(rootChirho, 'transliteration').disabled).toBe(true);
	}
);

testChirho(
	'None persists and the controller still runs when serialized for an offline reader',
	() => {
		const rootChirho = hostChirho();
		const removeChirho = installIpaChirho(rootChirho);
		choiceChirho(rootChirho, 'ipa').click();
		expectChirho(rootChirho.querySelector<HTMLElement>('[data-word-ipa-chirho]')!.hidden).toBe(
			false
		);
		choiceChirho(rootChirho, 'none').click();
		expectChirho(localStorage.getItem('hinneh-phonetic-display-chirho')).toBe('none');
		removeChirho();
		const serializedChirho = Function(
			`return (${installIpaChirho.toString()});`
		)() as typeof installIpaChirho;
		cleanupsChirho.push(serializedChirho(rootChirho));
		expectChirho(choiceChirho(rootChirho, 'none').checked).toBe(true);
		expectChirho(rootChirho.querySelector<HTMLElement>('[data-word-ipa-chirho]')!.hidden).toBe(
			true
		);
	}
);

testChirho(
	'transliteration follows exact supplied language data and never falls back from Spanish to English',
	async () => {
		const rootChirho = hostChirho();
		const wordChirho = rootChirho.querySelector<HTMLElement>('[data-word-ipa-chirho]')!;
		wordChirho.dataset.transliterationValuesChirho = JSON.stringify({ en: 'English fixture' });
		cleanupsChirho.push(installIpaChirho(rootChirho));
		expectChirho(choiceChirho(rootChirho, 'transliteration').disabled).toBe(false);
		choiceChirho(rootChirho, 'transliteration').click();
		expectChirho(wordChirho.textContent).toBe('English fixture');
		rootChirho.querySelector<HTMLElement>(
			'[data-phonetic-locale-chirho]'
		)!.dataset.phoneticLocaleChirho = 'es';
		await viChirho.waitFor(() => expectChirho(wordChirho.hidden).toBe(true));
		expectChirho(choiceChirho(rootChirho, 'transliteration').disabled).toBe(true);
		expectChirho(localStorage.getItem('hinneh-phonetic-display-chirho')).toBe('transliteration');
		wordChirho.dataset.transliterationValuesChirho = JSON.stringify({
			en: 'English fixture',
			es: 'Spanish fixture'
		});
		await viChirho.waitFor(() => expectChirho(wordChirho.textContent).toBe('Spanish fixture'));
		expectChirho(wordChirho.hidden).toBe(false);
		expectChirho(wordChirho.lang).toBe('es');
	}
);

testChirho('a storage refusal leaves the current phonetic control usable', () => {
	viChirho.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
		throw Error('Storage unavailable');
	});
	viChirho.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
		throw Error('Storage unavailable');
	});
	const rootChirho = hostChirho();
	cleanupsChirho.push(installIpaChirho(rootChirho));
	expectChirho(choiceChirho(rootChirho, 'none').checked).toBe(true);
	choiceChirho(rootChirho, 'ipa').click();
	expectChirho(choiceChirho(rootChirho, 'ipa').checked).toBe(true);
	expectChirho(rootChirho.querySelector<HTMLElement>('[data-word-ipa-chirho]')!.hidden).toBe(false);
});

testChirho('structured transliteration is emitted only for the same token and spoken form', () => {
	const tokenChirho = syntheticTokenChirho();
	for (const [tokenIdChirho, spokenChirho, expectedChirho] of [
		['another-token-chirho', tokenChirho.text_chirho, {}],
		[tokenChirho.id_chirho, 'another spoken form', {}],
		[tokenChirho.id_chirho, tokenChirho.text_chirho, { en: 'Word fixture', es: null }]
	] as const) {
		const { container: containerChirho, unmount: unmountChirho } = renderChirho(WordIpaChirho, {
			tokenChirho,
			languageChirho: 'he',
			transliterationChirho: {
				token_id_chirho: tokenIdChirho,
				spoken_text_chirho: spokenChirho,
				values_chirho: { en: 'Word fixture', es: null }
			}
		});
		expectChirho(
			JSON.parse(
				containerChirho.querySelector<HTMLElement>('[data-word-ipa-chirho]')!.dataset
					.transliterationValuesChirho!
			)
		).toEqual(expectedChirho);
		unmountChirho();
	}
});
