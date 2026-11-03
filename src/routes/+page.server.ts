// For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life. — John 3:16 (KJV)

import fixtureChirho from '../../data-chirho/lessons-chirho/proverbs-26-1-chirho.json';
import linksChirho from '../../data-chirho/reader-chirho/lemma-links-chirho.json';
import presentationChirho from '../../data-chirho/reader-chirho/proverbs-26-1-presentation-chirho.json';
import glossFixtureChirho from '../../data-chirho/glosses-chirho/proverbs-26-1-glosses-chirho.json';
import iconManifestChirho from '../../data-chirho/media-chirho/proverbs-26-1-icons-chirho.json';
import sceneManifestChirho from '../../data-chirho/media-chirho/proverbs-scenes-chirho.json';
import { validateScenesChirho, validateIconsChirho } from '$lib/domain-chirho/media-chirho';
import { validateGlossesChirho, type GlossLanguageChirho } from '$lib/domain-chirho/glosses-chirho';
import { error as httpErrorChirho } from '@sveltejs/kit';
import {
	lemmaKeyChirho,
	validateLessonChirho,
	safeAssetPathChirho,
	type LessonChirho
} from '$lib/domain-chirho/lesson-chirho';

export const prerender = true;

export function load() {
	let lessonChirho: LessonChirho;
	try {
		lessonChirho = validateLessonChirho(fixtureChirho);
	} catch (validationErrorChirho) {
		console.error(
			'Hinneh lesson validation failed:',
			validationErrorChirho instanceof Error ? validationErrorChirho.message : 'invalid source'
		);
		throw httpErrorChirho(503, 'The lesson source could not be validated.');
	}
	const lemmaLinksChirho: Record<string, string> = {};
	let languagesChirho: GlossLanguageChirho[] = [];
	try {
		languagesChirho = validateGlossesChirho(glossFixtureChirho, lessonChirho);
	} catch {
		console.error('Hinneh reviewed glosses unavailable; retaining the source lesson.');
	}
	for (const linkChirho of linksChirho.links_chirho) {
		const keyChirho = lemmaKeyChirho(linkChirho);
		if (
			linkChirho.verified_chirho &&
			linkChirho.url_chirho === `https://lexicon-chirho.bible.systems/lemma-chirho/${keyChirho}` &&
			/^H\d+[a-z]?$/u.test(keyChirho)
		)
			lemmaLinksChirho[keyChirho] = linkChirho.url_chirho;
	}
	return {
		scenes_chirho: validateScenesChirho(sceneManifestChirho),
		icons_chirho: validateIconsChirho(iconManifestChirho, lessonChirho),
		languages_chirho: languagesChirho,
		lesson_chirho: lessonChirho,
		lemma_links_chirho: lemmaLinksChirho,
		presentation_chirho: {
			...presentationChirho,
			asset_path_chirho: safeAssetPathChirho(presentationChirho.asset_path_chirho)
		}
	};
}
