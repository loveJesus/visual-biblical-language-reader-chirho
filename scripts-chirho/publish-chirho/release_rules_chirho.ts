// For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life. — John 3:16 (KJV)

// Publication rules shared by the release builder, the R2 media planner and their tests.
// Workflow (spec-chirho/research-chirho/26-10-27-publication-readiness-chirho.md): adapter
// output → path allowlist → declared media and content → private-material scan → release.

import { createHash } from 'node:crypto';
import { join } from 'node:path';
import { readWebpChirho } from './webp_chirho';
import { isGlossPathChirho } from './gloss_rules_chirho';
import { BIBLE_BOOKS_CHIRHO } from '../../src/lib/bible-chirho/books-chirho';
import { isAudioPathChirho } from './audio_rules_chirho';

export const ICON_MAX_EDGE_CHIRHO = 128;
// Cloudflare Workers static assets: 25 MiB per file; 20,000 files per version on the Free plan.
export const ASSET_MAX_BYTES_CHIRHO = 25 * 1024 * 1024;
export const ASSET_FILE_LIMIT_CHIRHO = 20_000;
// Adapter output that exists only for the SSR Worker or for upload control; never published.
export const SERVER_ARTIFACTS_CHIRHO = ['_worker.js', '_routes.json', '.assetsignore', '_headers'];
export const RELEASE_HEADERS_CHIRHO = `/*
  X-Content-Type-Options: nosniff
  Referrer-Policy: strict-origin-when-cross-origin
  Permissions-Policy: camera=(), microphone=(), geolocation=(), payment=(), usb=()
  Content-Security-Policy: frame-ancestors 'none'; object-src 'none'; base-uri 'self'
/_app/*
  X-Robots-Tag: noindex
  Cache-Control: no-cache
/_app/immutable/*
  ! Cache-Control
  Cache-Control: public, immutable, max-age=31536000
`;
// Public pages may be indexed under L.J.'s SEO authority while pending media and internal assets retain noindex.
export const PREVIEW_HEADERS_CHIRHO = `${RELEASE_HEADERS_CHIRHO}/assets-chirho/*
  X-Robots-Tag: noindex
/media-chirho/*
  X-Robots-Tag: noindex
/audio-chirho/*
  X-Robots-Tag: noindex
`;

const SEGMENT_CHIRHO = /^[A-Za-z0-9_][A-Za-z0-9._-]{0,127}$/;
const MEDIA_PATH_CHIRHO = /^\/assets-chirho(?:\/[a-z0-9][a-z0-9-]*)+\.webp$/;
const CONTENT_MANIFEST_CHIRHO = /^content-chirho\/[a-z0-9][a-z0-9-]*\/manifest-chirho\.json$/;
const SHA256_CHIRHO = /^[0-9a-f]{64}$/;
const MEDIA_KINDS_CHIRHO: Record<string, MediaKindChirho> = {
	icons_chirho: 'icon',
	scenes_chirho: 'scene'
};
// Chapter-sharded delivery written by scripts-chirho/art-chirho/refresh_sharded_media_chirho.py.
const SHARD_BOOKS_CHIRHO = Object.fromEntries(
	BIBLE_BOOKS_CHIRHO.map((bookChirho) => [
		bookChirho.slug_chirho,
		{ book_id_chirho: bookChirho.id_chirho, chapters_chirho: bookChirho.chapter_count_chirho }
	])
);
const SHARD_PATH_CHIRHO = new RegExp(
	'^media-chirho/(?:' +
		BIBLE_BOOKS_CHIRHO.map((bookChirho) => bookChirho.slug_chirho).join('|') +
		')/(?:summary-chirho|chapter-\\d{2,3}-chirho)\\.json$'
);
// The reader refuses any single response over 2 MiB.
const INDEX_LIMIT_CHIRHO = 2 * 1024 * 1024;

export type FileAreaChirho = 'server' | 'app' | 'page' | 'media' | 'content' | 'static';
export type MediaKindChirho = 'icon' | 'scene';
export type ReviewStateChirho = 'pending' | 'approved';
export type FilesChirho = Map<string, Uint8Array>;
export interface MediaRecordChirho {
	fallback_chirho?: boolean;
	icon_record_chirho?: Record<string, unknown>;
	scene_record_chirho?: { lesson_id_chirho: string; variant_chirho: string };
	asset_path_chirho: string;
	sha256_chirho: string;
	width_chirho: number;
	height_chirho: number;
	art_review_chirho: ReviewStateChirho;
	kind_chirho: MediaKindChirho;
}
export interface ReleaseFileChirho {
	path_chirho: string;
	bytes_chirho: number;
	sha256_chirho: string;
}

export class RefusalChirho extends Error {
	constructor(readonly reasonsChirho: string[]) {
		super(`Refused:\n- ${reasonsChirho.join('\n- ')}`);
	}
}

export function sha256Chirho(dataChirho: Uint8Array | string): string {
	return createHash('sha256').update(dataChirho).digest('hex');
}

/**
 * Child environment for wrangler: an isolated HOME under the ignored build-chirho/ so no stored
 * wrangler login can be picked up, no telemetry, and only credentials the caller passes.
 */
export function wranglerEnvironmentChirho(
	rootChirho: string,
	credentialsChirho: Record<string, string> = {}
): Record<string, string> {
	return {
		PATH: process.env.PATH ?? '',
		HOME: join(rootChirho, 'build-chirho', 'wrangler-home-chirho'),
		WRANGLER_SEND_METRICS: 'false',
		...credentialsChirho
	};
}

/** Returns the area of one adapter-output path, or a refusal reason for anything unexpected. */
export function classifyPathChirho(pathChirho: string): FileAreaChirho | string {
	if (SERVER_ARTIFACTS_CHIRHO.includes(pathChirho)) return 'server';
	const segmentsChirho = pathChirho.split('/');
	if (
		pathChirho.length > 512 ||
		segmentsChirho.some(
			(segmentChirho) => !SEGMENT_CHIRHO.test(segmentChirho) || segmentChirho.includes('..')
		)
	)
		return `${JSON.stringify(pathChirho)} has an unsafe or hidden path segment`;
	const extensionChirho = pathChirho.slice(pathChirho.lastIndexOf('.') + 1);
	if (extensionChirho === 'map') return `${pathChirho} is a source map`;
	if (segmentsChirho[0] === '_app') {
		if (pathChirho === '_app/version.json' || pathChirho === '_app/env.js') return 'app';
		if (
			segmentsChirho[1] === 'immutable' &&
			['js', 'css', 'svg', 'woff2', 'webp'].includes(extensionChirho)
		)
			return 'app';
		return `${pathChirho} is not an expected compiled app file`;
	}
	if (extensionChirho === 'html' || segmentsChirho.at(-1) === '__data.json') return 'page';
	if (segmentsChirho[0] === 'content-chirho' && extensionChirho === 'json') return 'content';
	if (segmentsChirho[0] === 'assets-chirho' && extensionChirho === 'webp') return 'media';
	if (
		pathChirho === 'robots.txt' ||
		pathChirho === 'sitemap.xml' ||
		pathChirho === 'library-chirho/books-chirho.json' ||
		pathChirho === 'media-index-chirho.json' ||
		isGlossPathChirho(pathChirho) ||
		isAudioPathChirho(pathChirho) ||
		SHARD_PATH_CHIRHO.test(pathChirho)
	)
		return 'static';
	return `${pathChirho} is not on the publication allowlist (pages, compiled app files, declared content and WebP media only)`;
}

// The public index may expose only records already covered by the validated media manifest.
// Legacy single index: optional while chapter shards replace it, validated whenever present.
export function verifyMediaIndexChirho(
	filesChirho: FilesChirho,
	mediaChirho: MediaRecordChirho[],
	reasonsChirho: string[]
): void {
	const bytesChirho = filesChirho.get('media-index-chirho.json');
	if (!bytesChirho) return;
	if (bytesChirho.byteLength > INDEX_LIMIT_CHIRHO) {
		reasonsChirho.push('Oversized media index');
		return;
	}
	try {
		const indexChirho = JSON.parse(new TextDecoder('utf-8', { fatal: true }).decode(bytesChirho));
		if (
			indexChirho.schema_version_chirho !== 1 ||
			!Array.isArray(indexChirho.scenes_chirho) ||
			!Array.isArray(indexChirho.icons_chirho)
		)
			throw new Error('invalid index');
		const declaredChirho = new Map(
			mediaChirho.map((recordChirho) => [recordChirho.asset_path_chirho, recordChirho])
		);
		for (const [itemsChirho, kindChirho] of [
			[indexChirho.scenes_chirho, 'scene'],
			[indexChirho.icons_chirho, 'icon']
		] as const) {
			for (const itemChirho of itemsChirho) {
				const recordChirho = declaredChirho.get(itemChirho?.asset_path_chirho);
				if (
					!recordChirho ||
					recordChirho.kind_chirho !== kindChirho ||
					recordChirho.sha256_chirho !== itemChirho.sha256_chirho ||
					recordChirho.width_chirho !== itemChirho.width_chirho ||
					recordChirho.height_chirho !== itemChirho.height_chirho ||
					recordChirho.art_review_chirho !== itemChirho.art_review_chirho
				)
					throw new Error('index entry does not match declared media');
			}
		}
	} catch {
		reasonsChirho.push('Media index is invalid or refers to undeclared or changed artwork');
	}
}

function indexJsonChirho(bytesChirho: Uint8Array | undefined): Record<string, unknown> | null {
	if (!bytesChirho || bytesChirho.byteLength > INDEX_LIMIT_CHIRHO) return null;
	try {
		const valueChirho: unknown = JSON.parse(
			new TextDecoder('utf-8', { fatal: true }).decode(bytesChirho)
		);
		return valueChirho && typeof valueChirho === 'object' && !Array.isArray(valueChirho)
			? (valueChirho as Record<string, unknown>)
			: null;
	} catch {
		return null;
	}
}

export interface MediaShardReportChirho {
	book_chirho: string;
	chapters_chirho: number;
	scenes_chirho: number;
	icons_chirho: number;
	lemma_icons_chirho?: number;
}

/**
 * Each book summary lists its chapter shards by sha256; each chapter matches its summary entry
 * and only indexes declared media with identical facts. Unlisted shard files are refused.
 */
export function verifyMediaShardsChirho(
	filesChirho: FilesChirho,
	mediaChirho: MediaRecordChirho[],
	reasonsChirho: string[]
): MediaShardReportChirho[] {
	const declaredChirho = new Map(
		mediaChirho.map((recordChirho) => [recordChirho.asset_path_chirho, recordChirho])
	);
	const sourceIconsChirho = new Map<string, Record<string, unknown>>(
		mediaChirho
			.filter((recordChirho) => typeof recordChirho.icon_record_chirho?.id_chirho === 'string')
			.map((recordChirho) => [
				String(recordChirho.icon_record_chirho!.id_chirho),
				recordChirho.icon_record_chirho!
			])
	);
	const sourceScenesChirho = new Map<string, string>();
	const sceneTiersChirho = new Set<string>();
	const chosenFallbackChirho = new Map<string, boolean>();
	for (const recordChirho of mediaChirho) {
		if (!recordChirho.scene_record_chirho) continue;
		const keyChirho = JSON.stringify(recordChirho.scene_record_chirho);
		const fallbackChirho = recordChirho.fallback_chirho === true;
		const tierChirho = JSON.stringify([keyChirho, fallbackChirho]);
		if (sceneTiersChirho.has(tierChirho)) reasonsChirho.push('Duplicate declared scene variant');
		sceneTiersChirho.add(tierChirho);
		if (
			!sourceScenesChirho.has(keyChirho) ||
			(chosenFallbackChirho.get(keyChirho) && !fallbackChirho)
		) {
			sourceScenesChirho.set(keyChirho, recordChirho.asset_path_chirho);
			chosenFallbackChirho.set(keyChirho, fallbackChirho);
		}
	}
	const listedChirho = new Set<string>();
	const reportChirho: MediaShardReportChirho[] = [];
	for (const [folderChirho, bookChirho] of Object.entries(SHARD_BOOKS_CHIRHO)) {
		const summaryPathChirho = `media-chirho/${folderChirho}/summary-chirho.json`;
		if (!filesChirho.has(summaryPathChirho)) continue;
		listedChirho.add(summaryPathChirho);
		const summaryChirho = indexJsonChirho(filesChirho.get(summaryPathChirho));
		const entriesChirho = summaryChirho?.chapters_chirho;
		if (
			!summaryChirho ||
			summaryChirho.schema_version_chirho !== 1 ||
			summaryChirho.book_id_chirho !== bookChirho.book_id_chirho ||
			!Array.isArray(entriesChirho)
		) {
			reasonsChirho.push(`/${summaryPathChirho} is not a valid media summary`);
			continue;
		}
		let previousChirho = 0;
		let scenesChirho = 0;
		let iconsChirho = 0;
		const lemmaKeysChirho = new Set<string>();
		for (const entryChirho of entriesChirho as Record<string, unknown>[]) {
			const numberChirho = Number(entryChirho?.number_chirho);
			const chapterPathChirho = `media-chirho/${folderChirho}/chapter-${String(numberChirho).padStart(2, '0')}-chirho.json`;
			if (
				!Number.isInteger(entryChirho?.number_chirho) ||
				numberChirho <= previousChirho ||
				numberChirho > bookChirho.chapters_chirho ||
				entryChirho.path_chirho !== `/${chapterPathChirho}`
			) {
				reasonsChirho.push(`/${summaryPathChirho} has an invalid or unordered chapter entry`);
				break;
			}
			previousChirho = numberChirho;
			listedChirho.add(chapterPathChirho);
			const bytesChirho = filesChirho.get(chapterPathChirho);
			if (!bytesChirho || sha256Chirho(bytesChirho) !== entryChirho.sha256_chirho) {
				reasonsChirho.push(`/${chapterPathChirho} does not match its summary sha256`);
				continue;
			}
			const chapterChirho = indexJsonChirho(bytesChirho);
			const groupsChirho = [
				[chapterChirho?.scenes_chirho, 'scene', entryChirho.scene_count_chirho],
				[chapterChirho?.icons_chirho, 'icon', entryChirho.icon_count_chirho],
				[
					chapterChirho?.lemma_icons_chirho === undefined ? [] : chapterChirho.lemma_icons_chirho,
					'icon',
					entryChirho.lemma_icon_count_chirho ?? 0
				]
			] as const;
			if (
				!chapterChirho ||
				chapterChirho.schema_version_chirho !== 1 ||
				chapterChirho.book_id_chirho !== bookChirho.book_id_chirho ||
				chapterChirho.chapter_chirho !== numberChirho ||
				groupsChirho.some(
					([itemsChirho, , countChirho]) =>
						!Array.isArray(itemsChirho) || itemsChirho.length !== countChirho
				)
			) {
				reasonsChirho.push(`/${chapterPathChirho} does not match its summary identity or counts`);
				continue;
			}
			const lessonChirho = new RegExp(
				`^${bookChirho.book_id_chirho}\\.${numberChirho}\\.[1-9]\\d{0,2}$`
			);
			const mismatchedChirho: string[] = [];
			const sceneVariantsChirho = new Map<string, Record<string, unknown>>();
			const chapterLemmaKeysChirho = new Set<string>();
			for (const [groupIndexChirho, [itemsChirho, kindChirho]] of groupsChirho.entries())
				for (const itemChirho of itemsChirho as Record<string, unknown>[]) {
					const defaultChirho = groupIndexChirho === 2;
					const sourceChirho = sourceIconsChirho.get(String(itemChirho?.id_chirho));
					const identityKeysChirho = [
						'id_chirho',
						'lesson_id_chirho',
						'token_id_chirho',
						'lemma_id_chirho',
						'lemma_augment_chirho',
						'lexical_form_chirho',
						'sense_id_chirho',
						'contextual_meaning_chirho',
						'sense_review_chirho',
						'evidence_refs_chirho'
					];
					const lemmaKeyChirho = JSON.stringify([
						itemChirho?.lemma_id_chirho,
						itemChirho?.lemma_augment_chirho,
						String(itemChirho?.lemma_id_chirho).startsWith('G')
							? itemChirho?.lexical_form_chirho
							: null
					]);
					const invalidDefaultChirho =
						defaultChirho &&
						(!sourceChirho ||
							identityKeysChirho.some(
								(keyChirho) =>
									JSON.stringify(sourceChirho[keyChirho]) !== JSON.stringify(itemChirho[keyChirho])
							) ||
							chapterLemmaKeysChirho.has(lemmaKeyChirho));
					if (defaultChirho) {
						chapterLemmaKeysChirho.add(lemmaKeyChirho);
						lemmaKeysChirho.add(lemmaKeyChirho);
					}
					const recordChirho = declaredChirho.get(String(itemChirho?.asset_path_chirho));
					let invalidSceneChirho = false;
					if (kindChirho === 'scene') {
						const variantChirho =
							itemChirho.variant_chirho === undefined ? 'standard' : itemChirho.variant_chirho;
						const identityChirho = {
							lesson_id_chirho: String(itemChirho.lesson_id_chirho),
							variant_chirho: String(variantChirho)
						};
						const keyChirho = JSON.stringify(identityChirho);
						invalidSceneChirho =
							!['standard', 'representation_reduced'].includes(String(variantChirho)) ||
							sceneVariantsChirho.has(keyChirho) ||
							((variantChirho !== 'standard' || recordChirho?.scene_record_chirho !== undefined) &&
								sourceScenesChirho.get(keyChirho) !== itemChirho.asset_path_chirho);
						sceneVariantsChirho.set(keyChirho, itemChirho);
					}
					if (
						(!defaultChirho && !lessonChirho.test(String(itemChirho?.lesson_id_chirho))) ||
						invalidDefaultChirho ||
						invalidSceneChirho ||
						!recordChirho ||
						recordChirho.kind_chirho !== kindChirho ||
						recordChirho.sha256_chirho !== itemChirho.sha256_chirho ||
						recordChirho.width_chirho !== itemChirho.width_chirho ||
						recordChirho.height_chirho !== itemChirho.height_chirho ||
						recordChirho.art_review_chirho !== itemChirho.art_review_chirho
					)
						mismatchedChirho.push(String(itemChirho?.asset_path_chirho));
				}
			for (const itemChirho of sceneVariantsChirho.values()) {
				if (itemChirho.variant_chirho !== 'representation_reduced') continue;
				const standardChirho = sceneVariantsChirho.get(
					JSON.stringify({
						lesson_id_chirho: String(itemChirho.lesson_id_chirho),
						variant_chirho: 'standard'
					})
				);
				if (
					!standardChirho ||
					standardChirho.asset_path_chirho === itemChirho.asset_path_chirho ||
					standardChirho.sha256_chirho === itemChirho.sha256_chirho
				)
					mismatchedChirho.push(String(itemChirho.asset_path_chirho));
			}
			if (mismatchedChirho.length)
				reasonsChirho.push(
					`/${chapterPathChirho} indexes ${mismatchedChirho.length} record(s) unlike their declared media or outside the chapter (first: ${mismatchedChirho[0]})`
				);
			scenesChirho += (groupsChirho[0][0] as unknown[]).length;
			iconsChirho += (groupsChirho[1][0] as unknown[]).length;
		}
		if (
			summaryChirho.scene_count_chirho !== scenesChirho ||
			summaryChirho.icon_count_chirho !== iconsChirho
		)
			reasonsChirho.push(`/${summaryPathChirho} totals do not match its chapters`);
		if (
			summaryChirho.lemma_icon_count_chirho !== undefined &&
			summaryChirho.lemma_icon_count_chirho !== lemmaKeysChirho.size
		)
			reasonsChirho.push(`/${summaryPathChirho} lemma-picture total does not match its chapters`);
		reportChirho.push({
			book_chirho: bookChirho.book_id_chirho,
			chapters_chirho: entriesChirho.length,
			scenes_chirho: scenesChirho,
			icons_chirho: iconsChirho,
			...(summaryChirho.lemma_icon_count_chirho !== undefined
				? { lemma_icons_chirho: lemmaKeysChirho.size }
				: {})
		});
	}
	for (const pathChirho of filesChirho.keys())
		if (SHARD_PATH_CHIRHO.test(pathChirho) && !listedChirho.has(pathChirho))
			reasonsChirho.push(`/${pathChirho} is not listed by its media summary`);
	return reportChirho;
}

// Delivery derivatives from scripts-chirho/art-chirho/prepare_delivery_media_chirho.py.
export const SCENE_DELIVERY_MAX_WIDTH_CHIRHO = 1200;
const DELIVERY_PATH_CHIRHO = /^objects-chirho\/([0-9a-f]{2})-chirho\/([0-9a-f]{64})-chirho\.webp$/;
export interface DeliveryEntryChirho {
	source_paths_chirho: string[];
	source_sha256_chirho: string;
	kind_chirho: MediaKindChirho;
	delivery_path_chirho: string;
	delivery_sha256_chirho: string;
	bytes_chirho: number;
	width_chirho: number;
	height_chirho: number;
	recipe_chirho: Record<string, unknown>;
}

/** Mapping entries keyed `kind:source_sha256`; malformed or conflicting entries are reasons. */
export function deliveryEntriesChirho(
	inputChirho: unknown,
	reasonsChirho: string[]
): Map<string, DeliveryEntryChirho> {
	const entriesChirho = new Map<string, DeliveryEntryChirho>();
	const mappingChirho = inputChirho as {
		schema_version_chirho?: unknown;
		entries_chirho?: unknown;
	};
	if (mappingChirho?.schema_version_chirho !== 1 || !Array.isArray(mappingChirho.entries_chirho)) {
		reasonsChirho.push('the delivery mapping is not schema version 1 with entries_chirho');
		return entriesChirho;
	}
	for (const entryChirho of mappingChirho.entries_chirho as DeliveryEntryChirho[]) {
		const pathChirho = DELIVERY_PATH_CHIRHO.exec(String(entryChirho?.delivery_path_chirho));
		const iconChirho = entryChirho?.kind_chirho === 'icon';
		const sizedChirho =
			Number.isInteger(entryChirho?.width_chirho) &&
			Number.isInteger(entryChirho?.height_chirho) &&
			entryChirho.width_chirho > 0 &&
			entryChirho.height_chirho > 0 &&
			(iconChirho
				? Math.max(entryChirho.width_chirho, entryChirho.height_chirho) <= ICON_MAX_EDGE_CHIRHO
				: entryChirho.width_chirho <= SCENE_DELIVERY_MAX_WIDTH_CHIRHO);
		if (
			!['icon', 'scene'].includes(String(entryChirho?.kind_chirho)) ||
			!SHA256_CHIRHO.test(String(entryChirho?.source_sha256_chirho)) ||
			!pathChirho ||
			pathChirho[2] !== entryChirho.delivery_sha256_chirho ||
			pathChirho[1] !== pathChirho[2].slice(0, 2) ||
			!Number.isInteger(entryChirho.bytes_chirho) ||
			entryChirho.bytes_chirho < 1 ||
			!sizedChirho ||
			!entryChirho.recipe_chirho ||
			typeof entryChirho.recipe_chirho !== 'object'
		) {
			reasonsChirho.push(
				`delivery entry for ${String(entryChirho?.source_sha256_chirho)} is malformed or oversized`
			);
			continue;
		}
		const keyChirho = `${entryChirho.kind_chirho}:${entryChirho.source_sha256_chirho}`;
		const earlierChirho = entriesChirho.get(keyChirho);
		if (
			earlierChirho &&
			earlierChirho.delivery_sha256_chirho !== entryChirho.delivery_sha256_chirho
		)
			reasonsChirho.push(`two derivatives are mapped for ${keyChirho}`);
		entriesChirho.set(keyChirho, entryChirho);
	}
	return entriesChirho;
}

/** Checks derivative bytes against their mapping entry: hash, length and decoded WebP size. */
export function deliveryProblemChirho(
	entryChirho: DeliveryEntryChirho,
	bytesChirho: Uint8Array
): string | null {
	if (
		bytesChirho.byteLength !== entryChirho.bytes_chirho ||
		sha256Chirho(bytesChirho) !== entryChirho.delivery_sha256_chirho
	)
		return `${entryChirho.delivery_path_chirho} does not match its mapped sha256 and length`;
	try {
		const infoChirho = readWebpChirho(bytesChirho);
		if (
			infoChirho.width_chirho !== entryChirho.width_chirho ||
			infoChirho.height_chirho !== entryChirho.height_chirho
		)
			return `${entryChirho.delivery_path_chirho} decodes to a different size than mapped`;
	} catch (errorChirho) {
		return `${entryChirho.delivery_path_chirho} is not valid WebP (${(errorChirho as Error).message})`;
	}
	return null;
}

/** Collects icons_chirho and scenes_chirho declarations; any other top-level array is refused. */
export function mediaRecordsChirho(
	nameChirho: string,
	inputChirho: unknown,
	reasonsChirho: string[]
): MediaRecordChirho[] {
	if (!inputChirho || typeof inputChirho !== 'object' || Array.isArray(inputChirho)) {
		reasonsChirho.push(`${nameChirho} is not a JSON object`);
		return [];
	}
	const recordsChirho: MediaRecordChirho[] = [];
	for (const [keyChirho, valueChirho] of Object.entries(inputChirho)) {
		if (!Array.isArray(valueChirho)) continue;
		const kindChirho = MEDIA_KINDS_CHIRHO[keyChirho];
		if (!kindChirho) {
			reasonsChirho.push(`${nameChirho} has an unknown media array ${keyChirho}`);
			continue;
		}
		valueChirho.forEach((itemChirho: Partial<MediaRecordChirho>, indexChirho) => {
			const labelChirho = `${nameChirho} ${keyChirho}[${indexChirho}]`;
			const { width_chirho: widthChirho, height_chirho: heightChirho } = itemChirho ?? {};
			const sceneInputChirho = itemChirho as unknown as Record<string, unknown>;
			const variantChirho =
				sceneInputChirho?.variant_chirho === undefined
					? 'standard'
					: sceneInputChirho.variant_chirho;
			const lessonIdChirho =
				sceneInputChirho?.lesson_id_chirho ??
				(inputChirho as Record<string, unknown>).lesson_id_chirho;
			if (
				typeof itemChirho?.asset_path_chirho !== 'string' ||
				!MEDIA_PATH_CHIRHO.test(itemChirho.asset_path_chirho) ||
				typeof itemChirho.sha256_chirho !== 'string' ||
				!SHA256_CHIRHO.test(itemChirho.sha256_chirho) ||
				!Number.isInteger(widthChirho) ||
				!Number.isInteger(heightChirho) ||
				Number(widthChirho) < 1 ||
				Number(heightChirho) < 1 ||
				!['pending', 'approved'].includes(String(itemChirho.art_review_chirho)) ||
				(kindChirho === 'scene' &&
					!['standard', 'representation_reduced'].includes(String(variantChirho))) ||
				(sceneInputChirho?.fallback_chirho !== undefined &&
					(kindChirho !== 'scene' ||
						typeof sceneInputChirho.fallback_chirho !== 'boolean' ||
						(sceneInputChirho.fallback_chirho && variantChirho !== 'standard')))
			) {
				reasonsChirho.push(`${labelChirho} lacks a valid path, sha256, size or review state`);
				return;
			}
			if (
				kindChirho === 'icon' &&
				Math.max(Number(widthChirho), Number(heightChirho)) > ICON_MAX_EDGE_CHIRHO
			)
				reasonsChirho.push(`${labelChirho} declares an icon over ${ICON_MAX_EDGE_CHIRHO}px`);
			recordsChirho.push({
				...(sceneInputChirho.fallback_chirho === true ? { fallback_chirho: true } : {}),
				...(kindChirho === 'scene' && typeof lessonIdChirho === 'string'
					? {
							scene_record_chirho: {
								lesson_id_chirho: lessonIdChirho,
								variant_chirho: String(variantChirho)
							}
						}
					: {}),
				...(kindChirho === 'icon'
					? {
							icon_record_chirho: {
								...Object.fromEntries(
									[
										'id_chirho',
										'token_id_chirho',
										'lemma_id_chirho',
										'lemma_augment_chirho',
										'lexical_form_chirho',
										'sense_id_chirho',
										'contextual_meaning_chirho',
										'sense_review_chirho',
										'evidence_refs_chirho'
									].map((fieldChirho) => [
										fieldChirho,
										(itemChirho as unknown as Record<string, unknown>)[fieldChirho]
									])
								),
								lesson_id_chirho:
									(itemChirho as unknown as Record<string, unknown>).lesson_id_chirho ??
									(inputChirho as Record<string, unknown>).lesson_id_chirho
							}
						}
					: {}),
				asset_path_chirho: itemChirho.asset_path_chirho,
				sha256_chirho: itemChirho.sha256_chirho,
				width_chirho: Number(widthChirho),
				height_chirho: Number(heightChirho),
				art_review_chirho: itemChirho.art_review_chirho as ReviewStateChirho,
				kind_chirho: kindChirho
			});
		});
	}
	return recordsChirho;
}

/** Checks one file's bytes against its declaration: hash, WebP structure, dimensions, edge cap. */
export function mediaProblemChirho(
	recordChirho: MediaRecordChirho,
	bytesChirho: Uint8Array
): string | null {
	if (sha256Chirho(bytesChirho) !== recordChirho.sha256_chirho)
		return `${recordChirho.asset_path_chirho} bytes do not match the declared sha256`;
	try {
		const infoChirho = readWebpChirho(bytesChirho);
		if (
			infoChirho.width_chirho !== recordChirho.width_chirho ||
			infoChirho.height_chirho !== recordChirho.height_chirho
		)
			return `${recordChirho.asset_path_chirho} decodes as ${infoChirho.width_chirho}x${infoChirho.height_chirho}, not the declared size`;
		if (
			recordChirho.kind_chirho === 'icon' &&
			Math.max(infoChirho.width_chirho, infoChirho.height_chirho) > ICON_MAX_EDGE_CHIRHO
		)
			return `${recordChirho.asset_path_chirho} is an icon over ${ICON_MAX_EDGE_CHIRHO}px`;
	} catch (errorChirho) {
		return `${recordChirho.asset_path_chirho} is not valid WebP (${(errorChirho as Error).message})`;
	}
	return null;
}

/** Every shipped WebP must be declared once and match; every declaration must ship. */
export function verifyMediaChirho(
	recordsChirho: MediaRecordChirho[],
	filesChirho: FilesChirho,
	allowPendingChirho: boolean,
	reasonsChirho: string[]
): MediaRecordChirho[] {
	const declaredChirho = new Map<string, MediaRecordChirho>();
	for (const recordChirho of recordsChirho) {
		const assetChirho: MediaRecordChirho = {
			asset_path_chirho: recordChirho.asset_path_chirho,
			sha256_chirho: recordChirho.sha256_chirho,
			width_chirho: recordChirho.width_chirho,
			height_chirho: recordChirho.height_chirho,
			art_review_chirho: recordChirho.art_review_chirho,
			kind_chirho: recordChirho.kind_chirho
		};
		const earlierChirho = declaredChirho.get(recordChirho.asset_path_chirho);
		if (earlierChirho && JSON.stringify(earlierChirho) !== JSON.stringify(assetChirho))
			reasonsChirho.push(
				`${recordChirho.asset_path_chirho} is declared twice with different facts`
			);
		declaredChirho.set(recordChirho.asset_path_chirho, assetChirho);
	}
	for (const [pathChirho, bytesChirho] of filesChirho) {
		if (classifyPathChirho(pathChirho) !== 'media') continue;
		const recordChirho = declaredChirho.get(`/${pathChirho}`);
		const problemChirho = recordChirho
			? mediaProblemChirho(recordChirho, bytesChirho)
			: `/${pathChirho} is not declared in data-chirho/media-chirho`;
		if (problemChirho) reasonsChirho.push(problemChirho);
	}
	const pendingChirho: string[] = [];
	for (const recordChirho of declaredChirho.values()) {
		if (!filesChirho.has(recordChirho.asset_path_chirho.slice(1)))
			reasonsChirho.push(
				`${recordChirho.asset_path_chirho} is declared but missing from the build`
			);
		if (recordChirho.art_review_chirho === 'pending')
			pendingChirho.push(recordChirho.asset_path_chirho);
	}
	if (pendingChirho.length && !allowPendingChirho)
		reasonsChirho.push(
			`${pendingChirho.length} media file(s) are still pending review (first: ${pendingChirho[0]}); a public release needs approval, or use --allow-pending-media-chirho for a local review build`
		);
	return [...declaredChirho.values()].sort((aChirho, bChirho) =>
		aChirho.asset_path_chirho.localeCompare(bChirho.asset_path_chirho)
	);
}

/** Every content file must be a book manifest or a chapter it lists with a matching hash. */
export function verifyContentChirho(
	filesChirho: FilesChirho,
	reasonsChirho: string[]
): { manifest_chirho: string; chapters_chirho: number }[] {
	const listedChirho = new Set<string>();
	const summaryChirho: { manifest_chirho: string; chapters_chirho: number }[] = [];
	for (const [pathChirho, bytesChirho] of filesChirho) {
		if (!CONTENT_MANIFEST_CHIRHO.test(pathChirho)) continue;
		const folderChirho = `/${pathChirho.slice(0, pathChirho.lastIndexOf('/') + 1)}`;
		let manifestChirho: { schema_version_chirho?: unknown; chapters_chirho?: unknown };
		try {
			manifestChirho = JSON.parse(new TextDecoder().decode(bytesChirho));
		} catch {
			reasonsChirho.push(`/${pathChirho} is not valid JSON`);
			continue;
		}
		const chaptersChirho = manifestChirho.chapters_chirho;
		if (manifestChirho.schema_version_chirho !== 1 || !Array.isArray(chaptersChirho)) {
			reasonsChirho.push(`/${pathChirho} lacks schema_version_chirho 1 and chapters_chirho`);
			continue;
		}
		for (const chapterChirho of chaptersChirho as {
			path_chirho?: unknown;
			sha256_chirho?: unknown;
		}[]) {
			const chapterPathChirho = String(chapterChirho?.path_chirho);
			const nameChirho = chapterPathChirho.slice(folderChirho.length);
			if (
				!chapterPathChirho.startsWith(folderChirho) ||
				!/^[a-z0-9][a-z0-9-]*\.json$/.test(nameChirho) ||
				nameChirho === 'manifest-chirho.json' ||
				listedChirho.has(chapterPathChirho)
			) {
				reasonsChirho.push(`/${pathChirho} lists an invalid or repeated path ${chapterPathChirho}`);
				continue;
			}
			listedChirho.add(chapterPathChirho);
			const chapterBytesChirho = filesChirho.get(chapterPathChirho.slice(1));
			if (!chapterBytesChirho) reasonsChirho.push(`${chapterPathChirho} is listed but missing`);
			else if (sha256Chirho(chapterBytesChirho) !== chapterChirho.sha256_chirho)
				reasonsChirho.push(`${chapterPathChirho} does not match its manifest sha256`);
		}
		summaryChirho.push({
			manifest_chirho: `/${pathChirho}`,
			chapters_chirho: chaptersChirho.length
		});
	}
	for (const pathChirho of filesChirho.keys())
		if (
			classifyPathChirho(pathChirho) === 'content' &&
			!CONTENT_MANIFEST_CHIRHO.test(pathChirho) &&
			!listedChirho.has(`/${pathChirho}`)
		)
			reasonsChirho.push(`/${pathChirho} is not listed by a content manifest`);
	return summaryChirho.sort((aChirho, bChirho) =>
		aChirho.manifest_chirho.localeCompare(bChirho.manifest_chirho)
	);
}

/** Parses KEY=value lines; only values long enough to be credentials are kept for scanning. */
export function envSecretsChirho(textChirho: string): Map<string, string> {
	const secretsChirho = new Map<string, string>();
	for (const lineChirho of textChirho.split(/\r?\n/)) {
		const matchChirho = /^\s*(?:export\s+)?([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*?)\s*$/.exec(
			lineChirho
		);
		if (!matchChirho) continue;
		// The shared Turnstile sitekey is deliberately public. Its paired secret remains scanned.
		if (matchChirho[1] === 'TURNSTILE_SHARED_SITE_KEY_CHIRHO') continue;
		const valueChirho = matchChirho[2].replace(/^(['"])(.*)\1$/, '$2');
		if (valueChirho.length >= 12) secretsChirho.set(matchChirho[1], valueChirho);
	}
	return secretsChirho;
}

/** Refuses output that carries a credential value, a local filesystem path or a source map link. */
export function scanPrivateChirho(
	filesChirho: FilesChirho,
	secretsChirho: Map<string, string>,
	localPathsChirho: string[],
	reasonsChirho: string[]
): void {
	const needlesChirho = [
		...[...secretsChirho].map(([nameChirho, valueChirho]) => ({
			text_chirho: valueChirho,
			label_chirho: `the value of ${nameChirho}`
		})),
		...localPathsChirho.map((pathChirho) => ({
			text_chirho: pathChirho,
			label_chirho: 'a local filesystem path'
		}))
	];
	for (const [pathChirho, bytesChirho] of filesChirho) {
		const bufferChirho = Buffer.from(
			bytesChirho.buffer,
			bytesChirho.byteOffset,
			bytesChirho.length
		);
		for (const needleChirho of needlesChirho)
			if (bufferChirho.includes(needleChirho.text_chirho))
				reasonsChirho.push(`/${pathChirho} contains ${needleChirho.label_chirho}`);
		if (/\.(?:js|css)$/.test(pathChirho) && bufferChirho.includes('sourceMappingURL='))
			reasonsChirho.push(`/${pathChirho} links a source map`);
	}
}

/** Deterministic file list and release id: sorted paths with sizes and hashes. */
export function releaseFilesChirho(filesChirho: FilesChirho): {
	files_chirho: ReleaseFileChirho[];
	release_id_chirho: string;
} {
	const listChirho = [...filesChirho]
		.map(([pathChirho, bytesChirho]) => ({
			path_chirho: `/${pathChirho}`,
			bytes_chirho: bytesChirho.byteLength,
			sha256_chirho: sha256Chirho(bytesChirho)
		}))
		.sort((aChirho, bChirho) => (aChirho.path_chirho < bChirho.path_chirho ? -1 : 1));
	return { files_chirho: listChirho, release_id_chirho: sha256Chirho(JSON.stringify(listChirho)) };
}
