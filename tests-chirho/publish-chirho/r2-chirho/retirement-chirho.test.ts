// For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life. — John 3:16 (KJV)
import { afterEach, expect, it, vi as viChirho } from 'vitest';
import {
	mkdtemp as mkdtempChirho,
	mkdir as mkdirChirho,
	writeFile as writeFileChirho,
	readFile as readFileChirho,
	rm as rmChirho,
	realpath as realpathChirho,
	symlink as symlinkChirho
} from 'node:fs/promises';
import { tmpdir as tmpdirChirho } from 'node:os';
import { join as joinChirho } from 'node:path';
import { retireArtworkChirho } from '../../../scripts-chirho/publish-chirho/r2-chirho/retire-artwork-chirho';
import * as catalogueChirho from '../../../scripts-chirho/publish-chirho/r2-chirho/catalogue-chirho';
import * as storeChirho from '../../../scripts-chirho/publish-chirho/r2-chirho/object-store-chirho';

const rootsChirho: string[] = [];
afterEach(async () => {
	viChirho.restoreAllMocks();
	await Promise.all(
		rootsChirho
			.splice(0)
			.map((rootChirho) => rmChirho(rootChirho, { recursive: true, force: true }))
	);
});

async function fixtureChirho() {
	const rootChirho = await realpathChirho(
		await mkdtempChirho(joinChirho(tmpdirChirho(), 'hinneh-retire-chirho-'))
	);
	rootsChirho.push(rootChirho);
	const queueChirho = joinChirho(
		rootChirho,
		'workspace-chirho/art-chirho/queue-chirho/bible-icons-chirho'
	);
	const firstChirho = joinChirho(queueChirho, 'attempts-chirho/first-chirho');
	const secondChirho = joinChirho(queueChirho, 'attempts-chirho/second-chirho');
	const archiveChirho = joinChirho(rootChirho, 'workspace-chirho/art-chirho/remote-archive-chirho');
	await Promise.all(
		[firstChirho, secondChirho, archiveChirho, joinChirho(rootChirho, 'build-chirho')].map(
			(pathChirho) => mkdirChirho(pathChirho, { recursive: true })
		)
	);
	const bytesChirho = Buffer.from('retirement-test-chirho');
	const shaChirho = storeChirho.digestChirho(bytesChirho);
	const filesChirho = [firstChirho, secondChirho].map((pathChirho) =>
		joinChirho(pathChirho, 'sheet-chirho.webp')
	);
	await Promise.all(filesChirho.map((pathChirho) => writeFileChirho(pathChirho, bytesChirho)));
	await writeFileChirho(
		joinChirho(queueChirho, 'worker-state-chirho.json'),
		JSON.stringify({
			active_attempts_chirho: ['attempts-chirho/first-chirho', 'attempts-chirho/second-chirho']
		})
	);
	await writeFileChirho(
		joinChirho(archiveChirho, 'copies-chirho.jsonl'),
		filesChirho
			.map((pathChirho) =>
				JSON.stringify({
					path_chirho: pathChirho,
					sha256_chirho: shaChirho,
					key_chirho: `provenance-chirho/sha256-chirho/${shaChirho}.webp`,
					bytes_chirho: bytesChirho.length,
					verified_at_chirho: '2026-11-04T09:00:00Z'
				})
			)
			.join('\n') + '\n'
	);
	await writeFileChirho(
		joinChirho(rootChirho, 'build-chirho/r2-artwork-hosted-chirho.json'),
		JSON.stringify({
			hostname_chirho: 'hinneh.bible.systems',
			artwork_r2_chirho: true,
			release_id_chirho: 'a'.repeat(64)
		})
	);
	viChirho
		.spyOn(catalogueChirho, 'readArtworkCatalogueChirho')
		.mockResolvedValue({ entries_chirho: new Map(), index_sha256_chirho: 'b'.repeat(64) });
	const remoteChirho = viChirho
		.spyOn(storeChirho, 'objectRequestChirho')
		.mockImplementation(async () => {
			throw new Error('Unexpected network');
		});
	return { rootChirho, firstChirho, secondChirho, filesChirho, bytesChirho, remoteChirho };
}

it('retires only its completed attempt while the sibling remains intact', async () => {
	const fixtureValueChirho = await fixtureChirho();
	const resultChirho = await retireArtworkChirho(fixtureValueChirho.rootChirho, true, true, [
		fixtureValueChirho.firstChirho
	]);
	expect(resultChirho.deleted_files_chirho).toBe(1);
	await expect(readFileChirho(fixtureValueChirho.filesChirho[0])).rejects.toMatchObject({
		code: 'ENOENT'
	});
	expect(await readFileChirho(fixtureValueChirho.filesChirho[1])).toEqual(
		fixtureValueChirho.bytesChirho
	);
	expect(fixtureValueChirho.remoteChirho).not.toHaveBeenCalled();
});

it('protects every active attempt from legacy broad cleanup', async () => {
	const fixtureValueChirho = await fixtureChirho();
	const resultChirho = await retireArtworkChirho(fixtureValueChirho.rootChirho, true, true);
	expect(resultChirho.deleted_files_chirho).toBe(0);
	for (const pathChirho of fixtureValueChirho.filesChirho)
		expect(await readFileChirho(pathChirho)).toEqual(fixtureValueChirho.bytesChirho);
	expect(fixtureValueChirho.remoteChirho).not.toHaveBeenCalled();
});

it('refuses an outside or linked scope before storage or deletion', async () => {
	const fixtureValueChirho = await fixtureChirho();
	await expect(
		retireArtworkChirho(fixtureValueChirho.rootChirho, true, true, [fixtureValueChirho.rootChirho])
	).rejects.toThrow(/owned attempt/);
	const linkedChirho = joinChirho(fixtureValueChirho.firstChirho, 'linked-chirho');
	await symlinkChirho(fixtureValueChirho.secondChirho, linkedChirho);
	await expect(
		retireArtworkChirho(fixtureValueChirho.rootChirho, true, true, [linkedChirho])
	).rejects.toThrow(/owned attempt/);
	expect(fixtureValueChirho.remoteChirho).not.toHaveBeenCalled();
});
