// For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life. — John 3:16 (KJV)
// Workflow: verse-media-chirho.md. Eligibility is independent of whether a row happens to have a take.
import { sha256Chirho } from '../audition_chirho';
import { spokenVerseChirho } from '../../../src/lib/domain-chirho/pronunciation-chirho';
import { chapterRecipeChirho } from '../../../src/lib/domain-chirho/pronunciation-chirho/chapter-recipe-chirho';
import { LOCAL_GREEK_VERSE_RECIPE_CHIRHO } from '../../../src/lib/domain-chirho/pronunciation-chirho/greek-chirho/local-verse-chirho';
import { bibleBookChirho } from '../../../src/lib/bible-chirho/books-chirho';

export const RUN_HOME_CHIRHO = 'workspace-chirho/audio-chirho/local-greek-verses-2026-11-07-chirho';
export const PREPARED_HOME_CHIRHO = 'build-chirho/local-greek-install-2026-11-07-chirho';
export const MANIFEST_SHA_CHIRHO =
	'5527568997b648b7753d3fcddf6414425e3833bedb105eae110505ab43d8f452';
export interface LocalGreekJobChirho {
	job_chirho: string;
	verse_id_chirho: string;
	content_path_chirho: string;
	content_sha256_chirho: string;
	canonical_text_chirho: string;
	canonical_sha256_chirho: string;
	spoken_text_chirho: string;
	sent_chirho: string;
	sent_sha256_chirho: string;
	state_chirho: string;
	chosen_chirho: null | {
		path_chirho: string;
		sha256_chirho: string;
		bytes_chirho: number;
		seconds_chirho: number;
		flag_chirho: unknown;
		raw_path_chirho: string;
		raw_sha256_chirho: string;
		seed_chirho: number;
		sample_rate_chirho: number;
		asr_chirho: { sha256_chirho: string; job_chirho: string; cer_chirho: number };
	};
}
export interface DeliveryChirho {
	job_chirho: string;
	verse_id_chirho: string;
	path_chirho: string;
	sha256_chirho: string;
	bytes_chirho: number;
	duration_chirho: number;
	original_mp3_sha256_chirho: string;
	raw_flac_sha256_chirho: string;
}
export interface LocalGreekManifestChirho {
	plan_sha256_chirho: string;
	journal_sha256_chirho: string;
	jobs_chirho: LocalGreekJobChirho[];
}

export function localGreekClipChirho(
	jobChirho: LocalGreekJobChirho,
	deliveryChirho: DeliveryChirho,
	lessonChirho: Parameters<typeof chapterRecipeChirho>[0],
	contentShaChirho: string
) {
	const takeChirho = jobChirho.chosen_chirho;
	const recipeChirho = chapterRecipeChirho(lessonChirho, LOCAL_GREEK_VERSE_RECIPE_CHIRHO);
	const bookChirho = bibleBookChirho(jobChirho.verse_id_chirho.split('.')[0]);
	const chapterChirho = jobChirho.verse_id_chirho.split('.')[1];
	if (
		jobChirho.state_chirho !== 'done' ||
		!takeChirho ||
		takeChirho.flag_chirho !== null ||
		!Number.isFinite(takeChirho.asr_chirho?.cer_chirho) ||
		takeChirho.asr_chirho.cer_chirho < 0 ||
		takeChirho.asr_chirho.cer_chirho > 0.35 ||
		takeChirho.asr_chirho.sha256_chirho !== takeChirho.sha256_chirho ||
		takeChirho.asr_chirho.job_chirho !== jobChirho.job_chirho
	)
		throw Error('Only done, unflagged, hash-bound screened takes are eligible');
	if (
		bookChirho.language_chirho !== 'grc' ||
		jobChirho.verse_id_chirho !== lessonChirho.id_chirho ||
		jobChirho.content_path_chirho !==
			`${bookChirho.slug_chirho}/chapter-${chapterChirho.padStart(2, '0')}-chirho.json` ||
		jobChirho.content_sha256_chirho !== contentShaChirho ||
		jobChirho.canonical_text_chirho !== lessonChirho.canonical_text_chirho ||
		sha256Chirho(lessonChirho.canonical_text_chirho) !== jobChirho.canonical_sha256_chirho ||
		jobChirho.spoken_text_chirho !== spokenVerseChirho(lessonChirho) ||
		!recipeChirho ||
		recipeChirho.synthesis_text_chirho !== jobChirho.sent_chirho ||
		sha256Chirho(jobChirho.sent_chirho) !== jobChirho.sent_sha256_chirho
	)
		throw Error('Local Greek canonical or spoken source differs');
	if (
		!/^v[0-9]{4}$/.test(jobChirho.job_chirho) ||
		deliveryChirho.job_chirho !== jobChirho.job_chirho ||
		deliveryChirho.verse_id_chirho !== lessonChirho.id_chirho ||
		deliveryChirho.path_chirho !==
			`${PREPARED_HOME_CHIRHO}/delivery-chirho/${jobChirho.job_chirho}-chirho.mp3` ||
		!/^[a-f0-9]{64}$/.test(deliveryChirho.sha256_chirho) ||
		deliveryChirho.original_mp3_sha256_chirho !== takeChirho.sha256_chirho ||
		deliveryChirho.raw_flac_sha256_chirho !== takeChirho.raw_sha256_chirho ||
		!Number.isSafeInteger(deliveryChirho.bytes_chirho) ||
		deliveryChirho.bytes_chirho <= 0 ||
		deliveryChirho.bytes_chirho > 4_000_000 ||
		!Number.isFinite(deliveryChirho.duration_chirho) ||
		deliveryChirho.duration_chirho <= 0 ||
		deliveryChirho.duration_chirho > 120 ||
		Math.abs(deliveryChirho.duration_chirho - takeChirho.seconds_chirho) > 0.15 ||
		takeChirho.sample_rate_chirho !== 24000 ||
		takeChirho.seed_chirho !== 1
	)
		throw Error('Local Greek delivery or original identity differs');
	return {
		id_chirho: `local-greek-${jobChirho.job_chirho}-chirho`,
		lesson_id_chirho: lessonChirho.id_chirho,
		token_id_chirho: null,
		text_chirho: spokenVerseChirho(lessonChirho),
		synthesis_text_chirho: recipeChirho.synthesis_text_chirho,
		recipe_id_chirho: LOCAL_GREEK_VERSE_RECIPE_CHIRHO,
		canonical_sha256_chirho: jobChirho.canonical_sha256_chirho,
		language_chirho: 'el' as const,
		pronunciation_chirho: 'modern_greek' as const,
		voice_name_chirho: 'Chatterbox Multilingual V3 (built-in voice)',
		provider_chirho: 'local',
		model_chirho: 'ResembleAI/chatterbox@5bb1f6ee58e50c3b8d408bc82a6d3740c2db6e18; t3 v3',
		model_license_chirho: 'MIT',
		watermark_chirho: 'Perth',
		original_mp3_sha256_chirho: takeChirho.sha256_chirho,
		raw_flac_sha256_chirho: takeChirho.raw_sha256_chirho,
		derivation_chirho:
			'FLAC decoded; 44100Hz mono 64kbps MPEG-1 MP3; tail padded to a complete frame (0–26ms). No fidelity gain.',
		asset_path_chirho: `/audio-chirho/sha256-chirho/${deliveryChirho.sha256_chirho}-chirho.mp3`,
		sha256_chirho: deliveryChirho.sha256_chirho,
		bytes_chirho: deliveryChirho.bytes_chirho,
		duration_chirho: deliveryChirho.duration_chirho,
		review_chirho: 'audition' as const,
		license_chirho: 'CC BY 4.0',
		license_url_chirho: 'https://creativecommons.org/licenses/by/4.0/',
		screening_chirho: {
			kind_chirho: 'automated text check; not listener acceptance',
			cer_chirho: takeChirho.asr_chirho.cer_chirho
		}
	};
}
