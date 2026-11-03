// For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life. — John 3:16 (KJV)
// Workflow: hosting-chirho/public-site-chirho.md. Outbound lookup only; no runtime lexicon fetch.
import verifiedChirho from '../../../data-chirho/reader-chirho/lemma-links-chirho.json';
import type { LocaleChirho } from '$lib/i18n-chirho/locale-chirho';

const LEXICON_ORIGIN_CHIRHO = 'https://lexicon-chirho.bible.systems';
const knownChirho = new Map(
	verifiedChirho.links_chirho
		.filter((rowChirho) => rowChirho.verified_chirho)
		.map((rowChirho) => [
			rowChirho.lemma_id_chirho + (rowChirho.lemma_augment_chirho ?? ''),
			rowChirho.url_chirho
		])
);

export function lexiconLinkChirho(
	tokenChirho: { lemma_id_chirho: string; lemma_augment_chirho?: string | null },
	localeChirho: LocaleChirho,
	verifiedLinksChirho: Readonly<Record<string, string>> = {}
): { href_chirho: string; kind_chirho: 'entry' | 'search' } | null {
	const matchChirho = /^([HG])([1-9][0-9]{0,3})$/u.exec(tokenChirho.lemma_id_chirho);
	const augmentChirho = tokenChirho.lemma_augment_chirho ?? '';
	if (!matchChirho || !/^[a-z]?$/u.test(augmentChirho) || (matchChirho[1] === 'G' && augmentChirho))
		return null;
	const keyChirho = tokenChirho.lemma_id_chirho + augmentChirho;
	const targetChirho = matchChirho[1] + matchChirho[2].padStart(4, '0') + augmentChirho;
	const candidateChirho = verifiedLinksChirho[keyChirho] ?? knownChirho.get(keyChirho);
	let urlChirho = new URL('/search-chirho', LEXICON_ORIGIN_CHIRHO);
	let kindChirho: 'entry' | 'search' = 'search';
	if (candidateChirho)
		try {
			const entryChirho = new URL(candidateChirho);
			if (
				entryChirho.origin === LEXICON_ORIGIN_CHIRHO &&
				!entryChirho.username &&
				!entryChirho.password &&
				entryChirho.pathname === `/lemma-chirho/${targetChirho}` &&
				!entryChirho.search &&
				!entryChirho.hash
			) {
				urlChirho = entryChirho;
				kindChirho = 'entry';
			}
		} catch {
			/* An invalid purported entry remains a search. */
		}
	if (kindChirho === 'search') urlChirho.searchParams.set('q', targetChirho);
	urlChirho.searchParams.set('lang', localeChirho === 'es' ? 'spa' : 'eng');
	return { href_chirho: urlChirho.href, kind_chirho: kindChirho };
}
