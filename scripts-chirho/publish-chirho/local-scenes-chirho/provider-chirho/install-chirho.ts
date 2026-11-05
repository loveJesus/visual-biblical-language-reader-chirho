// For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life. — John 3:16 (KJV)
// Workflow: media-delivery-chirho.md. Exact provider bytes, one serialized catalogue/shard writer.
import { execFileSync as execFileSyncChirho } from 'node:child_process';
import { mkdir as mkdirChirho, open as openChirho } from 'node:fs/promises';
import { join as joinChirho } from 'node:path';
import type { BibleBookChirho } from '../../../../src/lib/bible-chirho/books-chirho';
import { readArtworkCatalogueChirho } from '../../r2-chirho/catalogue-chirho';
import { writeArtworkCatalogueChirho } from '../../r2-chirho/catalogue-write-chirho';
import type { ArtworkEntryChirho } from '../../r2-chirho/archive-artwork-chirho';
import { digestChirho } from '../../r2-chirho/object-store-chirho';
import { acquireLockChirho } from '../../r2_upload_watch_chirho';
import {
	loadBookChirho,
	readOwnedChirho,
	bookHomeChirho,
	MANIFEST_CHIRHO,
	PASSTHROUGH_RECIPE_CHIRHO,
	STAGE_CHIRHO,
	type CompletedChirho
} from './records-chirho';
import {
	archiveCompletedChirho,
	atomicJsonChirho,
	receiptPathChirho,
	type ReceiptChirho
} from './storage-chirho';

export function sceneForChirho(completedChirho: CompletedChirho, bookChirho: BibleBookChirho) {
	const jobChirho = completedChirho.job_chirho;
	return {
		lesson_id_chirho: jobChirho.verse_id_chirho,
		asset_path_chirho: `/assets-chirho/scenes-chirho/bible-schnell-v1-chirho/${bookChirho.slug_chirho}/chapter-${String(jobChirho.chapter_chirho).padStart(3, '0')}-chirho/${jobChirho.job_id_chirho}-chirho.webp`,
		alt_chirho: `Draft illustration intended for ${bookChirho.label_chirho} ${jobChirho.chapter_chirho}:${jobChirho.verse_id_chirho.split('.')[2]}: ${jobChirho.prompt_chirho.replace(/^Watercolor storybook illustration: /u, '').replace(/ Soft ink lines, textured paper, warm gentle light\.$/u, '')}`,
		reading_note_chirho:
			'Placeholder illustration. This imaginative study aid has not been reviewed for visual or historical accuracy.',
		art_review_chirho: 'pending',
		fallback_chirho: true,
		prompt_chirho: jobChirho.prompt_chirho,
		tool_chirho: 'runware',
		model_chirho: 'runware:100@1',
		seed_chirho: jobChirho.seed_chirho,
		width_chirho: 1024,
		height_chirho: 768,
		sha256_chirho: completedChirho.result_chirho.output_sha256_chirho,
		source_binding_chirho: {
			content_path_chirho: completedChirho.content_path_chirho,
			content_sha256_chirho: completedChirho.content_sha256_chirho,
			canonical_sha256_chirho: completedChirho.canonical_sha256_chirho,
			snapshot_sha256_chirho: jobChirho.snapshot_sha256_chirho,
			prompt_sha256_chirho: jobChirho.prompt_sha256_chirho,
			request_sha256_chirho: completedChirho.request_sha256_chirho,
			provider_webp_sha256_chirho: completedChirho.result_chirho.output_sha256_chirho,
			task_uuid_chirho: completedChirho.result_chirho.task_uuid_chirho,
			selected_journal_sha256_chirho: completedChirho.selected_journal_sha256_chirho
		}
	};
}
export type SceneChirho = ReturnType<typeof sceneForChirho>;
export function mergeScenesChirho(priorChirho: SceneChirho[], incomingChirho: SceneChirho[]) {
	if (priorChirho.length + incomingChirho.length > 54_310)
		throw new Error('Scene merge exceeds the fixed remaining-canon bound');
	const rowsChirho = new Map<string, SceneChirho>();
	for (const rowChirho of priorChirho) {
		if (rowsChirho.has(rowChirho.lesson_id_chirho))
			throw new Error('Existing scene identity repeats');
		rowsChirho.set(rowChirho.lesson_id_chirho, rowChirho);
	}
	for (const rowChirho of incomingChirho) {
		const priorRowChirho = rowsChirho.get(rowChirho.lesson_id_chirho);
		if (priorRowChirho && JSON.stringify(priorRowChirho) !== JSON.stringify(rowChirho))
			throw new Error('Refusing to replace an existing provider scene');
		if (
			rowChirho.art_review_chirho !== 'pending' ||
			rowChirho.fallback_chirho !== true ||
			rowChirho.sha256_chirho !== rowChirho.source_binding_chirho.provider_webp_sha256_chirho
		)
			throw new Error('Scene review or passthrough identity differs');
		rowsChirho.set(rowChirho.lesson_id_chirho, rowChirho);
	}
	if (rowsChirho.size > 27_155)
		throw new Error('Scene catalogue exceeds fixed remaining-canon bound');
	return [...rowsChirho.values()].sort((leftChirho, rightChirho) =>
		leftChirho.lesson_id_chirho.localeCompare(rightChirho.lesson_id_chirho, undefined, {
			numeric: true
		})
	);
}
export async function installBookChirho(
	rootChirho: string,
	bookChirho: BibleBookChirho,
	applyChirho = false,
	refreshChirho = true
) {
	const sourceChirho = await loadBookChirho(rootChirho, bookChirho);
	if (
		!sourceChirho.complete_chirho ||
		sourceChirho.completed_chirho.length !== sourceChirho.expected_chirho ||
		!sourceChirho.expected_chirho
	)
		throw new Error('Installation requires the exact completed book');
	const receiptsChirho: ReceiptChirho[] = [];
	for (const completedChirho of sourceChirho.completed_chirho) {
		if (!(await readOwnedChirho(rootChirho, receiptPathChirho(completedChirho), 32 * 1024, true)))
			throw new Error('Book scene lacks exact provider preservation');
		const resultChirho = await archiveCompletedChirho(rootChirho, completedChirho, false);
		if (resultChirho.state_chirho !== 'already_archived' || !resultChirho.receipt_chirho)
			throw new Error('Book scene lacks exact provider preservation');
		receiptsChirho.push(resultChirho.receipt_chirho);
	}
	const scenesChirho = sourceChirho.completed_chirho.map((completedChirho) =>
		sceneForChirho(completedChirho, bookChirho)
	);
	const priorBytesChirho = await readOwnedChirho(rootChirho, MANIFEST_CHIRHO, 64 * 1024 ** 2, true);
	const priorChirho = priorBytesChirho
		? JSON.parse(priorBytesChirho.toString())
		: { schema_version_chirho: 1, scenes_chirho: [] };
	if (priorChirho.schema_version_chirho !== 1 || !Array.isArray(priorChirho.scenes_chirho))
		throw new Error('Provider scene catalogue shape differs');
	const mergedChirho = mergeScenesChirho(priorChirho.scenes_chirho, scenesChirho);
	if (
		Buffer.byteLength(
			JSON.stringify({ schema_version_chirho: 1, scenes_chirho: mergedChirho }, null, '\t')
		) >
		64 * 1024 ** 2
	)
		throw new Error('Finite scene catalogue exceeds publication bound');
	if (!applyChirho)
		return {
			book_id_chirho: bookChirho.id_chirho,
			scenes_chirho: scenesChirho.length,
			state_chirho: 'would_install',
			raster_writes_chirho: 0
		};
	await mkdirChirho(joinChirho(rootChirho, 'build-chirho/r2-chirho'), { recursive: true });
	const releaseChirho = await acquireLockChirho(
		joinChirho(rootChirho, 'build-chirho/r2-chirho/artwork-archive-chirho.lock')
	);
	try {
		const catalogueChirho = await readArtworkCatalogueChirho(rootChirho);
		if (!catalogueChirho) throw new Error('Existing verified artwork catalogue is required');
		const entriesChirho = new Map(catalogueChirho.entries_chirho);
		const mappingPathChirho = 'build-chirho/delivery-media-chirho/mapping-chirho.json';
		const mappingBytesChirho = (await readOwnedChirho(
			rootChirho,
			mappingPathChirho,
			64 * 1024 ** 2
		))!;
		const mappingChirho = JSON.parse(mappingBytesChirho.toString());
		if (
			mappingChirho.schema_version_chirho !== 1 ||
			!Array.isArray(mappingChirho.entries_chirho) ||
			mappingChirho.encoder_chirho?.name_chirho !== 'cwebp'
		)
			throw new Error('Existing delivery cache identity differs');
		const mappingsChirho = new Map<string, Record<string, unknown>>(
			mappingChirho.entries_chirho.map((rowChirho: Record<string, unknown>) => [
				rowChirho.kind_chirho + ':' + rowChirho.source_sha256_chirho,
				rowChirho
			])
		);
		const proofFileChirho = await openChirho(
			joinChirho(rootChirho, 'build-chirho/r2-chirho/artwork-readbacks-chirho.jsonl'),
			'a'
		);
		try {
			for (let indexChirho = 0; indexChirho < scenesChirho.length; indexChirho++) {
				const sceneChirho = scenesChirho[indexChirho],
					proofChirho = receiptsChirho[indexChirho].object_chirho;
				const keyChirho = 'scene:' + sceneChirho.sha256_chirho;
				const previousChirho = entriesChirho.get(keyChirho);
				if (
					previousChirho &&
					(previousChirho.source_chirho.sha256_chirho !== proofChirho.sha256_chirho ||
						previousChirho.delivery_chirho.sha256_chirho !== proofChirho.sha256_chirho ||
						previousChirho.source_chirho.bytes_chirho !== proofChirho.bytes_chirho ||
						previousChirho.delivery_chirho.bytes_chirho !== proofChirho.bytes_chirho ||
						JSON.stringify(previousChirho.recipe_chirho) !==
							JSON.stringify(PASSTHROUGH_RECIPE_CHIRHO))
				)
					throw new Error('Existing artwork conflicts with provider passthrough');
				const aliasesChirho = [
					...new Set([
						...(previousChirho?.source_paths_chirho ?? []),
						sceneChirho.asset_path_chirho
					])
				].sort();
				if (aliasesChirho.length > 200)
					throw new Error('Provider aliases exceed existing catalogue bound');
				const entryChirho: ArtworkEntryChirho = {
					kind_chirho: 'scene',
					source_paths_chirho: aliasesChirho,
					source_chirho: proofChirho,
					delivery_chirho: proofChirho,
					recipe_chirho: PASSTHROUGH_RECIPE_CHIRHO
				};
				entriesChirho.set(keyChirho, entryChirho);
				const mappingRowChirho = {
					source_paths_chirho: aliasesChirho,
					source_sha256_chirho: proofChirho.sha256_chirho,
					kind_chirho: 'scene',
					delivery_path_chirho: `objects-chirho/${proofChirho.sha256_chirho.slice(0, 2)}-chirho/${proofChirho.sha256_chirho}-chirho.webp`,
					delivery_sha256_chirho: proofChirho.sha256_chirho,
					bytes_chirho: proofChirho.bytes_chirho,
					width_chirho: 1024,
					height_chirho: 768,
					recipe_chirho: PASSTHROUGH_RECIPE_CHIRHO
				};
				const priorMappingChirho = mappingsChirho.get(keyChirho);
				if (
					priorMappingChirho &&
					(priorMappingChirho.delivery_sha256_chirho !== proofChirho.sha256_chirho ||
						JSON.stringify(priorMappingChirho.recipe_chirho) !==
							JSON.stringify(PASSTHROUGH_RECIPE_CHIRHO))
				)
					throw new Error('Existing delivery cache conflicts with passthrough');
				mappingsChirho.set(keyChirho, mappingRowChirho);
				const lineChirho = JSON.stringify(proofChirho) + '\n';
				if (
					(await proofFileChirho.write(lineChirho)).bytesWritten !== Buffer.byteLength(lineChirho)
				)
					throw new Error('Provider proof append was incomplete');
			}
			await proofFileChirho.sync();
		} finally {
			await proofFileChirho.close();
		}
		await writeArtworkCatalogueChirho(rootChirho, [...entriesChirho.values()]);
		if (!(await readArtworkCatalogueChirho(rootChirho)))
			throw new Error('Updated artwork catalogue refused its readback');
		await atomicJsonChirho(rootChirho, mappingPathChirho, {
			...mappingChirho,
			entries_chirho: [...mappingsChirho.values()]
		});
		await atomicJsonChirho(rootChirho, MANIFEST_CHIRHO, {
			schema_version_chirho: 1,
			scenes_chirho: mergedChirho
		});
	} finally {
		await releaseChirho();
	}
	if (refreshChirho)
		execFileSyncChirho(
			'python3',
			['-I', '-B', 'scripts-chirho/art-chirho/refresh_sharded_media_chirho.py', '--once'],
			{ cwd: rootChirho, timeout: 120000, stdio: 'pipe' }
		);
	const markerChirho = (await readOwnedChirho(
		rootChirho,
		`${bookHomeChirho(bookChirho)}/usable-outputs-chirho.json`,
		4 * 1024 ** 2
	))!;
	const sourceManifestChirho = (await readOwnedChirho(
		rootChirho,
		`static/content-chirho/${bookChirho.slug_chirho}/manifest-chirho.json`,
		128 * 1024
	))!;
	await atomicJsonChirho(
		rootChirho,
		`${STAGE_CHIRHO}/books-chirho/${bookChirho.slug_chirho}/installed-chirho.json`,
		{
			schema_version_chirho: 1,
			state_chirho: 'installed',
			book_id_chirho: bookChirho.id_chirho,
			scenes_chirho: scenesChirho.length,
			source_manifest_sha256_chirho: digestChirho(sourceManifestChirho),
			completion_marker_sha256_chirho: digestChirho(markerChirho),
			installed_at_chirho: new Date().toISOString(),
			recompressed_chirho: false,
			raster_writes_chirho: 0
		}
	);
	return {
		book_id_chirho: bookChirho.id_chirho,
		scenes_chirho: scenesChirho.length,
		state_chirho: 'installed',
		raster_writes_chirho: 0
	};
}
