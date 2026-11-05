// For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life. — John 3:16 (KJV)
import { randomBytes as randomBytesChirho } from 'node:crypto';
import {
	lstat as lstatChirho,
	readFile as readFileChirho,
	open as openChirho
} from 'node:fs/promises';
import { join as joinChirho } from 'node:path';
import { spawnSync as spawnSyncChirho } from 'node:child_process';
import { wranglerEnvironmentChirho } from '../release_rules_chirho';
import { isContactEmailChirho } from '../../../src/lib/site-chirho/contact-chirho/contact-contract-chirho';
const SECRET_NAMES_CHIRHO = [
	'TURNSTILE_SECRET_KEY_CHIRHO',
	'ARTIFACT_RATE_SECRET_CHIRHO',
	'TWOSMTP_API_KEY_CHIRHO',
	'CONTACT_DESTINATION_CHIRHO'
];
export async function configureRuntimeChirho(rootChirho: string, applyChirho = false) {
	if (!applyChirho) return { secret_names_chirho: SECRET_NAMES_CHIRHO, remote_writes_chirho: 0 };
	const accountChirho = process.env.CLOUDFLARE_GLOBAL_API_MAIN_ACCOUNT_ID_CHIRHO ?? '';
	const turnstileChirho = process.env.TURNSTILE_SHARED_SECRET_KEY_CHIRHO;
	if (
		!/^[a-f0-9]{32}$/.test(accountChirho) ||
		!accountChirho.endsWith('84bd') ||
		!turnstileChirho ||
		process.env.TURNSTILE_SHARED_SITE_KEY_CHIRHO !== '0x4AAAAAACJzuFer--zvnPKV'
	)
		throw new Error('Runtime account/widget scope refused');
	// Contact relay values come from provision_contact_mail_chirho.ts; refuse before any write.
	const relayChirho = process.env.HINNEH_TWOSMTP_API_KEY_CHIRHO?.trim();
	const destinationChirho = process.env.HINNEH_CONTACT_DESTINATION_CHIRHO?.trim();
	if (!relayChirho || !isContactEmailChirho(destinationChirho))
		throw new Error(
			'Contact relay unprovisioned; run scripts-chirho/site-chirho/provision_contact_mail_chirho.ts'
		);
	const pathChirho = joinChirho(rootChirho, '.env');
	if (!(await lstatChirho(pathChirho)).isFile())
		throw new Error('New rate secret requires the project regular .env file');
	let rateChirho = process.env.HINNEH_ARTIFACT_RATE_SECRET_CHIRHO;
	if (!rateChirho) {
		const existingChirho = await readFileChirho(pathChirho, 'utf8');
		if (/^HINNEH_ARTIFACT_RATE_SECRET_CHIRHO=/m.test(existingChirho))
			throw new Error('Reload the existing project rate secret');
		rateChirho = randomBytesChirho(32).toString('hex');
		const descriptorChirho = await openChirho(pathChirho, 'a');
		try {
			await descriptorChirho.write('\nHINNEH_ARTIFACT_RATE_SECRET_CHIRHO=' + rateChirho + '\n');
			await descriptorChirho.sync();
			await descriptorChirho.chmod(0o600);
		} finally {
			await descriptorChirho.close();
		}
	}
	const resultChirho = spawnSyncChirho(
		'bunx',
		['wrangler', 'secret', 'bulk', '--config', 'config-chirho/wrangler-preview-chirho.jsonc'],
		{
			cwd: rootChirho,
			env: wranglerEnvironmentChirho(rootChirho, {
				CLOUDFLARE_API_KEY: process.env.CLOUDFLARE_GLOBAL_API_KEY_CHIRHO ?? '',
				CLOUDFLARE_EMAIL: process.env.CLOUDFLARE_GLOBAL_API_EMAIL_CHIRHO ?? '',
				CLOUDFLARE_ACCOUNT_ID: accountChirho
			}),
			input: JSON.stringify({
				TURNSTILE_SECRET_KEY_CHIRHO: turnstileChirho,
				ARTIFACT_RATE_SECRET_CHIRHO: rateChirho,
				TWOSMTP_API_KEY_CHIRHO: relayChirho,
				CONTACT_DESTINATION_CHIRHO: destinationChirho
			}),
			encoding: 'utf8',
			timeout: 120000
		}
	);
	if (resultChirho.status !== 0)
		throw new Error('Narrow production-secret write failed; reconcile Cloudflare before retry');
	return {
		secret_names_chirho: SECRET_NAMES_CHIRHO,
		remote_writes_chirho: SECRET_NAMES_CHIRHO.length,
		source_chirho:
			'Existing allocated widget pair, dedicated project rate secret and the project contact relay; no other environment secrets sent.'
	};
}
if (import.meta.main)
	console.log(
		JSON.stringify(
			await configureRuntimeChirho(process.cwd(), process.argv.includes('--apply-chirho'))
		)
	);
