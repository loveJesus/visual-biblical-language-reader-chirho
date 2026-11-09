<!-- For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life. — John 3:16 (KJV) -->
<script lang="ts">
	import { onMount } from 'svelte';
	import { resolve as resolveChirho } from '$app/paths';
	import type { LocaleChirho } from '$lib/i18n-chirho/locale-chirho';
	import { referenceChirho } from '$lib/i18n-chirho/labels-chirho';
	import { paletteChirho } from '$lib/domain-chirho/cues-chirho';
	import { WELCOME_HERO_CHIRHO } from '$lib/site-chirho/apps-chirho/welcome-hero-chirho';
	import previewChirho from '../../../../data-chirho/reader-chirho/home-preview-chirho.json';
	import { sessionMessagesChirho } from './session-messages-chirho';
	import type { MobileStoreChirho } from './mobile-store-chirho';
	let {
		localeChirho,
		onCloseChirho,
		mobileStoreChirho = null
	}: {
		localeChirho: LocaleChirho;
		onCloseChirho: () => void;
		mobileStoreChirho?: MobileStoreChirho;
	} = $props();
	let dialogChirho: HTMLDialogElement;
	const copyChirho = $derived(sessionMessagesChirho(localeChirho));
	// The same canonical, source-verified examples used by the public home preview. No playback.
	const examplesChirho = previewChirho.excerpts_chirho.map((excerptChirho) => ({
		id_chirho: excerptChirho.id_chirho,
		language_chirho: excerptChirho.language_chirho,
		word_chirho: excerptChirho.words_chirho[1]
	}));
	onMount(() => {
		dialogChirho.showModal();
		dialogChirho
			.querySelector<HTMLButtonElement>('.welcome-start-chirho')
			?.focus({ preventScroll: true });
	});
</script>

<dialog
	bind:this={dialogChirho}
	onclose={onCloseChirho}
	aria-labelledby="welcome-heading-chirho"
	lang={localeChirho}
>
	<div class="welcome-body-chirho">
		<img
			class="welcome-hero-chirho"
			src={WELCOME_HERO_CHIRHO.asset_path_chirho}
			width={WELCOME_HERO_CHIRHO.width_chirho}
			height={WELCOME_HERO_CHIRHO.height_chirho}
			alt={copyChirho.hero_alt_chirho}
		/>
		<div class="welcome-copy-chirho">
			<p class="welcome-name-chirho">Hinneh <span lang="he" dir="rtl">הִנֵּה</span></p>
			<h2 id="welcome-heading-chirho">{copyChirho.welcome_chirho}</h2>
			<p class="welcome-intro-chirho">{copyChirho.intro_chirho}</p>
			<div class="welcome-examples-chirho">
				{#each examplesChirho as exampleChirho (exampleChirho.id_chirho)}
					<div class="welcome-example-chirho">
						<span
							class="welcome-word-chirho"
							lang={exampleChirho.language_chirho}
							dir={exampleChirho.language_chirho === 'he' ? 'rtl' : 'ltr'}
							style:background={exampleChirho.word_chirho.gender_chirho === 'masculine'
								? paletteChirho.masculine_chirho
								: paletteChirho.feminine_chirho}>{exampleChirho.word_chirho.text_chirho}</span
						>
						<span class="welcome-gloss-chirho"
							>{localeChirho === 'es'
								? exampleChirho.word_chirho.spanish_gloss_chirho
								: exampleChirho.word_chirho.gloss_chirho}</span
						>
						<small>{referenceChirho(exampleChirho.id_chirho, localeChirho)}</small>
					</div>
				{/each}
			</div>
		</div>
		<div class="welcome-secondary-chirho">
			<a
				class="welcome-tour-chirho"
				href={resolveChirho(`/tutorial-chirho/?lang_chirho=${localeChirho}`)}
				onclick={onCloseChirho}>{copyChirho.tour_chirho}</a
			>
			<a
				class="welcome-info-chirho"
				href={resolveChirho(`/about-chirho/?lang_chirho=${localeChirho}#study-aids-chirho`)}
				onclick={onCloseChirho}>{copyChirho.info_chirho}</a
			>
		</div>
		{#if mobileStoreChirho?.url_chirho}<div class="welcome-links-chirho">
				<a
					class="welcome-install-chirho"
					href={mobileStoreChirho.url_chirho}
					rel="external noreferrer"
					onclick={onCloseChirho}>{copyChirho.install_chirho} {mobileStoreChirho.name_chirho}</a
				>
			</div>{/if}
		<p class="welcome-note-chirho">{copyChirho.open_chirho}</p>
	</div>
	<footer class="welcome-footer-chirho">
		<div class="welcome-actions-chirho">
			<button type="button" class="welcome-start-chirho" onclick={() => dialogChirho.close()}
				>{copyChirho.start_chirho}<span aria-hidden="true"> →</span></button
			>
		</div>
	</footer>
</dialog>

<style>
	dialog {
		margin: auto;
		inset: 0;
		width: min(580px, calc(100vw - 24px));
		max-height: calc(100dvh - 24px);
		padding: 0;
		overflow: hidden;
		border: 1px solid #d2c3a6;
		border-radius: 22px;
		background: #fffdf6;
		color: #283c30;
		box-shadow: 0 24px 90px #162c304d;
	}
	dialog[open] {
		display: flex;
		flex-direction: column;
	}
	dialog::backdrop {
		background: #17342b88;
		backdrop-filter: blur(3px);
	}
	.welcome-body-chirho {
		min-height: 0;
		overflow-y: auto;
		overscroll-behavior: contain;
	}
	.welcome-hero-chirho {
		display: block;
		width: 100%;
		height: clamp(140px, 23dvh, 200px);
		object-fit: cover;
		object-position: center 58%;
	}
	.welcome-copy-chirho {
		padding: 20px 28px 18px;
	}
	.welcome-name-chirho {
		margin: 0 0 10px;
		display: flex;
		gap: 10px;
		align-items: center;
		font: 600 11px/1.3 var(--sans-chirho);
		letter-spacing: 0.12em;
		text-transform: uppercase;
		color: #825b38;
	}
	.welcome-name-chirho span {
		font: 22px/1 var(--hebrew-chirho);
		letter-spacing: 0;
	}
	h2 {
		margin: 0 0 12px;
		font: 400 clamp(29px, 6vw, 40px)/1.08 var(--serif-chirho);
		letter-spacing: -0.025em;
	}
	.welcome-intro-chirho {
		margin: 0;
		font: 16px/1.5 var(--sans-chirho);
		color: #425444;
	}
	.welcome-examples-chirho {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(min(100%, 7em), 1fr));
		gap: 14px;
		margin-top: 20px;
	}
	.welcome-example-chirho {
		display: grid;
		justify-items: center;
		gap: 5px;
		padding: 12px 8px;
		border: 1px solid #dedfce;
		border-radius: 12px;
		background: #fcfbf4;
	}
	.welcome-word-chirho {
		display: block;
		border-radius: 6px;
		padding: 3px 9px;
		font: 28px/1.5 var(--serif-chirho);
		color: #293c31;
	}
	.welcome-word-chirho[lang='he'] {
		font-family: var(--hebrew-chirho);
	}
	.welcome-gloss-chirho {
		font: 13px/1.3 var(--sans-chirho);
		color: #3b5140;
	}
	.welcome-example-chirho small {
		font: 11px/1.3 var(--sans-chirho);
		color: #6a7667;
	}
	.welcome-footer-chirho {
		flex: 0 0 auto;
		padding: 0 28px 20px;
		background: #fffdf6;
	}
	.welcome-actions-chirho {
		display: grid;
		gap: 8px;
	}
	.welcome-actions-chirho button {
		display: flex;
		align-items: center;
		justify-content: center;
		box-sizing: border-box;
		min-height: 46px;
		padding: 11px 16px;
		border-radius: 10px;
		font: 600 15px/1.3 var(--sans-chirho);
		text-decoration: none;
		cursor: pointer;
	}
	.welcome-start-chirho {
		border: 1px solid #234532;
		background: #234532;
		color: #fffdf4;
	}
	.welcome-start-chirho span {
		margin-left: 8px;
	}
	.welcome-tour-chirho {
		border: 1px solid #d0c3a6;
		color: #234532;
		background: #f8f3e8;
	}
	.welcome-links-chirho {
		display: flex;
		justify-content: center;
		gap: 8px 14px;
		flex-wrap: wrap;
		margin-top: 14px;
	}
	.welcome-links-chirho a {
		font: 12px/1.4 var(--sans-chirho);
		color: #4a604d;
		text-underline-offset: 3px;
	}
	.welcome-note-chirho {
		margin: 10px 0 0;
		text-align: center;
		font: 12px/1.4 var(--sans-chirho);
		color: #5f6f5b;
	}
	@media (max-width: 360px) {
		.welcome-copy-chirho {
			padding: 16px 20px;
		}
		.welcome-footer-chirho {
			padding: 0 20px 16px;
		}
		.welcome-examples-chirho {
			gap: 10px;
			margin-top: 16px;
		}
		.welcome-word-chirho {
			font-size: 26px;
		}
	}
	@media (max-height: 650px) {
		.welcome-hero-chirho {
			height: 110px;
		}
		.welcome-copy-chirho {
			padding-block: 12px;
		}
		.welcome-name-chirho {
			margin-bottom: 7px;
		}
		h2 {
			font-size: 29px;
			margin-bottom: 8px;
		}
		.welcome-intro-chirho {
			font-size: 14px;
			line-height: 1.45;
		}
		.welcome-examples-chirho {
			margin-top: 12px;
		}
		.welcome-example-chirho {
			padding-block: 6px;
			gap: 3px;
		}
		.welcome-word-chirho {
			line-height: 1.35;
		}
		.welcome-footer-chirho {
			padding-bottom: 12px;
		}
		.welcome-links-chirho {
			margin-top: 10px;
			gap: 6px 12px;
		}
		.welcome-note-chirho {
			margin-top: 7px;
		}
	}

	.welcome-secondary-chirho {
		display: grid;
		grid-template-columns: minmax(0, 1fr) auto;
		align-items: center;
		gap: 12px;
		margin: 0 20px;
	}
	.welcome-secondary-chirho .welcome-tour-chirho {
		display: flex;
		align-items: center;
		justify-content: center;
		min-height: 44px;
		padding: 8px 12px;
		border-radius: 9px;
		text-decoration: none;
		text-align: center;
		font: 600 13px/1.3 var(--sans-chirho);
	}
	.welcome-secondary-chirho .welcome-info-chirho {
		display: flex;
		align-items: center;
		min-height: 44px;
		min-width: 44px;
		justify-content: center;
		color: #4a604d;
		font: 12px/1.4 var(--sans-chirho);
		text-underline-offset: 3px;
	}
	.welcome-note-chirho {
		padding: 0 20px 12px;
	}
	.welcome-start-chirho:focus-visible,
	.welcome-secondary-chirho a:focus-visible,
	.welcome-links-chirho a:focus-visible {
		outline: 3px solid #425d88;
		outline-offset: 3px;
	}
</style>
