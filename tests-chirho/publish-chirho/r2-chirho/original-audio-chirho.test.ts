// For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life. — John 3:16 (KJV)
import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import {
	objectRequestChirho,
	digestChirho
} from '../../../scripts-chirho/publish-chirho/r2-chirho/object-store-chirho';
const accountChirho = '0'.repeat(28) + '84bd';
beforeEach(() => {
	vi.stubEnv('CLOUDFLARE_GLOBAL_API_MAIN_ACCOUNT_ID_CHIRHO', accountChirho);
	vi.stubEnv('LOVEJESUS_R2_ENDPOINT_CHIRHO', `https://${accountChirho}.r2.cloudflarestorage.com/`);
	vi.stubEnv('LOVEJESUS_R2_KEY_CHIRHO', 'fake-access-chirho');
	vi.stubEnv('LOVEJESUS_R2_SECRET_CHIRHO', 'fake-secret-chirho');
});
afterEach(() => {
	vi.unstubAllEnvs();
	vi.unstubAllGlobals();
});
it('archives only content-addressed audio evidence in the existing private bucket', async () => {
	const bytesChirho = new Uint8Array([1, 2, 3]);
	const fetchChirho = vi.fn<typeof fetch>(async () => new Response(bytesChirho));
	vi.stubGlobal('fetch', fetchChirho);
	for (const extensionChirho of ['mp3', 'flac', 'json', 'jsonl']) {
		const keyChirho = `provenance-audio-chirho/sha256-chirho/${digestChirho(bytesChirho)}.${extensionChirho}`;
		expect((await objectRequestChirho('PUT', keyChirho, bytesChirho)).ok).toBe(true);
		expect((await objectRequestChirho('GET', keyChirho)).ok).toBe(true);
	}
	for (const callChirho of fetchChirho.mock.calls)
		expect(String(callChirho[0])).toContain(
			`/hinneh-media-chirho/provenance-audio-chirho/sha256-chirho/`
		);
	const deliveryKeyChirho = `audio-chirho/sha256-chirho/${digestChirho(bytesChirho)}.mp3`;
	expect((await objectRequestChirho('PUT', deliveryKeyChirho, bytesChirho)).ok).toBe(true);
});
it('rejects foreign keys, changed bytes and oversized originals before any network call', async () => {
	const fetchChirho = vi.fn();
	vi.stubGlobal('fetch', fetchChirho);
	const bytesChirho = new Uint8Array([1, 2, 3]),
		hashChirho = digestChirho(bytesChirho);
	for (const keyChirho of [
		`audio-chirho/private-chirho/${hashChirho}.flac`,
		`provenance-audio-chirho/sha256-chirho/../${hashChirho}.mp3`,
		`provenance-audio-chirho/sha256-chirho/${hashChirho}.exe`
	])
		await expect(objectRequestChirho('PUT', keyChirho, bytesChirho)).rejects.toThrow(/scope/);
	await expect(
		objectRequestChirho(
			'PUT',
			`provenance-audio-chirho/sha256-chirho/${'0'.repeat(64)}.flac`,
			bytesChirho
		)
	).rejects.toThrow(/bytes differ/);
	await expect(
		objectRequestChirho(
			'PUT',
			`provenance-audio-chirho/sha256-chirho/${hashChirho}.flac`,
			new Uint8Array(16 * 1024 ** 2 + 1)
		)
	).rejects.toThrow(/scope/);
	await expect(
		objectRequestChirho(
			'PUT',
			`audio-chirho/sha256-chirho/${hashChirho}.mp3`,
			new Uint8Array(4_000_001)
		)
	).rejects.toThrow(/scope/);
	expect(fetchChirho).not.toHaveBeenCalled();
});
