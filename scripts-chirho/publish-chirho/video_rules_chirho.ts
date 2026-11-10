// For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life. — John 3:16 (KJV)
// Workflow: verse-media-chirho.md. R2-only video facts overlay the already delivered scene shards.
import { readFile as readFileChirho, writeFile as writeFileChirho } from 'node:fs/promises';
import { join as joinChirho } from 'node:path';
import {
	validVerseVideoChirho,
	sameEmbeddedReadingChirho,
	type VerseVideoChirho
} from '../../src/lib/domain-chirho/verse-video-chirho';
import { bibleBookChirho } from '../../src/lib/bible-chirho/books-chirho';
import { spokenVerseChirho } from '../../src/lib/domain-chirho/pronunciation-chirho';
import {
	chapterRecipeChirho,
	greekPronunciationChirho
} from '../../src/lib/domain-chirho/pronunciation-chirho/chapter-recipe-chirho';
import { sha256Chirho, type FilesChirho } from './release_rules_chirho';
export const VIDEO_CATALOGUE_CHIRHO = 'data-chirho/video-chirho/catalogue-chirho.json';
export interface VideoEntryChirho {
	video_chirho: VerseVideoChirho;
	key_chirho: string;
	readback_sha256_chirho: string;
	verified_at_chirho: string;
}
export async function readVideoCatalogueChirho(rootChirho: string): Promise<VideoEntryChirho[]> {
	const bytesChirho = await readFileChirho(joinChirho(rootChirho, VIDEO_CATALOGUE_CHIRHO)).catch(
		(errorChirho: NodeJS.ErrnoException) => {
			if (errorChirho.code === 'ENOENT') return null;
			throw errorChirho;
		}
	);
	if (!bytesChirho) return [];
	if (bytesChirho.length > 4 * 1024 ** 2) throw Error('Video catalogue needs sharding');
	const valueChirho = JSON.parse(bytesChirho.toString());
	if (
		valueChirho.schema_version_chirho !== 1 ||
		!Array.isArray(valueChirho.entries_chirho) ||
		valueChirho.entries_chirho.length > 1000
	)
		throw Error('Video catalogue exceeds scope');
	const seenChirho = new Set<string>();
	for (const entryChirho of valueChirho.entries_chirho as VideoEntryChirho[]) {
		const videoChirho = entryChirho.video_chirho;
		if (
			!videoChirho ||
			!validVerseVideoChirho(
				videoChirho,
				videoChirho.lesson_id_chirho,
				videoChirho.canonical_sha256_chirho,
				videoChirho.scene_sha256_chirho
			) ||
			seenChirho.has(videoChirho.lesson_id_chirho) ||
			entryChirho.key_chirho !== `video-chirho/sha256-chirho/${videoChirho.sha256_chirho}.mp4` ||
			entryChirho.readback_sha256_chirho !== videoChirho.sha256_chirho ||
			!Number.isFinite(Date.parse(entryChirho.verified_at_chirho))
		)
			throw Error('Video archive facts differ');
		seenChirho.add(videoChirho.lesson_id_chirho);
	}
	return valueChirho.entries_chirho;
}
function pathsChirho(lessonChirho: string) {
	const matchChirho = /^([1-3]?[A-Za-z]+)\.([1-9][0-9]{0,2})\.([1-9][0-9]{0,2})$/.exec(
		lessonChirho
	);
	if (!matchChirho) throw Error('Invalid video verse');
	const bookChirho = bibleBookChirho(matchChirho[1]),
		chapterChirho = Number(matchChirho[2]);
	if (chapterChirho > bookChirho.chapter_count_chirho) throw Error('Invalid video chapter');
	return {
		media_chirho: `media-chirho/${bookChirho.slug_chirho}/chapter-${String(chapterChirho).padStart(2, '0')}-chirho.json`,
		content_chirho: `content-chirho/${bookChirho.slug_chirho}/chapter-${String(chapterChirho).padStart(2, '0')}-chirho.json`,
		audio_chirho: `audio-chirho/${bookChirho.slug_chirho}/chapter-${String(chapterChirho).padStart(2, '0')}-chirho.json`,
		summary_chirho: `media-chirho/${bookChirho.slug_chirho}/summary-chirho.json`
	};
}
function matchesChirho(
	videoChirho: VerseVideoChirho,
	contentChirho: Record<string, unknown>,
	mediaChirho: Record<string, unknown>
) {
	const verseChirho = (
		contentChirho.verses_chirho as { id_chirho: string; canonical_text_chirho: string }[]
	).find((rowChirho) => rowChirho.id_chirho === videoChirho.lesson_id_chirho);
	const sceneChirho = (
		mediaChirho.scenes_chirho as {
			lesson_id_chirho: string;
			variant_chirho?: string;
			sha256_chirho: string;
		}[]
	).find(
		(rowChirho) =>
			rowChirho.lesson_id_chirho === videoChirho.lesson_id_chirho &&
			(!rowChirho.variant_chirho || rowChirho.variant_chirho === 'standard')
	);
	return (
		!!verseChirho &&
		!!sceneChirho &&
		validVerseVideoChirho(
			videoChirho,
			verseChirho.id_chirho,
			sha256Chirho(verseChirho.canonical_text_chirho),
			sceneChirho.sha256_chirho
		)
	);
}
/** Workflow: verse-media-chirho.md. A null human source never bypasses a synthetic source check. */
function soundtrackMatchesChirho(
	videoChirho: VerseVideoChirho,
	contentChirho: Record<string, unknown>,
	audioChirho: Record<string, unknown>
): boolean {
	if (videoChirho.embedded_reading_chirho)
		return (
			Array.isArray(audioChirho.readings_chirho) &&
			audioChirho.readings_chirho.some(
				(clipChirho: Parameters<typeof sameEmbeddedReadingChirho>[1]) =>
					sameEmbeddedReadingChirho(videoChirho, clipChirho)
			)
		);
	if (!videoChirho.embedded_clip_chirho) return true;
	const verseChirho = (
		contentChirho.verses_chirho as Parameters<typeof chapterRecipeChirho>[0][]
	).find((verseChirho) => verseChirho.id_chirho === videoChirho.lesson_id_chirho);
	if (
		!verseChirho ||
		!Array.isArray(verseChirho.tokens_chirho) ||
		!Array.isArray(audioChirho.clips_chirho)
	)
		return false;
	return audioChirho.clips_chirho.some((clipChirho) => {
		if (
			!clipChirho ||
			typeof clipChirho !== 'object' ||
			!sameEmbeddedReadingChirho(videoChirho, clipChirho)
		)
			return false;
		const recipeChirho = chapterRecipeChirho(verseChirho, clipChirho.recipe_id_chirho);
		return (
			recipeChirho !== null &&
			clipChirho.text_chirho === spokenVerseChirho(verseChirho) &&
			recipeChirho.synthesis_text_chirho === clipChirho.synthesis_text_chirho &&
			recipeChirho.ipa_chirho === clipChirho.ipa_chirho &&
			clipChirho.pronunciation_chirho === greekPronunciationChirho(clipChirho.recipe_id_chirho)
		);
	});
}
export async function overlayVerseVideosChirho(rootChirho: string) {
	const entriesChirho = await readVideoCatalogueChirho(rootChirho),
		heldChirho: string[] = [];
	let countChirho = 0;
	const readChirho = async (pathChirho: string) =>
		JSON.parse(await readFileChirho(joinChirho(rootChirho, 'static', pathChirho), 'utf8'));
	for (const entryChirho of entriesChirho) {
		const videoChirho = entryChirho.video_chirho,
			pathsValueChirho = pathsChirho(videoChirho.lesson_id_chirho);
		const mediaChirho = await readChirho(pathsValueChirho.media_chirho),
			contentChirho = await readChirho(pathsValueChirho.content_chirho),
			audioChirho = await readChirho(pathsValueChirho.audio_chirho);
		if (
			!matchesChirho(videoChirho, contentChirho, mediaChirho) ||
			!soundtrackMatchesChirho(videoChirho, contentChirho, audioChirho)
		) {
			heldChirho.push(videoChirho.lesson_id_chirho);
			continue;
		}
		const videosChirho: VerseVideoChirho[] = mediaChirho.videos_chirho ?? [];
		if (
			videosChirho.some((rowChirho) => rowChirho.lesson_id_chirho === videoChirho.lesson_id_chirho)
		)
			throw Error('Video overlay duplicated a verse');
		mediaChirho.videos_chirho = [...videosChirho, videoChirho];
		const bytesChirho = JSON.stringify(mediaChirho, null, 2) + '\n';
		if (Buffer.byteLength(bytesChirho) > 2_000_000) throw Error('Video media chapter oversized');
		await writeFileChirho(
			joinChirho(rootChirho, 'static', pathsValueChirho.media_chirho),
			bytesChirho
		);
		const summaryChirho = await readChirho(pathsValueChirho.summary_chirho),
			chapterChirho = summaryChirho.chapters_chirho.find(
				(rowChirho: { path_chirho: string }) =>
					rowChirho.path_chirho === '/' + pathsValueChirho.media_chirho
			);
		if (!chapterChirho) throw Error('Video chapter absent from summary');
		chapterChirho.sha256_chirho = sha256Chirho(bytesChirho);
		await writeFileChirho(
			joinChirho(rootChirho, 'static', pathsValueChirho.summary_chirho),
			JSON.stringify(summaryChirho, null, 2) + '\n'
		);
		countChirho++;
	}
	return { published_chirho: countChirho, held_chirho: heldChirho };
}
export async function verifiedVideoFactsChirho(
	rootChirho: string,
	filesChirho: FilesChirho,
	reasonsChirho: string[],
	allowPendingChirho = false
) {
	const entriesChirho = await readVideoCatalogueChirho(rootChirho),
		knownChirho = new Map(
			entriesChirho.map((entryChirho) => [entryChirho.video_chirho.sha256_chirho, entryChirho])
		);
	const factsChirho: Record<string, number> = {};
	const seenChirho = new Set<string>();
	for (const [pathChirho, bytesChirho] of filesChirho) {
		if (!/^media-chirho\/[^/]+\/chapter-[0-9]{2,3}-chirho\.json$/.test(pathChirho)) continue;
		const mediaChirho = JSON.parse(new TextDecoder().decode(bytesChirho));
		if (mediaChirho.videos_chirho === undefined) continue;
		if (!Array.isArray(mediaChirho.videos_chirho) || mediaChirho.videos_chirho.length > 200) {
			reasonsChirho.push('Video chapter exceeds its bound');
			continue;
		}
		for (const videoChirho of mediaChirho.videos_chirho as VerseVideoChirho[]) {
			try {
				const pathsValueChirho = pathsChirho(videoChirho.lesson_id_chirho),
					entryChirho = knownChirho.get(videoChirho.sha256_chirho),
					sourceChirho = filesChirho.get(pathsValueChirho.content_chirho);
				if (
					pathsValueChirho.media_chirho !== pathChirho ||
					seenChirho.has(videoChirho.lesson_id_chirho) ||
					!entryChirho ||
					JSON.stringify(entryChirho.video_chirho) !== JSON.stringify(videoChirho) ||
					!sourceChirho ||
					!matchesChirho(
						videoChirho,
						JSON.parse(new TextDecoder().decode(sourceChirho)),
						mediaChirho
					)
				)
					throw Error('Video source or archive binding differs');
				if (videoChirho.review_chirho !== 'approved' && !allowPendingChirho)
					throw Error('Video remains pending review');
				if (videoChirho.embedded_reading_chirho || videoChirho.embedded_clip_chirho) {
					const audioBytesChirho = filesChirho.get(pathsValueChirho.audio_chirho);
					const audioChirho = audioBytesChirho
						? JSON.parse(new TextDecoder().decode(audioBytesChirho))
						: null;
					if (
						!audioChirho ||
						!soundtrackMatchesChirho(
							videoChirho,
							JSON.parse(new TextDecoder().decode(sourceChirho)),
							audioChirho
						)
					)
						throw Error('Video reading differs');
				}
				seenChirho.add(videoChirho.lesson_id_chirho);
				factsChirho[videoChirho.sha256_chirho] = videoChirho.bytes_chirho;
			} catch {
				reasonsChirho.push('Video source or archive binding differs');
			}
		}
	}
	return factsChirho;
}
