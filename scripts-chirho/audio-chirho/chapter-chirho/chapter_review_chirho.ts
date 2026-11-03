// For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life. — John 3:16 (KJV)
// Workflow: local-reader-chirho.md. Local, cached listening comparisons; never calls a speech provider.
import { readFile, writeFile } from 'node:fs/promises';
import { join, resolve } from 'node:path';
import { sha256Chirho, type AudioJobChirho } from '../audition_chirho';
import { format as formatChirho, resolveConfig as resolveConfigChirho } from 'prettier';

const escapeChirho = (valueChirho: string) =>
	valueChirho
		.replaceAll('&', '&amp;')
		.replaceAll('<', '&lt;')
		.replaceAll('>', '&gt;')
		.replaceAll('"', '&quot;');
export async function chapterReviewChirho(rootChirho: string) {
	const homeChirho = join(rootChirho, 'workspace-chirho/audio-chirho/audition-2026-10-30-chirho');
	const folderChirho = join(homeChirho, 'chapter-trial-chirho');
	const manifestChirho = JSON.parse(
		await readFile(join(folderChirho, 'audition-manifest-chirho.json'), 'utf8')
	) as {
		jobs_chirho: AudioJobChirho[];
		clips_chirho: {
			id_chirho: string;
			state_chirho: string;
			path_chirho?: string;
			sha256_chirho?: string;
		}[];
	};
	const originalChirho = JSON.parse(
		await readFile(join(homeChirho, 'audition-manifest-chirho.json'), 'utf8')
	);
	const ipaChirho = JSON.parse(
		await readFile(join(homeChirho, 'ipa-chirho/audition-manifest-chirho.json'), 'utf8')
	);
	const sectionsChirho: string[] = [];
	for (const [bookChirho, labelChirho, expectedChirho] of [
		['Prov', 'Proverbs 26', 28],
		['John', 'John 1', 51]
	] as const) {
		const jobsChirho = manifestChirho.jobs_chirho.filter((jobChirho) =>
			jobChirho.lesson_id_chirho.startsWith(bookChirho + '.')
		);
		jobsChirho.sort(
			(leftChirho, rightChirho) =>
				Number(leftChirho.lesson_id_chirho.split('.')[2]) -
				Number(rightChirho.lesson_id_chirho.split('.')[2])
		);
		const cardsChirho: string[] = [];
		let countChirho = 0;
		for (const jobChirho of jobsChirho) {
			const receiptChirho = manifestChirho.clips_chirho.find(
				(rowChirho) => rowChirho.id_chirho === jobChirho.id_chirho
			);
			if (receiptChirho?.state_chirho !== 'received') continue;
			if (
				!receiptChirho.path_chirho ||
				!/^[a-z0-9-]+\.mp3$/.test(receiptChirho.path_chirho) ||
				sha256Chirho(await readFile(join(folderChirho, receiptChirho.path_chirho))) !==
					receiptChirho.sha256_chirho
			)
				throw new Error('Chapter listening source changed');
			countChirho++;
			let baselineChirho = '';
			if (jobChirho.lesson_id_chirho.endsWith('.1')) {
				const baselineManifestChirho = bookChirho === 'Prov' ? ipaChirho : originalChirho;
				const baselineJobChirho = baselineManifestChirho.jobs_chirho.find(
					(rowChirho: AudioJobChirho) =>
						rowChirho.lesson_id_chirho === jobChirho.lesson_id_chirho &&
						rowChirho.token_id_chirho === null
				);
				const baselineReceiptChirho = baselineManifestChirho.clips_chirho.find(
					(rowChirho: { id_chirho: string }) => rowChirho.id_chirho === baselineJobChirho?.id_chirho
				);
				if (baselineReceiptChirho)
					baselineChirho = `<details><summary>Earlier reading for comparison</summary><audio controls preload="none" aria-label="Earlier ${escapeChirho(jobChirho.lesson_id_chirho)}" src="../${bookChirho === 'Prov' ? 'ipa-chirho/' : ''}${escapeChirho(baselineReceiptChirho.path_chirho)}"></audio></details>`;
			}
			cardsChirho.push(
				`<article><h3>${escapeChirho(jobChirho.lesson_id_chirho)}</h3><p lang="${bookChirho === 'Prov' ? 'he' : 'grc'}" dir="${bookChirho === 'Prov' ? 'rtl' : 'ltr'}">${escapeChirho(jobChirho.text_chirho)}</p><audio controls preload="none" data-book-chirho="${bookChirho}" aria-label="Phrased ${escapeChirho(jobChirho.lesson_id_chirho)}" src="${escapeChirho(receiptChirho.path_chirho)}"></audio>${jobChirho.ipa_chirho ? `<details><summary>Pronunciation input</summary><p class="ipa-chirho" lang="he-fonipa">/${escapeChirho(jobChirho.ipa_chirho)}/</p></details>` : ''}${baselineChirho}</article>`
			);
		}
		sectionsChirho.push(
			`<section><h2>${labelChirho}</h2><p>${countChirho} of ${expectedChirho} verses cached. ${bookChirho === 'Prov' ? 'Israeli Hebrew, controlled IPA and source-informed phrase breaks.' : 'Modern Greek, using the accented Greek source.'}</p><button type="button" data-play-chirho="${bookChirho}">Play available chapter verses</button> <button type="button" data-stop-chirho>Stop</button>${cardsChirho.join('\n')}</section>`
		);
	}
	const comparisonsChirho: string[] = [];
	for (const trialChirho of ['flow-review-chirho', 'john-styles-chirho']) {
		let candidateChirho;
		try {
			candidateChirho = JSON.parse(
				await readFile(join(homeChirho, trialChirho, 'audition-manifest-chirho.json'), 'utf8')
			);
		} catch (errorChirho) {
			if ((errorChirho as NodeJS.ErrnoException).code === 'ENOENT') continue;
			throw errorChirho;
		}
		for (const jobChirho of candidateChirho.jobs_chirho as AudioJobChirho[]) {
			const receiptChirho = candidateChirho.clips_chirho.find(
				(rowChirho: { id_chirho: string }) => rowChirho.id_chirho === jobChirho.id_chirho
			);
			if (receiptChirho?.state_chirho !== 'received') continue;
			if (
				!/^[a-z0-9-]+\.mp3$/.test(receiptChirho.path_chirho) ||
				sha256Chirho(await readFile(join(homeChirho, trialChirho, receiptChirho.path_chirho))) !==
					receiptChirho.sha256_chirho
			)
				throw new Error('Comparison recording changed');
			const labelChirho =
				jobChirho.language_chirho === 'he'
					? 'Connected Hebrew'
					: jobChirho.recipe_id_chirho === 'erasmian-teaching-v1-chirho'
						? 'Erasmian'
						: 'Modern with Aspirates';
			comparisonsChirho.push(
				`<article><h3>${escapeChirho(jobChirho.lesson_id_chirho)} · ${labelChirho}</h3><p lang="${jobChirho.language_chirho === 'he' ? 'he' : 'grc'}" dir="${jobChirho.language_chirho === 'he' ? 'rtl' : 'ltr'}">${escapeChirho(jobChirho.text_chirho)}</p><audio controls preload="none" ${jobChirho.language_chirho === 'el' ? 'data-greek-audio-chirho' : ''} aria-label="${labelChirho} ${escapeChirho(jobChirho.lesson_id_chirho)}" src="../${trialChirho}/${escapeChirho(receiptChirho.path_chirho)}"></audio></article>`
			);
		}
	}
	const htmlChirho = `<!doctype html>
<!-- For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life. — John 3:16 (KJV) -->
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Hinneh · Chapter listening trials</title><link rel="icon" href="data:,"><style>body{font:18px/1.6 system-ui;background:#f8f6ef;color:#2c3b31;max-width:900px;margin:auto;padding:24px}article{background:white;border:1px solid #d6d8ce;border-radius:12px;padding:20px;margin:20px 0}p[lang=he],p[lang=grc]{font:28px/1.8 Georgia,serif}audio{width:100%;margin:10px 0}button{font:inherit;border:1px solid #9ea799;background:white;border-radius:8px;padding:9px 12px;cursor:pointer}button:focus-visible,summary:focus-visible{outline:3px solid #405a87}.ipa-chirho{overflow-wrap:anywhere}#status-chirho{min-height:1.6em}</style></head><body><h1>Chapter listening trials</h1><p>Warm, measured AI readings. Compare pronunciation, word spacing and phrase rhythm. The written Hebrew and Greek are unchanged. These trials await pronunciation review; their pauses are not a sung cantillation.</p><p id="status-chirho" role="status" aria-live="polite">Choose a verse or play the available chapter verses.</p><label>Greek playback speed <select id="greek-rate-chirho"><option value="0.88" selected>88% · 12% slower</option><option value="1">Original speed</option></select></label><section><h2>New pronunciation comparisons</h2>${comparisonsChirho.join('\n')}</section>${sectionsChirho.join('\n')}<script>
const greekRateChirho=document.getElementById('greek-rate-chirho');
function setGreekRateChirho(){document.querySelectorAll('audio[data-book-chirho="John"],audio[data-greek-audio-chirho]').forEach((audioChirho)=>{audioChirho.playbackRate=Number(greekRateChirho.value);audioChirho.defaultPlaybackRate=Number(greekRateChirho.value);audioChirho.preservesPitch=true})}
greekRateChirho.addEventListener('change',setGreekRateChirho);setGreekRateChirho();
let playlistChirho = [], positionChirho = 0, timerChirho;
const statusChirho = document.getElementById('status-chirho');
function stopChirho(){clearTimeout(timerChirho);document.querySelectorAll('audio').forEach((audioChirho)=>{audioChirho.pause();audioChirho.onended=null});playlistChirho=[];statusChirho.textContent='Stopped.'}
function nextChirho(){const audioChirho=playlistChirho[positionChirho++];if(!audioChirho){statusChirho.textContent='Available chapter verses finished.';return}audioChirho.currentTime=0;statusChirho.textContent=audioChirho.getAttribute('aria-label');audioChirho.onended=()=>{timerChirho=setTimeout(nextChirho,650)};audioChirho.play().catch(()=>{statusChirho.textContent='Playback paused. Use the verse audio controls.'})}
document.querySelectorAll('[data-play-chirho]').forEach((buttonChirho)=>buttonChirho.addEventListener('click',()=>{stopChirho();playlistChirho=Array.from(document.querySelectorAll('audio[data-book-chirho="'+buttonChirho.dataset.playChirho+'"]'));positionChirho=0;nextChirho()}));
document.querySelectorAll('[data-stop-chirho]').forEach((buttonChirho)=>buttonChirho.addEventListener('click',stopChirho));
</script></body></html>\n`;
	await writeFile(
		join(folderChirho, 'index.html'),
		await formatChirho(htmlChirho, {
			...(await resolveConfigChirho(join(folderChirho, 'index.html'))),
			parser: 'html'
		})
	);
	return {
		path_chirho: join(folderChirho, 'index.html'),
		received_chirho: manifestChirho.clips_chirho.filter(
			(rowChirho) => rowChirho.state_chirho === 'received'
		).length
	};
}
if (import.meta.main) console.log(JSON.stringify(await chapterReviewChirho(resolve('.'))));
