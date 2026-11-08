// For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life. — John 3:16 (KJV)
// Workflow: README-chirho.md. This operator changes only Hinneh's next iOS version.
import {
	mkdir as mkdirChirho,
	open as openChirho,
	readFile as readFileChirho,
	rename as renameChirho,
	rm as rmChirho,
	stat as statChirho
} from 'node:fs/promises';
import { createHash as createHashChirho, randomUUID as randomUUIDChirho } from 'node:crypto';
import { homedir as homedirChirho } from 'node:os';
import { resolve as resolveChirho } from 'node:path';
import { pathToFileURL as pathToFileURLChirho } from 'node:url';
import type {
	AppleRecordChirho,
	AppleResponseChirho
} from '../store-chirho/app-store-client-chirho';

export const APP_ID_CHIRHO = '6830790082';
export const BUNDLE_ID_CHIRHO = 'us.hinneh.readerchirho';
export const BASE_VERSION_ID_CHIRHO = '459b634c-2aaf-46b8-a1fa-75f921c37367';
const LOCALES_CHIRHO = ['en-US', 'es-ES'] as const;
const EDITABLE_STATES_CHIRHO = ['PREPARE_FOR_SUBMISSION', 'READY_FOR_REVIEW'];
const SUBMITTED_STATES_CHIRHO = ['WAITING_FOR_REVIEW', 'IN_REVIEW', 'COMPLETING', 'COMPLETE'];
const METADATA_FIELDS_CHIRHO = [
	'description',
	'keywords',
	'marketingUrl',
	'promotionalText',
	'supportUrl'
] as const;

export interface ClientChirho {
	requestChirho(
		methodChirho: 'GET' | 'POST' | 'PATCH',
		pathChirho: string,
		bodyChirho?: unknown
	): Promise<AppleResponseChirho>;
}
export interface NotesChirho {
	whats_new_chirho: Record<(typeof LOCALES_CHIRHO)[number], string>;
	review_notes_chirho: string;
}
export interface TargetChirho {
	appChirho: AppleRecordChirho;
	baseChirho: AppleRecordChirho;
	versionChirho?: AppleRecordChirho;
}
export interface OptionsChirho {
	versionChirho: string;
	buildChirho?: string;
	buildIdChirho?: string;
	applyChirho: boolean;
	notesChirho?: NotesChirho;
}
export interface OperationChirho {
	request_sha256_chirho: string;
	method_chirho: 'POST' | 'PATCH';
	state_chirho: 'started' | 'received' | 'reconciled';
	resource_id_chirho?: string;
}
export interface JournalChirho {
	app_id_chirho: string;
	version_chirho: string;
	operations_chirho: Record<string, OperationChirho>;
}
export interface StoreChirho {
	journalChirho: JournalChirho;
	saveChirho(): Promise<void>;
}

const rowsChirho = (responseChirho: AppleResponseChirho): AppleRecordChirho[] =>
	Array.isArray(responseChirho.data) ? responseChirho.data : [responseChirho.data];
const relationChirho = (typeChirho: string, idChirho: string) => ({
	data: { type: typeChirho, id: idChirho }
});
const relationIdChirho = (recordChirho: AppleRecordChirho, nameChirho: string): string | null => {
	const valueChirho = recordChirho.relationships?.[nameChirho]?.data;
	return valueChirho && !Array.isArray(valueChirho) ? valueChirho.id : null;
};
const digestChirho = (valueChirho: unknown): string =>
	createHashChirho('sha256').update(JSON.stringify(valueChirho)).digest('hex');
const oneChirho = (recordsChirho: AppleRecordChirho[], labelChirho: string): AppleRecordChirho => {
	if (recordsChirho.length !== 1 || !recordsChirho[0]?.id)
		throw new Error('Expected exactly one ' + labelChirho + '.');
	return recordsChirho[0];
};

/** Pagination stays at Apple's API origin, within ten pages and 2,000 records. */
export async function listChirho(
	clientChirho: ClientChirho,
	initialPathChirho: string
): Promise<AppleRecordChirho[]> {
	const recordsChirho: AppleRecordChirho[] = [];
	const visitedChirho = new Set<string>();
	let pathChirho: string | null = initialPathChirho;
	while (pathChirho) {
		if (visitedChirho.has(pathChirho) || visitedChirho.size >= 10)
			throw new Error('Apple pagination exceeds the finite operator bound.');
		visitedChirho.add(pathChirho);
		const responseChirho = await clientChirho.requestChirho('GET', pathChirho);
		recordsChirho.push(...rowsChirho(responseChirho));
		if (recordsChirho.length > 2000) throw new Error('Too many Apple records.');
		const nextChirho = responseChirho.links?.next;
		if (!nextChirho) pathChirho = null;
		else {
			const urlChirho = new URL(nextChirho, 'https://api.appstoreconnect.apple.com');
			if (
				urlChirho.origin !== 'https://api.appstoreconnect.apple.com' ||
				urlChirho.username ||
				urlChirho.password ||
				urlChirho.hash
			)
				throw new Error('Foreign Apple pagination link.');
			pathChirho = urlChirho.pathname + urlChirho.search;
		}
	}
	return recordsChirho;
}

export function requireNotesChirho(valueChirho: unknown): NotesChirho {
	if (!valueChirho || typeof valueChirho !== 'object' || Array.isArray(valueChirho))
		throw new Error('Expected localized release notes.');
	const notesChirho = valueChirho as Partial<NotesChirho>;
	if (
		Object.keys(notesChirho).sort().join(',') !== 'review_notes_chirho,whats_new_chirho' ||
		!notesChirho.whats_new_chirho ||
		Object.keys(notesChirho.whats_new_chirho).sort().join(',') !== 'en-US,es-ES' ||
		LOCALES_CHIRHO.some((localeChirho) => {
			const textChirho = notesChirho.whats_new_chirho?.[localeChirho];
			return typeof textChirho !== 'string' || !textChirho.trim() || textChirho.length > 4000;
		}) ||
		typeof notesChirho.review_notes_chirho !== 'string' ||
		!notesChirho.review_notes_chirho.trim() ||
		notesChirho.review_notes_chirho.length > 4000
	)
		throw new Error('Release notes require EN/ES whats-new text and bounded review notes.');
	return notesChirho as NotesChirho;
}

/** Fixed app/bundle and public predecessor prevent adopting another app or editing version 0.1. */
export async function targetChirho(
	clientChirho: ClientChirho,
	versionChirho: string
): Promise<TargetChirho> {
	if (!/^0\.1\.[1-9][0-9]*$/u.test(versionChirho))
		throw new Error('This next-update operator requires a 0.1.x update after version 0.1.');
	const appChirho = oneChirho(
		await listChirho(clientChirho, '/v1/apps?filter[bundleId]=' + BUNDLE_ID_CHIRHO + '&limit=200'),
		'Hinneh app'
	);
	if (appChirho.id !== APP_ID_CHIRHO || appChirho.attributes?.bundleId !== BUNDLE_ID_CHIRHO)
		throw new Error('Different Apple app or bundle; no writes allowed.');
	const versionsChirho = (
		await listChirho(clientChirho, `/v1/apps/${APP_ID_CHIRHO}/appStoreVersions?limit=200`)
	).filter((recordChirho) => recordChirho.attributes?.platform === 'IOS');
	const baseChirho = oneChirho(
		versionsChirho.filter(
			(recordChirho) =>
				recordChirho.id === BASE_VERSION_ID_CHIRHO &&
				recordChirho.attributes?.versionString === '0.1'
		),
		'published predecessor'
	);
	if (
		baseChirho.attributes?.appVersionState !== 'READY_FOR_DISTRIBUTION' &&
		baseChirho.attributes?.appStoreState !== 'READY_FOR_SALE'
	)
		throw new Error('The expected predecessor is not publicly distributed.');
	if (!['AFTER_APPROVAL', 'MANUAL'].includes(String(baseChirho.attributes?.releaseType)))
		throw new Error('Scheduled or unknown release choice requires an explicit dated plan.');
	const candidatesChirho = versionsChirho.filter(
		(recordChirho) => recordChirho.attributes?.versionString === versionChirho
	);
	if (candidatesChirho.length > 1) throw new Error('Ambiguous next version.');
	const foreignDraftChirho = versionsChirho.some(
		(recordChirho) =>
			recordChirho.id !== BASE_VERSION_ID_CHIRHO &&
			!candidatesChirho.includes(recordChirho) &&
			!['READY_FOR_SALE', 'REPLACED_WITH_NEW_VERSION'].includes(
				String(recordChirho.attributes?.appStoreState)
			)
	);
	if (foreignDraftChirho) throw new Error('A different iOS update is active; reconcile it first.');
	return { appChirho, baseChirho, versionChirho: candidatesChirho[0] };
}

function editableChirho(versionChirho: AppleRecordChirho): void {
	const stateChirho = String(
		versionChirho.attributes?.appVersionState ?? versionChirho.attributes?.appStoreState
	);
	if (!EDITABLE_STATES_CHIRHO.includes(stateChirho))
		throw new Error('The exact update is not an editable draft.');
}

/** Persist intent before sending. Unknown outcomes can only be reconciled by matching GETs. */
export async function writeChirho(
	clientChirho: ClientChirho,
	storeChirho: StoreChirho,
	keyChirho: string,
	methodChirho: 'POST' | 'PATCH',
	pathChirho: string,
	bodyChirho: unknown,
	reconcileChirho: () => Promise<AppleRecordChirho | undefined>
): Promise<AppleRecordChirho> {
	const requestShaChirho = digestChirho({ methodChirho, pathChirho, bodyChirho });
	const priorChirho = storeChirho.journalChirho.operations_chirho[keyChirho];
	if (priorChirho && priorChirho.request_sha256_chirho !== requestShaChirho)
		throw new Error('Changed request conflicts with its retained Apple operation: ' + keyChirho);
	const foundChirho = await reconcileChirho();
	if (foundChirho) {
		if (priorChirho?.resource_id_chirho && priorChirho.resource_id_chirho !== foundChirho.id)
			throw new Error('Apple resource identity changed since its receipt.');
		storeChirho.journalChirho.operations_chirho[keyChirho] = {
			request_sha256_chirho: requestShaChirho,
			method_chirho: methodChirho,
			state_chirho: 'reconciled',
			resource_id_chirho: foundChirho.id
		};
		await storeChirho.saveChirho();
		return foundChirho;
	}
	if (priorChirho)
		throw new Error('Retained Apple outcome is unresolved; no repeat write: ' + keyChirho);
	storeChirho.journalChirho.operations_chirho[keyChirho] = {
		request_sha256_chirho: requestShaChirho,
		method_chirho: methodChirho,
		state_chirho: 'started'
	};
	await storeChirho.saveChirho();
	const receivedChirho = oneChirho(
		rowsChirho(await clientChirho.requestChirho(methodChirho, pathChirho, bodyChirho)),
		'Apple write response'
	);
	storeChirho.journalChirho.operations_chirho[keyChirho] = {
		request_sha256_chirho: requestShaChirho,
		method_chirho: methodChirho,
		state_chirho: 'received',
		resource_id_chirho: receivedChirho.id
	};
	await storeChirho.saveChirho();
	const checkedChirho = await reconcileChirho();
	if (!checkedChirho || checkedChirho.id !== receivedChirho.id)
		throw new Error('Apple write readback is not settled; retain the receipt and reconcile.');
	return checkedChirho;
}

const localesChirho = (clientChirho: ClientChirho, versionChirho: AppleRecordChirho) =>
	listChirho(
		clientChirho,
		`/v1/appStoreVersions/${versionChirho.id}/appStoreVersionLocalizations?limit=200`
	);

async function reviewDetailChirho(clientChirho: ClientChirho, versionChirho: AppleRecordChirho) {
	try {
		return oneChirho(
			rowsChirho(
				await clientChirho.requestChirho(
					'GET',
					`/v1/appStoreVersions/${versionChirho.id}/appStoreReviewDetail`
				)
			),
			'App Review detail'
		);
	} catch (errorChirho) {
		if (errorChirho instanceof Error && /HTTP 404\b/u.test(errorChirho.message)) return undefined;
		throw errorChirho;
	}
}

export async function prepareChirho(
	clientChirho: ClientChirho,
	storeChirho: StoreChirho,
	optionsChirho: OptionsChirho
): Promise<AppleRecordChirho> {
	const targetValueChirho = await targetChirho(clientChirho, optionsChirho.versionChirho);
	const notesChirho = requireNotesChirho(optionsChirho.notesChirho);
	const baseLocalesChirho = await localesChirho(clientChirho, targetValueChirho.baseChirho);
	for (const localeChirho of LOCALES_CHIRHO)
		oneChirho(
			baseLocalesChirho.filter((recordChirho) => recordChirho.attributes?.locale === localeChirho),
			'published ' + localeChirho + ' localization'
		);
	const baseReviewChirho = await reviewDetailChirho(clientChirho, targetValueChirho.baseChirho);
	if (!baseReviewChirho)
		throw new Error('Published review details are unavailable; cannot copy owner facts.');
	if (
		baseReviewChirho.attributes?.demoAccountRequired !== false ||
		['contactFirstName', 'contactLastName', 'contactPhone', 'contactEmail'].some(
			(fieldChirho) =>
				typeof baseReviewChirho.attributes?.[fieldChirho] !== 'string' ||
				!String(baseReviewChirho.attributes?.[fieldChirho]).trim()
		)
	)
		throw new Error(
			'The predecessor lacks the expected private review contact and no-login declaration.'
		);
	if (!optionsChirho.applyChirho)
		return targetValueChirho.versionChirho ?? targetValueChirho.baseChirho;
	const releaseTypeChirho = targetValueChirho.baseChirho.attributes?.releaseType;
	const bodyChirho = {
		data: {
			type: 'appStoreVersions',
			attributes: {
				versionString: optionsChirho.versionChirho,
				platform: 'IOS',
				releaseType: releaseTypeChirho,
				copyright: targetValueChirho.baseChirho.attributes?.copyright ?? null
			},
			relationships: { app: relationChirho('apps', APP_ID_CHIRHO) }
		}
	};
	const versionChirho = await writeChirho(
		clientChirho,
		storeChirho,
		'create-version-chirho',
		'POST',
		'/v1/appStoreVersions',
		bodyChirho,
		async () => {
			const currentChirho = (await targetChirho(clientChirho, optionsChirho.versionChirho))
				.versionChirho;
			if (currentChirho && currentChirho.attributes?.releaseType !== releaseTypeChirho)
				throw new Error('Owner release choice differs; preserve it and reconcile the plan.');
			return currentChirho;
		}
	);
	editableChirho(versionChirho);
	for (const localeChirho of LOCALES_CHIRHO) {
		const existingChirho = (await localesChirho(clientChirho, versionChirho)).find(
			(recordChirho) => recordChirho.attributes?.locale === localeChirho
		);
		const sourceChirho = oneChirho(
			baseLocalesChirho.filter((recordChirho) => recordChirho.attributes?.locale === localeChirho),
			'published localization'
		);
		const localeKeyChirho = 'localization-' + localeChirho;
		const creatingChirho =
			!existingChirho ||
			storeChirho.journalChirho.operations_chirho[localeKeyChirho]?.method_chirho === 'POST';
		// Apple inherits metadata. Keep a concurrently edited nonempty field instead of rolling it back.
		const attributesChirho: Record<string, unknown> = Object.fromEntries(
			METADATA_FIELDS_CHIRHO.map((fieldChirho) => [
				fieldChirho,
				(creatingChirho ? undefined : existingChirho?.attributes?.[fieldChirho]) ??
					sourceChirho.attributes?.[fieldChirho] ??
					null
			])
		);
		attributesChirho.whatsNew = notesChirho.whats_new_chirho[localeChirho];
		const localBodyChirho = {
			data: {
				type: 'appStoreVersionLocalizations',
				...(!creatingChirho ? { id: existingChirho!.id } : {}),
				attributes: { ...attributesChirho, ...(creatingChirho ? { locale: localeChirho } : {}) },
				...(creatingChirho
					? {
							relationships: {
								appStoreVersion: relationChirho('appStoreVersions', versionChirho.id)
							}
						}
					: {})
			}
		};
		await writeChirho(
			clientChirho,
			storeChirho,
			localeKeyChirho,
			creatingChirho ? 'POST' : 'PATCH',
			'/v1/appStoreVersionLocalizations' + (!creatingChirho ? '/' + existingChirho!.id : ''),
			localBodyChirho,
			async () =>
				(await localesChirho(clientChirho, versionChirho)).find(
					(recordChirho) =>
						recordChirho.attributes?.locale === localeChirho &&
						Object.entries(attributesChirho).every(
							([fieldChirho, valueChirho]) => recordChirho.attributes?.[fieldChirho] === valueChirho
						)
				)
		);
	}
	const reviewChirho = await reviewDetailChirho(clientChirho, versionChirho);
	const creatingReviewChirho =
		!reviewChirho ||
		storeChirho.journalChirho.operations_chirho['review-detail-chirho']?.method_chirho === 'POST';
	const reviewAttributesChirho = !creatingReviewChirho
		? { notes: notesChirho.review_notes_chirho }
		: {
				...Object.fromEntries(
					[
						'contactFirstName',
						'contactLastName',
						'contactPhone',
						'contactEmail',
						'demoAccountName',
						'demoAccountPassword',
						'demoAccountRequired'
					].map((fieldChirho) => [fieldChirho, baseReviewChirho.attributes?.[fieldChirho] ?? null])
				),
				notes: notesChirho.review_notes_chirho
			};
	await writeChirho(
		clientChirho,
		storeChirho,
		'review-detail-chirho',
		creatingReviewChirho ? 'POST' : 'PATCH',
		'/v1/appStoreReviewDetails' + (!creatingReviewChirho ? '/' + reviewChirho!.id : ''),
		{
			data: {
				type: 'appStoreReviewDetails',
				...(!creatingReviewChirho ? { id: reviewChirho!.id } : {}),
				attributes: reviewAttributesChirho,
				...(creatingReviewChirho
					? {
							relationships: {
								appStoreVersion: relationChirho('appStoreVersions', versionChirho.id)
							}
						}
					: {})
			}
		},
		async () => {
			const currentChirho = await reviewDetailChirho(clientChirho, versionChirho);
			return currentChirho &&
				Object.entries(reviewAttributesChirho).every(
					([fieldChirho, valueChirho]) => currentChirho.attributes?.[fieldChirho] === valueChirho
				)
				? currentChirho
				: undefined;
		}
	);
	return versionChirho;
}

export async function requireBuildChirho(
	clientChirho: ClientChirho,
	optionsChirho: OptionsChirho
): Promise<AppleRecordChirho> {
	if (
		!optionsChirho.buildIdChirho ||
		!/^[A-Za-z0-9-]+$/u.test(optionsChirho.buildIdChirho) ||
		!optionsChirho.buildChirho ||
		!/^[1-9][0-9]*$/u.test(optionsChirho.buildChirho)
	)
		throw new Error('An exact build id and build number are required.');
	const responseChirho = await clientChirho.requestChirho(
		'GET',
		`/v1/builds/${optionsChirho.buildIdChirho}?include=app,preReleaseVersion`
	);
	const buildChirho = oneChirho(rowsChirho(responseChirho), 'intended build');
	const releaseChirho = oneChirho(
		(responseChirho.included ?? []).filter(
			(recordChirho) =>
				recordChirho.type === 'preReleaseVersions' &&
				recordChirho.id === relationIdChirho(buildChirho, 'preReleaseVersion')
		),
		'build prerelease version'
	);
	if (
		buildChirho.id !== optionsChirho.buildIdChirho ||
		relationIdChirho(buildChirho, 'app') !== APP_ID_CHIRHO ||
		buildChirho.attributes?.version !== optionsChirho.buildChirho ||
		buildChirho.attributes?.processingState !== 'VALID' ||
		buildChirho.attributes?.expired !== false ||
		buildChirho.attributes?.buildAudienceType !== 'APP_STORE_ELIGIBLE' ||
		buildChirho.attributes?.usesNonExemptEncryption !== false ||
		releaseChirho.attributes?.version !== optionsChirho.versionChirho ||
		releaseChirho.attributes?.platform !== 'IOS'
	)
		throw new Error(
			'Build app/version/number/eligibility/encryption does not match the release plan.'
		);
	return buildChirho;
}

export async function attachChirho(
	clientChirho: ClientChirho,
	storeChirho: StoreChirho,
	optionsChirho: OptionsChirho
) {
	const targetValueChirho = await targetChirho(clientChirho, optionsChirho.versionChirho);
	if (!targetValueChirho.versionChirho) throw new Error('Prepare the update first.');
	const versionChirho = targetValueChirho.versionChirho;
	editableChirho(versionChirho);
	const buildChirho = await requireBuildChirho(clientChirho, optionsChirho);
	const pathChirho = `/v1/appStoreVersions/${versionChirho.id}`;
	const currentBuildChirho = async () => {
		const currentChirho = oneChirho(
			rowsChirho(await clientChirho.requestChirho('GET', pathChirho + '?include=build')),
			'update version'
		);
		const attachedChirho = relationIdChirho(currentChirho, 'build');
		if (attachedChirho && attachedChirho !== buildChirho.id)
			throw new Error('Another build is attached; preserve it and reconcile.');
		return attachedChirho === buildChirho.id ? currentChirho : undefined;
	};
	if (!optionsChirho.applyChirho) {
		await currentBuildChirho();
		return;
	}
	await writeChirho(
		clientChirho,
		storeChirho,
		'attach-build-chirho',
		'PATCH',
		pathChirho,
		{
			data: {
				type: 'appStoreVersions',
				id: versionChirho.id,
				relationships: { build: relationChirho('builds', buildChirho.id) }
			}
		},
		currentBuildChirho
	);
}

export async function readinessChirho(clientChirho: ClientChirho, optionsChirho: OptionsChirho) {
	const targetValueChirho = await targetChirho(clientChirho, optionsChirho.versionChirho);
	const versionChirho = targetValueChirho.versionChirho;
	if (!versionChirho) throw new Error('No matching update exists.');
	const notesChirho = requireNotesChirho(optionsChirho.notesChirho);
	const buildChirho = await requireBuildChirho(clientChirho, optionsChirho);
	const versionDetailChirho = oneChirho(
		rowsChirho(
			await clientChirho.requestChirho(
				'GET',
				`/v1/appStoreVersions/${versionChirho.id}?include=build`
			)
		),
		'update version'
	);
	if (relationIdChirho(versionDetailChirho, 'build') !== buildChirho.id)
		throw new Error('The intended build is not attached.');
	const localeRowsChirho = await localesChirho(clientChirho, versionChirho);
	const screenshotsChirho: Record<string, number> = {};
	for (const localeChirho of LOCALES_CHIRHO) {
		const localeRowChirho = oneChirho(
			localeRowsChirho.filter((recordChirho) => recordChirho.attributes?.locale === localeChirho),
			localeChirho + ' update localization'
		);
		if (
			localeRowChirho.attributes?.whatsNew !== notesChirho.whats_new_chirho[localeChirho] ||
			typeof localeRowChirho.attributes?.description !== 'string' ||
			!localeRowChirho.attributes.description ||
			!String(localeRowChirho.attributes?.supportUrl ?? '').startsWith('https://hinneh.us/')
		)
			throw new Error('Incomplete saved localized update metadata.');
		const setsChirho = await listChirho(
			clientChirho,
			`/v1/appStoreVersionLocalizations/${localeRowChirho.id}/appScreenshotSets?limit=200`
		);
		const familiesChirho = new Set<string>();
		for (const setChirho of setsChirho) {
			const displayChirho = String(setChirho.attributes?.screenshotDisplayType);
			const imagesChirho = await listChirho(
				clientChirho,
				`/v1/appScreenshotSets/${setChirho.id}/appScreenshots?limit=200`
			);
			if (!imagesChirho.length) continue;
			for (const imageChirho of imagesChirho) {
				const deliveryChirho = imageChirho.attributes?.assetDeliveryState as
					{ state?: string; errors?: unknown[] } | undefined;
				if (deliveryChirho?.state !== 'COMPLETE' || deliveryChirho.errors?.length)
					throw new Error('A localized screenshot is not completely processed.');
			}
			if (displayChirho.startsWith('APP_IPHONE_')) familiesChirho.add('iphone-chirho');
			if (displayChirho.startsWith('APP_IPAD_')) familiesChirho.add('ipad-chirho');
			screenshotsChirho[localeChirho + ':' + displayChirho] = imagesChirho.length;
		}
		if (familiesChirho.size !== 2)
			throw new Error('Both iPhone and iPad screenshots are required in each locale.');
	}
	const reviewChirho = await reviewDetailChirho(clientChirho, versionChirho);
	if (
		!reviewChirho ||
		reviewChirho.attributes?.notes !== notesChirho.review_notes_chirho ||
		['contactFirstName', 'contactLastName', 'contactPhone', 'contactEmail'].some(
			(fieldChirho) =>
				typeof reviewChirho.attributes?.[fieldChirho] !== 'string' ||
				!String(reviewChirho.attributes?.[fieldChirho]).trim()
		) ||
		reviewChirho.attributes?.demoAccountRequired !== false
	)
		throw new Error(
			'Review contact/notes/no-login declaration is incomplete; private values are not printed.'
		);
	const infosChirho = await listChirho(
		clientChirho,
		`/v1/apps/${APP_ID_CHIRHO}/appInfos?limit=200`
	);
	const currentInfosChirho = infosChirho.filter((recordChirho) =>
		['PREPARE_FOR_SUBMISSION', 'READY_FOR_REVIEW', 'READY_FOR_DISTRIBUTION', 'ACCEPTED'].includes(
			String(recordChirho.attributes?.state)
		)
	);
	if (!currentInfosChirho.length)
		throw new Error('No current app information record for privacy URL readback.');
	for (const infoChirho of currentInfosChirho) {
		const infoLocalesChirho = await listChirho(
			clientChirho,
			`/v1/appInfos/${infoChirho.id}/appInfoLocalizations?limit=200`
		);
		for (const localeChirho of LOCALES_CHIRHO) {
			const localeRowChirho = oneChirho(
				infoLocalesChirho.filter(
					(recordChirho) => recordChirho.attributes?.locale === localeChirho
				),
				'saved privacy localization'
			);
			if (
				!String(localeRowChirho.attributes?.privacyPolicyUrl ?? '').startsWith(
					'https://hinneh.us/privacy-chirho/'
				)
			)
				throw new Error(
					'A saved localized privacy policy URL is absent or outside the expected page.'
				);
		}
	}
	return {
		app_id_chirho: APP_ID_CHIRHO,
		version_id_chirho: versionChirho.id,
		version_chirho: optionsChirho.versionChirho,
		build_id_chirho: buildChirho.id,
		build_chirho: optionsChirho.buildChirho,
		release_type_chirho: versionChirho.attributes?.releaseType,
		version_state_chirho:
			versionChirho.attributes?.appVersionState ?? versionChirho.attributes?.appStoreState,
		screenshots_chirho: screenshotsChirho,
		review_contact_present_chirho: true,
		owner_forms_chirho:
			'Existing app-level privacy, age, DSA, price and availability are preserved, not reanswered or certified by this check.'
	};
}

async function reviewQueueChirho(clientChirho: ClientChirho) {
	return (
		await listChirho(clientChirho, `/v1/apps/${APP_ID_CHIRHO}/reviewSubmissions?limit=200`)
	).filter(
		(recordChirho) =>
			recordChirho.attributes?.platform === 'IOS' && recordChirho.attributes?.state !== 'COMPLETE'
	);
}
async function itemsChirho(clientChirho: ClientChirho, submissionChirho: AppleRecordChirho) {
	return (
		await listChirho(
			clientChirho,
			`/v1/reviewSubmissions/${submissionChirho.id}/items?limit=200&include=appStoreVersion`
		)
	).filter((recordChirho) => recordChirho.attributes?.state !== 'REMOVED');
}
function requireOnlyVersionChirho(
	itemsValueChirho: AppleRecordChirho[],
	versionChirho: AppleRecordChirho
) {
	if (
		itemsValueChirho.some(
			(itemChirho) => relationIdChirho(itemChirho, 'appStoreVersion') !== versionChirho.id
		)
	)
		throw new Error('The review submission contains another product/version; do not mutate it.');
}

export async function submitChirho(
	clientChirho: ClientChirho,
	storeChirho: StoreChirho,
	optionsChirho: OptionsChirho
) {
	const readyChirho = await readinessChirho(clientChirho, optionsChirho);
	const targetValueChirho = await targetChirho(clientChirho, optionsChirho.versionChirho);
	const versionChirho = targetValueChirho.versionChirho!;
	const findSubmissionChirho = async () => {
		const queueChirho = await reviewQueueChirho(clientChirho);
		if (queueChirho.length > 1) throw new Error('More than one active iOS review submission.');
		if (queueChirho[0]) {
			const existingItemsChirho = await itemsChirho(clientChirho, queueChirho[0]);
			requireOnlyVersionChirho(existingItemsChirho, versionChirho);
			if (
				SUBMITTED_STATES_CHIRHO.includes(String(queueChirho[0].attributes?.state)) &&
				existingItemsChirho.length !== 1
			)
				throw new Error('Submitted review does not contain exactly the intended version.');
		}
		return queueChirho[0];
	};
	let submissionChirho = await findSubmissionChirho();
	if (
		submissionChirho &&
		SUBMITTED_STATES_CHIRHO.includes(String(submissionChirho.attributes?.state))
	) {
		if (
			optionsChirho.applyChirho &&
			storeChirho.journalChirho.operations_chirho['submit-review-chirho']
		) {
			const acceptedChirho = submissionChirho;
			await writeChirho(
				clientChirho,
				storeChirho,
				'submit-review-chirho',
				'PATCH',
				`/v1/reviewSubmissions/${acceptedChirho.id}`,
				{
					data: {
						type: 'reviewSubmissions',
						id: acceptedChirho.id,
						attributes: { submitted: true }
					}
				},
				async () => acceptedChirho
			);
		}
		return {
			...readyChirho,
			submission_id_chirho: submissionChirho.id,
			submission_state_chirho: submissionChirho.attributes?.state,
			api_writes_chirho: 0
		};
	}
	editableChirho(versionChirho);
	if (!optionsChirho.applyChirho)
		return {
			...readyChirho,
			submission_state_chirho: submissionChirho?.attributes?.state ?? 'NOT_CREATED',
			apply_chirho: false
		};
	submissionChirho = await writeChirho(
		clientChirho,
		storeChirho,
		'create-review-chirho',
		'POST',
		'/v1/reviewSubmissions',
		{
			data: {
				type: 'reviewSubmissions',
				attributes: { platform: 'IOS' },
				relationships: { app: relationChirho('apps', APP_ID_CHIRHO) }
			}
		},
		findSubmissionChirho
	);
	if (submissionChirho.attributes?.state !== 'READY_FOR_REVIEW')
		throw new Error('The review submission is not ready for adding the update.');
	await writeChirho(
		clientChirho,
		storeChirho,
		'add-review-version-chirho',
		'POST',
		'/v1/reviewSubmissionItems',
		{
			data: {
				type: 'reviewSubmissionItems',
				relationships: {
					reviewSubmission: relationChirho('reviewSubmissions', submissionChirho.id),
					appStoreVersion: relationChirho('appStoreVersions', versionChirho.id)
				}
			}
		},
		async () => {
			const currentChirho = await itemsChirho(clientChirho, submissionChirho!);
			requireOnlyVersionChirho(currentChirho, versionChirho);
			if (currentChirho.length > 1)
				throw new Error('Duplicate review items require reconciliation.');
			return currentChirho[0];
		}
	);
	// Recheck the actual current build and complete localized metadata immediately before submission.
	await readinessChirho(clientChirho, optionsChirho);
	const pathChirho = `/v1/reviewSubmissions/${submissionChirho.id}`;
	const submittedChirho = await writeChirho(
		clientChirho,
		storeChirho,
		'submit-review-chirho',
		'PATCH',
		pathChirho,
		{
			data: { type: 'reviewSubmissions', id: submissionChirho.id, attributes: { submitted: true } }
		},
		async () => {
			const currentChirho = oneChirho(
				rowsChirho(await clientChirho.requestChirho('GET', pathChirho)),
				'review submission'
			);
			return SUBMITTED_STATES_CHIRHO.includes(String(currentChirho.attributes?.state))
				? currentChirho
				: undefined;
		}
	);
	return {
		...readyChirho,
		submission_id_chirho: submittedChirho.id,
		submission_state_chirho: submittedChirho.attributes?.state
	};
}

async function privateStoreChirho(
	versionChirho: string
): Promise<{ storeChirho: StoreChirho; closeChirho(): Promise<void> }> {
	const homeChirho = resolveChirho(
		homedirChirho(),
		'.local/state/apple-app-store-chirho/updates-chirho',
		APP_ID_CHIRHO,
		versionChirho
	);
	await mkdirChirho(homeChirho, { recursive: true, mode: 0o700 });
	const lockPathChirho = resolveChirho(homeChirho, 'operator-lock-chirho');
	const lockChirho = await openChirho(lockPathChirho, 'wx', 0o600).catch(() => {
		throw new Error('The fixed Apple update lock exists; reconcile its owner before another run.');
	});
	await lockChirho.writeFile(JSON.stringify({ pid_chirho: process.pid }) + '\n');
	const pathChirho = resolveChirho(homeChirho, 'operations-chirho.json');
	try {
		let journalChirho: JournalChirho;
		try {
			if ((await statChirho(pathChirho)).size > 1024 * 1024)
				throw new Error('Apple journal exceeds its bound.');
			journalChirho = JSON.parse(await readFileChirho(pathChirho, 'utf8')) as JournalChirho;
		} catch (errorChirho) {
			if (
				!(errorChirho instanceof Error) ||
				!('code' in errorChirho) ||
				errorChirho.code !== 'ENOENT'
			)
				throw errorChirho;
			journalChirho = {
				app_id_chirho: APP_ID_CHIRHO,
				version_chirho: versionChirho,
				operations_chirho: {}
			};
		}
		if (
			journalChirho.app_id_chirho !== APP_ID_CHIRHO ||
			journalChirho.version_chirho !== versionChirho ||
			!journalChirho.operations_chirho ||
			typeof journalChirho.operations_chirho !== 'object'
		)
			throw new Error('Wrong Apple update journal identity.');
		const storeChirho: StoreChirho = {
			journalChirho,
			async saveChirho() {
				const temporaryChirho = resolveChirho(
					homeChirho,
					'journal-' + randomUUIDChirho() + '-chirho.tmp'
				);
				const fileChirho = await openChirho(temporaryChirho, 'wx', 0o600);
				try {
					await fileChirho.writeFile(JSON.stringify(journalChirho, null, 2) + '\n');
					await fileChirho.sync();
				} finally {
					await fileChirho.close();
				}
				await renameChirho(temporaryChirho, pathChirho);
			}
		};
		return {
			storeChirho,
			async closeChirho() {
				await lockChirho.close();
				await rmChirho(lockPathChirho);
			}
		};
	} catch (errorChirho) {
		await lockChirho.close();
		await rmChirho(lockPathChirho);
		throw errorChirho;
	}
}

export function argumentsChirho(valuesChirho: string[]) {
	const modeChirho = valuesChirho[0];
	if (
		![
			'inspect-chirho',
			'prepare-chirho',
			'attach-chirho',
			'readiness-chirho',
			'submit-chirho'
		].includes(modeChirho ?? '')
	)
		throw new Error(
			'Mode: inspect-chirho | prepare-chirho | attach-chirho | readiness-chirho | submit-chirho.'
		);
	const flagsChirho = new Map<string, string | true>();
	for (let indexChirho = 1; indexChirho < valuesChirho.length; indexChirho++) {
		const nameChirho = valuesChirho[indexChirho];
		if (
			![
				'--version-chirho',
				'--build-chirho',
				'--build-id-chirho',
				'--notes-file-chirho',
				'--apply-chirho'
			].includes(nameChirho) ||
			flagsChirho.has(nameChirho)
		)
			throw new Error('Unknown or duplicate option.');
		if (nameChirho === '--apply-chirho') flagsChirho.set(nameChirho, true);
		else {
			const valueChirho = valuesChirho[++indexChirho];
			if (!valueChirho || valueChirho.startsWith('--')) throw new Error('Missing option value.');
			flagsChirho.set(nameChirho, valueChirho);
		}
	}
	const versionChirho = flagsChirho.get('--version-chirho');
	if (typeof versionChirho !== 'string' || !/^0\.1\.[1-9][0-9]*$/u.test(versionChirho))
		throw new Error('Explicit next 0.1.x version required.');
	if (
		(modeChirho === 'inspect-chirho' || modeChirho === 'readiness-chirho') &&
		flagsChirho.has('--apply-chirho')
	)
		throw new Error('Read-only mode does not accept apply.');
	return { modeChirho, flagsChirho, versionChirho };
}

async function mainChirho() {
	const parsedChirho = argumentsChirho(process.argv.slice(2));
	const notesPathChirho = parsedChirho.flagsChirho.get('--notes-file-chirho');
	const notesChirho =
		typeof notesPathChirho === 'string'
			? requireNotesChirho(JSON.parse(await readFileChirho(resolveChirho(notesPathChirho), 'utf8')))
			: undefined;
	if (parsedChirho.modeChirho !== 'inspect-chirho' && !notesChirho)
		throw new Error('A reviewed localized notes file is required.');
	const optionsChirho: OptionsChirho = {
		versionChirho: parsedChirho.versionChirho,
		buildChirho: parsedChirho.flagsChirho.get('--build-chirho') as string | undefined,
		buildIdChirho: parsedChirho.flagsChirho.get('--build-id-chirho') as string | undefined,
		applyChirho: parsedChirho.flagsChirho.has('--apply-chirho'),
		notesChirho
	};
	const modulePathChirho = pathToFileURLChirho(
		resolveChirho(
			homedirChirho(),
			'.codex/skills/apple-app-store-chirho/scripts-chirho/apple-client-chirho.ts'
		)
	).href;
	const sharedChirho = (await import(modulePathChirho)) as {
		AppleClientChirho: { openChirho(): Promise<ClientChirho> };
	};
	const clientChirho = await sharedChirho.AppleClientChirho.openChirho();
	if (parsedChirho.modeChirho === 'inspect-chirho') {
		const targetValueChirho = await targetChirho(clientChirho, optionsChirho.versionChirho);
		console.log(
			JSON.stringify(
				{
					app_id_chirho: APP_ID_CHIRHO,
					bundle_chirho: BUNDLE_ID_CHIRHO,
					base_version_id_chirho: targetValueChirho.baseChirho.id,
					version_id_chirho: targetValueChirho.versionChirho?.id ?? null,
					version_state_chirho:
						targetValueChirho.versionChirho?.attributes?.appVersionState ?? null,
					release_type_chirho:
						targetValueChirho.versionChirho?.attributes?.releaseType ??
						targetValueChirho.baseChirho.attributes?.releaseType
				},
				null,
				2
			)
		);
		return;
	}
	if (parsedChirho.modeChirho === 'readiness-chirho') {
		console.log(JSON.stringify(await readinessChirho(clientChirho, optionsChirho), null, 2));
		return;
	}
	// Dry runs make no journal or lock files and never invoke a provider mutation.
	const heldChirho = optionsChirho.applyChirho
		? await privateStoreChirho(optionsChirho.versionChirho)
		: {
				storeChirho: {
					journalChirho: {
						app_id_chirho: APP_ID_CHIRHO,
						version_chirho: optionsChirho.versionChirho,
						operations_chirho: {}
					},
					async saveChirho() {
						throw new Error('Dry run attempted a write.');
					}
				},
				async closeChirho() {}
			};
	try {
		if (parsedChirho.modeChirho === 'prepare-chirho') {
			const versionChirho = await prepareChirho(
				clientChirho,
				heldChirho.storeChirho,
				optionsChirho
			);
			console.log(
				JSON.stringify({
					apply_chirho: optionsChirho.applyChirho,
					target_version_chirho: optionsChirho.versionChirho,
					version_id_chirho: optionsChirho.applyChirho ? versionChirho.id : null,
					submission_chirho: false
				})
			);
		} else if (parsedChirho.modeChirho === 'attach-chirho') {
			await attachChirho(clientChirho, heldChirho.storeChirho, optionsChirho);
			console.log(
				JSON.stringify({
					apply_chirho: optionsChirho.applyChirho,
					build_id_chirho: optionsChirho.buildIdChirho,
					submission_chirho: false
				})
			);
		} else
			console.log(
				JSON.stringify(
					await submitChirho(clientChirho, heldChirho.storeChirho, optionsChirho),
					null,
					2
				)
			);
	} finally {
		await heldChirho.closeChirho();
	}
}

if (import.meta.main)
	mainChirho().catch((errorChirho: unknown) => {
		// Shared transport errors omit provider details, which may echo private contact fields.
		console.error(
			errorChirho instanceof Error ? errorChirho.message : 'Apple update operator failed.'
		);
		process.exitCode = 1;
	});
