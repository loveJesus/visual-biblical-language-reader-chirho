// For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life. — John 3:16 (KJV)
import { afterEach, expect, it } from 'vitest';
import { mkdtemp, mkdir, readFile, writeFile, rm } from 'node:fs/promises';
import { execFileSync as execFileSyncChirho } from 'node:child_process';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import {
	sha256Chirho,
	cacheKeyChirho,
	type ReceiptChirho
} from '../../../scripts-chirho/audio-chirho/audition_chirho';
import { installWordsChirho } from '../../../scripts-chirho/audio-chirho/production-chirho/install_words_chirho';
import { wordsInstalledChirho } from '../../../scripts-chirho/audio-chirho/production-chirho/installed_words_chirho';
import { verifyWordSourcesChirho } from '../../../scripts-chirho/audio-chirho/production-chirho/run_words_chirho';
import {
	type LibraryWordChirho,
	WORD_HOME_CHIRHO
} from '../../../scripts-chirho/audio-chirho/production-chirho/prepare_words_chirho';
import { validRecordingWindowChirho } from '../../../src/lib/domain-chirho/pronunciation-chirho/production-recipe-chirho';

const rootsChirho: string[] = [];
afterEach(async () => {
	await Promise.all(
		rootsChirho.splice(0).map((rootChirho) => rm(rootChirho, { recursive: true, force: true }))
	);
});
async function wordChirho() {
	return (
		JSON.parse(
			await readFile(
				join(import.meta.dirname, '../../fixtures-chirho/audio-chirho/proverbs-word-chirho.json'),
				'utf8'
			)
		).words_chirho as LibraryWordChirho[]
	)[0];
}
it('binds every reused occurrence before requesting speech', async () => {
	const valueChirho = await wordChirho();
	await verifyWordSourcesChirho(process.cwd(), [valueChirho]);
	const changedChirho = structuredClone(valueChirho);
	changedChirho.occurrences_chirho[0].canonical_sha256_chirho = '0'.repeat(64);
	await expect(verifyWordSourcesChirho(process.cwd(), [changedChirho])).rejects.toThrow(
		/representative|context/
	);
});
it('requires archived bytes before public references, replays without PUT, and preserves natural clips', async () => {
	const rootChirho = await mkdtemp(join(tmpdir(), 'hinneh-word-install-chirho-'));
	rootsChirho.push(rootChirho);
	const valueChirho = await wordChirho();
	valueChirho.occurrences_chirho = valueChirho.occurrences_chirho.slice(0, 1);
	const occurrenceChirho = valueChirho.occurrences_chirho[0];
	const sourcePathChirho = join(rootChirho, 'static', occurrenceChirho.content_path_chirho);
	await mkdir(dirname(sourcePathChirho), { recursive: true });
	await writeFile(
		sourcePathChirho,
		await readFile(join(process.cwd(), 'static', occurrenceChirho.content_path_chirho))
	);
	const folderChirho = join(rootChirho, WORD_HOME_CHIRHO, 'test-batch-chirho');
	await mkdir(folderChirho, { recursive: true });
	const audioPathChirho = join(folderChirho, 'test-clip-chirho.mp3');
	execFileSyncChirho('ffmpeg', [
		'-v',
		'error',
		'-f',
		'lavfi',
		'-i',
		'anullsrc=r=44100:cl=mono:d=0.4',
		'-f',
		'lavfi',
		'-i',
		'sine=frequency=440:duration=0.3',
		'-f',
		'lavfi',
		'-i',
		'anullsrc=r=44100:cl=mono:d=0.5',
		'-filter_complex',
		'[0:a][1:a][2:a]concat=n=3:v=0:a=1[out]',
		'-map',
		'[out]',
		'-codec:a',
		'libmp3lame',
		audioPathChirho
	]);
	const bytesChirho = await readFile(audioPathChirho);
	const receiptsChirho: ReceiptChirho[] = [
		{
			id_chirho: valueChirho.job_chirho.id_chirho,
			key_chirho: cacheKeyChirho(valueChirho.job_chirho),
			reserved_credits_chirho: 10,
			state_chirho: 'received',
			voice_id_chirho: 'test-voice-chirho',
			voice_name_chirho: 'Test voice',
			path_chirho: 'test-clip-chirho.mp3',
			sha256_chirho: sha256Chirho(bytesChirho),
			bytes_chirho: bytesChirho.length
		}
	];
	const chapterPathChirho = join(
		rootChirho,
		'static/audio-chirho/proverbs-chirho/chapter-01-chirho.json'
	);
	await expect(
		installWordsChirho(rootChirho, folderChirho, [valueChirho], receiptsChirho, null)
	).rejects.toThrow(/R2 receipts/);
	await expect(readFile(chapterPathChirho)).rejects.toThrow();
	let putsChirho = 0;
	const fetchChirho = (async (_urlChirho: unknown, initChirho?: RequestInit) => {
		if (initChirho?.method === 'PUT') putsChirho++;
		return new Response(bytesChirho);
	}) as typeof fetch;
	const targetChirho = {
		account_chirho: '1'.repeat(32),
		bucket_chirho: 'hinneh-media-chirho',
		email_chirho: 'test@example.invalid',
		api_key_chirho: 'test-credential-chirho'
	};
	await installWordsChirho(
		rootChirho,
		folderChirho,
		[valueChirho],
		receiptsChirho,
		targetChirho,
		fetchChirho
	);
	const chapterChirho = JSON.parse(await readFile(chapterPathChirho, 'utf8'));
	expect(chapterChirho.clips_chirho).toHaveLength(1);
	const clipChirho = chapterChirho.clips_chirho[0];
	expect(clipChirho.start_offset_chirho).toBeGreaterThan(0.2);
	expect(clipChirho.end_offset_chirho).toBeLessThan(1);
	expect(validRecordingWindowChirho(clipChirho)).toBe(true);
	expect(await wordsInstalledChirho(rootChirho, folderChirho, [valueChirho], receiptsChirho)).toBe(
		true
	);
	const publicBytesChirho = await readFile(chapterPathChirho);
	await writeFile(chapterPathChirho, publicBytesChirho.toString('utf8') + ' ');
	expect(await wordsInstalledChirho(rootChirho, folderChirho, [valueChirho], receiptsChirho)).toBe(
		false
	);
	await writeFile(chapterPathChirho, publicBytesChirho);
	await writeFile(audioPathChirho, Buffer.from('changed'));
	expect(await wordsInstalledChirho(rootChirho, folderChirho, [valueChirho], receiptsChirho)).toBe(
		false
	);
	await writeFile(audioPathChirho, bytesChirho);
	expect(
		await wordsInstalledChirho(
			rootChirho,
			folderChirho,
			[valueChirho],
			[{ ...receiptsChirho[0], state_chirho: 'requested' }]
		)
	).toBe(false);
	chapterChirho.clips_chirho.push({
		token_id_chirho: null,
		sha256_chirho: 'natural-clip-kept-chirho'
	});
	await writeFile(chapterPathChirho, JSON.stringify(chapterChirho));
	await installWordsChirho(
		rootChirho,
		folderChirho,
		[valueChirho],
		receiptsChirho,
		null,
		fetchChirho
	);
	expect(putsChirho).toBe(1);
	expect(JSON.parse(await readFile(chapterPathChirho, 'utf8')).clips_chirho).toHaveLength(2);
	await writeFile(sourcePathChirho, 'changed source');
	await expect(
		installWordsChirho(rootChirho, folderChirho, [valueChirho], receiptsChirho, null, fetchChirho)
	).rejects.toThrow(/source chapter changed/);
});
