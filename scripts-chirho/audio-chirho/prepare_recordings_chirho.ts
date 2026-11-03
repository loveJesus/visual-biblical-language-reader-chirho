// For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life. — John 3:16 (KJV)
// Offline installation only: no synthesis, provider request or approval-state change.
import { mkdir, readFile, writeFile, stat, unlink as unlinkChirho } from 'node:fs/promises';
import { join } from 'node:path';
import { execFileSync as execFileSyncChirho } from 'node:child_process';
import { sha256Chirho } from './audition_chirho';
import { format as formatChirho, resolveConfig as prettierConfigChirho } from 'prettier';
import { greekPronunciationChirho } from '../../src/lib/domain-chirho/pronunciation-chirho/chapter-recipe-chirho';
import {
	isRejectedAudioChirho,
	rejectedAudioChirho
} from '../../src/lib/domain-chirho/pronunciation-chirho/audio-reviews-chirho';

import { acquireLockChirho } from '../publish-chirho/r2_upload_watch_chirho';
import { audioPlanChirho } from './r2_recordings_chirho';
import {
	HEBREW_WORD_RECIPE_CHIRHO,
	GREEK_WORD_RECIPE_CHIRHO
} from '../../src/lib/domain-chirho/pronunciation-chirho/production-recipe-chirho';
const rootChirho = process.cwd();
await mkdir(join(rootChirho, 'build-chirho/r2-chirho'), { recursive: true });
const releaseCatalogueChirho = await acquireLockChirho(
	join(rootChirho, 'build-chirho/r2-chirho/audio-catalogue-chirho.lock')
);
try {
	const retainedChirho = new Map<string, Record<string, unknown>>();
	const currentIndexPathChirho = join(rootChirho, 'static/audio-chirho/manifest-chirho.json');
	const currentIndexChirho = await readFile(currentIndexPathChirho, 'utf8').catch(
		(errorChirho: NodeJS.ErrnoException) => {
			if (errorChirho.code === 'ENOENT') return null;
			throw errorChirho;
		}
	);
	if (currentIndexChirho) {
		await audioPlanChirho(rootChirho); // Verify before retaining prior production references.
		const indexChirho = JSON.parse(currentIndexChirho);
		for (const bookChirho of Object.values(indexChirho.books_chirho) as {
			chapters_chirho: { path_chirho: string }[];
		}[])
			for (const entryChirho of bookChirho.chapters_chirho) {
				const documentChirho = JSON.parse(
					await readFile(join(rootChirho, 'static', entryChirho.path_chirho), 'utf8')
				);
				const clipsChirho = documentChirho.clips_chirho.filter(
					(clipChirho: { recipe_id_chirho?: string }) =>
						[HEBREW_WORD_RECIPE_CHIRHO, GREEK_WORD_RECIPE_CHIRHO].includes(
							clipChirho.recipe_id_chirho ?? ''
						)
				);
				if (clipsChirho.length)
					retainedChirho.set(`${documentChirho.book_id_chirho}.${documentChirho.chapter_chirho}`, {
						...documentChirho,
						clips_chirho: clipsChirho
					});
			}
	}

	const originalFolderChirho = join(
		rootChirho,
		'workspace-chirho/audio-chirho/audition-2026-10-30-chirho'
	);
	const originalChirho = JSON.parse(
		await readFile(join(originalFolderChirho, 'audition-manifest-chirho.json'), 'utf8')
	);
	const auditionsChirho = [
		{ source_chirho: originalFolderChirho, manifest_chirho: originalChirho }
	];
	const trialPathChirho = join(originalFolderChirho, 'ipa-chirho/audition-manifest-chirho.json');
	const trialExistsChirho = await stat(trialPathChirho).then(
		() => true,
		(errorChirho: NodeJS.ErrnoException) => {
			if (errorChirho.code === 'ENOENT') return false;
			throw errorChirho;
		}
	);
	if (trialExistsChirho)
		auditionsChirho.push({
			source_chirho: join(originalFolderChirho, 'ipa-chirho'),
			manifest_chirho: JSON.parse(await readFile(trialPathChirho, 'utf8'))
		});
	const chapterTrialPathChirho = join(
		originalFolderChirho,
		'chapter-trial-chirho/audition-manifest-chirho.json'
	);
	if (
		await stat(chapterTrialPathChirho).then(
			() => true,
			(errorChirho: NodeJS.ErrnoException) => {
				if (errorChirho.code === 'ENOENT') return false;
				throw errorChirho;
			}
		)
	)
		auditionsChirho.push({
			source_chirho: join(originalFolderChirho, 'chapter-trial-chirho'),
			manifest_chirho: JSON.parse(await readFile(chapterTrialPathChirho, 'utf8'))
		});
	for (const nameChirho of ['flow-review-chirho', 'john-styles-chirho']) {
		const pathChirho = join(originalFolderChirho, nameChirho, 'audition-manifest-chirho.json');
		const existsChirho = await stat(pathChirho).then(
			() => true,
			(errorChirho: NodeJS.ErrnoException) => {
				if (errorChirho.code === 'ENOENT') return false;
				throw errorChirho;
			}
		);
		if (existsChirho)
			auditionsChirho.push({
				source_chirho: join(originalFolderChirho, nameChirho),
				manifest_chirho: JSON.parse(await readFile(pathChirho, 'utf8'))
			});
	}
	const jobsChirho = auditionsChirho.flatMap(
		({ source_chirho: sourceChirho, manifest_chirho: manifestChirho }) =>
			manifestChirho.jobs_chirho.flatMap((jobChirho: Record<string, unknown>) => {
				const receiptChirho = manifestChirho.clips_chirho.find(
					(rowChirho: { id_chirho: string }) => rowChirho.id_chirho === jobChirho.id_chirho
				);
				if (
					['/chapter-trial-chirho', '/flow-review-chirho', '/john-styles-chirho'].some(
						(endingChirho) => sourceChirho.endsWith(endingChirho)
					) &&
					receiptChirho?.state_chirho !== 'received'
				)
					return [];
				return [
					{
						sourceChirho,
						modelChirho: manifestChirho.model_chirho,
						jobChirho,
						receiptChirho
					}
				];
			})
	);
	const booksChirho: Record<
		string,
		{ chapters_chirho: { number_chirho: number; path_chirho: string; sha256_chirho: string }[] }
	> = {};
	const chaptersChirho = new Map<
		string,
		{
			schema_version_chirho: number;
			book_id_chirho: string;
			chapter_chirho: number;
			content_path_chirho: string;
			content_sha256_chirho: string;
			clips_chirho: Record<string, unknown>[];
		}
	>();
	for (const { jobChirho, receiptChirho, sourceChirho, modelChirho } of jobsChirho) {
		if (
			receiptChirho?.state_chirho !== 'received' ||
			!/^[a-z0-9-]+\.mp3$/.test(receiptChirho.path_chirho)
		)
			throw new Error('Audio receipt unavailable');
		const bytesChirho = await readFile(join(sourceChirho, receiptChirho.path_chirho));
		if (
			sha256Chirho(bytesChirho) !== receiptChirho.sha256_chirho ||
			bytesChirho.length !== receiptChirho.bytes_chirho
		)
			throw new Error('Original audio bytes changed');
		if (isRejectedAudioChirho(receiptChirho.sha256_chirho)) continue;
		const probeChirho = JSON.parse(
			execFileSyncChirho(
				'ffprobe',
				[
					'-v',
					'error',
					'-show_entries',
					'format=duration:stream=codec_name',
					'-of',
					'json',
					join(sourceChirho, receiptChirho.path_chirho)
				],
				{ encoding: 'utf8' }
			)
		);
		const durationChirho = Number(probeChirho.format.duration);
		if (
			probeChirho.streams.length !== 1 ||
			probeChirho.streams[0].codec_name !== 'mp3' ||
			!Number.isFinite(durationChirho) ||
			durationChirho <= 0 ||
			durationChirho > 120
		)
			throw new Error('Audio encoding refused');
		const [bookChirho, chapterTextChirho] = jobChirho.lesson_id_chirho.split('.');
		const folderChirho =
			bookChirho === 'Prov' ? 'proverbs-chirho' : bookChirho === 'John' ? 'john-chirho' : null;
		if (!folderChirho) throw new Error('Audition book unavailable');
		const keyChirho = `${bookChirho}.${chapterTextChirho}`;
		let chapterChirho = chaptersChirho.get(keyChirho);
		if (!chapterChirho) {
			const contentPathChirho = `/content-chirho/${folderChirho}/chapter-${chapterTextChirho.padStart(2, '0')}-chirho.json`;
			const contentChirho = await readFile(join(rootChirho, 'static', contentPathChirho));
			chapterChirho = {
				schema_version_chirho: 1,
				book_id_chirho: bookChirho,
				chapter_chirho: Number(chapterTextChirho),
				content_path_chirho: contentPathChirho,
				content_sha256_chirho: sha256Chirho(contentChirho),
				clips_chirho: []
			};
			chaptersChirho.set(keyChirho, chapterChirho);
		}
		const assetPathChirho = `/audio-chirho/sha256-chirho/${receiptChirho.sha256_chirho}-chirho.mp3`;
		await mkdir(join(rootChirho, 'static/audio-chirho/sha256-chirho'), { recursive: true });
		await writeFile(join(rootChirho, 'static', assetPathChirho), bytesChirho);
		chapterChirho.clips_chirho.push({
			...jobChirho,
			pronunciation_chirho:
				jobChirho.language_chirho === 'el'
					? greekPronunciationChirho(jobChirho.recipe_id_chirho)
					: 'israeli_hebrew',
			voice_name_chirho: receiptChirho.voice_name_chirho,
			asset_path_chirho: assetPathChirho,
			sha256_chirho: receiptChirho.sha256_chirho,
			bytes_chirho: bytesChirho.length,
			duration_chirho: durationChirho,
			review_chirho: 'audition',
			provider_chirho: 'ElevenLabs',
			model_chirho: modelChirho,
			license_chirho:
				'Generated during a paid ElevenLabs subscription using licensed public-library voices. Bible source text is public domain. Pronunciation awaits listener review.'
		});
	}
	for (const [keyChirho, documentChirho] of retainedChirho) {
		const currentChirho = chaptersChirho.get(keyChirho);
		if (currentChirho)
			currentChirho.clips_chirho.push(
				...(documentChirho.clips_chirho as Record<string, unknown>[])
			);
		else
			chaptersChirho.set(
				keyChirho,
				documentChirho as NonNullable<ReturnType<typeof chaptersChirho.get>>
			);
	}
	for (const chapterChirho of chaptersChirho.values()) {
		const folderChirho =
			chapterChirho.book_id_chirho === 'Prov'
				? 'proverbs-chirho'
				: chapterChirho.book_id_chirho === 'John'
					? 'john-chirho'
					: 'genesis-chirho';
		const pathChirho = `/audio-chirho/${folderChirho}/chapter-${String(chapterChirho.chapter_chirho).padStart(2, '0')}-chirho.json`;
		const textChirho = JSON.stringify(chapterChirho, null, 2) + '\n';
		await mkdir(join(rootChirho, 'static/audio-chirho', folderChirho), { recursive: true });
		await writeFile(join(rootChirho, 'static', pathChirho), textChirho);
		(booksChirho[chapterChirho.book_id_chirho] ??= { chapters_chirho: [] }).chapters_chirho.push({
			number_chirho: chapterChirho.chapter_chirho,
			path_chirho: pathChirho,
			sha256_chirho: sha256Chirho(textChirho)
		});
	}
	for (const bookChirho of Object.values(booksChirho))
		bookChirho.chapters_chirho.sort(
			(leftChirho, rightChirho) => leftChirho.number_chirho - rightChirho.number_chirho
		);
	await writeFile(
		join(rootChirho, 'static/audio-chirho/manifest-chirho.json'),
		JSON.stringify({ schema_version_chirho: 1, books_chirho: booksChirho }, null, 2) + '\n'
	);
	// Retire only exact rejected delivery copies; all original receipts and source MP3s stay intact.
	for (const rejectedChirho of rejectedAudioChirho) {
		const pathChirho = join(
			rootChirho,
			'static/audio-chirho/sha256-chirho',
			`${rejectedChirho.sha256_chirho}-chirho.mp3`
		);
		const existsChirho = await stat(pathChirho).then(
			() => true,
			(errorChirho: NodeJS.ErrnoException) => {
				if (errorChirho.code === 'ENOENT') return false;
				throw errorChirho;
			}
		);
		if (existsChirho) {
			if (sha256Chirho(await readFile(pathChirho)) !== rejectedChirho.sha256_chirho)
				throw new Error('Rejected delivery copy changed; refusing withdrawal');
			await unlinkChirho(pathChirho);
		}
	}
	if (trialExistsChirho) {
		const trialChirho = auditionsChirho[1].manifest_chirho;
		const escapeChirho = (valueChirho: string) =>
			valueChirho
				.replaceAll('&', '&amp;')
				.replaceAll('<', '&lt;')
				.replaceAll('>', '&gt;')
				.replaceAll('"', '&quot;');
		const cardsChirho = trialChirho.jobs_chirho
			.map(
				(jobChirho: {
					id_chirho: string;
					text_chirho: string;
					ipa_chirho: string;
					lesson_id_chirho: string;
					token_id_chirho: string | null;
				}) => {
					const clipChirho = trialChirho.clips_chirho.find(
						(rowChirho: { id_chirho: string }) => rowChirho.id_chirho === jobChirho.id_chirho
					);
					const previousJobChirho = originalChirho.jobs_chirho.find(
						(rowChirho: { lesson_id_chirho: string; token_id_chirho: string | null }) =>
							rowChirho.lesson_id_chirho === jobChirho.lesson_id_chirho &&
							rowChirho.token_id_chirho === jobChirho.token_id_chirho
					);
					const previousClipChirho = previousJobChirho
						? originalChirho.clips_chirho.find(
								(rowChirho: { id_chirho: string }) =>
									rowChirho.id_chirho === previousJobChirho.id_chirho
							)
						: null;
					return `<section><h2>${escapeChirho(jobChirho.lesson_id_chirho)}</h2><p dir="rtl" lang="he">${escapeChirho(jobChirho.text_chirho)}</p><p lang="he-fonipa">/${escapeChirho(jobChirho.ipa_chirho)}/</p><h3>IPA input</h3><audio controls preload="none" src="${escapeChirho(clipChirho.path_chirho)}"></audio>${previousClipChirho ? `<h3>Original Hebrew-text input${isRejectedAudioChirho(previousClipChirho.sha256_chirho) ? ' — rejected vowel and stress; comparison only' : ''}</h3><audio controls preload="none" src="../${escapeChirho(previousClipChirho.path_chirho)}"></audio>` : ''}</section>`;
				}
			)
			.join('\n');
		await writeFile(
			join(originalFolderChirho, 'ipa-chirho/index.html'),
			await formatChirho(
				`<!doctype html>\n<!-- For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life. — John 3:16 (KJV) -->\n<html lang="en"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Hinneh · IPA listening comparison</title><style>body{font:18px/1.6 system-ui;margin:auto;padding:24px;max-width:850px;background:#f7f5ef;color:#2c3b31}section{background:white;padding:20px;border:1px solid #d5d7ce;border-radius:12px;margin:20px 0}p[lang=he]{font-size:30px}audio{max-width:100%}</style><h1>IPA listening comparison</h1><p>Israeli Hebrew voice. These are AI auditions awaiting pronunciation review. Compare vowels, stress and naturalness. The Hebrew source is unchanged.</p>${cardsChirho}</html>\n`,
				{
					...(await prettierConfigChirho(join(originalFolderChirho, 'ipa-chirho/index.html'))),
					parser: 'html'
				}
			)
		);
	}
	console.log(
		`Prepared ${[...chaptersChirho.values()].reduce((totalChirho, chapterChirho) => totalChirho + chapterChirho.clips_chirho.length, 0)} pending audio auditions, bound to exact source chapters. Rejected originals retained outside delivery. No synthesis call.`
	);
} finally {
	await releaseCatalogueChirho();
}
