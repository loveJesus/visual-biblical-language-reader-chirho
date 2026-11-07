// For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life. — John 3:16 (KJV)

import { readFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { parseConfigFileTextToJson } from 'typescript';
import { describe, expect, it } from 'vitest';
import { SITE_HOSTNAMES_CHIRHO } from '../../src/lib/site-chirho';

const CONFIG_PATH_CHIRHO = resolve(
	import.meta.dirname,
	'../../config-chirho/wrangler-publish-chirho.jsonc'
);

describe('static reader with bounded artwork Worker', () => {
	it('keeps text static, scopes artwork to one private bucket, and has no D1', async () => {
		const parsedChirho = parseConfigFileTextToJson(
			CONFIG_PATH_CHIRHO,
			await readFile(CONFIG_PATH_CHIRHO, 'utf8')
		);
		expect(parsedChirho.error).toBeUndefined();
		const configChirho = parsedChirho.config;
		expect(configChirho.main).toBe('../build-chirho/artwork-worker-chirho.mjs');
		expect(configChirho.assets.binding).toBe('ASSETS_CHIRHO');
		expect(configChirho.assets.run_worker_first).toEqual([
			'/assets-chirho/*',
			'/audio-chirho/sha256-chirho/*',
			'/video-chirho/*',
			'/api-chirho/*'
		]);
		expect(configChirho.r2_buckets).toEqual([
			{ binding: 'HINNEH_MEDIA_CHIRHO', bucket_name: 'hinneh-media-chirho' }
		]);
		expect(configChirho.d1_databases).toBeUndefined();
		expect(configChirho.kv_namespaces).toBeUndefined();
		expect(configChirho.vars).toBeUndefined();
		expect(configChirho.assets.not_found_handling).toBe('404-page');
		expect(resolve(dirname(CONFIG_PATH_CHIRHO), configChirho.assets.directory)).toBe(
			resolve(import.meta.dirname, '../../build-chirho/public-chirho')
		);
		expect(configChirho.routes).toEqual(
			SITE_HOSTNAMES_CHIRHO.map((hostnameChirho) => ({
				pattern: hostnameChirho,
				custom_domain: true
			}))
		);
		expect(configChirho.workers_dev).toBe(false);
		expect(configChirho.preview_urls).toBe(false);
	});
});
