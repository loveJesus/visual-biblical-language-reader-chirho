// For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life. — John 3:16 (KJV)
import { expect, it, vi } from 'vitest';
import { mkdtemp, readFile, rm } from 'node:fs/promises';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import {
	dispatchScenesChirho,
	requestForSceneChirho,
	reserveScenesChirho,
	type SceneReceiptChirho
} from '../../scripts-chirho/art-chirho/comparison-chirho/run_comparison_chirho';
const planChirho = JSON.parse(
	await readFile(
		join(import.meta.dirname, '../fixtures-chirho/art-chirho/genesis-comparison-plan-chirho.json'),
		'utf8'
	)
);

it('bounds the authorized chapter, model settings and spend reservations', () => {
	expect(planChirho.jobs_chirho).toHaveLength(31);
	expect(
		planChirho.jobs_chirho.filter((jobChirho: { model_name_chirho: string }) =>
			jobChirho.model_name_chirho.startsWith('SDXL')
		)
	).toHaveLength(16);
	expect(reserveScenesChirho(planChirho, [], 3)).toBe(0);
	expect(() => reserveScenesChirho(planChirho, [], 32)).toThrow(/bound/);
	expect(() =>
		requestForSceneChirho(
			{ ...planChirho.jobs_chirho[0], model_chirho: 'auto' },
			crypto.randomUUID()
		)
	).toThrow(/refused/);
	expect(() =>
		requestForSceneChirho(
			{ ...planChirho.jobs_chirho[0], lesson_id_chirho: 'Gen.2.1' },
			crypto.randomUUID()
		)
	).toThrow(/refused/);
});
it('persists every UUID before a batch POST and refuses a second charge after an unknown result', async () => {
	const homeChirho = await mkdtemp(join(tmpdir(), 'hinneh-scene-comparison-chirho-'));
	const receiptsChirho: SceneReceiptChirho[] = [];
	let postsChirho = 0;
	vi.stubEnv('RUNWARE_API_KEY_CHIRHO', 'test-credential-chirho');
	const fetchChirho = (async () => {
		postsChirho++;
		const savedChirho = JSON.parse(
			await readFile(join(homeChirho, 'receipts-chirho.json'), 'utf8')
		);
		expect(savedChirho).toHaveLength(3);
		expect(
			new Set(savedChirho.map((rowChirho: SceneReceiptChirho) => rowChirho.task_uuid_chirho)).size
		).toBe(3);
		throw new Error('Unknown response after dispatch');
	}) as typeof fetch;
	try {
		await expect(
			dispatchScenesChirho(
				homeChirho,
				planChirho,
				receiptsChirho,
				planChirho.jobs_chirho.slice(0, 3),
				fetchChirho
			)
		).rejects.toThrow(/Unknown/);
		await expect(
			dispatchScenesChirho(
				homeChirho,
				planChirho,
				receiptsChirho,
				planChirho.jobs_chirho.slice(0, 3),
				fetchChirho
			)
		).rejects.toThrow(/already requested/);
		expect(postsChirho).toBe(1);
		expect(receiptsChirho.every((rowChirho) => rowChirho.state_chirho === 'requested')).toBe(true);
	} finally {
		vi.unstubAllEnvs();
		await rm(homeChirho, { recursive: true, force: true });
	}
});
