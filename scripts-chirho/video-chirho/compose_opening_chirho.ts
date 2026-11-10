// For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life. — John 3:16 (KJV)
// Workflow: verse-media-chirho.md. Compose only saved, reviewed motion over its selected full verse.
import { createHash as createHashChirho } from 'node:crypto';
import { execFileSync as execFileSyncChirho } from 'node:child_process';
import {
	closeSync as closeSyncChirho,
	existsSync as existsSyncChirho,
	fsyncSync as fsyncSyncChirho,
	lstatSync as lstatSyncChirho,
	mkdirSync as mkdirSyncChirho,
	openSync as openSyncChirho,
	readFileSync as readFileSyncChirho,
	realpathSync as realpathSyncChirho,
	rmSync as rmSyncChirho,
	writeFileSync as writeFileSyncChirho
} from 'node:fs';
import { dirname as dirnameChirho, resolve as resolveChirho } from 'node:path';
import { isDeepStrictEqual as equalChirho } from 'node:util';
import { bibleBookChirho } from '../../src/lib/bible-chirho/books-chirho';
import {
	sameEmbeddedReadingChirho,
	validVerseVideoChirho,
	type VerseVideoChirho
} from '../../src/lib/domain-chirho/verse-video-chirho';
import {
	automaticVerseRecordingChirho,
	recordingsFromChapterChirho,
	type RecordingChirho,
	type recordingsForLessonChirho
} from '../../src/lib/reader-chirho/audio-chirho/recordings-chirho';
import { readFiniteVideoBatchChirho, type PinChirho } from './finite_batch_chirho';
import { recordingIdentityChirho } from './selected_recording_chirho';

type JsonChirho = Record<string, unknown>;
type LessonChirho = Parameters<typeof recordingsForLessonChirho>[0];
interface JobChirho {
	lesson_id_chirho: string;
	canonical_sha256_chirho: string;
	holds_chirho: unknown[];
	scene_chirho: {
		lesson_id_chirho: string;
		asset_path_chirho: string;
		sha256_chirho: string;
		alt_chirho: string;
	};
	picture_review_chirho: JsonChirho;
	high_quality_chirho: {
		ready_chirho: boolean;
		delivery_sha256_chirho: string;
		source_sha256_chirho: string;
		kind_chirho: string;
	};
	audio_chirho: RecordingChirho & {
		license_chirho?: string;
		license_url_chirho?: string;
		attribution_chirho?: string;
	};
}
interface EntryChirho {
	lesson_id_chirho: string;
	journal_chirho: PinChirho;
	reconciliation_chirho?: PinChirho;
	run_home_chirho: string;
	raw_clip_path_chirho: string;
	raw_frame_review_chirho: PinChirho;
	content_chapter_chirho: PinChirho;
	audio_chapter_chirho: PinChirho;
	media_chapter_chirho: PinChirho;
	audio_path_chirho: string;
	scene_path_chirho: string;
}
interface InputChirho {
	schema_version_chirho: number;
	source_plan_chirho: PinChirho;
	source_inventory_chirho: PinChirho;
	output_home_chirho: string;
	entries_chirho: EntryChirho[];
}
interface StreamChirho {
	codec_type: string;
	codec_name: string;
	width?: number;
	height?: number;
	avg_frame_rate?: string;
	nb_read_frames?: string;
	duration?: string;
	sample_rate?: string;
	channels?: number;
}
interface ProbeChirho {
	streams: StreamChirho[];
	format: { duration: string };
}
interface CropChirho {
	x_chirho: number;
	y_chirho: number;
	width_chirho: number;
	height_chirho: number;
}

const FPS_CHIRHO = 24;
// Exact filters from the already-proved chapter_video_chirho.py / verse_videos_chirho.py method.
const INTERPOLATE_CHIRHO = 'minterpolate=fps=24:mi_mode=mci:mc_mode=aobmc:me_mode=bidir:vsbmc=1';
const RETIME_CHIRHO = 'setpts=N/(24*TB)';
const RECIPE_CHIRHO = 'saved-verse-motion-retime-v2-chirho';
const TRANSFORM_RECIPE_CHIRHO = 'saved-verse-motion-retime-v3-chirho';
const hashChirho = (bytesChirho: Uint8Array | string) =>
	createHashChirho('sha256').update(bytesChirho).digest('hex');
function requireChirho(valueChirho: unknown, messageChirho: string): asserts valueChirho {
	if (!valueChirho) throw Error(messageChirho);
}

/** Same 10 ms log-RMS envelope/cross-correlation used by the prior hosted soundtrack checks. */
function correlationChirho(leftChirho: Buffer, rightChirho: Buffer) {
	const envelopeChirho = (bytesChirho: Buffer) => {
		const valuesChirho: number[] = [];
		for (let offsetChirho = 0; offsetChirho + 320 <= bytesChirho.length; offsetChirho += 320) {
			let sumChirho = 0;
			for (let sampleChirho = 0; sampleChirho < 160; sampleChirho++)
				sumChirho += bytesChirho.readInt16LE(offsetChirho + sampleChirho * 2) ** 2;
			valuesChirho.push(Math.log1p(Math.sqrt(sumChirho / 160)));
		}
		return valuesChirho;
	};
	const aChirho = envelopeChirho(leftChirho),
		bChirho = envelopeChirho(rightChirho);
	let bestChirho = -1,
		lagChirho = 0;
	for (let shiftChirho = -10; shiftChirho <= 10; shiftChirho++) {
		const pairsChirho = aChirho.flatMap((valueChirho, indexChirho) =>
			indexChirho + shiftChirho >= 0 && indexChirho + shiftChirho < bChirho.length
				? [[valueChirho, bChirho[indexChirho + shiftChirho]]]
				: []
		);
		if (
			pairsChirho.length < Math.min(100, Math.min(aChirho.length, bChirho.length) - 2) ||
			pairsChirho.length < 10
		)
			continue;
		const meanAChirho =
			pairsChirho.reduce((sumChirho, pairChirho) => sumChirho + pairChirho[0], 0) /
			pairsChirho.length;
		const meanBChirho =
			pairsChirho.reduce((sumChirho, pairChirho) => sumChirho + pairChirho[1], 0) /
			pairsChirho.length;
		let covarianceChirho = 0,
			varianceAChirho = 0,
			varianceBChirho = 0;
		for (const pairChirho of pairsChirho) {
			const xChirho = pairChirho[0] - meanAChirho,
				yChirho = pairChirho[1] - meanBChirho;
			covarianceChirho += xChirho * yChirho;
			varianceAChirho += xChirho * xChirho;
			varianceBChirho += yChirho * yChirho;
		}
		const divisorChirho = Math.sqrt(varianceAChirho * varianceBChirho),
			valueChirho = covarianceChirho / divisorChirho;
		if (divisorChirho && valueChirho > bestChirho) {
			bestChirho = valueChirho;
			lagChirho = shiftChirho * 10;
		}
	}
	return { soundtrack_correlation_chirho: bestChirho, lag_ms_chirho: lagChirho };
}

/** Workflow: verse-media-chirho.md. No fetch/provider/key path; one fixed local subset, sequential encoding. */
export async function composeOpeningsChirho(optionsChirho: {
	root_chirho: string;
	input_chirho: PinChirho;
}) {
	const rootChirho = realpathSyncChirho(optionsChirho.root_chirho),
		hashesChirho = new Map<string, string>();
	const environmentChirho = {
		PATH: process.env.PATH ?? '',
		HOME: process.env.HOME ?? '',
		TMPDIR: process.env.TMPDIR ?? '/tmp',
		LC_ALL: 'C'
	};
	function pathChirho(valueChirho: string) {
		requireChirho(
			typeof valueChirho === 'string' &&
				valueChirho.length > 0 &&
				!valueChirho.startsWith('/') &&
				!valueChirho
					.split('/')
					.some((partChirho) => !partChirho || partChirho === '.' || partChirho === '..') &&
				!valueChirho.includes('\\'),
			'Expected a contained relative source path'
		);
		const absoluteChirho = resolveChirho(rootChirho, valueChirho);
		requireChirho(absoluteChirho.startsWith(rootChirho + '/'), 'Uncontained source');
		let cursorChirho = rootChirho;
		for (const partChirho of valueChirho.split('/')) {
			cursorChirho = resolveChirho(cursorChirho, partChirho);
			if (existsSyncChirho(cursorChirho))
				requireChirho(!lstatSyncChirho(cursorChirho).isSymbolicLink(), 'Linked source or output');
		}
		return absoluteChirho;
	}
	function readChirho(valueChirho: string, limitChirho: number) {
		const absoluteChirho = pathChirho(valueChirho),
			factsChirho = lstatSyncChirho(absoluteChirho);
		requireChirho(
			factsChirho.isFile() && factsChirho.size > 0 && factsChirho.size <= limitChirho,
			'Missing, empty or oversized source'
		);
		const bytesChirho = readFileSyncChirho(absoluteChirho);
		requireChirho(bytesChirho.length === factsChirho.size, 'Source changed while reading');
		hashesChirho.set(valueChirho, hashChirho(bytesChirho));
		return bytesChirho;
	}
	function pinnedChirho(pinChirho: PinChirho, limitChirho = 256 * 1024): unknown {
		requireChirho(
			pinChirho && /^[a-f0-9]{64}$/.test(pinChirho.sha256_chirho),
			'Exact source pin required'
		);
		const bytesChirho = readChirho(pinChirho.path_chirho, limitChirho);
		requireChirho(hashChirho(bytesChirho) === pinChirho.sha256_chirho, 'Pinned source changed');
		try {
			return JSON.parse(bytesChirho.toString('utf8'));
		} catch {
			throw Error('Invalid pinned JSON source');
		}
	}
	function toolChirho(nameChirho: string, argumentsChirho: string[], limitChirho = 4 * 1024 ** 2) {
		return execFileSyncChirho(nameChirho, argumentsChirho, {
			cwd: rootChirho,
			env: environmentChirho,
			timeout: 10 * 60 * 1000,
			maxBuffer: limitChirho,
			stdio: ['ignore', 'pipe', 'pipe']
		});
	}
	const probeChirho = (valueChirho: string): ProbeChirho =>
		JSON.parse(
			toolChirho('ffprobe', [
				'-v',
				'error',
				'-count_frames',
				'-show_streams',
				'-show_format',
				'-of',
				'json',
				pathChirho(valueChirho)
			]).toString()
		);
	const decodeChirho = (valueChirho: string) =>
		toolChirho('ffmpeg', [
			'-v',
			'error',
			'-xerror',
			'-nostdin',
			'-i',
			pathChirho(valueChirho),
			'-f',
			'null',
			'-'
		]);
	const pcmChirho = (valueChirho: string) =>
		toolChirho(
			'ffmpeg',
			[
				'-v',
				'error',
				'-xerror',
				'-nostdin',
				'-i',
				pathChirho(valueChirho),
				'-vn',
				'-ac',
				'1',
				'-ar',
				'16000',
				'-f',
				's16le',
				'-'
			],
			8 * 1024 ** 2
		);
	function saveChirho(valueChirho: string, valueObjectChirho: unknown) {
		const absoluteChirho = pathChirho(valueChirho);
		writeFileSyncChirho(absoluteChirho, JSON.stringify(valueObjectChirho, null, 2) + '\n', {
			flag: 'wx'
		});
		const fileChirho = openSyncChirho(absoluteChirho, 'r');
		fsyncSyncChirho(fileChirho);
		closeSyncChirho(fileChirho);
	}
	const inputChirho = pinnedChirho(optionsChirho.input_chirho) as InputChirho;
	requireChirho(
		inputChirho.schema_version_chirho === 1 &&
			Array.isArray(inputChirho.entries_chirho) &&
			inputChirho.entries_chirho.length > 0 &&
			inputChirho.entries_chirho.length <= 6 &&
			new Set(inputChirho.entries_chirho.map((rowChirho) => rowChirho.lesson_id_chirho)).size ===
				inputChirho.entries_chirho.length,
		'Composition needs one to six distinct supplied jobs'
	);
	requireChirho(
		/^(workspace-chirho\/video-chirho\/|build-chirho\/)/.test(inputChirho.output_home_chirho),
		'Composition output must stay in a private media/build home'
	);
	const planChirho = pinnedChirho(inputChirho.source_plan_chirho, 4 * 1024 ** 2) as {
		jobs_chirho: JobChirho[];
		inventory_path_chirho: string;
		inventory_sha256_chirho: string;
	};
	requireChirho(
		Array.isArray(planChirho.jobs_chirho) &&
			planChirho.jobs_chirho.length <= 1000 &&
			inputChirho.source_inventory_chirho.path_chirho === planChirho.inventory_path_chirho &&
			inputChirho.source_inventory_chirho.sha256_chirho === planChirho.inventory_sha256_chirho,
		'Plan/inventory binding differs'
	);
	const inventoryChirho = pinnedChirho(
		inputChirho.source_inventory_chirho,
		16 * 1024 ** 2
	) as JsonChirho[];
	requireChirho(
		Array.isArray(inventoryChirho) && inventoryChirho.length <= 32000,
		'Inventory exceeds its bound'
	);
	const recordsChirho: VerseVideoChirho[] = [],
		proofsChirho: { path_chirho: string; sha256_chirho: string }[] = [];
	let replayedChirho = 0;
	for (const entryChirho of inputChirho.entries_chirho) {
		requireChirho(
			/^([1-3]?[A-Za-z]+)\.([1-9][0-9]{0,2})\.1$/.test(entryChirho.lesson_id_chirho),
			'Only supplied chapter openings may be composed'
		);
		const matchesChirho = planChirho.jobs_chirho.filter(
				(rowChirho) => rowChirho.lesson_id_chirho === entryChirho.lesson_id_chirho
			),
			inventoryRowsChirho = inventoryChirho.filter(
				(rowChirho) => rowChirho.lesson_id_chirho === entryChirho.lesson_id_chirho
			);
		requireChirho(
			matchesChirho.length === 1 && inventoryRowsChirho.length === 1,
			'One exact plan and inventory row required'
		);
		const jobChirho = matchesChirho[0];
		requireChirho(
			Array.isArray(jobChirho.holds_chirho) &&
				!jobChirho.holds_chirho.length &&
				jobChirho.picture_review_chirho.accepted_chirho === true &&
				jobChirho.picture_review_chirho.scene_sha256_chirho ===
					jobChirho.scene_chirho.sha256_chirho,
			'Held or unreviewed picture'
		);
		const inventorySceneChirho = inventoryRowsChirho[0].scene_chirho as JsonChirho,
			lineageChirho = inventorySceneChirho?.delivery_lineage_chirho as JsonChirho;
		requireChirho(
			jobChirho.high_quality_chirho?.ready_chirho === true &&
				inventoryRowsChirho[0].picture_prerequisite_met_chirho === true &&
				inventorySceneChirho?.high_quality_chirho === true &&
				['preserved_high_quality_chirho', 'hq_upgrade_chirho'].includes(
					String(inventorySceneChirho.quality_class_chirho)
				) &&
				lineageChirho?.delivery_sha256_chirho === jobChirho.scene_chirho.sha256_chirho &&
				lineageChirho.source_sha256_chirho === jobChirho.high_quality_chirho.source_sha256_chirho &&
				jobChirho.high_quality_chirho.delivery_sha256_chirho ===
					jobChirho.scene_chirho.sha256_chirho,
			'HQ picture must precede composition'
		);
		requireChirho(
			hashChirho(readChirho(entryChirho.scene_path_chirho, 8 * 1024 ** 2)) ===
				jobChirho.scene_chirho.sha256_chirho,
			'Published scene bytes differ'
		);
		const [bookIdChirho, chapterTextChirho] = entryChirho.lesson_id_chirho.split('.'),
			bookChirho = bibleBookChirho(bookIdChirho);
		const contentChirho = pinnedChirho(entryChirho.content_chapter_chirho, 4 * 1024 ** 2) as {
			book_id_chirho: string;
			chapter_chirho: number;
			verses_chirho: LessonChirho[];
		};
		const audioChirho = pinnedChirho(entryChirho.audio_chapter_chirho, 2_000_000) as {
			schema_version_chirho: number;
			book_id_chirho: string;
			chapter_chirho: number;
			content_path_chirho: string;
			content_sha256_chirho: string;
			clips_chirho: RecordingChirho[];
			readings_chirho?: RecordingChirho[];
		};
		const mediaChirho = pinnedChirho(entryChirho.media_chapter_chirho, 2_000_000) as {
			scenes_chirho: (JobChirho['scene_chirho'] & { variant_chirho?: string })[];
		};
		requireChirho(
			contentChirho.book_id_chirho === bookIdChirho &&
				contentChirho.chapter_chirho === Number(chapterTextChirho) &&
				audioChirho.schema_version_chirho === 1 &&
				audioChirho.book_id_chirho === bookIdChirho &&
				audioChirho.chapter_chirho === Number(chapterTextChirho) &&
				audioChirho.content_path_chirho ===
					`/content-chirho/${bookChirho.slug_chirho}/chapter-${chapterTextChirho.padStart(2, '0')}-chirho.json` &&
				audioChirho.content_sha256_chirho === entryChirho.content_chapter_chirho.sha256_chirho &&
				Array.isArray(audioChirho.clips_chirho) &&
				(audioChirho.readings_chirho === undefined || Array.isArray(audioChirho.readings_chirho)) &&
				audioChirho.clips_chirho.length + (audioChirho.readings_chirho?.length ?? 0) <= 2000,
			'Canonical/audio source binding differs'
		);
		const versesChirho = contentChirho.verses_chirho.filter(
				(rowChirho) => rowChirho.id_chirho === entryChirho.lesson_id_chirho
			),
			scenesChirho = mediaChirho.scenes_chirho.filter(
				(rowChirho) =>
					rowChirho.lesson_id_chirho === entryChirho.lesson_id_chirho &&
					(!rowChirho.variant_chirho || rowChirho.variant_chirho === 'standard')
			);
		requireChirho(
			versesChirho.length === 1 &&
				scenesChirho.length === 1 &&
				hashChirho(versesChirho[0].canonical_text_chirho) === jobChirho.canonical_sha256_chirho &&
				equalChirho(
					{
						lesson_id_chirho: scenesChirho[0].lesson_id_chirho,
						asset_path_chirho: scenesChirho[0].asset_path_chirho,
						sha256_chirho: scenesChirho[0].sha256_chirho,
						alt_chirho: scenesChirho[0].alt_chirho
					},
					jobChirho.scene_chirho
				),
			'Current canonical verse or scene changed'
		);
		const selectedChirho = automaticVerseRecordingChirho(
			recordingsFromChapterChirho(versesChirho[0], audioChirho, jobChirho.canonical_sha256_chirho),
			versesChirho[0]
		);
		requireChirho(
			selectedChirho && equalChirho(selectedChirho, jobChirho.audio_chirho),
			'The reader selected another whole-verse recording'
		);
		const audioBytesChirho = readChirho(entryChirho.audio_path_chirho, 4_000_000);
		requireChirho(
			audioBytesChirho.length === selectedChirho.bytes_chirho &&
				hashChirho(audioBytesChirho) === selectedChirho.sha256_chirho,
			'Hosted source MP3 bytes differ'
		);
		const journalBytesChirho = readChirho(entryChirho.journal_chirho.path_chirho, 4 * 1024 ** 2);
		requireChirho(
			hashChirho(journalBytesChirho) === entryChirho.journal_chirho.sha256_chirho &&
				journalBytesChirho.toString().endsWith('\n'),
			'Immutable journal snapshot differs'
		);
		const eventsChirho = journalBytesChirho
			.toString()
			.trim()
			.split('\n')
			.map((lineChirho) => JSON.parse(lineChirho) as JsonChirho)
			.filter((rowChirho) => rowChirho.lesson_id_chirho === entryChirho.lesson_id_chirho);
		const requestedChirho = eventsChirho.filter(
				(rowChirho) => rowChirho.state_chirho === 'requested_chirho'
			),
			receivedChirho = eventsChirho.filter(
				(rowChirho) => rowChirho.state_chirho === 'received_chirho'
			),
			savedChirho = eventsChirho.filter((rowChirho) => rowChirho.state_chirho === 'saved_chirho');
		const refusedChirho = eventsChirho.filter(
			(rowChirho) => rowChirho.state_chirho === 'refused_chirho'
		);
		requireChirho(
			eventsChirho.length === 3 + refusedChirho.length &&
				requestedChirho.length === 1 &&
				receivedChirho.length === 1 &&
				savedChirho.length === 1 &&
				eventsChirho.every(
					(rowChirho) =>
						rowChirho.plan_sha256_chirho === inputChirho.source_plan_chirho.sha256_chirho &&
						rowChirho.task_uuid_chirho === requestedChirho[0].task_uuid_chirho
				) &&
				requestedChirho[0].scene_sha256_chirho === jobChirho.scene_chirho.sha256_chirho &&
				typeof requestedChirho[0].task_uuid_chirho === 'string' &&
				/^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$/.test(
					requestedChirho[0].task_uuid_chirho
				) &&
				typeof requestedChirho[0].request_sha256_chirho === 'string' &&
				/^[a-f0-9]{64}$/.test(requestedChirho[0].request_sha256_chirho) &&
				typeof savedChirho[0].path_chirho === 'string' &&
				resolveChirho(pathChirho(entryChirho.run_home_chirho), savedChirho[0].path_chirho) ===
					pathChirho(entryChirho.raw_clip_path_chirho),
			'Raw request/result/saved identity differs'
		);
		let originalJournalShaChirho = entryChirho.journal_chirho.sha256_chirho;
		if (refusedChirho.length) {
			requireChirho(
				entryChirho.reconciliation_chirho,
				'Earlier refusal requires explicit original-UUID reconciliation'
			);
			const reconciliationChirho = pinnedChirho(entryChirho.reconciliation_chirho) as JsonChirho;
			const originalPinChirho = reconciliationChirho.original_journal_chirho as PinChirho;
			requireChirho(
				originalPinChirho && /^[a-f0-9]{64}$/.test(originalPinChirho.sha256_chirho),
				'Original journal pin required'
			);
			const originalBytesChirho = readChirho(originalPinChirho.path_chirho, 4 * 1024 ** 2);
			requireChirho(
				hashChirho(originalBytesChirho) === originalPinChirho.sha256_chirho &&
					originalBytesChirho.toString().endsWith('\n') &&
					journalBytesChirho.subarray(0, originalBytesChirho.length).equals(originalBytesChirho),
				'Original refusal history must be retained byte-for-byte'
			);
			const originalEventsChirho = originalBytesChirho
				.toString()
				.trim()
				.split('\n')
				.map((lineChirho) => JSON.parse(lineChirho) as JsonChirho)
				.filter((rowChirho) => rowChirho.lesson_id_chirho === entryChirho.lesson_id_chirho);
			const orderedChirho = [
				requestedChirho[0],
				...refusedChirho,
				receivedChirho[0],
				savedChirho[0]
			];
			const datesChirho = orderedChirho.map((rowChirho) => Date.parse(String(rowChirho.at_chirho)));
			const eventHashChirho = (rowChirho: JsonChirho) => hashChirho(JSON.stringify(rowChirho));
			requireChirho(
				equalChirho(eventsChirho, orderedChirho) &&
					equalChirho(originalEventsChirho, [requestedChirho[0], ...refusedChirho]) &&
					refusedChirho.every(
						(rowChirho) =>
							rowChirho.http_status_chirho === 400 &&
							Array.isArray(rowChirho.error_codes_chirho) &&
							rowChirho.error_codes_chirho.length === 1 &&
							rowChirho.error_codes_chirho[0] === 'concurrentRequestLimitExceeded'
					) &&
					datesChirho.every(
						(dateChirho, indexChirho) =>
							Number.isFinite(dateChirho) &&
							(!indexChirho || dateChirho >= datesChirho[indexChirho - 1])
					) &&
					datesChirho[datesChirho.length - 2] > datesChirho[datesChirho.length - 3],
				'Original request/refusal/completion chronology differs'
			);
			requireChirho(
				reconciliationChirho.kind_chirho === 'original_uuid_completion_after_http400_chirho' &&
					reconciliationChirho.lesson_id_chirho === entryChirho.lesson_id_chirho &&
					reconciliationChirho.plan_sha256_chirho ===
						inputChirho.source_plan_chirho.sha256_chirho &&
					reconciliationChirho.scene_sha256_chirho === jobChirho.scene_chirho.sha256_chirho &&
					reconciliationChirho.task_uuid_chirho === requestedChirho[0].task_uuid_chirho &&
					reconciliationChirho.requested_event_sha256_chirho ===
						eventHashChirho(requestedChirho[0]) &&
					equalChirho(
						reconciliationChirho.refused_event_sha256s_chirho,
						refusedChirho.map(eventHashChirho)
					) &&
					reconciliationChirho.received_event_sha256_chirho ===
						eventHashChirho(receivedChirho[0]) &&
					reconciliationChirho.saved_event_sha256_chirho === eventHashChirho(savedChirho[0]) &&
					reconciliationChirho.raw_clip_sha256_chirho === savedChirho[0].sha256_chirho &&
					reconciliationChirho.raw_clip_bytes_chirho === savedChirho[0].bytes_chirho,
				'Explicit original-UUID reconciliation facts differ'
			);
			originalJournalShaChirho = originalPinChirho.sha256_chirho;
		} else
			requireChirho(
				entryChirho.reconciliation_chirho === undefined,
				'Unexpected reconciliation proof without refused history'
			);
		const rawBytesChirho = readChirho(entryChirho.raw_clip_path_chirho, 32 * 1024 ** 2);
		requireChirho(
			rawBytesChirho.length === savedChirho[0].bytes_chirho &&
				hashChirho(rawBytesChirho) === savedChirho[0].sha256_chirho,
			'Original saved raw clip changed'
		);
		const reviewChirho = pinnedChirho(entryChirho.raw_frame_review_chirho) as JsonChirho;
		requireChirho(
			reviewChirho.accepted_for_composition_chirho === true &&
				reviewChirho.raw_clip_sha256_chirho === savedChirho[0].sha256_chirho &&
				reviewChirho.task_uuid_chirho === requestedChirho[0].task_uuid_chirho &&
				reviewChirho.scene_sha256_chirho === jobChirho.scene_chirho.sha256_chirho,
			'Explicit original-frame review required'
		);
		const identityChirho = hashChirho(
			JSON.stringify({
				recipe_chirho:
					Object.hasOwn(reviewChirho, 'retained_crop_chirho') ||
					Object.hasOwn(reviewChirho, 'camera_end_zoom_chirho')
						? TRANSFORM_RECIPE_CHIRHO
						: RECIPE_CHIRHO,
				plan_chirho: inputChirho.source_plan_chirho,
				inventory_chirho: inputChirho.source_inventory_chirho,
				entry_chirho: entryChirho
			})
		);
		const directoryChirho =
			inputChirho.output_home_chirho +
			'/' +
			entryChirho.lesson_id_chirho.toLowerCase().replaceAll('.', '-') +
			'-chirho';
		const videoPathChirho = directoryChirho + '/verse-chirho.mp4',
			recordPathChirho = directoryChirho + '/video-record-chirho.json',
			proofPathChirho = directoryChirho + '/build-proof-chirho.json',
			completedPathChirho = directoryChirho + '/complete-chirho.json';
		if (existsSyncChirho(pathChirho(directoryChirho))) {
			requireChirho(
				existsSyncChirho(pathChirho(completedPathChirho)),
				'Partial composition retained; Root must reconcile, never auto-render it again'
			);
			const previousChirho = JSON.parse(readChirho(completedPathChirho, 256 * 1024).toString()) as {
				identity_chirho: string;
				video_sha256_chirho: string;
				record_sha256_chirho: string;
				proof_sha256_chirho: string;
			};
			requireChirho(
				previousChirho.identity_chirho === identityChirho &&
					hashChirho(readChirho(videoPathChirho, 64 * 1024 ** 2)) ===
						previousChirho.video_sha256_chirho &&
					hashChirho(readChirho(recordPathChirho, 256 * 1024)) ===
						previousChirho.record_sha256_chirho &&
					hashChirho(readChirho(proofPathChirho, 256 * 1024)) ===
						previousChirho.proof_sha256_chirho,
				'Completed composition changed; preserve it'
			);
			recordsChirho.push(JSON.parse(readChirho(recordPathChirho, 256 * 1024).toString()));
			proofsChirho.push({
				path_chirho: proofPathChirho,
				sha256_chirho: previousChirho.proof_sha256_chirho
			});
			replayedChirho++;
			continue;
		}
		const rawProbeChirho = probeChirho(entryChirho.raw_clip_path_chirho),
			rawVideoChirho = rawProbeChirho.streams.filter(
				(rowChirho) => rowChirho.codec_type === 'video'
			);
		requireChirho(
			rawVideoChirho.length === 1 &&
				rawVideoChirho[0].codec_name === 'h264' &&
				Number.isSafeInteger(rawVideoChirho[0].width) &&
				Number.isSafeInteger(rawVideoChirho[0].height) &&
				Number(rawVideoChirho[0].width) >= 64 &&
				Number(rawVideoChirho[0].height) >= 64 &&
				Number(rawVideoChirho[0].width) <= 4096 &&
				Number(rawVideoChirho[0].height) <= 4096 &&
				Number(rawVideoChirho[0].nb_read_frames) === reviewChirho.all_frames_chirho &&
				Number(rawVideoChirho[0].nb_read_frames) >= 2 &&
				Number(rawVideoChirho[0].nb_read_frames) <= 4096,
			'Raw clip codec/frame review differs'
		);
		const originalFramesChirho = Number(rawVideoChirho[0].nb_read_frames),
			declaredRangeChirho = reviewChirho.retained_frame_range_chirho;
		const rawWidthChirho = Number(rawVideoChirho[0].width),
			rawHeightChirho = Number(rawVideoChirho[0].height),
			declaredCropChirho = reviewChirho.retained_crop_chirho,
			declaredZoomChirho = reviewChirho.camera_end_zoom_chirho;
		let cropChirho: CropChirho | null = null;
		if (declaredCropChirho !== undefined) {
			requireChirho(
				declaredCropChirho !== null &&
					typeof declaredCropChirho === 'object' &&
					!Array.isArray(declaredCropChirho),
				'Invalid explicitly reviewed spatial crop'
			);
			const valueChirho = declaredCropChirho as CropChirho;
			requireChirho(
				Object.keys(valueChirho).length === 4 &&
					Object.values(valueChirho).every(
						(numberChirho) => Number.isSafeInteger(numberChirho) && numberChirho % 2 === 0
					) &&
					valueChirho.x_chirho >= 0 &&
					valueChirho.y_chirho >= 0 &&
					valueChirho.width_chirho >= 2 &&
					valueChirho.height_chirho >= 2 &&
					valueChirho.x_chirho + valueChirho.width_chirho <= rawWidthChirho &&
					valueChirho.y_chirho + valueChirho.height_chirho <= rawHeightChirho,
				'Invalid explicitly reviewed spatial crop'
			);
			cropChirho = {
				x_chirho: valueChirho.x_chirho,
				y_chirho: valueChirho.y_chirho,
				width_chirho: valueChirho.width_chirho,
				height_chirho: valueChirho.height_chirho
			};
		}
		requireChirho(
			declaredZoomChirho === undefined ||
				(typeof declaredZoomChirho === 'number' &&
					Number.isFinite(declaredZoomChirho) &&
					declaredZoomChirho >= 1 &&
					declaredZoomChirho <= 1.08),
			'Invalid explicitly reviewed camera zoom'
		);
		const cameraZoomChirho = declaredZoomChirho === undefined ? 1 : (declaredZoomChirho as number);
		let rangeChirho: { start_chirho: number; end_chirho: number } | null = null,
			motionSpanChirho: number | null = null;
		if (declaredRangeChirho !== undefined) {
			requireChirho(
				declaredRangeChirho !== null &&
					typeof declaredRangeChirho === 'object' &&
					!Array.isArray(declaredRangeChirho),
				'Invalid explicitly retained frame range'
			);
			const valueChirho = declaredRangeChirho as { start_chirho: number; end_chirho: number };
			requireChirho(
				Number.isSafeInteger(valueChirho.start_chirho) &&
					Number.isSafeInteger(valueChirho.end_chirho) &&
					valueChirho.start_chirho >= 0 &&
					valueChirho.end_chirho <= originalFramesChirho &&
					valueChirho.end_chirho - valueChirho.start_chirho >= 2,
				'Invalid explicitly retained frame range'
			);
			rangeChirho = { start_chirho: valueChirho.start_chirho, end_chirho: valueChirho.end_chirho };
			const frameProbeChirho = JSON.parse(
				toolChirho('ffprobe', [
					'-v',
					'error',
					'-select_streams',
					'v:0',
					'-show_frames',
					'-show_entries',
					'frame=best_effort_timestamp_time',
					'-of',
					'json',
					pathChirho(entryChirho.raw_clip_path_chirho)
				]).toString()
			) as { frames: { best_effort_timestamp_time: string }[] };
			requireChirho(
				Array.isArray(frameProbeChirho.frames) &&
					frameProbeChirho.frames.length === originalFramesChirho,
				'Original frame timestamp inventory differs'
			);
			motionSpanChirho =
				Number(frameProbeChirho.frames[valueChirho.end_chirho - 1].best_effort_timestamp_time) -
				Number(frameProbeChirho.frames[valueChirho.start_chirho].best_effort_timestamp_time);
			requireChirho(
				Number.isFinite(motionSpanChirho) && motionSpanChirho > 0 && motionSpanChirho <= 16,
				'Retained frame motion span is invalid'
			);
		}
		decodeChirho(entryChirho.raw_clip_path_chirho);
		decodeChirho(entryChirho.audio_path_chirho);
		const sourcePcmChirho = pcmChirho(entryChirho.audio_path_chirho);
		requireChirho(
			Math.abs(sourcePcmChirho.length / 32000 - selectedChirho.duration_chirho) <= 0.1,
			'Original whole-verse MP3 duration differs'
		);
		const framesChirho = Math.round(selectedChirho.duration_chirho * FPS_CHIRHO),
			secondsChirho = framesChirho / FPS_CHIRHO,
			rawSecondsChirho = Number(rawVideoChirho[0].duration ?? rawProbeChirho.format.duration);
		requireChirho(
			Number.isFinite(rawSecondsChirho) &&
				rawSecondsChirho > 0 &&
				rawSecondsChirho <= 16 &&
				framesChirho >= 1 &&
				framesChirho <= 2880,
			'Source or output duration exceeds its bound'
		);
		mkdirSyncChirho(pathChirho(dirnameChirho(directoryChirho)), { recursive: true });
		mkdirSyncChirho(pathChirho(directoryChirho));
		saveChirho(directoryChirho + '/intent-chirho.json', {
			identity_chirho: identityChirho,
			input_sha256_chirho: optionsChirho.input_chirho.sha256_chirho,
			original_raw_sha256_chirho: savedChirho[0].sha256_chirho,
			source_mp3_sha256_chirho: selectedChirho.sha256_chirho,
			state_chirho: 'one_local_composition_started_no_provider_call'
		});
		try {
			const picturePathChirho = directoryChirho + '/picture-work-chirho.mp4';
			// Context frames follow the last retained endpoint after the target time; they are never a visible fallback.
			const prefixChirho = rangeChirho
				? `trim=start_frame=${rangeChirho.start_chirho}:end_frame=${rangeChirho.end_chirho},setpts=PTS-STARTPTS,tpad=stop_mode=clone:stop=2,`
				: '';
			const spatialChirho = cropChirho
				? `crop=w=${cropChirho.width_chirho}:h=${cropChirho.height_chirho}:x=${cropChirho.x_chirho}:y=${cropChirho.y_chirho},scale=${rawWidthChirho}:${rawHeightChirho}:flags=lanczos,`
				: '';
			const cameraChirho =
				cameraZoomChirho > 1
					? `,zoompan=z='1+(${cameraZoomChirho}-1)*min(on,${framesChirho - 1})/${Math.max(1, framesChirho - 1)}':x='(iw-iw/zoom)/2':y='(ih-ih/zoom)/2':d=1:s=${rawWidthChirho}x${rawHeightChirho}:fps=${FPS_CHIRHO}`
					: '';

			toolChirho('ffmpeg', [
				'-v',
				'error',
				'-xerror',
				'-nostdin',
				'-n',
				'-i',
				pathChirho(entryChirho.raw_clip_path_chirho),
				'-vf',
				`${spatialChirho}${prefixChirho}setpts=${(secondsChirho / (motionSpanChirho ?? rawSecondsChirho)).toFixed(5)}*(PTS-STARTPTS),${INTERPOLATE_CHIRHO},tpad=stop_mode=clone:stop_duration=2,${RETIME_CHIRHO}${cameraChirho}`,
				'-frames:v',
				String(framesChirho),
				'-an',
				'-c:v',
				'libx264',
				'-crf',
				'20',
				'-preset',
				'medium',
				'-pix_fmt',
				'yuv420p',
				'-threads',
				'2',
				'-filter_threads',
				'1',
				pathChirho(picturePathChirho)
			]);
			toolChirho('ffmpeg', [
				'-v',
				'error',
				'-xerror',
				'-nostdin',
				'-n',
				'-i',
				pathChirho(picturePathChirho),
				'-i',
				pathChirho(entryChirho.audio_path_chirho),
				'-map',
				'0:v:0',
				'-map',
				'1:a:0',
				'-c:v',
				'copy',
				'-ac',
				'1',
				'-ar',
				'48000',
				'-c:a',
				'aac',
				'-b:a',
				'96k',
				'-threads',
				'2',
				'-movflags',
				'+faststart',
				pathChirho(videoPathChirho)
			]);
			decodeChirho(videoPathChirho);
			const probeValueChirho = probeChirho(videoPathChirho),
				pictureChirho = probeValueChirho.streams.filter(
					(rowChirho) => rowChirho.codec_type === 'video'
				),
				soundChirho = probeValueChirho.streams.filter(
					(rowChirho) => rowChirho.codec_type === 'audio'
				);
			requireChirho(
				pictureChirho.length === 1 &&
					soundChirho.length === 1 &&
					pictureChirho[0].codec_name === 'h264' &&
					pictureChirho[0].avg_frame_rate === '24/1' &&
					Number(pictureChirho[0].nb_read_frames) === framesChirho &&
					pictureChirho[0].width === rawVideoChirho[0].width &&
					pictureChirho[0].height === rawVideoChirho[0].height &&
					soundChirho[0].codec_name === 'aac' &&
					soundChirho[0].sample_rate === '48000' &&
					soundChirho[0].channels === 1 &&
					Math.abs(Number(probeValueChirho.format.duration) - secondsChirho) <= 0.1,
				'Final H264/AAC/frame/duration proof differs'
			);
			const matchChirho = correlationChirho(pcmChirho(videoPathChirho), sourcePcmChirho);
			requireChirho(
				matchChirho.soundtrack_correlation_chirho >= 0.998 &&
					Math.abs(matchChirho.lag_ms_chirho) <= 10,
				'Composed soundtrack differs from the selected whole MP3'
			);
			const bytesChirho = readChirho(videoPathChirho, 64 * 1024 ** 2),
				shaChirho = hashChirho(bytesChirho),
				humanChirho = selectedChirho.reading_source_chirho;
			if (!humanChirho)
				requireChirho(
					recordingIdentityChirho(selectedChirho).raw_whole_verse_shape_chirho &&
						jobChirho.audio_chirho.license_chirho === 'CC BY 4.0' &&
						jobChirho.audio_chirho.license_url_chirho ===
							'https://creativecommons.org/licenses/by/4.0/',
					'Synthetic original licence/full-file identity differs'
				);
			const videoChirho: VerseVideoChirho = {
				lesson_id_chirho: jobChirho.lesson_id_chirho,
				asset_path_chirho: `/video-chirho/sha256-chirho/${shaChirho}-chirho.mp4`,
				sha256_chirho: shaChirho,
				bytes_chirho: bytesChirho.length,
				duration_chirho: secondsChirho,
				width_chirho: Number(pictureChirho[0].width),
				height_chirho: Number(pictureChirho[0].height),
				scene_sha256_chirho: jobChirho.scene_chirho.sha256_chirho,
				canonical_sha256_chirho: jobChirho.canonical_sha256_chirho,
				reading_language_chirho: humanChirho ? 'he' : 'el',
				embedded_reading_chirho: humanChirho ?? null,
				...(!humanChirho
					? {
							embedded_clip_chirho: {
								sha256_chirho: selectedChirho.sha256_chirho,
								bytes_chirho: selectedChirho.bytes_chirho,
								duration_chirho: selectedChirho.duration_chirho,
								recipe_id_chirho: selectedChirho.recipe_id_chirho!,
								pronunciation_chirho: selectedChirho.pronunciation_chirho as
									'modern_greek' | 'modern_greek_aspirates' | 'erasmian_greek'
							}
						}
					: {}),
				attribution_chirho:
					humanChirho?.attribution_chirho ??
					jobChirho.audio_chirho.attribution_chirho ??
					'Hinneh / Love Jesus Software',
				license_chirho: humanChirho ? 'CC BY-SA 3.0' : 'CC BY 4.0',
				license_url_chirho: humanChirho
					? 'https://creativecommons.org/licenses/by-sa/3.0/'
					: 'https://creativecommons.org/licenses/by/4.0/',
				review_chirho: 'pending'
			};
			requireChirho(
				validVerseVideoChirho(
					videoChirho,
					jobChirho.lesson_id_chirho,
					jobChirho.canonical_sha256_chirho,
					jobChirho.scene_chirho.sha256_chirho
				) && sameEmbeddedReadingChirho(videoChirho, selectedChirho),
				'Shared video/soundtrack validators refused composition'
			);
			const proofChirho = {
				lesson_id_chirho: jobChirho.lesson_id_chirho,
				source_plan_sha256_chirho: inputChirho.source_plan_chirho.sha256_chirho,
				source_journal_sha256_chirho: entryChirho.journal_chirho.sha256_chirho,
				original_journal_sha256_chirho: originalJournalShaChirho,
				source_reconciliation_sha256_chirho:
					entryChirho.reconciliation_chirho?.sha256_chirho ?? null,
				raw_clip_path_chirho: entryChirho.raw_clip_path_chirho,
				raw_clip_sha256_chirho: savedChirho[0].sha256_chirho,
				raw_task_uuid_chirho: requestedChirho[0].task_uuid_chirho,
				raw_request_sha256_chirho: requestedChirho[0].request_sha256_chirho,
				raw_scene_sha256_chirho: jobChirho.scene_chirho.sha256_chirho,
				audio_chirho: selectedChirho,
				picture_review_chirho: jobChirho.picture_review_chirho,
				raw_frame_review_chirho: reviewChirho,
				raw_frame_count_chirho: originalFramesChirho,
				retained_frame_range_chirho: rangeChirho,
				retained_frame_count_chirho: rangeChirho
					? rangeChirho.end_chirho - rangeChirho.start_chirho
					: originalFramesChirho,
				retained_motion_span_seconds_chirho: motionSpanChirho,
				interpolation_context_frames_chirho: rangeChirho ? 2 : 0,
				...(cropChirho ? { retained_crop_chirho: cropChirho } : {}),
				...(declaredZoomChirho === undefined ? {} : { camera_end_zoom_chirho: cameraZoomChirho }),
				...(cropChirho || declaredZoomChirho !== undefined
					? { transform_recipe_chirho: TRANSFORM_RECIPE_CHIRHO }
					: {}),
				video_chirho: videoChirho,
				probe_chirho: probeValueChirho,
				full_decode_chirho: true,
				...matchChirho,
				new_provider_requests_chirho: 0,
				published_chirho: false
			};
			// Reuse the finite installer's complete HQ/plan/inventory/build-proof gate in memory.
			const virtualChirho = new Map<string, unknown>([
				[
					'batch-chirho.json',
					{
						schema_version_chirho: 1,
						source_plan_chirho: inputChirho.source_plan_chirho,
						source_inventory_chirho: inputChirho.source_inventory_chirho,
						source_records_chirho: {
							path_chirho: 'records-chirho.json',
							sha256_chirho: hashChirho(JSON.stringify({ videos_chirho: [videoChirho] }))
						},
						entries_chirho: [
							{
								lesson_id_chirho: jobChirho.lesson_id_chirho,
								mp4_path_chirho: videoPathChirho,
								audio_path_chirho: entryChirho.audio_path_chirho,
								build_proof_chirho: {
									path_chirho: proofPathChirho,
									sha256_chirho: hashChirho(JSON.stringify(proofChirho))
								}
							}
						]
					}
				],
				['records-chirho.json', { videos_chirho: [videoChirho] }],
				[proofPathChirho, proofChirho]
			]);
			const batchShaChirho = hashChirho(JSON.stringify(virtualChirho.get('batch-chirho.json')));
			hashesChirho.set('batch-chirho.json', batchShaChirho);
			for (const [keyChirho, valueChirho] of virtualChirho)
				hashesChirho.set(keyChirho, hashChirho(JSON.stringify(valueChirho)));
			await readFiniteVideoBatchChirho(
				{ path_chirho: 'batch-chirho.json', sha256_chirho: batchShaChirho },
				async (valueChirho, _deliveryChirho, limitChirho) =>
					virtualChirho.has(valueChirho)
						? virtualChirho.get(valueChirho)
						: pinnedChirho(
								{ path_chirho: valueChirho, sha256_chirho: hashesChirho.get(valueChirho)! },
								limitChirho
							),
				hashesChirho
			);
			for (const [sourcePathChirho, sourceShaChirho] of hashesChirho)
				if (!virtualChirho.has(sourcePathChirho) && sourcePathChirho !== videoPathChirho)
					requireChirho(
						hashChirho(readFileSyncChirho(pathChirho(sourcePathChirho))) === sourceShaChirho,
						'Source changed during composition'
					);
			saveChirho(recordPathChirho, videoChirho);
			saveChirho(proofPathChirho, proofChirho);
			const recordShaChirho = hashChirho(readChirho(recordPathChirho, 256 * 1024)),
				proofShaChirho = hashChirho(readChirho(proofPathChirho, 256 * 1024));
			saveChirho(completedPathChirho, {
				identity_chirho: identityChirho,
				video_sha256_chirho: shaChirho,
				record_sha256_chirho: recordShaChirho,
				proof_sha256_chirho: proofShaChirho,
				frames_chirho: framesChirho,
				fps_chirho: FPS_CHIRHO
			});
			rmSyncChirho(pathChirho(picturePathChirho));
			recordsChirho.push(videoChirho);
			proofsChirho.push({ path_chirho: proofPathChirho, sha256_chirho: proofShaChirho });
		} catch (errorChirho) {
			if (!existsSyncChirho(pathChirho(directoryChirho + '/failure-chirho.json')))
				saveChirho(directoryChirho + '/failure-chirho.json', {
					state_chirho: 'partial_output_retained_root_reconciliation_required',
					reason_chirho: errorChirho instanceof Error ? errorChirho.message : String(errorChirho)
				});
			throw errorChirho;
		}
	}
	const recordsPathChirho = inputChirho.output_home_chirho + '/videos-records-chirho.json',
		recordsValueChirho = { videos_chirho: recordsChirho };
	if (existsSyncChirho(pathChirho(recordsPathChirho)))
		requireChirho(
			equalChirho(
				JSON.parse(readChirho(recordsPathChirho, 256 * 1024).toString()),
				recordsValueChirho
			),
			'Existing finite records index changed'
		);
	else saveChirho(recordsPathChirho, recordsValueChirho);
	return {
		composed_chirho: recordsChirho.length - replayedChirho,
		replayed_chirho: replayedChirho,
		records_path_chirho: recordsPathChirho,
		proofs_chirho: proofsChirho,
		new_provider_requests_chirho: 0
	};
}

if (import.meta.main) {
	const argumentsChirho = process.argv.slice(2);
	requireChirho(
		argumentsChirho.length === 4 &&
			argumentsChirho[0] === '--input-chirho' &&
			argumentsChirho[2] === '--input-sha256-chirho',
		'Pass one explicit pinned finite composition input'
	);
	console.log(
		JSON.stringify(
			await composeOpeningsChirho({
				root_chirho: process.cwd(),
				input_chirho: { path_chirho: argumentsChirho[1], sha256_chirho: argumentsChirho[3] }
			})
		)
	);
}
