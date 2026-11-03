<!-- For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life. — John 3:16 (KJV) -->
<script lang="ts">
	import SpeechButtonChirho from './SpeechButtonChirho.svelte';
	import { spokenVerseChirho } from '$lib/domain-chirho/pronunciation-chirho';
	import type { LessonChirho } from '$lib/domain-chirho/lesson-chirho';
	import type { GreekLessonChirho } from '$lib/domain-chirho/greek-chirho';
	import type { Snippet } from 'svelte';
	import { onMount, untrack } from 'svelte';
	import { AUDIO_MESSAGES_CHIRHO, audioTChirho } from './audio-messages-chirho';
	import { localeStateChirho } from '$lib/i18n-chirho/locale-state-chirho.svelte';
	import { recordingsForLessonChirho, type RecordingChirho } from './recordings-chirho';
	let {
		lessonChirho,
		verseNavigationChirho
	}: {
		lessonChirho: LessonChirho | GreekLessonChirho;
		verseNavigationChirho?: Snippet<[Snippet]>;
	} = $props();
	let recordingsChirho = $state<RecordingChirho[]>([]);
	let renditionChirho = $state('modern_aspirates');
	let explicitRenditionChirho = $state(false);
	let speedChirho = $state(
		untrack(() => (lessonChirho.language_chirho === 'grc' ? '0.88' : '0.85'))
	);
	onMount(() => {
		try {
			const storedChirho = localStorage.getItem('hinneh-greek-rendition-chirho');
			if (
				storedChirho === 'erasmian' ||
				storedChirho === 'modern_aspirates' ||
				storedChirho === 'modern'
			) {
				renditionChirho = storedChirho;
				explicitRenditionChirho = true;
			}
		} catch {
			/* Optional preference storage. */
		}
	});
	function persistRenditionChirho() {
		explicitRenditionChirho = true;
		try {
			localStorage.setItem('hinneh-greek-rendition-chirho', renditionChirho);
		} catch {
			/* Playback still works without storage. */
		}
	}
	$effect(() => {
		const currentLessonChirho = lessonChirho;
		let currentChirho = true;
		recordingsChirho = [];
		const refreshChirho = () =>
			void recordingsForLessonChirho(currentLessonChirho).then(
				(clipsChirho) => {
					if (currentChirho) {
						recordingsChirho = clipsChirho;
						if (
							currentLessonChirho.language_chirho === 'grc' &&
							!untrack(() => explicitRenditionChirho)
						)
							renditionChirho = clipsChirho.some(
								(clipChirho) =>
									clipChirho.token_id_chirho === null &&
									clipChirho.pronunciation_chirho === 'modern_greek_aspirates'
							)
								? 'modern_aspirates'
								: 'modern';
					}
				},
				() => {
					/* Optional recordings never remove the source or device fallback. */
				}
			);
		refreshChirho();
		const timerChirho = window.setInterval(refreshChirho, 60000);
		return () => {
			currentChirho = false;
			window.clearInterval(timerChirho);
		};
	});
</script>

{#if lessonChirho.tokens_chirho.some((tokenChirho) => 'source_language_chirho' in tokenChirho && tokenChirho.source_language_chirho === 'arc')}
	<p class="audio-note-chirho">
		{localeStateChirho.currentChirho === 'es'
			? 'Se está preparando la pronunciación aramea.'
			: 'Aramaic pronunciation is being prepared.'}
	</p>
{/if}
{#snippet playbackChirho()}
	<SpeechButtonChirho
		textChirho={spokenVerseChirho(lessonChirho)}
		languageChirho={lessonChirho.language_chirho}
		unavailableChirho={lessonChirho.tokens_chirho.some(
			(tokenChirho) =>
				'source_language_chirho' in tokenChirho && tokenChirho.source_language_chirho === 'arc'
		)}
	/>
{/snippet}

<div
	class="audio-controls-chirho"
	data-audio-controls-chirho
	data-speech-recordings-chirho={JSON.stringify(recordingsChirho)}
	data-speech-words-chirho={JSON.stringify(
		lessonChirho.tokens_chirho.map((tokenChirho, indexChirho) => ({
			token_id_chirho: tokenChirho.id_chirho,
			pause_after_chirho: lessonChirho.canonical_text_chirho
				.slice(tokenChirho.end_chirho, lessonChirho.tokens_chirho[indexChirho + 1]?.start_chirho)
				.includes('־')
				? 20
				: /[׃.!?;\u037e]/u.test(
							lessonChirho.canonical_text_chirho.slice(
								tokenChirho.end_chirho,
								lessonChirho.tokens_chirho[indexChirho + 1]?.start_chirho
							)
					  )
					? 350
					: tokenChirho.text_chirho.includes('\u0591')
						? 200
						: 60
		}))
	)}
	data-annotation-chirho
	lang={localeStateChirho.currentChirho}
	data-speech-messages-chirho={JSON.stringify(
		AUDIO_MESSAGES_CHIRHO[localeStateChirho.currentChirho]
	)}
>
	<div class="audio-actions-chirho">
		<div class="audio-settings-chirho">
			{#if lessonChirho.language_chirho === 'grc'}
				<label class="audio-speed-chirho audio-pronunciation-field-chirho">
					<span>{audioTChirho('rendition_chirho')}</span>
					<select
						data-greek-rendition-chirho
						bind:value={renditionChirho}
						onchange={persistRenditionChirho}
						aria-label={audioTChirho('rendition_chirho')}
					>
						<option value="modern">{audioTChirho('modern_choice_chirho')}</option>
						<option value="modern_aspirates">{audioTChirho('modern_aspirates_chirho')}</option>
						<option value="erasmian">{audioTChirho('erasmian_chirho')}</option>
					</select>
				</label>
			{/if}
			<label class="audio-speed-chirho audio-rate-field-chirho">
				<span>{audioTChirho('speed_chirho')}</span>
				<select
					data-speech-rate-chirho
					bind:value={speedChirho}
					aria-label={audioTChirho('reading_speed_chirho')}
				>
					<option value="0.65">{audioTChirho('slow_chirho')}</option>
					<option value="0.85">{audioTChirho('gentle_chirho')}</option>
					<option value="0.88">{audioTChirho('slightly_slower_chirho')}</option>
					<option value="1">{audioTChirho('normal_chirho')}</option>
				</select>
			</label>
		</div>
		<div class="audio-playback-chirho">
			<div
				class="verse-transport-chirho"
				role="group"
				aria-label={audioTChirho('navigation_chirho')}
			>
				{#if verseNavigationChirho}{@render verseNavigationChirho(
						playbackChirho
					)}{:else}{@render playbackChirho()}{/if}
			</div>
			<button type="button" class="speech-stop-chirho" data-speech-stop-chirho disabled
				>{audioTChirho('stop_chirho')}</button
			>
		</div>
	</div>
	<p class="small-note-chirho" id="audio-status-chirho" data-audio-status-chirho aria-live="polite">
		{audioTChirho('checking_chirho')}
	</p>
	{#if lessonChirho.language_chirho === 'grc'}<p class="small-note-chirho">
			{audioTChirho('rendition_coverage_chirho')}
		</p>{/if}
	{#if lessonChirho.language_chirho === 'he' && lessonChirho.tokens_chirho.some((tokenChirho) => tokenChirho.qere_chirho?.length)}
		<p class="small-note-chirho">
			{audioTChirho('qere_chirho')}
		</p>
	{/if}
	<noscript><p class="small-note-chirho">{audioTChirho('javascript_chirho')}</p></noscript>
</div>
