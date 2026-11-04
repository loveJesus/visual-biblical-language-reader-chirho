// For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life. — John 3:16 (KJV)
// Workflow: spec-chirho/workflows-chirho/native-chirho/store-assets-chirho.md.
import {
	readFile as readFileChirho,
	rename as renameChirho,
	open as openChirho
} from 'node:fs/promises';
import { createHash as createHashChirho } from 'node:crypto';
import { resolve as resolveChirho } from 'node:path';
import { AppleClientChirho, rowsChirho, type AppleRecordChirho } from './app-store-client-chirho';
import {
	targetChirho,
	uploadBytesChirho,
	type UploadOperationChirho
} from './app-store-listing-chirho';

interface CreativeFileChirho {
	path_chirho: string;
	sha256_chirho: string;
	bytes_chirho: number;
	width_chirho: number;
	height_chirho: number;
	locale_chirho: string;
}
export function requireCreativeFileChirho(
	fileChirho: CreativeFileChirho,
	bytesChirho: Buffer
): void {
	if (
		!['en-universal-chirho.png', 'es-universal-chirho.png'].includes(fileChirho.path_chirho) ||
		fileChirho.locale_chirho !== (fileChirho.path_chirho.startsWith('en-') ? 'en-US' : 'es-ES') ||
		!/^[a-f0-9]{64}$/u.test(fileChirho.sha256_chirho) ||
		bytesChirho.length < 26 ||
		bytesChirho.length > 32 * 1024 * 1024 ||
		bytesChirho.length !== fileChirho.bytes_chirho ||
		bytesChirho.subarray(0, 8).toString('hex') !== '89504e470d0a1a0a' ||
		bytesChirho.readUInt32BE(16) !== 5244 ||
		bytesChirho.readUInt32BE(20) !== 2950 ||
		bytesChirho[25] !== 2 ||
		fileChirho.width_chirho !== 5244 ||
		fileChirho.height_chirho !== 2950 ||
		createHashChirho('sha256').update(bytesChirho).digest('hex') !== fileChirho.sha256_chirho
	)
		throw new Error('Creative file is outside the verified localized RGB PNG export.');
}
const relationChirho = (typeChirho: string, idChirho: string) => ({
	data: { type: typeChirho, id: idChirho }
});
const typesChirho = ['PRODUCT_PAGE_HEADER_ASSET', 'APP_STORE_SEARCH_RESULTS_ASSET'] as const;
const homeChirho = resolveChirho(
	'workspace-chirho/native-apps-chirho/app-store-creative-chirho/2026-11-04-chirho'
);
const artworkHomeChirho = resolveChirho(homeChirho, 'artwork-chirho');
const journalPathChirho = resolveChirho(homeChirho, 'creative-journal-chirho.json');
interface WriteChirho {
	state_chirho: 'started' | 'received' | 'reconciled';
	id_chirho?: string;
}
export async function recordAppleWriteChirho(
	clientChirho: Pick<AppleClientChirho, 'requestChirho'>,
	journalChirho: Record<string, WriteChirho>,
	persistChirho: () => Promise<void>,
	keyChirho: string,
	pathChirho: string,
	bodyChirho: unknown
): Promise<AppleRecordChirho> {
	if (journalChirho[keyChirho])
		throw new Error(
			'Prior Apple write is retained; reconcile its exact remote object before another POST.'
		);
	journalChirho[keyChirho] = { state_chirho: 'started' };
	await persistChirho();
	const rowChirho = rowsChirho(await clientChirho.requestChirho('POST', pathChirho, bodyChirho))[0];
	journalChirho[keyChirho] = { state_chirho: 'received', id_chirho: rowChirho.id };
	await persistChirho();
	return rowChirho;
}
async function saveChirho(nameChirho: string, valueChirho: unknown): Promise<void> {
	const pathChirho = resolveChirho(homeChirho, nameChirho);
	const temporaryChirho = pathChirho + '.tmp-chirho';
	const handleChirho = await openChirho(temporaryChirho, 'w', 0o600);
	try {
		await handleChirho.writeFile(JSON.stringify(valueChirho, null, 2) + '\n');
		await handleChirho.sync();
	} finally {
		await handleChirho.close();
	}
	await renameChirho(temporaryChirho, pathChirho);
	const directoryChirho = await openChirho(homeChirho, 'r');
	try {
		await directoryChirho.sync();
	} finally {
		await directoryChirho.close();
	}
}
async function runChirho(): Promise<void> {
	const applyChirho = process.argv.includes('--apply-chirho');
	const verifyChirho = process.argv.includes('--verify-chirho');
	if (applyChirho && verifyChirho) throw new Error('Choose apply or verify, not both.');
	const manifestChirho = JSON.parse(
		await readFileChirho(resolveChirho(artworkHomeChirho, 'creative-manifest-chirho.json'), 'utf8')
	) as { files_chirho: CreativeFileChirho[] };
	if (
		manifestChirho.files_chirho.length !== 2 ||
		new Set(manifestChirho.files_chirho.map((fileChirho) => fileChirho.locale_chirho)).size !== 2
	)
		throw new Error('Expected exactly one EN and one ES creative export.');
	const preparedChirho = [];
	for (const fileChirho of manifestChirho.files_chirho) {
		// The fixed basename check precedes any local file read.
		if (!['en-universal-chirho.png', 'es-universal-chirho.png'].includes(fileChirho.path_chirho))
			throw new Error('Unsafe creative path.');
		const bytesChirho = await readFileChirho(
			resolveChirho(artworkHomeChirho, fileChirho.path_chirho)
		);
		requireCreativeFileChirho(fileChirho, bytesChirho);
		preparedChirho.push({
			fileChirho,
			bytesChirho,
			referenceChirho: 'hinneh-creative-chirho-' + fileChirho.sha256_chirho
		});
	}
	const clientChirho = await AppleClientChirho.openChirho();
	const { appChirho, versionChirho } = await targetChirho(clientChirho);
	const journalChirho: Record<string, WriteChirho> = await readFileChirho(journalPathChirho, 'utf8')
		.then((valueChirho) => JSON.parse(valueChirho))
		.catch((errorChirho: NodeJS.ErrnoException) => {
			if (errorChirho.code === 'ENOENT') return {};
			throw errorChirho;
		});
	const referenceChirho = rowsChirho(
		await clientChirho.requestChirho('GET', '/v1/appAssetLibraryRefData')
	)[0];
	const specsChirho = referenceChirho.attributes?.imageSpecs as {
		specId: string;
		compatiblePlacementTypes: string[];
		alphaAllowed: boolean;
		dimensions: { minWidth: number; maxWidth: number; minHeight: number; maxHeight: number };
	}[];
	if (
		!specsChirho.some(
			(specChirho) =>
				specChirho.specId === 'c8f4e2b1-7a3d-5c9e-8b6f-2d1a0e9c8b7a' &&
				!specChirho.alphaAllowed &&
				specChirho.dimensions.minWidth === 5244 &&
				specChirho.dimensions.maxWidth === 5244 &&
				specChirho.dimensions.minHeight === 2950 &&
				specChirho.dimensions.maxHeight === 2950 &&
				typesChirho.every((typeChirho) => specChirho.compatiblePlacementTypes.includes(typeChirho))
		)
	)
		throw new Error('Live Apple specifications no longer accept the universal creative.');
	const imagesResponseChirho = await clientChirho.requestChirho(
		'GET',
		`/v1/appAssetLibraries/${appChirho.id}/images?limit=200`
	);
	if (imagesResponseChirho.links?.next)
		throw new Error('Asset library exceeds this bounded first-release tool.');
	const imagesChirho = rowsChirho(imagesResponseChirho);
	// A newly accepted write can precede Apple's library-list readback. Its receipt wins over
	// absence in that list: read the exact object before considering another POST.
	for (const preparedRowChirho of preparedChirho) {
		const knownIdChirho =
			journalChirho['image!' + preparedRowChirho.fileChirho.sha256_chirho]?.id_chirho;
		if (!knownIdChirho || imagesChirho.some((rowChirho) => rowChirho.id === knownIdChirho))
			continue;
		const knownChirho = rowsChirho(
			await clientChirho.requestChirho('GET', `/v1/appAssetLibraryImages/${knownIdChirho}`)
		)[0];
		if (
			knownChirho.attributes?.referenceName !== preparedRowChirho.referenceChirho ||
			knownChirho.attributes?.category !== 'CREATIVE_ASSETS'
		)
			throw new Error('A saved image receipt differs from the prepared creative.');
		imagesChirho.push(knownChirho);
	}
	const localesChirho = rowsChirho(
		await clientChirho.requestChirho(
			'GET',
			`/v1/appStoreVersions/${versionChirho.id}/appStoreVersionLocalizations`
		)
	);
	const placementsChirho = new Map<string, AppleRecordChirho[]>();
	for (const preparedRowChirho of preparedChirho) {
		const localeChirho = localesChirho.find(
			(rowChirho) => rowChirho.attributes?.locale === preparedRowChirho.fileChirho.locale_chirho
		);
		if (!localeChirho) throw new Error('Missing target localization.');
		const ownedChirho = new Set(
			imagesChirho
				.filter(
					(rowChirho) => rowChirho.attributes?.referenceName === preparedRowChirho.referenceChirho
				)
				.map((rowChirho) => rowChirho.id)
		);
		if (ownedChirho.size > 1)
			throw new Error('Repeated creative reference; reconcile instead of uploading.');
		for (const typeChirho of typesChirho) {
			const responseChirho = await clientChirho.requestChirho(
				'GET',
				`/v1/appStoreVersionLocalizations/${localeChirho.id}/placements?filter[placementType]=${typeChirho}&filter[placementGroup]=DEFAULT_PROFILE&include=image&limit=10`
			);
			const rowsForSlotChirho = rowsChirho(responseChirho);
			const knownPlacementIdChirho = journalChirho[localeChirho.id + '!' + typeChirho]?.id_chirho;
			if (!rowsForSlotChirho.length && knownPlacementIdChirho) {
				const knownChirho = rowsChirho(
					await clientChirho.requestChirho(
						'GET',
						`/v1/appAssetLibraryPlacements/${knownPlacementIdChirho}?include=image`
					)
				)[0];
				if (
					knownChirho.attributes?.placementType !== typeChirho ||
					knownChirho.attributes?.placementGroup !== 'DEFAULT_PROFILE'
				)
					throw new Error('A saved placement receipt differs from the target slot.');
				rowsForSlotChirho.push(knownChirho);
			}
			if (
				responseChirho.links?.next ||
				rowsForSlotChirho.length > 1 ||
				rowsForSlotChirho.some((rowChirho) => {
					const imageChirho = rowChirho.relationships?.image?.data;
					return !imageChirho || Array.isArray(imageChirho) || !ownedChirho.has(imageChirho.id);
				})
			)
				throw new Error('A creative slot already contains a different asset; preserve it.');
			placementsChirho.set(localeChirho.id + '!' + typeChirho, rowsForSlotChirho);
		}
	}
	if (!applyChirho && !verifyChirho) {
		console.log(
			'Dry plan: two verified localized PNGs for four Hinneh draft creative slots; no writes.'
		);
		return;
	}
	async function createChirho(
		keyChirho: string,
		pathChirho: string,
		bodyChirho: unknown
	): Promise<AppleRecordChirho> {
		return recordAppleWriteChirho(
			clientChirho,
			journalChirho,
			() => saveChirho('creative-journal-chirho.json', journalChirho),
			keyChirho,
			pathChirho,
			bodyChirho
		);
	}
	const receiptsChirho = [];
	for (const { fileChirho, bytesChirho, referenceChirho } of preparedChirho) {
		const localeChirho = localesChirho.find(
			(rowChirho) => rowChirho.attributes?.locale === fileChirho.locale_chirho
		)!;
		const imageKeyChirho = 'image!' + fileChirho.sha256_chirho;
		let imageChirho = imagesChirho.find(
			(rowChirho) => rowChirho.attributes?.referenceName === referenceChirho
		);
		if (!imageChirho && applyChirho)
			imageChirho = await createChirho(imageKeyChirho, '/v1/appAssetLibraryImages', {
				data: {
					type: 'appAssetLibraryImages',
					attributes: {
						fileName: fileChirho.path_chirho,
						fileSize: bytesChirho.length,
						category: 'CREATIVE_ASSETS',
						referenceName: referenceChirho
					},
					relationships: { assetLibrary: relationChirho('appAssetLibraries', appChirho.id) }
				}
			});
		if (!imageChirho) throw new Error('Creative image has not been uploaded.');
		if (journalChirho[imageKeyChirho]?.state_chirho === 'started') {
			journalChirho[imageKeyChirho] = { state_chirho: 'reconciled', id_chirho: imageChirho.id };
			await saveChirho('creative-journal-chirho.json', journalChirho);
		}
		if (imageChirho.attributes?.state === 'AWAITING_UPLOAD' && applyChirho) {
			const freshChirho = rowsChirho(
				await clientChirho.requestChirho('GET', `/v1/appAssetLibraryImages/${imageChirho.id}`)
			)[0];
			await uploadBytesChirho(
				freshChirho.attributes?.uploadOperations as UploadOperationChirho[],
				bytesChirho
			);
			imageChirho = rowsChirho(
				await clientChirho.requestChirho('PATCH', `/v1/appAssetLibraryImages/${imageChirho.id}`, {
					data: {
						type: 'appAssetLibraryImages',
						id: imageChirho.id,
						attributes: { uploaded: true }
					}
				})
			)[0];
		}
		for (const typeChirho of typesChirho) {
			const placementKeyChirho = localeChirho.id + '!' + typeChirho;
			let placementChirho = placementsChirho.get(placementKeyChirho)?.[0];
			if (!placementChirho && applyChirho)
				placementChirho = await createChirho(placementKeyChirho, '/v1/appAssetLibraryPlacements', {
					data: {
						type: 'appAssetLibraryPlacements',
						attributes: { placementType: typeChirho, placementGroup: 'DEFAULT_PROFILE' },
						relationships: {
							image: relationChirho('appAssetLibraryImages', imageChirho.id),
							appStoreVersionLocalization: relationChirho(
								'appStoreVersionLocalizations',
								localeChirho.id
							)
						}
					}
				});
			if (!placementChirho) throw new Error('Creative placement is missing.');
			if (
				verifyChirho &&
				(placementChirho.attributes?.state !== 'ACTIVE' ||
					imageChirho.attributes?.state !== 'PREPARE_FOR_SUBMISSION')
			)
				throw new Error('Creative is not yet processed and active; wait for Apple processing.');
			if (journalChirho[placementKeyChirho]?.state_chirho === 'started') {
				journalChirho[placementKeyChirho] = {
					state_chirho: 'reconciled',
					id_chirho: placementChirho.id
				};
				await saveChirho('creative-journal-chirho.json', journalChirho);
			}
			receiptsChirho.push({
				locale_chirho: fileChirho.locale_chirho,
				type_chirho: typeChirho,
				path_chirho: fileChirho.path_chirho,
				sha256_chirho: fileChirho.sha256_chirho,
				image_id_chirho: imageChirho.id,
				image_state_chirho: imageChirho.attributes?.state,
				placement_id_chirho: placementChirho.id,
				placement_state_chirho: placementChirho.attributes?.state
			});
			await saveChirho(
				verifyChirho ? 'creative-verified-chirho.json' : 'creative-uploaded-chirho.json',
				{
					at_chirho: new Date().toISOString(),
					app_id_chirho: appChirho.id,
					version_id_chirho: versionChirho.id,
					submitted_chirho: false,
					placements_chirho: receiptsChirho
				}
			);
		}
	}
	console.log(
		JSON.stringify({
			app_id_chirho: appChirho.id,
			creative_assets_chirho: preparedChirho.length,
			placements_chirho: receiptsChirho.length,
			verified_chirho: verifyChirho,
			submitted_chirho: false
		})
	);
}
if (import.meta.main) await runChirho();
