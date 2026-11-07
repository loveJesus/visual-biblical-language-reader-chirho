<!-- For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life. — John 3:16 (KJV) -->
<script lang="ts">
	import { onMount } from 'svelte';
	import { page as pageChirho } from '$app/state';
	import { routeTChirho } from '$lib/i18n-chirho/route-messages-chirho';
	import { initLocaleChirho } from '$lib/i18n-chirho/locale-state-chirho.svelte';
	onMount(() => initLocaleChirho(new URL(window.location.href)));
</script>

<svelte:head>
	<title>Hinneh · {routeTChirho('page_title_chirho')}</title>
	<meta name="robots" content="noindex" />
</svelte:head>
<main class="unavailable-chirho">
	<p class="eyebrow-chirho">Hinneh · {pageChirho.status}</p>
	<h1>{routeTChirho('page_chirho')}</h1>
	<p>{routeTChirho('retry_chirho')}</p>
</main>
