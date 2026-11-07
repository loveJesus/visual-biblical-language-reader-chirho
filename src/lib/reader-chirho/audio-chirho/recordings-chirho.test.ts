// For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life. — John 3:16 (KJV)

import { createHash } from 'node:crypto';
import {
	afterEach as afterEachChirho,
	expect as expectChirho,
	test as testChirho,
	vi as viChirho
} from 'vitest';
import { spokenVerseChirho, spokenWordChirho } from '$lib/domain-chirho/pronunciation-chirho';
import {
	BEERI_ATTRIBUTION_CHIRHO,
	BEERI_LICENSE_URL_CHIRHO
} from '$lib/domain-chirho/pronunciation-chirho/reading-source-chirho';

const shaChirho = (valueChirho: string | Uint8Array) =>
	createHash('sha256').update(valueChirho).digest('hex');
const wordsChirho = ['מִשְׁלֵי', 'שְׁלֹמֹה'];
const canonicalChirho = wordsChirho.join(' ');
const lessonChirho = {
	id_chirho: 'Prov.1.1',
	canonical_text_chirho: canonicalChirho,
	tokens_chirho: wordsChirho.map((textChirho, indexChirho) => {
		const startChirho = canonicalChirho.indexOf(textChirho);
		return {
			id_chirho: `human-test-${indexChirho + 1}-chirho`,
			text_chirho: textChirho,
			start_chirho: startChirho,
			end_chirho: startChirho + textChirho.length
		};
	})
};
const sourceChirho = {
	kind_chirho: 'human',
	reader_id_chirho: 'rdb-chirho',
	gbt_id_chirho: 'OT/RDB/Pro',
	package_sha256_chirho: 'a'.repeat(64),
	chapter_sha256_chirho: 'b'.repeat(64),
	timings_sha256_chirho: 'c'.repeat(64),
	start_chirho: 0,
	end_chirho: 4.95,
	chapter_duration_chirho: 219.996,
	attribution_chirho: BEERI_ATTRIBUTION_CHIRHO,
	license_chirho: 'CC BY-SA 3.0',
	license_url_chirho: BEERI_LICENSE_URL_CHIRHO
};

function clipChirho(digitChirho: string, fieldsChirho: Record<string, unknown>) {
	const hashChirho = digitChirho.repeat(64);
	return {
		lesson_id_chirho: lessonChirho.id_chirho,
		canonical_sha256_chirho: shaChirho(canonicalChirho),
		language_chirho: 'he',
		pronunciation_chirho: 'israeli_hebrew',
		bytes_chirho: 1000,
		review_chirho: 'audition',
		token_id_chirho: null,
		text_chirho: spokenVerseChirho(lessonChirho),
		sha256_chirho: hashChirho,
		asset_path_chirho: `/audio-chirho/sha256-chirho/${hashChirho}-chirho.mp3`,
		...fieldsChirho
	};
}

async function selectedChirho(clipsChirho: Record<string, unknown>[], readingsChirho?: unknown) {
	const chapterChirho = new TextEncoder().encode(
		JSON.stringify({
			schema_version_chirho: 1,
			book_id_chirho: 'Prov',
			chapter_chirho: 1,
			clips_chirho: clipsChirho,
			...(readingsChirho === undefined ? {} : { readings_chirho: readingsChirho })
		})
	);
	const filesChirho = new Map<string, Uint8Array>([
		['/audio-chirho/proverbs-chirho/chapter-01-chirho.json', chapterChirho],
		[
			'/audio-chirho/manifest-chirho.json',
			new TextEncoder().encode(
				JSON.stringify({
					schema_version_chirho: 1,
					books_chirho: {
						Prov: {
							chapters_chirho: [
								{
									number_chirho: 1,
									path_chirho: '/audio-chirho/proverbs-chirho/chapter-01-chirho.json',
									sha256_chirho: shaChirho(chapterChirho)
								}
							]
						}
					}
				})
			)
		]
	]);
	viChirho.stubGlobal('fetch', async (pathChirho: string) => {
		const bytesChirho = filesChirho.get(pathChirho);
		if (!bytesChirho) throw Error(`Unexpected fetch ${pathChirho}`);
		return new Response(Buffer.from(bytesChirho));
	});
	viChirho.resetModules();
	const { recordingsForLessonChirho } = await import('./recordings-chirho');
	return (await recordingsForLessonChirho(lessonChirho)).map((rowChirho) =>
		rowChirho.sha256_chirho.slice(0, 1)
	);
}

const humanChirho = { voice_name_chirho: "Rabbi Dan Be'eri", duration_chirho: 4.95 };
const synthesizedVerseChirho = () =>
	clipChirho('1', { voice_name_chirho: 'Itamar', duration_chirho: 5, review_chirho: 'approved' });
const wordClipChirho = () =>
	clipChirho('5', {
		voice_name_chirho: 'Itamar',
		duration_chirho: 1,
		token_id_chirho: lessonChirho.tokens_chirho[0].id_chirho,
		text_chirho: spokenWordChirho(lessonChirho.tokens_chirho[0])
	});

afterEachChirho(() => viChirho.unstubAllGlobals());

testChirho(
	'a human reading from readings_chirho joins the word and AI clips and sorts before an approved AI verse',
	async () => {
		expectChirho(
			await selectedChirho(
				[synthesizedVerseChirho(), wordClipChirho()],
				[clipChirho('2', { ...humanChirho, reading_source_chirho: sourceChirho })]
			)
		).toEqual(['2', '1', '5']);
	}
);

testChirho(
	'every readings_chirho entry must be a valid human reading; a legacy clip with an invalid source is refused too',
	async () => {
		expectChirho(
			await selectedChirho(
				[
					clipChirho('9', {
						...humanChirho,
						reading_source_chirho: { ...sourceChirho, gbt_id_chirho: 'OT/RDB/Gen' }
					})
				],
				[
					synthesizedVerseChirho(),
					clipChirho('3', {
						...humanChirho,
						reading_source_chirho: { ...sourceChirho, license_chirho: 'CC BY 4.0' }
					}),
					clipChirho('4', { ...humanChirho, ipa_chirho: 'x', reading_source_chirho: sourceChirho }),
					clipChirho('6', {
						...humanChirho,
						start_offset_chirho: 0,
						end_offset_chirho: 1,
						reading_source_chirho: sourceChirho
					}),
					clipChirho('7', {
						...humanChirho,
						duration_chirho: 6,
						reading_source_chirho: sourceChirho
					}),
					clipChirho('8', {
						...humanChirho,
						voice_name_chirho: 'Itamar',
						reading_source_chirho: sourceChirho
					})
				]
			)
		).toEqual([]);
	}
);

testChirho(
	'a chapter whose readings_chirho is not a list, or whose clips and readings exceed 2000, is refused',
	async () => {
		await expectChirho(selectedChirho([wordClipChirho()], { 0: 'not a list' })).rejects.toThrow(
			'Invalid recording chapter'
		);
		// Placeholder entries keep the catalogue under its separate 2 MB bound, so only the count decides.
		await expectChirho(
			selectedChirho(
				Array.from({ length: 1000 }, () => ({})),
				Array.from({ length: 1001 }, () => ({}))
			)
		).rejects.toThrow('Invalid recording chapter');
		expectChirho(
			await selectedChirho(
				[wordClipChirho()],
				Array.from({ length: 1999 }, () => ({}))
			)
		).toEqual(['5']);
	}
);
