// For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life. — John 3:16 (KJV)
// Workflow: media-delivery-chirho.md. Isolated provenance only, never a second media installer.
import { execFile as execFileChirho } from 'node:child_process';
import { randomUUID as randomUUIDChirho } from 'node:crypto';
import {
	mkdir as mkdirChirho,
	open as openChirho,
	rename as renameChirho,
	realpath as realpathChirho
} from 'node:fs/promises';
import {
	dirname as dirnameChirho,
	join as joinChirho,
	relative as relativeChirho,
	resolve as resolveChirho
} from 'node:path';
import { digestChirho, objectRequestChirho } from '../r2-chirho/object-store-chirho';
import {
	readBoundedChirho,
	optionalReadChirho,
	recordChirho,
	STAGE_CHIRHO,
	MAX_PNG_BYTES_CHIRHO,
	type CompletedJobChirho
} from './source-chirho';

const DECODE_CHIRHO = `import io, sys
from PIL import Image
data_chirho = sys.stdin.buffer.read(26214401)
if len(data_chirho) > 26214400: raise ValueError('PNG exceeds limit')
with Image.open(io.BytesIO(data_chirho)) as image_chirho:
    if image_chirho.format != 'PNG' or image_chirho.size != (1024, 768) or getattr(image_chirho, 'n_frames', 1) != 1:
        raise ValueError('Unexpected PNG canvas')
    image_chirho.load()
    maximum_chirho = max(high_chirho for low_chirho, high_chirho in image_chirho.convert('RGB').getextrema())
print(maximum_chirho)
`;
export async function inspectPngChirho(bytesChirho: Uint8Array) {
	return new Promise<number>((resolveChirho, rejectChirho) => {
		const childChirho = execFileChirho(
			'python3',
			['-I', '-c', DECODE_CHIRHO],
			{ timeout: 30_000, maxBuffer: 4096 },
			(errorChirho, stdoutChirho) => {
				const maximumChirho = Number(stdoutChirho.trim());
				if (errorChirho || !/^[0-9]{1,3}$/u.test(stdoutChirho.trim()) || maximumChirho > 255)
					rejectChirho(new Error('PNG decode refused'));
				else resolveChirho(maximumChirho);
			}
		);
		childChirho.stdin!.on('error', () => {
			/* Child failure is handled by its callback. */
		});
		childChirho.stdin!.end(bytesChirho);
	});
}
export async function decodePngChirho(bytesChirho: Uint8Array) {
	await inspectPngChirho(bytesChirho);
}
export async function stageDirectoryChirho(rootChirho: string, pathChirho: string) {
	const homeChirho = joinChirho(rootChirho, STAGE_CHIRHO);
	if (
		(await realpathChirho(rootChirho)) !== rootChirho ||
		pathChirho !== resolveChirho(pathChirho) ||
		(resolveChirho(pathChirho) !== homeChirho &&
			!resolveChirho(pathChirho).startsWith(homeChirho + '/'))
	)
		throw new Error('Staging path escapes its fixed home');
	let currentChirho = rootChirho;
	for (const partChirho of relativeChirho(rootChirho, pathChirho).split('/')) {
		currentChirho = joinChirho(currentChirho, partChirho);
		try {
			await mkdirChirho(currentChirho);
		} catch (errorChirho) {
			if ((errorChirho as NodeJS.ErrnoException).code !== 'EEXIST') throw errorChirho;
		}
		if ((await realpathChirho(currentChirho)) !== currentChirho)
			throw new Error('Linked staging folder refused');
	}
}
export async function writeJsonChirho(
	rootChirho: string,
	pathChirho: string,
	valueChirho: unknown
) {
	const parentChirho = dirnameChirho(pathChirho);
	await stageDirectoryChirho(rootChirho, parentChirho);
	const temporaryChirho = joinChirho(parentChirho, `${randomUUIDChirho()}-partial-chirho.json`);
	const fileChirho = await openChirho(temporaryChirho, 'wx', 0o600);
	try {
		await fileChirho.writeFile(JSON.stringify(valueChirho, null, 2) + '\n');
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
async function checkedBodyChirho(responseChirho: Response, expectedChirho: number) {
	if (!responseChirho.ok || !responseChirho.body)
		throw new Error(`Provenance readback refused (${responseChirho.status})`);
	const readerChirho = responseChirho.body.getReader();
	const partsChirho: Uint8Array[] = [];
	let totalChirho = 0;
	try {
		while (true) {
			const partChirho = await readerChirho.read();
			if (partChirho.done) break;
			totalChirho += partChirho.value.length;
			if (totalChirho > expectedChirho)
				throw new Error('Provenance readback exceeds expected length');
			partsChirho.push(partChirho.value);
		}
	} finally {
		await readerChirho.cancel();
	}
	if (totalChirho !== expectedChirho) throw new Error('Provenance readback length differs');
	return Buffer.concat(partsChirho);
}
export interface ArchiveDependenciesChirho {
	request_chirho: typeof objectRequestChirho;
	decode_chirho: typeof decodePngChirho;
}
const DEPS_CHIRHO: ArchiveDependenciesChirho = {
	request_chirho: objectRequestChirho,
	decode_chirho: decodePngChirho
};

/** Receipts are immutable source/job/output bindings, never approval or permission to delete. */
export async function archiveCompletedChirho(
	rootChirho: string,
	completedChirho: CompletedJobChirho,
	applyChirho = false,
	dependenciesChirho = DEPS_CHIRHO
) {
	const jobChirho = completedChirho.job_chirho;
	const bytesChirho = await readBoundedChirho(jobChirho.output_chirho, MAX_PNG_BYTES_CHIRHO);
	if (digestChirho(bytesChirho) !== completedChirho.output_sha256_chirho)
		throw new Error('Completed PNG hash differs from worker result');
	const keyChirho = `provenance-chirho/sha256-chirho/${completedChirho.output_sha256_chirho}.png`;
	const bindingChirho = {
		...completedChirho,
		key_chirho: keyChirho,
		bytes_chirho: bytesChirho.length
	};
	const bindingShaChirho = digestChirho(JSON.stringify(bindingChirho));
	const chapterChirho = jobChirho.verse_id_chirho.split('.')[1].padStart(2, '0');
	const receiptPathChirho = joinChirho(
		rootChirho,
		STAGE_CHIRHO,
		`chapter-${chapterChirho}-chirho/${jobChirho.job_id_chirho}${jobChirho.repair_pass_chirho ? `-r${jobChirho.repair_pass_chirho}` : ''}-chirho.json`
	);
	const priorBytesChirho = await optionalReadChirho(receiptPathChirho, 16 * 1024);
	if (priorBytesChirho) {
		const priorChirho = recordChirho(JSON.parse(priorBytesChirho.toString()));
		if (
			priorChirho.binding_sha256_chirho !== bindingShaChirho ||
			JSON.stringify(priorChirho.binding_chirho) !== JSON.stringify(bindingChirho) ||
			typeof priorChirho.verified_at_chirho !== 'string' ||
			!Number.isFinite(Date.parse(priorChirho.verified_at_chirho)) ||
			priorChirho.width_chirho !== 1024 ||
			priorChirho.height_chirho !== 768 ||
			priorChirho.art_review_chirho !== 'pending'
		)
			throw new Error('Saved provenance binding differs');
		return {
			state_chirho: 'already_archived',
			verse_id_chirho: jobChirho.verse_id_chirho,
			uploaded_chirho: 0
		};
	}
	if (applyChirho) await stageDirectoryChirho(rootChirho, dirnameChirho(receiptPathChirho));
	await dependenciesChirho.decode_chirho(bytesChirho);
	if (!applyChirho)
		return {
			state_chirho: 'would_archive',
			verse_id_chirho: jobChirho.verse_id_chirho,
			uploaded_chirho: 0
		};
	let responseChirho = await dependenciesChirho.request_chirho('GET', keyChirho);
	let uploadedChirho = 0;
	if (responseChirho.status === 404) {
		await responseChirho.body?.cancel();
		const putChirho = await dependenciesChirho.request_chirho('PUT', keyChirho, bytesChirho);
		await putChirho.body?.cancel();
		if (!putChirho.ok) throw new Error(`Provenance PUT refused (${putChirho.status})`);
		uploadedChirho = 1;
		responseChirho = await dependenciesChirho.request_chirho('GET', keyChirho);
	}
	const remoteChirho = await checkedBodyChirho(responseChirho, bytesChirho.length);
	if (digestChirho(remoteChirho) !== completedChirho.output_sha256_chirho)
		throw new Error('Provenance readback hash differs');
	await dependenciesChirho.decode_chirho(remoteChirho);
	await writeJsonChirho(rootChirho, receiptPathChirho, {
		schema_version_chirho: 1,
		binding_chirho: bindingChirho,
		binding_sha256_chirho: bindingShaChirho,
		width_chirho: 1024,
		height_chirho: 768,
		verified_at_chirho: new Date().toISOString(),
		art_review_chirho: 'pending',
		...(completedChirho.pixel_hold_chirho
			? { pixel_hold_chirho: completedChirho.pixel_hold_chirho }
			: {}),
		visual_review_chirho: 'not_performed_user_directed',
		quality_chirho:
			jobChirho.provider_chirho === 'runware'
				? 'runware_schnell_placeholder'
				: 'local_schnell_placeholder',
		local_deletions_chirho: 0
	});
	return {
		state_chirho: 'archived',
		verse_id_chirho: jobChirho.verse_id_chirho,
		uploaded_chirho: uploadedChirho
	};
}
