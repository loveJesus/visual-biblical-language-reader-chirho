// For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life. — John 3:16 (KJV)
// Workflow: spec-chirho/workflows-chirho/native-chirho/store-connect-chirho.md.
import { readFile as readFileChirho } from 'node:fs/promises';
import { homedir as homedirChirho } from 'node:os';
import { resolve as resolveChirho } from 'node:path';
import { createPrivateKey as createPrivateKeyChirho, sign as signChirho } from 'node:crypto';

export interface AppleRecordChirho {
	id: string;
	type: string;
	attributes?: Record<string, unknown>;
	relationships?: Record<
		string,
		{ data?: { id: string; type: string } | { id: string; type: string }[] | null }
	>;
}
export interface AppleResponseChirho {
	data: AppleRecordChirho | AppleRecordChirho[];
	links?: { next?: string | null };
	included?: AppleRecordChirho[];
}
export function rowsChirho(responseChirho: AppleResponseChirho): AppleRecordChirho[] {
	return Array.isArray(responseChirho.data) ? responseChirho.data : [responseChirho.data];
}
export async function sharedAppleCredentialsChirho(): Promise<{
	keyPathChirho: string;
	keyIdChirho: string;
	issuerIdChirho: string;
}> {
	const textChirho = await readFileChirho(resolveChirho(homedirChirho(), '.env-chirho'), 'utf8');
	const valueChirho = (nameChirho: string): string => {
		const linesChirho = textChirho
			.split(/\r?\n/u)
			.filter((lineChirho) =>
				new RegExp('^\\s*(?:export\\s+)?' + nameChirho + '\\s*=').test(lineChirho)
			);
		const matchChirho = linesChirho.length === 1 ? linesChirho[0].match(/='([^']*)'\s*$/u) : null;
		if (!matchChirho) throw new Error('Missing or duplicate shared Apple setting: ' + nameChirho);
		return matchChirho[1];
	};
	return {
		keyPathChirho: valueChirho('APP_STORE_CONNECT_PRIVATE_KEY_PATH_CHIRHO'),
		keyIdChirho: valueChirho('APP_STORE_CONNECT_KEY_ID_CHIRHO'),
		issuerIdChirho: valueChirho('APP_STORE_CONNECT_ISSUER_ID_CHIRHO')
	};
}

export class AppleClientChirho {
	private constructor(
		private readonly credentialsChirho: Awaited<ReturnType<typeof sharedAppleCredentialsChirho>>,
		private readonly keyChirho: ReturnType<typeof createPrivateKeyChirho>
	) {}
	static async openChirho(): Promise<AppleClientChirho> {
		const credentialsChirho = await sharedAppleCredentialsChirho();
		const keyChirho = createPrivateKeyChirho(await readFileChirho(credentialsChirho.keyPathChirho));
		if (
			keyChirho.asymmetricKeyType !== 'ec' ||
			keyChirho.asymmetricKeyDetails?.namedCurve !== 'prime256v1'
		)
			throw new Error('Apple key must be P-256.');
		return new AppleClientChirho(credentialsChirho, keyChirho);
	}
	async requestChirho(
		methodChirho: 'GET' | 'POST' | 'PATCH',
		pathChirho: string,
		bodyChirho?: unknown
	): Promise<AppleResponseChirho> {
		if (
			!/^\/v[12]\/[A-Za-z][A-Za-z0-9/?.%=&,_\-[\]]*$/u.test(pathChirho) ||
			pathChirho.includes('..')
		)
			throw new Error('Untrusted Apple API path.');
		const nowChirho = Math.floor(Date.now() / 1000);
		const segmentChirho = (valueChirho: unknown): string =>
			Buffer.from(JSON.stringify(valueChirho)).toString('base64url');
		const inputChirho =
			segmentChirho({ alg: 'ES256', kid: this.credentialsChirho.keyIdChirho, typ: 'JWT' }) +
			'.' +
			segmentChirho({
				iss: this.credentialsChirho.issuerIdChirho,
				iat: nowChirho,
				exp: nowChirho + 120,
				aud: 'appstoreconnect-v1'
			});
		const signatureChirho = signChirho('sha256', Buffer.from(inputChirho), {
			key: this.keyChirho,
			dsaEncoding: 'ieee-p1363'
		}).toString('base64url');
		let responseChirho: Response;
		try {
			responseChirho = await fetch('https://api.appstoreconnect.apple.com' + pathChirho, {
				method: methodChirho,
				redirect: 'error',
				headers: {
					Authorization: 'Bearer ' + inputChirho + '.' + signatureChirho,
					'Content-Type': 'application/json'
				},
				...(bodyChirho === undefined ? {} : { body: JSON.stringify(bodyChirho) })
			});
		} catch {
			throw new Error(
				'Apple API transport failed; reconcile remote state before repeating a write.'
			);
		}
		const readerChirho = responseChirho.body?.getReader();
		const chunksChirho: Uint8Array[] = [];
		let lengthChirho = 0;
		if (readerChirho) {
			for (;;) {
				const chunkChirho = await readerChirho.read();
				if (chunkChirho.done) break;
				lengthChirho += chunkChirho.value.byteLength;
				if (lengthChirho > 2 * 1024 * 1024) {
					await readerChirho.cancel();
					throw new Error('Apple response exceeds operator bound.');
				}
				chunksChirho.push(chunkChirho.value);
			}
		}
		const textChirho = Buffer.concat(chunksChirho).toString('utf8');
		const dataChirho = textChirho ? JSON.parse(textChirho) : {};
		if (!responseChirho.ok) {
			const codesChirho = Array.isArray(dataChirho.errors)
				? dataChirho.errors.map(
						(errorChirho: { code?: string; title?: string; detail?: string }) => ({
							code_chirho: errorChirho.code,
							title_chirho: errorChirho.title,
							detail_chirho: errorChirho.detail
						})
					)
				: [];
			throw new Error(
				'Apple API ' +
					methodChirho +
					' ' +
					pathChirho.split('?')[0] +
					' HTTP ' +
					responseChirho.status +
					' ' +
					JSON.stringify(codesChirho)
			);
		}
		return dataChirho as AppleResponseChirho;
	}
}
