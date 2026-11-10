<!-- For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life. — John 3:16 (KJV) -->
<script lang="ts">
	import SpeechButtonChirho from './SpeechButtonChirho.svelte';
	import {
		spokenVerseChirho,
		wordPlaybackPlanChirho
	} from '$lib/domain-chirho/pronunciation-chirho';
	import type { LessonChirho } from '$lib/domain-chirho/lesson-chirho';
	import type { GreekLessonChirho } from '$lib/domain-chirho/greek-chirho';
	import type { Snippet } from 'svelte';
	import { onMount, untrack } from 'svelte';
	import { AUDIO_MESSAGES_CHIRHO, audioTChirho } from './audio-messages-chirho';
	import { localeStateChirho } from '$lib/i18n-chirho/locale-state-chirho.svelte';
	import {
		isHumanRecordingChirho,
		recordingsForLessonChirho,
		type RecordingChirho
	} from './recordings-chirho';
	import {
		sameEmbeddedReadingChirho,
		validVerseVideoChirho
	} from '$lib/domain-chirho/verse-video-chirho';
	let {
		lessonChirho,
		verseNavigationChirho,
		videoChirho = null,
		onHumanReadingChirho,
		navigationGenerationChirho = 0,
		onReadyChirho
	}: {
		lessonChirho: LessonChirho | GreekLessonChirho;
		verseNavigationChirho?: Snippet<[Snippet]>;
		/** The catalogue's verse video, if any; it plays only as the clock of this same reading. */
		videoChirho?: unknown;
		/** Reports the verse's validated human reading (or null), so its credit can be shown in the Sources fold. */
		onHumanReadingChirho?: (readingChirho: RecordingChirho | null) => void;
		navigationGenerationChirho?: number;
		onReadyChirho?: (lessonIdChirho: string, generationChirho: number) => void;
	} = $props();
	let recordingsChirho = $state<RecordingChirho[]>([]);
	// Workflow: verse-media-chirho.md. The verse button plays this reading first; its credit is shown by
	// the reader in the verse's Sources fold (L.J., 2026-11-07: credits in an info view, not the main UI).
	const humanReadingChirho = $derived(
		recordingsChirho.find(
			(clipChirho) => clipChirho.token_id_chirho === null && isHumanRecordingChirho(clipChirho)
		)
	);
	$effect(() => {
		onHumanReadingChirho?.(humanReadingChirho ?? null);
	});
	// The video's own sound is the clock only when it is exactly this reading (root's shared rule).
	// The scene separately checks that the video starts from the picture displayed there.
	const videoReadingChirho = $derived.by(() => {
		const verseChirho = recordingsChirho.find((clipChirho) => clipChirho.token_id_chirho === null);
		const candidateChirho = videoChirho;
		if (
			!verseChirho ||
			!validVerseVideoChirho(
				candidateChirho,
				lessonChirho.id_chirho,
				verseChirho.canonical_sha256_chirho,
				(candidateChirho as { scene_sha256_chirho?: string } | null)?.scene_sha256_chirho ?? ''
			)
		)
			return null;
		// Only already admitted recordings reach this list. The offline controller still chooses
		// the current rendition first and uses this video only if that selected clip's SHA matches.
		const clipChirho = recordingsChirho.find(
			(clipChirho) =>
				clipChirho.token_id_chirho === null &&
				sameEmbeddedReadingChirho(candidateChirho, clipChirho)
		);
		if (!clipChirho) return null;
		return { video_chirho: candidateChirho.sha256_chirho, clip_chirho: clipChirho.sha256_chirho };
	});
	// Human source-bound readings may include Aramaic; AI and assembled-word Aramaic stay unavailable.
	const aramaicUnavailableChirho = $derived(
		!humanReadingChirho &&
			lessonChirho.tokens_chirho.some(
				(tokenChirho) =>
					'source_language_chirho' in tokenChirho && tokenChirho.source_language_chirho === 'arc'
			)
	);
	let renditionChirho = $state('modern_aspirates');
	let explicitRenditionChirho = $state(false);
	let speedChirho = $state('1');
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
		const generationChirho = navigationGenerationChirho;
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
						// The captured generation prevents an older A callback from starting a later A visit.
						onReadyChirho?.(currentLessonChirho.id_chirho, generationChirho);
					}
				},
				() => {
					if (currentChirho) onReadyChirho?.(currentLessonChirho.id_chirho, generationChirho);
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

{#if aramaicUnavailableChirho}
	<p class="audio-note-chirho">
		{localeStateChirho.currentChirho === 'es'
			? 'Se está preparando la pronunciación aramea.'
			: 'Aramaic pronunciation is being prepared.'}
	</p>
{/if}
{#snippet playbackChirho()}
	<span class="verse-play-chirho">
		<SpeechButtonChirho
			textChirho={spokenVerseChirho(lessonChirho)}
			languageChirho={lessonChirho.language_chirho}
			savedOnlyChirho
			unavailableChirho={aramaicUnavailableChirho}
		/>
	</span>
{/snippet}
{#snippet ipaToggleChirho()}
	<label class="ipa-toggle-chirho"
		><input type="checkbox" data-show-ipa-chirho disabled />{audioTChirho('show_ipa_chirho')}</label
	>
{/snippet}

<div
	class="audio-controls-chirho"
	data-audio-controls-chirho
	data-speech-recordings-chirho={JSON.stringify(recordingsChirho)}
	data-speech-words-chirho={JSON.stringify(wordPlaybackPlanChirho(lessonChirho))}
	data-annotation-chirho
	lang={localeStateChirho.currentChirho}
	data-speech-messages-chirho={JSON.stringify(
		AUDIO_MESSAGES_CHIRHO[localeStateChirho.currentChirho]
	)}
	data-verse-video-sha-chirho={videoReadingChirho?.video_chirho}
	data-verse-video-clip-sha-chirho={videoReadingChirho?.clip_chirho}
>
	<div class="audio-actions-chirho">
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
			{#if lessonChirho.language_chirho !== 'grc'}{@render ipaToggleChirho()}{/if}
		</div>
		{#if lessonChirho.language_chirho === 'grc'}{@render ipaToggleChirho()}{/if}
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
	<p class="small-note-chirho" data-ipa-guide-chirho hidden>{audioTChirho('ipa_guide_chirho')}</p>
	<noscript><p class="small-note-chirho">{audioTChirho('javascript_chirho')}</p></noscript>
</div>

<style>
	.audio-actions-chirho {
		flex-direction: column;
		align-items: stretch;
		gap: 12px;
	}
	.audio-playback-chirho {
		width: 100%;
		flex-direction: column;
		align-items: stretch;
	}
	.verse-transport-chirho {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: 8px;
		width: 100%;
	}
	.verse-transport-chirho > :global(.verse-step-chirho) {
		width: 100%;
		min-height: 38px;
		font-size: 12px;
	}
	.verse-transport-chirho .verse-play-chirho {
		grid-column: 1 / -1;
		grid-row: 1;
	}
	.verse-play-chirho :global(.speech-button-chirho) {
		width: 100%;
		min-height: 48px;
	}
	.speech-stop-chirho:disabled,
	.audio-playback-chirho:has(:global(.verse-play-chirho [aria-busy='true'])) > .speech-stop-chirho {
		display: none;
	}

	.verse-play-chirho {
		display: inline-flex;
		align-items: center;
		gap: 6px;
		position: relative;
	}

	.ipa-toggle-chirho {
		display: inline-flex;
		align-items: center;
		gap: 8px;
		min-height: 44px;
		padding: 8px 10px;
		border: 1px solid #bac7b5;
		border-radius: 9px;
		background: #fafbf7;
		color: #34503d;
		font-size: 13px;
		cursor: pointer;
	}
	.ipa-toggle-chirho input {
		width: 16px;
		height: 16px;
		margin: 0;
		accent-color: #355443;
	}
	.ipa-toggle-chirho:focus-within {
		outline: 2px solid #405a89;
		outline-offset: 3px;
	}
	.ipa-toggle-chirho input:checked {
		background-color: #355443;
		border-color: #355443;
	}
	@container (max-width: 420px) {
		.audio-playback-chirho {
			flex-wrap: wrap;
			gap: 8px;
			margin-bottom: 0;
		}
		.verse-transport-chirho {
			flex: 1 1 100%;
			min-width: 0;
			width: 100%;
		}
		.verse-transport-chirho > :global(.verse-step-chirho) {
			width: 100%;
			min-width: 0;
			min-height: 44px;
		}
		.verse-play-chirho {
			min-width: 0;
			flex-direction: column;
			align-items: stretch;
			gap: 3px;
		}
		.verse-play-chirho :global(.speech-button-chirho) {
			width: 100%;
			min-height: 44px;
			padding-inline: 6px;
		}
		.speech-stop-chirho:disabled,
		.audio-playback-chirho:has(:global(.verse-play-chirho [aria-busy='true']))
			> .speech-stop-chirho {
			display: none;
		}
	}
</style>
