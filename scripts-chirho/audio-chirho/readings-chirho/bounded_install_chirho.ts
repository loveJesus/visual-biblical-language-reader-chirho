// For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life. — John 3:16 (KJV)
// Workflow: verse-media-chirho.md. One source-bound phase archives before a recoverable catalogue commit.
import { join as joinChirho } from 'node:path';
import { isDeepStrictEqual as isDeepStrictEqualChirho } from 'node:util';
import { sha256Chirho, writeChirho } from '../audition_chirho';
import {
	audioReceiptsChirho,
	uploadAudioChirho,
	type AudioUploadChirho
} from '../r2_recordings_chirho';
import { acquireLockChirho, type TargetChirho } from '../../publish-chirho/r2_upload_watch_chirho';
import {
	commitCatalogueChirho,
	recoverCatalogueChirho,
	type CatalogueWriteChirho
} from '../local-greek-chirho/catalogue_commit_chirho';
import { boundedReadChirho } from '../local-greek-chirho/phase_chirho';
import { objectRequestChirho } from '../../publish-chirho/r2-chirho/object-store-chirho';
import { bibleBookChirho } from '../../../src/lib/bible-chirho/books-chirho';
import libraryChirho from '../../../config-chirho/media-library-chirho.json';
import {
	BEERI_RUN_CHIRHO,
	readBoundedPlanChirho,
	ownedDirectoryChirho,
	phaseHomeChirho,
	type BoundedPhaseChirho
} from './bounded_plan_chirho';
import {
	readingContextChirho,
	validatePreparedChapterChirho,
	type ValidatedRowChirho,
	type AudioChapterChirho,
	type AudioIndexChirho
} from './validation_chirho';

import {
	PROVERBS_PHASE_CHIRHO,
	PROVERBS_HOME_CHIRHO,
	readProverbsPhaseChirho,
	loadProverbsDefinitionChirho,
	verifyPriorProverbsChirho
} from './proverbs_phase_chirho';

interface ArchiveOptionsChirho {
	target_chirho: TargetChirho;
	fetch_chirho?: typeof fetch;
	sleep_chirho?: (millisecondsChirho: number) => Promise<void>;
}
interface PhaseRowsChirho {
	path_chirho: string;
	rows_chirho: ValidatedRowChirho[];
}
async function optionalReadChirho(rootChirho: string, pathChirho: string, limitChirho: number) {
	try {
		return await boundedReadChirho(rootChirho, pathChirho, limitChirho);
	} catch (errorChirho) {
		if ((errorChirho as NodeJS.ErrnoException).code === 'ENOENT') return null;
		throw errorChirho;
	}
}
export const phaseBindingChirho = (phaseChirho: BoundedPhaseChirho) =>
	sha256Chirho(JSON.stringify(phaseChirho));
async function validatePhaseRowsChirho(
	rootChirho: string,
	phaseChirho: BoundedPhaseChirho
): Promise<PhaseRowsChirho[]> {
	if (!phaseChirho.chapters_chirho.length || phaseChirho.chapters_chirho.length > 30)
		throw Error('Bounded phase chapter count refused');
	const contextChirho = await readingContextChirho(rootChirho);
	const definitionChirho =
		phaseChirho.id_chirho === PROVERBS_PHASE_CHIRHO
			? (await loadProverbsDefinitionChirho(rootChirho)).definition_chirho
			: null;
	const groupsChirho: PhaseRowsChirho[] = [];
	for (const chapterChirho of phaseChirho.chapters_chirho) {
		const validatedChirho = await validatePreparedChapterChirho(
			rootChirho,
			joinChirho(rootChirho, BEERI_RUN_CHIRHO),
			chapterChirho.book_id_chirho,
			`${String(chapterChirho.chapter_chirho).padStart(3, '0')}-chirho`,
			contextChirho,
			definitionChirho,
			chapterChirho.prepared_manifest_sha256_chirho
		);
		if (
			validatedChirho.rows_chirho.length !== chapterChirho.readings_chirho ||
			validatedChirho.rows_chirho.some(
				(rowChirho) =>
					rowChirho.reading_chirho.content_sha256_chirho !==
						chapterChirho.canonical_chapter_sha256_chirho ||
					rowChirho.reading_chirho.source_chirho.chapter_sha256_chirho !==
						chapterChirho.source_chapter_sha256_chirho
			)
		)
			throw Error('Audited phase source/count differs');
		groupsChirho.push({
			path_chirho: validatedChirho.audio_path_chirho,
			rows_chirho: validatedChirho.rows_chirho
		});
	}
	if (
		groupsChirho.reduce(
			(sumChirho, groupChirho) => sumChirho + groupChirho.rows_chirho.length,
			0
		) !== phaseChirho.readings_chirho
	)
		throw Error('Audited phase reading count differs');
	return groupsChirho;
}
function uploadsForChirho(groupsChirho: PhaseRowsChirho[]): AudioUploadChirho[] {
	return groupsChirho.flatMap((groupChirho) =>
		groupChirho.rows_chirho.map((rowChirho) => ({
			asset_path_chirho: String(rowChirho.clip_chirho.asset_path_chirho),
			key_chirho: `audio-chirho/sha256-chirho/${rowChirho.reading_chirho.sha256_chirho}.mp3`,
			sha256_chirho: rowChirho.reading_chirho.sha256_chirho,
			bytes_chirho: rowChirho.bytes_chirho.length
		}))
	);
}
async function requireReceiptsChirho(rootChirho: string, uploadsChirho: AudioUploadChirho[]) {
	const receiptsChirho = await audioReceiptsChirho(rootChirho);
	for (const uploadChirho of uploadsChirho) {
		const receiptChirho = receiptsChirho.get(uploadChirho.key_chirho);
		if (
			!receiptChirho ||
			receiptChirho.bytes_chirho !== uploadChirho.bytes_chirho ||
			receiptChirho.asset_path_chirho !== uploadChirho.asset_path_chirho
		)
			throw Error('Phase archive readback proof missing');
	}
}
async function catalogueWritesChirho(
	rootChirho: string,
	groupsChirho: PhaseRowsChirho[],
	requireInstalledChirho: boolean
): Promise<CatalogueWriteChirho[]> {
	const indexPathChirho = 'static/audio-chirho/manifest-chirho.json';
	const indexBytesChirho = await boundedReadChirho(rootChirho, indexPathChirho, 2_000_000);
	const indexChirho = JSON.parse(indexBytesChirho.toString()) as AudioIndexChirho;
	const writesChirho: CatalogueWriteChirho[] = [];
	for (const groupChirho of groupsChirho) {
		const firstChirho = groupChirho.rows_chirho[0].reading_chirho;
		const [bookIdChirho, chapterTextChirho] = firstChirho.lesson_id_chirho.split('.');
		const bookChirho = bibleBookChirho(bookIdChirho);
		if (
			groupChirho.path_chirho !==
			`/audio-chirho/${bookChirho.slug_chirho}/chapter-${chapterTextChirho.padStart(2, '0')}-chirho.json`
		)
			throw Error('Phase target path differs');
		const pathChirho = `static${groupChirho.path_chirho}`;
		const bytesChirho = await boundedReadChirho(rootChirho, pathChirho, 2_000_000);
		const chapterChirho = JSON.parse(bytesChirho.toString()) as AudioChapterChirho;
		const entriesChirho =
			indexChirho.books_chirho[bookIdChirho]?.chapters_chirho.filter(
				(rowChirho) => rowChirho.path_chirho === groupChirho.path_chirho
			) ?? [];
		const entryChirho = entriesChirho[0];
		if (
			entriesChirho.length !== 1 ||
			!entryChirho ||
			entryChirho.number_chirho !== Number(chapterTextChirho) ||
			sha256Chirho(bytesChirho) !== entryChirho.sha256_chirho ||
			chapterChirho.book_id_chirho !== bookIdChirho ||
			chapterChirho.chapter_chirho !== Number(chapterTextChirho) ||
			chapterChirho.content_path_chirho !== firstChirho.content_path_chirho ||
			chapterChirho.content_sha256_chirho !== firstChirho.content_sha256_chirho ||
			!Array.isArray(chapterChirho.clips_chirho) ||
			(chapterChirho.readings_chirho !== undefined && !Array.isArray(chapterChirho.readings_chirho))
		)
			throw Error('Existing audio chapter binding differs');
		const readingsChirho = (chapterChirho.readings_chirho ??= []);
		for (const rowChirho of groupChirho.rows_chirho) {
			const matchesChirho = [...readingsChirho, ...chapterChirho.clips_chirho].filter(
				(clipChirho) => clipChirho.id_chirho === rowChirho.clip_chirho.id_chirho
			);
			if (
				matchesChirho.length > 1 ||
				matchesChirho.some(
					(clipChirho) => !isDeepStrictEqualChirho(clipChirho, rowChirho.clip_chirho)
				)
			)
				throw Error('Existing human recording differs');
			if (
				requireInstalledChirho &&
				(matchesChirho.length !== 1 || !readingsChirho.includes(matchesChirho[0]))
			)
				throw Error('Completed phase reading is missing');
			if (!matchesChirho.length) readingsChirho.push(rowChirho.clip_chirho);
			else if (!readingsChirho.includes(matchesChirho[0]))
				throw Error('Legacy human clip requires separate migration');
		}
		const textChirho = JSON.stringify(chapterChirho, null, 2) + '\n';
		if (
			Buffer.byteLength(textChirho) > 2_000_000 ||
			chapterChirho.clips_chirho.length + readingsChirho.length > 2000
		)
			throw Error('Audio chapter delivery bound exceeded');
		writesChirho.push({
			path_chirho: pathChirho,
			before_sha256_chirho: sha256Chirho(bytesChirho),
			text_chirho: textChirho
		});
		entryChirho.sha256_chirho = sha256Chirho(textChirho);
	}
	const indexTextChirho = JSON.stringify(indexChirho, null, 2) + '\n';
	if (Buffer.byteLength(indexTextChirho) > 2_000_000) throw Error('Audio index bound exceeded');
	writesChirho.push({
		path_chirho: indexPathChirho,
		before_sha256_chirho: sha256Chirho(indexBytesChirho),
		text_chirho: indexTextChirho
	});
	if (
		Buffer.byteLength(
			JSON.stringify({ binding_sha256_chirho: '0'.repeat(64), writes_chirho: writesChirho })
		) >
		32 * 1024 ** 2
	)
		throw Error('Catalogue commit journal bound exceeded; reconcile a smaller finite phase');
	return writesChirho;
}
async function stageAudioChirho(rootChirho: string, groupsChirho: PhaseRowsChirho[]) {
	await ownedDirectoryChirho(rootChirho, 'static/audio-chirho/sha256-chirho');
	for (const groupChirho of groupsChirho)
		for (const rowChirho of groupChirho.rows_chirho) {
			const pathChirho = `static${String(rowChirho.clip_chirho.asset_path_chirho)}`;
			const existingChirho = await optionalReadChirho(rootChirho, pathChirho, 4_000_000);
			if (
				existingChirho &&
				(sha256Chirho(existingChirho) !== rowChirho.reading_chirho.sha256_chirho ||
					existingChirho.length !== rowChirho.bytes_chirho.length)
			)
				throw Error('Existing staged audio differs');
			if (!existingChirho)
				await writeChirho(joinChirho(rootChirho, pathChirho), rowChirho.bytes_chirho);
		}
}
/** Called only after the finite plan is checked. Reads at most one phase, never the other prepared books. */
export async function installBoundedPhaseChirho(
	rootChirho: string,
	phaseIdChirho: string,
	applyChirho: boolean,
	archiveChirho?: ArchiveOptionsChirho
) {
	const remainderChirho = phaseIdChirho === PROVERBS_PHASE_CHIRHO;
	const proverbsChirho = remainderChirho ? await loadProverbsDefinitionChirho(rootChirho) : null;
	const planChirho = remainderChirho
		? { phases_chirho: [await readProverbsPhaseChirho(rootChirho)] }
		: await readBoundedPlanChirho(rootChirho);
	const phaseIndexChirho = planChirho.phases_chirho.findIndex(
		(rowChirho) => rowChirho.id_chirho === phaseIdChirho
	);
	if (phaseIndexChirho < 0) throw Error('Unknown finite Beeri phase');
	const phaseChirho = planChirho.phases_chirho[phaseIndexChirho];
	const bindingChirho = phaseBindingChirho(phaseChirho);
	const homeRelativeChirho = remainderChirho
		? PROVERBS_HOME_CHIRHO
		: phaseHomeChirho(phaseIdChirho);
	const homeChirho = joinChirho(rootChirho, homeRelativeChirho);
	const completePathChirho = `${homeRelativeChirho}/installed-chirho.json`;
	const priorCompleteChirho = await optionalReadChirho(rootChirho, completePathChirho, 1024);
	if (applyChirho && phaseIndexChirho > 0) {
		const priorPhaseChirho = planChirho.phases_chirho[phaseIndexChirho - 1];
		const priorBytesChirho = await boundedReadChirho(
			rootChirho,
			`${phaseHomeChirho(priorPhaseChirho.id_chirho)}/installed-chirho.json`,
			1024
		);
		if (
			JSON.parse(priorBytesChirho.toString()).binding_sha256_chirho !==
			phaseBindingChirho(priorPhaseChirho)
		)
			throw Error('Previous phase completion differs');
	}
	const releaseChirho = applyChirho
		? (await ownedDirectoryChirho(rootChirho, 'build-chirho/r2-chirho'),
			await acquireLockChirho(
				joinChirho(rootChirho, 'build-chirho/r2-chirho/audio-catalogue-chirho.lock')
			))
		: null;
	try {
		const groupsChirho = await validatePhaseRowsChirho(rootChirho, phaseChirho);
		const uploadsChirho = uploadsForChirho(groupsChirho);
		if (priorCompleteChirho) {
			const completeChirho = JSON.parse(priorCompleteChirho.toString());
			if (
				completeChirho.binding_sha256_chirho !== bindingChirho ||
				completeChirho.readings_chirho !== phaseChirho.readings_chirho
			)
				throw Error('Completed phase binding differs');
			if (proverbsChirho)
				await verifyPriorProverbsChirho(rootChirho, groupsChirho, true, proverbsChirho);
			await catalogueWritesChirho(rootChirho, groupsChirho, true);
			await requireReceiptsChirho(rootChirho, uploadsChirho);
			return {
				readings_chirho: phaseChirho.readings_chirho,
				chapters_chirho: groupsChirho.length,
				replayed_chirho: true,
				writes_chirho: 0
			};
		}
		const journalChirho = await optionalReadChirho(
			rootChirho,
			`${homeRelativeChirho}/catalogue-commit-chirho.json`,
			32 * 1024 ** 2
		);
		if (!applyChirho) {
			if (journalChirho)
				throw Error('Partial catalogue commit requires apply recovery before dry coherence check');
			if (proverbsChirho)
				await verifyPriorProverbsChirho(rootChirho, groupsChirho, false, proverbsChirho);
			await catalogueWritesChirho(rootChirho, groupsChirho, false);
			return {
				readings_chirho: phaseChirho.readings_chirho,
				chapters_chirho: groupsChirho.length,
				replayed_chirho: false,
				writes_chirho: 0
			};
		}
		await ownedDirectoryChirho(rootChirho, homeRelativeChirho);
		if (journalChirho) {
			// An existing commit could only have been written after every exact archive readback.
			await requireReceiptsChirho(rootChirho, uploadsChirho);
			await recoverCatalogueChirho(rootChirho, homeChirho, bindingChirho);
		}
		if (proverbsChirho)
			await verifyPriorProverbsChirho(rootChirho, groupsChirho, false, proverbsChirho);
		const writesChirho = await catalogueWritesChirho(rootChirho, groupsChirho, false);
		if (!archiveChirho) throw Error('Explicit Hinneh archive target is required');
		await stageAudioChirho(rootChirho, groupsChirho);
		const releaseUploadChirho = await acquireLockChirho(
			joinChirho(rootChirho, 'build-chirho/r2-chirho/audio-upload-chirho.lock')
		);
		try {
			await uploadAudioChirho(
				rootChirho,
				uploadsChirho,
				archiveChirho.target_chirho,
				archiveChirho.fetch_chirho,
				archiveChirho.sleep_chirho
			);
		} finally {
			await releaseUploadChirho();
		}
		await requireReceiptsChirho(rootChirho, uploadsChirho);
		// Cold source/MP3/window recheck under the same lock, after the potentially long archive.
		await validatePhaseRowsChirho(rootChirho, phaseChirho);
		if (proverbsChirho)
			await verifyPriorProverbsChirho(rootChirho, groupsChirho, false, proverbsChirho);
		await commitCatalogueChirho(rootChirho, homeChirho, bindingChirho, writesChirho);
		await writeChirho(
			joinChirho(rootChirho, completePathChirho),
			JSON.stringify({
				binding_sha256_chirho: bindingChirho,
				readings_chirho: phaseChirho.readings_chirho,
				chapters_chirho: groupsChirho.length
			}) + '\n'
		);
		return {
			readings_chirho: phaseChirho.readings_chirho,
			chapters_chirho: groupsChirho.length,
			replayed_chirho: false,
			writes_chirho: writesChirho.length
		};
	} finally {
		await releaseChirho?.();
	}
}
/** Same bounded S3 adapter as the established Greek importer; standard receipts/readbacks remain authoritative. */
function archiveTargetChirho(confirmChirho: string): ArchiveOptionsChirho {
	const accountChirho = process.env.CLOUDFLARE_GLOBAL_API_MAIN_ACCOUNT_ID_CHIRHO ?? '';
	if (
		!/^[a-f0-9]{32}$/.test(accountChirho) ||
		!accountChirho.endsWith('84bd') ||
		confirmChirho !== `hinneh.us@${accountChirho.slice(-4)}`
	)
		throw Error('Exact Hinneh archive target confirmation required');
	const targetChirho: TargetChirho = {
		account_chirho: accountChirho,
		bucket_chirho: libraryChirho.bucket_chirho,
		email_chirho: 's3-transport-chirho',
		api_key_chirho: 's3-transport-chirho'
	};
	const fetchChirho: typeof fetch = async (inputChirho, initChirho) => {
		const prefixChirho = `https://api.cloudflare.com/client/v4/accounts/${accountChirho}/r2/buckets/${libraryChirho.bucket_chirho}/objects/`;
		const urlChirho = String(inputChirho);
		if (!urlChirho.startsWith(prefixChirho)) throw Error('Foreign upload transport target');
		const keyChirho = urlChirho.slice(prefixChirho.length);
		if (!/^audio-chirho\/sha256-chirho\/[a-f0-9]{64}\.mp3$/.test(keyChirho))
			throw Error('Foreign upload transport key');
		if (initChirho?.method === 'GET') return objectRequestChirho('GET', keyChirho);
		if (initChirho?.method !== 'PUT' || !(initChirho.body instanceof Uint8Array))
			throw Error('Foreign upload transport method/body');
		return objectRequestChirho('PUT', keyChirho, initChirho.body);
	};
	return { target_chirho: targetChirho, fetch_chirho: fetchChirho };
}
if (import.meta.main) {
	const argumentsChirho = process.argv.slice(2);
	let phaseChirho = '',
		confirmChirho = '',
		applyChirho = false,
		allChirho = false;
	for (let indexChirho = 0; indexChirho < argumentsChirho.length; indexChirho++) {
		const argumentChirho = argumentsChirho[indexChirho];
		if (argumentChirho === '--phase-chirho') phaseChirho = argumentsChirho[++indexChirho] ?? '';
		else if (argumentChirho === '--confirm-chirho')
			confirmChirho = argumentsChirho[++indexChirho] ?? '';
		else if (argumentChirho === '--apply-chirho') applyChirho = true;
		else if (argumentChirho === '--all-chirho') allChirho = true;
		else throw Error('Unknown bounded Beeri argument');
	}
	if (!!phaseChirho === allChirho || (!applyChirho && confirmChirho))
		throw Error('Choose one finite phase or --all-chirho; confirmation is apply-only');
	const rootChirho = process.cwd();
	const selectedChirho = allChirho
		? (await readBoundedPlanChirho(rootChirho)).phases_chirho.map(
				(rowChirho) => rowChirho.id_chirho
			)
		: [phaseChirho];
	const archiveChirho = applyChirho ? archiveTargetChirho(confirmChirho) : undefined;
	for (const idChirho of selectedChirho)
		console.log(
			JSON.stringify({
				phase_chirho: idChirho,
				...(await installBoundedPhaseChirho(rootChirho, idChirho, applyChirho, archiveChirho))
			})
		);
}
