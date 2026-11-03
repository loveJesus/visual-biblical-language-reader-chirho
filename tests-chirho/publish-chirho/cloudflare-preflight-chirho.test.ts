// For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life. — John 3:16 (KJV)

import { describe, expect, it } from 'vitest';
import {
	cloudflareGetChirho,
	redactIdChirho,
	routeCapturesChirho,
	type FetchChirho
} from '../../scripts-chirho/publish-chirho/cloudflare_preflight_chirho';

const CREDENTIALS_CHIRHO = { email_chirho: 'person@example.com', key_chirho: 'k'.repeat(37) };
const ID_CHIRHO = 'a'.repeat(32);

describe('read-only Cloudflare preflight', () => {
	it('sends only GET requests, and only to allowlisted paths', async () => {
		const requestsChirho: RequestInit[] = [];
		const fetchChirho: FetchChirho = async (_urlChirho, initChirho) => {
			requestsChirho.push(initChirho);
			return new Response(JSON.stringify({ success: true, result: [] }));
		};
		for (const pathChirho of [
			`/accounts/${ID_CHIRHO}/workers/scripts/hinneh-chirho`,
			`/accounts/${ID_CHIRHO}/r2/buckets/hinneh-media-chirho/objects`,
			'/zones/../user/tokens'
		])
			await expect(
				cloudflareGetChirho(pathChirho, {}, CREDENTIALS_CHIRHO, fetchChirho)
			).rejects.toThrow(/allowlist/);
		expect(requestsChirho).toEqual([]);
		expect(
			await cloudflareGetChirho(
				`/zones/${ID_CHIRHO}/dns_records`,
				{ name: 'hinneh.bible.systems' },
				CREDENTIALS_CHIRHO,
				fetchChirho
			)
		).toEqual([]);
		expect(requestsChirho.map((initChirho) => [initChirho.method, initChirho.redirect])).toEqual([
			['GET', 'error']
		]);
	});

	it('reports failures without ids or credentials', async () => {
		const fetchChirho: FetchChirho = async () =>
			new Response(JSON.stringify({ success: false, errors: [{ code: 10000 }] }), { status: 403 });
		const messageChirho = await cloudflareGetChirho(
			`/accounts/${ID_CHIRHO}/r2/buckets`,
			{},
			CREDENTIALS_CHIRHO,
			fetchChirho
		).then(
			() => '',
			(errorChirho: Error) => errorChirho.message
		);
		expect(messageChirho).toMatch(/HTTP 403 \[10000\]/);
		for (const privateChirho of [
			ID_CHIRHO,
			CREDENTIALS_CHIRHO.key_chirho,
			CREDENTIALS_CHIRHO.email_chirho
		])
			expect(messageChirho).not.toContain(privateChirho);
		expect(redactIdChirho(ID_CHIRHO)).toBe('…aaaa');
	});

	it('detects existing routes that would capture the hostname', () => {
		expect(routeCapturesChirho('*bible.systems/*', 'hinneh.bible.systems')).toBe(true);
		expect(routeCapturesChirho('*.bible.systems/*', 'hinneh.bible.systems')).toBe(true);
		expect(routeCapturesChirho('www.bible.systems/*', 'hinneh.bible.systems')).toBe(false);
		expect(routeCapturesChirho('hinneh.bible.systems/api/*', 'hinneh.bible.systems')).toBe(false);
	});
});
