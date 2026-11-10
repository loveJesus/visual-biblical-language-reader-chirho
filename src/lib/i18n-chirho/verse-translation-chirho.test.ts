// For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life. — John 3:16 (KJV)
import { describe as describeChirho, it as itChirho, expect as expectChirho } from 'vitest';
import {
	createTranslationClientChirho,
	parseTranslationChapterChirho,
	translationsForWordsChirho
} from './verse-translation-chirho';
const contentChirho = {
	path_chirho: '/content-chirho/genesis-chirho/chapter-01-chirho.json',
	sha256_chirho: 'a'.repeat(64)
};
function chapterChirho(numberChirho = 1) {
	return {
		schema_version_chirho: 1,
		language_chirho: 'en',
		book_id_chirho: 'Gen',
		chapter_chirho: numberChirho,
		content_path_chirho: contentChirho.path_chirho,
		content_sha256_chirho: contentChirho.sha256_chirho,
		verses_chirho: {
			['Gen.' + numberChirho + '.1']: {
				readers_chirho: {
					source_id_chirho: 'source-chirho',
					words_chirho: [
						{
							token_id_chirho: 'word-chirho',
							text_chirho: 'בָּרָא',
							gloss_chirho: 'created',
							state_chirho: 'UNAPPROVED',
							source_chirho: 'IMPORT'
						}
					]
				}
			}
		}
	};
}
async function fixtureChirho() {
	const dataChirho = chapterChirho();
	const bytesChirho = new TextEncoder().encode(JSON.stringify(dataChirho));
	const hashChirho = Array.from(
		new Uint8Array(await crypto.subtle.digest('SHA-256', bytesChirho)),
		(byteChirho) => byteChirho.toString(16).padStart(2, '0')
	).join('');
	const pathChirho =
		'/glosses-chirho/editions-chirho/en-chirho/genesis-chirho/chapter-01-chirho.json';
	const manifestChirho = {
		schema_version_chirho: 1,
		languages_chirho: {
			en: {
				books_chirho: {
					Gen: {
						chapters_chirho: [
							{
								number_chirho: 1,
								path_chirho: pathChirho,
								sha256_chirho: hashChirho,
								content_path_chirho: contentChirho.path_chirho,
								content_sha256_chirho: contentChirho.sha256_chirho
							}
						]
					}
				}
			}
		}
	};
	return { dataChirho, bytesChirho, pathChirho, manifestChirho };
}
describeChirho('optional source-word translation layers', () => {
	itChirho(
		'reads verified bytes once and retains imported status and original wording',
		async () => {
			const fChirho = await fixtureChirho();
			const callsChirho: string[] = [];
			const clientChirho = createTranslationClientChirho(async (inputChirho) => {
				const urlChirho = String(inputChirho);
				callsChirho.push(urlChirho);
				return urlChirho.endsWith('manifest-chirho.json')
					? Response.json(fChirho.manifestChirho)
					: new Response(fChirho.bytesChirho);
			});
			const oneChirho = await clientChirho.chapterChirho('en', 'Gen', 1, contentChirho);
			expectChirho(
				oneChirho?.verses_chirho['Gen.1.1'].readers_chirho?.words_chirho[0].state_chirho
			).toBe('UNAPPROVED');
			expectChirho(await clientChirho.chapterChirho('en', 'Gen', 1, contentChirho)).toBe(oneChirho);
			expectChirho(callsChirho).toHaveLength(2);
		}
	);
	itChirho('withholds stale content or an absent language before fetching any layer', async () => {
		const fChirho = await fixtureChirho();
		let readsChirho = 0;
		const clientChirho = createTranslationClientChirho(async () => {
			readsChirho++;
			return Response.json(fChirho.manifestChirho);
		});
		expectChirho(await clientChirho.chapterChirho('es', 'Gen', 1, contentChirho)).toBeNull();
		expectChirho(
			await clientChirho.chapterChirho('en', 'Gen', 1, {
				...contentChirho,
				sha256_chirho: 'b'.repeat(64)
			})
		).toBeNull();
		expectChirho(readsChirho).toBe(1);
	});
	itChirho('refuses changed bytes and recovers after a later deliberate request', async () => {
		const fChirho = await fixtureChirho();
		let layerReadsChirho = 0;
		const clientChirho = createTranslationClientChirho(async (inputChirho) =>
			String(inputChirho).endsWith('manifest-chirho.json')
				? Response.json(fChirho.manifestChirho)
				: new Response(++layerReadsChirho === 1 ? 'changed' : fChirho.bytesChirho)
		);
		await expectChirho(clientChirho.chapterChirho('en', 'Gen', 1, contentChirho)).rejects.toThrow(
			'bytes changed'
		);
		expectChirho(
			(await clientChirho.chapterChirho('en', 'Gen', 1, contentChirho))?.language_chirho
		).toBe('en');
		expectChirho(layerReadsChirho).toBe(2);
	});
	itChirho('refuses an external path and a streamed body above its fixed bound', async () => {
		const fChirho = await fixtureChirho();
		fChirho.manifestChirho.languages_chirho.en.books_chirho.Gen.chapters_chirho[0].path_chirho =
			'https://other.invalid/foreign-chirho.json';
		const clientChirho = createTranslationClientChirho(async () =>
			Response.json(fChirho.manifestChirho)
		);
		await expectChirho(clientChirho.chapterChirho('en', 'Gen', 1, contentChirho)).rejects.toThrow(
			'path or hash'
		);
		fChirho.manifestChirho.languages_chirho.en.books_chirho.Gen.chapters_chirho[0].path_chirho =
			fChirho.pathChirho;
		const largeChirho = createTranslationClientChirho(async (inputChirho) =>
			String(inputChirho).endsWith('manifest-chirho.json')
				? Response.json(fChirho.manifestChirho)
				: new Response(new Uint8Array(2_000_001))
		);
		await expectChirho(largeChirho.chapterChirho('en', 'Gen', 1, contentChirho)).rejects.toThrow(
			'bound'
		);
	});
	itChirho('checks language, content identity and unique token bindings without guessing', () => {
		const dataChirho = chapterChirho();
		expectChirho(() =>
			parseTranslationChapterChirho(dataChirho, 'es', 'Gen', 1, contentChirho)
		).toThrow('other content');
		dataChirho.verses_chirho['Gen.1.1'].readers_chirho.words_chirho.push({
			...dataChirho.verses_chirho['Gen.1.1'].readers_chirho.words_chirho[0]
		});
		expectChirho(() =>
			parseTranslationChapterChirho(dataChirho, 'en', 'Gen', 1, contentChirho)
		).toThrow('word invalid');
	});
	itChirho('preserves a deliberate empty gloss, and the view requires exact ordered words', () => {
		const dataChirho = chapterChirho();
		dataChirho.verses_chirho['Gen.1.1'].readers_chirho.words_chirho[0].gloss_chirho = '';
		const parsedChirho = parseTranslationChapterChirho(dataChirho, 'en', 'Gen', 1, contentChirho);
		const verseChirho = parsedChirho.verses_chirho['Gen.1.1'];
		expectChirho(
			translationsForWordsChirho(verseChirho, [{ id_chirho: 'word-chirho', text_chirho: 'בָּרָא' }])
				?.readers_chirho?.words_chirho[0].gloss_chirho
		).toBe('');
		expectChirho(
			translationsForWordsChirho(verseChirho, [
				{ id_chirho: 'other-chirho', text_chirho: 'בָּרָא' }
			])
		).toBeNull();
		expectChirho(
			translationsForWordsChirho(verseChirho, [
				{ id_chirho: 'word-chirho', text_chirho: 'בָּרָאּ' }
			])
		).toBeNull();
	});
});
