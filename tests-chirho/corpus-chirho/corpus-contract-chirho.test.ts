// For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life. — John 3:16 (KJV)

import { describe as describeChirho, expect as expectChirho, it as itChirho } from 'vitest';
import { readFileSync as readFileSyncChirho } from 'node:fs';
import { createHash as createHashChirho } from 'node:crypto';
import { validateLessonChirho } from '../../src/lib/domain-chirho/lesson-chirho';

// The generated Proverbs corpus, read exactly as the reader fetches it: manifest, then chapters.
const manifestChirho = JSON.parse(
	readFileSyncChirho('static/content-chirho/proverbs-chirho/manifest-chirho.json', 'utf8')
);

describeChirho('Proverbs corpus contract', () => {
	itChirho('lists 31 chapters whose bytes match their manifest hashes', () => {
		expectChirho(manifestChirho.book_id_chirho).toBe('Prov');
		expectChirho(
			manifestChirho.chapters_chirho.map(
				(chapterChirho: { number_chirho: number }) => chapterChirho.number_chirho
			)
		).toEqual(Array.from({ length: 31 }, (_slotChirho, indexChirho) => indexChirho + 1));
		for (const chapterChirho of manifestChirho.chapters_chirho) {
			const bytesChirho = readFileSyncChirho(`static${chapterChirho.path_chirho}`);
			expectChirho(createHashChirho('sha256').update(bytesChirho).digest('hex')).toBe(
				chapterChirho.sha256_chirho
			);
		}
	});

	itChirho('passes the reader validator for every verse, in order', () => {
		let versesChirho = 0;
		for (const chapterChirho of manifestChirho.chapters_chirho) {
			const fileChirho = JSON.parse(
				readFileSyncChirho(`static${chapterChirho.path_chirho}`, 'utf8')
			);
			expectChirho(fileChirho.verses_chirho).toHaveLength(chapterChirho.verse_count_chirho);
			fileChirho.verses_chirho.forEach((verseChirho: unknown, indexChirho: number) => {
				const lessonChirho = validateLessonChirho(verseChirho);
				expectChirho(lessonChirho.id_chirho).toBe(
					`Prov.${chapterChirho.number_chirho}.${indexChirho + 1}`
				);
				versesChirho += 1;
			});
		}
		expectChirho(versesChirho).toBe(915);
	});
});
