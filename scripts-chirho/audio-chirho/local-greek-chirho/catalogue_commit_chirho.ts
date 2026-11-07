// For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life. — John 3:16 (KJV)
// Workflow: verse-media-chirho.md. Recover a partial multi-file catalogue commit without overwriting a foreign edit.
import {
	readFile as readFileChirho,
	lstat as lstatChirho,
	realpath as realpathChirho
} from 'node:fs/promises';
import { join as joinChirho } from 'node:path';
import { sha256Chirho, writeChirho } from '../audition_chirho';
import { isBibleChapterPathChirho } from '../../../src/lib/bible-chirho/books-chirho';
export interface CatalogueWriteChirho {
	path_chirho: string;
	before_sha256_chirho: string;
	text_chirho: string;
}
interface CommitChirho {
	binding_sha256_chirho: string;
	writes_chirho: CatalogueWriteChirho[];
}
async function optionalChirho(pathChirho: string) {
	return readFileChirho(pathChirho).catch((errorChirho: NodeJS.ErrnoException) => {
		if (errorChirho.code === 'ENOENT') return null;
		throw errorChirho;
	});
}
async function executeChirho(rootChirho: string, homeChirho: string, commitChirho: CommitChirho) {
	if (
		!/^[a-f0-9]{64}$/.test(commitChirho.binding_sha256_chirho) ||
		!Array.isArray(commitChirho.writes_chirho) ||
		commitChirho.writes_chirho.length > 31 ||
		new Set(commitChirho.writes_chirho.map((rowChirho) => rowChirho.path_chirho)).size !==
			commitChirho.writes_chirho.length
	)
		throw Error('Catalogue commit scope differs');
	for (const rowChirho of commitChirho.writes_chirho) {
		if (
			!(
				rowChirho.path_chirho === 'static/audio-chirho/manifest-chirho.json' ||
				(rowChirho.path_chirho.startsWith('static/') &&
					isBibleChapterPathChirho(rowChirho.path_chirho.slice(7), 'audio-chirho/'))
			) ||
			!/^[a-f0-9]{64}$/.test(rowChirho.before_sha256_chirho) ||
			typeof rowChirho.text_chirho !== 'string' ||
			Buffer.byteLength(rowChirho.text_chirho) > 2_000_000
		)
			throw Error('Catalogue write path/size refused');
		const pathChirho = joinChirho(rootChirho, rowChirho.path_chirho);
		const infoChirho = await lstatChirho(pathChirho);
		if (
			!infoChirho.isFile() ||
			infoChirho.isSymbolicLink() ||
			(await realpathChirho(pathChirho)) !== pathChirho
		)
			throw Error('Redirected catalogue write');
		const currentChirho = sha256Chirho(await readFileChirho(pathChirho));
		if (
			![rowChirho.before_sha256_chirho, sha256Chirho(rowChirho.text_chirho)].includes(currentChirho)
		)
			throw Error('Foreign catalogue edit requires reconciliation');
	}
	// Every destination is preflighted before the first write. The audio manifest is deliberately last.
	for (const rowChirho of commitChirho.writes_chirho)
		if (
			sha256Chirho(await readFileChirho(joinChirho(rootChirho, rowChirho.path_chirho))) !==
			sha256Chirho(rowChirho.text_chirho)
		)
			await writeChirho(joinChirho(rootChirho, rowChirho.path_chirho), rowChirho.text_chirho);
	await writeChirho(
		joinChirho(homeChirho, 'catalogue-complete-chirho.json'),
		JSON.stringify({
			binding_sha256_chirho: commitChirho.binding_sha256_chirho,
			commit_sha256_chirho: sha256Chirho(JSON.stringify(commitChirho))
		}) + '\n'
	);
}

export async function recoverCatalogueChirho(
	rootChirho: string,
	homeChirho: string,
	bindingChirho: string
): Promise<boolean> {
	const bytesChirho = await optionalChirho(joinChirho(homeChirho, 'catalogue-commit-chirho.json'));
	if (
		!bytesChirho ||
		(await optionalChirho(joinChirho(homeChirho, 'catalogue-complete-chirho.json')))
	)
		return false;
	if (bytesChirho.length > 32 * 1024 ** 2) throw Error('Catalogue commit oversized');
	const commitChirho = JSON.parse(bytesChirho.toString()) as CommitChirho;
	if (commitChirho.binding_sha256_chirho !== bindingChirho)
		throw Error('Prior catalogue commit belongs to another input');
	await executeChirho(rootChirho, homeChirho, commitChirho);
	return true;
}

export async function commitCatalogueChirho(
	rootChirho: string,
	homeChirho: string,
	bindingChirho: string,
	writesChirho: CatalogueWriteChirho[]
) {
	if (await recoverCatalogueChirho(rootChirho, homeChirho, bindingChirho)) return;
	const commitChirho: CommitChirho = {
		binding_sha256_chirho: bindingChirho,
		writes_chirho: writesChirho
	};
	const pathChirho = joinChirho(homeChirho, 'catalogue-commit-chirho.json');
	const priorChirho = await optionalChirho(pathChirho);
	if (priorChirho) {
		// A completed run may be repeated only as a no-op; later catalogue additions are preserved.
		for (const rowChirho of writesChirho)
			if (
				sha256Chirho(await readFileChirho(joinChirho(rootChirho, rowChirho.path_chirho))) !==
				sha256Chirho(rowChirho.text_chirho)
			)
				throw Error('Completed catalogue import cannot be repurposed');
		return;
	}
	await writeChirho(pathChirho, JSON.stringify(commitChirho) + '\n');
	await executeChirho(rootChirho, homeChirho, commitChirho);
}
