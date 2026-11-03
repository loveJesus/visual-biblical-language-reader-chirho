// For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life. — John 3:16 (KJV)
// Local deliberate review only: stream private R2 artwork without writing a raster cache.
import { readFile as readFileChirho } from 'node:fs/promises';
import { join as joinChirho } from 'node:path';
import {
	objectRequestChirho,
	digestChirho
} from '../../publish-chirho/r2-chirho/object-store-chirho';
import { COMPARISON_HOME_CHIRHO } from './run_comparison_chirho';
const homeChirho = joinChirho(process.cwd(), COMPARISON_HOME_CHIRHO);
const recordsChirho = JSON.parse(
	await readFileChirho(joinChirho(homeChirho, 'receipts-chirho.json'), 'utf8')
) as { asset_file_chirho: string; sha256_chirho: string }[];
const allowedChirho = new Map(
	recordsChirho.map((recordChirho) => [
		'/' + recordChirho.asset_file_chirho,
		recordChirho.sha256_chirho
	])
);
const serverChirho = Bun.serve({
	hostname: '127.0.0.1',
	port: 5176,
	async fetch(requestChirho) {
		if (!['GET', 'HEAD'].includes(requestChirho.method)) return new Response(null, { status: 405 });
		const urlChirho = new URL(requestChirho.url);
		if (!['127.0.0.1:5176', 'localhost:5176'].includes(requestChirho.headers.get('host') ?? ''))
			return new Response(null, { status: 403 });
		if (['/', '/index-chirho.html'].includes(urlChirho.pathname))
			return new Response(
				requestChirho.method === 'HEAD'
					? null
					: await readFileChirho(joinChirho(homeChirho, 'index-chirho.html')),
				{ headers: { 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'no-store' } }
			);
		const shaChirho = allowedChirho.get(urlChirho.pathname);
		if (!shaChirho || !/^[a-f0-9]{64}$/.test(shaChirho)) return new Response(null, { status: 404 });
		if (requestChirho.method === 'HEAD')
			return new Response(null, { headers: { 'Content-Type': 'image/webp' } });
		try {
			const responseChirho = await objectRequestChirho(
				'GET',
				`media-chirho/sha256-chirho/${shaChirho}.webp`
			);
			if (!responseChirho.ok) return new Response(null, { status: 503 });
			const bytesChirho = new Uint8Array(await responseChirho.arrayBuffer());
			if (bytesChirho.length > 2 * 1024 ** 2 || digestChirho(bytesChirho) !== shaChirho)
				return new Response(null, { status: 502 });
			return new Response(bytesChirho, {
				headers: { 'Content-Type': 'image/webp', 'Cache-Control': 'no-store' }
			});
		} catch {
			return new Response(null, { status: 503 });
		}
	}
});
console.log(
	`Private R2 review gallery: http://${serverChirho.hostname}:${serverChirho.port}/index-chirho.html`
);
