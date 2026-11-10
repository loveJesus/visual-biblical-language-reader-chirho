<!-- For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life. — John 3:16 (KJV) -->
<script lang="ts">
	import { readerTChirho, spanishNoticeChirho } from '$lib/i18n-chirho/reader-messages-chirho';
	import {
		readyLayerChirho,
		type SpanishLayerResultChirho
	} from '$lib/i18n-chirho/spanish-glosses-chirho';
	let {
		spanishChirho,
		tokenIdChirho
	}: { spanishChirho: SpanishLayerResultChirho | null; tokenIdChirho: string } = $props();
	const layerChirho = $derived(readyLayerChirho(spanishChirho));
	const glossChirho = $derived(layerChirho?.glossesChirho[tokenIdChirho] ?? null);
</script>

<!-- One word's approved Spanish gloss, or the honest reason there is none; never a guess. -->
{#if glossChirho}<p class="word-gloss-chirho" lang="es">{glossChirho}</p>
	<small class="gloss-source-chirho">GBT</small>
{:else}<p class="word-gloss-chirho" data-meaning-unavailable-chirho="true">
		{layerChirho
			? readerTChirho('spanish_gloss_missing_chirho')
			: spanishNoticeChirho(spanishChirho)}
	</p>{/if}
