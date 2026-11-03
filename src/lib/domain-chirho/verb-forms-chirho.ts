// For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life. — John 3:16 (KJV)

export const verbFormNamesChirho = [
	'qatal',
	'weqatal',
	'yiqtol',
	'wayyiqtol',
	'cohortative',
	'jussive',
	'imperative',
	'participle_active',
	'participle_passive',
	'infinitive_absolute',
	'infinitive_construct'
] as const;
export type VerbFormChirho = (typeof verbFormNamesChirho)[number];

export const verbConstructionNamesChirho = ['weyiqtol', 'qatal_copulative'] as const;
export type VerbConstructionChirho = (typeof verbConstructionNamesChirho)[number];

interface NamedVerbFormChirho {
	id_chirho: string;
	form_chirho: VerbFormChirho;
	construction_chirho: VerbConstructionChirho | null;
	label_chirho: string;
	marker_chirho: string;
	help_chirho: string;
	source_page_chirho: string;
}

// Each local teaching letter preserves a distinct sourced form or construction.
export const namedVerbFormsChirho: readonly NamedVerbFormChirho[] = [
	{
		id_chirho: 'weqatal-chirho',
		form_chirho: 'weqatal',
		construction_chirho: null,
		label_chirho: 'weqatal',
		marker_chirho: 'W',
		help_chirho:
			'The sequential perfect conjugation connects with an earlier verb in a sequence of time or thought. Its use depends on context, not a fixed English tense. It can look like ordinary waw + qatal, so the reader preserves the sourced classification rather than guessing from waw.',
		source_page_chirho: 'verb_sequential_perfect'
	},
	{
		id_chirho: 'wayyiqtol-chirho',
		form_chirho: 'wayyiqtol',
		construction_chirho: null,
		label_chirho: 'wayyiqtol',
		marker_chirho: 'Y',
		help_chirho:
			'The sequential imperfect conjugation often carries a narrative sequence forward. It has a specialized waw pattern and is distinct from ordinary waw + yiqtol. This full name requires sourced morphology; the presence of waw alone does not establish it.',
		source_page_chirho: 'verb_sequential_imperfect'
	},
	{
		id_chirho: 'weyiqtol-chirho',
		form_chirho: 'yiqtol',
		construction_chirho: 'weyiqtol',
		label_chirho: 'weyiqtol',
		marker_chirho: 'E',
		help_chirho:
			'Ordinary conjunction waw + yiqtol, with yiqtol retained as the underlying form. It is distinct from sequential wayyiqtol and does not by itself assign an English tense. This full label appears only when the construction is explicitly sourced.',
		source_page_chirho: 'verb_imperfect'
	},
	{
		id_chirho: 'jussive-chirho',
		form_chirho: 'jussive',
		construction_chirho: null,
		label_chirho: 'jussive',
		marker_chirho: 'J',
		help_chirho:
			'A volitional form expressing wishes, indirect commands and related meanings according to context. It is commonly third person, but second-person forms can express negative commands. It may resemble yiqtol; sourced jussive classification remains distinct from both yiqtol I and imperative M.',
		source_page_chirho: 'verb_jussive'
	},
	{
		id_chirho: 'cohortative-chirho',
		form_chirho: 'cohortative',
		construction_chirho: null,
		label_chirho: 'cohortative',
		marker_chirho: 'O',
		help_chirho:
			'A first-person volitional form expressing requests, intentions, wishes or related meanings according to context. It resembles yiqtol but retains its own sourced classification and a distinct local teaching code O.',
		source_page_chirho: 'verb_cohortative'
	},
	{
		id_chirho: 'qatal-copulative-chirho',
		form_chirho: 'qatal',
		construction_chirho: 'qatal_copulative',
		label_chirho: 'waw + qatal',
		marker_chirho: 'Q',
		help_chirho:
			'Qatal joined by an ordinary copulative waw. It is distinct from sequential weqatal even when the written forms look alike. Context and the recorded source classification determine the distinction; a prefixed waw is not enough.',
		source_page_chirho: 'verb_sequential_perfect'
	}
];

const stemNumbersChirho = new Map<string, string>([
	['qal', '1'],
	['niphal', '2'],
	['piel', '3'],
	['pual', '4'],
	['hiphil', '5'],
	['hophal', '6'],
	['hithpael', '7']
]);
const acceptedVerbFormsChirho = new Set<string>(verbFormNamesChirho);
const namedFormsChirho = new Map(
	namedVerbFormsChirho
		.filter((formChirho) => formChirho.construction_chirho === null)
		.map((formChirho) => [formChirho.form_chirho as string, formChirho] as const)
);
const namedConstructionsChirho = new Map(
	namedVerbFormsChirho
		.filter((formChirho) => formChirho.construction_chirho !== null)
		.map((formChirho) => [formChirho.construction_chirho as string, formChirho] as const)
);

export function verbStemNumberChirho(stemChirho: string | null | undefined): string {
	return stemChirho == null ? '' : (stemNumbersChirho.get(stemChirho) ?? '');
}

/** Full names supplement the basic letter codes; no spelling or waw inference occurs here. */
export function verbFormLabelChirho(
	formChirho: string | null | undefined,
	constructionChirho?: string | null
): string {
	if (constructionChirho != null) {
		const namedConstructionChirho = namedConstructionsChirho.get(constructionChirho);
		return namedConstructionChirho && namedConstructionChirho.form_chirho === formChirho
			? namedConstructionChirho.label_chirho
			: '';
	}
	return formChirho == null ? '' : (namedFormsChirho.get(formChirho)?.label_chirho ?? '');
}

const basicFormMarkersChirho: Readonly<Record<string, string>> = {
	qatal: 'P',
	yiqtol: 'I',
	imperative: 'M',
	participle_active: 'A',
	participle_passive: 'A',
	infinitive_construct: 'C',
	infinitive_absolute: 'B'
};

/** Display convention only: imported morphology and legacy source codes remain unchanged. */
export function verbFormMarkerChirho(
	formChirho: string | null | undefined,
	constructionChirho?: string | null
): string {
	if (constructionChirho != null) {
		const constructionRecordChirho = namedConstructionsChirho.get(constructionChirho);
		return constructionRecordChirho && constructionRecordChirho.form_chirho === formChirho
			? constructionRecordChirho.marker_chirho
			: '';
	}
	if (formChirho == null) return '';
	return (
		namedFormsChirho.get(formChirho)?.marker_chirho ?? basicFormMarkersChirho[formChirho] ?? ''
	);
}

/** Validate declared metadata only; provenance and verse morphology remain the caller's evidence. */
export function validateVerbClassificationChirho(
	formChirho: string | null | undefined,
	constructionChirho?: string | null
): void {
	if (formChirho != null && !acceptedVerbFormsChirho.has(formChirho)) {
		throw new Error(`Unsupported verb form classification: ${formChirho}`);
	}
	if (constructionChirho == null) return;
	const namedConstructionChirho = namedConstructionsChirho.get(constructionChirho);
	if (!namedConstructionChirho) {
		throw new Error(`Unsupported verb construction classification: ${constructionChirho}`);
	}
	if (namedConstructionChirho.form_chirho !== formChirho) {
		throw new Error(
			`Verb construction ${constructionChirho} requires underlying ${namedConstructionChirho.form_chirho}`
		);
	}
}
