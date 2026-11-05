<!-- For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life. — John 3:16 (KJV) -->
<script lang="ts">
	import { APP_STORES_CHIRHO, downloadTChirho } from './downloads-chirho';
	let { compactChirho = false, idChirho }: { compactChirho?: boolean; idChirho?: string } =
		$props();
</script>

<div id={idChirho} class="app-downloads-chirho" class:compact-chirho={compactChirho}>
	{#if !compactChirho}
		<h2>{downloadTChirho('title_chirho')}</h2>
		<p>{downloadTChirho('body_chirho')}</p>
	{/if}
	<div class="stores-chirho" role="group" aria-label={downloadTChirho('group_chirho')}>
		{#each APP_STORES_CHIRHO as storeChirho (storeChirho.id_chirho)}
			{#snippet contentsChirho()}
				<svg viewBox="0 0 24 24" width="26" height="26" aria-hidden="true">
					{#if storeChirho.id_chirho === 'apple-chirho'}
						<rect
							x="6"
							y="2"
							width="12"
							height="20"
							rx="3"
							fill="none"
							stroke="currentColor"
							stroke-width="1.5"
						/>
						<path
							d="M10 18.5h4"
							fill="none"
							stroke="currentColor"
							stroke-width="1.5"
							stroke-linecap="round"
						/>
					{:else}
						<path
							d="M5 3.5 20 12 5 20.5Z"
							fill="none"
							stroke="currentColor"
							stroke-width="1.5"
							stroke-linejoin="round"
						/>
					{/if}
				</svg>
				<span class="store-copy-chirho">
					<span class="store-platform-chirho">{storeChirho.platform_chirho}</span>
					<strong>{storeChirho.name_chirho}</strong>
				</span>
				<span class="store-status-chirho"
					>{downloadTChirho(storeChirho.url_chirho ? 'download_chirho' : 'soon_chirho')}</span
				>
			{/snippet}
			{#if storeChirho.url_chirho}
				<a class="store-card-chirho" href={storeChirho.url_chirho} rel="external noreferrer"
					>{@render contentsChirho()}</a
				>
			{:else}
				<div class="store-card-chirho pending-chirho">{@render contentsChirho()}</div>
			{/if}
		{/each}
	</div>
</div>

<style>
	.app-downloads-chirho {
		min-width: 0;
		max-width: 100%;
		padding: clamp(22px, 4vw, 36px);
		border: 1px solid #d5dccc;
		border-radius: 16px;
		background: #f2f5ee;
		scroll-margin-top: 24px;
	}
	h2 {
		margin: 0 0 12px;
		font: 400 clamp(24px, 3vw, 34px)/1.2 var(--serif-chirho);
		color: var(--ink-chirho);
	}
	p {
		margin: 0 0 22px;
		max-width: 56em;
		color: #536352;
		font-size: 15px;
		line-height: 1.6;
	}
	.stores-chirho {
		display: flex;
		flex-wrap: wrap;
		gap: 10px;
	}
	.store-card-chirho {
		display: flex;
		flex: 0 1 230px;
		align-items: center;
		gap: 10px;
		box-sizing: border-box;
		min-width: min(100%, 225px);
		min-height: 64px;
		padding: 11px 14px;
		border: 1px solid #aab7a6;
		border-radius: 9px;
		color: #304834;
		background: #fffefa;
		text-decoration: none;
	}
	svg {
		flex: 0 0 26px;
	}
	.store-copy-chirho {
		display: grid;
		gap: 2px;
	}
	.store-platform-chirho {
		font: 400 10px/1.3 var(--sans-chirho);
		color: #536352;
	}
	strong {
		font: 600 15px/1.25 var(--sans-chirho);
		white-space: nowrap;
	}
	.store-status-chirho {
		margin-left: auto;
		max-width: 70px;
		text-align: right;
		color: #536352;
		font: 500 11px/1.35 var(--sans-chirho);
	}
	a:hover {
		border-color: #355443;
		background: #eaf0e6;
	}
	a:focus-visible {
		outline: 2px solid #355443;
		outline-offset: 3px;
	}
	.compact-chirho {
		padding: 0;
		border: 0;
		border-radius: 0;
		background: transparent;
	}
	.compact-chirho .store-card-chirho {
		flex-basis: 230px;
		min-height: 58px;
		padding: 9px 12px;
	}
	@media (max-width: 460px) {
		.store-card-chirho {
			flex: 1 1 225px;
		}
		.compact-chirho .store-card-chirho {
			flex: 1 1 225px;
		}
	}
</style>
