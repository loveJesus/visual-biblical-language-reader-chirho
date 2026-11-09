// For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life. — John 3:16 (KJV)
// Metadata-only R2 snapshots still pass the unchanged source-bound audio byte/header gate.
import { afterEach, expect, it, vi } from 'vitest';
import * as filesystemChirho from 'node:fs/promises';
import {
	mkdir as mkdirChirho,
	realpath as realpathChirho,
	rename as renameChirho,
	rm as rmChirho,
	symlink as symlinkChirho,
	unlink as unlinkChirho,
	writeFile as writeFileChirho
} from 'node:fs/promises';
import { dirname as dirnameChirho, join as joinChirho } from 'node:path';
import { execFileSync as execFileSyncChirho } from 'node:child_process';
import { loadAudioSourceBodiesChirho } from '../../scripts-chirho/publish-chirho/r2-chirho/audio-source-chirho';
import {
	hasMp3HeaderChirho,
	verifyAudioChirho
} from '../../scripts-chirho/publish-chirho/audio_rules_chirho';
import {
	RefusalChirho,
	sha256Chirho,
	type FilesChirho
} from '../../scripts-chirho/publish-chirho/release_rules_chirho';
import { temporaryRootChirho } from '../../tests-chirho/publish-chirho/support-chirho';

vi.mock('node:fs/promises', async (importOriginalChirho) => {
	const originalChirho = await importOriginalChirho<typeof import('node:fs/promises')>();
	return {
		...originalChirho,
		open: vi.fn(originalChirho.open),
		readFile: vi.fn(originalChirho.readFile)
	};
});
const rootsChirho: string[] = [];
afterEach(async () => {
	vi.clearAllMocks();
	await Promise.all(
		rootsChirho
			.splice(0)
			.map((rootChirho) => rmChirho(rootChirho, { recursive: true, force: true }))
	);
});
const CONTENT_CHIRHO = 'content-chirho/proverbs-chirho/chapter-01-chirho.json';
const CHAPTER_CHIRHO = 'audio-chirho/proverbs-chirho/chapter-01-chirho.json';
function mpegChirho(secondsChirho: string) {
	return execFileSyncChirho('ffmpeg', [
		'-hide_banner',
		'-loglevel',
		'error',
		'-f',
		'lavfi',
		'-i',
		'anullsrc=r=44100:cl=mono',
		'-t',
		secondsChirho,
		'-map_metadata',
		'-1',
		'-c:a',
		'libmp3lame',
		'-b:a',
		'64k',
		'-write_xing',
		'0',
		'-id3v2_version',
		'0',
		'-f',
		'mp3',
		'pipe:1'
	]);
}
const SHORT_MPEG_CHIRHO = mpegChirho('0.12');
const LONG_MPEG_CHIRHO = mpegChirho('0.18');
interface FixtureChirho {
	root_chirho: string;
	files_chirho: FilesChirho;
	paths_chirho: string[];
	clips_chirho: Record<string, unknown>[];
	refresh_chirho: () => void;
}
async function fixtureChirho(
	bodiesChirho: Uint8Array[] = [SHORT_MPEG_CHIRHO]
): Promise<FixtureChirho> {
	const rootChirho = await realpathChirho(await temporaryRootChirho());
	rootsChirho.push(rootChirho);
	const contentChirho = Buffer.from(
		JSON.stringify({
			verses_chirho: bodiesChirho.map((_bodyChirho, indexChirho) => ({
				id_chirho: `Prov.1.${indexChirho + 1}`,
				canonical_text_chirho: 'אב',
				tokens_chirho: [
					{
						id_chirho: `word-${indexChirho}-chirho`,
						text_chirho: 'אב',
						start_chirho: 0,
						end_chirho: 2
					}
				]
			}))
		})
	);
	const pathsChirho = bodiesChirho.map(
		(bodyChirho) => `audio-chirho/sha256-chirho/${sha256Chirho(bodyChirho)}-chirho.mp3`
	);
	const clipsChirho = bodiesChirho.map((bodyChirho, indexChirho) => ({
		lesson_id_chirho: `Prov.1.${indexChirho + 1}`,
		token_id_chirho: null,
		canonical_sha256_chirho: sha256Chirho('אב'),
		text_chirho: 'אב',
		language_chirho: 'he',
		pronunciation_chirho: 'israeli_hebrew',
		voice_name_chirho: 'Synthetic silent fixture',
		asset_path_chirho: '/' + pathsChirho[indexChirho],
		sha256_chirho: sha256Chirho(bodyChirho),
		bytes_chirho: bodyChirho.length,
		duration_chirho: 0.18,
		review_chirho: 'audition',
		license_chirho: 'Synthetic test fixture'
	}));
	const filesChirho: FilesChirho = new Map([[CONTENT_CHIRHO, contentChirho]]);
	const refreshChirho = () => {
		const chapterChirho = Buffer.from(
			JSON.stringify({
				schema_version_chirho: 1,
				book_id_chirho: 'Prov',
				chapter_chirho: 1,
				content_path_chirho: '/' + CONTENT_CHIRHO,
				content_sha256_chirho: sha256Chirho(contentChirho),
				clips_chirho: clipsChirho
			})
		);
		filesChirho.set(CHAPTER_CHIRHO, chapterChirho);
		filesChirho.set(
			'audio-chirho/manifest-chirho.json',
			Buffer.from(
				JSON.stringify({
					schema_version_chirho: 1,
					books_chirho: {
						Prov: {
							chapters_chirho: [
								{
									number_chirho: 1,
									path_chirho: '/' + CHAPTER_CHIRHO,
									sha256_chirho: sha256Chirho(chapterChirho)
								}
							]
						}
					}
				})
			)
		);
	};
	refreshChirho();
	for (const [indexChirho, pathChirho] of pathsChirho.entries()) {
		const destinationChirho = joinChirho(rootChirho, 'static', pathChirho);
		await mkdirChirho(dirnameChirho(destinationChirho), { recursive: true });
		await writeFileChirho(destinationChirho, bodiesChirho[indexChirho]);
	}
	return {
		root_chirho: rootChirho,
		files_chirho: filesChirho,
		paths_chirho: pathsChirho,
		clips_chirho: clipsChirho,
		refresh_chirho: refreshChirho
	};
}
function reasonsChirho(filesChirho: FilesChirho) {
	const failuresChirho: string[] = [];
	verifyAudioChirho(filesChirho, true, failuresChirho);
	return failuresChirho;
}
it('hydrates only frozen catalogue-referenced real MPEG into validation memory and passes verifyAudio', async () => {
	const fixtureValueChirho = await fixtureChirho();
	const untouchedMetadataChirho = [...fixtureValueChirho.files_chirho].map(
		([pathChirho, bytesChirho]) => [pathChirho, Buffer.from(bytesChirho)] as const
	);
	const unreferencedChirho = joinChirho(
		fixtureValueChirho.root_chirho,
		'static/audio-chirho/sha256-chirho/' + sha256Chirho(LONG_MPEG_CHIRHO) + '-chirho.mp3'
	);
	const privateChirho = joinChirho(
		fixtureValueChirho.root_chirho,
		'workspace-chirho/private-chirho/sentinel-chirho.bin'
	);
	await writeFileChirho(unreferencedChirho, LONG_MPEG_CHIRHO);
	await mkdirChirho(dirnameChirho(privateChirho), { recursive: true });
	await writeFileChirho(privateChirho, 'private synthetic sentinel, never read');
	expect(reasonsChirho(fixtureValueChirho.files_chirho)).toContainEqual(
		expect.stringMatching(/byte\/hash\/header/)
	);
	expect(
		await loadAudioSourceBodiesChirho(
			fixtureValueChirho.files_chirho,
			fixtureValueChirho.root_chirho
		)
	).toBe(1);
	expect(
		hasMp3HeaderChirho(fixtureValueChirho.files_chirho.get(fixtureValueChirho.paths_chirho[0])!)
	).toBe(true);
	expect(reasonsChirho(fixtureValueChirho.files_chirho)).toEqual([]);
	for (const [pathChirho, bytesChirho] of untouchedMetadataChirho)
		expect(Buffer.from(fixtureValueChirho.files_chirho.get(pathChirho)!)).toEqual(bytesChirho);
	expect(
		vi.mocked(filesystemChirho.open).mock.calls.map((callChirho) => String(callChirho[0]))
	).toEqual([
		joinChirho(fixtureValueChirho.root_chirho, 'static', fixtureValueChirho.paths_chirho[0])
	]);
	expect(vi.mocked(filesystemChirho.readFile).mock.calls).toEqual([]);
	expect(
		[...fixtureValueChirho.files_chirho.keys()].filter((pathChirho) => pathChirho.endsWith('.mp3'))
	).toEqual(fixtureValueChirho.paths_chirho);
});
it('keeps a tampered-but-valid MPEG subject to the unchanged SHA gate', async () => {
	const fixtureValueChirho = await fixtureChirho();
	const changedChirho = Buffer.from(SHORT_MPEG_CHIRHO);
	changedChirho[changedChirho.length - 1] ^= 1;
	expect(hasMp3HeaderChirho(changedChirho)).toBe(true);
	await writeFileChirho(
		joinChirho(fixtureValueChirho.root_chirho, 'static', fixtureValueChirho.paths_chirho[0]),
		changedChirho
	);
	await loadAudioSourceBodiesChirho(
		fixtureValueChirho.files_chirho,
		fixtureValueChirho.root_chirho
	);
	expect(reasonsChirho(fixtureValueChirho.files_chirho)).toContainEqual(
		expect.stringMatching(/byte\/hash\/header/)
	);
});
it('keeps self-consistent invalid MPEG bytes subject to the unchanged header gate', async () => {
	const badChirho = Buffer.alloc(SHORT_MPEG_CHIRHO.length, 0);
	const fixtureValueChirho = await fixtureChirho([badChirho]);
	await loadAudioSourceBodiesChirho(
		fixtureValueChirho.files_chirho,
		fixtureValueChirho.root_chirho
	);
	expect(
		sha256Chirho(fixtureValueChirho.files_chirho.get(fixtureValueChirho.paths_chirho[0])!)
	).toBe(fixtureValueChirho.clips_chirho[0].sha256_chirho);
	expect(hasMp3HeaderChirho(badChirho)).toBe(false);
	expect(reasonsChirho(fixtureValueChirho.files_chirho)).toContainEqual(
		expect.stringMatching(/byte\/hash\/header/)
	);
});
it.each(['missing', 'linked'] as const)(
	'refuses a %s referenced source without inserting its body',
	async (modeChirho) => {
		const fixtureValueChirho = await fixtureChirho();
		const pathChirho = joinChirho(
			fixtureValueChirho.root_chirho,
			'static',
			fixtureValueChirho.paths_chirho[0]
		);
		await unlinkChirho(pathChirho);
		if (modeChirho === 'linked') {
			const targetChirho = joinChirho(fixtureValueChirho.root_chirho, 'private-source-chirho.mp3');
			await writeFileChirho(targetChirho, SHORT_MPEG_CHIRHO);
			await symlinkChirho(targetChirho, pathChirho);
		}
		await expect(
			loadAudioSourceBodiesChirho(fixtureValueChirho.files_chirho, fixtureValueChirho.root_chirho)
		).rejects.toBeInstanceOf(RefusalChirho);
		expect(fixtureValueChirho.files_chirho.has(fixtureValueChirho.paths_chirho[0])).toBe(false);
	}
);
it('refuses a redirected source directory before opening any MP3', async () => {
	const fixtureValueChirho = await fixtureChirho();
	const parentChirho = joinChirho(
		fixtureValueChirho.root_chirho,
		'static/audio-chirho/sha256-chirho'
	);
	const movedChirho = joinChirho(fixtureValueChirho.root_chirho, 'redirected-audio-chirho');
	await renameChirho(parentChirho, movedChirho);
	await symlinkChirho(movedChirho, parentChirho);
	await expect(
		loadAudioSourceBodiesChirho(fixtureValueChirho.files_chirho, fixtureValueChirho.root_chirho)
	).rejects.toBeInstanceOf(RefusalChirho);
	expect(filesystemChirho.open).not.toHaveBeenCalled();
	expect(filesystemChirho.readFile).not.toHaveBeenCalled();
});
it('reads duplicate SHA references once and inserts unique bodies deterministically', async () => {
	const fixtureValueChirho = await fixtureChirho([
		LONG_MPEG_CHIRHO,
		SHORT_MPEG_CHIRHO,
		LONG_MPEG_CHIRHO
	]);
	const expectedPathsChirho = [...new Set(fixtureValueChirho.paths_chirho)].sort();
	expect(
		await loadAudioSourceBodiesChirho(
			fixtureValueChirho.files_chirho,
			fixtureValueChirho.root_chirho
		)
	).toBe(2);
	expect(vi.mocked(filesystemChirho.open).mock.calls).toHaveLength(2);
	expect(
		[...fixtureValueChirho.files_chirho.keys()].filter((pathChirho) => pathChirho.endsWith('.mp3'))
	).toEqual(expectedPathsChirho);
	expect(reasonsChirho(fixtureValueChirho.files_chirho)).toEqual([]);
	expect(
		await loadAudioSourceBodiesChirho(
			fixtureValueChirho.files_chirho,
			fixtureValueChirho.root_chirho
		)
	).toBe(0);
	expect(vi.mocked(filesystemChirho.open).mock.calls).toHaveLength(2);
});
it('refuses a private metadata path before any filesystem body read', async () => {
	const fixtureValueChirho = await fixtureChirho();
	fixtureValueChirho.clips_chirho[0].asset_path_chirho =
		'/workspace-chirho/private-chirho/sentinel-chirho.bin';
	fixtureValueChirho.refresh_chirho();
	await expect(
		loadAudioSourceBodiesChirho(fixtureValueChirho.files_chirho, fixtureValueChirho.root_chirho)
	).rejects.toBeInstanceOf(RefusalChirho);
	expect(filesystemChirho.open).not.toHaveBeenCalled();
	expect(filesystemChirho.readFile).not.toHaveBeenCalled();
});
