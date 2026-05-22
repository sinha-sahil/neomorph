import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';
import path from 'path';

export default defineConfig({
	plugins: [sveltekit()],
	server: {
		port: 9900
	},
	resolve: {
		alias: {
			'@common': path.resolve('../common')
		}
	}
});
