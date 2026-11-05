// For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life. — John 3:16 (KJV)
// Workflow: contact form -> challenged, rate-limited intake -> mail relay -> owner's inbox.
// See spec-chirho/workflows-chirho/hosting-chirho/contact-chirho.md. Nothing is stored here.
import type {
	MediaCatalogueChirho,
	WorkerEnvironmentChirho,
	DependenciesChirho
} from './types-chirho';
import {
	consumeRateChirho,
	jsonChirho,
	readBodyChirho,
	requestRefusalChirho,
	sha256HexChirho,
	verifyChallengeChirho
} from './intake-chirho';
import { sendMailChirho } from './mail-chirho';
import {
	CONTACT_ACTION_CHIRHO,
	CONTACT_MAX_BODY_CHIRHO,
	CONTACT_RATE_CHIRHO,
	isContactEmailChirho,
	parseContactChirho,
	type ContactInputChirho
} from '../../src/lib/site-chirho/contact-chirho/contact-contract-chirho';
const escapeHtmlChirho = (valueChirho: string) =>
	valueChirho.replace(
		/[&<>"']/gu,
		(characterChirho) =>
			({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[characterChirho]!
	);
// The destination address lives only in the Worker secret, never in public source or responses.
export function contactMailChirho(
	inputChirho: ContactInputChirho,
	hostnameChirho: string,
	receivedAtChirho: string
) {
	const senderChirho = inputChirho.name_chirho || inputChirho.email_chirho;
	const languageChirho = inputChirho.locale_chirho === 'es' ? 'Spanish' : 'English';
	const factsChirho = [
		['Name', inputChirho.name_chirho || '(not given)'],
		['Reply to', inputChirho.email_chirho],
		['Page', `${hostnameChirho}, ${languageChirho} interface`],
		['Received', receivedAtChirho]
	] as const;
	return {
		subject_chirho: `Hinneh contact: ${[...senderChirho].slice(0, 80).join('')}`,
		body_text_chirho: [
			'A message from the Hinneh contact form.',
			'',
			...factsChirho.map(([labelChirho, valueChirho]) => `${labelChirho}: ${valueChirho}`),
			'',
			inputChirho.message_chirho,
			'',
			'Reply to this email to answer the sender directly.'
		].join('\n'),
		body_html_chirho: [
			'<p>A message from the Hinneh contact form.</p>',
			'<table>',
			...factsChirho.map(
				([labelChirho, valueChirho]) =>
					`<tr><th align="left">${labelChirho}</th><td>${escapeHtmlChirho(valueChirho)}</td></tr>`
			),
			'</table>',
			`<p style="white-space:pre-wrap">${escapeHtmlChirho(inputChirho.message_chirho)}</p>`,
			'<p>Reply to this email to answer the sender directly.</p>'
		].join('\n')
	};
}
export async function contactResponseChirho(
	requestChirho: Request,
	catalogueChirho: MediaCatalogueChirho,
	environmentChirho: WorkerEnvironmentChirho,
	dependenciesChirho: DependenciesChirho
) {
	const refusalChirho = requestRefusalChirho(
		requestChirho,
		catalogueChirho.hostnames_chirho ?? [catalogueChirho.hostname_chirho]
	);
	if (refusalChirho) return refusalChirho;
	let inputChirho: ContactInputChirho | null;
	try {
		inputChirho = parseContactChirho(await readBodyChirho(requestChirho, CONTACT_MAX_BODY_CHIRHO));
	} catch {
		return jsonChirho({ error_chirho: 'invalid_body' }, 400);
	}
	if (!inputChirho) return jsonChirho({ error_chirho: 'invalid_message' }, 400);
	const destinationChirho = environmentChirho.CONTACT_DESTINATION_CHIRHO;
	if (
		!environmentChirho.TURNSTILE_SECRET_KEY_CHIRHO ||
		!environmentChirho.ARTIFACT_RATE_SECRET_CHIRHO ||
		!environmentChirho.TWOSMTP_API_KEY_CHIRHO ||
		!isContactEmailChirho(destinationChirho)
	)
		return jsonChirho(
			{ error_chirho: 'temporarily_unavailable', stage_chirho: 'configuration' },
			503
		);
	const hostnameChirho = new URL(requestChirho.url).hostname;
	let stageChirho = 'edge_rate';
	try {
		const ipChirho = requestChirho.headers.get('cf-connecting-ip');
		if (!ipChirho) return jsonChirho({ error_chirho: 'temporarily_unavailable' }, 503);
		if (
			!(await consumeRateChirho(
				'internal-contact-rate-chirho',
				ipChirho,
				environmentChirho.ARTIFACT_RATE_SECRET_CHIRHO,
				CONTACT_RATE_CHIRHO,
				dependenciesChirho
			))
		)
			return jsonChirho({ error_chirho: 'rate_limited' }, 429);
		stageChirho = 'challenge';
		const challengeChirho = await verifyChallengeChirho(
			inputChirho.turnstile_token_chirho,
			environmentChirho.TURNSTILE_SECRET_KEY_CHIRHO,
			hostnameChirho,
			CONTACT_ACTION_CHIRHO,
			dependenciesChirho
		);
		if (challengeChirho === 'unavailable')
			return jsonChirho({ error_chirho: 'challenge_unavailable' }, 503);
		if (challengeChirho === 'failed') return jsonChirho({ error_chirho: 'challenge_failed' }, 400);
		stageChirho = 'relay';
		const sentChirho = await sendMailChirho(
			{
				relay_key_chirho: environmentChirho.TWOSMTP_API_KEY_CHIRHO,
				to_chirho: [destinationChirho],
				reply_to_chirho: inputChirho.email_chirho,
				// Each challenge token is single-use, so its hash names exactly one submission.
				idempotency_key_chirho: `hinneh-contact-${await sha256HexChirho(inputChirho.turnstile_token_chirho)}`,
				...contactMailChirho(
					inputChirho,
					hostnameChirho,
					new Date(dependenciesChirho.now_chirho()).toISOString()
				)
			},
			dependenciesChirho.fetch_chirho
		);
		return sentChirho.accepted_chirho
			? jsonChirho({ sent_chirho: true }, 202)
			: jsonChirho({ error_chirho: 'temporarily_unavailable', stage_chirho: 'relay' }, 503);
	} catch {
		return jsonChirho({ error_chirho: 'temporarily_unavailable', stage_chirho: stageChirho }, 503);
	}
}
