// For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life. — John 3:16 (KJV)
import { describe, expect, it } from 'vitest';
import { lexiconLinkChirho } from '../../../src/lib/bible-chirho/lexicon-links-chirho';

describe('outbound lexicon lookup', () => {
	it('preserves checked Hebrew homographs and the selected lexicon language', () => {
		expect(
			lexiconLinkChirho({ lemma_id_chirho: 'H7105', lemma_augment_chirho: 'a' }, 'es')
		).toEqual({
			href_chirho: 'https://lexicon-chirho.bible.systems/lemma-chirho/H7105a?lang=spa',
			kind_chirho: 'entry'
		});
		expect(lexiconLinkChirho({ lemma_id_chirho: 'H7105' }, 'en')?.kind_chirho).toBe('search');
	});
	it('pads lookup IDs without asserting a shared Greek Strong number is one lexical form', () => {
		expect(lexiconLinkChirho({ lemma_id_chirho: 'G518' }, 'en')).toEqual({
			href_chirho: 'https://lexicon-chirho.bible.systems/search-chirho?q=G0518&lang=eng',
			kind_chirho: 'search'
		});
		expect(lexiconLinkChirho({ lemma_id_chirho: 'H430' }, 'es')?.href_chirho).toContain(
			'q=H0430&lang=spa'
		);
	});
	it('refuses invalid identities and cannot turn a supplied map into an arbitrary or mismatched URL', () => {
		for (const lemmaChirho of ['oshb:b', 'G0', 'H12345', 'H430/../x', 'H0430'])
			expect(lexiconLinkChirho({ lemma_id_chirho: lemmaChirho }, 'en')).toBeNull();
		for (const hrefChirho of [
			'https://example.com/',
			'https://lexicon-chirho.bible.systems/lemma-chirho/H7019',
			'javascript:alert(1)'
		])
			expect(
				lexiconLinkChirho({ lemma_id_chirho: 'H7950' }, 'en', { H7950: hrefChirho })?.kind_chirho
			).toBe('search');
	});
});
