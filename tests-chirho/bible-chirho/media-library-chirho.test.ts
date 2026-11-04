// For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life. — John 3:16 (KJV)

import { afterEach, expect, it, vi } from 'vitest';
import * as filesystemChirho from 'node:fs/promises';
import {
	mkdtemp as mkdtempChirho,
	mkdir as mkdirChirho,
	readFile as readFileChirho,
	readdir as readdirChirho,
	rm as rmChirho,
	symlink as symlinkChirho,
	writeFile as writeFileChirho
} from 'node:fs/promises';
import { tmpdir as tmpdirChirho } from 'node:os';
import { dirname as dirnameChirho, join as joinChirho } from 'node:path';
import {
	buildMediaLibraryChirho,
	librarySha256Chirho,
	MAX_LIBRARY_JSON_BYTES_CHIRHO,
	writeMediaLibraryChirho,
	type MediaLibraryPlanChirho
} from '../../scripts-chirho/bible-chirho/export_media_library_chirho';

vi.mock('node:fs/promises', async (importOriginalChirho) => {
	const originalChirho = await importOriginalChirho<typeof import('node:fs/promises')>();
	return { ...originalChirho, readFile: vi.fn(originalChirho.readFile) };
});

type RowChirho = Record<string, unknown>;
interface FixtureChirho {
	root_chirho: string;
	chapter_chirho: RowChirho;
	content_chirho: RowChirho;
	audio_chirho: RowChirho;
	files_chirho: Map<string, string>;
	objects_chirho: Map<string, number>;
	audio_objects_chirho: Map<string, number>;
}
const homesChirho: string[] = [];
const jsonChirho = (valueChirho: unknown): string => JSON.stringify(valueChirho) + '\n';
const compareChirho = (leftChirho: string, rightChirho: string): number =>
	leftChirho < rightChirho ? -1 : leftChirho > rightChirho ? 1 : 0;

afterEach(async () => {
	vi.restoreAllMocks();
	await Promise.all(
		homesChirho
			.splice(0)
			.map((homeChirho) => rmChirho(homeChirho, { recursive: true, force: true }))
	);
});

it('refuses a release replaced while metadata is being frozen', async () => {
	const inputChirho = await fixtureChirho();
	await saveChirho(inputChirho);
	const originalReadChirho = vi.mocked(filesystemChirho.readFile).getMockImplementation()!;
	let manifestReadsChirho = 0;
	vi.spyOn(filesystemChirho, 'readFile').mockImplementation(async (pathChirho, optionsChirho) => {
		const resultChirho = await originalReadChirho(pathChirho, optionsChirho);
		if (String(pathChirho).endsWith('/release-manifest-chirho.json') && ++manifestReadsChirho === 1)
			await writeFileChirho(pathChirho, Buffer.from(String(resultChirho) + ' '));
		return resultChirho;
	});
	await expect(buildMediaLibraryChirho(inputChirho.root_chirho)).rejects.toThrow(
		/release changed while freezing/
	);
});

async function fixtureChirho(): Promise<FixtureChirho> {
	const rootChirho = await mkdtempChirho(joinChirho(tmpdirChirho(), 'hinneh-library-chirho-'));
	homesChirho.push(rootChirho);
	const iconShaChirho = librarySha256Chirho('a remote icon, never fetched');
	const sceneShaChirho = librarySha256Chirho('a remote scene, never fetched');
	const reducedShaChirho = librarySha256Chirho('a remote reduced scene, never fetched');
	const soundShaChirho = librarySha256Chirho('remote IPA sound, never fetched');
	const otherSoundShaChirho = librarySha256Chirho('another remote sound, never fetched');
	const wordsChirho = ['לֹ֣א', 'לֹ֖א', 'לֹא', 'לֹא'];
	const tokensChirho = wordsChirho.map((wordChirho, indexChirho) => ({
		id_chirho: `token${indexChirho + 1}`,
		text_chirho: wordChirho
	}));
	const canonicalChirho = wordsChirho.join(' ');
	const iconsChirho = [
		{ lemma_id_chirho: 'H3808', lemma_augment_chirho: null },
		{ lemma_id_chirho: 'H3808', lemma_augment_chirho: 'a' },
		{ lemma_id_chirho: 'G3056', lemma_augment_chirho: null, lexical_form_chirho: 'λόγος' },
		{ lemma_id_chirho: 'G3056', lemma_augment_chirho: null, lexical_form_chirho: 'λόγος' }
	].map((lemmaChirho, indexChirho) => ({
		...lemmaChirho,
		id_chirho: `picture-${indexChirho}-chirho`,
		lesson_id_chirho: 'Gen.1.1',
		token_id_chirho: tokensChirho[indexChirho].id_chirho,
		sense_id_chirho: `sense-${indexChirho}-chirho`,
		contextual_meaning_chirho: 'a reviewed example',
		alt_chirho: 'a simple illustration',
		asset_path_chirho: '/assets-chirho/icons-chirho/library-chirho/icon-chirho.webp',
		sha256_chirho: iconShaChirho,
		width_chirho: 128,
		height_chirho: 128,
		art_review_chirho: 'pending',
		sense_review_chirho: 'agent_reviewed',
		evidence_refs_chirho: ['source-chirho'],
		selected_chirho: true,
		prompt_chirho: 'PRIVATE PROMPT NEVER EXPORT',
		account_chirho: 'PRIVATE ACCOUNT NEVER EXPORT'
	}));
	const sceneChirho = {
		lesson_id_chirho: 'Gen.1.1',
		asset_path_chirho: '/assets-chirho/scenes-chirho/example-chirho.webp',
		sha256_chirho: sceneShaChirho,
		width_chirho: 1200,
		height_chirho: 900,
		art_review_chirho: 'pending',
		alt_chirho: 'a landscape',
		reading_note_chirho: 'An imaginative study aid.'
	};
	const clipsChirho = tokensChirho.map((tokenChirho, indexChirho) => ({
		lesson_id_chirho: 'Gen.1.1',
		token_id_chirho: tokenChirho.id_chirho,
		text_chirho: tokenChirho.text_chirho,
		ipa_chirho: indexChirho === 3 ? 'ˈlo' : 'lo',
		synthesis_text_chirho: indexChirho === 3 ? '"/ˈlo/"' : '"/lo/"',
		recipe_id_chirho: indexChirho === 2 ? 'different-source-policy-chirho' : 'ipa-policy-chirho',
		canonical_sha256_chirho: librarySha256Chirho(canonicalChirho),
		language_chirho: 'he',
		pronunciation_chirho: 'israeli_hebrew',
		voice_name_chirho: 'A licensed public voice',
		provider_chirho: 'ElevenLabs',
		model_chirho: 'a-public-model-chirho',
		asset_path_chirho: `/audio-chirho/sha256-chirho/${indexChirho === 3 ? otherSoundShaChirho : soundShaChirho}-chirho.mp3`,
		sha256_chirho: indexChirho === 3 ? otherSoundShaChirho : soundShaChirho,
		bytes_chirho: 100,
		duration_chirho: 0.8,
		review_chirho: 'audition',
		request_id_chirho: 'PRIVATE REQUEST NEVER EXPORT',
		tool_chirho: 'PRIVATE TOOL NEVER EXPORT'
	}));
	return {
		root_chirho: rootChirho,
		chapter_chirho: {
			schema_version_chirho: 1,
			book_id_chirho: 'Gen',
			chapter_chirho: 1,
			icons_chirho: iconsChirho,
			lemma_icons_chirho: iconsChirho,
			scenes_chirho: [
				sceneChirho,
				{
					...sceneChirho,
					asset_path_chirho: '/assets-chirho/scenes-chirho/reduced-chirho.webp',
					sha256_chirho: reducedShaChirho,
					variant_chirho: 'representation_reduced'
				}
			]
		},
		content_chirho: {
			book_id_chirho: 'Gen',
			chapter_chirho: 1,
			verses_chirho: [
				{
					id_chirho: 'Gen.1.1',
					canonical_text_chirho: canonicalChirho,
					tokens_chirho: tokensChirho
				}
			]
		},
		audio_chirho: {
			schema_version_chirho: 1,
			book_id_chirho: 'Gen',
			chapter_chirho: 1,
			content_path_chirho: '/content-chirho/genesis-chirho/chapter-01-chirho.json',
			clips_chirho: clipsChirho
		},
		files_chirho: new Map(),
		objects_chirho: new Map([
			[iconShaChirho, 200],
			[sceneShaChirho, 300],
			[reducedShaChirho, 400]
		]),
		audio_objects_chirho: new Map([
			[soundShaChirho, 100],
			[otherSoundShaChirho, 100]
		])
	};
}

async function saveChirho(fixtureChirho: FixtureChirho): Promise<void> {
	const mediaPathChirho = '/media-chirho/genesis-chirho/chapter-01-chirho.json';
	const audioPathChirho = '/audio-chirho/genesis-chirho/chapter-01-chirho.json';
	const contentPathChirho = '/content-chirho/genesis-chirho/chapter-01-chirho.json';
	fixtureChirho.files_chirho.set(contentPathChirho, jsonChirho(fixtureChirho.content_chirho));
	fixtureChirho.audio_chirho.content_sha256_chirho = librarySha256Chirho(
		fixtureChirho.files_chirho.get(contentPathChirho)!
	);
	fixtureChirho.files_chirho.set(mediaPathChirho, jsonChirho(fixtureChirho.chapter_chirho));
	fixtureChirho.files_chirho.set(
		'/media-chirho/genesis-chirho/summary-chirho.json',
		jsonChirho({
			schema_version_chirho: 1,
			book_id_chirho: 'Gen',
			chapters_chirho: [
				{
					number_chirho: 1,
					path_chirho: mediaPathChirho,
					sha256_chirho: librarySha256Chirho(fixtureChirho.files_chirho.get(mediaPathChirho)!)
				}
			]
		})
	);
	fixtureChirho.files_chirho.set(audioPathChirho, jsonChirho(fixtureChirho.audio_chirho));
	fixtureChirho.files_chirho.set(
		'/audio-chirho/manifest-chirho.json',
		jsonChirho({
			schema_version_chirho: 1,
			books_chirho: {
				Gen: {
					chapters_chirho: [
						{
							number_chirho: 1,
							path_chirho: audioPathChirho,
							sha256_chirho: librarySha256Chirho(fixtureChirho.files_chirho.get(audioPathChirho)!)
						}
					]
				}
			}
		})
	);
	const workerChirho = '// A frozen fixture Worker, not executable generation code.\n';
	const remoteChirho = {
		schema_version_chirho: 1,
		worker_sha256_chirho: librarySha256Chirho(workerChirho),
		objects_chirho: [...fixtureChirho.objects_chirho].map(([shaChirho, bytesChirho]) => ({
			sha256_chirho: shaChirho,
			bytes_chirho: bytesChirho,
			key_chirho: `media-chirho/sha256-chirho/${shaChirho}.webp`
		})),
		audio_objects_chirho: [...fixtureChirho.audio_objects_chirho].map(
			([shaChirho, bytesChirho]) => ({
				sha256_chirho: shaChirho,
				bytes_chirho: bytesChirho,
				key_chirho: `audio-chirho/sha256-chirho/${shaChirho}.mp3`
			})
		)
	};
	const filesChirho = [...fixtureChirho.files_chirho]
		.map(([pathChirho, bytesChirho]) => ({
			path_chirho: pathChirho,
			sha256_chirho: librarySha256Chirho(bytesChirho),
			bytes_chirho: Buffer.byteLength(bytesChirho)
		}))
		.sort((leftChirho, rightChirho) =>
			compareChirho(leftChirho.path_chirho, rightChirho.path_chirho)
		);
	const mediaChirho = ['icons_chirho', 'scenes_chirho'].flatMap((fieldChirho) =>
		(fixtureChirho.chapter_chirho[fieldChirho] as RowChirho[]).map((rowChirho) => ({
			...rowChirho,
			kind_chirho: fieldChirho === 'icons_chirho' ? 'icon' : 'scene'
		}))
	);
	const releaseChirho = {
		schema_version_chirho: 1,
		release_id_chirho: librarySha256Chirho(
			`${librarySha256Chirho(JSON.stringify(filesChirho))}\0${JSON.stringify(remoteChirho)}`
		),
		files_chirho: filesChirho,
		artwork_chirho: remoteChirho,
		media_chirho: mediaChirho
	};
	const homeChirho = joinChirho(fixtureChirho.root_chirho, 'build-chirho/preview-chirho');
	await mkdirChirho(joinChirho(homeChirho, 'public-chirho'), { recursive: true });
	for (const [pathChirho, bytesChirho] of fixtureChirho.files_chirho) {
		const targetChirho = joinChirho(homeChirho, 'public-chirho', pathChirho.slice(1));
		await mkdirChirho(dirnameChirho(targetChirho), { recursive: true });
		await writeFileChirho(targetChirho, bytesChirho);
	}
	await writeFileChirho(joinChirho(homeChirho, 'artwork-worker-chirho.mjs'), workerChirho);
	await writeFileChirho(
		joinChirho(homeChirho, 'release-manifest-chirho.json'),
		jsonChirho(releaseChirho)
	);
}

function recordsChirho(planChirho: MediaLibraryPlanChirho, familyChirho: string): RowChirho[] {
	return [...planChirho.files_chirho]
		.filter(([pathChirho]) => pathChirho.startsWith(`${familyChirho}/`))
		.flatMap(
			([, bytesChirho]) =>
				(JSON.parse(new TextDecoder().decode(bytesChirho)) as { records_chirho: RowChirho[] })
					.records_chirho
		);
}

it('keeps exact augmented and Greek lemma keys, source aliases, pronunciation identities and scene variants', async () => {
	const inputChirho = await fixtureChirho();
	await saveChirho(inputChirho);
	const planChirho = await buildMediaLibraryChirho(inputChirho.root_chirho);
	const iconsChirho = recordsChirho(planChirho, 'icons-chirho');
	expect(iconsChirho).toHaveLength(4);
	expect(new Set(iconsChirho.map((rowChirho) => rowChirho.lemma_key_chirho)).size).toBe(4);
	expect(iconsChirho.every((rowChirho) => (rowChirho.roles_chirho as string[]).length === 2)).toBe(
		true
	);
	expect(
		iconsChirho
			.filter((rowChirho) => rowChirho.lemma_id_chirho === 'G3056')
			.map((rowChirho) => rowChirho.lexical_form_chirho)
			.sort()
	).toEqual(['λόγος', 'λόγος'].sort());
	const audioChirho = recordsChirho(planChirho, 'word-audio-chirho');
	expect(audioChirho).toHaveLength(2);
	expect(audioChirho.map((rowChirho) => rowChirho.aliases_chirho).flat()).toHaveLength(4);
	expect(recordsChirho(planChirho, 'audio-occurrences-chirho')[0].words_chirho).toHaveLength(4);
	expect(
		recordsChirho(planChirho, 'scenes-chirho')
			.map((rowChirho) => rowChirho.variant_chirho)
			.sort()
	).toEqual(['representation_reduced', 'standard']);
	expect(recordsChirho(planChirho, 'assets-chirho')).toHaveLength(5);
	expect(planChirho.manifest_chirho.download_plan_chirho).toMatchObject({
		total_bytes_chirho: 1100,
		binaries_downloaded_chirho: false
	});
	expect(
		[...planChirho.files_chirho.values()]
			.map((bytesChirho) => new TextDecoder().decode(bytesChirho))
			.join('\n')
	).not.toMatch(/PRIVATE|request_id|account_chirho|prompt_chirho|tool_chirho|\/Users\//u);
	expect(await readdirChirho(joinChirho(inputChirho.root_chirho, 'build-chirho'))).toEqual([
		'preview-chirho'
	]);
	const againChirho = await buildMediaLibraryChirho(inputChirho.root_chirho);
	expect([...againChirho.files_chirho]).toEqual([...planChirho.files_chirho]);
});

it('binds qere pronunciation to the read form without changing source bytes', async () => {
	const inputChirho = await fixtureChirho();
	const sourceChirho = (inputChirho.content_chirho.verses_chirho as RowChirho[])[0];
	(sourceChirho.tokens_chirho as RowChirho[])[0].qere_chirho = [{ text_chirho: 'לוֹ' }];
	(inputChirho.audio_chirho.clips_chirho as RowChirho[])[0].text_chirho = 'לוֹ';
	await saveChirho(inputChirho);
	const planChirho = await buildMediaLibraryChirho(inputChirho.root_chirho);
	expect(
		recordsChirho(planChirho, 'word-audio-chirho')
			.flatMap((rowChirho) => rowChirho.aliases_chirho as RowChirho[])
			.some((rowChirho) => rowChirho.text_chirho === 'לוֹ')
	).toBe(true);
	(inputChirho.audio_chirho.clips_chirho as RowChirho[])[0].text_chirho = 'לֹ֣א';
	await saveChirho(inputChirho);
	await expect(buildMediaLibraryChirho(inputChirho.root_chirho)).rejects.toThrow(
		/spoken text differs/
	);
});

it('refuses unverified catalogue bytes, manifest identity, Worker and unknown assets', async () => {
	for (const mutationChirho of ['bytes', 'manifest', 'worker', 'unknown', 'size'] as const) {
		const inputChirho = await fixtureChirho();
		if (mutationChirho === 'unknown') inputChirho.objects_chirho.clear();
		if (mutationChirho === 'size')
			(inputChirho.audio_chirho.clips_chirho as RowChirho[])[0].bytes_chirho = 101;
		await saveChirho(inputChirho);
		const homeChirho = joinChirho(inputChirho.root_chirho, 'build-chirho/preview-chirho');
		if (mutationChirho === 'bytes')
			await writeFileChirho(
				joinChirho(homeChirho, 'public-chirho/media-chirho/genesis-chirho/chapter-01-chirho.json'),
				'{}'
			);
		if (mutationChirho === 'manifest') {
			const manifestChirho = JSON.parse(
				await readFileChirho(joinChirho(homeChirho, 'release-manifest-chirho.json'), 'utf8')
			);
			manifestChirho.release_id_chirho = '0'.repeat(64);
			await writeFileChirho(
				joinChirho(homeChirho, 'release-manifest-chirho.json'),
				jsonChirho(manifestChirho)
			);
		}
		if (mutationChirho === 'worker')
			await writeFileChirho(joinChirho(homeChirho, 'artwork-worker-chirho.mjs'), '// changed');
		await expect(buildMediaLibraryChirho(inputChirho.root_chirho), mutationChirho).rejects.toThrow(
			/refused/
		);
	}
});

it('refuses unsafe paths, public text leakage, canonical mismatches and unsupported variants', async () => {
	for (const mutationChirho of ['path', 'private', 'canonical', 'reduced'] as const) {
		const inputChirho = await fixtureChirho();
		if (mutationChirho === 'path')
			(inputChirho.chapter_chirho.icons_chirho as RowChirho[])[0].asset_path_chirho =
				'/assets-chirho/../private-chirho.webp';
		if (mutationChirho === 'private')
			(inputChirho.chapter_chirho.icons_chirho as RowChirho[])[0].alt_chirho =
				'Saved at /Users/private-person/secret.png';
		if (mutationChirho === 'canonical')
			(inputChirho.audio_chirho.clips_chirho as RowChirho[])[0].canonical_sha256_chirho =
				'0'.repeat(64);
		if (mutationChirho === 'reduced')
			(inputChirho.chapter_chirho.scenes_chirho as RowChirho[]).shift();
		await saveChirho(inputChirho);
		await expect(buildMediaLibraryChirho(inputChirho.root_chirho), mutationChirho).rejects.toThrow(
			/refused/
		);
	}
});

it('refuses release symlinks and constrains exclusive local output without removing existing work', async () => {
	const inputChirho = await fixtureChirho();
	await saveChirho(inputChirho);
	const planChirho = await buildMediaLibraryChirho(inputChirho.root_chirho);
	const outputChirho = await writeMediaLibraryChirho(inputChirho.root_chirho, planChirho);
	expect(outputChirho).toBe(
		joinChirho(
			inputChirho.root_chirho,
			'build-chirho/public-media-library-chirho',
			`${planChirho.release_id_chirho}-chirho`
		)
	);
	expect(await readFileChirho(joinChirho(outputChirho, 'manifest-chirho.json'))).toEqual(
		Buffer.from(planChirho.files_chirho.get('manifest-chirho.json')!)
	);
	await expect(writeMediaLibraryChirho(inputChirho.root_chirho, planChirho)).rejects.toThrow(
		/EEXIST/
	);
	const releaseMediaChirho = joinChirho(
		inputChirho.root_chirho,
		'build-chirho/preview-chirho/public-chirho/media-chirho'
	);
	await rmChirho(releaseMediaChirho, { recursive: true });
	await symlinkChirho(outputChirho, releaseMediaChirho);
	await expect(buildMediaLibraryChirho(inputChirho.root_chirho)).rejects.toThrow(/symlink/);
	const anotherChirho = await fixtureChirho();
	await saveChirho(anotherChirho);
	await symlinkChirho(
		outputChirho,
		joinChirho(anotherChirho.root_chirho, 'build-chirho/public-media-library-chirho')
	);
	await expect(writeMediaLibraryChirho(anotherChirho.root_chirho, planChirho)).rejects.toThrow(
		/unsafe export parent/
	);
});

it('splits large catalogues below 2 MiB, hashes every output shard and never emits media bytes', async () => {
	const inputChirho = await fixtureChirho();
	const firstChirho = (inputChirho.chapter_chirho.icons_chirho as RowChirho[])[0];
	const manyChirho = Array.from({ length: 1800 }, (_, indexChirho) => ({
		...firstChirho,
		id_chirho: `large-${indexChirho}-chirho`,
		alt_chirho: 'A'.repeat(1500)
	}));
	inputChirho.chapter_chirho.icons_chirho = manyChirho;
	inputChirho.chapter_chirho.lemma_icons_chirho = [];
	await saveChirho(inputChirho);
	const planChirho = await buildMediaLibraryChirho(inputChirho.root_chirho);
	expect(
		[...planChirho.files_chirho.keys()].filter((pathChirho) =>
			pathChirho.startsWith('icons-chirho/')
		).length
	).toBeGreaterThan(1);
	for (const shardChirho of planChirho.manifest_chirho.shards_chirho as RowChirho[]) {
		const bytesChirho = planChirho.files_chirho.get(String(shardChirho.path_chirho))!;
		expect(bytesChirho.length).toBeLessThanOrEqual(MAX_LIBRARY_JSON_BYTES_CHIRHO);
		expect(shardChirho.bytes_chirho).toBe(bytesChirho.length);
		expect(shardChirho.sha256_chirho).toBe(librarySha256Chirho(bytesChirho));
	}
	expect(
		[...planChirho.files_chirho.keys()].every((pathChirho) => /\.(json|md)$/u.test(pathChirho))
	).toBe(true);
});

it('checks the complete output plan before creating a target directory', async () => {
	const inputChirho = await fixtureChirho();
	await saveChirho(inputChirho);
	const planChirho = await buildMediaLibraryChirho(inputChirho.root_chirho);
	const shardPathChirho = [...planChirho.files_chirho.keys()].find((pathChirho) =>
		pathChirho.startsWith('icons-chirho/')
	)!;
	const originalBytesChirho = planChirho.files_chirho.get(shardPathChirho)!;
	planChirho.files_chirho.set(shardPathChirho, new TextEncoder().encode('{}'));
	await expect(writeMediaLibraryChirho(inputChirho.root_chirho, planChirho)).rejects.toThrow(
		/output shard differs/
	);
	planChirho.files_chirho.set(shardPathChirho, originalBytesChirho);
	planChirho.files_chirho.set('../escape-chirho.json', new TextEncoder().encode('{}'));
	await expect(writeMediaLibraryChirho(inputChirho.root_chirho, planChirho)).rejects.toThrow(
		/unsafe export file/
	);
	expect(await readdirChirho(joinChirho(inputChirho.root_chirho, 'build-chirho'))).toEqual([
		'preview-chirho'
	]);
});
