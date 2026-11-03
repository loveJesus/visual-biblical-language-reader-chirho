// For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life. — John 3:16 (KJV)
import { describe, it, expect, vi as viChirho } from 'vitest';
import { createArtworkWorkerChirho } from '../../workers-chirho/artwork-chirho/index-chirho';
import type {
	MediaCatalogueChirho,
	WorkerEnvironmentChirho
} from '../../workers-chirho/artwork-chirho/types-chirho';
import { sha256Chirho } from '../../scripts-chirho/publish-chirho/release_rules_chirho';
import { SITE_HOSTNAMES_CHIRHO } from '../../src/lib/site-chirho';

function fixtureChirho(hostnameChirho = 'hinneh.bible.systems') {
	const bytesChirho = new TextEncoder().encode('verified-artwork-chirho');
	const shaChirho = sha256Chirho(bytesChirho);
	const pathChirho = '/assets-chirho/scenes-chirho/test-chirho.webp';
	const factChirho = {
		sha256_chirho: shaChirho,
		key_chirho: `media-chirho/sha256-chirho/${shaChirho}.webp`,
		bytes_chirho: bytesChirho.length,
		width_chirho: 1200,
		height_chirho: 900
	};
	const catalogueChirho: MediaCatalogueChirho = {
		schema_version_chirho: 1,
		assets_chirho: { [pathChirho]: factChirho },
		verses_chirho: { 'Gen.1.1': true },
		hostname_chirho: hostnameChirho,
		hostnames_chirho: SITE_HOSTNAMES_CHIRHO,
		sitekey_chirho: 'real-public-key-chirho'
	};
	const cacheChirho = new Map<string, Response>();
	const objectsChirho = new Map<string, string>();
	const pendingChirho: Promise<unknown>[] = [];
	const getChirho = viChirho.fn(async () => ({
		body: new Response(bytesChirho).body!,
		size: bytesChirho.length
	}));
	const putChirho = viChirho.fn(async (keyChirho: string, valueChirho: string) => {
		if (objectsChirho.has(keyChirho)) return null;
		objectsChirho.set(keyChirho, valueChirho);
		return {};
	});
	const headChirho = viChirho.fn(async (keyChirho: string) =>
		objectsChirho.has(keyChirho) ? { size: objectsChirho.get(keyChirho)!.length } : null
	);
	const fetchChirho = viChirho.fn<
		(inputChirho: RequestInfo | URL, initChirho?: RequestInit) => Promise<Response>
	>(async () =>
		Response.json({
			success: true,
			hostname: hostnameChirho,
			action: 'image_artifact_chirho'
		})
	);
	const environmentChirho: WorkerEnvironmentChirho = {
		ASSETS_CHIRHO: { fetch: async () => new Response('static') },
		HINNEH_MEDIA_CHIRHO: { get: getChirho, put: putChirho, head: headChirho },
		TURNSTILE_SECRET_KEY_CHIRHO: 'test-secret-chirho',
		ARTIFACT_RATE_SECRET_CHIRHO: 'test-rate-chirho'
	};
	const workerChirho = createArtworkWorkerChirho(catalogueChirho, {
		cache_chirho: {
			match: async (requestChirho) => cacheChirho.get(requestChirho.url)?.clone(),
			put: async (requestChirho, responseChirho) => {
				cacheChirho.set(requestChirho.url, responseChirho.clone());
			}
		},
		fetch_chirho: fetchChirho as unknown as typeof fetch,
		now_chirho: () => 1793556000000
	});
	const callChirho = (pathOrRequestChirho: string | Request, initChirho?: RequestInit) =>
		workerChirho.fetch(
			typeof pathOrRequestChirho === 'string'
				? new Request(`https://${hostnameChirho}${pathOrRequestChirho}`, initChirho)
				: pathOrRequestChirho,
			environmentChirho,
			{
				waitUntil: (promiseChirho) => {
					pendingChirho.push(promiseChirho);
				}
			}
		);
	const reportChirho = (
		overridesChirho: Record<string, unknown> = {},
		headersChirho: Record<string, string> = {}
	) =>
		callChirho('/api-chirho/artifact-flags-chirho', {
			method: 'POST',
			headers: {
				origin: `https://${hostnameChirho}`,
				'content-type': 'application/json',
				'cf-connecting-ip': '192.0.2.1',
				...headersChirho
			},
			body: JSON.stringify({
				asset_path_chirho: pathChirho,
				sha256_chirho: shaChirho,
				verse_id_chirho: 'Gen.1.1',
				reason_chirho: 'anatomy',
				turnstile_token_chirho: 'test-token-chirho',
				...overridesChirho
			})
		});
	return {
		callChirho,
		reportChirho,
		environmentChirho,
		getChirho,
		putChirho,
		headChirho,
		fetchChirho,
		pendingChirho,
		pathChirho,
		shaChirho,
		bytesChirho,
		objectsChirho
	};
}
describe('bounded R2 artwork and guest reports', () => {
	it('accepts a full-length challenge token while refusing an oversized request before verification', async () => {
		const fixtureChirhoValue = fixtureChirho();
		expect(
			(await fixtureChirhoValue.reportChirho({ turnstile_token_chirho: 'x'.repeat(2048) })).status
		).toBe(202);
		const responseChirho = await fixtureChirhoValue.callChirho(
			'/api-chirho/artifact-flags-chirho',
			{
				method: 'POST',
				headers: { origin: 'https://hinneh.bible.systems', 'content-type': 'application/json' },
				body: ' '.repeat(5000)
			}
		);
		expect(responseChirho.status).toBe(400);
		expect(fixtureChirhoValue.fetchChirho).toHaveBeenCalledTimes(1);
		expect(fixtureChirhoValue.putChirho).toHaveBeenCalledTimes(1);
	});
	it('unknown images, traversal, HEAD, unchanged ETags and writes do not read R2', async () => {
		const fixtureChirhoValue = fixtureChirho();
		for (const pathChirho of [
			'/assets-chirho/missing.webp',
			'/assets-chirho/__proto__',
			'/api-chirho/missing'
		])
			expect((await fixtureChirhoValue.callChirho(pathChirho)).status).toBe(404);
		expect(
			(await fixtureChirhoValue.callChirho(fixtureChirhoValue.pathChirho, { method: 'HEAD' }))
				.status
		).toBe(200);
		expect(
			(
				await fixtureChirhoValue.callChirho(fixtureChirhoValue.pathChirho, {
					headers: { 'If-None-Match': `W/"${fixtureChirhoValue.shaChirho}"` }
				})
			).status
		).toBe(304);
		expect(
			(await fixtureChirhoValue.callChirho(fixtureChirhoValue.pathChirho, { method: 'POST' }))
				.status
		).toBe(405);
		expect(fixtureChirhoValue.getChirho).not.toHaveBeenCalled();
	});
	it('query variations reuse one verified cached object', async () => {
		const fixtureChirhoValue = fixtureChirho();
		expect(
			await (await fixtureChirhoValue.callChirho(fixtureChirhoValue.pathChirho + '?x=1')).text()
		).toBe('verified-artwork-chirho');
		await Promise.all(fixtureChirhoValue.pendingChirho);
		expect(
			(await fixtureChirhoValue.callChirho(fixtureChirhoValue.pathChirho + '?x=2')).status
		).toBe(200);
		expect(fixtureChirhoValue.getChirho).toHaveBeenCalledTimes(1);
	});
	it('a corrupt R2 body is never served or cached', async () => {
		const fixtureChirhoValue = fixtureChirho();
		fixtureChirhoValue.getChirho.mockImplementation(async () => ({
			body: new Response('wrong').body!,
			size: fixtureChirhoValue.bytesChirho.length
		}));
		expect((await fixtureChirhoValue.callChirho(fixtureChirhoValue.pathChirho)).status).toBe(502);
		expect((await fixtureChirhoValue.callChirho(fixtureChirhoValue.pathChirho)).status).toBe(502);
		expect(fixtureChirhoValue.getChirho).toHaveBeenCalledTimes(2);
	});
	it('rejects bad origin, shape, hash, verse, payload and missing configuration before queue writes', async () => {
		const fixtureChirhoValue = fixtureChirho();
		expect(
			(await fixtureChirhoValue.reportChirho({}, { origin: 'https://other.invalid' })).status
		).toBe(403);
		for (const inputChirho of [
			{ asset_path_chirho: '__proto__' },
			{ sha256_chirho: '0'.repeat(64) },
			{ verse_id_chirho: '__proto__' },
			{ reason_chirho: 'buy-more-images' },
			{ extra_chirho: true },
			{ turnstile_token_chirho: 'x'.repeat(3000) }
		])
			expect((await fixtureChirhoValue.reportChirho(inputChirho)).status).toBe(400);
		delete fixtureChirhoValue.environmentChirho.TURNSTILE_SECRET_KEY_CHIRHO;
		expect((await fixtureChirhoValue.reportChirho()).status).toBe(503);
		expect(fixtureChirhoValue.fetchChirho).not.toHaveBeenCalled();
		expect(fixtureChirhoValue.putChirho).not.toHaveBeenCalled();
	});
	it.each([
		{ success: false, hostname: 'hinneh.bible.systems', action: 'image_artifact_chirho' },
		{ success: true, hostname: 'bible.systems', action: 'image_artifact_chirho' },
		{ success: true, hostname: 'hinneh.bible.systems', action: 'different_action' }
	])('fails closed on Siteverify result %j', async (resultChirho) => {
		const fixtureChirhoValue = fixtureChirho();
		fixtureChirhoValue.fetchChirho.mockImplementation(async () => Response.json(resultChirho));
		expect((await fixtureChirhoValue.reportChirho()).status).toBe(400);
		expect(fixtureChirhoValue.putChirho).not.toHaveBeenCalled();
	});
	it('queues one private record per image, without IP, token, credentials or provider calls', async () => {
		const fixtureChirhoValue = fixtureChirho();
		expect((await fixtureChirhoValue.reportChirho()).status).toBe(202);
		await Promise.all(fixtureChirhoValue.pendingChirho);
		expect((await fixtureChirhoValue.reportChirho()).status).toBe(202);
		expect(fixtureChirhoValue.putChirho).toHaveBeenCalledTimes(1);
		const [keyChirho, recordChirho] = [...fixtureChirhoValue.objectsChirho][0];
		expect(keyChirho).toBe(
			`artifact-flags-chirho/open-chirho/${fixtureChirhoValue.shaChirho}.json`
		);
		expect(JSON.parse(recordChirho).state_chirho).toBe('awaiting_owner_review');
		expect(recordChirho).not.toMatch(/192\.0\.2|test-token|test-secret/);
		expect(
			fixtureChirhoValue.fetchChirho.mock.calls.every((callChirho) =>
				String(callChirho[0]).startsWith('https://challenges.cloudflare.com/')
			)
		).toBe(true);
	});
	it('storage failure is not reported as successful intake', async () => {
		const fixtureChirhoValue = fixtureChirho();
		fixtureChirhoValue.putChirho.mockRejectedValue(new Error('unavailable'));
		expect((await fixtureChirhoValue.reportChirho()).status).toBe(503);
	});
	it('limits challenge traffic per edge/IP/hour without recording the IP', async () => {
		const fixtureChirhoValue = fixtureChirho();
		for (let indexChirho = 0; indexChirho < 20; indexChirho++)
			expect((await fixtureChirhoValue.reportChirho()).status).toBe(202);
		expect((await fixtureChirhoValue.reportChirho()).status).toBe(429);
		expect(fixtureChirhoValue.fetchChirho).toHaveBeenCalledTimes(20);
	});
	it.each(SITE_HOSTNAMES_CHIRHO)(
		'accepts same-origin challenged intake on %s',
		async (hostnameChirho) => {
			const fixtureChirhoValue = fixtureChirho(hostnameChirho);
			expect((await fixtureChirhoValue.reportChirho()).status).toBe(202);
			expect(fixtureChirhoValue.putChirho).toHaveBeenCalledTimes(1);
		}
	);
	it('does not accept another trusted hostname as the Origin or challenge hostname', async () => {
		const fixtureChirhoValue = fixtureChirho('hinneh.us');
		expect(
			(await fixtureChirhoValue.reportChirho({}, { origin: 'https://hinneh.bible.systems' })).status
		).toBe(403);
		expect(fixtureChirhoValue.fetchChirho).not.toHaveBeenCalled();
		fixtureChirhoValue.fetchChirho.mockResolvedValue(
			Response.json({
				success: true,
				hostname: 'hinneh.bible.systems',
				action: 'image_artifact_chirho'
			})
		);
		expect((await fixtureChirhoValue.reportChirho()).status).toBe(400);
		expect(fixtureChirhoValue.putChirho).not.toHaveBeenCalled();
	});
	it('ignores forwarded-host claims and refuses an unconfigured actual hostname before any challenge or storage', async () => {
		const fixtureChirhoValue = fixtureChirho('hinneh.us');
		const requestChirho = new Request(
			'https://unconfigured.example/api-chirho/artifact-flags-chirho',
			{
				method: 'POST',
				headers: {
					origin: 'https://hinneh.us',
					'x-forwarded-host': 'hinneh.us',
					'content-type': 'application/json'
				},
				body: '{}'
			}
		);
		expect((await fixtureChirhoValue.callChirho(requestChirho)).status).toBe(403);
		expect(fixtureChirhoValue.fetchChirho).not.toHaveBeenCalled();
		expect(fixtureChirhoValue.putChirho).not.toHaveBeenCalled();
	});
	it('refuses a catalogue that widens trusted origins beyond the owned reader domains', () => {
		expect(() =>
			createArtworkWorkerChirho({
				schema_version_chirho: 1,
				assets_chirho: {},
				verses_chirho: {},
				hostname_chirho: 'hinneh.us',
				hostnames_chirho: ['hinneh.us', 'unconfigured.example'],
				sitekey_chirho: 'test-chirho'
			})
		).toThrow(/scope/);
	});
});
