import { defineConfig } from 'vite';
import path from 'path';

export default defineConfig({
	root: '.',
	server: {
		port: 3000,
		cors: true
	},
	resolve: {
		alias: {
			'@neomorph/weaver': path.resolve(__dirname, '../build/weaver/1.0.0/index.js')
		}
	}
});
