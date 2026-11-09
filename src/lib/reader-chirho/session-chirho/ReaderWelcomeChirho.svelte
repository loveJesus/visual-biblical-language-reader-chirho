<!-- For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life. — John 3:16 (KJV) -->
<script lang="ts">
	import { onMount } from 'svelte';
	import { resolve as resolveChirho } from '$app/paths';
	import type { LocaleChirho } from '$lib/i18n-chirho/locale-chirho';
	import { sessionMessagesChirho } from './session-messages-chirho';
	let { localeChirho, onCloseChirho }: { localeChirho: LocaleChirho; onCloseChirho: () => void } =
		$props();
	let dialogChirho: HTMLDialogElement;
	const copyChirho = $derived(sessionMessagesChirho(localeChirho));
	onMount(() => {
		dialogChirho.showModal();
	});
</script>

<dialog
	bind:this={dialogChirho}
	onclose={onCloseChirho}
	aria-labelledby="welcome-heading-chirho"
	lang={localeChirho}
>
	<div class="welcome-body-chirho">
		<p class="welcome-name-chirho">Hinneh <span lang="he" dir="rtl">הִנֵּה</span></p>
		<h2 id="welcome-heading-chirho">{copyChirho.welcome_chirho}</h2>
		<p class="welcome-intro-chirho">{copyChirho.intro_chirho}</p>
		<p>{copyChirho.use_chirho}</p>
		<p class="welcome-note-chirho">{copyChirho.open_chirho}</p>
		<div class="welcome-actions-chirho">
			<button type="button" class="welcome-start-chirho" onclick={() => dialogChirho.close()}
				>{copyChirho.start_chirho}<span aria-hidden="true"> →</span></button
			>
			<a
				class="welcome-tour-chirho"
				href={resolveChirho(`/tutorial-chirho/?lang_chirho=${localeChirho}`)}
				onclick={onCloseChirho}>{copyChirho.tour_chirho}</a
			>
		</div>
		<p class="welcome-note-chirho">{copyChirho.reopen_chirho}</p>
		<a
			class="welcome-info-chirho"
			href={resolveChirho(`/about-chirho/?lang_chirho=${localeChirho}#study-aids-chirho`)}
			onclick={onCloseChirho}>{copyChirho.info_chirho}</a
		>
	</div>
</dialog>

<style>
	dialog {
		margin: auto;
		inset: 0;
		width: min(540px, calc(100vw - 28px));
		max-height: calc(100dvh - 28px);
		padding: 0;
		border: 1px solid #c9c0aa;
		border-radius: 20px;
		background: #fffdf6;
		color: #283c30;
		box-shadow: 0 24px 90px #162c304d;
	}
	dialog::backdrop {
		background: #17342b88;
		backdrop-filter: blur(3px);
	}
	.welcome-body-chirho {
		padding: clamp(22px, 5vw, 36px);
	}
	.welcome-name-chirho {
		margin: 0 0 20px;
		font: 600 12px/1.3 var(--sans-chirho);
		letter-spacing: 0.12em;
		text-transform: uppercase;
		color: #825b38;
	}
	.welcome-name-chirho span {
		display: inline-block;
		margin-left: 10px;
		font: 26px/1 var(--hebrew-chirho);
		letter-spacing: 0;
	}
	h2 {
		margin: 0 0 16px;
		font: 400 clamp(28px, 6vw, 38px)/1.1 var(--serif-chirho);
		letter-spacing: -0.025em;
	}
	p {
		margin: 0 0 16px;
		font-size: 15px;
		line-height: 1.6;
	}
	.welcome-intro-chirho {
		font: 20px/1.45 var(--serif-chirho);
	}
	.welcome-note-chirho {
		font-size: 12px;
		color: #5f6b5d;
	}
	.welcome-actions-chirho {
		display: flex;
		flex-direction: column;
		gap: 10px;
		margin: 22px 0 16px;
	}
	.welcome-actions-chirho button,
	.welcome-actions-chirho a {
		box-sizing: border-box;
		display: block;
		min-height: 46px;
		padding: 12px 18px;
		border-radius: 9px;
		font: 600 15px/1.3 var(--sans-chirho);
		text-align: center;
		cursor: pointer;
		text-decoration: none;
	}
	.welcome-start-chirho span {
		margin-left: 8px;
	}
	.welcome-start-chirho {
		border: 1px solid #234532;
		background: #234532;
		color: #fffdf4;
	}
	.welcome-tour-chirho {
		border: 1px solid #d0c3a6;
		color: #234532;
		background: #f8f3e8;
	}
	.welcome-info-chirho {
		font-size: 12px;
		color: #4a604d;
		text-underline-offset: 3px;
	}
	@media (max-width: 360px) {
		.welcome-body-chirho {
			padding: 20px;
		}
		p {
			margin-bottom: 12px;
			font-size: 14px;
		}
		.welcome-intro-chirho {
			font-size: 18px;
		}
		.welcome-name-chirho {
			margin-bottom: 14px;
		}
		.welcome-actions-chirho {
			margin-top: 18px;
		}
	}
</style>
