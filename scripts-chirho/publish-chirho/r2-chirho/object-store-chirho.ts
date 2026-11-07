// For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life. — John 3:16 (KJV)
// Workflow: media-delivery-chirho.md. Existing owner credentials, one bucket, content addresses only.
import { createHash as createHashChirho, createHmac as createHmacChirho } from 'node:crypto';
const BUCKET_CHIRHO = 'hinneh-media-chirho';
const KEY_CHIRHO =
	/^(?:media-chirho|provenance-chirho)\/sha256-chirho\/[a-f0-9]{64}\.(?:webp|png|jpg|jpeg)$/;
export const digestChirho = (bytesChirho: Uint8Array | string) =>
	createHashChirho('sha256').update(bytesChirho).digest('hex');
const hmacChirho = (keyChirho: Uint8Array | string, valueChirho: string) =>
	createHmacChirho('sha256', keyChirho).update(valueChirho).digest();
export async function objectRequestChirho(
	methodChirho: 'GET' | 'HEAD' | 'PUT',
	keyChirho: string,
	bytesChirho?: Uint8Array,
	queryChirho = ''
): Promise<Response> {
	const accountChirho = process.env.CLOUDFLARE_GLOBAL_API_MAIN_ACCOUNT_ID_CHIRHO ?? '';
	let endpointChirho: URL;
	try {
		endpointChirho = new URL(process.env.LOVEJESUS_R2_ENDPOINT_CHIRHO ?? 'https://invalid.invalid');
	} catch {
		throw new Error('Hinneh object store endpoint invalid');
	}
	const accessChirho = process.env.LOVEJESUS_R2_KEY_CHIRHO,
		secretChirho = process.env.LOVEJESUS_R2_SECRET_CHIRHO;
	if (
		!/^[a-f0-9]{32}$/.test(accountChirho) ||
		!accountChirho.endsWith('84bd') ||
		endpointChirho.origin !== `https://${accountChirho}.r2.cloudflarestorage.com` ||
		endpointChirho.pathname !== '/' ||
		endpointChirho.username ||
		endpointChirho.password ||
		!accessChirho ||
		!secretChirho ||
		!(
			KEY_CHIRHO.test(keyChirho) ||
			(/^video-chirho\/sha256-chirho\/[a-f0-9]{64}\.mp4$/.test(keyChirho) &&
				(methodChirho === 'GET' ||
					(methodChirho === 'PUT' && !!bytesChirho && bytesChirho.length <= 16 * 1024 ** 2))) ||
			(/^audio-chirho\/sha256-chirho\/[a-f0-9]{64}\.mp3$/u.test(keyChirho) &&
				(methodChirho === 'GET' ||
					(methodChirho === 'PUT' && !!bytesChirho && bytesChirho.length <= 4_000_000))) ||
			(/^provenance-audio-chirho\/sha256-chirho\/[a-f0-9]{64}\.(?:mp3|flac|json|jsonl)$/.test(
				keyChirho
			) &&
				(methodChirho === 'GET' ||
					(methodChirho === 'PUT' && !!bytesChirho && bytesChirho.length <= 16 * 1024 ** 2))) ||
			(methodChirho === 'GET' &&
				/^artifact-flags-chirho\/open-chirho\/[a-f0-9]{64}\.json$/.test(keyChirho)) ||
			(methodChirho === 'GET' &&
				keyChirho === '' &&
				queryChirho === 'list-type=2&max-keys=100&prefix=artifact-flags-chirho%2Fopen-chirho%2F')
		)
	)
		throw new Error('Hinneh object store scope refused');
	if (
		methodChirho === 'PUT' &&
		(!bytesChirho || digestChirho(bytesChirho) !== /\/([a-f0-9]{64})\./.exec(keyChirho)?.[1])
	)
		throw new Error('Content-addressed upload bytes differ');
	if (queryChirho && keyChirho !== '') throw new Error('Object query scope refused');
	const pathChirho =
		'/' +
		[BUCKET_CHIRHO, ...keyChirho.split('/')]
			.map((partChirho) => encodeURIComponent(partChirho))
			.join('/');
	for (let attemptChirho = 0; attemptChirho < 4; attemptChirho++) {
		const dateChirho = new Date().toISOString().replace(/[:-]|\.\d{3}/g, '');
		const shortDateChirho = dateChirho.slice(0, 8),
			bodyHashChirho = digestChirho(bytesChirho ?? new Uint8Array());
		const canonicalHeadersChirho = `host:${endpointChirho.host}\nx-amz-content-sha256:${bodyHashChirho}\nx-amz-date:${dateChirho}\n`;
		const signedHeadersChirho = 'host;x-amz-content-sha256;x-amz-date';
		const canonicalChirho = `${methodChirho}\n${pathChirho}\n${queryChirho}\n${canonicalHeadersChirho}\n${signedHeadersChirho}\n${bodyHashChirho}`;
		const scopeChirho = `${shortDateChirho}/auto/s3/aws4_request`;
		const stringChirho = `AWS4-HMAC-SHA256\n${dateChirho}\n${scopeChirho}\n${digestChirho(canonicalChirho)}`;
		const signingChirho = hmacChirho(
			hmacChirho(hmacChirho(hmacChirho('AWS4' + secretChirho, shortDateChirho), 'auto'), 's3'),
			'aws4_request'
		);
		const headersChirho = {
			'x-amz-date': dateChirho,
			'x-amz-content-sha256': bodyHashChirho,
			Authorization: `AWS4-HMAC-SHA256 Credential=${accessChirho}/${scopeChirho}, SignedHeaders=${signedHeadersChirho}, Signature=${hmacChirho(signingChirho, stringChirho).toString('hex')}`
		};
		let responseChirho: Response;
		try {
			responseChirho = await fetch(
				endpointChirho.origin + pathChirho + (queryChirho ? '?' + queryChirho : ''),
				{
					method: methodChirho,
					headers: headersChirho,
					redirect: 'error',
					...(bytesChirho ? { body: new Uint8Array(bytesChirho) } : {}),
					signal: AbortSignal.timeout(60_000)
				}
			);
		} catch {
			if (attemptChirho === 3) throw new Error('Object store network retries exhausted');
			await new Promise((resolveChirho) => setTimeout(resolveChirho, 1000 * 2 ** attemptChirho));
			continue;
		}
		if ((responseChirho.status !== 429 && responseChirho.status < 500) || attemptChirho === 3)
			return responseChirho;
		const retryChirho = Number(responseChirho.headers.get('retry-after'));
		await responseChirho.arrayBuffer();
		if (Number.isFinite(retryChirho) && retryChirho > 30)
			throw new Error('Object store requested a later retry; pass deferred');
		await new Promise((resolveChirho) =>
			setTimeout(
				resolveChirho,
				Number.isFinite(retryChirho) && retryChirho > 0
					? Math.min(30_000, retryChirho * 1000)
					: 1000 * 2 ** attemptChirho
			)
		);
	}
	throw new Error('Object store retry bound reached');
}
