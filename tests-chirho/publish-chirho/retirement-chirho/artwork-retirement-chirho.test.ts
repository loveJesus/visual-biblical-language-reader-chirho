// For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life. — John 3:16 (KJV)
import { describe, expect, it } from 'vitest';
import { retirementOptionsChirho } from '../../../scripts-chirho/publish-chirho/r2-chirho/retire-artwork-chirho';

describe('explicit verified artwork retirement', () => {
	it('keeps no-argument inspection read-only and preserves an exact owned scope', () => {
		expect(retirementOptionsChirho([])).toEqual({
			applyChirho: false,
			retireChirho: false,
			scopesChirho: []
		});
		expect(
			retirementOptionsChirho([
				'--archive-chirho',
				'--retire-verified-chirho',
				'--scope-chirho=workspace-chirho/art-chirho/queue-chirho/owned-chirho'
			])
		).toEqual({
			applyChirho: true,
			retireChirho: true,
			scopesChirho: ['workspace-chirho/art-chirho/queue-chirho/owned-chirho']
		});
	});
	it('refuses retirement without archive authority instead of silently returning a dry result', () => {
		expect(() => retirementOptionsChirho(['--retire-verified-chirho'])).toThrow(/requires/u);
	});
	it('refuses misspelled, separated, empty, repeated and overlarge scopes before filesystem or network work', () => {
		for (const argumentsChirho of [
			['--archive-chirho', '--scope-chirho', 'owned-chirho'],
			['--apply-chirho'],
			['--scope-chirho='],
			['--scope-chirho=a-chirho', '--scope-chirho=a-chirho'],
			Array.from({ length: 17 }, (_, indexChirho) => '--scope-chirho=' + indexChirho + '-chirho')
		])
			expect(() => retirementOptionsChirho(argumentsChirho)).toThrow();
	});
});
