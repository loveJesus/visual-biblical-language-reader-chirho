// For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life. — John 3:16 (KJV)
import { describe, expect, it } from 'vitest';
import { readdirSync, readFileSync } from 'node:fs';
import {
	greekAnalysisChirho,
	greekCategoryChirho,
	greekRunsChirho,
	validateGreekLessonChirho,
	type GreekLessonChirho
} from '../../src/lib/domain-chirho/greek-chirho';
import {
	iconsForLessonChirho,
	validateIconsChirho
} from '../../src/lib/domain-chirho/media-chirho';

const directoryChirho = 'data-chirho/corpus-chirho/john-chirho/';
const lessonsChirho: GreekLessonChirho[] = readdirSync(directoryChirho)
	.filter((fileChirho) => /^chapter-\d\d-chirho\.json$/.test(fileChirho))
	.flatMap(
		(fileChirho) => JSON.parse(readFileSync(directoryChirho + fileChirho, 'utf8')).verses_chirho
	);
describe('Greek corpus', () => {
	it('requires the exact Greek lexical form when attaching a contextual icon', () => {
		const lessonChirho = lessonsChirho[0];
		const tokenChirho = lessonChirho.tokens_chirho[0];
		const iconChirho = {
			lesson_id_chirho: lessonChirho.id_chirho,
			token_id_chirho: tokenChirho.id_chirho,
			lemma_id_chirho: tokenChirho.lemma_id_chirho,
			lemma_augment_chirho: null,
			lexical_form_chirho: tokenChirho.lexical_form_chirho,
			sense_id_chirho: 'test-chirho',
			contextual_meaning_chirho: 'contextual sense',
			asset_path_chirho: '/assets-chirho/test-chirho.webp',
			alt_chirho: 'A picture',
			width_chirho: 128,
			height_chirho: 128,
			sha256_chirho: 'a'.repeat(64),
			sense_review_chirho: 'agent_reviewed',
			art_review_chirho: 'pending',
			evidence_refs_chirho: [lessonChirho.sources_chirho[0].id_chirho],
			display_authority_chirho: 'local review'
		};
		const manifestChirho = {
			schema_version_chirho: 1,
			lesson_id_chirho: lessonChirho.id_chirho,
			icons_chirho: [iconChirho]
		};
		expect(validateIconsChirho(manifestChirho, lessonChirho)[tokenChirho.id_chirho]).toBeDefined();
		expect(
			iconsForLessonChirho(
				{
					...manifestChirho,
					icons_chirho: [{ ...iconChirho, token_id_chirho: 'not-displayed' }, iconChirho]
				},
				lessonChirho
			)[tokenChirho.id_chirho]
		).toBeDefined();
		iconChirho.lexical_form_chirho = 'different form';
		expect(() => validateIconsChirho(manifestChirho, lessonChirho)).toThrow('contextual word');
	});
	it('validates and reconstructs every staged verse', () => {
		expect(lessonsChirho).toHaveLength(879);
		for (const lessonChirho of lessonsChirho) {
			validateGreekLessonChirho(lessonChirho);
			expect(
				greekRunsChirho(lessonChirho)
					.map((runChirho) => runChirho.text_chirho)
					.join('')
			).toBe(lessonChirho.canonical_text_chirho);
		}
	});
	it('rejects bad spans, hidden source text and missing provenance', () => {
		const lessonChirho = structuredClone(lessonsChirho[0]);
		lessonChirho.tokens_chirho[0].end_chirho++;
		expect(() => validateGreekLessonChirho(lessonChirho)).toThrow();
		const gapChirho = structuredClone(lessonsChirho[0]);
		gapChirho.canonical_text_chirho = 'x' + gapChirho.canonical_text_chirho;
		for (const tokenChirho of gapChirho.tokens_chirho) {
			tokenChirho.start_chirho++;
			tokenChirho.end_chirho++;
		}
		expect(() => validateGreekLessonChirho(gapChirho)).toThrow();
		const sourceChirho = structuredClone(lessonsChirho[0]);
		sourceChirho.sources_chirho = [];
		expect(() => validateGreekLessonChirho(sourceChirho)).toThrow();
	});
	it('preserves different lexical forms under shared Strong IDs and Greek-specific categories', () => {
		const tokensChirho = lessonsChirho.flatMap((lessonChirho) => lessonChirho.tokens_chirho);
		const formsChirho = new Map<string, Set<string>>();
		for (const tokenChirho of tokensChirho) {
			if (!formsChirho.has(tokenChirho.lemma_id_chirho))
				formsChirho.set(tokenChirho.lemma_id_chirho, new Set());
			formsChirho.get(tokenChirho.lemma_id_chirho)!.add(tokenChirho.lexical_form_chirho);
		}
		expect(
			[...formsChirho.values()].filter((formsChirho) => formsChirho.size > 1).length
		).toBeGreaterThanOrEqual(5);
		expect(
			greekCategoryChirho(
				tokensChirho.find((tokenChirho) => tokenChirho.part_of_speech_chirho === 'article')!
			)
		).toBe('article');
		expect(
			greekCategoryChirho(
				tokensChirho.find(
					(tokenChirho) => tokenChirho.part_of_speech_chirho === 'relative pronoun'
				)!
			)
		).toBe('pronoun');
		expect(
			greekAnalysisChirho(
				tokensChirho.find((tokenChirho) => tokenChirho.gender_chirho === 'neuter')!
			)
		).toContain('neuter');
	});
});
