// For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life. — John 3:16 (KJV)
import { it as itChirho, expect as expectChirho } from 'vitest';
import {
	validVerseVideoChirho,
	sameEmbeddedReadingChirho,
	type VerseVideoChirho
} from '../../../src/lib/domain-chirho/verse-video-chirho';
import {
	BEERI_ATTRIBUTION_CHIRHO,
	BEERI_LICENSE_URL_CHIRHO,
	type ReadingSourceChirho
} from '../../../src/lib/domain-chirho/pronunciation-chirho/reading-source-chirho';

const sourceChirho: ReadingSourceChirho = {
	kind_chirho: 'human',
	reader_id_chirho: 'rdb-chirho',
	gbt_id_chirho: 'OT/RDB/Pro',
	package_sha256_chirho: 'd'.repeat(64),
	chapter_sha256_chirho: 'e'.repeat(64),
	timings_sha256_chirho: 'f'.repeat(64),
	start_chirho: 2,
	end_chirho: 7,
	chapter_duration_chirho: 200,
	attribution_chirho: BEERI_ATTRIBUTION_CHIRHO,
	license_chirho: 'CC BY-SA 3.0',
	license_url_chirho: BEERI_LICENSE_URL_CHIRHO
};
const videoChirho: VerseVideoChirho = {
	lesson_id_chirho: 'Prov.1.1',
	canonical_sha256_chirho: 'a'.repeat(64),
	scene_sha256_chirho: 'b'.repeat(64),
	sha256_chirho: 'c'.repeat(64),
	asset_path_chirho: '/video-chirho/sha256-chirho/' + 'c'.repeat(64) + '-chirho.mp4',
	bytes_chirho: 1024,
	duration_chirho: 5,
	width_chirho: 1108,
	height_chirho: 832,
	reading_language_chirho: 'he',
	embedded_reading_chirho: sourceChirho,
	attribution_chirho: BEERI_ATTRIBUTION_CHIRHO,
	license_chirho: 'CC BY-SA 3.0',
	license_url_chirho: BEERI_LICENSE_URL_CHIRHO,
	review_chirho: 'pending'
};
const validChirho = (valueChirho: unknown) =>
	validVerseVideoChirho(valueChirho, 'Prov.1.1', 'a'.repeat(64), 'b'.repeat(64));

itChirho(
	'binds a video to the loaded canonical verse, scene, bounded bytes and licensed reading',
	() => {
		expectChirho(validChirho(videoChirho)).toBe(true);
		for (const [keyChirho, valueChirho] of [
			['lesson_id_chirho', 'Prov.1.2'],
			['canonical_sha256_chirho', 'd'.repeat(64)],
			['scene_sha256_chirho', 'd'.repeat(64)],
			['bytes_chirho', 16 * 1024 * 1024 + 1],
			['license_url_chirho', 'https://example.com/'],
			['duration_chirho', 120]
		] as const)
			expectChirho(validChirho({ ...videoChirho, [keyChirho]: valueChirho })).toBe(false);
		expectChirho(
			validChirho({
				...videoChirho,
				embedded_reading_chirho: { ...sourceChirho, gbt_id_chirho: 'OT/RDB/Gen' }
			})
		).toBe(false);
	}
);

itChirho('uses the embedded clock only for the same source and time window', () => {
	const clipChirho = {
		lesson_id_chirho: videoChirho.lesson_id_chirho,
		canonical_sha256_chirho: videoChirho.canonical_sha256_chirho,
		reading_source_chirho: sourceChirho
	};
	expectChirho(sameEmbeddedReadingChirho(videoChirho, clipChirho)).toBe(true);
	expectChirho(
		sameEmbeddedReadingChirho(videoChirho, {
			...clipChirho,
			reading_source_chirho: { ...sourceChirho, start_chirho: 2.31 }
		})
	).toBe(false);
	expectChirho(
		sameEmbeddedReadingChirho(videoChirho, {
			...clipChirho,
			reading_source_chirho: { ...sourceChirho, chapter_sha256_chirho: '0'.repeat(64) }
		})
	).toBe(false);
	expectChirho(
		sameEmbeddedReadingChirho(videoChirho, { ...clipChirho, lesson_id_chirho: 'Prov.1.2' })
	).toBe(false);
});

itChirho('keeps a silent CC0 visual separate from a claimed human soundtrack', () => {
	const silentChirho = {
		...videoChirho,
		embedded_reading_chirho: null,
		reading_language_chirho: null,
		license_chirho: 'CC0',
		license_url_chirho: 'https://creativecommons.org/publicdomain/zero/1.0/'
	};
	expectChirho(validChirho(silentChirho)).toBe(true);
	expectChirho(validChirho({ ...silentChirho, reading_language_chirho: 'he' })).toBe(false);
	expectChirho(validChirho({ ...videoChirho, license_chirho: 'CC0' })).toBe(false);
});

const syntheticClipChirho = {
	lesson_id_chirho: 'Matt.1.1',
	canonical_sha256_chirho: 'a'.repeat(64),
	token_id_chirho: null,
	language_chirho: 'el',
	sha256_chirho: '9'.repeat(64),
	asset_path_chirho: '/audio-chirho/sha256-chirho/' + '9'.repeat(64) + '-chirho.mp3',
	bytes_chirho: 1000,
	duration_chirho: 5,
	recipe_id_chirho: 'chatterbox-v3-modern-greek-verse-v1-chirho',
	pronunciation_chirho: 'modern_greek' as const,
	review_chirho: 'audition'
};
const syntheticVideoChirho: VerseVideoChirho = {
	...videoChirho,
	lesson_id_chirho: syntheticClipChirho.lesson_id_chirho,
	reading_language_chirho: 'el',
	embedded_reading_chirho: null,
	embedded_clip_chirho: {
		sha256_chirho: syntheticClipChirho.sha256_chirho,
		bytes_chirho: 1000,
		duration_chirho: 5,
		recipe_id_chirho: syntheticClipChirho.recipe_id_chirho,
		pronunciation_chirho: 'modern_greek'
	},
	attribution_chirho: 'Hinneh / Love Jesus Software',
	license_chirho: 'CC BY 4.0',
	license_url_chirho: 'https://creativecommons.org/licenses/by/4.0/'
};
const validSyntheticChirho = (valueChirho: unknown) =>
	validVerseVideoChirho(valueChirho, 'Matt.1.1', 'a'.repeat(64), 'b'.repeat(64));
itChirho(
	'admits one declared synthetic soundtrack and matches only the whole admitted delivery clip',
	() => {
		expectChirho(validSyntheticChirho(syntheticVideoChirho)).toBe(true);
		expectChirho(sameEmbeddedReadingChirho(syntheticVideoChirho, syntheticClipChirho)).toBe(true);
		for (const [keyChirho, valueChirho] of [
			['sha256_chirho', '8'.repeat(64)],
			['bytes_chirho', 999],
			['duration_chirho', 5.01],
			['recipe_id_chirho', 'other-chirho'],
			['pronunciation_chirho', 'erasmian_greek'],
			['lesson_id_chirho', 'Matt.1.2'],
			['canonical_sha256_chirho', '8'.repeat(64)],
			['token_id_chirho', 'word-chirho'],
			['language_chirho', 'he'],
			['start_offset_chirho', 0],
			['end_offset_chirho', 5],
			['review_chirho', 'rejected'],
			['reading_source_chirho', sourceChirho],
			['asset_path_chirho', '/other-chirho.mp3']
		] as const)
			expectChirho(
				sameEmbeddedReadingChirho(syntheticVideoChirho, {
					...syntheticClipChirho,
					[keyChirho]: valueChirho
				})
			).toBe(false);
		for (const [keyChirho, valueChirho] of [
			['embedded_reading_chirho', sourceChirho],
			['embedded_clip_chirho', null],
			['reading_language_chirho', null],
			['license_chirho', 'CC0'],
			['duration_chirho', 5.31]
		] as const)
			expectChirho(
				validSyntheticChirho({ ...syntheticVideoChirho, [keyChirho]: valueChirho })
			).toBe(false);
		const { embedded_reading_chirho: missingChirho, ...undeclaredChirho } = syntheticVideoChirho;
		void missingChirho;
		expectChirho(validSyntheticChirho(undeclaredChirho)).toBe(false);
	}
);
itChirho(
	'refuses malformed synthetic descriptors, held bytes and a descriptor attached to a human source',
	() => {
		for (const [keyChirho, valueChirho] of [
			['sha256_chirho', 'bad'],
			['bytes_chirho', 0],
			['bytes_chirho', 4_000_001],
			['duration_chirho', NaN],
			['duration_chirho', Infinity],
			['duration_chirho', 0],
			['recipe_id_chirho', 'unbounded'],
			['pronunciation_chirho', 'israeli_hebrew'],
			['sha256_chirho', '6a404d94c40e869718b48a3aa3c2083cb42ecd1596d720465fb2d7dac9d8975e']
		] as const)
			expectChirho(
				validSyntheticChirho({
					...syntheticVideoChirho,
					embedded_clip_chirho: {
						...syntheticVideoChirho.embedded_clip_chirho,
						[keyChirho]: valueChirho
					}
				})
			).toBe(false);
		expectChirho(
			validChirho({
				...videoChirho,
				embedded_clip_chirho: syntheticVideoChirho.embedded_clip_chirho
			})
		).toBe(false);
	}
);
