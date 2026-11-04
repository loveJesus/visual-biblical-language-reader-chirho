// For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life. — John 3:16 (KJV)
// Workflow: spec-chirho/workflows-chirho/native-chirho/store-assets-chirho.md.
import { chromium as chromiumChirho } from '@playwright/test';
import {
	readFile as readFileChirho,
	writeFile as writeFileChirho,
	mkdir as mkdirChirho
} from 'node:fs/promises';
import { createHash as createHashChirho } from 'node:crypto';
import { execFileSync as execFileSyncChirho } from 'node:child_process';
import {
	resolve as resolveChirho,
	relative as relativeChirho,
	sep as separatorChirho
} from 'node:path';
import { fileURLToPath as fileURLToPathChirho } from 'node:url';
import previewChirho from '../../../../data-chirho/reader-chirho/home-preview-chirho.json';

const rootChirho = fileURLToPathChirho(new URL('../../../../', import.meta.url));
const outputChirho = resolveChirho(process.argv[2] ?? '');
const allowedChirho = resolveChirho(
	rootChirho,
	'workspace-chirho/native-apps-chirho/app-store-creative-chirho'
);
if (process.argv.length !== 3 || !outputChirho.startsWith(allowedChirho + separatorChirho))
	throw new Error('Pass a dated output folder under the owned App Store creative workspace.');
await mkdirChirho(outputChirho, { recursive: true });
const hashChirho = (bytesChirho: Uint8Array | string) =>
	createHashChirho('sha256').update(bytesChirho).digest('hex');
const escapeChirho = (valueChirho: string): string =>
	valueChirho.replace(
		/[&<>"']/gu,
		(characterChirho) =>
			({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[characterChirho]!
	);
const sourcesChirho: { path_chirho: string; sha256_chirho: string; bytes_chirho: number }[] = [];
async function artworkChirho(pathChirho: string, shaChirho: string): Promise<string> {
	if (
		!/^\/(?:assets|media)-chirho\/[A-Za-z0-9/.-]+\.webp$/u.test(pathChirho) ||
		pathChirho.includes('..') ||
		!/^[a-f0-9]{64}$/u.test(shaChirho)
	)
		throw new Error('Unsafe artwork source.');
	const responseChirho = await fetch('https://hinneh.us' + pathChirho, { redirect: 'error' });
	if (!responseChirho.ok) throw new Error('Artwork source HTTP ' + responseChirho.status);
	const bytesChirho = new Uint8Array(await responseChirho.arrayBuffer());
	if (bytesChirho.length > 2 * 1024 * 1024 || hashChirho(bytesChirho) !== shaChirho)
		throw new Error('Published artwork differs from its pinned source.');
	sourcesChirho.push({
		path_chirho: pathChirho,
		sha256_chirho: shaChirho,
		bytes_chirho: bytesChirho.length
	});
	return 'data:image/webp;base64,' + Buffer.from(bytesChirho).toString('base64');
}
const excerptsChirho = previewChirho.excerpts_chirho;
for (const excerptChirho of excerptsChirho) {
	const bytesChirho = await readFileChirho(
		resolveChirho(rootChirho, 'static', excerptChirho.content_path_chirho.slice(1))
	);
	if (hashChirho(bytesChirho) !== excerptChirho.content_sha256_chirho)
		throw new Error('Preview source chapter changed.');
	const chapterChirho = JSON.parse(bytesChirho.toString());
	const verseChirho = chapterChirho.verses_chirho.find(
		(rowChirho: { id_chirho: string }) => rowChirho.id_chirho === excerptChirho.id_chirho
	);
	if (
		!verseChirho ||
		verseChirho.canonical_text_chirho !== excerptChirho.canonical_text_chirho ||
		excerptChirho.words_chirho.some(
			(wordChirho) =>
				!verseChirho.tokens_chirho.some(
					(tokenChirho: { id_chirho: string; text_chirho: string }) =>
						tokenChirho.id_chirho === wordChirho.id_chirho &&
						tokenChirho.text_chirho === wordChirho.text_chirho
				)
		)
	)
		throw new Error('Creative reading specimen differs from canonical source.');
}
const landscapeChirho = await artworkChirho(
	excerptsChirho[0].scene_chirho.asset_path_chirho,
	excerptsChirho[0].scene_chirho.sha256_chirho
);
const pictureUrlsChirho = new Map<string, string>();
for (const excerptChirho of excerptsChirho)
	for (const wordChirho of excerptChirho.words_chirho)
		pictureUrlsChirho.set(
			wordChirho.id_chirho,
			await artworkChirho(
				wordChirho.icon_chirho.asset_path_chirho,
				wordChirho.icon_chirho.sha256_chirho
			)
		);
const copyChirho = {
	en: {
		title_chirho: 'Behold the<br>Bible.',
		detail_chirho: 'In Hebrew and Greek.',
		helps_chirho: 'Colors · Symbols · Art · Sound',
		hebrew_chirho: 'HEBREW',
		greek_chirho: 'GREEK'
	},
	es: {
		title_chirho: 'Contempla<br>la Biblia.',
		detail_chirho: 'En hebreo y griego.',
		helps_chirho: 'Colores · Símbolos · Arte · Sonido',
		hebrew_chirho: 'HEBREO',
		greek_chirho: 'GRIEGO'
	}
};
const filesChirho: {
	path_chirho: string;
	sha256_chirho: string;
	bytes_chirho: number;
	width_chirho: number;
	height_chirho: number;
	locale_chirho: string;
	kind_chirho: string;
}[] = [];
const browserChirho = await chromiumChirho.launch();
try {
	for (const languageChirho of ['en', 'es'] as const) {
		const textChirho = copyChirho[languageChirho];
		const rowsChirho = excerptsChirho
			.map((excerptChirho) => {
				const wordsChirho = excerptChirho.words_chirho
					.map((wordChirho) => {
						const cueChirho = wordChirho.cues_chirho;
						return `<div class="word-chirho"><div class="surface-chirho" lang="${excerptChirho.language_chirho}" style="background:${cueChirho.background_chirho};border-bottom-color:${cueChirho.underline_chirho}"><span class="left-chirho">${escapeChirho(cueChirho.left_chirho)}</span><span class="center-chirho">${escapeChirho(cueChirho.center_chirho)}</span><span class="right-chirho">${escapeChirho(cueChirho.right_chirho)}</span><span class="text-chirho">${escapeChirho(wordChirho.text_chirho)}</span><span class="speaker-chirho"><svg width="43" height="43" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M11 5 6 9H3v6h3l5 4V5Z"/><path d="M15 8a6 6 0 0 1 0 8M18 5a10 10 0 0 1 0 14"/></svg></span></div><div class="picture-chirho" style="border-color:${cueChirho.outline_chirho}"><img src="${pictureUrlsChirho.get(wordChirho.id_chirho)}" alt=""></div><div class="gloss-chirho">${escapeChirho(languageChirho === 'es' ? wordChirho.spanish_gloss_chirho : wordChirho.gloss_chirho)}</div></div>`;
					})
					.join('');
				return `<div class="reading-chirho"><div class="label-chirho">${excerptChirho.language_chirho === 'he' ? textChirho.hebrew_chirho : textChirho.greek_chirho}</div><div class="words-chirho ${excerptChirho.language_chirho === 'he' ? 'hebrew-chirho' : 'greek-chirho'}">${wordsChirho}</div></div>`;
			})
			.join('');
		const pageChirho = await browserChirho.newPage({
			viewport: { width: 5244, height: 2950 },
			deviceScaleFactor: 1
		});
		await pageChirho.route('**/*', (routeChirho) => routeChirho.abort());
		await pageChirho.setContent(`<!doctype html><html lang="${languageChirho}"><meta charset="utf-8"><style>
    *{box-sizing:border-box}body{margin:0;width:5244px;height:2950px;overflow:hidden;background:#17392d;color:#fff9e9;font-family:Arial,sans-serif}
    .landscape-chirho{position:absolute;inset:0 0 0 1250px;width:3994px;height:2950px;object-fit:cover;object-position:center;mask-image:linear-gradient(90deg,transparent,#000 35%)}
    .veil-chirho{position:absolute;inset:0;background:linear-gradient(90deg,#17392d 0%,#17392df5 24%,#17392dbe 42%,#17392d1a 71%,#17392d09 100%)}
    .copy-chirho{position:absolute;left:610px;top:760px;width:2160px}.name-chirho{font-size:100px;letter-spacing:7px;font-weight:600;color:#e6c5a0}
    h1{font:300px/1.04 Georgia,serif;letter-spacing:-8px;margin:64px 0 54px}p{font-size:88px;line-height:1.35;margin:0;color:#fff8e8}
    .helps-chirho{font-size:56px;letter-spacing:1px;margin-top:76px;color:#e3eadb}
    .specimens-chirho{position:absolute;left:2960px;top:665px;width:1660px;padding:66px 65px 50px;background:#fbf8f0f5;color:#30463a;border:3px solid #fffdf4;border-radius:48px;box-shadow:0 40px 120px #142e294a}
    .reading-chirho+.reading-chirho{margin-top:60px;padding-top:48px;border-top:2px solid #c9d0c2}.label-chirho{font-size:43px;letter-spacing:7px;color:#6b705c;margin-bottom:38px}
    .words-chirho{display:flex;justify-content:space-between;gap:24px}.hebrew-chirho{direction:rtl}.greek-chirho{direction:ltr}.word-chirho{width:480px;text-align:center;direction:ltr}
    .surface-chirho{position:relative;height:224px;border-radius:18px;border-bottom:12px solid transparent;display:flex;align-items:center;justify-content:center;padding:25px 16px 5px}
    .text-chirho{font:126px/1.5 'SBL Hebrew','Times New Roman',serif;white-space:nowrap}.surface-chirho[lang=grc] .text-chirho{font-size:122px}
    .left-chirho,.center-chirho,.right-chirho{position:absolute;top:-36px;font:52px Georgia;color:#5e6658}.left-chirho{left:10px}.center-chirho{left:50%;transform:translateX(-50%)}.right-chirho{right:90px}
    .speaker-chirho{position:absolute;right:-11px;top:-16px;width:68px;height:61px;border:2px solid #bcc5ba;background:white;border-radius:14px;color:#56695a;display:flex;align-items:center;justify-content:center;direction:ltr}
    .picture-chirho{width:170px;height:170px;margin:32px auto 20px;background:#fffdf7;border:6px solid;border-radius:19px;padding:8px}.picture-chirho img{width:100%;height:100%;object-fit:contain}
    .gloss-chirho{font-size:40px;line-height:1.25;color:#5e6d5e;min-height:52px}.hebrew-chirho .text-chirho{direction:rtl}.greek-chirho .text-chirho{direction:ltr}
    </style><body><img class="landscape-chirho" src="${landscapeChirho}" alt=""><div class="veil-chirho"></div><div class="copy-chirho"><div class="name-chirho">Hinneh</div><h1>${textChirho.title_chirho}</h1><p>${escapeChirho(textChirho.detail_chirho)}</p><p class="helps-chirho">${escapeChirho(textChirho.helps_chirho)}</p></div><div class="specimens-chirho">${rowsChirho}</div></body></html>`);
		await pageChirho.evaluate(async () => {
			await document.fonts.ready;
			await Promise.all(Array.from(document.images, (imageChirho) => imageChirho.decode()));
		});
		const boxesChirho = await pageChirho
			.locator('.copy-chirho,.specimens-chirho')
			.evaluateAll((elementsChirho) =>
				elementsChirho.map((elementChirho) => {
					const rectangleChirho = elementChirho.getBoundingClientRect();
					return {
						left_chirho: rectangleChirho.left,
						top_chirho: rectangleChirho.top,
						right_chirho: rectangleChirho.right,
						bottom_chirho: rectangleChirho.bottom
					};
				})
			);
		if (
			boxesChirho.some(
				(boxChirho) =>
					boxChirho.left_chirho < 500 ||
					boxChirho.right_chirho > 4744 ||
					boxChirho.top_chirho < 400 ||
					boxChirho.bottom_chirho > 2550
			)
		)
			throw new Error('Key creative content falls outside the centered safe composition.');
		const pathChirho = resolveChirho(outputChirho, languageChirho + '-universal-chirho.png');
		await pageChirho.screenshot({ path: pathChirho });
		await pageChirho.close();
		execFileSyncChirho('magick', [pathChirho, '-alpha', 'off', 'PNG24:' + pathChirho]);
		const bytesChirho = await readFileChirho(pathChirho);
		if (
			bytesChirho.readUInt32BE(16) !== 5244 ||
			bytesChirho.readUInt32BE(20) !== 2950 ||
			bytesChirho[25] !== 2
		)
			throw new Error('Creative PNG must be exact-size RGB with no alpha.');
		filesChirho.push({
			path_chirho: relativeChirho(outputChirho, pathChirho),
			sha256_chirho: hashChirho(bytesChirho),
			bytes_chirho: bytesChirho.length,
			width_chirho: 5244,
			height_chirho: 2950,
			locale_chirho: languageChirho === 'en' ? 'en-US' : 'es-ES',
			kind_chirho: 'universal_creative'
		});
	}
} finally {
	await browserChirho.close();
}
await writeFileChirho(
	resolveChirho(outputChirho, 'creative-manifest-chirho.json'),
	JSON.stringify(
		{
			schema_version_chirho: 1,
			spec_chirho: 'i5244x2950a0',
			status_chirho: 'prepared_not_uploaded',
			source_preview_sha256_chirho: hashChirho(
				await readFileChirho(
					resolveChirho(rootChirho, 'data-chirho/reader-chirho/home-preview-chirho.json')
				)
			),
			source_assets_chirho: sourcesChirho,
			files_chirho: filesChirho
		},
		null,
		2
	) + '\n'
);
console.log(
	JSON.stringify({
		creative_assets_chirho: filesChirho.length,
		dimensions_chirho: [5244, 2950],
		output_chirho: outputChirho
	})
);
