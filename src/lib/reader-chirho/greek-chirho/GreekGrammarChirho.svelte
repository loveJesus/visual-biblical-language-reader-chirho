<!-- For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life. — John 3:16 (KJV) -->
<script lang="ts">
	import HelpChirho from '../HelpChirho.svelte';
	import { greekKeyRowsChirho } from './greek-key-chirho';
	import {
		legendItemTextChirho,
		legendRowTextChirho
	} from '$lib/i18n-chirho/legend-messages-chirho';
	import { localeStateChirho } from '$lib/i18n-chirho/locale-state-chirho.svelte';
	import { readerPartsChirho, readerTChirho } from '$lib/i18n-chirho/reader-messages-chirho';
	const conventionsChirho = $derived(
		readerPartsChirho('greek_conventions_note_chirho', 'reference_chirho')
	);
</script>

<section class="grammar-section-chirho" aria-labelledby="greek-grammar-heading-chirho">
	<div class="section-heading-chirho">
		<div>
			<p class="eyebrow-chirho">{readerTChirho('grammar_eyebrow_chirho')}</p>
			<h2 id="greek-grammar-heading-chirho">{readerTChirho('grammar_heading_chirho')}</h2>
		</div>
		<p>{readerTChirho('greek_grammar_hint_chirho')}</p>
	</div>
	<dl class="grammar-legend-chirho">
		{#each greekKeyRowsChirho as rowChirho (rowChirho.label_chirho)}
			{@const rowTextChirho = legendRowTextChirho(
				rowChirho.label_chirho,
				localeStateChirho.currentChirho
			)}
			<div class="legend-row-chirho">
				<dt lang={rowTextChirho.lang_chirho}>{rowTextChirho.label_chirho}</dt>
				<dd>
					{#each rowChirho.items_chirho as itemChirho (itemChirho.id_chirho)}
						{@const textChirho = legendItemTextChirho(itemChirho, localeStateChirho.currentChirho)}
						<HelpChirho
							idChirho={itemChirho.id_chirho}
							labelChirho={textChirho.label_chirho}
							helpChirho={textChirho.help_chirho}
							styleChirho={itemChirho.style_chirho}
							langChirho={textChirho.lang_chirho}
						/>
					{/each}
				</dd>
			</div>
		{/each}
	</dl>
	<p class="quiet-note-chirho">
		{readerTChirho('greek_cues_note_chirho')}
	</p>
	<p class="quiet-note-chirho">
		{conventionsChirho[0]}<a
			href="https://github.com/biblicalhumanities/Nestle1904/blob/713f28a3b7d4d66132f5aa809fa223fe79762e5d/morph/parsing.txt"
			hreflang="en"
			target="_blank"
			rel="external noreferrer">{readerTChirho('nestle_reference_chirho')}</a
		>{conventionsChirho[1]}
	</p>
</section>
