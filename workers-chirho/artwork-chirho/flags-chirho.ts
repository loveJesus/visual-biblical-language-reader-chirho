// For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life. — John 3:16 (KJV)
// Workflow: image flags -> challenged, deduplicated private queue -> owner review, never generation.
import type {
	MediaCatalogueChirho,
	WorkerEnvironmentChirho,
	ExecutionChirho,
	DependenciesChirho
} from './types-chirho';
export const FLAG_ACTION_CHIRHO = 'image_artifact_chirho';
const REASONS_CHIRHO = new Set(['anatomy', 'unreadable_detail', 'other_visual_artifact']);
// Allow the provider's full 2048-character token plus bounded image/verse metadata.
const MAX_BODY_CHIRHO = 4096;
const RATE_CHIRHO = 20;
const jsonChirho = (bodyChirho: Record<string, unknown>, statusChirho = 200) =>
	new Response(JSON.stringify(bodyChirho), {
		status: statusChirho,
		headers: {
			'Content-Type': 'application/json',
			'Cache-Control': 'no-store',
			'X-Content-Type-Options': 'nosniff'
		}
	});
async function readBodyChirho(requestChirho: Request) {
	if (Number(requestChirho.headers.get('content-length')) > MAX_BODY_CHIRHO)
		throw new Error('oversized');
	const readerChirho = requestChirho.body?.getReader();
	if (!readerChirho) throw new Error('missing');
	let totalChirho = 0;
	const chunksChirho: Uint8Array[] = [];
	for (;;) {
		const resultChirho = await readerChirho.read();
		if (resultChirho.done) break;
		totalChirho += resultChirho.value.length;
		if (totalChirho > MAX_BODY_CHIRHO) {
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
async function rateKeyChirho(ipChirho: string, secretChirho: string, nowChirho: number) {
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
			new TextEncoder().encode(`${Math.floor(nowChirho / 3600000)}\0${ipChirho}`)
		)
	);
	return new Request(
		'https://hinneh.bible.systems/internal-artifact-rate-chirho/' +
			[...digestChirho].map((byteChirho) => byteChirho.toString(16).padStart(2, '0')).join('')
	);
}
export async function flagResponseChirho(
	requestChirho: Request,
	catalogueChirho: MediaCatalogueChirho,
	environmentChirho: WorkerEnvironmentChirho,
	contextChirho: ExecutionChirho,
	dependenciesChirho: DependenciesChirho
) {
	if (requestChirho.method !== 'POST') return jsonChirho({ error_chirho: 'method' }, 405);
	const expectedHostnameChirho = new URL(requestChirho.url).hostname;
	const hostnamesChirho = catalogueChirho.hostnames_chirho ?? [catalogueChirho.hostname_chirho];
	if (
		!hostnamesChirho.includes(expectedHostnameChirho) ||
		requestChirho.headers.get('origin') !== `https://${expectedHostnameChirho}`
	)
		return jsonChirho({ error_chirho: 'origin' }, 403);
	if (requestChirho.headers.get('content-type')?.split(';')[0].trim() !== 'application/json')
		return jsonChirho({ error_chirho: 'content_type' }, 415);
	let inputChirho;
	try {
		inputChirho = await readBodyChirho(requestChirho);
	} catch {
		return jsonChirho({ error_chirho: 'invalid_body' }, 400);
	}
	if (!inputChirho || typeof inputChirho !== 'object' || Array.isArray(inputChirho))
		return jsonChirho({ error_chirho: 'invalid_body' }, 400);
	const factChirho =
		typeof inputChirho.asset_path_chirho === 'string' &&
		Object.hasOwn(catalogueChirho.assets_chirho, inputChirho.asset_path_chirho)
			? catalogueChirho.assets_chirho[inputChirho.asset_path_chirho]
			: undefined;
	if (
		!factChirho ||
		typeof inputChirho.sha256_chirho !== 'string' ||
		!/^[a-f0-9]{64}$/.test(inputChirho.sha256_chirho) ||
		factChirho.sha256_chirho !== inputChirho.sha256_chirho ||
		typeof inputChirho.verse_id_chirho !== 'string' ||
		!Object.hasOwn(catalogueChirho.verses_chirho, inputChirho.verse_id_chirho) ||
		catalogueChirho.verses_chirho[inputChirho.verse_id_chirho] !== true ||
		!REASONS_CHIRHO.has(inputChirho.reason_chirho) ||
		typeof inputChirho.turnstile_token_chirho !== 'string' ||
		!inputChirho.turnstile_token_chirho ||
		inputChirho.turnstile_token_chirho.length > 2048 ||
		Object.keys(inputChirho).some(
			(keyChirho) =>
				![
					'asset_path_chirho',
					'sha256_chirho',
					'verse_id_chirho',
					'reason_chirho',
					'turnstile_token_chirho'
				].includes(keyChirho)
		)
	)
		return jsonChirho({ error_chirho: 'invalid_report' }, 400);
	if (
		!environmentChirho.TURNSTILE_SECRET_KEY_CHIRHO ||
		!environmentChirho.ARTIFACT_RATE_SECRET_CHIRHO ||
		!catalogueChirho.sitekey_chirho
	)
		return jsonChirho(
			{ error_chirho: 'temporarily_unavailable', stage_chirho: 'configuration' },
			503
		);
	let stageChirho = 'edge_rate';
	try {
		const ipChirho = requestChirho.headers.get('cf-connecting-ip');
		if (!ipChirho) return jsonChirho({ error_chirho: 'temporarily_unavailable' }, 503);
		const rateChirho = await rateKeyChirho(
			ipChirho,
			environmentChirho.ARTIFACT_RATE_SECRET_CHIRHO,
			dependenciesChirho.now_chirho()
		);
		const priorChirho = await dependenciesChirho.cache_chirho.match(rateChirho);
		const countChirho = priorChirho ? Number(await priorChirho.text()) : 0;
		if (!Number.isInteger(countChirho) || countChirho >= RATE_CHIRHO)
			return jsonChirho({ error_chirho: 'rate_limited' }, 429);
		await dependenciesChirho.cache_chirho.put(
			rateChirho,
			new Response(String(countChirho + 1), { headers: { 'Cache-Control': 'max-age=3600' } })
		);
		stageChirho = 'challenge';
		const verificationResponseChirho = await dependenciesChirho.fetch_chirho(
			'https://challenges.cloudflare.com/turnstile/v0/siteverify',
			{
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					secret: environmentChirho.TURNSTILE_SECRET_KEY_CHIRHO,
					response: inputChirho.turnstile_token_chirho
				}),
				signal: AbortSignal.timeout(10000)
			}
		);
		if (!verificationResponseChirho.ok)
			return jsonChirho({ error_chirho: 'challenge_unavailable' }, 503);
		const verificationChirho = (await verificationResponseChirho.json()) as {
			success?: unknown;
			hostname?: unknown;
			action?: unknown;
		};
		if (
			verificationChirho.success !== true ||
			verificationChirho.hostname !== expectedHostnameChirho ||
			verificationChirho.action !== FLAG_ACTION_CHIRHO
		)
			return jsonChirho({ error_chirho: 'challenge_failed' }, 400);
		const queuedKeyChirho = new Request(
			`https://hinneh.bible.systems/internal-artifact-queued-chirho/${factChirho.sha256_chirho}`
		);
		if (await dependenciesChirho.cache_chirho.match(queuedKeyChirho))
			return jsonChirho({ queued_chirho: true, duplicate_chirho: true }, 202);
		stageChirho = 'queue';
		const objectKeyChirho = `artifact-flags-chirho/open-chirho/${factChirho.sha256_chirho}.json`;
		let duplicateChirho = !!(await environmentChirho.HINNEH_MEDIA_CHIRHO.head(objectKeyChirho));
		if (!duplicateChirho) {
			const recordChirho = {
				schema_version_chirho: 1,
				image_sha256_chirho: factChirho.sha256_chirho,
				asset_path_chirho: inputChirho.asset_path_chirho,
				reported_verse_id_chirho: inputChirho.verse_id_chirho,
				reason_chirho: inputChirho.reason_chirho,
				state_chirho: 'awaiting_owner_review',
				created_at_chirho: new Date(dependenciesChirho.now_chirho()).toISOString()
			};
			const storedChirho = await environmentChirho.HINNEH_MEDIA_CHIRHO.put(
				objectKeyChirho,
				JSON.stringify(recordChirho),
				{
					onlyIf: { etagDoesNotMatch: '*' },
					httpMetadata: { contentType: 'application/json', cacheControl: 'no-store' }
				}
			);
			duplicateChirho = storedChirho === null;
		}
		contextChirho.waitUntil(
			dependenciesChirho.cache_chirho
				.put(
					queuedKeyChirho,
					new Response('queued', { headers: { 'Cache-Control': 'max-age=86400' } })
				)
				.catch(() => undefined)
		);
		return jsonChirho({ queued_chirho: true, duplicate_chirho: duplicateChirho }, 202);
	} catch {
		return jsonChirho({ error_chirho: 'temporarily_unavailable', stage_chirho: stageChirho }, 503);
	}
}
