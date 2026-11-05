// For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life. — John 3:16 (KJV)

import { describe, expect, it } from 'vitest';
import { readFileSync as readFileSyncChirho } from 'node:fs';
import {
	spokenVerseChirho,
	spokenWordChirho,
	wordPlaybackPlanChirho
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

it('assembles exact qere-aware words with short source-punctuation joins and no final delay', () => {
	const lessonChirho = JSON.parse(
		readFileSyncChirho('data-chirho/lessons-chirho/proverbs-26-1-chirho.json', 'utf8')
	);
	const beforeChirho = JSON.stringify(lessonChirho);
	const planChirho = wordPlaybackPlanChirho(lessonChirho);
	expect(planChirho.map((rowChirho) => rowChirho.token_id_chirho)).toEqual(
		lessonChirho.tokens_chirho.map((rowChirho: { id_chirho: string }) => rowChirho.id_chirho)
	);
	expect(planChirho.map((rowChirho) => rowChirho.text_chirho)).toEqual(
		lessonChirho.tokens_chirho.map(spokenWordChirho)
	);
	expect(planChirho[0].pause_after_chirho).toBe(130);
	expect(planChirho.some((rowChirho) => rowChirho.pause_after_chirho === 20)).toBe(true);
	expect(planChirho.at(-1)?.pause_after_chirho).toBe(0);
	expect(JSON.stringify(lessonChirho)).toBe(beforeChirho);
});
