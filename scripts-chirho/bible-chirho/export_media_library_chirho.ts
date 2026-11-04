// For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life. — John 3:16 (KJV)

import { createHash as createHashChirho } from 'node:crypto';
import {
	lstat as lstatChirho,
	mkdir as mkdirChirho,
	readFile as readFileChirho,
	writeFile as writeFileChirho
} from 'node:fs/promises';
import { dirname as dirnameChirho, join as joinChirho, resolve as resolveChirho } from 'node:path';
import { spokenWordChirho } from '../../src/lib/domain-chirho/pronunciation-chirho';
import { lemmaIconKeyChirho } from '../../src/lib/domain-chirho/lemma-icons-chirho';

type ObjectChirho = Record<string, unknown>;
type KindChirho = 'icons_chirho' | 'word_audio_chirho' | 'scenes_chirho';
interface FileChirho {
	path_chirho: string;
	sha256_chirho: string;
	bytes_chirho: number;
}
interface AssetChirho {
	sha256_chirho: string;
	bytes_chirho: number;
	download_url_chirho: string;
	kinds_chirho: KindChirho[];
	width_chirho?: number;
	height_chirho?: number;
	duration_chirho?: number;
}
export interface MediaLibraryPlanChirho {
	release_id_chirho: string;
	source_manifest_sha256_chirho: string;
	files_chirho: Map<string, Uint8Array>;
	manifest_chirho: ObjectChirho;
}

export const MAX_LIBRARY_JSON_BYTES_CHIRHO = 2 * 1024 * 1024 - 1;
const ORIGIN_CHIRHO = 'https://hinneh.us';
const HEADER_CHIRHO =
	'<!-- For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life. — John 3:16 (KJV) -->';
const HASH_CHIRHO = /^[a-f0-9]{64}$/u;
const encoderChirho = new TextEncoder();

export function librarySha256Chirho(bytesChirho: Uint8Array | string): string {
	return createHashChirho('sha256').update(bytesChirho).digest('hex');
}
function failChirho(messageChirho: string): never {
	throw new Error(`Media library refused: ${messageChirho}`);
}
function objectChirho(valueChirho: unknown): ObjectChirho {
	if (!valueChirho || typeof valueChirho !== 'object' || Array.isArray(valueChirho))
		failChirho('expected an object');
	return valueChirho as ObjectChirho;
}
function arrayChirho(valueChirho: unknown): unknown[] {
	if (!Array.isArray(valueChirho) || valueChirho.length > 600_000)
		failChirho('invalid bounded array');
	return valueChirho;
}
function textChirho(valueChirho: unknown, maximumChirho = 16_384): string {
	if (
		typeof valueChirho !== 'string' ||
		!valueChirho.trim() ||
		valueChirho.length > maximumChirho ||
		[...valueChirho].some((characterChirho) => {
			const codeChirho = characterChirho.codePointAt(0)!;
			return (
				codeChirho < 32 ||
				(codeChirho >= 127 && codeChirho <= 159) ||
				(codeChirho >= 0x202a && codeChirho <= 0x202e) ||
				(codeChirho >= 0x2066 && codeChirho <= 0x2069)
			);
		}) ||
		/(?:file:\/\/|\/(?:Users|Volumes|private|home|tmp)\/|[A-Za-z]:\\|\bsk_[a-zA-Z0-9]{16})/u.test(
			valueChirho
		)
	)
		failChirho('unsafe public text');
	return valueChirho;
}
function hashChirho(valueChirho: unknown): string {
	if (typeof valueChirho !== 'string' || !HASH_CHIRHO.test(valueChirho))
		failChirho('invalid sha256');
	return valueChirho;
}
function integerChirho(valueChirho: unknown, maximumChirho = Number.MAX_SAFE_INTEGER): number {
	if (
		!Number.isSafeInteger(valueChirho) ||
		Number(valueChirho) <= 0 ||
		Number(valueChirho) > maximumChirho
	)
		failChirho('invalid positive bound');
	return Number(valueChirho);
}
function enumChirho(valueChirho: unknown, valuesChirho: readonly string[]): string {
	if (typeof valueChirho !== 'string' || !valuesChirho.includes(valueChirho))
		failChirho('unknown public enum');
	return valueChirho;
}
function pathChirho(valueChirho: unknown): string {
	if (
		typeof valueChirho !== 'string' ||
		!/^\/[A-Za-z0-9_][A-Za-z0-9_./-]*$/u.test(valueChirho) ||
		valueChirho.split('/').some((partChirho) => partChirho === '.' || partChirho === '..') ||
		valueChirho.includes('//')
	)
		failChirho('unsafe release path');
	return valueChirho;
}
function lessonChirho(valueChirho: unknown): string {
	const idChirho = textChirho(valueChirho, 40);
	if (!/^[1-3]?[A-Za-z]+\.[1-9][0-9]{0,2}\.[1-9][0-9]{0,2}$/u.test(idChirho))
		failChirho('invalid occurrence identity');
	return idChirho;
}
function tokenChirho(valueChirho: unknown, verseChirho: string): string {
	const idChirho = textChirho(valueChirho, 80);
	if (
		!/^[A-Za-z0-9]{1,16}$/u.test(idChirho) &&
		!(
			idChirho.startsWith(`${verseChirho}!`) &&
			/^![1-9][0-9]{0,2}$/u.test(idChirho.slice(verseChirho.length))
		)
	)
		failChirho('invalid occurrence token');
	return idChirho;
}
function jsonChirho(valueChirho: unknown): Uint8Array {
	return encoderChirho.encode(JSON.stringify(valueChirho) + '\n');
}
function compareChirho(leftChirho: string, rightChirho: string): number {
	return leftChirho < rightChirho ? -1 : leftChirho > rightChirho ? 1 : 0;
}
async function regularPathChirho(rootChirho: string, relativeChirho: string): Promise<string> {
	let currentChirho = rootChirho;
	for (const partChirho of relativeChirho.split('/')) {
		currentChirho = joinChirho(currentChirho, partChirho);
		const statChirho = await lstatChirho(currentChirho);
		if (statChirho.isSymbolicLink()) failChirho('symlink in release or output');
	}
	if (!(await lstatChirho(currentChirho)).isFile()) failChirho('input is not a regular file');
	return currentChirho;
}

/** Workflow: hosting-chirho/public-media-library-chirho.md, freeze_chirho -> verify_chirho. */
export async function buildMediaLibraryChirho(rootChirho: string): Promise<MediaLibraryPlanChirho> {
	const releaseRootChirho = joinChirho(resolveChirho(rootChirho), 'build-chirho/preview-chirho');
	const manifestPathChirho = await regularPathChirho(
		resolveChirho(rootChirho),
		'build-chirho/preview-chirho/release-manifest-chirho.json'
	);
	if ((await lstatChirho(manifestPathChirho)).size > 64 * 1024 * 1024)
		failChirho('oversized release manifest');
	const manifestBytesChirho = await readFileChirho(manifestPathChirho);
	if (manifestBytesChirho.length > 64 * 1024 * 1024) failChirho('oversized release manifest');
	const releaseChirho = objectChirho(JSON.parse(manifestBytesChirho.toString('utf8')));
	if (releaseChirho.schema_version_chirho !== 1) failChirho('unknown release schema');
	const releaseIdChirho = hashChirho(releaseChirho.release_id_chirho);
	const declarationsChirho = new Map<string, FileChirho>();
	const releaseFilesChirho = arrayChirho(releaseChirho.files_chirho);
	if (releaseFilesChirho.length > 20_000) failChirho('oversized release file registry');
	let priorPathChirho = '';
	for (const inputChirho of releaseFilesChirho) {
		const rowChirho = objectChirho(inputChirho);
		const relativeChirho = pathChirho(rowChirho.path_chirho);
		if (compareChirho(priorPathChirho, relativeChirho) >= 0)
			failChirho('unsorted or repeated release path');
		priorPathChirho = relativeChirho;
		declarationsChirho.set(relativeChirho, {
			path_chirho: relativeChirho,
			bytes_chirho: integerChirho(rowChirho.bytes_chirho),
			sha256_chirho: hashChirho(rowChirho.sha256_chirho)
		});
	}
	const remoteChirho = objectChirho(releaseChirho.artwork_chirho);
	if (
		librarySha256Chirho(
			`${librarySha256Chirho(JSON.stringify(releaseFilesChirho))}\0${JSON.stringify(remoteChirho)}`
		) !== releaseIdChirho
	)
		failChirho('release identity differs from its declarations');
	const workerPathChirho = await regularPathChirho(releaseRootChirho, 'artwork-worker-chirho.mjs');
	if ((await lstatChirho(workerPathChirho)).size > 32 * 1024 * 1024)
		failChirho('oversized release Worker');
	const workerChirho = await readFileChirho(workerPathChirho);
	if (librarySha256Chirho(workerChirho) !== hashChirho(remoteChirho.worker_sha256_chirho))
		failChirho('release Worker differs');
	const objectFactsChirho = new Map<
		string,
		{ bytes_chirho: number; kind_chirho: 'image' | 'audio'; webp_chirho: boolean }
	>();
	for (const [fieldChirho, prefixChirho, suffixChirho, kindChirho] of [
		['objects_chirho', 'media-chirho', 'webp', 'image'],
		['audio_objects_chirho', 'audio-chirho', 'mp3', 'audio']
	] as const) {
		for (const inputChirho of arrayChirho(remoteChirho[fieldChirho])) {
			const rowChirho = objectChirho(inputChirho);
			const shaChirho = hashChirho(rowChirho.sha256_chirho);
			if (
				(rowChirho.key_chirho !== `${prefixChirho}/sha256-chirho/${shaChirho}.${suffixChirho}` &&
					!(
						kindChirho === 'image' &&
						rowChirho.key_chirho === `${prefixChirho}/sha256-chirho/${shaChirho}.jpg`
					)) ||
				objectFactsChirho.has(shaChirho)
			)
				failChirho('invalid or duplicate remote object');
			objectFactsChirho.set(shaChirho, {
				bytes_chirho: integerChirho(rowChirho.bytes_chirho),
				kind_chirho: kindChirho,
				webp_chirho: rowChirho.key_chirho === `media-chirho/sha256-chirho/${shaChirho}.webp`
			});
		}
	}
	const mediaFactsChirho = new Map<string, ObjectChirho>();
	for (const inputChirho of arrayChirho(releaseChirho.media_chirho)) {
		const rowChirho = objectChirho(inputChirho);
		const relativeChirho = pathChirho(rowChirho.asset_path_chirho);
		const previousChirho = mediaFactsChirho.get(relativeChirho);
		const factsChirho = {
			sha256_chirho: hashChirho(rowChirho.sha256_chirho),
			width_chirho: integerChirho(rowChirho.width_chirho, 4096),
			height_chirho: integerChirho(rowChirho.height_chirho, 4096),
			kind_chirho: enumChirho(rowChirho.kind_chirho, ['icon', 'scene']),
			art_review_chirho: enumChirho(rowChirho.art_review_chirho, ['pending', 'approved'])
		};
		if (previousChirho && JSON.stringify(previousChirho) !== JSON.stringify(factsChirho))
			failChirho('contradictory declared media');
		mediaFactsChirho.set(relativeChirho, factsChirho);
	}
	const readInputsChirho = new Map<string, FileChirho>();
	async function readJsonChirho(
		relativeChirho: string,
		expectedChirho?: unknown
	): Promise<ObjectChirho> {
		pathChirho(relativeChirho);
		const declarationChirho = declarationsChirho.get(relativeChirho);
		if (
			!declarationChirho ||
			declarationChirho.bytes_chirho > 8 * 1024 * 1024 ||
			(expectedChirho !== undefined &&
				hashChirho(expectedChirho) !== declarationChirho.sha256_chirho)
		)
			failChirho('unlisted, oversized or mismatched catalogue');
		const inputPathChirho = await regularPathChirho(
			joinChirho(releaseRootChirho, 'public-chirho'),
			relativeChirho.slice(1)
		);
		if ((await lstatChirho(inputPathChirho)).size !== declarationChirho.bytes_chirho)
			failChirho('catalogue size differs from frozen release');
		const bytesChirho = await readFileChirho(inputPathChirho);
		if (
			bytesChirho.length !== declarationChirho.bytes_chirho ||
			librarySha256Chirho(bytesChirho) !== declarationChirho.sha256_chirho
		)
			failChirho('catalogue bytes differ from frozen release');
		readInputsChirho.set(relativeChirho, declarationChirho);
		return objectChirho(JSON.parse(bytesChirho.toString('utf8')));
	}
	const assetsChirho = new Map<string, AssetChirho>();
	function assetChirho(rowChirho: ObjectChirho, kindChirho: KindChirho): AssetChirho {
		const shaChirho = hashChirho(rowChirho.sha256_chirho);
		const factsChirho = objectFactsChirho.get(shaChirho);
		if (
			!factsChirho ||
			(kindChirho !== 'word_audio_chirho' && !factsChirho.webp_chirho) ||
			factsChirho.kind_chirho !== (kindChirho === 'word_audio_chirho' ? 'audio' : 'image')
		)
			failChirho('unknown remote asset');
		const resultChirho: AssetChirho = {
			sha256_chirho: shaChirho,
			bytes_chirho: factsChirho.bytes_chirho,
			download_url_chirho: `${ORIGIN_CHIRHO}/${kindChirho === 'word_audio_chirho' ? 'audio-chirho' : 'assets-chirho'}/sha256-chirho/${shaChirho}-chirho.${kindChirho === 'word_audio_chirho' ? 'mp3' : 'webp'}`,
			kinds_chirho: [kindChirho]
		};
		if (kindChirho === 'word_audio_chirho') {
			if (
				rowChirho.bytes_chirho !== factsChirho.bytes_chirho ||
				rowChirho.asset_path_chirho !== resultChirho.download_url_chirho.slice(ORIGIN_CHIRHO.length)
			)
				failChirho('audio asset identity differs');
			const durationChirho = rowChirho.duration_chirho;
			if (
				typeof durationChirho !== 'number' ||
				!Number.isFinite(durationChirho) ||
				durationChirho <= 0 ||
				durationChirho > 120
			)
				failChirho('invalid audio duration');
			resultChirho.duration_chirho = durationChirho;
		} else {
			const declaredChirho = mediaFactsChirho.get(pathChirho(rowChirho.asset_path_chirho));
			if (
				!declaredChirho ||
				declaredChirho.kind_chirho !== (kindChirho === 'icons_chirho' ? 'icon' : 'scene') ||
				['sha256_chirho', 'width_chirho', 'height_chirho', 'art_review_chirho'].some(
					(fieldChirho) => declaredChirho[fieldChirho] !== rowChirho[fieldChirho]
				)
			)
				failChirho('media differs from release declaration');
			resultChirho.width_chirho = integerChirho(
				rowChirho.width_chirho,
				kindChirho === 'icons_chirho' ? 128 : 4096
			);
			resultChirho.height_chirho = integerChirho(
				rowChirho.height_chirho,
				kindChirho === 'icons_chirho' ? 128 : 4096
			);
		}
		const previousChirho = assetsChirho.get(shaChirho);
		if (previousChirho) {
			if (
				previousChirho.bytes_chirho !== resultChirho.bytes_chirho ||
				previousChirho.width_chirho !== resultChirho.width_chirho ||
				previousChirho.height_chirho !== resultChirho.height_chirho ||
				previousChirho.duration_chirho !== resultChirho.duration_chirho
			)
				failChirho('contradictory asset facts');
			if (!previousChirho.kinds_chirho.includes(kindChirho))
				previousChirho.kinds_chirho.push(kindChirho);
			return previousChirho;
		}
		assetsChirho.set(shaChirho, resultChirho);
		return resultChirho;
	}
	const iconsChirho = new Map<string, ObjectChirho>();
	const lemmaKeysChirho = new Set<string>();
	const defaultLemmaKeysChirho = new Set<string>();
	const scenesChirho = new Map<string, ObjectChirho>();
	const verseScenesChirho = new Set<string>();
	for (const summaryPathChirho of [...declarationsChirho.keys()].filter((relativeChirho) =>
		/^\/media-chirho\/[a-z0-9-]+\/summary-chirho\.json$/u.test(relativeChirho)
	)) {
		const summaryChirho = await readJsonChirho(summaryPathChirho);
		if (summaryChirho.schema_version_chirho !== 1) failChirho('unknown media schema');
		for (const inputChirho of arrayChirho(summaryChirho.chapters_chirho)) {
			const chapterEntryChirho = objectChirho(inputChirho);
			const chapterPathChirho = pathChirho(chapterEntryChirho.path_chirho);
			if (
				chapterPathChirho !==
				summaryPathChirho.replace(
					'summary-chirho.json',
					`chapter-${String(integerChirho(chapterEntryChirho.number_chirho, 200)).padStart(2, '0')}-chirho.json`
				)
			)
				failChirho('media chapter path differs');
			const chapterChirho = await readJsonChirho(
				chapterPathChirho,
				chapterEntryChirho.sha256_chirho
			);
			if (
				chapterChirho.schema_version_chirho !== 1 ||
				chapterChirho.book_id_chirho !== summaryChirho.book_id_chirho ||
				chapterChirho.chapter_chirho !== chapterEntryChirho.number_chirho
			)
				failChirho('media chapter identity differs');
			for (const [fieldChirho, roleChirho] of [
				['icons_chirho', 'contextual'],
				['lemma_icons_chirho', 'lemma_default']
			] as const) {
				for (const iconInputChirho of arrayChirho(chapterChirho[fieldChirho] ?? [])) {
					const rowChirho = objectChirho(iconInputChirho);
					const lemmaChirho = textChirho(rowChirho.lemma_id_chirho, 32);
					const augmentChirho =
						rowChirho.lemma_augment_chirho === null || rowChirho.lemma_augment_chirho === undefined
							? null
							: textChirho(rowChirho.lemma_augment_chirho, 2);
					const lexicalChirho =
						rowChirho.lexical_form_chirho === undefined
							? undefined
							: textChirho(rowChirho.lexical_form_chirho, 128);
					const keyChirho = lemmaIconKeyChirho({
						lemma_id_chirho: lemmaChirho,
						lemma_augment_chirho: augmentChirho,
						lexical_form_chirho: lexicalChirho
					});
					lemmaKeysChirho.add(keyChirho);
					if (roleChirho === 'lemma_default') defaultLemmaKeysChirho.add(keyChirho);
					const mediaChirho = assetChirho(rowChirho, 'icons_chirho');
					const verseChirho = lessonChirho(rowChirho.lesson_id_chirho);
					const idChirho = textChirho(rowChirho.id_chirho, 128);
					const recordKeyChirho = librarySha256Chirho(
						JSON.stringify([keyChirho, idChirho, mediaChirho.sha256_chirho])
					);
					const projectedChirho: ObjectChirho = {
						id_chirho: recordKeyChirho,
						lemma_key_chirho: keyChirho,
						lemma_id_chirho: lemmaChirho,
						lemma_augment_chirho: augmentChirho,
						...(lexicalChirho === undefined ? {} : { lexical_form_chirho: lexicalChirho }),
						asset_sha256_chirho: mediaChirho.sha256_chirho,
						download_url_chirho: mediaChirho.download_url_chirho,
						sense_id_chirho: textChirho(rowChirho.sense_id_chirho, 128),
						meaning_chirho: textChirho(rowChirho.contextual_meaning_chirho),
						alt_chirho: textChirho(rowChirho.alt_chirho),
						sense_review_chirho: enumChirho(rowChirho.sense_review_chirho, [
							'agent_reviewed',
							'human_reviewed'
						]),
						art_review_chirho: enumChirho(rowChirho.art_review_chirho, ['pending', 'approved']),
						evidence_refs_chirho: arrayChirho(rowChirho.evidence_refs_chirho).map(
							(referenceChirho) => {
								const refChirho = textChirho(referenceChirho, 128);
								if (!/^[a-z0-9][a-z0-9-]*$/u.test(refChirho))
									failChirho('invalid evidence reference');
								return refChirho;
							}
						),
						selected_chirho: rowChirho.selected_chirho !== false,
						source_lesson_id_chirho: verseChirho,
						source_token_id_chirho: tokenChirho(rowChirho.token_id_chirho, verseChirho),
						roles_chirho: [roleChirho],
						catalogue_path_chirho: chapterPathChirho,
						artwork_license_chirho: 'CC0-1.0'
					};
					const previousChirho = iconsChirho.get(recordKeyChirho);
					if (previousChirho) {
						const priorRolesChirho = previousChirho.roles_chirho as string[];
						const comparableChirho = {
							...previousChirho,
							roles_chirho: projectedChirho.roles_chirho,
							catalogue_path_chirho: chapterPathChirho
						};
						if (JSON.stringify(comparableChirho) !== JSON.stringify(projectedChirho))
							failChirho('contradictory reused picture identity');
						if (!priorRolesChirho.includes(roleChirho)) priorRolesChirho.push(roleChirho);
					} else iconsChirho.set(recordKeyChirho, projectedChirho);
				}
			}
			for (const sceneInputChirho of arrayChirho(chapterChirho.scenes_chirho)) {
				const rowChirho = objectChirho(sceneInputChirho);
				const mediaChirho = assetChirho(rowChirho, 'scenes_chirho');
				const verseChirho = lessonChirho(rowChirho.lesson_id_chirho);
				if (
					!verseChirho.startsWith(
						`${chapterChirho.book_id_chirho}.${chapterChirho.chapter_chirho}.`
					)
				)
					failChirho('scene occurrence differs from chapter');
				const variantChirho =
					rowChirho.variant_chirho === undefined
						? 'standard'
						: enumChirho(rowChirho.variant_chirho, ['standard', 'representation_reduced']);
				const keyChirho = `${verseChirho}:${variantChirho}`;
				if (scenesChirho.has(keyChirho)) failChirho('duplicate scene variant');
				verseScenesChirho.add(verseChirho);
				scenesChirho.set(keyChirho, {
					lesson_id_chirho: verseChirho,
					variant_chirho: variantChirho,
					asset_sha256_chirho: mediaChirho.sha256_chirho,
					download_url_chirho: mediaChirho.download_url_chirho,
					alt_chirho: textChirho(rowChirho.alt_chirho),
					reading_note_chirho: textChirho(rowChirho.reading_note_chirho),
					art_review_chirho: enumChirho(rowChirho.art_review_chirho, ['pending', 'approved']),
					catalogue_path_chirho: chapterPathChirho,
					artwork_license_chirho: 'CC0-1.0'
				});
			}
		}
	}
	for (const [keyChirho, rowChirho] of scenesChirho) {
		if (
			rowChirho.variant_chirho === 'representation_reduced' &&
			(!scenesChirho.has(keyChirho.replace(':representation_reduced', ':standard')) ||
				scenesChirho.get(keyChirho.replace(':representation_reduced', ':standard'))
					?.asset_sha256_chirho === rowChirho.asset_sha256_chirho)
		)
			failChirho('reduced scene lacks a distinct standard');
	}
	const recordingsChirho = new Map<string, ObjectChirho>();
	const aliasesChirho = new Map<string, Map<string, number>>();
	const pronunciationKeysChirho = new Set<string>();
	const occurrencesChirho: ObjectChirho[] = [];
	let wordOccurrencesChirho = 0;
	const recordedWordsChirho = new Set<string>();
	const audioManifestChirho = await readJsonChirho('/audio-chirho/manifest-chirho.json');
	if (audioManifestChirho.schema_version_chirho !== 1) failChirho('unknown audio schema');
	for (const [bookChirho, bookInputChirho] of Object.entries(
		objectChirho(audioManifestChirho.books_chirho)
	).sort(([leftChirho], [rightChirho]) => compareChirho(leftChirho, rightChirho))) {
		for (const entryInputChirho of arrayChirho(objectChirho(bookInputChirho).chapters_chirho)) {
			const entryChirho = objectChirho(entryInputChirho);
			const chapterPathChirho = pathChirho(entryChirho.path_chirho);
			if (!/^\/audio-chirho\/[a-z0-9-]+\/chapter-[0-9]{2,3}-chirho\.json$/u.test(chapterPathChirho))
				failChirho('unsafe audio chapter path');
			const chapterChirho = await readJsonChirho(chapterPathChirho, entryChirho.sha256_chirho);
			if (
				chapterChirho.schema_version_chirho !== 1 ||
				chapterChirho.book_id_chirho !== bookChirho ||
				chapterChirho.chapter_chirho !== entryChirho.number_chirho
			)
				failChirho('audio chapter identity differs');
			const contentPathChirho = pathChirho(chapterChirho.content_path_chirho);
			if (contentPathChirho !== chapterPathChirho.replace('/audio-chirho/', '/content-chirho/'))
				failChirho('audio content binding path differs');
			const contentChirho = await readJsonChirho(
				contentPathChirho,
				chapterChirho.content_sha256_chirho
			);
			if (
				contentChirho.book_id_chirho !== bookChirho ||
				contentChirho.chapter_chirho !== chapterChirho.chapter_chirho
			)
				failChirho('content chapter identity differs');
			const versesChirho = new Map(
				arrayChirho(contentChirho.verses_chirho).map((verseInputChirho) => {
					const verseChirho = objectChirho(verseInputChirho);
					return [lessonChirho(verseChirho.id_chirho), verseChirho] as const;
				})
			);
			const referencesChirho = new Map<
				string,
				{ row_chirho: ObjectChirho; keys_chirho: Set<string> }
			>();
			for (const clipInputChirho of arrayChirho(chapterChirho.clips_chirho)) {
				const rowChirho = objectChirho(clipInputChirho);
				if (rowChirho.token_id_chirho === null) continue;
				const verseIdChirho = lessonChirho(rowChirho.lesson_id_chirho);
				const verseChirho = versesChirho.get(verseIdChirho);
				const tokenIdChirho = tokenChirho(rowChirho.token_id_chirho, verseIdChirho);
				const sourceTokenChirho =
					verseChirho &&
					arrayChirho(verseChirho.tokens_chirho)
						.map(objectChirho)
						.find((candidateChirho) => candidateChirho.id_chirho === tokenIdChirho);
				if (
					!verseChirho ||
					!sourceTokenChirho ||
					librarySha256Chirho(textChirho(verseChirho.canonical_text_chirho)) !==
						hashChirho(rowChirho.canonical_sha256_chirho)
				)
					failChirho('audio canonical occurrence differs');
				const spokenChirho = spokenWordChirho({
					text_chirho: textChirho(sourceTokenChirho.text_chirho),
					...(sourceTokenChirho.qere_chirho === undefined
						? {}
						: {
								qere_chirho: arrayChirho(sourceTokenChirho.qere_chirho).map((qereChirho) => ({
									text_chirho: textChirho(objectChirho(qereChirho).text_chirho)
								}))
							})
				});
				if (rowChirho.text_chirho !== spokenChirho)
					failChirho('audio spoken text differs from exact source or qere');
				const mediaChirho = assetChirho(rowChirho, 'word_audio_chirho');
				const identityChirho: ObjectChirho = {
					language_chirho: enumChirho(rowChirho.language_chirho, ['he', 'el']),
					input_text_chirho:
						rowChirho.synthesis_text_chirho === undefined && rowChirho.ipa_chirho === undefined
							? spokenChirho
							: null,
					ipa_chirho: rowChirho.ipa_chirho === undefined ? null : textChirho(rowChirho.ipa_chirho),
					pronunciation_chirho: enumChirho(rowChirho.pronunciation_chirho, [
						'israeli_hebrew',
						'modern_greek',
						'modern_greek_aspirates',
						'erasmian_greek'
					]),
					voice_name_chirho: textChirho(rowChirho.voice_name_chirho, 256),
					synthesis_sha256_chirho:
						rowChirho.synthesis_text_chirho === undefined
							? null
							: librarySha256Chirho(textChirho(rowChirho.synthesis_text_chirho)),
					provider_chirho:
						rowChirho.provider_chirho === undefined
							? null
							: textChirho(rowChirho.provider_chirho, 80),
					model_chirho:
						rowChirho.model_chirho === undefined ? null : textChirho(rowChirho.model_chirho, 80)
				};
				const pronunciationKeyChirho = librarySha256Chirho(JSON.stringify(identityChirho));
				pronunciationKeysChirho.add(pronunciationKeyChirho);
				const recordingIdChirho = librarySha256Chirho(
					`${pronunciationKeyChirho}\0${mediaChirho.sha256_chirho}`
				);
				const reviewChirho = enumChirho(rowChirho.review_chirho, ['audition', 'approved']);
				const aliasChirho = {
					text_chirho: spokenChirho,
					recipe_id_chirho:
						rowChirho.recipe_id_chirho === undefined
							? null
							: textChirho(rowChirho.recipe_id_chirho, 256)
				};
				const aliasKeyChirho = JSON.stringify(aliasChirho);
				const recordingChirho: ObjectChirho = {
					id_chirho: recordingIdChirho,
					catalogue_synthesis_key_chirho: pronunciationKeyChirho,
					...identityChirho,
					asset_sha256_chirho: mediaChirho.sha256_chirho,
					download_url_chirho: mediaChirho.download_url_chirho,
					review_chirho: reviewChirho,
					recording_license_chirho: 'CC-BY-4.0',
					catalogue_path_chirho: chapterPathChirho,
					aliases_chirho: []
				};
				const priorChirho = recordingsChirho.get(recordingIdChirho);
				if (priorChirho && priorChirho.review_chirho !== reviewChirho)
					failChirho('contradictory recording review');
				if (!priorChirho) recordingsChirho.set(recordingIdChirho, recordingChirho);
				let aliasIndexesChirho = aliasesChirho.get(recordingIdChirho);
				if (!aliasIndexesChirho) {
					aliasIndexesChirho = new Map();
					aliasesChirho.set(recordingIdChirho, aliasIndexesChirho);
				}
				let aliasIndexChirho = aliasIndexesChirho.get(aliasKeyChirho);
				if (aliasIndexChirho === undefined) {
					aliasIndexChirho = aliasIndexesChirho.size;
					aliasIndexesChirho.set(aliasKeyChirho, aliasIndexChirho);
					(recordingsChirho.get(recordingIdChirho)!.aliases_chirho as ObjectChirho[]).push(
						aliasChirho
					);
				}
				let referenceChirho = referencesChirho.get(verseIdChirho);
				if (!referenceChirho) {
					referenceChirho = {
						row_chirho: {
							lesson_id_chirho: verseIdChirho,
							canonical_sha256_chirho: rowChirho.canonical_sha256_chirho,
							content_path_chirho: contentPathChirho,
							catalogue_path_chirho: chapterPathChirho,
							words_chirho: []
						},
						keys_chirho: new Set()
					};
					referencesChirho.set(verseIdChirho, referenceChirho);
				}
				const occurrenceKeyChirho = `${tokenIdChirho}\0${recordingIdChirho}\0${aliasIndexChirho}`;
				if (referenceChirho.keys_chirho.has(occurrenceKeyChirho))
					failChirho('duplicate word recording occurrence');
				referenceChirho.keys_chirho.add(occurrenceKeyChirho);
				(referenceChirho.row_chirho.words_chirho as (string | number)[][]).push([
					tokenIdChirho,
					recordingIdChirho,
					aliasIndexChirho
				]);
				wordOccurrencesChirho += 1;
				recordedWordsChirho.add(`${verseIdChirho}\0${tokenIdChirho}`);
			}
			for (const referenceChirho of referencesChirho.values())
				occurrencesChirho.push(referenceChirho.row_chirho);
		}
	}
	if (
		librarySha256Chirho(await readFileChirho(manifestPathChirho)) !==
		librarySha256Chirho(manifestBytesChirho)
	)
		failChirho('release changed while freezing inputs');
	const outputFilesChirho = new Map<string, Uint8Array>();
	const outputShardsChirho: ObjectChirho[] = [];
	function shardsChirho(familyChirho: string, rowsChirho: unknown[]): void {
		let indexChirho = 0;
		let pendingChirho: unknown[] = [];
		let pendingBytesChirho = 0;
		function flushChirho(): void {
			if (!pendingChirho.length) return;
			const pathChirho = `${familyChirho}/part-${String(indexChirho++).padStart(4, '0')}-chirho.json`;
			const bytesChirho = jsonChirho({
				schema_version_chirho: 1,
				release_id_chirho: releaseIdChirho,
				records_chirho: pendingChirho
			});
			if (bytesChirho.length > MAX_LIBRARY_JSON_BYTES_CHIRHO) failChirho('oversized output shard');
			outputFilesChirho.set(pathChirho, bytesChirho);
			outputShardsChirho.push({
				path_chirho: pathChirho,
				bytes_chirho: bytesChirho.length,
				sha256_chirho: librarySha256Chirho(bytesChirho),
				records_chirho: pendingChirho.length
			});
			pendingChirho = [];
			pendingBytesChirho = 0;
		}
		for (const rowChirho of rowsChirho) {
			const bytesChirho = jsonChirho(rowChirho).length;
			if (bytesChirho + 256 > MAX_LIBRARY_JSON_BYTES_CHIRHO) failChirho('oversized library record');
			if (pendingBytesChirho + bytesChirho + 256 > MAX_LIBRARY_JSON_BYTES_CHIRHO) flushChirho();
			pendingChirho.push(rowChirho);
			pendingBytesChirho += bytesChirho;
		}
		flushChirho();
	}
	shardsChirho(
		'icons-chirho',
		[...iconsChirho.entries()]
			.sort(([leftChirho], [rightChirho]) => compareChirho(leftChirho, rightChirho))
			.map(([, rowChirho]) => ({
				...rowChirho,
				roles_chirho: [...(rowChirho.roles_chirho as string[])].sort(compareChirho)
			}))
	);
	shardsChirho(
		'word-audio-chirho',
		[...recordingsChirho.entries()]
			.sort(([leftChirho], [rightChirho]) => compareChirho(leftChirho, rightChirho))
			.map(([, rowChirho]) => rowChirho)
	);
	shardsChirho(
		'scenes-chirho',
		[...scenesChirho.entries()]
			.sort(([leftChirho], [rightChirho]) => compareChirho(leftChirho, rightChirho))
			.map(([, rowChirho]) => rowChirho)
	);
	shardsChirho(
		'audio-occurrences-chirho',
		occurrencesChirho.sort((leftChirho, rightChirho) =>
			compareChirho(String(leftChirho.lesson_id_chirho), String(rightChirho.lesson_id_chirho))
		)
	);
	shardsChirho(
		'assets-chirho',
		[...assetsChirho.values()].sort((leftChirho, rightChirho) =>
			compareChirho(leftChirho.sha256_chirho, rightChirho.sha256_chirho)
		)
	);
	shardsChirho(
		'source-catalogues-chirho',
		[...readInputsChirho.values()]
			.sort((leftChirho, rightChirho) =>
				compareChirho(leftChirho.path_chirho, rightChirho.path_chirho)
			)
			.map((rowChirho) => ({
				...rowChirho,
				download_url_chirho: ORIGIN_CHIRHO + rowChirho.path_chirho
			}))
	);
	const downloadsChirho: ObjectChirho = {};
	for (const kindChirho of ['icons_chirho', 'word_audio_chirho', 'scenes_chirho'] as const) {
		const matchingChirho = [...assetsChirho.values()].filter((rowChirho) =>
			rowChirho.kinds_chirho.includes(kindChirho)
		);
		downloadsChirho[kindChirho] = {
			unique_assets_chirho: matchingChirho.length,
			bytes_chirho: matchingChirho.reduce(
				(totalChirho, rowChirho) => totalChirho + rowChirho.bytes_chirho,
				0
			)
		};
	}
	const manifestChirho: ObjectChirho = {
		schema_version_chirho: 1,
		release_id_chirho: releaseIdChirho,
		source_manifest_sha256_chirho: librarySha256Chirho(manifestBytesChirho),
		origin_chirho: ORIGIN_CHIRHO,
		upstream_notices_url_chirho: 'https://hinneh.us/sources-chirho/',
		licenses_chirho: {
			artwork_chirho: {
				spdx_chirho: 'CC0-1.0',
				url_chirho: 'https://creativecommons.org/publicdomain/zero/1.0/'
			},
			audio_chirho: {
				spdx_chirho: 'CC-BY-4.0',
				url_chirho: 'https://creativecommons.org/licenses/by/4.0/',
				attribution_chirho: 'Hinneh / Love Jesus Software, https://hinneh.us/',
				scope_chirho:
					'Project-held recording rights only; upstream text and voice or identity rights remain separate.'
			}
		},
		counts_chirho: {
			lemma_identities_chirho: lemmaKeysChirho.size,
			default_lemma_identities_chirho: defaultLemmaKeysChirho.size,
			picture_records_chirho: iconsChirho.size,
			catalogue_synthesis_identities_chirho: pronunciationKeysChirho.size,
			source_lookup_aliases_chirho: [...aliasesChirho.values()].reduce(
				(totalChirho, mapChirho) => totalChirho + mapChirho.size,
				0
			),
			word_recordings_chirho: recordingsChirho.size,
			word_recording_occurrences_chirho: wordOccurrencesChirho,
			word_occurrences_with_recordings_chirho: recordedWordsChirho.size,
			scene_verses_chirho: verseScenesChirho.size,
			scene_variants_chirho: scenesChirho.size,
			unique_assets_chirho: assetsChirho.size
		},
		download_plan_chirho: {
			...downloadsChirho,
			total_unique_assets_chirho: assetsChirho.size,
			total_bytes_chirho: [...assetsChirho.values()].reduce(
				(totalChirho, rowChirho) => totalChirho + rowChirho.bytes_chirho,
				0
			),
			binaries_downloaded_chirho: false
		},
		shards_chirho: outputShardsChirho
	};
	const rootBytesChirho = jsonChirho(manifestChirho);
	if (rootBytesChirho.length > MAX_LIBRARY_JSON_BYTES_CHIRHO)
		failChirho('oversized library manifest');
	outputFilesChirho.set('manifest-chirho.json', rootBytesChirho);
	outputFilesChirho.set(
		'README-chirho.md',
		encoderChirho.encode(
			`${HEADER_CHIRHO}\n\n# Hinneh reusable media library\n\nThis deterministic catalogue describes public release ${releaseIdChirho}. Media bytes stay on R2 and are served through https://hinneh.us/. This export downloads no media. Check every shard against manifest-chirho.json, then download a chosen asset and verify its declared SHA-256 and byte count. Public availability is not an immutable availability promise; keep a verified copy when archiving.\n\nThe icons-chirho records keep exact Hebrew lemma plus augment identities and exact Greek lemma plus lexical-form identities. Never normalize Greek strings or treat a Strong number alone as a complete identity. Pictures can have several senses. A lemma_default is a general memory aid, not a contextual sense judgment. Source lesson/token fields identify the reviewed example; repeated chapter defaults are deduplicated.\n\nThe word-audio-chirho records distinguish the published IPA or synthesis-input digest, language, pronunciation profile, voice, provider and model. Their catalogue_synthesis_key_chirho describes published fields, not undisclosed provider settings or the private production cache. A recording id also includes the MP3 hash, so different bytes are never merged. Each recording keeps exact source-text and recipe aliases; words with different cantillation spelling can reuse the same sound. Audio is not keyed by lemma: inflection, qere, stress and pronunciation can change the recording. The audio-occurrences-chirho shards bind each verse to its canonical SHA and catalogue/content paths; words_chirho contains [token id, recording id, zero-based alias index] triples. Source-catalogues-chirho supplies exact published input hashes and URLs. Metadata and its Unicode are preserved without normalization. Existing natural verse recordings are retained by Hinneh but excluded from this word library.\n\nThe scenes-chirho records preserve standard and representation_reduced variants. Asset facts, download URLs, dimensions or durations, unique counts and uncompressed download byte totals are in assets-chirho and the root manifest. Metadata shards are each below 2 MiB. The shard directories are bounded asset-like collections. GitHub Release archives can group icons, audio and scenes separately; this export does not upload archives or commit binaries. Archive sizes require measurement after packaging.\n\nHinneh-created artwork is CC0 1.0 Universal, attribution optional. Project-held recording rights are CC BY 4.0: credit Hinneh / Love Jesus Software, https://hinneh.us/, link the license and note changes. Voice, identity and upstream text/data rights remain separate; this catalogue does not relicense them. Most artwork and recordings are AI-assisted drafts awaiting review. Review fields are evidence, not a claim of pronunciation, theological or artwork acceptance.\n`
		)
	);
	return {
		release_id_chirho: releaseIdChirho,
		source_manifest_sha256_chirho: librarySha256Chirho(manifestBytesChirho),
		files_chirho: outputFilesChirho,
		manifest_chirho: manifestChirho
	};
}

/** Workflow: hosting-chirho/public-media-library-chirho.md, plan_chirho -> local_export_chirho. */
export async function writeMediaLibraryChirho(
	rootChirho: string,
	planChirho: MediaLibraryPlanChirho
): Promise<string> {
	hashChirho(planChirho.release_id_chirho);
	const manifestBytesChirho = planChirho.files_chirho.get('manifest-chirho.json');
	if (
		!manifestBytesChirho ||
		librarySha256Chirho(manifestBytesChirho) !==
			librarySha256Chirho(jsonChirho(planChirho.manifest_chirho)) ||
		planChirho.manifest_chirho.release_id_chirho !== planChirho.release_id_chirho
	)
		failChirho('output manifest differs from plan');
	const expectedPathsChirho = new Set(['manifest-chirho.json', 'README-chirho.md']);
	for (const inputChirho of arrayChirho(planChirho.manifest_chirho.shards_chirho)) {
		const shardChirho = objectChirho(inputChirho);
		const relativeChirho = String(shardChirho.path_chirho);
		const bytesChirho = planChirho.files_chirho.get(relativeChirho);
		if (
			expectedPathsChirho.has(relativeChirho) ||
			!bytesChirho ||
			bytesChirho.length > MAX_LIBRARY_JSON_BYTES_CHIRHO ||
			bytesChirho.length !== shardChirho.bytes_chirho ||
			librarySha256Chirho(bytesChirho) !== shardChirho.sha256_chirho
		)
			failChirho('output shard differs from plan');
		expectedPathsChirho.add(relativeChirho);
	}
	for (const relativeChirho of planChirho.files_chirho.keys()) {
		if (
			!expectedPathsChirho.has(relativeChirho) ||
			!/^(?:[a-z-]+\/part-[0-9]{4}-chirho\.json|manifest-chirho\.json|README-chirho\.md)$/u.test(
				relativeChirho
			)
		)
			failChirho('unsafe export file');
	}
	if (planChirho.files_chirho.size !== expectedPathsChirho.size) failChirho('missing output file');
	const absoluteRootChirho = resolveChirho(rootChirho);
	for (const relativeChirho of ['build-chirho', 'build-chirho/public-media-library-chirho']) {
		const targetChirho = joinChirho(absoluteRootChirho, relativeChirho);
		await mkdirChirho(targetChirho).catch((errorChirho: NodeJS.ErrnoException) => {
			if (errorChirho.code !== 'EEXIST') throw errorChirho;
		});
		const statChirho = await lstatChirho(targetChirho);
		if (statChirho.isSymbolicLink() || !statChirho.isDirectory())
			failChirho('unsafe export parent');
	}
	const outputChirho = joinChirho(
		absoluteRootChirho,
		'build-chirho/public-media-library-chirho',
		`${planChirho.release_id_chirho}-chirho`
	);
	// A non-recursive exclusive claim leaves an incomplete export inspectable; it never replaces it.
	await mkdirChirho(outputChirho);
	for (const [relativeChirho, bytesChirho] of [...planChirho.files_chirho].sort(
		([leftChirho], [rightChirho]) =>
			leftChirho === 'manifest-chirho.json'
				? 1
				: rightChirho === 'manifest-chirho.json'
					? -1
					: compareChirho(leftChirho, rightChirho)
	)) {
		const parentChirho = dirnameChirho(joinChirho(outputChirho, relativeChirho));
		if (parentChirho !== outputChirho)
			await mkdirChirho(parentChirho).catch((errorChirho: NodeJS.ErrnoException) => {
				if (errorChirho.code !== 'EEXIST') throw errorChirho;
			});
		await writeFileChirho(joinChirho(outputChirho, relativeChirho), bytesChirho, { flag: 'wx' });
	}
	return outputChirho;
}

if (import.meta.main) {
	try {
		const argumentsChirho = process.argv.slice(2);
		if (argumentsChirho.some((argumentChirho) => argumentChirho !== '--apply-chirho'))
			failChirho('unknown argument');
		const rootChirho = resolveChirho(import.meta.dirname, '../..');
		const planChirho = await buildMediaLibraryChirho(rootChirho);
		console.log(
			JSON.stringify({
				release_id_chirho: planChirho.release_id_chirho,
				counts_chirho: planChirho.manifest_chirho.counts_chirho,
				download_plan_chirho: planChirho.manifest_chirho.download_plan_chirho,
				metadata_files_chirho: planChirho.files_chirho.size,
				metadata_bytes_chirho: [...planChirho.files_chirho.values()].reduce(
					(sumChirho, bytesChirho) => sumChirho + bytesChirho.length,
					0
				),
				applied_chirho: argumentsChirho.includes('--apply-chirho')
			})
		);
		if (argumentsChirho.includes('--apply-chirho'))
			console.log(await writeMediaLibraryChirho(rootChirho, planChirho));
	} catch (errorChirho) {
		console.error(errorChirho instanceof Error ? errorChirho.message : 'Media library refused');
		process.exitCode = 1;
	}
}
