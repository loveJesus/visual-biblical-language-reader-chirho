// For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life. — John 3:16 (KJV)

import { readFileSync as readFileSyncChirho } from 'node:fs';
import { describe as describeChirho, expect as expectChirho, it as itChirho } from 'vitest';
import { greekCuesChirho } from '../../src/lib/domain-chirho/greek-cues-chirho';
import type { GreekLessonChirho } from '../../src/lib/domain-chirho/greek-chirho';

const lessonsChirho: GreekLessonChirho[] = JSON.parse(
	readFileSyncChirho('static/content-chirho/john-chirho/chapter-01-chirho.json', 'utf8')
).verses_chirho;
const tokensChirho = lessonsChirho.flatMap((lessonChirho) => lessonChirho.tokens_chirho);

describeChirho('Greek compact cues', () => {
	itChirho('separates nominal case from verbal tense, voice, person and mood', () => {
		const openingChirho = lessonsChirho[0].tokens_chirho;
		expectChirho(greekCuesChirho(openingChirho[0])).toEqual({
			left_chirho: '',
			center_chirho: '',
			right_chirho: ''
		});
		expectChirho(greekCuesChirho(openingChirho[1])).toEqual({
			left_chirho: '',
			center_chirho: 'iii',
			right_chirho: ''
		});
		expectChirho(greekCuesChirho(openingChirho[2])).toEqual({
			left_chirho: 'Ia',
			center_chirho: '',
			right_chirho: '3I'
		});
		const participleChirho = tokensChirho.find(
			(tokenChirho) => tokenChirho.raw_morphology_chirho === 'V-PAP-NSM'
		)!;
		expectChirho(greekCuesChirho(participleChirho)).toEqual({
			left_chirho: 'Pa',
			center_chirho: 'i',
			right_chirho: 'P'
		});
	});
	itChirho('preserves second forms and the source voice distinctions', () => {
		for (const [voiceChirho, codeChirho] of [
			['active', 'a'],
			['middle', 'm'],
			['passive', 'p'],
			['middle or passive', 'e'],
			['middle deponent', 'd'],
			['passive deponent', 'o'],
			['middle or passive deponent', 'n']
		]) {
			const tokenChirho = {
				...lessonsChirho[0].tokens_chirho[2],
				tense_chirho: 'second aorist',
				voice_chirho: voiceChirho
			};
			expectChirho(greekCuesChirho(tokenChirho).left_chirho).toBe(`2A${codeChirho}`);
		}
	});
	itChirho('leaves unavailable values unmarked and never changes source text', () => {
		const tokenChirho = structuredClone(lessonsChirho[0].tokens_chirho[0]);
		const beforeChirho = structuredClone(tokenChirho);
		expectChirho(greekCuesChirho(tokenChirho)).toEqual({
			left_chirho: '',
			center_chirho: '',
			right_chirho: ''
		});
		expectChirho(tokenChirho).toEqual(beforeChirho);
	});
});
