// For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life. — John 3:16 (KJV)

import { describe, expect, it } from 'vitest';
import { rm as rmChirho } from 'node:fs/promises';
import { buildReleaseChirho } from '../../scripts-chirho/publish-chirho/build_release_chirho';
import { baseProjectChirho, temporaryRootChirho, writeProjectChirho } from './support-chirho';
import {
	mediaRecordsChirho,
	sha256Chirho,
	verifyMediaShardsChirho,
	type FilesChirho
} from '../../scripts-chirho/publish-chirho/release_rules_chirho';

const sourceChirho = {
	id_chirho: 'source-instruction-chirho',
	lesson_id_chirho: 'Prov.1.2',
	token_id_chirho: '20Qzf',
	lemma_id_chirho: 'H4148',
	lemma_augment_chirho: null,
	sense_id_chirho: 'instruction-sense-chirho',
	contextual_meaning_chirho: 'instruction',
	sense_review_chirho: 'agent_reviewed',
	evidence_refs_chirho: ['oshb-prov-chirho'],
	asset_path_chirho: '/assets-chirho/instruction-chirho.webp',
	sha256_chirho: 'a'.repeat(64),
	width_chirho: 128,
	height_chirho: 128,
	art_review_chirho: 'pending'
};
function filesChirho(defaultsChirho: Record<string, unknown>[]) {
	const chapterChirho = new TextEncoder().encode(
		JSON.stringify({
			schema_version_chirho: 1,
			book_id_chirho: 'Gen',
			chapter_chirho: 1,
			scenes_chirho: [],
			icons_chirho: [],
			lemma_icons_chirho: defaultsChirho
		})
	);
	const summaryChirho = new TextEncoder().encode(
		JSON.stringify({
			schema_version_chirho: 1,
			book_id_chirho: 'Gen',
			scene_count_chirho: 0,
			icon_count_chirho: 0,
			lemma_icon_count_chirho: 1,
			chapters_chirho: [
				{
					number_chirho: 1,
					path_chirho: '/media-chirho/genesis-chirho/chapter-01-chirho.json',
					sha256_chirho: sha256Chirho(chapterChirho),
					scene_count_chirho: 0,
					icon_count_chirho: 0,
					lemma_icon_count_chirho: defaultsChirho.length
				}
			]
		})
	);
	return new Map([
		['media-chirho/genesis-chirho/summary-chirho.json', summaryChirho],
		['media-chirho/genesis-chirho/chapter-01-chirho.json', chapterChirho]
	]) as FilesChirho;
}
function verifyChirho(defaultsChirho: Record<string, unknown>[]) {
	const reasonsChirho: string[] = [];
	const mediaChirho = mediaRecordsChirho(
		'source-chirho.json',
		{ icons_chirho: [sourceChirho] },
		reasonsChirho
	);
	const reportChirho = verifyMediaShardsChirho(
		filesChirho(defaultsChirho),
		mediaChirho,
		reasonsChirho
	);
	return { reasonsChirho, reportChirho };
}
describe('declared lemma-picture sources', () => {
	it('builds shared WebP aliases while retaining the original source identity for a lemma default', async () => {
		const rootChirho = await temporaryRootChirho();
		try {
			const projectChirho = baseProjectChirho(rootChirho);
			const originalChirho = { ...sourceChirho, ...projectChirho.media_chirho[0] };
			projectChirho.media_chirho = [
				originalChirho,
				{
					...originalChirho,
					id_chirho: 'shared-instruction-chirho',
					lesson_id_chirho: 'Prov.1.3',
					token_id_chirho: 'other-token'
				},
				projectChirho.media_chirho[1]
			];
			for (const [pathChirho, bytesChirho] of filesChirho([originalChirho]))
				projectChirho.adapter_chirho.set(pathChirho, bytesChirho);
			await writeProjectChirho(projectChirho);
			const resultChirho = await buildReleaseChirho({
				root_chirho: rootChirho,
				allow_pending_media_chirho: false,
				fresh_build_chirho: true,
				git_chirho: { commit_chirho: 'c'.repeat(40), clean_chirho: true },
				local_paths_chirho: [rootChirho]
			});
			expect(resultChirho.manifest_chirho.media_chirho).toHaveLength(2);
			expect(
				resultChirho.manifest_chirho.media_shards_chirho.find(
					(bookChirho) => bookChirho.book_chirho === 'Gen'
				)?.lemma_icons_chirho
			).toBe(1);
		} finally {
			await rmChirho(rootChirho, { recursive: true, force: true });
		}
	});
	it('accepts a general picture from another chapter or book while preserving pending state', () => {
		const resultChirho = verifyChirho([sourceChirho]);
		expect(resultChirho.reasonsChirho).toEqual([]);
		expect(resultChirho.reportChirho[0].lemma_icons_chirho).toBe(1);
	});
	it('refuses altered lexical identity, meaning, source location, or approval even with a new shard hash', () => {
		for (const changesChirho of [
			{ lemma_id_chirho: 'H1' },
			{ lemma_augment_chirho: 'a' },
			{ contextual_meaning_chirho: 'a different meaning' },
			{ lesson_id_chirho: 'John.1.1' },
			{ art_review_chirho: 'approved' }
		]) {
			const resultChirho = verifyChirho([{ ...sourceChirho, ...changesChirho }]);
			expect(resultChirho.reasonsChirho.join(' ')).toMatch(/unlike their declared media/u);
		}
	});
	it('refuses duplicate defaults for one lemma and unknown source icons', () => {
		expect(verifyChirho([sourceChirho, sourceChirho]).reasonsChirho.join(' ')).toMatch(
			/unlike their declared media/u
		);
		expect(
			verifyChirho([{ ...sourceChirho, id_chirho: 'unknown-source-chirho' }]).reasonsChirho.join(
				' '
			)
		).toMatch(/unlike their declared media/u);
	});
});
