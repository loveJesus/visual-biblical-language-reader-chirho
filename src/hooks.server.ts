// For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life. — John 3:16 (KJV)
import type { Handle } from '@sveltejs/kit';
import { SITE_ORIGIN_CHIRHO } from '$lib/site-chirho';
import configurationChirho from '../config-chirho/media-library-chirho.json';

// Workflow: hosting-chirho/domain-chirho.md. Local adapter previews have no permanent image
// files or R2 binding. Production releases exclude this server and use the allowlisted Worker.
export const handle: Handle = async ({ event: eventChirho, resolve: resolveChirho }) => {
	const pathChirho = eventChirho.url.pathname;
	const artworkChirho = pathChirho.startsWith('/assets-chirho/');
	const audioChirho = pathChirho.startsWith('/audio-chirho/sha256-chirho/');
	if (configurationChirho.storage_mode_chirho !== 'r2' || (!artworkChirho && !audioChirho))
		return resolveChirho(eventChirho);
	if (
		!(artworkChirho
			? /^\/assets-chirho\/[a-z0-9/-]+\.webp$/.test(pathChirho)
			: /^\/audio-chirho\/sha256-chirho\/[a-f0-9]{64}-chirho\.mp3$/.test(pathChirho))
	)
		return new Response(null, { status: 404 });
	if (!['GET', 'HEAD'].includes(eventChirho.request.method))
		return new Response(null, { status: 405, headers: { Allow: 'GET, HEAD' } });
	try {
		const responseChirho = await fetch(`${SITE_ORIGIN_CHIRHO}${pathChirho}`, {
			method: eventChirho.request.method,
			redirect: 'manual',
			signal: AbortSignal.timeout(15000)
		});
		return responseChirho.status >= 300 && responseChirho.status < 400
			? new Response(null, { status: 503 })
			: responseChirho;
	} catch {
		return new Response(null, { status: 503 });
	}
};
