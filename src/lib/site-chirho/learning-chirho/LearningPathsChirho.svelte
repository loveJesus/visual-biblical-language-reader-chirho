<!-- For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life. — John 3:16 (KJV) -->
<script lang="ts">
	import {
		LEARNING_ANCHOR_CHIRHO,
		LEARNING_PATHS_CHIRHO,
		learningTChirho
	} from './learning-paths-chirho';
</script>

<!-- Public-site workflow: visitor-selected outbound links, with no embedded third-party media. -->
<section
	id={LEARNING_ANCHOR_CHIRHO}
	class="learning-paths-chirho"
	aria-labelledby="learning-title-chirho"
>
	<h2 id="learning-title-chirho">{learningTChirho('title_chirho')}</h2>
	<p class="learning-lead-chirho">{learningTChirho('body_chirho')}</p>
	<ul>
		{#each LEARNING_PATHS_CHIRHO as pathChirho (pathChirho.name_chirho)}
			<li>
				<p class="learning-language-chirho">{learningTChirho(pathChirho.language_key_chirho)}</p>
				<h3>{pathChirho.name_chirho}</h3>
				<p class="learning-description-chirho">{learningTChirho(pathChirho.body_key_chirho)}</p>
				<div class="learning-links-chirho">
					<a href={pathChirho.website_chirho} rel="external noreferrer"
						>{learningTChirho('website_chirho')} <span aria-hidden="true">↗</span><span
							class="sr-only-chirho">: {pathChirho.name_chirho}</span
						></a
					>
					<a href={pathChirho.youtube_chirho} rel="external noreferrer"
						>{learningTChirho('youtube_chirho')} <span aria-hidden="true">↗</span><span
							class="sr-only-chirho">: {pathChirho.name_chirho}</span
						></a
					>
				</div>
			</li>
		{/each}
	</ul>
</section>

<style>
	.learning-paths-chirho {
		margin-top: 54px;
		scroll-margin-top: 24px;
	}
	h2 {
		margin: 0;
		color: #1d3a2c;
		font: 400 clamp(28px, 3vw, 38px)/1.15 var(--serif-chirho);
	}
	.learning-lead-chirho {
		max-width: 760px;
		margin: 16px 0 26px;
		color: #526055;
		font: 16px/1.7 var(--sans-chirho);
	}
	ul {
		display: grid;
		grid-template-columns: repeat(3, minmax(0, 1fr));
		gap: 18px;
		list-style: none;
		padding: 0;
		margin: 0;
	}
	li {
		display: flex;
		flex-direction: column;
		padding: 24px;
		border: 1px solid #d8d9ca;
		border-top: 3px solid #a2552f;
		border-radius: 12px;
		background: #fffcf5;
	}
	.learning-language-chirho {
		margin: 0 0 12px;
		color: #775233;
		font: 600 12px/1.5 var(--sans-chirho);
		letter-spacing: 0.06em;
		text-transform: uppercase;
	}
	h3 {
		margin: 0;
		font: 400 26px/1.2 var(--serif-chirho);
		color: #1d3a2c;
	}
	.learning-description-chirho {
		flex: 1;
		margin: 14px 0;
		color: #526055;
		font: 15px/1.65 var(--sans-chirho);
	}
	.learning-links-chirho {
		display: flex;
		flex-wrap: wrap;
		gap: 0 18px;
	}
	a {
		display: inline-flex;
		align-items: center;
		gap: 6px;
		min-height: 44px;
		color: #28523d;
		font: 600 14px/1.4 var(--sans-chirho);
		text-underline-offset: 4px;
	}
	a:hover {
		color: #8b4527;
	}
	@media (max-width: 800px) {
		ul {
			grid-template-columns: 1fr;
		}
		li {
			padding: 22px;
		}
	}
</style>
