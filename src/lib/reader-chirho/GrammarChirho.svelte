<!-- For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life. — John 3:16 (KJV) -->
<script lang="ts">
	import { legendRowsChirho } from '$lib/domain-chirho/legend-chirho';
	import {
		legendItemTextChirho,
		legendRowTextChirho
	} from '$lib/i18n-chirho/legend-messages-chirho';
	import { localeStateChirho } from '$lib/i18n-chirho/locale-state-chirho.svelte';
	import { readerTChirho } from '$lib/i18n-chirho/reader-messages-chirho';
	import HelpChirho from './HelpChirho.svelte';
	let {
		lessonNoteChirho,
		lessonNoteLangChirho = 'en'
	}: { lessonNoteChirho: string; lessonNoteLangChirho?: string } = $props();
</script>

<section class="grammar-section-chirho" aria-labelledby="grammar-heading-chirho">
	<div class="section-heading-chirho">
		<div>
			<p class="eyebrow-chirho">{readerTChirho('grammar_eyebrow_chirho')}</p>
			<h2 id="grammar-heading-chirho">{readerTChirho('grammar_heading_chirho')}</h2>
		</div>
		<p>{readerTChirho('grammar_hint_chirho')}</p>
	</div>
	<dl class="grammar-legend-chirho">
		{#each legendRowsChirho as rowChirho (rowChirho.label_chirho)}
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
							hrefChirho={itemChirho.source_chirho}
							labelChirho={textChirho.label_chirho}
							helpChirho={textChirho.help_chirho}
							styleChirho={itemChirho.style_chirho}
							langChirho={textChirho.lang_chirho}
						/>{/each}
				</dd>
			</div>
		{/each}
	</dl>
	<p class="quiet-note-chirho">
		{readerTChirho('grammar_note_chirho')}
		<span lang={lessonNoteLangChirho}>{lessonNoteChirho}</span>
	</p>
	<details class="sources-details-chirho">
		<summary>{readerTChirho('grammar_references_chirho')}</summary>
		<ul>
			{#each legendRowsChirho as rowChirho (rowChirho.label_chirho)}{#each rowChirho.items_chirho as itemChirho (itemChirho.id_chirho)}<li
					>
						{legendItemTextChirho(itemChirho, localeStateChirho.currentChirho).label_chirho}:
						<a
							href={itemChirho.source_chirho}
							hreflang="en"
							rel="external noreferrer"
							target="_blank">{readerTChirho('grammar_reference_link_chirho')}</a
						>
					</li>{/each}{/each}
		</ul>
		<p class="quiet-note-chirho">
			{readerTChirho('grammar_states_note_chirho')}
		</p>
	</details>
</section>
