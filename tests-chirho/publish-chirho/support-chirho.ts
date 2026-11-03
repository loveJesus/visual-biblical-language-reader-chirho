// For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life. — John 3:16 (KJV)

// Synthetic project trees for publication tests: a fake adapter output, media manifest,
// content manifest and env file in a temporary root. No real build or network is involved.

import { mkdir, mkdtemp, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { sha256Chirho } from '../../scripts-chirho/publish-chirho/release_rules_chirho';

/** Minimal VP8L WebP header with the requested canvas; enough for the header-only reader. */
export function webpChirho(widthChirho: number, heightChirho: number): Uint8Array {
	const bytesChirho = new Uint8Array(30);
	const viewChirho = new DataView(bytesChirho.buffer);
	bytesChirho.set(new TextEncoder().encode('RIFF'), 0);
	viewChirho.setUint32(4, bytesChirho.length - 8, true);
	bytesChirho.set(new TextEncoder().encode('WEBPVP8L'), 8);
	viewChirho.setUint32(16, 10, true);
	bytesChirho[20] = 0x2f;
	viewChirho.setUint32(21, (widthChirho - 1) | ((heightChirho - 1) << 14), true);
	return bytesChirho;
}

export const PNG_BYTES_CHIRHO = new Uint8Array([
	0x89,
	0x50,
	0x4e,
	0x47,
	0x0d,
	0x0a,
	0x1a,
	0x0a,
	...new Array(30).fill(0)
]);

export interface ProjectChirho {
	root_chirho: string;
	adapter_chirho: Map<string, Uint8Array | string>;
	media_chirho: Record<string, unknown>[];
	env_chirho: string;
	/** Edits the generated Proverbs chapter shard before its summary hash is computed. */
	shard_edit_chirho?: (chapterChirho: Record<string, unknown>) => void;
}

/** Proverbs chapter 1 shard and summary indexing every declared record as Prov.1.1. */
export function mediaShardsChirho(projectChirho: ProjectChirho): Map<string, string> {
	const recordsChirho = (keyChirho: string) =>
		projectChirho.media_chirho
			.filter((mediaChirho) => mediaChirho.key_chirho === keyChirho)
			.map((mediaChirho) => {
				const recordChirho: Record<string, unknown> = {
					lesson_id_chirho: 'Prov.1.1',
					...mediaChirho
				};
				delete recordChirho.key_chirho;
				return recordChirho;
			});
	const chapterChirho: Record<string, unknown> = {
		schema_version_chirho: 1,
		book_id_chirho: 'Prov',
		chapter_chirho: 1,
		scenes_chirho: recordsChirho('scenes_chirho'),
		icons_chirho: recordsChirho('icons_chirho')
	};
	projectChirho.shard_edit_chirho?.(chapterChirho);
	const chapterTextChirho = JSON.stringify(chapterChirho);
	const scenesChirho = (chapterChirho.scenes_chirho as unknown[]).length;
	const iconsChirho = (chapterChirho.icons_chirho as unknown[]).length;
	return new Map([
		['media-chirho/proverbs-chirho/chapter-01-chirho.json', chapterTextChirho],
		[
			'media-chirho/proverbs-chirho/summary-chirho.json',
			JSON.stringify({
				schema_version_chirho: 1,
				book_id_chirho: 'Prov',
				scene_count_chirho: scenesChirho,
				icon_count_chirho: iconsChirho,
				chapters_chirho: [
					{
						number_chirho: 1,
						path_chirho: '/media-chirho/proverbs-chirho/chapter-01-chirho.json',
						sha256_chirho: sha256Chirho(chapterTextChirho),
						scene_count_chirho: scenesChirho,
						icon_count_chirho: iconsChirho
					}
				]
			})
		]
	]);
}

/** A passing project: one approved icon, one approved scene and one listed chapter. */
export function baseProjectChirho(rootChirho: string): ProjectChirho {
	const iconChirho = webpChirho(128, 128);
	const sceneChirho = webpChirho(400, 300);
	const chapterChirho = '{"book_id_chirho":"Prov","chapter_chirho":1,"verses_chirho":[]}';
	return {
		root_chirho: rootChirho,
		adapter_chirho: new Map<string, Uint8Array | string>([
			['index.html', '<!doctype html><title>Hinneh</title>'],
			['__data.json', '{"type":"data"}'],
			['_app/version.json', '{"version":"fixed-chirho"}'],
			['_app/immutable/entry/app.Abc123.js', 'export const app = 1;'],
			['_worker.js', 'export default { fetch() {} };'],
			['.assetsignore', '_worker.js\n'],
			['_headers', '/_app/*\n  Cache-Control: no-cache\n'],
			['robots.txt', 'User-agent: *\n'],
			[
				'media-index-chirho.json',
				JSON.stringify({ schema_version_chirho: 1, scenes_chirho: [], icons_chirho: [] })
			],
			['assets-chirho/icons-chirho/a-chirho.webp', iconChirho],
			['assets-chirho/scene-chirho.webp', sceneChirho],
			['content-chirho/book-chirho/chapter-01-chirho.json', chapterChirho],
			[
				'content-chirho/book-chirho/manifest-chirho.json',
				JSON.stringify({
					schema_version_chirho: 1,
					chapters_chirho: [
						{
							path_chirho: '/content-chirho/book-chirho/chapter-01-chirho.json',
							sha256_chirho: sha256Chirho(chapterChirho)
						}
					]
				})
			]
		]),
		media_chirho: [
			{
				key_chirho: 'icons_chirho',
				asset_path_chirho: '/assets-chirho/icons-chirho/a-chirho.webp',
				sha256_chirho: sha256Chirho(iconChirho),
				width_chirho: 128,
				height_chirho: 128,
				art_review_chirho: 'approved'
			},
			{
				key_chirho: 'scenes_chirho',
				asset_path_chirho: '/assets-chirho/scene-chirho.webp',
				sha256_chirho: sha256Chirho(sceneChirho),
				width_chirho: 400,
				height_chirho: 300,
				art_review_chirho: 'approved'
			}
		],
		env_chirho: 'TMUX_SESSION_NAME_CHIRHO=SHORT\nEXAMPLE_TOKEN_CHIRHO="example-secret-value-123"\n'
	};
}

export async function temporaryRootChirho(): Promise<string> {
	return mkdtemp(join(tmpdir(), 'hinneh-publish-chirho-'));
}

/** Writes the adapter output, media shards, the media manifest (static copies too) and env file. */
export async function writeProjectChirho(projectChirho: ProjectChirho): Promise<void> {
	const writeChirho = async (pathChirho: string, dataChirho: Uint8Array | string) => {
		await mkdir(dirname(pathChirho), { recursive: true });
		await writeFile(pathChirho, dataChirho);
	};
	for (const [pathChirho, dataChirho] of mediaShardsChirho(projectChirho))
		if (!projectChirho.adapter_chirho.has(pathChirho))
			projectChirho.adapter_chirho.set(pathChirho, dataChirho);
	for (const [pathChirho, dataChirho] of projectChirho.adapter_chirho) {
		await writeChirho(
			join(projectChirho.root_chirho, '.svelte-kit', 'cloudflare', pathChirho),
			dataChirho
		);
		if (pathChirho.startsWith('assets-chirho/'))
			await writeChirho(join(projectChirho.root_chirho, 'static', pathChirho), dataChirho);
	}
	const manifestChirho: Record<string, unknown[]> = { icons_chirho: [], scenes_chirho: [] };
	for (const { key_chirho: keyChirho, ...itemChirho } of projectChirho.media_chirho)
		(manifestChirho[String(keyChirho)] ??= []).push(itemChirho);
	await writeChirho(
		join(projectChirho.root_chirho, 'data-chirho', 'media-chirho', 'media-chirho.json'),
		JSON.stringify({ schema_version_chirho: 1, ...manifestChirho })
	);
	await writeChirho(join(projectChirho.root_chirho, '.env'), projectChirho.env_chirho);
}
