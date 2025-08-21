import {defineConfig} from 'vite';
import {resolve} from 'path';

// Separate config for generating lib/ (CJS) and es/ (ESM) directories
export default defineConfig(({mode}) => ({
  logLevel: 'warn',
  build: {
    target: 'es2018',
    lib: {
      entry: resolve(__dirname, 'src/index.js'),
      formats: [mode === 'cjs' ? 'cjs' : 'es'],
      fileName: () => {
        return mode === 'cjs' ? 'index.cjs' : 'index.js';
      },
    },
    rollupOptions: {
      external: ['chroma-js', 'lodash.clonedeepwith', 'fs', 'path'],
    },
    commonjsOptions: {
      include: [/parser\.js/],
    },
    outDir: mode === 'cjs' ? 'lib' : 'es',
    emptyOutDir: true,
  },
  define: {
    'process.env.NODE_ENV': JSON.stringify(
      process.env.NODE_ENV || 'production'
    ),
  },
}));
