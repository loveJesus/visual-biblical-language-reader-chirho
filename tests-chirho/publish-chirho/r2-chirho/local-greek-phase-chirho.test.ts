// For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life. — John 3:16 (KJV)
import { afterEach, describe, expect, it, vi } from 'vitest';
import {
	mkdtemp as mkdtempChirho,
	mkdir as mkdirChirho,
	readFile as readFileChirho,
	writeFile as writeFileChirho,
	rm as rmChirho,
	realpath as realpathChirho
} from 'node:fs/promises';
import { join as joinChirho } from 'node:path';
import { tmpdir as tmpdirChirho } from 'node:os';
import { execFileSync as execFileSyncChirho } from 'node:child_process';
import fixturesChirho from '../../fixtures-chirho/audio-chirho/local-greek-verses-chirho.json';
import { sha256Chirho } from '../../../scripts-chirho/audio-chirho/audition_chirho';
import {
	journalPrefixChirho,
	validatePhaseJobChirho,
	type ImportInputChirho,
	type HandoffJobChirho
} from '../../../scripts-chirho/audio-chirho/local-greek-chirho/phase_chirho';
import {
	localGreekClipChirho,
	PREPARED_HOME_CHIRHO,
	RUN_HOME_CHIRHO
} from '../../../scripts-chirho/audio-chirho/local-greek-chirho/manifest_chirho';
import { installLocalGreekChirho } from '../../../scripts-chirho/audio-chirho/local-greek-chirho/install_chirho';

const requestsChirho = vi.hoisted(() => ({ callChirho: vi.fn() }));
vi.mock('../../../scripts-chirho/publish-chirho/r2-chirho/object-store-chirho', () => ({
	objectRequestChirho: requestsChirho.callChirho
}));
const temporaryChirho: string[] = [];
afterEach(async () => {
	vi.unstubAllEnvs();
	vi.unstubAllGlobals();
	requestsChirho.callChirho.mockReset();
	for (const pathChirho of temporaryChirho.splice(0))
		await rmChirho(pathChirho, { recursive: true, force: true });
});

function phaseFixtureChirho() {
	const originalChirho = structuredClone(fixturesChirho[0].job_chirho);
	const jobChirho: Parameters<typeof validatePhaseJobChirho>[0] = {
		...structuredClone(originalChirho),
		chosen_chirho: {
			...originalChirho.chosen_chirho!,
			seed_chirho: 2,
			task_uuid_chirho: 'received-retake-chirho'
		},
		attempts_chirho: [
			{ task_uuid_chirho: 'first-received-chirho', kind_chirho: 'first', outcome_chirho: 'result' },
			{
				task_uuid_chirho: 'received-retake-chirho',
				kind_chirho: 'retake',
				outcome_chirho: 'result'
			}
		]
	};
	const oldChirho = { ...structuredClone(originalChirho), state_chirho: 'flagged' };
	const handoffChirho: HandoffJobChirho = {
		job_chirho: jobChirho.job_chirho,
		verse_id_chirho: jobChirho.verse_id_chirho,
		kind_chirho: 'retake_seed_2',
		take_sha256_chirho: jobChirho.chosen_chirho.sha256_chirho,
		raw_sha256_chirho: jobChirho.chosen_chirho.raw_sha256_chirho,
		cer_chirho: jobChirho.chosen_chirho.asr_chirho.cer_chirho
	};
	const journalChirho: Record<string, unknown>[] = [
		{
			event_chirho: 'request',
			task_uuid_chirho: 'received-retake-chirho',
			job_chirho: jobChirho.job_chirho,
			kind_chirho: 'retake',
			sent_chirho: jobChirho.sent_chirho
		},
		{
			...jobChirho.chosen_chirho,
			event_chirho: 'result',
			job_chirho: jobChirho.job_chirho,
			sent_sha256_chirho: jobChirho.sent_sha256_chirho,
			cost_chirho: 0
		}
	];
	return { jobChirho, oldChirho, handoffChirho, journalChirho, originalChirho };
}

describe('fixed local Greek phase evidence', () => {
	it('keeps the old journal identity despite later successful, unknown and torn-tail appends', () => {
		const oldChirho = Buffer.from('{"event_chirho":"result"}\n');
		for (const tailChirho of [
			'',
			'{"event_chirho":"request"}\n',
			'{"event_chirho":"unknown"}\n{"torn_chirho":'
		])
			expect(
				journalPrefixChirho(
					Buffer.concat([oldChirho, Buffer.from(tailChirho)]),
					sha256Chirho(oldChirho)
				)
			).toEqual(oldChirho);
		expect(() => journalPrefixChirho(Buffer.from('changed'), sha256Chirho(oldChirho))).toThrow(
			/prefix/
		);
	});
	it('accepts an exact received retake while the old v1 entry point still refuses seed2', async () => {
		const rowChirho = phaseFixtureChirho();
		expect(
			validatePhaseJobChirho(
				rowChirho.jobChirho,
				rowChirho.handoffChirho,
				rowChirho.oldChirho,
				rowChirho.originalChirho,
				rowChirho.journalChirho
			)
		).toBe(2);
		const chapterChirho = JSON.parse(
			await readFileChirho(
				new URL(
					'../../../static/content-chirho/' + rowChirho.jobChirho.content_path_chirho,
					import.meta.url
				),
				'utf8'
			)
		);
		const lessonChirho = chapterChirho.verses_chirho.find(
			(verseChirho: { id_chirho: string }) =>
				verseChirho.id_chirho === rowChirho.jobChirho.verse_id_chirho
		);
		expect(() =>
			localGreekClipChirho(
				rowChirho.jobChirho,
				fixturesChirho[0].delivery_chirho,
				lessonChirho,
				rowChirho.jobChirho.content_sha256_chirho
			)
		).toThrow(/identity differs/);
	});
	it('withholds prior1084done, flagged, unscreened, changed source, wrong ASR and incomplete/unknown attempts', () => {
		for (const kindChirho of [
			'prior-done',
			'flagged',
			'unscreened',
			'source',
			'asr',
			'unknown',
			'missing-result',
			'wrong-seed'
		]) {
			const rowChirho = phaseFixtureChirho();
			if (kindChirho === 'prior-done') rowChirho.oldChirho.state_chirho = 'done';
			if (kindChirho === 'flagged') rowChirho.jobChirho.chosen_chirho.flag_chirho = 'flagged';
			if (kindChirho === 'unscreened') rowChirho.jobChirho.state_chirho = 'unscreened';
			if (kindChirho === 'source') rowChirho.jobChirho.sent_chirho += ' changed';
			if (kindChirho === 'asr')
				rowChirho.jobChirho.chosen_chirho.asr_chirho.sha256_chirho = '0'.repeat(64);
			if (kindChirho === 'unknown')
				rowChirho.jobChirho.attempts_chirho[1].outcome_chirho = 'unknown';
			if (kindChirho === 'missing-result') rowChirho.journalChirho.pop();
			if (kindChirho === 'wrong-seed') rowChirho.jobChirho.chosen_chirho.seed_chirho = 3;
			expect(() =>
				validatePhaseJobChirho(
					rowChirho.jobChirho,
					rowChirho.handoffChirho,
					rowChirho.oldChirho,
					rowChirho.originalChirho,
					rowChirho.journalChirho
				)
			).toThrow();
		}
	});
	it('accepts a received seed1 first take only for a previously pending job', () => {
		const rowChirho = phaseFixtureChirho();
		rowChirho.jobChirho.chosen_chirho.seed_chirho = 1;
		rowChirho.jobChirho.attempts_chirho = [
			{ task_uuid_chirho: 'received-retake-chirho', kind_chirho: 'first', outcome_chirho: 'result' }
		];
		const handoffChirho = { ...rowChirho.handoffChirho, kind_chirho: 'first_take' as const };
		const oldChirho = { ...rowChirho.oldChirho, state_chirho: 'pending', chosen_chirho: null };
		rowChirho.journalChirho[0].kind_chirho = 'first';
		rowChirho.journalChirho[1].seed_chirho = 1;
		expect(
			validatePhaseJobChirho(
				rowChirho.jobChirho,
				handoffChirho,
				oldChirho,
				rowChirho.originalChirho,
				rowChirho.journalChirho
			)
		).toBe(1);
	});
});

async function installFixtureChirho() {
	const rootChirho = await realpathChirho(
		await mkdtempChirho(joinChirho(tmpdirChirho(), 'hinneh-greek-phase-chirho-'))
	);
	temporaryChirho.push(rootChirho);
	const jobChirho = structuredClone(fixturesChirho[0].job_chirho);
	// Real temporary codecs exercise archive integrity; this tone is not a speech acceptance test.
	const toneChirho = joinChirho(rootChirho, 'tone-chirho');
	execFileSyncChirho('ffmpeg', [
		'-v',
		'error',
		'-nostdin',
		'-n',
		'-f',
		'lavfi',
		'-i',
		'sine=frequency=440:duration=0.2',
		'-ar',
		'24000',
		'-ac',
		'1',
		'-c:a',
		'libmp3lame',
		'-b:a',
		'64k',
		toneChirho + '.mp3',
		'-ar',
		'24000',
		'-ac',
		'1',
		'-c:a',
		'flac',
		toneChirho + '.flac',
		'-ar',
		'44100',
		'-ac',
		'1',
		'-c:a',
		'libmp3lame',
		'-b:a',
		'64k',
		toneChirho + '-delivery.mp3'
	]);
	const mp3Chirho = await readFileChirho(toneChirho + '.mp3');
	const deliveryBytesChirho = await readFileChirho(toneChirho + '-delivery.mp3');
	const rawChirho = await readFileChirho(toneChirho + '.flac');
	jobChirho.chosen_chirho!.sha256_chirho = sha256Chirho(mp3Chirho);
	jobChirho.chosen_chirho!.asr_chirho.sha256_chirho = sha256Chirho(mp3Chirho);
	jobChirho.chosen_chirho!.bytes_chirho = mp3Chirho.length;
	jobChirho.chosen_chirho!.seconds_chirho = 0.2;
	jobChirho.chosen_chirho!.raw_sha256_chirho = sha256Chirho(rawChirho);
	const deliveryChirho = {
		...fixturesChirho[0].delivery_chirho,
		sha256_chirho: sha256Chirho(deliveryBytesChirho),
		bytes_chirho: deliveryBytesChirho.length,
		duration_chirho: 0.2,
		original_mp3_sha256_chirho: sha256Chirho(mp3Chirho),
		raw_flac_sha256_chirho: sha256Chirho(rawChirho)
	};
	async function saveChirho(pathChirho: string, valueChirho: string | Buffer) {
		await mkdirChirho(joinChirho(rootChirho, pathChirho, '..'), { recursive: true });
		await writeFileChirho(joinChirho(rootChirho, pathChirho), valueChirho);
	}
	const canonicalChirho = await readFileChirho(
		new URL('../../../static/content-chirho/' + jobChirho.content_path_chirho, import.meta.url)
	);
	await saveChirho('static/content-chirho/' + jobChirho.content_path_chirho, canonicalChirho);
	await saveChirho(deliveryChirho.path_chirho, deliveryBytesChirho);
	await saveChirho(`${RUN_HOME_CHIRHO}/${jobChirho.chosen_chirho!.path_chirho}`, mp3Chirho);
	await saveChirho(`${RUN_HOME_CHIRHO}/${jobChirho.chosen_chirho!.raw_path_chirho}`, rawChirho);
	const evidenceChirho = Buffer.from('immutable-local-phase-evidence-chirho');
	await saveChirho(`${PREPARED_HOME_CHIRHO}/evidence-chirho.json`, evidenceChirho);
	const manifestShaChirho = sha256Chirho(evidenceChirho);
	await saveChirho(
		`${PREPARED_HOME_CHIRHO}/prepared-chirho.json`,
		JSON.stringify({
			manifest_sha256_chirho: manifestShaChirho,
			recordings_chirho: [deliveryChirho]
		})
	);
	const [bookChirho, chapterChirho] = jobChirho.verse_id_chirho.split('.');
	const chapterPathChirho = '/audio-chirho/' + jobChirho.content_path_chirho;
	const originalChapterChirho = JSON.stringify({
		schema_version_chirho: 1,
		book_id_chirho: bookChirho,
		chapter_chirho: Number(chapterChirho),
		content_path_chirho: '/content-chirho/' + jobChirho.content_path_chirho,
		content_sha256_chirho: jobChirho.content_sha256_chirho,
		clips_chirho: [{ id_chirho: 'saved-word-chirho', token_id_chirho: 'word-chirho' }],
		readings_chirho: []
	});
	await saveChirho('static' + chapterPathChirho, originalChapterChirho);
	await saveChirho(
		'static/audio-chirho/manifest-chirho.json',
		JSON.stringify({
			books_chirho: {
				[bookChirho]: {
					chapters_chirho: [
						{ path_chirho: chapterPathChirho, sha256_chirho: sha256Chirho(originalChapterChirho) }
					]
				}
			}
		})
	);
	const inputChirho: ImportInputChirho = {
		manifest_chirho: {
			plan_sha256_chirho: manifestShaChirho,
			journal_sha256_chirho: manifestShaChirho,
			jobs_chirho: [jobChirho]
		},
		manifest_sha256_chirho: manifestShaChirho,
		prepared_home_chirho: PREPARED_HOME_CHIRHO,
		expected_jobs_chirho: 1,
		flagged_excluded_chirho: 0,
		archive_inputs_chirho: [
			{
				path_chirho: `${PREPARED_HOME_CHIRHO}/evidence-chirho.json`,
				sha256_chirho: manifestShaChirho,
				extension_chirho: 'json'
			}
		],
		clip_chirho: localGreekClipChirho
	};
	vi.stubEnv('CLOUDFLARE_GLOBAL_API_MAIN_ACCOUNT_ID_CHIRHO', '0'.repeat(28) + '84bd');
	vi.stubEnv('CLOUDFLARE_GLOBAL_API_EMAIL_CHIRHO', 'fixture-chirho@example.invalid');
	vi.stubEnv('CLOUDFLARE_GLOBAL_API_KEY_CHIRHO', 'fixture-only-chirho');
	vi.stubGlobal('fetch', () => {
		throw Error('No real network is permitted');
	});
	const objectsChirho = new Map<string, Uint8Array>([
		[`provenance-audio-chirho/sha256-chirho/${manifestShaChirho}.json`, evidenceChirho],
		[`provenance-audio-chirho/sha256-chirho/${sha256Chirho(mp3Chirho)}.mp3`, mp3Chirho],
		[`provenance-audio-chirho/sha256-chirho/${sha256Chirho(rawChirho)}.flac`, rawChirho],
		[`audio-chirho/sha256-chirho/${sha256Chirho(deliveryBytesChirho)}.mp3`, deliveryBytesChirho]
	]);
	return {
		rootChirho,
		inputChirho,
		chapterPathChirho,
		originalChapterChirho,
		objectsChirho,
		evidenceKeyChirho: `provenance-audio-chirho/sha256-chirho/${manifestShaChirho}.json`
	};
}

describe('the shared phase archive/catalogue transaction', () => {
	it('does not publish after a corrupt archive readback', async () => {
		const rowChirho = await installFixtureChirho();
		requestsChirho.callChirho.mockImplementation(
			async (_methodChirho: string, keyChirho: string) => {
				const valueChirho = rowChirho.objectsChirho.get(keyChirho)!;
				return new Response(
					keyChirho === rowChirho.evidenceKeyChirho
						? new Uint8Array(valueChirho.length)
						: new Uint8Array(valueChirho)
				);
			}
		);
		await expect(
			installLocalGreekChirho(rowChirho.inputChirho, true, rowChirho.rootChirho)
		).rejects.toThrow(/readback differs/);
		expect(
			await readFileChirho(
				joinChirho(rowChirho.rootChirho, 'static' + rowChirho.chapterPathChirho),
				'utf8'
			)
		).toBe(rowChirho.originalChapterChirho);
	});
	it('archives exact originals/delivery once and completed replay uses zero provider calls', async () => {
		const rowChirho = await installFixtureChirho();
		const objectsChirho = new Map<string, Uint8Array>();
		requestsChirho.callChirho.mockImplementation(
			async (methodChirho: string, keyChirho: string, bytesChirho?: Uint8Array) => {
				if (methodChirho === 'PUT') {
					objectsChirho.set(keyChirho, new Uint8Array(bytesChirho!));
					return new Response(null);
				}
				return objectsChirho.has(keyChirho)
					? new Response(new Uint8Array(objectsChirho.get(keyChirho)!))
					: new Response(null, { status: 404 });
			}
		);
		await installLocalGreekChirho(rowChirho.inputChirho, true, rowChirho.rootChirho);
		const installedChirho = await readFileChirho(
			joinChirho(rowChirho.rootChirho, 'static' + rowChirho.chapterPathChirho)
		);
		expect(JSON.parse(installedChirho.toString()).clips_chirho).toHaveLength(2);
		requestsChirho.callChirho.mockClear();
		requestsChirho.callChirho.mockImplementation(() => {
			throw Error('Completed replay must not contact a provider');
		});
		await installLocalGreekChirho(rowChirho.inputChirho, true, rowChirho.rootChirho);
		expect(requestsChirho.callChirho).not.toHaveBeenCalled();
		expect(
			await readFileChirho(joinChirho(rowChirho.rootChirho, 'static' + rowChirho.chapterPathChirho))
		).toEqual(installedChirho);
	});
});
