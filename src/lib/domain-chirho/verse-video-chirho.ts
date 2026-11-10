// For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life. — John 3:16 (KJV)
// Workflow: verse-media-chirho.md. A visual and its embedded reading keep independent identities.
import {
	validReadingSourceChirho,
	type ReadingSourceChirho,
	BEERI_LICENSE_URL_CHIRHO
} from './pronunciation-chirho/reading-source-chirho';
import { isRejectedAudioChirho } from './pronunciation-chirho/audio-reviews-chirho';

export const VERSE_VIDEO_LIMIT_CHIRHO = 16 * 1024 * 1024;
/** Identity of the whole published MP3 encoded into a synthetic verse video. */
export interface EmbeddedClipChirho {
	sha256_chirho: string;
	bytes_chirho: number;
	duration_chirho: number;
	recipe_id_chirho: string;
	pronunciation_chirho: 'modern_greek' | 'modern_greek_aspirates' | 'erasmian_greek';
}
export interface VerseVideoChirho {
	lesson_id_chirho: string;
	asset_path_chirho: string;
	sha256_chirho: string;
	bytes_chirho: number;
	duration_chirho: number;
	width_chirho: number;
	height_chirho: number;
	scene_sha256_chirho: string;
	canonical_sha256_chirho: string;
	reading_language_chirho: 'he' | 'el' | 'en' | 'es' | null;
	embedded_reading_chirho: ReadingSourceChirho | null;
	/** Absent on legacy human/silent records. The old reading key remains explicitly null for AI. */
	embedded_clip_chirho?: EmbeddedClipChirho | null;
	attribution_chirho: string;
	license_chirho: string;
	license_url_chirho: string;
	review_chirho: 'pending' | 'approved';
}

function validEmbeddedClipChirho(valueChirho: unknown): valueChirho is EmbeddedClipChirho {
	if (!valueChirho || typeof valueChirho !== 'object' || Array.isArray(valueChirho)) return false;
	const clipChirho = valueChirho as Record<string, unknown>;
	return (
		typeof clipChirho.sha256_chirho === 'string' &&
		/^[a-f0-9]{64}$/.test(clipChirho.sha256_chirho) &&
		!isRejectedAudioChirho(clipChirho.sha256_chirho) &&
		Number.isSafeInteger(clipChirho.bytes_chirho) &&
		Number(clipChirho.bytes_chirho) > 0 &&
		Number(clipChirho.bytes_chirho) <= 4_000_000 &&
		typeof clipChirho.duration_chirho === 'number' &&
		Number.isFinite(clipChirho.duration_chirho) &&
		clipChirho.duration_chirho > 0 &&
		clipChirho.duration_chirho <= 120 &&
		typeof clipChirho.recipe_id_chirho === 'string' &&
		clipChirho.recipe_id_chirho.length <= 128 &&
		/^[a-z0-9]+(?:-[a-z0-9]+)*-chirho$/.test(clipChirho.recipe_id_chirho) &&
		['modern_greek', 'modern_greek_aspirates', 'erasmian_greek'].includes(
			String(clipChirho.pronunciation_chirho)
		)
	);
}

export function validVerseVideoChirho(
	valueChirho: unknown,
	lessonIdChirho: string,
	canonicalShaChirho: string,
	sceneShaChirho: string
): valueChirho is VerseVideoChirho {
	if (!valueChirho || typeof valueChirho !== 'object' || Array.isArray(valueChirho)) return false;
	const videoChirho = valueChirho as Record<string, unknown>;
	if (
		videoChirho.lesson_id_chirho !== lessonIdChirho ||
		videoChirho.canonical_sha256_chirho !== canonicalShaChirho ||
		videoChirho.scene_sha256_chirho !== sceneShaChirho ||
		typeof videoChirho.sha256_chirho !== 'string' ||
		!/^[a-f0-9]{64}$/.test(videoChirho.sha256_chirho) ||
		!/^[a-f0-9]{64}$/.test(canonicalShaChirho) ||
		!/^[a-f0-9]{64}$/.test(sceneShaChirho)
	)
		return false;
	if (
		videoChirho.asset_path_chirho !==
			`/video-chirho/sha256-chirho/${videoChirho.sha256_chirho}-chirho.mp4` ||
		!Number.isSafeInteger(videoChirho.bytes_chirho) ||
		(videoChirho.bytes_chirho as number) < 1 ||
		(videoChirho.bytes_chirho as number) > VERSE_VIDEO_LIMIT_CHIRHO
	)
		return false;
	if (
		typeof videoChirho.duration_chirho !== 'number' ||
		!Number.isFinite(videoChirho.duration_chirho) ||
		videoChirho.duration_chirho <= 0 ||
		videoChirho.duration_chirho > 120 ||
		!['width_chirho', 'height_chirho'].every(
			(keyChirho) =>
				Number.isSafeInteger(videoChirho[keyChirho]) &&
				(videoChirho[keyChirho] as number) > 0 &&
				(videoChirho[keyChirho] as number) <= 4096
		) ||
		!['pending', 'approved'].includes(String(videoChirho.review_chirho)) ||
		typeof videoChirho.attribution_chirho !== 'string' ||
		!videoChirho.attribution_chirho.trim() ||
		videoChirho.attribution_chirho.length > 1000
	)
		return false;
	if (videoChirho.embedded_clip_chirho != null)
		return (
			videoChirho.embedded_reading_chirho === null &&
			videoChirho.reading_language_chirho === 'el' &&
			validEmbeddedClipChirho(videoChirho.embedded_clip_chirho) &&
			Math.abs(videoChirho.duration_chirho - videoChirho.embedded_clip_chirho.duration_chirho) <=
				0.3 &&
			videoChirho.license_chirho === 'CC BY 4.0' &&
			videoChirho.license_url_chirho === 'https://creativecommons.org/licenses/by/4.0/'
		);
	if (videoChirho.embedded_reading_chirho === null)
		return (
			videoChirho.reading_language_chirho === null &&
			videoChirho.license_chirho === 'CC0' &&
			videoChirho.license_url_chirho === 'https://creativecommons.org/publicdomain/zero/1.0/'
		);
	return (
		validReadingSourceChirho(videoChirho.embedded_reading_chirho, lessonIdChirho) &&
		videoChirho.reading_language_chirho === 'he' &&
		Math.abs(
			videoChirho.duration_chirho -
				(videoChirho.embedded_reading_chirho.end_chirho -
					videoChirho.embedded_reading_chirho.start_chirho)
		) <= 0.3 &&
		videoChirho.license_chirho === 'CC BY-SA 3.0' &&
		videoChirho.license_url_chirho === BEERI_LICENSE_URL_CHIRHO
	);
}

/** One embedded soundtrack is the clock only when it is the selected recording's exact source. */
export function sameEmbeddedReadingChirho(
	videoChirho: VerseVideoChirho,
	clipChirho: {
		lesson_id_chirho: string;
		canonical_sha256_chirho: string;
		reading_source_chirho?: ReadingSourceChirho;
		token_id_chirho?: string | null;
		language_chirho?: string;
		sha256_chirho?: string;
		asset_path_chirho?: string;
		bytes_chirho?: number;
		duration_chirho?: number;
		recipe_id_chirho?: string;
		pronunciation_chirho?: string;
		start_offset_chirho?: number;
		end_offset_chirho?: number;
		review_chirho?: string;
	}
): boolean {
	// Callers first admit the audio against source text/recipe and choose its rendition. This
	// comparison never selects a different recording just to make a video playable.
	const syntheticChirho = videoChirho.embedded_clip_chirho;
	if (syntheticChirho != null)
		return (
			videoChirho.embedded_reading_chirho === null &&
			videoChirho.reading_language_chirho === 'el' &&
			validEmbeddedClipChirho(syntheticChirho) &&
			Math.abs(videoChirho.duration_chirho - syntheticChirho.duration_chirho) <= 0.3 &&
			videoChirho.lesson_id_chirho === clipChirho.lesson_id_chirho &&
			videoChirho.canonical_sha256_chirho === clipChirho.canonical_sha256_chirho &&
			clipChirho.token_id_chirho === null &&
			clipChirho.language_chirho === 'el' &&
			clipChirho.reading_source_chirho === undefined &&
			clipChirho.start_offset_chirho === undefined &&
			clipChirho.end_offset_chirho === undefined &&
			['audition', 'approved'].includes(clipChirho.review_chirho ?? '') &&
			clipChirho.asset_path_chirho ===
				`/audio-chirho/sha256-chirho/${syntheticChirho.sha256_chirho}-chirho.mp3` &&
			(
				[
					'sha256_chirho',
					'bytes_chirho',
					'duration_chirho',
					'recipe_id_chirho',
					'pronunciation_chirho'
				] as const
			).every((keyChirho) => clipChirho[keyChirho] === syntheticChirho[keyChirho])
		);
	const embeddedChirho = videoChirho.embedded_reading_chirho;
	const selectedChirho = clipChirho.reading_source_chirho;
	if (
		!embeddedChirho ||
		!selectedChirho ||
		videoChirho.lesson_id_chirho !== clipChirho.lesson_id_chirho ||
		videoChirho.canonical_sha256_chirho !== clipChirho.canonical_sha256_chirho ||
		!validReadingSourceChirho(selectedChirho, clipChirho.lesson_id_chirho)
	)
		return false;
	return (
		(
			[
				'reader_id_chirho',
				'gbt_id_chirho',
				'package_sha256_chirho',
				'chapter_sha256_chirho',
				'timings_sha256_chirho'
			] as const
		).every((keyChirho) => embeddedChirho[keyChirho] === selectedChirho[keyChirho]) &&
		Math.abs(embeddedChirho.start_chirho - selectedChirho.start_chirho) <= 0.3 &&
		Math.abs(embeddedChirho.end_chirho - selectedChirho.end_chirho) <= 0.3
	);
}
