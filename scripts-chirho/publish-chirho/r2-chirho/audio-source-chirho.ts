// For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life. — John 3:16 (KJV)
// Workflow: media-delivery-chirho.md. Read immutable local audio for the unchanged release byte/header gate, without copying it into the compiler snapshot.
import { constants as constantsChirho } from 'node:fs';
import { open as openChirho, realpath as realpathChirho } from 'node:fs/promises';
import { join as joinChirho } from 'node:path';
import { isBibleChapterPathChirho } from '../../../src/lib/bible-chirho/books-chirho';
import { RefusalChirho, sha256Chirho, type FilesChirho } from '../release_rules_chirho';

export async function loadAudioSourceBodiesChirho(
	filesChirho: FilesChirho,
	sourceRootChirho: string
): Promise<number> {
	const manifestBytesChirho = filesChirho.get('audio-chirho/manifest-chirho.json');
	if (!manifestBytesChirho) return 0;
	if (manifestBytesChirho.length > 2_000_000)
		throw new RefusalChirho(['audio source manifest exceeds its bound']);
	const manifestChirho = JSON.parse(
		new TextDecoder('utf-8', { fatal: true }).decode(manifestBytesChirho)
	);
	if (manifestChirho.schema_version_chirho !== 1 || !manifestChirho.books_chirho)
		throw new RefusalChirho(['audio source manifest differs']);
	const pathsChirho = new Set<string>();
	let chaptersChirho = 0;
	for (const bookChirho of Object.values(manifestChirho.books_chirho) as {
		chapters_chirho: { path_chirho: string; sha256_chirho: string }[];
	}[]) {
		if (!Array.isArray(bookChirho.chapters_chirho))
			throw new RefusalChirho(['audio source chapters differ']);
		for (const entryChirho of bookChirho.chapters_chirho) {
			if (
				++chaptersChirho > 1200 ||
				!isBibleChapterPathChirho(entryChirho.path_chirho, '/audio-chirho/')
			)
				throw new RefusalChirho(['audio source chapter scope differs']);
			const chapterBytesChirho = filesChirho.get(entryChirho.path_chirho.slice(1));
			if (
				!chapterBytesChirho ||
				chapterBytesChirho.length > 2_000_000 ||
				sha256Chirho(chapterBytesChirho) !== entryChirho.sha256_chirho
			)
				throw new RefusalChirho(['audio source chapter hash differs']);
			const chapterChirho = JSON.parse(
				new TextDecoder('utf-8', { fatal: true }).decode(chapterBytesChirho)
			);
			const readingsChirho = chapterChirho.readings_chirho ?? [];
			if (
				!Array.isArray(chapterChirho.clips_chirho) ||
				!Array.isArray(readingsChirho) ||
				chapterChirho.clips_chirho.length + readingsChirho.length > 2000
			)
				throw new RefusalChirho(['audio source clip scope differs']);
			for (const clipChirho of [...chapterChirho.clips_chirho, ...readingsChirho]) {
				if (
					!/^\/audio-chirho\/sha256-chirho\/[a-f0-9]{64}-chirho\.mp3$/u.test(
						clipChirho.asset_path_chirho
					)
				)
					throw new RefusalChirho(['audio source asset path differs']);
				const pathChirho = clipChirho.asset_path_chirho.slice(1);
				if (!filesChirho.has(pathChirho)) pathsChirho.add(pathChirho);
			}
		}
	}
	if (!pathsChirho.size) return 0;
	const rootChirho = await realpathChirho(sourceRootChirho);
	const parentChirho = joinChirho(rootChirho, 'static/audio-chirho/sha256-chirho');
	if ((await realpathChirho(parentChirho).catch(() => null)) !== parentChirho)
		throw new RefusalChirho(['audio source parent is missing or redirected']);
	const sortedChirho = [...pathsChirho].sort();
	const bodiesChirho: Uint8Array[] = new Array(sortedChirho.length);
	let nextChirho = 0;
	let failedChirho = false;
	const outcomesChirho = await Promise.allSettled(
		Array.from({ length: Math.min(4, sortedChirho.length) }, async () => {
			try {
				while (!failedChirho && nextChirho < sortedChirho.length) {
					const indexChirho = nextChirho++;
					const pathChirho = joinChirho(rootChirho, 'static', sortedChirho[indexChirho]);
					const handleChirho = await openChirho(
						pathChirho,
						constantsChirho.O_RDONLY | constantsChirho.O_NOFOLLOW
					);
					try {
						const infoChirho = await handleChirho.stat();
						if (!infoChirho.isFile() || infoChirho.size > 4_000_000)
							throw new RefusalChirho(['audio verification source is linked or oversized']);
						const bytesChirho = Buffer.allocUnsafe(infoChirho.size + 1);
						let offsetChirho = 0;
						while (offsetChirho < bytesChirho.length) {
							const { bytesRead: bytesReadChirho } = await handleChirho.read(
								bytesChirho,
								offsetChirho,
								bytesChirho.length - offsetChirho,
								null
							);
							if (!bytesReadChirho) break;
							offsetChirho += bytesReadChirho;
						}
						if (offsetChirho !== infoChirho.size)
							throw new RefusalChirho(['audio verification source changed during read']);
						bodiesChirho[indexChirho] = bytesChirho.subarray(0, offsetChirho);
					} finally {
						await handleChirho.close();
					}
				}
			} catch (errorChirho) {
				failedChirho = true;
				throw errorChirho;
			}
		})
	);
	const failureChirho = outcomesChirho.find((outcomeChirho) => outcomeChirho.status === 'rejected');
	if (failureChirho) {
		if (failureChirho.reason instanceof RefusalChirho) throw failureChirho.reason;
		throw new RefusalChirho(['audio verification source is missing, linked or unreadable']);
	}
	// Deterministic insertion order; the existing verifier still hashes and checks every MPEG header.
	for (const [indexChirho, pathChirho] of sortedChirho.entries())
		filesChirho.set(pathChirho, bodiesChirho[indexChirho]);
	return sortedChirho.length;
}
