// For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life. — John 3:16 (KJV)

import {
	beforeAll as beforeAllChirho,
	expect as expectChirho,
	test as testChirho,
	vi as viChirho
} from 'vitest';
import { render as renderChirho } from 'vitest-browser-svelte';
import AudioVerseChirho from './AudioVerseChirho.svelte';
import type { RecordingChirho } from './recordings-chirho';
import { syntheticLessonChirho } from '../../../../tests-chirho/fixtures-chirho/synthetic-chirho';
import { spokenVerseChirho } from '$lib/domain-chirho/pronunciation-chirho';
import {
	BEERI_ATTRIBUTION_CHIRHO,
	BEERI_LICENSE_URL_CHIRHO
} from '$lib/domain-chirho/pronunciation-chirho/reading-source-chirho';

// The real catalogue loader and the shared human-reading validator run against a served fixture.
const lessonForChirho = (chapterChirho: number) => ({
	...syntheticLessonChirho(),
	id_chirho: `Prov.${chapterChirho}.1`
});
const hexChirho = async (bytesChirho: Uint8Array<ArrayBuffer>) =>
	Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256', bytesChirho)), (byteChirho) =>
		byteChirho.toString(16).padStart(2, '0')
	).join('');
const encodeChirho = (valueChirho: unknown) =>
	new TextEncoder().encode(JSON.stringify(valueChirho));

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
// A verse video whose sound was cut from the given window of the same chapter recording.
async function videoForChirho(endChirho = 4.95) {
	const shaChirho = '9'.repeat(64);
	return {
		lesson_id_chirho: 'Prov.1.1',
		asset_path_chirho: `/video-chirho/sha256-chirho/${shaChirho}-chirho.mp4`,
		sha256_chirho: shaChirho,
		bytes_chirho: 1_500_000,
		duration_chirho: endChirho,
		width_chirho: 1108,
		height_chirho: 832,
		scene_sha256_chirho: 'e'.repeat(64),
		canonical_sha256_chirho: await hexChirho(
			new TextEncoder().encode(lessonForChirho(1).canonical_text_chirho)
		),
		reading_language_chirho: 'he',
		embedded_reading_chirho: { ...sourceChirho, end_chirho: endChirho },
		attribution_chirho: BEERI_ATTRIBUTION_CHIRHO,
		license_chirho: 'CC BY-SA 3.0',
		license_url_chirho: BEERI_LICENSE_URL_CHIRHO,
		review_chirho: 'pending'
	};
}

async function clipChirho(
	chapterChirho: number,
	digitChirho: string,
	fieldsChirho: Record<string, unknown>
) {
	const lessonChirho = lessonForChirho(chapterChirho);
	const hashChirho = digitChirho.repeat(64);
	return {
		lesson_id_chirho: lessonChirho.id_chirho,
		canonical_sha256_chirho: await hexChirho(
			new TextEncoder().encode(lessonChirho.canonical_text_chirho)
		),
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

beforeAllChirho(async () => {
	const humanChirho = await clipChirho(1, '2', {
		voice_name_chirho: "Rabbi Dan Be'eri",
		duration_chirho: 4.95,
		reading_source_chirho: sourceChirho
	});
	const synthesizedChirho = await clipChirho(2, '1', {
		voice_name_chirho: 'Itamar',
		duration_chirho: 5
	});
	// Human readings travel only in readings_chirho, which released apps ignore (GPT DM 3409).
	const chaptersChirho = [
		{ clips_chirho: [], readings_chirho: [humanChirho] },
		{ clips_chirho: [synthesizedChirho] }
	].map((arraysChirho, indexChirho) =>
		encodeChirho({
			schema_version_chirho: 1,
			book_id_chirho: 'Prov',
			chapter_chirho: indexChirho + 1,
			...arraysChirho
		})
	);
	const filesChirho = new Map<string, Uint8Array<ArrayBuffer>>(
		chaptersChirho.map((bytesChirho, indexChirho) => [
			`/audio-chirho/proverbs-chirho/chapter-0${indexChirho + 1}-chirho.json`,
			bytesChirho
		])
	);
	filesChirho.set(
		'/audio-chirho/manifest-chirho.json',
		encodeChirho({
			schema_version_chirho: 1,
			books_chirho: {
				Prov: {
					chapters_chirho: await Promise.all(
						chaptersChirho.map(async (bytesChirho, indexChirho) => ({
							number_chirho: indexChirho + 1,
							path_chirho: `/audio-chirho/proverbs-chirho/chapter-0${indexChirho + 1}-chirho.json`,
							sha256_chirho: await hexChirho(bytesChirho)
						}))
					)
				}
			}
		})
	);
	viChirho.stubGlobal('fetch', async (pathChirho: string) => {
		const bytesChirho = filesChirho.get(pathChirho);
		if (!bytesChirho) throw Error(`Unexpected fetch ${pathChirho}`);
		return new Response(new Blob([bytesChirho]));
	});
});

// L.J. (2026-11-07): credits belong in an info view, so the reader shows this credit in the Sources fold.
testChirho(
	'the human reading is reported for the Sources fold; no credit or AI wording sits under Play',
	async () => {
		const reportedChirho: (RecordingChirho | null)[] = [];
		const { container: containerChirho } = renderChirho(AudioVerseChirho, {
			lessonChirho: lessonForChirho(1),
			onHumanReadingChirho: (readingChirho) => reportedChirho.push(readingChirho)
		});
		await viChirho.waitFor(() =>
			expectChirho(reportedChirho.at(-1)?.sha256_chirho).toBe('2'.repeat(64))
		);
		expectChirho(reportedChirho.at(-1)?.reading_source_chirho?.attribution_chirho).toBe(
			BEERI_ATTRIBUTION_CHIRHO
		);
		expectChirho(containerChirho.querySelector('[data-reading-credit-chirho]')).toBeNull();
		expectChirho(containerChirho.textContent).not.toMatch(/\bAI\b|audition/iu);
	}
);

const recordingsLoadedChirho = (containerChirho: HTMLElement) =>
	JSON.parse(
		containerChirho
			.querySelector('[data-audio-controls-chirho]')!
			.getAttribute('data-speech-recordings-chirho')!
	).length;

testChirho('a verse with only a synthesized reading reports no human reading', async () => {
	const reportedChirho: (RecordingChirho | null)[] = [];
	const { container: containerChirho } = renderChirho(AudioVerseChirho, {
		lessonChirho: lessonForChirho(2),
		onHumanReadingChirho: (readingChirho) => reportedChirho.push(readingChirho)
	});
	await viChirho.waitFor(() => expectChirho(recordingsLoadedChirho(containerChirho)).toBe(1));
	expectChirho(reportedChirho.at(-1)).toBeNull();
	expectChirho(containerChirho.querySelector('[data-reading-credit-chirho]')).toBeNull();
});

testChirho(
	"the player learns of a verse video only when the video's sound is exactly this human reading",
	async () => {
		for (const [endChirho, expectedChirho] of [
			[4.95, { video: '9'.repeat(64), clip: '2'.repeat(64) }],
			[6.0, { video: undefined, clip: undefined }]
		] as const) {
			const { container: containerChirho, unmount: unmountChirho } = renderChirho(
				AudioVerseChirho,
				{ lessonChirho: lessonForChirho(1), videoChirho: await videoForChirho(endChirho) }
			);
			await viChirho.waitFor(() => expectChirho(recordingsLoadedChirho(containerChirho)).toBe(1));
			const controlsChirho = containerChirho.querySelector<HTMLElement>(
				'[data-audio-controls-chirho]'
			)!;
			expectChirho({
				video: controlsChirho.dataset.verseVideoShaChirho,
				clip: controlsChirho.dataset.verseVideoClipShaChirho
			}).toEqual(expectedChirho);
			unmountChirho();
		}
	}
);
