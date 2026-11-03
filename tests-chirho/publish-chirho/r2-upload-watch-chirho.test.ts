// For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life. — John 3:16 (KJV)

import { mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { afterEach, describe, expect, it } from 'vitest';
import libraryChirho from '../../config-chirho/media-library-chirho.json';
import type { FetchChirho } from '../../scripts-chirho/publish-chirho/cloudflare_preflight_chirho';
import {
	MAX_ATTEMPTS_CHIRHO,
	RemoteRefusalChirho,
	acquireLockChirho,
	loadReceiptsChirho,
	putObjectChirho,
	receiptPathChirho,
	syncOnceChirho,
	watchPassChirho,
	type DepsChirho,
	type TargetChirho
} from '../../scripts-chirho/publish-chirho/r2_upload_watch_chirho';
import { sha256Chirho } from '../../scripts-chirho/publish-chirho/release_rules_chirho';
import {
	baseProjectChirho,
	temporaryRootChirho,
	webpChirho,
	writeProjectChirho,
	type ProjectChirho
} from './support-chirho';

const TARGET_CHIRHO: TargetChirho = {
	account_chirho: 'a'.repeat(32),
	bucket_chirho: libraryChirho.bucket_chirho,
	email_chirho: 'person@example.com',
	api_key_chirho: 'k'.repeat(37)
};
const rootsChirho: string[] = [];

afterEach(async () => {
	await Promise.all(
		rootsChirho.splice(0).map((rootChirho) => rm(rootChirho, { recursive: true, force: true }))
	);
});

async function projectChirho(iconCountChirho = 0): Promise<ProjectChirho> {
	const rootChirho = await temporaryRootChirho();
	rootsChirho.push(rootChirho);
	const fixtureChirho = baseProjectChirho(rootChirho);
	for (let indexChirho = 0; indexChirho < iconCountChirho; indexChirho++) {
		const bytesChirho = webpChirho(100 + indexChirho, 100);
		const pathChirho = `assets-chirho/icons-chirho/extra-${indexChirho}-chirho.webp`;
		fixtureChirho.adapter_chirho.set(pathChirho, bytesChirho);
		fixtureChirho.media_chirho.push({
			key_chirho: 'icons_chirho',
			asset_path_chirho: `/${pathChirho}`,
			sha256_chirho: sha256Chirho(bytesChirho),
			width_chirho: 100 + indexChirho,
			height_chirho: 100,
			art_review_chirho: 'pending'
		});
	}
	await writeProjectChirho(fixtureChirho);
	return fixtureChirho;
}

/** A recording fake of the R2 object API; `statusesChirho` is consumed one call at a time. */
function fakeChirho(statusesChirho: number[] = [], headersChirho: Record<string, string> = {}) {
	const callsChirho: { url_chirho: string; init_chirho: RequestInit }[] = [];
	const sleepsChirho: number[] = [];
	const logsChirho: string[] = [];
	const fetchChirho: FetchChirho = async (urlChirho, initChirho) => {
		callsChirho.push({ url_chirho: urlChirho.toString(), init_chirho: initChirho });
		return new Response(null, { status: statusesChirho.shift() ?? 200, headers: headersChirho });
	};
	const depsChirho: DepsChirho = {
		fetch_chirho: fetchChirho,
		sleep_chirho: async (millisecondsChirho) => {
			sleepsChirho.push(millisecondsChirho);
		},
		log_chirho: (lineChirho) => logsChirho.push(lineChirho),
		now_chirho: () => new Date('2026-10-27T20:00:00Z')
	};
	return { callsChirho, sleepsChirho, logsChirho, depsChirho };
}

async function receiptLinesChirho(rootChirho: string): Promise<string[]> {
	const textChirho = await readFile(
		receiptPathChirho(rootChirho, TARGET_CHIRHO.bucket_chirho),
		'utf8'
	).catch(() => '');
	return textChirho.split('\n').filter(Boolean);
}

describe('continuous R2 media uploads', () => {
	it('plans a dry run without network or receipts', async () => {
		const fixtureChirho = await projectChirho();
		const fakeChirho2 = fakeChirho();
		const resultChirho = await syncOnceChirho(
			fixtureChirho.root_chirho,
			null,
			4,
			fakeChirho2.depsChirho
		);
		expect(resultChirho).toEqual({
			planned_chirho: 2,
			derivatives_chirho: 0,
			received_chirho: 0,
			pending_chirho: 2,
			uploaded_chirho: 0
		});
		expect(fakeChirho2.callsChirho).toEqual([]);
		expect(await receiptLinesChirho(fixtureChirho.root_chirho)).toEqual([]);
	});

	it('uploads each new hash once, with durable receipts and immutable object headers', async () => {
		const fixtureChirho = await projectChirho();
		const rootChirho = fixtureChirho.root_chirho;
		const fakeChirho2 = fakeChirho();
		expect(
			(await syncOnceChirho(rootChirho, TARGET_CHIRHO, 4, fakeChirho2.depsChirho)).uploaded_chirho
		).toBe(2);
		expect(fakeChirho2.callsChirho).toHaveLength(2);
		for (const { url_chirho: urlChirho, init_chirho: initChirho } of fakeChirho2.callsChirho) {
			expect(urlChirho).toMatch(
				new RegExp(
					`/accounts/a{32}/r2/buckets/${TARGET_CHIRHO.bucket_chirho}/objects/media-chirho/sha256-chirho/[0-9a-f]{64}\\.webp$`
				)
			);
			expect(initChirho.method).toBe('PUT');
			expect(initChirho.headers).toMatchObject({
				'content-type': 'image/webp',
				'cache-control': 'public, max-age=31536000, immutable'
			});
		}
		expect(await receiptLinesChirho(rootChirho)).toHaveLength(2);
		expect(
			(await syncOnceChirho(rootChirho, TARGET_CHIRHO, 4, fakeChirho2.depsChirho)).uploaded_chirho
		).toBe(0);
		const newBytesChirho = webpChirho(64, 64);
		await mkdir(join(rootChirho, 'static', 'assets-chirho', 'icons-chirho'), { recursive: true });
		fixtureChirho.adapter_chirho.set('assets-chirho/icons-chirho/new-chirho.webp', newBytesChirho);
		fixtureChirho.media_chirho.push({
			key_chirho: 'icons_chirho',
			asset_path_chirho: '/assets-chirho/icons-chirho/new-chirho.webp',
			sha256_chirho: sha256Chirho(newBytesChirho),
			width_chirho: 64,
			height_chirho: 64,
			art_review_chirho: 'pending'
		});
		await writeProjectChirho(fixtureChirho);
		expect(
			(await syncOnceChirho(rootChirho, TARGET_CHIRHO, 4, fakeChirho2.depsChirho)).uploaded_chirho
		).toBe(1);
		expect(fakeChirho2.callsChirho).toHaveLength(3);
	});

	it('caps one pass at the requested number of uploads', async () => {
		const fixtureChirho = await projectChirho();
		const fakeChirho2 = fakeChirho();
		expect(
			(await syncOnceChirho(fixtureChirho.root_chirho, TARGET_CHIRHO, 4, fakeChirho2.depsChirho, 1))
				.uploaded_chirho
		).toBe(1);
		expect(fakeChirho2.callsChirho).toHaveLength(1);
	});

	it('plans verified derivatives of current records, skipping stale and broken entries', async () => {
		const fixtureChirho = await projectChirho();
		const rootChirho = fixtureChirho.root_chirho;
		const [iconChirho, sceneChirho] = fixtureChirho.media_chirho as { sha256_chirho: string }[];
		const folderChirho = join(rootChirho, 'build-chirho', 'delivery-media-chirho');
		const entryChirho = (
			kindChirho: string,
			sourceChirho: string,
			bytesChirho: Uint8Array,
			sizeChirho: number
		) => {
			const shaChirho = sha256Chirho(bytesChirho);
			return {
				source_paths_chirho: ['/assets-chirho/example-chirho.webp'],
				source_sha256_chirho: sourceChirho,
				kind_chirho: kindChirho,
				delivery_path_chirho: `objects-chirho/${shaChirho.slice(0, 2)}-chirho/${shaChirho}-chirho.webp`,
				delivery_sha256_chirho: shaChirho,
				bytes_chirho: bytesChirho.byteLength,
				width_chirho: sizeChirho,
				height_chirho: sizeChirho,
				recipe_chirho: { quality_chirho: 80 }
			};
		};
		const goodChirho = entryChirho('icon', iconChirho.sha256_chirho, webpChirho(127, 127), 127);
		const staleChirho = entryChirho('icon', 'e'.repeat(64), webpChirho(125, 125), 125);
		const brokenChirho = entryChirho('scene', sceneChirho.sha256_chirho, webpChirho(390, 390), 390);
		for (const [entryChirho2, bytesChirho] of [
			[goodChirho, webpChirho(127, 127)],
			[brokenChirho, webpChirho(380, 380)]
		] as const) {
			const pathChirho = join(folderChirho, entryChirho2.delivery_path_chirho);
			await mkdir(join(pathChirho, '..'), { recursive: true });
			await writeFile(pathChirho, bytesChirho);
		}
		await writeFile(
			join(folderChirho, 'mapping-chirho.json'),
			JSON.stringify({
				schema_version_chirho: 1,
				entries_chirho: [goodChirho, staleChirho, brokenChirho]
			})
		);
		const fakeChirho2 = fakeChirho();
		expect(await syncOnceChirho(rootChirho, null, 4, fakeChirho2.depsChirho)).toMatchObject({
			planned_chirho: 3,
			derivatives_chirho: 1,
			pending_chirho: 3
		});
		expect(
			fakeChirho2.logsChirho.some((lineChirho) => /1 delivery derivative issue/.test(lineChirho))
		).toBe(true);
		await syncOnceChirho(rootChirho, TARGET_CHIRHO, 4, fakeChirho2.depsChirho);
		expect(
			fakeChirho2.callsChirho.some((callChirho) =>
				callChirho.url_chirho.includes(goodChirho.delivery_sha256_chirho)
			)
		).toBe(true);
		expect(fakeChirho2.callsChirho).toHaveLength(3);
	});

	it('keeps polling a capped backlog until it drains, then idles', async () => {
		const fixtureChirho = await projectChirho();
		const fakeChirho2 = fakeChirho();
		let stateChirho = { done_signature_chirho: '', last_error_chirho: '' };
		const passChirho = () =>
			watchPassChirho(
				fixtureChirho.root_chirho,
				TARGET_CHIRHO,
				4,
				1,
				fakeChirho2.depsChirho,
				stateChirho,
				false
			);
		stateChirho = await passChirho();
		expect(fakeChirho2.callsChirho).toHaveLength(1);
		expect(stateChirho.done_signature_chirho).toBe('');
		stateChirho = await passChirho();
		expect(fakeChirho2.callsChirho).toHaveLength(2);
		expect(stateChirho.done_signature_chirho).not.toBe('');
		stateChirho = await passChirho();
		expect(fakeChirho2.callsChirho).toHaveLength(2);
	});

	it('adopts a verified bootstrap receipt and ignores an unverified one', async () => {
		const fixtureChirho = await projectChirho();
		const rootChirho = fixtureChirho.root_chirho;
		const [iconChirho, sceneChirho] = fixtureChirho.media_chirho as { sha256_chirho: string }[];
		const bootstrapChirho = join(rootChirho, 'build-chirho', 'r2-bootstrap-chirho');
		await mkdir(bootstrapChirho, { recursive: true });
		const receiptChirho = (shaChirho: string, readbackChirho: string) =>
			JSON.stringify({
				bucket_chirho: TARGET_CHIRHO.bucket_chirho,
				key_chirho: `media-chirho/sha256-chirho/${shaChirho}.webp`,
				bytes_chirho: 30,
				readback_sha256_chirho: readbackChirho,
				verified_at_chirho: '2026-10-27T20:04:25.730Z'
			});
		await writeFile(
			join(bootstrapChirho, 'first-upload-chirho.json'),
			receiptChirho(iconChirho.sha256_chirho, iconChirho.sha256_chirho)
		);
		await writeFile(
			join(bootstrapChirho, 'unverified-chirho.json'),
			receiptChirho(sceneChirho.sha256_chirho, 'f'.repeat(64))
		);
		const fakeChirho2 = fakeChirho();
		const resultChirho = await syncOnceChirho(rootChirho, TARGET_CHIRHO, 4, fakeChirho2.depsChirho);
		expect(resultChirho).toMatchObject({ received_chirho: 1, uploaded_chirho: 1 });
		expect(fakeChirho2.callsChirho[0].url_chirho).toContain(sceneChirho.sha256_chirho);
	});

	it('adopts bootstrap batch lines only where key and size match the current plan', async () => {
		const fixtureChirho = await projectChirho();
		const rootChirho = fixtureChirho.root_chirho;
		const [iconChirho, sceneChirho] = fixtureChirho.media_chirho as { sha256_chirho: string }[];
		const bootstrapChirho = join(rootChirho, 'build-chirho', 'r2-bootstrap-chirho');
		await mkdir(bootstrapChirho, { recursive: true });
		const lineChirho = (shaChirho: string, bytesChirho: number) =>
			JSON.stringify({
				bucket_chirho: TARGET_CHIRHO.bucket_chirho,
				key_chirho: `media-chirho/sha256-chirho/${shaChirho}.webp`,
				bytes_chirho: bytesChirho,
				asset_paths_chirho: ['/assets-chirho/example-chirho.webp'],
				uploaded_at_chirho: '2026-10-27T20:10:00Z'
			});
		await writeFile(
			join(bootstrapChirho, 'uploads-chirho.jsonl'),
			`${lineChirho(iconChirho.sha256_chirho, 30)}\n${lineChirho(sceneChirho.sha256_chirho, 999)}\n`
		);
		const fakeChirho2 = fakeChirho();
		const resultChirho = await syncOnceChirho(rootChirho, TARGET_CHIRHO, 4, fakeChirho2.depsChirho);
		expect(resultChirho).toMatchObject({ received_chirho: 1, uploaded_chirho: 1 });
		expect(fakeChirho2.callsChirho[0].url_chirho).toContain(sceneChirho.sha256_chirho);
	});

	it('retries 5xx and 429 with Retry-After, then succeeds', async () => {
		const fixtureChirho = await projectChirho();
		fixtureChirho.media_chirho.pop();
		await writeProjectChirho(fixtureChirho);
		const fakeChirho2 = fakeChirho([503, 429, 200], { 'retry-after': '2' });
		expect(
			(await syncOnceChirho(fixtureChirho.root_chirho, TARGET_CHIRHO, 4, fakeChirho2.depsChirho))
				.uploaded_chirho
		).toBe(1);
		expect(fakeChirho2.callsChirho).toHaveLength(3);
		expect(fakeChirho2.sleepsChirho).toEqual([2000, 2000]);
	});

	it('gives up after a bounded number of attempts and writes no receipt', async () => {
		const fixtureChirho = await projectChirho();
		fixtureChirho.media_chirho.pop();
		await writeProjectChirho(fixtureChirho);
		const fakeChirho2 = fakeChirho(new Array(10).fill(500));
		await expect(
			syncOnceChirho(fixtureChirho.root_chirho, TARGET_CHIRHO, 4, fakeChirho2.depsChirho)
		).rejects.toThrow(`failed ${MAX_ATTEMPTS_CHIRHO} times`);
		expect(fakeChirho2.callsChirho).toHaveLength(MAX_ATTEMPTS_CHIRHO);
		expect(fakeChirho2.sleepsChirho).toHaveLength(MAX_ATTEMPTS_CHIRHO - 1);
		expect(await receiptLinesChirho(fixtureChirho.root_chirho)).toEqual([]);
	});

	it('stops on a remote refusal without starting more uploads or writing a receipt', async () => {
		const fixtureChirho = await projectChirho();
		const fakeChirho2 = fakeChirho([403]);
		await expect(
			syncOnceChirho(fixtureChirho.root_chirho, TARGET_CHIRHO, 1, fakeChirho2.depsChirho)
		).rejects.toBeInstanceOf(RemoteRefusalChirho);
		expect(fakeChirho2.callsChirho).toHaveLength(1);
		expect(await receiptLinesChirho(fixtureChirho.root_chirho)).toEqual([]);
	});

	it('keeps concurrent uploads within the limit', async () => {
		const fixtureChirho = await projectChirho(6);
		let activeChirho = 0;
		let peakChirho = 0;
		const fakeChirho2 = fakeChirho();
		fakeChirho2.depsChirho.fetch_chirho = async () => {
			activeChirho++;
			peakChirho = Math.max(peakChirho, activeChirho);
			await new Promise((doneChirho) => setTimeout(doneChirho, 5));
			activeChirho--;
			return new Response(null, { status: 200 });
		};
		expect(
			(await syncOnceChirho(fixtureChirho.root_chirho, TARGET_CHIRHO, 2, fakeChirho2.depsChirho))
				.uploaded_chirho
		).toBe(8);
		expect(peakChirho).toBe(2);
	});

	it('tolerates a receipt tail torn by a crash', async () => {
		const fixtureChirho = await projectChirho();
		const rootChirho = fixtureChirho.root_chirho;
		const fakeChirho2 = fakeChirho();
		await syncOnceChirho(rootChirho, TARGET_CHIRHO, 4, fakeChirho2.depsChirho);
		const pathChirho = receiptPathChirho(rootChirho, TARGET_CHIRHO.bucket_chirho);
		const [firstChirho] = await receiptLinesChirho(rootChirho);
		await writeFile(pathChirho, `${firstChirho}\n{"key_chirho":"media-chirho/sha256-ch`);
		const receiptsChirho = await loadReceiptsChirho(
			rootChirho,
			TARGET_CHIRHO.bucket_chirho,
			fakeChirho2.depsChirho.log_chirho
		);
		expect(receiptsChirho.size).toBe(1);
		expect(
			fakeChirho2.logsChirho.some((lineChirho) => /1 unreadable receipt/.test(lineChirho))
		).toBe(true);
		expect(
			(await syncOnceChirho(rootChirho, TARGET_CHIRHO, 4, fakeChirho2.depsChirho)).uploaded_chirho
		).toBe(1);
	});

	it('allows one uploader at a time and recovers a lock left by a dead process', async () => {
		const rootChirho = await temporaryRootChirho();
		rootsChirho.push(rootChirho);
		const lockChirho = join(rootChirho, 'upload-watch-chirho.lock');
		const releaseChirho = await acquireLockChirho(lockChirho);
		await expect(acquireLockChirho(lockChirho)).rejects.toThrow(/holds the lock/);
		await releaseChirho();
		await writeFile(lockChirho, '999999 0');
		const recoveredChirho = await acquireLockChirho(lockChirho);
		expect((await readFile(lockChirho, 'utf8')).startsWith(`${process.pid} `)).toBe(true);
		await recoveredChirho();
	});

	it('never writes outside the configured library and never logs credentials', async () => {
		const fakeChirho2 = fakeChirho([503, 200]);
		for (const [targetChirho, keyChirho] of [
			[
				{ ...TARGET_CHIRHO, bucket_chirho: 'lexicon-assets-chirho' },
				`media-chirho/sha256-chirho/${'a'.repeat(64)}.webp`
			],
			[TARGET_CHIRHO, 'media-chirho/../index.html']
		] as const)
			await expect(
				putObjectChirho(
					targetChirho,
					keyChirho,
					new Uint8Array(1),
					fakeChirho2.depsChirho.fetch_chirho
				)
			).rejects.toBeInstanceOf(RemoteRefusalChirho);
		expect(fakeChirho2.callsChirho).toEqual([]);
		const fixtureChirho = await projectChirho();
		fixtureChirho.media_chirho.pop();
		await writeProjectChirho(fixtureChirho);
		await syncOnceChirho(fixtureChirho.root_chirho, TARGET_CHIRHO, 4, fakeChirho2.depsChirho);
		expect(fakeChirho2.logsChirho.length).toBeGreaterThan(0);
		for (const lineChirho of fakeChirho2.logsChirho)
			for (const secretChirho of [
				TARGET_CHIRHO.api_key_chirho,
				TARGET_CHIRHO.email_chirho,
				TARGET_CHIRHO.account_chirho
			])
				expect(lineChirho).not.toContain(secretChirho);
	});
});
