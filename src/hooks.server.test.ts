// For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life. — John 3:16 (KJV)
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import type { RequestEvent } from '@sveltejs/kit';
import { handle } from './hooks.server';
import { SITE_ORIGIN_CHIRHO } from '$lib/site-chirho';

const fetchChirho = vi.fn<typeof fetch>();
const resolveChirho = vi.fn(async () => new Response('local route'));
function requestChirho(pathChirho: string, methodChirho = 'GET') {
	const urlChirho = new URL(pathChirho, 'http://127.0.0.1:5198');
	// This hook only reads the URL and Request; no application/platform state is supplied.
	const eventChirho = {
		url: urlChirho,
		request: new Request(urlChirho, { method: methodChirho })
	} as RequestEvent;
	return handle({ event: eventChirho, resolve: resolveChirho });
}
beforeEach(() => {
	fetchChirho.mockReset();
	resolveChirho.mockClear();
	fetchChirho.mockResolvedValue(
		new Response('verified media', { headers: { 'Content-Type': 'image/webp' } })
	);
	vi.stubGlobal('fetch', fetchChirho);
});
afterEach(() => vi.unstubAllGlobals());

describe('bounded local media proxy', () => {
	it('uses the canonical origin for allowed GET/HEAD paths, retaining manual redirects', async () => {
		for (const [pathChirho, methodChirho] of [
			['/assets-chirho/scenes-chirho/test-chirho/scene-chirho.webp', 'GET'],
			['/audio-chirho/sha256-chirho/' + 'a'.repeat(64) + '-chirho.mp3', 'HEAD']
		]) {
			const responseChirho = await requestChirho(pathChirho, methodChirho);
			expect(responseChirho.status).toBe(200);
			expect(fetchChirho).toHaveBeenLastCalledWith(
				SITE_ORIGIN_CHIRHO + pathChirho,
				expect.objectContaining({
					method: methodChirho,
					redirect: 'manual',
					signal: expect.any(AbortSignal)
				})
			);
		}
		expect(resolveChirho).not.toHaveBeenCalled();
	});
	it('refuses invalid media paths and mutation methods before any upstream access', async () => {
		for (const pathChirho of [
			'/assets-chirho/escape.json',
			'/assets-chirho/space%20name.webp',
			'/audio-chirho/sha256-chirho/not-a-hash-chirho.mp3'
		])
			expect((await requestChirho(pathChirho)).status).toBe(404);
		expect((await requestChirho('/assets-chirho/test-chirho.webp', 'POST')).status).toBe(405);
		expect(fetchChirho).not.toHaveBeenCalled();
		expect(resolveChirho).not.toHaveBeenCalled();
	});
	it('refuses upstream redirects and transport failures without following another location', async () => {
		for (const statusChirho of [301, 302, 307, 308]) {
			fetchChirho.mockResolvedValueOnce(
				new Response(null, {
					status: statusChirho,
					headers: { Location: 'https://unrelated.invalid/' }
				})
			);
			expect((await requestChirho('/assets-chirho/test-chirho.webp')).status).toBe(503);
		}
		fetchChirho.mockRejectedValueOnce(new Error('network unavailable'));
		expect((await requestChirho('/assets-chirho/test-chirho.webp')).status).toBe(503);
		expect(fetchChirho).toHaveBeenCalledTimes(5);
	});
	it('leaves ordinary application routes to their existing resolver', async () => {
		expect(await (await requestChirho('/about-chirho/')).text()).toBe('local route');
		expect(resolveChirho).toHaveBeenCalledOnce();
		expect(fetchChirho).not.toHaveBeenCalled();
	});
});
