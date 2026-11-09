// For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life. — John 3:16 (KJV)
import {
	afterEach as afterEachChirho,
	expect as expectChirho,
	it as itChirho,
	vi as viChirho
} from 'vitest';
import {
	mkdtemp as mkdtempChirho,
	mkdir as mkdirChirho,
	writeFile as writeFileChirho,
	readFile as readFileChirho,
	rm as rmChirho
} from 'node:fs/promises';
import { tmpdir as tmpdirChirho } from 'node:os';
import { join as joinChirho } from 'node:path';
import {
	addVerifiedTutorialFactsChirho,
	TUTORIAL_CATALOGUE_CHIRHO,
	TUTORIAL_MANIFEST_CHIRHO,
	type TutorialEntryChirho,
	type TutorialArchiveEntryChirho
} from '../../scripts-chirho/publish-chirho/r2-chirho/tutorial-rules-chirho';
import {
	classifyPathChirho,
	sha256Chirho,
	type FilesChirho
} from '../../scripts-chirho/publish-chirho/release_rules_chirho';
import {
	buildReleaseChirho,
	readMediaRecordsChirho
} from '../../scripts-chirho/publish-chirho/build_release_chirho';
import { webpChirho, baseProjectChirho, writeProjectChirho } from './support-chirho';

const rootsChirho: string[] = [];
afterEachChirho(async () => {
	viChirho.restoreAllMocks();
	await Promise.all(
		rootsChirho
			.splice(0)
			.map((rootChirho) => rmChirho(rootChirho, { recursive: true, force: true }))
	);
});

async function fixtureChirho() {
	const rootChirho = await mkdtempChirho(joinChirho(tmpdirChirho(), 'tutorial-rules-chirho-'));
	rootsChirho.push(rootChirho);
	const encodeChirho = (textChirho: string) => new TextEncoder().encode(textChirho),
		filesChirho: FilesChirho = new Map([
			['tutorial-chirho/index.html', encodeChirho('<!doctype html><title>Tutorial</title>')]
		]),
		publicChirho: {
			schema_version_chirho: number;
			tutorial_id_chirho: string;
			entries_chirho: TutorialEntryChirho[];
		} = {
			schema_version_chirho: 1,
			tutorial_id_chirho: 'hinneh-quick-tour-v1-chirho',
			entries_chirho: []
		},
		archiveChirho: {
			schema_version_chirho: number;
			tutorial_id_chirho: string;
			entries_chirho: TutorialArchiveEntryChirho[];
		} = {
			schema_version_chirho: 1,
			tutorial_id_chirho: publicChirho.tutorial_id_chirho,
			entries_chirho: []
		};
	for (const [languageChirho, shaChirho] of [
		['en', 'a'.repeat(64)],
		['es', 'b'.repeat(64)]
	] as const) {
		const posterChirho = webpChirho(720, 1280),
			captionsChirho = encodeChirho(
				'WEBVTT\n\n00:00:00.000 --> 00:00:02.000\nA useful tutorial.\n'
			),
			videoChirho = {
				asset_path_chirho: `/video-chirho/sha256-chirho/${shaChirho}-chirho.mp4`,
				sha256_chirho: shaChirho,
				bytes_chirho: 100_000,
				duration_chirho: 45,
				width_chirho: 720,
				height_chirho: 1280
			};
		filesChirho.set(`tutorial-chirho/${languageChirho}-poster-chirho.webp`, posterChirho);
		filesChirho.set(`tutorial-chirho/${languageChirho}-captions-chirho.vtt`, captionsChirho);
		publicChirho.entries_chirho.push({
			language_chirho: languageChirho,
			video_chirho: videoChirho,
			poster_chirho: {
				asset_path_chirho: `/tutorial-chirho/${languageChirho}-poster-chirho.webp`,
				sha256_chirho: sha256Chirho(posterChirho),
				bytes_chirho: posterChirho.length,
				width_chirho: 720,
				height_chirho: 1280
			},
			captions_chirho: {
				asset_path_chirho: `/tutorial-chirho/${languageChirho}-captions-chirho.vtt`,
				sha256_chirho: sha256Chirho(captionsChirho),
				bytes_chirho: captionsChirho.length
			},
			transcript_chirho: 'Explore the reader and its useful controls.'
		});
		archiveChirho.entries_chirho.push({
			language_chirho: languageChirho,
			video_chirho: structuredClone(videoChirho),
			key_chirho: `video-chirho/sha256-chirho/${shaChirho}.mp4`,
			readback_sha256_chirho: shaChirho,
			verified_at_chirho: '2026-11-09T00:00:00Z'
		});
	}
	const persistChirho = async () => {
		filesChirho.set(TUTORIAL_MANIFEST_CHIRHO, encodeChirho(JSON.stringify(publicChirho)));
		await mkdirChirho(joinChirho(rootChirho, 'data-chirho/tutorial-chirho'), { recursive: true });
		await writeFileChirho(
			joinChirho(rootChirho, TUTORIAL_CATALOGUE_CHIRHO),
			JSON.stringify(archiveChirho)
		);
	};
	await persistChirho();
	return { rootChirho, filesChirho, publicChirho, archiveChirho, persistChirho, encodeChirho };
}

itChirho(
	'admits only the complete verified localized pair without network or source-file mutation',
	async () => {
		const fixtureValueChirho = await fixtureChirho(),
			fetchChirho = viChirho.spyOn(globalThis, 'fetch').mockImplementation(async () => {
				throw Error('Network forbidden');
			}),
			factsChirho = { ['f'.repeat(64)]: 900 },
			beforeFilesChirho = [...fixtureValueChirho.filesChirho].map(([pathChirho, bytesChirho]) => [
				pathChirho,
				sha256Chirho(bytesChirho)
			]),
			archiveBytesChirho = await readFileChirho(
				joinChirho(fixtureValueChirho.rootChirho, TUTORIAL_CATALOGUE_CHIRHO)
			),
			reasonsChirho: string[] = [];
		await addVerifiedTutorialFactsChirho(
			fixtureValueChirho.rootChirho,
			fixtureValueChirho.filesChirho,
			reasonsChirho,
			factsChirho
		);
		expectChirho(reasonsChirho).toEqual([]);
		expectChirho(factsChirho).toEqual({
			['f'.repeat(64)]: 900,
			['a'.repeat(64)]: 100_000,
			['b'.repeat(64)]: 100_000
		});
		expectChirho(
			[...fixtureValueChirho.filesChirho].map(([pathChirho, bytesChirho]) => [
				pathChirho,
				sha256Chirho(bytesChirho)
			])
		).toEqual(beforeFilesChirho);
		expectChirho(
			await readFileChirho(joinChirho(fixtureValueChirho.rootChirho, TUTORIAL_CATALOGUE_CHIRHO))
		).toEqual(archiveBytesChirho);
		expectChirho(fetchChirho).not.toHaveBeenCalled();
	}
);

itChirho('allows omission only when the tutorial page and all media are absent', async () => {
	const rootChirho = await mkdtempChirho(joinChirho(tmpdirChirho(), 'tutorial-absent-chirho-'));
	rootsChirho.push(rootChirho);
	const factsChirho = { ['f'.repeat(64)]: 900 },
		reasonsChirho: string[] = [];
	await addVerifiedTutorialFactsChirho(rootChirho, new Map(), reasonsChirho, factsChirho);
	expectChirho(reasonsChirho).toEqual([]);
	for (const pathChirho of [
		'tutorial-chirho/index.html',
		'tutorial-chirho.html',
		'tutorial-chirho/en-poster-chirho.webp'
	]) {
		const refusedChirho: string[] = [];
		await addVerifiedTutorialFactsChirho(
			rootChirho,
			new Map([[pathChirho, new Uint8Array([1])]]),
			refusedChirho,
			factsChirho
		);
		expectChirho(refusedChirho.length, pathChirho).toBeGreaterThan(0);
	}
	expectChirho(factsChirho).toEqual({ ['f'.repeat(64)]: 900 });
});

itChirho('rejects incomplete publication and archive facts atomically', async () => {
	const mutationsChirho: ((
		fixtureValueChirho: Awaited<ReturnType<typeof fixtureChirho>>
	) => Promise<void> | void)[] = [
		(fixtureValueChirho) => {
			fixtureValueChirho.filesChirho.delete(TUTORIAL_MANIFEST_CHIRHO);
		},
		(fixtureValueChirho) => {
			fixtureValueChirho.filesChirho.delete('tutorial-chirho/index.html');
		},
		(fixtureValueChirho) => {
			fixtureValueChirho.filesChirho.delete('tutorial-chirho/es-captions-chirho.vtt');
		},
		async (fixtureValueChirho) => {
			await rmChirho(joinChirho(fixtureValueChirho.rootChirho, TUTORIAL_CATALOGUE_CHIRHO));
		},
		async (fixtureValueChirho) => {
			fixtureValueChirho.archiveChirho.entries_chirho.pop();
			await fixtureValueChirho.persistChirho();
		},
		async (fixtureValueChirho) => {
			fixtureValueChirho.archiveChirho.entries_chirho[1].language_chirho = 'en';
			await fixtureValueChirho.persistChirho();
		},
		async (fixtureValueChirho) => {
			fixtureValueChirho.archiveChirho.entries_chirho[1].readback_sha256_chirho = 'c'.repeat(64);
			await fixtureValueChirho.persistChirho();
		},
		async (fixtureValueChirho) => {
			fixtureValueChirho.archiveChirho.entries_chirho[1].key_chirho = 'other.mp4';
			await fixtureValueChirho.persistChirho();
		},
		async (fixtureValueChirho) => {
			fixtureValueChirho.archiveChirho.entries_chirho[1].verified_at_chirho = '';
			await fixtureValueChirho.persistChirho();
		},
		async (fixtureValueChirho) => {
			fixtureValueChirho.archiveChirho.entries_chirho[1].video_chirho.bytes_chirho++;
			await fixtureValueChirho.persistChirho();
		},
		async (fixtureValueChirho) => {
			fixtureValueChirho.archiveChirho.entries_chirho[1].video_chirho = structuredClone(
				fixtureValueChirho.archiveChirho.entries_chirho[0].video_chirho
			);
			fixtureValueChirho.archiveChirho.entries_chirho[1].key_chirho =
				fixtureValueChirho.archiveChirho.entries_chirho[0].key_chirho;
			fixtureValueChirho.archiveChirho.entries_chirho[1].readback_sha256_chirho =
				fixtureValueChirho.archiveChirho.entries_chirho[0].readback_sha256_chirho;
			fixtureValueChirho.publicChirho.entries_chirho[1].video_chirho = structuredClone(
				fixtureValueChirho.publicChirho.entries_chirho[0].video_chirho
			);
			await fixtureValueChirho.persistChirho();
		}
	];
	for (const [indexChirho, mutateChirho] of mutationsChirho.entries()) {
		const fixtureValueChirho = await fixtureChirho(),
			factsChirho = { ['f'.repeat(64)]: 900 },
			reasonsChirho: string[] = [];
		await mutateChirho(fixtureValueChirho);
		await addVerifiedTutorialFactsChirho(
			fixtureValueChirho.rootChirho,
			fixtureValueChirho.filesChirho,
			reasonsChirho,
			factsChirho
		);
		expectChirho(reasonsChirho.length, `mutation ${indexChirho}`).toBeGreaterThan(0);
		expectChirho(factsChirho).toEqual({ ['f'.repeat(64)]: 900 });
	}
});

itChirho('refuses changed companions, invalid public metadata and video collisions', async () => {
	const mutationsChirho: ((
		fixtureValueChirho: Awaited<ReturnType<typeof fixtureChirho>>
	) => void)[] = [
		(fixtureValueChirho) => {
			fixtureValueChirho.publicChirho.entries_chirho[1].transcript_chirho = ' ';
		},
		(fixtureValueChirho) => {
			Object.assign(fixtureValueChirho.publicChirho.entries_chirho[1], { language_chirho: ['es'] });
		},
		(fixtureValueChirho) => {
			fixtureValueChirho.publicChirho.entries_chirho[1].poster_chirho.width_chirho++;
		},
		(fixtureValueChirho) => {
			fixtureValueChirho.publicChirho.entries_chirho[1].captions_chirho.asset_path_chirho =
				'/tutorial-chirho/en-captions-chirho.vtt';
		},
		(fixtureValueChirho) => {
			fixtureValueChirho.publicChirho.entries_chirho[1].video_chirho.asset_path_chirho =
				'https://elsewhere.example/video.mp4';
		},
		(fixtureValueChirho) => {
			fixtureValueChirho.publicChirho.entries_chirho[1].video_chirho.duration_chirho = Infinity;
		},
		(fixtureValueChirho) => {
			fixtureValueChirho.publicChirho.entries_chirho[1].video_chirho.bytes_chirho =
				16 * 1024 * 1024 + 1;
		},
		(fixtureValueChirho) => {
			fixtureValueChirho.publicChirho.entries_chirho[1].video_chirho.width_chirho = 1921;
		},
		(fixtureValueChirho) => {
			fixtureValueChirho.publicChirho.entries_chirho[1] = structuredClone(
				fixtureValueChirho.publicChirho.entries_chirho[0]
			);
		},
		(fixtureValueChirho) => {
			fixtureValueChirho.filesChirho.set(
				'tutorial-chirho/es-poster-chirho.webp',
				new Uint8Array([1, 2])
			);
		},
		(fixtureValueChirho) => {
			const bytesChirho = fixtureValueChirho.encodeChirho('Not captions\n');
			fixtureValueChirho.filesChirho.set('tutorial-chirho/es-captions-chirho.vtt', bytesChirho);
			fixtureValueChirho.publicChirho.entries_chirho[1].captions_chirho.bytes_chirho =
				bytesChirho.length;
			fixtureValueChirho.publicChirho.entries_chirho[1].captions_chirho.sha256_chirho =
				sha256Chirho(bytesChirho);
		},
		(fixtureValueChirho) => {
			const bytesChirho = fixtureValueChirho.encodeChirho(
				'WEBVTT\n\n00:00:44.000 --> 00:00:46.000\nBeyond the video.\n'
			);
			fixtureValueChirho.filesChirho.set('tutorial-chirho/es-captions-chirho.vtt', bytesChirho);
			fixtureValueChirho.publicChirho.entries_chirho[1].captions_chirho.bytes_chirho =
				bytesChirho.length;
			fixtureValueChirho.publicChirho.entries_chirho[1].captions_chirho.sha256_chirho =
				sha256Chirho(bytesChirho);
		}
	];
	for (const [indexChirho, mutateChirho] of mutationsChirho.entries()) {
		const fixtureValueChirho = await fixtureChirho(),
			factsChirho = { ['f'.repeat(64)]: 900 },
			reasonsChirho: string[] = [];
		mutateChirho(fixtureValueChirho);
		await fixtureValueChirho.persistChirho();
		await addVerifiedTutorialFactsChirho(
			fixtureValueChirho.rootChirho,
			fixtureValueChirho.filesChirho,
			reasonsChirho,
			factsChirho
		);
		expectChirho(reasonsChirho.length, `mutation ${indexChirho}`).toBeGreaterThan(0);
		expectChirho(factsChirho).toEqual({ ['f'.repeat(64)]: 900 });
	}
	const fixtureValueChirho = await fixtureChirho(),
		factsChirho = { ['a'.repeat(64)]: 100_000 },
		reasonsChirho: string[] = [];
	await addVerifiedTutorialFactsChirho(
		fixtureValueChirho.rootChirho,
		fixtureValueChirho.filesChirho,
		reasonsChirho,
		factsChirho
	);
	expectChirho(reasonsChirho.length).toBeGreaterThan(0);
	expectChirho(factsChirho).toEqual({ ['a'.repeat(64)]: 100_000 });
});

itChirho('allowlists the five companions without allowing arbitrary tutorial binaries', () => {
	for (const pathChirho of [
		TUTORIAL_MANIFEST_CHIRHO,
		'tutorial-chirho/en-poster-chirho.webp',
		'tutorial-chirho/es-poster-chirho.webp',
		'tutorial-chirho/en-captions-chirho.vtt',
		'tutorial-chirho/es-captions-chirho.vtt'
	])
		expectChirho(classifyPathChirho(pathChirho)).toBe('static');
	for (const pathChirho of [
		'tutorial-chirho/it-poster-chirho.webp',
		'tutorial-chirho/other-chirho.json',
		'tutorial-chirho/movie-chirho.mp4',
		'tutorial-chirho/en-poster-chirho.jpg'
	])
		expectChirho(classifyPathChirho(pathChirho)).not.toBe('static');
});

itChirho('wires the absent-manifest refusal through the actual release builder', async () => {
	const rootChirho = await mkdtempChirho(joinChirho(tmpdirChirho(), 'tutorial-builder-chirho-'));
	rootsChirho.push(rootChirho);
	const projectChirho = baseProjectChirho(rootChirho);
	projectChirho.adapter_chirho.set(
		'tutorial-chirho/index.html',
		'<!doctype html><title>Tutorial</title>'
	);
	await writeProjectChirho(projectChirho);
	await expectChirho(
		buildReleaseChirho({
			root_chirho: rootChirho,
			allow_pending_media_chirho: false,
			fresh_build_chirho: true,
			git_chirho: { commit_chirho: 'c'.repeat(40), clean_chirho: true },
			local_paths_chirho: [rootChirho]
		})
	).rejects.toThrow('Tutorial media refused');
});

itChirho(
	'keeps ordinary-media empty fixtures and collects malformed-file reasons without dropping valid records',
	async () => {
		const rootChirho = await mkdtempChirho(joinChirho(tmpdirChirho(), 'media-reader-chirho-'));
		rootsChirho.push(rootChirho);
		const emptyReasonsChirho: string[] = [];
		expectChirho(await readMediaRecordsChirho(rootChirho, emptyReasonsChirho)).toEqual([]);
		expectChirho(emptyReasonsChirho).toEqual([]);
		await writeProjectChirho(baseProjectChirho(rootChirho));
		await writeFileChirho(
			joinChirho(rootChirho, 'data-chirho/media-chirho/broken-chirho.json'),
			'{'
		);
		const reasonsChirho: string[] = [],
			recordsChirho = await readMediaRecordsChirho(rootChirho, reasonsChirho);
		expectChirho(recordsChirho).toHaveLength(2);
		expectChirho(reasonsChirho).toHaveLength(1);
		expectChirho(reasonsChirho[0]).toContain('broken-chirho.json');
	}
);
