// For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life. — John 3:16 (KJV)
import { describe, it, expect, afterEach } from 'vitest';
import {
	readFile as readFileChirho,
	writeFile as writeFileChirho,
	mkdir as mkdirChirho,
	mkdtemp as mkdtempChirho,
	realpath as realpathChirho,
	rm as rmChirho
} from 'node:fs/promises';
import { tmpdir as tmpdirChirho } from 'node:os';
import { join as joinChirho } from 'node:path';
import fixturesChirho from '../../fixtures-chirho/audio-chirho/local-greek-verses-chirho.json';
import {
	localGreekClipChirho,
	type LocalGreekJobChirho
} from '../../../scripts-chirho/audio-chirho/local-greek-chirho/manifest_chirho';
import {
	localGreekVerseTextChirho,
	LOCAL_GREEK_VERSE_RECIPE_CHIRHO
} from '../../../src/lib/domain-chirho/pronunciation-chirho/greek-chirho/local-verse-chirho';
import {
	chapterRecipeChirho,
	greekPronunciationChirho
} from '../../../src/lib/domain-chirho/pronunciation-chirho/chapter-recipe-chirho';
import {
	commitCatalogueChirho,
	recoverCatalogueChirho
} from '../../../scripts-chirho/audio-chirho/local-greek-chirho/catalogue_commit_chirho';
import { sha256Chirho } from '../../../scripts-chirho/audio-chirho/audition_chirho';

const temporaryChirho: string[] = [];
afterEach(async () => {
	for (const pathChirho of temporaryChirho.splice(0))
		await rmChirho(pathChirho, { recursive: true, force: true });
});
async function fixtureChirho() {
	const rowChirho = structuredClone(fixturesChirho[0]);
	const chapterChirho = JSON.parse(
		await readFileChirho(
			new URL(
				'../../../static/content-chirho/' + rowChirho.job_chirho.content_path_chirho,
				import.meta.url
			),
			'utf8'
		)
	);
	const lessonChirho = chapterChirho.verses_chirho.find(
		(valueChirho: { id_chirho: string }) =>
			valueChirho.id_chirho === rowChirho.job_chirho.verse_id_chirho
	) as Parameters<typeof chapterRecipeChirho>[0];
	return { ...rowChirho, lesson_chirho: lessonChirho };
}
describe('local Greek source-bound verse import', () => {
	it('keeps canonical Scripture exact, derives plain monotonic input and never promotes aspiration', async () => {
		const rowChirho = await fixtureChirho();
		const clipChirho = localGreekClipChirho(
			rowChirho.job_chirho,
			rowChirho.delivery_chirho,
			rowChirho.lesson_chirho,
			rowChirho.job_chirho.content_sha256_chirho
		);
		expect(clipChirho.text_chirho).toBe(rowChirho.lesson_chirho.canonical_text_chirho);
		expect(clipChirho.synthesis_text_chirho).toBe(rowChirho.job_chirho.sent_chirho);
		expect(clipChirho.pronunciation_chirho).toBe('modern_greek');
		expect(greekPronunciationChirho(LOCAL_GREEK_VERSE_RECIPE_CHIRHO)).toBe('modern_greek');
		expect(localGreekVerseTextChirho('ὁ [Ἰησοῦς]· καὶ τῇ Μαρίᾳ·')).toBe('ο Ιησούς, και τη Μαρία,');
		expect(
			chapterRecipeChirho(
				{ ...rowChirho.lesson_chirho, id_chirho: 'Prov.1.2' },
				LOCAL_GREEK_VERSE_RECIPE_CHIRHO
			)
		).toBeNull();
	});
	it('excludes flagged or pending rows even when chosen contains a valid MP3', async () => {
		const rowChirho = await fixtureChirho();
		for (const stateChirho of ['flagged', 'pending'])
			expect(() =>
				localGreekClipChirho(
					{ ...rowChirho.job_chirho, state_chirho: stateChirho },
					rowChirho.delivery_chirho,
					rowChirho.lesson_chirho,
					rowChirho.job_chirho.content_sha256_chirho
				)
			).toThrow(/Only done/);
		const jobChirho: LocalGreekJobChirho = structuredClone(rowChirho.job_chirho);
		jobChirho.chosen_chirho!.asr_chirho.cer_chirho = 0.3501;
		expect(() =>
			localGreekClipChirho(
				jobChirho,
				rowChirho.delivery_chirho,
				rowChirho.lesson_chirho,
				jobChirho.content_sha256_chirho
			)
		).toThrow(/Only done/);
	});
	it('rejects changed source, sent spelling, automated-check identity and delivery lineage', async () => {
		const rowChirho = await fixtureChirho();
		for (const keyChirho of [
			'canonical_sha256_chirho',
			'content_sha256_chirho',
			'sent_sha256_chirho',
			'sent_chirho'
		] as const)
			expect(() =>
				localGreekClipChirho(
					{ ...rowChirho.job_chirho, [keyChirho]: 'changed' },
					rowChirho.delivery_chirho,
					rowChirho.lesson_chirho,
					rowChirho.job_chirho.content_sha256_chirho
				)
			).toThrow();
		const jobChirho: LocalGreekJobChirho = structuredClone(rowChirho.job_chirho);
		jobChirho.chosen_chirho!.asr_chirho.sha256_chirho = '0'.repeat(64);
		expect(() =>
			localGreekClipChirho(
				jobChirho,
				rowChirho.delivery_chirho,
				rowChirho.lesson_chirho,
				jobChirho.content_sha256_chirho
			)
		).toThrow();
		expect(() =>
			localGreekClipChirho(
				rowChirho.job_chirho,
				{ ...rowChirho.delivery_chirho, raw_flac_sha256_chirho: '0'.repeat(64) },
				rowChirho.lesson_chirho,
				rowChirho.job_chirho.content_sha256_chirho
			)
		).toThrow();
	});
});

async function catalogueFixtureChirho() {
	const rootChirho = await realpathChirho(
		await mkdtempChirho(joinChirho(tmpdirChirho(), 'hinneh-local-greek-chirho-'))
	);
	temporaryChirho.push(rootChirho);
	const homeChirho = joinChirho(rootChirho, 'recovery-chirho');
	await mkdirChirho(homeChirho);
	const chapterPathChirho = 'static/audio-chirho/matthew-chirho/chapter-01-chirho.json',
		indexPathChirho = 'static/audio-chirho/manifest-chirho.json';
	await mkdirChirho(joinChirho(rootChirho, 'static/audio-chirho/matthew-chirho'), {
		recursive: true
	});
	await writeFileChirho(joinChirho(rootChirho, chapterPathChirho), '{"before_chirho":1}\n');
	await writeFileChirho(joinChirho(rootChirho, indexPathChirho), '{"before_chirho":2}\n');
	const writesChirho = [
		{
			path_chirho: chapterPathChirho,
			before_sha256_chirho: sha256Chirho('{"before_chirho":1}\n'),
			text_chirho: '{"after_chirho":1}\n'
		},
		{
			path_chirho: indexPathChirho,
			before_sha256_chirho: sha256Chirho('{"before_chirho":2}\n'),
			text_chirho: '{"after_chirho":2}\n'
		}
	];
	return {
		root_chirho: rootChirho,
		home_chirho: homeChirho,
		writes_chirho: writesChirho,
		binding_chirho: 'a'.repeat(64)
	};
}
describe('recoverable catalogue commit', () => {
	it('recovers an interrupted chapter/index pair and subsequent runs are no-ops', async () => {
		const rowChirho = await catalogueFixtureChirho();
		await writeFileChirho(
			joinChirho(rowChirho.home_chirho, 'catalogue-commit-chirho.json'),
			JSON.stringify({
				binding_sha256_chirho: rowChirho.binding_chirho,
				writes_chirho: rowChirho.writes_chirho
			})
		);
		await writeFileChirho(
			joinChirho(rowChirho.root_chirho, rowChirho.writes_chirho[0].path_chirho),
			rowChirho.writes_chirho[0].text_chirho
		);
		expect(
			await recoverCatalogueChirho(
				rowChirho.root_chirho,
				rowChirho.home_chirho,
				rowChirho.binding_chirho
			)
		).toBe(true);
		for (const writeChirho of rowChirho.writes_chirho)
			expect(
				await readFileChirho(joinChirho(rowChirho.root_chirho, writeChirho.path_chirho), 'utf8')
			).toBe(writeChirho.text_chirho);
		expect(
			await recoverCatalogueChirho(
				rowChirho.root_chirho,
				rowChirho.home_chirho,
				rowChirho.binding_chirho
			)
		).toBe(false);
		await commitCatalogueChirho(
			rowChirho.root_chirho,
			rowChirho.home_chirho,
			rowChirho.binding_chirho,
			rowChirho.writes_chirho
		);
		expect(
			await readFileChirho(
				joinChirho(rowChirho.root_chirho, rowChirho.writes_chirho[1].path_chirho),
				'utf8'
			)
		).toBe(rowChirho.writes_chirho[1].text_chirho);
	});
	it('refuses foreign edits before any write and refuses another input binding', async () => {
		const rowChirho = await catalogueFixtureChirho();
		await writeFileChirho(
			joinChirho(rowChirho.home_chirho, 'catalogue-commit-chirho.json'),
			JSON.stringify({
				binding_sha256_chirho: rowChirho.binding_chirho,
				writes_chirho: rowChirho.writes_chirho
			})
		);
		await writeFileChirho(
			joinChirho(rowChirho.root_chirho, rowChirho.writes_chirho[1].path_chirho),
			'{"foreign_chirho":true}'
		);
		await expect(
			recoverCatalogueChirho(rowChirho.root_chirho, rowChirho.home_chirho, rowChirho.binding_chirho)
		).rejects.toThrow(/Foreign/);
		expect(
			await readFileChirho(
				joinChirho(rowChirho.root_chirho, rowChirho.writes_chirho[0].path_chirho),
				'utf8'
			)
		).toBe('{"before_chirho":1}\n');
		await expect(
			recoverCatalogueChirho(rowChirho.root_chirho, rowChirho.home_chirho, 'b'.repeat(64))
		).rejects.toThrow(/another input/);
	});
});
