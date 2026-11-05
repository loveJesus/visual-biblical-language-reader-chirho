// For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life. — John 3:16 (KJV)
import { test as testChirho, expect as expectChirho } from '@playwright/test';

testChirho(
	'public artwork is CC0 while audio and source licenses stay distinct, with the software link in footer navigation',
	async ({ page: pageChirho }) => {
		for (const localeChirho of ['en', 'es']) {
			await pageChirho.goto(`/sources-chirho/?lang_chirho=${localeChirho}`);
			await expectChirho(pageChirho.locator('html')).toHaveAttribute('lang', localeChirho);
			await expectChirho(
				pageChirho.getByRole('link', {
					name: localeChirho === 'en' ? 'Artwork: CC0 1.0' : 'Ilustraciones: CC0 1.0',
					exact: true
				})
			).toHaveAttribute('href', 'https://creativecommons.org/publicdomain/zero/1.0/');
			await expectChirho(
				pageChirho.getByRole('link', {
					name: localeChirho === 'en' ? 'Recordings: CC BY 4.0' : 'Grabaciones: CC BY 4.0',
					exact: true
				})
			).toHaveAttribute('href', 'https://creativecommons.org/licenses/by/4.0/');
			await expectChirho(
				pageChirho
					.locator('.public-footer-chirho nav')
					.getByRole('link', { name: /Love Jesus Software/ })
			).toHaveAttribute('href', 'https://loveJesus.software/');
			await expectChirho(pageChirho.locator('.public-footer-chirho')).not.toContainText('L.J.');
			await expectChirho(
				pageChirho
					.locator('.public-footer-chirho nav')
					.getByRole('link', { name: localeChirho === 'en' ? 'Contact' : 'Contacto', exact: true })
			).toHaveAttribute('href', `/contact-chirho/?lang_chirho=${localeChirho}`);
			// The owner's address is never published; visitors write through the challenged form.
			await expectChirho(pageChirho.locator('a[href^="mailto:"]')).toHaveCount(0);
			expectChirho(await pageChirho.content()).not.toMatch(/[\w.+-]+@[\w-]+\.software/u);
		}
	}
);

testChirho(
	'word cards open checked lexicon entries or labelled Hebrew and Greek searches in the chosen language',
	async ({ page: pageChirho }) => {
		await pageChirho.goto('/?lang_chirho=en#Prov.26.1');
		await expectChirho(
			pageChirho.locator('.word-card-chirho .lemma-link-chirho').filter({ hasText: 'H7105a' })
		).toHaveAttribute('href', 'https://lexicon-chirho.bible.systems/lemma-chirho/H7105a?lang=eng');
		await pageChirho.goto('/?lang_chirho=en#Gen.1.1');
		await expectChirho(
			pageChirho.locator('.word-card-chirho .lemma-link-chirho').filter({ hasText: /^H430\b/ })
		).toHaveAttribute(
			'href',
			'https://lexicon-chirho.bible.systems/search-chirho?q=H0430&lang=eng'
		);
		await pageChirho.goto('/?lang_chirho=es#John.1.1');
		const linksChirho = pageChirho
			.locator('.word-card-chirho .lemma-link-chirho')
			.filter({ hasText: /^G3056\b/ });
		await expectChirho(linksChirho.first()).toHaveAttribute(
			'href',
			'https://lexicon-chirho.bible.systems/search-chirho?q=G3056&lang=spa'
		);
		await expectChirho(linksChirho.first()).toContainText('Buscar en el léxico');
		for (const widthChirho of [320, 390]) {
			await pageChirho.setViewportSize({ width: widthChirho, height: 900 });
			expectChirho(
				await pageChirho.evaluate(() => document.documentElement.scrollWidth <= innerWidth)
			).toBe(true);
		}
	}
);

testChirho(
	'the public root explains Hinneh before reading and sends site metadata without JavaScript',
	async ({ page: pageChirho, request: requestChirho }) => {
		const responseChirho = await requestChirho.get('/', {
			headers: { 'User-Agent': 'LinkedInBot' }
		});
		expectChirho(responseChirho.status()).toBe(200);
		const htmlChirho = await responseChirho.text();
		const titleChirho = /<title>([^<]+)<\/title>/.exec(htmlChirho)![1];
		expectChirho(titleChirho).toContain('Hinneh');
		expectChirho(titleChirho).not.toContain('26:1');
		for (const nameChirho of ['title', 'description', 'url', 'image'])
			expectChirho(htmlChirho).toMatch(new RegExp(`property="og:${nameChirho}" content="[^"]+"`));
		expectChirho(htmlChirho).toContain(
			'https://hinneh.us/assets-chirho/site-chirho/hinneh-share-v1-chirho.jpg'
		);
		await pageChirho.clock.setFixedTime(new Date('2026-11-03T12:00:00Z'));
		await pageChirho.goto('/');
		await expectChirho(pageChirho.locator('[data-online-intro-chirho]')).toBeVisible();
		await expectChirho(
			pageChirho.getByRole('heading', { name: 'Proverbs 3:1', exact: true })
		).toBeVisible();
		await expectChirho(pageChirho.locator('[data-online-intro-chirho]')).toBeVisible();
		expectChirho(new URL(pageChirho.url()).hash).toBe('');
		await pageChirho.locator('[data-intro-start-chirho]').click();
		await expectChirho(pageChirho.locator('[data-online-intro-chirho]')).toHaveCount(0);
		await expectChirho(pageChirho.locator('#reader-chirho')).toBeFocused();
		await expectChirho(
			pageChirho.locator('.verse-chirho [data-word-jump-chirho]').first()
		).toBeVisible();
		await pageChirho.goto('/#John.1.1');
		await expectChirho(pageChirho.getByRole('heading', { level: 1 })).toHaveText('John 1:1');
		await expectChirho(pageChirho.locator('[data-online-intro-chirho]')).toHaveCount(0);
	}
);

testChirho(
	'the public preview keeps real source words and media usable in both scripts without autoplay',
	async ({ page: pageChirho }) => {
		const audioRequestsChirho: string[] = [];
		pageChirho.on('request', (requestChirho) => {
			if (/\/audio-chirho\/sha256-chirho\/.*\.mp3$/.test(requestChirho.url()))
				audioRequestsChirho.push(requestChirho.url());
		});
		await pageChirho.setViewportSize({ width: 390, height: 920 });
		await pageChirho.goto('/?lang_chirho=en');
		const previewChirho = pageChirho.locator('.experience-chirho').first();
		await previewChirho.scrollIntoViewIfNeeded();
		await expectChirho(previewChirho).toBeVisible();
		await expectChirho(previewChirho.locator('.experience-words-chirho')).toHaveAttribute(
			'dir',
			'rtl'
		);
		await expectChirho(previewChirho.locator('.experience-word-chirho')).toHaveCount(3);
		expectChirho(audioRequestsChirho).toHaveLength(0);
		await previewChirho.locator('.experience-word-chirho').first().click();
		await expectChirho(previewChirho.locator('.experience-word-chirho').first()).toHaveAttribute(
			'aria-pressed',
			'true'
		);
		const hebrewMeaningChirho = await previewChirho.locator('.meaning-value-chirho').textContent();
		await previewChirho.getByRole('button', { name: 'Hear this word', exact: true }).click();
		await expectChirho.poll(() => audioRequestsChirho.length).toBe(1);
		await expectChirho(
			previewChirho.getByRole('button', { name: 'Hear this word', exact: true })
		).toBeVisible({ timeout: 10_000 });
		await previewChirho.getByRole('button', { name: 'Greek', exact: true }).click();
		await expectChirho(previewChirho.locator('.experience-words-chirho')).toHaveAttribute(
			'dir',
			'ltr'
		);
		await expectChirho(previewChirho.locator('.meaning-value-chirho')).not.toHaveText(
			hebrewMeaningChirho!
		);
		expectChirho(audioRequestsChirho).toHaveLength(1);
		for (const widthChirho of [320, 390, 1440]) {
			await pageChirho.setViewportSize({ width: widthChirho, height: 920 });
			expectChirho(
				await pageChirho.evaluate(() => document.documentElement.scrollWidth <= innerWidth)
			).toBe(true);
		}
		await previewChirho.getByRole('link', { name: /Read the passage/ }).click();
		await expectChirho(pageChirho.getByRole('heading', { level: 1 })).toHaveText('John 1:1');
		await expectChirho(pageChirho.locator('[data-online-intro-chirho]')).toHaveCount(0);
	}
);

testChirho(
	'information pages have useful navigation and translate without losing their route on phones',
	async ({ page: pageChirho }) => {
		await pageChirho.setViewportSize({ width: 320, height: 900 });
		for (const pathChirho of ['about-chirho', 'privacy-chirho', 'terms-chirho', 'sources-chirho']) {
			await pageChirho.goto(`/${pathChirho}/?lang_chirho=en`);
			const headingChirho = await pageChirho.getByRole('heading', { level: 1 }).textContent();
			await expectChirho(pageChirho.locator('article section')).not.toHaveCount(0);
			await pageChirho.getByRole('button', { name: 'Usar español', exact: true }).click();
			await expectChirho(pageChirho.locator('html')).toHaveAttribute('lang', 'es');
			await expectChirho(pageChirho.getByRole('heading', { level: 1 })).not.toHaveText(
				headingChirho!
			);
			expectChirho(new URL(pageChirho.url()).pathname).toBe(`/${pathChirho}/`);
			expectChirho(
				await pageChirho.evaluate(() => document.documentElement.scrollWidth <= innerWidth)
			).toBe(true);
			await pageChirho.reload();
			await expectChirho(pageChirho.locator('html')).toHaveAttribute('lang', 'es');
			await expectChirho(pageChirho.locator('footer a[href^="/contact-chirho/"]')).toBeVisible();
		}
		await pageChirho.locator('footer a[href^="/about-chirho"]').click();
		await expectChirho(pageChirho.locator('article h1')).toBeVisible();
	}
);

testChirho(
	'native bootstrap is small, public and contains only book identities',
	async ({ request: requestChirho }) => {
		const responseChirho = await requestChirho.get('/library-chirho/books-chirho.json');
		expectChirho(responseChirho.status()).toBe(200);
		const valueChirho = await responseChirho.json();
		expectChirho(valueChirho.schema_version_chirho).toBe(1);
		expectChirho(valueChirho.books_chirho.length).toBe(66);
		expectChirho((await responseChirho.body()).length).toBeLessThan(64 * 1024);
		expectChirho(
			valueChirho.books_chirho.every(
				(bookChirho: Record<string, unknown>) =>
					!('gbt_file_chirho' in bookChirho) && !('verses_chirho' in bookChirho)
			)
		).toBe(true);
		expectChirho((await requestChirho.get('/library-chirho/private-chirho.json')).status()).toBe(
			404
		);
	}
);
