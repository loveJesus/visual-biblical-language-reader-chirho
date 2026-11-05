<!-- For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life. — John 3:16 (KJV) -->
<script lang="ts">
	import { tick } from 'svelte';
	import { resolve as resolveChirho } from '$app/paths';
	import { referenceChirho } from '$lib/i18n-chirho/labels-chirho';
	import { localeStateChirho } from '$lib/i18n-chirho/locale-state-chirho.svelte';
	import AidSpecimenChirho from './AidSpecimenChirho.svelte';
	import HomeExperienceChirho from './HomeExperienceChirho.svelte';
	import AppDownloadsChirho from './apps-chirho/AppDownloadsChirho.svelte';
	import { LEARNING_ANCHOR_CHIRHO, learningTChirho } from './learning-chirho/learning-paths-chirho';
	import {
		HINNEH_HEBREW_CHIRHO,
		READING_AIDS_CHIRHO,
		SCRIPTURE_QUOTES_CHIRHO,
		siteTChirho
	} from './site-content-chirho';
	let { onStartChirho }: { onStartChirho: () => void } = $props();
	const prayerChirho = SCRIPTURE_QUOTES_CHIRHO.prayer_chirho;
	async function startChirho() {
		onStartChirho();
		await tick();
		window.location.hash = 'reader-chirho';
		const targetChirho = document.getElementById('reader-chirho');
		targetChirho?.scrollIntoView({ block: 'start' });
		targetChirho?.focus({ preventScroll: true });
	}
</script>

<!-- The offline export strips this section non-greedily: never nest another <section> inside. -->
<section class="home-intro-chirho" aria-labelledby="intro-title-chirho" data-online-intro-chirho>
	<div class="intro-stage-chirho page-shell-chirho">
		<div class="intro-copy-chirho">
			<p class="intro-mark-chirho">
				<span class="intro-hinneh-chirho" lang="he" dir="rtl">{HINNEH_HEBREW_CHIRHO}</span>
				<span class="intro-mark-label-chirho">{siteTChirho('mark_chirho')}</span>
			</p>
			<h1 id="intro-title-chirho">
				<em>{siteTChirho('heading_lead_chirho')}</em>
				{siteTChirho('heading_rest_chirho')}
			</h1>
			<p class="intro-lead-chirho">{siteTChirho('introduction_chirho')}</p>
			<div class="intro-actions-chirho">
				<button type="button" data-intro-start-chirho onclick={startChirho}
					>{siteTChirho('start_chirho')} <span aria-hidden="true">→</span></button
				><a href={resolveChirho(`/about-chirho/?lang_chirho=${localeStateChirho.currentChirho}`)}
					>{siteTChirho('learn_chirho')}</a
				>
			</div>
			<p class="intro-scope-chirho">{siteTChirho('scope_chirho')}</p>
			<AppDownloadsChirho compactChirho />
			<p class="intro-learning-chirho">
				<a
					href={resolveChirho(
						`/about-chirho/?lang_chirho=${localeStateChirho.currentChirho}#${LEARNING_ANCHOR_CHIRHO}`
					)}>{learningTChirho('home_chirho')} <span aria-hidden="true">→</span></a
				>
			</p>
		</div>
		<div class="intro-preview-chirho"><HomeExperienceChirho /></div>
	</div>
	<div class="intro-aids-chirho">
		<div class="page-shell-chirho">
			<figure class="intro-prayer-chirho">
				<blockquote>
					<p class="prayer-original-chirho" lang="he" dir="rtl">{prayerChirho.text_chirho}</p>
					<p class="prayer-translation-chirho">{siteTChirho('prayer_text_chirho')}</p>
				</blockquote>
				<figcaption>
					{referenceChirho(prayerChirho.osis_chirho, localeStateChirho.currentChirho)}
					<span aria-hidden="true">·</span>
					{siteTChirho('prayer_version_chirho')}
				</figcaption>
			</figure>
			<div class="intro-aids-heading-chirho">
				<p>{siteTChirho('aids_eyebrow_chirho')}</p>
				<h2>{siteTChirho('aids_title_chirho')}</h2>
			</div>
			<ul class="intro-aid-list-chirho">
				{#each READING_AIDS_CHIRHO[localeStateChirho.currentChirho] as aidChirho (aidChirho.kind_chirho)}
					<li>
						<AidSpecimenChirho kindChirho={aidChirho.kind_chirho} />
						<h3>{aidChirho.title_chirho}</h3>
						<p>{aidChirho.body_chirho}</p>
					</li>
				{/each}
			</ul>
		</div>
	</div>
</section>

<style>
	.home-intro-chirho {
		--forest-chirho: #1d3a2c;
		--copper-chirho: #a2552f;
		--copper-light-chirho: #e6b78e;
		--parchment-text-chirho: #f8f1e1;
		background:
			radial-gradient(900px 560px at 80% 40%, #ead9b8 0%, #ead9b800 70%),
			linear-gradient(180deg, #f9f3e6 0%, #f6f4ed 100%);
		border-bottom: 1px solid #e2d6bf;
	}
	.intro-stage-chirho {
		display: grid;
		grid-template-columns: minmax(0, 1fr) minmax(0, 570px);
		gap: clamp(36px, 5vw, 80px);
		align-items: center;
		padding-top: clamp(40px, 6vw, 84px);
		padding-bottom: clamp(44px, 6vw, 88px);
	}
	.intro-copy-chirho {
		min-width: 0;
	}
	.intro-mark-chirho {
		display: flex;
		align-items: center;
		flex-wrap: wrap;
		gap: 10px 16px;
		margin: 0 0 24px;
	}
	.intro-hinneh-chirho {
		font: 60px/1.15 var(--hebrew-chirho);
		color: var(--copper-chirho);
	}
	.intro-mark-label-chirho {
		padding-left: 16px;
		border-left: 1px solid #d3bd99;
		font: 600 12px/1.4 var(--sans-chirho);
		letter-spacing: 0.16em;
		text-transform: uppercase;
		color: #7a5638;
	}
	h1 {
		margin: 0;
		font: 400 clamp(42px, 5.4vw, 82px)/1.03 var(--serif-chirho);
		letter-spacing: -0.035em;
		color: var(--forest-chirho);
		text-wrap: balance;
	}
	h1 em {
		color: var(--copper-chirho);
	}
	.intro-lead-chirho {
		max-width: 34em;
		margin: 26px 0 32px;
		font: clamp(18px, 1.55vw, 21px)/1.6 var(--serif-chirho);
		color: #3d5045;
	}
	.intro-actions-chirho {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		gap: 14px 30px;
	}
	.intro-actions-chirho button {
		display: inline-flex;
		align-items: center;
		gap: 16px;
		min-height: 52px;
		padding: 15px 26px;
		border: 1px solid var(--forest-chirho);
		border-radius: 10px;
		background: var(--forest-chirho);
		color: var(--parchment-text-chirho);
		font: 600 16px/1.2 var(--sans-chirho);
		box-shadow: 0 12px 26px #1d3a2c2e;
	}
	.intro-actions-chirho button span {
		color: var(--copper-light-chirho);
	}
	.intro-actions-chirho button:hover {
		background: #285240;
	}
	.intro-actions-chirho a {
		padding: 12px 0;
		font: 500 15px/1.3 var(--sans-chirho);
		color: var(--forest-chirho);
		text-decoration-color: #c99668;
		text-decoration-thickness: 2px;
	}
	.intro-actions-chirho a:hover {
		color: var(--copper-chirho);
	}
	.intro-scope-chirho {
		margin: 26px 0 14px;
		font-size: 13px;
		line-height: 1.6;
		color: #66685a;
	}
	.intro-preview-chirho {
		min-width: 0;
	}
	.intro-learning-chirho {
		margin: 16px 0 0;
		font: 14px/1.65 var(--sans-chirho);
	}
	.intro-learning-chirho a {
		color: #3d5045;
		text-underline-offset: 4px;
	}
	.intro-aids-chirho {
		padding: clamp(52px, 7vw, 92px) 0 clamp(56px, 7vw, 96px);
		background:
			radial-gradient(760px 420px at 50% 0%, #2f5745 0%, #2f574500 72%), var(--forest-chirho);
		color: var(--parchment-text-chirho);
	}
	.intro-prayer-chirho {
		max-width: 820px;
		margin: 0 auto;
		text-align: center;
	}
	.intro-prayer-chirho blockquote {
		margin: 0;
	}
	.prayer-original-chirho {
		margin: 0 0 14px;
		font: clamp(30px, 3.3vw, 46px)/1.55 var(--hebrew-chirho);
		color: #fff8e8;
	}
	.prayer-translation-chirho {
		margin: 0;
		font: italic clamp(19px, 1.9vw, 25px)/1.5 var(--serif-chirho);
		color: #eadfc6;
	}
	.intro-prayer-chirho figcaption {
		margin-top: 16px;
		font: 600 12px/1.4 var(--sans-chirho);
		letter-spacing: 0.14em;
		text-transform: uppercase;
		color: var(--copper-light-chirho);
	}
	.intro-aids-heading-chirho {
		max-width: 820px;
		margin: clamp(44px, 5vw, 64px) auto 30px;
		padding-top: clamp(36px, 4vw, 52px);
		border-top: 1px solid #ffffff26;
		text-align: center;
	}
	.intro-aids-heading-chirho p {
		margin: 0 0 12px;
		font: 600 12px/1.4 var(--sans-chirho);
		letter-spacing: 0.16em;
		text-transform: uppercase;
		color: var(--copper-light-chirho);
	}
	.intro-aids-heading-chirho h2 {
		font: clamp(32px, 3.6vw, 52px)/1.1 var(--serif-chirho);
		letter-spacing: -0.02em;
		color: #fff8e8;
	}
	.intro-aid-list-chirho {
		display: grid;
		grid-template-columns: repeat(4, minmax(0, 1fr));
		gap: 18px;
		margin: 0;
		padding: 0;
		list-style: none;
	}
	.intro-aid-list-chirho li {
		min-width: 0;
		padding: 14px 14px 24px;
		border: 1px solid #ffffff24;
		border-radius: 18px;
		background: #ffffff0d;
	}
	.intro-aid-list-chirho h3 {
		margin: 20px 6px 8px;
		font: 400 27px/1.2 var(--serif-chirho);
		color: #fff8e8;
	}
	.intro-aid-list-chirho li > p {
		margin: 0 6px;
		font-size: 15px;
		line-height: 1.65;
		color: #d9e1d6;
	}
	@media (max-width: 1100px) {
		.intro-aid-list-chirho {
			grid-template-columns: repeat(2, minmax(0, 1fr));
		}
	}
	@media (max-width: 900px) {
		.intro-stage-chirho {
			grid-template-columns: minmax(0, 1fr);
			gap: 36px;
		}
	}
	@media (max-width: 600px) {
		.intro-stage-chirho {
			padding-top: 30px;
			padding-bottom: 40px;
		}
		.intro-hinneh-chirho {
			font-size: 48px;
		}
		.intro-mark-chirho {
			margin-bottom: 18px;
		}
		.intro-actions-chirho button {
			width: 100%;
			justify-content: space-between;
		}
		.intro-aid-list-chirho {
			grid-template-columns: minmax(0, 1fr);
		}
	}
	@media (prefers-reduced-motion: no-preference) {
		.intro-actions-chirho button,
		.intro-actions-chirho a {
			transition:
				background-color 0.2s ease,
				color 0.2s ease;
		}
	}
</style>
