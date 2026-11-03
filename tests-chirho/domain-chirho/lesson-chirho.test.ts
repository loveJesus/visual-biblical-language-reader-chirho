// For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life. — John 3:16 (KJV)

import { describe as describeChirho, expect as expectChirho, it as itChirho } from 'vitest';
import fixtureChirho from '../../data-chirho/lessons-chirho/proverbs-26-1-chirho.json';
import { readFileSync as readFileSyncChirho } from 'node:fs';
import { createHash as createHashChirho } from 'node:crypto';
import {
	safeSourceUrlChirho,
	sourceRunsChirho,
	validateLessonChirho
} from '../../src/lib/domain-chirho/lesson-chirho';
import { cuesChirho } from '../../src/lib/domain-chirho/cues-chirho';
import { legendRowsChirho } from '../../src/lib/domain-chirho/legend-chirho';
import { syntheticLessonChirho, syntheticTokenChirho } from '../fixtures-chirho/synthetic-chirho';

describeChirho('Pinned Proverbs 26:1 source contract', () => {
	itChirho('retains source bytes and explicitly distinguishes the normalized paste', () => {
		const lessonChirho = validateLessonChirho(fixtureChirho);
		const handoffChirho = readFileSyncChirho(
			'tests-chirho/fixtures-chirho/26-10-26-hebrew-visual-reader-handoff-chirho.txt',
			'utf8'
		);
		const pasteChirho = handoffChirho.split('Exact canonical verse:\n')[1].split('\n')[0];
		expectChirho(lessonChirho.canonical_text_chirho.normalize('NFD')).toBe(
			pasteChirho.normalize('NFD')
		);
		expectChirho(lessonChirho.canonical_text_chirho).not.toBe(pasteChirho);
		expectChirho(lessonChirho.canonical_text_chirho.normalize('NFC')).toBe(pasteChirho);
		expectChirho(
			sourceRunsChirho(lessonChirho)
				.map((runChirho) => runChirho.text_chirho)
				.join('')
		).toBe(lessonChirho.canonical_text_chirho);
	});
	itChirho('pins the recorded source checksum and carries license attribution', () => {
		const sourceChirho = fixtureChirho.sources_chirho.find(
			(entryChirho) =>
				entryChirho.sha256_chirho ===
				'964f99c00239b53b854c4686c99490c8d1ac7664784a30afdfc23781a3abb161'
		);
		expectChirho(sourceChirho).toBeDefined();
		expectChirho(
			createHashChirho('sha256')
				.update(readFileSyncChirho('data-chirho/sources-chirho/morphhb-chirho/wlc/Prov.xml'))
				.digest('hex')
		).toBe(sourceChirho!.sha256_chirho);
		expectChirho(
			fixtureChirho.sources_chirho.some((sourceChirho) =>
				sourceChirho.license_chirho.includes('CC BY')
			)
		).toBe(true);
	});
	itChirho('has nine words and five noun state markers without invented forms', () => {
		const lessonChirho = validateLessonChirho(fixtureChirho);
		expectChirho(lessonChirho.tokens_chirho).toHaveLength(9);
		expectChirho(
			lessonChirho.tokens_chirho.filter((tokenChirho) => tokenChirho.pos_chirho === 'noun')
		).toHaveLength(5);
		expectChirho(
			lessonChirho.tokens_chirho
				.map(cuesChirho)
				.filter((cueChirho) => cueChirho.state_marker_chirho === 'i')
		).toHaveLength(5);
		expectChirho(
			lessonChirho.tokens_chirho.some(
				(tokenChirho) =>
					tokenChirho.pos_chirho === 'verb' ||
					tokenChirho.gender_chirho === 'feminine' ||
					['plural', 'dual'].includes(tokenChirho.number_chirho) ||
					tokenChirho.form_note_chirho
			)
		).toBe(false);
		expectChirho(
			lessonChirho.tokens_chirho.find((tokenChirho) => tokenChirho.lemma_id_chirho === 'H3519')
				?.gender_chirho
		).toBe('common');
		expectChirho(
			lessonChirho.tokens_chirho.find((tokenChirho) => tokenChirho.lemma_id_chirho === 'H5000')
				?.root_text_chirho
		).toBeNull();
		expectChirho(
			lessonChirho.tokens_chirho.find((tokenChirho) => tokenChirho.lemma_id_chirho === 'H3651')
				?.lemma_augment_chirho
		).toBe('c');
	});
});

describeChirho('Curated input trust boundaries', () => {
	itChirho.each([
		'javascript:alert(1)',
		'data:text/html,bad',
		'file:///etc/passwd',
		'https://user:password@example.com'
	])('rejects unsafe source URL %s', (urlChirho) => {
		expectChirho(() => safeSourceUrlChirho(urlChirho)).toThrow();
	});
	itChirho('rejects a segment that splits a base from its mark', () => {
		const tokenChirho = syntheticTokenChirho({ segments_chirho: ['א', 'ָב'] });
		expectChirho(() => validateLessonChirho(syntheticLessonChirho(tokenChirho))).toThrow(
			/segmentation/
		);
	});
	itChirho('rejects reordered segments even if they are canonically equivalent', () => {
		const tokenChirho = syntheticTokenChirho({
			text_chirho: 'כַּ',
			segments_chirho: ['כַּ'],
			end_chirho: 3
		});
		expectChirho(() => validateLessonChirho(syntheticLessonChirho(tokenChirho))).toThrow(
			/segmentation/
		);
	});
	itChirho('rejects malformed spans and repeated IDs', () => {
		const lessonChirho = syntheticLessonChirho();
		lessonChirho.tokens_chirho[0].end_chirho = 2;
		expectChirho(() => validateLessonChirho(lessonChirho)).toThrow(/span/);
		const duplicatedChirho = syntheticLessonChirho();
		duplicatedChirho.tokens_chirho.push(duplicatedChirho.tokens_chirho[0]);
		expectChirho(() => validateLessonChirho(duplicatedChirho)).toThrow(/Duplicate/);
	});
	itChirho('requires a classification, real explanation and safe source for form marks', () => {
		const tokenChirho = syntheticTokenChirho({
			form_note_chirho: {
				kind_chirho: 'exceptional',
				text_chirho: '',
				source_chirho: 'https://example.com'
			}
		});
		expectChirho(() => validateLessonChirho(syntheticLessonChirho(tokenChirho))).toThrow();
		expectChirho(cuesChirho(tokenChirho).pattern_chirho).toBe('none');
		tokenChirho.form_note_chirho!.text_chirho = 'Synthetic explanation';
		tokenChirho.form_note_chirho!.source_chirho = 'javascript:alert(1)';
		expectChirho(cuesChirho(tokenChirho).pattern_chirho).toBe('none');
		expectChirho(() => validateLessonChirho(syntheticLessonChirho(tokenChirho))).toThrow();
	});
	itChirho('rejects unsupported verb codes instead of assigning a familiar code', () => {
		expectChirho(() =>
			validateLessonChirho(
				syntheticLessonChirho(syntheticTokenChirho({ pos_chirho: 'verb', verb_code_chirho: '8P' }))
			)
		).toThrow(/verb/);
		expectChirho(() =>
			validateLessonChirho(syntheticLessonChirho(syntheticTokenChirho({ verb_code_chirho: '1A' })))
		).toThrow(/verb/);
	});
});

describeChirho('Independent grammar cues in labeled developer fixtures', () => {
	itChirho.each(['masculine', 'feminine', 'common', 'unknown'] as const)(
		'keeps %s gender independent of dual, construct and weak form marks',
		(genderChirho) => {
			const cueChirho = cuesChirho(
				syntheticTokenChirho({
					gender_chirho: genderChirho,
					number_chirho: 'dual',
					state_chirho: 'construct',
					form_note_chirho: {
						kind_chirho: 'predictable_weak',
						text_chirho: 'Synthetic pattern explanation.',
						source_chirho: 'https://uhg.readthedocs.io/en/stable/verb.html'
					}
				})
			);
			expectChirho(cueChirho.number_color_chirho).toBe('#36a36a');
			expectChirho(cueChirho.state_marker_chirho).toBe('ii');
			expectChirho(cueChirho.pattern_chirho).toBe('dotted');
			expectChirho(cueChirho.background_chirho).toBe(
				genderChirho === 'masculine'
					? '#dff0ff'
					: genderChirho === 'feminine'
						? '#ffe4ed'
						: 'transparent'
			);
		}
	);
	itChirho.each(['exceptional', 'suppletive'] as const)(
		'keeps solid %s pattern independent of plural and verb code',
		(kindChirho) => {
			const cueChirho = cuesChirho(
				syntheticTokenChirho({
					pos_chirho: 'verb',
					number_chirho: 'plural',
					state_chirho: 'absolute',
					verb_code_chirho: '1A',
					form_note_chirho: {
						kind_chirho: kindChirho,
						text_chirho: 'Synthetic pattern.',
						source_chirho: 'https://uhg.readthedocs.io/en/stable/verb.html'
					}
				})
			);
			expectChirho(cueChirho.pattern_chirho).toBe('solid');
			expectChirho(cueChirho.number_color_chirho).toBe('#e9c92d');
			expectChirho(cueChirho.state_marker_chirho).toBe('');
			expectChirho([cueChirho.stem_marker_chirho, cueChirho.conjugation_marker_chirho]).toEqual([
				'1',
				'A'
			]);
		}
	);
	itChirho('never gives adjectives noun-state numerals', () => {
		expectChirho(
			cuesChirho(syntheticTokenChirho({ pos_chirho: 'adjective', state_chirho: 'absolute' }))
				.state_marker_chirho
		).toBe('');
	});
	itChirho('provides seven legend rows with separately described controls', () => {
		expectChirho(legendRowsChirho).toHaveLength(7);
		const itemsChirho = legendRowsChirho.flatMap((rowChirho) => rowChirho.items_chirho);
		expectChirho(new Set(itemsChirho.map((itemChirho) => itemChirho.id_chirho)).size).toBe(
			itemsChirho.length
		);
		expectChirho(
			legendRowsChirho
				.flatMap((rowChirho) => rowChirho.items_chirho)
				.every(
					(itemChirho) => itemChirho.help_chirho && safeSourceUrlChirho(itemChirho.source_chirho)
				)
		).toBe(true);
	});
});
