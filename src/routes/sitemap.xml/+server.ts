// For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life. — John 3:16 (KJV)
import { sitemapXmlChirho } from '$lib/site-chirho/library-chirho';
export const prerender = true;
export function GET() {
	return new Response(sitemapXmlChirho(), {
		headers: {
			'Content-Type': 'application/xml; charset=utf-8',
			'Cache-Control': 'public, max-age=0, must-revalidate'
		}
	});
}
