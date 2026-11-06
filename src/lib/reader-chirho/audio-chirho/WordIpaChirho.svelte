<!-- For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life. — John 3:16 (KJV) -->
<script lang="ts">
	import type { TokenChirho } from '$lib/domain-chirho/lesson-chirho';
	import type { GreekTokenChirho } from '$lib/domain-chirho/greek-chirho';
	import { spokenWordChirho } from '$lib/domain-chirho/pronunciation-chirho';
	import { divineNameReadingChirho } from '$lib/domain-chirho/pronunciation-chirho/divine-name-chirho';
	import { ipaNoteChirho } from '$lib/domain-chirho/pronunciation-chirho/ipa-trial-chirho';
	import {
		wordPhoneticsChirho,
		qerePhoneticsChirho
	} from '$lib/domain-chirho/pronunciation-chirho/hebrew-chirho/word-phonetics-chirho';
	import { greekWordIpaChirho } from '$lib/domain-chirho/pronunciation-chirho/greek-ipa-chirho';
	let {
		tokenChirho,
		languageChirho
	}: { tokenChirho: TokenChirho | GreekTokenChirho; languageChirho: 'he' | 'grc' } = $props();
	const spokenChirho = $derived(spokenWordChirho(tokenChirho));
	const valuesChirho = $derived.by(() => {
		if (languageChirho === 'grc')
			return (['modern', 'modern_aspirates', 'erasmian'] as const).map((profileChirho) => ({
				profile_chirho: profileChirho,
				ipa_chirho: greekWordIpaChirho(spokenChirho, profileChirho)
			}));
		let ipaChirho: string | null = null;
		if (!(
			'source_language_chirho' in tokenChirho && tokenChirho.source_language_chirho === 'arc'
		)) {
			const divineChirho = divineNameReadingChirho(tokenChirho);
			ipaChirho = divineChirho ? null : (ipaNoteChirho(tokenChirho)?.ipa_chirho ?? null);
			if (!ipaChirho)
				try {
					// Read the complete prefixed form, not just the bare traditional Name.
					const phoneticsChirho =
						'qere_chirho' in tokenChirho &&
						tokenChirho.qere_chirho?.length &&
						/\s/u.test(spokenChirho)
							? qerePhoneticsChirho
							: wordPhoneticsChirho;
					ipaChirho = phoneticsChirho(
						divineChirho?.analysis_text_chirho ?? spokenChirho
					).ipa_chirho;
				} catch {
					/* Unresolved stress or vowels stay explicit. */
				}
		}
		return [{ profile_chirho: 'he', ipa_chirho: ipaChirho }];
	});
</script>

<span
	class="word-ipa-chirho"
	data-word-ipa-chirho
	data-ipa-token-chirho={tokenChirho.id_chirho}
	data-ipa-text-chirho={spokenChirho}
	data-ipa-language-chirho={languageChirho}
	data-ipa-values-chirho={JSON.stringify(valuesChirho)}
	data-annotation-chirho
	dir="ltr"
	lang={languageChirho === 'he' ? 'he-fonipa' : 'grc-fonipa'}
	hidden
></span>

<style>
	.word-ipa-chirho {
		max-width: 12rem;
		margin: 3px 0 0;
		color: #465547;
		font:
			13px/1.5 'Charis SIL',
			'DejaVu Sans',
			sans-serif;
		text-align: center;
		overflow-wrap: anywhere;
		unicode-bidi: isolate;
	}
	.word-ipa-chirho[hidden] {
		display: none;
	}
</style>
