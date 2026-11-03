// For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life. — John 3:16 (KJV)

import { unlink as unlinkChirho } from 'node:fs/promises';
import { parseConfigFileTextToJson } from 'typescript';

const projectRootChirho = process.cwd();
const sourceConfigNameChirho = 'wrangler.jsonc';
const temporaryConfigNameChirho = '.wrangler-typegen-config-chirho.json';
const outputNameChirho = 'worker-configuration.d.ts';
const bindingsNameChirho = 'wrangler-bindings-chirho.env';
const argumentsChirho = process.argv.slice(2);

if (argumentsChirho.some((argumentChirho) => argumentChirho !== '--check')) {
	throw new Error(`Unsupported type-generation argument: ${argumentsChirho.join(' ')}`);
}

const sourceConfigPathChirho = `${projectRootChirho}/${sourceConfigNameChirho}`;
const temporaryConfigPathChirho = `${projectRootChirho}/${temporaryConfigNameChirho}`;
const sourceConfigTextChirho = await Bun.file(sourceConfigPathChirho).text();
const parsedConfigChirho = parseConfigFileTextToJson(
	sourceConfigPathChirho,
	sourceConfigTextChirho
);

if (parsedConfigChirho.error) {
	throw new Error(
		`Could not parse ${sourceConfigNameChirho}: ${parsedConfigChirho.error.messageText}`
	);
}

const typegenConfigChirho = { ...parsedConfigChirho.config };
delete typegenConfigChirho.main;

await Bun.write(temporaryConfigPathChirho, `${JSON.stringify(typegenConfigChirho, null, 2)}\n`);

try {
	const wranglerArgumentsChirho = [
		'bunx',
		'wrangler',
		'types',
		outputNameChirho,
		'--config',
		`./${temporaryConfigNameChirho}`,
		'--env-file',
		`./${bindingsNameChirho}`
	];

	if (argumentsChirho.includes('--check')) {
		wranglerArgumentsChirho.push('--check');
	}

	const wranglerProcessChirho = Bun.spawn(wranglerArgumentsChirho, {
		cwd: projectRootChirho,
		env: process.env,
		stdin: 'inherit',
		stdout: 'inherit',
		stderr: 'inherit'
	});
	const exitCodeChirho = await wranglerProcessChirho.exited;

	if (exitCodeChirho !== 0) {
		process.exitCode = exitCodeChirho;
	}
} finally {
	await unlinkChirho(temporaryConfigPathChirho).catch((errorChirho: unknown) => {
		if ((errorChirho as NodeJS.ErrnoException).code !== 'ENOENT') {
			throw errorChirho;
		}
	});
}
