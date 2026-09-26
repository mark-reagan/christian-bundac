import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import { env, cwd } from 'node:process';

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
	const loadedEnv = loadEnv(mode, cwd(), '');
	const apiUrl = (env.VITE_API_URL || loadedEnv.VITE_API_URL || '').trim();
	const isLoopback =
		/^https?:\/\/(?:localhost|127(?:\.\d{1,3}){3}|\[::1\])(?::\d+)?(?:\/|$)/i.test(
			apiUrl,
		);

	if (mode === 'production' && !apiUrl) {
		throw new Error(
			'Set VITE_API_URL in the production deployment environment before building.',
		);
	}
	if (mode === 'production' && isLoopback) {
		throw new Error(
			'VITE_API_URL must not point to a loopback address in a production build.',
		);
	}

	return {
		plugins: [react()],
		build: {
			outDir: 'dist',
			sourcemap: false,
			rollupOptions: {
				output: {
					manualChunks: {
						vendor: ['react', 'react-dom', 'react-router-dom'],
					},
				},
			},
		},
	};
});
