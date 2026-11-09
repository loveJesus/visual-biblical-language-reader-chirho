// For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life. — John 3:16 (KJV)
import type { LocaleChirho } from '$lib/i18n-chirho/locale-chirho';

export interface TutorialEntryChirho {
	language_chirho: LocaleChirho;
	video_chirho: {
		asset_path_chirho: string;
		sha256_chirho: string;
		bytes_chirho: number;
		duration_chirho: number;
		width_chirho: number;
		height_chirho: number;
	};
	poster_chirho: {
		asset_path_chirho: string;
		sha256_chirho: string;
		bytes_chirho: number;
		width_chirho: number;
		height_chirho: number;
	};
	captions_chirho: { asset_path_chirho: string; sha256_chirho: string; bytes_chirho: number };
	transcript_chirho: string;
}
/** Only same-origin, published tutorial paths may reach the browser's media elements. */
export function tutorialEntriesChirho(valueChirho: unknown): TutorialEntryChirho[] {
	if (!valueChirho || typeof valueChirho !== 'object') return [];
	const manifestChirho = valueChirho as {
		schema_version_chirho?: unknown;
		tutorial_id_chirho?: unknown;
		entries_chirho?: unknown;
	};
	if (
		manifestChirho.schema_version_chirho !== 1 ||
		manifestChirho.tutorial_id_chirho !== 'hinneh-quick-tour-v1-chirho' ||
		!Array.isArray(manifestChirho.entries_chirho) ||
		manifestChirho.entries_chirho.length !== 2
	)
		return [];
	const entriesChirho = manifestChirho.entries_chirho as TutorialEntryChirho[];
	const languagesChirho = new Set<string>();
	for (const entryChirho of entriesChirho) {
		const languageChirho = entryChirho?.language_chirho;
		if (!['en', 'es'].includes(languageChirho) || languagesChirho.has(languageChirho)) return [];
		languagesChirho.add(languageChirho);
		if (
			!entryChirho.video_chirho ||
			!/^[a-f0-9]{64}$/u.test(entryChirho.video_chirho.sha256_chirho) ||
			entryChirho.video_chirho.asset_path_chirho !==
				`/video-chirho/sha256-chirho/${entryChirho.video_chirho.sha256_chirho}-chirho.mp4` ||
			entryChirho.poster_chirho?.asset_path_chirho !==
				`/tutorial-chirho/${languageChirho}-poster-chirho.webp` ||
			entryChirho.captions_chirho?.asset_path_chirho !==
				`/tutorial-chirho/${languageChirho}-captions-chirho.vtt` ||
			typeof entryChirho.transcript_chirho !== 'string' ||
			!entryChirho.transcript_chirho.trim() ||
			entryChirho.transcript_chirho.length > 8192
		)
			return [];
	}
	return entriesChirho;
}
