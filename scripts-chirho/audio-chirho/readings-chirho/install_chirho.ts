// For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life. — John 3:16 (KJV)
// Workflow: verse-media-chirho.md. Verify original/timing/canonical bindings, archive, then append.
import {
	readFile as readFileChirho,
	readdir as readdirChirho,
	mkdir as mkdirChirho
} from 'node:fs/promises';
import { join as joinChirho, resolve as resolveChirho } from 'node:path';
import { sha256Chirho, writeChirho } from '../audition_chirho';
import { uploadAudioChirho, type AudioUploadChirho } from '../r2_recordings_chirho';
import { acquireLockChirho, type TargetChirho } from '../../publish-chirho/r2_upload_watch_chirho';
import { bibleBookChirho } from '../../../src/lib/bible-chirho/books-chirho';
import libraryChirho from '../../../config-chirho/media-library-chirho.json';
import { execFileSync as execFileSyncChirho } from 'node:child_process';
import { spokenVerseChirho } from '../../../src/lib/domain-chirho/pronunciation-chirho';
import {
	BEERI_ATTRIBUTION_CHIRHO,
	BEERI_LICENSE_URL_CHIRHO,
	validHumanRecordingChirho,
	type ReadingSourceChirho
} from '../../../src/lib/domain-chirho/pronunciation-chirho/reading-source-chirho';
import {
	loadOpeningDefinitionChirho,
	correctedOpeningWindowChirho,
	verifyOpeningPhaseChirho
} from './correction_chirho';

interface PreparedReadingChirho {
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
interface AudioChapterChirho {
	schema_version_chirho: number;
	book_id_chirho: string;
	chapter_chirho: number;
	content_path_chirho: string;
	content_sha256_chirho: string;
	clips_chirho: Record<string, unknown>[];
	readings_chirho?: Record<string, unknown>[];
}
interface AudioIndexChirho {
	schema_version_chirho: number;
	books_chirho: Record<
		string,
		{ chapters_chirho: { number_chirho: number; path_chirho: string; sha256_chirho: string }[] }
	>;
}
const rootChirho = resolveChirho('.');
const argumentsChirho = process.argv.slice(2);
const runArgumentChirho = argumentsChirho.indexOf('--run-chirho');
const applyChirho = argumentsChirho.includes('--apply-chirho');
const confirmArgumentChirho = argumentsChirho.indexOf('--confirm-chirho');
const booksArgumentChirho = argumentsChirho.indexOf('--books-chirho');
const phaseArgumentChirho = argumentsChirho.indexOf('--phase-chirho');
const phaseChirho = phaseArgumentChirho < 0 ? null : argumentsChirho[phaseArgumentChirho + 1];
const selectedIdsChirho = (
	booksArgumentChirho < 0 ? 'Gen,Prov' : (argumentsChirho[booksArgumentChirho + 1] ?? '')
).split(',');
const selectedFoldersChirho = new Set(
	selectedIdsChirho.map((idChirho) => {
		const bookChirho = bibleBookChirho(idChirho);
		if (bookChirho.language_chirho !== 'he') throw Error('Expected Hebrew source book');
		return bookChirho.slug_chirho;
	})
);
if (
	runArgumentChirho < 0 ||
	!argumentsChirho[runArgumentChirho + 1] ||
	argumentsChirho.some(
		(valueChirho, indexChirho) =>
			![
				'--run-chirho',
				'--apply-chirho',
				'--confirm-chirho',
				'--books-chirho',
				'--phase-chirho'
			].includes(valueChirho) &&
			!['--run-chirho', '--confirm-chirho', '--books-chirho', '--phase-chirho'].includes(
				argumentsChirho[indexChirho - 1]
			)
	)
)
	throw Error('Expected only run, optional apply and exact confirmation');
const runChirho = resolveChirho(argumentsChirho[runArgumentChirho + 1]);
if (
	runChirho !==
	joinChirho(rootChirho, 'workspace-chirho/audio-chirho/beeri-verses-2026-11-07-chirho')
)
	throw Error('Unowned human reading run');
if (phaseArgumentChirho >= 0 && (!phaseChirho || selectedIdsChirho.join(',') !== 'Prov'))
	throw Error('Corrected opening phase requires only Proverbs');
const openingPhaseChirho = phaseChirho
	? await loadOpeningDefinitionChirho(rootChirho, phaseChirho)
	: null;
const accountChirho = process.env.CLOUDFLARE_GLOBAL_API_MAIN_ACCOUNT_ID_CHIRHO ?? '';
let targetChirho: TargetChirho | null = null;
if (applyChirho) {
	if (
		!/^[a-f0-9]{32}$/.test(accountChirho) ||
		argumentsChirho[confirmArgumentChirho + 1] !== `hinneh.us@${accountChirho.slice(-4)}` ||
		confirmArgumentChirho < 0 ||
		!process.env.CLOUDFLARE_GLOBAL_API_EMAIL_CHIRHO ||
		!process.env.CLOUDFLARE_GLOBAL_API_KEY_CHIRHO
	)
		throw Error('Exact Hinneh target and credentials are required');
	targetChirho = {
		bucket_chirho: libraryChirho.bucket_chirho,
		account_chirho: accountChirho,
		email_chirho: process.env.CLOUDFLARE_GLOBAL_API_EMAIL_CHIRHO,
		api_key_chirho: process.env.CLOUDFLARE_GLOBAL_API_KEY_CHIRHO
	};
}
const changesChirho = new Map<
	string,
	{
		reading_chirho: PreparedReadingChirho;
		clip_chirho: Record<string, unknown>;
		bytes_chirho: Uint8Array;
	}[]
>();
const sourceManifestBytesChirho = await readFileChirho(
	joinChirho(
		rootChirho,
		'build-chirho/verse-media-2026-11-07-chirho/gbt-audio-manifest-chirho.jsonl'
	)
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
const sourceCacheChirho = new Map<string, { sha256_chirho: string; duration_chirho: number }>();
async function inspectSourceChirho(pathChirho: string) {
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
const booksDirectoryChirho = joinChirho(runChirho, 'books-chirho');
for (const bookFolderChirho of await readdirChirho(booksDirectoryChirho, { withFileTypes: true })) {
	if (!bookFolderChirho.isDirectory() || bookFolderChirho.isSymbolicLink())
		throw Error('Unexpected source book entry');
	if (!selectedFoldersChirho.has(bookFolderChirho.name)) continue;
	const homeChirho = joinChirho(booksDirectoryChirho, bookFolderChirho.name);
	for (const chapterFolderChirho of await readdirChirho(joinChirho(homeChirho, 'chapters-chirho'), {
		withFileTypes: true
	})) {
		if (!chapterFolderChirho.isDirectory() || chapterFolderChirho.isSymbolicLink())
			throw Error('Unexpected source chapter entry');
		const manifestPathChirho = joinChirho(
			homeChirho,
			'chapters-chirho',
			chapterFolderChirho.name,
			'manifest-chirho.json'
		);
		const manifestBytesChirho = await readFileChirho(manifestPathChirho).catch(
			(errorChirho: NodeJS.ErrnoException) => {
				if (errorChirho.code === 'ENOENT') return null;
				throw errorChirho;
			}
		);
		if (!manifestBytesChirho) continue; // A held or still-preparing chapter has no completed manifest.
		const preparedChirho = JSON.parse(manifestBytesChirho.toString('utf8')) as {
			recordings_chirho: PreparedReadingChirho[];
		};
		for (const readingChirho of preparedChirho.recordings_chirho) {
			const [bookIdChirho, chapterTextChirho] = readingChirho.lesson_id_chirho.split('.');
			const bookChirho = bibleBookChirho(bookIdChirho);
			if (
				bookChirho.slug_chirho !== bookFolderChirho.name ||
				Number(chapterTextChirho) !== Number(chapterFolderChirho.name.split('-')[0])
			)
				throw Error('Prepared folder identity differs');
			const contentPathChirho = `/content-chirho/${bookChirho.slug_chirho}/chapter-${chapterTextChirho.padStart(2, '0')}-chirho.json`;
			const contentBytesChirho = await readFileChirho(
				joinChirho(rootChirho, 'static', contentPathChirho)
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
				sha256Chirho(lessonChirho.canonical_text_chirho) !==
					readingChirho.canonical_sha256_chirho ||
				spokenVerseChirho(lessonChirho) !== readingChirho.text_chirho
			)
				throw Error('Prepared spoken/canonical verse changed');
			const expectedPathChirho = joinChirho(
				homeChirho,
				'chapters-chirho',
				chapterFolderChirho.name,
				`${readingChirho.sha256_chirho}-chirho.mp3`
			);
			if (
				!/^[a-f0-9]{64}$/.test(readingChirho.sha256_chirho) ||
				resolveChirho(rootChirho, readingChirho.path_chirho) !== expectedPathChirho
			)
				throw Error('Prepared MP3 path differs');
			const bytesChirho = new Uint8Array(await readFileChirho(expectedPathChirho));
			if (
				sha256Chirho(bytesChirho) !== readingChirho.sha256_chirho ||
				bytesChirho.length !== readingChirho.bytes_chirho ||
				bytesChirho.length > 4_000_000
			)
				throw Error('Prepared MP3 bytes changed');
			const chapterSourcePathChirho = joinChirho(
				homeChirho,
				'source-chirho',
				`chapter-${chapterTextChirho.padStart(3, '0')}-chirho.mp3`
			);
			let sourceProbeChirho = sourceCacheChirho.get(chapterSourcePathChirho);
			if (!sourceProbeChirho) {
				sourceProbeChirho = await inspectSourceChirho(chapterSourcePathChirho);
				sourceCacheChirho.set(chapterSourcePathChirho, sourceProbeChirho);
			}
			const timingBytesChirho = await readFileChirho(
				joinChirho(homeChirho, 'source-chirho/timings-chirho.bin')
			);
			if (
				sourceProbeChirho.sha256_chirho !== readingChirho.source_chirho.chapter_sha256_chirho ||
				sourceProbeChirho.duration_chirho !== readingChirho.source_chirho.chapter_duration_chirho ||
				sourceManifestChirho.get(readingChirho.source_chirho.gbt_id_chirho) !==
					readingChirho.source_chirho.package_sha256_chirho ||
				sha256Chirho(timingBytesChirho) !== readingChirho.source_chirho.timings_sha256_chirho ||
				readingChirho.source_chirho.manifest_sha256_chirho !==
					'e175174a3dea3872dc63dd7a9813a47dc802e9e1538d17adcb8bbcba5a861f77'
			)
				throw Error('Human source evidence changed');
			if (timingBytesChirho.length % 11) throw Error('Source timing record is torn');
			const correctedWindowChirho = correctedOpeningWindowChirho(
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
			const groupChirho = changesChirho.get(audioPathChirho) ?? [];
			groupChirho.push({
				reading_chirho: readingChirho,
				clip_chirho: clipChirho,
				bytes_chirho: bytesChirho
			});
			changesChirho.set(audioPathChirho, groupChirho);
		}
	}
}
const countChirho = [...changesChirho.values()].reduce(
	(sumChirho, rowsChirho) => sumChirho + rowsChirho.length,
	0
);
const plannedChirho = [...changesChirho].map(([pathChirho, rowsChirho]) => ({
	path_chirho: pathChirho,
	clips_chirho: rowsChirho.map((rowChirho) => rowChirho.clip_chirho)
}));
if (openingPhaseChirho)
	verifyOpeningPhaseChirho(
		openingPhaseChirho.definition_chirho,
		openingPhaseChirho.prior_plan_chirho,
		plannedChirho
	);
if (!applyChirho) {
	console.log(
		JSON.stringify({
			prepared_chirho: countChirho,
			chapters_chirho: changesChirho.size,
			writes_chirho: 0,
			provider_posts_chirho: 0,
			...(phaseChirho ? { phase_chirho: phaseChirho, new_openings_chirho: 12 } : {})
		})
	);
} else {
	const frozenPlanChirho = JSON.stringify(plannedChirho, null, 2) + '\n';
	const planPathChirho = joinChirho(
		runChirho,
		openingPhaseChirho
			? 'install-prov-openings-v1-plan-chirho.json'
			: `install-${selectedIdsChirho.join('-').toLowerCase()}-plan-chirho.json`
	);
	const previousPlanChirho = await readFileChirho(planPathChirho, 'utf8').catch(
		(errorChirho: NodeJS.ErrnoException) => {
			if (errorChirho.code === 'ENOENT') return null;
			throw errorChirho;
		}
	);
	if (previousPlanChirho !== null && previousPlanChirho !== frozenPlanChirho)
		throw Error('Prepared install plan changed; reconcile the prior phase before starting another');
	if (previousPlanChirho === null) await writeChirho(planPathChirho, frozenPlanChirho);
	await mkdirChirho(joinChirho(rootChirho, 'build-chirho/r2-chirho'), { recursive: true });
	const releaseChirho = await acquireLockChirho(
		joinChirho(rootChirho, 'build-chirho/r2-chirho/audio-catalogue-chirho.lock')
	);
	try {
		if (openingPhaseChirho && phaseChirho) {
			const coldPhaseChirho = await loadOpeningDefinitionChirho(rootChirho, phaseChirho);
			verifyOpeningPhaseChirho(
				coldPhaseChirho.definition_chirho,
				coldPhaseChirho.prior_plan_chirho,
				plannedChirho
			);
			const sourceHomeChirho = joinChirho(runChirho, 'books-chirho/proverbs-chirho/source-chirho');
			const coldTimingsChirho = await readFileChirho(
				joinChirho(sourceHomeChirho, 'timings-chirho.bin')
			);
			for (const rowChirho of [...changesChirho.values()].flat()) {
				if (!rowChirho.reading_chirho.source_correction_sha256_chirho) continue;
				const chapterChirho = rowChirho.reading_chirho.lesson_id_chirho
					.split('.')[1]
					.padStart(3, '0');
				correctedOpeningWindowChirho(
					coldPhaseChirho.definition_chirho,
					rowChirho.reading_chirho,
					coldTimingsChirho,
					await inspectSourceChirho(
						joinChirho(sourceHomeChirho, `chapter-${chapterChirho}-chirho.mp3`)
					)
				);
				if (
					sha256Chirho(
						await readFileChirho(joinChirho(rootChirho, rowChirho.reading_chirho.path_chirho))
					) !== rowChirho.reading_chirho.sha256_chirho
				)
					throw Error('Prepared corrected MP3 changed while waiting for the catalogue lock');
			}
		}
		const indexPathChirho = joinChirho(rootChirho, 'static/audio-chirho/manifest-chirho.json');
		const indexChirho = JSON.parse(
			await readFileChirho(indexPathChirho, 'utf8')
		) as AudioIndexChirho;
		const outputsChirho = [];
		const uploadsChirho: AudioUploadChirho[] = [];
		for (const [pathChirho, rowsChirho] of changesChirho) {
			const coldBytesChirho = await readFileChirho(
				joinChirho(rootChirho, 'static', rowsChirho[0].reading_chirho.content_path_chirho)
			);
			if (sha256Chirho(coldBytesChirho) !== rowsChirho[0].reading_chirho.content_sha256_chirho)
				throw Error('Canonical source changed while waiting for the catalogue lock');
			const bytesChirho = await readFileChirho(joinChirho(rootChirho, 'static', pathChirho));
			const chapterChirho = JSON.parse(bytesChirho.toString('utf8')) as AudioChapterChirho;
			const entryChirho = indexChirho.books_chirho[
				chapterChirho.book_id_chirho
			]?.chapters_chirho.find((rowChirho) => rowChirho.path_chirho === pathChirho);
			if (
				!entryChirho ||
				sha256Chirho(bytesChirho) !== entryChirho.sha256_chirho ||
				chapterChirho.content_sha256_chirho !== rowsChirho[0].reading_chirho.content_sha256_chirho
			)
				throw Error('Existing audio chapter binding differs');
			for (const rowChirho of rowsChirho) {
				const readingsChirho = (chapterChirho.readings_chirho ??= []);
				const existingChirho = readingsChirho.find(
					(clipChirho) => clipChirho.id_chirho === rowChirho.clip_chirho.id_chirho
				);
				if (
					existingChirho &&
					JSON.stringify(existingChirho) !== JSON.stringify(rowChirho.clip_chirho)
				)
					throw Error('An existing human recording changed');
				const legacyChirho = chapterChirho.clips_chirho.find(
					(clipChirho) => clipChirho.id_chirho === rowChirho.clip_chirho.id_chirho
				);
				if (legacyChirho && JSON.stringify(legacyChirho) !== JSON.stringify(rowChirho.clip_chirho))
					throw Error('Legacy human migration differs from its frozen source plan');
				if (legacyChirho)
					chapterChirho.clips_chirho = chapterChirho.clips_chirho.filter(
						(clipChirho) => clipChirho !== legacyChirho
					);
				if (!existingChirho) readingsChirho.push(rowChirho.clip_chirho);
				await writeChirho(
					joinChirho(rootChirho, 'static', String(rowChirho.clip_chirho.asset_path_chirho)),
					rowChirho.bytes_chirho
				);
				uploadsChirho.push({
					asset_path_chirho: String(rowChirho.clip_chirho.asset_path_chirho),
					key_chirho: `audio-chirho/sha256-chirho/${rowChirho.reading_chirho.sha256_chirho}.mp3`,
					sha256_chirho: rowChirho.reading_chirho.sha256_chirho,
					bytes_chirho: rowChirho.bytes_chirho.length
				});
			}
			const textChirho = JSON.stringify(chapterChirho, null, 2) + '\n';
			if (
				Buffer.byteLength(textChirho) > 2_000_000 ||
				chapterChirho.clips_chirho.length + (chapterChirho.readings_chirho?.length ?? 0) > 2000
			)
				throw Error('Audio chapter delivery bound exceeded');
			outputsChirho.push({
				path_chirho: pathChirho,
				text_chirho: textChirho,
				entry_chirho: entryChirho
			});
		}
		const releaseUploadChirho = await acquireLockChirho(
			joinChirho(rootChirho, 'build-chirho/r2-chirho/audio-upload-chirho.lock')
		);
		try {
			let nextRequestChirho = 0;
			const pacedFetchChirho: typeof fetch = async (inputChirho, initChirho) => {
				const startChirho = Math.max(Date.now(), nextRequestChirho);
				nextRequestChirho = startChirho + 500;
				if (startChirho > Date.now())
					await new Promise((resolveChirho) => setTimeout(resolveChirho, startChirho - Date.now()));
				return fetch(inputChirho, initChirho);
			};
			await uploadAudioChirho(rootChirho, uploadsChirho, targetChirho, pacedFetchChirho);
		} finally {
			await releaseUploadChirho();
		}
		for (const outputChirho of outputsChirho) {
			await writeChirho(
				joinChirho(rootChirho, 'static', outputChirho.path_chirho),
				outputChirho.text_chirho
			);
			outputChirho.entry_chirho.sha256_chirho = sha256Chirho(outputChirho.text_chirho);
		}
		await writeChirho(indexPathChirho, JSON.stringify(indexChirho, null, 2) + '\n');
		console.log(
			JSON.stringify({
				installed_chirho: countChirho,
				chapters_chirho: outputsChirho.length,
				verified_archive_chirho: uploadsChirho.length
			})
		);
	} finally {
		await releaseChirho();
	}
}
