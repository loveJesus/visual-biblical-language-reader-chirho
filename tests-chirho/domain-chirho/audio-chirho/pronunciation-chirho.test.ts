// For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life. — John 3:16 (KJV)

import { describe, expect, it } from 'vitest';
import { readFileSync as readFileSyncChirho } from 'node:fs';
import {
	spokenVerseChirho,
	spokenWordChirho
} from '../../../src/lib/domain-chirho/pronunciation-chirho';

describe('original-language spoken text', () => {
	it('preserves source punctuation and combining-mark order without speaking grammar annotations', () => {
		const lessonChirho = JSON.parse(
			readFileSyncChirho('data-chirho/lessons-chirho/proverbs-26-1-chirho.json', 'utf8')
		);
		const beforeChirho = JSON.stringify(lessonChirho);
		expect(spokenVerseChirho(lessonChirho)).toBe(lessonChirho.canonical_text_chirho);
		expect(JSON.stringify(lessonChirho)).toBe(beforeChirho);
	});
	it('speaks the source qere while retaining the written ketiv and its spans', () => {
		const chapterChirho = JSON.parse(
			readFileSyncChirho('static/content-chirho/proverbs-chirho/chapter-19-chirho.json', 'utf8')
		);
		const lessonChirho = chapterChirho.verses_chirho[18];
		const tokenChirho = lessonChirho.tokens_chirho[0];
		const beforeChirho = JSON.stringify(lessonChirho);
		expect(spokenWordChirho(tokenChirho)).toBe(
			tokenChirho.qere_chirho
				.map((readingChirho: { text_chirho: string }) => readingChirho.text_chirho)
				.join(' ')
		);
		expect(spokenVerseChirho(lessonChirho)).toBe(
			spokenWordChirho(tokenChirho) +
				lessonChirho.canonical_text_chirho.slice(tokenChirho.end_chirho)
		);
		expect(JSON.stringify(lessonChirho)).toBe(beforeChirho);
	});
	it('retains every word in a multiword read form and keeps Greek source punctuation', () => {
		expect(
			spokenWordChirho({
				text_chirho: 'written',
				qere_chirho: [{ text_chirho: 'read' }, { text_chirho: 'words' }]
			})
		).toBe('read words');
		const chapterChirho = JSON.parse(
			readFileSyncChirho('static/content-chirho/john-chirho/chapter-01-chirho.json', 'utf8')
		);
		for (const lessonChirho of chapterChirho.verses_chirho)
			expect(spokenVerseChirho(lessonChirho)).toBe(lessonChirho.canonical_text_chirho);
	});
});
