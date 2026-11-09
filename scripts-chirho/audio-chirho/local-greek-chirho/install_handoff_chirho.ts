// For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life. — John 3:16 (KJV)
// Workflow: README-chirho.md. One bounded recovery/import writer, fed explicit immutable finite input.
import { mkdir as mkdirChirho, realpath as realpathChirho } from 'node:fs/promises';
import {
	handoffInputChirho,
	handoffArgumentsChirho,
	preflightHandoffCatalogueChirho
} from './handoff_chirho';
import {
	readHandoffPartsChirho,
	preflightHandoffPartsChirho,
	recheckHandoffPartChirho,
	recoverHandoffPartsChirho
} from './handoff_parts_chirho';
import { installLocalGreekChirho } from './install_chirho';

export async function installHandoffChirho(argumentsChirho: string[]): Promise<void> {
	const parsedChirho = handoffArgumentsChirho(argumentsChirho);
	const rootChirho = await realpathChirho(parsedChirho.root_chirho);
	const inputChirho = await handoffInputChirho(rootChirho, parsedChirho.options_chirho, false);
	const partsChirho = await readHandoffPartsChirho(rootChirho, inputChirho);
	const proofsChirho = await preflightHandoffPartsChirho(rootChirho, partsChirho);
	if (parsedChirho.apply_chirho) {
		await mkdirChirho(`${rootChirho}/build-chirho/r2-chirho`, { recursive: true });
		await recoverHandoffPartsChirho(rootChirho, partsChirho, proofsChirho);
	}
	await preflightHandoffCatalogueChirho(rootChirho, inputChirho);
	for (const [indexChirho, partChirho] of partsChirho.entries()) {
		await recheckHandoffPartChirho(rootChirho, partChirho, proofsChirho[indexChirho]);
		await preflightHandoffCatalogueChirho(rootChirho, inputChirho);
		await installLocalGreekChirho(partChirho.input_chirho, parsedChirho.apply_chirho, rootChirho);
	}
}
if (import.meta.main) await installHandoffChirho(process.argv.slice(2));
