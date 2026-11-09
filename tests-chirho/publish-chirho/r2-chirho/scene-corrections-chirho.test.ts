// For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life. — John 3:16 (KJV)
import {
	afterEach as afterEachChirho,
	describe as describeChirho,
	expect as expectChirho,
	test as testChirho
} from 'vitest';
import {
	mkdtemp as mkdtempChirho,
	mkdir as mkdirChirho,
	readFile as readFileChirho,
	rm as rmChirho,
	writeFile as writeFileChirho,
	symlink as symlinkChirho
} from 'node:fs/promises';
import { tmpdir as tmpdirChirho } from 'node:os';
import { dirname as dirnameChirho, join as joinChirho, resolve as resolveChirho } from 'node:path';
import { spawnSync as spawnSyncChirho } from 'node:child_process';
import {
	readEffectiveMediaDocumentsChirho,
	sceneRecordJsonChirho,
	sceneCorrectionSignatureChirho,
	SCENE_CORRECTIONS_PATH_CHIRHO,
	sceneCorrectionInputPathsChirho
} from '../../../scripts-chirho/publish-chirho/r2-chirho/scene-corrections-chirho';
import { sha256Chirho } from '../../../scripts-chirho/publish-chirho/release_rules_chirho';
import { readMediaRecordsChirho } from '../../../scripts-chirho/publish-chirho/build_release_chirho';
import {
	overlayRemoteArtworkChirho,
	remoteMediaChirho
} from '../../../scripts-chirho/publish-chirho/r2-chirho/release-artwork-chirho';
import {
	snapshotArtworkInputsChirho,
	copySnapshotChirho,
	MEDIA_INPUT_PATTERN_CHIRHO
} from '../../../scripts-chirho/publish-chirho/preview_snapshot_chirho';
import { manifestSignatureChirho } from '../../../scripts-chirho/publish-chirho/r2_upload_watch_chirho';

interface SceneChirho {
	lesson_id_chirho: string;
	asset_path_chirho: string;
	sha256_chirho: string;
	width_chirho: number;
	height_chirho: number;
	art_review_chirho: string;
	alt_chirho: string;
	reading_note_chirho: string;
	[keyChirho: string]: unknown;
}
interface ObjectProofChirho {
	sha256_chirho: string;
	width_chirho: number;
	height_chirho: number;
	[keyChirho: string]: unknown;
}
interface ArchiveEntryChirho {
	source_chirho: ObjectProofChirho;
	delivery_chirho: ObjectProofChirho;
	[keyChirho: string]: unknown;
}
interface FixtureChirho {
	chapter_text_chirho: string;
	catalogue_chirho: {
		corrections_chirho: {
			target_document_chirho: string;
			content_path_chirho: string;
			content_sha256_chirho: string;
			base_record_sha256_chirho: string;
			base_record_chirho: SceneChirho;
			replacement_record_chirho: SceneChirho;
			[keyChirho: string]: unknown;
		}[];
		[keyChirho: string]: unknown;
	};
	documents_chirho: {
		name_chirho: string;
		document_chirho: { scenes_chirho: SceneChirho[]; [keyChirho: string]: unknown };
	}[];
	archive_entries_chirho: ArchiveEntryChirho[];
}
const fixturePathChirho = resolveChirho(
	'tests-chirho/fixtures-chirho/art-chirho/scene-corrections-chirho.json'
);
const rootsChirho: string[] = [];
afterEachChirho(async () => {
	for (const rootChirho of rootsChirho.splice(0))
		await rmChirho(rootChirho, { recursive: true, force: true });
});
async function jsonChirho(rootChirho: string, pathChirho: string, valueChirho: unknown) {
	await mkdirChirho(dirnameChirho(joinChirho(rootChirho, pathChirho)), { recursive: true });
	const bytesChirho = Buffer.from(JSON.stringify(valueChirho, null, 2) + '\n');
	await writeFileChirho(joinChirho(rootChirho, pathChirho), bytesChirho);
	return bytesChirho;
}
async function setupChirho() {
	const fixtureChirho: FixtureChirho = JSON.parse(await readFileChirho(fixturePathChirho, 'utf8'));
	const rootChirho = await mkdtempChirho(joinChirho(tmpdirChirho(), 'scene-corrections-chirho-'));
	rootsChirho.push(rootChirho);
	for (const documentChirho of fixtureChirho.documents_chirho)
		await jsonChirho(
			rootChirho,
			'data-chirho/media-chirho/' + documentChirho.name_chirho,
			documentChirho.document_chirho
		);
	await jsonChirho(rootChirho, SCENE_CORRECTIONS_PATH_CHIRHO, fixtureChirho.catalogue_chirho);
	const correctionChirho = fixtureChirho.catalogue_chirho.corrections_chirho[0];
	const contentPathChirho = 'static' + correctionChirho.content_path_chirho;
	await mkdirChirho(dirnameChirho(joinChirho(rootChirho, contentPathChirho)), { recursive: true });
	await writeFileChirho(
		joinChirho(rootChirho, contentPathChirho),
		fixtureChirho.chapter_text_chirho
	);
	await jsonChirho(
		rootChirho,
		contentPathChirho.replace(/chapter-01-chirho\.json$/u, 'manifest-chirho.json'),
		{
			book_id_chirho: '1Cor',
			chapters_chirho: [
				{
					number_chirho: 1,
					verse_count_chirho: 1,
					path_chirho: correctionChirho.content_path_chirho,
					sha256_chirho: correctionChirho.content_sha256_chirho
				}
			]
		}
	);
	await archiveChirho(rootChirho, fixtureChirho.archive_entries_chirho);
	return { rootChirho, fixtureChirho, correctionChirho };
}
async function archiveChirho(rootChirho: string, entriesChirho: ArchiveEntryChirho[]) {
	const homeChirho = 'data-chirho/delivery-chirho/artwork-chirho';
	const byPrefixChirho = new Map<string, ArchiveEntryChirho[]>();
	for (const entryChirho of entriesChirho) {
		const prefixChirho = entryChirho.source_chirho.sha256_chirho.slice(0, 2);
		byPrefixChirho.set(prefixChirho, [...(byPrefixChirho.get(prefixChirho) ?? []), entryChirho]);
	}
	const shardsChirho = [];
	for (const [prefixChirho, rowsChirho] of byPrefixChirho) {
		const pathChirho = `objects-chirho/${prefixChirho}-chirho.json`;
		const bytesChirho = await jsonChirho(rootChirho, homeChirho + '/' + pathChirho, {
			schema_version_chirho: 1,
			entries_chirho: rowsChirho
		});
		shardsChirho.push({
			path_chirho: pathChirho,
			entries_chirho: rowsChirho.length,
			sha256_chirho: sha256Chirho(bytesChirho)
		});
	}
	await jsonChirho(rootChirho, homeChirho + '/index-chirho.json', {
		schema_version_chirho: 1,
		bucket_chirho: 'hinneh-media-chirho',
		entry_count_chirho: entriesChirho.length,
		shards_chirho: shardsChirho
	});
}
function pythonChirho(rootChirho: string) {
	const codeChirho =
		'import importlib.util,json,sys; s=importlib.util.spec_from_file_location("correction_chirho",sys.argv[2]); m=importlib.util.module_from_spec(s); s.loader.exec_module(m); print(json.dumps(m.read_effective_media_documents_chirho(sys.argv[1]),ensure_ascii=False))';
	const resultChirho = spawnSyncChirho(
		'python3',
		[
			'-I',
			'-c',
			codeChirho,
			rootChirho,
			resolveChirho('scripts-chirho/art-chirho/recovery-chirho/scene_corrections_chirho.py')
		],
		{ encoding: 'utf8' }
	);
	expectChirho(resultChirho.status, resultChirho.stderr).toBe(0);
	return JSON.parse(resultChirho.stdout);
}

describeChirho('exact-base scene corrections', () => {
	testChirho('refuses a linked correction input before it can be accepted', async () => {
		const { rootChirho, fixtureChirho } = await setupChirho();
		const outsideChirho = await mkdtempChirho(
			joinChirho(tmpdirChirho(), 'correction-outside-chirho-')
		);
		rootsChirho.push(outsideChirho);
		const outsidePathChirho = joinChirho(outsideChirho, 'catalogue-chirho.json');
		await writeFileChirho(outsidePathChirho, JSON.stringify(fixtureChirho.catalogue_chirho));
		await rmChirho(joinChirho(rootChirho, SCENE_CORRECTIONS_PATH_CHIRHO));
		await symlinkChirho(outsidePathChirho, joinChirho(rootChirho, SCENE_CORRECTIONS_PATH_CHIRHO));
		await expectChirho(readEffectiveMediaDocumentsChirho(rootChirho)).rejects.toThrow(
			'bounded regular file'
		);
	});

	testChirho(
		'refuses correction chains and a replacement path already used by another scene',
		async () => {
			const { rootChirho, fixtureChirho, correctionChirho } = await setupChirho();
			const chainChirho = structuredClone(correctionChirho);
			chainChirho.id_chirho = 'second-correction-chirho';
			chainChirho.lesson_id_chirho = 'Gen.1.1';
			chainChirho.base_record_chirho = structuredClone(correctionChirho.replacement_record_chirho);
			chainChirho.base_record_chirho.lesson_id_chirho = 'Gen.1.1';
			chainChirho.base_record_sha256_chirho = sha256Chirho(
				sceneRecordJsonChirho(chainChirho.base_record_chirho)
			);
			chainChirho.replacement_record_chirho = {
				...chainChirho.base_record_chirho,
				asset_path_chirho: '/assets-chirho/scenes-chirho/third-chirho.webp',
				sha256_chirho: 'c'.repeat(64)
			};
			fixtureChirho.catalogue_chirho.corrections_chirho.push(chainChirho);
			await jsonChirho(rootChirho, SCENE_CORRECTIONS_PATH_CHIRHO, fixtureChirho.catalogue_chirho);
			await expectChirho(readEffectiveMediaDocumentsChirho(rootChirho)).rejects.toThrow('chains');
			fixtureChirho.catalogue_chirho.corrections_chirho.pop();
			await jsonChirho(rootChirho, SCENE_CORRECTIONS_PATH_CHIRHO, fixtureChirho.catalogue_chirho);
			fixtureChirho.documents_chirho[0].document_chirho.scenes_chirho.push({
				...correctionChirho.replacement_record_chirho,
				lesson_id_chirho: 'Gen.1.2'
			});
			await jsonChirho(
				rootChirho,
				correctionChirho.target_document_chirho,
				fixtureChirho.documents_chirho[0].document_chirho
			);
			await expectChirho(readEffectiveMediaDocumentsChirho(rootChirho)).rejects.toThrow(
				'another scene'
			);
		}
	);
	testChirho(
		'canonical Unicode scalars stay exact even if source-byte pins are updated',
		async () => {
			const { rootChirho, fixtureChirho, correctionChirho } = await setupChirho();
			const chapterChirho = JSON.parse(fixtureChirho.chapter_text_chirho);
			const oldCanonicalChirho = chapterChirho.verses_chirho[0].canonical_text_chirho;
			chapterChirho.verses_chirho[0].canonical_text_chirho = oldCanonicalChirho.normalize('NFD');
			expectChirho(chapterChirho.verses_chirho[0].canonical_text_chirho).not.toBe(
				oldCanonicalChirho
			);
			const bytesChirho = await jsonChirho(
				rootChirho,
				'static' + correctionChirho.content_path_chirho,
				chapterChirho
			);
			correctionChirho.content_sha256_chirho = sha256Chirho(bytesChirho);
			for (const sceneChirho of [
				correctionChirho.base_record_chirho,
				correctionChirho.replacement_record_chirho
			])
				(sceneChirho.source_binding_chirho as Record<string, unknown>).content_sha256_chirho =
					correctionChirho.content_sha256_chirho;
			correctionChirho.base_record_sha256_chirho = sha256Chirho(
				sceneRecordJsonChirho(correctionChirho.base_record_chirho)
			);
			await jsonChirho(rootChirho, SCENE_CORRECTIONS_PATH_CHIRHO, fixtureChirho.catalogue_chirho);
			await expectChirho(readEffectiveMediaDocumentsChirho(rootChirho)).rejects.toThrow(
				'canonical verse identity'
			);
		}
	);

	testChirho(
		'the actual build consumer selects only the replacement and retains the old asset without a scene selector',
		async () => {
			const { rootChirho, correctionChirho, fixtureChirho } = await setupChirho();
			const reasonsChirho: string[] = [];
			const recordsChirho = await readMediaRecordsChirho(rootChirho, reasonsChirho);
			expectChirho(reasonsChirho).toEqual([]);
			const selectedChirho = recordsChirho.filter(
				(rowChirho) =>
					rowChirho.scene_record_chirho?.lesson_id_chirho === '1Cor.1.1' &&
					!rowChirho.fallback_chirho
			);
			expectChirho(selectedChirho.map((rowChirho) => rowChirho.sha256_chirho)).toEqual([
				correctionChirho.replacement_record_chirho.sha256_chirho
			]);
			expectChirho(
				recordsChirho.find(
					(rowChirho) =>
						rowChirho.asset_path_chirho === correctionChirho.base_record_chirho.asset_path_chirho
				)?.scene_record_chirho
			).toBeUndefined();
			for (const caseChirho of ['base', 'source']) {
				if (caseChirho === 'base') {
					const changedChirho = structuredClone(fixtureChirho.documents_chirho[0].document_chirho);
					changedChirho.scenes_chirho[0].alt_chirho += ' drift';
					await jsonChirho(rootChirho, correctionChirho.target_document_chirho, changedChirho);
				} else {
					await jsonChirho(
						rootChirho,
						correctionChirho.target_document_chirho,
						fixtureChirho.documents_chirho[0].document_chirho
					);
					await writeFileChirho(
						joinChirho(rootChirho, 'static' + correctionChirho.content_path_chirho),
						fixtureChirho.chapter_text_chirho + ' '
					);
				}
				const refusedChirho: string[] = [];
				expectChirho(await readMediaRecordsChirho(rootChirho, refusedChirho)).toEqual([]);
				expectChirho(refusedChirho.length).toBeGreaterThan(0);
			}
		}
	);
	testChirho(
		'snapshot and R2 overlay retain exact source provenance, old aliases and fallback',
		async () => {
			const { rootChirho, correctionChirho, fixtureChirho } = await setupChirho();
			await mkdirChirho(joinChirho(rootChirho, 'data-chirho/reader-chirho'), { recursive: true });
			const capturedChirho = await snapshotArtworkInputsChirho(rootChirho);
			expectChirho(capturedChirho.get(SCENE_CORRECTIONS_PATH_CHIRHO)).toEqual(
				await readFileChirho(joinChirho(rootChirho, SCENE_CORRECTIONS_PATH_CHIRHO))
			);
			expectChirho(
				JSON.parse(
					Buffer.from(capturedChirho.get(correctionChirho.target_document_chirho)!).toString()
				).scenes_chirho[0]
			).toEqual(correctionChirho.base_record_chirho);
			expectChirho(
				capturedChirho.get('static' + correctionChirho.content_path_chirho)?.toString()
			).toBe(fixtureChirho.chapter_text_chirho);
			expectChirho(MEDIA_INPUT_PATTERN_CHIRHO.test(SCENE_CORRECTIONS_PATH_CHIRHO)).toBe(true);
			const beforeProofChirho = await readFileChirho(
				joinChirho(rootChirho, 'data-chirho/delivery-chirho/artwork-chirho/index-chirho.json')
			);
			await jsonChirho(rootChirho, 'config-chirho/media-library-chirho.json', {
				storage_mode_chirho: 'r2'
			});
			await mkdirChirho(joinChirho(rootChirho, 'node_modules'));
			const snapshotPathChirho = joinChirho(
				rootChirho,
				'build-chirho/release-cycle-chirho/snapshot-chirho'
			);
			await copySnapshotChirho(rootChirho, snapshotPathChirho);
			expectChirho(
				await readFileChirho(joinChirho(snapshotPathChirho, SCENE_CORRECTIONS_PATH_CHIRHO))
			).toEqual(capturedChirho.get(SCENE_CORRECTIONS_PATH_CHIRHO));
			await overlayRemoteArtworkChirho(snapshotPathChirho);
			const reasonsChirho: string[] = [];
			const recordsChirho = await readMediaRecordsChirho(snapshotPathChirho, reasonsChirho);
			const remoteChirho = await remoteMediaChirho(
				snapshotPathChirho,
				recordsChirho,
				true,
				reasonsChirho
			);
			expectChirho(reasonsChirho).toEqual([]);
			expectChirho(
				JSON.parse(
					await readFileChirho(
						joinChirho(rootChirho, correctionChirho.target_document_chirho),
						'utf8'
					)
				).scenes_chirho[0]
			).toEqual(correctionChirho.base_record_chirho);
			const oldPathChirho = correctionChirho.base_record_chirho.asset_path_chirho;
			const oldDeliveryChirho =
				fixtureChirho.archive_entries_chirho[0].delivery_chirho.sha256_chirho;
			expectChirho(remoteChirho.assets_chirho[oldPathChirho].sha256_chirho).toBe(oldDeliveryChirho);
			expectChirho(
				remoteChirho.assets_chirho[
					'/assets-chirho/sha256-chirho/' + oldDeliveryChirho + '-chirho.webp'
				].sha256_chirho
			).toBe(oldDeliveryChirho);
			expectChirho(
				recordsChirho.filter(
					(rowChirho) =>
						rowChirho.scene_record_chirho?.lesson_id_chirho === '1Cor.1.1' &&
						rowChirho.fallback_chirho
				)
			).toHaveLength(1);
			expectChirho(
				await readFileChirho(
					joinChirho(rootChirho, 'data-chirho/delivery-chirho/artwork-chirho/index-chirho.json')
				)
			).toEqual(beforeProofChirho);
			const signatureChirho = await manifestSignatureChirho(rootChirho);
			const catalogueChirho = await readFileChirho(
				joinChirho(rootChirho, SCENE_CORRECTIONS_PATH_CHIRHO)
			);
			await writeFileChirho(
				joinChirho(rootChirho, SCENE_CORRECTIONS_PATH_CHIRHO),
				Buffer.concat([catalogueChirho, Buffer.from(' ')])
			);
			expectChirho(await manifestSignatureChirho(rootChirho)).not.toBe(signatureChirho);
		}
	);

	testChirho(
		'replaces one effective row, retains the base as a non-selecting alias and agrees with Python',
		async () => {
			const { rootChirho, fixtureChirho, correctionChirho } = await setupChirho();
			const beforeChirho = await readFileChirho(
				joinChirho(rootChirho, correctionChirho.target_document_chirho)
			);
			const resultChirho = await readEffectiveMediaDocumentsChirho(rootChirho);
			expectChirho(resultChirho).toEqual(pythonChirho(rootChirho));
			expectChirho(
				resultChirho.documents_chirho.find(
					(rowChirho) => rowChirho.name_chirho === 'high-quality-chirho.json'
				)!.document_chirho.scenes_chirho
			).toEqual([
				correctionChirho.replacement_record_chirho,
				fixtureChirho.documents_chirho[0].document_chirho.scenes_chirho[1]
			]);
			expectChirho(
				resultChirho.documents_chirho.find(
					(rowChirho) => rowChirho.name_chirho === 'fallback-chirho.json'
				)!.document_chirho
			).toEqual(fixtureChirho.documents_chirho[1].document_chirho);
			expectChirho(resultChirho.retained_aliases_chirho).toHaveLength(1);
			expectChirho(resultChirho.retained_aliases_chirho[0]).not.toHaveProperty(
				'scene_record_chirho'
			);
			expectChirho(resultChirho.retained_aliases_chirho[0].sha256_chirho).toBe(
				correctionChirho.base_record_chirho.sha256_chirho
			);
			expectChirho(
				await readFileChirho(joinChirho(rootChirho, correctionChirho.target_document_chirho))
			).toEqual(beforeChirho);
		}
	);
	testChirho(
		'recognizes only the exact materialized replacement with its corresponding source/archive proof',
		async () => {
			const { rootChirho, fixtureChirho, correctionChirho } = await setupChirho();
			const replacementChirho = correctionChirho.replacement_record_chirho;
			const proofChirho = fixtureChirho.archive_entries_chirho.find(
				(rowChirho: ArchiveEntryChirho) =>
					rowChirho.source_chirho.sha256_chirho === replacementChirho.sha256_chirho
			)!;
			const deliveredChirho = {
				...replacementChirho,
				...Object.fromEntries(
					['sha256_chirho', 'width_chirho', 'height_chirho'].map((keyChirho) => [
						keyChirho,
						proofChirho.delivery_chirho[keyChirho]
					])
				)
			};
			const docChirho = fixtureChirho.documents_chirho[0].document_chirho;
			docChirho.scenes_chirho[0] = deliveredChirho;
			await jsonChirho(rootChirho, correctionChirho.target_document_chirho, docChirho);
			const firstChirho = await readEffectiveMediaDocumentsChirho(rootChirho);
			expectChirho(firstChirho).toEqual(await readEffectiveMediaDocumentsChirho(rootChirho));
			expectChirho(firstChirho).toEqual(pythonChirho(rootChirho));
			expectChirho(firstChirho.retained_aliases_chirho[0].sha256_chirho).toBe(
				fixtureChirho.archive_entries_chirho[0].delivery_chirho.sha256_chirho
			);
			docChirho.scenes_chirho[0].alt_chirho += ' changed';
			await jsonChirho(rootChirho, correctionChirho.target_document_chirho, docChirho);
			await expectChirho(readEffectiveMediaDocumentsChirho(rootChirho)).rejects.toThrow(
				'exact base/replacement'
			);
			docChirho.scenes_chirho[0] = deliveredChirho;
			Reflect.deleteProperty(docChirho.scenes_chirho[0], 'alt_chirho');
			await jsonChirho(rootChirho, correctionChirho.target_document_chirho, docChirho);
			await expectChirho(readEffectiveMediaDocumentsChirho(rootChirho)).rejects.toThrow();
		}
	);
	testChirho.each([
		'base',
		'source',
		'duplicate',
		'foreign',
		'approval',
		'digest',
		'archive',
		'lesson',
		'variant',
		'source-binding',
		'same-path'
	])('refuses %s drift before an overlay can be used', async (caseChirho) => {
		const { rootChirho, fixtureChirho, correctionChirho } = await setupChirho();
		if (caseChirho === 'base') {
			fixtureChirho.documents_chirho[0].document_chirho.scenes_chirho[0].reading_note_chirho +=
				' changed';
			await jsonChirho(
				rootChirho,
				correctionChirho.target_document_chirho,
				fixtureChirho.documents_chirho[0].document_chirho
			);
		}
		if (caseChirho === 'source')
			await writeFileChirho(
				joinChirho(rootChirho, 'static' + correctionChirho.content_path_chirho),
				fixtureChirho.chapter_text_chirho + ' '
			);
		if (caseChirho === 'duplicate')
			fixtureChirho.catalogue_chirho.corrections_chirho.push(structuredClone(correctionChirho));
		if (caseChirho === 'foreign')
			correctionChirho.target_document_chirho = '../foreign-chirho.json';
		if (caseChirho === 'approval')
			correctionChirho.replacement_record_chirho.art_review_chirho = 'approved';
		if (caseChirho === 'digest') correctionChirho.base_record_sha256_chirho = '0'.repeat(64);
		if (caseChirho === 'lesson')
			correctionChirho.replacement_record_chirho.lesson_id_chirho = 'John.1.1';
		if (caseChirho === 'variant')
			correctionChirho.replacement_record_chirho.variant_chirho = 'representation_reduced';
		if (caseChirho === 'source-binding')
			(
				correctionChirho.replacement_record_chirho.source_binding_chirho as Record<string, unknown>
			).canonical_sha256_chirho = '0'.repeat(64);
		if (caseChirho === 'same-path')
			correctionChirho.replacement_record_chirho.asset_path_chirho =
				correctionChirho.base_record_chirho.asset_path_chirho;
		if (caseChirho === 'archive') {
			const proofChirho = fixtureChirho.archive_entries_chirho[1];
			fixtureChirho.documents_chirho[0].document_chirho.scenes_chirho[0] = {
				...correctionChirho.replacement_record_chirho,
				sha256_chirho: proofChirho.delivery_chirho.sha256_chirho,
				width_chirho: 1200,
				height_chirho: 900
			};
			await jsonChirho(
				rootChirho,
				correctionChirho.target_document_chirho,
				fixtureChirho.documents_chirho[0].document_chirho
			);
			await rmChirho(
				joinChirho(rootChirho, 'data-chirho/delivery-chirho/artwork-chirho/index-chirho.json')
			);
		}
		await jsonChirho(rootChirho, SCENE_CORRECTIONS_PATH_CHIRHO, fixtureChirho.catalogue_chirho);
		await expectChirho(readEffectiveMediaDocumentsChirho(rootChirho)).rejects.toThrow();
	});
	testChirho(
		'keeps missing-folder and ordinary parse-error compatibility, and hashes overlay-only changes',
		async () => {
			const emptyChirho = await mkdtempChirho(joinChirho(tmpdirChirho(), 'scene-empty-chirho-'));
			rootsChirho.push(emptyChirho);
			expectChirho((await readEffectiveMediaDocumentsChirho(emptyChirho)).documents_chirho).toEqual(
				[]
			);
			const { rootChirho } = await setupChirho();
			const beforeChirho = await sceneCorrectionSignatureChirho(rootChirho);
			await writeFileChirho(
				joinChirho(rootChirho, 'data-chirho/media-chirho/broken-chirho.json'),
				'{'
			);
			const reasonsChirho: string[] = [];
			expectChirho(
				(await readEffectiveMediaDocumentsChirho(rootChirho, reasonsChirho)).documents_chirho
			).toHaveLength(2);
			expectChirho(reasonsChirho).toEqual([
				'data-chirho/media-chirho/broken-chirho.json is not valid JSON'
			]);
			const bytesChirho = await readFileChirho(
				joinChirho(rootChirho, SCENE_CORRECTIONS_PATH_CHIRHO)
			);
			await writeFileChirho(
				joinChirho(rootChirho, SCENE_CORRECTIONS_PATH_CHIRHO),
				Buffer.concat([bytesChirho, Buffer.from(' ')])
			);
			expectChirho(await sceneCorrectionSignatureChirho(rootChirho)).not.toBe(beforeChirho);
			expectChirho(sceneCorrectionInputPathsChirho(bytesChirho)).toEqual([
				'static/content-chirho/1-corinthians-chirho/chapter-01-chirho.json',
				'static/content-chirho/1-corinthians-chirho/manifest-chirho.json'
			]);
			expectChirho(sceneRecordJsonChirho({ z_chirho: 'שָׁלוֹם', a_chirho: ['Ἐν', '😀'] })).toBe(
				'{"a_chirho":["Ἐν","😀"],"z_chirho":"שָׁלוֹם"}'
			);
		}
	);
});
