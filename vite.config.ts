// For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life. — John 3:16 (KJV)

import tailwindcssChirho from '@tailwindcss/vite';
import { defineConfig } from 'vitest/config';
import { playwright } from '@vitest/browser-playwright';
import adapterChirho from '@sveltejs/adapter-cloudflare';
import { sveltekit } from '@sveltejs/kit/vite';
import { execFileSync as execFileSyncChirho } from 'node:child_process';

function versionChirho(): string {
	try {
		const commitChirho = execFileSyncChirho('git', ['rev-parse', 'HEAD'], {
			encoding: 'utf8',
			stdio: ['ignore', 'pipe', 'ignore']
		}).trim();
		return /^[a-f0-9]{40}$/u.test(commitChirho) ? commitChirho : 'development-chirho';
	} catch {
		return 'development-chirho';
	}
}

export default defineConfig({
	// SvelteKit and the Cloudflare adapter bundle the server in two passes. Inline the shared
	// serialization library so the second pass never receives an unused bare external import.
	ssr: { noExternal: ['devalue'] },
	server: {
		watch: {
			ignored: [
				'**/apps-chirho/**',
				'**/build-chirho/**',
				'**/workspace-chirho/**',
				'**/data-chirho/media-chirho/*-worker-*.json',
				'**/data-chirho/media-chirho/reused-*-icons-chirho.json',
				'**/static/media-index-chirho.json',
				'**/static/media-chirho/**',
				'**/static/assets-chirho/scenes-chirho/**',
				'**/static/assets-chirho/icons-chirho/**'
			]
		}
	},
	plugins: [
		tailwindcssChirho(),
		sveltekit({
			version: { name: versionChirho() },
			// The sole HTML entry uses client-fetched chapters. R2 artwork must not be crawled
			// into local prerender dependencies or mistaken for local static image files.
			prerender: { crawl: false },
			compilerOptions: {
				// Force runes mode for the project, except for libraries. Can be removed in svelte 6.
				runes: ({ filename: filenameChirho }) =>
					filenameChirho.split(/[/\\]/).includes('node_modules') ? undefined : true
			},
			adapter: adapterChirho()
		})
	],
	test: {
		expect: { requireAssertions: true },
		projects: [
			{
				extends: './vite.config.ts',
				test: {
					name: 'client',
					browser: {
						enabled: true,
						provider: playwright(),
						instances: [{ browser: 'chromium', headless: true }]
					},
					include: ['src/**/*.svelte.{test,spec}.{js,ts}'],
					exclude: ['src/lib/server/**']
				}
			},

			{
				extends: './vite.config.ts',
				test: {
					name: 'server',
					environment: 'node',
					include: [
						'src/**/*.{test,spec}.{js,ts}',
						'tests-chirho/domain-chirho/**/*.test.ts',
						'tests-chirho/publish-chirho/**/*.test.ts',
						'tests-chirho/corpus-chirho/**/*.test.ts',
						'tests-chirho/bible-chirho/**/*.test.ts',
						'tests-chirho/art-chirho/**/*.test.ts'
					],
					exclude: ['src/**/*.svelte.{test,spec}.{js,ts}']
				}
			}
		]
	}
});
