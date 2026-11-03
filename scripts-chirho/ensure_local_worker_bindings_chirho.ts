// For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life. — John 3:16 (KJV)

import { chmod as chmodChirho } from 'node:fs/promises';

const sourcePathChirho = 'wrangler-bindings-chirho.env';
const localPathChirho = '.dev.vars';
const localFileChirho = Bun.file(localPathChirho);

if (!(await localFileChirho.exists())) {
	const sourceTextChirho = await Bun.file(sourcePathChirho).text();
	await Bun.write(localPathChirho, sourceTextChirho);
	await chmodChirho(localPathChirho, 0o600);
	console.log(`Created ignored ${localPathChirho} from ${sourcePathChirho}.`);
}
