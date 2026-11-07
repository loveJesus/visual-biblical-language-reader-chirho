// For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life. — John 3:16 (KJV)
import { it as itChirho, expect as expectChirho, vi as viChirho } from 'vitest';
import { createArtworkWorkerChirho } from '../../workers-chirho/artwork-chirho/index-chirho';
import { VIDEO_LIMIT_CHIRHO } from '../../workers-chirho/artwork-chirho/video-chirho';
import { sha256Chirho } from '../../scripts-chirho/publish-chirho/release_rules_chirho';
import type {
	MediaCatalogueChirho,
	WorkerEnvironmentChirho
} from '../../workers-chirho/artwork-chirho/types-chirho';

function fixtureChirho(bodyChirho?: Uint8Array) {
	const bytesChirho = Uint8Array.from({ length: 64 }, (_, indexChirho) => indexChirho);
	const shaChirho = sha256Chirho(bytesChirho);
	const pathChirho = `/video-chirho/sha256-chirho/${shaChirho}-chirho.mp4`;
	const catalogueChirho: MediaCatalogueChirho = {
		schema_version_chirho: 1,
		assets_chirho: {},
		video_chirho: { [shaChirho]: bytesChirho.length },
		verses_chirho: {},
		hostname_chirho: 'hinneh.us',
		sitekey_chirho: 'test-public-chirho'
	};
	const getChirho = viChirho.fn(async () => ({
		size: bytesChirho.length,
		body: new Response((bodyChirho ?? bytesChirho).slice()).body!
	}));
	const cacheChirho = new Map<string, Response>();
	const pendingChirho: Promise<unknown>[] = [];
	const workerChirho = createArtworkWorkerChirho(catalogueChirho, {
		cache_chirho: {
			match: async (requestChirho) => cacheChirho.get(requestChirho.url)?.clone(),
			put: async (requestChirho, responseChirho) => {
				cacheChirho.set(requestChirho.url, responseChirho.clone());
			}
		}
	});
	const environmentChirho: WorkerEnvironmentChirho = {
		ASSETS_CHIRHO: { fetch: async () => new Response('static') },
		HINNEH_MEDIA_CHIRHO: { get: getChirho, head: async () => null, put: async () => null }
	};
	const callChirho = (initChirho: RequestInit = {}, targetChirho = pathChirho) =>
		workerChirho.fetch(
			new Request(`https://hinneh.us${targetChirho}`, initChirho),
			environmentChirho,
			{
				waitUntil: (promiseChirho) => {
					pendingChirho.push(promiseChirho);
				}
			}
		);
	return {
		callChirho,
		bytesChirho,
		getChirho,
		pendingChirho,
		cacheChirho,
		pathChirho,
		shaChirho,
		catalogueChirho
	};
}

itChirho(
	'serves Safari byte probes, open-ended and suffix ranges from the verified full object',
	async () => {
		const fixtureValueChirho = fixtureChirho();
		for (const [rangeChirho, startChirho, endChirho] of [
			['bytes=0-1', 0, 1],
			['bytes=60-', 60, 63],
			['bytes=-3', 61, 63],
			['bytes=60-100', 60, 63]
		] as const) {
			const responseChirho = await fixtureValueChirho.callChirho({
				headers: { Range: rangeChirho }
			});
			expectChirho(responseChirho.status).toBe(206);
			expectChirho(responseChirho.headers.get('content-range')).toBe(
				`bytes ${startChirho}-${endChirho}/64`
			);
			expectChirho(responseChirho.headers.get('content-length')).toBe(
				String(endChirho - startChirho + 1)
			);
			expectChirho(responseChirho.headers.get('accept-ranges')).toBe('bytes');
			expectChirho(responseChirho.headers.get('content-type')).toBe('video/mp4');
			expectChirho(new Uint8Array(await responseChirho.arrayBuffer())).toEqual(
				fixtureValueChirho.bytesChirho.slice(startChirho, endChirho + 1)
			);
			await Promise.all(fixtureValueChirho.pendingChirho);
		}
		expectChirho(fixtureValueChirho.getChirho).toHaveBeenCalledTimes(1);
	}
);

itChirho('HEAD,304,unknown,invalid,multipart and oversized ranges do not touch R2', async () => {
	const fixtureValueChirho = fixtureChirho();
	expectChirho(
		(await fixtureValueChirho.callChirho({ method: 'HEAD', headers: { Range: 'bytes=0-1' } }))
			.status
	).toBe(200);
	expectChirho(
		(
			await fixtureValueChirho.callChirho({
				headers: { 'If-None-Match': `W/"${fixtureValueChirho.shaChirho}"` }
			})
		).status
	).toBe(304);
	expectChirho(
		(
			await fixtureValueChirho.callChirho(
				{},
				'/video-chirho/sha256-chirho/' + '0'.repeat(64) + '-chirho.mp4'
			)
		).status
	).toBe(404);
	for (const rangeChirho of [
		'bytes=64-',
		'bytes=3-1',
		'bytes=-0',
		'bytes=0-1,3-4',
		'bytes=-',
		'bytes=' + '9'.repeat(201) + '-'
	]) {
		const responseChirho = await fixtureValueChirho.callChirho({ headers: { Range: rangeChirho } });
		expectChirho(responseChirho.status).toBe(416);
		expectChirho(responseChirho.headers.get('content-range')).toBe('bytes */64');
	}
	fixtureValueChirho.catalogueChirho.video_chirho![fixtureValueChirho.shaChirho] =
		VIDEO_LIMIT_CHIRHO + 1;
	expectChirho((await fixtureValueChirho.callChirho()).status).toBe(503);
	expectChirho(fixtureValueChirho.getChirho).not.toHaveBeenCalled();
});

itChirho(
	'If-Range mismatch returns the complete verified body, with no range-cache poisoning',
	async () => {
		const fixtureValueChirho = fixtureChirho();
		const responseChirho = await fixtureValueChirho.callChirho({
			headers: { Range: 'bytes=0-1', 'If-Range': '"old"' }
		});
		expectChirho(responseChirho.status).toBe(200);
		expectChirho(responseChirho.headers.get('content-range')).toBeNull();
		expectChirho(new Uint8Array(await responseChirho.arrayBuffer())).toEqual(
			fixtureValueChirho.bytesChirho
		);
		await Promise.all(fixtureValueChirho.pendingChirho);
		expectChirho([...fixtureValueChirho.cacheChirho.values()][0].status).toBe(200);
		expectChirho(
			[...fixtureValueChirho.cacheChirho.values()][0].headers.get('content-range')
		).toBeNull();
	}
);

itChirho('corrupt, truncated and overflowing objects refuse and are never cached', async () => {
	for (const bodyChirho of [new Uint8Array(64), new Uint8Array(63), new Uint8Array(65)]) {
		const fixtureValueChirho = fixtureChirho(bodyChirho);
		expectChirho(
			(await fixtureValueChirho.callChirho({ headers: { Range: 'bytes=0-1' } })).status
		).toBe(502);
		expectChirho(fixtureValueChirho.pendingChirho).toHaveLength(0);
		expectChirho(fixtureValueChirho.cacheChirho.size).toBe(0);
	}
});
