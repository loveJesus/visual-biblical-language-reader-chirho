// For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life. — John 3:16 (KJV)
// Workflow: local-greek-chirho/README-chirho.md. Fixed screened openings; same archive/catalogue transaction.
import { realpath as realpathChirho } from 'node:fs/promises';
import {
	openingsInputChirho,
	readOpeningPartsChirho,
	preflightOpeningPartsChirho,
	recheckOpeningPartChirho
} from './openings_chirho';
import { installLocalGreekChirho } from './install_chirho';

if (import.meta.main) {
	const argumentsChirho = process.argv.slice(2);
	if (
		argumentsChirho.some((valueChirho) => valueChirho !== '--apply-chirho') ||
		argumentsChirho.length > 1
	)
		throw Error('Expected only optional --apply-chirho');
	const rootChirho = await realpathChirho('.');
	const inputChirho = await openingsInputChirho(rootChirho);
	const partsChirho = await readOpeningPartsChirho(rootChirho, inputChirho);
	const proofsChirho = await preflightOpeningPartsChirho(rootChirho, partsChirho);
	for (const [indexChirho, partChirho] of partsChirho.entries()) {
		await recheckOpeningPartChirho(rootChirho, partChirho, proofsChirho[indexChirho]);
		await installLocalGreekChirho(
			partChirho.input_chirho,
			argumentsChirho.includes('--apply-chirho'),
			rootChirho
		);
	}
}
