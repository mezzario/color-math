import {defineConfig} from 'vite';
import {resolve} from 'path';

export default defineConfig({
  logLevel: 'warn',
  build: {
    lib: {
      entry: resolve(__dirname, 'src/index.js'),
      name: 'ColorMath',
      fileName: format => {
        if (format === 'es') {
          return 'index.js';
        }
        if (format === 'cjs') {
          return 'index.cjs';
        }
        if (format === 'umd') {
          return 'color-math.js';
        }
        return `index.${format}.js`;
      },
      formats: ['es', 'cjs', 'umd'],
    },
    rollupOptions: {
      external: ['chroma-js', 'lodash.clonedeepwith'],
      output: {
        globals: {
          'chroma-js': 'chroma',
          'lodash.clonedeepwith': 'cloneDeepWith',
        },
      },
    },
    commonjsOptions: {
      include: [/parser\.js/],
    },
    outDir: 'dist',
    emptyOutDir: true,
  },
  define: {
    'process.env.NODE_ENV': JSON.stringify(
      process.env.NODE_ENV || 'production'
    ),
  },
});
