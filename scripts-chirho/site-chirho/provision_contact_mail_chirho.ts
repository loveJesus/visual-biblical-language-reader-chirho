// For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life. — John 3:16 (KJV)
// Provisions the contact form's least-privilege sender and its dedicated 2SMTP relay key.
// Workflow: spec-chirho/workflows-chirho/hosting-chirho/contact-chirho.md
// Idempotent and dry by default. No DNS change: bible.systems already carries the Mailu MX, SPF,
// DKIM and DMARC records. Secret values are written only to the project's 0600 .env, never printed.
// Usage: bun scripts-chirho/site-chirho/provision_contact_mail_chirho.ts \
//          [--destination-chirho owner@example.org] [--apply-chirho]
import { chmod as chmodChirho, rename as renameChirho } from 'node:fs/promises';
import { join as joinChirho, resolve as resolveChirho } from 'node:path';
import { isContactEmailChirho } from '../../src/lib/site-chirho/contact-chirho/contact-contract-chirho';
const ROOT_CHIRHO = resolveChirho(import.meta.dir, '..', '..');
const ENV_PATH_CHIRHO = joinChirho(ROOT_CHIRHO, '.env');
const MAILU_BASE_CHIRHO = 'https://mailer-aleluya.xjes.us/api-aleluya/v1';
const TWOSMTP_KEYS_CHIRHO = 'https://2smtp.com/api_fe/keys_fe';
const MAILBOX_CHIRHO = 'noreply.hinneh@bible.systems';
const RELAY_LABEL_CHIRHO = 'hinneh-contact-chirho';
const PASSWORD_NAME_CHIRHO = 'HINNEH_CONTACT_MAILBOX_PASSWORD_CHIRHO';
const RELAY_NAME_CHIRHO = 'HINNEH_TWOSMTP_API_KEY_CHIRHO';
const DESTINATION_NAME_CHIRHO = 'HINNEH_CONTACT_DESTINATION_CHIRHO';
function requireChirho(nameChirho: string): string {
	const valueChirho = process.env[nameChirho]?.trim();
	if (!valueChirho) throw new Error(`Missing ${nameChirho}`);
	return valueChirho;
}
// Atomic replace-or-append of one NAME='value' line; the file stays owner-only.
async function persistChirho(nameChirho: string, valueChirho: string) {
	if (!/^[\x21-\x26\x28-\x7e]+$/u.test(valueChirho))
		throw new Error(`Unsafe value for ${nameChirho}`);
	const fileChirho = Bun.file(ENV_PATH_CHIRHO);
	const currentChirho = (await fileChirho.exists()) ? await fileChirho.text() : '';
	const lineChirho = `${nameChirho}='${valueChirho}'`;
	const patternChirho = new RegExp(`^(?:export\\s+)?${nameChirho}=.*$`, 'mu');
	const nextChirho = patternChirho.test(currentChirho)
		? currentChirho.replace(patternChirho, lineChirho)
		: `${currentChirho.trimEnd()}\n${lineChirho}\n`;
	const temporaryChirho = `${ENV_PATH_CHIRHO}.contact-provisioning-chirho`;
	await Bun.write(temporaryChirho, nextChirho, { mode: 0o600 });
	await renameChirho(temporaryChirho, ENV_PATH_CHIRHO);
	await chmodChirho(ENV_PATH_CHIRHO, 0o600);
	process.env[nameChirho] = valueChirho;
}
async function expectJsonChirho<ResultChirho>(responseChirho: Response, labelChirho: string) {
	if (!responseChirho.ok) throw new Error(`${labelChirho} returned HTTP ${responseChirho.status}`);
	return (await responseChirho.json()) as ResultChirho;
}
// A send-only mailbox: no IMAP/POP, forwarding, auto-reply or spoofing.
async function ensureMailboxChirho(tokenChirho: string, applyChirho: boolean) {
	const headersChirho = {
		Authorization: `Bearer ${tokenChirho}`,
		'Content-Type': 'application/json'
	};
	const lookupChirho = await fetch(
		`${MAILU_BASE_CHIRHO}/user/${encodeURIComponent(MAILBOX_CHIRHO)}`,
		{ headers: headersChirho }
	);
	if (lookupChirho.status !== 404) {
		await expectJsonChirho<unknown>(lookupChirho, 'Mailu mailbox lookup');
		const passwordChirho = process.env[PASSWORD_NAME_CHIRHO]?.trim();
		if (!passwordChirho)
			throw new Error(
				`${MAILBOX_CHIRHO} exists without ${PASSWORD_NAME_CHIRHO}; refusing to reset it`
			);
		return { passwordChirho, createdChirho: false };
	}
	if (!applyChirho) return { passwordChirho: '', createdChirho: true };
	const passwordChirho = `${Buffer.from(crypto.getRandomValues(new Uint8Array(36))).toString('base64url')}!9Aa`;
	await expectJsonChirho<unknown>(
		await fetch(`${MAILU_BASE_CHIRHO}/user`, {
			method: 'POST',
			headers: headersChirho,
			body: JSON.stringify({
				email: MAILBOX_CHIRHO,
				raw_password: passwordChirho,
				comment: 'Least-privilege sender for the Hinneh contact form',
				displayed_name: 'Hinneh',
				quota_bytes: 25_000_000,
				global_admin: false,
				enabled: true,
				change_pw_next_login: false,
				enable_imap: false,
				enable_pop: false,
				allow_spoofing: false,
				forward_enabled: false,
				reply_enabled: false,
				spam_enabled: true
			})
		}),
		'Mailu mailbox creation'
	);
	await persistChirho(PASSWORD_NAME_CHIRHO, passwordChirho);
	return { passwordChirho, createdChirho: true };
}
// One rate-limited key per project, bound to the mailbox; found again by label on a rerun.
async function ensureRelayChirho(masterChirho: string, passwordChirho: string) {
	const headersChirho = {
		Authorization: `Bearer ${masterChirho}`,
		'Content-Type': 'application/json'
	};
	const configurationChirho = JSON.stringify({
		label_chirho: RELAY_LABEL_CHIRHO,
		smtp_host_chirho: 'mailer-aleluya.xjes.us',
		smtp_port_chirho: 465,
		smtp_user_chirho: MAILBOX_CHIRHO,
		smtp_pass_chirho: passwordChirho,
		// Implicit TLS on 465; true would request STARTTLS inside TLS and break sending.
		smtp_tls_chirho: false,
		from_email_chirho: MAILBOX_CHIRHO,
		from_name_chirho: 'Hinneh',
		limit_per_minute_chirho: 5,
		limit_per_day_chirho: 100
	});
	let keyChirho = process.env[RELAY_NAME_CHIRHO]?.trim();
	if (!keyChirho) {
		const listChirho = await expectJsonChirho<{
			keys_chirho?: {
				api_key_chirho?: string;
				label_chirho?: string;
				is_active_chirho?: boolean;
			}[];
		}>(await fetch(TWOSMTP_KEYS_CHIRHO, { headers: headersChirho }), '2SMTP key lookup');
		keyChirho = listChirho.keys_chirho?.find(
			(candidateChirho) =>
				candidateChirho.label_chirho === RELAY_LABEL_CHIRHO &&
				candidateChirho.is_active_chirho !== false &&
				candidateChirho.api_key_chirho
		)?.api_key_chirho;
	}
	if (keyChirho) {
		const updatedChirho = await expectJsonChirho<{ success_chirho?: boolean }>(
			await fetch(`${TWOSMTP_KEYS_CHIRHO}/${encodeURIComponent(keyChirho)}`, {
				method: 'PATCH',
				headers: headersChirho,
				body: configurationChirho
			}),
			'2SMTP key synchronization'
		);
		if (updatedChirho.success_chirho !== true) throw new Error('2SMTP key update unconfirmed');
		await persistChirho(RELAY_NAME_CHIRHO, keyChirho);
		return false;
	}
	const createdChirho = await expectJsonChirho<{ api_key_chirho?: string }>(
		await fetch(TWOSMTP_KEYS_CHIRHO, {
			method: 'POST',
			headers: headersChirho,
			body: configurationChirho
		}),
		'2SMTP key creation'
	);
	if (!createdChirho.api_key_chirho) throw new Error('2SMTP returned no relay key');
	await persistChirho(RELAY_NAME_CHIRHO, createdChirho.api_key_chirho);
	return true;
}
async function mainChirho() {
	const argumentsChirho = process.argv.slice(2);
	const applyChirho = argumentsChirho.includes('--apply-chirho');
	const destinationIndexChirho = argumentsChirho.indexOf('--destination-chirho');
	const destinationChirho =
		destinationIndexChirho >= 0
			? argumentsChirho[destinationIndexChirho + 1]
			: process.env[DESTINATION_NAME_CHIRHO];
	if (!isContactEmailChirho(destinationChirho))
		throw new Error(`Pass --destination-chirho or set ${DESTINATION_NAME_CHIRHO}`);
	const mailboxChirho = await ensureMailboxChirho(
		requireChirho('MAILU_API_TOKEN_CHIRHO'),
		applyChirho
	);
	if (!applyChirho) {
		console.log(
			JSON.stringify({
				apply_chirho: false,
				mailbox_chirho: MAILBOX_CHIRHO,
				mailbox_would_be_created_chirho: mailboxChirho.createdChirho,
				relay_label_chirho: RELAY_LABEL_CHIRHO,
				env_names_chirho: [PASSWORD_NAME_CHIRHO, RELAY_NAME_CHIRHO, DESTINATION_NAME_CHIRHO]
			})
		);
		return;
	}
	await persistChirho(DESTINATION_NAME_CHIRHO, destinationChirho);
	const relayCreatedChirho = await ensureRelayChirho(
		requireChirho('TWOSMTP_MASTER_API_KEY_CHIRHO'),
		mailboxChirho.passwordChirho
	);
	console.log(
		JSON.stringify({
			apply_chirho: true,
			mailbox_chirho: MAILBOX_CHIRHO,
			mailbox_created_chirho: mailboxChirho.createdChirho,
			relay_label_chirho: RELAY_LABEL_CHIRHO,
			relay_created_chirho: relayCreatedChirho,
			env_names_chirho: [PASSWORD_NAME_CHIRHO, RELAY_NAME_CHIRHO, DESTINATION_NAME_CHIRHO]
		})
	);
}
await mainChirho();
