// For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life. — John 3:16 (KJV)
import { test as testChirho, expect as expectChirho } from '@playwright/test';
import { readerOriginChirho } from '../fixtures-chirho/runtime-chirho';

testChirho.use({ timezoneId: 'America/Los_Angeles' });
testChirho(
	'fresh visits use the visitor local date across the month boundary and preserve explicit links',
	async ({ page: pageChirho }) => {
		await pageChirho.clock.setFixedTime(new Date('2026-11-01T06:59:00Z'));
		await pageChirho.goto(readerOriginChirho);
		await expectChirho(
			pageChirho.getByRole('heading', { name: 'Proverbs 31:1', exact: true })
		).toBeVisible();
		await pageChirho.clock.setFixedTime(new Date('2026-11-01T07:01:00Z'));
		await pageChirho.goto(readerOriginChirho);
		await expectChirho(
			pageChirho.getByRole('heading', { name: 'Proverbs 1:1', exact: true })
		).toBeVisible();
		await pageChirho.goto(`${readerOriginChirho}#John.3.16`);
		await expectChirho(
			pageChirho.getByRole('heading', { name: 'John 3:16', exact: true })
		).toBeVisible();
		await pageChirho.clock.setFixedTime(new Date('2028-02-29T20:00:00Z'));
		await pageChirho.goto(`${readerOriginChirho}?lang_chirho=es`);
		await expectChirho(
			pageChirho.getByRole('heading', { name: 'Proverbios 29:1', exact: true })
		).toBeVisible();
	}
);
