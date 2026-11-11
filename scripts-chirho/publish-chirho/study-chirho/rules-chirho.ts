// For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life. — John 3:16 (KJV)
// Workflow: hosting-chirho/word-study-chirho.md. Only the current complete hash-bound study generation is public.
import { createHash as createHashChirho } from 'node:crypto';
import type { FilesChirho } from '../release_rules_chirho';
import {
	validStudyRecordChirho,
	type WordStudyChirho
} from '../../../src/lib/reader-chirho/study-chirho/word-study-client-chirho';
const ROOT_CHIRHO = 'study-chirho/';
const MANIFEST_CHIRHO = ROOT_CHIRHO + 'manifest-chirho.json';
const pathPatternChirho =
	/^study-chirho\/shards-chirho\/(en-(readers|terse)|es-terse)-chirho\/[0-3][a-f0-9]-chirho\/[a-f0-9]{64}-chirho\.json$/;
export function isStudyPathChirho(pathChirho: string): boolean {
	return pathChirho === MANIFEST_CHIRHO || pathPatternChirho.test(pathChirho);
}
const hashChirho = (bytesChirho: Uint8Array | string) =>
	createHashChirho('sha256').update(bytesChirho).digest('hex');
interface ManifestChirho {
	schema_version_chirho: number;
	edition_manifest_sha256_chirho: string;
	editions_chirho: Record<
		string,
		{
			language_chirho: string;
			mode_chirho: string;
			lemmas_chirho: number;
			shards_chirho: Record<
				string,
				{ path_chirho: string; sha256_chirho: string; bytes_chirho: number }
			>;
		}
	>;
}
export function verifyWordStudyChirho(filesChirho: FilesChirho, reasonsChirho: string[]): void {
	const pathsChirho = [...filesChirho.keys()].filter((pathChirho) =>
		pathChirho.startsWith(ROOT_CHIRHO)
	);
	if (!pathsChirho.length) return;
	try {
		const indexChirho = filesChirho.get(MANIFEST_CHIRHO);
		const editionsChirho = filesChirho.get('glosses-chirho/editions-chirho/manifest-chirho.json');
		if (!indexChirho || indexChirho.byteLength > 100_000 || !editionsChirho)
			throw new Error('missing study or edition index');
		const manifestChirho = JSON.parse(new TextDecoder().decode(indexChirho)) as ManifestChirho;
		if (
			manifestChirho.schema_version_chirho !== 1 ||
			manifestChirho.edition_manifest_sha256_chirho !== hashChirho(editionsChirho) ||
			!manifestChirho.editions_chirho ||
			Object.keys(manifestChirho.editions_chirho).length > 3
		)
			throw new Error('study provenance or schema differs');
		const declaredChirho = new Set([MANIFEST_CHIRHO]);
		for (const [editionKeyChirho, editionChirho] of Object.entries(
			manifestChirho.editions_chirho
		)) {
			if (
				!/^(en-(readers|terse)|es-terse)$/.test(editionKeyChirho) ||
				editionKeyChirho !== `${editionChirho.language_chirho}-${editionChirho.mode_chirho}` ||
				!editionChirho.shards_chirho ||
				Object.keys(editionChirho.shards_chirho).length > 64
			)
				throw new Error('study edition differs');
			let lemmasChirho = 0;
			for (const [partChirho, bindingChirho] of Object.entries(editionChirho.shards_chirho)) {
				const pathChirho = bindingChirho.path_chirho.slice(1);
				if (
					!/^[0-3][a-f0-9]$/.test(partChirho) ||
					pathChirho !==
						`study-chirho/shards-chirho/${editionKeyChirho}-chirho/${partChirho}-chirho/${bindingChirho.sha256_chirho}-chirho.json` ||
					!isStudyPathChirho(pathChirho) ||
					declaredChirho.has(pathChirho)
				)
					throw new Error('study path differs');
				const bytesChirho = filesChirho.get(pathChirho);
				if (
					!bytesChirho ||
					bytesChirho.byteLength > 2_000_000 ||
					bytesChirho.byteLength !== bindingChirho.bytes_chirho ||
					hashChirho(bytesChirho) !== bindingChirho.sha256_chirho
				)
					throw new Error('study shard missing or changed');
				const shardChirho = JSON.parse(new TextDecoder().decode(bytesChirho)) as {
					schema_version_chirho: number;
					edition_chirho: string;
					lemmas_chirho: Record<string, WordStudyChirho>;
				};
				if (
					shardChirho.schema_version_chirho !== 1 ||
					shardChirho.edition_chirho !== editionKeyChirho ||
					!shardChirho.lemmas_chirho ||
					Object.keys(shardChirho.lemmas_chirho).length > 1000
				)
					throw new Error('study shard identity differs');
				for (const [lemmaChirho, rowChirho] of Object.entries(shardChirho.lemmas_chirho)) {
					if (
						!/^[HG]\d+[a-z]?$/.test(lemmaChirho) ||
						(parseInt(hashChirho(lemmaChirho).slice(0, 2), 16) & 63)
							.toString(16)
							.padStart(2, '0') !== partChirho ||
						!validStudyRecordChirho(rowChirho)
					)
						throw new Error('study lemma partition or counts differ');
					lemmasChirho++;
				}
				declaredChirho.add(pathChirho);
			}
			if (lemmasChirho !== editionChirho.lemmas_chirho)
				throw new Error('study lemma inventory differs');
		}
		if (pathsChirho.some((pathChirho) => !declaredChirho.has(pathChirho)))
			throw new Error('unreferenced study file; retire old generations');
	} catch (errorChirho) {
		reasonsChirho.push(
			'Word study: ' + (errorChirho instanceof Error ? errorChirho.message : 'invalid data')
		);
	}
}
