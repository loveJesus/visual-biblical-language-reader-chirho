// For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life. — John 3:16 (KJV)
// Workflow: art-recovery-chirho.md. Deliberate exact recovery; no permanent raster cache.
import {
	readFile as readFileChirho,
	lstat as lstatChirho,
	mkdir as mkdirChirho,
	writeFile as writeFileChirho,
	unlink as unlinkChirho
} from 'node:fs/promises';
import { resolve as resolveChirho, join as joinChirho, dirname as dirnameChirho } from 'node:path';
import { spawn as spawnChirho } from 'node:child_process';
import { digestChirho, objectRequestChirho } from './object-store-chirho';
interface CopyChirho {
	path_chirho: string;
	key_chirho: string;
	sha256_chirho: string;
	bytes_chirho: number;
	verified_at_chirho: string;
}
export async function withArtworkChirho<ValueChirho>(
	rootChirho: string,
	scopesChirho: string[],
	operationChirho: () => Promise<ValueChirho>
): Promise<ValueChirho> {
	const homeChirho = resolveChirho(rootChirho);
	const textChirho = await readFileChirho(
		joinChirho(homeChirho, 'workspace-chirho/art-chirho/remote-archive-chirho/copies-chirho.jsonl'),
		'utf8'
	);
	if (
		Buffer.byteLength(textChirho) > 64 * 1024 ** 2 ||
		!scopesChirho.length ||
		scopesChirho.length > 16
	)
		throw new Error('Recovery scope exceeds bound');
	const pathsChirho = scopesChirho.map((pathChirho) => resolveChirho(pathChirho));
	if (
		pathsChirho.some(
			(pathChirho) =>
				!pathChirho.startsWith(homeChirho + '/static/assets-chirho/') &&
				!pathChirho.startsWith(homeChirho + '/workspace-chirho/art-chirho/') &&
				!pathChirho.startsWith(homeChirho + '/workspace-chirho/previews-chirho/') &&
				!/^\/Users\/hallelujah\/\.codex\/generated_images\/[A-Za-z0-9_-]+\/[A-Za-z0-9_.-]+\.(?:png|webp|jpg|jpeg)$/.test(
					pathChirho
				)
		)
	)
		throw new Error('Recovery only restores identified project artwork');
	const matchesChirho = new Map<string, CopyChirho>();
	for (const lineChirho of textChirho.split('\n')) {
		try {
			const rowChirho = JSON.parse(lineChirho) as CopyChirho;
			if (
				pathsChirho.some(
					(pathChirho) =>
						rowChirho.path_chirho === pathChirho ||
						rowChirho.path_chirho.startsWith(pathChirho + '/')
				)
			)
				matchesChirho.set(rowChirho.path_chirho, rowChirho);
		} catch {
			/* A torn tail has no authority. */
		}
	}
	if (!matchesChirho.size || matchesChirho.size > 256)
		throw new Error('Recovery needs 1..256 exact archived files');
	const hydratedChirho: CopyChirho[] = [];
	try {
		for (const rowChirho of matchesChirho.values()) {
			if (
				!/^[a-f0-9]{64}$/.test(rowChirho.sha256_chirho) ||
				!rowChirho.key_chirho.includes('/' + rowChirho.sha256_chirho + '.') ||
				!Number.isFinite(Date.parse(rowChirho.verified_at_chirho))
			)
				throw new Error('Recovery receipt invalid');
			const existingChirho = await lstatChirho(rowChirho.path_chirho).catch(
				(errorChirho: NodeJS.ErrnoException) => {
					if (errorChirho.code === 'ENOENT') return null;
					throw errorChirho;
				}
			);
			if (existingChirho) {
				if (
					!existingChirho.isFile() ||
					digestChirho(await readFileChirho(rowChirho.path_chirho)) !== rowChirho.sha256_chirho
				)
					throw new Error('Recovery would overwrite changed artwork');
				continue;
			}
			if (
				!Number.isSafeInteger(rowChirho.bytes_chirho) ||
				rowChirho.bytes_chirho < 1 ||
				rowChirho.bytes_chirho > 64 * 1024 ** 2
			)
				throw new Error('Recovery object oversized');
			const responseChirho = await objectRequestChirho('GET', rowChirho.key_chirho);
			if (!responseChirho.ok)
				throw new Error('Archived artwork unavailable; no generation is attempted');
			const bytesChirho = new Uint8Array(await responseChirho.arrayBuffer());
			if (
				bytesChirho.length !== rowChirho.bytes_chirho ||
				digestChirho(bytesChirho) !== rowChirho.sha256_chirho
			)
				throw new Error('Archived artwork readback differs');
			await mkdirChirho(dirnameChirho(rowChirho.path_chirho), { recursive: true });
			// Resolve the real parent, so a symlink cannot redirect a recovery write outside its scope.
			const realParentChirho = await import('node:fs/promises').then((moduleChirho) =>
				moduleChirho.realpath(dirnameChirho(rowChirho.path_chirho))
			);
			if (realParentChirho !== dirnameChirho(rowChirho.path_chirho))
				throw new Error('Recovery parent is redirected');
			await writeFileChirho(rowChirho.path_chirho, bytesChirho, { flag: 'wx', mode: 0o600 });
			hydratedChirho.push(rowChirho);
		}
		return await operationChirho();
	} finally {
		for (const rowChirho of hydratedChirho) {
			const bytesChirho = await readFileChirho(rowChirho.path_chirho).catch(() => null);
			if (bytesChirho && digestChirho(bytesChirho) === rowChirho.sha256_chirho)
				await unlinkChirho(rowChirho.path_chirho);
			else if (bytesChirho)
				console.error(
					'Temporary artwork changed during inspection; retained for owner reconciliation'
				);
		}
	}
}
if (import.meta.main) {
	const argumentsChirho = process.argv.slice(2),
		splitChirho = argumentsChirho.indexOf('--');
	if (splitChirho < 1 || !argumentsChirho[splitChirho + 1])
		throw new Error(
			'Use: with-artwork-chirho.ts <exact archived file or attempt directory> [more scopes] -- <inspection/recovery command>'
		);
	process.exitCode = await withArtworkChirho(
		process.cwd(),
		argumentsChirho.slice(0, splitChirho),
		() =>
			new Promise<number>((doneChirho, rejectChirho) => {
				const childChirho = spawnChirho(
					argumentsChirho[splitChirho + 1],
					argumentsChirho.slice(splitChirho + 2),
					{ stdio: 'inherit' }
				);
				childChirho.once('error', rejectChirho);
				childChirho.once('exit', (codeChirho) => doneChirho(codeChirho ?? 1));
			})
	);
}
