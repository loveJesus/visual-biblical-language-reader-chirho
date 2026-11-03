// For God so loved the world, that he gave his only begotten Son, that whosoever believeth in him should not perish, but have everlasting life. — John 3:16 (KJV)

import { defineConfig } from '@playwright/test';
import {
	readerOriginChirho,
	readerPortChirho
} from './tests-chirho/fixtures-chirho/runtime-chirho';

export default defineConfig({
	webServer: {
		// One polling watcher for the frozen corpus avoids macOS native-watch FD exhaustion.
		env: { CHOKIDAR_USEPOLLING: 'true', CHOKIDAR_INTERVAL: '10000' },
		command: `bun run build && bunx wrangler dev .svelte-kit/cloudflare/_worker.js --port ${readerPortChirho} --env-file ./wrangler-bindings-chirho.env`,
		port: readerPortChirho
	},
	use: { baseURL: readerOriginChirho },
	testDir: 'tests-chirho',
	testMatch: '**/*.e2e.{ts,js}'
});
