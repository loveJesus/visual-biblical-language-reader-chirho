// For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life. — John 3:16 (KJV)

import { expect as expectChirho, test as testChirho, vi as viChirho } from 'vitest';
import { render as renderChirho } from 'vitest-browser-svelte';
import SceneChirho from './SceneChirho.svelte';
import {
	BEERI_ATTRIBUTION_CHIRHO,
	BEERI_LICENSE_URL_CHIRHO
} from '$lib/domain-chirho/pronunciation-chirho/reading-source-chirho';

const canonicalChirho = 'מִשְׁלֵי שְׁלֹמֹה';
const sceneShaChirho = 'a'.repeat(64);
const presentationChirho = {
	asset_path_chirho: '/assets-chirho/scenes-chirho/test-chirho/prov-01-001-chirho.webp',
	sha256_chirho: sceneShaChirho,
	alt_chirho: 'A king writes proverbs.',
	width_chirho: 1200,
	height_chirho: 900,
	reading_note_chirho: 'Test scene.'
};
async function videoChirho(changesChirho: Record<string, unknown> = {}) {
	const digestChirho = await crypto.subtle.digest(
		'SHA-256',
		new TextEncoder().encode(canonicalChirho)
	);
	const shaChirho = 'b'.repeat(64);
	return {
		lesson_id_chirho: 'Prov.1.1',
		asset_path_chirho: `/video-chirho/sha256-chirho/${shaChirho}-chirho.mp4`,
		sha256_chirho: shaChirho,
		bytes_chirho: 1_551_755,
		duration_chirho: 4.958,
		width_chirho: 1108,
		height_chirho: 832,
		scene_sha256_chirho: sceneShaChirho,
		canonical_sha256_chirho: Array.from(new Uint8Array(digestChirho), (byteChirho) =>
			byteChirho.toString(16).padStart(2, '0')
		).join(''),
		reading_language_chirho: 'he',
		embedded_reading_chirho: {
			kind_chirho: 'human',
			reader_id_chirho: 'rdb-chirho',
			gbt_id_chirho: 'OT/RDB/Pro',
			package_sha256_chirho: 'c'.repeat(64),
			chapter_sha256_chirho: 'd'.repeat(64),
			timings_sha256_chirho: 'e'.repeat(64),
			start_chirho: 0,
			end_chirho: 4.95,
			chapter_duration_chirho: 219.996,
			attribution_chirho: BEERI_ATTRIBUTION_CHIRHO,
			license_chirho: 'CC BY-SA 3.0',
			license_url_chirho: BEERI_LICENSE_URL_CHIRHO
		},
		attribution_chirho: BEERI_ATTRIBUTION_CHIRHO,
		license_chirho: 'CC BY-SA 3.0',
		license_url_chirho: BEERI_LICENSE_URL_CHIRHO,
		review_chirho: 'pending',
		...changesChirho
	};
}
const renderSceneChirho = async (changesChirho: Record<string, unknown> = {}) =>
	renderChirho(SceneChirho, {
		presentationChirho,
		verseIdChirho: 'Prov.1.1',
		canonicalTextChirho: canonicalChirho,
		videoChirho: await videoChirho(changesChirho)
	});

testChirho(
	'a valid verse video waits hidden behind the still, loads nothing, and carries verse-text captions',
	async () => {
		const { container: containerChirho } = await renderSceneChirho();
		await viChirho.waitFor(() =>
			expectChirho(containerChirho.querySelector('video[data-scene-video-chirho]')).not.toBeNull()
		);
		const videoChirho = containerChirho.querySelector<HTMLVideoElement>('video')!;
		expectChirho([videoChirho.hidden, videoChirho.preload, videoChirho.autoplay]).toEqual([
			true,
			'none',
			false
		]);
		expectChirho(videoChirho.poster).toContain('prov-01-001-chirho.webp');
		const captionsChirho = decodeURIComponent(
			containerChirho.querySelector('track[kind="captions"]')!.getAttribute('src')!.split(',')[1]
		);
		expectChirho(captionsChirho).toBe(
			`WEBVTT\n\n00:00:00.000 --> 00:00:04.958\n${canonicalChirho}\n`
		);
		// The parent's shared verse transport is the only primary action below the media.
		expectChirho(containerChirho.querySelector('button[data-verse-video-play-chirho]')).toBeNull();
	}
);

testChirho(
	'a video from another scene, or one failing the shared rules, is never shown',
	async () => {
		for (const changesChirho of [
			{ scene_sha256_chirho: 'f'.repeat(64) },
			{ duration_chirho: 9 },
			{ license_chirho: 'CC0' }
		]) {
			const { container: containerChirho, unmount: unmountChirho } =
				await renderSceneChirho(changesChirho);
			// Long enough for the canonical hash a valid video needs (the first test shows it within this).
			await new Promise((resolveChirho) => setTimeout(resolveChirho, 200));
			expectChirho(containerChirho.querySelector('video')).toBeNull();
			expectChirho(containerChirho.querySelector('[data-verse-video-play-chirho]')).toBeNull();
			unmountChirho();
		}
	}
);
