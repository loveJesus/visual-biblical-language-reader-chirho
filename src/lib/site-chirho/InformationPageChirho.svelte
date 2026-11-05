<!-- For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life. — John 3:16 (KJV) -->
<script lang="ts">
	import { resolve as resolveChirho } from '$app/paths';
	import { referenceChirho } from '$lib/i18n-chirho/labels-chirho';
	import { localeStateChirho } from '$lib/i18n-chirho/locale-state-chirho.svelte';
	import AidSpecimenChirho from './AidSpecimenChirho.svelte';
	import HomeExperienceChirho from './HomeExperienceChirho.svelte';
	import PageMetaChirho from './PageMetaChirho.svelte';
	import ContactFormChirho from './contact-chirho/ContactFormChirho.svelte';
	import previewChirho from '../../../data-chirho/reader-chirho/home-preview-chirho.json';
	import {
		ABOUT_GUIDE_CHIRHO,
		HINNEH_HEBREW_CHIRHO,
		INFORMATION_PAGES_CHIRHO,
		SCRIPTURE_QUOTES_CHIRHO,
		isAidKindChirho,
		siteTChirho,
		type InformationIdChirho,
		type InformationPageChirho as PageCopyChirho
	} from './site-content-chirho';
	let { idChirho }: { idChirho: InformationIdChirho } = $props();
	const copyChirho: PageCopyChirho = $derived(
		INFORMATION_PAGES_CHIRHO[idChirho][localeStateChirho.currentChirho]
	);
	// About adds the reading walkthrough; every information page shares the same shell.
	const guideChirho = $derived(
		idChirho === 'about-chirho' ? ABOUT_GUIDE_CHIRHO[localeStateChirho.currentChirho] : null
	);
	// Contact replaces the published address with a challenged form (no numbered sections).
	const contactPageChirho = $derived(idChirho === 'contact-chirho');
	// About's cover reuses the exact published John 1:1 scene and keeps its review state visible.
	const coverChirho =
		previewChirho.excerpts_chirho.find((excerptChirho) => excerptChirho.id_chirho === 'John.1.1') ??
		previewChirho.excerpts_chirho[0];
	const nameQuotesChirho = [
		SCRIPTURE_QUOTES_CHIRHO.isaiah_chirho,
		SCRIPTURE_QUOTES_CHIRHO.matthew_chirho
	];
	function sectionIdChirho(indexChirho: number): string {
		return `section-${indexChirho + 1}-chirho`;
	}
</script>

<PageMetaChirho
	titleChirho={copyChirho.title_chirho}
	descriptionChirho={copyChirho.description_chirho}
	pathChirho={`/${idChirho}/`}
/>
<article class="information-page-chirho" lang={localeStateChirho.currentChirho}>
	<header class="info-hero-chirho">
		<div class="page-shell-chirho" class:info-hero-cover-chirho={guideChirho}>
			<div>
				<p class="info-eyebrow-chirho">{copyChirho.eyebrow_chirho ?? 'Hinneh'}</p>
				<h1>{copyChirho.heading_chirho ?? copyChirho.title_chirho}</h1>
				<p class="info-lead-chirho">{copyChirho.lead_chirho}</p>
				<p class="info-date-chirho">{siteTChirho('updated_chirho')}</p>
			</div>
			{#if guideChirho}
				<figure class="info-cover-chirho">
					<img
						src={coverChirho.scene_chirho.asset_path_chirho}
						alt={coverChirho.scene_chirho.alt_chirho}
						lang="en"
						width={coverChirho.scene_chirho.width_chirho}
						height={coverChirho.scene_chirho.height_chirho}
						fetchpriority="high"
					/>
					<figcaption>
						<span class="info-cover-reference-chirho"
							>{referenceChirho(coverChirho.id_chirho, localeStateChirho.currentChirho)}</span
						>
						<span
							>{siteTChirho(
								coverChirho.scene_chirho.art_review_chirho === 'pending'
									? 'art_pending_chirho'
									: 'art_label_chirho'
							)}</span
						>
						<a
							href={resolveChirho(
								`/?lang_chirho=${localeStateChirho.currentChirho}#${coverChirho.id_chirho}` as `/${string}`
							)}>{siteTChirho('art_open_chirho')} <span aria-hidden="true">→</span></a
						>
					</figcaption>
				</figure>
			{/if}
		</div>
	</header>

	{#if guideChirho}
		<div class="page-shell-chirho about-name-chirho">
			<p class="about-name-word-chirho" lang="he" dir="rtl" aria-hidden="true">
				{HINNEH_HEBREW_CHIRHO}
			</p>
			<div>
				<h2>{guideChirho.name_title_chirho}</h2>
				<p>{guideChirho.name_body_chirho}</p>
				<div class="about-quotes-chirho">
					{#each nameQuotesChirho as quoteChirho (quoteChirho.osis_chirho)}<figure>
							<blockquote
								lang={quoteChirho.lang_chirho}
								dir={quoteChirho.lang_chirho === 'he' ? 'rtl' : 'ltr'}
							>
								{quoteChirho.text_chirho}
							</blockquote>
							<figcaption>
								{referenceChirho(quoteChirho.osis_chirho, localeStateChirho.currentChirho)}
							</figcaption>
						</figure>{/each}
				</div>
			</div>
		</div>

		<section
			class="about-guide-chirho"
			id="how-to-read-chirho"
			aria-labelledby="guide-title-chirho"
		>
			<div class="page-shell-chirho">
				<div class="about-guide-heading-chirho">
					<h2 id="guide-title-chirho">{guideChirho.steps_title_chirho}</h2>
					<p>{guideChirho.steps_lead_chirho}</p>
				</div>
				<div class="about-guide-grid-chirho">
					<ol class="about-steps-chirho">
						{#each guideChirho.steps_chirho as stepChirho, indexChirho (stepChirho.kind_chirho)}
							<li>
								<span class="step-number-chirho" aria-hidden="true">{indexChirho + 1}</span>
								<div class="step-body-chirho">
									<h3>{stepChirho.title_chirho}</h3>
									{#if isAidKindChirho(stepChirho.kind_chirho)}<div class="step-specimen-chirho">
											<AidSpecimenChirho kindChirho={stepChirho.kind_chirho} />
										</div>{/if}
									<p>{stepChirho.body_chirho}</p>
								</div>
							</li>
						{/each}
					</ol>
					<div class="about-preview-chirho"><HomeExperienceChirho compactChirho /></div>
				</div>
			</div>
		</section>

		<section class="about-facts-chirho" aria-labelledby="facts-title-chirho">
			<div class="page-shell-chirho">
				<h2 id="facts-title-chirho">{guideChirho.facts_title_chirho}</h2>
				<ul>
					{#each guideChirho.facts_chirho as factChirho (factChirho.title_chirho)}<li>
							<h3>{factChirho.title_chirho}</h3>
							<p>{factChirho.body_chirho}</p>
						</li>{/each}
				</ul>
			</div>
		</section>
	{/if}

	<div
		class="page-shell-chirho info-body-chirho"
		class:info-body-guided-chirho={guideChirho || contactPageChirho}
	>
		{#if !guideChirho && !contactPageChirho}
			<nav class="info-toc-chirho" aria-labelledby="toc-title-chirho">
				<p id="toc-title-chirho">{siteTChirho('toc_chirho')}</p>
				<ol>
					{#each copyChirho.sections_chirho as sectionChirho, indexChirho (sectionChirho.title_chirho)}<li
						>
							<a href="#{sectionIdChirho(indexChirho)}">{sectionChirho.title_chirho}</a>
						</li>{/each}
				</ol>
			</nav>
		{/if}
		<div class="info-sections-chirho">
			{#if contactPageChirho}<ContactFormChirho />{/if}
			{#each copyChirho.sections_chirho as sectionChirho, indexChirho (sectionChirho.title_chirho)}<section
					id={sectionIdChirho(indexChirho)}
				>
					<h2>
						{#if !guideChirho}<span class="info-number-chirho" aria-hidden="true"
								>{String(indexChirho + 1).padStart(2, '0')}</span
							>{/if}{sectionChirho.title_chirho}
					</h2>
					{#each sectionChirho.paragraphs_chirho as paragraphChirho (paragraphChirho)}<p
							lang={paragraphChirho.startsWith('Original work of') ? 'en' : undefined}
						>
							{paragraphChirho}
						</p>{/each}{#if sectionChirho.links_chirho}<ul class="info-links-chirho">
							{#each sectionChirho.links_chirho as linkChirho (linkChirho.href_chirho)}<li>
									<a href={linkChirho.href_chirho} rel="external noreferrer"
										>{linkChirho.label_chirho} <span aria-hidden="true">↗</span></a
									>
								</li>{/each}
						</ul>{/if}
				</section>{/each}
			{#if guideChirho}<a
					class="info-next-chirho"
					href={resolveChirho(`/sources-chirho/?lang_chirho=${localeStateChirho.currentChirho}`)}
					>{guideChirho.sources_link_chirho} <span aria-hidden="true">→</span></a
				>{/if}
			{#if !contactPageChirho}<aside class="info-contact-chirho">
					<p>{siteTChirho('contact_note_chirho')}</p>
					<a href={resolveChirho(`/contact-chirho/?lang_chirho=${localeStateChirho.currentChirho}`)}
						>{siteTChirho('contact_link_chirho')} <span aria-hidden="true">→</span></a
					>
				</aside>{/if}
			<a
				class="return-reader-chirho"
				href={resolveChirho(`/?lang_chirho=${localeStateChirho.currentChirho}#reader-chirho`)}
				>{siteTChirho('back_chirho')} <span aria-hidden="true">→</span></a
			>
		</div>
	</div>
</article>

<style>
	.information-page-chirho {
		--forest-chirho: #1d3a2c;
		--copper-chirho: #a2552f;
		--copper-light-chirho: #e6b78e;
		--parchment-text-chirho: #f8f1e1;
		--body-chirho: #33453a;
	}
	.info-hero-chirho {
		padding: clamp(44px, 6vw, 84px) 0 clamp(36px, 5vw, 60px);
		background:
			radial-gradient(800px 420px at 85% 0%, #ead9b8 0%, #ead9b800 70%),
			linear-gradient(180deg, #f9f3e6 0%, #f6f4ed 100%);
		border-bottom: 1px solid #e2d6bf;
	}
	.info-hero-cover-chirho {
		display: grid;
		grid-template-columns: minmax(0, 1fr) minmax(0, 540px);
		gap: clamp(32px, 5vw, 72px);
		align-items: center;
	}
	.info-cover-chirho {
		margin: 0;
		overflow: hidden;
		border-radius: 20px;
		background: var(--forest-chirho);
		box-shadow:
			0 24px 60px #1d3a2c33,
			0 3px 10px #1d3a2c12;
	}
	.info-cover-chirho img {
		display: block;
		width: 100%;
		height: auto;
		aspect-ratio: 4 / 3;
		object-fit: cover;
	}
	.info-cover-chirho figcaption {
		display: flex;
		flex-wrap: wrap;
		align-items: baseline;
		gap: 4px 14px;
		padding: 13px 18px 15px;
		font-size: 12px;
		line-height: 1.5;
		color: #d9e1d6;
	}
	.info-cover-reference-chirho {
		font: 18px/1.3 var(--serif-chirho);
		color: #fff8e8;
	}
	.info-cover-chirho a {
		margin-left: auto;
		color: var(--copper-light-chirho);
		text-decoration-thickness: 1px;
	}
	.info-eyebrow-chirho {
		margin: 0 0 16px;
		font: 600 12px/1.4 var(--sans-chirho);
		letter-spacing: 0.16em;
		text-transform: uppercase;
		color: #8a5634;
	}
	h1 {
		max-width: 16em;
		margin: 0;
		font: 400 clamp(38px, 5vw, 70px)/1.05 var(--serif-chirho);
		letter-spacing: -0.03em;
		color: var(--forest-chirho);
		text-wrap: balance;
	}
	.info-lead-chirho {
		max-width: 36em;
		margin: 22px 0 18px;
		font: clamp(19px, 1.7vw, 23px)/1.55 var(--serif-chirho);
		color: #43554a;
	}
	.info-date-chirho {
		margin: 0;
		font-size: 12px;
		color: var(--quiet-chirho);
	}
	.about-name-chirho {
		display: grid;
		grid-template-columns: auto minmax(0, 820px);
		justify-content: start;
		gap: 20px clamp(28px, 5vw, 72px);
		align-items: center;
		padding-top: clamp(44px, 6vw, 76px);
		padding-bottom: clamp(44px, 6vw, 76px);
	}
	.about-name-word-chirho {
		margin: 0;
		font: clamp(84px, 11vw, 148px)/1.1 var(--hebrew-chirho);
		color: var(--copper-chirho);
	}
	.about-name-chirho h2,
	.about-guide-heading-chirho h2,
	.about-facts-chirho h2 {
		font: 400 clamp(30px, 3.4vw, 46px)/1.12 var(--serif-chirho);
		letter-spacing: -0.02em;
		color: var(--forest-chirho);
	}
	.about-name-chirho > div > p {
		max-width: 38em;
		margin: 14px 0 22px;
		font-size: 17px;
		line-height: 1.8;
		color: var(--body-chirho);
	}
	.about-quotes-chirho {
		display: flex;
		flex-wrap: wrap;
		gap: 14px;
	}
	.about-quotes-chirho figure {
		margin: 0;
		padding: 14px 20px 12px;
		border: 1px solid #e3d7c0;
		border-radius: 14px;
		background: #fffdf8;
	}
	.about-quotes-chirho blockquote {
		margin: 0;
		font: 30px/1.5 var(--hebrew-chirho);
		color: var(--forest-chirho);
	}
	.about-quotes-chirho blockquote:lang(grc) {
		font: 25px/1.75 var(--serif-chirho);
	}
	.about-quotes-chirho figcaption {
		font: 600 11px/1.4 var(--sans-chirho);
		letter-spacing: 0.12em;
		text-transform: uppercase;
		color: #8a5634;
	}
	.about-guide-chirho {
		padding: clamp(48px, 6vw, 88px) 0;
		background: #fbf8f1;
		border-top: 1px solid #e8dfcd;
		border-bottom: 1px solid #e8dfcd;
	}
	.about-guide-heading-chirho {
		max-width: 760px;
		margin-bottom: 36px;
	}
	.about-guide-heading-chirho p {
		margin: 14px 0 0;
		font: 19px/1.6 var(--serif-chirho);
		color: #4a5a4f;
	}
	.about-guide-grid-chirho {
		display: grid;
		grid-template-columns: minmax(0, 1fr) minmax(0, 590px);
		gap: clamp(32px, 5vw, 72px);
		align-items: start;
	}
	.about-steps-chirho {
		margin: 0;
		padding: 0;
		list-style: none;
		counter-reset: none;
	}
	.about-steps-chirho li {
		display: grid;
		grid-template-columns: 44px minmax(0, 1fr);
		gap: 18px;
		padding: 26px 0;
		border-top: 1px solid #e5dccb;
	}
	.about-steps-chirho li:first-child {
		border-top: 0;
		padding-top: 4px;
	}
	.step-number-chirho {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		width: 44px;
		height: 44px;
		border-radius: 50%;
		background: var(--forest-chirho);
		color: var(--copper-light-chirho);
		font: 20px/1 var(--serif-chirho);
	}
	.step-body-chirho {
		display: flex;
		flex-direction: column;
		gap: 14px;
		min-width: 0;
	}
	.step-body-chirho h3 {
		margin: 8px 0 0;
		font: 400 26px/1.2 var(--serif-chirho);
		color: var(--forest-chirho);
	}
	.step-specimen-chirho {
		max-width: 460px;
	}
	.step-body-chirho p {
		margin: 0;
		font-size: 16px;
		line-height: 1.8;
		color: var(--body-chirho);
	}
	.about-preview-chirho {
		position: sticky;
		top: 24px;
		min-width: 0;
	}
	.about-facts-chirho {
		padding: clamp(48px, 6vw, 84px) 0;
		background:
			radial-gradient(760px 380px at 15% 0%, #2f5745 0%, #2f574500 72%), var(--forest-chirho);
	}
	.about-facts-chirho h2 {
		color: #fff8e8;
	}
	.about-facts-chirho ul {
		display: grid;
		grid-template-columns: repeat(4, minmax(0, 1fr));
		gap: 18px;
		margin: 28px 0 0;
		padding: 0;
		list-style: none;
	}
	.about-facts-chirho li {
		min-width: 0;
		padding: 22px 22px 24px;
		border: 1px solid #ffffff24;
		border-top: 3px solid var(--copper-light-chirho);
		border-radius: 14px;
		background: #ffffff0d;
	}
	.about-facts-chirho h3 {
		margin: 0 0 10px;
		font: 400 22px/1.25 var(--serif-chirho);
		color: #fff8e8;
	}
	.about-facts-chirho p {
		margin: 0;
		font-size: 15px;
		line-height: 1.7;
		color: #d9e1d6;
	}
	.info-body-chirho {
		display: grid;
		grid-template-columns: 220px minmax(0, 720px);
		gap: clamp(32px, 5vw, 80px);
		padding-top: clamp(40px, 5vw, 64px);
	}
	.info-body-guided-chirho {
		grid-template-columns: minmax(0, 760px);
	}
	.info-toc-chirho {
		position: sticky;
		top: 24px;
		align-self: start;
	}
	.info-toc-chirho p {
		margin: 0 0 12px;
		font: 600 11px/1.4 var(--sans-chirho);
		letter-spacing: 0.14em;
		text-transform: uppercase;
		color: #8a5634;
	}
	.info-toc-chirho ol {
		margin: 0;
		padding: 0;
		list-style: none;
		border-left: 2px solid #e2d6bf;
	}
	.info-toc-chirho a {
		display: block;
		padding: 8px 0 8px 16px;
		margin-left: -2px;
		border-left: 2px solid transparent;
		font-size: 14px;
		line-height: 1.4;
		text-decoration: none;
		color: #43554a;
	}
	.info-toc-chirho a:hover {
		border-left-color: var(--copper-chirho);
		color: var(--forest-chirho);
	}
	.info-sections-chirho {
		min-width: 0;
	}
	.info-sections-chirho section {
		margin: 0 0 44px;
		scroll-margin-top: 24px;
	}
	.info-sections-chirho h2 {
		display: flex;
		align-items: baseline;
		gap: 14px;
		margin-bottom: 16px;
		font: 400 clamp(26px, 2.6vw, 32px)/1.2 var(--serif-chirho);
		color: var(--forest-chirho);
	}
	.info-number-chirho {
		font: 600 13px/1 var(--sans-chirho);
		letter-spacing: 0.08em;
		color: var(--copper-chirho);
	}
	.info-sections-chirho section p {
		margin: 0 0 16px;
		font-size: 17px;
		line-height: 1.8;
		color: var(--body-chirho);
		overflow-wrap: anywhere;
	}
	.info-links-chirho {
		display: flex;
		flex-wrap: wrap;
		gap: 10px;
		margin: 18px 0 0;
		padding: 0;
		list-style: none;
	}
	.info-links-chirho a {
		display: inline-flex;
		align-items: center;
		gap: 8px;
		min-height: 40px;
		padding: 8px 14px;
		border: 1px solid #d9ccb3;
		border-radius: 999px;
		background: #fffdf8;
		font-size: 14px;
		text-decoration: none;
		color: var(--forest-chirho);
		overflow-wrap: anywhere;
	}
	.info-links-chirho a:hover {
		border-color: var(--copper-chirho);
	}
	.info-links-chirho span,
	.info-next-chirho span,
	.return-reader-chirho span {
		color: var(--copper-chirho);
	}
	.info-next-chirho {
		display: inline-block;
		margin: 0 0 8px;
		font: 500 16px/1.4 var(--sans-chirho);
		color: var(--forest-chirho);
		text-decoration-color: #c99668;
		text-decoration-thickness: 2px;
	}
	.info-contact-chirho {
		margin-top: 40px;
		padding: 24px 28px;
		border-radius: 16px;
		background: var(--forest-chirho);
		overflow-wrap: anywhere;
	}
	.info-contact-chirho p {
		margin: 0 0 8px;
		font-size: 13px;
		color: #d9e1d6;
	}
	.info-contact-chirho a {
		font: 19px/1.4 var(--serif-chirho);
		color: #fff8e8;
		text-decoration-color: var(--copper-light-chirho);
	}
	.return-reader-chirho {
		display: inline-flex;
		align-items: center;
		gap: 12px;
		margin-top: 28px;
		padding: 13px 20px;
		border: 1px solid #cdbf9f;
		border-radius: 10px;
		font: 600 15px/1.2 var(--sans-chirho);
		text-decoration: none;
		color: var(--forest-chirho);
	}
	.return-reader-chirho:hover {
		border-color: var(--copper-chirho);
	}
	@media (max-width: 1100px) {
		.about-facts-chirho ul {
			grid-template-columns: repeat(2, minmax(0, 1fr));
		}
	}
	@media (max-width: 960px) {
		.info-hero-cover-chirho {
			grid-template-columns: minmax(0, 1fr);
			gap: 30px;
		}
		.info-cover-chirho {
			max-width: 620px;
		}
		.about-guide-grid-chirho {
			grid-template-columns: minmax(0, 1fr);
		}
		.about-preview-chirho {
			position: static;
			grid-row: 1;
		}
		.info-body-chirho {
			grid-template-columns: minmax(0, 1fr);
			gap: 28px;
		}
		.info-toc-chirho {
			position: static;
		}
		.info-toc-chirho ol {
			display: flex;
			flex-wrap: wrap;
			gap: 8px;
			border-left: 0;
		}
		.info-toc-chirho a {
			margin: 0;
			padding: 8px 12px;
			border: 1px solid #e2d6bf;
			border-radius: 999px;
			background: #fffdf8;
			font-size: 13px;
		}
	}
	@media (max-width: 600px) {
		.about-name-chirho {
			grid-template-columns: minmax(0, 1fr);
		}
		.about-name-word-chirho {
			text-align: left;
		}
		.info-cover-chirho a {
			margin-left: 0;
		}
		.about-quotes-chirho figure {
			flex: 1 1 100%;
		}
		.about-steps-chirho li {
			grid-template-columns: minmax(0, 1fr);
			gap: 10px;
		}
		.about-facts-chirho ul {
			grid-template-columns: minmax(0, 1fr);
		}
		.info-sections-chirho section p {
			font-size: 16px;
		}
	}
	@media (prefers-reduced-motion: no-preference) {
		.info-toc-chirho a,
		.info-links-chirho a,
		.return-reader-chirho {
			transition:
				border-color 0.2s ease,
				color 0.2s ease;
		}
	}
</style>
