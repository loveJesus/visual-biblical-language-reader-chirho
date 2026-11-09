// For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life. — John 3:16 (KJV)
// Workflow: verse-media-chirho.md. Shared canonical, package, timing and prepared-MP3 validator.
import { readFile as readFileChirho } from 'node:fs/promises';
import {
	join as joinChirho,
	resolve as resolveChirho,
	relative as relativeChirho
} from 'node:path';
import { execFileSync as execFileSyncChirho } from 'node:child_process';
import { sha256Chirho } from '../audition_chirho';
import { bibleBookChirho } from '../../../src/lib/bible-chirho/books-chirho';
import { spokenVerseChirho } from '../../../src/lib/domain-chirho/pronunciation-chirho';
import {
	BEERI_ATTRIBUTION_CHIRHO,
	BEERI_LICENSE_URL_CHIRHO,
	validHumanRecordingChirho,
	type ReadingSourceChirho
} from '../../../src/lib/domain-chirho/pronunciation-chirho/reading-source-chirho';
import { correctedOpeningWindowChirho, type OpeningDefinitionChirho } from './correction_chirho';
import {
	PROVERBS_PHASE_CHIRHO,
	PROVERBS_HOME_CHIRHO,
	verifyProverbsWindowChirho,
	type ProverbsDefinitionChirho
} from './proverbs_phase_chirho';
import { boundedReadChirho } from '../local-greek-chirho/phase_chirho';
export interface PreparedReadingChirho {
	lesson_id_chirho: string;
	text_chirho: string;
	canonical_sha256_chirho: string;
	content_path_chirho: string;
	content_sha256_chirho: string;
	path_chirho: string;
	sha256_chirho: string;
	bytes_chirho: number;
	duration_chirho: number;
	source_correction_sha256_chirho?: string;
	source_chirho: Omit<ReadingSourceChirho, 'kind_chirho' | 'reader_id_chirho'> & {
		files_chirho: Record<string, string>;
		manifest_sha256_chirho: string;
	};
}
export interface AudioChapterChirho {
	schema_version_chirho: number;
	book_id_chirho: string;
	chapter_chirho: number;
	content_path_chirho: string;
	content_sha256_chirho: string;
	clips_chirho: Record<string, unknown>[];
	readings_chirho?: Record<string, unknown>[];
}
export interface AudioIndexChirho {
	schema_version_chirho: number;
	books_chirho: Record<
		string,
		{ chapters_chirho: { number_chirho: number; path_chirho: string; sha256_chirho: string }[] }
	>;
}

export interface ValidatedRowChirho {
	reading_chirho: PreparedReadingChirho;
	clip_chirho: Record<string, unknown>;
	bytes_chirho: Uint8Array;
}
export interface ReadingContextChirho {
	source_manifest_chirho: Map<string, string>;
	source_cache_chirho: Map<string, { sha256_chirho: string; duration_chirho: number }>;
}
async function ownedReadChirho(rootChirho: string, pathChirho: string, limitChirho: number) {
	return boundedReadChirho(rootChirho, relativeChirho(rootChirho, pathChirho), limitChirho);
}
export async function readingContextChirho(rootChirho: string): Promise<ReadingContextChirho> {
	const sourceManifestBytesChirho = await boundedReadChirho(
		rootChirho,
		'build-chirho/verse-media-2026-11-07-chirho/gbt-audio-manifest-chirho.jsonl',
		1024 ** 2
	);
	if (
		sha256Chirho(sourceManifestBytesChirho) !==
		'e175174a3dea3872dc63dd7a9813a47dc802e9e1538d17adcb8bbcba5a861f77'
	)
		throw Error('Pinned GBT manifest differs');
	const sourceManifestChirho = new Map(
		(
			sourceManifestBytesChirho
				.toString('utf8')
				.trim()
				.split('\n')
				.map((lineChirho) => JSON.parse(lineChirho)) as { id: string; sha256: string }[]
		).map((rowChirho) => [rowChirho.id, rowChirho.sha256])
	);

	return { source_manifest_chirho: sourceManifestChirho, source_cache_chirho: new Map() };
}
export async function inspectSourceChirho(pathChirho: string) {
	return {
		sha256_chirho: sha256Chirho(await readFileChirho(pathChirho)),
		duration_chirho: Number(
			execFileSyncChirho(
				'ffprobe',
				['-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', pathChirho],
				{ encoding: 'utf8' }
			).trim()
		)
	};
}

export async function validatePreparedChapterChirho(
	rootChirho: string,
	runChirho: string,
	bookFolderChirho: string,
	chapterFolderChirho: string,
	contextChirho: ReadingContextChirho,
	definitionChirho: OpeningDefinitionChirho | ProverbsDefinitionChirho | null = null,
	expectedManifestShaChirho?: string
): Promise<{ audio_path_chirho: string; rows_chirho: ValidatedRowChirho[] }> {
	const bookChirhoIdentityChirho = bibleBookChirho(bookFolderChirho);
	bookFolderChirho = bookChirhoIdentityChirho.slug_chirho;
	if (
		bookChirhoIdentityChirho.language_chirho !== 'he' ||
		!/^\d{3}-chirho$/.test(chapterFolderChirho)
	)
		throw Error('Prepared chapter identity differs');
	const remainderChirho = definitionChirho?.phase_chirho === PROVERBS_PHASE_CHIRHO;
	const sourceHomeChirho = joinChirho(
		runChirho,
		'books-chirho',
		bookChirhoIdentityChirho.slug_chirho
	);
	const homeChirho = remainderChirho
		? joinChirho(
				rootChirho,
				PROVERBS_HOME_CHIRHO,
				'books-chirho',
				bookChirhoIdentityChirho.slug_chirho
			)
		: sourceHomeChirho;
	const manifestPathChirho = joinChirho(
		homeChirho,
		'chapters-chirho',
		chapterFolderChirho,
		'manifest-chirho.json'
	);
	const manifestBytesChirho = await ownedReadChirho(rootChirho, manifestPathChirho, 4 * 1024 ** 2);
	if (expectedManifestShaChirho && sha256Chirho(manifestBytesChirho) !== expectedManifestShaChirho)
		throw Error('Frozen prepared manifest changed');
	const preparedChirho = JSON.parse(manifestBytesChirho.toString()) as {
		recordings_chirho: PreparedReadingChirho[];
	};
	if (
		!Array.isArray(preparedChirho.recordings_chirho) ||
		preparedChirho.recordings_chirho.length > 2000
	)
		throw Error('Prepared chapter bound exceeded');
	const rowsChirho: ValidatedRowChirho[] = [];
	let audioPathChirhoResultChirho: string | undefined;
	const openingPhaseChirho = definitionChirho ? { definition_chirho: definitionChirho } : null;
	const seenChirho = new Set<string>();
	for (const readingChirho of preparedChirho.recordings_chirho) {
		if (seenChirho.has(readingChirho.lesson_id_chirho)) throw Error('Duplicate prepared verse');
		seenChirho.add(readingChirho.lesson_id_chirho);
		const [bookIdChirho, chapterTextChirho] = readingChirho.lesson_id_chirho.split('.');
		const bookChirho = bibleBookChirho(bookIdChirho);
		if (
			bookChirho.slug_chirho !== bookFolderChirho ||
			Number(chapterTextChirho) !== Number(chapterFolderChirho.split('-')[0])
		)
			throw Error('Prepared folder identity differs');
		const contentPathChirho = `/content-chirho/${bookChirho.slug_chirho}/chapter-${chapterTextChirho.padStart(2, '0')}-chirho.json`;
		const contentBytesChirho = await ownedReadChirho(
			rootChirho,
			joinChirho(rootChirho, 'static', contentPathChirho),
			4 * 1024 ** 2
		);
		if (
			readingChirho.content_path_chirho !== contentPathChirho ||
			sha256Chirho(contentBytesChirho) !== readingChirho.content_sha256_chirho
		)
			throw Error('Prepared canonical chapter changed');
		const sourceChapterChirho = JSON.parse(contentBytesChirho.toString('utf8'));
		const lessonChirho = sourceChapterChirho.verses_chirho.find(
			(rowChirho: { id_chirho: string }) => rowChirho.id_chirho === readingChirho.lesson_id_chirho
		);
		if (
			!lessonChirho ||
			sha256Chirho(lessonChirho.canonical_text_chirho) !== readingChirho.canonical_sha256_chirho ||
			spokenVerseChirho(lessonChirho) !== readingChirho.text_chirho
		)
			throw Error('Prepared spoken/canonical verse changed');
		const expectedPathChirho = joinChirho(
			homeChirho,
			'chapters-chirho',
			chapterFolderChirho,
			`${readingChirho.sha256_chirho}-chirho.mp3`
		);
		if (
			!/^[a-f0-9]{64}$/.test(readingChirho.sha256_chirho) ||
			resolveChirho(rootChirho, readingChirho.path_chirho) !== expectedPathChirho
		)
			throw Error('Prepared MP3 path differs');
		const bytesChirho = new Uint8Array(
			await ownedReadChirho(rootChirho, expectedPathChirho, 4_000_000)
		);
		if (
			sha256Chirho(bytesChirho) !== readingChirho.sha256_chirho ||
			bytesChirho.length !== readingChirho.bytes_chirho ||
			bytesChirho.length > 4_000_000
		)
			throw Error('Prepared MP3 bytes changed');
		const chapterSourcePathChirho = joinChirho(
			sourceHomeChirho,
			'source-chirho',
			`chapter-${chapterTextChirho.padStart(3, '0')}-chirho.mp3`
		);
		let sourceProbeChirho = contextChirho.source_cache_chirho.get(chapterSourcePathChirho);
		if (!sourceProbeChirho) {
			await ownedReadChirho(rootChirho, chapterSourcePathChirho, 64 * 1024 ** 2);
			sourceProbeChirho = await inspectSourceChirho(chapterSourcePathChirho);
			contextChirho.source_cache_chirho.set(chapterSourcePathChirho, sourceProbeChirho);
		}
		const timingBytesChirho = await ownedReadChirho(
			rootChirho,
			joinChirho(sourceHomeChirho, 'source-chirho/timings-chirho.bin'),
			4 * 1024 ** 2
		);
		if (
			sourceProbeChirho.sha256_chirho !== readingChirho.source_chirho.chapter_sha256_chirho ||
			sourceProbeChirho.duration_chirho !== readingChirho.source_chirho.chapter_duration_chirho ||
			contextChirho.source_manifest_chirho.get(readingChirho.source_chirho.gbt_id_chirho) !==
				readingChirho.source_chirho.package_sha256_chirho ||
			sha256Chirho(timingBytesChirho) !== readingChirho.source_chirho.timings_sha256_chirho ||
			readingChirho.source_chirho.manifest_sha256_chirho !==
				'e175174a3dea3872dc63dd7a9813a47dc802e9e1538d17adcb8bbcba5a861f77'
		)
			throw Error('Human source evidence changed');
		if (timingBytesChirho.length % 11) throw Error('Source timing record is torn');
		const correctedWindowChirho = remainderChirho
			? verifyProverbsWindowChirho(
					definitionChirho as ProverbsDefinitionChirho,
					readingChirho,
					timingBytesChirho,
					sourceProbeChirho,
					spokenVerseChirho(sourceChapterChirho.verses_chirho[0])
				)
			: correctedOpeningWindowChirho(
					openingPhaseChirho?.definition_chirho ?? null,
					readingChirho,
					timingBytesChirho,
					sourceProbeChirho
				);
		if (!correctedWindowChirho) {
			const verseNumberChirho = Number(readingChirho.lesson_id_chirho.split('.')[2]);
			let timingOffsetChirho = -1;
			for (let offsetChirho = 0; offsetChirho < timingBytesChirho.length; offsetChirho += 11) {
				if (
					timingBytesChirho[offsetChirho + 1] === Number(chapterTextChirho) &&
					timingBytesChirho[offsetChirho + 2] === verseNumberChirho
				) {
					if (timingOffsetChirho !== -1) throw Error('Duplicate timing identity');
					timingOffsetChirho = offsetChirho;
				}
			}
			if (timingOffsetChirho < 0) throw Error('Original verse timing is absent');
			const nextOffsetChirho = timingOffsetChirho + 11;
			const endChirho =
				nextOffsetChirho < timingBytesChirho.length &&
				timingBytesChirho[nextOffsetChirho + 1] === Number(chapterTextChirho)
					? timingBytesChirho.readUInt32BE(nextOffsetChirho + 3) / 100
					: sourceProbeChirho.duration_chirho;
			if (
				readingChirho.source_chirho.start_chirho !==
					timingBytesChirho.readUInt32BE(timingOffsetChirho + 3) / 100 ||
				readingChirho.source_chirho.end_chirho !== endChirho
			)
				throw Error('Prepared cut window differs from the original timing');
		}
		const readingSourceChirho: ReadingSourceChirho = {
			kind_chirho: 'human',
			reader_id_chirho: 'rdb-chirho',
			gbt_id_chirho: readingChirho.source_chirho.gbt_id_chirho,
			package_sha256_chirho: readingChirho.source_chirho.package_sha256_chirho,
			chapter_sha256_chirho: readingChirho.source_chirho.chapter_sha256_chirho,
			timings_sha256_chirho: readingChirho.source_chirho.timings_sha256_chirho,
			start_chirho: readingChirho.source_chirho.start_chirho,
			end_chirho: readingChirho.source_chirho.end_chirho,
			chapter_duration_chirho: readingChirho.source_chirho.chapter_duration_chirho,
			attribution_chirho: BEERI_ATTRIBUTION_CHIRHO,
			license_chirho: 'CC BY-SA 3.0',
			license_url_chirho: BEERI_LICENSE_URL_CHIRHO
		};
		const clipChirho = {
			id_chirho: `beeri-${readingChirho.lesson_id_chirho.toLowerCase().replaceAll('.', '-')}-chirho`,
			lesson_id_chirho: readingChirho.lesson_id_chirho,
			token_id_chirho: null,
			text_chirho: readingChirho.text_chirho,
			canonical_sha256_chirho: readingChirho.canonical_sha256_chirho,
			language_chirho: 'he',
			pronunciation_chirho: 'israeli_hebrew',
			voice_name_chirho: "Rabbi Dan Be'eri",
			asset_path_chirho: `/audio-chirho/sha256-chirho/${readingChirho.sha256_chirho}-chirho.mp3`,
			sha256_chirho: readingChirho.sha256_chirho,
			bytes_chirho: readingChirho.bytes_chirho,
			duration_chirho: readingChirho.duration_chirho,
			review_chirho: 'audition',
			reading_source_chirho: readingSourceChirho,
			provider_chirho: 'Global Bible Tools',
			license_chirho: BEERI_ATTRIBUTION_CHIRHO + ' ' + BEERI_LICENSE_URL_CHIRHO
		};
		if (!validHumanRecordingChirho(clipChirho)) throw Error('Human reading shape refused');
		const audioPathChirho = `/audio-chirho/${bookChirho.slug_chirho}/chapter-${chapterTextChirho.padStart(2, '0')}-chirho.json`;
		audioPathChirhoResultChirho ??= audioPathChirho;
		if (audioPathChirhoResultChirho !== audioPathChirho) throw Error('Mixed prepared chapter');
		rowsChirho.push({
			reading_chirho: readingChirho,
			clip_chirho: clipChirho,
			bytes_chirho: bytesChirho
		});
	}
	return { audio_path_chirho: audioPathChirhoResultChirho ?? '', rows_chirho: rowsChirho };
}
