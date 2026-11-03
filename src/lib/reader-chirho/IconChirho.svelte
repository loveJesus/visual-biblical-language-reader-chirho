<!-- For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life. — John 3:16 (KJV) -->
<script lang="ts">
	import { artworkUrlChirho } from '$lib/media-review-chirho/artwork-url-chirho';
	import {
		alternativeIconsChirho,
		type ContextualIconChirho
	} from '$lib/domain-chirho/media-chirho';
	import HelpChirho from './HelpChirho.svelte';
	import { termChirho } from '$lib/i18n-chirho/labels-chirho';
	import { localeStateChirho } from '$lib/i18n-chirho/locale-state-chirho.svelte';
	import { readerTChirho } from '$lib/i18n-chirho/reader-messages-chirho';
	let {
		iconChirho,
		tokenIdChirho,
		posChirho,
		colorChirho
	}: {
		iconChirho?: ContextualIconChirho;
		tokenIdChirho: string;
		posChirho: string;
		colorChirho: string;
	} = $props();
	const alternativesChirho = $derived(alternativeIconsChirho(iconChirho));
</script>

{#snippet stickerChirho()}
	<span
		class="sticker-chirho"
		class:double-border-chirho={alternativesChirho.length > 0}
		class:unknown-pos-chirho={posChirho === 'unknown'}
		class:greek-pronoun-chirho={posChirho === 'pronoun' && alternativesChirho.length === 0}
		class:greek-article-chirho={posChirho === 'article'}
		style:border-color={colorChirho}
		role="img"
		lang={localeStateChirho.currentChirho}
		aria-label={readerTChirho('icon_outline_chirho', {
			pos_chirho: termChirho(posChirho, localeStateChirho.currentChirho),
			state_chirho: readerTChirho(
				iconChirho
					? iconChirho.assignment_chirho === 'lemma_default'
						? 'icon_general_chirho'
						: 'icon_contextual_chirho'
					: 'icon_unavailable_chirho'
			)
		})}
	>
		{#if iconChirho}<img
				src={artworkUrlChirho(iconChirho.asset_path_chirho)}
				alt={iconChirho.alt_chirho}
				title={iconChirho.assignment_chirho === 'lemma_default'
					? `${readerTChirho('general_picture_chirho')} ${readerTChirho('general_picture_caveat_chirho')}`
					: undefined}
				data-lemma-picture-chirho={iconChirho.assignment_chirho === 'lemma_default'
					? true
					: undefined}
				width={iconChirho.width_chirho}
				height={iconChirho.height_chirho}
				data-icon-chirho
			/><span data-icon-missing-chirho hidden aria-hidden="true">◇</span>{:else}<span
				aria-hidden="true">◇</span
			>{/if}
	</span>
{/snippet}
<span data-annotation-chirho class="icon-unit-chirho">
	{#if alternativesChirho.length > 0}
		<HelpChirho
			idChirho="icons-{tokenIdChirho}"
			labelChirho={readerTChirho('other_meanings_chirho')}
			helpChirho={readerTChirho('other_meanings_help_chirho')}
			styleChirho="word-help-chirho icon-help-chirho"
		>
			{@render stickerChirho()}
			{#snippet contentChirho()}
				<span class="icon-selected-meaning-chirho"
					>{readerTChirho('here_meaning_chirho')}
					<span lang="en">{iconChirho?.contextual_meaning_chirho}</span></span
				>
				<span class="icon-gallery-chirho" dir="ltr">
					{#each alternativesChirho as alternativeChirho (alternativeChirho.asset_path_chirho)}
						<span
							><img
								src={artworkUrlChirho(alternativeChirho.asset_path_chirho)}
								alt={alternativeChirho.alt_chirho}
								width="64"
								height="64"
								loading="lazy"
							/><span class="icon-sense-label-chirho" lang="en"
								>{alternativeChirho.contextual_meaning_chirho}</span
							></span
						>
					{/each}
				</span>
			{/snippet}
		</HelpChirho>
	{:else}{@render stickerChirho()}{/if}
</span>

<style>
	.greek-pronoun-chirho {
		border-style: dashed;
		border-radius: 50%;
	}
	.greek-article-chirho {
		border-radius: 50%;
	}
</style>
