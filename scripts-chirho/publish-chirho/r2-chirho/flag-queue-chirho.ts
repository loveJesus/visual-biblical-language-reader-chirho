// For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life. — John 3:16 (KJV)
// Workflow: media-delivery-chirho.md. Owner triage only: this command never generates or spends.
import { mkdir as mkdirChirho, writeFile as writeFileChirho } from 'node:fs/promises';
import { join as joinChirho } from 'node:path';
import { objectRequestChirho } from './object-store-chirho';
export async function readFlagQueueChirho(rootChirho: string) {
	const responseChirho = await objectRequestChirho(
		'GET',
		'',
		undefined,
		'list-type=2&max-keys=100&prefix=artifact-flags-chirho%2Fopen-chirho%2F'
	);
	if (!responseChirho.ok) throw new Error(`Flag queue listing refused (${responseChirho.status})`);
	const textChirho = await responseChirho.text();
	if (textChirho.length > 128000 || /<!DOCTYPE|<!ENTITY/.test(textChirho))
		throw new Error('Flag listing shape refused');
	const keysChirho = [
		...textChirho.matchAll(/<Key>(artifact-flags-chirho\/open-chirho\/[a-f0-9]{64}\.json)<\/Key>/g)
	].map((matchChirho) => matchChirho[1]);
	if (keysChirho.length > 100) throw new Error('Flag batch exceeds limit');
	const homeChirho = joinChirho(rootChirho, 'workspace-chirho/art-chirho/artifact-reports-chirho');
	await mkdirChirho(homeChirho, { recursive: true });
	for (const keyChirho of keysChirho) {
		const itemChirho = await objectRequestChirho('GET', keyChirho);
		if (!itemChirho.ok) throw new Error(`Flag read refused (${itemChirho.status})`);
		const bytesChirho = await itemChirho.text();
		if (bytesChirho.length > 4096) throw new Error('Flag record oversized');
		const recordChirho = JSON.parse(bytesChirho);
		if (
			keyChirho !== `artifact-flags-chirho/open-chirho/${recordChirho.image_sha256_chirho}.json` ||
			recordChirho.state_chirho !== 'awaiting_owner_review'
		)
			throw new Error('Flag identity differs');
		await writeFileChirho(
			joinChirho(homeChirho, recordChirho.image_sha256_chirho + '-chirho.json'),
			JSON.stringify(recordChirho, null, 2) + '\n',
			{ mode: 0o600 }
		);
	}
	return {
		reports_chirho: keysChirho.length,
		more_chirho: /<IsTruncated>true<\/IsTruncated>/.test(textChirho),
		action_chirho:
			'Inspect the exact image and source; preserve the old image until a checked high-quality replacement is installed. No automatic generation.'
	};
}
if (import.meta.main) console.log(JSON.stringify(await readFlagQueueChirho(process.cwd())));
