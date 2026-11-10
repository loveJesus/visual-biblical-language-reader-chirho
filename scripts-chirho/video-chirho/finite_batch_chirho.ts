// For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life. — John 3:16 (KJV)
// Workflow: verse-media-chirho.md. Caller-pinned finite authority; no provider, archive or catalogue writes.
import { isDeepStrictEqual as equalChirho } from 'node:util';
import { createHash as createHashChirho } from 'node:crypto';
import type { VerseVideoChirho } from '../../src/lib/domain-chirho/verse-video-chirho';
import type { LessonChirho } from '../../src/lib/domain-chirho/lesson-chirho';
import type { GreekLessonChirho } from '../../src/lib/domain-chirho/greek-chirho';
import {
	type RecordingChirho,
	automaticVerseRecordingChirho,
	recordingsFromChapterChirho
} from '../../src/lib/reader-chirho/audio-chirho/recordings-chirho';
const digestChirho = (valueChirho: string) =>
	createHashChirho('sha256').update(valueChirho).digest('hex');
export const FINITE_VIDEO_BATCH_LIMIT_CHIRHO = 30;
/** Existing automatic Greek choice, after source/recipe admission; no profile is borrowed to fit a video. */
export function selectedSyntheticVerseChirho(
	clipsChirho: RecordingChirho[],
	lessonChirho: LessonChirho | GreekLessonChirho
) {
	return automaticVerseRecordingChirho(
		recordingsFromChapterChirho(
			lessonChirho,
			{ clips_chirho: clipsChirho },
			digestChirho(lessonChirho.canonical_text_chirho)
		),
		lessonChirho
	);
}

export interface PinChirho {
	path_chirho: string;
	sha256_chirho: string;
}
interface BatchEntryChirho {
	lesson_id_chirho: string;
	mp4_path_chirho: string;
	audio_path_chirho: string;
	build_proof_chirho: PinChirho;
}
interface BatchChirho {
	schema_version_chirho: number;
	source_plan_chirho: PinChirho;
	source_inventory_chirho: PinChirho;
	source_records_chirho: PinChirho;
	entries_chirho: BatchEntryChirho[];
}
type JsonReaderChirho = (
	pathChirho: string,
	deliveryChirho?: boolean,
	limitChirho?: number
) => Promise<unknown>;
/** Workflow: verse-media-chirho.md. Finite private authority pins, HQ lineage and immutable producer records. */
export async function readFiniteVideoBatchChirho(
	pinChirho: PinChirho,
	jsonChirho: JsonReaderChirho,
	hashesChirho: Map<string, string>
) {
	const pinnedChirho = async (pinChirho: PinChirho, limitChirho = 256 * 1024) => {
		if (!pinChirho || !/^[a-f0-9]{64}$/.test(pinChirho.sha256_chirho))
			throw Error('Batch input needs an exact SHA-256');
		const valueChirho = await jsonChirho(pinChirho.path_chirho, false, limitChirho);
		if (hashesChirho.get(pinChirho.path_chirho) !== pinChirho.sha256_chirho)
			throw Error('Pinned batch source changed');
		return valueChirho;
	};
	const valueChirho = (await pinnedChirho(pinChirho)) as BatchChirho;
	if (
		valueChirho.schema_version_chirho !== 1 ||
		!Array.isArray(valueChirho.entries_chirho) ||
		valueChirho.entries_chirho.length < 1 ||
		valueChirho.entries_chirho.length > FINITE_VIDEO_BATCH_LIMIT_CHIRHO
	)
		throw Error('A finite batch contains one to thirty chapter openings; split larger batches');
	const planChirho = (await pinnedChirho(valueChirho.source_plan_chirho, 4 * 1024 ** 2)) as
		{ jobs_chirho?: Record<string, unknown>[] } | Record<string, unknown>[];
	const jobsChirho = Array.isArray(planChirho) ? planChirho : planChirho.jobs_chirho;
	const inventoryChirho = (await pinnedChirho(
		valueChirho.source_inventory_chirho,
		16 * 1024 ** 2
	)) as Record<string, unknown>[];
	const recordsChirho = (await pinnedChirho(valueChirho.source_records_chirho)) as {
		videos_chirho: VerseVideoChirho[];
	};
	if (
		!Array.isArray(jobsChirho) ||
		jobsChirho.length > 1000 ||
		!Array.isArray(inventoryChirho) ||
		inventoryChirho.length > 32000 ||
		!Array.isArray(recordsChirho.videos_chirho) ||
		recordsChirho.videos_chirho.length > 1000
	)
		throw Error('Finite source array exceeds its bound');
	const selectedChirho = new Map<
		string,
		{
			entry_chirho: BatchEntryChirho;
			job_chirho: Record<string, unknown>;
			inventory_chirho: Record<string, unknown>;
			proof_chirho: Record<string, unknown>;
		}
	>();
	const videosChirho: VerseVideoChirho[] = [];
	for (const entryChirho of valueChirho.entries_chirho) {
		if (
			!/^([1-3]?[A-Za-z]+)\.([1-9][0-9]{0,2})\.1$/.test(entryChirho.lesson_id_chirho) ||
			selectedChirho.has(entryChirho.lesson_id_chirho) ||
			!entryChirho.mp4_path_chirho.endsWith('.mp4') ||
			!entryChirho.audio_path_chirho.endsWith('.mp3')
		)
			throw Error('Duplicate or non-opening finite video');
		const ownChirho = (rowsChirho: Record<string, unknown>[]) =>
			rowsChirho.filter((rowChirho) => rowChirho.lesson_id_chirho === entryChirho.lesson_id_chirho);
		const plannedChirho = ownChirho(jobsChirho),
			inventoriedChirho = ownChirho(inventoryChirho),
			recordedChirho = recordsChirho.videos_chirho.filter(
				(rowChirho) => rowChirho.lesson_id_chirho === entryChirho.lesson_id_chirho
			);
		if (plannedChirho.length !== 1 || inventoriedChirho.length !== 1 || recordedChirho.length !== 1)
			throw Error('Finite position needs one plan, inventory and producer record');
		const jobChirho = plannedChirho[0],
			inventoryRowChirho = inventoriedChirho[0],
			videoChirho = recordedChirho[0];
		const sceneChirho = inventoryRowChirho.scene_chirho as Record<string, unknown>,
			qualityChirho = jobChirho.high_quality_chirho as Record<string, unknown>,
			lineageChirho = sceneChirho?.delivery_lineage_chirho as Record<string, unknown>;
		const reviewChirho = jobChirho.picture_review_chirho as Record<string, unknown>,
			soundChirho = inventoryRowChirho.whole_verse_audio_chirho as Record<string, unknown>;
		const holdsChirho = inventoryRowChirho.known_holds_chirho as
			{ current_scene_blocked_chirho?: boolean } | undefined;
		const kindChirho =
			sceneChirho?.quality_class_chirho === 'preserved_high_quality_chirho'
				? 'preserved_chirho'
				: sceneChirho?.quality_class_chirho === 'hq_upgrade_chirho'
					? 'upgrade_chirho'
					: null;
		if (
			holdsChirho?.current_scene_blocked_chirho === true ||
			!Array.isArray(jobChirho.holds_chirho) ||
			jobChirho.holds_chirho.length ||
			!kindChirho ||
			sceneChirho.high_quality_chirho !== true ||
			inventoryRowChirho.picture_prerequisite_met_chirho !== true ||
			qualityChirho?.ready_chirho !== true ||
			qualityChirho.kind_chirho !== kindChirho ||
			qualityChirho.delivery_sha256_chirho !== videoChirho.scene_sha256_chirho ||
			qualityChirho.source_sha256_chirho !== sceneChirho.source_sha256_chirho ||
			lineageChirho?.delivery_sha256_chirho !== videoChirho.scene_sha256_chirho ||
			lineageChirho.source_sha256_chirho !== sceneChirho.source_sha256_chirho ||
			!/^[a-f0-9]{64}$/.test(String(sceneChirho.source_sha256_chirho)) ||
			sceneChirho.sha256_chirho !== videoChirho.scene_sha256_chirho ||
			reviewChirho?.accepted_chirho !== true ||
			reviewChirho.scene_sha256_chirho !== videoChirho.scene_sha256_chirho ||
			jobChirho.canonical_sha256_chirho !== videoChirho.canonical_sha256_chirho ||
			inventoryRowChirho.canonical_sha256_chirho !== videoChirho.canonical_sha256_chirho ||
			!equalChirho(jobChirho.scene_chirho, {
				lesson_id_chirho: entryChirho.lesson_id_chirho,
				asset_path_chirho: sceneChirho.asset_path_chirho,
				sha256_chirho: sceneChirho.sha256_chirho,
				alt_chirho: sceneChirho.alt_chirho
			}) ||
			soundChirho?.ready_chirho !== true ||
			!equalChirho(jobChirho.audio_chirho, soundChirho.selected_chirho)
		)
			throw Error('Finite video HQ/source/audio authority differs');
		const proofChirho = (await pinnedChirho(entryChirho.build_proof_chirho)) as Record<
			string,
			unknown
		>;
		const framesChirho = proofChirho.raw_frame_review_chirho as Record<string, unknown>;
		if (
			!equalChirho(proofChirho.picture_review_chirho, jobChirho.picture_review_chirho) ||
			proofChirho.lesson_id_chirho !== entryChirho.lesson_id_chirho ||
			!equalChirho(proofChirho.video_chirho, videoChirho) ||
			!equalChirho(proofChirho.audio_chirho, jobChirho.audio_chirho) ||
			proofChirho.raw_scene_sha256_chirho !== videoChirho.scene_sha256_chirho ||
			framesChirho?.accepted_for_composition_chirho !== true ||
			!Number.isSafeInteger(framesChirho.all_frames_chirho) ||
			Number(framesChirho.all_frames_chirho) < 1 ||
			Number(framesChirho.all_frames_chirho) > 4096 ||
			proofChirho.full_decode_chirho !== true ||
			typeof proofChirho.soundtrack_correlation_chirho !== 'number' ||
			!Number.isFinite(proofChirho.soundtrack_correlation_chirho) ||
			proofChirho.soundtrack_correlation_chirho < 0.998 ||
			proofChirho.soundtrack_correlation_chirho > 1.000001 ||
			typeof proofChirho.lag_ms_chirho !== 'number' ||
			!Number.isFinite(proofChirho.lag_ms_chirho) ||
			Math.abs(proofChirho.lag_ms_chirho) > 10
		)
			throw Error('Finite video build/frame/soundtrack proof differs');
		selectedChirho.set(entryChirho.lesson_id_chirho, {
			entry_chirho: entryChirho,
			job_chirho: jobChirho,
			inventory_chirho: inventoryRowChirho,
			proof_chirho: proofChirho
		});
		videosChirho.push(videoChirho);
	}
	return { selected_chirho: selectedChirho, videos_chirho: videosChirho };
}
