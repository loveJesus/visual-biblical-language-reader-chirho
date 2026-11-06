// For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life. — John 3:16 (KJV)
// Workflow: media-delivery-chirho.md. Archive exact project evidence, then retire verified copies.
import {
	readdir as readdirChirho,
	readFile as readFileChirho,
	lstat as lstatChirho,
	realpath as realpathChirho,
	mkdir as mkdirChirho,
	open as openChirho,
	unlink as unlinkChirho
} from 'node:fs/promises';
import { join as joinChirho, resolve as resolveChirho, extname as extnameChirho } from 'node:path';
import { digestChirho, objectRequestChirho } from './object-store-chirho';
import { acquireLockChirho } from '../r2_upload_watch_chirho';
import { readArtworkCatalogueChirho } from './catalogue-chirho';

const EXTENSIONS_CHIRHO = new Set(['.png', '.webp', '.jpg', '.jpeg']);
const EXTERNAL_CHIRHO =
	'/Volumes/OPENALEX_M2_CHIRHO/dev-chirho/personal-chirho/visual-biblical-language-reader-chirho';
interface ArchivedCopyChirho {
	path_chirho: string;
	sha256_chirho: string;
	key_chirho: string;
	bytes_chirho: number;
	verified_at_chirho: string;
}
export async function retireArtworkChirho(
	rootChirho: string,
	applyChirho = false,
	retireChirho = false,
	scopesChirho: string[] = []
) {
	rootChirho = resolveChirho(rootChirho);
	if (scopesChirho.length > 16) throw new Error('Retirement scope exceeds bound');
	const selectedChirho = scopesChirho.map((scopeChirho) => resolveChirho(rootChirho, scopeChirho));
	const ownedHomeChirho = joinChirho(rootChirho, 'workspace-chirho/art-chirho/queue-chirho');
	for (const pathChirho of selectedChirho) {
		if (
			!pathChirho.startsWith(ownedHomeChirho + '/') ||
			!(await lstatChirho(pathChirho)).isDirectory() ||
			(await realpathChirho(pathChirho)) !== pathChirho
		)
			throw new Error('Retirement scope must be an owned attempt directory');
	}
	// Legacy broad cleanup must never touch a coordinator's active attempts. Explicit
	// scopes allow the sole installer to retire just its completed sheet.
	const statePathChirho = joinChirho(
		ownedHomeChirho,
		'bible-icons-chirho/worker-state-chirho.json'
	);
	const stateTextChirho = await readFileChirho(statePathChirho, 'utf8').catch(
		(errorChirho: NodeJS.ErrnoException) => {
			if (errorChirho.code === 'ENOENT') return '{}';
			throw errorChirho;
		}
	);
	const stateChirho = JSON.parse(stateTextChirho);
	const activeChirho: unknown =
		stateChirho.active_attempts_chirho ??
		(stateChirho.active_attempt_chirho ? [stateChirho.active_attempt_chirho] : []);
	if (
		!Array.isArray(activeChirho) ||
		activeChirho.length > 2 ||
		activeChirho.some((pathChirho) => typeof pathChirho !== 'string')
	)
		throw new Error('Invalid active artwork journal');
	const protectedChirho = (activeChirho as string[]).map((pathChirho) => {
		const resolvedChirho = resolveChirho(ownedHomeChirho, 'bible-icons-chirho', pathChirho);
		if (!resolvedChirho.startsWith(joinChirho(ownedHomeChirho, 'bible-icons-chirho') + '/'))
			throw new Error('Active artwork path escapes queue');
		return resolvedChirho;
	});
	const homeChirho = joinChirho(rootChirho, 'workspace-chirho/art-chirho/remote-archive-chirho');
	await mkdirChirho(homeChirho, { recursive: true });
	const releaseChirho = await acquireLockChirho(joinChirho(homeChirho, 'archive-chirho.lock'));
	let descriptorChirho: Awaited<ReturnType<typeof openChirho>> | undefined;
	try {
		const catalogueChirho = await readArtworkCatalogueChirho(rootChirho);
		if (!catalogueChirho) throw new Error('Artwork remote catalogue is required');
		const knownChirho = new Map<
			string,
			{ key_chirho: string; bytes_chirho: number; verified_at_chirho: string }
		>();
		for (const entryChirho of catalogueChirho.entries_chirho.values())
			for (const factChirho of [entryChirho.source_chirho, entryChirho.delivery_chirho])
				knownChirho.set(factChirho.sha256_chirho, factChirho);
		const receiptPathChirho = joinChirho(homeChirho, 'copies-chirho.jsonl');
		const receiptTextChirho = await readFileChirho(receiptPathChirho, 'utf8').catch(() => '');
		if (Buffer.byteLength(receiptTextChirho) > 64 * 1024 ** 2)
			throw new Error('Archive receipts need cold retirement');
		const previousChirho = new Map<string, ArchivedCopyChirho>();
		for (const lineChirho of receiptTextChirho.split('\n')) {
			try {
				const rowChirho = JSON.parse(lineChirho) as ArchivedCopyChirho;
				if (
					/^[a-f0-9]{64}$/.test(rowChirho.sha256_chirho) &&
					/^(?:media-chirho|provenance-chirho)\/sha256-chirho\/[a-f0-9]{64}\.(?:png|webp|jpg|jpeg)$/.test(
						rowChirho.key_chirho
					) &&
					rowChirho.key_chirho.includes(rowChirho.sha256_chirho) &&
					Number.isSafeInteger(rowChirho.bytes_chirho) &&
					Number.isFinite(Date.parse(rowChirho.verified_at_chirho))
				) {
					previousChirho.set(rowChirho.path_chirho, rowChirho);
					knownChirho.set(rowChirho.sha256_chirho, rowChirho);
				}
			} catch {
				/* Torn tail is re-verified. */
			}
		}
		const pathsChirho = new Set<string>();
		const metadataChirho: string[] = [];
		async function walkChirho(folderChirho: string, metadataAllowedChirho = false) {
			if (
				!selectedChirho.length &&
				protectedChirho.some(
					(pathChirho) => folderChirho === pathChirho || folderChirho.startsWith(pathChirho + '/')
				)
			)
				return;
			for (const entryChirho of await readdirChirho(folderChirho, { withFileTypes: true }).catch(
				(errorChirho: NodeJS.ErrnoException) => {
					if (errorChirho.code === 'ENOENT') return [];
					throw errorChirho;
				}
			)) {
				if (
					entryChirho.isSymbolicLink() ||
					['node_modules', '.git', '__pycache__'].includes(entryChirho.name)
				)
					continue;
				const pathChirho = joinChirho(folderChirho, entryChirho.name);
				if (entryChirho.isDirectory()) await walkChirho(pathChirho, metadataAllowedChirho);
				else if (
					entryChirho.isFile() &&
					EXTENSIONS_CHIRHO.has(extnameChirho(pathChirho).toLowerCase())
				)
					pathsChirho.add(pathChirho);
				else if (
					metadataAllowedChirho &&
					/\.(?:json|jsonl|md|txt)$/.test(pathChirho) &&
					!pathChirho.startsWith(homeChirho + '/')
				)
					metadataChirho.push(pathChirho);
				if (pathsChirho.size > 200000 || metadataChirho.length > 100000)
					throw new Error('Artwork archive scope needs sharding');
			}
		}
		if (selectedChirho.length) {
			for (const pathChirho of selectedChirho) await walkChirho(pathChirho, true);
			// These two output trees have the same sole installer owner. Generators may
			// write only inside their own attempt, never these committed output trees.
			await walkChirho(joinChirho(rootChirho, 'static/assets-chirho'));
			await walkChirho(joinChirho(rootChirho, 'build-chirho/delivery-media-chirho'));
		} else {
			for (const relativeChirho of [
				'static/assets-chirho',
				'workspace-chirho/art-chirho',
				'workspace-chirho/previews-chirho',
				'build-chirho',
				'.svelte-kit'
			])
				await walkChirho(
					joinChirho(rootChirho, relativeChirho),
					relativeChirho === 'workspace-chirho/art-chirho'
				);
			await walkChirho(EXTERNAL_CHIRHO);
		}
		// Exact references only. Never remove an unrelated image from the shared generator cache.
		for (const pathChirho of metadataChirho) {
			const infoChirho = await lstatChirho(pathChirho);
			if (infoChirho.size > 16 * 1024 ** 2) continue;
			const textChirho = await readFileChirho(pathChirho, 'utf8');
			for (const matchChirho of textChirho.matchAll(
				/\/Users\/hallelujah\/\.codex\/generated_images\/[A-Za-z0-9_-]+\/[A-Za-z0-9_.-]+\.(?:png|webp|jpg|jpeg)/g
			))
				if ((await lstatChirho(matchChirho[0]).catch(() => null))?.isFile())
					pathsChirho.add(matchChirho[0]);
		}
		if (retireChirho) {
			const hostedChirho = JSON.parse(
				await readFileChirho(
					joinChirho(rootChirho, 'build-chirho/r2-artwork-hosted-chirho.json'),
					'utf8'
				)
			);
			if (
				hostedChirho.hostname_chirho !== 'hinneh.bible.systems' ||
				hostedChirho.artwork_r2_chirho !== true ||
				!/^[a-f0-9]{64}$/.test(hostedChirho.release_id_chirho)
			)
				throw new Error('Hosted R2 proof is required before retirement');
		}
		if (!applyChirho)
			return { files_chirho: pathsChirho.size, remote_writes_chirho: 0, deletions_chirho: 0 };
		descriptorChirho = await openChirho(receiptPathChirho, 'a');
		const activeChirho = new Map<
			string,
			Promise<{ key_chirho: string; bytes_chirho: number; verified_at_chirho: string }>
		>();
		let nextChirho = 0,
			completedChirho = 0,
			uploadedChirho = 0,
			deletedChirho = 0,
			totalBytesChirho = 0;
		let failureChirho: unknown;
		const itemsChirho = [...pathsChirho].sort();
		await Promise.all(
			Array.from({ length: 4 }, async () => {
				while (!failureChirho) {
					const indexChirho = nextChirho++;
					if (indexChirho >= itemsChirho.length) return;
					try {
						const pathChirho = itemsChirho[indexChirho];
						const infoChirho = await lstatChirho(pathChirho);
						if (!infoChirho.isFile() || infoChirho.size > 64 * 1024 ** 2)
							throw new Error('Artwork file scope differs');
						const bytesChirho = await readFileChirho(pathChirho),
							shaChirho = digestChirho(bytesChirho);
						let factChirho = knownChirho.get(shaChirho);
						if (!factChirho) {
							let requestChirho = activeChirho.get(shaChirho);
							if (!requestChirho) {
								requestChirho = (async () => {
									const keyChirho = `provenance-chirho/sha256-chirho/${shaChirho}${extnameChirho(pathChirho).toLowerCase()}`;
									let responseChirho = await objectRequestChirho('GET', keyChirho);
									if (responseChirho.status === 404) {
										await responseChirho.arrayBuffer();
										const putChirho = await objectRequestChirho('PUT', keyChirho, bytesChirho);
										await putChirho.arrayBuffer();
										if (!putChirho.ok)
											throw new Error(`Provenance archive refused (${putChirho.status})`);
										uploadedChirho++;
										responseChirho = await objectRequestChirho('GET', keyChirho);
									}
									if (!responseChirho.ok)
										throw new Error(`Provenance readback refused (${responseChirho.status})`);
									const remoteChirho = new Uint8Array(await responseChirho.arrayBuffer());
									if (
										remoteChirho.length !== bytesChirho.length ||
										digestChirho(remoteChirho) !== shaChirho
									)
										throw new Error('Provenance readback differs');
									const verifiedChirho = {
										key_chirho: keyChirho,
										bytes_chirho: bytesChirho.length,
										verified_at_chirho: new Date().toISOString()
									};
									knownChirho.set(shaChirho, verifiedChirho);
									return verifiedChirho;
								})();
								activeChirho.set(shaChirho, requestChirho);
							}
							factChirho = await requestChirho;
						}
						if (factChirho.bytes_chirho !== bytesChirho.length)
							throw new Error('Artwork archive length differs');
						const rowChirho: ArchivedCopyChirho = {
							path_chirho: pathChirho,
							sha256_chirho: shaChirho,
							...factChirho
						};
						if (previousChirho.get(pathChirho)?.sha256_chirho !== shaChirho) {
							const lineChirho = JSON.stringify(rowChirho) + '\n';
							const writtenChirho = await descriptorChirho!.write(lineChirho);
							if (writtenChirho.bytesWritten !== Buffer.byteLength(lineChirho))
								throw new Error('Archive receipt write was incomplete');
							await descriptorChirho!.sync();
						}
						if (retireChirho) {
							const currentChirho = await readFileChirho(pathChirho);
							if (digestChirho(currentChirho) !== shaChirho)
								throw new Error('Artwork changed before retirement');
							await unlinkChirho(pathChirho);
							deletedChirho++;
						}
						completedChirho++;
						totalBytesChirho += bytesChirho.length;
						if (completedChirho % 1000 === 0)
							console.log(
								`artwork archived ${completedChirho}/${itemsChirho.length}; retired ${deletedChirho}`
							);
					} catch (errorChirho) {
						failureChirho = errorChirho;
					}
				}
			})
		);
		if (failureChirho) throw failureChirho;
		return {
			files_chirho: completedChirho,
			bytes_chirho: totalBytesChirho,
			uploaded_objects_chirho: uploadedChirho,
			deleted_files_chirho: deletedChirho
		};
	} finally {
		await descriptorChirho?.close();
		await releaseChirho();
	}
}
export function retirementOptionsChirho(argumentsChirho: string[]) {
	const scopesChirho: string[] = [];
	let applyChirho = false;
	let retireChirho = false;
	for (const argumentChirho of argumentsChirho) {
		if (argumentChirho === '--archive-chirho') applyChirho = true;
		else if (argumentChirho === '--retire-verified-chirho') retireChirho = true;
		else if (argumentChirho.startsWith('--scope-chirho=')) {
			const scopeChirho = argumentChirho.slice('--scope-chirho='.length);
			if (!scopeChirho.trim()) throw new Error('Retirement scope is empty');
			scopesChirho.push(scopeChirho);
		} else throw new Error('Unsupported retirement argument: ' + argumentChirho);
	}
	if (retireChirho && !applyChirho)
		throw new Error('Retirement requires --archive-chirho and verified readback');
	if (scopesChirho.length > 16 || new Set(scopesChirho).size !== scopesChirho.length)
		throw new Error('Retirement scopes exceed their bound or repeat');
	return { applyChirho, retireChirho, scopesChirho };
}
if (import.meta.main) {
	const optionsChirho = retirementOptionsChirho(process.argv.slice(2));
	console.log(
		JSON.stringify(
			await retireArtworkChirho(
				process.cwd(),
				optionsChirho.applyChirho,
				optionsChirho.retireChirho,
				optionsChirho.scopesChirho
			)
		)
	);
}
