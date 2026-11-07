// For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life. — John 3:16 (KJV)
import { afterEach as afterEachChirho, expect as expectChirho, it as itChirho, vi } from 'vitest';
import {
	readFile as readFileChirho,
	writeFile as writeFileChirho,
	mkdir as mkdirChirho,
	mkdtemp as mkdtempChirho,
	rm as rmChirho,
	access as accessChirho
} from 'node:fs/promises';
import { join as joinChirho, dirname as dirnameChirho } from 'node:path';
import { tmpdir as tmpdirChirho } from 'node:os';
import dataChirho from '../../../src/lib/domain-chirho/pronunciation-chirho/hebrew-chirho/profile-readings-chirho/profiles-chirho.json';
import continuationChirho from '../../../src/lib/domain-chirho/pronunciation-chirho/hebrew-chirho/profile-readings-chirho/continuation-01-chirho.json';
import { profileReadingChirho } from '../../../src/lib/domain-chirho/pronunciation-chirho/hebrew-chirho/profile-readings-chirho';
import type { ProfileReadingChirho } from '../../../src/lib/domain-chirho/pronunciation-chirho/hebrew-chirho/profile-readings-chirho';
import type { LessonChirho } from '../../../src/lib/domain-chirho/lesson-chirho';
import { verifyWordSourcesChirho } from '../../../scripts-chirho/audio-chirho/production-chirho/run_words_chirho';
import { installWordsChirho } from '../../../scripts-chirho/audio-chirho/production-chirho/install_words_chirho';
import {
	cacheKeyChirho,
	sha256Chirho,
	type ReceiptChirho
} from '../../../scripts-chirho/audio-chirho/audition_chirho';
import {
	HEBREW_WORD_RECIPE_CHIRHO,
	productionWordRecipeChirho
} from '../../../src/lib/domain-chirho/pronunciation-chirho/production-recipe-chirho';
import type { LibraryWordChirho } from '../../../scripts-chirho/audio-chirho/production-chirho/prepare_words_chirho';
import { verifyAudioChirho } from '../../../scripts-chirho/publish-chirho/audio_rules_chirho';
const rootsChirho: string[] = [];
afterEachChirho(async () => {
	vi.unstubAllGlobals();
	await Promise.all(
		rootsChirho
			.splice(0)
			.map((rootChirho) => rmChirho(rootChirho, { recursive: true, force: true }))
	);
});
const profilesChirho = dataChirho.profiles_chirho as ProfileReadingChirho[];
function wordChirho(profileChirho: ProfileReadingChirho): LibraryWordChirho {
	const jobChirho = {
		id_chirho: 'profile-test-chirho',
		lesson_id_chirho: profileChirho.lesson_id_chirho,
		token_id_chirho: profileChirho.token_id_chirho,
		language_chirho: 'he' as const,
		text_chirho: profileChirho.spoken_text_chirho,
		canonical_sha256_chirho: profileChirho.canonical_sha256_chirho,
		recipe_id_chirho: HEBREW_WORD_RECIPE_CHIRHO,
		...productionWordRecipeChirho(
			profileChirho.spoken_text_chirho,
			HEBREW_WORD_RECIPE_CHIRHO,
			profileChirho.ipa_chirho
		)
	};
	return {
		key_chirho: cacheKeyChirho(jobChirho),
		job_chirho: jobChirho,
		source_context_chirho: 'profile_chirho',
		analysis_note_chirho: 'Finite source profile fixture',
		occurrences_chirho: [
			{
				lesson_id_chirho: profileChirho.lesson_id_chirho,
				token_id_chirho: profileChirho.token_id_chirho,
				text_chirho: profileChirho.spoken_text_chirho,
				canonical_sha256_chirho: profileChirho.canonical_sha256_chirho,
				content_path_chirho: profileChirho.content_path_chirho,
				content_sha256_chirho: profileChirho.content_sha256_chirho,
				profile_id_chirho: profileChirho.id_chirho
			}
		]
	};
}
function invalidChirho(wordValueChirho: LibraryWordChirho) {
	const noMarkerChirho = structuredClone(wordValueChirho);
	delete noMarkerChirho.source_context_chirho;
	delete noMarkerChirho.occurrences_chirho[0].profile_id_chirho;
	noMarkerChirho.job_chirho.id_chirho = 'ordinary-word-chirho';
	const wrongIpaChirho = structuredClone(wordValueChirho);
	wrongIpaChirho.job_chirho.ipa_chirho = 'wrong';
	wrongIpaChirho.job_chirho.synthesis_text_chirho = '"/wrong/"';
	wrongIpaChirho.key_chirho = cacheKeyChirho(wrongIpaChirho.job_chirho);
	return [noMarkerChirho, wrongIpaChirho];
}
itChirho('checks each finite profile class at the actual producer source boundary', async () => {
	for (const kindChirho of [
		'divine_maqqef_chirho',
		'qere_maqqef_chirho',
		'exact_stress_parallel_chirho'
	]) {
		const profileChirho = profilesChirho.find(
			(rowChirho) => rowChirho.profile_kind_chirho === kindChirho
		)!;
		const wordValueChirho = wordChirho(profileChirho);
		await verifyWordSourcesChirho(process.cwd(), [wordValueChirho]);
		for (const badChirho of invalidChirho(wordValueChirho))
			await expectChirho(verifyWordSourcesChirho(process.cwd(), [badChirho])).rejects.toThrow(
				/profile/i
			);
	}
});
itChirho(
	'retains distinct canonical and profile bindings when an IPA key is reused across verses',
	async () => {
		const firstChirho = profilesChirho[0];
		const secondChirho = profilesChirho.find(
			(rowChirho) =>
				rowChirho.ipa_chirho === firstChirho.ipa_chirho &&
				rowChirho.canonical_sha256_chirho !== firstChirho.canonical_sha256_chirho
		)!;
		const sharedChirho = wordChirho(firstChirho);
		sharedChirho.occurrences_chirho.push(...wordChirho(secondChirho).occurrences_chirho);
		await verifyWordSourcesChirho(process.cwd(), [sharedChirho]);
		const wrongChirho = structuredClone(sharedChirho);
		wrongChirho.occurrences_chirho[1].canonical_sha256_chirho = firstChirho.canonical_sha256_chirho;
		await expectChirho(verifyWordSourcesChirho(process.cwd(), [wrongChirho])).rejects.toThrow(
			/source|profile/i
		);
	}
);
itChirho(
	'rereads independent checked-tail evidence before producer or installer work',
	async () => {
		const rawChirho = continuationChirho.profiles_chirho.find(
			(rowChirho) => rowChirho.profile_kind_chirho === 'checked_tail_maqqef_chirho'
		)!;
		const bytesChirho = await readFileChirho('static' + rawChirho.content_path_chirho);
		const chapterChirho = JSON.parse(bytesChirho.toString()) as { verses_chirho: LessonChirho[] };
		const verseChirho = chapterChirho.verses_chirho.find(
			(rowChirho) => rowChirho.id_chirho === rawChirho.lesson_id_chirho
		)!;
		const profileChirho = profileReadingChirho(verseChirho, rawChirho.token_id_chirho)!;
		const evidenceChirho = profileChirho.tail_stress_evidence_chirho!;
		expectChirho(evidenceChirho.content_path_chirho).not.toBe(profileChirho.content_path_chirho);
		const rootChirho = await mkdtempChirho(
			joinChirho(tmpdirChirho(), 'profile-tail-evidence-chirho-')
		);
		rootsChirho.push(rootChirho);
		for (const pathChirho of [
			profileChirho.content_path_chirho,
			evidenceChirho.content_path_chirho
		]) {
			const fullChirho = joinChirho(rootChirho, 'static', pathChirho);
			await mkdirChirho(dirnameChirho(fullChirho), { recursive: true });
			await writeFileChirho(fullChirho, await readFileChirho('static' + pathChirho));
		}
		await verifyWordSourcesChirho(rootChirho, [wordChirho(profileChirho)]);
		const evidencePathChirho = joinChirho(rootChirho, 'static', evidenceChirho.content_path_chirho);
		const changedChirho = JSON.parse(await readFileChirho(evidencePathChirho, 'utf8')) as {
			verses_chirho: LessonChirho[];
		};
		changedChirho.verses_chirho
			.find((rowChirho) => rowChirho.id_chirho === evidenceChirho.lesson_id_chirho)!
			.tokens_chirho.find(
				(rowChirho) => rowChirho.id_chirho === evidenceChirho.token_id_chirho
			)!.lemma_id_chirho = 'H1';
		await writeFileChirho(evidencePathChirho, JSON.stringify(changedChirho));
		await expectChirho(
			verifyWordSourcesChirho(rootChirho, [wordChirho(profileChirho)])
		).rejects.toThrow(/evidence chapter changed/i);
	}
);
itChirho('refuses a deleted profile before any installer output or remote call', async () => {
	const profileChirho = profilesChirho[0],
		rootChirho = await mkdtempChirho(joinChirho(tmpdirChirho(), 'profile-install-chirho-'));
	rootsChirho.push(rootChirho);
	const sourcePathChirho = joinChirho(rootChirho, 'static', profileChirho.content_path_chirho);
	await mkdirChirho(dirnameChirho(sourcePathChirho), { recursive: true });
	await writeFileChirho(
		sourcePathChirho,
		await readFileChirho('static' + profileChirho.content_path_chirho)
	);
	const fetchChirho = vi.fn(() => {
		throw Error('Network forbidden');
	});
	vi.stubGlobal('fetch', fetchChirho);
	for (const badChirho of invalidChirho(wordChirho(profileChirho))) {
		const receiptChirho: ReceiptChirho = {
			id_chirho: badChirho.job_chirho.id_chirho,
			key_chirho: badChirho.key_chirho,
			state_chirho: 'received',
			reserved_credits_chirho: 0,
			voice_id_chirho: 'fixture-chirho',
			voice_name_chirho: 'Fixture',
			path_chirho: 'fixture-chirho.mp3',
			sha256_chirho: '0'.repeat(64),
			bytes_chirho: 834
		};
		await expectChirho(
			installWordsChirho(
				rootChirho,
				joinChirho(rootChirho, 'received-chirho'),
				[badChirho],
				[receiptChirho],
				null
			)
		).rejects.toThrow(/profile/i);
		await expectChirho(accessChirho(joinChirho(rootChirho, 'build-chirho'))).rejects.toThrow();
		await expectChirho(
			accessChirho(joinChirho(rootChirho, 'static/audio-chirho'))
		).rejects.toThrow();
	}
	expectChirho(fetchChirho).not.toHaveBeenCalled();
});
async function filesChirho(changesChirho: Record<string, unknown> = {}) {
	const profileChirho = profilesChirho[0],
		wordValueChirho = wordChirho(profileChirho),
		[bookChirho, numberChirho] = profileChirho.lesson_id_chirho.split('.');
	const contentBytesChirho = await readFileChirho('static' + profileChirho.content_path_chirho),
		contentChirho = JSON.parse(contentBytesChirho.toString()) as {
			verses_chirho: LessonChirho[];
		};
	const audioChirho = new Uint8Array(834);
	for (const offsetChirho of [0, 417]) audioChirho.set([0xff, 0xfb, 0x90, 0xc0], offsetChirho);
	const hashChirho = sha256Chirho(audioChirho),
		assetPathChirho = '/audio-chirho/sha256-chirho/' + hashChirho + '-chirho.mp3';
	const clipChirho = {
		...wordValueChirho.job_chirho,
		source_context_chirho: 'profile_chirho',
		profile_id_chirho: profileChirho.id_chirho,
		voice_name_chirho: 'Synthetic fixture',
		asset_path_chirho: assetPathChirho,
		sha256_chirho: hashChirho,
		bytes_chirho: audioChirho.length,
		duration_chirho: 1,
		review_chirho: 'audition',
		pronunciation_chirho: 'israeli_hebrew',
		license_chirho: 'Synthetic fixture',
		...changesChirho
	};
	const pathChirho = profileChirho.content_path_chirho.replace(
		'/content-chirho/',
		'/audio-chirho/'
	);
	const chapterBytesChirho = Buffer.from(
		JSON.stringify({
			schema_version_chirho: 1,
			book_id_chirho: bookChirho,
			chapter_chirho: Number(numberChirho),
			content_path_chirho: profileChirho.content_path_chirho,
			content_sha256_chirho: sha256Chirho(contentBytesChirho),
			clips_chirho: [clipChirho]
		})
	);
	const manifestChirho = {
		schema_version_chirho: 1,
		books_chirho: {
			[bookChirho]: {
				chapters_chirho: [
					{
						number_chirho: Number(numberChirho),
						path_chirho: pathChirho,
						sha256_chirho: sha256Chirho(chapterBytesChirho)
					}
				]
			}
		}
	};
	return {
		files_chirho: new Map<string, Uint8Array>([
			['audio-chirho/manifest-chirho.json', Buffer.from(JSON.stringify(manifestChirho))],
			[profileChirho.content_path_chirho.slice(1), contentBytesChirho],
			[pathChirho.slice(1), chapterBytesChirho],
			[assetPathChirho.slice(1), audioChirho]
		]),
		verse_chirho: contentChirho.verses_chirho.find(
			(rowChirho) => rowChirho.id_chirho === profileChirho.lesson_id_chirho
		)!
	};
}
itChirho(
	'publisher requires the source profile even for a self-consistent IPA recipe',
	async () => {
		for (const changesChirho of [
			{},
			{ source_context_chirho: undefined, profile_id_chirho: undefined, id_chirho: undefined },
			{ ipa_chirho: 'wrong', synthesis_text_chirho: '"/wrong/"' }
		]) {
			const valueChirho = await filesChirho(changesChirho),
				reasonsChirho: string[] = [];
			verifyAudioChirho(valueChirho.files_chirho, true, reasonsChirho);
			if (Object.keys(changesChirho).length)
				expectChirho(reasonsChirho.join(' ')).toMatch(/profile/i);
			else expectChirho(reasonsChirho).toEqual([]);
		}
	}
);
itChirho(
	'actual web selector rejects stripped profile markers and a self-consistent wrong IPA',
	async () => {
		for (const changesChirho of [
			{},
			{ source_context_chirho: undefined, profile_id_chirho: undefined, id_chirho: undefined },
			{ ipa_chirho: 'wrong', synthesis_text_chirho: '"/wrong/"' }
		]) {
			vi.resetModules();
			const valueChirho = await filesChirho(changesChirho);
			vi.stubGlobal('fetch', async (pathChirho: string) => {
				const bytesChirho = valueChirho.files_chirho.get(pathChirho.replace(/^\//u, ''));
				if (!bytesChirho) throw Error('Unexpected fetch');
				return new Response(Buffer.from(bytesChirho));
			});
			const { recordingsForLessonChirho } =
				await import('../../../src/lib/reader-chirho/audio-chirho/recordings-chirho');
			expectChirho((await recordingsForLessonChirho(valueChirho.verse_chirho)).length).toBe(
				Object.keys(changesChirho).length ? 0 : 1
			);
		}
	}
);
