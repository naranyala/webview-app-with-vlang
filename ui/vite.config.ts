import { svelte } from '@sveltejs/vite-plugin-svelte';
import { defineConfig } from 'vite';
import { viteSingleFile } from 'vite-plugin-singlefile';

export default defineConfig({
	plugins: [
		svelte({ compilerOptions: { runes: true } }),
		viteSingleFile({ useRecommendedBuildConfig: false })
	],
	build: {
		outDir: 'build',
		emptyOutDir: true
	}
});
