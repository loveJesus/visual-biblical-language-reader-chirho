// For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life. — John 3:16 (KJV)
// Workflow: media-delivery-chirho.md. Preserve the exact lossy provider original as delivery too.
import { execFile as execFileChirho } from 'node:child_process';
import {
	mkdir as mkdirChirho,
	open as openChirho,
	realpath as realpathChirho,
	rename as renameChirho
} from 'node:fs/promises';
import {
	dirname as dirnameChirho,
	join as joinChirho,
	relative as relativeChirho,
	resolve as resolveChirho
} from 'node:path';
import { randomUUID as randomUUIDChirho } from 'node:crypto';
import { digestChirho, objectRequestChirho } from '../../r2-chirho/object-store-chirho';
import { lossyWebpChirho, type ArtworkEntryChirho } from '../../r2-chirho/archive-artwork-chirho';
import { readWebpChirho } from '../../webp_chirho';
import { readOwnedChirho, STAGE_CHIRHO, type CompletedChirho } from './records-chirho';

export async function atomicJsonChirho(
	rootChirho: string,
	relativePathChirho: string,
	valueChirho: unknown
) {
	const pathChirho = resolveChirho(rootChirho, relativePathChirho);
	if (
		!pathChirho.startsWith(rootChirho + '/') ||
		pathChirho !== joinChirho(rootChirho, relativePathChirho) ||
		!/^(?:build-chirho\/|data-chirho\/(?:media-chirho|delivery-chirho)\/|workspace-chirho\/art-chirho\/remote-archive-chirho\/provider-copies-chirho\/)/u.test(
			relativePathChirho
		)
	)
		throw new Error('Atomic write is outside owned staging/catalogue scope');
	const parentChirho = dirnameChirho(pathChirho);
	let cursorChirho = rootChirho;
	if ((await realpathChirho(rootChirho)) !== rootChirho)
		throw new Error('Workspace root is redirected');
	for (const partChirho of relativeChirho(rootChirho, parentChirho).split('/')) {
		cursorChirho = joinChirho(cursorChirho, partChirho);
		try {
			await mkdirChirho(cursorChirho);
		} catch (errorChirho) {
			if ((errorChirho as NodeJS.ErrnoException).code !== 'EEXIST') throw errorChirho;
		}
		if ((await realpathChirho(cursorChirho)) !== cursorChirho)
			throw new Error('Atomic write parent is redirected');
	}
	const temporaryChirho = joinChirho(parentChirho, `${randomUUIDChirho()}-partial-chirho.json`);
	const fileChirho = await openChirho(temporaryChirho, 'wx', 0o600);
	try {
		await fileChirho.writeFile(JSON.stringify(valueChirho, null, '\t') + '\n');
		await fileChirho.sync();
	} finally {
		await fileChirho.close();
	}
	await renameChirho(temporaryChirho, pathChirho);
	const directoryChirho = await openChirho(parentChirho, 'r');
	try {
		await directoryChirho.sync();
	} finally {
		await directoryChirho.close();
	}
}
const INSPECT_CHIRHO = `import io,json,sys
from PIL import Image
data_chirho=sys.stdin.buffer.read(2097153)
if len(data_chirho)>2097152: raise ValueError('Provider WebP exceeds limit')
with Image.open(io.BytesIO(data_chirho)) as image_chirho:
 if image_chirho.format!='WEBP' or image_chirho.size!=(1024,768) or getattr(image_chirho,'n_frames',1)!=1: raise ValueError('Provider canvas differs')
 image_chirho.load()
 extrema_chirho=image_chirho.convert('RGB').getextrema()
 if max(high_chirho for low_chirho,high_chirho in extrema_chirho)<=8 or all(high_chirho-low_chirho<=8 for low_chirho,high_chirho in extrema_chirho): raise ValueError('Provider blank output refused')
print('ok')
`;
export async function inspectWebpChirho(bytesChirho: Uint8Array) {
	const factsChirho = readWebpChirho(bytesChirho);
	if (
		factsChirho.width_chirho !== 1024 ||
		factsChirho.height_chirho !== 768 ||
		!lossyWebpChirho(bytesChirho)
	)
		throw new Error('Provider delivery is not the expected lossy WebP');
	await new Promise<void>((resolveChirho, rejectChirho) => {
		const childChirho = execFileChirho(
			'python3',
			['-I', '-c', INSPECT_CHIRHO],
			{ timeout: 30000, maxBuffer: 4096 },
			(errorChirho, stdoutChirho) => {
				if (errorChirho || stdoutChirho.trim() !== 'ok')
					rejectChirho(new Error('Provider WebP pixel/decode check failed'));
				else resolveChirho();
			}
		);
		childChirho.stdin!.on('error', () => {
			/* Completion callback owns child errors. */
		});
		childChirho.stdin!.end(bytesChirho);
	});
}
export async function readBodyChirho(responseChirho: Response, expectedChirho: number) {
	if (!responseChirho.ok || !responseChirho.body)
		throw new Error(`R2 exact provider readback refused (${responseChirho.status})`);
	const partsChirho: Uint8Array[] = [];
	const readerChirho = responseChirho.body.getReader();
	let lengthChirho = 0;
	try {
		while (true) {
			const partChirho = await readerChirho.read();
			if (partChirho.done) break;
			lengthChirho += partChirho.value.length;
			if (lengthChirho > expectedChirho) throw new Error('R2 body exceeds bound');
			partsChirho.push(partChirho.value);
		}
	} finally {
		await readerChirho.cancel();
	}
	if (lengthChirho !== expectedChirho) throw new Error('R2 provider length differs');
	return Buffer.concat(partsChirho);
}
export function receiptPathChirho(completedChirho: CompletedChirho) {
	return `${STAGE_CHIRHO}/receipts-chirho/${completedChirho.job_chirho.book_id_chirho.toLowerCase()}-chirho/chapter-${String(completedChirho.job_chirho.chapter_chirho).padStart(3, '0')}-chirho/${completedChirho.job_chirho.job_id_chirho}-chirho.json`;
}
export interface ReceiptChirho {
	schema_version_chirho: 1;
	binding_sha256_chirho: string;
	binding_chirho: CompletedChirho;
	object_chirho: ArtworkEntryChirho['source_chirho'];
	art_review_chirho: 'pending';
}
export interface DependenciesChirho {
	request_chirho: typeof objectRequestChirho;
	inspect_chirho: typeof inspectWebpChirho;
}
const DEFAULT_DEPS_CHIRHO: DependenciesChirho = {
	request_chirho: objectRequestChirho,
	inspect_chirho: inspectWebpChirho
};
export async function archiveCompletedChirho(
	rootChirho: string,
	completedChirho: CompletedChirho,
	applyChirho = false,
	dependenciesChirho = DEFAULT_DEPS_CHIRHO
) {
	const pathChirho = receiptPathChirho(completedChirho),
		resultChirho = completedChirho.result_chirho;
	const priorBytesChirho = await readOwnedChirho(rootChirho, pathChirho, 32 * 1024, true);
	const bindingShaChirho = digestChirho(JSON.stringify(completedChirho));
	const keyChirho = `media-chirho/sha256-chirho/${resultChirho.output_sha256_chirho}.webp`;
	const localChirho = await readOwnedChirho(
		rootChirho,
		completedChirho.job_chirho.output_chirho,
		2 * 1024 ** 2,
		priorBytesChirho !== null
	);
	if (
		localChirho &&
		(digestChirho(localChirho) !== resultChirho.output_sha256_chirho ||
			localChirho.length !== resultChirho.bytes_chirho)
	)
		throw new Error('Provider file differs from original result');
	if (priorBytesChirho) {
		const priorChirho = JSON.parse(priorBytesChirho.toString()) as ReceiptChirho;
		if (
			priorChirho.schema_version_chirho !== 1 ||
			priorChirho.binding_sha256_chirho !== bindingShaChirho ||
			JSON.stringify(priorChirho.binding_chirho) !== JSON.stringify(completedChirho) ||
			priorChirho.art_review_chirho !== 'pending' ||
			priorChirho.object_chirho.key_chirho !== keyChirho ||
			priorChirho.object_chirho.sha256_chirho !== resultChirho.output_sha256_chirho ||
			priorChirho.object_chirho.bytes_chirho !== resultChirho.bytes_chirho ||
			priorChirho.object_chirho.width_chirho !== 1024 ||
			priorChirho.object_chirho.height_chirho !== 768 ||
			priorChirho.object_chirho.lossy_chirho !== true ||
			!Number.isFinite(Date.parse(priorChirho.object_chirho.verified_at_chirho))
		)
			throw new Error('Provider preservation receipt binding differs');
		return { state_chirho: 'already_archived' as const, receipt_chirho: priorChirho };
	}
	if (!localChirho) throw new Error('Provider original is missing before preservation');
	await dependenciesChirho.inspect_chirho(localChirho);
	if (!applyChirho) return { state_chirho: 'would_archive' as const, receipt_chirho: null };
	let responseChirho = await dependenciesChirho.request_chirho('GET', keyChirho);
	if (responseChirho.status === 404) {
		await responseChirho.arrayBuffer();
		const putChirho = await dependenciesChirho.request_chirho('PUT', keyChirho, localChirho);
		await putChirho.arrayBuffer();
		if (!putChirho.ok) throw new Error(`Provider preservation PUT refused (${putChirho.status})`);
		responseChirho = await dependenciesChirho.request_chirho('GET', keyChirho);
	}
	const remoteChirho = await readBodyChirho(responseChirho, resultChirho.bytes_chirho);
	if (digestChirho(remoteChirho) !== resultChirho.output_sha256_chirho)
		throw new Error('Provider preservation readback hash differs');
	const receiptChirho: ReceiptChirho = {
		schema_version_chirho: 1,
		binding_chirho: completedChirho,
		binding_sha256_chirho: bindingShaChirho,
		art_review_chirho: 'pending',
		object_chirho: {
			key_chirho: keyChirho,
			sha256_chirho: resultChirho.output_sha256_chirho,
			bytes_chirho: resultChirho.bytes_chirho,
			width_chirho: 1024,
			height_chirho: 768,
			lossy_chirho: true,
			verified_at_chirho: new Date().toISOString()
		}
	};
	await atomicJsonChirho(rootChirho, pathChirho, receiptChirho);
	return { state_chirho: 'archived' as const, receipt_chirho: receiptChirho };
}
