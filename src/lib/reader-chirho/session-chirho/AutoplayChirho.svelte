<!-- For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life. — John 3:16 (KJV) -->
<script lang="ts">
	import { localeStateChirho } from '$lib/i18n-chirho/locale-state-chirho.svelte';
	let {
		enabledChirho,
		onChangeChirho
	}: { enabledChirho: boolean; onChangeChirho: (enabledChirho: boolean) => void } = $props();
	const spanishChirho = $derived(localeStateChirho.currentChirho === 'es');
</script>

<div class="autoplay-choice-chirho">
	<label
		><input
			type="checkbox"
			role="switch"
			checked={enabledChirho}
			onchange={(eventChirho) => onChangeChirho(eventChirho.currentTarget.checked)}
		/><span>{spanishChirho ? 'Reproducción automática' : 'Autoplay'}</span></label
	>
	<details>
		<summary>{spanishChirho ? '¿Problemas?' : 'Problems?'}</summary>
		<div class="autoplay-help-chirho">
			<p>
				{spanishChirho
					? 'Al cambiar de versículo, reproduce el video disponible o la grabación. La página se abre en silencio. Su navegador puede pedir permiso para reproducir sonido.'
					: 'When you change verse, play the available video or recording. The page opens quietly. Your browser may require permission to play sound.'}
			</p>
			<ul>
				<li>
					<strong>Safari (Mac):</strong>
					{spanishChirho
						? 'Safari → Ajustes de hinneh.us… → Reproducción automática → Permitir toda la reproducción automática.'
						: 'Safari → Settings for hinneh.us… → Auto-Play → Allow All Auto-Play.'}
				</li>
				<li>
					<strong>Firefox:</strong>
					{spanishChirho
						? 'Abra el permiso de reproducción automática junto a la dirección y permita audio y video.'
						: 'Open the autoplay permission beside the address and allow audio and video.'}
				</li>
				<li>
					<strong>Chrome / Edge:</strong>
					{spanishChirho
						? 'Pulse Reproducir una vez. El navegador puede exigir una primera interacción.'
						: 'Choose Play once. The browser may require a first interaction.'}
				</li>
			</ul>
			<p>
				{spanishChirho
					? 'Si el navegador lo bloquea, puede pulsar Reproducir manualmente.'
					: 'If your browser blocks autoplay, you can still choose Play yourself.'}
			</p>
		</div>
	</details>
</div>

<style>
	.autoplay-choice-chirho {
		min-width: 0;
		max-width: 100%;
	}
	label {
		display: flex;
		align-items: center;
		gap: 8px;
		min-height: 38px;
		color: #36513e;
		font-size: 13px;
		font-weight: 600;
		cursor: pointer;
	}
	input {
		width: 18px;
		height: 18px;
		accent-color: #36513e;
		flex-shrink: 0;
	}
	summary {
		width: fit-content;
		color: #586a55;
		font-size: 11px;
		text-decoration: underline;
		text-underline-offset: 3px;
		cursor: pointer;
		padding: 4px 0;
	}
	.autoplay-help-chirho {
		max-width: 420px;
		margin-top: 8px;
		padding: 12px 14px;
		border: 1px solid #d3dccd;
		border-radius: 10px;
		background: #f3f5ed;
		color: #455541;
		font-size: 12px;
		line-height: 1.6;
		overflow-wrap: anywhere;
	}
	p {
		margin: 0;
	}
	ul {
		padding-left: 18px;
		margin: 8px 0;
	}
	li + li {
		margin-top: 6px;
	}
	input:focus-visible,
	summary:focus-visible {
		outline: 3px solid #405a89;
		outline-offset: 3px;
	}
</style>
