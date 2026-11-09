// For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life. — John 3:16 (KJV)
// Workflow: README-chirho.md. Bound chapter transactions without changing the shared recovery writer.
import { realpath as realpathChirho } from 'node:fs/promises';
import { isDeepStrictEqual as equalChirho } from 'node:util';
import { sha256Chirho } from '../audition_chirho';
import { hasMp3HeaderChirho } from '../../publish-chirho/audio_rules_chirho';
import { acquireLockChirho } from '../../publish-chirho/r2_upload_watch_chirho';
import { recoverCatalogueChirho } from './catalogue_commit_chirho';
import { boundedReadChirho, type ImportInputChirho } from './phase_chirho';
import type { DeliveryChirho } from './manifest_chirho';
import {
	handoffInputChirho,
	handoffArgumentsChirho,
	MAX_HANDOFF_JOBS_CHIRHO
} from './handoff_chirho';

export interface PreparedHandoffChirho {
	manifest_sha256_chirho: string;
	recordings_chirho: DeliveryChirho[];
}
export interface HandoffPartChirho {
	input_chirho: ImportInputChirho;
	prepared_chirho: PreparedHandoffChirho;
}
export interface HandoffPartProofChirho {
	prepared_sha256_chirho: string;
}

export function partitionHandoffChirho(
	inputChirho: ImportInputChirho,
	preparedChirho: PreparedHandoffChirho
): HandoffPartChirho[] {
	const jobsChirho = inputChirho.manifest_chirho.jobs_chirho;
	if (
		!jobsChirho.length ||
		jobsChirho.length > MAX_HANDOFF_JOBS_CHIRHO ||
		jobsChirho.length !== inputChirho.expected_jobs_chirho ||
		preparedChirho.manifest_sha256_chirho !== inputChirho.manifest_sha256_chirho ||
		preparedChirho.recordings_chirho.length !== jobsChirho.length
	)
		throw Error('Complete finite handoff and prepared partition required');
	const deliveriesChirho = new Map(
		preparedChirho.recordings_chirho.map((rowChirho) => [rowChirho.job_chirho, rowChirho])
	);
	const versesChirho = new Set<string>();
	if (deliveriesChirho.size !== jobsChirho.length) throw Error('Repeated delivery job');
	for (const jobChirho of jobsChirho) {
		const rowChirho = deliveriesChirho.get(jobChirho.job_chirho),
			takeChirho = jobChirho.chosen_chirho;
		if (
			!rowChirho ||
			!takeChirho ||
			jobChirho.state_chirho !== 'done' ||
			versesChirho.has(jobChirho.verse_id_chirho) ||
			rowChirho.verse_id_chirho !== jobChirho.verse_id_chirho ||
			rowChirho.path_chirho !==
				`${inputChirho.prepared_home_chirho}/delivery-chirho/${jobChirho.job_chirho}-chirho.mp3` ||
			rowChirho.original_mp3_sha256_chirho !== takeChirho.sha256_chirho ||
			rowChirho.raw_flac_sha256_chirho !== takeChirho.raw_sha256_chirho ||
			!/^[a-f0-9]{64}$/.test(rowChirho.sha256_chirho) ||
			!Number.isSafeInteger(rowChirho.bytes_chirho) ||
			rowChirho.bytes_chirho < 1 ||
			rowChirho.bytes_chirho > 4_000_000 ||
			!Number.isFinite(rowChirho.duration_chirho) ||
			Math.abs(rowChirho.duration_chirho - takeChirho.seconds_chirho) > 0.15
		)
			throw Error('Prepared delivery identity differs');
		versesChirho.add(jobChirho.verse_id_chirho);
	}
	const groupsChirho: (typeof jobsChirho)[] = [];
	let groupChirho: typeof jobsChirho = [],
		chaptersChirho = new Set<string>();
	for (const jobChirho of jobsChirho) {
		if (!chaptersChirho.has(jobChirho.content_path_chirho) && chaptersChirho.size === 6) {
			groupsChirho.push(groupChirho);
			groupChirho = [];
			chaptersChirho = new Set();
		}
		groupChirho.push(jobChirho);
		chaptersChirho.add(jobChirho.content_path_chirho);
	}
	if (groupChirho.length) groupsChirho.push(groupChirho);
	return groupsChirho.map((subsetChirho, indexChirho) => {
		const numberChirho = String(indexChirho + 1).padStart(4, '0');
		const shardChirho = String(Math.floor(indexChirho / 10) * 10).padStart(4, '0');
		return {
			input_chirho: {
				...inputChirho,
				manifest_chirho: { ...inputChirho.manifest_chirho, jobs_chirho: subsetChirho },
				prepared_home_chirho: `${inputChirho.prepared_home_chirho}/catalogue-parts-chirho/${shardChirho}-chirho/part-${numberChirho}-chirho`,
				expected_jobs_chirho: subsetChirho.length
			},
			prepared_chirho: {
				manifest_sha256_chirho: inputChirho.manifest_sha256_chirho,
				recordings_chirho: subsetChirho.map((jobChirho) =>
					deliveriesChirho.get(jobChirho.job_chirho)!
				)
			}
		};
	});
}

export async function readHandoffPartsChirho(
	rootChirho: string,
	inputChirho: ImportInputChirho
): Promise<HandoffPartChirho[]> {
	const rawChirho = await boundedReadChirho(
		rootChirho,
		`${inputChirho.prepared_home_chirho}/prepared-chirho.json`,
		2 * 1024 ** 2
	);
	return partitionHandoffChirho(
		inputChirho,
		JSON.parse(rawChirho.toString()) as PreparedHandoffChirho
	);
}

/** Refuse any bad part or delivery before the first store call or new catalogue transaction. */
export async function preflightHandoffPartsChirho(
	rootChirho: string,
	partsChirho: readonly HandoffPartChirho[]
): Promise<HandoffPartProofChirho[]> {
	if (
		!partsChirho.length ||
		partsChirho.length > MAX_HANDOFF_JOBS_CHIRHO ||
		partsChirho.reduce(
			(totalChirho, partChirho) => totalChirho + partChirho.input_chirho.expected_jobs_chirho,
			0
		) > MAX_HANDOFF_JOBS_CHIRHO
	)
		throw Error('Invalid finite part count');
	const proofsChirho: HandoffPartProofChirho[] = [];
	for (const partChirho of partsChirho) {
		const inputChirho = partChirho.input_chirho;
		if (
			new Set(
				inputChirho.manifest_chirho.jobs_chirho.map((jobChirho) => jobChirho.content_path_chirho)
			).size > 6
		)
			throw Error('Part exceeds six chapters');
		const rawChirho = await boundedReadChirho(
			rootChirho,
			`${inputChirho.prepared_home_chirho}/prepared-chirho.json`,
			2 * 1024 ** 2
		);
		if (!equalChirho(JSON.parse(rawChirho.toString()), partChirho.prepared_chirho))
			throw Error('Frozen part differs');
		for (const rowChirho of partChirho.prepared_chirho.recordings_chirho) {
			const bytesChirho = await boundedReadChirho(rootChirho, rowChirho.path_chirho, 4_000_000);
			if (
				sha256Chirho(bytesChirho) !== rowChirho.sha256_chirho ||
				bytesChirho.length !== rowChirho.bytes_chirho ||
				!hasMp3HeaderChirho(bytesChirho)
			)
				throw Error('Prepared delivery bytes differ');
		}
		proofsChirho.push({ prepared_sha256_chirho: sha256Chirho(rawChirho) });
	}
	return proofsChirho;
}

export async function recheckHandoffPartChirho(
	rootChirho: string,
	partChirho: HandoffPartChirho,
	proofChirho: HandoffPartProofChirho
): Promise<void> {
	const rawChirho = await boundedReadChirho(
		rootChirho,
		`${partChirho.input_chirho.prepared_home_chirho}/prepared-chirho.json`,
		2 * 1024 ** 2
	);
	if (sha256Chirho(rawChirho) !== proofChirho.prepared_sha256_chirho)
		throw Error('Part changed after complete preflight');
}

/** An interrupted old transaction must finish through its existing bounded recovery before hash-chain admission. */
export async function recoverHandoffPartsChirho(
	rootChirho: string,
	partsChirho: readonly HandoffPartChirho[],
	proofsChirho: readonly HandoffPartProofChirho[]
): Promise<void> {
	const releaseChirho = await acquireLockChirho(
		`${rootChirho}/build-chirho/r2-chirho/audio-catalogue-chirho.lock`
	);
	try {
		for (const [indexChirho, partChirho] of partsChirho.entries()) {
			const proofChirho = proofsChirho[indexChirho];
			if (!proofChirho) throw Error('Missing all-parts preflight');
			await recheckHandoffPartChirho(rootChirho, partChirho, proofChirho);
			const bindingChirho = sha256Chirho(
				partChirho.input_chirho.manifest_sha256_chirho + proofChirho.prepared_sha256_chirho
			);
			await recoverCatalogueChirho(
				rootChirho,
				`${rootChirho}/${partChirho.input_chirho.prepared_home_chirho}`,
				bindingChirho
			);
		}
	} finally {
		await releaseChirho();
	}
}

if (import.meta.main) {
	if (!process.argv.includes('--describe-parts-chirho'))
		throw Error('Expected --describe-parts-chirho');
	const argumentsChirho = handoffArgumentsChirho(process.argv.slice(2));
	const rootChirho = await realpathChirho(argumentsChirho.root_chirho);
	const inputChirho = await handoffInputChirho(rootChirho, argumentsChirho.options_chirho);
	console.log(
		JSON.stringify(
			(await readHandoffPartsChirho(rootChirho, inputChirho)).map((partChirho) => ({
				prepared_home_chirho: partChirho.input_chirho.prepared_home_chirho,
				expected_jobs_chirho: partChirho.input_chirho.expected_jobs_chirho,
				prepared_chirho: partChirho.prepared_chirho
			}))
		)
	);
}
