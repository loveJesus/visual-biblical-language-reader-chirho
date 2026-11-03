// For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life. — John 3:16 (KJV)

import { safeAssetPathChirho, type LessonChirho } from './lesson-chirho';
import type { GreekLessonChirho } from './greek-chirho';
import type { ContextualIconChirho } from './media-chirho';
import { isPassageIdChirho } from '../bible-chirho/books-chirho';

interface LexemeChirho {
	lemma_id_chirho: string;
	lemma_augment_chirho?: string | null;
	lexical_form_chirho?: string;
}

export function lemmaIconKeyChirho(lexemeChirho: LexemeChirho): string {
	if (!/^(?:[HG][1-9]\d{0,4}|oshb:[bcdiklms])$/u.test(lexemeChirho.lemma_id_chirho))
		throw new Error('Invalid picture lemma identity.');
	const augmentChirho = lexemeChirho.lemma_augment_chirho ?? null;
	if (augmentChirho !== null && !/^[a-z]{1,2}$/u.test(augmentChirho))
		throw new Error('Invalid picture lemma augment.');
	if (lexemeChirho.lemma_id_chirho.startsWith('G')) {
		if (
			augmentChirho !== null ||
			!lexemeChirho.lexical_form_chirho?.trim() ||
			lexemeChirho.lexical_form_chirho.length > 128
		)
			throw new Error('Greek pictures need their exact lexical form.');
		return JSON.stringify([lexemeChirho.lemma_id_chirho, lexemeChirho.lexical_form_chirho]);
	}
	return JSON.stringify([lexemeChirho.lemma_id_chirho, augmentChirho]);
}

function validateDefaultChirho(sourceChirho: ContextualIconChirho): string {
	const keyChirho = lemmaIconKeyChirho(sourceChirho);
	if (
		!sourceChirho ||
		!/^[a-z0-9][a-z0-9-]{0,127}$/u.test(sourceChirho.id_chirho ?? '') ||
		!isPassageIdChirho(sourceChirho.lesson_id_chirho ?? '') ||
		(!/^[A-Za-z0-9]{1,16}$/u.test(sourceChirho.token_id_chirho) &&
			!(
				sourceChirho.token_id_chirho.startsWith(sourceChirho.lesson_id_chirho + '!') &&
				/^![1-9]\d{0,2}$/u.test(
					sourceChirho.token_id_chirho.slice(sourceChirho.lesson_id_chirho!.length)
				)
			)) ||
		!sourceChirho.sense_id_chirho?.trim() ||
		!sourceChirho.contextual_meaning_chirho?.trim() ||
		!sourceChirho.alt_chirho?.trim() ||
		!['agent_reviewed', 'human_reviewed'].includes(sourceChirho.sense_review_chirho) ||
		!['pending', 'approved'].includes(sourceChirho.art_review_chirho) ||
		!Array.isArray(sourceChirho.evidence_refs_chirho) ||
		!sourceChirho.evidence_refs_chirho.length ||
		sourceChirho.evidence_refs_chirho.some(
			(refChirho) => !/^[a-z0-9][a-z0-9-]{0,127}$/u.test(refChirho)
		) ||
		!/^[a-f0-9]{64}$/u.test(sourceChirho.sha256_chirho) ||
		![sourceChirho.width_chirho, sourceChirho.height_chirho].every(
			(edgeChirho) => Number.isInteger(edgeChirho) && edgeChirho > 0 && edgeChirho <= 128
		)
	)
		throw new Error('Invalid general word picture.');
	safeAssetPathChirho(sourceChirho.asset_path_chirho);
	return keyChirho;
}

/** Workflow: shared-icons-chirho.md. A general lemma picture never asserts this verse's sense. */
export function lemmaIconsForLessonChirho(
	inputChirho: unknown,
	lessonChirho: LessonChirho | GreekLessonChirho
): Record<string, ContextualIconChirho> {
	if (inputChirho === undefined) return {};
	if (!Array.isArray(inputChirho) || inputChirho.length > 4096)
		throw new Error('Invalid bounded word-picture library.');
	const sourcesChirho = new Map<string, ContextualIconChirho>();
	for (const sourceChirho of inputChirho as ContextualIconChirho[]) {
		const keyChirho = validateDefaultChirho(sourceChirho);
		if (sourcesChirho.has(keyChirho)) throw new Error('Repeated default for the same full lemma.');
		sourcesChirho.set(keyChirho, sourceChirho);
	}
	const outputChirho: Record<string, ContextualIconChirho> = {};
	for (const tokenChirho of lessonChirho.tokens_chirho) {
		if (
			'lemma_assignment_status_chirho' in tokenChirho &&
			tokenChirho.lemma_assignment_status_chirho === 'source_review_required'
		)
			continue;
		const sourceChirho = sourcesChirho.get(lemmaIconKeyChirho(tokenChirho));
		if (!sourceChirho) continue;
		outputChirho[tokenChirho.id_chirho] = {
			...sourceChirho,
			lesson_id_chirho: lessonChirho.id_chirho,
			token_id_chirho: tokenChirho.id_chirho,
			assignment_chirho: 'lemma_default',
			source_lesson_id_chirho: sourceChirho.lesson_id_chirho,
			source_token_id_chirho: sourceChirho.token_id_chirho,
			selected_chirho: true,
			alternatives_chirho: undefined,
			context_text_chirho: undefined,
			context_gloss_chirho: undefined,
			context_canonical_text_chirho: undefined,
			display_authority_chirho:
				'General word picture. The contextual sense of this occurrence has not been selected.'
		};
	}
	return outputChirho;
}
