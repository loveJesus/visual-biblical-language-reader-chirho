// For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life. — John 3:16 (KJV)
// Workflow: README-chirho.md. Fixed 24-take phase; same verified archive/catalogue transaction.
import { realpath as realpathChirho } from 'node:fs/promises';
import { phaseInputChirho } from './phase_chirho';
import { installLocalGreekChirho } from './install_chirho';

if (import.meta.main) {
	const argumentsChirho = process.argv.slice(2);
	if (
		argumentsChirho.some((valueChirho) => valueChirho !== '--apply-chirho') ||
		argumentsChirho.length > 1
	)
		throw Error('Expected only optional --apply-chirho');
	const rootChirho = await realpathChirho('.');
	await installLocalGreekChirho(
		await phaseInputChirho(rootChirho),
		argumentsChirho.includes('--apply-chirho'),
		rootChirho
	);
}
