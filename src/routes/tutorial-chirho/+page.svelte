<!-- For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life. — John 3:16 (KJV) -->
<script lang="ts">
	import { onMount } from 'svelte';
	import { resolve as resolveChirho } from '$app/paths';
	import { initLocaleChirho, localeStateChirho } from '$lib/i18n-chirho/locale-state-chirho.svelte';
	import { sessionMessagesChirho } from '$lib/reader-chirho/session-chirho/session-messages-chirho';
	import {
		tutorialEntriesChirho,
		type TutorialEntryChirho
	} from '$lib/site-chirho/tutorial-chirho';
	let entriesChirho = $state<TutorialEntryChirho[]>([]);
	let loadingChirho = $state(true);
	const copyChirho = $derived(sessionMessagesChirho(localeStateChirho.currentChirho));
	const entryChirho = $derived(
		entriesChirho.find(
			(itemChirho) => itemChirho.language_chirho === localeStateChirho.currentChirho
		)
	);
	// A detached or hidden tour must never leave a soundtrack playing behind the reader.
	function releaseVideoChirho(videoChirho: HTMLVideoElement) {
		const pauseHiddenChirho = () => {
			if (document.visibilityState !== 'visible') videoChirho.pause();
		};
		document.addEventListener('visibilitychange', pauseHiddenChirho);
		return {
			destroy() {
				document.removeEventListener('visibilitychange', pauseHiddenChirho);
				videoChirho.pause();
				videoChirho.removeAttribute('src');
				videoChirho.load();
			}
		};
	}
	onMount(() => {
		initLocaleChirho(new URL(window.location.href));
		const controllerChirho = new AbortController();
		void fetch(resolveChirho('/tutorial-chirho/quick-tour-chirho.json'), {
			signal: controllerChirho.signal
		})
			.then(async (responseChirho) => {
				if (!responseChirho.ok) throw new Error('Tour unavailable');
				const textChirho = await responseChirho.text();
				if (textChirho.length > 65_536) throw new Error('Tour unavailable');
				entriesChirho = tutorialEntriesChirho(JSON.parse(textChirho));
			})
			.catch(() => {
				entriesChirho = [];
			})
			.finally(() => {
				loadingChirho = false;
			});
		return () => controllerChirho.abort();
	});
</script>

<svelte:head>
	<title>{copyChirho.tour_title_chirho} · Hinneh</title>
	<meta name="description" content={copyChirho.tour_intro_chirho} />
	<link rel="canonical" href="https://hinneh.us/tutorial-chirho/" />
</svelte:head>

<section class="tour-page-chirho page-shell-chirho" lang={localeStateChirho.currentChirho}>
	<p class="tour-eyebrow-chirho">Hinneh</p>
	<h1>{copyChirho.tour_title_chirho}</h1>
	<p class="tour-intro-chirho">{copyChirho.tour_intro_chirho}</p>
	<a
		class="tour-start-chirho"
		href={resolveChirho(`/?lang_chirho=${localeStateChirho.currentChirho}`)}
		>{copyChirho.start_chirho} <span aria-hidden="true">→</span></a
	>
	{#if entryChirho}
		{#key entryChirho.language_chirho}
			<video
				use:releaseVideoChirho
				controls
				playsinline
				preload="none"
				poster={entryChirho.poster_chirho.asset_path_chirho}
				src={entryChirho.video_chirho.asset_path_chirho}
				width={entryChirho.video_chirho.width_chirho}
				height={entryChirho.video_chirho.height_chirho}
				aria-label={copyChirho.video_chirho}
			>
				<track
					kind="captions"
					src={entryChirho.captions_chirho.asset_path_chirho}
					srclang={entryChirho.language_chirho}
					label={copyChirho.captions_chirho}
					default
				/>
			</video>
		{/key}
		<details class="tour-transcript-chirho">
			<summary>{copyChirho.transcript_chirho}</summary>
			<p>{entryChirho.transcript_chirho}</p>
			<p class="tour-license-chirho">
				Hinneh · L.J. (Love Jesus).
				<a href="https://creativecommons.org/licenses/by-sa/4.0/" rel="external noreferrer"
					>CC BY-SA 4.0</a
				>
				<span aria-hidden="true"> · </span><a
					href={resolveChirho(`/sources-chirho/?lang_chirho=${localeStateChirho.currentChirho}`)}
					>{copyChirho.info_chirho}</a
				>
			</p>
		</details>
	{:else}<p role="status">
			{loadingChirho ? copyChirho.loading_chirho : copyChirho.unavailable_chirho}
		</p>{/if}
</section>

<style>
	.tour-page-chirho {
		max-width: 880px;
		padding-top: clamp(34px, 6vw, 70px);
		padding-bottom: 50px;
	}
	.tour-eyebrow-chirho {
		font-size: 12px;
		letter-spacing: 0.13em;
		text-transform: uppercase;
		color: #8a5938;
		margin: 0 0 16px;
	}
	h1 {
		margin: 0 0 18px;
		color: #254532;
		font: 400 clamp(32px, 6vw, 52px)/1.1 var(--serif-chirho);
		letter-spacing: -0.025em;
	}
	.tour-intro-chirho {
		max-width: 38em;
		font: 19px/1.6 var(--serif-chirho);
		color: #4b604f;
	}
	.tour-start-chirho {
		display: inline-flex;
		gap: 24px;
		align-items: center;
		padding: 12px 18px;
		border-radius: 9px;
		background: #254532;
		color: #fffdf4;
		text-decoration: none;
		font-size: 14px;
		font-weight: 600;
		margin: 4px 0 28px;
	}
	video {
		display: block;
		width: auto;
		max-width: 100%;
		height: auto;
		max-height: 75dvh;
		margin: 0 auto;
		border-radius: 12px;
		background: #213729;
		box-shadow: 0 10px 45px #1b342422;
	}
	.tour-transcript-chirho {
		margin-top: 26px;
		padding: 14px 18px;
		border: 1px solid #ded4bd;
		border-radius: 10px;
		background: #fffdf7;
	}
	summary {
		cursor: pointer;
		font-weight: 600;
		font-size: 14px;
	}
	.tour-transcript-chirho p {
		max-width: 46em;
		font-size: 15px;
		line-height: 1.8;
	}
	.tour-license-chirho {
		color: #647160;
		font-size: 12px !important;
	}
</style>
