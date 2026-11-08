// For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life. — John 3:16 (KJV)

import { expect as expectChirho, test as testChirho } from 'vitest';
import { render as renderChirho } from 'vitest-browser-svelte';
import ReadingCreditChirho from './ReadingCreditChirho.svelte';
import type { RecordingChirho } from './recordings-chirho';
import {
	BEERI_ATTRIBUTION_CHIRHO,
	BEERI_LICENSE_URL_CHIRHO
} from '$lib/domain-chirho/pronunciation-chirho/reading-source-chirho';

const readingChirho = {
	token_id_chirho: null,
	voice_name_chirho: "Rabbi Dan Be'eri",
	reading_source_chirho: {
		kind_chirho: 'human',
		attribution_chirho: BEERI_ATTRIBUTION_CHIRHO,
		license_chirho: 'CC BY-SA 3.0',
		license_url_chirho: BEERI_LICENSE_URL_CHIRHO
	}
} as unknown as RecordingChirho;

testChirho(
	'the human reading credit keeps the published attribution verbatim with its license link',
	() => {
		const { container: containerChirho } = renderChirho(ReadingCreditChirho, { readingChirho });
		const creditChirho = containerChirho.querySelector<HTMLElement>(
			'[data-reading-credit-chirho]'
		)!;
		expectChirho(creditChirho.textContent?.replace(/\s+/gu, ' ').trim()).toBe(
			`${BEERI_ATTRIBUTION_CHIRHO} · License`
		);
		expectChirho(creditChirho.querySelector('span')!.getAttribute('lang')).toBe('en');
		expectChirho(creditChirho.querySelector('a')!.getAttribute('href')).toBe(
			BEERI_LICENSE_URL_CHIRHO
		);
	}
);

testChirho('a reading without a human source renders no credit', () => {
	const { container: containerChirho } = renderChirho(ReadingCreditChirho, {
		readingChirho: { ...readingChirho, reading_source_chirho: undefined }
	});
	expectChirho(containerChirho.querySelector('[data-reading-credit-chirho]')).toBeNull();
});
