// For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life. — John 3:16 (KJV)
import { afterEach, describe, expect, it } from 'vitest';
import {
	mkdtempSync as mkdtempSyncChirho,
	mkdirSync as mkdirSyncChirho,
	readFileSync as readFileSyncChirho,
	writeFileSync as writeFileSyncChirho,
	rmSync as rmSyncChirho
} from 'node:fs';
import { tmpdir as tmpdirChirho } from 'node:os';
import { dirname as dirnameChirho, join as joinChirho } from 'node:path';
import { createHash as createHashChirho } from 'node:crypto';
import { spokenOverridesChirho } from './export_spoken_chirho';
interface MutableTokenChirho extends Record<string, unknown> {
	id_chirho: string;
}
interface MutableLessonChirho {
	id_chirho: string;
	canonical_text_chirho: string;
	tokens_chirho: MutableTokenChirho[];
}
interface MutableChapterChirho extends Record<string, unknown> {
	verses_chirho: MutableLessonChirho[];
}
const rootsChirho: string[] = [];
afterEach(() => {
	for (const rootChirho of rootsChirho.splice(0))
		rmSyncChirho(rootChirho, { recursive: true, force: true });
});
function fixtureChirho() {
	const rootChirho = mkdtempSyncChirho(joinChirho(tmpdirChirho(), 'spoken-export-chirho-'));
	rootsChirho.push(rootChirho);
	for (const [slugChirho, numberChirho] of [
		['jeremiah-chirho', '48'],
		['lamentations-chirho', '04']
	]) {
		for (const fileChirho of ['manifest-chirho.json', `chapter-${numberChirho}-chirho.json`]) {
			const relativeChirho = `static/content-chirho/${slugChirho}/${fileChirho}`;
			mkdirSyncChirho(dirnameChirho(joinChirho(rootChirho, relativeChirho)), { recursive: true });
			writeFileSyncChirho(
				joinChirho(rootChirho, relativeChirho),
				readFileSyncChirho(joinChirho(process.cwd(), relativeChirho))
			);
		}
	}
	return rootChirho;
}
function changeChirho(
	rootChirho: string,
	mutateChirho: (chapterChirho: MutableChapterChirho) => void,
	coherentChirho = true
) {
	const pathChirho = 'static/content-chirho/lamentations-chirho/chapter-04-chirho.json';
	const chapterChirho = JSON.parse(
		readFileSyncChirho(joinChirho(rootChirho, pathChirho), 'utf8')
	) as MutableChapterChirho;
	mutateChirho(chapterChirho);
	const textChirho = JSON.stringify(chapterChirho) + '\n';
	writeFileSyncChirho(joinChirho(rootChirho, pathChirho), textChirho);
	if (coherentChirho) {
		const manifestPathChirho = joinChirho(
			rootChirho,
			'static/content-chirho/lamentations-chirho/manifest-chirho.json'
		);
		const manifestChirho = JSON.parse(readFileSyncChirho(manifestPathChirho, 'utf8')) as {
			chapters_chirho: { path_chirho: string; sha256_chirho: string }[];
		};
		manifestChirho.chapters_chirho.find(
			(rowChirho) => rowChirho.path_chirho === '/' + pathChirho.slice(7)
		)!.sha256_chirho = createHashChirho('sha256').update(textChirho).digest('hex');
		writeFileSyncChirho(manifestPathChirho, JSON.stringify(manifestChirho));
	}
}
describe('reviewed native speech export', () => {
	it('exports only reviewed speech differences with no IPA or evidence prose', () => {
		const dataChirho = spokenOverridesChirho(fixtureChirho());
		expect(dataChirho.words_chirho).toHaveLength(3);
		expect(JSON.stringify(dataChirho)).not.toContain('ipa_chirho');
		expect(JSON.stringify(dataChirho)).not.toContain('evidence_chirho');
		expect(
			dataChirho.words_chirho.filter((rowChirho) => rowChirho.written_group_chirho)
		).toHaveLength(2);
	});
	it('refuses stale chapter bytes before exporting', () => {
		const rootChirho = fixtureChirho();
		changeChirho(
			rootChirho,
			(chapterChirho) => {
				chapterChirho.changed_chirho = true;
			},
			false
		);
		expect(() => spokenOverridesChirho(rootChirho)).toThrow('canonical chapter changed');
	});
	it('refuses coherent changed identity or attached qere', () => {
		for (const fieldChirho of ['lemma_id_chirho', 'qere_chirho']) {
			const rootChirho = fixtureChirho();
			changeChirho(rootChirho, (chapterChirho) => {
				const tokenChirho = chapterChirho.verses_chirho
					.find((rowChirho) => rowChirho.id_chirho === 'Lam.4.3')!
					.tokens_chirho.find((rowChirho) => rowChirho.id_chirho === '257vQ')!;
				tokenChirho[fieldChirho] =
					fieldChirho === 'qere_chirho'
						? [{ ...tokenChirho, text_chirho: 'new-qere-chirho' }]
						: 'H9999';
			});
			expect(() => spokenOverridesChirho(rootChirho)).toThrow(/changed/);
		}
	});
	it('refuses changed canonical scalar order or a nonconsecutive group', () => {
		for (const kindChirho of ['canonical-chirho', 'group-chirho']) {
			const rootChirho = fixtureChirho();
			changeChirho(rootChirho, (chapterChirho) => {
				const lessonChirho = chapterChirho.verses_chirho.find(
					(rowChirho) => rowChirho.id_chirho === 'Lam.4.3'
				)!;
				if (kindChirho === 'canonical-chirho')
					lessonChirho.canonical_text_chirho = lessonChirho.canonical_text_chirho.normalize('NFD');
				else {
					const indexChirho = lessonChirho.tokens_chirho.findIndex(
						(rowChirho) => rowChirho.id_chirho === '257vQ'
					);
					lessonChirho.tokens_chirho.splice(indexChirho + 1, 0, {
						...lessonChirho.tokens_chirho[0],
						id_chirho: 'inserted-chirho'
					});
				}
			});
			expect(() => spokenOverridesChirho(rootChirho)).toThrow(/changed/);
		}
	});
});
