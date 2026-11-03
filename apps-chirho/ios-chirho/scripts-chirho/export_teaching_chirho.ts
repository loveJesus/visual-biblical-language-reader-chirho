// For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life. — John 3:16 (KJV)

// Exports the website's teaching tables and book identities for the native iOS reader, so both
// readers share one source. Reads the web modules read-only and writes only inside this app.
//   bun apps-chirho/ios-chirho/scripts-chirho/export_teaching_chirho.ts           # write
//   bun apps-chirho/ios-chirho/scripts-chirho/export_teaching_chirho.ts --check   # exit 1 on drift
import { readFileSync, renameSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import * as prettierChirho from 'prettier';
import { legendRowsChirho } from '../../../src/lib/domain-chirho/legend-chirho';
import {
	verbConstructionNamesChirho,
	verbFormMarkerChirho,
	verbFormNamesChirho,
	verbStemNumberChirho
} from '../../../src/lib/domain-chirho/verb-forms-chirho';
import { greekCueGroupsChirho } from '../../../src/lib/domain-chirho/greek-cues-chirho';
import { greekKeyRowsChirho } from '../../../src/lib/reader-chirho/greek-chirho/greek-key-chirho';
import {
	legendItemTextChirho,
	legendRowTextChirho
} from '../../../src/lib/i18n-chirho/legend-messages-chirho';
import { termChirho } from '../../../src/lib/i18n-chirho/labels-chirho';

const hereChirho = dirname(fileURLToPath(import.meta.url));
const repoChirho = join(hereChirho, '..', '..', '..');
const resourcesChirho = join(
	hereChirho,
	'..',
	'HinnehCoreChirho',
	'Sources',
	'HinnehCoreChirho',
	'ResourcesChirho'
);

// Stem names the source may use; only those with a local teaching number are exported.
const stemCandidatesChirho = ['qal', 'niphal', 'piel', 'pual', 'hiphil', 'hophal', 'hithpael'];
// Grammar values whose Spanish term the reader shows (Hebrew categories, Greek parse values).
const termCandidatesChirho = [
	...['noun', 'verb', 'adjective', 'particle', 'pronoun', 'article', 'unknown', 'na'],
	...['masculine', 'feminine', 'common', 'neuter', 'singular', 'plural', 'dual'],
	...['absolute', 'construct', 'adverb', 'aramaic', 'cond', 'conjunction', 'hebrew'],
	...['correlative pronoun', 'demonstrative pronoun', 'indefinite pronoun'],
	...['interrogative pronoun', 'numeral indeclinable', 'personal pronoun', 'possessive pronoun'],
	...['preposition', 'proper noun indeclinable', 'reciprocal pronoun', 'reflexive pronoun'],
	...['relative pronoun'],
	...Object.values(greekCueGroupsChirho).flatMap((groupChirho) =>
		Object.keys(groupChirho.definitions_chirho)
	)
];

function legendChirho(
	rowsChirho: readonly {
		label_chirho: string;
		items_chirho: readonly {
			id_chirho: string;
			label_chirho: string;
			help_chirho: string;
			style_chirho: string;
			source_chirho?: string;
		}[];
	}[]
) {
	return rowsChirho.map((rowChirho) => ({
		label_en_chirho: rowChirho.label_chirho,
		label_es_chirho: legendRowTextChirho(rowChirho.label_chirho, 'es').label_chirho,
		items_chirho: rowChirho.items_chirho.map((itemChirho) => {
			const spanishChirho = legendItemTextChirho(itemChirho, 'es');
			return {
				id_chirho: itemChirho.id_chirho,
				style_chirho: itemChirho.style_chirho,
				source_chirho: itemChirho.source_chirho ?? null,
				label_en_chirho: itemChirho.label_chirho,
				help_en_chirho: itemChirho.help_chirho,
				label_es_chirho: spanishChirho.label_chirho,
				help_es_chirho: spanishChirho.help_chirho,
				spanish_available_chirho: spanishChirho.lang_chirho === 'es'
			};
		})
	}));
}

function teachingChirho() {
	const constructionsChirho = Object.fromEntries(
		verbConstructionNamesChirho.map((constructionChirho) => {
			const formChirho = verbFormNamesChirho.find(
				(candidateChirho) => verbFormMarkerChirho(candidateChirho, constructionChirho) !== ''
			);
			if (!formChirho) throw new Error(`No underlying form for ${constructionChirho}`);
			return [
				constructionChirho,
				{
					form_chirho: formChirho,
					marker_chirho: verbFormMarkerChirho(formChirho, constructionChirho)
				}
			];
		})
	);
	return {
		schema_version_chirho: 1,
		hebrew_stems_chirho: Object.fromEntries(
			stemCandidatesChirho
				.map((stemChirho) => [stemChirho, verbStemNumberChirho(stemChirho)])
				.filter(([, numberChirho]) => numberChirho !== '')
		),
		hebrew_forms_chirho: Object.fromEntries(
			verbFormNamesChirho.map((formChirho) => [formChirho, verbFormMarkerChirho(formChirho)])
		),
		hebrew_constructions_chirho: constructionsChirho,
		greek_cues_chirho: Object.fromEntries(
			Object.entries(greekCueGroupsChirho).map(([groupChirho, recordChirho]) => [
				groupChirho,
				Object.fromEntries(
					Object.entries(recordChirho.definitions_chirho).map(([valueChirho, definitionChirho]) => [
						valueChirho,
						definitionChirho.code_chirho
					])
				)
			])
		),
		terms_es_chirho: Object.fromEntries(
			[...new Set(termCandidatesChirho)].map((valueChirho) => [
				valueChirho,
				termChirho(valueChirho, 'es')
			])
		),
		legend_hebrew_chirho: legendChirho(legendRowsChirho),
		legend_greek_chirho: legendChirho(greekKeyRowsChirho)
	};
}

// Book identities only, in the public bootstrap's shape (no internal source file names).
function booksChirho() {
	const registryChirho = JSON.parse(
		readFileSync(join(repoChirho, 'config-chirho', 'bible-chirho', 'books-chirho.json'), 'utf8')
	) as { schema_version_chirho: number; books_chirho: Record<string, unknown>[] };
	return {
		schema_version_chirho: registryChirho.schema_version_chirho,
		books_chirho: registryChirho.books_chirho.map((bookChirho) => ({
			id_chirho: bookChirho.id_chirho,
			label_chirho: bookChirho.label_chirho,
			spanish_label_chirho: bookChirho.spanish_label_chirho,
			slug_chirho: bookChirho.slug_chirho,
			language_chirho: bookChirho.language_chirho,
			testament_chirho: bookChirho.testament_chirho,
			chapter_count_chirho: bookChirho.chapter_count_chirho,
			featured_chirho: bookChirho.featured_chirho
		}))
	};
}

async function formattedChirho(pathChirho: string, valueChirho: unknown): Promise<string> {
	const optionsChirho = (await prettierChirho.resolveConfig(pathChirho)) ?? {};
	return prettierChirho.format(JSON.stringify(valueChirho), {
		...optionsChirho,
		plugins: [],
		filepath: pathChirho
	});
}

const outputsChirho = new Map<string, string>([
	[
		join(resourcesChirho, 'teaching-chirho.json'),
		await formattedChirho(join(resourcesChirho, 'teaching-chirho.json'), teachingChirho())
	],
	[
		join(resourcesChirho, 'books-fallback-chirho.json'),
		await formattedChirho(join(resourcesChirho, 'books-fallback-chirho.json'), booksChirho())
	]
]);

if (process.argv.includes('--check')) {
	const driftChirho = [...outputsChirho].filter(([pathChirho, textChirho]) => {
		try {
			return readFileSync(pathChirho, 'utf8') !== textChirho;
		} catch {
			return true;
		}
	});
	for (const [pathChirho] of driftChirho) console.error(`drift: ${pathChirho}`);
	if (!driftChirho.length) console.log(`up to date: ${outputsChirho.size} files`);
	process.exit(driftChirho.length ? 1 : 0);
}
for (const [pathChirho, textChirho] of outputsChirho) {
	writeFileSync(`${pathChirho}.tmp-chirho`, textChirho, { flag: 'wx' });
	renameSync(`${pathChirho}.tmp-chirho`, pathChirho);
}
console.log(`wrote ${outputsChirho.size} files`);
