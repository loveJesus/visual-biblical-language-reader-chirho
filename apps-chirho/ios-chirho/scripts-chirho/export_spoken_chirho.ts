// For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life. — John 3:16 (KJV)
// Workflow: native-reader spoken parity. Export reviewed speech facts separately from canonical content.
import { readFileSync as readFileSyncChirho } from 'node:fs';
import { join as joinChirho } from 'node:path';
import { createHash as createHashChirho } from 'node:crypto';
import { isDeepStrictEqual as equalChirho } from 'node:util';
import { bibleBookChirho } from '../../../src/lib/bible-chirho/books-chirho';
import {
	CONTINUATION_READINGS_CHIRHO,
	readingReviewChirho,
	reviewedPlaybackTokensChirho,
	sourceSpokenWordChirho,
	type ReadingTokenChirho
} from '../../../src/lib/domain-chirho/pronunciation-chirho/hebrew-chirho/reading-continuation-chirho';

function identityChirho(tokenChirho: ReadingTokenChirho): object {
	return {
		id_chirho: tokenChirho.id_chirho,
		text_chirho: tokenChirho.text_chirho,
		lemma_id_chirho: tokenChirho.lemma_id_chirho,
		lemma_augment_chirho: tokenChirho.lemma_augment_chirho ?? null,
		raw_morphology_chirho: tokenChirho.raw_morphology_chirho,
		...(tokenChirho.qere_chirho?.length
			? { qere_chirho: tokenChirho.qere_chirho.map(identityChirho) }
			: {})
	};
}
const digestChirho = (bytesChirho: Uint8Array) =>
	createHashChirho('sha256').update(bytesChirho).digest('hex');

/** Every emitted row is cold checked against its exact current canonical chapter and web review. */
export function spokenOverridesChirho(rootChirho: string) {
	const selectedChirho = CONTINUATION_READINGS_CHIRHO.filter(
		(rowChirho) =>
			rowChirho.spoken_reading_chirho !==
			sourceSpokenWordChirho({
				...rowChirho,
				id_chirho: rowChirho.token_id_chirho,
				qere_chirho: rowChirho.qere_binding_chirho ?? undefined
			})
	);
	const wordsChirho = selectedChirho.map((rowChirho) => {
		const [bookIdChirho, chapterTextChirho] = rowChirho.lesson_id_chirho.split('.');
		const bookChirho = bibleBookChirho(bookIdChirho);
		const contentPathChirho = `/content-chirho/${bookChirho.slug_chirho}/chapter-${chapterTextChirho.padStart(2, '0')}-chirho.json`;
		const manifestChirho = JSON.parse(
			readFileSyncChirho(
				joinChirho(
					rootChirho,
					'static/content-chirho',
					bookChirho.slug_chirho,
					'manifest-chirho.json'
				),
				'utf8'
			)
		);
		const entryChirho = manifestChirho.chapters_chirho.find(
			(entryChirho: { path_chirho: string }) => entryChirho.path_chirho === contentPathChirho
		);
		const chapterBytesChirho = readFileSyncChirho(
			joinChirho(rootChirho, 'static', contentPathChirho)
		);
		if (!entryChirho || digestChirho(chapterBytesChirho) !== entryChirho.sha256_chirho)
			throw Error('Spoken override canonical chapter changed');
		const chapterChirho = JSON.parse(chapterBytesChirho.toString()) as {
			verses_chirho: {
				id_chirho: string;
				canonical_text_chirho: string;
				tokens_chirho: (ReadingTokenChirho & { start_chirho: number; end_chirho: number })[];
			}[];
		};
		const lessonChirho = chapterChirho.verses_chirho.find(
			(lessonChirho) => lessonChirho.id_chirho === rowChirho.lesson_id_chirho
		);
		const evidenceChirho = rowChirho.evidence_chirho as {
			chapter_path_chirho?: string;
			chapter_sha256_chirho?: string;
			canonical_sha256_chirho?: string;
		};
		if (
			evidenceChirho.chapter_path_chirho !== `static${contentPathChirho}` ||
			evidenceChirho.chapter_sha256_chirho !== digestChirho(chapterBytesChirho) ||
			!lessonChirho ||
			evidenceChirho.canonical_sha256_chirho !==
				digestChirho(Buffer.from(lessonChirho.canonical_text_chirho))
		)
			throw Error('Spoken override pinned review evidence changed');
		const tokenChirho = lessonChirho?.tokens_chirho.find(
			(tokenChirho) => tokenChirho.id_chirho === rowChirho.token_id_chirho
		);
		if (!lessonChirho || !tokenChirho || !equalChirho(readingReviewChirho(tokenChirho), rowChirho))
			throw Error('Spoken override source token or qere changed');
		if (rowChirho.written_group_chirho?.length) {
			const actualChirho = reviewedPlaybackTokensChirho(
				lessonChirho.canonical_text_chirho,
				lessonChirho.tokens_chirho
			).find(
				(valueChirho) =>
					valueChirho.token_chirho.id_chirho === rowChirho.written_group_chirho!.at(-1)!.id_chirho
			);
			const firstChirho = lessonChirho.tokens_chirho.find(
				(valueChirho) => valueChirho.id_chirho === rowChirho.written_group_chirho![0].id_chirho
			);
			if (
				rowChirho.canonical_text_chirho !== lessonChirho.canonical_text_chirho ||
				!firstChirho ||
				!actualChirho ||
				actualChirho.spoken_text_chirho !== rowChirho.spoken_reading_chirho ||
				actualChirho.start_chirho !== firstChirho.start_chirho ||
				actualChirho.end_chirho !==
					lessonChirho.tokens_chirho.find(
						(valueChirho) =>
							valueChirho.id_chirho === rowChirho.written_group_chirho!.at(-1)!.id_chirho
					)!.end_chirho
			)
				throw Error('Spoken override consecutive group or canonical context changed');
		}
		return {
			lesson_id_chirho: rowChirho.lesson_id_chirho,
			token_id_chirho: rowChirho.token_id_chirho,
			text_chirho: rowChirho.text_chirho,
			lemma_id_chirho: rowChirho.lemma_id_chirho,
			lemma_augment_chirho: rowChirho.lemma_augment_chirho,
			raw_morphology_chirho: rowChirho.raw_morphology_chirho,
			qere_binding_chirho: rowChirho.qere_binding_chirho?.map(identityChirho) ?? null,
			spoken_reading_chirho: rowChirho.spoken_reading_chirho,
			written_group_chirho: rowChirho.written_group_chirho?.map(identityChirho) ?? null,
			canonical_text_chirho: rowChirho.canonical_text_chirho
		};
	});
	return { schema_version_chirho: 1, words_chirho: wordsChirho };
}
