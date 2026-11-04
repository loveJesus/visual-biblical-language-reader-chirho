// For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life. — John 3:16 (KJV)
// Workflow: spec-chirho/workflows-chirho/native-chirho/store-assets-chirho.md.
import { chromium as chromiumChirho } from '@playwright/test';
import { createHash as createHashChirho } from 'node:crypto';
import {
	readFile as readFileChirho,
	writeFile as writeFileChirho,
	mkdir as mkdirChirho,
	readdir as readdirChirho
} from 'node:fs/promises';
import {
	resolve as resolveChirho,
	relative as relativeChirho,
	sep as separatorChirho
} from 'node:path';
import { fileURLToPath as fileURLToPathChirho } from 'node:url';
import { execFileSync as execFileSyncChirho } from 'node:child_process';
import copyChirho from './store-copy-chirho.json';

const rootChirho = fileURLToPathChirho(new URL('../../../../', import.meta.url));
const outputChirho = resolveChirho(process.argv[2] ?? '');
const allowedChirho = resolveChirho(
	rootChirho,
	'workspace-chirho/native-apps-chirho/app-store-chirho'
);
if (process.argv.length !== 3 || !outputChirho.startsWith(allowedChirho + separatorChirho))
	throw new Error('Pass the dated, local App Store package directory.');
const escapeChirho = (valueChirho: string): string =>
	valueChirho.replace(
		/[&<>"']/g,
		(characterChirho) =>
			({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[characterChirho]!
	);
const dataChirho = async (pathChirho: string): Promise<string> =>
	'data:image/png;base64,' + (await readFileChirho(pathChirho)).toString('base64');
const dimensionsChirho = (bytesChirho: Buffer): [number, number] => [
	bytesChirho.readUInt32BE(16),
	bytesChirho.readUInt32BE(20)
];
const filesChirho: {
	path_chirho: string;
	sha256_chirho: string;
	bytes_chirho: number;
	width_chirho: number;
	height_chirho: number;
	kind_chirho: string;
}[] = [];
async function recordChirho(pathChirho: string, kindChirho: string): Promise<void> {
	const bytesChirho = await readFileChirho(pathChirho);
	const [widthChirho, heightChirho] = dimensionsChirho(bytesChirho);
	// PNG color type 2 is RGB, with no alpha channel. Lossless conversion after rendering.
	if (bytesChirho[25] !== 2)
		throw new Error('Store image must be RGB without alpha: ' + pathChirho);
	filesChirho.push({
		path_chirho: relativeChirho(outputChirho, pathChirho),
		sha256_chirho: createHashChirho('sha256').update(bytesChirho).digest('hex'),
		bytes_chirho: bytesChirho.length,
		width_chirho: widthChirho,
		height_chirho: heightChirho,
		kind_chirho: kindChirho
	});
}

const iconPathChirho = resolveChirho(outputChirho, 'icon-chirho/hinneh-1024-chirho.png');
await mkdirChirho(resolveChirho(outputChirho, 'icon-chirho'), { recursive: true });
const builtIconChirho = resolveChirho(
	rootChirho,
	'apps-chirho/ios-chirho/build-chirho/branding-chirho/BrandChirho.xcassets/AppIcon.appiconset/AppIcon-chirho.png'
);
execFileSyncChirho('magick', [builtIconChirho, '-alpha', 'off', 'PNG24:' + iconPathChirho]);
await recordChirho(iconPathChirho, 'icon');
if (filesChirho[0].width_chirho !== 1024 || filesChirho[0].height_chirho !== 1024)
	throw new Error('Icon must be 1024 square.');
const iconUrlChirho = await dataChirho(iconPathChirho);
const browserChirho = await chromiumChirho.launch();
const galleryChirho: string[] = [];
try {
	for (const localeChirho of ['en', 'es'] as const) {
		const catalogueChirho = copyChirho[`${localeChirho}_chirho`];
		for (const [fieldChirho, limitChirho] of [
			['name_chirho', 30],
			['subtitle_chirho', 30],
			['promotional_text_chirho', 170],
			['description_chirho', 4000],
			['whats_new_chirho', 4000]
		] as const) {
			if ([...catalogueChirho[fieldChirho]].length > limitChirho)
				throw new Error(`${localeChirho} ${fieldChirho} exceeds ${limitChirho}.`);
		}
		if (Buffer.byteLength(catalogueChirho.keywords_chirho) > 100)
			throw new Error('Keywords exceed 100 UTF-8 bytes.');
		for (const deviceChirho of ['iphone-chirho', 'ipad-chirho'] as const) {
			const rawHomeChirho = resolveChirho(outputChirho, 'raw-chirho', deviceChirho);
			const rawFilesChirho = await readdirChirho(rawHomeChirho);
			const folderChirho = resolveChirho(
				outputChirho,
				'screenshots-chirho',
				`${localeChirho}-chirho`,
				deviceChirho
			);
			await mkdirChirho(folderChirho, { recursive: true });
			for (const screenChirho of catalogueChirho.screens_chirho) {
				const rawNameChirho = rawFilesChirho.find(
					(nameChirho) =>
						nameChirho.startsWith(`${screenChirho.id_chirho}-${localeChirho}-chirho`) &&
						nameChirho.endsWith('.png')
				);
				if (!rawNameChirho)
					throw new Error('Missing raw screenshot: ' + screenChirho.id_chirho + '-' + localeChirho);
				const rawPathChirho = resolveChirho(rawHomeChirho, rawNameChirho);
				const rawBytesChirho = await readFileChirho(rawPathChirho);
				const [widthChirho, heightChirho] = dimensionsChirho(rawBytesChirho);
				const ipadChirho = deviceChirho === 'ipad-chirho';
				if (
					(ipadChirho && (widthChirho !== 2064 || heightChirho !== 2752)) ||
					(!ipadChirho && (widthChirho !== 1206 || heightChirho !== 2622))
				)
					throw new Error('Unexpected native screenshot dimensions: ' + rawNameChirho);
				const darkChirho =
					screenChirho.id_chirho === '01-behold' || screenChirho.id_chirho === '04-hebrew';
				const pageChirho = await browserChirho.newPage({
					viewport: { width: widthChirho, height: heightChirho },
					deviceScaleFactor: 1
				});
				await pageChirho.route('**/*', (routeChirho) => routeChirho.abort());
				await pageChirho.setContent(`<!doctype html><html lang="${localeChirho}"><meta charset="utf-8">
                    <style>
                    *{box-sizing:border-box}body{margin:0;width:${widthChirho}px;height:${heightChirho}px;
                    overflow:hidden;background:${darkChirho ? '#223d30' : '#f7f3e9'};color:${darkChirho ? '#faf6e9' : '#263c30'};
                    font-family:Arial,sans-serif}.brand-chirho{position:absolute;top:64px;left:76px;display:flex;gap:20px;align-items:center}
                    .brand-chirho img{width:60px;height:60px;border-radius:14px}.brand-chirho span{font-size:29px;font-weight:600;letter-spacing:2px}
                    header{position:absolute;top:${ipadChirho ? 170 : 172}px;left:${ipadChirho ? 150 : 78}px;right:${ipadChirho ? 150 : 78}px}
                    .eyebrow-chirho{font-size:${ipadChirho ? 27 : 23}px;letter-spacing:3px;font-weight:700;color:${darkChirho ? '#d9b18d' : '#8f593c'}}
                    h1{font-family:Georgia,serif;font-size:${ipadChirho ? 105 : 76}px;line-height:1.08;letter-spacing:-2px;margin:24px 0 22px;max-width:100%}
                    p{font-size:${ipadChirho ? 34 : 30}px;line-height:1.4;margin:0;color:${darkChirho ? '#e2e7da' : '#506352'}}
                    .screen-chirho{position:absolute;left:50%;transform:translateX(-50%);top:${ipadChirho ? 550 : 490}px;
                    width:${ipadChirho ? 1560 : 936}px;border:9px solid ${darkChirho ? '#6b7d6e' : '#4b5d4c'};
                    border-radius:${ipadChirho ? 40 : 50}px;overflow:hidden;box-shadow:0 28px 65px #10271933;background:#faf8f2}
                    .screen-chirho img{display:block;width:100%;height:auto}
                    footer{position:absolute;bottom:43px;left:78px;right:78px;display:flex;justify-content:space-between;
                    font-size:23px;letter-spacing:.3px;color:${darkChirho ? '#d0dbc9' : '#63715e'}}
                    </style><body><div class="brand-chirho"><img src="${iconUrlChirho}" alt=""><span>Hinneh</span></div>
                    <header><div class="eyebrow-chirho">${escapeChirho(screenChirho.eyebrow_chirho)}</div>
                    <h1>${escapeChirho(screenChirho.title_chirho)}</h1><p>${escapeChirho(screenChirho.detail_chirho)}</p></header>
                    <div class="screen-chirho"><img src="${await dataChirho(rawPathChirho)}" alt="Native Hinneh app screenshot"></div>
                    <footer><span>${localeChirho === 'en' ? 'Free & open source' : 'Gratis y de código abierto'}</span><span>hinneh.us</span></footer></body></html>`);
				await pageChirho.evaluate(async () => {
					await document.fonts.ready;
					await Promise.all(Array.from(document.images, (imageChirho) => imageChirho.decode()));
				});
				const imagePathChirho = resolveChirho(folderChirho, `${screenChirho.id_chirho}-chirho.png`);
				await pageChirho.screenshot({ path: imagePathChirho });
				await pageChirho.close();
				execFileSyncChirho('magick', [
					imagePathChirho,
					'-alpha',
					'off',
					'PNG24:' + imagePathChirho
				]);
				await recordChirho(imagePathChirho, 'screenshot');
				galleryChirho.push(
					`<figure><a href="${relativeChirho(outputChirho, imagePathChirho)}"><img src="${relativeChirho(outputChirho, imagePathChirho)}" alt="${escapeChirho(screenChirho.title_chirho)}"></a><figcaption>${localeChirho.toUpperCase()} · ${deviceChirho} · ${screenChirho.id_chirho}</figcaption></figure>`
				);
			}
		}
	}
} finally {
	await browserChirho.close();
}
await writeFileChirho(
	resolveChirho(outputChirho, 'store-metadata-chirho.json'),
	JSON.stringify(copyChirho, null, 2) + '\n'
);
await writeFileChirho(
	resolveChirho(outputChirho, 'asset-manifest-chirho.json'),
	JSON.stringify(
		{ schema_version_chirho: 1, status_chirho: 'prepared_not_uploaded', files_chirho: filesChirho },
		null,
		2
	) + '\n'
);
await writeFileChirho(
	resolveChirho(outputChirho, 'review-chirho.html'),
	`<!doctype html>
<!-- For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life. — John 3:16 (KJV) -->
<html lang="en"><meta charset="utf-8"><meta name="viewport" content="width=device-width"><title>Hinneh · iOS store assets</title>
<style>body{background:#f7f3e9;color:#263c30;font:16px/1.5 system-ui;margin:40px}h1{font:54px Georgia}main{display:grid;grid-template-columns:repeat(auto-fill,minmax(240px,1fr));gap:24px}figure{margin:0}img{width:100%;height:auto;border-radius:12px}figcaption{font-size:13px;margin:6px 0 28px}a{color:inherit}.icon-chirho{width:128px}header{max-width:900px}</style>
<header><img class="icon-chirho" src="icon-chirho/hinneh-1024-chirho.png" alt="Hinneh icon"><h1>Behold the Bible.</h1>
<p>Real native iOS captures, composed for the App Store. Six screenshots in each language and device family. Click any image for the full-size PNG.</p>
<p>Prepared for review. Nothing has been uploaded or submitted. <a href="submission-checklist-chirho.md">Submission checklist</a> · <a href="store-metadata-chirho.json">Store copy</a></p></header><main>${galleryChirho.join('')}</main></html>`
);
console.log(
	JSON.stringify({
		assets_chirho: filesChirho.length,
		screenshots_chirho: filesChirho.filter((fileChirho) => fileChirho.kind_chirho === 'screenshot')
			.length
	})
);
