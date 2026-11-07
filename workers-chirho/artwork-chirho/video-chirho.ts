// For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life. — John 3:16 (KJV)
// Workflow: verse-media-chirho.md. Verified full objects back bounded single-range responses.
import type { DependenciesChirho, ExecutionChirho, WorkerEnvironmentChirho } from './types-chirho';
import { VERSE_VIDEO_LIMIT_CHIRHO } from '../../src/lib/domain-chirho/verse-video-chirho';

export const VIDEO_LIMIT_CHIRHO = VERSE_VIDEO_LIMIT_CHIRHO;
async function videoBytesChirho(
	streamChirho: ReadableStream<Uint8Array> | null,
	lengthChirho: number
): Promise<Uint8Array<ArrayBuffer>> {
	if (!streamChirho) throw Error('Missing video body');
	const readerChirho = streamChirho.getReader();
	const bytesChirho = new Uint8Array(lengthChirho);
	let offsetChirho = 0;
	try {
		for (;;) {
			const partChirho = await readerChirho.read();
			if (partChirho.done) break;
			if (offsetChirho + partChirho.value.length > lengthChirho)
				throw Error('Oversized video body');
			bytesChirho.set(partChirho.value, offsetChirho);
			offsetChirho += partChirho.value.length;
		}
	} finally {
		await readerChirho.cancel().catch(() => undefined);
	}
	if (offsetChirho !== lengthChirho) throw Error('Truncated video body');
	return bytesChirho;
}
export function videoRangeChirho(
	valueChirho: string,
	totalChirho: number
): [number, number] | null {
	const matchChirho = /^bytes=([0-9]*)-([0-9]*)$/.exec(valueChirho);
	if (!matchChirho || (!matchChirho[1] && !matchChirho[2])) return null;
	if (!matchChirho[1]) {
		const suffixChirho = Number(matchChirho[2]);
		return Number.isSafeInteger(suffixChirho) && suffixChirho > 0
			? [Math.max(0, totalChirho - suffixChirho), totalChirho - 1]
			: null;
	}
	const startChirho = Number(matchChirho[1]);
	const endChirho = matchChirho[2] ? Number(matchChirho[2]) : totalChirho - 1;
	return Number.isSafeInteger(startChirho) &&
		Number.isSafeInteger(endChirho) &&
		startChirho < totalChirho &&
		startChirho <= endChirho
		? [startChirho, Math.min(endChirho, totalChirho - 1)]
		: null;
}

export async function videoResponseChirho(
	requestChirho: Request,
	shaChirho: string,
	lengthChirho: number,
	environmentChirho: WorkerEnvironmentChirho,
	contextChirho: ExecutionChirho,
	dependenciesChirho: DependenciesChirho
): Promise<Response> {
	if (!['GET', 'HEAD'].includes(requestChirho.method))
		return new Response(null, { status: 405, headers: { Allow: 'GET, HEAD' } });
	if (
		!/^[a-f0-9]{64}$/.test(shaChirho) ||
		!Number.isSafeInteger(lengthChirho) ||
		lengthChirho < 1 ||
		lengthChirho > VIDEO_LIMIT_CHIRHO
	)
		return new Response(null, { status: 503 });
	const etagChirho = `"${shaChirho}"`;
	const headersChirho = new Headers({
		'Content-Type': 'video/mp4',
		'Content-Length': String(lengthChirho),
		'Accept-Ranges': 'bytes',
		ETag: etagChirho,
		'Cache-Control': 'public, max-age=31536000, immutable',
		'X-Content-Type-Options': 'nosniff',
		'X-Robots-Tag': 'noindex',
		'X-Hinneh-Video-Chirho': 'r2'
	});
	if (
		requestChirho.headers
			.get('if-none-match')
			?.split(',')
			.some((tagChirho) => ['*', etagChirho].includes(tagChirho.trim().replace(/^W\//, '')))
	) {
		headersChirho.delete('Content-Length');
		return new Response(null, { status: 304, headers: headersChirho });
	}
	if (requestChirho.method === 'HEAD') return new Response(null, { headers: headersChirho });
	const rangeValueChirho = requestChirho.headers.get('range');
	const ifRangeChirho = requestChirho.headers.get('if-range');
	let rangeChirho: [number, number] | null = null;
	if (rangeValueChirho !== null && (ifRangeChirho === null || ifRangeChirho === etagChirho)) {
		rangeChirho =
			rangeValueChirho.length <= 200 ? videoRangeChirho(rangeValueChirho, lengthChirho) : null;
		if (!rangeChirho)
			return new Response(null, {
				status: 416,
				headers: {
					'Content-Range': `bytes */${lengthChirho}`,
					'Accept-Ranges': 'bytes',
					'Cache-Control': 'no-store'
				}
			});
	}
	const cacheKeyChirho = new Request(
		`https://hinneh.bible.systems/video-chirho/sha256-chirho/${shaChirho}-chirho.mp4`
	);
	try {
		const cachedChirho = await dependenciesChirho.cache_chirho.match(cacheKeyChirho);
		let bytesChirho: Uint8Array<ArrayBuffer>;
		if (cachedChirho) {
			bytesChirho = await videoBytesChirho(cachedChirho.body, lengthChirho);
		} else {
			const objectChirho = await environmentChirho.HINNEH_MEDIA_CHIRHO.get(
				`video-chirho/sha256-chirho/${shaChirho}.mp4`
			);
			if (!objectChirho)
				return new Response(null, { status: 404, headers: { 'Cache-Control': 'no-store' } });
			if (objectChirho.size !== lengthChirho)
				return new Response(null, { status: 502, headers: { 'Cache-Control': 'no-store' } });
			bytesChirho = await videoBytesChirho(objectChirho.body, lengthChirho);
		}
		const digestChirho = new Uint8Array(await crypto.subtle.digest('SHA-256', bytesChirho));
		if (
			bytesChirho.length !== lengthChirho ||
			[...digestChirho].map((byteChirho) => byteChirho.toString(16).padStart(2, '0')).join('') !==
				shaChirho
		)
			throw Error('Video hash differs');
		if (!cachedChirho)
			contextChirho.waitUntil(
				dependenciesChirho.cache_chirho
					.put(cacheKeyChirho, new Response(bytesChirho.slice(), { headers: headersChirho }))
					.catch(() => undefined)
			);
		if (rangeChirho) {
			const [startChirho, endChirho] = rangeChirho;
			headersChirho.set('Content-Range', `bytes ${startChirho}-${endChirho}/${lengthChirho}`);
			headersChirho.set('Content-Length', String(endChirho - startChirho + 1));
			return new Response(bytesChirho.slice(startChirho, endChirho + 1), {
				status: 206,
				headers: headersChirho
			});
		}
		return new Response(bytesChirho, { headers: headersChirho });
	} catch {
		return new Response(null, { status: 502, headers: { 'Cache-Control': 'no-store' } });
	}
}
