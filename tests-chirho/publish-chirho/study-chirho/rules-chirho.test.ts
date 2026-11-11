// For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life. — John 3:16 (KJV)
import { createHash as createHashChirho } from 'node:crypto';
import { describe as describeChirho, it as itChirho, expect as expectChirho } from 'vitest';
import { verifyWordStudyChirho } from '../../../scripts-chirho/publish-chirho/study-chirho/rules-chirho';
import {
	classifyPathChirho,
	type FilesChirho
} from '../../../scripts-chirho/publish-chirho/release_rules_chirho';
const encodeChirho = (valueChirho: unknown) =>
	new TextEncoder().encode(JSON.stringify(valueChirho));
const hashChirho = (valueChirho: Uint8Array | string) =>
	createHashChirho('sha256').update(valueChirho).digest('hex');
function fixtureChirho() {
	const keyChirho = 'G3056';
	const partChirho = (parseInt(hashChirho(keyChirho).slice(0, 2), 16) & 63)
		.toString(16)
		.padStart(2, '0');
	const sourceChirho = encodeChirho({ edition_chirho: 'fixture-chirho' });
	const bodyChirho = encodeChirho({
		schema_version_chirho: 1,
		edition_chirho: 'en-readers',
		lemmas_chirho: {
			G3056: {
				total_chirho: 2,
				covered_chirho: 1,
				empty_chirho: 0,
				glosses_chirho: [
					{
						gloss_chirho: 'word',
						count_chirho: 1,
						examples_chirho: [
							{ verse_chirho: 'John.1.1', reference_chirho: 'John 1:1', text_chirho: 'Λόγος' }
						]
					}
				]
			}
		}
	});
	const shaChirho = hashChirho(bodyChirho);
	const pathChirho = `study-chirho/shards-chirho/en-readers-chirho/${partChirho}-chirho/${shaChirho}-chirho.json`;
	const manifestChirho = {
		schema_version_chirho: 1,
		edition_manifest_sha256_chirho: hashChirho(sourceChirho),
		editions_chirho: {
			'en-readers': {
				language_chirho: 'en',
				mode_chirho: 'readers',
				lemmas_chirho: 1,
				shards_chirho: {
					[partChirho]: {
						path_chirho: '/' + pathChirho,
						sha256_chirho: shaChirho,
						bytes_chirho: bodyChirho.length
					}
				}
			}
		}
	};
	const filesChirho: FilesChirho = new Map([
		['study-chirho/manifest-chirho.json', encodeChirho(manifestChirho)],
		[pathChirho, bodyChirho],
		['glosses-chirho/editions-chirho/manifest-chirho.json', sourceChirho]
	]);
	return { filesChirho, pathChirho };
}
describeChirho('study publication bounds', () => {
	itChirho('accepts a coherent static generation and no database route', () => {
		const fixtureValueChirho = fixtureChirho();
		const reasonsChirho: string[] = [];
		verifyWordStudyChirho(fixtureValueChirho.filesChirho, reasonsChirho);
		expectChirho(reasonsChirho).toEqual([]);
		expectChirho(classifyPathChirho(fixtureValueChirho.pathChirho)).toBe('static');
		expectChirho(classifyPathChirho('study-chirho/private-chirho.sql')).not.toBe('static');
	});
	itChirho('refuses changed source provenance and missing or changed shards', () => {
		for (const mutationChirho of ['source', 'missing', 'body']) {
			const fixtureValueChirho = fixtureChirho();
			if (mutationChirho === 'source')
				fixtureValueChirho.filesChirho.set(
					'glosses-chirho/editions-chirho/manifest-chirho.json',
					encodeChirho({ other_chirho: true })
				);
			if (mutationChirho === 'missing')
				fixtureValueChirho.filesChirho.delete(fixtureValueChirho.pathChirho);
			if (mutationChirho === 'body')
				fixtureValueChirho.filesChirho.set(
					fixtureValueChirho.pathChirho,
					encodeChirho({ changed_chirho: true })
				);
			const reasonsChirho: string[] = [];
			verifyWordStudyChirho(fixtureValueChirho.filesChirho, reasonsChirho);
			expectChirho(reasonsChirho).toHaveLength(1);
		}
	});
	itChirho('refuses stale unreferenced generations instead of growing the published corpus', () => {
		const fixtureValueChirho = fixtureChirho();
		fixtureValueChirho.filesChirho.set(
			fixtureValueChirho.pathChirho.replace(/[a-f0-9]{64}/, '0'.repeat(64)),
			encodeChirho({ old_chirho: true })
		);
		const reasonsChirho: string[] = [];
		verifyWordStudyChirho(fixtureValueChirho.filesChirho, reasonsChirho);
		expectChirho(reasonsChirho[0]).toContain('unreferenced');
	});
});
