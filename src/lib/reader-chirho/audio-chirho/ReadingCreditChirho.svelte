<!-- For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life. — John 3:16 (KJV) -->
<script lang="ts">
	import { audioTChirho } from './audio-messages-chirho';
	import type { RecordingChirho } from './recordings-chirho';
	// Workflow: verse-media-chirho.md. L.J. (2026-11-07): credits belong in an info view, not the main UI,
	// so the human reading's credit (also the verse video's sound credit) is shown in the verse's Sources fold.
	let { readingChirho }: { readingChirho: RecordingChirho } = $props();
</script>

{#if readingChirho.reading_source_chirho}
	<!-- The CC BY-SA attribution stays verbatim in English, as published; only the link text follows the locale. -->
	<p data-reading-credit-chirho>
		<span lang="en">{readingChirho.reading_source_chirho.attribution_chirho}</span> ·
		<a
			href="https://creativecommons.org/licenses/by-sa/3.0/"
			target="_blank"
			rel="external noreferrer">{audioTChirho('license_chirho')}</a
		>
	</p>
{/if}
