<!-- For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life. — John 3:16 (KJV) -->
<script lang="ts">
	import { paletteChirho } from '$lib/domain-chirho/cues-chirho';
	import { legendRowsChirho } from '$lib/domain-chirho/legend-chirho';
	import { verbFormMarkerChirho, verbStemNumberChirho } from '$lib/domain-chirho/verb-forms-chirho';
	import { legendItemTextChirho } from '$lib/i18n-chirho/legend-messages-chirho';
	import { localeStateChirho } from '$lib/i18n-chirho/locale-state-chirho.svelte';
	import type { AidKindChirho } from './site-content-chirho';
	let { kindChirho }: { kindChirho: AidKindChirho } = $props();

	// A specimen reuses the reader's own palette, legend labels and verb codes, so it cannot drift
	// from the cues a passage actually shows. It is illustrative; the card text carries the meaning.
	const legendChirho = new Map(
		legendRowsChirho.flatMap((rowChirho) =>
			rowChirho.items_chirho.map((itemChirho) => [itemChirho.id_chirho, itemChirho] as const)
		)
	);
	function labelChirho(idChirho: string): string {
		const itemChirho = legendChirho.get(idChirho);
		return itemChirho
			? legendItemTextChirho(itemChirho, localeStateChirho.currentChirho).label_chirho
			: '';
	}
	const genderChirho = [
		['masculine-chirho', paletteChirho.masculine_chirho],
		['feminine-chirho', paletteChirho.feminine_chirho]
	] as const;
	const numberChirho = [
		['plural-chirho', paletteChirho.plural_chirho],
		['dual-chirho', paletteChirho.dual_chirho]
	] as const;
	const wordClassChirho = [
		['noun-chirho', paletteChirho.noun_chirho],
		['verb-chirho', paletteChirho.verb_chirho],
		['adjective-chirho', paletteChirho.adjective_chirho],
		['particle-chirho', paletteChirho.particle_chirho]
	] as const;
	const stemChirho = verbStemNumberChirho('qal');
	const formChirho = verbFormMarkerChirho('wayyiqtol');
	// cuesChirho marks a construct-state noun with a centered lowercase roman ii.
	const stateChirho = 'ii';
</script>

<div class="specimen-chirho specimen-{kindChirho}-chirho" aria-hidden="true">
	{#if kindChirho === 'colors'}
		<div class="chip-row-chirho">
			{#each genderChirho as [idChirho, colorChirho] (idChirho)}<span
					class="chip-chirho"
					style:background={colorChirho}>{labelChirho(idChirho)}</span
				>{/each}
		</div>
		<div class="chip-row-chirho">
			{#each numberChirho as [idChirho, colorChirho] (idChirho)}<span
					class="chip-chirho underline-chip-chirho"
					style:border-bottom-color={colorChirho}>{labelChirho(idChirho)}</span
				>{/each}
		</div>
	{:else if kindChirho === 'symbols'}
		<div class="marks-chirho">
			<span class="mark-word-chirho">
				<span class="mark-box-chirho"><sup class="mark-center-chirho">{stateChirho}</sup></span>
				<small>{labelChirho('construct-chirho')}</small>
			</span>
			<span class="mark-word-chirho">
				<span class="mark-box-chirho mark-verb-chirho"
					><sup class="mark-left-chirho">{stemChirho}</sup><sup class="mark-right-chirho"
						>{formChirho}</sup
					></span
				>
				<small>{labelChirho('qal-chirho')} · {labelChirho('wayyiqtol-chirho')}</small>
			</span>
		</div>
	{:else if kindChirho === 'art'}
		<div class="outline-row-chirho">
			{#each wordClassChirho as [idChirho, colorChirho] (idChirho)}<span
					class="outline-chirho"
					style:border-color={colorChirho}>{labelChirho(idChirho)}</span
				>{/each}
		</div>
	{:else}
		<div class="sound-chirho">
			<span class="speaker-chirho">
				<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor"
					><path
						stroke-width="1.7"
						stroke-linejoin="round"
						d="M11 4 6 8H3v8h3l5 4V4Zm4 4a6 6 0 0 1 0 8m3-11a10 10 0 0 1 0 14"
					/></svg
				>
			</span>
			<span class="wave-chirho">
				{#each [10, 22, 34, 18, 40, 26, 14, 30, 20, 36, 16, 24, 12] as heightChirho, indexChirho (indexChirho)}<i
						style:height="{heightChirho}px"
					></i>{/each}
			</span>
		</div>
	{/if}
</div>

<style>
	.specimen-chirho {
		min-height: 112px;
		display: flex;
		flex-direction: column;
		justify-content: center;
		gap: 10px;
		padding: 16px;
		border-radius: 12px;
		background: #fbf8f1;
		border: 1px solid #e6dcc8;
		color: #2e3d34;
		font: 13px/1.3 var(--sans-chirho);
	}
	.chip-row-chirho,
	.outline-row-chirho {
		display: flex;
		flex-wrap: wrap;
		gap: 8px;
	}
	.chip-chirho {
		border-radius: 4px;
		padding: 5px 10px;
		border-bottom: 3px solid transparent;
	}
	.underline-chip-chirho {
		background: #fffdf8;
	}
	.marks-chirho {
		display: flex;
		flex-wrap: wrap;
		gap: 12px 22px;
		align-items: flex-end;
	}
	.mark-word-chirho {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 6px;
	}
	.mark-box-chirho {
		position: relative;
		display: block;
		width: 62px;
		height: 22px;
		margin-top: 18px;
		border-radius: 5px;
		background: linear-gradient(90deg, #ddd0b6, #e9dfcb);
		border: 1px solid #cdbd9e;
	}
	.mark-verb-chirho {
		width: 84px;
	}
	.mark-box-chirho sup {
		position: absolute;
		top: -19px;
		font: 600 15px/1 var(--serif-chirho);
		color: #4d3a28;
	}
	.mark-center-chirho {
		left: 50%;
		transform: translateX(-50%);
	}
	.mark-left-chirho {
		left: 4px;
	}
	.mark-right-chirho {
		right: 4px;
	}
	.mark-word-chirho small {
		font-size: 11px;
		color: #5c665d;
	}
	.outline-chirho {
		border: 2px solid;
		border-radius: 6px;
		padding: 5px 9px;
		background: #fffdf8;
	}
	.sound-chirho {
		display: flex;
		align-items: center;
		gap: 14px;
	}
	.speaker-chirho {
		flex: 0 0 auto;
		display: inline-flex;
		align-items: center;
		justify-content: center;
		width: 44px;
		height: 44px;
		border-radius: 50%;
		background: #1d3a2c;
		color: #f3dcc4;
	}
	.wave-chirho {
		display: flex;
		align-items: center;
		gap: 4px;
		min-width: 0;
		overflow: hidden;
	}
	.wave-chirho i {
		display: block;
		flex: 0 0 4px;
		border-radius: 2px;
		background: #b8794f;
		opacity: 0.85;
	}
	@media (max-width: 600px) {
		.specimen-chirho {
			min-height: 0;
		}
	}
</style>
