// For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life. — John 3:16 (KJV)
// Workflow: hosting-chirho/public-site-chirho.md. Code-native brand rendering, no network or generation.
import { chromium as chromiumChirho } from '@playwright/test';
import {
	mkdir as mkdirChirho,
	writeFile as writeFileChirho,
	readFile as readFileChirho
} from 'node:fs/promises';
import {
	dirname as dirnameChirho,
	resolve as resolveChirho,
	sep as separatorChirho
} from 'node:path';
import { fileURLToPath as fileURLToPathChirho } from 'node:url';

const rootChirho = fileURLToPathChirho(new URL('../../', import.meta.url));
const outputChirho = process.argv[2] ? resolveChirho(process.argv[2]) : '';
const allowedChirho = ['build-chirho', 'apps-chirho/ios-chirho/build-chirho'].some((folderChirho) =>
	outputChirho.startsWith(resolveChirho(rootChirho, folderChirho) + separatorChirho)
);
if (process.argv.length !== 3 || !allowedChirho || !outputChirho.endsWith('.png'))
	throw new Error(
		'Pass one .png path inside the repository or iOS ignored build-chirho directory.'
	);

const svgChirho = await readFileChirho(
	new URL('./hinneh-app-mark-chirho.svg', import.meta.url),
	'utf8'
);
const browserChirho = await chromiumChirho.launch();
try {
	const pageChirho = await browserChirho.newPage({ viewport: { width: 1024, height: 1024 } });
	// A browser renders the original stroked paths faithfully; ImageMagick's MSVG dropped them.
	await pageChirho.route('**/*', (routeChirho) => routeChirho.abort());
	await pageChirho.setContent(svgChirho);
	const bytesChirho = await pageChirho.locator('svg').screenshot({ type: 'png' });
	if (bytesChirho.readUInt32BE(16) !== 1024 || bytesChirho.readUInt32BE(20) !== 1024)
		throw new Error('Unexpected native mark dimensions.');
	await mkdirChirho(dirnameChirho(outputChirho), { recursive: true });
	await writeFileChirho(outputChirho, bytesChirho);
	console.log(
		JSON.stringify({ path_chirho: outputChirho, width_chirho: 1024, height_chirho: 1024 })
	);
} finally {
	await browserChirho.close();
}
