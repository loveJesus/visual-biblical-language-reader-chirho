// For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life. — John 3:16 (KJV)

// Serves a built release with `wrangler dev --local` and the publish config's asset settings
// (no credentials in its environment), then probes the public boundary over HTTP: declared
// files serve; server artifacts, env files, sources and unknown endpoints 404; writes refuse.
// Workflow: spec-chirho/research-chirho/26-10-27-publication-readiness-chirho.md
// Usage: bun scripts-chirho/publish-chirho/probe_release_chirho.ts [--review-chirho | --preview-chirho]
//        [--root-chirho DIR]

import { spawn, spawnSync as spawnSyncChirho } from 'node:child_process';
import { mkdir, readFile, rm, writeFile, mkdtemp as mkdtempChirho } from 'node:fs/promises';
import { createServer } from 'node:net';
import { join, resolve } from 'node:path';
import { parseConfigFileTextToJson } from 'typescript';
import {
	releaseDirectoryChirho,
	type ReleaseKindChirho,
	type ReleaseManifestChirho
} from './build_release_chirho';
import { objectRequestChirho, digestChirho } from './r2-chirho/object-store-chirho';
import { tmpdir as tmpdirChirho } from 'node:os';
import { wranglerEnvironmentChirho } from './release_rules_chirho';

type ExpectChirho = (responseChirho: Response, bodyChirho: string) => boolean;

async function freePortChirho(): Promise<number> {
	return new Promise((resolvePortChirho, rejectChirho) => {
		const serverChirho = createServer();
		serverChirho.once('error', rejectChirho);
		serverChirho.listen(0, '127.0.0.1', () => {
			const addressChirho = serverChirho.address();
			serverChirho.close(() =>
				typeof addressChirho === 'object' && addressChirho
					? resolvePortChirho(addressChirho.port)
					: rejectChirho(new Error('No local port.'))
			);
		});
	});
}

/** Serves the release of one kind locally and returns the labels of the probes that failed. */
export async function probeReleaseChirho(
	rootChirho: string,
	kindChirho: ReleaseKindChirho
): Promise<string[]> {
	const outChirho = releaseDirectoryChirho(join(rootChirho, 'build-chirho'), kindChirho);
	const manifestChirho = JSON.parse(
		await readFile(join(outChirho, 'release-manifest-chirho.json'), 'utf8')
	) as ReleaseManifestChirho;
	const configPathChirho = join(
		rootChirho,
		'config-chirho',
		kindChirho === 'recorded_preview'
			? 'wrangler-preview-chirho.jsonc'
			: 'wrangler-publish-chirho.jsonc'
	);
	const parsedChirho = parseConfigFileTextToJson(
		configPathChirho,
		await readFile(configPathChirho, 'utf8')
	);
	if (parsedChirho.error) throw new Error('Publish config does not parse.');
	const probeConfigChirho = join(rootChirho, 'build-chirho', 'probe-wrangler-chirho.json');
	await writeFile(
		probeConfigChirho,
		JSON.stringify({
			...parsedChirho.config,
			routes: undefined,
			...(manifestChirho.artwork_chirho
				? { main: join(outChirho, 'artwork-worker-chirho.mjs') }
				: {}),
			assets: { ...parsedChirho.config.assets, directory: join(outChirho, 'public-chirho') }
		})
	);
	const portChirho = await freePortChirho();
	const originChirho = `http://127.0.0.1:${portChirho}`;
	const environmentChirho = wranglerEnvironmentChirho(rootChirho);
	// This frozen snapshot never changes during a probe. Polling avoids one macOS native
	// watch descriptor per media file, which otherwise prevents later child-process spawns.
	environmentChirho.CHOKIDAR_USEPOLLING = 'true';
	environmentChirho.CHOKIDAR_INTERVAL = '10000';
	await mkdir(environmentChirho.HOME, { recursive: true });
	if (manifestChirho.artwork_chirho) {
		for (const factChirho of [
			manifestChirho.artwork_chirho.objects_chirho[0],
			...(manifestChirho.artwork_chirho.audio_objects_chirho?.slice(0, 1) ?? [])
		]) {
			const responseChirho = await objectRequestChirho('GET', factChirho.key_chirho);
			if (!responseChirho.ok) throw new Error('Local R2 probe seed unavailable');
			const bytesChirho = new Uint8Array(await responseChirho.arrayBuffer());
			if (
				digestChirho(bytesChirho) !== factChirho.sha256_chirho ||
				bytesChirho.length !== factChirho.bytes_chirho
			)
				throw new Error('Local R2 seed changed');
			const seedHomeChirho = await mkdtempChirho(join(tmpdirChirho(), 'hinneh-probe-chirho-'));
			const fileChirho = join(seedHomeChirho, 'seed-chirho.webp');
			await writeFile(fileChirho, bytesChirho);
			try {
				const seedChirho = spawnSyncChirho(
					'bunx',
					[
						'wrangler',
						'r2',
						'object',
						'put',
						'hinneh-media-chirho/' + factChirho.key_chirho,
						'--file',
						fileChirho,
						'--local',
						'--config',
						probeConfigChirho,
						'--persist-to',
						join(rootChirho, 'build-chirho/probe-state-chirho')
					],
					{ cwd: rootChirho, env: environmentChirho, encoding: 'utf8', timeout: 60000 }
				);
				if (seedChirho.status !== 0) throw new Error('Local R2 seed command failed');
			} finally {
				await rm(seedHomeChirho, { recursive: true, force: true });
			}
		}
	}

	const wranglerChirho = spawn(
		'bunx',
		[
			'wrangler',
			'dev',
			'--config',
			probeConfigChirho,
			'--local',
			'--ip',
			'127.0.0.1',
			'--port',
			String(portChirho),
			'--persist-to',
			join(rootChirho, 'build-chirho', 'probe-state-chirho'),
			'--show-interactive-dev-session=false'
		],
		{
			cwd: rootChirho,
			env: environmentChirho,
			stdio: ['ignore', 'pipe', 'pipe']
		}
	);
	let diagnosticChirho = '';
	wranglerChirho.stdout?.on('data', () => {});
	wranglerChirho.stderr?.on('data', (bytesChirho: Buffer) => {
		diagnosticChirho = (diagnosticChirho + bytesChirho.toString('utf8')).slice(-4_000);
	});
	let spawnFailedChirho = false;
	const closedChirho = new Promise<void>((resolveClosedChirho) => {
		wranglerChirho.once('error', () => {
			spawnFailedChirho = true;
			resolveClosedChirho();
		});
		wranglerChirho.once('close', () => resolveClosedChirho());
	});
	const firstChirho = (prefixChirho: string) =>
		manifestChirho.files_chirho.find((fileChirho) =>
			fileChirho.path_chirho.startsWith(prefixChirho)
		)?.path_chirho ?? '/missing-chirho';
	const scriptChirho = manifestChirho.files_chirho.find(
		(fileChirho) =>
			fileChirho.path_chirho.startsWith('/_app/immutable/') &&
			fileChirho.path_chirho.endsWith('.js')
	)?.path_chirho;
	const chapterChirho = firstChirho('/content-chirho/proverbs-chirho/chapter-');
	const mediaChirho = manifestChirho.artwork_chirho
		? `/assets-chirho/sha256-chirho/${manifestChirho.artwork_chirho.objects_chirho[0].sha256_chirho}-chirho.webp`
		: firstChirho('/assets-chirho/');
	const statusChirho =
		(codeChirho: number): ExpectChirho =>
		(responseChirho) =>
			responseChirho.status === codeChirho;
	const checksChirho: [string, string, string, ExpectChirho, Record<string, string>?][] = [
		[
			'root page',
			'GET',
			'/',
			(responseChirho) =>
				responseChirho.status === 200 &&
				/text\/html/.test(responseChirho.headers.get('content-type') ?? '') &&
				responseChirho.headers.get('x-content-type-options') === 'nosniff'
		],
		[
			'HEAD has no body',
			'HEAD',
			'/',
			(responseChirho, bodyChirho) => responseChirho.status === 200 && bodyChirho === ''
		],
		[
			'hashed app script is immutable',
			'GET',
			scriptChirho ?? '/missing-chirho',
			(responseChirho) =>
				responseChirho.status === 200 &&
				/immutable/.test(responseChirho.headers.get('cache-control') ?? '')
		],
		[
			'chapter JSON',
			'GET',
			chapterChirho,
			(responseChirho) =>
				responseChirho.status === 200 &&
				/json/.test(responseChirho.headers.get('content-type') ?? '')
		],
		[
			'declared WebP',
			'GET',
			mediaChirho,
			(responseChirho) =>
				responseChirho.status === 200 && responseChirho.headers.get('content-type') === 'image/webp'
		],
		['SSR worker hidden', 'GET', '/_worker.js', statusChirho(404)],
		['routes file hidden', 'GET', '/_routes.json', statusChirho(404)],
		['headers file hidden', 'GET', '/_headers', statusChirho(404)],
		['.env hidden', 'GET', '/.env', statusChirho(404)],
		['.dev.vars hidden', 'GET', '/.dev.vars', statusChirho(404)],
		['release manifest hidden', 'GET', '/release-manifest-chirho.json', statusChirho(404)],
		['package.json hidden', 'GET', '/package.json', statusChirho(404)],
		['route source hidden', 'GET', '/src/routes/+page.server.ts', statusChirho(404)],
		['unknown API path', 'GET', '/api-chirho/query', statusChirho(404)],
		['encoded traversal', 'GET', '/..%2f.env', statusChirho(404)],
		[
			'unknown chapter',
			'GET',
			'/content-chirho/proverbs-chirho/chapter-99-chirho.json',
			statusChirho(404)
		],
		['POST root refused', 'POST', '/', statusChirho(405)],
		['PUT content refused', 'PUT', chapterChirho, statusChirho(405)],
		['DELETE media refused', 'DELETE', mediaChirho, statusChirho(405)],
		['POST unknown path', 'POST', '/api-chirho/upload', statusChirho(404)]
	];
	const firstAudioChirho = manifestChirho.artwork_chirho?.audio_objects_chirho?.[0];
	if (firstAudioChirho) {
		const pathChirho =
			'/audio-chirho/sha256-chirho/' + firstAudioChirho.sha256_chirho + '-chirho.mp3';
		checksChirho.push(
			[
				'declared R2 word audio',
				'GET',
				pathChirho,
				(responseChirho) =>
					responseChirho.status === 200 &&
					responseChirho.headers.get('content-type') === 'audio/mpeg' &&
					responseChirho.headers.get('content-length') === String(firstAudioChirho.bytes_chirho)
			],
			[
				'audio HEAD uses no object body',
				'HEAD',
				pathChirho,
				(responseChirho, bodyChirho) => responseChirho.status === 200 && bodyChirho === ''
			],
			[
				'audio ETag revalidation',
				'GET',
				pathChirho,
				statusChirho(304),
				{ 'If-None-Match': '"' + firstAudioChirho.sha256_chirho + '"' }
			],
			[
				'unknown private audio refused',
				'GET',
				'/audio-chirho/sha256-chirho/' + '0'.repeat(64) + '-chirho.mp3',
				statusChirho(404)
			]
		);
	}
	const failuresChirho: string[] = [];
	try {
		const deadlineChirho = Date.now() + 90_000;
		for (;;) {
			const readyChirho = await fetch(originChirho, { signal: AbortSignal.timeout(5_000) }).then(
				(responseChirho) => responseChirho.status === 200,
				() => false
			);
			if (readyChirho) break;
			if (spawnFailedChirho || Date.now() > deadlineChirho || wranglerChirho.exitCode !== null)
				throw new Error(`wrangler dev did not serve the release. ${diagnosticChirho}`);
			await new Promise((doneChirho) => setTimeout(doneChirho, 500));
		}
		const rootResponseChirho = await fetch(originChirho, { signal: AbortSignal.timeout(10_000) });
		if (kindChirho === 'recorded_preview')
			checksChirho.push([
				'preview asks not to be indexed',
				'GET',
				'/',
				(responseChirho) => /noindex/.test(responseChirho.headers.get('x-robots-tag') ?? '')
			]);
		const etagChirho = rootResponseChirho.headers.get('etag') ?? '';
		checksChirho.push([
			'ETag revalidation (free asset request)',
			'GET',
			'/',
			statusChirho(304),
			{ 'If-None-Match': etagChirho }
		]);
		for (const [
			labelChirho,
			methodChirho,
			pathChirho,
			expectChirho,
			headersChirho
		] of checksChirho) {
			const responseChirho = await fetch(`${originChirho}${pathChirho}`, {
				method: methodChirho,
				redirect: 'manual',
				headers: headersChirho,
				signal: AbortSignal.timeout(10_000)
			});
			const bodyChirho = await responseChirho.text();
			const passChirho = expectChirho(responseChirho, bodyChirho);
			if (!passChirho) failuresChirho.push(labelChirho);
			console.log(
				`${passChirho ? 'PASS' : 'FAIL'} ${responseChirho.status} ${methodChirho} ${pathChirho} (${labelChirho})`
			);
		}
	} finally {
		wranglerChirho.kill('SIGTERM');
		let timeoutChirho: ReturnType<typeof setTimeout> | undefined;
		await Promise.race([
			closedChirho,
			new Promise<void>((resolveTimeoutChirho) => {
				timeoutChirho = setTimeout(() => {
					wranglerChirho.kill('SIGKILL');
					resolveTimeoutChirho();
				}, 5_000);
			})
		]);
		clearTimeout(timeoutChirho);
		await rm(probeConfigChirho, { force: true });
		if (manifestChirho.artwork_chirho)
			await rm(join(rootChirho, 'build-chirho/probe-state-chirho'), {
				recursive: true,
				force: true
			});
	}
	console.log(
		failuresChirho.length
			? `${failuresChirho.length} probe(s) failed: ${failuresChirho.join(', ')}`
			: `All ${checksChirho.length} probes passed for release ${manifestChirho.release_id_chirho}.`
	);
	return failuresChirho;
}

async function mainChirho(argumentsChirho: string[]): Promise<number> {
	const rootIndexChirho = argumentsChirho.indexOf('--root-chirho');
	const rootChirho = resolve(rootIndexChirho >= 0 ? argumentsChirho[rootIndexChirho + 1] : '.');
	const kindChirho: ReleaseKindChirho = argumentsChirho.includes('--preview-chirho')
		? 'recorded_preview'
		: argumentsChirho.includes('--review-chirho')
			? 'local_review'
			: 'publishable';
	return (await probeReleaseChirho(rootChirho, kindChirho)).length ? 2 : 0;
}

if (import.meta.main) process.exitCode = await mainChirho(process.argv.slice(2));
