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
import {
	loadOpeningDefinitionChirho,
	correctedOpeningWindowChirho,
	verifyOpeningPhaseChirho
} from './correction_chirho';

import {
	readingContextChirho,
	validatePreparedChapterChirho,
	inspectSourceChirho,
	type PreparedReadingChirho,
	type AudioChapterChirho,
	type AudioIndexChirho
} from './validation_chirho';
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
if (applyChirho && selectedIdsChirho.some((idChirho) => !['Gen', 'Prov'].includes(idChirho)))
	throw Error('Other-book apply requires the bounded source-bound installer');
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
const contextChirho = await readingContextChirho(rootChirho);
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

		const selectedBookIdChirho = selectedIdsChirho.find(
			(idChirho) => bibleBookChirho(idChirho).slug_chirho === bookFolderChirho.name
		)!;
		const validatedChirho = await validatePreparedChapterChirho(
			rootChirho,
			runChirho,
			selectedBookIdChirho,
			chapterFolderChirho.name,
			contextChirho,
			openingPhaseChirho?.definition_chirho ?? null
		);
		if (validatedChirho.rows_chirho.length)
			changesChirho.set(validatedChirho.audio_path_chirho, validatedChirho.rows_chirho);
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
