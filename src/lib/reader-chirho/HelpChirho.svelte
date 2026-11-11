<!-- For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life. — John 3:16 (KJV) -->
<script lang="ts">
	import type { Snippet } from 'svelte';
	import { localeStateChirho } from '$lib/i18n-chirho/locale-state-chirho.svelte';
	import { readerTChirho } from '$lib/i18n-chirho/reader-messages-chirho';
	let {
		idChirho,
		labelChirho,
		helpChirho,
		hrefChirho,
		styleChirho = '',
		langChirho,
		helpLangChirho,
		contentChirho,
		children: childrenChirho
	}: {
		idChirho: string;
		labelChirho: string;
		helpChirho: string;
		hrefChirho?: string;
		styleChirho?: string;
		// Language of the label and help; defaults to the interface. helpLangChirho marks a help
		// body quoted from source data in another language.
		langChirho?: string;
		helpLangChirho?: string;
		contentChirho?: Snippet;
		children?: Snippet;
	} = $props();
	const textLangChirho = $derived(langChirho ?? localeStateChirho.currentChirho);
</script>

<!-- Keep the trigger's source text exact when this component wraps a flagged Hebrew word. -->
<!-- prettier-ignore -->
<svelte:element this={hrefChirho ? 'a' : 'button'} type={hrefChirho ? undefined : 'button'} href={hrefChirho} target={hrefChirho ? '_blank' : undefined} rel={hrefChirho ? 'external noopener noreferrer' : undefined} hreflang={hrefChirho ? 'en' : undefined} class="help-trigger-chirho {styleChirho}" data-help-trigger-chirho aria-describedby="{idChirho}-help-chirho" aria-expanded="false">{#if childrenChirho}{@render childrenChirho()}{:else}{labelChirho}{/if}</svelte:element><span
	class="help-popup-chirho"
	id="{idChirho}-help-chirho"
	role="tooltip"
	lang={localeStateChirho.currentChirho}
	tabindex="-1"
	hidden
	data-annotation-chirho
	><strong lang={textLangChirho}>{labelChirho}</strong><span lang={helpLangChirho ?? textLangChirho}
		>{helpChirho}</span
	>{#if contentChirho}{@render contentChirho()}{/if}<small
		>{readerTChirho('help_close_chirho')}</small
	></span
>
