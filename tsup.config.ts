import {defineConfig} from 'tsup';

export default defineConfig({
	'bundle': true,
	'entry': ['./src/index.ts'],
	'minify': true,
	'dts': false,
	'outDir': './dist',
	'target': ['node14', 'node16', 'node18'],
	'platform': 'node',
	'format': ['cjs'],
	'tsconfig': './tsconfig.json',
});
