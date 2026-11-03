// For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life. — John 3:16 (KJV)

import { describe as describeChirho, expect as expectChirho, it as itChirho } from 'vitest';
import { legendRowsChirho } from '../../src/lib/domain-chirho/legend-chirho';
import {
	validateVerbClassificationChirho,
	verbFormLabelChirho,
	verbFormMarkerChirho,
	verbFormNamesChirho,
	verbStemNumberChirho
} from '../../src/lib/domain-chirho/verb-forms-chirho';

describeChirho('Verb stem teaching numbers', () => {
	itChirho.each([
		['qal', '1'],
		['niphal', '2'],
		['piel', '3'],
		['pual', '4'],
		['hiphil', '5'],
		['hophal', '6'],
		['hithpael', '7']
	])('maps sourced %s to its local number %s', (stemChirho, numberChirho) => {
		expectChirho(verbStemNumberChirho(stemChirho)).toBe(numberChirho);
	});
	itChirho.each([null, undefined, '', 'polel', 'Qal', 'q', 'unsupported'])(
		'leaves unsupported or absent stem %s unnumbered',
		(stemChirho) => {
			expectChirho(verbStemNumberChirho(stemChirho)).toBe('');
		}
	);
});

describeChirho('Sourced verb form labels', () => {
	itChirho.each(['weqatal', 'wayyiqtol', 'jussive', 'cohortative'])(
		'preserves the full %s name independently of its display code',
		(formChirho) => {
			expectChirho(verbFormLabelChirho(formChirho)).toBe(formChirho);
		}
	);
	itChirho.each([
		'qatal',
		'yiqtol',
		'imperative',
		'participle_active',
		'participle_passive',
		'infinitive_absolute',
		'infinitive_construct'
	])('leaves basic-code %s for the existing letter mapper', (formChirho) => {
		expectChirho(verbFormLabelChirho(formChirho)).toBe('');
	});
	itChirho('names ordinary conjunction constructions only with explicit matching metadata', () => {
		expectChirho(verbFormLabelChirho('yiqtol', 'weyiqtol')).toBe('weyiqtol');
		expectChirho(verbFormLabelChirho('qatal', 'qatal_copulative')).toBe('waw + qatal');
		expectChirho(verbFormLabelChirho('yiqtol', null)).toBe('');
		expectChirho(verbFormLabelChirho('qatal', undefined)).toBe('');
	});
	itChirho.each([null, undefined, '', 'w', 'q', 'j', 'h', 'weyiqtol', 'וְיִקְטֹל'])(
		'does not interpret raw codes, spelling or unsupported form %s',
		(formChirho) => {
			expectChirho(verbFormLabelChirho(formChirho)).toBe('');
		}
	);
	itChirho.each([
		['wayyiqtol', 'weyiqtol'],
		['weqatal', 'qatal_copulative'],
		['jussive', 'weyiqtol'],
		['qatal', 'weyiqtol'],
		['yiqtol', 'qatal_copulative'],
		[null, 'weyiqtol'],
		[undefined, 'qatal_copulative'],
		[null, 'waw'],
		[undefined, 'waw'],
		['yiqtol', 'waw']
	])('fails closed for incompatible %s / %s', (formChirho, constructionChirho) => {
		expectChirho(verbFormLabelChirho(formChirho, constructionChirho)).toBe('');
		expectChirho(() => validateVerbClassificationChirho(formChirho, constructionChirho)).toThrow(
			/verb (?:form|construction)|Verb construction/
		);
	});
});

describeChirho('Declared classification validation', () => {
	itChirho.each(verbFormNamesChirho)('accepts declared %s without a construction', (formChirho) => {
		expectChirho(() => validateVerbClassificationChirho(formChirho)).not.toThrow();
	});
	itChirho('allows missing classification while validating both supported constructions', () => {
		expectChirho(() => validateVerbClassificationChirho(undefined)).not.toThrow();
		expectChirho(() => validateVerbClassificationChirho(null, null)).not.toThrow();
		expectChirho(() => validateVerbClassificationChirho('yiqtol', 'weyiqtol')).not.toThrow();
		expectChirho(() => validateVerbClassificationChirho('qatal', 'qatal_copulative')).not.toThrow();
	});
	itChirho.each(['unknown', 'w', '', 'weyiqtol'])(
		'rejects unsupported declared form %s instead of replacing its morphology',
		(formChirho) => {
			expectChirho(() => validateVerbClassificationChirho(formChirho)).toThrow(
				/Unsupported verb form/
			);
		}
	);
});

describeChirho('Verb key source distinctions', () => {
	itChirho.each([
		['weqatal', null, 'verb_sequential_perfect'],
		['wayyiqtol', null, 'verb_sequential_imperfect'],
		['yiqtol', 'weyiqtol', 'verb_imperfect'],
		['jussive', null, 'verb_jussive'],
		['cohortative', null, 'verb_cohortative'],
		['qatal', 'qatal_copulative', 'verb_sequential_perfect']
	])(
		'shows %s / %s by full name with its grammar source',
		(formChirho, constructionChirho, pageChirho) => {
			const rowChirho = legendRowsChirho.find(
				(entryChirho) => entryChirho.label_chirho === 'Verb conjugation RIGHT'
			);
			const itemChirho = rowChirho?.items_chirho.find(
				(entryChirho) =>
					entryChirho.label_chirho ===
					`${verbFormMarkerChirho(formChirho, constructionChirho)} ${verbFormLabelChirho(formChirho, constructionChirho)}`
			);
			expectChirho(itemChirho).toBeDefined();
			expectChirho(itemChirho?.source_chirho).toBe(
				`https://uhg.readthedocs.io/en/stable/${pageChirho}.html`
			);
		}
	);
	itChirho.each([
		['qatal-chirho', 'P'],
		['yiqtol-chirho', 'I'],
		['imperative-chirho', 'M'],
		['participle-chirho', 'A'],
		['infinitive-construct-chirho', 'C'],
		['infinitive-absolute-chirho', 'B']
	])('retains the basic %s teaching code %s', (idChirho, codeChirho) => {
		const itemChirho = legendRowsChirho
			.flatMap((rowChirho) => rowChirho.items_chirho)
			.find((entryChirho) => entryChirho.id_chirho === idChirho);
		expectChirho(itemChirho?.label_chirho.split(' ')[0]).toBe(codeChirho);
	});
});

describeChirho('Compact display codes preserve sourced distinctions', () => {
	itChirho.each([
		['weqatal', null, 'W'],
		['wayyiqtol', null, 'Y'],
		['yiqtol', 'weyiqtol', 'E'],
		['jussive', null, 'J'],
		['cohortative', null, 'O'],
		['qatal', 'qatal_copulative', 'Q']
	])('keeps %s / %s distinct as %s', (formChirho, constructionChirho, markerChirho) => {
		expectChirho(verbFormMarkerChirho(formChirho, constructionChirho)).toBe(markerChirho);
	});
	itChirho('does not infer a construction or reuse a contradictory classification', () => {
		expectChirho(verbFormMarkerChirho('yiqtol')).toBe('I');
		expectChirho(verbFormMarkerChirho('qatal')).toBe('P');
		expectChirho(verbFormMarkerChirho('wayyiqtol', 'weyiqtol')).toBe('');
		expectChirho(verbFormMarkerChirho('וַיֹּאמֶר')).toBe('');
	});
});
