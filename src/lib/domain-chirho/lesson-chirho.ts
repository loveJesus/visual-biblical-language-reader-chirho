// For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life. — John 3:16 (KJV)

import {
	validateVerbClassificationChirho,
	type VerbFormChirho,
	type VerbConstructionChirho
} from './verb-forms-chirho';

export type PosChirho = 'noun' | 'verb' | 'adjective' | 'particle' | 'unknown';
export type GenderChirho = 'masculine' | 'feminine' | 'common' | 'na' | 'unknown';
export type NumberChirho = 'singular' | 'plural' | 'dual' | 'na' | 'unknown';
export type StateChirho = 'absolute' | 'construct' | 'na' | 'unknown';

export interface SourceChirho {
	id_chirho: string;
	title_chirho: string;
	url_chirho: string | null;
	revision_chirho: string;
	sha256_chirho: string;
	license_chirho: string;
	attribution_chirho: string;
}

export interface FormNoteChirho {
	kind_chirho: 'predictable_weak' | 'exceptional' | 'suppletive';
	text_chirho: string;
	source_chirho: string;
}

export interface TokenChirho {
	id_chirho: string;
	text_chirho: string;
	segments_chirho: string[];
	start_chirho: number;
	end_chirho: number;
	raw_morphology_chirho: string;
	lemma_id_chirho: string;
	lemma_augment_chirho: string | null;
	lexical_form_chirho: string;
	pos_chirho: PosChirho;
	gender_chirho: GenderChirho;
	number_chirho: NumberChirho;
	state_chirho: StateChirho;
	root_text_chirho: string | null;
	root_entry_id_chirho: string | null;
	root_status_chirho: 'traditional' | 'unresolved' | 'not_applicable';
	root_note_chirho: string;
	gloss_chirho: string | null;
	analysis_chirho: string;
	source_note_chirho: string;
	verb_code_chirho?: string;
	verb_stem_chirho?: string;
	verb_form_chirho?: VerbFormChirho;
	verb_construction_chirho?: VerbConstructionChirho;
	gloss_origin_chirho?: 'gbt_approved' | 'unavailable';
	raw_lemma_chirho?: string;
	source_language_chirho?: 'he' | 'arc';
	analysis_status_chirho?: 'source_review_required';
	lemma_assignment_status_chirho?: 'source_review_required';
	qere_chirho?: Array<Omit<TokenChirho, 'start_chirho' | 'end_chirho'>>;
	form_note_chirho?: FormNoteChirho;
}

export interface LessonChirho {
	schema_version_chirho: 1;
	id_chirho: string;
	language_chirho: 'he';
	reference_chirho: string;
	canonical_text_chirho: string;
	translation_chirho: string | null;
	kjv_verse_id_chirho?: string;
	source_notes_chirho?: { kind_chirho: string; code_chirho?: string; text_chirho: string }[];
	gloss_origin_chirho?: 'gbt_approved' | 'unavailable';
	tokens_chirho: TokenChirho[];
	sources_chirho: SourceChirho[];
}

export function lemmaKeyChirho(
	tokenChirho: Pick<TokenChirho, 'lemma_id_chirho' | 'lemma_augment_chirho'>
): string {
	return `${tokenChirho.lemma_id_chirho}${tokenChirho.lemma_augment_chirho ?? ''}`;
}

function recordChirho(valueChirho: unknown): Record<string, unknown> {
	if (!valueChirho || typeof valueChirho !== 'object' || Array.isArray(valueChirho)) {
		throw new Error('Expected a source record.');
	}
	return valueChirho as Record<string, unknown>;
}

function textChirho(valueChirho: unknown): asserts valueChirho is string {
	if (typeof valueChirho !== 'string' || !valueChirho.trim()) {
		throw new Error('A required source field is empty.');
	}
}

export function safeSourceUrlChirho(valueChirho: unknown): string {
	textChirho(valueChirho);
	const urlChirho = new URL(valueChirho);
	if (
		!['https:', 'http:'].includes(urlChirho.protocol) ||
		urlChirho.username ||
		urlChirho.password
	) {
		throw new Error('Source links must use HTTP(S) without embedded credentials.');
	}
	return valueChirho;
}

export function validateSegmentsChirho(tokenChirho: TokenChirho): void {
	if (
		!Array.isArray(tokenChirho.segments_chirho) ||
		!tokenChirho.segments_chirho.length ||
		tokenChirho.segments_chirho.some(
			(segmentChirho) => !segmentChirho || /^\p{M}/u.test(segmentChirho)
		) ||
		tokenChirho.segments_chirho.join('') !== tokenChirho.text_chirho
	) {
		throw new Error(`Invalid source segmentation: ${tokenChirho.id_chirho}`);
	}
}

// Workflow: spec-chirho/workflows-chirho/local-reader-chirho.md, fixture → validate → reader.
export function validateLessonChirho(inputChirho: unknown): LessonChirho {
	const lessonChirho = recordChirho(inputChirho);
	if (lessonChirho.schema_version_chirho !== 1 || lessonChirho.language_chirho !== 'he') {
		throw new Error('Unsupported lesson schema or language.');
	}
	for (const keyChirho of ['id_chirho', 'reference_chirho', 'canonical_text_chirho']) {
		textChirho(lessonChirho[keyChirho]);
	}
	if (lessonChirho.translation_chirho !== null) textChirho(lessonChirho.translation_chirho);
	if (
		!Array.isArray(lessonChirho.tokens_chirho) ||
		!lessonChirho.tokens_chirho.length ||
		lessonChirho.tokens_chirho.length > 200 ||
		!Array.isArray(lessonChirho.sources_chirho) ||
		!lessonChirho.sources_chirho.length
	) {
		throw new Error('Lesson tokens or source evidence are unavailable.');
	}
	const canonicalChirho = lessonChirho.canonical_text_chirho as string;
	let previousEndChirho = 0;
	const idsChirho = new Set<string>();
	for (const inputTokenChirho of lessonChirho.tokens_chirho) {
		const tokenChirho = recordChirho(inputTokenChirho);
		for (const keyChirho of [
			'id_chirho',
			'text_chirho',
			'raw_morphology_chirho',
			'lemma_id_chirho',
			'lexical_form_chirho',
			'analysis_chirho',
			'source_note_chirho'
		]) {
			textChirho(tokenChirho[keyChirho]);
		}
		if (tokenChirho.gloss_chirho !== null) textChirho(tokenChirho.gloss_chirho);
		const idChirho = tokenChirho.id_chirho as string;
		if (idsChirho.has(idChirho)) throw new Error('Duplicate source word ID.');
		idsChirho.add(idChirho);
		if (
			!Number.isInteger(tokenChirho.start_chirho) ||
			!Number.isInteger(tokenChirho.end_chirho) ||
			(tokenChirho.start_chirho as number) < previousEndChirho ||
			(tokenChirho.end_chirho as number) <= (tokenChirho.start_chirho as number) ||
			(tokenChirho.end_chirho as number) > canonicalChirho.length ||
			canonicalChirho.slice(
				tokenChirho.start_chirho as number,
				tokenChirho.end_chirho as number
			) !== tokenChirho.text_chirho
		)
			throw new Error(`Invalid canonical source span: ${idChirho}`);
		const gapChirho = canonicalChirho.slice(previousEndChirho, tokenChirho.start_chirho as number);
		if (/\p{L}|\p{M}/u.test(gapChirho))
			throw new Error('Unaccounted source word in canonical text.');
		previousEndChirho = tokenChirho.end_chirho as number;
		for (const [keyChirho, allowedChirho] of [
			['pos_chirho', ['noun', 'verb', 'adjective', 'particle', 'unknown']],
			['gender_chirho', ['masculine', 'feminine', 'common', 'na', 'unknown']],
			['number_chirho', ['singular', 'plural', 'dual', 'na', 'unknown']],
			['state_chirho', ['absolute', 'construct', 'na', 'unknown']],
			['root_status_chirho', ['traditional', 'unresolved', 'not_applicable']]
		] as const) {
			if (!(allowedChirho as readonly unknown[]).includes(tokenChirho[keyChirho])) {
				throw new Error(`Unsupported grammatical category: ${keyChirho}`);
			}
		}
		if (
			!/^(?:H\d+|oshb:[bcdiklms]|oshb:unresolved:[A-Za-z0-9]{1,16})$/u.test(
				tokenChirho.lemma_id_chirho as string
			)
		)
			throw new Error('Invalid Hebrew lemma identifier.');
		if (
			tokenChirho.lemma_augment_chirho !== null &&
			!/^[a-z]$/.test(String(tokenChirho.lemma_augment_chirho))
		)
			throw new Error('Invalid augmented lemma identifier.');
		if (tokenChirho.root_text_chirho !== null) textChirho(tokenChirho.root_text_chirho);
		if (
			tokenChirho.root_entry_id_chirho !== null &&
			!/^H\d+[a-z]?$/u.test(String(tokenChirho.root_entry_id_chirho))
		)
			throw new Error('Invalid traditional root entry.');
		textChirho(tokenChirho.root_note_chirho);
		if (
			tokenChirho.root_status_chirho === 'traditional' &&
			(tokenChirho.root_text_chirho === null || tokenChirho.root_entry_id_chirho === null)
		)
			throw new Error('Traditional roots require an explicit lexical relationship.');
		if (
			tokenChirho.root_status_chirho !== 'traditional' &&
			(tokenChirho.root_text_chirho !== null || tokenChirho.root_entry_id_chirho !== null)
		) {
			throw new Error('Unresolved or inapplicable roots must remain unassigned.');
		}
		validateSegmentsChirho(tokenChirho as unknown as TokenChirho);
		if (
			tokenChirho.verb_form_chirho !== undefined ||
			tokenChirho.verb_construction_chirho !== undefined ||
			tokenChirho.verb_stem_chirho !== undefined
		) {
			if (tokenChirho.pos_chirho !== 'verb') throw new Error('Verb metadata requires a verb.');
			validateVerbClassificationChirho(
				tokenChirho.verb_form_chirho as string | undefined,
				tokenChirho.verb_construction_chirho as string | undefined
			);
			const segmentsChirho = String(tokenChirho.raw_morphology_chirho).replace(/^H/, '').split('/');
			const headChirho = segmentsChirho.find((segmentChirho) => segmentChirho.startsWith('V'));
			const formsChirho: Record<string, string> = {
				p: 'qatal',
				q: 'weqatal',
				i: 'yiqtol',
				w: 'wayyiqtol',
				h: 'cohortative',
				j: 'jussive',
				v: 'imperative',
				r: 'participle_active',
				s: 'participle_passive',
				a: 'infinitive_absolute',
				c: 'infinitive_construct'
			};
			if (
				tokenChirho.verb_form_chirho !== undefined &&
				tokenChirho.verb_form_chirho !== formsChirho[headChirho?.[2] ?? '']
			)
				throw new Error('Verb form contradicts source morphology.');
			if (
				tokenChirho.verb_construction_chirho !== undefined &&
				(segmentsChirho.indexOf(headChirho ?? '') < 1 ||
					segmentsChirho[segmentsChirho.indexOf(headChirho ?? '') - 1] !== 'C')
			)
				throw new Error('Verb construction requires a sourced conjunction.');
			if (
				tokenChirho.verb_code_chirho !== undefined &&
				['weqatal', 'wayyiqtol', 'jussive', 'cohortative'].includes(
					String(tokenChirho.verb_form_chirho)
				)
			)
				throw new Error('Named forms cannot borrow a basic conjugation letter.');
		}
		if (
			tokenChirho.verb_code_chirho !== undefined &&
			(tokenChirho.pos_chirho !== 'verb' ||
				!/^[1-7][PIMACB]$/.test(String(tokenChirho.verb_code_chirho)))
		) {
			throw new Error('Invalid local verb teaching code.');
		}
		if (tokenChirho.form_note_chirho !== undefined) {
			const noteChirho = recordChirho(tokenChirho.form_note_chirho);
			if (
				!['predictable_weak', 'exceptional', 'suppletive'].includes(String(noteChirho.kind_chirho))
			)
				throw new Error('Invalid form-note classification.');
			textChirho(noteChirho.text_chirho);
			safeSourceUrlChirho(noteChirho.source_chirho);
		}
	}
	if (/\p{L}|\p{M}/u.test(canonicalChirho.slice(previousEndChirho)))
		throw new Error('Unaccounted final source word.');
	for (const inputSourceChirho of lessonChirho.sources_chirho) {
		const sourceChirho = recordChirho(inputSourceChirho);
		for (const keyChirho of [
			'id_chirho',
			'title_chirho',
			'revision_chirho',
			'sha256_chirho',
			'license_chirho',
			'attribution_chirho'
		])
			textChirho(sourceChirho[keyChirho]);
		if (sourceChirho.url_chirho !== null) safeSourceUrlChirho(sourceChirho.url_chirho);
		if (!/^[a-f0-9]{64}$/.test(String(sourceChirho.sha256_chirho)))
			throw new Error('Invalid source SHA-256.');
	}
	return inputChirho as LessonChirho;
}

export function safeAssetPathChirho(valueChirho: string): string {
	if (!/^\/assets-chirho\/[a-z0-9/-]+\.webp$/u.test(valueChirho))
		throw new Error('Invalid local lesson asset.');
	return valueChirho;
}

export function sourceRunsChirho(
	lessonChirho: LessonChirho
): Array<{ text_chirho: string; token_chirho?: TokenChirho }> {
	const runsChirho: Array<{ text_chirho: string; token_chirho?: TokenChirho }> = [];
	let cursorChirho = 0;
	for (const tokenChirho of lessonChirho.tokens_chirho) {
		if (tokenChirho.start_chirho > cursorChirho)
			runsChirho.push({
				text_chirho: lessonChirho.canonical_text_chirho.slice(
					cursorChirho,
					tokenChirho.start_chirho
				)
			});
		runsChirho.push({ text_chirho: tokenChirho.text_chirho, token_chirho: tokenChirho });
		cursorChirho = tokenChirho.end_chirho;
	}
	if (cursorChirho < lessonChirho.canonical_text_chirho.length)
		runsChirho.push({ text_chirho: lessonChirho.canonical_text_chirho.slice(cursorChirho) });
	return runsChirho;
}
