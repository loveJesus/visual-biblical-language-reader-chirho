<!-- For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life. — John 3:16 (KJV) -->
<script lang="ts">
	import { resolve as resolveChirho } from '$app/paths';
	import { localeStateChirho } from '$lib/i18n-chirho/locale-state-chirho.svelte';
	import AppDownloadsChirho from './apps-chirho/AppDownloadsChirho.svelte';
	import { LEARNING_ANCHOR_CHIRHO, learningTChirho } from './learning-chirho/learning-paths-chirho';
	import {
		siteTChirho,
		FREE_MINISTRY_URL_CHIRHO,
		SOFTWARE_URL_CHIRHO,
		SOURCE_CODE_URL_CHIRHO,
		type InformationIdChirho
	} from './site-content-chirho';
	const linksChirho: readonly [
		InformationIdChirho,
		'about_chirho' | 'sources_chirho' | 'privacy_chirho' | 'terms_chirho' | 'contact_chirho'
	][] = [
		['about-chirho', 'about_chirho'],
		['sources-chirho', 'sources_chirho'],
		['privacy-chirho', 'privacy_chirho'],
		['terms-chirho', 'terms_chirho'],
		['contact-chirho', 'contact_chirho']
	];
</script>

<footer class="public-footer-chirho page-shell-chirho" data-online-site-chirho>
	<div>
		<strong>Hinneh.</strong>
		<p>{siteTChirho('footer_chirho')}</p>
		<p>
			<strong class="free-message-chirho">{siteTChirho('free_chirho')}</strong><br /><a
				href={FREE_MINISTRY_URL_CHIRHO}
				rel="external noreferrer">{siteTChirho('free_reason_chirho')} ↗</a
			>
		</p>
	</div>
	<nav aria-label={siteTChirho('footer_navigation_chirho')}>
		{#each linksChirho as [pathChirho, labelChirho] (pathChirho)}<a
				href={resolveChirho(`/${pathChirho}/?lang_chirho=${localeStateChirho.currentChirho}`)}
				>{siteTChirho(labelChirho)}</a
			>{/each}
		<a href={SOURCE_CODE_URL_CHIRHO} rel="external noreferrer"
			>{siteTChirho('source_code_chirho')} ↗</a
		>
		<a href={SOFTWARE_URL_CHIRHO} rel="external noreferrer">Love Jesus Software ↗</a>
		<a
			href={resolveChirho(
				`/about-chirho/?lang_chirho=${localeStateChirho.currentChirho}#${LEARNING_ANCHOR_CHIRHO}`
			)}>{learningTChirho('link_chirho')}</a
		>
		<AppDownloadsChirho compactChirho />
	</nav>
</footer>

<style>
	.public-footer-chirho {
		display: flex;
		gap: 32px;
		justify-content: space-between;
		border-top: 1px solid var(--line-chirho);
		padding-top: 30px;
		padding-bottom: 40px;
		margin-top: 60px;
	}
	strong {
		font: 28px var(--serif-chirho);
	}
	.free-message-chirho {
		font: 600 13px/1.7 var(--sans-chirho, sans-serif);
	}
	p {
		color: var(--quiet-chirho);
		font-size: 13px;
		line-height: 1.65;
		max-width: 450px;
	}
	nav {
		display: flex;
		align-content: flex-start;
		gap: 12px 22px;
		flex-wrap: wrap;
		padding-top: 8px;
	}
	a {
		font-size: 13px;
	}
	@media (max-width: 700px) {
		.public-footer-chirho {
			flex-direction: column;
			gap: 12px;
		}
	}
</style>
