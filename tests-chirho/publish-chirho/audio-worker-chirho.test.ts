// For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life. — John 3:16 (KJV)
import { it, expect, vi as viChirho } from 'vitest';
import { createArtworkWorkerChirho } from '../../workers-chirho/artwork-chirho/index-chirho';
import { sha256Chirho } from '../../scripts-chirho/publish-chirho/release_rules_chirho';
import type { WorkerEnvironmentChirho } from '../../workers-chirho/artwork-chirho/types-chirho';

it('serves only declared verified R2 audio, with no reads for unknown hashes, HEAD, ETags or writes', async () => {
	const bytesChirho = new TextEncoder().encode('verified-recording-chirho');
	const shaChirho = sha256Chirho(bytesChirho);
	const pendingChirho: Promise<unknown>[] = [];
	const cacheChirho = new Map<string, Response>();
	const getChirho = viChirho.fn(async () => ({
		body: new Response(bytesChirho).body!,
		size: bytesChirho.length
	}));
	const workerChirho = createArtworkWorkerChirho(
		{
			schema_version_chirho: 1,
			assets_chirho: {},
			audio_chirho: { [shaChirho]: bytesChirho.length },
			verses_chirho: {},
			hostname_chirho: 'hinneh.bible.systems',
			sitekey_chirho: ''
		},
		{
			cache_chirho: {
				match: async (requestChirho) => cacheChirho.get(requestChirho.url)?.clone(),
				put: async (requestChirho, responseChirho) => {
					cacheChirho.set(requestChirho.url, responseChirho.clone());
				}
			}
		}
	);
	const environmentChirho: WorkerEnvironmentChirho = {
		ASSETS_CHIRHO: { fetch: async () => new Response('static') },
		HINNEH_MEDIA_CHIRHO: { get: getChirho, head: async () => null, put: async () => null }
	};
	const callChirho = (pathChirho: string, initChirho?: RequestInit) =>
		workerChirho.fetch(
			new Request('https://hinneh.bible.systems' + pathChirho, initChirho),
			environmentChirho,
			{ waitUntil: (promiseChirho) => pendingChirho.push(promiseChirho) }
		);
	const pathChirho = '/audio-chirho/sha256-chirho/' + shaChirho + '-chirho.mp3';
	expect(
		(await callChirho('/audio-chirho/sha256-chirho/' + '0'.repeat(64) + '-chirho.mp3')).status
	).toBe(404);
	expect((await callChirho(pathChirho, { method: 'HEAD' })).status).toBe(200);
	expect(
		(await callChirho(pathChirho, { headers: { 'if-none-match': '"' + shaChirho + '"' } })).status
	).toBe(304);
	expect((await callChirho(pathChirho, { method: 'POST' })).status).toBe(405);
	expect(getChirho).not.toHaveBeenCalled();
	const responseChirho = await callChirho(pathChirho + '?one');
	expect(responseChirho.headers.get('content-type')).toBe('audio/mpeg');
	expect(responseChirho.headers.get('x-hinneh-audio-chirho')).toBe('r2');
	expect(sha256Chirho(new Uint8Array(await responseChirho.arrayBuffer()))).toBe(shaChirho);
	await Promise.all(pendingChirho);
	expect((await callChirho(pathChirho + '?two')).status).toBe(200);
	expect(getChirho).toHaveBeenCalledTimes(1);
	expect(getChirho).toHaveBeenCalledWith('audio-chirho/sha256-chirho/' + shaChirho + '.mp3');
});
