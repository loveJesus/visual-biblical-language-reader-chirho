<!-- For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life. — John 3:16 (KJV) -->
<script lang="ts">
	import { readerPartsChirho, readerTChirho } from '$lib/i18n-chirho/reader-messages-chirho';
	let { languageChirho }: { languageChirho: 'he' | 'grc' } = $props();
	// The CC BY attribution sentence stays verbatim in English; the explanation follows the locale.
	const [hebrewBeforeChirho, hebrewAfterChirho] = $derived(
		readerPartsChirho('credit_hebrew_rest_chirho', 'license_chirho')
	);
	const [greekBeforeChirho, greekAfterChirho] = $derived(
		readerPartsChirho('credit_greek_chirho', 'terms_chirho')
	);
</script>

<p class="quiet-note-chirho">
	{#if languageChirho === 'he'}
		<span lang="en"
			>Original work of the Open Scriptures Hebrew Bible available at <a
				href="https://github.com/openscriptures/morphhb"
				target="_blank"
				rel="external noreferrer">https://github.com/openscriptures/morphhb</a
			></span
		>. {hebrewBeforeChirho}<a
			href="https://creativecommons.org/licenses/by/4.0/"
			target="_blank"
			rel="external noreferrer">CC BY 4.0</a
		>{hebrewAfterChirho}
	{:else}
		{greekBeforeChirho}<a
			href="https://berean.bible/terms.htm"
			target="_blank"
			rel="external noreferrer">{readerTChirho('public_domain_terms_chirho')}</a
		>{greekAfterChirho}
	{/if}
</p>
