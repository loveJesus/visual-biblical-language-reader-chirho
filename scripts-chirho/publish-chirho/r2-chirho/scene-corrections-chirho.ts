// For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life. — John 3:16 (KJV)
// Workflow: spec-chirho/workflows-chirho/media-delivery-chirho.md. Never rewrite authoring provenance.
import {
	lstat as lstatChirho,
	readFile as readFileChirho,
	readdir as readdirChirho,
	realpath as realpathChirho
} from 'node:fs/promises';
import { dirname as dirnameChirho, join as joinChirho } from 'node:path';
import { RefusalChirho, sha256Chirho, type MediaRecordChirho } from '../release_rules_chirho';
import { checkedArtworkChirho, readArtworkCatalogueChirho } from './catalogue-chirho';

export const SCENE_CORRECTIONS_PATH_CHIRHO =
	'data-chirho/art-corrections-chirho/catalogue-chirho.json';
const MAXIMUM_CHIRHO = 512 * 1024;
type ObjectChirho = Record<string, unknown>;
interface CorrectionChirho {
	id_chirho: string;
	target_document_chirho: string;
	lesson_id_chirho: string;
	variant_chirho: string;
	content_path_chirho: string;
	content_sha256_chirho: string;
	canonical_sha256_chirho: string;
	base_record_sha256_chirho: string;
	base_record_chirho: ObjectChirho;
	replacement_record_chirho: ObjectChirho;
}
export interface EffectiveMediaDocumentsChirho {
	documents_chirho: { name_chirho: string; document_chirho: ObjectChirho }[];
	retained_aliases_chirho: MediaRecordChirho[];
	retained_scenes_chirho: ObjectChirho[];
	corrections_sha256_chirho: string | null;
}
function refuseChirho(messageChirho: string): never {
	throw new RefusalChirho(['Scene correction: ' + messageChirho]);
}
function objectChirho(valueChirho: unknown): ObjectChirho {
	if (!valueChirho || typeof valueChirho !== 'object' || Array.isArray(valueChirho))
		refuseChirho('expected an object');
	return valueChirho as ObjectChirho;
}
/** Sorted JSON with exact Unicode scalars and safe integers: shared with the Python helper. */
export function sceneRecordJsonChirho(valueChirho: unknown): string {
	if (valueChirho === null || typeof valueChirho === 'boolean') return JSON.stringify(valueChirho);
	if (typeof valueChirho === 'string') {
		for (const scalarChirho of valueChirho)
			if (scalarChirho.length === 1 && /[\uD800-\uDFFF]/u.test(scalarChirho))
				refuseChirho('unpaired Unicode surrogate');
		return JSON.stringify(valueChirho);
	}
	if (typeof valueChirho === 'number' && Number.isSafeInteger(valueChirho))
		return String(valueChirho);
	if (Array.isArray(valueChirho))
		return '[' + valueChirho.map(sceneRecordJsonChirho).join(',') + ']';
	const rowChirho = objectChirho(valueChirho);
	return (
		'{' +
		Object.keys(rowChirho)
			.sort()
			.map(
				(keyChirho) => JSON.stringify(keyChirho) + ':' + sceneRecordJsonChirho(rowChirho[keyChirho])
			)
			.join(',') +
		'}'
	);
}
function sameChirho(leftChirho: unknown, rightChirho: unknown) {
	return sceneRecordJsonChirho(leftChirho) === sceneRecordJsonChirho(rightChirho);
}
function aliasChirho(rowChirho: ObjectChirho): MediaRecordChirho {
	if (
		typeof rowChirho.asset_path_chirho !== 'string' ||
		!/^\/assets-chirho(?:\/[a-z0-9][a-z0-9-]*)+\.webp$/u.test(rowChirho.asset_path_chirho) ||
		typeof rowChirho.sha256_chirho !== 'string' ||
		!/^[a-f0-9]{64}$/u.test(rowChirho.sha256_chirho) ||
		!Number.isSafeInteger(rowChirho.width_chirho) ||
		!Number.isSafeInteger(rowChirho.height_chirho) ||
		Number(rowChirho.width_chirho) < 1 ||
		Number(rowChirho.width_chirho) > 4096 ||
		Number(rowChirho.height_chirho) < 1 ||
		Number(rowChirho.height_chirho) > 4096 ||
		!['pending', 'approved'].includes(String(rowChirho.art_review_chirho))
	)
		refuseChirho('invalid scene facts');
	return {
		kind_chirho: 'scene',
		asset_path_chirho: rowChirho.asset_path_chirho,
		sha256_chirho: rowChirho.sha256_chirho,
		width_chirho: Number(rowChirho.width_chirho),
		height_chirho: Number(rowChirho.height_chirho),
		art_review_chirho: rowChirho.art_review_chirho as 'pending' | 'approved'
	};
}
function parseChirho(bytesChirho: Uint8Array): CorrectionChirho[] {
	if (bytesChirho.length > MAXIMUM_CHIRHO) refuseChirho('catalogue exceeds its bound');
	const catalogueChirho = objectChirho(
		JSON.parse(new TextDecoder('utf-8', { fatal: true }).decode(bytesChirho))
	);
	if (
		catalogueChirho.schema_version_chirho !== 1 ||
		!Array.isArray(catalogueChirho.corrections_chirho) ||
		catalogueChirho.corrections_chirho.length > 64 ||
		Object.keys(catalogueChirho).some(
			(keyChirho) => !['schema_version_chirho', 'corrections_chirho'].includes(keyChirho)
		)
	)
		refuseChirho('invalid catalogue scope');
	const idsChirho = new Set<string>(),
		targetsChirho = new Set<string>(),
		basesChirho = new Set<string>(),
		replacementsChirho = new Set<string>();
	const resultChirho = catalogueChirho.corrections_chirho.map((valueChirho) => {
		const rowChirho = objectChirho(valueChirho) as unknown as CorrectionChirho;
		const fieldsChirho = [
			'id_chirho',
			'target_document_chirho',
			'lesson_id_chirho',
			'variant_chirho',
			'content_path_chirho',
			'content_sha256_chirho',
			'canonical_sha256_chirho',
			'base_record_sha256_chirho',
			'base_record_chirho',
			'replacement_record_chirho'
		];
		if (
			Object.keys(rowChirho).length !== fieldsChirho.length ||
			fieldsChirho.some((keyChirho) => !(keyChirho in rowChirho)) ||
			!/^[-a-z0-9]+-chirho$/u.test(rowChirho.id_chirho) ||
			rowChirho.id_chirho.length > 128 ||
			!/^data-chirho\/media-chirho\/[a-z0-9][a-z0-9-]*\.json$/u.test(
				rowChirho.target_document_chirho
			) ||
			!/^[A-Za-z0-9]+\.[1-9][0-9]{0,2}\.[1-9][0-9]{0,2}$/u.test(rowChirho.lesson_id_chirho) ||
			!['standard', 'representation_reduced'].includes(rowChirho.variant_chirho) ||
			!/^\/content-chirho\/[a-z0-9-]+\/chapter-[0-9]{2,3}-chirho\.json$/u.test(
				rowChirho.content_path_chirho
			) ||
			![
				rowChirho.content_sha256_chirho,
				rowChirho.canonical_sha256_chirho,
				rowChirho.base_record_sha256_chirho
			].every((shaChirho) => typeof shaChirho === 'string' && /^[a-f0-9]{64}$/u.test(shaChirho))
		)
			refuseChirho('invalid target binding');
		const baseChirho = objectChirho(rowChirho.base_record_chirho),
			replacementChirho = objectChirho(rowChirho.replacement_record_chirho);
		aliasChirho(baseChirho);
		aliasChirho(replacementChirho);
		if (
			sha256Chirho(sceneRecordJsonChirho(baseChirho)) !== rowChirho.base_record_sha256_chirho ||
			replacementChirho.art_review_chirho !== 'pending' ||
			baseChirho.asset_path_chirho === replacementChirho.asset_path_chirho ||
			baseChirho.sha256_chirho === replacementChirho.sha256_chirho
		)
			refuseChirho('base digest or replacement differs');
		for (const sceneChirho of [baseChirho, replacementChirho]) {
			const bindingChirho = objectChirho(sceneChirho.source_binding_chirho);
			if (
				sceneChirho.lesson_id_chirho !== rowChirho.lesson_id_chirho ||
				(sceneChirho.variant_chirho ?? 'standard') !== rowChirho.variant_chirho ||
				sceneChirho.fallback_chirho === true ||
				['content_path_chirho', 'content_sha256_chirho', 'canonical_sha256_chirho'].some(
					(keyChirho) =>
						bindingChirho[keyChirho] !== (rowChirho as unknown as ObjectChirho)[keyChirho]
				)
			)
				refuseChirho('scene crosses target/source or fallback');
		}
		if (
			idsChirho.has(rowChirho.id_chirho) ||
			targetsChirho.has(rowChirho.lesson_id_chirho + ':' + rowChirho.variant_chirho) ||
			basesChirho.has(String(baseChirho.asset_path_chirho)) ||
			replacementsChirho.has(String(replacementChirho.asset_path_chirho))
		)
			refuseChirho('duplicate correction');
		idsChirho.add(rowChirho.id_chirho);
		targetsChirho.add(rowChirho.lesson_id_chirho + ':' + rowChirho.variant_chirho);
		basesChirho.add(String(baseChirho.asset_path_chirho));
		replacementsChirho.add(String(replacementChirho.asset_path_chirho));
		return rowChirho;
	});
	if ([...basesChirho].some((pathChirho) => replacementsChirho.has(pathChirho)))
		refuseChirho('correction chains are not supported');
	return resultChirho;
}
/** Exact correction/source inputs the snapshot must capture before its archive-proof index. */
export function sceneCorrectionInputPathsChirho(bytesChirho: Uint8Array): string[] {
	return [
		...new Set(
			parseChirho(bytesChirho).flatMap((rowChirho) => {
				const sourceChirho = 'static' + rowChirho.content_path_chirho;
				return [
					sourceChirho,
					sourceChirho.replace(/chapter-[0-9]{2,3}-chirho\.json$/u, 'manifest-chirho.json')
				];
			})
		)
	].sort();
}
async function boundedChirho(
	rootChirho: string,
	pathChirho: string,
	maximumChirho: number,
	optionalChirho = false
) {
	const absoluteChirho = joinChirho(rootChirho, pathChirho);
	try {
		const infoChirho = await lstatChirho(absoluteChirho);
		if (
			!infoChirho.isFile() ||
			infoChirho.size > maximumChirho ||
			(await realpathChirho(dirnameChirho(absoluteChirho))) !== dirnameChirho(absoluteChirho)
		)
			refuseChirho('input is not a contained bounded regular file');
		const bytesChirho = await readFileChirho(absoluteChirho);
		if (bytesChirho.length > maximumChirho) refuseChirho('input grew beyond its bound');
		return bytesChirho;
	} catch (errorChirho) {
		if (optionalChirho && (errorChirho as NodeJS.ErrnoException).code === 'ENOENT') return null;
		throw errorChirho;
	}
}
/** Hash the small optional overlay itself, including changes that preserve timestamps/sizes. */
export async function sceneCorrectionSignatureChirho(rootChirho: string): Promise<string | null> {
	const bytesChirho = await boundedChirho(
		await realpathChirho(rootChirho),
		SCENE_CORRECTIONS_PATH_CHIRHO,
		MAXIMUM_CHIRHO,
		true
	);
	return bytesChirho ? sha256Chirho(bytesChirho) : null;
}
async function sourceChirho(rootChirho: string, rowChirho: CorrectionChirho) {
	const bytesChirho = (await boundedChirho(
		rootChirho,
		'static' + rowChirho.content_path_chirho,
		4 * 1024 ** 2
	))!;
	if (sha256Chirho(bytesChirho) !== rowChirho.content_sha256_chirho)
		refuseChirho('canonical source bytes changed');
	const chapterChirho = objectChirho(
		JSON.parse(new TextDecoder('utf-8', { fatal: true }).decode(bytesChirho))
	);
	const [bookChirho, numberChirho] = rowChirho.lesson_id_chirho.split('.');
	const versesChirho = Array.isArray(chapterChirho.verses_chirho)
		? chapterChirho.verses_chirho.filter(
				(verseChirho) => objectChirho(verseChirho).id_chirho === rowChirho.lesson_id_chirho
			)
		: [];
	if (
		chapterChirho.book_id_chirho !== bookChirho ||
		chapterChirho.chapter_chirho !== Number(numberChirho) ||
		versesChirho.length !== 1 ||
		typeof versesChirho[0].canonical_text_chirho !== 'string' ||
		sha256Chirho(versesChirho[0].canonical_text_chirho) !== rowChirho.canonical_sha256_chirho
	)
		refuseChirho('canonical verse identity changed');
	sceneRecordJsonChirho(versesChirho[0].canonical_text_chirho);
	const manifestPathChirho = ('static' + rowChirho.content_path_chirho).replace(
		/chapter-[0-9]{2,3}-chirho\.json$/u,
		'manifest-chirho.json'
	);
	const manifestChirho = objectChirho(
		JSON.parse(
			new TextDecoder('utf-8', { fatal: true }).decode(
				(await boundedChirho(rootChirho, manifestPathChirho, 1024 ** 2))!
			)
		)
	);
	const entriesChirho = Array.isArray(manifestChirho.chapters_chirho)
		? manifestChirho.chapters_chirho.filter(
				(entryChirho) => objectChirho(entryChirho).number_chirho === Number(numberChirho)
			)
		: [];
	if (
		manifestChirho.book_id_chirho !== bookChirho ||
		entriesChirho.length !== 1 ||
		entriesChirho[0].path_chirho !== rowChirho.content_path_chirho ||
		entriesChirho[0].sha256_chirho !== rowChirho.content_sha256_chirho
	)
		refuseChirho('source manifest binding changed');
}
/** Pure effective copies plus explicit archive-only aliases; authoring files are never written. */
export async function readEffectiveMediaDocumentsChirho(
	rootChirho: string,
	reasonsChirho?: string[]
): Promise<EffectiveMediaDocumentsChirho> {
	rootChirho = await realpathChirho(rootChirho);
	const correctionBytesChirho = await boundedChirho(
		rootChirho,
		SCENE_CORRECTIONS_PATH_CHIRHO,
		MAXIMUM_CHIRHO,
		true
	);
	const correctionsChirho = correctionBytesChirho ? parseChirho(correctionBytesChirho) : [];
	const homeChirho = joinChirho(rootChirho, 'data-chirho/media-chirho');
	const namesChirho = (
		await readdirChirho(homeChirho).catch((errorChirho: NodeJS.ErrnoException) => {
			if (errorChirho.code === 'ENOENT') return [] as string[];
			throw errorChirho;
		})
	)
		.filter((nameChirho) => nameChirho.endsWith('.json'))
		.sort();
	if (namesChirho.length > 256) refuseChirho('manifest scope needs cold retirement');
	const documentsChirho: EffectiveMediaDocumentsChirho['documents_chirho'] = [];
	for (const nameChirho of namesChirho) {
		if (!/^[a-z0-9][a-z0-9-]*\.json$/u.test(nameChirho)) refuseChirho('invalid media filename');
		const bytesChirho = (await boundedChirho(
			rootChirho,
			'data-chirho/media-chirho/' + nameChirho,
			64 * 1024 ** 2
		))!;
		try {
			documentsChirho.push({
				name_chirho: nameChirho,
				document_chirho: JSON.parse(bytesChirho.toString('utf8'))
			});
		} catch (errorChirho) {
			if (!reasonsChirho) throw errorChirho;
			reasonsChirho.push(`data-chirho/media-chirho/${nameChirho} is not valid JSON`);
		}
	}
	const aliasesChirho: MediaRecordChirho[] = [];
	const retainedScenesChirho: ObjectChirho[] = [];
	let archiveChirho: Awaited<ReturnType<typeof readArtworkCatalogueChirho>> | undefined;
	for (const correctionChirho of correctionsChirho) {
		await sourceChirho(rootChirho, correctionChirho);
		const documentChirho = documentsChirho.find(
			(documentChirho) =>
				'data-chirho/media-chirho/' + documentChirho.name_chirho ===
				correctionChirho.target_document_chirho
		);
		const scenesChirho = documentChirho?.document_chirho.scenes_chirho;
		if (documentChirho?.document_chirho.schema_version_chirho !== 1 || !Array.isArray(scenesChirho))
			refuseChirho('target document is absent or malformed');
		const positionsChirho = scenesChirho
			.map((sceneChirho, indexChirho) => ({
				scene_chirho: objectChirho(sceneChirho),
				index_chirho: indexChirho
			}))
			.filter(
				({ scene_chirho: sceneChirho }) =>
					sceneChirho.lesson_id_chirho === correctionChirho.lesson_id_chirho &&
					(sceneChirho.variant_chirho ?? 'standard') === correctionChirho.variant_chirho
			);
		if (positionsChirho.length !== 1) refuseChirho('target scene is absent or repeated');
		const { scene_chirho: sceneChirho, index_chirho: indexChirho } = positionsChirho[0];
		const baseChirho = correctionChirho.base_record_chirho,
			replacementChirho = correctionChirho.replacement_record_chirho;
		for (const candidateDocumentChirho of documentsChirho) {
			const candidateScenesChirho = candidateDocumentChirho.document_chirho?.scenes_chirho;
			if (!Array.isArray(candidateScenesChirho)) continue;
			for (const [candidateIndexChirho, candidateSceneChirho] of candidateScenesChirho.entries())
				if (
					objectChirho(candidateSceneChirho).asset_path_chirho ===
						replacementChirho.asset_path_chirho &&
					(candidateDocumentChirho !== documentChirho || candidateIndexChirho !== indexChirho)
				)
					refuseChirho('replacement asset belongs to another scene');
		}
		let materializedChirho = false;
		if (sameChirho(sceneChirho, baseChirho))
			scenesChirho[indexChirho] = structuredClone(replacementChirho);
		else if (!sameChirho(sceneChirho, replacementChirho)) {
			archiveChirho ??= await readArtworkCatalogueChirho(rootChirho);
			if (!archiveChirho) refuseChirho('materialized replacement lacks archive proof');
			const proofChirho = checkedArtworkChirho(archiveChirho, aliasChirho(replacementChirho));
			const deliveredChirho = {
				...replacementChirho,
				sha256_chirho: proofChirho.delivery_chirho.sha256_chirho,
				width_chirho: proofChirho.delivery_chirho.width_chirho,
				height_chirho: proofChirho.delivery_chirho.height_chirho
			};
			if (!sameChirho(sceneChirho, deliveredChirho))
				refuseChirho('exact base/replacement record changed');
			materializedChirho = true;
		}
		let retainedSceneChirho = structuredClone(baseChirho);
		if (materializedChirho) {
			const proofChirho = checkedArtworkChirho(archiveChirho!, aliasChirho(baseChirho));
			retainedSceneChirho = {
				...retainedSceneChirho,
				sha256_chirho: proofChirho.delivery_chirho.sha256_chirho,
				width_chirho: proofChirho.delivery_chirho.width_chirho,
				height_chirho: proofChirho.delivery_chirho.height_chirho
			};
		}
		retainedScenesChirho.push(retainedSceneChirho);
		aliasesChirho.push(aliasChirho(retainedSceneChirho));
	}
	return {
		documents_chirho: documentsChirho,
		retained_aliases_chirho: aliasesChirho,
		retained_scenes_chirho: retainedScenesChirho,
		corrections_sha256_chirho: correctionBytesChirho ? sha256Chirho(correctionBytesChirho) : null
	};
}
