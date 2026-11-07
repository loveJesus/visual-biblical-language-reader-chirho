// For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life. — John 3:16 (KJV)

import { lstat, readdir, readFile, rm, symlink, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { afterEach, describe, expect, it } from 'vitest';
import {
	buildReleaseChirho,
	verifyReleaseChirho,
	type BuildOptionsChirho,
	type GitStateChirho
} from '../../scripts-chirho/publish-chirho/build_release_chirho';
import {
	RELEASE_HEADERS_CHIRHO,
	RefusalChirho,
	sha256Chirho
} from '../../scripts-chirho/publish-chirho/release_rules_chirho';
import { sitemapXmlChirho } from '../../src/lib/site-chirho/library-chirho';
import {
	PNG_BYTES_CHIRHO,
	baseProjectChirho,
	temporaryRootChirho,
	webpChirho,
	writeProjectChirho,
	type ProjectChirho
} from './support-chirho';

const CLEAN_CHIRHO: GitStateChirho = { commit_chirho: 'c'.repeat(40), clean_chirho: true };
const SECRET_CHIRHO = 'example-secret-value-123';
const rootsChirho: string[] = [];

afterEach(async () => {
	await Promise.all(
		rootsChirho.splice(0).map((rootChirho) => rm(rootChirho, { recursive: true, force: true }))
	);
});

async function makeProjectChirho(mutateChirho?: (fixtureChirho: ProjectChirho) => void) {
	const rootChirho = await temporaryRootChirho();
	rootsChirho.push(rootChirho);
	const projectChirho = baseProjectChirho(rootChirho);
	mutateChirho?.(projectChirho);
	await writeProjectChirho(projectChirho);
	return projectChirho;
}

function buildChirho(
	projectChirho: ProjectChirho,
	overridesChirho: Partial<BuildOptionsChirho> = {}
) {
	return buildReleaseChirho({
		root_chirho: projectChirho.root_chirho,
		allow_pending_media_chirho: false,
		fresh_build_chirho: true,
		git_chirho: CLEAN_CHIRHO,
		local_paths_chirho: [projectChirho.root_chirho],
		...overridesChirho
	});
}

async function refusalChirho(buildingChirho: Promise<unknown>): Promise<string> {
	const errorChirho = await buildingChirho.then(
		() => null,
		(errorChirho: unknown) => errorChirho
	);
	expect(errorChirho).toBeInstanceOf(RefusalChirho);
	return (errorChirho as Error).message;
}

const missingChirho = (pathChirho: string) => expect(lstat(pathChirho)).rejects.toThrow();

describe('release builder boundary', () => {
	it('refuses a media index that points to an undeclared image', async () => {
		const projectChirho = await makeProjectChirho((fixtureChirho) => {
			fixtureChirho.adapter_chirho.set(
				'media-index-chirho.json',
				JSON.stringify({
					schema_version_chirho: 1,
					icons_chirho: [],
					scenes_chirho: [
						{
							asset_path_chirho: '/assets-chirho/missing-chirho.webp',
							sha256_chirho: 'a'.repeat(64),
							width_chirho: 400,
							height_chirho: 300,
							art_review_chirho: 'approved'
						}
					]
				})
			);
		});
		expect(await refusalChirho(buildChirho(projectChirho))).toContain('Media index is invalid');
	});

	it('publishes only allowlisted public files from a clean fresh build, and verifies them', async () => {
		const projectChirho = await makeProjectChirho();
		const rootChirho = projectChirho.root_chirho;
		const { manifest_chirho: manifestChirho, directory_chirho: directoryChirho } =
			await buildChirho(projectChirho);
		expect(manifestChirho.release_kind_chirho).toBe('publishable');
		expect(directoryChirho).toBe(join(rootChirho, 'build-chirho', 'public-chirho'));
		expect(manifestChirho.excluded_server_artifacts_chirho).toEqual([
			'.assetsignore',
			'_headers',
			'_worker.js'
		]);
		const publishedChirho = await readdir(directoryChirho, { recursive: true });
		expect(publishedChirho).not.toContain('_worker.js');
		expect(publishedChirho).not.toContain('.assetsignore');
		expect(await readFile(join(directoryChirho, '_headers'), 'utf8')).toBe(RELEASE_HEADERS_CHIRHO);
		expect(manifestChirho.files_chirho.map((fileChirho) => fileChirho.path_chirho)).toEqual(
			[
				'/__data.json',
				'/_app/immutable/entry/app.Abc123.js',
				'/_app/version.json',
				'/assets-chirho/icons-chirho/a-chirho.webp',
				'/assets-chirho/scene-chirho.webp',
				'/content-chirho/book-chirho/chapter-01-chirho.json',
				'/content-chirho/book-chirho/manifest-chirho.json',
				'/index.html',
				'/media-chirho/proverbs-chirho/chapter-01-chirho.json',
				'/media-chirho/proverbs-chirho/summary-chirho.json',
				'/media-index-chirho.json',
				'/robots.txt'
			].sort()
		);
		expect(manifestChirho.media_shards_chirho).toEqual([
			{ book_chirho: 'Prov', chapters_chirho: 1, scenes_chirho: 1, icons_chirho: 1 }
		]);
		expect(await verifyReleaseChirho(rootChirho, 'publishable', CLEAN_CHIRHO)).toEqual([]);
		expect(
			await verifyReleaseChirho(rootChirho, 'publishable', {
				...CLEAN_CHIRHO,
				commit_chirho: 'd'.repeat(40)
			})
		).toEqual(['the publishable release no longer matches a clean checkout of its commit']);
		await writeFile(join(directoryChirho, 'extra.html'), '<p>added later</p>');
		expect(await verifyReleaseChirho(rootChirho, 'publishable', CLEAN_CHIRHO)).toEqual([
			'files on disk differ from release-manifest-chirho.json'
		]);
	});

	it('never turns pending media into an approved or deployable release', async () => {
		const projectChirho = await makeProjectChirho((fixtureChirho) => {
			fixtureChirho.media_chirho[0].art_review_chirho = 'pending';
		});
		const rootChirho = projectChirho.root_chirho;
		expect(await refusalChirho(buildChirho(projectChirho))).toMatch(/pending review/);
		await missingChirho(join(rootChirho, 'build-chirho'));
		const { manifest_chirho: manifestChirho, directory_chirho: directoryChirho } =
			await buildChirho(projectChirho, { allow_pending_media_chirho: true });
		expect(manifestChirho.release_kind_chirho).toBe('local_review');
		expect(directoryChirho).toBe(
			join(rootChirho, 'build-chirho', 'review-chirho', 'public-chirho')
		);
		expect(
			manifestChirho.media_chirho.find((mediaChirho) => mediaChirho.kind_chirho === 'icon')
				?.art_review_chirho
		).toBe('pending');
		await missingChirho(join(rootChirho, 'build-chirho', 'public-chirho'));
	});

	it('keeps dirty, uncommitted and reused builds out of the deployable directory', async () => {
		const projectChirho = await makeProjectChirho();
		for (const overridesChirho of [
			{ git_chirho: { commit_chirho: 'c'.repeat(40), clean_chirho: false } },
			{ git_chirho: { commit_chirho: null, clean_chirho: false } },
			{ fresh_build_chirho: false }
		])
			expect(
				(await buildChirho(projectChirho, overridesChirho)).manifest_chirho.release_kind_chirho
			).toBe('local_review');
		await missingChirho(join(projectChirho.root_chirho, 'build-chirho', 'public-chirho'));
	});

	it('writes byte-identical manifests for identical inputs', async () => {
		const projectChirho = await makeProjectChirho();
		const manifestPathChirho = join(
			projectChirho.root_chirho,
			'build-chirho',
			'review-chirho',
			'release-manifest-chirho.json'
		);
		const firstChirho = await buildChirho(projectChirho, { fresh_build_chirho: false });
		const firstBytesChirho = await readFile(manifestPathChirho);
		const secondChirho = await buildChirho(projectChirho, { fresh_build_chirho: false });
		expect(secondChirho.manifest_chirho.release_id_chirho).toBe(
			firstChirho.manifest_chirho.release_id_chirho
		);
		expect(await readFile(manifestPathChirho)).toEqual(firstBytesChirho);
	});

	const casesChirho: [string, (fixtureChirho: ProjectChirho) => void, RegExp][] = [
		[
			'a missing prerendered root',
			(fixtureChirho) => fixtureChirho.adapter_chirho.delete('index.html'),
			/index\.html is missing/
		],
		[
			'an undeclared WebP',
			(fixtureChirho) =>
				fixtureChirho.adapter_chirho.set('assets-chirho/extra-chirho.webp', webpChirho(64, 64)),
			/not declared/
		],
		[
			'a PNG',
			(fixtureChirho) =>
				fixtureChirho.adapter_chirho.set('assets-chirho/scene-chirho.png', PNG_BYTES_CHIRHO),
			/not on the publication allowlist/
		],
		[
			'PNG bytes named .webp',
			(fixtureChirho) => {
				fixtureChirho.adapter_chirho.set(
					'assets-chirho/icons-chirho/a-chirho.webp',
					PNG_BYTES_CHIRHO
				);
				fixtureChirho.media_chirho[0].sha256_chirho = sha256Chirho(PNG_BYTES_CHIRHO);
			},
			/not valid WebP/
		],
		[
			'an icon over 128px',
			(fixtureChirho) => {
				const bigChirho = webpChirho(129, 129);
				fixtureChirho.adapter_chirho.set('assets-chirho/icons-chirho/a-chirho.webp', bigChirho);
				Object.assign(fixtureChirho.media_chirho[0], {
					sha256_chirho: sha256Chirho(bigChirho),
					width_chirho: 129,
					height_chirho: 129
				});
			},
			/icon over 128px/
		],
		[
			'bytes that differ from the declaration',
			(fixtureChirho) =>
				fixtureChirho.adapter_chirho.set('assets-chirho/scene-chirho.webp', webpChirho(400, 301)),
			/do not match the declared sha256/
		],
		[
			'declared media missing from the build',
			(fixtureChirho) => fixtureChirho.adapter_chirho.delete('assets-chirho/scene-chirho.webp'),
			/declared but missing/
		],
		[
			'an unknown media array',
			(fixtureChirho) => fixtureChirho.media_chirho.push({ key_chirho: 'gallery_chirho' }),
			/unknown media array/
		],
		[
			'an env file',
			(fixtureChirho) => fixtureChirho.adapter_chirho.set('.env', 'X=1'),
			/unsafe or hidden path segment/
		],
		[
			'a source map',
			(fixtureChirho) =>
				fixtureChirho.adapter_chirho.set('_app/immutable/entry/app.Abc123.js.map', '{}'),
			/source map/
		],
		[
			'a server bundle path',
			(fixtureChirho) => fixtureChirho.adapter_chirho.set('server/index.js', 'export {};'),
			/not on the publication allowlist/
		],
		[
			'a malformed file name',
			(fixtureChirho) =>
				fixtureChirho.adapter_chirho.set('assets-chirho/bad name.webp', webpChirho(8, 8)),
			/unsafe or hidden path segment/
		],
		[
			'a leaked credential value',
			(fixtureChirho) => fixtureChirho.adapter_chirho.set('index.html', `<p>${SECRET_CHIRHO}</p>`),
			/contains the value of EXAMPLE_TOKEN_CHIRHO/
		],
		[
			'a leaked local path',
			(fixtureChirho) =>
				fixtureChirho.adapter_chirho.set('index.html', `<p>${fixtureChirho.root_chirho}/src</p>`),
			/local filesystem path/
		],
		[
			'a source map link',
			(fixtureChirho) =>
				fixtureChirho.adapter_chirho.set(
					'_app/immutable/entry/app.Abc123.js',
					'//# sourceMappingURL=app.js.map'
				),
			/links a source map/
		],
		[
			'an unlisted chapter',
			(fixtureChirho) =>
				fixtureChirho.adapter_chirho.set('content-chirho/book-chirho/chapter-02-chirho.json', '{}'),
			/not listed by a content manifest/
		],
		[
			'a tampered chapter',
			(fixtureChirho) =>
				fixtureChirho.adapter_chirho.set(
					'content-chirho/book-chirho/chapter-01-chirho.json',
					'{"tampered":true}'
				),
			/does not match its manifest sha256/
		],
		[
			'a media shard that differs from its summary',
			(fixtureChirho) =>
				fixtureChirho.adapter_chirho.set(
					'media-chirho/proverbs-chirho/chapter-01-chirho.json',
					'{}'
				),
			/does not match its summary sha256/
		],
		[
			'an unlisted media shard',
			(fixtureChirho) =>
				fixtureChirho.adapter_chirho.set(
					'media-chirho/proverbs-chirho/chapter-02-chirho.json',
					'{}'
				),
			/not listed by its media summary/
		],
		[
			'an unknown media index file',
			(fixtureChirho) =>
				fixtureChirho.adapter_chirho.set('media-chirho/proverbs-chirho/notes-chirho.json', '{}'),
			/not on the publication allowlist/
		],
		[
			'a media index for an unknown book',
			(fixtureChirho) =>
				fixtureChirho.adapter_chirho.set(
					'media-chirho/unknown-book-chirho/summary-chirho.json',
					'{}'
				),
			/not on the publication allowlist/
		],
		[
			'a shard record unlike its declaration',
			(fixtureChirho) => {
				fixtureChirho.shard_edit_chirho = (chapterChirho) => {
					(chapterChirho.icons_chirho as Record<string, unknown>[])[0].art_review_chirho =
						'pending';
				};
			},
			/unlike their declared media/
		],
		[
			'a shard record from another chapter',
			(fixtureChirho) => {
				fixtureChirho.shard_edit_chirho = (chapterChirho) => {
					(chapterChirho.scenes_chirho as Record<string, unknown>[])[0].lesson_id_chirho =
						'Prov.2.1';
				};
			},
			/outside the chapter/
		],
		[
			'a shard with the wrong chapter identity',
			(fixtureChirho) => {
				fixtureChirho.shard_edit_chirho = (chapterChirho) => {
					chapterChirho.chapter_chirho = 2;
				};
			},
			/identity or counts/
		]
	];

	it('accepts shard records with positional tokens, exact forms and OSHB particle lemmas', async () => {
		const projectChirho = await makeProjectChirho((fixtureChirho) => {
			fixtureChirho.shard_edit_chirho = (chapterChirho) => {
				Object.assign((chapterChirho.icons_chirho as Record<string, unknown>[])[0], {
					token_id_chirho: 'Prov.1.1!1',
					lemma_id_chirho: 'oshb:b',
					lexical_form_chirho: 'λόγος'
				});
			};
		});
		const { manifest_chirho: manifestChirho } = await buildChirho(projectChirho);
		expect(manifestChirho.media_shards_chirho[0].icons_chirho).toBe(1);
	});

	it('builds without the legacy single media index', async () => {
		const projectChirho = await makeProjectChirho((fixtureChirho) => {
			fixtureChirho.adapter_chirho.delete('media-index-chirho.json');
		});
		const { manifest_chirho: manifestChirho } = await buildChirho(projectChirho);
		expect(manifestChirho.release_kind_chirho).toBe('publishable');
	});

	it('publishes a verified sitemap.xml and refuses a tampered sitemap', async () => {
		const validProjectChirho = await makeProjectChirho((fixtureChirho) => {
			fixtureChirho.adapter_chirho.set('sitemap.xml', sitemapXmlChirho());
		});
		const { manifest_chirho: manifestChirho } = await buildChirho(validProjectChirho);
		expect(
			manifestChirho.files_chirho.some((fileChirho) => fileChirho.path_chirho === '/sitemap.xml')
		).toBe(true);
		const invalidProjectChirho = await makeProjectChirho((fixtureChirho) => {
			fixtureChirho.adapter_chirho.set(
				'sitemap.xml',
				'<urlset><url><loc>https://evil.example/</loc></url></urlset>'
			);
		});
		expect(await refusalChirho(buildChirho(invalidProjectChirho))).toMatch(
			/Sitemap differs from the public route registry/
		);
	});

	it.each(casesChirho)(
		'refuses %s and writes nothing',
		async (_labelChirho, mutateChirho, patternChirho) => {
			const projectChirho = await makeProjectChirho(mutateChirho);
			const messageChirho = await refusalChirho(
				buildChirho(projectChirho, { allow_pending_media_chirho: true })
			);
			expect(messageChirho).toMatch(patternChirho);
			expect(messageChirho).not.toContain(SECRET_CHIRHO);
			await missingChirho(join(projectChirho.root_chirho, 'build-chirho'));
		}
	);

	it('refuses links inside the adapter output', async () => {
		const projectChirho = await makeProjectChirho();
		await symlink(
			'/etc/hosts',
			join(projectChirho.root_chirho, '.svelte-kit', 'cloudflare', 'hosts.html')
		);
		expect(await refusalChirho(buildChirho(projectChirho))).toMatch(/link or special file/);
	});
});
