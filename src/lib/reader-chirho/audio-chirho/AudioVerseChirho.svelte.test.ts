// For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life. — John 3:16 (KJV)

import {
	beforeAll as beforeAllChirho,
	expect as expectChirho,
	test as testChirho,
	vi as viChirho
} from 'vitest';
import { render as renderChirho } from 'vitest-browser-svelte';
import AudioVerseChirho from './AudioVerseChirho.svelte';
import type { GreekLessonChirho } from '$lib/domain-chirho/greek-chirho';
import { chapterRecipeChirho } from '$lib/domain-chirho/pronunciation-chirho/chapter-recipe-chirho';
import type { RecordingChirho } from './recordings-chirho';
import { installSpeechChirho } from './speech-controls-chirho';
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
const aramaicLessonChirho = (chapterChirho: number) => {
	const lessonChirho = lessonForChirho(chapterChirho);
	return {
		...lessonChirho,
		tokens_chirho: lessonChirho.tokens_chirho.map((tokenChirho) => ({
			...tokenChirho,
			source_language_chirho: 'arc' as const
		}))
	};
};
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

let greekLessonChirho: GreekLessonChirho;
async function greekClipChirho(): Promise<RecordingChirho> {
	const recipeIdChirho = 'chatterbox-v3-modern-greek-verse-v1-chirho';
	const shaChirho = '6'.repeat(64);
	return {
		lesson_id_chirho: greekLessonChirho.id_chirho,
		canonical_sha256_chirho: await hexChirho(
			new TextEncoder().encode(greekLessonChirho.canonical_text_chirho)
		),
		language_chirho: 'el',
		pronunciation_chirho: 'modern_greek',
		token_id_chirho: null,
		text_chirho: spokenVerseChirho(greekLessonChirho),
		recipe_id_chirho: recipeIdChirho,
		synthesis_text_chirho: chapterRecipeChirho(greekLessonChirho, recipeIdChirho)!
			.synthesis_text_chirho,
		bytes_chirho: 1000,
		duration_chirho: 5,
		review_chirho: 'audition',
		voice_name_chirho: 'Chatterbox Multilingual V3 (built-in voice)',
		sha256_chirho: shaChirho,
		asset_path_chirho: `/audio-chirho/sha256-chirho/${shaChirho}-chirho.mp3`
	};
}
beforeAllChirho(async () => {
	const chapterChirho = (await (
		await fetch('/content-chirho/matthew-chirho/chapter-01-chirho.json')
	).json()) as { verses_chirho: GreekLessonChirho[] };
	greekLessonChirho = chapterChirho.verses_chirho.find(
		(lessonChirho) => lessonChirho.id_chirho === 'Matt.1.1'
	)!;
	const humanChirho = await clipChirho(1, '2', {
		voice_name_chirho: "Rabbi Dan Be'eri",
		duration_chirho: 4.95,
		reading_source_chirho: sourceChirho
	});
	const synthesizedChirho = await clipChirho(2, '1', {
		voice_name_chirho: 'Itamar',
		duration_chirho: 5
	});
	const aramaicHumanChirho = await clipChirho(3, '3', {
		voice_name_chirho: "Rabbi Dan Be'eri",
		duration_chirho: 4.95,
		reading_source_chirho: sourceChirho
	});
	const aramaicAiChirho = await clipChirho(4, '4', {
		voice_name_chirho: 'Itamar',
		duration_chirho: 5
	});
	const invalidHumanChirho = await clipChirho(5, '5', {
		voice_name_chirho: "Rabbi Dan Be'eri",
		duration_chirho: 4.95,
		reading_source_chirho: { ...sourceChirho, reader_id_chirho: 'unverified-chirho' }
	});
	// Human readings travel only in readings_chirho, which released apps ignore (GPT DM 3409).
	const chaptersChirho = [
		{ clips_chirho: [], readings_chirho: [humanChirho] },
		{ clips_chirho: [synthesizedChirho] },
		{ clips_chirho: [], readings_chirho: [aramaicHumanChirho] },
		{ clips_chirho: [aramaicAiChirho] },
		{ clips_chirho: [], readings_chirho: [invalidHumanChirho] }
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
	const greekBytesChirho = encodeChirho({
		schema_version_chirho: 1,
		book_id_chirho: 'Matt',
		chapter_chirho: 1,
		clips_chirho: [await greekClipChirho()]
	});
	filesChirho.set('/audio-chirho/matthew-chirho/chapter-01-chirho.json', greekBytesChirho);
	filesChirho.set(
		'/audio-chirho/manifest-chirho.json',
		encodeChirho({
			schema_version_chirho: 1,
			books_chirho: {
				Matt: {
					chapters_chirho: [
						{
							number_chirho: 1,
							path_chirho: '/audio-chirho/matthew-chirho/chapter-01-chirho.json',
							sha256_chirho: await hexChirho(greekBytesChirho)
						}
					]
				},
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

testChirho('one primary transport retains speed and live status', async () => {
	const { container: containerChirho, unmount: unmountChirho } = renderChirho(AudioVerseChirho, {
		lessonChirho: lessonForChirho(1)
	});
	await viChirho.waitFor(() => expectChirho(recordingsLoadedChirho(containerChirho)).toBe(1));
	expectChirho(
		containerChirho.querySelectorAll('.verse-play-chirho [data-pronounce-chirho]')
	).toHaveLength(1);
	expectChirho(containerChirho.querySelectorAll('[data-speech-rate-chirho]')).toHaveLength(1);
	expectChirho(
		containerChirho.querySelector('[data-audio-status-chirho]')?.getAttribute('aria-live')
	).toBe('polite');
	unmountChirho();
});

// A genuine human reading bypasses only the whole-verse Aramaic hold, never AI or invalid sources.
for (const [chapterChirho, enabledChirho, countChirho] of [
	[3, true, 1],
	[4, false, 1],
	[5, false, 0]
] as const) {
	testChirho(
		`Aramaic whole-verse playback: chapter ${chapterChirho} is ${enabledChirho ? 'enabled' : 'withheld'}`,
		async () => {
			let readyChirho = false;
			const { container: containerChirho, unmount: unmountChirho } = renderChirho(
				AudioVerseChirho,
				{
					lessonChirho: aramaicLessonChirho(chapterChirho),
					onReadyChirho: () => {
						readyChirho = true;
					}
				}
			);
			await viChirho.waitFor(() => {
				expectChirho(readyChirho).toBe(true);
				expectChirho(recordingsLoadedChirho(containerChirho)).toBe(countChirho);
			});
			const disposeChirho = installSpeechChirho(containerChirho);
			const buttonChirho = containerChirho.querySelector<HTMLButtonElement>(
				'[data-speech-saved-only-chirho]'
			)!;
			expectChirho(buttonChirho.disabled).toBe(!enabledChirho);
			expectChirho(buttonChirho.dataset.speechUnavailableChirho === 'true').toBe(!enabledChirho);
			expectChirho(buttonChirho.dataset.pronounceChirho).toBe(
				spokenVerseChirho(aramaicLessonChirho(chapterChirho))
			);
			disposeChirho.destroyChirho();
			unmountChirho();
		}
	);
}

testChirho(
	'a verified Greek full-verse clip can bind a video without claiming a human credit',
	async () => {
		const clipChirho = await greekClipChirho();
		const reportedChirho: (RecordingChirho | null)[] = [];
		const baseChirho = await videoForChirho();
		for (const [shaChirho, expectedChirho] of [
			[clipChirho.sha256_chirho, true],
			['7'.repeat(64), false]
		] as const) {
			const videoChirho = {
				...baseChirho,
				lesson_id_chirho: clipChirho.lesson_id_chirho,
				canonical_sha256_chirho: clipChirho.canonical_sha256_chirho,
				duration_chirho: 5,
				reading_language_chirho: 'el',
				embedded_reading_chirho: null,
				embedded_clip_chirho: {
					sha256_chirho: shaChirho,
					bytes_chirho: clipChirho.bytes_chirho,
					duration_chirho: clipChirho.duration_chirho,
					recipe_id_chirho: clipChirho.recipe_id_chirho!,
					pronunciation_chirho: clipChirho.pronunciation_chirho
				},
				attribution_chirho: 'Hinneh / Love Jesus Software',
				license_chirho: 'CC BY 4.0',
				license_url_chirho: 'https://creativecommons.org/licenses/by/4.0/'
			};
			const { container: containerChirho, unmount: unmountChirho } = renderChirho(
				AudioVerseChirho,
				{
					lessonChirho: greekLessonChirho,
					videoChirho,
					onHumanReadingChirho: (valueChirho) => reportedChirho.push(valueChirho)
				}
			);
			await viChirho.waitFor(() => expectChirho(recordingsLoadedChirho(containerChirho)).toBe(1));
			const controlsChirho = containerChirho.querySelector<HTMLElement>(
				'[data-audio-controls-chirho]'
			)!;
			expectChirho(controlsChirho.dataset.verseVideoClipShaChirho).toBe(
				expectedChirho ? clipChirho.sha256_chirho : undefined
			);
			expectChirho(reportedChirho.at(-1)).toBeNull();
			unmountChirho();
		}
	}
);
