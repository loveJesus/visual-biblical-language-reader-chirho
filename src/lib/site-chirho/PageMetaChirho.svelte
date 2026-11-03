<!-- For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life. — John 3:16 (KJV) -->
<script lang="ts">
	import { SITE_ORIGIN_CHIRHO } from '$lib/site-chirho';
	import { siteTChirho, SHARE_PATH_CHIRHO } from './site-content-chirho';
	let {
		titleChirho,
		descriptionChirho,
		pathChirho = '/'
	}: { titleChirho?: string; descriptionChirho?: string; pathChirho?: string } = $props();
	const fullTitleChirho = $derived(
		titleChirho ? `${titleChirho} · Hinneh` : siteTChirho('title_chirho')
	);
	const summaryChirho = $derived(descriptionChirho ?? siteTChirho('description_chirho'));
</script>

<svelte:head>
	<title>{fullTitleChirho}</title>
	<meta name="description" content={summaryChirho} />
	<link rel="canonical" href={SITE_ORIGIN_CHIRHO + pathChirho} />
	<meta property="og:type" content="website" />
	<meta property="og:site_name" content="Hinneh" />
	<meta property="og:title" content={fullTitleChirho} />
	<meta property="og:description" content={summaryChirho} />
	<meta property="og:url" content={SITE_ORIGIN_CHIRHO + pathChirho} />
	<meta property="og:image" content={SITE_ORIGIN_CHIRHO + SHARE_PATH_CHIRHO} />
	<meta property="og:image:type" content="image/jpeg" />
	<meta property="og:image:width" content="1200" />
	<meta property="og:image:height" content="630" />
	<meta
		property="og:image:alt"
		content="Hinneh — read the Bible in Hebrew and Greek, with word pictures, grammar and pronunciation."
	/>
	<meta name="twitter:card" content="summary_large_image" />
	<meta name="twitter:title" content={fullTitleChirho} />
	<meta name="twitter:description" content={summaryChirho} />
	<meta name="twitter:image" content={SITE_ORIGIN_CHIRHO + SHARE_PATH_CHIRHO} />
</svelte:head>
