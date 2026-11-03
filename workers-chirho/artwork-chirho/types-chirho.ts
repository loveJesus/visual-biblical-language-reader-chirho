// For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life. — John 3:16 (KJV)
export interface MediaFactChirho {
	format_chirho?: 'webp' | 'jpeg';
	sha256_chirho: string;
	key_chirho: string;
	bytes_chirho: number;
	width_chirho: number;
	height_chirho: number;
}
export interface MediaCatalogueChirho {
	schema_version_chirho: 1;
	assets_chirho: Record<string, MediaFactChirho>;
	audio_chirho?: Record<string, number>;
	verses_chirho: Record<string, true>;
	hostname_chirho: string;
	hostnames_chirho?: readonly string[];
	sitekey_chirho: string;
}
export interface BucketObjectChirho {
	body: ReadableStream<Uint8Array>;
	size: number;
}
export interface BucketChirho {
	get(keyChirho: string): Promise<BucketObjectChirho | null>;
	head(keyChirho: string): Promise<{ size: number } | null>;
	put(
		keyChirho: string,
		valueChirho: string,
		optionsChirho: {
			onlyIf: { etagDoesNotMatch: string };
			httpMetadata: { contentType: string; cacheControl: string };
		}
	): Promise<unknown>;
}
export interface EdgeCacheChirho {
	match(requestChirho: Request): Promise<Response | undefined>;
	put(requestChirho: Request, responseChirho: Response): Promise<void>;
}
export interface WorkerEnvironmentChirho {
	ASSETS_CHIRHO: { fetch(requestChirho: Request): Promise<Response> };
	HINNEH_MEDIA_CHIRHO: BucketChirho;
	TURNSTILE_SECRET_KEY_CHIRHO?: string;
	ARTIFACT_RATE_SECRET_CHIRHO?: string;
}
export interface ExecutionChirho {
	waitUntil(promiseChirho: Promise<unknown>): void;
}
export interface DependenciesChirho {
	cache_chirho: EdgeCacheChirho;
	fetch_chirho: typeof fetch;
	now_chirho: () => number;
}
