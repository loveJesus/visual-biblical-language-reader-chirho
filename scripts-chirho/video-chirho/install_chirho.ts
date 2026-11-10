// For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life. — John 3:16 (KJV)
// Workflow: verse-media-chirho.md. Bounded existing MP4s, exact source readback, then atomic catalogue entries.
import {
	readFile as readFileChirho,
	lstat as lstatChirho,
	realpath as realpathChirho,
	mkdir as mkdirChirho
} from 'node:fs/promises';
import { join as joinChirho, resolve as resolveChirho } from 'node:path';
import { spawnSync as spawnSyncChirho } from 'node:child_process';
import { isDeepStrictEqual as equalChirho } from 'node:util';
import {
	validVerseVideoChirho,
	sameEmbeddedReadingChirho,
	VERSE_VIDEO_LIMIT_CHIRHO,
	type VerseVideoChirho
} from '../../src/lib/domain-chirho/verse-video-chirho';
import { validHumanRecordingChirho } from '../../src/lib/domain-chirho/pronunciation-chirho/reading-source-chirho';
import { spokenVerseChirho } from '../../src/lib/domain-chirho/pronunciation-chirho';
import { isRejectedAudioChirho } from '../../src/lib/domain-chirho/pronunciation-chirho/audio-reviews-chirho';
import type { LessonChirho } from '../../src/lib/domain-chirho/lesson-chirho';
import type { GreekLessonChirho } from '../../src/lib/domain-chirho/greek-chirho';
import { bibleBookChirho } from '../../src/lib/bible-chirho/books-chirho';
import {
	readFiniteVideoBatchChirho,
	selectedSyntheticVerseChirho,
	FINITE_VIDEO_BATCH_LIMIT_CHIRHO
} from './finite_batch_chirho';
import type { RecordingChirho } from '../../src/lib/reader-chirho/audio-chirho/recordings-chirho';
import {
	readVideoCatalogueChirho,
	VIDEO_CATALOGUE_CHIRHO,
	type VideoEntryChirho
} from '../publish-chirho/video_rules_chirho';
import { objectRequestChirho, digestChirho } from '../publish-chirho/r2-chirho/object-store-chirho';
import { acquireLockChirho } from '../publish-chirho/r2_upload_watch_chirho';
import { writeChirho } from '../audio-chirho/audition_chirho';

export const PROVERBS_VIDEO_HOME_CHIRHO =
	'workspace-chirho/video-chirho/proverbs-first-verses-2026-11-06-chirho/videos-chirho';
export const GENESIS_VIDEO_RUN_CHIRHO =
	'workspace-chirho/video-chirho/genesis-1-3-pixverse-2026-11-06-chirho';
export const GENESIS_VIDEO_HOME_CHIRHO = `${GENESIS_VIDEO_RUN_CHIRHO}/videos-chirho`;
export interface VideoInstallOptionsChirho {
	root_chirho: string;
	scope_chirho?: 'proverbs_openings_chirho' | 'genesis_three_chirho' | 'finite_batch_chirho';
	/** Explicit caller-pinned private batch; never a built-in plan or provider permission. */
	batch_chirho?: { path_chirho: string; sha256_chirho: string };
	apply_chirho?: boolean;
	object_chirho?: (
		methodChirho: 'GET' | 'PUT',
		keyChirho: string,
		bytesChirho?: Uint8Array
	) => Promise<Response>;
}
interface InputChirho {
	video_chirho: VerseVideoChirho;
	bytes_chirho: Uint8Array;
	held_chirho: boolean;
	prior_chirho?: VideoEntryChirho;
}
interface PreflightChirho {
	rows_chirho: InputChirho[];
	entries_chirho: VideoEntryChirho[];
	hashes_chirho: Map<string, string>;
	catalogue_sha256_chirho: string | null;
	source_limits_chirho: Map<string, number>;
}
function relativeChirho(pathChirho: string) {
	if (
		pathChirho.startsWith('/') ||
		/[\\\0]/u.test(pathChirho) ||
		pathChirho.split('/').some((partChirho) => !partChirho || ['.', '..'].includes(partChirho))
	)
		throw Error('Unowned video path');
	return pathChirho;
}
async function readChirho(
	rootChirho: string,
	pathChirho: string,
	limitChirho: number,
	hashesChirho?: Map<string, string>,
	deliveryChirho = false
) {
	relativeChirho(pathChirho);
	const fullChirho = joinChirho(rootChirho, pathChirho),
		infoChirho = await lstatChirho(fullChirho),
		realChirho = await realpathChirho(fullChirho);
	if (
		!infoChirho.isFile() ||
		infoChirho.isSymbolicLink() ||
		infoChirho.size > limitChirho ||
		(!deliveryChirho && realChirho !== fullChirho) ||
		!realChirho.startsWith(rootChirho + '/')
	)
		throw Error('Linked, foreign or oversized video input');
	const bytesChirho = await readFileChirho(fullChirho);
	if (bytesChirho.length > limitChirho) throw Error('Video input grew');
	const hashChirho = digestChirho(bytesChirho);
	if (hashesChirho?.has(pathChirho) && hashesChirho.get(pathChirho) !== hashChirho)
		throw Error('Video input changed during preflight');
	hashesChirho?.set(pathChirho, hashChirho);
	return bytesChirho;
}
async function optionalCatalogueChirho(rootChirho: string) {
	try {
		return await readChirho(rootChirho, VIDEO_CATALOGUE_CHIRHO, 4 * 1024 ** 2);
	} catch (errorChirho) {
		if ((errorChirho as NodeJS.ErrnoException).code === 'ENOENT') return null;
		throw errorChirho;
	}
}
async function directoriesChirho(rootChirho: string, pathChirho: string) {
	let fullChirho = rootChirho;
	for (const partChirho of relativeChirho(pathChirho).split('/')) {
		fullChirho = joinChirho(fullChirho, partChirho);
		try {
			await mkdirChirho(fullChirho);
		} catch (errorChirho) {
			if ((errorChirho as NodeJS.ErrnoException).code !== 'EEXIST') throw errorChirho;
		}
		const infoChirho = await lstatChirho(fullChirho);
		if (
			!infoChirho.isDirectory() ||
			infoChirho.isSymbolicLink() ||
			(await realpathChirho(fullChirho)) !== fullChirho
		)
			throw Error('Redirected video output directory');
	}
}
/** Human-only selection mirrors the web's human branch; invalid claims are never AI fallbacks. */
function humanChirho(
	clipsChirho: RecordingChirho[],
	lessonChirho: LessonChirho | GreekLessonChirho
) {
	const canonicalChirho = digestChirho(lessonChirho.canonical_text_chirho),
		spokenChirho = spokenVerseChirho(lessonChirho);
	return clipsChirho
		.filter(
			(clipChirho) =>
				validHumanRecordingChirho(clipChirho) &&
				!isRejectedAudioChirho(clipChirho.sha256_chirho) &&
				clipChirho.lesson_id_chirho === lessonChirho.id_chirho &&
				clipChirho.canonical_sha256_chirho === canonicalChirho &&
				clipChirho.text_chirho === spokenChirho &&
				['audition', 'approved'].includes(clipChirho.review_chirho) &&
				/^[a-f0-9]{64}$/.test(clipChirho.sha256_chirho) &&
				clipChirho.asset_path_chirho ===
					`/audio-chirho/sha256-chirho/${clipChirho.sha256_chirho}-chirho.mp3` &&
				Number.isSafeInteger(clipChirho.bytes_chirho) &&
				clipChirho.bytes_chirho > 0 &&
				clipChirho.bytes_chirho <= 4_000_000 &&
				Number.isFinite(clipChirho.duration_chirho) &&
				clipChirho.duration_chirho > 0 &&
				clipChirho.duration_chirho <= 120
		)
		.sort(
			(leftChirho, rightChirho) =>
				Number(rightChirho.review_chirho === 'approved') -
				Number(leftChirho.review_chirho === 'approved')
		)[0];
}
function scopeChirho(optionsChirho: VideoInstallOptionsChirho) {
	const genesisChirho = optionsChirho.scope_chirho === 'genesis_three_chirho';
	const finiteChirho = optionsChirho.scope_chirho === 'finite_batch_chirho';
	if (
		optionsChirho.scope_chirho !== undefined &&
		!['genesis_three_chirho', 'proverbs_openings_chirho', 'finite_batch_chirho'].includes(
			optionsChirho.scope_chirho
		)
	)
		throw Error('Unowned video scope');
	if (finiteChirho !== Boolean(optionsChirho.batch_chirho))
		throw Error('A finite batch needs its explicit pinned input and cannot use a legacy scope');
	const homeChirho = genesisChirho ? GENESIS_VIDEO_HOME_CHIRHO : PROVERBS_VIDEO_HOME_CHIRHO;
	return {
		genesis_chirho: genesisChirho,
		finite_chirho: finiteChirho,
		home_chirho: homeChirho,
		limit_chirho: finiteChirho ? FINITE_VIDEO_BATCH_LIMIT_CHIRHO : genesisChirho ? 24 : 31,
		slug_chirho: genesisChirho ? 'genesis-chirho' : 'proverbs-chirho',
		book_chirho: genesisChirho ? 'Gen' : 'Prov'
	};
}
async function preflightChirho(optionsChirho: VideoInstallOptionsChirho): Promise<PreflightChirho> {
	const rootChirho = optionsChirho.root_chirho,
		scopeValueChirho = scopeChirho(optionsChirho),
		hashesChirho = new Map<string, string>(),
		limitsChirho = new Map<string, number>();
	const jsonChirho = async (
		pathChirho: string,
		deliveryChirho = false,
		limitChirho = 4 * 1024 ** 2
	) => {
		limitsChirho.set(pathChirho, limitChirho);
		return JSON.parse(
			(
				await readChirho(rootChirho, pathChirho, limitChirho, hashesChirho, deliveryChirho)
			).toString()
		);
	};
	const batchValueChirho = scopeValueChirho.finite_chirho
		? await readFiniteVideoBatchChirho(optionsChirho.batch_chirho!, jsonChirho, hashesChirho)
		: null;
	const sourceBytesChirho = batchValueChirho
		? null
		: await readChirho(
				rootChirho,
				`${scopeValueChirho.home_chirho}/videos-records-chirho.json`,
				256 * 1024,
				hashesChirho
			);
	const sourceChirho =
		batchValueChirho ??
		(JSON.parse(sourceBytesChirho!.toString()) as {
			videos_chirho: VerseVideoChirho[];
		});
	if (
		!Array.isArray(sourceChirho.videos_chirho) ||
		sourceChirho.videos_chirho.length < 1 ||
		sourceChirho.videos_chirho.length > scopeValueChirho.limit_chirho
	)
		throw Error('Bounded video record count differs');
	const seenChirho = new Set<string>();
	for (const videoChirho of sourceChirho.videos_chirho) {
		const matchChirho = scopeValueChirho.finite_chirho
			? /^([1-3]?[A-Za-z]+)\.([1-9][0-9]{0,2})\.1$/.exec(videoChirho.lesson_id_chirho)
			: scopeValueChirho.genesis_chirho
				? /^Gen\.3\.([1-9]|1[0-9]|2[0-4])$/.exec(videoChirho.lesson_id_chirho)
				: /^Prov\.([1-9]|[12][0-9]|3[01])\.1$/.exec(videoChirho.lesson_id_chirho);
		if (!matchChirho || seenChirho.has(videoChirho.lesson_id_chirho))
			throw Error('Unowned or duplicate verse video');
		seenChirho.add(videoChirho.lesson_id_chirho);
	}
	const catalogueBytesChirho = await optionalCatalogueChirho(rootChirho),
		entriesChirho = await readVideoCatalogueChirho(rootChirho),
		rowsChirho: InputChirho[] = [];
	if ((await optionalCatalogueChirho(rootChirho))?.toString() !== catalogueBytesChirho?.toString())
		throw Error('Video catalogue changed during preflight');
	const audioManifestChirho = await jsonChirho('static/audio-chirho/manifest-chirho.json');
	for (const videoChirho of sourceChirho.videos_chirho) {
		const bookChirho = scopeValueChirho.finite_chirho
			? bibleBookChirho(videoChirho.lesson_id_chirho.split('.')[0])
			: null;
		const slugChirho = bookChirho?.slug_chirho ?? scopeValueChirho.slug_chirho,
			bookIdChirho = bookChirho?.id_chirho ?? scopeValueChirho.book_chirho;
		const contentManifestChirho = await jsonChirho(
			`static/content-chirho/${slugChirho}/manifest-chirho.json`
		);
		const mediaSummaryChirho = await jsonChirho(
			`build-chirho/preview-chirho/public-chirho/media-chirho/${slugChirho}/summary-chirho.json`,
			true
		);
		const chapterChirho = scopeValueChirho.genesis_chirho
				? 3
				: Number(videoChirho.lesson_id_chirho.split('.')[1]),
			verseNumberChirho = Number(videoChirho.lesson_id_chirho.split('.')[2]),
			suffixChirho = String(chapterChirho).padStart(2, '0');
		if (bookChirho && chapterChirho > bookChirho.chapter_count_chirho)
			throw Error('Finite video chapter exceeds its book');
		const contentPathChirho = `/content-chirho/${slugChirho}/chapter-${suffixChirho}-chirho.json`,
			audioPathChirho = `/audio-chirho/${slugChirho}/chapter-${suffixChirho}-chirho.json`,
			mediaPathChirho = `/media-chirho/${slugChirho}/chapter-${suffixChirho}-chirho.json`;
		const contentChirho = await jsonChirho('static' + contentPathChirho),
			audioChirho = await jsonChirho('static' + audioPathChirho),
			mediaChirho = await jsonChirho(
				'build-chirho/preview-chirho/public-chirho' + mediaPathChirho,
				true
			);
		const contentEntryChirho = contentManifestChirho.chapters_chirho.find(
				(rowChirho: { path_chirho: string }) => rowChirho.path_chirho === contentPathChirho
			),
			audioEntryChirho = audioManifestChirho.books_chirho[bookIdChirho]?.chapters_chirho.find(
				(rowChirho: { path_chirho: string; number_chirho: number }) =>
					rowChirho.path_chirho === audioPathChirho && rowChirho.number_chirho === chapterChirho
			),
			mediaEntryChirho = mediaSummaryChirho.chapters_chirho.find(
				(rowChirho: { path_chirho: string }) => rowChirho.path_chirho === mediaPathChirho
			);
		if (
			contentEntryChirho?.sha256_chirho !== hashesChirho.get('static' + contentPathChirho) ||
			audioEntryChirho?.sha256_chirho !== hashesChirho.get('static' + audioPathChirho) ||
			mediaEntryChirho?.sha256_chirho !==
				hashesChirho.get('build-chirho/preview-chirho/public-chirho' + mediaPathChirho) ||
			audioChirho.book_id_chirho !== bookIdChirho ||
			audioChirho.chapter_chirho !== chapterChirho ||
			audioChirho.content_path_chirho !== contentPathChirho ||
			audioChirho.content_sha256_chirho !== contentEntryChirho.sha256_chirho ||
			!Array.isArray(audioChirho.clips_chirho) ||
			(audioChirho.readings_chirho !== undefined && !Array.isArray(audioChirho.readings_chirho))
		)
			throw Error('Video source chapter/index binding differs');
		const verseChirho = contentChirho.verses_chirho.find(
			(rowChirho: LessonChirho) => rowChirho.id_chirho === videoChirho.lesson_id_chirho
		) as LessonChirho | GreekLessonChirho | undefined;
		const scenesChirho = mediaChirho.scenes_chirho.filter(
			(rowChirho: { lesson_id_chirho: string; variant_chirho?: string }) =>
				rowChirho.lesson_id_chirho === videoChirho.lesson_id_chirho &&
				(!rowChirho.variant_chirho || rowChirho.variant_chirho === 'standard')
		);
		if (
			!verseChirho ||
			scenesChirho.length !== 1 ||
			!validVerseVideoChirho(
				videoChirho,
				verseChirho.id_chirho,
				digestChirho(verseChirho.canonical_text_chirho),
				scenesChirho[0].sha256_chirho
			)
		)
			throw Error('Video source scene/canonical binding differs');
		const priorChirho = entriesChirho.find(
			(entryChirho) => entryChirho.video_chirho.lesson_id_chirho === videoChirho.lesson_id_chirho
		);
		if (priorChirho && !equalChirho(priorChirho.video_chirho, videoChirho))
			throw Error('Existing verse video must be reconciled before replacement');
		const filenameChirho = scopeValueChirho.genesis_chirho
			? `gen-003-${String(verseNumberChirho).padStart(3, '0')}-chirho.mp4`
			: `prov-${String(chapterChirho).padStart(3, '0')}-001-chirho.mp4`;
		const finiteRowChirho = batchValueChirho?.selected_chirho.get(videoChirho.lesson_id_chirho);
		if (
			finiteRowChirho &&
			(finiteRowChirho.inventory_chirho.content_path_chirho !== contentPathChirho ||
				finiteRowChirho.inventory_chirho.content_sha256_chirho !==
					hashesChirho.get('static' + contentPathChirho) ||
				(finiteRowChirho.job_chirho.scene_chirho as { asset_path_chirho: string })
					.asset_path_chirho !== scenesChirho[0].asset_path_chirho)
		)
			throw Error('Finite canonical chapter or delivered picture changed');
		const localPathChirho =
				finiteRowChirho?.entry_chirho.mp4_path_chirho ??
				`${scopeValueChirho.home_chirho}/${filenameChirho}`,
			bytesChirho = await readChirho(
				rootChirho,
				localPathChirho,
				VERSE_VIDEO_LIMIT_CHIRHO,
				hashesChirho
			);
		if (
			bytesChirho.length !== videoChirho.bytes_chirho ||
			digestChirho(bytesChirho) !== videoChirho.sha256_chirho
		)
			throw Error('Video MP4 identity differs');
		const probeChirho = spawnSyncChirho(
			'ffprobe',
			[
				'-v',
				'error',
				'-show_streams',
				'-show_format',
				'-of',
				'json',
				joinChirho(rootChirho, localPathChirho)
			],
			{ encoding: 'utf8', timeout: 30000 }
		);
		if (probeChirho.status !== 0) throw Error('Video probe failed');
		const metadataChirho = JSON.parse(probeChirho.stdout) as {
				streams: { codec_type: string; codec_name: string; width?: number; height?: number }[];
				format: { duration: string };
			},
			picturesChirho = metadataChirho.streams.filter(
				(rowChirho) => rowChirho.codec_type === 'video'
			),
			soundsChirho = metadataChirho.streams.filter((rowChirho) => rowChirho.codec_type === 'audio');
		if (
			picturesChirho.length !== 1 ||
			picturesChirho[0].codec_name !== 'h264' ||
			picturesChirho[0].width !== videoChirho.width_chirho ||
			picturesChirho[0].height !== videoChirho.height_chirho ||
			soundsChirho.length !== 1 ||
			soundsChirho[0].codec_name !== 'aac' ||
			!Number.isFinite(Number(metadataChirho.format.duration)) ||
			Math.abs(Number(metadataChirho.format.duration) - videoChirho.duration_chirho) > 0.15
		)
			throw Error('Video codec/length differs');
		const decodeChirho = spawnSyncChirho(
			'ffmpeg',
			[
				'-v',
				'error',
				'-xerror',
				'-nostdin',
				'-i',
				joinChirho(rootChirho, localPathChirho),
				'-f',
				'null',
				'-'
			],
			{ encoding: 'utf8', timeout: 30000 }
		);
		if (decodeChirho.status !== 0) throw Error('Video full decode failed');
		const selectedChirho =
			humanChirho(audioChirho.readings_chirho ?? [], verseChirho) ??
			(scopeValueChirho.finite_chirho
				? selectedSyntheticVerseChirho(audioChirho.clips_chirho, verseChirho)
				: undefined);
		if (finiteRowChirho) {
			const plannedChirho = finiteRowChirho.job_chirho.audio_chirho as RecordingChirho;
			if (
				!selectedChirho ||
				!equalChirho(selectedChirho, plannedChirho) ||
				!sameEmbeddedReadingChirho(videoChirho, selectedChirho)
			)
				throw Error('Finite selected verse soundtrack changed');
			const sourceAudioChirho = await readChirho(
				rootChirho,
				finiteRowChirho.entry_chirho.audio_path_chirho,
				4_000_000,
				hashesChirho
			);
			const rawPathChirho = finiteRowChirho.proof_chirho.raw_clip_path_chirho;
			if (
				typeof rawPathChirho !== 'string' ||
				sourceAudioChirho.length !== selectedChirho.bytes_chirho ||
				digestChirho(sourceAudioChirho) !== selectedChirho.sha256_chirho ||
				digestChirho(
					await readChirho(rootChirho, rawPathChirho, VERSE_VIDEO_LIMIT_CHIRHO, hashesChirho)
				) !== finiteRowChirho.proof_chirho.raw_clip_sha256_chirho
			)
				throw Error('Finite soundtrack/raw take bytes differ');
			const audioDecodeChirho = spawnSyncChirho(
				'ffmpeg',
				[
					'-v',
					'error',
					'-xerror',
					'-nostdin',
					'-i',
					joinChirho(rootChirho, finiteRowChirho.entry_chirho.audio_path_chirho),
					'-f',
					'null',
					'-'
				],
				{ encoding: 'utf8', timeout: 30000 }
			);
			if (audioDecodeChirho.status !== 0) throw Error('Finite soundtrack full decode failed');
		}
		rowsChirho.push({
			video_chirho: videoChirho,
			bytes_chirho: new Uint8Array(bytesChirho),
			prior_chirho: priorChirho,
			held_chirho: !selectedChirho || !sameEmbeddedReadingChirho(videoChirho, selectedChirho)
		});
	}
	const projectedChirho = [
		...entriesChirho,
		...rowsChirho
			.filter((rowChirho) => !rowChirho.held_chirho && !rowChirho.prior_chirho)
			.map((rowChirho) => ({
				video_chirho: rowChirho.video_chirho,
				key_chirho: `video-chirho/sha256-chirho/${rowChirho.video_chirho.sha256_chirho}.mp4`,
				readback_sha256_chirho: rowChirho.video_chirho.sha256_chirho,
				verified_at_chirho: '2000-01-01T00:00:00.000Z'
			}))
	];
	if (
		projectedChirho.length > 1000 ||
		Buffer.byteLength(
			JSON.stringify({ schema_version_chirho: 1, entries_chirho: projectedChirho }, null, '\t') +
				'\n'
		) >
			4 * 1024 ** 2
	)
		throw Error('Video catalogue needs sharding before archive');
	return {
		rows_chirho: rowsChirho,
		entries_chirho: entriesChirho,
		hashes_chirho: hashesChirho,
		catalogue_sha256_chirho: catalogueBytesChirho ? digestChirho(catalogueBytesChirho) : null,
		source_limits_chirho: limitsChirho
	};
}
async function coldChirho(
	rootChirho: string,
	preflightValueChirho: PreflightChirho,
	catalogueShaChirho: string | null
) {
	for (const [pathChirho, shaChirho] of preflightValueChirho.hashes_chirho)
		if (
			digestChirho(
				await readChirho(
					rootChirho,
					pathChirho,
					preflightValueChirho.source_limits_chirho.get(pathChirho) ??
						(pathChirho.endsWith('.mp4') ? VERSE_VIDEO_LIMIT_CHIRHO : 4 * 1024 ** 2),
					undefined,
					pathChirho.startsWith('build-chirho/preview-chirho/')
				)
			) !== shaChirho
		)
			throw Error('Video source changed after archive');
	const bytesChirho = await optionalCatalogueChirho(rootChirho);
	if ((bytesChirho ? digestChirho(bytesChirho) : null) !== catalogueShaChirho)
		throw Error('Foreign video catalogue edit; reconcile without overwrite');
}
async function readbackChirho(
	responseChirho: Response,
	bytesChirho: Uint8Array,
	shaChirho: string
) {
	if (!responseChirho.ok) throw Error('Video R2 readback refused');
	const readerChirho = responseChirho.body?.getReader();
	if (!readerChirho) throw Error('Video R2 readback missing');
	const partsChirho: Uint8Array[] = [];
	let sizeChirho = 0;
	try {
		for (;;) {
			const partChirho = await readerChirho.read();
			if (partChirho.done) break;
			sizeChirho += partChirho.value.length;
			if (sizeChirho > bytesChirho.length) throw Error('Video R2 readback oversized');
			partsChirho.push(partChirho.value);
		}
	} finally {
		await readerChirho.cancel().catch(() => undefined);
	}
	const receivedChirho = new Uint8Array(sizeChirho);
	let offsetChirho = 0;
	for (const partChirho of partsChirho) {
		receivedChirho.set(partChirho, offsetChirho);
		offsetChirho += partChirho.length;
	}
	if (sizeChirho !== bytesChirho.length || digestChirho(receivedChirho) !== shaChirho)
		throw Error('Video R2 readback differs');
}
/** Existing content-addressed objects reconcile received-but-unpublished work without another PUT. */
export async function installVideosChirho(optionsChirho: VideoInstallOptionsChirho) {
	const rootChirho = resolveChirho(optionsChirho.root_chirho);
	if ((await realpathChirho(rootChirho)) !== rootChirho) throw Error('Redirected video root');
	optionsChirho = { ...optionsChirho, root_chirho: rootChirho };
	let checkedChirho = await preflightChirho(optionsChirho),
		archivedChirho = 0,
		releaseChirho: (() => Promise<void>) | undefined;
	await coldChirho(rootChirho, checkedChirho, checkedChirho.catalogue_sha256_chirho);
	const pendingChirho = () =>
		checkedChirho.rows_chirho.filter(
			(rowChirho) => !rowChirho.held_chirho && !rowChirho.prior_chirho
		);
	try {
		if (optionsChirho.apply_chirho && pendingChirho().length) {
			await directoriesChirho(rootChirho, 'build-chirho/r2-chirho');
			releaseChirho = await acquireLockChirho(
				joinChirho(rootChirho, 'build-chirho/r2-chirho/video-install-chirho.lock')
			);
			checkedChirho = await preflightChirho(optionsChirho);
			const transportChirho = optionsChirho.object_chirho ?? objectRequestChirho;
			let catalogueShaChirho = checkedChirho.catalogue_sha256_chirho;
			for (const rowChirho of pendingChirho()) {
				const videoChirho = rowChirho.video_chirho,
					keyChirho = `video-chirho/sha256-chirho/${videoChirho.sha256_chirho}.mp4`;
				const initialChirho = await transportChirho('GET', keyChirho);
				if (initialChirho.status === 404) {
					await initialChirho.arrayBuffer();
					const putChirho = await transportChirho('PUT', keyChirho, rowChirho.bytes_chirho);
					await putChirho.arrayBuffer();
					if (!putChirho.ok) throw Error('Video R2 upload refused');
					await readbackChirho(
						await transportChirho('GET', keyChirho),
						rowChirho.bytes_chirho,
						videoChirho.sha256_chirho
					);
				} else
					await readbackChirho(initialChirho, rowChirho.bytes_chirho, videoChirho.sha256_chirho);
				await coldChirho(rootChirho, checkedChirho, catalogueShaChirho);
				const entryChirho: VideoEntryChirho = {
					video_chirho: videoChirho,
					key_chirho: keyChirho,
					readback_sha256_chirho: videoChirho.sha256_chirho,
					verified_at_chirho: new Date().toISOString()
				};
				const entriesChirho = [...checkedChirho.entries_chirho, entryChirho],
					textChirho =
						JSON.stringify(
							{ schema_version_chirho: 1, entries_chirho: entriesChirho },
							null,
							'\t'
						) + '\n';
				if (entriesChirho.length > 1000 || Buffer.byteLength(textChirho) > 4 * 1024 ** 2)
					throw Error('Video catalogue needs sharding');
				await directoriesChirho(rootChirho, 'data-chirho/video-chirho');
				await writeChirho(joinChirho(rootChirho, VIDEO_CATALOGUE_CHIRHO), textChirho);
				checkedChirho.entries_chirho = entriesChirho;
				catalogueShaChirho = digestChirho(textChirho);
				archivedChirho++;
			}
		}
		return {
			prepared_chirho: checkedChirho.rows_chirho.length,
			not_provided_chirho:
				optionsChirho.scope_chirho === 'genesis_three_chirho'
					? Array.from({ length: 24 }, (_, indexChirho) => `Gen.3.${indexChirho + 1}`).filter(
							(idChirho) =>
								!checkedChirho.rows_chirho.some(
									(rowChirho) => rowChirho.video_chirho.lesson_id_chirho === idChirho
								)
						)
					: [],
			installed_chirho: checkedChirho.entries_chirho.length,
			held_chirho: checkedChirho.rows_chirho
				.filter((rowChirho) => rowChirho.held_chirho)
				.map((rowChirho) => rowChirho.video_chirho.lesson_id_chirho),
			archived_chirho: archivedChirho,
			replayed_chirho: checkedChirho.rows_chirho.filter(
				(rowChirho) => rowChirho.prior_chirho && !rowChirho.held_chirho
			).length,
			apply_chirho: optionsChirho.apply_chirho ?? false
		};
	} finally {
		await releaseChirho?.();
	}
}
/** Parse authority before any filesystem or archive work; legacy defaults remain unchanged. */
export function videoInstallArgumentsChirho(
	argumentsChirho: string[]
): Omit<VideoInstallOptionsChirho, 'root_chirho' | 'object_chirho'> {
	let applyChirho = false,
		genesisChirho = false,
		batchPathChirho: string | undefined,
		batchShaChirho: string | undefined;
	for (let indexChirho = 0; indexChirho < argumentsChirho.length; indexChirho++) {
		const valueChirho = argumentsChirho[indexChirho];
		if (valueChirho === '--apply-chirho' && !applyChirho) applyChirho = true;
		else if (valueChirho === '--genesis3-chirho' && !genesisChirho) genesisChirho = true;
		else if (valueChirho === '--batch-chirho' && batchPathChirho === undefined) {
			batchPathChirho = argumentsChirho[++indexChirho];
			if (!batchPathChirho) throw Error('Missing finite batch path');
			relativeChirho(batchPathChirho);
		} else if (valueChirho === '--batch-sha256-chirho' && batchShaChirho === undefined) {
			batchShaChirho = argumentsChirho[++indexChirho];
			if (!batchShaChirho || !/^[a-f0-9]{64}$/.test(batchShaChirho))
				throw Error('Missing exact finite batch hash');
		} else
			throw Error('Expected legacy mode or one explicit batch path/hash pair, with optional apply');
	}
	if (Boolean(batchPathChirho) !== Boolean(batchShaChirho) || (genesisChirho && batchPathChirho))
		throw Error('Finite batch and legacy scopes cannot be mixed');
	return {
		scope_chirho: batchPathChirho
			? 'finite_batch_chirho'
			: genesisChirho
				? 'genesis_three_chirho'
				: 'proverbs_openings_chirho',
		apply_chirho: applyChirho,
		...(batchPathChirho && batchShaChirho
			? { batch_chirho: { path_chirho: batchPathChirho, sha256_chirho: batchShaChirho } }
			: {})
	};
}
if (import.meta.main) {
	console.log(
		JSON.stringify(
			await installVideosChirho({
				root_chirho: process.cwd(),
				...videoInstallArgumentsChirho(process.argv.slice(2))
			})
		)
	);
}
