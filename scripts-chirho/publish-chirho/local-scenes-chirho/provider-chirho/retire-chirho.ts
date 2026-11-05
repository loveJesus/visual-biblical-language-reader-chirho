// For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life. — John 3:16 (KJV)
// Workflow: media-delivery-chirho.md. Retire completed provider originals only after exact hosted bytes and durable recovery aliases.
import { mkdir as mkdirChirho, unlink as unlinkChirho } from 'node:fs/promises';
import { join as joinChirho } from 'node:path';
import type { BibleBookChirho } from '../../../../src/lib/bible-chirho/books-chirho';
import { acquireLockChirho } from '../../r2_upload_watch_chirho';
import { digestChirho } from '../../r2-chirho/object-store-chirho';
import { loadBookChirho, readOwnedChirho, STAGE_CHIRHO } from './records-chirho';
import { archiveCompletedChirho, atomicJsonChirho, readBodyChirho } from './storage-chirho';

const ALIASES_CHIRHO = 'workspace-chirho/art-chirho/remote-archive-chirho/provider-copies-chirho';
export async function hostedBytesChirho(
	pathChirho: string,
	bytesChirho: number,
	shaChirho: string,
	fetchChirho: typeof fetch = fetch
) {
	if (
		!/^\/(?:assets-chirho|media-chirho)\/[a-zA-Z0-9_./-]+\.(?:webp|json)$/u.test(pathChirho) ||
		pathChirho.split('/').some((partChirho) => partChirho === '..' || partChirho === '.')
	)
		throw new Error('Hosted proof path differs');
	const responseChirho = await fetchChirho('https://hinneh.us' + pathChirho, {
		redirect: 'error',
		headers: { 'User-Agent': 'Mozilla/5.0 HinnehVerificationChirho' },
		signal: AbortSignal.timeout(30000)
	});
	const bodyChirho = await readBodyChirho(responseChirho, bytesChirho);
	if (digestChirho(bodyChirho) !== shaChirho) throw new Error('Hosted provider byte hash differs');
}
export async function retireBookChirho(
	rootChirho: string,
	bookChirho: BibleBookChirho,
	applyChirho = false,
	fetchChirho: typeof fetch = fetch
) {
	const retiredPathChirho = `${STAGE_CHIRHO}/books-chirho/${bookChirho.slug_chirho}/retired-chirho.json`;
	if (await readOwnedChirho(rootChirho, retiredPathChirho, 4096, true))
		return { state_chirho: 'already_retired', book_id_chirho: bookChirho.id_chirho };
	const stampChirho = await readOwnedChirho(
		rootChirho,
		`${STAGE_CHIRHO}/books-chirho/${bookChirho.slug_chirho}/installed-chirho.json`,
		4096,
		true
	);
	if (!stampChirho)
		return { state_chirho: 'waiting_for_installation', book_id_chirho: bookChirho.id_chirho };
	const sourceChirho = await loadBookChirho(rootChirho, bookChirho);
	if (!sourceChirho.complete_chirho)
		throw new Error('Retirement requires a completed producer book');
	if (!applyChirho)
		return {
			state_chirho: 'would_verify_and_retire',
			book_id_chirho: bookChirho.id_chirho,
			scenes_chirho: sourceChirho.expected_chirho
		};
	const summaryPathChirho = `/media-chirho/${bookChirho.slug_chirho}/summary-chirho.json`;
	const summaryBytesChirho = (await readOwnedChirho(
		rootChirho,
		'static' + summaryPathChirho,
		128 * 1024
	))!;
	const summaryChirho = JSON.parse(summaryBytesChirho.toString());
	if (summaryChirho.scene_count_chirho !== sourceChirho.expected_chirho)
		throw new Error('Installed scene count differs before retirement');
	try {
		await hostedBytesChirho(
			summaryPathChirho,
			summaryBytesChirho.length,
			digestChirho(summaryBytesChirho),
			fetchChirho
		);
	} catch {
		return { state_chirho: 'waiting_for_publication', book_id_chirho: bookChirho.id_chirho };
	}
	await mkdirChirho(joinChirho(rootChirho, 'workspace-chirho/art-chirho/remote-archive-chirho'), {
		recursive: true
	});
	const releaseChirho = await acquireLockChirho(
		joinChirho(rootChirho, 'workspace-chirho/art-chirho/remote-archive-chirho/archive-chirho.lock')
	);
	let retiredChirho = 0,
		logicalBytesChirho = 0;
	try {
		for (const chapterChirho of summaryChirho.chapters_chirho as {
			number_chirho: number;
			path_chirho: string;
			sha256_chirho: string;
		}[]) {
			const chapterBytesChirho = (await readOwnedChirho(
				rootChirho,
				'static' + chapterChirho.path_chirho,
				2 * 1024 ** 2
			))!;
			if (digestChirho(chapterBytesChirho) !== chapterChirho.sha256_chirho)
				throw new Error('Installed chapter differs before retirement');
			await hostedBytesChirho(
				chapterChirho.path_chirho,
				chapterBytesChirho.length,
				chapterChirho.sha256_chirho,
				fetchChirho
			);
			const publicChirho = JSON.parse(chapterBytesChirho.toString());
			const completedChirho = sourceChirho.completed_chirho.filter(
				(rowChirho) => rowChirho.job_chirho.chapter_chirho === chapterChirho.number_chirho
			);
			const aliasesPathChirho = `${ALIASES_CHIRHO}/${bookChirho.slug_chirho}/chapter-${String(chapterChirho.number_chirho).padStart(3, '0')}-chirho.json`;
			const aliasesChirho = [];
			for (let indexChirho = 0; indexChirho < completedChirho.length; indexChirho += 6) {
				const rowsChirho = await Promise.all(
					completedChirho.slice(indexChirho, indexChirho + 6).map(async (rowChirho) => {
						const preservedChirho = await archiveCompletedChirho(rootChirho, rowChirho, false);
						if (!preservedChirho.receipt_chirho)
							throw new Error('Provider preservation missing before retirement');
						const sceneChirho = publicChirho.scenes_chirho.find(
							(sceneChirho: { lesson_id_chirho: string }) =>
								sceneChirho.lesson_id_chirho === rowChirho.job_chirho.verse_id_chirho
						);
						if (
							!sceneChirho ||
							sceneChirho.sha256_chirho !== rowChirho.result_chirho.output_sha256_chirho ||
							sceneChirho.art_review_chirho !== 'pending'
						)
							throw new Error('Public scene does not bind the preserved original');
						await hostedBytesChirho(
							sceneChirho.asset_path_chirho,
							rowChirho.result_chirho.bytes_chirho,
							rowChirho.result_chirho.output_sha256_chirho,
							fetchChirho
						);
						return {
							path_chirho: joinChirho(rootChirho, rowChirho.job_chirho.output_chirho),
							...preservedChirho.receipt_chirho.object_chirho
						};
					})
				);
				aliasesChirho.push(...rowsChirho);
			}
			// A whole bounded chapter's exact recovery map is fsynced before its first unlink.
			await atomicJsonChirho(rootChirho, aliasesPathChirho, {
				schema_version_chirho: 1,
				copies_chirho: aliasesChirho
			});
			for (let indexChirho = 0; indexChirho < completedChirho.length; indexChirho++) {
				const rowChirho = completedChirho[indexChirho];
				const localChirho = await readOwnedChirho(
					rootChirho,
					rowChirho.job_chirho.output_chirho,
					2 * 1024 ** 2,
					true
				);
				if (!localChirho) continue;
				if (
					digestChirho(localChirho) !== aliasesChirho[indexChirho].sha256_chirho ||
					localChirho.length !== aliasesChirho[indexChirho].bytes_chirho
				)
					throw new Error('Provider original changed before unlink');
				await unlinkChirho(joinChirho(rootChirho, rowChirho.job_chirho.output_chirho));
				retiredChirho++;
				logicalBytesChirho += localChirho.length;
			}
		}
		await hostedBytesChirho(
			summaryPathChirho,
			summaryBytesChirho.length,
			digestChirho(summaryBytesChirho),
			fetchChirho
		);
		await atomicJsonChirho(rootChirho, retiredPathChirho, {
			schema_version_chirho: 1,
			book_id_chirho: bookChirho.id_chirho,
			scenes_chirho: sourceChirho.expected_chirho,
			retired_files_chirho: retiredChirho,
			logical_bytes_chirho: logicalBytesChirho,
			summary_sha256_chirho: digestChirho(summaryBytesChirho),
			at_chirho: new Date().toISOString(),
			recovery_home_chirho: `${ALIASES_CHIRHO}/${bookChirho.slug_chirho}`
		});
	} finally {
		await releaseChirho();
	}
	return {
		state_chirho: 'retired',
		book_id_chirho: bookChirho.id_chirho,
		retired_files_chirho: retiredChirho,
		logical_bytes_chirho: logicalBytesChirho
	};
}
