<!-- For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life. — John 3:16 (KJV) -->
<!-- Workflow: spec-chirho/workflows-chirho/hosting-chirho/contact-chirho.md -->
<script lang="ts">
	import { onDestroy, onMount } from 'svelte';
	import { localeStateChirho } from '$lib/i18n-chirho/locale-state-chirho.svelte';
	import {
		challengeChirho,
		removeChallengeChirho
	} from '$lib/media-review-chirho/challenge-chirho';
	import {
		CONTACT_ACTION_CHIRHO,
		CONTACT_LIMITS_CHIRHO,
		CONTACT_PATH_CHIRHO
	} from './contact-contract-chirho';
	import { contactTChirho } from './contact-copy-chirho';
	type StateChirho =
		'idle' | 'waiting' | 'busy' | 'sent' | 'invalid' | 'rate' | 'error' | 'challenge_error';
	let nameChirho = $state('');
	let emailChirho = $state('');
	let messageChirho = $state('');
	let tokenChirho = $state('');
	let stateChirho = $state<StateChirho>('idle');
	let startedChirho = $state(false);
	let formChirho = $state<HTMLFormElement>();
	let hostChirho = $state<HTMLDivElement>();
	let widgetChirho: string | null = null;
	let generationChirho = 0;
	const busyChirho = $derived(stateChirho === 'busy');
	const statusChirho = $derived.by(() => {
		if (stateChirho === 'idle') return tokenChirho ? contactTChirho('ready_chirho') : '';
		if (stateChirho === 'waiting')
			return contactTChirho(tokenChirho ? 'ready_chirho' : 'waiting_chirho');
		return contactTChirho(`${stateChirho}_chirho`);
	});
	// Turnstile loads only once someone starts writing, not for every visit to the page.
	async function startChallengeChirho() {
		if (startedChirho || !hostChirho) return;
		startedChirho = true;
		const currentChirho = ++generationChirho;
		try {
			const idChirho = await challengeChirho(
				hostChirho,
				localeStateChirho.currentChirho,
				(valueChirho) => {
					if (currentChirho === generationChirho) tokenChirho = valueChirho;
				},
				CONTACT_ACTION_CHIRHO
			);
			if (currentChirho !== generationChirho) removeChallengeChirho(idChirho);
			else widgetChirho = idChirho;
		} catch {
			if (currentChirho === generationChirho) {
				startedChirho = false;
				stateChirho = 'challenge_error';
			}
		}
	}
	function stopChallengeChirho() {
		generationChirho++;
		removeChallengeChirho(widgetChirho);
		widgetChirho = null;
		tokenChirho = '';
		startedChirho = false;
	}
	onDestroy(stopChallengeChirho);
	// Writing that began before the page finished loading never fired focusin; start it now.
	onMount(() => {
		if (nameChirho || emailChirho || messageChirho || formChirho?.contains(document.activeElement))
			void startChallengeChirho();
	});
	function editChirho() {
		if (stateChirho !== 'busy' && stateChirho !== 'challenge_error') stateChirho = 'idle';
	}
	async function sendChirho(eventChirho: SubmitEvent) {
		eventChirho.preventDefault();
		if (stateChirho === 'busy') return;
		if (!tokenChirho) {
			stateChirho = 'waiting';
			await startChallengeChirho();
			return;
		}
		stateChirho = 'busy';
		let nextChirho: StateChirho = 'error';
		try {
			const responseChirho = await fetch(CONTACT_PATH_CHIRHO, {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					name_chirho: nameChirho,
					email_chirho: emailChirho,
					message_chirho: messageChirho,
					locale_chirho: localeStateChirho.currentChirho,
					turnstile_token_chirho: tokenChirho
				}),
				signal: AbortSignal.timeout(20000)
			});
			const resultChirho = (await responseChirho.json().catch(() => ({}))) as {
				sent_chirho?: unknown;
				error_chirho?: unknown;
			};
			if (responseChirho.status === 202 && resultChirho.sent_chirho === true) nextChirho = 'sent';
			else if (responseChirho.status === 429) nextChirho = 'rate';
			else if (resultChirho.error_chirho === 'invalid_message') nextChirho = 'invalid';
		} catch {
			// A network failure keeps the visitor's text so the message can be sent again.
		}
		// Challenge tokens are single-use; every attempt needs a fresh verification.
		stopChallengeChirho();
		stateChirho = nextChirho;
		if (nextChirho === 'sent') {
			nameChirho = '';
			emailChirho = '';
			messageChirho = '';
		} else await startChallengeChirho();
	}
</script>

<form
	bind:this={formChirho}
	class="contact-form-chirho"
	aria-label={contactTChirho('form_chirho')}
	onsubmit={sendChirho}
	onfocusin={startChallengeChirho}
	oninput={editChirho}
>
	<div class="field-chirho">
		<label for="contact-name-chirho">{contactTChirho('name_chirho')}</label>
		<input
			id="contact-name-chirho"
			name="name_chirho"
			autocomplete="name"
			maxlength={CONTACT_LIMITS_CHIRHO.name_chirho}
			aria-describedby="contact-name-help-chirho"
			disabled={busyChirho}
			bind:value={nameChirho}
		/>
		<p id="contact-name-help-chirho">{contactTChirho('name_help_chirho')}</p>
	</div>
	<div class="field-chirho">
		<label for="contact-email-chirho">{contactTChirho('email_chirho')}</label>
		<input
			id="contact-email-chirho"
			name="email_chirho"
			type="email"
			inputmode="email"
			autocomplete="email"
			spellcheck="false"
			required
			maxlength={CONTACT_LIMITS_CHIRHO.email_chirho}
			aria-describedby="contact-email-help-chirho"
			disabled={busyChirho}
			bind:value={emailChirho}
		/>
		<p id="contact-email-help-chirho">{contactTChirho('email_help_chirho')}</p>
	</div>
	<div class="field-chirho">
		<label for="contact-message-chirho">{contactTChirho('message_chirho')}</label>
		<textarea
			id="contact-message-chirho"
			name="message_chirho"
			rows="8"
			required
			maxlength={CONTACT_LIMITS_CHIRHO.message_chirho}
			aria-describedby="contact-message-help-chirho"
			disabled={busyChirho}
			bind:value={messageChirho}></textarea>
		<p id="contact-message-help-chirho">
			{contactTChirho('message_help_chirho', {
				max_chirho: CONTACT_LIMITS_CHIRHO.message_chirho.toLocaleString(
					localeStateChirho.currentChirho
				)
			})}
		</p>
	</div>
	<div
		bind:this={hostChirho}
		class="challenge-host-chirho"
		class:challenge-started-chirho={startedChirho}
		role="group"
		aria-label={contactTChirho('verification_chirho')}
	></div>
	<div class="actions-chirho">
		<button type="submit" disabled={busyChirho}>{contactTChirho('send_chirho')}</button>
		<p
			role="status"
			class:status-success-chirho={stateChirho === 'sent'}
			class:status-problem-chirho={['invalid', 'rate', 'error', 'challenge_error'].includes(
				stateChirho
			)}
		>
			{statusChirho}
		</p>
	</div>
	<p class="report-note-chirho">{contactTChirho('report_note_chirho')}</p>
</form>

<style>
	.contact-form-chirho {
		display: grid;
		gap: 22px;
		margin: 0 0 40px;
		padding: clamp(22px, 4vw, 32px);
		border: 1px solid #e2d6bf;
		border-radius: 16px;
		background: #fffdf8;
	}
	.field-chirho {
		display: grid;
		gap: 7px;
	}
	label {
		font: 600 15px/1.3 var(--sans-chirho);
		color: var(--forest-chirho, #1d3a2c);
	}
	input,
	textarea {
		box-sizing: border-box;
		width: 100%;
		margin: 0;
		padding: 12px 14px;
		border: 1px solid #cdbf9f;
		border-radius: 10px;
		background: #fff;
		font: 16px/1.5 var(--sans-chirho);
		color: var(--ink-chirho, #293c34);
	}
	textarea {
		min-height: 180px;
		resize: vertical;
	}
	input:focus-visible,
	textarea:focus-visible,
	button:focus-visible {
		outline: 2px solid var(--copper-chirho, #a2552f);
		outline-offset: 2px;
	}
	input:disabled,
	textarea:disabled {
		background: #f4f1ea;
	}
	.field-chirho p,
	.report-note-chirho {
		margin: 0;
		font-size: 13px;
		line-height: 1.55;
		color: var(--quiet-chirho, #69746b);
	}
	/* Hidden until writing starts, so an empty row never doubles the gap above Send. */
	.challenge-host-chirho {
		display: none;
		min-width: 0;
	}
	.challenge-started-chirho {
		display: block;
		min-height: 65px;
	}
	.actions-chirho {
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		gap: 12px 18px;
	}
	button {
		padding: 13px 22px;
		border: 0;
		border-radius: 10px;
		background: var(--forest-chirho, #1d3a2c);
		font: 600 15px/1.2 var(--sans-chirho);
		color: #f8f1e1;
		cursor: pointer;
	}
	button:disabled {
		opacity: 0.6;
		cursor: progress;
	}
	.actions-chirho p {
		flex: 1 1 220px;
		margin: 0;
		font-size: 14px;
		line-height: 1.5;
		color: var(--forest-chirho, #1d3a2c);
	}
	.actions-chirho .status-success-chirho {
		font-weight: 600;
		color: #2f6b45;
	}
	.actions-chirho .status-problem-chirho {
		color: #8a3a1f;
	}
</style>
