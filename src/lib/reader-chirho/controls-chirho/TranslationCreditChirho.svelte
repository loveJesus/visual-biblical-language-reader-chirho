<!-- For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life. — John 3:16 (KJV) -->
<script lang="ts">
	import { localeStateChirho } from '$lib/i18n-chirho/locale-state-chirho.svelte';
	const spanishChirho = $derived(localeStateChirho.currentChirho === 'es');
</script>

<p>
	<a
		href="https://global-tools.bible.systems/read-chirho/{spanishChirho ? 'spa' : 'eng'}"
		target="_blank"
		rel="external noreferrer">Bible Tools · Love Jesus Project ↗</a
	>
</p>
<p>
	{spanishChirho
		? 'Lectura y Breve: glosas importadas en el orden de las palabras originales. Cada glosa conserva su estado de revisión. Los borradores se identifican en los detalles de la palabra.'
		: 'Readers and Terse: imported glosses in source-word order. Each gloss keeps its recorded review status. Drafts are labeled in the word details.'}
</p>
