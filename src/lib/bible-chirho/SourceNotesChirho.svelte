<!-- For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life. — John 3:16 (KJV) -->
<script lang="ts">
	import { localeStateChirho } from '../i18n-chirho/locale-state-chirho.svelte';
	let {
		notesChirho = []
	}: { notesChirho?: { kind_chirho: string; code_chirho?: string; text_chirho: string }[] } =
		$props();
</script>

{#if notesChirho.length}
	<details class="source-notes-chirho">
		<summary
			>{localeStateChirho.currentChirho === 'es'
				? 'Notas de la edición original'
				: 'Source-edition notes'}</summary
		>
		<ul>
			{#each notesChirho as noteChirho, indexChirho (indexChirho)}
				<li>
					<span lang="en">{noteChirho.code_chirho ?? noteChirho.kind_chirho}: </span><span
						dir="auto"
						lang={noteChirho.kind_chirho === 'qere_source' || noteChirho.kind_chirho === 'paragraph'
							? 'he'
							: 'en'}>{noteChirho.text_chirho}</span
					>
				</li>
			{/each}
		</ul>
	</details>
{/if}

<style>
	.source-notes-chirho {
		margin: 0.75rem 0;
		color: #526757;
		font-size: 0.85rem;
	}
	summary {
		cursor: pointer;
	}
	li {
		margin: 0.35rem 0;
		overflow-wrap: anywhere;
	}
</style>
