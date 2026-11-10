<!-- For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life. — John 3:16 (KJV) -->
<script lang="ts">
	import { audioTChirho } from '../audio-chirho/audio-messages-chirho';
	import MeaningDisplayChirho from './MeaningDisplayChirho.svelte';

	let { verseIdChirho }: { verseIdChirho: string } = $props();
</script>

<div class="verse-display-chirho">
	<div class="verse-display-options-chirho">
		<fieldset
			class="phonetic-options-chirho reader-display-options-chirho"
			aria-label={audioTChirho('phonetic_display_chirho')}
		>
			<legend>{audioTChirho('phonetic_show_chirho')}</legend>
			<div>
				{#each ['none', 'ipa', 'transliteration'] as choiceChirho (choiceChirho)}
					<label>
						<input
							type="radio"
							name="phonetic-{verseIdChirho}-chirho"
							value={choiceChirho}
							data-phonetic-choice-chirho
							data-show-ipa-chirho={choiceChirho === 'ipa' ? true : undefined}
							checked={choiceChirho === 'none'}
							disabled
						/>
						{audioTChirho(
							choiceChirho === 'none'
								? 'phonetic_none_chirho'
								: choiceChirho === 'ipa'
									? 'phonetic_ipa_chirho'
									: 'phonetic_transliteration_chirho'
						)}
					</label>
				{/each}
			</div>
		</fieldset>
		<MeaningDisplayChirho />
	</div>
	<p class="small-note-chirho" data-ipa-guide-chirho hidden>{audioTChirho('ipa_guide_chirho')}</p>
	<p class="small-note-chirho" data-transliteration-guide-chirho hidden>
		{audioTChirho('transliteration_unavailable_chirho')}
	</p>
</div>

<style>
	.verse-display-chirho {
		border-top: 1px solid #dbe0d4;
		margin-top: 16px;
		padding-top: 14px;
	}
	.verse-display-options-chirho {
		display: flex;
		flex-wrap: wrap;
		align-items: start;
		gap: 12px 24px;
	}
	.verse-display-chirho .small-note-chirho {
		margin: 8px 0 0;
	}
</style>
