// For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life. — John 3:16 (KJV)
import { afterEach, describe, expect, it, vi } from 'vitest';
import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import {
	chmod,
	lstat,
	mkdir,
	mkdtemp,
	readFile,
	readdir,
	rm,
	symlink,
	writeFile
} from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import {
	GITHUB_FILE_LIMIT_CHIRHO,
	classifyPublicPathChirho,
	createPublicCutChirho,
	cutPathsChirho,
	isSafeBindingsTextChirho,
	planPublicSourceChirho,
	publicManifestChirho,
	type PathFactsChirho
} from '../../../scripts-chirho/site-chirho/prepare_public_source_chirho';

const fileChirho: PathFactsChirho = { kind_chirho: 'file', bytes_chirho: 10 };
const reasonChirho = (pathChirho: string, factsChirho: PathFactsChirho = fileChirho) => {
	const resultChirho = classifyPublicPathChirho(pathChirho, factsChirho);
	return resultChirho.include_chirho ? 'include' : resultChirho.reason_chirho;
};
const rootsChirho: string[] = [];
afterEach(async () => {
	vi.unstubAllEnvs();
	await Promise.all(
		rootsChirho.splice(0).map((rootChirho) => rm(rootChirho, { recursive: true, force: true }))
	);
});
async function temporaryChirho() {
	const rootChirho = await mkdtemp(join(tmpdir(), 'hinneh-public-source-chirho-'));
	rootsChirho.push(rootChirho);
	return rootChirho;
}
async function writeTreeChirho(rootChirho: string, filesChirho: Record<string, string>) {
	for (const [pathChirho, textChirho] of Object.entries(filesChirho)) {
		await mkdir(dirname(join(rootChirho, pathChirho)), { recursive: true });
		await writeFile(join(rootChirho, pathChirho), textChirho);
	}
}
const BINDINGS_CHIRHO = '# Intentionally empty.\n\n# Non-secret local bindings only.\n';
/** A small Git project: some files staged, others untracked, one ignored output tree. */
async function projectChirho(extraChirho: Record<string, string> = {}) {
	const rootChirho = await temporaryChirho();
	// Hermetic Git: no user, system or XDG ignore rules may change the listing.
	vi.stubEnv('GIT_CONFIG_GLOBAL', '/dev/null');
	vi.stubEnv('GIT_CONFIG_NOSYSTEM', '1');
	vi.stubEnv('XDG_CONFIG_HOME', join(rootChirho, 'absent-config-chirho'));
	await writeTreeChirho(rootChirho, {
		'.gitignore': 'build-chirho/\n',
		'package.json': '{"name":"x"}\n',
		'bun.lock': 'lock\n',
		LICENSE: 'GPL\n',
		'worker-configuration.d.ts': 'interface Env {}\n',
		'wrangler.jsonc': '{}\n',
		'wrangler-bindings-chirho.env': BINDINGS_CHIRHO,
		'AGENTS.md': 'private operations\n',
		'src/app-chirho.ts': 'export const a = 1;\n',
		'scripts-chirho/run-chirho.sh': '#!/bin/sh\necho ok\n',
		'static/content-chirho/genesis-chirho.json': '{"verses":[]}\n',
		'static/assets-chirho/scene-chirho.webp': 'RIFF',
		'spec-chirho/workflows-chirho/flow-chirho.md': '# Flow\n',
		'spec-chirho/tasklists-chirho/private-chirho.md': '- [ ] private\n',
		'workspace-chirho/private-chirho/interview-chirho.txt': 'private\n',
		'data-chirho/bible-chirho/sources-chirho/gbt-data-chirho/hbo+grc/01-Gen.json': '[]\n',
		'data-chirho/bible-chirho/sources-chirho/gbt-data-chirho/eng/01-Gen.json': '[]\n',
		'apps-chirho/android-chirho/.gradle/cache-chirho.bin': 'cache',
		'src/lib/.env.local': 'SECRET=1\n',
		'build-chirho/old-output-chirho.txt': 'ignored\n',
		...extraChirho
	});
	await chmod(join(rootChirho, 'scripts-chirho/run-chirho.sh'), 0o755);
	await symlink('AGENTS.md', join(rootChirho, 'CLAUDE.md'));
	execFileSync('git', ['init', '-q'], { cwd: rootChirho });
	execFileSync('git', ['add', 'package.json', 'src/app-chirho.ts', 'AGENTS.md'], {
		cwd: rootChirho
	});
	return rootChirho;
}

describe('public source path boundary', () => {
	it('includes only explicit source roots and the root configuration allowlist', () => {
		for (const pathChirho of [
			'src/lib/a-chirho.ts',
			'static/content-chirho/genesis-chirho/chapter-01-chirho.json',
			'data-chirho/bible-chirho/sources-chirho/gbt-data-chirho/eng/01-Gen.json',
			'apps-chirho/android-chirho/gradle/wrapper/gradle-wrapper.jar',
			'spec-chirho/workflows-chirho/whole-bible-chirho.md',
			'package.json',
			'wrangler-bindings-chirho.env',
			'worker-configuration.d.ts'
		])
			expect(reasonChirho(pathChirho), pathChirho).toBe('include');
		expect(reasonChirho('workspace-chirho/audio-chirho/a.json')).toBe('workspace');
		expect(reasonChirho('spec-chirho/tasklists-chirho/t.md')).toBe('private_spec');
		expect(reasonChirho('spec-chirho/progress-chirho.sqlite')).toBe('private_spec');
		for (const pathChirho of ['AGENTS.md', 'CLAUDE.md', '.vscode/settings.json', 'notes.txt'])
			expect(reasonChirho(pathChirho), pathChirho).toBe('outside_allowlist');
	});

	it('excludes environment files, builds, caches, media, databases and redistribution boundaries', () => {
		for (const pathChirho of [
			'.env',
			'.dev.vars',
			'src/lib/.env.local',
			'apps-chirho/android-chirho/.dev.vars.staging',
			'config-chirho/production.env',
			'apps-chirho/wrangler-bindings-chirho.env'
		])
			expect(reasonChirho(pathChirho), pathChirho).toBe('environment');
		for (const pathChirho of [
			'apps-chirho/android-chirho/.gradle/cache-chirho.bin',
			'apps-chirho/ios-chirho/DerivedData/x.o',
			'src/build/out.js',
			'static/node_modules/x.js',
			'tests-chirho/__pycache__/a.pyc',
			'data-chirho/workspace-chirho/a.json'
		])
			expect(reasonChirho(pathChirho), pathChirho).toBe('build_or_cache');
		expect(
			reasonChirho('data-chirho/corpus-chirho/sources-chirho/gbt-data-chirho/hbo+grc/43-John.json')
		).toBe('redistribution_boundary');
		for (const pathChirho of ['static/assets-chirho/scene.webp', 'static/audio-chirho/a.MP3'])
			expect(reasonChirho(pathChirho), pathChirho).toBe('generated_media');
		expect(reasonChirho('data-chirho/cache-chirho.db')).toBe('database');
		expect(
			reasonChirho('static/big-chirho.json', {
				kind_chirho: 'file',
				bytes_chirho: GITHUB_FILE_LIMIT_CHIRHO
			})
		).toBe('oversized');
		expect(
			reasonChirho('static/big-chirho.json', {
				kind_chirho: 'file',
				bytes_chirho: GITHUB_FILE_LIMIT_CHIRHO - 1
			})
		).toBe('include');
	});

	it('refuses unsafe names, symlinks, missing and irregular entries', () => {
		for (const pathChirho of [
			'',
			'../x',
			'/etc/hosts',
			'src//a.ts',
			'src/./a.ts',
			'src/../../x',
			'src\\a.ts'
		])
			expect(reasonChirho(pathChirho), pathChirho).toBe('unsafe_path');
		expect(reasonChirho('src/a.ts', { kind_chirho: 'symlink', bytes_chirho: 9 })).toBe('symlink');
		expect(reasonChirho('src/a.ts', { kind_chirho: 'missing', bytes_chirho: 0 })).toBe('missing');
		expect(reasonChirho('src/a.ts', { kind_chirho: 'other', bytes_chirho: 0 })).toBe('not_regular');
	});

	it('publishes a binding file only while it declares nothing', () => {
		expect(isSafeBindingsTextChirho(BINDINGS_CHIRHO)).toBe(true);
		expect(isSafeBindingsTextChirho('  # indented comment\r\n\r\n')).toBe(true);
		expect(isSafeBindingsTextChirho('# comment\nAPI_KEY=value\n')).toBe(false);
	});
});

describe('public source plan and cut', () => {
	it('plans from Git listings, keeping modes and refusing escapes through linked folders', async () => {
		const rootChirho = await projectChirho();
		const planChirho = await planPublicSourceChirho(rootChirho);
		expect(planChirho.files_chirho.map((rowChirho) => rowChirho.path_chirho)).toEqual([
			'.gitignore',
			'LICENSE',
			'bun.lock',
			'data-chirho/bible-chirho/sources-chirho/gbt-data-chirho/eng/01-Gen.json',
			'package.json',
			'scripts-chirho/run-chirho.sh',
			'spec-chirho/workflows-chirho/flow-chirho.md',
			'src/app-chirho.ts',
			'static/content-chirho/genesis-chirho.json',
			'worker-configuration.d.ts',
			'wrangler-bindings-chirho.env',
			'wrangler.jsonc'
		]);
		expect(
			planChirho.files_chirho.find((rowChirho) => rowChirho.path_chirho.endsWith('.sh'))
				?.mode_chirho
		).toBe('100755');
		expect(planChirho.excluded_chirho).toMatchObject({
			workspace: 1,
			private_spec: 1,
			symlink: 1,
			environment: 1,
			build_or_cache: 1,
			generated_media: 1,
			redistribution_boundary: 1
		});
		expect(JSON.stringify(planChirho)).not.toContain('old-output-chirho');
		expect(planChirho.blockers_chirho).toEqual([]);
		const outsideChirho = await temporaryChirho();
		await writeFile(join(outsideChirho, 'leak-chirho.ts'), 'secret\n');
		await symlink(outsideChirho, join(rootChirho, 'src/linked-chirho'));
		const linkedChirho = await planPublicSourceChirho(rootChirho, () => [
			'src/linked-chirho/leak-chirho.ts',
			'../escape-chirho.ts'
		]);
		expect(linkedChirho.files_chirho).toEqual([]);
		expect(linkedChirho.excluded_chirho).toMatchObject({ escapes_root: 1, unsafe_path: 1 });
	});

	it('blocks an unsafe binding file, npm credentials or a missing build file', async () => {
		const bindingRootChirho = await projectChirho({
			'wrangler-bindings-chirho.env': '# note\nTOKEN_CHIRHO=abc\n'
		});
		expect((await planPublicSourceChirho(bindingRootChirho)).blockers_chirho).toEqual([
			expect.stringMatching(/declares a binding/)
		]);
		const npmRootChirho = await projectChirho({
			'.npmrc': '//registry.npmjs.org/:_authToken=abc\n'
		});
		expect((await planPublicSourceChirho(npmRootChirho)).blockers_chirho).toEqual([
			expect.stringMatching(/npmrc/)
		]);
		const missingRootChirho = await projectChirho();
		await rm(join(missingRootChirho, 'bun.lock'));
		const missingChirho = await planPublicSourceChirho(missingRootChirho);
		expect(missingChirho.blockers_chirho).toEqual(['Required build file missing: bun.lock']);
		await expect(
			createPublicCutChirho(missingRootChirho, missingChirho, 'blocked-chirho')
		).rejects.toThrow(/blocked/);
		await expect(
			lstat(join(missingRootChirho, 'build-chirho/public-source-chirho'))
		).rejects.toThrow();
	});

	it('copies exact bytes into a new cut and writes a deterministic manifest beside it', async () => {
		const rootChirho = await projectChirho();
		const planChirho = await planPublicSourceChirho(rootChirho);
		const expectedChirho = await publicManifestChirho(rootChirho, planChirho, 'first-cut-chirho');
		expect(await publicManifestChirho(rootChirho, planChirho, 'first-cut-chirho')).toEqual(
			expectedChirho
		);
		const manifestChirho = await createPublicCutChirho(rootChirho, planChirho, 'first-cut-chirho');
		expect(manifestChirho).toEqual(expectedChirho);
		const pathsChirho = cutPathsChirho(rootChirho, 'first-cut-chirho');
		expect(pathsChirho.manifest_chirho.startsWith(pathsChirho.target_chirho + '/')).toBe(false);
		expect(JSON.parse(await readFile(pathsChirho.manifest_chirho, 'utf8'))).toEqual(expectedChirho);
		for (const entryChirho of manifestChirho.files_chirho) {
			const copiedChirho = join(pathsChirho.target_chirho, entryChirho.path_chirho);
			const bytesChirho = await readFile(copiedChirho);
			expect(bytesChirho.equals(await readFile(join(rootChirho, entryChirho.path_chirho)))).toBe(
				true
			);
			expect(createHash('sha256').update(bytesChirho).digest('hex')).toBe(
				entryChirho.sha256_chirho
			);
			expect(((await lstat(copiedChirho)).mode & 0o111) !== 0).toBe(
				entryChirho.mode_chirho === '100755'
			);
		}
		expect((await readdir(pathsChirho.target_chirho)).sort()).not.toContain('AGENTS.md');
	});

	it('never reuses, replaces or escapes an existing output', async () => {
		const rootChirho = await projectChirho();
		const planChirho = await planPublicSourceChirho(rootChirho);
		await createPublicCutChirho(rootChirho, planChirho, 'kept-cut-chirho');
		const pathsChirho = cutPathsChirho(rootChirho, 'kept-cut-chirho');
		const beforeChirho = await readFile(pathsChirho.manifest_chirho, 'utf8');
		await expect(createPublicCutChirho(rootChirho, planChirho, 'kept-cut-chirho')).rejects.toThrow(
			/occupied/
		);
		expect(await readFile(pathsChirho.manifest_chirho, 'utf8')).toBe(beforeChirho);
		for (const nameChirho of [
			'../escape-chirho',
			'Upper-chirho',
			'no-suffix',
			'a/b-chirho',
			'-chirho'
		])
			expect(() => cutPathsChirho(rootChirho, nameChirho), nameChirho).toThrow(/Cut name/);
		const linkedRootChirho = await projectChirho();
		const elsewhereChirho = await temporaryChirho();
		await rm(join(linkedRootChirho, 'build-chirho'), { recursive: true });
		await symlink(elsewhereChirho, join(linkedRootChirho, 'build-chirho'));
		await expect(
			createPublicCutChirho(
				linkedRootChirho,
				await planPublicSourceChirho(linkedRootChirho),
				'linked-cut-chirho'
			)
		).rejects.toThrow(/plain directory/);
		expect(await readdir(elsewhereChirho)).toEqual([]);
	});

	it('refuses a source that changed after planning', async () => {
		const rootChirho = await projectChirho();
		const planChirho = await planPublicSourceChirho(rootChirho);
		await writeFile(join(rootChirho, 'src/app-chirho.ts'), 'export const a = 22;\n');
		await expect(
			createPublicCutChirho(rootChirho, planChirho, 'changed-cut-chirho')
		).rejects.toThrow(/Planned source changed/);
	});
});
