// For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life. — John 3:16 (KJV)
import { spokenVerseChirho, spokenWordChirho } from '$lib/domain-chirho/pronunciation-chirho';
import {
	productionWordRecipeChirho,
	validRecordingWindowChirho
} from '$lib/domain-chirho/pronunciation-chirho/production-recipe-chirho';
import { isRejectedAudioChirho } from '$lib/domain-chirho/pronunciation-chirho/audio-reviews-chirho';
import {
	chapterRecipeChirho,
	greekPronunciationChirho,
	HEBREW_CONNECTED_RECIPE_CHIRHO
} from '$lib/domain-chirho/pronunciation-chirho/chapter-recipe-chirho';
import {
	ipaForRecordingChirho,
	ipaInputChirho
} from '$lib/domain-chirho/pronunciation-chirho/ipa-trial-chirho';
import {
	hasProfileReadingChirho,
	verifyProfileRecordingChirho
} from '$lib/domain-chirho/pronunciation-chirho/hebrew-chirho/profile-readings-chirho';

export interface RecordingChirho {
	id_chirho?: string;
	source_context_chirho?: string;
	profile_id_chirho?: string;
	lesson_id_chirho: string;
	token_id_chirho: string | null;
	text_chirho: string;
	ipa_chirho?: string;
	synthesis_text_chirho?: string;
	recipe_id_chirho?: string;
	canonical_sha256_chirho: string;
	language_chirho: 'he' | 'el';
	pronunciation_chirho:
		'israeli_hebrew' | 'modern_greek' | 'modern_greek_aspirates' | 'erasmian_greek';
	voice_name_chirho: string;
	asset_path_chirho: string;
	sha256_chirho: string;
	bytes_chirho: number;
	duration_chirho: number;
	start_offset_chirho?: number;
	end_offset_chirho?: number;
	review_chirho: 'audition' | 'approved';
}
import { BIBLE_BOOKS_CHIRHO, bibleBookChirho } from '$lib/bible-chirho/books-chirho';
interface AudioManifestChirho {
	schema_version_chirho: number;
	books_chirho: Record<
		string,
		{ chapters_chirho: { number_chirho: number; path_chirho: string; sha256_chirho: string }[] }
	>;
}
const BOOKS_CHIRHO: Record<string, string> = Object.fromEntries(
	BIBLE_BOOKS_CHIRHO.map((bookChirho) => [bookChirho.id_chirho, bookChirho.slug_chirho])
);
const LIMIT_CHIRHO = 2_000_000;
const cacheChirho = new Map<string, Promise<{ clips_chirho: RecordingChirho[] }>>();
let manifestChirho: Promise<AudioManifestChirho> | undefined;
let manifestReadAtChirho = 0;
const shaChirho = async (bytesChirho: BufferSource) =>
	Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256', bytesChirho)), (byteChirho) =>
		byteChirho.toString(16).padStart(2, '0')
	).join('');
async function readChirho(pathChirho: string) {
	const responseChirho = await fetch(pathChirho, { signal: AbortSignal.timeout(15_000) });
	if (!responseChirho.ok) throw new Error('Recording catalogue unavailable');
	if (Number(responseChirho.headers.get('content-length')) > LIMIT_CHIRHO)
		throw new Error('Recording catalogue oversized');
	const readerChirho = responseChirho.body?.getReader();
	if (!readerChirho) throw new Error('Recording catalogue unavailable');
	const partsChirho: Uint8Array[] = [];
	let lengthChirho = 0;
	try {
		for (;;) {
			const partChirho = await readerChirho.read();
			if (partChirho.done) break;
			lengthChirho += partChirho.value.byteLength;
			if (lengthChirho > LIMIT_CHIRHO) throw new Error('Recording catalogue oversized');
			partsChirho.push(partChirho.value);
		}
	} finally {
		await readerChirho.cancel().catch(() => undefined);
	}
	const bytesChirho = new Uint8Array(lengthChirho);
	let offsetChirho = 0;
	for (const partChirho of partsChirho) {
		bytesChirho.set(partChirho, offsetChirho);
		offsetChirho += partChirho.byteLength;
	}
	return bytesChirho.buffer;
}
export async function recordingsForLessonChirho(lessonChirho: {
	id_chirho: string;
	canonical_text_chirho: string;
	tokens_chirho: {
		id_chirho: string;
		text_chirho: string;
		start_chirho: number;
		end_chirho: number;
		qere_chirho?: { text_chirho: string }[];
		lemma_id_chirho?: string;
		lemma_augment_chirho?: string | null;
		raw_morphology_chirho?: string;
	}[];
}): Promise<RecordingChirho[]> {
	const [bookChirho, chapterTextChirho] = lessonChirho.id_chirho.split('.');
	const folderChirho = BOOKS_CHIRHO[bookChirho];
	if (!folderChirho) return [];
	if (Date.now() - manifestReadAtChirho > 60000) {
		manifestChirho = undefined;
		manifestReadAtChirho = Date.now();
	}
	manifestChirho ??= readChirho('/audio-chirho/manifest-chirho.json').then((bytesChirho) => {
		const valueChirho = JSON.parse(new TextDecoder().decode(bytesChirho));
		if (
			valueChirho.schema_version_chirho !== 1 ||
			!valueChirho.books_chirho ||
			typeof valueChirho.books_chirho !== 'object'
		)
			throw new Error('Invalid recording manifest');
		return valueChirho as AudioManifestChirho;
	});
	manifestChirho.catch(() => {
		manifestChirho = undefined;
	});
	const valueChirho = await manifestChirho;
	const entryChirho = valueChirho.books_chirho[bookChirho]?.chapters_chirho.find(
		(rowChirho) => rowChirho.number_chirho === Number(chapterTextChirho)
	);
	if (!entryChirho) return [];
	const expectedChirho = `/audio-chirho/${folderChirho}/chapter-${chapterTextChirho.padStart(2, '0')}-chirho.json`;
	if (
		entryChirho.path_chirho !== expectedChirho ||
		!/^[a-f0-9]{64}$/.test(entryChirho.sha256_chirho)
	)
		throw new Error('Invalid recording chapter path');
	const keyChirho = `${bookChirho}.${chapterTextChirho}.${entryChirho.sha256_chirho}`;
	let chapterChirho = cacheChirho.get(keyChirho);
	if (!chapterChirho) {
		chapterChirho = readChirho(expectedChirho).then(async (bytesChirho) => {
			if ((await shaChirho(bytesChirho)) !== entryChirho.sha256_chirho)
				throw new Error('Recording catalogue changed');
			const dataChirho = JSON.parse(new TextDecoder().decode(bytesChirho));
			if (
				dataChirho.schema_version_chirho !== 1 ||
				dataChirho.book_id_chirho !== bookChirho ||
				dataChirho.chapter_chirho !== Number(chapterTextChirho) ||
				!Array.isArray(dataChirho.clips_chirho) ||
				dataChirho.clips_chirho.length > 2000
			)
				throw new Error('Invalid recording chapter');
			return dataChirho as { clips_chirho: RecordingChirho[] };
		});
		const pendingChirho = chapterChirho;
		chapterChirho.catch(() => {
			if (cacheChirho.get(keyChirho) === pendingChirho) cacheChirho.delete(keyChirho);
		});
		cacheChirho.set(keyChirho, chapterChirho);
		while (cacheChirho.size > 4) cacheChirho.delete(cacheChirho.keys().next().value as string);
	}
	const canonicalChirho = await shaChirho(
		new TextEncoder().encode(lessonChirho.canonical_text_chirho)
	);
	const wordsChirho = new Map(
		lessonChirho.tokens_chirho.map((tokenChirho) => [
			tokenChirho.id_chirho,
			spokenWordChirho(tokenChirho)
		])
	);
	const verseChirho = spokenVerseChirho(lessonChirho);
	return (await chapterChirho).clips_chirho
		.filter((clipChirho) => {
			if (
				clipChirho.source_context_chirho === 'profile_chirho' ||
				clipChirho.profile_id_chirho !== undefined ||
				clipChirho.id_chirho?.startsWith('profile-') ||
				(clipChirho.token_id_chirho !== null && hasProfileReadingChirho(clipChirho.token_id_chirho))
			) {
				if (clipChirho.token_id_chirho === null) return false;
				try {
					verifyProfileRecordingChirho(
						lessonChirho,
						{ ...clipChirho, token_id_chirho: clipChirho.token_id_chirho },
						clipChirho
					);
				} catch {
					return false;
				}
			}
			const wordRecipeChirho =
				clipChirho.token_id_chirho !== null
					? productionWordRecipeChirho(
							wordsChirho.get(clipChirho.token_id_chirho) ?? '',
							clipChirho.recipe_id_chirho,
							clipChirho.ipa_chirho
						)
					: null;
			const recipeChirho =
				chapterRecipeChirho(lessonChirho, clipChirho.recipe_id_chirho) ?? wordRecipeChirho;
			return (
				!isRejectedAudioChirho(clipChirho.sha256_chirho) &&
				validRecordingWindowChirho(clipChirho) &&
				clipChirho.lesson_id_chirho === lessonChirho.id_chirho &&
				clipChirho.canonical_sha256_chirho === canonicalChirho &&
				(clipChirho.recipe_id_chirho !== undefined
					? (clipChirho.token_id_chirho === null || wordRecipeChirho !== null) &&
						recipeChirho !== null &&
						recipeChirho.synthesis_text_chirho === clipChirho.synthesis_text_chirho &&
						recipeChirho.ipa_chirho === clipChirho.ipa_chirho
					: clipChirho.ipa_chirho === undefined
						? clipChirho.synthesis_text_chirho === undefined
						: clipChirho.ipa_chirho ===
								ipaForRecordingChirho(lessonChirho, clipChirho.token_id_chirho) &&
							clipChirho.synthesis_text_chirho === ipaInputChirho(clipChirho.ipa_chirho)) &&
				clipChirho.language_chirho ===
					(bibleBookChirho(bookChirho).language_chirho === 'grc' ? 'el' : 'he') &&
				['audition', 'approved'].includes(clipChirho.review_chirho) &&
				(clipChirho.token_id_chirho === null
					? clipChirho.text_chirho === verseChirho
					: wordsChirho.get(clipChirho.token_id_chirho) === clipChirho.text_chirho) &&
				clipChirho.pronunciation_chirho ===
					(bibleBookChirho(bookChirho).language_chirho === 'grc'
						? greekPronunciationChirho(clipChirho.recipe_id_chirho)
						: 'israeli_hebrew') &&
				typeof clipChirho.voice_name_chirho === 'string' &&
				clipChirho.voice_name_chirho.length > 0 &&
				Number.isSafeInteger(clipChirho.bytes_chirho) &&
				clipChirho.bytes_chirho > 0 &&
				clipChirho.bytes_chirho <= 4_000_000 &&
				Number.isFinite(clipChirho.duration_chirho) &&
				clipChirho.duration_chirho > 0 &&
				clipChirho.duration_chirho <= 120 &&
				/^[a-f0-9]{64}$/.test(clipChirho.sha256_chirho) &&
				clipChirho.asset_path_chirho ===
					`/audio-chirho/sha256-chirho/${clipChirho.sha256_chirho}-chirho.mp3`
			);
		})
		.sort(
			(leftChirho, rightChirho) =>
				Number(rightChirho.review_chirho === 'approved') -
					Number(leftChirho.review_chirho === 'approved') ||
				Number(rightChirho.recipe_id_chirho === HEBREW_CONNECTED_RECIPE_CHIRHO) -
					Number(leftChirho.recipe_id_chirho === HEBREW_CONNECTED_RECIPE_CHIRHO) ||
				Number(Boolean(rightChirho.recipe_id_chirho)) -
					Number(Boolean(leftChirho.recipe_id_chirho)) ||
				Number(Boolean(rightChirho.ipa_chirho)) - Number(Boolean(leftChirho.ipa_chirho))
		);
}
