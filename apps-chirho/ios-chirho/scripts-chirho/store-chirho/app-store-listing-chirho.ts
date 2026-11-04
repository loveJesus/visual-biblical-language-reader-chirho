// For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life. — John 3:16 (KJV)
// Workflow: spec-chirho/workflows-chirho/native-chirho/store-connect-chirho.md.
import {
	readFile as readFileChirho,
	writeFile as writeFileChirho,
	mkdir as mkdirChirho
} from 'node:fs/promises';
import { resolve as resolveChirho } from 'node:path';
import { createHash as createHashChirho } from 'node:crypto';
import { AppleClientChirho, rowsChirho, type AppleRecordChirho } from './app-store-client-chirho';
import copyChirho from './store-copy-chirho.json';

const evidenceChirho = resolveChirho(
	'workspace-chirho/native-apps-chirho/app-store-connect-chirho/2026-11-04-chirho'
);
const packageChirho = resolveChirho(
	'workspace-chirho/native-apps-chirho/app-store-chirho/2026-11-04-chirho'
);
const bundleChirho = 'us.hinneh.readerchirho';
const relationChirho = (typeChirho: string, idChirho: string) => ({
	data: { type: typeChirho, id: idChirho }
});
export function requireDraftChirho(
	appChirho: AppleRecordChirho,
	versionChirho: AppleRecordChirho
): void {
	if (
		appChirho.attributes?.bundleId !== bundleChirho ||
		versionChirho.attributes?.platform !== 'IOS' ||
		versionChirho.attributes?.appStoreState !== 'PREPARE_FOR_SUBMISSION'
	)
		throw new Error('Refusing a different app, platform or non-draft version.');
}
async function saveChirho(nameChirho: string, valueChirho: unknown): Promise<void> {
	await mkdirChirho(evidenceChirho, { recursive: true });
	await writeFileChirho(
		resolveChirho(evidenceChirho, nameChirho + '.json'),
		JSON.stringify(valueChirho, null, 2) + '\n'
	);
}
export async function targetChirho(clientChirho: AppleClientChirho) {
	const appsChirho = rowsChirho(
		await clientChirho.requestChirho(
			'GET',
			'/v1/apps?filter[bundleId]=' + bundleChirho + '&limit=10'
		)
	);
	if (appsChirho.length !== 1) throw new Error('Expected exactly one registered Hinneh app.');
	const appChirho = appsChirho[0];
	const versionsChirho = rowsChirho(
		await clientChirho.requestChirho('GET', `/v1/apps/${appChirho.id}/appStoreVersions`)
	).filter((rowChirho) => rowChirho.attributes?.platform === 'IOS');
	if (versionsChirho.length !== 1)
		throw new Error('This first-release tool requires exactly one iOS version.');
	const versionChirho = versionsChirho[0];
	requireDraftChirho(appChirho, versionChirho);
	const infosChirho = rowsChirho(
		await clientChirho.requestChirho('GET', `/v1/apps/${appChirho.id}/appInfos`)
	).filter((rowChirho) => rowChirho.attributes?.state === 'PREPARE_FOR_SUBMISSION');
	if (infosChirho.length !== 1) throw new Error('Expected one editable app information record.');
	return { appChirho, versionChirho, infoChirho: infosChirho[0] };
}
async function prepareChirho(clientChirho: AppleClientChirho): Promise<void> {
	const { appChirho, versionChirho, infoChirho } = await targetChirho(clientChirho);
	await clientChirho.requestChirho('PATCH', `/v1/appStoreVersions/${versionChirho.id}`, {
		data: {
			type: 'appStoreVersions',
			id: versionChirho.id,
			attributes: {
				versionString: '0.1',
				releaseType: 'MANUAL',
				copyright: '2026 Love Jesus Software'
			}
		}
	});
	await clientChirho.requestChirho('PATCH', `/v1/appInfos/${infoChirho.id}`, {
		data: {
			type: 'appInfos',
			id: infoChirho.id,
			relationships: {
				primaryCategory: relationChirho('appCategories', 'EDUCATION'),
				secondaryCategory: relationChirho('appCategories', 'REFERENCE')
			}
		}
	});
	for (const [languageChirho, localeChirho] of [
		['en', 'en-US'],
		['es', 'es-ES']
	] as const) {
		const textChirho = copyChirho[`${languageChirho}_chirho`];
		for (const [resourceChirho, attributesChirho, parentChirho, listPathChirho] of [
			[
				'appInfoLocalizations',
				{
					name: textChirho.name_chirho,
					subtitle: textChirho.subtitle_chirho,
					privacyPolicyUrl: copyChirho.privacy_url_chirho
				},
				{ appInfo: relationChirho('appInfos', infoChirho.id) },
				`/v1/appInfos/${infoChirho.id}/appInfoLocalizations`
			],
			[
				'appStoreVersionLocalizations',
				{
					description: textChirho.description_chirho,
					keywords: textChirho.keywords_chirho,
					promotionalText: textChirho.promotional_text_chirho,
					marketingUrl: copyChirho.marketing_url_chirho,
					supportUrl: copyChirho.support_url_chirho
				},
				{ appStoreVersion: relationChirho('appStoreVersions', versionChirho.id) },
				`/v1/appStoreVersions/${versionChirho.id}/appStoreVersionLocalizations`
			]
		] as const) {
			// Apple may create the matching version locale as a side effect of app-info creation.
			const recordsChirho = rowsChirho(await clientChirho.requestChirho('GET', listPathChirho));
			const existingChirho = recordsChirho.find(
				(rowChirho) => rowChirho.attributes?.locale === localeChirho
			);
			await clientChirho.requestChirho(
				existingChirho ? 'PATCH' : 'POST',
				'/v1/' + resourceChirho + (existingChirho ? '/' + existingChirho.id : ''),
				{
					data: {
						type: resourceChirho,
						...(existingChirho ? { id: existingChirho.id } : {}),
						attributes: {
							...attributesChirho,
							...(existingChirho ? {} : { locale: localeChirho })
						},
						...(existingChirho ? {} : { relationships: parentChirho })
					}
				}
			);
		}
	}
	await saveChirho('prepared-app-chirho', {
		at_chirho: new Date().toISOString(),
		app_id_chirho: appChirho.id,
		version_id_chirho: versionChirho.id,
		info_id_chirho: infoChirho.id,
		release_type_chirho: 'MANUAL',
		review_submission_chirho: false
	});
	console.log('Hinneh EN/ES listing saved as an unreleased draft.');
}

export interface UploadOperationChirho {
	method: string;
	url: string;
	length: number;
	offset: number;
	requestHeaders: { name: string; value: string }[];
}
export function validateUploadOperationChirho(
	operationChirho: UploadOperationChirho,
	byteLengthChirho: number
): URL {
	const urlChirho = new URL(operationChirho.url);
	const appleStorageChirho = ['.blobstore.apple.com', '.object-storage.apple.com'].some(
		(suffixChirho) => urlChirho.hostname.endsWith(suffixChirho)
	);
	if (
		urlChirho.protocol !== 'https:' ||
		!appleStorageChirho ||
		urlChirho.username ||
		urlChirho.password ||
		urlChirho.port ||
		operationChirho.method !== 'PUT' ||
		!Number.isSafeInteger(operationChirho.offset) ||
		!Number.isSafeInteger(operationChirho.length) ||
		operationChirho.offset < 0 ||
		operationChirho.length < 1 ||
		operationChirho.offset + operationChirho.length > byteLengthChirho
	)
		throw new Error('Unexpected Apple asset upload operation.');
	if (
		operationChirho.requestHeaders.some((headerChirho) =>
			/authorization|cookie/iu.test(headerChirho.name)
		)
	)
		throw new Error('Unexpected credential-bearing upload header.');
	return urlChirho;
}
export async function uploadBytesChirho(
	operationsChirho: UploadOperationChirho[],
	bytesChirho: Buffer
): Promise<void> {
	for (const operationChirho of operationsChirho) {
		const urlChirho = validateUploadOperationChirho(operationChirho, bytesChirho.length);
		const headersChirho = Object.fromEntries(
			operationChirho.requestHeaders.map((headerChirho) => [headerChirho.name, headerChirho.value])
		);
		if (Object.keys(headersChirho).some((nameChirho) => /authorization|cookie/iu.test(nameChirho)))
			throw new Error('Unexpected credential-bearing upload header.');
		const responseChirho = await fetch(urlChirho, {
			method: 'PUT',
			redirect: 'error',
			headers: headersChirho,
			body: new Uint8Array(
				bytesChirho.subarray(
					operationChirho.offset,
					operationChirho.offset + operationChirho.length
				)
			).buffer
		}).catch(() => {
			throw new Error('Apple image PUT interrupted; keep reservation and reconcile before retry.');
		});
		if (!responseChirho.ok) throw new Error('Apple image PUT HTTP ' + responseChirho.status);
	}
}
async function mediaChirho(clientChirho: AppleClientChirho): Promise<void> {
	const { appChirho, versionChirho } = await targetChirho(clientChirho);
	const referenceChirho = rowsChirho(
		await clientChirho.requestChirho('GET', '/v1/appAssetLibraryRefData')
	)[0];
	await saveChirho('asset-reference-chirho', { data: [referenceChirho] });
	const groupsChirho = referenceChirho.attributes?.placementProfileGroups as {
		placementProfileGroupId: string;
	}[];
	const specsChirho = referenceChirho.attributes?.imageSpecs as {
		dimensions: { minWidth: number; maxWidth: number; minHeight: number; maxHeight: number };
		compatiblePlacementTypes: string[];
		alphaAllowed: boolean;
		specId: string;
	}[];
	const manifestChirho = JSON.parse(
		await readFileChirho(resolveChirho(packageChirho, 'asset-manifest-chirho.json'), 'utf8')
	) as {
		files_chirho: {
			path_chirho: string;
			sha256_chirho: string;
			bytes_chirho: number;
			width_chirho: number;
			height_chirho: number;
			kind_chirho: string;
		}[];
	};
	const localesChirho = rowsChirho(
		await clientChirho.requestChirho(
			'GET',
			`/v1/appStoreVersions/${versionChirho.id}/appStoreVersionLocalizations`
		)
	);
	const imagesChirho = rowsChirho(
		await clientChirho.requestChirho(
			'GET',
			`/v1/appAssetLibraries/${appChirho.id}/images?limit=200`
		)
	);
	const receiptsChirho: unknown[] = [];
	for (const [languageChirho, localeChirho] of [
		['en', 'en-US'],
		['es', 'es-ES']
	] as const) {
		const localeRowChirho = localesChirho.find(
			(rowChirho) => rowChirho.attributes?.locale === localeChirho
		);
		if (!localeRowChirho) throw new Error('Prepare listing localizations first.');
		for (const deviceChirho of ['iphone-chirho', 'ipad-chirho']) {
			const groupChirho =
				deviceChirho === 'iphone-chirho'
					? 'IPHONE_DYNAMIC_ISLAND_MEDIUM_PROFILE'
					: 'IPAD_13_PROFILE';
			if (!groupsChirho.some((rowChirho) => rowChirho.placementProfileGroupId === groupChirho))
				throw new Error('Apple has no requested placement group: ' + groupChirho);
			const placementsChirho = rowsChirho(
				await clientChirho.requestChirho(
					'GET',
					`/v1/appStoreVersionLocalizations/${localeRowChirho.id}/placements?filter[placementType]=APP_SCREENSHOT&filter[placementGroup]=${groupChirho}&include=image&limit=100`
				)
			);
			const orderedChirho: { id: string; type: string }[] = [];
			const expectedChirho = manifestChirho.files_chirho
				.filter(
					(fileChirho) =>
						fileChirho.kind_chirho === 'screenshot' &&
						fileChirho.path_chirho.startsWith(
							`screenshots-chirho/${languageChirho}-chirho/${deviceChirho}/`
						)
				)
				.sort((leftChirho, rightChirho) =>
					leftChirho.path_chirho.localeCompare(rightChirho.path_chirho)
				);
			if (expectedChirho.length !== 6) throw new Error('Expected six checked screenshot files.');
			const ownedImageIdsChirho = new Set(
				imagesChirho
					.filter((imageChirho) =>
						expectedChirho.some(
							(fileChirho) =>
								imageChirho.attributes?.referenceName ===
								'hinneh-chirho-' + fileChirho.sha256_chirho
						)
					)
					.map((imageChirho) => imageChirho.id)
			);
			if (
				placementsChirho.length > 6 ||
				placementsChirho.some((placementChirho) => {
					const imageChirho = placementChirho.relationships?.image?.data;
					return (
						!imageChirho || Array.isArray(imageChirho) || !ownedImageIdsChirho.has(imageChirho.id)
					);
				})
			)
				throw new Error('Unexpected screenshot placements; preserve the existing set.');
			for (const fileChirho of expectedChirho) {
				if (fileChirho.path_chirho.includes('..')) throw new Error('Unsafe screenshot path.');
				const bytesChirho = await readFileChirho(
					resolveChirho(packageChirho, fileChirho.path_chirho)
				);
				if (
					createHashChirho('sha256').update(bytesChirho).digest('hex') !==
						fileChirho.sha256_chirho ||
					bytesChirho.length !== fileChirho.bytes_chirho ||
					bytesChirho[25] !== 2
				)
					throw new Error('Prepared screenshot differs from checked bytes.');
				const specChirho = specsChirho.find(
					(rowChirho) =>
						rowChirho.dimensions.minWidth === fileChirho.width_chirho &&
						rowChirho.dimensions.maxWidth === fileChirho.width_chirho &&
						rowChirho.dimensions.minHeight === fileChirho.height_chirho &&
						rowChirho.dimensions.maxHeight === fileChirho.height_chirho &&
						rowChirho.compatiblePlacementTypes.includes('APP_SCREENSHOT') &&
						!rowChirho.alphaAllowed
				);
				if (!specChirho)
					throw new Error('Screenshot not accepted by live Apple image specifications.');
				const nameChirho = 'hinneh-chirho-' + fileChirho.sha256_chirho;
				let imageChirho = imagesChirho.find(
					(rowChirho) => rowChirho.attributes?.referenceName === nameChirho
				);
				if (!imageChirho) {
					imageChirho = rowsChirho(
						await clientChirho.requestChirho('POST', '/v1/appAssetLibraryImages', {
							data: {
								type: 'appAssetLibraryImages',
								attributes: {
									fileName: `${languageChirho}-${deviceChirho}-${fileChirho.path_chirho.split('/').at(-1)}`,
									fileSize: bytesChirho.length,
									category: 'APP_SCREENSHOTS_AND_PREVIEWS',
									referenceName: nameChirho
								},
								relationships: { assetLibrary: relationChirho('appAssetLibraries', appChirho.id) }
							}
						})
					)[0];
					imagesChirho.push(imageChirho);
				}
				await saveChirho('media-reservations-chirho', {
					app_id_chirho: appChirho.id,
					images_chirho: imagesChirho.map((rowChirho) => ({
						id_chirho: rowChirho.id,
						reference_name_chirho: rowChirho.attributes?.referenceName
					}))
				});
				if (imageChirho.attributes?.state === 'AWAITING_UPLOAD') {
					// The existing content-addressed reservation is reused after interruption.
					const freshChirho = rowsChirho(
						await clientChirho.requestChirho('GET', `/v1/appAssetLibraryImages/${imageChirho.id}`)
					)[0];
					await uploadBytesChirho(
						freshChirho.attributes?.uploadOperations as UploadOperationChirho[],
						bytesChirho
					);
					imageChirho = rowsChirho(
						await clientChirho.requestChirho(
							'PATCH',
							`/v1/appAssetLibraryImages/${imageChirho.id}`,
							{
								data: {
									type: 'appAssetLibraryImages',
									id: imageChirho.id,
									attributes: { uploaded: true }
								}
							}
						)
					)[0];
				}
				let placementChirho = placementsChirho.find((rowChirho) => {
					const imageRelationChirho = rowChirho.relationships?.image?.data;
					return (
						imageRelationChirho &&
						!Array.isArray(imageRelationChirho) &&
						imageRelationChirho.id === imageChirho.id
					);
				});
				if (!placementChirho)
					placementChirho = rowsChirho(
						await clientChirho.requestChirho('POST', '/v1/appAssetLibraryPlacements', {
							data: {
								type: 'appAssetLibraryPlacements',
								attributes: { placementType: 'APP_SCREENSHOT', placementGroup: groupChirho },
								relationships: {
									image: relationChirho('appAssetLibraryImages', imageChirho.id),
									appStoreVersionLocalization: relationChirho(
										'appStoreVersionLocalizations',
										localeRowChirho.id
									)
								}
							}
						})
					)[0];
				orderedChirho.push({ id: placementChirho.id, type: 'appAssetLibraryPlacements' });
				receiptsChirho.push({
					path_chirho: fileChirho.path_chirho,
					sha256_chirho: fileChirho.sha256_chirho,
					image_id_chirho: imageChirho.id,
					placement_id_chirho: placementChirho.id,
					locale_chirho: localeChirho,
					group_chirho: groupChirho
				});
				await saveChirho('media-uploads-chirho', {
					at_chirho: new Date().toISOString(),
					app_id_chirho: appChirho.id,
					files_chirho: receiptsChirho
				});
				console.log(
					'Saved ' +
						localeChirho +
						' ' +
						deviceChirho +
						' ' +
						fileChirho.path_chirho.split('/').at(-1)
				);
			}
			if (placementsChirho.length > 6)
				throw new Error(
					'Unexpected existing screenshot placements; do not replace someone else’s set.'
				);
			await clientChirho.requestChirho('POST', '/v1/appAssetLibraryPlacementOrderingRequests', {
				data: {
					type: 'appAssetLibraryPlacementOrderingRequests',
					attributes: { placementGroup: groupChirho },
					relationships: {
						orderedPlacements: { data: orderedChirho },
						appStoreVersionLocalization: relationChirho(
							'appStoreVersionLocalizations',
							localeRowChirho.id
						)
					}
				}
			});
		}
	}
}
async function inspectChirho(clientChirho: AppleClientChirho): Promise<void> {
	const { appChirho, versionChirho, infoChirho } = await targetChirho(clientChirho);
	const resultChirho = {
		at_chirho: new Date().toISOString(),
		app_chirho: appChirho,
		version_chirho: versionChirho,
		info_chirho: infoChirho,
		app_locales_chirho: rowsChirho(
			await clientChirho.requestChirho('GET', `/v1/appInfos/${infoChirho.id}/appInfoLocalizations`)
		),
		version_locales_chirho: rowsChirho(
			await clientChirho.requestChirho(
				'GET',
				`/v1/appStoreVersions/${versionChirho.id}/appStoreVersionLocalizations`
			)
		),
		images_chirho: rowsChirho(
			await clientChirho.requestChirho(
				'GET',
				`/v1/appAssetLibraries/${appChirho.id}/images?limit=200`
			)
		).map((imageChirho) => ({
			id: imageChirho.id,
			type: imageChirho.type,
			attributes: Object.fromEntries(
				[
					'fileName',
					'fileSize',
					'referenceName',
					'state',
					'stateDetails',
					'imageAsset',
					'specId'
				].map((nameChirho) => [nameChirho, imageChirho.attributes?.[nameChirho]])
			)
		}))
	};
	await saveChirho('latest-app-chirho', resultChirho);
	console.log(
		JSON.stringify({
			app_id_chirho: appChirho.id,
			version_chirho: versionChirho.attributes,
			app_locales_chirho: resultChirho.app_locales_chirho.map(
				(rowChirho) => rowChirho.attributes?.locale
			),
			version_locales_chirho: resultChirho.version_locales_chirho.map(
				(rowChirho) => rowChirho.attributes?.locale
			),
			images_chirho: resultChirho.images_chirho.map((rowChirho) => ({
				id_chirho: rowChirho.id,
				state_chirho: rowChirho.attributes?.state,
				dimensions_chirho: rowChirho.attributes?.imageAsset
			}))
		})
	);
}
async function attachBuildChirho(
	clientChirho: AppleClientChirho,
	buildNumberChirho: string
): Promise<void> {
	if (!/^[1-9]\d{0,5}$/u.test(buildNumberChirho))
		throw new Error('Expected an explicit positive build number.');
	const { appChirho, versionChirho } = await targetChirho(clientChirho);
	if (versionChirho.attributes?.versionString !== '0.1') throw new Error('Expected version 0.1.');
	const responseChirho = await clientChirho.requestChirho(
		'GET',
		`/v1/builds?filter[app]=${appChirho.id}&include=preReleaseVersion&limit=10`
	);
	const buildsChirho = rowsChirho(responseChirho).filter((buildChirho) => {
		const relationshipChirho = buildChirho.relationships?.preReleaseVersion?.data;
		const parentChirho =
			relationshipChirho && !Array.isArray(relationshipChirho)
				? responseChirho.included?.find((recordChirho) => recordChirho.id === relationshipChirho.id)
				: null;
		return (
			buildChirho.attributes?.version === buildNumberChirho &&
			buildChirho.attributes?.processingState === 'VALID' &&
			buildChirho.attributes?.buildAudienceType === 'APP_STORE_ELIGIBLE' &&
			parentChirho?.attributes?.version === '0.1' &&
			parentChirho.attributes.platform === 'IOS'
		);
	});
	if (buildsChirho.length !== 1)
		throw new Error(
			'Expected exactly one valid matching version 0.1 build ' + buildNumberChirho + '.'
		);
	await clientChirho.requestChirho('PATCH', `/v1/appStoreVersions/${versionChirho.id}`, {
		data: {
			type: 'appStoreVersions',
			id: versionChirho.id,
			relationships: { build: relationChirho('builds', buildsChirho[0].id) }
		}
	});
	await saveChirho('attached-build-chirho', {
		at_chirho: new Date().toISOString(),
		app_id_chirho: appChirho.id,
		version_id_chirho: versionChirho.id,
		build_id_chirho: buildsChirho[0].id,
		build_number_chirho: buildNumberChirho,
		processing_state_chirho: 'VALID',
		submitted_chirho: false
	});
	console.log(
		'Valid signed build 0.1 (' + buildNumberChirho + ') attached to the draft; not submitted.'
	);
}
if (import.meta.main) {
	const modeChirho = process.argv[2];
	if (
		!['inspect-chirho', 'prepare-chirho', 'media-chirho', 'attach-build-chirho'].includes(
			modeChirho
		)
	)
		throw new Error('Use inspect-chirho|prepare-chirho|media-chirho|attach-build-chirho.');
	if (modeChirho !== 'inspect-chirho' && !process.argv.includes('--apply-chirho'))
		throw new Error('Mutation requires --apply-chirho.');
	const clientChirho = await AppleClientChirho.openChirho();
	if (modeChirho === 'prepare-chirho') await prepareChirho(clientChirho);
	else if (modeChirho === 'media-chirho') await mediaChirho(clientChirho);
	else if (modeChirho === 'attach-build-chirho') {
		const indexChirho = process.argv.indexOf('--build-chirho');
		await attachBuildChirho(
			clientChirho,
			indexChirho < 0 ? '1' : (process.argv[indexChirho + 1] ?? '')
		);
	} else await inspectChirho(clientChirho);
}
