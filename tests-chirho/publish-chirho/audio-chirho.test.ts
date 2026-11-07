// For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life. — John 3:16 (KJV)
import { describe, it, expect } from 'vitest';
import { mkdtemp, mkdir, writeFile, rm, readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import {
	hasMp3HeaderChirho,
	verifyAudioChirho
} from '../../scripts-chirho/publish-chirho/audio_rules_chirho';
import {
	sha256Chirho,
	type FilesChirho
} from '../../scripts-chirho/publish-chirho/release_rules_chirho';
import {
	audioPlanChirho,
	uploadAudioChirho,
	AUDIO_RECEIPTS_CHIRHO
} from '../../scripts-chirho/audio-chirho/r2_recordings_chirho';
import {
	missingReceiptsChirho,
	waitForReceiptsChirho
} from '../../scripts-chirho/publish-chirho/release_cycle_chirho';
import type { ReleaseManifestChirho } from '../../scripts-chirho/publish-chirho/build_release_chirho';
import { rejectedAudioChirho } from '../../src/lib/domain-chirho/pronunciation-chirho/audio-reviews-chirho';
import {
	BEERI_ATTRIBUTION_CHIRHO,
	BEERI_LICENSE_URL_CHIRHO
} from '../../src/lib/domain-chirho/pronunciation-chirho/reading-source-chirho';

const CHAPTER_CHIRHO = 'audio-chirho/proverbs-chirho/chapter-01-chirho.json';
const CONTENT_CHIRHO = 'content-chirho/proverbs-chirho/chapter-01-chirho.json';
const TARGET_CHIRHO = {
	account_chirho: 'a'.repeat(32),
	bucket_chirho: 'hinneh-media-chirho',
	email_chirho: 'test@example.invalid',
	api_key_chirho: 'test-only-chirho'
};
function humanSourceChirho() {
	return {
		kind_chirho: 'human',
		reader_id_chirho: 'rdb-chirho',
		gbt_id_chirho: 'OT/RDB/Pro',
		package_sha256_chirho: 'a'.repeat(64),
		chapter_sha256_chirho: 'b'.repeat(64),
		timings_sha256_chirho: 'c'.repeat(64),
		start_chirho: 2,
		end_chirho: 3,
		chapter_duration_chirho: 100,
		attribution_chirho: BEERI_ATTRIBUTION_CHIRHO,
		license_chirho: 'CC BY-SA 3.0',
		license_url_chirho: BEERI_LICENSE_URL_CHIRHO
	};
}

it('publishes source-bound human readings and refuses wrong source, license, window or AI identity', () => {
	const validChirho = fixtureChirho((clipChirho) => {
		clipChirho.voice_name_chirho = "Rabbi Dan Be'eri";
		clipChirho.reading_source_chirho = humanSourceChirho();
	});
	const reasonsChirho: string[] = [];
	verifyAudioChirho(validChirho, true, reasonsChirho);
	expect(reasonsChirho).toEqual([]);
	for (const [keyChirho, valueChirho] of [
		['gbt_id_chirho', 'OT/RDB/Gen'],
		['license_url_chirho', 'https://example.com/'],
		['start_chirho', -1],
		['end_chirho', 99],
		['chapter_sha256_chirho', 'broken']
	] as const) {
		const filesChirho = fixtureChirho((clipChirho) => {
			clipChirho.voice_name_chirho = "Rabbi Dan Be'eri";
			clipChirho.reading_source_chirho = { ...humanSourceChirho(), [keyChirho]: valueChirho };
		});
		const failuresChirho: string[] = [];
		verifyAudioChirho(filesChirho, true, failuresChirho);
		expect(failuresChirho.some((reasonChirho) => reasonChirho.includes('human reading'))).toBe(
			true
		);
	}
	for (const fieldChirho of ['ipa_chirho', 'synthesis_text_chirho', 'recipe_id_chirho']) {
		const filesChirho = fixtureChirho((clipChirho) => {
			clipChirho.voice_name_chirho = "Rabbi Dan Be'eri";
			clipChirho.reading_source_chirho = humanSourceChirho();
			clipChirho[fieldChirho] = 'fabricated';
		});
		const failuresChirho: string[] = [];
		verifyAudioChirho(filesChirho, true, failuresChirho);
		expect(failuresChirho.some((reasonChirho) => reasonChirho.includes('human reading'))).toBe(
			true
		);
	}
});
it('keeps valid human readings out of the unattributed legacy playback stream', () => {
	const filesChirho = fixtureChirho((clipChirho) => {
		clipChirho.voice_name_chirho = "Rabbi Dan Be'eri";
		clipChirho.reading_source_chirho = humanSourceChirho();
	}, true);
	const reasonsChirho: string[] = [];
	verifyAudioChirho(filesChirho, true, reasonsChirho);
	expect(
		reasonsChirho.some((reasonChirho) => reasonChirho.includes('updated-client reading array'))
	).toBe(true);
});
function fixtureChirho(
	changeChirho?: (clipChirho: Record<string, unknown>) => void,
	forceLegacyChirho = false
): FilesChirho {
	const audioChirho = new Uint8Array(834);
	for (const offsetChirho of [0, 417]) audioChirho.set([0xff, 0xfb, 0x90, 0xc0], offsetChirho);
	const hashChirho = sha256Chirho(audioChirho);
	const assetChirho = `audio-chirho/sha256-chirho/${hashChirho}-chirho.mp3`;
	const contentChirho = JSON.stringify({
		verses_chirho: [
			{
				id_chirho: 'Prov.1.1',
				canonical_text_chirho: 'אב',
				tokens_chirho: [
					{
						id_chirho: 'word1',
						text_chirho: 'אב',
						start_chirho: 0,
						end_chirho: 2,
						qere_chirho: [{ text_chirho: 'אָב' }]
					}
				]
			}
		]
	});
	const clipChirho: Record<string, unknown> = {
		lesson_id_chirho: 'Prov.1.1',
		token_id_chirho: null,
		canonical_sha256_chirho: sha256Chirho('אב'),
		text_chirho: 'אָב',
		language_chirho: 'he',
		pronunciation_chirho: 'israeli_hebrew',
		voice_name_chirho: 'Test narrator',
		asset_path_chirho: `/${assetChirho}`,
		sha256_chirho: hashChirho,
		bytes_chirho: audioChirho.length,
		duration_chirho: 1,
		review_chirho: 'audition',
		license_chirho: 'Synthetic test fixture'
	};
	changeChirho?.(clipChirho);
	const chapterChirho = JSON.stringify({
		schema_version_chirho: 1,
		book_id_chirho: 'Prov',
		chapter_chirho: 1,
		content_path_chirho: `/${CONTENT_CHIRHO}`,
		content_sha256_chirho: sha256Chirho(contentChirho),
		clips_chirho:
			clipChirho.reading_source_chirho !== undefined && !forceLegacyChirho ? [] : [clipChirho],
		...(clipChirho.reading_source_chirho !== undefined && !forceLegacyChirho
			? { readings_chirho: [clipChirho] }
			: {})
	});
	const manifestChirho = JSON.stringify({
		schema_version_chirho: 1,
		books_chirho: {
			Prov: {
				chapters_chirho: [
					{
						number_chirho: 1,
						path_chirho: `/${CHAPTER_CHIRHO}`,
						sha256_chirho: sha256Chirho(chapterChirho)
					}
				]
			}
		}
	});
	return new Map([
		[assetChirho, audioChirho],
		[CONTENT_CHIRHO, new TextEncoder().encode(contentChirho)],
		[CHAPTER_CHIRHO, new TextEncoder().encode(chapterChirho)],
		['audio-chirho/manifest-chirho.json', new TextEncoder().encode(manifestChirho)]
	]);
}
function problemsChirho(filesChirho: FilesChirho, previewChirho = true) {
	const reasonsChirho: string[] = [];
	verifyAudioChirho(filesChirho, previewChirho, reasonsChirho);
	return reasonsChirho;
}
async function scratchChirho() {
	const rootChirho = await mkdtemp(join(tmpdir(), 'hinneh-audio-chirho-'));
	for (const [pathChirho, bytesChirho] of fixtureChirho()) {
		const destinationChirho = join(rootChirho, 'static', pathChirho);
		await mkdir(join(destinationChirho, '..'), { recursive: true });
		await writeFile(destinationChirho, bytesChirho);
	}
	return rootChirho;
}
describe('source-bound audio publication and R2', () => {
	it('refuses publication of listener-rejected audio despite a forged approved label', () => {
		expect(
			problemsChirho(
				fixtureChirho((clipChirho) => {
					clipChirho.sha256_chirho = rejectedAudioChirho[0].sha256_chirho;
					clipChirho.review_chirho = 'approved';
				})
			)
		).toContainEqual(expect.stringMatching(/rejected by the listener/));
	});
	it('waits briefly for an upload receipt while preserving an unresolved release hold', async () => {
		let checksChirho = 0;
		let sleptChirho = 0;
		expect(
			await waitForReceiptsChirho(
				async () => (++checksChirho === 1 ? ['/audio-chirho/pending-chirho.mp3'] : []),
				async (millisecondsChirho) => {
					sleptChirho += millisecondsChirho;
				}
			)
		).toEqual([]);
		expect(sleptChirho).toBe(2000);
		checksChirho = 0;
		sleptChirho = 0;
		expect(
			await waitForReceiptsChirho(
				async () => {
					checksChirho++;
					return ['/assets-chirho/pending-chirho.webp'];
				},
				async (millisecondsChirho) => {
					sleptChirho += millisecondsChirho;
				}
			)
		).toEqual(['/assets-chirho/pending-chirho.webp']);
		expect(sleptChirho).toBe(30_000);
		expect(checksChirho).toBe(16);
	});
	it('keeps auditions out of an accepted release and requires exact qere readings', () => {
		expect(problemsChirho(fixtureChirho())).toEqual([]);
		expect(problemsChirho(fixtureChirho(), false).length).toBeGreaterThan(0);
		for (const changesChirho of [
			{ text_chirho: 'אב' },
			{ token_id_chirho: 'foreign' },
			{ canonical_sha256_chirho: 'b'.repeat(64) },
			{ pronunciation_chirho: 'erasmian' },
			{ review_chirho: 'machine_approved' },
			{ ipa_chirho: 'av', synthesis_text_chirho: '"/av/"' },
			{ synthesis_text_chirho: 'another word' },
			{ recipe_id_chirho: 'unknown-recipe-chirho' },
			{ license_chirho: '' }
		])
			expect(
				problemsChirho(fixtureChirho((clipChirho) => Object.assign(clipChirho, changesChirho)))
					.length
			).toBeGreaterThan(0);
	});
	it('refuses corrupted, undeclared or substituted audio/source bytes', () => {
		const originalChirho = fixtureChirho();
		const assetChirho = [...originalChirho.keys()].find((pathChirho) =>
			pathChirho.endsWith('.mp3')
		)!;
		for (const pathChirho of [assetChirho, CHAPTER_CHIRHO, CONTENT_CHIRHO]) {
			const filesChirho = fixtureChirho();
			filesChirho.set(pathChirho, new Uint8Array([1, 2, 3]));
			expect(problemsChirho(filesChirho).length).toBeGreaterThan(0);
		}
		originalChirho.set('audio-chirho/secret-chirho.txt', new Uint8Array());
		expect(problemsChirho(originalChirho).join(' ')).toContain('not declared');
		expect(hasMp3HeaderChirho(new Uint8Array(834))).toBe(false);
	});
	it('does no remote work in a dry run and stores a receipt only after identical readback', async () => {
		const rootChirho = await scratchChirho();
		try {
			const planChirho = await audioPlanChirho(rootChirho);
			let callsChirho = 0;
			const fetchChirho: typeof fetch = async (_urlChirho, initChirho) => {
				callsChirho++;
				if (initChirho?.method === 'PUT') {
					expect(new Headers(initChirho.headers).get('content-type')).toBe('audio/mpeg');
					return new Response(null, { status: 200 });
				}
				return new Response(
					new Uint8Array(
						await readFile(join(rootChirho, 'static', planChirho[0].asset_path_chirho))
					)
				);
			};
			expect(
				(await uploadAudioChirho(rootChirho, planChirho, null, fetchChirho)).uploaded_chirho
			).toBe(0);
			expect(callsChirho).toBe(0);
			expect(
				(await uploadAudioChirho(rootChirho, planChirho, TARGET_CHIRHO, fetchChirho))
					.uploaded_chirho
			).toBe(1);
			expect(callsChirho).toBe(2);
			expect(
				(await uploadAudioChirho(rootChirho, planChirho, TARGET_CHIRHO, fetchChirho)).pending_chirho
			).toBe(0);
			expect(callsChirho).toBe(2);
			const manifestChirho = {
				files_chirho: planChirho.map((rowChirho) => ({
					path_chirho: rowChirho.asset_path_chirho,
					sha256_chirho: rowChirho.sha256_chirho,
					bytes_chirho: rowChirho.bytes_chirho
				}))
			} as ReleaseManifestChirho;
			expect(await missingReceiptsChirho(rootChirho, manifestChirho, () => undefined)).toEqual([]);
			await writeFile(join(rootChirho, AUDIO_RECEIPTS_CHIRHO), '{torn');
			expect(await missingReceiptsChirho(rootChirho, manifestChirho, () => undefined)).toHaveLength(
				1
			);
		} finally {
			await rm(rootChirho, { recursive: true, force: true });
		}
	});
	it('refuses a wrong bucket and readback mismatch without a trusted receipt', async () => {
		const rootChirho = await scratchChirho();
		try {
			const planChirho = await audioPlanChirho(rootChirho);
			await expect(
				uploadAudioChirho(rootChirho, planChirho, {
					...TARGET_CHIRHO,
					bucket_chirho: 'other-chirho'
				})
			).rejects.toThrow('outside');
			await expect(
				uploadAudioChirho(rootChirho, planChirho, TARGET_CHIRHO, async () => new Response('wrong'))
			).rejects.toThrow('readback');
			expect((await uploadAudioChirho(rootChirho, planChirho, null)).pending_chirho).toBe(1);
		} finally {
			await rm(rootChirho, { recursive: true, force: true });
		}
	});

	it('retries transient archive failures with Retry-After and never repeats permanent refusals', async () => {
		const rootChirho = await scratchChirho();
		try {
			const planChirho = await audioPlanChirho(rootChirho);
			const bytesChirho = await readFile(
				join(rootChirho, 'static', planChirho[0].asset_path_chirho)
			);
			const delaysChirho: number[] = [];
			let callsChirho = 0;
			const fetchChirho: typeof fetch = async (_urlChirho, initChirho) => {
				callsChirho++;
				if (callsChirho === 1)
					return new Response(null, { status: 500, headers: { 'Retry-After': '2' } });
				return initChirho?.method === 'PUT' ? new Response(null) : new Response(bytesChirho);
			};
			expect(
				(
					await uploadAudioChirho(
						rootChirho,
						planChirho,
						TARGET_CHIRHO,
						fetchChirho,
						async (msChirho) => {
							delaysChirho.push(msChirho);
						}
					)
				).uploaded_chirho
			).toBe(1);
			expect(callsChirho).toBe(3);
			expect(delaysChirho).toEqual([2000]);
			await rm(join(rootChirho, AUDIO_RECEIPTS_CHIRHO));
			for (const statusChirho of [403, 500, 429]) {
				callsChirho = 0;
				delaysChirho.length = 0;
				await expect(
					uploadAudioChirho(
						rootChirho,
						planChirho,
						TARGET_CHIRHO,
						async () => {
							callsChirho++;
							return new Response(null, {
								status: statusChirho,
								headers: statusChirho === 429 ? { 'Retry-After': '120' } : {}
							});
						},
						async (msChirho) => {
							delaysChirho.push(msChirho);
						}
					)
				).rejects.toThrow('no receipt');
				expect(callsChirho).toBe(statusChirho === 500 ? 5 : 1);
				expect(delaysChirho.length).toBe(statusChirho === 500 ? 4 : 0);
				expect((await uploadAudioChirho(rootChirho, planChirho, null)).pending_chirho).toBe(1);
			}
		} finally {
			await rm(rootChirho, { recursive: true, force: true });
		}
	});

	it('bounds audio archive concurrency at four and keeps once-per-hash receipts', async () => {
		const rootChirho = await scratchChirho();
		try {
			const originalChirho = (await audioPlanChirho(rootChirho))[0];
			const filesChirho = new Map<string, Uint8Array>();
			const planChirho = [];
			for (let indexChirho = 0; indexChirho < 9; indexChirho++) {
				const bytesChirho = new Uint8Array(834);
				bytesChirho.set([0xff, 0xfb, 0x90, 0xc0]);
				bytesChirho[833] = indexChirho;
				const shaChirho = sha256Chirho(bytesChirho),
					keyChirho = `audio-chirho/sha256-chirho/${shaChirho}.mp3`,
					assetChirho = `/audio-chirho/sha256-chirho/${shaChirho}-chirho.mp3`;
				await writeFile(join(rootChirho, 'static', assetChirho), bytesChirho);
				filesChirho.set(keyChirho, bytesChirho);
				planChirho.push({
					...originalChirho,
					key_chirho: keyChirho,
					sha256_chirho: shaChirho,
					asset_path_chirho: assetChirho
				});
			}
			let activeChirho = 0,
				maximumChirho = 0,
				callsChirho = 0;
			const fetchChirho: typeof fetch = async (urlChirho, initChirho) => {
				callsChirho++;
				activeChirho++;
				maximumChirho = Math.max(activeChirho, maximumChirho);
				await new Promise((doneChirho) => setTimeout(doneChirho, 2));
				activeChirho--;
				const keyChirho = String(urlChirho).split('/objects/')[1];
				return initChirho?.method === 'PUT'
					? new Response(null)
					: new Response(new Uint8Array(filesChirho.get(keyChirho) ?? []));
			};
			expect(
				(await uploadAudioChirho(rootChirho, planChirho, TARGET_CHIRHO, fetchChirho))
					.uploaded_chirho
			).toBe(9);
			expect(maximumChirho).toBe(4);
			expect(callsChirho).toBe(18);
			expect(
				(await uploadAudioChirho(rootChirho, planChirho, TARGET_CHIRHO, fetchChirho)).pending_chirho
			).toBe(0);
			expect(callsChirho).toBe(18);
		} finally {
			await rm(rootChirho, { recursive: true, force: true });
		}
	});
});
