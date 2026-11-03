// For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life. — John 3:16 (KJV)
// Workflow: spec-chirho/workflows-chirho/hosting-chirho/public-site-chirho.md.
import { createHash as createHashChirho } from 'node:crypto';
import { readFile as readFileChirho, writeFile as writeFileChirho } from 'node:fs/promises';
import { fileURLToPath as fileURLToPathChirho } from 'node:url';
import { validateLessonChirho, type LessonChirho } from '../../src/lib/domain-chirho/lesson-chirho';
import {
	validateGreekLessonChirho,
	greekCategoryChirho,
	type GreekLessonChirho
} from '../../src/lib/domain-chirho/greek-chirho';
import { cuesChirho } from '../../src/lib/domain-chirho/cues-chirho';
import { greekCuesChirho } from '../../src/lib/domain-chirho/greek-cues-chirho';
import { iconsForLessonChirho } from '../../src/lib/domain-chirho/media-chirho';
import { spokenWordChirho } from '../../src/lib/domain-chirho/pronunciation-chirho';
import { isRejectedAudioChirho } from '../../src/lib/domain-chirho/pronunciation-chirho/audio-reviews-chirho';

const rootChirho = new URL('../../', import.meta.url);
const destinationChirho = new URL('data-chirho/reader-chirho/home-preview-chirho.json', rootChirho);
const shaChirho = (bytesChirho: string | Uint8Array) =>
	createHashChirho('sha256').update(bytesChirho).digest('hex');
const jsonChirho = async (pathChirho: string) =>
	JSON.parse(await readFileChirho(new URL(pathChirho, rootChirho), 'utf8'));

/** Freeze two small real excerpts; no corpus, artwork or synthesis runs in the request path. */
async function excerptChirho(bookChirho: 'genesis-chirho' | 'john-chirho') {
	const greekChirho = bookChirho === 'john-chirho';
	const idChirho = greekChirho ? 'John.1.1' : 'Gen.1.1';
	const contentPathChirho = `static/content-chirho/${bookChirho}/chapter-01-chirho.json`;
	const bytesChirho = await readFileChirho(new URL(contentPathChirho, rootChirho));
	const manifestChirho = await jsonChirho(
		`static/content-chirho/${bookChirho}/manifest-chirho.json`
	);
	if (manifestChirho.chapters_chirho[0].sha256_chirho !== shaChirho(bytesChirho))
		throw new Error('Home excerpt content differs from its published manifest');
	const rawChirho = JSON.parse(bytesChirho.toString()).verses_chirho.find(
		(rowChirho: { id_chirho: string }) => rowChirho.id_chirho === idChirho
	);
	let lessonChirho: LessonChirho | GreekLessonChirho;
	if (greekChirho) {
		validateGreekLessonChirho(rawChirho);
		lessonChirho = rawChirho;
	} else lessonChirho = validateLessonChirho(rawChirho);
	const mediaChirho = await jsonChirho(`static/media-chirho/${bookChirho}/chapter-01-chirho.json`);
	const iconsChirho = iconsForLessonChirho(mediaChirho, lessonChirho);
	const sceneChirho = mediaChirho.scenes_chirho.find(
		(rowChirho: { lesson_id_chirho: string }) => rowChirho.lesson_id_chirho === idChirho
	);
	if (!sceneChirho) throw new Error('Home excerpt has no existing illustration');
	const spanishChirho = await jsonChirho(
		`static/glosses-chirho/es-chirho/${bookChirho}/chapter-01-chirho.json`
	);
	if (spanishChirho.content_sha256_chirho !== shaChirho(bytesChirho))
		throw new Error('Home Spanish glosses are bound to different source bytes');
	const audioChirho = await jsonChirho(`static/audio-chirho/${bookChirho}/chapter-01-chirho.json`);
	if (audioChirho.content_sha256_chirho !== shaChirho(bytesChirho))
		throw new Error('Home audio is bound to different source bytes');
	return {
		id_chirho: idChirho,
		language_chirho: lessonChirho.language_chirho,
		canonical_text_chirho: lessonChirho.canonical_text_chirho,
		content_path_chirho: '/' + contentPathChirho.slice('static/'.length),
		content_sha256_chirho: shaChirho(bytesChirho),
		scene_chirho: sceneChirho,
		words_chirho: lessonChirho.tokens_chirho.slice(0, 3).map((tokenChirho) => {
			const categoryChirho =
				'pos_chirho' in tokenChirho ? tokenChirho.pos_chirho : greekCategoryChirho(tokenChirho);
			const commonCueChirho = cuesChirho({
				...tokenChirho,
				pos_chirho: ['noun', 'verb', 'adjective'].includes(categoryChirho)
					? categoryChirho
					: 'particle'
			} as Parameters<typeof cuesChirho>[0]);
			const greekCueChirho = greekChirho
				? greekCuesChirho(tokenChirho as Parameters<typeof greekCuesChirho>[0])
				: null;
			const clipChirho = audioChirho.clips_chirho.find(
				(rowChirho: Record<string, unknown>) =>
					rowChirho.lesson_id_chirho === idChirho &&
					rowChirho.token_id_chirho === tokenChirho.id_chirho &&
					rowChirho.text_chirho === spokenWordChirho(tokenChirho) &&
					rowChirho.canonical_sha256_chirho === shaChirho(lessonChirho.canonical_text_chirho) &&
					!isRejectedAudioChirho(rowChirho.sha256_chirho) &&
					['audition', 'approved'].includes(String(rowChirho.review_chirho)) &&
					(greekChirho
						? rowChirho.pronunciation_chirho === 'modern_greek_aspirates' ||
							(rowChirho.pronunciation_chirho === 'modern_greek' &&
								!spokenWordChirho(tokenChirho).normalize('NFD').includes('\u0314'))
						: rowChirho.pronunciation_chirho === 'israeli_hebrew')
			);
			const iconChirho = iconsChirho[tokenChirho.id_chirho];
			return {
				id_chirho: tokenChirho.id_chirho,
				text_chirho: tokenChirho.text_chirho,
				gloss_chirho: tokenChirho.gloss_chirho,
				spanish_gloss_chirho: spanishChirho.glosses_chirho[tokenChirho.id_chirho] ?? null,
				gender_chirho: tokenChirho.gender_chirho,
				number_chirho: tokenChirho.number_chirho,
				pos_chirho: categoryChirho,
				cues_chirho: {
					background_chirho: commonCueChirho.background_chirho,
					underline_chirho: commonCueChirho.number_color_chirho,
					outline_chirho: commonCueChirho.pos_color_chirho,
					left_chirho: greekCueChirho?.left_chirho ?? commonCueChirho.stem_marker_chirho,
					center_chirho: greekCueChirho?.center_chirho ?? commonCueChirho.state_marker_chirho,
					right_chirho: greekCueChirho?.right_chirho ?? commonCueChirho.conjugation_marker_chirho
				},
				icon_chirho: iconChirho
					? {
							asset_path_chirho: iconChirho.asset_path_chirho,
							sha256_chirho: iconChirho.sha256_chirho,
							alt_chirho: iconChirho.alt_chirho,
							art_review_chirho: iconChirho.art_review_chirho,
							assignment_chirho: iconChirho.assignment_chirho ?? 'contextual'
						}
					: null,
				audio_chirho: clipChirho
					? {
							asset_path_chirho: String(clipChirho.asset_path_chirho),
							sha256_chirho: String(clipChirho.sha256_chirho),
							review_chirho: String(clipChirho.review_chirho)
						}
					: null
			};
		})
	};
}

const outputChirho =
	JSON.stringify(
		{
			schema_version_chirho: 1,
			excerpts_chirho: await Promise.all([
				excerptChirho('genesis-chirho'),
				excerptChirho('john-chirho')
			])
		},
		null,
		'\t'
	) + '\n';
if (process.argv.includes('--check')) {
	if ((await readFileChirho(destinationChirho, 'utf8')) !== outputChirho)
		throw new Error('Home preview differs from its source-bound build');
	console.log('Home preview matches its two published source excerpts.');
} else {
	await writeFileChirho(destinationChirho, outputChirho);
	console.log(
		`Wrote ${fileURLToPathChirho(destinationChirho)} (${Buffer.byteLength(outputChirho)} bytes).`
	);
}
