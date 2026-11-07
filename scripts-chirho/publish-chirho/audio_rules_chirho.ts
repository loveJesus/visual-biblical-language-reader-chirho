// For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life. — John 3:16 (KJV)
// Workflow: media-delivery-chirho.md. Cached audio is source-bound; playback never synthesizes.
import {
	isBibleChapterPathChirho,
	BIBLE_BOOKS_CHIRHO,
	bibleBookChirho
} from '../../src/lib/bible-chirho/books-chirho';
import { createHash as createHashChirho } from 'node:crypto';
import { isRejectedAudioChirho } from '../../src/lib/domain-chirho/pronunciation-chirho/audio-reviews-chirho';
import {
	productionWordRecipeChirho,
	validRecordingWindowChirho
} from '../../src/lib/domain-chirho/pronunciation-chirho/production-recipe-chirho';
import {
	chapterRecipeChirho,
	greekPronunciationChirho
} from '../../src/lib/domain-chirho/pronunciation-chirho/chapter-recipe-chirho';
import {
	spokenVerseChirho,
	spokenWordChirho
} from '../../src/lib/domain-chirho/pronunciation-chirho';
import type { FilesChirho } from './release_rules_chirho';
import {
	ipaForRecordingChirho,
	ipaInputChirho
} from '../../src/lib/domain-chirho/pronunciation-chirho/ipa-trial-chirho';
import {
	maqqefContextRequiredChirho,
	verifyMaqqefOccurrenceChirho,
	type MaqqefVerseChirho
} from '../audio-chirho/production-chirho/maqqef-chirho/context_chirho';

const BOOKS_CHIRHO: Record<string, readonly [string, number]> = Object.fromEntries(
	BIBLE_BOOKS_CHIRHO.map((bookChirho) => [
		bookChirho.id_chirho,
		[bookChirho.slug_chirho, bookChirho.chapter_count_chirho] as const
	])
);
const HEX_CHIRHO = /^[a-f0-9]{64}$/;
const hashChirho = (bytesChirho: Uint8Array | string) =>
	createHashChirho('sha256').update(bytesChirho).digest('hex');
export const isAudioPathChirho = (pathChirho: string) =>
	pathChirho === 'audio-chirho/manifest-chirho.json' ||
	isBibleChapterPathChirho(pathChirho, 'audio-chirho/') ||
	/^audio-chirho\/sha256-chirho\/[a-f0-9]{64}-chirho\.mp3$/u.test(pathChirho);
function objectChirho(valueChirho: unknown): Record<string, unknown> {
	if (!valueChirho || typeof valueChirho !== 'object' || Array.isArray(valueChirho))
		throw new Error('expected audio object');
	return valueChirho as Record<string, unknown>;
}
function parseChirho(bytesChirho: Uint8Array | undefined, limitChirho = 2_000_000) {
	if (!bytesChirho || bytesChirho.length > limitChirho)
		throw new Error('missing or oversized audio catalogue');
	return objectChirho(JSON.parse(new TextDecoder('utf-8', { fatal: true }).decode(bytesChirho)));
}
export function hasMp3HeaderChirho(bytesChirho: Uint8Array): boolean {
	let offsetChirho = 0;
	if (new TextDecoder().decode(bytesChirho.slice(0, 3)) === 'ID3') {
		if (
			bytesChirho.length < 10 ||
			[...bytesChirho.slice(6, 10)].some((valueChirho) => valueChirho > 127)
		)
			return false;
		offsetChirho =
			10 +
			((bytesChirho[6] << 21) | (bytesChirho[7] << 14) | (bytesChirho[8] << 7) | bytesChirho[9]);
	}
	for (let frameChirho = 0; frameChirho < 2; frameChirho++) {
		if (offsetChirho + 4 > bytesChirho.length) return false;
		const headerChirho = new DataView(
			bytesChirho.buffer,
			bytesChirho.byteOffset + offsetChirho,
			4
		).getUint32(0);
		if (
			headerChirho >>> 21 !== 0x7ff ||
			((headerChirho >>> 19) & 3) !== 3 ||
			((headerChirho >>> 17) & 3) !== 1
		)
			return false;
		const bitrateChirho = [0, 32, 40, 48, 56, 64, 80, 96, 112, 128, 160, 192, 224, 256, 320, 0][
			(headerChirho >>> 12) & 15
		];
		const rateChirho = [44100, 48000, 32000, 0][(headerChirho >>> 10) & 3];
		if (!bitrateChirho || !rateChirho) return false;
		offsetChirho += Math.floor((144000 * bitrateChirho) / rateChirho) + ((headerChirho >>> 9) & 1);
	}
	return offsetChirho <= bytesChirho.length;
}
export function verifyAudioChirho(
	filesChirho: FilesChirho,
	allowAuditionChirho: boolean,
	reasonsChirho: string[]
) {
	const pathsChirho = [...filesChirho.keys()].filter((pathChirho) =>
		pathChirho.startsWith('audio-chirho/')
	);
	if (!pathsChirho.length) return;
	const listedChirho = new Set(['audio-chirho/manifest-chirho.json']);
	try {
		const manifestChirho = parseChirho(filesChirho.get('audio-chirho/manifest-chirho.json'));
		if (manifestChirho.schema_version_chirho !== 1) throw new Error('unknown audio schema');
		for (const [bookChirho, valueChirho] of Object.entries(
			objectChirho(manifestChirho.books_chirho)
		)) {
			if (!Object.hasOwn(BOOKS_CHIRHO, bookChirho)) throw new Error('unknown audio book');
			const [folderChirho, maximumChirho] = BOOKS_CHIRHO[bookChirho as keyof typeof BOOKS_CHIRHO];
			const chaptersChirho = objectChirho(valueChirho).chapters_chirho;
			if (!Array.isArray(chaptersChirho) || chaptersChirho.length > maximumChirho)
				throw new Error('invalid audio chapter list');
			let lastChirho = 0;
			for (const entryValueChirho of chaptersChirho) {
				const entryChirho = objectChirho(entryValueChirho);
				const numberChirho = Number(entryChirho.number_chirho);
				const paddedChirho = String(numberChirho).padStart(2, '0');
				const pathChirho = `audio-chirho/${folderChirho}/chapter-${paddedChirho}-chirho.json`;
				if (
					!Number.isSafeInteger(numberChirho) ||
					numberChirho <= lastChirho ||
					numberChirho > maximumChirho ||
					entryChirho.path_chirho !== `/${pathChirho}`
				)
					throw new Error('invalid audio path or order');
				lastChirho = numberChirho;
				const bytesChirho = filesChirho.get(pathChirho);
				const chapterChirho = parseChirho(bytesChirho);
				if (
					!bytesChirho ||
					hashChirho(bytesChirho) !== entryChirho.sha256_chirho ||
					chapterChirho.schema_version_chirho !== 1 ||
					chapterChirho.book_id_chirho !== bookChirho ||
					chapterChirho.chapter_chirho !== numberChirho ||
					!Array.isArray(chapterChirho.clips_chirho) ||
					chapterChirho.clips_chirho.length > 2000
				)
					throw new Error('audio chapter identity/hash differs');
				const contentPathChirho = `content-chirho/${folderChirho}/chapter-${paddedChirho}-chirho.json`;
				const contentBytesChirho = filesChirho.get(contentPathChirho);
				if (
					!contentBytesChirho ||
					chapterChirho.content_path_chirho !== `/${contentPathChirho}` ||
					hashChirho(contentBytesChirho) !== chapterChirho.content_sha256_chirho
				)
					throw new Error('audio source chapter changed');
				const contentChirho = parseChirho(contentBytesChirho, 4 * 1024 * 1024);
				if (!Array.isArray(contentChirho.verses_chirho))
					throw new Error('audio source has no verses');
				for (const clipValueChirho of chapterChirho.clips_chirho) {
					const clipChirho = objectChirho(clipValueChirho);
					if (!validRecordingWindowChirho(clipChirho))
						throw new Error('audio playback window refused');
					if (isRejectedAudioChirho(clipChirho.sha256_chirho))
						throw new Error('audio pronunciation was rejected by the listener');
					const lessonChirho = contentChirho.verses_chirho.find(
						(rowChirho: Record<string, unknown>) =>
							rowChirho.id_chirho === clipChirho.lesson_id_chirho
					);
					if (
						!lessonChirho ||
						hashChirho(lessonChirho.canonical_text_chirho) !== clipChirho.canonical_sha256_chirho ||
						clipChirho.language_chirho !==
							(bibleBookChirho(bookChirho).language_chirho === 'grc' ? 'el' : 'he') ||
						clipChirho.pronunciation_chirho !==
							(bibleBookChirho(bookChirho).language_chirho === 'grc'
								? greekPronunciationChirho(clipChirho.recipe_id_chirho)
								: 'israeli_hebrew')
					)
						throw new Error('audio pronunciation/source identity differs');
					const tokenChirho = lessonChirho.tokens_chirho.find(
						(rowChirho: Record<string, unknown>) =>
							rowChirho.id_chirho === clipChirho.token_id_chirho
					);
					if (maqqefContextRequiredChirho(clipChirho)) {
						if (
							!tokenChirho ||
							typeof clipChirho.token_id_chirho !== 'string' ||
							typeof clipChirho.text_chirho !== 'string'
						)
							throw new Error('Maqqef recording has no source word');
						verifyMaqqefOccurrenceChirho(
							lessonChirho as MaqqefVerseChirho,
							{
								token_id_chirho: clipChirho.token_id_chirho,
								text_chirho: clipChirho.text_chirho,
								maqqef_group_chirho: clipChirho.maqqef_group_chirho
							},
							clipChirho,
							clipChirho.source_context_chirho
						);
					}
					const wordRecipeChirho = tokenChirho
						? productionWordRecipeChirho(
								spokenWordChirho(tokenChirho),
								clipChirho.recipe_id_chirho,
								typeof clipChirho.ipa_chirho === 'string' ? clipChirho.ipa_chirho : undefined
							)
						: null;
					const recipeChirho =
						clipChirho.recipe_id_chirho === undefined
							? null
							: (chapterRecipeChirho(lessonChirho, clipChirho.recipe_id_chirho) ??
								wordRecipeChirho);
					if (clipChirho.recipe_id_chirho !== undefined) {
						if (
							(clipChirho.token_id_chirho !== null && !wordRecipeChirho) ||
							!recipeChirho ||
							recipeChirho.ipa_chirho !== clipChirho.ipa_chirho ||
							recipeChirho.synthesis_text_chirho !== clipChirho.synthesis_text_chirho
						)
							throw new Error('audio chapter recipe/source binding differs');
					} else if (
						clipChirho.ipa_chirho !== undefined
							? typeof clipChirho.ipa_chirho !== 'string' ||
								clipChirho.ipa_chirho !==
									ipaForRecordingChirho(
										lessonChirho,
										clipChirho.token_id_chirho as string | null
									) ||
								clipChirho.synthesis_text_chirho !== ipaInputChirho(clipChirho.ipa_chirho)
							: clipChirho.synthesis_text_chirho !== undefined
					)
						throw new Error('audio IPA/source binding differs');
					if (
						clipChirho.text_chirho !==
						(clipChirho.token_id_chirho === null
							? spokenVerseChirho(lessonChirho)
							: tokenChirho
								? spokenWordChirho(tokenChirho)
								: null)
					)
						throw new Error('audio spoken form differs');
					if (
						!['audition', 'approved'].includes(String(clipChirho.review_chirho)) ||
						(!allowAuditionChirho && clipChirho.review_chirho !== 'approved')
					)
						throw new Error('audio audition needs review or a recorded preview');
					if (
						typeof clipChirho.license_chirho !== 'string' ||
						!clipChirho.license_chirho.trim() ||
						typeof clipChirho.voice_name_chirho !== 'string' ||
						!clipChirho.voice_name_chirho.trim()
					)
						throw new Error('audio provenance missing');
					const assetPathChirho = `audio-chirho/sha256-chirho/${clipChirho.sha256_chirho}-chirho.mp3`;
					const audioChirho = filesChirho.get(assetPathChirho);
					if (
						typeof clipChirho.sha256_chirho !== 'string' ||
						!HEX_CHIRHO.test(clipChirho.sha256_chirho) ||
						clipChirho.asset_path_chirho !== `/${assetPathChirho}` ||
						!audioChirho ||
						audioChirho.length > 4_000_000 ||
						audioChirho.length !== clipChirho.bytes_chirho ||
						hashChirho(audioChirho) !== clipChirho.sha256_chirho ||
						!hasMp3HeaderChirho(audioChirho) ||
						typeof clipChirho.duration_chirho !== 'number' ||
						!Number.isFinite(clipChirho.duration_chirho) ||
						clipChirho.duration_chirho <= 0 ||
						clipChirho.duration_chirho > 120
					)
						throw new Error('audio byte/hash/header declaration differs');
					listedChirho.add(assetPathChirho);
				}
				listedChirho.add(pathChirho);
			}
		}
	} catch (errorChirho) {
		reasonsChirho.push(`Audio publication refused: ${(errorChirho as Error).message}`);
	}
	for (const pathChirho of pathsChirho)
		if (!listedChirho.has(pathChirho))
			reasonsChirho.push(`/${pathChirho} is not declared by the audio catalogue`);
}
