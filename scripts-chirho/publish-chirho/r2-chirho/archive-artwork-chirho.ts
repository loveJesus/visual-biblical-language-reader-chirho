// For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life. — John 3:16 (KJV)
// Workflow: media-delivery-chirho.md. Verify original/delivery R2 bytes before any local retirement.
import {
	readFile as readFileChirho,
	stat as statChirho,
	mkdir as mkdirChirho,
	open as openChirho
} from 'node:fs/promises';
import { join as joinChirho } from 'node:path';
import { readMediaRecordsChirho } from '../build_release_chirho';
import {
	deliveryEntriesChirho,
	deliveryProblemChirho,
	type DeliveryEntryChirho,
	type MediaRecordChirho
} from '../release_rules_chirho';
import { readWebpChirho } from '../webp_chirho';
import { acquireLockChirho } from '../r2_upload_watch_chirho';
import { writeArtworkCatalogueChirho } from './catalogue-write-chirho';
import { readArtworkCatalogueChirho } from './catalogue-chirho';
import { digestChirho, objectRequestChirho } from './object-store-chirho';

export const ARTWORK_HOME_CHIRHO = 'data-chirho/delivery-chirho/artwork-chirho';
const RECEIPTS_CHIRHO = 'build-chirho/r2-chirho/artwork-readbacks-chirho.jsonl';
interface ObjectProofChirho {
	key_chirho: string;
	sha256_chirho: string;
	bytes_chirho: number;
	width_chirho: number;
	height_chirho: number;
	lossy_chirho: boolean;
	verified_at_chirho: string;
}
export interface ArtworkEntryChirho {
	kind_chirho: 'scene' | 'icon';
	source_paths_chirho: string[];
	source_chirho: ObjectProofChirho;
	delivery_chirho: ObjectProofChirho;
	recipe_chirho: Record<string, unknown>;
}
export function lossyWebpChirho(bytesChirho: Uint8Array) {
	const viewChirho = new DataView(
		bytesChirho.buffer,
		bytesChirho.byteOffset,
		bytesChirho.byteLength
	);
	for (let offsetChirho = 12; offsetChirho + 8 <= bytesChirho.length;) {
		const tagChirho = String.fromCharCode(...bytesChirho.subarray(offsetChirho, offsetChirho + 4));
		const sizeChirho = viewChirho.getUint32(offsetChirho + 4, true);
		if (offsetChirho + 8 + sizeChirho > bytesChirho.length) throw new Error('WebP chunk truncated');
		if (tagChirho === 'VP8 ') return true;
		if (tagChirho === 'VP8L') return false;
		offsetChirho += 8 + sizeChirho + (sizeChirho % 2);
	}
	throw new Error('WebP has no image chunk');
}
export async function archiveArtworkChirho(rootChirho: string, applyChirho = false) {
	const problemsChirho: string[] = [];
	const recordsChirho = await readMediaRecordsChirho(rootChirho, problemsChirho);
	const mappingChirho = JSON.parse(
		await readFileChirho(
			joinChirho(rootChirho, 'build-chirho/delivery-media-chirho/mapping-chirho.json'),
			'utf8'
		)
	);
	const deliveriesChirho = deliveryEntriesChirho(mappingChirho, problemsChirho);
	if (problemsChirho.length) throw new Error(problemsChirho.join('; '));
	const groupsChirho = new Map<
		string,
		{
			record_chirho: MediaRecordChirho;
			delivery_chirho: DeliveryEntryChirho;
			paths_chirho: Set<string>;
		}
	>();
	for (const recordChirho of recordsChirho) {
		const keyChirho = recordChirho.kind_chirho + ':' + recordChirho.sha256_chirho;
		const deliveryChirho = deliveriesChirho.get(keyChirho);
		if (!deliveryChirho) throw new Error('Declared artwork lacks delivery mapping');
		const groupChirho = groupsChirho.get(keyChirho) ?? {
			record_chirho: recordChirho,
			delivery_chirho: deliveryChirho,
			paths_chirho: new Set<string>()
		};
		if (
			groupChirho.record_chirho.width_chirho !== recordChirho.width_chirho ||
			groupChirho.record_chirho.height_chirho !== recordChirho.height_chirho
		)
			throw new Error('Source aliases disagree');
		groupChirho.paths_chirho.add(recordChirho.asset_path_chirho);
		groupsChirho.set(keyChirho, groupChirho);
	}
	if (groupsChirho.size > 100_000) throw new Error('Artwork catalogue needs cold retirement');
	if (!applyChirho)
		return {
			source_groups_chirho: groupsChirho.size,
			maximum_objects_chirho: groupsChirho.size * 2,
			remote_reads_chirho: 0,
			local_deletions_chirho: 0
		};
	await mkdirChirho(joinChirho(rootChirho, 'build-chirho/r2-chirho'), { recursive: true });
	const releaseChirho = await acquireLockChirho(
		joinChirho(rootChirho, 'build-chirho/r2-chirho/artwork-archive-chirho.lock')
	);
	let descriptorChirho: Awaited<ReturnType<typeof openChirho>> | undefined;
	try {
		const catalogueChirho = await readArtworkCatalogueChirho(rootChirho);
		const receiptPathChirho = joinChirho(rootChirho, RECEIPTS_CHIRHO);
		const priorTextChirho = await readFileChirho(receiptPathChirho, 'utf8').catch(() => '');
		if (Buffer.byteLength(priorTextChirho) > 64 * 1024 ** 2)
			throw new Error('Artwork receipts need cold retirement');
		const proofsChirho = new Map<string, ObjectProofChirho>();
		for (const lineChirho of priorTextChirho.split('\n')) {
			if (!lineChirho.trim()) continue;
			try {
				const rowChirho = JSON.parse(lineChirho) as ObjectProofChirho;
				if (
					rowChirho.key_chirho === `media-chirho/sha256-chirho/${rowChirho.sha256_chirho}.webp` &&
					Number.isSafeInteger(rowChirho.bytes_chirho) &&
					rowChirho.bytes_chirho > 0 &&
					rowChirho.width_chirho > 0 &&
					rowChirho.height_chirho > 0 &&
					typeof rowChirho.lossy_chirho === 'boolean' &&
					typeof rowChirho.verified_at_chirho === 'string'
				)
					proofsChirho.set(rowChirho.key_chirho, rowChirho);
			} catch {
				/* A torn tail is independently read back again. */
			}
		}
		descriptorChirho = await openChirho(receiptPathChirho, 'a');
		const activeChirho = new Map<string, Promise<ObjectProofChirho>>();
		let fetchedChirho = 0,
			uploadedChirho = 0;
		async function verifyChirho(
			shaChirho: string,
			pathChirho: string,
			widthChirho: number,
			heightChirho: number,
			expectedBytesChirho: number,
			requireLossyChirho = false
		) {
			const keyChirho = `media-chirho/sha256-chirho/${shaChirho}.webp`;
			const knownChirho = proofsChirho.get(keyChirho);
			if (knownChirho) {
				if (
					knownChirho.bytes_chirho !== expectedBytesChirho ||
					knownChirho.width_chirho !== widthChirho ||
					knownChirho.height_chirho !== heightChirho ||
					(requireLossyChirho && !knownChirho.lossy_chirho)
				)
					throw new Error('Remote proof conflicts with current artwork');
				return knownChirho;
			}
			if (activeChirho.has(keyChirho)) {
				const sharedChirho = await activeChirho.get(keyChirho)!;
				if (
					sharedChirho.bytes_chirho !== expectedBytesChirho ||
					sharedChirho.width_chirho !== widthChirho ||
					sharedChirho.height_chirho !== heightChirho ||
					(requireLossyChirho && !sharedChirho.lossy_chirho)
				)
					throw new Error('Shared remote proof conflicts with artwork facts');
				return sharedChirho;
			}
			const promiseChirho = (async () => {
				let responseChirho = await objectRequestChirho('GET', keyChirho);
				if (responseChirho.status === 404) {
					const localChirho = await readFileChirho(pathChirho);
					if (digestChirho(localChirho) !== shaChirho || localChirho.length !== expectedBytesChirho)
						throw new Error('Missing remote artwork has changed local bytes');
					const putChirho = await objectRequestChirho('PUT', keyChirho, localChirho);
					await putChirho.arrayBuffer();
					if (!putChirho.ok) throw new Error(`Artwork archive PUT refused (${putChirho.status})`);
					uploadedChirho++;
					responseChirho = await objectRequestChirho('GET', keyChirho);
				}
				if (!responseChirho.ok) {
					await responseChirho.arrayBuffer();
					throw new Error(`Artwork readback refused (${responseChirho.status})`);
				}
				const bytesChirho = new Uint8Array(await responseChirho.arrayBuffer());
				fetchedChirho++;
				if (bytesChirho.length !== expectedBytesChirho || digestChirho(bytesChirho) !== shaChirho)
					throw new Error('Artwork remote readback hash/length differs');
				const infoChirho = readWebpChirho(bytesChirho),
					lossyChirho = lossyWebpChirho(bytesChirho);
				if (
					infoChirho.width_chirho !== widthChirho ||
					infoChirho.height_chirho !== heightChirho ||
					(requireLossyChirho && !lossyChirho)
				)
					throw new Error('Artwork remote WebP dimensions/codec differ');
				const proofChirho = {
					key_chirho: keyChirho,
					sha256_chirho: shaChirho,
					bytes_chirho: bytesChirho.length,
					width_chirho: widthChirho,
					height_chirho: heightChirho,
					lossy_chirho: lossyChirho,
					verified_at_chirho: new Date().toISOString()
				};
				const lineChirho = JSON.stringify(proofChirho) + '\n';
				const writtenChirho = await descriptorChirho!.write(lineChirho);
				if (writtenChirho.bytesWritten !== Buffer.byteLength(lineChirho))
					throw new Error('Artwork receipt write was incomplete');
				await descriptorChirho!.sync();
				proofsChirho.set(keyChirho, proofChirho);
				return proofChirho;
			})();
			activeChirho.set(keyChirho, promiseChirho);
			return promiseChirho;
		}
		const itemsChirho = [...groupsChirho.values()],
			entriesChirho: ArtworkEntryChirho[] = [];
		let nextChirho = 0,
			completedChirho = 0,
			failureChirho: unknown;
		await Promise.all(
			Array.from({ length: 6 }, async () => {
				while (!failureChirho) {
					const indexChirho = nextChirho++;
					if (indexChirho >= itemsChirho.length) return;
					try {
						const itemChirho = itemsChirho[indexChirho],
							recordChirho = itemChirho.record_chirho,
							deliveryChirho = itemChirho.delivery_chirho;
						const sourcePathChirho = joinChirho(
							rootChirho,
							'static',
							recordChirho.asset_path_chirho
						);
						const existingChirho = catalogueChirho?.entries_chirho.get(
							recordChirho.kind_chirho + ':' + recordChirho.sha256_chirho
						);
						const localStatChirho = await statChirho(sourcePathChirho).catch(
							(errorChirho: NodeJS.ErrnoException) => {
								if (errorChirho.code === 'ENOENT') return null;
								throw errorChirho;
							}
						);
						if (
							!localStatChirho &&
							(!existingChirho ||
								!existingChirho.source_paths_chirho.includes(recordChirho.asset_path_chirho))
						)
							throw new Error('Missing local artwork has no exact remote proof');
						const sourceSizeChirho =
							localStatChirho?.size ?? existingChirho!.source_chirho.bytes_chirho;
						if (
							localStatChirho &&
							digestChirho(await readFileChirho(sourcePathChirho)) !== recordChirho.sha256_chirho
						)
							throw new Error('Local source changed after remote verification');
						const sourceChirho = await verifyChirho(
							recordChirho.sha256_chirho,
							sourcePathChirho,
							recordChirho.width_chirho,
							recordChirho.height_chirho,
							sourceSizeChirho
						);
						const deliveryPathChirho = joinChirho(
							rootChirho,
							'build-chirho/delivery-media-chirho',
							deliveryChirho.delivery_path_chirho
						);
						const deliveryBytesChirho = await readFileChirho(deliveryPathChirho).catch(
							(errorChirho: NodeJS.ErrnoException) => {
								if (errorChirho.code === 'ENOENT') return null;
								throw errorChirho;
							}
						);
						if (deliveryBytesChirho) {
							const problemChirho = deliveryProblemChirho(deliveryChirho, deliveryBytesChirho);
							if (problemChirho) throw new Error(problemChirho);
						} else if (
							!existingChirho ||
							existingChirho.delivery_chirho.sha256_chirho !== deliveryChirho.delivery_sha256_chirho
						)
							throw new Error('Missing delivery has no matching remote proof');
						const remoteDeliveryChirho = await verifyChirho(
							deliveryChirho.delivery_sha256_chirho,
							deliveryPathChirho,
							deliveryChirho.width_chirho,
							deliveryChirho.height_chirho,
							deliveryChirho.bytes_chirho,
							true
						);
						entriesChirho.push({
							kind_chirho: recordChirho.kind_chirho,
							source_paths_chirho: [...itemChirho.paths_chirho].sort(),
							source_chirho: sourceChirho,
							delivery_chirho: remoteDeliveryChirho,
							recipe_chirho: deliveryChirho.recipe_chirho
						});
						completedChirho++;
						if (completedChirho % 100 === 0)
							console.log(`remote artwork verified ${completedChirho}/${itemsChirho.length}`);
					} catch (errorChirho) {
						failureChirho = errorChirho;
					}
				}
			})
		);
		if (failureChirho) throw failureChirho;
		await writeArtworkCatalogueChirho(rootChirho, entriesChirho);
		return {
			source_groups_chirho: entriesChirho.length,
			remote_objects_verified_chirho: proofsChirho.size,
			fetched_chirho: fetchedChirho,
			uploaded_chirho: uploadedChirho,
			local_deletions_chirho: 0
		};
	} finally {
		await descriptorChirho?.close();
		await releaseChirho();
	}
}
if (import.meta.main)
	console.log(
		JSON.stringify(
			await archiveArtworkChirho(process.cwd(), process.argv.includes('--verify-remote-chirho'))
		)
	);
