// For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life. — John 3:16 (KJV)
import { it, expect } from 'vitest';
import {
	mkdtemp as mkdtempChirho,
	mkdir as mkdirChirho,
	writeFile as writeFileChirho,
	rm as rmChirho,
	readFile as readFileChirho
} from 'node:fs/promises';
import { tmpdir as tmpdirChirho } from 'node:os';
import { join as joinChirho } from 'node:path';
import {
	otherReservationsChirho,
	BIBLE_WORD_HOME_CHIRHO,
	ORIGINAL_WORD_HOME_CHIRHO
} from '../../scripts-chirho/audio-chirho/production-chirho/global_budget_chirho';
import {
	reserveChirho,
	sha256Chirho,
	type AudioJobChirho
} from '../../scripts-chirho/audio-chirho/audition_chirho';

it('carries unknown prior requests and private corrections into the shared credit ceiling', async () => {
	const rootChirho = await mkdtempChirho(joinChirho(tmpdirChirho(), 'hinneh-budget-chirho-'));
	try {
		const realPlanChirho = JSON.parse(
			await readFileChirho(
				joinChirho(
					import.meta.dirname,
					'../fixtures-chirho/audio-chirho/whole-bible-words-chirho.json'
				),
				'utf8'
			)
		);
		const wordChirho = realPlanChirho.words_chirho[0];
		const pathChirho = 'batches-chirho/0000-chirho/batch-0000-chirho/plan-chirho.json';
		const planChirho = JSON.stringify({ words_chirho: [wordChirho] });
		const folderChirho = joinChirho(
			rootChirho,
			ORIGINAL_WORD_HOME_CHIRHO,
			'batches-chirho/0000-chirho/batch-0000-chirho'
		);
		await mkdirChirho(folderChirho, { recursive: true });
		await writeFileChirho(joinChirho(folderChirho, 'plan-chirho.json'), planChirho);
		await writeFileChirho(
			joinChirho(rootChirho, ORIGINAL_WORD_HOME_CHIRHO, 'index-chirho.json'),
			JSON.stringify({
				batches_chirho: [{ path_chirho: pathChirho, sha256_chirho: sha256Chirho(planChirho) }]
			})
		);
		await writeFileChirho(
			joinChirho(folderChirho, 'receipts-chirho.json'),
			JSON.stringify([
				{
					id_chirho: wordChirho.job_chirho.id_chirho,
					key_chirho: wordChirho.key_chirho,
					state_chirho: 'requested',
					reserved_credits_chirho: 7
				}
			])
		);
		const correctionChirho = joinChirho(
			rootChirho,
			ORIGINAL_WORD_HOME_CHIRHO,
			'corrections-chirho/test-chirho'
		);
		await mkdirChirho(correctionChirho, { recursive: true });
		await writeFileChirho(
			joinChirho(correctionChirho, 'receipts-chirho.json'),
			JSON.stringify([{ reserved_credits_chirho: 3 }])
		);
		const carriedChirho = await otherReservationsChirho(rootChirho, BIBLE_WORD_HOME_CHIRHO);
		expect(carriedChirho.credits_chirho).toBe(10);
		expect(carriedChirho.keys_chirho.has(wordChirho.key_chirho)).toBe(true);
		expect(() =>
			reserveChirho([wordChirho.job_chirho as AudioJobChirho], [], 270000, 'production')
		).toThrow(/budget/);
		expect(
			(await otherReservationsChirho(rootChirho, ORIGINAL_WORD_HOME_CHIRHO)).credits_chirho
		).toBe(3);
	} finally {
		await rmChirho(rootChirho, { recursive: true, force: true });
	}
});
