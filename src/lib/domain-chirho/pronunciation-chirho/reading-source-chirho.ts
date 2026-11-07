// For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life. — John 3:16 (KJV)
// Workflow: verse-media-chirho.md. Human readings carry source provenance, never synthesis claims.
import { bibleBookChirho } from '../../bible-chirho/books-chirho';
import registryChirho from '../../../../config-chirho/bible-chirho/books-chirho.json';

export const BEERI_ATTRIBUTION_CHIRHO =
	"Hebrew reading by Rabbi Dan Be'eri (CC BY-SA 3.0), compiled at archive.org; chapter files and verse timings from Global Bible Tools";
export const BEERI_LICENSE_URL_CHIRHO = 'https://creativecommons.org/licenses/by-sa/3.0/';
const BEERI_BOOKS_CHIRHO = new Set([
	'Gen',
	'Exod',
	'Lev',
	'Num',
	'Deut',
	'Josh',
	'Judg',
	'Ruth',
	'1Sam',
	'2Sam',
	'1Kgs',
	'2Kgs',
	'Ezra',
	'Esth',
	'Job',
	'Ps',
	'Prov',
	'Eccl',
	'Song',
	'Isa',
	'Lam',
	'Dan',
	'Obad',
	'Jonah',
	'Nah',
	'Hab',
	'Zeph',
	'Hag',
	'Zech',
	'Mal'
]);
export interface ReadingSourceChirho {
	kind_chirho: 'human';
	reader_id_chirho: 'rdb-chirho';
	gbt_id_chirho: string;
	package_sha256_chirho: string;
	chapter_sha256_chirho: string;
	timings_sha256_chirho: string;
	start_chirho: number;
	end_chirho: number;
	chapter_duration_chirho: number;
	attribution_chirho: string;
	license_chirho: 'CC BY-SA 3.0';
	license_url_chirho: string;
}

/** Validate the complete declared source window; a partial or foreign identity is not human audio. */
export function validReadingSourceChirho(
	valueChirho: unknown,
	lessonIdChirho: string
): valueChirho is ReadingSourceChirho {
	if (!valueChirho || typeof valueChirho !== 'object' || Array.isArray(valueChirho)) return false;
	const sourceChirho = valueChirho as Record<string, unknown>;
	const [bookIdChirho] = lessonIdChirho.split('.');
	let bookChirho: ReturnType<typeof bibleBookChirho>;
	try {
		bookChirho = bibleBookChirho(bookIdChirho);
	} catch {
		return false;
	}
	const gbtBookChirho = registryChirho.books_chirho
		.find((rowChirho) => rowChirho.id_chirho === bookIdChirho)
		?.gbt_file_chirho.split('-')[1]
		?.split('.')[0];
	return (
		bookChirho.language_chirho === 'he' &&
		BEERI_BOOKS_CHIRHO.has(bookIdChirho) &&
		sourceChirho.kind_chirho === 'human' &&
		sourceChirho.reader_id_chirho === 'rdb-chirho' &&
		sourceChirho.gbt_id_chirho === `OT/RDB/${gbtBookChirho}` &&
		['package_sha256_chirho', 'chapter_sha256_chirho', 'timings_sha256_chirho'].every(
			(keyChirho) =>
				typeof sourceChirho[keyChirho] === 'string' &&
				/^[a-f0-9]{64}$/.test(sourceChirho[keyChirho] as string)
		) &&
		typeof sourceChirho.start_chirho === 'number' &&
		Number.isFinite(sourceChirho.start_chirho) &&
		sourceChirho.start_chirho >= 0 &&
		typeof sourceChirho.end_chirho === 'number' &&
		Number.isFinite(sourceChirho.end_chirho) &&
		sourceChirho.end_chirho > sourceChirho.start_chirho &&
		sourceChirho.end_chirho - sourceChirho.start_chirho <= 120 &&
		typeof sourceChirho.chapter_duration_chirho === 'number' &&
		Number.isFinite(sourceChirho.chapter_duration_chirho) &&
		sourceChirho.chapter_duration_chirho > 0 &&
		sourceChirho.chapter_duration_chirho <= 7200 &&
		sourceChirho.end_chirho <= sourceChirho.chapter_duration_chirho &&
		sourceChirho.attribution_chirho === BEERI_ATTRIBUTION_CHIRHO &&
		sourceChirho.license_chirho === 'CC BY-SA 3.0' &&
		sourceChirho.license_url_chirho === BEERI_LICENSE_URL_CHIRHO
	);
}

/** A human verse cannot borrow an AI recipe/word window or claim another narrator's identity. */
export function validHumanRecordingChirho(valueChirho: unknown): boolean {
	if (!valueChirho || typeof valueChirho !== 'object' || Array.isArray(valueChirho)) return false;
	const clipChirho = valueChirho as Record<string, unknown>;
	if (
		typeof clipChirho.lesson_id_chirho !== 'string' ||
		typeof clipChirho.duration_chirho !== 'number'
	)
		return false;
	const sourceChirho = clipChirho.reading_source_chirho;
	return (
		validReadingSourceChirho(sourceChirho, clipChirho.lesson_id_chirho) &&
		clipChirho.token_id_chirho === null &&
		clipChirho.language_chirho === 'he' &&
		clipChirho.pronunciation_chirho === 'israeli_hebrew' &&
		clipChirho.voice_name_chirho === "Rabbi Dan Be'eri" &&
		Math.abs(clipChirho.duration_chirho - (sourceChirho.end_chirho - sourceChirho.start_chirho)) <=
			0.15 &&
		[
			clipChirho.ipa_chirho,
			clipChirho.synthesis_text_chirho,
			clipChirho.recipe_id_chirho,
			clipChirho.start_offset_chirho,
			clipChirho.end_offset_chirho
		].every((valueChirho) => valueChirho === undefined)
	);
}
