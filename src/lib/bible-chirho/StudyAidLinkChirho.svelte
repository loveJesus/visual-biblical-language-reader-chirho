<!-- For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life. — John 3:16 (KJV) -->
<script lang="ts">
	import { resolve as resolveChirho } from '$app/paths';
	import { localeStateChirho } from '$lib/i18n-chirho/locale-state-chirho.svelte';
	import { readerTChirho } from '$lib/i18n-chirho/reader-messages-chirho';
	import { STUDY_AIDS_SECTION_CHIRHO } from './study-aids-chirho';
</script>

<p class="study-aid-link-chirho">
	<a
		href={resolveChirho(
			`/about-chirho/?lang_chirho=${localeStateChirho.currentChirho}#${STUDY_AIDS_SECTION_CHIRHO}`
		)}>{readerTChirho('about_study_aids_chirho')}</a
	>
</p>

<style>
	.study-aid-link-chirho {
		margin: 0.75rem 0 0;
		font-size: 0.75rem;
	}
	a {
		color: #586c5b;
		text-underline-offset: 3px;
	}
</style>
