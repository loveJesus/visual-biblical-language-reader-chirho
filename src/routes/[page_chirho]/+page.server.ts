// For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life. — John 3:16 (KJV)
import { error } from '@sveltejs/kit';
import {
	INFORMATION_PAGES_CHIRHO,
	isInformationIdChirho
} from '$lib/site-chirho/site-content-chirho';
export const prerender = true;
export const trailingSlash = 'always';
export function entries() {
	return Object.keys(INFORMATION_PAGES_CHIRHO).map((pageChirho) => ({ page_chirho: pageChirho }));
}
export function load({ params: paramsChirho }: { params: { page_chirho: string } }) {
	if (!isInformationIdChirho(paramsChirho.page_chirho)) error(404, 'Page unavailable');
	return { id_chirho: paramsChirho.page_chirho };
}
