<!-- For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life. — John 3:16 (KJV) -->

<script lang="ts">
	import { onMount } from 'svelte';
	import { page as pageChirho } from '$app/state';
	import { routeTChirho } from '$lib/i18n-chirho/route-messages-chirho';
	import { initLocaleChirho } from '$lib/i18n-chirho/locale-state-chirho.svelte';
	import ReaderShellChirho from '$lib/reader-chirho/navigation-chirho/ReaderShellChirho.svelte';
	import PageMetaChirho from '$lib/site-chirho/PageMetaChirho.svelte';
	import HomeIntroChirho from '$lib/site-chirho/HomeIntroChirho.svelte';
	import type { PageData } from './$types';
	let { data: dataChirho }: { data: PageData } = $props();
	let introVisibleChirho = $state(true);
	$effect(() => {
		if (pageChirho.url.hash) introVisibleChirho = false;
	});
	onMount(() => {
		introVisibleChirho = !window.location.hash;
		if (!dataChirho.lesson_chirho) initLocaleChirho(new URL(window.location.href));
	});
</script>

<PageMetaChirho />
{#if introVisibleChirho}<HomeIntroChirho
		onStartChirho={() => {
			introVisibleChirho = false;
		}}
	/>{/if}

{#if dataChirho.lesson_chirho}
	<ReaderShellChirho
		{introVisibleChirho}
		initialLessonChirho={dataChirho.lesson_chirho}
		lemmaLinksChirho={dataChirho.lemma_links_chirho}
		initialPresentationChirho={dataChirho.presentation_chirho}
		initialLanguagesChirho={dataChirho.languages_chirho}
		initialIconsChirho={dataChirho.icons_chirho}
		scenesChirho={dataChirho.scenes_chirho}
	/>
{:else}
	<section class="unavailable-chirho">
		<p class="eyebrow-chirho">Hinneh</p>
		<h1>{routeTChirho('lesson_chirho')}</h1>
		<p>{routeTChirho('lesson_note_chirho')}</p>
	</section>
{/if}
