// For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life. — John 3:16 (KJV)
// Shared bounded intake for the public challenged forms: illustration reports and contact messages.
// Workflow: spec-chirho/workflows-chirho/hosting-chirho/contact-chirho.md
import type { DependenciesChirho } from './types-chirho';
export const jsonChirho = (bodyChirho: Record<string, unknown>, statusChirho = 200) =>
	new Response(JSON.stringify(bodyChirho), {
		status: statusChirho,
		headers: {
			'Content-Type': 'application/json',
			'Cache-Control': 'no-store',
			'X-Content-Type-Options': 'nosniff'
		}
	});
// Same-origin JSON POSTs from the request's own configured hostname only.
export function requestRefusalChirho(
	requestChirho: Request,
	hostnamesChirho: readonly string[]
): Response | null {
	if (requestChirho.method !== 'POST') return jsonChirho({ error_chirho: 'method' }, 405);
	const expectedHostnameChirho = new URL(requestChirho.url).hostname;
	if (
		!hostnamesChirho.includes(expectedHostnameChirho) ||
		requestChirho.headers.get('origin') !== `https://${expectedHostnameChirho}`
	)
		return jsonChirho({ error_chirho: 'origin' }, 403);
	if (requestChirho.headers.get('content-type')?.split(';')[0].trim() !== 'application/json')
		return jsonChirho({ error_chirho: 'content_type' }, 415);
	return null;
}
export async function readBodyChirho(requestChirho: Request, maxChirho: number): Promise<unknown> {
	if (Number(requestChirho.headers.get('content-length')) > maxChirho) throw new Error('oversized');
	const readerChirho = requestChirho.body?.getReader();
	if (!readerChirho) throw new Error('missing');
	let totalChirho = 0;
	const chunksChirho: Uint8Array[] = [];
	for (;;) {
		const resultChirho = await readerChirho.read();
		if (resultChirho.done) break;
		totalChirho += resultChirho.value.length;
		if (totalChirho > maxChirho) {
			await readerChirho.cancel();
			throw new Error('oversized');
		}
		chunksChirho.push(resultChirho.value);
	}
	const bytesChirho = new Uint8Array(totalChirho);
	let offsetChirho = 0;
	for (const chunkChirho of chunksChirho) {
		bytesChirho.set(chunkChirho, offsetChirho);
		offsetChirho += chunkChirho.length;
	}
	return JSON.parse(new TextDecoder('utf-8', { fatal: true }).decode(bytesChirho));
}
export async function sha256HexChirho(valueChirho: string): Promise<string> {
	const digestChirho = new Uint8Array(
		await crypto.subtle.digest('SHA-256', new TextEncoder().encode(valueChirho))
	);
	return [...digestChirho].map((byteChirho) => byteChirho.toString(16).padStart(2, '0')).join('');
}
// Counts one attempt per keyed-hash of the connection IP per hour; the raw IP is never stored.
export async function consumeRateChirho(
	namespaceChirho: string,
	ipChirho: string,
	secretChirho: string,
	limitChirho: number,
	dependenciesChirho: DependenciesChirho
): Promise<boolean> {
	const keyChirho = await crypto.subtle.importKey(
		'raw',
		new TextEncoder().encode(secretChirho),
		{ name: 'HMAC', hash: 'SHA-256' },
		false,
		['sign']
	);
	const digestChirho = new Uint8Array(
		await crypto.subtle.sign(
			'HMAC',
			keyChirho,
			new TextEncoder().encode(
				`${Math.floor(dependenciesChirho.now_chirho() / 3600000)}\0${ipChirho}`
			)
		)
	);
	const rateChirho = new Request(
		`https://hinneh.bible.systems/${namespaceChirho}/` +
			[...digestChirho].map((byteChirho) => byteChirho.toString(16).padStart(2, '0')).join('')
	);
	const priorChirho = await dependenciesChirho.cache_chirho.match(rateChirho);
	const countChirho = priorChirho ? Number(await priorChirho.text()) : 0;
	if (!Number.isInteger(countChirho) || countChirho >= limitChirho) return false;
	await dependenciesChirho.cache_chirho.put(
		rateChirho,
		new Response(String(countChirho + 1), { headers: { 'Cache-Control': 'max-age=3600' } })
	);
	return true;
}
// A token passes only for this exact hostname and form action, so tokens cannot cross forms.
export async function verifyChallengeChirho(
	tokenChirho: string,
	secretChirho: string,
	hostnameChirho: string,
	actionChirho: string,
	dependenciesChirho: DependenciesChirho
): Promise<'passed' | 'failed' | 'unavailable'> {
	const responseChirho = await dependenciesChirho.fetch_chirho(
		'https://challenges.cloudflare.com/turnstile/v0/siteverify',
		{
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ secret: secretChirho, response: tokenChirho }),
			signal: AbortSignal.timeout(10000)
		}
	);
	if (!responseChirho.ok) return 'unavailable';
	const verificationChirho = (await responseChirho.json()) as {
		success?: unknown;
		hostname?: unknown;
		action?: unknown;
	};
	return verificationChirho.success === true &&
		verificationChirho.hostname === hostnameChirho &&
		verificationChirho.action === actionChirho
		? 'passed'
		: 'failed';
}
