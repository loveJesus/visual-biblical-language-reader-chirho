// For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life. — John 3:16 (KJV)
// The fleet's one mail transport: 2SMTP relaying through our own Mailu (feedback-system-chirho skill).
// Workflow: spec-chirho/workflows-chirho/hosting-chirho/contact-chirho.md
// The sender identity is bound to the relay key when it is provisioned, so a send has no `from`.
const TWOSMTP_SEND_URL_CHIRHO = 'https://2smtp.com/api_fe/send_email_fe';
export interface MailChirho {
	relay_key_chirho: string;
	to_chirho: readonly string[];
	reply_to_chirho: string;
	subject_chirho: string;
	body_text_chirho: string;
	body_html_chirho: string;
	// Stable per logical message; the relay de-duplicates on it, so a retry never sends twice.
	idempotency_key_chirho: string;
}
// Never throws. Partial acceptance is failure: every requested recipient must be taken.
export async function sendMailChirho(
	mailChirho: MailChirho,
	fetchChirho: typeof fetch
): Promise<{ accepted_chirho: boolean; status_chirho: number }> {
	let responseChirho: Response;
	try {
		responseChirho = await fetchChirho(TWOSMTP_SEND_URL_CHIRHO, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
				'X-API-Key': mailChirho.relay_key_chirho,
				'Idempotency-Key': mailChirho.idempotency_key_chirho
			},
			body: JSON.stringify({
				to_chirho: mailChirho.to_chirho,
				reply_to_chirho: mailChirho.reply_to_chirho,
				subject_chirho: mailChirho.subject_chirho,
				body_text_chirho: mailChirho.body_text_chirho,
				body_html_chirho: mailChirho.body_html_chirho
			}),
			signal: AbortSignal.timeout(15000)
		});
	} catch {
		return { accepted_chirho: false, status_chirho: 0 };
	}
	let resultChirho: { success_chirho?: unknown; recipients_chirho?: unknown } = {};
	try {
		resultChirho = (await responseChirho.json()) as typeof resultChirho;
	} catch {
		// A non-JSON body is a provider refusal; the check below reports it.
	}
	return {
		accepted_chirho:
			responseChirho.ok &&
			resultChirho.success_chirho === true &&
			resultChirho.recipients_chirho === mailChirho.to_chirho.length,
		status_chirho: responseChirho.status
	};
}
