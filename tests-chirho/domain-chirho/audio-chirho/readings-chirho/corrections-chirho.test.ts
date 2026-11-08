// For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life. — John 3:16 (KJV)
import { describe, expect, it } from 'vitest';
import {
	readFile as readFileChirho,
	mkdtemp as mkdtempChirho,
	mkdir as mkdirChirho,
	writeFile as writeFileChirho,
	rm as rmChirho
} from 'node:fs/promises';
import { tmpdir as tmpdirChirho } from 'node:os';
import { join as joinChirho } from 'node:path';
import { createHash as createHashChirho } from 'node:crypto';
import {
	decodeOpeningDefinitionChirho,
	loadOpeningDefinitionChirho,
	correctedOpeningWindowChirho,
	verifyOpeningPhaseChirho,
	type OpeningDefinitionChirho,
	type CorrectionReadingChirho,
	type ReadingPlanGroupChirho
} from '../../../../scripts-chirho/audio-chirho/readings-chirho/correction_chirho';
import {
	uploadAudioChirho,
	AUDIO_RECEIPTS_CHIRHO
} from '../../../../scripts-chirho/audio-chirho/r2_recordings_chirho';

const definitionBytesChirho = new Uint8Array(
	await readFileChirho(
		new URL(
			'../../../../data-chirho/audio-chirho/beeri-opening-corrections-chirho.json',
			import.meta.url
		)
	)
);
const originalChirho = decodeOpeningDefinitionChirho(definitionBytesChirho);
const digestChirho = (bytesChirho: string | Uint8Array) =>
	createHashChirho('sha256').update(bytesChirho).digest('hex');

function fixtureChirho() {
	const definitionChirho = structuredClone(originalChirho);
	const expectedChirho = definitionChirho.chapters_chirho[0];
	const timingBytesChirho = Buffer.alloc(expectedChirho.timed_records_chirho * 11);
	for (let indexChirho = 0; indexChirho < expectedChirho.timed_records_chirho; indexChirho++) {
		const offsetChirho = indexChirho * 11;
		timingBytesChirho[offsetChirho] = 20;
		timingBytesChirho[offsetChirho + 1] = expectedChirho.chapter_chirho;
		timingBytesChirho[offsetChirho + 2] = indexChirho + 1;
		timingBytesChirho.writeUInt32BE(
			Math.round(expectedChirho.end_chirho * 100) + indexChirho * 100,
			offsetChirho + 3
		);
	}
	definitionChirho.timings_sha256_chirho = digestChirho(timingBytesChirho);
	expectedChirho.spoken_sha256_chirho = digestChirho('checked spoken text');
	const readingChirho: CorrectionReadingChirho = {
		lesson_id_chirho: expectedChirho.lesson_id_chirho,
		text_chirho: 'checked spoken text',
		canonical_sha256_chirho: expectedChirho.canonical_sha256_chirho,
		content_path_chirho: expectedChirho.content_path_chirho,
		content_sha256_chirho: expectedChirho.content_sha256_chirho,
		source_correction_sha256_chirho: definitionChirho.source_evidence_sha256_chirho,
		source_chirho: {
			gbt_id_chirho: definitionChirho.gbt_id_chirho,
			package_sha256_chirho: definitionChirho.package_sha256_chirho,
			timings_sha256_chirho: definitionChirho.timings_sha256_chirho,
			manifest_sha256_chirho: definitionChirho.manifest_sha256_chirho,
			chapter_sha256_chirho: expectedChirho.chapter_sha256_chirho,
			chapter_duration_chirho: expectedChirho.chapter_duration_chirho,
			start_chirho: 0,
			end_chirho: expectedChirho.end_chirho
		}
	};
	const probeChirho = {
		sha256_chirho: expectedChirho.chapter_sha256_chirho,
		duration_chirho: expectedChirho.chapter_duration_chirho
	};
	return { definitionChirho, readingChirho, timingBytesChirho, probeChirho };
}

describe('finite corrected Beeri opening phase', () => {
	it('refuses changed source text and an altered original install plan', async () => {
		const rootChirho = await mkdtempChirho(joinChirho(tmpdirChirho(), 'beeri-proof-chirho-'));
		try {
			const recordPathChirho = joinChirho(
				rootChirho,
				'data-chirho/audio-chirho/beeri-opening-corrections-chirho.json'
			);
			const sourcePathChirho = joinChirho(
				rootChirho,
				originalChirho.source_text_chirho.path_chirho
			);
			const priorPathChirho = joinChirho(rootChirho, originalChirho.prior_plan_path_chirho);
			for (const pathChirho of [recordPathChirho, sourcePathChirho, priorPathChirho])
				await mkdirChirho(joinChirho(pathChirho, '..'), { recursive: true });
			await writeFileChirho(recordPathChirho, definitionBytesChirho);
			await writeFileChirho(priorPathChirho, 'changed old plan');
			for (const bytesChirho of [
				new TextEncoder().encode('changed source'),
				await readFileChirho(
					new URL('../../../../' + originalChirho.source_text_chirho.path_chirho, import.meta.url)
				)
			]) {
				await writeFileChirho(sourcePathChirho, bytesChirho);
				await expect(
					loadOpeningDefinitionChirho(rootChirho, originalChirho.phase_chirho)
				).rejects.toThrow('source text or prior');
			}
		} finally {
			await rmChirho(rootChirho, { recursive: true, force: true });
		}
	});

	it('pins the common record and refuses unknown phases before reading their input', async () => {
		expect(originalChirho.chapters_chirho).toHaveLength(12);
		expect(() =>
			decodeOpeningDefinitionChirho(new Uint8Array([...definitionBytesChirho, 32]))
		).toThrow('record changed');
		await expect(
			loadOpeningDefinitionChirho('/no-such-root-chirho', 'other-chirho')
		).rejects.toThrow('Unknown');
	});

	it('accepts only its exact corrected window and keeps ordinary recordings on the original path', () => {
		const { definitionChirho, readingChirho, timingBytesChirho, probeChirho } = fixtureChirho();
		expect(
			correctedOpeningWindowChirho(definitionChirho, readingChirho, timingBytesChirho, probeChirho)
		).toEqual({ start_chirho: 0, end_chirho: readingChirho.source_chirho.end_chirho });
		const ordinaryChirho = {
			...readingChirho,
			lesson_id_chirho: 'Prov.1.1',
			source_correction_sha256_chirho: undefined
		};
		expect(
			correctedOpeningWindowChirho(null, ordinaryChirho, timingBytesChirho, probeChirho)
		).toBeNull();
		expect(
			correctedOpeningWindowChirho(definitionChirho, ordinaryChirho, timingBytesChirho, probeChirho)
		).toBeNull();
		expect(() =>
			correctedOpeningWindowChirho(null, readingChirho, timingBytesChirho, probeChirho)
		).toThrow('phase');
		expect(() =>
			correctedOpeningWindowChirho(
				definitionChirho,
				{ ...readingChirho, source_correction_sha256_chirho: undefined },
				timingBytesChirho,
				probeChirho
			)
		).toThrow('evidence');
	});

	it('refuses source, timing, text, verse and window substitution', () => {
		const { definitionChirho, readingChirho, timingBytesChirho, probeChirho } = fixtureChirho();
		for (const changedChirho of [
			{ ...readingChirho, lesson_id_chirho: 'Prov.3.2' },
			{ ...readingChirho, text_chirho: 'other spoken text' },
			{ ...readingChirho, content_sha256_chirho: 'f'.repeat(64) },
			{ ...readingChirho, canonical_sha256_chirho: 'f'.repeat(64) },
			{
				...readingChirho,
				source_chirho: { ...readingChirho.source_chirho, package_sha256_chirho: 'f'.repeat(64) }
			},
			{ ...readingChirho, source_chirho: { ...readingChirho.source_chirho, start_chirho: 0.01 } },
			{
				...readingChirho,
				source_chirho: {
					...readingChirho.source_chirho,
					end_chirho: readingChirho.source_chirho.end_chirho + 0.01
				}
			}
		])
			expect(() =>
				correctedOpeningWindowChirho(
					definitionChirho,
					changedChirho,
					timingBytesChirho,
					probeChirho
				)
			).toThrow();
		expect(() =>
			correctedOpeningWindowChirho(
				definitionChirho,
				readingChirho,
				new Uint8Array([...timingBytesChirho, 0]),
				probeChirho
			)
		).toThrow();
		expect(() =>
			correctedOpeningWindowChirho(definitionChirho, readingChirho, timingBytesChirho, {
				...probeChirho,
				sha256_chirho: 'f'.repeat(64)
			})
		).toThrow();
	});

	it('requires every old reading unchanged, exactly twelve new openings and no foreign or duplicate item', () => {
		const definitionChirho: OpeningDefinitionChirho = {
			...originalChirho,
			prior_proverbs_readings_chirho: 1
		};
		const previousChirho = {
			id_chirho: 'beeri-prov-1-1-chirho',
			lesson_id_chirho: 'Prov.1.1',
			sha256_chirho: 'a'.repeat(64)
		};
		const priorPlanChirho: ReadingPlanGroupChirho[] = [
			{
				path_chirho: '/audio-chirho/proverbs-chirho/chapter-01-chirho.json',
				clips_chirho: [previousChirho]
			}
		];
		const additionsChirho = originalChirho.chapters_chirho.map((rowChirho) => ({
			id_chirho: `beeri-${rowChirho.lesson_id_chirho.toLowerCase().replaceAll('.', '-')}-chirho`,
			lesson_id_chirho: rowChirho.lesson_id_chirho
		}));
		const plannedChirho = [
			{
				path_chirho: priorPlanChirho[0].path_chirho,
				clips_chirho: [previousChirho, ...additionsChirho]
			}
		];
		const beforeChirho = structuredClone(priorPlanChirho);
		expect(() =>
			verifyOpeningPhaseChirho(definitionChirho, priorPlanChirho, plannedChirho)
		).not.toThrow();
		expect(priorPlanChirho).toEqual(beforeChirho);
		for (const clipsChirho of [
			[...plannedChirho[0].clips_chirho.slice(1)],
			[previousChirho, ...additionsChirho.slice(1), additionsChirho[1]],
			[{ ...previousChirho, sha256_chirho: 'f'.repeat(64) }, ...additionsChirho],
			[
				previousChirho,
				...additionsChirho.slice(1),
				{ id_chirho: 'foreign-chirho', lesson_id_chirho: 'Prov.4.1' }
			]
		])
			expect(() =>
				verifyOpeningPhaseChirho(definitionChirho, priorPlanChirho, [
					{ ...plannedChirho[0], clips_chirho: clipsChirho }
				])
			).toThrow();
		expect(() =>
			verifyOpeningPhaseChirho(definitionChirho, priorPlanChirho, [
				{ ...plannedChirho[0], path_chirho: '/audio-chirho/genesis-chirho/chapter-01-chirho.json' }
			])
		).toThrow();
	});

	it('preserves unrelated unknown receipts and replays verified archive work without another request', async () => {
		const rootChirho = await mkdtempChirho(joinChirho(tmpdirChirho(), 'beeri-receipts-chirho-'));
		try {
			const bytesChirho = new TextEncoder().encode(
				'synthetic archive fixture; not recorded speech'
			);
			const shaChirho = digestChirho(bytesChirho);
			const planChirho = [
				{
					asset_path_chirho: `/audio-chirho/sha256-chirho/${shaChirho}-chirho.mp3`,
					key_chirho: `audio-chirho/sha256-chirho/${shaChirho}.mp3`,
					sha256_chirho: shaChirho,
					bytes_chirho: bytesChirho.length
				}
			];
			await mkdirChirho(joinChirho(rootChirho, 'static/audio-chirho/sha256-chirho'), {
				recursive: true
			});
			await mkdirChirho(joinChirho(rootChirho, 'build-chirho/r2-chirho'), { recursive: true });
			await writeFileChirho(
				joinChirho(rootChirho, 'static', planChirho[0].asset_path_chirho),
				bytesChirho
			);
			const unknownChirho =
				'{"request_id_chirho":"preserved-unknown-chirho","state_chirho":"unknown"}\n';
			await writeFileChirho(joinChirho(rootChirho, AUDIO_RECEIPTS_CHIRHO), unknownChirho);
			let callsChirho = 0;
			const fetchChirho: typeof fetch = async (_urlChirho, initChirho) => {
				callsChirho++;
				return initChirho?.method === 'PUT'
					? new Response(null, { status: 200 })
					: new Response(new Uint8Array(bytesChirho));
			};
			const targetChirho = {
				account_chirho: 'a'.repeat(32),
				bucket_chirho: 'hinneh-media-chirho',
				email_chirho: 'test@example.invalid',
				api_key_chirho: 'test-only-chirho'
			};
			expect(
				(await uploadAudioChirho(rootChirho, planChirho, targetChirho, fetchChirho)).uploaded_chirho
			).toBe(1);
			const afterChirho = await readFileChirho(
				joinChirho(rootChirho, AUDIO_RECEIPTS_CHIRHO),
				'utf8'
			);
			expect(afterChirho.startsWith(unknownChirho)).toBe(true);
			expect(callsChirho).toBe(2);
			expect(
				(await uploadAudioChirho(rootChirho, planChirho, targetChirho, fetchChirho)).pending_chirho
			).toBe(0);
			expect(callsChirho).toBe(2);
			expect(await readFileChirho(joinChirho(rootChirho, AUDIO_RECEIPTS_CHIRHO), 'utf8')).toBe(
				afterChirho
			);
		} finally {
			await rmChirho(rootChirho, { recursive: true, force: true });
		}
	});
});
