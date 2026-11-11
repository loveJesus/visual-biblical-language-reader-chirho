<!-- For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life. — John 3:16 (KJV) -->
<script lang="ts">
	import { resolve as resolveChirho } from '$app/paths';
	import StudyUseChirho from './StudyUseChirho.svelte';
	import ContextUsesChirho from './ContextUsesChirho.svelte';
	import { localeStateChirho } from '$lib/i18n-chirho/locale-state-chirho.svelte';
	import { wordStudyClientChirho, type WordStudyChirho } from './word-study-client-chirho';
	let { lemmaChirho, lexicalChirho }: { lemmaChirho: string; lexicalChirho: string } = $props();
	const spanishChirho = $derived(localeStateChirho.currentChirho === 'es');
	let modeChirho = $state<'readers' | 'terse'>('readers');
	const chosenModeChirho = $derived(spanishChirho ? 'terse' : modeChirho);
	let recordChirho = $state<WordStudyChirho | null>(null);
	let statusChirho = $state<'loading' | 'ready' | 'failed'>('loading');
	let pageChirho = $state(0);
	let othersPageChirho = $state(0);
	const othersChirho = $derived(recordChirho?.glosses_chirho.slice(6) ?? []);
	let retryChirho = $state(0);
	let filterChirho = $state('');
	const filteredChirho = $derived(
		recordChirho?.glosses_chirho.filter((groupChirho) =>
			groupChirho.gloss_chirho.toLocaleLowerCase().includes(filterChirho.toLocaleLowerCase().trim())
		) ?? []
	);
	const colorsChirho = [
		'#36563e',
		'#638a77',
		'#c78c4f',
		'#746695',
		'#6587a2',
		'#b57472',
		'#d7dcd1'
	];
	const countChirho = $derived(
		(recordChirho?.covered_chirho ?? 0) - (recordChirho?.empty_chirho ?? 0)
	);
	const chartChirho = $derived.by(() => {
		const groupsChirho = recordChirho?.glosses_chirho ?? [];
		const rowsChirho = groupsChirho.slice(0, 6).map((groupChirho) => ({
			labelChirho: groupChirho.gloss_chirho,
			countChirho: groupChirho.count_chirho
		}));
		const remainderChirho = groupsChirho
			.slice(6)
			.reduce((sumChirho, groupChirho) => sumChirho + groupChirho.count_chirho, 0);
		if (remainderChirho)
			rowsChirho.push({
				labelChirho: spanishChirho ? 'Otras traducciones' : 'Other translations',
				countChirho: remainderChirho
			});
		return rowsChirho;
	});
	const gradientChirho = $derived.by(() => {
		let positionChirho = 0;
		return chartChirho
			.map((rowChirho, indexChirho) => {
				const startChirho = positionChirho;
				positionChirho += (rowChirho.countChirho / countChirho) * 100;
				return `${colorsChirho[indexChirho]} ${startChirho}% ${positionChirho}%`;
			})
			.join(', ');
	});
	const visibleChirho = $derived(filteredChirho.slice(pageChirho * 12, (pageChirho + 1) * 12));
	const formatChirho = (numberChirho: number) =>
		new Intl.NumberFormat(spanishChirho ? 'es' : 'en').format(numberChirho);
	$effect(() => {
		const languageChirho = localeStateChirho.currentChirho;
		const editionChirho = chosenModeChirho;
		const keyChirho = lemmaChirho;
		void retryChirho;
		let activeChirho = true;
		recordChirho = null;
		statusChirho = 'loading';
		pageChirho = 0;
		othersPageChirho = 0;
		filterChirho = '';
		wordStudyClientChirho
			.wordChirho(languageChirho, editionChirho, keyChirho)
			.then((valueChirho) => {
				if (activeChirho) {
					recordChirho = valueChirho;
					statusChirho = 'ready';
				}
			})
			.catch(() => {
				if (activeChirho) statusChirho = 'failed';
			});
		return () => {
			activeChirho = false;
		};
	});
</script>

<section
	class="word-study-chirho"
	aria-labelledby="word-study-heading-chirho"
	aria-busy={statusChirho === 'loading'}
>
	<div class="study-heading-chirho">
		<div>
			<p class="eyebrow-chirho">{spanishChirho ? 'Estudio de la palabra' : 'Word study'}</p>
			<h3 id="word-study-heading-chirho">
				{spanishChirho ? 'Cómo se traduce' : 'How it is translated'}
			</h3>
		</div>
		<span class="lemma-label-chirho"
			><bdi dir="auto">{lexicalChirho}</bdi><small>{lemmaChirho}</small></span
		>
	</div>
	<div class="study-edition-chirho">
		<label
			>{spanishChirho ? 'Edición' : 'Edition'}<select
				aria-label={spanishChirho ? 'Edición del estudio' : 'Word study edition'}
				value={chosenModeChirho}
				onchange={(eventChirho) =>
					(modeChirho = eventChirho.currentTarget.value as 'readers' | 'terse')}
				>{#if !spanishChirho}<option value="readers">Readers · English</option>{/if}<option
					value="terse">Terse · {spanishChirho ? 'Español' : 'English'}</option
				></select
			></label
		><span
			>{spanishChirho ? 'Bible Tools · borrador importado' : 'Bible Tools · imported draft'}</span
		>
	</div>
	{#if statusChirho === 'loading'}<p role="status">
			{spanishChirho ? 'Cargando usos…' : 'Loading word uses…'}
		</p>
	{:else if statusChirho === 'failed'}<p role="status">
			{spanishChirho ? 'No se pudieron cargar los usos.' : 'Word uses could not be loaded.'}
			<button type="button" onclick={() => (retryChirho += 1)}
				>{spanishChirho ? 'Reintentar' : 'Try again'}</button
			>
		</p>
	{:else if recordChirho && countChirho > 0}
		<p class="study-coverage-chirho">
			<strong>{formatChirho(countChirho)}</strong>
			{spanishChirho ? 'usos traducidos de' : 'translated uses out of'}
			<strong>{formatChirho(recordChirho.total_chirho)}</strong>
			{spanishChirho ? 'apariciones de este lema.' : 'occurrences of this lemma.'}
		</p>
		<div class="study-chart-chirho">
			<div
				class="translation-pie-chirho"
				style:background={`conic-gradient(${gradientChirho})`}
				role="img"
				aria-label={spanishChirho
					? 'Distribución de traducciones; cifras en la lista siguiente.'
					: 'Translation distribution; exact counts in the following list.'}
			>
				<div>
					<strong>{formatChirho(recordChirho.glosses_chirho.length)}</strong><span
						>{spanishChirho ? 'traducciones' : 'translations'}</span
					>
				</div>
			</div>
			<ul class="study-legend-chirho">
				{#each chartChirho as rowChirho, indexChirho (rowChirho.labelChirho)}
					<li class:study-other-row-chirho={indexChirho === 6}>
						{#if indexChirho === 6}
							<details class="study-other-chirho">
								<summary
									><i class="study-swatch-chirho" style:background={colorsChirho[indexChirho]}
									></i><span>{rowChirho.labelChirho}</span><strong
										>{formatChirho(rowChirho.countChirho)}</strong
									></summary
								>
								<div class="other-translations-list-chirho">
									{#each othersChirho.slice(othersPageChirho * 12, (othersPageChirho + 1) * 12) as groupChirho (groupChirho.gloss_chirho)}<StudyUseChirho
											{groupChirho}
											totalChirho={countChirho}
											modeChirho={chosenModeChirho}
										/>{/each}
									<nav
										class="study-pages-chirho"
										aria-label={spanishChirho
											? 'Páginas de otras traducciones'
											: 'Other translation pages'}
									>
										<button
											type="button"
											disabled={othersPageChirho === 0}
											onclick={() => (othersPageChirho -= 1)}>←</button
										><span
											>{othersPageChirho + 1}/{Math.max(1, Math.ceil(othersChirho.length / 12))} · {othersChirho.length}
											{spanishChirho ? 'traducciones' : 'translations'}</span
										><button
											type="button"
											disabled={(othersPageChirho + 1) * 12 >= othersChirho.length}
											onclick={() => (othersPageChirho += 1)}>→</button
										>
									</nav>
								</div>
							</details>
						{:else}<span class="study-swatch-chirho" style:background={colorsChirho[indexChirho]}
							></span><span>{rowChirho.labelChirho}</span><strong
								>{formatChirho(rowChirho.countChirho)}</strong
							>{/if}
					</li>{/each}
			</ul>
		</div>
		<h4>{spanishChirho ? 'Traducciones y ejemplos' : 'Translations and examples'}</h4>
		<p class="study-note-chirho">
			{spanishChirho
				? 'Abra una traducción para ver sus versículos. Pase el cursor por una referencia para ver el original y la traducción.'
				: 'Open a translation to see its verses. Hover or focus a reference to preview the original and translation.'}
		</p>
		<label class="study-filter-chirho"
			>{spanishChirho ? 'Buscar entre las traducciones' : 'Find a translation'}<input
				type="search"
				value={filterChirho}
				oninput={(eventChirho) => {
					filterChirho = eventChirho.currentTarget.value;
					pageChirho = 0;
				}}
			/></label
		>
		<div class="study-uses-chirho">
			{#if !filteredChirho.length}<p class="study-note-chirho">
					{spanishChirho ? 'No hay traducciones que coincidan.' : 'No matching translations.'}
				</p>{/if}
			{#each visibleChirho as groupChirho (groupChirho.gloss_chirho)}<StudyUseChirho
					{groupChirho}
					totalChirho={countChirho}
					modeChirho={chosenModeChirho}
				/>{/each}
		</div>
		{#if filteredChirho.length > 12}<nav
				class="study-pages-chirho"
				aria-label={spanishChirho ? 'Páginas de traducciones' : 'Translation pages'}
			>
				<button type="button" disabled={pageChirho === 0} onclick={() => (pageChirho -= 1)}
					>{spanishChirho ? 'Anterior' : 'Previous'}</button
				><span
					>{pageChirho + 1}/{Math.ceil(filteredChirho.length / 12)} · {filteredChirho.length}
					{spanishChirho ? 'traducciones' : 'translations'}</span
				><button
					type="button"
					disabled={(pageChirho + 1) * 12 >= filteredChirho.length}
					onclick={() => (pageChirho += 1)}>{spanishChirho ? 'Siguiente' : 'Next'}</button
				>
			</nav>{/if}
		<p class="study-note-chirho">
			{spanishChirho
				? 'Cobertura parcial de la edición: los usos sin texto de traducción no entran en el gráfico. Las etiquetas conservan la redacción y las mayúsculas; pueden incluir prefijos o varias palabras. No son sentidos intercambiables.'
				: 'Edition coverage is partial: uses without translation text are outside the chart. Labels retain the edition’s wording and capitalization, and may include prefixes or phrases. These are not interchangeable senses.'}
		</p>
		{#if recordChirho.empty_chirho > 0}<p class="study-note-chirho">
				{formatChirho(recordChirho.empty_chirho)}
				{spanishChirho
					? 'usos alineados sin texto de traducción.'
					: 'aligned uses have no translation text.'}
			</p>{/if}
		<ContextUsesChirho {recordChirho} {lemmaChirho} modeChirho={chosenModeChirho} />
	{:else}<p>
			{spanishChirho
				? 'Esta edición aún no tiene usos alineados para este lema.'
				: 'This edition has no aligned uses for this lemma yet.'}
		</p>{/if}
	<p class="study-source-chirho">
		Love Jesus Project / Bible Tools · <a
			href="https://global-tools.bible.systems/"
			rel="external noreferrer">{spanishChirho ? 'Fuente' : 'Source'}</a
		>
		·
		<a href={resolveChirho('/about-chirho/#study-aids-chirho')}
			>{spanishChirho ? 'Licencias y créditos' : 'Licenses and credits'}</a
		>
	</p>
</section>

<style>
	.study-legend-chirho .study-other-row-chirho {
		display: block;
	}
	.study-other-chirho > summary {
		display: grid;
		grid-template-columns: 8px minmax(0, 1fr) auto;
		align-items: center;
		gap: 9px;
		padding: 0;
		font-size: 12px;
	}
	.study-other-chirho > summary > span::before {
		content: '+ ';
		color: #819178;
	}
	.study-other-chirho[open] > summary > span::before {
		content: '− ';
	}
	.other-translations-list-chirho {
		border: 1px solid #dce2d5;
		border-radius: 8px;
		margin-top: 10px;
		overflow: hidden;
	}
	.other-translations-list-chirho .study-pages-chirho {
		padding: 8px;
	}

	.study-filter-chirho {
		display: flex;
		flex-direction: column;
		gap: 6px;
		font-size: 11px;
		color: #65735f;
		margin-top: 14px;
	}
	.study-filter-chirho input {
		min-width: 0;
		width: 100%;
		box-sizing: border-box;
		min-height: 38px;
		border: 1px solid #c2ceba;
		border-radius: 8px;
		background: #fffef9;
		color: #334835;
		padding: 8px 11px;
		font: inherit;
		font-size: 13px;
	}
	.study-heading-chirho {
		scroll-margin-top: 90px;
	}

	.word-study-chirho {
		margin: 0 22px 24px;
		padding-top: 22px;
		border-top: 1px solid #dce2d5;
		color: #334835;
	}
	.study-heading-chirho {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 12px;
	}
	.eyebrow-chirho {
		font-size: 10px;
		letter-spacing: 0.12em;
		margin: 0 0 6px;
		text-transform: uppercase;
		color: #73806c;
	}
	h3 {
		font-family: Georgia, serif;
		font-size: 25px;
		line-height: 1.2;
		margin: 0;
	}
	h4 {
		font-size: 15px;
		margin: 22px 0 6px;
	}
	.lemma-label-chirho {
		display: flex;
		flex-direction: column;
		text-align: end;
		font-size: 25px;
	}
	.lemma-label-chirho small {
		color: #77816f;
		font-size: 11px;
	}
	.study-edition-chirho {
		display: flex;
		flex-wrap: wrap;
		gap: 10px 16px;
		align-items: end;
		margin: 18px 0 14px;
	}
	.study-edition-chirho label {
		display: flex;
		flex-direction: column;
		gap: 5px;
		font-size: 11px;
	}
	select {
		background: #f4f6ef;
		border: 1px solid #b7c4ae;
		border-radius: 8px;
		min-height: 38px;
		padding: 6px 30px 6px 10px;
		color: #36513e;
		font: inherit;
		font-size: 13px;
	}
	.study-edition-chirho > span {
		font-size: 11px;
		color: #697561;
		padding-bottom: 9px;
	}
	.study-coverage-chirho {
		font-size: 13px;
		line-height: 1.6;
	}
	.study-chart-chirho {
		display: grid;
		grid-template-columns: 150px minmax(0, 1fr);
		gap: 24px;
		align-items: center;
		padding: 12px 0;
	}
	.translation-pie-chirho {
		width: 150px;
		height: 150px;
		border-radius: 50%;
		display: grid;
		place-items: center;
	}
	.translation-pie-chirho > div {
		width: 104px;
		height: 104px;
		border-radius: 50%;
		background: #fcfcf7;
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
	}
	.translation-pie-chirho strong {
		font-family: Georgia, serif;
		font-size: 29px;
	}
	.translation-pie-chirho span {
		font-size: 10px;
		color: #77816f;
	}
	.study-legend-chirho {
		list-style: none;
		margin: 0;
		padding: 0;
		font-size: 12px;
	}
	.study-legend-chirho li {
		display: grid;
		grid-template-columns: 8px minmax(0, 1fr) auto;
		gap: 9px;
		align-items: center;
		padding: 5px 0;
		overflow-wrap: anywhere;
	}
	.study-swatch-chirho {
		width: 8px;
		height: 8px;
		border-radius: 2px;
	}
	.study-legend-chirho strong {
		font-variant-numeric: tabular-nums;
	}
	.study-note-chirho,
	.study-source-chirho {
		font-size: 11px;
		line-height: 1.7;
		color: #6b7765;
		margin: 8px 0;
	}
	.study-uses-chirho {
		margin: 12px 0;
		border: 1px solid #dce2d5;
		border-radius: 10px;
		overflow: hidden;
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
	a {
		color: #486943;
		text-underline-offset: 3px;
	}
	.study-pages-chirho {
		display: flex;
		justify-content: space-between;
		align-items: center;
		font-size: 11px;
		gap: 10px;
	}
	button {
		padding: 8px 12px;
		background: #f1f4eb;
		color: #36513e;
		border: 1px solid #c3cfb9;
		border-radius: 8px;
		cursor: pointer;
	}
	button:disabled {
		opacity: 0.5;
		cursor: default;
	}
	a:focus-visible,
	button:focus-visible,
	select:focus-visible,
	input:focus-visible,
	summary:focus-visible {
		outline: 3px solid #405a89;
		outline-offset: 3px;
	}
	@media (max-width: 420px) {
		.word-study-chirho {
			margin-inline: 16px;
		}
		.study-chart-chirho {
			grid-template-columns: 110px minmax(0, 1fr);
			gap: 12px;
		}
		.translation-pie-chirho {
			width: 110px;
			height: 110px;
		}
		.translation-pie-chirho > div {
			width: 76px;
			height: 76px;
		}
		.translation-pie-chirho strong {
			font-size: 24px;
		}
		.study-heading-chirho {
			flex-wrap: wrap;
		}
		h3 {
			font-size: 22px;
		}
	}
</style>
