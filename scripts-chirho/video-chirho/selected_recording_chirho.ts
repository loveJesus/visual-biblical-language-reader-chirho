// For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life. — John 3:16 (KJV)
// Workflow: verse-media-chirho.md. Bounded JSON-only bridge for current source admission; no network or credentials.
import { createHash as createHashChirho } from 'node:crypto';
import {
	automaticVerseRecordingChirho,
	recordingsFromChapterChirho,
	type recordingsForLessonChirho,
	type RecordingChirho
} from '../../src/lib/reader-chirho/audio-chirho/recordings-chirho';
import { bibleBookChirho } from '../../src/lib/bible-chirho/books-chirho';
const BRIDGE_LIMIT_CHIRHO = 4 * 1024 ** 2;
type LessonChirho = Parameters<typeof recordingsForLessonChirho>[0];
/** Exact delivery/window identity, without copying text, voice metadata or a whole catalogue to stdout. */
export function recordingIdentityChirho(clipChirho: RecordingChirho) {
	return {
		raw_whole_verse_shape_chirho:
			Object.hasOwn(clipChirho, 'token_id_chirho') &&
			clipChirho.token_id_chirho === null &&
			['reading_source_chirho', 'start_offset_chirho', 'end_offset_chirho'].every(
				(keyChirho) => !Object.hasOwn(clipChirho, keyChirho)
			),
		sha256_chirho: clipChirho.sha256_chirho,
		bytes_chirho: clipChirho.bytes_chirho,
		duration_chirho: clipChirho.duration_chirho,
		recipe_id_chirho: clipChirho.recipe_id_chirho ?? null,
		pronunciation_chirho: clipChirho.pronunciation_chirho,
		start_offset_chirho: clipChirho.start_offset_chirho ?? null,
		end_offset_chirho: clipChirho.end_offset_chirho ?? null,
		reading_source_chirho: clipChirho.reading_source_chirho ?? null
	};
}
/** One already-read lesson/chapter enters the same pure admission/order used by the network reader. */
export function selectedRecordingDescriptorChirho(valueChirho: unknown) {
	const inputChirho = valueChirho as {
		lesson_id_chirho?: string;
		content_chapter_json_chirho?: string;
		content_sha256_chirho?: string;
		audio_chapter_json_chirho?: string;
		audio_sha256_chirho?: string;
	};
	if (
		!inputChirho ||
		typeof inputChirho.lesson_id_chirho !== 'string' ||
		!/^([1-3]?[A-Za-z]+)\.([1-9][0-9]{0,2})\.([1-9][0-9]{0,2})$/.test(inputChirho.lesson_id_chirho)
	)
		throw Error('One lesson identity required');
	const decodeChirho = (textChirho: unknown, shaChirho: unknown, limitChirho: number) => {
		if (
			typeof textChirho !== 'string' ||
			Buffer.byteLength(textChirho) > limitChirho ||
			typeof shaChirho !== 'string' ||
			!/^[a-f0-9]{64}$/.test(shaChirho) ||
			createHashChirho('sha256').update(textChirho).digest('hex') !== shaChirho
		)
			throw Error('Exact bounded source chapter bytes required');
		return JSON.parse(textChirho);
	};
	const contentChirho = decodeChirho(
		inputChirho.content_chapter_json_chirho,
		inputChirho.content_sha256_chirho,
		BRIDGE_LIMIT_CHIRHO
	) as { book_id_chirho: string; chapter_chirho: number; verses_chirho: LessonChirho[] };
	const chapterChirho = decodeChirho(
		inputChirho.audio_chapter_json_chirho,
		inputChirho.audio_sha256_chirho,
		2_000_000
	) as {
		schema_version_chirho: number;
		book_id_chirho: string;
		chapter_chirho: number;
		content_path_chirho: string;
		content_sha256_chirho: string;
		clips_chirho: RecordingChirho[];
		readings_chirho?: RecordingChirho[];
	};
	const [bookIdChirho, chapterTextChirho] = inputChirho.lesson_id_chirho.split('.'),
		bookChirho = bibleBookChirho(bookIdChirho);
	if (
		!bookChirho ||
		Number(chapterTextChirho) > bookChirho.chapter_count_chirho ||
		contentChirho.book_id_chirho !== bookIdChirho ||
		contentChirho.chapter_chirho !== Number(chapterTextChirho) ||
		!Array.isArray(contentChirho.verses_chirho) ||
		contentChirho.verses_chirho.length > 200 ||
		chapterChirho.schema_version_chirho !== 1 ||
		chapterChirho.book_id_chirho !== bookIdChirho ||
		chapterChirho.chapter_chirho !== Number(chapterTextChirho) ||
		chapterChirho.content_path_chirho !==
			`/content-chirho/${bookChirho.slug_chirho}/chapter-${chapterTextChirho.padStart(2, '0')}-chirho.json` ||
		chapterChirho.content_sha256_chirho !== inputChirho.content_sha256_chirho ||
		!Array.isArray(chapterChirho.clips_chirho) ||
		(chapterChirho.readings_chirho !== undefined &&
			!Array.isArray(chapterChirho.readings_chirho)) ||
		chapterChirho.clips_chirho.length + (chapterChirho.readings_chirho?.length ?? 0) > 2000
	)
		throw Error('One bounded matching content/audio chapter required');
	const versesChirho = contentChirho.verses_chirho.filter(
			(rowChirho) => rowChirho.id_chirho === inputChirho.lesson_id_chirho
		),
		lessonChirho = versesChirho[0];
	if (
		versesChirho.length !== 1 ||
		!lessonChirho ||
		typeof lessonChirho.canonical_text_chirho !== 'string' ||
		!lessonChirho.canonical_text_chirho.length ||
		lessonChirho.canonical_text_chirho.length > 10000 ||
		!Array.isArray(lessonChirho.tokens_chirho) ||
		!lessonChirho.tokens_chirho.length ||
		lessonChirho.tokens_chirho.length > 1000
	)
		throw Error('One bounded raw verse row required');

	for (const tokenChirho of lessonChirho.tokens_chirho) {
		if (
			!tokenChirho ||
			typeof tokenChirho.id_chirho !== 'string' ||
			typeof tokenChirho.text_chirho !== 'string' ||
			!Number.isSafeInteger(tokenChirho.start_chirho) ||
			!Number.isSafeInteger(tokenChirho.end_chirho) ||
			tokenChirho.start_chirho < 0 ||
			tokenChirho.end_chirho < tokenChirho.start_chirho ||
			tokenChirho.end_chirho > lessonChirho.canonical_text_chirho.length ||
			(tokenChirho.qere_chirho !== undefined &&
				(!Array.isArray(tokenChirho.qere_chirho) ||
					tokenChirho.qere_chirho.some(
						(rowChirho) => !rowChirho || typeof rowChirho.text_chirho !== 'string'
					)))
		)
			throw Error('Invalid lesson word identity');
	}
	const canonicalChirho = createHashChirho('sha256')
		.update(lessonChirho.canonical_text_chirho)
		.digest('hex');
	const selectedChirho = automaticVerseRecordingChirho(
		recordingsFromChapterChirho(lessonChirho, chapterChirho, canonicalChirho),
		lessonChirho
	);
	return {
		lesson_id_chirho: lessonChirho.id_chirho,
		selected_chirho: selectedChirho ? recordingIdentityChirho(selectedChirho) : null
	};
}
if (import.meta.main) {
	try {
		const partsChirho: Uint8Array[] = [];
		let lengthChirho = 0;
		for await (const partChirho of process.stdin) {
			const chunkChirho = partChirho instanceof Uint8Array ? partChirho : Buffer.from(partChirho);
			lengthChirho += chunkChirho.length;
			if (lengthChirho > BRIDGE_LIMIT_CHIRHO)
				throw Error('Selection bridge input exceeds four MiB');
			partsChirho.push(chunkChirho);
		}

		const bytesChirho = new Uint8Array(lengthChirho);
		let offsetChirho = 0;
		for (const partChirho of partsChirho) {
			bytesChirho.set(partChirho, offsetChirho);
			offsetChirho += partChirho.length;
		}
		console.log(
			JSON.stringify(
				selectedRecordingDescriptorChirho(
					JSON.parse(new TextDecoder('utf-8', { fatal: true }).decode(bytesChirho))
				)
			)
		);
	} catch (errorChirho) {
		console.error(
			errorChirho instanceof Error &&
				errorChirho.message === 'Selection bridge input exceeds four MiB'
				? errorChirho.message
				: 'Selection bridge refused invalid or oversized input'
		);
		process.exitCode = 1;
	}
}
