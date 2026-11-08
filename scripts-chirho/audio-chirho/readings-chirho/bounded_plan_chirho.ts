// For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life. — John 3:16 (KJV)
// Workflow: verse-media-chirho.md. Immutable, audited other-book chapters; no source/timing inference.
import {
	mkdir as mkdirChirho,
	open as openChirho,
	lstat as lstatChirho,
	realpath as realpathChirho
} from 'node:fs/promises';
import { join as joinChirho } from 'node:path';
import { isDeepStrictEqual as isDeepStrictEqualChirho } from 'node:util';
import { sha256Chirho } from '../audition_chirho';
import { boundedReadChirho } from '../local-greek-chirho/phase_chirho';
import { bibleBookChirho } from '../../../src/lib/bible-chirho/books-chirho';

export const BEERI_RUN_CHIRHO = 'workspace-chirho/audio-chirho/beeri-verses-2026-11-07-chirho';
export const BOUNDED_HOME_CHIRHO = `${BEERI_RUN_CHIRHO}/bounded-other-books-v1-chirho`;
export const AUDIT_PATH_CHIRHO =
	'workspace-chirho/native-apps-chirho/fleet-release-2026-11-08-chirho/beeri-other-books-chirho/readiness-chirho.json';
export const AUDIT_SHA_CHIRHO = 'af06c7583d1d69610bfdf0c649d86ac2acfd39e346a975f8c048f1ecc70e422e';
/** Finite phase state is shallow-sharded in groups of ten. */
export function phaseHomeChirho(phaseIdChirho: string) {
	const matchChirho = /^batch-(\d{3})-chirho$/.exec(phaseIdChirho);
	if (!matchChirho || Number(matchChirho[1]) < 1 || Number(matchChirho[1]) > 31)
		throw Error('Unowned phase state path');
	const shardChirho = String(Math.floor((Number(matchChirho[1]) - 1) / 10) * 10).padStart(3, '0');
	return `${BOUNDED_HOME_CHIRHO}/phases-chirho/${shardChirho}-chirho/${phaseIdChirho}`;
}
export interface BoundedChapterChirho {
	book_id_chirho: string;
	chapter_chirho: number;
	prepared_manifest_path_chirho: string;
	prepared_manifest_sha256_chirho: string;
	canonical_chapter_sha256_chirho: string;
	source_chapter_sha256_chirho: string;
	readings_chirho: number;
}
export interface BoundedPhaseChirho {
	id_chirho: string;
	chapters_chirho: BoundedChapterChirho[];
	readings_chirho: number;
}
export interface BoundedPlanChirho {
	schema_version_chirho: 1;
	audit_sha256_chirho: string;
	run_chirho: string;
	readings_chirho: number;
	chapters_chirho: number;
	excluded_chirho: { book_id_chirho: string; chapter_chirho: number; readings_chirho: number }[];
	phases_chirho: BoundedPhaseChirho[];
}
interface AuditChirho {
	metadata_count_chirho: number;
	prepared_chapters_chirho: number;
	held_positions_chirho: number;
	chapter_inputs_chirho: BoundedChapterChirho[];
}
export async function auditedPlanChirho(rootChirho: string): Promise<BoundedPlanChirho> {
	const bytesChirho = await boundedReadChirho(rootChirho, AUDIT_PATH_CHIRHO, 1024 ** 2);
	if (sha256Chirho(bytesChirho) !== AUDIT_SHA_CHIRHO)
		throw Error('Finite Beeri readiness audit changed');
	const auditChirho = JSON.parse(bytesChirho.toString()) as AuditChirho;
	if (
		auditChirho.metadata_count_chirho !== 11496 ||
		auditChirho.prepared_chapters_chirho !== 447 ||
		auditChirho.held_positions_chirho !== 3941
	)
		throw Error('Finite audit counts differ');
	const excludedChirho = [
		{ book_id_chirho: 'Ezra', chapter_chirho: 5, readings_chirho: 17 },
		{ book_id_chirho: 'Dan', chapter_chirho: 7, readings_chirho: 28 }
	];
	const seenChirho = new Set<string>();
	const chaptersChirho = auditChirho.chapter_inputs_chirho
		.map((rowChirho) => {
			const bookChirho = bibleBookChirho(rowChirho.book_id_chirho);
			const keyChirho = `${rowChirho.book_id_chirho}.${rowChirho.chapter_chirho}`;
			if (
				['Gen', 'Prov'].includes(rowChirho.book_id_chirho) ||
				bookChirho.language_chirho !== 'he' ||
				seenChirho.has(keyChirho) ||
				!Number.isSafeInteger(rowChirho.chapter_chirho) ||
				rowChirho.chapter_chirho < 1 ||
				rowChirho.prepared_manifest_path_chirho !==
					`${BEERI_RUN_CHIRHO}/books-chirho/${bookChirho.slug_chirho}/chapters-chirho/${String(rowChirho.chapter_chirho).padStart(3, '0')}-chirho/manifest-chirho.json` ||
				![
					rowChirho.prepared_manifest_sha256_chirho,
					rowChirho.canonical_chapter_sha256_chirho,
					rowChirho.source_chapter_sha256_chirho
				].every((shaChirho) => /^[a-f0-9]{64}$/.test(shaChirho)) ||
				!Number.isSafeInteger(rowChirho.readings_chirho) ||
				rowChirho.readings_chirho < 1 ||
				rowChirho.readings_chirho > 2000
			)
				throw Error('Audited chapter identity differs');
			seenChirho.add(keyChirho);
			return {
				book_id_chirho: rowChirho.book_id_chirho,
				chapter_chirho: rowChirho.chapter_chirho,
				prepared_manifest_path_chirho: rowChirho.prepared_manifest_path_chirho,
				prepared_manifest_sha256_chirho: rowChirho.prepared_manifest_sha256_chirho,
				canonical_chapter_sha256_chirho: rowChirho.canonical_chapter_sha256_chirho,
				source_chapter_sha256_chirho: rowChirho.source_chapter_sha256_chirho,
				readings_chirho: rowChirho.readings_chirho
			};
		})
		.filter(
			(rowChirho) =>
				!excludedChirho.some(
					(excludedRowChirho) =>
						rowChirho.book_id_chirho === excludedRowChirho.book_id_chirho &&
						rowChirho.chapter_chirho === excludedRowChirho.chapter_chirho
				)
		);
	if (
		chaptersChirho.length !== 445 ||
		chaptersChirho.reduce((sumChirho, rowChirho) => sumChirho + rowChirho.readings_chirho, 0) !==
			11451
	)
		throw Error('Eligible finite membership differs');
	const phasesChirho: BoundedPhaseChirho[] = [];
	const orderedBooksChirho = [
		'Obad',
		...new Set(
			chaptersChirho
				.map((rowChirho) => rowChirho.book_id_chirho)
				.filter((idChirho) => idChirho !== 'Obad')
		)
	];
	for (const idChirho of orderedBooksChirho) {
		const bookChaptersChirho = chaptersChirho
			.filter((rowChirho) => rowChirho.book_id_chirho === idChirho)
			.sort((leftChirho, rightChirho) => leftChirho.chapter_chirho - rightChirho.chapter_chirho);
		for (let offsetChirho = 0; offsetChirho < bookChaptersChirho.length; offsetChirho += 30) {
			const phaseChaptersChirho = bookChaptersChirho.slice(offsetChirho, offsetChirho + 30);
			phasesChirho.push({
				id_chirho: `batch-${String(phasesChirho.length + 1).padStart(3, '0')}-chirho`,
				chapters_chirho: phaseChaptersChirho,
				readings_chirho: phaseChaptersChirho.reduce(
					(sumChirho, rowChirho) => sumChirho + rowChirho.readings_chirho,
					0
				)
			});
		}
	}
	return {
		schema_version_chirho: 1,
		audit_sha256_chirho: AUDIT_SHA_CHIRHO,
		run_chirho: BEERI_RUN_CHIRHO,
		readings_chirho: 11451,
		chapters_chirho: 445,
		excluded_chirho: excludedChirho,
		phases_chirho: phasesChirho
	};
}
export async function readBoundedPlanChirho(rootChirho: string): Promise<BoundedPlanChirho> {
	const actualChirho = JSON.parse(
		(
			await boundedReadChirho(rootChirho, `${BOUNDED_HOME_CHIRHO}/plan-chirho.json`, 1024 ** 2)
		).toString()
	) as BoundedPlanChirho;
	const expectedChirho = await auditedPlanChirho(rootChirho);
	if (!isDeepStrictEqualChirho(actualChirho, expectedChirho))
		throw Error('Frozen bounded plan differs from finite audit');
	return actualChirho;
}
/** Create only contained, regular directories; refuse a redirected ancestor before any child write. */
export async function ownedDirectoryChirho(rootChirho: string, pathChirho: string) {
	if (
		pathChirho.startsWith('/') ||
		pathChirho.split('/').some((partChirho) => !partChirho || ['.', '..'].includes(partChirho))
	)
		throw Error('Unowned phase directory');
	let currentChirho = rootChirho;
	if ((await realpathChirho(rootChirho)) !== rootChirho) throw Error('Redirected root');
	for (const partChirho of pathChirho.split('/')) {
		currentChirho = joinChirho(currentChirho, partChirho);
		try {
			await mkdirChirho(currentChirho);
		} catch (errorChirho) {
			if ((errorChirho as NodeJS.ErrnoException).code !== 'EEXIST') throw errorChirho;
		}
		const infoChirho = await lstatChirho(currentChirho);
		if (
			!infoChirho.isDirectory() ||
			infoChirho.isSymbolicLink() ||
			(await realpathChirho(currentChirho)) !== currentChirho
		)
			throw Error('Redirected phase directory');
	}
}
export async function freezeBoundedPlanChirho(rootChirho: string): Promise<BoundedPlanChirho> {
	const planChirho = await auditedPlanChirho(rootChirho);
	const textChirho = JSON.stringify(planChirho, null, 2) + '\n';
	await ownedDirectoryChirho(rootChirho, BOUNDED_HOME_CHIRHO);
	let fileChirho;
	try {
		fileChirho = await openChirho(
			joinChirho(rootChirho, BOUNDED_HOME_CHIRHO, 'plan-chirho.json'),
			'wx'
		);
	} catch (errorChirho) {
		if ((errorChirho as NodeJS.ErrnoException).code !== 'EEXIST') throw errorChirho;
		await readBoundedPlanChirho(rootChirho);
		return planChirho;
	}
	try {
		await fileChirho.writeFile(textChirho);
		await fileChirho.sync();
	} finally {
		await fileChirho.close();
	}
	const directoryChirho = await openChirho(joinChirho(rootChirho, BOUNDED_HOME_CHIRHO), 'r');
	try {
		await directoryChirho.sync();
	} finally {
		await directoryChirho.close();
	}
	return planChirho;
}

if (import.meta.main) {
	const argumentsChirho = process.argv.slice(2);
	if (
		argumentsChirho.some((argumentChirho) => argumentChirho !== '--freeze-chirho') ||
		argumentsChirho.length > 1
	)
		throw Error('Expected only optional --freeze-chirho');
	const planChirho = argumentsChirho.length
		? await freezeBoundedPlanChirho(process.cwd())
		: await auditedPlanChirho(process.cwd());
	console.log(
		JSON.stringify({
			readings_chirho: planChirho.readings_chirho,
			chapters_chirho: planChirho.chapters_chirho,
			phases_chirho: planChirho.phases_chirho.length,
			frozen_chirho: argumentsChirho.length === 1
		})
	);
}
