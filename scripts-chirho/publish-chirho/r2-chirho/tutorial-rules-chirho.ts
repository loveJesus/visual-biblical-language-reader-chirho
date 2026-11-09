// For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life. — John 3:16 (KJV)
// Workflow: hosting-chirho/tutorial-chirho.md. A separate, bounded tour uses the existing R2 video transport.
import { lstat as lstatChirho, readFile as readFileChirho } from 'node:fs/promises';
import { join as joinChirho } from 'node:path';
import { sha256Chirho, type FilesChirho } from '../release_rules_chirho';
import { readWebpChirho } from '../webp_chirho';
import { VERSE_VIDEO_LIMIT_CHIRHO } from '../../../src/lib/domain-chirho/verse-video-chirho';

export const TUTORIAL_CATALOGUE_CHIRHO = 'data-chirho/tutorial-chirho/catalogue-chirho.json';
export const TUTORIAL_MANIFEST_CHIRHO = 'tutorial-chirho/quick-tour-chirho.json';
const TUTORIAL_ID_CHIRHO = 'hinneh-quick-tour-v1-chirho';
const MANIFEST_LIMIT_CHIRHO = 64 * 1024;
const SHA_CHIRHO = /^[a-f0-9]{64}$/;

export interface TutorialVideoChirho {
	asset_path_chirho: string;
	sha256_chirho: string;
	bytes_chirho: number;
	duration_chirho: number;
	width_chirho: number;
	height_chirho: number;
}
export interface TutorialFileChirho {
	asset_path_chirho: string;
	sha256_chirho: string;
	bytes_chirho: number;
}
export interface TutorialEntryChirho {
	language_chirho: 'en' | 'es';
	video_chirho: TutorialVideoChirho;
	poster_chirho: TutorialFileChirho & { width_chirho: number; height_chirho: number };
	captions_chirho: TutorialFileChirho;
	transcript_chirho: string;
}
export interface TutorialArchiveEntryChirho {
	language_chirho: 'en' | 'es';
	video_chirho: TutorialVideoChirho;
	key_chirho: string;
	readback_sha256_chirho: string;
	verified_at_chirho: string;
}

function objectChirho(valueChirho: unknown): Record<string, unknown> {
	if (!valueChirho || typeof valueChirho !== 'object' || Array.isArray(valueChirho))
		throw Error('Tutorial record is not an object');
	return valueChirho as Record<string, unknown>;
}
function decodeChirho(bytesChirho: Uint8Array): string {
	return new TextDecoder('utf-8', { fatal: true }).decode(bytesChirho);
}
function entriesChirho(valueChirho: unknown): Record<string, unknown>[] {
	const documentChirho = objectChirho(valueChirho);
	if (
		documentChirho.schema_version_chirho !== 1 ||
		documentChirho.tutorial_id_chirho !== TUTORIAL_ID_CHIRHO ||
		!Array.isArray(documentChirho.entries_chirho) ||
		documentChirho.entries_chirho.length !== 2
	)
		throw Error('Tutorial manifest exceeds its two-language scope');
	const rowsChirho = documentChirho.entries_chirho.map(objectChirho);
	if (new Set(rowsChirho.map((entryChirho) => entryChirho.language_chirho)).size !== 2)
		throw Error('Tutorial languages repeat');
	if (
		rowsChirho.some(
			(entryChirho) => entryChirho.language_chirho !== 'en' && entryChirho.language_chirho !== 'es'
		)
	)
		throw Error('Tutorial language is outside scope');
	return rowsChirho;
}
function edgeChirho(valueChirho: unknown): valueChirho is number {
	return (
		Number.isSafeInteger(valueChirho) && Number(valueChirho) > 0 && Number(valueChirho) <= 1920
	);
}
function videoChirho(valueChirho: unknown): TutorialVideoChirho {
	const rowChirho = objectChirho(valueChirho);
	if (
		typeof rowChirho.sha256_chirho !== 'string' ||
		!SHA_CHIRHO.test(rowChirho.sha256_chirho) ||
		rowChirho.asset_path_chirho !==
			`/video-chirho/sha256-chirho/${rowChirho.sha256_chirho}-chirho.mp4` ||
		!Number.isSafeInteger(rowChirho.bytes_chirho) ||
		Number(rowChirho.bytes_chirho) < 1 ||
		Number(rowChirho.bytes_chirho) > VERSE_VIDEO_LIMIT_CHIRHO ||
		typeof rowChirho.duration_chirho !== 'number' ||
		!Number.isFinite(rowChirho.duration_chirho) ||
		rowChirho.duration_chirho <= 0 ||
		rowChirho.duration_chirho > 120 ||
		!edgeChirho(rowChirho.width_chirho) ||
		!edgeChirho(rowChirho.height_chirho)
	)
		throw Error('Tutorial video facts are invalid');
	return {
		asset_path_chirho: rowChirho.asset_path_chirho,
		sha256_chirho: rowChirho.sha256_chirho,
		bytes_chirho: Number(rowChirho.bytes_chirho),
		duration_chirho: rowChirho.duration_chirho,
		width_chirho: rowChirho.width_chirho,
		height_chirho: rowChirho.height_chirho
	};
}
function companionChirho(
	filesChirho: FilesChirho,
	valueChirho: unknown,
	pathChirho: string,
	limitChirho: number
): { row_chirho: Record<string, unknown>; bytes_chirho: Uint8Array } {
	const rowChirho = objectChirho(valueChirho),
		bytesChirho = filesChirho.get(pathChirho);
	if (
		rowChirho.asset_path_chirho !== '/' + pathChirho ||
		!bytesChirho ||
		bytesChirho.length < 1 ||
		bytesChirho.length > limitChirho ||
		rowChirho.bytes_chirho !== bytesChirho.length ||
		rowChirho.sha256_chirho !== sha256Chirho(bytesChirho)
	)
		throw Error('Tutorial companion bytes differ');
	return { row_chirho: rowChirho, bytes_chirho: bytesChirho };
}
function captionsValidChirho(textChirho: string, durationChirho: number): boolean {
	if (!/^WEBVTT(?:[ \t].*)?\r?\n/.test(textChirho) || textChirho.includes('\0')) return false;
	const linesChirho = textChirho.split(/\r?\n/);
	let cuesChirho = 0;
	for (const [indexChirho, lineChirho] of linesChirho.entries()) {
		if (!lineChirho.includes('-->')) continue;
		const matchChirho =
			/^(\d{2,}):(\d{2}):(\d{2})\.(\d{3}) --> (\d{2,}):(\d{2}):(\d{2})\.(\d{3})(?:[ \t].*)?$/.exec(
				lineChirho
			);
		if (!matchChirho || !linesChirho[indexChirho + 1]?.trim()) return false;
		const partsChirho = matchChirho.slice(1).map(Number);
		if (
			[partsChirho[1], partsChirho[2], partsChirho[5], partsChirho[6]].some(
				(partChirho) => partChirho > 59
			)
		)
			return false;
		const startChirho =
				partsChirho[0] * 3600 + partsChirho[1] * 60 + partsChirho[2] + partsChirho[3] / 1000,
			endChirho =
				partsChirho[4] * 3600 + partsChirho[5] * 60 + partsChirho[6] + partsChirho[7] / 1000;
		if (startChirho >= endChirho || endChirho > durationChirho + 0.1) return false;
		cuesChirho++;
	}
	return cuesChirho > 0;
}
async function catalogueBytesChirho(rootChirho: string): Promise<Uint8Array | null> {
	const pathChirho = joinChirho(rootChirho, TUTORIAL_CATALOGUE_CHIRHO);
	const infoChirho = await lstatChirho(pathChirho).catch((errorChirho: NodeJS.ErrnoException) => {
		if (errorChirho.code === 'ENOENT') return null;
		throw errorChirho;
	});
	if (!infoChirho) return null;
	if (!infoChirho.isFile() || infoChirho.size > MANIFEST_LIMIT_CHIRHO)
		throw Error('Tutorial archive catalogue is not a bounded regular file');
	const bytesChirho = await readFileChirho(pathChirho);
	if (bytesChirho.length > MANIFEST_LIMIT_CHIRHO) throw Error('Tutorial archive catalogue grew');
	return bytesChirho;
}

/** Admit the complete public tour only after both localized MP4s have exact archive facts. */
export async function addVerifiedTutorialFactsChirho(
	rootChirho: string,
	filesChirho: FilesChirho,
	reasonsChirho: string[],
	videoFactsChirho: Record<string, number>
): Promise<void> {
	try {
		const archiveBytesChirho = await catalogueBytesChirho(rootChirho),
			manifestBytesChirho = filesChirho.get(TUTORIAL_MANIFEST_CHIRHO),
			pageChirho =
				filesChirho.has('tutorial-chirho/index.html') || filesChirho.has('tutorial-chirho.html'),
			presentChirho = [...filesChirho.keys()].some(
				(pathChirho) =>
					pathChirho === 'tutorial-chirho.html' || pathChirho.startsWith('tutorial-chirho/')
			);
		if (!archiveBytesChirho && !presentChirho) return;
		if (!archiveBytesChirho || !manifestBytesChirho || !pageChirho)
			throw Error('Tutorial page, public manifest and archive catalogue must be present together');
		if (manifestBytesChirho.length > MANIFEST_LIMIT_CHIRHO)
			throw Error('Tutorial public manifest is oversized');
		const archivesChirho = entriesChirho(JSON.parse(decodeChirho(archiveBytesChirho))),
			publicChirho = entriesChirho(JSON.parse(decodeChirho(manifestBytesChirho))),
			additionsChirho: Record<string, number> = {};
		for (const entryChirho of publicChirho) {
			const languageChirho = String(entryChirho.language_chirho),
				videoValueChirho = videoChirho(entryChirho.video_chirho),
				archiveChirho = archivesChirho.find(
					(rowChirho) => rowChirho.language_chirho === languageChirho
				)!;
			if (
				JSON.stringify(videoChirho(archiveChirho.video_chirho)) !==
					JSON.stringify(videoValueChirho) ||
				archiveChirho.key_chirho !==
					`video-chirho/sha256-chirho/${videoValueChirho.sha256_chirho}.mp4` ||
				archiveChirho.readback_sha256_chirho !== videoValueChirho.sha256_chirho ||
				typeof archiveChirho.verified_at_chirho !== 'string' ||
				!Number.isFinite(Date.parse(archiveChirho.verified_at_chirho)) ||
				Object.hasOwn(videoFactsChirho, videoValueChirho.sha256_chirho) ||
				Object.hasOwn(additionsChirho, videoValueChirho.sha256_chirho)
			)
				throw Error('Tutorial video differs from its distinct verified archive');
			const posterChirho = companionChirho(
					filesChirho,
					entryChirho.poster_chirho,
					`tutorial-chirho/${languageChirho}-poster-chirho.webp`,
					1024 * 1024
				),
				canvasChirho = readWebpChirho(posterChirho.bytes_chirho),
				captionsChirho = companionChirho(
					filesChirho,
					entryChirho.captions_chirho,
					`tutorial-chirho/${languageChirho}-captions-chirho.vtt`,
					64 * 1024
				),
				textChirho = decodeChirho(captionsChirho.bytes_chirho);
			if (
				!edgeChirho(canvasChirho.width_chirho) ||
				!edgeChirho(canvasChirho.height_chirho) ||
				posterChirho.row_chirho.width_chirho !== canvasChirho.width_chirho ||
				posterChirho.row_chirho.height_chirho !== canvasChirho.height_chirho ||
				!captionsValidChirho(textChirho, videoValueChirho.duration_chirho) ||
				typeof entryChirho.transcript_chirho !== 'string' ||
				!entryChirho.transcript_chirho.trim() ||
				entryChirho.transcript_chirho.length > 8192
			)
				throw Error('Tutorial poster, captions or transcript are invalid');
			additionsChirho[videoValueChirho.sha256_chirho] = videoValueChirho.bytes_chirho;
		}
		Object.assign(videoFactsChirho, additionsChirho);
	} catch (errorChirho) {
		reasonsChirho.push(
			`Tutorial media refused: ${errorChirho instanceof Error ? errorChirho.message : 'invalid facts'}`
		);
	}
}
