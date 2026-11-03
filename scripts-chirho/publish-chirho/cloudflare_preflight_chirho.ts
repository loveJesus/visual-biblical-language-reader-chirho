// For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life. — John 3:16 (KJV)

// Read-only Cloudflare preflight for the Hinneh static release. Every request is a GET to an
// allowlisted API path; account and zone ids are redacted and credentials are never printed.
// Usage: bun scripts-chirho/publish-chirho/cloudflare_preflight_chirho.ts
// Exit 0: target free. Exit 3: something already claims the hostname or names. Exit 1: error.

export const API_ROOT_CHIRHO = 'https://api.cloudflare.com/client/v4';
export const ZONE_NAME_CHIRHO = 'bible.systems';
export const HOSTNAME_CHIRHO = 'hinneh.bible.systems';
export const WORKER_NAME_CHIRHO = 'hinneh-chirho';
export const MEDIA_BUCKET_CHIRHO = 'hinneh-media-chirho';

const ID_PATTERN_CHIRHO = '[0-9a-f]{32}';
const GET_PATHS_CHIRHO = [
	'/zones',
	`/zones/${ID_PATTERN_CHIRHO}/dns_records`,
	`/zones/${ID_PATTERN_CHIRHO}/workers/routes`,
	`/accounts/${ID_PATTERN_CHIRHO}/workers/domains`,
	`/accounts/${ID_PATTERN_CHIRHO}/workers/scripts`,
	`/accounts/${ID_PATTERN_CHIRHO}/r2/buckets`,
	`/accounts/${ID_PATTERN_CHIRHO}/r2/buckets/[a-z0-9][a-z0-9-]{1,61}[a-z0-9]`
].map((patternChirho) => new RegExp(`^${patternChirho}$`));

export type CredentialsChirho = { email_chirho: string; key_chirho: string };
export type FetchChirho = (urlChirho: URL, initChirho: RequestInit) => Promise<Response>;
type ZoneChirho = {
	id: string;
	status: string;
	paused: boolean;
	type: string;
	plan?: { name?: string };
	account: { id: string };
};
type RecordChirho = { name: string; type: string; proxied?: boolean };
type RouteChirho = { pattern: string; script?: string };
type DomainChirho = { hostname: string; service: string };
type ScriptChirho = { id: string };
type BucketsChirho = { buckets?: { name: string; creation_date?: string; location?: string }[] };

export function redactIdChirho(idChirho: string): string {
	return `…${idChirho.slice(-4)}`;
}

export async function cloudflareGetChirho<ResultChirho>(
	pathChirho: string,
	queryChirho: Record<string, string>,
	credentialsChirho: CredentialsChirho,
	fetchChirho: FetchChirho = fetch
): Promise<ResultChirho> {
	if (!GET_PATHS_CHIRHO.some((patternChirho) => patternChirho.test(pathChirho)))
		throw new Error(`Refusing a path outside the read-only allowlist: ${pathChirho}`);
	const urlChirho = new URL(`${API_ROOT_CHIRHO}${pathChirho}`);
	for (const [nameChirho, valueChirho] of Object.entries(queryChirho))
		urlChirho.searchParams.set(nameChirho, valueChirho);
	const responseChirho = await fetchChirho(urlChirho, {
		method: 'GET',
		redirect: 'error',
		headers: {
			'X-Auth-Email': credentialsChirho.email_chirho,
			'X-Auth-Key': credentialsChirho.key_chirho
		}
	});
	const bodyChirho = (await responseChirho.json()) as {
		success?: boolean;
		result?: ResultChirho;
		errors?: { code?: number }[];
	};
	if (!responseChirho.ok || !bodyChirho.success) {
		const codesChirho = (bodyChirho.errors ?? []).map((errorChirho) => errorChirho.code).join(',');
		const shownPathChirho = pathChirho.replace(new RegExp(ID_PATTERN_CHIRHO, 'g'), '<id>');
		throw new Error(
			`GET ${shownPathChirho} failed: HTTP ${responseChirho.status} [${codesChirho}]`
		);
	}
	return bodyChirho.result as ResultChirho;
}

/** True when a Workers route pattern such as `*bible.systems/*` would capture the hostname root. */
export function routeCapturesChirho(patternChirho: string, hostnameChirho: string): boolean {
	const slashChirho = patternChirho.indexOf('/');
	const hostGlobChirho = slashChirho < 0 ? patternChirho : patternChirho.slice(0, slashChirho);
	const pathGlobChirho = slashChirho < 0 ? '/*' : patternChirho.slice(slashChirho);
	const globChirho = (textChirho: string) =>
		new RegExp(
			`^${textChirho
				.split('*')
				.map((partChirho) => partChirho.replace(/[.+?^${}()|[\]\\]/g, '\\$&'))
				.join('.*')}$`
		);
	return globChirho(hostGlobChirho).test(hostnameChirho) && globChirho(pathGlobChirho).test('/');
}

function requireEnvChirho(nameChirho: string): string {
	const valueChirho = process.env[nameChirho];
	if (!valueChirho) throw new Error(`Missing ${nameChirho} in the ignored .env.`);
	return valueChirho;
}

async function mainChirho(): Promise<number> {
	const credentialsChirho = {
		email_chirho: requireEnvChirho('CLOUDFLARE_GLOBAL_API_EMAIL_CHIRHO'),
		key_chirho: requireEnvChirho('CLOUDFLARE_GLOBAL_API_KEY_CHIRHO')
	};
	const getChirho = <ResultChirho>(pathChirho: string, queryChirho: Record<string, string> = {}) =>
		cloudflareGetChirho<ResultChirho>(pathChirho, queryChirho, credentialsChirho);
	const zonesChirho = await getChirho<ZoneChirho[]>('/zones', { name: ZONE_NAME_CHIRHO });
	if (zonesChirho.length !== 1) throw new Error(`Expected one ${ZONE_NAME_CHIRHO} zone.`);
	const zoneChirho = zonesChirho[0];
	const accountChirho = zoneChirho.account.id;
	const [
		hostRecordsChirho,
		recordsChirho,
		routesChirho,
		domainsChirho,
		scriptsChirho,
		bucketsChirho
	] = await Promise.all([
		getChirho<RecordChirho[]>(`/zones/${zoneChirho.id}/dns_records`, { name: HOSTNAME_CHIRHO }),
		getChirho<RecordChirho[]>(`/zones/${zoneChirho.id}/dns_records`, { per_page: '1000' }),
		getChirho<RouteChirho[]>(`/zones/${zoneChirho.id}/workers/routes`),
		getChirho<DomainChirho[]>(`/accounts/${accountChirho}/workers/domains`, {
			zone_name: ZONE_NAME_CHIRHO
		}),
		getChirho<ScriptChirho[]>(`/accounts/${accountChirho}/workers/scripts`),
		getChirho<BucketsChirho>(`/accounts/${accountChirho}/r2/buckets`, { per_page: '1000' })
	]);
	const capturingRoutesChirho = routesChirho.filter((routeChirho) =>
		routeCapturesChirho(routeChirho.pattern, HOSTNAME_CHIRHO)
	);
	const hostDomainsChirho = domainsChirho.filter(
		(domainChirho) => domainChirho.hostname === HOSTNAME_CHIRHO
	);
	const workerTakenChirho = scriptsChirho.some(
		(scriptChirho) => scriptChirho.id === WORKER_NAME_CHIRHO
	);
	const bucketNamesChirho = (bucketsChirho.buckets ?? [])
		.map((bucketChirho) => bucketChirho.name)
		.sort();
	const mainAccountChirho =
		process.env.CLOUDFLARE_GLOBAL_API_MAIN_ACCOUNT_ID_CHIRHO === accountChirho;
	const linesChirho = [
		`Zone ${ZONE_NAME_CHIRHO}: ${zoneChirho.status}${zoneChirho.paused ? ' (paused)' : ''}, ${zoneChirho.type} setup, plan ${zoneChirho.plan?.name ?? 'unknown'}, zone ${redactIdChirho(zoneChirho.id)}, account ${redactIdChirho(accountChirho)} (${mainAccountChirho ? 'the .env main account' : 'NOT the .env main account'}).`,
		`DNS records on the zone: ${recordsChirho.length}${recordsChirho.length >= 1000 ? '+ (truncated)' : ''}; wildcard records: ${recordsChirho.filter((recordChirho) => recordChirho.name.startsWith('*')).length}; hinneh-named records: ${recordsChirho.filter((recordChirho) => recordChirho.name.includes('hinneh')).length}.`,
		`Worker custom domains on the zone: ${
			domainsChirho
				.map((domainChirho) => `${domainChirho.hostname} -> ${domainChirho.service}`)
				.sort()
				.join('; ') || 'none'
		}`,
		`Zone Worker routes: ${
			routesChirho
				.map((routeChirho) => `${routeChirho.pattern} -> ${routeChirho.script ?? '(none)'}`)
				.sort()
				.join('; ') || 'none'
		}`,
		`${HOSTNAME_CHIRHO}: ${hostRecordsChirho.length} DNS record(s), ${hostDomainsChirho.length} Worker custom domain(s), ${capturingRoutesChirho.length} capturing route(s).`,
		`Worker name ${WORKER_NAME_CHIRHO}: ${workerTakenChirho ? 'ALREADY EXISTS' : 'free'} (${scriptsChirho.length} scripts in the account).`,
		`R2 buckets in the account: ${bucketNamesChirho.length}; ${MEDIA_BUCKET_CHIRHO} ${bucketNamesChirho.includes(MEDIA_BUCKET_CHIRHO) ? 'exists' : 'absent'}; related names: ${bucketNamesChirho.filter((nameChirho) => /hinneh|bible|lexicon/.test(nameChirho)).join(', ') || 'none'}.`
	];
	console.log(linesChirho.join('\n'));
	const conflictChirho =
		hostRecordsChirho.length > 0 ||
		hostDomainsChirho.length > 0 ||
		capturingRoutesChirho.length > 0 ||
		workerTakenChirho;
	console.log(conflictChirho ? 'Target is NOT free.' : 'Target is free (read-only check).');
	return conflictChirho ? 3 : 0;
}

if (import.meta.main) {
	process.exitCode = await mainChirho().catch((errorChirho: unknown) => {
		console.error(errorChirho instanceof Error ? errorChirho.message : 'Preflight failed.');
		return 1;
	});
}
