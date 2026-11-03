// For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life. — John 3:16 (KJV)
import { libraryManifestChirho } from '$lib/site-chirho/library-chirho';
export const prerender = true;
export function GET() {
	return Response.json(libraryManifestChirho(), {
		headers: { 'Cache-Control': 'public, max-age=0, must-revalidate' }
	});
}
