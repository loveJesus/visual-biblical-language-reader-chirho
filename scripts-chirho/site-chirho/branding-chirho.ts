// For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life. — John 3:16 (KJV)
// Workflow: hosting-chirho/public-site-chirho.md. Deterministic brand SVG -> verified private R2.
import {
	readFile as readFileChirho,
	mkdir as mkdirChirho,
	open as openChirho,
	writeFile as writeFileChirho,
	rename as renameChirho,
	unlink as unlinkChirho
} from 'node:fs/promises';
import { join as joinChirho } from 'node:path';
import { spawnSync as spawnSyncChirho } from 'node:child_process';
import { digestChirho, objectRequestChirho } from '../publish-chirho/r2-chirho/object-store-chirho';
import { acquireLockChirho } from '../publish-chirho/r2_upload_watch_chirho';
import { SHARE_IMAGE_PATH_CHIRHO } from '../../src/lib/site-chirho';
import type { MediaFactChirho } from '../../workers-chirho/artwork-chirho/types-chirho';

const SVG_CHIRHO = 'src/lib/site-chirho/assets-chirho/hinneh-share-chirho.svg';
const RECORD_CHIRHO = 'data-chirho/branding-chirho/share-card-chirho.json';
export interface BrandingChirho {
	schema_version_chirho: 1;
	source_sha256_chirho: string;
	asset_path_chirho: string;
	master_chirho: MediaFactChirho;
	delivery_chirho: MediaFactChirho;
	verified_at_chirho: string;
}
export async function readBrandingChirho(rootChirho: string): Promise<BrandingChirho | null> {
	const sourceChirho = await readFileChirho(joinChirho(rootChirho, SVG_CHIRHO)).catch(() => null);
	if (!sourceChirho) return null;
	const bytesChirho = await readFileChirho(joinChirho(rootChirho, RECORD_CHIRHO));
	if (bytesChirho.length > 4096) throw new Error('Branding record exceeds its bound');
	const recordChirho = JSON.parse(bytesChirho.toString()) as BrandingChirho;
	if (
		recordChirho.schema_version_chirho !== 1 ||
		recordChirho.source_sha256_chirho !== digestChirho(sourceChirho) ||
		recordChirho.asset_path_chirho !== SHARE_IMAGE_PATH_CHIRHO ||
		!Number.isFinite(Date.parse(recordChirho.verified_at_chirho))
	)
		throw new Error('Branding source or path changed');
	for (const [factChirho, formatChirho, extensionChirho] of [
		[recordChirho.master_chirho, 'webp', 'webp'],
		[recordChirho.delivery_chirho, 'jpeg', 'jpg']
	] as const) {
		if (
			!factChirho ||
			!/^[a-f0-9]{64}$/.test(factChirho.sha256_chirho) ||
			factChirho.format_chirho !== formatChirho ||
			factChirho.key_chirho !==
				`media-chirho/sha256-chirho/${factChirho.sha256_chirho}.${extensionChirho}` ||
			factChirho.width_chirho !== 1200 ||
			factChirho.height_chirho !== 630 ||
			!Number.isSafeInteger(factChirho.bytes_chirho) ||
			factChirho.bytes_chirho < 1 ||
			factChirho.bytes_chirho > 512000
		)
			throw new Error('Branding media identity refused');
	}
	return recordChirho;
}

export async function prepareBrandingChirho(rootChirho: string, applyChirho: boolean) {
	const sourceChirho = await readFileChirho(joinChirho(rootChirho, SVG_CHIRHO));
	if (!applyChirho)
		return {
			source_sha256_chirho: digestChirho(sourceChirho),
			network_chirho: false,
			asset_path_chirho: SHARE_IMAGE_PATH_CHIRHO
		};
	const directoryChirho = joinChirho(rootChirho, 'build-chirho/site-chirho');
	await mkdirChirho(directoryChirho, { recursive: true });
	const releaseChirho = await acquireLockChirho(
		joinChirho(rootChirho, 'build-chirho/r2-chirho/artwork-archive-chirho.lock')
	);
	try {
		const factsChirho: MediaFactChirho[] = [];
		const pathsChirho: string[] = [];
		for (const [formatChirho, extensionChirho, qualityChirho] of [
			['webp', 'webp', '82'],
			['jpeg', 'jpg', '88']
		] as const) {
			const pathChirho = joinChirho(directoryChirho, `hinneh-share-chirho.${extensionChirho}`);
			const renderedChirho = spawnSyncChirho(
				'magick',
				[
					'MSVG:' + joinChirho(rootChirho, SVG_CHIRHO),
					'-background',
					'#f6f4ed',
					'-alpha',
					'remove',
					'-strip',
					'-quality',
					qualityChirho,
					pathChirho
				],
				{ encoding: 'utf8', timeout: 30000 }
			);
			if (renderedChirho.status !== 0) throw new Error('Branding render failed');
			const dimensionsChirho = spawnSyncChirho(
				'magick',
				['identify', '-format', '%w %h', pathChirho],
				{ encoding: 'utf8', timeout: 10000 }
			);
			if (dimensionsChirho.status !== 0 || dimensionsChirho.stdout !== '1200 630')
				throw new Error('Branding dimensions differ');
			const bytesChirho = await readFileChirho(pathChirho);
			if (
				bytesChirho.length > 512000 ||
				(formatChirho === 'jpeg' && (bytesChirho[0] !== 255 || bytesChirho[1] !== 216))
			)
				throw new Error('Branding encoding refused');
			const shaChirho = digestChirho(bytesChirho),
				keyChirho = `media-chirho/sha256-chirho/${shaChirho}.${extensionChirho}`;
			let remoteChirho = await objectRequestChirho('GET', keyChirho);
			if (remoteChirho.status === 404) {
				const putChirho = await objectRequestChirho('PUT', keyChirho, bytesChirho);
				if (!putChirho.ok) throw new Error(`Brand upload HTTP ${putChirho.status}`);
				remoteChirho = await objectRequestChirho('GET', keyChirho);
			}
			if (!remoteChirho.ok) throw new Error(`Brand readback HTTP ${remoteChirho.status}`);
			const verifiedChirho = new Uint8Array(await remoteChirho.arrayBuffer());
			if (
				verifiedChirho.length !== bytesChirho.length ||
				digestChirho(verifiedChirho) !== shaChirho
			)
				throw new Error('Brand readback differs');
			const factChirho: MediaFactChirho = {
				format_chirho: formatChirho,
				sha256_chirho: shaChirho,
				key_chirho: keyChirho,
				bytes_chirho: bytesChirho.length,
				width_chirho: 1200,
				height_chirho: 630
			};
			const handleChirho = await openChirho(
				joinChirho(rootChirho, 'build-chirho/r2-chirho/artwork-readbacks-chirho.jsonl'),
				'a'
			);
			try {
				await handleChirho.write(
					JSON.stringify({
						...factChirho,
						lossy_chirho: true,
						verified_at_chirho: new Date().toISOString()
					}) + '\n'
				);
				await handleChirho.sync();
			} finally {
				await handleChirho.close();
			}
			factsChirho.push(factChirho);
			pathsChirho.push(pathChirho);
		}
		const recordChirho: BrandingChirho = {
			schema_version_chirho: 1,
			source_sha256_chirho: digestChirho(sourceChirho),
			asset_path_chirho: SHARE_IMAGE_PATH_CHIRHO,
			master_chirho: factsChirho[0],
			delivery_chirho: factsChirho[1],
			verified_at_chirho: new Date().toISOString()
		};
		await mkdirChirho(joinChirho(rootChirho, 'data-chirho/branding-chirho'), { recursive: true });
		const temporaryChirho = joinChirho(rootChirho, RECORD_CHIRHO + '.tmp');
		await writeFileChirho(temporaryChirho, JSON.stringify(recordChirho, null, '\t') + '\n');
		const metadataChirho = await openChirho(temporaryChirho, 'r');
		try {
			await metadataChirho.sync();
		} finally {
			await metadataChirho.close();
		}
		await renameChirho(temporaryChirho, joinChirho(rootChirho, RECORD_CHIRHO));
		await readBrandingChirho(rootChirho);
		// Retire only these temporary renders after both complete readbacks and the recovery record.
		for (const [indexChirho, pathChirho] of pathsChirho.entries()) {
			if (digestChirho(await readFileChirho(pathChirho)) !== factsChirho[indexChirho].sha256_chirho)
				throw new Error('Brand temporary render changed');
			await unlinkChirho(pathChirho);
		}
		return recordChirho;
	} finally {
		await releaseChirho();
	}
}
if (import.meta.main) {
	const argumentsChirho = process.argv.slice(2);
	if (
		argumentsChirho.some(
			(argumentChirho) =>
				!['--apply-chirho', '--confirm-chirho', 'hinneh-media-chirho@84bd'].includes(argumentChirho)
		)
	)
		throw new Error('Unknown branding flag');
	const applyChirho = argumentsChirho.includes('--apply-chirho');
	const confirmationChirho = argumentsChirho.indexOf('--confirm-chirho');
	if (
		applyChirho &&
		(confirmationChirho < 0 ||
			argumentsChirho[confirmationChirho + 1] !== 'hinneh-media-chirho@84bd')
	)
		throw new Error('Brand upload needs exact existing bucket confirmation');
	console.log(JSON.stringify(await prepareBrandingChirho(process.cwd(), applyChirho)));
}
