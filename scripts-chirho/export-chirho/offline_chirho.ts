// For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life. — John 3:16 (KJV)

import { mkdir as mkdirChirho, writeFile as writeFileChirho } from 'node:fs/promises';
import { dirname as dirnameChirho, resolve as resolveChirho } from 'node:path';
import { installHelpChirho } from '../../src/lib/reader-chirho/controls-chirho/help-controls-chirho';
import { installMediaChirho } from '../../src/lib/reader-chirho/controls-chirho/media-controls-chirho';
import { installGlossesChirho } from '../../src/lib/reader-chirho/controls-chirho/gloss-controls-chirho';
import { installWordNavigationChirho } from '../../src/lib/reader-chirho/controls-chirho/word-controls-chirho';
import { installSpeechChirho } from '../../src/lib/reader-chirho/audio-chirho/speech-controls-chirho';
import { readArtworkCatalogueChirho } from '../publish-chirho/r2-chirho/catalogue-chirho';
import { sha256Chirho } from '../publish-chirho/release_rules_chirho';
import { isSiteHostnameChirho, SITE_ORIGIN_CHIRHO } from '../../src/lib/site-chirho';

const [outputChirho, originArgumentChirho = 'http://127.0.0.1:5173'] = process.argv.slice(2);
if (!outputChirho)
	throw new Error(
		'Usage: bun scripts-chirho/export-chirho/offline_chirho.ts NEW-output-chirho.html [http://127.0.0.1:port]'
	);
const originChirho = new URL(originArgumentChirho);
if (
	!['127.0.0.1', 'localhost', '[::1]'].includes(originChirho.hostname) ||
	originChirho.protocol !== 'http:'
)
	throw new Error('Export reads only a local HTTP reader.');

async function fetchLocalChirho(pathChirho: string): Promise<Response> {
	const urlChirho = new URL(pathChirho, originChirho);
	if (urlChirho.origin !== originChirho.origin || pathChirho.includes('..'))
		throw new Error('Refusing a nonlocal asset.');
	const responseChirho = await fetch(urlChirho, { redirect: 'error' });
	if (!responseChirho.ok)
		throw new Error(`Required local asset unavailable (${responseChirho.status}).`);
	return responseChirho;
}

// Workflow: local-reader-chirho.md, reader → exclusive-create export → network-disabled inspection.
let htmlChirho = await (await fetchLocalChirho('/')).text();
if (!htmlChirho.includes('class="verse-chirho"'))
	throw new Error('No validated lesson is available to export.');
htmlChirho = htmlChirho.replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, '');
// A saved passage omits online site navigation and the home introduction.
htmlChirho = htmlChirho
	.replace(/<header\b[^>]*data-online-site-chirho[^>]*>[\s\S]*?<\/header>/gi, '')
	.replace(/<footer\b[^>]*data-online-site-chirho[^>]*>[\s\S]*?<\/footer>/gi, '')
	.replace(/<section\b[^>]*data-online-intro-chirho[^>]*>[\s\S]*?<\/section>/gi, '');
htmlChirho = htmlChirho.replaceAll('href="/"', 'href="#main-chirho"');
htmlChirho = htmlChirho.replace(
	/<nav\b[^>]*data-online-navigation-chirho[^>]*>[\s\S]*?<\/nav>/gi,
	'<p class="snapshot-note-chirho">Saved passage · offline reading</p>'
);
for (const linkChirho of [...htmlChirho.matchAll(/<link\b[^>]*>/gi)]) {
	const hrefChirho = linkChirho[0].match(/href="([^"]+)"/i)?.[1];
	if (/rel="stylesheet"/i.test(linkChirho[0]) && hrefChirho) {
		const cssChirho = await (await fetchLocalChirho(hrefChirho)).text();
		if (/@import\s|url\(\s*['"]?https?:/i.test(cssChirho))
			throw new Error('Offline styles must not request external resources.');
		htmlChirho = htmlChirho.replace(
			linkChirho[0],
			() => `<style>${cssChirho.replace(/<\/style/gi, '<\\/style')}</style>`
		);
	} else htmlChirho = htmlChirho.replace(linkChirho[0], '');
}
const remoteCatalogueChirho = await readArtworkCatalogueChirho(process.cwd());
const remoteAssetsChirho = new Map(
	[...(remoteCatalogueChirho?.entries_chirho.values() ?? [])].flatMap((entryChirho) =>
		entryChirho.source_paths_chirho.map(
			(pathChirho) => [pathChirho, entryChirho.delivery_chirho] as const
		)
	)
);
for (const imageChirho of [...htmlChirho.matchAll(/<img\b[^>]*src="([^"]+)"[^>]*>/gi)]) {
	const pathChirho = imageChirho[1];
	const remoteUrlChirho = pathChirho.startsWith('https://') ? new URL(pathChirho) : null;
	const remoteChirho =
		remoteUrlChirho !== null &&
		isSiteHostnameChirho(remoteUrlChirho.hostname) &&
		remoteUrlChirho.pathname.startsWith('/assets-chirho/') &&
		!remoteUrlChirho.search &&
		!remoteUrlChirho.hash;
	const relativeChirho = remoteChirho ? new URL(pathChirho).pathname : pathChirho;
	if (!/^\/assets-chirho\/[a-z0-9/-]+\.webp$/u.test(relativeChirho))
		throw new Error('Unexpected reader image path.');
	const proofChirho = remoteAssetsChirho.get(relativeChirho) ?? null;
	if ((remoteChirho || remoteCatalogueChirho) && !proofChirho)
		throw new Error('Offline artwork lacks its verified R2 identity');
	const responseChirho = remoteChirho
		? await fetch(pathChirho, { redirect: 'error', signal: AbortSignal.timeout(15000) })
		: await fetchLocalChirho(pathChirho);
	if (!responseChirho.ok) throw new Error('Offline artwork unavailable');
	const bytesChirho = new Uint8Array(await responseChirho.arrayBuffer());
	if (
		bytesChirho.length > 2 * 1024 ** 2 ||
		(proofChirho &&
			(bytesChirho.length !== proofChirho.bytes_chirho ||
				sha256Chirho(bytesChirho) !== proofChirho.sha256_chirho))
	)
		throw new Error('Offline artwork differs from its verified delivery');
	const dataChirho = Buffer.from(bytesChirho).toString('base64');
	const embeddedChirho = imageChirho[0].replace(
		`src="${pathChirho}"`,
		`src="data:image/webp;base64,${dataChirho}"`
	);
	htmlChirho = htmlChirho.replace(imageChirho[0], () => embeddedChirho);
}
htmlChirho = htmlChirho
	.replace(/<dialog\b[^>]*>[\s\S]*?<\/dialog>/gi, '')
	.replace(/<button\b[^>]*class="[^"]*report-artwork-chirho[^"]*"[^>]*>[\s\S]*?<\/button>/gi, '');
const scriptChirho = `(${installHelpChirho.toString()})(document);(${installMediaChirho.toString()})(document);(${installGlossesChirho.toString()})(document);(${installWordNavigationChirho.toString()})(document);(${installSpeechChirho.toString()})(document);`;
// A saved reader distributes its embedded controls too: retain the code grant and source offer.
const licenseChirho = `<footer class="snapshot-note-chirho">Hinneh reader code: <a href="https://www.gnu.org/licenses/gpl-3.0.html">GPLv3 or later</a>. <a href="${SITE_ORIGIN_CHIRHO}/sources-chirho/">Corresponding source and source-specific licenses</a>. Hinneh-held media rights: <a href="https://creativecommons.org/licenses/by/4.0/">CC BY 4.0</a>; retain the passage's credits and review labels.</footer>`;
htmlChirho = htmlChirho.replace(
	'</body>',
	() => `${licenseChirho}<script>${scriptChirho}</script></body>`
);
htmlChirho = htmlChirho.replace(
	'<head>',
	'<head><meta name="hinneh-snapshot-chirho" content="Frozen local preview; not a PWA">'
);
if (/<link\b|<script[^>]+src=|\bsrc=["']\/|\bhref=["']\//i.test(htmlChirho))
	throw new Error('Snapshot still depends on a local resource.');
const outputPathChirho = resolveChirho(outputChirho);
await mkdirChirho(dirnameChirho(outputPathChirho), { recursive: true });
await writeFileChirho(outputPathChirho, htmlChirho, { flag: 'wx' });
console.log(outputPathChirho);
