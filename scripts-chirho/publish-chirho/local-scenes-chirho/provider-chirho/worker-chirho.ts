// For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life. — John 3:16 (KJV)
// Workflow: media-delivery-chirho.md. One preservation coordinator; completed-book installs use the shared OS lock.
import { execFileSync as execFileSyncChirho } from 'node:child_process';
import { mkdir as mkdirChirho } from 'node:fs/promises';
import { join as joinChirho } from 'node:path';
import { acquireLockChirho } from '../../r2_upload_watch_chirho';
import { digestChirho } from '../../r2-chirho/object-store-chirho';
import {
	BOOKS_CHIRHO,
	bookHomeChirho,
	loadBookChirho,
	readOwnedChirho,
	STAGE_CHIRHO
} from './records-chirho';
import { archiveCompletedChirho, atomicJsonChirho } from './storage-chirho';
import { installBookChirho } from './install-chirho';
import { retireBookChirho } from './retire-chirho';

// Reserve synchronously before awaiting. A shared storage error drains in-flight requests and prevents new work.
export async function poolChirho<ValueChirho>(
	valuesChirho: ValueChirho[],
	operationChirho: (valueChirho: ValueChirho) => Promise<void>,
	stoppedChirho: () => boolean,
	concurrencyChirho = 6
) {
	let nextChirho = 0;
	let failureChirho: unknown;
	await Promise.all(
		Array.from({ length: Math.min(concurrencyChirho, valuesChirho.length) }, async () => {
			while (!failureChirho && !stoppedChirho()) {
				const indexChirho = nextChirho++;
				if (indexChirho >= valuesChirho.length) return;
				try {
					await operationChirho(valuesChirho[indexChirho]);
				} catch (errorChirho) {
					failureChirho ??= errorChirho;
				}
			}
		})
	);
	if (failureChirho) throw failureChirho;
}
export async function installedChirho(
	rootChirho: string,
	bookChirho: (typeof BOOKS_CHIRHO)[number]
) {
	const stampBytesChirho = await readOwnedChirho(
		rootChirho,
		`${STAGE_CHIRHO}/books-chirho/${bookChirho.slug_chirho}/installed-chirho.json`,
		4096,
		true
	);
	if (!stampBytesChirho) return false;
	const stampChirho = JSON.parse(stampBytesChirho.toString());
	const markerChirho = await readOwnedChirho(
		rootChirho,
		`${bookHomeChirho(bookChirho)}/usable-outputs-chirho.json`,
		4 * 1024 ** 2
	);
	const manifestChirho = await readOwnedChirho(
		rootChirho,
		`static/content-chirho/${bookChirho.slug_chirho}/manifest-chirho.json`,
		128 * 1024
	);
	if (
		stampChirho.schema_version_chirho !== 1 ||
		stampChirho.state_chirho !== 'installed' ||
		stampChirho.book_id_chirho !== bookChirho.id_chirho ||
		stampChirho.completion_marker_sha256_chirho !== digestChirho(markerChirho!) ||
		stampChirho.source_manifest_sha256_chirho !== digestChirho(manifestChirho!)
	)
		throw new Error('Installed book source/completion changed');
	return true;
}
export async function runChirho(rootChirho: string, argumentsChirho: string[]) {
	const knownChirho = [
		'--apply-chirho',
		'--watch-chirho',
		'--book-chirho',
		'--limit-chirho',
		'--install-book-chirho'
	];
	for (let indexChirho = 0; indexChirho < argumentsChirho.length; indexChirho++) {
		if (!knownChirho.includes(argumentsChirho[indexChirho]))
			throw new Error('Unknown provider delivery argument');
		if (
			['--book-chirho', '--limit-chirho', '--install-book-chirho'].includes(
				argumentsChirho[indexChirho]
			)
		)
			indexChirho++;
	}
	const optionChirho = (flagChirho: string) =>
		argumentsChirho.includes(flagChirho)
			? argumentsChirho[argumentsChirho.indexOf(flagChirho) + 1]
			: undefined;
	const applyChirho = argumentsChirho.includes('--apply-chirho');
	const watchChirho = argumentsChirho.includes('--watch-chirho');
	const selectedChirho = optionChirho('--book-chirho') ?? optionChirho('--install-book-chirho');
	const booksChirho = selectedChirho
		? BOOKS_CHIRHO.filter((bookChirho) => bookChirho.id_chirho === selectedChirho)
		: BOOKS_CHIRHO;
	const limitChirho =
		optionChirho('--limit-chirho') === undefined ? 27_155 : Number(optionChirho('--limit-chirho'));
	if (
		!booksChirho.length ||
		!Number.isSafeInteger(limitChirho) ||
		limitChirho < 1 ||
		limitChirho > 27_155 ||
		(watchChirho && (!applyChirho || argumentsChirho.includes('--limit-chirho')))
	)
		throw new Error('Invalid provider delivery book/limit/watch scope');
	if (argumentsChirho.includes('--install-book-chirho')) {
		if (!applyChirho || !selectedChirho || booksChirho.length !== 1 || watchChirho)
			throw new Error('Inner installation scope differs');
		console.log(JSON.stringify(await installBookChirho(rootChirho, booksChirho[0], true)));
		return;
	}
	let stoppingChirho = false;
	const stopChirho = () => {
		stoppingChirho = true;
	};
	process.once('SIGTERM', stopChirho);
	process.once('SIGINT', stopChirho);
	let releaseChirho: (() => Promise<void>) | undefined;
	try {
		if (applyChirho) {
			await mkdirChirho(joinChirho(rootChirho, STAGE_CHIRHO), { recursive: true });
			releaseChirho = await acquireLockChirho(
				joinChirho(rootChirho, STAGE_CHIRHO, 'coordinator-chirho.lock')
			);
		}
		const deadlineChirho = Date.now() + 6 * 60 * 60 * 1000;
		do {
			const statusChirho = {
				updated_at_chirho: '',
				state_chirho: 'preserving',
				archived_chirho: 0,
				already_archived_chirho: 0,
				installed_books_chirho: [] as string[],
				retired_books_chirho: [] as string[],
				retirement_holds_chirho: [] as { book_id_chirho: string; reason_chirho: string }[],
				source_holds_chirho: [] as { book_id_chirho: string; reason_chirho: string }[]
			};
			let reservedChirho = 0;
			const retireInstalledChirho = async (bookChirho: (typeof BOOKS_CHIRHO)[number]) => {
				if (!watchChirho) return;
				try {
					const resultChirho = await retireBookChirho(rootChirho, bookChirho, true);
					if (['retired', 'already_retired'].includes(resultChirho.state_chirho))
						statusChirho.retired_books_chirho.push(bookChirho.id_chirho);
					console.log(JSON.stringify(resultChirho));
				} catch (errorChirho) {
					statusChirho.retirement_holds_chirho.push({
						book_id_chirho: bookChirho.id_chirho,
						reason_chirho: String(errorChirho)
					});
				}
			};
			try {
				for (const bookChirho of booksChirho) {
					if (stoppingChirho || reservedChirho >= limitChirho) break;
					let sourceChirho;
					try {
						if (await installedChirho(rootChirho, bookChirho)) {
							statusChirho.installed_books_chirho.push(bookChirho.id_chirho);
							await retireInstalledChirho(bookChirho);
							continue;
						}
						sourceChirho = await loadBookChirho(rootChirho, bookChirho);
					} catch (errorChirho) {
						statusChirho.source_holds_chirho.push({
							book_id_chirho: bookChirho.id_chirho,
							reason_chirho: String(errorChirho)
						});
						continue;
					}
					const selectedRowsChirho = sourceChirho.completed_chirho.slice(
						0,
						limitChirho - reservedChirho
					);
					reservedChirho += selectedRowsChirho.length;
					await poolChirho(
						selectedRowsChirho,
						async (completedChirho) => {
							const resultChirho = await archiveCompletedChirho(
								rootChirho,
								completedChirho,
								applyChirho
							);
							if (resultChirho.state_chirho === 'already_archived')
								statusChirho.already_archived_chirho++;
							else statusChirho.archived_chirho++;
							if ((statusChirho.archived_chirho + statusChirho.already_archived_chirho) % 100 === 0)
								console.log(
									JSON.stringify({
										book_id_chirho: bookChirho.id_chirho,
										archived_this_pass_chirho: statusChirho.archived_chirho,
										checked_existing_chirho: statusChirho.already_archived_chirho,
										at_chirho: new Date().toISOString()
									})
								);
						},
						() => stoppingChirho
					);
					if (
						applyChirho &&
						!stoppingChirho &&
						sourceChirho.complete_chirho &&
						selectedRowsChirho.length === sourceChirho.expected_chirho
					) {
						const outputChirho = execFileSyncChirho(
							'python3',
							[
								'-I',
								'-B',
								'scripts-chirho/publish-chirho/local-scenes-chirho/provider-chirho/install_lock_chirho.py',
								bookChirho.id_chirho
							],
							{ cwd: rootChirho, timeout: 240000, encoding: 'utf8', maxBuffer: 1024 * 1024 }
						);
						console.log(outputChirho.trim());
						statusChirho.installed_books_chirho.push(bookChirho.id_chirho);
						await retireInstalledChirho(bookChirho);
					}
				}
				statusChirho.state_chirho = stoppingChirho
					? 'stopped'
					: statusChirho.source_holds_chirho.length
						? 'source_held'
						: statusChirho.retirement_holds_chirho.length
							? 'retirement_held'
							: statusChirho.retired_books_chirho.length === booksChirho.length
								? 'complete'
								: statusChirho.installed_books_chirho.length === booksChirho.length
									? 'waiting_for_publication'
									: 'waiting_for_generation';
			} catch (errorChirho) {
				statusChirho.state_chirho = 'storage_or_install_held';
				console.error(String(errorChirho));
				stoppingChirho = true;
				process.exitCode = 1;
			}
			statusChirho.updated_at_chirho = new Date().toISOString();
			if (applyChirho)
				await atomicJsonChirho(rootChirho, `${STAGE_CHIRHO}/progress-chirho.json`, statusChirho);
			console.log(JSON.stringify(statusChirho));
			if (
				!watchChirho ||
				stoppingChirho ||
				statusChirho.retired_books_chirho.length === booksChirho.length
			)
				break;
			for (let secondChirho = 0; secondChirho < 30 && !stoppingChirho; secondChirho++)
				await new Promise((resolveChirho) => setTimeout(resolveChirho, 1000));
		} while (!stoppingChirho && Date.now() < deadlineChirho);
	} finally {
		process.off('SIGTERM', stopChirho);
		process.off('SIGINT', stopChirho);
		await releaseChirho?.();
	}
}
if (import.meta.main) await runChirho(process.cwd(), process.argv.slice(2));
