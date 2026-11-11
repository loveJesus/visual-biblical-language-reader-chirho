<!-- For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life. — John 3:16 (KJV) -->
<script lang="ts">
	import { onMount, tick as tickChirho } from 'svelte';
	import { localeStateChirho } from '$lib/i18n-chirho/locale-state-chirho.svelte';
	import { referenceChirho } from '$lib/i18n-chirho/labels-chirho';
	import { mobileStoreChirho } from '../session-chirho/mobile-store-chirho';
	import { AI_MESSAGES_CHIRHO } from './messages-chirho';
	import {
		AI_PREFERENCE_KEY_CHIRHO,
		AI_PROVIDERS_CHIRHO,
		aiPromptChirho,
		aiVoiceAvailableChirho,
		parseAiPreferencesChirho,
		type AiPreferencesChirho,
		type AiProviderChirho,
		type AiModeChirho,
		type AiFocusChirho
	} from './preferences-chirho';
	let { verseChirho }: { verseChirho: Parameters<typeof aiPromptChirho>[0] } = $props();
	let preferencesChirho = $state<AiPreferencesChirho | null>(null);
	let panelChirho = $state<'setup_chirho' | 'ask_chirho' | null>(null);
	const openChirho = $derived(panelChirho !== null);
	let dialogChirho = $state<HTMLDialogElement>();
	let previewChirho = $state<HTMLTextAreaElement>();
	let providerChirho = $state<AiProviderChirho | ''>('');
	let modeChirho = $state<AiModeChirho>('text_chirho');
	let focusChirho = $state<AiFocusChirho>('both_chirho');
	let questionChirho = $state('');
	let previewOpenChirho = $state(false);
	let copiedChirho = $state<'idle_chirho' | 'copied_chirho' | 'failed_chirho'>('idle_chirho');
	let mobileChirho = $state(false);
	let visitOnlyChirho = $state(false);
	let continueChirho = $state(false);
	let triggerChirho: HTMLElement | null = null;
	const copyChirho = $derived(AI_MESSAGES_CHIRHO[localeStateChirho.currentChirho]);
	const voiceAvailableChirho = $derived(aiVoiceAvailableChirho(providerChirho, mobileChirho));
	const destinationChirho = $derived(
		preferencesChirho ? AI_PROVIDERS_CHIRHO[preferencesChirho.provider_chirho] : null
	);
	const promptChirho = $derived(
		aiPromptChirho(
			verseChirho,
			questionChirho,
			localeStateChirho.currentChirho,
			preferencesChirho?.focus_chirho ?? 'both_chirho'
		)
	);
	onMount(() => {
		mobileChirho = mobileStoreChirho(navigator) !== null;
		try {
			preferencesChirho = parseAiPreferencesChirho(localStorage.getItem(AI_PREFERENCE_KEY_CHIRHO));
		} catch {
			/* Optional local storage never prevents a handoff. */
		}
	});
	function prepareChirho(): void {
		triggerChirho = document.activeElement instanceof HTMLElement ? document.activeElement : null;
		providerChirho = preferencesChirho?.provider_chirho ?? '';
		modeChirho = preferencesChirho?.mode_chirho ?? 'text_chirho';
		focusChirho = preferencesChirho?.focus_chirho ?? 'both_chirho';
		copiedChirho = 'idle_chirho';
		previewOpenChirho = false;
	}
	export function openAskChirho(): void {
		prepareChirho();
		continueChirho = true;
		questionChirho = '';
		panelChirho = preferencesChirho ? 'ask_chirho' : 'setup_chirho';
	}
	export function openSettingsChirho(): void {
		prepareChirho();
		continueChirho = false;
		panelChirho = 'setup_chirho';
	}
	function closeChirho(): void {
		panelChirho = null;
		questionChirho = '';
		copiedChirho = 'idle_chirho';
	}
	$effect(() => {
		void verseChirho.id_chirho;
		closeChirho();
	});
	$effect(() => {
		if (!voiceAvailableChirho) modeChirho = 'text_chirho';
	});
	$effect(() => {
		if (!openChirho || !dialogChirho) return;
		const currentChirho = dialogChirho;
		const overflowChirho = document.body.style.overflow;
		document.body.style.overflow = 'hidden';
		currentChirho.showModal();
		return () => {
			if (currentChirho.open) currentChirho.close();
			document.body.style.overflow = overflowChirho;
			if (triggerChirho?.isConnected) triggerChirho.focus({ preventScroll: true });
		};
	});
	function saveChirho(eventChirho: SubmitEvent): void {
		eventChirho.preventDefault();
		if (!providerChirho) return;
		const valueChirho: AiPreferencesChirho = {
			schema_version_chirho: 1,
			provider_chirho: providerChirho,
			mode_chirho: voiceAvailableChirho ? modeChirho : 'text_chirho',
			focus_chirho: focusChirho
		};
		preferencesChirho = valueChirho;
		try {
			localStorage.setItem(AI_PREFERENCE_KEY_CHIRHO, JSON.stringify(valueChirho));
			visitOnlyChirho = false;
		} catch {
			visitOnlyChirho = true;
		}
		if (continueChirho) panelChirho = 'ask_chirho';
		else closeChirho();
	}
	async function copyPromptChirho(): Promise<void> {
		const valueChirho = promptChirho;
		copiedChirho = 'idle_chirho';
		try {
			await navigator.clipboard.writeText(valueChirho);
			if (openChirho && valueChirho === promptChirho) copiedChirho = 'copied_chirho';
		} catch {
			if (openChirho && valueChirho === promptChirho) {
				copiedChirho = 'failed_chirho';
				previewOpenChirho = true;
				await tickChirho();
				if (!openChirho) return;
				previewChirho?.focus();
				previewChirho?.select();
			}
		}
	}
	function backdropChirho(eventChirho: MouseEvent): void {
		if (eventChirho.target !== dialogChirho || !dialogChirho) return;
		const rectChirho = dialogChirho.getBoundingClientRect();
		if (
			eventChirho.clientX < rectChirho.left ||
			eventChirho.clientX > rectChirho.right ||
			eventChirho.clientY < rectChirho.top ||
			eventChirho.clientY > rectChirho.bottom
		)
			closeChirho();
	}
</script>

<dialog
	bind:this={dialogChirho}
	class="ai-panel-chirho"
	aria-labelledby="ai-panel-heading-chirho"
	onclose={closeChirho}
	onclick={backdropChirho}
>
	<header>
		<div>
			<p class="ai-eyebrow-chirho">HINNEH · AI</p>
			<h2 id="ai-panel-heading-chirho">
				{panelChirho === 'setup_chirho' ? copyChirho.setup_chirho : copyChirho.ask_chirho}
			</h2>
		</div>
		<button
			type="button"
			class="ai-close-chirho"
			aria-label={copyChirho.close_chirho}
			onclick={closeChirho}>×</button
		>
	</header>
	{#if panelChirho === 'setup_chirho'}
		<form onsubmit={saveChirho}>
			<p class="ai-intro-chirho">{copyChirho.intro_chirho}</p>
			<label class="ai-field-chirho"
				>{copyChirho.provider_chirho}<select bind:value={providerChirho} required
					><option value="" disabled>{copyChirho.choose_chirho}</option
					>{#each Object.entries(AI_PROVIDERS_CHIRHO) as [keyChirho, valueChirho] (keyChirho)}<option
							value={keyChirho}
							>{keyChirho === 'copy_chirho'
								? copyChirho.other_chirho
								: valueChirho.name_chirho}</option
						>{/each}</select
				></label
			>
			<fieldset>
				<legend>{copyChirho.mode_chirho}</legend>
				<div class="ai-mode-options-chirho">
					<label
						><input
							type="radio"
							name="ai-mode-chirho"
							value="text_chirho"
							bind:group={modeChirho}
						/>{copyChirho.text_chirho}</label
					><label class:ai-unavailable-chirho={!voiceAvailableChirho}
						><input
							type="radio"
							name="ai-mode-chirho"
							value="voice_chirho"
							disabled={!voiceAvailableChirho}
							bind:group={modeChirho}
						/>{copyChirho.voice_chirho}</label
					>
				</div>
				<p class="ai-hint-chirho">
					{voiceAvailableChirho
						? copyChirho.voice_hint_chirho
						: copyChirho.voice_unavailable_chirho}
				</p>
			</fieldset>
			<label class="ai-field-chirho"
				>{copyChirho.focus_chirho}<select bind:value={focusChirho}
					><option value="both_chirho">{copyChirho.both_chirho}</option><option
						value="language_chirho">{copyChirho.language_chirho}</option
					><option value="context_chirho">{copyChirho.context_chirho}</option></select
				></label
			>
			<p class="ai-privacy-chirho">{copyChirho.privacy_chirho}</p>
			<footer>
				<button type="button" class="ai-secondary-chirho" onclick={closeChirho}
					>{copyChirho.cancel_chirho}</button
				><button class="ai-primary-chirho" type="submit" disabled={!providerChirho}
					>{continueChirho ? copyChirho.continue_chirho : copyChirho.save_chirho}</button
				>
			</footer>
		</form>
	{:else if panelChirho === 'ask_chirho' && preferencesChirho && destinationChirho}
		<div class="ai-compose-chirho">
			<div class="ai-verse-chirho">
				<strong>{referenceChirho(verseChirho.id_chirho, localeStateChirho.currentChirho)}</strong
				><span>{destinationChirho.name_chirho}</span>
				<p dir="auto" lang={verseChirho.language_chirho}>{verseChirho.canonical_text_chirho}</p>
			</div>
			<label class="ai-field-chirho"
				>{copyChirho.question_chirho}<textarea
					maxlength="2000"
					rows="3"
					bind:value={questionChirho}
					oninput={() => (copiedChirho = 'idle_chirho')}
					placeholder={copyChirho.question_hint_chirho}></textarea></label
			>
			<p class="ai-hint-chirho">{copyChirho.handoff_hint_chirho}</p>
			{#if preferencesChirho.mode_chirho === 'voice_chirho' && mobileChirho}<p
					class="ai-voice-guide-chirho"
				>
					{copyChirho.voice_steps_chirho}
				</p>{/if}
			<details class="ai-preview-chirho" bind:open={previewOpenChirho}>
				<summary>{copyChirho.preview_chirho}</summary><textarea
					bind:this={previewChirho}
					readonly
					value={promptChirho}
					rows="8"
					aria-label={copyChirho.preview_chirho}
				></textarea>{#if copiedChirho === 'failed_chirho'}<button
						type="button"
						class="ai-secondary-chirho"
						onclick={() => {
							previewChirho?.focus();
							previewChirho?.select();
						}}>{copyChirho.select_chirho}</button
					>{/if}
			</details>
			<p class="ai-copy-status-chirho" role="status">
				{copiedChirho === 'copied_chirho'
					? copyChirho.copied_chirho
					: copiedChirho === 'failed_chirho'
						? copyChirho.copy_failed_chirho
						: ''}
			</p>
			{#if visitOnlyChirho}<p class="ai-hint-chirho" role="status">
					{copyChirho.visit_chirho}
				</p>{/if}
			<footer class="ai-handoff-actions-chirho">
				<button type="button" class="ai-primary-chirho" onclick={copyPromptChirho}
					>{copyChirho.copy_chirho}</button
				>{#if destinationChirho.url_chirho}<a
						class="ai-secondary-chirho"
						href={destinationChirho.url_chirho}
						target="_blank"
						rel="external noopener noreferrer"
						>{copyChirho.open_chirho} {destinationChirho.name_chirho} ↗</a
					>{/if}
			</footer>
			<div class="ai-bottom-chirho">
				<button
					type="button"
					class="ai-text-button-chirho"
					onclick={() => {
						prepareChirho();
						continueChirho = true;
						panelChirho = 'setup_chirho';
					}}>{copyChirho.change_chirho}</button
				>
				<p class="ai-hint-chirho">{copyChirho.ai_note_chirho}</p>
			</div>
		</div>
	{/if}
</dialog>

<style>
	.ai-panel-chirho {
		width: min(580px, calc(100vw - 24px));
		max-height: calc(100dvh - 32px);
		margin: auto;
		padding: 0;
		overflow: auto;
		border: 1px solid #c7d1c1;
		border-radius: 18px;
		background: #fcfcf7;
		color: #293a2c;
		box-shadow: 0 24px 90px #10231938;
	}
	.ai-panel-chirho::backdrop {
		background: #18291dc2;
		backdrop-filter: blur(3px);
	}
	header {
		position: sticky;
		top: 0;
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 16px;
		padding: 18px 24px;
		border-bottom: 1px solid #e0e5d9;
		background: #fcfcf7;
		z-index: 1;
	}
	.ai-eyebrow-chirho {
		margin: 0 0 5px;
		color: #75816d;
		font-size: 10px;
		letter-spacing: 0.12em;
	}
	h2 {
		margin: 0;
		font:
			26px/1.2 Georgia,
			serif;
	}
	.ai-close-chirho {
		width: 40px;
		height: 40px;
		padding: 0;
		flex-shrink: 0;
		border: 0;
		border-radius: 50%;
		background: #eef1e8;
		color: inherit;
		font-size: 27px;
		cursor: pointer;
	}
	form,
	.ai-compose-chirho {
		padding: 20px 24px 24px;
	}
	.ai-intro-chirho {
		margin: 0 0 20px;
		font-size: 14px;
		line-height: 1.6;
	}
	.ai-field-chirho {
		display: flex;
		flex-direction: column;
		gap: 8px;
		margin: 18px 0;
		font-size: 13px;
		font-weight: 600;
	}
	select,
	textarea {
		min-width: 0;
		width: 100%;
		box-sizing: border-box;
		border: 1px solid #bdcab5;
		border-radius: 9px;
		background: #fffef9;
		color: #334835;
		padding: 10px 12px;
		font:
			14px/1.6 Arial,
			sans-serif;
	}
	select {
		min-height: 44px;
		padding-right: 32px;
	}
	textarea {
		resize: vertical;
	}
	fieldset {
		min-width: 0;
		border: 0;
		padding: 0;
		margin: 22px 0;
	}
	legend {
		font-size: 13px;
		font-weight: 600;
		margin-bottom: 10px;
	}
	.ai-mode-options-chirho {
		display: flex;
		flex-wrap: wrap;
		gap: 8px;
	}
	.ai-mode-options-chirho label {
		display: flex;
		align-items: center;
		gap: 8px;
		padding: 10px 12px;
		border: 1px solid #c8d2bf;
		border-radius: 9px;
		font-size: 13px;
		cursor: pointer;
	}
	input {
		width: 17px;
		height: 17px;
		flex-shrink: 0;
		accent-color: #36513e;
	}
	.ai-mode-options-chirho label:has(input:checked) {
		background: #eaf0e4;
		border-color: #688264;
	}
	.ai-unavailable-chirho {
		opacity: 0.5;
		cursor: default;
	}
	.ai-hint-chirho,
	.ai-privacy-chirho {
		color: #66735e;
		font-size: 12px;
		line-height: 1.65;
		margin: 10px 0;
	}
	.ai-privacy-chirho {
		padding: 12px 14px;
		border-radius: 9px;
		background: #f0f3e9;
		margin-top: 22px;
	}
	footer {
		display: flex;
		flex-wrap: wrap;
		justify-content: flex-end;
		align-items: stretch;
		gap: 10px;
		padding-top: 14px;
	}
	.ai-primary-chirho,
	.ai-secondary-chirho {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		min-height: 42px;
		box-sizing: border-box;
		padding: 9px 15px;
		border: 1px solid #36513e;
		border-radius: 9px;
		font-size: 13px;
		font-weight: 600;
		text-decoration: none;
		text-align: center;
		cursor: pointer;
	}
	.ai-primary-chirho {
		background: #36513e;
		color: white;
	}
	.ai-secondary-chirho {
		background: #f4f6ef;
		color: #36513e;
		border-color: #bfccb7;
	}
	button:disabled {
		opacity: 0.45;
		cursor: default;
	}
	.ai-verse-chirho {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		justify-content: space-between;
		gap: 8px;
		padding: 14px 16px;
		background: #eff3e9;
		border-radius: 10px;
	}
	.ai-verse-chirho strong {
		font-family: Georgia, serif;
		font-size: 20px;
	}
	.ai-verse-chirho > span {
		font-size: 12px;
		color: #68785e;
	}
	.ai-verse-chirho p {
		flex-basis: 100%;
		margin: 4px 0 0;
		font-size: 22px;
		line-height: 1.7;
	}
	.ai-preview-chirho {
		border: 1px solid #dce3d3;
		border-radius: 9px;
		margin: 14px 0 0;
	}
	summary {
		padding: 10px 12px;
		font-size: 12px;
		cursor: pointer;
	}
	.ai-preview-chirho textarea {
		border: 0;
		border-top: 1px solid #e0e6d8;
		border-radius: 0 0 9px 9px;
		font-size: 12px;
	}
	.ai-copy-status-chirho {
		color: #36513e;
		font-size: 12px;
		line-height: 1.6;
		margin: 10px 0 0;
	}
	.ai-copy-status-chirho:empty {
		display: none;
	}
	.ai-voice-guide-chirho {
		border-left: 3px solid #718e65;
		padding: 8px 12px;
		color: #52664a;
		background: #f1f4ec;
		font-size: 13px;
		line-height: 1.7;
	}
	.ai-handoff-actions-chirho {
		justify-content: flex-start;
	}
	.ai-bottom-chirho {
		margin-top: 18px;
		border-top: 1px solid #e0e5d8;
		padding-top: 12px;
	}
	.ai-text-button-chirho {
		padding: 0;
		background: none;
		color: #536d47;
		border: 0;
		font: inherit;
		font-size: 12px;
		text-decoration: underline;
		text-underline-offset: 3px;
		cursor: pointer;
	}
	button:focus-visible,
	a:focus-visible,
	select:focus-visible,
	input:focus-visible,
	textarea:focus-visible,
	summary:focus-visible {
		outline: 3px solid #405a89;
		outline-offset: 3px;
	}
	@media (max-width: 420px) {
		header {
			padding: 16px;
		}
		form,
		.ai-compose-chirho {
			padding: 16px;
		}
		h2 {
			font-size: 23px;
		}
		footer > button,
		.ai-handoff-actions-chirho > a {
			flex: 1 1 auto;
		}
	}
</style>
