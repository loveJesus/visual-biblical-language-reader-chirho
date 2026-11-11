<!-- For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life. — John 3:16 (KJV) -->
<script lang="ts">
	import { onMount, tick, type Snippet } from 'svelte';
	import { localeStateChirho } from '$lib/i18n-chirho/locale-state-chirho.svelte';
	import { defineCatalogueChirho, translateChirho } from '$lib/i18n-chirho/translate-chirho';
	let {
		cardIdChirho,
		triggerChirho,
		onCloseChirho,
		children: childrenChirho
	}: {
		cardIdChirho: string;
		triggerChirho: HTMLElement | null;
		onCloseChirho: () => void;
		children: Snippet;
	} = $props();
	let dialogChirho: HTMLDialogElement;
	const messagesChirho = defineCatalogueChirho({
		en: {
			title_chirho: 'Word details',
			close_chirho: 'Close',
			all_words_chirho: 'View in all words'
		},
		es: {
			title_chirho: 'Detalles de la palabra',
			close_chirho: 'Cerrar',
			all_words_chirho: 'Ver en todas las palabras'
		}
	});
	onMount(() => {
		const overflowChirho = document.body.style.overflow;
		document.body.style.overflow = 'hidden';
		dialogChirho.showModal();
		return () => {
			document.body.style.overflow = overflowChirho;
		};
	});
	async function closeChirho(): Promise<void> {
		const jumpChirho = dialogChirho.returnValue.startsWith('jump-chirho:')
			? dialogChirho.returnValue.slice('jump-chirho:'.length)
			: null;
		onCloseChirho();
		await tick();
		const targetChirho = jumpChirho ? document.getElementById(jumpChirho) : triggerChirho;
		if (targetChirho instanceof HTMLDetailsElement) targetChirho.open = true;
		targetChirho?.focus({ preventScroll: true });
		if (jumpChirho)
			targetChirho?.scrollIntoView({
				block: 'start',
				behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth'
			});
	}
	function backdropChirho(eventChirho: MouseEvent): void {
		if (eventChirho.target !== dialogChirho) return;
		const rectChirho = dialogChirho.getBoundingClientRect();
		if (
			eventChirho.clientX < rectChirho.left ||
			eventChirho.clientX > rectChirho.right ||
			eventChirho.clientY < rectChirho.top ||
			eventChirho.clientY > rectChirho.bottom
		)
			dialogChirho.close();
	}
</script>

<dialog
	class="word-details-modal-chirho"
	bind:this={dialogChirho}
	onclose={closeChirho}
	onclick={backdropChirho}
	aria-labelledby="word-details-title-chirho"
>
	<header>
		<h2 id="word-details-title-chirho">
			{translateChirho(messagesChirho, localeStateChirho.currentChirho, 'title_chirho')}
		</h2>
		<button
			type="button"
			onclick={() => dialogChirho.close()}
			aria-label={translateChirho(messagesChirho, localeStateChirho.currentChirho, 'close_chirho')}
			>×</button
		>
	</header>
	<div class="word-modal-body-chirho">{@render childrenChirho()}</div>
	<footer>
		<button type="button" onclick={() => dialogChirho.close('jump-chirho:' + cardIdChirho)}
			>{translateChirho(messagesChirho, localeStateChirho.currentChirho, 'all_words_chirho')}
			<span aria-hidden="true">↓</span></button
		>
	</footer>
</dialog>

<style>
	.word-modal-body-chirho :global(.back-to-verse-chirho) {
		position: static;
	}

	.word-details-modal-chirho {
		width: min(620px, calc(100vw - 24px));
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
	.word-details-modal-chirho::backdrop {
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
		padding: 16px 22px;
		background: #fcfcf7;
		border-bottom: 1px solid #e0e5d9;
		z-index: 1;
	}
	h2 {
		margin: 0;
		font-size: 17px;
	}
	header button {
		width: 40px;
		height: 40px;
		border: 0;
		border-radius: 50%;
		background: #eef1e8;
		color: inherit;
		font-size: 27px;
		cursor: pointer;
	}
	.word-modal-body-chirho :global(.word-card-chirho) {
		margin: 0;
		border: 0;
		box-shadow: none;
		border-radius: 0;
	}
	footer {
		padding: 0 22px 20px;
	}
	footer button {
		width: 100%;
		padding: 12px;
		border: 1px solid #c4cfbd;
		border-radius: 9px;
		color: #34503d;
		background: #f3f5ec;
		cursor: pointer;
	}
	button:focus-visible {
		outline: 3px solid #405a89;
		outline-offset: 3px;
	}
</style>
