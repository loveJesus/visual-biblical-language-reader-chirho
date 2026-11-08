// For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life. — John 3:16 (KJV)
import { describe, expect, test } from 'bun:test';
import {
	APP_ID_CHIRHO,
	BASE_VERSION_ID_CHIRHO,
	BUNDLE_ID_CHIRHO,
	argumentsChirho,
	attachChirho,
	listChirho,
	prepareChirho,
	readinessChirho,
	requireBuildChirho,
	submitChirho,
	targetChirho,
	writeChirho,
	type ClientChirho,
	type NotesChirho,
	type OptionsChirho,
	type StoreChirho
} from './app-store-update-chirho';
import type {
	AppleRecordChirho,
	AppleResponseChirho
} from '../store-chirho/app-store-client-chirho';

const notesChirho: NotesChirho = {
	whats_new_chirho: {
		'en-US': 'Verse recordings and videos, with clearer reading controls.',
		'es-ES': 'Grabaciones y videos de versículos, con controles de lectura más claros.'
	},
	review_notes_chirho:
		'This update adds published verse readings and videos. No account is required.'
};
const optionsChirho: OptionsChirho = {
	versionChirho: '0.1.1',
	buildChirho: '3',
	buildIdChirho: 'build-3-chirho',
	applyChirho: true,
	notesChirho
};
const recordChirho = (
	typeChirho: string,
	idChirho: string,
	attributesChirho: Record<string, unknown> = {}
): AppleRecordChirho => ({ type: typeChirho, id: idChirho, attributes: attributesChirho });
const relationChirho = (typeChirho: string, idChirho: string) => ({
	data: { type: typeChirho, id: idChirho }
});
function storeChirho(): StoreChirho & { savedChirho: string[] } {
	const savedChirho: string[] = [];
	return {
		journalChirho: { app_id_chirho: APP_ID_CHIRHO, version_chirho: '0.1.1', operations_chirho: {} },
		savedChirho,
		async saveChirho() {
			savedChirho.push(JSON.stringify(this.journalChirho));
		}
	};
}

class FakeAppleChirho implements ClientChirho {
	appChirho = recordChirho('apps', APP_ID_CHIRHO, { bundleId: BUNDLE_ID_CHIRHO });
	baseChirho = recordChirho('appStoreVersions', BASE_VERSION_ID_CHIRHO, {
		versionString: '0.1',
		platform: 'IOS',
		appStoreState: 'READY_FOR_SALE',
		appVersionState: 'READY_FOR_DISTRIBUTION',
		releaseType: 'AFTER_APPROVAL',
		copyright: '2026 Love Jesus Software'
	});
	versionChirho?: AppleRecordChirho;
	buildChirho: AppleRecordChirho = {
		...recordChirho('builds', 'build-3-chirho', {
			version: '3',
			processingState: 'VALID',
			expired: false,
			buildAudienceType: 'APP_STORE_ELIGIBLE',
			usesNonExemptEncryption: false
		}),
		relationships: {
			app: relationChirho('apps', APP_ID_CHIRHO),
			preReleaseVersion: relationChirho('preReleaseVersions', 'prerelease-chirho')
		}
	};
	prereleaseChirho = recordChirho('preReleaseVersions', 'prerelease-chirho', {
		version: '0.1.1',
		platform: 'IOS'
	});
	baseLocalesChirho = ['en-US', 'es-ES'].map((localeChirho) =>
		recordChirho('appStoreVersionLocalizations', 'base-' + localeChirho, {
			locale: localeChirho,
			description: 'Saved description ' + localeChirho,
			keywords: 'Bible,Hebrew,Greek',
			marketingUrl: 'https://hinneh.us/',
			promotionalText: 'Saved promotion',
			supportUrl: 'https://hinneh.us/contact-chirho/'
		})
	);
	localesChirho: AppleRecordChirho[] = [];
	baseReviewChirho = recordChirho('appStoreReviewDetails', 'base-review-chirho', {
		contactFirstName: 'Test',
		contactLastName: 'Owner',
		contactPhone: '+1-000-000-0000',
		contactEmail: 'private-test-chirho@example.invalid',
		demoAccountRequired: false,
		demoAccountName: null,
		demoAccountPassword: null,
		notes: 'First release notes'
	});
	reviewChirho?: AppleRecordChirho;
	submissionChirho?: AppleRecordChirho;
	itemsChirho: AppleRecordChirho[] = [];
	writesChirho: { method_chirho: string; path_chirho: string; body_chirho: unknown }[] = [];
	loseTypeChirho?: string;
	loseMethodChirho?: 'POST' | 'PATCH';
	inheritChirho = true;
	screenshotStateChirho = 'COMPLETE';
	privacyUrlChirho = 'https://hinneh.us/privacy-chirho/';

	async requestChirho(
		methodChirho: 'GET' | 'POST' | 'PATCH',
		pathChirho: string,
		bodyChirho?: unknown
	): Promise<AppleResponseChirho> {
		const cleanChirho = pathChirho.split('?')[0];
		if (methodChirho === 'GET') {
			if (cleanChirho === '/v1/apps') return { data: [this.appChirho] };
			if (cleanChirho.endsWith('/appStoreVersions'))
				return { data: [this.baseChirho, ...(this.versionChirho ? [this.versionChirho] : [])] };
			if (
				cleanChirho ===
				`/v1/appStoreVersions/${BASE_VERSION_ID_CHIRHO}/appStoreVersionLocalizations`
			)
				return { data: this.baseLocalesChirho };
			if (cleanChirho.endsWith('/appStoreVersionLocalizations'))
				return { data: this.localesChirho };
			if (cleanChirho === `/v1/appStoreVersions/${BASE_VERSION_ID_CHIRHO}/appStoreReviewDetail`)
				return { data: this.baseReviewChirho };
			if (cleanChirho.endsWith('/appStoreReviewDetail')) {
				if (!this.reviewChirho) throw new Error('Apple API GET HTTP 404');
				return { data: this.reviewChirho };
			}
			if (cleanChirho.startsWith('/v1/builds/'))
				return { data: this.buildChirho, included: [this.prereleaseChirho] };
			if (cleanChirho.startsWith('/v1/appStoreVersions/')) return { data: this.versionChirho! };
			if (cleanChirho.endsWith('/appScreenshotSets'))
				return {
					data: [
						recordChirho('appScreenshotSets', 'iphone-' + cleanChirho.split('/')[3], {
							screenshotDisplayType: 'APP_IPHONE_69'
						}),
						recordChirho('appScreenshotSets', 'ipad-' + cleanChirho.split('/')[3], {
							screenshotDisplayType: 'APP_IPAD_PRO_3GEN_129'
						})
					]
				};
			if (cleanChirho.endsWith('/appScreenshots'))
				return {
					data: [
						recordChirho('appScreenshots', 'screen-' + cleanChirho.split('/')[3], {
							assetDeliveryState: { state: this.screenshotStateChirho, errors: [] }
						})
					]
				};
			if (cleanChirho.endsWith('/appInfos'))
				return {
					data: [recordChirho('appInfos', 'info-chirho', { state: 'READY_FOR_DISTRIBUTION' })]
				};
			if (cleanChirho.endsWith('/appInfoLocalizations'))
				return {
					data: ['en-US', 'es-ES'].map((localeChirho) =>
						recordChirho('appInfoLocalizations', 'info-' + localeChirho, {
							locale: localeChirho,
							privacyPolicyUrl: this.privacyUrlChirho
						})
					)
				};
			if (cleanChirho.endsWith('/reviewSubmissions'))
				return { data: this.submissionChirho ? [this.submissionChirho] : [] };
			// Apple's default response omits linkage; the supported include supplies it.
			if (cleanChirho.endsWith('/items'))
				return {
					data: pathChirho.includes('include=appStoreVersion')
						? this.itemsChirho
						: this.itemsChirho.map((itemChirho) => {
								const { relationships: ignoredRelationshipsChirho, ...withoutRelationsChirho } =
									itemChirho;
								void ignoredRelationshipsChirho;
								return withoutRelationsChirho;
							})
				};
			if (cleanChirho.startsWith('/v1/reviewSubmissions/')) return { data: this.submissionChirho! };
			throw new Error('Unexpected read: ' + pathChirho);
		}
		this.writesChirho.push({
			method_chirho: methodChirho,
			path_chirho: pathChirho,
			body_chirho: structuredClone(bodyChirho)
		});
		const dataChirho = (bodyChirho as { data: AppleRecordChirho }).data;
		let resultChirho: AppleRecordChirho;
		if (dataChirho.type === 'appStoreVersions' && methodChirho === 'POST') {
			this.versionChirho = recordChirho(dataChirho.type, 'update-chirho', {
				...dataChirho.attributes,
				appVersionState: 'PREPARE_FOR_SUBMISSION'
			});
			if (this.inheritChirho) {
				this.localesChirho = this.baseLocalesChirho.map((localeChirho) => ({
					...structuredClone(localeChirho),
					id: 'update-' + localeChirho.id
				}));
				this.reviewChirho = {
					...structuredClone(this.baseReviewChirho),
					id: 'update-review-chirho'
				};
			}
			resultChirho = this.versionChirho;
		} else if (dataChirho.type === 'appStoreVersionLocalizations') {
			const foundChirho = this.localesChirho.find(
				(localeChirho) => localeChirho.id === dataChirho.id
			);
			if (foundChirho) {
				Object.assign(foundChirho.attributes!, dataChirho.attributes);
				resultChirho = foundChirho;
			} else {
				resultChirho = {
					...structuredClone(dataChirho),
					id: 'created-' + dataChirho.attributes?.locale
				};
				this.localesChirho.push(resultChirho);
			}
		} else if (dataChirho.type === 'appStoreReviewDetails') {
			if (this.reviewChirho) Object.assign(this.reviewChirho.attributes!, dataChirho.attributes);
			else this.reviewChirho = { ...structuredClone(dataChirho), id: 'created-review-chirho' };
			resultChirho = this.reviewChirho;
		} else if (dataChirho.type === 'appStoreVersions') {
			this.versionChirho!.relationships = structuredClone(dataChirho.relationships);
			resultChirho = this.versionChirho!;
		} else if (dataChirho.type === 'reviewSubmissions' && methodChirho === 'POST') {
			this.submissionChirho = recordChirho(dataChirho.type, 'submission-chirho', {
				platform: 'IOS',
				state: 'READY_FOR_REVIEW'
			});
			resultChirho = this.submissionChirho;
		} else if (dataChirho.type === 'reviewSubmissionItems') {
			resultChirho = {
				...structuredClone(dataChirho),
				id: 'item-chirho',
				attributes: { state: 'READY_FOR_REVIEW' }
			};
			this.itemsChirho.push(resultChirho);
		} else if (dataChirho.type === 'reviewSubmissions') {
			this.submissionChirho!.attributes!.state = 'WAITING_FOR_REVIEW';
			this.versionChirho!.attributes!.appVersionState = 'WAITING_FOR_REVIEW';
			resultChirho = this.submissionChirho!;
		} else throw new Error('Unexpected write: ' + pathChirho);
		if (
			this.loseTypeChirho === dataChirho.type &&
			(!this.loseMethodChirho || this.loseMethodChirho === methodChirho)
		) {
			this.loseTypeChirho = undefined;
			this.loseMethodChirho = undefined;
			throw new Error('Lost response after the provider accepted the write.');
		}
		return { data: structuredClone(resultChirho) };
	}
}

describe('Hinneh next iOS release operator', () => {
	test('argument refusal precedes any credential or API operation', () => {
		for (const argsChirho of [
			[],
			['prepare-chirho'],
			['inspect-chirho', '--version-chirho', '0.1'],
			['prepare-chirho', '--version-chirho', '../../other'],
			['inspect-chirho', '--version-chirho', '0.1.1', '--apply-chirho'],
			['attach-chirho', '--version-chirho', '0.1.1', '--production-chirho']
		])
			expect(() => argumentsChirho(argsChirho)).toThrow();
		expect(
			argumentsChirho(['prepare-chirho', '--version-chirho', '0.1.1']).flagsChirho.has(
				'--apply-chirho'
			)
		).toBe(false);
	});
	test('the exact app/bundle and public predecessor are checked before writes', async () => {
		for (const changeChirho of ['app', 'bundle', 'base', 'released']) {
			const clientChirho = new FakeAppleChirho();
			if (changeChirho === 'app') clientChirho.appChirho.id = 'other-app-chirho';
			if (changeChirho === 'bundle') clientChirho.appChirho.attributes!.bundleId = 'other.bundle';
			if (changeChirho === 'base') clientChirho.baseChirho.id = 'other-version-chirho';
			if (changeChirho === 'released') {
				clientChirho.baseChirho.attributes!.appStoreState = 'PREPARE_FOR_SUBMISSION';
				clientChirho.baseChirho.attributes!.appVersionState = 'PREPARE_FOR_SUBMISSION';
			}
			await expect(prepareChirho(clientChirho, storeChirho(), optionsChirho)).rejects.toThrow();
			expect(clientChirho.writesChirho).toHaveLength(0);
		}
	});
	test('dry preparation has zero provider writes and no journal persistence', async () => {
		const clientChirho = new FakeAppleChirho();
		const journalChirho = storeChirho();
		await prepareChirho(clientChirho, journalChirho, { ...optionsChirho, applyChirho: false });
		expect(clientChirho.writesChirho).toHaveLength(0);
		expect(journalChirho.savedChirho).toHaveLength(0);
	});
	test('preparation preserves release choice, inherited EN/ES metadata and private review contact', async () => {
		const clientChirho = new FakeAppleChirho();
		const journalChirho = storeChirho();
		await prepareChirho(clientChirho, journalChirho, optionsChirho);
		expect(clientChirho.versionChirho?.attributes?.releaseType).toBe('AFTER_APPROVAL');
		expect(clientChirho.baseChirho.attributes?.versionString).toBe('0.1');
		for (const localeChirho of clientChirho.localesChirho) {
			expect(localeChirho.attributes?.description).toBe(
				'Saved description ' + localeChirho.attributes?.locale
			);
			expect(localeChirho.attributes?.whatsNew).toBe(
				notesChirho.whats_new_chirho[localeChirho.attributes?.locale as 'en-US']
			);
		}
		expect(clientChirho.reviewChirho?.attributes?.contactEmail).toBe(
			'private-test-chirho@example.invalid'
		);
		expect(JSON.stringify(journalChirho.journalChirho)).not.toContain('private-test-chirho');
		expect(
			clientChirho.writesChirho
				.map((writeValueChirho) => writeValueChirho.path_chirho)
				.some((pathChirho) =>
					/appInfos|Privacy|ageRating|Availabilit|Prices|trader/iu.test(pathChirho)
				)
		).toBe(false);
		const countChirho = clientChirho.writesChirho.length;
		await prepareChirho(clientChirho, journalChirho, optionsChirho);
		expect(clientChirho.writesChirho).toHaveLength(countChirho);
	});
	test('lost creates reconcile to the same remote resources, without a second POST', async () => {
		for (const resourceChirho of [
			'appStoreVersions',
			'appStoreVersionLocalizations',
			'appStoreReviewDetails'
		]) {
			const clientChirho = new FakeAppleChirho();
			clientChirho.inheritChirho = false;
			clientChirho.loseTypeChirho = resourceChirho;
			const journalChirho = storeChirho();
			await expect(prepareChirho(clientChirho, journalChirho, optionsChirho)).rejects.toThrow(
				'Lost response'
			);
			await prepareChirho(clientChirho, journalChirho, optionsChirho);
			expect(
				clientChirho.writesChirho.filter(
					(writeValueChirho) =>
						writeValueChirho.method_chirho === 'POST' &&
						(writeValueChirho.body_chirho as { data: AppleRecordChirho }).data.type ===
							resourceChirho
				)
			).toHaveLength(resourceChirho === 'appStoreVersionLocalizations' ? 2 : 1);
		}
	});
	test('an unknown result that is not found is retained and never re-POSTed', async () => {
		let callsChirho = 0;
		const journalChirho = storeChirho();
		const clientChirho: ClientChirho = {
			async requestChirho() {
				callsChirho++;
				throw new Error('unknown');
			}
		};
		const runChirho = () =>
			writeChirho(
				clientChirho,
				journalChirho,
				'operation-chirho',
				'POST',
				'/v1/reviewSubmissions',
				{ data: 'test-chirho' },
				async () => undefined
			);
		await expect(runChirho()).rejects.toThrow('unknown');
		expect(
			JSON.parse(journalChirho.savedChirho[0]).operations_chirho['operation-chirho'].state_chirho
		).toBe('started');
		await expect(runChirho()).rejects.toThrow('unresolved');
		expect(callsChirho).toBe(1);
		await expect(
			writeChirho(
				clientChirho,
				journalChirho,
				'operation-chirho',
				'POST',
				'/v1/reviewSubmissions',
				{ data: 'changed-chirho' },
				async () => undefined
			)
		).rejects.toThrow('Changed request');
		expect(callsChirho).toBe(1);
	});
	test('builds must match app, marketing version, build number, eligibility and encryption', async () => {
		for (const changeChirho of [
			'app',
			'version',
			'number',
			'processing',
			'audience',
			'expired',
			'encryption'
		]) {
			const clientChirho = new FakeAppleChirho();
			if (changeChirho === 'app')
				clientChirho.buildChirho.relationships!.app = relationChirho('apps', 'other-app-chirho');
			if (changeChirho === 'version') clientChirho.prereleaseChirho.attributes!.version = '0.1';
			if (changeChirho === 'number') clientChirho.buildChirho.attributes!.version = '2';
			if (changeChirho === 'processing')
				clientChirho.buildChirho.attributes!.processingState = 'PROCESSING';
			if (changeChirho === 'audience')
				clientChirho.buildChirho.attributes!.buildAudienceType = 'INTERNAL_ONLY';
			if (changeChirho === 'expired') clientChirho.buildChirho.attributes!.expired = true;
			if (changeChirho === 'encryption')
				clientChirho.buildChirho.attributes!.usesNonExemptEncryption = true;
			await expect(requireBuildChirho(clientChirho, optionsChirho)).rejects.toThrow(
				'Build app/version'
			);
			expect(clientChirho.writesChirho).toHaveLength(0);
		}
	});
	test('attach preserves another writer attached build and refuses an in-review update', async () => {
		const clientChirho = new FakeAppleChirho();
		const journalChirho = storeChirho();
		await prepareChirho(clientChirho, journalChirho, optionsChirho);
		clientChirho.versionChirho!.relationships = {
			build: relationChirho('builds', 'other-build-chirho')
		};
		const countChirho = clientChirho.writesChirho.length;
		await expect(attachChirho(clientChirho, journalChirho, optionsChirho)).rejects.toThrow(
			'Another build'
		);
		expect(clientChirho.writesChirho).toHaveLength(countChirho);
		clientChirho.versionChirho!.attributes!.appVersionState = 'IN_REVIEW';
		await expect(attachChirho(clientChirho, journalChirho, optionsChirho)).rejects.toThrow(
			'editable'
		);
	});
	test('readiness catches unprocessed images, missing privacy URLs and incomplete review contacts', async () => {
		for (const changeChirho of ['images', 'privacy', 'contact']) {
			const clientChirho = new FakeAppleChirho();
			const journalChirho = storeChirho();
			await prepareChirho(clientChirho, journalChirho, optionsChirho);
			await attachChirho(clientChirho, journalChirho, optionsChirho);
			if (changeChirho === 'images') clientChirho.screenshotStateChirho = 'FAILED';
			if (changeChirho === 'privacy') clientChirho.privacyUrlChirho = '';
			if (changeChirho === 'contact') clientChirho.reviewChirho!.attributes!.contactEmail = '';
			const countChirho = clientChirho.writesChirho.length;
			await expect(submitChirho(clientChirho, journalChirho, optionsChirho)).rejects.toThrow();
			expect(clientChirho.writesChirho).toHaveLength(countChirho);
		}
	});
	test('submit sends the exact version once; dry and accepted replay make zero API writes', async () => {
		const clientChirho = new FakeAppleChirho();
		const journalChirho = storeChirho();
		await prepareChirho(clientChirho, journalChirho, optionsChirho);
		await attachChirho(clientChirho, journalChirho, optionsChirho);
		const countChirho = clientChirho.writesChirho.length;
		await submitChirho(clientChirho, journalChirho, { ...optionsChirho, applyChirho: false });
		expect(clientChirho.writesChirho).toHaveLength(countChirho);
		const resultChirho = await submitChirho(clientChirho, journalChirho, optionsChirho);
		expect(resultChirho.submission_state_chirho).toBe('WAITING_FOR_REVIEW');
		expect(clientChirho.itemsChirho[0].relationships?.appStoreVersion).toEqual(
			relationChirho('appStoreVersions', 'update-chirho')
		);
		expect(clientChirho.writesChirho).toHaveLength(countChirho + 3);
		await submitChirho(clientChirho, journalChirho, optionsChirho);
		expect(clientChirho.writesChirho).toHaveLength(countChirho + 3);
	});
	test('lost review creation, item creation and final submission reconcile without a repeated API write', async () => {
		for (const [resourceChirho, methodChirho] of [
			['reviewSubmissions', 'POST'],
			['reviewSubmissionItems', 'POST'],
			['reviewSubmissions', 'PATCH']
		] as const) {
			const clientChirho = new FakeAppleChirho();
			const journalChirho = storeChirho();
			await prepareChirho(clientChirho, journalChirho, optionsChirho);
			await attachChirho(clientChirho, journalChirho, optionsChirho);
			clientChirho.loseTypeChirho = resourceChirho;
			clientChirho.loseMethodChirho = methodChirho;
			await expect(submitChirho(clientChirho, journalChirho, optionsChirho)).rejects.toThrow(
				'Lost response'
			);
			const resultChirho = await submitChirho(clientChirho, journalChirho, optionsChirho);
			expect(resultChirho.submission_state_chirho).toBe('WAITING_FOR_REVIEW');
			expect(
				clientChirho.writesChirho.filter(
					(writeValueChirho) =>
						writeValueChirho.method_chirho === methodChirho &&
						(writeValueChirho.body_chirho as { data: AppleRecordChirho }).data.type ===
							resourceChirho
				)
			).toHaveLength(1);
			if (methodChirho === 'PATCH')
				expect(
					journalChirho.journalChirho.operations_chirho['submit-review-chirho'].state_chirho
				).toBe('reconciled');
		}
	});
	test('another version in the review queue is never adopted or submitted', async () => {
		const clientChirho = new FakeAppleChirho();
		const journalChirho = storeChirho();
		await prepareChirho(clientChirho, journalChirho, optionsChirho);
		await attachChirho(clientChirho, journalChirho, optionsChirho);
		clientChirho.submissionChirho = recordChirho('reviewSubmissions', 'foreign-submission-chirho', {
			platform: 'IOS',
			state: 'READY_FOR_REVIEW'
		});
		clientChirho.itemsChirho = [
			{
				...recordChirho('reviewSubmissionItems', 'foreign-item-chirho'),
				relationships: {
					appStoreVersion: relationChirho('appStoreVersions', BASE_VERSION_ID_CHIRHO)
				}
			}
		];
		const countChirho = clientChirho.writesChirho.length;
		await expect(submitChirho(clientChirho, journalChirho, optionsChirho)).rejects.toThrow(
			'another product'
		);
		expect(clientChirho.writesChirho).toHaveLength(countChirho);
	});
	test('foreign pagination and cycles are rejected before another fetch', async () => {
		for (const nextChirho of ['https://evil.example/v1/apps', '/v1/apps']) {
			let callsChirho = 0;
			const clientChirho: ClientChirho = {
				async requestChirho() {
					callsChirho++;
					return { data: [], links: { next: nextChirho } };
				}
			};
			await expect(listChirho(clientChirho, '/v1/apps')).rejects.toThrow();
			expect(callsChirho).toBe(1);
		}
	});
	test('readiness exposes presence, never private review values', async () => {
		const clientChirho = new FakeAppleChirho();
		const journalChirho = storeChirho();
		await prepareChirho(clientChirho, journalChirho, optionsChirho);
		await attachChirho(clientChirho, journalChirho, optionsChirho);
		const reportChirho = await readinessChirho(clientChirho, optionsChirho);
		expect(reportChirho.review_contact_present_chirho).toBe(true);
		expect(JSON.stringify(reportChirho)).not.toContain('private-test-chirho');
		expect(JSON.stringify(reportChirho)).not.toContain('+1-000');
		await expect(targetChirho(clientChirho, '0.1')).rejects.toThrow('0.1.x');
	});
});
