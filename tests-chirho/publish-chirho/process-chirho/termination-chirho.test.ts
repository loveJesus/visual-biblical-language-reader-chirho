// For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life. — John 3:16 (KJV)
import { expect, test } from 'vitest';
import {
	processTerminationChirho,
	runChirho
} from '../../../scripts-chirho/publish-chirho/release_cycle_chirho';

test('a real nonzero child exit keeps its exact exit status', () => {
	const resultChirho = runChirho(process.execPath, ['-e', 'process.exit(17)'], process.cwd());
	expect(resultChirho.status_chirho).toBe(17);
	expect(resultChirho.termination_chirho).toBe('exit 17');
});

test('a real terminated child exposes its signal instead of inventing exit one', () => {
	const resultChirho = runChirho(
		process.execPath,
		['-e', "process.kill(process.pid, 'SIGTERM')"],
		process.cwd()
	);
	expect(resultChirho.status_chirho).not.toBe(0);
	expect(resultChirho.termination_chirho).toBe('signal SIGTERM');
});

test('a missing executable preserves the safe spawn error code', () => {
	const resultChirho = runChirho('/nonexistent-hinneh-chirho/executable-chirho', [], process.cwd());
	expect(resultChirho.status_chirho).not.toBe(0);
	expect(resultChirho.termination_chirho).toBe('spawn error ENOENT');
});

test('timeout and signal facts survive together without error text or unrecognized codes', () => {
	const errorChirho = Object.assign(new Error('private-value-chirho'), { code: 'ETIMEDOUT' });
	expect(processTerminationChirho({ status: null, signal: 'SIGTERM', error: errorChirho })).toBe(
		'signal SIGTERM, spawn error ETIMEDOUT'
	);
	errorChirho.code = 'private-value-chirho';
	expect(processTerminationChirho({ status: null, signal: null, error: errorChirho })).toBe(
		'spawn error'
	);
});
