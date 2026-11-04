// For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life. — John 3:16 (KJV)
// Workflow: media-delivery-chirho.md. Freeze verified inputs; never generate or approve art.
import { archiveCompletedChirho } from './archive-chirho';
import { loadRepairsChirho } from './repairs-chirho';
import type { CompletedJobChirho } from './source-chirho';

export function sceneForJobChirho(completedChirho: CompletedJobChirho) {
	const jobChirho = completedChirho.job_chirho;
	const [bookChirho, chapterChirho, verseChirho] = jobChirho.verse_id_chirho.split('.');
	const referenceChirho = `${bookChirho} ${chapterChirho}:${verseChirho}`;
	const intentionChirho = jobChirho.prompt_chirho
		.replace(/^Watercolor storybook illustration: /u, '')
		.replace(/ Soft ink lines, textured paper, warm gentle light\.$/u, '');
	return {
		lesson_id_chirho: jobChirho.verse_id_chirho,
		asset_path_chirho: `/assets-chirho/scenes-chirho/mark-schnell-v1-chirho/chapter-${chapterChirho.padStart(2, '0')}-chirho/${jobChirho.job_id_chirho}-chirho.webp`,
		alt_chirho: `Draft illustration intended for ${referenceChirho}: ${intentionChirho}`,
		reading_note_chirho:
			'Placeholder illustration. This imaginative study aid has not been reviewed for visual or historical accuracy.',
		art_review_chirho: 'pending',
		prompt_chirho: jobChirho.prompt_chirho,
		tool_chirho: jobChirho.provider_chirho === 'runware' ? 'runware' : 'local_mflux',
		model_chirho:
			jobChirho.model_chirho ??
			'FLUX.1-schnell-mflux-4bit@0e0b247ac48b8bf86fd5b440813b7da5854e238b',
		seed_chirho: jobChirho.seed_chirho,
		source_binding_chirho: {
			content_path_chirho: jobChirho.chapter_path_chirho,
			content_sha256_chirho: jobChirho.chapter_sha256_chirho,
			canonical_sha256_chirho: jobChirho.canonical_sha256_chirho,
			prompt_sha256_chirho: jobChirho.prompt_sha256_chirho,
			original_png_sha256_chirho: completedChirho.output_sha256_chirho,
			...(completedChirho.replacement_chirho
				? { replacement_chirho: completedChirho.replacement_chirho }
				: {})
		}
	};
}

export async function installationPlanChirho(rootChirho: string) {
	const itemsChirho: {
		completed_chirho: CompletedJobChirho;
		scene_chirho: ReturnType<typeof sceneForJobChirho>;
	}[] = [];
	const selectedChirho = (await loadRepairsChirho(rootChirho)).selected_chirho;
	for (const completedChirho of selectedChirho) {
		const stateChirho = await archiveCompletedChirho(rootChirho, completedChirho, false);
		if (stateChirho.state_chirho !== 'already_archived')
			throw new Error(`${stateChirho.verse_id_chirho} lacks verified PNG preservation`);
		itemsChirho.push({
			completed_chirho: completedChirho,
			scene_chirho: sceneForJobChirho(completedChirho)
		});
	}
	if (
		itemsChirho.length !== 674 ||
		new Set(itemsChirho.map((itemChirho) => itemChirho.scene_chirho.lesson_id_chirho)).size !== 674
	)
		throw new Error('Mark installation requires all 674 unique source entries');
	itemsChirho.sort((leftChirho, rightChirho) =>
		leftChirho.scene_chirho.lesson_id_chirho.localeCompare(
			rightChirho.scene_chirho.lesson_id_chirho,
			'en',
			{ numeric: true }
		)
	);
	return { schema_version_chirho: 1, book_id_chirho: 'Mark', items_chirho: itemsChirho };
}
if (import.meta.main) console.log(JSON.stringify(await installationPlanChirho(process.cwd())));
