// For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life. — John 3:16 (KJV)
import configurationChirho from '../../../config-chirho/media-library-chirho.json';
import { dev as developmentChirho } from '$app/environment';
import { SITE_ORIGIN_CHIRHO } from '../site-chirho';
// Published pages use their own domain. Vite development streams existing public R2 media.
export function artworkUrlChirho(pathChirho: string): string {
	return configurationChirho.storage_mode_chirho === 'r2' && developmentChirho
		? `${SITE_ORIGIN_CHIRHO}${pathChirho}`
		: pathChirho;
}
