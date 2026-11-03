<!-- For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life. — John 3:16 (KJV) -->
<script lang="ts">
	import { tick, onDestroy } from 'svelte';
	import { localeStateChirho } from '$lib/i18n-chirho/locale-state-chirho.svelte';
	import { defineCatalogueChirho, translateChirho } from '$lib/i18n-chirho/translate-chirho';
	import { challengeChirho, removeChallengeChirho } from './challenge-chirho';
	let {
		assetPathChirho,
		sha256Chirho,
		verseIdChirho
	}: { assetPathChirho: string; sha256Chirho?: string; verseIdChirho: string } = $props();
	const messagesChirho = defineCatalogueChirho({
		en: {
			flag_chirho: 'Report image issue',
			title_chirho: 'Flag an illustration',
			reason_chirho: 'What looks wrong?',
			anatomy_chirho: 'Anatomy or extra limbs',
			detail_chirho: 'Garbled or impossible details',
			other_chirho: 'Other visual artifact',
			note_chirho:
				'Reports go to illustration review. The current image stays until a replacement is ready.',
			send_chirho: 'Send report',
			cancel_chirho: 'Close',
			ready_chirho: 'Complete the verification to send.',
			verified_chirho: 'Ready to send.',
			sent_chirho: 'Thank you. This illustration is queued for review.',
			error_chirho: 'The report could not be sent. Please try again.',
			busy_chirho: 'Sending…'
		},
		es: {
			flag_chirho: 'Informar de un problema',
			title_chirho: 'Señalar una ilustración',
			reason_chirho: '¿Qué se ve mal?',
			anatomy_chirho: 'Anatomía o extremidades adicionales',
			detail_chirho: 'Detalles confusos o imposibles',
			other_chirho: 'Otro defecto visual',
			note_chirho:
				'Los informes se revisan. La imagen actual permanece hasta que esté lista su sustitución.',
			send_chirho: 'Enviar informe',
			cancel_chirho: 'Cerrar',
			ready_chirho: 'Completa la verificación para enviar.',
			verified_chirho: 'Listo para enviar.',
			sent_chirho: 'Gracias. Esta ilustración está en la cola de revisión.',
			error_chirho: 'No se pudo enviar el informe. Inténtalo de nuevo.',
			busy_chirho: 'Enviando…'
		}
	});
	const tChirho = (keyChirho: keyof typeof messagesChirho.en) =>
		translateChirho(messagesChirho, localeStateChirho.currentChirho, keyChirho);
	let dialogChirho = $state<HTMLDialogElement>();
	let hostChirho = $state<HTMLDivElement>();
	let tokenChirho = $state('');
	let reasonChirho = $state('other_visual_artifact');
	let stateChirho = $state<'ready' | 'busy' | 'sent' | 'error'>('ready');
	let widgetChirho: string | null = null;
	let requestChirho = 0;
	async function openChirho() {
		stateChirho = 'ready';
		tokenChirho = '';
		dialogChirho?.showModal();
		const currentChirho = ++requestChirho;
		await tick();
		try {
			const idChirho = await challengeChirho(
				hostChirho!,
				localeStateChirho.currentChirho,
				(valueChirho) => {
					if (currentChirho === requestChirho) tokenChirho = valueChirho;
				}
			);
			if (currentChirho !== requestChirho) removeChallengeChirho(idChirho);
			else widgetChirho = idChirho;
		} catch {
			if (currentChirho === requestChirho) stateChirho = 'error';
		}
	}
	function closeChirho() {
		requestChirho++;
		removeChallengeChirho(widgetChirho);
		widgetChirho = null;
		tokenChirho = '';
	}
	onDestroy(closeChirho);
	async function sendChirho(eventChirho: SubmitEvent) {
		eventChirho.preventDefault();
		if (!tokenChirho || stateChirho === 'busy') return;
		stateChirho = 'busy';
		try {
			const responseChirho = await fetch('/api-chirho/artifact-flags-chirho', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					asset_path_chirho: assetPathChirho,
					sha256_chirho: sha256Chirho,
					verse_id_chirho: verseIdChirho,
					reason_chirho: reasonChirho,
					turnstile_token_chirho: tokenChirho
				}),
				signal: AbortSignal.timeout(15000)
			});
			const resultChirho = (await responseChirho.json()) as { queued_chirho?: boolean };
			if (responseChirho.status !== 202 || resultChirho.queued_chirho !== true)
				throw new Error('Report refused');
			stateChirho = 'sent';
		} catch {
			stateChirho = 'error';
		}
		removeChallengeChirho(widgetChirho);
		widgetChirho = null;
		tokenChirho = '';
	}
</script>

{#if sha256Chirho}
	<button class="report-artwork-chirho" type="button" onclick={openChirho}
		>⚑ {tChirho('flag_chirho')}</button
	>
	<dialog
		bind:this={dialogChirho}
		onclose={closeChirho}
		aria-label={tChirho('title_chirho')}
		lang={localeStateChirho.currentChirho}
	>
		<form onsubmit={sendChirho}>
			<h3>{tChirho('title_chirho')}</h3>
			<p>{tChirho('note_chirho')}</p>
			{#if stateChirho !== 'sent'}
				<label
					>{tChirho('reason_chirho')}<select
						bind:value={reasonChirho}
						disabled={stateChirho === 'busy'}
						><option value="anatomy">{tChirho('anatomy_chirho')}</option><option
							value="unreadable_detail">{tChirho('detail_chirho')}</option
						><option value="other_visual_artifact">{tChirho('other_chirho')}</option></select
					></label
				>
				<div bind:this={hostChirho} class="challenge-host-chirho"></div>
			{/if}
			<p role="status">
				{tChirho(
					stateChirho === 'sent'
						? 'sent_chirho'
						: stateChirho === 'error'
							? 'error_chirho'
							: stateChirho === 'busy'
								? 'busy_chirho'
								: tokenChirho
									? 'verified_chirho'
									: 'ready_chirho'
				)}
			</p>
			<div class="report-actions-chirho">
				<button type="button" onclick={() => dialogChirho?.close()}
					>{tChirho('cancel_chirho')}</button
				>{#if stateChirho !== 'sent'}<button
						type="submit"
						disabled={!tokenChirho || stateChirho === 'busy'}>{tChirho('send_chirho')}</button
					>{/if}
			</div>
		</form>
	</dialog>
{/if}

<style>
	.report-artwork-chirho {
		font: inherit;
		font-size: 12px;
		padding: 5px 9px;
		border: 1px solid #c5cdbf;
		border-radius: 7px;
		color: #52624d;
		background: #fffefa;
		cursor: pointer;
		margin-top: 10px;
	}
	dialog {
		margin: auto;
		font-family: inherit;
		font-size: 14px;
		font-style: normal;
		line-height: 1.5;
		width: min(440px, calc(100vw - 32px));
		max-height: calc(100dvh - 32px);
		overflow: auto;
		box-sizing: border-box;
		border: 1px solid #bac5b3;
		border-radius: 16px;
		padding: 24px;
		color: #304133;
		background: #fffefa;
		box-shadow: 0 16px 60px #0003;
	}
	dialog::backdrop {
		background: #17251d88;
	}
	h3 {
		margin: 0 0 12px;
		font-size: 21px;
	}
	p {
		margin: 12px 0;
		font-size: 14px;
		line-height: 1.6;
	}
	label {
		display: grid;
		gap: 8px;
		font-size: 14px;
	}
	select {
		width: 100%;
		min-width: 0;
		padding: 10px;
		border-radius: 7px;
		border: 1px solid #bac5b3;
		background: white;
		font: inherit;
		color: inherit;
	}
	.challenge-host-chirho {
		margin-top: 16px;
		min-height: 65px;
	}
	.report-actions-chirho {
		display: flex;
		justify-content: flex-end;
		flex-wrap: wrap;
		gap: 10px;
	}
	.report-actions-chirho button {
		min-height: 40px;
		border-radius: 8px;
		border: 1px solid #bac5b3;
		padding: 9px 14px;
		background: #eef2e9;
		color: inherit;
		font: inherit;
		cursor: pointer;
	}
	button:disabled {
		opacity: 0.5;
		cursor: default;
	}
</style>
