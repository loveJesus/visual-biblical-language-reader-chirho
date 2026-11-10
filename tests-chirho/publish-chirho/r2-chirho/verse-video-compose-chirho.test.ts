// For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life. — John 3:16 (KJV)
import { afterEach, describe, expect, it, vi } from 'vitest';
import { execFileSync as execFileSyncChirho } from 'node:child_process';
import { createHash as createHashChirho } from 'node:crypto';
import {
	existsSync as existsSyncChirho,
	mkdirSync as mkdirSyncChirho,
	mkdtempSync as mkdtempSyncChirho,
	readFileSync as readFileSyncChirho,
	rmSync as rmSyncChirho,
	writeFileSync as writeFileSyncChirho
} from 'node:fs';
import { tmpdir as tmpdirChirho } from 'node:os';
import { dirname as dirnameChirho, join as joinChirho } from 'node:path';
import type { RecordingChirho } from '../../../src/lib/reader-chirho/audio-chirho/recordings-chirho';
import { composeOpeningsChirho } from '../../../scripts-chirho/video-chirho/compose_opening_chirho';
import {
	BEERI_ATTRIBUTION_CHIRHO,
	BEERI_LICENSE_URL_CHIRHO,
	type ReadingSourceChirho
} from '../../../src/lib/domain-chirho/pronunciation-chirho/reading-source-chirho';
import {
	sameEmbeddedReadingChirho,
	validVerseVideoChirho
} from '../../../src/lib/domain-chirho/verse-video-chirho';

const rootsChirho: string[] = [];
const hashChirho = (bytesChirho: Uint8Array | string) =>
	createHashChirho('sha256').update(bytesChirho).digest('hex');
afterEach(() => {
	vi.unstubAllEnvs();
	for (const rootChirho of rootsChirho.splice(0))
		rmSyncChirho(rootChirho, { recursive: true, force: true });
});
function fixtureChirho(
	humanChirho = false,
	lateDefectChirho = false,
	patternChirho?: 'edge_chirho' | 'zoom_chirho'
) {
	const rootChirho = mkdtempSyncChirho(joinChirho(tmpdirChirho(), 'compose-opening-chirho-'));
	rootsChirho.push(rootChirho);
	const writeChirho = (pathChirho: string, bytesChirho: string | Uint8Array) => {
		mkdirSyncChirho(dirnameChirho(joinChirho(rootChirho, pathChirho)), { recursive: true });
		writeFileSyncChirho(joinChirho(rootChirho, pathChirho), bytesChirho);
	};
	const jsonChirho = (pathChirho: string, valueChirho: unknown) => {
		const bytesChirho = JSON.stringify(valueChirho) + '\n';
		writeChirho(pathChirho, bytesChirho);
		return { path_chirho: pathChirho, sha256_chirho: hashChirho(bytesChirho) };
	};
	const rawPathChirho = 'inputs-chirho/run-chirho/clips-chirho/raw-chirho.mp4',
		audioPathChirho = 'inputs-chirho/source-chirho.mp3';
	mkdirSyncChirho(dirnameChirho(joinChirho(rootChirho, rawPathChirho)), { recursive: true });
	execFileSyncChirho('ffmpeg', [
		'-v',
		'error',
		'-nostdin',
		'-n',
		'-f',
		'lavfi',
		'-i',
		lateDefectChirho || patternChirho
			? 'color=c=blue:s=128x96:r=24:d=1'
			: 'testsrc2=size=128x96:rate=24:duration=1',
		...(lateDefectChirho
			? [
					'-vf',
					"drawbox=x=0:y=0:w=iw:h=ih:color=green:t=fill:enable='eq(n,1)',drawbox=x=0:y=0:w=iw:h=ih:color=red:t=fill:enable='gte(n,18)'"
				]
			: patternChirho
				? [
						'-vf',
						patternChirho === 'edge_chirho'
							? 'drawbox=x=0:y=0:w=16:h=ih:color=red:t=fill'
							: 'drawbox=x=32:y=24:w=64:h=48:color=white:t=fill'
					]
				: []),
		'-an',
		'-c:v',
		'libx264',
		'-pix_fmt',
		'yuv420p',
		'-threads',
		'2',
		joinChirho(rootChirho, rawPathChirho)
	]);
	execFileSyncChirho('ffmpeg', [
		'-v',
		'error',
		'-nostdin',
		'-n',
		'-f',
		'lavfi',
		'-i',
		'aevalsrc=0.3*sin(2*PI*440*t)*(0.5+0.5*sin(2*PI*3*t)):s=44100:d=2',
		'-ac',
		'1',
		'-b:a',
		'96k',
		joinChirho(rootChirho, audioPathChirho)
	]);
	const lessonIdChirho = humanChirho ? 'Gen.1.1' : 'Matt.1.1',
		bookChirho = humanChirho ? 'Gen' : 'Matt',
		slugChirho = humanChirho ? 'genesis-chirho' : 'matthew-chirho',
		textChirho = humanChirho ? 'א' : 'λόγος';
	const sceneBytesChirho = Buffer.from('fixture picture bytes'),
		rawBytesChirho = readFileSyncChirho(joinChirho(rootChirho, rawPathChirho)),
		audioBytesChirho = readFileSyncChirho(joinChirho(rootChirho, audioPathChirho));
	writeChirho('inputs-chirho/picture-chirho.webp', sceneBytesChirho);
	const sourceChirho: ReadingSourceChirho = {
		kind_chirho: 'human',
		reader_id_chirho: 'rdb-chirho',
		gbt_id_chirho: 'OT/RDB/Gen',
		package_sha256_chirho: 'a'.repeat(64),
		chapter_sha256_chirho: 'b'.repeat(64),
		timings_sha256_chirho: 'c'.repeat(64),
		start_chirho: 0.03,
		end_chirho: 2.03,
		chapter_duration_chirho: 20,
		attribution_chirho: BEERI_ATTRIBUTION_CHIRHO,
		license_chirho: 'CC BY-SA 3.0',
		license_url_chirho: BEERI_LICENSE_URL_CHIRHO
	};
	const clipChirho: RecordingChirho & { license_chirho?: string; license_url_chirho?: string } = {
		id_chirho: 'fixture-reading-chirho',
		lesson_id_chirho: lessonIdChirho,
		token_id_chirho: null,
		canonical_sha256_chirho: hashChirho(textChirho),
		text_chirho: textChirho,
		voice_name_chirho: humanChirho ? "Rabbi Dan Be'eri" : 'Fixture voice',
		language_chirho: humanChirho ? 'he' : 'el',
		pronunciation_chirho: humanChirho ? 'israeli_hebrew' : 'modern_greek',
		sha256_chirho: hashChirho(audioBytesChirho),
		asset_path_chirho: `/audio-chirho/sha256-chirho/${hashChirho(audioBytesChirho)}-chirho.mp3`,
		bytes_chirho: audioBytesChirho.length,
		duration_chirho: 2,
		review_chirho: 'audition',
		...(humanChirho
			? { reading_source_chirho: sourceChirho }
			: {
					recipe_id_chirho: 'chatterbox-v3-modern-greek-verse-v1-chirho',
					synthesis_text_chirho: textChirho,
					license_chirho: 'CC BY 4.0',
					license_url_chirho: 'https://creativecommons.org/licenses/by/4.0/'
				})
	};
	const sceneChirho = {
		lesson_id_chirho: lessonIdChirho,
		asset_path_chirho: '/assets-chirho/scenes-chirho/fixture-chirho.webp',
		sha256_chirho: hashChirho(sceneBytesChirho),
		alt_chirho: 'Fixture picture'
	};
	const jobChirho = {
		lesson_id_chirho: lessonIdChirho,
		canonical_sha256_chirho: hashChirho(textChirho),
		holds_chirho: [],
		scene_chirho: sceneChirho,
		high_quality_chirho: {
			ready_chirho: true,
			kind_chirho: 'preserved_chirho',
			delivery_sha256_chirho: sceneChirho.sha256_chirho,
			source_sha256_chirho: 'd'.repeat(64)
		},
		picture_review_chirho: {
			accepted_chirho: true,
			scene_sha256_chirho: sceneChirho.sha256_chirho
		},
		audio_chirho: clipChirho
	};
	const inventoryPinChirho = jsonChirho('inputs-chirho/inventory-chirho.json', [
		{
			lesson_id_chirho: lessonIdChirho,
			canonical_sha256_chirho: hashChirho(textChirho),
			picture_prerequisite_met_chirho: true,
			scene_chirho: {
				...sceneChirho,
				high_quality_chirho: true,
				quality_class_chirho: 'preserved_high_quality_chirho',
				source_sha256_chirho: 'd'.repeat(64),
				delivery_lineage_chirho: {
					source_sha256_chirho: 'd'.repeat(64),
					delivery_sha256_chirho: sceneChirho.sha256_chirho
				}
			},
			whole_verse_audio_chirho: { ready_chirho: true, selected_chirho: clipChirho }
		}
	]);
	const planPinChirho = jsonChirho('inputs-chirho/plan-chirho.json', {
		schema_version_chirho: 1,
		inventory_path_chirho: inventoryPinChirho.path_chirho,
		inventory_sha256_chirho: inventoryPinChirho.sha256_chirho,
		jobs_chirho: [jobChirho]
	});
	const contentPinChirho = jsonChirho('inputs-chirho/content-chirho.json', {
		book_id_chirho: bookChirho,
		chapter_chirho: 1,
		verses_chirho: [
			{
				id_chirho: lessonIdChirho,
				canonical_text_chirho: textChirho,
				tokens_chirho: [
					{
						id_chirho: 'word-chirho',
						text_chirho: textChirho,
						start_chirho: 0,
						end_chirho: textChirho.length
					}
				]
			}
		]
	});
	const audioChirho = {
		schema_version_chirho: 1,
		book_id_chirho: bookChirho,
		chapter_chirho: 1,
		content_path_chirho: `/content-chirho/${slugChirho}/chapter-01-chirho.json`,
		content_sha256_chirho: contentPinChirho.sha256_chirho,
		clips_chirho: humanChirho ? [] : [clipChirho],
		readings_chirho: humanChirho ? [clipChirho] : []
	};
	const uuidChirho = '11111111-1111-4111-8111-111111111111';
	const eventsChirho = [
		{
			state_chirho: 'requested_chirho',
			scene_sha256_chirho: sceneChirho.sha256_chirho,
			request_sha256_chirho: 'e'.repeat(64)
		},
		{ state_chirho: 'received_chirho', cost_usd_chirho: 0.045 },
		{
			state_chirho: 'saved_chirho',
			path_chirho: 'clips-chirho/raw-chirho.mp4',
			sha256_chirho: hashChirho(rawBytesChirho),
			bytes_chirho: rawBytesChirho.length
		}
	].map((rowChirho) => ({
		...rowChirho,
		lesson_id_chirho: lessonIdChirho,
		plan_sha256_chirho: planPinChirho.sha256_chirho,
		task_uuid_chirho: uuidChirho
	}));
	const journalBytesChirho = eventsChirho
		.map((rowChirho) => JSON.stringify(rowChirho) + '\n')
		.join('');
	writeChirho('inputs-chirho/journal-snapshot-chirho.jsonl', journalBytesChirho);
	const reviewChirho = {
		retained_frame_range_chirho: undefined as unknown,
		retained_crop_chirho: undefined as unknown,
		camera_end_zoom_chirho: undefined as unknown,
		accepted_for_composition_chirho: true,
		raw_clip_sha256_chirho: hashChirho(rawBytesChirho),
		task_uuid_chirho: uuidChirho,
		scene_sha256_chirho: sceneChirho.sha256_chirho,
		all_frames_chirho: 24
	};
	const entryChirho = {
		lesson_id_chirho: lessonIdChirho,
		reconciliation_chirho: undefined as { path_chirho: string; sha256_chirho: string } | undefined,
		journal_chirho: {
			path_chirho: 'inputs-chirho/journal-snapshot-chirho.jsonl',
			sha256_chirho: hashChirho(journalBytesChirho)
		},
		run_home_chirho: 'inputs-chirho/run-chirho',
		raw_clip_path_chirho: rawPathChirho,
		raw_frame_review_chirho: jsonChirho('inputs-chirho/review-chirho.json', reviewChirho),
		content_chapter_chirho: contentPinChirho,
		audio_chapter_chirho: jsonChirho('inputs-chirho/audio-chirho.json', audioChirho),
		media_chapter_chirho: jsonChirho('inputs-chirho/media-chirho.json', {
			scenes_chirho: [sceneChirho]
		}),
		audio_path_chirho: audioPathChirho,
		scene_path_chirho: 'inputs-chirho/picture-chirho.webp'
	};
	const inputChirho = {
		schema_version_chirho: 1,
		source_plan_chirho: planPinChirho,
		source_inventory_chirho: inventoryPinChirho,
		output_home_chirho: 'workspace-chirho/video-chirho/output-chirho',
		entries_chirho: [entryChirho]
	};
	const optionsChirho = () => ({
		root_chirho: rootChirho,
		input_chirho: jsonChirho('inputs-chirho/compose-chirho.json', inputChirho)
	});
	return {
		rootChirho,
		eventsChirho,
		clipChirho,
		jobChirho,
		audioChirho,
		sourceChirho,
		reviewChirho,
		inputChirho,
		entryChirho,
		optionsChirho,
		writeChirho,
		jsonChirho
	};
}

function reconciledFixtureChirho(errorCodeChirho = 'concurrentRequestLimitExceeded') {
	const valueChirho = fixtureChirho(),
		eventHashChirho = (rowChirho: unknown) => hashChirho(JSON.stringify(rowChirho));
	const requestedChirho = { ...valueChirho.eventsChirho[0], at_chirho: '2026-01-01T00:00:00Z' };
	const refusedChirho = {
		...requestedChirho,
		state_chirho: 'refused_chirho',
		at_chirho: '2026-01-01T00:00:01Z',
		http_status_chirho: 400,
		error_codes_chirho: [errorCodeChirho]
	};
	const receivedChirho = { ...valueChirho.eventsChirho[1], at_chirho: '2026-01-01T00:01:00Z' },
		savedChirho = { ...valueChirho.eventsChirho[2], at_chirho: '2026-01-01T00:01:01Z' };
	const originalBytesChirho = [requestedChirho, refusedChirho]
		.map((rowChirho) => JSON.stringify(rowChirho) + '\n')
		.join('');
	const originalPathChirho = 'inputs-chirho/original-journal-chirho.jsonl';
	valueChirho.writeChirho(originalPathChirho, originalBytesChirho);
	const combinedChirho = [requestedChirho, refusedChirho, receivedChirho, savedChirho];
	const journalPathChirho = 'inputs-chirho/reconciled-journal-chirho.jsonl';
	const commitJournalChirho = () => {
		const bytesChirho = combinedChirho
			.map((rowChirho) => JSON.stringify(rowChirho) + '\n')
			.join('');
		valueChirho.writeChirho(journalPathChirho, bytesChirho);
		valueChirho.entryChirho.journal_chirho = {
			path_chirho: journalPathChirho,
			sha256_chirho: hashChirho(bytesChirho)
		};
	};
	commitJournalChirho();
	const reconciliationChirho = {
		kind_chirho: 'original_uuid_completion_after_http400_chirho',
		lesson_id_chirho: valueChirho.jobChirho.lesson_id_chirho,
		plan_sha256_chirho: requestedChirho.plan_sha256_chirho,
		scene_sha256_chirho: valueChirho.jobChirho.scene_chirho.sha256_chirho,
		task_uuid_chirho: requestedChirho.task_uuid_chirho,
		original_journal_chirho: {
			path_chirho: originalPathChirho,
			sha256_chirho: hashChirho(originalBytesChirho)
		},
		requested_event_sha256_chirho: eventHashChirho(requestedChirho),
		refused_event_sha256s_chirho: [eventHashChirho(refusedChirho)],
		received_event_sha256_chirho: eventHashChirho(receivedChirho),
		saved_event_sha256_chirho: eventHashChirho(savedChirho),
		raw_clip_sha256_chirho: valueChirho.reviewChirho.raw_clip_sha256_chirho,
		raw_clip_bytes_chirho: savedChirho.bytes_chirho
	};
	valueChirho.entryChirho.reconciliation_chirho = valueChirho.jsonChirho(
		'inputs-chirho/reconciliation-chirho.json',
		reconciliationChirho
	);
	return {
		...valueChirho,
		combinedChirho,
		commitJournalChirho,
		originalPathChirho,
		originalBytesChirho
	};
}

describe.sequential('saved opening composition', () => {
	for (const humanChirho of [false, true])
		it(
			humanChirho
				? 'copies the exact human source window/licence while encoding the full hosted MP3'
				: 'binds the synthetic descriptor and CC BY4 soundtrack, without a human fallback',
			async () => {
				const valueChirho = fixtureChirho(humanChirho),
					optionsChirho = valueChirho.optionsChirho();
				const resultChirho = await composeOpeningsChirho(optionsChirho);
				expect(resultChirho.composed_chirho).toBe(1);
				expect(resultChirho.new_provider_requests_chirho).toBe(0);
				const recordChirho = JSON.parse(
					readFileSyncChirho(
						joinChirho(valueChirho.rootChirho, resultChirho.records_path_chirho),
						'utf8'
					)
				).videos_chirho[0];
				const proofChirho = JSON.parse(
					readFileSyncChirho(
						joinChirho(valueChirho.rootChirho, resultChirho.proofs_chirho[0].path_chirho),
						'utf8'
					)
				);
				expect(
					validVerseVideoChirho(
						recordChirho,
						valueChirho.jobChirho.lesson_id_chirho,
						valueChirho.jobChirho.canonical_sha256_chirho,
						valueChirho.jobChirho.scene_chirho.sha256_chirho
					)
				).toBe(true);
				expect(sameEmbeddedReadingChirho(recordChirho, valueChirho.clipChirho)).toBe(true);
				expect(proofChirho.soundtrack_correlation_chirho).toBeGreaterThanOrEqual(0.998);
				expect(Math.abs(proofChirho.lag_ms_chirho)).toBeLessThanOrEqual(10);
				expect(proofChirho.full_decode_chirho).toBe(true);
				expect(
					proofChirho.probe_chirho.streams.find(
						(rowChirho: { codec_type: string }) => rowChirho.codec_type === 'video'
					).nb_read_frames
				).toBe('48');
				expect(proofChirho.audio_chirho).toEqual(valueChirho.clipChirho);
				if (humanChirho) {
					expect(recordChirho.embedded_reading_chirho).toEqual(valueChirho.sourceChirho);
					expect(recordChirho.license_chirho).toBe('CC BY-SA 3.0');
					expect(recordChirho.embedded_clip_chirho).toBeUndefined();
				} else {
					expect(recordChirho.embedded_reading_chirho).toBeNull();
					expect(recordChirho.embedded_clip_chirho.duration_chirho).toBe(
						valueChirho.clipChirho.duration_chirho
					);
					expect(recordChirho.embedded_clip_chirho.sha256_chirho).toBe(
						valueChirho.clipChirho.sha256_chirho
					);
					expect(recordChirho.license_chirho).toBe('CC BY 4.0');
				}
				vi.stubEnv('PATH', '/no-renderer-chirho');
				const replayChirho = await composeOpeningsChirho(optionsChirho);
				expect(replayChirho.composed_chirho).toBe(0);
				expect(replayChirho.replayed_chirho).toBe(1);
			}
		);
	it('requires the reviewed original raw bytes and current selected audio before creating any output', async () => {
		const valueChirho = fixtureChirho();
		valueChirho.reviewChirho.accepted_for_composition_chirho = false;
		valueChirho.entryChirho.raw_frame_review_chirho = valueChirho.jsonChirho(
			'inputs-chirho/review-chirho.json',
			valueChirho.reviewChirho
		);
		await expect(composeOpeningsChirho(valueChirho.optionsChirho())).rejects.toThrow(
			'frame review'
		);
		expect(
			existsSyncChirho(
				joinChirho(valueChirho.rootChirho, valueChirho.inputChirho.output_home_chirho)
			)
		).toBe(false);
		valueChirho.reviewChirho.accepted_for_composition_chirho = true;
		valueChirho.entryChirho.raw_frame_review_chirho = valueChirho.jsonChirho(
			'inputs-chirho/review-chirho.json',
			valueChirho.reviewChirho
		);
		const preferredChirho: RecordingChirho = {
			...valueChirho.clipChirho,
			recipe_id_chirho: undefined,
			synthesis_text_chirho: undefined,
			review_chirho: 'approved',
			sha256_chirho: 'f'.repeat(64),
			asset_path_chirho: `/audio-chirho/sha256-chirho/${'f'.repeat(64)}-chirho.mp3`
		};
		valueChirho.audioChirho.clips_chirho.unshift(preferredChirho);
		valueChirho.entryChirho.audio_chapter_chirho = valueChirho.jsonChirho(
			'inputs-chirho/audio-chirho.json',
			valueChirho.audioChirho
		);
		await expect(composeOpeningsChirho(valueChirho.optionsChirho())).rejects.toThrow(
			'selected another'
		);
		expect(
			existsSyncChirho(
				joinChirho(valueChirho.rootChirho, valueChirho.inputChirho.output_home_chirho)
			)
		).toBe(false);
	});
	it('rejects changed original clip or scene bytes and a rehashed different canonical source', async () => {
		const valueChirho = fixtureChirho();
		valueChirho.writeChirho(valueChirho.entryChirho.raw_clip_path_chirho, 'changed raw bytes');
		await expect(composeOpeningsChirho(valueChirho.optionsChirho())).rejects.toThrow(
			'Original saved raw clip changed'
		);
		valueChirho.writeChirho(valueChirho.entryChirho.scene_path_chirho, 'changed scene bytes');
		await expect(composeOpeningsChirho(valueChirho.optionsChirho())).rejects.toThrow(
			'scene bytes differ'
		);
		expect(
			existsSyncChirho(
				joinChirho(valueChirho.rootChirho, valueChirho.inputChirho.output_home_chirho)
			)
		).toBe(false);
		const canonicalChirho = fixtureChirho(),
			contentChirho = JSON.parse(
				readFileSyncChirho(
					joinChirho(
						canonicalChirho.rootChirho,
						canonicalChirho.entryChirho.content_chapter_chirho.path_chirho
					),
					'utf8'
				)
			);
		contentChirho.verses_chirho[0].canonical_text_chirho = 'different source';
		canonicalChirho.entryChirho.content_chapter_chirho = canonicalChirho.jsonChirho(
			'inputs-chirho/content-chirho.json',
			contentChirho
		);
		canonicalChirho.audioChirho.content_sha256_chirho =
			canonicalChirho.entryChirho.content_chapter_chirho.sha256_chirho;
		canonicalChirho.entryChirho.audio_chapter_chirho = canonicalChirho.jsonChirho(
			'inputs-chirho/audio-chirho.json',
			canonicalChirho.audioChirho
		);
		await expect(composeOpeningsChirho(canonicalChirho.optionsChirho())).rejects.toThrow(
			'canonical verse or scene changed'
		);
	});
	it('does not overwrite or rerender a partial output, and refuses a changed source MP3', async () => {
		const valueChirho = fixtureChirho(),
			directoryChirho = valueChirho.inputChirho.output_home_chirho + '/matt-1-1-chirho';
		valueChirho.writeChirho(directoryChirho + '/intent-chirho.json', 'original partial intent');
		vi.stubEnv('PATH', '/no-renderer-chirho');
		await expect(composeOpeningsChirho(valueChirho.optionsChirho())).rejects.toThrow(
			'Partial composition'
		);
		expect(
			readFileSyncChirho(
				joinChirho(valueChirho.rootChirho, directoryChirho + '/intent-chirho.json'),
				'utf8'
			)
		).toBe('original partial intent');
		rmSyncChirho(joinChirho(valueChirho.rootChirho, valueChirho.inputChirho.output_home_chirho), {
			recursive: true
		});
		vi.unstubAllEnvs();
		execFileSyncChirho('ffmpeg', [
			'-v',
			'error',
			'-nostdin',
			'-y',
			'-f',
			'lavfi',
			'-i',
			'aevalsrc=0.3*sin(2*PI*880*t)*(0.5+0.5*sin(2*PI*t)):s=44100:d=2',
			'-ac',
			'1',
			'-b:a',
			'96k',
			joinChirho(valueChirho.rootChirho, valueChirho.entryChirho.audio_path_chirho)
		]);
		await expect(composeOpeningsChirho(valueChirho.optionsChirho())).rejects.toThrow(
			'source MP3 bytes differ'
		);
	});
	for (const humanChirho of [false, true])
		it(
			humanChirho
				? 'human reviewed prefix keeps original source window and complete soundtrack'
				: 'synthetic reviewed prefix keeps original bytes and complete soundtrack',
			async () => {
				const valueChirho = fixtureChirho(humanChirho, true),
					originalChirho = readFileSyncChirho(
						joinChirho(valueChirho.rootChirho, valueChirho.entryChirho.raw_clip_path_chirho)
					);
				const colorsChirho = (pathChirho: string) =>
					execFileSyncChirho('ffmpeg', [
						'-v',
						'error',
						'-nostdin',
						'-i',
						joinChirho(valueChirho.rootChirho, pathChirho),
						'-vf',
						'scale=1:1',
						'-pix_fmt',
						'rgb24',
						'-f',
						'rawvideo',
						'-'
					]);
				const rawColorsChirho = colorsChirho(valueChirho.entryChirho.raw_clip_path_chirho);
				expect(rawColorsChirho[rawColorsChirho.length - 3]).toBeGreaterThan(200);
				for (const endChirho of [18, 2]) {
					valueChirho.reviewChirho.retained_frame_range_chirho = {
						start_chirho: 0,
						end_chirho: endChirho
					};
					valueChirho.entryChirho.raw_frame_review_chirho = valueChirho.jsonChirho(
						'inputs-chirho/review-chirho.json',
						valueChirho.reviewChirho
					);
					valueChirho.inputChirho.output_home_chirho = `workspace-chirho/video-chirho/prefix-${endChirho}-chirho`;
					const resultChirho = await composeOpeningsChirho(valueChirho.optionsChirho()),
						proofChirho = JSON.parse(
							readFileSyncChirho(
								joinChirho(valueChirho.rootChirho, resultChirho.proofs_chirho[0].path_chirho),
								'utf8'
							)
						);
					expect(proofChirho.raw_clip_sha256_chirho).toBe(hashChirho(originalChirho));
					expect(proofChirho.raw_frame_count_chirho).toBe(24);
					expect(proofChirho.retained_frame_range_chirho).toEqual({
						start_chirho: 0,
						end_chirho: endChirho
					});
					expect(proofChirho.retained_frame_count_chirho).toBe(endChirho);
					expect(proofChirho.audio_chirho).toEqual(valueChirho.clipChirho);
					expect(proofChirho.video_chirho.duration_chirho).toBe(2);
					expect(proofChirho.soundtrack_correlation_chirho).toBeGreaterThanOrEqual(0.998);
					const outputColorsChirho = colorsChirho(
						`${valueChirho.inputChirho.output_home_chirho}/${valueChirho.jobChirho.lesson_id_chirho.toLowerCase().replaceAll('.', '-')}-chirho/verse-chirho.mp4`
					);
					expect(outputColorsChirho.length / 3).toBe(48);
					const redsChirho = Array.from(
						{ length: 48 },
						(_, indexChirho) => outputColorsChirho[indexChirho * 3]
					);
					expect(Math.max(...redsChirho)).toBeLessThan(50);
					if (endChirho === 2) {
						expect(outputColorsChirho[2]).toBeGreaterThan(180);
						expect(outputColorsChirho[outputColorsChirho.length - 2]).toBeGreaterThan(90);
					}
					expect(
						readFileSyncChirho(
							joinChirho(valueChirho.rootChirho, valueChirho.entryChirho.raw_clip_path_chirho)
						)
					).toEqual(originalChirho);
				}
			}
		);
	it('refuses invalid or unreviewed retained ranges before writing any output', async () => {
		const valueChirho = fixtureChirho();
		for (const rangeChirho of [
			null,
			{ start_chirho: -1, end_chirho: 18 },
			{ start_chirho: 0, end_chirho: 1 },
			{ start_chirho: 0, end_chirho: 25 },
			{ start_chirho: 0.5, end_chirho: 18 },
			{ start_chirho: 9, end_chirho: 8 },
			{ start_chirho: 0, end_chirho: null }
		]) {
			valueChirho.reviewChirho.retained_frame_range_chirho = rangeChirho;
			valueChirho.entryChirho.raw_frame_review_chirho = valueChirho.jsonChirho(
				'inputs-chirho/review-chirho.json',
				valueChirho.reviewChirho
			);
			await expect(composeOpeningsChirho(valueChirho.optionsChirho())).rejects.toThrow(
				'retained frame range'
			);
			expect(
				existsSyncChirho(
					joinChirho(valueChirho.rootChirho, valueChirho.inputChirho.output_home_chirho)
				)
			).toBe(false);
		}
	});
	it('reviewed spatial crop excludes a bright edge while preserving original raw bytes and soundtrack', async () => {
		const valueChirho = fixtureChirho(false, false, 'edge_chirho'),
			originalChirho = readFileSyncChirho(
				joinChirho(valueChirho.rootChirho, valueChirho.entryChirho.raw_clip_path_chirho)
			);
		valueChirho.reviewChirho.retained_crop_chirho = {
			x_chirho: 16,
			y_chirho: 0,
			width_chirho: 112,
			height_chirho: 96
		};
		valueChirho.entryChirho.raw_frame_review_chirho = valueChirho.jsonChirho(
			'inputs-chirho/review-chirho.json',
			valueChirho.reviewChirho
		);
		const resultChirho = await composeOpeningsChirho(valueChirho.optionsChirho()),
			proofChirho = JSON.parse(
				readFileSyncChirho(
					joinChirho(valueChirho.rootChirho, resultChirho.proofs_chirho[0].path_chirho),
					'utf8'
				)
			);
		const pixelsChirho = (pathChirho: string) =>
			execFileSyncChirho(
				'ffmpeg',
				[
					'-v',
					'error',
					'-nostdin',
					'-i',
					joinChirho(valueChirho.rootChirho, pathChirho),
					'-pix_fmt',
					'rgb24',
					'-f',
					'rawvideo',
					'-'
				],
				{ maxBuffer: 16 * 1024 ** 2 }
			);
		const originalPixelsChirho = pixelsChirho(valueChirho.entryChirho.raw_clip_path_chirho),
			outputPixelsChirho = pixelsChirho(
				`${valueChirho.inputChirho.output_home_chirho}/matt-1-1-chirho/verse-chirho.mp4`
			);
		expect(originalPixelsChirho[0]).toBeGreaterThan(200);
		let maximumRedChirho = 0;
		for (let indexChirho = 0; indexChirho < outputPixelsChirho.length; indexChirho += 3)
			maximumRedChirho = Math.max(maximumRedChirho, outputPixelsChirho[indexChirho]);
		expect(maximumRedChirho).toBeLessThan(50);
		expect(outputPixelsChirho.length / (128 * 96 * 3)).toBe(48);
		expect(proofChirho.retained_crop_chirho).toEqual(valueChirho.reviewChirho.retained_crop_chirho);
		expect(proofChirho.raw_clip_sha256_chirho).toBe(hashChirho(originalChirho));
		expect(proofChirho.raw_frame_count_chirho).toBe(24);
		expect(proofChirho.soundtrack_correlation_chirho).toBeGreaterThanOrEqual(0.998);
		expect(proofChirho.audio_chirho).toEqual(valueChirho.clipChirho);
		expect(
			readFileSyncChirho(
				joinChirho(valueChirho.rootChirho, valueChirho.entryChirho.raw_clip_path_chirho)
			)
		).toEqual(originalChirho);
	});
	it('reviewed three-frame prefix has a centered gentle push reaching its endpoint with exact frames and sound', async () => {
		const valueChirho = fixtureChirho(false, false, 'zoom_chirho');
		valueChirho.reviewChirho.retained_frame_range_chirho = { start_chirho: 0, end_chirho: 3 };
		valueChirho.reviewChirho.camera_end_zoom_chirho = 1.06;
		valueChirho.entryChirho.raw_frame_review_chirho = valueChirho.jsonChirho(
			'inputs-chirho/review-chirho.json',
			valueChirho.reviewChirho
		);
		const originalChirho = readFileSyncChirho(
				joinChirho(valueChirho.rootChirho, valueChirho.entryChirho.raw_clip_path_chirho)
			),
			resultChirho = await composeOpeningsChirho(valueChirho.optionsChirho()),
			proofChirho = JSON.parse(
				readFileSyncChirho(
					joinChirho(valueChirho.rootChirho, resultChirho.proofs_chirho[0].path_chirho),
					'utf8'
				)
			);
		const pixelsChirho = execFileSyncChirho(
			'ffmpeg',
			[
				'-v',
				'error',
				'-nostdin',
				'-i',
				joinChirho(
					valueChirho.rootChirho,
					`${valueChirho.inputChirho.output_home_chirho}/matt-1-1-chirho/verse-chirho.mp4`
				),
				'-pix_fmt',
				'rgb24',
				'-f',
				'rawvideo',
				'-'
			],
			{ maxBuffer: 16 * 1024 ** 2 }
		);
		const centersChirho: number[] = [];
		const widthsChirho = Array.from({ length: 48 }, (_, frameChirho) => {
			let widthChirho = 0,
				leftChirho = 128,
				rightChirho = -1;
			for (let xChirho = 0; xChirho < 128; xChirho++) {
				const indexChirho = (frameChirho * 128 * 96 + 48 * 128 + xChirho) * 3;
				if (pixelsChirho[indexChirho] > 180 && pixelsChirho[indexChirho + 1] > 180) {
					widthChirho++;
					leftChirho = Math.min(leftChirho, xChirho);
					rightChirho = Math.max(rightChirho, xChirho);
				}
			}
			centersChirho.push((leftChirho + rightChirho) / 2);
			return widthChirho;
		});
		expect(pixelsChirho.length / (128 * 96 * 3)).toBe(48);
		expect(widthsChirho[0]).toBe(64);
		expect(widthsChirho[47]).toBeGreaterThanOrEqual(67);
		expect(widthsChirho[47]).toBeLessThanOrEqual(70);
		expect(
			widthsChirho.every(
				(widthChirho, indexChirho) =>
					!indexChirho || widthChirho >= widthsChirho[indexChirho - 1] - 1
			)
		).toBe(true);
		expect(centersChirho.every((centerChirho) => Math.abs(centerChirho - 63.5) <= 2)).toBe(true);
		expect(proofChirho.camera_end_zoom_chirho).toBe(1.06);
		expect(proofChirho.retained_frame_range_chirho).toEqual({ start_chirho: 0, end_chirho: 3 });
		expect(proofChirho.raw_clip_sha256_chirho).toBe(hashChirho(originalChirho));
		expect(proofChirho.soundtrack_correlation_chirho).toBeGreaterThanOrEqual(0.998);
		expect(proofChirho.audio_chirho).toEqual(valueChirho.clipChirho);
		expect(
			readFileSyncChirho(
				joinChirho(valueChirho.rootChirho, valueChirho.entryChirho.raw_clip_path_chirho)
			)
		).toEqual(originalChirho);
	});
	it('refuses invalid spatial crops and camera zoom before creating an output', async () => {
		const valueChirho = fixtureChirho();
		const cropsChirho = [
			null,
			{ x_chirho: 0, y_chirho: 0, width_chirho: 1, height_chirho: 96 },
			{ x_chirho: 1, y_chirho: 0, width_chirho: 126, height_chirho: 96 },
			{ x_chirho: -2, y_chirho: 0, width_chirho: 128, height_chirho: 96 },
			{ x_chirho: 0, y_chirho: 0, width_chirho: 130, height_chirho: 96 },
			{ x_chirho: 0, y_chirho: 0, width_chirho: 128, height_chirho: 98 },
			{ x_chirho: 0.5, y_chirho: 0, width_chirho: 126, height_chirho: 96 },
			{ x_chirho: 0, y_chirho: 0, width_chirho: 128, filter_chirho: 96 }
		];
		for (const cropChirho of cropsChirho) {
			valueChirho.reviewChirho.retained_crop_chirho = cropChirho;
			valueChirho.entryChirho.raw_frame_review_chirho = valueChirho.jsonChirho(
				'inputs-chirho/review-chirho.json',
				valueChirho.reviewChirho
			);
			await expect(composeOpeningsChirho(valueChirho.optionsChirho())).rejects.toThrow(
				'spatial crop'
			);
			expect(
				existsSyncChirho(
					joinChirho(valueChirho.rootChirho, valueChirho.inputChirho.output_home_chirho)
				)
			).toBe(false);
		}
		valueChirho.reviewChirho.retained_crop_chirho = undefined;
		for (const zoomChirho of [null, '1.06', 0.99, 1.081, Number.POSITIVE_INFINITY]) {
			valueChirho.reviewChirho.camera_end_zoom_chirho = zoomChirho;
			valueChirho.entryChirho.raw_frame_review_chirho = valueChirho.jsonChirho(
				'inputs-chirho/review-chirho.json',
				valueChirho.reviewChirho
			);
			await expect(composeOpeningsChirho(valueChirho.optionsChirho())).rejects.toThrow(
				'camera zoom'
			);
			expect(
				existsSyncChirho(
					joinChirho(valueChirho.rootChirho, valueChirho.inputChirho.output_home_chirho)
				)
			).toBe(false);
		}
	});
	it('accepts only explicit completion of the same originally refused UUID with untouched history', async () => {
		const valueChirho = reconciledFixtureChirho(),
			proofPinChirho = valueChirho.entryChirho.reconciliation_chirho;
		valueChirho.entryChirho.reconciliation_chirho = undefined;
		await expect(composeOpeningsChirho(valueChirho.optionsChirho())).rejects.toThrow(
			'explicit original-UUID reconciliation'
		);
		valueChirho.entryChirho.reconciliation_chirho = proofPinChirho;
		const resultChirho = await composeOpeningsChirho(valueChirho.optionsChirho()),
			proofChirho = JSON.parse(
				readFileSyncChirho(
					joinChirho(valueChirho.rootChirho, resultChirho.proofs_chirho[0].path_chirho),
					'utf8'
				)
			);
		expect(resultChirho.composed_chirho).toBe(1);
		expect(proofChirho.original_journal_sha256_chirho).toBe(
			hashChirho(valueChirho.originalBytesChirho)
		);
		expect(proofChirho.source_reconciliation_sha256_chirho).toBe(proofPinChirho?.sha256_chirho);
		expect(
			readFileSyncChirho(joinChirho(valueChirho.rootChirho, valueChirho.originalPathChirho), 'utf8')
		).toBe(valueChirho.originalBytesChirho);
		for (const mutationChirho of ['uuid', 'missing-refusal', 'other-error']) {
			const invalidChirho = reconciledFixtureChirho(
				mutationChirho === 'other-error' ? 'invalidTask' : 'concurrentRequestLimitExceeded'
			);
			if (mutationChirho === 'uuid')
				invalidChirho.combinedChirho[2].task_uuid_chirho = '22222222-2222-4222-8222-222222222222';
			else if (mutationChirho === 'missing-refusal') invalidChirho.combinedChirho.splice(1, 1);
			invalidChirho.commitJournalChirho();
			await expect(composeOpeningsChirho(invalidChirho.optionsChirho())).rejects.toThrow();
			expect(
				existsSyncChirho(
					joinChirho(invalidChirho.rootChirho, invalidChirho.inputChirho.output_home_chirho)
				)
			).toBe(false);
			expect(
				readFileSyncChirho(
					joinChirho(invalidChirho.rootChirho, invalidChirho.originalPathChirho),
					'utf8'
				)
			).toBe(invalidChirho.originalBytesChirho);
		}
	});
	it('refuses a seventh supplied job before any rendering or output mutation', async () => {
		const valueChirho = fixtureChirho();
		valueChirho.inputChirho.entries_chirho = Array.from({ length: 7 }, (_, indexChirho) => ({
			...valueChirho.entryChirho,
			lesson_id_chirho: `Matt.${indexChirho + 1}.1`
		}));
		await expect(composeOpeningsChirho(valueChirho.optionsChirho())).rejects.toThrow('one to six');
		expect(
			existsSyncChirho(
				joinChirho(valueChirho.rootChirho, valueChirho.inputChirho.output_home_chirho)
			)
		).toBe(false);
	});
});
