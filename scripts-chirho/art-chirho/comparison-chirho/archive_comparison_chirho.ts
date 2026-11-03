// For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life. — John 3:16 (KJV)
// Workflow: selective-scene-variants-chirho.md. Archive all comparison evidence, including withheld art.
import { readFile as readFileChirho } from 'node:fs/promises';
import { join as joinChirho } from 'node:path';
import { COMPARISON_HOME_CHIRHO, type SceneReceiptChirho } from './run_comparison_chirho';
import {
	acquireLockChirho,
	uploadWithRetryChirho,
	runPoolChirho
} from '../../publish-chirho/r2_upload_watch_chirho';
import { sha256Chirho, writeChirho } from '../../audio-chirho/audition_chirho';

export async function archiveComparisonChirho(rootChirho: string, applyChirho = false) {
	const homeChirho = joinChirho(rootChirho, COMPARISON_HOME_CHIRHO);
	const rowsChirho = JSON.parse(
		await readFileChirho(joinChirho(homeChirho, 'receipts-chirho.json'), 'utf8')
	) as SceneReceiptChirho[];
	const objectsChirho = new Map<string, Uint8Array<ArrayBuffer>>();
	for (const rowChirho of rowsChirho) {
		if (rowChirho.state_chirho !== 'received' || !rowChirho.asset_file_chirho)
			throw new Error('Comparison archive is incomplete');
		for (const [nameChirho, hashChirho] of [
			[rowChirho.asset_file_chirho, rowChirho.sha256_chirho],
			[
				rowChirho.asset_file_chirho.replace('-chirho.webp', '-original-chirho.webp'),
				rowChirho.original_sha256_chirho
			]
		]) {
			if (
				!nameChirho ||
				!/^verse-\d{3}-(?:original-)?chirho\.webp$/u.test(nameChirho) ||
				!hashChirho ||
				!/^[a-f0-9]{64}$/u.test(hashChirho)
			)
				throw new Error('Archive identity refused');
			const bytesChirho = new Uint8Array(await readFileChirho(joinChirho(homeChirho, nameChirho)));
			if (sha256Chirho(bytesChirho) !== hashChirho)
				throw new Error('Comparison archive bytes changed');
			objectsChirho.set(hashChirho, bytesChirho);
		}
	}
	if (!applyChirho)
		return {
			objects_chirho: objectsChirho.size,
			bytes_chirho: [...objectsChirho.values()].reduce(
				(sumChirho, bytesChirho) => sumChirho + bytesChirho.length,
				0
			)
		};
	const accountChirho = process.env.CLOUDFLARE_GLOBAL_API_MAIN_ACCOUNT_ID_CHIRHO ?? '';
	if (
		!/^[a-f0-9]{32}$/u.test(accountChirho) ||
		!accountChirho.endsWith('84bd') ||
		!process.env.CLOUDFLARE_GLOBAL_API_EMAIL_CHIRHO ||
		!process.env.CLOUDFLARE_GLOBAL_API_KEY_CHIRHO
	)
		throw new Error('Existing Hinneh R2 account unavailable');
	const targetChirho = {
		account_chirho: accountChirho,
		bucket_chirho: 'hinneh-media-chirho',
		email_chirho: process.env.CLOUDFLARE_GLOBAL_API_EMAIL_CHIRHO,
		api_key_chirho: process.env.CLOUDFLARE_GLOBAL_API_KEY_CHIRHO
	};
	const releaseChirho = await acquireLockChirho(joinChirho(homeChirho, 'archive-chirho.lock'));
	try {
		const pathChirho = joinChirho(homeChirho, 'r2-readbacks-chirho.json');
		const receiptsChirho: {
			sha256_chirho: string;
			bytes_chirho: number;
			readback_sha256_chirho: string;
		}[] = await readFileChirho(pathChirho, 'utf8').then(
			(valueChirho) =>
				JSON.parse(valueChirho) as {
					sha256_chirho: string;
					bytes_chirho: number;
					readback_sha256_chirho: string;
				}[],
			(errorChirho: NodeJS.ErrnoException) => {
				if (errorChirho.code === 'ENOENT') return [];
				throw errorChirho;
			}
		);
		const pendingChirho = [...objectsChirho].filter(
			([hashChirho, bytesChirho]) =>
				!receiptsChirho.some(
					(rowChirho) =>
						rowChirho.sha256_chirho === hashChirho &&
						rowChirho.readback_sha256_chirho === hashChirho &&
						rowChirho.bytes_chirho === bytesChirho.length
				)
		);
		for (let indexChirho = 0; indexChirho < pendingChirho.length; indexChirho += 3) {
			await runPoolChirho(
				pendingChirho.slice(indexChirho, indexChirho + 3),
				3,
				async ([hashChirho, bytesChirho]) => {
					const keyChirho = `media-chirho/sha256-chirho/${hashChirho}.webp`;
					await uploadWithRetryChirho(targetChirho, keyChirho, bytesChirho, {
						fetch_chirho: fetch,
						sleep_chirho: (msChirho) =>
							new Promise((resolveChirho) => setTimeout(resolveChirho, msChirho)),
						log_chirho: console.log,
						now_chirho: () => new Date()
					});
					const responseChirho = await fetch(
						`https://api.cloudflare.com/client/v4/accounts/${accountChirho}/r2/buckets/hinneh-media-chirho/objects/${keyChirho}`,
						{
							headers: {
								'X-Auth-Email': targetChirho.email_chirho,
								'X-Auth-Key': targetChirho.api_key_chirho
							},
							signal: AbortSignal.timeout(30000),
							redirect: 'error'
						}
					);
					const returnedChirho = await responseChirho.arrayBuffer();
					if (
						!responseChirho.ok ||
						sha256Chirho(new Uint8Array(returnedChirho)) !== hashChirho ||
						returnedChirho.byteLength !== bytesChirho.length
					)
						throw new Error('Comparison R2 readback differs');
					receiptsChirho.push({
						sha256_chirho: hashChirho,
						bytes_chirho: bytesChirho.length,
						readback_sha256_chirho: hashChirho
					});
				}
			);
			await writeChirho(pathChirho, JSON.stringify(receiptsChirho, null, 2) + '\n');
		}
		return {
			objects_chirho: objectsChirho.size,
			verified_r2_readbacks_chirho: receiptsChirho.length
		};
	} finally {
		await releaseChirho();
	}
}
if (import.meta.main) {
	const argsChirho = process.argv.slice(2);
	if (argsChirho.some((valueChirho) => valueChirho !== '--apply-chirho'))
		throw new Error('Unsupported comparison archive argument');
	console.log(
		JSON.stringify(
			await archiveComparisonChirho(process.cwd(), argsChirho.includes('--apply-chirho'))
		)
	);
}
