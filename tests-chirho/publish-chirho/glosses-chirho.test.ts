// For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life. — John 3:16 (KJV)
import { describe, expect, it } from 'vitest';
import { verifyGlossesChirho } from '../../scripts-chirho/publish-chirho/gloss_rules_chirho';
import {
	classifyPathChirho,
	sha256Chirho,
	type FilesChirho
} from '../../scripts-chirho/publish-chirho/release_rules_chirho';

const CHAPTER_PATH_CHIRHO = 'glosses-chirho/es-chirho/proverbs-chirho/chapter-01-chirho.json';
const CONTENT_PATH_CHIRHO = 'content-chirho/proverbs-chirho/chapter-01-chirho.json';
function fixtureChirho(
	changeChirho?: (chapterChirho: Record<string, unknown>) => void
): FilesChirho {
	const contentChirho = JSON.stringify({
		verses_chirho: [{ tokens_chirho: [{ id_chirho: 'word1' }, { id_chirho: 'word2' }] }]
	});
	const chapterChirho: Record<string, unknown> = {
		schema_version_chirho: 1,
		book_id_chirho: 'Prov',
		chapter_chirho: 1,
		language_chirho: 'es',
		gloss_state_chirho: 'gbt_approved',
		content_path_chirho: `/${CONTENT_PATH_CHIRHO}`,
		content_sha256_chirho: sha256Chirho(contentChirho),
		glosses_chirho: { word1: 'sabiduría', word2: null },
		glossed_chirho: 1,
		missing_chirho: 1,
		source_chirho: {
			url_chirho: `https://github.com/globalbibletools/data/blob/${'a'.repeat(40)}/spa/20-Pro.json`,
			sha256_chirho: 'a'.repeat(64),
			license_chirho: 'CC0 1.0 Universal',
			attribution_chirho: 'Spanish glosses by Global Bible Tools'
		}
	};
	changeChirho?.(chapterChirho);
	const bytesChirho = JSON.stringify(chapterChirho);
	const manifestChirho = {
		schema_version_chirho: 1,
		language_chirho: 'es',
		gloss_state_chirho: 'gbt_approved',
		books_chirho: {
			Prov: {
				chapters_chirho: [
					{
						number_chirho: 1,
						path_chirho: `/${CHAPTER_PATH_CHIRHO}`,
						sha256_chirho: sha256Chirho(bytesChirho),
						glossed_chirho: 1,
						missing_chirho: 1
					}
				]
			}
		}
	};
	return new Map(
		[
			[CONTENT_PATH_CHIRHO, contentChirho],
			[CHAPTER_PATH_CHIRHO, bytesChirho],
			['glosses-chirho/es-chirho/manifest-chirho.json', JSON.stringify(manifestChirho)]
		].map(([pathChirho, textChirho]) => [pathChirho, new TextEncoder().encode(textChirho)])
	);
}
function problemsChirho(filesChirho: FilesChirho) {
	const reasonsChirho: string[] = [];
	verifyGlossesChirho(filesChirho, reasonsChirho);
	return reasonsChirho;
}
describe('Spanish static publication', () => {
	it('ships only the declared bounded chapter namespace', () => {
		expect(problemsChirho(fixtureChirho())).toEqual([]);
		expect(classifyPathChirho(CHAPTER_PATH_CHIRHO)).toBe('static');
		expect(classifyPathChirho('glosses-chirho/es-chirho/prompt-chirho.txt')).not.toBe('static');
		const filesChirho = fixtureChirho();
		filesChirho.set(
			'glosses-chirho/es-chirho/john-chirho/chapter-01-chirho.json',
			new TextEncoder().encode('{}')
		);
		expect(problemsChirho(filesChirho).join(' ')).toContain('not listed');
	});
	it('refuses drift in either the translated bytes or the underlying original chapter', () => {
		for (const pathChirho of [CHAPTER_PATH_CHIRHO, CONTENT_PATH_CHIRHO]) {
			const filesChirho = fixtureChirho();
			filesChirho.set(pathChirho, new TextEncoder().encode('{}'));
			expect(problemsChirho(filesChirho).length).toBeGreaterThan(0);
		}
	});
	it('refuses machine states, foreign word identities and false coverage', () => {
		for (const changeChirho of [
			(chapterChirho: Record<string, unknown>) => {
				chapterChirho.gloss_state_chirho = 'machine';
			},
			(chapterChirho: Record<string, unknown>) => {
				chapterChirho.glosses_chirho = { foreign: 'otro' };
			},
			(chapterChirho: Record<string, unknown>) => {
				chapterChirho.glossed_chirho = 2;
			},
			(chapterChirho: Record<string, unknown>) => {
				chapterChirho.content_path_chirho = '/content-chirho/john-chirho/chapter-01-chirho.json';
			}
		])
			expect(problemsChirho(fixtureChirho(changeChirho)).length).toBeGreaterThan(0);
	});
	it('requires intact pinned source and license provenance', () => {
		expect(
			problemsChirho(
				fixtureChirho((chapterChirho) => {
					chapterChirho.source_chirho = {};
				})
			).length
		).toBeGreaterThan(0);
		const filesChirho = fixtureChirho();
		filesChirho.delete('glosses-chirho/es-chirho/manifest-chirho.json');
		expect(problemsChirho(filesChirho).length).toBeGreaterThan(0);
	});
});
