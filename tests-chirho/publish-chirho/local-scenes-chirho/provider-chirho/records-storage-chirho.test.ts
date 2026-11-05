// For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life. — John 3:16 (KJV)
import { afterEach, describe, expect, it } from 'vitest';
import { execFileSync as execFileSyncChirho } from 'node:child_process';
import {
	mkdtemp as mkdtempChirho,
	mkdir as mkdirChirho,
	readFile as readFileChirho,
	realpath as realpathChirho,
	rm as rmChirho,
	symlink as symlinkChirho,
	writeFile as writeFileChirho
} from 'node:fs/promises';
import { dirname as dirnameChirho, join as joinChirho } from 'node:path';
import { tmpdir as tmpdirChirho } from 'node:os';
import {
	BOOKS_CHIRHO,
	bookHomeChirho,
	loadBookChirho,
	requestHashChirho,
	STAGE_CHIRHO,
	type JobChirho
} from '../../../../scripts-chirho/publish-chirho/local-scenes-chirho/provider-chirho/records-chirho';
import {
	archiveCompletedChirho,
	inspectWebpChirho
} from '../../../../scripts-chirho/publish-chirho/local-scenes-chirho/provider-chirho/storage-chirho';
import { digestChirho } from '../../../../scripts-chirho/publish-chirho/r2-chirho/object-store-chirho';

import {
	installBookChirho,
	mergeScenesChirho,
	sceneForChirho
} from '../../../../scripts-chirho/publish-chirho/local-scenes-chirho/provider-chirho/install-chirho';
import {
	poolChirho,
	runChirho
} from '../../../../scripts-chirho/publish-chirho/local-scenes-chirho/provider-chirho/worker-chirho';
import { writeArtworkCatalogueChirho } from '../../../../scripts-chirho/publish-chirho/r2-chirho/catalogue-write-chirho';
import { readArtworkCatalogueChirho } from '../../../../scripts-chirho/publish-chirho/r2-chirho/catalogue-chirho';
import { MANIFEST_CHIRHO } from '../../../../scripts-chirho/publish-chirho/local-scenes-chirho/provider-chirho/records-chirho';

import { retireBookChirho } from '../../../../scripts-chirho/publish-chirho/local-scenes-chirho/provider-chirho/retire-chirho';

const rootsChirho: string[] = [];
afterEach(async () => {
	for (const rootChirho of rootsChirho.splice(0))
		await rmChirho(rootChirho, { recursive: true, force: true });
});
const bookChirho = BOOKS_CHIRHO.find((rowChirho) => rowChirho.id_chirho === 'Phlm')!;
const taskChirho = '10000000-0000-4000-8000-000000000001';
const imageChirho = '20000000-0000-4000-8000-000000000001';
async function fixtureChirho() {
	const rootChirho = await realpathChirho(
		await mkdtempChirho(joinChirho(tmpdirChirho(), 'provider-scene-chirho-'))
	);
	rootsChirho.push(rootChirho);
	const homeChirho = bookHomeChirho(bookChirho);
	async function putChirho(pathChirho: string, valueChirho: unknown, linesChirho = false) {
		await mkdirChirho(dirnameChirho(joinChirho(rootChirho, pathChirho)), { recursive: true });
		await writeFileChirho(
			joinChirho(rootChirho, pathChirho),
			linesChirho
				? (valueChirho as unknown[]).map((rowChirho) => JSON.stringify(rowChirho)).join('\n') + '\n'
				: JSON.stringify(valueChirho) + '\n'
		);
	}
	const verseChirho = {
		id_chirho: 'Phlm.1.1',
		reference_chirho: 'Philemon 1:1',
		language_chirho: 'grc',
		canonical_text_chirho: 'λόγος',
		tokens_chirho: [{ gloss_chirho: 'word' }]
	};
	const contentPathChirho = '/content-chirho/philemon-chirho/chapter-01-chirho.json';
	await putChirho('static' + contentPathChirho, {
		book_id_chirho: 'Phlm',
		verses_chirho: [verseChirho]
	});
	const contentShaChirho = digestChirho(
		await readFileChirho(joinChirho(rootChirho, 'static' + contentPathChirho))
	);
	await putChirho('static/content-chirho/philemon-chirho/manifest-chirho.json', {
		book_id_chirho: 'Phlm',
		chapters_chirho: [
			{
				number_chirho: 1,
				path_chirho: contentPathChirho,
				sha256_chirho: contentShaChirho,
				verse_count_chirho: 1
			}
		]
	});
	const snapshotPathChirho = `${homeChirho}/verses-chirho/chapter-001-verses-chirho.json`;
	await putChirho(snapshotPathChirho, [
		{
			verse_id_chirho: verseChirho.id_chirho,
			reference_chirho: verseChirho.reference_chirho,
			source_language_chirho: 'grc',
			word_glosses_in_source_order_chirho: 'word'
		}
	]);
	const sceneChirho = 'An ancient parchment scroll resting on a wooden table beside a small lamp.';
	const promptChirho =
		'Watercolor storybook illustration: ' +
		sceneChirho +
		' Soft ink lines, textured paper, warm gentle light.';
	await putChirho(
		`${homeChirho}/prompts-chirho/chapter-001-prompts-chirho.jsonl`,
		[
			{
				verse_id_chirho: verseChirho.id_chirho,
				scene_chirho: sceneChirho,
				gloss_echo_chirho: 'word',
				jesus_presence_chirho: 'absent'
			}
		],
		true
	);
	const jobChirho: JobChirho = {
		job_id_chirho: 'phlm-001-001',
		book_id_chirho: 'Phlm',
		chapter_chirho: 1,
		verse_id_chirho: verseChirho.id_chirho,
		prompt_chirho: promptChirho,
		prompt_sha256_chirho: digestChirho(promptChirho),
		jesus_presence_chirho: 'absent',
		seed_chirho: 57001001,
		steps_chirho: 4,
		width_chirho: 1024,
		height_chirho: 768,
		output_format_chirho: 'WEBP',
		output_quality_chirho: 45,
		output_chirho: `${homeChirho}/scenes-chirho/chapter-001/phlm-001-001-seed-57001001-schnell-chirho.webp`,
		snapshot_sha256_chirho: digestChirho(
			await readFileChirho(joinChirho(rootChirho, snapshotPathChirho))
		)
	};
	const bytesChirho = new TextEncoder().encode('exact provider bytes chirho');
	const shaChirho = digestChirho(bytesChirho);
	await putChirho(`${homeChirho}/jobs-chirho/chapter-001-jobs-chirho.jsonl`, [jobChirho], true);
	const resultChirho = {
		job_id_chirho: jobChirho.job_id_chirho,
		verse_id_chirho: jobChirho.verse_id_chirho,
		attempt_chirho: 1,
		task_uuid_chirho: taskChirho,
		image_uuid_chirho: imageChirho,
		provider_chirho: 'runware',
		model_chirho: 'runware:100@1',
		seed_returned_chirho: jobChirho.seed_chirho,
		output_sha256_chirho: shaChirho,
		output_chirho: jobChirho.output_chirho,
		bytes_chirho: bytesChirho.length,
		format_chirho: 'WEBP',
		output_quality_chirho: 45,
		width_px_chirho: 1024,
		height_px_chirho: 768,
		ok_chirho: true,
		cost_usd_chirho: 0.0006
	};
	await putChirho(
		`${homeChirho}/records-chirho/chapter-001-records-chirho.jsonl`,
		[resultChirho],
		true
	);
	const baseChirho = {
		job_id_chirho: jobChirho.job_id_chirho,
		attempt_chirho: 1,
		task_uuid_chirho: taskChirho
	};
	const eventsChirho = [
		{
			...baseChirho,
			state_chirho: 'requested',
			request_sha256_chirho: requestHashChirho(jobChirho, taskChirho)
		},
		{
			...baseChirho,
			state_chirho: 'received',
			image_uuid_chirho: imageChirho,
			cost_usd_chirho: 0.0006
		},
		{
			...baseChirho,
			state_chirho: 'saved',
			output_sha256_chirho: shaChirho,
			bytes_chirho: bytesChirho.length
		}
	];
	await putChirho(`${homeChirho}/records-chirho/journal-chirho.jsonl`, eventsChirho, true);
	await mkdirChirho(dirnameChirho(joinChirho(rootChirho, jobChirho.output_chirho)), {
		recursive: true
	});
	await writeFileChirho(joinChirho(rootChirho, jobChirho.output_chirho), bytesChirho);
	const completedChirho = (await loadBookChirho(rootChirho, bookChirho)).completed_chirho[0];
	return {
		rootChirho,
		homeChirho,
		putChirho,
		jobChirho,
		resultChirho,
		bytesChirho,
		completedChirho,
		eventsChirho,
		contentPathChirho
	};
}
describe('exact provider scene source and storage', () => {
	it('binds a saved request and never invents book completion', async () => {
		const fixtureValueChirho = await fixtureChirho();
		const resultChirho = await loadBookChirho(fixtureValueChirho.rootChirho, bookChirho);
		expect(resultChirho.completed_chirho).toHaveLength(1);
		expect(resultChirho.complete_chirho).toBe(false);
		expect(resultChirho.completed_chirho[0].canonical_sha256_chirho).toBe(digestChirho('λόγος'));
	});
	it('matches Python sorted ASCII JSON for the original request including Unicode', async () => {
		const fixtureValueChirho = await fixtureChirho();
		const jobChirho = {
			...fixtureValueChirho.jobChirho,
			prompt_chirho: 'A naïve café with a scroll.'
		};
		const expectedChirho = execFileSyncChirho(
			'python3',
			[
				'-c',
				'import hashlib,json,sys; print(hashlib.sha256(json.dumps(json.load(sys.stdin),sort_keys=True).encode()).hexdigest())'
			],
			{
				input: JSON.stringify({
					taskType: 'imageInference',
					taskUUID: taskChirho,
					model: 'runware:100@1',
					positivePrompt: jobChirho.prompt_chirho,
					width: 1024,
					height: 768,
					steps: 4,
					CFGScale: 1,
					seed: jobChirho.seed_chirho,
					numberResults: 1,
					outputType: 'URL',
					outputFormat: 'WEBP',
					outputQuality: 45,
					includeCost: true
				}),
				encoding: 'utf8'
			}
		).trim();
		expect(requestHashChirho(jobChirho, taskChirho)).toBe(expectedChirho);
	});
	it('accepts a hash-bound source chapter above 2 MiB but refuses above the reader ceiling', async () => {
		const valueChirho = await fixtureChirho();
		const sourcePathChirho = joinChirho(
			valueChirho.rootChirho,
			'static' + valueChirho.contentPathChirho
		);
		const sourceChirho = JSON.parse(await readFileChirho(sourcePathChirho, 'utf8'));
		const manifestPathChirho = 'static/content-chirho/philemon-chirho/manifest-chirho.json';
		const manifestChirho = JSON.parse(
			await readFileChirho(joinChirho(valueChirho.rootChirho, manifestPathChirho), 'utf8')
		);
		sourceChirho.padding_chirho = 'x'.repeat(2 * 1024 ** 2);
		await valueChirho.putChirho('static' + valueChirho.contentPathChirho, sourceChirho);
		manifestChirho.chapters_chirho[0].sha256_chirho = digestChirho(
			await readFileChirho(sourcePathChirho)
		);
		await valueChirho.putChirho(manifestPathChirho, manifestChirho);
		expect(
			(await loadBookChirho(valueChirho.rootChirho, bookChirho)).completed_chirho
		).toHaveLength(1);
		sourceChirho.padding_chirho = 'x'.repeat(4 * 1024 ** 2);
		await valueChirho.putChirho('static' + valueChirho.contentPathChirho, sourceChirho);
		await expect(loadBookChirho(valueChirho.rootChirho, bookChirho)).rejects.toThrow(
			'Owned record is oversized'
		);
	});
	it('refuses source drift and a changed gloss snapshot', async () => {
		const valueChirho = await fixtureChirho();
		await valueChirho.putChirho(
			`${valueChirho.homeChirho}/verses-chirho/chapter-001-verses-chirho.json`,
			[]
		);
		await expect(loadBookChirho(valueChirho.rootChirho, bookChirho)).rejects.toThrow(
			'snapshot differs'
		);
		await writeFileChirho(
			joinChirho(valueChirho.rootChirho, 'static' + valueChirho.contentPathChirho),
			'{}'
		);
		await expect(loadBookChirho(valueChirho.rootChirho, bookChirho)).rejects.toThrow(
			'Source chapter drift'
		);
	});
	it('refuses plan path escape, changed prompt and seed', async () => {
		const valueChirho = await fixtureChirho();
		for (const mutationChirho of [
			{ output_chirho: '../../foreign.webp' },
			{ seed_chirho: 7 },
			{ prompt_chirho: 'changed' }
		]) {
			await valueChirho.putChirho(
				`${valueChirho.homeChirho}/jobs-chirho/chapter-001-jobs-chirho.jsonl`,
				[{ ...valueChirho.jobChirho, ...mutationChirho }],
				true
			);
			await expect(loadBookChirho(valueChirho.rootChirho, bookChirho)).rejects.toThrow(
				'plan, prompt or source'
			);
		}
	});
	it('requires one exact request, received result and saved output', async () => {
		const valueChirho = await fixtureChirho();
		for (const eventsChirho of [
			valueChirho.eventsChirho.slice(1),
			[...valueChirho.eventsChirho, valueChirho.eventsChirho[0]],
			valueChirho.eventsChirho.map((rowChirho) =>
				rowChirho.state_chirho === 'requested'
					? { ...rowChirho, request_sha256_chirho: '0'.repeat(64) }
					: rowChirho
			)
		]) {
			await valueChirho.putChirho(
				`${valueChirho.homeChirho}/records-chirho/journal-chirho.jsonl`,
				eventsChirho,
				true
			);
			await expect(loadBookChirho(valueChirho.rootChirho, bookChirho)).rejects.toThrow(
				'request journal'
			);
		}
	});
	it('keeps torn append tails pending and rejects duplicate successes', async () => {
		const valueChirho = await fixtureChirho();
		const pathChirho = joinChirho(
			valueChirho.rootChirho,
			`${valueChirho.homeChirho}/records-chirho/chapter-001-records-chirho.jsonl`
		);
		await writeFileChirho(pathChirho, JSON.stringify(valueChirho.resultChirho));
		expect(
			(await loadBookChirho(valueChirho.rootChirho, bookChirho)).completed_chirho
		).toHaveLength(0);
		await valueChirho.putChirho(
			`${valueChirho.homeChirho}/records-chirho/chapter-001-records-chirho.jsonl`,
			[valueChirho.resultChirho, valueChirho.resultChirho],
			true
		);
		await expect(loadBookChirho(valueChirho.rootChirho, bookChirho)).rejects.toThrow(
			'More than one'
		);
	});
	it('requires the exact saved set for a completion marker', async () => {
		const valueChirho = await fixtureChirho();
		await valueChirho.putChirho(`${valueChirho.homeChirho}/usable-outputs-chirho.json`, {
			book_id_chirho: 'Phlm',
			model_chirho: 'runware:100@1',
			output_format_chirho: 'WEBP',
			output_quality_chirho: 45,
			verse_count_chirho: 1,
			outputs_chirho: [
				{
					job_id_chirho: valueChirho.jobChirho.job_id_chirho,
					output_chirho: valueChirho.jobChirho.output_chirho,
					output_sha256_chirho: valueChirho.resultChirho.output_sha256_chirho,
					bytes_chirho: valueChirho.bytesChirho.length
				}
			]
		});
		expect((await loadBookChirho(valueChirho.rootChirho, bookChirho)).complete_chirho).toBe(true);
		await valueChirho.putChirho(`${valueChirho.homeChirho}/usable-outputs-chirho.json`, {});
		await expect(loadBookChirho(valueChirho.rootChirho, bookChirho)).rejects.toThrow(
			'completion marker'
		);
	});
	it('refuses a linked source parent before reading it', async () => {
		const valueChirho = await fixtureChirho();
		await rmChirho(joinChirho(valueChirho.rootChirho, 'static/content-chirho/philemon-chirho'), {
			recursive: true
		});
		const foreignChirho = joinChirho(valueChirho.rootChirho, 'foreign-chirho');
		await mkdirChirho(foreignChirho);
		await symlinkChirho(
			foreignChirho,
			joinChirho(valueChirho.rootChirho, 'static/content-chirho/philemon-chirho')
		);
		await writeFileChirho(joinChirho(foreignChirho, 'manifest-chirho.json'), '{}');
		await expect(loadBookChirho(valueChirho.rootChirho, bookChirho)).rejects.toThrow('linked');
	});
	it('dry preservation makes no network request and writes no stage', async () => {
		const valueChirho = await fixtureChirho();
		const resultChirho = await archiveCompletedChirho(
			valueChirho.rootChirho,
			valueChirho.completedChirho,
			false,
			{
				request_chirho: async () => {
					throw new Error('unexpected request');
				},
				inspect_chirho: async () => {}
			}
		);
		expect(resultChirho.state_chirho).toBe('would_archive');
		await expect(
			readFileChirho(joinChirho(valueChirho.rootChirho, STAGE_CHIRHO, 'progress-chirho.json'))
		).rejects.toThrow();
	});
	it('uploads and reads exact original bytes once; replay makes zero requests', async () => {
		const valueChirho = await fixtureChirho();
		let savedChirho: Uint8Array | undefined;
		const callsChirho: string[] = [];
		const dependenciesChirho = {
			inspect_chirho: async () => {},
			request_chirho: async (
				methodChirho: 'GET' | 'PUT' | 'HEAD',
				keyChirho: string,
				bytesChirho?: Uint8Array
			) => {
				callsChirho.push(methodChirho);
				expect(keyChirho).toContain(valueChirho.resultChirho.output_sha256_chirho);
				if (methodChirho === 'PUT') {
					expect(Array.from(bytesChirho!)).toEqual(Array.from(valueChirho.bytesChirho));
					savedChirho = bytesChirho;
					return new Response(null);
				}
				return savedChirho
					? new Response(new Uint8Array(savedChirho))
					: new Response(null, { status: 404 });
			}
		};
		const resultChirho = await archiveCompletedChirho(
			valueChirho.rootChirho,
			valueChirho.completedChirho,
			true,
			dependenciesChirho
		);
		expect(resultChirho.receipt_chirho?.object_chirho.sha256_chirho).toBe(
			valueChirho.resultChirho.output_sha256_chirho
		);
		expect(callsChirho).toEqual(['GET', 'PUT', 'GET']);
		callsChirho.length = 0;
		expect(
			(
				await archiveCompletedChirho(
					valueChirho.rootChirho,
					valueChirho.completedChirho,
					true,
					dependenciesChirho
				)
			).state_chirho
		).toBe('already_archived');
		expect(callsChirho).toEqual([]);
	});
	it('reconciles an uncertain successful PUT with GET instead of re-uploading', async () => {
		const valueChirho = await fixtureChirho();
		let savedChirho: Uint8Array | undefined;
		let putsChirho = 0;
		const dependenciesChirho = {
			inspect_chirho: async () => {},
			request_chirho: async (
				methodChirho: 'GET' | 'PUT' | 'HEAD',
				_keyChirho: string,
				bytesChirho?: Uint8Array
			) => {
				if (methodChirho === 'PUT') {
					savedChirho = bytesChirho;
					putsChirho++;
					throw new Error('lost response');
				}
				return savedChirho
					? new Response(new Uint8Array(savedChirho))
					: new Response(null, { status: 404 });
			}
		};
		await expect(
			archiveCompletedChirho(
				valueChirho.rootChirho,
				valueChirho.completedChirho,
				true,
				dependenciesChirho
			)
		).rejects.toThrow('lost response');
		expect(
			(
				await archiveCompletedChirho(
					valueChirho.rootChirho,
					valueChirho.completedChirho,
					true,
					dependenciesChirho
				)
			).state_chirho
		).toBe('archived');
		expect(putsChirho).toBe(1);
	});
	it('refuses corrupt remote bytes and altered local bytes without installing or deleting', async () => {
		const valueChirho = await fixtureChirho();
		await expect(
			archiveCompletedChirho(valueChirho.rootChirho, valueChirho.completedChirho, true, {
				inspect_chirho: async () => {},
				request_chirho: async () => new Response('corrupt')
			})
		).rejects.toThrow('length differs');
		await writeFileChirho(
			joinChirho(valueChirho.rootChirho, valueChirho.jobChirho.output_chirho),
			'changed'
		);
		await expect(
			archiveCompletedChirho(valueChirho.rootChirho, valueChirho.completedChirho, true, {
				inspect_chirho: async () => {},
				request_chirho: async () => {
					throw new Error('unexpected request');
				}
			})
		).rejects.toThrow('Provider file differs');
	});
	it('executes actual lossy WebP decode and rejects blank and truncated outputs', async () => {
		const makeChirho = (blankChirho: boolean) =>
			execFileSyncChirho('python3', [
				'-I',
				'-c',
				'from PIL import Image,ImageDraw;import sys; image_chirho=Image.new("RGB",(1024,768),(0,0,0)); ' +
					(blankChirho
						? ''
						: 'ImageDraw.Draw(image_chirho).rectangle((200,200,800,600),fill=(80,150,220)); ') +
					'image_chirho.save(sys.stdout.buffer,format="WEBP",quality=45)'
			]);
		const bytesChirho = makeChirho(false);
		await expect(inspectWebpChirho(bytesChirho)).resolves.toBeUndefined();
		await expect(inspectWebpChirho(makeChirho(true))).rejects.toThrow('pixel/decode');
		await expect(inspectWebpChirho(bytesChirho.subarray(0, 18))).rejects.toThrow();
	});
});

describe('provider publication and failure recovery', () => {
	it('drains a shared failure without starting remaining jobs', async () => {
		const startedChirho: number[] = [],
			endedChirho: number[] = [];
		await expect(
			poolChirho(
				[0, 1, 2, 3, 4],
				async (valueChirho) => {
					startedChirho.push(valueChirho);
					if (!valueChirho) throw new Error('storage unavailable');
					await new Promise((resolveChirho) => setTimeout(resolveChirho, 5));
					endedChirho.push(valueChirho);
				},
				() => false,
				2
			)
		).rejects.toThrow('storage unavailable');
		expect(startedChirho).toEqual([0, 1]);
		expect(endedChirho).toEqual([1]);
	});
	it('keeps placeholders pending and refuses replacement of an existing verse', async () => {
		const valueChirho = await fixtureChirho();
		const sceneChirho = sceneForChirho(valueChirho.completedChirho, bookChirho);
		expect(mergeScenesChirho([sceneChirho], [sceneChirho])).toEqual([sceneChirho]);
		expect(sceneChirho.art_review_chirho).toBe('pending');
		expect(sceneChirho.fallback_chirho).toBe(true);
		expect(() =>
			mergeScenesChirho([sceneChirho], [{ ...sceneChirho, alt_chirho: 'different' }])
		).toThrow('replace');
		expect(() =>
			mergeScenesChirho([], [{ ...sceneChirho, sha256_chirho: '0'.repeat(64) }])
		).toThrow('passthrough');
	});
	it('installs only a completed preserved book with exact source=delivery and no raster copies', async () => {
		const valueChirho = await fixtureChirho();
		await valueChirho.putChirho(`${valueChirho.homeChirho}/usable-outputs-chirho.json`, {
			book_id_chirho: 'Phlm',
			model_chirho: 'runware:100@1',
			output_format_chirho: 'WEBP',
			output_quality_chirho: 45,
			verse_count_chirho: 1,
			outputs_chirho: [
				{
					job_id_chirho: valueChirho.jobChirho.job_id_chirho,
					output_chirho: valueChirho.jobChirho.output_chirho,
					output_sha256_chirho: valueChirho.resultChirho.output_sha256_chirho,
					bytes_chirho: valueChirho.bytesChirho.length
				}
			]
		});
		await expect(
			installBookChirho(valueChirho.rootChirho, bookChirho, false, false)
		).rejects.toThrow('preservation');
		const dependenciesChirho = {
			inspect_chirho: async () => {},
			request_chirho: async () => new Response(new Uint8Array(valueChirho.bytesChirho))
		};
		const receiptChirho = (
			await archiveCompletedChirho(
				valueChirho.rootChirho,
				valueChirho.completedChirho,
				true,
				dependenciesChirho
			)
		).receipt_chirho!;
		const legacyProofChirho = {
			...receiptChirho.object_chirho,
			sha256_chirho: 'a'.repeat(64),
			key_chirho: 'media-chirho/sha256-chirho/' + 'a'.repeat(64) + '.webp'
		};
		await writeArtworkCatalogueChirho(valueChirho.rootChirho, [
			{
				kind_chirho: 'scene',
				source_paths_chirho: ['/assets-chirho/legacy-chirho.webp'],
				source_chirho: legacyProofChirho,
				delivery_chirho: legacyProofChirho,
				recipe_chirho: { format_chirho: 'webp' }
			}
		]);
		await valueChirho.putChirho('build-chirho/delivery-media-chirho/mapping-chirho.json', {
			schema_version_chirho: 1,
			encoder_chirho: { name_chirho: 'cwebp', version_chirho: 'test' },
			entries_chirho: []
		});
		expect(
			(await installBookChirho(valueChirho.rootChirho, bookChirho, false, false)).state_chirho
		).toBe('would_install');
		await expect(
			readFileChirho(joinChirho(valueChirho.rootChirho, MANIFEST_CHIRHO))
		).rejects.toThrow();
		const resultChirho = await installBookChirho(valueChirho.rootChirho, bookChirho, true, false);
		expect(resultChirho.raster_writes_chirho).toBe(0);
		const catalogueChirho = await readArtworkCatalogueChirho(valueChirho.rootChirho);
		const entryChirho = catalogueChirho!.entries_chirho.get(
			'scene:' + valueChirho.resultChirho.output_sha256_chirho
		)!;
		expect(entryChirho.source_chirho).toEqual(entryChirho.delivery_chirho);
		expect(entryChirho.recipe_chirho.operation_chirho).toBe('provider_passthrough');
		const bytesChirho = await readFileChirho(joinChirho(valueChirho.rootChirho, MANIFEST_CHIRHO));
		await installBookChirho(valueChirho.rootChirho, bookChirho, true, false);
		expect(await readFileChirho(joinChirho(valueChirho.rootChirho, MANIFEST_CHIRHO))).toEqual(
			bytesChirho
		);
		await expect(
			readFileChirho(
				joinChirho(valueChirho.rootChirho, 'static' + entryChirho.source_paths_chirho[0])
			)
		).rejects.toThrow();
		const sceneChirho = sceneForChirho(valueChirho.completedChirho, bookChirho);
		const mediaPathChirho = '/media-chirho/philemon-chirho/chapter-01-chirho.json';
		await valueChirho.putChirho('static' + mediaPathChirho, { scenes_chirho: [sceneChirho] });
		const mediaBytesChirho = await readFileChirho(
			joinChirho(valueChirho.rootChirho, 'static' + mediaPathChirho)
		);
		const summaryPathChirho = '/media-chirho/philemon-chirho/summary-chirho.json';
		await valueChirho.putChirho('static' + summaryPathChirho, {
			scene_count_chirho: 1,
			chapters_chirho: [
				{
					number_chirho: 1,
					path_chirho: mediaPathChirho,
					sha256_chirho: digestChirho(mediaBytesChirho)
				}
			]
		});
		const summaryBytesChirho = await readFileChirho(
			joinChirho(valueChirho.rootChirho, 'static' + summaryPathChirho)
		);
		const fetchChirho: typeof fetch = async (inputChirho) => {
			const pathChirho = new URL(String(inputChirho)).pathname;
			return new Response(
				new Uint8Array(
					pathChirho === summaryPathChirho
						? summaryBytesChirho
						: pathChirho === mediaPathChirho
							? mediaBytesChirho
							: valueChirho.bytesChirho
				)
			);
		};
		expect(
			(
				await retireBookChirho(valueChirho.rootChirho, bookChirho, false, async () => {
					throw Error('dry network request');
				})
			).state_chirho
		).toBe('would_verify_and_retire');
		const corruptFetchChirho: typeof fetch = async (inputChirho, initChirho) =>
			String(inputChirho).endsWith('.webp')
				? new Response('corrupt')
				: fetchChirho(inputChirho, initChirho);
		await expect(
			retireBookChirho(valueChirho.rootChirho, bookChirho, true, corruptFetchChirho)
		).rejects.toThrow('length differs');
		expect(
			await readFileChirho(joinChirho(valueChirho.rootChirho, valueChirho.jobChirho.output_chirho))
		).toEqual(Buffer.from(valueChirho.bytesChirho));
		expect(
			(await retireBookChirho(valueChirho.rootChirho, bookChirho, true, fetchChirho)).state_chirho
		).toBe('retired');
		await expect(
			readFileChirho(joinChirho(valueChirho.rootChirho, valueChirho.jobChirho.output_chirho))
		).rejects.toThrow();
		const aliasesChirho = JSON.parse(
			await readFileChirho(
				joinChirho(
					valueChirho.rootChirho,
					'workspace-chirho/art-chirho/remote-archive-chirho/provider-copies-chirho/philemon-chirho/chapter-001-chirho.json'
				),
				'utf8'
			)
		);
		expect(aliasesChirho.copies_chirho[0].sha256_chirho).toBe(
			valueChirho.resultChirho.output_sha256_chirho
		);
		expect(
			(
				await retireBookChirho(valueChirho.rootChirho, bookChirho, true, async () => {
					throw Error('replay network request');
				})
			).state_chirho
		).toBe('already_retired');
		await runChirho(valueChirho.rootChirho, [
			'--book-chirho',
			'Phlm',
			'--watch-chirho',
			'--apply-chirho'
		]);
		const progressChirho = JSON.parse(
			await readFileChirho(
				joinChirho(valueChirho.rootChirho, STAGE_CHIRHO, 'progress-chirho.json'),
				'utf8'
			)
		);
		expect(progressChirho.state_chirho).toBe('complete');
		expect(progressChirho.retired_books_chirho).toEqual(['Phlm']);
	});
});
