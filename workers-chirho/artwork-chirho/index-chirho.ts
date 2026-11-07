// For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life. — John 3:16 (KJV)
import type {
	MediaCatalogueChirho,
	WorkerEnvironmentChirho,
	ExecutionChirho,
	DependenciesChirho,
	EdgeCacheChirho
} from './types-chirho';
import { artworkResponseChirho } from './artwork-chirho';
import { videoResponseChirho } from './video-chirho';
import { flagResponseChirho } from './flags-chirho';
import { contactResponseChirho } from './contact-chirho';
import { isSiteHostnameChirho } from '../../src/lib/site-chirho';
import { CONTACT_PATH_CHIRHO } from '../../src/lib/site-chirho/contact-chirho/contact-contract-chirho';
export function createArtworkWorkerChirho(
	catalogueChirho: MediaCatalogueChirho,
	overrideChirho?: Partial<DependenciesChirho>
) {
	if (
		catalogueChirho.schema_version_chirho !== 1 ||
		!isSiteHostnameChirho(catalogueChirho.hostname_chirho) ||
		(catalogueChirho.hostnames_chirho !== undefined &&
			(catalogueChirho.hostnames_chirho.length < 1 ||
				!catalogueChirho.hostnames_chirho.includes(catalogueChirho.hostname_chirho) ||
				catalogueChirho.hostnames_chirho.some(
					(hostnameChirho) => !isSiteHostnameChirho(hostnameChirho)
				)))
	)
		throw new Error('Worker catalogue scope differs');
	return {
		async fetch(
			requestChirho: Request,
			environmentChirho: WorkerEnvironmentChirho,
			contextChirho: ExecutionChirho
		) {
			const pathChirho = new URL(requestChirho.url).pathname;
			const dependenciesChirho: DependenciesChirho = {
				cache_chirho:
					overrideChirho?.cache_chirho ??
					(caches as unknown as { default: EdgeCacheChirho }).default,
				fetch_chirho: overrideChirho?.fetch_chirho ?? globalThis.fetch.bind(globalThis),
				now_chirho: overrideChirho?.now_chirho ?? Date.now
			};
			if (pathChirho.startsWith('/video-chirho/')) {
				const matchChirho = /^\/video-chirho\/sha256-chirho\/([a-f0-9]{64})-chirho\.mp4$/.exec(
					pathChirho
				);
				const shaChirho = matchChirho?.[1] ?? '';
				const bytesChirho =
					catalogueChirho.video_chirho && Object.hasOwn(catalogueChirho.video_chirho, shaChirho)
						? catalogueChirho.video_chirho[shaChirho]
						: undefined;
				return bytesChirho === undefined
					? new Response(null, { status: 404 })
					: videoResponseChirho(
							requestChirho,
							shaChirho,
							bytesChirho,
							environmentChirho,
							contextChirho,
							dependenciesChirho
						);
			}
			if (pathChirho.startsWith('/audio-chirho/sha256-chirho/')) {
				const matchChirho = /^\/audio-chirho\/sha256-chirho\/([a-f0-9]{64})-chirho\.mp3$/u.exec(
					pathChirho
				);
				const shaChirho = matchChirho?.[1] ?? '';
				const bytesChirho =
					catalogueChirho.audio_chirho && Object.hasOwn(catalogueChirho.audio_chirho, shaChirho)
						? catalogueChirho.audio_chirho[shaChirho]
						: undefined;
				return bytesChirho === undefined
					? new Response(null, { status: 404 })
					: artworkResponseChirho(
							requestChirho,
							{
								sha256_chirho: shaChirho,
								bytes_chirho: bytesChirho,
								key_chirho: 'audio-chirho/sha256-chirho/' + shaChirho + '.mp3'
							},
							environmentChirho,
							contextChirho,
							dependenciesChirho,
							true
						);
			}
			if (pathChirho.startsWith('/assets-chirho/')) {
				const factChirho = Object.hasOwn(catalogueChirho.assets_chirho, pathChirho)
					? catalogueChirho.assets_chirho[pathChirho]
					: undefined;
				return factChirho
					? artworkResponseChirho(
							requestChirho,
							factChirho,
							environmentChirho,
							contextChirho,
							dependenciesChirho
						)
					: new Response(null, { status: 404 });
			}
			if (pathChirho === '/api-chirho/artifact-flags-chirho')
				return flagResponseChirho(
					requestChirho,
					catalogueChirho,
					environmentChirho,
					contextChirho,
					dependenciesChirho
				);
			if (pathChirho === CONTACT_PATH_CHIRHO)
				return contactResponseChirho(
					requestChirho,
					catalogueChirho,
					environmentChirho,
					dependenciesChirho
				);
			if (pathChirho.startsWith('/api-chirho/')) return new Response(null, { status: 404 });
			return environmentChirho.ASSETS_CHIRHO.fetch(requestChirho);
		}
	};
}
