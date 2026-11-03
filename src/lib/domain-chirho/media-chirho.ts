// For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life. — John 3:16 (KJV)

import { lemmaKeyChirho, safeAssetPathChirho, type LessonChirho } from './lesson-chirho';
import type { GreekLessonChirho } from './greek-chirho';
import { lemmaIconsForLessonChirho } from './lemma-icons-chirho';
import { isPassageIdChirho } from '../bible-chirho/books-chirho';

export interface SceneImageChirho {
	asset_path_chirho: string;
	sha256_chirho?: string;
	alt_chirho: string;
	width_chirho: number;
	height_chirho: number;
	reading_note_chirho: string;
}

export interface ScenePresentationChirho extends SceneImageChirho {
	representation_reduced_chirho?: SceneImageChirho;
}

export function validateScenesChirho(
	inputChirho: unknown
): Record<string, ScenePresentationChirho> {
	const manifestChirho = inputChirho as {
		schema_version_chirho: number;
		scenes_chirho: Array<
			SceneImageChirho & {
				lesson_id_chirho: string;
				variant_chirho?: 'standard' | 'representation_reduced';
				sha256_chirho: string;
				art_review_chirho: string;
			}
		>;
	};
	if (
		manifestChirho?.schema_version_chirho !== 1 ||
		!Array.isArray(manifestChirho.scenes_chirho) ||
		manifestChirho.scenes_chirho.length > 1000
	)
		throw new Error('Invalid scene catalogue.');
	const scenesChirho: Record<string, ScenePresentationChirho> = {};
	const reducedChirho: Record<string, SceneImageChirho> = {};
	const hashesChirho = new Map<string, string>();
	for (const sceneChirho of manifestChirho.scenes_chirho) {
		const variantChirho =
			sceneChirho.variant_chirho === undefined ? 'standard' : sceneChirho.variant_chirho;
		const groupChirho = variantChirho === 'standard' ? scenesChirho : reducedChirho;
		if (
			!isPassageIdChirho(sceneChirho.lesson_id_chirho) ||
			!['standard', 'representation_reduced'].includes(variantChirho) ||
			groupChirho[sceneChirho.lesson_id_chirho] ||
			!/^[a-f0-9]{64}$/u.test(sceneChirho.sha256_chirho) ||
			!['pending', 'approved'].includes(sceneChirho.art_review_chirho) ||
			!sceneChirho.alt_chirho?.trim() ||
			!sceneChirho.reading_note_chirho?.trim() ||
			![sceneChirho.width_chirho, sceneChirho.height_chirho].every(
				(sizeChirho) => Number.isInteger(sizeChirho) && sizeChirho > 0 && sizeChirho <= 4096
			)
		)
			throw new Error('Invalid scene evidence.');
		hashesChirho.set(`${sceneChirho.lesson_id_chirho}:${variantChirho}`, sceneChirho.sha256_chirho);
		groupChirho[sceneChirho.lesson_id_chirho] = {
			asset_path_chirho: safeAssetPathChirho(sceneChirho.asset_path_chirho),
			sha256_chirho: sceneChirho.sha256_chirho,
			alt_chirho: sceneChirho.alt_chirho,
			width_chirho: sceneChirho.width_chirho,
			height_chirho: sceneChirho.height_chirho,
			reading_note_chirho: sceneChirho.reading_note_chirho
		};
	}
	for (const [lessonIdChirho, imageChirho] of Object.entries(reducedChirho)) {
		const standardChirho = scenesChirho[lessonIdChirho];
		if (
			!standardChirho ||
			standardChirho.asset_path_chirho === imageChirho.asset_path_chirho ||
			hashesChirho.get(`${lessonIdChirho}:standard`) ===
				hashesChirho.get(`${lessonIdChirho}:representation_reduced`)
		)
			throw new Error('A reduced scene needs its distinct Standard scene.');
		standardChirho.representation_reduced_chirho = imageChirho;
	}
	return scenesChirho;
}

export interface ContextualIconChirho {
	assignment_chirho?: 'contextual' | 'lemma_default';
	source_lesson_id_chirho?: string;
	source_token_id_chirho?: string;
	lesson_id_chirho?: string;
	id_chirho?: string;
	selected_chirho?: boolean;
	alternatives_chirho?: ContextualIconChirho[];
	token_id_chirho: string;
	lemma_id_chirho: string;
	lemma_augment_chirho: string | null;
	lexical_form_chirho?: string;
	sense_id_chirho: string;
	contextual_meaning_chirho: string;
	asset_path_chirho: string;
	alt_chirho: string;
	width_chirho: number;
	height_chirho: number;
	sha256_chirho: string;
	sense_review_chirho: 'agent_reviewed' | 'human_reviewed';
	art_review_chirho: 'pending' | 'approved';
	evidence_refs_chirho: string[];
	display_authority_chirho: string;
	context_text_chirho?: string;
	context_gloss_chirho?: string;
	context_canonical_text_chirho?: string;
}

/** Reused art stays attached only while the exact reviewed word and verse still agree. */
function iconContextMatchesChirho(
	iconChirho: ContextualIconChirho,
	lessonChirho: LessonChirho | GreekLessonChirho,
	tokenChirho: (LessonChirho | GreekLessonChirho)['tokens_chirho'][number]
): boolean {
	const pinsChirho = [
		iconChirho.context_text_chirho,
		iconChirho.context_gloss_chirho,
		iconChirho.context_canonical_text_chirho
	];
	if (pinsChirho.every((pinChirho) => pinChirho === undefined)) return true;
	return (
		pinsChirho.every((pinChirho) => typeof pinChirho === 'string') &&
		iconChirho.context_text_chirho === tokenChirho.text_chirho &&
		iconChirho.context_gloss_chirho === tokenChirho.gloss_chirho &&
		iconChirho.context_canonical_text_chirho === lessonChirho.canonical_text_chirho
	);
}

/** Workflow: local-reader-chirho.md. Show one picture for each other reviewed meaning. */
export function alternativeIconsChirho(iconChirho?: ContextualIconChirho): ContextualIconChirho[] {
	if (!iconChirho || iconChirho.assignment_chirho === 'lemma_default') return [];
	// Fold display-label case and spacing only; canonical words and lexical keys stay exact.
	const meaningKeyChirho = (meaningChirho: string) =>
		meaningChirho.trim().replace(/\s+/gu, ' ').toLowerCase();
	const sensesChirho = new Set([iconChirho.sense_id_chirho]);
	const meaningsChirho = new Set([meaningKeyChirho(iconChirho.contextual_meaning_chirho)]);
	const pathsChirho = new Set([iconChirho.asset_path_chirho]);
	const hashesChirho = new Set([iconChirho.sha256_chirho]);
	return (iconChirho.alternatives_chirho ?? []).filter((candidateChirho) => {
		const meaningChirho = meaningKeyChirho(candidateChirho.contextual_meaning_chirho);
		if (
			!['agent_reviewed', 'human_reviewed'].includes(candidateChirho.sense_review_chirho) ||
			sensesChirho.has(candidateChirho.sense_id_chirho) ||
			meaningsChirho.has(meaningChirho) ||
			pathsChirho.has(candidateChirho.asset_path_chirho) ||
			hashesChirho.has(candidateChirho.sha256_chirho)
		)
			return false;
		sensesChirho.add(candidateChirho.sense_id_chirho);
		meaningsChirho.add(meaningChirho);
		pathsChirho.add(candidateChirho.asset_path_chirho);
		hashesChirho.add(candidateChirho.sha256_chirho);
		return true;
	});
}

export function iconsForLessonChirho(
	inputChirho: unknown,
	lessonChirho: LessonChirho | GreekLessonChirho
) {
	if (!inputChirho || typeof inputChirho !== 'object') return {};
	const catalogueChirho = inputChirho as {
		schema_version_chirho?: unknown;
		icons_chirho?: unknown;
		lemma_icons_chirho?: unknown;
	};
	if (catalogueChirho.schema_version_chirho !== 1 || !Array.isArray(catalogueChirho.icons_chirho))
		return {};
	let defaultsChirho: Record<string, ContextualIconChirho> = {};
	try {
		defaultsChirho = lemmaIconsForLessonChirho(catalogueChirho.lemma_icons_chirho, lessonChirho);
	} catch {
		console.error('General word pictures could not be verified.');
	}
	const displayedTokensChirho = new Map(
		lessonChirho.tokens_chirho.map((tokenChirho) => [tokenChirho.id_chirho, tokenChirho])
	);
	const matchingChirho = catalogueChirho.icons_chirho.filter((iconChirho) => {
		const tokenChirho = displayedTokensChirho.get(iconChirho?.token_id_chirho);
		return (
			iconChirho &&
			typeof iconChirho === 'object' &&
			iconChirho.lesson_id_chirho === lessonChirho.id_chirho &&
			tokenChirho &&
			iconContextMatchesChirho(iconChirho, lessonChirho, tokenChirho)
		);
	});
	try {
		return {
			...defaultsChirho,
			...validateIconsChirho(
				{
					schema_version_chirho: 1,
					lesson_id_chirho: lessonChirho.id_chirho,
					icons_chirho: matchingChirho
				},
				lessonChirho
			)
		};
	} catch {
		console.error('A contextual icon record could not be verified.');
		return defaultsChirho;
	}
}

// Workflow: reviewed contextual sense → local artwork preview; art approval is a separate fact.
export function validateIconsChirho(
	inputChirho: unknown,
	lessonChirho: LessonChirho | GreekLessonChirho
): Record<string, ContextualIconChirho> {
	if (!inputChirho || typeof inputChirho !== 'object') throw new Error('Icon records unavailable.');
	const manifestChirho = inputChirho as {
		schema_version_chirho: number;
		lesson_id_chirho: string;
		icons_chirho: ContextualIconChirho[];
	};
	if (
		manifestChirho.schema_version_chirho !== 1 ||
		manifestChirho.lesson_id_chirho !== lessonChirho.id_chirho ||
		!Array.isArray(manifestChirho.icons_chirho) ||
		manifestChirho.icons_chirho.length > 128
	)
		throw new Error('Invalid contextual icon manifest.');
	const sourceIdsChirho = new Set(
		lessonChirho.sources_chirho.map((sourceChirho) => sourceChirho.id_chirho)
	);
	const tokensChirho = new Map(
		lessonChirho.tokens_chirho.map((tokenChirho) => [tokenChirho.id_chirho, tokenChirho])
	);
	const iconsChirho: Record<string, ContextualIconChirho> = {};
	const alternativesChirho = new Map<string, ContextualIconChirho[]>();
	for (const iconChirho of manifestChirho.icons_chirho) {
		if (iconChirho.assignment_chirho !== undefined && iconChirho.assignment_chirho !== 'contextual')
			throw new Error('A general word picture is not a contextual sense assignment.');
		const tokenChirho = tokensChirho.get(iconChirho.token_id_chirho);
		if (
			!tokenChirho ||
			(lessonChirho.language_chirho === 'grc'
				? tokenChirho.lemma_id_chirho !== iconChirho.lemma_id_chirho ||
					!('lexical_form_chirho' in tokenChirho) ||
					tokenChirho.lexical_form_chirho !== iconChirho.lexical_form_chirho ||
					iconChirho.lemma_augment_chirho !== null
				: lemmaKeyChirho(tokenChirho as LessonChirho['tokens_chirho'][number]) !==
					lemmaKeyChirho(iconChirho))
		)
			throw new Error('Icon does not match its contextual word.');
		if (!iconContextMatchesChirho(iconChirho, lessonChirho, tokenChirho))
			throw new Error('Icon context changed after its sense review.');
		if (
			!['agent_reviewed', 'human_reviewed'].includes(iconChirho.sense_review_chirho) ||
			!['pending', 'approved'].includes(iconChirho.art_review_chirho)
		)
			throw new Error('Unreviewed sense or invalid artwork state.');
		for (const keyChirho of [
			'sense_id_chirho',
			'contextual_meaning_chirho',
			'alt_chirho',
			'display_authority_chirho'
		] as const)
			if (typeof iconChirho[keyChirho] !== 'string' || !iconChirho[keyChirho].trim())
				throw new Error('Incomplete contextual icon evidence.');
		if (
			!Array.isArray(iconChirho.evidence_refs_chirho) ||
			!iconChirho.evidence_refs_chirho.length ||
			iconChirho.evidence_refs_chirho.some((sourceChirho) => !sourceIdsChirho.has(sourceChirho))
		)
			throw new Error('Unknown contextual icon evidence.');
		if (
			![iconChirho.width_chirho, iconChirho.height_chirho].every(
				(sizeChirho) => Number.isInteger(sizeChirho) && sizeChirho > 0 && sizeChirho <= 128
			) ||
			!/^[a-f0-9]{64}$/.test(iconChirho.sha256_chirho)
		)
			throw new Error('Invalid WebP icon dimensions or checksum.');
		safeAssetPathChirho(iconChirho.asset_path_chirho);
		const groupChirho = alternativesChirho.get(iconChirho.token_id_chirho) ?? [];
		groupChirho.push(iconChirho);
		alternativesChirho.set(iconChirho.token_id_chirho, groupChirho);
		if (iconChirho.selected_chirho !== false) {
			if (iconsChirho[iconChirho.token_id_chirho])
				throw new Error('Duplicate contextual selection.');
			iconsChirho[iconChirho.token_id_chirho] = { ...iconChirho };
		}
	}
	for (const [tokenIdChirho, groupChirho] of alternativesChirho) {
		if (!iconsChirho[tokenIdChirho]) throw new Error('Contextual icon selection missing.');
		iconsChirho[tokenIdChirho].alternatives_chirho = groupChirho;
	}
	return iconsChirho;
}
