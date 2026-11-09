// For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life. — John 3:16 (KJV)
// Plans and copies a reviewed public source cut. The default is a dry plan; --apply-chirho only
// creates a new directory under build-chirho/public-source-chirho/ and never removes output.
import { execFileSync as execFileSyncChirho } from 'node:child_process';
import { createHash as createHashChirho } from 'node:crypto';
import {
	lstat as lstatChirho,
	mkdir as mkdirChirho,
	readFile as readFileChirho,
	realpath as realpathChirho,
	writeFile as writeFileChirho
} from 'node:fs/promises';
import { dirname as dirnameChirho, join as joinChirho, resolve as resolveChirho } from 'node:path';

/** Explicit source roots; anything else in the working tree stays private. */
export const SOURCE_ROOTS_CHIRHO = [
	'src/',
	'static/',
	'data-chirho/',
	'scripts-chirho/',
	'tests-chirho/',
	'apps-chirho/',
	'config-chirho/',
	'workers-chirho/',
	'LICENSES-chirho/',
	'spec-chirho/workflows-chirho/'
] as const;
/** Explicit root configuration allowlist, including the build-required binding and type files. */
export const ROOT_FILES_CHIRHO = [
	'.gitattributes',
	'.gitleaks.toml',
	'.gitignore',
	'.npmrc',
	'.prettierignore',
	'LICENSE',
	'README.md',
	'bun.lock',
	'eslint.config.js',
	'package.json',
	'playwright.config.ts',
	'prettier.config.js',
	'tsconfig.json',
	'vite.config.ts',
	'worker-configuration.d.ts',
	'wrangler-bindings-chirho.env',
	'wrangler.jsonc'
] as const;
const REQUIRED_FILES_CHIRHO = [
	'LICENSE',
	'bun.lock',
	'package.json',
	'worker-configuration.d.ts',
	'wrangler-bindings-chirho.env',
	'wrangler.jsonc'
];
const BINDINGS_FILE_CHIRHO = 'wrangler-bindings-chirho.env';
/** Directory names that only ever hold builds, caches, local evidence or private inputs. */
const EXCLUDED_SEGMENTS_CHIRHO = new Set([
	'.build',
	'.cache',
	'.cxx',
	'.externalNativeBuild',
	'.git',
	'.gradle',
	'.idea',
	'.kotlin',
	'.mypy_cache',
	'.output',
	'.playwright-mcp',
	'.pytest_cache',
	'.ruff_cache',
	'.svelte-kit',
	'.swiftpm',
	'.wrangler',
	'DerivedData',
	'__pycache__',
	'build',
	'build-chirho',
	'coverage',
	'dist',
	'evidence-chirho',
	'node_modules',
	'playwright-report',
	'private-chirho',
	'test-results',
	'workspace-chirho',
	'xcuserdata'
]);
/** Exact bundled UI resources needed by offline web/native builds; all Bible media stay excluded. */
export const ESSENTIAL_UI_RASTERS_CHIRHO = [
	{
		path_chirho: 'static/onboarding-chirho/welcome-hero-v1-chirho.webp',
		bytes_chirho: 334984,
		sha256_chirho: '31ba32a9278f99020ddf6ce3424d9867e293bd05bf599ee061b8ef97aab2eb2c'
	},
	{
		path_chirho:
			'apps-chirho/android-chirho/app-chirho/src/main/res/drawable-nodpi/welcome_hero_chirho.webp',
		bytes_chirho: 334984,
		sha256_chirho: '31ba32a9278f99020ddf6ce3424d9867e293bd05bf599ee061b8ef97aab2eb2c'
	},
	{
		path_chirho:
			'apps-chirho/ios-chirho/HinnehChirho/WelcomeChirho.xcassets/WelcomeHeroChirho.imageset/welcome-hero-chirho.png',
		bytes_chirho: 1856156,
		sha256_chirho: '1e3c07023b245d7d8895b7e9d6ad7dde73703e460bd073ba72d0c864e5b67ffe'
	}
] as const;
const ESSENTIAL_UI_BY_PATH_CHIRHO = new Map<string, (typeof ESSENTIAL_UI_RASTERS_CHIRHO)[number]>(
	ESSENTIAL_UI_RASTERS_CHIRHO.map((assetChirho) => [assetChirho.path_chirho, assetChirho])
);
/** Other generated artwork and audio bytes use delivery storage, never source history. */
const MEDIA_EXTENSIONS_CHIRHO = new Set([
	'.aac',
	'.avif',
	'.bmp',
	'.flac',
	'.gif',
	'.heic',
	'.jpeg',
	'.jpg',
	'.m4a',
	'.m4v',
	'.mkv',
	'.mov',
	'.mp3',
	'.mp4',
	'.oga',
	'.ogg',
	'.opus',
	'.png',
	'.psd',
	'.tif',
	'.tiff',
	'.wav',
	'.webm',
	'.webp'
]);
const DATABASE_PATTERN_CHIRHO = /\.(?:sqlite3?|db)(?:-wal|-shm|-journal)?$/iu;
// Dotenv-style files at any depth; only the verified root binding file is exempt.
const ENVIRONMENT_PATTERN_CHIRHO = /^(?:\.env|\.dev\.vars)(?:\..*)?$|\.env$/u;
const NPM_CREDENTIAL_PATTERN_CHIRHO =
	/(?:^|:)_(?:auth|authToken|password)\s*=|^\s*(?:token|password)\s*=/imu;
/** GBT matching-only source-word files are not itemized by GBT's license statement. */
const REDISTRIBUTION_PATTERN_CHIRHO = /^data-chirho\/(?:[^/]+\/)*gbt-data-chirho\/hbo\+grc\//u;
/** GitHub rejects files of 100 MiB or more and warns from 50 MiB. */
export const GITHUB_FILE_LIMIT_CHIRHO = 100 * 1024 * 1024;
const GITHUB_WARNING_CHIRHO = 50 * 1024 * 1024;
const CUT_HOME_CHIRHO = 'build-chirho/public-source-chirho';
const CUT_NAME_PATTERN_CHIRHO = /^[a-z0-9][a-z0-9-]{0,62}-chirho$/u;

export type ExclusionChirho =
	| 'unsafe_path'
	| 'missing'
	| 'symlink'
	| 'not_regular'
	| 'escapes_root'
	| 'environment'
	| 'workspace'
	| 'private_spec'
	| 'outside_allowlist'
	| 'build_or_cache'
	| 'redistribution_boundary'
	| 'generated_media'
	| 'essential_ui_asset_mismatch'
	| 'database'
	| 'oversized';
export interface PathFactsChirho {
	kind_chirho: 'file' | 'symlink' | 'other' | 'missing';
	bytes_chirho: number;
}
export type ClassificationChirho =
	{ include_chirho: true } | { include_chirho: false; reason_chirho: ExclusionChirho };

/** A Git-relative path that cannot name the root itself or anything outside it. */
export function isSafeRelativePathChirho(pathChirho: string): boolean {
	return (
		pathChirho.length > 0 &&
		!pathChirho.includes('\0') &&
		!pathChirho.includes('\\') &&
		!pathChirho.startsWith('/') &&
		pathChirho
			.split('/')
			.every(
				(segmentChirho) => segmentChirho !== '' && segmentChirho !== '.' && segmentChirho !== '..'
			)
	);
}

/** The trust boundary: one listed path plus its lstat facts decides inclusion. */
export function classifyPublicPathChirho(
	pathChirho: string,
	factsChirho: PathFactsChirho
): ClassificationChirho {
	const excludeChirho = (reasonChirho: ExclusionChirho): ClassificationChirho => ({
		include_chirho: false,
		reason_chirho: reasonChirho
	});
	if (!isSafeRelativePathChirho(pathChirho)) return excludeChirho('unsafe_path');
	const segmentsChirho = pathChirho.split('/');
	if (factsChirho.kind_chirho === 'missing') return excludeChirho('missing');
	if (factsChirho.kind_chirho === 'symlink') return excludeChirho('symlink');
	if (factsChirho.kind_chirho !== 'file') return excludeChirho('not_regular');
	const nameChirho = segmentsChirho[segmentsChirho.length - 1];
	if (ENVIRONMENT_PATTERN_CHIRHO.test(nameChirho) && pathChirho !== BINDINGS_FILE_CHIRHO)
		return excludeChirho('environment');
	if (segmentsChirho.length === 1) {
		if (!(ROOT_FILES_CHIRHO as readonly string[]).includes(pathChirho))
			return excludeChirho('outside_allowlist');
	} else if (!SOURCE_ROOTS_CHIRHO.some((rootChirho) => pathChirho.startsWith(rootChirho))) {
		if (segmentsChirho[0] === 'workspace-chirho') return excludeChirho('workspace');
		if (segmentsChirho[0] === 'spec-chirho') return excludeChirho('private_spec');
		return excludeChirho('outside_allowlist');
	}
	if (
		segmentsChirho.slice(0, -1).some((segmentChirho) => EXCLUDED_SEGMENTS_CHIRHO.has(segmentChirho))
	)
		return excludeChirho('build_or_cache');
	if (REDISTRIBUTION_PATTERN_CHIRHO.test(pathChirho))
		return excludeChirho('redistribution_boundary');
	const essentialUiChirho = ESSENTIAL_UI_BY_PATH_CHIRHO.get(pathChirho);
	if (essentialUiChirho && factsChirho.bytes_chirho !== essentialUiChirho.bytes_chirho)
		return excludeChirho('essential_ui_asset_mismatch');
	const dotChirho = nameChirho.lastIndexOf('.');
	if (
		!essentialUiChirho &&
		dotChirho > 0 &&
		MEDIA_EXTENSIONS_CHIRHO.has(nameChirho.slice(dotChirho).toLowerCase())
	)
		return excludeChirho('generated_media');
	if (DATABASE_PATTERN_CHIRHO.test(nameChirho)) return excludeChirho('database');
	if (factsChirho.bytes_chirho >= GITHUB_FILE_LIMIT_CHIRHO) return excludeChirho('oversized');
	return { include_chirho: true };
}

/** A binding file is publishable only while every non-blank line is a comment. */
export function isSafeBindingsTextChirho(textChirho: string): boolean {
	return textChirho
		.split(/\r?\n/u)
		.every((lineChirho) => !lineChirho.trim() || lineChirho.trimStart().startsWith('#'));
}

/** Tracked plus untracked-but-not-ignored paths, exactly as Git reports them. */
export function gitListedPathsChirho(rootChirho: string): string[] {
	const outputChirho = execFileSyncChirho(
		'git',
		['ls-files', '--cached', '--others', '--exclude-standard', '-z'],
		{ cwd: rootChirho, maxBuffer: 256 * 1024 * 1024 }
	);
	return [...new Set(outputChirho.toString('utf8').split('\0').filter(Boolean))];
}

export interface PublicFileChirho {
	path_chirho: string;
	bytes_chirho: number;
	mode_chirho: '100644' | '100755';
}
export interface PublicPlanChirho {
	files_chirho: PublicFileChirho[];
	total_bytes_chirho: number;
	roots_chirho: Record<string, { files_chirho: number; bytes_chirho: number }>;
	excluded_chirho: Partial<Record<ExclusionChirho, number>>;
	excluded_examples_chirho: Partial<Record<ExclusionChirho, string[]>>;
	warnings_chirho: string[];
	blockers_chirho: string[];
}

async function factsChirho(fullPathChirho: string) {
	try {
		const statChirho = await lstatChirho(fullPathChirho);
		return {
			kind_chirho: statChirho.isSymbolicLink()
				? ('symlink' as const)
				: statChirho.isFile()
					? ('file' as const)
					: ('other' as const),
			bytes_chirho: statChirho.size,
			mode_chirho: statChirho.mode & 0o111 ? ('100755' as const) : ('100644' as const)
		};
	} catch (errorChirho) {
		if ((errorChirho as NodeJS.ErrnoException).code === 'ENOENT')
			return { kind_chirho: 'missing' as const, bytes_chirho: 0, mode_chirho: '100644' as const };
		throw errorChirho;
	}
}

/** Workflow: public-site-chirho.md. Verify bundled UI bytes while keeping generated Bible media out. */
export async function planPublicSourceChirho(
	rootChirho: string,
	listChirho: (rootChirho: string) => string[] = gitListedPathsChirho
): Promise<PublicPlanChirho> {
	const realRootChirho = await realpathChirho(rootChirho);
	const planChirho: PublicPlanChirho = {
		files_chirho: [],
		total_bytes_chirho: 0,
		roots_chirho: {},
		excluded_chirho: {},
		excluded_examples_chirho: {},
		warnings_chirho: [],
		blockers_chirho: []
	};
	const excludeChirho = (pathChirho: string, reasonChirho: ExclusionChirho) => {
		planChirho.excluded_chirho[reasonChirho] = (planChirho.excluded_chirho[reasonChirho] ?? 0) + 1;
		const examplesChirho = (planChirho.excluded_examples_chirho[reasonChirho] ??= []);
		if (examplesChirho.length < 5) examplesChirho.push(pathChirho);
	};
	for (const pathChirho of [...new Set(listChirho(rootChirho))].sort()) {
		// Unsafe names are refused before any filesystem call can follow them.
		if (!isSafeRelativePathChirho(pathChirho)) {
			excludeChirho(pathChirho, 'unsafe_path');
			continue;
		}
		const pathFactsChirho = await factsChirho(joinChirho(rootChirho, pathChirho));
		const classChirho = classifyPublicPathChirho(pathChirho, pathFactsChirho);
		if (!classChirho.include_chirho) {
			excludeChirho(pathChirho, classChirho.reason_chirho);
			if (classChirho.reason_chirho === 'essential_ui_asset_mismatch')
				planChirho.blockers_chirho.push(`Essential UI resource size differs: ${pathChirho}`);
			continue;
		}
		// A symlinked parent directory could still lead outside the project root.
		const realChirho = await realpathChirho(joinChirho(rootChirho, pathChirho));
		if (realChirho.normalize('NFC') !== joinChirho(realRootChirho, pathChirho).normalize('NFC')) {
			excludeChirho(pathChirho, 'escapes_root');
			continue;
		}
		if (
			ESSENTIAL_UI_BY_PATH_CHIRHO.has(pathChirho) &&
			!essentialUiBytesMatchChirho(
				pathChirho,
				await readFileChirho(joinChirho(rootChirho, pathChirho))
			)
		) {
			excludeChirho(pathChirho, 'essential_ui_asset_mismatch');
			planChirho.blockers_chirho.push(`Essential UI resource bytes differ: ${pathChirho}`);
			continue;
		}
		planChirho.files_chirho.push({
			path_chirho: pathChirho,
			bytes_chirho: pathFactsChirho.bytes_chirho,
			mode_chirho: pathFactsChirho.mode_chirho
		});
		planChirho.total_bytes_chirho += pathFactsChirho.bytes_chirho;
		const rootNameChirho =
			SOURCE_ROOTS_CHIRHO.find((rootChirho) => pathChirho.startsWith(rootChirho)) ?? '(root files)';
		const rootEntryChirho = (planChirho.roots_chirho[rootNameChirho] ??= {
			files_chirho: 0,
			bytes_chirho: 0
		});
		rootEntryChirho.files_chirho++;
		rootEntryChirho.bytes_chirho += pathFactsChirho.bytes_chirho;
		if (pathFactsChirho.bytes_chirho >= GITHUB_WARNING_CHIRHO)
			planChirho.warnings_chirho.push(`${pathChirho} is at least 50 MiB`);
	}
	const includedChirho = new Set(
		planChirho.files_chirho.map((fileChirho) => fileChirho.path_chirho)
	);
	for (const requiredChirho of REQUIRED_FILES_CHIRHO)
		if (!includedChirho.has(requiredChirho))
			planChirho.blockers_chirho.push(`Required build file missing: ${requiredChirho}`);
	if (
		includedChirho.has(BINDINGS_FILE_CHIRHO) &&
		!isSafeBindingsTextChirho(
			await readFileChirho(joinChirho(rootChirho, BINDINGS_FILE_CHIRHO), 'utf8')
		)
	)
		planChirho.blockers_chirho.push(
			`${BINDINGS_FILE_CHIRHO} declares a binding; only comments may be published`
		);
	if (
		includedChirho.has('.npmrc') &&
		NPM_CREDENTIAL_PATTERN_CHIRHO.test(
			await readFileChirho(joinChirho(rootChirho, '.npmrc'), 'utf8')
		)
	)
		planChirho.blockers_chirho.push('.npmrc carries registry credentials');
	return planChirho;
}

export interface ManifestEntryChirho extends PublicFileChirho {
	sha256_chirho: string;
}
export interface PublicManifestChirho {
	schema_version_chirho: 1;
	cut_chirho: string;
	source_head_chirho: string | null;
	file_count_chirho: number;
	total_bytes_chirho: number;
	files_chirho: ManifestEntryChirho[];
}
const sha256Chirho = (bytesChirho: Uint8Array) =>
	createHashChirho('sha256').update(bytesChirho).digest('hex');

function essentialUiBytesMatchChirho(pathChirho: string, bytesChirho: Uint8Array): boolean {
	const expectedChirho = ESSENTIAL_UI_BY_PATH_CHIRHO.get(pathChirho);
	return (
		!expectedChirho ||
		(bytesChirho.length === expectedChirho.bytes_chirho &&
			sha256Chirho(bytesChirho) === expectedChirho.sha256_chirho)
	);
}

/** Reads one planned file, refusing it if its kind or size changed after planning. */
async function plannedBytesChirho(rootChirho: string, fileChirho: PublicFileChirho) {
	const fullChirho = joinChirho(rootChirho, fileChirho.path_chirho);
	const nowChirho = await factsChirho(fullChirho);
	if (nowChirho.kind_chirho !== 'file' || nowChirho.bytes_chirho !== fileChirho.bytes_chirho)
		throw new Error(`Planned source changed: ${fileChirho.path_chirho}`);
	const bytesChirho = await readFileChirho(fullChirho);
	if (bytesChirho.length !== fileChirho.bytes_chirho)
		throw new Error(`Planned source changed: ${fileChirho.path_chirho}`);
	if (!essentialUiBytesMatchChirho(fileChirho.path_chirho, bytesChirho))
		throw new Error(`Essential UI source changed: ${fileChirho.path_chirho}`);
	return bytesChirho;
}

function headChirho(rootChirho: string): string | null {
	try {
		return execFileSyncChirho('git', ['rev-parse', '--verify', '--quiet', 'HEAD'], {
			cwd: rootChirho,
			stdio: ['ignore', 'pipe', 'ignore']
		})
			.toString()
			.trim();
	} catch {
		return null;
	}
}

/** The deterministic outgoing manifest: sorted paths, sizes, modes and hashes, no clock. */
export async function publicManifestChirho(
	rootChirho: string,
	planChirho: PublicPlanChirho,
	cutChirho: string
): Promise<PublicManifestChirho> {
	const filesChirho: ManifestEntryChirho[] = [];
	for (const fileChirho of planChirho.files_chirho)
		filesChirho.push({
			...fileChirho,
			sha256_chirho: sha256Chirho(await plannedBytesChirho(rootChirho, fileChirho))
		});
	return {
		schema_version_chirho: 1,
		cut_chirho: cutChirho,
		source_head_chirho: headChirho(rootChirho),
		file_count_chirho: filesChirho.length,
		total_bytes_chirho: planChirho.total_bytes_chirho,
		files_chirho: filesChirho
	};
}

/** The cut and its manifest are siblings, so the manifest never enters the candidate Git root. */
export function cutPathsChirho(rootChirho: string, cutChirho: string) {
	if (!CUT_NAME_PATTERN_CHIRHO.test(cutChirho))
		throw new Error('Cut name must be lowercase words ending in -chirho');
	const homeChirho = joinChirho(resolveChirho(rootChirho), CUT_HOME_CHIRHO);
	return {
		home_chirho: homeChirho,
		target_chirho: joinChirho(homeChirho, cutChirho),
		manifest_chirho: joinChirho(homeChirho, `${cutChirho}-manifest-chirho.json`)
	};
}

async function realDirectoryOrAbsentChirho(pathChirho: string) {
	try {
		const statChirho = await lstatChirho(pathChirho);
		if (!statChirho.isDirectory() || statChirho.isSymbolicLink())
			throw new Error(`Cut home is not a plain directory: ${pathChirho}`);
	} catch (errorChirho) {
		if ((errorChirho as NodeJS.ErrnoException).code !== 'ENOENT') throw errorChirho;
	}
}

/** Creates a new cut directory, copying exact bytes and modes; existing output is never touched. */
export async function createPublicCutChirho(
	rootChirho: string,
	planChirho: PublicPlanChirho,
	cutChirho: string
): Promise<PublicManifestChirho> {
	if (planChirho.blockers_chirho.length)
		throw new Error(`Public cut blocked: ${planChirho.blockers_chirho.join('; ')}`);
	const pathsChirho = cutPathsChirho(rootChirho, cutChirho);
	await realDirectoryOrAbsentChirho(joinChirho(resolveChirho(rootChirho), 'build-chirho'));
	await realDirectoryOrAbsentChirho(pathsChirho.home_chirho);
	for (const occupiedChirho of [pathsChirho.target_chirho, pathsChirho.manifest_chirho]) {
		const existsChirho = await lstatChirho(occupiedChirho).then(
			() => true,
			(errorChirho: NodeJS.ErrnoException) => {
				if (errorChirho.code === 'ENOENT') return false;
				throw errorChirho;
			}
		);
		if (existsChirho) throw new Error(`Public cut target is occupied: ${occupiedChirho}`);
	}
	await mkdirChirho(pathsChirho.home_chirho, { recursive: true });
	// A non-recursive mkdir is the atomic claim: it fails if anything appeared meanwhile.
	await mkdirChirho(pathsChirho.target_chirho);
	const filesChirho: ManifestEntryChirho[] = [];
	for (const fileChirho of planChirho.files_chirho) {
		const bytesChirho = await plannedBytesChirho(rootChirho, fileChirho);
		const destinationChirho = joinChirho(pathsChirho.target_chirho, fileChirho.path_chirho);
		if (!destinationChirho.startsWith(pathsChirho.target_chirho + '/'))
			throw new Error(`Cut path escapes its target: ${fileChirho.path_chirho}`);
		await mkdirChirho(dirnameChirho(destinationChirho), { recursive: true });
		await writeFileChirho(destinationChirho, bytesChirho, {
			flag: 'wx',
			mode: fileChirho.mode_chirho === '100755' ? 0o755 : 0o644
		});
		filesChirho.push({ ...fileChirho, sha256_chirho: sha256Chirho(bytesChirho) });
	}
	const manifestChirho: PublicManifestChirho = {
		schema_version_chirho: 1,
		cut_chirho: cutChirho,
		source_head_chirho: headChirho(rootChirho),
		file_count_chirho: filesChirho.length,
		total_bytes_chirho: planChirho.total_bytes_chirho,
		files_chirho: filesChirho
	};
	await writeFileChirho(
		pathsChirho.manifest_chirho,
		JSON.stringify(manifestChirho, null, '\t') + '\n',
		{
			flag: 'wx'
		}
	);
	return manifestChirho;
}

if (import.meta.main) {
	const argumentsChirho = process.argv.slice(2);
	const nameIndexChirho = argumentsChirho.indexOf('--name-chirho');
	for (const [indexChirho, valueChirho] of argumentsChirho.entries())
		if (
			!['--apply-chirho', '--list-chirho', '--name-chirho'].includes(valueChirho) &&
			argumentsChirho[indexChirho - 1] !== '--name-chirho'
		)
			throw new Error('Unsupported public source argument');
	const rootChirho = resolveChirho('.');
	const cutChirho =
		nameIndexChirho < 0 ? 'hinneh-public-source-chirho' : argumentsChirho[nameIndexChirho + 1];
	const pathsChirho = cutPathsChirho(rootChirho, cutChirho);
	const planChirho = await planPublicSourceChirho(rootChirho);
	const manifestChirho = argumentsChirho.includes('--apply-chirho')
		? await createPublicCutChirho(rootChirho, planChirho, cutChirho)
		: await publicManifestChirho(rootChirho, planChirho, cutChirho);
	if (argumentsChirho.includes('--list-chirho'))
		for (const fileChirho of manifestChirho.files_chirho)
			console.log(
				`${fileChirho.mode_chirho} ${fileChirho.sha256_chirho} ${fileChirho.bytes_chirho} ${fileChirho.path_chirho}`
			);
	console.log(
		JSON.stringify(
			{
				dry_run_chirho: !argumentsChirho.includes('--apply-chirho'),
				cut_chirho: cutChirho,
				target_chirho: pathsChirho.target_chirho.slice(rootChirho.length + 1),
				manifest_chirho: pathsChirho.manifest_chirho.slice(rootChirho.length + 1),
				manifest_sha256_chirho: sha256Chirho(
					new TextEncoder().encode(JSON.stringify(manifestChirho, null, '\t') + '\n')
				),
				file_count_chirho: manifestChirho.file_count_chirho,
				total_bytes_chirho: manifestChirho.total_bytes_chirho,
				roots_chirho: planChirho.roots_chirho,
				excluded_chirho: planChirho.excluded_chirho,
				excluded_examples_chirho: planChirho.excluded_examples_chirho,
				warnings_chirho: planChirho.warnings_chirho,
				blockers_chirho: planChirho.blockers_chirho
			},
			null,
			2
		)
	);
	if (planChirho.blockers_chirho.length) process.exitCode = 1;
}
