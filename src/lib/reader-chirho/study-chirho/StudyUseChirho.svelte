<!-- For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life. — John 3:16 (KJV) -->
<script lang="ts">
	import type { StudyGlossChirho } from './word-study-client-chirho';
	import { localeStateChirho } from '$lib/i18n-chirho/locale-state-chirho.svelte';
	import VerseReferenceChirho from './VerseReferenceChirho.svelte';
	let {
		groupChirho,
		totalChirho,
		modeChirho
	}: { groupChirho: StudyGlossChirho; totalChirho: number; modeChirho: 'readers' | 'terse' } =
		$props();
	let pageChirho = $state(0);
	const spanishChirho = $derived(localeStateChirho.currentChirho === 'es');
	const versesChirho = $derived(
		groupChirho.verse_ids_chirho ??
			groupChirho.examples_chirho.map((rowChirho) => rowChirho.verse_chirho)
	);
	const visibleChirho = $derived(versesChirho.slice(pageChirho * 8, (pageChirho + 1) * 8));
	$effect(() => {
		void groupChirho;
		pageChirho = 0;
	});
</script>

<details class="study-use-chirho">
	<summary
		><span>{groupChirho.gloss_chirho}</span><span class="study-count-chirho"
			>{groupChirho.count_chirho.toLocaleString(localeStateChirho.currentChirho)}
			<small
				>{new Intl.NumberFormat(localeStateChirho.currentChirho, {
					style: 'percent',
					maximumFractionDigits: 1
				}).format(groupChirho.count_chirho / totalChirho)}</small
			></span
		></summary
	>
	<div class="study-verse-list-chirho">
		<ul>
			{#each visibleChirho as verseChirho (verseChirho)}<li>
					<VerseReferenceChirho {verseChirho} {modeChirho} />
				</li>{/each}
		</ul>
		<nav aria-label={spanishChirho ? 'Páginas de versículos' : 'Verse pages'}>
			<button
				type="button"
				aria-label={spanishChirho ? 'Página anterior de versículos' : 'Previous verse page'}
				disabled={pageChirho === 0}
				onclick={() => (pageChirho -= 1)}>←</button
			><span
				>{pageChirho + 1}/{Math.max(1, Math.ceil(versesChirho.length / 8))} · {versesChirho.length.toLocaleString(
					localeStateChirho.currentChirho
				)}
				{spanishChirho ? 'versículos' : 'verses'}</span
			><button
				type="button"
				aria-label={spanishChirho ? 'Página siguiente de versículos' : 'Next verse page'}
				disabled={(pageChirho + 1) * 8 >= versesChirho.length}
				onclick={() => (pageChirho += 1)}>→</button
			>
		</nav>
		{#if groupChirho.count_chirho > versesChirho.length}<p>
				{groupChirho.count_chirho}
				{spanishChirho
					? 'usos; puede repetirse en un versículo.'
					: 'uses; a word may occur twice in one verse.'}
			</p>{/if}
	</div>
</details>

<style>
	.study-use-chirho {
		border-top: 1px solid #e4e8dd;
	}
	summary {
		display: flex;
		justify-content: space-between;
		gap: 14px;
		padding: 11px 13px;
		cursor: pointer;
		font-size: 13px;
		overflow-wrap: anywhere;
	}
	summary > span:first-child::before {
		content: '+ ';
		color: #819178;
	}
	details[open] summary > span:first-child::before {
		content: '− ';
	}
	.study-count-chirho {
		flex-shrink: 0;
		font-variant-numeric: tabular-nums;
	}
	small {
		color: #7a8473;
		display: inline-block;
		min-width: 42px;
		text-align: end;
		font-size: 10px;
	}
	.study-verse-list-chirho {
		padding: 0 13px 12px;
	}
	ul {
		display: grid;
		grid-template-columns: repeat(2, minmax(0, 1fr));
		gap: 2px 12px;
		list-style: none;
		padding: 0;
		margin: 0 0 10px;
	}
	li {
		min-width: 0;
	}
	nav {
		display: flex;
		justify-content: space-between;
		align-items: center;
		gap: 10px;
		font-size: 11px;
		color: #6a795f;
	}
	button {
		min-width: 30px;
		min-height: 30px;
		padding: 3px 8px;
		background: #f1f4eb;
		border: 1px solid #c8d3bf;
		border-radius: 6px;
		color: #36513e;
		cursor: pointer;
	}
	button:disabled {
		opacity: 0.4;
		cursor: default;
	}
	p {
		font-size: 10px;
		line-height: 1.5;
		color: #77836d;
		margin: 8px 0 0;
	}
	button:focus-visible,
	summary:focus-visible {
		outline: 3px solid #405a89;
		outline-offset: 3px;
	}
	@media (max-width: 360px) {
		ul {
			grid-template-columns: minmax(0, 1fr);
		}
	}
</style>
