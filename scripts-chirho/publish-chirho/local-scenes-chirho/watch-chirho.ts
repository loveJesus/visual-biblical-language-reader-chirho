// For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life. — John 3:16 (KJV)
// Workflow: media-delivery-chirho.md. No synthesis, deletion, catalogue or shard writes.
import { realpath as realpathChirho } from 'node:fs/promises';
import { join as joinChirho } from 'node:path';
import { acquireLockChirho } from '../r2_upload_watch_chirho';
import { archiveCompletedChirho, stageDirectoryChirho, writeJsonChirho } from './archive-chirho';
import { STAGE_CHIRHO, type CompletedJobChirho } from './source-chirho';
import { loadCompletedChapterChirho } from './variants-chirho';

export async function archiveItemsChirho(
	rootChirho: string,
	candidatesChirho: CompletedJobChirho[],
	applyChirho = false,
	limitChirho = 674,
	stopChirho = () => false,
	archiveChirho: typeof archiveCompletedChirho = archiveCompletedChirho
) {
	let archivedChirho = 0,
		uploadedChirho = 0,
		pendingChirho = 0;
	const heldChirho: string[] = [];
	let nextChirho = 0;
	await Promise.all(
		Array.from({ length: 4 }, async () => {
			while (!stopChirho()) {
				const itemChirho = candidatesChirho[nextChirho++];
				if (!itemChirho) return;
				try {
					const plannedChirho = await archiveChirho(rootChirho, itemChirho, false);
					if (plannedChirho.state_chirho === 'already_archived') {
						archivedChirho++;
						continue;
					}
					// Reserve synchronously before the await: a capped concurrent pass cannot overshoot.
					if (pendingChirho >= limitChirho || stopChirho()) continue;
					pendingChirho++;
					if (applyChirho) {
						const resultChirho = await archiveChirho(rootChirho, itemChirho, true);
						archivedChirho++;
						uploadedChirho += resultChirho.uploaded_chirho;
						console.log(JSON.stringify(resultChirho));
					}
				} catch (errorChirho) {
					heldChirho.push(
						`${itemChirho.job_chirho.verse_id_chirho}: ${(errorChirho as Error).message}`
					);
				}
			}
		})
	);
	return {
		at_chirho: new Date().toISOString(),
		expected_chirho: candidatesChirho.length,
		completed_chirho: candidatesChirho.length,
		archived_chirho: archivedChirho,
		uploaded_chirho: uploadedChirho,
		pending_in_pass_chirho: pendingChirho,
		held_chirho: heldChirho,
		local_deletions_chirho: 0,
		installed_chirho: 0
	};
}
export async function archivePassChirho(
	rootChirho: string,
	applyChirho = false,
	limitChirho = 674,
	stopChirho = () => false,
	archiveChirho: typeof archiveCompletedChirho = archiveCompletedChirho
) {
	const candidatesChirho: CompletedJobChirho[] = [],
		heldChirho: string[] = [];
	for (let chapterChirho = 1; chapterChirho <= 16 && !stopChirho(); chapterChirho++) {
		try {
			const resultsChirho = await loadCompletedChapterChirho(rootChirho, chapterChirho);
			if (!resultsChirho) continue;
			heldChirho.push(...resultsChirho.held_chirho);
			candidatesChirho.push(...resultsChirho.completed_chirho);
		} catch (errorChirho) {
			heldChirho.push(`Mark ${chapterChirho}: ${(errorChirho as Error).message}`);
		}
	}
	const resultChirho = await archiveItemsChirho(
		rootChirho,
		candidatesChirho,
		applyChirho,
		limitChirho,
		stopChirho,
		archiveChirho
	);
	return {
		...resultChirho,
		expected_chirho: 674,
		held_chirho: [...heldChirho, ...resultChirho.held_chirho]
	};
}
if (import.meta.main) {
	const argumentsChirho = process.argv.slice(2);
	if (
		argumentsChirho.some(
			(argumentChirho) =>
				!['--apply-chirho', '--watch-chirho', '--limit-chirho'].includes(argumentChirho) &&
				!/^[1-9][0-9]{0,2}$/u.test(argumentChirho)
		)
	)
		throw new Error('Unknown local scene archival argument');
	const applyChirho = argumentsChirho.includes('--apply-chirho');
	const watchChirho = argumentsChirho.includes('--watch-chirho');
	if (watchChirho && !applyChirho) throw new Error('Watch mode requires --apply-chirho');
	const limitIndexChirho = argumentsChirho.indexOf('--limit-chirho');
	const limitChirho = limitIndexChirho < 0 ? 674 : Number(argumentsChirho[limitIndexChirho + 1]);
	if (!Number.isInteger(limitChirho) || limitChirho < 1 || limitChirho > 674)
		throw new Error('Limit must be 1..674');
	const rootChirho = await realpathChirho(process.cwd());
	let stopChirho = false;
	process.on('SIGTERM', () => {
		stopChirho = true;
	});
	process.on('SIGINT', () => {
		stopChirho = true;
	});
	let releaseChirho: (() => Promise<void>) | undefined;
	if (applyChirho) {
		const homeChirho = joinChirho(rootChirho, STAGE_CHIRHO);
		await stageDirectoryChirho(rootChirho, homeChirho);
		releaseChirho = await acquireLockChirho(joinChirho(homeChirho, 'archive-chirho.lock'));
	}
	try {
		const deadlineChirho = Date.now() + 6 * 60 * 60 * 1000;
		do {
			const resultChirho = await archivePassChirho(
				rootChirho,
				applyChirho,
				limitChirho,
				() => stopChirho
			);
			console.log(JSON.stringify(resultChirho));
			if (applyChirho)
				await writeJsonChirho(
					rootChirho,
					joinChirho(rootChirho, STAGE_CHIRHO, 'progress-chirho.json'),
					{
						...resultChirho,
						state_chirho: stopChirho
							? 'stopped'
							: resultChirho.archived_chirho === 674
								? 'archived'
								: watchChirho
									? Date.now() >= deadlineChirho
										? 'expired'
										: 'watching'
									: 'pass_complete'
					}
				);
			if (
				!watchChirho ||
				stopChirho ||
				resultChirho.archived_chirho === 674 ||
				Date.now() >= deadlineChirho
			)
				break;
			for (let secondChirho = 0; secondChirho < 30 && !stopChirho; secondChirho++)
				await new Promise((resolveChirho) => setTimeout(resolveChirho, 1000));
		} while (!stopChirho);
	} finally {
		await releaseChirho?.();
	}
}
