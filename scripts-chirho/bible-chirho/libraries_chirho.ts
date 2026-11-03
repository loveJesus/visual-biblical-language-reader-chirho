// For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life. — John 3:16 (KJV)
// Workflow: whole-bible-chirho.md. Offline exact-key reuse; no generation, provider or network call.
import { readFile as readFileChirho, mkdir as mkdirChirho } from 'node:fs/promises';
import { join as joinChirho, resolve as resolveChirho } from 'node:path';
import { BIBLE_BOOKS_CHIRHO } from '../../src/lib/bible-chirho/books-chirho';
import {
	cacheKeyChirho,
	sha256Chirho,
	writeChirho,
	type AudioJobChirho
} from '../audio-chirho/audition_chirho';
import { audioReceiptsChirho } from '../audio-chirho/r2_recordings_chirho';
import type { LibraryWordChirho } from '../audio-chirho/production-chirho/prepare_words_chirho';
import { isRejectedAudioChirho } from '../../src/lib/domain-chirho/pronunciation-chirho/audio-reviews-chirho';
import {
	validRecordingWindowChirho,
	GREEK_WORD_RECIPE_CHIRHO,
	HEBREW_WORD_RECIPE_CHIRHO
} from '../../src/lib/domain-chirho/pronunciation-chirho/production-recipe-chirho';
import { acquireLockChirho } from '../publish-chirho/r2_upload_watch_chirho';
import { spokenWordChirho } from '../../src/lib/domain-chirho/pronunciation-chirho';

interface ClipChirho extends AudioJobChirho {
	sha256_chirho: string;
	bytes_chirho: number;
	asset_path_chirho: string;
	duration_chirho: number;
	start_offset_chirho?: number;
	end_offset_chirho?: number;
	review_chirho: string;
}
interface AudioChapterChirho {
	schema_version_chirho: 1;
	book_id_chirho: string;
	chapter_chirho: number;
	content_path_chirho: string;
	content_sha256_chirho: string;
	clips_chirho: ClipChirho[];
}
interface AudioManifestChirho {
	schema_version_chirho: 1;
	books_chirho: Record<
		string,
		{ chapters_chirho: { number_chirho: number; path_chirho: string; sha256_chirho: string }[] }
	>;
}
interface SourceTokenChirho {
	id_chirho: string;
	text_chirho: string;
	lemma_id_chirho: string;
	lemma_augment_chirho?: string | null;
	lexical_form_chirho: string;
	gloss_chirho: string | null;
	lemma_assignment_status_chirho?: string;
	qere_chirho?: SourceTokenChirho[];
}
const jsonChirho = async <ValueChirho>(pathChirho: string) =>
	JSON.parse(await readFileChirho(pathChirho, 'utf8')) as ValueChirho;
const keyChirho = (tokenChirho: SourceTokenChirho) =>
	JSON.stringify([
		tokenChirho.lemma_id_chirho,
		tokenChirho.lemma_id_chirho.startsWith('G')
			? tokenChirho.lexical_form_chirho
			: (tokenChirho.lemma_augment_chirho ?? null)
	]);

export async function extendLibrariesChirho(rootChirho: string) {
	const audioRootChirho = joinChirho(rootChirho, 'static/audio-chirho');
	const audioManifestPathChirho = joinChirho(audioRootChirho, 'manifest-chirho.json');
	const manifestChirho = await jsonChirho<AudioManifestChirho>(audioManifestPathChirho);
	const archiveChirho = await audioReceiptsChirho(rootChirho);
	const recordingsChirho = new Map<string, ClipChirho>();
	const originalsChirho = new Map<string, AudioChapterChirho>();
	const verifiedChirho = new Set<string>();
	for (const entryBookChirho of Object.values(manifestChirho.books_chirho)) {
		for (const entryChirho of entryBookChirho.chapters_chirho) {
			const rawChirho = await readFileChirho(
				joinChirho(rootChirho, 'static', entryChirho.path_chirho)
			);
			if (sha256Chirho(rawChirho) !== entryChirho.sha256_chirho)
				throw new Error('Existing audio chapter drift.');
			const chapterChirho = JSON.parse(rawChirho.toString('utf8')) as AudioChapterChirho;
			originalsChirho.set(chapterChirho.content_path_chirho, chapterChirho);
			for (const clipChirho of chapterChirho.clips_chirho) {
				if (
					!clipChirho.token_id_chirho ||
					![GREEK_WORD_RECIPE_CHIRHO, HEBREW_WORD_RECIPE_CHIRHO].includes(
						clipChirho.recipe_id_chirho ?? ''
					) ||
					isRejectedAudioChirho(clipChirho.sha256_chirho) ||
					!validRecordingWindowChirho(clipChirho)
				)
					continue;
				const receiptChirho = archiveChirho.get(
					'audio-chirho/sha256-chirho/' + clipChirho.sha256_chirho + '.mp3'
				);
				if (
					receiptChirho?.readback_sha256_chirho !== clipChirho.sha256_chirho ||
					receiptChirho.bytes_chirho !== clipChirho.bytes_chirho
				)
					throw new Error('Reusable recording lacks exact R2 readback evidence.');
				if (!verifiedChirho.has(clipChirho.sha256_chirho)) {
					const bytesChirho = await readFileChirho(
						joinChirho(rootChirho, 'static', clipChirho.asset_path_chirho)
					);
					if (
						sha256Chirho(bytesChirho) !== clipChirho.sha256_chirho ||
						bytesChirho.length !== clipChirho.bytes_chirho
					)
						throw new Error('Reusable recording bytes changed.');
					verifiedChirho.add(clipChirho.sha256_chirho);
				}
				const identityChirho = cacheKeyChirho(clipChirho);
				const previousChirho = recordingsChirho.get(identityChirho);
				if (previousChirho && previousChirho.sha256_chirho !== clipChirho.sha256_chirho)
					throw new Error('Pronunciation identity has conflicting recordings.');
				recordingsChirho.set(identityChirho, clipChirho);
			}
		}
	}
	const homeChirho = joinChirho(
		rootChirho,
		'workspace-chirho/audio-chirho/bible-2026-11-02-chirho'
	);
	const indexChirho = await jsonChirho<{
		batches_chirho: { path_chirho: string; sha256_chirho: string }[];
	}>(joinChirho(homeChirho, 'index-chirho.json'));
	const changesChirho = new Map<
		string,
		{ word_chirho: LibraryWordChirho; clip_chirho: ClipChirho }[]
	>();
	let missingFormsChirho = 0,
		missingCreditsChirho = 0,
		reusedFormsChirho = 0;
	const missingChirho = [];
	for (const batchChirho of indexChirho.batches_chirho) {
		const rawChirho = await readFileChirho(joinChirho(homeChirho, batchChirho.path_chirho));
		if (sha256Chirho(rawChirho) !== batchChirho.sha256_chirho)
			throw new Error('Whole-Bible pronunciation plan drift.');
		for (const wordChirho of (
			JSON.parse(rawChirho.toString('utf8')) as { words_chirho: LibraryWordChirho[] }
		).words_chirho) {
			if (wordChirho.key_chirho !== cacheKeyChirho(wordChirho.job_chirho))
				throw new Error('Pronunciation cache key drift.');
			const sourceChirho = recordingsChirho.get(wordChirho.key_chirho);
			if (!sourceChirho) {
				missingFormsChirho++;
				missingCreditsChirho += [...wordChirho.job_chirho.synthesis_text_chirho!].length;
				missingChirho.push({
					key_chirho: wordChirho.key_chirho,
					batch_path_chirho: batchChirho.path_chirho,
					occurrence_count_chirho: wordChirho.occurrences_chirho.length,
					estimated_credits_chirho: [...wordChirho.job_chirho.synthesis_text_chirho!].length
				});
				continue;
			}
			reusedFormsChirho++;
			for (const occurrenceChirho of wordChirho.occurrences_chirho) {
				const groupChirho = changesChirho.get(occurrenceChirho.content_path_chirho) ?? [];
				groupChirho.push({
					word_chirho: { ...wordChirho, occurrences_chirho: [occurrenceChirho] },
					clip_chirho: sourceChirho
				});
				changesChirho.set(occurrenceChirho.content_path_chirho, groupChirho);
			}
		}
	}
	let installedChirho = 0;
	const reportChirho = [];
	const libraryChirho = new Map<
		string,
		{
			lemma_key_chirho: string;
			lemma_id_chirho: string;
			lemma_augment_chirho: string | null;
			lexical_form_chirho: string;
			occurrence_count_chirho: number;
			examples_chirho: unknown[];
			has_picture_chirho: boolean;
		}
	>();
	for (const bookChirho of BIBLE_BOOKS_CHIRHO) {
		const contentManifestChirho = await jsonChirho<{
			chapters_chirho: { number_chirho: number; path_chirho: string; sha256_chirho: string }[];
		}>(
			joinChirho(
				rootChirho,
				'static/content-chirho',
				bookChirho.slug_chirho,
				'manifest-chirho.json'
			)
		);
		let wordsChirho = 0,
			picturedChirho = 0,
			voicedChirho = 0;
		for (const entryChirho of contentManifestChirho.chapters_chirho) {
			const bytesChirho = await readFileChirho(
				joinChirho(rootChirho, 'static', entryChirho.path_chirho)
			);
			if (sha256Chirho(bytesChirho) !== entryChirho.sha256_chirho)
				throw new Error('Corpus changed during library build.');
			const contentChirho = JSON.parse(bytesChirho.toString('utf8')) as {
				verses_chirho: {
					id_chirho: string;
					canonical_text_chirho: string;
					tokens_chirho: SourceTokenChirho[];
				}[];
			};
			const audioChapterChirho: AudioChapterChirho = originalsChirho.get(
				entryChirho.path_chirho
			) ?? {
				schema_version_chirho: 1,
				book_id_chirho: bookChirho.id_chirho,
				chapter_chirho: entryChirho.number_chirho,
				content_path_chirho: entryChirho.path_chirho,
				content_sha256_chirho: entryChirho.sha256_chirho,
				clips_chirho: []
			};
			if (audioChapterChirho.content_sha256_chirho !== entryChirho.sha256_chirho)
				throw new Error('Existing audio source changed.');
			const sourceWordsChirho = new Map(
				contentChirho.verses_chirho.flatMap((verseChirho) =>
					verseChirho.tokens_chirho.map(
						(tokenChirho) =>
							[
								verseChirho.id_chirho + '!' + tokenChirho.id_chirho,
								{ verseChirho, tokenChirho }
							] as const
					)
				)
			);
			const clipIdsChirho = new Map(
				audioChapterChirho.clips_chirho.map((clipChirho) => [
					clipChirho.lesson_id_chirho +
						'!' +
						clipChirho.token_id_chirho +
						'!' +
						clipChirho.recipe_id_chirho,
					clipChirho
				])
			);
			let changedChirho = false;
			for (const reuseChirho of changesChirho.get(entryChirho.path_chirho) ?? []) {
				const occurrenceChirho = reuseChirho.word_chirho.occurrences_chirho[0];
				const sourceChirho = sourceWordsChirho.get(
					occurrenceChirho.lesson_id_chirho + '!' + occurrenceChirho.token_id_chirho
				);
				if (
					!sourceChirho ||
					occurrenceChirho.content_sha256_chirho !== entryChirho.sha256_chirho ||
					sha256Chirho(sourceChirho.verseChirho.canonical_text_chirho) !==
						occurrenceChirho.canonical_sha256_chirho ||
					spokenWordChirho(sourceChirho.tokenChirho) !== occurrenceChirho.text_chirho
				)
					throw new Error('Reusable word source binding changed.');
				const clipChirho = {
					...reuseChirho.clip_chirho,
					...reuseChirho.word_chirho.job_chirho,
					lesson_id_chirho: occurrenceChirho.lesson_id_chirho,
					token_id_chirho: occurrenceChirho.token_id_chirho,
					text_chirho: occurrenceChirho.text_chirho,
					canonical_sha256_chirho: occurrenceChirho.canonical_sha256_chirho
				};
				const identityChirho =
					clipChirho.lesson_id_chirho +
					'!' +
					clipChirho.token_id_chirho +
					'!' +
					clipChirho.recipe_id_chirho;
				const previousChirho = clipIdsChirho.get(identityChirho);
				if (previousChirho && previousChirho.sha256_chirho !== clipChirho.sha256_chirho)
					throw new Error('Existing pronunciation would be overwritten.');
				if (!previousChirho) {
					changedChirho = true;
					audioChapterChirho.clips_chirho.push(clipChirho);
					clipIdsChirho.set(identityChirho, clipChirho);
					installedChirho++;
				}
			}
			if (changedChirho) {
				if (audioChapterChirho.clips_chirho.length > 2000)
					throw new Error('Word audio chapter needs finer sharding.');
				const encodedChirho = JSON.stringify(audioChapterChirho, null, 2) + '\n';
				if (Buffer.byteLength(encodedChirho) > 2_000_000)
					throw new Error('Word audio catalogue exceeds client bound.');
				const pathChirho =
					'/audio-chirho/' +
					bookChirho.slug_chirho +
					'/chapter-' +
					String(entryChirho.number_chirho).padStart(2, '0') +
					'-chirho.json';
				await writeChirho(joinChirho(rootChirho, 'static', pathChirho), encodedChirho);
				const entriesChirho = (manifestChirho.books_chirho[bookChirho.id_chirho] ??= {
					chapters_chirho: []
				}).chapters_chirho;
				const nextChirho = {
					number_chirho: entryChirho.number_chirho,
					path_chirho: pathChirho,
					sha256_chirho: sha256Chirho(encodedChirho)
				};
				const priorChirho = entriesChirho.findIndex(
					(entryChirho) => entryChirho.number_chirho === nextChirho.number_chirho
				);
				if (priorChirho < 0) entriesChirho.push(nextChirho);
				else entriesChirho[priorChirho] = nextChirho;
				entriesChirho.sort(
					(leftChirho, rightChirho) => leftChirho.number_chirho - rightChirho.number_chirho
				);
			}
			const chapterMediaPathChirho = joinChirho(
				rootChirho,
				'static/media-chirho',
				bookChirho.slug_chirho,
				'chapter-' + String(entryChirho.number_chirho).padStart(2, '0') + '-chirho.json'
			);
			const mediaChirho = await jsonChirho<{ lemma_icons_chirho?: SourceTokenChirho[] }>(
				chapterMediaPathChirho
			).catch((errorChirho) => {
				if (errorChirho.code === 'ENOENT') return { lemma_icons_chirho: [] as SourceTokenChirho[] };
				throw errorChirho;
			});
			const picturesChirho = new Set((mediaChirho.lemma_icons_chirho ?? []).map(keyChirho));
			for (const verseChirho of contentChirho.verses_chirho)
				for (const tokenChirho of verseChirho.tokens_chirho) {
					wordsChirho++;
					const eligibleChirho =
						tokenChirho.lemma_assignment_status_chirho !== 'source_review_required';
					const lemmaChirho = keyChirho(tokenChirho);
					const hasPictureChirho = eligibleChirho && picturesChirho.has(lemmaChirho);
					if (hasPictureChirho) picturedChirho++;
					if (
						audioChapterChirho.clips_chirho.some(
							(clipChirho) =>
								clipChirho.lesson_id_chirho === verseChirho.id_chirho &&
								clipChirho.token_id_chirho === tokenChirho.id_chirho
						)
					)
						voicedChirho++;
					if (!eligibleChirho) continue;
					const recordChirho = libraryChirho.get(lemmaChirho) ?? {
						lemma_key_chirho: lemmaChirho,
						lemma_id_chirho: tokenChirho.lemma_id_chirho,
						lemma_augment_chirho: tokenChirho.lemma_augment_chirho ?? null,
						lexical_form_chirho: tokenChirho.lexical_form_chirho,
						occurrence_count_chirho: 0,
						examples_chirho: [],
						has_picture_chirho: hasPictureChirho
					};
					recordChirho.occurrence_count_chirho++;
					if (recordChirho.examples_chirho.length < 8)
						recordChirho.examples_chirho.push({
							lesson_id_chirho: verseChirho.id_chirho,
							token_id_chirho: tokenChirho.id_chirho,
							text_chirho: tokenChirho.text_chirho,
							gloss_chirho: tokenChirho.gloss_chirho,
							content_path_chirho: entryChirho.path_chirho,
							content_sha256_chirho: entryChirho.sha256_chirho
						});
					recordChirho.has_picture_chirho ||= hasPictureChirho;
					libraryChirho.set(lemmaChirho, recordChirho);
				}
		}
		reportChirho.push({
			book_id_chirho: bookChirho.id_chirho,
			words_chirho: wordsChirho,
			pictured_words_chirho: picturedChirho,
			recorded_words_chirho: voicedChirho
		});
	}
	await writeChirho(audioManifestPathChirho, JSON.stringify(manifestChirho, null, 2) + '\n');
	const outputHomeChirho = joinChirho(rootChirho, 'data-chirho/bible-chirho/library-chirho');
	await mkdirChirho(outputHomeChirho, { recursive: true });
	const lemmasChirho = [...libraryChirho.values()];
	for (let shardChirho = 0; shardChirho < 256; shardChirho++) {
		const prefixChirho = shardChirho.toString(16).padStart(2, '0');
		const entriesChirho = lemmasChirho.filter((entryChirho) =>
			sha256Chirho(entryChirho.lemma_key_chirho).startsWith(prefixChirho)
		);
		await writeChirho(
			joinChirho(outputHomeChirho, 'lemmas-chirho', prefixChirho + '-chirho.json'),
			JSON.stringify({ schema_version_chirho: 1, lemmas_chirho: entriesChirho }, null, 2) + '\n'
		);
	}
	const reportValueChirho = {
		schema_version_chirho: 1,
		new_recorded_occurrences_chirho: installedChirho,
		reused_recording_forms_chirho: reusedFormsChirho,
		missing_recording_forms_chirho: missingFormsChirho,
		estimated_missing_credits_chirho: missingCreditsChirho,
		lemma_count_chirho: lemmasChirho.length,
		pictured_lemmas_chirho: lemmasChirho.filter((entryChirho) => entryChirho.has_picture_chirho)
			.length,
		books_chirho: reportChirho
	};
	await writeChirho(
		joinChirho(outputHomeChirho, 'coverage-chirho.json'),
		JSON.stringify(reportValueChirho, null, 2) + '\n'
	);
	await writeChirho(
		joinChirho(outputHomeChirho, 'audio-missing-chirho.json'),
		JSON.stringify({ schema_version_chirho: 1, words_chirho: missingChirho }, null, 2) + '\n'
	);
	return reportValueChirho;
}
if (import.meta.main) {
	const rootChirho = resolveChirho('.');
	const releaseChirho = await acquireLockChirho(
		joinChirho(rootChirho, 'build-chirho/r2-chirho/audio-catalogue-chirho.lock')
	);
	try {
		console.log(JSON.stringify(await extendLibrariesChirho(rootChirho), null, 2));
	} finally {
		await releaseChirho();
	}
}
