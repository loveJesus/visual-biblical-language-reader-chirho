// For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life. — John 3:16 (KJV)
import { describe, it, expect, vi as viChirho } from 'vitest';
import { createArtworkWorkerChirho } from '../../workers-chirho/artwork-chirho/index-chirho';
import type {
	MediaCatalogueChirho,
	WorkerEnvironmentChirho
} from '../../workers-chirho/artwork-chirho/types-chirho';
import { sha256Chirho } from '../../scripts-chirho/publish-chirho/release_rules_chirho';
import { SITE_HOSTNAMES_CHIRHO } from '../../src/lib/site-chirho';

const INBOX_CHIRHO = 'owner-inbox@example.org';
const RELAY_URL_CHIRHO = 'https://2smtp.com/api_fe/send_email_fe';
const validChirho = () => ({
	name_chirho: 'Ruth <b>',
	email_chirho: 'reader@example.org',
	message_chirho: 'Shalom.\nIs <script> escaped?',
	locale_chirho: 'es',
	turnstile_token_chirho: 'single-use-token-chirho'
});
function fixtureChirho(overrideChirho: Partial<WorkerEnvironmentChirho> = {}) {
	const catalogueChirho: MediaCatalogueChirho = {
		schema_version_chirho: 1,
		assets_chirho: {},
		verses_chirho: {},
		hostname_chirho: 'hinneh.us',
		hostnames_chirho: SITE_HOSTNAMES_CHIRHO,
		sitekey_chirho: 'real-public-key-chirho'
	};
	const cacheChirho = new Map<string, Response>();
	const verificationChirho = viChirho.fn((): Response =>
		Response.json({ success: true, hostname: 'hinneh.us', action: 'contact_message_chirho' })
	);
	const relayChirho = viChirho.fn((): Response =>
		Response.json({ success_chirho: true, recipients_chirho: 1 })
	);
	const fetchChirho = viChirho.fn(
		async (inputChirho: RequestInfo | URL, initChirho?: RequestInit): Promise<Response> => {
			void initChirho;
			const urlChirho = String(inputChirho);
			if (urlChirho === 'https://challenges.cloudflare.com/turnstile/v0/siteverify')
				return verificationChirho();
			if (urlChirho === RELAY_URL_CHIRHO) return relayChirho();
			throw new Error(`Unexpected provider call ${urlChirho}`);
		}
	);
	const bucketChirho = {
		get: viChirho.fn(async () => null),
		head: viChirho.fn(async () => null),
		put: viChirho.fn(async () => ({}))
	};
	const environmentChirho: WorkerEnvironmentChirho = {
		ASSETS_CHIRHO: { fetch: async () => new Response('static') },
		HINNEH_MEDIA_CHIRHO: bucketChirho,
		TURNSTILE_SECRET_KEY_CHIRHO: 'test-secret-chirho',
		ARTIFACT_RATE_SECRET_CHIRHO: 'test-rate-chirho',
		TWOSMTP_API_KEY_CHIRHO: 'test-relay-chirho',
		CONTACT_DESTINATION_CHIRHO: INBOX_CHIRHO,
		...overrideChirho
	};
	let nowChirho = 1793556000000;
	const workerChirho = createArtworkWorkerChirho(catalogueChirho, {
		cache_chirho: {
			match: async (requestChirho) => cacheChirho.get(requestChirho.url)?.clone(),
			put: async (requestChirho, responseChirho) => {
				cacheChirho.set(requestChirho.url, responseChirho.clone());
			}
		},
		fetch_chirho: fetchChirho as unknown as typeof fetch,
		now_chirho: () => nowChirho
	});
	const sendChirho = (
		bodyChirho: unknown,
		headersChirho: Record<string, string> = {},
		initChirho: RequestInit = {}
	) =>
		workerChirho.fetch(
			new Request('https://hinneh.us/api-chirho/contact-chirho', {
				method: 'POST',
				headers: {
					origin: 'https://hinneh.us',
					'content-type': 'application/json',
					'cf-connecting-ip': '203.0.113.7',
					...headersChirho
				},
				body: typeof bodyChirho === 'string' ? bodyChirho : JSON.stringify(bodyChirho),
				...initChirho
			}),
			environmentChirho,
			{ waitUntil: () => undefined }
		);
	return {
		sendChirho,
		fetchChirho,
		verificationChirho,
		relayChirho,
		bucketChirho,
		cacheChirho,
		advanceHourChirho: () => {
			nowChirho += 3600000;
		}
	};
}
const relayCallsChirho = (fetchChirho: ReturnType<typeof fixtureChirho>['fetchChirho']) =>
	fetchChirho.mock.calls.filter(([inputChirho]) => String(inputChirho) === RELAY_URL_CHIRHO);

describe('contact intake', () => {
	it('relays one message to the configured inbox, replying to the visitor, with nothing stored or echoed', async () => {
		const fixtureChirhoValue = fixtureChirho();
		const responseChirho = await fixtureChirhoValue.sendChirho(validChirho());
		expect(responseChirho.status).toBe(202);
		const textChirho = await responseChirho.text();
		expect(JSON.parse(textChirho)).toEqual({ sent_chirho: true });
		expect(textChirho).not.toContain(INBOX_CHIRHO);
		const [verifyCallChirho] = fixtureChirhoValue.fetchChirho.mock.calls;
		expect(JSON.parse(String(verifyCallChirho[1]?.body))).toEqual({
			secret: 'test-secret-chirho',
			response: 'single-use-token-chirho'
		});
		const [[, relayInitChirho]] = relayCallsChirho(fixtureChirhoValue.fetchChirho);
		const headersChirho = new Headers(relayInitChirho?.headers);
		expect(headersChirho.get('X-API-Key')).toBe('test-relay-chirho');
		expect(headersChirho.get('Idempotency-Key')).toBe(
			`hinneh-contact-${sha256Chirho(new TextEncoder().encode('single-use-token-chirho'))}`
		);
		const mailChirho = JSON.parse(String(relayInitChirho?.body));
		expect(Object.keys(mailChirho).sort()).toEqual([
			'body_html_chirho',
			'body_text_chirho',
			'reply_to_chirho',
			'subject_chirho',
			'to_chirho'
		]);
		expect(mailChirho.to_chirho).toEqual([INBOX_CHIRHO]);
		expect(mailChirho.reply_to_chirho).toBe('reader@example.org');
		expect(mailChirho.subject_chirho).toBe('Hinneh contact: Ruth <b>');
		expect(mailChirho.body_text_chirho).toContain('Shalom.\nIs <script> escaped?');
		expect(mailChirho.body_text_chirho).toContain('Spanish interface');
		expect(mailChirho.body_html_chirho).toContain('Is &lt;script&gt; escaped?');
		expect(mailChirho.body_html_chirho).not.toContain('<script>');
		expect(mailChirho.body_html_chirho).not.toContain('<b>');
		expect(fixtureChirhoValue.bucketChirho.put).not.toHaveBeenCalled();
		expect(fixtureChirhoValue.bucketChirho.head).not.toHaveBeenCalled();
	});
	it('refuses foreign origins, wrong methods and malformed messages before any provider call', async () => {
		const fixtureChirhoValue = fixtureChirho();
		expect(
			(
				await fixtureChirhoValue.sendChirho(validChirho(), {
					origin: 'https://hinneh.bible.systems'
				})
			).status
		).toBe(403);
		expect(
			(await fixtureChirhoValue.sendChirho(validChirho(), { 'content-type': 'text/plain' })).status
		).toBe(415);
		expect(
			(
				await fixtureChirhoValue.sendChirho(
					undefined,
					{},
					{ method: 'GET', body: null as unknown as BodyInit }
				)
			).status
		).toBe(405);
		for (const changeChirho of [
			{ email_chirho: 'first@example.org, second@example.org' },
			{ email_chirho: 'reader@example' },
			{ email_chirho: 'reader@example.org\nBcc: x@example.org' },
			{ email_chirho: '' },
			{ name_chirho: 'Ruth\r\nBcc: x@example.org' },
			{ name_chirho: 'n'.repeat(101) },
			{ message_chirho: '   ' },
			{ message_chirho: 'm'.repeat(4001) },
			{ message_chirho: 'null \u0000 byte' },
			{ locale_chirho: 'fr' },
			{ turnstile_token_chirho: '' },
			{ turnstile_token_chirho: 't'.repeat(2049) },
			{ cc_chirho: 'x@example.org' }
		])
			expect(
				(await fixtureChirhoValue.sendChirho({ ...validChirho(), ...changeChirho })).status
			).toBe(400);
		expect((await fixtureChirhoValue.sendChirho('x'.repeat(30000))).status).toBe(400);
		expect((await fixtureChirhoValue.sendChirho('[]')).status).toBe(400);
		expect(fixtureChirhoValue.fetchChirho).not.toHaveBeenCalled();
		// Astral characters count once, so a full-length message of them is still accepted.
		expect(
			(
				await fixtureChirhoValue.sendChirho({
					...validChirho(),
					message_chirho: '𐤀'.repeat(4000)
				})
			).status
		).toBe(202);
	});
	it('stays closed without its relay key or a valid inbox', async () => {
		for (const overrideChirho of [
			{ TWOSMTP_API_KEY_CHIRHO: undefined },
			{ CONTACT_DESTINATION_CHIRHO: 'not-an-address' },
			{ TURNSTILE_SECRET_KEY_CHIRHO: undefined }
		]) {
			const fixtureChirhoValue = fixtureChirho(overrideChirho);
			const responseChirho = await fixtureChirhoValue.sendChirho(validChirho());
			expect(responseChirho.status).toBe(503);
			expect(await responseChirho.json()).toEqual({
				error_chirho: 'temporarily_unavailable',
				stage_chirho: 'configuration'
			});
			expect(fixtureChirhoValue.fetchChirho).not.toHaveBeenCalled();
		}
	});
	it('never sends for a token from another form, another host or a failed challenge', async () => {
		for (const [verdictChirho, statusChirho] of [
			[{ success: true, hostname: 'hinneh.us', action: 'image_artifact_chirho' }, 400],
			[{ success: true, hostname: 'hinneh.bible.systems', action: 'contact_message_chirho' }, 400],
			[{ success: false, hostname: 'hinneh.us', action: 'contact_message_chirho' }, 400]
		] as const) {
			const fixtureChirhoValue = fixtureChirho();
			fixtureChirhoValue.verificationChirho.mockImplementation(() => Response.json(verdictChirho));
			expect((await fixtureChirhoValue.sendChirho(validChirho())).status).toBe(statusChirho);
			expect(relayCallsChirho(fixtureChirhoValue.fetchChirho)).toHaveLength(0);
		}
		const fixtureChirhoValue = fixtureChirho();
		fixtureChirhoValue.verificationChirho.mockImplementation(
			() => new Response('down', { status: 500 })
		);
		expect((await fixtureChirhoValue.sendChirho(validChirho())).status).toBe(503);
		expect(relayCallsChirho(fixtureChirhoValue.fetchChirho)).toHaveLength(0);
	});
	it('reports relay refusal, partial acceptance and network failure as unsent', async () => {
		for (const relayChirho of [
			() => Response.json({ success_chirho: true, recipients_chirho: 0 }),
			() => Response.json({ success_chirho: false, recipients_chirho: 1 }),
			() => new Response('bad gateway', { status: 502 }),
			() => {
				throw new TypeError('network down');
			}
		]) {
			const fixtureChirhoValue = fixtureChirho();
			fixtureChirhoValue.relayChirho.mockImplementation(relayChirho);
			const responseChirho = await fixtureChirhoValue.sendChirho(validChirho());
			expect(responseChirho.status).toBe(503);
			expect(await responseChirho.json()).toEqual({
				error_chirho: 'temporarily_unavailable',
				stage_chirho: 'relay'
			});
		}
	});
	it('limits attempts per hashed connection per hour without keeping the IP', async () => {
		const fixtureChirhoValue = fixtureChirho();
		for (let attemptChirho = 0; attemptChirho < 5; attemptChirho++)
			expect((await fixtureChirhoValue.sendChirho(validChirho())).status).toBe(202);
		expect((await fixtureChirhoValue.sendChirho(validChirho())).status).toBe(429);
		expect(
			(await fixtureChirhoValue.sendChirho(validChirho(), { 'cf-connecting-ip': '198.51.100.9' }))
				.status
		).toBe(202);
		expect(relayCallsChirho(fixtureChirhoValue.fetchChirho)).toHaveLength(6);
		expect(
			[...fixtureChirhoValue.cacheChirho.keys()].some(
				(keyChirho) => keyChirho.includes('203.0.113.7') || keyChirho.includes('198.51.100.9')
			)
		).toBe(false);
		fixtureChirhoValue.advanceHourChirho();
		expect((await fixtureChirhoValue.sendChirho(validChirho())).status).toBe(202);
	});
});
