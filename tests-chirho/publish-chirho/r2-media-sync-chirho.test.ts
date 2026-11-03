// For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life. — John 3:16 (KJV)

import { rm, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { afterEach, describe, expect, it } from 'vitest';
import libraryChirho from '../../config-chirho/media-library-chirho.json';
import {
	KEY_PATTERN_CHIRHO,
	applyPlanChirho,
	planUploadsChirho,
	putArgumentsChirho,
	type UploadChirho
} from '../../scripts-chirho/publish-chirho/r2_media_sync_chirho';
import { RefusalChirho } from '../../scripts-chirho/publish-chirho/release_rules_chirho';
import {
	baseProjectChirho,
	temporaryRootChirho,
	webpChirho,
	writeProjectChirho
} from './support-chirho';

const rootsChirho: string[] = [];

afterEach(async () => {
	await Promise.all(
		rootsChirho.splice(0).map((rootChirho) => rm(rootChirho, { recursive: true, force: true }))
	);
});

async function rootWithMediaChirho(): Promise<string> {
	const rootChirho = await temporaryRootChirho();
	rootsChirho.push(rootChirho);
	const projectChirho = baseProjectChirho(rootChirho);
	projectChirho.media_chirho[1].art_review_chirho = 'pending';
	await writeProjectChirho(projectChirho);
	return rootChirho;
}

describe('private R2 media library sync', () => {
	it('plans one content-addressed key per verified file, with a stable plan id', async () => {
		const rootChirho = await rootWithMediaChirho();
		const planChirho = await planUploadsChirho(rootChirho);
		expect(planChirho.bucket_chirho).toBe(libraryChirho.bucket_chirho);
		expect(planChirho.uploads_chirho).toHaveLength(2);
		expect(
			planChirho.uploads_chirho.every((uploadChirho) =>
				KEY_PATTERN_CHIRHO.test(uploadChirho.key_chirho)
			)
		).toBe(true);
		expect(
			planChirho.uploads_chirho.flatMap((uploadChirho) => uploadChirho.review_chirho).sort()
		).toEqual(['approved', 'pending']);
		expect((await planUploadsChirho(rootChirho)).plan_id_chirho).toBe(planChirho.plan_id_chirho);
	});

	it('refuses to plan a declared file whose bytes changed', async () => {
		const rootChirho = await rootWithMediaChirho();
		await writeFile(
			join(rootChirho, 'static', 'assets-chirho', 'scene-chirho.webp'),
			webpChirho(400, 301)
		);
		await expect(planUploadsChirho(rootChirho)).rejects.toThrow(/declared sha256/);
	});

	it('applies only to the configured bucket, with the exact plan id and content-address keys', async () => {
		const planChirho = await planUploadsChirho(await rootWithMediaChirho());
		const keysChirho: string[] = [];
		const uploadChirho = async (itemChirho: UploadChirho) => {
			keysChirho.push(itemChirho.key_chirho);
		};
		await expect(
			applyPlanChirho(planChirho, 'lexicon-assets-chirho', planChirho.plan_id_chirho, uploadChirho)
		).rejects.toBeInstanceOf(RefusalChirho);
		await expect(
			applyPlanChirho(planChirho, libraryChirho.bucket_chirho, 'f'.repeat(64), uploadChirho)
		).rejects.toThrow(/plan id/);
		const tamperedChirho = {
			...planChirho,
			uploads_chirho: [
				{ ...planChirho.uploads_chirho[0], key_chirho: 'media-chirho/../index.html' }
			]
		};
		await expect(
			applyPlanChirho(
				tamperedChirho,
				libraryChirho.bucket_chirho,
				planChirho.plan_id_chirho,
				uploadChirho
			)
		).rejects.toThrow(/refusing object key/);
		expect(keysChirho).toEqual([]);
		expect(
			await applyPlanChirho(
				planChirho,
				libraryChirho.bucket_chirho,
				planChirho.plan_id_chirho,
				uploadChirho
			)
		).toBe(2);
		expect(keysChirho).toEqual(
			planChirho.uploads_chirho.map((itemChirho) => itemChirho.key_chirho)
		);
	});

	it('names the upload target explicitly and refuses keys outside the scheme', () => {
		const uploadChirho: UploadChirho = {
			key_chirho: `media-chirho/sha256-chirho/${'a'.repeat(64)}.webp`,
			file_chirho: '/library-chirho/a.webp',
			bytes_chirho: 1,
			asset_paths_chirho: [],
			review_chirho: []
		};
		expect(putArgumentsChirho('bucket-chirho', uploadChirho, { remote_chirho: true })).toContain(
			'--remote'
		);
		const localChirho = putArgumentsChirho('bucket-chirho', uploadChirho, {
			remote_chirho: false,
			persist_chirho: '/state-chirho'
		});
		expect(localChirho).toEqual(
			expect.arrayContaining(['--local', '--persist-to', '/state-chirho'])
		);
		expect(localChirho).not.toContain('--remote');
		expect(() =>
			putArgumentsChirho(
				'bucket-chirho',
				{ ...uploadChirho, key_chirho: 'site-chirho/index.html' },
				{ remote_chirho: true }
			)
		).toThrow(RefusalChirho);
	});
});
