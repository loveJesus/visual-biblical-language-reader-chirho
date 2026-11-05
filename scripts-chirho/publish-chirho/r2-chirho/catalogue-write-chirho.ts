// For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life. — John 3:16 (KJV)
// Workflow: media-delivery-chirho.md. Call only under the sole artwork archive writer lock.
import { readFile as readFileChirho } from 'node:fs/promises';
import { join as joinChirho } from 'node:path';
import type { ArtworkEntryChirho } from './archive-artwork-chirho';
import { writeChirho } from '../../audio-chirho/audition_chirho';
import { digestChirho } from './object-store-chirho';

export async function writeArtworkCatalogueChirho(
	rootChirho: string,
	entriesChirho: ArtworkEntryChirho[]
) {
	if (
		!entriesChirho.length ||
		entriesChirho.length > 100_000 ||
		new Set(
			entriesChirho.map(
				(entryChirho) => entryChirho.kind_chirho + ':' + entryChirho.source_chirho.sha256_chirho
			)
		).size !== entriesChirho.length
	)
		throw new Error('Artwork catalogue size or identity differs');
	const homeChirho = joinChirho(rootChirho, 'data-chirho/delivery-chirho/artwork-chirho');
	const shardsChirho = new Map<string, ArtworkEntryChirho[]>();
	for (const entryChirho of entriesChirho) {
		const prefixChirho = entryChirho.source_chirho.sha256_chirho.slice(0, 2);
		if (!/^[a-f0-9]{2}$/u.test(prefixChirho)) throw new Error('Artwork prefix differs');
		const rowsChirho = shardsChirho.get(prefixChirho) ?? [];
		rowsChirho.push(entryChirho);
		shardsChirho.set(prefixChirho, rowsChirho);
	}
	const indexRowsChirho = [];
	for (const [prefixChirho, rowsChirho] of [...shardsChirho].sort()) {
		rowsChirho.sort((leftChirho, rightChirho) =>
			(leftChirho.kind_chirho + leftChirho.source_chirho.sha256_chirho).localeCompare(
				rightChirho.kind_chirho + rightChirho.source_chirho.sha256_chirho
			)
		);
		const bytesChirho =
			JSON.stringify({ schema_version_chirho: 1, entries_chirho: rowsChirho }, null, 2) + '\n';
		if (Buffer.byteLength(bytesChirho) > 2 * 1024 ** 2)
			throw new Error('Artwork shard needs cold retirement');
		const pathChirho = `objects-chirho/${prefixChirho}-chirho.json`;
		if (
			(await readFileChirho(joinChirho(homeChirho, pathChirho), 'utf8').catch(() => '')) !==
			bytesChirho
		)
			await writeChirho(joinChirho(homeChirho, pathChirho), bytesChirho);
		indexRowsChirho.push({
			path_chirho: pathChirho,
			sha256_chirho: digestChirho(bytesChirho),
			entries_chirho: rowsChirho.length
		});
	}
	const indexChirho = {
		schema_version_chirho: 1,
		bucket_chirho: 'hinneh-media-chirho',
		verified_at_chirho: entriesChirho.reduce(
			(latestChirho, entryChirho) =>
				[
					latestChirho,
					entryChirho.source_chirho.verified_at_chirho,
					entryChirho.delivery_chirho.verified_at_chirho
				]
					.sort()
					.at(-1)!,
			''
		),
		entry_count_chirho: entriesChirho.length,
		shards_chirho: indexRowsChirho
	};
	const textChirho = JSON.stringify(indexChirho, null, 2) + '\n';
	const pathChirho = joinChirho(homeChirho, 'index-chirho.json');
	if ((await readFileChirho(pathChirho, 'utf8').catch(() => '')) !== textChirho)
		await writeChirho(pathChirho, textChirho);
}
