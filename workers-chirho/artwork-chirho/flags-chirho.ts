// For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life. — John 3:16 (KJV)
// Workflow: image flags -> challenged, deduplicated private queue -> owner review, never generation.
import type {
	MediaCatalogueChirho,
	WorkerEnvironmentChirho,
	ExecutionChirho,
	DependenciesChirho
} from './types-chirho';
import {
	consumeRateChirho,
	jsonChirho,
	readBodyChirho,
	requestRefusalChirho,
	verifyChallengeChirho
} from './intake-chirho';
export const FLAG_ACTION_CHIRHO = 'image_artifact_chirho';
const REASONS_CHIRHO = new Set(['anatomy', 'unreadable_detail', 'other_visual_artifact']);
// Allow the provider's full 2048-character token plus bounded image/verse metadata.
const MAX_BODY_CHIRHO = 4096;
const RATE_CHIRHO = 20;
export async function flagResponseChirho(
	requestChirho: Request,
	catalogueChirho: MediaCatalogueChirho,
	environmentChirho: WorkerEnvironmentChirho,
	contextChirho: ExecutionChirho,
	dependenciesChirho: DependenciesChirho
) {
	const refusalChirho = requestRefusalChirho(
		requestChirho,
		catalogueChirho.hostnames_chirho ?? [catalogueChirho.hostname_chirho]
	);
	if (refusalChirho) return refusalChirho;
	const expectedHostnameChirho = new URL(requestChirho.url).hostname;
	let inputChirho;
	try {
		inputChirho = (await readBodyChirho(requestChirho, MAX_BODY_CHIRHO)) as Record<
			string,
			unknown
		> | null;
	} catch {
		return jsonChirho({ error_chirho: 'invalid_body' }, 400);
	}
	if (!inputChirho || typeof inputChirho !== 'object' || Array.isArray(inputChirho))
		return jsonChirho({ error_chirho: 'invalid_body' }, 400);
	const factChirho =
		typeof inputChirho.asset_path_chirho === 'string' &&
		Object.hasOwn(catalogueChirho.assets_chirho, inputChirho.asset_path_chirho)
			? catalogueChirho.assets_chirho[inputChirho.asset_path_chirho]
			: undefined;
	if (
		!factChirho ||
		typeof inputChirho.sha256_chirho !== 'string' ||
		!/^[a-f0-9]{64}$/.test(inputChirho.sha256_chirho) ||
		factChirho.sha256_chirho !== inputChirho.sha256_chirho ||
		typeof inputChirho.verse_id_chirho !== 'string' ||
		!Object.hasOwn(catalogueChirho.verses_chirho, inputChirho.verse_id_chirho) ||
		catalogueChirho.verses_chirho[inputChirho.verse_id_chirho] !== true ||
		typeof inputChirho.reason_chirho !== 'string' ||
		!REASONS_CHIRHO.has(inputChirho.reason_chirho) ||
		typeof inputChirho.turnstile_token_chirho !== 'string' ||
		!inputChirho.turnstile_token_chirho ||
		inputChirho.turnstile_token_chirho.length > 2048 ||
		Object.keys(inputChirho).some(
			(keyChirho) =>
				![
					'asset_path_chirho',
					'sha256_chirho',
					'verse_id_chirho',
					'reason_chirho',
					'turnstile_token_chirho'
				].includes(keyChirho)
		)
	)
		return jsonChirho({ error_chirho: 'invalid_report' }, 400);
	if (
		!environmentChirho.TURNSTILE_SECRET_KEY_CHIRHO ||
		!environmentChirho.ARTIFACT_RATE_SECRET_CHIRHO ||
		!catalogueChirho.sitekey_chirho
	)
		return jsonChirho(
			{ error_chirho: 'temporarily_unavailable', stage_chirho: 'configuration' },
			503
		);
	let stageChirho = 'edge_rate';
	try {
		const ipChirho = requestChirho.headers.get('cf-connecting-ip');
		if (!ipChirho) return jsonChirho({ error_chirho: 'temporarily_unavailable' }, 503);
		if (
			!(await consumeRateChirho(
				'internal-artifact-rate-chirho',
				ipChirho,
				environmentChirho.ARTIFACT_RATE_SECRET_CHIRHO,
				RATE_CHIRHO,
				dependenciesChirho
			))
		)
			return jsonChirho({ error_chirho: 'rate_limited' }, 429);
		stageChirho = 'challenge';
		const challengeChirho = await verifyChallengeChirho(
			inputChirho.turnstile_token_chirho,
			environmentChirho.TURNSTILE_SECRET_KEY_CHIRHO,
			expectedHostnameChirho,
			FLAG_ACTION_CHIRHO,
			dependenciesChirho
		);
		if (challengeChirho === 'unavailable')
			return jsonChirho({ error_chirho: 'challenge_unavailable' }, 503);
		if (challengeChirho === 'failed') return jsonChirho({ error_chirho: 'challenge_failed' }, 400);
		const queuedKeyChirho = new Request(
			`https://hinneh.bible.systems/internal-artifact-queued-chirho/${factChirho.sha256_chirho}`
		);
		if (await dependenciesChirho.cache_chirho.match(queuedKeyChirho))
			return jsonChirho({ queued_chirho: true, duplicate_chirho: true }, 202);
		stageChirho = 'queue';
		const objectKeyChirho = `artifact-flags-chirho/open-chirho/${factChirho.sha256_chirho}.json`;
		let duplicateChirho = !!(await environmentChirho.HINNEH_MEDIA_CHIRHO.head(objectKeyChirho));
		if (!duplicateChirho) {
			const recordChirho = {
				schema_version_chirho: 1,
				image_sha256_chirho: factChirho.sha256_chirho,
				asset_path_chirho: inputChirho.asset_path_chirho,
				reported_verse_id_chirho: inputChirho.verse_id_chirho,
				reason_chirho: inputChirho.reason_chirho,
				state_chirho: 'awaiting_owner_review',
				created_at_chirho: new Date(dependenciesChirho.now_chirho()).toISOString()
			};
			const storedChirho = await environmentChirho.HINNEH_MEDIA_CHIRHO.put(
				objectKeyChirho,
				JSON.stringify(recordChirho),
				{
					onlyIf: { etagDoesNotMatch: '*' },
					httpMetadata: { contentType: 'application/json', cacheControl: 'no-store' }
				}
			);
			duplicateChirho = storedChirho === null;
		}
		contextChirho.waitUntil(
			dependenciesChirho.cache_chirho
				.put(
					queuedKeyChirho,
					new Response('queued', { headers: { 'Cache-Control': 'max-age=86400' } })
				)
				.catch(() => undefined)
		);
		return jsonChirho({ queued_chirho: true, duplicate_chirho: duplicateChirho }, 202);
	} catch {
		return jsonChirho({ error_chirho: 'temporarily_unavailable', stage_chirho: stageChirho }, 503);
	}
}
