// For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life. — John 3:16 (KJV)
// Workflow: spec-chirho/workflows-chirho/hosting-chirho/domain-chirho.md.
export const SITE_HOSTNAME_CHIRHO = 'hinneh.us';
export const LEGACY_HOSTNAME_CHIRHO = 'hinneh.bible.systems';
export const SITE_HOSTNAMES_CHIRHO = [SITE_HOSTNAME_CHIRHO, LEGACY_HOSTNAME_CHIRHO] as const;
export const SITE_ORIGIN_CHIRHO = `https://${SITE_HOSTNAME_CHIRHO}`;
export const SHARE_IMAGE_PATH_CHIRHO = '/assets-chirho/site-chirho/hinneh-share-v1-chirho.jpg';
export const INFORMATION_PAGE_IDS_CHIRHO = [
	'about-chirho',
	'privacy-chirho',
	'terms-chirho',
	'sources-chirho',
	'contact-chirho'
] as const;
export function isSiteHostnameChirho(
	valueChirho: unknown
): valueChirho is (typeof SITE_HOSTNAMES_CHIRHO)[number] {
	return (
		typeof valueChirho === 'string' &&
		SITE_HOSTNAMES_CHIRHO.some((hostnameChirho) => hostnameChirho === valueChirho)
	);
}
