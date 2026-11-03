// For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life. — John 3:16 (KJV)
// Workflow: media-delivery-chirho.md. Known content only; unknown keys, HEAD and 304 read no R2.
import type {
	MediaFactChirho,
	WorkerEnvironmentChirho,
	DependenciesChirho,
	ExecutionChirho
} from './types-chirho';
type BinaryFactChirho = Pick<
	MediaFactChirho,
	'sha256_chirho' | 'key_chirho' | 'bytes_chirho' | 'format_chirho'
>;
export function artworkHeadersChirho(
	factChirho: BinaryFactChirho,
	immutableChirho: boolean,
	audioChirho = false
) {
	return new Headers({
		'Content-Type': audioChirho
			? 'audio/mpeg'
			: factChirho.format_chirho === 'jpeg'
				? 'image/jpeg'
				: 'image/webp',
		'Content-Length': String(factChirho.bytes_chirho),
		ETag: `"${factChirho.sha256_chirho}"`,
		'Cache-Control': immutableChirho
			? 'public, max-age=31536000, immutable'
			: 'public, max-age=0, must-revalidate',
		'X-Content-Type-Options': 'nosniff',
		[audioChirho ? 'X-Hinneh-Audio-Chirho' : 'X-Hinneh-Artwork-Chirho']: 'r2',
		'X-Robots-Tag': 'noindex'
	});
}
export async function artworkResponseChirho(
	requestChirho: Request,
	factChirho: BinaryFactChirho,
	environmentChirho: WorkerEnvironmentChirho,
	contextChirho: ExecutionChirho,
	dependenciesChirho: DependenciesChirho,
	audioChirho = false
): Promise<Response> {
	const extensionChirho = factChirho.format_chirho === 'jpeg' ? 'jpg' : 'webp';
	if (!['GET', 'HEAD'].includes(requestChirho.method))
		return new Response(null, { status: 405, headers: { Allow: 'GET, HEAD' } });
	if (
		!/^[a-f0-9]{64}$/.test(factChirho.sha256_chirho) ||
		factChirho.key_chirho !==
			(audioChirho
				? 'audio-chirho/sha256-chirho/' + factChirho.sha256_chirho + '.mp3'
				: 'media-chirho/sha256-chirho/' + factChirho.sha256_chirho + '.' + extensionChirho) ||
		(factChirho.format_chirho !== undefined &&
			!['webp', 'jpeg'].includes(factChirho.format_chirho)) ||
		!Number.isSafeInteger(factChirho.bytes_chirho) ||
		factChirho.bytes_chirho < 1 ||
		factChirho.bytes_chirho > (audioChirho ? 4_000_000 : 2 * 1024 ** 2)
	)
		return new Response(null, { status: 503 });
	const pathnameChirho = new URL(requestChirho.url).pathname;
	const immutableChirho =
		audioChirho ||
		pathnameChirho ===
			`/assets-chirho/sha256-chirho/${factChirho.sha256_chirho}-chirho.${extensionChirho}`;
	const headersChirho = artworkHeadersChirho(factChirho, immutableChirho, audioChirho);
	const etagsChirho =
		requestChirho.headers
			.get('if-none-match')
			?.split(',')
			.map((tagChirho) => tagChirho.trim().replace(/^W\//, '')) ?? [];
	if (etagsChirho.includes('*') || etagsChirho.includes(headersChirho.get('etag')!)) {
		headersChirho.delete('Content-Length');
		return new Response(null, { status: 304, headers: headersChirho });
	}
	if (requestChirho.method === 'HEAD') return new Response(null, { headers: headersChirho });
	// Ignore the visitor's query and alias when choosing the edge cache key.
	const cacheKeyChirho = new Request(
		audioChirho
			? 'https://hinneh.bible.systems/audio-chirho/sha256-chirho/' +
					factChirho.sha256_chirho +
					'-chirho.mp3'
			: 'https://hinneh.bible.systems/assets-chirho/sha256-chirho/' +
					factChirho.sha256_chirho +
					'-chirho.' +
					extensionChirho
	);
	const cachedChirho = await dependenciesChirho.cache_chirho.match(cacheKeyChirho);
	if (cachedChirho) return new Response(cachedChirho.body, { headers: headersChirho });
	try {
		const objectChirho = await environmentChirho.HINNEH_MEDIA_CHIRHO.get(factChirho.key_chirho);
		if (!objectChirho)
			return new Response(null, { status: 404, headers: { 'Cache-Control': 'no-store' } });
		if (objectChirho.size !== factChirho.bytes_chirho) return new Response(null, { status: 502 });
		const bytesChirho = new Uint8Array(await new Response(objectChirho.body).arrayBuffer());
		const digestChirho = new Uint8Array(await crypto.subtle.digest('SHA-256', bytesChirho));
		const shaChirho = [...digestChirho]
			.map((byteChirho) => byteChirho.toString(16).padStart(2, '0'))
			.join('');
		if (bytesChirho.length !== factChirho.bytes_chirho || shaChirho !== factChirho.sha256_chirho)
			return new Response(null, { status: 502, headers: { 'Cache-Control': 'no-store' } });
		const cachedResponseChirho = new Response(bytesChirho, {
			headers: artworkHeadersChirho(factChirho, true, audioChirho)
		});
		contextChirho.waitUntil(
			dependenciesChirho.cache_chirho
				.put(cacheKeyChirho, cachedResponseChirho.clone())
				.catch(() => undefined)
		);
		return new Response(bytesChirho, { headers: headersChirho });
	} catch {
		return new Response(null, { status: 503, headers: { 'Cache-Control': 'no-store' } });
	}
}
