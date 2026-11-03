// For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life. — John 3:16 (KJV)
// Workflow: media-delivery-chirho.md. Small, hash-bound remote facts; no raster or network reads.
import { readFile as readFileChirho } from 'node:fs/promises';
import { join as joinChirho } from 'node:path';
import type { ArtworkEntryChirho } from './archive-artwork-chirho';
import { RefusalChirho, sha256Chirho, type MediaRecordChirho } from '../release_rules_chirho';
const HOME_CHIRHO = 'data-chirho/delivery-chirho/artwork-chirho';
const SHA_CHIRHO = /^[a-f0-9]{64}$/;
export interface ArtworkCatalogueChirho {
	entries_chirho: Map<string, ArtworkEntryChirho>;
	index_sha256_chirho: string;
}
function validObjectChirho(valueChirho: ArtworkEntryChirho['source_chirho']) {
	return (
		valueChirho &&
		SHA_CHIRHO.test(valueChirho.sha256_chirho) &&
		valueChirho.key_chirho === `media-chirho/sha256-chirho/${valueChirho.sha256_chirho}.webp` &&
		Number.isSafeInteger(valueChirho.bytes_chirho) &&
		valueChirho.bytes_chirho > 0 &&
		valueChirho.bytes_chirho <= 25 * 1024 ** 2 &&
		Number.isSafeInteger(valueChirho.width_chirho) &&
		Number.isSafeInteger(valueChirho.height_chirho) &&
		valueChirho.width_chirho > 0 &&
		valueChirho.height_chirho > 0 &&
		valueChirho.width_chirho <= 4096 &&
		valueChirho.height_chirho <= 4096 &&
		typeof valueChirho.lossy_chirho === 'boolean' &&
		Number.isFinite(Date.parse(valueChirho.verified_at_chirho))
	);
}
export async function readArtworkCatalogueChirho(
	rootChirho: string
): Promise<ArtworkCatalogueChirho | null> {
	const indexBytesChirho = await readFileChirho(
		joinChirho(rootChirho, HOME_CHIRHO, 'index-chirho.json')
	).catch((errorChirho: NodeJS.ErrnoException) => {
		if (errorChirho.code === 'ENOENT') return null;
		throw errorChirho;
	});
	if (!indexBytesChirho) return null;
	if (indexBytesChirho.length > 128 * 1024) throw new Error('Artwork index oversized');
	const indexChirho = JSON.parse(indexBytesChirho.toString());
	if (
		indexChirho.schema_version_chirho !== 1 ||
		indexChirho.bucket_chirho !== 'hinneh-media-chirho' ||
		!Array.isArray(indexChirho.shards_chirho) ||
		indexChirho.shards_chirho.length > 256 ||
		!Number.isSafeInteger(indexChirho.entry_count_chirho) ||
		indexChirho.entry_count_chirho > 100_000
	)
		throw new Error('Artwork index scope differs');
	const entriesChirho = new Map<string, ArtworkEntryChirho>(),
		pathsChirho = new Set<string>();
	for (const shardChirho of indexChirho.shards_chirho) {
		if (
			!/^objects-chirho\/[a-f0-9]{2}-chirho\.json$/.test(shardChirho.path_chirho) ||
			pathsChirho.has(shardChirho.path_chirho) ||
			!SHA_CHIRHO.test(shardChirho.sha256_chirho)
		)
			throw new Error('Artwork shard path/hash invalid');
		pathsChirho.add(shardChirho.path_chirho);
		const bytesChirho = await readFileChirho(
			joinChirho(rootChirho, HOME_CHIRHO, shardChirho.path_chirho)
		);
		if (
			bytesChirho.length > 2 * 1024 ** 2 ||
			sha256Chirho(bytesChirho) !== shardChirho.sha256_chirho
		)
			throw new Error('Artwork shard changed');
		const documentChirho = JSON.parse(bytesChirho.toString());
		if (
			documentChirho.schema_version_chirho !== 1 ||
			!Array.isArray(documentChirho.entries_chirho) ||
			documentChirho.entries_chirho.length !== shardChirho.entries_chirho
		)
			throw new Error('Artwork shard count differs');
		for (const entryChirho of documentChirho.entries_chirho as ArtworkEntryChirho[]) {
			if (
				!['scene', 'icon'].includes(entryChirho.kind_chirho) ||
				!validObjectChirho(entryChirho.source_chirho) ||
				!validObjectChirho(entryChirho.delivery_chirho) ||
				!entryChirho.delivery_chirho.lossy_chirho ||
				entryChirho.delivery_chirho.bytes_chirho > 2 * 1024 ** 2 ||
				!Array.isArray(entryChirho.source_paths_chirho) ||
				!entryChirho.source_paths_chirho.length ||
				entryChirho.source_paths_chirho.length > 200 ||
				entryChirho.source_paths_chirho.some(
					(pathChirho) =>
						!/^\/assets-chirho\/[a-zA-Z0-9_./-]+\.webp$/.test(pathChirho) ||
						pathChirho.split('/').some((partChirho) => partChirho === '..' || partChirho === '.')
				) ||
				(entryChirho.kind_chirho === 'icon'
					? Math.max(
							entryChirho.delivery_chirho.width_chirho,
							entryChirho.delivery_chirho.height_chirho
						) > 128
					: entryChirho.delivery_chirho.width_chirho > 1200) ||
				!entryChirho.recipe_chirho
			)
				throw new Error('Artwork remote facts invalid');
			if (
				!shardChirho.path_chirho.startsWith(
					`objects-chirho/${entryChirho.source_chirho.sha256_chirho.slice(0, 2)}-`
				)
			)
				throw new Error('Artwork object filed under wrong prefix');
			const keyChirho = entryChirho.kind_chirho + ':' + entryChirho.source_chirho.sha256_chirho;
			if (entriesChirho.has(keyChirho)) throw new Error('Artwork object duplicated');
			entriesChirho.set(keyChirho, entryChirho);
		}
	}
	if (entriesChirho.size !== indexChirho.entry_count_chirho)
		throw new Error('Artwork index count differs');
	return { entries_chirho: entriesChirho, index_sha256_chirho: sha256Chirho(indexBytesChirho) };
}
export function checkedArtworkChirho(
	catalogueChirho: ArtworkCatalogueChirho,
	recordChirho: MediaRecordChirho
) {
	const entryChirho = catalogueChirho.entries_chirho.get(
		recordChirho.kind_chirho + ':' + recordChirho.sha256_chirho
	);
	if (
		!entryChirho ||
		!entryChirho.source_paths_chirho.includes(recordChirho.asset_path_chirho) ||
		entryChirho.source_chirho.width_chirho !== recordChirho.width_chirho ||
		entryChirho.source_chirho.height_chirho !== recordChirho.height_chirho
	)
		throw new RefusalChirho(['Declared artwork lacks its exact verified remote source']);
	return entryChirho;
}
export function deliveredRecordChirho(
	recordChirho: MediaRecordChirho,
	entryChirho: ArtworkEntryChirho
): MediaRecordChirho {
	return {
		...recordChirho,
		sha256_chirho: entryChirho.delivery_chirho.sha256_chirho,
		width_chirho: entryChirho.delivery_chirho.width_chirho,
		height_chirho: entryChirho.delivery_chirho.height_chirho
	};
}
