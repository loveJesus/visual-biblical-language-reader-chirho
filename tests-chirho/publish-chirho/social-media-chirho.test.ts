// For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life. — John 3:16 (KJV)
import { expect, it, vi as viChirho } from 'vitest';
import { createArtworkWorkerChirho } from '../../workers-chirho/artwork-chirho/index-chirho';
import { sha256Chirho } from '../../scripts-chirho/publish-chirho/release_rules_chirho';
import { SHARE_IMAGE_PATH_CHIRHO } from '../../src/lib/site-chirho';

it('serves only the declared social JPEG with correct type, cached bytes and zero-read HEAD/304', async () => {
	const bytesChirho = new Uint8Array([255, 216, 255, 224, 0, 2, 255, 217]);
	const shaChirho = sha256Chirho(bytesChirho);
	const getChirho = viChirho.fn(async () => ({
		body: new Response(bytesChirho).body!,
		size: bytesChirho.length
	}));
	const cachedChirho = new Map<string, Response>();
	const pendingChirho: Promise<unknown>[] = [];
	const workerChirho = createArtworkWorkerChirho(
		{
			schema_version_chirho: 1,
			hostname_chirho: 'hinneh.us',
			sitekey_chirho: 'test-sitekey-chirho',
			verses_chirho: {},
			assets_chirho: {
				[SHARE_IMAGE_PATH_CHIRHO]: {
					format_chirho: 'jpeg',
					sha256_chirho: shaChirho,
					key_chirho: `media-chirho/sha256-chirho/${shaChirho}.jpg`,
					bytes_chirho: bytesChirho.length,
					width_chirho: 1200,
					height_chirho: 630
				}
			}
		},
		{
			cache_chirho: {
				match: async (requestChirho) => cachedChirho.get(requestChirho.url)?.clone(),
				put: async (requestChirho, responseChirho) => {
					cachedChirho.set(requestChirho.url, responseChirho.clone());
				}
			}
		}
	);
	const environmentChirho = {
		ASSETS_CHIRHO: { fetch: async () => new Response(null, { status: 404 }) },
		HINNEH_MEDIA_CHIRHO: { get: getChirho, head: async () => null, put: async () => null }
	};
	const callChirho = (pathChirho = SHARE_IMAGE_PATH_CHIRHO, initChirho: RequestInit = {}) =>
		workerChirho.fetch(
			new Request('https://hinneh.us' + pathChirho, initChirho),
			environmentChirho,
			{ waitUntil: (promiseChirho) => pendingChirho.push(promiseChirho) }
		);
	expect((await callChirho(undefined, { method: 'HEAD' })).headers.get('content-type')).toBe(
		'image/jpeg'
	);
	expect(getChirho).not.toHaveBeenCalled();
	const firstChirho = await callChirho();
	expect(firstChirho.status).toBe(200);
	expect(new Uint8Array(await firstChirho.arrayBuffer())).toEqual(bytesChirho);
	await Promise.all(pendingChirho);
	expect((await callChirho(SHARE_IMAGE_PATH_CHIRHO + '?untrusted_chirho=x')).status).toBe(200);
	expect(
		(await callChirho(undefined, { headers: { 'If-None-Match': `"${shaChirho}"` } })).status
	).toBe(304);
	expect((await callChirho('/assets-chirho/site-chirho/private-chirho.jpg')).status).toBe(404);
	expect((await callChirho(undefined, { method: 'POST' })).status).toBe(405);
	expect(getChirho).toHaveBeenCalledTimes(1);
});
