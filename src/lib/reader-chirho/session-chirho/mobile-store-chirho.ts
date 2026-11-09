// For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life. — John 3:16 (KJV)
// Workflow: spec-chirho/workflows-chirho/hosting-chirho/reader-session-chirho.md.
import { APP_STORES_CHIRHO } from '$lib/site-chirho/apps-chirho/downloads-chirho';

export type MobileStoreChirho = (typeof APP_STORES_CHIRHO)[number] | null;
type MobileNavigatorChirho = Pick<Navigator, 'userAgent' | 'platform' | 'maxTouchPoints'>;

/** A local display hint only; callers read browser properties after mounting. */
export function mobileStoreChirho(navigatorChirho?: MobileNavigatorChirho): MobileStoreChirho {
	if (!navigatorChirho || /Windows Phone/iu.test(navigatorChirho.userAgent)) return null;
	let idChirho: 'apple-chirho' | 'google-chirho';
	if (
		/iPhone|iPad|iPod/iu.test(navigatorChirho.userAgent) ||
		(navigatorChirho.platform === 'MacIntel' && navigatorChirho.maxTouchPoints > 1)
	)
		idChirho = 'apple-chirho';
	else if (/Android/iu.test(navigatorChirho.userAgent)) idChirho = 'google-chirho';
	else return null;
	return (
		APP_STORES_CHIRHO.find(
			(storeChirho) => storeChirho.id_chirho === idChirho && storeChirho.url_chirho
		) ?? null
	);
}
