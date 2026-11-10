<!-- For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life. — John 3:16 (KJV) -->
<script lang="ts">
	import { localeStateChirho } from '$lib/i18n-chirho/locale-state-chirho.svelte';
	import { defineCatalogueChirho, translateChirho } from '$lib/i18n-chirho/translate-chirho';
	const messagesChirho = defineCatalogueChirho({
		en: {
			translation_chirho: 'Translation',
			none_chirho: 'None',
			readers_chirho: 'Readers',
			terse_chirho: 'Terse'
		},
		es: {
			translation_chirho: 'Traducción',
			none_chirho: 'Ninguna',
			readers_chirho: 'Lectura',
			terse_chirho: 'Breve'
		}
	});
</script>

<fieldset class="meaning-display-chirho reader-display-options-chirho">
	<legend
		>{translateChirho(
			messagesChirho,
			localeStateChirho.currentChirho,
			'translation_chirho'
		)}</legend
	>
	<div>
		<label
			><input
				type="radio"
				name="translation-display-chirho"
				value="none"
				data-translation-display-chirho
				checked
				disabled
			/>{translateChirho(messagesChirho, localeStateChirho.currentChirho, 'none_chirho')}</label
		>
		<label data-translation-mode-chirho="readers" hidden
			><input
				type="radio"
				name="translation-display-chirho"
				value="readers"
				data-translation-display-chirho
				disabled
			/>{translateChirho(messagesChirho, localeStateChirho.currentChirho, 'readers_chirho')}</label
		>
		<label data-translation-mode-chirho="terse" hidden
			><input
				type="radio"
				name="translation-display-chirho"
				value="terse"
				data-translation-display-chirho
				disabled
			/>{translateChirho(messagesChirho, localeStateChirho.currentChirho, 'terse_chirho')}</label
		>
	</div>
</fieldset>
