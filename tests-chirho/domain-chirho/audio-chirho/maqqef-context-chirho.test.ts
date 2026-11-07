// For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life. — John 3:16 (KJV)
import { afterEach as afterEachChirho, expect as expectChirho, it as itChirho, vi } from 'vitest';
import {
	readFile as readFileChirho,
	mkdtemp as mkdtempChirho,
	mkdir as mkdirChirho,
	writeFile as writeFileChirho,
	rm as rmChirho,
	access as accessChirho
} from 'node:fs/promises';
import { tmpdir as tmpdirChirho } from 'node:os';
import { execFileSync as execFileSyncChirho } from 'node:child_process';
import { dirname as dirnameChirho, join as joinChirho } from 'node:path';
import {
	cacheKeyChirho,
	sha256Chirho,
	type AudioJobChirho,
	type ReceiptChirho
} from '../../../scripts-chirho/audio-chirho/audition_chirho';
import {
	deriveMaqqefContextChirho,
	maqqefContextRequiredChirho,
	verifyMaqqefOccurrenceChirho,
	verifyMaqqefWordSourcesChirho,
	type MaqqefVerseChirho
} from '../../../scripts-chirho/audio-chirho/production-chirho/maqqef-chirho/context_chirho';
import type {
	LibraryWordChirho,
	WordOccurrenceChirho
} from '../../../scripts-chirho/audio-chirho/production-chirho/prepare_words_chirho';
import {
	verifyWordSourcesChirho,
	WordSourceRefusalChirho
} from '../../../scripts-chirho/audio-chirho/production-chirho/run_words_chirho';
import { installWordsChirho } from '../../../scripts-chirho/audio-chirho/production-chirho/install_words_chirho';
import {
	HEBREW_WORD_RECIPE_CHIRHO,
	productionWordRecipeChirho
} from '../../../src/lib/domain-chirho/pronunciation-chirho/production-recipe-chirho';
import { verifyAudioChirho } from '../../../scripts-chirho/publish-chirho/audio_rules_chirho';

const uploadChirho = vi.hoisted(() =>
	vi.fn(async () => ({ uploaded_chirho: 0, pending_chirho: 0 }))
);
vi.mock(
	'../../../scripts-chirho/audio-chirho/r2_recordings_chirho',
	async (importOriginalChirho) => ({
		...(await importOriginalChirho<Record<string, unknown>>()),
		uploadAudioChirho: uploadChirho
	})
);
const rootsChirho: string[] = [];
afterEachChirho(async () => {
	uploadChirho.mockClear();
	await Promise.all(
		rootsChirho
			.splice(0)
			.map((rootChirho) => rmChirho(rootChirho, { recursive: true, force: true }))
	);
});

async function sourceChirho(pathChirho: string, verseIdChirho: string, tokenIdChirho: string) {
	const bytesChirho = await readFileChirho('static' + pathChirho);
	const verseChirho = (
		JSON.parse(bytesChirho.toString()).verses_chirho as MaqqefVerseChirho[]
	).find((verseChirho) => verseChirho.id_chirho === verseIdChirho)!;
	const tokenChirho = verseChirho.tokens_chirho.find(
		(tokenChirho) => tokenChirho.id_chirho === tokenIdChirho
	)!;
	const contextChirho = deriveMaqqefContextChirho(verseChirho, tokenIdChirho);
	const occurrenceChirho: WordOccurrenceChirho = {
		lesson_id_chirho: verseIdChirho,
		token_id_chirho: tokenIdChirho,
		text_chirho: tokenChirho.text_chirho,
		canonical_sha256_chirho: sha256Chirho(verseChirho.canonical_text_chirho),
		content_path_chirho: pathChirho,
		content_sha256_chirho: sha256Chirho(bytesChirho),
		maqqef_group_chirho: contextChirho.group_chirho
	};
	return {
		bytes_chirho: bytesChirho,
		verse_chirho: verseChirho,
		occurrence_chirho: occurrenceChirho,
		ipa_chirho: contextChirho.ipa_chirho
	};
}
async function fixtureChirho() {
	const sourcesChirho = [
		await sourceChirho(
			'/content-chirho/genesis-chirho/chapter-01-chirho.json',
			'Gen.1.12',
			'01Ptj'
		),
		await sourceChirho('/content-chirho/job-chirho/chapter-09-chirho.json', 'Job.9.9', '18T2X')
	];
	const firstChirho = sourcesChirho[0];
	const jobChirho: AudioJobChirho = {
		id_chirho: 'maqqef-test-chirho',
		lesson_id_chirho: firstChirho.occurrence_chirho.lesson_id_chirho,
		token_id_chirho: firstChirho.occurrence_chirho.token_id_chirho,
		text_chirho: firstChirho.occurrence_chirho.text_chirho,
		canonical_sha256_chirho: firstChirho.occurrence_chirho.canonical_sha256_chirho,
		language_chirho: 'he',
		recipe_id_chirho: HEBREW_WORD_RECIPE_CHIRHO,
		...productionWordRecipeChirho(
			firstChirho.occurrence_chirho.text_chirho,
			HEBREW_WORD_RECIPE_CHIRHO,
			firstChirho.ipa_chirho
		)
	};
	const wordChirho: LibraryWordChirho = {
		key_chirho: cacheKeyChirho(jobChirho),
		job_chirho: jobChirho,
		occurrences_chirho: sourcesChirho.map((sourceChirho) => sourceChirho.occurrence_chirho),
		analysis_note_chirho: 'Exact maqqef source fixture',
		source_context_chirho: 'maqqef_chirho'
	};
	return { sources_chirho: sourcesChirho, word_chirho: wordChirho };
}
function invalidWordsChirho(wordChirho: LibraryWordChirho) {
	const contextChirho = structuredClone(wordChirho);
	contextChirho.occurrences_chirho[1].maqqef_group_chirho += 'ה';
	const ipaChirho = structuredClone(wordChirho);
	Object.assign(
		ipaChirho.job_chirho,
		productionWordRecipeChirho(ipaChirho.job_chirho.text_chirho, HEBREW_WORD_RECIPE_CHIRHO, 'ʔa')
	);
	ipaChirho.key_chirho = cacheKeyChirho(ipaChirho.job_chirho);
	const hashChirho = structuredClone(wordChirho);
	hashChirho.occurrences_chirho[1].content_sha256_chirho = '0'.repeat(64);
	const missingChirho = structuredClone(wordChirho);
	delete missingChirho.source_context_chirho;
	for (const occurrenceChirho of missingChirho.occurrences_chirho)
		delete occurrenceChirho.maqqef_group_chirho;
	return [contextChirho, ipaChirho, hashChirho, missingChirho];
}

itChirho(
	'derives exact contextual IPA and retains different occurrence contexts for one synthesis key',
	async () => {
		const fixtureValueChirho = await fixtureChirho();
		const beforeChirho = JSON.stringify(fixtureValueChirho.sources_chirho);
		expectChirho(
			fixtureValueChirho.sources_chirho.map((sourceChirho) => sourceChirho.ipa_chirho)
		).toEqual(['ʔose', 'ʔose']);
		expectChirho(
			new Set(
				fixtureValueChirho.word_chirho.occurrences_chirho.map(
					(occurrenceChirho) => occurrenceChirho.maqqef_group_chirho
				)
			).size
		).toBe(2);
		await verifyWordSourcesChirho(process.cwd(), [fixtureValueChirho.word_chirho]);
		await verifyMaqqefWordSourcesChirho(process.cwd(), [fixtureValueChirho.word_chirho]);
		expectChirho(JSON.stringify(fixtureValueChirho.sources_chirho)).toBe(beforeChirho);
	}
);

itChirho(
	'refuses changed group, self-consistent wrong IPA, changed source hash and deleted proofs before production',
	async () => {
		const { word_chirho: wordChirho } = await fixtureChirho();
		for (const invalidChirho of invalidWordsChirho(wordChirho)) {
			expectChirho(maqqefContextRequiredChirho(invalidChirho)).toBe(true);
			await expectChirho(
				verifyWordSourcesChirho(process.cwd(), [invalidChirho])
			).rejects.toBeInstanceOf(WordSourceRefusalChirho);
			await expectChirho(
				verifyMaqqefWordSourcesChirho(process.cwd(), [invalidChirho])
			).rejects.toThrow(/Maqqef/);
		}
	}
);

itChirho(
	'holds qere, Aramaic, accented nonfinal members, changed spans and missing joins',
	async () => {
		const { sources_chirho: sourcesChirho, word_chirho: wordChirho } = await fixtureChirho();
		for (const mutateChirho of [
			(verseChirho: MaqqefVerseChirho) => {
				verseChirho.tokens_chirho.find(
					(tokenChirho) => tokenChirho.id_chirho === '01Ptj'
				)!.qere_chirho = [{ text_chirho: 'read' }];
			},
			(verseChirho: MaqqefVerseChirho) => {
				verseChirho.tokens_chirho.find(
					(tokenChirho) => tokenChirho.id_chirho === '01Ptj'
				)!.source_language_chirho = 'arc';
			},
			(verseChirho: MaqqefVerseChirho) => {
				verseChirho.tokens_chirho.find(
					(tokenChirho) => tokenChirho.id_chirho === '01Ptj'
				)!.text_chirho += '֣';
			},
			(verseChirho: MaqqefVerseChirho) => {
				verseChirho.tokens_chirho.find((tokenChirho) => tokenChirho.id_chirho === '01Ptj')!
					.start_chirho++;
			},
			(verseChirho: MaqqefVerseChirho) => {
				const tokenChirho = verseChirho.tokens_chirho.find(
					(tokenChirho) => tokenChirho.id_chirho === '01Ptj'
				)!;
				verseChirho.canonical_text_chirho =
					verseChirho.canonical_text_chirho.slice(0, tokenChirho.end_chirho) +
					' ' +
					verseChirho.canonical_text_chirho.slice(tokenChirho.end_chirho + 1);
			}
		]) {
			const verseChirho = structuredClone(sourcesChirho[0].verse_chirho);
			mutateChirho(verseChirho);
			expectChirho(() =>
				verifyMaqqefOccurrenceChirho(
					verseChirho,
					wordChirho.occurrences_chirho[0],
					wordChirho.job_chirho
				)
			).toThrow(/Maqqef/);
		}
		const divineChirho = JSON.parse(
			await readFileChirho('static/content-chirho/genesis-chirho/chapter-15-chirho.json', 'utf8')
		).verses_chirho.find((verseChirho: MaqqefVerseChirho) => verseChirho.id_chirho === 'Gen.15.1');
		expectChirho(() => deriveMaqqefContextChirho(divineChirho, '01ef9')).toThrow(/divine-name/);
	}
);

itChirho('leaves non-maqqef legacy source validation unchanged', async () => {
	const legacyChirho = JSON.parse(
		await readFileChirho(
			'tests-chirho/fixtures-chirho/audio-chirho/proverbs-word-chirho.json',
			'utf8'
		)
	).words_chirho[0] as LibraryWordChirho;
	expectChirho(maqqefContextRequiredChirho(legacyChirho)).toBe(false);
	await verifyMaqqefWordSourcesChirho('/not-read-for-legacy-chirho', [legacyChirho]);
	await verifyWordSourcesChirho(process.cwd(), [legacyChirho]);
});

async function scratchChirho() {
	const valueChirho = await fixtureChirho();
	const rootChirho = await mkdtempChirho(joinChirho(tmpdirChirho(), 'hinneh-maqqef-test-chirho-'));
	rootsChirho.push(rootChirho);
	for (const sourceValueChirho of valueChirho.sources_chirho) {
		const pathChirho = joinChirho(
			rootChirho,
			'static',
			sourceValueChirho.occurrence_chirho.content_path_chirho
		);
		await mkdirChirho(dirnameChirho(pathChirho), { recursive: true });
		await writeFileChirho(pathChirho, sourceValueChirho.bytes_chirho);
	}
	const folderChirho = joinChirho(rootChirho, 'received-chirho');
	await mkdirChirho(folderChirho);
	const audioPathChirho = joinChirho(folderChirho, 'fixture-chirho.mp3');
	execFileSyncChirho('ffmpeg', [
		'-v',
		'error',
		'-f',
		'lavfi',
		'-i',
		'sine=frequency=440:duration=0.4',
		'-codec:a',
		'libmp3lame',
		audioPathChirho
	]);
	const bytesChirho = await readFileChirho(audioPathChirho);
	const receiptChirho: ReceiptChirho = {
		id_chirho: valueChirho.word_chirho.job_chirho.id_chirho,
		key_chirho: valueChirho.word_chirho.key_chirho,
		reserved_credits_chirho: 0,
		state_chirho: 'received',
		voice_id_chirho: 'fixture-chirho',
		voice_name_chirho: 'Fixture',
		path_chirho: 'fixture-chirho.mp3',
		sha256_chirho: sha256Chirho(bytesChirho),
		bytes_chirho: bytesChirho.length
	};
	return {
		...valueChirho,
		root_chirho: rootChirho,
		folder_chirho: folderChirho,
		receipt_chirho: receiptChirho,
		bytes_chirho: bytesChirho
	};
}

itChirho(
	'preflights all received maqqef occurrences before installer writes or archive calls',
	async () => {
		const fixtureValueChirho = await scratchChirho();
		for (const invalidChirho of invalidWordsChirho(fixtureValueChirho.word_chirho)) {
			await expectChirho(
				installWordsChirho(
					fixtureValueChirho.root_chirho,
					fixtureValueChirho.folder_chirho,
					[invalidChirho],
					[{ ...fixtureValueChirho.receipt_chirho, key_chirho: invalidChirho.key_chirho }],
					null
				)
			).rejects.toThrow(/Maqqef/);
			expectChirho(uploadChirho).not.toHaveBeenCalled();
			await expectChirho(
				accessChirho(joinChirho(fixtureValueChirho.root_chirho, 'build-chirho'))
			).rejects.toThrow();
			await expectChirho(
				accessChirho(joinChirho(fixtureValueChirho.root_chirho, 'static/audio-chirho'))
			).rejects.toThrow();
		}
	}
);

itChirho(
	'preserves each installed context and publisher rederives it rather than trusting IPA consistency',
	async () => {
		const valueChirho = await scratchChirho();
		await installWordsChirho(
			valueChirho.root_chirho,
			valueChirho.folder_chirho,
			[valueChirho.word_chirho],
			[valueChirho.receipt_chirho],
			null
		);
		expectChirho(uploadChirho).toHaveBeenCalledOnce();
		const manifestChirho = JSON.parse(
			await readFileChirho(
				joinChirho(valueChirho.root_chirho, 'static/audio-chirho/manifest-chirho.json'),
				'utf8'
			)
		);
		const filesChirho = new Map<string, Uint8Array>();
		filesChirho.set(
			'audio-chirho/manifest-chirho.json',
			Buffer.from(JSON.stringify(manifestChirho))
		);
		for (const sourceValueChirho of valueChirho.sources_chirho)
			filesChirho.set(
				sourceValueChirho.occurrence_chirho.content_path_chirho.slice(1),
				sourceValueChirho.bytes_chirho
			);
		filesChirho.set(
			`audio-chirho/sha256-chirho/${valueChirho.receipt_chirho.sha256_chirho}-chirho.mp3`,
			valueChirho.bytes_chirho
		);
		const chaptersChirho: {
			path_chirho: string;
			entry_chirho: { sha256_chirho: string };
			value_chirho: { clips_chirho: Record<string, unknown>[] };
		}[] = [];
		for (const bookChirho of Object.values(manifestChirho.books_chirho) as {
			chapters_chirho: { path_chirho: string; sha256_chirho: string }[];
		}[]) {
			for (const entryChirho of bookChirho.chapters_chirho) {
				const bytesChirho = await readFileChirho(
					joinChirho(valueChirho.root_chirho, 'static', entryChirho.path_chirho)
				);
				const chapterChirho = JSON.parse(bytesChirho.toString());
				const clipChirho = chapterChirho.clips_chirho[0];
				expectChirho(clipChirho.source_context_chirho).toBe('maqqef_chirho');
				expectChirho(clipChirho.maqqef_group_chirho).toBe(
					valueChirho.word_chirho.occurrences_chirho.find(
						(occurrenceChirho) => occurrenceChirho.token_id_chirho === clipChirho.token_id_chirho
					)!.maqqef_group_chirho
				);
				filesChirho.set(entryChirho.path_chirho.slice(1), bytesChirho);
				chaptersChirho.push({
					path_chirho: entryChirho.path_chirho.slice(1),
					entry_chirho: entryChirho,
					value_chirho: chapterChirho
				});
			}
		}
		const reasonsChirho: string[] = [];
		verifyAudioChirho(filesChirho, true, reasonsChirho);
		expectChirho(reasonsChirho).toEqual([]);
		for (const changesChirho of [
			{ maqqef_group_chirho: 'changed-chirho' },
			{ ipa_chirho: 'ʔa', synthesis_text_chirho: '"/ʔa/"' },
			{ maqqef_group_chirho: undefined }
		]) {
			const mutatedFilesChirho = new Map(filesChirho);
			const chapterChirho = structuredClone(chaptersChirho[0].value_chirho);
			Object.assign(chapterChirho.clips_chirho[0], changesChirho);
			const bytesChirho = Buffer.from(JSON.stringify(chapterChirho));
			mutatedFilesChirho.set(chaptersChirho[0].path_chirho, bytesChirho);
			const changedManifestChirho = structuredClone(manifestChirho);
			for (const bookChirho of Object.values(changedManifestChirho.books_chirho) as {
				chapters_chirho: { path_chirho: string; sha256_chirho: string }[];
			}[])
				for (const entryChirho of bookChirho.chapters_chirho)
					if (entryChirho.path_chirho.slice(1) === chaptersChirho[0].path_chirho)
						entryChirho.sha256_chirho = sha256Chirho(bytesChirho);
			mutatedFilesChirho.set(
				'audio-chirho/manifest-chirho.json',
				Buffer.from(JSON.stringify(changedManifestChirho))
			);
			const problemsChirho: string[] = [];
			verifyAudioChirho(mutatedFilesChirho, true, problemsChirho);
			expectChirho(problemsChirho.join(' ')).toMatch(/Maqqef/);
		}
	}
);
