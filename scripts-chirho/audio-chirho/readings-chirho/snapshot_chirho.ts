// For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life. — John 3:16 (KJV)
// Workflow: verse-media-chirho.md. Freeze canonical and spoken identities before local audio cuts.
import {
	mkdir as mkdirChirho,
	readFile as readFileChirho,
	writeFile as writeFileChirho
} from 'node:fs/promises';
import { resolve as resolveChirho, join as joinChirho } from 'node:path';
import { createHash as createHashChirho } from 'node:crypto';
import booksChirho from '../../../config-chirho/bible-chirho/books-chirho.json';
import { spokenVerseChirho } from '../../../src/lib/domain-chirho/pronunciation-chirho';

const hashChirho = (bytesChirho: Uint8Array | string) =>
	createHashChirho('sha256').update(bytesChirho).digest('hex');
const [folderChirho, bookIdChirho] = process.argv.slice(2);
const bookChirho = booksChirho.books_chirho.find(
	(rowChirho) => rowChirho.id_chirho === bookIdChirho && rowChirho.language_chirho === 'he'
);
if (!folderChirho || !bookChirho || process.argv.length !== 4)
	throw Error('Expected output folder and Hebrew book id');
const rootChirho = resolveChirho('.');
const outputChirho = resolveChirho(folderChirho);
if (!outputChirho.startsWith(joinChirho(rootChirho, 'workspace-chirho/audio-chirho/')))
	throw Error('Snapshot output is outside the audio workspace');
await mkdirChirho(outputChirho, { recursive: true });
const manifestPathChirho = `content-chirho/${bookChirho.slug_chirho}/manifest-chirho.json`;
const manifestBytesChirho = await readFileChirho(
	joinChirho(rootChirho, 'static', manifestPathChirho)
);
const manifestChirho = JSON.parse(manifestBytesChirho.toString('utf8'));
const chaptersChirho = [];
for (const entryChirho of manifestChirho.chapters_chirho as {
	number_chirho: number;
	path_chirho: string;
	sha256_chirho: string;
}[]) {
	const expectedPathChirho = `/content-chirho/${bookChirho.slug_chirho}/chapter-${String(entryChirho.number_chirho).padStart(2, '0')}-chirho.json`;
	if (entryChirho.path_chirho !== expectedPathChirho) throw Error('Chapter path differs');
	const bytesChirho = await readFileChirho(
		joinChirho(rootChirho, 'static', entryChirho.path_chirho)
	);
	if (bytesChirho.length > 4 * 1024 * 1024 || hashChirho(bytesChirho) !== entryChirho.sha256_chirho)
		throw Error('Chapter hash differs');
	const chapterChirho = JSON.parse(bytesChirho.toString('utf8'));
	if (
		chapterChirho.book_id_chirho !== bookIdChirho ||
		chapterChirho.chapter_chirho !== entryChirho.number_chirho
	)
		throw Error('Chapter identity differs');
	const versesChirho = (
		chapterChirho.verses_chirho as Parameters<typeof spokenVerseChirho>[0][]
	).map((verseChirho) => ({
		lesson_id_chirho: (verseChirho as typeof verseChirho & { id_chirho: string }).id_chirho,
		canonical_text_chirho: verseChirho.canonical_text_chirho,
		canonical_sha256_chirho: hashChirho(verseChirho.canonical_text_chirho),
		text_chirho: spokenVerseChirho(verseChirho),
		word_count_chirho: verseChirho.tokens_chirho.length
	}));
	const nameChirho = `chapter-${String(entryChirho.number_chirho).padStart(3, '0')}-chirho.json`;
	const bodyChirho =
		JSON.stringify(
			{
				book_id_chirho: bookIdChirho,
				chapter_chirho: entryChirho.number_chirho,
				content_path_chirho: expectedPathChirho,
				content_sha256_chirho: entryChirho.sha256_chirho,
				verses_chirho: versesChirho
			},
			null,
			2
		) + '\n';
	const targetChirho = joinChirho(outputChirho, nameChirho);
	const previousChirho = await readFileChirho(targetChirho).catch(
		(errorChirho: NodeJS.ErrnoException) => {
			if (errorChirho.code === 'ENOENT') return null;
			throw errorChirho;
		}
	);
	if (previousChirho && !previousChirho.equals(Buffer.from(bodyChirho)))
		throw Error('An existing snapshot changed');
	if (!previousChirho) await writeFileChirho(targetChirho, bodyChirho, { flag: 'wx', mode: 0o600 });
	chaptersChirho.push({
		chapter_chirho: entryChirho.number_chirho,
		path_chirho: nameChirho,
		sha256_chirho: hashChirho(bodyChirho)
	});
}
const bodyChirho =
	JSON.stringify(
		{
			book_chirho: bookChirho,
			content_manifest_sha256_chirho: hashChirho(manifestBytesChirho),
			chapters_chirho: chaptersChirho
		},
		null,
		2
	) + '\n';
const pathChirho = joinChirho(outputChirho, 'index-chirho.json');
const previousChirho = await readFileChirho(pathChirho).catch(
	(errorChirho: NodeJS.ErrnoException) => {
		if (errorChirho.code === 'ENOENT') return null;
		throw errorChirho;
	}
);
if (previousChirho && !previousChirho.equals(Buffer.from(bodyChirho)))
	throw Error('Snapshot index changed');
if (!previousChirho) await writeFileChirho(pathChirho, bodyChirho, { flag: 'wx', mode: 0o600 });
console.log(
	JSON.stringify({
		book_chirho: bookIdChirho,
		chapters_chirho: chaptersChirho.length,
		snapshot_sha256_chirho: hashChirho(bodyChirho)
	})
);
