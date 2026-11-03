// For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life. — John 3:16 (KJV)
// Workflow: spec-chirho/workflows-chirho/hosting-chirho/domain-chirho.md.
// Only hinneh.us in the existing main account. Reads by default; no purchase or credential changes.
import { mkdir as mkdirChirho, writeFile as writeFileChirho } from 'node:fs/promises';
import { isDeepStrictEqual as sameValueChirho } from 'node:util';

const DOMAIN_CHIRHO = 'hinneh.us';
const FOLDER_CHIRHO = 'workspace-chirho/domain-chirho/2026-11-02-chirho';
type RecordChirho = Record<string, unknown>;
interface ZoneChirho {
	id: string;
	name: string;
	status: string;
	name_servers: string[];
	plan?: { name?: string };
}
interface DnsChirho {
	id: string;
	type: string;
	name: string;
	content: string;
	ttl: string;
}
function requiredChirho(nameChirho: string): string {
	const valueChirho = process.env[nameChirho];
	if (!valueChirho) throw new Error(`Missing ${nameChirho}`);
	return valueChirho;
}
const accountChirho = requiredChirho('CLOUDFLARE_GLOBAL_API_MAIN_ACCOUNT_ID_CHIRHO');
const cfHeadersChirho = {
	'X-Auth-Key': requiredChirho('CLOUDFLARE_GLOBAL_API_KEY_CHIRHO'),
	'X-Auth-Email': requiredChirho('CLOUDFLARE_GLOBAL_API_EMAIL_CHIRHO'),
	'Content-Type': 'application/json'
};
const porkHeadersChirho = {
	'X-API-Key': requiredChirho('PORKBUN_API_KEY_CHIRHO'),
	'X-Secret-API-Key': requiredChirho('PORKBUN_SECRET_API_KEY_CHIRHO'),
	'Content-Type': 'application/json'
};

async function requestChirho(
	providerChirho: 'cloudflare' | 'porkbun',
	pathChirho: string,
	methodChirho = 'GET',
	bodyChirho?: unknown
): Promise<RecordChirho> {
	const responseChirho = await fetch(
		(providerChirho === 'cloudflare'
			? 'https://api.cloudflare.com/client/v4'
			: 'https://api.porkbun.com/api/json/v3') + pathChirho,
		{
			method: methodChirho,
			headers: providerChirho === 'cloudflare' ? cfHeadersChirho : porkHeadersChirho,
			...(bodyChirho === undefined ? {} : { body: JSON.stringify(bodyChirho) }),
			redirect: 'error',
			signal: AbortSignal.timeout(30000)
		}
	);
	const bytesChirho = new Uint8Array(await responseChirho.arrayBuffer());
	if (bytesChirho.length > 2_000_000) throw new Error('Domain response exceeded its bound');
	const valueChirho = JSON.parse(new TextDecoder().decode(bytesChirho)) as RecordChirho;
	if (
		!responseChirho.ok ||
		(providerChirho === 'cloudflare'
			? valueChirho.success !== true
			: valueChirho.status !== 'SUCCESS')
	) {
		// Never echo provider messages, headers, credential-bearing bodies or account contacts.
		const codesChirho =
			providerChirho === 'cloudflare'
				? (valueChirho.errors as { code?: number }[] | undefined)
						?.map((itemChirho) => itemChirho.code)
						.join(',')
				: valueChirho.code;
		throw new Error(
			`${providerChirho} ${methodChirho} ${pathChirho.split('?')[0]} refused: HTTP ${responseChirho.status}; code ${String(codesChirho ?? 'unspecified')}`
		);
	}
	return valueChirho;
}

async function zoneChirho(): Promise<ZoneChirho | null> {
	const valueChirho = await requestChirho(
		'cloudflare',
		`/zones?name=${DOMAIN_CHIRHO}&account.id=${accountChirho}`
	);
	const zonesChirho = valueChirho.result as ZoneChirho[];
	if (
		!Array.isArray(zonesChirho) ||
		zonesChirho.length > 1 ||
		zonesChirho.some((entryChirho) => entryChirho.name !== DOMAIN_CHIRHO)
	)
		throw new Error('Ambiguous domain zone');
	return zonesChirho[0] ?? null;
}
function sameNsChirho(leftChirho: string[], rightChirho: string[]): boolean {
	return [...leftChirho].sort().join('\n') === [...rightChirho].sort().join('\n');
}
async function evidenceChirho(nameChirho: string, valueChirho: unknown, exclusiveChirho = false) {
	await mkdirChirho(FOLDER_CHIRHO, { recursive: true });
	try {
		await writeFileChirho(
			`${FOLDER_CHIRHO}/${nameChirho}-chirho.json`,
			JSON.stringify(valueChirho, null, '\t') + '\n',
			{ flag: exclusiveChirho ? 'wx' : 'w', mode: 0o600 }
		);
	} catch (errorChirho) {
		if (!exclusiveChirho || (errorChirho as NodeJS.ErrnoException).code !== 'EEXIST')
			throw errorChirho;
	}
}

async function configureWebChirho(currentZoneChirho: ZoneChirho | null) {
	if (currentZoneChirho?.status !== 'active' || currentZoneChirho.plan?.name !== 'Free Website')
		throw new Error('Web configuration needs the active Free hinneh.us zone');
	const prefixChirho = `/zones/${currentZoneChirho.id}`;
	const desiredRuleChirho = {
		ref: 'hinneh_www_to_apex_chirho',
		description: 'Hinneh www to canonical apex',
		expression: '(http.host eq "www.hinneh.us")',
		action: 'redirect',
		enabled: true,
		action_parameters: {
			from_value: {
				target_url: { expression: 'concat("https://hinneh.us", http.request.uri.path)' },
				status_code: 308,
				preserve_query_string: true
			}
		}
	};
	const inventoryChirho = await requestChirho('cloudflare', `${prefixChirho}/rulesets`);
	const matchingChirho = (inventoryChirho.result as RecordChirho[]).filter(
		(itemChirho) =>
			itemChirho.phase === 'http_request_dynamic_redirect' && itemChirho.kind === 'zone'
	);
	if (matchingChirho.length > 1) throw new Error('Ambiguous redirect entrypoint');
	let rulesetChirho: RecordChirho;
	if (matchingChirho.length === 0) {
		rulesetChirho = (
			await requestChirho('cloudflare', `${prefixChirho}/rulesets`, 'POST', {
				name: 'hinneh-redirects-chirho',
				kind: 'zone',
				phase: 'http_request_dynamic_redirect',
				rules: [desiredRuleChirho]
			})
		).result as RecordChirho;
	} else {
		rulesetChirho = (
			await requestChirho('cloudflare', `${prefixChirho}/rulesets/${matchingChirho[0].id}`)
		).result as RecordChirho;
		const rulesChirho = rulesetChirho.rules as RecordChirho[];
		if (rulesChirho.length !== 1 || rulesChirho[0].ref !== desiredRuleChirho.ref)
			throw new Error('Unexpected existing redirect rules; no replacement attempted');
	}
	const verifiedRulesetChirho = (
		await requestChirho('cloudflare', `${prefixChirho}/rulesets/${rulesetChirho.id}`)
	).result as RecordChirho;
	const verifiedRulesChirho = verifiedRulesetChirho.rules as RecordChirho[];
	if (
		verifiedRulesChirho.length !== 1 ||
		Object.entries(desiredRuleChirho).some(
			([keyChirho, valueChirho]) => !sameValueChirho(verifiedRulesChirho[0][keyChirho], valueChirho)
		)
	)
		throw new Error('Redirect readback differs; reconcile before another write');
	const dnsPathChirho = `${prefixChirho}/dns_records?name=www.${DOMAIN_CHIRHO}`;
	const recordsChirho = (await requestChirho('cloudflare', dnsPathChirho)).result as RecordChirho[];
	if (recordsChirho.length === 0) {
		await requestChirho('cloudflare', `${prefixChirho}/dns_records`, 'POST', {
			type: 'CNAME',
			name: `www.${DOMAIN_CHIRHO}`,
			content: DOMAIN_CHIRHO,
			proxied: true,
			ttl: 1,
			comment: 'Hinneh canonical redirect; domain-chirho workflow'
		});
	}
	const verifiedDnsChirho = (await requestChirho('cloudflare', dnsPathChirho))
		.result as RecordChirho[];
	if (
		verifiedDnsChirho.length !== 1 ||
		verifiedDnsChirho[0].type !== 'CNAME' ||
		verifiedDnsChirho[0].content !== DOMAIN_CHIRHO ||
		verifiedDnsChirho[0].proxied !== true
	)
		throw new Error('Unexpected www DNS; no replacement attempted');
	await evidenceChirho('06-web-configured', {
		at_chirho: new Date().toISOString(),
		domain_chirho: DOMAIN_CHIRHO,
		zone_status_chirho: currentZoneChirho.status,
		ruleset_chirho: verifiedRulesetChirho,
		www_dns_chirho: verifiedDnsChirho
	});
}

async function mainChirho() {
	const argumentsChirho = process.argv.slice(2);
	const allowedChirho = new Set([
		'--prepare-zone-chirho',
		'--delegate-chirho',
		'--web-chirho',
		'--apply-chirho',
		'--confirm-chirho',
		DOMAIN_CHIRHO
	]);
	if (argumentsChirho.some((argumentChirho) => !allowedChirho.has(argumentChirho)))
		throw new Error('Unknown domain flag');
	const applyChirho = argumentsChirho.includes('--apply-chirho');
	const confirmationChirho = argumentsChirho.indexOf('--confirm-chirho');
	if (
		applyChirho &&
		(confirmationChirho < 0 || argumentsChirho[confirmationChirho + 1] !== DOMAIN_CHIRHO)
	)
		throw new Error('Apply needs --confirm-chirho hinneh.us');
	const registrarChirho = await requestChirho('porkbun', `/domain/getNs/${DOMAIN_CHIRHO}`);
	let nsChirho = registrarChirho.ns as string[];
	if (
		!Array.isArray(nsChirho) ||
		nsChirho.length < 2 ||
		nsChirho.some((valueChirho) => typeof valueChirho !== 'string')
	)
		throw new Error('Invalid registrar nameservers');
	const dnssecChirho = await requestChirho('porkbun', `/dns/getDnssecRecords/${DOMAIN_CHIRHO}`);
	const dnsChirho = await requestChirho('porkbun', `/dns/retrieve/${DOMAIN_CHIRHO}`);
	const recordsChirho = dnsChirho.records as DnsChirho[];
	if (!Array.isArray(recordsChirho) || recordsChirho.length > 1000)
		throw new Error('Invalid registrar DNS inventory');
	let currentZoneChirho = await zoneChirho();
	await evidenceChirho(
		'01-before',
		{
			at_chirho: new Date().toISOString(),
			domain_chirho: DOMAIN_CHIRHO,
			registrar_nameservers_chirho: nsChirho,
			dnssec_records_chirho: dnssecChirho.records,
			registrar_dns_chirho: recordsChirho.map((recordChirho) => ({
				id_chirho: recordChirho.id,
				type_chirho: recordChirho.type,
				name_chirho: recordChirho.name,
				content_chirho: recordChirho.content,
				ttl_chirho: recordChirho.ttl
			})),
			zone_chirho: currentZoneChirho
				? {
						id_chirho: currentZoneChirho.id,
						status_chirho: currentZoneChirho.status,
						nameservers_chirho: currentZoneChirho.name_servers
					}
				: null
		},
		true
	);
	if (argumentsChirho.includes('--prepare-zone-chirho') && applyChirho) {
		if (!currentZoneChirho) {
			await evidenceChirho(
				'02-zone-requested',
				{
					at_chirho: new Date().toISOString(),
					domain_chirho: DOMAIN_CHIRHO,
					account_suffix_chirho: accountChirho.slice(-4)
				},
				true
			);
			await requestChirho('cloudflare', '/zones', 'POST', {
				name: DOMAIN_CHIRHO,
				account: { id: accountChirho },
				type: 'full'
			});
			currentZoneChirho = await zoneChirho();
		}
		if (!currentZoneChirho || currentZoneChirho.plan?.name !== 'Free Website')
			throw new Error('Expected a Free domain zone; no paid plan is authorized');
		for (const [settingChirho, valueChirho] of [
			['always_use_https', 'on'],
			['min_tls_version', '1.2']
		] as const) {
			const pathChirho = `/zones/${currentZoneChirho.id}/settings/${settingChirho}`;
			const previousChirho = await requestChirho('cloudflare', pathChirho);
			if ((previousChirho.result as RecordChirho).value !== valueChirho)
				await requestChirho('cloudflare', pathChirho, 'PATCH', { value: valueChirho });
		}
		await evidenceChirho('03-zone-prepared', {
			at_chirho: new Date().toISOString(),
			id_chirho: currentZoneChirho.id,
			domain_chirho: currentZoneChirho.name,
			nameservers_chirho: currentZoneChirho.name_servers,
			plan_chirho: currentZoneChirho.plan?.name
		});
	}
	if (argumentsChirho.includes('--delegate-chirho') && applyChirho) {
		if (
			!currentZoneChirho ||
			currentZoneChirho.plan?.name !== 'Free Website' ||
			currentZoneChirho.name_servers.length !== 2 ||
			currentZoneChirho.name_servers.some(
				(valueChirho) => !/^[a-z0-9-]+\.ns\.cloudflare\.com$/.test(valueChirho)
			)
		)
			throw new Error('Verified Free target zone is required');
		if (
			dnssecChirho.records !== null &&
			(!Array.isArray(dnssecChirho.records) || dnssecChirho.records.length > 0)
		)
			throw new Error('Existing DNSSEC needs a separate preserved migration');
		if (!sameNsChirho(nsChirho, currentZoneChirho.name_servers)) {
			if (!nsChirho.every((valueChirho) => /^[a-z0-9-]+\.ns\.porkbun\.com$/.test(valueChirho)))
				throw new Error('Registrar delegation differs from the observed parking setup');
			if (
				recordsChirho.some(
					(recordChirho) =>
						!(
							recordChirho.type === 'NS' ||
							(['ALIAS', 'CNAME'].includes(recordChirho.type) &&
								recordChirho.content === 'pixie.porkbun.com' &&
								[DOMAIN_CHIRHO, `*.${DOMAIN_CHIRHO}`].includes(recordChirho.name))
						)
				)
			)
				throw new Error('Non-parking DNS must be preserved before delegation');
			await evidenceChirho(
				'04-delegation-requested',
				{
					at_chirho: new Date().toISOString(),
					before_chirho: nsChirho,
					after_chirho: currentZoneChirho.name_servers
				},
				true
			);
			await requestChirho('porkbun', `/domain/updateNs/${DOMAIN_CHIRHO}`, 'POST', {
				ns: currentZoneChirho.name_servers
			});
		}
		const readbackChirho = await requestChirho('porkbun', `/domain/getNs/${DOMAIN_CHIRHO}`);
		if (!sameNsChirho(readbackChirho.ns as string[], currentZoneChirho.name_servers))
			throw new Error('Registrar readback differs; reconcile before another write');
		nsChirho = readbackChirho.ns as string[];
		await evidenceChirho('05-delegated', {
			at_chirho: new Date().toISOString(),
			domain_chirho: DOMAIN_CHIRHO,
			nameservers_chirho: readbackChirho.ns,
			registrar_request_id_chirho: readbackChirho.requestId
		});
		await requestChirho('cloudflare', `/zones/${currentZoneChirho.id}/activation_check`, 'PUT');
	}
	currentZoneChirho = await zoneChirho();
	if (argumentsChirho.includes('--web-chirho') && applyChirho)
		await configureWebChirho(currentZoneChirho);
	console.log(
		JSON.stringify({
			domain_chirho: DOMAIN_CHIRHO,
			mode_chirho: applyChirho ? 'apply' : 'read_only',
			zone_chirho: currentZoneChirho
				? {
						id_chirho: currentZoneChirho.id,
						status_chirho: currentZoneChirho.status,
						nameservers_chirho: currentZoneChirho.name_servers,
						plan_chirho: currentZoneChirho.plan?.name
					}
				: null,
			registrar_nameservers_chirho: nsChirho
		})
	);
}

if (import.meta.main) await mainChirho();
