<!-- For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life. — John 3:16 (KJV) -->
<script lang="ts">
	import { localeStateChirho } from '$lib/i18n-chirho/locale-state-chirho.svelte';
	import { SITE_ORIGIN_CHIRHO } from '$lib/site-chirho';
	import { APP_STORES_CHIRHO } from './apps-chirho/downloads-chirho';
	import { SHARE_PATH_CHIRHO, SOURCE_CODE_URL_CHIRHO, siteTChirho } from './site-content-chirho';
	let {
		titleChirho,
		descriptionChirho,
		pathChirho = '/'
	}: { titleChirho?: string; descriptionChirho?: string; pathChirho?: string } = $props();
	const fullTitleChirho = $derived(
		titleChirho ? `${titleChirho} · Hinneh` : siteTChirho('title_chirho')
	);
	const summaryChirho = $derived(descriptionChirho ?? siteTChirho('description_chirho'));
	const canonicalUrlChirho = $derived(SITE_ORIGIN_CHIRHO + pathChirho);
	const imageAltChirho = $derived(siteTChirho('share_alt_chirho'));
	const ogLocaleChirho = $derived(localeStateChirho.currentChirho === 'es' ? 'es_ES' : 'en_US');
	const ogAlternateLocaleChirho = $derived(
		localeStateChirho.currentChirho === 'es' ? 'en_US' : 'es_ES'
	);
	const downloadUrlsChirho = APP_STORES_CHIRHO.map((storeChirho) => storeChirho.url_chirho).filter(
		(urlChirho): urlChirho is string => urlChirho !== null
	);
	const jsonLdTextChirho = JSON.stringify({
		'@context': 'https://schema.org',
		'@graph': [
			{
				'@type': 'WebSite',
				'@id': `${SITE_ORIGIN_CHIRHO}/#website`,
				name: 'Hinneh',
				alternateName: ['הִנֵּה', 'Hinneh · Behold the Bible in Hebrew and Greek'],
				url: `${SITE_ORIGIN_CHIRHO}/`,
				inLanguage: ['en', 'es', 'he', 'grc'],
				description:
					'Behold the Bible in its original Biblical Hebrew and Koine Greek, word by word, with grammar colors and symbols, word pictures and recorded pronunciation.'
			},
			{
				'@type': 'SoftwareApplication',
				'@id': `${SITE_ORIGIN_CHIRHO}/#application`,
				name: 'Hinneh',
				applicationCategory: 'ReferenceApplication',
				operatingSystem: 'Web, iOS, Android',
				url: `${SITE_ORIGIN_CHIRHO}/`,
				downloadUrl: downloadUrlsChirho,
				sameAs: [...downloadUrlsChirho, SOURCE_CODE_URL_CHIRHO],
				isAccessibleForFree: true,
				license: 'https://www.gnu.org/licenses/gpl-3.0.html',
				offers: {
					'@type': 'Offer',
					price: '0',
					priceCurrency: 'USD'
				}
			}
		]
	}).replace(/[<>&]/g, (charChirho) =>
		charChirho === '<' ? '\\u003c' : charChirho === '>' ? '\\u003e' : '\\u0026'
	);
</script>

<svelte:head>
	<title>{fullTitleChirho}</title>
	<meta name="description" content={summaryChirho} />
	<link rel="canonical" href={canonicalUrlChirho} />
	<link rel="alternate" hreflang="en" href={`${canonicalUrlChirho}?lang_chirho=en`} />
	<link rel="alternate" hreflang="es" href={`${canonicalUrlChirho}?lang_chirho=es`} />
	<link rel="alternate" hreflang="x-default" href={canonicalUrlChirho} />
	<meta property="og:type" content="website" />
	<meta property="og:site_name" content="Hinneh" />
	<meta property="og:locale" content={ogLocaleChirho} />
	<meta property="og:locale:alternate" content={ogAlternateLocaleChirho} />
	<meta property="og:title" content={fullTitleChirho} />
	<meta property="og:description" content={summaryChirho} />
	<meta property="og:url" content={canonicalUrlChirho} />
	<meta property="og:image" content={SITE_ORIGIN_CHIRHO + SHARE_PATH_CHIRHO} />
	<meta property="og:image:type" content="image/jpeg" />
	<meta property="og:image:width" content="1200" />
	<meta property="og:image:height" content="630" />
	<meta property="og:image:alt" content={imageAltChirho} />
	<meta name="twitter:card" content="summary_large_image" />
	<meta name="twitter:title" content={fullTitleChirho} />
	<meta name="twitter:description" content={summaryChirho} />
	<meta name="twitter:image" content={SITE_ORIGIN_CHIRHO + SHARE_PATH_CHIRHO} />
	<meta name="twitter:image:alt" content={imageAltChirho} />
	<svelte:element this={"script"} type="application/ld+json">{jsonLdTextChirho}</svelte:element>
</svelte:head>
