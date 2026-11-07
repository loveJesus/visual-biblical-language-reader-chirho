// For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life. — John 3:16 (KJV)

import { createHash } from 'node:crypto';
import {
	afterEach as afterEachChirho,
	expect as expectChirho,
	test as testChirho,
	vi as viChirho
} from 'vitest';
import { fetchChapterMediaChirho, videosByLessonChirho } from './media-client-chirho';

const videoChirho = (lessonChirho: string, digitChirho = '1') => ({
	lesson_id_chirho: lessonChirho,
	sha256_chirho: digitChirho.repeat(64)
});

function serveChirho(videosChirho: unknown) {
	const bodyChirho = JSON.stringify({
		schema_version_chirho: 1,
		book_id_chirho: 'Prov',
		chapter_chirho: 1,
		scenes_chirho: [],
		icons_chirho: [],
		videos_chirho: videosChirho
	});
	const summaryChirho = JSON.stringify({
		schema_version_chirho: 1,
		book_id_chirho: 'Prov',
		scene_count_chirho: 0,
		icon_count_chirho: 0,
		chapters_chirho: [
			{
				number_chirho: 1,
				path_chirho: '/media-chirho/proverbs-chirho/chapter-01-chirho.json',
				sha256_chirho: createHash('sha256').update(bodyChirho).digest('hex'),
				scene_count_chirho: 0,
				icon_count_chirho: 0
			}
		]
	});
	viChirho.stubGlobal(
		'fetch',
		viChirho.fn(
			async (pathChirho: string) =>
				new Response(pathChirho.includes('summary') ? summaryChirho : bodyChirho)
		)
	);
}

afterEachChirho(() => viChirho.unstubAllGlobals());

testChirho('a chapter may list its verse videos, which are indexed by verse', async () => {
	serveChirho([videoChirho('Prov.1.1'), videoChirho('Prov.1.2', '2')]);
	const { chapterChirho } = await fetchChapterMediaChirho('Prov', 1);
	expectChirho(Object.keys(videosByLessonChirho(chapterChirho))).toEqual(['Prov.1.1', 'Prov.1.2']);
});

testChirho(
	'a video list that is not a list, too long, or from another chapter refuses the chapter',
	async () => {
		for (const videosChirho of [
			{ 0: videoChirho('Prov.1.1') },
			Array.from({ length: 201 }, () => videoChirho('Prov.1.1')),
			[videoChirho('Prov.2.1')]
		]) {
			serveChirho(videosChirho);
			await expectChirho(fetchChapterMediaChirho('Prov', 1)).rejects.toThrow();
		}
	}
);

testChirho('a verse listed twice gets no video rather than a guessed one', () => {
	expectChirho(
		videosByLessonChirho({
			videos_chirho: [
				videoChirho('Prov.1.1'),
				videoChirho('Prov.1.1', '2'),
				videoChirho('Prov.1.3', '3')
			]
		})
	).toEqual({ 'Prov.1.3': videoChirho('Prov.1.3', '3') });
	expectChirho(videosByLessonChirho({})).toEqual({});
	expectChirho(videosByLessonChirho(null)).toEqual({});
});
