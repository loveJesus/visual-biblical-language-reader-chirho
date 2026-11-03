// For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life. — John 3:16 (KJV)

// Concurrent project previews may occupy the default port; keep tests and their server aligned.
export const readerPortChirho = Number(process.env.HINNEH_TEST_PORT_CHIRHO ?? 4183);
export const readerOriginChirho = `http://127.0.0.1:${readerPortChirho}`;
import { SITE_HOSTNAMES_CHIRHO } from '../../src/lib/site-chirho';

export function isReaderRequestChirho(urlChirho: string): boolean {
	const parsedChirho = new URL(urlChirho);
	return (
		parsedChirho.origin === readerOriginChirho ||
		(parsedChirho.protocol === 'https:' &&
			SITE_HOSTNAMES_CHIRHO.some((hostnameChirho) => hostnameChirho === parsedChirho.hostname) &&
			/^\/assets-chirho\/[a-z0-9/-]+\.webp$/.test(parsedChirho.pathname))
	);
}
export const readerArtworkUrlChirho = (pathChirho: string) => pathChirho;
