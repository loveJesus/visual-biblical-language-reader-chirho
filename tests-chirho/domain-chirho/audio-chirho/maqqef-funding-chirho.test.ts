// For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life. — John 3:16 (KJV)
import { afterEach, describe, expect, it, vi } from 'vitest';
import {
	mkdtemp as mkdtempChirho,
	mkdir as mkdirChirho,
	readFile as readFileChirho,
	rm as rmChirho,
	writeFile as writeFileChirho
} from 'node:fs/promises';
import { tmpdir as tmpdirChirho } from 'node:os';
import { dirname as dirnameChirho, join as joinChirho } from 'node:path';
import {
	cacheKeyChirho,
	reserveChirho,
	sha256Chirho,
	synthesisTextChirho,
	type ReceiptChirho
} from '../../../scripts-chirho/audio-chirho/audition_chirho';
import {
	productionWordRecipeChirho,
	HEBREW_WORD_RECIPE_CHIRHO
} from '../../../src/lib/domain-chirho/pronunciation-chirho/production-recipe-chirho';
import type { LibraryWordChirho } from '../../../scripts-chirho/audio-chirho/production-chirho/prepare_words_chirho';
import {
	INFLECTION_HOME_CHIRHO,
	INFLECTION_KEY_CHIRHO
} from '../../../scripts-chirho/audio-chirho/production-chirho/inflections-chirho/funding_chirho';
import {
	MAQQEF_HOME_CHIRHO,
	MAQQEF_PLAN_HOME_CHIRHO,
	MAQQEF_ID_CHIRHO,
	MAQQEF_PRIOR_CHIRHO,
	maqqefAccountChirho,
	maqqefFundingChirho,
	validateMaqqefAccountChirho,
	validateMaqqefAuthorityChirho,
	type MaqqefAuthorityChirho,
	type MaqqefSubscriptionChirho
} from '../../../scripts-chirho/audio-chirho/production-chirho/maqqef-chirho/funding_chirho';
import {
	runMaqqefChirho,
	validateMaqqefPlansChirho,
	validateMaqqefReceiptsChirho,
	type MaqqefPlanChirho,
	type MaqqefServicesChirho
} from '../../../scripts-chirho/audio-chirho/production-chirho/maqqef-chirho/run_chirho';

const rootsChirho: string[] = [];
afterEach(async () => {
	vi.restoreAllMocks();
	await Promise.all(
		rootsChirho
			.splice(0)
			.map((rootChirho) => rmChirho(rootChirho, { recursive: true, force: true }))
	);
});
const userChirho = { user_id: 'fixture-account-chirho' };
const accountChirho: MaqqefSubscriptionChirho = {
	status: 'active',
	tier: 'creator',
	character_count: 18982,
	character_limit: 131000,
	can_extend_character_limit: false,
	next_character_count_reset_unix: 1796586535
};
const bytesChirho = Buffer.alloc(2000, 1);
const encodeChirho = (indexChirho: number) =>
	[Math.floor(indexChirho / 676), Math.floor(indexChirho / 26) % 26, indexChirho % 26]
		.map((partChirho) => String.fromCharCode(97 + partChirho))
		.join('');
const wordsChirho: LibraryWordChirho[] = Array.from({ length: 1081 }, (_, indexChirho) => {
	const ipaChirho = 'ka' + encodeChirho(indexChirho),
		jobChirho = {
			id_chirho: 'maqqef-' + indexChirho + '-chirho',
			lesson_id_chirho: 'Gen.1.1',
			token_id_chirho: 'word-' + indexChirho + '-chirho',
			language_chirho: 'he' as const,
			text_chirho: 'אֶת',
			canonical_sha256_chirho: 'a'.repeat(64),
			recipe_id_chirho: HEBREW_WORD_RECIPE_CHIRHO,
			...productionWordRecipeChirho('אֶת', HEBREW_WORD_RECIPE_CHIRHO, ipaChirho)!
		};
	return {
		key_chirho: cacheKeyChirho(jobChirho),
		job_chirho: jobChirho,
		occurrences_chirho: [
			{
				lesson_id_chirho: jobChirho.lesson_id_chirho,
				token_id_chirho: jobChirho.token_id_chirho,
				text_chirho: jobChirho.text_chirho,
				canonical_sha256_chirho: jobChirho.canonical_sha256_chirho,
				content_path_chirho: '/content-chirho/genesis-chirho/chapter-01-chirho.json',
				content_sha256_chirho: 'b'.repeat(64),
				maqqef_group_chirho: 'אֶת־הַשָּׁמַיִם'
			}
		],
		analysis_note_chirho:
			'Synthetic boundary fixture; source verification is independently injected.',
		source_context_chirho: 'maqqef_chirho'
	};
});
function receiptChirho(
	wordChirho: LibraryWordChirho,
	reusedChirho = false,
	unknownChirho = false
): ReceiptChirho {
	return {
		id_chirho: wordChirho.job_chirho.id_chirho,
		key_chirho: wordChirho.key_chirho,
		reserved_credits_chirho: reusedChirho
			? 0
			: [...synthesisTextChirho(wordChirho.job_chirho)].length,
		state_chirho: unknownChirho ? 'requested' : 'received',
		voice_id_chirho: 'l7Q9rbdCC6j3J5dNlOOg',
		voice_name_chirho: 'Itamar - Israeli Hebrew Narrator',
		...(unknownChirho
			? {}
			: {
					path_chirho:
						wordChirho.job_chirho.id_chirho +
						'-' +
						wordChirho.key_chirho.slice(0, 12) +
						'-chirho.mp3',
					sha256_chirho: sha256Chirho(bytesChirho),
					bytes_chirho: bytesChirho.length
				}),
		...(reusedChirho
			? { reused_chirho: true }
			: { funding_id_chirho: MAQQEF_ID_CHIRHO, funding_key_name_chirho: INFLECTION_KEY_CHIRHO })
	};
}
const plansChirho: MaqqefPlanChirho[] = Array.from({ length: 12 }, (_, indexChirho) => ({
	words_chirho: wordsChirho.slice(indexChirho * 96, (indexChirho + 1) * 96),
	reused_receipts_chirho:
		indexChirho === 0
			? wordsChirho.slice(0, 2).map((wordChirho) => receiptChirho(wordChirho, true))
			: []
}));
const totalUnitsChirho = wordsChirho
	.slice(2)
	.reduce(
		(sumChirho, wordChirho) => sumChirho + [...synthesisTextChirho(wordChirho.job_chirho)].length,
		0
	);
const authorityChirho: MaqqefAuthorityChirho = {
	schema_version_chirho: 1,
	id_chirho: MAQQEF_ID_CHIRHO,
	authorized_chirho: true,
	authority_chirho: 'Test of the independently bounded maqqef continuation.',
	key_name_chirho: INFLECTION_KEY_CHIRHO,
	included_only_chirho: true,
	total_forms_chirho: 1081,
	maximum_requests_chirho: 1079,
	maximum_raw_credits_chirho: totalUnitsChirho,
	prior_accounted_credits_chirho: MAQQEF_PRIOR_CHIRHO,
	maximum_total_credits_chirho: MAQQEF_PRIOR_CHIRHO + totalUnitsChirho,
	new_keys_chirho: wordsChirho.slice(2).map((wordChirho) => wordChirho.key_chirho),
	account_id_sha256_chirho: sha256Chirho(userChirho.user_id),
	baseline_usage_chirho: 18982,
	character_limit_chirho: 131000,
	reset_unix_chirho: 1796586535,
	candidates_sha256_chirho: 'c'.repeat(64),
	index_sha256_chirho: 'd'.repeat(64),
	prior_ledger_sha256_chirho: 'e'.repeat(64),
	previous_authority_sha256_chirho: 'f'.repeat(64)
};
async function writeChirho(rootChirho: string, pathChirho: string, valueChirho: unknown) {
	const dataChirho =
		typeof valueChirho === 'string' || Buffer.isBuffer(valueChirho)
			? valueChirho
			: JSON.stringify(valueChirho);
	await mkdirChirho(dirnameChirho(joinChirho(rootChirho, pathChirho)), { recursive: true });
	await writeFileChirho(joinChirho(rootChirho, pathChirho), dataChirho);
	return sha256Chirho(dataChirho);
}
async function fixtureChirho() {
	const rootChirho = await mkdtempChirho(joinChirho(tmpdirChirho(), 'maqqef-run-chirho-'));
	rootsChirho.push(rootChirho);
	const frozenChirho = { ...authorityChirho };
	frozenChirho.previous_authority_sha256_chirho = await writeChirho(
		rootChirho,
		INFLECTION_HOME_CHIRHO + '/authority-chirho.json',
		{ test_chirho: 'old authority unchanged' }
	);
	const oldPathChirho =
			'workspace-chirho/audio-chirho/production-bible-2026-11-02-chirho/old-receipts-chirho.json',
		oldShaChirho = await writeChirho(rootChirho, oldPathChirho, []);
	frozenChirho.prior_ledger_sha256_chirho = await writeChirho(
		rootChirho,
		MAQQEF_HOME_CHIRHO + '/prior-ledger-chirho.json',
		{
			accounted_credits_chirho: MAQQEF_PRIOR_CHIRHO,
			files_chirho: [{ path_chirho: oldPathChirho, sha256_chirho: oldShaChirho }]
		}
	);
	frozenChirho.candidates_sha256_chirho = await writeChirho(
		rootChirho,
		MAQQEF_HOME_CHIRHO + '/candidates-chirho.json',
		{ words_chirho: wordsChirho }
	);
	const entriesChirho = [];
	for (const [indexChirho, planChirho] of plansChirho.entries()) {
		const pathChirho =
				'batches-chirho/' + String(indexChirho).padStart(4, '0') + '-chirho/plan-chirho.json',
			folderChirho = dirnameChirho(MAQQEF_PLAN_HOME_CHIRHO + '/' + pathChirho);
		entriesChirho.push({
			path_chirho: pathChirho,
			sha256_chirho: await writeChirho(
				rootChirho,
				MAQQEF_PLAN_HOME_CHIRHO + '/' + pathChirho,
				planChirho
			)
		});
		if (planChirho.reused_receipts_chirho.length) {
			await writeChirho(
				rootChirho,
				folderChirho + '/receipts-chirho.json',
				planChirho.reused_receipts_chirho
			);
			for (const rowChirho of planChirho.reused_receipts_chirho)
				await writeChirho(rootChirho, folderChirho + '/' + rowChirho.path_chirho, bytesChirho);
		}
	}
	frozenChirho.index_sha256_chirho = await writeChirho(
		rootChirho,
		MAQQEF_PLAN_HOME_CHIRHO + '/index-chirho.json',
		{ schema_version_chirho: 1, batches_chirho: entriesChirho }
	);
	await writeChirho(rootChirho, MAQQEF_HOME_CHIRHO + '/authority-chirho.json', frozenChirho);
	return {
		root_chirho: rootChirho,
		authority_chirho: frozenChirho,
		old_path_chirho: oldPathChirho
	};
}
function servicesChirho() {
	let activeSpeechChirho = 0,
		peakSpeechChirho = 0,
		activeInstallChirho = 0,
		peakInstallChirho = 0;
	const callsChirho = { execute_chirho: 0, install_chirho: 0, account_chirho: 0, source_chirho: 0 };
	const servicesChirho: MaqqefServicesChirho = {
		verify_source_chirho: async () => {
			callsChirho.source_chirho++;
		},
		account_chirho: async () => {
			callsChirho.account_chirho++;
			return accountChirho;
		},
		storage_chirho: async () => 10 * 1024 ** 3,
		target_chirho: () => ({
			account_chirho: '0'.repeat(28) + '84bd',
			bucket_chirho: 'hinneh-media-chirho',
			email_chirho: 'fixture@example.invalid',
			api_key_chirho: 'fixture-only'
		}),
		extend_chirho: async () => {},
		install_chirho: async () => {
			callsChirho.install_chirho++;
			activeInstallChirho++;
			peakInstallChirho = Math.max(peakInstallChirho, activeInstallChirho);
			await new Promise((resolveChirho) => setTimeout(resolveChirho, 1));
			activeInstallChirho--;
			return undefined;
		},
		execute_chirho: async (rootChirho, applyChirho, planChirho) => {
			expect(applyChirho).toBe(true);
			callsChirho.execute_chirho++;
			activeSpeechChirho++;
			peakSpeechChirho = Math.max(peakSpeechChirho, activeSpeechChirho);
			await planChirho.verify_source_chirho();
			await new Promise((resolveChirho) => setTimeout(resolveChirho, 3));
			const relativeFolderChirho = planChirho.folder_chirho.slice(rootChirho.length + 1);
			let rowsChirho: ReceiptChirho[] = [];
			try {
				rowsChirho = JSON.parse(
					await readFileChirho(joinChirho(planChirho.folder_chirho, 'receipts-chirho.json'), 'utf8')
				);
			} catch (errorChirho) {
				if ((errorChirho as NodeJS.ErrnoException).code !== 'ENOENT') throw errorChirho;
			}
			const pendingChirho = planChirho.rows_chirho
				.filter(
					(jobChirho) =>
						!rowsChirho.some((rowChirho) => rowChirho.id_chirho === jobChirho.id_chirho) &&
						planChirho.eligible_chirho?.(jobChirho)
				)
				.slice(0, planChirho.limit_chirho);
			for (const jobChirho of pendingChirho) {
				const rowChirho = receiptChirho(
					wordsChirho.find((wordChirho) => wordChirho.key_chirho === cacheKeyChirho(jobChirho))!
				);
				rowsChirho.push(rowChirho);
				await writeChirho(
					rootChirho,
					relativeFolderChirho + '/' + rowChirho.path_chirho,
					bytesChirho
				);
			}
			await writeChirho(rootChirho, relativeFolderChirho + '/receipts-chirho.json', rowsChirho);
			activeSpeechChirho--;
			return {};
		}
	};
	return {
		services_chirho: servicesChirho,
		calls_chirho: callsChirho,
		peaks_chirho: () => ({ speech_chirho: peakSpeechChirho, install_chirho: peakInstallChirho })
	};
}
describe('separately bounded source-context Hebrew continuation', () => {
	it('reserves every other batch and old allowance while admitting exact zero-cost reuse', () => {
		expect(
			validateMaqqefPlansChirho(authorityChirho, { words_chirho: wordsChirho }, plansChirho)
		).toBe(totalUnitsChirho);
		for (const planChirho of plansChirho) {
			const batchUnitsChirho = planChirho.words_chirho
					.filter((wordChirho) => authorityChirho.new_keys_chirho.includes(wordChirho.key_chirho))
					.reduce(
						(sumChirho, wordChirho) =>
							sumChirho + [...synthesisTextChirho(wordChirho.job_chirho)].length,
						0
					),
				fundingChirho = maqqefFundingChirho(authorityChirho, batchUnitsChirho);
			expect(
				reserveChirho(
					planChirho.words_chirho.map((wordChirho) => wordChirho.job_chirho),
					planChirho.reused_receipts_chirho,
					MAQQEF_PRIOR_CHIRHO + totalUnitsChirho - batchUnitsChirho,
					'production',
					{ funding_chirho: fundingChirho }
				)
			).toBe(batchUnitsChirho);
			expect(() =>
				reserveChirho(
					planChirho.words_chirho.map((wordChirho) => wordChirho.job_chirho),
					planChirho.reused_receipts_chirho,
					MAQQEF_PRIOR_CHIRHO + totalUnitsChirho - batchUnitsChirho + 1,
					'production',
					{ funding_chirho: fundingChirho }
				)
			).toThrow(/budget/);
		}
		expect(() => maqqefFundingChirho(authorityChirho, totalUnitsChirho + 1)).toThrow(/reservation/);
	});
	it('refuses enlarged authority, foreign/duplicate keys, changed recipe and spent reuse', () => {
		for (const changedChirho of [
			{ ...authorityChirho, maximum_requests_chirho: 1082 },
			{ ...authorityChirho, maximum_raw_credits_chirho: 11199 },
			{ ...authorityChirho, prior_accounted_credits_chirho: 443484 },
			{ ...authorityChirho, key_name_chirho: 'ELEVENLABS_API_KEY_CHIRHO' },
			{
				...authorityChirho,
				new_keys_chirho: authorityChirho.new_keys_chirho.map(
					() => authorityChirho.new_keys_chirho[0]
				)
			}
		])
			expect(() => validateMaqqefAuthorityChirho(changedChirho)).toThrow();
		const changedPlansChirho = structuredClone(plansChirho);
		changedPlansChirho[0].reused_receipts_chirho[0].reserved_credits_chirho = 1;
		expect(() =>
			validateMaqqefPlansChirho(authorityChirho, { words_chirho: wordsChirho }, changedPlansChirho)
		).toThrow(/zero-cost/);
		changedPlansChirho[0] = structuredClone(plansChirho[0]);
		changedPlansChirho[0].words_chirho[2].job_chirho.synthesis_text_chirho = 'raw text';
		expect(() =>
			validateMaqqefPlansChirho(authorityChirho, { words_chirho: wordsChirho }, changedPlansChirho)
		).toThrow(/recipe/);
	});
	it('refuses account, reset, overage and spent-envelope changes', () => {
		expect(() =>
			validateMaqqefAccountChirho(authorityChirho, userChirho, accountChirho)
		).not.toThrow();
		for (const changedChirho of [
			{ ...accountChirho, can_extend_character_limit: true },
			{ ...accountChirho, next_character_count_reset_unix: 1796586536 },
			{ ...accountChirho, character_count: 18981 },
			{ ...accountChirho, character_count: 18982 + totalUnitsChirho + 1 }
		])
			expect(() => validateMaqqefAccountChirho(authorityChirho, userChirho, changedChirho)).toThrow(
				/account/
			);
		expect(() =>
			validateMaqqefAccountChirho(authorityChirho, { user_id: 'foreign-account' }, accountChirho)
		).toThrow(/account/);
	});
	it('uses only the dedicated key for metadata and never falls back', async () => {
		const requestsChirho: string[] = [],
			fetchChirho = vi.fn(
				async (inputChirho: Parameters<typeof fetch>[0], initChirho?: RequestInit) => {
					requestsChirho.push(new Headers(initChirho?.headers).get('xi-api-key') ?? '');
					return Response.json(
						String(inputChirho).endsWith('/subscription') ? accountChirho : userChirho
					);
				}
			) as unknown as typeof fetch;
		await expect(
			maqqefAccountChirho(authorityChirho, { ELEVENLABS_API_KEY_CHIRHO: 'primary' }, fetchChirho)
		).rejects.toThrow(/credential/);
		expect(requestsChirho).toEqual([]);
		await maqqefAccountChirho(
			authorityChirho,
			{ [INFLECTION_KEY_CHIRHO]: 'dedicated', ELEVENLABS_API_KEY_CHIRHO: 'primary' },
			fetchChirho
		);
		expect(requestsChirho).toEqual(['dedicated', 'dedicated']);
	});
	it('dry run performs no metadata, synthesis or installation', async () => {
		const fixtureRootChirho = await fixtureChirho(),
			stubChirho = servicesChirho();
		const resultChirho = await runMaqqefChirho(
			fixtureRootChirho.root_chirho,
			false,
			false,
			stubChirho.services_chirho
		);
		expect(resultChirho).toMatchObject({
			apply_chirho: false,
			pending_requests_chirho: 1079,
			received_chirho: 2
		});
		expect(stubChirho.calls_chirho).toMatchObject({
			execute_chirho: 0,
			install_chirho: 0,
			account_chirho: 0
		});
	});
	it('runs disjoint speech batches at at most two with one installer, and a rerun does not synthesize', async () => {
		const fixtureRootChirho = await fixtureChirho(),
			stubChirho = servicesChirho();
		expect(
			await runMaqqefChirho(fixtureRootChirho.root_chirho, true, false, stubChirho.services_chirho)
		).toMatchObject({ received_chirho: 1081, requested_chirho: 1079, complete_chirho: true });
		expect(stubChirho.peaks_chirho()).toEqual({ speech_chirho: 2, install_chirho: 1 });
		const previousChirho = stubChirho.calls_chirho.execute_chirho;
		await runMaqqefChirho(fixtureRootChirho.root_chirho, true, false, stubChirho.services_chirho);
		expect(stubChirho.calls_chirho.execute_chirho).toBe(previousChirho);
	});
	it('holds an existing unknown without metadata, POST, installation or removing its reservation', async () => {
		const fixtureRootChirho = await fixtureChirho(),
			stubChirho = servicesChirho(),
			pathChirho = MAQQEF_PLAN_HOME_CHIRHO + '/batches-chirho/0000-chirho/receipts-chirho.json',
			rowsChirho = [
				...plansChirho[0].reused_receipts_chirho,
				receiptChirho(wordsChirho[2], false, true)
			];
		await writeChirho(fixtureRootChirho.root_chirho, pathChirho, rowsChirho);
		expect(() => validateMaqqefReceiptsChirho(authorityChirho, plansChirho[0], rowsChirho)).toThrow(
			/unknown/
		);
		await expect(
			runMaqqefChirho(fixtureRootChirho.root_chirho, true, false, stubChirho.services_chirho)
		).rejects.toThrow(/unknown/);
		expect(stubChirho.calls_chirho).toMatchObject({
			execute_chirho: 0,
			install_chirho: 0,
			account_chirho: 0
		});
		expect(
			JSON.parse(
				await readFileChirho(joinChirho(fixtureRootChirho.root_chirho, pathChirho), 'utf8')
			)
		).toEqual(rowsChirho);
	});
	it('refuses a changed old receipt or plan before provider contact', async () => {
		for (const changedChirho of ['prior', 'plan']) {
			const fixtureRootChirho = await fixtureChirho(),
				stubChirho = servicesChirho();
			await writeChirho(
				fixtureRootChirho.root_chirho,
				changedChirho === 'prior'
					? fixtureRootChirho.old_path_chirho
					: MAQQEF_PLAN_HOME_CHIRHO + '/batches-chirho/0000-chirho/plan-chirho.json',
				{}
			);
			await expect(
				runMaqqefChirho(fixtureRootChirho.root_chirho, true, false, stubChirho.services_chirho)
			).rejects.toThrow(/changed/);
			expect(stubChirho.calls_chirho).toMatchObject({
				execute_chirho: 0,
				install_chirho: 0,
				account_chirho: 0
			});
		}
	});
	it('pilot requests exactly one and received-only repair keeps source validation', async () => {
		const fixtureRootChirho = await fixtureChirho(),
			stubChirho = servicesChirho();
		expect(
			await runMaqqefChirho(fixtureRootChirho.root_chirho, true, true, stubChirho.services_chirho)
		).toMatchObject({ received_chirho: 3, requested_chirho: 1, complete_chirho: false });
		expect(stubChirho.calls_chirho.execute_chirho).toBe(1);
		expect(stubChirho.calls_chirho.source_chirho).toBeGreaterThan(12);
	});
	it('detects an authority edit between batch dispatch and its POST verification', async () => {
		const fixtureRootChirho = await fixtureChirho(),
			stubChirho = servicesChirho();
		let postsChirho = 0;
		stubChirho.services_chirho.execute_chirho = async (rootChirho, _applyChirho, planChirho) => {
			await writeChirho(rootChirho, MAQQEF_HOME_CHIRHO + '/authority-chirho.json', {
				...fixtureRootChirho.authority_chirho,
				authority_chirho: 'Changed during the run'
			});
			await planChirho.verify_source_chirho();
			postsChirho++;
			return {};
		};
		await expect(
			runMaqqefChirho(fixtureRootChirho.root_chirho, true, true, stubChirho.services_chirho)
		).rejects.toThrow(/snapshot changed/);
		expect(postsChirho).toBe(0);
	});
	it('retains a newly unknown request and refuses a later run without another dispatch', async () => {
		const fixtureRootChirho = await fixtureChirho(),
			stubChirho = servicesChirho();
		let dispatchesChirho = 0;
		stubChirho.services_chirho.execute_chirho = async (rootChirho, _applyChirho, planChirho) => {
			dispatchesChirho++;
			await planChirho.verify_source_chirho();
			const relativeFolderChirho = planChirho.folder_chirho.slice(rootChirho.length + 1),
				rowsChirho = [
					...plansChirho[0].reused_receipts_chirho,
					receiptChirho(wordsChirho[2], false, true)
				];
			await writeChirho(rootChirho, relativeFolderChirho + '/receipts-chirho.json', rowsChirho);
			throw Error('Lost response after journal reservation');
		};
		await expect(
			runMaqqefChirho(fixtureRootChirho.root_chirho, true, true, stubChirho.services_chirho)
		).rejects.toThrow(/Lost response/);
		await expect(
			runMaqqefChirho(fixtureRootChirho.root_chirho, true, true, stubChirho.services_chirho)
		).rejects.toThrow(/unknown/);
		expect(dispatchesChirho).toBe(1);
	});
});
