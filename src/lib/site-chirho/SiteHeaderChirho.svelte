<!-- For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life. — John 3:16 (KJV) -->
<script lang="ts">
	import { onMount } from 'svelte';
	import { resolve as resolveChirho } from '$app/paths';
	import { replaceState as replaceStateChirho } from '$app/navigation';
	import { page as pageChirho } from '$app/state';
	import {
		initLocaleChirho,
		localeStateChirho,
		setLocaleChirho
	} from '$lib/i18n-chirho/locale-state-chirho.svelte';
	import type { LocaleChirho } from '$lib/i18n-chirho/locale-chirho';
	import faviconChirho from '$lib/assets/favicon.svg';
	import { siteTChirho } from './site-content-chirho';
	onMount(() => initLocaleChirho(new URL(window.location.href)));
	function chooseChirho(localeChirho: LocaleChirho) {
		setLocaleChirho(localeChirho);
		const urlChirho = new URL(window.location.href);
		urlChirho.searchParams.set('lang_chirho', localeChirho);
		replaceStateChirho(
			resolveChirho(`${urlChirho.pathname}${urlChirho.search}${urlChirho.hash}` as `/${string}`),
			pageChirho.state
		);
	}
</script>

<a class="skip-link-chirho" href="#main-chirho">{siteTChirho('skip_chirho')}</a>
<header class="public-header-chirho page-shell-chirho" data-online-site-chirho>
	<a
		class="wordmark-chirho"
		href={resolveChirho(`/?lang_chirho=${localeStateChirho.currentChirho}`)}
		data-sveltekit-reload
		aria-label={siteTChirho('home_chirho')}
	>
		<img src={faviconChirho} alt="" width="34" height="34" />
		<span>Hinneh<span class="wordmark-dot-chirho">.</span></span>
	</a>
	<nav aria-label={siteTChirho('navigation_chirho')}>
		<a href={resolveChirho(`/?lang_chirho=${localeStateChirho.currentChirho}#reader-chirho`)}
			>{siteTChirho('reader_chirho')}</a
		>
		<a href={resolveChirho(`/about-chirho/?lang_chirho=${localeStateChirho.currentChirho}`)}
			>{siteTChirho('about_chirho')}</a
		>
		<a href={resolveChirho(`/sources-chirho/?lang_chirho=${localeStateChirho.currentChirho}`)}
			>{siteTChirho('sources_chirho')}</a
		>
	</nav>
	<div class="site-languages-chirho" role="group" aria-label={siteTChirho('language_chirho')}>
		<button
			type="button"
			lang="en"
			aria-label={siteTChirho('english_chirho')}
			aria-pressed={localeStateChirho.currentChirho === 'en'}
			onclick={() => chooseChirho('en')}>EN</button
		>
		<span aria-hidden="true">/</span>
		<button
			type="button"
			lang="es"
			aria-label={siteTChirho('spanish_chirho')}
			aria-pressed={localeStateChirho.currentChirho === 'es'}
			onclick={() => chooseChirho('es')}>ES</button
		>
	</div>
</header>

<style>
	.public-header-chirho {
		display: flex;
		align-items: center;
		gap: 36px;
		min-height: 98px;
		border-bottom: 1px solid var(--line-chirho);
	}
	.wordmark-chirho {
		gap: 12px;
	}
	.wordmark-chirho .wordmark-dot-chirho {
		margin-left: 0;
	}
	nav {
		display: flex;
		gap: 26px;
		margin-left: auto;
		flex-wrap: wrap;
	}
	nav a {
		font-size: 14px;
		text-decoration: none;
		padding: 12px 0;
	}
	nav a:hover {
		color: #9e553d;
	}
	.site-languages-chirho {
		display: flex;
		align-items: center;
		gap: 3px;
		color: var(--quiet-chirho);
	}
	button {
		background: none;
		border: 0;
		border-radius: 5px;
		padding: 10px 7px;
		font-size: 12px;
		color: var(--quiet-chirho);
	}
	button[aria-pressed='true'] {
		color: var(--ink-chirho);
		font-weight: 700;
	}
	.skip-link-chirho {
		position: fixed;
		top: 8px;
		left: 8px;
		transform: translateY(-200%);
		z-index: 100;
		background: white;
		padding: 12px;
	}
	.skip-link-chirho:focus {
		transform: none;
	}
	@media (max-width: 600px) {
		.public-header-chirho {
			gap: 12px;
			flex-wrap: wrap;
			padding-top: 18px;
			padding-bottom: 10px;
		}
		.wordmark-chirho {
			font-size: 29px;
		}
		nav {
			order: 3;
			width: 100%;
			gap: 24px;
			justify-content: center;
		}
		.site-languages-chirho {
			margin-left: auto;
		}
	}
</style>
