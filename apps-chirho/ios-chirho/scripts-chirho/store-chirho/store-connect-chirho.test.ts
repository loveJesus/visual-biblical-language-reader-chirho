// For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life. — John 3:16 (KJV)
import { describe, expect, test } from 'bun:test';
import {
	requireDraftChirho,
	validateUploadOperationChirho,
	type UploadOperationChirho
} from './app-store-listing-chirho';
import type { AppleRecordChirho } from './app-store-client-chirho';

describe('Apple operator authority boundaries', () => {
	const appChirho: AppleRecordChirho = {
		id: 'hinneh-chirho',
		type: 'apps',
		attributes: { bundleId: 'us.hinneh.readerchirho' }
	};
	const versionChirho: AppleRecordChirho = {
		id: 'version-chirho',
		type: 'appStoreVersions',
		attributes: { platform: 'IOS', appStoreState: 'PREPARE_FOR_SUBMISSION' }
	};
	test('only the exact Hinneh iOS draft is mutable', () => {
		expect(() => requireDraftChirho(appChirho, versionChirho)).not.toThrow();
		for (const otherChirho of ['us.other.app', 'us.hinneh.readerchirho.evil'])
			expect(() =>
				requireDraftChirho({ ...appChirho, attributes: { bundleId: otherChirho } }, versionChirho)
			).toThrow();
		for (const stateChirho of ['WAITING_FOR_REVIEW', 'READY_FOR_SALE', 'PENDING_DEVELOPER_RELEASE'])
			expect(() =>
				requireDraftChirho(appChirho, {
					...versionChirho,
					attributes: { platform: 'IOS', appStoreState: stateChirho }
				})
			).toThrow();
		expect(() =>
			requireDraftChirho(appChirho, {
				...versionChirho,
				attributes: { platform: 'MAC_OS', appStoreState: 'PREPARE_FOR_SUBMISSION' }
			})
		).toThrow();
	});
	test('uploads stay in Apple storage and within the verified byte window', () => {
		const operationChirho: UploadOperationChirho = {
			method: 'PUT',
			url: 'https://northamerica-1.object-storage.apple.com/upload-chirho?signature_chirho=example',
			offset: 0,
			length: 5,
			requestHeaders: [{ name: 'Content-Type', value: 'image/png' }]
		};
		expect(validateUploadOperationChirho(operationChirho, 5).hostname).toBe(
			'northamerica-1.object-storage.apple.com'
		);
		for (const urlChirho of [
			'https://evil.example/upload',
			'http://northamerica-1.object-storage.apple.com/u',
			'https://a.object-storage.apple.com.evil.example/u',
			'https://user:password@a.object-storage.apple.com/u'
		])
			expect(() =>
				validateUploadOperationChirho({ ...operationChirho, url: urlChirho }, 5)
			).toThrow();
		for (const lengthChirho of [0, 6, 1.5])
			expect(() =>
				validateUploadOperationChirho({ ...operationChirho, length: lengthChirho }, 5)
			).toThrow();
		expect(() => validateUploadOperationChirho({ ...operationChirho, offset: -1 }, 5)).toThrow();
		expect(() =>
			validateUploadOperationChirho({ ...operationChirho, method: 'POST' }, 5)
		).toThrow();
	});
	test('an API authorization token is never forwarded to the upload host', () => {
		const operationChirho: UploadOperationChirho = {
			method: 'PUT',
			url: 'https://store-030.blobstore.apple.com/u',
			offset: 0,
			length: 1,
			requestHeaders: [{ name: 'Authorization', value: 'test-secret-chirho' }]
		};
		expect(() => validateUploadOperationChirho(operationChirho, 1)).toThrow('credential-bearing');
		expect(() =>
			validateUploadOperationChirho(
				{ ...operationChirho, requestHeaders: [{ name: 'Cookie', value: 'test-cookie-chirho' }] },
				1
			)
		).toThrow('credential-bearing');
	});
});
