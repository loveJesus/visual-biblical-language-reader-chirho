// For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life. — John 3:16 (KJV)
import { describe as describeChirho, it as itChirho, expect as expectChirho } from 'vitest';
import { createWordStudyClientChirho, studyHashChirho } from './word-study-client-chirho';
async function fixtureChirho(keysChirho = ['G3056']) {
	const shardsChirho: Record<string, Uint8Array> = {};
	const bindingsChirho: Record<
		string,
		{ path_chirho: string; sha256_chirho: string; bytes_chirho: number }
	> = {};
	for (const keyChirho of keysChirho) {
		const partChirho = (
			parseInt((await studyHashChirho(new TextEncoder().encode(keyChirho))).slice(0, 2), 16) & 63
		)
			.toString(16)
			.padStart(2, '0');
		const rowChirho = {
			total_chirho: 5,
			covered_chirho: 4,
			empty_chirho: 1,
			glosses_chirho: [
				{
					gloss_chirho: 'word',
					count_chirho: 3,
					examples_chirho: [
						{ verse_chirho: 'John.1.1', reference_chirho: 'John 1:1', text_chirho: 'Λόγος' }
					]
				}
			]
		};
		const oldChirho = bindingsChirho[partChirho];
		const lemmasChirho = oldChirho
			? JSON.parse(new TextDecoder().decode(shardsChirho[oldChirho.path_chirho])).lemmas_chirho
			: {};
		lemmasChirho[keyChirho] = rowChirho;
		const bytesChirho = new TextEncoder().encode(
			JSON.stringify({
				schema_version_chirho: 1,
				edition_chirho: 'en-readers',
				lemmas_chirho: lemmasChirho
			})
		);
		const shaChirho = await studyHashChirho(bytesChirho);
		const pathChirho = `/study-chirho/shards-chirho/en-readers-chirho/${partChirho}-chirho/${shaChirho}-chirho.json`;
		shardsChirho[pathChirho] = bytesChirho;
		bindingsChirho[partChirho] = {
			path_chirho: pathChirho,
			sha256_chirho: shaChirho,
			bytes_chirho: bytesChirho.length
		};
	}
	return {
		shardsChirho,
		manifestChirho: {
			schema_version_chirho: 1,
			editions_chirho: {
				'en-readers': {
					language_chirho: 'en',
					mode_chirho: 'readers',
					shards_chirho: bindingsChirho
				}
			}
		}
	};
}
describeChirho('bounded static word study', () => {
	itChirho('deduplicates concurrent and repeated modal opens without any API call', async () => {
		const fixtureValueChirho = await fixtureChirho();
		const callsChirho: string[] = [];
		const clientChirho = createWordStudyClientChirho(async (inputChirho) => {
			const pathChirho = String(inputChirho);
			callsChirho.push(pathChirho);
			return pathChirho.endsWith('manifest-chirho.json')
				? Response.json(fixtureValueChirho.manifestChirho)
				: new Response(fixtureValueChirho.shardsChirho[pathChirho] as BodyInit);
		});
		const [oneChirho, twoChirho] = await Promise.all([
			clientChirho.wordChirho('en', 'readers', 'G3056'),
			clientChirho.wordChirho('en', 'readers', 'G3056')
		]);
		expectChirho(oneChirho).toBe(twoChirho);
		expectChirho(oneChirho?.covered_chirho).toBe(4);
		expectChirho(await clientChirho.wordChirho('en', 'readers', 'G3056')).toBe(oneChirho);
		expectChirho(callsChirho).toHaveLength(2);
		expectChirho(callsChirho.every((pathChirho) => pathChirho.startsWith('/study-chirho/'))).toBe(
			true
		);
	});
	itChirho(
		'withholds unavailable editions before any shard request and refuses invalid lemmas without requests',
		async () => {
			const fixtureValueChirho = await fixtureChirho();
			let callsChirho = 0;
			const clientChirho = createWordStudyClientChirho(async () => {
				callsChirho++;
				return Response.json(fixtureValueChirho.manifestChirho);
			});
			expectChirho(await clientChirho.wordChirho('es', 'readers', 'G3056')).toBeNull();
			expectChirho(await clientChirho.wordChirho('en', 'readers', '../../api')).toBeNull();
			expectChirho(callsChirho).toBe(1);
		}
	);
	itChirho('rejects changed bytes and dampens failures before allowing recovery', async () => {
		const fixtureValueChirho = await fixtureChirho();
		let timeChirho = 0;
		let callsChirho = 0;
		let goodChirho = false;
		const clientChirho = createWordStudyClientChirho(
			async (inputChirho) => {
				if (String(inputChirho).endsWith('manifest-chirho.json'))
					return Response.json(fixtureValueChirho.manifestChirho);
				callsChirho++;
				return new Response(
					goodChirho
						? (fixtureValueChirho.shardsChirho[String(inputChirho)] as BodyInit)
						: new TextDecoder()
								.decode(fixtureValueChirho.shardsChirho[String(inputChirho)])
								.replace('word', 'w0rd')
				);
			},
			() => timeChirho
		);
		await expectChirho(clientChirho.wordChirho('en', 'readers', 'G3056')).rejects.toThrow();
		await expectChirho(clientChirho.wordChirho('en', 'readers', 'G3056')).rejects.toThrow();
		expectChirho(callsChirho).toBe(1);
		timeChirho = 10_001;
		goodChirho = true;
		expectChirho((await clientChirho.wordChirho('en', 'readers', 'G3056'))?.total_chirho).toBe(5);
		expectChirho(callsChirho).toBe(2);
	});
	itChirho(
		'evicts settled shards at the bound and refreshes only the small index after five minutes',
		async () => {
			const keysChirho: string[] = [];
			const partsChirho = new Set<number>();
			for (let indexChirho = 1; keysChirho.length < 10; indexChirho++) {
				const keyChirho = 'G' + indexChirho;
				const partChirho =
					parseInt((await studyHashChirho(new TextEncoder().encode(keyChirho))).slice(0, 2), 16) &
					63;
				if (!partsChirho.has(partChirho)) {
					partsChirho.add(partChirho);
					keysChirho.push(keyChirho);
				}
			}
			const fixtureValueChirho = await fixtureChirho(keysChirho);
			let timeChirho = 0;
			let shardsChirho = 0;
			let manifestsChirho = 0;
			const clientChirho = createWordStudyClientChirho(
				async (inputChirho) => {
					if (String(inputChirho).endsWith('manifest-chirho.json')) {
						manifestsChirho++;
						return Response.json(fixtureValueChirho.manifestChirho);
					}
					shardsChirho++;
					return new Response(fixtureValueChirho.shardsChirho[String(inputChirho)] as BodyInit);
				},
				() => timeChirho
			);
			for (const keyChirho of keysChirho) await clientChirho.wordChirho('en', 'readers', keyChirho);
			await clientChirho.wordChirho('en', 'readers', keysChirho[0]);
			expectChirho(shardsChirho).toBe(11);
			expectChirho(manifestsChirho).toBe(1);
			timeChirho = 300_001;
			await clientChirho.wordChirho('en', 'readers', keysChirho[0]);
			expectChirho(shardsChirho).toBe(11);
			expectChirho(manifestsChirho).toBe(2);
		}
	);
	itChirho('refuses oversized or cross-origin bindings before fetching bodies', async () => {
		const fixtureValueChirho = await fixtureChirho();
		const bindingChirho = Object.values(
			fixtureValueChirho.manifestChirho.editions_chirho['en-readers'].shards_chirho
		)[0];
		bindingChirho.bytes_chirho = 2_000_001;
		let callsChirho = 0;
		const clientChirho = createWordStudyClientChirho(async () => {
			callsChirho++;
			return Response.json(fixtureValueChirho.manifestChirho);
		});
		await expectChirho(clientChirho.wordChirho('en', 'readers', 'G3056')).rejects.toThrow(
			'binding'
		);
		expectChirho(callsChirho).toBe(1);
		bindingChirho.bytes_chirho = 200;
		bindingChirho.path_chirho = 'https://other.test/chirho.json';
		await expectChirho(clientChirho.wordChirho('en', 'readers', 'G3056')).rejects.toThrow(
			'binding'
		);
		expectChirho(callsChirho).toBe(1);
	});
	itChirho(
		'bounds pending shard work instead of evicting and resending active requests',
		async () => {
			const keysChirho: string[] = [];
			const partsChirho = new Set<number>();
			for (let indexChirho = 1; keysChirho.length < 10; indexChirho++) {
				const keyChirho = 'G' + indexChirho;
				const partChirho =
					parseInt((await studyHashChirho(new TextEncoder().encode(keyChirho))).slice(0, 2), 16) &
					63;
				if (!partsChirho.has(partChirho)) {
					partsChirho.add(partChirho);
					keysChirho.push(keyChirho);
				}
			}
			const fixtureValueChirho = await fixtureChirho(keysChirho);
			const pendingChirho: (() => void)[] = [];
			const clientChirho = createWordStudyClientChirho(async (inputChirho) => {
				if (String(inputChirho).endsWith('manifest-chirho.json'))
					return Response.json(fixtureValueChirho.manifestChirho);
				await new Promise<void>((resolveChirho) => pendingChirho.push(resolveChirho));
				return new Response(fixtureValueChirho.shardsChirho[String(inputChirho)] as BodyInit);
			});
			const resultChirho = Promise.allSettled(
				keysChirho.map((keyChirho) => clientChirho.wordChirho('en', 'readers', keyChirho))
			);
			for (let indexChirho = 0; indexChirho < 50 && pendingChirho.length < 8; indexChirho++)
				await new Promise((resolveChirho) => setTimeout(resolveChirho, 2));
			expectChirho(pendingChirho).toHaveLength(8);
			for (const resolveChirho of pendingChirho) resolveChirho();
			const resultsChirho = await resultChirho;
			expectChirho(
				resultsChirho.filter((rowChirho) => rowChirho.status === 'fulfilled')
			).toHaveLength(8);
			expectChirho(
				resultsChirho.filter((rowChirho) => rowChirho.status === 'rejected')
			).toHaveLength(2);
		}
	);
});
