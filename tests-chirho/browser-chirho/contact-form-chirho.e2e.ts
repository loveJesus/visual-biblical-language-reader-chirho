// For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life. — John 3:16 (KJV)
import { test as testChirho, expect as expectChirho, type Page } from '@playwright/test';

// Stands in for Cloudflare's script: every render issues one fresh single-use token.
const TURNSTILE_STUB_CHIRHO = `window.turnstile = {
	render(element, options) {
		window.renders_chirho = (window.renders_chirho || 0) + 1;
		window.actions_chirho = [...(window.actions_chirho || []), options.action];
		options.callback('token-' + window.renders_chirho + '-chirho');
		return 'widget-' + window.renders_chirho + '-chirho';
	},
	remove() {}
};`;

async function stubChallengeChirho(pageChirho: Page) {
	await pageChirho.route('https://challenges.cloudflare.com/turnstile/v0/api.js**', (routeChirho) =>
		routeChirho.fulfill({ contentType: 'text/javascript', body: TURNSTILE_STUB_CHIRHO })
	);
}

testChirho(
	'the contact form sends a challenged message on a phone without publishing an address',
	async ({ page: pageChirho }) => {
		await stubChallengeChirho(pageChirho);
		const bodiesChirho: unknown[] = [];
		await pageChirho.route('**/api-chirho/contact-chirho', async (routeChirho) => {
			bodiesChirho.push(routeChirho.request().postDataJSON());
			await routeChirho.fulfill({
				status: 202,
				contentType: 'application/json',
				body: JSON.stringify({ sent_chirho: true })
			});
		});
		await pageChirho.setViewportSize({ width: 320, height: 900 });
		await pageChirho.goto('/contact-chirho/?lang_chirho=en');
		await expectChirho(pageChirho.getByRole('heading', { level: 1 })).toHaveText('Contact');
		await expectChirho(pageChirho.locator('a[href^="mailto:"]')).toHaveCount(0);
		// Cloudflare's challenge loads only after the visitor starts writing.
		expectChirho(await pageChirho.evaluate(() => 'turnstile' in window)).toBe(false);
		const formChirho = pageChirho.getByRole('form', { name: 'Contact form' });
		await pageChirho.getByLabel('Your email').fill('reader@example.org');
		await pageChirho.getByLabel('Message').fill('Shalom.\nA question about Genesis 1:1.');
		await expectChirho(formChirho.getByRole('status')).toHaveText('Ready to send.');
		await pageChirho.getByRole('button', { name: 'Send message' }).click();
		await expectChirho(formChirho.getByRole('status')).toHaveText(
			'Thank you. Your message was sent.'
		);
		expectChirho(bodiesChirho).toEqual([
			{
				name_chirho: '',
				email_chirho: 'reader@example.org',
				message_chirho: 'Shalom.\nA question about Genesis 1:1.',
				locale_chirho: 'en',
				turnstile_token_chirho: 'token-1-chirho'
			}
		]);
		await expectChirho(pageChirho.getByLabel('Message')).toHaveValue('');
		expectChirho(
			await pageChirho.evaluate(
				() => (window as unknown as { actions_chirho: string[] }).actions_chirho
			)
		).toEqual(['contact_message_chirho']);
		expectChirho(
			await pageChirho.evaluate(() => document.documentElement.scrollWidth <= innerWidth)
		).toBe(true);
	}
);

testChirho(
	'a failed send keeps the Spanish message and retries with a fresh verification',
	async ({ page: pageChirho }) => {
		await stubChallengeChirho(pageChirho);
		const tokensChirho: string[] = [];
		await pageChirho.route('**/api-chirho/contact-chirho', async (routeChirho) => {
			tokensChirho.push(routeChirho.request().postDataJSON().turnstile_token_chirho);
			const firstChirho = tokensChirho.length === 1;
			await routeChirho.fulfill({
				status: firstChirho ? 503 : 202,
				contentType: 'application/json',
				body: JSON.stringify(
					firstChirho ? { error_chirho: 'temporarily_unavailable' } : { sent_chirho: true }
				)
			});
		});
		await pageChirho.goto('/contact-chirho/?lang_chirho=es');
		const formChirho = pageChirho.getByRole('form', { name: 'Formulario de contacto' });
		await pageChirho.getByLabel('Tu correo electrónico').fill('lector@example.org');
		await pageChirho.getByLabel('Mensaje').fill('Una corrección.');
		await expectChirho(formChirho.getByRole('status')).toHaveText('Listo para enviar.');
		await pageChirho.getByRole('button', { name: 'Enviar mensaje' }).click();
		await expectChirho(formChirho.getByRole('status')).toHaveText(
			'No se pudo enviar tu mensaje. Inténtalo de nuevo en unos minutos.'
		);
		await expectChirho(pageChirho.getByLabel('Mensaje')).toHaveValue('Una corrección.');
		await pageChirho.waitForFunction(
			() => (window as unknown as { renders_chirho: number }).renders_chirho === 2
		);
		await pageChirho.getByRole('button', { name: 'Enviar mensaje' }).click();
		await expectChirho(formChirho.getByRole('status')).toHaveText(
			'Gracias. Tu mensaje fue enviado.'
		);
		expectChirho(tokensChirho).toEqual(['token-1-chirho', 'token-2-chirho']);
	}
);
