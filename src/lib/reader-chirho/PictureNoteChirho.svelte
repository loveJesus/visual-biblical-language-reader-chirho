<!-- For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life. — John 3:16 (KJV) -->
<script lang="ts">
	import ReportArtworkChirho from '$lib/media-review-chirho/ReportArtworkChirho.svelte';
	import type { ContextualIconChirho } from '$lib/domain-chirho/media-chirho';
	import { readerTChirho } from '$lib/i18n-chirho/reader-messages-chirho';
	let { iconChirho, verseIdChirho }: { iconChirho?: ContextualIconChirho; verseIdChirho: string } =
		$props();
</script>

{#if iconChirho?.assignment_chirho === 'lemma_default'}
	<p class="quiet-note-chirho lemma-picture-note-chirho">
		{readerTChirho('general_picture_chirho')}
		<span lang="en">{iconChirho.contextual_meaning_chirho}</span>.
	</p>
{/if}

{#if iconChirho}<ReportArtworkChirho
		assetPathChirho={iconChirho.asset_path_chirho}
		sha256Chirho={iconChirho.sha256_chirho}
		{verseIdChirho}
	/>{/if}
